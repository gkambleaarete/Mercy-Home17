// Admissions category changes (US 20140) — saved Pipeline category and its
// append-only change history. The category is `Lead.status`; `Lead.stage`
// (pipeline stage) and `caseInfoFormData.category` (DCFS / Private Pay /
// Medicaid) are different fields and are never touched here.
//
// Keyed by the Admissions/profile id (`lead.id`, e.g. "L-001"). Never by
// youthId: L-001 and L-019 share youth Y-001 but are separate admissions.
// The mock lead is only the BASELINE — a record exists here once a change
// has been saved, and ALL_LEADS is never mutated.
//
// Persistence (Chunk 3): the categories, their history and the case-closure
// state are ONE versioned snapshot — see admissionsStateStore.ts, which
// owns storage, migration from the earlier two keys, refresh, and the single
// all-or-nothing write. This module is the category view over it, plus the
// category-change operation that stages category + history + the coupled
// closure effect as ONE commit.

import { useMemo, useSyncExternalStore } from "react";
import {
  categorySeqId,
  type AdmissionsCategoryChange,
  type AdmissionsCategoryRecord,
  type CategoriesSlice,
} from "./admissionsStateModel";
import {
  commitAdmissionsState,
  getAdmissionsState,
  getAdmissionsStateHealth,
  getUnreadableAdmissionsStateData,
  refreshAdmissionsState,
  refuse,
  subscribeAdmissionsState,
  __resetAdmissionsStateForTest,
  ADMISSIONS_STATE_STORAGE_KEY,
  LEGACY_CATEGORY_STORAGE_KEY,
  type AdmissionsStateUnreadableReason,
} from "./admissionsStateStore";
import { getTotalAlertCount } from "./mockLeadsData";
import {
  planCaseClosureReopen,
  planCaseClosureStart,
  type ClosureData,
} from "./caseClosureStore";

export type {
  AdmissionsCategoryChange,
  AdmissionsCategoryRecord,
} from "./admissionsStateModel";

/** Where saved categories are stored now (the authoritative snapshot). */
export const ADMISSIONS_CATEGORY_STORAGE_KEY =
  ADMISSIONS_STATE_STORAGE_KEY;
/** The earlier, category-only key — read once for migration, never written. */
export const ADMISSIONS_CATEGORY_LEGACY_STORAGE_KEY =
  LEGACY_CATEGORY_STORAGE_KEY;

/** The selectable Admissions Pipeline categories. */
export const ADMISSIONS_CATEGORY_OPTIONS = [
  "Referral",
  "Info Session Scheduled",
  "Program Waitlist",
  "Delayed",
  "Closed",
] as const;

const isNonEmpty = (v: unknown): v is string =>
  typeof v === "string" && v.trim() !== "";

// ─── Reads ──────────────────────────────────────────────────────────────────

export type AdmissionsCategoryUnreadableReason =
  AdmissionsStateUnreadableReason;

export type AdmissionsCategoryRead =
  | {
      status: "ok";
      records: Readonly<Record<string, AdmissionsCategoryRecord>>;
    }
  | {
      status: "error";
      reason: AdmissionsCategoryUnreadableReason;
    };

// The read snapshot is rebuilt only when the categories slice (or health)
// changes, so closure-only updates never re-render category readers.
let cachedFor: { slice: CategoriesSlice; health: string } | null = null;
let cachedRead: AdmissionsCategoryRead = {
  status: "ok",
  records: {},
};
function currentRead(): AdmissionsCategoryRead {
  const slice = getAdmissionsState().categories;
  const health = getAdmissionsStateHealth();
  if (
    cachedFor &&
    cachedFor.slice === slice &&
    cachedFor.health === health
  )
    return cachedRead;
  cachedFor = { slice, health };
  cachedRead =
    health === "ok"
      ? { status: "ok", records: slice.records }
      : {
          status: "error",
          reason: health as AdmissionsCategoryUnreadableReason,
        };
  return cachedRead;
}

/** Picks up saves from another tab (or a reload) — refreshes the whole
 *  snapshot, so categories and closures move together. */
export function refreshAdmissionsCategoriesFromStorage(): void {
  refreshAdmissionsState();
}

export function useAdmissionsCategories(): AdmissionsCategoryRead {
  return useSyncExternalStore(
    subscribeAdmissionsState,
    currentRead,
    currentRead,
  );
}

/** Non-reactive read (refreshes first). */
export function getAdmissionsCategories(): AdmissionsCategoryRead {
  refreshAdmissionsState();
  return currentRead();
}

/** The category to show for one admission: the saved one when this store
 *  holds a record for it, otherwise the baseline (the mock lead's status).
 *  An unreadable store falls back to the baseline — callers must surface
 *  the error (see `read.status`). */
export function effectiveAdmissionsCategory(
  read: AdmissionsCategoryRead,
  admissionId: string,
  baselineCategory: string,
): string {
  if (read.status !== "ok") return baselineCategory;
  return read.records[admissionId]?.category ?? baselineCategory;
}

