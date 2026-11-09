// @vitest-environment jsdom
// Mentee Inactive is saved atomically and stays separate from the stage.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearMenteeInactive,
  confirmMenteeInactive,
} from "./ffMenteeInactive";
import {
  getFFMentee,
  refreshFFStoreFromStorage,
} from "./ffMenteeStore";

const KEY = "mh.ffMenteeRecords.v1";
const ID = "MT-101";

describe("mentee Inactive", () => {
  beforeEach(() => {
    localStorage.clear();
    refreshFFStoreFromStorage();
  });
  afterEach(() => vi.restoreAllMocks());

  it("marks Inactive and back, leaving the pipeline stage untouched", () => {
    const stage = getFFMentee(ID)!.stage;
    expect(confirmMenteeInactive(ID)).toMatchObject({ ok: true });
    expect(getFFMentee(ID)!.inactive).toBe(true);
    expect(JSON.parse(localStorage.getItem(KEY)!).mentees[ID].inactive).toBe(true);
    expect(getFFMentee(ID)!.stage).toBe(stage);
    expect(confirmMenteeInactive(ID)).toMatchObject({ ok: true, noop: true });
    expect(clearMenteeInactive(ID)).toBe(true);
    expect(getFFMentee(ID)!.inactive).toBe(false);
    expect(getFFMentee(ID)!.stage).toBe(stage);
  });

  it("a failed save changes nothing, in memory or in storage", () => {
    const before = getFFMentee(ID)!;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(confirmMenteeInactive(ID)).toMatchObject({ ok: false, reason: "storage" });
    vi.restoreAllMocks();
    expect(getFFMentee(ID)).toBe(before);
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});