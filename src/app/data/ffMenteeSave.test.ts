// @vitest-environment jsdom
// Ordinary mentee saves are all-or-nothing: a failed write leaves committed
// memory, the shared array, snapshots, subscribers and stored text untouched.
import { createElement, act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  getFFMentee,
  isFFStoreUnreadable,
  refreshFFStoreFromStorage,
  saveFFIntakeConnection,
  setFFMenteeDocument,
  setFFMenteeStage,
  updateFFMentee,
  useFFMentees,
  __reloadFFStoreForTest,
} from "./ffMenteeStore";
import {
  MOCK_FF_MENTEES,
  type FFMentee,
} from "./mockFriendsFirstData";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const KEY = "mh.ffMenteeRecords.v1";
const ID = "MT-101";
const failWrites = () =>
  vi
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new Error("quota");
    });
const editNotes = (notes: string) =>
  updateFFMentee(ID, (m) => ({ ...m, notes }));

describe("ordinary mentee saves are all-or-nothing", () => {
  let original: FFMentee;
  let originalNotes: string;
  let nextStage: FFMentee["stage"];
  beforeEach(() => {
    localStorage.clear();
    expect(refreshFFStoreFromStorage()).toBe(true);
    original = getFFMentee(ID)!;
    originalNotes = original.notes;
    nextStage =
      original.stage === "Under Review"
        ? "Intake Scheduled"
        : "Under Review";
  });
  afterEach(() => vi.restoreAllMocks());

  it("1. a failed edit leaves committed memory and stored text unchanged", () => {
    expect(editNotes("good")).toBe(true); // establish stored text
    const stored = localStorage.getItem(KEY);
    const before = getFFMentee(ID)!;
    const arrayRef = MOCK_FF_MENTEES;
    const slot = MOCK_FF_MENTEES.findIndex((m) => m.id === ID);
    failWrites();
    expect(editNotes("memory-only")).toBe(false);
    vi.restoreAllMocks();
    expect(localStorage.getItem(KEY)).toBe(stored);
    expect(getFFMentee(ID)).toBe(before);
    expect(getFFMentee(ID)!.notes).toBe("good");
    expect(MOCK_FF_MENTEES).toBe(arrayRef);
    expect(MOCK_FF_MENTEES[slot]).toBe(before);
  });

  it("2. a later successful stage change does not persist the failed edit (no Refresh in between)", () => {
    failWrites();
    expect(editNotes("memory-only")).toBe(false);
    vi.restoreAllMocks();
    expect(setFFMenteeStage(ID, nextStage)).toMatchObject({
      ok: true,
      changed: true,
    });
    const saved = JSON.parse(localStorage.getItem(KEY)!)
      .mentees[ID];
    expect(saved.stage).toBe(nextStage);
    expect(saved.notes).toBe(originalNotes);
    expect(getFFMentee(ID)!.notes).toBe(originalNotes);
  });

  it("3. the failed field is unchanged after reloading the store", () => {
    failWrites();
    expect(editNotes("memory-only")).toBe(false);
    vi.restoreAllMocks();
    __reloadFFStoreForTest();
    expect(getFFMentee(ID)!.notes).toBe(originalNotes);
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("failed intake-connection and document saves change nothing either", () => {
    const conn = {
      id: "IC-1",
      menteeId: ID,
      startDate: "01/01/2027",
      startTime: "1:00 PM",
      endDate: "01/01/2027",
      endTime: "2:00 PM",
      location: "x",
      participants: [],
      attended: false,
    };
    const before = getFFMentee(ID)!;
    failWrites();
    expect(saveFFIntakeConnection(conn)).toBe(false);
    expect(
      setFFMenteeDocument(ID, "publicity-release", true),
    ).toBe(false);
    vi.restoreAllMocks();
    expect(getFFMentee(ID)).toBe(before);
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(saveFFIntakeConnection(conn)).toBe(true);
    expect(
      setFFMenteeDocument(ID, "publicity-release", true),
    ).toBe(true);
    const saved = JSON.parse(localStorage.getItem(KEY)!)
      .mentees[ID];
    expect(saved.intakeConnections).toHaveLength(1);
    expect(saved.documents["publicity-release"].complete).toBe(
      true,
    );
  });

  describe("subscribers", () => {
    let root: Root;
    let seen: FFMentee[][];
    beforeEach(async () => {
      seen = [];
      const el = document.createElement("div");
      root = createRoot(el);
      const Probe = () => {
        seen.push(useFFMentees());
        return null;
      };
      await act(async () => root.render(createElement(Probe)));
    });
    afterEach(async () => act(async () => root.unmount()));

    it("4. a successful edit persists and notifies subscribers with the new data", async () => {
      const rendersBefore = seen.length;
      let ok = false;
      await act(async () => {
        ok = editNotes("saved note");
      });
      expect(ok).toBe(true);
      expect(seen.length).toBeGreaterThan(rendersBefore);
      expect(seen.at(-1)!.find((m) => m.id === ID)!.notes).toBe(
        "saved note",
      );
      expect(
        JSON.parse(localStorage.getItem(KEY)!).mentees[ID]
          .notes,
      ).toBe("saved note");
    });

    it("5. a failed save sends no update notification", async () => {
      const snapshotBefore = seen.at(-1);
      const rendersBefore = seen.length;
      failWrites();
      await act(async () => {
        expect(editNotes("memory-only")).toBe(false);
      });
      vi.restoreAllMocks();
      expect(seen.length).toBe(rendersBefore);
      expect(seen.at(-1)).toBe(snapshotBefore);
    });
  });

  it("6. unreadable storage blocks saving; a successful Refresh restores it", () => {
    expect(editNotes("first")).toBe(true);
    localStorage.setItem(KEY, "{corrupt");
    expect(refreshFFStoreFromStorage()).toBe(false);
    expect(isFFStoreUnreadable()).toBe(true);
    expect(editNotes("blocked")).toBe(false);
    expect(setFFMenteeStage(ID, nextStage)).toEqual({
      ok: false,
      reason: "storage",
    });
    expect(localStorage.getItem(KEY)).toBe("{corrupt");
    expect(getFFMentee(ID)!.notes).toBe("first");

    localStorage.setItem(
      KEY,
      JSON.stringify({
        mentees: {},
        referrals: {},
        matchClosures: {},
      }),
    );
    expect(refreshFFStoreFromStorage()).toBe(true);
    expect(isFFStoreUnreadable()).toBe(false);
    expect(editNotes("after repair")).toBe(true);
    expect(
      JSON.parse(localStorage.getItem(KEY)!).mentees[ID].notes,
    ).toBe("after repair");
  });
});