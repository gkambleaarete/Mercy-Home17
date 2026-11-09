// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CSSRS_STORAGE_KEY,
  __reloadCssrsForTest,
  __resetCssrsForTest,
  getCssrsAssessments,
} from "./cssrsAssessmentStore";
import { saveCssrsFullLifetime } from "./cssrsFullLifetimeSave";
import {
  ACTUAL_ATTEMPT_QUESTIONS,
  followUpErrorKey,
  getActualAttemptAnswer,
  getActualAttemptDescription,
  isAttemptDetailsApplicable,
  setBehaviorAnswer,
  setBehaviorCount,
  setFollowUpAnswer,
  setFollowUpDescription,
  validateBehaviorAttempts,
} from "./cssrsFullLifetimeBehavior";
import { validFullLifetime } from "./cssrsTestFixtures";
import {
  ACTUAL_ATTEMPT_FOLLOW_UP_IDS,
  emptyFullLifetimeResponses,
  isFullLifetimeResponses,
  upgradeFullLifetimeResponses,
} from "./cssrsTypes";

const owner = {
  admissionsRecordId: "L-100",
  youthKey: "Y-001",
  youthConstituentId: "1",
};
const P = ["lifetime", "past3Months"] as const;

/** A version 1 record exactly as it was saved before the nine questions. */
const legacyPayload = () => {
  const r: any = structuredClone(validFullLifetime());
  r.version = 1;
  delete r.actualAttemptQuestions;
  r.behavior.actualAttempt.lifetimeDescription =
    "Legacy narrative";
  return r;
};

beforeEach(() => __resetCssrsForTest());

describe("nine questions", () => {
  it("are in the requested order with stable ids, 18 independent groups", () => {
    expect(ACTUAL_ATTEMPT_QUESTIONS.map((q) => q.id)).toEqual([
      "madeAttempt",
      ...ACTUAL_ATTEMPT_FOLLOW_UP_IDS,
    ]);
    expect(ACTUAL_ATTEMPT_QUESTIONS[3].text).toBe(
      "What did you do?",
    );
    expect(ACTUAL_ATTEMPT_QUESTIONS[8].text).toMatch(
      /^Or did you do it purely for other reasons/,
    );
    const r = emptyFullLifetimeResponses();
    for (const q of ACTUAL_ATTEMPT_QUESTIONS)
      for (const p of P)
        expect(getActualAttemptAnswer(r, q.id, p)).toBe(
          "unanswered",
        );
    expect(ACTUAL_ATTEMPT_QUESTIONS.length * P.length).toBe(18);
  });

  it("each answer and description is independent; No clears only its own description", () => {
    let r = emptyFullLifetimeResponses();
    r = setFollowUpAnswer(r, "wantedToDie", "lifetime", "yes");
    r = setFollowUpDescription(
      r,
      "wantedToDie",
      "lifetime",
      "life",
    );
    r = setFollowUpAnswer(
      r,
      "wantedToDie",
      "past3Months",
      "yes",
    );
    r = setFollowUpDescription(
      r,
      "wantedToDie",
      "past3Months",
      "recent",
    );
    r = setFollowUpAnswer(r, "harmYourself", "lifetime", "yes");
    r = setFollowUpDescription(
      r,
      "harmYourself",
      "lifetime",
      "other",
    );
    r = setFollowUpAnswer(r, "wantedToDie", "lifetime", "no");
    expect(
      getActualAttemptDescription(r, "wantedToDie", "lifetime"),
    ).toBe("");
    expect(
      getActualAttemptDescription(
        r,
        "wantedToDie",
        "past3Months",
      ),
    ).toBe("recent");
    expect(
      getActualAttemptDescription(
        r,
        "harmYourself",
        "lifetime",
      ),
    ).toBe("other");
    expect(
      getActualAttemptAnswer(r, "harmYourself", "past3Months"),
    ).toBe("unanswered");
  });

  it("Question 1 = No keeps Question 2 = Yes and its description", () => {
    let r = emptyFullLifetimeResponses();
    r = setBehaviorAnswer(r, "actualAttempt", "lifetime", "no");
    r = setFollowUpAnswer(r, "harmYourself", "lifetime", "yes");
    r = setFollowUpDescription(
      r,
      "harmYourself",
      "lifetime",
      "kept",
    );
    expect(
      getActualAttemptDescription(
        r,
        "harmYourself",
        "lifetime",
      ),
    ).toBe("kept");
    expect(isAttemptDetailsApplicable(r)).toBe(false);
    r = setBehaviorAnswer(r, "actualAttempt", "lifetime", "no");
    expect(
      getActualAttemptAnswer(r, "harmYourself", "lifetime"),
    ).toBe("yes");
  });

  it("only Question 1 drives Attempt Details; Yes answers elsewhere never do", () => {
    let r = emptyFullLifetimeResponses();
    for (const id of ACTUAL_ATTEMPT_FOLLOW_UP_IDS)
      for (const p of P) r = setFollowUpAnswer(r, id, p, "yes");
    expect(isAttemptDetailsApplicable(r)).toBe(false);
    r = setBehaviorAnswer(
      r,
      "actualAttempt",
      "past3Months",
      "yes",
    );
    expect(isAttemptDetailsApplicable(r)).toBe(true);
  });

  it("totals follow Question 1 only, never the number of Yes answers", () => {
    let r = emptyFullLifetimeResponses();
    for (const id of ACTUAL_ATTEMPT_FOLLOW_UP_IDS)
      r = setFollowUpAnswer(r, id, "lifetime", "yes");
    expect(r.behavior.actualAttempt.lifetimeCount).toBeNull(); // unanswered stays unanswered
    r = setBehaviorAnswer(r, "actualAttempt", "lifetime", "no");
    expect(r.behavior.actualAttempt.lifetimeCount).toBe(0);
    r = setBehaviorAnswer(
      r,
      "actualAttempt",
      "lifetime",
      "yes",
    );
    expect(r.behavior.actualAttempt.lifetimeCount).toBeNull();
    r = setBehaviorCount(r, "actualAttempt", "lifetime", 3);
    expect(r.behavior.actualAttempt.lifetimeCount).toBe(3);
    expect(
      r.behavior.actualAttempt.past3MonthsCount,
    ).toBeNull(); // periods independent
  });

  it("requires every follow-up answer in both periods; descriptions stay optional", () => {
    const errors = validateBehaviorAttempts(
      emptyFullLifetimeResponses(),
    );
    for (const id of ACTUAL_ATTEMPT_FOLLOW_UP_IDS)
      for (const p of P)
        expect(errors[followUpErrorKey(id, p)]).toBeTruthy();
    expect(
      validateBehaviorAttempts(validFullLifetime()),
    ).toEqual({});
  });
});

