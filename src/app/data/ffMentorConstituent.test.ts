// @vitest-environment jsdom
// Ready for Match → Constituent creation/linking and the Rejected stage
// (US 20039 Chunk 4). The two unresolved readiness rules are stood in by a
// test policy (vi.mock); production keeps them unresolved
// (ffMentorConstituent.blocked.test.ts).
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
  getFFMentorApplicationStaff,
  getFFMentorConstituentLink,
  previewFFReadyForMatch,
  saveFFMentorApplicationDetails,
  saveFFMentorInterview,
} from "./ffMentorApplicationStore";
import { applicableInterviewQuestions } from "./ffMentorInterview";
import { CONSTITUENTS } from "./mockConstituents";
import { completeApplication } from "./ffMentorTestFixtures";
import { resolveLegacyMentorForDirectory } from "./ffMentorDirectory";
import { getFFMentorById } from "./mockFriendsFirstData";

const KEY = "mh.ffMentorApplications.v1";
const actor = { id: "staff-test", name: "Test Staff" };
const now = new Date(2026, 9, 23, 12, 0);
const saved = () => JSON.parse(localStorage.getItem(KEY)!);
const mentors = () =>
  CONSTITUENTS.filter(
    (c) =>
      c.role === "Friends First Mentor" &&
      c.ffMentorApplicantId,
  );

function seed(extra: Record<string, unknown> = {}) {
  const a = completeApplication("T-A", ["community", "school"]);
  const b = completeApplication("T-B", ["work"]);
  b.app.applicantId = a.app.applicantId; // same mentor, second application
  const c = completeApplication("T-C", ["community"]); // a different mentor
  localStorage.setItem(
    KEY,
    JSON.stringify({
      version: 1,
      applications: {
        "T-A": a.app,
        "T-B": b.app,
        "T-C": c.app,
      },
      staff: {
        "T-A": { ...a.staff, stage: "Determination" },
        "T-B": { ...b.staff, stage: "Determination" },
        "T-C": { ...c.staff, stage: "Determination" },
      },
      ...extra,
    }),
  );
  __reloadFFMentorApplicationsForTest();
  return { a, b, c };
}
const rfm = (
  id: string,
  expected: string | null = "Determination",
) =>
  changeFFMentorStage(id, {
    stage: "Ready for Match",
    expectedStage: expected as any,
    actor,
    now,
  });

beforeEach(() => {
  localStorage.clear();
  __reloadFFMentorApplicationsForTest();
});

describe("Rejected stage", () => {
  it("saves on a submitted application with history, survives reload, and is not a completed prerequisite", () => {
    seed();
    expect(
      changeFFMentorStage("T-A", {
        stage: "Rejected",
        expectedStage: "Determination",
        actor,
        now,
      }),
    ).toEqual({ ok: true, changed: true });
    __reloadFFMentorApplicationsForTest();
    const s = getFFMentorApplicationStaff("T-A");
    expect(s.stage).toBe("Rejected");
    expect(s.stageHistory.at(-1)).toMatchObject({
      fromStage: "Determination",
      stage: "Rejected",
      by: "Test Staff",
      byId: "staff-test",
    });
    // Re-selecting the saved stage is a no-op with no duplicate history.
    expect(
      changeFFMentorStage("T-A", {
        stage: "Rejected",
        expectedStage: "Rejected",
        actor,
        now,
      }),
    ).toEqual({ ok: true, changed: false });
    expect(
      getFFMentorApplicationStaff("T-A").stageHistory,
    ).toHaveLength(1);
    // Nothing else changed: no constituent, other applications untouched.
    expect(mentors()).toHaveLength(0);
    expect(getFFMentorApplicationStaff("T-B").stage).toBe(
      "Determination",
    );
  });

  it("saves on a seeded application and drops the mentor from the directory rule", () => {
    const m = getFFMentorById("FF-CB-101")!;
    const current =
      getFFMentorApplicationStaff("FF-CB-101").stage;
    expect(
      changeFFMentorStage("FF-CB-101", {
        stage: "Rejected",
        expectedStage: current,
        actor,
        now,
      }).ok,
    ).toBe(true);
    expect(getFFMentorApplicationStaff("FF-CB-101").stage).toBe(
      "Rejected",
    );
    expect(resolveLegacyMentorForDirectory(m).inDirectory).toBe(
      false,
    );
    __reloadFFMentorApplicationsForTest();
    expect(getFFMentorApplicationStaff("FF-CB-101").stage).toBe(
      "Rejected",
    );
  });

  it("does not change status, Inactive or constituents", () => {
    seed();
    const before = saved();
    changeFFMentorStage("T-A", {
      stage: "Rejected",
      expectedStage: "Determination",
      actor,
      now,
    });
    const after = saved();
    expect(after.applications).toEqual(before.applications);
    expect(after.mentors).toEqual(before.mentors);
    expect(after.constituents).toBeUndefined();
  });
});

