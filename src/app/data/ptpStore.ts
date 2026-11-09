// Youth-owned Positive Transition Plan (PTP) statements (US 20101).
//
// Single source for the Treatment Planning → PTP editor on Constituent
// Youth profiles and (later) the Internal Transition Summary's PTP table.
// Each record has a stable PTP id and an explicit owning Youth Constituent
// ID; content keeps the editor's existing shape unchanged (statement,
// outcome domains incl. "Other", dates, Goals Completed, Status, comments).
//
// The four PTPs hard-coded in TreatmentPlanningView have no owner, so they
// are NOT imported here and are never shown as a youth's records; they stay
// as the editor's local-only data for profiles without a verified
// Constituent Youth (e.g. Admissions).
//
// Persistence follows transitionSummaryStore: one versioned localStorage
// key; every write builds the complete next snapshot from the latest saved
// state, persists it, and only then publishes it. Unreadable or unsupported
// stored data is left untouched and all writes are refused. Reads never
// write or seed records.

import { useSyncExternalStore } from "react";
import { resolveYouthConstituent } from "../lib/youthIdentity";

export interface PtpComment {
  id: number;
  date: string;
  comment: string;
}

/** The editor's existing PTP fields (unknown extra fields are kept). */
export interface PtpContent {
  statement: string;
  outcomeDomains: string[];
  otherOutcomeDomain: string;
  startDate: string;
  endDate: string;
  goalsCompleted: string;
  status: string;
  comments: PtpComment[];
}

export type PtpRecord = PtpContent & {
  id: string;
  youthId: string; // owning Youth Constituent ID
  createdAt: string;
  updatedAt: string;
};

interface Snapshot {
  version: 1;
  records: Record<string, PtpRecord>;
}

export type PtpErrorCode =
  | "invalid-owner"
  | "invalid-content"
  | "already-exists"
  | "not-found"
  | "owner-mismatch"
  | "storage-unreadable"
  | "persistence-failed";

export type PtpResult =
  | { ok: true; record: PtpRecord }
  | { ok: false; error: PtpErrorCode; message: string };

// ─── Validation ─────────────────────────────────────────────────────────────

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isComment = (v: unknown): v is PtpComment =>
  isObj(v) &&
  Number.isInteger(v.id) &&
  typeof v.date === "string" &&
  typeof v.comment === "string";

function isContent(v: unknown): v is PtpContent {
  return (
    isObj(v) &&
    [
      "statement",
      "otherOutcomeDomain",
      "startDate",
      "endDate",
      "goalsCompleted",
      "status",
    ].every((k) => typeof v[k] === "string") &&
    Array.isArray(v.outcomeDomains) &&
    v.outcomeDomains.every((d) => typeof d === "string") &&
    Array.isArray(v.comments) &&
    v.comments.every(isComment)
  );
}

function isRecord(id: string, v: unknown): v is PtpRecord {
  return (
    isObj(v) &&
    isContent(v) &&
    v.id === id &&
    ["youthId", "createdAt", "updatedAt"].every(
      (k) => typeof v[k] === "string",
    )
  );
}

// ─── State + persistence ────────────────────────────────────────────────────

const STORAGE_KEY = "mh.youthPtps.v1";

function load(): { snapshot: Snapshot; unreadable: boolean } {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  const empty: Snapshot = { version: 1, records: {} };
  if (raw === null)
    return { snapshot: empty, unreadable: false };
  try {
    const p = JSON.parse(raw) as unknown;
    if (
      isObj(p) &&
      p.version === 1 &&
      isObj(p.records) &&
      Object.entries(p.records).every(([id, r]) =>
        isRecord(id, r),
      )
    )
      return {
        snapshot: {
          version: 1,
          records: p.records as Snapshot["records"],
        },
        unreadable: false,
      };
  } catch {
    // fall through
  }
  return { snapshot: empty, unreadable: true };
}

const loaded = load();
let state: Snapshot = loaded.snapshot;
const unreadable = loaded.unreadable;
const listeners = new Set<() => void>();

/** Test seam: simulate a storage write failure. */
let persistenceFault = false;
export function __setPtpPersistenceFault(on: boolean) {
  persistenceFault = on;
}

