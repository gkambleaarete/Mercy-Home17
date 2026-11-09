// Shared data for the Program List (Programs.tsx) and the Program Record
// page (ProgramRecordPage.tsx) — both read/write the same Program and
// Capacity Snapshot records, so their types/mock data/resolvers live
// together here rather than duplicated per page (mirrors the pattern in
// mockTutorApplicantData.ts).

import type { ProgramStaffAssignment } from "./programStaffAssignmentStore";
import {
  US20130_DEMO_ASSIGNMENTS,
  US20130_DEMO_SEED_ID,
} from "./programStaffDemoSeed";

export type ProgramStatus = "Active" | "Inactive";

export interface ProgramRecord {
  id: number;
  campus: string;
  name: string;
  programType: string;
  ageRange: string;
  description: string;
  /** ISO "YYYY-MM-DD" (17673). */
  startDate: string;
  /** ISO "YYYY-MM-DD", or "" when the Program is ongoing (17673). */
  endDate: string;
  // Active Constituents — used alongside the effective Capacity Snapshot to
  // render the List View's "Active / Capacity" column and the Program
  // Record's "Active Youth" section.
  activeConstituents: number;
  // System-derived from Start/End Date (see deriveProgramStatus) — never
  // edited directly; getPrograms() always returns it freshly resolved.
  status: ProgramStatus;
  // Staff Associations
  programManager: string;
  therapist: string;
  supervisor: string;
  ecrCoordinator: string;
  dayCoordinator: string;
  youthCareWorkers: string[];
}

// Capacity is not a field on ProgramRecord. It is resolved at read time from
// CapacitySnapshot history, which is the single authoritative source: the
// current effective Capacity for a program is the capacity of the snapshot
// with the latest effectiveDate that is <= today.
export interface CapacitySnapshot {
  id: number;
  programId: number;
  capacity: number;
  /** ISO "YYYY-MM-DD" — stored in ISO so string comparison sorts correctly. */
  effectiveDate: string;
  createdBy: string;
  /** ISO timestamp */
  createdAt: string;
}

export type CapacityStatus =
  "Current" | "Scheduled" | "Historical";

// ─── Constants ────────────────────────────────────────────────────────────────

export const CAMPUS_OPTIONS = ["Walsh", "West Loop"];

export const PROGRAM_TYPE_OPTIONS = [
  "Residential Treatment",
  "Independent Living",
  "Day Program",
  "Outpatient Services",
  "Emergency Shelter",
];

export const AGE_RANGE_OPTIONS = [
  "Middle School",
  "High School",
  "Young Adult",
];

export const PROGRAM_STATUS_OPTIONS: ProgramStatus[] = [
  "Active",
  "Inactive",
];

export const STAFF_OPTIONS = [
  "Amanda Cole",
  "Angela Kim",
  "Andrew Ross",
  "Boris Shaw",
  "Brian King",
  "Carlos Vega",
  "Chester Mills",
  "Chloe Adams",
  "Denise Carter",
  "Derek Stone",
  "Derrick Owens",
  "Diane Cooper",
  "Dorothy Hayes",
  "Dr. Alan Ross",
  "Dr. Brian Lowe",
  "Dr. Claire Simmons",
  "Dr. Hannah Pierce",
  "Dr. Martin Green",
  "Dr. Philip Jordan",
  "Dr. Susan Park",
  "Elena Morris",
  "Felicia Scott",
  "George Martin",
  "Gloria Nguyen",
  "Iris Fleming",
  "Ivan Cruz",
  "Jackie Freeman",
  "James Wu",
  "Jessica Allen",
  "Kayla Murphy",
  "Kevin Park",
  "Leon Webb",
  "Linda Moore",
  "Lucy Chen",
  "Marcus Bell",
  "Marie Granger",
  "Monica Grant",
  "Nathan Ford",
  "Nia Johnson",
  "Nina Holland",
  "Omar Henderson",
  "Patrick Walsh",
  "Paul Rivera",
  "Priya Nair",
  "Rachel Torres",
  "Roy Lewis",
  "Russell Ward",
  "Samantha Ellis",
  "Sandra Lee",
  "Sophia Reyes",
  "Steve Huang",
  "Tina Brooks",
  "Tom Diaz",
  "Trevor Black",
  "Veronica Miles",
  "Victor Lang",
];

