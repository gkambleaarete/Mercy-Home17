// @vitest-environment jsdom
// US 20127 Chunk 1: seven titles, optional dates/Notes, the exact-duplicate
// rule at every write boundary, in-place edits, legacy combined-title
// records, atomic failure and retry.
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
  __setDemoSeedEnabledForTest,
  __reloadProgramsForTest,
  getPrograms,
  saveProgramRecord,
  todayIso,
  type ProgramRecord,
} from "./mockProgramsData";
import {
  MSG_DUPLICATE,
  PROGRAM_STAFF_LEGACY_TITLES,
  PROGRAM_STAFF_TITLES,
  __reloadProgramStaffAssignmentsForTest,
  addProgramStaffAssignment,
  assignmentsForProgram,
  assignmentsForStaff,
  correctProgramStaffAssignment,
  currentStaffForProgram,
  endProgramStaffAssignment,
  getProgramStaffAssignments,
  programIdsForStaff,
  programStaffTitleLabel,
  saveProgramWithStaffChanges,
} from "./programStaffAssignmentStore";
import {
  MULTI_TITLE,
  PROGRAM_FORM_TITLES,
  currentLegacyCombinedHolders,
  effectiveStaffSelection,
  initialStaffSelection,
  planStaffChanges,
  staffEditConflicts,
  type StaffEdits,
} from "./programStaffSelection";
import { eligibleStaffOptions } from "./programStaffAssignmentForm";
import { US20130_DEMO_ASSIGNMENTS } from "./programStaffDemoSeed";
import { deleteProgram } from "./programDeletion";

const STATE_KEY = "mh.programData.v2";
const A = 6; // seeded MHBG Staff
const B = 987001;

