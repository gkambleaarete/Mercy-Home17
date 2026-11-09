import { useSyncExternalStore } from "react";
import {
  FRIENDS_FIRST_INFO_SESSION_TYPE,
  FRIENDS_FIRST_MENTOR_ROLE,
  firstFriendsFirstSessionError,
  isOpenForApplicantRegistration,
  validateFriendsFirstSession,
} from "../lib/friendsFirstSession";

// Friends First Info Sessions (US 20145) — one shared record per session,
// keyed by its OWN stable session ID (FFIS-0001, …), never by a youth. Staff
// (Connections) and the applicant portal (VMS) must read and write this
// same list, so a registration lands on the session staff see and mark
// attendance on.
//
// PROTOTYPE STATE: in memory only — survives in-app navigation, not a page
// reload, and is NOT shared with the separate VMS app. Replace the three
// write functions' bodies (create / update / register) with the shared
// backend API; their `WriteResult` contract already carries a failure path
// so callers report success only after the write succeeds.
export const FRIENDS_FIRST_SESSION_PERSISTENCE =
  "in-memory-prototype" as const;

export interface FFSessionParticipant {
  /** Row id used by the participant table. */
  id: number;
  /** Stable identity of this participant row on this session. */
  uid: string;
  constituentType: "Constituent" | "Non-Constituent";
  participant: string;
  role: string;
  attended: boolean | null;
  reasonMissed: string;
  attendanceNotes?: string;
  otherReasonDetails?: string;
  isOrganizer?: boolean;
  /** Stable linked identity: Constituent ID, or the applicant/account ID
   *  for a VMS registration. */
  entityId?: string;
  /** Store version in which this row was first saved (merge safety). */
  addedInVersion?: number;
  source?: "staff" | "applicant-registration";
}

/** Connection-shaped, so the Connections list/table renders it as-is. */
export interface FriendsFirstSession {
  id: string;
  type: typeof FRIENDS_FIRST_INFO_SESSION_TYPE;
  status:
    "Scheduled" | "Completed" | "Cancelled" | "Incomplete";
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  locationOther?: string;
  comments: string;
  participantList: FFSessionParticipant[];
  /** Derived, for the Connections table. */
  participants: string;
  attended: boolean;
  programs: string;
  homeVisit: boolean;
  /** Bumped by every write; lets an editor detect a concurrent change. */
  version: number;
}

export type FFSessionDraft = Partial<
  Omit<
    FriendsFirstSession,
    "id" | "type" | "version" | "participantList"
  >
> & {
  /** `uid` is assigned on save when a row does not have one yet. */
  participantList?: (Omit<FFSessionParticipant, "uid"> & {
    uid?: string;
  })[];
};

export type WriteResult =
  | {
      ok: true;
      session: FriendsFirstSession;
      alreadyRegistered?: boolean;
    }
  | { ok: false; error: string };

let sessions: FriendsFirstSession[] = [];
let nextSeq = 1;
let failNextWrite: string | null = null;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}
const getSnapshot = () => sessions;

export function getFriendsFirstSessions(): FriendsFirstSession[] {
  return sessions;
}

export function getFriendsFirstSession(
  id: string,
): FriendsFirstSession | undefined {
  return sessions.find((s) => s.id === id);
}

export function useFriendsFirstSessions(): FriendsFirstSession[] {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
}

function normalizeParticipants(
  sessionId: string,
  list: (Omit<FFSessionParticipant, "uid"> & {
    uid?: string;
  })[],
  version: number,
): FFSessionParticipant[] {
  const taken = new Set(list.map((p) => p.uid).filter(Boolean));
  let n = 1;
  const freshUid = () => {
    while (taken.has(`${sessionId}-P${n}`)) n++;
    const uid = `${sessionId}-P${n}`;
    taken.add(uid);
    return uid;
  };
  return list.map((p) => ({
    ...p,
    uid: p.uid || freshUid(),
    addedInVersion: p.addedInVersion ?? version,
    source: p.source ?? "staff",
  }));
}

function derived(list: FFSessionParticipant[]) {
  return {
    participants: list
      .map((p) => p.participant)
      .filter(Boolean)
      .join(", "),
    attended: list.some((p) => p.attended === true),
  };
}

function takeInjectedFailure(): string | null {
  const f = failNextWrite;
  failNextWrite = null;
  return f;
}

