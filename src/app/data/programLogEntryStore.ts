// US 20222 — Program Log entries outside Staff Member Status.
//
// 1. MANUAL entries (Milieu Observation, Program Close / Reopen): durable,
//    versioned localStorage like the US 20221 status records. The write
//    boundary enforces the manual Log Type allowlist — workflow-owned types
//    (Morning/Evening/Night Entry, Connection, Shift Summary, Incident,
//    Location) and obsolete manual values are rejected here, whatever the UI
//    sent. Staff Member Status is manual too but saves through
//    shiftRoleStore.createStaffStatusEntry.
// 2. GENERATED events (Location, Incident): produced by their source
//    workflow's committed write, keyed by a stable source identity so a
//    retry or re-render upserts the same event instead of adding another.
//    Their sources (youth location, incident drafts) are session state in
//    this prototype, so these events are session-only as well.

import { useSyncExternalStore } from "react";
import { CURRENT_USER_NAME } from "./mockProgramsData";
import { isValidLocalDate, isValidLocalTime } from "./shiftRoleStore";

export const MANUAL_LOG_TYPES = [
  "Staff Member Status",
  "Milieu Observation",
  "Program Close / Reopen",
] as const;
export type ManualLogType = (typeof MANUAL_LOG_TYPES)[number];

export const PROGRAM_CLOSE_ACTIONS = ["Closing", "Reopening"] as const;
export type ProgramCloseAction = (typeof PROGRAM_CLOSE_ACTIONS)[number];

export const PROGRAM_LOG_ENTRY_STORAGE_KEY = "mh.programLogEntries.v1";
const VERSION = 1;