// Demo stand-in for the current logged-in user's display name (used as
// "Changed By" on new Capacity Snapshots). Mirrors the CURRENT_USER pattern
// already used elsewhere in the app (see layout/UtilityBar.tsx) rather than
// inventing a new auth concept.
export const CURRENT_USER_NAME = "Gaurav Kamble";

// Demo stand-in for the current user's System Admin role (17673/19845):
// gates Create, Edit and Update Capacity. Same convention as
// isSystemAdministrator in admissions/LeadDetailView.tsx — set to false to
// test the read-only non-admin experience.
export const CURRENT_USER_IS_SYSTEM_ADMIN = true;

/**
 * The current user's MHBG Staff Constituent ID, used to find their Program
 * assignments (never inferred from CURRENT_USER_NAME). The prototype has no
 * current-user constituent id yet, so this is null — which means a
 * non-admin gets no assignment-based Program access until it is provided.
 */
export const CURRENT_USER_CONSTITUENT_ID: number | null = null;

// ─── Mock Data (seed) ───────────────────────────────────────────────────────

const SEED_PROGRAMS: ProgramRecord[] = [
  {
    id: 1,
    campus: "Walsh",
    name: "Self-Awareness",
    programType: "Residential Treatment",
    activeConstituents: 9,
    ageRange: "High School",
    description: "It's inside you!",
    startDate: "2019-08-15",
    endDate: "",
    status: "Active",
    programManager: "Marie Granger",
    therapist: "Dr. Brian Lowe",
    supervisor: "Denise Carter",
    ecrCoordinator: "James Wu",
    dayCoordinator: "Tom Diaz",
    youthCareWorkers: ["Angela Kim", "Kevin Park"],
  },
  {
    id: 2,
    campus: "West Loop",
    name: "A Program #2",
    programType: "Day Program",
    activeConstituents: 2,
    ageRange: "Middle School",
    description: "A test program",
    startDate: "2022-01-10",
    endDate: "2025-06-30",
    status: "Inactive",
    programManager: "",
    therapist: "",
    supervisor: "",
    ecrCoordinator: "",
    dayCoordinator: "",
    youthCareWorkers: [],
  },
  {
    id: 3,
    campus: "Walsh",
    name: "Bernardin",
    programType: "Residential Treatment",
    activeConstituents: 5,
    ageRange: "Young Adult",
    description: "Residential program for on-campus youth",
    startDate: "2018-09-01",
    endDate: "",
    status: "Active",
    programManager: "Patrick Walsh",
    therapist: "Dr. Susan Park",
    supervisor: "Omar Henderson",
    ecrCoordinator: "Paul Rivera",
    dayCoordinator: "Rachel Torres",
    youthCareWorkers: ["Marcus Bell", "Tina Brooks"],
  },
  {
    id: 4,
    campus: "Walsh",
    name: "Couderc",
    programType: "Residential Treatment",
    activeConstituents: 8,
    ageRange: "High School",
    description: "Residential program for on-campus youth",
    startDate: "2020-01-06",
    endDate: "",
    status: "Active",
    programManager: "Linda Moore",
    therapist: "Dr. Martin Green",
    supervisor: "Roy Lewis",
    ecrCoordinator: "Derek Stone",
    dayCoordinator: "Carlos Vega",
    youthCareWorkers: ["Jessica Allen", "Amanda Cole"],
  },
  {
    id: 5,
    campus: "Walsh",
    name: "Seton",
    programType: "Residential Treatment",
    activeConstituents: 7,
    ageRange: "Middle School",
    description: "Residential program for on-campus youth",
    startDate: "2021-03-01",
    endDate: "",
    status: "Active",
    programManager: "Dorothy Hayes",
    therapist: "Dr. Alan Ross",
    supervisor: "Brian King",
    ecrCoordinator: "Steve Huang",
    dayCoordinator: "Ivan Cruz",
    youthCareWorkers: ["Priya Nair", "Felicia Scott"],
  },
  {
    id: 6,
    campus: "West Loop",
    name: "Bosco",
    programType: "Day Program",
    activeConstituents: 9,
    ageRange: "High School",
    description: "Residential program for on-campus youth",
    startDate: "2023-08-21",
    endDate: "",
    status: "Active",
    programManager: "Veronica Miles",
    therapist: "Dr. Hannah Pierce",
    supervisor: "Iris Fleming",
    ecrCoordinator: "Diane Cooper",
    dayCoordinator: "George Martin",
    youthCareWorkers: ["Lucy Chen", "Leon Webb"],
  },
  {
    id: 7,
    campus: "West Loop",
    name: "Campbell",
    programType: "Independent Living",
    activeConstituents: 6,
    ageRange: "Young Adult",
    description: "Residential program for on-campus youth",
    startDate: "2019-05-01",
    endDate: "2025-12-31",
    status: "Inactive",
    programManager: "Nathan Ford",
    therapist: "Dr. Claire Simmons",
    supervisor: "Russell Ward",
    ecrCoordinator: "Victor Lang",
    dayCoordinator: "Sophia Reyes",
    youthCareWorkers: ["Derrick Owens", "Kayla Murphy"],
  },
  {
    id: 8,
    campus: "West Loop",
    name: "Cooke",
    programType: "Emergency Shelter",
    activeConstituents: 10,
    ageRange: "High School",
    description: "Residential program for on-campus youth",
    startDate: "2024-02-01",
    endDate: "",
    status: "Active",
    programManager: "Gloria Nguyen",
    therapist: "Dr. Philip Jordan",
    supervisor: "Chester Mills",
    ecrCoordinator: "Boris Shaw",
    dayCoordinator: "Trevor Black",
    youthCareWorkers: ["Samantha Ellis", "Nina Holland"],
  },
];

