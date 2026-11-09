import { useSyncExternalStore } from "react";
import { getMedicationLogAccess } from "./medicationLogAccess";
import { getYouthProgramEnrollments } from "./mockYouthProgramData";
import {
  type CountType,
  type DosePeriod,
  getAssignmentById,
} from "./youthMedicationAssignments";

// Medication Logs + Count history (US 20100 / US 20102, Chunk 1).
//
// PROTOTYPE PERSISTENCE: one versioned localStorage key holds every
// committed Log record and Attestation record (same approach as
// transitionSummaryStore). It survives reloads in this browser only — it is
// not production storage, gives no authorization, and is not a
// tamper-proof audit trail.
//
// Identity: every record carries the Youth Constituent ID, the Program ID
// at the time it was recorded (never rewritten when enrollment changes),
// the youth medication record id (assignment, not catalog id) and the dose
// period. Reads are always scoped to one youth — there is no unscoped read.
//
// Count history vs latest count: each successful count is its own Count
// log. The latest count is derived from that history (newest dose date,
// then newest attestation time — the existing countStore rule), so earlier
// history is never overwritten.

/** US 20100 AC-25 log types, each kept distinct (never merged into a
 *  generic Disposal / Dispensation). Earlier reference values (OTC
 *  Dispensation, Disposal, Lockbox, Pharmacy Transfer) stay supported so
 *  existing saved records still render. */
export const AC25_LOG_TYPES = [
  "Count",
  "Prescription Dispensation",
  "Disposal – Med Cart",
  "Disposal – Controlled Substance",
  "Missed Dose",
  "Refused Dose",
  "Missed Packed Med",
  "Packed School Medication",
  "Adjusted Dose",
  "Medical Orders Update",
  "PRN Administration",
  "PRN Declined",
  "Inventory Adjustment",
] as const;
export type MedicationLogType =
  | (typeof AC25_LOG_TYPES)[number]
  | "OTC Dispensation"
  | "Disposal"
  | "Lockbox"
  | "Pharmacy Transfer (Pending)"
  | "Pharmacy Transfer (Verified)";

/** Categorical volume level — never stored as a number. */
export const VOLUME_LEVELS = [
  "Full",
  "3/4",
  "1/2",
  "1/4",
  "Empty",
] as const;
export type VolumeLevel = (typeof VOLUME_LEVELS)[number];

export const COUNT_ATTESTATION_TEXT =
  "I attest that I have followed the policies and procedure of Medicine Dispensation & Documentation";

export interface MedicationLogRecord {
  id: string;
  /** Display sequence ("#" column). */
  recordNumber: number;
  youthId: string;
  /** Program at the time the log was recorded. */
  programId: number;
  /** Youth medication record id; null only for non-assigned OTC stock. */
  youthMedicationId: string | null;
  catalogMedicationId: string;
  medicationName: string;
  dose: string;
  dosePeriod: DosePeriod;
  /** ISO "YYYY-MM-DD" */
  doseDate: string;
  logType: MedicationLogType;
  instance: string;
  seq: number;
  primaryCode: string;
  /** Count logs: Units → quantity (number); Volume → volume (level). */
  countType?: CountType;
  quantity?: number;
  volume?: VolumeLevel;
  comment: string;
  dosePeriodComment: string;
  /** Type-specific read-only fields for non-Count logs. */
  details: Record<string, string>;
  attestationId: string;
  /** ISO timestamp */
  createdAt: string;
  /** Logical deletion (Chunk 3): set once, never cleared. A deleted log
   *  leaves every active query but stays as audit evidence and as part of
   *  committed count history. */
  deletedAt?: string;
  deletedBy?: string;
}

/** Audit evidence for an action on a medication log (Chunk 3). Only real
 *  events are stored — no create/update history is manufactured. */
export interface MedicationLogAuditEvent {
  id: string;
  action: "Deleted Medication Log";
  /** ISO timestamp */
  at: string;
  /** Stable user id when the app provides one (the prototype does not). */
  userId: string | null;
  userName: string;
  recordId: string;
  youthId: string;
  /** Historical Program of the log — audit visibility is scoped by it. */
  programId: number;
  /** Enough of the deleted log to identify it. */
  snapshot: {
    recordNumber: number;
    logType: MedicationLogType;
    medicationName: string;
    dose: string;
    doseDate: string;
    dosePeriod: DosePeriod;
    youthMedicationId: string | null;
    countValue: string;
    comment: string;
    attestationId: string;
  };
}

