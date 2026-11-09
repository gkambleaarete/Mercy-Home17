// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  __reloadFFMentorApplicationsForTest,
  changeFFMentorStage,
  getFFMentorApplication,
  getFFMentorAvailability,
  listFFMentorApplications,
  listFFMentorApplicationsForMentor,
  saveFFMentorCoordinatorDetails,
} from "./ffMentorApplicationStore";
import {
  clearFFMentorInactive,
  confirmFFMentorInactive,
} from "./ffMentorInactive";
import {
  isLegacyMentorInDirectory,
  resolveLegacyMentorForDirectory,
} from "./ffMentorDirectory";
import { listFFMentorCandidates } from "./ffMentorCandidates";
import {
  getFFMentorById,
  MOCK_FF_MENTORS,
} from "./mockFriendsFirstData";
import {
  __reloadMentorMatchesForTest,
  getMentorMatches,
  type MentorMatch,
} from "./mockMentorMatchData";

const APP_KEY = "mh.ffMentorApplications.v1";
const MATCH_KEY = "mh.ffMentorMatches.v1";
const actor = { id: "staff-test", name: "Test Staff" };
const now = new Date(2026, 9, 20, 12, 0);
const angela = () => getFFMentorById("FF-CB-101")!;
// Isolated test matches for the legacy mentors (never the live seeds).
const m = (
  id: string,
  mentorId: string,
  s: string,
  e: string,
): MentorMatch => ({
  id,
  mentorId,
  menteeId: "FF-M-1",
  subProgram: "Community-Based",
  startDate: s,
  startTime: "9:00 AM",
  endDate: e,
  endTime: "5:00 PM",
  days: ["Monday"],
  comment: "",
  updatedAt: 1,
});
const MATCHES = [
  m("T-A1", "FF-CB-101", "09/01/2026", "12/31/2026"), // active
  m("T-E1", "FF-CB-101", "01/01/2026", "03/01/2026"), // already ended
  m("T-F1", "FF-CB-101", "11/15/2026", "12/31/2026"), // not started
  m("T-W1", "FF-WB-101", "09/01/2026", "12/31/2026"),
];

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(MATCH_KEY, JSON.stringify(MATCHES));
  __reloadFFMentorApplicationsForTest();
  __reloadMentorMatchesForTest(MATCHES);
});

describe("older seeded mentors share the record page's identity", () => {
  it("are resolvable for availability by applicant id, but stay out of the strict new-match population", () => {
    expect(getFFMentorApplication("FF-CB-101").status).toBe(
      "found",
    );
    expect(
      listFFMentorApplicationsForMentor("FF-CB-101"),
    ).toHaveLength(1);
    expect(
      listFFMentorApplications().some(
        (a) => a.applicationId === "FF-CB-101",
      ),
    ).toBe(false);
    expect(
      listFFMentorCandidates().some(
        (c) => c.mentorId === "FF-CB-101",
      ),
    ).toBe(false);
    // Never matched by name or another id.
    expect(
      listFFMentorApplicationsForMentor("Angela Moretti"),
    ).toHaveLength(0);
    expect(
      listFFMentorApplicationsForMentor("FF-CB-999"),
    ).toHaveLength(0);
  });

  it("Inactive can be confirmed for every seeded mentor, not 'missing'", () => {
    for (const mentor of MOCK_FF_MENTORS) {
      const r = confirmFFMentorInactive(mentor.id, actor, now);
      expect(r.ok).toBe(true);
      expect(getFFMentorAvailability(mentor.id).inactive).toBe(
        true,
      );
    }
  });
});

