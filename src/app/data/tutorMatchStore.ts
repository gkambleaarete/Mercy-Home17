// Tutor Matches + auto-created Tutor Session Connections (US 20093).
//
// Single source of truth for every Tutor Match entry point (VMS Tutor
// module, the profile Tutor Matches tab, Tutor-inactive) and for the
// Connections those Matches generate.
//
// Model (prototype interpretation — not a confirmed Salesforce schema):
//   Tutor Match ──1:1── parent Connection (Type "Tutor Session")
//                └─1:N── scheduled session occurrences
//   The parent Connection carries the Match's schedule range and daily
//   times; each occurrence is one dated session referencing both the Match
//   and the parent. Uniqueness: one parent per Match id; one occurrence per
//   Match id + date ("TM-…@MM/DD/YYYY").
//
// Persistence: one localStorage key holding the whole snapshot. Every save
// prepares the complete next snapshot first, writes it in a single setItem,
// and only then swaps memory and notifies subscribers — so a failure leaves
// no partial Match / Connection / session set and no false success.
// Seeded Matches are NOT backfilled on startup; their sessions are created
// the first time a Match is saved.

import { useSyncExternalStore } from "react";
import { CONSTITUENTS } from "./mockConstituents";
import { MOCK_TUTOR_APPLICANTS } from "./mockTutorApplicantData";
import {
  commitTutorRecordAtomic,
  getSharedMatchClosures,
  isTutorApplicantEligible,
  type SharedMatchClosure,
  type TutorRecordState,
} from "./tutorApplicantStore";
import type { TutorApplicant } from "./mockTutorApplicantData";
import {
  dayNumber,
  formatDayNumber,
  generateSessionDates,
  sortKey,
  type RecurrenceErrors,
} from "./tutorRecurrence";

// ─── Types ──────────────────────────────────────────────────────────────────

export type TutorMatchStatus =
  "Active" | "Ended" | "Inactive" | "Cancelled" | "Removed";

export interface TutorMatch {
  id: string;
  tutorId: string;
  tutorName: string;
  /** Constituent ID of a real Youth, or "fixture-youth:<name>". */
  youthId: string;
  youthName: string;
  startDate: string; // MM/DD/YYYY
  /** Planned End Date ("" = open-ended). Never overwritten by a closure. */
  endDate: string;
  startTime: string; // h:mm AM/PM
  endTime: string;
  days: string[];
  recursEvery: number;
  program: string;
  campus: string;
  otherLocation: string;
  /** Room / specific location (kept separately from Campus). */
  location: string;
  fundingType?: string;
  comment: string;
  isPrimaryTutor?: boolean;
  status: TutorMatchStatus;
  /** Closure: one captured instant used for Match and Connection. */
  closedDate?: string;
  closedTime?: string;
  closedAt?: number;
  /** Staff-entered End Date on the End Match form (audit). */
  requestedEndDate?: string;
  endReason?: string;
  connectionId?: string | null;
  createdAt: number;
  updatedAt: number;
  /** Revision, +1 on every saved change. Orders a planned tutor-inactive
   *  closure against later edits (timestamps can be equal). */
  rev?: number;
}

export interface TutorParticipant {
  id: number;
  constituentType: "Constituent" | "Non-Constituent";
  participant: string;
  role: "Tutor" | "Youth";
  /** Unmarked until recorded. */
  attended: boolean | null;
  reasonMissed: string;
  /** Stable entity reference (Constituent ID, tutor applicant, fixture). */
  entityId: string;
}

/** Parent Connection — shaped like the Connections list records. */
export interface TutorSessionConnection {
  id: string;
  type: "Tutor Session";
  status: "Scheduled" | "Completed" | "Cancelled";
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  attended: boolean;
  participants: string;
  participantList: TutorParticipant[];
  programs: string;
  homeVisit: boolean;
  /** Campus (required mapping). */
  location: string;
  /** Room / Other-campus detail from the Match. */
  locationDetail: string;
  /** Details > Match display value: "Youth / Tutor". */
  tutorMatch: string;
  sourceMatchId: string;
  youthId: string;
  tutorId: string;
  /** Match's original planned end (audit), kept after a closure. */
  plannedEndDate: string;
  plannedEndTime: string;
  createdAt: number;
  lifecycleAt: number;
  [extra: string]: unknown;
}

export interface TutorSessionOccurrence {
  id: string; // `${matchId}@${date}`
  matchId: string;
  connectionId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "Scheduled" | "Cancelled";
  /** Set when a schedule edit removed this date (reconciliation). */
  cancelReason?: string;
  attendance?: "Attended" | "Missed" | null;
  notes?: string;
  createdAt: number;
}

export interface TutorMatchDiagnostic {
  errorId: string;
  at: string; // MM/DD/YYYY h:mm AM/PM
  operation: "create" | "update" | "close" | "connection-edit";
  matchId: string;
  stage: "validation" | "generation" | "persistence";
  detail: string;
}

