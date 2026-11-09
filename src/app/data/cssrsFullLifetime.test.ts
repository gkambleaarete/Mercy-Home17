// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  IDEATION_QUESTIONS,
  INTENSITY_QUESTIONS,
  highestEndorsedIdeationType,
  ideationErrorKey,
  intensityErrorKey,
  isIdeationQuestionApplicable,
  isIntensityApplicable,
  isIntensitySectionVisible,
  normalizeIdeationIntensity,
  ratingText,
  setIdeationAnswer,
  setIdeationDescription,
  setIntensityRating,
  setMostSevereIdeation,
  validateIdeationIntensity,
} from "./cssrsFullLifetime";
import {
  emptyFullLifetimeResponses,
  isFullLifetimeResponses,
  type FullLifetimeResponses,
  type IdeationKey,
} from "./cssrsTypes";
import { validFullLifetime } from "./cssrsTestFixtures";
import {
  CSSRS_STORAGE_KEY,
  __resetCssrsForTest,
  createCssrsAssessment,
  getCssrsAssessments,
} from "./cssrsAssessmentStore";

type P = "lifetime" | "past1Month";
const ans = (
  r: FullLifetimeResponses,
  key: IdeationKey,
  period: P,
  v: "yes" | "no",
) => setIdeationAnswer(r, key, period, v);
const Q3 = [
  "methodsWithoutPlan",
  "intentWithoutPlan",
  "intentWithPlan",
] as const;

/** A fully valid response: Lifetime Q1 yes/Q2 no, Past 1 Month Q1 no/Q2 yes. */
const valid = () => {
  let r = emptyFullLifetimeResponses();
  r = ans(r, "wishToBeDead", "lifetime", "yes");
  r = ans(r, "nonSpecificActiveThoughts", "lifetime", "no");
  r = ans(r, "wishToBeDead", "past1Month", "no");
  r = ans(r, "nonSpecificActiveThoughts", "past1Month", "yes");
  for (const k of Q3) r = ans(r, k, "past1Month", "no");
  r = setMostSevereIdeation(r, "lifetime", { typeNumber: 1 });
  r = setMostSevereIdeation(r, "recent", { typeNumber: 2 });
  for (const q of INTENSITY_QUESTIONS) {
    r = setIntensityRating(
      r,
      q.key,
      "lifetime",
      q.options[0].value,
    );
    r = setIntensityRating(
      r,
      q.key,
      "recent",
      q.options[0].value,
    );
  }
  return r;
};

describe("content", () => {
  it("keeps the approved question wording and order", () => {
    expect(IDEATION_QUESTIONS.map((q) => q.text)).toEqual([
      "Have you wished you were dead or wished you could go to sleep and not wake up?",
      "Have you actually had any thoughts of killing yourself?",
      "Have you been thinking about how you might do this?",
      "Have you had these thoughts and had some intention of acting on them?",
      "Have you started to work out or worked out the details of how to kill yourself? Did you intend to carry out this plan?",
    ]);
    expect(IDEATION_QUESTIONS.map((q) => q.title)).toEqual([
      "Wish to Be Dead",
      "Non-Specific Active Suicidal Thoughts",
      "Active Suicidal Ideation with a Method but No Plan or Intent",
      "Active Suicidal Ideation with Some Intent but No Specific Plan",
      "Active Suicidal Ideation with a Specific Plan and Intent",
    ]);
  });

  it("has the rating options with their numeric codes", () => {
    const by = Object.fromEntries(
      INTENSITY_QUESTIONS.map((q) => [
        q.key,
        q.options.map((o) => o.value),
      ]),
    );
    expect(by.frequency).toEqual([1, 2, 3, 4, 5]);
    expect(by.duration).toEqual([1, 2, 3, 4, 5]);
    expect(by.controllability).toEqual([0, 1, 2, 3, 4, 5]);
    expect(by.deterrents).toEqual([0, 1, 2, 3, 4, 5]);
    expect(by.reasonsForIdeation).toEqual([0, 1, 2, 3, 4, 5]);
    expect(ratingText("frequency", 3)).toBe(
      "3 – Two to five times in a week",
    );
    expect(ratingText("controllability", 0)).toBe(
      "0 – Does not attempt to control thoughts",
    );
    expect(ratingText("reasonsForIdeation", null)).toBeNull();
  });
});