export interface MedicationAttestationRecord {
  id: string;
  logType: MedicationLogType;
  youthId: string;
  programId: number;
  staff: string;
  text: string;
  /** ISO timestamp */
  attestedAt: string;
  logIds: string[];
  /** Every youth / Program covered (a central Count batch can span several). */
  youthIds?: string[];
  programIds?: number[];
}

interface Snapshot {
  version: 1;
  nextRecordNumber: number;
  logs: MedicationLogRecord[];
  attestations: MedicationAttestationRecord[];
  /** Optional so snapshots saved before Chunk 3 stay valid. */
  auditEvents?: MedicationLogAuditEvent[];
  /** Write counter (Chunk 5): detects a newer save from another tab.
   *  Missing in older snapshots = 0. */
  revision?: number;
}

// ─── Fixture seed (written once, only when nothing is saved yet) ───────────
// Explicit ownership: Emily Johnson (Constituent 1), Program 1
// (Self-Awareness, her active enrollment), her own assignments. Seeding
// happens only on first load, so deleted or saved records are never
// recreated on remount and no list is duplicated under other youths.

const SEED_STAFF = [
  "Sarah Johnson",
  "Michael Chen",
  "Lisa Martinez",
];
const SEED_TEXT =
  "I attest that I have followed Mercy Home's policies and procedures for medication dispensation & documentation.";

function seedSnapshot(): Snapshot {
  const rows: Array<
    Omit<
      MedicationLogRecord,
      | "id"
      | "recordNumber"
      | "youthId"
      | "programId"
      | "attestationId"
      | "createdAt"
      | "seq"
      | "dosePeriodComment"
      | "catalogMedicationId"
      | "medicationName"
      | "dose"
      | "instance"
    > & {
      assignment: string | null;
      otc?: {
        catalog: string;
        name: string;
        dose: string;
        instance: string;
      };
      at: string;
      staff: number;
      dosePeriodComment?: string;
    }
  > = [
    {
      assignment: "YM-1-001",
      doseDate: "2026-06-09",
      dosePeriod: "Morning",
      logType: "Prescription Dispensation",
      primaryCode: "PKG-2026-001-A",
      comment: "",
      at: "2026-06-09T13:15:00.000Z",
      staff: 0,
      details: {
        "Start Time": "06:00 AM",
        "End Time": "11:00 AM",
        "Package Code": "PKG-2026-001-A",
        "Primary Status": "Received",
        "Dose Period": "Morning",
        Instructions: "Take with food",
        "Staff Dispensed": "Sarah Johnson",
        "Youth Received": "Yes",
      },
    },
    {
      assignment: null,
      otc: {
        catalog: "CAT-TYLENOL-325",
        name: "Tylenol",
        dose: "325mg",
        instance: "as needed",
      },
      doseDate: "2026-06-09",
      dosePeriod: "Morning",
      logType: "OTC Dispensation",
      primaryCode: "MED-CODE-003",
      comment: "Youth requested for headache",
      at: "2026-06-09T13:20:00.000Z",
      staff: 0,
      details: {
        "Medication Comment": "Youth requested for headache",
        Quantity: "1",
      },
    },
    {
      assignment: "YM-1-004",
      doseDate: "2026-06-08",
      dosePeriod: "Bedtime",
      logType: "Count",
      primaryCode: "",
      countType: "Units",
      quantity: 3,
      comment: "Count verified, 3 remaining",
      dosePeriodComment: "Bedtime count completed",
      at: "2026-06-09T02:45:00.000Z",
      staff: 1,
      details: {},
    },
    {
      assignment: "YM-1-003",
      doseDate: "2026-06-07",
      dosePeriod: "Afternoon",
      logType: "Disposal",
      primaryCode: "MPM - Missed Packed Med",
      comment: "Disposed per policy",
      at: "2026-06-07T15:30:00.000Z",
      staff: 2,
      details: {
        "Amount Disposed": "1",
        Status: "Med Cart",
        Comment: "Disposed per policy",
      },
    },
    {
      assignment: "YM-1-002",
      doseDate: "2026-06-06",
      dosePeriod: "Morning",
      logType: "Lockbox",
      primaryCode: "MED-CODE-002",
      comment: "Secured in lockbox",
      at: "2026-06-06T12:55:00.000Z",
      staff: 0,
      details: {
        Action: "In",
        "Medication Location": "Lockbox A",
        Comment: "Secured in lockbox",
      },
    },
  ];
  const logs: MedicationLogRecord[] = [];
  const attestations: MedicationAttestationRecord[] = [];
  rows.forEach((r, i) => {
    const a = r.assignment
      ? getAssignmentById(r.assignment)
      : undefined;
    const id = `LOG-S${String(i + 1).padStart(3, "0")}`;
    const attestationId = `ATT-S${String(i + 1).padStart(3, "0")}`;
    const {
      assignment,
      otc,
      at,
      staff,
      dosePeriodComment,
      ...rest
    } = r;
    logs.push({
      ...rest,
      id,
      recordNumber: i + 1,
      youthId: "1",
      programId: 1,
      youthMedicationId: a ? a.id : null,
      catalogMedicationId: a
        ? a.catalogMedicationId
        : otc!.catalog,
      medicationName: a ? a.medicationName : otc!.name,
      dose: a ? a.dose : otc!.dose,
      instance: a ? a.instance : otc!.instance,
      seq: 1,
      dosePeriodComment: dosePeriodComment ?? "",
      attestationId,
      createdAt: at,
    });
    attestations.push({
      id: attestationId,
      logType: r.logType,
      youthId: "1",
      programId: 1,
      staff: SEED_STAFF[staff],
      text: SEED_TEXT,
      attestedAt: at,
      logIds: [id],
    });
  });
  return {
    version: 1,
    nextRecordNumber: logs.length + 1,
    logs,
    attestations,
  };
}