interface Snapshot {
  version: 1;
  matches: Record<string, TutorMatch>;
  connections: Record<string, TutorSessionConnection>;
  occurrences: Record<string, TutorSessionOccurrence>;
}

// ─── Reference identities ───────────────────────────────────────────────────

export interface PersonRef {
  id: string;
  name: string;
}

/** Real Youth Constituents (id = Constituent ID). */
export function youthOptions(): PersonRef[] {
  return CONSTITUENTS.filter(
    (c) => c.type === "Individual" && c.role === "Youth",
  ).map((c) => ({ id: String(c.id), name: c.name }));
}

const APPLICANT_PREFIX = "tutor-applicant:";

/** Tutor applicants eligible for a new Match right now: approved and not
 *  marked inactive in their saved record (live state). */
export function approvedTutorOptions(): PersonRef[] {
  return MOCK_TUTOR_APPLICANTS.filter((a) =>
    isTutorApplicantEligible(a.id),
  ).map((a) => ({
    id: `${APPLICANT_PREFIX}${a.id}`,
    name: a.name,
  }));
}

/** Whether a Tutor reference may receive a new Match. Fixture tutors and
 *  Tutor Constituents have no eligibility source in the prototype. */
export function isTutorEligible(tutorId: string): boolean {
  return tutorId.startsWith(APPLICANT_PREFIX)
    ? isTutorApplicantEligible(
        tutorId.slice(APPLICANT_PREFIX.length),
      )
    : true;
}

/** Display label for a person; when two identities share a name, the id
 *  is appended so they can be told apart (selection is always by id). */
export function labelForRef(
  refs: PersonRef[],
  id: string,
): string {
  const ref = refs.find((r) => r.id === id);
  if (!ref) return id;
  return refs.filter((r) => r.name === ref.name).length > 1
    ? `${ref.name} (${ref.id})`
    : ref.name;
}

/** Prototype-only fixture identities (never mapped to a real person). */
export const fixtureTutorRef = (name: string): PersonRef => ({
  id: `fixture-tutor:${name}`,
  name,
});
export const fixtureYouthRef = (name: string): PersonRef => ({
  id: `fixture-youth:${name}`,
  name,
});

// ─── Seed (existing VMS sample Matches; no sessions until first saved) ──────

const seed = (
  m: Omit<
    TutorMatch,
    "tutorId" | "youthId" | "status" | "createdAt" | "updatedAt"
  >,
): TutorMatch => ({
  ...m,
  tutorId: fixtureTutorRef(m.tutorName).id,
  youthId: fixtureYouthRef(m.youthName).id,
  status: "Active",
  connectionId: null,
  createdAt: 0,
  updatedAt: 0,
});

const SEED: TutorMatch[] = [
  seed({
    id: "TM-001",
    tutorName: "Angela Brooks",
    youthName: "Marcus J.",
    startDate: "05/01/2026",
    endDate: "08/29/2026",
    startTime: "3:30 PM",
    endTime: "4:30 PM",
    days: ["Monday", "Wednesday"],
    program: "Transitional Living",
    campus: "West Loop Campus",
    otherLocation: "",
    location: "Room 101 – West Loop",
    fundingType: "Title 1",
    comment: "Focus on math and reading.",
    recursEvery: 1,
  }),
  seed({
    id: "TM-002",
    tutorName: "David Kim",
    youthName: "Layla T.",
    startDate: "05/06/2026",
    endDate: "08/28/2026",
    startTime: "4:00 PM",
    endTime: "5:00 PM",
    days: ["Tuesday", "Thursday"],
    program: "Residential",
    campus: "Walsh Campus",
    otherLocation: "",
    location: "Room 105 – Walsh",
    fundingType: "Contract",
    comment: "",
    recursEvery: 1,
  }),
  seed({
    id: "TM-003",
    tutorName: "James Carter",
    youthName: "Devon S.",
    startDate: "05/04/2026",
    endDate: "07/31/2026",
    startTime: "2:00 PM",
    endTime: "3:00 PM",
    days: ["Monday", "Friday"],
    program: "Transitional Living",
    campus: "West Loop Campus",
    otherLocation: "",
    location: "Library – West Loop",
    fundingType: "Title 1",
    comment: "Wilson Reading support.",
    recursEvery: 1,
  }),
  seed({
    id: "TM-004",
    tutorName: "Maria Gonzalez",
    youthName: "Amara K.",
    startDate: "06/02/2026",
    endDate: "08/28/2026",
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    days: ["Tuesday"],
    program: "Day Treatment",
    campus: "Walsh Campus",
    otherLocation: "",
    location: "Conference Room A – Walsh",
    fundingType: "In-Kind",
    comment: "",
    recursEvery: 2,
  }),
  seed({
    id: "TM-005",
    tutorName: "Sandra Okafor",
    youthName: "Jaylen P.",
    startDate: "05/05/2026",
    endDate: "08/28/2026",
    startTime: "3:00 PM",
    endTime: "4:00 PM",
    days: ["Monday", "Wednesday", "Friday"],
    program: "Residential",
    campus: "West Loop Campus",
    otherLocation: "",
    location: "Room 203 – West Loop",
    fundingType: "Title 1",
    comment: "GED prep focus.",
    recursEvery: 1,
  }),
  seed({
    id: "TM-006",
    tutorName: "Thomas Nguyen",
    youthName: "Simone R.",
    startDate: "06/01/2026",
    endDate: "08/31/2026",
    startTime: "1:00 PM",
    endTime: "2:00 PM",
    days: ["Thursday"],
    program: "Foster Care",
    campus: "Offsite",
    otherLocation: "",
    location: "Community Center",
    fundingType: "Contract",
    comment: "Art & creative writing.",
    recursEvery: 1,
  }),
  seed({
    id: "TM-007",
    tutorName: "Kevin Walsh",
    youthName: "Elijah M.",
    startDate: "05/12/2026",
    endDate: "07/31/2026",
    startTime: "4:30 PM",
    endTime: "5:30 PM",
    days: ["Tuesday", "Thursday"],
    program: "Transitional Living",
    campus: "West Loop Campus",
    otherLocation: "",
    location: "Learning Center – Walsh",
    fundingType: "In-Kind",
    comment: "",
    recursEvery: 1,
  }),
  seed({
    id: "TM-008",
    tutorName: "Priya Nair",
    youthName: "Zara F.",
    startDate: "06/09/2026",
    endDate: "08/28/2026",
    startTime: "2:30 PM",
    endTime: "3:30 PM",
    days: ["Monday", "Wednesday"],
    program: "Community Support",
    campus: "Other",
    otherLocation: "Chicago Public Library – 400 S State St",
    location: "Other",
    fundingType: "In-Kind",
    comment: "Homework help and life skills.",
    recursEvery: 1,
  }),
];

