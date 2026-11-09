import { getProgramById } from "../../data/mockProgramsData";
import { getYouthProgramEnrollments } from "../../data/mockYouthProgramData";

// Program ownership for a Substance Test created from a Youth Profile
// (20065 AC3). Approved rules:
//   one active Program   → that Program, shown to staff before saving
//   several              → staff must choose one; nothing is preselected
//   none                 → no test can be created; never a fallback
// Only this youth's ACTIVE enrollments count — historical (ended)
// enrollments are never used. The Program is fixed at creation: the stored
// programId never follows a later transfer.

export interface YouthProgramOption {
  programId: number;
  programName: string;
}

/** The youth's currently active Programs: active enrollments of this
 *  constituent only, in Programs that exist and are Active, one entry per
 *  Program, name-sorted. */
export function getActiveProgramsForYouth(
  constituentId: number,
): YouthProgramOption[] {
  const seen = new Set<number>();
  return getYouthProgramEnrollments()
    .filter(
      (e) =>
        e.constituentId === constituentId &&
        e.active &&
        !seen.has(e.programId) &&
        !!seen.add(e.programId),
    )
    .flatMap((e) => {
      const p = getProgramById(e.programId);
      return p && p.status === "Active"
        ? [{ programId: p.id, programName: p.name }]
        : [];
    })
    .sort((a, b) => a.programName.localeCompare(b.programName));
}