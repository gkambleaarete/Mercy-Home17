import { describe, expect, it } from "vitest";
import {
  FF_MENTOR_LEGACY_STAGES,
  FF_MENTOR_PIPELINE_STAGES,
  FF_MENTOR_SELECTABLE_STAGES,
  ffAccountCreatedDate,
  isFFMentorPipelineStage,
  isFFMentorSelectableStage,
} from "./ffMentorApplication";

describe("mentor pipeline stages", () => {
  it("are exactly the eight requested stages in order, with Rejected at 7", () => {
    expect([...FF_MENTOR_PIPELINE_STAGES]).toEqual([
      "Info Session",
      "Application",
      "Interview",
      "Profile",
      "Post-Interview Requirements",
      "Determination",
      "Rejected",
      "Ready for Match",
    ]);
    expect([...FF_MENTOR_SELECTABLE_STAGES]).toEqual([
      ...FF_MENTOR_PIPELINE_STAGES,
    ]);
  });
  it("keeps Matched and Active readable but not selectable", () => {
    for (const s of FF_MENTOR_LEGACY_STAGES) {
      expect(isFFMentorPipelineStage(s)).toBe(true);
      expect(isFFMentorSelectableStage(s)).toBe(false);
    }
    expect(isFFMentorPipelineStage("Nonsense")).toBe(false);
  });
});

describe("Account Created Date", () => {
  it("formats a recorded date without a timezone shift", () => {
    expect(
      ffAccountCreatedDate({ accountCreatedAt: "2026-03-05" }),
    ).toBe("03/05/2026");
    expect(
      ffAccountCreatedDate({ accountCreatedAt: "03/05/2026" }),
    ).toBe("03/05/2026");
  });
  it("is empty when absent or invalid; never guesses", () => {
    expect(ffAccountCreatedDate({})).toBe("");
    expect(ffAccountCreatedDate(undefined)).toBe("");
    expect(
      ffAccountCreatedDate({ accountCreatedAt: "2026-02-30" }),
    ).toBe("");
    expect(
      ffAccountCreatedDate({ accountCreatedAt: "garbage" }),
    ).toBe("");
  });
});