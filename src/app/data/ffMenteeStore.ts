// Friends First mentee store — same pattern as tutorApplicantStore.ts:
// saved records live in localStorage so they survive a page refresh, and
// pages subscribe through useSyncExternalStore so an edit made on the
// mentee record (stage, sub-program, intake…) shows up immediately on
// Mentee Search, Mentor Match and anywhere else that reads mentees.
//
// Saved mentees are also written back into MOCK_FF_MENTEES, so plain
// readers of that array (e.g. approvedMentees() in mockMentorMatchData)
// see the same values without subscribing.

import { useSyncExternalStore } from "react";
import {
  EMPTY_FF_REFERRAL,
  MOCK_FF_MENTEES,
  MOCK_FF_REFERRALS,
  type FFGridRow,
  type FFIntakeConnection,
  type FFMentee,
  type FFMenteeStage,
  type FFReferralRecord,
  type FFReferralStatus,
} from "./mockFriendsFirstData";
import { formatMdy } from "../lib/dateFormat";
import { localStamp, normalizeMentee } from "./ffMenteeIntake";
import {
  HISTORY_KEYS,
  STAFF_KEYS,
  calcAge,
  fieldLabel,
  legacyFields,
  validateReferral,
  type RefError,
  type RefInput,
} from "./ffReferralDefinitions";
import {
  canEditStaffObservations,
  type FFReferralActor,
} from "./ffReferralPermissions";

const STORAGE_KEY = "mh.ffMenteeRecords.v1";

/**
 * Mentor-match closures made by a confirmed Inactive action. Saved in the
 * same storage write as the mentee's Inactive flag, so the two are durable
 * together (one setItem — no rollback writes). The match store applies a
 * closure only when it is newer than the match's last edit (`at` vs the
 * match's `updatedAt`), so later ordinary edits are never overridden.
 */
export interface FFMatchClosure {
  endDate: string;
  endTime: string;
  /** Epoch ms of the confirmed action. */
  at: number;
}

interface Persisted {
  /** Every mentee that has been saved or added, by id. */
  mentees: Record<string, FFMentee>;
  referrals: Record<string, FFReferralRecord>;
  /** By match id. Absent in records saved before US 20040 follow-up. */
  matchClosures: Record<string, FFMatchClosure>;
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

/**
 * True when saved data exists but could not be read. Writes are then
 * refused, so the next save never replaces that unreadable dataset with
 * defaults (the stored text is left exactly as it was).
 */
let unreadable = false;

/**
 * The seed mentees exactly as shipped, captured before any saved overlay or
 * runtime mutation touches MOCK_FF_MENTEES. Every (re)build starts from a
 * fresh copy of this, so removed overrides revert and removed records go.
 */
const SEED_BASELINE: FFMentee[] = MOCK_FF_MENTEES.map((m) =>
  structuredClone(m),
);

const emptySaved = (): Persisted => ({
  mentees: {},
  referrals: {},
  matchClosures: {},
});

type SavedRead =
  | { ok: true; data: Persisted }
  | { ok: false; reason: "unavailable" | "corrupt" };

/**
 * Reads and validates the saved data. A successful read with nothing saved
 * is `ok` with empty collections; a failed read, bad JSON or a malformed
 * shape is NOT, so callers never mistake it for "no data".
 */
function readSaved(): SavedRead {
  // No storage at all (e.g. a non-browser test environment): seed only.
  if (typeof localStorage === "undefined")
    return { ok: true, data: emptySaved() };
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { ok: false, reason: "unavailable" };
  }
  if (!raw) return { ok: true, data: emptySaved() };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isObj(parsed)) throw new Error("not an object");
    const part = (k: keyof Persisted) => {
      const v = parsed[k];
      if (v === undefined) return {};
      if (!isObj(v)) throw new Error(`bad ${k}`);
      for (const rec of Object.values(v))
        if (
          k !== "matchClosures" &&
          (!isObj(rec) || typeof rec.id !== "string")
        )
          throw new Error(`bad ${k} record`);
      return v;
    };
    return {
      ok: true,
      data: {
        mentees: part("mentees") as Persisted["mentees"],
        referrals: part("referrals") as Persisted["referrals"],
        matchClosures: part(
          "matchClosures",
        ) as Persisted["matchClosures"],
      },
    };
  } catch {
    return { ok: false, reason: "corrupt" };
  }
}

