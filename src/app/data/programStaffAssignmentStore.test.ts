// @vitest-environment jsdom
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { CONSTITUENTS } from "./mockConstituents";
import {
  __setMedicationLogUserForTest,
  can,
  getMedicationLogAccess,
  isProgramAuthorized,
} from "./medicationLogAccess";
import {
  __setDemoSeedEnabledForTest,
  __reloadProgramsForTest,
  todayIso,
  getProgramById,
  getPrograms,
  getProgramDataStatus,
  saveProgramRecord,
  type ProgramRecord,
} from "./mockProgramsData";
import {
  __reloadProgramStaffAssignmentsForTest,
  addProgramStaffAssignment,
  assignmentDuration,
  assignmentsForProgram,
  correctProgramStaffAssignment,
  currentStaffForProgram,
  endProgramStaffAssignment,
  getProgramStaffAssignments,
  saveProgramWithStaffChanges,
} from "./programStaffAssignmentStore";
import {
  applyLegacyFields,
  initialStaffSelection,
  planStaffChanges,
} from "./programStaffSelection";
import {
  deleteProgram,
  getProgramRelatedRecords,
} from "./programDeletion";

const STATE_KEY = "mh.programData.v2";
const OLD_PROGRAMS_KEY = "mh.programs.v1";
const OLD_ASSIGN_KEY = "mh.programStaffAssignments.v1";

// The assignments inside the one saved state.
const savedAssignments = () =>
  JSON.parse(localStorage.getItem(STATE_KEY)!).assignments;
/** Edits the saved state directly, as another tab's save would. */
const editSaved = (fn: (s: any) => void) => {
  const st = JSON.parse(localStorage.getItem(STATE_KEY)!);
  fn(st);
  localStorage.setItem(STATE_KEY, JSON.stringify(st));
};
const STAFF_A = 6; // seeded MHBG Staff
const STAFF_B = 987654; // added below

beforeEach(() => {
  // The demo staff history is covered in its own block below.
  __setDemoSeedEnabledForTest(false);
  localStorage.clear();
  if (!CONSTITUENTS.some((c) => c.id === STAFF_B))
    CONSTITUENTS.push({
      id: STAFF_B,
      name: "Riley Staffer With A Very Long Name That Should Wrap In The Table",
      type: "Individual",
      role: "MHBG Staff",
      status: "Active",
      program: "—",
      lastUpdated: "2026-01-01",
    });
  __reloadProgramsForTest();
  __reloadProgramStaffAssignmentsForTest();
});
afterEach(() => vi.restoreAllMocks());

const reload = () => {
  __reloadProgramsForTest();
  __reloadProgramStaffAssignmentsForTest();
};

const newProgram = (
  name = "Regression Program",
): ProgramRecord => ({
  ...getPrograms()[0],
  id: 0,
  name,
  programManager: "",
  therapist: "",
  supervisor: "",
  ecrCoordinator: "",
  dayCoordinator: "",
  youthCareWorkers: [],
});

const all = () => {
  const r = getProgramStaffAssignments();
  if (r.status !== "ok") throw new Error("unreadable");
  return r.assignments;
};

function createWithManager() {
  const r = saveProgramWithStaffChanges({
    record: newProgram(),
    mode: "create",
    changes: [
      {
        kind: "add",
        constituentId: STAFF_A,
        titleId: "program-manager",
        startDate: "2026-01-05",
      },
    ],
  });
  if (!r.ok) throw new Error(r.error);
  return r.program;
}

