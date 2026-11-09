// US 20221 — Program Shift Roles + Staff Member Status entries.
//
// One versioned localStorage record holds BOTH the role catalog and the
// Staff Member Status entries that reference it, so role deletion and status
// creation go through the same write boundary: every mutation re-reads the
// stored state, validates against it, writes once, and only then notifies
// subscribers. Unreadable storage is reported as "unavailable" — never as an
// empty list — and blocks writes that depend on it.
//
// PROTOTYPE PERMISSIONS (production policy pending): configuration is
// System Admin, or a non-admin with a CURRENT assignment to that Program AND
// an explicit configuration grant. Recording a status is separate: assigned
// staff record their own status in a current Program; System Admins record
// for any eligible staff member of the selected Program.

import { useSyncExternalStore } from "react";
import {
  CURRENT_USER_CONSTITUENT_ID,
  CURRENT_USER_IS_SYSTEM_ADMIN,
  CURRENT_USER_NAME,
} from "./mockProgramsData";
import {
  getProgramStaffAssignments,
  isCurrentAssignment,
  isRecognizedProgramStaffTitle,
  programIdsForStaff,
  type ProgramStaffAssignment,
} from "./programStaffAssignmentStore";
import { constituentLabel } from "./transitionSummaryDetailsSources";

export const SHIFT_ROLE_STORAGE_KEY = "mh.programShiftRoles.v1";
const VERSION = 1;

