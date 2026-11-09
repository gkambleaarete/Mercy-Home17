// Friends First Mentor Matches (US 20001).
//
// Mentors and mentees come from the existing Friends First records
// (mockFriendsFirstData.ts) — a match stores their ids and is only ever
// created between an approved mentor and an approved mentee. Matches live in
// a mutable module list; since US 20040 the list is also saved to
// localStorage (so an inactivation that ends matches survives a refresh) and
// pages can subscribe to changes.

import {
  MOCK_FF_MENTEES,
  MOCK_FF_MENTORS,
  type FFMentee,
  type FFMentor,
  type FFSubProgramme,
} from "./mockFriendsFirstData";
// Loads saved mentee records (stage, sub-program…) over the seed data, so
// approvedMentees() reflects edits made on the mentee record after a refresh.
import { getFFMatchClosures } from "./ffMenteeStore";
// Mentor-level Inactive closures (US 20039) and shared-store mentors.
import {
  getFFMentorAvailability,
  getFFMentorMatchClosures,
  listFFMentorApplicationsForMentor,
  refreshFFMentorApplicationsFromStorage,
} from "./ffMentorApplicationStore";
import {
  calendarKey,
  parseRecordedDate,
  todayCalendar,
} from "./ffMentorApplication";
import {
  getFFActingUser,
  newFFEventId,
} from "./ffMentorApplicationStore";
import { localStamp } from "./ffMenteeIntake";
import {
  FF_DURATION_MAX_HOURS,
  FF_DURATION_MIN_HOURS,
  FF_MATCH_ACTIVITY_TYPES,
  FF_MATCH_MEETING_METHODS,
  FF_OUTING_STATUSES,
  type FFOutingStatus,
} from "./ffMatchActivityConfig";
import type { FFActor } from "./ffMentorApplication";

export const MENTOR_MATCH_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;
export type MentorMatchDay = (typeof MENTOR_MATCH_DAYS)[number];

export interface MentorMatch {
  id: string;
  mentorId: string;
  menteeId: string;
  /** Inherited from the mentor's Friends First sub-programme. */
  subProgram: FFSubProgramme;
  startDate: string; // MM/DD/YYYY
  startTime: string; // h:mm AM/PM
  endDate: string; // MM/DD/YYYY
  endTime: string; // h:mm AM/PM
  days: MentorMatchDay[];
  comment: string;
  /** Epoch ms of the last create/edit; orders edits vs Inactive closures. */
  updatedAt?: number;
  /** The qualifying Mentor Application the match was made from (new
   *  matches with shared-store mentors only). */
  applicationId?: string;
}

// ─── Approved people ────────────────────────────────────────────────────────

/** Mentors who have completed approval. */
export function approvedMentors(): FFMentor[] {
  return MOCK_FF_MENTORS.filter((m) => m.status === "approved");
}

/** Existing readiness baseline: stage Ready for Match, Matched or Active.
 *  (The ticket does not define "approved"; this is the prototype rule.) */
export function isMenteeReady(m: FFMentee): boolean {
  return (
    m.stage === "Ready for Match" ||
    m.stage === "Matched" ||
    m.stage === "Active"
  );
}

/** Ready and not Inactive (US 20040) — may receive a new match. */
export function isMenteeMatchable(id: string): boolean {
  const m = MOCK_FF_MENTEES.find((x) => x.id === id);
  return !!m && isMenteeReady(m) && !m.inactive;
}

/** Mentees who have completed intake and are matchable (Inactive excluded). */
export function approvedMentees(): FFMentee[] {
  return MOCK_FF_MENTEES.filter(
    (m) => isMenteeReady(m) && !m.inactive,
  );
}

export function mentorName(id: string): string {
  // The saved application (staff corrections included), by applicant id —
  // submitted and older seeded mentors alike.
  const o =
    listFFMentorApplicationsForMentor(id)[0]?.answers.overview;
  const name = o
    ? [o.firstName, o.lastName].filter(Boolean).join(" ")
    : "";
  if (name) return name;
  const legacy = MOCK_FF_MENTORS.find((m) => m.id === id);
  return legacy ? legacy.name : id;
}

