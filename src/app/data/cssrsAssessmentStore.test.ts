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
  createCssrsAssessment,
  cssrsAsTestRows,
  cssrsForAdmissionsRecord,
  cssrsForYouth,
  getCssrsAssessments,
  getUnreadableCssrsData,
  isCssrsAssessmentId,
  updateCssrsAssessment,
  type CssrsOwnership,
} from "./cssrsAssessmentStore";
import {
  emptyAttemptDetails,
  emptyFullLifetimeResponses,
  emptyScreenerResponses,
  isFullLifetimeResponses,
  isScreenerResponses,
} from "./cssrsTypes";
import { validFullLifetime } from "./cssrsTestFixtures";
import { resolveCssrsOwnership } from "../lib/cssrsOwnership";
import { testingYouthKey } from "./youthTestingAssessmentStore";

const own = (
  over: Partial<CssrsOwnership> = {},
): CssrsOwnership => ({
  admissionsRecordId: "L-100",
  youthKey: "Y-001",
  youthConstituentId: null,
  ...over,
});
const create = (ownership = own(), date = "2026-03-01") =>
  createCssrsAssessment({
    instrument: "cssrs-screener",
    ownership,
    assessmentDate: date,
  });
const records = () => {
  const r = getCssrsAssessments();
  if (r.status !== "ok") throw new Error("unreadable");
  return r.records;
};

beforeEach(() => __resetCssrsForTest());
afterEach(() => vi.restoreAllMocks());

describe("ownership", () => {
  it("keeps the Admissions id and leaves an unverified Constituent empty", () => {
    const res = create();
    expect(res.ok).toBe(true);
    const r = records()[0];
    expect(r.admissionsRecordId).toBe("L-100");
    expect(r.youthConstituentId).toBeNull();
    expect(r.youthKey).toBe("Y-001");
    expect(r.testType).toBe("C-SSRS Screener");
    expect(r.assessmentDate).toBe("2026-03-01");
  });

  it("stores a verified Constituent id when one is supplied", () => {
    create(own({ youthConstituentId: "1" }));
    expect(records()[0].youthConstituentId).toBe("1");
  });

  it("refuses a record with no Admissions id or youth key", () => {
    const a = create(own({ admissionsRecordId: "" }));
    const b = create(own({ youthKey: " " }));
    expect(a.ok).toBe(false);
    expect(b.ok).toBe(false);
    expect(records()).toHaveLength(0);
  });

  it("resolves ownership from the profile only", () => {
    // Admissions profile with the explicit demo link.
    expect(
      resolveCssrsOwnership(
        {
          id: "L-DEMO-20093",
          youthId: "Y-DEMO-20093",
          youthConstituentId: 1,
        },
        true,
      ),
    ).toEqual({
      admissionsRecordId: "L-DEMO-20093",
      youthKey: "Y-DEMO-20093",
      youthConstituentId: "1",
    });
    // Admissions profile without a link: still owns, no association.
    expect(
      resolveCssrsOwnership(
        { id: "L-100", youthId: "Y-001" },
        true,
      ),
    ).toEqual({
      admissionsRecordId: "L-100",
      youthKey: "Y-001",
      youthConstituentId: null,
    });
    // Constituent profile: its id is never an Admissions record id.
    expect(
      resolveCssrsOwnership({ id: 1 }, false),
    ).toMatchObject({
      admissionsRecordId: null,
      youthKey: "1",
    });
  });
});

describe("youth visibility", () => {
  it("isolates different youths", () => {
    create(own({ admissionsRecordId: "L-1", youthKey: "Y-A" }));
    create(own({ admissionsRecordId: "L-2", youthKey: "Y-B" }));
    const read = getCssrsAssessments();
    expect(
      cssrsForYouth(read, "Y-A").map(
        (r) => r.admissionsRecordId,
      ),
    ).toEqual(["L-1"]);
    expect(
      cssrsForYouth(read, "Y-B").map(
        (r) => r.admissionsRecordId,
      ),
    ).toEqual(["L-2"]);
    expect(cssrsForYouth(read, "Y-C")).toEqual([]);
  });

  it("keeps the originating Admissions id when the youth list is shared", () => {
    const youthKey = testingYouthKey({
      id: "L-1",
      youthId: "Y-001",
    });
    expect(
      testingYouthKey({ id: "L-2", youthId: "Y-001" }),
    ).toBe(youthKey);
    create(own({ admissionsRecordId: "L-1", youthKey }));
    create(own({ admissionsRecordId: "L-2", youthKey }));
    const read = getCssrsAssessments();
    // Both profiles see both assessments...
    expect(cssrsForYouth(read, youthKey)).toHaveLength(2);
    // ...and each still knows its owner.
    expect(cssrsForAdmissionsRecord(read, "L-1")).toHaveLength(
      1,
    );
    expect(cssrsForAdmissionsRecord(read, "L-2")).toHaveLength(
      1,
    );
    expect(
      cssrsAsTestRows(cssrsForYouth(read, youthKey)).map(
        (r) => r.admissionsRecordId,
      ),
    ).toEqual(["L-1", "L-2"]);
  });
});

