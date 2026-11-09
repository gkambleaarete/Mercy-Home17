// The ONE authoritative, versioned Admissions snapshot (US 20140 Chunk 3):
//
//   { version: 1, categories: { nextSeq, records }, closure: { closures,
//     notifications } }
//
// Saved categories + append-only comment history (admissionsCategoryStore)
// and the case-closure state (caseClosureStore) are two VIEWS over this one
// record. Every change is staged on a copy, validated, written with a single
// localStorage.setItem, and only then published — so a failed write leaves
// memory AND storage exactly as they were, and category/history/closure can
// never disagree after a failure or a reload.
//
// Guarantees (and limits):
//  - One write per change; memory changes only after that write succeeded.
//  - Before every change the snapshot is refreshed from storage, so a save
//    made by another tab is seen, and a stale pending change is refused by
//    the caller's own check (see changeAdmissionsCategory).
//  - A storage event refreshes BOTH slices together and notifies both views.
//  - NOT a server transaction. Browser storage has no locks: two tabs
//    saving in the same instant are last-write-wins on the snapshot. The
//    refresh-then-write window is a few synchronous statements, which makes
//    a lost update unlikely, not impossible.
//  - PROTOTYPE PERSISTENCE ONLY: browser storage.
//
// Migration: this build replaces two earlier keys,
//   mh.admissionsCategory.v1        (categories + history, versioned)
//   mh.admissions.caseClosures.v1   (closures + notifications, unversioned)
// When the snapshot key is absent they are read, validated and combined into
// the snapshot. The old keys are never modified or deleted. Absent legacy
// data is seeded (closures) or empty (categories) — nothing is invented
// over data that exists. If either legacy key cannot be read (corrupt or an
// unsupported version) NOTHING is migrated or written: the store reports the
// problem, keeps the raw text, and refuses writes.

import { useSyncExternalStore } from "react";
import {
  EMPTY_CATEGORIES,
  validateCategoriesSlice,
  validateClosureSlice,
  type CategoriesSlice,
} from "./admissionsStateModel";
import { seedClosureData } from "./caseClosureSeed";
import type { ClosureData } from "./caseClosureStore";

export const ADMISSIONS_STATE_STORAGE_KEY = "mh.admissions.state.v1";
export const ADMISSIONS_STATE_SCHEMA_VERSION = 1 as const;
/** Superseded keys — read once for migration, never written. */
export const LEGACY_CATEGORY_STORAGE_KEY = "mh.admissionsCategory.v1";
export const LEGACY_CLOSURE_STORAGE_KEY =
  "mh.admissions.caseClosures.v1";

export interface AdmissionsState {
  version: typeof ADMISSIONS_STATE_SCHEMA_VERSION;
  categories: CategoriesSlice;
  closure: ClosureData;
}

export type AdmissionsStateUnreadableReason =
  "corrupt" | "unsupported-version";
type Health = "ok" | AdmissionsStateUnreadableReason;

export type AdmissionsStateSource =
  | "snapshot" // read from the snapshot key
  | "migrated" // built from the legacy keys
  | "fresh"; // nothing saved yet

interface Loaded {
  state: AdmissionsState;
  health: Health;
  source: AdmissionsStateSource;
  /** Text of the key that could not be read, for recovery by hand. */
  unreadable: { key: string; raw: string } | null;
  /** What storage looked like when this was loaded (see fingerprint()). */
  fingerprint: string;
}

// ─── Reading ────────────────────────────────────────────────────────────────

function readKey(key: string): { ok: true; raw: string | null } | { ok: false } {
  try {
    return { ok: true, raw: window.localStorage.getItem(key) };
  } catch {
    return { ok: false };
  }
}

/** Raw text of all three keys, so any change to any of them is noticed. */
function fingerprint(): string {
  return [
    ADMISSIONS_STATE_STORAGE_KEY,
    LEGACY_CATEGORY_STORAGE_KEY,
    LEGACY_CLOSURE_STORAGE_KEY,
  ]
    .map((k) => {
      const r = readKey(k);
      return r.ok ? (r.raw ?? "\u0001absent") : "\u0001blocked";
    })
    .join("\u0000");
}

