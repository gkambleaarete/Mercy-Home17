// Mentor Search directory (US 19877) — mentors who have entered the mentoring
// program, as opposed to ffMentorCandidates.ts, which selects who can be
// offered a NEW match. The match-candidate selector and its safety gates are
// not touched: a mentor can be in the directory and still be ineligible for a
// new match.
//
// A directory member is, on the canonical mentor identity (applicant id):
//   - not Inactive (the shared mentor-level availability decision), and
//   - on at least one application with the saved applicant status Approved
//     (applicantStatus === "approved" — the explicit saved approval), at a
//     saved stage of Ready for Match, Matched or Active.
// The stage is an onboarding filter, never approval evidence, and a status is
// never inferred from a stage. The current readiness checklist is NOT a
// membership condition: an approved mentor whose requirement later fails or
// becomes unknown stays listed, carrying a readiness warning for staff.

import {
  coordinatorName,
  getFFMentorApplication,
  getFFMentorApplicationStaff,
  getFFMentorAvailability,
  getFFMentorReadiness,
  listFFMentorApplications,
  ffMentorIdOf,
} from "./ffMentorApplicationStore";
import {
  FF_SUB_PROGRAM_NAME,
  type FFMentorPipelineStage,
} from "./ffMentorApplication";
import {
  FF_MENTOR_SEARCH_STAGES,
  type FFMentor,
} from "./mockFriendsFirstData";
import type { FFMentorApplication } from "./ffMentorApplication";
import type { FFMentorCandidate } from "./ffMentorCandidates";

/** Saved stages at which an approved mentor belongs in the directory. */
export const FF_DIRECTORY_STAGES: readonly FFMentorPipelineStage[] =
  ["Ready for Match", "Matched", "Active"];

/** One row per mentor; same shape as a match candidate, but never used to
 *  create a match. */
export interface FFMentorDirectoryEntry extends FFMentorCandidate {
  /** Current readiness problems across the qualifying applications
   *  (empty when every requirement is met). */
  readinessWarnings: string[];
}

export function listFFMentorDirectory(
  now?: Date,
): FFMentorDirectoryEntry[] {
  const byMentor = new Map<string, FFMentorDirectoryEntry>();
  for (const app of listFFMentorApplications()) {
    const mentorId = ffMentorIdOf(app);
    if (getFFMentorAvailability(mentorId).inactive) continue;
    if (app.applicantStatus !== "approved") continue;
    const staff = getFFMentorApplicationStaff(
      app.applicationId,
    );
    if (
      !staff.stage ||
      !FF_DIRECTORY_STAGES.includes(staff.stage)
    )
      continue;
    const readiness = getFFMentorReadiness(
      app.applicationId,
      now,
    );
    // Unreadable readiness is a warning, not a removal.
    const warnings = readiness
      ? readiness.eligible
        ? []
        : readiness.reasons.length
          ? readiness.reasons
          : ["Match readiness has not been verified."]
      : ["Match readiness could not be read."];
    const programs = app.subPrograms.map(
      (p) => FF_SUB_PROGRAM_NAME[p],
    );
    const existing = byMentor.get(mentorId);
    if (existing) {
      // Another qualifying application for the same mentor: one row.
      existing.qualifying.push({
        applicationId: app.applicationId,
        subProgrammes: programs,
      });
      for (const p of programs)
        if (!existing.subProgrammes.includes(p))
          existing.subProgrammes.push(p);
      for (const w of warnings)
        if (!existing.readinessWarnings.includes(w))
          existing.readinessWarnings.push(w);
      continue;
    }
    const o = app.answers.overview;
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
      stage: staff.stage,
      submittedAt: app.submittedAt,
      coordinator:
        coordinatorName(staff.coordinatorId) ?? "Not assigned",
      readinessWarnings: [...warnings],
    });
  }
  return [...byMentor.values()];
}

/** What Mentor Search shows for an older seeded mentor, resolved through the
 *  same saved application / staff state as the record page. */
export interface LegacyMentorDirectoryState {
  /** The saved application answers (staff corrections included), when the
   *  application can be read; the row falls back to the seed otherwise. */
  application: FFMentorApplication | null;
  inDirectory: boolean;
  /** Saved pipeline stage; the seed's own label where none maps. */
  stage: string;
  /** Saved coordinator (by id); the seed's display name where none is saved. */
  coordinator: string;
}

/**
 * Seeded demo mentors predate the readiness checklist, so their evidence is
 * their stored approval: status Approved at an onboarded stage. An applicant
 * still under review is not part of the directory. A saved stage or
 * coordinator wins over the seed's; the mentor-level Inactive setting removes
 * the mentor, as it does for submitted mentors. Resolved by the mentor's own
 * id — never by name.
 */
export function resolveLegacyMentorForDirectory(
  m: FFMentor,
): LegacyMentorDirectoryState {
  const lookup = getFFMentorApplication(m.id);
  const staff = getFFMentorApplicationStaff(m.id);
  const approved =
    lookup.status === "found"
      ? lookup.application.applicantStatus === "approved"
      : m.status === "approved";
  const stage = staff.stage ?? m.stage;
  return {
    application:
      lookup.status === "found" ? lookup.application : null,
    inDirectory:
      approved &&
      !getFFMentorAvailability(m.id).inactive &&
      !!staff.stage &&
      FF_DIRECTORY_STAGES.includes(staff.stage),
    stage,
    coordinator:
      coordinatorName(staff.coordinatorId) ?? m.coordinator,
  };
}

export function isLegacyMentorInDirectory(
  m: FFMentor,
): boolean {
  return resolveLegacyMentorForDirectory(m).inDirectory;
}