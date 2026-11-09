// Shared model + validators for the ONE authoritative Admissions snapshot
// (admissionsStateStore.ts): saved categories + append-only category-change
// history (US 20140) and the case-closure state (US 17573) live in one
// versioned record so they are always written, read and refreshed together.
// Pure: no storage, no React.

import type { ClosureData } from "./caseClosureStore";

// ─── Category slice ─────────────────────────────────────────────────────────

export interface AdmissionsCategoryChange {
  /** Unique, immutable. */
  id: string;
  admissionId: string;
  /** Category before the change ("" when none was assigned). */
  previousCategory: string;
  newCategory: string;
  /** Required, trimmed. */
  comment: string;
  /** ISO timestamp. */
  changedAt: string;
  /** Present only when the app knows who is signed in. Never invented. */
  changedBy?: { id?: string; name: string };
}

export interface AdmissionsCategoryRecord {
  admissionId: string;
  /** The saved category. */
  category: string;
  /** ISO timestamp of the last save. */
  updatedAt: string;
  /** Append-only, oldest first. */
  history: AdmissionsCategoryChange[];
}

export interface CategoriesSlice {
  nextSeq: number;
  records: Record<string, AdmissionsCategoryRecord>;
}

export const EMPTY_CATEGORIES: CategoriesSlice = {
  nextSeq: 1,
  records: {},
};

export const CATEGORY_ID_PREFIX = "CC-";
export const categorySeqId = (n: number) =>
  `${CATEGORY_ID_PREFIX}${String(n).padStart(6, "0")}`;

const isNonEmpty = (v: unknown): v is string =>
  typeof v === "string" && v.trim() !== "";
const isStr = (v: unknown): v is string => typeof v === "string";
const isObj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

function isChange(v: unknown): v is AdmissionsCategoryChange {
  const c = v as Partial<AdmissionsCategoryChange> | null;
  return (
    !!c &&
    typeof c === "object" &&
    typeof c.id === "string" &&
    /^CC-\d{6,}$/.test(c.id) &&
    isNonEmpty(c.admissionId) &&
    isStr(c.previousCategory) &&
    isNonEmpty(c.newCategory) &&
    isNonEmpty(c.comment) &&
    isNonEmpty(c.changedAt) &&
    (c.changedBy === undefined ||
      (!!c.changedBy &&
        typeof c.changedBy === "object" &&
        isNonEmpty(c.changedBy.name)))
  );
}

function isCategoryRecord(
  key: string,
  v: unknown,
): v is AdmissionsCategoryRecord {
  const r = v as Partial<AdmissionsCategoryRecord> | null;
  return (
    !!r &&
    typeof r === "object" &&
    r.admissionId === key &&
    isNonEmpty(r.category) &&
    isNonEmpty(r.updatedAt) &&
    Array.isArray(r.history) &&
    r.history.every((h) => isChange(h) && h.admissionId === key)
  );
}

/** The slice if `v` is a structurally valid, internally consistent
 *  categories slice ({ nextSeq, records }); otherwise null. */
export function validateCategoriesSlice(
  v: unknown,
): CategoriesSlice | null {
  if (!isObj(v)) return null;
  const { nextSeq, records } = v as {
    nextSeq?: unknown;
    records?: unknown;
  };
  if (typeof nextSeq !== "number" || !Number.isInteger(nextSeq))
    return null;
  if (!isObj(records)) return null;
  const entries = Object.entries(records);
  if (!entries.every(([k, r]) => isCategoryRecord(k, r))) return null;
  const ids = entries.flatMap(([, r]) =>
    (r as AdmissionsCategoryRecord).history.map((h) => h.id),
  );
  if (new Set(ids).size !== ids.length) return null;
  if (
    !ids.every(
      (id) => Number(id.slice(CATEGORY_ID_PREFIX.length)) < nextSeq,
    )
  )
    return null;
  return { nextSeq, records: records as CategoriesSlice["records"] };
}

// ─── Closure slice ──────────────────────────────────────────────────────────
// Deliberately as lenient as the store that wrote it: it checks what the
// closure rules depend on, not every optional field.

function isClosure(key: string, v: unknown): boolean {
  const c = v as Record<string, unknown> | null;
  return (
    isObj(c) &&
    c.caseId === key &&
    isStr(c.closingStartedAt) &&
    c.closingStartedAt !== "" &&
    (c.state === "closing" || c.state === "finalized") &&
    (c.name === undefined || isStr(c.name)) &&
    (c.finalizedAt === undefined || isStr(c.finalizedAt)) &&
    (c.finalizedBy === undefined || isStr(c.finalizedBy))
  );
}

function isNotification(v: unknown): boolean {
  const n = v as Record<string, unknown> | null;
  return (
    isObj(n) &&
    isStr(n.id) &&
    isStr(n.caseId) &&
    typeof n.read === "boolean"
  );
}

/** The closure data if `v` has the closure shape; otherwise null. */
export function validateClosureSlice(v: unknown): ClosureData | null {
  if (!isObj(v)) return null;
  const { closures, notifications } = v as {
    closures?: unknown;
    notifications?: unknown;
  };
  if (!isObj(closures) || !Array.isArray(notifications)) return null;
  if (!Object.entries(closures).every(([k, c]) => isClosure(k, c)))
    return null;
  if (!notifications.every(isNotification)) return null;
  return v as unknown as ClosureData;
}