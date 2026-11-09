// US 20222 fix — the writable Program Log Youth strip is the open Program's
// ACTIVE youth (getActiveYouthForProgram), each row carrying its real Youth
// Constituent ID, instead of the shared mock roster used for every Program.

import { useMemo, useSyncExternalStore } from "react";
import {
  getActiveYouthForProgram,
  getYouthProgramEnrollments,
  subscribeYouthProgramEnrollments,
} from "../../data/mockYouthProgramData";
import { DEFAULT_YOUTH_LOCATION } from "../../data/youthLocationStore";
import { activeYouthInProgram } from "../../lib/locationLogEvents";

export interface ProgramYouthRow {
  /** Row id = Constituent ID (stable). */
  id: number;
  constituentId: number;
  name: string;
  initials: string;
  color: string;
  /** Fallback location when none is recorded yet. */
  status: string;
  program: string;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

export function useProgramYouthStrip(programId: number, programName: string): ProgramYouthRow[] {
  // Re-derive whenever enrollments change.
  const enrollments = useSyncExternalStore(
    subscribeYouthProgramEnrollments,
    getYouthProgramEnrollments,
    getYouthProgramEnrollments,
  );
  return useMemo(
    () =>
      getActiveYouthForProgram(programId).map((y) => ({
        id: y.constituentId,
        constituentId: y.constituentId,
        name: y.name,
        initials: initials(y.name),
        color: "bg-green-600",
        status: DEFAULT_YOUTH_LOCATION,
        program: programName,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [programId, programName, enrollments],
  );
}

/** Save-time recheck: is this youth still actively enrolled in the Program? */
export function isYouthWritableInProgram(
  youth: { constituentId?: number } | null | undefined,
  programId: number,
): boolean {
  return youth?.constituentId !== undefined && activeYouthInProgram(youth.constituentId, programId) !== null;
}
