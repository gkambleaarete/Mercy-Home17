// Med Review Hub records (US 20128) — the ONE persisted source behind
// Medications > Med Review Hub, Med Documentation and Count, read and written
// the same way from the normal Medications entry and from a Program's Med
// Reviews entry.
//
// What lives here, and what deliberately does not:
//  • Review Logs (Med Cart / Count / Med Documentation reviews) — owned by
//    this store, each with its canonical Program ID. Program NAMES are only
//    display labels resolved from the Program record.
//  • Documentation reviews and dispensation corrections — owned here but
//    only ever REFERENCE a canonical medication log by its id (the log's own
//    Program ID is the authority); administration data is never copied or
//    changed. Count and documentation rows themselves are read from
//    medicationLogStore (see medReviewViews.ts).
//
// Same storage convention as the other stores: one versioned localStorage
// key, all-or-nothing writes, useSyncExternalStore for subscribers. Saved
// data that cannot be read is reported and never overwritten. Prototype
// only: browser storage, not production persistence.
//
// Access: every read/write goes through the live access adapter
// (medicationLogAccess.ts). Each action has its own rule in
// REVIEW_ACTION_POLICY — viewing is not enough to write — and the Program
// must be inside the user's scope. Where the app defines no policy for an
// action the rule is a provisional, restrictive mapping onto existing
// capabilities (see that table); no capability names are invented.
//
// Actor: the reviewer / modifier recorded on a record is always the CURRENT
// user from the access adapter (id and name), never a caller-supplied name.

import { useSyncExternalStore } from "react";
import {
  getMedicationLogAccess,
  isProgramAuthorized,
  reviewActionAllowed,
  type ReviewAction,
} from "./medicationLogAccess";
import { getProgramById } from "./mockProgramsData";
import { getMedicationLogSnapshot } from "./medicationLogStore";

export const REVIEW_TYPES = [
  "Med Cart Review",
  "Count Review",
  "Med Documentation Review",
] as const;
export type ReviewType = (typeof REVIEW_TYPES)[number];

export interface ReviewHistoryEntry {
  id: string;
  /** ISO timestamp */
  at: string;
  modifier: string;
  /** Current user's id when the app provides one (the prototype may not). */
  modifierId?: string | null;
  field: string;
  prev: string;
  next: string;
}

export interface MedReviewLog {
  id: string;
  /** Canonical Program ID — the only Program association. */
  programId: number;
  reviewType: ReviewType;
  /** ISO "YYYY-MM-DD" */
  reviewDate: string;
  reviewer: string;
  reviewerId?: string | null;
  /** ISO "YYYY-MM-DD", or "" when the review type has no period. */
  startDate: string;
  endDate: string;
  numberOfIssues: number | null;
  hasIssue: boolean;
  details: string;
  /** Review-type specific answers (e.g. the Med Cart checklist). */
  payload?: Record<string, unknown>;
  /** ISO timestamps */
  createdAt: string;
  modifiedAt: string;
  history: ReviewHistoryEntry[];
}

/** One saved review of a canonical medication log (append-only). */
export interface DocumentationReview {
  id: string;
  /** Canonical medication log id. */
  logId: string;
  /** The log's own Program ID at the time of review (for scoped reads). */
  programId: number;
  reviewStatus: string;
  assignee: string;
  comment: string;
  reviewer: string;
  reviewerId?: string | null;
  /** ISO timestamp */
  reviewedAt: string;
}

/** A saved correction to what a log documents (append-only). The canonical
 *  log itself is never rewritten; the latest correction is overlaid. */
export interface DispensationCorrection {
  id: string;
  logId: string;
  programId: number;
  /** The new values ("" = that field was not changed). */
  staffDispensed: string;
  youthReceived: string;
  primaryCode: string;
  /** What each field showed immediately before this correction. */
  previous?: {
    staffDispensed: string;
    youthReceived: string;
    primaryCode: string;
  };
  comment: string;
  /** The current user at the time (name, and id when available). */
  by: string;
  byId?: string | null;
  /** ISO timestamp */
  at: string;
}