// ─── Persistence ────────────────────────────────────────────────────────────

const STORAGE_KEY = "mh.medicationLogs.v1";

function isSnapshot(v: unknown): v is Snapshot {
  const s = v as Snapshot;
  return (
    !!s &&
    s.version === 1 &&
    typeof s.nextRecordNumber === "number" &&
    Array.isArray(s.logs) &&
    Array.isArray(s.attestations) &&
    (s.auditEvents === undefined ||
      Array.isArray(s.auditEvents)) &&
    s.logs.every(
      (l) =>
        typeof l.id === "string" &&
        typeof l.youthId === "string" &&
        typeof l.programId === "number" &&
        typeof l.attestationId === "string",
    )
  );
}

/** Saved snapshot; seeds (and saves) the fixture only when nothing is
 *  saved. Unreadable saved data is left untouched and treated as empty —
 *  never silently replaced with sample records. */
function load(): { snapshot: Snapshot; unreadable: boolean } {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { snapshot: seedSnapshot(), unreadable: false };
  }
  if (raw === null) {
    const seeded = seedSnapshot();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    } catch {
      /* storage unavailable: in-memory only */
    }
    return { snapshot: seeded, unreadable: false };
  }
  try {
    const parsed = JSON.parse(raw);
    if (isSnapshot(parsed))
      return { snapshot: parsed, unreadable: false };
  } catch {
    /* fall through */
  }
  return {
    snapshot: {
      version: 1,
      nextRecordNumber: 1,
      logs: [],
      attestations: [],
    },
    unreadable: true,
  };
}

const loaded = load();
let state: Snapshot = loaded.snapshot;
/** True when saved data existed but could not be read (writes are blocked
 *  so it is never overwritten). */
export const medicationLogDataUnreadable = loaded.unreadable;
const listeners = new Set<() => void>();

/** Test seam: simulate a storage write failure on subsequent saves. */
let persistenceFault = false;
export function __setMedicationLogPersistenceFault(
  on: boolean,
) {
  persistenceFault = on;
}

/** All-or-nothing: write the full next snapshot, then publish it. */
/** Saved data as it is right now: nothing saved, a valid snapshot, or
 *  something that cannot be read (malformed JSON / invalid structure). */
