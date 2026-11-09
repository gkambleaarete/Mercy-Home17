// Mentor Inactive toggle (US 20039 Chunk 10). Inactive is an availability
// setting on the canonical mentor (applicant id), shared by every
// application they have — not a stage. It never changes stages, submitted
// answers, checklist results or document reviews.
//
// Same approach as the mentee Inactive action (ffMenteeInactive.ts):
// confirming re-reads the mentor's matches, then saves the Inactive flag
// and the closures of every active match in ONE storage write. The match
// store applies those closures (and re-applies them on load if its own
// mirror write didn't land), so there is no partial state.

import {
  commitFFMentorAvailability,
  getFFActingUser,
  getFFMentorAvailability,
} from "./ffMentorApplicationStore";
import type {
  FFActor,
  FFMentorMatchClosure,
} from "./ffMentorApplication";
import {
  getMentorMatchSourceStatus,
  planMentorMatchClosures,
  refreshMentorMatchesFromStorage,
  syncMentorMatchClosures,
  type MentorMatch,
} from "./mockMentorMatchData";
import { localStamp } from "./ffMenteeIntake";

export const FF_MENTOR_INACTIVE_REASON =
  "Mentor marked inactive";

export type FFMentorInactiveResult =
  | {
      ok: true;
      noop?: boolean;
      ended: MentorMatch[];
      future: MentorMatch[];
      endDate?: string;
      endTime?: string;
    }
  | {
      ok: false;
      reason:
        | "missing"
        | "storage"
        | "actor"
        | "matches-unavailable"
        | "conflict"
        | "invalid"
        | "business-reference-limit";
    };

/** Preview for the confirmation: which matches would end now. */
export function previewFFMentorInactivation(
  mentorId: string,
  now = new Date(),
) {
  return {
    sourceAvailable: getMentorMatchSourceStatus() === "ok",
    ...planMentorMatchClosures(mentorId, now),
  };
}

/**
 * Marks the mentor Inactive and ends their active matches — both durably or
 * neither. Refused while the match list can't be read (that isn't "no
 * matches"). Already-ended and not-yet-started matches are left unchanged.
 */
export function confirmFFMentorInactive(
  mentorId: string,
  actor: FFActor | null = getFFActingUser(),
  now: Date = new Date(),
): FFMentorInactiveResult {
  // Re-read the current matches; an unreadable list isn't "no matches".
  if (refreshMentorMatchesFromStorage() !== "ok")
    return { ok: false, reason: "matches-unavailable" };
  if (
    getFFMentorAvailability(mentorId).inactive &&
    getFFMentorAvailability(mentorId).source === "mentor"
  )
    return { ok: true, noop: true, ended: [], future: [] };
  const plan = planMentorMatchClosures(mentorId, now);
  const { date, time } = localStamp(now);
  const closures: Record<string, FFMentorMatchClosure> = {};
  for (const m of plan.toEnd)
    closures[m.id] = {
      mentorId,
      endDate: date,
      endTime: time,
      at: now.getTime(),
      reason: FF_MENTOR_INACTIVE_REASON,
      by: actor?.name ?? "",
      byId: actor?.id ?? "",
    };
  const r = commitFFMentorAvailability(mentorId, {
    inactive: true,
    closures,
    actor,
    now,
  });
  if (!r.ok) return { ok: false, reason: r.reason };
  syncMentorMatchClosures();
  return {
    ok: true,
    ended: plan.toEnd,
    future: plan.future,
    endDate: date,
    endTime: time,
  };
}

/**
 * Clears Inactive. Ended matches stay ended, no match is created, and the
 * stage doesn't move — the mentor appears for matching only when every
 * other requirement is met.
 */
export function clearFFMentorInactive(
  mentorId: string,
  actor: FFActor | null = getFFActingUser(),
  now: Date = new Date(),
): FFMentorInactiveResult {
  if (!getFFMentorAvailability(mentorId).inactive)
    return { ok: true, noop: true, ended: [], future: [] };
  const r = commitFFMentorAvailability(mentorId, {
    inactive: false,
    actor,
    now,
  });
  return r.ok
    ? { ok: true, ended: [], future: [] }
    : { ok: false, reason: r.reason };
}