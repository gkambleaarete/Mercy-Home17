// Test support only: a complete, valid Full-Lifetime payload built with the
// same helpers the form uses.
import {
  INTENSITY_QUESTIONS,
  setIdeationAnswer,
  setIntensityRating,
  setMostSevereIdeation,
} from "./cssrsFullLifetime";
import {
  setAttemptField,
  setBehaviorAnswer,
  setBehaviorCount,
  setFollowUpAnswer,
} from "./cssrsFullLifetimeBehavior";
import {
  ACTUAL_ATTEMPT_FOLLOW_UP_IDS,
  BEHAVIOR_KEYS,
  emptyFullLifetimeResponses,
  type FullLifetimeResponses,
} from "./cssrsTypes";

/** Lifetime Q1 Yes / Q2 No, Past 1 Month No/No; every behavior No except a
 *  Lifetime Actual Attempt (2 attempts) with all three groups filled. */
export function validFullLifetime(): FullLifetimeResponses {
  let r = emptyFullLifetimeResponses();
  r = setIdeationAnswer(r, "wishToBeDead", "lifetime", "yes");
  r = setIdeationAnswer(
    r,
    "nonSpecificActiveThoughts",
    "lifetime",
    "no",
  );
  r = setIdeationAnswer(r, "wishToBeDead", "past1Month", "no");
  r = setIdeationAnswer(
    r,
    "nonSpecificActiveThoughts",
    "past1Month",
    "no",
  );
  r = setMostSevereIdeation(r, "lifetime", { typeNumber: 1 });
  for (const q of INTENSITY_QUESTIONS)
    r = setIntensityRating(
      r,
      q.key,
      "lifetime",
      q.options[0].value,
    );
  for (const k of BEHAVIOR_KEYS)
    for (const p of ["lifetime", "past3Months"] as const)
      r = setBehaviorAnswer(r, k, p, "no");
  for (const id of ACTUAL_ATTEMPT_FOLLOW_UP_IDS)
    for (const p of ["lifetime", "past3Months"] as const)
      r = setFollowUpAnswer(r, id, p, "no");
  r = setBehaviorAnswer(r, "actualAttempt", "lifetime", "yes");
  r = setBehaviorCount(r, "actualAttempt", "lifetime", 2);
  for (const g of [
    "mostRecent",
    "mostLethal",
    "initial",
  ] as const)
    r = setAttemptField(r, g, {
      date: "2026-01-02",
      actualLethality: 0,
      potentialLethality: 1,
    });
  return r;
}