export function menteeName(id: string): string {
  return MOCK_FF_MENTEES.find((m) => m.id === id)?.name ?? id;
}

/** A demo mentor's single sub-programme. Shared-store mentors may have
 *  several, so their match sub-program is always chosen explicitly. */
export function mentorSubProgram(
  id: string,
): FFSubProgramme | undefined {
  return MOCK_FF_MENTORS.find((m) => m.id === id)?.subProgramme;
}

// ─── Records ────────────────────────────────────────────────────────────────
// Spread around 10/01/2026 so every Period option has results: ongoing,
// past, this week, next week, and future matches across all sub-programmes.

const MOCK_MENTOR_MATCHES: MentorMatch[] = [
  {
    id: "MM-1001",
    mentorId: "FF-CB-102",
    menteeId: "MT-101",
    subProgram: "Community-Based",
    startDate: "09/08/2026",
    startTime: "4:00 PM",
    endDate: "06/30/2027",
    endTime: "5:30 PM",
    days: ["Tuesday", "Thursday"],
    comment:
      "Weekly outings around the West Loop; focus on goal setting.",
  },
  {
    id: "MM-1002",
    mentorId: "FF-CB-101",
    menteeId: "MT-108",
    subProgram: "Community-Based",
    startDate: "08/17/2026",
    startTime: "5:00 PM",
    endDate: "12/18/2026",
    endTime: "6:00 PM",
    days: ["Monday", "Wednesday"],
    comment: "Meets after school; enjoys museum visits.",
  },
  {
    id: "MM-1003",
    mentorId: "FF-WB-102",
    menteeId: "MT-102",
    subProgram: "Work-Based",
    startDate: "10/05/2026",
    startTime: "3:30 PM",
    endDate: "05/28/2027",
    endTime: "5:00 PM",
    days: ["Friday"],
    comment: "Job-shadowing placement at the mentor's office.",
  },
  {
    id: "MM-1004",
    mentorId: "FF-WB-101",
    menteeId: "MT-102",
    subProgram: "Work-Based",
    startDate: "02/02/2026",
    startTime: "4:30 PM",
    endDate: "06/12/2026",
    endTime: "6:00 PM",
    days: ["Wednesday"],
    comment: "Spring work-readiness cohort — completed.",
  },
  {
    id: "MM-1005",
    mentorId: "FF-SB-101",
    menteeId: "MT-101",
    subProgram: "School-Based",
    startDate: "01/12/2026",
    startTime: "3:15 PM",
    endDate: "05/29/2026",
    endTime: "4:15 PM",
    days: ["Monday", "Wednesday", "Friday"],
    comment: "School-year lunch-hour mentoring — completed.",
  },
  {
    id: "MM-1006",
    mentorId: "FF-CB-102",
    menteeId: "MT-108",
    subProgram: "Community-Based",
    startDate: "09/14/2026",
    startTime: "6:00 PM",
    endDate: "09/25/2026",
    endTime: "7:00 PM",
    days: ["Thursday"],
    comment: "Short-term summer-to-fall bridge match.",
  },
  {
    id: "MM-1007",
    mentorId: "FF-CB-101",
    menteeId: "MT-102",
    subProgram: "Community-Based",
    startDate: "10/26/2026",
    startTime: "4:00 PM",
    endDate: "03/26/2027",
    endTime: "5:00 PM",
    days: ["Tuesday"],
    comment: "",
  },
  {
    id: "MM-1008",
    mentorId: "FF-SB-101",
    menteeId: "MT-108",
    subProgram: "School-Based",
    startDate: "09/28/2026",
    startTime: "12:00 PM",
    endDate: "10/02/2026",
    endTime: "12:45 PM",
    days: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ],
    comment: "Orientation week check-ins.",
  },
];