export interface ManualLogEntry {
  id: string;
  programId: number;
  logType: Exclude<ManualLogType, "Staff Member Status">;
  /** Submitted local date/time — used for display, sorting and filtering. */
  date: string;
  time: string;
  /** Milieu Observation. */
  content?: string;
  priority?: string;
  youth?: string[];
  programTeam?: string[];
  other?: string[];
  /** Program Close / Reopen. */
  action?: ProgramCloseAction;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface ManualLogInput {
  programId: number;
  logType: string;
  date: string;
  time: string;
  content?: string;
  priority?: string;
  youth?: string[];
  programTeam?: string[];
  other?: string[];
  action?: string;
  notes?: string;
}

export type ManualLogFieldErrors = Partial<
  Record<"logType" | "date" | "time" | "content" | "action", string>
>;

export type ManualLogWrite =
  | { ok: true; entry: ManualLogEntry }
  | {
      ok: false;
      error: "validation" | "not-allowed" | "unavailable" | "storage";
      fieldErrors?: ManualLogFieldErrors;
    };

export const MANUAL_LOG_MESSAGES = {
  "not-allowed": "This Log Type can't be created manually.",
  unavailable: "Program Log entries can't be read right now, so nothing was saved.",
  storage: "The entry couldn't be saved. Nothing was changed — try again.",
  validation: "Fix the highlighted fields.",
} as const;

export function isManualLogType(v: string): v is ManualLogType {
  return (MANUAL_LOG_TYPES as readonly string[]).includes(v);
}

// ── Durable manual entries ─────────────────────────────────────────────

type Read = { status: "ok"; entries: ManualLogEntry[] } | { status: "unavailable" };

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function readStored(): Read {
  const ls = storage();
  if (!ls) return { status: "unavailable" };
  try {
    const raw = ls.getItem(PROGRAM_LOG_ENTRY_STORAGE_KEY);
    if (raw === null) return { status: "ok", entries: [] };
    const p = JSON.parse(raw);
    if (!p || p.version !== VERSION || !Array.isArray(p.entries)) return { status: "unavailable" };
    return { status: "ok", entries: p.entries };
  } catch {
    return { status: "unavailable" };
  }
}

let snap: Read = readStored();
let snapRaw: string | null | undefined;
const listeners = new Set<() => void>();
function refresh(): Read {
  let raw: string | null | undefined;
  try {
    raw = storage()?.getItem(PROGRAM_LOG_ENTRY_STORAGE_KEY);
  } catch {
    raw = undefined;
  }
  if (raw !== snapRaw || raw === undefined) {
    snapRaw = raw;
    snap = readStored();
  }
  return snap;
}
function emit() {
  refresh();
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
if (typeof window !== "undefined" && typeof window.addEventListener === "function")
  window.addEventListener("storage", (e) => {
    if (e.key === PROGRAM_LOG_ENTRY_STORAGE_KEY) emit();
  });

export function getManualLogEntries(): Read {
  return refresh();
}
export function useManualLogEntries(): Read {
  return useSyncExternalStore(subscribe, refresh, refresh);
}

let seq = 0;
const newId = (p: string) =>
  `${p}-${Date.now().toString(36)}-${++seq}-${Math.random().toString(36).slice(2, 6)}`;

/** The manual save boundary for Milieu Observation and Program Close /
 *  Reopen. Re-reads storage, validates, writes once, then publishes. */
export function createManualLogEntry(input: ManualLogInput): ManualLogWrite {
  if (!isManualLogType(input.logType) || input.logType === "Staff Member Status")
    return { ok: false, error: "not-allowed" };
  const fieldErrors: ManualLogFieldErrors = {};
  if (!isValidLocalDate(input.date)) fieldErrors.date = "Enter a valid date.";
  if (!isValidLocalTime(input.time)) fieldErrors.time = "Enter a valid time.";
  let action: ProgramCloseAction | undefined;
  if (input.logType === "Milieu Observation" && !input.content?.trim())
    fieldErrors.content = "Enter the entry content.";
  if (input.logType === "Program Close / Reopen") {
    action = PROGRAM_CLOSE_ACTIONS.find((a) => a === input.action);
    if (!action) fieldErrors.action = "Select an Action.";
  }
  if (Object.keys(fieldErrors).length) return { ok: false, error: "validation", fieldErrors };

  const cur = readStored();
  if (cur.status !== "ok") return { ok: false, error: "unavailable" };
  const entry: ManualLogEntry =
    input.logType === "Milieu Observation"
      ? {
          id: newId("plog"),
          programId: input.programId,
          logType: "Milieu Observation",
          date: input.date,
          time: input.time,
          content: input.content!.trim(),
          priority: input.priority ?? "Medium",
          youth: input.youth ?? [],
          programTeam: input.programTeam ?? [],
          other: input.other ?? [],
          createdBy: CURRENT_USER_NAME,
          createdAt: new Date().toISOString(),
        }
      : {
          id: newId("plog"),
          programId: input.programId,
          logType: "Program Close / Reopen",
          date: input.date,
          time: input.time,
          action,
          notes: (input.notes ?? "").trim(),
          createdBy: CURRENT_USER_NAME,
          createdAt: new Date().toISOString(),
        };
  try {
    storage()!.setItem(
      PROGRAM_LOG_ENTRY_STORAGE_KEY,
      JSON.stringify({ version: VERSION, entries: [...cur.entries, entry] }),
    );
  } catch {
    return { ok: false, error: "storage" };
  }
  emit();
  return { ok: true, entry };
}

// ── Generated (workflow-owned) events — session only ───────────────────

export interface GeneratedLogEvent {
  /** Stable source identity, e.g. "location:<youthId>:<seq>", "incident:<id>". */
  key: string;
  programId: number;
  logType: "Location" | "Incident";
  date: string;
  time: string;
  youthName: string;
  /** Location */
  previousLocation?: string;
  newLocation?: string;
  passId?: number | null;
  /** Incident */
  reportId?: string;
  summary?: string;
  createdBy: string;
}

let generated: GeneratedLogEvent[] = [];
const genListeners = new Set<() => void>();

/** Insert, or replace the event with the same key (idempotent). */
export function upsertGeneratedEvent(ev: GeneratedLogEvent): void {
  const i = generated.findIndex((g) => g.key === ev.key);
  generated = i >= 0 ? generated.map((g, j) => (j === i ? ev : g)) : [...generated, ev];
  genListeners.forEach((l) => l());
}

export function getGeneratedEvents(): GeneratedLogEvent[] {
  return generated;
}

export function useGeneratedEvents(): GeneratedLogEvent[] {
  return useSyncExternalStore(
    (l) => {
      genListeners.add(l);
      return () => genListeners.delete(l);
    },
    () => generated,
    () => generated,
  );
}

export function localDateTimeParts(d: Date = new Date()): { date: string; time: string } {
  const p = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
    time: `${p(d.getHours())}:${p(d.getMinutes())}`,
  };
}

/** Test seam. */
export function __resetProgramLogEntriesForTest() {
  generated = [];
  snapRaw = undefined;
  emit();
}