// ─── State + persistence ────────────────────────────────────────────────────

const STORAGE_KEY = "mh.tutorMatches.v1";
const DIAG_KEY = "mh.tutorMatchDiagnostics.v1";

const emptySnapshot = (): Snapshot => ({
  version: 1,
  matches: Object.fromEntries(SEED.map((m) => [m.id, m])),
  connections: {},
  occurrences: {},
});

function load(): Snapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Snapshot>;
      return {
        version: 1,
        matches: p.matches ?? emptySnapshot().matches,
        connections: p.connections ?? {},
        occurrences: p.occurrences ?? {},
      };
    }
  } catch {
    // Unreadable storage — start from the seed.
  }
  return emptySnapshot();
}

let state: Snapshot = load();
const listeners = new Set<() => void>();

/** Test seam: simulate a failure at a stage of the next transaction(s). */
let fault: "generation" | "persistence" | null = null;
export function __setTutorMatchFault(
  f: "generation" | "persistence" | null,
) {
  fault = f;
}

/** All-or-nothing: write the full next snapshot, then publish it. */
function commit(next: Snapshot): boolean {
  try {
    if (fault === "persistence")
      throw new Error("Simulated persistence failure");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return false;
  }
  state = next;
  listeners.forEach((l) => l());
  return true;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useTutorMatchSnapshot(): Readonly<Snapshot> {
  return useSyncExternalStore(subscribe, () => state);
}

export function getTutorMatchSnapshot(): Readonly<Snapshot> {
  return state;
}

// ─── Failure log (error reference ids for staff messages) ─────────────────

let diagnostics: TutorMatchDiagnostic[] = (() => {
  try {
    return JSON.parse(localStorage.getItem(DIAG_KEY) ?? "[]");
  } catch {
    return [];
  }
})();

const stamp = (d: Date) => {
  const h = d.getHours() % 12 || 12;
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()} ${h}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() >= 12 ? "PM" : "AM"}`;
};

function logFailure(
  e: Omit<TutorMatchDiagnostic, "errorId" | "at">,
  now: Date,
): TutorMatchDiagnostic {
  const entry: TutorMatchDiagnostic = {
    ...e,
    errorId: `TMA-${now.getTime().toString(36).toUpperCase()}`,
    at: stamp(now),
  };
  diagnostics = [entry, ...diagnostics].slice(0, 100);
  try {
    localStorage.setItem(DIAG_KEY, JSON.stringify(diagnostics));
  } catch {
    // Storage unavailable: the reference is still returned to the caller.
  }
  return entry;
}

// ─── Closure cutoff policy ──────────────────────────────────────────────────
// Prototype policy (pending business confirmation): after a Match closes,
// sessions whose scheduled START is at or after the closure instant are no
// longer shown or created. A session already in progress at the closure
// instant stays (it started before the closure). Stored records are never
// deleted.
const closureKey = (
  m: Pick<TutorMatch, "closedDate" | "closedTime">,
) =>
  m.closedDate && m.closedTime
    ? sortKey(m.closedDate, m.closedTime)
    : null;
export function startsAfterClosure(
  m: Pick<TutorMatch, "closedDate" | "closedTime">,
  date: string,
  startTime: string,
): boolean {
  const k = closureKey(m);
  return k !== null && sortKey(date, startTime) >= k;
}

// ─── Building records ───────────────────────────────────────────────────────

const connectionIdFor = (matchId: string) => `TSC-${matchId}`;
const occurrenceIdFor = (matchId: string, date: string) =>
  `${matchId}@${date}`;

function participantsFor(m: TutorMatch): TutorParticipant[] {
  return [
    {
      id: 1,
      constituentType: m.youthId.startsWith("fixture-")
        ? "Non-Constituent"
        : "Constituent",
      participant: m.youthName,
      role: "Youth",
      attended: null,
      reasonMissed: "",
      entityId: m.youthId,
    },
    {
      id: 2,
      constituentType: "Non-Constituent",
      participant: m.tutorName,
      role: "Tutor",
      attended: null,
      reasonMissed: "",
      entityId: m.tutorId,
    },
  ];
}

/** Parent Connection fields mapped from the Match (Scenario 4 mapping). */
function connectionFrom(
  m: TutorMatch,
  prev: TutorSessionConnection | undefined,
  now: number,
): TutorSessionConnection {
  const closed = m.status !== "Active";
  return {
    ...(prev ?? {}),
    id: connectionIdFor(m.id),
    type: "Tutor Session",
    // A closure ends the Connection (End Date/Time); its status is left
    // as recorded — the ticket defines no status change.
    status: prev?.status ?? "Scheduled",
    startDate: m.startDate,
    startTime: m.startTime,
    endDate: closed ? m.closedDate! : m.endDate,
    endTime: closed ? m.closedTime! : m.endTime,
    attended: prev?.attended ?? false,
    // Keep any recorded attendance on existing participants of the same
    // identity; otherwise unmarked.
    participantList: participantsFor(m).map((p) => {
      const old = prev?.participantList?.find(
        (o) => o.entityId === p.entityId && o.role === p.role,
      );
      return old
        ? {
            ...p,
            attended: old.attended,
            reasonMissed: old.reasonMissed,
          }
        : p;
    }),
    participants: `${m.youthName}, ${m.tutorName}`,
    programs: m.program,
    homeVisit: prev?.homeVisit ?? false,
    location: m.campus,
    locationDetail:
      m.campus === "Other" ? m.otherLocation : m.location,
    tutorMatch: `${m.youthName} / ${m.tutorName}`,
    sourceMatchId: m.id,
    youthId: m.youthId,
    tutorId: m.tutorId,
    plannedEndDate: m.endDate,
    plannedEndTime: m.endTime,
    createdAt: prev?.createdAt ?? now,
    lifecycleAt: now,
  };
}

const isRecorded = (o: TutorSessionOccurrence) =>
  !!o.attendance || !!o.notes?.trim();

/**
 * Occurrences for a Match after a save. Existing records with the same
 * Match + date keep their ids and recorded data. A date the new schedule no
 * longer contains is kept (never deleted): past or recorded ones unchanged,
 * future unrecorded ones marked Cancelled ("Schedule changed") — prototype
 * reconciliation policy, pending business confirmation. A schedule edit
 * only adds sessions from today forward (history is never back-filled); a
 * first save covers the full range. No occurrence is created after a
 * closure.
 */
function reconcileOccurrences(
  m: TutorMatch,
  dates: string[],
  prev: TutorSessionOccurrence[],
  now: Date,
): TutorSessionOccurrence[] {
  const nowKey = sortKey(
    stamp(now).slice(0, 10),
    stamp(now).slice(11),
  );
  // "Past" uses the complete scheduled timestamp (date + start time).
  const isPast = (date: string, start: string) =>
    sortKey(date, start) < nowKey;
  const byId = new Map(prev.map((o) => [o.id, o]));
  const out: TutorSessionOccurrence[] = [];
  const wanted = new Set<string>();
  const isEdit = prev.length > 0;
  for (const date of dates) {
    if (startsAfterClosure(m, date, m.startTime)) continue;
    const id = occurrenceIdFor(m.id, date);
    const old = byId.get(id);
    if (!old && isEdit && isPast(date, m.startTime)) continue;
    wanted.add(id);
    if (old) {
      // Past or recorded sessions keep their original schedule values;
      // only future, unrecorded sessions follow the edited times.
      const frozen =
        isPast(old.date, old.startTime) || isRecorded(old);
      out.push({
        ...old,
        startTime: frozen ? old.startTime : m.startTime,
        endTime: frozen ? old.endTime : m.endTime,
        status:
          old.cancelReason === "Schedule changed"
            ? "Scheduled"
            : old.status,
        cancelReason:
          old.cancelReason === "Schedule changed"
            ? undefined
            : old.cancelReason,
      });
    } else
      out.push({
        id,
        matchId: m.id,
        connectionId: connectionIdFor(m.id),
        date,
        startTime: m.startTime,
        endTime: m.endTime,
        status: "Scheduled",
        attendance: null,
        createdAt: now.getTime(),
      });
  }
  for (const old of prev) {
    if (wanted.has(old.id)) continue;
    const future = !isPast(old.date, old.startTime);
    out.push(
      future && !isRecorded(old) && old.status === "Scheduled"
        ? {
            ...old,
            status: "Cancelled",
            cancelReason: "Schedule changed",
          }
        : old,
    );
  }
  return out.sort(
    (a, b) =>
      sortKey(a.date, a.startTime) -
      sortKey(b.date, b.startTime),
  );
}

// ─── Save (create / update) ─────────────────────────────────────────────────

export type TutorMatchInput = Omit<
  TutorMatch,
  | "status"
  | "createdAt"
  | "updatedAt"
  | "connectionId"
  | "closedDate"
  | "closedTime"
  | "closedAt"
> & { status?: TutorMatchStatus };

export interface SaveResult {
  ok: boolean;
  /** "created" | "updated" | "unchanged" on success. */
  outcome?: "created" | "updated" | "unchanged";
  /** True when this save also closed the Match (status change). */
  closed?: boolean;
  match?: TutorMatch;
  connection?: TutorSessionConnection;
  sessionCount?: number;
  openEnded?: boolean;
  errors?: RecurrenceErrors & {
    tutorId?: string;
    youthId?: string;
    campus?: string;
  };
  diagnostic?: TutorMatchDiagnostic;
}

/** A fresh Match id. Reserve it when a form opens and reuse it on retry. */
export function newTutorMatchId(): string {
  return `TM-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