describe("legacy (version 1) records", () => {
  it("stay readable and map nothing onto Questions 2–9", () => {
    const legacy = legacyPayload();
    expect(isFullLifetimeResponses(legacy)).toBe(true);
    expect(legacy.actualAttemptQuestions).toBeUndefined();
  });

  it("upgrade in memory only: Question 1 kept, 2–9 unanswered, counts and sections preserved", () => {
    const legacy = legacyPayload();
    const before = JSON.stringify(legacy);
    const up = upgradeFullLifetimeResponses(legacy);
    expect(JSON.stringify(legacy)).toBe(before);
    expect(up.version).toBe(2);
    expect(up.behavior).toEqual(legacy.behavior);
    expect(up.behavior.actualAttempt.lifetimeDescription).toBe(
      "Legacy narrative",
    );
    expect(up.ideation).toEqual(legacy.ideation);
    for (const id of ACTUAL_ATTEMPT_FOLLOW_UP_IDS)
      for (const p of P)
        expect(getActualAttemptAnswer(up, id, p)).toBe(
          "unanswered",
        );
    expect(
      Object.keys(validateBehaviorAttempts(up)).length,
    ).toBe(16);
  });

  it("a stored version 1 record loads, is unchanged until an explicit Save, then becomes version 2", () => {
    const made = saveCssrsFullLifetime({
      editingId: null,
      ownership: owner,
      assessmentDate: "2026-03-01",
      responses: validFullLifetime(),
    });
    if (!made.ok) throw new Error(JSON.stringify(made));
    const stored = JSON.parse(
      localStorage.getItem(CSSRS_STORAGE_KEY)!,
    );
    stored.records[0].responses = legacyPayload();
    const raw = JSON.stringify(stored);
    localStorage.setItem(CSSRS_STORAGE_KEY, raw);
    __reloadCssrsForTest();
    const read = getCssrsAssessments();
    expect(read.status).toBe("ok");
    if (read.status !== "ok") return;
    const rec = read.records[0];
    const draft = upgradeFullLifetimeResponses(
      structuredClone(rec.responses as any),
    );
    // Opening for edit (and cancelling) never writes.
    expect(localStorage.getItem(CSSRS_STORAGE_KEY)).toBe(raw);
    // Saving without answering the new questions is refused; nothing changes.
    const refused = saveCssrsFullLifetime({
      editingId: rec.id,
      ownership: owner,
      assessmentDate: rec.assessmentDate,
      responses: draft,
    });
    expect(refused.ok).toBe(false);
    expect(localStorage.getItem(CSSRS_STORAGE_KEY)).toBe(raw);
    // A legacy payload can't be written directly either.
    expect(
      saveCssrsFullLifetime({
        editingId: rec.id,
        ownership: owner,
        assessmentDate: rec.assessmentDate,
        responses: legacyPayload(),
      }).ok,
    ).toBe(false);
    expect(localStorage.getItem(CSSRS_STORAGE_KEY)).toBe(raw);
    // Answer them and save: same record, same id, now version 2.
    let done = draft;
    for (const id of ACTUAL_ATTEMPT_FOLLOW_UP_IDS)
      for (const p of P)
        done = setFollowUpAnswer(done, id, p, "no");
    const ok = saveCssrsFullLifetime({
      editingId: rec.id,
      ownership: owner,
      assessmentDate: rec.assessmentDate,
      responses: done,
    });
    expect(ok.ok).toBe(true);
    if (!ok.ok) return;
    expect(ok.record.id).toBe(rec.id);
    expect((ok.record.responses as any).version).toBe(2);
  });
});

