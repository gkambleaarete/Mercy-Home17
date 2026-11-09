import { useSyncExternalStore } from "react";
import { sendInAppNotification } from "../lib/academicSnapshotTask";
import {
  commitAdmissionsState,
  getAdmissionsState,
  getAdmissionsStateHealth,
  subscribeAdmissionsState,
  __resetAdmissionsStateForTest,
} from "./admissionsStateStore";
import { seedClosureData } from "./caseClosureSeed";

// Admissions case closure lifecycle (US 17573 revisions, 10/14/2026) — the
// single source both Projections & Waitlist and the Admissions Pipeline
// read, keyed by the Admissions case id (lead id, e.g. "L-016"):
//
//   1. closing    — the case entered closure. It leaves active Projections
//                   and the running Admissions Pipeline immediately and is
//                   shown on the dedicated Closing List.
//   2. eligible   — derived, not stored: 30+ days after closingStartedAt.
//                   One durable in-app notification is recorded per closure
//                   cycle. Eligibility is NOT archival or deletion.
//   3. finalized  — staff explicitly completed the closure. The case shows
//                   in the Admissions "Closed" category only.
//
// Persisted to this browser's localStorage so the timer and notifications
// survive reloads. Since US 20140 Chunk 3 the closure state is one slice of
// the authoritative Admissions snapshot (admissionsStateStore) together with
// the saved categories and their comment history: every write below goes
// through its single commit, so a failed save changes nothing (memory or
// storage) and a closure update never loses categories or history. The
// write functions return whether the change was saved; callers written
// before that (which ignore the result) keep working.
// Prototype only: a browser cannot process eligibility while the app is
// closed. Production needs a scheduled job + real notification delivery;
// sendInAppNotification below is the existing not-configured stub.

export const CLOSING_LIST_DAYS = 30;

export interface CaseClosure {
  caseId: string;
  name: string;
  /** When the case entered closure (ISO timestamp, or "YYYY-MM-DD" for
   *  seed/legacy records). Never reset by unrelated saves. */
  closingStartedAt: string;
  state: "closing" | "finalized";
  finalizedAt?: string;
  finalizedBy?: string;
  /** "seed" = mapped from prototype seed data on first load. */
  origin: "seed" | "user";
}

export interface ClosureNotification {
  /** `${caseId}|${closingStartedAt}` — one per closure cycle. */
  id: string;
  caseId: string;
  name: string;
  createdAt: string;
  message: string;
  read: boolean;
}

export type ClosureStatus =
  "closing" | "eligible" | "finalized";

export interface ClosureData {
  closures: Record<string, CaseClosure>;
  notifications: ClosureNotification[];
}

// ─── Pure helpers (clock injected) ──────────────────────────────────────────

function localDate(stamp: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(stamp)) {
    const [y, m, d] = stamp.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const t = new Date(stamp);
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}

/** Whole calendar days the case has been in closure as of `now`. */
export function daysInClosing(
  c: Pick<CaseClosure, "closingStartedAt">,
  now: Date,
): number {
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  return Math.max(
    0,
    Math.round(
      (today.getTime() -
        localDate(c.closingStartedAt).getTime()) /
        86_400_000,
    ),
  );
}

export function getClosureStatus(
  c: CaseClosure,
  now: Date,
): ClosureStatus {
  if (c.state === "finalized") return "finalized";
  return daysInClosing(c, now) >= CLOSING_LIST_DAYS
    ? "eligible"
    : "closing";
}

export function notificationId(c: CaseClosure): string {
  return `${c.caseId}|${c.closingStartedAt}`;
}

// ─── Store (a view over the authoritative snapshot) ─────────────────────────

export const subscribeCaseClosures = subscribeAdmissionsState;

export function getCaseClosureData(): ClosureData {
  return getAdmissionsState().closure;
}

export function useCaseClosures(): ClosureData {
  return useSyncExternalStore(
    subscribeCaseClosures,
    getCaseClosureData,
    getCaseClosureData,
  );
}

// ─── Planning (pure) ────────────────────────────────────────────────────────
// Used by the writers below and by the category change, which stages a
// closure effect inside its own single commit.

/** The next data for entering closure, or null when nothing would change
 *  (already closing/finalized — the original timestamp is kept). */
export function planCaseClosureStart(
  caseId: string,
  name: string,
  now: Date,
  from: ClosureData = getCaseClosureData(),
): ClosureData | null {
  if (from.closures[caseId]) return null;
  return {
    ...from,
    closures: {
      ...from.closures,
      [caseId]: {
        caseId,
        name,
        closingStartedAt: now.toISOString(),
        state: "closing",
        origin: "user",
      },
    },
  };
}

/** The next data for leaving Closed before finalization, or null when
 *  there is nothing to reopen (absent, or already finalized). */
export function planCaseClosureReopen(
  caseId: string,
  from: ClosureData = getCaseClosureData(),
): ClosureData | null {
  const c = from.closures[caseId];
  if (!c || c.state === "finalized") return null;
  const { [caseId]: _removed, ...rest } = from.closures;
  return { ...from, closures: rest };
}

