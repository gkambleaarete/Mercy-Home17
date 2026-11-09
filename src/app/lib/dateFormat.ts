/**
 * Boundary-conversion helpers used when swapping a native `<input type="date">`
 * (which the HTML spec requires to store its value as ISO "YYYY-MM-DD") for the
 * shared `<DateInput>` component (which always displays/edits "MM/DD/YYYY").
 *
 * These only convert at the UI boundary — they intentionally do NOT change how
 * a screen stores or compares dates internally, so any existing sort/validation
 * logic elsewhere in a file keeps working exactly as before.
 */

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MDY_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/** "YYYY-MM-DD" -> "MM/DD/YYYY". Passes through unchanged if not valid ISO. */
export function isoToMdy(iso?: string | null): string {
  if (!iso) return "";
  const m = ISO_RE.exec(iso);
  if (!m) return iso; // already MM/DD/YYYY or empty/partial — leave as-is
  const [, y, mo, d] = m;
  return `${mo}/${d}/${y}`;
}

/** "MM/DD/YYYY" -> "YYYY-MM-DD". Passes through unchanged if not valid MM/DD/YYYY. */
export function mdyToIso(mdy?: string | null): string {
  if (!mdy) return "";
  const m = MDY_RE.exec(mdy);
  if (!m) return mdy; // incomplete while typing, or already ISO — leave as-is
  const [, mo, d, y] = m;
  return `${y}-${mo}-${d}`;
}

const HM24_RE = /^(\d{2}):(\d{2})$/;
const HM12_RE = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

/** "HH:MM" (24h, a native time input's value) -> "h:mm AM/PM". Passes
 *  through unchanged if not valid HH:MM. */
export function time24To12(hm?: string | null): string {
  if (!hm) return "";
  const m = HM24_RE.exec(hm);
  if (!m) return hm;
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
}

/** "h:mm AM/PM" -> "HH:MM" (24h). Passes through unchanged if not valid. */
export function time12To24(t?: string | null): string {
  if (!t) return "";
  const m = HM12_RE.exec(t.trim());
  if (!m) return t;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

/**
 * Formats any date-like value as "MM/DD/YYYY", guaranteed independent of the
 * viewer's OS/browser locale — used to replace `.toLocaleDateString(...)` calls,
 * which (even with an explicit locale argument) still depend on the browser's
 * Intl implementation. This does plain manual formatting instead, so there is
 * zero locale dependency at all. Returns "" for invalid/empty input.
 */
export function formatMdy(
  date?: Date | string | number | null,
): string {
  if (date === null || date === undefined || date === "")
    return "";
  // A date-only string ("2010-03-15") is a calendar date, not an instant.
  if (typeof date === "string") {
    const m = ISO_RE.exec(date.trim());
    if (m) return `${m[2]}/${m[3]}/${m[1]}`;
  }
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  // Callers commonly pass `new Date("YYYY-MM-DD")`, which JS parses as UTC
  // midnight. Read such a value with UTC getters so the calendar date is not
  // shifted a day earlier in US time zones. A Date at any other time of day
  // is a real local instant and is read with local getters.
  const isUtcMidnight =
    d.getUTCHours() === 0 &&
    d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0 &&
    d.getUTCMilliseconds() === 0;
  const mm = String((isUtcMidnight ? d.getUTCMonth() : d.getMonth()) + 1).padStart(2, "0");
  const dd = String(isUtcMidnight ? d.getUTCDate() : d.getDate()).padStart(2, "0");
  const yyyy = isUtcMidnight ? d.getUTCFullYear() : d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

/** "YYYY-MM-DD" -> local-midnight Date (not UTC). Other inputs fall back to
 *  `new Date(value)`. Use before local date arithmetic (setDate, setMonth). */
export function parseIsoLocal(value: string): Date {
  const m = ISO_RE.exec((value ?? "").trim());
  return m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(value);
}

/** Local calendar date of `d` as "YYYY-MM-DD" (never UTC). */
export function toLocalIso(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Today's local calendar date as "YYYY-MM-DD". Use instead of
 *  `new Date().toISOString().split("T")[0]`, which is the UTC date and is a
 *  day ahead in the evening in US time zones. */
export function localTodayIso(): string {
  return toLocalIso(new Date());
}

/** Local calendar date offset by `days` from "YYYY-MM-DD", as "YYYY-MM-DD".
 *  Month/year rollover and DST safe (no UTC conversion). */
export function addDaysIso(iso: string, days: number): string {
  const m = ISO_RE.exec(iso);
  if (!m) return iso;
  return toLocalIso(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + days));
}