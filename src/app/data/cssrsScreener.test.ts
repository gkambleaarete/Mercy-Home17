// @vitest-environment jsdom
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  CSSRS_STORAGE_KEY,
  __reloadCssrsForTest,
  __resetCssrsForTest,
  cssrsAsTestRows,
  cssrsForYouth,
  getCssrsAssessments,
  updateCssrsAssessment,
  createCssrsAssessment,
} from "./cssrsAssessmentStore";
import {
  SCREENER_QUESTIONS,
  SCREENER_SUMMARY,
  activeScreenerQuestions,
  classifyScreenerAnswer,
  classifyScreenerQuestion,
  firstScreenerErrorKey,
  normalizeScreenerResponses,
  setScreenerAnswer,
  validateScreener,
  type ScreenerQuestionKey,
} from "./cssrsScreener";
import { saveCssrsScreener } from "./cssrsScreenerSave";
import {
  emptyScreenerResponses,
  type ScreenerResponses,
} from "./cssrsTypes";

const ownership = {
  admissionsRecordId: "L-100",
  youthKey: "Y-001",
  youthConstituentId: null,
};
const answers = (
  r: ScreenerResponses,
  pairs: Array<[ScreenerQuestionKey, "yes" | "no"]>,
) =>
  pairs.reduce(
    (acc, [k, v]) => setScreenerAnswer(acc, k, v),
    r,
  );
/** A fully answered, valid path. */
const complete = () =>
  answers(emptyScreenerResponses(), [
    ["wishToBeDead", "yes"],
    ["suicidalThoughts", "no"],
    ["behavior", "no"],
  ]);
const save = (
  over: Partial<Parameters<typeof saveCssrsScreener>[0]> = {},
) =>
  saveCssrsScreener({
    editingId: null,
    ownership,
    assessmentDate: "2026-03-01",
    responses: complete(),
    eligibleIncidentReportIds: [],
    ...over,
  });
const saved = () => {
  const r = getCssrsAssessments();
  if (r.status !== "ok") throw new Error("unreadable");
  return r.records;
};

beforeEach(() => __resetCssrsForTest());
afterEach(() => vi.restoreAllMocks());

describe("wording and order", () => {
  it("keeps the approved wording", () => {
    expect(SCREENER_QUESTIONS.wishToBeDead.text).toBe(
      "Have you wished you were dead or wished you could go to sleep and not wake up?",
    );
    expect(SCREENER_QUESTIONS.suicidalThoughts.text).toBe(
      "Have you actually had any thoughts of killing yourself?",
    );
    expect(SCREENER_QUESTIONS.method.text).toBe(
      "Have you been thinking about how you might do this?",
    );
    expect(SCREENER_QUESTIONS.intent.text).toBe(
      "Have you had these thoughts and had some intention of acting on them?",
    );
    expect(SCREENER_QUESTIONS.plan.text).toBe(
      "Have you started to work out or worked out the details of how to kill yourself? Did you intend to carry out this plan?",
    );
    expect(SCREENER_QUESTIONS.behavior.text).toBe(
      "Have you ever done anything, started to do anything, or prepared to do anything to end your life?",
    );
    expect(SCREENER_QUESTIONS.behaviorPast3Months.text).toBe(
      "Was this within the past three months?",
    );
    expect(SCREENER_QUESTIONS.method.help).toContain(
      "I thought about taking an overdose",
    );
    expect(SCREENER_QUESTIONS.intent.help).toContain(
      "As opposed to",
    );
    expect(SCREENER_QUESTIONS.behavior.help).toMatch(
      /^Examples: Took pills/,
    );
  });

  it("starts every response unanswered", () => {
    const r = emptyScreenerResponses();
    activeScreenerQuestions(
      setScreenerAnswer(
        setScreenerAnswer(r, "suicidalThoughts", "yes"),
        "behavior",
        "yes",
      ),
    ).forEach((k) =>
      expect(
        k === "behaviorPast3Months"
          ? r.behaviorPast3Months
          : r.items[k].answer,
      ).toBe("unanswered"),
    );
  });
});

