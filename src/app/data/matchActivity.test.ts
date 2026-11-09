// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  __reloadMatchActivitiesForTest,
  __reloadMentorMatchesForTest,
  getMatchActivities,
  getMentorMatch,
  logMatchActivity,
  validateMatchActivity,
  type MatchActivityInput,
  type MentorMatch,
} from "./mockMentorMatchData";
import { __reloadFFMentorApplicationsForTest } from "./ffMentorApplicationStore";
import { completeApplication } from "./ffMentorTestFixtures";

const APP_KEY = "mh.ffMentorApplications.v1";
const MATCH_KEY = "mh.ffMentorMatches.v1";
const ACT_KEY = "mh.ffMentorMatchActivities.v1";
const actor = { id: "staff-test", name: "Test Staff" };
const now = new Date(2026, 9, 20, 12, 0);
const mm = (
  id: string,
  mentorId: string,
  end = "12/31/2027",
): MentorMatch => ({
  id,
  mentorId,
  menteeId: "FF-ME-201",
  subProgram: "Community-Based",
  startDate: "09/01/2026",
  startTime: "9:00 AM",
  endDate: end,
  endTime: "5:00 PM",
  days: ["Monday"],
  comment: "",
  updatedAt: 1,
});
const MATCHES = [
  mm("MM-1", "VOL-X"),
  mm("MM-2", "VOL-X"),
  mm("MM-ENDED", "VOL-X", "03/01/2026"),
];
const ok: MatchActivityInput = {
  outing: "yes",
  activityDate: "10/18/2026",
  type: "Museum Visit",
  method: "In-Person",
  duration: "1.5",
  mentorEngagement: null,
  menteeEngagement: null,
  notes: "",
};

function seed(extra: { apps?: object; acts?: string } = {}) {
  localStorage.setItem(MATCH_KEY, JSON.stringify(MATCHES));
  if (extra.apps)
    localStorage.setItem(APP_KEY, JSON.stringify(extra.apps));
  if (extra.acts !== undefined)
    localStorage.setItem(ACT_KEY, extra.acts);
  __reloadFFMentorApplicationsForTest();
  __reloadMentorMatchesForTest(MATCHES);
  __reloadMatchActivitiesForTest();
}
const list = (id: string) => {
  const r = getMatchActivities(id);
  if (r.status !== "ok") throw new Error();
  return r.activities;
};

beforeEach(() => localStorage.clear());

describe("activity validation", () => {
  it("requires outing, valid non-future date, type, method; duration only for Yes/Partially", () => {
    expect(
      validateMatchActivity({ ...ok, outing: "" }, now).outing,
    ).toBeTruthy();
    expect(
      validateMatchActivity({ ...ok, activityDate: "" }, now)
        .activityDate,
    ).toBeTruthy();
    expect(
      validateMatchActivity(
        { ...ok, activityDate: "02/30/2026" },
        now,
      ).activityDate,
    ).toContain("valid");
    expect(
      validateMatchActivity(
        { ...ok, activityDate: "10/21/2026" },
        now,
      ).activityDate,
    ).toContain("future");
    expect(
      validateMatchActivity(
        { ...ok, activityDate: "10/20/2026" },
        now,
      ).activityDate,
    ).toBeUndefined();
    expect(
      validateMatchActivity({ ...ok, type: "" }, now).type,
    ).toBeTruthy();
    expect(
      validateMatchActivity({ ...ok, type: "Park Outing" }, now)
        .type,
    ).toBeTruthy();
    expect(
      validateMatchActivity({ ...ok, method: "" }, now).method,
    ).toBeTruthy();
    expect(
      validateMatchActivity({ ...ok, duration: "" }, now)
        .duration,
    ).toBeTruthy();
    expect(
      validateMatchActivity(
        { ...ok, outing: "partial", duration: "" },
        now,
      ).duration,
    ).toBeTruthy();
    expect(
      validateMatchActivity(
        { ...ok, outing: "no", duration: "" },
        now,
      ),
    ).toEqual({});
  });
  it("duration boundaries and invalid numbers", () => {
    for (const v of ["0.25", "24", "1.333", ".5"])
      expect(
        validateMatchActivity({ ...ok, duration: v }, now)
          .duration,
      ).toBeUndefined();
    for (const v of [
      "0.24",
      "24.01",
      "0",
      "-1",
      "abc",
      "1e1",
      "1,5",
      "Infinity",
    ])
      expect(
        validateMatchActivity({ ...ok, duration: v }, now)
          .duration,
      ).toBeTruthy();
  });
  it("ratings optional; when given must be integers 1–5", () => {
    expect(
      validateMatchActivity(
        { ...ok, mentorEngagement: 5, menteeEngagement: 1 },
        now,
      ),
    ).toEqual({});
    expect(
      validateMatchActivity({ ...ok, mentorEngagement: 0 }, now)
        .mentorEngagement,
    ).toBeTruthy();
    expect(
      validateMatchActivity(
        { ...ok, menteeEngagement: 2.5 },
        now,
      ).menteeEngagement,
    ).toBeTruthy();
    expect(
      validateMatchActivity({ ...ok, menteeEngagement: 6 }, now)
        .menteeEngagement,
    ).toBeTruthy();
  });
});

