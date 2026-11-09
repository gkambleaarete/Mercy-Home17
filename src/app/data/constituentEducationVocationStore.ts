import { useSyncExternalStore } from "react";

// Constituent Education & Vocation (US 20097) — Credentials and Specialties
// owned by a Constituent record, keyed by the stable Constituent ID (never
// the display name or role). Both profile tabs read and write the same
// owner's lists, so a credential saved in Credentials is immediately
// available as a Supporting Credential in Specialties. In-memory only:
// records survive tab switches and in-app navigation, but not a full page
// reload (prototype, no backend) — same as constituentDocumentStore.

export interface OwnedCredential {
  /** Stable id; associations reference it, never the display name. */
  id: string;
  credential: string;
  /** Custom name entered when `credential` is "Other". */
  credentialOther: string;
  credentialType: string;
  issuingOrganization: string;
  issueDate: string; // MM/DD/YYYY or ""
  expirationDate: string; // MM/DD/YYYY or ""
}

export interface SpecialtyCredentialLink {
  /** Association id (one specialty ↔ credential link). */
  id: string;
  /** Id of an OwnedCredential belonging to the same owner. */
  credentialId: string;
  associationDate: string; // MM/DD/YYYY
}

export interface OwnedSpecialty {
  id: string;
  specialty: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Inactive";
  lastModifiedBy: string;
  lastModifiedDate: string;
  credentials: SpecialtyCredentialLink[];
}

interface OwnerRecords {
  credentials: OwnedCredential[];
  specialties: OwnedSpecialty[];
}

let recordsByOwner: Record<string, OwnerRecords> = {};
let nextId = 1;

const listeners = new Set<() => void>();
const EMPTY: OwnerRecords = {
  credentials: [],
  specialties: [],
};

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return recordsByOwner;
}

/** Globally unique id, so no two owners' records collide. */
export function allocateEducationVocationId(
  prefix: string,
): string {
  return `${prefix}-${nextId++}`;
}

function getOwner(ownerId: string): OwnerRecords {
  return recordsByOwner[ownerId] ?? EMPTY;
}

/** The only write path. Applies `update` to exactly one owner's records. */
function updateOwner(
  ownerId: string,
  update: (r: OwnerRecords) => OwnerRecords,
): void {
  recordsByOwner = {
    ...recordsByOwner,
    [ownerId]: update(getOwner(ownerId)),
  };
  listeners.forEach((l) => l());
}

/** Insert or replace (by id) one credential for one owner. */
export function saveOwnerCredential(
  ownerId: string,
  credential: OwnedCredential,
): void {
  updateOwner(ownerId, (r) => ({
    ...r,
    credentials: r.credentials.some(
      (c) => c.id === credential.id,
    )
      ? r.credentials.map((c) =>
          c.id === credential.id ? credential : c,
        )
      : [...r.credentials, credential],
  }));
}

/** Remove one credential. Specialty links that referenced it are kept and
 *  display as an unavailable credential — never relinked to another. */
export function deleteOwnerCredential(
  ownerId: string,
  credentialId: string,
): void {
  updateOwner(ownerId, (r) => ({
    ...r,
    credentials: r.credentials.filter(
      (c) => c.id !== credentialId,
    ),
  }));
}

/** Insert or replace (by id) one specialty, including its links. */
export function saveOwnerSpecialty(
  ownerId: string,
  specialty: OwnedSpecialty,
): void {
  updateOwner(ownerId, (r) => ({
    ...r,
    specialties: r.specialties.some(
      (s) => s.id === specialty.id,
    )
      ? r.specialties.map((s) =>
          s.id === specialty.id ? specialty : s,
        )
      : [...r.specialties, specialty],
  }));
}

export function deleteOwnerSpecialty(
  ownerId: string,
  specialtyId: string,
): void {
  updateOwner(ownerId, (r) => ({
    ...r,
    specialties: r.specialties.filter(
      (s) => s.id !== specialtyId,
    ),
  }));
}

/** Reactive records for one owner. An empty ownerId yields empty lists. */
export function useOwnerEducationVocation(
  ownerId: string,
): OwnerRecords {
  const all = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
  return (ownerId && all[ownerId]) || EMPTY;
}

/** Display name for a credential; "Other" shows the entered custom name. */
export function credentialDisplayName(
  c: Pick<OwnedCredential, "credential" | "credentialOther">,
): string {
  return c.credential === "Other" && c.credentialOther.trim()
    ? `${c.credentialOther.trim()} (Other)`
    : c.credential;
}

/** Test-only reset. */
export function resetConstituentEducationVocationStore(): void {
  recordsByOwner = {};
  nextId = 1;
  listeners.forEach((l) => l());
}