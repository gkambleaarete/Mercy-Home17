// Campus Restrictions saved per Youth Constituent (US 20160). The Constituent
// Youth profile's Campus Restrictions tab and the header Restrictions
// indicator read and write this one source, keyed by the stable Constituent
// ID (never by display name), so a change shows in both. Persisted to this
// browser's localStorage (same convention as staffDetailsStore); subscribers
// are notified on every change, including another tab's (storage event).
// Prototype only: there is no server persistence.
//
// Saves never build from the in-memory cache: they re-read the persisted map,
// change only the target record, and write that back, so values saved since
// this tab loaded (for anyone) are kept. Absent storage is an empty store;
// a read error, malformed JSON or an invalid record is a failure, never an
// empty list, and is never overwritten or repaired.
//
// Limitation: read-then-write is not atomic. Two tabs saving at the same
// instant can still lose one update; sequential saves from stale tabs are
// safe.

import { useSyncExternalStore } from "react";

export interface CampusRestrictionRecord {
  id: number;
  youth: string;
  type: string;
  startDate: string;
  endDate: string;
  implementedBy: string;
  restrictionReason: string;
  campusContact: string;
  restorativeMeasureDetails: string;
  endedBy: string;
}

export type CampusRestrictionRead =
  | { status: "ok"; records: CampusRestrictionRecord[] }
  | { status: "error" };

const STORAGE_KEY = "mh.campusRestrictions.v1";
const EMPTY: CampusRestrictionRecord[] = [];

const REQUIRED_STRINGS = ["youth", "type", "startDate"] as const;
const OPTIONAL_STRINGS = [
  "endDate",
  "implementedBy",
  "restrictionReason",
  "campusContact",
  "restorativeMeasureDetails",
  "endedBy",
] as const;

/** Structural check only; no date, status or approval rules. */
function isValidRecord(r: unknown): r is CampusRestrictionRecord {
  if (!r || typeof r !== "object" || Array.isArray(r)) return false;
  const o = r as Record<string, unknown>;
  if (typeof o.id !== "number" || !Number.isFinite(o.id)) return false;
  for (const k of REQUIRED_STRINGS)
    if (typeof o[k] !== "string") return false;
  for (const k of OPTIONAL_STRINGS)
    if (o[k] !== undefined && typeof o[k] !== "string") return false;
  return true;
}

type Persisted =
  | {
      ok: true;
      raw: string | null;
      map: Record<string, CampusRestrictionRecord[]>;
    }
  | { ok: false };

function readPersisted(): Persisted {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { ok: false };
  }
  if (raw === null) return { ok: true, raw, map: {} };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return { ok: false };
    const map: Record<string, CampusRestrictionRecord[]> = {};
    for (const [owner, list] of Object.entries(parsed)) {
      if (!Array.isArray(list) || !list.every(isValidRecord))
        return { ok: false };
      map[owner] = list;
    }
    return { ok: true, raw, map };
  } catch {
    return { ok: false };
  }
}

// Cache for rendering only (never the base of a write). The state object is
// replaced only when the persisted bytes (or failure state) change, so
// useSyncExternalStore snapshots stay referentially stable between changes.
interface State {
  failed: boolean;
  byOwner: Record<string, CampusRestrictionRecord[]>;
}
const FAILED_MARK = Symbol("failed");
let state: State = { failed: false, byOwner: {} };
let lastSeen: string | null | typeof FAILED_MARK | undefined;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Re-reads storage; updates the cache and notifies only on a change. */
function refresh(): void {
  const p = readPersisted();
  const seen = p.ok ? p.raw : FAILED_MARK;
  if (seen === lastSeen) return;
  lastSeen = seen;
  state = p.ok
    ? { failed: false, byOwner: p.map }
    : { failed: true, byOwner: {} };
  emit();
}
refresh();

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === null || e.key === STORAGE_KEY) refresh();
  });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  refresh();
  return () => {
    listeners.delete(l);
  };
};

/** Saved restrictions for one Youth Constituent ID. */
export function readCampusRestrictions(
  ownerId: string,
): CampusRestrictionRead {
  refresh();
  if (state.failed) return { status: "error" };
  return { status: "ok", records: state.byOwner[ownerId] ?? EMPTY };
}

/**
 * Adds a record, or replaces the one with the same id, in one owner's current
 * persisted list. Returns false, leaving storage untouched, when the stored
 * data cannot be read or is invalid, the record is invalid, or the write
 * fails. The cache updates only after a successful write.
 */
export function saveCampusRestriction(
  ownerId: string,
  record: CampusRestrictionRecord,
): boolean {
  if (!isValidRecord(record)) return false;
  const fresh = readPersisted();
  if (!fresh.ok) {
    refresh();
    return false;
  }
  const current = fresh.map[ownerId] ?? EMPTY;
  const next = current.some((r) => r.id === record.id)
    ? current.map((r) => (r.id === record.id ? record : r))
    : [...current, record];
  const snapshot = { ...fresh.map, [ownerId]: next };
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(snapshot),
    );
  } catch {
    return false;
  }
  refresh();
  return true;
}

/** Live read for one owner; undefined owner = not a Constituent Youth. */
export function useCampusRestrictions(
  ownerId: string | undefined,
): CampusRestrictionRead | undefined {
  const s = useSyncExternalStore(subscribe, () => state);
  if (!ownerId) return undefined;
  return s.failed
    ? { status: "error" }
    : { status: "ok", records: s.byOwner[ownerId] ?? EMPTY };
}