describe("periods are independent", () => {
  it("starts every answer unanswered and keeps periods apart", () => {
    const r = emptyFullLifetimeResponses();
    for (const q of IDEATION_QUESTIONS) {
      expect(r.ideation[q.key].lifetime).toBe("unanswered");
      expect(r.ideation[q.key].past1Month).toBe("unanswered");
    }
    const a = ans(r, "wishToBeDead", "lifetime", "yes");
    expect(a.ideation.wishToBeDead.past1Month).toBe(
      "unanswered",
    );
    const d = setIdeationDescription(
      a,
      "wishToBeDead",
      "lifetime",
      "text",
    );
    expect(d.ideation.wishToBeDead.lifetimeDescription).toBe(
      "text",
    );
    expect(d.ideation.wishToBeDead.past1MonthDescription).toBe(
      "",
    );
  });
});

describe("Q3–Q5 visibility per period", () => {
  const combos: Array<[string, string]> = [
    ["unanswered", "unanswered"],
    ["unanswered", "yes"],
    ["unanswered", "no"],
    ["yes", "unanswered"],
    ["yes", "yes"],
    ["yes", "no"],
    ["no", "unanswered"],
    ["no", "yes"],
    ["no", "no"],
  ];
  it.each(combos)(
    "lifetime Q2 %s / past 1 month Q2 %s",
    (l, p) => {
      let r = emptyFullLifetimeResponses();
      if (l !== "unanswered")
        r = ans(
          r,
          "nonSpecificActiveThoughts",
          "lifetime",
          l as "yes",
        );
      if (p !== "unanswered")
        r = ans(
          r,
          "nonSpecificActiveThoughts",
          "past1Month",
          p as "yes",
        );
      for (const k of Q3) {
        expect(
          isIdeationQuestionApplicable(r, k, "lifetime"),
        ).toBe(l === "yes");
        expect(
          isIdeationQuestionApplicable(r, k, "past1Month"),
        ).toBe(p === "yes");
      }
      expect(
        isIdeationQuestionApplicable(
          r,
          "wishToBeDead",
          "lifetime",
        ),
      ).toBe(true);
      expect(
        isIdeationQuestionApplicable(
          r,
          "nonSpecificActiveThoughts",
          "past1Month",
        ),
      ).toBe(true);
    },
  );

  it("Lifetime Q2 No and Past 1 Month Q2 Yes shows Q3–Q5 for Past 1 Month only", () => {
    let r = ans(
      emptyFullLifetimeResponses(),
      "nonSpecificActiveThoughts",
      "lifetime",
      "no",
    );
    r = ans(
      r,
      "nonSpecificActiveThoughts",
      "past1Month",
      "yes",
    );
    expect(
      isIdeationQuestionApplicable(
        r,
        "intentWithPlan",
        "lifetime",
      ),
    ).toBe(false);
    expect(
      isIdeationQuestionApplicable(
        r,
        "intentWithPlan",
        "past1Month",
      ),
    ).toBe(true);
  });

  it("changing Q2 away from Yes clears that period's Q3–Q5 answers and descriptions only", () => {
    let r = valid();
    r = ans(r, "nonSpecificActiveThoughts", "lifetime", "yes");
    r = ans(r, "methodsWithoutPlan", "lifetime", "yes");
    r = setIdeationDescription(
      r,
      "methodsWithoutPlan",
      "lifetime",
      "life",
    );
    r = ans(r, "methodsWithoutPlan", "past1Month", "yes");
    r = setIdeationDescription(
      r,
      "methodsWithoutPlan",
      "past1Month",
      "month",
    );
    r = ans(r, "nonSpecificActiveThoughts", "lifetime", "no");
    expect(r.ideation.methodsWithoutPlan.lifetime).toBe(
      "unanswered",
    );
    expect(
      r.ideation.methodsWithoutPlan.lifetimeDescription,
    ).toBe("");
    expect(r.ideation.methodsWithoutPlan.past1Month).toBe(
      "yes",
    );
    expect(
      r.ideation.methodsWithoutPlan.past1MonthDescription,
    ).toBe("month");
  });

  it("clears a description when its answer moves away from Yes", () => {
    let r = ans(
      emptyFullLifetimeResponses(),
      "wishToBeDead",
      "lifetime",
      "yes",
    );
    r = setIdeationDescription(
      r,
      "wishToBeDead",
      "lifetime",
      "x",
    );
    expect(r.ideation.wishToBeDead.lifetimeDescription).toBe(
      "x",
    );
    r = ans(r, "wishToBeDead", "lifetime", "no");
    expect(r.ideation.wishToBeDead.lifetimeDescription).toBe(
      "",
    );
  });
});

