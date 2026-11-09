import { useSyncExternalStore } from "react";
import {
  loadRecordList,
  saveRecordList,
} from "./persistedRecordList";

// Canonical Pass store (19998) — the ONE source of Pass records. The Pass
// Record page reads/writes it today; the Pass List (19992), Calendar
// (20041), Global New Pass (20004), Pack Med link (20042) and Current
// Location automation (20043) are meant to consume these same records.
// Same module-store convention as mockProgramsData.ts.
//
// The older youth-profile "Pass Schedule" (youth/PassScheduleSection.tsx)
// keeps its own local rows with a different status set; it is NOT part of
// this model and is left untouched until it is deliberately migrated.

// Demo stand-in for "user has Pass create access" (20004) — same convention
// as CURRENT_USER_IS_SYSTEM_ADMIN in mockProgramsData.ts; the prototype has
// no role/permission system. Gates the Global Actions "New Pass" item.
// Set to false to test a user without Pass create access.
export const CURRENT_USER_CAN_CREATE_PASS = true;

export type PassStatus =
  | "Pending"
  | "Confirmed"
  | "Cancelled"
  | "Shortened"
  | "Extended";

export const PASS_STATUS_OPTIONS: PassStatus[] = [
  "Pending",
  "Confirmed",
  "Cancelled",
  "Shortened",
  "Extended",
];

/** Badge variant per Pass status (same idea as programStatusBadgeVariant). */
export const PASS_STATUS_BADGE_VARIANT: Record<
  PassStatus,
  "warning" | "success" | "neutral" | "orange" | "info"
> = {
  Pending: "warning",
  Confirmed: "success",
  Cancelled: "neutral",
  Shortened: "orange",
  Extended: "info",
};

export type TransportMethod =
  "Pick Up" | "Drop Off" | "Self Transportation";

export const DEPARTURE_METHOD_OPTIONS: TransportMethod[] = [
  "Pick Up",
  "Drop Off",
  "Self Transportation",
];

export const RETURN_METHOD_OPTIONS: TransportMethod[] = [
  "Drop Off",
  "Pick Up",
  "Self Transportation",
];

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/** The weekly pattern a recurring series was generated from. Copied onto
 *  every occurrence for display; occurrences are never re-expanded from it. */
export interface PassRecurrence {
  repeatEveryWeeks: number;
  departureDay: Weekday;
  returnDay: Weekday;
  ends: "onDate" | "afterCount";
  /** ISO, when ends = "onDate" */
  endsOnDate?: string;
  /** when ends = "afterCount" */
  numberOfPasses?: number;
}

export interface PassRecord {
  id: number;
  /** System-generated on save: "Pass - [First] [Last] [MM/DD/YYYY]". */
  recordName: string;

  // Record Header
  youthId: string; // Youth Constituent ID (CONSTITUENTS), as a string
  programId: number; // ProgramRecord.id
  status: PassStatus;

  // When — dates ISO "YYYY-MM-DD"; times "h:mm AM/PM" (TimeInput format)
  startDate: string;
  departureTime: string;
  endDate: string;
  returnTime: string;

  // Who — an eligible relationship, or "other" with a free-text name
  stayingWithType: "constituent" | "other";
  /** YouthRelationship.constituentId when stayingWithType = "constituent". */
  stayingWithConstituentId: string | null;
  /** Display name: the constituent's full name, or the Other name. */
  stayingWithName: string;
  /** "(xxx) xxx-xxxx" */
  phone: string;

  // Where — a stored youth/constituent address, or "other"
  stayingAtType: "youth" | "constituent" | "other";
  /** ContactAddress.id when not "other". */
  stayingAtAddressId: string | null;
  /** Display address (snapshot of the chosen address, or the Other text) —
   *  what the List and Calendar show. */
  stayingAtAddress: string;

  // Transportation
  departureMethod: TransportMethod;
  returnMethod: TransportMethod;
  transportationDetails: string;

  // Notes — optional; will drive the Calendar note icon (20041)
  noteworthyDetails: string;

  // Cancelled — required when status = Cancelled
  cancellationReason?: string;
  // Shortened / Extended — required when status is either
  /** ISO "YYYY-MM-DD" */
  actualReturnDate?: string;
  /** "h:mm AM/PM" */
  actualReturnTime?: string;
  changeReason?: string;

  // Recurrence — every occurrence is its own Pass; seriesId groups them.
  seriesId?: string | null;
  recurrence?: PassRecurrence | null;