// Demo matches for the demo Mentor Applications (VMS-5101 → VOL-2001,
// VMS-5102 → VOL-2002), so their Match & Activity tab has content. Mock data
// only; matched by the canonical mentor id (the applicant id).
const DEMO_SHARED_STORE_MATCHES: MentorMatch[] = [
  {
    id: "MM-2001",
    mentorId: "VOL-2001",
    menteeId: "MT-101",
    subProgram: "Community-Based",
    startDate: "09/15/2026",
    startTime: "4:00 PM",
    endDate: "06/30/2027",
    endTime: "6:00 PM",
    days: ["Tuesday", "Thursday"],
    comment: "Demo match — weekend museum and park outings.",
    applicationId: "VMS-5101",
  },
  {
    id: "MM-2002",
    mentorId: "VOL-2001",
    menteeId: "MT-102",
    subProgram: "Work-Based",
    startDate: "03/02/2026",
    startTime: "3:45 PM",
    endDate: "06/12/2026",
    endTime: "5:15 PM",
    days: ["Thursday"],
    comment:
      "Demo match — spring workplace mentoring (completed).",
    applicationId: "VMS-5101",
  },
  {
    id: "MM-2003",
    mentorId: "VOL-2002",
    menteeId: "MT-108",
    subProgram: "School-Based",
    startDate: "09/21/2026",
    startTime: "3:30 PM",
    endDate: "05/28/2027",
    endTime: "5:00 PM",
    days: ["Tuesday"],
    comment:
      "Demo match — Tuesday after-school sessions at Kenwood Academy.",
    applicationId: "VMS-5102",
  },
];
MOCK_MENTOR_MATCHES.push(...DEMO_SHARED_STORE_MATCHES);

// ─── Persistence + subscription (US 20040) ─────────────────────────────────

const STORAGE_KEY = "mh.ffMentorMatches.v1";

// Whether the saved match list could be read (US 20039): an unreadable list
// is NOT the same as "no matches", so actions that must end every active
// match refuse to run while it is "unavailable".
let sourceStatus: "ok" | "unavailable" = "ok";

function loadSaved(): MentorMatch[] | null {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    sourceStatus = "unavailable";
    return null;
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as MentorMatch[];
  } catch {
    // fall through
  }
  sourceStatus = "unavailable";
  return null;
}

export function getMentorMatchSourceStatus():
  "ok" | "unavailable" {
  return sourceStatus;
}

/** Saved list plus any demo match it doesn't have yet (never overwrites). */
const withDemoMatches = (list: MentorMatch[]) => [
  ...list,
  ...DEMO_SHARED_STORE_MATCHES.filter(
    (d) => !list.some((m) => m.id === d.id),
  ),
];

const saved = loadSaved();
if (saved)
  MOCK_MENTOR_MATCHES.splice(
    0,
    MOCK_MENTOR_MATCHES.length,
    ...withDemoMatches(saved),
  );

let nextSeq = Math.max(
  1009,
  ...MOCK_MENTOR_MATCHES.map(
    (m) => Number(m.id.replace(/\D/g, "")) + 1 || 0,
  ),
);

const listeners = new Set<() => void>();

/**
 * Applies saved Inactive-action closures (authoritative, stored with the
 * mentee's Inactive flag) to matches not edited since. Returns true when
 * anything changed.
 */
function applyClosureOverlay(): boolean {
  const closures = getFFMatchClosures();
  const mentorClosures = getFFMentorMatchClosures();
  let changed = false;
  for (const m of MOCK_MENTOR_MATCHES) {
    // Mentee closures, then mentor closures (only for that mentor's match).
    const mc = mentorClosures[m.id];
    const c =
      closures[m.id] ??
      (mc && mc.mentorId === m.mentorId ? mc : undefined);
    if (!c || c.at <= (m.updatedAt ?? 0)) continue;
    m.endDate = c.endDate;
    m.endTime = c.endTime;
    m.updatedAt = c.at;
    changed = true;
  }
  return changed;
}

