// C-SSRS Full-Lifetime, Section 3 (Suicidal Behavior) and Section 4 (Attempt
// Details and Lethality) — US 20139. Content, normalization and validation
// as pure functions, shared by the editing components, the read-only
// components and the save boundary. Sections 1–2 live in cssrsFullLifetime.ts
// and are never touched here.
//
// Assumptions (prototype):
//  • "If Yes, Describe" narratives are optional (as in Sections 1–2).
//  • Counts: for Actual / Interrupted / Aborted / Preparatory, Yes requires a
//    positive WHOLE number. No saves 0 (and clears the description);
//    unanswered stays null (never 0). Negative, fractional or non-numeric
//    entries are rejected, never rounded or coerced.
//  • Non-suicidal self-injury is Yes/No only (no description or count) and
//    never triggers Section 4.
//  • Section 4 applies when Actual Attempt = Yes in EITHER period and nothing
//    else. When it applies, the date and Actual Lethality code are required in
//    all three groups (prototype completion rule). Potential Lethality is
//    required only when that group's Actual Lethality is 0. The same event may
//    fill several groups; nothing decides which attempt was most lethal.
//  • Nothing is inferred from narrative text or from another response.
//  • Actual Attempt asks nine questions. Question 1 is the explicit Actual
//    Attempt response (behavior.actualAttempt) and alone drives Section 4 and
//    the totals; Questions 2–9 are independent Yes/No + description pairs per
//    period (actualAttemptQuestions), keyed by stable ids. A Yes count is
//    never derived from how many questions were answered Yes.
//  • "What did you do?" is asked as Yes/No like the other eight, as requested
//    (BA clarification: its wording reads as a narrative prompt).

import {
  ACTUAL_ATTEMPT_FOLLOW_UP_IDS,
  ATTEMPT_KEYS,
  BEHAVIOR_KEYS,
  emptyAttemptDetails,
  type ActualAttemptFollowUp,
  type ActualAttemptFollowUpId,
  type AttemptKey,
  type BehaviorKey,
  type FullLifetimeResponses,
  type Rating,
  type YesNo,
} from "./cssrsTypes";
import type { RatingOption } from "./cssrsFullLifetime";

// ─── Section 3 content ──────────────────────────────────────────────────────

export const BEHAVIOR_PERIODS = [
  "lifetime",
  "past3Months",
] as const;
export type BehaviorPeriod = (typeof BEHAVIOR_PERIODS)[number];
export const BEHAVIOR_PERIOD_LABEL: Record<
  BehaviorPeriod,
  string
> = {
  lifetime: "Lifetime",
  past3Months: "Past 3 Months",
};

export const BEHAVIOR_GUIDANCE =
  "Check all that apply, so long as these are separate events; must ask about all types.";

export const ACTUAL_ATTEMPT_DEFINITION = [
  "A potentially self-injurious act undertaken with at least some wish to die, as a result of act. Behavior was in part thought of as method to kill oneself. Intent does not have to be 100%. If there is any intent/desire to die associated with the act, then it can be considered an actual suicide attempt. There does not have to be any injury or harm, just the potential for injury or harm. If person pulls trigger while gun is in mouth but gun is broken so no injury results, this is considered an attempt.",
  "Inferring Intent: Even if an individual denies intent/wish to die, it may be inferred clinically from the behavior or circumstances. For example, a highly lethal act that is clearly not an accident so no other intent but suicide can be inferred (e.g., gunshot to head, jumping from window of a high floor/story). Also, if someone denies intent to die, but they thought that what they did could be lethal, intent may be inferred.",
];

/** Question 1's id. It is stored as behavior.actualAttempt, not under
 *  actualAttemptQuestions. */
export const ACTUAL_ATTEMPT_PRIMARY_ID = "madeAttempt" as const;
export type ActualAttemptQuestionId =
  typeof ACTUAL_ATTEMPT_PRIMARY_ID | ActualAttemptFollowUpId;