/** Creates a session with a new stable ID. */
export function createFriendsFirstSession(
  draft: FFSessionDraft,
): WriteResult {
  const injected = takeInjectedFailure();
  if (injected) return { ok: false, error: injected };
  const errors = validateFriendsFirstSession(draft);
  const message = firstFriendsFirstSessionError(errors);
  if (message) return { ok: false, error: message };

  const id = `FFIS-${String(nextSeq++).padStart(4, "0")}`;
  const list = normalizeParticipants(
    id,
    draft.participantList ?? [],
    1,
  );
  const session: FriendsFirstSession = {
    id,
    type: FRIENDS_FIRST_INFO_SESSION_TYPE,
    status: draft.status ?? "Scheduled",
    startDate: draft.startDate!,
    startTime: draft.startTime!,
    endDate: draft.endDate!,
    endTime: draft.endTime!,
    location: draft.location!,
    locationOther: draft.locationOther ?? "",
    comments: draft.comments ?? "",
    participantList: list,
    ...derived(list),
    programs: "",
    homeVisit: false,
    version: 1,
  };
  sessions = [session, ...sessions];
  emit();
  return { ok: true, session };
}

/** Updates one session. `baseVersion` is the version the editor opened: a
 *  participant that registered after it (applicant registration) and is
 *  missing from the draft is kept rather than silently overwritten. */
export function updateFriendsFirstSession(
  id: string,
  patch: FFSessionDraft,
  baseVersion?: number,
): WriteResult {
  const injected = takeInjectedFailure();
  if (injected) return { ok: false, error: injected };
  const current = getFriendsFirstSession(id);
  if (!current)
    return {
      ok: false,
      error: "This session no longer exists.",
    };

  const merged = {
    startDate: patch.startDate ?? current.startDate,
    startTime: patch.startTime ?? current.startTime,
    endDate: patch.endDate ?? current.endDate,
    endTime: patch.endTime ?? current.endTime,
    location: patch.location ?? current.location,
    locationOther: patch.locationOther ?? current.locationOther,
  };
  const message = firstFriendsFirstSessionError(
    validateFriendsFirstSession(merged),
  );
  if (message) return { ok: false, error: message };

  const version = current.version + 1;
  let list: (Omit<FFSessionParticipant, "uid"> & {
    uid?: string;
  })[] = patch.participantList ?? current.participantList;
  if (patch.participantList && baseVersion !== undefined) {
    const have = new Set(list.map((p) => p.uid));
    const late = current.participantList.filter(
      (p) =>
        p.source === "applicant-registration" &&
        (p.addedInVersion ?? 0) > baseVersion &&
        !have.has(p.uid),
    );
    list = [...list, ...late];
  }
  list = normalizeParticipants(id, list, version);
  const session: FriendsFirstSession = {
    ...current,
    ...merged,
    status: patch.status ?? current.status,
    comments: patch.comments ?? current.comments,
    participantList: list,
    ...derived(list),
    version,
  };
  sessions = sessions.map((s) => (s.id === id ? session : s));
  emit();
  return { ok: true, session };
}

/** VMS: an applicant confirms a session. Updates THE selected session —
 *  never creates a Constituent or another connection — adding the applicant
 *  as a Non-Constituent "Friends First Mentor" with attendance unmarked.
 *  Repeating the call for the same applicant ID is a no-op success. */
export function registerApplicantForFriendsFirstSession(input: {
  sessionId: string;
  applicantId: string;
  applicantName: string;
  now?: Date;
}): WriteResult {
  const injected = takeInjectedFailure();
  if (injected) return { ok: false, error: injected };
  const applicantId = input.applicantId?.trim();
  if (!applicantId)
    return {
      ok: false,
      error: "Applicant account ID is required.",
    };
  const current = getFriendsFirstSession(input.sessionId);
  if (!current)
    return {
      ok: false,
      error: "This session no longer exists.",
    };

  const existing = current.participantList.find(
    (p) => p.entityId === applicantId,
  );
  if (existing)
    return {
      ok: true,
      session: current,
      alreadyRegistered: true,
    };

  if (!isOpenForApplicantRegistration(current, input.now))
    return {
      ok: false,
      error:
        "This session is no longer open for registration. Choose another session.",
    };

  const version = current.version + 1;
  const row: FFSessionParticipant = {
    // Far above the editor's own row-id counter (starts at 1000) and unique
    // per session (version only grows), so a later staff-added row can
    // never reuse it.
    id: 1_000_000 + version,
    uid: `applicant:${applicantId}`,
    constituentType: "Non-Constituent",
    participant: input.applicantName,
    role: FRIENDS_FIRST_MENTOR_ROLE,
    attended: null,
    reasonMissed: "",
    entityId: applicantId,
    addedInVersion: version,
    source: "applicant-registration",
  };
  const list = [...current.participantList, row];
  const session: FriendsFirstSession = {
    ...current,
    participantList: list,
    ...derived(list),
    version,
  };
  sessions = sessions.map((s) =>
    s.id === session.id ? session : s,
  );
  emit();
  return { ok: true, session };
}

/** Test-only: make the next write fail with `message`. */
export function __failNextFriendsFirstWriteForTest(
  message: string,
): void {
  failNextWrite = message;
}

/** Test-only reset. */
export function resetFriendsFirstSessionStore(): void {
  sessions = [];
  nextSeq = 1;
  failNextWrite = null;
  emit();
}