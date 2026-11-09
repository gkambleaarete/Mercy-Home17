// C-SSRS Full-Lifetime, Section 1 (Suicidal Ideation) and Section 2
// (Intensity of Ideation) — US 20139. Content, visibility, normalization and
// validation as pure functions, shared by the editing components, the
// read-only components and (in Chunk 4) the save path, so they cannot
// disagree. Behavior and Lethality are not handled here and are always
// preserved untouched.
//
// There is no risk classification, total or sum for Full Lifetime.
//
// Assumption: the "If Yes, Describe" narratives are shown but NOT mandatory;
// the ticket does not make them required. Everything else listed under
// validateIdeationIntensity is required where it applies.

import {
  emptyIdeationItem,
  emptyIntensityItem,
  emptyMostSevereIdeation,
  IDEATION_KEYS,
  INTENSITY_KEYS,
  type FullLifetimeResponses,
  type IdeationKey,
  type IntensityKey,
  type YesNo,
} from "./cssrsTypes";

// ─── Periods ────────────────────────────────────────────────────────────────

/** Ideation periods. Independent: nothing is copied or reconciled. */
export const IDEATION_PERIODS = [
  "lifetime",
  "past1Month",
] as const;
export type IdeationPeriod = (typeof IDEATION_PERIODS)[number];

export const IDEATION_PERIOD_LABEL: Record<
  IdeationPeriod,
  string
> = {
  lifetime: "Lifetime: Time the individual felt most suicidal",
  past1Month: "Past 1 Month",
};
/** Intensity period that corresponds to each ideation period. "Recent" is
 *  the Past 1 Month — there is no other time window. */
export type IntensityPeriod = "lifetime" | "recent";
export const INTENSITY_PERIOD_OF: Record<
  IdeationPeriod,
  IntensityPeriod
> = { lifetime: "lifetime", past1Month: "recent" };
export const INTENSITY_PERIOD_LABEL: Record<
  IntensityPeriod,
  string
> = {
  lifetime: "Lifetime Most Severe Ideation",
  recent: "Recent Most Severe Ideation",
};

// ─── Section 1 content ──────────────────────────────────────────────────────

export interface IdeationQuestion {
  key: IdeationKey;
  /** 1–5; also the ideation "type number". */
  number: number;
  title: string;
  help: string;
  text: string;
}

export const IDEATION_QUESTIONS: readonly IdeationQuestion[] = [
  {
    key: "wishToBeDead",
    number: 1,
    title: "Wish to Be Dead",
    help: "Person endorses thoughts about a wish to be dead or not alive anymore or wish to fall asleep and not wakeup.",
    text: "Have you wished you were dead or wished you could go to sleep and not wake up?",
  },
  {
    key: "nonSpecificActiveThoughts",
    number: 2,
    title: "Non-Specific Active Suicidal Thoughts",
    help: "General non-specific thoughts of wanting to end one’s life/die by suicide (e.g., “I’ve thought about killing myself”) without thoughts of ways to kill oneself/associated methods, intent, or plan during the assessment period.",
    text: "Have you actually had any thoughts of killing yourself?",
  },
  {
    key: "methodsWithoutPlan",
    number: 3,
    title:
      "Active Suicidal Ideation with a Method but No Plan or Intent",
    help: "Person endorses thoughts of suicide and has thought of at least one method during the assessment period. This is different than a specific plan with time, place or method details worked out (e.g., thought of method to kill self but not a specific plan). Includes person who would say, “I thought about taking an overdose but I never made a specific plan as to when, where or how I would actually do it…and I would never go through with it.”",
    text: "Have you been thinking about how you might do this?",
  },
  {
    key: "intentWithoutPlan",
    number: 4,
    title:
      "Active Suicidal Ideation with Some Intent but No Specific Plan",
    help: "Active suicidal thoughts of killing oneself and person reports having some intent to act on such thoughts, as opposed to “I have the thoughts but I definitely will not do anything about them.”",
    text: "Have you had these thoughts and had some intention of acting on them?",
  },
  {
    key: "intentWithPlan",
    number: 5,
    title:
      "Active Suicidal Ideation with a Specific Plan and Intent",
    help: "Thoughts of killing oneself with details of plan fully or partially worked out and person has some intent to carry it out.",
    text: "Have you started to work out or worked out the details of how to kill yourself? Did you intend to carry out this plan?",
  },
];

