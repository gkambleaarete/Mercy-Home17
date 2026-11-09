// C-SSRS Full-Lifetime: the four sections composed. One normalization and one
// validation, used by the form, the save service and the store mutation
// boundary, so a caller cannot save an incomplete or inconsistent payload by
// bypassing the UI. Ideation/Intensity behavior is unchanged
// (cssrsFullLifetime.ts); Behavior/Attempts are in cssrsFullLifetimeBehavior.ts.
// No risk classification, total or sum exists for Full Lifetime, and the
// mandatory assessment trigger is NOT implemented here.

import {
  ideationIntensityErrorOrder,
  normalizeIdeationIntensity,
  validateIdeationIntensity,
} from "./cssrsFullLifetime";
import {
  behaviorAttemptErrorOrder,
  normalizeBehaviorAttempts,
  validateBehaviorAttempts,
} from "./cssrsFullLifetimeBehavior";
import type { FullLifetimeResponses } from "./cssrsTypes";

export const FULL_LIFETIME_SUMMARY =
  "C-SSRS Full-Lifetime completed";

export const normalizeFullLifetime = (
  r: FullLifetimeResponses,
): FullLifetimeResponses =>
  normalizeBehaviorAttempts(normalizeIdeationIntensity(r));

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const validIso = (s: string) => {
  if (!ISO.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
};

/** Errors across all four sections plus the assessment date. Keys are
 *  "assessmentDate", "ideation.…", "intensity.…", "behavior.…",
 *  "attempts.…". Validates the NORMALIZED payload. */
export function validateFullLifetime(input: {
  assessmentDate: string;
  responses: FullLifetimeResponses;
}): Record<string, string> {
  const r = normalizeFullLifetime(input.responses);
  return {
    ...(validIso(input.assessmentDate)
      ? {}
      : { assessmentDate: "Enter a valid assessment date." }),
    ...validateIdeationIntensity(r),
    ...validateBehaviorAttempts(r),
  };
}

/** Focus order: date, Sections 1–2, then Sections 3–4. */
export function fullLifetimeErrorOrder(
  r: FullLifetimeResponses,
): string[] {
  return [
    "assessmentDate",
    ...ideationIntensityErrorOrder(r),
    ...behaviorAttemptErrorOrder(r),
  ];
}