// Admissions Risk Factors — the ONE saved source for the Risk Factors screen
// and for anything that reads them (e.g. the C-SSRS Full-Lifetime
// requirement, lib/cssrsRequirement.ts).
//
// Ownership: every record keeps the Admissions record that owns it
// (`admissionsRecordId`) and the testing youth key it belongs to (`youthKey`,
// see youthTestingAssessmentStore). Callers pass both explicitly from
// resolveCssrsOwnership; nothing is inferred from a name, and a Constituent
// profile id is never used as an Admissions id. Reads are always filtered by
// Admissions record, so switching records never exposes another record's
// Risk Factors.
//
// Persistence: same convention as cssrsAssessmentStore — one versioned
// localStorage key, all-or-nothing writes, useSyncExternalStore for
// subscribers. Data that cannot be read (corrupt, or a schema version this
// build does not know) is reported, left in storage exactly as found and
// never overwritten. PROTOTYPE PERSISTENCE ONLY: browser storage.

import { useSyncExternalStore } from "react";

export const RISK_FACTOR_STORAGE_KEY =
  "mh.admissionsRiskFactors.v1";
export const RISK_FACTOR_SCHEMA_VERSION = 1 as const;

/** The selectable Risk Factor types (requirements list). */
export const RISK_FACTOR_OPTIONS = [
  "Aggression Toward Others",
  "Animal Abuse",
  "Auditory Hallucinations",
  "AWOL or Runaway",
  "Binging",
  "Destruction of Property",
  "Excessive Exercise",
  "Encopresis",
  "Enuresis",
  "Fire Setting",
  "Gang Affiliation or Membership",
  "Homicidal Ideation",
  "Purging",
  "Restrictive Eating",
  "Stealing",
  "Self-Harm",
  "Suicidal Ideation",
  "Sexually Problematic Behavior",
  "Visual Hallucinations",
  "Use of Weapon",
  "Other",
] as const;

/** Earlier spelling of an option that may already be saved. Readable and
 *  editable; never offered for new records. */
export const RISK_FACTOR_LEGACY_ALIASES: readonly string[] = [
  "Self Harm",
];

export interface RiskFactorFields {
  riskFactor: string;
  lastOccurred: string;
  duration: string;
  frequency: string;
  details: string;
}

export interface RiskFactorOwnership {
  /** Admissions record that owns the Risk Factor. Never a Constituent id. */
  admissionsRecordId: string;
  /** Testing youth key the record belongs to. */
  youthKey: string;
}

export interface RiskFactorRecord
  extends RiskFactorFields, RiskFactorOwnership {
  id: string;
  /** ISO timestamps */
  createdAt: string;
  modifiedAt: string;
}

interface Persisted {
  version: typeof RISK_FACTOR_SCHEMA_VERSION;
  nextSeq: number;
  records: RiskFactorRecord[];
}

const EMPTY: Persisted = {
  version: RISK_FACTOR_SCHEMA_VERSION,
  nextSeq: 1,
  records: [],
};

// ─── Validation ─────────────────────────────────────────────────────────────

const ID_PREFIX = "RF-";
const seqId = (n: number) =>
  `${ID_PREFIX}${String(n).padStart(6, "0")}`;
const isNonEmpty = (v: unknown): v is string =>
  typeof v === "string" && v.trim() !== "";
const isStr = (v: unknown): v is string =>
  typeof v === "string";

export const isKnownRiskFactor = (v: unknown): v is string =>
  typeof v === "string" &&
  ((RISK_FACTOR_OPTIONS as readonly string[]).includes(v) ||
    RISK_FACTOR_LEGACY_ALIASES.includes(v));

function isRecord(v: unknown): v is RiskFactorRecord {
  const r = v as Partial<RiskFactorRecord> | null;
  return (
    !!r &&
    typeof r === "object" &&
    typeof r.id === "string" &&
    /^RF-\d{6,}$/.test(r.id) &&
    isNonEmpty(r.admissionsRecordId) &&
    isNonEmpty(r.youthKey) &&
    isKnownRiskFactor(r.riskFactor) &&
    isStr(r.lastOccurred) &&
    isStr(r.duration) &&
    isStr(r.frequency) &&
    isStr(r.details) &&
    isStr(r.createdAt) &&
    isStr(r.modifiedAt)
  );
}

// ─── Load / publish ─────────────────────────────────────────────────────────

export type RiskFactorUnreadableReason =
  "corrupt" | "unsupported-version";
type Health = "ok" | RiskFactorUnreadableReason;