/** Saved history for one admission, oldest first. */
export function admissionsCategoryHistory(
  read: AdmissionsCategoryRead,
  admissionId: string,
): readonly AdmissionsCategoryChange[] {
  return read.status === "ok"
    ? (read.records[admissionId]?.history ?? [])
    : [];
}

/** A newest-first COPY of a history, for display. The store's own order
 *  (oldest first, append-only) is never changed. Ties on the timestamp fall
 *  back to the entry id, which only grows. */
export function categoryChangesNewestFirst(
  history: readonly AdmissionsCategoryChange[],
): AdmissionsCategoryChange[] {
  return [...history].sort(
    (a, b) =>
      b.changedAt.localeCompare(a.changedAt) ||
      b.id.localeCompare(a.id),
  );
}

/** An oldest-first (ascending) COPY of a history, for display. The store's
 *  own history is already in this order, but display doesn't depend on that:
 *  entries are ordered by timestamp, ties by the ever-growing entry id. */
export function categoryChangesAscending(
  history: readonly AdmissionsCategoryChange[],
): AdmissionsCategoryChange[] {
  return [...history].sort(
    (a, b) =>
      a.changedAt.localeCompare(b.changedAt) ||
      a.id.localeCompare(b.id),
  );
}

/** Leads with their saved category applied. Returns new objects only for
 *  changed leads; the input array and its leads are never mutated. */
export function withSavedCategories<
  T extends { id: string; status: string },
>(leads: readonly T[], read: AdmissionsCategoryRead): T[] {
  if (read.status !== "ok") return leads.slice();
  return leads.map((l) => {
    const saved = read.records[l.id]?.category;
    return saved !== undefined && saved !== l.status
      ? { ...l, status: saved }
      : l;
  });
}

/** THE shared way for any Admissions view to read leads: `leads` with the
 *  saved category applied by lead.id (everything else on each lead — alerts,
 *  stage, local edits — is the caller's own, untouched), plus the read state
 *  so the view can show `AdmissionsCategoryNotice` when saved categories
 *  can't be read. When they can't, `leads` hold baseline values and
 *  `categoryError` is set — never present those as loaded saved data. */
export function useLeadsWithSavedCategories<
  T extends { id: string; status: string },
>(
  baseLeads: readonly T[],
): {
  leads: T[];
  categoryRead: AdmissionsCategoryRead;
  categoryError: AdmissionsCategoryUnreadableReason | null;
} {
  const categoryRead = useAdmissionsCategories();
  const leads = useMemo(
    () => withSavedCategories(baseLeads, categoryRead),
    [baseLeads, categoryRead],
  );
  return {
    leads,
    categoryRead,
    categoryError:
      categoryRead.status === "error" ? categoryRead.reason : null,
  };
}

/** How many category-change comments the given admissions have in total
 *  (every saved history entry, by lead.id). 0 when saved categories can't
 *  be read — nothing unreadable is counted as saved. */
export function countCategoryComments(
  leads: readonly { id: string }[],
  read: AdmissionsCategoryRead,
): number {
  if (read.status !== "ok") return 0;
  return leads.reduce(
    (n, l) => n + (read.records[l.id]?.history.length ?? 0),
    0,
  );
}

/** How many admissions have at least one category-change comment — one
 *  each, however many comments they have. 0 when saved categories can't be
 *  read. */
export function countAdmissionsWithComments(
  leads: readonly { id: string }[],
  read: AdmissionsCategoryRead,
): number {
  if (read.status !== "ok") return 0;
  return leads.filter(
    (l) => (read.records[l.id]?.history.length ?? 0) > 0,
  ).length;
}

/** The Alerts KPI (Pipeline card and Alerts drilldown total): existing
 *  lead.alerts (getTotalAlertCount, unchanged) PLUS one for each admission
 *  that has category-change comments — an admission with many comments adds
 *  just one. Over ALL admissions in the collection, not a filtered table.
 *  Product decision for US 20140. Comments are still not alerts: they never
 *  enter the alert list, severity filters or search, and
 *  `getTotalAlertCount` alone stays alerts-only. */
export function getAlertsKpiTotal(
  leads: readonly { id: string; alerts: string[] }[],
  read: AdmissionsCategoryRead,
): number {
  return (
    getTotalAlertCount(leads as Parameters<typeof getTotalAlertCount>[0]) +
    countAdmissionsWithComments(leads, read)
  );
}

/** The saved text of data that could not be read, for recovery by hand. */
export function getUnreadableAdmissionsCategoryData(): {
  reason: AdmissionsCategoryUnreadableReason;
  raw: string;
  /** Which storage key held it. */
  key?: string;
} | null {
  return getUnreadableAdmissionsStateData();
}

// ─── Writes ─────────────────────────────────────────────────────────────────

