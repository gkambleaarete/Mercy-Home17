// @vitest-environment jsdom
// US 20127 Chunk 4: unrecognized titles stay visible (never hidden, never
// granting access), one edit gate at the shared write boundary, and a
// pending Program change never overrides a newer one.
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
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
  MSG_NOT_PERMITTED,
  PROGRAM_STAFF_TITLES,
  __reloadProgramStaffAssignmentsForTest,
  __setCanManageProgramStaffAssignmentsForTest,
  addProgramStaffAssignment,
  assignmentsForProgram,
  assignmentsForStaff,
  correctProgramStaffAssignment,
  currentStaffForProgram,
  endProgramStaffAssignment,
  getProgramStaffAssignments,
  programIdsForStaff,
  programStaffTitleDisplay,
  programStaffTitleLabel,
  saveProgramWithStaffChanges,
} from "./programStaffAssignmentStore";
import {
  buildAssignmentPatch,
  draftFromAssignment,
  titleChoices,
} from "./programStaffAssignmentForm";
import { deleteProgram } from "./programDeletion";

const STATE_KEY = "mh.programData.v2";
const A = 6;
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
function inject(rows: Record<string, unknown>[]) {
  const raw = saved();
  raw.assignments.push(...rows);
  localStorage.setItem(STATE_KEY, JSON.stringify(raw));
  reload();
}
const weird = (
  id: string,
  programId: number,
  who = A,
  over: Record<string, unknown> = {},
) => ({
  id,
  programId,
  constituentId: who,
  titleId: "mystery-role",
  startDate: "2020-01-01",
  endDate: "",
  ongoing: true,
  notes: "keep\nthis",
  createdAt: "c",
  updatedAt: "u",
  ...over,
});

beforeEach(() => {
  __setDemoSeedEnabledForTest(false);
  localStorage.clear();
  __setCanManageProgramStaffAssignmentsForTest(null);
  reload();
});
afterEach(() =>
  __setCanManageProgramStaffAssignmentsForTest(null),
);

describe("unrecognized titles", () => {
  it("stay visible for the Program and the staff member, with a fallback label and the stored value untouched", () => {
    const p = mkProgram("U");
    const q = mkProgram("U2");
    add(p);
    inject([weird("w1", p), weird("w2", q)]);
    expect(
      assignmentsForProgram(all(), p).map((a) => a.id),
    ).toContain("w1");
    expect(
      assignmentsForProgram(all(), p).map((a) => a.id),
    ).not.toContain("w2"); // other Program's
    expect(
      assignmentsForStaff(all(), A).map((a) => a.id),
    ).toEqual(expect.arrayContaining(["w1", "w2"]));
    expect(programStaffTitleDisplay("mystery-role")).toBe(
      "Unrecognized title (mystery-role)",
    );
    expect(all().find((a) => a.id === "w1")).toMatchObject({
      titleId: "mystery-role",
      notes: "keep\nthis",
      startDate: "2020-01-01",
      constituentId: A,
      programId: p,
    });
    // A Program holding ONLY such records still has assignments.
    expect(assignmentsForProgram(all(), q)).toHaveLength(1);
  });

  it("never grant access or current-staff status, and the strict recognizer is unchanged", () => {
    const p = mkProgram("Acc");
    inject([weird("w1", p)]);
    expect(
      programStaffTitleLabel("mystery-role"),
    ).toBeUndefined();
    expect(programIdsForStaff(all(), A, todayIso())).toEqual(
      [],
    );
    expect(
      currentStaffForProgram(all(), p, todayIso()),
    ).toEqual({});
  });

  it("keep exactly seven choices and stay invalid for a new write", () => {
    const p = mkProgram("New");
    expect(PROGRAM_STAFF_TITLES).toHaveLength(7);
    expect(
      titleChoices({ titleId: "mystery-role" }),
    ).toHaveLength(7);
    expect(
      addProgramStaffAssignment({
        programId: p,
        constituentId: A,
        titleId: "mystery-role" as any,
      }),
    ).toMatchObject({
      ok: false,
      fieldErrors: { titleId: expect.any(String) },
    });
  });

  it("need an explicit valid title to save, then correct the same record in place with duplicate checks", () => {
    const p = mkProgram("Fix");
    add(p, { titleId: "therapist", startDate: "2020-01-01" });
    inject([weird("w1", p, A, { startDate: "2020-01-01" })]);
    const rec = all().find((a) => a.id === "w1")!;
    const d = draftFromAssignment(rec);
    expect(d.titleId).toBe(""); // never silently preselected
    expect(
      buildAssignmentPatch(rec, {
        ...d,
        notes: "edit only notes",
      }),
    ).toMatchObject({
      ok: false,
      fieldErrors: { titleId: expect.any(String) },
    });
    // Store: other-field edit without a valid title is refused too.
    expect(
      correctProgramStaffAssignment("w1", { notes: "x" }),
    ).toMatchObject({ ok: false });
    expect(all().find((a) => a.id === "w1")!.notes).toBe(
      "keep\nthis",
    );
    // Duplicate during correction (same staff + Program + title + Start Date).
    expect(
      correctProgramStaffAssignment("w1", {
        titleId: "therapist",
      }),
    ).toMatchObject({ ok: false, duplicate: true });
    expect(all().find((a) => a.id === "w1")!.titleId).toBe(
      "mystery-role",
    );
    // Explicit correction to a valid, non-duplicate title updates in place.
    const patch = buildAssignmentPatch(rec, {
      ...d,
      titleId: "supervisor",
    });
    expect(patch).toMatchObject({
      ok: true,
      value: { titleId: "supervisor" },
    });
    const n = all().length;
    expect(
      correctProgramStaffAssignment("w1", {
        titleId: "supervisor",
      }).ok,
    ).toBe(true);
    expect(all()).toHaveLength(n);
    expect(all().find((a) => a.id === "w1")).toMatchObject({
      titleId: "supervisor",
      notes: "keep\nthis",
      createdAt: "c",
    });
  });

  it("an unrelated Program save leaves them byte-identical, and they block Program deletion", () => {
    const p = mkProgram("Del");
    inject([weird("w1", p)]);
    const before = JSON.stringify(
      all().find((a) => a.id === "w1"),
    );
    expect(
      saveProgramWithStaffChanges({
        record: {
          ...getPrograms().find((x) => x.id === p)!,
          description: "changed",
        },
        mode: "edit",
        changes: [],
      }).ok,
    ).toBe(true);
    expect(
      JSON.stringify(all().find((a) => a.id === "w1")),
    ).toBe(before);
    expect(deleteProgram(p, true)).toMatchObject({
      ok: false,
      reason: "has-related-records",
    });
  });
});

