// @vitest-environment jsdom
// One authoritative snapshot: categories + history + closures change
// together or not at all (US 20140 Chunk 3).
import { beforeEach, describe, expect, it, vi } from "vitest";

const STATE_KEY = "mh.admissions.state.v1";

async function boot() {
  vi.resetModules();
  const state = await import("./admissionsStateStore");
  const cat = await import("./admissionsCategoryStore");
  const closure = await import("./caseClosureStore");
  const leads = await import("./mockLeadsData");
  return { state, cat, closure, leads };
}
type Env = Awaited<ReturnType<typeof boot>>;

const snap = () =>
  JSON.parse(window.localStorage.getItem(STATE_KEY)!);
const day = (n: number) => new Date(2026, 9, 1 + n, 9, 30);

function change(
  env: Env,
  id: string,
  to: string,
  over: Record<string, unknown> = {},
) {
  const lead = env.leads.ALL_LEADS.find((l) => l.id === id)!;
  const read = env.cat.getAdmissionsCategories();
  const current = env.cat.effectiveAdmissionsCategory(
    read,
    id,
    lead.status,
  );
  return env.cat.changeAdmissionsCategory({
    admissionId: id,
    admissionName: lead.name,
    baselineCategory: lead.status,
    expectedCurrentCategory: current,
    newCategory: to,
    comment: `to ${to}`,
    ...over,
  });
}

