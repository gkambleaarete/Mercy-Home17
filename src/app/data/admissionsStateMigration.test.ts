// @vitest-environment jsdom
// Migration of the two earlier storage keys into the ONE authoritative
// Admissions snapshot (US 20140 Chunk 3).
import { beforeEach, describe, expect, it, vi } from "vitest";

const STATE_KEY = "mh.admissions.state.v1";
const CAT_KEY = "mh.admissionsCategory.v1";
const CLOSURE_KEY = "mh.admissions.caseClosures.v1";

async function boot() {
  vi.resetModules();
  const state = await import("./admissionsStateStore");
  const cat = await import("./admissionsCategoryStore");
  const closure = await import("./caseClosureStore");
  const leads = await import("./mockLeadsData");
  return { state, cat, closure, leads };
}

const legacyCategories = () => ({
  version: 1,
  nextSeq: 3,
  records: {
    "L-006": {
      admissionId: "L-006",
      category: "Program Waitlist",
      updatedAt: "2026-02-02T10:00:00.000Z",
      history: [
        {
          id: "CC-000001",
          admissionId: "L-006",
          previousCategory: "Delayed",
          newCategory: "Referral",
          comment: "first\nline two",
          changedAt: "2026-02-01T10:00:00.000Z",
        },
        {
          id: "CC-000002",
          admissionId: "L-006",
          previousCategory: "Referral",
          newCategory: "Program Waitlist",
          comment: "second",
          changedAt: "2026-02-02T10:00:00.000Z",
          changedBy: { id: "U-9", name: "Pat Staff" },
        },
      ],
    },
  },
});
const legacyClosures = () => ({
  closures: {
    "L-040": {
      caseId: "L-040",
      name: "Legacy Youth",
      closingStartedAt: "2026-01-05T09:00:00.000Z",
      state: "closing",
      origin: "user",
    },
    "L-041": {
      caseId: "L-041",
      name: "Done Youth",
      closingStartedAt: "2025-12-01T09:00:00.000Z",
      state: "finalized",
      finalizedAt: "2026-01-20T09:00:00.000Z",
      finalizedBy: "Pat Staff",
      origin: "user",
    },
  },
  notifications: [
    {
      id: "L-040|2026-01-05T09:00:00.000Z",
      caseId: "L-040",
      name: "Legacy Youth",
      createdAt: "2026-02-04T09:00:00.000Z",
      message: "eligible",
      read: false,
    },
  ],
});

const put = (k: string, v: unknown) =>
  window.localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));

beforeEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("successful migration", () => {
  it("keeps all history and closure information and writes the snapshot", async () => {
    put(CAT_KEY, legacyCategories());
    put(CLOSURE_KEY, legacyClosures());
    const catBefore = window.localStorage.getItem(CAT_KEY);
    const cloBefore = window.localStorage.getItem(CLOSURE_KEY);
    const { state, cat, closure } = await boot();
    expect(state.getAdmissionsStateHealth()).toBe("ok");
    expect(state.getAdmissionsStateSource()).toBe("snapshot");

    const read = cat.getAdmissionsCategories();
    expect(cat.effectiveAdmissionsCategory(read, "L-006", "Delayed")).toBe("Program Waitlist");
    const h = cat.admissionsCategoryHistory(read, "L-006");
    expect(h.map((c) => c.comment)).toEqual(["first\nline two", "second"]);
    expect(h[1].changedBy).toEqual({ id: "U-9", name: "Pat Staff" });

    const data = closure.getCaseClosureData();
    expect(data).toEqual(legacyClosures()); // exactly what was saved — no seed merged in
    expect(data.closures["L-016"]).toBeUndefined();

    const snap = JSON.parse(window.localStorage.getItem(STATE_KEY)!);
    expect(snap.version).toBe(1);
    expect(snap.categories.nextSeq).toBe(3);
    expect(snap.closure).toEqual(legacyClosures());
    // the earlier keys are never modified
    expect(window.localStorage.getItem(CAT_KEY)).toBe(catBefore);
    expect(window.localStorage.getItem(CLOSURE_KEY)).toBe(cloBefore);
  });

  it("continues the history id sequence after migration", async () => {
    put(CAT_KEY, legacyCategories());
    const { cat } = await boot();
    const r = cat.changeAdmissionsCategory({
      admissionId: "L-006",
      admissionName: "x",
      baselineCategory: "Delayed",
      expectedCurrentCategory: "Program Waitlist",
      newCategory: "Delayed",
      comment: "third",
    });
    expect(r.ok && r.change.id).toBe("CC-000003");
  });

  it("seeds only the genuinely absent half", async () => {
    put(CAT_KEY, legacyCategories()); // closures absent → seeded
    const a = await boot();
    expect(a.closure.getCaseClosureData().closures["L-016"].state).toBe("closing");
    expect(a.cat.admissionsCategoryHistory(a.cat.getAdmissionsCategories(), "L-006")).toHaveLength(2);

    window.localStorage.clear();
    put(CLOSURE_KEY, legacyClosures()); // categories absent → empty
    const b = await boot();
    expect(b.cat.getAdmissionsCategories()).toEqual({ status: "ok", records: {} });
    expect(b.closure.getCaseClosureData()).toEqual(legacyClosures());
  });

  it("uses the snapshot from then on (later edits to the old keys are ignored)", async () => {
    put(CAT_KEY, legacyCategories());
    await boot();
    put(CAT_KEY, { version: 1, nextSeq: 1, records: {} }); // stale legacy change
    const { cat } = await boot();
    expect(cat.admissionsCategoryHistory(cat.getAdmissionsCategories(), "L-006")).toHaveLength(2);
  });

  it("with nothing saved, seeds in memory and writes nothing", async () => {
    const { state, closure } = await boot();
    expect(state.getAdmissionsStateSource()).toBe("fresh");
    expect(closure.getCaseClosureData().closures["L-016"].state).toBe("closing");
    expect(window.localStorage.getItem(STATE_KEY)).toBeNull();
  });
});

