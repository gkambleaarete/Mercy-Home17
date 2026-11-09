import {
  useEffect,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { Connection } from "./ConnectionFormDialog";

// Connection status automation (US 17658). Pure rules + one hook, so the
// automatic Scheduled → Incomplete change is decided in exactly one place
// (applyAutomaticConnectionStatus) — the spot to record audit data later.

const hasText = (v?: string) => !!v && v.trim().length > 0;
const hasAny = (v?: string[]) => !!v && v.length > 0;
const otherFilled = (selected?: string[], other?: string) =>
  !selected?.includes("Other") || hasText(other);

/** Every Shadow Report field is filled; "Other" text required only when
 *  Other is selected. Whitespace-only text counts as blank. */
export function isAdmissionsShadowReportComplete(
  c: Partial<Connection>,
): boolean {
  return (
    hasText(c.shadowMostSignificantStrength) &&
    hasText(c.shadowPeerInteractions) &&
    hasText(c.shadowStaffInteractions) &&
    hasText(c.shadowBehaviorConcerns) &&
    hasAny(c.shadowExcelledStructures) &&
    otherFilled(
      c.shadowExcelledStructures,
      c.shadowExcelledOther,
    ) &&
    hasAny(c.shadowStruggledStructures) &&
    otherFilled(
      c.shadowStruggledStructures,
      c.shadowStruggledOther,
    ) &&
    hasText(c.shadowParticipationLevel) &&
    hasAny(c.shadowMood) &&
    hasAny(c.shadowInteractionStyle) &&
    hasText(c.shadowAdditionalComments) &&
    hasText(c.shadowOverallEvaluation)
  );
}

/** FPM documentation = its Summary. The FPM Summary field is saved on the
 *  record as `transitionMeetingSummary` (existing save mapping). */
export function isFpmDocumentationComplete(
  c: Partial<Connection>,
): boolean {
  return hasText(c.transitionMeetingSummary);
}

// ─── Submitted/Finalized eligibility (US 17658-D) ───────────────────────────
// Eligibility only — nothing here ever sets Submitted/Finalized; the user must.

/** Minimal participant shape needed for attendance checks. Attended is
 *  true = Yes, false = No, null = blank. */
export interface ParticipantAttendance {
  role: string;
  attended: boolean | null;
}

export interface FinalizationBlocker {
  message: string;
  /** Tab holding the field the user must fix. */
  tab: "connection" | "details";
}

/** At least one Youth participant, and every Youth row Attended = Yes. */
export function hasYouthAttended(
  participants: ParticipantAttendance[],
): boolean {
  const youth = participants.filter((p) => p.role === "Youth");
  return (
    youth.length > 0 && youth.every((p) => p.attended === true)
  );
}

/** Every Parent/Guardian currently on the meeting Attended = Yes. Only rows
 *  present on the record count, so a removed parent never blocks; none
 *  present passes. */
export function haveParentGuardiansAttended(
  participants: ParticipantAttendance[],
): boolean {
  return participants
    .filter((p) => p.role === "Parent/Guardian")
    .every((p) => p.attended === true);
}

const YOUTH_ATTENDANCE_BLOCKER: FinalizationBlocker = {
  message:
    "The Youth participant must have Attended = Yes before setting Status to Submitted/Finalized.",
  tab: "connection",
};

/** First reason this Connection cannot be saved as Submitted/Finalized, or
 *  null when eligible (or when the type has no finalization rules). */
export function getFinalizationBlocker(
  c: Partial<Connection>,
  participants: ParticipantAttendance[],
): FinalizationBlocker | null {
  if (c.type === "Admissions Shadow") {
    if (!isAdmissionsShadowReportComplete(c))
      return {
        message:
          "Complete all Shadow Report fields before setting Status to Submitted/Finalized.",
        tab: "details",
      };
    if (!hasYouthAttended(participants))
      return YOUTH_ATTENDANCE_BLOCKER;
  }
  if (c.type === "Family Partnership Meeting") {
    if (!isFpmDocumentationComplete(c))
      return {
        message:
          "Complete the Summary before setting Status to Submitted/Finalized.",
        tab: "details",
      };
    if (!hasYouthAttended(participants))
      return YOUTH_ATTENDANCE_BLOCKER;
    if (!haveParentGuardiansAttended(participants))
      return {
        message:
          "All Parent/Guardian participants must have Attended = Yes before setting Status to Submitted/Finalized.",
        tab: "connection",
      };
  }
  return null;
}

/** Start Date ("MM/DD/YYYY") + Start Time ("h:mm AM/PM" or 24h "HH:mm") as
 *  a local Date; a blank time means start of day. Null when unparseable. */
export function parseConnectionStart(
  startDate?: string,
  startTime?: string,
): Date | null {
  const d = startDate?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!d) return null;
  let hours = 0;
  let minutes = 0;
  if (hasText(startTime)) {
    const t = startTime!
      .trim()
      .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!t) return null;
    hours = +t[1];
    minutes = +t[2];
    const ap = t[3]?.toUpperCase();
    if (ap === "PM" && hours !== 12) hours += 12;
    if (ap === "AM" && hours === 12) hours = 0;
  }
  const date = new Date(
    +d[3],
    +d[1] - 1,
    +d[2],
    hours,
    minutes,
  );
  return isNaN(date.getTime()) ? null : date;
}

const DOCUMENTATION_COMPLETE: Record<
  string,
  (c: Partial<Connection>) => boolean
> = {
  "Admissions Shadow": isAdmissionsShadowReportComplete,
  "Family Partnership Meeting": isFpmDocumentationComplete,
};

/** The status the system should show now. Only Scheduled → Incomplete is
 *  automatic, and only for Admissions Shadow / FPM whose start has passed
 *  with documentation incomplete; every other status is left as-is. */
export function getAutomaticConnectionStatus(
  c: Partial<Connection>,
  now: Date = new Date(),
): Connection["status"] {
  const isComplete = c.type
    ? DOCUMENTATION_COMPLETE[c.type]
    : undefined;
  if (c.status !== "Scheduled" || !isComplete) return c.status;
  const start = parseConnectionStart(c.startDate, c.startTime);
  if (!start || start > now || isComplete(c)) return c.status;
  return "Incomplete";
}

/** Same record when nothing changes, so callers can bail out cheaply. */
export function applyAutomaticConnectionStatus(
  c: Connection,
  now: Date = new Date(),
): Connection {
  const status = getAutomaticConnectionStatus(c, now);
  return status === c.status ? c : { ...c, status };
}

const CHECK_INTERVAL_MS = 60_000;

/** Applies the automatic status to a Connection list on load, whenever the
 *  list changes (e.g. after a save), and once a minute while mounted. The
 *  updater returns the same array when nothing changed, so React bails out
 *  and no extra render (or loop) happens. */
export function useAutomaticConnectionStatus(
  connections: Connection[],
  setConnections: Dispatch<SetStateAction<Connection[]>>,
): void {
  useEffect(() => {
    const check = () =>
      setConnections((prev) => {
        const now = new Date();
        let changed = false;
        const next = prev.map((c) => {
          const updated = applyAutomaticConnectionStatus(
            c,
            now,
          );
          if (updated !== c) changed = true;
          return updated;
        });
        return changed ? next : prev;
      });
    check();
    const timer = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [connections, setConnections]);
}