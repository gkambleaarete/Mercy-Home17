// New-match mentor candidates (US 20039 Chunk 10) — one selector for Mentor
// Search and the Mentor Match picker. A candidate must be eligible (Chunk 9
// checklist), at the saved stage Ready for Match, and not Inactive. Older
// demo mentors have no verified checklist, so they are never candidates.

import {
  getFFMentorAvailability,
  getFFMentorReadiness,
  listFFMentorApplications,
  ffMentorIdOf,
  coordinatorName,
  getFFMentorApplicationStaff,
} from "./ffMentorApplicationStore";
import { FF_SUB_PROGRAM_NAME } from "./ffMentorApplication";
import type { FFSubProgramme } from "./mockFriendsFirstData";
import {
  createMentorMatch,
  type MentorMatch,
} from "./mockMentorMatchData";

export interface FFMentorCandidate {
  /** Canonical mentor id (applicant id) — what a match stores. */
  mentorId: string;
  /** The first qualifying application (record link). */
  applicationId: string;
  /** Every qualifying application and its sub-programs. */
  qualifying: {
    applicationId: string;
    subProgrammes: FFSubProgramme[];
  }[];
  name: string;
  email: string;
  subProgrammes: FFSubProgramme[];
  stage: string;
  submittedAt: string;
  coordinator: string;
}

/** Eligible, Ready for Match and not Inactive — one row per mentor. */
export function listFFMentorCandidates(
  now?: Date,
): FFMentorCandidate[] {
  const byMentor = new Map<string, FFMentorCandidate>();
  for (const app of listFFMentorApplications()) {
    const mentorId = ffMentorIdOf(app);
    if (getFFMentorAvailability(mentorId).inactive) continue;
    const readiness = getFFMentorReadiness(
      app.applicationId,
      now,
    );
    if (!readiness?.readyForMatch) continue;
    const programs = app.subPrograms.map(
      (p) => FF_SUB_PROGRAM_NAME[p],
    );
    const existing = byMentor.get(mentorId);
    if (existing) {
      // Another qualifying application for the same mentor.
      existing.qualifying.push({
        applicationId: app.applicationId,
        subProgrammes: programs,
      });
      for (const p of programs)
        if (!existing.subProgrammes.includes(p))
          existing.subProgrammes.push(p);
      continue;
    }
    const o = app.answers.overview;
    const staff = getFFMentorApplicationStaff(
      app.applicationId,
    );
    byMentor.set(mentorId, {
      mentorId,
      applicationId: app.applicationId,
      qualifying: [
        {
          applicationId: app.applicationId,
          subProgrammes: programs,
        },
      ],
      name:
        [o.firstName, o.lastName].filter(Boolean).join(" ") ||
        mentorId,
      email: o.email,
      subProgrammes: [...programs],
      stage: staff.stage ?? "",
      submittedAt: app.submittedAt,
      coordinator:
        coordinatorName(staff.coordinatorId) ?? "Not assigned",
    });
  }
  return [...byMentor.values()];
}

/** Rechecked from current data — never from an earlier rendered list. */
export function isFFMentorMatchCandidate(
  mentorId: string,
  now?: Date,
): boolean {
  return listFFMentorCandidates(now).some(
    (c) => c.mentorId === mentorId,
  );
}

/** The current candidate record for one mentor, if they still qualify. */
export function getFFMentorCandidate(
  mentorId: string,
  now?: Date,
): FFMentorCandidate | undefined {
  return listFFMentorCandidates(now).find(
    (c) => c.mentorId === mentorId,
  );
}

/**
 * The sub-program to use for a new match, or undefined when it must be
 * chosen: only when exactly one qualifying sub-program exists.
 */
export function autoMatchSubProgram(
  c: FFMentorCandidate | undefined,
): FFSubProgramme | undefined {
  return c && c.subProgrammes.length === 1
    ? c.subProgrammes[0]
    : undefined;
}

/**
 * Creates a new mentor match only if, right now, the mentor is still a
 * candidate and the chosen sub-program belongs to one of their qualifying
 * applications (which is recorded on the match).
 */
export function createMentorMatchForCandidate(
  draft: Omit<MentorMatch, "id" | "applicationId">,
):
  | { ok: true; match: MentorMatch }
  | { ok: false; reason: "not-candidate" | "sub-program" }
  | { ok: false; reason: "save"; message: string } {
  const c = getFFMentorCandidate(draft.mentorId);
  if (!c) return { ok: false, reason: "not-candidate" };
  const app = c.qualifying.find((q) =>
    q.subProgrammes.includes(draft.subProgram),
  );
  if (!app) return { ok: false, reason: "sub-program" };
  const r = createMentorMatch({
    ...draft,
    applicationId: app.applicationId,
  });
  return r.ok
    ? { ok: true, match: r.match }
    : { ok: false, reason: "save", message: r.message };
}