export type RiskFactorRead =
  | { status: "ok"; records: readonly RiskFactorRecord[] }
  | { status: "error"; reason: RiskFactorUnreadableReason };

function load(): {
  data: Persisted;
  health: Health;
  raw: string | null;
} {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(RISK_FACTOR_STORAGE_KEY);
  } catch {
    // Storage blocked: start empty; writes will fail visibly.
    return { data: EMPTY, health: "ok", raw: null };
  }
  if (raw === null) return { data: EMPTY, health: "ok", raw };
  let p: Partial<Persisted> | null;
  try {
    p = JSON.parse(raw) as Partial<Persisted> | null;
  } catch {
    return { data: EMPTY, health: "corrupt", raw };
  }
  if (
    p &&
    typeof p === "object" &&
    typeof p.version === "number" &&
    p.version !== RISK_FACTOR_SCHEMA_VERSION
  )
    return { data: EMPTY, health: "unsupported-version", raw };
  if (
    p &&
    p.version === RISK_FACTOR_SCHEMA_VERSION &&
    typeof p.nextSeq === "number" &&
    Number.isInteger(p.nextSeq) &&
    Array.isArray(p.records) &&
    p.records.every(isRecord) &&
    new Set(p.records.map((r) => r.id)).size ===
      p.records.length &&
    p.records.every(
      (r) => Number(r.id.slice(ID_PREFIX.length)) < p.nextSeq!,
    )
  )
    return { data: p as Persisted, health: "ok", raw };
  return { data: EMPTY, health: "corrupt", raw };
}

let loaded = load();
let state = loaded.data;
let health = loaded.health;
let unreadableRaw = loaded.raw;
let snapshot: RiskFactorRead = toRead();
const listeners = new Set<() => void>();

function toRead(): RiskFactorRead {
  return health === "ok"
    ? { status: "ok", records: state.records }
    : { status: "error", reason: health };
}
function publish() {
  snapshot = toRead();
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Picks up saves from another tab (or a reload) before reading/writing. */
export function refreshRiskFactorsFromStorage(): void {
  const fresh = load();
  if (
    fresh.health !== health ||
    JSON.stringify(fresh.data) !== JSON.stringify(state)
  ) {
    state = fresh.data;
    health = fresh.health;
    unreadableRaw = fresh.raw;
    publish();
  }
}

if (typeof window !== "undefined")
  window.addEventListener("storage", (e) => {
    if (e.key === RISK_FACTOR_STORAGE_KEY || e.key === null)
      refreshRiskFactorsFromStorage();
  });

/** All-or-nothing: memory changes only after the storage write succeeded. */
function commit(next: Persisted): boolean {
  try {
    window.localStorage.setItem(
      RISK_FACTOR_STORAGE_KEY,
      JSON.stringify(next),
    );
  } catch {
    return false;
  }
  state = next;
  health = "ok";
  unreadableRaw = null;
  publish();
  return true;
}

// ─── Reads ──────────────────────────────────────────────────────────────────

export function useRiskFactors(): RiskFactorRead {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );
}

/** Non-reactive read (refreshes first). */
export function getRiskFactors(): RiskFactorRead {
  refreshRiskFactorsFromStorage();
  return snapshot;
}

/** Only the Risk Factors owned by one Admissions record, in saved order. */
export function riskFactorsForAdmissionsRecord(
  read: RiskFactorRead,
  admissionsRecordId: string | null,
): RiskFactorRecord[] {
  return read.status === "ok" && admissionsRecordId !== null
    ? read.records.filter(
        (r) => r.admissionsRecordId === admissionsRecordId,
      )
    : [];
}

/** The saved text of data that could not be read, for recovery by hand. */
export function getUnreadableRiskFactorData(): {
  reason: RiskFactorUnreadableReason;
  raw: string;
} | null {
  refreshRiskFactorsFromStorage();
  return health !== "ok" && unreadableRaw !== null
    ? { reason: health, raw: unreadableRaw }
    : null;
}

// ─── Writes ─────────────────────────────────────────────────────────────────

export type RiskFactorWriteError = {
  ok: false;
  reason: "unreadable" | "storage" | "invalid" | "not-found";
  error: string;
};
export type RiskFactorWriteResult =
  { ok: true; record: RiskFactorRecord } | RiskFactorWriteError;

const STORAGE_ERROR =
  "The Risk Factor could not be saved. Your entries are kept — please try again.";
