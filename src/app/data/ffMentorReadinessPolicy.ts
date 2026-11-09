// Business rules the Match Readiness Checklist needs but that haven't been
// confirmed (US 20039 Chunk 9). While a rule is null it is unresolved: the
// affected checklist item stays Pending and readiness is blocked. Fill a
// rule in here once the business confirms it — nowhere else.

import type { FFMentorApplication } from "./ffMentorApplication";
import type { FFReferenceAssessment } from "./ffMentorApplication";

export interface FFReadinessPolicy {
  /**
   * With more than one sub-program selected: whether the received
   * references satisfy the requirement (shared vs per-program counting).
   */
  multiProgramReferencesMet:
    | ((
        app: FFMentorApplication,
        refs: FFReferenceAssessment,
      ) => boolean)
    | null;
  /** Whether a driving-record review is required for this application. */
  drivingReviewApplies:
    ((app: FFMentorApplication) => boolean) | null;
}

export const FF_READINESS_POLICY: FFReadinessPolicy = {
  multiProgramReferencesMet: null,
  drivingReviewApplies: null,
};