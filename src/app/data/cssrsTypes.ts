// C-SSRS response types (US 20105 Screener, US 20139 Full-Lifetime) — the
// shared foundation only. The two instruments are distinct and keep their
// own payloads; nothing here calculates a risk level or completion state.
//
// Conventions:
//  • A Yes/No answer is "yes" | "no" | "unanswered". "unanswered" is the
//    initial value and is never the same thing as "no".
//  • A numeric rating is a number or null. null means unanswered; 0 is a
//    valid rating.
//  • Every factory returns fresh nested objects, so two assessments never
//    share mutable state.
//  • Question wording is NOT stored here — it belongs to the forms.

export type YesNo = "yes" | "no" | "unanswered";
export const YES_NO_VALUES: readonly YesNo[] = [
  "yes",
  "no",
  "unanswered",
];

/** null = unanswered; 0 is a real value. */
export type Rating = number | null;

export type CssrsInstrument =
  "cssrs-screener" | "cssrs-full-lifetime";

export const CSSRS_TEST_TYPE: Record<CssrsInstrument, string> =
  {
    "cssrs-screener": "C-SSRS Screener",
    "cssrs-full-lifetime": "C-SSRS Full-Lifetime",
  };

/** Version of the response payloads below (separate from the storage
 *  schema version in cssrsAssessmentStore). */
export const CSSRS_PAYLOAD_VERSION = 1 as const;

/** Full-Lifetime payload versions. 1 = records saved before the Actual
 *  Attempt question set (no `actualAttemptQuestions`); 2 = current. Kept
 *  apart from CSSRS_PAYLOAD_VERSION, which the Screener still uses. New and
 *  edited saves are always version 2; version 1 stays readable. */
export const FULL_LIFETIME_LEGACY_VERSION = 1 as const;
export const FULL_LIFETIME_PAYLOAD_VERSION = 2 as const;

/** One Yes/No item with an optional free-text description. */
export interface YesNoItem {
  answer: YesNo;
  description: string;
}

// ─── Screener ───────────────────────────────────────────────────────────────

export const SCREENER_ITEM_KEYS = [
  "wishToBeDead",
  "suicidalThoughts",
  "method",
  "intent",
  "plan",
  "behavior",
] as const;
export type ScreenerItemKey =
  (typeof SCREENER_ITEM_KEYS)[number];

export interface ScreenerResponses {
  version: typeof CSSRS_PAYLOAD_VERSION;
  items: Record<ScreenerItemKey, YesNoItem>;
  /** Suicidal behavior within the past 3 months (follow-up to `behavior`). */
  behaviorPast3Months: YesNo;
  /** Optional Incident Report this Screener relates to (selector: Chunk 2).
   *  Stored as the IR's id only. */
  relatedIncidentReportId: string | null;
}

// ─── Full Lifetime ──────────────────────────────────────────────────────────

export const IDEATION_KEYS = [
  "wishToBeDead",
  "nonSpecificActiveThoughts",
  "methodsWithoutPlan",
  "intentWithoutPlan",
  "intentWithPlan",
] as const;
export type IdeationKey = (typeof IDEATION_KEYS)[number];

/** Ideation is asked for two separate periods. Each period has its own
 *  answer and its own "If Yes, Describe" narrative, which is empty unless
 *  that period's answer is Yes. */
export interface IdeationItem {
  /** Time the individual felt most suicidal. */
  lifetime: YesNo;
  lifetimeDescription: string;
  past1Month: YesNo;
  past1MonthDescription: string;
}

export const INTENSITY_KEYS = [
  "frequency",
  "duration",
  "controllability",
  "deterrents",
  "reasonsForIdeation",
] as const;
export type IntensityKey = (typeof INTENSITY_KEYS)[number];

/** Intensity ratings: Lifetime and Recent are separate values. */
export interface IntensityItem {
  lifetime: Rating;
  recent: Rating;
}

export const BEHAVIOR_KEYS = [
  "actualAttempt",
  "nonSuicidalSelfInjury",
  "interruptedAttempt",
  "abortedAttempt",
  "preparatoryActs",
] as const;
export type BehaviorKey = (typeof BEHAVIOR_KEYS)[number];

/** Behavior is asked for Lifetime and the Past 3 Months, each with its own
 *  answer, description and count. For the four counted categories the count
 *  is null while unanswered, 0 once answered No, and a positive whole
 *  number for Yes. `nonSuicidalSelfInjury` is Yes/No only: its description
 *  and counts stay empty. */
export interface BehaviorItem {
  lifetime: YesNo;
  lifetimeDescription: string;
  lifetimeCount: Rating;
  past3Months: YesNo;
  past3MonthsDescription: string;
  past3MonthsCount: Rating;
}

