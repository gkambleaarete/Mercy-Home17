// Pure search / filter / sort logic for Friends First Mentor Search (US 19877).
// No React, storage or store access — the page builds rows from the shared
// mentor sources and hands them here.

import type { FFSubProgramme } from "../data/mockFriendsFirstData";

export type MentorColumnKey =
  | "name"
  | "subProgramme"
  | "status"
  | "accountCreatedDate"
  | "startDate"
  | "coordinator"
  | "location"
  | "age"
  | "interests"
  | "ethnicity"
  | "religion"
  | "promotionDate"
  | "pipelineStage";

export interface MentorSearchRow {
  /** Record id the Mentor Detail route opens. */
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  initials: string;
  email: string;
  subProgrammes: FFSubProgramme[];
  /** Saved status label (as Mentor Application Details shows it). */
  status: string;
  /** Saved pipeline stage; independent of status. */
  pipelineStage: string;
  /** Applicant-side account creation date, MM/DD/YYYY; "" until that
   *  source is available (application start is not a substitute). */
  accountCreatedDate: string;
  /** MM/DD/YYYY or "" when the source has none. */
  startDate: string;
  coordinator: string;
  location: string;
  /** Completed years from a valid birth date; null when unknown. */
  age: number | null;
  interests: string[];
  ethnicity: string;
  religion: string;
  /** MM/DD/YYYY or "" when the source has none. */
  promotionDate: string;
  /** Current readiness problems (a warning; never removes the row). */
  readinessWarnings: string[];
  /** Prototype fixture row. */
  demo: boolean;
}

export interface MentorSearchCriteria {
  firstName: string;
  lastName: string;
  email: string;
  subProgrammes: FFSubProgramme[];
}

export const BLANK_CRITERIA: MentorSearchCriteria = {
  firstName: "",
  lastName: "",
  email: "",
  subProgrammes: [],
};

/** Blank value in a column filter — the shared ColumnFilter's convention. */
export const BLANK_FILTER_VALUE = "—";

export type ColumnFilters = Partial<
  Record<MentorColumnKey, string[]>
>;

// ─── Dates / age ────────────────────────────────────────────────────────────

const MDY = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const ISO = /^(\d{4})-(\d{2})-(\d{2})/;

/** Valid calendar date as [y, m, d] from MM/DD/YYYY or YYYY-MM-DD. */
export function parseDateParts(
  v: string | undefined | null,
): [number, number, number] | null {
  if (!v) return null;
  const s = v.trim();
  let y: number, m: number, d: number;
  const a = MDY.exec(s);
  const b = ISO.exec(s);
  if (a) [m, d, y] = [Number(a[1]), Number(a[2]), Number(a[3])];
  else if (b)
    [y, m, d] = [Number(b[1]), Number(b[2]), Number(b[3])];
  else return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  )
    return null;
  return [y, m, d];
}

/** Sortable YYYY-MM-DD, or "" when not a valid date. */
export function dateSortKey(v: string): string {
  const p = parseDateParts(v);
  return p
    ? `${p[0]}-${String(p[1]).padStart(2, "0")}-${String(p[2]).padStart(2, "0")}`
    : "";
}

/** Completed years at `today`; null for a missing/invalid/future date. */
export function ageFromBirthDate(
  dob: string | undefined | null,
  today: Date = new Date(),
): number | null {
  const p = parseDateParts(dob);
  if (!p) return null;
  const [y, m, d] = p;
  const ty = today.getFullYear();
  const tm = today.getMonth() + 1;
  const td = today.getDate();
  let age = ty - y;
  if (tm < m || (tm === m && td < d)) age -= 1;
  return age >= 0 ? age : null;
}

/** Splits a free-text interests answer into distinct values. */
export function splitInterests(
  text: string | undefined,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of (text ?? "").split(/[,;\n]+/)) {
    const t = part.trim();
    if (t && !seen.has(t.toLowerCase())) {
      seen.add(t.toLowerCase());
      out.push(t);
    }
  }
  return out;
}

export function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (
    parts[0][0] +
    (parts.length > 1 ? parts[parts.length - 1][0] : "")
  ).toUpperCase();
}

// ─── Column values ──────────────────────────────────────────────────────────

