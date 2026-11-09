// Program ↔ Staff title assignments with dates (US 20130) — the one place a
// staff member's Program-specific title assignment is recorded, read by both
// the Constituent Profile (where assignments are made and corrected) and the
// Program Record's Staff History.
//
// Identity: an assignment belongs to a Program by its stable Program ID and
// to a staff member by their Constituent ID — never by name.
//
// History is append-only from the app's point of view: there is no delete.
// A genuine replacement / reassignment / new period is a NEW record (the old
// one is ended, not rewritten); a correction updates the same record.
//
// Same storage convention as the other constituent stores: a versioned
// localStorage key, all-or-nothing writes, useSyncExternalStore for
// subscribers. Saved data that cannot be read is reported as an error and
// never overwritten. Prototype only: there is no server persistence.

import { useSyncExternalStore } from "react";
import { CONSTITUENTS } from "./mockConstituents";
import {
  CURRENT_USER_IS_SYSTEM_ADMIN,
  commitProgramState,
  getProgramById,
  getStoredAssignments,
  refreshProgramsFromStorage,
  stageProgramSave,
  subscribeProgramState,
  type ProgramRecord,
} from "./mockProgramsData";
import {
  END_BEFORE_START,
  isValidIsoDate,
} from "./contractorDetailsStore";

/** The titles selectable for a NEW assignment, in display order. `id` is
 *  what is stored. (US 20127: seven titles; Youth Care Worker and Transition
 *  Coach are separate.) */
export const PROGRAM_STAFF_TITLES = [
  { id: "program-manager", label: "Program Manager" },
  { id: "therapist", label: "Therapist" },
  { id: "supervisor", label: "Supervisor" },
  { id: "ecr-coordinator", label: "ECR Coordinator" },
  { id: "day-coordinator", label: "Day Coordinator" },
  { id: "youth-care-worker-only", label: "Youth Care Worker" },
  { id: "transition-coach", label: "Transition Coach" },
] as const;

/**
 * Earlier builds had ONE combined title, "Youth Care Worker / Transition
 * Coach", stored with the id "youth-care-worker". A record saved under it
 * doesn't say which of the two roles was meant, so it is kept exactly as it
 * is (same id, same title value) and stays readable, but it is not offered
 * for a new assignment and is never converted to either new title.
 */
export const PROGRAM_STAFF_LEGACY_TITLES = [
  {
    id: "youth-care-worker",
    label: "Youth Care Worker / Transition Coach",
  },
] as const;

export type ProgramStaffTitleId =
  | (typeof PROGRAM_STAFF_TITLES)[number]["id"]
  | (typeof PROGRAM_STAFF_LEGACY_TITLES)[number]["id"];

const TITLE_LABEL = new Map<string, string>(
  [...PROGRAM_STAFF_TITLES, ...PROGRAM_STAFF_LEGACY_TITLES].map(
    (t) => [t.id, t.label],
  ),
);

/** Display label for a stored title id (legacy included); undefined when
 *  unsupported. */
export const programStaffTitleLabel = (id: string) =>
  TITLE_LABEL.get(id);

/** True when the id is a configured title or the old combined one. Access
 *  and validation use this, never the display fallback below. */
export const isRecognizedProgramStaffTitle = (id: string) =>
  TITLE_LABEL.has(id);

/** Label for DISPLAY only: the configured label, or an explicit fallback
 *  that keeps the stored value inspectable. Never use it to decide whether a
 *  title is supported. */
export const programStaffTitleDisplay = (id: string) =>
  TITLE_LABEL.get(id) ??
  `Unrecognized title (${id || "blank"})`;

/** True for a title saved under the old combined value. */
export const isLegacyProgramStaffTitle = (id: string) =>
  PROGRAM_STAFF_LEGACY_TITLES.some((t) => t.id === id);