type StorageRead =
  | { kind: "missing" }
  | { kind: "valid"; snapshot: Snapshot }
  | { kind: "unreadable" };
function readStorage(): StorageRead {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { kind: "unreadable" };
  }
  if (raw === null) return { kind: "missing" };
  try {
    const parsed = JSON.parse(raw);
    return isSnapshot(parsed)
      ? { kind: "valid", snapshot: parsed }
      : { kind: "unreadable" };
  } catch {
    return { kind: "unreadable" };
  }
}

const UNREADABLE_MESSAGE =
  "Saved medication log data can't be read, so nothing was saved and it was not overwritten. Your entries are kept — reload the page; if this continues, contact support.";
/** Why the last write was refused (shown by the count / delete services). */
let lastCommitError = "";

function markUnreadable() {
  if (readError !== UNREADABLE_MESSAGE) {
    readError = UNREADABLE_MESSAGE;
    listeners.forEach((l) => l());
  }
}

/** Adopts a newer save made by another tab before a change is computed,
 *  so a stale tab never overwrites newer records or resurrects a deleted
 *  log. Unreadable saved data is reported and left untouched. */
function syncFromStorage(): void {
  const read = readStorage();
  if (read.kind === "unreadable") {
    markUnreadable();
    return;
  }
  if (
    read.kind === "valid" &&
    (read.snapshot.revision ?? 0) !== (state.revision ?? 0)
  ) {
    state = read.snapshot;
    listeners.forEach((l) => l());
  }
}

/** Writes the next snapshot unless saved data is unreadable or another
 *  tab saved since our read. The revision check narrows, but does NOT
 *  close, the window between reading and writing: two tabs writing at
 *  the same moment can still lose one write (unresolved prototype
 *  limitation — localStorage offers no atomic compare-and-set). */
function commit(next: Snapshot): boolean {
  lastCommitError = "";
  if (medicationLogDataUnreadable) {
    lastCommitError = UNREADABLE_MESSAGE;
    return false;
  }
  try {
    if (persistenceFault)
      throw new Error("Simulated persistence failure");
    const read = readStorage();
    if (read.kind === "unreadable") {
      markUnreadable();
      lastCommitError = UNREADABLE_MESSAGE;
      return false;
    }
    if (
      read.kind === "valid" &&
      (read.snapshot.revision ?? 0) !== (state.revision ?? 0)
    )
      throw new Error("Saved data changed in another tab");
    next = { ...next, revision: (state.revision ?? 0) + 1 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return false;
  }
  state = next;
  listeners.forEach((l) => l());
  return true;
}

// Another tab saved: pick it up so open screens show current records.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) reloadMedicationLogs();
  });
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
const getState = () => state;

/** Current snapshot, outside React (e.g. Program Delete's related-record
 *  check). */
export const getMedicationLogSnapshot = getState;

/** Re-renders on every committed change. */
export function useMedicationLogState(): Snapshot {
  return useSyncExternalStore(subscribe, getState, getState);
}

// ─── Read status + Refresh (Chunk 2) ────────────────────────────────────────
// A read failure is reported, never shown as an empty result.

let readError: string | null = medicationLogDataUnreadable
  ? "Saved medication log data could not be read."
  : null;
const getReadError = () => readError;

/** Current read failure message, or null when the last read succeeded. */
export function useMedicationLogReadError(): string | null {
  return useSyncExternalStore(
    subscribe,
    getReadError,
    getReadError,
  );
}

/** Test seam: simulate a storage read failure on Refresh. */
let readFault = false;
export function __setMedicationLogReadFault(on: boolean) {
  readFault = on;
}

/** Refresh: re-reads the saved records (e.g. written in another tab).
 *  Never reseeds or clears data. On failure the last good records stay
 *  in memory and the error is published. */
export function reloadMedicationLogs(): { ok: boolean } {
  let next: Snapshot | null = null;
  try {
    if (readFault) throw new Error("Simulated read failure");
    const read = readStorage();
    if (read.kind === "missing")
      next = state; // nothing saved elsewhere: keep current
    else if (read.kind === "valid") next = read.snapshot;
  } catch {
    next = null;
  }
  if (next) {
    state = next;
    readError = null;
  } else {
    readError =
      "Medication logs could not be loaded. Try Refresh again.";
  }
  listeners.forEach((l) => l());
  return { ok: !!next };
}

