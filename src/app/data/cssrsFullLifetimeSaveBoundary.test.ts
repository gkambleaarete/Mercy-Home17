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
  getCssrsAssessments,
} from "./cssrsAssessmentStore";
import { saveCssrsFullLifetime } from "./cssrsFullLifetimeSave";
import { saveCssrsScreener } from "./cssrsScreenerSave";
import {
  fullLifetimeErrorOrder,
  validateFullLifetime,
} from "./cssrsFullLifetimeRules";
import {
  INTENSITY_QUESTIONS,
  setIdeationAnswer,
  setIntensityRating,
  setMostSevereIdeation,
} from "./cssrsFullLifetime";
import { setBehaviorAnswer } from "./cssrsFullLifetimeBehavior";
import { fullLifetimeFieldFocusId } from "../components/admissions/CssrsFullLifetimeFields";
import { validFullLifetime } from "./cssrsTestFixtures";
import {
  emptyFullLifetimeResponses,
  emptyScreenerResponses,
} from "./cssrsTypes";
import { setScreenerAnswer } from "./cssrsScreener";

const owner = {
  admissionsRecordId: "L-100",
  youthKey: "Y-001",
  youthConstituentId: "1",
};
const saved = () => {
  const r = getCssrsAssessments();
  if (r.status !== "ok") throw new Error("unreadable");
  return r.records;
};

beforeEach(() => __resetCssrsForTest());
afterEach(() => vi.restoreAllMocks());

describe("Full Lifetime create/edit preserve identity", () => {
  it("keeps ID, owner, youth, Constituent link and test type; updates only date and responses", () => {
    const made = saveCssrsFullLifetime({
      editingId: null,
      ownership: owner,
      assessmentDate: "2026-03-01",
      responses: validFullLifetime(),
    });
    if (!made.ok) throw new Error(JSON.stringify(made));
    expect(made.record).toMatchObject({
      admissionsRecordId: "L-100",
      youthKey: "Y-001",
      youthConstituentId: "1",
      testType: "C-SSRS Full-Lifetime",
      instrument: "cssrs-full-lifetime",
      assessmentDate: "2026-03-01",
    });
    const responses = validFullLifetime();
    responses.behavior.actualAttempt.lifetimeCount = 7;
    // Edited while viewing a shared youth list from a DIFFERENT Admissions record.
    const edited = saveCssrsFullLifetime({
      editingId: made.record.id,
      ownership: {
        admissionsRecordId: "L-200",
        youthKey: "Y-001",
        youthConstituentId: null,
      },
      assessmentDate: "2026-03-09",
      responses,
    });
    expect(edited.ok).toBe(true);
    __reloadCssrsForTest();
    const all = saved();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({
      id: made.record.id,
      admissionsRecordId: "L-100",
      youthKey: "Y-001",
      youthConstituentId: "1",
      testType: "C-SSRS Full-Lifetime",
      assessmentDate: "2026-03-09",
    });
    if (all[0].instrument !== "cssrs-full-lifetime")
      throw new Error();
    expect(
      all[0].responses.behavior.actualAttempt.lifetimeCount,
    ).toBe(7);
  });

  it("an unverified Constituent stays empty; a Constituent profile cannot own a new record", () => {
    const own = saveCssrsFullLifetime({
      editingId: null,
      ownership: { ...owner, youthConstituentId: null },
      assessmentDate: "2026-03-01",
      responses: validFullLifetime(),
    });
    expect(own.ok && own.record.youthConstituentId).toBeNull();
    const none = saveCssrsFullLifetime({
      editingId: null,
      ownership: {
        admissionsRecordId: null,
        youthKey: "1",
        youthConstituentId: "1",
      },
      assessmentDate: "2026-03-01",
      responses: validFullLifetime(),
    });
    expect(none).toMatchObject({ ok: false, reason: "owner" });
    expect(saved()).toHaveLength(1);
  });

  it("never edits a record of the other test type (no crash, nothing changed)", () => {
    const shot = saveCssrsScreener({
      editingId: null,
      ownership: owner,
      assessmentDate: "2026-03-01",
      responses: setScreenerAnswer(
        setScreenerAnswer(
          setScreenerAnswer(
            emptyScreenerResponses(),
            "wishToBeDead",
            "no",
          ),
          "suicidalThoughts",
          "no",
        ),
        "behavior",
        "no",
      ),
      eligibleIncidentReportIds: [],
    });
    if (!shot.ok) throw new Error();
    const before = localStorage.getItem(CSSRS_STORAGE_KEY);
    const res = saveCssrsFullLifetime({
      editingId: shot.record.id,
      ownership: owner,
      assessmentDate: "2026-03-05",
      responses: validFullLifetime(),
    });
    expect(res).toMatchObject({ ok: false, reason: "invalid" });
    const res2 = saveCssrsScreener({
      editingId: shot.record.id,
      ownership: owner,
      assessmentDate: "2026-03-05",
      responses: emptyScreenerResponses(),
      eligibleIncidentReportIds: [],
    });
    expect(res2.ok).toBe(false);
    expect(localStorage.getItem(CSSRS_STORAGE_KEY)).toBe(
      before,
    );
  });
});