interface Persisted {
  version: 1;
  nextSeq: number;
  reviewLogs: MedReviewLog[];
  documentationReviews: DocumentationReview[];
  corrections: DispensationCorrection[];
}

const STORAGE_KEY = "mh.medReviews.v1";

type Health = "ok" | "unreadable";

export type MedReviewRead =
  | { status: "ok"; data: Persisted }
  | { status: "error" };

const EMPTY: Persisted = {
  version: 1,
  nextSeq: 1,
  reviewLogs: [],
  documentationReviews: [],
  corrections: [],
};

const isReviewLog = (v: unknown): v is MedReviewLog => {
  const r = v as Partial<MedReviewLog> | null;
  return (
    !!r &&
    typeof r.id === "string" &&
    typeof r.programId === "number" &&
    (REVIEW_TYPES as readonly unknown[]).includes(r.reviewType) &&
    typeof r.reviewDate === "string" &&
    typeof r.reviewer === "string" &&
    typeof r.startDate === "string" &&
    typeof r.endDate === "string" &&
    (r.numberOfIssues === null || typeof r.numberOfIssues === "number") &&
    typeof r.hasIssue === "boolean" &&
    typeof r.details === "string" &&
    typeof r.createdAt === "string" &&
    typeof r.modifiedAt === "string" &&
    Array.isArray(r.history)
  );
};
const isDocReview = (v: unknown): v is DocumentationReview => {
  const r = v as Partial<DocumentationReview> | null;
  return (
    !!r &&
    typeof r.id === "string" &&
    typeof r.logId === "string" &&
    typeof r.programId === "number" &&
    typeof r.reviewStatus === "string" &&
    typeof r.assignee === "string" &&
    typeof r.comment === "string" &&
    typeof r.reviewer === "string" &&
    typeof r.reviewedAt === "string"
  );
};
const isCorrection = (v: unknown): v is DispensationCorrection => {
  const r = v as Partial<DispensationCorrection> | null;
  return (
    !!r &&
    typeof r.id === "string" &&
    typeof r.logId === "string" &&
    typeof r.programId === "number" &&
    typeof r.staffDispensed === "string" &&
    typeof r.youthReceived === "string" &&
    typeof r.primaryCode === "string" &&
    typeof r.comment === "string" &&
    typeof r.by === "string" &&
    typeof r.at === "string"
  );
};

function load(): { data: Persisted; health: Health } {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage blocked: start empty; writes will fail visibly.
    return { data: EMPTY, health: "ok" };
  }
  if (raw === null) return { data: EMPTY, health: "ok" };
  try {
    const p = JSON.parse(raw) as Partial<Persisted> | null;
    if (
      p &&
      p.version === 1 &&
      typeof p.nextSeq === "number" &&
      Array.isArray(p.reviewLogs) &&
      Array.isArray(p.documentationReviews) &&
      Array.isArray(p.corrections) &&
      p.reviewLogs.every(isReviewLog) &&
      p.documentationReviews.every(isDocReview) &&
      p.corrections.every(isCorrection)
    )
      return { data: p as Persisted, health: "ok" };
  } catch {
    // fall through
  }
  return { data: EMPTY, health: "unreadable" };
}

let { data: state, health } = load();
let snapshot: MedReviewRead = toRead();
const listeners = new Set<() => void>();

function toRead(): MedReviewRead {
  return health === "ok"
    ? { status: "ok", data: state }
    : { status: "error" };
}
function publish() {
  snapshot = toRead();
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Picks up saves from another tab before reading or writing. */
export function refreshMedReviewsFromStorage(): void {
  const fresh = load();
  if (
    fresh.health !== health ||
    JSON.stringify(fresh.data) !== JSON.stringify(state)
  ) {
    state = fresh.data;
    health = fresh.health;
    publish();
  }
}

if (typeof window !== "undefined")
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY || e.key === null)
      refreshMedReviewsFromStorage();
  });

