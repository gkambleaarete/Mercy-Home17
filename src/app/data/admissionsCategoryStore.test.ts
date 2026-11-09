// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

// Since Chunk 3 categories, history and closures are ONE snapshot. The two
// earlier keys are only read for migration (see admissionsStateMigration.test).
const STATE_KEY = "mh.admissions.state.v1";
const CAT_KEY = "mh.admissionsCategory.v1"; // legacy, category-only
const stored = () => {
  const raw = window.localStorage.getItem(STATE_KEY);
  return raw === null ? null : JSON.parse(raw);
};

// Fresh module graph per call = what a page refresh does: both stores
// re-read localStorage.
async function boot() {
  vi.resetModules();
  const cat = await import("./admissionsCategoryStore");
  const closure = await import("./caseClosureStore");
  const leads = await import("./mockLeadsData");
  return { cat, closure, leads };
}

function change(
  cat: Awaited<ReturnType<typeof boot>>["cat"],
  over: Partial<
    Parameters<typeof cat.changeAdmissionsCategory>[0]
  > = {},
) {
  return cat.changeAdmissionsCategory({
    admissionId: "L-001",
    admissionName: "Test Youth",
    baselineCategory: "Referral",
    expectedCurrentCategory: "Referral",
    newCategory: "Delayed",
    comment: "Family asked to wait",
    ...over,
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("baseline and overlay", () => {
  it("shows a Delayed admission as Delayed", async () => {
    const { cat, leads } = await boot();
    const delayed = leads.ALL_LEADS.find(
      (l) => l.status === "Delayed",
    )!;
    const read = cat.getAdmissionsCategories();
    expect(
      cat.effectiveAdmissionsCategory(
        read,
        delayed.id,
        delayed.status,
      ),
    ).toBe("Delayed");
  });

  it("overlays a saved category without mutating ALL_LEADS or other fields", async () => {
    const { cat, leads } = await boot();
    const before = JSON.stringify(leads.ALL_LEADS);
    const lead = leads.ALL_LEADS.find((l) => l.id === "L-001")!;
    expect(
      change(cat, {
        baselineCategory: lead.status,
        expectedCurrentCategory: lead.status,
        newCategory: "Program Waitlist",
      }).ok,
    ).toBe(true);
    const out = cat.withSavedCategories(
      leads.ALL_LEADS,
      cat.getAdmissionsCategories(),
    );
    const changed = out.find((l) => l.id === "L-001")!;
    expect(changed.status).toBe("Program Waitlist");
    expect(changed.stage).toBe(lead.stage);
    expect(changed.alerts).toBe(lead.alerts);
    expect(changed.name).toBe(lead.name);
    // everything else is the very same object
    expect(out.find((l) => l.id === "L-002")).toBe(
      leads.ALL_LEADS.find((l) => l.id === "L-002"),
    );
    expect(JSON.stringify(leads.ALL_LEADS)).toBe(before);
  });
});

describe("changeAdmissionsCategory", () => {
  it("saves the category with a history entry", async () => {
    const { cat } = await boot();
    const r = change(cat, { comment: "  Needs more time  " });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.record.category).toBe("Delayed");
    expect(r.change).toMatchObject({
      id: "CC-000001",
      admissionId: "L-001",
      previousCategory: "Referral",
      newCategory: "Delayed",
      comment: "Needs more time",
    });
    expect(Number.isNaN(Date.parse(r.change!.changedAt))).toBe(
      false,
    );
    // no signed-in user is known, so no author is invented
    expect(r.change).not.toHaveProperty("changedBy");
  });

  it("records the author only when one is supplied", async () => {
    const { cat } = await boot();
    const r = change(cat, {
      changedBy: { id: "U-1", name: "Pat Staff" },
    });
    expect(r.ok && r.change?.changedBy).toEqual({
      id: "U-1",
      name: "Pat Staff",
    });
  });

  it("refuses the current category and records no history", async () => {
    const { cat } = await boot();
    const r = change(cat, { newCategory: "Referral" });
    expect(r.ok).toBe(false);
    expect(window.localStorage.getItem(STATE_KEY)).toBeNull();
    expect(cat.admissionsCategoryHistory(cat.getAdmissionsCategories(), "L-001")).toEqual([]);
  });

  it("refuses empty and whitespace-only comments", async () => {
    const { cat } = await boot();
    for (const comment of ["", "   ", "\n\t "]) {
      const r = change(cat, { comment });
      expect(r).toMatchObject({ ok: false, reason: "invalid" });
    }
    expect(window.localStorage.getItem(STATE_KEY)).toBeNull();
  });

  it("refuses an unknown category and a stale expectation", async () => {
    const { cat } = await boot();
    expect(change(cat, { newCategory: "Nope" }).ok).toBe(false);
    expect(change(cat, { expectedCurrentCategory: "Closed" })).toMatchObject({
      ok: false,
      reason: "stale",
    });
  });

  it("survives a refresh", async () => {
    const first = await boot();
    change(first.cat);
    const { cat } = await boot(); // new module graph, same storage
    const read = cat.getAdmissionsCategories();
    expect(cat.effectiveAdmissionsCategory(read, "L-001", "Referral")).toBe("Delayed");
    expect(cat.admissionsCategoryHistory(read, "L-001")).toHaveLength(1);
  });

  it("keeps earlier comments across repeated changes, with unique ids", async () => {
    const { cat } = await boot();
    change(cat, { comment: "first" });
    change(cat, {
      expectedCurrentCategory: "Delayed",
      newCategory: "Program Waitlist",
      comment: "second",
    });
    change(cat, {
      expectedCurrentCategory: "Program Waitlist",
      newCategory: "Delayed",
      comment: "third",
    });
    const h = cat.admissionsCategoryHistory(cat.getAdmissionsCategories(), "L-001");
    expect(h.map((x) => x.comment)).toEqual(["first", "second", "third"]);
    expect(h.map((x) => [x.previousCategory, x.newCategory])).toEqual([
      ["Referral", "Delayed"],
      ["Delayed", "Program Waitlist"],
      ["Program Waitlist", "Delayed"],
    ]);
    expect(new Set(h.map((x) => x.id)).size).toBe(3);
  });

  it("does not rewrite earlier entries (append-only)", async () => {
    const { cat } = await boot();
    change(cat, { comment: "first" });
    const snapshot = JSON.stringify(
      cat.admissionsCategoryHistory(cat.getAdmissionsCategories(), "L-001"),
    );
    change(cat, {
      expectedCurrentCategory: "Delayed",
      newCategory: "Referral",
      comment: "second",
    });
    const after = cat.admissionsCategoryHistory(cat.getAdmissionsCategories(), "L-001");
    expect(JSON.stringify(after.slice(0, 1))).toBe(snapshot);
  });

  it("a change to L-001 does not affect L-019 (same youthId Y-001)", async () => {
    const { cat, leads } = await boot();
    const l1 = leads.ALL_LEADS.find((l) => l.id === "L-001")!;
    const l19 = leads.ALL_LEADS.find((l) => l.id === "L-019")!;
    expect(l1.youthId).toBe(l19.youthId);
    change(cat, {
      baselineCategory: l1.status,
      expectedCurrentCategory: l1.status,
      newCategory: l1.status === "Delayed" ? "Referral" : "Delayed",
    });
    const read = cat.getAdmissionsCategories();
    expect(cat.effectiveAdmissionsCategory(read, "L-019", l19.status)).toBe(l19.status);
    expect(cat.admissionsCategoryHistory(read, "L-019")).toEqual([]);
  });
});

describe("failed saves", () => {
  it("leaves the previous state intact and allows a retry", async () => {
    const { cat } = await boot();
    change(cat, { comment: "kept" });
    const before = window.localStorage.getItem(STATE_KEY);
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota");
      });
    const r = change(cat, {
      expectedCurrentCategory: "Delayed",
      newCategory: "Program Waitlist",
      comment: "will fail",
    });
    expect(r).toMatchObject({ ok: false, reason: "storage" });
    expect(window.localStorage.getItem(STATE_KEY)).toBe(before);
    const read = cat.getAdmissionsCategories();
    expect(cat.effectiveAdmissionsCategory(read, "L-001", "Referral")).toBe("Delayed");
    expect(cat.admissionsCategoryHistory(read, "L-001")).toHaveLength(1);
    spy.mockRestore();
    const retry = change(cat, {
      expectedCurrentCategory: "Delayed",
      newCategory: "Program Waitlist",
      comment: "will fail",
    });
    expect(retry.ok).toBe(true);
    // the failed attempt burned no history id
    expect(
      cat.admissionsCategoryHistory(cat.getAdmissionsCategories(), "L-001").map((h) => h.id),
    ).toEqual(["CC-000001", "CC-000002"]);
  });

  it("reports blocked storage on write instead of pretending success", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { cat } = await boot();
    expect(change(cat)).toMatchObject({ ok: false, reason: "storage" });
  });
});

