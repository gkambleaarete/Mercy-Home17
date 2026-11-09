import { parseConnectionStart } from "../components/admissions/connectionStatusRules";

// Friends First Info Session (US 20145) — pure rules shared by the staff
// Add Connection modal, the session store and (when it is wired in) the VMS
// applicant portal. No state here.

export const FRIENDS_FIRST_INFO_SESSION_TYPE =
  "Friends First Info Session";

/** Existing non-constituent role (connectionParticipantOptions). */
export const FRIENDS_FIRST_MENTOR_ROLE = "Friends First Mentor";

export interface FFSessionDraftFields {
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  location?: string;
  locationOther?: string;
}

export type FFSessionField =
  | "startDate"
  | "startTime"
  | "endDate"
  | "endTime"
  | "location"
  | "locationOther"
  | "range";

export type FFSessionErrors = Partial<
  Record<FFSessionField, string>
>;

const blank = (v?: string) => !v || !v.trim();

/** Strict MM/DD/YYYY (the DateInput format) — rejects 02/31 etc. */
function isRealDate(value?: string): boolean {
  const m = value
    ?.trim()
    .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return false;
  const d = new Date(+m[3], +m[1] - 1, +m[2]);
  return (
    d.getFullYear() === +m[3] &&
    d.getMonth() === +m[1] - 1 &&
    d.getDate() === +m[2]
  );
}

/** Same check for the TimeInput value ("h:mm AM/PM", or 24h "HH:mm"). */
function isRealTime(value?: string): boolean {
  const m = value
    ?.trim()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return false;
  const h = +m[1];
  const min = +m[2];
  if (min > 59) return false;
  return m[3] ? h >= 1 && h <= 12 : h <= 23;
}

/** Required fields and chronological order. An empty result means the
 *  draft may be saved. Participants and attendance are never required, so
 *  a future session can be saved before any applicant registers. */
export function validateFriendsFirstSession(
  d: FFSessionDraftFields,
): FFSessionErrors {
  const errors: FFSessionErrors = {};
  const pairs: [FFSessionField, FFSessionField, string][] = [
    ["startDate", "startTime", "Start"],
    ["endDate", "endTime", "End"],
  ];
  for (const [dateKey, timeKey, label] of pairs) {
    const date = d[dateKey as "startDate" | "endDate"];
    const time = d[timeKey as "startTime" | "endTime"];
    if (blank(date))
      errors[dateKey] = `${label} Date is required.`;
    else if (!isRealDate(date))
      errors[dateKey] = `Enter ${label} Date as MM/DD/YYYY.`;
    if (blank(time))
      errors[timeKey] = `${label} Time is required.`;
    else if (!isRealTime(time))
      errors[timeKey] = `Enter a valid ${label} Time.`;
  }
  if (blank(d.location))
    errors.location = "Location is required.";
  else if (d.location === "Other" && blank(d.locationOther))
    errors.locationOther = "Specify the location.";

  if (
    !errors.startDate &&
    !errors.startTime &&
    !errors.endDate &&
    !errors.endTime
  ) {
    const start = parseConnectionStart(
      d.startDate,
      d.startTime,
    );
    const end = parseConnectionStart(d.endDate, d.endTime);
    if (start && end && end < start)
      errors.range =
        "End Date/Time cannot be earlier than Start Date/Time.";
  }
  return errors;
}

/** The first message to surface in a toast, in form order. */
export function firstFriendsFirstSessionError(
  errors: FFSessionErrors,
): string | undefined {
  const order: FFSessionField[] = [
    "startDate",
    "startTime",
    "endDate",
    "endTime",
    "range",
    "location",
    "locationOther",
  ];
  const key = order.find((k) => errors[k]);
  return key ? errors[key] : undefined;
}

// ─── Applicant-facing rules ─────────────────────────────────────────────────

export interface FFSessionLike extends FFSessionDraftFields {
  id: string;
  type: string;
  status?: string;
  participantList?: FFParticipantLike[];
}

export interface FFParticipantLike {
  constituentType?: string;
  entityId?: string;
  role?: string;
  attended?: boolean | null;
}

/** A session an applicant may still register for: a Friends First Info
 *  Session that is Scheduled and has not started. Past, Completed,
 *  Incomplete and Cancelled sessions are excluded. */
export function isOpenForApplicantRegistration(
  s: FFSessionLike,
  now: Date = new Date(),
): boolean {
  if (s.type !== FRIENDS_FIRST_INFO_SESSION_TYPE) return false;
  if (s.status !== "Scheduled") return false;
  const start = parseConnectionStart(s.startDate, s.startTime);
  return !!start && start > now;
}

/** Eligible sessions for the applicant picker, soonest first. */
export function listEligibleFriendsFirstSessions<
  T extends FFSessionLike,
>(sessions: T[], now: Date = new Date()): T[] {
  const startOf = (s: T) =>
    parseConnectionStart(s.startDate, s.startTime)!.getTime();
  return sessions
    .filter((s) => isOpenForApplicantRegistration(s, now))
    .sort((a, b) => startOf(a) - startOf(b));
}

/** The attendance prerequisite for the Friends First application: the
 *  applicant's OWN participant record (matched by stable applicant/account
 *  ID) shows Attended = Yes at a non-cancelled Friends First Info Session.
 *  Registration, an elapsed start time and the session's Completed status
 *  do not count on their own — unmarked (null) and absent (false) keep the
 *  application locked. */
export function hasQualifyingFriendsFirstAttendance(
  sessions: FFSessionLike[],
  applicantId: string,
): boolean {
  if (!applicantId) return false;
  return sessions.some(
    (s) =>
      s.type === FRIENDS_FIRST_INFO_SESSION_TYPE &&
      s.status !== "Cancelled" &&
      (s.participantList ?? []).some(
        (p) =>
          p.constituentType === "Non-Constituent" &&
          p.entityId === applicantId &&
          p.role === FRIENDS_FIRST_MENTOR_ROLE &&
          p.attended === true,
      ),
  );
}