// Seed history: one baseline "current" snapshot per program (dated safely in
// the past), plus one future/Scheduled snapshot on Bernardin so the feature's
// current-vs-upcoming behavior is visible without any manual setup.
const SEED_CAPACITY_SNAPSHOTS: CapacitySnapshot[] = [
  {
    id: 1001,
    programId: 1,
    capacity: 12,
    effectiveDate: "2024-01-01",
    createdBy: "System (Initial Import)",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 1002,
    programId: 2,
    capacity: 3,
    effectiveDate: "2024-01-01",
    createdBy: "System (Initial Import)",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 1003,
    programId: 3,
    capacity: 6,
    effectiveDate: "2024-01-01",
    createdBy: "System (Initial Import)",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 1004,
    programId: 3,
    capacity: 8,
    effectiveDate: "2026-10-15",
    createdBy: "System (Initial Import)",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 1005,
    programId: 4,
    capacity: 10,
    effectiveDate: "2024-01-01",
    createdBy: "System (Initial Import)",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 1006,
    programId: 5,
    capacity: 10,
    effectiveDate: "2024-01-01",
    createdBy: "System (Initial Import)",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 1007,
    programId: 6,
    capacity: 10,
    effectiveDate: "2024-01-01",
    createdBy: "System (Initial Import)",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 1008,
    programId: 7,
    capacity: 10,
    effectiveDate: "2024-01-01",
    createdBy: "System (Initial Import)",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 1009,
    programId: 8,
    capacity: 10,
    effectiveDate: "2024-01-01",
    createdBy: "System (Initial Import)",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

// ─── Module-level store ─────────────────────────────────────────────────────
// Programs, Capacity Snapshots and staff title assignments are ONE persisted
// state in one versioned localStorage key, so every logical change (e.g. a
// Program edit together with its staff changes) is a single write: either all
// of it is stored or none of it is, with nothing to roll back. The seeds are
// only the defaults for a browser with nothing saved; once anything is saved
// the full saved list is authoritative (a deleted seed stays deleted).
//
// Saved data that cannot be read is reported ("unreadable") and never
// overwritten: reads return nothing and every write is refused. Memory
// changes only after the storage write succeeded.
//
// Earlier builds kept Programs ("mh.programs.v1") and assignments
// ("mh.programStaffAssignments.v1") in two keys. They are migrated into the
// one state on load: both sources are validated first, the complete new
// state is written, and only then are the old keys retired. If either old
// key can't be read, nothing is migrated and the old data is left as is.

const STORAGE_KEY = "mh.programData.v2";
const LEGACY_PROGRAMS_KEY = "mh.programs.v1";
const LEGACY_ASSIGNMENTS_KEY = "mh.programStaffAssignments.v1";

interface Persisted {
  version: 2;
  programs: ProgramRecord[];
  capacitySnapshots: CapacitySnapshot[];
  assignments: ProgramStaffAssignment[];
  /** Additive demo seeds already applied (absent in older saved state). */
  appliedSeeds?: string[];
}

type StoredState = Required<Omit<Persisted, "version">>;

export type ProgramDataStatus = "ok" | "unreadable";

export type ProgramWriteResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        "unreadable" | "storage" | "not-found" | "conflict";
    };

const isProgramRecord = (v: unknown): v is ProgramRecord => {
  const p = v as Partial<ProgramRecord> | null;
  return (
    !!p &&
    typeof p.id === "number" &&
    typeof p.name === "string" &&
    typeof p.startDate === "string" &&
    typeof p.endDate === "string" &&
    Array.isArray(p.youthCareWorkers)
  );
};
const isSnapshot = (v: unknown): v is CapacitySnapshot => {
  const s = v as Partial<CapacitySnapshot> | null;
  return (
    !!s &&
    typeof s.id === "number" &&
    typeof s.programId === "number" &&
    typeof s.capacity === "number" &&
    typeof s.effectiveDate === "string"
  );
};
/** Records saved before Notes existed load with empty Notes; nothing else
 *  changes (and the same object is returned when nothing is missing). */
function withNotes(
  a: ProgramStaffAssignment,
): ProgramStaffAssignment {
  return typeof a.notes === "string" ? a : { ...a, notes: "" };
}
function isAssignment(v: unknown): v is ProgramStaffAssignment {
  const a = v as Partial<ProgramStaffAssignment> | null;
  return (
    !!a &&
    typeof a.id === "string" &&
    typeof a.programId === "number" &&
    typeof a.constituentId === "number" &&
    typeof a.titleId === "string" &&
    typeof a.startDate === "string" &&
    typeof a.endDate === "string" &&
    typeof a.ongoing === "boolean" &&
    (a.notes === undefined || typeof a.notes === "string") &&
    typeof a.createdAt === "string" &&
    typeof a.updatedAt === "string"
  );
}

// Test seam: lets tests start from a state without the demo staff history.
let demoSeedEnabled = true;
export function __setDemoSeedEnabledForTest(on: boolean): void {
  demoSeedEnabled = on;
}

/**
 * Additive, once-only demo seed (US 20130): adds the fictional demo staff
 * assignments for built-in demo Programs that still exist. It never changes
 * or removes anything already saved, skips Programs that were deleted, skips
 * records whose id is already present, and — because the applied marker is
 * stored with the state — doesn't bring back demo records a user later
 * corrected away from or that were otherwise removed.
 */
function applyDemoStaffSeed(state: StoredState): {
  state: StoredState;
  changed: boolean;
} {
  if (
    !demoSeedEnabled ||
    state.appliedSeeds.includes(US20130_DEMO_SEED_ID)
  )
    return { state, changed: false };
  const programIds = new Set(state.programs.map((p) => p.id));
  const have = new Set(state.assignments.map((a) => a.id));
  const add = US20130_DEMO_ASSIGNMENTS.filter(
    (a) => programIds.has(a.programId) && !have.has(a.id),
  );
  return {
    state: {
      ...state,
      assignments: [...state.assignments, ...add],
      appliedSeeds: [
        ...state.appliedSeeds,
        US20130_DEMO_SEED_ID,
      ],
    },
    changed: true,
  };
}

const seedState = (): StoredState =>
  applyDemoStaffSeed({
    programs: [...SEED_PROGRAMS],
    capacitySnapshots: [...SEED_CAPACITY_SNAPSHOTS],
    assignments: [],
    appliedSeeds: [],
  }).state;

/** Parses one saved blob; null when it isn't valid. */
function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeRaw(state: StoredState): boolean {
  try {
    const body: Persisted = { version: 2, ...state };
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(body),
    );
    return true;
  } catch {
    return false;
  }
}

