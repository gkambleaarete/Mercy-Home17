// Session-only helpers over the shared Incident Report list in
// mockYouthProgramData (read by the Incident Reports list and Program
// compliance). Mock state only; narrative / detail text is never stored or
// logged here — only the list-level record fields.

import {
  getIncidentReports,
  setIncidentReportsData,
  FINALIZED_STATUS,
  type IncidentReportRecord,
} from "./mockYouthProgramData";
import { emitIncidentLogEvent } from "../lib/incidentLogEvents";

export type IncidentWriteResult =
  | { ok: true; record: IncidentReportRecord }
  | { ok: false; message: string };

export interface NewIncidentInput {
  constituentIds: number[];
  youthInvolved: string;
  incidentStartDateTime: string;
  program: string;
  /** Canonical Program ID when the caller knows it (US 20222). */
  programId?: number;
  staffInvolved: string;
  incidentTypes: string[];
  status?: string;
  endDateTime?: string;
  location?: string;
  description?: string;
  participants?: IncidentReportRecord["participants"];
}

export function addIncidentReportRecord(input: NewIncidentInput): IncidentWriteResult {
  try {
    const list = getIncidentReports();
    const id = list.reduce((m, r) => Math.max(m, r.id), 0) + 1;
    const status = input.status ?? "In Progress";
    const record: IncidentReportRecord = {
      id,
      constituentIds: input.constituentIds,
      youthInvolved: input.youthInvolved,
      incidentStartDateTime: input.incidentStartDateTime,
      program: input.program,
      ...(input.programId !== undefined ? { programId: input.programId } : {}),
      staffInvolved: input.staffInvolved,
      status,
      isFinalized: status === FINALIZED_STATUS,
      incidentTypes: input.incidentTypes,
      ...(input.endDateTime ? { endDateTime: input.endDateTime } : {}),
      ...(input.location ? { location: input.location } : {}),
      ...(input.description ? { description: input.description } : {}),
      ...(input.participants ? { participants: input.participants } : {}),
    };
    setIncidentReportsData([record, ...list]);
    emitIncidentLogEvent(record); // only when created Finalized
    return { ok: true, record };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Unable to save." };
  }
}

export function getIncidentReportById(id: number): IncidentReportRecord | undefined {
  return getIncidentReports().find((r) => r.id === id);
}

export function setIncidentReportStatus(id: number, status: string): IncidentWriteResult {
  try {
    const list = getIncidentReports();
    const cur = list.find((r) => r.id === id);
    if (!cur) return { ok: false, message: "Incident report not found." };
    const record = { ...cur, status, isFinalized: status === FINALIZED_STATUS };
    setIncidentReportsData(list.map((r) => (r.id === id ? record : r)));
    emitIncidentLogEvent(record); // only on Finalized; idempotent per report
    return { ok: true, record };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Unable to save." };
  }
}

/** Incidents the constituent is explicitly associated with (by ID only). */
export function getIncidentReportsForConstituent(
  constituentId: number,
): IncidentReportRecord[] {
  return getIncidentReports().filter((r) =>
    r.constituentIds.includes(constituentId),
  );
}

export type IncidentReportPatch = Partial<
  Pick<
    IncidentReportRecord,
    | "incidentStartDateTime"
    | "endDateTime"
    | "program"
    | "incidentTypes"
    | "location"
    | "description"
  >
>;

/** Updates one incident by its real ID; nothing else changes. */
export function updateIncidentReport(
  id: number,
  patch: IncidentReportPatch,
): IncidentWriteResult {
  try {
    const list = getIncidentReports();
    const cur = list.find((r) => r.id === id);
    if (!cur) return { ok: false, message: "Incident not found." };
    const record = { ...cur, ...patch };
    setIncidentReportsData(list.map((r) => (r.id === id ? record : r)));
    return { ok: true, record };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Unable to save." };
  }
}

/** Deletes one incident by ID. Refused when other constituents are on it. */
export function deleteIncidentReport(
  id: number,
  byConstituentId: number,
): { ok: true } | { ok: false; message: string } {
  try {
    const list = getIncidentReports();
    const cur = list.find((r) => r.id === id);
    if (!cur) return { ok: false, message: "Incident not found." };
    if (cur.constituentIds.some((c) => c !== byConstituentId))
      return {
        ok: false,
        message:
          "This incident involves other constituents, so it can't be deleted from this profile.",
      };
    setIncidentReportsData(list.filter((r) => r.id !== id));
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Unable to delete." };
  }
}
