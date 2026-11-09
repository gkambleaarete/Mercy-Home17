/**
 * Admission Shadow finalization distribution notification — integration
 * point (User Story 17657-C).
 *
 * Same approach as connectionSchedulingNotification.ts: sends go through the
 * shared in-app stub, and everything a backend must supply is isolated here.
 *
 *   - getAdmissionShadowDistributionRecipients → replace with the youth's
 *     real care-team / role lookup
 *   - sendInAppNotification → the in-app notification API (shared stub)
 *
 * Sent once, when an Admissions Shadow moves INTO Submitted/Finalized after
 * the existing 17658-D validation has passed. Overall Evaluation (including
 * "Significant concerns…") never adds any other workflow.
 */

import type { Connection } from "../components/admissions/ConnectionFormDialog";
import { PROGRAM_TEAM } from "../components/pages/programLogData";
import {
  getAdmissionsProfilePath,
  sendInAppNotification,
  type NotificationResult,
  type TaskNotification,
} from "./academicSnapshotTask";
import {
  formatConnectionTime,
  getAdmissionsCaseManager,
  getConnectionRecordPath,
  type StaffMember,
} from "./connectionSchedulingNotification";
import { ADMISSIONS_MANAGER } from "./admissionShadowReportTask";

const FINALIZED = "Submitted/Finalized";

/** True when this save moves an Admissions Shadow INTO Submitted/Finalized
 *  (a new record saved finalized, or previous status was different). */
export function isAdmissionShadowFinalizationTransition(
  previousStatus: Connection["status"] | null,
  connection: Pick<Connection, "type" | "status">,
): boolean {
  return (
    connection.type === "Admissions Shadow" &&
    connection.status === FINALIZED &&
    previousStatus !== FINALIZED
  );
}

// ─── Distribution list ───────────────────────────────────────────────────────
// The youth's program team comes from the existing Program Log team
// (PROGRAM_TEAM); roles with no source in the prototype are placeholders.
const programTeamStaff = (roles: RegExp): StaffMember[] =>
  PROGRAM_TEAM.filter((m) => roles.test(m.role)).map((m) => ({
    id: `program-team-${m.id}`,
    name: m.name,
    email: "",
  }));

const PLACEHOLDER = (
  id: string,
  name: string,
): StaffMember => ({
  id,
  name,
  email: `${name.toLowerCase().replace(/\s+/g, ".")}@mercyhome.org`,
});
const ADMISSIONS_CLINICIAN = PLACEHOLDER(
  "staff-renee-carter",
  "Renee Carter",
);
const SCHOOL_RESOURCES_COORDINATOR = PLACEHOLDER(
  "staff-omar-haddad",
  "Omar Haddad",
);
const CAREER_RESOURCES_COORDINATOR = PLACEHOLDER(
  "staff-lena-novak",
  "Lena Novak",
);
const POST_SECONDARY_COORDINATOR = PLACEHOLDER(
  "staff-grace-ito",
  "Grace Ito",
);
const ACADEMY_DIRECTOR = PLACEHOLDER(
  "staff-victor-hale",
  "Victor Hale",
);

export interface DistributionRecipient {
  staff: StaffMember;
  /** Every distribution role this person was matched by. */
  roles: string[];
}

/** The US 17657 distribution list for this youth, one entry per unique
 *  staff id (a person holding several roles is listed — and notified —
 *  once, with all their roles). */
export function getAdmissionShadowDistributionRecipients(
  youthId: string,
): DistributionRecipient[] {
  const caseManager = getAdmissionsCaseManager(youthId);
  const byRole: [string, StaffMember[]][] = [
    [
      "Admissions Case Manager",
      caseManager ? [caseManager] : [],
    ],
    ["Admissions Clinician", [ADMISSIONS_CLINICIAN]],
    ["Manager of Admissions", [ADMISSIONS_MANAGER]],
    [
      "Program Manager / Supervisor / Therapist",
      programTeamStaff(/Program Manager|Supervisor|Therapist/i),
    ],
    [
      "Program Director",
      programTeamStaff(/^Program Director$/i),
    ],
    [
      "School Resources Coordinator",
      [SCHOOL_RESOURCES_COORDINATOR],
    ],
    [
      "Career Resources Coordinator",
      [CAREER_RESOURCES_COORDINATOR],
    ],
    [
      "Post-Secondary Options Coordinator",
      [POST_SECONDARY_COORDINATOR],
    ],
    ["Academy Manager / Director", [ACADEMY_DIRECTOR]],
    ["Nurse", programTeamStaff(/^Nurse$/i)],
  ];
  const unique = new Map<string, DistributionRecipient>();
  for (const [role, staff] of byRole)
    for (const s of staff) {
      const entry = unique.get(s.id) ?? { staff: s, roles: [] };
      entry.roles.push(role);
      unique.set(s.id, entry);
    }
  return [...unique.values()];
}

// ─── Notification ────────────────────────────────────────────────────────────
export function buildAdmissionShadowFinalizedNotifications(input: {
  connection: Pick<
    Connection,
    "id" | "startDate" | "startTime"
  >;
  youth: { id: string; name: string };
  recipients: DistributionRecipient[];
}): TaskNotification[] {
  const { connection, youth, recipients } = input;
  const when = `${connection.startDate} at ${formatConnectionTime(connection.startTime ?? "")}`;
  return recipients.map(({ staff }) => ({
    channel: "in-app" as const,
    recipient: staff,
    content: {
      title: "Admission Shadow Report Submitted",
      subject: `The Admission Shadow Report for ${youth.name} has been submitted and finalized.`,
      youthName: youth.name,
      details: [
        { label: "Youth", value: youth.name },
        {
          label: "Connection Type",
          value: "Admissions Shadow",
        },
        { label: "Connection Date/Time", value: when },
        { label: "Status", value: FINALIZED },
        {
          label: "Youth Profile",
          value: getAdmissionsProfilePath(youth.id),
        },
      ],
      ctaLabel: "View Connection →",
    },
    link: getConnectionRecordPath(youth.id, connection.id),
  }));
}

// One distribution per Connection — guards against repeated saves/renders.
const notifiedConnectionIds = new Set<string>();

/**
 * Sends the finalization distribution when this save moves an Admissions
 * Shadow into Submitted/Finalized; otherwise does nothing (null). Call only
 * after the Connection has been saved.
 */
export async function notifyAdmissionShadowFinalized(input: {
  previousStatus: Connection["status"] | null;
  connection: Pick<
    Connection,
    "id" | "type" | "status" | "startDate" | "startTime"
  >;
  youth: { id: string; name: string };
}): Promise<{
  notifications: TaskNotification[];
  results: NotificationResult[];
} | null> {
  const { previousStatus, connection, youth } = input;
  if (
    !isAdmissionShadowFinalizationTransition(
      previousStatus,
      connection,
    )
  )
    return null;
  if (notifiedConnectionIds.has(connection.id)) return null;
  notifiedConnectionIds.add(connection.id);
  const notifications =
    buildAdmissionShadowFinalizedNotifications({
      connection,
      youth,
      recipients: getAdmissionShadowDistributionRecipients(
        youth.id,
      ),
    });
  const results = await Promise.all(
    notifications.map((n) => sendInAppNotification(n)),
  );
  return { notifications, results };
}