// Reconcile at load: a closure whose match write didn't land still applies.
if (applyClosureOverlay()) {
  try {
    localStorage.setItem(
      "mh.ffMentorMatches.v1",
      JSON.stringify(MOCK_MENTOR_MATCHES),
    );
  } catch {
    // The closure stays authoritative in the mentee store; reapplied on load.
  }
}

/** Returns false when browser storage could not be written. */
function persistMatches(): boolean {
  let ok = true;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(MOCK_MENTOR_MATCHES),
    );
  } catch {
    ok = false;
  }
  listeners.forEach((l) => l());
  return ok;
}

export function subscribeMentorMatches(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Current saved Mentor Matches (a copy — callers never mutate the store). */
export function getMentorMatches(): MentorMatch[] {
  applyClosureOverlay();
  return MOCK_MENTOR_MATCHES.map((m) => ({
    ...m,
    days: [...m.days],
  }));
}

export type MentorMatchWriteResult =
  | { ok: true; match: MentorMatch }
  | {
      ok: false;
      reason:
        | "unavailable"
        | "missing"
        | "inactive-closed"
        | "inactive-mentor"
        | "storage";
      /** Actionable, product-language explanation. */
      message: string;
    };

const isActiveAt = (
  m: Pick<
    MentorMatch,
    "startDate" | "startTime" | "endDate" | "endTime"
  >,
  now: Date,
) => {
  const start = toDate(m.startDate, m.startTime);
  const end = toDate(m.endDate, m.endTime);
  return (!start || start <= now) && (!end || end > now);
};

/**
 * The rules every match write must pass (US 20039): re-read on current
 * matches and mentor availability, then
 *  • no new or reassigned match for an Inactive mentor;
 *  • while a mentor is Inactive, a match ended by their Inactive action
 *    stays ended — its end can move earlier (historical correction) but
 *    not later, it can't become scheduled, and it can't be reassigned;
 *  • an existing match can't be turned into an active assignment for an
 *    Inactive mentor (scheduled matches stay as they are).
 * Unrelated edits to existing matches are allowed; new-match eligibility
 * isn't applied here.
 */
function checkMatchWrite(
  next: MentorMatch,
  prev: MentorMatch | undefined,
  now: Date,
): Extract<MentorMatchWriteResult, { ok: false }> | null {
  const nextInactive = getFFMentorAvailability(
    next.mentorId,
  ).inactive;
  if (!prev)
    return nextInactive
      ? {
          ok: false,
          reason: "inactive-mentor",
          message: `${mentorName(next.mentorId)} is Inactive, so a new match can't be created.`,
        }
      : null;
  const mentorChanged = prev.mentorId !== next.mentorId;
  const mc = getFFMentorMatchClosures()[prev.id];
  const closure =
    mc && mc.mentorId === prev.mentorId ? mc : undefined;
  const prevInactive = getFFMentorAvailability(
    prev.mentorId,
  ).inactive;
  if (mentorChanged && closure)
    return {
      ok: false,
      reason: "inactive-closed",
      message:
        "This match was ended when the mentor was marked Inactive, so it can't be reassigned to another mentor.",
    };
  if (mentorChanged && nextInactive)
    return {
      ok: false,
      reason: "inactive-mentor",
      message: `${mentorName(next.mentorId)} is Inactive, so this match can't be assigned to them.`,
    };
  if (closure && prevInactive) {
    const end = toDate(next.endDate, next.endTime);
    const closedAt = toDate(closure.endDate, closure.endTime);
    const start = toDate(next.startDate, next.startTime);
    if (
      !end ||
      !closedAt ||
      end > closedAt ||
      (start && start > now)
    )
      return {
        ok: false,
        reason: "inactive-closed",
        message: `This match was ended on ${closure.endDate} ${closure.endTime} when the mentor was marked Inactive. Its end can't be moved later or cleared while the mentor is Inactive — reactivate the mentor first if the match should continue.`,
      };
  }
  if (
    nextInactive &&
    (mentorChanged || !isActiveAt(prev, now)) &&
    isActiveAt(next, now)
  )
    return {
      ok: false,
      reason: "inactive-mentor",
      message: `${mentorName(next.mentorId)} is Inactive, so this match can't be made active.`,
    };
  return null;
}

/** All-or-nothing: memory changes only after the storage write succeeds. */
function writeMatches(nextList: MentorMatch[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
  } catch {
    return false;
  }
  MOCK_MENTOR_MATCHES.splice(
    0,
    MOCK_MENTOR_MATCHES.length,
    ...nextList,
  );
  listeners.forEach((l) => l());
  return true;
}

function prepareWrite(): Extract<
  MentorMatchWriteResult,
  { ok: false }
> | null {
  if (refreshMentorMatchesFromStorage() !== "ok")
    return {
      ok: false,
      reason: "unavailable",
      message:
        "Mentor matches can't be loaded right now. Nothing was saved.",
    };
  if (!refreshFFMentorApplicationsFromStorage())
    return {
      ok: false,
      reason: "unavailable",
      message:
        "Mentor availability can't be loaded right now. Nothing was saved.",
    };
  applyClosureOverlay();
  return null;
}

export function createMentorMatch(
  draft: Omit<MentorMatch, "id">,
  now: Date = new Date(),
): MentorMatchWriteResult {
  const blocked = prepareWrite();
  if (blocked) return blocked;
  const created: MentorMatch = {
    ...draft,
    id: `MM-${nextSeq}`,
    updatedAt: now.getTime(),
  };
  const refused = checkMatchWrite(created, undefined, now);
  if (refused) return refused;
  if (!writeMatches([created, ...MOCK_MENTOR_MATCHES]))
    return {
      ok: false,
      reason: "storage",
      message:
        "The match could not be saved. Please try again.",
    };
  nextSeq++;
  return { ok: true, match: created };
}

export function updateMentorMatch(
  updated: MentorMatch,
  now: Date = new Date(),
): MentorMatchWriteResult {
  const blocked = prepareWrite();
  if (blocked) return blocked;
  const i = MOCK_MENTOR_MATCHES.findIndex(
    (m) => m.id === updated.id,
  );
  if (i < 0)
    return {
      ok: false,
      reason: "missing",
      message:
        "This match could not be found. Nothing was saved.",
    };
  const refused = checkMatchWrite(
    updated,
    MOCK_MENTOR_MATCHES[i],
    now,
  );
  if (refused) return refused;
  const saved = { ...updated, updatedAt: now.getTime() };
  const nextList = MOCK_MENTOR_MATCHES.map((m, j) =>
    j === i ? saved : m,
  );
  if (!writeMatches(nextList))
    return {
      ok: false,
      reason: "storage",
      message:
        "The match could not be saved. Please try again.",
    };
  return { ok: true, match: saved };
}

// ─── Ending matches on inactivation ────────────────────────────────────────

const toDate = (date: string, time: string) => {
  const dm = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const tm = time
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!dm || !tm) return null;
  let h = Number(tm[1]) % 12;
  if (tm[3].toUpperCase() === "PM") h += 12;
  return new Date(+dm[3], +dm[1] - 1, +dm[2], h, +tm[2]);
};

