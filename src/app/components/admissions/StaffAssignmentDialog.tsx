import { useEffect, useState } from "react";
import { AlertCircle } from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";
import { Button } from "../ui/button";
import { FieldError, FieldLabel } from "../ui/field";
import { DateInput } from "../ui/date-input";
import { Alert, AlertDescription } from "../ui/alert";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { getPrograms } from "../../data/mockProgramsData";
import {
  MSG_DUPLICATE,
  MSG_NOT_PERMITTED,
  addProgramStaffAssignment,
  canManageProgramStaffAssignments,
  findDuplicateAssignment,
  validateProgramStaffAssignment,
  correctProgramStaffAssignment,
  getProgramStaffAssignments,
  isRecognizedProgramStaffTitle,
  type AssignmentFieldErrors,
  type ProgramStaffAssignment,
  type ProgramStaffAssignmentWrite,
} from "../../data/programStaffAssignmentStore";
import {
  buildAssignmentPatch,
  buildNewAssignment,
  draftFromAssignment,
  emptyAssignmentDraft,
  titleChoices,
  type AssignmentDraft,
} from "../../data/programStaffAssignmentForm";

export type AssignmentDialogMode =
  | { kind: "add" }
  | { kind: "edit"; assignment: ProgramStaffAssignment };

/** Where the dialog is opened from. */
export type AssignmentDialogContext =
  /** A staff member's Constituent Roles: staff fixed (shown disabled), Program chosen. */
  | {
      kind: "profile";
      constituentId: number;
      staffOptions: { id: number; label: string }[];
      staffName: (id: number) => string;
    }
  /** A saved Program's Staff tab: Program fixed on Add, staff chosen. */
  | {
      kind: "program";
      programId: number;
      staffOptions: { id: number; label: string }[];
      staffName: (id: number) => string;
    }
  /** A Program still being created: nothing is stored. Save hands the
   *  validated row to `onSaveDraft` (the Program's own Save writes it with
   *  the new Program ID). Rows carry programId 0 until then. */
  | {
      kind: "draft";
      /** The Program Name currently typed on Program Details. */
      programName: string;
      /** The other draft rows, for the duplicate check. */
      drafts: ProgramStaffAssignment[];
      staffOptions: { id: number; label: string }[];
      staffName: (id: number) => string;
      onSaveDraft: (row: ProgramStaffAssignment) => void;
    };

/** Placeholder Program ID of draft rows (the real ID exists only after the
 *  Program is saved). */
export const DRAFT_PROGRAM_ID = 0;

/**
 * Add / Edit dialog for one MHBG Staff title assignment (US 20127), used by
 * both the Constituent Profile and the Program's Staff tab so validation,
 * title choices and save behaviour are identical. Saves go straight to the
 * shared store (addProgramStaffAssignment / correctProgramStaffAssignment);
 * closing any way other than a successful Save discards the draft.
 */