export interface ProgramStaffAssignment {
  id: string;
  /** Stable Program ID. */
  programId: number;
  /** Stable Constituent ID of the MHBG Staff member. */
  constituentId: number;
  titleId: ProgramStaffTitleId;
  /** ISO "YYYY-MM-DD" (date-only), or "" when not recorded (optional). */
  startDate: string;
  /** ISO "YYYY-MM-DD", or "" when none is recorded (optional). */
  endDate: string;
  /**
   * Explicitly ongoing. A missing End Date alone never means ongoing: it
   * is only "Present" when this flag says so.
   */
  ongoing: boolean;
  /** Optional multiline notes ("" when none); line breaks preserved. */
  notes: string;
  /** ISO timestamps — audit only, never shown as assignment dates. */
  createdAt: string;
  updatedAt: string;
}

/** A new assignment. Dates, Notes and the legacy ongoing flag are optional;
 *  missing dates never make someone current staff. */
export type ProgramStaffAssignmentInput = Pick<
  ProgramStaffAssignment,
  "programId" | "constituentId" | "titleId"
> &
  Partial<
    Pick<
      ProgramStaffAssignment,
      "startDate" | "endDate" | "ongoing" | "notes"
    >
  >;

export type AssignmentFieldErrors = Partial<
  Record<
    "programId" | "titleId" | "startDate" | "endDate",
    string
  >
>;

// Storage: the assignments live in the same persisted state as the Programs
// (see mockProgramsData.ts), so a Program save together with its staff
// changes is one write. This module holds no storage of its own.

export type ProgramStaffAssignmentsRead =
  | { status: "ok"; assignments: ProgramStaffAssignment[] }
  | { status: "error" };

/** Titles accepted for a new selection. */
const TITLE_IDS = new Set<string>(
  PROGRAM_STAFF_TITLES.map((t) => t.id),
);

// Stable snapshot object for useSyncExternalStore.
let lastRead: ProgramStaffAssignmentsRead = { status: "error" };
function readNow(): ProgramStaffAssignmentsRead {
  const s = getStoredAssignments();
  if (s.status !== "ok") {
    if (lastRead.status !== "error")
      lastRead = { status: "error" };
  } else if (
    lastRead.status !== "ok" ||
    lastRead.assignments !== s.assignments
  )
    lastRead = { status: "ok", assignments: s.assignments };
  return lastRead;
}

const currentList = (): ProgramStaffAssignment[] => {
  const r = readNow();
  return r.status === "ok" ? r.assignments : [];
};

/** Picks up saves made in another tab before reading or writing. */
const refreshFromStorage = () => refreshProgramsFromStorage();

/** One all-or-nothing write of the assignments. */
const commit = (next: ProgramStaffAssignment[]): boolean =>
  commitProgramState({ assignments: next });

export function useProgramStaffAssignments(): ProgramStaffAssignmentsRead {
  return useSyncExternalStore(
    subscribeProgramState,
    readNow,
    readNow,
  );
}

/** Non-reactive read, for tests and one-off lookups. */
export function getProgramStaffAssignments(): ProgramStaffAssignmentsRead {
  refreshFromStorage();
  return readNow();
}

// ─── Validation ─────────────────────────────────────────────────────────────

export const MSG_ONGOING_OR_END =
  "Enter an End Date, or mark the assignment as ongoing.";
export const MSG_DUPLICATE =
  "This staff member already has this title in this Program with the same Start Date. Change the Start Date or edit the existing assignment.";

/** Normalized assignment values the rules below work on. */
type Checkable = {
  programId: number;
  titleId: string;
  startDate?: string;
  endDate?: string;
  ongoing?: boolean;
};

/**
 * Shared by the Constituent Profile form and the store's write boundary.
 * Title and Program are required; Start Date and End Date are both optional
 * (either, both or neither), but any supplied date must be valid and an End
 * Date may not precede the Start Date when both exist. `keepLegacyTitle`
 * lets an existing combined-title record be saved without choosing a new
 * title.
 */
