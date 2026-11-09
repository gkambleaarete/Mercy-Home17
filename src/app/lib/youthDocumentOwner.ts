// Document ownership resolution (US 20147).
//
// Youth Documents are owned either by a verified Youth Constituent or — until
// an explicit link exists — by an Admissions record. This module is the only
// place that turns profiles into owners, and it validates every owner against
// the authoritative application records:
//   - Youth: CONSTITUENTS (Individual + Youth role), via resolveYouthConstituent;
//   - Admissions: ALL_LEADS (the record must exist).
//
// Links come ONLY from the existing mechanism: an Admissions record's explicit
// `youthConstituentId` (see youthIdentity). Nothing is inferred from names,
// id suffixes, the "Y-…" Admissions youth key or list positions, and no new
// linking workflow is created here.

import { ALL_LEADS } from "../data/mockLeadsData";
import type {
  DocumentOwner,
  DocumentOwnerScope,
} from "../data/youthDocumentTypes";
import { resolveYouthConstituent } from "./youthIdentity";

const youthOwner = (id: string): DocumentOwner => ({
  kind: "youth",
  id,
});
const admissionOwner = (id: string): DocumentOwner => ({
  kind: "admission",
  id,
});

const findAdmission = (id: string) =>
  ALL_LEADS.find((l) => l.id === id) ?? null;

/** Is this owner a real record of its own kind? */
export function verifyOwner(owner: DocumentOwner): boolean {
  if (!owner || !owner.id) return false;
  return owner.kind === "youth"
    ? resolveYouthConstituent(owner.id) !== null
    : findAdmission(owner.id) !== null;
}

/** The verified Youth an Admissions record is explicitly linked to. */
function linkedYouthId(admissionId: string): string | null {
  const lead = findAdmission(admissionId);
  if (!lead || lead.youthConstituentId === undefined)
    return null;
  const id = String(lead.youthConstituentId);
  return resolveYouthConstituent(id) ? id : null;
}

/** Admissions records explicitly linked to this verified Youth. */
function admissionsLinkedTo(youthId: string): string[] {
  return ALL_LEADS.filter(
    (l) =>
      l.youthConstituentId !== undefined &&
      String(l.youthConstituentId) === youthId,
  ).map((l) => l.id);
}

/** Scope for a verified Youth Constituent (null if not verified). */
export function youthScope(
  youthId: string,
): DocumentOwnerScope | null {
  if (!youthId || !resolveYouthConstituent(youthId))
    return null;
  const primary = youthOwner(youthId);
  return {
    primary,
    owners: [
      primary,
      ...admissionsLinkedTo(youthId).map(admissionOwner),
    ],
  };
}

/**
 * Scope for an Admissions record (null if no such record). Linked → the same
 * scope as the Youth, so both profiles show the same records. Unlinked → just
 * this record.
 */
export function admissionScope(
  admissionId: string,
): DocumentOwnerScope | null {
  if (!admissionId || !findAdmission(admissionId)) return null;
  const youth = linkedYouthId(admissionId);
  if (youth) return youthScope(youth);
  const primary = admissionOwner(admissionId);
  return { primary, owners: [primary] };
}

/** A stable string for memoising on a scope. */
export function scopeKey(
  scope: DocumentOwnerScope | null,
): string {
  return scope
    ? scope.owners.map((o) => `${o.kind}:${o.id}`).join("|")
    : "";
}

/** Do all owners in a scope still verify? Re-checked by the store. */
export function scopeIsValid(
  scope: DocumentOwnerScope | null | undefined,
): scope is DocumentOwnerScope {
  return (
    !!scope &&
    scope.owners.length > 0 &&
    scope.owners.some(
      (o) =>
        o.kind === scope.primary.kind &&
        o.id === scope.primary.id,
    ) &&
    scope.owners.every(verifyOwner)
  );
}

/** Display name of the scope's primary owner (never an identifier). */
export function scopeDisplayName(
  scope: DocumentOwnerScope,
): string {
  if (scope.primary.kind === "youth")
    return (
      resolveYouthConstituent(scope.primary.id)?.name ?? ""
    );
  return findAdmission(scope.primary.id)?.name ?? "";
}