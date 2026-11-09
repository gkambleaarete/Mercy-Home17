// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  __reloadFFMentorApplicationsForTest,
  getFFMentorAvailability,
  getFFMentorApplication,
} from "./ffMentorApplicationStore";
import {
  clearFFMentorInactive,
  confirmFFMentorInactive,
} from "./ffMentorInactive";
import { listFFMentorCandidates } from "./ffMentorCandidates";
import {
  __reloadMentorMatchesForTest,
  getMentorMatches,
  type MentorMatch,
} from "./mockMentorMatchData";
import { completeApplication } from "./ffMentorTestFixtures";

const APP_KEY = "mh.ffMentorApplications.v1";
const MATCH_KEY = "mh.ffMentorMatches.v1";
const actor = { id: "staff-test", name: "Test Staff" };
const now = new Date(2026, 9, 20, 12, 0);
const match = (
  id: string,
  mentorId: string,
  start: string,
  end: string,
): MentorMatch => ({
  id,
  mentorId,
  menteeId: "FF-M-1",
  subProgram: "Community-Based",
  startDate: start,
  startTime: "9:00 AM",
  endDate: end,
  endTime: "5:00 PM",
  days: ["Monday"],
  comment: `note ${id}`,
  updatedAt: 1,
});
const MATCHES = [
  match("MM-A1", "VOL-M", "09/01/2026", "12/31/2026"), // active
  match("MM-A2", "VOL-M", "10/01/2026", "06/30/2027"), // active
  match("MM-E1", "VOL-M", "01/01/2026", "03/01/2026"), // already ended
  match("MM-F1", "VOL-M", "11/15/2026", "12/31/2026"), // not started
  match("MM-O1", "VOL-O", "09/01/2026", "12/31/2026"), // another mentor
  match("MM-L1", "FF-CB-101", "09/01/2026", "12/31/2026"), // demo mentor
];

function seed(matches: MentorMatch[] | string = MATCHES) {
  const a1 = completeApplication("APP-1", ["community"]);
  const a2 = completeApplication("APP-2", ["school"]);
  const o = completeApplication("APP-O", ["work"]);
  a1.app.applicantId = "VOL-M";
  a2.app.applicantId = "VOL-M";
  o.app.applicantId = "VOL-O";
  const raw = {
    version: 1,
    applications: {
      "APP-1": a1.app,
      "APP-2": a2.app,
      "APP-O": o.app,
    },
    staff: {
      "APP-1": { ...a1.staff, stage: "Matched" },
      "APP-2": { ...a2.staff, stage: "Interview" },
      "APP-O": o.staff,
    },
  };
  localStorage.setItem(APP_KEY, JSON.stringify(raw));
  localStorage.setItem(
    MATCH_KEY,
    typeof matches === "string"
      ? matches
      : JSON.stringify(matches),
  );
  __reloadFFMentorApplicationsForTest();
  __reloadMentorMatchesForTest(MATCHES);
  return raw;
}
const byId = (id: string) =>
  getMentorMatches().find((m) => m.id === id)!;
const reloadAll = () => {
  __reloadFFMentorApplicationsForTest();
  __reloadMentorMatchesForTest(MATCHES);
};

beforeEach(() => localStorage.clear());