describe("failed migration and unreadable legacy data", () => {
  it("corrupt legacy closures: nothing migrated or written, raw kept, visibly reported", async () => {
    put(CAT_KEY, legacyCategories());
    put(CLOSURE_KEY, "{broken");
    const { state, cat, closure } = await boot();
    expect(state.getAdmissionsStateHealth()).toBe("corrupt");
    expect(state.getUnreadableAdmissionsStateData()).toMatchObject({
      reason: "corrupt",
      key: CLOSURE_KEY,
      raw: "{broken",
    });
    expect(cat.getAdmissionsCategories()).toEqual({ status: "error", reason: "corrupt" });
    expect(window.localStorage.getItem(STATE_KEY)).toBeNull();
    expect(window.localStorage.getItem(CLOSURE_KEY)).toBe("{broken");
    // writes are refused, in both views
    expect(closure.startCaseClosure("L-001", "x", new Date())).toBe(false);
    expect(window.localStorage.getItem(STATE_KEY)).toBeNull();
  });

  it("wrong-shaped legacy closures are corrupt too", async () => {
    put(CLOSURE_KEY, { closures: { "L-1": { caseId: "OTHER", state: "closing", closingStartedAt: "x" } }, notifications: [] });
    const { state } = await boot();
    expect(state.getAdmissionsStateHealth()).toBe("corrupt");
  });

  it("corrupt legacy categories block the whole migration", async () => {
    put(CAT_KEY, "garbage");
    put(CLOSURE_KEY, legacyClosures());
    const { state } = await boot();
    expect(state.getUnreadableAdmissionsStateData()).toMatchObject({ key: CAT_KEY, raw: "garbage" });
    expect(window.localStorage.getItem(STATE_KEY)).toBeNull();
  });

  it("an unsupported legacy category version is preserved and reported", async () => {
    const raw = JSON.stringify({ version: 9, records: {} });
    put(CAT_KEY, raw);
    const { state, cat } = await boot();
    expect(cat.getAdmissionsCategories()).toEqual({ status: "error", reason: "unsupported-version" });
    expect(state.getUnreadableAdmissionsStateData()?.raw).toBe(raw);
    expect(window.localStorage.getItem(CAT_KEY)).toBe(raw);
  });

  it("a snapshot that is corrupt, unsupported or missing a slice is reported and preserved", async () => {
    for (const [raw, reason] of [
      ["{nope", "corrupt"],
      [JSON.stringify({ version: 2 }), "unsupported-version"],
      [JSON.stringify({ version: 1, categories: { nextSeq: 1, records: {} } }), "corrupt"],
      [JSON.stringify({ categories: {}, closure: {} }), "corrupt"],
    ] as const) {
      window.localStorage.clear();
      put(STATE_KEY, raw);
      const { state, cat } = await boot();
      expect(cat.getAdmissionsCategories()).toEqual({ status: "error", reason });
      expect(window.localStorage.getItem(STATE_KEY)).toBe(raw);
      expect(state.getUnreadableAdmissionsStateData()?.key).toBe(STATE_KEY);
    }
  });

  it("if the snapshot cannot be written during migration, the old keys stay and the data stays usable", async () => {
    put(CAT_KEY, legacyCategories());
    put(CLOSURE_KEY, legacyClosures());
    const catBefore = window.localStorage.getItem(CAT_KEY);
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const { state, cat, closure } = await boot();
    expect(state.getAdmissionsStateHealth()).toBe("ok");
    expect(state.getAdmissionsStateSource()).toBe("migrated"); // not yet persisted
    expect(window.localStorage.getItem(STATE_KEY)).toBeNull();
    expect(window.localStorage.getItem(CAT_KEY)).toBe(catBefore);
    expect(cat.admissionsCategoryHistory(cat.getAdmissionsCategories(), "L-006")).toHaveLength(2);
    spy.mockRestore();
    // the next successful change writes the complete snapshot, nothing lost
    expect(closure.startCaseClosure("L-001", "Y", new Date())).toBe(true);
    const snap = JSON.parse(window.localStorage.getItem(STATE_KEY)!);
    expect(snap.categories.records["L-006"].history).toHaveLength(2);
    expect(snap.closure.closures["L-040"]).toBeTruthy();
    expect(snap.closure.closures["L-001"]).toBeTruthy();
  });

  it("blocked storage: starts from the seed and reports failed writes", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { state, closure } = await boot();
    expect(state.getAdmissionsStateHealth()).toBe("ok");
    expect(closure.startCaseClosure("L-001", "Y", new Date())).toBe(false);
    expect(closure.getCaseClosureData().closures["L-001"]).toBeUndefined();
  });
});