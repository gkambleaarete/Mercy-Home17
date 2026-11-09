import { beforeEach, describe, expect, it } from "vitest";
import {
  __failNextFriendsFirstWriteForTest,
  createFriendsFirstSession,
  getFriendsFirstSession,
  getFriendsFirstSessions,
  registerApplicantForFriendsFirstSession,
  resetFriendsFirstSessionStore,
  updateFriendsFirstSession,
  type FFSessionDraft,
} from "./friendsFirstSessionStore";
import {
  FRIENDS_FIRST_MENTOR_ROLE,
  hasQualifyingFriendsFirstAttendance,
  listEligibleFriendsFirstSessions,
  validateFriendsFirstSession,
} from "../lib/friendsFirstSession";

const NOW = new Date(2026, 9, 27, 12, 0); // Oct 27 2026, noon

const valid: FFSessionDraft = {
  startDate: "11/03/2026",
  startTime: "6:00 PM",
  endDate: "11/03/2026",
  endTime: "7:30 PM",
  location: "Conference Room - Admissions",
};

function make(over: FFSessionDraft = {}) {
  const r = createFriendsFirstSession({ ...valid, ...over });
  if (!r.ok) throw new Error(r.error);
  return r.session;
}

const register = (
  sessionId: string,
  applicantId = "APP-1",
  now = NOW,
) =>
  registerApplicantForFriendsFirstSession({
    sessionId,
    applicantId,
    applicantName: "Ada Applicant",
    now,
  });

beforeEach(() => resetFriendsFirstSessionStore());

describe("validateFriendsFirstSession", () => {
  it("requires dates, times and location", () => {
    const e = validateFriendsFirstSession({});
    expect(Object.keys(e).sort()).toEqual(
      [
        "endDate",
        "endTime",
        "location",
        "startDate",
        "startTime",
      ].sort(),
    );
  });

  it("rejects malformed and impossible dates and times", () => {
    const e = validateFriendsFirstSession({
      ...valid,
      startDate: "02/31/2026",
      startTime: "25:99",
    });
    expect(e.startDate).toBeTruthy();
    expect(e.startTime).toBeTruthy();
  });

  it("rejects an end before the start, same day or earlier day", () => {
    expect(
      validateFriendsFirstSession({
        ...valid,
        endTime: "5:00 PM",
      }).range,
    ).toBeTruthy();
    expect(
      validateFriendsFirstSession({
        ...valid,
        endDate: "11/02/2026",
      }).range,
    ).toBeTruthy();
    expect(validateFriendsFirstSession(valid)).toEqual({});
  });

  it("requires the text when Location is Other", () => {
    expect(
      validateFriendsFirstSession({
        ...valid,
        location: "Other",
      }).locationOther,
    ).toBeTruthy();
  });
});

