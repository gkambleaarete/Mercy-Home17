import { useSyncExternalStore } from "react";

// Community Care — Community Needs (20092). Independent flags on an
// Individual constituent, keyed by the stable Constituent ID. They are NOT
// constituent roles: nothing here reads or writes Constituent.role or any
// role record. Persisted to this browser's localStorage (same convention as
// ffMenteeStore / tutorApplicantStore) so changes survive navigation and a
// page reload. Prototype only: there is no server persistence.

export const COMMUNITY_NEED_OPTIONS = [
  "Community Care Scholar",
  "Community Care Employment",
  "Community Care Housing",
  "Community Care Therapy",
  "Community Care - Care Management",
  "Community Care - Care Coordination",
] as const;

export type CommunityNeed =
  (typeof COMMUNITY_NEED_OPTIONS)[number];

export interface CommunityNeedAssignment {
  id: number;
  need: CommunityNeed;
  /** "YYYY-MM-DD" or "" when not entered. */
  startDate: string;
  /** "YYYY-MM-DD" or "" when not entered (open-ended). */
  endDate: string;
}

export interface CommunityCareRecord {
  needs: CommunityNeedAssignment[];
  notes: string;
}

const EMPTY_RECORD: CommunityCareRecord = {
  needs: [],
  notes: "",
};

let nextAssignmentId = 1;
function seed(
  needs: Omit<CommunityNeedAssignment, "id">[],
): CommunityCareRecord {
  return {
    needs: needs.map((n) => ({ ...n, id: nextAssignmentId++ })),
    notes: "",
  };
}

// Prototype seed data so the list column/filter has something to show.
// Used only when nothing has been saved in this browser yet.
const SEED: Record<string, CommunityCareRecord> = {
  "1": seed([
    {
      need: "Community Care Therapy",
      startDate: "2026-01-12",
      endDate: "",
    },
    {
      need: "Community Care Housing",
      startDate: "2026-02-01",
      endDate: "",
    },
    {
      need: "Community Care - Care Coordination",
      startDate: "2026-03-15",
      endDate: "",
    },
  ]),
  "3": seed([
    {
      need: "Community Care Employment",
      startDate: "2026-04-01",
      endDate: "",
    },
  ]),
  "6": seed([
    {
      need: "Community Care Scholar",
      startDate: "2025-09-01",
      endDate: "2026-06-30",
    },
    {
      need: "Community Care - Care Management",
      startDate: "2026-01-05",
      endDate: "",
    },
  ]),
};

const STORAGE_KEY = "mh.communityCareRecords.v1";
const VALID_NEEDS = new Set<string>(COMMUNITY_NEED_OPTIONS);
const ISO_OR_EMPTY = /^(\d{4}-\d{2}-\d{2})?$/;

/** Reads saved records, keeping only well-formed entries. */
function load(): Record<string, CommunityCareRecord> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as Record<
      string,
      Partial<CommunityCareRecord>
    >;
    const out: Record<string, CommunityCareRecord> = {};
    for (const [id, r] of Object.entries(parsed ?? {})) {
      const needs = (
        Array.isArray(r?.needs) ? r.needs : []
      ).filter(
        (n): n is CommunityNeedAssignment =>
          !!n &&
          typeof n.id === "number" &&
          VALID_NEEDS.has(n.need) &&
          ISO_OR_EMPTY.test(n.startDate ?? "x") &&
          ISO_OR_EMPTY.test(n.endDate ?? "x"),
      );
      out[id] = {
        needs,
        notes: typeof r?.notes === "string" ? r.notes : "",
      };
    }
    return out;
  } catch {
    return SEED;
  }
}

/** False when storage is unavailable (private mode / quota / blocked). */
function persist(): boolean {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(recordsByConstituent),
    );
    return true;
  } catch {
    // Keep working in memory; callers tell the user it won't survive reload.
    return false;
  }
}

let recordsByConstituent: Record<string, CommunityCareRecord> =
  load();