describe("Program persistence + assignments", () => {
  it("creates a Program, assigns staff, survives reload, and the assignment stays editable", () => {
    const p = createWithManager();
    reload();
    expect(getProgramById(p.id)?.name).toBe(
      "Regression Program",
    );
    const [a] = assignmentsForProgram(all(), p.id);
    expect(a).toMatchObject({
      constituentId: STAFF_A,
      titleId: "program-manager",
      startDate: "2026-01-05",
      ongoing: true,
    });
    const fixed = correctProgramStaffAssignment(a.id, {
      titleId: "program-manager",
      startDate: "2026-01-06",
      endDate: "",
      ongoing: true,
    });
    expect(fixed.ok).toBe(true);
    reload();
    expect(assignmentsForProgram(all(), p.id)[0]).toMatchObject(
      {
        id: a.id,
        startDate: "2026-01-06",
      },
    );
  });

  it("add / replace / remove keep the previous assignment with its id and dates", () => {
    const p = createWithManager();
    const first = assignmentsForProgram(all(), p.id)[0];
    // Replace A with B.
    const r = saveProgramWithStaffChanges({
      record: getProgramById(p.id)!,
      mode: "edit",
      changes: [
        {
          kind: "end",
          assignmentId: first.id,
          endDate: "2026-03-01",
        },
        {
          kind: "add",
          constituentId: STAFF_B,
          titleId: "program-manager",
          startDate: "2026-03-02",
        },
      ],
    });
    expect(r).toMatchObject({ ok: true });
    reload();
    const rows = assignmentsForProgram(all(), p.id);
    expect(rows).toHaveLength(2);
    const old = rows.find((x) => x.id === first.id)!;
    expect(old).toMatchObject({
      constituentId: STAFF_A,
      ongoing: false,
      endDate: "2026-03-01",
    });
    expect(assignmentDuration(old)).toBe(
      "01/05/2026 to 03/01/2026",
    );
    // Remove B.
    const b = rows.find((x) => x.constituentId === STAFF_B)!;
    expect(
      saveProgramWithStaffChanges({
        record: getProgramById(p.id)!,
        mode: "edit",
        changes: [
          {
            kind: "end",
            assignmentId: b.id,
            endDate: "2026-04-01",
          },
        ],
      }).ok,
    ).toBe(true);
    expect(assignmentsForProgram(all(), p.id)).toHaveLength(2);
    expect(
      currentStaffForProgram(all(), p.id, "2026-05-01"),
    ).toEqual({});
  });

  it("moving staff to another title keeps the old assignment and adds a separate one", () => {
    const p = createWithManager();
    const first = assignmentsForProgram(all(), p.id)[0];
    saveProgramWithStaffChanges({
      record: getProgramById(p.id)!,
      mode: "edit",
      changes: [
        {
          kind: "end",
          assignmentId: first.id,
          endDate: "2026-02-01",
        },
        {
          kind: "add",
          constituentId: STAFF_A,
          titleId: "therapist",
          startDate: "2026-02-02",
        },
      ],
    });
    const rows = assignmentsForProgram(all(), p.id);
    expect(rows.map((r) => r.titleId).sort()).toEqual([
      "program-manager",
      "therapist",
    ]);
  });

  it("an unrelated Program save creates no assignment records", () => {
    const p = createWithManager();
    const before = JSON.stringify(savedAssignments());
    const r = saveProgramWithStaffChanges({
      record: {
        ...getProgramById(p.id)!,
        description: "Changed",
      },
      mode: "edit",
      changes: [],
    });
    expect(r.ok).toBe(true);
    expect(JSON.stringify(savedAssignments())).toBe(before);
    expect(getProgramById(p.id)?.description).toBe("Changed");
  });

  it("plans changes only for people added or removed, against the latest records", () => {
    const p = createWithManager();
    const init = initialStaffSelection(
      getProgramById(p.id)!,
      all(),
      "2026-02-01",
    );
    expect(init.selection["program-manager"]).toEqual([
      { kind: "id", id: STAFF_A },
    ]);
    expect(
      planStaffChanges(
        p.id,
        init.selection,
        init.locked,
        all(),
        "2026-02-01",
      ),
    ).toEqual([]);
    const next = {
      ...init.selection,
      "program-manager": [{ kind: "id" as const, id: STAFF_B }],
    };
    const plan = planStaffChanges(
      p.id,
      next,
      init.locked,
      all(),
      "2026-02-01",
    );
    expect(plan.map((c) => c.kind)).toEqual(["end", "add"]);
  });

  it("legacy name-only values stay readable and are cleared only when replaced", () => {
    const legacy = { ...newProgram(), therapist: "Old Name" };
    const saved = saveProgramRecord(legacy, "create");
    if (!saved.ok) throw new Error("save");
    const init = initialStaffSelection(
      saved.program,
      all(),
      "2026-02-01",
    );
    expect(init.selection.therapist).toEqual([
      { kind: "legacy", name: "Old Name" },
    ]);
    const kept = applyLegacyFields(
      saved.program,
      init.selection,
      init.legacyShown,
    );
    expect(kept.therapist).toBe("Old Name");
    const replaced = applyLegacyFields(
      saved.program,
      {
        ...init.selection,
        therapist: [{ kind: "id", id: STAFF_A }],
      },
      init.legacyShown,
    );
    expect(replaced.therapist).toBe("");
  });

  it("a future assignment is not current before its start date", () => {
    const p = createWithManager();
    expect(
      currentStaffForProgram(all(), p.id, "2026-01-04"),
    ).toEqual({});
    expect(
      currentStaffForProgram(all(), p.id, "2026-01-05")[
        "program-manager"
      ],
    ).toHaveLength(1);
  });
});