const SCHEDULE_KEYS = [
  "startDate",
  "endDate",
  "startTime",
  "endTime",
  "days",
  "recursEvery",
] as const;

const MATCH_KEYS: (keyof TutorMatchInput)[] = [
  "tutorId",
  "tutorName",
  "youthId",
  "youthName",
  ...SCHEDULE_KEYS,
  "program",
  "campus",
  "otherLocation",
  "location",
  "fundingType",
  "comment",
  "isPrimaryTutor",
];

const same = (a: unknown, b: unknown) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/**
 * Saves a Tutor Match and, in the same transaction, creates/updates its
 * Tutor Session Connection and every scheduled session. Idempotent: an
 * unchanged re-save (double click, retry, reprocessing) returns the
 * existing records without writing.
 */
export function saveTutorMatch(
  input: TutorMatchInput,
  now: Date = new Date(),
): SaveResult {
  const prev = state.matches[input.id];
  const operation = prev ? "update" : "create";
  const fail = (
    stage: TutorMatchDiagnostic["stage"],
    detail: string,
    errors?: SaveResult["errors"],
  ): SaveResult => ({
    ok: false,
    errors,
    diagnostic:
      stage === "validation"
        ? undefined
        : logFailure(
            { operation, matchId: input.id, stage, detail },
            now,
          ),
  });

  // Validation
  const errors: NonNullable<SaveResult["errors"]> = {};
  if (!input.tutorId) errors.tutorId = "Tutor is required.";
  if (!input.youthId) errors.youthId = "Youth is required.";
  if (!input.campus) errors.campus = "Campus is required.";
  // Eligibility is rechecked at save time (picker filtering is not enough).
  // A Match keeping its existing Tutor stays editable for history.
  if (
    input.tutorId &&
    (!prev || prev.tutorId !== input.tutorId) &&
    !isTutorEligible(input.tutorId)
  )
    errors.tutorId =
      "This tutor is inactive or not approved and can't be given a new match.";
  const rec = generateSessionDates(input);
  if (!rec.ok) Object.assign(errors, rec.errors);
  if (Object.keys(errors).length)
    return fail("validation", "Invalid input", errors);

  // A requested Inactive/Ended/Cancelled status on an Active Match is a
  // closure, applied in this same transaction at this one instant.
  const wantsClose =
    !!input.status &&
    input.status !== "Active" &&
    input.status !== "Removed" &&
    (prev?.status ?? "Active") === "Active";
  // Unchanged re-save → existing records, no write.
  if (
    prev &&
    prev.connectionId &&
    !wantsClose &&
    MATCH_KEYS.every((k) => same(prev[k], input[k]))
  )
    return {
      ok: true,
      outcome: "unchanged",
      match: prev,
      connection: state.connections[prev.connectionId],
      sessionCount: Object.values(state.occurrences).filter(
        (o) =>
          o.matchId === prev.id && o.status === "Scheduled",
      ).length,
      openEnded: rec.ok && rec.openEnded,
    };

  // Generation (prepare the full result before committing)
  let match: TutorMatch;
  let connection: TutorSessionConnection;
  let occs: TutorSessionOccurrence[];
  try {
    if (fault === "generation")
      throw new Error("Simulated generation failure");
    const t = now.getTime();
    const [cd, ct] = [
      stamp(now).slice(0, 10),
      stamp(now).slice(11),
    ];
    match = {
      ...(prev ?? {}),
      ...input,
      status: wantsClose
        ? input.status!
        : (prev?.status ?? "Active"),
      ...(wantsClose && {
        closedDate: cd,
        closedTime: ct,
        closedAt: t,
      }),
      connectionId: connectionIdFor(input.id),
      createdAt: prev?.createdAt || t,
      updatedAt: t,
    } as TutorMatch;
    connection = connectionFrom(
      match,
      state.connections[connectionIdFor(input.id)],
      t,
    );
    match.rev = (prev?.rev ?? 0) + 1;
    // A status closure is not a schedule change: it never cancels sessions.
    // Sessions are reconciled only for the schedule (as if still open);
    // the closure then hides future starts through the shared cutoff,
    // exactly like End Match and Tutor-inactive.
    const prevOccs = Object.values(state.occurrences).filter(
      (o) => o.matchId === match.id,
    );
    const scheduleChanged =
      !prev ||
      SCHEDULE_KEYS.some((k) => !same(prev[k], input[k]));
    occs =
      wantsClose && !scheduleChanged && prevOccs.length
        ? prevOccs
        : reconcileOccurrences(
            wantsClose
              ? {
                  ...match,
                  status: prev?.status ?? "Active",
                  closedDate: prev?.closedDate,
                  closedTime: prev?.closedTime,
                }
              : match,
            rec.ok ? rec.dates : [],
            prevOccs,
            now,
          );
  } catch (err) {
    return fail(
      "generation",
      String((err as Error).message ?? err),
    );
  }

  const occurrences = { ...state.occurrences };
  for (const o of Object.values(occurrences))
    if (o.matchId === match.id) delete occurrences[o.id];
  occs.forEach((o) => (occurrences[o.id] = o));
  const ok = commit({
    version: 1,
    matches: { ...state.matches, [match.id]: match },
    connections: {
      ...state.connections,
      [connection.id]: connection,
    },
    occurrences,
  });
  if (!ok)
    return fail(
      "persistence",
      "The Match and its sessions could not be saved to browser storage.",
    );
  return {
    ok: true,
    outcome: prev ? "updated" : "created",
    closed: wantsClose,
    match,
    connection,
    sessionCount: occs.filter((o) => o.status === "Scheduled")
      .length,
    openEnded: rec.ok && rec.openEnded,
  };
}

