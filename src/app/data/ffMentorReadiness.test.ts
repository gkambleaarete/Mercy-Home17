// @vitest-environment jsdom
// Store-level readiness tests with the two unresolved business rules
// stood in by a test policy (vi.mock) — production keeps them unresolved.
import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("./ffMentorReadinessPolicy", () => ({
  FF_READINESS_POLICY: {
    drivingReviewApplies: () => true,
    multiProgramReferencesMet: (
      _app: unknown,
      r: { programs: { required: number }[]; received: number },
    ) => r.programs.every((p) => r.received >= p.required),
  },
}));
import {
  __reloadFFMentorApplicationsForTest,
  changeFFMentorStage,
  getFFMentorMatchReadiness,
  getFFMentorReadiness,
  saveFFChecklistAssessments,
} from "./ffMentorApplicationStore";
import { completeApplication } from "./ffMentorTestFixtures";

const KEY = "mh.ffMentorApplications.v1";
const actor = { id: "staff-test", name: "Test Staff" };
const now = new Date(2026, 9, 20, 12, 0);

function seed(stage: string | null) {
  const a = completeApplication("T-RDY", [
    "community",
    "school",
  ]);
  const other = completeApplication("T-OTHER", ["work"]);
  const raw = {
    version: 1,
    applications: { "T-RDY": a.app, "T-OTHER": other.app },
    staff: {
      "T-RDY": { ...a.staff, stage },
      "T-OTHER": { stage: "Profile" },
    },
  };
  localStorage.setItem(KEY, JSON.stringify(raw));
  __reloadFFMentorApplicationsForTest();
  return raw;
}
const saved = () => JSON.parse(localStorage.getItem(KEY)!);

beforeEach(() => localStorage.clear());

describe("readiness gate (resolved test policy)", () => {
  it("eligible evidence permits entering Ready for Match from an earlier stage", () => {
    seed("Determination");
    expect(getFFMentorMatchReadiness("T-RDY", now)).toEqual({
      verified: true,
      reasons: [],
    });
    expect(
      changeFFMentorStage("T-RDY", {
        stage: "Ready for Match",
        expectedStage: "Determination",
        actor,
        now,
      }),
    ).toMatchObject({ ok: true, changed: true });
    expect(getFFMentorReadiness("T-RDY", now)).toMatchObject({
      eligible: true,
      readyForMatch: true,
    });
  });

  it("the gate re-evaluates the latest saved data and refuses an ineligible transition", () => {
    const raw = seed("Determination");
    raw.staff["T-RDY"].documentReviews.virtus.status =
      "rejected";
    localStorage.setItem(KEY, JSON.stringify(raw)); // changed elsewhere, not reloaded
    const r = changeFFMentorStage("T-RDY", {
      stage: "Ready for Match",
      expectedStage: "Determination",
      actor,
      now,
    });
    expect(r).toMatchObject({ ok: false, reason: "not-ready" });
    expect(r.ok === false && r.reasons?.join(" ")).toContain(
      "VIRTUS",
    );
    expect(saved().staff["T-RDY"].stage).toBe("Determination");
    expect(saved().staff["T-RDY"].stageHistory).toEqual([]);
  });

  it("losing eligibility keeps the saved stage and adds no history", () => {
    seed("Determination");
    changeFFMentorStage("T-RDY", {
      stage: "Ready for Match",
      expectedStage: "Determination",
      actor,
      now,
    });
    expect(
      saveFFChecklistAssessments(
        "T-RDY",
        {
          backgroundCheck: {
            result: "Failed",
            note: "Record found",
          },
        },
        actor,
        now,
      ),
    ).toEqual({ ok: true });
    const s = saved().staff["T-RDY"];
    expect(s.stage).toBe("Ready for Match");
    expect(s.stageHistory).toHaveLength(1);
    expect(getFFMentorReadiness("T-RDY", now)).toMatchObject({
      eligible: false,
      lostEligibility: true,
    });
  });
});

describe("staff checklist assessments", () => {
  it("records actor and time, keeps unchanged items and everything else; other apps byte-identical", () => {
    const raw = seed(null);
    expect(
      saveFFChecklistAssessments(
        "T-RDY",
        {
          mentorInterview: {
            result: "Failed",
            note: "No-show",
          },
          mentorTraining: { result: "Passed" },
        },
        actor,
        now,
      ),
    ).toEqual({ ok: true });
    const s = saved();
    expect(
      s.staff["T-RDY"].checklistAssessments.mentorInterview,
    ).toMatchObject({
      result: "Failed",
      note: "No-show",
      assessedBy: "Test Staff",
      assessedById: "staff-test",
      assessedAt: "10/20/2026 12:00 PM",
    });
    expect(
      s.staff["T-RDY"].checklistAssessments.mentorTraining
        .assessedBy,
    ).toBe("Assessor");
    expect(JSON.stringify(s.applications)).toBe(
      JSON.stringify(raw.applications),
    );
    expect(JSON.stringify(s.staff["T-OTHER"])).toBe(
      JSON.stringify(raw.staff["T-OTHER"]),
    );
    expect(s.staff["T-RDY"].documentReviews).toEqual(
      raw.staff["T-RDY"].documentReviews,
    );
    expect(s.staff["T-RDY"].stageHistory).toEqual([]);
  });

  it("refuses system items, not-applicable items, bad results and missing actors", () => {
    seed(null);
    expect(
      saveFFChecklistAssessments(
        "T-RDY",
        { documentsApproved: { result: "Passed" } },
        actor,
        now,
      ),
    ).toEqual({ ok: false, reason: "invalid" });
    expect(
      saveFFChecklistAssessments(
        "T-RDY",
        { mentorInterview: { result: "Done" as never } },
        actor,
        now,
      ),
    ).toEqual({ ok: false, reason: "invalid" });
    expect(
      saveFFChecklistAssessments(
        "T-RDY",
        { mentorInterview: { result: "Passed" } },
        null,
        now,
      ),
    ).toEqual({ ok: false, reason: "actor" });
    // CPI doesn't apply to a WB-only application.
    expect(
      saveFFChecklistAssessments(
        "T-OTHER",
        { cpiAssessment: { result: "Passed" } },
        actor,
        now,
      ),
    ).toEqual({ ok: false, reason: "invalid" });
  });

  it("a failed write leaves the saved result unchanged", () => {
    seed(null);
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
    try {
      expect(
        saveFFChecklistAssessments(
          "T-RDY",
          { mentorInterview: { result: "Failed" } },
          actor,
          now,
        ),
      ).toEqual({ ok: false, reason: "storage" });
    } finally {
      Storage.prototype.setItem = orig;
    }
    __reloadFFMentorApplicationsForTest();
    expect(
      saved().staff["T-RDY"].checklistAssessments
        .mentorInterview.result,
    ).toBe("Passed");
  });

  it("reading readiness writes nothing", () => {
    const raw = seed("Determination");
    getFFMentorReadiness("T-RDY", now);
    getFFMentorMatchReadiness("T-RDY", now);
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify(raw));
  });
});