describe("Constituent Profile and Program share one set of records", () => {
  it("an assignment added from the profile shows under the right Program only", () => {
    const [p1, p2] = getPrograms();
    const r = addProgramStaffAssignment({
      programId: p1.id,
      constituentId: STAFF_A,
      titleId: "therapist",
      startDate: "2025-01-01",
      endDate: "2025-06-01",
      ongoing: false,
    });
    expect(r.ok).toBe(true);
    expect(assignmentsForProgram(all(), p1.id)).toHaveLength(1);
    expect(assignmentsForProgram(all(), p2.id)).toHaveLength(0);
  });
});

describe("Deletion safeguard", () => {
  it("is blocked by a completed assignment and by an ongoing one", () => {
    const p = saveProgramRecord(
      newProgram("Deletable"),
      "create",
    );
    if (!p.ok) throw new Error("save");
    expect(deleteProgram(p.program.id, true)).toEqual({
      ok: true,
    });
    const q = saveProgramRecord(
      newProgram("Blocked"),
      "create",
    );
    if (!q.ok) throw new Error("save");
    // (Different Start Dates: the same staff + Program + title + Start Date
    // is an exact duplicate and is refused — US 20127.)
    for (const [endDate, ongoing, startDate] of [
      ["2025-02-01", false, "2025-01-01"],
      ["", true, "2025-03-01"],
    ] as const) {
      addProgramStaffAssignment({
        programId: q.program.id,
        constituentId: STAFF_A,
        titleId: "supervisor",
        startDate,
        endDate,
        ongoing,
      });
    }
    const res = deleteProgram(q.program.id, true);
    expect(res).toMatchObject({
      ok: false,
      reason: "has-related-records",
    });
    expect(
      getProgramRelatedRecords(q.program.id).find((r) =>
        r.label.startsWith("Staff assignments"),
      )?.count,
    ).toBe(2);
    expect(getProgramById(q.program.id)).toBeDefined();
    expect(all()).toHaveLength(2); // nothing cascaded
  });

  it("is refused when the assignment history can't be read", () => {
    const q = saveProgramRecord(
      newProgram("Unreadable"),
      "create",
    );
    if (!q.ok) throw new Error("save");
    localStorage.setItem(STATE_KEY, "{bad");
    __reloadProgramStaffAssignmentsForTest();
    expect(deleteProgram(q.program.id, true)).toMatchObject({
      ok: false,
    });
    expect(localStorage.getItem(STATE_KEY)).toBe("{bad");
  });
});

