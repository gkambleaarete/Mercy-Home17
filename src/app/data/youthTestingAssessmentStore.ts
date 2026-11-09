import {
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";

// Testing & Assessments records (US 20063) — one list per youth, shared by
// every Admissions profile of that youth (profiles sharing a youthId are one
// youth, US 19983). Testing documents use the same key, so a document's
// record link resolves on any of the youth's profiles. A youth's list starts
// from the caller's seed (the existing sample records) and keeps its record
// IDs. In-memory only: survives in-app navigation, not a page reload.

/** The youth a profile belongs to: Admissions youthId, else the record's own
 *  ID (Constituent profiles). Never merges different youth. */
export function testingYouthKey(lead: {
  id: string | number;
  youthId?: string;
}): string {
  return String(lead.youthId ?? lead.id);
}

let recordsByYouth: Record<string, unknown[]> = {};
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return recordsByYouth;
}

export function getYouthTestingAssessments<T>(
  youthKey: string,
): T[] | undefined {
  return recordsByYouth[youthKey] as T[] | undefined;
}

/** The only write path. Applies `update` to exactly one youth's list. */
export function updateYouthTestingAssessments<T>(
  youthKey: string,
  update: T[] | ((prev: T[]) => T[]),
  seed: T[],
): void {
  const prev =
    (recordsByYouth[youthKey] as T[] | undefined) ?? seed;
  recordsByYouth = {
    ...recordsByYouth,
    [youthKey]:
      typeof update === "function" ? update(prev) : update,
  };
  listeners.forEach((l) => l());
}

/** useState-shaped access to one youth's records. `seed` is read once. */
export function useYouthTestingAssessments<T>(
  youthKey: string,
  seed: T[],
): [T[], React.Dispatch<React.SetStateAction<T[]>>] {
  const seedRef = useRef(seed);
  const all = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
  const records =
    (all[youthKey] as T[] | undefined) ?? seedRef.current;
  const setRecords = useCallback<
    React.Dispatch<React.SetStateAction<T[]>>
  >(
    (update) =>
      updateYouthTestingAssessments(
        youthKey,
        update,
        seedRef.current,
      ),
    [youthKey],
  );
  return [records, setRecords];
}

/** Test-only reset. */
export function resetYouthTestingAssessmentStore(): void {
  recordsByYouth = {};
  listeners.forEach((l) => l());
}