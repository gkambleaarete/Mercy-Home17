// The Program form's staff selection (US 20130), as pure logic so it can be
// checked without the UI.
//
// New selections are MHBG Staff constituents (by Constituent ID) and become
// dated assignments in the shared assignment records. A Program's older
// name-only values stay readable as "legacy" entries until someone replaces
// or removes them; a name is never matched to a constituent.

import {
  currentStaffForProgram,
  type ProgramStaffAssignment,
  type ProgramStaffTitleId,
} from "./programStaffAssignmentStore";
import {
  PROGRAM_STAFF_LEGACY_TITLES,
  PROGRAM_STAFF_TITLES,
} from "./programStaffAssignmentStore";
import type { ProgramRecord } from "./mockProgramsData";

export type StaffEntry =
  { kind: "id"; id: number } | { kind: "legacy"; name: string };

export type StaffSelection = Record<
  ProgramStaffTitleId,
  StaffEntry[]
>;

/** Single-value titles and the Program record field holding a legacy name.
 *  Only these five have a lookup field on the Program record; no new one is
 *  invented for the other titles. */
export const SINGLE_TITLE_FIELD = {
  "program-manager": "programManager",
  therapist: "therapist",
  supervisor: "supervisor",
  "ecr-coordinator": "ecrCoordinator",
  "day-coordinator": "dayCoordinator",
} as const;

/** The Program form's multi-person title; its legacy name-only values live
 *  in Program.youthCareWorkers. */
export const MULTI_TITLE: ProgramStaffTitleId =
  "youth-care-worker-only";

/**
 * The titles the existing Program form edits: the five single-value titles
 * plus Youth Care Worker. Transition Coach (no Program lookup field) and a
 * record saved under the old combined title are not changed by that form —
 * they stay in the assignment records and Staff History until the
 * assignment screens handle them.
 */
export const PROGRAM_FORM_TITLES = PROGRAM_STAFF_TITLES.filter(
  (t) =>
    t.id === MULTI_TITLE ||
    (t.id as string) in SINGLE_TITLE_FIELD,
);
/** The single-value subset (everything the form edits except MULTI_TITLE). */
export const PROGRAM_FORM_SINGLE_TITLES =
  PROGRAM_FORM_TITLES.filter((t) => t.id !== MULTI_TITLE);

export interface InitialStaffSelection {
  selection: StaffSelection;
  /** Single-value titles with more than one current holder (set through
   *  the Constituent Profile): shown, but not editable here. */
  locked: ProgramStaffTitleId[];
  /** Titles that showed a legacy name-only value when the form opened. */
  legacyShown: ProgramStaffTitleId[];
}

const emptySelection = (): StaffSelection =>
  Object.fromEntries(
    [
      ...PROGRAM_STAFF_TITLES,
      ...PROGRAM_STAFF_LEGACY_TITLES,
    ].map((t) => [t.id, [] as StaffEntry[]]),
  ) as StaffSelection;

/**
 * Current staff = recorded assignments that are current today, and nothing
 * else (no fallback to the Program's legacy name-only values).
 */
export function initialStaffSelection(
  program: ProgramRecord | null,
  all: ProgramStaffAssignment[],
  todayIso: string,
): InitialStaffSelection {
  const selection = emptySelection();
  const locked: ProgramStaffTitleId[] = [];
  const legacyShown: ProgramStaffTitleId[] = [];
  if (!program) return { selection, locked, legacyShown };
  const current = currentStaffForProgram(
    all,
    program.id,
    todayIso,
  );
  for (const { id } of PROGRAM_FORM_TITLES) {
    const holders = current[id] ?? [];
    if (holders.length) {
      const ids = [
        ...new Set(holders.map((h) => h.constituentId)),
      ];
      selection[id] = ids.map((cid) => ({
        kind: "id",
        id: cid,
      }));
      if (id !== MULTI_TITLE && ids.length > 1) locked.push(id);
      continue;
    }
    // No current assignment: the title stays empty. The Program's older
    // name-only values are not shown, so this always matches the assignments.
  }
  return { selection, locked, legacyShown };
}

/**
 * Staff currently holding an assignment saved under the old combined title
 * ("Youth Care Worker / Transition Coach"), by Constituent ID, from the same
 * current-staff rules as everything else. Shown read-only by the Program
 * form; never treated as either new title and never changed by it.
 */
export function currentLegacyCombinedHolders(
  programId: number | null,
  all: ProgramStaffAssignment[],
  todayIso: string,
): number[] {
  if (programId === null) return [];
  const legacyId = PROGRAM_STAFF_LEGACY_TITLES[0].id;
  const holders =
    currentStaffForProgram(all, programId, todayIso)[
      legacyId
    ] ?? [];
  return [...new Set(holders.map((h) => h.constituentId))];
}