const freshState = (): AdmissionsState => ({
  version: ADMISSIONS_STATE_SCHEMA_VERSION,
  categories: EMPTY_CATEGORIES,
  closure: seedClosureData(),
});

type Parsed<T> =
  | { ok: true; value: T }
  | { ok: false; reason: AdmissionsStateUnreadableReason };

function parseJson(raw: string): Parsed<unknown> {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, reason: "corrupt" };
  }
}

const versionOf = (v: unknown): number | undefined =>
  v && typeof v === "object" && !Array.isArray(v)
    ? typeof (v as { version?: unknown }).version === "number"
      ? (v as { version: number }).version
      : undefined
    : undefined;

function load(): Loaded {
  const fp = fingerprint();
  const unreadable = (
    reason: AdmissionsStateUnreadableReason,
    key: string,
    raw: string,
  ): Loaded => ({
    state: freshState(),
    health: reason,
    source: "fresh",
    unreadable: { key, raw },
    fingerprint: fp,
  });

  const snap = readKey(ADMISSIONS_STATE_STORAGE_KEY);
  if (!snap.ok) {
    // Storage blocked: start from the seed; writes will fail visibly.
    return {
      state: freshState(),
      health: "ok",
      source: "fresh",
      unreadable: null,
      fingerprint: fp,
    };
  }

  if (snap.raw !== null) {
    const p = parseJson(snap.raw);
    if (!p.ok)
      return unreadable("corrupt", ADMISSIONS_STATE_STORAGE_KEY, snap.raw);
    const v = versionOf(p.value);
    if (v !== undefined && v !== ADMISSIONS_STATE_SCHEMA_VERSION)
      return unreadable(
        "unsupported-version",
        ADMISSIONS_STATE_STORAGE_KEY,
        snap.raw,
      );
    const o = p.value as { categories?: unknown; closure?: unknown };
    const categories =
      v === ADMISSIONS_STATE_SCHEMA_VERSION
        ? validateCategoriesSlice(o.categories)
        : null;
    const closure =
      v === ADMISSIONS_STATE_SCHEMA_VERSION
        ? validateClosureSlice(o.closure)
        : null;
    if (!categories || !closure)
      return unreadable("corrupt", ADMISSIONS_STATE_STORAGE_KEY, snap.raw);
    return {
      state: {
        version: ADMISSIONS_STATE_SCHEMA_VERSION,
        categories,
        closure,
      },
      health: "ok",
      source: "snapshot",
      unreadable: null,
      fingerprint: fp,
    };
  }

  // No snapshot yet: build it from the legacy keys (validate BOTH before
  // using either, so a bad one blocks the whole migration).
  const catR = readKey(LEGACY_CATEGORY_STORAGE_KEY);
  const cloR = readKey(LEGACY_CLOSURE_STORAGE_KEY);
  let categories: CategoriesSlice = EMPTY_CATEGORIES;
  let closure: ClosureData | null = null;
  let found = false;

  if (catR.ok && catR.raw !== null) {
    found = true;
    const p = parseJson(catR.raw);
    if (!p.ok)
      return unreadable("corrupt", LEGACY_CATEGORY_STORAGE_KEY, catR.raw);
    const v = versionOf(p.value);
    if (v !== undefined && v !== 1)
      return unreadable(
        "unsupported-version",
        LEGACY_CATEGORY_STORAGE_KEY,
        catR.raw,
      );
    const slice =
      v === 1 ? validateCategoriesSlice(p.value) : null; // same shape as the slice
    if (!slice)
      return unreadable("corrupt", LEGACY_CATEGORY_STORAGE_KEY, catR.raw);
    categories = slice;
  }
  if (cloR.ok && cloR.raw !== null) {
    found = true;
    const p = parseJson(cloR.raw);
    if (!p.ok)
      return unreadable("corrupt", LEGACY_CLOSURE_STORAGE_KEY, cloR.raw);
    const slice = validateClosureSlice(p.value);
    if (!slice)
      return unreadable("corrupt", LEGACY_CLOSURE_STORAGE_KEY, cloR.raw);
    closure = slice;
  }
  return {
    state: {
      version: ADMISSIONS_STATE_SCHEMA_VERSION,
      categories,
      // Seed only genuinely absent closure data.
      closure: closure ?? seedClosureData(),
    },
    health: "ok",
    source: found ? "migrated" : "fresh",
    unreadable: null,
    fingerprint: fp,
  };
}

