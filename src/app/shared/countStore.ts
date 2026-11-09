/**
 * Shared in-memory store for cross-screen count sync.
 * AC10, AC11, AC12: Count submitted on either Count page or Single Youth
 * Dispensation screen must be visible on the other screen for the same
 * medication + dose period + current date, determined by newest Attestation Date/Time.
 *
 * Scoping (US 20102, Chunk 1): every entry and read carries an explicit
 * `scope` naming whose medication list the medicationId belongs to (e.g. a
 * screen's own fixture namespace or a youth). medicationId alone is not a
 * youth's inventory, so a read only ever sees entries of its own scope.
 * Youth-owned Admissions counts live in data/medicationLogStore.ts.
 */

export interface CountEntry {
  /** Whose medication list medicationId belongs to — required. */
  scope: string;
  date: string;        // MM/DD/YYYY — current date only
  dosePeriod: string;
  medicationId: number;
  medication: string;
  dose: string;
  countType: string;
  quantity: string;
  attestationDate: string;  // full ISO for comparison
  source: "CountPage" | "SingleYouthDispensation" | "PackMeds";  // AC27-29: Multiple sources for count sync
}

// Module-level singleton — survives re-renders, resets on full page reload
const entries: CountEntry[] = [];
const listeners: Array<() => void> = [];

function notify() {
  listeners.forEach((fn) => fn());
}

export const countStore = {
  /** AC10, AC11, AC12: Add or replace a count entry for this medication+dosePeriod+date.
   *  Always keeps only the newest entry (by attestationDate) per key. */
  upsert(entry: CountEntry) {
    const key = `${entry.scope}|${entry.date}|${entry.medicationId}|${entry.dosePeriod}`;
    const idx = entries.findIndex(
      (e) => `${e.scope}|${e.date}|${e.medicationId}|${e.dosePeriod}` === key
    );
    if (idx >= 0) {
      // Replace only if this entry is newer
      if (entry.attestationDate >= entries[idx].attestationDate) {
        entries[idx] = entry;
      }
    } else {
      entries.push(entry);
    }
    notify();
  },

  /** Get the most recent count for a medication+dosePeriod on today's date,
   *  within one scope only. */
  getLatest(scope: string, medicationId: number, dosePeriod: string, date: string): CountEntry | undefined {
    return entries
      .filter((e) => e.scope === scope && e.medicationId === medicationId && e.dosePeriod === dosePeriod && e.date === date)
      .sort((a, b) => (b.attestationDate > a.attestationDate ? 1 : -1))[0];
  },

  subscribe(fn: () => void): () => void {
    listeners.push(fn);
    return () => {
      const i = listeners.indexOf(fn);
      if (i >= 0) listeners.splice(i, 1);
    };
  },
};