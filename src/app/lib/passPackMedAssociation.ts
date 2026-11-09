// Pass ↔ Pack Med association (20042) — the ONLY code that writes
// PassRecord.packMedId / PackMedRecord.passId, so the two sides can never
// disagree. Relationship is optional 0..1 ↔ 0..1 and same-youth only.
//
// Every operation is one call to syncLink(), which computes the final state
// for every record it touches (the Pass, its previous Pack Med, the Pack Med,
// and that Pack Med's previous Pass) and then writes Pack Meds and Passes
// once each. Both stores are reactive, so List / Calendar / record views
// update immediately.

import {
  type PassRecord,
  getPassById,
  savePasses,
} from "../data/mockPassData";
import {
  type PackMedRecord,
  getPackMedById,
  savePackMeds,
} from "../data/mockPackMedData";

export type AssociationResult =
  { ok: true } | { ok: false; error: string };

/** Defensive same-youth rule — independent of any UI filtering. */
export function canAssociate(
  pass: Pick<PassRecord, "youthId">,
  packMed: Pick<PackMedRecord, "youthId">,
): boolean {
  return pass.youthId === packMed.youthId;
}

function syncLink(
  passId: number | null,
  packMedId: number | null,
): AssociationResult {
  const pass =
    passId !== null ? getPassById(passId) : undefined;
  const packMed =
    packMedId !== null ? getPackMedById(packMedId) : undefined;
  if (passId !== null && !pass)
    return { ok: false, error: "That Pass no longer exists." };
  if (packMedId !== null && !packMed)
    return {
      ok: false,
      error: "That Pack Med no longer exists.",
    };
  if (pass && packMed && !canAssociate(pass, packMed))
    return {
      ok: false,
      error:
        "A Pass can only be linked to a Pack Med for the same youth.",
    };

  const passUpdates = new Map<number, PassRecord>();
  const packUpdates = new Map<number, PackMedRecord>();
  const setPass = (p: PassRecord, packMedId: number | null) => {
    const cur = passUpdates.get(p.id) ?? p;
    passUpdates.set(p.id, { ...cur, packMedId });
  };
  const setPack = (m: PackMedRecord, passId: number | null) => {
    const cur = packUpdates.get(m.id) ?? m;
    packUpdates.set(m.id, { ...cur, passId });
  };

  // The Pass's previous Pack Med is released.
  if (
    pass &&
    pass.packMedId != null &&
    pass.packMedId !== packMedId
  ) {
    const prev = getPackMedById(pass.packMedId);
    if (prev) setPack(prev, null);
  }
  // The Pack Med's previous Pass is released (conflict: X was on Pass A).
  if (
    packMed &&
    packMed.passId != null &&
    packMed.passId !== passId
  ) {
    const prev = getPassById(packMed.passId);
    if (prev) setPass(prev, null);
  }
  if (pass) setPass(pass, packMed ? packMed.id : null);
  if (packMed) setPack(packMed, pass ? pass.id : null);

  // Two writes, always in the same order; each store notifies once.
  if (packUpdates.size) savePackMeds([...packUpdates.values()]);
  if (passUpdates.size) savePasses([...passUpdates.values()]);
  return { ok: true };
}

/** Pass side: link to a Pack Med (null = unlink). Reassigning releases the
 *  old Pack Med; taking a Pack Med from another Pass releases that Pass. */
export function linkPassToPackMed(
  passId: number,
  packMedId: number | null,
): AssociationResult {
  return syncLink(passId, packMedId);
}

export function unlinkPassFromPackMed(
  passId: number,
): AssociationResult {
  return syncLink(passId, null);
}

/** Pack Med side: link to a Pass (null = unlink), same rules mirrored. */
export function linkPackMedToPass(
  packMedId: number,
  passId: number | null,
): AssociationResult {
  return syncLink(passId, packMedId);
}