// ─── Closure (Ended / Inactive / Cancelled / Removed) ──────────────────────

export interface CloseResult {
  ok: boolean;
  noop?: boolean;
  match?: TutorMatch;
  diagnostic?: TutorMatchDiagnostic;
}

function closedSnapshot(
  ids: string[],
  status: Exclude<TutorMatchStatus, "Active">,
  now: Date,
  extra: { endReason?: string; requestedEndDate?: string },
): Snapshot {
  const [date, time] = [
    stamp(now).slice(0, 10),
    stamp(now).slice(11),
  ];
  const matches = { ...state.matches };
  const connections = { ...state.connections };
  for (const id of ids) {
    const m = matches[id];
    const closed: TutorMatch = {
      ...m,
      status,
      closedDate: date,
      closedTime: time,
      closedAt: now.getTime(),
      updatedAt: now.getTime(),
      rev: (m.rev ?? 0) + 1,
      ...extra,
    };
    matches[id] = closed;
    if (m.connectionId && connections[m.connectionId])
      connections[m.connectionId] = connectionFrom(
        closed,
        connections[m.connectionId],
        now.getTime(),
      );
  }
  // Occurrences are left as they are: the ticket does not say whether
  // generated future sessions are cancelled or deleted (policy pending).
  // Views hide sessions after the closure date.
  return { ...state, matches, connections };
}