describe("staff session creation", () => {
  it("saves a future session with no participants, comments or attendance", () => {
    const s = make();
    expect(s.id).toBe("FFIS-0001");
    expect(s.participantList).toEqual([]);
    expect(getFriendsFirstSessions()).toHaveLength(1);
  });

  it("gives every session its own stable ID", () => {
    const a = make();
    const b = make();
    expect(a.id).not.toBe(b.id);
    updateFriendsFirstSession(a.id, { comments: "x" });
    expect(getFriendsFirstSession(a.id)!.id).toBe(a.id);
  });

  it("refuses an invalid draft and writes nothing", () => {
    const r = createFriendsFirstSession({
      ...valid,
      endTime: "5:00 PM",
    });
    expect(r.ok).toBe(false);
    expect(getFriendsFirstSessions()).toHaveLength(0);
  });

  it("reports a failed write and leaves the store unchanged", () => {
    __failNextFriendsFirstWriteForTest("backend down");
    const r = createFriendsFirstSession(valid);
    expect(r).toEqual({ ok: false, error: "backend down" });
    expect(getFriendsFirstSessions()).toHaveLength(0);
  });

  it("keeps participants, roles, attendance, identities and Comments across edits", () => {
    const s = make();
    const r = updateFriendsFirstSession(s.id, {
      comments: "Bring ID",
      participantList: [
        {
          id: 1000,
          constituentType: "Constituent",
          participant: "Youth A",
          entityId: "C-9",
          role: "Youth",
          attended: true,
          reasonMissed: "",
        },
        {
          id: 1001,
          constituentType: "Non-Constituent",
          participant: "Pat Staff",
          role: "Coordinator",
          attended: false,
          reasonMissed: "Sick - Excused",
        },
      ],
    });
    expect(r.ok).toBe(true);
    const saved = getFriendsFirstSession(s.id)!;
    expect(saved.comments).toBe("Bring ID");
    expect(saved.participants).toBe("Youth A, Pat Staff");
    expect(
      saved.participantList.map((p) => p.entityId),
    ).toEqual(["C-9", undefined]);
    expect(saved.participantList.every((p) => !!p.uid)).toBe(
      true,
    );
    const uids = saved.participantList.map((p) => p.uid);
    // a second edit keeps the same identities
    updateFriendsFirstSession(s.id, { comments: "Updated" });
    expect(
      getFriendsFirstSession(s.id)!.participantList.map(
        (p) => p.uid,
      ),
    ).toEqual(uids);
    expect(
      getFriendsFirstSession(s.id)!.participantList[1],
    ).toMatchObject({
      attended: false,
      reasonMissed: "Sick - Excused",
    });
  });

  it("fails an update for a session that does not exist", () => {
    expect(updateFriendsFirstSession("FFIS-9999", {}).ok).toBe(
      false,
    );
  });
});

describe("applicant registration", () => {
  it("adds a Non-Constituent Friends First Mentor to the selected session only", () => {
    const a = make();
    const b = make();
    const r = register(a.id);
    expect(r.ok).toBe(true);
    const p = getFriendsFirstSession(a.id)!.participantList;
    expect(p).toHaveLength(1);
    expect(p[0]).toMatchObject({
      constituentType: "Non-Constituent",
      role: FRIENDS_FIRST_MENTOR_ROLE,
      entityId: "APP-1",
      attended: null,
      participant: "Ada Applicant",
    });
    expect(
      getFriendsFirstSession(b.id)!.participantList,
    ).toHaveLength(0);
    expect(getFriendsFirstSessions()).toHaveLength(2); // no new connection
  });

  it("does not duplicate the applicant on repeated submission", () => {
    const s = make();
    register(s.id);
    const again = register(s.id);
    expect(again).toMatchObject({
      ok: true,
      alreadyRegistered: true,
    });
    expect(
      getFriendsFirstSession(s.id)!.participantList,
    ).toHaveLength(1);
    expect(getFriendsFirstSession(s.id)!.version).toBe(2);
  });

  it("registers several applicants with distinct row ids", () => {
    const s = make();
    register(s.id, "APP-1");
    register(s.id, "APP-2");
    const ids = getFriendsFirstSession(
      s.id,
    )!.participantList.map((p) => p.id);
    expect(new Set(ids).size).toBe(2);
  });

  it("refuses past, cancelled and completed sessions", () => {
    const past = make({
      startDate: "10/01/2026",
      endDate: "10/01/2026",
    });
    const cancelled = make({ status: "Cancelled" });
    const completed = make({ status: "Completed" });
    for (const s of [past, cancelled, completed]) {
      expect(register(s.id).ok).toBe(false);
      expect(
        getFriendsFirstSession(s.id)!.participantList,
      ).toHaveLength(0);
    }
  });

  it("requires a stable applicant ID and an existing session", () => {
    const s = make();
    expect(register(s.id, "  ").ok).toBe(false);
    expect(register("FFIS-9999").ok).toBe(false);
  });

  it("reports a failed write and registers nothing", () => {
    const s = make();
    __failNextFriendsFirstWriteForTest("backend down");
    expect(register(s.id).ok).toBe(false);
    expect(
      getFriendsFirstSession(s.id)!.participantList,
    ).toHaveLength(0);
  });

  it("lists only future Scheduled sessions, soonest first", () => {
    const later = make({
      startDate: "12/01/2026",
      endDate: "12/01/2026",
    });
    const sooner = make();
    make({ startDate: "10/01/2026", endDate: "10/01/2026" });
    make({ status: "Cancelled" });
    make({ status: "Completed" });
    expect(
      listEligibleFriendsFirstSessions(
        getFriendsFirstSessions(),
        NOW,
      ).map((s) => s.id),
    ).toEqual([sooner.id, later.id]);
  });

  it("keeps an applicant who registers while staff have the session open", () => {
    const s = make();
    const opened = getFriendsFirstSession(s.id)!.version;
    register(s.id, "APP-7");
    // staff save a draft built before the registration
    const r = updateFriendsFirstSession(
      s.id,
      { comments: "Staff edit", participantList: [] },
      opened,
    );
    expect(r.ok).toBe(true);
    const saved = getFriendsFirstSession(s.id)!;
    expect(saved.comments).toBe("Staff edit");
    expect(
      saved.participantList.map((p) => p.entityId),
    ).toEqual(["APP-7"]);
  });

  it("lets staff remove an applicant they could already see", () => {
    const s = make();
    register(s.id, "APP-7");
    const opened = getFriendsFirstSession(s.id)!.version;
    updateFriendsFirstSession(
      s.id,
      { participantList: [] },
      opened,
    );
    expect(
      getFriendsFirstSession(s.id)!.participantList,
    ).toHaveLength(0);
  });
});

