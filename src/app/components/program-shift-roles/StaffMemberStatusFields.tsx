// US 20221 / 20223 — Staff Member Status form inside "Create New Program Log
// Entry". Staff-only: Staff Member + Shift Role side by side right below
// Date/Time (stacked on narrow screens), then Status Action and Notes. The
// shift is derived from Date and Time — there is no Shift picker. The draft
// is Program-scoped and the save re-validates everything in shiftRoleStore.

import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "@/app/lib/lucide-icons";
import { FieldError, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  SHIFT_ROLE_MESSAGES,
  STATUS_ACTIONS,
  activeRolesForProgram,
  createStaffStatusEntry,
  recordableStaffForProgram,
  useShiftRoleState,
  type StaffStatusEntry,
  type StaffStatusFieldErrors,
} from "../../data/shiftRoleStore";
import { useProgramStaffAssignments } from "../../data/programStaffAssignmentStore";

export const STAFF_MEMBER_STATUS_LOG_TYPE = "Staff Member Status";

export interface StaffStatusDraft {
  staffId: string;
  shiftRoleId: string;
  statusAction: string;
  notes: string;
}

const EMPTY: StaffStatusDraft = { staffId: "", shiftRoleId: "", statusAction: "", notes: "" };

/** Draft + save for the Staff Member Status branch of the + Log dialog. */
export function useStaffMemberStatusDraft(programId: number, open: boolean) {
  const [draft, setDraft] = useState<StaffStatusDraft>(EMPTY);
  const [errors, setErrors] = useState<StaffStatusFieldErrors & { form?: string }>({});

  // New dialog session or different Program → clean, Program-scoped draft.
  useEffect(() => {
    setDraft(EMPTY);
    setErrors({});
  }, [programId, open]);

  const save = (args: { date: string; time: string }): StaffStatusEntry | null => {
    const res = createStaffStatusEntry({
      programId,
      staffConstituentId: draft.staffId ? Number(draft.staffId) : null,
      shiftRoleId: draft.shiftRoleId || null,
      date: args.date,
      time: args.time,
      statusAction: draft.statusAction,
      notes: draft.notes,
    });
    if (res.ok) {
      setErrors({});
      return res.entry;
    }
    // Inputs are kept as entered on failure.
    setErrors(res.fieldErrors ?? { form: SHIFT_ROLE_MESSAGES[res.error] });
    return null;
  };

  return { draft, setDraft, errors, setErrors, save };
}

/** Whether creation is possible at all (roster + active roles present). */
export function useStaffStatusAvailability(programId: number) {
  const state = useShiftRoleState();
  useProgramStaffAssignments(); // re-render when assignments change
  const staff = recordableStaffForProgram(programId);
  const roles = useMemo(
    () => (state.status === "ok" ? activeRolesForProgram(state.roles, programId) : []),
    [state, programId],
  );
  return {
    staff,
    roles,
    rolesReadable: state.status === "ok",
    canCreate: !!staff && staff.length > 0 && roles.length > 0,
  };
}

export function StaffMemberStatusFields({
  programId,
  draft,
  setDraft,
  errors,
}: {
  programId: number;
  draft: StaffStatusDraft;
  setDraft: React.Dispatch<React.SetStateAction<StaffStatusDraft>>;
  errors: StaffStatusFieldErrors & { form?: string };
}) {
  const { staff, roles, rolesReadable } = useStaffStatusAvailability(programId);

  // Selections that stop being valid (eligibility or role changes) clear.
  useEffect(() => {
    if (draft.shiftRoleId && !roles.some((r) => r.id === draft.shiftRoleId))
      setDraft((d) => ({ ...d, shiftRoleId: "" }));
  }, [roles, draft.shiftRoleId, setDraft]);
  useEffect(() => {
    if (draft.staffId && staff && !staff.some((s) => String(s.constituentId) === draft.staffId))
      setDraft((d) => ({ ...d, staffId: "" }));
  }, [staff, draft.staffId, setDraft]);

  const notesRequired = draft.statusAction === "Other";
  return (
    <div className="space-y-4" data-testid="staff-member-status-fields">
      {errors.form && (
        <Alert variant="error" role="alert">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>{errors.form}</AlertDescription>
        </Alert>
      )}
      {(staff === null || !rolesReadable) && (
        <Alert variant="error" role="alert">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>
            Staff or Shift Role data can't be read right now, so a status can't be created.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="ssm-staff" required>Staff Member</FieldLabel>
          <Select
            value={draft.staffId}
            onValueChange={(v) => setDraft((d) => ({ ...d, staffId: v }))}
            disabled={!staff || staff.length === 0}
          >
            <SelectTrigger
              id="ssm-staff"
              surface="base"
              className="w-full"
              aria-required
              aria-invalid={!!errors.staff}
              aria-describedby={errors.staff ? "ssm-staff-err" : undefined}
            >
              <SelectValue placeholder="Select staff member" />
            </SelectTrigger>
            <SelectContent>
              {(staff ?? []).map((s) => (
                <SelectItem key={s.constituentId} value={String(s.constituentId)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id="ssm-staff-err" role="alert">{errors.staff}</FieldError>
        </div>

        <div>
          <FieldLabel htmlFor="ssm-role" required>Shift Role</FieldLabel>
          <Select
            value={draft.shiftRoleId}
            onValueChange={(v) => setDraft((d) => ({ ...d, shiftRoleId: v }))}
            disabled={roles.length === 0}
          >
            <SelectTrigger
              id="ssm-role"
              surface="base"
              className="w-full"
              aria-required
              aria-invalid={!!errors.shiftRole}
              aria-describedby={errors.shiftRole ? "ssm-role-err" : undefined}
            >
              <SelectValue
                placeholder={roles.length === 0 ? "No active shift roles configured" : "Select shift role"}
              />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id="ssm-role-err" role="alert">{errors.shiftRole}</FieldError>
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="ssm-action" required>Status Action</FieldLabel>
        <Select
          value={draft.statusAction}
          onValueChange={(v) => setDraft((d) => ({ ...d, statusAction: v }))}
        >
          <SelectTrigger
            id="ssm-action"
            surface="base"
            className="w-full sm:w-1/2"
            aria-required
            aria-invalid={!!errors.statusAction}
            aria-describedby={errors.statusAction ? "ssm-action-err" : undefined}
          >
            <SelectValue placeholder="Select status action" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_ACTIONS.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError id="ssm-action-err" role="alert">{errors.statusAction}</FieldError>
      </div>

      <div>
        <FieldLabel htmlFor="ssm-notes" required={notesRequired}>Notes</FieldLabel>
        <Textarea
          id="ssm-notes"
          value={draft.notes}
          onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
          placeholder={notesRequired ? "Describe the status" : "Optional notes"}
          rows={4}
          aria-required={notesRequired}
          aria-invalid={!!errors.notes}
          aria-describedby={errors.notes ? "ssm-notes-err" : undefined}
        />
        <FieldError id="ssm-notes-err" role="alert">{errors.notes}</FieldError>
      </div>
    </div>
  );
}