export const IDEATION_QUESTION_BY_KEY = Object.fromEntries(
  IDEATION_QUESTIONS.map((q) => [q.key, q]),
) as Record<IdeationKey, IdeationQuestion>;

/** Questions that depend on Q2 = Yes (for the same period). */
export const IDEATION_Q2_DEPENDENTS: readonly IdeationKey[] = [
  "methodsWithoutPlan",
  "intentWithoutPlan",
  "intentWithPlan",
];

// ─── Section 2 content ──────────────────────────────────────────────────────

export const INTENSITY_GUIDANCE =
  "The ratings relate to the most severe ideation type identified through Questions 1–5, with 1 being the least severe and 5 being the most severe. Ask about the time the individual felt most suicidal.";

export interface RatingOption {
  value: number;
  label: string;
}
export interface IntensityQuestion {
  key: IntensityKey;
  title: string;
  text: string;
  options: readonly RatingOption[];
}
const opts = (labels: string[], from: number): RatingOption[] =>
  labels.map((label, i) => ({ value: from + i, label }));

export const INTENSITY_QUESTIONS: readonly IntensityQuestion[] =
  [
    {
      key: "frequency",
      title: "Frequency",
      text: "How many times have you had these thoughts?",
      options: opts(
        [
          "Less than once a week",
          "Once a week",
          "Two to five times in a week",
          "Daily or almost daily",
          "Many times each day",
        ],
        1,
      ),
    },
    {
      key: "duration",
      title: "Duration",
      text: "When you have the thoughts, how long do they last?",
      options: opts(
        [
          "Fleeting, lasting a few seconds or minutes",
          "Less than one hour or some of the time",
          "One to four hours or a lot of the time",
          "Four to eight hours or most of the day",
          "More than eight hours or persistent",
        ],
        1,
      ),
    },
    {
      key: "controllability",
      title: "Controllability",
      text: "Could/can you stop thinking about killing yourself or wanting to die if you want to?",
      options: opts(
        [
          "Does not attempt to control thoughts",
          "Easily able to control thoughts",
          "Can control thoughts with little difficulty",
          "Can control thoughts with some difficulty",
          "Can control thoughts with a lot of difficulty",
          "Unable to control thoughts",
        ],
        0,
      ),
    },
    {
      key: "deterrents",
      title: "Deterrents",
      text: "Are there things, anyone or anything, that stopped you from wanting to die or acting on thoughts of suicide?",
      options: opts(
        [
          "Does not apply",
          "Deterrents definitely stopped the individual",
          "Deterrents probably stopped the individual",
          "Uncertain that deterrents stopped the individual",
          "Deterrents most likely did not stop the individual",
          "Deterrents definitely did not stop the individual",
        ],
        0,
      ),
    },
    {
      key: "reasonsForIdeation",
      title: "Reasons for Ideation",
      text: "What sort of reasons did you have for thinking about wanting to die or killing yourself? Was it to end the pain or stop the way you were feeling (in other words you couldn’t go on living with this pain or how you were feeling) or was it to get attention, revenge or a reaction from others? Or both?",
      options: opts(
        [
          "Does not apply",
          "Completely to get attention, revenge, or a reaction from others",
          "Mostly to get attention, revenge, or a reaction from others",
          "Equally to get attention or a reaction and to end or stop the pain",
          "Mostly to end or stop the pain",
          "Completely to end or stop the pain",
        ],
        0,
      ),
    },
  ];

export const INTENSITY_QUESTION_BY_KEY = Object.fromEntries(
  INTENSITY_QUESTIONS.map((q) => [q.key, q]),
) as Record<IntensityKey, IntensityQuestion>;

/** The numeric code and full description, as shown in every option. */
export const ratingOptionText = (o: RatingOption): string =>
  `${o.value} – ${o.label}`;

/** The full text of a saved rating, or null when unanswered / not an option. */
export const ratingText = (
  key: IntensityKey,
  value: number | null,
): string | null => {
  if (value === null) return null;
  const o = INTENSITY_QUESTION_BY_KEY[key].options.find(
    (x) => x.value === value,
  );
  return o ? ratingOptionText(o) : null;
};

export const TYPE_NUMBER_OPTIONS: readonly RatingOption[] =
  IDEATION_QUESTIONS.map((q) => ({
    value: q.number,
    label: `${q.title}`,
  }));

// ─── Reading answers ────────────────────────────────────────────────────────