export interface MatchClosurePlan {
  /** Started and not yet ended — will be ended at the captured instant. */
  toEnd: MentorMatch[];
  /** Start is still in the future — not changed (policy pending). */
  future: MentorMatch[];
}

/** Which of a mentee's matches an inactivation at `now` would end. */
export function planMatchClosures(
  menteeId: string,
  now: Date,
): MatchClosurePlan {
  const plan: MatchClosurePlan = { toEnd: [], future: [] };
  applyClosureOverlay();
  for (const m of MOCK_MENTOR_MATCHES) {
    if (m.menteeId !== menteeId) continue;
    const start = toDate(m.startDate, m.startTime);
    const end = toDate(m.endDate, m.endTime);
    if (end && end <= now) continue; // already ended — keep as-is
    if (start && start > now) plan.future.push(m);
    else plan.toEnd.push(m);
  }
  return plan;
}

/** Which of a mentor's matches an inactivation at `now` would end. */
export function planMentorMatchClosures(
  mentorId: string,
  now: Date,
): MatchClosurePlan {
  const plan: MatchClosurePlan = { toEnd: [], future: [] };
  applyClosureOverlay();
  for (const m of MOCK_MENTOR_MATCHES) {
    if (m.mentorId !== mentorId) continue;
    const start = toDate(m.startDate, m.startTime);
    const end = toDate(m.endDate, m.endTime);
    if (end && end <= now) continue; // already ended — keep as-is
    if (start && start > now) plan.future.push(m);
    else plan.toEnd.push(m);
  }
  return plan;
}

