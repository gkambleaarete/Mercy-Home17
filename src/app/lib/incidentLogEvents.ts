// US 20222 fix — Incident Program Log rows come from the SHARED incident
// writers (incidentReportStore), so finalizing from Program Log -> IR,
// Youth Incident Details, or creating a report already Finalized all emit
// the same row. One row per report: keyed by the report id and upserted.

import { getPrograms } from "../data/mockProgramsData";
import {
  FINALIZED_STATUS,
  type IncidentReportRecord,
} from "../data/mockYouthProgramData";
import {
  localDateTimeParts,
  upsertGeneratedEvent,
} from "../data/programLogEntryStore";

/**
 * Owning Program: the canonical Program ID when the report has one;
 * otherwise an UNAMBIGUOUS match of the saved Program name against the
 * Program records. Missing or ambiguous ownership returns null — the event
 * is never assigned to an unrelated Program.
 */
export function resolveIncidentProgramId(
  r: Pick<IncidentReportRecord, "program" | "programId">,
): number | null {
  const programs = getPrograms();
  if (r.programId !== undefined)
    return programs.some((p) => p.id === r.programId) ? r.programId : null;
  const name = (r.program ?? "").trim().toLowerCase();
  if (!name) return null;
  const matches = programs.filter((p) => p.name.trim().toLowerCase() === name);
  return matches.length === 1 ? matches[0].id : null;
}

/** Called by the writers after a successful write. Non-finalized → no-op. */
export function emitIncidentLogEvent(r: IncidentReportRecord, at?: Date): void {
  if (r.status !== FINALIZED_STATUS) return;
  const programId = resolveIncidentProgramId(r);
  if (programId === null) return;
  const { date, time } = localDateTimeParts(at);
  upsertGeneratedEvent({
    key: `incident:${r.id}`,
    programId,
    logType: "Incident",
    date,
    time,
    youthName: r.youthInvolved || "Youth",
    reportId: String(r.id),
    summary: r.incidentTypes?.length ? `Type: ${r.incidentTypes.join(", ")}` : undefined,
    createdBy: r.staffInvolved || "Staff",
  });
}
