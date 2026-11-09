// Ownership of a new C-SSRS assessment (US 20105 / US 20139), taken from the
// profile being viewed. Nothing is inferred from names, id suffixes, list
// positions or a matching program.
//
//  • admissionsRecordId: the Admissions record's own id, and only when the
//    profile IS an Admissions record. A Constituent profile id is never an
//    Admissions record id, so there it is null and the assessment cannot be
//    created from that profile.
//  • youthKey: the existing Testing youth key, so visibility and document
//    links stay youth-based.
//  • youthConstituentId: the verified Youth Constituent (resolveProfileYouth)
//    or null — an Admissions record without a verified link still owns its
//    assessment.

import type { CssrsOwnership } from "../data/cssrsAssessmentStore";
import { testingYouthKey } from "../data/youthTestingAssessmentStore";
import { resolveProfileYouth } from "./youthIdentity";

export function resolveCssrsOwnership(
  lead: {
    id: string | number;
    youthId?: string;
    youthConstituentId?: number;
  },
  isAdmissionsModule: boolean,
): Omit<CssrsOwnership, "admissionsRecordId"> & {
  admissionsRecordId: string | null;
} {
  return {
    admissionsRecordId: isAdmissionsModule
      ? String(lead.id)
      : null,
    youthKey: testingYouthKey(lead),
    youthConstituentId:
      resolveProfileYouth(lead, isAdmissionsModule)?.id ?? null,
  };
}