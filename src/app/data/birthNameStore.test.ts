// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

// Fresh module graph = what a page refresh does (re-reads localStorage).
async function boot() {
  vi.resetModules();
  return import("./birthNameStore");
}

describe("birthNameStore (US 20161)", () => {
  beforeEach(() => window.localStorage.clear());

  it("legacy records without the property read as blank", async () => {
    const s = await boot();
    expect(s.getBirthName({ constituentId: "5" })).toBe("");
  });

  it("saves, survives refresh, and clears", async () => {
    let s = await boot();
    expect(s.saveBirthName({ constituentId: "5" }, " Smith ")).toBe(true);
    s = await boot();
    expect(s.getBirthName({ constituentId: "5" })).toBe("Smith");
    s.saveBirthName({ constituentId: "5" }, "");
    s = await boot();
    expect(s.getBirthName({ constituentId: "5" })).toBe("");
  });

  it("isolates people by id", async () => {
    const s = await boot();
    s.saveBirthName({ constituentId: "5" }, "Smith");
    expect(s.getBirthName({ constituentId: "6" })).toBe("");
    expect(s.getBirthName({ admissionId: "L-1" })).toBe("");
  });

  it("linked Admissions and Constituent show the same value", async () => {
    const s = await boot();
    const adm = { admissionId: "L-1", constituentId: "5" };
    s.saveBirthName(adm, "Smith");
    expect(s.getBirthName({ constituentId: "5" })).toBe("Smith");
    expect(s.getBirthName(adm)).toBe("Smith");
  });

  it("pre-link Admissions value is preserved but a linked view matches the Youth view", async () => {
    const s = await boot();
    s.saveBirthName({ admissionId: "L-1" }, "Lee");
    const linked = { admissionId: "L-1", constituentId: "5" };
    expect(s.getBirthName({ admissionId: "L-1" })).toBe("Lee");
    expect(s.getBirthName(linked)).toBe("");
    expect(s.getBirthName({ constituentId: "5" })).toBe("");
    s.saveBirthName(linked, "Smith");
    expect(s.getBirthName({ admissionId: "L-1" })).toBe("Lee");
    expect(s.getBirthName({ constituentId: "5" })).toBe("Smith");
  });

  it("differing values: linked views show the Constituent value, neither is overwritten", async () => {
    const s = await boot();
    s.saveBirthName({ admissionId: "L-1" }, "Lee");
    s.saveBirthName({ constituentId: "5" }, "Smith");
    const linked = { admissionId: "L-1", constituentId: "5" };
    expect(s.getBirthName(linked)).toBe("Smith");
    expect(s.getBirthName({ admissionId: "L-1" })).toBe("Lee");
  });

  it("failed write keeps the previous save and returns false", async () => {
    const s = await boot();
    s.saveBirthName({ constituentId: "5" }, "Smith");
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota");
      });
    expect(s.saveBirthName({ constituentId: "5" }, "Jones")).toBe(false);
    spy.mockRestore();
    expect(s.getBirthName({ constituentId: "5" })).toBe("Smith");
  });

  // Independent store instances = separate tabs sharing one localStorage.
  describe("stale tabs sharing storage", () => {
    it("both load before either writes: both people survive reload", async () => {
      const a = await boot();
      const b = await boot();
      expect(a.saveBirthName({ constituentId: "1" }, "Smith")).toBe(true);
      expect(b.saveBirthName({ constituentId: "2" }, "Jones")).toBe(true);
      const c = await boot();
      expect(c.getBirthName({ constituentId: "1" })).toBe("Smith");
      expect(c.getBirthName({ constituentId: "2" })).toBe("Jones");
    });

    it("updating one person keeps everyone else's current value", async () => {
      const a = await boot();
      const b = await boot();
      a.saveBirthName({ constituentId: "1" }, "Smith");
      a.saveBirthName({ admissionId: "L-1" }, "Lee");
      b.saveBirthName({ constituentId: "2" }, "Jones");
      expect(b.getBirthName({ constituentId: "1" })).toBe("Smith");
      expect(b.getBirthName({ admissionId: "L-1" })).toBe("Lee");
    });

    it("a clear is not undone by a stale save for someone else", async () => {
      const a = await boot();
      a.saveBirthName({ constituentId: "1" }, "Smith");
      const b = await boot();
      a.saveBirthName({ admissionId: "L-1", constituentId: "1" }, "");
      b.saveBirthName({ constituentId: "2" }, "Jones");
      const c = await boot();
      expect(c.getBirthName({ constituentId: "1" })).toBe("");
      expect(c.getBirthName({ constituentId: "2" })).toBe("Jones");
    });

    it("malformed storage: save fails and storage is not replaced", async () => {
      window.localStorage.setItem("mh.birthName.v1", "{not json");
      const a = await boot();
      expect(a.saveBirthName({ constituentId: "1" }, "Smith")).toBe(false);
      expect(window.localStorage.getItem("mh.birthName.v1")).toBe("{not json");
      expect(a.getBirthName({ constituentId: "1" })).toBe("");
    });

    it("storage that becomes malformed after load is not overwritten", async () => {
      const a = await boot();
      a.saveBirthName({ constituentId: "1" }, "Smith");
      window.localStorage.setItem("mh.birthName.v1", "[1,2]");
      expect(a.saveBirthName({ constituentId: "2" }, "Jones")).toBe(false);
      expect(window.localStorage.getItem("mh.birthName.v1")).toBe("[1,2]");
    });

    it("read error: save fails without writing", async () => {
      const a = await boot();
      const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("blocked");
      });
      const set = vi.spyOn(Storage.prototype, "setItem");
      expect(a.saveBirthName({ constituentId: "1" }, "Smith")).toBe(false);
      expect(set).not.toHaveBeenCalled();
      get.mockRestore();
      set.mockRestore();
    });

    it("a failed write leaves old data intact, including others' values", async () => {
      const a = await boot();
      const b = await boot();
      a.saveBirthName({ constituentId: "1" }, "Smith");
      const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("quota");
      });
      expect(b.saveBirthName({ constituentId: "2" }, "Jones")).toBe(false);
      spy.mockRestore();
      const c = await boot();
      expect(c.getBirthName({ constituentId: "1" })).toBe("Smith");
      expect(c.getBirthName({ constituentId: "2" })).toBe("");
      expect(b.getBirthName({ constituentId: "2" })).toBe("");
    });

    it("unknown stored entries are preserved", async () => {
      window.localStorage.setItem(
        "mh.birthName.v1",
        JSON.stringify({ "constituent:9": "Old", extra: 5 }),
      );
      const a = await boot();
      a.saveBirthName({ constituentId: "1" }, "Smith");
      const saved = JSON.parse(window.localStorage.getItem("mh.birthName.v1")!);
      expect(saved).toEqual({ "constituent:9": "Old", extra: 5, "constituent:1": "Smith" });
    });
  });
});