export const getIdeationAnswer = (
  r: FullLifetimeResponses,
  key: IdeationKey,
  period: IdeationPeriod,
): YesNo => r.ideation[key][period];

export const getIdeationDescription = (
  r: FullLifetimeResponses,
  key: IdeationKey,
  period: IdeationPeriod,
): string =>
  period === "lifetime"
    ? r.ideation[key].lifetimeDescription
    : r.ideation[key].past1MonthDescription;

// ─── Visibility (per period, independent) ──────────────────────────────────

/** Q1 and Q2 always apply; Q3–Q5 only where THAT period's Q2 = Yes. */
export function isIdeationQuestionApplicable(
  r: FullLifetimeResponses,
  key: IdeationKey,
  period: IdeationPeriod,
): boolean {
  return IDEATION_Q2_DEPENDENTS.includes(key)
    ? r.ideation.nonSpecificActiveThoughts[period] === "yes"
    : true;
}

/** Intensity applies to a period when its Q1 OR Q2 is Yes. */
export function isIntensityApplicable(
  r: FullLifetimeResponses,
  period: IdeationPeriod,
): boolean {
  return (
    r.ideation.wishToBeDead[period] === "yes" ||
    r.ideation.nonSpecificActiveThoughts[period] === "yes"
  );
}

/** Section 2 shows whenever either period qualifies. */
export const isIntensitySectionVisible = (
  r: FullLifetimeResponses,
): boolean =>
  IDEATION_PERIODS.some((p) => isIntensityApplicable(r, p));

/** The highest-numbered APPLICABLE question answered Yes in the period, or
 *  null. Used only to check staff's selection, never to make it. */
export function highestEndorsedIdeationType(
  r: FullLifetimeResponses,
  period: IdeationPeriod,
): number | null {
  let highest: number | null = null;
  for (const q of IDEATION_QUESTIONS)
    if (
      isIdeationQuestionApplicable(r, q.key, period) &&
      r.ideation[q.key][period] === "yes"
    )
      highest = q.number;
  return highest;
}

// ─── Normalization ──────────────────────────────────────────────────────────

/** Returns a copy in which everything that does not apply is cleared, per
 *  period (one period never affects the other):
 *   • a description is kept only while its own answer is Yes;
 *   • Q3–Q5 (answers and descriptions) only while that period's Q2 = Yes;
 *   • that period's Most Severe Ideation and five ratings only while Q1 or
 *     Q2 is Yes.
 *  Everything outside Sections 1–2 (Behavior, Lethality, attempts) is
 *  returned untouched. */
export function normalizeIdeationIntensity(
  r: FullLifetimeResponses,
): FullLifetimeResponses {
  const ideation = { ...r.ideation };
  for (const q of IDEATION_QUESTIONS) {
    let item = { ...ideation[q.key] };
    for (const period of IDEATION_PERIODS) {
      const descKey =
        period === "lifetime"
          ? "lifetimeDescription"
          : "past1MonthDescription";
      if (!isIdeationQuestionApplicable(r, q.key, period)) {
        item[period] = "unanswered";
        item[descKey] = "";
      } else if (item[period] !== "yes") {
        item[descKey] = "";
      }
    }
    ideation[q.key] = item;
  }
  const next: FullLifetimeResponses = { ...r, ideation };

  const mostSevereIdeation = { ...r.mostSevereIdeation };
  const intensity = { ...r.intensity };
  for (const period of IDEATION_PERIODS) {
    if (isIntensityApplicable(next, period)) continue;
    const ip = INTENSITY_PERIOD_OF[period];
    mostSevereIdeation[ip] = emptyMostSevereIdeation();
    for (const k of INTENSITY_KEYS)
      intensity[k] = { ...intensity[k], [ip]: null };
  }
  return { ...next, mostSevereIdeation, intensity };
}

/** Sets one ideation answer (clearing what it no longer controls). */
export function setIdeationAnswer(
  r: FullLifetimeResponses,
  key: IdeationKey,
  period: IdeationPeriod,
  answer: YesNo,
): FullLifetimeResponses {
  return normalizeIdeationIntensity({
    ...r,
    ideation: {
      ...r.ideation,
      [key]: { ...r.ideation[key], [period]: answer },
    },
  });
}

