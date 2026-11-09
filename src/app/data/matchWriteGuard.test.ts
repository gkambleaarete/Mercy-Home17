// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  __reloadMentorMatchesForTest,
  createMentorMatch,
  getMentorMatch,
  updateMentorMatch,
  type MentorMatch,
} from "./mockMentorMatchData";
import { __reloadFFMentorApplicationsForTest } from "./ffMentorApplicationStore";
import { clearFFMentorInactive } from "./ffMentorInactive";
import { completeApplication } from "./ffMentorTestFixtures";

const APP_KEY = "mh.ffMentorApplications.v1";
const MATCH_KEY = "mh.ffMentorMatches.v1";
const now = new Date(2026, 9, 20, 12, 0);
const actor = { id: "staff-test", name: "Test Staff" };
const mm = (
  id: string,
  mentorId: string,
  start: string,
  end: string,
): MentorMatch => ({
  id,
  mentorId,
  menteeId: "FF-ME-201",
  subProgram: "Community-Based",
  startDate: start,
  startTime: "9:00 AM",
  endDate: end,
  endTime: "5:00 PM",
  days: ["Monday"],
  comment: "c",
  updatedAt: 1,
});
const MATCHES = [
  mm("MM-1", "VOL-X", "09/01/2026", "12/31/2027"), // closed by the Inactive closure below (saved row is stale)
  mm("MM-S", "VOL-X", "11/15/2026", "12/31/2026"), // scheduled
  mm("MM-A", "VOL-Y", "09/01/2026", "12/31/2027"), // active, active mentor
  mm("MM-L", "FF-CB-101", "09/01/2026", "12/31/2026"), // demo mentor
];

function seed(appRaw?: string, matchRaw?: string) {
  const x = completeApplication("APP-X", ["community"]);
  x.app.applicantId = "VOL-X";
  const y = completeApplication("APP-Y", ["community"]);
  y.app.applicantId = "VOL-Y";
  const apps = {
    version: 1,
    applications: { "APP-X": x.app, "APP-Y": y.app },
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
  localStorage.setItem(APP_KEY, appRaw ?? JSON.stringify(apps));
  localStorage.setItem(
    MATCH_KEY,
    matchRaw ?? JSON.stringify(MATCHES),
  );
  __reloadFFMentorApplicationsForTest();
  __reloadMentorMatchesForTest(MATCHES);
}
const cur = (id: string) => getMentorMatch(id)!;

beforeEach(() => localStorage.clear());

describe("match writes respect Inactive closures", () => {
  it("refuses moving a closed match's end later, clearing it, or making it scheduled — nothing saved", () => {
    seed();
    const before = localStorage.getItem(MATCH_KEY);
    const m = cur("MM-1");
    expect(m.endDate).toBe("10/19/2026");
    for (const change of [
      { endDate: "12/31/2027" },
      { endDate: "", endTime: "" },
      { endTime: "11:00 AM" },
      { startDate: "11/01/2026", endDate: "12/31/2026" },
    ]) {
      const r = updateMentorMatch({ ...m, ...change }, now);
      expect(r).toMatchObject({
        ok: false,
        reason: "inactive-closed",
      });
      expect(r.ok === false && r.message).toContain(
        "reactivate the mentor",
      );
    }
    expect(localStorage.getItem(MATCH_KEY)).toBe(before);
    expect(cur("MM-1").endDate).toBe("10/19/2026");
  });

  it("allows corrections that keep it ended and unrelated edits; closure evidence kept", () => {
    seed();
    expect(
      updateMentorMatch(
        { ...cur("MM-1"), comment: "fixed typo" },
        now,
      ),
    ).toMatchObject({ ok: true });
    expect(
      updateMentorMatch(
        { ...cur("MM-1"), endDate: "10/18/2026" },
        now,
      ),
    ).toMatchObject({ ok: true });
    expect(cur("MM-1").endDate).toBe("10/18/2026");
    expect(
      JSON.parse(localStorage.getItem(APP_KEY)!).mentors[
        "VOL-X"
      ].matchClosures["MM-1"].endDate,
    ).toBe("10/19/2026");
  });

  it("refuses reassigning a closed match, assigning to an Inactive mentor, or creating for one", () => {
    seed();
    expect(
      updateMentorMatch(
        { ...cur("MM-1"), mentorId: "VOL-Y" },
        now,
      ),
    ).toMatchObject({ ok: false, reason: "inactive-closed" });
    expect(
      updateMentorMatch(
        { ...cur("MM-A"), mentorId: "VOL-X" },
        now,
      ),
    ).toMatchObject({ ok: false, reason: "inactive-mentor" });
    const { id: _id, ...draft } = mm(
      "new",
      "VOL-X",
      "11/20/2026",
      "12/31/2026",
    );
    expect(createMentorMatch(draft, now)).toMatchObject({
      ok: false,
      reason: "inactive-mentor",
    });
  });

  it("keeps scheduled matches scheduled: edits allowed, but not made active while Inactive", () => {
    seed();
    expect(
      updateMentorMatch(
        { ...cur("MM-S"), comment: "keep" },
        now,
      ),
    ).toMatchObject({ ok: true });
    expect(
      updateMentorMatch(
        { ...cur("MM-S"), startDate: "10/01/2026" },
        now,
      ),
    ).toMatchObject({ ok: false, reason: "inactive-mentor" });
    expect(cur("MM-S").startDate).toBe("11/15/2026");
  });

  it("unrelated and demo-mentor matches stay editable without eligibility checks", () => {
    seed();
    expect(
      updateMentorMatch(
        { ...cur("MM-A"), endDate: "06/30/2028" },
        now,
      ),
    ).toMatchObject({ ok: true });
    expect(
      updateMentorMatch({ ...cur("MM-L"), comment: "x" }, now),
    ).toMatchObject({ ok: true });
  });

  it("after manual reactivation, staff may continue the match deliberately; reactivation itself reopens nothing", () => {
    seed();
    expect(clearFFMentorInactive("VOL-X", actor, now).ok).toBe(
      true,
    );
    expect(cur("MM-1").endDate).toBe("10/19/2026");
    expect(
      updateMentorMatch(
        { ...cur("MM-1"), endDate: "12/31/2027" },
        now,
      ),
    ).toMatchObject({ ok: true });
  });

  it("an unreadable closure source or match list is refused, not ignored", () => {
    seed("{broken");
    expect(
      updateMentorMatch(
        { ...MATCHES[0], endDate: "12/31/2028" },
        now,
      ),
    ).toMatchObject({ ok: false, reason: "unavailable" });
    seed(undefined, "{broken");
    expect(
      updateMentorMatch({ ...MATCHES[2], comment: "x" }, now),
    ).toMatchObject({ ok: false, reason: "unavailable" });
    expect(localStorage.getItem(MATCH_KEY)).toBe("{broken");
  });

  it("a failed write changes neither storage nor memory", () => {
    seed();
    const before = localStorage.getItem(MATCH_KEY);
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
    try {
      expect(
        updateMentorMatch(
          { ...cur("MM-A"), comment: "new" },
          now,
        ),
      ).toMatchObject({ ok: false, reason: "storage" });
    } finally {
      Storage.prototype.setItem = orig;
    }
    expect(localStorage.getItem(MATCH_KEY)).toBe(before);
    expect(cur("MM-A").comment).toBe("c");
  });
});