/**
 * Closes a Match at one captured instant; its Connection ends at the same
 * instant. Closing an already-closed Match is a no-op (no later stamp).
 */
export function closeTutorMatch(
  id: string,
  status: Exclude<TutorMatchStatus, "Active">,
  opts: {
    now?: Date;
    endReason?: string;
    requestedEndDate?: string;
  } = {},
): CloseResult {
  const now = opts.now ?? new Date();
  const m = state.matches[id];
  if (!m)
    return {
      ok: false,
      diagnostic: logFailure(
        {
          operation: "close",
          matchId: id,
          stage: "validation",
          detail: "Match not found",
        },
        now,
      ),
    };
  if (m.status !== "Active") {
    // Removing an already-ended Match keeps its original closure stamp.
    if (status === "Removed" && m.status !== "Removed") {
      const ok = commit({
        ...state,
        matches: {
          ...state.matches,
          [id]: { ...m, status: "Removed" },
        },
      });
      return ok
        ? { ok: true, match: state.matches[id] }
        : {
            ok: false,
            diagnostic: logFailure(
              {
                operation: "close",
                matchId: id,
                stage: "persistence",
                detail: "Could not save removal",
              },
              now,
            ),
          };
    }
    return { ok: true, noop: true, match: m };
  }
  const ok = commit(
    closedSnapshot([id], status, now, {
      endReason: opts.endReason,
      requestedEndDate: opts.requestedEndDate,
    }),
  );
  if (!ok)
    return {
      ok: false,
      diagnostic: logFailure(
        {
          operation: "close",
          matchId: id,
          stage: "persistence",
          detail:
            "The Match closure and its Connection end could not be saved.",
        },
        now,
      ),
    };
  return { ok: true, match: state.matches[id] };
}

// ─── Tutor marked inactive (closures saved with the tutor record) ───────────