describe("Intensity applicability", () => {
  it("Q1 Yes with Q2 No still enables Intensity", () => {
    let r = ans(
      emptyFullLifetimeResponses(),
      "wishToBeDead",
      "lifetime",
      "yes",
    );
    r = ans(r, "nonSpecificActiveThoughts", "lifetime", "no");
    expect(isIntensityApplicable(r, "lifetime")).toBe(true);
    expect(isIntensityApplicable(r, "past1Month")).toBe(false);
    expect(isIntensitySectionVisible(r)).toBe(true);
  });

  it("Q2 Yes alone enables it; both No / unanswered does not", () => {
    expect(
      isIntensityApplicable(
        ans(
          emptyFullLifetimeResponses(),
          "nonSpecificActiveThoughts",
          "past1Month",
          "yes",
        ),
        "past1Month",
      ),
    ).toBe(true);
    let r = ans(
      emptyFullLifetimeResponses(),
      "wishToBeDead",
      "lifetime",
      "no",
    );
    r = ans(r, "nonSpecificActiveThoughts", "lifetime", "no");
    expect(isIntensitySectionVisible(r)).toBe(false);
    expect(
      isIntensitySectionVisible(emptyFullLifetimeResponses()),
    ).toBe(false);
  });

  it("one period becoming inapplicable clears only that period's intensity", () => {
    let r = valid();
    r = setMostSevereIdeation(r, "lifetime", {
      description: "L",
    });
    r = setMostSevereIdeation(r, "recent", {
      description: "R",
    });
    r = ans(r, "wishToBeDead", "lifetime", "no"); // Lifetime Q1 and Q2 now No
    expect(r.mostSevereIdeation.lifetime).toEqual({
      typeNumber: null,
      description: "",
    });
    for (const q of INTENSITY_QUESTIONS) {
      expect(r.intensity[q.key].lifetime).toBeNull();
      expect(r.intensity[q.key].recent).not.toBeNull();
    }
    expect(r.mostSevereIdeation.recent).toEqual({
      typeNumber: 2,
      description: "R",
    });
  });

  it("both Lifetime answers No does not skip unfinished Past 1 Month questions", () => {
    let r = ans(
      emptyFullLifetimeResponses(),
      "wishToBeDead",
      "lifetime",
      "no",
    );
    r = ans(r, "nonSpecificActiveThoughts", "lifetime", "no");
    const errors = validateIdeationIntensity(r);
    expect(
      errors[ideationErrorKey("wishToBeDead", "past1Month")],
    ).toBeTruthy();
    expect(
      errors[
        ideationErrorKey(
          "nonSpecificActiveThoughts",
          "past1Month",
        )
      ],
    ).toBeTruthy();
    expect(
      errors[ideationErrorKey("wishToBeDead", "lifetime")],
    ).toBeUndefined();
  });
});

