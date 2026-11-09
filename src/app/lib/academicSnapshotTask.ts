/**
 * Academic Snapshot task — integration point (User Story 19988).
 *
 * This frontend has no backend, task service, or notification/email
 * infrastructure yet (tasks elsewhere live in component-local mock state, and
 * the header notification bell is static). Everything the Admissions
 * "Assign Academic Snapshot" action needs from a backend is isolated here so
 * it can be swapped for real API calls without touching the UI:
 *
 *   - ECR_TEAM_MEMBERS          → replace with the real ECR Team user lookup
 *   - createTask                → replace with the task-creation API
 *   - sendInAppNotification     → replace with the in-app notification API
 *   - sendEmailNotification     → replace with the email notification API
 *
 * Task creation is only ever initiated by an explicit user action; nothing in
 * this module runs automatically.
 */

export interface EcrTeamMember {
  id: string;
  name: string;
  email: string;
}

// Placeholder roster — no ECR Team user source exists in this codebase yet.
export const ECR_TEAM_MEMBERS: EcrTeamMember[] = [
  {
    id: "ecr-001",
    name: "Angela Kim",
    email: "angela.kim@mercyhome.org",
  },
  {
    id: "ecr-002",
    name: "Carlos Vega",
    email: "carlos.vega@mercyhome.org",
  },
  {
    id: "ecr-003",
    name: "Denise Carter",
    email: "denise.carter@mercyhome.org",
  },
  {
    id: "ecr-004",
    name: "Brian King",
    email: "brian.king@mercyhome.org",
  },
];

// Matches the "Current User" convention used for created-by fields across
// the app until real authentication is wired in.
export const CURRENT_ADMISSIONS_USER = "Current User";

export const ACADEMIC_SNAPSHOT_DEFAULT_SUBJECT =
  "Complete Snapshot";

/** Route that opens a youth's Admissions profile (handled by AdmissionsDashboard). */
export function getAdmissionsProfilePath(
  youthId: string,
): string {
  return `/?leadId=${encodeURIComponent(youthId)}`;
}

export interface AcademicSnapshotTask {
  id: string;
  subject: string;
  /** MM/DD/YYYY, or "" when not supplied. */
  dueDate: string;
  assignedTo: EcrTeamMember;
  comments: string;
  relatedTo: { id: string; name: string };
  status: "Open";
  createdBy: string;
  /** ISO timestamp. */
  createdAt: string;
}

export interface AssignAcademicSnapshotInput {
  subject: string;
  dueDate: string;
  assignedTo: EcrTeamMember;
  comments: string;
  youth: { id: string; name: string };
}

/**
 * Content shared by the in-app and email notifications — derived only from
 * the created task, so both channels always say the same thing. Optional
 * details (Due Date, Comments) are omitted rather than shown empty.
 */
export interface AcademicSnapshotNotificationContent {
  title: string;
  /** Email subject line. */
  subject: string;
  /** Always the related youth record's name. */
  youthName: string;
  details: { label: string; value: string }[];
  ctaLabel: string;
}

export interface TaskNotification {
  channel: "in-app" | "email";
  recipient: EcrTeamMember;
  content: AcademicSnapshotNotificationContent;
  /** In-app: app route. Email: absolute URL. Both open the youth's Admissions profile. */
  link: string;
  /** Email only: the rendered HTML body handed to the email service. */
  html?: string;
}

export interface NotificationResult {
  channel: TaskNotification["channel"];
  /** "not_configured" until a real notification service is connected. */
  status: "sent" | "not_configured";
}

export interface AssignAcademicSnapshotResult {
  task: AcademicSnapshotTask;
  notifications: NotificationResult[];
  /** The exact in-app + email payloads generated for this task. */
  sentNotifications: TaskNotification[];
}

