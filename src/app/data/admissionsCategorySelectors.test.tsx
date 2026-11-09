// @vitest-environment jsdom
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

async function boot() {
  vi.resetModules();
  const cat = await import("./admissionsCategoryStore");
  const closure = await import("./caseClosureStore");
  const leads = await import("./mockLeadsData");
  return { cat, closure, leads };
}
type Env = Awaited<ReturnType<typeof boot>>;

function save(
  env: Env,
  id: string,
  to: string,
  comment = "because",
  over: Record<string, unknown> = {},
) {
  const lead = env.leads.ALL_LEADS.find((l) => l.id === id)!;
  const read = env.cat.getAdmissionsCategories();
  const current = env.cat.effectiveAdmissionsCategory(read, id, lead.status);
  const r = env.cat.changeAdmissionsCategory({
    admissionId: id,
    admissionName: lead.name,
    baselineCategory: lead.status,
    expectedCurrentCategory: current,
    newCategory: to,
    comment,
    ...over,
  });
  if (!r.ok) throw new Error(r.error);
  return r;
}

// Render the shared hook the way a component would.
function viewOf(env: Env, base: readonly { id: string; status: string }[]) {
  let out: unknown;
  const C = () => {
    const r = env.cat.useLeadsWithSavedCategories(base);
    out = r;
    return null;
  };
  renderToStaticMarkup(createElement(C));
  return out as ReturnType<Env["cat"]["useLeadsWithSavedCategories"]>;
}

beforeEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("categoryChangesNewestFirst", () => {
  it("returns a newest-first copy and leaves the stored history alone", async () => {
    const env = await boot();
    save(env, "L-001", "Delayed", "first", { now: new Date(2026, 0, 1, 9) });
    save(env, "L-001", "Program Waitlist", "second", { now: new Date(2026, 0, 2, 9) });
    save(env, "L-001", "Referral", "third", { now: new Date(2026, 0, 3, 9) });
    const stored = env.cat.admissionsCategoryHistory(env.cat.getAdmissionsCategories(), "L-001");
    const before = JSON.stringify(stored);
    const sorted = env.cat.categoryChangesNewestFirst(stored);
    expect(sorted.map((c) => c.comment)).toEqual(["third", "second", "first"]);
    expect(sorted).not.toBe(stored);
    expect(JSON.stringify(stored)).toBe(before);
    expect(stored.map((c) => c.comment)).toEqual(["first", "second", "third"]);
  });

  it("breaks timestamp ties by id (later entry first)", async () => {
    const env = await boot();
    const same = new Date(2026, 0, 1, 9);
    save(env, "L-001", "Delayed", "a", { now: same });
    save(env, "L-001", "Referral", "b", { now: same });
    const stored = env.cat.admissionsCategoryHistory(env.cat.getAdmissionsCategories(), "L-001");
    expect(env.cat.categoryChangesNewestFirst(stored).map((c) => c.comment)).toEqual(["b", "a"]);
  });

  it("handles no history", async () => {
    const env = await boot();
    expect(env.cat.categoryChangesNewestFirst([])).toEqual([]);
  });
});

describe("categoryChangesAscending", () => {
  it("returns an oldest-first copy, ties by id, without touching the stored history", async () => {
    const env = await boot();
    save(env, "L-001", "Delayed", "first", { now: new Date(2026, 0, 3, 9) });
    save(env, "L-001", "Program Waitlist", "second", { now: new Date(2026, 0, 1, 9) });
    save(env, "L-001", "Referral", "third", { now: new Date(2026, 0, 2, 9) });
    const stored = env.cat.admissionsCategoryHistory(env.cat.getAdmissionsCategories(), "L-001");
    const before = JSON.stringify(stored);
    const asc = env.cat.categoryChangesAscending(stored);
    expect(asc.map((c) => c.comment)).toEqual(["second", "third", "first"]);
    expect(asc).not.toBe(stored);
    expect(JSON.stringify(stored)).toBe(before);
    expect(env.cat.categoryChangesAscending([])).toEqual([]);
  });

  it("ties on the timestamp fall back to entry id (earlier entry first)", async () => {
    const env = await boot();
    const same = new Date(2026, 0, 1, 9);
    save(env, "L-001", "Delayed", "a", { now: same });
    save(env, "L-001", "Referral", "b", { now: same });
    const stored = env.cat.admissionsCategoryHistory(env.cat.getAdmissionsCategories(), "L-001");
    expect(env.cat.categoryChangesAscending([...stored].reverse()).map((c) => c.comment)).toEqual(["a", "b"]);
  });
});