/** Retires the two old keys once the complete new state is stored. */
function retireLegacyKeys() {
  try {
    window.localStorage.removeItem(LEGACY_PROGRAMS_KEY);
    window.localStorage.removeItem(LEGACY_ASSIGNMENTS_KEY);
  } catch {
    // The new key already holds everything and takes precedence.
  }
}

function loadSaved(): {
  state: StoredState;
  status: ProgramDataStatus;
} {
  const unreadable = {
    state: {
      programs: [],
      capacitySnapshots: [],
      assignments: [],
      appliedSeeds: [],
    },
    status: "unreadable" as const,
  };
  let current: string | null;
  let oldPrograms: string | null;
  let oldAssignments: string | null;
  try {
    current = window.localStorage.getItem(STORAGE_KEY);
    oldPrograms = window.localStorage.getItem(
      LEGACY_PROGRAMS_KEY,
    );
    oldAssignments = window.localStorage.getItem(
      LEGACY_ASSIGNMENTS_KEY,
    );
  } catch {
    // Storage blocked: run on the defaults; writes will fail visibly.
    return { state: seedState(), status: "ok" };
  }

  if (current !== null) {
    const p = parseJson(current) as Partial<Persisted> | null;
    if (
      p &&
      p.version === 2 &&
      Array.isArray(p.programs) &&
      Array.isArray(p.capacitySnapshots) &&
      Array.isArray(p.assignments) &&
      p.programs.every(isProgramRecord) &&
      p.capacitySnapshots.every(isSnapshot) &&
      p.assignments.every(isAssignment) &&
      (p.appliedSeeds === undefined ||
        (Array.isArray(p.appliedSeeds) &&
          p.appliedSeeds.every((x) => typeof x === "string")))
    ) {
      // Old keys left behind (e.g. a failed cleanup) are never merged in.
      if (oldPrograms !== null || oldAssignments !== null)
        retireLegacyKeys();
      const seeded = applyDemoStaffSeed({
        programs: p.programs,
        capacitySnapshots: p.capacitySnapshots,
        assignments: p.assignments.map(withNotes),
        appliedSeeds: p.appliedSeeds ?? [],
      });
      // Persist the one-time seed; if that write fails it is simply
      // retried on the next load (records are never duplicated).
      if (seeded.changed) writeRaw(seeded.state);
      return { state: seeded.state, status: "ok" };
    }
    return unreadable;
  }

  if (oldPrograms === null && oldAssignments === null)
    return { state: seedState(), status: "ok" };

  // ── Migration: validate BOTH sources before anything is written. ──
  const state = seedState();
  if (oldPrograms !== null) {
    const p = parseJson(oldPrograms) as {
      version?: number;
      programs?: unknown;
      capacitySnapshots?: unknown;
    } | null;
    if (
      !p ||
      p.version !== 1 ||
      !Array.isArray(p.programs) ||
      !Array.isArray(p.capacitySnapshots) ||
      !p.programs.every(isProgramRecord) ||
      !p.capacitySnapshots.every(isSnapshot)
    )
      return unreadable;
    state.programs = p.programs;
    state.capacitySnapshots = p.capacitySnapshots;
  }
  if (oldAssignments !== null) {
    const a = parseJson(oldAssignments) as {
      version?: number;
      assignments?: unknown;
    } | null;
    if (
      !a ||
      a.version !== 1 ||
      !Array.isArray(a.assignments) ||
      !a.assignments.every(isAssignment)
    )
      return unreadable;
    state.assignments = a.assignments.map(withNotes);
  }
  // The one-time demo seed is added in the same single write.
  const migrated = applyDemoStaffSeed({
    ...state,
    appliedSeeds: [],
  }).state;
  // Old keys are retired only after the complete new state is stored; if
  // that write fails they stay untouched and keep being served as-is.
  if (writeRaw(migrated)) retireLegacyKeys();
  return { state: migrated, status: "ok" };
}