describe("End uses the latest saved record", () => {
  it("preserves a correction saved by another tab", () => {
    const r = addProgramStaffAssignment({
      programId: getPrograms()[0].id,
      constituentId: STAFF_A,
      titleId: "therapist",
      startDate: "2025-01-10",
      endDate: "",
      ongoing: true,
    });
    if (!r.ok) throw new Error("add");
    // Another tab corrects the title and start date directly in storage.
    editSaved((st) => {
      st.assignments[0].titleId = "supervisor";
      st.assignments[0].startDate = "2025-01-02";
    });
    const ended = endProgramStaffAssignment(
      r.assignment.id,
      "2025-05-01",
    );
    expect(ended.ok).toBe(true);
    expect(all()[0]).toMatchObject({
      titleId: "supervisor",
      startDate: "2025-01-02",
      endDate: "2025-05-01",
      ongoing: false,
    });
  });

  it("validates against the latest record (end before the corrected start is refused)", () => {
    const r = addProgramStaffAssignment({
      programId: getPrograms()[0].id,
      constituentId: STAFF_A,
      titleId: "therapist",
      startDate: "2025-01-10",
      endDate: "",
      ongoing: true,
    });
    if (!r.ok) throw new Error("add");
    editSaved((st) => {
      st.assignments[0].startDate = "2025-06-01";
    });
    expect(
      endProgramStaffAssignment(r.assignment.id, "2025-05-01")
        .ok,
    ).toBe(false);
    expect(all()[0].ongoing).toBe(true);
  });
});

describe("Failed writes and unreadable data change nothing", () => {
  it("a failed save leaves BOTH the Program and the assignments unchanged", () => {
    const p = createWithManager();
    const first = assignmentsForProgram(all(), p.id)[0];
    const before = localStorage.getItem(STATE_KEY);
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota");
      });
    const r = saveProgramWithStaffChanges({
      record: {
        ...getProgramById(p.id)!,
        description: "Never saved",
      },
      mode: "edit",
      changes: [
        {
          kind: "end",
          assignmentId: first.id,
          endDate: "2026-03-01",
        },
        {
          kind: "add",
          constituentId: STAFF_B,
          titleId: "program-manager",
          startDate: "2026-03-02",
        },
      ],
    });
    spy.mockRestore();
    expect(r.ok).toBe(false);
    // Storage and memory are exactly as before.
    expect(localStorage.getItem(STATE_KEY)).toBe(before);
    expect(getProgramById(p.id)?.description).not.toBe(
      "Never saved",
    );
    expect(all()).toHaveLength(1);
    expect(all()[0]).toMatchObject({
      id: first.id,
      ongoing: true,
      endDate: "",
    });
    reload();
    expect(all()).toHaveLength(1);
    expect(getProgramById(p.id)?.description).not.toBe(
      "Never saved",
    );
  });

  it("a failed create saves neither the Program nor its assignments", () => {
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota");
      });
    const r = saveProgramWithStaffChanges({
      record: newProgram("Nope"),
      mode: "create",
      changes: [
        {
          kind: "add",
          constituentId: STAFF_A,
          titleId: "therapist",
          startDate: "2026-01-01",
        },
      ],
    });
    spy.mockRestore();
    expect(r.ok).toBe(false);
    expect(localStorage.getItem(STATE_KEY)).toBeNull();
    expect(getPrograms().some((p) => p.name === "Nope")).toBe(
      false,
    );
    expect(all()).toHaveLength(0);
  });

  it("an invalid date writes nothing", () => {
    // (A blank Start Date is now allowed — US 20127 — an invalid one isn't.)
    const r = saveProgramWithStaffChanges({
      record: newProgram("Bad Date"),
      mode: "create",
      changes: [
        {
          kind: "add",
          constituentId: STAFF_A,
          titleId: "therapist",
          startDate: "2025-13-45",
        },
      ],
    });
    expect(r).toMatchObject({
      ok: false,
      changeErrors: { 0: expect.any(String) },
    });
    expect(localStorage.getItem(STATE_KEY)).toBeNull();
  });

  it("unreadable saved state (Programs and assignments) is reported and never overwritten", () => {
    localStorage.setItem(STATE_KEY, "{bad");
    __reloadProgramsForTest();
    expect(getProgramDataStatus()).toBe("unreadable");
    expect(getPrograms()).toEqual([]);
    expect(getProgramStaffAssignments().status).toBe("error");
    expect(
      saveProgramRecord(newProgram("X"), "create"),
    ).toMatchObject({
      ok: false,
      reason: "unreadable",
    });
    expect(
      saveProgramWithStaffChanges({
        record: newProgram("Y"),
        mode: "create",
        changes: [],
      }).ok,
    ).toBe(false);
    expect(localStorage.getItem(STATE_KEY)).toBe("{bad");
  });
});

