// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

// Fresh module graph = what a page refresh does (re-reads localStorage).
async function boot() {
  vi.resetModules();
  const store = await import("./campusRestrictionStore");
  const sel = await import("../lib/campusRestrictionActive");
  return { store, sel };
}

const rec = (id: number, over: Record<string, string> = {}) => ({
  id,
  youth: "Y",
  type: "No Access to West Loop",
  startDate: "06/01/2026",
  endDate: "",
  implementedBy: "",
  restrictionReason: "",
  campusContact: "",
  restorativeMeasureDetails: "",
  endedBy: "",
  ...over,
});

// Test-only rule so selection mechanics can be exercised. It is NOT the
// business rule (none is defined yet).
const testRule = (r: { endDate: string }) => r.endDate === "";

describe("campusRestrictionStore (US 20160)", () => {
  beforeEach(() => window.localStorage.clear());

  it("saves per Constituent ID, survives refresh, and isolates youths", async () => {
    let { store } = await boot();
    expect(store.saveCampusRestriction("1", rec(10))).toBe(true);
    ({ store } = await boot());
    const one = store.readCampusRestrictions("1");
    expect(one.status === "ok" && one.records.map((r) => r.id)).toEqual([10]);
    const two = store.readCampusRestrictions("2");
    expect(two.status === "ok" && two.records).toEqual([]);
  });

  it("modify replaces the record with the same id", async () => {
    const { store } = await boot();
    store.saveCampusRestriction("1", rec(10));
    store.saveCampusRestriction("1", rec(10, { endDate: "07/01/2026" }));
    const r = store.readCampusRestrictions("1");
    expect(r.status === "ok" && r.records).toHaveLength(1);
    expect(r.status === "ok" && r.records[0].endDate).toBe("07/01/2026");
  });

  it("a failed write keeps the previous save and returns false", async () => {
    const { store } = await boot();
    store.saveCampusRestriction("1", rec(10));
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(store.saveCampusRestriction("1", rec(11))).toBe(false);
    spy.mockRestore();
    const r = store.readCampusRestrictions("1");
    expect(r.status === "ok" && r.records).toHaveLength(1);
  });

  it("corrupt storage is an error, not an empty list", async () => {
    window.localStorage.setItem("mh.campusRestrictions.v1", "{not json");
    const { store } = await boot();
    expect(store.readCampusRestrictions("1").status).toBe("error");
    expect(store.saveCampusRestriction("1", rec(1))).toBe(false);
  });
});

describe("summarizeRestrictions", () => {
  const today = new Date(2026, 5, 15);
  it("no records is none", async () => {
    const { sel } = await boot();
    expect(sel.summarizeRestrictions([], today, testRule).kind).toBe("none");
  });
  it("selects only records the rule marks active", async () => {
    const { sel } = await boot();
    const s = sel.summarizeRestrictions(
      [rec(1), rec(2, { endDate: "06/15/2026" }), rec(3)],
      today,
      testRule,
    );
    expect(s.kind === "active" && s.active.map((r) => r.id)).toEqual([1, 3]);
  });
  it("all ended is none", async () => {
    const { sel } = await boot();
    expect(
      sel.summarizeRestrictions([rec(2, { endDate: "06/15/2026" })], today, testRule).kind,
    ).toBe("none");
  });
  it("without a confirmed rule, saved records are undetermined, never active or none", async () => {
    const { sel } = await boot();
    expect(sel.ACTIVE_RULE).toBeNull();
    expect(sel.summarizeRestrictions([rec(1)], today)).toEqual({
      kind: "undetermined",
      saved: 1,
    });
  });
});