let initial = loadSaved();
let programs: ProgramRecord[] = initial.state.programs;
let capacitySnapshots: CapacitySnapshot[] =
  initial.state.capacitySnapshots;
let assignments: ProgramStaffAssignment[] =
  initial.state.assignments;
let appliedSeeds: string[] = initial.state.appliedSeeds;
let dataStatus: ProgramDataStatus = initial.status;

const stateListeners = new Set<() => void>();
const notifyState = () => stateListeners.forEach((l) => l());

/** Subscribes to any change of the persisted Program / assignment state. */
export function subscribeProgramState(l: () => void) {
  stateListeners.add(l);
  return () => stateListeners.delete(l);
}

/** Re-reads saved data so a write builds on the latest copy (another tab
 *  may have saved since this one loaded). */
export function refreshProgramsFromStorage(): ProgramDataStatus {
  initial = loadSaved();
  const changed =
    JSON.stringify([
      initial.state.programs,
      initial.state.capacitySnapshots,
      initial.state.assignments,
      initial.state.appliedSeeds,
      initial.status,
    ]) !==
    JSON.stringify([
      programs,
      capacitySnapshots,
      assignments,
      appliedSeeds,
      dataStatus,
    ]);
  if (changed) {
    programs = initial.state.programs;
    capacitySnapshots = initial.state.capacitySnapshots;
    assignments = initial.state.assignments;
    appliedSeeds = initial.state.appliedSeeds;
    dataStatus = initial.status;
    notifyState();
  }
  return dataStatus;
}

