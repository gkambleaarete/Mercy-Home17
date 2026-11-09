import {
  STAFF_ROLE_FIELDS,
  deleteProgramById,
  getCapacitySnapshots,
  getProgramById,
} from "./mockProgramsData";
import {
  getIncidentReports,
  getYouthProgramEnrollments,
} from "./mockYouthProgramData";
import { getPasses } from "./mockPassData";
import {
  getBulkSubstanceTestGroupsForProgram,
  getProgramSubstanceTestsForProgram,
} from "./mockSubstanceTestData";
import { getMedicationLogSnapshot } from "./medicationLogStore";
import { getProgramStaffAssignments } from "./programStaffAssignmentStore";
import { RESIDENTIAL_HOMES } from "./mockProjectionsWaitlistData";
import { getTransitionSummarySnapshot } from "./transitionSummaryStore";
import { getShiftRoleState } from "./shiftRoleStore";
import { getManualLogEntries } from "./programLogEntryStore";

// Program Delete (US 19845). AC16 — what happens to a Program's related
// records — is PENDING the dev team's decision. Until then this is a
// TEMPORARY PROTOTYPE SAFEGUARD, not the business rule: a Program with any
// related record cannot be deleted, and nothing is cascaded, unlinked or
// orphaned. Only Programs with no related records are removed.

export interface ProgramRelation {
  label: string;
  count: number;
}

/**
 * Every known record that references this Program (count > 0 only).
 * `historyUnreadable` is true when the staff assignment history could not be
 * read — that is never the same as "no related records", so deletion must be
 * refused.
 */
export function checkProgramRelatedRecords(programId: number): {
  relations: ProgramRelation[];
  historyUnreadable: boolean;
} {
  const assignments = getProgramStaffAssignments();
  const relations = relatedRecords(
    programId,
    assignments.status === "ok"
      ? assignments.assignments.filter(
          (a) => a.programId === programId,
        ).length
      : 0,
  );
  // US 20221: Shift Roles and Staff Member Status entries reference the
  // Program; unreadable role data is never treated as "none".
  const shiftRoles = getShiftRoleState();
  return {
    relations,
    historyUnreadable:
      assignments.status !== "ok" ||
      shiftRoles.status !== "ok" ||
      getManualLogEntries().status !== "ok",
  };
}

export function getProgramRelatedRecords(
  programId: number,
): ProgramRelation[] {
  return checkProgramRelatedRecords(programId).relations;
}

function relatedRecords(
  programId: number,
  assignmentCount: number,
): ProgramRelation[] {
  const program = getProgramById(programId);
  const medState = getMedicationLogSnapshot();
  const transitions = Object.values(
    getTransitionSummarySnapshot().records,
  );
  const relations: ProgramRelation[] = [
    {
      label: "Capacity Snapshots",
      count: getCapacitySnapshots().filter(
        (s) => s.programId === programId,
      ).length,
    },
    {
      // Active and inactive enrollments alike.
      label: "Youth enrollments",
      count: getYouthProgramEnrollments().filter(
        (e) => e.programId === programId,
      ).length,
    },
    {
      // Staff associations live on the Program record's role fields.
      label: "Staff associations",
      count: program
        ? STAFF_ROLE_FIELDS.filter(
            ({ field }) => !!program[field],
          ).length + program.youthCareWorkers.length
        : 0,
    },
    {
      // Every recorded assignment by Program ID — completed ones too.
      label: "Staff assignments (including past)",
      count: assignmentCount,
    },
    {
      label: "Shift Roles",
      count: (() => {
        const st = getShiftRoleState();
        return st.status === "ok"
          ? st.roles.filter((r) => r.programId === programId).length
          : 0;
      })(),
    },
    {
      label: "Staff Member Status entries",
      count: (() => {
        const st = getShiftRoleState();
        return st.status === "ok"
          ? st.statusEntries.filter((e) => e.programId === programId).length
          : 0;
      })(),
    },
    {
      label: "Program Log entries",
      count: (() => {
        const m = getManualLogEntries();
        return m.status === "ok"
          ? m.entries.filter((e) => e.programId === programId).length
          : 0;
      })(),
    },
    {
      label: "Passes",
      count: getPasses().filter(
        (p) => p.programId === programId,
      ).length,
    },
    {
      label: "Substance tests",
      count:
        getProgramSubstanceTestsForProgram(programId).length +
        getBulkSubstanceTestGroupsForProgram(programId).length,
    },
    {
      // Includes deleted logs and their audit events.
      label: "Medication logs",
      count:
        medState.logs.filter((l) => l.programId === programId)
          .length +
        (medState.auditEvents ?? []).filter(
          (e) => e.programId === programId,
        ).length,
    },
    {
      label: "Residential homes",
      count: RESIDENTIAL_HOMES.filter(
        (h) => h.programId === programId,
      ).length,
    },
    {
      label: "Transition summaries",
      count: transitions.filter(
        (r) =>
          r.type === "Internal" &&
          (r.content as { details?: { programId?: number } })
            .details?.programId === programId,
      ).length,
    },
    {
      // Incident Reports reference the Program by name, not id.
      label: "Incident reports",
      count: program
        ? getIncidentReports().filter(
            (r) => r.program === program.name,
          ).length
        : 0,
    },
  ];
  return relations.filter((r) => r.count > 0);
}

export type DeleteProgramResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "not-found"
        | "not-allowed"
        // Saved Programs or staff assignment history can't be read.
        | "history-unreadable"
        | "storage";
    }
  | {
      ok: false;
      reason: "has-related-records";
      relations: ProgramRelation[];
    };

/** Deletes a Program by id only when it has no related records. The admin
 *  check is the prototype's System Admin flag — not server enforcement. */
export function deleteProgram(
  programId: number,
  isSystemAdmin: boolean,
): DeleteProgramResult {
  if (!isSystemAdmin)
    return { ok: false, reason: "not-allowed" };
  if (!getProgramById(programId))
    return { ok: false, reason: "not-found" };
  const { relations, historyUnreadable } =
    checkProgramRelatedRecords(programId);
  if (historyUnreadable)
    return { ok: false, reason: "history-unreadable" };
  if (relations.length)
    return {
      ok: false,
      reason: "has-related-records",
      relations,
    };
  const deleted = deleteProgramById(programId);
  if (deleted === "deleted") return { ok: true };
  if (deleted === "not-found")
    return { ok: false, reason: "not-found" };
  return {
    ok: false,
    reason:
      deleted === "unreadable"
        ? "history-unreadable"
        : "storage",
  };
}