describe("Ready for Match creates and links one Constituent", () => {
  it("previews create, then creates Individual / Friends First Mentor with stage, history and link in one write", () => {
    seed();
    expect(previewFFReadyForMatch("T-A", now)).toEqual({
      status: "create",
    });
    const before = mentors().length;
    const r = rfm("T-A");
    expect(r).toMatchObject({
      ok: true,
      changed: true,
      constituent: { created: true },
    });
    const id = (r as any).constituent.id;
    const s = saved();
    expect(s.staff["T-A"].stage).toBe("Ready for Match");
    expect(s.constituents[String(id)]).toMatchObject({
      type: "Individual",
      role: "Friends First Mentor",
      program: "Friends First",
      ffMentorApplicantId: "VOL-T-A",
    });
    expect(s.constituentLinks["VOL-T-A"]).toMatchObject({
      constituentId: id,
      applicationIds: ["T-A"],
      createdBy: "Test Staff",
    });
    expect(mentors()).toHaveLength(before + 1);
    expect(
      CONSTITUENTS.filter((c) => c.id === id),
    ).toHaveLength(1);
    // Unique id: above every seeded id.
    expect(id).toBeGreaterThan(
      Math.max(
        ...CONSTITUENTS.filter((c) => c.id !== id).map(
          (c) => c.id,
        ),
      ),
    );
    // Survives a refresh with the same id, role and fields.
    const snapshot = JSON.stringify(
      CONSTITUENTS.find((c) => c.id === id),
    );
    CONSTITUENTS.splice(
      CONSTITUENTS.findIndex((c) => c.id === id),
      1,
    );
    __reloadFFMentorApplicationsForTest();
    expect(
      JSON.stringify(CONSTITUENTS.find((c) => c.id === id)),
    ).toBe(snapshot);
    expect(getFFMentorConstituentLink("VOL-T-A")).toMatchObject(
      { constituentId: id },
    );
  });

  it("maps the staff-corrected effective details and keeps protected data out", () => {
    const { a } = seed();
    const o = a.app.answers.overview;
    expect(
      saveFFMentorApplicationDetails(
        "T-A",
        {
          overview: {
            firstName: "Corrected",
            city: "Evanston",
            zip: "60201",
          },
        },
        {
          overview: {
            firstName: o.firstName,
            city: o.city,
            zip: o.zip,
          },
        },
        actor,
      ).ok,
    ).toBe(true);
    const answers: Record<string, string> = {};
    for (const q of applicableInterviewQuestions(
      ["community", "school"],
      {},
    ))
      if (q.input === "text")
        answers[q.id] = "SECRET-INTERVIEW";
    expect(
      saveFFMentorInterview("T-A", answers, {}, actor).ok,
    ).toBe(true);
    const r: any = rfm("T-A");
    const c = saved().constituents[String(r.constituent.id)];
    expect(c.name).toBe(`Corrected ${o.lastName}`);
    expect(c.mentorDetails).toMatchObject({
      firstName: "Corrected",
      lastName: o.lastName,
      middleName: o.middleName,
      dob: o.dob,
      address: {
        city: "Evanston",
        zip: "60201",
        line1: o.address,
      },
    });
    expect(c.email).toBe(o.email);
    expect(c.phone).toBe(o.phone);
    const json = JSON.stringify(c);
    expect(json).not.toContain("SECRET-INTERVIEW");
    expect(json.toLowerCase()).not.toContain("ssn");
    expect(json).not.toContain(
      String(a.app.answers.overview.ssn ?? "∅"),
    );
    // Original submission untouched.
    expect(
      saved().applications["T-A"].answers.overview.firstName,
    ).toBe(o.firstName);
  });

  it("repeat transitions, re-entry and a second application of the same mentor keep one record", () => {
    seed();
    const first: any = rfm("T-A");
    // Re-select current stage: no-op.
    expect(
      changeFFMentorStage("T-A", {
        stage: "Ready for Match",
        expectedStage: "Ready for Match",
        actor,
        now,
      }),
    ).toEqual({ ok: true, changed: false });
    // Leave and re-enter: reuses and updates, no second record.
    changeFFMentorStage("T-A", {
      stage: "Determination",
      expectedStage: "Ready for Match",
      actor,
      now,
    });
    expect(previewFFReadyForMatch("T-A", now)).toEqual({
      status: "reuse",
      constituentId: first.constituent.id,
    });
    const again: any = rfm("T-A", "Determination");
    expect(again.constituent).toEqual({
      id: first.constituent.id,
      created: false,
    });
    // Second application, same applicant.
    const second: any = rfm("T-B");
    expect(second.constituent).toEqual({
      id: first.constituent.id,
      created: false,
    });
    expect(
      mentors().filter(
        (c) => c.ffMentorApplicantId === "VOL-T-A",
      ),
    ).toHaveLength(1);
    expect(Object.keys(saved().constituents)).toHaveLength(1);
    expect(
      saved().constituentLinks["VOL-T-A"].applicationIds,
    ).toEqual(["T-A", "T-B"]);
    // A different applicant gets a different record.
    const other: any = rfm("T-C");
    expect(other.constituent.id).not.toBe(first.constituent.id);
    expect(Object.keys(saved().constituents)).toHaveLength(2);
  });

  it("never merges with a look-alike by name or email, and leaves unrelated records alone", () => {
    const { a } = seed();
    const o = a.app.answers.overview;
    const twin = {
      id: 9001,
      name: `${o.firstName} ${o.lastName}`,
      type: "Individual",
      role: "External Constituent",
      status: "Active",
      program: "—",
      lastUpdated: "2026-01-01",
      email: o.email,
    } as any;
    CONSTITUENTS.push(twin);
    const copy = JSON.stringify(twin);
    const r: any = rfm("T-A");
    expect(r.constituent.created).toBe(true);
    expect(r.constituent.id).not.toBe(9001);
    expect(JSON.stringify(twin)).toBe(copy);
    expect(r.constituent.id).toBeGreaterThan(9001);
    CONSTITUENTS.splice(CONSTITUENTS.indexOf(twin), 1);
  });

  it("an unverifiable existing link is refused, not replaced", () => {
    seed({
      constituentLinks: {
        "VOL-T-A": {
          constituentId: 777,
          applicationIds: [],
          createdAt: "x",
          createdBy: "x",
          createdById: "x",
        },
      },
    });
    expect(previewFFReadyForMatch("T-A", now)).toEqual({
      status: "link-invalid",
    });
    expect(rfm("T-A")).toMatchObject({
      ok: false,
      reason: "constituent-link",
    });
    expect(getFFMentorApplicationStaff("T-A").stage).toBe(
      "Determination",
    );
    expect(mentors()).toHaveLength(0);
  });

  it("a stage conflict or a failed write leaves no stage, history or constituent", () => {
    seed();
    expect(rfm("T-A", "Interview")).toMatchObject({
      ok: false,
      reason: "conflict",
      currentStage: "Determination",
    });
    const real = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
    let r;
    try {
      r = rfm("T-A");
    } finally {
      Storage.prototype.setItem = real;
    }
    expect(r).toMatchObject({ ok: false, reason: "storage" });
    expect(getFFMentorApplicationStaff("T-A").stage).toBe(
      "Determination",
    );
    expect(
      getFFMentorApplicationStaff("T-A").stageHistory,
    ).toEqual([]);
    expect(mentors()).toHaveLength(0);
    expect(getFFMentorConstituentLink("VOL-T-A")).toBeNull();
  });

  it("preserves everything else saved for the application and other applicants", () => {
    seed({
      interviews: {
        "T-A": {
          answers: { "A.all.aboutYourself": "kept" },
          updatedAt: "d",
          updatedBy: "u",
          updatedById: "i",
        },
      },
      mentors: { "VOL-T-C": { inactive: false } },
    });
    const before = saved();
    rfm("T-A");
    const after = saved();
    expect(after.interviews).toEqual(before.interviews);
    expect(after.mentors).toEqual(before.mentors);
    expect(after.applications).toEqual(before.applications);
    expect(after.staff["T-C"]).toEqual(before.staff["T-C"]);
    expect(after.staff["T-B"]).toEqual(before.staff["T-B"]);
    expect({
      ...after.staff["T-A"],
      stage: 0,
      stageHistory: 0,
    }).toEqual({
      ...before.staff["T-A"],
      stage: 0,
      stageHistory: 0,
    });
  });

  it("rejection after a promotion does not delete the linked constituent", () => {
    seed();
    const r: any = rfm("T-A");
    changeFFMentorStage("T-A", {
      stage: "Rejected",
      expectedStage: "Ready for Match",
      actor,
      now,
    });
    expect(
      saved().constituents[String(r.constituent.id)],
    ).toBeTruthy();
    expect(
      CONSTITUENTS.some((c) => c.id === r.constituent.id),
    ).toBe(true);
  });
});