describe("saving and restoring", () => {
  it("round-trips every follow-up answer and description through a reload", () => {
    let r = validFullLifetime();
    r = setFollowUpAnswer(r, "otherReasons", "lifetime", "yes");
    r = setFollowUpDescription(
      r,
      "otherReasons",
      "lifetime",
      "stress",
    );
    r = setFollowUpAnswer(
      r,
      "whatDidYouDo",
      "past3Months",
      "yes",
    );
    r = setFollowUpDescription(
      r,
      "whatDidYouDo",
      "past3Months",
      "narrative",
    );
    const made = saveCssrsFullLifetime({
      editingId: null,
      ownership: owner,
      assessmentDate: "2026-03-01",
      responses: r,
    });
    expect(made.ok).toBe(true);
    __reloadCssrsForTest();
    const read = getCssrsAssessments();
    if (read.status !== "ok") throw new Error("unreadable");
    const got = read.records[0].responses as any;
    expect(
      getActualAttemptDescription(
        got,
        "otherReasons",
        "lifetime",
      ),
    ).toBe("stress");
    expect(
      getActualAttemptDescription(
        got,
        "whatDidYouDo",
        "past3Months",
      ),
    ).toBe("narrative");
    expect(
      getActualAttemptAnswer(
        got,
        "otherReasons",
        "past3Months",
      ),
    ).toBe("no");
  });

  it("the store refuses an incomplete payload and a failed write keeps the saved record", () => {
    const made = saveCssrsFullLifetime({
      editingId: null,
      ownership: owner,
      assessmentDate: "2026-03-01",
      responses: validFullLifetime(),
    });
    if (!made.ok) throw new Error();
    const raw = localStorage.getItem(CSSRS_STORAGE_KEY);
    const missing = setFollowUpAnswer(
      validFullLifetime(),
      "wantedToDie",
      "lifetime",
      "unanswered",
    );
    expect(
      saveCssrsFullLifetime({
        editingId: made.record.id,
        ownership: owner,
        assessmentDate: "2026-03-01",
        responses: missing,
      }).ok,
    ).toBe(false);
    expect(localStorage.getItem(CSSRS_STORAGE_KEY)).toBe(raw);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      () => {
        throw new Error("quota");
      },
    );
    const r = setFollowUpAnswer(
      validFullLifetime(),
      "wantedToDie",
      "lifetime",
      "yes",
    );
    expect(
      saveCssrsFullLifetime({
        editingId: made.record.id,
        ownership: owner,
        assessmentDate: "2026-03-01",
        responses: r,
      }).ok,
    ).toBe(false);
    vi.restoreAllMocks();
    expect(localStorage.getItem(CSSRS_STORAGE_KEY)).toBe(raw);
  });
});