// ─── Additive sample records ─────────────────────────────────────────────────

export type SeedAddResult =
  | { ok: true; added: number }
  | { ok: false; reason: "unreadable" | "storage" };

/**
 * Adds sample (demo) logs and attestations that are NOT already saved,
 * matched by their stable ids. Existing records — including logically
 * deleted ones — are never replaced, re-timestamped or re-added, so running
 * it again changes nothing. Each added log takes the next display number
 * and the counter moves past it. Saved data that cannot be read is left
 * untouched. Bypasses the access seam on purpose: this is prototype
 * seeding, not a user action.
 */
export function addMissingSeedRecords(input: {
  logs: Omit<MedicationLogRecord, "recordNumber">[];
  attestations: MedicationAttestationRecord[];
}): SeedAddResult {
  syncFromStorage();
  if (
    medicationLogDataUnreadable ||
    readError === UNREADABLE_MESSAGE
  )
    return { ok: false, reason: "unreadable" };
  const haveLog = new Set(state.logs.map((l) => l.id));
  const haveAtt = new Set(state.attestations.map((a) => a.id));
  const newLogs = input.logs.filter((l) => !haveLog.has(l.id));
  const newAtts = input.attestations.filter(
    (a) => !haveAtt.has(a.id),
  );
  if (newLogs.length === 0 && newAtts.length === 0)
    return { ok: true, added: 0 };
  let n = state.nextRecordNumber;
  const next: Snapshot = {
    ...state,
    nextRecordNumber: n + newLogs.length,
    logs: [
      ...state.logs,
      ...newLogs.map((l) => ({ ...l, recordNumber: n++ })),
    ],
    attestations: [...state.attestations, ...newAtts],
  };
  return commit(next)
    ? { ok: true, added: newLogs.length }
    : { ok: false, reason: "storage" };
}

// ─── Scoped queries (always one youth) ─────────────────────────────────────

/** A log that has not been (logically) deleted. */
export const isActiveLog = (l: MedicationLogRecord) =>
  !l.deletedAt;

/** This youth's ACTIVE logs (deleted logs never appear). */
export function getLogsForYouth(
  s: Snapshot,
  youthId: string,
): MedicationLogRecord[] {
  return s.logs.filter(
    (l) => l.youthId === youthId && isActiveLog(l),
  );
}

/** Every active log — callers must apply access scope (see central Logs). */
export function getActiveLogs(
  s: Snapshot,
): MedicationLogRecord[] {
  return s.logs.filter(isActiveLog);
}

/** Attestations linked to this youth's active logs only. An attestation is
 *  never deleted with a log; it simply stops showing once none of its logs
 *  is active. */
export function getAttestationsForYouth(
  s: Snapshot,
  youthId: string,
): AttestationView[] {
  return getAttestationViews(
    s,
    new Set(getLogsForYouth(s, youthId).map((l) => l.id)),
  );
}

/** What a reader may see of an attestation: its shared fields (date/time,
 *  type, staff, statement) and ONLY the linked logs they are authorized
 *  for — never other youths, Programs or log ids of a shared attestation. */
export interface AttestationView {
  id: string;
  logType: MedicationLogType;
  staff: string;
  text: string;
  attestedAt: string;
  logIds: string[];
}
export function projectAttestation(
  a: MedicationAttestationRecord,
  authorizedLogIds: ReadonlySet<string>,
): AttestationView {
  return {
    id: a.id,
    logType: a.logType,
    staff: a.staff,
    text: a.text,
    attestedAt: a.attestedAt,
    logIds: a.logIds.filter((id) => authorizedLogIds.has(id)),
  };
}
/** The attestations the authorized logs link to (each log's own stored
 *  attestationId — a missing attestation is simply absent), projected. */
export function getAttestationViews(
  s: Snapshot,
  authorizedLogIds: ReadonlySet<string>,
): AttestationView[] {
  const linked = new Set(
    s.logs
      .filter((l) => authorizedLogIds.has(l.id))
      .map((l) => l.attestationId),
  );
  return s.attestations
    .filter((a) => linked.has(a.id))
    .map((a) => projectAttestation(a, authorizedLogIds));
}

