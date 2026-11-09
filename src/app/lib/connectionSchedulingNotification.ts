/**
 * Admissions Case Manager scheduling notification — integration point
 * (User Story 17656-B).
 *
 * Same approach as academicSnapshotTask.ts: there is no notification service
 * or user directory yet, so everything a backend must supply is isolated
 * here and the in-app send goes through that module's stub.
 *
 *   - CURRENT_CONNECTION_USER   → replace with the authenticated user
 *   - ADMISSIONS_CASE_MANAGERS  → replace with the youth's assigned
 *                                 Admissions Case Manager lookup
 *   - sendInAppNotification     → replace with the in-app notification API
 *
 * Only the youth's assigned Admissions Case Manager is ever a recipient.
 */

import type { Connection } from "../components/admissions/ConnectionFormDialog";
import {
  getAdmissionsProfilePath,
  sendInAppNotification,
  type EcrTeamMember,
  type NotificationResult,
  type TaskNotification,
} from "./academicSnapshotTask";

/** A staff user; same shape as the Academic Snapshot roster entries. */
export type StaffMember = EcrTeamMember;

// Matches the user the Connection form already adds as Organizer and
// layout/UtilityBar's CURRENT_USER, until real authentication is wired in.
export const CURRENT_CONNECTION_USER: StaffMember = {
  id: "staff-sohan-jadhavrao",
  name: "Sohan Jadhavrao",
  email: "sohan.jadhavrao@mercyhome.org",
};

// Placeholder — no youth → Admissions Case Manager source exists yet.
// Keyed by the youth id the Connection form uses (CONNECTION_FORM_YOUTH).
// To demo "the Case Manager saves it" (no notification), point this entry
// at CURRENT_CONNECTION_USER.
export const ADMISSIONS_CASE_MANAGERS: Record<
  string,
  StaffMember
> = {
  "aarete-test": {
    id: "staff-maria-lopez",
    name: "Maria Lopez",
    email: "maria.lopez@mercyhome.org",
  },
};

export function getAdmissionsCaseManager(
  youthId: string,
): StaffMember | undefined {
  // Prototype placeholder: any youth without its own entry uses the sample
  // youth's Case Manager, so the scheduling-notification demo works for
  // every youth profile.
  return (
    ADMISSIONS_CASE_MANAGERS[youthId] ??
    ADMISSIONS_CASE_MANAGERS["aarete-test"]
  );
}

const SCHEDULING_NOTIFICATION_TYPES = [
  "Admissions Shadow",
  "Family Partnership Meeting",
];

export type SchedulingChange = "scheduled" | "rescheduled";

/**
 * Whether saving `updated` must notify the youth's Admissions Case Manager:
 * an Admissions Shadow / FPM that is new ("scheduled") or whose Start Date
 * or Start Time changed ("rescheduled"), saved by someone other than that
 * Case Manager. Null means no notification.
 */
export function shouldNotifyAdmissionsCaseManager(input: {
  original: Pick<Connection, "startDate" | "startTime"> | null;
  updated: Pick<Connection, "type" | "startDate" | "startTime">;
  saver: StaffMember;
  caseManager: StaffMember | undefined;
}): SchedulingChange | null {
  const { original, updated, saver, caseManager } = input;
  if (!SCHEDULING_NOTIFICATION_TYPES.includes(updated.type))
    return null;
  if (!caseManager || caseManager.id === saver.id) return null;
  if (!original) return "scheduled";
  // Times compare normalised: "14:30" (form default) equals "2:30 PM".
  return original.startDate !== updated.startDate ||
    formatConnectionTime(original.startTime ?? "") !==
      formatConnectionTime(updated.startTime ?? "")
    ? "rescheduled"
    : null;
}

/** "14:30" or "2:30 PM" → "2:30 PM"; anything else is shown as entered. */
export function formatConnectionTime(time: string): string {
  const m = time
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return time;
  if (m[3]) return `${+m[1]}:${m[2]} ${m[3].toUpperCase()}`;
  const h = +m[1];
  return `${h % 12 || 12}:${m[2]} ${h >= 12 ? "PM" : "AM"}`;
}

/** Youth profile, opened on its Connections section, for this record. */
export function getConnectionRecordPath(
  youthId: string,
  connectionId: string,
): string {
  return `${getAdmissionsProfilePath(youthId)}&section=connections&connectionId=${encodeURIComponent(connectionId)}`;
}

export interface SchedulingNotification extends TaskNotification {
  /** App route to the youth's profile (TaskNotification.link is the Connection). */
  youthProfileLink: string;
}

export function buildSchedulingNotification(input: {
  change: SchedulingChange;
  connection: Pick<
    Connection,
    "id" | "type" | "startDate" | "startTime"
  >;
  youth: { id: string; name: string };
  recipient: StaffMember;
  saver: StaffMember;
}): SchedulingNotification {
  const { change, connection, youth, recipient, saver } = input;
  const when = `${connection.startDate} at ${formatConnectionTime(connection.startTime)}`;
  const verb =
    change === "scheduled" ? "scheduled for" : "rescheduled to";
  return {
    channel: "in-app",
    recipient,
    content: {
      title: `${connection.type} ${change === "scheduled" ? "Scheduled" : "Rescheduled"}`,
      subject: `${youth.name}'s ${connection.type} has been ${verb} ${when}.`,
      youthName: youth.name,
      details: [
        { label: "Connection Type", value: connection.type },
        { label: "Scheduled", value: when },
        { label: "Youth", value: youth.name },
        {
          label:
            change === "scheduled"
              ? "Scheduled By"
              : "Rescheduled By",
          value: saver.name,
        },
      ],
      ctaLabel: "View Connection →",
    },
    link: getConnectionRecordPath(youth.id, connection.id),
    youthProfileLink: getAdmissionsProfilePath(youth.id),
  };
}

/**
 * Runs the rule for one save and, when it applies, sends exactly one in-app
 * notification to the assigned Admissions Case Manager. Returns what was
 * sent (null when nothing was), so the caller can confirm it to the user.
 */
export async function notifyAdmissionsCaseManagerOfScheduling(input: {
  original: Pick<Connection, "startDate" | "startTime"> | null;
  updated: Pick<
    Connection,
    "id" | "type" | "startDate" | "startTime"
  >;
  youth: { id: string; name: string };
  saver?: StaffMember;
}): Promise<{
  notification: SchedulingNotification;
  result: NotificationResult;
} | null> {
  const saver = input.saver ?? CURRENT_CONNECTION_USER;
  const caseManager = getAdmissionsCaseManager(input.youth.id);
  const change = shouldNotifyAdmissionsCaseManager({
    original: input.original,
    updated: input.updated,
    saver,
    caseManager,
  });
  if (!change || !caseManager) return null;
  const notification = buildSchedulingNotification({
    change,
    connection: input.updated,
    youth: input.youth,
    recipient: caseManager,
    saver,
  });
  const result = await sendInAppNotification(notification);
  return { notification, result };
}