/** All-or-nothing: memory changes only after the storage write succeeded. */
function commit(next: Persisted): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return false;
  }
  state = next;
  health = "ok";
  publish();
  return true;
}

export function useMedReviews(): MedReviewRead {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );
}

/** Non-reactive read (refreshes first), for tests and one-off lookups. */
export function getMedReviews(): MedReviewRead {
  refreshMedReviewsFromStorage();
  return snapshot;
}

/** Test support: re-reads saved data as a page load would. */
export function __reloadMedReviewsForTest() {
  refreshMedReviewsFromStorage();
}

// ─── Access ─────────────────────────────────────────────────────────────────

/** Programs the current user may see Med Reviews for. */
export function accessibleProgramIds(): "all" | number[] {
  const a = getMedicationLogAccess();
  if (!reviewActionAllowed("viewReviews")) return [];
  return a.scope.kind === "all" ? "all" : a.scope.programIds;
}

/** Whether the Program is in the user's scope and they may view reviews. */
export const canAccessProgram = (programId: number): boolean =>
  reviewActionAllowed("viewReviews") &&
  isProgramAuthorized(getMedicationLogAccess().scope, programId);

/** The current user, as recorded on a saved change. */
const actor = () => {
  const u = getMedicationLogAccess().user;
  return { id: u.id, name: u.name };
};

const DENIED: Record<ReviewAction, string> = {
  viewReviews: "You don't have permission to view Med Reviews.",
  viewAttestationDetails:
    "You don't have permission to view attestation details.",
  exportReviews: "You don't have permission to export Med Reviews.",
  recordCount: "You don't have permission to record medication counts.",
  createReviewLog: "You don't have permission to create review logs.",
  editReviewLog: "You don't have permission to edit review logs.",
  reviewDocumentation:
    "You don't have permission to review medication documentation.",
  saveCorrection:
    "You don't have permission to save dispensation corrections.",
};

/** Action permission first (viewing never implies it), as a write error. */
function checkAction(action: ReviewAction): MedReviewWriteError | null {
  return reviewActionAllowed(action)
    ? null
    : { ok: false, reason: "forbidden", error: DENIED[action] };
}

// ─── Writes ─────────────────────────────────────────────────────────────────

export type MedReviewWriteError = {
  ok: false;
  reason:
    | "unreadable"
    | "storage"
    | "forbidden"
    | "scope"
    | "not-found"
    | "invalid"
    | "conflict";
  error: string;
  fieldErrors?: Record<string, string>;
  /** "conflict": the logs whose latest review changed since the form opened. */
  conflictLogIds?: string[];
};

/** `expectedProgramId` is the fixed Program of a Program-origin screen:
 *  anything that belongs to a different Program is refused. */
export interface WriteContext {
  expectedProgramId?: number | null;
}

const STORAGE_ERROR =
  "The change could not be saved. Your entries are kept — please try again.";
const FORBIDDEN =
  "You don't have access to Med Reviews for this Program.";

function writable(): MedReviewWriteError | null {
  refreshMedReviewsFromStorage();
  return health === "ok"
    ? null
    : {
        ok: false,
        reason: "unreadable",
        error:
          "Saved Med Review data can't be read, so nothing was changed.",
      };
}