describe("conditional flow", () => {
  it("Q2 = No (or unanswered) skips Q3–Q5", () => {
    const r = emptyScreenerResponses();
    expect(activeScreenerQuestions(r)).toEqual([
      "wishToBeDead",
      "suicidalThoughts",
      "behavior",
    ]);
    expect(
      activeScreenerQuestions(
        setScreenerAnswer(r, "suicidalThoughts", "no"),
      ),
    ).toEqual(["wishToBeDead", "suicidalThoughts", "behavior"]);
  });

  it("Q2 = Yes shows Q3–Q5 between Q2 and Q6", () => {
    const r = setScreenerAnswer(
      emptyScreenerResponses(),
      "suicidalThoughts",
      "yes",
    );
    expect(activeScreenerQuestions(r)).toEqual([
      "wishToBeDead",
      "suicidalThoughts",
      "method",
      "intent",
      "plan",
      "behavior",
    ]);
  });

  it("changing Q2 away from Yes clears Q3–Q5", () => {
    let r = answers(emptyScreenerResponses(), [
      ["suicidalThoughts", "yes"],
      ["method", "yes"],
      ["intent", "no"],
      ["plan", "yes"],
    ]);
    r = setScreenerAnswer(r, "suicidalThoughts", "no");
    expect(r.items.method.answer).toBe("unanswered");
    expect(r.items.intent.answer).toBe("unanswered");
    expect(r.items.plan.answer).toBe("unanswered");
  });

  it("Q6 controls its follow-up and clears it", () => {
    let r = emptyScreenerResponses();
    expect(activeScreenerQuestions(r)).not.toContain(
      "behaviorPast3Months",
    );
    r = answers(r, [
      ["behavior", "yes"],
      ["behaviorPast3Months", "yes"],
    ]);
    expect(activeScreenerQuestions(r)).toContain(
      "behaviorPast3Months",
    );
    r = setScreenerAnswer(r, "behavior", "no");
    expect(r.behaviorPast3Months).toBe("unanswered");
    expect(activeScreenerQuestions(r)).not.toContain(
      "behaviorPast3Months",
    );
  });

  it("normalizes hidden stale answers at the save boundary", () => {
    const stale = emptyScreenerResponses();
    stale.items.suicidalThoughts.answer = "no";
    stale.items.method.answer = "yes";
    stale.items.behavior.answer = "no";
    stale.behaviorPast3Months = "yes";
    const clean = normalizeScreenerResponses(stale);
    expect(clean.items.method.answer).toBe("unanswered");
    expect(clean.behaviorPast3Months).toBe("unanswered");
    // Another caller going straight to the store cannot persist them either.
    const made = createCssrsAssessment({
      instrument: "cssrs-screener",
      ownership,
      assessmentDate: "2026-03-01",
      responses: stale,
    });
    expect(made.ok).toBe(true);
    __reloadCssrsForTest();
    const r = saved()[0];
    if (r.instrument !== "cssrs-screener") throw new Error();
    expect(r.responses.items.method.answer).toBe("unanswered");
    expect(r.responses.behaviorPast3Months).toBe("unanswered");
    updateCssrsAssessment(r.id, (prev) => ({
      responses: {
        ...(prev.responses as ScreenerResponses),
        behaviorPast3Months: "yes",
      },
    }));
    const again = saved()[0];
    if (again.instrument !== "cssrs-screener")
      throw new Error();
    expect(again.responses.behaviorPast3Months).toBe(
      "unanswered",
    );
  });
});

describe("classification", () => {
  const table: Array<[ScreenerQuestionKey, string]> = [
    ["wishToBeDead", "Low Risk"],
    ["suicidalThoughts", "Low Risk"],
    ["method", "Moderate Risk"],
    ["intent", "High Risk"],
    ["plan", "High Risk"],
    ["behavior", "Moderate Risk"],
    ["behaviorPast3Months", "High Risk"],
  ];
  it.each(table)("%s: Yes → %s, No → No Risk", (key, yes) => {
    expect(classifyScreenerAnswer(key, "yes")).toBe(yes);
    expect(classifyScreenerAnswer(key, "no")).toBe("No Risk");
  });

  it("never turns unanswered into No or No Risk", () => {
    table.forEach(([k]) =>
      expect(
        classifyScreenerAnswer(k, "unanswered"),
      ).toBeNull(),
    );
  });

  it("gives skipped questions no classification", () => {
    const r = emptyScreenerResponses();
    r.items.method.answer = "yes"; // stale, hidden (Q2 not Yes)
    expect(classifyScreenerQuestion(r, "method")).toBeNull();
  });

  it("keeps the Q6 follow-up separate from Q6", () => {
    const r = answers(emptyScreenerResponses(), [
      ["behavior", "yes"],
      ["behaviorPast3Months", "no"],
    ]);
    expect(classifyScreenerQuestion(r, "behavior")).toBe(
      "Moderate Risk",
    );
    expect(
      classifyScreenerQuestion(r, "behaviorPast3Months"),
    ).toBe("No Risk");
  });

  it("has a factual summary and no aggregate result", () => {
    expect(SCREENER_SUMMARY).toBe("C-SSRS Screener completed");
  });
});

