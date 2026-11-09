// @vitest-environment jsdom
// The Alerts KPI keeps its existing meaning (US 20140 Chunk 3): the sum of
// existing lead.alerts across ALL admissions. Category comments never count,
// and the Pipeline KPI and the Alerts drilldown total come from the same
// shared calculation over the same current lead collection.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

async function boot() {
  vi.resetModules();
  const cat = await import("./admissionsCategoryStore");
  const leads = await import("./mockLeadsData");
  const alertsView = await import("../components/admissions/AlertsView");
  return { cat, leads, alertsView };
}
type Env = Awaited<ReturnType<typeof boot>>;

function save(env: Env, id: string, to: string, comment = "c") {
  const lead = env.leads.ALL_LEADS.find((l) => l.id === id)!;
  const cur = env.cat.effectiveAdmissionsCategory(
    env.cat.getAdmissionsCategories(),
    id,
    lead.status,
  );
  const r = env.cat.changeAdmissionsCategory({
    admissionId: id,
    admissionName: lead.name,
    baselineCategory: lead.status,
    expectedCurrentCategory: cur,
    newCategory: to,
    comment,
  });
  if (!r.ok) throw new Error(r.error);
}

// The same collection the Pipeline KPI uses: base leads + saved categories.
function current(env: Env, base: readonly any[]) {
  let out: any;
  const C = () => {
    out = env.cat.useLeadsWithSavedCategories(base);
    return null;
  };
  renderToStaticMarkup(createElement(C));
  return out.leads as typeof env.leads.ALL_LEADS;
}

// What the Alerts drilldown shows as its total, from the real component.
function drilldownTotal(env: Env, base: readonly any[]) {
  const html = renderToStaticMarkup(
    createElement(env.alertsView.AlertsView, {
      onBack: () => {},
      onViewLead: () => {},
      baseLeads: base as any,
    }),
  );
  // the big number in the "total alerts" tile
  return html;
}

beforeEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("existing getTotalAlertCount meaning", () => {
  it("sums existing lead.alerts across ALL admission records (global scope)", async () => {
    const { leads } = await boot();
    const sum = leads.ALL_LEADS.reduce((n, l) => n + l.alerts.length, 0);
    expect(leads.getTotalAlertCount()).toBe(sum);
    expect(leads.getTotalAlertCount(leads.ALL_LEADS)).toBe(sum);
    // includes records a pipeline filter would hide (e.g. Closed ones)
    const filtered = leads.getTotalAlertCount(leads.getInProgressLeads());
    expect(filtered).toBeLessThan(sum);
  });

  it("counts a supplied collection and reacts to its alert changes", async () => {
    const { leads } = await boot();
    const base = leads.ALL_LEADS;
    const n = leads.getTotalAlertCount(base);
    const added = base.map((l) => (l.id === "L-001" ? { ...l, alerts: [...l.alerts, "New alert"] } : l));
    expect(leads.getTotalAlertCount(added)).toBe(n + 1);
    const resolved = base.map((l) => (l.id === "L-002" ? { ...l, alerts: [] } : l));
    expect(leads.getTotalAlertCount(resolved)).toBe(n - base.find((l) => l.id === "L-002")!.alerts.length);
  });
});

const kpi = (env: Env, ls: readonly any[]) =>
  env.cat.getAlertsKpiTotal(ls, env.cat.getAdmissionsCategories());
// admissions that have comments (one each, however many comments)
const commentsOf = (env: Env, ls: readonly any[]) =>
  env.cat.countAdmissionsWithComments(ls, env.cat.getAdmissionsCategories());

