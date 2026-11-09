// US 20221 — focused tests: Program-scoped permissions, cross-Program role
// validation, reference-protected deletion, and historical role snapshots.
// Runs without jsdom: a minimal in-memory localStorage is installed first.
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

const TODAY = "2026-11-09";
// Program 1 (Self-Awareness): staff 101 (two titles), 102. Program 3 (Bernardin): 201.
const assignments = [
  { programId: 1, constituentId: 101, titleId: "programManager", startDate: "2026-01-01", endDate: "", ongoing: true },
  { programId: 1, constituentId: 101, titleId: "supervisor", startDate: "2026-01-01", endDate: "", ongoing: true },
  { programId: 1, constituentId: 102, titleId: "youthCareWorker", startDate: "2026-01-01", endDate: "", ongoing: true },
  { programId: 3, constituentId: 201, titleId: "youthCareWorker", startDate: "2026-01-01", endDate: "", ongoing: true },
];
let assignmentsReadable = true;

vi.mock("./mockProgramsData", () => ({
  CURRENT_USER_CONSTITUENT_ID: null,
  CURRENT_USER_IS_SYSTEM_ADMIN: true,
  CURRENT_USER_NAME: "Test Admin",
}));
vi.mock("./transitionSummaryDetailsSources", () => ({
  constituentLabel: (id: number) => `Staff ${id}`,
}));
vi.mock("./programStaffAssignmentStore", () => {
  const isCurrentAssignment = (a: { startDate: string; endDate: string; ongoing: boolean }, t: string) =>
    !!a.startDate && a.startDate <= t && (a.ongoing || (!!a.endDate && t <= a.endDate));
  return {
    getProgramStaffAssignments: () =>
      assignmentsReadable ? { status: "ok", assignments } : { status: "error" },
    isCurrentAssignment,
    isRecognizedProgramStaffTitle: () => true,
    programIdsForStaff: (all: typeof assignments, id: number, t: string) => [
      ...new Set(all.filter((a) => a.constituentId === id && isCurrentAssignment(a, t)).map((a) => a.programId)),
    ],
  };
});

const S = await import("./shiftRoleStore");
const admin = { isSystemAdmin: true, constituentId: null, name: "Admin" };

beforeEach(() => {
  mem.clear();
  assignmentsReadable = true;
  S.__setShiftRoleActorForTest(admin, [], TODAY);
  S.__reloadShiftRolesForTest();
});

const roles = () => {
  const st = S.getShiftRoleState();
  if (st.status !== "ok") throw new Error("unavailable");
  return st.roles;
};

describe("role configuration", () => {
  it("trims, defaults Active, rejects blank and case-insensitive duplicates per Program only", () => {
    const a = S.addShiftRole(1, "  Floor Lead ");
    expect(a.ok && a.role.name).toBe("Floor Lead");
    expect(a.ok && a.role.active).toBe(true);
    expect(S.addShiftRole(1, "   ")).toMatchObject({ ok: false, error: "validation" });
    expect(S.addShiftRole(1, "floor lead")).toMatchObject({ ok: false, error: "validation" });
    expect(S.addShiftRole(3, "Floor Lead").ok).toBe(true); // other Program OK
  });

  it("starts an unconfigured Program empty and keeps inactive roles listed", () => {
    expect(S.rolesForProgram(roles(), 3)).toEqual([]);
    const a = S.addShiftRole(1, "Driver");
    if (!a.ok) throw new Error();
    S.setShiftRoleActive(a.role.id, false);
    expect(S.rolesForProgram(roles(), 1)).toHaveLength(1);
    expect(S.activeRolesForProgram(roles(), 1)).toHaveLength(0);
  });

  it("enforces Program-scoped configuration permission at the write boundary", () => {
    const user = { isSystemAdmin: false, constituentId: 102, name: "Staff 102" };
    // Assigned to Program 1 but no grant → denied.
    S.__setShiftRoleActorForTest(user, [], TODAY);
    expect(S.canConfigureShiftRoles(1)).toBe(false);
    expect(S.addShiftRole(1, "X")).toMatchObject({ ok: false, error: "not-permitted" });
    // Granted + assigned → allowed in Program 1 only.
    S.__setShiftRoleActorForTest(user, [102], TODAY);
    expect(S.addShiftRole(1, "X").ok).toBe(true);
    expect(S.addShiftRole(3, "X")).toMatchObject({ ok: false, error: "not-permitted" });
    // No identity → denied.
    S.__setShiftRoleActorForTest({ ...user, constituentId: null }, [102], TODAY);
    expect(S.canConfigureShiftRoles(1)).toBe(false);
  });
});

