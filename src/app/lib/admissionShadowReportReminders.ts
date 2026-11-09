/**
 * Admission Shadow Report reminders + overdue escalation — integration point
 * (User Story 17656-D).
 *
 * Works on the existing Shadow Report tasks (admissionShadowReportTask.ts);
 * no other task is created. One evaluator decides, per OPEN task, which
 * reminder is due and records it on the task so each fires at most once.
 *
 *   - Timing constants          → confirm with BA (SLA not specified)
 *   - PROGRAM_DIRECTOR_BY_STAFF → replace with the staff → Program
 *                                 Director / AVP lookup
 *   - ADMISSIONS_MANAGER        → replace with the Admissions Manager lookup
 *   - sendInAppNotification     → the in-app notification API (shared stub)
 *   - useAdmissionShadowTaskReminders → a scheduled backend job
 */

import { useEffect } from "react";
import {
  sendInAppNotification,
  type NotificationResult,
  type TaskNotification,
} from "./academicSnapshotTask";
import type { StaffMember } from "./connectionSchedulingNotification";
import {
  ADMISSIONS_MANAGER,
  PROGRAM_DIRECTOR_MARIA_RODRIGUEZ,
  getAdmissionShadowReportTasks,
  updateAdmissionShadowReportTask,
  type AdmissionShadowReportTask,
} from "./admissionShadowReportTask";

// ─── Timing (prototype values; final SLA to be confirmed) ────────────────────
const HOUR_MS = 60 * 60 * 1000;
/** Pre-deadline nudge: this long before the task is due. */
export const PRE_DEADLINE_OFFSET_MS = 4 * HOUR_MS;
/** Overdue escalation: this long after the task is due, if still open. */
export const OVERDUE_OFFSET_MS = 1 * HOUR_MS;
/** How often the evaluator runs while the app is open. */
export const REMINDER_CHECK_INTERVAL_MS = 60 * 1000;

// ─── Escalation recipients ───────────────────────────────────────────────────
// Placeholder: reporter staff id → Program Director / AVP. Reporters not
// listed fall back to the default Program Director.
const PROGRAM_DIRECTOR_BY_STAFF: Record<string, StaffMember> = {
  "staff-jordan-smith": PROGRAM_DIRECTOR_MARIA_RODRIGUEZ,
};

export function getProgramDirectorOrAvp(staff: StaffMember): StaffMember {
  return (
    PROGRAM_DIRECTOR_BY_STAFF[staff.id] ?? PROGRAM_DIRECTOR_MARIA_RODRIGUEZ
  );
}

export type ShadowReportReminderKind =
  | "preDeadline"
  | "deadline"
  | "overdue";

const SENT_AT_FIELD = {
  preDeadline: "preDeadlineReminderSentAt",
  deadline: "deadlineReminderSentAt",
  overdue: "overdueEscalationSentAt",
} as const;

/**
 * The one reminder an OPEN task needs at `now`, or null. Highest applicable
 * wins (Overdue > Deadline > Pre-deadline), so after a reload or time jump
 * only the current reminder is sent, never the stale earlier ones.
 */
export function getDueShadowReportReminder(
  task: AdmissionShadowReportTask,
  now: Date,
): ShadowReportReminderKind | null {
  if (task.status !== "Open") return null;
  const due = new Date(task.dueAt).getTime();
  const t = now.getTime();
  if (task.overdueEscalationSentAt) return null;
  if (t >= due + OVERDUE_OFFSET_MS) return "overdue";
  if (task.deadlineReminderSentAt) return null;
  if (t >= due) return "deadline";
  if (task.preDeadlineReminderSentAt) return null;
  if (t >= due - PRE_DEADLINE_OFFSET_MS) return "preDeadline";
  return null;
}

/** Reporter only for the nudges; Reporter + Program Director/AVP +
 *  Admissions Manager for the escalation (each person once). */