if (typeof window !== "undefined")
  window.addEventListener("storage", (e) => {
    if (
      e.key === STORAGE_KEY ||
      e.key === LEGACY_PROGRAMS_KEY ||
      e.key === LEGACY_ASSIGNMENTS_KEY ||
      e.key === null
    )
      refreshProgramsFromStorage();
  });

/** Whether saved Program data could be read. */
export function getProgramDataStatus(): ProgramDataStatus {
  return dataStatus;
}

/** The saved staff assignments (shared with the Program Record). */
export function getStoredAssignments(): {
  status: ProgramDataStatus;
  assignments: ProgramStaffAssignment[];
} {
  return { status: dataStatus, assignments };
}

/**
 * The one write path: applies a logical change to the persisted state with a
 * single all-or-nothing storage write. Memory and subscribers change only if
 * storage accepted it, so a failure leaves everything as it was.
 */
export function commitProgramState(
  patch: Partial<StoredState>,
): boolean {
  if (dataStatus !== "ok") return false;
  const next: StoredState = {
    programs: patch.programs ?? programs,
    capacitySnapshots:
      patch.capacitySnapshots ?? capacitySnapshots,
    assignments: patch.assignments ?? assignments,
    appliedSeeds,
  };
  if (!writeRaw(next)) return false;
  programs = next.programs;
  capacitySnapshots = next.capacitySnapshots;
  assignments = next.assignments;
  retireLegacyKeys();
  notifyState();
  return true;
}

// Status is resolved as of today on every read, so it changes automatically
// as Start/End Dates pass.
function withDerivedStatus(p: ProgramRecord): ProgramRecord {
  const status = deriveProgramStatus(
    p.startDate,
    p.endDate,
    todayIso(),
  );
  return status === p.status ? p : { ...p, status };
}

export function getPrograms(): ProgramRecord[] {
  return programs.map(withDerivedStatus);
}

/** Next unique Program id — never reuses an id, and larger than any saved. */
function nextProgramId(): number {
  return Math.max(Date.now(), ...programs.map((p) => p.id + 1));
}

/**
 * Prepares a Program save without writing it, so a caller can store it
 * together with other changes (staff assignments) in the one commit. For
 * "create" the record's id is assigned here.
 */
export function stageProgramSave(
  record: ProgramRecord,
  mode: "create" | "edit",
):
  | {
      ok: true;
      program: ProgramRecord;
      programs: ProgramRecord[];
    }
  | { ok: false; reason: "unreadable" | "not-found" } {
  if (refreshProgramsFromStorage() !== "ok")
    return { ok: false, reason: "unreadable" };
  if (mode === "create") {
    const program = { ...record, id: nextProgramId() };
    return {
      ok: true,
      program,
      programs: [program, ...programs],
    };
  }
  if (!programs.some((p) => p.id === record.id))
    return { ok: false, reason: "not-found" };
  return {
    ok: true,
    program: record,
    programs: programs.map((p) =>
      p.id === record.id ? record : p,
    ),
  };
}

/** Saves a Program on its own (no staff changes). */
export function saveProgramRecord(
  record: ProgramRecord,
  mode: "create" | "edit",
):
  | { ok: true; program: ProgramRecord }
  | {
      ok: false;
      reason: "unreadable" | "not-found" | "storage";
    } {
  const staged = stageProgramSave(record, mode);
  if (!staged.ok) return staged;
  return commitProgramState({ programs: staged.programs })
    ? { ok: true, program: staged.program }
    : { ok: false, reason: "storage" };
}

/** Removes one Program by id from the shared store (US 19845 Delete).
 *  Callers must check related records first — see programDeletion.ts. */