describe("Staff Member Status (US 20223)", () => {
  const base = { programId: 1, staffConstituentId: 102, date: TODAY, time: "08:00", statusAction: "Start Shift", notes: "" };
  const entries = () => (S.getShiftRoleState() as unknown as { statusEntries: never[] }).statusEntries;
  const role = (p = 1, n = "Floor Lead") => {
    const r = S.addShiftRole(p, n);
    if (!r.ok) throw new Error("role");
    return r.role;
  };

  it("lists eligible staff deduplicated by Constituent ID", () => {
    expect(S.eligibleStaffForProgram(1)?.map((s) => s.constituentId)).toEqual([101, 102]);
  });

  it("requires Staff Member, Shift Role, a valid action, date and time", () => {
    const r = S.createStaffStatusEntry({ ...base, staffConstituentId: null, shiftRoleId: null, statusAction: "Lunch", date: "2026-02-30", time: "25:00" });
    expect(r.ok).toBe(false);
    expect(!r.ok && Object.keys(r.fieldErrors ?? {}).sort()).toEqual(["date", "shiftRole", "staff", "statusAction", "time"]);
  });

  it("accepts all five actions; Notes required (non-blank) only for Other", () => {
    const id = role().id;
    for (const a of S.STATUS_ACTIONS.filter((x) => x !== "Other"))
      expect(S.createStaffStatusEntry({ ...base, shiftRoleId: id, statusAction: a }).ok).toBe(true);
    const blank = S.createStaffStatusEntry({ ...base, shiftRoleId: id, statusAction: "Other", notes: "   " });
    expect(!blank.ok && blank.fieldErrors?.notes).toBeTruthy();
    const ok = S.createStaffStatusEntry({ ...base, shiftRoleId: id, statusAction: "Other", notes: " Covering intake " });
    expect(ok.ok && ok.entry.notes).toBe("Covering intake");
  });

  it("rejects a wrong-Program or inactive role", () => {
    const p3 = role(3, "Bernardin Lead");
    const p1 = role(1);
    expect(S.createStaffStatusEntry({ ...base, shiftRoleId: p3.id })).toMatchObject({ ok: false, error: "validation" });
    S.setShiftRoleActive(p1.id, false);
    const stale = S.createStaffStatusEntry({ ...base, shiftRoleId: p1.id });
    expect(!stale.ok && stale.fieldErrors?.shiftRole).toBeTruthy();
  });

  it("limits non-admins to their own status in a current Program", () => {
    const id = role().id;
    S.__setShiftRoleActorForTest({ isSystemAdmin: false, constituentId: 102, name: "Staff 102" }, [], TODAY);
    expect(S.createStaffStatusEntry({ ...base, shiftRoleId: id }).ok).toBe(true);
    expect(S.createStaffStatusEntry({ ...base, staffConstituentId: 101, shiftRoleId: id }).ok).toBe(false);
  });

  it("keeps author and staff subject separate, and the role name as saved", () => {
    const r = role();
    const e = S.createStaffStatusEntry({ ...base, shiftRoleId: r.id });
    if (!e.ok) throw new Error();
    expect(e.entry).toMatchObject({ createdBy: "Admin", staffNameAtSave: "Staff 102", shiftRoleNameAtSave: "Floor Lead", statusAction: "Start Shift", shiftKey: "morning" });
    S.renameShiftRole(r.id, "Shift Lead");
    S.setShiftRoleActive(r.id, false);
    expect(S.buildStaffStatusSnapshot(entries(), 1, TODAY, "morning").rows[0]).toMatchObject({ roleLabel: "Floor Lead" });
    expect(S.deleteShiftRole(r.id)).toEqual({ ok: false, error: "referenced" });
    expect(S.deleteShiftRole(role(1, "Unused").id)).toEqual({ ok: true });
  });

  it("keeps legacy free-text, role-free entries readable", () => {
    mem.set(S.SHIFT_ROLE_STORAGE_KEY, JSON.stringify({ version: 1, roles: [], statusEntries: [
      { id: "old", programId: 1, staffConstituentId: 102, staffNameAtSave: "Staff 102", shiftRoleId: null, shiftRoleNameAtSave: null, legacyRoleText: "Floater", shiftDate: TODAY, shiftKey: "night", time: "10:00", status: "Covering", createdBy: "x", createdAt: "" },
    ] }));
    S.__reloadShiftRolesForTest();
    // Legacy entries match by their explicit stored shift, not by time.
    const snap = S.buildStaffStatusSnapshot(entries(), 1, TODAY, "night", "06:00");
    expect(snap.rows[0]).toMatchObject({ roleLabel: "Floater", status: "Covering" });
  });

  it("blocks deletion when stored data can't be read", () => {
    const r = role();
    mem.set(S.SHIFT_ROLE_STORAGE_KEY, "{corrupt");
    S.__reloadShiftRolesForTest();
    expect(S.deleteShiftRole(r.id)).toEqual({ ok: false, error: "unavailable" });
  });
});

