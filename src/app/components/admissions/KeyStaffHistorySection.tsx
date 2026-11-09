import { Pencil, Plus } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { DateInput } from "../ui/date-input";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { SearchableSelect } from "../ui/searchable-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { isValidMdy } from "../../data/transitionSummaryStore";
import type { TransitionSummaryStaff } from "../../data/mockTransitionSummary";
import {
  constituentLabel,
  contactConstituentOptions,
} from "../../data/transitionSummaryDetailsSources";

// External Transition Summary → Key Staff History (US 20103). Controlled
// by the External editor: rows and the open Add/Modify form are draft
// state; nothing here writes. Rows are tracked by a draft key, so legacy
// rows (no id) keep their position and content until explicitly modified;
// a modified or new row gets a stable id. Role stays free text (no
// approved role list exists). The staff member is chosen from verified
// constituent records and stored by Constituent ID plus the name as saved.

/** A history row plus a draft-only key (never saved). */
export type StaffDraftRow = TransitionSummaryStaff & {
  _key: string;
};

export interface StaffFormState {
  mode: "add" | "modify";
  key: string;
  initial: TransitionSummaryStaff;
  value: TransitionSummaryStaff;
  errors: {
    staff?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
  };
}

const newStaffRowId = () =>
  `KS-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export const staffFormDirty = (f: StaffFormState | null) =>
  !!f && JSON.stringify(f.value) !== JSON.stringify(f.initial);

const isAvailable = (id: number | undefined) =>
  id !== undefined &&
  contactConstituentOptions().some((o) => o.id === id);

function staffLabel(r: TransitionSummaryStaff): string {
  if (
    r.constituentId !== undefined &&
    !isAvailable(r.constituentId)
  )
    return `${r.staffMember || "Staff member"} (no longer available)`;
  return r.staffMember;
}

function FieldError({ id, msg }: { id: string; msg?: string }) {
  return msg ? (
    <p
      id={id}
      role="alert"
      className="slds-text-3 text-destructive"
    >
      {msg}
    </p>
  ) : null;
}

export function KeyStaffHistorySection({
  rows,
  editing,
  form,
  onFormChange,
  onApply,
}: {
  rows: StaffDraftRow[];
  editing: boolean;
  form: StaffFormState | null;
  onFormChange: (f: StaffFormState | null) => void;
  /** Adds or replaces (by draft key) a validated row. */
  onApply: (key: string, row: TransitionSummaryStaff) => void;
}) {
  const v = form?.value;
  const e = form?.errors ?? {};
  const set = (patch: Partial<TransitionSummaryStaff>) =>
    form &&
    onFormChange({
      ...form,
      value: { ...form.value, ...patch },
      errors: {},
    });

  const openAdd = () => {
    const initial: TransitionSummaryStaff = {
      role: "",
      staffMember: "",
      startDate: "",
      endDate: "",
    };
    onFormChange({
      mode: "add",
      key: `new-${newStaffRowId()}`,
      initial,
      value: initial,
      errors: {},
    });
  };
  const openModify = (r: StaffDraftRow) => {
    const { _key, ...row } = r;
    onFormChange({
      mode: "modify",
      key: _key,
      initial: row,
      value: row,
      errors: {},
    });
  };

  const apply = () => {
    if (!form) return;
    const val = form.value;
    const errors: StaffFormState["errors"] = {};
    const linked = val.constituentId !== undefined;
    if (!linked && !val.staffMember.trim())
      errors.staff = "Select a staff member.";
    if (
      linked &&
      !isAvailable(val.constituentId) &&
      val.constituentId !== form.initial.constituentId
    )
      errors.staff = "Select an available staff member.";
    if (val.startDate && !isValidMdy(val.startDate))
      errors.startDate =
        "Enter a complete, valid date (MM/DD/YYYY).";
    if (val.endDate && !isValidMdy(val.endDate))
      errors.endDate =
        "Enter a complete, valid date (MM/DD/YYYY).";
    if (Object.keys(errors).length) {
      onFormChange({ ...form, errors });
      return;
    }
    onApply(form.key, {
      ...val,
      role: val.role.trim(),
      // Explicit save path for identity: new or modified rows get an id.
      id: val.id ?? newStaffRowId(),
    });
    onFormChange(null);
  };

  const options = contactConstituentOptions().map((o) => ({
    value: String(o.id),
    label: o.label,
  }));
  const selectorOptions =
    v?.constituentId !== undefined &&
    !isAvailable(v.constituentId)
      ? [
          {
            value: String(v.constituentId),
            label: `${v.staffMember || "Staff member"} (no longer available)`,
          },
          ...options,
        ]
      : options;

  return (
    <Card variant="container">
      <CardHeader size="sm">
        <CardTitle size="sm" id="ets-staff-heading">
          Key Staff History
        </CardTitle>
        {editing && (
          <div>
            <Button
              type="button"
              variant="outline-primary"
              size="sm"
              onClick={openAdd}
            >
              <Plus />
              Add Staff
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent size="sm" className="pt-0">
        <Card variant="container">
          <Table aria-labelledby="ets-staff-heading">
            <TableHeader>
              <TableRow hoverable={false}>
                {[
                  "Role",
                  "Staff Member",
                  "Start Date",
                  "End Date",
                ].map((c) => (
                  <TableHead
                    key={c}
                    variant="slds"
                    className="whitespace-normal"
                  >
                    {c}
                  </TableHead>
                ))}
                {editing && (
                  <TableHead variant="slds">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow hoverable={false}>
                  <TableCell
                    tone="muted"
                    colSpan={editing ? 5 : 4}
                  >
                    No entries recorded.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r._key}>
                  <TableCell wrap>{r.role || "—"}</TableCell>
                  <TableCell wrap>
                    {staffLabel(r) || "—"}
                  </TableCell>
                  <TableCell>{r.startDate || "—"}</TableCell>
                  <TableCell>{r.endDate || "—"}</TableCell>
                  {editing && (
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost-primary"
                        size="icon-xs"
                        aria-label={`Modify staff history ${r.role} ${staffLabel(r)}`}
                        onClick={() => openModify(r)}
                      >
                        <Pencil />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </CardContent>

      <Dialog
        open={!!form && editing}
        onOpenChange={(o) => !o && onFormChange(null)}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {form?.mode === "modify"
                ? "Modify Staff History"
                : "Add Staff History"}
            </DialogTitle>
            <DialogDescription>
              Saved with this report when you save it. This
              doesn't change the staff member's record.
            </DialogDescription>
          </DialogHeader>
          {v && (
            <DialogBody className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="ets-staff-member"
                  className="slds-form-label"
                >
                  Staff Member
                </Label>
                {v.constituentId === undefined &&
                form?.mode === "modify" &&
                v.staffMember ? (
                  // Legacy row: name only, never auto-linked by name.
                  <p className="slds-text-4 text-[var(--slds-g-color-text-default)]">
                    {v.staffMember}{" "}
                    <span className="text-[var(--slds-g-color-text-weak)]">
                      (not linked to a constituent record)
                    </span>
                  </p>
                ) : null}
                <SearchableSelect
                  id="ets-staff-member"
                  value={
                    v.constituentId === undefined
                      ? ""
                      : String(v.constituentId)
                  }
                  onValueChange={(raw) => {
                    const id = Number(raw);
                    set({
                      constituentId: id,
                      staffMember: constituentLabel(id) ?? "",
                    });
                  }}
                  options={selectorOptions}
                  placeholder={
                    v.constituentId === undefined &&
                    v.staffMember
                      ? "Link to a constituent record"
                      : "Select a staff member"
                  }
                  searchPlaceholder="Search constituents…"
                  aria-invalid={e.staff ? true : undefined}
                  aria-describedby={
                    e.staff
                      ? "ets-staff-member-error"
                      : undefined
                  }
                />
                <FieldError
                  id="ets-staff-member-error"
                  msg={e.staff}
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="ets-staff-role"
                  className="slds-form-label"
                >
                  Role
                </Label>
                <Input
                  id="ets-staff-role"
                  value={v.role}
                  onChange={(ev) =>
                    set({ role: ev.target.value })
                  }
                  aria-invalid={e.role ? true : undefined}
                  aria-describedby={
                    e.role ? "ets-staff-role-error" : undefined
                  }
                />
                <FieldError
                  id="ets-staff-role-error"
                  msg={e.role}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(
                  [
                    ["startDate", "Start Date"],
                    ["endDate", "End Date"],
                  ] as const
                ).map(([k, label]) => (
                  <div key={k} className="space-y-1.5">
                    <Label
                      htmlFor={`ets-staff-${k}`}
                      className="slds-form-label"
                    >
                      {label}
                    </Label>
                    <DateInput
                      id={`ets-staff-${k}`}
                      value={v[k]}
                      onChange={(d) => set({ [k]: d })}
                      aria-invalid={e[k] ? true : undefined}
                      aria-describedby={
                        e[k]
                          ? `ets-staff-${k}-error`
                          : undefined
                      }
                    />
                    <FieldError
                      id={`ets-staff-${k}-error`}
                      msg={e[k]}
                    />
                  </div>
                ))}
              </div>
            </DialogBody>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onFormChange(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={apply}>
              {form?.mode === "modify"
                ? "Apply Changes"
                : "Add Staff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}