/** Every Count submission for one youth medication assignment, oldest
 *  first. Deliberately includes logically deleted Count logs: deleting a
 *  log does not reverse a committed count (no reversal rule is defined). */
export function getCountHistory(
  s: Snapshot,
  youthId: string,
  youthMedicationId: string,
): MedicationLogRecord[] {
  return s.logs
    .filter(
      (l) =>
        l.logType === "Count" &&
        l.youthId === youthId &&
        l.youthMedicationId === youthMedicationId,
    )
    .sort(compareCountRecency);
}

/** Existing rule: newest dose date, then newest attestation time. */
function compareCountRecency(
  a: MedicationLogRecord,
  b: MedicationLogRecord,
): number {
  return (
    a.doseDate.localeCompare(b.doseDate) ||
    a.createdAt.localeCompare(b.createdAt)
  );
}

/** Latest committed count for a youth's assignment + dose period. */
export function getLatestCount(
  s: Snapshot,
  youthId: string,
  youthMedicationId: string,
  dosePeriod: DosePeriod,
): MedicationLogRecord | undefined {
  const history = getCountHistory(
    s,
    youthId,
    youthMedicationId,
  ).filter((l) => l.dosePeriod === dosePeriod);
  return history[history.length - 1];
}

/** Display value of a Count log: number for Units, level for Volume. */
export function countValueLabel(
  l: MedicationLogRecord,
): string {
  return l.countType === "Volume"
    ? (l.volume ?? "")
    : l.quantity != null
      ? String(l.quantity)
      : "";
}

/** Minimal access shape (see data/medicationLogAccess.ts). */
interface AccessLike {
  scope:
    | { kind: "all" }
    | { kind: "programs"; programIds: number[] };
  capabilities: ReadonlySet<string>;
  user: { id: string | null; name: string };
}
const inScope = (a: AccessLike, programId: number) =>
  a.scope.kind === "all" ||
  a.scope.programIds.includes(programId);

// ─── Count submission ──────────────────────────────────────────────────────
// ONE implementation of the count rules, used by Admissions → Count and the
// central Medications → Count (US 20102).

/** Units: up to 4 whole digits (so 1000 can be entered) and 2 decimals.
 *  Zero is a valid count. */
const UNITS_RE = /^\d{1,4}(\.\d{1,2})?$/;

/** The Admissions Units input formatter, shared so both screens accept the
 *  same characters: digits and one decimal point, max 4 + 2 digits. */
export function formatUnitsInput(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  const integerPart = parts[0].slice(0, 4);
  const decimalPart = parts[1] ? parts[1].slice(0, 2) : "";
  return decimalPart
    ? `${integerPart}.${decimalPart}`
    : integerPart;
}

export interface CountDraftRow {
  youthMedicationId: string;
  currentCount: string;
  comment: string;
}

/** A row of a (possibly multi-youth) batch, with its owner. */
export interface CountBatchRow extends CountDraftRow {
  youthId: string;
  /** Program the log will belong to (validated against enrollment). */
  programId: number;
}

export type CountSubmitResult =
  | { ok: true; logIds: string[]; attestationId: string }
  | {
      ok: false;
      /** Per-row validation errors, by youthMedicationId. */
      rowErrors: Record<string, string>;
      error: string;
    };

/** Generic, non-disclosing message for a row the caller can no longer use. */
export const COUNT_ROW_UNAVAILABLE =
  "This entry is no longer available to you and can't be saved.";

/** Active enrollment of a youth in a Program, from the canonical data. */
function isActivelyEnrolled(
  youthId: string,
  programId: number,
): boolean {
  return getYouthProgramEnrollments().some(
    (e) =>
      String(e.constituentId) === youthId &&
      e.programId === programId &&
      e.active,
  );
}

/** Validates every submitted row first; on success writes all Count logs,
 *  their one shared Attestation and (through them) the latest counts in a
 *  single commit. Nothing is written if any row is invalid or the write
 *  fails. Untouched rows (no count and no comment) are ignored.
 *  Enforced HERE for every caller (Admissions and central Count): the
 *  CURRENT user's count permission, Program scope, the youth's active
 *  enrollment in the row's Program and assignment ownership. */