/**
 * The complete mentee list for a saved dataset: a fresh normalized copy of
 * the seed baseline with each saved mentee laid over it (same ordering the
 * store has always used: replaced in place, new ones unshifted). Returns
 * null when any record can't be prepared, so nothing is applied half-way.
 */
function prepareDataset(saved: Persisted): FFMentee[] | null {
  try {
    const list = SEED_BASELINE.map((m) =>
      normalizeMentee(structuredClone(m)),
    );
    for (const raw of Object.values(saved.mentees)) {
      const mentee = normalizeMentee(raw);
      const idx = list.findIndex((m) => m.id === mentee.id);
      if (idx === -1) list.unshift(mentee);
      else list[idx] = mentee;
    }
    return list;
  } catch {
    return null;
  }
}

/** Replaces the shared array's contents in place (identity preserved). */
function applyDataset(list: FFMentee[]) {
  MOCK_FF_MENTEES.splice(0, MOCK_FF_MENTEES.length, ...list);
}

const state: Persisted = emptySaved();
{
  const first = readSaved();
  const prepared = first.ok ? prepareDataset(first.data) : null;
  if (first.ok && prepared) {
    state.mentees = first.data.mentees;
    state.referrals = first.data.referrals;
    state.matchClosures = first.data.matchClosures;
    applyDataset(prepared);
  } else {
    // Saved data exists but can't be used: seed only, and saving stays
    // disabled so the stored text is never replaced.
    unreadable = true;
    const seedOnly = prepareDataset(emptySaved());
    if (seedOnly) applyDataset(seedOnly);
  }
}

/** Saved data exists but is corrupt; saving is disabled until fixed. */
export function isFFStoreUnreadable() {
  return unreadable;
}

function writeBack(raw: FFMentee) {
  // Older saved records and the seed get safe defaults for the US 20040
  // fields; existing values are kept untouched.
  const mentee = normalizeMentee(raw);
  const idx = MOCK_FF_MENTEES.findIndex(
    (m) => m.id === mentee.id,
  );
  if (idx === -1) MOCK_FF_MENTEES.unshift(mentee);
  else MOCK_FF_MENTEES[idx] = mentee;
}

let snapshot: FFMentee[] = [...MOCK_FF_MENTEES];
const listeners = new Set<() => void>();

/**
 * All-or-nothing save of one mentee plus match closures: the next state is
 * written in a single setItem first, and memory/subscribers change only if
 * that write succeeded. On failure nothing changes, in memory or on reload.
 */
export function commitFFMenteeAtomic(
  raw: FFMentee,
  closures: Record<string, FFMatchClosure> = {},
): boolean {
  // Unreadable stored data is never replaced.
  if (unreadable) return false;
  // Prepare the candidate and the complete next state from committed data
  // without mutating it.
  let mentee: FFMentee;
  try {
    mentee = normalizeMentee(raw);
  } catch {
    return false;
  }
  const next: Persisted = {
    ...state,
    mentees: { ...state.mentees, [mentee.id]: mentee },
    matchClosures: { ...state.matchClosures, ...closures },
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return false;
  }
  state.mentees = next.mentees;
  state.matchClosures = next.matchClosures;
  writeBack(mentee);
  snapshot = [...MOCK_FF_MENTEES];
  listeners.forEach((l) => l());
  return true;
}

/** Saved Inactive-action closures, by match id. */
export function getFFMatchClosures(): Readonly<
  Record<string, FFMatchClosure>
