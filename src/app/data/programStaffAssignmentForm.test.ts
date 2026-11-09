import { describe, expect, it } from "vitest";
import {
  buildAssignmentPatch,
  buildNewAssignment,
  draftFromAssignment,
  emptyAssignmentDraft,
  titleChoices,
} from "./programStaffAssignmentForm";
import type { ProgramStaffAssignment } from "./programStaffAssignmentStore";

const saved = (over: Partial<ProgramStaffAssignment> = {}): ProgramStaffAssignment => ({
  id: "a1", programId: 3, constituentId: 6, titleId: "supervisor", startDate: "2025-01-02", endDate: "", ongoing: true, notes: "l1\nl2", createdAt: "c", updatedAt: "u", ...over,
});

describe("assignment form logic", () => {
  it("offers exactly the seven titles, plus the combined title only when editing a legacy record", () => {
    expect(titleChoices().map((t) => t.label)).toEqual(["Program Manager", "Therapist", "Supervisor", "ECR Coordinator", "Day Coordinator", "Youth Care Worker", "Transition Coach"]);
    expect(titleChoices(saved())).toHaveLength(7);
    const legacy = titleChoices(saved({ titleId: "youth-care-worker" }));
    expect(legacy).toHaveLength(8);
    expect(legacy[0]).toEqual({ id: "youth-care-worker", label: "Youth Care Worker / Transition Coach" });
  });

  it("Add: only Title and Program are required; dates optional; typed dates validated, never dropped", () => {
    expect(buildNewAssignment(6, emptyAssignmentDraft())).toMatchObject({ ok: false, fieldErrors: { programId: expect.any(String), titleId: expect.any(String) } });
    const base = { ...emptyAssignmentDraft(), programId: "3", titleId: "therapist" };
    expect(buildNewAssignment(6, base)).toMatchObject({ ok: true, value: { programId: 3, constituentId: 6, titleId: "therapist", startDate: "", endDate: "", notes: "" } });
    expect(buildNewAssignment(6, { ...base, startDate: "01/05/2026" })).toMatchObject({ ok: true, value: { startDate: "2026-01-05", endDate: "" } });
    expect(buildNewAssignment(6, { ...base, endDate: "02/30/2026" })).toMatchObject({ ok: false, fieldErrors: { endDate: expect.any(String) } });
    expect(buildNewAssignment(6, { ...base, startDate: "01/0" })).toMatchObject({ ok: false, fieldErrors: { startDate: expect.any(String) } });
    expect(buildNewAssignment(6, { ...base, notes: "a\n\nb  " })).toMatchObject({ ok: true, value: { notes: "a\n\nb  " } });
  });

  it("Edit: preloads every field and submits only what changed", () => {
    const a = saved({ endDate: "2026-03-01", ongoing: false });
    expect(draftFromAssignment(a)).toEqual({ programId: "3", titleId: "supervisor", startDate: "01/02/2025", endDate: "03/01/2026", notes: "l1\nl2" });
    expect(buildAssignmentPatch(a, draftFromAssignment(a))).toEqual({ ok: true, value: {} });
    const d = { ...draftFromAssignment(a), programId: "5", notes: "new" };
    expect(buildAssignmentPatch(a, d)).toEqual({ ok: true, value: { programId: 5, notes: "new" } });
    // Clearing a date is a real change; the legacy ongoing flag is never part of a patch.
    const cleared = buildAssignmentPatch(a, { ...draftFromAssignment(a), endDate: "" });
    expect(cleared).toEqual({ ok: true, value: { endDate: "" } });
  });

  it("Edit keeps a combined legacy title unless explicitly changed, and leaves ongoing alone without an End Date", () => {
    const legacy = saved({ titleId: "youth-care-worker" });
    expect(buildAssignmentPatch(legacy, { ...draftFromAssignment(legacy), notes: "x" })).toEqual({ ok: true, value: { notes: "x" } });
    expect(buildAssignmentPatch(legacy, { ...draftFromAssignment(legacy), titleId: "transition-coach" })).toEqual({ ok: true, value: { titleId: "transition-coach" } });
  });

  it("Edit validates required fields and typed dates before building a patch", () => {
    const a = saved();
    expect(buildAssignmentPatch(a, { ...draftFromAssignment(a), titleId: "" })).toMatchObject({ ok: false, fieldErrors: { titleId: expect.any(String) } });
    expect(buildAssignmentPatch(a, { ...draftFromAssignment(a), endDate: "13/01/2026" })).toMatchObject({ ok: false, fieldErrors: { endDate: expect.any(String) } });
  });
});