export function setIdeationDescription(
  r: FullLifetimeResponses,
  key: IdeationKey,
  period: IdeationPeriod,
  description: string,
): FullLifetimeResponses {
  return normalizeIdeationIntensity({
    ...r,
    ideation: {
      ...r.ideation,
      [key]: {
        ...r.ideation[key],
        [period === "lifetime"
          ? "lifetimeDescription"
          : "past1MonthDescription"]: description,
      },
    },
  });
}

export function setIntensityRating(
  r: FullLifetimeResponses,
  key: IntensityKey,
  period: IntensityPeriod,
  value: number | null,
): FullLifetimeResponses {
  return {
    ...r,
    intensity: {
      ...r.intensity,
      [key]: { ...r.intensity[key], [period]: value },
    },
  };
}

export function setMostSevereIdeation(
  r: FullLifetimeResponses,
  period: IntensityPeriod,
  patch: Partial<{
    typeNumber: number | null;
    description: string;
  }>,
): FullLifetimeResponses {
  return {
    ...r,
    mostSevereIdeation: {
      ...r.mostSevereIdeation,
      [period]: { ...r.mostSevereIdeation[period], ...patch },
    },
  };
}

// ─── Validation ─────────────────────────────────────────────────────────────

/** Error keys: `ideation.<key>.<period>`, `intensity.<period>.typeNumber`
 *  and `intensity.<period>.<key>`. */
export type IdeationIntensityErrors = Record<string, string>;
export const ideationErrorKey = (
  key: IdeationKey,
  period: IdeationPeriod,
) => `ideation.${key}.${period}`;
export const intensityErrorKey = (
  period: IntensityPeriod,
  field: "typeNumber" | IntensityKey,
) => `intensity.${period}.${field}`;

const isInt = (v: number | null): v is number =>
  typeof v === "number" && Number.isInteger(v);

/** Errors for Sections 1–2, in display order. Section-level, ready for the
 *  complete form. Narratives are optional; Behavior and Lethality are not
 *  looked at. Nothing is inferred or auto-corrected. */
export function validateIdeationIntensity(
  r: FullLifetimeResponses,
): IdeationIntensityErrors {
  const errors: IdeationIntensityErrors = {};
  for (const q of IDEATION_QUESTIONS)
    for (const period of IDEATION_PERIODS)
      if (
        isIdeationQuestionApplicable(r, q.key, period) &&
        r.ideation[q.key][period] === "unanswered"
      )
        errors[ideationErrorKey(q.key, period)] =
          "Select Yes or No.";

  for (const period of IDEATION_PERIODS) {
    if (!isIntensityApplicable(r, period)) continue;
    const ip = INTENSITY_PERIOD_OF[period];
    const typeNumber = r.mostSevereIdeation[ip].typeNumber;
    const highest = highestEndorsedIdeationType(r, period);
    const typeKey = intensityErrorKey(ip, "typeNumber");
    if (typeNumber === null)
      errors[typeKey] = "Select the Type Number.";
    else if (
      !isInt(typeNumber) ||
      typeNumber < 1 ||
      typeNumber > 5
    )
      errors[typeKey] =
        "Type Number must be a whole number from 1 to 5.";
    else if (highest !== null && typeNumber !== highest)
      errors[typeKey] =
        `Type Number must match the most severe endorsed question for this period: Question ${highest}. Change it, or correct the Yes answers above.`;
    for (const q of INTENSITY_QUESTIONS) {
      const value = r.intensity[q.key][ip];
      const key = intensityErrorKey(ip, q.key);
      if (value === null) errors[key] = "Select a rating.";
      else if (!q.options.some((o) => o.value === value))
        errors[key] =
          `Rating must be ${q.options[0].value} to ${q.options[q.options.length - 1].value}.`;
    }
  }
  return errors;
}

/** Keys in this section's display order (for focusing the first error). */
export function ideationIntensityErrorOrder(
  r: FullLifetimeResponses,
): string[] {
  const order: string[] = [];
  for (const q of IDEATION_QUESTIONS)
    for (const period of IDEATION_PERIODS)
      order.push(ideationErrorKey(q.key, period));
  for (const period of ["lifetime", "recent"] as const) {
    order.push(intensityErrorKey(period, "typeNumber"));
    for (const q of INTENSITY_QUESTIONS)
      order.push(intensityErrorKey(period, q.key));
  }
  return order;
}

// Re-exported so callers need one import for the section's empty items.
export { emptyIdeationItem, emptyIntensityItem, IDEATION_KEYS };