// Education and Vocation → Credentials.
//
// Two modes, chosen by the optional `owner` prop:
//  - No owner (legacy callers): records live in component state, with the
//    existing Create / Edit / Delete actions.
//  - With owner (Contractor, US 20097): records are read from and written to
//    the owner-keyed constituentEducationVocationStore, so they survive tab
//    switches and are shared with the Specialties tab. Create / Edit / View;
//    no Delete (the ticket defines no deletion rules for owned credentials).
// Create / Edit / View use the DLG-01 dialog structure. Unsaved edits live
// only in the draft; Cancel / Close discard them.

import { useState } from "react";
import { Plus, Pencil, Trash2, Eye } from "@/app/lib/lucide-icons";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DateInput } from "../ui/date-input";
import { SearchableSelect } from "../ui/searchable-select";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  FieldError,
  focusFirstError,
} from "../ff-mentee/IntakeQuestionnaire";
import { parseCalendarDate } from "../../data/ffMenteeIntake";
import {
  allocateEducationVocationId,
  credentialDisplayName,
  deleteOwnerCredential,
  saveOwnerCredential,
  useOwnerEducationVocation,
  type OwnedCredential,
} from "../../data/constituentEducationVocationStore";

const CREDENTIAL_OPTIONS = [
  "OSHA Construction Certification (10 Hour)",
  "OSHA Safety Certification (10 Hour)",
  "PERC Card",
  "CompTIA A+ Certification",
  "CPR Certification",
  "Certified Nursing Assistant",
  "Certified MRI Technologist",
  "NIMS Certification",
  "CPI",
  "Drivers License",
  "State ID",
  "Other",
];
const CREDENTIAL_SEARCH_OPTIONS = CREDENTIAL_OPTIONS.map(
  (o) => ({
    value: o,
    label: o,
  }),
);
const CREDENTIAL_TYPE_OPTIONS = [
  "Degree",
  "Certification",
  "Identification",
];

type Draft = Omit<OwnedCredential, "id">;
const EMPTY_DRAFT: Draft = {
  credential: "",
  credentialOther: "",
  credentialType: "",
  issuingOrganization: "",
  issueDate: "",
  expirationDate: "",
};
type DraftErrors = Partial<Record<keyof Draft, string>>;

/** Comparable day number for a valid MM/DD/YYYY date, else null. */
function dayValue(mdy: string): number | null {
  const p = parseCalendarDate(mdy);
  return p ? p[0] * 10000 + p[1] * 100 + p[2] : null; // [yyyy, mm, dd]
}

