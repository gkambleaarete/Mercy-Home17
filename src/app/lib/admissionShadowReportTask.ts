/**
 * Admission Shadow Report task — integration point (User Story 17656-C).
 *
 * Same approach as academicSnapshotTask.ts: there is no task service or
 * staff directory yet, so everything a backend must supply is isolated here.
 *
 *   - STAFF_DIRECTORY          → replace with the real staff/user lookup
 *   - createTask / task store  → replace with the task-creation API (the
 *                                backend should enforce one task per
 *                                Connection, as the store does here)
 *
 * Only Admissions Shadow creates this task, and only when a NEW Connection
 * is saved — edits never create another.
 */

import type { Connection } from "../components/admissions/ConnectionFormDialog";
import { parseConnectionStart } from "../components/admissions/connectionStatusRules";
import { formatMdy } from "./dateFormat";
import {
  ECR_TEAM_MEMBERS,
  getAdmissionsProfilePath,
} from "./academicSnapshotTask";
import {
  ADMISSIONS_CASE_MANAGERS,
  CURRENT_CONNECTION_USER,
  formatConnectionTime,
  getConnectionRecordPath,
  type StaffMember,
} from "./connectionSchedulingNotification";

export const ASSIGNED_SHADOW_REPORTER_ROLE =
  "Assigned Shadow Reporter";

// Placeholder staff directory — the staff the prototype already defines,
// plus Admissions shadow reporters. Participants store only a name.
export const STAFF_DIRECTORY: StaffMember[] = [
  ...ECR_TEAM_MEMBERS,
  CURRENT_CONNECTION_USER,
  ...Object.values(ADMISSIONS_CASE_MANAGERS),
  {
    id: "staff-jordan-smith",
    name: "Jordan Smith",
    email: "jordan.smith@mercyhome.org",
  },
];

// Leadership used by Shadow Report escalation (US 17656-D). Maria Rodriguez
// is the Program Director already named in the info-session mock data.
export const PROGRAM_DIRECTOR_MARIA_RODRIGUEZ: StaffMember = {
  id: "staff-maria-rodriguez",
  name: "Maria Rodriguez",
  email: "maria.rodriguez@mercyhome.org",
};
export const ADMISSIONS_MANAGER: StaffMember = {
  id: "staff-dana-whitfield",
  name: "Dana Whitfield",
  email: "dana.whitfield@mercyhome.org",
};
STAFF_DIRECTORY.push(
  PROGRAM_DIRECTOR_MARIA_RODRIGUEZ,
  ADMISSIONS_MANAGER,
);

/** Staff record for a participant name; a name not in the directory still
 *  gets a stable name-based id so the task can be assigned and found. */
export function resolveStaffMember(name: string): StaffMember {
  const key = name.trim().toLowerCase();
  return (
    STAFF_DIRECTORY.find(
      (s) => s.name.toLowerCase() === key,
    ) ?? {
      id: `staff-name:${key.replace(/\s+/g, "-")}`,
      name: name.trim(),
      email: "",
    }
  );
}

/** The first participant with Role = Assigned Shadow Reporter and a name.
 *  More than one is possible in the UI; only the first is assigned. */