describe("Mentor Search reflects the saved shared values", () => {
  it("starts from the seed, then a saved coordinator and stage win", () => {
    const before = resolveLegacyMentorForDirectory(angela());
    expect(before).toMatchObject({
      inDirectory: true,
      stage: "Active",
      coordinator: "D. Reyes",
    });
    expect(
      saveFFMentorCoordinatorDetails("FF-CB-101", {
        coordinatorId: 6,
        coordinatorNotes: "n",
      }).ok,
    ).toBe(true);
    const mid = resolveLegacyMentorForDirectory(angela());
    expect(mid.coordinator).toBe("Gaurav Kamble");
    expect(mid.stage).toBe("Active"); // the seed-mapped stage survived the save
    // The raw seed object is never mutated.
    expect(angela().coordinator).toBe("D. Reyes");
    // A saved stage is used; membership still follows the stage rule.
    expect(
      changeFFMentorStage("FF-CB-101", {
        stage: "Interview",
        expectedStage: "Active",
        actor,
        now,
      }).ok,
    ).toBe(true);
    expect(
      resolveLegacyMentorForDirectory(angela()),
    ).toMatchObject({ stage: "Interview", inDirectory: false });
    // Matched/Active are legacy values: still readable, no longer selectable.
    expect(
      changeFFMentorStage("FF-CB-101", {
        stage: "Matched",
        expectedStage: "Interview",
        actor,
        now,
      }),
    ).toEqual({ ok: false, reason: "invalid" });
    expect(
      resolveLegacyMentorForDirectory(angela()),
    ).toMatchObject({ stage: "Interview", inDirectory: false });
  });

  it("an unrelated mentor is unchanged by another mentor's saved values", () => {
    saveFFMentorCoordinatorDetails("FF-CB-101", {
      coordinatorId: 6,
      coordinatorNotes: "",
    });
    const other = getFFMentorById("FF-WB-101")!;
    expect(
      resolveLegacyMentorForDirectory(other),
    ).toMatchObject({
      coordinator: "M. Callahan",
      stage: "Active",
      inDirectory: true,
    });
  });

  it("the original membership rule still holds for every seeded mentor", () => {
    for (const mentor of MOCK_FF_MENTORS)
      expect(isLegacyMentorInDirectory(mentor)).toBe(
        mentor.status === "approved" &&
          ["Matched", "Active"].includes(mentor.stage),
      );
  });
});

describe("Inactive for a seeded mentor", () => {
  it("ends active matches, saves together, removes from search, keeps stage; Clear keeps matches ended", () => {
    const r = confirmFFMentorInactive("FF-CB-101", actor, now);
    expect(r).toMatchObject({ ok: true });
    if (!r.ok || r.noop) throw new Error("expected closure");
    expect(r.ended.map((x) => x.id)).toEqual(["T-A1"]);
    expect(r.future.map((x) => x.id)).toEqual(["T-F1"]);
    const saved = JSON.parse(localStorage.getItem(APP_KEY)!);
    expect(saved.mentors["FF-CB-101"]).toMatchObject({
      inactive: true,
    });
    expect(
      Object.keys(saved.mentors["FF-CB-101"].matchClosures),
    ).toEqual(["T-A1"]);
    expect(isLegacyMentorInDirectory(angela())).toBe(false);
    expect(
      resolveLegacyMentorForDirectory(angela()).stage,
    ).toBe("Active"); // stage untouched
    // Another mentor's matches are untouched.
    expect(
      getMentorMatches().find((x) => x.id === "T-W1")?.endDate,
    ).toBe("12/31/2026");

    // Reload keeps both the setting and the closure.
    __reloadFFMentorApplicationsForTest();
    __reloadMentorMatchesForTest(MATCHES);
    expect(getFFMentorAvailability("FF-CB-101").inactive).toBe(
      true,
    );
    expect(
      getMentorMatches().find((x) => x.id === "T-A1")?.endDate,
    ).toBe("10/20/2026");

    // Reactivate: back in the directory by the same stage rule; ended stays ended.
    expect(
      clearFFMentorInactive("FF-CB-101", actor, now).ok,
    ).toBe(true);
    expect(isLegacyMentorInDirectory(angela())).toBe(true);
    expect(
      getMentorMatches().find((x) => x.id === "T-A1")?.endDate,
    ).toBe("10/20/2026");
    expect(
      listFFMentorApplications().some(
        (a) => a.applicationId === "FF-CB-101",
      ),
    ).toBe(false);
  });

  it("a failed save changes nothing", () => {
    const real = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
    try {
      const r = confirmFFMentorInactive(
        "FF-CB-101",
        actor,
        now,
      );
      expect(r.ok).toBe(false);
    } finally {
      Storage.prototype.setItem = real;
    }
    expect(getFFMentorAvailability("FF-CB-101").inactive).toBe(
      false,
    );
    expect(isLegacyMentorInDirectory(angela())).toBe(true);
  });
});