describe("normalization", () => {
  it("removes hidden answers, descriptions and ratings", () => {
    const stale = emptyFullLifetimeResponses();
    stale.ideation.nonSpecificActiveThoughts.lifetime = "no";
    stale.ideation.intentWithPlan.lifetime = "yes";
    stale.ideation.intentWithPlan.lifetimeDescription =
      "hidden";
    stale.ideation.wishToBeDead.past1Month = "no";
    stale.ideation.wishToBeDead.past1MonthDescription =
      "orphan";
    stale.intensity.frequency.recent = 3;
    stale.mostSevereIdeation.recent = {
      typeNumber: 2,
      description: "hidden",
    };
    const n = normalizeIdeationIntensity(stale);
    expect(n.ideation.intentWithPlan.lifetime).toBe(
      "unanswered",
    );
    expect(n.ideation.intentWithPlan.lifetimeDescription).toBe(
      "",
    );
    expect(n.ideation.wishToBeDead.past1MonthDescription).toBe(
      "",
    );
    expect(n.intensity.frequency.recent).toBeNull();
    expect(n.mostSevereIdeation.recent).toEqual({
      typeNumber: null,
      description: "",
    });
    expect(stale.ideation.intentWithPlan.lifetime).toBe("yes"); // input not mutated
  });

  it("preserves Behavior and Lethality (and is idempotent on valid data)", () => {
    const r = valid();
    r.behavior.actualAttempt = {
      lifetime: "yes",
      lifetimeDescription: "b",
      lifetimeCount: 1,
      past3Months: "no",
      past3MonthsDescription: "",
      past3MonthsCount: 0,
    };
    r.attempts.mostLethal = {
      date: "2026-01-02",
      actualLethality: 0,
      potentialLethality: 2,
      description: "",
    };
    const n = normalizeIdeationIntensity(r);
    expect(n.behavior).toEqual(r.behavior);
    expect(n.attempts).toEqual(r.attempts);
    expect(normalizeIdeationIntensity(n)).toEqual(n);
    // …and when Sections 1–2 are wiped, they are still untouched.
    const wiped = ans(
      ans(r, "wishToBeDead", "lifetime", "no"),
      "nonSpecificActiveThoughts",
      "past1Month",
      "no",
    );
    expect(wiped.behavior).toEqual(r.behavior);
    expect(wiped.attempts).toEqual(r.attempts);
  });

  it("applies at the store's save boundary", () => {
    __resetCssrsForTest();
    const stale = validFullLifetime();
    stale.intensity.duration.recent = 4; // Past 1 Month is No/No: hidden
    stale.ideation.intentWithPlan.past1Month = "yes"; // Q2 not Yes: hidden
    const res = createCssrsAssessment({
      instrument: "cssrs-full-lifetime",
      ownership: {
        admissionsRecordId: "L-1",
        youthKey: "Y-1",
        youthConstituentId: null,
      },
      assessmentDate: "2026-03-01",
      responses: stale,
    });
    expect(res.ok).toBe(true);
    const read = getCssrsAssessments();
    const rec = read.status === "ok" ? read.records[0] : null;
    if (!rec || rec.instrument !== "cssrs-full-lifetime")
      throw new Error();
    expect(rec.responses.intensity.duration.recent).toBeNull();
    expect(
      rec.responses.ideation.intentWithPlan.past1Month,
    ).toBe("unanswered");
    expect(
      localStorage.getItem(CSSRS_STORAGE_KEY),
    ).not.toBeNull();
  });
});