/** Why the last closure write returned false, in words for the user. Call
 *  it right after a false result: an unreadable snapshot refuses every
 *  write (and keeps the saved data as it is); anything else is a failed
 *  storage write, after which nothing was changed. */
export function describeClosureSaveFailure(): string {
  return getAdmissionsStateHealth() !== "ok"
    ? "Saved closure data can't be read, so nothing was changed. The saved data has been left as it is."
    : "The closure change could not be saved. Nothing was changed. Your entries are kept — please try again.";
}

/** Commits a closure-only change. Categories and history ride along in the
 *  snapshot untouched. True when saved (or nothing needed saving). */
function commitClosure(
  plan: (c: ClosureData) => ClosureData | null,
): boolean {
  const r = commitAdmissionsState((s) => {
    const next = plan(s.closure);
    return { next: next ? { ...s, closure: next } : s };
  });
  return r.ok;
}

/** Starts closure. Idempotent: a case already closing or finalized keeps
 *  its original timestamp (re-saving Closed never resets the timer). */
export function startCaseClosure(
  caseId: string,
  name: string,
  now: Date,
): boolean {
  return commitClosure((c) =>
    planCaseClosureStart(caseId, name, now, c),
  );
}

/** The case was moved out of Closed before finalization. Its notification
 *  history is kept; a later closure starts a new cycle. */
export function reopenCaseClosure(caseId: string): boolean {
  return commitClosure((c) => planCaseClosureReopen(caseId, c));
}

/** Explicit staff action: persists Closed. Allowed at any point of the
 *  Closing List (eligibility is a prompt, not a precondition). */
export function finalizeCaseClosure(
  caseId: string,
  by: string,
  now: Date,
): boolean {
  return commitClosure((data) => {
    const c = data.closures[caseId];
    if (!c || c.state === "finalized") return null;
    return {
      ...data,
      closures: {
        ...data.closures,
        [caseId]: {
          ...c,
          state: "finalized",
          finalizedAt: now.toISOString(),
          finalizedBy: by,
        },
      },
    };
  });
}

export function markClosureNotificationsRead(): boolean {
  return commitClosure((data) =>
    data.notifications.every((n) => n.read)
      ? null
      : {
          ...data,
          notifications: data.notifications.map((n) => ({
            ...n,
            read: true,
          })),
        },
  );
}

/** Records one notification per closure cycle that has reached 30 days.
 *  Safe to call on every load / day rollover / focus: already-notified
 *  cycles are skipped. Returns the newly created notifications (none when
 *  nothing is due or the save failed). */
export function processClosureEligibility(
  now: Date,
): ClosureNotification[] {
  const r = commitAdmissionsState<ClosureNotification[]>(
    (s) => {
      const known = new Set(
        s.closure.notifications.map((n) => n.id),
      );
      const created: ClosureNotification[] = Object.values(
        s.closure.closures,
      )
        .filter(
          (c) =>
            getClosureStatus(c, now) === "eligible" &&
            !known.has(notificationId(c)),
        )
        .map((c) => ({
          id: notificationId(c),
          caseId: c.caseId,
          name: c.name,
          createdAt: now.toISOString(),
          message: `${c.name} has been on the Closing List for at least ${CLOSING_LIST_DAYS} days and is Eligible for Archive. Complete the closure when follow-up is done.`,
          read: false,
        }));
      if (created.length === 0)
        return { next: s, value: created };
      return {
        next: {
          ...s,
          closure: {
            ...s.closure,
            notifications: [
              ...created,
              ...s.closure.notifications,
            ],
          },
        },
        value: created,
      };
    },
  );
  if (!r.ok || !r.changed) return [];
  const created = r.value;
  // Integration point: no notification service exists yet (stub returns
  // "not_configured"). The record above is the durable in-app copy.
  created.forEach(
    (n) =>
      void sendInAppNotification({
        channel: "in-app",
        recipient: {
          id: "admissions-team",
          name: "Admissions Team",
          email: "",
        },
        content: {
          title: "Case Eligible for Archive",
          subject: "Case Eligible for Archive",
          youthName: n.name,
          details: [{ label: "Status", value: n.message }],
          ctaLabel: "Open Closing List",
        },
        link: "/projections-waitlist",
      }),
  );
  return created;
}

/** Test-only: replace the closure data (default: the seed). Categories and
 *  history are left as they are. */
export function __resetCaseClosuresForTest(
  next: ClosureData = seedClosureData(),
): void {
  const r = commitAdmissionsState((s) => ({
    next: { ...s, closure: next },
  }));
  // An unreadable snapshot refuses writes; a test reset starts clean.
  if (!r.ok && r.reason === "unreadable") {
    __resetAdmissionsStateForTest();
    commitAdmissionsState((s) => ({
      next: { ...s, closure: next },
    }));
  }
}