export function validateProgramStaffAssignment(
  a: Checkable,
  /** Overrides the Program lookup (a Program being created in the same
   *  save doesn't exist yet). */
  programExists: (id: number) => boolean = (id) =>
    !!getProgramById(id),
  keepLegacyTitle?: string,
): AssignmentFieldErrors {
  const e: AssignmentFieldErrors = {};
  const start = a.startDate ?? "";
  const end = a.endDate ?? "";
  if (!programExists(a.programId))
    e.programId = "Select a Program.";
  if (
    !TITLE_IDS.has(a.titleId) &&
    !(
      keepLegacyTitle !== undefined &&
      a.titleId === keepLegacyTitle
    )
  )
    e.titleId = "Select a Title.";
  if (start && !isValidIsoDate(start))
    e.startDate = "Enter a valid Start Date (MM/DD/YYYY).";
  if (a.ongoing && end)
    e.endDate = "An ongoing assignment has no End Date.";
  else if (end && !isValidIsoDate(end))
    e.endDate = "Enter a valid End Date (MM/DD/YYYY).";
  else if (end && start && !e.startDate && end < start)
    e.endDate = END_BEFORE_START;
  return e;
}

/** The exact-duplicate identity: staff + Program + title + Start Date
 *  (two blank Start Dates are equal). End Date and Notes don't count. */
const dupKey = (a: {
  constituentId: number;
  programId: number;
  titleId: string;
  startDate?: string;
}) =>
  `${a.constituentId}|${a.programId}|${a.titleId}|${(a.startDate ?? "").trim()}`;

/** An existing assignment with the same identity, ignoring `excludeId`. */
export function findDuplicateAssignment(
  all: readonly ProgramStaffAssignment[],
  candidate: Parameters<typeof dupKey>[0],
  excludeId?: string,
): ProgramStaffAssignment | undefined {
  const key = dupKey(candidate);
  return all.find(
    (x) => x.id !== excludeId && dupKey(x) === key,
  );
}

// ─── Edit permission (existing prototype rule) ─────────────────────────────

let gateOverrideForTest: boolean | null = null;
/**
 * Who may add or edit title assignments: the Program Record's existing
 * edit gate (System Admin). One check, used by both entry points and by
 * every write below. This is the PROTOTYPE rule only — there is no server
 * enforcement, and nothing is inferred from the staff member concerned.
 */
export const canManageProgramStaffAssignments = (): boolean =>
  gateOverrideForTest ?? CURRENT_USER_IS_SYSTEM_ADMIN;
export const MSG_NOT_PERMITTED =
  "You don't have permission to add or edit title assignments. Nothing was changed.";
/** Test seam (also used by the browser acceptance run). */
export function __setCanManageProgramStaffAssignmentsForTest(
  v: boolean | null,
): void {
  gateOverrideForTest = v;
}

export type ProgramStaffAssignmentWrite =
  | { ok: true; assignment: ProgramStaffAssignment }
  | {
      ok: false;
      error: string;
      fieldErrors?: AssignmentFieldErrors;
      /** Set when the exact same staff + Program + title + Start Date
       *  already exists. */
      duplicate?: true;
    };

const STORAGE_ERROR =
  "Assignments could not be saved. Your entries are still here — please try again.";

const isStaffConstituent = (id: number) =>
  CONSTITUENTS.some(
    (c) =>
      c.id === id &&
      c.type === "Individual" &&
      c.role === "MHBG Staff",
  );

let seq = 0;
const newId = () =>
  `psa-${Date.now().toString(36)}-${(seq++).toString(36)}`;

function checkWritable(): string | null {
  if (!canManageProgramStaffAssignments())
    return MSG_NOT_PERMITTED;
  refreshFromStorage();
  return readNow().status === "ok"
    ? null
    : "Saved assignments can't be read, so nothing was changed.";
}

/** A new assignment period — the previous records are left as they are. */
export function addProgramStaffAssignment(
  input: ProgramStaffAssignmentInput,
): ProgramStaffAssignmentWrite {
  const unreadable = checkWritable();
  if (unreadable) return { ok: false, error: unreadable };
  if (!isStaffConstituent(input.constituentId))
    return {
      ok: false,
      error: "Assignments can only be recorded for MHBG Staff.",
    };
  const fieldErrors = validateProgramStaffAssignment(input);
  if (Object.keys(fieldErrors).length)
    return {
      ok: false,
      error: "Fix the highlighted fields.",
      fieldErrors,
    };
  if (findDuplicateAssignment(currentList(), input))
    return { ok: false, error: MSG_DUPLICATE, duplicate: true };
  const now = new Date().toISOString();
  const assignment: ProgramStaffAssignment = {
    programId: input.programId,
    constituentId: input.constituentId,
    titleId: input.titleId,
    startDate: input.startDate ?? "",
    endDate: input.endDate ?? "",
    ongoing: input.ongoing ?? false,
    notes: input.notes ?? "",
    id: newId(),
    createdAt: now,
    updatedAt: now,
  };
  return commit([...currentList(), assignment])
    ? { ok: true, assignment }
    : { ok: false, error: STORAGE_ERROR };
}