// Continue ids after anything already saved so new ids never collide.
nextAssignmentId = Math.max(
  nextAssignmentId,
  ...Object.values(recordsByConstituent).flatMap((r) =>
    r.needs.map((n) => n.id + 1),
  ),
);

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return recordsByConstituent;
}

export function allocateCommunityNeedId(): number {
  return nextAssignmentId++;
}

export function getCommunityCare(
  constituentId: string,
): CommunityCareRecord {
  return recordsByConstituent[constituentId] ?? EMPTY_RECORD;
}

/**
 * The only write path. Applies `update` to exactly one constituent.
 * Returns false when the change could not be written to browser storage
 * (it still applies in memory for this session).
 */
export function updateCommunityCare(
  constituentId: string,
  update: (record: CommunityCareRecord) => CommunityCareRecord,
): boolean {
  recordsByConstituent = {
    ...recordsByConstituent,
    [constituentId]: update(getCommunityCare(constituentId)),
  };
  const saved = persist();
  listeners.forEach((l) => l());
  return saved;
}

// Unsaved Community Care Notes drafts, one per constituent. Notes are
// committed by the Constituent Details page Save button (and discarded by
// Cancel); until then they live here, in memory, so a draft survives the
// section unmounting (sub-tab switch / in-app navigation). Not persisted.
let notesDrafts: Record<string, string> = {};
const draftListeners = new Set<() => void>();

function subscribeDrafts(listener: () => void): () => void {
  draftListeners.add(listener);
  return () => draftListeners.delete(listener);
}

export function getNotesDraft(
  constituentId: string,
): string | undefined {
  return notesDrafts[constituentId];
}

/** Sets the draft; `undefined` (or the saved value) clears it. */
export function setNotesDraft(
  constituentId: string,
  draft: string | undefined,
): void {
  const { [constituentId]: _prev, ...rest } = notesDrafts;
  notesDrafts =
    draft === undefined ||
    draft === getCommunityCare(constituentId).notes
      ? rest
      : { ...rest, [constituentId]: draft };
  draftListeners.forEach((l) => l());
}

/** Reactive unsaved notes draft (undefined when there is none). */
export function useNotesDraft(
  constituentId: string,
): string | undefined {
  return useSyncExternalStore(
    subscribeDrafts,
    () => notesDrafts[constituentId],
    () => notesDrafts[constituentId],
  );
}

/**
 * Commits the notes draft (page Save). Returns null when there was nothing
 * to save, otherwise whether it was durably written to browser storage.
 */
export function commitNotesDraft(
  constituentId: string,
): boolean | null {
  const draft = notesDrafts[constituentId];
  if (draft === undefined) return null;
  const saved = updateCommunityCare(constituentId, (r) => ({
    ...r,
    notes: draft,
  }));
  setNotesDraft(constituentId, undefined);
  return saved;
}

/** Reactive record for one constituent. An empty id yields the empty record. */
export function useCommunityCare(
  constituentId: string,
): CommunityCareRecord {
  const all = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
  return (constituentId && all[constituentId]) || EMPTY_RECORD;
}

/** Reactive map of every constituent's record (list page column/filter). */
export function useAllCommunityCare(): Record<
  string,
  CommunityCareRecord
> {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
}

/** Distinct needs assigned to a constituent, in option order. */
export function distinctNeeds(
  record: CommunityCareRecord,
): CommunityNeed[] {
  const set = new Set(record.needs.map((n) => n.need));
  return COMMUNITY_NEED_OPTIONS.filter((o) => set.has(o));
}

/**
 * True when two assignments of the same need overlap in time. Missing dates
 * are open-ended (no start = since forever, no end = ongoing).
 */
export function rangesOverlap(
  a: Pick<CommunityNeedAssignment, "startDate" | "endDate">,
  b: Pick<CommunityNeedAssignment, "startDate" | "endDate">,
): boolean {
  const aStart = a.startDate || "0000-01-01";
  const aEnd = a.endDate || "9999-12-31";
  const bStart = b.startDate || "0000-01-01";
  const bEnd = b.endDate || "9999-12-31";
  return aStart <= bEnd && bStart <= aEnd;
}