/** Actual Attempt questions 2–9, keyed by stable ids (never by wording or
 *  position). Question 1 ("Have you made a suicide attempt?") is the
 *  existing explicit Actual Attempt response, behavior.actualAttempt, which
 *  keeps driving Attempt Details and the totals. */
export const ACTUAL_ATTEMPT_FOLLOW_UP_IDS = [
  "harmYourself",
  "dangerousCouldHaveDied",
  "whatDidYouDo",
  "didAsWayToEndLife",
  "wantedToDie",
  "tryingToEndLife",
  "thoughtCouldHaveDied",
  "otherReasons",
] as const;
export type ActualAttemptFollowUpId =
  (typeof ACTUAL_ATTEMPT_FOLLOW_UP_IDS)[number];

/** One independent Yes/No per period, each with its own description. */
export interface ActualAttemptFollowUp {
  lifetime: YesNo;
  lifetimeDescription: string;
  past3Months: YesNo;
  past3MonthsDescription: string;
}

export const ATTEMPT_KEYS = [
  "mostRecent",
  "mostLethal",
  "initial",
] as const;
export type AttemptKey = (typeof ATTEMPT_KEYS)[number];

export interface AttemptDetails {
  /** ISO "YYYY-MM-DD" or "" when not entered. */
  date: string;
  actualLethality: Rating;
  potentialLethality: Rating;
  description: string;
}

/** Most Severe Ideation for one intensity period. `typeNumber` is the
 *  staff-selected ideation question number (1–5); null = unanswered. */
export interface MostSevereIdeation {
  typeNumber: Rating;
  description: string;
}

export interface FullLifetimeResponses {
  version:
    | typeof FULL_LIFETIME_LEGACY_VERSION
    | typeof FULL_LIFETIME_PAYLOAD_VERSION;
  ideation: Record<IdeationKey, IdeationItem>;
  /** Intensity of Ideation: Lifetime Most Severe and Recent (= Past 1
   *  Month) Most Severe. */
  mostSevereIdeation: {
    lifetime: MostSevereIdeation;
    recent: MostSevereIdeation;
  };
  intensity: Record<IntensityKey, IntensityItem>;
  behavior: Record<BehaviorKey, BehaviorItem>;
  /** Actual Attempt questions 2–9. Present in version 2; absent in
   *  version 1 records (those answers were never captured). */
  actualAttemptQuestions?: Record<
    ActualAttemptFollowUpId,
    ActualAttemptFollowUp
  >;
  attempts: Record<AttemptKey, AttemptDetails>;
}

// ─── Fresh empty states ─────────────────────────────────────────────────────

const fromKeys = <K extends string, V>(
  keys: readonly K[],
  make: () => V,
): Record<K, V> =>
  Object.fromEntries(keys.map((k) => [k, make()])) as Record<
    K,
    V
  >;

export const emptyYesNoItem = (): YesNoItem => ({
  answer: "unanswered",
  description: "",
});

export const emptyScreenerResponses =
  (): ScreenerResponses => ({
    version: CSSRS_PAYLOAD_VERSION,
    items: fromKeys(SCREENER_ITEM_KEYS, emptyYesNoItem),
    behaviorPast3Months: "unanswered",
    relatedIncidentReportId: null,
  });

export const emptyIdeationItem = (): IdeationItem => ({
  lifetime: "unanswered",
  lifetimeDescription: "",
  past1Month: "unanswered",
  past1MonthDescription: "",
});
export const emptyMostSevereIdeation =
  (): MostSevereIdeation => ({
    typeNumber: null,
    description: "",
  });
export const emptyIntensityItem = (): IntensityItem => ({
  lifetime: null,
  recent: null,
});
export const emptyBehaviorItem = (): BehaviorItem => ({
  lifetime: "unanswered",
  lifetimeDescription: "",
  lifetimeCount: null,
  past3Months: "unanswered",
  past3MonthsDescription: "",
  past3MonthsCount: null,
});
export const emptyActualAttemptFollowUp =
  (): ActualAttemptFollowUp => ({
    lifetime: "unanswered",
    lifetimeDescription: "",
    past3Months: "unanswered",
    past3MonthsDescription: "",
  });
export const emptyAttemptDetails = (): AttemptDetails => ({
  date: "",
  actualLethality: null,
  potentialLethality: null,
  description: "",
});

export const emptyFullLifetimeResponses =
  (): FullLifetimeResponses => ({
    version: FULL_LIFETIME_PAYLOAD_VERSION,
    ideation: fromKeys(IDEATION_KEYS, emptyIdeationItem),
    mostSevereIdeation: {
      lifetime: emptyMostSevereIdeation(),
      recent: emptyMostSevereIdeation(),
    },
    intensity: fromKeys(INTENSITY_KEYS, emptyIntensityItem),
    behavior: fromKeys(BEHAVIOR_KEYS, emptyBehaviorItem),
    actualAttemptQuestions: fromKeys(
      ACTUAL_ATTEMPT_FOLLOW_UP_IDS,
      emptyActualAttemptFollowUp,
    ),
    attempts: fromKeys(ATTEMPT_KEYS, emptyAttemptDetails),
  });