describe("validation follows the active path", () => {
  const v = (
    r: ScreenerResponses,
    date = "2026-03-01",
    ids: string[] = [],
  ) =>
    validateScreener({
      assessmentDate: date,
      responses: r,
      eligibleIncidentReportIds: ids,
    });

  it("requires the date and Q1, Q2 and Q6 only when nothing is shown", () => {
    expect(
      Object.keys(v(emptyScreenerResponses(), "")),
    ).toEqual([
      "assessmentDate",
      "wishToBeDead",
      "suicidalThoughts",
      "behavior",
    ]);
  });

  it("Q2 = Yes requires Q3–Q5; Q6 = Yes requires its follow-up", () => {
    const r = answers(emptyScreenerResponses(), [
      ["wishToBeDead", "no"],
      ["suicidalThoughts", "yes"],
      ["behavior", "yes"],
    ]);
    expect(Object.keys(v(r))).toEqual([
      "method",
      "intent",
      "plan",
      "behaviorPast3Months",
    ]);
  });

  it("does not require hidden questions", () => {
    expect(v(complete())).toEqual({});
  });

  it("orders focus: date, questions top to bottom, then Related IR", () => {
    const r = emptyScreenerResponses();
    r.relatedIncidentReportId = "7";
    const errors = v(r, "");
    expect(firstScreenerErrorKey(errors, r)).toBe(
      "assessmentDate",
    );
    expect(
      firstScreenerErrorKey(
        { ...errors, assessmentDate: undefined },
        r,
      ),
    ).toBe("wishToBeDead");
    expect(
      firstScreenerErrorKey(
        { relatedIncidentReportId: "x" },
        r,
      ),
    ).toBe("relatedIncidentReportId");
  });

  it("validates Related IR eligibility at save time and never drops it silently", () => {
    const r = { ...complete(), relatedIncidentReportId: "7" };
    expect(v(r, "2026-03-01", ["7"])).toEqual({});
    expect(
      v(r, "2026-03-01", []).relatedIncidentReportId,
    ).toBeTruthy();
    const res = save({
      responses: r,
      eligibleIncidentReportIds: [],
    });
    expect(res).toMatchObject({ ok: false, reason: "invalid" });
    expect(saved()).toHaveLength(0);
  });
});

describe("save, reopen, edit", () => {
  it("refuses an incomplete Screener without writing", () => {
    const res = save({ responses: emptyScreenerResponses() });
    expect(res).toMatchObject({ ok: false, reason: "invalid" });
    expect(saved()).toHaveLength(0);
    expect(localStorage.getItem(CSSRS_STORAGE_KEY)).toBeNull();
  });

  it("refuses a new record with no Admissions owner", () => {
    const res = save({
      ownership: { ...ownership, admissionsRecordId: null },
    });
    expect(res).toMatchObject({ ok: false, reason: "owner" });
    expect(saved()).toHaveLength(0);
  });

  it("creates, restores after refresh, and edits without a duplicate or owner change", () => {
    const first = save({
      ownership: { ...ownership, youthConstituentId: "1" },
    });
    if (!first.ok) throw new Error();
    __reloadCssrsForTest();
    expect(saved()).toHaveLength(1);
    const edited = save({
      editingId: first.record.id,
      // Opened from a DIFFERENT Admissions record of the same youth.
      ownership: {
        admissionsRecordId: "L-200",
        youthKey: "Y-001",
        youthConstituentId: null,
      },
      assessmentDate: "2026-03-05",
      responses: answers(complete(), [["wishToBeDead", "no"]]),
    });
    expect(edited.ok).toBe(true);
    __reloadCssrsForTest();
    const all = saved();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(first.record.id);
    expect(all[0].admissionsRecordId).toBe("L-100");
    expect(all[0].youthConstituentId).toBe("1");
    expect(all[0].assessmentDate).toBe("2026-03-05");
    if (all[0].instrument !== "cssrs-screener")
      throw new Error();
    expect(all[0].responses.items.wishToBeDead.answer).toBe(
      "no",
    );
  });

  it("lists the saved record through the adapter with a factual summary", () => {
    save();
    const rows = cssrsAsTestRows(
      cssrsForYouth(getCssrsAssessments(), "Y-001"),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      test: "C-SSRS Screener",
      summary: "C-SSRS Screener completed",
      date: "2026-03-01",
      source: "cssrs",
    });
  });

  it("Cancel (never calling save) leaves the saved record unchanged", () => {
    const first = save();
    if (!first.ok) throw new Error();
    const before = localStorage.getItem(CSSRS_STORAGE_KEY);
    // A draft is edited in component state only…
    const draft = setScreenerAnswer(
      complete(),
      "wishToBeDead",
      "no",
    );
    expect(draft.items.wishToBeDead.answer).toBe("no");
    // …and discarding it touches nothing.
    __reloadCssrsForTest();
    expect(localStorage.getItem(CSSRS_STORAGE_KEY)).toBe(
      before,
    );
  });

  it("a storage failure returns an error and keeps the saved record", () => {
    const first = save();
    if (!first.ok) throw new Error();
    const before = localStorage.getItem(CSSRS_STORAGE_KEY);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      () => {
        throw new DOMException("full", "QuotaExceededError");
      },
    );
    const failedCreate = save({ assessmentDate: "2026-04-01" });
    const failedEdit = save({
      editingId: first.record.id,
      assessmentDate: "2026-04-02",
    });
    expect(failedCreate).toMatchObject({
      ok: false,
      reason: "storage",
    });
    expect(failedEdit).toMatchObject({
      ok: false,
      reason: "storage",
    });
    expect(failedEdit.ok === false && failedEdit.error).toMatch(
      /could not be saved/,
    );
    vi.restoreAllMocks();
    expect(localStorage.getItem(CSSRS_STORAGE_KEY)).toBe(
      before,
    );
    expect(saved()).toHaveLength(1);
    expect(saved()[0].assessmentDate).toBe("2026-03-01");
  });
});