  // Reserved for Story 20042 — stored only, no behavior yet.
  packMedId?: number | null;

  createdBy: string;
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp */
  updatedAt: string;
}

// ─── Seed ───────────────────────────────────────────────────────────────────
// Dates are relative to today (local calendar dates) so List filters such as
// Next 7 Days / Last 30 Days always have something to show.

function isoDaysFromToday(days: number): string {
  const t = new Date();
  const d = new Date(
    t.getFullYear(),
    t.getMonth(),
    t.getDate() + days,
  );
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function seedName(youthName: string, iso: string): string {
  const [y, m, d] = iso.split("-");
  return `Pass - ${youthName} ${m}/${d}/${y}`;
}

/** Days from today to the next Friday (1–7). */
function daysToNextFriday(): number {
  const dow = new Date().getDay();
  return (5 - dow + 7) % 7 || 7;
}

const SEED_AT = "2026-09-01T15:00:00.000Z";

function seedPass(
  p: Omit<
    PassRecord,
    "recordName" | "createdBy" | "createdAt" | "updatedAt"
  > & { youthName: string },
): PassRecord {
  const { youthName, ...rest } = p;
  return {
    ...rest,
    recordName: seedName(youthName, p.startDate),
    createdBy: "System (Initial Import)",
    createdAt: SEED_AT,
    updatedAt: SEED_AT,
  };
}

const base = {
  transportationDetails: "",
  noteworthyDetails: "",
  seriesId: null,
  recurrence: null,
  packMedId: null,
} as const;

const RED_SERIES: PassRecurrence = {
  repeatEveryWeeks: 1,
  departureDay: "Friday",
  returnDay: "Sunday",
  ends: "afterCount",
  numberOfPasses: 4,
};

const SEED_PASSES: PassRecord[] = [
  seedPass({
    ...base,
    id: 1,
    youthName: "Patricia Lee",
    youthId: "12",
    programId: 3,
    status: "Confirmed",
    startDate: isoDaysFromToday(3),
    departureTime: "5:00 PM",
    endDate: isoDaysFromToday(5),
    returnTime: "4:00 PM",
    stayingWithType: "constituent",
    stayingWithConstituentId: "rel-401",
    stayingWithName: "Linda Piggy",
    phone: "(773) 555-0198",
    stayingAtType: "constituent",
    stayingAtAddressId: "ra-401",
    stayingAtAddress: "1418 W Elm St, Chicago, IL 60622",
    departureMethod: "Pick Up",
    returnMethod: "Drop Off",
    transportationDetails: "Mother picks up at the front desk.",
    // Linked to Pack Med 101 (data/mockPackMedData.ts), which points back.
    packMedId: 101,
  }),
  seedPass({
    ...base,
    id: 2,
    youthName: "Daniel White",
    youthId: "20",
    programId: 3,
    status: "Pending",
    startDate: isoDaysFromToday(10),
    departureTime: "9:00 AM",
    endDate: isoDaysFromToday(10),
    returnTime: "7:00 PM",
    stayingWithType: "other",
    stayingWithConstituentId: null,
    stayingWithName: "Coach Rivera",
    phone: "(312) 555-0144",
    stayingAtType: "other",
    stayingAtAddressId: null,
    stayingAtAddress:
      "Lincoln Park Field House, Chicago, IL 60614",
    departureMethod: "Self Transportation",
    returnMethod: "Self Transportation",
    noteworthyDetails:
      "Day pass for the regional youth track meet; must check in with staff by phone at noon and on departure from the venue.",
  }),
  seedPass({
    ...base,
    id: 3,
    youthName: "Emily Johnson",
    youthId: "1",
    programId: 1,
    status: "Cancelled",
    startDate: isoDaysFromToday(-5),
    departureTime: "4:00 PM",
    endDate: isoDaysFromToday(-3),
    returnTime: "5:00 PM",
    stayingWithType: "constituent",
    stayingWithConstituentId: "rel-101",
    stayingWithName: "Emily Bear",
    phone: "(312) 555-0141",
    stayingAtType: "youth",
    stayingAtAddressId: "ya-1",
    stayingAtAddress: "2214 N Clark St, Chicago, IL 60614",
    departureMethod: "Pick Up",
    returnMethod: "Drop Off",
    cancellationReason: "Mother unavailable this weekend.",
  }),
  seedPass({
    ...base,
    id: 4,
    youthName: "Michael Rodriguez",
    youthId: "2",
    programId: 1,
    status: "Shortened",
    startDate: isoDaysFromToday(-12),
    departureTime: "6:00 PM",
    endDate: isoDaysFromToday(-10),
    returnTime: "6:00 PM",
    stayingWithType: "constituent",
    stayingWithConstituentId: "rel-201",
    stayingWithName: "Robin Frog",
    phone: "(847) 555-0102",
    stayingAtType: "constituent",
    stayingAtAddressId: "ra-201",
    stayingAtAddress: "12 Lily Pad Ct, Skokie, IL 60076",
    departureMethod: "Drop Off",
    returnMethod: "Pick Up",
    actualReturnDate: isoDaysFromToday(-11),
    actualReturnTime: "11:00 AM",
    changeReason: "Grandparent fell ill.",
    noteworthyDetails: "Returned a day early.",
  }),
  seedPass({
    ...base,
    id: 5,
    youthName: "Rachel Clark",
    youthId: "25",
    programId: 4,
    status: "Extended",
    startDate: isoDaysFromToday(-20),
    departureTime: "3:00 PM",
    endDate: isoDaysFromToday(-18),
    returnTime: "3:00 PM",
    stayingWithType: "constituent",
    stayingWithConstituentId: "rel-601",
    stayingWithName: "Floyd Pepper",
    phone: "(708) 555-0155",
    stayingAtType: "constituent",
    stayingAtAddressId: "ra-601",
    stayingAtAddress: "33 Bass St, Cicero, IL 60804",
    departureMethod: "Pick Up",
    returnMethod: "Drop Off",
    actualReturnDate: isoDaysFromToday(-17),
    actualReturnTime: "2:00 PM",
    changeReason: "Snowstorm closed roads.",
  }),
  // A historical pass from Patricia Lee's earlier Program (Self-Awareness)
  seedPass({
    ...base,
    id: 6,
    youthName: "Patricia Lee",
    youthId: "12",
    programId: 1,
    status: "Confirmed",
    startDate: isoDaysFromToday(-200),
    departureTime: "5:00 PM",
    endDate: isoDaysFromToday(-198),
    returnTime: "4:00 PM",
    stayingWithType: "constituent",
    stayingWithConstituentId: "rel-402",
    stayingWithName: "Hank Piggy",
    phone: "(630) 555-0164",
    stayingAtType: "constituent",
    stayingAtAddressId: "ra-402",
    stayingAtAddress: "77 Farm Rd, Naperville, IL 60540",
    departureMethod: "Pick Up",
    returnMethod: "Drop Off",
  }),
  seedPass({
    ...base,
    id: 7,
    youthName: "Rachel Clark",
    youthId: "25",
    programId: 4,
    status: "Confirmed",
    startDate: isoDaysFromToday(1),
    departureTime: "10:00 AM",
    endDate: isoDaysFromToday(1),
    returnTime: "8:00 PM",
    stayingWithType: "constituent",
    stayingWithConstituentId: "rel-701",
    stayingWithName: "Skeeter Henson",
    phone: "(708) 555-0119",
    stayingAtType: "constituent",
    stayingAtAddressId: "ra-701",
    stayingAtAddress: "301 Stage Dr, Berwyn, IL 60402",
    departureMethod: "Pick Up",
    returnMethod: "Drop Off",
    noteworthyDetails: "Sister's birthday dinner.",
  }),
  // Weekly recurring series — 4 individual records sharing one seriesId
  ...[0, 1, 2, 3].map((i) =>
    seedPass({
      ...base,
      id: 8 + i,
      youthName: "Robert Anderson",
      youthId: "8",
      programId: 1,
      status: "Pending",
      startDate: isoDaysFromToday(daysToNextFriday() + i * 7),
      departureTime: "5:00 PM",
      endDate: isoDaysFromToday(daysToNextFriday() + 2 + i * 7),
      returnTime: "5:00 PM",
      stayingWithType: "constituent",
      stayingWithConstituentId: "rel-301",
      stayingWithName: "Gobo Fraggle",
      phone: "(708) 555-0133",
      stayingAtType: "youth",
      stayingAtAddressId: "ya-3",
      stayingAtAddress: "5 Rock Ln, Oak Park, IL 60302",
      departureMethod: "Pick Up",
      returnMethod: "Drop Off",
      seriesId: "series-1",
      recurrence: RED_SERIES,
    }),
  ),
];

function isPassRecord(r: unknown): r is PassRecord {
  const p = r as PassRecord;
  return (
    !!p &&
    typeof p.id === "number" &&
    typeof p.youthId === "string" &&
    typeof p.programId === "number" &&
    typeof p.startDate === "string" &&
    typeof p.endDate === "string" &&
    (p.packMedId == null || typeof p.packMedId === "number")
  );
}

// Saved in the browser (persistedRecordList); seed data until first save.
const STORAGE_KEY = "mh.passes.v1";
let passes: PassRecord[] = loadRecordList(
  STORAGE_KEY,
  [...SEED_PASSES],
  isPassRecord,
);

// ─── Reactivity ─────────────────────────────────────────────────────────────
// Every write replaces `passes` with a new array and notifies subscribers,
// so views reading through usePasses() re-render on create / edit / cancel /
// delete — and on any future write (e.g. a Pack Med link setting packMedId).
// The array itself is the snapshot; it is never mutated in place.

const listeners = new Set<() => void>();

export function subscribePasses(
  listener: () => void,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function commitPasses(next: PassRecord[]): void {
  passes = next;
  saveRecordList(STORAGE_KEY, next);
  listeners.forEach((l) => l());
}

/** The canonical Pass list, kept current for the calling component. */
export function usePasses(): PassRecord[] {
  return useSyncExternalStore(
    subscribePasses,
    getPasses,
    getPasses,
  );
}

export function getPasses(): PassRecord[] {
  return passes;
}

export function setPassesData(next: PassRecord[]): void {
  commitPasses(next);
}

export function getPassById(
  id: number,
): PassRecord | undefined {
  return passes.find((p) => p.id === id);
}

/** Next unique Pass id (max existing + 1). */
export function nextPassId(): number {
  return passes.reduce((max, p) => Math.max(max, p.id), 0) + 1;
}

/** Insert or replace (by id) — the single write path. */
export function savePass(pass: PassRecord): void {
  savePasses([pass]);
}

/** Insert or replace several Passes at once (series create / series edit). */
export function savePasses(next: PassRecord[]): void {
  const byId = new Map(next.map((p) => [p.id, p]));
  const updated = passes.map((p) => byId.get(p.id) ?? p);
  const added = next.filter(
    (p) => !passes.some((x) => x.id === p.id),
  );
  commitPasses([...updated, ...added]);
}

/** Removes a Pass entered in error (and its field history). Cancelling is
 *  NOT deleting — a cancelled Pass stays in the store. */
export function deletePass(id: number): void {
  passHistory = passHistory.filter((h) => h.passId !== id);
  commitPasses(passes.filter((p) => p.id !== id));
}

/** All occurrences in a series, in chronological order (start date, then
 *  departure time) — never array order. */
export function getSeriesPasses(
  seriesId: string,
): PassRecord[] {
  return passes
    .filter((p) => p.seriesId === seriesId)
    .sort(
      (a, b) =>
        a.startDate.localeCompare(b.startDate) || a.id - b.id,
    );
}

/** Next unique series id. */
export function nextSeriesId(): string {
  const max = passes.reduce((m, p) => {
    const n = Number(p.seriesId?.replace("series-", ""));
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `series-${max + 1}`;
}

// ─── Field history (19998) ─────────────────────────────────────────────────
// Audit events, not Pass records — so a separate collection is correct.
// One reusable entry shape for every tracked field.

export type PassTrackedField =
  | "Start Date"
  | "Departure Time"
  | "End Date"
  | "Return Time"
  | "Who will the youth be staying with?"
  | "Where will the youth be staying?"
  | "Status";

export interface PassHistoryEntry {
  id: number;
  passId: number;
  field: PassTrackedField;
  previousValue: string;
  newValue: string;
  changedBy: string;
  /** ISO timestamp */
  changedAt: string;
}

let passHistory: PassHistoryEntry[] = [];

export function getPassHistory(
  passId: number,
): PassHistoryEntry[] {
  return passHistory
    .filter((h) => h.passId === passId)
    .sort(
      (a, b) =>
        b.changedAt.localeCompare(a.changedAt) || b.id - a.id,
    );
}

/** Appends entries, assigning ids. */
export function addPassHistory(
  entries: Omit<PassHistoryEntry, "id">[],
): void {
  let next = passHistory.reduce((m, h) => Math.max(m, h.id), 0);
  passHistory = [
    ...passHistory,
    ...entries.map((e) => ({ ...e, id: ++next })),
  ];
}