/** A version 1 record opened for editing: the same record with the new
 *  Actual Attempt questions added, all unanswered (nothing is invented).
 *  Version 2 passes through. Pure: the saved record is not touched. */
export const upgradeFullLifetimeResponses = (
  r: FullLifetimeResponses,
): FullLifetimeResponses =>
  r.version === FULL_LIFETIME_PAYLOAD_VERSION &&
  r.actualAttemptQuestions
    ? r
    : {
        ...r,
        version: FULL_LIFETIME_PAYLOAD_VERSION,
        actualAttemptQuestions: fromKeys(
          ACTUAL_ATTEMPT_FOLLOW_UP_IDS,
          emptyActualAttemptFollowUp,
        ),
      };

// ─── Validation (used when reading persisted data) ─────────────────────────

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
export const isYesNo = (v: unknown): v is YesNo =>
  v === "yes" || v === "no" || v === "unanswered";
export const isRating = (v: unknown): v is Rating =>
  v === null || (typeof v === "number" && Number.isFinite(v));

const hasKeys = (
  v: unknown,
  keys: readonly string[],
  check: (item: unknown) => boolean,
): boolean =>
  isObj(v) && keys.every((k) => k in v && check(v[k]));

const isYesNoItem = (v: unknown) =>
  isObj(v) &&
  isYesNo(v.answer) &&
  typeof v.description === "string";
const isIdeationItem = (v: unknown) =>
  isObj(v) &&
  isYesNo(v.lifetime) &&
  typeof v.lifetimeDescription === "string" &&
  isYesNo(v.past1Month) &&
  typeof v.past1MonthDescription === "string";
const isMostSevere = (v: unknown) =>
  isObj(v) &&
  isRating(v.typeNumber) &&
  typeof v.description === "string";
const isIntensityItem = (v: unknown) =>
  isObj(v) && isRating(v.lifetime) && isRating(v.recent);
const isBehaviorItem = (v: unknown) =>
  isObj(v) &&
  isYesNo(v.lifetime) &&
  typeof v.lifetimeDescription === "string" &&
  isRating(v.lifetimeCount) &&
  isYesNo(v.past3Months) &&
  typeof v.past3MonthsDescription === "string" &&
  isRating(v.past3MonthsCount);
const isFollowUp = (v: unknown) =>
  isObj(v) &&
  isYesNo(v.lifetime) &&
  typeof v.lifetimeDescription === "string" &&
  isYesNo(v.past3Months) &&
  typeof v.past3MonthsDescription === "string";
const isAttemptDetails = (v: unknown) =>
  isObj(v) &&
  typeof v.date === "string" &&
  isRating(v.actualLethality) &&
  isRating(v.potentialLethality) &&
  typeof v.description === "string";

export const isScreenerResponses = (
  v: unknown,
): v is ScreenerResponses =>
  isObj(v) &&
  v.version === CSSRS_PAYLOAD_VERSION &&
  hasKeys(v.items, SCREENER_ITEM_KEYS, isYesNoItem) &&
  isYesNo(v.behaviorPast3Months) &&
  (v.relatedIncidentReportId === null ||
    typeof v.relatedIncidentReportId === "string");

/** Readable Full-Lifetime payload: the current version (with the Actual
 *  Attempt questions) or a legacy version 1 record (without them). */
export const isFullLifetimeResponses = (
  v: unknown,
): v is FullLifetimeResponses =>
  isObj(v) &&
  (v.version === FULL_LIFETIME_LEGACY_VERSION ||
    (v.version === FULL_LIFETIME_PAYLOAD_VERSION &&
      hasKeys(
        v.actualAttemptQuestions,
        ACTUAL_ATTEMPT_FOLLOW_UP_IDS,
        isFollowUp,
      ))) &&
  hasKeys(v.ideation, IDEATION_KEYS, isIdeationItem) &&
  hasKeys(
    v.mostSevereIdeation,
    ["lifetime", "recent"],
    isMostSevere,
  ) &&
  hasKeys(v.intensity, INTENSITY_KEYS, isIntensityItem) &&
  hasKeys(v.behavior, BEHAVIOR_KEYS, isBehaviorItem) &&
  hasKeys(v.attempts, ATTEMPT_KEYS, isAttemptDetails);

/** A payload that may be SAVED: the current version only. */
export const isCurrentFullLifetimeResponses = (
  v: unknown,
): v is FullLifetimeResponses =>
  isFullLifetimeResponses(v) &&
  v.version === FULL_LIFETIME_PAYLOAD_VERSION;