/**
 * Re-reads the saved match list (another tab may have changed it). Leaves
 * memory as it is and reports "unavailable" when it can't be read.
 */
export function refreshMentorMatchesFromStorage():
  "ok" | "unavailable" {
  sourceStatus = "ok";
  const savedNow = loadSaved();
  if (sourceStatus === "ok" && savedNow)
    MOCK_MENTOR_MATCHES.splice(
      0,
      MOCK_MENTOR_MATCHES.length,
      ...withDemoMatches(savedNow),
    );
  return sourceStatus;
}

/** Test support: re-reads the saved match list as a page load would. */
export function __reloadMentorMatchesForTest(
  seed: MentorMatch[],
): void {
  sourceStatus = "ok";
  const savedNow = loadSaved();
  MOCK_MENTOR_MATCHES.splice(
    0,
    MOCK_MENTOR_MATCHES.length,
    ...(savedNow ?? seed),
  );
}

/**
 * Called after an Inactive action's closures were durably saved with the
 * mentee: applies them in memory, mirrors them to this store's own key
 * (best effort — the closure record stays authoritative) and notifies.
 */
export function syncMentorMatchClosures(): void {
  applyClosureOverlay();
  persistMatches();
}
// ─── Match Activity Log (US 20039 Chunk 11) ────────────────────────────────
// Activities are saved under their own key, by exact Match ID. Logging one
// never writes the match list, so it can't reopen a match or overwrite an
// Inactive closure.

const ACTIVITY_KEY = "mh.ffMentorMatchActivities.v1";

export interface MatchActivity {
  id: string;
  matchId: string;
  /** MM/DD/YYYY. */
  activityDate: string;
  outing: FFOutingStatus;
  /** Labels as chosen at the time (kept if the options change later). */
  type: string;
  method: string;
  /** Hours; null when the outing didn't happen. */
  durationHours: number | null;
  /** 1–5, or null when not rated. */
  mentorEngagement: number | null;
  menteeEngagement: number | null;
  notes: string;
  /** MM/DD/YYYY h:mm AM/PM. */
  recordedAt: string;
  recordedAtIso: string;
  recordedBy: string;
  recordedById: string;
}

interface ActivityData {
  version: 1;
  activities: Record<string, MatchActivity[]>;
}

type ActivityLoad =
  | { status: "ok"; data: ActivityData }
  | { status: "unavailable" };

function loadActivities(): ActivityLoad {
  let raw: string | null;
  try {
    raw = localStorage.getItem(ACTIVITY_KEY);
  } catch {
    return { status: "unavailable" };
  }
  if (raw === null)
    return {
      status: "ok",
      data: { version: 1, activities: {} },
    };
  try {
    const p = JSON.parse(raw) as Partial<ActivityData>;
    if (
      p &&
      p.version === 1 &&
      p.activities &&
      typeof p.activities === "object"
    )
      return { status: "ok", data: p as ActivityData };
  } catch {
    // fall through
  }
  return { status: "unavailable" };
}

