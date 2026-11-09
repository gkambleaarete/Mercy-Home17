// Read-only option and display sources for Internal Transition Summary →
// Details (US 20101). Everything resolves from the existing prototype data
// by stable ID; nothing here writes to those sources.
//
//   Associated Program: Youth → enrollments (current + ended) → program
//   Community Care Contact: CONSTITUENTS, Individual + "Community Care Staff"
//     role + Active (stored status and end-date status)
//   Youth Primary Contact: the youth's own CONSTITUENTS record (name, phone,
//     email) + the youth's own "Home" address from the youth-keyed address
//     data. There is no "primary" flag on addresses, so Home is used.

import {
  CONSTITUENTS,
  getConstituentStatus,
} from "./mockConstituents";
import { getProgramById } from "./mockProgramsData";
import {
  getYouthAddresses,
  getYouthProgramEnrollments,
} from "./mockYouthProgramData";

export interface IdOption {
  id: number;
  label: string;
}

/** The youth's current and previous program associations, deduped by ID. */
export function youthProgramOptions(
  youthId: string,
): IdOption[] {
  const seen = new Map<number, IdOption>();
  for (const e of getYouthProgramEnrollments()) {
    if (
      String(e.constituentId) !== youthId ||
      seen.has(e.programId)
    )
      continue;
    const p = getProgramById(e.programId);
    if (p) seen.set(p.id, { id: p.id, label: p.name });
  }
  return [...seen.values()].sort((a, b) =>
    a.label.localeCompare(b.label),
  );
}

/** Active Individual constituents with the Community Care Staff role. */
export function communityCareContactOptions(): IdOption[] {
  return CONSTITUENTS.filter(
    (c) =>
      c.type === "Individual" &&
      c.role === "Community Care Staff" &&
      c.status === "Active" &&
      getConstituentStatus(c) === "Active",
  )
    .map((c) => ({ id: c.id, label: c.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** Display name for a saved program ID, even if no longer associated. */
export function programLabel(id: number): string | undefined {
  return getProgramById(id)?.name;
}

/** Display name for a saved constituent ID, even if no longer eligible. */
export function constituentLabel(
  id: number,
): string | undefined {
  return CONSTITUENTS.find((c) => c.id === id)?.name;
}

/** Constituents offered by the Contacts selector: every constituent record
 *  (no role filter is defined for summary contacts). */
export function contactConstituentOptions(): IdOption[] {
  return CONSTITUENTS.map((c) => ({
    id: c.id,
    label: c.name,
  })).sort((a, b) => a.label.localeCompare(b.label));
}

/** Contact values available for a constituent: name, phone and email from
 *  its record; address only where the youth-keyed address data has a Home
 *  address. Missing values are "". */
export function constituentContactInfo(
  id: number,
): YouthPrimaryContact {
  return youthPrimaryContact(String(id));
}

export interface YouthPrimaryContact {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export function youthPrimaryContact(
  youthId: string,
): YouthPrimaryContact {
  const c = CONSTITUENTS.find((x) => String(x.id) === youthId);
  const home = getYouthAddresses(youthId).find(
    (a) => a.label === "Home",
  );
  return {
    name: c?.name ?? "",
    phone: c?.phone ?? "",
    email: c?.email ?? "",
    address: home?.line ?? "",
  };
}