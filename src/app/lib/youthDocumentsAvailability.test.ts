import { describe, expect, it } from "vitest";
import { uploadAvailability } from "./youthDocumentsAvailability";

const ok = {
  hasOwner: true,
  canUpload: true,
  catalogReady: true,
  storageReady: true,
};

describe("uploadAvailability", () => {
  it("is enabled only when every condition holds", () => {
    expect(uploadAvailability(ok)).toEqual({ state: "enabled" });
  });
  it("hides the action without permission, whatever else is true", () => {
    expect(
      uploadAvailability({ ...ok, canUpload: false, catalogReady: false }),
    ).toEqual({ state: "hidden" });
  });
  it("an Admissions-owned upload also needs Admissions filing support", () => {
    const base = { ...ok, ownerIsAdmission: true };
    expect(uploadAvailability(base)).toMatchObject({ state: "disabled" });
    expect(
      uploadAvailability({ ...base, admissionFilingReady: true }),
    ).toEqual({ state: "enabled" });
    // a Youth-owned upload never depends on it
    expect(uploadAvailability({ ...ok, admissionFilingReady: false })).toEqual({
      state: "enabled",
    });
  });
  it("disables with a reason when the owner cannot be verified", () => {
    expect(
      uploadAvailability({ ...ok, hasOwner: false }),
    ).toMatchObject({ state: "disabled" });
  });
  it("disables with a reason for an unavailable catalog or storage", () => {
    const c = uploadAvailability({ ...ok, catalogReady: false });
    const s = uploadAvailability({ ...ok, storageReady: false });
    expect(c).toMatchObject({ state: "disabled" });
    expect(s).toMatchObject({ state: "disabled" });
    expect(c).not.toEqual(s);
  });
});