function add(
  programId: number,
  extra: Record<string, unknown> = {},
) {
  return addProgramStaffAssignment({
    programId,
    constituentId: A,
    titleId: "supervisor",
    ...extra,
  } as any);
}

describe("one edit gate at the shared write boundary", () => {
  it("refuses every write when editing isn't permitted, changing nothing; allows them when it is", () => {
    const p = mkProgram("Gate");
    const r = add(p, { startDate: "2026-01-01" });
    if (!r.ok) throw new Error("add");
    const before = localStorage.getItem(STATE_KEY);
    __setCanManageProgramStaffAssignmentsForTest(false);
    expect(add(p, { startDate: "2027-01-01" })).toMatchObject({
      ok: false,
      error: MSG_NOT_PERMITTED,
    });
    expect(
      correctProgramStaffAssignment(r.assignment.id, {
        notes: "x",
      }),
    ).toMatchObject({ ok: false, error: MSG_NOT_PERMITTED });
    expect(
      endProgramStaffAssignment(r.assignment.id, "2026-12-01"),
    ).toMatchObject({ ok: false, error: MSG_NOT_PERMITTED });
    expect(
      saveProgramWithStaffChanges({
        record: getPrograms().find((x) => x.id === p)!,
        mode: "edit",
        changes: [
          {
            kind: "end",
            assignmentId: r.assignment.id,
            endDate: "2026-12-01",
          },
        ],
      }),
    ).toMatchObject({ ok: false });
    expect(localStorage.getItem(STATE_KEY)).toBe(before);
    expect(all()).toHaveLength(1);
    // Reading stays available.
    expect(assignmentsForProgram(all(), p)).toHaveLength(1);
    __setCanManageProgramStaffAssignmentsForTest(true);
    expect(
      correctProgramStaffAssignment(r.assignment.id, {
        notes: "ok",
      }).ok,
    ).toBe(true);
  });
});

describe("a pending Program change never overrides newer work", () => {
  it("refuses an end planned against an assignment that was changed since", () => {
    const p = mkProgram("Pending");
    const r = addProgramStaffAssignment({
      programId: p,
      constituentId: A,
      titleId: "therapist",
      startDate: "2020-01-01",
      ongoing: true,
    });
    if (!r.ok) throw new Error("add");
    const planned = r.assignment;
    // Someone else edits the same assignment while the date dialog is open.
    expect(
      correctProgramStaffAssignment(r.assignment.id, {
        notes: "newer note",
        endDate: "2030-01-01",
      }).ok,
    ).toBe(true);
    const before = localStorage.getItem(STATE_KEY);
    const res = saveProgramWithStaffChanges({
      record: {
        ...getPrograms().find((x) => x.id === p)!,
        name: "Renamed",
      },
      mode: "edit",
      changes: [
        {
          kind: "end",
          assignmentId: r.assignment.id,
          endDate: "2026-05-05",
          expected: planned,
        },
      ],
    });
    expect(res).toMatchObject({
      ok: false,
      changeErrors: {
        0: expect.stringContaining("changed elsewhere"),
      },
    });
    expect(localStorage.getItem(STATE_KEY)).toBe(before);
    expect(all()[0]).toMatchObject({
      notes: "newer note",
      endDate: "2030-01-01",
    });
  });
});