// What another tab would do: replace the stored snapshot, then tell us.
function otherTabWrites(mutate: (s: any) => void) {
  const s = snap();
  mutate(s);
  window.localStorage.setItem(STATE_KEY, JSON.stringify(s));
  window.dispatchEvent(
    new StorageEvent("storage", { key: STATE_KEY }),
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("closure-only updates keep categories; category updates keep closures", () => {
  it("a closure-only update preserves saved categories and the full history", async () => {
    const env = await boot();
    change(env, "L-006", "Program Waitlist");
    change(env, "L-006", "Referral");
    const before = JSON.stringify(snap().categories);
    expect(
      env.closure.startCaseClosure(
        "L-077",
        "Other Youth",
        day(0),
      ),
    ).toBe(true);
    expect(
      env.closure.finalizeCaseClosure("L-077", "Pat", day(1)),
    ).toBe(true);
    expect(env.closure.markClosureNotificationsRead()).toBe(
      true,
    );
    expect(JSON.stringify(snap().categories)).toBe(before);
    const read = env.cat.getAdmissionsCategories();
    expect(
      env.cat.admissionsCategoryHistory(read, "L-006"),
    ).toHaveLength(2);
    expect(
      env.cat.effectiveAdmissionsCategory(
        read,
        "L-006",
        "Delayed",
      ),
    ).toBe("Referral");
  });

  it("a category update preserves unrelated closures and every notification", async () => {
    const env = await boot();
    env.closure.startCaseClosure("L-900", "Unrelated", day(0));
    env.closure.processClosureEligibility(day(31)); // creates a notification
    const closuresBefore = JSON.stringify(
      env.closure.getCaseClosureData(),
    );
    // L-900 plus the seeded Closing List cases all became eligible
    expect(
      env.closure.getCaseClosureData().notifications.length,
    ).toBeGreaterThan(0);
    expect(change(env, "L-001", "Delayed").ok).toBe(true);
    expect(
      JSON.stringify(env.closure.getCaseClosureData()),
    ).toBe(closuresBefore);
    expect(JSON.stringify(snap().closure)).toBe(closuresBefore);
    // the seeded Closing List entries are untouched too
    expect(
      env.closure.getCaseClosureData().closures["L-016"].state,
    ).toBe("closing");
  });

  it("each save is exactly one write and one publish to both views", async () => {
    const env = await boot();
    const writes = vi.spyOn(Storage.prototype, "setItem");
    const emitted: string[] = [];
    env.closure.subscribeCaseClosures(() =>
      emitted.push("notify"),
    );
    expect(change(env, "L-006", "Closed").ok).toBe(true);
    expect(writes).toHaveBeenCalledTimes(1);
    expect(emitted).toEqual(["notify"]);
  });

  it("ownership stays by lead.id: closing L-001 does not touch L-019", async () => {
    const env = await boot();
    change(env, "L-001", "Closed");
    const c = env.closure.getCaseClosureData().closures;
    expect(c["L-001"]?.state).toBe("closing");
    expect(c["L-019"]?.state).toBe("finalized"); // its own seeded record, unchanged
    expect(
      env.cat.admissionsCategoryHistory(
        env.cat.getAdmissionsCategories(),
        "L-019",
      ),
    ).toEqual([]);
  });
});

describe("a failed save changes nothing", () => {
  it("category change: memory and storage identical, and a reload agrees", async () => {
    const env = await boot();
    change(env, "L-006", "Program Waitlist");
    const stored = window.localStorage.getItem(STATE_KEY);
    const memClosure = JSON.stringify(
      env.closure.getCaseClosureData(),
    );
    const memCat = JSON.stringify(
      env.cat.getAdmissionsCategories(),
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      () => {
        throw new Error("quota");
      },
    );
    expect(change(env, "L-006", "Closed")).toMatchObject({
      ok: false,
      reason: "storage",
    });
    expect(window.localStorage.getItem(STATE_KEY)).toBe(stored);
    expect(
      JSON.stringify(env.closure.getCaseClosureData()),
    ).toBe(memClosure);
    expect(
      JSON.stringify(env.cat.getAdmissionsCategories()),
    ).toBe(memCat);
    vi.restoreAllMocks();
    const re = await boot();
    const read = re.cat.getAdmissionsCategories();
    expect(
      re.cat.effectiveAdmissionsCategory(
        read,
        "L-006",
        "Delayed",
      ),
    ).toBe("Program Waitlist");
    expect(
      re.cat.admissionsCategoryHistory(read, "L-006"),
    ).toHaveLength(1);
    expect(
      re.closure.getCaseClosureData().closures["L-006"],
    ).toBeUndefined();
    // and a retry succeeds
    expect(change(re, "L-006", "Closed").ok).toBe(true);
    expect(
      re.closure.getCaseClosureData().closures["L-006"].state,
    ).toBe("closing");
  });

  it("closure-only update: reports false and changes nothing", async () => {
    const env = await boot();
    change(env, "L-006", "Referral");
    const stored = window.localStorage.getItem(STATE_KEY);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      () => {
        throw new Error("quota");
      },
    );
    expect(
      env.closure.startCaseClosure("L-050", "X", day(0)),
    ).toBe(false);
    expect(
      env.closure.getCaseClosureData().closures["L-050"],
    ).toBeUndefined();
    expect(window.localStorage.getItem(STATE_KEY)).toBe(stored);
  });

  it("a refused change (validation) writes nothing at all", async () => {
    const env = await boot();
    const writes = vi.spyOn(Storage.prototype, "setItem");
    expect(
      change(env, "L-006", "Program Waitlist", {
        comment: "  ",
      }).ok,
    ).toBe(false);
    expect(writes).not.toHaveBeenCalled();
  });
});

describe("stale changes and cross-tab refresh", () => {
  it("refuses a pending change made stale by another tab, and writes nothing", async () => {
    const env = await boot();
    change(env, "L-006", "Program Waitlist"); // we know: Program Waitlist
    // another tab saves Referral → Delayed→... (category now Referral)
    otherTabWrites((s) => {
      s.categories.records["L-006"].category = "Referral";
    });
    const before = window.localStorage.getItem(STATE_KEY);
    const r = env.cat.changeAdmissionsCategory({
      admissionId: "L-006",
      admissionName: "x",
      baselineCategory: "Delayed",
      expectedCurrentCategory: "Program Waitlist", // what this tab was showing
      newCategory: "Closed",
      comment: "late",
    });
    expect(r).toMatchObject({ ok: false, reason: "stale" });
    expect(window.localStorage.getItem(STATE_KEY)).toBe(before);
    expect(
      env.closure.getCaseClosureData().closures["L-006"],
    ).toBeUndefined();
  });

  it("a storage event refreshes BOTH slices and notifies once", async () => {
    const env = await boot();
    change(env, "L-006", "Program Waitlist");
    const seen: string[] = [];
    env.closure.subscribeCaseClosures(() => seen.push("n"));
    otherTabWrites((s) => {
      s.categories.records["L-006"].category = "Referral";
      s.closure.closures["L-123"] = {
        caseId: "L-123",
        name: "Remote",
        closingStartedAt: "2026-03-01T09:00:00.000Z",
        state: "closing",
        origin: "user",
      };
    });
    expect(seen).toEqual(["n"]);
    expect(
      env.cat.effectiveAdmissionsCategory(
        env.cat.getAdmissionsCategories(),
        "L-006",
        "Delayed",
      ),
    ).toBe("Referral");
    expect(
      env.closure.getCaseClosureData().closures["L-123"].name,
    ).toBe("Remote");
  });

  it("a change in only one slice keeps the other slice's identity (no needless re-render)", async () => {
    const env = await boot();
    change(env, "L-006", "Program Waitlist");
    const catRead = env.cat.getAdmissionsCategories();
    const closure = env.closure.getCaseClosureData();
    otherTabWrites((s) => {
      s.closure.closures["L-124"] = {
        caseId: "L-124",
        name: "Only closure",
        closingStartedAt: "2026-03-01T09:00:00.000Z",
        state: "closing",
        origin: "user",
      };
    });
    expect(env.cat.getAdmissionsCategories()).toBe(catRead);
    expect(env.closure.getCaseClosureData()).not.toBe(closure);
  });

  it("another tab corrupting the snapshot becomes a visible error and the raw text is kept", async () => {
    const env = await boot();
    change(env, "L-006", "Program Waitlist");
    window.localStorage.setItem(STATE_KEY, "{oops");
    window.dispatchEvent(
      new StorageEvent("storage", { key: STATE_KEY }),
    );
    expect(env.cat.getAdmissionsCategories()).toEqual({
      status: "error",
      reason: "corrupt",
    });
    expect(change(env, "L-006", "Closed")).toMatchObject({
      ok: false,
      reason: "unreadable",
    });
    expect(window.localStorage.getItem(STATE_KEY)).toBe(
      "{oops",
    );
  });

  it("a write picks up another tab's save first, so nothing it saved is lost", async () => {
    const env = await boot();
    env.closure.startCaseClosure("L-001", "A", day(0));
    otherTabWrites((s) => {
      s.closure.closures["L-555"] = {
        caseId: "L-555",
        name: "Remote",
        closingStartedAt: "2026-03-01T09:00:00.000Z",
        state: "closing",
        origin: "user",
      };
    });
    // no storage event delivered this time: the write itself must refresh
    const s = snap();
    expect(s.closure.closures["L-555"]).toBeTruthy();
    window.localStorage.setItem(
      STATE_KEY,
      JSON.stringify({
        ...s,
        closure: {
          ...s.closure,
          closures: {
            ...s.closure.closures,
            "L-556": {
              ...s.closure.closures["L-555"],
              caseId: "L-556",
            },
          },
        },
      }),
    );
    expect(
      env.closure.startCaseClosure("L-002", "B", day(1)),
    ).toBe(true);
    const after = snap().closure.closures;
    expect(after["L-555"]).toBeTruthy();
    expect(after["L-556"]).toBeTruthy();
    expect(after["L-002"]).toBeTruthy();
  });
});

describe("Closing List rules through the one snapshot", () => {
  const closeIt = (env: Env, id = "L-006") =>
    change(env, id, "Closed");

  it("entering Closed starts closure once; the date is never reset", async () => {
    const env = await boot();
    env.closure.startCaseClosure(
      "L-006",
      "Carlos",
      new Date(2026, 0, 5),
    );
    const first =
      env.closure.getCaseClosureData().closures["L-006"]
        .closingStartedAt;
    expect(closeIt(env).ok).toBe(true);
    expect(
      env.closure.getCaseClosureData().closures["L-006"]
        .closingStartedAt,
    ).toBe(first);
  });

  it("reopening before finalization ends the cycle but keeps notification history and comments", async () => {
    const env = await boot();
    closeIt(env);
    env.closure.processClosureEligibility(new Date(2027, 5, 1)); // far future → notifications
    const notes = JSON.stringify(
      env.closure.getCaseClosureData().notifications,
    );
    expect(
      env.closure
        .getCaseClosureData()
        .notifications.some((n) => n.caseId === "L-006"),
    ).toBe(true);
    expect(change(env, "L-006", "Referral").ok).toBe(true);
    expect(
      env.closure.getCaseClosureData().closures["L-006"],
    ).toBeUndefined();
    expect(
      JSON.stringify(
        env.closure.getCaseClosureData().notifications,
      ),
    ).toBe(notes);
    expect(
      env.cat.admissionsCategoryHistory(
        env.cat.getAdmissionsCategories(),
        "L-006",
      ),
    ).toHaveLength(2);
  });

  it("a finalized closure is never reopened by a category change", async () => {
    const env = await boot();
    closeIt(env);
    env.closure.finalizeCaseClosure("L-006", "Pat", day(2));
    expect(change(env, "L-006", "Referral").ok).toBe(true); // category changes…
    const c =
      env.closure.getCaseClosureData().closures["L-006"];
    expect(c.state).toBe("finalized"); // …finalized closure stays
    expect(c.finalizedBy).toBe("Pat");
  });

  it("eligibility timing is unchanged (day 29 closing, day 30 eligible)", async () => {
    const env = await boot();
    env.closure.startCaseClosure("L-1", "Y", day(0));
    const c = env.closure.getCaseClosureData().closures["L-1"];
    expect(env.closure.getClosureStatus(c, day(29))).toBe(
      "closing",
    );
    expect(env.closure.getClosureStatus(c, day(30))).toBe(
      "eligible",
    );
  });
});

describe("initial assignment is an unresolved business rule", () => {
  it("a categoryless admission is refused with a clear result and is left unchanged", async () => {
    const env = await boot();
    const writes = vi.spyOn(Storage.prototype, "setItem");
    const r = env.cat.changeAdmissionsCategory({
      admissionId: "L-NOCAT",
      admissionName: "No Category",
      baselineCategory: "",
      expectedCurrentCategory: "",
      newCategory: "Referral",
      comment: "assigning",
    });
    expect(r).toMatchObject({
      ok: false,
      reason: "unresolved-rule",
    });
    expect(r.ok === false && r.error).toBe(
      env.cat.INITIAL_ASSIGNMENT_UNRESOLVED_MESSAGE,
    );
    expect(writes).not.toHaveBeenCalled();
    expect(env.cat.getAdmissionsCategories()).toEqual({
      status: "ok",
      records: {},
    });
  });

  it("the UI blocker reports it before a comment is asked for; normal categories report none", async () => {
    const { cat } = await boot();
    expect(cat.categoryChangeBlocker("")).toBe(
      cat.INITIAL_ASSIGNMENT_UNRESOLVED_MESSAGE,
    );
    expect(cat.categoryChangeBlocker("   ")).not.toBeNull();
    for (const c of cat.ADMISSIONS_CATEGORY_OPTIONS)
      expect(cat.categoryChangeBlocker(c)).toBeNull();
  });

  it("normal changes between existing categories still work", async () => {
    const env = await boot();
    expect(change(env, "L-006", "Program Waitlist").ok).toBe(
      true,
    );
    expect(change(env, "L-006", "Closed").ok).toBe(true);
  });
});