describe("mentor Inactive", () => {
  it("ends every active match of that mentor only; history, future, other mentors untouched; survives reload", () => {
    const raw = seed();
    const r = confirmFFMentorInactive("VOL-M", actor, now);
    expect(r).toMatchObject({
      ok: true,
      endDate: "10/20/2026",
      endTime: "12:00 PM",
    });
    expect(r.ok && r.ended.map((m) => m.id).sort()).toEqual([
      "MM-A1",
      "MM-A2",
    ]);
    expect(r.ok && r.future.map((m) => m.id)).toEqual([
      "MM-F1",
    ]);
    reloadAll();
    expect(byId("MM-A1")).toMatchObject({
      endDate: "10/20/2026",
      endTime: "12:00 PM",
      comment: "note MM-A1",
      startDate: "09/01/2026",
    });
    expect(byId("MM-A2").endDate).toBe("10/20/2026");
    expect(byId("MM-E1")).toMatchObject({
      endDate: "03/01/2026",
      endTime: "5:00 PM",
    });
    expect(byId("MM-F1").endDate).toBe("12/31/2026");
    expect(byId("MM-O1").endDate).toBe("12/31/2026");
    expect(byId("MM-L1").endDate).toBe("12/31/2026");
    const saved = JSON.parse(localStorage.getItem(APP_KEY)!);
    expect(saved.mentors["VOL-M"]).toMatchObject({
      inactive: true,
      changedBy: "Test Staff",
      changedById: "staff-test",
    });
    expect(
      saved.mentors["VOL-M"].matchClosures["MM-A1"],
    ).toMatchObject({
      mentorId: "VOL-M",
      reason: "Mentor marked inactive",
      by: "Test Staff",
    });
    // Applications, stages, checklist and reviews unchanged; no stage history.
    expect(JSON.stringify(saved.applications)).toBe(
      JSON.stringify(raw.applications),
    );
    expect(JSON.stringify(saved.staff)).toBe(
      JSON.stringify(raw.staff),
    );
  });

  it("applies to every application of the mentor; another mentor unaffected", () => {
    seed();
    confirmFFMentorInactive("VOL-M", actor, now);
    expect(getFFMentorAvailability("VOL-M")).toMatchObject({
      inactive: true,
      source: "mentor",
    });
    expect(getFFMentorAvailability("VOL-O").inactive).toBe(
      false,
    );
    const a2 = getFFMentorApplication("APP-2");
    expect(a2.status === "found" && a2.staff.stage).toBe(
      "Interview",
    );
  });

  it("zero active matches is fine", () => {
    seed([match("MM-E1", "VOL-M", "01/01/2026", "03/01/2026")]);
    const r = confirmFFMentorInactive("VOL-M", actor, now);
    expect(r).toMatchObject({ ok: true, ended: [] });
    expect(getFFMentorAvailability("VOL-M").inactive).toBe(
      true,
    );
  });

  it("an unreadable match list is not treated as empty — nothing changes", () => {
    seed("{broken");
    expect(
      confirmFFMentorInactive("VOL-M", actor, now),
    ).toEqual({ ok: false, reason: "matches-unavailable" });
    expect(getFFMentorAvailability("VOL-M").inactive).toBe(
      false,
    );
    expect(
      JSON.parse(localStorage.getItem(APP_KEY)!).mentors,
    ).toBeUndefined();
    expect(localStorage.getItem(MATCH_KEY)).toBe("{broken");
  });

  it("a failed save changes neither the mentor nor the matches", () => {
    seed();
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
    try {
      expect(
        confirmFFMentorInactive("VOL-M", actor, now),
      ).toEqual({ ok: false, reason: "storage" });
    } finally {
      Storage.prototype.setItem = orig;
    }
    reloadAll();
    expect(getFFMentorAvailability("VOL-M").inactive).toBe(
      false,
    );
    expect(byId("MM-A1").endDate).toBe("12/31/2026");
  });

  it("confirming twice doesn't do it twice", () => {
    seed();
    confirmFFMentorInactive("VOL-M", actor, now);
    const before = localStorage.getItem(APP_KEY);
    expect(
      confirmFFMentorInactive(
        "VOL-M",
        actor,
        new Date(2026, 9, 21),
      ),
    ).toMatchObject({ ok: true, noop: true, ended: [] });
    expect(localStorage.getItem(APP_KEY)).toBe(before);
  });

  it("missing actor or unknown mentor is refused", () => {
    seed();
    expect(confirmFFMentorInactive("VOL-M", null, now)).toEqual(
      { ok: false, reason: "actor" },
    );
    expect(
      confirmFFMentorInactive("VOL-NOBODY", actor, now),
    ).toEqual({ ok: false, reason: "missing" });
  });

  it("reactivation clears Inactive, keeps matches ended, creates nothing, and doesn't qualify an ineligible mentor", () => {
    seed();
    confirmFFMentorInactive("VOL-M", actor, now);
    const count = getMentorMatches().length;
    expect(
      clearFFMentorInactive(
        "VOL-M",
        actor,
        new Date(2026, 9, 22),
      ),
    ).toMatchObject({ ok: true });
    reloadAll();
    expect(getFFMentorAvailability("VOL-M").inactive).toBe(
      false,
    );
    expect(byId("MM-A1").endDate).toBe("10/20/2026");
    expect(getMentorMatches()).toHaveLength(count);
    // Production rules keep everyone ineligible, so no candidate appears.
    expect(listFFMentorCandidates(now)).toEqual([]);
  });

  it("an older per-application Inactive flag still counts until a mentor record exists", () => {
    const raw = seed();
    raw.staff["APP-2"] = {
      ...raw.staff["APP-2"],
      inactive: true,
    };
    localStorage.setItem(APP_KEY, JSON.stringify(raw));
    __reloadFFMentorApplicationsForTest();
    expect(getFFMentorAvailability("VOL-M")).toMatchObject({
      inactive: true,
      source: "legacy-application",
    });
  });
});