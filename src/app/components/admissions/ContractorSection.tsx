import { useRef, useState } from "react";
import {
  AlertCircle,
  BriefcaseMedical,
  Pencil,
  Plus,
} from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";
import { Button } from "../ui/button";
import { FieldError, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { DateInput } from "../ui/date-input";
import { EmptyState } from "../ui/empty-state";
import { Alert, AlertDescription } from "../ui/alert";
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
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import {
  CONTRACTOR_SUBTYPE_OPTIONS,
  ContractorDetails,
  ContractorDetailsErrors,
  ContractorSubtype,
  saveContractorDetails,
  useContractorDetails,
  validateContractorDetails,
} from "../../data/contractorDetailsStore";

// Radix Select forbids "" as an item value; this sentinel maps to "".
const NONE = "__none__";

/** Dialog draft: dates are kept as typed (MM/DD/YYYY) until Save. */
interface Draft {
  subtype: ContractorSubtype | "";
  startDate: string;
  endDate: string;
  notes: string;
}

const EMPTY_DRAFT: Draft = {
  subtype: "",
  startDate: "",
  endDate: "",
  notes: "",
};

const FIELD_ORDER: (keyof ContractorDetailsErrors)[] = [
  "subtype",
  "startDate",
  "endDate",
  "notes",
];

const placeholder = (
  <span style={{ color: "var(--slds-g-color-text-weak)" }}>
    —
  </span>
);

/**
 * Contractor (20119) — Constituent Details subsection for Individual
 * Contractors. One current record per constituent; its own dialog Save
 * persists it (no page-level Save involved).
 */
export function ContractorSection({
  constituentId,
}: {
  constituentId: string;
}) {
  const saved = useContractorDetails(constituentId);
  const ids = {
    subtype: `contractor-subtype-${constituentId}`,
    startDate: `contractor-start-${constituentId}`,
    endDate: `contractor-end-${constituentId}`,
    notes: `contractor-notes-${constituentId}`,
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<ContractorDetailsErrors>(
    {},
  );
  const [saveError, setSaveError] = useState("");
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const open = () => {
    setDraft(
      saved
        ? {
            subtype: saved.subtype,
            startDate: isoToMdy(saved.startDate),
            endDate: isoToMdy(saved.endDate),
            notes: saved.notes,
          }
        : EMPTY_DRAFT,
    );
    setErrors({});
    setSaveError("");
    setDialogOpen(true);
  };

  const update = <K extends keyof Draft>(
    key: K,
    value: Draft[K],
  ) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({
      ...e,
      [key]: undefined,
      // Either date changing can resolve the range error.
      ...(key === "startDate" ? { endDate: undefined } : {}),
    }));
    setSaveError("");
  };

  const focusFirstInvalid = (errs: ContractorDetailsErrors) => {
    const first = FIELD_ORDER.find((k) => errs[k]);
    if (first)
      requestAnimationFrame(() =>
        document.getElementById(ids[first])?.focus(),
      );
  };

  const handleSave = () => {
    const details: ContractorDetails = {
      subtype: draft.subtype,
      startDate: mdyToIso(draft.startDate.trim()),
      endDate: mdyToIso(draft.endDate.trim()),
      notes: draft.notes,
    };
    const formErrors = validateContractorDetails(details);
    if (Object.keys(formErrors).length) {
      setErrors(formErrors);
      focusFirstInvalid(formErrors);
      return;
    }
    const result = saveContractorDetails(
      constituentId,
      details,
    );
    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      setSaveError(result.error);
      if (result.fieldErrors)
        focusFirstInvalid(result.fieldErrors);
      return;
    }
    toast.success(
      saved
        ? "Contractor details updated."
        : "Contractor details added.",
    );
    setDialogOpen(false);
  };

  const errorId = (k: keyof ContractorDetailsErrors) =>
    `${ids[k]}-error`;
  const fieldError = (k: keyof ContractorDetailsErrors) =>
    errors[k] ? (
      <div role="alert">
        <FieldError id={errorId(k)}>{errors[k]}</FieldError>
      </div>
    ) : null;

  return (
    <section
      aria-labelledby={`contractor-heading-${constituentId}`}
      className="overflow-hidden"
      style={{
        border: "1px solid var(--slds-g-color-border-base-1)",
        borderRadius: "var(--slds-c-card-radius-border)",
        backgroundColor: "var(--slds-g-color-background-base)",
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between gap-4"
        style={{
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
          backgroundColor: "var(--slds-g-color-background-alt)",
        }}
      >
        <h3
          id={`contractor-heading-${constituentId}`}
          className="text-[13px] font-semibold"
          style={{ color: "var(--slds-g-color-text-default)" }}
        >
          Contractor
        </h3>
        {!saved && (
          <Button
            ref={addButtonRef}
            variant="outline-primary"
            size="sm"
            onClick={open}
          >
            <Plus aria-hidden="true" />
            Add Contractor Details
          </Button>
        )}
      </div>

      <div className="p-4 space-y-6">
        {!saved ? (
          <EmptyState
            icon={BriefcaseMedical}
            title="No Contractor details"
            description="Add a Contractor Subtype, association dates and notes for this constituent."
            className="py-6"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead variant="slds">
                      Contractor Subtype
                    </TableHead>
                    <TableHead variant="slds">
                      Start Date
                    </TableHead>
                    <TableHead variant="slds">
                      End Date
                    </TableHead>
                    <TableHead
                      variant="slds"
                      className="text-right"
                    >
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell wrap className="px-4">
                      {saved.subtype || placeholder}
                    </TableCell>
                    <TableCell className="px-4">
                      {saved.startDate
                        ? isoToMdy(saved.startDate)
                        : placeholder}
                    </TableCell>
                    <TableCell className="px-4">
                      {saved.endDate
                        ? isoToMdy(saved.endDate)
                        : placeholder}
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <Button
                        ref={editButtonRef}
                        variant="ghost-primary"
                        size="icon-xs"
                        aria-label="Edit Contractor details"
                        onClick={open}
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="space-y-1.5">
              <p
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                CONTRACTOR NOTES
              </p>
              <p
                className="slds-text-4 whitespace-pre-wrap break-words"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {saved.notes.trim() ? saved.notes : placeholder}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Contractor details. Closing any way (Cancel, X, Escape,
          backdrop) discards the draft; only Save writes. */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          size="md"
          onCloseAutoFocus={(e) => {
            // Add is replaced by Edit after the first save: focus Edit.
            const target =
              editButtonRef.current ?? addButtonRef.current;
            if (target) {
              e.preventDefault();
              target.focus();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {saved
                ? "Edit Contractor Details"
                : "Add Contractor Details"}
            </DialogTitle>
            <DialogDescription>
              The Contractor Subtype is shown with the
              Contractor role. Dates are recorded for reference
              only.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {saveError && (
              <Alert variant="error" role="alert">
                <AlertCircle aria-hidden="true" />
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            )}
            <div>
              <FieldLabel
                htmlFor={ids.subtype}
                error={!!errors.subtype}
              >
                CONTRACTOR SUBTYPE
              </FieldLabel>
              <Select
                // "" shows the placeholder; choosing None clears back to it.
                value={draft.subtype}
                onValueChange={(v) =>
                  update(
                    "subtype",
                    v === NONE ? "" : (v as ContractorSubtype),
                  )
                }
              >
                <SelectTrigger
                  id={ids.subtype}
                  surface="base"
                  className="aria-invalid:border-[#A82031] aria-invalid:ring-[#A82031]/20"
                  aria-invalid={!!errors.subtype}
                  aria-describedby={
                    errors.subtype
                      ? errorId("subtype")
                      : undefined
                  }
                >
                  <SelectValue placeholder="Select Contractor Subtype" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {CONTRACTOR_SUBTYPE_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError("subtype")}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel
                  htmlFor={ids.startDate}
                  error={!!errors.startDate}
                >
                  START DATE
                </FieldLabel>
                <DateInput
                  id={ids.startDate}
                  className="hover:border-[#b0adab] aria-invalid:border-[#A82031] aria-invalid:ring-[#A82031]/20"
                  value={draft.startDate}
                  onChange={(v) => update("startDate", v)}
                  aria-invalid={!!errors.startDate}
                  aria-describedby={
                    errors.startDate
                      ? errorId("startDate")
                      : undefined
                  }
                />
                {fieldError("startDate")}
              </div>
              <div>
                <FieldLabel
                  htmlFor={ids.endDate}
                  error={!!errors.endDate}
                >
                  END DATE
                </FieldLabel>
                <DateInput
                  id={ids.endDate}
                  className="hover:border-[#b0adab] aria-invalid:border-[#A82031] aria-invalid:ring-[#A82031]/20"
                  value={draft.endDate}
                  onChange={(v) => update("endDate", v)}
                  aria-invalid={!!errors.endDate}
                  aria-describedby={
                    errors.endDate
                      ? errorId("endDate")
                      : undefined
                  }
                />
                {fieldError("endDate")}
              </div>
            </div>
            <div>
              <FieldLabel
                htmlFor={ids.notes}
                error={!!errors.notes}
              >
                CONTRACTOR NOTES
              </FieldLabel>
              <Textarea
                id={ids.notes}
                size="md"
                rows={5}
                className="w-full min-h-28"
                aria-invalid={!!errors.notes}
                value={draft.notes}
                onChange={(e) =>
                  update("notes", e.target.value)
                }
                placeholder="Enter Contractor notes"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}