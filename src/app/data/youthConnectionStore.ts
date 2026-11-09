import { useSyncExternalStore } from "react";

// Youth Connections (20075) — the single source of truth for a Constituent
// Youth's connections, keyed by the stable Constituent ID (never the name).
// Overview → Connections and Clinical Assessments → Physical Health
// Connections both read and write the same list, so an edit in one shows in
// the other. A youth's list starts from the caller's `seed` (the existing
// Connections sample data) the first time it is written. In-memory only:
// survives in-app navigation, not a page reload (prototype, no backend).

let connectionsByYouth: Record<string, unknown[]> = {};

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return connectionsByYouth;
}

/** The only write path. Applies `update` to exactly one youth's list. */
export function updateYouthConnections<T>(
  youthId: string,
  update: T[] | ((prev: T[]) => T[]),
  seed: T[],
): void {
  const prev =
    (connectionsByYouth[youthId] as T[] | undefined) ?? seed;
  const next =
    typeof update === "function"
      ? (update as (p: T[]) => T[])(prev)
      : update;
  // Unchanged list (e.g. status automation found nothing): no write, no
  // notification — keeps subscribers from re-rendering in a loop.
  if (
    next === prev &&
    connectionsByYouth[youthId] !== undefined
  )
    return;
  connectionsByYouth = {
    ...connectionsByYouth,
    [youthId]: next,
  };
  listeners.forEach((l) => l());
}

/** Reactive connections for one youth (`seed` until first written). */
export function useYouthConnections<T>(
  youthId: string,
  seed: T[],
): T[] {
  const all = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
  return (all[youthId] as T[] | undefined) ?? seed;
}

/** Every youth's saved list, by Constituent ID (overall Connections). */
export function useAllYouthConnections(): Record<
  string,
  unknown[]
> {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
}

/** Test-only reset. */
export function resetYouthConnectionStore(): void {
  connectionsByYouth = {};
  listeners.forEach((l) => l());
}