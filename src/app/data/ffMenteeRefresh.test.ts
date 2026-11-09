// @vitest-environment jsdom
// Refresh from storage (US 20000): read failures change nothing and block
// saving; a successful read rebuilds the dataset from the seed baseline.
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  commitFFMenteeAtomic,
  getFFMatchClosures,
  getFFMentee,
  getFFReferral,
  isFFStoreUnreadable,
  listFFReferrals,
  refreshFFStoreFromStorage,
  setFFMenteeStage,
  updateFFMentee,
  __reloadFFStoreForTest,
} from "./ffMenteeStore";
import { buildMenteeSearchRows } from "./ffMenteeSearch";
import {
  MOCK_FF_MENTEES,
  type FFMentee,
  type FFReferralRecord,
} from "./mockFriendsFirstData";

const KEY = "mh.ffMenteeRecords.v1";
const SEED_ID = "MT-101";
const seedBefore = structuredClone(getFFMentee(SEED_ID)!);
const seedCount = MOCK_FF_MENTEES.length;

const clone = (
  id: string,
  o: Partial<FFMentee> = {},
): FFMentee => ({
  ...structuredClone(seedBefore),
  id,
  name: `Saved ${id}`,
  referralId: null,
  ...o,
});
const referral = (id: string, city: string, menteeId: string) =>
  ({
    id,
    submittedDate: "01/01/2026",
    status: "promoted",
    referralDate: "02/02/2026",
    menteeId,
    answers: { bd_city: city, bd_state: "IL" },
  }) as unknown as FFReferralRecord;
const closure = {
  endDate: "01/01/2026",
  endTime: "1:00 PM",
  at: 1,
};
const save = (data: {
  mentees?: Record<string, FFMentee>;
  referrals?: Record<string, FFReferralRecord>;
  matchClosures?: Record<string, typeof closure>;
}) =>
  localStorage.setItem(
    KEY,
    JSON.stringify({
      mentees: {},
      referrals: {},
      matchClosures: {},
      ...data,
    }),
  );
// A stage different from the cloned fixture's own, so a save is a real change.
const otherStage =
  seedBefore.stage === "Under Review"
    ? "Intake Scheduled"
    : "Under Review";
const names = () =>
  MOCK_FF_MENTEES.map((m) => m.id)
    .sort()
    .join();