describe("failed write", () => {
  it("leaves the saved record byte-for-byte unchanged and reports the error", () => {
    const made = saveCssrsFullLifetime({
      editingId: null,
      ownership: owner,
      assessmentDate: "2026-03-01",
      responses: validFullLifetime(),
    });
    if (!made.ok) throw new Error();
    const before = localStorage.getItem(CSSRS_STORAGE_KEY);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      () => {
        throw new DOMException("full", "QuotaExceededError");
      },
    );
    const edited = validFullLifetime();
    edited.behavior.actualAttempt.lifetimeCount = 9;
    const failedEdit = saveCssrsFullLifetime({
      editingId: made.record.id,
      ownership: owner,
      assessmentDate: "2026-04-01",
      responses: edited,
    });
    const failedCreate = saveCssrsFullLifetime({
      editingId: null,
      ownership: owner,
      assessmentDate: "2026-04-01",
      responses: validFullLifetime(),
    });
    expect(failedEdit).toMatchObject({
      ok: false,
      reason: "storage",
    });
    expect(failedEdit.ok === false && failedEdit.error).toMatch(
      /could not be saved/,
    );
    expect(failedCreate).toMatchObject({
      ok: false,
      reason: "storage",
    });
    vi.restoreAllMocks();
    expect(localStorage.getItem(CSSRS_STORAGE_KEY)).toBe(
      before,
    );
    __reloadCssrsForTest();
    expect(saved()).toHaveLength(1);
    expect(saved()[0].assessmentDate).toBe("2026-03-01");
  });
});

describe("persisted payload versions", () => {
  it("does not load a record whose payload version is not supported, and leaves it untouched", () => {
    const made = saveCssrsFullLifetime({
      editingId: null,
      ownership: owner,
      assessmentDate: "2026-03-01",
      responses: validFullLifetime(),
    });
    if (!made.ok) throw new Error();
    const stored = JSON.parse(
      localStorage.getItem(CSSRS_STORAGE_KEY)!,
    );
    stored.records[0].responses.version = 3;
    const future = JSON.stringify(stored);
    localStorage.setItem(CSSRS_STORAGE_KEY, future);
    __reloadCssrsForTest();
    expect(getCssrsAssessments()).toMatchObject({
      status: "error",
    });
    expect(
      saveCssrsFullLifetime({
        editingId: null,
        ownership: owner,
        assessmentDate: "2026-03-01",
        responses: validFullLifetime(),
      }).ok,
    ).toBe(false);
    expect(localStorage.getItem(CSSRS_STORAGE_KEY)).toBe(
      future,
    );
  });
});

describe("first invalid control", () => {
  it("is exactly the first missing Intensity field when everything earlier is valid", () => {
    // Valid Ideation (Lifetime Q1 Yes, all else No), Type Number chosen,
    // Frequency and Duration rated — Controllability is the first gap.
    let r = emptyFullLifetimeResponses();
    r = setIdeationAnswer(r, "wishToBeDead", "lifetime", "yes");
    r = setIdeationAnswer(
      r,
      "nonSpecificActiveThoughts",
      "lifetime",
      "no",
    );
    r = setIdeationAnswer(
      r,
      "wishToBeDead",
      "past1Month",
      "no",
    );
    r = setIdeationAnswer(
      r,
      "nonSpecificActiveThoughts",
      "past1Month",
      "no",
    );
    r = setMostSevereIdeation(r, "lifetime", { typeNumber: 1 });
    r = setIntensityRating(r, "frequency", "lifetime", 2);
    r = setIntensityRating(r, "duration", "lifetime", 3);
    const errors = validateFullLifetime({
      assessmentDate: "2026-03-01",
      responses: r,
    });
    // Behavior is entirely unanswered too, so a wrong order would land there.
    expect(
      Object.keys(errors).some((k) =>
        k.startsWith("behavior."),
      ),
    ).toBe(true);
    const first = fullLifetimeErrorOrder(r).find(
      (k) => errors[k],
    );
    expect(first).toBe("intensity.lifetime.controllability");
    expect(
      fullLifetimeFieldFocusId("cssrs-fl-new", first!),
    ).toBe("cssrs-fl-new-intensity-lifetime-controllability");
    // Completing it moves the first error to the next gap, not elsewhere.
    r = setIntensityRating(r, "controllability", "lifetime", 0);
    const next = fullLifetimeErrorOrder(r).find(
      (k) =>
        validateFullLifetime({
          assessmentDate: "2026-03-01",
          responses: r,
        })[k],
    );
    expect(next).toBe("intensity.lifetime.deterrents");
    // sanity: a complete payload has no first error
    expect(
      fullLifetimeErrorOrder(validFullLifetime()).find(
        (k) =>
          validateFullLifetime({
            assessmentDate: "2026-03-01",
            responses: validFullLifetime(),
          })[k],
      ),
    ).toBeUndefined();
    expect(INTENSITY_QUESTIONS.length).toBe(5);
    expect(setBehaviorAnswer).toBeTypeOf("function");
  });
});