export function deleteProgramById(
  id: number,
): "deleted" | "not-found" | "unreadable" | "storage" {
  if (refreshProgramsFromStorage() !== "ok")
    return "unreadable";
  if (!programs.some((p) => p.id === id)) return "not-found";
  return commitProgramState({
    programs: programs.filter((p) => p.id !== id),
  })
    ? "deleted"
    : "storage";
}

export function getCapacitySnapshots(): CapacitySnapshot[] {
  return capacitySnapshots;
}

/** Next unique Capacity Snapshot id (max existing + 1) — unlike Date.now(),
 *  can't collide when two snapshots are created in the same millisecond. */
export function nextCapacitySnapshotId(): number {
  return (
    capacitySnapshots.reduce(
      (max, s) => Math.max(max, s.id),
      0,
    ) + 1
  );
}

/** Appends one Capacity Snapshot (history is never rewritten). */
export function addCapacitySnapshot(
  snapshot: CapacitySnapshot,
): ProgramWriteResult {
  if (refreshProgramsFromStorage() !== "ok")
    return { ok: false, reason: "unreadable" };
  if (capacitySnapshots.some((s) => s.id === snapshot.id))
    return { ok: false, reason: "conflict" };
  return commitProgramState({
    capacitySnapshots: [...capacitySnapshots, snapshot],
  })
    ? { ok: true }
    : { ok: false, reason: "storage" };
}

export function getProgramById(
  id: number,
): ProgramRecord | undefined {
  const p = programs.find((p) => p.id === id);
  return p && withDerivedStatus(p);
}

/** Test support: re-reads saved data as a page load would. */
export function __reloadProgramsForTest(): void {
  refreshProgramsFromStorage();
}

// ─── Staff associations (17673) ────────────────────────────────────────────
// Name-only role fields on the Program record: the older, undated way staff
// were recorded. New staff selections are dated assignments in
// programStaffAssignmentStore.ts (by Program ID and Constituent ID); these
// fields are only read for names that haven't been resolved yet.

export const STAFF_ROLE_FIELDS = [
  { field: "programManager", label: "Program Manager" },
  { field: "therapist", label: "Therapist" },
  { field: "supervisor", label: "Supervisor" },
  { field: "ecrCoordinator", label: "ECR Coordinator" },
  { field: "dayCoordinator", label: "Day Coordinator" },
] as const;

export const YOUTH_CARE_WORKERS_LABEL =
  "Youth Care Workers / Transition Coaches";

export interface StaffProgramAssociation {
  program: ProgramRecord;
  role: string;
}

/** Staff → Program: every Program (and role) a staff member is associated
 *  with, read from the Program records themselves. */
export function getProgramAssociationsForStaff(
  staffName: string,
): StaffProgramAssociation[] {
  return getPrograms().flatMap((program) => [
    ...STAFF_ROLE_FIELDS.filter(
      ({ field }) => program[field] === staffName,
    ).map(({ label }) => ({ program, role: label })),
    ...(program.youthCareWorkers.includes(staffName)
      ? [{ program, role: YOUTH_CARE_WORKERS_LABEL }]
      : []),
  ]);
}

export type ProgramStaffField =
  | (typeof STAFF_ROLE_FIELDS)[number]["field"]
  | "youthCareWorkers";

/** 17673: Active when Start Date <= today and (End Date is blank or
 *  today <= End Date); otherwise Inactive. ISO strings compare correctly. */
export function deriveProgramStatus(
  startDate: string,
  endDate: string,
  asOfIso: string,
): ProgramStatus {
  if (!startDate || asOfIso < startDate) return "Inactive";
  if (endDate && asOfIso > endDate) return "Inactive";
  return "Active";
}

// ─── Capacity resolution helpers ───────────────────────────────────────────
// Capacity Snapshot history is the single authoritative source for Capacity.
// These helpers resolve the effective Capacity for a program as of any given
// date, purely from the snapshot list — nothing else stores or caches
// Capacity. Shared by the Program List (Active/Capacity column), the Program
// Record (Current/Upcoming Capacity + Capacity History), and available for
// reuse by any future Admissions Projections/Waitlist capacity calculations.