/** The nine Actual Attempt questions, in display order. */
export const ACTUAL_ATTEMPT_QUESTIONS: ReadonlyArray<{
  id: ActualAttemptQuestionId;
  text: string;
}> = [
  {
    id: "madeAttempt",
    text: "Have you made a suicide attempt?",
  },
  {
    id: "harmYourself",
    text: "Have you done anything to harm yourself?",
  },
  {
    id: "dangerousCouldHaveDied",
    text: "Have you done anything dangerous where you could have died?",
  },
  { id: "whatDidYouDo", text: "What did you do?" },
  {
    id: "didAsWayToEndLife",
    text: "Did you______ as a way to end your life?",
  },
  {
    id: "wantedToDie",
    text: "Did you want to die (even a little) when you_____?",
  },
  {
    id: "tryingToEndLife",
    text: "Were you trying to end your life when you _____?",
  },
  {
    id: "thoughtCouldHaveDied",
    text: "Or Did you think it was possible you could have died from_____?",
  },
  {
    id: "otherReasons",
    text: "Or did you do it purely for other reasons / without ANY intention of killing yourself (like to relieve stress, feel better, get sympathy, or get something else to happen)?",
  },
];

export interface BehaviorQuestion {
  key: BehaviorKey;
  title: string;
  /** Question text (for Actual Attempt: the staff decision label). */
  text: string;
  help?: string;
  /** Label of the count field; absent when the category has no count. */
  countLabel?: string;
  /** Has "If Yes, Describe". */
  described: boolean;
}

export const BEHAVIOR_QUESTIONS: readonly BehaviorQuestion[] = [
  {
    key: "actualAttempt",
    title: "Actual Attempt",
    text: "Has the individual made an actual suicide attempt?",
    countLabel: "Total Number of Attempts",
    described: true,
  },
  {
    key: "nonSuicidalSelfInjury",
    title: "Non-Suicidal Self-Injurious Behavior",
    text: "Has the individual engaged in non-suicidal self-injurious behavior?",
    described: false,
  },
  {
    key: "interruptedAttempt",
    title: "Interrupted Attempt",
    text: "Has there been a time when you started to do something to end your life but someone or something stopped you before you actually did anything?",
    help: "When person is interrupted (by an outside circumstance) from starting the potentially self-injurious act (if not for that, actual attempt would have occurred). Overdose: Person has pills in hand but is stopped from ingesting. Once they ingest any pills, this becomes an attempt rather than an interrupted attempt. Shooting: Person has gun pointed toward self, gun is taken away by someone else, or is somehow prevented from pulling trigger. Once they pull the trigger, even if the gun fails to fire, it is an attempt. Jumping: Person is poised to jump, is grabbed and taken down from ledge. Hanging: Person has noose around neck but has not yet started to hang, and is stopped from doing so.",
    countLabel: "Total Number of Interrupted Attempts",
    described: true,
  },
  {
    key: "abortedAttempt",
    title: "Aborted or Self-Interrupted Attempt",
    text: "Has there been a time when you started to do something to try to end your life but you stopped yourself before you actually did anything?",
    help: "When person begins to take steps toward making a suicide attempt but stops themselves before they actually have engaged in any self-destructive behavior. Examples are similar to interrupted attempts, except that the individual stops themselves, instead of being stopped by something else.",
    countLabel:
      "Total Number of Aborted or Self-Interrupted Attempts",
    described: true,
  },
  {
    key: "preparatoryActs",
    title: "Preparatory Acts or Behavior",
    text: "Have you taken any steps towards making a suicide attempt or preparing to kill yourself, such as collecting pills, getting a gun, giving valuables away, or writing a suicide note?",
    help: "Acts or preparation towards imminently making a suicide attempt. This can include anything beyond a verbalization or thought, such as assembling a specific method (e.g., buying pills, purchasing a gun) or preparing for one’s death by suicide (e.g., giving things away, writing a suicide note).",
    countLabel: "Total Number of Preparatory Acts",
    described: true,
  },
];
export const BEHAVIOR_QUESTION_BY_KEY = Object.fromEntries(
  BEHAVIOR_QUESTIONS.map((q) => [q.key, q]),
) as Record<BehaviorKey, BehaviorQuestion>;

