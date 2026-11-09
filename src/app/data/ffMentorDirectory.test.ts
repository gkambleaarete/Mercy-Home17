// @vitest-environment jsdom
// Mentor Search directory membership (US 19877): saved Approved status at an
// onboarded stage; readiness is a warning, not a condition.
import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("./ffMentorReadinessPolicy", () => ({
  FF_READINESS_POLICY: {
    drivingReviewApplies: () => true,
    multiProgramReferencesMet: () => true,
  },
}));
import { __reloadFFMentorApplicationsForTest } from "./ffMentorApplicationStore";
import {
  createMentorMatchForCandidate,
  isFFMentorMatchCandidate,
  listFFMentorCandidates,
} from "./ffMentorCandidates";
import {
  isLegacyMentorInDirectory,
  listFFMentorDirectory,
} from "./ffMentorDirectory";
import { getFFMentorById } from "./mockFriendsFirstData";
import { completeApplication } from "./ffMentorTestFixtures";
import type {
  FFApplicantFacingStatus,
  FFSubProgramId,
} from "./ffMentorApplication";

const APP_KEY = "mh.ffMentorApplications.v1";

function seed(
  specs: {
    id: string;
    subs: FFSubProgramId[];
    stage: string | null;
    status?: FFApplicantFacingStatus;
    applicantId?: string;
    rejectVirtus?: boolean;
    inactive?: boolean;
  }[],
) {
  const raw = { version: 1, applications: {}, staff: {} } as {
    version: 1;
    applications: Record<string, unknown>;
    staff: Record<string, unknown>;
  };
  for (const s of specs) {
    const { app, staff } = completeApplication(s.id, s.subs);
    // Explicit saved approval — the fixture default is background-check.
    app.applicantStatus = s.status ?? "approved";
    if (s.applicantId) app.applicantId = s.applicantId;
    if (s.rejectVirtus)
      staff.documentReviews.virtus.status = "rejected";
    if (s.inactive) staff.inactive = true;
    raw.applications[s.id] = app;
    raw.staff[s.id] = { ...staff, stage: s.stage };
  }
  localStorage.setItem(APP_KEY, JSON.stringify(raw));
  __reloadFFMentorApplicationsForTest();
}

const ids = () =>
  listFFMentorDirectory()
    .map((d) => d.applicationId)
    .sort();

describe("Mentor Search directory", () => {
  beforeEach(() => localStorage.clear());

  it("lists Approved mentors at Ready for Match, Matched and Active once each", () => {
    seed([
      {
        id: "D-RFM",
        subs: ["community"],
        stage: "Ready for Match",
      },
      { id: "D-MAT", subs: ["work"], stage: "Matched" },
      { id: "D-ACT", subs: ["school"], stage: "Active" },
    ]);
    expect(ids()).toEqual(["D-ACT", "D-MAT", "D-RFM"]);
  });

  it("does not admit any non-approved status, even Active with complete evidence", () => {
    const statuses: FFApplicantFacingStatus[] = [
      "waitlisted",
      "error",
      "draft",
      "in-progress",
      "background-check",
      "accepted-pending-certs",
    ];
    seed([
      ...statuses.map((status) => ({
        id: `D-${status}`,
        subs: ["community"] as FFSubProgramId[],
        stage: "Active",
        status,
      })),
      { id: "D-OK", subs: ["school"], stage: "Active" },
    ]);
    expect(ids()).toEqual(["D-OK"]);
  });

  it("excludes pre-approval stages and Inactive mentors even when Approved", () => {
    seed([
      { id: "D-PRE", subs: ["community"], stage: "Interview" },
      { id: "D-NONE", subs: ["community"], stage: null },
      {
        id: "D-OFF",
        subs: ["school"],
        stage: "Active",
        inactive: true,
      },
      { id: "D-OK", subs: ["school"], stage: "Active" },
    ]);
    expect(ids()).toEqual(["D-OK"]);
  });

  it("is one row per mentor; only approved applications contribute sub-programs", () => {
    seed([
      {
        id: "D-A1",
        subs: ["community"],
        stage: "Matched",
        applicantId: "VOL-X",
      },
      {
        id: "D-A2",
        subs: ["school"],
        stage: "Active",
        applicantId: "VOL-X",
      },
      {
        id: "D-A3",
        subs: ["work"],
        stage: "Active",
        applicantId: "VOL-X",
        status: "waitlisted",
      },
    ]);
    const rows = listFFMentorDirectory();
    expect(rows).toHaveLength(1);
    expect(rows[0].subProgrammes.sort()).toEqual([
      "Community-Based",
      "School-Based",
    ]);
  });

  it("applies the directory rule to seeded fixtures (under review is out)", () => {
    expect(
      isLegacyMentorInDirectory(getFFMentorById("FF-SB-102")!),
    ).toBe(false);
    expect(
      isLegacyMentorInDirectory(getFFMentorById("FF-CB-101")!),
    ).toBe(true);
  });

  it("keeps an approved Active mentor with a rejected certificate, with a warning", () => {
    seed([
      {
        id: "D-REJ",
        subs: ["work"],
        stage: "Active",
        rejectVirtus: true,
      },
    ]);
    const rows = listFFMentorDirectory();
    expect(rows.map((r) => r.applicationId)).toEqual(["D-REJ"]);
    expect(rows[0].readinessWarnings.join(" ")).toMatch(
      /VIRTUS/,
    );
  });

  it("gives a fully ready approved mentor no warning", () => {
    seed([{ id: "D-OK", subs: ["school"], stage: "Active" }]);
    expect(
      listFFMentorDirectory()[0].readinessWarnings,
    ).toEqual([]);
  });

  it("still blocks a new match for a directory mentor who isn't a candidate", () => {
    seed([
      {
        id: "D-REJ",
        subs: ["work"],
        stage: "Ready for Match",
        rejectVirtus: true,
      },
      { id: "D-ACT", subs: ["school"], stage: "Active" },
    ]);
    expect(ids()).toEqual(["D-ACT", "D-REJ"]);
    expect(listFFMentorCandidates()).toEqual([]);
    expect(isFFMentorMatchCandidate("VOL-D-REJ")).toBe(false);
    const r = createMentorMatchForCandidate({
      mentorId: "VOL-D-REJ",
      subProgram: "Work-Based",
    } as never);
    expect(r).toMatchObject({
      ok: false,
      reason: "not-candidate",
    });
  });

  it("leaves the new-match selector at Ready for Match only", () => {
    seed([
      {
        id: "D-RFM",
        subs: ["community"],
        stage: "Ready for Match",
      },
      { id: "D-MAT", subs: ["work"], stage: "Matched" },
      { id: "D-ACT", subs: ["school"], stage: "Active" },
    ]);
    expect(
      listFFMentorCandidates().map((c) => c.applicationId),
    ).toEqual(["D-RFM"]);
  });
});