export function getAssignedShadowReporter(
  participants: { participant: string; role: string }[],
): StaffMember | null {
  const reporter = participants.find(
    (p) =>
      p.role === ASSIGNED_SHADOW_REPORTER_ROLE &&
      p.participant.trim(),
  );
  return reporter
    ? resolveStaffMember(reporter.participant)
    : null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Connection End Date + End Time + exactly 24 hours; null if unparseable. */
export function getShadowReportDueAt(
  endDate: string,
  endTime: string,
): Date | null {
  const end = parseConnectionStart(endDate, endTime);
  return end ? new Date(end.getTime() + DAY_MS) : null;
}

/** "MM/DD/YYYY h:mm AM/PM" */
function formatDateTime(d: Date): string {
  return `${formatMdy(d)} ${formatConnectionTime(`${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`)}`;
}

export interface AdmissionShadowReportTask {
  id: string;
  subject: string;
  assignedTo: StaffMember;
  /** ISO timestamp — 24 hours after the Connection's End Date/Time. */
  dueAt: string;
  /** MM/DD/YYYY */
  dueDate: string;
  /** h:mm AM/PM */
  dueTime: string;
  connectionId: string;
  /** "MM/DD/YYYY h:mm AM/PM – MM/DD/YYYY h:mm AM/PM" */
  connectionDateTime: string;
  youth: { id: string; name: string };
  connectionLink: string;
  youthProfileLink: string;
  status: "Open" | "Completed";
  /** ISO timestamp — set when the Admissions Shadow is Submitted/Finalized. */
  completedAt?: string;
  // Reminder state (US 17656-D) — each fires at most once per task.
  preDeadlineReminderSentAt?: string;
  deadlineReminderSentAt?: string;
  overdueEscalationSentAt?: string;
  createdBy: string;
  /** ISO timestamp. */
  createdAt: string;
}

// Prototype task store, keyed by Connection id: one task per Connection,
// however often a save or render repeats.
const tasksByConnectionId = new Map<
  string,
  AdmissionShadowReportTask
>();

export function getAdmissionShadowReportTasks(): AdmissionShadowReportTask[] {
  return [...tasksByConnectionId.values()];
}

/** Updates a stored task in place (prototype store; replace with the API). */
export function updateAdmissionShadowReportTask(
  connectionId: string,
  changes: Partial<AdmissionShadowReportTask>,
): AdmissionShadowReportTask | null {
  const task = tasksByConnectionId.get(connectionId);
  if (!task) return null;
  const next = { ...task, ...changes };
  tasksByConnectionId.set(connectionId, next);
  return next;
}

/** Marks the Connection's Shadow Report task Completed (kept, not deleted)
 *  once its Admissions Shadow is Submitted/Finalized. No-op otherwise. */
export function completeAdmissionShadowReportTask(connection: {
  id: string;
  type: string;
  status?: string;
}): AdmissionShadowReportTask | null {
  if (
    connection.type !== "Admissions Shadow" ||
    connection.status !== "Submitted/Finalized"
  )
    return null;
  const task = tasksByConnectionId.get(connection.id);
  if (!task || task.status === "Completed") return null;
  return updateAdmissionShadowReportTask(connection.id, {
    status: "Completed",
    completedAt: new Date().toISOString(),
  });
}

async function createTask(
  task: AdmissionShadowReportTask,
): Promise<AdmissionShadowReportTask> {
  // Integration point: replace with the task-creation API call.
  tasksByConnectionId.set(task.connectionId, task);
  return task;
}

/**
 * Creates the Shadow Report task for a newly saved Admissions Shadow.
 * Returns null — creating nothing — for any other type, when no Assigned
 * Shadow Reporter or End Date/Time is available, or when this Connection
 * already has its task.
 */
export async function createAdmissionShadowReportTask(input: {
  connection: Pick<
    Connection,
    | "id"
    | "type"
    | "startDate"
    | "startTime"
    | "endDate"
    | "endTime"
  >;
  participants: { participant: string; role: string }[];
  youth: { id: string; name: string };
  createdBy?: StaffMember;
}): Promise<AdmissionShadowReportTask | null> {
  const { connection, participants, youth } = input;
  if (connection.type !== "Admissions Shadow") return null;
  if (tasksByConnectionId.has(connection.id)) return null;
  const assignedTo = getAssignedShadowReporter(participants);
  const dueAt = getShadowReportDueAt(
    connection.endDate,
    connection.endTime,
  );
  if (!assignedTo || !dueAt) return null;

  const start = parseConnectionStart(
    connection.startDate,
    connection.startTime,
  );
  const end = parseConnectionStart(
    connection.endDate,
    connection.endTime,
  );
  return createTask({
    id: `task-shadow-${connection.id}`,
    subject: `Complete Admission Shadow Report for ${youth.name}`,
    assignedTo,
    dueAt: dueAt.toISOString(),
    dueDate: formatMdy(dueAt),
    dueTime: formatDateTime(dueAt).slice(11),
    connectionId: connection.id,
    connectionDateTime: [start, end]
      .filter((d): d is Date => !!d)
      .map(formatDateTime)
      .join(" – "),
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