export function StaffAssignmentDialog({
  mode,
  context,
  idPrefix,
  onClose,
  getReturnFocus,
}: {
  /** null = closed. A new object each time it is opened. */
  mode: AssignmentDialogMode | null;
  context: AssignmentDialogContext;
  idPrefix: string;
  onClose: () => void;
  getReturnFocus: () => HTMLElement | null;
}) {
  const programs = [...getPrograms()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const [draft, setDraft] = useState<AssignmentDraft>(
    emptyAssignmentDraft,
  );
  const [staffId, setStaffId] = useState("");
  const [errors, setErrors] = useState<
    AssignmentFieldErrors & { staff?: string }
  >({});
  const [saveError, setSaveError] = useState("");

  // A fresh draft every time the dialog opens: blank for Add, the latest
  // saved record for Edit.
  useEffect(() => {
    if (!mode) return;
    setDraft(
      mode.kind === "edit"
        ? draftFromAssignment(mode.assignment)
        : {
            ...emptyAssignmentDraft(),
            programId:
              context.kind === "program"
                ? String(context.programId)
                : context.kind === "draft"
                  ? String(DRAFT_PROGRAM_ID)
                  : "",
          },
    );
    setStaffId(
      context.kind === "profile" ? String(context.constituentId) : "",
    );
    setErrors({});
    setSaveError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const update = <K extends keyof AssignmentDraft>(
    k: K,
    v: AssignmentDraft[K],
  ) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
    setSaveError("");
  };

  const editing = mode?.kind === "edit" ? mode.assignment : undefined;
  const titles = titleChoices(editing);
  // On a Program's Staff tab the Program is fixed for Add and Edit alike.
  const programFixed =
    (context.kind === "program" || context.kind === "draft") &&
    mode !== null;

  const handleSave = () => {
    if (!mode) return;
    // The same edit gate that hides the buttons, enforced here too (a dialog
    // may already have been open when permission was lost).
    if (!canManageProgramStaffAssignments()) {
      setSaveError(MSG_NOT_PERMITTED);
      return;
    }
    if (context.kind === "draft") {
      saveDraft(context);
      return;
    }
    let result: ProgramStaffAssignmentWrite;
    if (mode.kind === "add") {
      const cid = Number(staffId);
      const built = buildNewAssignment(cid, draft);
      const staffError =
        !staffId
          ? "Select an MHBG Staff member."
          : undefined;
      if (!built.ok || staffError) {
        setErrors({
          ...(built.ok ? {} : built.fieldErrors),
          staff: staffError,
        });
        setSaveError("Fix the highlighted fields.");
        return;
      }
      result = addProgramStaffAssignment(built.value);
    } else {
      // The record may have moved or vanished since the dialog opened (or
      // since the row was rendered): check the latest saved copy first.
      const r = getProgramStaffAssignments();
      if (r.status !== "ok") {
        // Unreadable is not "deleted": say so, and keep the draft.
        setSaveError(
          "Saved assignments can't be read right now, so nothing was changed. Your entries are still here — try again once they can be read.",
        );
        return;
      }
      const latest = r.assignments.find(
        (a) => a.id === mode.assignment.id,
      );
      if (!latest) {
        setSaveError("This assignment no longer exists.");
        return;
      }
      if (
        context.kind === "program" &&
        latest.programId !== context.programId
      ) {
        setSaveError(
          "This assignment was moved to another Program, so it can't be edited from this Program.",
        );
        return;
      }
      const built = buildAssignmentPatch(mode.assignment, draft);
      if (!built.ok) {
        setErrors(built.fieldErrors);
        setSaveError("Fix the highlighted fields.");
        return;
      }
      if (Object.keys(built.value).length === 0) {
        onClose(); // nothing changed, nothing to save
        return;
      }
      result = correctProgramStaffAssignment(
        mode.assignment.id,
        built.value,
      );
    }
    if (!result.ok) {
      // The dialog stays open with every entry intact.
      setErrors(result.fieldErrors ?? {});
      setSaveError(result.error);
      return;
    }
    toast.success(
      mode.kind === "add"
        ? "Assignment added."
        : mode.assignment.programId !== result.assignment.programId
          ? "Assignment moved to the selected Program."
          : "Assignment updated.",
    );
    onClose();
  };

  /** Draft Add / Edit: same field rules and duplicate check as a stored
   *  assignment, but the row only joins the Program's draft. */
  function saveDraft(ctx: Extract<AssignmentDialogContext, { kind: "draft" }>) {
    if (!mode) return;
    let row: ProgramStaffAssignment;
    if (mode.kind === "add") {
      const built = buildNewAssignment(Number(staffId), draft);
      const staffError = !staffId
        ? "Select an MHBG Staff member."
        : undefined;
      if (!built.ok || staffError) {
        setErrors({
          ...(built.ok ? {} : built.fieldErrors),
          staff: staffError,
        });
        setSaveError("Fix the highlighted fields.");
        return;
      }
      const now = new Date().toISOString();
      row = {
        ...built.value,
        programId: DRAFT_PROGRAM_ID,
        startDate: built.value.startDate ?? "",
        endDate: built.value.endDate ?? "",
        ongoing: false,
        notes: built.value.notes ?? "",
        id: `draft-${now}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: now,
        updatedAt: now,
      };
    } else {
      const built = buildAssignmentPatch(mode.assignment, draft);
      if (!built.ok) {
        setErrors(built.fieldErrors);
        setSaveError("Fix the highlighted fields.");
        return;
      }
      if (Object.keys(built.value).length === 0) {
        onClose();
        return;
      }
      row = {
        ...mode.assignment,
        ...built.value,
        programId: DRAFT_PROGRAM_ID,
      };
    }
    const fieldErrors = validateProgramStaffAssignment(
      row,
      () => true,
    );
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      setSaveError("Fix the highlighted fields.");
      return;
    }
    if (findDuplicateAssignment(ctx.drafts, row, row.id)) {
      setSaveError(MSG_DUPLICATE);
      return;
    }
    ctx.onSaveDraft(row);
    onClose();
  }

  const err = (k: keyof AssignmentFieldErrors | "staff") =>
    errors[k] ? (
      <div role="alert">
        <FieldError id={`${idPrefix}-${k}-error`}>{errors[k]}</FieldError>
      </div>
    ) : null;
  const describedBy = (k: keyof AssignmentFieldErrors | "staff") =>
    errors[k] ? `${idPrefix}-${k}-error` : undefined;

  const programSelect = context.kind === "draft" ? (
    <div>
      <FieldLabel htmlFor={`${idPrefix}-program`} required>
        PROGRAM NAME
      </FieldLabel>
      <p
        id={`${idPrefix}-program`}
        className="slds-text-4 py-1.5"
      >
        {context.programName.trim() || "New Program (name not entered yet)"}
      </p>
    </div>
  ) : (
    <div>
      <FieldLabel
        htmlFor={`${idPrefix}-program`}
        required
        error={!!errors.programId}
      >
        PROGRAM NAME
      </FieldLabel>
      <Select
        value={draft.programId}
        onValueChange={(v) => update("programId", v)}
        disabled={programFixed}
      >
        <SelectTrigger
          id={`${idPrefix}-program`}
          surface="base"
          aria-invalid={!!errors.programId}
          aria-describedby={describedBy("programId")}
        >
          <SelectValue placeholder="Select Program" />
        </SelectTrigger>
        <SelectContent>
          {programs.map((p) => (
            <SelectItem key={p.id} value={String(p.id)}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {err("programId")}
    </div>
  );

  return (
    <Dialog
      open={mode !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent
        size="md"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          getReturnFocus()?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {mode?.kind === "add"
              ? "Add Title Assignment"
              : "Edit Title Assignment"}
          </DialogTitle>
          <DialogDescription>
            {mode?.kind === "add"
              ? "Records a Title for an MHBG Staff member in a Program."
              : "Updates this assignment in place. Title and Program are required; dates and Notes are optional."}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {saveError && (
            <Alert variant="error" role="alert">
              <AlertCircle aria-hidden="true" />
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(
              <div className="sm:col-span-2">
                <FieldLabel
                  htmlFor={`${idPrefix}-staff`}
                  required={mode?.kind === "add"}
                  error={!!errors.staff}
                >
                  MHBG STAFF MEMBER
                </FieldLabel>
                {editing ? (
                  <p
                    id={`${idPrefix}-staff`}
                    className="slds-text-4 py-1.5"
                  >
                    {context.staffName(editing.constituentId)}
                  </p>
                ) : (
                  <Select disabled={context.kind === "profile"} value={staffId} onValueChange={(v) => {
                    setStaffId(v);
                    setErrors((e) => ({ ...e, staff: undefined }));
                    setSaveError("");
                  }}>
                    <SelectTrigger
                      id={`${idPrefix}-staff`}
                      surface="base"
                      aria-invalid={!!errors.staff}
                      aria-describedby={describedBy("staff")}
                    >
                      <SelectValue placeholder="Select Staff Member" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      sideOffset={4}
                      className="max-h-[240px] overflow-y-auto"
                    >
                      {context.staffOptions.map((o) => (
                        <SelectItem key={o.id} value={String(o.id)}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {err("staff")}
              </div>
            )}
            <div>
              <FieldLabel
                htmlFor={`${idPrefix}-title`}
                required
                error={!!errors.titleId}
              >
                TITLE
              </FieldLabel>
              <Select
                value={draft.titleId}
                onValueChange={(v) => update("titleId", v)}
              >
                <SelectTrigger
                  id={`${idPrefix}-title`}
                  surface="base"
                  aria-invalid={!!errors.titleId}
                  aria-describedby={
                    [
                      describedBy("titleId"),
                      editing &&
                      !isRecognizedProgramStaffTitle(editing.titleId)
                        ? `${idPrefix}-title-note`
                        : undefined,
                    ]
                      .filter(Boolean)
                      .join(" ") || undefined
                  }
                >
                  <SelectValue placeholder="Select Title" />
                </SelectTrigger>
                <SelectContent>
                  {titles.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editing &&
                !isRecognizedProgramStaffTitle(editing.titleId) && (
                  <p
                    id={`${idPrefix}-title-note`}
                    className="mt-1 slds-text-3"
                    style={{ color: "var(--slds-g-color-text-weak)" }}
                  >
                    The saved title "{editing.titleId || "blank"}" is not
                    one of the available titles. Choose a valid Title to
                    save changes to this assignment.
                  </p>
                )}
              {err("titleId")}
            </div>
            {programSelect}
            <div>
              <FieldLabel
                htmlFor={`${idPrefix}-start`}
                error={!!errors.startDate}
              >
                START DATE
              </FieldLabel>
              <DateInput
                id={`${idPrefix}-start`}
                value={draft.startDate}
                onChange={(v) => update("startDate", v)}
                aria-invalid={!!errors.startDate}
                aria-describedby={describedBy("startDate")}
              />
              {err("startDate")}
            </div>
            <div>
              <FieldLabel
                htmlFor={`${idPrefix}-end`}
                error={!!errors.endDate}
              >
                END DATE
              </FieldLabel>
              <DateInput
                id={`${idPrefix}-end`}
                value={draft.endDate}
                onChange={(v) => update("endDate", v)}
                aria-invalid={!!errors.endDate}
                aria-describedby={describedBy("endDate")}
              />
              {err("endDate")}
            </div>
          </div>
          <div>
            <FieldLabel htmlFor={`${idPrefix}-notes`}>NOTES</FieldLabel>
            <Textarea
              id={`${idPrefix}-notes`}
              size="md"
              rows={4}
              value={draft.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
