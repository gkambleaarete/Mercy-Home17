// Mentee Inactive toggle (US 20040). Inactive is an availability flag, not a
// pipeline stage: it never changes the stage, application or intake data.
//
// Confirming it ends the mentee's current mentor matches at one captured
// local instant. The Inactive flag and those closures are saved together in
// ONE storage write (commitFFMenteeAtomic); memory and subscribers change
// only after that write succeeds, so there is no partial state and no
// rollback write that could itself fail. The match store then applies the
// saved closures (and re-applies them on load if its own mirror write did
// not land). Kept in its own module so the mentee and match stores stay free
// of a circular runtime import.

import {
  commitFFMenteeAtomic,
  getFFMentee,
  type FFMatchClosure,
} from "./ffMenteeStore";
import {
  planMatchClosures,
  syncMentorMatchClosures,
  type MentorMatch,
} from "./mockMentorMatchData";
import { localStamp } from "./ffMenteeIntake";

/**
 * Prototype capability: whether the current staff user may change the
 * Inactive setting. The prototype has no authentication context, so this is
 * a fixed flag — production must replace it with a real permission check.
 */
export const FF_CAN_SET_MENTEE_INACTIVE = true;

export interface InactiveResult {
  ok: boolean;
  /** True when nothing needed to change (already in the requested state). */
  noop?: boolean;
  /** Why the action was refused before any change, if it was. */
  reason?: "not-found" | "storage";
  /** Matches ended by this action. */
  ended: MentorMatch[];
  /** Future-dated matches left unchanged (policy pending). */
  future: MentorMatch[];
  endDate?: string;
  endTime?: string;
}

/** Preview for the confirmation dialog. */
export function previewInactivation(menteeId: string) {
  return planMatchClosures(menteeId, new Date());
}

/**
 * Marks the mentee Inactive and ends their current matches — both durably
 * or neither. Confirming again for an already-inactive mentee is a no-op.
 * `now` is injectable for tests.
 */
export function confirmMenteeInactive(
  menteeId: string,
  now: Date = new Date(),
): InactiveResult {
  const mentee = getFFMentee(menteeId);
  if (!mentee)
    return {
      ok: false,
      reason: "not-found",
      ended: [],
      future: [],
    };
  if (mentee.inactive)
    return { ok: true, noop: true, ended: [], future: [] };

  const { date, time } = localStamp(now);
  const plan = planMatchClosures(menteeId, now);
  const closures: Record<string, FFMatchClosure> = {};
  for (const m of plan.toEnd)
    closures[m.id] = {
      endDate: date,
      endTime: time,
      at: now.getTime(),
    };

  const ok = commitFFMenteeAtomic(
    {
      ...mentee,
      inactive: true,
      inactiveChangedAt: `${date} ${time}`,
    },
    closures,
  );
  if (!ok)
    return {
      ok: false,
      reason: "storage",
      ended: [],
      future: plan.future,
    };

  syncMentorMatchClosures();
  return {
    ok: true,
    ended: plan.toEnd,
    future: plan.future,
    endDate: date,
    endTime: time,
  };
}

/** Clears Inactive (all-or-nothing). Ended matches stay ended; the stage
 *  is unchanged. Returns false when the change could not be saved. */
export function clearMenteeInactive(
  menteeId: string,
  now: Date = new Date(),
): boolean {
  const mentee = getFFMentee(menteeId);
  if (!mentee) return false;
  if (!mentee.inactive) return true;
  const { date, time } = localStamp(now);
  return commitFFMenteeAtomic({
    ...mentee,
    inactive: false,
    inactiveChangedAt: `${date} ${time}`,
  });
}