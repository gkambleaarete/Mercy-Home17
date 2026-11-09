// @vitest-environment jsdom
// With the production readiness policy (two rules unresolved) Ready for
// Match is refused and nothing is created.
import { beforeEach, describe, expect, it } from "vitest";
import {
  __reloadFFMentorApplicationsForTest,
  changeFFMentorStage,
  getFFMentorApplicationStaff,
  previewFFReadyForMatch,
} from "./ffMentorApplicationStore";
import { CONSTITUENTS } from "./mockConstituents";
import { completeApplication } from "./ffMentorTestFixtures";

const KEY = "mh.ffMentorApplications.v1";
const actor = { id: "staff-test", name: "Test Staff" };

beforeEach(() => {
  const a = completeApplication("T-A", ["community"]);
  localStorage.clear();
  localStorage.setItem(
    KEY,
    JSON.stringify({
      version: 1,
      applications: { "T-A": a.app },
      staff: { "T-A": { ...a.staff, stage: "Determination" } },
    }),
  );
  __reloadFFMentorApplicationsForTest();
});

describe("production readiness policy", () => {
  it("blocks Ready for Match: no history, constituent or link", () => {
    const n = CONSTITUENTS.length;
    const before = localStorage.getItem(KEY);
    expect(previewFFReadyForMatch("T-A")).toMatchObject({
      status: "blocked",
    });
    const r = changeFFMentorStage("T-A", {
      stage: "Ready for Match",
      expectedStage: "Determination",
      actor,
    });
    expect(r).toMatchObject({ ok: false, reason: "not-ready" });
    expect(getFFMentorApplicationStaff("T-A").stage).toBe(
      "Determination",
    );
    expect(
      getFFMentorApplicationStaff("T-A").stageHistory,
    ).toEqual([]);
    expect(CONSTITUENTS).toHaveLength(n);
    expect(localStorage.getItem(KEY)).toBe(before);
  });
});