let activityState: ActivityLoad = loadActivities();
const activityListeners = new Set<() => void>();
const activityCache = new Map<string, MatchActivityList>();

export type MatchActivityList =
  | { status: "ok"; activities: MatchActivity[] }
  | { status: "unavailable" };

const dateKey = (mdy: string) => {
  const c = parseRecordedDate(mdy);
  return c ? calendarKey(c) : 0;
};

/** Newest activity date first; same date → most recently recorded first. */
function sortActivities(
  list: MatchActivity[],
): MatchActivity[] {
  return [...list].sort(
    (a, b) =>
      dateKey(b.activityDate) - dateKey(a.activityDate) ||
      String(b.recordedAtIso ?? "").localeCompare(
        String(a.recordedAtIso ?? ""),
      ) ||
      String(b.id).localeCompare(String(a.id)),
  );
}

export function getMatchActivities(
  matchId: string,
): MatchActivityList {
  const cached = activityCache.get(matchId);
  if (cached) return cached;
  const result: MatchActivityList =
    activityState.status === "ok"
      ? {
          status: "ok",
          activities: sortActivities(
            activityState.data.activities[matchId] ?? [],
          ),
        }
      : { status: "unavailable" };
  activityCache.set(matchId, result);
  return result;
}

export function subscribeMatchActivities(listener: () => void) {
  activityListeners.add(listener);
  return () => {
    activityListeners.delete(listener);
  };
}

/** The current saved match (closures applied), or undefined. */
export function getMentorMatch(
  matchId: string,
): MentorMatch | undefined {
  return getMentorMatches().find((m) => m.id === matchId);
}

export interface MatchActivityInput {
  outing: FFOutingStatus | "" | null;
  activityDate: string;
  type: string;
  method: string;
  /** As entered (text) or a number; ignored when the outing didn't happen. */
  duration: string | number | null;
  mentorEngagement: number | null;
  menteeEngagement: number | null;
  notes: string;
}

export type MatchActivityErrors = Partial<
  Record<
    | "outing"
    | "activityDate"
    | "type"
    | "method"
    | "duration"
    | "mentorEngagement"
    | "menteeEngagement",
    string
  >
>;

const DECIMAL = /^(\d+(\.\d+)?|\.\d+)$/;

/** Parsed duration in hours, or null when blank/invalid. */
export function parseDurationHours(
  v: string | number | null,
): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number")
    return Number.isFinite(v) ? v : null;
  const t = v.trim();
  return DECIMAL.test(t) ? Number(t) : null;
}

/** The save rules (the UI shows the same messages). */
export function validateMatchActivity(
  input: MatchActivityInput,
  now = new Date(),
): MatchActivityErrors {
  const e: MatchActivityErrors = {};
  if (!FF_OUTING_STATUSES.some((o) => o.value === input.outing))
    e.outing = "Select whether the outing happened.";
  const d = /^\d{2}\/\d{2}\/\d{4}$/.test(
    input.activityDate?.trim() ?? "",
  )
    ? parseRecordedDate(input.activityDate.trim())
    : null;
  if (!input.activityDate?.trim())
    e.activityDate = "Enter the activity date.";
  else if (!d)
    e.activityDate = "Enter a valid date (MM/DD/YYYY).";
  else if (calendarKey(d) > calendarKey(todayCalendar(now)))
    e.activityDate =
      "The activity date can't be in the future.";
  if (
    !(FF_MATCH_ACTIVITY_TYPES as readonly string[]).includes(
      input.type,
    )
  )
    e.type = "Select an activity type.";
  if (
    !(FF_MATCH_MEETING_METHODS as readonly string[]).includes(
      input.method,
    )
  )
    e.method = "Select a meeting method.";
  if (input.outing === "yes" || input.outing === "partial") {
    const blank =
      input.duration === null ||
      input.duration === undefined ||
      String(input.duration).trim() === "";
    const hours = parseDurationHours(input.duration);
    if (blank) e.duration = "Enter the duration in hours.";
    else if (hours === null)
      e.duration =
        "Enter the duration as a number of hours (for example 1.5).";
    else if (
      hours < FF_DURATION_MIN_HOURS ||
      hours > FF_DURATION_MAX_HOURS
    )
      e.duration = `Duration must be between ${FF_DURATION_MIN_HOURS} and ${FF_DURATION_MAX_HOURS} hours.`;
  }
  const ratingOk = (r: number | null) =>
    r === null ||
    r === undefined ||
    (Number.isInteger(r) && r >= 1 && r <= 5);
  if (!ratingOk(input.mentorEngagement))
    e.mentorEngagement =
      "Choose a rating from 1 to 5, or leave it blank.";
  if (!ratingOk(input.menteeEngagement))
    e.menteeEngagement =
      "Choose a rating from 1 to 5, or leave it blank.";
  return e;
}

