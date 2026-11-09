// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { RestrictionsIndicator } from "./RestrictionsIndicator";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const rec = (id: number, o: any = {}) => ({ id, youth: "Y", type: "No Access to West Loop", startDate: "06/01/2026", endDate: "", implementedBy: "", restrictionReason: "", campusContact: "", restorativeMeasureDetails: "", endedBy: "", ...o });
const rule = (r: any) => r.endDate === "";
const ok = (records: any[]) => ({ status: "ok", records }) as any;
const roots: any[] = [];
afterEach(async () => { for (const r of roots.splice(0)) await act(async () => r.unmount()); document.body.innerHTML = ""; });
function mount() {
  const el = document.createElement("div"); document.body.appendChild(el);
  const root = createRoot(el); roots.push(root);
  return { el, render: (n: React.ReactNode) => act(async () => root.render(n)) };
}
const trigger = () => document.querySelector('[data-testid="restrictions-indicator"]') as HTMLElement | null;

describe("RestrictionsIndicator (US 20160 update)", () => {
  it("successful load with no records: nothing rendered", async () => {
    const m = mount(); await m.render(<RestrictionsIndicator read={ok([])} />);
    expect(trigger()).toBeNull(); expect(m.el.innerHTML).toBe("");
  });
  it("records but none active under the rule: nothing rendered", async () => {
    const m = mount(); await m.render(<RestrictionsIndicator read={ok([rec(1, { endDate: "06/15/2026" })])} rule={rule} />);
    expect(m.el.innerHTML).toBe("");
  });
  it("multiple active: details comma+space separated, inactive excluded", async () => {
    const m = mount();
    await m.render(<RestrictionsIndicator read={ok([rec(1, { restrictionReason: "Fight" }), rec(2, { type: "Supervised Visits Only", campusContact: "Pat" }), rec(3, { endDate: "06/15/2026" })])} rule={rule} />);
    expect(trigger()!.getAttribute("aria-label")).toBe("Active Restrictions");
    await act(async () => trigger()!.click());
    const t = document.querySelector('[data-testid="restrictions-details"]')!.textContent;
    expect(t).toBe("No Access to West Loop, Supervised Visits Only");
    expect(t).not.toContain("Fight"); expect(t).not.toContain("06/01/2026"); expect(t).not.toContain("Pat");
  });
  it("single record shows exactly its TYPE label", async () => {
    const m = mount(); await m.render(<RestrictionsIndicator read={ok([rec(1)])} rule={rule} />);
    await act(async () => trigger()!.click());
    expect(document.querySelector('[data-testid="restrictions-details"]')!.textContent).toBe("No Access to West Loop");
  });
  it("last active ends: icon disappears, open popup closes and stays closed on return", async () => {
    const m = mount();
    await m.render(<RestrictionsIndicator read={ok([rec(1)])} rule={rule} />);
    await act(async () => trigger()!.click());
    expect(document.querySelector('[data-testid="restrictions-details"]')).not.toBeNull();
    await m.render(<RestrictionsIndicator read={ok([rec(1, { endDate: "06/20/2026" })])} rule={rule} />);
    expect(trigger()).toBeNull(); expect(document.querySelector('[data-testid="restrictions-details"]')).toBeNull();
    await m.render(<RestrictionsIndicator read={ok([rec(5)])} rule={rule} />);
    expect(trigger()).not.toBeNull(); expect(document.querySelector('[data-testid="restrictions-details"]')).toBeNull();
  });
  it("unavailable rule (shipped null): saved records stay undetermined, icon shown, never 'none'", async () => {
    const m = mount(); await m.render(<RestrictionsIndicator read={ok([rec(1)])} />);
    expect(trigger()!.getAttribute("data-state-kind")).toBe("undetermined");
    await act(async () => trigger()!.click());
    expect(document.querySelector('[data-testid="restrictions-details"]')!.textContent).toBe("No Access to West Loop");
    expect(document.body.textContent).not.toMatch(/as recorded|not confirmed|rule is defined|No active restrictions/i);
    const card = document.querySelector('[data-testid="restrictions-details"]')!.parentElement!;
    expect(card.textContent).toBe("RestrictionsNo Access to West Loop");
    expect(card.querySelector("[aria-describedby]")).toBeNull();
  });
  it("read failure: icon shown with error text", async () => {
    const m = mount(); await m.render(<RestrictionsIndicator read={{ status: "error" } as any} />);
    expect(trigger()!.getAttribute("data-state-kind")).toBe("error");
    await act(async () => trigger()!.click());
    expect(document.body.textContent).toContain("could not be read");
    expect(document.querySelector('[data-testid="restrictions-details"]')).toBeNull();
  });
});
