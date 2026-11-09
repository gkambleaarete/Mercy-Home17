// Canonical Youth identity for profile views (US 20093).
//
// Constituent Youth profiles are keyed by the Constituent ID itself.
// Admissions profiles carry their own ids ("L-…") and an Admissions youth
// key ("Y-…") that is NOT a Constituent ID; they resolve to a Youth
// Constituent only through an explicit `youthConstituentId` on the record.
// Nothing is inferred from names, id suffixes or list positions — an
// unmapped Admissions profile resolves to null and shows no Youth-owned
// Connections or Tutor records.
//
// The only explicit link in the prototype data is the demo Admission
// L-DEMO-20093 → Constituent 1. The production Admissions-to-Constituent
// relationship is still to be confirmed.

import { CONSTITUENTS } from "../data/mockConstituents";
import { ALL_LEADS } from "../data/mockLeadsData";

export interface YouthRef {
  id: string; // Constituent ID
  name: string;
}

export function resolveProfileYouth(
  lead: { id: string | number; youthConstituentId?: number },
  isAdmissionsProfile: boolean,
): YouthRef | null {
  const constituentId = isAdmissionsProfile
    ? lead.youthConstituentId
    : /^\d+$/.test(String(lead.id))
      ? Number(lead.id)
      : undefined;
  if (constituentId === undefined) return null;
  const c = CONSTITUENTS.find(
    (x) => x.id === constituentId && x.role === "Youth",
  );
  return c ? { id: String(c.id), name: c.name } : null;
}

/**
 * Strict owner check for Youth-owned records: the id must be a Constituent
 * ID belonging to an Individual constituent with the Youth role.
 */
export function resolveYouthConstituent(
  id: string,
): YouthRef | null {
  if (!/^\d+$/.test(id)) return null;
  const c = CONSTITUENTS.find(
    (x) =>
      x.id === Number(id) &&
      x.type === "Individual" &&
      x.role === "Youth",
  );
  return c ? { id: String(c.id), name: c.name } : null;
}
// ─── Full Profile links from Projections & Waitlist quick edit (US 17573) ──
// Admissions candidate ids are Admissions case (lead) ids; enrollment ids
// ("ENR-…") are neither lead nor Constituent ids. A link is returned only
// for a record that really exists — never from a name or a made-up id.

export interface FullProfileLink {
  path: string;
  /** Which record the link opens. */
  target: "Admissions profile" | "Constituent profile";
}

const admissionsProfilePath = (leadId: string) =>
  `/?leadId=${encodeURIComponent(leadId)}`;

/** Waitlist candidate → its Admissions profile, when the case exists.
 *  Seed-only candidates (e.g. W-101/W-102) have no full record → null. */
export function getCandidateFullProfile(
  candidateId: string,
): FullProfileLink | null {
  return ALL_LEADS.some((l) => l.id === candidateId)
    ? {
        path: admissionsProfilePath(candidateId),
        target: "Admissions profile",
      }
    : null;
}

/** Resident (Program Enrollment) → its Youth Constituent when explicitly
 *  linked and valid, else the Admissions case it was enrolled from, else
 *  null (the prototype's seed enrollments have no other relationship). */
export function getResidentFullProfile(e: {
  leadId?: string;
  constituentId?: number;
}): FullProfileLink | null {
  if (e.constituentId != null) {
    const youth = resolveYouthConstituent(String(e.constituentId));
    if (youth)
      return {
        path: `/constituents/${youth.id}`,
        target: "Constituent profile",
      };
  }
  if (e.leadId && ALL_LEADS.some((l) => l.id === e.leadId))
    return {
      path: admissionsProfilePath(e.leadId),
      target: "Admissions profile",
    };
  return null;
}