describe("unreadable stored data", () => {
  it("reports corrupt data, preserves it and refuses writes", async () => {
    window.localStorage.setItem(CAT_KEY, "{not json");
    const { cat } = await boot();
    expect(cat.getAdmissionsCategories()).toEqual({
      status: "error",
      reason: "corrupt",
    });
    expect(change(cat)).toMatchObject({ ok: false, reason: "unreadable" });
    expect(window.localStorage.getItem(CAT_KEY)).toBe("{not json");
    expect(cat.getUnreadableAdmissionsCategoryData()).toMatchObject({
      reason: "corrupt",
      raw: "{not json",
      key: CAT_KEY,
    });
  });

  it("reports an unsupported schema version and preserves it", async () => {
    const raw = JSON.stringify({ version: 99, records: {} });
    window.localStorage.setItem(CAT_KEY, raw);
    const { cat } = await boot();
    expect(cat.getAdmissionsCategories()).toEqual({
      status: "error",
      reason: "unsupported-version",
    });
    expect(change(cat).ok).toBe(false);
    expect(window.localStorage.getItem(CAT_KEY)).toBe(raw);
  });

  it("treats a structurally wrong record as corrupt", async () => {
    window.localStorage.setItem(
      CAT_KEY,
      JSON.stringify({
        version: 1,
        nextSeq: 1,
        records: { "L-001": { admissionId: "L-002", category: "Delayed", updatedAt: "x", history: [] } },
      }),
    );
    const { cat } = await boot();
    expect(cat.getAdmissionsCategories().status).toBe("error");
  });

  it("falls back to the baseline when unreadable (callers show the error)", async () => {
    window.localStorage.setItem(CAT_KEY, "garbage");
    const { cat, leads } = await boot();
    const read = cat.getAdmissionsCategories();
    expect(cat.effectiveAdmissionsCategory(read, "L-001", "Referral")).toBe("Referral");
    expect(cat.withSavedCategories(leads.ALL_LEADS, read)).toHaveLength(
      leads.ALL_LEADS.length,
    );
  });
});