const prog = (name: string): ProgramRecord => ({
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
const mkProgram = (name: string) => {
  const r = saveProgramRecord(prog(name), "create");
  if (!r.ok) throw new Error("program");
  return r.program.id;
};
const all = () => {
  const r = getProgramStaffAssignments();
  if (r.status !== "ok") throw new Error("unreadable");
  return r.assignments;
};
const saved = () =>
  JSON.parse(localStorage.getItem(STATE_KEY)!);
const reload = () => {
  __reloadProgramsForTest();
  __reloadProgramStaffAssignmentsForTest();
};
const add = (
  programId: number,
  extra: Record<string, unknown> = {},
) =>
  addProgramStaffAssignment({
    programId,
    constituentId: A,
    titleId: "supervisor",
    ...extra,
  } as any);

beforeEach(() => {
  __setDemoSeedEnabledForTest(false);
  localStorage.clear();
  if (!CONSTITUENTS.some((c) => c.id === B))
    CONSTITUENTS.push({
      id: B,
      name: "Second Staffer",
      type: "Individual",
      role: "MHBG Staff",
      status: "Active",
      program: "—",
      lastUpdated: "2026-01-01",
    });
  reload();
});
afterEach(() => vi.restoreAllMocks());

describe("titles", () => {
  it("offers exactly the seven titles, with Youth Care Worker and Transition Coach separate", () => {
    expect(PROGRAM_STAFF_TITLES.map((t) => t.label)).toEqual([
      "Program Manager",
      "Therapist",
      "Supervisor",
      "ECR Coordinator",
      "Day Coordinator",
      "Youth Care Worker",
      "Transition Coach",
    ]);
    const p = mkProgram("T");
    for (const t of PROGRAM_STAFF_TITLES)
      expect(
        add(p, { titleId: t.id, startDate: "2026-01-01" }).ok,
      ).toBe(true);
    expect(all()).toHaveLength(7);
  });

  it("refuses the legacy combined title and unknown titles for a NEW assignment", () => {
    const p = mkProgram("T");
    expect(
      add(p, { titleId: "youth-care-worker" }),
    ).toMatchObject({
      ok: false,
      fieldErrors: { titleId: expect.any(String) },
    });
    expect(add(p, { titleId: "bogus" })).toMatchObject({
      ok: false,
    });
    expect(all()).toHaveLength(0);
  });

  it("keeps saved combined-title records readable, with id, title and label unchanged", () => {
    const p = mkProgram("T");
    add(p, { titleId: "supervisor", startDate: "2025-01-01" });
    const raw = saved();
    raw.assignments.push({
      id: "old-1",
      programId: p,
      constituentId: A,
      titleId: "youth-care-worker",
      startDate: "2025-01-01",
      endDate: "2025-06-01",
      ongoing: false,
      createdAt: "c",
      updatedAt: "u",
    });
    localStorage.setItem(STATE_KEY, JSON.stringify(raw));
    reload();
    const old = all().find((a) => a.id === "old-1")!;
    expect(old).toMatchObject({
      titleId: "youth-care-worker",
      notes: "",
    });
    expect(programStaffTitleLabel("youth-care-worker")).toBe(
      PROGRAM_STAFF_LEGACY_TITLES[0].label,
    );
    expect(
      assignmentsForProgram(all(), p).map((a) => a.id),
    ).toContain("old-1");
    expect(
      assignmentsForStaff(all(), A).map((a) => a.id),
    ).toContain("old-1");
    // Editing other fields keeps the legacy title (never guessed or converted); Notes saved.
    expect(
      correctProgramStaffAssignment("old-1", {
        notes: "line1\nline2",
      }),
    ).toMatchObject({ ok: true });
    expect(all().find((a) => a.id === "old-1")).toMatchObject({
      titleId: "youth-care-worker",
      notes: "line1\nline2",
      createdAt: "c",
    });
    // It may be moved to a new title explicitly, but not to another unknown one.
    expect(
      correctProgramStaffAssignment("old-1", {
        titleId: "bogus",
      }),
    ).toMatchObject({ ok: false });
    expect(
      correctProgramStaffAssignment("old-1", {
        titleId: "transition-coach",
      }).ok,
    ).toBe(true);
  });

  it("demo seed records (combined title) keep ids and are unchanged", () => {
    __setDemoSeedEnabledForTest(true);
    localStorage.clear();
    reload();
    const ids = new Set(all().map((a) => a.id));
    for (const d of US20130_DEMO_ASSIGNMENTS)
      expect(ids.has(d.id)).toBe(true);
    expect(
      all().find((a) => a.id === "US20130-demo-3-7"),
    ).toMatchObject({
      titleId: "youth-care-worker",
      startDate: "2025-01-06",
    });
  });
});

describe("dates and Notes", () => {
  it("accepts no dates, either date alone, and both; rejects invalid and reversed", () => {
    const p = mkProgram("D");
    expect(add(p, { titleId: "therapist" }).ok).toBe(true);
    expect(
      add(p, { titleId: "therapist", startDate: "2026-02-01" })
        .ok,
    ).toBe(true);
    expect(
      add(p, {
        titleId: "day-coordinator",
        endDate: "2026-03-01",
      }).ok,
    ).toBe(true); // end only
    expect(
      add(p, {
        titleId: "therapist",
        startDate: "2026-01-01",
        endDate: "2026-01-01",
      }).ok,
    ).toBe(true);
    expect(
      add(p, { titleId: "therapist", startDate: "2026-02-30" }),
    ).toMatchObject({
      ok: false,
      fieldErrors: { startDate: expect.any(String) },
    });
    expect(
      add(p, { titleId: "therapist", endDate: "nope" }),
    ).toMatchObject({
      ok: false,
      fieldErrors: { endDate: expect.any(String) },
    });
    expect(
      add(p, {
        titleId: "therapist",
        startDate: "2026-05-01",
        endDate: "2026-04-01",
      }),
    ).toMatchObject({
      ok: false,
      fieldErrors: { endDate: expect.any(String) },
    });
    expect(all()).toHaveLength(4);
    const blank = all()[0];
    expect(blank).toMatchObject({
      startDate: "",
      endDate: "",
      ongoing: false,
      notes: "",
    });
  });

  it("missing dates never make someone current staff or grant Program access", () => {
    const p = mkProgram("C");
    add(p, { titleId: "supervisor" });
    add(p, { titleId: "therapist", startDate: "2020-01-01" }); // start only, not ongoing
    add(p, {
      titleId: "day-coordinator",
      endDate: "2099-01-01",
    }); // end only
    expect(
      currentStaffForProgram(all(), p, todayIso()),
    ).toEqual({});
    expect(programIdsForStaff(all(), A, todayIso())).toEqual(
      [],
    );
  });

  it("Notes keep line breaks across reload, partial edits keep Notes, and old records load empty", () => {
    const p = mkProgram("N");
    const r = add(p, { notes: "first\n\nthird  line" });
    if (!r.ok) throw new Error("add");
    reload();
    expect(all()[0].notes).toBe("first\n\nthird  line");
    expect(
      correctProgramStaffAssignment(r.assignment.id, {
        startDate: "2026-01-01",
      }).ok,
    ).toBe(true);
    expect(all()[0].notes).toBe("first\n\nthird  line"); // omitted Notes not cleared
    expect(
      correctProgramStaffAssignment(r.assignment.id, {
        notes: "",
      }).ok,
    ).toBe(true);
    expect(all()[0].notes).toBe("");
    const raw = saved();
    delete raw.assignments[0].notes;
    localStorage.setItem(STATE_KEY, JSON.stringify(raw));
    reload();
    expect(all()[0]).toMatchObject({
      notes: "",
      titleId: "supervisor",
    });
  });
});

describe("exact-duplicate rule", () => {
  it("refuses an exact duplicate on Add (blank Start Dates equal), allows near-misses", () => {
    const p = mkProgram("X");
    const q = mkProgram("Y");
    expect(
      add(p, {
        startDate: "2026-01-01",
        endDate: "2026-02-01",
        notes: "a",
      }).ok,
    ).toBe(true);
    expect(
      add(p, {
        startDate: "2026-01-01",
        endDate: "2026-09-09",
        notes: "different",
      }),
    ).toMatchObject({
      ok: false,
      duplicate: true,
      error: MSG_DUPLICATE,
    });
    expect(add(p).ok).toBe(true); // blank start
    expect(add(p)).toMatchObject({
      ok: false,
      duplicate: true,
    });
    expect(add(p, { startDate: "2026-03-01" }).ok).toBe(true); // different Start Date
    expect(
      add(p, { titleId: "therapist", startDate: "2026-01-01" })
        .ok,
    ).toBe(true); // different title
    expect(add(q, { startDate: "2026-01-01" }).ok).toBe(true); // different Program
    expect(
      addProgramStaffAssignment({
        programId: p,
        constituentId: B,
        titleId: "supervisor",
        startDate: "2026-01-01",
      }).ok,
    ).toBe(true); // different staff
    expect(all()).toHaveLength(6);
  });

  it("checks Edit excluding the record itself", () => {
    const p = mkProgram("E");
    const a = add(p, { startDate: "2026-01-01" });
    const b = add(p, { startDate: "2026-02-01" });
    if (!a.ok || !b.ok) throw new Error("add");
    expect(
      correctProgramStaffAssignment(a.assignment.id, {
        startDate: "2026-01-01",
        endDate: "2026-12-01",
        notes: "n",
      }).ok,
    ).toBe(true); // unchanged tuple
    expect(
      correctProgramStaffAssignment(b.assignment.id, {
        startDate: "2026-01-01",
      }),
    ).toMatchObject({ ok: false, duplicate: true });
    expect(
      all().find((x) => x.id === b.assignment.id)!.startDate,
    ).toBe("2026-02-01");
    // Moving to a Program that already has the same tuple is a duplicate too.
    const q = mkProgram("E2");
    add(q, { startDate: "2026-02-01" });
    expect(
      correctProgramStaffAssignment(b.assignment.id, {
        programId: q,
      }),
    ).toMatchObject({ ok: false, duplicate: true });
  });

  it("compound Program saves refuse duplicates against saved and staged additions, changing nothing", () => {
    const p = mkProgram("Z");
    add(p, {
      titleId: "program-manager",
      startDate: "2026-01-01",
    });
    const before = localStorage.getItem(STATE_KEY);
    const dupSaved = saveProgramWithStaffChanges({
      record: {
        ...getPrograms().find((x) => x.id === p)!,
        name: "Renamed",
      },
      mode: "edit",
      changes: [
        {
          kind: "add",
          constituentId: A,
          titleId: "program-manager",
          startDate: "2026-01-01",
        },
      ],
    });
    expect(dupSaved).toMatchObject({
      ok: false,
      changeErrors: { 0: MSG_DUPLICATE },
    });
    const dupStaged = saveProgramWithStaffChanges({
      record: prog("New Compound"),
      mode: "create",
      changes: [
        {
          kind: "add",
          constituentId: A,
          titleId: "therapist",
          startDate: "2026-01-01",
        },
        {
          kind: "add",
          constituentId: A,
          titleId: "therapist",
          startDate: "2026-01-01",
        },
      ],
    });
    expect(dupStaged).toMatchObject({
      ok: false,
      changeErrors: { 1: MSG_DUPLICATE },
    });
    expect(localStorage.getItem(STATE_KEY)).toBe(before);
    expect(
      getPrograms().some(
        (x) =>
          x.name === "Renamed" || x.name === "New Compound",
      ),
    ).toBe(false);
    // A blank Start Date is allowed in a compound save.
    expect(
      saveProgramWithStaffChanges({
        record: prog("Blank Start"),
        mode: "create",
        changes: [
          {
            kind: "add",
            constituentId: A,
            titleId: "transition-coach",
          },
        ],
      }).ok,
    ).toBe(true);
  });
});

describe("in-place edits", () => {
  it("changes Program, title, dates and Notes on the same record; staff identity and createdAt are fixed", () => {
    const p = mkProgram("From");
    const q = mkProgram("To");
    const other = add(p, {
      titleId: "therapist",
      startDate: "2026-04-01",
    });
    const r = add(p, {
      titleId: "supervisor",
      startDate: "2026-01-01",
      notes: "keep",
    });
    if (!r.ok || !other.ok) throw new Error("add");
    const snapshot = JSON.stringify(
      all().find((x) => x.id === other.assignment.id),
    );
    const res = correctProgramStaffAssignment(r.assignment.id, {
      programId: q,
      titleId: "transition-coach",
      startDate: "2026-02-01",
      endDate: "2026-08-01",
    });
    expect(res).toMatchObject({ ok: true });
    const moved = all().find((x) => x.id === r.assignment.id)!;
    expect(moved).toMatchObject({
      programId: q,
      titleId: "transition-coach",
      constituentId: A,
      createdAt: r.assignment.createdAt,
      notes: "keep",
    });
    expect(all()).toHaveLength(2); // no second record
    expect(
      assignmentsForProgram(all(), p).map((x) => x.id),
    ).toEqual([other.assignment.id]);
    expect(
      assignmentsForProgram(all(), q).map((x) => x.id),
    ).toEqual([r.assignment.id]);
    expect(
      JSON.stringify(
        all().find((x) => x.id === other.assignment.id),
      ),
    ).toBe(snapshot);
    expect(moved.updatedAt >= r.assignment.updatedAt).toBe(
      true,
    );
    // Identity can't be patched.
    correctProgramStaffAssignment(r.assignment.id, {
      constituentId: B,
      id: "hijack",
    } as any);
    expect(
      all().find((x) => x.id === r.assignment.id)!
        .constituentId,
    ).toBe(A);
    expect(
      correctProgramStaffAssignment(r.assignment.id, {
        programId: 99999,
      }),
    ).toMatchObject({
      ok: false,
      fieldErrors: { programId: expect.any(String) },
    });
  });

  it("merges onto the latest saved copy (another tab's change survives)", () => {
    const p = mkProgram("M");
    const r = add(p, { startDate: "2026-01-01" });
    if (!r.ok) throw new Error("add");
    const raw = saved();
    raw.assignments[0].notes = "from other tab";
    localStorage.setItem(STATE_KEY, JSON.stringify(raw));
    expect(
      correctProgramStaffAssignment(r.assignment.id, {
        endDate: "2026-06-01",
      }).ok,
    ).toBe(true);
    expect(all()[0]).toMatchObject({
      notes: "from other tab",
      endDate: "2026-06-01",
      ongoing: false,
    });
    expect(
      endProgramStaffAssignment(r.assignment.id, "2026-07-01")
        .ok,
    ).toBe(true);
    expect(all()[0].notes).toBe("from other tab");
  });
});

describe("atomic persistence", () => {
  it("a failed write leaves memory and storage unchanged and a retry adds exactly one record", () => {
    const p = mkProgram("F");
    const before = localStorage.getItem(STATE_KEY);
    const real = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
    let r;
    try {
      r = add(p, { startDate: "2026-01-01", notes: "x" });
    } finally {
      Storage.prototype.setItem = real;
    }
    expect(r).toMatchObject({ ok: false });
    expect(all()).toHaveLength(0);
    expect(localStorage.getItem(STATE_KEY)).toBe(before);
    expect(
      add(p, { startDate: "2026-01-01", notes: "x" }).ok,
    ).toBe(true);
    expect(
      add(p, { startDate: "2026-01-01", notes: "x" }),
    ).toMatchObject({ ok: false, duplicate: true });
    expect(all()).toHaveLength(1);
  });

  it("unreadable storage is reported and never overwritten", () => {
    localStorage.setItem(STATE_KEY, "{bad");
    reload();
    expect(add(1)).toMatchObject({ ok: false });
    expect(localStorage.getItem(STATE_KEY)).toBe("{bad");
  });
});

describe("existing Program form helpers and protections", () => {
  it("leave the five lookup fields alone and don't invent one for Transition Coach", () => {
    const p = mkProgram("L");
    add(p, {
      titleId: "transition-coach",
      startDate: "2020-01-01",
      ongoing: true,
    });
    add(p, {
      titleId: "youth-care-worker-only",
      startDate: "2020-01-01",
      ongoing: true,
    });
    const program = getPrograms().find((x) => x.id === p)!;
    const before = JSON.stringify(program);
    expect(PROGRAM_FORM_TITLES.map((t) => t.id)).not.toContain(
      "transition-coach",
    );
    const init = initialStaffSelection(
      program,
      all(),
      todayIso(),
    );
    expect(init.selection[MULTI_TITLE]).toEqual([
      { kind: "id", id: A },
    ]);
    expect(init.selection["transition-coach"]).toEqual([]);
    // Saving the form's selection unchanged plans no change and doesn't touch the Transition Coach assignment.
    expect(
      planStaffChanges(
        p,
        init.selection,
        init.locked,
        all(),
        todayIso(),
      ),
    ).toEqual([]);
    expect(
      JSON.stringify(getPrograms().find((x) => x.id === p)),
    ).toBe(before);
    // Removing the Youth Care Worker ends only that assignment.
    const sel = { ...init.selection, [MULTI_TITLE]: [] };
    const plan = planStaffChanges(
      p,
      sel,
      init.locked,
      all(),
      todayIso(),
    );
    expect(plan).toHaveLength(1);
    expect(plan[0]).toMatchObject({
      kind: "end",
      assignment: { titleId: "youth-care-worker-only" },
    });
  });

  it("current-staff access still counts any recorded title (including combined legacy) by Constituent ID", () => {
    const p = mkProgram("Acc");
    add(p, {
      titleId: "transition-coach",
      startDate: "2020-01-01",
      ongoing: true,
    });
    expect(programIdsForStaff(all(), A, todayIso())).toEqual([
      p,
    ]);
    const raw = saved();
    raw.assignments.push({
      id: "leg",
      programId: p,
      constituentId: B,
      titleId: "youth-care-worker",
      startDate: "2020-01-01",
      endDate: "",
      ongoing: true,
      createdAt: "c",
      updatedAt: "u",
    });
    localStorage.setItem(STATE_KEY, JSON.stringify(raw));
    reload();
    expect(programIdsForStaff(all(), B, todayIso())).toEqual([
      p,
    ]);
  });

  it("Program deletion stays blocked by any assignment, including undated ones", () => {
    const p = mkProgram("Del");
    add(p, { titleId: "therapist" });
    expect(deleteProgram(p, true)).toMatchObject({
      ok: false,
      reason: "has-related-records",
    });
    expect(all()).toHaveLength(1);
  });
});

describe("legacy combined-title visibility in the Program form (Chunk 1A)", () => {
  const legacy = (
    id: string,
    programId: number,
    who: number,
    start: string,
    end: string,
    ongoing: boolean,
  ) => ({
    id,
    programId,
    constituentId: who,
    titleId: "youth-care-worker",
    startDate: start,
    endDate: end,
    ongoing,
    notes: "N\note",
    createdAt: "c",
    updatedAt: "u",
  });
  const seedLegacy = (rows: ReturnType<typeof legacy>[]) => {
    const raw = saved();
    raw.assignments.push(...rows);
    localStorage.setItem(STATE_KEY, JSON.stringify(raw));
    reload();
  };
  const today = () => todayIso();

  it("lists only CURRENT legacy holders; ended and future ones stay in Staff History", () => {
    const p = mkProgram("LV");
    seedLegacy([
      legacy("cur", p, A, "2020-01-01", "", true),
      legacy("ended", p, B, "2020-01-01", "2020-12-31", false),
      legacy("future", p, B, "2999-01-01", "", true),
    ]);
    expect(
      currentLegacyCombinedHolders(p, all(), today()),
    ).toEqual([A]);
    expect(
      assignmentsForProgram(all(), p)
        .map((a) => a.id)
        .sort(),
    ).toEqual(["cur", "ended", "future"]);
    expect(
      currentLegacyCombinedHolders(null, all(), today()),
    ).toEqual([]);
    expect(
      currentLegacyCombinedHolders(p + 1000, all(), today()),
    ).toEqual([]);
  });

  it("shows legacy and new-title holders together under their own labels, never mixed", () => {
    const p = mkProgram("Both");
    seedLegacy([legacy("cur", p, A, "2020-01-01", "", true)]);
    add(p, {
      titleId: "youth-care-worker-only",
      startDate: "2020-01-01",
      ongoing: true,
      ...{},
    });
    // (add() uses constituent A; the new-title holder is added for B instead)
    addProgramStaffAssignment({
      programId: p,
      constituentId: B,
      titleId: "youth-care-worker-only",
      startDate: "2021-01-01",
      ongoing: true,
    });
    const program = getPrograms().find((x) => x.id === p)!;
    const init = initialStaffSelection(program, all(), today());
    expect(
      init.selection[MULTI_TITLE].map((e: any) => e.id).sort(),
    ).toEqual([A, B].sort());
    expect(
      currentLegacyCombinedHolders(p, all(), today()),
    ).toEqual([A]);
    expect(init.selection["youth-care-worker"]).toEqual([]); // not shown as an editable new-title selection
  });

  it("a Program with only a legacy holder still plans no change and keeps the legacy record exactly", () => {
    const p = mkProgram("Only");
    seedLegacy([legacy("cur", p, A, "2020-01-01", "", true)]);
    const program = getPrograms().find((x) => x.id === p)!;
    const init = initialStaffSelection(program, all(), today());
    expect(
      planStaffChanges(
        p,
        init.selection,
        init.locked,
        all(),
        today(),
      ),
    ).toEqual([]);
    const before = JSON.stringify(
      all().find((a) => a.id === "cur"),
    );
    // Unrelated Program change, no staff changes.
    expect(
      saveProgramWithStaffChanges({
        record: { ...program, name: "Only (renamed)" },
        mode: "edit",
        changes: [],
      }).ok,
    ).toBe(true);
    expect(
      JSON.stringify(all().find((a) => a.id === "cur")),
    ).toBe(before);
    expect(all()).toHaveLength(1);
    expect(
      currentLegacyCombinedHolders(p, all(), today()),
    ).toEqual([A]);
  });

  it("new-title edits leave legacy assignments untouched; adding a new title for the same person is allowed", () => {
    const p = mkProgram("Edit");
    seedLegacy([legacy("cur", p, A, "2020-01-01", "", true)]);
    const before = JSON.stringify(
      all().find((a) => a.id === "cur"),
    );
    const r = addProgramStaffAssignment({
      programId: p,
      constituentId: A,
      titleId: "youth-care-worker-only",
      startDate: "2022-01-01",
      ongoing: true,
    });
    expect(r.ok).toBe(true); // explicit, legitimate second title
    if (!r.ok) throw new Error("add");
    expect(
      correctProgramStaffAssignment(r.assignment.id, {
        notes: "new",
      }).ok,
    ).toBe(true);
    expect(
      endProgramStaffAssignment(r.assignment.id, "2026-01-01")
        .ok,
    ).toBe(true);
    expect(
      JSON.stringify(all().find((a) => a.id === "cur")),
    ).toBe(before);
    // Removing the new-title holder in the form plans an end for that record only.
    const program = getPrograms().find((x) => x.id === p)!;
    const again = addProgramStaffAssignment({
      programId: p,
      constituentId: B,
      titleId: "youth-care-worker-only",
      startDate: "2022-02-01",
      ongoing: true,
    });
    expect(again.ok).toBe(true);
    const init = initialStaffSelection(program, all(), today());
    const plan = planStaffChanges(
      p,
      { ...init.selection, [MULTI_TITLE]: [] },
      init.locked,
      all(),
      today(),
    );
    expect(
      plan.every(
        (c) =>
          c.kind === "end" &&
          c.assignment.titleId === "youth-care-worker-only",
      ),
    ).toBe(true);
  });

  it("still offers seven titles and recognises legacy holders for access", () => {
    const p = mkProgram("Acc2");
    seedLegacy([legacy("cur", p, B, "2020-01-01", "", true)]);
    expect(PROGRAM_STAFF_TITLES).toHaveLength(7);
    expect(programIdsForStaff(all(), B, today())).toEqual([p]);
    expect(
      currentStaffForProgram(all(), p, today())[
        "youth-care-worker"
      ],
    ).toHaveLength(1);
  });
});

describe("Program form vs independently saved assignments (Chunk 3 stale-form fix)", () => {
  const today = () => todayIso();
  const open = (p: number) =>
    getPrograms().find((x) => x.id === p)!;

  it("an untouched selector follows the latest data and a later unrelated save never ends a separately saved assignment", () => {
    const p = mkProgram("Stale");
    // The form opens: no Therapist.
    const opened = initialStaffSelection(
      open(p),
      all(),
      today(),
    );
    expect(opened.selection["therapist"]).toEqual([]);
    // A current Therapist is saved independently (Profile / Program dialog).
    const r = addProgramStaffAssignment({
      programId: p,
      constituentId: A,
      titleId: "therapist",
      startDate: "2020-01-01",
      ongoing: true,
      notes: "n\nn",
    });
    if (!r.ok) throw new Error("add");
    const before = JSON.stringify(
      all().find((x) => x.id === r.assignment.id),
    );
    // Untouched: the form now shows the Therapist and plans nothing.
    const live = initialStaffSelection(open(p), all(), today());
    const shown = effectiveStaffSelection(live, {});
    expect(shown.selection["therapist"]).toEqual([
      { kind: "id", id: A },
    ]);
    expect(
      planStaffChanges(
        p,
        shown.selection,
        shown.locked,
        all(),
        today(),
        [],
      ),
    ).toEqual([]);
    // The old stale snapshot WOULD have planned an end — proving the scenario.
    expect(
      planStaffChanges(
        p,
        opened.selection,
        opened.locked,
        all(),
        today(),
      ).some((c) => c.kind === "end"),
    ).toBe(true);
    // Unrelated Program save: the assignment is byte-identical, count unchanged.
    expect(
      saveProgramWithStaffChanges({
        record: { ...open(p), description: "unrelated edit" },
        mode: "edit",
        changes: [],
      }).ok,
    ).toBe(true);
    expect(
      JSON.stringify(
        all().find((x) => x.id === r.assignment.id),
      ),
    ).toBe(before);
    expect(all()).toHaveLength(1);
    expect(
      currentStaffForProgram(all(), p, today())["therapist"],
    ).toHaveLength(1);
  });

  it("a genuine edit of one selector plans only that title and leaves other assignments alone", () => {
    const p = mkProgram("Genuine");
    const th = addProgramStaffAssignment({
      programId: p,
      constituentId: A,
      titleId: "therapist",
      startDate: "2020-01-01",
      ongoing: true,
    });
    const su = addProgramStaffAssignment({
      programId: p,
      constituentId: B,
      titleId: "supervisor",
      startDate: "2020-01-01",
      ongoing: true,
    });
    if (!th.ok || !su.ok) throw new Error("add");
    const live = initialStaffSelection(open(p), all(), today());
    const edits: StaffEdits = {
      therapist: {
        baseline: live.selection["therapist"],
        entries: [],
      },
    };
    const shown = effectiveStaffSelection(live, edits);
    const plan = planStaffChanges(
      p,
      shown.selection,
      shown.locked,
      all(),
      today(),
      ["therapist"],
    );
    expect(plan).toHaveLength(1);
    expect(plan[0]).toMatchObject({
      kind: "end",
      assignment: { id: th.assignment.id },
    });
    expect(
      staffEditConflicts(open(p), edits, all(), today()),
    ).toEqual([]);
    // Replacing with someone else: end + add for that title only.
    const swap: StaffEdits = {
      therapist: {
        baseline: live.selection["therapist"],
        entries: [{ kind: "id", id: B }],
      },
    };
    const sh2 = effectiveStaffSelection(live, swap);
    const plan2 = planStaffChanges(
      p,
      sh2.selection,
      sh2.locked,
      all(),
      today(),
      ["therapist"],
    );
    expect(plan2.map((c) => c.kind).sort()).toEqual([
      "add",
      "end",
    ]);
    expect(
      plan2.every(
        (c) =>
          (c.kind === "end"
            ? c.assignment.titleId
            : c.titleId) === "therapist",
      ),
    ).toBe(true);
  });

  it("an edited title whose holders changed elsewhere is reported as a conflict, not silently ended", () => {
    const p = mkProgram("Conflict");
    const live0 = initialStaffSelection(
      open(p),
      all(),
      today(),
    );
    // The user starts choosing a Therapist (baseline: none)…
    const edits: StaffEdits = {
      therapist: {
        baseline: live0.selection["therapist"],
        entries: [{ kind: "id", id: B }],
      },
    };
    expect(
      staffEditConflicts(open(p), edits, all(), today()),
    ).toEqual([]);
    // …while someone else saves a different current Therapist.
    addProgramStaffAssignment({
      programId: p,
      constituentId: A,
      titleId: "therapist",
      startDate: "2020-01-01",
      ongoing: true,
    });
    expect(
      staffEditConflicts(open(p), edits, all(), today()),
    ).toEqual(["therapist"]);
  });

  it("Program-side Add offers only eligible Active MHBG Staff and enforces the same duplicate rule", () => {
    const opts = eligibleStaffOptions();
    expect(opts.some((o) => o.id === A)).toBe(true);
    expect(
      opts.every(
        (o) =>
          CONSTITUENTS.find((c) => c.id === o.id)!.role ===
          "MHBG Staff",
      ),
    ).toBe(true);
    const p = mkProgram("PS");
    expect(
      addProgramStaffAssignment({
        programId: p,
        constituentId: A,
        titleId: "transition-coach",
        startDate: "2026-01-01",
      }).ok,
    ).toBe(true);
    expect(
      addProgramStaffAssignment({
        programId: p,
        constituentId: A,
        titleId: "transition-coach",
        startDate: "2026-01-01",
      }),
    ).toMatchObject({ duplicate: true });
    expect(
      addProgramStaffAssignment({
        programId: p,
        constituentId: A,
        titleId: "transition-coach",
        startDate: "2026-06-01",
      }).ok,
    ).toBe(true);
    expect(all()).toHaveLength(2);
  });
});