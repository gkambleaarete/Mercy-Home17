import { describe, expect, it } from "vitest";
import type { IncidentReportRecord } from "../data/mockYouthProgramData";
import {
  eligibleIncidentReports,
  hasEligibleIncidentType,
} from "./cssrsRelatedIr";

const ir = (
  id: number,
  constituentIds: number[],
  incidentTypes?: string[],
): IncidentReportRecord => ({
  id,
  constituentIds,
  youthInvolved: "x",
  incidentStartDateTime: `2026-02-${String(id).padStart(2, "0")}T10:00:00`,
  program: "P",
  staffInvolved: "S",
  status: "In Progress",
  isFinalized: false,
  incidentTypes,
});

describe("Related IR eligibility", () => {
  const reports = [
    ir(1, [1], ["Suicide Attempt"]),
    ir(2, [1], ["Theft", "Self‑Harm"]), // non-breaking hyphen from the IR form
    ir(3, [1], ["Theft"]),
    ir(4, [1]), // untyped: unknown, ineligible
    ir(5, [2], ["Suicidal Ideation"]), // another youth
    ir(6, [1], ["Self‑Harm Ideation"]), // not an eligible type
    ir(7, [1, 2], ["Suicidal Ideation"]),
  ];

  it("keeps only explicit eligible types for the verified youth", () => {
    expect(
      eligibleIncidentReports("1", reports).map((o) => o.id),
    ).toEqual(["7", "2", "1"]);
    expect(
      eligibleIncidentReports("2", reports).map((o) => o.id),
    ).toEqual(["7", "5"]);
  });

  it("offers nothing without a verified Constituent", () => {
    expect(eligibleIncidentReports(null, reports)).toEqual([]);
    expect(
      eligibleIncidentReports("not-a-number", reports),
    ).toEqual([]);
  });

  it("matches when at least one explicit type is eligible", () => {
    expect(
      hasEligibleIncidentType(["Theft", "Suicide Attempt"]),
    ).toBe(true);
    expect(hasEligibleIncidentType(["Theft"])).toBe(false);
    expect(hasEligibleIncidentType(undefined)).toBe(false);
    expect(hasEligibleIncidentType([])).toBe(false);
  });

  it("never relabels the existing sample incidents", async () => {
    const { getIncidentReports } =
      await import("../data/mockYouthProgramData");
    expect(
      getIncidentReports().every(
        (r) => r.incidentTypes === undefined,
      ),
    ).toBe(true);
    expect(
      getIncidentReports().flatMap((r) =>
        r.constituentIds.flatMap((c) =>
          eligibleIncidentReports(
            String(c),
            getIncidentReports(),
          ),
        ),
      ),
    ).toEqual([]);
  });
});