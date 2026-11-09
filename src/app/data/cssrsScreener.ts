// C-SSRS Screener rules (US 20105): question wording and order, the
// conditional flow, validation, and per-answer response classifications.
// Pure functions only — the form, the read-only details and the save
// boundary all use these, so they cannot disagree.
//
// There is deliberately NO overall risk calculation: the rule for combining
// the responses has not been confirmed. Each answer is classified on its
// own and a classification never overwrites another question's.

import {
  emptyYesNoItem,
  type ScreenerItemKey,
  type ScreenerResponses,
  type YesNo,
} from "./cssrsTypes";

/** Every answerable Screener question. The Q6 follow-up is stored as
 *  `behaviorPast3Months`, the other six as `items[key].answer`. */
export type ScreenerQuestionKey =
  ScreenerItemKey | "behaviorPast3Months";

export interface ScreenerQuestion {
  key: ScreenerQuestionKey;
  /** Printed number: "1"–"6"; the follow-up has none. */
  number: string | null;
  text: string;
  help?: string;
}

export const SCREENER_QUESTIONS: Record<
  ScreenerQuestionKey,
  ScreenerQuestion
> = {
  wishToBeDead: {
    key: "wishToBeDead",
    number: "1",
    text: "Have you wished you were dead or wished you could go to sleep and not wake up?",
  },
  suicidalThoughts: {
    key: "suicidalThoughts",
    number: "2",
    text: "Have you actually had any thoughts of killing yourself?",
  },
  method: {
    key: "method",
    number: "3",
    text: "Have you been thinking about how you might do this?",
    help: "“I thought about taking an overdose but I never made a specific plan as to when, where or how I would actually do it...and I would never go through with it.”",
  },
  intent: {
    key: "intent",
    number: "4",
    text: "Have you had these thoughts and had some intention of acting on them?",
    help: "As opposed to “I have the thoughts but I definitely will not do anything about them.”",
  },
  plan: {
    key: "plan",
    number: "5",
    text: "Have you started to work out or worked out the details of how to kill yourself? Did you intend to carry out this plan?",
  },
  behavior: {
    key: "behavior",
    number: "6",
    text: "Have you ever done anything, started to do anything, or prepared to do anything to end your life?",
    help: "Examples: Took pills, tried to shoot yourself, cut yourself, or hang yourself, took out pills but didn’t swallow any, held a gun but changed your mind or it was grabbed from your hand, went to the roof but didn’t jump, collected pills, obtained a gun, gave away valuables, wrote a will or suicide note, etc.",
  },
  behaviorPast3Months: {
    key: "behaviorPast3Months",
    number: null,
    text: "Was this within the past three months?",
  },
};

/** Questions that depend on Q2 = Yes. */
export const SCREENER_Q2_DEPENDENTS: readonly ScreenerItemKey[] =
  ["method", "intent", "plan"];

// ─── Answers ────────────────────────────────────────────────────────────────

export function getScreenerAnswer(
  r: ScreenerResponses,
  key: ScreenerQuestionKey,
): YesNo {
  return key === "behaviorPast3Months"
    ? r.behaviorPast3Months
    : r.items[key].answer;
}

// ─── Conditional flow ───────────────────────────────────────────────────────

/** The questions that apply, in display order: Q1, Q2, then Q3–Q5 only when
 *  Q2 = Yes, then Q6 and — only when Q6 = Yes — its follow-up. */
export function activeScreenerQuestions(
  r: ScreenerResponses,
): ScreenerQuestionKey[] {
  const keys: ScreenerQuestionKey[] = [
    "wishToBeDead",
    "suicidalThoughts",
  ];
  if (r.items.suicidalThoughts.answer === "yes")
    keys.push(...SCREENER_Q2_DEPENDENTS);
  keys.push("behavior");
  if (r.items.behavior.answer === "yes")
    keys.push("behaviorPast3Months");
  return keys;
}

/** Returns a copy in which every question that does not apply is back to
 *  unanswered. Hidden answers are never kept, whoever calls. */
