// Pure form logic for a staff member's Program title assignment (US 20127),
// shared by the Constituent Profile dialog now and the Program-side screen
// later. Drafts hold dates as typed (MM/DD/YYYY); nothing here writes —
// saves go through addProgramStaffAssignment / correctProgramStaffAssignment.

import { isoToMdy, mdyToIso } from "../lib/dateFormat";
import {
  PROGRAM_STAFF_LEGACY_TITLES,
  PROGRAM_STAFF_TITLES,
  isLegacyProgramStaffTitle,
  isRecognizedProgramStaffTitle,
  type AssignmentFieldErrors,
  type ProgramStaffAssignment,
  type ProgramStaffAssignmentInput,
  type ProgramStaffAssignmentPatch,
} from "./programStaffAssignmentStore";
import { isValidMdy } from "./mockProgramsData";
import {
  CONSTITUENTS,
  getConstituentStatus,
} from "./mockConstituents";

export interface AssignmentDraft {
  programId: string;
  titleId: string;
  /** MM/DD/YYYY as typed, or "". */
  startDate: string;
  endDate: string;
  notes: string;
}

export const emptyAssignmentDraft = (): AssignmentDraft => ({
  programId: "",
  titleId: "",
  startDate: "",
  endDate: "",
  notes: "",
});

export const draftFromAssignment = (
  a: ProgramStaffAssignment,
): AssignmentDraft => ({
  programId: String(a.programId),
  // An unrecognized saved title is NOT preselected: the user must choose a
  // valid one explicitly before the record can be saved.
  titleId: isRecognizedProgramStaffTitle(a.titleId)
    ? a.titleId
    : "",
  startDate: isoToMdy(a.startDate),
  endDate: isoToMdy(a.endDate),
  notes: a.notes,
});

/** Title choices: always the seven; the old combined title is added only
 *  when editing a record that already has it. */
export function titleChoices(
  editing?: Pick<ProgramStaffAssignment, "titleId">,
): { id: string; label: string }[] {
  const seven = PROGRAM_STAFF_TITLES.map((t) => ({
    id: t.id as string,
    label: t.label as string,
  }));
  return editing && isLegacyProgramStaffTitle(editing.titleId)
    ? [
        {
          id: PROGRAM_STAFF_LEGACY_TITLES[0].id,
          label: PROGRAM_STAFF_LEGACY_TITLES[0].label,
        },
        ...seven,
      ]
    : seven;
}

type Parsed = { iso: string } | { error: string };

/** Blank is allowed; anything typed must be a complete, real date. */
function parseDate(typed: string, label: string): Parsed {
  const t = typed.trim();
  if (!t) return { iso: "" };
  return isValidMdy(t)
    ? { iso: mdyToIso(t) }
    : { error: `Enter a valid ${label} (MM/DD/YYYY).` };
}

function checkDraft(d: AssignmentDraft) {
  const errors: AssignmentFieldErrors = {};
  if (!d.programId) errors.programId = "Select a Program.";
  if (!d.titleId) errors.titleId = "Select a Title.";
  const s = parseDate(d.startDate, "Start Date");
  const e = parseDate(d.endDate, "End Date");
  if ("error" in s) errors.startDate = s.error;
  if ("error" in e) errors.endDate = e.error;
  return { errors, start: s, end: e };
}

export type BuildResult<T> =
  | { ok: true; value: T }
  | { ok: false; fieldErrors: AssignmentFieldErrors };

export function buildNewAssignment(
  constituentId: number,
  d: AssignmentDraft,
): BuildResult<ProgramStaffAssignmentInput> {
  const { errors, start, end } = checkDraft(d);
  if (Object.keys(errors).length)
    return { ok: false, fieldErrors: errors };
  return {
    ok: true,
    value: {
      programId: Number(d.programId),
      constituentId,
      titleId:
        d.titleId as ProgramStaffAssignmentInput["titleId"],
      startDate: (start as { iso: string }).iso,
      endDate: (end as { iso: string }).iso,
      notes: d.notes,
    },
  };
}

/** Only the fields that differ from the saved record; an unchanged field
 *  (and so the legacy `ongoing` flag, Notes, the title…) is left out. */
export function buildAssignmentPatch(
  saved: ProgramStaffAssignment,
  d: AssignmentDraft,
): BuildResult<ProgramStaffAssignmentPatch> {
  const { errors, start, end } = checkDraft(d);
  if (Object.keys(errors).length)
    return { ok: false, fieldErrors: errors };
  const patch: ProgramStaffAssignmentPatch = {};
  if (Number(d.programId) !== saved.programId)
    patch.programId = Number(d.programId);
  if (d.titleId !== saved.titleId)
    patch.titleId =
      d.titleId as ProgramStaffAssignment["titleId"];
  if ((start as { iso: string }).iso !== saved.startDate)
    patch.startDate = (start as { iso: string }).iso;
  if ((end as { iso: string }).iso !== saved.endDate)
    patch.endDate = (end as { iso: string }).iso;
  if (d.notes !== saved.notes) patch.notes = d.notes;
  return { ok: true, value: patch };
}

/** True when the draft differs from what it started from. */
export const isDraftDirty = (
  a: AssignmentDraft,
  b: AssignmentDraft,
) => JSON.stringify(a) !== JSON.stringify(b);

/** Individuals with the MHBG Staff role who are currently Active — who a
 *  new assignment can be recorded for (same eligibility as the coordinator
 *  pickers). Historical records stay readable if someone later becomes
 *  inactive. */
export function eligibleStaffOptions(): {
  id: number;
  label: string;
}[] {
  return CONSTITUENTS.filter(
    (c) =>
      c.type === "Individual" &&
      c.role === "MHBG Staff" &&
      c.status === "Active" &&
      getConstituentStatus(c) === "Active",
  )
    .map((c) => ({ id: c.id, label: c.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}