/** Program checks shared by every write. */
function checkProgram(
  programId: number,
  ctx: WriteContext | undefined,
): MedReviewWriteError | null {
  if (
    ctx?.expectedProgramId != null &&
    ctx.expectedProgramId !== programId
  )
    return {
      ok: false,
      reason: "scope",
      error:
        "This doesn't belong to the Program you opened Med Reviews from, so it wasn't saved.",
    };
  if (!getProgramById(programId))
    return {
      ok: false,
      reason: "invalid",
      error: "Select a Program.",
      fieldErrors: { programId: "Select a Program." },
    };
  if (!canAccessProgram(programId))
    return { ok: false, reason: "forbidden", error: FORBIDDEN };
  return null;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const isIsoDate = (s: string) => {
  if (!ISO_DATE.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
};

const seqId = (prefix: string, n: number) =>
  `${prefix}-${String(n).padStart(6, "0")}`;

export interface NewReviewLog {
  programId: number;
  reviewType: ReviewType;
  reviewDate: string;
  startDate: string;
  endDate: string;
  numberOfIssues: number | null;
  hasIssue: boolean;
  details: string;
  payload?: Record<string, unknown>;
}

/** Creates a Review Log under its canonical Program. */
export function createReviewLog(
  input: NewReviewLog,
  ctx?: WriteContext,
): { ok: true; log: MedReviewLog } | MedReviewWriteError {
  const bad =
    checkAction("createReviewLog") ??
    writable() ??
    checkProgram(input.programId, ctx);
  if (bad) return bad;
  const who = actor();
  const fieldErrors: Record<string, string> = {};
  if (!(REVIEW_TYPES as readonly string[]).includes(input.reviewType))
    fieldErrors.reviewType = "Review Type is required.";
  if (!isIsoDate(input.reviewDate))
    fieldErrors.reviewDate = "Review Date is required.";
  const period = input.reviewType !== "Med Cart Review";
  if (period) {
    if (!isIsoDate(input.startDate))
      fieldErrors.startDate = "Start Date is required.";
    if (!isIsoDate(input.endDate))
      fieldErrors.endDate = "End Date is required.";
  }
  if (Object.keys(fieldErrors).length)
    return {
      ok: false,
      reason: "invalid",
      error: "Fix the highlighted fields.",
      fieldErrors,
    };
  const now = new Date().toISOString();
  const n = state.nextSeq;
  const log: MedReviewLog = {
    id: seqId("MRL", n),
    programId: input.programId,
    reviewType: input.reviewType,
    reviewDate: input.reviewDate,
    reviewer: who.name,
    reviewerId: who.id,
    startDate: input.startDate,
    endDate: input.endDate,
    numberOfIssues: input.numberOfIssues,
    hasIssue: input.hasIssue,
    details: input.details,
    ...(input.payload ? { payload: input.payload } : {}),
    createdAt: now,
    modifiedAt: now,
    history: [
      {
        id: seqId("MRH", n),
        at: now,
        modifier: who.name,
        modifierId: who.id,
        field: "Review Log",
        prev: "",
        next: "Created record",
      },
    ],
  };
  return commit({
    ...state,
    nextSeq: n + 1,
    reviewLogs: [...state.reviewLogs, log],
  })
    ? { ok: true, log }
    : { ok: false, reason: "storage", error: STORAGE_ERROR };
}

/** Saves the editable fields of a Review Log, re-resolving the latest saved
 *  record first. Program, type and dates are never changed here. */
export function updateReviewLog(
  id: string,
  patch: { hasIssue: boolean; details: string },
  ctx?: WriteContext,
): { ok: true; log: MedReviewLog } | MedReviewWriteError {
  const unreadable = checkAction("editReviewLog") ?? writable();
  if (unreadable) return unreadable;
  const who = actor();
  const latest = state.reviewLogs.find((l) => l.id === id);
  if (!latest)
    return {
      ok: false,
      reason: "not-found",
      error: "This review log no longer exists.",
    };
  const bad = checkProgram(latest.programId, ctx);
  if (bad) return bad;
  const now = new Date().toISOString();
  let n = state.nextSeq;
  const history = [...latest.history];
  const yn = (b: boolean) => (b ? "Yes" : "No");
  if (patch.hasIssue !== latest.hasIssue)
    history.push({
      id: seqId("MRH", n++),
      at: now,
      modifier: who.name,
      modifierId: who.id,
      field: "Has Issue",
      prev: yn(latest.hasIssue),
      next: yn(patch.hasIssue),
    });
  if (patch.details !== latest.details)
    history.push({
      id: seqId("MRH", n++),
      at: now,
      modifier: who.name,
      modifierId: who.id,
      field: "Comments",
      prev: latest.details,
      next: patch.details,
    });
  const updated: MedReviewLog = {
    ...latest,
    hasIssue: patch.hasIssue,
    details: patch.details,
    modifiedAt: history.length === latest.history.length ? latest.modifiedAt : now,
    history,
  };
  return commit({
    ...state,
    nextSeq: n,
    reviewLogs: state.reviewLogs.map((l) => (l.id === id ? updated : l)),
  })
    ? { ok: true, log: updated }
    : { ok: false, reason: "storage", error: STORAGE_ERROR };
}

/** The canonical, active medication log with this id, if any. */
function canonicalLog(logId: string) {
  return getMedicationLogSnapshot().logs.find(
    (l) => l.id === logId && !l.deletedAt,
  );
}

/** Resolves every log id to its canonical log, refusing anything missing or
 *  out of scope — a stale selection can never reach another Program. */
function resolveLogs(
  logIds: string[],
  ctx: WriteContext | undefined,
):
  | { ok: true; logs: NonNullable<ReturnType<typeof canonicalLog>>[] }
  | MedReviewWriteError {
  if (logIds.length === 0)
    return {
      ok: false,
      reason: "invalid",
      error: "Select at least one record.",
    };
  const logs = [];
  for (const id of logIds) {
    const log = canonicalLog(id);
    if (!log)
      return {
        ok: false,
        reason: "not-found",
        error:
          "A selected record is no longer available. Nothing was saved.",
      };
    const bad = checkProgram(log.programId, ctx);
    if (bad) return bad;
    logs.push(log);
  }
  return { ok: true, logs };
}

/** Latest saved review of a log by the existing ordering (reviewedAt, then
 *  id — the same one the screens project), or null when it has none. */
function latestReviewIdOf(logId: string): string | null {
  let best: DocumentationReview | null = null;
  for (const r of state.documentationReviews)
    if (
      r.logId === logId &&
      (!best || r.reviewedAt + r.id > best.reviewedAt + best.id)
    )
      best = r;
  return best ? best.id : null;
}

/** What each log's latest review was when a review form opened: its review
 *  id, or null for "no review yet" (explicit, never undefined). Pass it back
 *  to saveDocumentationReviews so a change made in the meantime is detected. */
export type ReviewBaselines = Record<string, string | null>;

/** Captures the baseline for a review form. Refreshes the shared state first. */
export function captureReviewBaselines(logIds: string[]): ReviewBaselines {
  refreshMedReviewsFromStorage();
  return Object.fromEntries(logIds.map((id) => [id, latestReviewIdOf(id)]));
}

/** Saves one review (status / assignee / comment) for each selected log, in
 *  one write.
 *
 *  Stale-state check: right after re-reading the saved data, every selected
 *  log's CURRENT latest review is compared with the baseline captured when
 *  the form opened. If any differ, the whole batch is rejected before
 *  anything is appended ("conflict") — a newer review is never overwritten
 *  or silently retried. This detects a change that is visible in this
 *  browser's saved data at the moment of saving; it is not a database
 *  transaction, and two tabs writing at the same instant can still race
 *  (localStorage has no compare-and-set). */
export function saveDocumentationReviews(
  input: {
    logIds: string[];
    reviewStatus: string;
    assignee: string;
    comment: string;
    /** The latest-review baselines captured when the form opened. */
    baselines: ReviewBaselines;
  },
  ctx?: WriteContext,
): { ok: true; count: number } | MedReviewWriteError {
  const unreadable = checkAction("reviewDocumentation") ?? writable();
  if (unreadable) return unreadable;
  const who = actor();
  const resolved = resolveLogs(input.logIds, ctx);
  if (!resolved.ok) return resolved;
  if (!input.reviewStatus.trim())
    return {
      ok: false,
      reason: "invalid",
      error: "Review Status is required.",
      fieldErrors: { reviewStatus: "Review Status is required." },
    };
  const baselines = input.baselines;
  if (!baselines || resolved.logs.some((l) => !(l.id in baselines)))
    return {
      ok: false,
      reason: "invalid",
      error:
        "The review state was not captured when this form opened, so nothing was saved. Close the form and open it again.",
    };
  const changed = resolved.logs.filter(
    (l) => latestReviewIdOf(l.id) !== baselines[l.id],
  );
  if (changed.length)
    return {
      ok: false,
      reason: "conflict",
      error:
        changed.length === 1
          ? "This record's review changed after you opened the form, so nothing was saved and your entries are kept. Close the form, check its current review status, and review it again."
          : `${changed.length} of the selected records have a review that changed after you opened the form, so nothing was saved and your entries are kept. Close the form, check their current review status, and review them again.`,
      conflictLogIds: changed.map((l) => l.id),
    };
  const now = new Date().toISOString();
  let n = state.nextSeq;
  const added: DocumentationReview[] = resolved.logs.map((log) => ({
    id: seqId("DRV", n++),
    logId: log.id,
    programId: log.programId,
    reviewStatus: input.reviewStatus,
    assignee: input.assignee,
    comment: input.comment,
    reviewer: who.name,
    reviewerId: who.id,
    reviewedAt: now,
  }));
  return commit({
    ...state,
    nextSeq: n,
    documentationReviews: [...state.documentationReviews, ...added],
  })
    ? { ok: true, count: added.length }
    : { ok: false, reason: "storage", error: STORAGE_ERROR };
}

/** What a canonical log documents for "Youth Received": only an explicit
 *  Yes / No recorded on the log counts; anything else is not recorded. */
export function canonicalYouthReceived(
  log: { details?: Record<string, string> },
): string {
  const v = log.details?.["Youth Received"];
  return v === "Yes" || v === "No" ? v : "";
}

/**
 * The dispensation values a log shows once saved corrections are applied
 * (per field, the latest correction that changed it, else the canonical
 * log). The canonical log is never rewritten. "Staff Dispensed" has no
 * canonical Yes/No (the log's own value is a staff name, a different
 * meaning), so it is blank unless a correction states it.
 */
export function effectiveDispensation(
  log: {
    primaryCode: string;
    details?: Record<string, string>;
  },
  corrections: DispensationCorrection[],
): { staffDispensed: string; youthReceived: string; primaryCode: string } {
  const out = {
    staffDispensed: "",
    youthReceived: canonicalYouthReceived(log),
    primaryCode: log.primaryCode,
  };
  for (const c of [...corrections].sort((a, b) =>
    (a.at + a.id).localeCompare(b.at + b.id),
  )) {
    if (c.staffDispensed) out.staffDispensed = c.staffDispensed;
    if (c.youthReceived) out.youthReceived = c.youthReceived;
    if (c.primaryCode) out.primaryCode = c.primaryCode;
  }
  return out;
}

/** Saves a correction for one log (the canonical log is not rewritten).
 *  It records the changed values, what they replaced, who made it and when;
 *  it is NOT an attestation and grants no attestation or log-edit right. */
export function saveDispensationCorrection(
  input: {
    logId: string;
    staffDispensed: string;
    youthReceived: string;
    primaryCode: string;
    comment: string;
  },
  ctx?: WriteContext,
): { ok: true } | MedReviewWriteError {
  const unreadable = checkAction("saveCorrection") ?? writable();
  if (unreadable) return unreadable;
  const resolved = resolveLogs([input.logId], ctx);
  if (!resolved.ok) return resolved;
  const log = resolved.logs[0];
  const changed =
    input.staffDispensed || input.youthReceived || input.primaryCode;
  if (!changed && !input.comment.trim())
    return {
      ok: false,
      reason: "invalid",
      error: "Enter a change and a comment.",
    };
  if (changed && !input.comment.trim())
    return {
      ok: false,
      reason: "invalid",
      error: "A comment is required for this change.",
      fieldErrors: { comment: "A comment is required for this change." },
    };
  const who = actor();
  const n = state.nextSeq;
  const rec: DispensationCorrection = {
    id: seqId("DCR", n),
    logId: input.logId,
    programId: log.programId,
    staffDispensed: input.staffDispensed,
    youthReceived: input.youthReceived,
    primaryCode: input.primaryCode,
    previous: effectiveDispensation(
      log,
      state.corrections.filter((c) => c.logId === log.id),
    ),
    comment: input.comment,
    by: who.name,
    byId: who.id,
    at: new Date().toISOString(),
  };
  return commit({
    ...state,
    nextSeq: n + 1,
    corrections: [...state.corrections, rec],
  })
    ? { ok: true }
    : { ok: false, reason: "storage", error: STORAGE_ERROR };
}

export type SeedReviewAddResult =
  | { ok: true; added: number }
  | { ok: false; reason: "unreadable" | "storage" };

/**
 * Adds sample (demo) documentation reviews and corrections that are NOT
 * already saved, matched by their stable ids. Saved records are never
 * replaced or re-timestamped, so running it again changes nothing, and
 * later user reviews, corrections and resolutions are untouched. The
 * sample ids are dedicated strings, so the id sequence counter stays valid
 * as it is. Unreadable saved data is left untouched. Bypasses the access
 * seam on purpose: this is prototype seeding, not a user action.
 */
export function addMissingSeedReviewRecords(input: {
  documentationReviews: DocumentationReview[];
  corrections: DispensationCorrection[];
  /** Optional sample Med Review Hub review logs (added by stable id). */
  reviewLogs?: MedReviewLog[];
}): SeedReviewAddResult {
  if (writable()) return { ok: false, reason: "unreadable" };
  const haveLog = new Set(state.reviewLogs.map((l) => l.id));
  const logs = (input.reviewLogs ?? []).filter((l) => !haveLog.has(l.id));
  const haveReview = new Set(state.documentationReviews.map((r) => r.id));
  const haveCorrection = new Set(state.corrections.map((c) => c.id));
  const reviews = input.documentationReviews.filter(
    (r) => !haveReview.has(r.id),
  );
  const corrections = input.corrections.filter(
    (c) => !haveCorrection.has(c.id),
  );
  if (reviews.length === 0 && corrections.length === 0 && logs.length === 0)
    return { ok: true, added: 0 };
  return commit({
    ...state,
    reviewLogs: [...state.reviewLogs, ...logs],
    documentationReviews: [...state.documentationReviews, ...reviews],
    corrections: [...state.corrections, ...corrections],
  })
    ? { ok: true, added: reviews.length + corrections.length + logs.length }
    : { ok: false, reason: "storage" };
}

/** Correction history of one log (newest first), for audit queries. Needs
 *  the view permission and the log's Program in scope. */
export function correctionHistory(
  logId: string,
):
  | { ok: true; corrections: DispensationCorrection[] }
  | MedReviewWriteError {
  const denied = checkAction("viewReviews");
  if (denied) return denied;
  refreshMedReviewsFromStorage();
  const log = canonicalLog(logId);
  if (!log)
    return { ok: false, reason: "not-found", error: "Record not found." };
  const bad = checkProgram(log.programId, undefined);
  if (bad) return bad;
  return {
    ok: true,
    corrections: state.corrections
      .filter((c) => c.logId === logId)
      .sort((a, b) => (b.at + b.id).localeCompare(a.at + a.id)),
  };
}