// ─── Section 4 content ──────────────────────────────────────────────────────

export const ATTEMPT_GROUPS: ReadonlyArray<{
  key: AttemptKey;
  label: string;
}> = [
  { key: "mostRecent", label: "Most Recent Attempt" },
  { key: "mostLethal", label: "Most Lethal Attempt" },
  { key: "initial", label: "Initial/First Attempt" },
];

export const ACTUAL_LETHALITY_OPTIONS: readonly RatingOption[] =
  [
    {
      value: 0,
      label:
        "No physical damage or very minor physical damage.",
    },
    {
      value: 1,
      label:
        "Minor physical damage, e.g., lethargic speech, first-degree burns, mild bleeding, sprains.",
    },
    {
      value: 2,
      label:
        "Moderate physical damage requiring medical attention, e.g., conscious but sleepy, somewhat responsive, second-degree burns, bleeding of major vessel.",
    },
    {
      value: 3,
      label:
        "Moderately severe physical damage requiring hospitalization and likely intensive care, e.g., comatose with reflexes intact, third-degree burns less than 20% of body, extensive blood loss but can recover, major fractures.",
    },
    {
      value: 4,
      label:
        "Severe physical damage requiring hospitalization with intensive care, e.g., comatose without reflexes, third-degree burns over 20% of body, extensive blood loss with unstable vital signs, major damage to a vital area.",
    },
    { value: 5, label: "Death." },
  ];

export const POTENTIAL_LETHALITY_HELP =
  "Likely lethality of actual attempt if no medical damage. Examples of behavior with no actual medical damage but potential for very serious lethality include putting a gun in the mouth and pulling the trigger when the gun fails to fire, or lying on train tracks with an oncoming train but being pulled away before being run over.";

export const POTENTIAL_LETHALITY_OPTIONS: readonly RatingOption[] =
  [
    {
      value: 0,
      label: "Behavior not likely to result in injury.",
    },
    {
      value: 1,
      label:
        "Behavior likely to result in injury but not likely to cause death.",
    },
    {
      value: 2,
      label:
        "Behavior likely to result in death despite available medical care.",
    },
  ];

const optionText = (
  options: readonly RatingOption[],
  v: Rating,
) => {
  const o = options.find((x) => x.value === v);
  return o ? `${o.value} – ${o.label}` : null;
};
export const actualLethalityText = (v: Rating) =>
  optionText(ACTUAL_LETHALITY_OPTIONS, v);
export const potentialLethalityText = (v: Rating) =>
  optionText(POTENTIAL_LETHALITY_OPTIONS, v);

// ─── Reading ────────────────────────────────────────────────────────────────

export const getBehaviorAnswer = (
  r: FullLifetimeResponses,
  key: BehaviorKey,
  period: BehaviorPeriod,
): YesNo => r.behavior[key][period];
export const getBehaviorDescription = (
  r: FullLifetimeResponses,
  key: BehaviorKey,
  period: BehaviorPeriod,
): string =>
  period === "lifetime"
    ? r.behavior[key].lifetimeDescription
    : r.behavior[key].past3MonthsDescription;
export const getBehaviorCount = (
  r: FullLifetimeResponses,
  key: BehaviorKey,
  period: BehaviorPeriod,
): Rating =>
  period === "lifetime"
    ? r.behavior[key].lifetimeCount
    : r.behavior[key].past3MonthsCount;

/** Answer / description for any of the nine Actual Attempt questions.
 *  Question 1 reads the explicit Actual Attempt response. A version 1
 *  record has no Questions 2–9: they read as not captured. */