const UNREADABLE_ERROR =
  "Saved Risk Factor data can't be read, so nothing was changed. The saved data has been left as it is.";

function writable(): RiskFactorWriteError | null {
  refreshRiskFactorsFromStorage();
  return health === "ok"
    ? null
    : {
        ok: false,
        reason: "unreadable",
        error: UNREADABLE_ERROR,
      };
}

const invalid = (error: string): RiskFactorWriteError => ({
  ok: false,
  reason: "invalid",
  error,
});

const clean = (f: RiskFactorFields): RiskFactorFields => ({
  riskFactor: f.riskFactor,
  lastOccurred: f.lastOccurred,
  duration: f.duration,
  frequency: f.frequency,
  details: f.details,
});

/** Only a current option may be chosen for a NEW Risk Factor. */
const isSelectable = (v: unknown) =>
  typeof v === "string" &&
  (RISK_FACTOR_OPTIONS as readonly string[]).includes(v);

export function createRiskFactor(
  ownership: RiskFactorOwnership,
  fields: RiskFactorFields,
): RiskFactorWriteResult {
  const blocked = writable();
  if (blocked) return blocked;
  if (!isNonEmpty(ownership.admissionsRecordId))
    return invalid(
      "A Risk Factor must belong to an Admissions record.",
    );
  if (!isNonEmpty(ownership.youthKey))
    return invalid(
      "The youth for this Risk Factor is missing.",
    );
  if (!isSelectable(fields.riskFactor))
    return invalid("Select a Risk Factor.");
  const now = new Date().toISOString();
  const record: RiskFactorRecord = {
    id: seqId(state.nextSeq),
    admissionsRecordId: ownership.admissionsRecordId,
    youthKey: ownership.youthKey,
    ...clean(fields),
    createdAt: now,
    modifiedAt: now,
  };
  const next: Persisted = {
    version: RISK_FACTOR_SCHEMA_VERSION,
    nextSeq: state.nextSeq + 1,
    records: [...state.records, record],
  };
  return commit(next)
    ? { ok: true, record }
    : { ok: false, reason: "storage", error: STORAGE_ERROR };
}

/** Edits one Risk Factor. Id and ownership never change, and a record can
 *  only be edited by the Admissions record that owns it. */
export function updateRiskFactor(
  admissionsRecordId: string,
  id: string,
  fields: RiskFactorFields,
): RiskFactorWriteResult {
  const blocked = writable();
  if (blocked) return blocked;
  const prev = state.records.find(
    (r) =>
      r.id === id &&
      r.admissionsRecordId === admissionsRecordId,
  );
  if (!prev)
    return {
      ok: false,
      reason: "not-found",
      error: "This Risk Factor no longer exists.",
    };
  // An unchanged legacy spelling stays editable; a new choice must be current.
  if (!(
    isSelectable(fields.riskFactor) ||
    fields.riskFactor === prev.riskFactor
  ))
    return invalid("Select a Risk Factor.");
  const record: RiskFactorRecord = {
    ...prev,
    ...clean(fields),
    modifiedAt: new Date().toISOString(),
  };
  const next: Persisted = {
    ...state,
    records: state.records.map((r) =>
      r.id === id ? record : r,
    ),
  };
  return commit(next)
    ? { ok: true, record }
    : { ok: false, reason: "storage", error: STORAGE_ERROR };
}

export function deleteRiskFactor(
  admissionsRecordId: string,
  id: string,
): { ok: true } | RiskFactorWriteError {
  const blocked = writable();
  if (blocked) return blocked;
  if (
    !state.records.some(
      (r) =>
        r.id === id &&
        r.admissionsRecordId === admissionsRecordId,
    )
  )
    return {
      ok: false,
      reason: "not-found",
      error: "This Risk Factor no longer exists.",
    };
  const next: Persisted = {
    ...state,
    records: state.records.filter((r) => r.id !== id),
  };
  return commit(next)
    ? { ok: true }
    : { ok: false, reason: "storage", error: STORAGE_ERROR };
}

// ─── Test support ───────────────────────────────────────────────────────────

/** Test support: re-reads saved data as a page load would. */
export function __reloadRiskFactorsForTest(): void {
  refreshRiskFactorsFromStorage();
}

/** Test support: forget memory and saved data. */
export function __resetRiskFactorsForTest(): void {
  try {
    window.localStorage.removeItem(RISK_FACTOR_STORAGE_KEY);
  } catch {
    // ignore
  }
  state = EMPTY;
  health = "ok";
  unreadableRaw = null;
  publish();
}