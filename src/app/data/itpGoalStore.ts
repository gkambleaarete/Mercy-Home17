// Youth-owned ITP goals (US 20103). Managed on /itp-module/verified/:itpId.
//
// ITP identity and status: the Program compliance ITP records
// (mockYouthProgramData getItps()) — each has a stable ITP id, an explicit
// owning Constituent ID and its business Status. They are read here, never
// copied, so Program compliance and this view can't disagree.
//
// Goals: no existing goal is verifiably owned. The ITP workspace goals
// (EditITPWorkspace MOCK_GOALS_DATA) are keyed by workspace id and belong to
// sample youths that aren't constituents, and one workspace id is shared by
// ITPs of two different youths — so they are NOT imported. Goals saved here
// carry their ITP id and youth id, and every write checks that the ITP
// belongs to that youth. Optional parentGoalId keeps intermediate goals
// under their goal. Unknown extra goal fields are kept as saved.
//
// Persistence follows ptpStore: one versioned localStorage key; writes
// build from the latest saved state and persist before publishing; reads
// never write; unreadable data is left untouched and writes are refused.

import { useSyncExternalStore } from "react";
import { resolveYouthConstituent } from "../lib/youthIdentity";
import {
  getItps,
  type ItpRecord,
} from "./mockYouthProgramData";

export interface ItpGoal {
  id: string;
  itpId: number;
  youthId: string;
  /** Set on an intermediate goal: the goal it belongs to (same ITP). */
  parentGoalId?: string;
  goal: string;
  status: string;
  startDate: string;
  targetEndDate: string;
  endDate: string;
  outcomeDomain: string;
  [k: string]: unknown;
}

export type ItpGoalContent = Omit<
  ItpGoal,
  "id" | "itpId" | "youthId"
>;

interface Snapshot {
  version: 1;
  goals: Record<string, ItpGoal>;
}

export type ItpGoalResult =
  | { ok: true; goal: ItpGoal }
  | { ok: false; error: string; message: string };

const KEY = "mh.youthItpGoals.v1";

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function isGoal(id: string, v: unknown): v is ItpGoal {
  return (
    isObj(v) &&
    v.id === id &&
    Number.isInteger(v.itpId) &&
    [
      "youthId",
      "goal",
      "status",
      "startDate",
      "targetEndDate",
      "endDate",
      "outcomeDomain",
    ].every((k) => typeof v[k] === "string") &&
    (v.parentGoalId === undefined ||
      typeof v.parentGoalId === "string")
  );
}

function load(): { s: Snapshot; unreadable: boolean } {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw === null)
    return { s: { version: 1, goals: {} }, unreadable: false };
  try {
    const p = JSON.parse(raw) as unknown;
    if (
      isObj(p) &&
      p.version === 1 &&
      isObj(p.goals) &&
      Object.entries(p.goals).every(([id, g]) => isGoal(id, g))
    )
      return {
        s: { version: 1, goals: p.goals as Snapshot["goals"] },
        unreadable: false,
      };
  } catch {
    // fall through
  }
  return { s: { version: 1, goals: {} }, unreadable: true };
}

const loaded = load();
let state = loaded.s;
const unreadable = loaded.unreadable;
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const useItpGoalSnapshot = (): Readonly<Snapshot> =>
  useSyncExternalStore(subscribe, () => state);
export const getItpGoalSnapshot = (): Readonly<Snapshot> =>
  state;
export const isItpGoalStorageUnreadable = () => unreadable;

// ─── Reads ──────────────────────────────────────────────────────────────────

/** Every ITP owned by the youth (any status), by ITP date then id. */
export function itpsForYouth(youthId: string): ItpRecord[] {
  return getItps()
    .filter((i) => String(i.constituentId) === youthId)
    .sort(
      (a, b) =>
        a.itpDate.localeCompare(b.itpDate) || a.id - b.id,
    );
}

/** Goals of one ITP, only when that ITP belongs to the youth. */
export function goalsForItp(
  s: Readonly<Snapshot>,
  itpId: number,
  youthId: string,
): ItpGoal[] {
  if (!itpsForYouth(youthId).some((i) => i.id === itpId))
    return [];
  return Object.values(s.goals)
    .filter((g) => g.itpId === itpId && g.youthId === youthId)
    .sort(
      (a, b) =>
        a.startDate.localeCompare(b.startDate) ||
        a.id.localeCompare(b.id),
    );
}

/** Display order: each top-level goal followed by its intermediate goals. */
export function orderGoalHierarchy(
  goals: ItpGoal[],
): { goal: ItpGoal; intermediate: boolean }[] {
  const byParent = new Map<string, ItpGoal[]>();
  goals.forEach((g) => {
    if (g.parentGoalId)
      byParent.set(g.parentGoalId, [
        ...(byParent.get(g.parentGoalId) ?? []),
        g,
      ]);
  });
  return goals
    .filter(
      (g) =>
        !g.parentGoalId ||
        !goals.some((p) => p.id === g.parentGoalId),
    )
    .flatMap((g) => [
      { goal: g, intermediate: false },
      ...(byParent.get(g.id) ?? []).map((c) => ({
        goal: c,
        intermediate: true,
      })),
    ]);
}

