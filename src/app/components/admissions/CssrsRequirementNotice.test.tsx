// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CssrsRequirementNotice } from "./CssrsRequirementNotice";
import type { RiskFactorRecord } from "../../data/riskFactorStore";

const rf = (riskFactor: string): RiskFactorRecord => ({
  id: "RF-000001",
  admissionsRecordId: "L-1",
  youthKey: "Y-1",
  riskFactor,
  lastOccurred: "",
  duration: "",
  frequency: "",
  details: "",
  createdAt: "",
  modifiedAt: "",
});
const html = (
  props: Partial<Parameters<typeof CssrsRequirementNotice>[0]>,
) =>
  renderToStaticMarkup(
    <CssrsRequirementNotice
      idPrefix="t"
      requirement={{ status: "none" }}
      {...props}
    />,
  );

describe("CssrsRequirementNotice", () => {
  it("names the matching factors and offers the action", () => {
    const h = html({
      requirement: {
        status: "required",
        factors: [rf("Suicidal Ideation"), rf("Self Harm")],
      },
      onComplete: () => {},
    });
    expect(h).toContain("C-SSRS Full-Lifetime required");
    expect(h).toContain("Suicidal Ideation, Self-Harm");
    expect(h).toContain("Complete C-SSRS Full-Lifetime");
    expect(h).not.toMatch(/satisfied|completed/i);
  });
  it("explains an existing restriction instead of offering the action", () => {
    const h = html({
      requirement: {
        status: "required",
        factors: [rf("Self-Harm")],
      },
      onComplete: () => {},
      unavailableReason:
        "New tests can only be added while the record is Active or Referral.",
    });
    expect(h).toContain("New tests can only be added");
    expect(h).not.toContain("Complete C-SSRS Full-Lifetime");
  });
  it("shows nothing when no factor matches; unavailable is not 'not needed'", () => {
    expect(html({})).toBe("");
    const u = html({
      requirement: { status: "unavailable", reason: "corrupt" },
    });
    expect(u).toContain("be determined");
    expect(u).toContain("does not mean one is not");
  });
  it("lists only the owned assessments with View and Edit", () => {
    const h = html({
      requirement: {
        status: "required",
        factors: [rf("Self-Harm")],
      },
      owned: [{ id: "CSSRS-000001", date: "2026-03-01" }],
    });
    expect(h).toContain("03/01/2026");
    expect(h).toContain(">View<");
    expect(h).toContain(">Edit<");
  });
});