describe("persistence and ids", () => {
  it("survives a reload without duplicates", () => {
    create();
    create(own(), "2026-03-02");
    __reloadCssrsForTest();
    expect(records()).toHaveLength(2);
    // A fresh page load re-reads the same single saved source.
    expect(
      JSON.parse(localStorage.getItem(CSSRS_STORAGE_KEY)!)
        .records,
    ).toHaveLength(2);
  });

  it("assigns stable string ids that cannot collide with numeric test ids", () => {
    const ids = [create(), create(), create()].map((r) =>
      r.ok ? r.record.id : "",
    );
    expect(new Set(ids).size).toBe(3);
    ids.forEach((id) => {
      expect(isCssrsAssessmentId(id)).toBe(true);
      // Existing sample test rows use numeric ids (1–12, Date.now()).
      expect(typeof id).toBe("string");
      expect(Number.isNaN(Number(id))).toBe(true);
    });
    __reloadCssrsForTest();
    const next = create();
    expect(next.ok && !ids.includes(next.record.id)).toBe(true);
  });

  it("updates against the latest saved record and never changes ownership", () => {
    const made = create(own({ youthConstituentId: "1" }));
    if (!made.ok) throw new Error();
    updateCssrsAssessment(made.record.id, (prev) => {
      const responses = structuredClone(
        prev.responses,
      ) as ReturnType<typeof emptyScreenerResponses>;
      responses.items.suicidalThoughts.answer = "yes"; // Q3–Q5 apply
      responses.items.plan.answer = "no";
      return { responses };
    });
    // A second, "stale" writer starts from what is saved now.
    const res = updateCssrsAssessment(
      made.record.id,
      (prev) => {
        const responses = structuredClone(
          prev.responses,
        ) as ReturnType<typeof emptyScreenerResponses>;
        responses.items.intent.answer = "yes";
        return { responses };
      },
    );
    expect(res.ok).toBe(true);
    const r = records()[0];
    if (r.instrument !== "cssrs-screener") throw new Error();
    expect(r.responses.items.plan.answer).toBe("no");
    expect(r.responses.items.intent.answer).toBe("yes");
    expect(r.admissionsRecordId).toBe("L-100");
    expect(r.youthConstituentId).toBe("1");
  });

  it("reports an unknown id without changing anything", () => {
    create();
    const before = localStorage.getItem(CSSRS_STORAGE_KEY);
    const res = updateCssrsAssessment("CSSRS-999999", (p) => ({
      responses: p.responses,
    }));
    expect(res).toMatchObject({
      ok: false,
      reason: "not-found",
    });
    expect(localStorage.getItem(CSSRS_STORAGE_KEY)).toBe(
      before,
    );
  });
});

describe("storage failure", () => {
  it("returns an error and leaves the saved record unchanged", () => {
    const made = create();
    if (!made.ok) throw new Error();
    const before = localStorage.getItem(CSSRS_STORAGE_KEY);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      () => {
        throw new DOMException("full", "QuotaExceededError");
      },
    );
    const created = create(own({ admissionsRecordId: "L-2" }));
    expect(created).toMatchObject({
      ok: false,
      reason: "storage",
    });
    expect(created.ok === false && created.error).toMatch(
      /could not be saved/,
    );
    const updated = updateCssrsAssessment(
      made.record.id,
      (p) => ({
        responses: (() => {
          const r = structuredClone(p.responses) as ReturnType<
            typeof emptyScreenerResponses
          >;
          r.items.plan.answer = "yes";
          return r;
        })(),
      }),
    );
    expect(updated).toMatchObject({
      ok: false,
      reason: "storage",
    });
    vi.restoreAllMocks();
    expect(localStorage.getItem(CSSRS_STORAGE_KEY)).toBe(
      before,
    );
    expect(records()).toHaveLength(1);
    const only = records()[0];
    if (only.instrument !== "cssrs-screener") throw new Error();
    expect(only.responses.items.plan.answer).toBe("unanswered");
  });
});