// Independent store instances = separate tabs sharing one localStorage.
describe("stale tabs sharing storage", () => {
  const KEY = "mh.campusRestrictions.v1";
  beforeEach(() => window.localStorage.clear());
  const ids = (r: { status: string; records?: { id: number }[] }) =>
    r.status === "ok" ? r.records!.map((x) => x.id) : "error";

  it("different youths from two already-open tabs both survive", async () => {
    const a = await boot();
    const b = await boot();
    expect(a.store.saveCampusRestriction("1", rec(10))).toBe(true);
    expect(b.store.saveCampusRestriction("2", rec(20))).toBe(true);
    const c = await boot();
    expect(ids(c.store.readCampusRestrictions("1"))).toEqual([10]);
    expect(ids(c.store.readCampusRestrictions("2"))).toEqual([20]);
  });

  it("different new records for one youth from stale tabs both survive", async () => {
    const a = await boot();
    const b = await boot();
    a.store.saveCampusRestriction("1", rec(10));
    b.store.saveCampusRestriction("1", rec(11));
    const c = await boot();
    expect(ids(c.store.readCampusRestrictions("1"))).toEqual([10, 11]);
  });

  it("modify keeps a record added after the modifying tab loaded", async () => {
    const a = await boot();
    a.store.saveCampusRestriction("1", rec(10));
    const b = await boot();
    a.store.saveCampusRestriction("1", rec(11));
    b.store.saveCampusRestriction("1", rec(10, { endDate: "07/01/2026" }));
    const c = await boot();
    const r = c.store.readCampusRestrictions("1");
    expect(ids(r)).toEqual([10, 11]);
    expect(r.status === "ok" && r.records[0].endDate).toBe("07/01/2026");
  });

  it("a read exception after init causes no write", async () => {
    const a = await boot();
    const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const set = vi.spyOn(Storage.prototype, "setItem");
    expect(a.store.saveCampusRestriction("1", rec(10))).toBe(false);
    expect(set).not.toHaveBeenCalled();
    expect(a.store.readCampusRestrictions("1").status).toBe("error");
    get.mockRestore();
    set.mockRestore();
    expect(a.store.readCampusRestrictions("1").status).toBe("ok");
  });

  it("malformed JSON after init stays byte-identical after a rejected save", async () => {
    const a = await boot();
    a.store.saveCampusRestriction("1", rec(10));
    window.localStorage.setItem(KEY, "{oops");
    expect(a.store.saveCampusRestriction("2", rec(20))).toBe(false);
    expect(window.localStorage.getItem(KEY)).toBe("{oops");
    expect(a.store.readCampusRestrictions("1").status).toBe("error");
  });

  it("null or invalid persisted records are an error, not rows", async () => {
    for (const bad of ['{"1":[null]}', '{"1":[{"id":"x"}]}', '{"1":{}}', "[]", '{"1":[{"id":1,"youth":"Y","type":"T","startDate":"d","endDate":5}]}']) {
      window.localStorage.setItem(KEY, bad);
      const { store } = await boot();
      expect(store.readCampusRestrictions("1").status).toBe("error");
      expect(store.saveCampusRestriction("1", rec(9))).toBe(false);
      expect(window.localStorage.getItem(KEY)).toBe(bad);
    }
  });

  it("an invalid record is refused and nothing is written", async () => {
    const { store } = await boot();
    const set = vi.spyOn(Storage.prototype, "setItem");
    expect(store.saveCampusRestriction("1", null as never)).toBe(false);
    expect(store.saveCampusRestriction("1", { ...rec(1), type: 5 } as never)).toBe(false);
    expect(set).not.toHaveBeenCalled();
    set.mockRestore();
  });

  it("valid records with optional fields absent and extra properties are kept", async () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ "1": [{ id: 1, youth: "Y", type: "T", startDate: "d", extra: 7 }] }),
    );
    const { store } = await boot();
    store.saveCampusRestriction("2", rec(2));
    const saved = JSON.parse(window.localStorage.getItem(KEY)!);
    expect(saved["1"][0].extra).toBe(7);
    expect(ids(store.readCampusRestrictions("1"))).toEqual([1]);
  });

  it("a failed write preserves old data and does not publish a snapshot", async () => {
    const a = await boot();
    a.store.saveCampusRestriction("1", rec(10));
    const before = window.localStorage.getItem(KEY);
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(a.store.saveCampusRestriction("1", rec(11))).toBe(false);
    spy.mockRestore();
    expect(window.localStorage.getItem(KEY)).toBe(before);
    expect(ids(a.store.readCampusRestrictions("1"))).toEqual([10]);
  });

  it("empty store usable; cache is referentially stable until storage changes", async () => {
    const { store } = await boot();
    const r1 = store.readCampusRestrictions("1");
    const r2 = store.readCampusRestrictions("1");
    expect(r1.status === "ok" && r2.status === "ok" && r1.records === r2.records).toBe(true);
    store.saveCampusRestriction("1", rec(1));
    const r3 = store.readCampusRestrictions("1");
    const r4 = store.readCampusRestrictions("1");
    expect(r3.status === "ok" && r4.status === "ok" && r3.records === r4.records).toBe(true);
    expect(ids(r3)).toEqual([1]);
  });
});
