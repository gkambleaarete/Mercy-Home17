// Related IR choices for the C-SSRS Screener (US 20105).
//
// Source: the shared Incident Report records (mockYouthProgramData). A
// report is offered only when
//  • the youth's Constituent ID is VERIFIED (never inferred from a name,
//    program, date or numeric id), and
//  • that Constituent is explicitly on the report (`constituentIds`), and
//  • at least one of the report's EXPLICIT incident types is eligible.
// A report with no `incidentTypes` is unknown and ineligible. The separate
// Admissions incident list is a different, local source with no shared ids,
// so it is not joined here.

import type { IncidentReportRecord } from "../data/mockYouthProgramData";

export const RELATED_IR_ELIGIBLE_TYPES = [
  "Suicide Attempt",
  "Suicidal Ideation",
  "Self-Harm",
] as const;

// The IR create form uses non-breaking hyphens ("Self‑Harm").
const norm = (t: string) =>
  t
    .replace(/[‐-―−]/g, "-")
    .trim()
    .toLowerCase();
const ELIGIBLE = new Set(RELATED_IR_ELIGIBLE_TYPES.map(norm));

export const hasEligibleIncidentType = (
  types: readonly string[] | undefined,
): boolean =>
  !!types && types.some((t) => ELIGIBLE.has(norm(t)));

export interface RelatedIrOption {
  /** The incident report's id, as stored on the assessment. */
  id: string;
  label: string;
}

export function eligibleIncidentReports(
  youthConstituentId: string | null,
  reports: readonly IncidentReportRecord[],
): RelatedIrOption[] {
  if (youthConstituentId === null) return [];
  const cid = Number(youthConstituentId);
  if (!Number.isInteger(cid)) return [];
  return reports
    .filter(
      (r) =>
        r.constituentIds.includes(cid) &&
        hasEligibleIncidentType(r.incidentTypes),
    )
    .sort((a, b) =>
      b.incidentStartDateTime.localeCompare(
        a.incidentStartDateTime,
      ),
    )
    .map((r) => ({
      id: String(r.id),
      label: `IR ${r.id} — ${r.incidentStartDateTime.slice(0, 10)} — ${(r.incidentTypes ?? []).join(", ")}`,
    }));
}

/** Display reference for a saved association. */
export const relatedIrReference = (id: string): string =>
  `IR ${id}`;