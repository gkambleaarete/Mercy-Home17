// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  ACTUAL_ATTEMPT_QUESTIONS,
  ACTUAL_LETHALITY_OPTIONS,
  BEHAVIOR_QUESTIONS,
  POTENTIAL_LETHALITY_OPTIONS,
  actualLethalityText,
  attemptErrorKey,
  behaviorErrorKey,
  isAttemptDetailsApplicable,
  normalizeBehaviorAttempts,
  parseCountText,
  setAttemptField,
  setBehaviorAnswer,
  setBehaviorCount,
  setBehaviorDescription,
  validateBehaviorAttempts,
} from "./cssrsFullLifetimeBehavior";
import {
  fullLifetimeErrorOrder,
  normalizeFullLifetime,
  validateFullLifetime,
} from "./cssrsFullLifetimeRules";
import { setIdeationAnswer } from "./cssrsFullLifetime";
import { validFullLifetime } from "./cssrsTestFixtures";
import {
  BEHAVIOR_KEYS,
  emptyFullLifetimeResponses,
  isFullLifetimeResponses,
  type BehaviorKey,
} from "./cssrsTypes";
import {
  __resetCssrsForTest,
  createCssrsAssessment,
  getCssrsAssessments,
  updateCssrsAssessment,
} from "./cssrsAssessmentStore";

const COUNTED: BehaviorKey[] = [
  "actualAttempt",
  "interruptedAttempt",
  "abortedAttempt",
  "preparatoryActs",
];
const own = {
  admissionsRecordId: "L-1",
  youthKey: "Y-1",
  youthConstituentId: null,
};

/** Everything answered No for both periods. */
const allNo = () => {
  let r = emptyFullLifetimeResponses();
  for (const k of BEHAVIOR_KEYS)
    for (const p of ["lifetime", "past3Months"] as const)
      r = setBehaviorAnswer(r, k, p, "no");
  return r;
};

beforeEach(() => __resetCssrsForTest());

describe("Section 3 content", () => {
  it("lists the five categories; prompts are guidance, not response fields", () => {
    expect(BEHAVIOR_QUESTIONS.map((q) => q.key)).toEqual([
      ...BEHAVIOR_KEYS,
    ]);
    expect(ACTUAL_ATTEMPT_QUESTIONS).toHaveLength(9);
    expect(ACTUAL_ATTEMPT_QUESTIONS[0].text).toBe(
      "Have you made a suicide attempt?",
    );
    const r = emptyFullLifetimeResponses();
    expect(
      Object.keys(r.behavior.actualAttempt).sort(),
    ).toEqual(
      [
        "lifetime",
        "lifetimeCount",
        "lifetimeDescription",
        "past3Months",
        "past3MonthsCount",
        "past3MonthsDescription",
      ].sort(),
    );
    expect(
      BEHAVIOR_QUESTIONS.find(
        (q) => q.key === "interruptedAttempt",
      )!.text,
    ).toBe(
      "Has there been a time when you started to do something to end your life but someone or something stopped you before you actually did anything?",
    );
    expect(
      BEHAVIOR_QUESTIONS.find(
        (q) => q.key === "nonSuicidalSelfInjury",
      )!.text,
    ).toBe(
      "Has the individual engaged in non-suicidal self-injurious behavior?",
    );
  });

  it("starts every response unanswered with unanswered (not 0) counts", () => {
    const r = emptyFullLifetimeResponses();
    for (const k of BEHAVIOR_KEYS) {
      expect(r.behavior[k].lifetime).toBe("unanswered");
      expect(r.behavior[k].past3Months).toBe("unanswered");
      expect(r.behavior[k].lifetimeCount).toBeNull();
      expect(r.behavior[k].past3MonthsCount).toBeNull();
    }
  });
});