// ─── State, snapshots, subscriptions ────────────────────────────────────────

// Assigned by adopt(load()) below, before anything can read them.
let state!: AdmissionsState;
let health!: Health;
let source!: AdmissionsStateSource;
let unreadable!: Loaded["unreadable"];
let lastFingerprint!: string;
let publishedHealth!: Health;
const listeners = new Set<() => void>();

function adopt(l: Loaded) {
  state = l.state;
  health = l.health;
  source = l.source;
  unreadable = l.unreadable;
  lastFingerprint = l.fingerprint;
}

/** Writes the whole snapshot with ONE setItem. Null on failure. */
function persist(next: AdmissionsState): string | null {
  const json = JSON.stringify(next);
  try {
    window.localStorage.setItem(ADMISSIONS_STATE_STORAGE_KEY, json);
  } catch {
    return null;
  }
  return json;
}

function emit() {
  listeners.forEach((l) => l());
}

adopt(load());
publishedHealth = health;
// A successful migration is written straight away so every later read (and
// every other tab) uses the snapshot. If the write fails nothing is lost:
// the legacy keys are untouched and the next change writes the snapshot.
if (source === "migrated" && health === "ok") {
  if (persist(state) !== null) {
    lastFingerprint = fingerprint();
    source = "snapshot";
  }
}