/** The filterable values of one cell; [] means blank. */
export function cellValues(
  row: MentorSearchRow,
  key: MentorColumnKey,
): string[] {
  switch (key) {
    case "name":
      // Identity as displayed: the name with the email shown below it.
      return [`${row.name} (${row.email})`];
    case "subProgramme":
      return row.subProgrammes;
    case "interests":
      return row.interests;
    case "age":
      return row.age === null ? [] : [String(row.age)];
    default: {
      const v = row[key];
      return v ? [v] : [];
    }
  }
}

/** Text a cell shows, also used for export ("" when blank). */
export function cellText(
  row: MentorSearchRow,
  key: MentorColumnKey,
): string {
  switch (key) {
    case "name":
      return row.name;
    case "subProgramme":
      return row.subProgrammes.join("; ");
    case "interests":
      return row.interests.join("; ");
    case "age":
      return row.age === null ? "" : String(row.age);
    default:
      return row[key];
  }
}

// ─── Search + column filters ────────────────────────────────────────────────

export function normalizeCriteria(
  c: MentorSearchCriteria,
): MentorSearchCriteria {
  return {
    firstName: c.firstName.trim(),
    lastName: c.lastName.trim(),
    email: c.email.trim(),
    subProgrammes: [...c.subProgrammes],
  };
}

export function matchesCriteria(
  row: MentorSearchRow,
  c: MentorSearchCriteria,
): boolean {
  const has = (hay: string, needle: string) =>
    !needle || hay.toLowerCase().includes(needle.toLowerCase());
  if (!has(row.firstName, c.firstName.trim())) return false;
  if (!has(row.lastName, c.lastName.trim())) return false;
  if (!has(row.email, c.email.trim())) return false;
  if (
    c.subProgrammes.length > 0 &&
    !c.subProgrammes.some((p) => row.subProgrammes.includes(p))
  )
    return false;
  return true;
}

export function matchesColumnFilters(
  row: MentorSearchRow,
  filters: ColumnFilters,
): boolean {
  for (const [key, selected] of Object.entries(filters) as [
    MentorColumnKey,
    string[],
  ][]) {
    if (!selected || selected.length === 0) continue;
    const values = cellValues(row, key);
    const hit =
      values.length === 0
        ? selected.includes(BLANK_FILTER_VALUE)
        : values.some((v) => selected.includes(v));
    if (!hit) return false;
  }
  return true;
}

export function filterMentors(
  rows: MentorSearchRow[],
  criteria: MentorSearchCriteria,
  filters: ColumnFilters,
): MentorSearchRow[] {
  return rows.filter(
    (r) =>
      matchesCriteria(r, criteria) &&
      matchesColumnFilters(r, filters),
  );
}

// ─── Sorting ────────────────────────────────────────────────────────────────

const DATE_KEYS: MentorColumnKey[] = [
  "accountCreatedDate",
  "startDate",
  "promotionDate",
];

/** Sort value; null = blank (always sorted last). */
function sortValue(
  row: MentorSearchRow,
  key: MentorColumnKey,
): string | number | null {
  if (key === "age") return row.age;
  if (DATE_KEYS.includes(key)) {
    const k = dateSortKey(cellText(row, key));
    return k || null;
  }
  const t = cellText(row, key).trim().toLowerCase();
  return t || null;
}

export function sortMentors(
  rows: MentorSearchRow[],
  key: MentorColumnKey | null,
  dir: "asc" | "desc",
): MentorSearchRow[] {
  if (!key) return rows;
  const sign = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = sortValue(a, key);
    const bv = sortValue(b, key);
    if (av === null && bv === null)
      return a.name.localeCompare(b.name);
    if (av === null) return 1;
    if (bv === null) return -1;
    const cmp =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
    return cmp
      ? cmp * sign
      : a.name.localeCompare(b.name) * sign;
  });
}

// ─── Filter options ─────────────────────────────────────────────────────────

/** Choices from the whole eligible directory (never the current page). */
export function columnFilterOptions(
  rows: MentorSearchRow[],
  key: MentorColumnKey,
): string[] {
  const values = new Set<string>();
  let hasBlank = false;
  for (const r of rows) {
    const vs = cellValues(r, key);
    if (vs.length === 0) hasBlank = true;
    for (const v of vs) values.add(v);
  }
  const sorted = [...values].sort((a, b) => {
    if (key === "age") return Number(a) - Number(b);
    if (DATE_KEYS.includes(key))
      return dateSortKey(a).localeCompare(dateSortKey(b));
    return a.localeCompare(b);
  });
  return hasBlank ? [BLANK_FILTER_VALUE, ...sorted] : sorted;
}