describe("validation", () => {
  it("accepts a complete valid response with optional narratives empty", () => {
    expect(validateIdeationIntensity(valid())).toEqual({});
    expect(isFullLifetimeResponses(valid())).toBe(true);
  });

  it("requires Q1/Q2 in both periods and nothing else when nothing is Yes", () => {
    const keys = Object.keys(
      validateIdeationIntensity(emptyFullLifetimeResponses()),
    );
    expect(keys.sort()).toEqual(
      [
        ideationErrorKey("wishToBeDead", "lifetime"),
        ideationErrorKey("wishToBeDead", "past1Month"),
        ideationErrorKey(
          "nonSpecificActiveThoughts",
          "lifetime",
        ),
        ideationErrorKey(
          "nonSpecificActiveThoughts",
          "past1Month",
        ),
      ].sort(),
    );
  });

  it("requires Q3–Q5 only where that period's Q2 is Yes", () => {
    const r = ans(
      valid(),
      "methodsWithoutPlan",
      "past1Month",
      "yes",
    );
    const bad = setIdeationAnswer(
      {
        ...r,
        ideation: {
          ...r.ideation,
          intentWithPlan: {
            ...r.ideation.intentWithPlan,
            past1Month: "unanswered",
          },
        },
      },
      "methodsWithoutPlan",
      "past1Month",
      "yes",
    );
    const errors = validateIdeationIntensity(bad);
    expect(
      errors[ideationErrorKey("intentWithPlan", "past1Month")],
    ).toBeTruthy();
    expect(
      errors[ideationErrorKey("intentWithPlan", "lifetime")],
    ).toBeUndefined();
  });

  it("requires the type number and all five ratings per applicable period", () => {
    let r = ans(
      emptyFullLifetimeResponses(),
      "wishToBeDead",
      "lifetime",
      "yes",
    );
    r = ans(r, "nonSpecificActiveThoughts", "lifetime", "no");
    r = ans(r, "wishToBeDead", "past1Month", "no");
    r = ans(r, "nonSpecificActiveThoughts", "past1Month", "no");
    const errors = validateIdeationIntensity(r);
    expect(Object.keys(errors).sort()).toEqual(
      [
        intensityErrorKey("lifetime", "typeNumber"),
        ...INTENSITY_QUESTIONS.map((q) =>
          intensityErrorKey("lifetime", q.key),
        ),
      ].sort(),
    );
  });

  it("accepts numeric 0 where allowed and keeps null unanswered", () => {
    let r = valid();
    r = setIntensityRating(r, "controllability", "lifetime", 0);
    r = setIntensityRating(r, "deterrents", "lifetime", 0);
    r = setIntensityRating(
      r,
      "reasonsForIdeation",
      "recent",
      0,
    );
    expect(validateIdeationIntensity(r)).toEqual({});
    expect(r.intensity.controllability.lifetime).toBe(0);
    r = setIntensityRating(
      r,
      "controllability",
      "lifetime",
      null,
    );
    expect(
      validateIdeationIntensity(r)[
        intensityErrorKey("lifetime", "controllability")
      ],
    ).toBe("Select a rating.");
  });

  it("rejects 0 for Frequency/Duration and out-of-range or non-integer ratings", () => {
    let r = valid();
    r = setIntensityRating(r, "frequency", "lifetime", 0);
    r = setIntensityRating(r, "duration", "lifetime", 6);
    r = setIntensityRating(r, "deterrents", "recent", -1);
    r = setIntensityRating(r, "controllability", "recent", 2.5);
    const e = validateIdeationIntensity(r);
    expect(
      e[intensityErrorKey("lifetime", "frequency")],
    ).toMatch(/1 to 5/);
    expect(
      e[intensityErrorKey("lifetime", "duration")],
    ).toMatch(/1 to 5/);
    expect(
      e[intensityErrorKey("recent", "deterrents")],
    ).toMatch(/0 to 5/);
    expect(
      e[intensityErrorKey("recent", "controllability")],
    ).toMatch(/0 to 5/);
    const t = setMostSevereIdeation(valid(), "lifetime", {
      typeNumber: 7,
    });
    expect(
      validateIdeationIntensity(t)[
        intensityErrorKey("lifetime", "typeNumber")
      ],
    ).toMatch(/1 to 5/);
  });

  it("requires the Type Number to match the highest endorsed question", () => {
    let r = valid(); // Past 1 Month: Q2 yes, Q3–Q5 no → highest 2
    expect(highestEndorsedIdeationType(r, "past1Month")).toBe(
      2,
    );
    r = ans(r, "intentWithoutPlan", "past1Month", "yes");
    expect(highestEndorsedIdeationType(r, "past1Month")).toBe(
      4,
    );
    const e =
      validateIdeationIntensity(r)[
        intensityErrorKey("recent", "typeNumber")
      ];
    expect(e).toMatch(/Question 4/);
    // never silently changed
    expect(r.mostSevereIdeation.recent.typeNumber).toBe(2);
    expect(
      validateIdeationIntensity(
        setMostSevereIdeation(r, "recent", { typeNumber: 4 }),
      ),
    ).toEqual({});
    // not inferred from narrative text
    const n = setMostSevereIdeation(r, "recent", {
      typeNumber: 2,
      description: "plan with intent, question 5",
    });
    expect(
      validateIdeationIntensity(n)[
        intensityErrorKey("recent", "typeNumber")
      ],
    ).toMatch(/Question 4/);
    // Q1-only → 1
    expect(
      highestEndorsedIdeationType(valid(), "lifetime"),
    ).toBe(1);
  });
});