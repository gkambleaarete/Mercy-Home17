// US 20222 — manual Log Type allowlist, manual validation, and generated
// row de-duplication (feed projection keyed by source identity).
import { beforeEach, describe, expect, it, vi } from "vitest";

const mem = new Map<string, string>();
(globalThis as { window?: unknown }).window ??= {
  localStorage: {
    getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void mem.delete(k),
  },
  addEventListener: () => {},
};
vi.mock("./mockProgramsData", () => ({
  CURRENT_USER_CONSTITUENT_ID: null,
  CURRENT_USER_IS_SYSTEM_ADMIN: true,
  CURRENT_USER_NAME: "Test Admin",
}));
vi.mock("./transitionSummaryDetailsSources", () => ({ constituentLabel: () => "x" }));
vi.mock("./programStaffAssignmentStore", () => ({
  getProgramStaffAssignments: () => ({ status: "ok", assignments: [] }),
  isCurrentAssignment: () => true,
  isRecognizedProgramStaffTitle: () => true,
  programIdsForStaff: () => [],
}));
vi.mock("@/app/lib/lucide-icons", () =>
  Object.fromEntries(["AlertTriangle", "DoorClosed", "DoorOpen", "Eye", "MapPin", "Moon", "Sun", "Sunset", "Users"].map((n) => [n, n])),
);

const L = await import("./programLogEntryStore");
const F = await import("../components/program-log/programLogFeed");

beforeEach(() => {
  mem.clear();
  L.__resetProgramLogEntriesForTest();
});

const base = { programId: 1, date: "2026-11-09", time: "14:05" };

describe("manual save boundary", () => {
  it("offers exactly the three manual types, in order", () => {
    expect([...L.MANUAL_LOG_TYPES]).toEqual(["Staff Member Status", "Milieu Observation", "Program Close / Reopen"]);
  });

  it.each(["Morning Entry", "Evening Entry", "Night Entry", "Connection", "Shift Summary", "Incident", "Location", "Observation", "Communication Log", "Staff Member Status"])(
    "rejects %s",
    (logType) => {
      expect(L.createManualLogEntry({ ...base, logType, content: "x", action: "Closing" })).toEqual({ ok: false, error: "not-allowed" });
      expect(L.getManualLogEntries()).toEqual({ status: "ok", entries: [] });
    },
  );

  it("saves Milieu Observation with the submitted date/time; requires content", () => {
    const bad = L.createManualLogEntry({ ...base, logType: "Milieu Observation", content: "  " });
    expect(!bad.ok && bad.fieldErrors?.content).toBeTruthy();
    const ok = L.createManualLogEntry({ ...base, logType: "Milieu Observation", content: "Calm evening", youth: ["Kermit"] });
    expect(ok.ok && ok.entry).toMatchObject({ logType: "Milieu Observation", date: "2026-11-09", time: "14:05", content: "Calm evening" });
  });

  it("saves both Program Close / Reopen actions; requires an action; rejects bad date/time", () => {
    expect(L.createManualLogEntry({ ...base, logType: "Program Close / Reopen" })).toMatchObject({ ok: false, error: "validation" });
    expect(L.createManualLogEntry({ ...base, date: "2026-13-01", time: "9:5", logType: "Program Close / Reopen", action: "Closing" })).toMatchObject({ ok: false, error: "validation" });
    expect(L.createManualLogEntry({ ...base, logType: "Program Close / Reopen", action: "Closing" }).ok).toBe(true);
    expect(L.createManualLogEntry({ ...base, logType: "Program Close / Reopen", action: "Reopening", notes: "Power restored" }).ok).toBe(true);
    const read = L.getManualLogEntries();
    if (read.status !== "ok") throw new Error();
    const rows = F.manualRows(read.entries, 1);
    expect(rows.map((r) => [r.type, r.title])).toEqual([
      ["Program Close / Reopen", "Program Closed"],
      ["Program Close / Reopen", "Program Reopened"],
    ]);
    expect(F.manualRows(read.entries, 3)).toEqual([]); // Program-scoped
  });
});

describe("generated rows are deduplicated by source identity", () => {
  it("upserting the same incident twice yields one row", () => {
    const ev = { key: "incident:42", programId: 1, logType: "Incident" as const, date: "2026-11-09", time: "10:00", youthName: "Kermit", reportId: "42", createdBy: "x" };
    L.upsertGeneratedEvent(ev);
    L.upsertGeneratedEvent({ ...ev, summary: "retry" });
    expect(F.generatedRows(L.getGeneratedEvents(), 1)).toHaveLength(1);
  });

  it("a handover yields one typed row; editing it updates the same row; unsaved yields none", () => {
    const h = { id: 7, author: "A", summary: "v1", savedShift: { key: "afternoon", date: "2026-11-09", time: "22:50" } };
    expect(F.handoverRows([h, { id: 8, author: "B", summary: "seed" }], 1).map((r) => [r.id, r.type])).toEqual([["handover:1:7", "Evening Entry"]]);
    const edited = F.handoverRows([{ ...h, summary: "v2" }], 1);
    expect(edited).toHaveLength(1);
    expect(edited[0]).toMatchObject({ id: "handover:1:7", content: "v2" });
    expect(F.handoverRows([{ ...h, savedShift: { ...h.savedShift, key: "night" } }], 1)[0].type).toBe("Night Entry");
    expect(F.handoverRows([{ ...h, savedShift: { ...h.savedShift, key: "morning" } }], 1)[0].type).toBe("Morning Entry");
  });
});