// ─── Writes ─────────────────────────────────────────────────────────────────

export const newItpGoalId = () =>
  `ITPG-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

let fault = false;
/** Test seam: simulate a storage write failure. */
export function __setItpGoalPersistenceFault(on: boolean) {
  fault = on;
}

function commit(next: Snapshot): boolean {
  try {
    if (fault) throw new Error("Simulated persistence failure");
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return false;
  }
  state = next;
  listeners.forEach((l) => l());
  return true;
}

const fail = (
  error: string,
  message: string,
): ItpGoalResult => ({
  ok: false,
  error,
  message,
});

function check(
  itpId: number,
  youthId: string,
  parentGoalId?: string,
): ItpGoalResult | null {
  if (unreadable)
    return fail(
      "storage-unreadable",
      "Saved ITP goals could not be read, so changes were not saved.",
    );
  if (!resolveYouthConstituent(youthId))
    return fail(
      "invalid-owner",
      "The goal owner must be a Youth constituent.",
    );
  const itp = itpsForYouth(youthId).find((i) => i.id === itpId);
  if (!itp)
    return fail(
      "itp-mismatch",
      "This ITP doesn't belong to this youth.",
    );
  // Existing ITP lock: a Finalized ITP is read-only.
  if (itp.isFinalized || itp.status === "Finalized")
    return fail(
      "itp-finalized",
      "Finalized ITPs can't be changed.",
    );
  if (parentGoalId !== undefined) {
    const parent = state.goals[parentGoalId];
    if (
      !parent ||
      parent.itpId !== itpId ||
      parent.youthId !== youthId
    )
      return fail(
        "parent-mismatch",
        "The parent goal isn't part of this ITP.",
      );
    // Two levels only: an intermediate goal sits under a top-level goal.
    if (parent.parentGoalId)
      return fail(
        "parent-mismatch",
        "An intermediate goal can't be a parent goal.",
      );
  }
  return null;
}

export function createItpGoal(input: {
  id: string;
  itpId: number;
  youthId: string;
  content: ItpGoalContent;
}): ItpGoalResult {
  const c = check(
    input.itpId,
    input.youthId,
    input.content.parentGoalId as string | undefined,
  );
  if (c) return c;
  if (!input.id || state.goals[input.id])
    return fail(
      "already-exists",
      "A goal with this id already exists.",
    );
  const goal = {
    ...structuredClone(input.content),
    id: input.id,
    itpId: input.itpId,
    youthId: input.youthId,
  } as ItpGoal;
  if (!isGoal(goal.id, goal))
    return fail("invalid-content", "The goal is incomplete.");
  return commit({
    version: 1,
    goals: { ...state.goals, [goal.id]: goal },
  })
    ? { ok: true, goal }
    : fail(
        "persistence-failed",
        "The goal could not be saved. Your previous saved version is unchanged.",
      );
}

/** Updates content; the goal's id, ITP and youth can't change. */
export function updateItpGoal(input: {
  id: string;
  itpId: number;
  youthId: string;
  content: Partial<ItpGoalContent>;
}): ItpGoalResult {
  const prev = state.goals[input.id];
  if (!prev)
    return fail("not-found", "This goal no longer exists.");
  if (
    prev.itpId !== input.itpId ||
    prev.youthId !== input.youthId
  )
    return fail(
      "itp-mismatch",
      "This goal belongs to a different ITP or youth.",
    );
  const nextParent =
    "parentGoalId" in input.content
      ? (input.content.parentGoalId as string | undefined)
      : prev.parentGoalId;
  const c = check(input.itpId, input.youthId, nextParent);
  if (c) return c;
  if (nextParent === input.id)
    return fail(
      "parent-mismatch",
      "A goal can't be its own parent.",
    );
  if (
    nextParent &&
    Object.values(state.goals).some(
      (g) => g.parentGoalId === input.id,
    )
  )
    return fail(
      "parent-mismatch",
      "A goal with intermediate goals stays top-level.",
    );
  const goal = {
    ...prev,
    ...structuredClone(input.content),
    id: prev.id,
    itpId: prev.itpId,
    youthId: prev.youthId,
  } as ItpGoal;
  if (!isGoal(goal.id, goal))
    return fail("invalid-content", "The goal is incomplete.");
  return commit({
    version: 1,
    goals: { ...state.goals, [goal.id]: goal },
  })
    ? { ok: true, goal }
    : fail(
        "persistence-failed",
        "The goal could not be saved. Your previous saved version is unchanged.",
      );
}