export function submitCountBatch(input: {
  staff: string;
  rows: CountBatchRow[];
  now?: Date;
}): CountSubmitResult {
  syncFromStorage();
  const access = getMedicationLogAccess();
  const rowErrors: Record<string, string> = {};
  const submitted = input.rows.filter(
    (r) =>
      r.currentCount.trim() !== "" || r.comment.trim() !== "",
  );
  if (submitted.length === 0)
    return {
      ok: false,
      rowErrors,
      error: "Enter a Current Count to submit.",
    };
  if (!access.capabilities.has("submitCount"))
    return {
      ok: false,
      rowErrors,
      error:
        "You don't have permission to record medication counts.",
    };

  const valid: Array<{
    row: CountBatchRow;
    a: NonNullable<ReturnType<typeof getAssignmentById>>;
  }> = [];
  for (const row of submitted) {
    const a = getAssignmentById(row.youthMedicationId);
    const value = row.currentCount.trim();
    if (
      !a ||
      a.youthId !== row.youthId ||
      !inScope(access, row.programId) ||
      !isActivelyEnrolled(row.youthId, row.programId)
    )
      rowErrors[row.youthMedicationId] = COUNT_ROW_UNAVAILABLE;
    else if (value === "")
      rowErrors[row.youthMedicationId] =
        "Enter a Current Count (a comment alone can't be submitted).";
    else if (a.countType === "Units" && !UNITS_RE.test(value))
      rowErrors[row.youthMedicationId] =
        "Enter a number (up to 3 digits and 2 decimals).";
    else if (
      a.countType === "Volume" &&
      !(VOLUME_LEVELS as readonly string[]).includes(value)
    )
      rowErrors[row.youthMedicationId] =
        "Choose Full, 3/4, 1/2, 1/4 or Empty.";
    else valid.push({ row, a });
  }
  if (Object.keys(rowErrors).length > 0)
    return {
      ok: false,
      rowErrors,
      error: "Fix the highlighted rows. Nothing was saved.",
    };

  const now = input.now ?? new Date();
  const attestedAt = now.toISOString();
  const doseDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  // Ids come from the persisted record counter, so they never collide.
  let n = state.nextRecordNumber;
  const attestationId = `ATT-${String(n).padStart(6, "0")}`;
  const logs: MedicationLogRecord[] = valid.map(
    ({ row, a }) => {
      const value = row.currentCount.trim();
      return {
        id: `LOG-${String(n).padStart(6, "0")}`,
        recordNumber: n++,
        youthId: row.youthId,
        programId: row.programId,
        youthMedicationId: a.id,
        catalogMedicationId: a.catalogMedicationId,
        medicationName: a.medicationName,
        dose: a.dose,
        dosePeriod: a.dosePeriod,
        doseDate,
        logType: "Count",
        instance: a.instance,
        seq: 1,
        primaryCode: "",
        countType: a.countType,
        ...(a.countType === "Units"
          ? { quantity: Number(value) }
          : { volume: value as VolumeLevel }),
        comment: row.comment.trim(),
        dosePeriodComment: "",
        details: {},
        attestationId,
        createdAt: attestedAt,
      };
    },
  );
  const youthIds = [...new Set(logs.map((l) => l.youthId))];
  const programIds = [...new Set(logs.map((l) => l.programId))];
  const attestation: MedicationAttestationRecord = {
    id: attestationId,
    logType: "Count",
    // One youth/Program for a single-youth submission; "" / 0 when the
    // shared attestation covers several (see youthIds / programIds).
    youthId: youthIds.length === 1 ? youthIds[0] : "",
    programId: programIds.length === 1 ? programIds[0] : 0,
    youthIds,
    programIds,
    staff: input.staff,
    text: COUNT_ATTESTATION_TEXT,
    attestedAt,
    logIds: logs.map((l) => l.id),
  };
  const ok = commit({
    ...state,
    nextRecordNumber: n,
    logs: [...state.logs, ...logs],
    attestations: [...state.attestations, attestation],
  });
  if (!ok)
    return {
      ok: false,
      rowErrors: {},
      error:
        lastCommitError ||
        "The counts could not be saved. Your entries are kept — try again.",
    };
  return {
    ok: true,
    logIds: attestation.logIds,
    attestationId,
  };
}