/** What an edit may change. The staff member, ID and creation time never
 *  change; omitted fields keep their latest saved value (Notes included). */
export type ProgramStaffAssignmentPatch = Partial<
  Pick<
    ProgramStaffAssignment,
    | "programId"
    | "titleId"
    | "startDate"
    | "endDate"
    | "ongoing"
    | "notes"
  >
>;

/**
 * Edits an existing record IN PLACE (same ID, staff member and creation
 * time): Program, title, Start Date, End Date and Notes. Changing the
 * Program moves this same record to the new Program. Merges onto the latest
 * saved copy. A genuinely new period or reassignment is a new record via
 * addProgramStaffAssignment.
 */
export function correctProgramStaffAssignment(
  id: string,
  patch: ProgramStaffAssignmentPatch,
): ProgramStaffAssignmentWrite {
  const unreadable = checkWritable();
  if (unreadable) return { ok: false, error: unreadable };
  const current = currentList().find((a) => a.id === id);
  if (!current)
    return {
      ok: false,
      error: "This assignment no longer exists.",
    };
  const next: ProgramStaffAssignment = {
    ...current,
    ...(patch.programId !== undefined
      ? { programId: patch.programId }
      : {}),
    ...(patch.titleId !== undefined
      ? { titleId: patch.titleId }
      : {}),
    ...(patch.startDate !== undefined
      ? { startDate: patch.startDate }
      : {}),
    ...(patch.endDate !== undefined
      ? { endDate: patch.endDate }
      : {}),
    ...(patch.notes !== undefined
      ? { notes: patch.notes }
      : {}),
    ongoing:
      patch.ongoing !== undefined
        ? patch.ongoing
        : // Recording an End Date ends an ongoing legacy flag.
          patch.endDate
          ? false
          : current.ongoing,
  };
  // A record saved under the old combined title can be edited without
  // choosing a new title; it can't be switched to another legacy value.
  const fieldErrors = validateProgramStaffAssignment(
    next,
    undefined,
    isLegacyProgramStaffTitle(current.titleId)
      ? current.titleId
      : undefined,
  );
  if (Object.keys(fieldErrors).length)
    return {
      ok: false,
      error: "Fix the highlighted fields.",
      fieldErrors,
    };
  if (findDuplicateAssignment(currentList(), next, id))
    return { ok: false, error: MSG_DUPLICATE, duplicate: true };
  const updated = {
    ...next,
    updatedAt: new Date().toISOString(),
  };
  return commit(
    currentList().map((a) => (a.id === id ? updated : a)),
  )
    ? { ok: true, assignment: updated }
    : { ok: false, error: STORAGE_ERROR };
}

/**
 * Closes an assignment with a recorded End Date (the record is kept). Reads
 * the latest saved copy first and changes only the end fields, so a title or
 * start-date correction saved meanwhile (e.g. in another tab) is preserved.
 */
export function endProgramStaffAssignment(
  id: string,
  endDate: string,
): ProgramStaffAssignmentWrite {
  const unreadable = checkWritable();
  if (unreadable) return { ok: false, error: unreadable };
  const latest = currentList().find((a) => a.id === id);
  if (!latest)
    return {
      ok: false,
      error: "This assignment no longer exists.",
    };
  return correctProgramStaffAssignment(id, {
    endDate,
    ongoing: false,
  });
}

// ─── Current staff ──────────────────────────────────────────────────────────