> {
  return state.matchClosures;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFFMentee(id: string): FFMentee | undefined {
  return snapshot.find((m) => m.id === id);
}

export function useFFMentees(): FFMentee[] {
  return useSyncExternalStore(subscribe, () => snapshot);
}

export function useFFMentee(id: string): FFMentee | undefined {
  return useSyncExternalStore(subscribe, () => getFFMentee(id));
}

/**
 * Applies `update` to the latest saved record (never a stale draft), so a
 * section save only changes that section's fields. All-or-nothing: the
 * candidate record and next state are prepared without touching committed
 * data, written once, and only then applied to memory, the shared array, the
 * snapshot and subscribers. Returns false — leaving everything as it was —
 * when the record is missing, the store is unreadable, or the write fails.
 */
export function updateFFMentee(
  id: string,
  update: (m: FFMentee) => FFMentee,
): boolean {
  const current = getFFMentee(id);
  if (!current) return false;
  return commitFFMenteeAtomic(update(current));
}

export type FFStageChangeResult =
  | { ok: true; changed: boolean }
  | { ok: false; reason: "missing" | "storage" };

/**
 * Changes the pipeline stage. The first move to Ready for Match stamps
 * today as the Promotion Date (shown on Mentee Search only). A redundant
 * update to the same stage is ignored, and an existing Promotion Date is
 * kept on later promotions (first-promotion policy — pending confirmation).
 *
 * The stage and Promotion Date are saved together in ONE write; memory and
 * subscribers change only if it succeeds, so a failed save leaves both
 * values exactly as they were.
 */
export function setFFMenteeStage(
  id: string,
  stage: FFMenteeStage,
): FFStageChangeResult {
  const current = getFFMentee(id);
  if (!current) return { ok: false, reason: "missing" };
  if (current.stage === stage)
    return { ok: true, changed: false };
  const saved = commitFFMenteeAtomic({
    ...current,
    stage,
    promotionDate:
      stage === "Ready for Match" && !current.promotionDate
        ? formatMdy(new Date())
        : current.promotionDate,
  });
  return saved
    ? { ok: true, changed: true }
    : { ok: false, reason: "storage" };
}

/** Creates or replaces one Intake Connection on its own mentee only. */
export function saveFFIntakeConnection(
  conn: FFIntakeConnection,
): boolean {
  return updateFFMentee(conn.menteeId, (m) => {
    const list = m.intakeConnections ?? [];
    const exists = list.some((c) => c.id === conn.id);
    return {
      ...m,
      intakeConnections: exists
        ? list.map((c) => (c.id === conn.id ? conn : c))
        : [...list, conn],
    };
  });
}

/** Marks one checklist document Complete/Incomplete with a local stamp. */
export function setFFMenteeDocument(
  menteeId: string,
  docId: string,
  complete: boolean,
): boolean {
  const { date, time } = localStamp(new Date());
  return updateFFMentee(menteeId, (m) => ({
    ...m,
    documents: {
      ...(m.documents ?? {}),
      [docId]: { complete, updatedAt: `${date} ${time}` },
    },
  }));
}

// ─── Mentee Referrals (US 20002) ─────────────────────────────────────────────
//
// Referrals share this store's single storage key so a promotion saves the
// mentee, the referral link and the Promoted status in one write. Every
// referral operation below computes the next complete state, writes it once,
// and only then changes memory and notifies subscribers.

export type FFReferralFailure =
  | "storage"
  | "unreadable"
  | "invalid"
  | "locked"
  | "not-found"
  | "identity";

export type FFReferralResult =
  | { ok: true; referral: FFReferralRecord }
  | {
      ok: false;
      reason: FFReferralFailure;
      errors?: RefError[];
    };

export type FFPromoteResult =
  | {
      ok: true;
      referral: FFReferralRecord;
      mentee: FFMentee;
      /** True when the referral was already promoted. */
      existing: boolean;
    }
  | { ok: false; reason: FFReferralFailure };

/** Safe defaults for seeded and older saved referrals; nothing invented. */
function normalizeReferral(
  r: FFReferralRecord,
): FFReferralRecord {
  const linked = r.menteeId
    ? r.menteeId
    : (MOCK_FF_MENTEES.find((m) => m.referralId === r.id)?.id ??
      null);
  const status: FFReferralStatus =
    r.status ?? (linked ? "promoted" : "submitted");
  return {
    ...r,
    submittedDate: r.submittedDate ?? "",
    status,
    referralDate: r.referralDate ?? "",
    answers: isObj(r.answers)
      ? (r.answers as Record<string, string>)
      : {},
    grids: isObj(r.grids)
      ? (r.grids as Record<string, FFGridRow[]>)
      : {},
    detailsHistory: Array.isArray(r.detailsHistory)
      ? r.detailsHistory
      : [],
    menteeId: linked,
  };
}

/** Saved referral by id (drafts included), normalized. */
export function getSavedFFReferral(
  id: string,
): FFReferralRecord | undefined {
  const r = state.referrals[id];
  return r ? normalizeReferral(r) : undefined;
}

const byUpdatedDesc = (
  a: FFReferralRecord,
  b: FFReferralRecord,
) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");

let referralWork: FFReferralRecord[] = [];
function refreshReferralWork() {
  referralWork = Object.values(state.referrals)
    .map(normalizeReferral)
    .sort(byUpdatedDesc);
}
refreshReferralWork();

/** Every referral saved from the Mentee Referral page, newest first. */
export function useFFReferralWork(): FFReferralRecord[] {
  return useSyncExternalStore(subscribe, () => referralWork);
}

function writeState(next: Persisted): FFReferralFailure | null {
  if (unreadable) return "unreadable";
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return "storage";
  }
  state.mentees = next.mentees;
  state.referrals = next.referrals;
  state.matchClosures = next.matchClosures;
  return null;
}

