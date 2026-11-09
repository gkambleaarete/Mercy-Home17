// Tutor Session recurrence (US 20093) — the single pure function that turns
// a Tutor Match schedule into dated sessions. Used by the Match save
// transaction and by every Tutor session/calendar view.
//
// Policy (isolated here; pending business confirmation):
//  • Dates and times are wall-clock values in the application's local time
//    (MM/DD/YYYY, h:mm AM/PM). No timezone conversion is applied — the
//    prototype has no configured application timezone.
//  • Week anchor: weeks start on SUNDAY (RECURRENCE_WEEK_START). "Recurs
//    every N weeks" counts calendar weeks from the week that contains the
//    Match Start Date (that week is week 0).
//  • Day arithmetic uses UTC day numbers, so daylight-saving changes can
//    never shift a week count.
//  • Sessions start and end on the same day (overnight sessions are not
//    supported: End Time must be after Start Time).

export const RECURRENCE_WEEK_START = 0; // 0 = Sunday
export const RECURRENCE_MAX_DAYS = 366 * 5; // guard against runaway ranges

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export interface RecurrenceInput {
  startDate: string; // MM/DD/YYYY
  endDate: string; // MM/DD/YYYY, "" = open-ended
  startTime: string; // h:mm AM/PM
  endTime: string;
  days: readonly string[];
  recursEvery: number;
}

export type RecurrenceErrors = Partial<
  Record<keyof RecurrenceInput, string>
>;

export type RecurrenceResult =
  | { ok: true; dates: string[]; openEnded: boolean }
  | { ok: false; errors: RecurrenceErrors };

// ─── Strict parsing ─────────────────────────────────────────────────────────

/** Strict MM/DD/YYYY (real calendar date, years 1900–2100) → UTC day no. */
export function dayNumber(date: string): number | null {
  const m = date.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [mm, dd, yyyy] = [
    Number(m[1]),
    Number(m[2]),
    Number(m[3]),
  ];
  if (yyyy < 1900 || yyyy > 2100 || mm < 1 || mm > 12 || dd < 1)
    return null;
  if (dd > new Date(Date.UTC(yyyy, mm, 0)).getUTCDate())
    return null;
  return Date.UTC(yyyy, mm - 1, dd) / 86_400_000;
}

export function formatDayNumber(n: number): string {
  const d = new Date(n * 86_400_000);
  return `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(d.getUTCDate()).padStart(2, "0")}/${d.getUTCFullYear()}`;
}

/** Day of week (0 = Sunday) of a UTC day number. */
const weekday = (n: number) =>
  new Date(n * 86_400_000).getUTCDay();

/** Strict 12-hour time → minutes since midnight, or null. */
export function minutesOf(time: string): number | null {
  const m = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 1 || h > 12 || min > 59) return null;
  return (
    ((h % 12) + (m[3].toUpperCase() === "PM" ? 12 : 0)) * 60 +
    min
  );
}

/** Sort key for a date + time (actual values, not formatted strings). */
export function sortKey(date: string, time: string): number {
  return (dayNumber(date) ?? 0) * 1440 + (minutesOf(time) ?? 0);
}

const weekStartOf = (n: number) =>
  n - ((weekday(n) - RECURRENCE_WEEK_START + 7) % 7);

// ─── Generation ─────────────────────────────────────────────────────────────

/**
 * Validates the schedule and returns every session date in the full range
 * (both boundary dates included), independent of today or any view window.
 * An open-ended Match (blank End Date) returns no dates: there is no defined
 * horizon to generate to (business decision pending).
 */
export function generateSessionDates(
  input: RecurrenceInput,
): RecurrenceResult {
  const errors: RecurrenceErrors = {};
  const start = dayNumber(input.startDate);
  const openEnded = !input.endDate.trim();
  const end = openEnded ? null : dayNumber(input.endDate);
  if (!input.startDate.trim())
    errors.startDate = "Start Date is required.";
  else if (start === null)
    errors.startDate = "Enter a valid date (MM/DD/YYYY).";
  if (!openEnded && end === null)
    errors.endDate = "Enter a valid date (MM/DD/YYYY).";
  if (start !== null && end !== null && end < start)
    errors.endDate = "End Date must be on or after Start Date.";
  if (
    start !== null &&
    end !== null &&
    end - start > RECURRENCE_MAX_DAYS
  )
    errors.endDate =
      "Date range is too long (5 years maximum).";

  const st = minutesOf(input.startTime);
  const et = minutesOf(input.endTime);
  if (!input.startTime.trim())
    errors.startTime = "Start Time is required.";
  else if (st === null)
    errors.startTime = "Enter a valid time (h:mm AM/PM).";
  if (!input.endTime.trim())
    errors.endTime = "End Time is required.";
  else if (et === null)
    errors.endTime = "Enter a valid time (h:mm AM/PM).";
  else if (st !== null && et <= st)
    errors.endTime = "End Time must be after Start Time.";

  const every = input.recursEvery;
  if (!Number.isInteger(every) || every < 1)
    errors.recursEvery =
      "Recurs Every must be a whole number of weeks (1 or more).";

  const dayIdx = [
    ...new Set(
      input.days.map((d) =>
        (WEEKDAY_NAMES as readonly string[]).indexOf(d),
      ),
    ),
  ];
  if (!dayIdx.length) errors.days = "Select at least one day.";
  else if (dayIdx.includes(-1))
    errors.days = "Unknown day selected.";

  if (Object.keys(errors).length) return { ok: false, errors };
  if (openEnded)
    return { ok: true, dates: [], openEnded: true };

  const anchor = weekStartOf(start!);
  const dates: string[] = [];
  for (let n = start!; n <= end!; n++) {
    if (!dayIdx.includes(weekday(n))) continue;
    const weeks = (weekStartOf(n) - anchor) / 7;
    if (weeks % every === 0) dates.push(formatDayNumber(n));
  }
  if (!dates.length)
    return {
      ok: false,
      errors: {
        days: "No sessions fall on the selected days within these dates.",
      },
    };
  return { ok: true, dates, openEnded: false };
}

/** Session dates of a schedule that fall inside [from, to] (inclusive). */
export function sessionDatesInWindow(
  input: RecurrenceInput,
  from: string,
  to: string,
): string[] {
  const r = generateSessionDates(input);
  if (!r.ok) return [];
  const a = dayNumber(from);
  const b = dayNumber(to);
  return r.dates.filter((d) => {
    const n = dayNumber(d)!;
    return (a === null || n >= a) && (b === null || n <= b);
  });
}