describe("Migration from the two old keys", () => {
  const oldPrograms = () => ({
    version: 1,
    programs: [
      { ...getPrograms()[0], id: 42, name: "Migrated Program" },
    ],
    capacitySnapshots: [
      {
        id: 7,
        programId: 42,
        capacity: 9,
        effectiveDate: "2025-01-01",
        createdBy: "x",
        createdAt: "2025-01-01T00:00:00Z",
      },
    ],
  });
  const oldAssignments = () => ({
    version: 1,
    assignments: [
      {
        id: "keep-me",
        programId: 42,
        constituentId: STAFF_A,
        titleId: "therapist",
        startDate: "2025-02-01",
        endDate: "2025-03-01",
        ongoing: false,
        createdAt: "2025-02-01T00:00:00Z",
        updatedAt: "2025-02-01T00:00:00Z",
      },
    ],
  });

  it("preserves ids, dates and history, writes the new state, then retires the old keys", () => {
    localStorage.setItem(
      OLD_PROGRAMS_KEY,
      JSON.stringify(oldPrograms()),
    );
    localStorage.setItem(
      OLD_ASSIGN_KEY,
      JSON.stringify(oldAssignments()),
    );
    reload();
    expect(getProgramById(42)?.name).toBe("Migrated Program");
    // Records saved before Notes existed load with empty Notes, otherwise unchanged.
    expect(all()).toEqual(
      oldAssignments().assignments.map((a: any) => ({
        ...a,
        notes: "",
      })),
    );
    const saved = JSON.parse(localStorage.getItem(STATE_KEY)!);
    expect(saved.version).toBe(2);
    expect(saved.capacitySnapshots[0].id).toBe(7);
    expect(localStorage.getItem(OLD_PROGRAMS_KEY)).toBeNull();
    expect(localStorage.getItem(OLD_ASSIGN_KEY)).toBeNull();
  });

  it("migrates assignments alone, keeping the seed Programs", () => {
    const seeded = getPrograms().length;
    localStorage.setItem(
      OLD_ASSIGN_KEY,
      JSON.stringify(oldAssignments()),
    );
    reload();
    expect(getPrograms()).toHaveLength(seeded);
    expect(all()).toHaveLength(1);
  });

  it("refuses to migrate when either old key can't be read, leaving both untouched", () => {
    const a = JSON.stringify(oldPrograms());
    localStorage.setItem(OLD_PROGRAMS_KEY, a);
    localStorage.setItem(OLD_ASSIGN_KEY, "{bad");
    reload();
    expect(getProgramDataStatus()).toBe("unreadable");
    expect(localStorage.getItem(STATE_KEY)).toBeNull();
    expect(localStorage.getItem(OLD_PROGRAMS_KEY)).toBe(a);
    expect(localStorage.getItem(OLD_ASSIGN_KEY)).toBe("{bad");
  });

  it("keeps the old data untouched when the new state can't be written", () => {
    const a = JSON.stringify(oldPrograms());
    const b = JSON.stringify(oldAssignments());
    localStorage.setItem(OLD_PROGRAMS_KEY, a);
    localStorage.setItem(OLD_ASSIGN_KEY, b);
    const realSet = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      function (this: Storage, k: string, v: string) {
        if (k === STATE_KEY) throw new Error("quota");
        return realSet.call(this, k, v);
      },
    );
    reload();
    vi.restoreAllMocks();
    expect(localStorage.getItem(STATE_KEY)).toBeNull();
    expect(localStorage.getItem(OLD_PROGRAMS_KEY)).toBe(a);
    expect(localStorage.getItem(OLD_ASSIGN_KEY)).toBe(b);
    // Still served from the old data.
    expect(getProgramById(42)?.name).toBe("Migrated Program");
    expect(all()).toHaveLength(1);
  });
});

