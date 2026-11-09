// C-SSRS assessments (US 20105 Screener, US 20139 Full-Lifetime) — the ONE
// saved source for both instruments.
//
// Ownership: every record keeps the Admissions record that owns it
// (`admissionsRecordId`), the testing youth key it is listed under
// (`youthKey`, see youthTestingAssessmentStore) and — only when verified —
// the Youth Constituent ID. The youth key makes the record visible on every
// profile of that youth; it never replaces the originating Admissions ID.
// Nothing here infers identity: callers pass ownership from
// resolveCssrsOwnership (lib/cssrsOwnership.ts).
//
// Compatibility: the existing Testing list (numeric ids, sample seed,
// document links) is untouched and keeps its own store. C-SSRS ids are
// strings ("CSSRS-000001") so they can never collide with those numeric
// ids; `cssrsAsTestRows` adapts THIS store's records into list rows and
// holds no copy of its own.
//
// Persistence: same convention as medReviewStore — one versioned
// localStorage key, all-or-nothing writes, useSyncExternalStore for
// subscribers. Saved data that cannot be read (corrupt, or a schema
// version this build does not know) is reported, left in storage exactly
// as found and never overwritten. PROTOTYPE PERSISTENCE ONLY: browser
// storage, not production storage.

import { useSyncExternalStore } from "react";
import {
  CSSRS_TEST_TYPE,
  emptyFullLifetimeResponses,
  emptyScreenerResponses,
  isCurrentFullLifetimeResponses,
  isFullLifetimeResponses,
  isScreenerResponses,
  type CssrsInstrument,
  type FullLifetimeResponses,
  type ScreenerResponses,
} from "./cssrsTypes";
import {
  FULL_LIFETIME_SUMMARY,
  normalizeFullLifetime,
  validateFullLifetime,
} from "./cssrsFullLifetimeRules";
import {
  normalizeScreenerResponses,
  SCREENER_SUMMARY,
} from "./cssrsScreener";

export const CSSRS_STORAGE_KEY = "mh.cssrsAssessments.v1";
export const CSSRS_SCHEMA_VERSION = 1 as const;

export interface CssrsOwnership {
  /** Admissions record that owns the assessment. Never a Constituent ID. */
  admissionsRecordId: string;
  /** Testing youth key (testingYouthKey) the record is listed under. */
  youthKey: string;
  /** Verified Youth Constituent ID, or null when not verified. */
  youthConstituentId: string | null;
}

interface CssrsBase extends CssrsOwnership {
  id: string;
  testType: string;
  /** ISO "YYYY-MM-DD" */
  assessmentDate: string;
  /** ISO timestamps */
  createdAt: string;
  modifiedAt: string;
}

export type CssrsScreenerAssessment = CssrsBase & {
  instrument: "cssrs-screener";
  responses: ScreenerResponses;
};
export type CssrsFullLifetimeAssessment = CssrsBase & {
  instrument: "cssrs-full-lifetime";
  responses: FullLifetimeResponses;
};
export type CssrsAssessment =
  CssrsScreenerAssessment | CssrsFullLifetimeAssessment;

interface Persisted {
  version: typeof CSSRS_SCHEMA_VERSION;
  nextSeq: number;
  records: CssrsAssessment[];
}

const EMPTY: Persisted = {
  version: CSSRS_SCHEMA_VERSION,
  nextSeq: 1,
  records: [],
};

