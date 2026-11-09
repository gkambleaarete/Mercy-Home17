// Pass Calendar layout rules (20041) — pure, calendar-date-safe (local Y/M/D
// only, via the shared helpers in lib/passes.ts). No UI here, so the
// Calendar component only composes. A Pass is ONE event from
// Start Date + Departure Time to End Date + Return Time; these helpers only
// decide where that one event is drawn — nothing is duplicated in storage.

import type { PassRecord } from "../data/mockPassData";
import { addDaysIso, weekdayOfIso } from "./passes";
import { WEEKDAYS } from "../data/mockPassData";

export type CalendarView = "day" | "week" | "month";

export function startOfWeekIso(iso: string): string {
  return addDaysIso(iso, -WEEKDAYS.indexOf(weekdayOfIso(iso)));
}

export function startOfMonthIso(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

export function endOfMonthIso(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  const last = new Date(y, m, 0).getDate(); // day 0 of next month
  return `${iso.slice(0, 7)}-${String(last).padStart(2, "0")}`;
}

/** Shift a date by one unit of the view (day / 7 days / calendar month).
 *  Month moves clamp the day (Jan 31 → Feb 28). */
export function shiftIso(
  iso: string,
  view: CalendarView,
  dir: 1 | -1,
): string {
  if (view === "day") return addDaysIso(iso, dir);
  if (view === "week") return addDaysIso(iso, 7 * dir);
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, m - 1 + dir, 1);
  const last = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate();
  const mm = String(target.getMonth() + 1).padStart(2, "0");
  return `${target.getFullYear()}-${mm}-${String(Math.min(d, last)).padStart(2, "0")}`;
}

/** The inclusive date range a view covers — what is filtered and printed. */
export function viewRange(
  iso: string,
  view: CalendarView,
): [string, string] {
  if (view === "day") return [iso, iso];
  if (view === "week") {
    const s = startOfWeekIso(iso);
    return [s, addDaysIso(s, 6)];
  }
  return [startOfMonthIso(iso), endOfMonthIso(iso)];
}

/** Sunday-start weeks covering the month (each an array of 7 ISO dates). */
export function monthGridWeeks(iso: string): string[][] {
  const first = startOfWeekIso(startOfMonthIso(iso));
  const last = endOfMonthIso(iso);
  const weeks: string[][] = [];
  for (let s = first; s <= last; s = addDaysIso(s, 7))
    weeks.push(
      Array.from({ length: 7 }, (_, i) => addDaysIso(s, i)),
    );
  return weeks;
}

export function overlaps(
  p: PassRecord,
  from: string,
  to: string,
): boolean {
  return p.startDate <= to && p.endDate >= from;
}

/** One Pass drawn across a week row. `startCol`/`endCol` are 0–6;
 *  continuesBefore/After say the same Pass extends past this row. */
export interface WeekSegment {
  pass: PassRecord;
  startCol: number;
  endCol: number;
  lane: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
}

/** Lays out every Pass overlapping a 7-day row as a single continuous bar,
 *  stacking overlaps into lanes (greedy, earliest start first). */
export function layoutWeek(
  passes: PassRecord[],
  weekDays: string[],
): WeekSegment[] {
  const ws = weekDays[0];
  const we = weekDays[6];
  const inRow = passes
    .filter((p) => overlaps(p, ws, we))
    .sort(
      (a, b) =>
        a.startDate.localeCompare(b.startDate) ||
        b.endDate.localeCompare(a.endDate) ||
        a.id - b.id,
    );
  const laneEnds: number[] = [];
  return inRow.map((pass) => {
    const startCol = Math.max(
      0,
      weekDays.indexOf(
        pass.startDate < ws ? ws : pass.startDate,
      ),
    );
    const endCol = weekDays.indexOf(
      pass.endDate > we ? we : pass.endDate,
    );
    let lane = laneEnds.findIndex((end) => end < startCol);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = endCol;
    return {
      pass,
      startCol,
      endCol,
      lane,
      continuesBefore: pass.startDate < ws,
      continuesAfter: pass.endDate > we,
    };
  });
}

/** How a Pass relates to one specific day (Day view wording). */
export function dayPhase(
  p: PassRecord,
  iso: string,
): "single" | "departs" | "continues" | "returns" {
  if (p.startDate === iso && p.endDate === iso) return "single";
  if (p.startDate === iso) return "departs";
  if (p.endDate === iso) return "returns";
  return "continues";
}

/** 1-based day number within a multi-day Pass, and its total length. */
export function dayOfPass(
  p: PassRecord,
  iso: string,
): [number, number] {
  const days = (a: string, b: string) => {
    const [y1, m1, d1] = a.split("-").map(Number);
    const [y2, m2, d2] = b.split("-").map(Number);
    return Math.round(
      (new Date(y2, m2 - 1, d2).getTime() -
        new Date(y1, m1 - 1, d1).getTime()) /
        86400000,
    );
  };
  return [
    days(p.startDate, iso) + 1,
    days(p.startDate, p.endDate) + 1,
  ];
}