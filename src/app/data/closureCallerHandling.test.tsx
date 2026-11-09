// @vitest-environment jsdom
// What callers of the closure write functions rely on to behave correctly
// when a save fails or saved data can't be read (US 20140 follow-up).
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const STATE_KEY = "mh.admissions.state.v1";
const LEGACY_CLOSURE_KEY = "mh.admissions.caseClosures.v1";

async function boot() {
  vi.resetModules();
  const state = await import("./admissionsStateStore");
  const closure = await import("./caseClosureStore");
  const notice = await import("../components/admissions/ClosureDataNotice");
  return { state, closure, notice };
}
type Env = Awaited<ReturnType<typeof boot>>;

const failWrites = () =>
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("quota");
  });
const day = (n: number) => new Date(2026, 9, 1 + n, 9, 30);
const stored = () => window.localStorage.getItem(STATE_KEY);

function problemOf(env: Env) {
  let out: unknown;
  const C = () => {
    out = env.state.useAdmissionsStateProblem();
    return null;
  };
  renderToStaticMarkup(createElement(C));
  return out as ReturnType<Env["state"]["useAdmissionsStateProblem"]>;
}
const noticeHtml = (env: Env, scope: "page" | "closing-list") =>
  renderToStaticMarkup(createElement(env.notice.ClosureDataNotice, { scope }));

beforeEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("failed closure saves report false and change nothing", () => {
  it("start: false, no closure, storage and displayed state unchanged; retry succeeds", async () => {
    const env = await boot();
    env.closure.startCaseClosure("L-1", "Y", day(0)); // establish a snapshot
    const before = stored();
    const shown = JSON.stringify(env.closure.getCaseClosureData());
    const spy = failWrites();
    expect(env.closure.startCaseClosure("L-2", "Z", day(1))).toBe(false);
    expect(stored()).toBe(before);
    expect(JSON.stringify(env.closure.getCaseClosureData())).toBe(shown);
    spy.mockRestore();
    expect(env.closure.startCaseClosure("L-2", "Z", day(1))).toBe(true);
    expect(env.closure.getCaseClosureData().closures["L-2"].state).toBe("closing");
  });

  it("reopen: false, closure kept; retry succeeds", async () => {
    const env = await boot();
    env.closure.startCaseClosure("L-1", "Y", day(0));
    const before = stored();
    const spy = failWrites();
    expect(env.closure.reopenCaseClosure("L-1")).toBe(false);
    expect(env.closure.getCaseClosureData().closures["L-1"].state).toBe("closing");
    expect(stored()).toBe(before);
    spy.mockRestore();
    expect(env.closure.reopenCaseClosure("L-1")).toBe(true);
    expect(env.closure.getCaseClosureData().closures["L-1"]).toBeUndefined();
  });

  it("finalize: false, stays closing; retry succeeds", async () => {
    const env = await boot();
    env.closure.startCaseClosure("L-1", "Y", day(0));
    const before = stored();
    const spy = failWrites();
    expect(env.closure.finalizeCaseClosure("L-1", "Pat", day(2))).toBe(false);
    expect(env.closure.getCaseClosureData().closures["L-1"].state).toBe("closing");
    expect(stored()).toBe(before);
    spy.mockRestore();
    expect(env.closure.finalizeCaseClosure("L-1", "Pat", day(2))).toBe(true);
    expect(env.closure.getCaseClosureData().closures["L-1"].finalizedBy).toBe("Pat");
  });

  it("a no-op (already closing / nothing to reopen / already finalized) is success, not failure", async () => {
    const env = await boot();
    env.closure.startCaseClosure("L-1", "Y", day(0));
    expect(env.closure.startCaseClosure("L-1", "Y", day(5))).toBe(true);
    expect(env.closure.reopenCaseClosure("L-404")).toBe(true);
    env.closure.finalizeCaseClosure("L-1", "Pat", day(1));
    expect(env.closure.finalizeCaseClosure("L-1", "Pat", day(2))).toBe(true);
  });

  it("mark-notifications-read reports failure too", async () => {
    const env = await boot();
    env.closure.startCaseClosure("L-1", "Y", day(0));
    env.closure.processClosureEligibility(day(40));
    const spy = failWrites();
    expect(env.closure.markClosureNotificationsRead()).toBe(false);
    expect(env.closure.getCaseClosureData().notifications.every((n) => !n.read)).toBe(true);
    spy.mockRestore();
    expect(env.closure.markClosureNotificationsRead()).toBe(true);
  });
});