describe("useLeadsWithSavedCategories (shared overlay)", () => {
  it("applies saved categories by lead.id and keeps every other field/edit", async () => {
    const env = await boot();
    save(env, "L-006", "Closed");
    // a caller's own unrelated local edit must survive the overlay
    const base = env.leads.ALL_LEADS.map((l) =>
      l.id === "L-002" ? { ...l, phone: "000-EDITED" } : l,
    );
    const { leads, categoryError } = viewOf(env, base);
    expect(categoryError).toBeNull();
    expect(leads.find((l) => l.id === "L-006")!.status).toBe("Closed");
    expect((leads.find((l) => l.id === "L-002") as { phone: string }).phone).toBe("000-EDITED");
    expect(leads.find((l) => l.id === "L-007")).toBe(base.find((l) => l.id === "L-007"));
    expect(env.leads.ALL_LEADS.find((l) => l.id === "L-006")!.status).toBe("Delayed");
  });

  it("flags unreadable data and returns baseline values (never as loaded)", async () => {
    window.localStorage.setItem("mh.admissionsCategory.v1", "garbage");
    const env = await boot();
    const { leads, categoryError } = viewOf(env, env.leads.ALL_LEADS);
    expect(categoryError).toBe("corrupt");
    expect(leads.find((l) => l.id === "L-006")!.status).toBe("Delayed");
    expect(window.localStorage.getItem("mh.admissionsCategory.v1")).toBe("garbage");
  });

  it("flags an unsupported version", async () => {
    window.localStorage.setItem("mh.admissionsCategory.v1", JSON.stringify({ version: 7 }));
    const env = await boot();
    expect(viewOf(env, env.leads.ALL_LEADS).categoryError).toBe("unsupported-version");
  });

  it("survives a refresh", async () => {
    save(await boot(), "L-006", "Referral");
    const env = await boot();
    expect(viewOf(env, env.leads.ALL_LEADS).leads.find((l) => l.id === "L-006")!.status).toBe("Referral");
  });
});

describe("list membership on current categories", () => {
  it("Active Leads drops a lead saved into Closed and regains one moved out", async () => {
    const env = await boot();
    const { getInProgressLeads } = env.leads;
    const base = env.leads.ALL_LEADS;
    expect(getInProgressLeads(base).some((l) => l.id === "L-006")).toBe(true);
    expect(getInProgressLeads(base).some((l) => l.id === "L-019")).toBe(false);
    save(env, "L-006", "Closed");
    save(env, "L-019", "Referral");
    const { leads } = viewOf(env, base);
    const active = getInProgressLeads(leads).map((l) => l.id);
    expect(active).not.toContain("L-006");
    expect(active).toContain("L-019");
  });

  it("stage-based and alert-based membership is unchanged by categories and comments", async () => {
    const env = await boot();
    const base = env.leads.ALL_LEADS;
    const alertsBefore = env.leads.getLeadsWithAlerts(base).map((l) => l.id);
    const countBefore = env.leads.getTotalAlertCount(base);
    const assessBefore = env.leads.getLeadsInAssessment(base).map((l) => l.id);
    save(env, "L-001", "Delayed", "a comment must not become an alert");
    const { leads } = viewOf(env, base);
    expect(env.leads.getLeadsWithAlerts(leads).map((l) => l.id)).toEqual(alertsBefore);
    expect(env.leads.getTotalAlertCount(leads)).toBe(countBefore);
    expect(env.leads.getLeadsInAssessment(leads).map((l) => l.id)).toEqual(assessBefore);
    // and the alert arrays themselves are the same objects
    expect(leads.find((l) => l.id === "L-001")!.alerts).toBe(base.find((l) => l.id === "L-001")!.alerts);
  });

  it("the default getters still read the seed (existing callers unchanged)", async () => {
    const { leads } = await boot();
    expect(leads.getInProgressLeads()).toEqual(leads.ALL_LEADS.filter((l) => l.status !== "Closed"));
    expect(leads.getTotalAlertCount()).toBe(leads.ALL_LEADS.reduce((n, l) => n + l.alerts.length, 0));
  });

  it("Total Leads and the status filter see current categories", async () => {
    const env = await boot();
    save(env, "L-006", "Program Waitlist");
    const { leads } = viewOf(env, env.leads.ALL_LEADS);
    expect(leads.filter((l) => l.status === "Program Waitlist").map((l) => l.id)).toContain("L-006");
    expect(leads).toHaveLength(env.leads.ALL_LEADS.length);
  });
});

describe("related admissions and ownership", () => {
  it("related-attempt labels use the saved category of the other profile", async () => {
    const env = await boot();
    const before = env.leads.getAlternateAdmissionProfiles("L-001").find((l) => l.id === "L-019")!;
    expect(env.leads.formatAdmissionAttemptLabel(before)).toContain(`(${before.status})`);
    save(env, "L-019", "Referral");
    const { leads } = viewOf(env, env.leads.ALL_LEADS);
    const after = env.leads.getAlternateAdmissionProfiles("L-001", leads).find((l) => l.id === "L-019")!;
    expect(env.leads.formatAdmissionAttemptLabel(after)).toContain("(Referral)");
  });

  it("a comment on L-001 belongs to L-001 only, not L-019 (same youthId)", async () => {
    const env = await boot();
    save(env, "L-001", "Delayed", "only for L-001");
    const read = env.cat.getAdmissionsCategories();
    expect(env.cat.admissionsCategoryHistory(read, "L-001").map((c) => c.comment)).toEqual(["only for L-001"]);
    expect(env.cat.admissionsCategoryHistory(read, "L-019")).toEqual([]);
    const { leads } = viewOf(env, env.leads.ALL_LEADS);
    const l19 = env.leads.ALL_LEADS.find((l) => l.id === "L-019")!;
    expect(leads.find((l) => l.id === "L-019")!.status).toBe(l19.status);
  });
});