describe("the Alerts KPI = existing alerts + 1 per admission that has comments (product decision)", () => {
  it("with no comments it equals the existing alert count", async () => {
    const env = await boot();
    const base = env.leads.ALL_LEADS;
    expect(commentsOf(env, base)).toBe(0);
    expect(kpi(env, base)).toBe(env.leads.getTotalAlertCount(base));
  });

  it("a comment-only admission adds one to the KPI but is not an alert", async () => {
    const env = await boot();
    const base = env.leads.ALL_LEADS;
    const alerts = env.leads.getTotalAlertCount(base);
    const members = env.leads.getLeadsWithAlerts(current(env, base)).map((l) => l.id);
    expect(base.find((l) => l.id === "L-001")!.alerts).toHaveLength(0);
    save(env, "L-001", "Delayed", "comment only");
    const after = current(env, base);
    expect(kpi(env, after)).toBe(alerts + 1);
    // alerts themselves, and the alert list, are unchanged
    expect(env.leads.getTotalAlertCount(after)).toBe(alerts);
    expect(env.leads.getLeadsWithAlerts(after).map((l) => l.id)).toEqual(members);
    expect(env.leads.getLeadsWithAlerts(after).some((l) => l.id === "L-001")).toBe(false);
  });

  it("an admission with many comments adds just one; existing per-lead alert counts are preserved", async () => {
    const env = await boot();
    const base = env.leads.ALL_LEADS;
    const perLead = (ls: typeof base) => Object.fromEntries(ls.map((l) => [l.id, l.alerts.length]));
    const before = perLead(current(env, base));
    const alerts = env.leads.getTotalAlertCount(base);
    for (let i = 0; i < 6; i++) save(env, "L-006", i % 2 ? "Referral" : "Program Waitlist", `bulk ${i}`);
    save(env, "L-002", "Delayed");
    save(env, "L-007", "Delayed");
    const after = current(env, base);
    expect(perLead(after)).toEqual(before);
    // 8 comments over 3 admissions (L-006 x6, L-002, L-007) = 3, not 8
    expect(commentsOf(env, after)).toBe(3);
    expect(kpi(env, after)).toBe(alerts + 3);
    expect(after.find((l) => l.id === "L-006")!.alertSeverity).toBe(base.find((l) => l.id === "L-006")!.alertSeverity);
  });

  it("a move into Closed adds one for that admission and does not resolve, create or rate alerts", async () => {
    const env = await boot();
    const base = env.leads.ALL_LEADS;
    const n = env.leads.getTotalAlertCount(base);
    save(env, "L-006", "Closed"); // L-006 has an alert
    const after = current(env, base);
    expect(after.find((l) => l.id === "L-006")!.alerts).toBe(base.find((l) => l.id === "L-006")!.alerts);
    expect(env.leads.getTotalAlertCount(after)).toBe(n);
    expect(kpi(env, after)).toBe(n + 1);
  });

  it("scope is ALL admissions: comments on Closed ones count, and L-001 / L-019 stay separate", async () => {
    const env = await boot();
    const base = env.leads.ALL_LEADS;
    save(env, "L-001", "Delayed", "for L-001 only");
    expect(commentsOf(env, base.filter((l) => l.id === "L-001"))).toBe(1);
    expect(commentsOf(env, base.filter((l) => l.id === "L-019"))).toBe(0);
    save(env, "L-016", "Referral", "a Closed admission"); // L-016 is Closed in the seed
    const all = current(env, base);
    expect(commentsOf(env, all)).toBe(2);
    // a filtered subset (what a table filter would show) is NOT what the KPI uses
    const filtered = env.leads.getInProgressLeads(all);
    expect(kpi(env, all)).toBeGreaterThanOrEqual(kpi(env, filtered));
  });

  it("comments that can't be read are not counted (nothing unreadable is presented as saved)", async () => {
    window.localStorage.setItem("mh.admissions.state.v1", "{bad");
    const env = await boot();
    const base = env.leads.ALL_LEADS;
    expect(env.cat.getAdmissionsCategories().status).toBe("error");
    expect(kpi(env, base)).toBe(env.leads.getTotalAlertCount(base));
  });
});

describe("Pipeline KPI and Alerts drilldown share one calculation and collection", () => {
  it("both totals are the same number from the same current collection", async () => {
    const env = await boot();
    const base = env.leads.ALL_LEADS;
    save(env, "L-006", "Closed");
    save(env, "L-001", "Delayed");
    const total = kpi(env, current(env, base));
    expect(total).toBe(env.leads.getTotalAlertCount(base) + 2);
    expect(drilldownTotal(env, base)).toContain(`>${total}</p>`);
  });

  it("they stay equal after an alert change in the supplied collection", async () => {
    const env = await boot();
    const base = env.leads.ALL_LEADS.map((l) =>
      l.id === "L-001" ? { ...l, alerts: ["Fresh alert"], alertSeverity: "low" } : l,
    );
    save(env, "L-001", "Delayed");
    const total = kpi(env, current(env, base));
    expect(total).toBe(env.leads.getTotalAlertCount(env.leads.ALL_LEADS) + 1 /* alert */ + 1 /* comment */);
    expect(drilldownTotal(env, base)).toContain(`>${total}</p>`);
  });

  it("the drilldown list is still the existing alert records only", async () => {
    const env = await boot();
    save(env, "L-001", "Delayed", "comment only");
    const html = drilldownTotal(env, env.leads.ALL_LEADS);
    for (const n of env.leads.getLeadsWithAlerts().map((l) => l.name)) expect(html).toContain(n);
    // Marcus Thompson (L-001/L-019) has no alerts, so is not listed
    expect(html).not.toContain("Marcus Thompson");
  });

  it("recalculates after a successful update: +1 for an admission's first comment, +0 for its later ones", async () => {
    const env = await boot();
    const base = env.leads.ALL_LEADS;
    const start = kpi(env, current(env, base));
    save(env, "L-007", "Delayed");
    expect(kpi(env, current(env, base))).toBe(start + 1);
    save(env, "L-007", "Referral");
    save(env, "L-007", "Delayed");
    expect(kpi(env, current(env, base))).toBe(start + 1); // same admission: still one
    save(env, "L-005", "Delayed");
    expect(kpi(env, current(env, base))).toBe(start + 2); // a second admission adds one
  });
});