export function LeadDetailCredentialsTab({
  owner,
  allowDelete = false,
  saveAndStay = false,
}: {
  /** Constituent that owns the credentials. Omit for legacy local state. */
  owner?: { id: string; name: string };
  /** Owner mode only (Instructor, US 20096): Delete with confirmation. */
  allowDelete?: boolean;
  /** Owner mode only (Instructor, US 20096): "Save" keeps the form open in
   *  Edit mode for the saved record, alongside "Save & Close". */
  saveAndStay?: boolean;
} = {}) {
  const ownerRecords = useOwnerEducationVocation(
    owner?.id ?? "",
  );
  const [localCredentials, setLocalCredentials] = useState<
    OwnedCredential[]
  >([]);
  const credentials = owner
    ? ownerRecords.credentials
    : localCredentials;

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [editingId, setEditingId] = useState<string | null>(
    null,
  );
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<DraftErrors>({});
  const isView = mode === "view";
  const [deleteTarget, setDeleteTarget] =
    useState<OwnedCredential | null>(null);
  // Specialties linked to the credential pending deletion (owner mode).
  const linkedSpecialties = deleteTarget
    ? ownerRecords.specialties.filter((s) =>
        s.credentials.some(
          (l) => l.credentialId === deleteTarget.id,
        ),
      ).length
    : 0;

  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setOpen(true);
  };
  // Row actions receive the clicked record itself — no reliance on a
  // pending state update to know which row was chosen.
  const openRecord = (
    rec: OwnedCredential,
    nextMode: "edit" | "view",
  ) => {
    const { id, ...rest } = rec;
    setMode(nextMode);
    setEditingId(id);
    setDraft({ ...EMPTY_DRAFT, ...rest });
    setErrors({});
    setOpen(true);
  };

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const pickCredential = (v: string) => {
    set("credential", v);
    if (v !== "Other") set("credentialOther", "");
  };

  const save = (close = true) => {
    const e: DraftErrors = {};
    if (!draft.credential)
      e.credential = "Credential is required.";
    if (
      draft.credential === "Other" &&
      !draft.credentialOther.trim()
    )
      e.credentialOther = "Other is required.";
    if (!draft.credentialType)
      e.credentialType = "Credential Type is required.";
    const issue = dayValue(draft.issueDate);
    const expiry = dayValue(draft.expirationDate);
    if (draft.issueDate && issue === null)
      e.issueDate = "Enter a valid date (MM/DD/YYYY).";
    if (draft.expirationDate && expiry === null)
      e.expirationDate = "Enter a valid date (MM/DD/YYYY).";
    if (issue !== null && expiry !== null && expiry < issue)
      e.expirationDate =
        "Expiration Date must be on or after the Issue Date.";
    setErrors(e);
    if (Object.keys(e).length) {
      focusFirstError(
        Object.fromEntries(
          Object.entries(e).map(([k, v]) => [
            `cred-${k}`,
            v ?? "",
          ]),
        ),
      );
      return;
    }
    const record: OwnedCredential = {
      id: editingId ?? allocateEducationVocationId("CRED"),
      ...draft,
      credentialOther:
        draft.credential === "Other"
          ? draft.credentialOther.trim()
          : "",
      issuingOrganization: draft.issuingOrganization.trim(),
    };
    if (owner) saveOwnerCredential(owner.id, record);
    else
      setLocalCredentials((prev) =>
        editingId
          ? prev.map((r) => (r.id === editingId ? record : r))
          : [...prev, record],
      );
    toast.success(
      editingId
        ? "Credential updated successfully."
        : "Credential created successfully.",
    );
    if (close) setOpen(false);
    else {
      // Stay open on the saved record, so a repeated Save updates it.
      setEditingId(record.id);
      setMode("edit");
      const { id: _savedId, ...saved } = record;
      setDraft(saved);
    }
  };

  const confirmDelete = () => {
    if (!owner || !deleteTarget) return;
    deleteOwnerCredential(owner.id, deleteTarget.id);
    toast.success("Credential deleted successfully.");
    setDeleteTarget(null);
  };

  const deleteLocalCredential = (id: string) =>
    setLocalCredentials((prev) =>
      prev.filter((r) => r.id !== id),
    );

  const fieldErr = (k: keyof Draft) => ({
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k]
      ? `cred-${k}-error`
      : undefined,
  });

  const columns = [
    "Credential",
    owner ? "Type" : "Credential Type",
    "Issuing Organization",
    "Issue Date",
    "Expiration Date",
  ];

  return (
    <div className="space-y-6 w-full">
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <h2
            className="text-[15px] font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Credentials
          </h2>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            Create New Credential
          </Button>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((col) => (
                  <TableHead key={col} variant="slds">
                    {col}
                  </TableHead>
                ))}
                <TableHead variant="slds">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {credentials.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={6}
                    className="px-4 py-10 text-center text-[13px]"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    No credentials found. Click{" "}
                    <strong>Create New Credential</strong> to
                    add one.
                  </TableCell>
                </TableRow>
              ) : (
                credentials.map((row) => {
                  const name = credentialDisplayName(row);
                  return (
                    <TableRow key={row.id}>
                      <TableCell wrap className="px-4">
                        {name}
                      </TableCell>
                      <TableCell className="px-4">
                        {row.credentialType}
                      </TableCell>
                      <TableCell wrap className="px-4">
                        {row.issuingOrganization || "—"}
                      </TableCell>
                      <TableCell className="px-4">
                        {row.issueDate || "—"}
                      </TableCell>
                      <TableCell className="px-4">
                        {row.expirationDate || "—"}
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-1">
                          {owner && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() =>
                                openRecord(row, "view")
                              }
                              aria-label={`View ${name}`}
                              title="View"
                            >
                              <Eye
                                className="h-3.5 w-3.5"
                                style={{ color: "#0176d3" }}
                              />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() =>
                              openRecord(row, "edit")
                            }
                            aria-label={`Edit ${name}`}
                            title="Edit"
                          >
                            <Pencil
                              className="h-3.5 w-3.5"
                              style={{ color: "#0176d3" }}
                            />
                          </Button>
                          {owner && allowDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() =>
                                setDeleteTarget(row)
                              }
                              aria-label={`Delete ${name}`}
                              title="Delete"
                            >
                              <Trash2
                                className="h-3.5 w-3.5"
                                style={{ color: "#c23934" }}
                              />
                            </Button>
                          )}
                          {!owner && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() =>
                                deleteLocalCredential(row.id)
                              }
                              aria-label={`Delete ${name}`}
                              title="Delete"
                            >
                              <Trash2
                                className="h-3.5 w-3.5"
                                style={{ color: "#c23934" }}
                              />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create / Edit / View Credential — DLG-01 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {isView
                ? "View Credential"
                : mode === "edit"
                  ? "Edit Credential"
                  : "Create New Credential"}
            </DialogTitle>
            <DialogDescription>
              {isView
                ? "Viewing credential details in read-only mode"
                : "Credential"}
              {owner ? ` for ${owner.name}.` : "."}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div>
              <label
                htmlFor="cred-credential"
                className="slds-form-label block mb-1.5"
              >
                Credential{" "}
                <span className="text-red-600">*</span>
              </label>
              {owner ? (
                <Select
                  value={draft.credential}
                  onValueChange={pickCredential}
                  disabled={isView}
                >
                  <SelectTrigger
                    id="cred-credential"
                    surface="base"
                    aria-required
                    {...fieldErr("credential")}
                  >
                    <SelectValue placeholder="Select a credential" />
                  </SelectTrigger>
                  <SelectContent>
                    {CREDENTIAL_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                // Existing callers keep the searchable credential picker.
                <SearchableSelect
                  id="cred-credential"
                  value={draft.credential}
                  onValueChange={pickCredential}
                  options={CREDENTIAL_SEARCH_OPTIONS}
                  placeholder="Search or select a credential…"
                  searchPlaceholder="Search credentials…"
                  emptyMessage="No credential found."
                  disabled={isView}
                  {...fieldErr("credential")}
                />
              )}
              <FieldError
                id="cred-credential"
                msg={errors.credential}
              />
            </div>

            {draft.credential === "Other" && (
              <div>
                <label
                  htmlFor="cred-credentialOther"
                  className="slds-form-label block mb-1.5"
                >
                  Other <span className="text-red-600">*</span>
                </label>
                <Input
                  id="cred-credentialOther"
                  surface="base"
                  aria-required
                  className="h-9 text-[13px]"
                  placeholder="Please specify…"
                  value={draft.credentialOther}
                  readOnly={isView}
                  onChange={(e) =>
                    set("credentialOther", e.target.value)
                  }
                  {...fieldErr("credentialOther")}
                />
                <FieldError
                  id="cred-credentialOther"
                  msg={errors.credentialOther}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="cred-credentialType"
                className="slds-form-label block mb-1.5"
              >
                Credential Type{" "}
                <span className="text-red-600">*</span>
              </label>
              <Select
                value={draft.credentialType}
                onValueChange={(v) => set("credentialType", v)}
                disabled={isView}
              >
                <SelectTrigger
                  id="cred-credentialType"
                  surface="base"
                  aria-required
                  {...fieldErr("credentialType")}
                >
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  {CREDENTIAL_TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError
                id="cred-credentialType"
                msg={errors.credentialType}
              />
            </div>

            <div>
              <label
                htmlFor="cred-issuingOrganization"
                className="slds-form-label block mb-1.5"
              >
                Issuing Organization
              </label>
              <Input
                id="cred-issuingOrganization"
                surface="base"
                className="h-9 text-[13px]"
                placeholder="Enter issuing organization…"
                value={draft.issuingOrganization}
                readOnly={isView}
                onChange={(e) =>
                  set("issuingOrganization", e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  ["issueDate", "Issue Date"],
                  ["expirationDate", "Expiration Date"],
                ] as const
              ).map(([k, label]) => (
                <div key={k}>
                  <label
                    htmlFor={`cred-${k}`}
                    className="slds-form-label block mb-1.5"
                  >
                    {label}
                  </label>
                  <DateInput
                    id={`cred-${k}`}
                    value={draft[k]}
                    onChange={(v) => set(k, v)}
                    disabled={isView}
                    {...fieldErr(k)}
                  />
                  <FieldError
                    id={`cred-${k}`}
                    msg={errors[k]}
                  />
                </div>
              ))}
            </div>
          </DialogBody>
          <DialogFooter>
            {isView ? (
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                {owner && saveAndStay ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => save(false)}
                    >
                      Save
                    </Button>
                    <Button onClick={() => save(true)}>
                      Save &amp; Close
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => save(true)}>
                    {mode === "edit"
                      ? "Save Changes"
                      : "Create Credential"}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Credential
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {deleteTarget
                  ? credentialDisplayName(deleteTarget)
                  : ""}
              </strong>
              ?
              {linkedSpecialties > 0 &&
                ` It supports ${linkedSpecialties} specialt${linkedSpecialties === 1 ? "y" : "ies"}; those associations will show as an unavailable credential.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}