describe("coupled Closing List effects", () => {
  const closed = (
    cat: Awaited<ReturnType<typeof boot>>["cat"],
    from = "Referral",
  ) =>
    change(cat, {
      baselineCategory: from,
      expectedCurrentCategory: from,
      newCategory: "Closed",
      comment: "Family withdrew",
    });

  it("entering Closed starts the closure; it is persisted and live", async () => {
    const { cat, closure } = await boot();
    expect(closure.getCaseClosureData().closures["L-001"]).toBeUndefined();
    expect(closed(cat).ok).toBe(true);
    const c = closure.getCaseClosureData().closures["L-001"];
    expect(c).toMatchObject({ caseId: "L-001", state: "closing", origin: "user" });
    expect(stored().closure.closures["L-001"].closingStartedAt).toBe(c.closingStartedAt);
    // category, history and closure arrive in the SAME write
    expect(stored().categories.records["L-001"].category).toBe("Closed");
  });

  it("reopening before finalization removes the closure; the history stays", async () => {
    const { cat, closure } = await boot();
    closed(cat);
    const r = change(cat, {
      expectedCurrentCategory: "Closed",
      newCategory: "Referral",
      comment: "Reopened",
    });
    expect(r.ok).toBe(true);
    expect(closure.getCaseClosureData().closures["L-001"]).toBeUndefined();
    expect(
      cat.admissionsCategoryHistory(cat.getAdmissionsCategories(), "L-001"),
    ).toHaveLength(2);
  });

  it("never reopens a finalized closure", async () => {
    const { cat, closure } = await boot();
    closed(cat);
    closure.finalizeCaseClosure("L-001", "Pat", new Date());
    change(cat, {
      expectedCurrentCategory: "Closed",
      newCategory: "Referral",
      comment: "Trying to reopen",
    });
    expect(closure.getCaseClosureData().closures["L-001"].state).toBe("finalized");
  });

  it("keeps the original closing date when a closure already exists", async () => {
    const { cat, closure } = await boot();
    // e.g. started from Projections & Waitlist earlier
    closure.startCaseClosure("L-001", "Test Youth", new Date(2026, 0, 5));
    const first =
      closure.getCaseClosureData().closures["L-001"].closingStartedAt;
    expect(closed(cat).ok).toBe(true);
    expect(
      closure.getCaseClosureData().closures["L-001"].closingStartedAt,
    ).toBe(first);
  });

  it("a failed write changes neither the category/history nor the closure (memory or storage)", async () => {
    const { cat, closure } = await boot();
    const before = window.localStorage.getItem(STATE_KEY);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(closed(cat)).toMatchObject({ ok: false, reason: "storage" });
    expect(window.localStorage.getItem(STATE_KEY)).toBe(before);
    expect(closure.getCaseClosureData().closures["L-001"]).toBeUndefined();
    expect(cat.effectiveAdmissionsCategory(cat.getAdmissionsCategories(), "L-001", "Referral")).toBe("Referral");
    expect(cat.admissionsCategoryHistory(cat.getAdmissionsCategories(), "L-001")).toEqual([]);
    vi.restoreAllMocks();
    // reload: still consistent
    const re = await boot();
    expect(re.closure.getCaseClosureData().closures["L-001"]).toBeUndefined();
    expect(re.cat.admissionsCategoryHistory(re.cat.getAdmissionsCategories(), "L-001")).toEqual([]);
  });

  it("publishes nothing to subscribers when the write fails", async () => {
    const { cat, closure } = await boot();
    const seen: string[] = [];
    closure.subscribeCaseClosures(() => seen.push("closure"));
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    closed(cat);
    expect(seen).toEqual([]);
  });
});