export const getActualAttemptAnswer = (
  r: FullLifetimeResponses,
  id: ActualAttemptQuestionId,
  period: BehaviorPeriod,
): YesNo =>
  id === ACTUAL_ATTEMPT_PRIMARY_ID
    ? r.behavior.actualAttempt[period]
    : (r.actualAttemptQuestions?.[id]?.[period] ??
      "unanswered");
export const getActualAttemptDescription = (
  r: FullLifetimeResponses,
  id: ActualAttemptQuestionId,
  period: BehaviorPeriod,
): string =>
  id === ACTUAL_ATTEMPT_PRIMARY_ID
    ? getBehaviorDescription(r, "actualAttempt", period)
    : (r.actualAttemptQuestions?.[id]?.[
        period === "lifetime"
          ? "lifetimeDescription"
          : "past3MonthsDescription"
      ] ?? "");
/** True when this record never captured Questions 2–9 (legacy). */
export const lacksActualAttemptQuestions = (
  r: FullLifetimeResponses,
): boolean => !r.actualAttemptQuestions;

const descField = (p: BehaviorPeriod) =>
  p === "lifetime"
    ? "lifetimeDescription"
    : "past3MonthsDescription";
const countField = (p: BehaviorPeriod) =>
  p === "lifetime" ? "lifetimeCount" : "past3MonthsCount";

/** Section 4 applies when Actual Attempt = Yes in either period. Interrupted,
 *  aborted, preparatory and non-suicidal self-injury never trigger it. */
export const isAttemptDetailsApplicable = (
  r: FullLifetimeResponses,
): boolean =>
  BEHAVIOR_PERIODS.some(
    (p) => r.behavior.actualAttempt[p] === "yes",
  );

/** A positive whole number (not a fraction, zero, negative or NaN). */
export const isPositiveWholeNumber = (v: Rating): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= 1;

/** Parses count text: whole digits only → number; empty → null. Anything
 *  else (letters, "1.5", "-2") is invalid and returns "invalid". */
export function parseCountText(
  text: string,
): Rating | "invalid" {
  const t = text.trim();
  if (t === "") return null;
  return /^\d+$/.test(t) ? Number(t) : "invalid";
}

// ─── Normalization ──────────────────────────────────────────────────────────

/** Returns a copy in which, per period and category:
 *   • a description is kept only while its own answer is Yes;
 *   • counted categories: No → count 0, unanswered → count null (Yes keeps
 *     whatever was entered, to be validated);
 *   • non-suicidal self-injury never carries a description or count.
 *  Then, when no period has Actual Attempt = Yes, all three attempt groups
 *  are reset; while one still does, they are kept. Potential Lethality is
 *  kept only while that group's Actual Lethality is 0. Sections 1–2 are
 *  returned untouched. */
export function normalizeBehaviorAttempts(
  r: FullLifetimeResponses,
): FullLifetimeResponses {
  const behavior = { ...r.behavior };
  for (const key of BEHAVIOR_KEYS) {
    const q = BEHAVIOR_QUESTION_BY_KEY[key];
    const item = { ...behavior[key] };
    for (const p of BEHAVIOR_PERIODS) {
      const answer = item[p];
      if (!q.described || answer !== "yes")
        item[descField(p)] = "";
      if (!q.countLabel) item[countField(p)] = null;
      else if (answer === "no") item[countField(p)] = 0;
      else if (answer === "unanswered")
        item[countField(p)] = null;
    }
    behavior[key] = item;
  }
  let actualAttemptQuestions = r.actualAttemptQuestions;
  if (actualAttemptQuestions) {
    const q = { ...actualAttemptQuestions };
    for (const id of ACTUAL_ATTEMPT_FOLLOW_UP_IDS) {
      const item = { ...q[id] };
      // A description lives only while its own answer is Yes.
      if (item.lifetime !== "yes")
        item.lifetimeDescription = "";
      if (item.past3Months !== "yes")
        item.past3MonthsDescription = "";
      q[id] = item;
    }
    actualAttemptQuestions = q;
  }
  const next = {
    ...r,
    behavior,
    ...(actualAttemptQuestions
      ? { actualAttemptQuestions }
      : {}),
  };
  const attempts = { ...r.attempts };
  for (const key of ATTEMPT_KEYS) {
    attempts[key] = isAttemptDetailsApplicable(next)
      ? {
          ...attempts[key],
          description: "",
          potentialLethality:
            attempts[key].actualLethality === 0
              ? attempts[key].potentialLethality
              : null,
        }
      : emptyAttemptDetails();
  }
  return { ...next, attempts };
}

