import { useEffect, useState } from "react";
import { AlertCircle } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { FieldError, FieldLabel } from "../ui/field";
import { DateInput } from "../ui/date-input";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { mdyToIso } from "../../lib/dateFormat";
import { isValidMdy } from "../../data/mockProgramsData";

/** One date the Program save needs, entered explicitly by the user. */
export interface StaffChangeDateRow {
  key: string;
  /** What the date is for, e.g. "Jane Doe — Therapist". */
  description: string;
  kind: "start" | "end";
}

/**
 * Collects the Start / End Dates for the staff changes in a Program save
 * (DLG-01 dialog structure). No date is pre-filled or calculated. Closing
 * any way (Cancel, X, Escape, backdrop) saves nothing; the entered dates and
 * any save error stay available while the dialog is open.
 */
export function ProgramStaffChangeDialog({
  open,
  rows,
  rowErrors,
  saveError,
  saving,
  onSave,
  onCancel,
}: {
  open: boolean;
  rows: StaffChangeDateRow[];
  /** Server-side (store) errors by row key. */
  rowErrors: Record<string, string>;
  saveError: string;
  saving: boolean;
  /** ISO dates by row key. */
  onSave: (dates: Record<string, string>) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [localErrors, setLocalErrors] = useState<
    Record<string, string>
  >({});

  // A new set of rows starts with empty dates.
  const rowsKey = rows.map((r) => r.key).join("|");
  useEffect(() => {
    if (open) {
      setDraft({});
      setLocalErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rowsKey]);

  const handleSave = () => {
    const errs: Record<string, string> = {};
    const dates: Record<string, string> = {};
    for (const r of rows) {
      const v = (draft[r.key] ?? "").trim();
      if (!v)
        errs[r.key] =
          r.kind === "start"
            ? "Start Date is required."
            : "End Date is required.";
      else if (!isValidMdy(v))
        errs[r.key] = "Enter a valid date (MM/DD/YYYY).";
      else dates[r.key] = mdyToIso(v);
    }
    setLocalErrors(errs);
    if (Object.keys(errs).length) return;
    onSave(dates);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && !saving && onCancel()}
    >
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Staff Assignment Dates</DialogTitle>
          <DialogDescription>
            Enter the date each change takes effect. Earlier
            assignments are kept in Staff History; ending one only
            records its End Date.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {saveError && (
            <Alert variant="error" role="alert">
              <AlertCircle aria-hidden="true" />
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}
          {rows.map((r) => {
            const id = `psc-${r.key}`;
            const error = localErrors[r.key] ?? rowErrors[r.key];
            return (
              <div key={r.key}>
                <FieldLabel htmlFor={id} error={!!error}>
                  {`${r.kind === "start" ? "START DATE" : "END DATE"} — ${r.description}`}
                </FieldLabel>
                <DateInput
                  id={id}
                  value={draft[r.key] ?? ""}
                  onChange={(v) => {
                    setDraft((d) => ({ ...d, [r.key]: v }));
                    setLocalErrors((e) => ({
                      ...e,
                      [r.key]: "",
                    }));
                  }}
                  aria-invalid={!!error}
                />
                {error && (
                  <div role="alert">
                    <FieldError id={`${id}-error`}>
                      {error}
                    </FieldError>
                  </div>
                )}
              </div>
            );
          })}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

