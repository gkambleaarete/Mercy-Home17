// Browser persistence for the prototype's id-keyed record stores (Pass and
// Pack Med, 20042) — same approach as transitionSummaryStore: one versioned
// localStorage key per store holding the whole list. Nothing saved (or
// storage unavailable) → the store's seed data. Saved data that can't be
// read or fails validation is ignored rather than partially loaded.

interface Snapshot<T> {
  version: 1;
  records: T[];
}

/** The saved list, or `seed` when nothing valid is saved. */
export function loadRecordList<T extends { id: number }>(
  key: string,
  seed: T[],
  isRecord: (r: unknown) => r is T,
): T[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return seed;
  }
  if (raw === null) return seed;
  try {
    const parsed = JSON.parse(raw) as Partial<
      Snapshot<unknown>
    >;
    if (
      parsed?.version !== 1 ||
      !Array.isArray(parsed.records) ||
      !parsed.records.every(isRecord)
    )
      return seed;
    return parsed.records;
  } catch {
    return seed;
  }
}

/** Writes the whole list. Returns false if storage is unavailable. */
export function saveRecordList<T>(
  key: string,
  records: T[],
): boolean {
  try {
    const snapshot: Snapshot<T> = { version: 1, records };
    localStorage.setItem(key, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}