export function todayIso(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Mirrors DateInput's own (unexported) MM/DD/YYYY validity check. */
export function isValidMdy(val: string): boolean {
  if (val.length !== 10) return false;
  const parts = val.split("/");
  if (parts.length !== 3) return false;
  const [mm, dd, yyyy] = parts.map(Number);
  if (!mm || !dd || !yyyy) return false;
  if (mm < 1 || mm > 12) return false;
  if (dd < 1 || dd > 31) return false;
  if (yyyy < 1900 || yyyy > 2100) return false;
  const date = new Date(yyyy, mm - 1, dd);
  return date.getMonth() === mm - 1 && date.getDate() === dd;
}

export function formatCapacity(
  capacity: number | null,
): string {
  if (capacity === null) return "";
  return `${capacity} bed${capacity === 1 ? "" : "s"}`;
}

/** ISO "YYYY-MM-DD" shifted by `days` (may be negative). */
function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${mm}-${dd}`;
}

/**
 * The snapshot that is in effect as of `asOfIso`: the latest effectiveDate
 * that is <= asOfIso. If more than one snapshot shares that same
 * effectiveDate, the most recently created one wins (deterministic
 * tie-break) — both records stay in history, neither is overwritten.
 */
export function resolveCapacityForDate(
  programId: number,
  snapshots: CapacitySnapshot[],
  asOfIso: string,
): CapacitySnapshot | null {
  const candidates = snapshots.filter(
    (s) =>
      s.programId === programId && s.effectiveDate <= asOfIso,
  );
  if (candidates.length === 0) return null;
  candidates.sort(
    (a, b) =>
      b.effectiveDate.localeCompare(a.effectiveDate) ||
      b.createdAt.localeCompare(a.createdAt),
  );
  return candidates[0];
}

/** Earliest snapshot with an effectiveDate strictly after `asOfIso`. */
export function getUpcomingSnapshot(
  programId: number,
  snapshots: CapacitySnapshot[],
  asOfIso: string,
): CapacitySnapshot | null {
  const future = snapshots
    .filter(
      (s) =>
        s.programId === programId && s.effectiveDate > asOfIso,
    )
    .sort((a, b) =>
      a.effectiveDate.localeCompare(b.effectiveDate),
    );
  return future[0] ?? null;
}

export interface CapacityHistoryEntry {
  snapshot: CapacitySnapshot;
  status: CapacityStatus;
  /** ISO "YYYY-MM-DD" the day before the next snapshot's effective date, or
   *  null if this snapshot's period is still open (it's the latest one). */
  endDate: string | null;
}

/** Full Capacity History for a program, newest effective date first. Each
 *  snapshot's period automatically ends the day before the next
 *  chronological snapshot begins — nothing is ever overwritten, only the
 *  effective period of the previous record is closed. */
export function buildCapacityHistory(
  programId: number,
  snapshots: CapacitySnapshot[],
  asOfIso: string,
): CapacityHistoryEntry[] {
  const current = resolveCapacityForDate(
    programId,
    snapshots,
    asOfIso,
  );

  const ascending = snapshots
    .filter((s) => s.programId === programId)
    .sort(
      (a, b) =>
        a.effectiveDate.localeCompare(b.effectiveDate) ||
        a.createdAt.localeCompare(b.createdAt),
    );

  return ascending
    .map((s, i) => {
      const next = ascending[i + 1];
      return {
        snapshot: s,
        endDate: next
          ? addDaysIso(next.effectiveDate, -1)
          : null,
      };
    })
    .sort(
      (a, b) =>
        b.snapshot.effectiveDate.localeCompare(
          a.snapshot.effectiveDate,
        ) ||
        b.snapshot.createdAt.localeCompare(
          a.snapshot.createdAt,
        ),
    )
    .map(({ snapshot: s, endDate }) => ({
      snapshot: s,
      endDate,
      status: (current && s.id === current.id
        ? "Current"
        : s.effectiveDate > asOfIso
          ? "Scheduled"
          : "Historical") as CapacityStatus,
    }));
}

export function capacityStatusBadgeVariant(
  status: CapacityStatus,
): "success" | "info" | "neutral" {
  if (status === "Current") return "success";
  if (status === "Scheduled") return "info";
  return "neutral";
}

export function programStatusBadgeVariant(
  status: ProgramStatus,
): "success" | "neutral" {
  return status === "Active" ? "success" : "neutral";
}