/** Single-youth submission (Admissions → Count) — the same service. */
export function submitCounts(input: {
  youthId: string;
  programId: number;
  staff: string;
  rows: CountDraftRow[];
  now?: Date;
}): CountSubmitResult {
  return submitCountBatch({
    staff: input.staff,
    now: input.now,
    rows: input.rows.map((r) => ({
      ...r,
      youthId: input.youthId,
      programId: input.programId,
    })),
  });
}

// ─── Delete + audit (Chunk 3) ───────────────────────────────────────────────
// Rules enforced HERE, not only in the UI: the caller's current access is
// re-read at execution, the record is re-resolved, and the tombstone plus
// its audit event are written in one commit. Count history and Last Count
// are NOT reversed (the ticket defines no count/inventory reversal):
// getCountHistory / getLatestCount still include deleted Count logs.

export type DeleteLogResult =
  | { ok: true; auditEventId: string }
  | {
      ok: false;
      reason:
        | "forbidden"
        | "not-found"
        | "already-deleted"
        | "save-failed";
      error: string;
    };

export function deleteMedicationLog(
  logId: string,
  now: Date = new Date(),
): DeleteLogResult {
  syncFromStorage();
  const access: AccessLike = getMedicationLogAccess();
  const log = state.logs.find((l) => l.id === logId);
  // Unauthorized and missing look the same — nothing is disclosed.
  if (
    !log ||
    !inScope(access, log.programId) ||
    !access.capabilities.has("viewLogs")
  )
    return {
      ok: false,
      reason: "not-found",
      error: "That medication log is not available.",
    };
  if (!access.capabilities.has("deleteLog"))
    return {
      ok: false,
      reason: "forbidden",
      error:
        "You don't have permission to delete medication logs.",
    };
  if (log.deletedAt)
    return {
      ok: false,
      reason: "already-deleted",
      error: "This medication log was already deleted.",
    };

  const at = now.toISOString();
  const events = state.auditEvents ?? [];
  const event: MedicationLogAuditEvent = {
    id: `AUD-${String(events.length + 1).padStart(6, "0")}-${log.id}`,
    action: "Deleted Medication Log",
    at,
    userId: access.user.id,
    userName: access.user.name,
    recordId: log.id,
    youthId: log.youthId,
    programId: log.programId,
    snapshot: {
      recordNumber: log.recordNumber,
      logType: log.logType,
      medicationName: log.medicationName,
      dose: log.dose,
      doseDate: log.doseDate,
      dosePeriod: log.dosePeriod,
      youthMedicationId: log.youthMedicationId,
      countValue: countValueLabel(log),
      comment: log.comment,
      attestationId: log.attestationId,
    },
  };
  const ok = commit({
    ...state,
    logs: state.logs.map((l) =>
      l.id === log.id
        ? { ...l, deletedAt: at, deletedBy: access.user.name }
        : l,
    ),
    auditEvents: [...events, event],
  });
  if (!ok)
    return {
      ok: false,
      reason: "save-failed",
      error:
        lastCommitError ||
        "The log could not be deleted. Nothing was changed — try again.",
    };
  return { ok: true, auditEventId: event.id };
}

export type AuditQueryResult =
  | { ok: true; events: MedicationLogAuditEvent[] }
  | { ok: false; error: string };

/** Audit events the caller may see: audit permission required, and each
 *  event scoped by its historical Program. Optionally one record's. */
export function queryMedicationLogAudit(
  s: Snapshot,
  recordId?: string,
): AuditQueryResult {
  const access: AccessLike = getMedicationLogAccess();
  if (!access.capabilities.has("viewAudit"))
    return {
      ok: false,
      error:
        "You don't have permission to view medication audit information.",
    };
  return {
    ok: true,
    events: (s.auditEvents ?? [])
      .filter(
        (e) =>
          inScope(access, e.programId) &&
          (recordId === undefined || e.recordId === recordId),
      )
      .sort((a, b) => b.at.localeCompare(a.at)),
  };
}