describe("behavior independence and normalization", () => {
  it("categories are independent; several can be Yes", () => {
    let r = emptyFullLifetimeResponses();
    r = setBehaviorAnswer(
      r,
      "interruptedAttempt",
      "lifetime",
      "yes",
    );
    r = setBehaviorAnswer(
      r,
      "preparatoryActs",
      "lifetime",
      "yes",
    );
    expect(r.behavior.interruptedAttempt.lifetime).toBe("yes");
    expect(r.behavior.preparatoryActs.lifetime).toBe("yes");
    expect(r.behavior.actualAttempt.lifetime).toBe(
      "unanswered",
    );
    expect(r.behavior.abortedAttempt.lifetime).toBe(
      "unanswered",
    );
  });

  it("changing one period never alters the other", () => {
    let r = setBehaviorAnswer(
      emptyFullLifetimeResponses(),
      "abortedAttempt",
      "lifetime",
      "yes",
    );
    r = setBehaviorCount(r, "abortedAttempt", "lifetime", 3);
    r = setBehaviorDescription(
      r,
      "abortedAttempt",
      "lifetime",
      "L",
    );
    r = setBehaviorAnswer(
      r,
      "abortedAttempt",
      "past3Months",
      "no",
    );
    r = setBehaviorAnswer(
      r,
      "abortedAttempt",
      "past3Months",
      "yes",
    );
    expect(r.behavior.abortedAttempt.lifetimeCount).toBe(3);
    expect(r.behavior.abortedAttempt.lifetimeDescription).toBe(
      "L",
    );
    expect(
      r.behavior.abortedAttempt.past3MonthsCount,
    ).toBeNull();
  });

  it.each(COUNTED)(
    "%s: No → count 0 and description cleared; unanswered → null",
    (k) => {
      let r = setBehaviorAnswer(
        emptyFullLifetimeResponses(),
        k,
        "lifetime",
        "yes",
      );
      r = setBehaviorCount(r, k, "lifetime", 4);
      r = setBehaviorDescription(r, k, "lifetime", "text");
      r = setBehaviorAnswer(r, k, "lifetime", "no");
      expect(r.behavior[k].lifetimeCount).toBe(0);
      expect(r.behavior[k].lifetimeDescription).toBe("");
      // back to Yes starts a fresh (null) count — 0 is not a valid Yes count
      r = setBehaviorAnswer(r, k, "lifetime", "yes");
      expect(r.behavior[k].lifetimeCount).toBeNull();
      // stale count with unanswered
      const stale = emptyFullLifetimeResponses();
      stale.behavior[k].past3MonthsCount = 5;
      expect(
        normalizeBehaviorAttempts(stale).behavior[k]
          .past3MonthsCount,
      ).toBeNull();
    },
  );

  it("non-suicidal self-injury is Yes/No only", () => {
    let r = setBehaviorAnswer(
      emptyFullLifetimeResponses(),
      "nonSuicidalSelfInjury",
      "lifetime",
      "yes",
    );
    r = setBehaviorDescription(
      r,
      "nonSuicidalSelfInjury",
      "lifetime",
      "x",
    );
    r = setBehaviorCount(
      r,
      "nonSuicidalSelfInjury",
      "lifetime",
      3,
    );
    expect(
      r.behavior.nonSuicidalSelfInjury.lifetimeDescription,
    ).toBe("");
    expect(
      r.behavior.nonSuicidalSelfInjury.lifetimeCount,
    ).toBeNull();
    expect(isAttemptDetailsApplicable(r)).toBe(false);
  });
});

describe("count validation", () => {
  const err = (count: number | null) => {
    let r = setBehaviorAnswer(
      allNo(),
      "interruptedAttempt",
      "lifetime",
      "yes",
    );
    r = setBehaviorCount(
      r,
      "interruptedAttempt",
      "lifetime",
      count,
    );
    return validateBehaviorAttempts(r)[
      behaviorErrorKey(
        "interruptedAttempt",
        "lifetime",
        "count",
      )
    ];
  };
  it("requires a positive whole number for Yes", () => {
    expect(err(1)).toBeUndefined();
    expect(err(12)).toBeUndefined();
    for (const bad of [null, 0, -1, 1.5, NaN, Infinity])
      expect(err(bad as number | null)).toBe(
        "Enter a whole number greater than 0.",
      );
  });
  it("parses count text strictly", () => {
    expect(parseCountText("")).toBeNull();
    expect(parseCountText(" 7 ")).toBe(7);
    for (const bad of ["abc", "1.5", "-2", "1e2", "0x1", "2 3"])
      expect(parseCountText(bad)).toBe("invalid");
  });
  it("requires an explicit answer for every category and both periods", () => {
    const keys = Object.keys(
      validateBehaviorAttempts(emptyFullLifetimeResponses()),
    );
    // 5 categories × 2 periods, plus Actual Attempt questions 2–9 × 2 periods.
    expect(keys).toHaveLength(26);
    expect(keys).toContain(
      behaviorErrorKey("nonSuicidalSelfInjury", "past3Months"),
    );
  });
  it("descriptions stay optional", () => {
    expect(
      validateBehaviorAttempts(validFullLifetime()),
    ).toEqual({});
  });
});