export type AdmissionsCategoryWriteError = {
  ok: false;
  reason:
    | "unreadable"
    | "storage"
    | "invalid"
    | "stale"
    | "unresolved-rule";
  error: string;
};
export type AdmissionsCategoryWriteResult =
  | {
      ok: true;
      record: AdmissionsCategoryRecord;
      change: AdmissionsCategoryChange;
    }
  | AdmissionsCategoryWriteError;

/** UNCONFIRMED BUSINESS RULE: what happens when an admission has no
 *  category yet (an "initial assignment"). No workflow for it is documented
 *  or implemented anywhere in the app, so rather than silently saving a
 *  category without the required comment, a change from "no category" is
 *  refused with this message and the record is left as it is. Every
 *  admission in the current data has a category, so normal changes between
 *  existing categories are unaffected. */
export const INITIAL_ASSIGNMENT_UNRESOLVED_MESSAGE =
  "This admission has no category yet. How a first category is assigned has not been defined, so it can't be set here.";

/** A reason the change can't start from `currentCategory`, or null. Lets
 *  the UI refuse before asking for a comment. */
export function categoryChangeBlocker(
  currentCategory: string,
): string | null {
  return isNonEmpty(currentCategory)
    ? null
    : INITIAL_ASSIGNMENT_UNRESOLVED_MESSAGE;
}

export interface ChangeAdmissionsCategoryInput {
  admissionId: string;
  /** Youth name — recorded on the Closing List when entering Closed. */
  admissionName: string;
  /** The mock lead's status; used when nothing is saved yet. */
  baselineCategory: string;
  /** The category the user was looking at when they chose to change it.
   *  A mismatch with the saved one (another tab saved first) is refused. */
  expectedCurrentCategory: string;
  newCategory: string;
  comment: string;
  changedBy?: { id?: string; name: string };
  now?: Date;
}

/** Saves a category change, its comment/history entry and the coupled
 *  closure effect as ONE staged change in the authoritative snapshot: the
 *  complete next state is built and validated first, written with a single
 *  write, and published only after that write succeeded. Any failure leaves
 *  the previous category, history, closures and notifications — in memory
 *  and in storage — exactly as they were. The snapshot is refreshed first,
 *  so a category saved meanwhile (another tab) makes this change stale. */
export function changeAdmissionsCategory(
  input: ChangeAdmissionsCategoryInput,
): AdmissionsCategoryWriteResult {
  const r = commitAdmissionsState<{
    record: AdmissionsCategoryRecord;
    change: AdmissionsCategoryChange;
  }>((s) => {
    if (!isNonEmpty(input.admissionId))
      return refuse("invalid", "An Admissions record is required.");
    if (
      !(ADMISSIONS_CATEGORY_OPTIONS as readonly string[]).includes(
        input.newCategory,
      )
    )
      return refuse("invalid", "Choose a valid category.");

    const existing = s.categories.records[input.admissionId];
    const current = existing?.category ?? input.baselineCategory;
    if (current !== input.expectedCurrentCategory)
      return refuse(
        "stale",
        `This admission's category is now "${current}". Close this dialog and try again.`,
      );
    const blocker = categoryChangeBlocker(current);
    if (blocker) return refuse("unresolved-rule", blocker);
    if (input.newCategory === current)
      return refuse(
        "invalid",
        "Choose a category different from the current one.",
      );
    const comment = input.comment.trim();
    if (comment === "")
      return refuse("invalid", "Comments are required.");

    const now = input.now ?? new Date();
    const stamp = now.toISOString();
    const change: AdmissionsCategoryChange = {
      id: categorySeqId(s.categories.nextSeq),
      admissionId: input.admissionId,
      previousCategory: current,
      newCategory: input.newCategory,
      comment,
      changedAt: stamp,
      ...(input.changedBy ? { changedBy: input.changedBy } : {}),
    };
    const record: AdmissionsCategoryRecord = {
      admissionId: input.admissionId,
      category: input.newCategory,
      updatedAt: stamp,
      history: [...(existing?.history ?? []), change],
    };

    // Coupled closure effect, from the same rule the dashboard used.
    let closure: ClosureData = s.closure;
    if (input.newCategory === "Closed" && current !== "Closed")
      closure =
        planCaseClosureStart(
          input.admissionId,
          input.admissionName,
          now,
          s.closure,
        ) ?? s.closure;
    else if (input.newCategory !== "Closed" && current === "Closed")
      closure = planCaseClosureReopen(input.admissionId, s.closure) ?? s.closure;

    return {
      next: {
        ...s,
        categories: {
          nextSeq: s.categories.nextSeq + 1,
          records: { ...s.categories.records, [input.admissionId]: record },
        },
        closure,
      },
      value: { record, change },
    };
  });
  if (!r.ok)
    return {
      ok: false,
      reason: r.reason as AdmissionsCategoryWriteError["reason"],
      error: r.error,
    };
  return { ok: true, record: r.value.record, change: r.value.change };
}

/** Test-only reset: forgets saved categories, closures and every storage
 *  key (memory and storage). */
export function __resetAdmissionsCategoriesForTest(): void {
  __resetAdmissionsStateForTest();
}