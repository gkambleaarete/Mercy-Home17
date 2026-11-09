import { useSyncExternalStore } from "react";
import type { DocRecord } from "../components/admissions/DocumentsSection";

// Constituent Documents (20074) — the single source of truth for documents
// owned by a Constituent record, keyed by the stable Constituent ID (never
// the display name). Every page that renders DocumentsSection with the same
// ownerId reads and writes the same list. In-memory only: documents survive
// in-app navigation but not a full page reload (prototype, no backend).

let documentsByOwner: Record<string, DocRecord[]> = {};
let nextDocumentId = 1;

const listeners = new Set<() => void>();
const EMPTY: DocRecord[] = [];

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return documentsByOwner;
}

/** Globally unique document id, so no two owners' documents collide. */
export function allocateDocumentId(): number {
  return nextDocumentId++;
}

export function getOwnerDocuments(
  ownerId: string,
): DocRecord[] {
  return documentsByOwner[ownerId] ?? EMPTY;
}

/** The only write path. Applies `update` to exactly one owner's list. */
export function updateOwnerDocuments(
  ownerId: string,
  update: (docs: DocRecord[]) => DocRecord[],
): void {
  documentsByOwner = {
    ...documentsByOwner,
    [ownerId]: update(getOwnerDocuments(ownerId)),
  };
  listeners.forEach((l) => l());
}

/** Reactive documents for one owner. An empty ownerId yields []. */
export function useOwnerDocuments(
  ownerId: string,
): DocRecord[] {
  const all = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
  return (ownerId && all[ownerId]) || EMPTY;
}

/** Test-only reset. */
export function resetConstituentDocumentStore(): void {
  documentsByOwner = {};
  nextDocumentId = 1;
  listeners.forEach((l) => l());
}