export function getReminderRecipients(
  task: AdmissionShadowReportTask,
  kind: ShadowReportReminderKind,
): StaffMember[] {
  if (kind !== "overdue") return [task.assignedTo];
  const all = [
    task.assignedTo,
    getProgramDirectorOrAvp(task.assignedTo),
    ADMISSIONS_MANAGER,
  ];
  return all.filter((s, i) => all.findIndex((x) => x.id === s.id) === i);
}

const TITLES: Record<ShadowReportReminderKind, string> = {
  preDeadline: "Admission Shadow Report Due Soon",
  deadline: "Admission Shadow Report Due",
  overdue: "Admission Shadow Report Overdue",
};

/** One in-app notification per recipient, all carrying the task's context
 *  and links (taken from the task, not rebuilt). */
export function buildShadowReportReminderNotifications(
  task: AdmissionShadowReportTask,
  kind: ShadowReportReminderKind,
): TaskNotification[] {
  const due = `${task.dueDate} ${task.dueTime}`;
  const message = {
    preDeadline: `Complete the Admission Shadow Report for ${task.youth.name}. The report is due ${due}.`,
    deadline: `The Admission Shadow Report for ${task.youth.name} is due now.`,
    overdue: `The Admission Shadow Report for ${task.youth.name} was due ${due} and is overdue. Assigned to ${task.assignedTo.name}.`,
  }[kind];
  return getReminderRecipients(task, kind).map((recipient) => ({
    channel: "in-app" as const,
    recipient,
    content: {
      title: TITLES[kind],
      subject: message,
      youthName: task.youth.name,
      details: [
        { label: "Task", value: task.subject },
        { label: "Youth", value: task.youth.name },
        { label: "Connection", value: task.connectionDateTime },
        { label: "Due", value: due },
        { label: "Youth Profile", value: task.youthProfileLink },
      ],
      ctaLabel: "View Connection →",
    },
    link: task.connectionLink,
  }));
}

export interface ShadowReportReminderEvent {
  taskId: string;
  connectionId: string;
  kind: ShadowReportReminderKind;
  notifications: TaskNotification[];
  results: NotificationResult[];
  sentAt: string;
}

// Prototype record of reminders sent (replace with notification history).
const reminderEvents: ShadowReportReminderEvent[] = [];
export function getShadowReportReminderEvents(): ShadowReportReminderEvent[] {
  return [...reminderEvents];
}

/**
 * Checks every OPEN Shadow Report task and sends each one's currently due
 * reminder. The sent time is recorded on the task before sending, so a
 * repeated or overlapping run never sends the same reminder twice.
 */
export async function evaluateAdmissionShadowTaskReminders(
  now: Date = new Date(),
): Promise<ShadowReportReminderEvent[]> {
  const sent: ShadowReportReminderEvent[] = [];
  for (const task of getAdmissionShadowReportTasks()) {
    const kind = getDueShadowReportReminder(task, now);
    if (!kind) continue;
    const sentAt = now.toISOString();
    updateAdmissionShadowReportTask(task.connectionId, {
      [SENT_AT_FIELD[kind]]: sentAt,
    });
    const notifications = buildShadowReportReminderNotifications(task, kind);
    const results = await Promise.all(
      notifications.map((n) => sendInAppNotification(n)),
    );
    const event = {
      taskId: task.id,
      connectionId: task.connectionId,
      kind,
      notifications,
      results,
      sentAt,
    };
    reminderEvents.push(event);
    sent.push(event);
  }
  return sent;
}

/** Runs the evaluator on mount and once a minute (one timer for all tasks).
 *  `onSent` lets the app surface what was sent. Mount once, app-wide. */
export function useAdmissionShadowTaskReminders(
  onSent?: (events: ShadowReportReminderEvent[]) => void,
): void {
  useEffect(() => {
    const run = () =>
      void evaluateAdmissionShadowTaskReminders().then((events) => {
        if (events.length) onSent?.(events);
      });
    run();
    const timer = setInterval(run, REMINDER_CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}