export function setBehaviorAnswer(
  r: FullLifetimeResponses,
  key: BehaviorKey,
  period: BehaviorPeriod,
  answer: YesNo,
): FullLifetimeResponses {
  const prev = r.behavior[key];
  const item = { ...prev, [period]: answer };
  // Moving to Yes starts a fresh count (a previous No left 0, which is not
  // a valid Yes count).
  if (answer === "yes" && prev[period] !== "yes")
    item[countField(period)] = null;
  return normalizeBehaviorAttempts({
    ...r,
    behavior: { ...r.behavior, [key]: item },
  });
}
export function setBehaviorDescription(
  r: FullLifetimeResponses,
  key: BehaviorKey,
  period: BehaviorPeriod,
  description: string,
): FullLifetimeResponses {
  return normalizeBehaviorAttempts({
    ...r,
    behavior: {
      ...r.behavior,
      [key]: {
        ...r.behavior[key],
        [descField(period)]: description,
      },
    },
  });
}
/** Sets one of Questions 2–9 for one period; nothing else changes. */
export function setFollowUpAnswer(
  r: FullLifetimeResponses,
  id: ActualAttemptFollowUpId,
  period: BehaviorPeriod,
  answer: YesNo,
): FullLifetimeResponses {
  const prev = r.actualAttemptQuestions?.[id];
  if (!prev) return r;
  return normalizeBehaviorAttempts({
    ...r,
    actualAttemptQuestions: {
      ...r.actualAttemptQuestions!,
      [id]: { ...prev, [period]: answer },
    },
  });
}
export function setFollowUpDescription(
  r: FullLifetimeResponses,
  id: ActualAttemptFollowUpId,
  period: BehaviorPeriod,
  description: string,
): FullLifetimeResponses {
  const prev = r.actualAttemptQuestions?.[id];
  if (!prev) return r;
  return normalizeBehaviorAttempts({
    ...r,
    actualAttemptQuestions: {
      ...r.actualAttemptQuestions!,
      [id]: { ...prev, [descField(period)]: description },
    },
  });
}

export function setBehaviorCount(
  r: FullLifetimeResponses,
  key: BehaviorKey,
  period: BehaviorPeriod,
  count: Rating,
): FullLifetimeResponses {
  return normalizeBehaviorAttempts({
    ...r,
    behavior: {
      ...r.behavior,
      [key]: {
        ...r.behavior[key],
        [countField(period)]: count,
      },
    },
  });
}
export function setAttemptField(
  r: FullLifetimeResponses,
  group: AttemptKey,
  patch: Partial<{
    date: string;
    actualLethality: Rating;
    potentialLethality: Rating;
  }>,
): FullLifetimeResponses {
  return normalizeBehaviorAttempts({
    ...r,
    attempts: {
      ...r.attempts,
      [group]: { ...r.attempts[group], ...patch },
    },
  });
}

// ─── Validation ─────────────────────────────────────────────────────────────