export interface ShiftRole {
  id: string;
  /** Canonical (numeric) Program ID. */
  programId: number;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ShiftKey = "morning" | "afternoon" | "night";

export const SHIFT_KEY_OPTIONS: { value: ShiftKey; label: string }[] = [
  { value: "morning", label: "Morning (7A - 3P)" },
  { value: "afternoon", label: "Evening (3P - 11P)" },
  { value: "night", label: "Overnight (11P - 7A)" },
];

/** US 20223 — the structured Status Actions, in display order. */
export const STATUS_ACTIONS = [
  "Start Shift",
  "End Shift",
  "Break Start",
  "Break End",
  "Other",
] as const;
export type StatusAction = (typeof STATUS_ACTIONS)[number];

export interface StaffStatusEntry {
  id: string;
  programId: number;
  /** MHBG Staff Constituent ID. */
  staffConstituentId: number;
  staffNameAtSave: string;
  /** null = recorded without a Shift Role. */
  shiftRoleId: string | null;
  /** The role name exactly as it was when saved — shown in history. */
  shiftRoleNameAtSave: string | null;
  /** Free-text role from older records, kept readable. */
  legacyRoleText?: string | null;
  /** Local shift date "YYYY-MM-DD" (explicit; overnight uses this date). */
  shiftDate: string;
  shiftKey: ShiftKey;
  /** Entry time "HH:MM" as entered in the dialog. */
  time: string;
  /** Display text. Legacy entries: free-text status. US 20223 entries:
   *  the Status Action (kept for older readers). */
  status: string;
  /** US 20223 — absent on legacy entries. */
  statusAction?: StatusAction;
  /** US 20223 — "" when none entered. */
  notes?: string;
  /** Author (who recorded it) — separate from the staff subject. */
  createdBy: string;
  createdAt: string;
}

interface StoredState {
  version: number;
  roles: ShiftRole[];
  statusEntries: StaffStatusEntry[];
}

export type ShiftRoleRead =
  | { status: "ok"; roles: ShiftRole[]; statusEntries: StaffStatusEntry[] }
  | { status: "unavailable" };

// ── Storage ─────────────────────────────────────────────────────────────

const EMPTY: StoredState = { version: VERSION, roles: [], statusEntries: [] };

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function isState(v: unknown): v is StoredState {
  const s = v as StoredState;
  return (
    !!s &&
    typeof s === "object" &&
    s.version === VERSION &&
    Array.isArray(s.roles) &&
    Array.isArray(s.statusEntries)
  );
}

function readStored(): ShiftRoleRead {
  const ls = storage();
  if (!ls) return { status: "unavailable" };
  let raw: string | null;
  try {
    raw = ls.getItem(SHIFT_ROLE_STORAGE_KEY);
  } catch {
    return { status: "unavailable" };
  }
  if (raw === null) return { status: "ok", ...EMPTY };
  try {
    const parsed = JSON.parse(raw);
    if (!isState(parsed)) return { status: "unavailable" };
    return {
      status: "ok",
      roles: parsed.roles,
      statusEntries: parsed.statusEntries,
    };
  } catch {
    return { status: "unavailable" };
  }
}

function writeStored(s: StoredState): boolean {
  const ls = storage();
  if (!ls) return false;
  try {
    ls.setItem(SHIFT_ROLE_STORAGE_KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}

// Stable snapshot for useSyncExternalStore.
let snapshot: ShiftRoleRead = readStored();
let snapshotRaw: string | null | undefined;
const listeners = new Set<() => void>();

function refresh(): ShiftRoleRead {
  let raw: string | null | undefined;
  try {
    raw = storage()?.getItem(SHIFT_ROLE_STORAGE_KEY);
  } catch {
    raw = undefined;
  }
  if (raw !== snapshotRaw || raw === undefined) {
    snapshotRaw = raw;
    snapshot = readStored();
  }
  return snapshot;
}

function emit() {
  refresh();
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  // Another tab saved: pick it up.
  window.addEventListener("storage", (e) => {
    if (e.key === SHIFT_ROLE_STORAGE_KEY) emit();
  });
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getShiftRoleState(): ShiftRoleRead {
  return refresh();
}

export function useShiftRoleState(): ShiftRoleRead {
  return useSyncExternalStore(subscribe, refresh, refresh);
}

let idSeq = 0;
function newId(prefix: string) {
  idSeq += 1;
  return `${prefix}-${Date.now().toString(36)}-${idSeq}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

/** Re-read → mutate → single write → publish. */
function mutate<T>(
  fn: (s: StoredState) => { next: StoredState; value: T } | { error: WriteError },
): { ok: true; value: T } | { ok: false; error: WriteError } {
  const cur = readStored();
  if (cur.status !== "ok") return { ok: false, error: "unavailable" };
  const r = fn({ version: VERSION, roles: cur.roles, statusEntries: cur.statusEntries });
  if ("error" in r) return { ok: false, error: r.error };
  if (!writeStored(r.next)) return { ok: false, error: "storage" };
  emit();
  return { ok: true, value: r.value };
}

// ── Actor + permissions (prototype) ────────────────────────────────────

export interface ShiftRoleActor {
  isSystemAdmin: boolean;
  constituentId: number | null;
  name: string;
}

let actorOverride: ShiftRoleActor | null = null;
/** Explicit Shift Role configuration grants, by staff Constituent ID. */
let configGrants = new Set<number>();
let todayOverride: string | null = null;

export function getShiftRoleActor(): ShiftRoleActor {
  return (
    actorOverride ?? {
      isSystemAdmin: CURRENT_USER_IS_SYSTEM_ADMIN,
      constituentId: CURRENT_USER_CONSTITUENT_ID,
      name: CURRENT_USER_NAME,
    }
  );
}

/** Test / demo seam. */
export function __setShiftRoleActorForTest(
  actor: ShiftRoleActor | null,
  grants: number[] = [],
  today: string | null = null,
) {
  actorOverride = actor;
  configGrants = new Set(grants);
  todayOverride = today;
  listeners.forEach((l) => l());
}

function todayIso(): string {
  if (todayOverride) return todayOverride;
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function readAssignments(): ProgramStaffAssignment[] | null {
  const r = getProgramStaffAssignments();
  return r.status === "ok" ? r.assignments : null;
}

function isAssignedNow(constituentId: number, programId: number): boolean {
  const all = readAssignments();
  if (!all) return false;
  return programIdsForStaff(all, constituentId, todayIso()).includes(programId);
}

export function canConfigureShiftRoles(
  programId: number,
  actor: ShiftRoleActor = getShiftRoleActor(),
): boolean {
  if (actor.isSystemAdmin) return true;
  if (actor.constituentId === null) return false;
  return (
    configGrants.has(actor.constituentId) &&
    isAssignedNow(actor.constituentId, programId)
  );
}

export interface EligibleStaff {
  constituentId: number;
  name: string;
}

/** Staff with a current, date-effective assignment to the Program,
 *  deduplicated by Constituent ID. null = assignments unreadable. */
export function eligibleStaffForProgram(programId: number): EligibleStaff[] | null {
  const all = readAssignments();
  if (!all) return null;
  const today = todayIso();
  const seen = new Map<number, EligibleStaff>();
  for (const a of all) {
    if (
      a.programId === programId &&
      isRecognizedProgramStaffTitle(a.titleId) &&
      isCurrentAssignment(a, today) &&
      !seen.has(a.constituentId)
    )
      seen.set(a.constituentId, {
        constituentId: a.constituentId,
        name: constituentLabel(a.constituentId) ?? `Staff ${a.constituentId}`,
      });
  }
  return [...seen.values()].sort((x, y) => x.name.localeCompare(y.name));
}

/** Staff the current actor may record a status for in this Program. */
export function recordableStaffForProgram(
  programId: number,
  actor: ShiftRoleActor = getShiftRoleActor(),
): EligibleStaff[] | null {
  const eligible = eligibleStaffForProgram(programId);
  if (!eligible) return null;
  if (actor.isSystemAdmin) return eligible;
  if (actor.constituentId === null) return [];
  return eligible.filter((s) => s.constituentId === actor.constituentId);
}

// ── Role configuration ─────────────────────────────────────────────────

export type WriteError =
  | "unavailable"
  | "storage"
  | "not-permitted"
  | "validation"
  | "not-found"
  | "referenced";

export const SHIFT_ROLE_MESSAGES: Record<WriteError, string> = {
  unavailable:
    "Shift Role data can't be read right now, so nothing was changed.",
  storage: "The change couldn't be saved. Nothing was changed — try again.",
  "not-permitted":
    "You don't have permission to configure Shift Roles for this Program.",
  validation: "Fix the highlighted fields.",
  "not-found": "This Shift Role no longer exists.",
  referenced:
    "This Shift Role is used by saved Staff Member Status entries, so it can't be deleted. Deactivate it instead to remove it from new entries.",
};

export const rolesForProgram = (roles: ShiftRole[], programId: number) =>
  roles.filter((r) => r.programId === programId);

export const activeRolesForProgram = (roles: ShiftRole[], programId: number) =>
  rolesForProgram(roles, programId).filter((r) => r.active);

export function validateRoleName(
  roles: ShiftRole[],
  programId: number,
  name: string,
  ignoreId?: string,
): string | null {
  const n = name.trim();
  if (!n) return "Enter a Shift Role name.";
  if (n.length > 80) return "Use 80 characters or fewer.";
  const dup = rolesForProgram(roles, programId).some(
    (r) => r.id !== ignoreId && r.name.trim().toLowerCase() === n.toLowerCase(),
  );
  return dup ? "This Program already has a Shift Role with this name." : null;
}

export type RoleWrite =
  | { ok: true; role: ShiftRole }
  | { ok: false; error: WriteError; fieldError?: string };

export function addShiftRole(programId: number, name: string): RoleWrite {
  if (!canConfigureShiftRoles(programId)) return { ok: false, error: "not-permitted" };
  let fieldError: string | undefined;
  const r = mutate<ShiftRole>((s) => {
    const err = validateRoleName(s.roles, programId, name);
    if (err) {
      fieldError = err;
      return { error: "validation" };
    }
    const now = new Date().toISOString();
    const role: ShiftRole = {
      id: newId("srole"),
      programId,
      name: name.trim(),
      active: true,
      createdAt: now,
      updatedAt: now,
    };
    return { next: { ...s, roles: [...s.roles, role] }, value: role };
  });
  return r.ok ? { ok: true, role: r.value } : { ok: false, error: r.error, fieldError };
}

export function renameShiftRole(id: string, name: string): RoleWrite {
  let fieldError: string | undefined;
  const r = mutate<ShiftRole>((s) => {
    const role = s.roles.find((x) => x.id === id);
    if (!role) return { error: "not-found" };
    if (!canConfigureShiftRoles(role.programId)) return { error: "not-permitted" };
    const err = validateRoleName(s.roles, role.programId, name, id);
    if (err) {
      fieldError = err;
      return { error: "validation" };
    }
    const next = { ...role, name: name.trim(), updatedAt: new Date().toISOString() };
    return { next: { ...s, roles: s.roles.map((x) => (x.id === id ? next : x)) }, value: next };
  });
  return r.ok ? { ok: true, role: r.value } : { ok: false, error: r.error, fieldError };
}

export function setShiftRoleActive(id: string, active: boolean): RoleWrite {
  const r = mutate<ShiftRole>((s) => {
    const role = s.roles.find((x) => x.id === id);
    if (!role) return { error: "not-found" };
    if (!canConfigureShiftRoles(role.programId)) return { error: "not-permitted" };
    const next = { ...role, active, updatedAt: new Date().toISOString() };
    return { next: { ...s, roles: s.roles.map((x) => (x.id === id ? next : x)) }, value: next };
  });
  return r.ok ? { ok: true, role: r.value } : { ok: false, error: r.error };
}

/** Number of saved records referencing the role; null = can't tell. */
export function shiftRoleReferenceCount(id: string): number | null {
  const s = readStored();
  if (s.status !== "ok") return null;
  return s.statusEntries.filter((e) => e.shiftRoleId === id).length;
}

export function deleteShiftRole(
  id: string,
): { ok: true } | { ok: false; error: WriteError } {
  const r = mutate<null>((s) => {
    const role = s.roles.find((x) => x.id === id);
    if (!role) return { error: "not-found" };
    if (!canConfigureShiftRoles(role.programId)) return { error: "not-permitted" };
    // Rechecked here, at the write boundary, against freshly read data.
    if (s.statusEntries.some((e) => e.shiftRoleId === id)) return { error: "referenced" };
    return { next: { ...s, roles: s.roles.filter((x) => x.id !== id) }, value: null };
  });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

// ── Staff Member Status ────────────────────────────────────────────────

export interface StaffStatusInput {
  programId: number;
  staffConstituentId: number | null;
  shiftRoleId: string | null;
  /** Local date "YYYY-MM-DD" and time "HH:MM" as entered. */
  date: string;
  time: string;
  statusAction: string;
  notes: string;
}

export type StaffStatusFieldErrors = Partial<
  Record<"staff" | "shiftRole" | "statusAction" | "notes" | "date" | "time", string>
>;

export type StatusWrite =
  | { ok: true; entry: StaffStatusEntry }
  | { ok: false; error: WriteError; fieldErrors?: StaffStatusFieldErrors };

export function isValidLocalDate(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [y, m, d] = v.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}
export function isValidLocalTime(v: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
}

/** US 20223 writer: Staff Member, Shift Role and Status Action required;
 *  Notes required for "Other". Everything is re-validated here against
 *  freshly read data, whatever the form showed. */
export function createStaffStatusEntry(input: StaffStatusInput): StatusWrite {
  const actor = getShiftRoleActor();
  const fieldErrors: StaffStatusFieldErrors = {};
  const r = mutate<StaffStatusEntry>((s) => {
    const recordable = recordableStaffForProgram(input.programId, actor);
    if (recordable === null) return { error: "unavailable" };
    if (input.staffConstituentId === null) fieldErrors.staff = "Select a Staff Member.";
    else if (!recordable.some((x) => x.constituentId === input.staffConstituentId))
      fieldErrors.staff = "You can't record a status for this staff member in this Program.";
    if (!isValidLocalDate(input.date)) fieldErrors.date = "Enter a valid date.";
    if (!isValidLocalTime(input.time)) fieldErrors.time = "Enter a valid time.";
    const action = STATUS_ACTIONS.find((a) => a === input.statusAction);
    if (!action) fieldErrors.statusAction = "Select a Status Action.";
    if (action === "Other" && !input.notes.trim())
      fieldErrors.notes = "Enter notes when the Status Action is Other.";
    let role: ShiftRole | undefined;
    if (!input.shiftRoleId) fieldErrors.shiftRole = "Select a Shift Role.";
    else {
      role = s.roles.find((x) => x.id === input.shiftRoleId);
      if (!role || role.programId !== input.programId || !role.active)
        fieldErrors.shiftRole =
          "This Shift Role is no longer available for this Program. Choose another.";
    }
    if (Object.keys(fieldErrors).length) return { error: "validation" };
    const entry: StaffStatusEntry = {
      id: newId("sstat"),
      programId: input.programId,
      staffConstituentId: input.staffConstituentId!,
      staffNameAtSave:
        recordable.find((x) => x.constituentId === input.staffConstituentId)?.name ?? "",
      shiftRoleId: role!.id,
      shiftRoleNameAtSave: role!.name,
      shiftDate: input.date,
      shiftKey: shiftKeyForTime(input.time),
      time: input.time,
      status: action!,
      statusAction: action!,
      notes: input.notes.trim(),
      createdBy: actor.name,
      createdAt: new Date().toISOString(),
    };
    return { next: { ...s, statusEntries: [...s.statusEntries, entry] }, value: entry };
  });
  return r.ok
    ? { ok: true, entry: r.value }
    : { ok: false, error: r.error, fieldErrors: r.error === "validation" ? fieldErrors : undefined };
}

/** The role label recorded on an entry (historical, never the live name). */
export function recordedRoleLabel(e: StaffStatusEntry): string | null {
  return e.shiftRoleNameAtSave ?? e.legacyRoleText ?? null;
}

/** Shift that a time of day falls in (7A / 3P / 11P boundaries). */
export function shiftKeyForTime(hhmm: string): ShiftKey {
  const h = Number(hhmm.slice(0, 2));
  if (h >= 7 && h < 15) return "morning";
  if (h >= 15 && h < 23) return "afternoon";
  return "night";
}

/** Handover shift values ("evening" is an older alias for night). */
export function normalizeShiftKey(v: string): ShiftKey {
  if (v === "afternoon") return "afternoon";
  if (v === "night" || v === "evening") return "night";
  return "morning";
}

// ── Handover block ─────────────────────────────────────────────────────

export interface StaffStatusSnapshotRow {
  entryId: string;
  staffName: string;
  roleLabel: string | null;
  /** Status Action (US 20223) or legacy free-text status. */
  status: string;
  notes?: string;
  date?: string;
  time: string;
}

const addDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

/**
 * PROTOTYPE shift windows (no established timezone/shift policy found):
 * local time, Morning 07:00–15:00, Evening 15:00–23:00, Overnight
 * 23:00–07:00 across midnight. An Overnight handover recorded before 23:00
 * covers the night ENDING on its date. Exactly at a boundary, End Shift
 * belongs to the ending shift and every other action to the starting one.
 * Returns [start, end] as sortable "YYYY-MM-DDTHH:MM" strings.
 */
export function shiftWindow(
  shiftDate: string,
  shiftKey: string,
  handoverTime?: string,
): [string, string] {
  const key = normalizeShiftKey(shiftKey);
  if (key === "morning") return [`${shiftDate}T07:00`, `${shiftDate}T15:00`];
  if (key === "afternoon") return [`${shiftDate}T15:00`, `${shiftDate}T23:00`];
  if (handoverTime && handoverTime >= "23:00")
    return [`${shiftDate}T23:00`, `${addDays(shiftDate, 1)}T07:00`];
  return [`${addDays(shiftDate, -1)}T23:00`, `${shiftDate}T07:00`];
}

export function entryInShift(
  e: StaffStatusEntry,
  shiftDate: string,
  shiftKey: string,
  handoverTime?: string,
): boolean {
  // Legacy entries carry an explicit shift; keep honouring it.
  if (!e.statusAction) return e.shiftDate === shiftDate && e.shiftKey === normalizeShiftKey(shiftKey);
  const [start, end] = shiftWindow(shiftDate, shiftKey, handoverTime);
  const t = `${e.shiftDate}T${e.time}`;
  if (t > start && t < end) return true;
  if (t === start) return e.statusAction !== "End Shift";
  if (t === end) return e.statusAction === "End Shift";
  return false;
}

export interface StaffStatusSnapshot {
  programId: number;
  shiftDate: string;
  shiftKey: ShiftKey;
  /** Overnight only: decides which night the window covers. */
  handoverTime?: string;
  rows: StaffStatusSnapshotRow[];
}

export function buildStaffStatusSnapshot(
  entries: StaffStatusEntry[],
  programId: number,
  shiftDate: string,
  shiftKey: string,
  handoverTime?: string,
): StaffStatusSnapshot {
  const key = normalizeShiftKey(shiftKey);
  const rows = entries
    .filter((e) => e.programId === programId && entryInShift(e, shiftDate, key, handoverTime))
    .sort((a, b) => `${a.shiftDate}T${a.time}`.localeCompare(`${b.shiftDate}T${b.time}`))
    .map((e) => ({
      entryId: e.id,
      staffName: e.staffNameAtSave || `Staff ${e.staffConstituentId}`,
      roleLabel: recordedRoleLabel(e),
      status: e.statusAction ?? e.status,
      notes: e.notes || undefined,
      date: e.shiftDate,
      time: e.time,
    }));
  return { programId, shiftDate, shiftKey: key, handoverTime, rows };
}

export function fmtMdy(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}
export function fmt12h(hhmm: string): string {
  if (!isValidLocalTime(hhmm)) return hhmm;
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export const SUMMARY_STAFF_STATUS_DIVIDER = "──────── STAFF MEMBER STATUS ────────";

export function composeStaffStatusBlock(s: StaffStatusSnapshot | null | undefined): string {
  if (!s || s.rows.length === 0) return "";
  return s.rows
    .map(
      (r) =>
        `• ${r.staffName} — ${r.roleLabel ?? "No shift role"}: ${r.status}` +
        (r.date ? ` (${fmtMdy(r.date)} ${fmt12h(r.time)})` : "") +
        (r.notes ? ` — ${r.notes}` : ""),
    )
    .join("\n");
}

/** Inserts the staff status block once, ahead of any checklist block. */
export function withStaffStatusBlock(
  narrative: string,
  s: StaffStatusSnapshot | null | undefined,
): string {
  const block = composeStaffStatusBlock(s);
  const text = narrative.trim();
  if (!block) return text;
  const section = `${SUMMARY_STAFF_STATUS_DIVIDER}\n${block}`;
  return text ? `${text}\n\n${section}` : section;
}

/** Test seam: forget the cached snapshot. */
export function __reloadShiftRolesForTest() {
  snapshotRaw = undefined;
  emit();
}
