// Instructor profile → Class Sessions (US 20096): pure helpers for scoping
// sessions to one Instructor constituent, searching them, and summarizing
// attendance. Type-only imports keep this module free of UI code.

import type {
  ClassSession,
  SessionParticipant,
} from "../components/pages/Classes";
import {
  INSTRUCTOR_CONSTITUENT_LINKS,
  constituentInstructorId,
} from "./instructorConstituentLinks";

/** Sessions where at least one instructor is this Constituent: via the
 *  explicit Classes-id map, or the constituent's own instructor id. */
export function sessionsForInstructorConstituent(
  sessions: ClassSession[],
  constituentId: number,
  links: Readonly<
    Record<string, number>
  > = INSTRUCTOR_CONSTITUENT_LINKS,
): ClassSession[] {
  return sessions.filter((s) =>
    s.instructors.some(
      (i) =>
        links[i.id] === constituentId ||
        i.id === constituentInstructorId(constituentId),
    ),
  );
}

/** Case-insensitive match on session ID or class name. Blank → all rows. */
export function searchInstructorSessions<
  T extends { id: string; className: string },
>(rows: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(
    (r) =>
      r.id.toLowerCase().includes(q) ||
      r.className.toLowerCase().includes(q),
  );
}

export interface AttendanceSummary {
  attended: number;
  notAttended: number;
  unmarked: number;
  total: number;
}

// PROTOTYPE ASSUMPTION (pending BA review): a session's Attendance is the
// count of its participants by recorded value — true = Attended,
// false = Not Attended, null = Unmarked. Unmarked is never counted as
// absent, and session status is never used to infer attendance.
export function summarizeAttendance(
  participants: Pick<SessionParticipant, "attended">[],
): AttendanceSummary {
  const s = {
    attended: 0,
    notAttended: 0,
    unmarked: 0,
    total: 0,
  };
  for (const p of participants) {
    s.total++;
    if (p.attended === true) s.attended++;
    else if (p.attended === false) s.notAttended++;
    else s.unmarked++;
  }
  return s;
}

export function formatAttendance(s: AttendanceSummary): string {
  if (s.total === 0) return "No participants";
  return `${s.attended} Attended · ${s.notAttended} Not Attended · ${s.unmarked} Unmarked`;
}