/**
 * Whether an assignment is current on `todayIso`: started on or before today
 * and explicitly ongoing, or ending on or after today. A future assignment is
 * not current yet; a missing start, or a missing end that isn't explained by
 * the ongoing flag, can't be shown as current.
 */
export function isCurrentAssignment(
  a: Pick<
    ProgramStaffAssignment,
    "startDate" | "endDate" | "ongoing"
  >,
  todayIso: string,
): boolean {
  if (!a.startDate || a.startDate > todayIso) return false;
  return a.ongoing
    ? true
    : !!a.endDate && todayIso <= a.endDate;
}

/** One Program's current staff by title, derived from recorded dates. */
export function currentStaffForProgram(
  all: ProgramStaffAssignment[],
  programId: number,
  todayIso: string,
): Partial<
  Record<ProgramStaffTitleId, ProgramStaffAssignment[]>
> {
  const out: Partial<
    Record<ProgramStaffTitleId, ProgramStaffAssignment[]>
  > = {};
  for (const a of assignmentsForProgram(all, programId))
    if (
      isRecognizedProgramStaffTitle(a.titleId) &&
      isCurrentAssignment(a, todayIso)
    )
      (out[a.titleId] ??= []).push(a);
  return out;
}

/**
 * Programs a staff member is assigned to today, by their Constituent ID and
 * the recorded dates only (never by name): a future assignment doesn't count
 * yet and an ended one stops after its end date. Any supported title counts
 * as an assignment; what that grants is decided by the caller.
 */
export function programIdsForStaff(
  all: ProgramStaffAssignment[],
  constituentId: number,
  todayIso: string,
): number[] {
  return [
    ...new Set(
      all
        .filter(
          (a) =>
            a.constituentId === constituentId &&
            programStaffTitleLabel(a.titleId) !== undefined &&
            isCurrentAssignment(a, todayIso),
        )
        .map((a) => a.programId),
    ),
  ];
}

// ─── Program save with staff changes ────────────────────────────────────────

/** A staff change captured by the Program form, with explicit dates. */
export type ProgramStaffChange =
  | {
      kind: "add";
      constituentId: number;
      titleId: ProgramStaffTitleId;
      startDate?: string;
      /** Optional extras, set by a new Program's draft assignments (the
       *  Add dialog's fields). Omitted = the role-field behaviour: no End
       *  Date, no Notes, ongoing. */
      endDate?: string;
      notes?: string;
      ongoing?: boolean;
    }
  | {
      kind: "end";
      assignmentId: string;
      endDate: string;
      /** The assignment as it was when the change was planned: if it has
       *  been changed since, the end is refused rather than overriding the
       *  newer change. */
      expected?: ProgramStaffAssignment;
    };

export type ProgramStaffSaveResult =
  | { ok: true; program: ProgramRecord }
  | {
      ok: false;
      error: string;
      /** Per change (by index), for the date entry dialog. */
      changeErrors?: Record<number, string>;
    };

/**
 * Saves a Program together with its staff changes as one operation: a single
 * storage write holds both, so a failure never leaves a partial change.
 * Nothing is written when any change is invalid. Previous
 * assignments are never removed: ending one only records its End Date.
 */
