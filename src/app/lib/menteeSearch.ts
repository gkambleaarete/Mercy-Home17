// Pure search / filter logic for Friends First Mentee Search (US 20000).
// No React, storage or store access — data/ffMenteeSearch.ts builds the rows
// from the shared mentee and referral records and hands them here.

import type {
  FFMenteeStage,
  FFSubProgramme,
} from "../data/mockFriendsFirstData";
import {
  ageFromBirthDate,
  parseDateParts,
} from "./mentorSearch";

export type MenteeColumnKey =
  | "name"
  | "subProgramme"
  | "location"
  | "age"
  | "interests"
  | "ethnicity"
  | "religion"
  | "dob"
  | "referralDate"
  | "promotionDate"
  | "stage";

export interface MenteeSearchRow {
  /** Stable mentee record id (the detail route's id). */
  id: string;
  name: string;
  initials: string;
  /** As saved; "" when not recorded. Never remapped to Other. */
  gender: string;
  subProgramme: FFSubProgramme;
  stage: FFMenteeStage;
  /** Youth's city/state from the linked referral's client demographics. */
  location: string;
  /** Completed years from a valid birth date; null = unknown. */
  age: number | null;
  interests: string[];
  ethnicity: string;
  religion: string;
  /** MM/DD/YYYY, "" when missing or not a valid date. */
  dob: string;
  /** The linked referral's explicit Referral Date, MM/DD/YYYY or "". */
  referralDate: string;
  /** The stored first-promotion date, MM/DD/YYYY or "". */
  promotionDate: string;
}

export const AGE_BANDS = ["5-10", "11-18", "18+"] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export interface MenteeCriteria {
  name: string;
  subProgrammes: FFSubProgramme[];
  stages: FFMenteeStage[];
  genders: string[];
  /** "" = All Ages. */
  ageBand: AgeBand | "";
}

export const BLANK_MENTEE_CRITERIA: MenteeCriteria = {
  name: "",
  subProgrammes: [],
  stages: [],
  genders: [],
  ageBand: "",
};

/** Blank value in a column filter — the shared ColumnFilter's convention. */
export const BLANK_FILTER_VALUE = "—";

export type MenteeColumnFilters = Partial<
  Record<MenteeColumnKey, string[]>
>;

// ─── Values ─────────────────────────────────────────────────────────────────

/** Valid calendar date shown as MM/DD/YYYY; "" for missing/invalid. */
export function formatDisplayDate(
  v: string | null | undefined,
): string {
  const p = parseDateParts(v);
  if (!p) return "";
  const [y, m, d] = p;
  const two = (n: number) => String(n).padStart(2, "0");
  return `${two(m)}/${two(d)}/${String(y).padStart(4, "0")}`;
}

/** Splits free-text interests into distinct values. */
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

export function ageOf(
  dob: string | null | undefined,
  today?: Date,
): number | null {
  return ageFromBirthDate(dob, today);
}

/** Literal ranges: 5–10, 11–18, 18 or older (so 18 is in both of the last
 *  two). Unknown ages and ages under 5 match no band. */
export function inAgeBand(
  age: number | null,
  band: AgeBand,
): boolean {
  if (age === null) return false;
  switch (band) {
    case "5-10":
      return age >= 5 && age <= 10;
    case "11-18":
      return age >= 11 && age <= 18;
    case "18+":
      return age >= 18;
  }
}

/** The filterable values of one cell; [] means blank. */
export function cellValues(
  row: MenteeSearchRow,
  key: MenteeColumnKey,
): string[] {
  switch (key) {
    case "interests":
      return row.interests;
    case "age":
      return row.age === null ? [] : [String(row.age)];
    case "name":
      return [row.name];
    default: {
      const v = row[key];
      return v ? [v] : [];
    }
  }
}

/** Text a cell shows, also used for export ("" when blank). */
export function cellText(
  row: MenteeSearchRow,
  key: MenteeColumnKey,
): string {
  switch (key) {
    case "interests":
      return row.interests.join("; ");
    case "age":
      return row.age === null ? "" : String(row.age);
    default:
      return row[key];
  }
}

// ─── Filtering ──────────────────────────────────────────────────────────────

const squash = (s: string) =>
  s.trim().replace(/\s+/g, " ").toLowerCase();

export function matchesCriteria(
  row: MenteeSearchRow,
  c: MenteeCriteria,
): boolean {
  const n = squash(c.name);
  if (n && !squash(row.name).includes(n)) return false;
  if (
    c.subProgrammes.length > 0 &&
    !c.subProgrammes.includes(row.subProgramme)
  )
    return false;
  if (c.stages.length > 0 && !c.stages.includes(row.stage))
    return false;
  if (
    c.genders.length > 0 &&
    !c.genders.some((g) => squash(g) === squash(row.gender))
  )
    return false;
  if (c.ageBand && !inAgeBand(row.age, c.ageBand)) return false;
  return true;
}

export function matchesColumnFilters(
  row: MenteeSearchRow,
  filters: MenteeColumnFilters,
): boolean {
  for (const [key, selected] of Object.entries(filters) as [
    MenteeColumnKey,
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

export function filterMentees(
  rows: MenteeSearchRow[],
  criteria: MenteeCriteria,
  filters: MenteeColumnFilters,
): MenteeSearchRow[] {
  return rows.filter(
    (r) =>
      matchesCriteria(r, criteria) &&
      matchesColumnFilters(r, filters),
  );
}

const DATE_KEYS: MenteeColumnKey[] = [
  "dob",
  "referralDate",
  "promotionDate",
];
const dateKey = (v: string) => {
  const p = parseDateParts(v);
  return p ? p[0] * 10000 + p[1] * 100 + p[2] : 0;
};

/** Choices from the whole eligible dataset (never the current page). */
export function columnFilterOptions(
  rows: MenteeSearchRow[],
  key: MenteeColumnKey,
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
    if (DATE_KEYS.includes(key)) return dateKey(a) - dateKey(b);
    return a.localeCompare(b);
  });
  return hasBlank ? [BLANK_FILTER_VALUE, ...sorted] : sorted;
}