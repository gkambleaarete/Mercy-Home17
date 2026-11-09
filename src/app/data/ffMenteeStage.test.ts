// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { getFFMentee, setFFMenteeStage } from "./ffMenteeStore";
import { MOCK_FF_MENTEES } from "./mockFriendsFirstData";

const KEY = "mh.ffMenteeRecords.v1";
const target = () =>
  MOCK_FF_MENTEES.find(
    (m) => !m.promotionDate && m.stage !== "Ready for Match",
  )!;

describe("setFFMenteeStage", () => {
  afterEach(() => vi.restoreAllMocks());

  it("failed save leaves the stage and Promotion Date unchanged", () => {
    const id = target().id;
    const before = { ...getFFMentee(id)! };
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      () => {
        throw new Error("quota");
      },
    );
    expect(setFFMenteeStage(id, "Ready for Match")).toEqual({
      ok: false,
      reason: "storage",
    });
    const after = getFFMentee(id)!;
    expect(after.stage).toBe(before.stage);
    expect(after.promotionDate).toBe(before.promotionDate);
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("saves stage and first-promotion date together, then keeps the date", () => {
    const id = target().id;
    expect(setFFMenteeStage(id, "Ready for Match")).toEqual({
      ok: true,
      changed: true,
    });
    const promoted = getFFMentee(id)!;
    expect(promoted.promotionDate).toMatch(
      /^\d{2}\/\d{2}\/\d{4}$/,
    );
    const saved = JSON.parse(localStorage.getItem(KEY)!)
      .mentees[id];
    expect(saved.stage).toBe("Ready for Match");
    expect(saved.promotionDate).toBe(promoted.promotionDate);

    expect(setFFMenteeStage(id, "Matched")).toEqual({
      ok: true,
      changed: true,
    });
    expect(getFFMentee(id)!.promotionDate).toBe(
      promoted.promotionDate,
    );
    expect(setFFMenteeStage(id, "Active")).toEqual({
      ok: true,
      changed: true,
    });
    expect(getFFMentee(id)!.promotionDate).toBe(
      promoted.promotionDate,
    );
    // Re-selecting the same stage changes nothing.
    expect(setFFMenteeStage(id, "Active")).toEqual({
      ok: true,
      changed: false,
    });
    expect(getFFMentee(id)!.promotionDate).toBe(
      promoted.promotionDate,
    );
  });

  it("reports a missing record", () => {
    expect(setFFMenteeStage("NOPE", "Active")).toEqual({
      ok: false,
      reason: "missing",
    });
  });
});