export type LogMatchActivityResult =
  | { ok: true; activity: MatchActivity }
  | {
      ok: false;
      reason: "invalid";
      errors: MatchActivityErrors;
    }
  | {
      ok: false;
      reason: "missing" | "actor" | "unavailable" | "storage";
    };

/**
 * Appends one activity to one match. Re-reads the saved matches and
 * activities first; writes only the activity list. Logging is allowed on
 * any existing match (ended matches and unavailable mentors included).
 */
export function logMatchActivity(
  matchId: string,
  input: MatchActivityInput,
  actor: FFActor | null = getFFActingUser(),
  now: Date = new Date(),
): LogMatchActivityResult {
  const errors = validateMatchActivity(input, now);
  if (Object.keys(errors).length)
    return { ok: false, reason: "invalid", errors };
  if (!actor?.id?.trim() || !actor.name?.trim())
    return { ok: false, reason: "actor" };
  if (refreshMentorMatchesFromStorage() !== "ok")
    return { ok: false, reason: "unavailable" };
  if (!getMentorMatch(matchId))
    return { ok: false, reason: "missing" };
  const fresh = loadActivities();
  if (fresh.status !== "ok")
    return { ok: false, reason: "unavailable" };
  const { date, time } = localStamp(now);
  const happened = input.outing !== "no";
  const activity: MatchActivity = {
    id: newFFEventId(),
    matchId,
    activityDate: input.activityDate.trim(),
    outing: input.outing as FFOutingStatus,
    type: input.type,
    method: input.method,
    durationHours: happened
      ? parseDurationHours(input.duration)
      : null,
    mentorEngagement: input.mentorEngagement ?? null,
    menteeEngagement: input.menteeEngagement ?? null,
    notes: input.notes ?? "",
    recordedAt: `${date} ${time}`,
    recordedAtIso: now.toISOString(),
    recordedBy: actor.name,
    recordedById: actor.id,
  };
  const next: ActivityData = {
    version: 1,
    activities: {
      ...fresh.data.activities,
      [matchId]: [
        ...(fresh.data.activities[matchId] ?? []),
        activity,
      ],
    },
  };
  try {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(next));
  } catch {
    return { ok: false, reason: "storage" };
  }
  activityState = { status: "ok", data: next };
  activityCache.clear();
  activityListeners.forEach((l) => l());
  return { ok: true, activity };
}

/** Test support: re-reads saved activities as a page load would. */
export function __reloadMatchActivitiesForTest(): void {
  activityState = loadActivities();
  activityCache.clear();
}

// Activities saved in another tab show up here too.
if (typeof window !== "undefined")
  window.addEventListener("storage", (e) => {
    if (e.key === ACTIVITY_KEY || e.key === null) {
      activityState = loadActivities();
      activityCache.clear();
      activityListeners.forEach((l) => l());
    }
  });