export function normalizeScreenerResponses(
  r: ScreenerResponses,
): ScreenerResponses {
  const items = { ...r.items };
  if (items.suicidalThoughts.answer !== "yes")
    for (const k of SCREENER_Q2_DEPENDENTS)
      items[k] = emptyYesNoItem();
  return {
    ...r,
    items,
    behaviorPast3Months:
      items.behavior.answer === "yes"
        ? r.behaviorPast3Months
        : "unanswered",
  };
}

/** Sets one answer and clears whatever it no longer controls. */
export function setScreenerAnswer(
  r: ScreenerResponses,
  key: ScreenerQuestionKey,
  answer: YesNo,
): ScreenerResponses {
  if (key === "behaviorPast3Months")
    return normalizeScreenerResponses({
      ...r,
      behaviorPast3Months: answer,
    });
  return normalizeScreenerResponses({
    ...r,
    items: { ...r.items, [key]: { ...r.items[key], answer } },
  });
}

// ─── Classification (per answer only) ───────────────────────────────────────

export type RiskClassification =
  "No Risk" | "Low Risk" | "Moderate Risk" | "High Risk";

const YES_CLASSIFICATION: Record<
  ScreenerQuestionKey,
  Exclude<RiskClassification, "No Risk">
> = {
  wishToBeDead: "Low Risk",
  suicidalThoughts: "Low Risk",
  method: "Moderate Risk",
  intent: "High Risk",
  plan: "High Risk",
  behavior: "Moderate Risk",
  behaviorPast3Months: "High Risk",
};

/** The classification of ONE answer. Unanswered has none. */
export function classifyScreenerAnswer(
  key: ScreenerQuestionKey,
  answer: YesNo,
): RiskClassification | null {
  if (answer === "yes") return YES_CLASSIFICATION[key];
  if (answer === "no") return "No Risk";
  return null;
}

/** Classification of a question within a response set; skipped (hidden)
 *  questions get none. */
export function classifyScreenerQuestion(
  r: ScreenerResponses,
  key: ScreenerQuestionKey,
): RiskClassification | null {
  return activeScreenerQuestions(r).includes(key)
    ? classifyScreenerAnswer(key, getScreenerAnswer(r, key))
    : null;
}

/** Factual table summary. Never an aggregate clinical result. */
export const SCREENER_SUMMARY = "C-SSRS Screener completed";

// ─── Validation ─────────────────────────────────────────────────────────────

export type ScreenerErrorKey =
  | "assessmentDate"
  | ScreenerQuestionKey
  | "relatedIncidentReportId";
export type ScreenerErrors = Partial<
  Record<ScreenerErrorKey, string>
>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const validIso = (s: string) => {
  if (!ISO_DATE.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
};

/** Errors in focus order (date, applicable questions top to bottom, then
 *  Related IR). Skipped questions are never required. A selected Related IR
 *  must be one of `eligibleIncidentReportIds`. */
export function validateScreener(input: {
  assessmentDate: string;
  responses: ScreenerResponses;
  eligibleIncidentReportIds: readonly string[];
}): ScreenerErrors {
  const errors: ScreenerErrors = {};
  if (!validIso(input.assessmentDate))
    errors.assessmentDate = "Enter a valid assessment date.";
  for (const key of activeScreenerQuestions(input.responses))
    if (
      getScreenerAnswer(input.responses, key) === "unanswered"
    )
      errors[key] = "Select Yes or No.";
  const ir = input.responses.relatedIncidentReportId;
  if (
    ir !== null &&
    !input.eligibleIncidentReportIds.includes(ir)
  )
    errors.relatedIncidentReportId =
      "This incident report is not available for this youth. Select another or clear it.";
  return errors;
}

/** The first invalid field, in focus order. */
export function firstScreenerErrorKey(
  errors: ScreenerErrors,
  responses: ScreenerResponses,
): ScreenerErrorKey | null {
  const order: ScreenerErrorKey[] = [
    "assessmentDate",
    ...activeScreenerQuestions(responses),
    "relatedIncidentReportId",
  ];
  return order.find((k) => errors[k]) ?? null;
}