describe("attendance prerequisite", () => {
  const mark = (id: string, attended: boolean | null) => {
    const cur = getFriendsFirstSession(id)!;
    updateFriendsFirstSession(id, {
      participantList: cur.participantList.map((p) => ({
        ...p,
        attended,
      })),
    });
  };
  const ok = () =>
    hasQualifyingFriendsFirstAttendance(
      getFriendsFirstSessions(),
      "APP-1",
    );

  it("is locked after registration alone", () => {
    const s = make();
    register(s.id);
    expect(ok()).toBe(false);
  });

  it("is not satisfied by a Completed session or elapsed time", () => {
    const s = make({
      startDate: "10/01/2026",
      endDate: "10/01/2026",
    });
    // register while it was still upcoming, then let it complete
    registerApplicantForFriendsFirstSession({
      sessionId: s.id,
      applicantId: "APP-1",
      applicantName: "Ada",
      now: new Date(2026, 8, 1),
    });
    updateFriendsFirstSession(s.id, { status: "Completed" });
    expect(ok()).toBe(false);
  });

  it("stays locked when attendance is Absent", () => {
    const s = make();
    register(s.id);
    mark(s.id, false);
    expect(ok()).toBe(false);
  });

  it("unlocks only when the applicant's own record is Present", () => {
    const s = make();
    register(s.id, "APP-1");
    register(s.id, "APP-2");
    const cur = getFriendsFirstSession(s.id)!;
    updateFriendsFirstSession(s.id, {
      participantList: cur.participantList.map((p) =>
        p.entityId === "APP-2" ? { ...p, attended: true } : p,
      ),
    });
    expect(ok()).toBe(false); // someone else's attendance does not count
    mark(s.id, true);
    expect(ok()).toBe(true);
  });

  it("does not count a cancelled session", () => {
    const s = make();
    register(s.id);
    mark(s.id, true);
    updateFriendsFirstSession(s.id, { status: "Cancelled" });
    expect(ok()).toBe(false);
  });

  it("does not count another role or an unknown applicant", () => {
    const s = make();
    register(s.id);
    mark(s.id, true);
    expect(
      hasQualifyingFriendsFirstAttendance(
        getFriendsFirstSessions(),
        "",
      ),
    ).toBe(false);
    expect(
      hasQualifyingFriendsFirstAttendance(
        getFriendsFirstSessions(),
        "APP-3",
      ),
    ).toBe(false);
  });
});