describe("Section 4 trigger and details", () => {
  it("only Actual Attempt = Yes in either period triggers it", () => {
    let r = allNo();
    for (const k of [
      "interruptedAttempt",
      "abortedAttempt",
      "preparatoryActs",
      "nonSuicidalSelfInjury",
    ] as BehaviorKey[]) {
      r = setBehaviorAnswer(r, k, "lifetime", "yes");
      r = setBehaviorAnswer(r, k, "past3Months", "yes");
    }
    expect(isAttemptDetailsApplicable(r)).toBe(false);
    expect(
      isAttemptDetailsApplicable(
        setBehaviorAnswer(
          r,
          "actualAttempt",
          "past3Months",
          "yes",
        ),
      ),
    ).toBe(true);
    expect(
      isAttemptDetailsApplicable(
        setBehaviorAnswer(
          r,
          "actualAttempt",
          "lifetime",
          "yes",
        ),
      ),
    ).toBe(true);
  });

  it("requires date and Actual Lethality in all three groups when it applies", () => {
    let r = setBehaviorAnswer(
      allNo(),
      "actualAttempt",
      "lifetime",
      "yes",
    );
    r = setBehaviorCount(r, "actualAttempt", "lifetime", 1);
    const e = validateBehaviorAttempts(r);
    for (const g of [
      "mostRecent",
      "mostLethal",
      "initial",
    ] as const) {
      expect(e[attemptErrorKey(g, "date")]).toBeTruthy();
      expect(
        e[attemptErrorKey(g, "actualLethality")],
      ).toBeTruthy();
    }
  });

  it("the same event may fill several groups; nothing picks the most lethal", () => {
    expect(
      validateBehaviorAttempts(validFullLifetime()),
    ).toEqual({}); // 3 identical groups
  });

  it("Potential Lethality is required only for Actual 0 (0 is valid, null unanswered)", () => {
    let r = validFullLifetime();
    r = setAttemptField(r, "mostRecent", {
      potentialLethality: null,
    });
    expect(
      validateBehaviorAttempts(r)[
        attemptErrorKey("mostRecent", "potentialLethality")
      ],
    ).toBeTruthy();
    r = setAttemptField(r, "mostRecent", {
      potentialLethality: 0,
    });
    expect(validateBehaviorAttempts(r)).toEqual({});
    r = setAttemptField(r, "mostRecent", {
      actualLethality: 3,
    });
    expect(r.attempts.mostRecent.potentialLethality).toBeNull(); // cleared for that group only
    expect(r.attempts.mostLethal.potentialLethality).toBe(1);
    expect(validateBehaviorAttempts(r)).toEqual({});
  });

  it("rejects out-of-range codes and bad dates", () => {
    let r = validFullLifetime();
    r = setAttemptField(r, "initial", {
      actualLethality: 6,
      date: "2026-13-40",
    });
    r = setAttemptField(r, "mostLethal", {
      actualLethality: -1,
    });
    const e = validateBehaviorAttempts(r);
    expect(
      e[attemptErrorKey("initial", "actualLethality")],
    ).toBeTruthy();
    expect(e[attemptErrorKey("initial", "date")]).toBeTruthy();
    expect(
      e[attemptErrorKey("mostLethal", "actualLethality")],
    ).toBeTruthy();
    r = setAttemptField(validFullLifetime(), "initial", {
      potentialLethality: 3,
    });
    expect(
      validateBehaviorAttempts(r)[
        attemptErrorKey("initial", "potentialLethality")
      ],
    ).toBeTruthy();
  });

  it("clears all attempt details when neither period is Yes; keeps them while one is", () => {
    let r = validFullLifetime(); // Lifetime Yes
    r = setBehaviorAnswer(
      r,
      "actualAttempt",
      "past3Months",
      "yes",
    );
    r = setBehaviorCount(r, "actualAttempt", "past3Months", 1);
    r = setBehaviorAnswer(r, "actualAttempt", "lifetime", "no");
    expect(r.attempts.mostRecent.date).toBe("2026-01-02"); // other period still Yes
    r = setBehaviorAnswer(
      r,
      "actualAttempt",
      "past3Months",
      "no",
    );
    for (const g of [
      "mostRecent",
      "mostLethal",
      "initial",
    ] as const)
      expect(r.attempts[g]).toEqual({
        date: "",
        actualLethality: null,
        potentialLethality: null,
        description: "",
      });
    expect(validateBehaviorAttempts(r)).toEqual({});
  });

  it("lethality options carry their numeric codes", () => {
    expect(
      ACTUAL_LETHALITY_OPTIONS.map((o) => o.value),
    ).toEqual([0, 1, 2, 3, 4, 5]);
    expect(
      POTENTIAL_LETHALITY_OPTIONS.map((o) => o.value),
    ).toEqual([0, 1, 2]);
    expect(actualLethalityText(5)).toBe("5 – Death.");
    expect(actualLethalityText(0)).toBe(
      "0 – No physical damage or very minor physical damage.",
    );
  });
});