/** Entries the user actually changed in the Program form, by title. The
 *  baseline is what that title showed when the user first touched it. */
export type StaffEdits = Partial<
  Record<
    ProgramStaffTitleId,
    { baseline: StaffEntry[]; entries: StaffEntry[] }
  >
>;

const entryKeyOf = (e: StaffEntry) =>
  e.kind === "id" ? `id:${e.id}` : `legacy:${e.name}`;
const sameEntries = (a: StaffEntry[], b: StaffEntry[]) =>
  JSON.stringify(a.map(entryKeyOf).sort()) ===
  JSON.stringify(b.map(entryKeyOf).sort());

/**
 * What the form shows: titles the user has NOT touched always follow the
 * latest shared assignments (so a separately saved assignment appears and is
 * never undone); titles the user edited keep their edit.
 */
export function effectiveStaffSelection(
  live: InitialStaffSelection,
  edits: StaffEdits,
): InitialStaffSelection {
  const selection = { ...live.selection };
  for (const [t, e] of Object.entries(edits))
    if (e) selection[t as ProgramStaffTitleId] = e.entries;
  return { ...live, selection };
}

/** Edited titles whose current holders changed since the user touched them
 *  (saved elsewhere meanwhile) — saving those edits would silently override
 *  newer assignments. */
export function staffEditConflicts(
  program: ProgramRecord | null,
  edits: StaffEdits,
  all: ProgramStaffAssignment[],
  todayIso: string,
): ProgramStaffTitleId[] {
  const latest = initialStaffSelection(
    program,
    all,
    todayIso,
  ).selection;
  return (
    Object.entries(edits) as [
      ProgramStaffTitleId,
      NonNullable<StaffEdits[ProgramStaffTitleId]>,
    ][]
  )
    .filter(
      ([t, e]) => !sameEntries(latest[t] ?? [], e.baseline),
    )
    .map(([t]) => t);
}

export type PendingStaffChange =
  | {
      kind: "add";
      constituentId: number;
      titleId: ProgramStaffTitleId;
    }
  | { kind: "end"; assignment: ProgramStaffAssignment };

/**
 * What the selection changes against the latest recorded current staff:
 * a person no longer selected is ended, a newly selected person is added.
 * (Replacing, and moving someone to another title, are an end plus an add —
 * the previous assignment is always kept.) Locked titles are never changed.
 */
export function planStaffChanges(
  programId: number | null,
  selection: StaffSelection,
  locked: ProgramStaffTitleId[],
  all: ProgramStaffAssignment[],
  todayIso: string,
  /** Only these titles are planned (the ones the user edited). Omitted =
   *  every title, as before. */
  only?: ProgramStaffTitleId[],
): PendingStaffChange[] {
  const current =
    programId === null
      ? {}
      : currentStaffForProgram(all, programId, todayIso);
  const ends: PendingStaffChange[] = [];
  const adds: PendingStaffChange[] = [];
  for (const { id } of PROGRAM_FORM_TITLES) {
    if (locked.includes(id)) continue;
    if (only && !only.includes(id)) continue;
    const holders = current[id] ?? [];
    const wanted = new Set(
      selection[id].flatMap((e) =>
        e.kind === "id" ? [e.id] : [],
      ),
    );
    for (const h of holders)
      if (!wanted.has(h.constituentId))
        ends.push({ kind: "end", assignment: h });
    const held = new Set(holders.map((h) => h.constituentId));
    for (const cid of wanted)
      if (!held.has(cid))
        adds.push({
          kind: "add",
          constituentId: cid,
          titleId: id,
        });
  }
  return [...ends, ...adds];
}

/**
 * The Program record's legacy name-only fields after the edit: a legacy value
 * the user kept stays; one they replaced or removed is cleared; a title that
 * never showed a legacy value is left exactly as saved.
 */
export function applyLegacyFields(
  record: ProgramRecord,
  selection: StaffSelection,
  legacyShown: ProgramStaffTitleId[],
): ProgramRecord {
  const next = { ...record };
  for (const { id } of PROGRAM_FORM_TITLES) {
    if (!legacyShown.includes(id)) continue;
    const kept = selection[id].flatMap((e) =>
      e.kind === "legacy" ? [e.name] : [],
    );
    if (id === MULTI_TITLE) next.youthCareWorkers = kept;
    else
      next[
        SINGLE_TITLE_FIELD[
          id as keyof typeof SINGLE_TITLE_FIELD
        ]
      ] = kept[0] ?? "";
  }
  return next;
}