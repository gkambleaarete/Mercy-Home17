// In-memory (session) store for ITP workspace section progress: per ITP, each
// section's status, contributors and last-saved stamp. Mock state only — lets
// "Save section" / "Complete section" results survive leaving and reopening the
// workspace within the session. Also holds a per-section snapshot of the field
// values taken at Save/Complete time (keyed by plan id, then section).

export type ItpSectionStatus = "Not Started" | "In Progress" | "Complete";

export interface ItpSectionProgress {
  status: Record<string, ItpSectionStatus>;
  contributors: Record<string, string[]>;
  savedAt: Record<string, string>;
  /** section id -> (field key -> value) as of the last Save/Complete of that section. */
  fields?: Record<string, Record<string, unknown>>;
}

const store = new Map<string, ItpSectionProgress>();

export function getItpSectionProgress(itpId: string | undefined): ItpSectionProgress | undefined {
  return itpId ? store.get(itpId) : undefined;
}

export type ItpSectionWriteResult = { ok: true } | { ok: false; message: string };

export function writeItpSectionProgress(
  itpId: string | undefined,
  progress: ItpSectionProgress,
): ItpSectionWriteResult {
  if (!itpId) return { ok: false, message: "No ITP is selected." };
  try {
    const fields = progress.fields ? structuredClone(progress.fields) : store.get(itpId)?.fields;
    store.set(itpId, {
      fields,
      status: { ...progress.status },
      contributors: Object.fromEntries(
        Object.entries(progress.contributors).map(([k, v]) => [k, [...v]]),
      ),
      savedAt: { ...progress.savedAt },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Unable to save." };
  }
}

// Per-ITP care-planning meeting / connection records created through the workspace's
// connection dialog (session only). These are committed by the dialog's own Save, so
// they are written as they change. Keyed by ITP id (one plan per youth), so another
// plan never sees them. `nextParticipantId` keeps participant ids stable/unique on reopen.
export interface ItpConnectionsSnapshot {
  connections: unknown[];
  nextParticipantId: number;
}

const connectionStore = new Map<string, ItpConnectionsSnapshot>();

export function getItpConnections(itpId: string | undefined): ItpConnectionsSnapshot | undefined {
  const s = itpId ? connectionStore.get(itpId) : undefined;
  return s ? structuredClone(s) : undefined;
}

export function writeItpConnections(itpId: string | undefined, snapshot: ItpConnectionsSnapshot): void {
  if (!itpId) return;
  try {
    connectionStore.set(itpId, structuredClone(snapshot));
  } catch {
    /* keep prior snapshot; on-screen state is unaffected */
  }
}