export function buildAcademicSnapshotNotificationContent(
  task: AcademicSnapshotTask,
): AcademicSnapshotNotificationContent {
  const details = [
    { label: "Task", value: task.subject },
    { label: "Due Date", value: task.dueDate },
    { label: "Assigned By", value: task.createdBy },
    { label: "Comments", value: task.comments },
  ].filter((d) => d.value.trim() !== "");
  return {
    title: "Academic Snapshot Assigned",
    subject: "Academic Snapshot Task Assigned",
    youthName: task.relatedTo.name,
    details,
    ctaLabel: "View Youth Profile →",
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Email body HTML. Email clients don't support CSS variables or external
 * stylesheets, so the Mercy Home design-system values are inlined here
 * (--color-brand-primary #145F33, --slds-g-color-text-default #080707,
 * --slds-g-color-text-weak #706e6b, --slds-g-color-border-base-1 #dddbda,
 * --slds-g-color-background-alt-2 #f3f2f2, --slds-g-font-family).
 */
export function renderAcademicSnapshotEmailHtml(
  content: AcademicSnapshotNotificationContent,
  link: string,
): string {
  const rows = content.details
    .map(
      (d) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#706e6b;font-size:13px;vertical-align:top;white-space:nowrap;">${escapeHtml(d.label)}</td><td style="padding:6px 0;color:#080707;font-size:13px;white-space:pre-wrap;">${escapeHtml(d.value)}</td></tr>`,
    )
    .join("");
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(content.subject)}</title></head>
<body style="margin:0;padding:24px;background:#f3f2f2;font-family:'Salesforce Sans',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #dddbda;border-radius:8px;">
<tr><td style="padding:16px 24px;border-bottom:4px solid #145F33;">
<h1 style="margin:0;font-size:18px;font-weight:600;color:#080707;">${escapeHtml(content.subject)}</h1>
</td></tr>
<tr><td style="padding:20px 24px;">
<p style="margin:0 0 16px;font-size:14px;line-height:20px;color:#080707;">You have been assigned an Academic Snapshot task for <strong>${escapeHtml(content.youthName)}</strong>.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">${rows}</table>
<a href="${escapeHtml(link)}" target="_blank" rel="noopener" style="display:inline-block;padding:8px 16px;background:#145F33;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;border-radius:9999px;">${escapeHtml(content.ctaLabel)}</a>
</td></tr>
<tr><td style="padding:12px 24px;border-top:1px solid #dddbda;font-size:12px;color:#706e6b;">Mercy Home for Boys &amp; Girls</td></tr>
</table>
</body></html>`;
}

async function createTask(
  input: AssignAcademicSnapshotInput,
): Promise<AcademicSnapshotTask> {
  // Integration point: replace with the task-creation API call.
  return {
    id: `task-${Date.now()}`,
    subject: input.subject,
    dueDate: input.dueDate,
    assignedTo: input.assignedTo,
    comments: input.comments,
    relatedTo: input.youth,
    status: "Open",
    createdBy: CURRENT_ADMISSIONS_USER,
    createdAt: new Date().toISOString(),
  };
}

export async function sendInAppNotification(
  _notification: TaskNotification,
): Promise<NotificationResult> {
  // Integration point: no in-app notification service exists yet.
  return { channel: "in-app", status: "not_configured" };
}

async function sendEmailNotification(
  _notification: TaskNotification,
): Promise<NotificationResult> {
  // Integration point: no email service exists yet.
  return { channel: "email", status: "not_configured" };
}

export function buildTaskNotifications(
  task: AcademicSnapshotTask,
): TaskNotification[] {
  const path = getAdmissionsProfilePath(task.relatedTo.id);
  const emailLink = `${window.location.origin}${path}`;
  const content =
    buildAcademicSnapshotNotificationContent(task);
  return [
    {
      channel: "in-app",
      recipient: task.assignedTo,
      content,
      link: path,
    },
    {
      channel: "email",
      recipient: task.assignedTo,
      content,
      link: emailLink,
      html: renderAcademicSnapshotEmailHtml(content, emailLink),
    },
  ];
}

export async function assignAcademicSnapshotTask(
  input: AssignAcademicSnapshotInput,
): Promise<AssignAcademicSnapshotResult> {
  const task = await createTask(input);
  const [inApp, email] = buildTaskNotifications(task);
  const notifications = await Promise.all([
    sendInAppNotification(inApp),
    sendEmailNotification(email),
  ]);
  return {
    task,
    notifications,
    sentNotifications: [inApp, email],
  };
}