function commit(next: Snapshot): boolean {
  try {
    if (persistenceFault)
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

export function usePtpSnapshot(): Readonly<Snapshot> {
  return useSyncExternalStore(subscribe, () => state);
}

export function getPtpSnapshot(): Readonly<Snapshot> {
  return state;
}

/** True when saved PTP data couldn't be read and was left untouched. */
export function isPtpStorageUnreadable(): boolean {
  return unreadable;
}

// ─── Reads ──────────────────────────────────────────────────────────────────

/** Every PTP owned by the youth, oldest first. No status/date filtering. */
export function ptpsForYouth(
  s: Readonly<Snapshot>,
  youthId: string,
): PtpRecord[] {
  return Object.values(s.records)
    .filter((r) => r.youthId === youthId)
    .sort(
      (a, b) =>
        a.createdAt.localeCompare(b.createdAt) ||
        a.id.localeCompare(b.id),
    );
}

/** Reactive list of one youth's PTPs. */
export function useYouthPtps(youthId: string): PtpRecord[] {
  return ptpsForYouth(usePtpSnapshot(), youthId);
}

// ─── Writes ─────────────────────────────────────────────────────────────────

export function newPtpId(): string {
  return `PTP-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const fail = (
  error: PtpErrorCode,
  message: string,
): PtpResult => ({
  ok: false,
  error,
  message,
});

function guard(youthId: string): PtpResult | null {
  if (unreadable)
    return fail(
      "storage-unreadable",
      "Saved PTP data could not be read, so changes were not saved.",
    );
  if (!resolveYouthConstituent(youthId))
    return fail(
      "invalid-owner",
      "The PTP owner must be a Youth constituent.",
    );
  return null;
}

const PERSIST_FAILED = () =>
  fail(
    "persistence-failed",
    "The PTP statement could not be saved. Your previous saved version is unchanged.",
  );

export function createPtp(
  input: { id: string; youthId: string; content: PtpContent },
  now: Date = new Date(),
): PtpResult {
  const g = guard(input.youthId);
  if (g) return g;
  if (!isContent(input.content))
    return fail(
      "invalid-content",
      "The PTP statement is incomplete.",
    );
  if (!input.id || state.records[input.id])
    return fail(
      "already-exists",
      "A PTP with this id already exists.",
    );
  const at = now.toISOString();
  const record: PtpRecord = {
    ...structuredClone(input.content),
    id: input.id,
    youthId: input.youthId,
    createdAt: at,
    updatedAt: at,
  };
  return commit({
    version: 1,
    records: { ...state.records, [record.id]: record },
  })
    ? { ok: true, record }
    : PERSIST_FAILED();
}

/** Updates content of an existing PTP owned by `youthId`; fields not
 *  supplied keep their latest saved value. Owner and id can't change. */
export function updatePtp(
  input: {
    id: string;
    youthId: string;
    content: Partial<PtpContent>;
  },
  now: Date = new Date(),
): PtpResult {
  const g = guard(input.youthId);
  if (g) return g;
  const prev = state.records[input.id];
  if (!prev)
    return fail(
      "not-found",
      "This PTP statement no longer exists.",
    );
  if (prev.youthId !== input.youthId)
    return fail(
      "owner-mismatch",
      "This PTP belongs to a different youth.",
    );
  const record: PtpRecord = {
    ...prev,
    ...structuredClone(input.content),
    id: prev.id,
    youthId: prev.youthId,
    createdAt: prev.createdAt,
    updatedAt: now.toISOString(),
  };
  if (!isContent(record))
    return fail(
      "invalid-content",
      "The PTP statement is incomplete.",
    );
  return commit({
    version: 1,
    records: { ...state.records, [record.id]: record },
  })
    ? { ok: true, record }
    : PERSIST_FAILED();
}

/** Deletes a PTP owned by `youthId` (the editor's existing Delete action). */
export function deletePtp(input: {
  id: string;
  youthId: string;
}): PtpResult {
  const g = guard(input.youthId);
  if (g) return g;
  const prev = state.records[input.id];
  if (!prev)
    return fail(
      "not-found",
      "This PTP statement no longer exists.",
    );
  if (prev.youthId !== input.youthId)
    return fail(
      "owner-mismatch",
      "This PTP belongs to a different youth.",
    );
  const { [input.id]: _removed, ...rest } = state.records;
  return commit({ version: 1, records: rest })
    ? { ok: true, record: prev }
    : PERSIST_FAILED();
}