describe("logging activities", () => {
  it("appends to the exact match only; two matches for one mentor stay separate; survives reload", () => {
    seed();
    expect(logMatchActivity("MM-1", ok, actor, now).ok).toBe(
      true,
    );
    __reloadMatchActivitiesForTest();
    expect(list("MM-1")).toHaveLength(1);
    expect(list("MM-2")).toHaveLength(0);
    expect(list("MM-1")[0]).toMatchObject({
      matchId: "MM-1",
      outing: "yes",
      durationHours: 1.5,
      mentorEngagement: null,
      menteeEngagement: null,
      recordedBy: "Test Staff",
      recordedById: "staff-test",
      recordedAt: "10/20/2026 12:00 PM",
    });
  });
  it("No saves without duration (null, not 0); long notes and line breaks kept", () => {
    seed();
    const notes = `Line one\nLine two\n${"x".repeat(1000)}`;
    expect(
      logMatchActivity(
        "MM-1",
        { ...ok, outing: "no", duration: "3", notes },
        actor,
        now,
      ).ok,
    ).toBe(true);
    __reloadMatchActivitiesForTest();
    expect(list("MM-1")[0]).toMatchObject({
      durationHours: null,
      notes,
    });
  });
  it("sorts by activity date, newest first, then by recorded time", () => {
    seed();
    logMatchActivity(
      "MM-1",
      { ...ok, activityDate: "10/01/2026" },
      actor,
      new Date(2026, 9, 20, 9),
    );
    logMatchActivity(
      "MM-1",
      {
        ...ok,
        activityDate: "10/15/2026",
        type: "Library Visit",
      },
      actor,
      new Date(2026, 9, 20, 10),
    );
    logMatchActivity(
      "MM-1",
      {
        ...ok,
        activityDate: "10/15/2026",
        type: "Meal Together",
      },
      actor,
      new Date(2026, 9, 20, 11),
    );
    expect(
      list("MM-1").map((a) => [a.activityDate, a.type]),
    ).toEqual([
      ["10/15/2026", "Meal Together"],
      ["10/15/2026", "Library Visit"],
      ["10/01/2026", "Museum Visit"],
    ]);
  });
  it("refuses invalid input, missing matches, missing actor; nothing written", () => {
    seed();
    expect(
      logMatchActivity("MM-1", { ...ok, type: "" }, actor, now),
    ).toMatchObject({ ok: false, reason: "invalid" });
    expect(logMatchActivity("MM-404", ok, actor, now)).toEqual({
      ok: false,
      reason: "missing",
    });
    expect(logMatchActivity("MM-1", ok, null, now)).toEqual({
      ok: false,
      reason: "actor",
    });
    expect(localStorage.getItem(ACT_KEY)).toBeNull();
  });
  it("unreadable activities are reported and never overwritten", () => {
    seed({ acts: "{bad" });
    expect(getMatchActivities("MM-1")).toEqual({
      status: "unavailable",
    });
    expect(logMatchActivity("MM-1", ok, actor, now)).toEqual({
      ok: false,
      reason: "unavailable",
    });
    expect(localStorage.getItem(ACT_KEY)).toBe("{bad");
  });
  it("a failed write leaves the saved list unchanged", () => {
    seed();
    logMatchActivity("MM-1", ok, actor, now);
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
    try {
      expect(logMatchActivity("MM-1", ok, actor, now)).toEqual({
        ok: false,
        reason: "storage",
      });
    } finally {
      Storage.prototype.setItem = orig;
    }
    __reloadMatchActivitiesForTest();
    expect(list("MM-1")).toHaveLength(1);
  });
  it("logging works on an ended match and never changes the match", () => {
    seed();
    const before = localStorage.getItem(MATCH_KEY);
    expect(
      logMatchActivity("MM-ENDED", ok, actor, now).ok,
    ).toBe(true);
    expect(localStorage.getItem(MATCH_KEY)).toBe(before);
    expect(getMentorMatch("MM-ENDED")?.endDate).toBe(
      "03/01/2026",
    );
  });
  it("keeps an Inactive closure after a failed mirror write, through reload and activity save", () => {
    // The mentor was made Inactive: closure saved with the mentor, but the
    // match list's own mirror write failed (still shows the old end date).
    const a = completeApplication("APP-X", ["community"]);
    a.app.applicantId = "VOL-X";
    const apps = {
      version: 1,
      applications: { "APP-X": a.app },
      staff: {},
      mentors: {
        "VOL-X": {
          inactive: true,
          changedAt: "10/19/2026 9:00 AM",
          changedBy: "S",
          changedById: "s",
          matchClosures: {
            "MM-1": {
              mentorId: "VOL-X",
              endDate: "10/19/2026",
              endTime: "9:00 AM",
              at: new Date(2026, 9, 19, 9).getTime(),
              reason: "Mentor marked inactive",
              by: "S",
              byId: "s",
            },
          },
        },
      },
    };
    seed({ apps });
    expect(
      JSON.parse(localStorage.getItem(MATCH_KEY)!).find(
        (m: MentorMatch) => m.id === "MM-1",
      ).endDate,
    ).toBe("12/31/2027");
    expect(getMentorMatch("MM-1")?.endDate).toBe("10/19/2026");
    const appsBefore = localStorage.getItem(APP_KEY);
    expect(logMatchActivity("MM-1", ok, actor, now).ok).toBe(
      true,
    );
    __reloadFFMentorApplicationsForTest();
    __reloadMentorMatchesForTest(MATCHES);
    expect(getMentorMatch("MM-1")?.endDate).toBe("10/19/2026");
    expect(localStorage.getItem(APP_KEY)).toBe(appsBefore);
  });
});