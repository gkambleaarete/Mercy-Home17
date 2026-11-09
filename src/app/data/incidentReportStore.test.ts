// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  addIncidentReportRecord,
  deleteIncidentReport,
  getIncidentReportsForConstituent,
  updateIncidentReport,
} from "./incidentReportStore";
import {
  getIncidentReports,
  subscribeIncidentReports,
} from "./mockYouthProgramData";

const input = (ids: number[], over = {}) => ({
  constituentIds: ids,
  youthInvolved: "X",
  incidentStartDateTime: "2026-11-03T09:15:00",
  program: "",
  staffInvolved: "S",
  incidentTypes: [],
  participants: ids.map((id) => ({ constituentId: id, name: `P${id}`, role: "Youth Involved" })),
  ...over,
});

describe("incidents are selected by explicit participant ID", () => {
  it("an incident for member A is not returned for member B", () => {
    const a = addIncidentReportRecord(input([9301]));
    const b = addIncidentReportRecord(input([9302]));
    if (!a.ok || !b.ok) throw new Error("add");
    expect(getIncidentReportsForConstituent(9301).map((r) => r.id)).toEqual([a.record.id]);
    expect(getIncidentReportsForConstituent(9302).map((r) => r.id)).toEqual([b.record.id]);
  });

  it("a shared incident appears for every participant", () => {
    const r = addIncidentReportRecord(input([9401, 9402]));
    if (!r.ok) throw new Error("add");
    expect(getIncidentReportsForConstituent(9401).map((x) => x.id)).toContain(r.record.id);
    expect(getIncidentReportsForConstituent(9402).map((x) => x.id)).toContain(r.record.id);
  });

  it("a member with none gets an empty list, never the legacy samples", () => {
    expect(getIncidentReportsForConstituent(987654)).toEqual([]);
    expect(getIncidentReports().length).toBeGreaterThan(0);
  });

  it("saves optional detail fields and notifies subscribers", () => {
    let n = 0;
    const off = subscribeIncidentReports(() => n++);
    const r = addIncidentReportRecord(
      input([9501], { endDateTime: "2026-11-03T10:00:00", location: "Gym", description: "d" }),
    );
    off();
    if (!r.ok) throw new Error("add");
    expect(n).toBe(1);
    expect(r.record).toMatchObject({ endDateTime: "2026-11-03T10:00:00", location: "Gym", description: "d" });
  });
});

describe("update and delete are scoped by incident ID", () => {
  it("updating one incident leaves the others untouched", () => {
    const a = addIncidentReportRecord(input([9601]));
    const b = addIncidentReportRecord(input([9602]));
    if (!a.ok || !b.ok) throw new Error("add");
    expect(updateIncidentReport(a.record.id, { location: "Dock" }).ok).toBe(true);
    expect(getIncidentReportsForConstituent(9601)[0].location).toBe("Dock");
    expect(getIncidentReportsForConstituent(9602)[0].location).toBeUndefined();
  });

  it("update of a missing id fails without changing anything", () => {
    const before = getIncidentReports();
    expect(updateIncidentReport(-5, { location: "x" }).ok).toBe(false);
    expect(getIncidentReports()).toBe(before);
  });

  it("delete removes a sole-participant incident only", () => {
    const solo = addIncidentReportRecord(input([9701]));
    const shared = addIncidentReportRecord(input([9701, 9702]));
    if (!solo.ok || !shared.ok) throw new Error("add");
    expect(deleteIncidentReport(solo.record.id, 9701).ok).toBe(true);
    const refused = deleteIncidentReport(shared.record.id, 9701);
    expect(refused.ok).toBe(false);
    expect(getIncidentReportsForConstituent(9702).map((r) => r.id)).toContain(shared.record.id);
  });
});
