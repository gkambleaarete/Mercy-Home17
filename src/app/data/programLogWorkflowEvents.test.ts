// US 20222 fix — regression tests that drive the REAL writers:
// setYouthLocation (manual + Pass) and the shared incident writers.
// No jsdom needed: a minimal in-memory localStorage is installed first.
import { beforeEach, describe, expect, it } from "vitest";

const mem = new Map<string, string>();
(globalThis as { window?: unknown }).window ??= {
  localStorage: {
    getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void mem.delete(k),
  },
  addEventListener: () => {},
  setInterval: () => 0,
  clearInterval: () => {},
};

const Y = await import("./mockYouthProgramData");
const { setYouthLocation, getYouthLocation, youthLocationKey } = await import("./youthLocationStore");
const { getGeneratedEvents, __resetProgramLogEntriesForTest } = await import("./programLogEntryStore");
const { addIncidentReportRecord, setIncidentReportStatus } = await import("./incidentReportStore");
const { isYouthWritableInProgram } = await import("../components/program-log/useProgramYouthStrip");
const { getPrograms } = await import("./mockProgramsData");

const locationRows = (programId?: number) =>
  getGeneratedEvents().filter((e) => e.logType === "Location" && (programId === undefined || e.programId === programId));
const incidentRows = () => getGeneratedEvents().filter((e) => e.logType === "Incident");

// A real active youth of a real Program, taken from the seed.
const seedEnrollments = [...Y.getYouthProgramEnrollments()];
const P1 = getPrograms()[0].id;
const P2 = getPrograms().find((p) => p.id !== P1)!.id;
let youthId = 0;

beforeEach(() => {
  __resetProgramLogEntriesForTest();
  const candidate = seedEnrollments
    .map((e) => e.constituentId)
    .find((id) => Y.getConstituentById(id) && Y.getActiveYouthForProgram(seedEnrollments.find((e) => e.constituentId === id)!.programId).some((a) => a.constituentId === id))!;
  youthId = candidate;
  // Put the youth actively in P1 only.
  Y.setYouthProgramEnrollmentsData([
    ...seedEnrollments.filter((e) => e.constituentId !== youthId),
    { constituentId: youthId, programId: P1, active: true },
  ]);
});

describe("Location — Program-scoped Current Location", () => {
  it("repro: a shared-strip mock youth with no enrollment (Scooter, pl-7) is not writable and logs no row", () => {
    const scooter = { id: 7, name: "Scooter", status: "Onground" };
    expect(isYouthWritableInProgram(scooter, P1)).toBe(false);
    setYouthLocation(youthLocationKey(scooter), "Offground", { source: "manual", programId: P1 });
    expect(locationRows()).toHaveLength(0);
  });

  it("wrong Program or stale enrollment → not writable, and an explicit-Program write logs nothing", () => {
    expect(isYouthWritableInProgram({ constituentId: youthId }, P2)).toBe(false);
    setYouthLocation(String(youthId), "School", { source: "manual", programId: P2 });
    expect(locationRows()).toHaveLength(0);
    // Enrollment ends while the dialog is open.
    expect(isYouthWritableInProgram({ constituentId: youthId }, P1)).toBe(true);
    Y.setYouthProgramEnrollmentsData(seedEnrollments.filter((e) => e.constituentId !== youthId));
    expect(isYouthWritableInProgram({ constituentId: youthId }, P1)).toBe(false);
  });

  it("valid change → one row in the owning Program with old/new; repeat → zero more", () => {
    const key = String(youthId);
    const before = getYouthLocation(key)?.location ?? "Onground";
    const next = before === "Offground" ? "School" : "Offground";
    setYouthLocation(key, next, { source: "manual", programId: P1 });
    expect(locationRows(P1)).toHaveLength(1);
    expect(locationRows(P1)[0]).toMatchObject({ previousLocation: before, newLocation: next, programId: P1 });
    setYouthLocation(key, next, { source: "manual", programId: P1 });
    expect(locationRows()).toHaveLength(1);
  });

  it("history stays in the original Program after a transfer", () => {
    setYouthLocation(String(youthId), "Medical", { source: "manual", programId: P1 });
    Y.setYouthProgramEnrollmentsData([
      ...seedEnrollments.filter((e) => e.constituentId !== youthId),
      { constituentId: youthId, programId: P2, active: true },
    ]);
    expect(locationRows(P1)).toHaveLength(1);
    expect(locationRows(P2)).toHaveLength(0);
  });

  it("Pass start (no Program Log open) logs the effective change once, resolved by enrollment", () => {
    setYouthLocation(String(youthId), "Pass", { source: "pass", passId: 999 });
    setYouthLocation(String(youthId), "Pass", { source: "pass", passId: 999 });
    expect(locationRows(P1)).toHaveLength(1);
    expect(locationRows(P1)[0]).toMatchObject({ newLocation: "Pass", passId: 999 });
    expect(getYouthLocation(String(youthId))).toMatchObject({ source: "pass", sourcePassId: 999 });
  });
});

describe("Incident — shared finalization writer", () => {
  const programName = () => getPrograms().find((p) => p.id === P1)!.name;
  const input = (over = {}) => ({
    constituentIds: [youthId],
    youthInvolved: "Youth X",
    incidentStartDateTime: "2026-11-09T09:15:00",
    program: programName(),
    staffInvolved: "Staff S",
    incidentTypes: ["Aggression"],
    ...over,
  });

  it("repro: draft → zero rows; finalize via setIncidentReportStatus (Youth Incident Details path) → one row", () => {
    const draft = addIncidentReportRecord(input());
    if (!draft.ok) throw new Error();
    expect(incidentRows()).toHaveLength(0);
    setIncidentReportStatus(draft.record.id, "In Progress");
    expect(incidentRows()).toHaveLength(0);
    setIncidentReportStatus(draft.record.id, "Finalized");
    expect(incidentRows()).toHaveLength(1);
    expect(incidentRows()[0]).toMatchObject({ key: `incident:${draft.record.id}`, programId: P1, reportId: String(draft.record.id) });
  });

  it("created already Finalized (Program Log → IR with programId) → one row; retry keeps one; two reports → two", () => {
    const a = addIncidentReportRecord(input({ status: "Finalized", programId: P1 }));
    if (!a.ok) throw new Error();
    setIncidentReportStatus(a.record.id, "Finalized"); // retry
    expect(incidentRows()).toHaveLength(1);
    const b = addIncidentReportRecord(input({ status: "Finalized", programId: P1 }));
    if (!b.ok) throw new Error();
    expect(new Set(incidentRows().map((r) => r.key)).size).toBe(2);
  });

  it("failed write, missing or unknown Program ownership → zero rows", () => {
    expect(setIncidentReportStatus(-1, "Finalized").ok).toBe(false);
    const none = addIncidentReportRecord(input({ program: "", status: "Finalized" }));
    const unknown = addIncidentReportRecord(input({ program: "No Such Program", status: "Finalized" }));
    const badId = addIncidentReportRecord(input({ programId: 987654, status: "Finalized" }));
    expect(none.ok && unknown.ok && badId.ok).toBe(true);
    expect(incidentRows()).toHaveLength(0);
  });
});