describe("Program-specific filtering", () => {
  it("only returns assignments for the requested Program ID", () => {
    const a = saveProgramRecord(newProgram("A"), "create");
    const b = saveProgramRecord(newProgram("B"), "create");
    if (!a.ok || !b.ok) throw new Error("save");
    addProgramStaffAssignment({
      programId: a.program.id,
      constituentId: STAFF_A,
      titleId: "therapist",
      startDate: "2025-01-01",
      endDate: "2025-02-01",
      ongoing: false,
    });
    expect(
      assignmentsForProgram(all(), a.program.id),
    ).toHaveLength(1);
    expect(
      assignmentsForProgram(all(), b.program.id),
    ).toHaveLength(0);
  });
});

describe("Medication access from staff assignments", () => {
  const NON_ADMIN = STAFF_B;
  const as = (constituentId: number | null) =>
    __setMedicationLogUserForTest({
      isSystemAdmin: false,
      constituentId,
    });
  afterEach(() => __setMedicationLogUserForTest(null));
  const ids = () => {
    const s = getMedicationLogAccess().scope;
    return s.kind === "all" ? "all" : s.programIds;
  };
  const assign = (
    programId: number,
    startDate: string,
    endDate: string,
    ongoing: boolean,
  ) =>
    addProgramStaffAssignment({
      programId,
      constituentId: NON_ADMIN,
      titleId: "therapist",
      startDate,
      endDate,
      ongoing,
    });
  const today = () => todayIso();
  const shift = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  it("System Admin keeps all Programs and every capability", () => {
    __setMedicationLogUserForTest(null);
    const a = getMedicationLogAccess();
    expect(a.scope).toEqual({ kind: "all" });
    expect(can(a, "deleteLog")).toBe(true);
    expect(can(a, "viewAudit")).toBe(true);
  });

  it("an assigned non-admin gets Program A only, with Standard Staff capabilities", () => {
    const [A, B] = getPrograms();
    assign(A.id, shift(-5), "", true);
    as(NON_ADMIN);
    expect(ids()).toEqual([A.id]);
    expect(
      isProgramAuthorized(getMedicationLogAccess().scope, B.id),
    ).toBe(false);
    const access = getMedicationLogAccess();
    expect(can(access, "viewLogs")).toBe(true);
    expect(can(access, "deleteLog")).toBe(false);
    expect(can(access, "viewAudit")).toBe(false);
  });

  it("no constituent id (not provided by the app) means no assignment-based access", () => {
    const [A] = getPrograms();
    assign(A.id, shift(-5), "", true);
    as(null);
    expect(ids()).toEqual([]);
  });

  it("a future assignment grants nothing until its start date", () => {
    const [A] = getPrograms();
    assign(A.id, shift(3), "", true);
    as(NON_ADMIN);
    expect(ids()).toEqual([]);
  });

  it("an ended assignment stops after its recorded end date", () => {
    const [A, B] = getPrograms();
    assign(A.id, shift(-20), shift(-1), false); // ended yesterday
    assign(B.id, shift(-20), today(), false); // ends today: still current today
    as(NON_ADMIN);
    expect(ids()).toEqual([B.id]);
  });

  it("corrections and reassignment are reflected on the next read", () => {
    const [A, B] = getPrograms();
    const r = assign(A.id, shift(-5), "", true);
    if (!r.ok) throw new Error("add");
    as(NON_ADMIN);
    expect(ids()).toEqual([A.id]);
    endProgramStaffAssignment(r.assignment.id, shift(-1));
    expect(ids()).toEqual([]);
    assign(B.id, shift(-1), "", true);
    expect(ids()).toEqual([B.id]);
    correctProgramStaffAssignment(
      all().find((x) => x.programId === B.id)!.id,
      {
        titleId: "therapist",
        startDate: shift(2),
        endDate: "",
        ongoing: true,
      },
    );
    expect(ids()).toEqual([]);
  });

  it("unreadable saved state grants no Programs", () => {
    const [A] = getPrograms();
    assign(A.id, shift(-5), "", true);
    as(NON_ADMIN);
    localStorage.setItem(STATE_KEY, "{bad");
    expect(ids()).toEqual([]);
  });
});