// ─── Validation ─────────────────────────────────────────────────────────────

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export const isIsoDate = (s: unknown): s is string => {
  if (typeof s !== "string" || !ISO_DATE.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
};

const isNonEmpty = (v: unknown): v is string =>
  typeof v === "string" && v.trim() !== "";

const ID_PREFIX = "CSSRS-";
export const isCssrsAssessmentId = (
  id: unknown,
): id is string =>
  typeof id === "string" && /^CSSRS-\d{6,}$/.test(id);
const seqId = (n: number) =>
  `${ID_PREFIX}${String(n).padStart(6, "0")}`;

function isRecord(v: unknown): v is CssrsAssessment {
  const r = v as Partial<CssrsAssessment> | null;
  if (!r || typeof r !== "object") return false;
  const base =
    isCssrsAssessmentId(r.id) &&
    isNonEmpty(r.admissionsRecordId) &&
    isNonEmpty(r.youthKey) &&
    (r.youthConstituentId === null ||
      isNonEmpty(r.youthConstituentId)) &&
    isIsoDate(r.assessmentDate) &&
    typeof r.createdAt === "string" &&
    typeof r.modifiedAt === "string";
  if (!base) return false;
  return r.instrument === "cssrs-screener"
    ? r.testType === CSSRS_TEST_TYPE[r.instrument] &&
        isScreenerResponses(r.responses)
    : r.instrument === "cssrs-full-lifetime"
      ? r.testType === CSSRS_TEST_TYPE[r.instrument] &&
        isFullLifetimeResponses(r.responses)
      : false;
}

// ─── Load / publish ─────────────────────────────────────────────────────────

export type CssrsUnreadableReason =
  "corrupt" | "unsupported-version";
type Health = "ok" | CssrsUnreadableReason;

export type CssrsRead =
  | { status: "ok"; records: readonly CssrsAssessment[] }
  | { status: "error"; reason: CssrsUnreadableReason };

function load(): {
  data: Persisted;
  health: Health;
  raw: string | null;
} {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(CSSRS_STORAGE_KEY);
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
    p.version !== CSSRS_SCHEMA_VERSION
  )
    return { data: EMPTY, health: "unsupported-version", raw };
  if (
    p &&
    p.version === CSSRS_SCHEMA_VERSION &&
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
let snapshot: CssrsRead = toRead();
const listeners = new Set<() => void>();

function toRead(): CssrsRead {
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
export function refreshCssrsFromStorage(): void {
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
    if (e.key === CSSRS_STORAGE_KEY || e.key === null)
      refreshCssrsFromStorage();
  });

/** All-or-nothing: memory changes only after the storage write succeeded. */
function commit(next: Persisted): boolean {
  try {
    window.localStorage.setItem(
      CSSRS_STORAGE_KEY,
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

export function useCssrsAssessments(): CssrsRead {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );
}

/** Non-reactive read (refreshes first). */
export function getCssrsAssessments(): CssrsRead {
  refreshCssrsFromStorage();
  return snapshot;
}

/** Youth visibility: every record listed under the youth key, whichever
 *  Admissions record owns it. Each keeps its own `admissionsRecordId`. */
export function cssrsForYouth(
  read: CssrsRead,
  youthKey: string,
): CssrsAssessment[] {
  return read.status === "ok"
    ? read.records.filter((r) => r.youthKey === youthKey)
    : [];
}

/** Only the records owned by one Admissions record. */
export function cssrsForAdmissionsRecord(
  read: CssrsRead,
  admissionsRecordId: string,
): CssrsAssessment[] {
  return read.status === "ok"
    ? read.records.filter(
        (r) => r.admissionsRecordId === admissionsRecordId,
      )
    : [];
}

/** The saved text of data that could not be read, so it can be recovered
 *  by hand. Null when storage is readable or empty. */
export function getUnreadableCssrsData(): {
  reason: CssrsUnreadableReason;
  raw: string;
} | null {
  refreshCssrsFromStorage();
  return health !== "ok" && unreadableRaw !== null
    ? { reason: health, raw: unreadableRaw }
    : null;
}

// ─── Test-list adapter ──────────────────────────────────────────────────────

/** A C-SSRS record shaped like a Testing list row. Read-only view of this
 *  store; the string id never collides with the list's numeric ids. */
export interface CssrsTestRow {
  id: string;
  date: string;
  test: string;
  summary: string;
  source: "cssrs";
  admissionsRecordId: string;
}

export const cssrsAsTestRows = (
  records: readonly CssrsAssessment[],
): CssrsTestRow[] =>
  records.map((r) => ({
    id: r.id,
    date: r.assessmentDate,
    test: r.testType,
    // Factual only — never an aggregate clinical result.
    summary:
      r.instrument === "cssrs-screener"
        ? SCREENER_SUMMARY
        : FULL_LIFETIME_SUMMARY,
    source: "cssrs",
    admissionsRecordId: r.admissionsRecordId,
  }));

// ─── Writes ─────────────────────────────────────────────────────────────────

export type CssrsWriteError = {
  ok: false;
  reason: "unreadable" | "storage" | "invalid" | "not-found";
  error: string;
  fieldErrors?: Record<string, string>;
};
export type CssrsWriteResult<T> =
  { ok: true; record: T } | CssrsWriteError;

const STORAGE_ERROR =
  "The assessment could not be saved. Your entries are kept — please try again.";

function writable(): CssrsWriteError | null {
  refreshCssrsFromStorage();
  return health === "ok"
    ? null
    : {
        ok: false,
        reason: "unreadable",
        error:
          "Saved C-SSRS data can't be read, so nothing was changed. The saved data has been left as it is.",
      };
}

function invalid(
  field: string,
  message: string,
): CssrsWriteError {
  return {
    ok: false,
    reason: "invalid",
    error: message,
    fieldErrors: { [field]: message },
  };
}

function checkOwnership(
  o: CssrsOwnership,
): CssrsWriteError | null {
  if (!isNonEmpty(o.admissionsRecordId))
    return invalid(
      "admissionsRecordId",
      "A C-SSRS assessment must belong to an Admissions record.",
    );
  if (!isNonEmpty(o.youthKey))
    return invalid(
      "youthKey",
      "The youth for this assessment is missing.",
    );
  if (
    o.youthConstituentId !== null &&
    !isNonEmpty(o.youthConstituentId)
  )
    return invalid(
      "youthConstituentId",
      "The Youth Constituent link is not valid.",
    );
  return null;
}

export type NewCssrsAssessment =
  | {
      instrument: "cssrs-screener";
      ownership: CssrsOwnership;
      assessmentDate: string;
      responses?: ScreenerResponses;
    }
  | {
      instrument: "cssrs-full-lifetime";
      ownership: CssrsOwnership;
      assessmentDate: string;
      responses?: FullLifetimeResponses;
    };

/** Saves one new assessment. Nothing changes unless the write succeeds. */
export function createCssrsAssessment(
  input: NewCssrsAssessment,
): CssrsWriteResult<CssrsAssessment> {
  const blocked = writable();
  if (blocked) return blocked;
  const bad = checkOwnership(input.ownership);
  if (bad) return bad;
  if (!isIsoDate(input.assessmentDate))
    return invalid(
      "assessmentDate",
      "Enter a valid assessment date.",
    );

  const now = new Date().toISOString();
  const base = {
    id: seqId(state.nextSeq),
    admissionsRecordId: input.ownership.admissionsRecordId,
    youthKey: input.ownership.youthKey,
    youthConstituentId: input.ownership.youthConstituentId,
    testType: CSSRS_TEST_TYPE[input.instrument],
    assessmentDate: input.assessmentDate,
    createdAt: now,
    modifiedAt: now,
  };
  let record: CssrsAssessment;
  if (input.instrument === "cssrs-screener") {
    const given = input.responses ?? emptyScreenerResponses();
    if (!isScreenerResponses(given))
      return invalid(
        "responses",
        "The responses are not valid.",
      );
    // Hidden (not applicable) answers are never saved, whoever calls.
    const responses = normalizeScreenerResponses(given);
    record = {
      ...base,
      instrument: input.instrument,
      responses,
    };
  } else {
    const given =
      input.responses ?? emptyFullLifetimeResponses();
    // New saves are always the current payload version.
    if (!isCurrentFullLifetimeResponses(given))
      return invalid(
        "responses",
        "The responses are not valid.",
      );
    // Answers that do not apply are never saved, and an incomplete or
    // inconsistent Full Lifetime assessment cannot be saved at all.
    const responses = normalizeFullLifetime(given);
    const fullErrors = validateFullLifetime({
      assessmentDate: input.assessmentDate,
      responses,
    });
    if (Object.keys(fullErrors).length > 0)
      return {
        ok: false,
        reason: "invalid",
        error: "Complete the highlighted fields.",
        fieldErrors: fullErrors,
      };
    record = {
      ...base,
      instrument: input.instrument,
      responses,
    };
  }
  const next: Persisted = {
    version: CSSRS_SCHEMA_VERSION,
    nextSeq: state.nextSeq + 1,
    records: [...state.records, record],
  };
  return commit(next)
    ? { ok: true, record }
    : { ok: false, reason: "storage", error: STORAGE_ERROR };
}

export interface CssrsEdit<R> {
  assessmentDate?: string;
  responses: R;
}

/** Functional update of one assessment against the LATEST saved record
 *  (re-read first), so a stale form cannot overwrite a newer save.
 *  Ownership, id and instrument can never change. */
export function updateCssrsAssessment(
  id: string,
  update: (
    prev: CssrsAssessment,
  ) => CssrsEdit<ScreenerResponses | FullLifetimeResponses>,
): CssrsWriteResult<CssrsAssessment> {
  const blocked = writable();
  if (blocked) return blocked;
  const prev = state.records.find((r) => r.id === id);
  if (!prev)
    return {
      ok: false,
      reason: "not-found",
      error: "This assessment no longer exists.",
    };
  const edit = update(prev);
  const assessmentDate =
    edit.assessmentDate ?? prev.assessmentDate;
  if (!isIsoDate(assessmentDate))
    return invalid(
      "assessmentDate",
      "Enter a valid assessment date.",
    );
  const valid =
    prev.instrument === "cssrs-screener"
      ? isScreenerResponses(edit.responses)
      : // Reading accepts legacy records; saving needs the current version.
        isCurrentFullLifetimeResponses(edit.responses);
  if (!valid)
    return invalid("responses", "The responses are not valid.");
  if (prev.instrument === "cssrs-full-lifetime") {
    const fullErrors = validateFullLifetime({
      assessmentDate,
      responses: edit.responses as FullLifetimeResponses,
    });
    if (Object.keys(fullErrors).length > 0)
      return {
        ok: false,
        reason: "invalid",
        error: "Complete the highlighted fields.",
        fieldErrors: fullErrors,
      };
  }
  const record = {
    ...prev,
    assessmentDate,
    responses:
      prev.instrument === "cssrs-screener"
        ? normalizeScreenerResponses(
            edit.responses as ScreenerResponses,
          )
        : normalizeFullLifetime(
            edit.responses as FullLifetimeResponses,
          ),
    modifiedAt: new Date().toISOString(),
  } as CssrsAssessment;
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

// ─── Test support ───────────────────────────────────────────────────────────

/** Test support: re-reads saved data as a page load would. */
export function __reloadCssrsForTest(): void {
  refreshCssrsFromStorage();
}

/** Test support: forget memory and saved data. */
export function __resetCssrsForTest(): void {
  try {
    window.localStorage.removeItem(CSSRS_STORAGE_KEY);
  } catch {
    // ignore
  }
  state = EMPTY;
  health = "ok";
  unreadableRaw = null;
  publish();
}