describe("describeClosureSaveFailure", () => {
  it("says nothing was changed and entries are kept after a failed write", async () => {
    const env = await boot();
    const spy = failWrites();
    env.closure.startCaseClosure("L-1", "Y", day(0));
    const m = env.closure.describeClosureSaveFailure();
    expect(m).toContain("Nothing was changed");
    expect(m).toContain("try again");
    spy.mockRestore();
  });

  it("says the saved data can't be read when the snapshot is unreadable", async () => {
    window.localStorage.setItem(STATE_KEY, "{bad");
    const env = await boot();
    expect(env.closure.startCaseClosure("L-1", "Y", day(0))).toBe(false);
    expect(env.closure.describeClosureSaveFailure()).toContain("can't be read");
    expect(stored()).toBe("{bad"); // preserved, never overwritten
  });
});

describe("unreadable data: every closure write is refused and the raw text is kept", () => {
  it("corrupt snapshot", async () => {
    window.localStorage.setItem(STATE_KEY, "{bad");
    const env = await boot();
    expect(env.closure.startCaseClosure("L-1", "Y", day(0))).toBe(false);
    expect(env.closure.reopenCaseClosure("L-016")).toBe(false);
    expect(env.closure.finalizeCaseClosure("L-016", "Pat", day(1))).toBe(false);
    expect(env.closure.markClosureNotificationsRead()).toBe(false);
    expect(stored()).toBe("{bad");
  });

  it("corrupt legacy closure data (migration blocked)", async () => {
    window.localStorage.setItem(LEGACY_CLOSURE_KEY, "{legacy");
    const env = await boot();
    expect(env.closure.startCaseClosure("L-1", "Y", day(0))).toBe(false);
    expect(window.localStorage.getItem(LEGACY_CLOSURE_KEY)).toBe("{legacy");
    expect(stored()).toBeNull();
  });
});

describe("useAdmissionsStateProblem and ClosureDataNotice", () => {
  it("is null and renders nothing when the data is readable", async () => {
    const env = await boot();
    expect(problemOf(env)).toBeNull();
    expect(noticeHtml(env, "page")).toBe("");
    expect(noticeHtml(env, "closing-list")).toBe("");
  });

  it("reports a corrupt snapshot (not legacy) with closure wording and 'not saved' language", async () => {
    window.localStorage.setItem(STATE_KEY, "{bad");
    const env = await boot();
    expect(problemOf(env)).toEqual({ reason: "corrupt", key: STATE_KEY, legacy: false });
    const page = noticeHtml(env, "page");
    expect(page).toContain('role="alert"');
    expect(page).toContain("Saved closure data can&#x27;t be read");
    expect(page).toContain("not your saved closures");
    expect(page).not.toContain("Category can"); // closure wording, not categories-only
    const list = noticeHtml(env, "closing-list");
    expect(list).toContain("The Closing List shown is the original one");
  });

  it("reports an unsupported snapshot version", async () => {
    window.localStorage.setItem(STATE_KEY, JSON.stringify({ version: 9 }));
    const env = await boot();
    expect(problemOf(env)?.reason).toBe("unsupported-version");
    expect(noticeHtml(env, "page")).toContain("newer version");
  });

  it("reports unreadable LEGACY data as such", async () => {
    window.localStorage.setItem(LEGACY_CLOSURE_KEY, "{legacy");
    const env = await boot();
    expect(problemOf(env)).toMatchObject({ legacy: true, key: LEGACY_CLOSURE_KEY });
    expect(noticeHtml(env, "page")).toContain("earlier version");
  });

  it("returns the same object until the problem changes (no needless re-render)", async () => {
    window.localStorage.setItem(STATE_KEY, "{bad");
    const env = await boot();
    expect(problemOf(env)).toBe(problemOf(env));
  });
});