describe("US 20130 demo staff history seed", () => {
  const today = () => todayIso();
  const startClean = () => {
    __setDemoSeedEnabledForTest(true);
    localStorage.clear();
    reload();
  };
  const byProgram = (id: number) =>
    assignmentsForProgram(all(), id);

  it("clean install: Bernardin shows the nine rows, each other demo Program six completed ones", () => {
    startClean();
    const bern = byProgram(3);
    expect(bern).toHaveLength(9);
    expect(new Set(bern.map((a) => a.titleId)).size).toBe(6);
    for (const id of [1, 2, 4, 5, 6, 7, 8]) {
      const rows = byProgram(id);
      expect(rows).toHaveLength(6);
      expect(new Set(rows.map((a) => a.titleId)).size).toBe(6);
    }
    expect(
      all().every(
        (a) =>
          a.id.startsWith("US20130-demo-") &&
          a.ongoing === false,
      ),
    ).toBe(true);
    // Bernardin: replacement, one person two titles, separate periods.
    const lucas = bern.filter((a) => a.constituentId === 9206);
    expect(
      lucas.map((a) => assignmentDuration(a)).sort(),
    ).toEqual([
      "01/06/2025 to 03/31/2025",
      "09/01/2025 to 12/31/2025",
    ]);
    expect(
      bern
        .filter((a) => a.titleId === "program-manager")
        .map((a) => a.constituentId)
        .sort(),
    ).toEqual([9201, 9202]);
    expect(
      bern
        .filter((a) => a.constituentId === 9205)
        .map((a) => a.titleId)
        .sort(),
    ).toEqual(["day-coordinator", "ecr-coordinator"]);
  });

  it("demo staff are MHBG Staff constituents and every record falls in the Program's operating period", () => {
    startClean();
    for (const a of all()) {
      const c = CONSTITUENTS.find(
        (x) => x.id === a.constituentId,
      );
      expect(c).toMatchObject({
        type: "Individual",
        role: "MHBG Staff",
      });
      const p = getProgramById(a.programId)!;
      expect(a.startDate >= p.startDate).toBe(true);
      expect(a.endDate >= a.startDate).toBe(true);
      if (p.endDate) expect(a.endDate <= p.endDate).toBe(true);
      expect(a.endDate < today()).toBe(true);
    }
  });

  it("is historical only: no current staff and no medication access", () => {
    startClean();
    for (let id = 1; id <= 8; id++)
      expect(
        currentStaffForProgram(all(), id, today()),
      ).toEqual({});
    for (const staffId of [
      9201, 9202, 9203, 9204, 9205, 9206, 9207,
    ]) {
      __setMedicationLogUserForTest({
        isSystemAdmin: false,
        constituentId: staffId,
      });
      const s = getMedicationLogAccess().scope;
      expect(
        s.kind === "programs" ? s.programIds : "all",
      ).toEqual([]);
    }
    __setMedicationLogUserForTest(null);
  });

  it("adds to valid saved state once: keeps existing records, skips deleted Programs, no duplicates", () => {
    __setDemoSeedEnabledForTest(false);
    localStorage.clear();
    reload();
    const mine = addProgramStaffAssignment({
      programId: 3,
      constituentId: STAFF_A,
      titleId: "supervisor",
      startDate: "2024-01-01",
      endDate: "2024-02-01",
      ongoing: false,
    });
    if (!mine.ok) throw new Error("add");
    // Program 4 was deleted before the seed existed.
    editSaved((st) => {
      st.programs = st.programs.filter((p: any) => p.id !== 4);
    });
    __setDemoSeedEnabledForTest(true);
    reload();
    expect(byProgram(3)).toHaveLength(10); // 9 demo + the saved one
    expect(
      all().find((a) => a.id === mine.assignment.id),
    ).toBeDefined();
    expect(byProgram(4)).toHaveLength(0);
    expect(
      JSON.parse(localStorage.getItem(STATE_KEY)!).appliedSeeds,
    ).toContain("us20130-staff-history-demo-v1");
    const count = all().length;
    reload();
    reload();
    expect(all()).toHaveLength(count);
  });

  it("keeps later user corrections and doesn't recreate anything on reload", () => {
    startClean();
    const target = byProgram(3).find(
      (a) => a.id === "US20130-demo-3-3",
    )!;
    expect(
      correctProgramStaffAssignment(target.id, {
        titleId: "supervisor",
        startDate: target.startDate,
        endDate: "2025-11-30",
        ongoing: false,
      }).ok,
    ).toBe(true);
    const before = all().length;
    reload();
    expect(all()).toHaveLength(before);
    expect(all().find((a) => a.id === target.id)).toMatchObject(
      {
        titleId: "supervisor",
        endDate: "2025-11-30",
      },
    );
  });

  it("leaves unreadable saved state untouched", () => {
    __setDemoSeedEnabledForTest(true);
    localStorage.setItem(STATE_KEY, "{bad");
    reload();
    expect(getProgramDataStatus()).toBe("unreadable");
    expect(localStorage.getItem(STATE_KEY)).toBe("{bad");
  });
});
describe("New Program with draft assignments (one save)", () => {
  const draft = (over = {}) => ({
    kind: "add" as const,
    constituentId: STAFF_A,
    titleId: "program-manager" as const,
    startDate: "",
    endDate: "",
    notes: "",
    ongoing: false,
    ...over,
  });

  it("stores the Program and every draft row, linked by the new Program ID, with optional dates left blank", () => {
    const r = saveProgramWithStaffChanges({
      record: newProgram("Draft Program"),
      mode: "create",
      changes: [
        draft({ notes: "no dates" }),
        draft({
          constituentId: STAFF_B,
          titleId: "supervisor",
          startDate: "2026-02-01",
          endDate: "2026-06-30",
        }),
      ],
    });
    if (!r.ok) throw new Error(r.error);
    reload();
    const rows = assignmentsForProgram(all(), r.program.id);
    expect(rows).toHaveLength(2);
    expect(
      rows.find((x) => x.constituentId === STAFF_A),
    ).toMatchObject({
      startDate: "",
      endDate: "",
      notes: "no dates",
      ongoing: false,
    });
    expect(
      rows.find((x) => x.constituentId === STAFF_B),
    ).toMatchObject({
      startDate: "2026-02-01",
      endDate: "2026-06-30",
      ongoing: false,
    });
  });

  it("an invalid draft row saves nothing, so a retry cannot duplicate the Program", () => {
    const programsBefore = getPrograms().length;
    const assignmentsBefore = all().length;
    const bad = saveProgramWithStaffChanges({
      record: newProgram("Retry Program"),
      mode: "create",
      changes: [
        draft(),
        draft({
          constituentId: STAFF_B,
          startDate: "2026-06-30",
          endDate: "2026-02-01", // before Start Date
        }),
      ],
    });
    expect(bad.ok).toBe(false);
    expect(
      !bad.ok && Object.keys(bad.changeErrors ?? {}),
    ).toEqual(["1"]);
    reload();
    expect(getPrograms()).toHaveLength(programsBefore);
    expect(all()).toHaveLength(assignmentsBefore);
    const good = saveProgramWithStaffChanges({
      record: newProgram("Retry Program"),
      mode: "create",
      changes: [draft()],
    });
    expect(good.ok).toBe(true);
    expect(
      getPrograms().filter((p) => p.name === "Retry Program"),
    ).toHaveLength(1);
  });

  it("two identical draft rows are rejected as duplicates and nothing is written", () => {
    const programsBefore = getPrograms().length;
    const r = saveProgramWithStaffChanges({
      record: newProgram("Dup Program"),
      mode: "create",
      changes: [draft(), draft()],
    });
    expect(r.ok).toBe(false);
    expect(getPrograms()).toHaveLength(programsBefore);
  });

  it("role-field adds (no extras) keep their earlier behaviour: ongoing, no notes", () => {
    const p = createWithManager();
    expect(assignmentsForProgram(all(), p.id)[0]).toMatchObject({
      ongoing: true,
      endDate: "",
      notes: "",
    });
  });
});