/**
 * Closures that marking `tutorId` inactive at `now` would apply: every
 * Active Match of that Tutor, one captured instant. The caller saves them
 * in the SAME write as the tutor's inactive flag
 * (tutorApplicantStore.commitTutorRecordAtomic), then calls
 * syncTutorInactiveClosures().
 */
function planTutorInactiveClosures(
  tutorId: string,
  now: Date = new Date(),
): Record<string, SharedMatchClosure> {
  const [date, time] = [
    stamp(now).slice(0, 10),
    stamp(now).slice(11),
  ];
  const out: Record<string, SharedMatchClosure> = {};
  for (const m of Object.values(state.matches))
    if (m.tutorId === tutorId && m.status === "Active")
      out[m.id] = {
        closedDate: date,
        closedTime: time,
        at: now.getTime(),
        matchRev: m.rev ?? 0,
        tutorId,
      };
  return out;
}

/**
 * Marks a tutor applicant inactive (US 20093) — the one business action for
 * this. Plans closures from the latest Matches and, in ONE write of the
 * tutor record, saves the inactive flag, the caller's other record changes
 * and every closure. Matches/Connections are updated only after that write
 * succeeds; on failure nothing changes and the caller keeps its draft.
 */
export function markTutorInactive(
  applicant: TutorApplicant,
  nextRecord: TutorRecordState,
  now: Date = new Date(),
): { ok: boolean; ended: number; closedAt?: string } {
  const tutorId = `${APPLICANT_PREFIX}${applicant.id}`;
  const closures = planTutorInactiveClosures(tutorId, now);
  const ok = commitTutorRecordAtomic(applicant, {
    ...nextRecord,
    inactive: true,
    sharedMatchClosures: {
      ...(nextRecord.sharedMatchClosures ?? {}),
      ...closures,
    },
  });
  if (!ok) {
    logFailure(
      {
        operation: "close",
        matchId: Object.keys(closures).join(",") || "—",
        stage: "persistence",
        detail:
          "Tutor inactive change and its Match closures could not be saved.",
      },
      now,
    );
    return { ok: false, ended: 0 };
  }
  syncTutorInactiveClosures();
  return {
    ok: true,
    ended: Object.keys(closures).length,
    closedAt: stamp(now),
  };
}

/** Applies saved tutor-inactive closures to the Matches they belong to. */
function withApplicantClosures(s: Snapshot): Snapshot | null {
  const closures = getSharedMatchClosures();
  let matches: Snapshot["matches"] | null = null;
  let connections = s.connections;
  for (const [id, c] of Object.entries(closures)) {
    const m = s.matches[id];
    // Already closed or removed: keep its own closure (no new stamp).
    if (!m || m.status !== "Active") continue;
    // A closure belongs to its Tutor: it still applies after unrelated
    // edits of the same Tutor's Match (their fields are kept), and never to
    // a Match reassigned to a different Tutor. Older closures without a
    // tutorId fall back to revision, then strict time order.
    if (
      c.tutorId !== undefined
        ? m.tutorId !== c.tutorId
        : c.matchRev !== undefined
          ? (m.rev ?? 0) !== c.matchRev
          : c.at <= (m.updatedAt ?? 0)
    )
      continue;
    const closed: TutorMatch = {
      ...m,
      status: "Inactive",
      closedDate: c.closedDate,
      closedTime: c.closedTime,
      closedAt: c.at,
      updatedAt: c.at,
      rev: (m.rev ?? 0) + 1,
    };
    matches = { ...(matches ?? s.matches), [id]: closed };
    if (m.connectionId && connections[m.connectionId])
      connections = {
        ...connections,
        [m.connectionId]: connectionFrom(
          closed,
          connections[m.connectionId],
          c.at,
        ),
      };
  }
  return matches ? { ...s, matches, connections } : null;
}

/** After a tutor-inactive commit: apply its closures here and mirror them
 *  to this store's key (best effort — the tutor record stays the
 *  authoritative copy and is re-applied on every load). */
export function syncTutorInactiveClosures(): void {
  const next = withApplicantClosures(state);
  if (!next) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Re-applied from the tutor record on next load.
  }
  state = next;
  listeners.forEach((l) => l());
}

// ─── Connection edits from the Connections list ─────────────────────────────

/**
 * Saves edits made to a generated Tutor Session in the Connection dialog.
 * The source association, participants' identities and the Match link are
 * always preserved.
 */
export interface ConnectionEditResult {
  ok: boolean;
  error?: string;
  diagnostic?: TutorMatchDiagnostic;
}