export type BehaviorErrors = Record<string, string>;
export const behaviorErrorKey = (
  key: BehaviorKey,
  period: BehaviorPeriod,
  field: "answer" | "count" = "answer",
) =>
  field === "answer"
    ? `behavior.${key}.${period}`
    : `behavior.${key}.${period}.count`;
export const followUpErrorKey = (
  id: ActualAttemptFollowUpId,
  period: BehaviorPeriod,
) => `actualAttempt.${id}.${period}`;
export const attemptErrorKey = (
  group: AttemptKey,
  field: "date" | "actualLethality" | "potentialLethality",
) => `attempts.${group}.${field}`;

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

export const COUNT_ERROR =
  "Enter a whole number greater than 0.";

/** Errors for Sections 3–4, in display order. */
export function validateBehaviorAttempts(
  r: FullLifetimeResponses,
): BehaviorErrors {
  const errors: BehaviorErrors = {};
  for (const q of BEHAVIOR_QUESTIONS)
    for (const p of BEHAVIOR_PERIODS) {
      const answer = r.behavior[q.key][p];
      if (answer === "unanswered") {
        errors[behaviorErrorKey(q.key, p)] =
          "Select Yes or No.";
        continue;
      }
      if (q.countLabel && answer === "yes") {
        const count = getBehaviorCount(r, q.key, p);
        if (!isPositiveWholeNumber(count))
          errors[behaviorErrorKey(q.key, p, "count")] =
            COUNT_ERROR;
      }
    }
  if (r.actualAttemptQuestions)
    for (const id of ACTUAL_ATTEMPT_FOLLOW_UP_IDS)
      for (const p of BEHAVIOR_PERIODS)
        if (r.actualAttemptQuestions[id][p] === "unanswered")
          errors[followUpErrorKey(id, p)] = "Select Yes or No.";
  if (isAttemptDetailsApplicable(r))
    for (const g of ATTEMPT_GROUPS) {
      const a = r.attempts[g.key];
      if (a.date === "" || !validIso(a.date))
        errors[attemptErrorKey(g.key, "date")] =
          "Enter a valid attempt date.";
      if (
        a.actualLethality === null ||
        !ACTUAL_LETHALITY_OPTIONS.some(
          (o) => o.value === a.actualLethality,
        )
      )
        errors[attemptErrorKey(g.key, "actualLethality")] =
          "Select an Actual Lethality code (0–5).";
      else if (
        a.actualLethality === 0 &&
        (a.potentialLethality === null ||
          !POTENTIAL_LETHALITY_OPTIONS.some(
            (o) => o.value === a.potentialLethality,
          ))
      )
        errors[attemptErrorKey(g.key, "potentialLethality")] =
          "Select a Potential Lethality code (0–2).";
    }
  return errors;
}

/** Keys in display order, for focusing the first error. */
export function behaviorAttemptErrorOrder(
  r: FullLifetimeResponses,
): string[] {
  const order: string[] = [];
  for (const q of BEHAVIOR_QUESTIONS) {
    if (q.key === "actualAttempt") {
      // Questions 1–9 in display order, then the two totals.
      for (const p of BEHAVIOR_PERIODS)
        order.push(behaviorErrorKey(q.key, p));
      if (r.actualAttemptQuestions)
        for (const id of ACTUAL_ATTEMPT_FOLLOW_UP_IDS)
          for (const p of BEHAVIOR_PERIODS)
            order.push(followUpErrorKey(id, p));
      for (const p of BEHAVIOR_PERIODS)
        order.push(behaviorErrorKey(q.key, p, "count"));
      continue;
    }
    for (const p of BEHAVIOR_PERIODS) {
      order.push(behaviorErrorKey(q.key, p));
      if (q.countLabel)
        order.push(behaviorErrorKey(q.key, p, "count"));
    }
  }
  for (const g of ATTEMPT_GROUPS)
    for (const f of [
      "date",
      "actualLethality",
      "potentialLethality",
    ] as const)
      order.push(attemptErrorKey(g.key, f));
  return order;
}