function notify() {
  refreshReferralWork();
  snapshot = [...MOCK_FF_MENTEES];
  listeners.forEach((l) => l());
}

function newReferralId(now: Date) {
  let id: string;
  let n = 0;
  do {
    id = `RF-${now.getTime()}${n ? `-${n}` : ""}`;
    n += 1;
  } while (
    state.referrals[id] ||
    MOCK_FF_REFERRALS.some((r) => r.id === id)
  );
  return id;
}

export interface FFReferralInput extends RefInput {
  /** Omitted for a referral that has never been saved. */
  id?: string | null;
}

/**
 * Next referral record for a draft save or submission. Staff Observations
 * from an unauthorized user are ignored (saved values kept). Details
 * History gains one entry only when Contact Details or Follow Up changed.
 */
function nextReferral(
  existing: FFReferralRecord | undefined,
  input: FFReferralInput,
  actor: FFReferralActor,
  now: Date,
  id: string,
): FFReferralRecord {
  const values: Record<string, string> = { ...input.values };
  if (!canEditStaffObservations(actor)) {
    const prev = existing?.answers ?? {};
    for (const k of STAFF_KEYS) {
      if (k in prev) values[k] = prev[k];
      else delete values[k];
    }
  }
  const before = existing?.answers ?? {};
  const changes = HISTORY_KEYS.filter(
    (k) =>
      (before[k] ?? "").trim() !== (values[k] ?? "").trim(),
  ).map((k) => ({
    key: k,
    label: fieldLabel(k),
    from: before[k] ?? "",
    to: values[k] ?? "",
  }));
  const { date, time } = localStamp(now);
  const history = [...(existing?.detailsHistory ?? [])];
  if (changes.length)
    history.push({
      id: `hist-${now.getTime()}-${history.length}`,
      savedAt: `${date} ${time}`,
      changes,
    });
  return {
    ...EMPTY_FF_REFERRAL,
    ...(existing ?? {}),
    ...legacyFields(values),
    id,
    recommendedProgram: input.program,
    referralDate: values.referralDate ?? "",
    answers: values,
    grids: input.grids,
    detailsHistory: history,
    status: "draft",
    submittedDate: "",
    menteeId: null,
    createdAt: existing?.createdAt ?? now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

function saveReferral(
  input: FFReferralInput,
  actor: FFReferralActor,
  now: Date,
  submit: boolean,
): FFReferralResult {
  if (unreadable) return { ok: false, reason: "unreadable" };
  const existing = input.id
    ? getSavedFFReferral(input.id)
    : undefined;
  if (input.id && !existing)
    return { ok: false, reason: "not-found" };
  if (existing && existing.status !== "draft")
    return { ok: false, reason: "locked" };
  if (submit) {
    const errors = validateReferral(
      input,
      canEditStaffObservations(actor),
      now,
    );
    if (errors.length)
      return { ok: false, reason: "invalid", errors };
  }
  const id = existing?.id ?? newReferralId(now);
  let referral = nextReferral(existing, input, actor, now, id);
  if (submit)
    referral = {
      ...referral,
      status: "submitted",
      submittedAt: now.toISOString(),
      submittedDate: formatMdy(now),
    };
  const fail = writeState({
    ...state,
    referrals: { ...state.referrals, [id]: referral },
  });
  if (fail) return { ok: false, reason: fail };
  notify();
  return { ok: true, referral: normalizeReferral(referral) };
}

/** Saves an incomplete or complete draft; repeated saves update one id. */
export function saveFFReferralDraft(
  input: FFReferralInput,
  actor: FFReferralActor,
  now: Date = new Date(),
): FFReferralResult {
  return saveReferral(input, actor, now, false);
}

/**
 * Validates and submits. Re-checks validation and the draft status here so
 * a bypassed UI cannot submit an invalid or already-submitted referral.
 * Submission never creates a mentee.
 */
export function submitFFReferral(
  input: FFReferralInput,
  actor: FFReferralActor,
  now: Date = new Date(),
): FFReferralResult {
  return saveReferral(input, actor, now, true);
}

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Whether a submitted referral carries the candidate identity a mentee
 * needs. Only Community-Based referrals capture it (General tab); WB/SB
 * identity capture is not yet defined, and dormant CB answers left after a
 * program change are never used.
 */
export function referralHasCandidateIdentity(
  r: FFReferralRecord,
) {
  const a = r.answers ?? {};
  return (
    r.recommendedProgram === "Community-Based" &&
    !!(a.candidateName ?? "").trim() &&
    calcAge(a.candidateDob ?? "") !== null
  );
}

/**
 * Promote to Pipeline: creates the mentee from the saved, submitted
 * referral and links them, in one write. Repeating returns the existing
 * mentee. The coordinator is left unassigned — the app has no
 * current-user/assignment source yet.
 */
export function promoteFFReferral(
  id: string,
  now: Date = new Date(),
): FFPromoteResult {
  if (unreadable) return { ok: false, reason: "unreadable" };
  const referral = getSavedFFReferral(id);
  if (!referral) return { ok: false, reason: "not-found" };
  if (referral.status === "promoted" && referral.menteeId) {
    const mentee = getFFMentee(referral.menteeId);
    if (mentee)
      return { ok: true, referral, mentee, existing: true };
  }
  if (referral.status === "draft")
    return { ok: false, reason: "locked" };
  if (!referralHasCandidateIdentity(referral))
    return { ok: false, reason: "identity" };
  const a = referral.answers ?? {};
  let menteeId = `MT-${now.getTime()}`;
  while (state.mentees[menteeId] || getFFMentee(menteeId))
    menteeId += "1";
  const mentee = normalizeMentee({
    id: menteeId,
    name: a.candidateName.trim(),
    initials: initialsOf(a.candidateName),
    dob: a.candidateDob,
    gender: a.candidateGender ?? "",
    programme: "Community-Based",
    stage: "Referral Received",
    promotionDate: null,
    referralId: referral.id,
    referralSource: a.referrerRole || "Unknown",
    // Public Transportation free text is not converted into an
    // arrangement; staff choose it on the mentee record.
    transportation: "",
    coordinator: "",
    intakeScheduledDate: null,
    guardianIntakeDate: null,
    youthIntakeDate: null,
    notes: a.staffRecommendation ?? "",
  });
  const promoted: FFReferralRecord = {
    ...referral,
    status: "promoted",
    menteeId,
    promotedAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  const fail = writeState({
    ...state,
    mentees: { ...state.mentees, [menteeId]: mentee },
    referrals: { ...state.referrals, [referral.id]: promoted },
  });
  if (fail) return { ok: false, reason: fail };
  writeBack(mentee);
  notify();
  return {
    ok: true,
    referral: normalizeReferral(promoted),
    mentee: getFFMentee(menteeId) ?? mentee,
    existing: false,
  };
}

/**
 * Saves a referral and the mentee created from it, linked by id, in one
 * write. Returns false (and changes nothing) if the write failed.
 */
export function addFFMenteeFromReferral(
  mentee: FFMentee,
  referral: FFReferralRecord,
): boolean {
  const linked = normalizeMentee({
    ...mentee,
    referralId: referral.id,
  });
  const fail = writeState({
    ...state,
    mentees: { ...state.mentees, [linked.id]: linked },
    referrals: {
      ...state.referrals,
      [referral.id]: {
        ...referral,
        status: "promoted",
        menteeId: linked.id,
      },
    },
  });
  if (fail) return false;
  writeBack(linked);
  notify();
  return true;
}

/**
 * Submitted and promoted referrals — seeded plus saved, one row per id with
 * the saved version taking precedence. Drafts are excluded, so a mentee's
 * Referral Source can only link to a submitted referral.
 */
export function listFFReferrals(): FFReferralRecord[] {
  const saved = Object.values(state.referrals).map(
    normalizeReferral,
  );
  const savedIds = new Set(saved.map((r) => r.id));
  return [
    ...MOCK_FF_REFERRALS.filter((r) => !savedIds.has(r.id)).map(
      normalizeReferral,
    ),
    ...saved,
  ].filter((r) => r.status !== "draft");
}

export function getFFReferral(
  id: string | null | undefined,
): FFReferralRecord | undefined {
  return id
    ? listFFReferrals().find((r) => r.id === id)
    : undefined;
}

/**
 * Re-reads the saved data from storage (as a page refresh would) and
 * rebuilds the whole dataset from the untouched seed baseline plus what was
 * read, then notifies subscribers. It never writes to storage.
 *
 * Returns false — changing nothing, in memory or in the shared arrays — when
 * the data can't be read, parsed or prepared; saving then stays disabled so
 * the stored text can't be overwritten. A later successful read re-enables
 * saving. A successful read of nothing restores the seed baseline.
 */
export function refreshFFStoreFromStorage(): boolean {
  const read = readSaved();
  if (!read.ok) {
    unreadable = true;
    return false;
  }
  // Prepare and validate everything before touching live state.
  const prepared = prepareDataset(read.data);
  if (!prepared) {
    unreadable = true;
    return false;
  }
  try {
    for (const r of Object.values(read.data.referrals))
      normalizeReferral(r);
  } catch {
    unreadable = true;
    return false;
  }
  unreadable = false;
  state.mentees = read.data.mentees;
  state.referrals = read.data.referrals;
  state.matchClosures = read.data.matchClosures;
  applyDataset(prepared);
  notify();
  return true;
}

/**
 * Test-only: behave like a fresh page load from (fake) storage. Unlike
 * Refresh, an unreadable dataset yields seed data with saving disabled.
 */
export function __reloadFFStoreForTest() {
  if (refreshFFStoreFromStorage()) return;
  state.mentees = {};
  state.referrals = {};
  state.matchClosures = {};
  const seedOnly = prepareDataset(emptySaved());
  if (seedOnly) applyDataset(seedOnly);
  unreadable = true;
  notify();
}