export function updateTutorConnection(
  edited: TutorSessionConnection,
  now: Date = new Date(),
): ConnectionEditResult {
  const prev = state.connections[edited.id];
  if (!prev)
    return {
      ok: false,
      error: "This Tutor Session no longer exists.",
    };
  // The two source participants (Youth and Tutor from the Match) must stay,
  // with the same identity, role and name. Others may be added.
  const list = edited.participantList?.length
    ? edited.participantList
    : prev.participantList;
  for (const src of prev.participantList.filter(
    (p) => p.entityId,
  )) {
    const p = list.find((x) => x.id === src.id);
    if (
      !p ||
      p.role !== src.role ||
      p.participant !== src.participant ||
      (p.entityId !== undefined && p.entityId !== src.entityId)
    )
      return {
        ok: false,
        error: `The ${src.role} from the Tutor Match (${src.participant}) can't be removed or changed on this connection.`,
      };
  }
  const next: TutorSessionConnection = {
    ...prev,
    ...edited,
    id: prev.id,
    type: "Tutor Session",
    sourceMatchId: prev.sourceMatchId,
    youthId: prev.youthId,
    tutorId: prev.tutorId,
    tutorMatch: prev.tutorMatch,
    participantList: list.map((p) => {
      const orig = prev.participantList.find(
        (o) => o.id === p.id,
      );
      return orig
        ? { ...p, entityId: orig.entityId, role: orig.role }
        : p;
    }),
    createdAt: prev.createdAt,
    lifecycleAt: now.getTime(),
  };
  const ok = commit({
    ...state,
    connections: { ...state.connections, [prev.id]: next },
  });
  if (!ok)
    return {
      ok: false,
      error: "The connection could not be saved.",
      diagnostic: logFailure(
        {
          operation: "connection-edit",
          matchId: prev.sourceMatchId,
          stage: "persistence",
          detail:
            "Tutor Session Connection edit could not be saved.",
        },
        now,
      ),
    };
  return { ok: true };
}

// ─── Selectors ──────────────────────────────────────────────────────────────

/** Matches shown in lists (Removed ones are retained for audit only). */
export const listedMatches = (s: Readonly<Snapshot>) =>
  Object.values(s.matches).filter(
    (m) => m.status !== "Removed",
  );

/** Tutor Session Connections of one Youth (by Constituent ID). */
export function tutorConnectionsForYouth(
  s: Readonly<Snapshot>,
  youthId: string,
): TutorSessionConnection[] {
  return Object.values(s.connections).filter(
    (c) => c.youthId === youthId,
  );
}

/** Every generated Tutor Session Connection (overall Connections view). */
export const allTutorConnections = (s: Readonly<Snapshot>) =>
  Object.values(s.connections);

/**
 * Sessions to show on schedules: Scheduled occurrences, excluding any
 * after the Match's closure date.
 */
export function visibleOccurrences(
  s: Readonly<Snapshot>,
  matchIds?: Set<string>,
): TutorSessionOccurrence[] {
  return Object.values(s.occurrences)
    .filter((o) => {
      if (matchIds && !matchIds.has(o.matchId)) return false;
      if (o.status !== "Scheduled") return false;
      const m = s.matches[o.matchId];
      if (!m || m.status === "Removed") return false;
      if (startsAfterClosure(m, o.date, o.startTime))
        return false;
      return true;
    })
    .sort(
      (a, b) =>
        sortKey(a.date, a.startTime) -
        sortKey(b.date, b.startTime),
    );
}

export interface ScheduledSession {
  id: string;
  matchId: string;
  date: string;
  startTime: string;
  endTime: string;
  /** false for a seeded Match never saved since US 20093 (preview only). */
  generated: boolean;
}

/**
 * Sessions of the given Matches inside [from, to] for calendars and lists.
 * Saved Matches use their stored sessions; a seeded Match that has never
 * been saved is shown from the same recurrence function (not stored).
 */
export function scheduledSessions(
  s: Readonly<Snapshot>,
  matches: TutorMatch[],
  from: string,
  to: string,
): ScheduledSession[] {
  const a = dayNumber(from) ?? -Infinity;
  const b = dayNumber(to) ?? Infinity;
  const inWin = (d: string) => {
    const n = dayNumber(d)!;
    return n >= a && n <= b;
  };
  const out: ScheduledSession[] = [];
  const saved = new Set(
    matches.filter((m) => m.connectionId).map((m) => m.id),
  );
  for (const o of visibleOccurrences(s, saved))
    if (inWin(o.date)) out.push({ ...o, generated: true });
  for (const m of matches) {
    if (saved.has(m.id) || m.status === "Removed") continue;
    const r = generateSessionDates(m);
    if (!r.ok) continue;

    for (const d of r.dates)
      if (inWin(d) && !startsAfterClosure(m, d, m.startTime))
        out.push({
          id: `${m.id}@${d}`,
          matchId: m.id,
          date: d,
          startTime: m.startTime,
          endTime: m.endTime,
          generated: false,
        });
  }
  return out.sort(
    (x, y) =>
      sortKey(x.date, x.startTime) -
      sortKey(y.date, y.startTime),
  );
}

export { formatDayNumber };

// ─── Load-time reconciliation (runs after every definition above) ─────────
// Tutor-inactive closures are saved with the tutor record; apply any that
// this store's own copy doesn't have yet (e.g. its mirror write failed).
{
  const withClosures = withApplicantClosures(state);
  if (withClosures) {
    state = withClosures;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Applied again on the next load.
    }
  }
}