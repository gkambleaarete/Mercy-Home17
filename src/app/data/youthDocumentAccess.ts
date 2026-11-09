import { useSyncExternalStore } from "react";
import { CURRENT_USER_NAME } from "./mockProgramsData";
import type {
  DocumentAccess,
  DocumentCapability,
} from "./youthDocumentTypes";

// Access boundary for Youth Documents (US 20147).
//
// PROTOTYPE CONVENTION, NOT SECURITY: the app has no authorization system or
// identity provider, and this runs in the browser. The store/service checks
// these capabilities on every entry point (not just in the UI), but real
// enforcement must happen server-side.
//
// Which roles may view, mark, edit or un-restrict a RESTRICTED document is
// an OPEN DECISION (Jeremy). Until it is confirmed, every restricted
// capability is denied by default: restricted records are hidden, cannot be
// created, edited or un-restricted. No role (Admin, staff or otherwise) is
// assumed to hold them.
//
// The baseline below (view / upload / edit unrestricted documents) follows
// the existing prototype current-user convention (CURRENT_USER_NAME, as used
// for "Changed By" elsewhere) and is PROVISIONAL — no document-specific
// permission mapping was provided.

export const OPEN_ACCESS_DECISIONS = [
  "Roles allowed to view restricted documents",
  "Roles allowed to mark a document restricted",
  "Roles allowed to edit a restricted document",
  "Roles allowed to remove a restriction",
] as const;

export const BASELINE_CAPABILITIES: ReadonlySet<DocumentCapability> =
  new Set<DocumentCapability>(["view", "upload", "edit"]);

export type DocumentAccessProvider = () => DocumentAccess;

const defaultProvider: DocumentAccessProvider = () => ({
  actor: CURRENT_USER_NAME
    ? { id: "prototype-current-user", name: CURRENT_USER_NAME }
    : null,
  capabilities: BASELINE_CAPABILITIES,
});

let provider: DocumentAccessProvider = defaultProvider;
const listeners = new Set<() => void>();
/** Bumped on every provider change: a stable snapshot for React (the
 *  provider itself may return a fresh object on every call). */
let accessVersion = 0;

/** Replace the access source (real identity service, or a test fixture). */
export function setDocumentAccessProvider(
  next: DocumentAccessProvider | null,
): void {
  provider = next ?? defaultProvider;
  accessVersion++;
  listeners.forEach((l) => l());
}

export function subscribeAccess(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function currentDocumentAccess(): DocumentAccess {
  return provider();
}

/** The current access, re-rendering the caller whenever the access source
 *  changes (e.g. a permission is removed or restored). */
export function useDocumentAccess(): DocumentAccess {
  useSyncExternalStore(
    subscribeAccess,
    () => accessVersion,
    () => accessVersion,
  );
  return provider();
}

export function can(
  access: DocumentAccess,
  capability: DocumentCapability,
): boolean {
  return (
    access.actor !== null && access.capabilities.has(capability)
  );
}

/** May this access read a record with this restricted flag? */
export function canViewRecord(
  access: DocumentAccess,
  restricted: boolean,
): boolean {
  return (
    can(access, "view") &&
    (!restricted || can(access, "view-restricted"))
  );
}

export function canEditRecord(
  access: DocumentAccess,
  restricted: boolean,
): boolean {
  return (
    canViewRecord(access, restricted) &&
    can(access, "edit") &&
    (!restricted || can(access, "edit-restricted"))
  );
}