describe("composition across all four sections", () => {
  it("a complete payload is valid and untouched by normalization", () => {
    const r = validFullLifetime();
    expect(
      validateFullLifetime({
        assessmentDate: "2026-03-01",
        responses: r,
      }),
    ).toEqual({});
    expect(normalizeFullLifetime(r)).toEqual(r);
    expect(isFullLifetimeResponses(r)).toBe(true);
  });

  it("changing Ideation does not disturb Behavior, and vice versa", () => {
    let r = validFullLifetime();
    const before =
      JSON.stringify(r.behavior) + JSON.stringify(r.attempts);
    r = setIdeationAnswer(r, "wishToBeDead", "lifetime", "no"); // wipes Lifetime intensity
    expect(
      JSON.stringify(r.behavior) + JSON.stringify(r.attempts),
    ).toBe(before);
    const ideation =
      JSON.stringify(r.ideation) + JSON.stringify(r.intensity);
    r = setBehaviorAnswer(r, "actualAttempt", "lifetime", "no");
    expect(
      JSON.stringify(r.ideation) + JSON.stringify(r.intensity),
    ).toBe(ideation);
  });

  it("orders focus: date, ideation/intensity, behavior, attempts", () => {
    const order = fullLifetimeErrorOrder(validFullLifetime());
    expect(order[0]).toBe("assessmentDate");
    expect(
      order.indexOf("ideation.wishToBeDead.lifetime"),
    ).toBeLessThan(
      order.indexOf("intensity.lifetime.typeNumber"),
    );
    expect(
      order.indexOf("intensity.recent.reasonsForIdeation"),
    ).toBeLessThan(
      order.indexOf("behavior.actualAttempt.lifetime"),
    );
    expect(
      order.indexOf(
        "behavior.preparatoryActs.past3Months.count",
      ),
    ).toBeLessThan(order.indexOf("attempts.mostRecent.date"));
  });
});

describe("store boundary rejects incomplete or inconsistent payloads", () => {
  const create = (
    responses = validFullLifetime(),
    assessmentDate = "2026-03-01",
  ) =>
    createCssrsAssessment({
      instrument: "cssrs-full-lifetime",
      ownership: own,
      assessmentDate,
      responses,
    });
  const saved = () => {
    const r = getCssrsAssessments();
    return r.status === "ok" ? r.records : [];
  };

  it("refuses an empty, partial or inconsistent payload (and writes nothing)", () => {
    expect(create(emptyFullLifetimeResponses())).toMatchObject({
      ok: false,
      reason: "invalid",
    });
    const partial = validFullLifetime();
    partial.behavior.abortedAttempt.lifetime = "unanswered";
    expect(create(partial).ok).toBe(false);
    const badType = validFullLifetime();
    badType.mostSevereIdeation.lifetime.typeNumber = 4; // highest Yes is Q1
    expect(create(badType).ok).toBe(false);
    const badCount = validFullLifetime();
    badCount.behavior.actualAttempt.lifetimeCount = 1.5;
    expect(create(badCount).ok).toBe(false);
    expect(create(validFullLifetime(), "").ok).toBe(false);
    expect(saved()).toHaveLength(0);
  });

  it("creates a valid record, and an update cannot make it invalid or change ownership", () => {
    const made = create();
    if (!made.ok) throw new Error(JSON.stringify(made));
    const bad = updateCssrsAssessment(
      made.record.id,
      (prev) => {
        const responses = structuredClone(
          prev.responses,
        ) as ReturnType<typeof validFullLifetime>;
        responses.behavior.preparatoryActs.lifetime =
          "unanswered";
        return { responses };
      },
    );
    expect(bad).toMatchObject({ ok: false, reason: "invalid" });
    const ok = updateCssrsAssessment(made.record.id, (prev) => {
      const responses = structuredClone(
        prev.responses,
      ) as ReturnType<typeof validFullLifetime>;
      responses.behavior.actualAttempt.lifetimeCount = 5;
      return { responses };
    });
    expect(ok.ok).toBe(true);
    const rec = saved()[0];
    expect(rec.id).toBe(made.record.id);
    expect(rec.admissionsRecordId).toBe("L-1");
    if (rec.instrument !== "cssrs-full-lifetime")
      throw new Error();
    expect(
      rec.responses.behavior.actualAttempt.lifetimeCount,
    ).toBe(5);
    expect(saved()).toHaveLength(1);
  });
});