export function subscribeAdmissionsState(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getAdmissionsState(): AdmissionsState {
  return state;
}
export function getAdmissionsStateHealth(): Health {
  return health;
}
/** How this session's state was obtained (useful for diagnostics/tests). */
export function getAdmissionsStateSource(): AdmissionsStateSource {
  return source;
}
export function getUnreadableAdmissionsStateData(): {
  reason: AdmissionsStateUnreadableReason;
  key: string;
  raw: string;
} | null {
  refreshAdmissionsState();
  return health !== "ok" && unreadable
    ? { reason: health as AdmissionsStateUnreadableReason, ...unreadable }
    : null;
}

export interface AdmissionsStateProblem {
  reason: AdmissionsStateUnreadableReason;
  /** Which storage key could not be read. */
  key: string;
  /** True when the unreadable data is an earlier-version key that was
   *  being migrated, not the snapshot itself. */
  legacy: boolean;
}

// Stable object per problem, so subscribers re-render only when it changes.
let problemCache: {
  health: Health;
  unreadable: Loaded["unreadable"];
  value: AdmissionsStateProblem | null;
} | null = null;
function currentProblem(): AdmissionsStateProblem | null {
  if (
    problemCache &&
    problemCache.health === health &&
    problemCache.unreadable === unreadable
  )
    return problemCache.value;
  const value: AdmissionsStateProblem | null =
    health !== "ok" && unreadable
      ? {
          reason: health as AdmissionsStateUnreadableReason,
          key: unreadable.key,
          legacy: unreadable.key !== ADMISSIONS_STATE_STORAGE_KEY,
        }
      : null;
  problemCache = { health, unreadable, value };
  return value;
}

/** Reactive: why saved Admissions data (categories, history AND closures)
 *  can't be read, or null when it can. Fallback values shown meanwhile are
 *  the original ones, not saved state. */
export function useAdmissionsStateProblem(): AdmissionsStateProblem | null {
  return useSyncExternalStore(
    subscribeAdmissionsState,
    currentProblem,
    currentProblem,
  );
}

export function useAdmissionsState(): AdmissionsState {
  return useSyncExternalStore(
    subscribeAdmissionsState,
    getAdmissionsState,
    getAdmissionsState,
  );
}

/** Re-reads storage; if anything changed, adopts it and notifies BOTH views
 *  (categories and closures) in one go. Slices whose content did not change
 *  keep their object identity, so their subscribers do not re-render. */
export function refreshAdmissionsState(): void {
  if (fingerprint() === lastFingerprint) return;
  const fresh = load();
  const prev = state;
  const sameCat =
    JSON.stringify(fresh.state.categories) ===
    JSON.stringify(prev.categories);
  const sameClo =
    JSON.stringify(fresh.state.closure) ===
    JSON.stringify(prev.closure);
  const healthChanged = fresh.health !== publishedHealth;
  const next: AdmissionsState = {
    version: ADMISSIONS_STATE_SCHEMA_VERSION,
    categories: sameCat ? prev.categories : fresh.state.categories,
    closure: sameClo ? prev.closure : fresh.state.closure,
  };
  adopt({ ...fresh, state: next });
  publishedHealth = fresh.health;
  if (!sameCat || !sameClo || healthChanged) emit();
}

if (typeof window !== "undefined")
  window.addEventListener("storage", (e) => {
    if (
      e.key === null ||
      e.key === ADMISSIONS_STATE_STORAGE_KEY ||
      e.key === LEGACY_CATEGORY_STORAGE_KEY ||
      e.key === LEGACY_CLOSURE_STORAGE_KEY
    )
      refreshAdmissionsState();
  });

// ─── The one write path ─────────────────────────────────────────────────────

/** A mutator refuses by returning this instead of a state. */
export interface MutatorRefusal {
  refused: true;
  reason: string;
  error: string;
}
export const refuse = (
  reason: string,
  error: string,
): MutatorRefusal => ({ refused: true, reason, error });

export type CommitResult<R = undefined> =
  | { ok: true; changed: boolean; state: AdmissionsState; value: R }
  | {
      ok: false;
      reason: "unreadable" | "storage" | string;
      error: string;
    };

const UNREADABLE_ERROR =
  "Saved Admissions data can't be read, so nothing was changed. The saved data has been left as it is.";
const STORAGE_ERROR =
  "The change could not be saved. Nothing was changed. Your entries are kept — please try again.";

/** Stage → validate → persist once → publish.
 *
 *  `stage` receives the freshly refreshed state and returns the complete
 *  next state (it must not mutate its input), the same state for "no
 *  change", or a refusal. Nothing outside this function changes until the
 *  single write has succeeded. `value` is passed through to the caller. */
export function commitAdmissionsState<R = undefined>(
  stage: (current: AdmissionsState) => {
    next: AdmissionsState;
    value?: R;
  } | MutatorRefusal,
): CommitResult<R> {
  refreshAdmissionsState();
  if (health !== "ok")
    return { ok: false, reason: "unreadable", error: UNREADABLE_ERROR };

  const staged = stage(state);
  if ("refused" in staged)
    return { ok: false, reason: staged.reason, error: staged.error };
  const { next, value } = staged;
  if (next === state)
    return { ok: true, changed: false, state, value: value as R };

  if (persist(next) === null)
    return { ok: false, reason: "storage", error: STORAGE_ERROR };

  // Persisted: publish. Unchanged slices keep their identity.
  const prev = state;
  state = {
    version: ADMISSIONS_STATE_SCHEMA_VERSION,
    categories:
      next.categories === prev.categories
        ? prev.categories
        : next.categories,
    closure: next.closure === prev.closure ? prev.closure : next.closure,
  };
  source = "snapshot";
  lastFingerprint = fingerprint();
  emit();
  return { ok: true, changed: true, state, value: value as R };
}

// ─── Test support ───────────────────────────────────────────────────────────

/** Test-only: forget memory AND all three storage keys. */
export function __resetAdmissionsStateForTest(): void {
  try {
    window.localStorage.removeItem(ADMISSIONS_STATE_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_CATEGORY_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_CLOSURE_STORAGE_KEY);
  } catch {
    // ignore
  }
  adopt(load());
  publishedHealth = health;
  emit();
}