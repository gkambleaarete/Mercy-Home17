import { Alert } from "../ui/alert";
import type { FullLifetimeResponses } from "../../data/cssrsTypes";
import { fullLifetimeFocusId } from "./CssrsFullLifetimeSections";
import {
  FullLifetimeIdeationIntensityDetails,
  FullLifetimeIdeationSection,
  FullLifetimeIntensitySection,
} from "./CssrsFullLifetimeSections";
import {
  actualAttemptQuestionId,
  attemptId,
  behaviorId,
  FullLifetimeAttemptDetailsSection,
  FullLifetimeBehaviorAttemptDetails,
  FullLifetimeBehaviorSection,
} from "./CssrsFullLifetimeBehaviorSections";
import type {
  AttemptKey,
  BehaviorKey,
} from "../../data/cssrsTypes";
import type { ActualAttemptQuestionId } from "../../data/cssrsFullLifetimeBehavior";

// C-SSRS Full-Lifetime form body (US 20139): all four sections, rendered
// inside the existing Standardized Test dialog below its Date / Test row.
// It holds no saved data: the parent owns the editing draft and the store
// owns the record.

export const CSSRS_FULL_LIFETIME_TEST = "C-SSRS Full-Lifetime";

/** Id of the control to focus for any Full Lifetime error key. */
export function fullLifetimeFieldFocusId(
  idPrefix: string,
  errorKey: string,
): string | null {
  if (errorKey === "assessmentDate") return "test-date";
  const [section, a, b, c] = errorKey.split(".");
  // Actual Attempt questions 2–9: actualAttempt.<questionId>.<period>
  if (section === "actualAttempt")
    return `${actualAttemptQuestionId(idPrefix, a as ActualAttemptQuestionId, b as "lifetime")}-yes`;
  if (section === "behavior")
    return c === "count"
      ? `${behaviorId(idPrefix, a as BehaviorKey, b as "lifetime")}-count`
      : `${behaviorId(idPrefix, a as BehaviorKey, b as "lifetime")}-yes`;
  if (section === "attempts")
    return attemptId(
      idPrefix,
      a as AttemptKey,
      b === "date"
        ? "date"
        : b === "actualLethality"
          ? "actual"
          : "potential",
    );
  return fullLifetimeFocusId(idPrefix, errorKey);
}

export function CssrsFullLifetimeFields({
  idPrefix,
  responses,
  onResponsesChange,
  errors,
  saveError,
}: {
  idPrefix: string;
  responses: FullLifetimeResponses;
  onResponsesChange: (next: FullLifetimeResponses) => void;
  errors: Record<string, string>;
  saveError: string | null;
}) {
  return (
    <div
      className="space-y-8"
      data-testid="cssrs-full-lifetime-fields"
    >
      {saveError && <Alert variant="error">{saveError}</Alert>}
      <FullLifetimeIdeationSection
        idPrefix={idPrefix}
        responses={responses}
        onChange={onResponsesChange}
        errors={errors}
      />
      <FullLifetimeIntensitySection
        idPrefix={idPrefix}
        responses={responses}
        onChange={onResponsesChange}
        errors={errors}
      />
      <FullLifetimeBehaviorSection
        idPrefix={idPrefix}
        responses={responses}
        onChange={onResponsesChange}
        errors={errors}
      />
      <FullLifetimeAttemptDetailsSection
        idPrefix={idPrefix}
        responses={responses}
        onChange={onResponsesChange}
        errors={errors}
      />
    </div>
  );
}

/** Read-only details for a saved assessment (all four sections). */
export function CssrsFullLifetimeDetails({
  responses,
}: {
  responses: FullLifetimeResponses;
}) {
  return (
    <div
      className="space-y-8"
      data-testid="cssrs-full-lifetime-details"
    >
      <FullLifetimeIdeationIntensityDetails
        responses={responses}
      />
      <FullLifetimeBehaviorAttemptDetails
        responses={responses}
      />
    </div>
  );
}