describe("corrupt and unsupported data", () => {
  it("treats missing storage as a fresh collection", () => {
    expect(getCssrsAssessments()).toEqual({
      status: "ok",
      records: [],
    });
  });

  it("keeps corrupt data untouched and refuses writes", () => {
    localStorage.setItem(CSSRS_STORAGE_KEY, "{not json");
    __reloadCssrsForTest();
    expect(getCssrsAssessments()).toEqual({
      status: "error",
      reason: "corrupt",
    });
    expect(create()).toMatchObject({
      ok: false,
      reason: "unreadable",
    });
    expect(localStorage.getItem(CSSRS_STORAGE_KEY)).toBe(
      "{not json",
    );
    expect(getUnreadableCssrsData()).toEqual({
      reason: "corrupt",
      raw: "{not json",
    });
  });

  it("rejects records that fail validation without overwriting them", () => {
    const bad = JSON.stringify({
      version: 1,
      nextSeq: 2,
      records: [{ id: "CSSRS-000001" }],
    });
    localStorage.setItem(CSSRS_STORAGE_KEY, bad);
    __reloadCssrsForTest();
    expect(getCssrsAssessments()).toMatchObject({
      status: "error",
      reason: "corrupt",
    });
    expect(create().ok).toBe(false);
    expect(localStorage.getItem(CSSRS_STORAGE_KEY)).toBe(bad);
  });

  it("flags an unsupported schema version and leaves it as found", () => {
    const future = JSON.stringify({
      version: 2,
      nextSeq: 1,
      records: [],
    });
    localStorage.setItem(CSSRS_STORAGE_KEY, future);
    __reloadCssrsForTest();
    expect(getCssrsAssessments()).toEqual({
      status: "error",
      reason: "unsupported-version",
    });
    expect(create().ok).toBe(false);
    expect(localStorage.getItem(CSSRS_STORAGE_KEY)).toBe(
      future,
    );
  });
});

describe("response types", () => {
  it("keeps unanswered distinct from No", () => {
    const s = emptyScreenerResponses();
    Object.values(s.items).forEach((i) =>
      expect(i.answer).toBe("unanswered"),
    );
    expect(s.behaviorPast3Months).toBe("unanswered");
    s.items.plan.answer = "no";
    expect(s.items.plan.answer).not.toBe("unanswered");
    expect(s.items.intent.answer).toBe("unanswered");
    const f = emptyFullLifetimeResponses();
    expect(f.ideation.wishToBeDead.lifetime).toBe("unanswered");
    expect(f.behavior.actualAttempt.past3Months).toBe(
      "unanswered",
    );
  });

  it("keeps numeric 0 distinct from unanswered, and survives a reload", () => {
    const f = validFullLifetime();
    expect(
      emptyFullLifetimeResponses().intensity.frequency.lifetime,
    ).toBeNull();
    f.intensity.controllability.lifetime = 0;
    expect(f.intensity.frequency.recent).toBeNull();
    const made = createCssrsAssessment({
      instrument: "cssrs-full-lifetime",
      ownership: own(),
      assessmentDate: "2026-03-01",
      responses: f,
    });
    expect(made.ok).toBe(true);
    __reloadCssrsForTest();
    const r = records()[0];
    if (r.instrument !== "cssrs-full-lifetime")
      throw new Error();
    expect(r.responses.intensity.controllability.lifetime).toBe(
      0,
    );
    expect(r.responses.intensity.frequency.recent).toBeNull();
    expect(
      r.responses.attempts.mostLethal.actualLethality,
    ).toBe(0);
    expect(
      r.responses.behavior.actualAttempt.lifetimeCount,
    ).toBe(2);
    expect(
      r.responses.behavior.actualAttempt.past3MonthsCount,
    ).toBe(0);
  });

  it("keeps periods and attempt details separate", () => {
    const f = emptyFullLifetimeResponses();
    f.ideation.intentWithPlan.lifetime = "yes";
    expect(f.ideation.intentWithPlan.past1Month).toBe(
      "unanswered",
    );
    f.behavior.abortedAttempt.past3Months = "no";
    expect(f.behavior.abortedAttempt.lifetime).toBe(
      "unanswered",
    );
    expect(f.behavior.abortedAttempt.lifetimeCount).toBeNull();
    f.attempts.initial.date = "2026-01-02";
    expect(f.attempts.mostRecent.date).toBe("");
    expect(f.attempts.mostLethal.date).toBe("");
  });

  it("returns independent empty-state objects", () => {
    const a = emptyFullLifetimeResponses();
    const b = emptyFullLifetimeResponses();
    a.ideation.wishToBeDead.lifetime = "yes";
    a.attempts.mostRecent.date = "2026-01-01";
    expect(b.ideation.wishToBeDead.lifetime).toBe("unanswered");
    expect(b.attempts.mostRecent.date).toBe("");
    expect(emptyAttemptDetails()).not.toBe(
      emptyAttemptDetails(),
    );
    const s1 = emptyScreenerResponses();
    const s2 = emptyScreenerResponses();
    s1.items.plan.description = "changed";
    expect(s2.items.plan.description).toBe("");
    expect(s1.items.plan).not.toBe(s2.items.plan);
  });

  it("carries an optional Related IR id on the Screener only", () => {
    const s = emptyScreenerResponses();
    expect(s.relatedIncidentReportId).toBeNull();
    s.relatedIncidentReportId = "IR-1";
    expect(isScreenerResponses(s)).toBe(true);
    expect(
      "relatedIncidentReportId" in emptyFullLifetimeResponses(),
    ).toBe(false);
    expect(
      isScreenerResponses(emptyFullLifetimeResponses()),
    ).toBe(false);
    expect(
      isFullLifetimeResponses(emptyScreenerResponses()),
    ).toBe(false);
  });
});