export function saveProgramWithStaffChanges(args: {
  record: ProgramRecord;
  mode: "create" | "edit";
  changes: ProgramStaffChange[];
}): ProgramStaffSaveResult {
  const unreadable = checkWritable();
  if (unreadable) return { ok: false, error: unreadable };
  const staged = stageProgramSave(args.record, args.mode);
  if (!staged.ok)
    return {
      ok: false,
      error:
        staged.reason === "unreadable"
          ? "Saved Programs can't be read, so nothing was changed."
          : "This Program no longer exists.",
    };
  const programId = staged.program.id;

  const next = [...currentList()];
  const changeErrors: Record<number, string> = {};
  const now = new Date().toISOString();
  args.changes.forEach((c, i) => {
    if (c.kind === "add") {
      if (!isStaffConstituent(c.constituentId)) {
        changeErrors[i] = "Select an MHBG Staff member.";
        return;
      }
      const input = {
        programId,
        constituentId: c.constituentId,
        titleId: c.titleId,
        startDate: c.startDate ?? "",
        endDate: c.endDate ?? "",
        ongoing: c.ongoing ?? true,
        notes: c.notes ?? "",
      };
      const e = validateProgramStaffAssignment(
        input,
        () => true,
      );
      if (e.startDate || e.endDate || e.titleId) {
        changeErrors[i] = (e.startDate ??
          e.endDate ??
          e.titleId)!;
        return;
      }
      // Against saved assignments AND earlier additions in this same save.
      if (findDuplicateAssignment(next, input)) {
        changeErrors[i] = MSG_DUPLICATE;
        return;
      }
      next.push({
        ...input,
        id: newId(),
        createdAt: now,
        updatedAt: now,
      });
    } else {
      const idx = next.findIndex(
        (a) => a.id === c.assignmentId,
      );
      const latest = next[idx];
      if (!latest || latest.programId !== programId) {
        changeErrors[i] = "This assignment no longer exists.";
        return;
      }
      if (
        c.expected !== undefined &&
        JSON.stringify(latest) !== JSON.stringify(c.expected)
      ) {
        changeErrors[i] =
          "This assignment was changed elsewhere after you started. Review the latest assignments and try again.";
        return;
      }
      const updated = {
        ...latest,
        endDate: c.endDate,
        ongoing: false,
        updatedAt: now,
      };
      const e = validateProgramStaffAssignment(
        updated,
        () => true,
      );
      if (e.endDate) {
        changeErrors[i] = e.endDate;
        return;
      }
      next[idx] = updated;
    }
  });
  if (Object.keys(changeErrors).length)
    return {
      ok: false,
      error: "Fix the highlighted dates.",
      changeErrors,
    };

  // ONE write stores the Program and its staff changes together. If it
  // fails, storage and memory are both exactly as they were — there is no
  // second write to undo.
  if (
    !commitProgramState({
      programs: staged.programs,
      ...(args.changes.length ? { assignments: next } : {}),
    })
  )
    return { ok: false, error: STORAGE_ERROR };
  return { ok: true, program: staged.program };
}

// ─── Reads for display ──────────────────────────────────────────────────────

/** One Program's assignments, most recent start first; undated last. */
export function assignmentsForProgram(
  all: ProgramStaffAssignment[],
  programId: number,
): ProgramStaffAssignment[] {
  // Every saved assignment of the Program — including ones whose title is
  // not recognized (shown with a fallback label, never hidden).
  return sortAssignments(
    all.filter((a) => a.programId === programId),
  );
}

/** One staff member's assignments (all Programs), same ordering. */
export function assignmentsForStaff(
  all: ProgramStaffAssignment[],
  constituentId: number,
): ProgramStaffAssignment[] {
  return sortAssignments(
    all.filter((a) => a.constituentId === constituentId),
  );
}

function sortAssignments(a: ProgramStaffAssignment[]) {
  return [...a].sort((x, y) => {
    if (!x.startDate !== !y.startDate)
      return x.startDate ? -1 : 1;
    if (x.startDate !== y.startDate)
      return x.startDate < y.startDate ? 1 : -1;
    return x.createdAt < y.createdAt
      ? 1
      : x.createdAt > y.createdAt
        ? -1
        : 0;
  });
}

const NOT_RECORDED = "Not recorded";

const toMdy = (iso: string) => {
  // String slicing only — a Date would shift with the time zone.
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[2]}/${m[3]}/${m[1]}` : "";
};

/**
 * Duration text. "Present" only for an assignment explicitly flagged
 * ongoing; a missing End Date on any other record is "Not recorded".
 */
export function assignmentDuration(
  a: Pick<
    ProgramStaffAssignment,
    "startDate" | "endDate" | "ongoing"
  >,
): string {
  const start = toMdy(a.startDate);
  const end = a.ongoing ? "Present" : toMdy(a.endDate);
  if (!start && !end) return NOT_RECORDED;
  return `${start || NOT_RECORDED} to ${end || NOT_RECORDED}`;
}

/** Test support: re-reads saved data as a page load would. */
export function __reloadProgramStaffAssignmentsForTest() {
  refreshFromStorage();
}