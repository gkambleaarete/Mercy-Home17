/**
 * Cancelled Admissions Shadow / FPM → High-priority reschedule task —
 * integration point (User Story 17658-E).
 *
 * Same approach as admissionShadowReportTask.ts: no task service exists,
 * so creation and storage are isolated here.
 *
 *   - getAdmissionsCaseManager → the 17656-B Case Manager lookup (shared)
 *   - createTask / task store  → replace with the task-creation API (the
 *                                backend should enforce one task per
 *                                cancelled Connection, as the store does)
 *
 * Only the Connection's status is involved — no referral, admissions or
 * youth status is read or changed.
 */

import type { Connection } from "../components/admissions/ConnectionFormDialog";
import { getAdmissionsProfilePath } from "./academicSnapshotTask";
import {
  CURRENT_CONNECTION_USER,
  formatConnectionTime,
  getAdmissionsCaseManager,
  getConnectionRecordPath,
  type StaffMember,
} from "./connectionSchedulingNotification";

/** Connection type → the name used in the task title. */
const RESCHEDULE_TITLE_NAMES: Record<string, string> = {
  "Admissions Shadow": "Admission Shadow",
  "Family Partnership Meeting": "Family Partnership Meeting",
};

export interface ConnectionRescheduleTask {
  id: string;
  subject: string;
  priority: "High";
  connectionType: string;
  assignedTo: StaffMember;
  /** The ticket defines no due date, so none is set. */
  dueAt: null;
  connectionId: string;
  /** Originally scheduled start: "MM/DD/YYYY h:mm AM/PM". */
  scheduledStart: string;
  youth: { id: string; name: string };
  connectionLink: string;
  youthProfileLink: string;
  status: "Open";
  createdBy: string;
  /** ISO timestamp. */
  createdAt: string;
}

// Prototype task store, keyed by Connection id: one reschedule task per
// Connection (a later re-cancellation does not add another).
const tasksByConnectionId = new Map<
  string,
  ConnectionRescheduleTask
>();

export function getConnectionRescheduleTasks(): ConnectionRescheduleTask[] {
  return [...tasksByConnectionId.values()];
}

/** True when this save moves an Admissions Shadow / FPM INTO Cancelled
 *  (new record saved Cancelled, or previous status was not Cancelled). */
export function isCancellationTransition(
  previousStatus: Connection["status"] | null,
  connection: Pick<Connection, "type" | "status">,
): boolean {
  return (
    connection.type in RESCHEDULE_TITLE_NAMES &&
    connection.status === "Cancelled" &&
    previousStatus !== "Cancelled"
  );
}

async function createTask(
  task: ConnectionRescheduleTask,
): Promise<ConnectionRescheduleTask> {
  // Integration point: replace with the task-creation API call.
  tasksByConnectionId.set(task.connectionId, task);
  return task;
}

/**
 * Creates the High-priority reschedule task for the youth's Admissions Case
 * Manager when an Admissions Shadow / FPM is saved into Cancelled. Returns
 * null — creating nothing — for any other save, when the youth has no Case
 * Manager, or when this Connection already has its reschedule task.
 */
export async function createConnectionRescheduleTask(input: {
  previousStatus: Connection["status"] | null;
  connection: Pick<
    Connection,
    "id" | "type" | "status" | "startDate" | "startTime"
  >;
  youth: { id: string; name: string };
  createdBy?: StaffMember;
}): Promise<ConnectionRescheduleTask | null> {
  const { previousStatus, connection, youth } = input;
  if (!isCancellationTransition(previousStatus, connection))
    return null;
  if (tasksByConnectionId.has(connection.id)) return null;
  const assignedTo = getAdmissionsCaseManager(youth.id);
  if (!assignedTo) return null;

  return createTask({
    id: `task-reschedule-${connection.id}`,
    subject: `Reschedule ${RESCHEDULE_TITLE_NAMES[connection.type]} for ${youth.name}`,
    priority: "High",
    connectionType: connection.type,
    assignedTo,
    dueAt: null,
    connectionId: connection.id,
    scheduledStart:
      `${connection.startDate} ${formatConnectionTime(connection.startTime ?? "")}`.trim(),
    youth,
    connectionLink: getConnectionRecordPath(
      youth.id,
      connection.id,
    ),
    youthProfileLink: getAdmissionsProfilePath(youth.id),
    status: "Open",
    createdBy: (input.createdBy ?? CURRENT_CONNECTION_USER)
      .name,
    createdAt: new Date().toISOString(),
  });
}