describe("handover shift windows (prototype policy)", () => {
  const add = (date: string, time: string, statusAction: string, staff = 102) => {
    const r = S.createStaffStatusEntry({ programId: 1, staffConstituentId: staff, shiftRoleId: roleId, date, time, statusAction, notes: "" });
    if (!r.ok) throw new Error(JSON.stringify(r));
  };
  let roleId = "";
  beforeEach(() => {
    const r = S.addShiftRole(1, "Floor Lead");
    if (!r.ok) throw new Error();
    roleId = r.role.id;
  });
  const rows = (date: string, shift: string, time?: string) =>
    S.buildStaffStatusSnapshot((S.getShiftRoleState() as unknown as { statusEntries: never[] }).statusEntries, 1, date, shift, time)
      .rows.map((r) => `${r.date} ${r.time} ${r.status}`);

  it("assigns End Shift to the ending shift and Start Shift to the starting one at 15:00", () => {
    add(TODAY, "15:00", "End Shift");
    add(TODAY, "15:00", "Start Shift", 101);
    expect(rows(TODAY, "morning")).toEqual([`${TODAY} 15:00 End Shift`]);
    expect(rows(TODAY, "afternoon")).toEqual([`${TODAY} 15:00 Start Shift`]);
  });

  it("Overnight before 23:00 covers the night ending on its date; at/after 23:00 the night starting", () => {
    add("2026-11-08", "23:30", "Start Shift");
    add(TODAY, "06:45", "End Shift");
    add(TODAY, "23:10", "Start Shift", 101);
    expect(rows(TODAY, "night", "07:05")).toEqual(["2026-11-08 23:30 Start Shift", `${TODAY} 06:45 End Shift`]);
    expect(rows(TODAY, "night", "23:20")).toEqual([`${TODAY} 23:10 Start Shift`]);
  });

  it("stays within the Program and composes the block once with notes", () => {
    add(TODAY, "09:00", "Start Shift");
    const snap = S.buildStaffStatusSnapshot((S.getShiftRoleState() as unknown as { statusEntries: never[] }).statusEntries, 3, TODAY, "morning");
    expect(snap.rows).toEqual([]);
    const mine = S.buildStaffStatusSnapshot((S.getShiftRoleState() as unknown as { statusEntries: never[] }).statusEntries, 1, TODAY, "morning");
    const text = S.withStaffStatusBlock("Quiet.", mine);
    expect(text.split(S.SUMMARY_STAFF_STATUS_DIVIDER)).toHaveLength(2);
    expect(text).toContain("Staff 102 — Floor Lead: Start Shift (11/09/2026 9:00 AM)");
  });

  it("survives a reload (persisted)", () => {
    S.__reloadShiftRolesForTest();
    expect(S.rolesForProgram(roles(), 1).map((r) => r.name)).toEqual(["Floor Lead"]);
  });
});