describe("Refresh from storage", () => {
  beforeEach(() => {
    localStorage.clear();
    expect(refreshFFStoreFromStorage()).toBe(true);
  });
  afterEach(() => vi.restoreAllMocks());

  it("a successful empty read restores the seed baseline", () => {
    save({
      mentees: {
        "RT-1": clone("RT-1"),
        [SEED_ID]: clone(SEED_ID, {
          stage: "Matched",
          notes: "override",
        }),
      },
    });
    expect(refreshFFStoreFromStorage()).toBe(true);
    expect(getFFMentee("RT-1")).toBeDefined();
    localStorage.clear();
    expect(refreshFFStoreFromStorage()).toBe(true);
    expect(getFFMentee("RT-1")).toBeUndefined();
    expect(MOCK_FF_MENTEES).toHaveLength(seedCount);
    expect(getFFMentee(SEED_ID)).toEqual(seedBefore);
    expect(isFFStoreUnreadable()).toBe(false);
  });

  it("removed saved records disappear", () => {
    save({
      mentees: { "RT-A": clone("RT-A"), "RT-B": clone("RT-B") },
    });
    refreshFFStoreFromStorage();
    expect(
      [getFFMentee("RT-A"), getFFMentee("RT-B")].every(Boolean),
    ).toBe(true);
    save({ mentees: { "RT-A": clone("RT-A") } });
    refreshFFStoreFromStorage();
    expect(getFFMentee("RT-A")).toBeDefined();
    expect(getFFMentee("RT-B")).toBeUndefined();
  });

  it("removed seed overrides revert to the seed values", () => {
    save({
      mentees: {
        [SEED_ID]: clone(SEED_ID, {
          stage: "Matched",
          notes: "override",
        }),
      },
    });
    refreshFFStoreFromStorage();
    expect(getFFMentee(SEED_ID)!.notes).toBe("override");
    save({});
    refreshFFStoreFromStorage();
    expect(getFFMentee(SEED_ID)).toEqual(seedBefore);
  });

  it("keeps the shared array's identity and never writes to storage", () => {
    const ref = MOCK_FF_MENTEES;
    save({ mentees: { "RT-1": clone("RT-1") } });
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const removeItem = vi.spyOn(
      Storage.prototype,
      "removeItem",
    );
    expect(refreshFFStoreFromStorage()).toBe(true);
    expect(MOCK_FF_MENTEES).toBe(ref);
    expect(ref.some((m) => m.id === "RT-1")).toBe(true);
    expect(setItem).not.toHaveBeenCalled();
    expect(removeItem).not.toHaveBeenCalled();
  });

  it("updates linked referral fields", () => {
    const rows = () =>
      buildMenteeSearchRows(
        MOCK_FF_MENTEES,
        listFFReferrals(),
      ).find((r) => r.id === "RT-L")!;
    save({
      mentees: { "RT-L": clone("RT-L", { referralId: "R-L" }) },
      referrals: { "R-L": referral("R-L", "Evanston", "RT-L") },
    });
    refreshFFStoreFromStorage();
    expect(rows().location).toBe("Evanston, IL");
    expect(rows().referralDate).toBe("02/02/2026");
    save({
      mentees: { "RT-L": clone("RT-L", { referralId: "R-L" }) },
      referrals: { "R-L": referral("R-L", "Skokie", "RT-L") },
    });
    refreshFFStoreFromStorage();
    expect(getFFReferral("R-L")!.answers!.bd_city).toBe(
      "Skokie",
    );
    expect(rows().location).toBe("Skokie, IL");
  });

  describe("an ordinary edit whose save failed", () => {
    it("disappears after a successful Refresh and is never persisted by a later save", () => {
      save({
        mentees: {
          "RT-E": clone("RT-E", {
            stage: "Under Review",
            notes: "original",
          }),
        },
      });
      refreshFFStoreFromStorage();
      const stored = localStorage.getItem(KEY);
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(
        () => {
          throw new Error("quota");
        },
      );
      expect(
        updateFFMentee("RT-E", (m) => ({
          ...m,
          notes: "memory-only",
        })),
      ).toBe(false);
      vi.restoreAllMocks();
      expect(localStorage.getItem(KEY)).toBe(stored);

      expect(refreshFFStoreFromStorage()).toBe(true);
      expect(getFFMentee("RT-E")!.notes).toBe("original");

      expect(
        setFFMenteeStage("RT-E", "Intake Scheduled"),
      ).toMatchObject({ ok: true });
      const persisted = JSON.parse(localStorage.getItem(KEY)!)
        .mentees["RT-E"];
      expect(persisted.stage).toBe("Intake Scheduled");
      expect(persisted.notes).toBe("original");
    });
  });

  describe("an unreadable store", () => {
    const seedState = () => {
      save({
        mentees: { "RT-K": clone("RT-K") },
        referrals: {
          "R-K": referral("R-K", "Evanston", "RT-K"),
        },
        matchClosures: { "MM-1": closure },
      });
      refreshFFStoreFromStorage();
    };
    const snapshot = () => ({
      ids: names(),
      mentee: getFFMentee("RT-K"),
      referral: getFFReferral("R-K"),
      closures: { ...getFFMatchClosures() },
    });

    it("a read error preserves mentees, referrals and match closures", () => {
      seedState();
      const before = snapshot();
      const ref = MOCK_FF_MENTEES;
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(
        () => {
          throw new Error("denied");
        },
      );
      expect(refreshFFStoreFromStorage()).toBe(false);
      expect(snapshot()).toEqual(before);
      expect(snapshot().closures).toHaveProperty("MM-1");
      expect(MOCK_FF_MENTEES).toBe(ref);
    });

    it("a later save cannot erase data after a read error, and saving resumes after a good reread", () => {
      seedState();
      const stored = localStorage.getItem(KEY);
      const getItem = vi
        .spyOn(Storage.prototype, "getItem")
        .mockImplementation(() => {
          throw new Error("denied");
        });
      expect(refreshFFStoreFromStorage()).toBe(false);
      expect(isFFStoreUnreadable()).toBe(true);
      getItem.mockRestore(); // storage readable again, but nobody has reread it yet
      expect(setFFMenteeStage("RT-K", otherStage)).toEqual({
        ok: false,
        reason: "storage",
      });
      expect(commitFFMenteeAtomic(clone("RT-NEW"))).toBe(false);
      expect(localStorage.getItem(KEY)).toBe(stored);
      expect(getFFMentee("RT-K")!.stage).toBe(
        clone("RT-K").stage,
      );

      expect(refreshFFStoreFromStorage()).toBe(true);
      expect(isFFStoreUnreadable()).toBe(false);
      expect(
        setFFMenteeStage("RT-K", otherStage),
      ).toMatchObject({ ok: true });
      expect(
        JSON.parse(localStorage.getItem(KEY)!).matchClosures,
      ).toHaveProperty("MM-1");
    });

    it.each([
      ["invalid JSON", "{not json"],
      ["a non-object", "[1,2]"],
      ["a malformed section", JSON.stringify({ mentees: [] })],
      [
        "a malformed record",
        JSON.stringify({ mentees: { x: "nope" } }),
      ],
    ])(
      "corrupt data (%s) leaves the dataset unchanged and blocks saving",
      (_n, text) => {
        seedState();
        const before = snapshot();
        localStorage.setItem(KEY, text);
        expect(refreshFFStoreFromStorage()).toBe(false);
        expect(snapshot()).toEqual(before);
        expect(setFFMenteeStage("RT-K", otherStage)).toEqual({
          ok: false,
          reason: "storage",
        });
        expect(localStorage.getItem(KEY)).toBe(text);
        // Repairing the stored data and refreshing recovers normal operation.
        save({ mentees: { "RT-K": clone("RT-K") } });
        expect(refreshFFStoreFromStorage()).toBe(true);
        expect(
          setFFMenteeStage("RT-K", otherStage),
        ).toMatchObject({ ok: true });
      },
    );
  });

  it("a fresh load from corrupt data falls back to seed data with saving disabled", () => {
    localStorage.setItem(KEY, "{not json");
    __reloadFFStoreForTest();
    expect(isFFStoreUnreadable()).toBe(true);
    expect(MOCK_FF_MENTEES).toHaveLength(seedCount);
    expect(localStorage.getItem(KEY)).toBe("{not json");
    localStorage.clear();
    expect(refreshFFStoreFromStorage()).toBe(true);
    expect(isFFStoreUnreadable()).toBe(false);
  });
});