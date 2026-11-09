// Staff-maintained state for each Tutor Application record (US 20026).
//
// One source of truth per business concept, shared by the applicant record,
// the Applications grid and Tutor Search:
//   Stage            -> stage selector, pipeline, Stage Timeline, grid, filters
//   Availability     -> Day / Time Preference, Overview summary, Tutor Search
//   Documents        -> PGC Training summary, checklist, match readiness
//   Inactive         -> matching eligibility
// Submitted wizard data (MOCK_TUTOR_APPLICANTS.applicationDetails) is never
// overwritten here; this store only holds what staff maintain on top of it.
//
// Persisted to localStorage so saved changes survive navigation and reload.
// Every storage access is guarded: the in-memory copy is authoritative and
// the page works the same when storage is unavailable.

import { useSyncExternalStore } from "react";
import {
  MOCK_TUTOR_APPLICANTS,
  TUTOR_STAGES,
  type CheckResult,
  type DocStatus,
  type PgcStatus,
  type TutorApplicant,
  type TutorSearchStatus,
  type TutorType,
} from "./mockTutorApplicantData";

// ─── Types ──────────────────────────────────────────────────────────────────

export type TutorStage = (typeof TUTOR_STAGES)[number];

export interface StageChange {
  stage: TutorStage;
  date: string;
  user: string;
}

export type { DocStatus };

export const DOC_STATUS_LABEL: Record<DocStatus, string> = {
  pending: "Pending",
  complete: "Complete",
  "pending-approval": "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
};

export const DOC_STATUS_BADGE_VARIANT: Record<
  DocStatus,
  "success" | "warning" | "info" | "neutral" | "error"
> = {
  pending: "neutral",
  complete: "success",
  "pending-approval": "warning",
  approved: "success",
  rejected: "error",
};

export type DocType = "e-signature" | "upload";

export interface DocumentRow {
  id: string;
  name: string;
  type: DocType;
  category: string;
  /** Uploaded documents staff must Approve / Reject. */
  requiresApproval: boolean;
  date: string | null;
  status: DocStatus;
  fileLabel?: string;
}

export type RefStatus = "submitted" | "awaiting";

export interface ReferenceRecord {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  status: RefStatus;
  sentDate: string;
  submittedDate?: string;
  notes: string;
}

export const REFERENCES_REQUESTED = 3;
export const REFERENCES_MINIMUM = 2;

export interface ManualCheck {
  result: CheckResult;
  date?: string;
}

export type TutorMatchStatus = "Active" | "Ended";

export interface TutorMatchSummary {
  id: string;
  youth: string;
  program?: string;
  startDate: string;
  endDate: string | null;
  endTime: string | null;
  status: TutorMatchStatus;
}

export interface TutorRecordState {
  stage: TutorStage;
  stageHistory: StageChange[];
  type: TutorType;
  inactive: boolean;
  coordinator: string;
  notes: string;
  subPrograms: TutorApplicant["subPrograms"];
  /** Selected slot keys, see availabilityKey(). */
  availability: string[];
  documents: DocumentRow[];
  references: ReferenceRecord[];
  /** Staff-reviewed checklist items; the rest are system-derived. */
  checks: { background: ManualCheck; orientation: ManualCheck };
  matches: TutorMatchSummary[];
  /**
   * US 20093: shared Tutor Match closures made when this tutor was marked
   * inactive, by Match id. Saved in the SAME write as `inactive`, so the
   * flag and the closures are durable together; the Tutor Match store
   * applies them (see tutorMatchStore).
   */
  sharedMatchClosures?: Record<string, SharedMatchClosure>;
}

export interface SharedMatchClosure {
  closedDate: string; // MM/DD/YYYY
  closedTime: string; // h:mm AM/PM
  /** Epoch ms of the confirmed action. */
  at: number;
  /** Match revision observed when the closure was planned (legacy). */
  matchRev?: number;
  /** The Tutor this closure belongs to; it never applies to a Match that
   *  has since been reassigned to another Tutor. */
  tutorId?: string;
}

// ─── Availability (Day / Time Preference) ──────────────────────────────────

export const AVAILABILITY_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
] as const;
export type AvailabilityDay =
  (typeof AVAILABILITY_DAYS)[number];

export const AVAILABILITY_CAMPUSES = [
  {
    campus: "West Loop Campus",
    label: "West Loop",
    slots: ["6:15–7:15 PM"],
  },
  {
    campus: "Walsh Campus",
    label: "Walsh-Morgan Park",
    slots: ["6:15–7:15 PM", "7:15–8:15 PM"],
  },
] as const;

export const AVAILABILITY_SLOT_COUNT =
  AVAILABILITY_DAYS.length *
  AVAILABILITY_CAMPUSES.reduce((n, c) => n + c.slots.length, 0);

export function availabilityKey(
  campus: string,
  day: AvailabilityDay,
  slot: string,
): string {
  return `${campus}|${day}|${slot}`;
}

const SHORT_DAY: Record<string, AvailabilityDay> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
};

/** Mon/Tue/Wed/Thu that have at least one selected slot, in week order. */
export function availableDays(
  availability: string[],
): string[] {
  return AVAILABILITY_DAYS.filter((day) =>
    availability.some((k) => k.split("|")[1] === day),
  ).map((d) => d.slice(0, 3));
}

// Seeds the grid from what the applicant submitted in the wizard: their
// supported days at their own campus (first slot; Walsh applicants also get
// the later slot on alternate days so both Walsh columns are exercised).
function submittedAvailability(a: TutorApplicant): string[] {
  const cfg =
    AVAILABILITY_CAMPUSES.find((c) => c.campus === a.campus) ??
    AVAILABILITY_CAMPUSES[0];
  const keys: string[] = [];
  a.applicationDetails.daysAvailable.forEach((short, i) => {
    const day = SHORT_DAY[short];
    if (!day) return;
    keys.push(availabilityKey(cfg.campus, day, cfg.slots[0]));
    if (cfg.slots[1] && i % 2 === 0)
      keys.push(availabilityKey(cfg.campus, day, cfg.slots[1]));
  });
  return keys;
}

// ─── Derived business rules ─────────────────────────────────────────────────

const PGC_DOC_ID = "doc-pgc";

export function pgcStatus(rec: TutorRecordState): PgcStatus {
  const doc = rec.documents.find((d) => d.id === PGC_DOC_ID);
  switch (doc?.status) {
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "pending-approval":
      return "pending-approval";
    default:
      return "pending";
  }
}

export function referencesReceived(
  rec: TutorRecordState,
): number {
  return rec.references.filter((r) => r.status === "submitted")
    .length;
}

export interface ChecklistItem {
  id:
    | "application"
    | "background"
    | "references"
    | "orientation"
    | "pgc";
  label: string;
  required: true;
  /** Manual items show Mark Passed / Mark Failed; system items never do. */
  manual: boolean;
  result: CheckResult;
  info?: string;
}

export function checklist(
  applicant: TutorApplicant,
  rec: TutorRecordState,
): ChecklistItem[] {
  const received = referencesReceived(rec);
  const pgc = pgcStatus(rec);
  const { background, orientation } = rec.checks;
  return [
    {
      id: "application",
      label: "Submitted Application",
      required: true,
      manual: false,
      result: "passed",
      info: `Submitted ${applicant.submitted}`,
    },
    {
      id: "background",
      label: "Completed Background Check",
      required: true,
      manual: true,
      result: background.result,
      info: background.date
        ? `Reviewed ${background.date}`
        : "Background check initiated — awaiting results.",
    },
    {
      id: "references",
      label: "Reference Forms Complete",
      required: true,
      manual: false,
      result:
        received >= REFERENCES_MINIMUM ? "passed" : "pending",
      info: `${received} of ${rec.references.length} responses received · minimum ${REFERENCES_MINIMUM} required`,
    },
    {
      id: "orientation",
      label: "Orientation Complete",
      required: true,
      manual: true,
      result: orientation.result,
      info: orientation.date
        ? `Reviewed ${orientation.date}`
        : "Orientation not yet attended.",
    },
    {
      id: "pgc",
      label: "Completed PGC Training",
      required: true,
      manual: false,
      result:
        pgc === "approved"
          ? "passed"
          : pgc === "rejected"
            ? "failed"
            : "pending",
      info:
        pgc === "approved"
          ? "PGC Training Certificate approved"
          : pgc === "rejected"
            ? "PGC Training Certificate rejected — re-upload required"
            : pgc === "pending-approval"
              ? "PGC Training Certificate uploaded — pending approval"
              : "PGC Training Certificate not uploaded",
    },
  ];
}

/** All five required checklist items have passed. */
export function readinessPassed(
  applicant: TutorApplicant,
  rec: TutorRecordState,
): boolean {
  return checklist(applicant, rec).every(
    (i) => i.result === "passed",
  );
}

/** Available for a new tutor match (Tutor Search). */
export function isAvailableForMatch(
  applicant: TutorApplicant,
  rec: TutorRecordState,
): boolean {
  return (
    rec.stage === "Ready for Match" &&
    !rec.inactive &&
    readinessPassed(applicant, rec)
  );
}

/**
 * Tutor Search listing: approved tutors (Ready for Match + every readiness
 * item passed). Inactive tutors stay listed as "Inactive" so staff can find
 * them, but only "Available" tutors can be matched.
 */
export function searchStatus(
  applicant: TutorApplicant,
  rec: TutorRecordState,
): TutorSearchStatus | null {
  if (
    rec.stage !== "Ready for Match" ||
    !readinessPassed(applicant, rec)
  )
    return null;
  if (rec.inactive) return "Inactive";
  if (rec.matches.some((m) => m.status === "Active"))
    return "Matched";
  return "Available";
}

// ─── Seeds ──────────────────────────────────────────────────────────────────

export const SYSTEM_USER = "System";
// Signed-in staff user (same name the utility bar uses).
export const CURRENT_USER = "Sohan Jadhavrao";

const STAGE_OFFSET_DAYS = [0, 4, 9, 16, 24, 31, 38, 45];

function addDays(mdy: string, days: number): string {
  const d = new Date(mdy);
  if (Number.isNaN(d.getTime())) return mdy;
  d.setDate(d.getDate() + days);
  return formatDisplayDate(d);
}

export function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function stageIndex(stage: TutorStage): number {
  return TUTOR_STAGES.indexOf(stage);
}

// Every applicant starts at Not Started (System, on submission) and has
// passed through each earlier stage. Closed/Rejected only appears when it is
// the current stage.
function seedHistory(
  a: TutorApplicant,
  stage: TutorStage,
): StageChange[] {
  const current = stageIndex(stage);
  const path = TUTOR_STAGES.filter(
    (s, i) =>
      i <= current &&
      (s !== "Closed/Rejected" || i === current),
  );
  return path.map((s, n) => ({
    stage: s,
    date: addDays(a.submitted, STAGE_OFFSET_DAYS[n] ?? n * 7),
    user: n === 0 ? SYSTEM_USER : a.coordinator,
  }));
}

function seedDocuments(
  a: TutorApplicant,
  stage: TutorStage,
): DocumentRow[] {
  const signed = stage !== "Not Started";
  const eSign = (
    id: string,
    name: string,
    category: string,
  ): DocumentRow => ({
    id,
    name,
    type: "e-signature",
    category,
    requiresApproval: false,
    date: signed ? a.submitted : null,
    status: signed ? "complete" : "pending",
    fileLabel: signed ? "Signed electronically" : undefined,
  });
  const pgc = a.pgc;
  const dcfsUploaded =
    stageIndex(stage) >= stageIndex("Needs Orientation");
  const dcfsApproved =
    stage === "Ready for Match" ||
    stage === "Determination Pending";
  return [
    eSign("doc-bgc", "Background Check Consent", "Consent"),
    eSign(
      "doc-cants",
      "CANTS 22 - Mandated Reporter Acknowledgment",
      "Consent",
    ),
    eSign("doc-attest", "Attestation", "Consent"),
    eSign(
      "doc-confid",
      "Client Confidentiality Agreement",
      "Policy",
    ),
    eSign("doc-ethics", "Code of Ethics", "Policy"),
    eSign("doc-publicity", "Publicity Release", "Consent"),
    {
      id: PGC_DOC_ID,
      name: "PGC Training Certificate",
      type: "upload",
      category: "Training",
      requiresApproval: true,
      date: pgc !== "pending" ? a.submitted : null,
      status: pgc,
      fileLabel:
        pgc !== "pending"
          ? `PGC_Certificate_${a.id}.pdf`
          : undefined,
    },
    {
      id: "doc-dcfs",
      name: "DCFS Mandated Reporter Certificate",
      type: "upload",
      category: "Training",
      requiresApproval: true,
      date: dcfsUploaded ? a.submitted : null,
      status: dcfsApproved
        ? "approved"
        : dcfsUploaded
          ? "pending-approval"
          : "pending",
      fileLabel: dcfsUploaded
        ? `DCFS_Mandated_Reporter_${a.id}.pdf`
        : undefined,
    },
  ];
}

const REFERENCE_SEEDS = [
  {
    name: "Patricia Alvarez",
    relationship: "Former Supervisor",
    email: "p.alvarez@example.org",
    phone: "(312) 555-0110",
    notes:
      "Direct supervisor for two years; strongly recommends.",
  },
  {
    name: "Jordan Blake",
    relationship: "Colleague",
    email: "jordan.blake@example.com",
    phone: "(773) 555-0142",
    notes: "Worked together on a community literacy program.",
  },
  {
    name: "Morgan Reyes",
    relationship: "Personal Reference",
    email: "morgan.reyes@example.com",
    phone: "(312) 555-0187",
    notes:
      "Family friend, familiar with applicant's work with kids.",
  },
];

function seedReferences(a: TutorApplicant): ReferenceRecord[] {
  return REFERENCE_SEEDS.slice(0, REFERENCES_REQUESTED).map(
    (r, i) => {
      const received = i < a.refsReceived;
      return {
        id: `${a.id}-ref-${i + 1}`,
        ...r,
        status: received ? "submitted" : "awaiting",
        sentDate: a.submitted,
        submittedDate: received ? a.submitted : undefined,
      };
    },
  );
}

const SEED_MATCHES: Record<string, TutorMatchSummary[]> = {
  "TA-102": [
    {
      id: "TM-3",
      youth: "Andre Wilson",
      startDate: "03/02/2026",
      endDate: null,
      endTime: null,
      status: "Active",
    },
    {
      id: "TM-2",
      youth: "Maya Brooks",
      startDate: "11/03/2025",
      endDate: "01/30/2026",
      endTime: "4:00 PM",
      status: "Ended",
    },
  ],
  "TA-104": [
    {
      id: "TM-4",
      youth: "Leah Ortiz",
      startDate: "01/12/2026",
      endDate: "06/30/2026",
      endTime: "5:30 PM",
      status: "Ended",
    },
  ],
};

// Applies a record's explicit seed (QA records) on top of the derived
// defaults, keeping dates/file labels consistent with each document status.
function applySeed(
  a: TutorApplicant,
  rec: TutorRecordState,
): TutorRecordState {
  const seed = a.seed;
  if (!seed) return rec;
  const next: TutorRecordState = { ...rec };
  if (seed.inactive !== undefined)
    next.inactive = seed.inactive;
  if (seed.stageHistory)
    next.stageHistory = seed.stageHistory.map((h) => ({
      stage: h.stage,
      date: formatDisplayDate(new Date(h.date)),
      user: h.user,
    }));
  if (seed.availability)
    next.availability = seed.availability.map((s) =>
      availabilityKey(s.campus, s.day, s.slot),
    );
  if (seed.documents) {
    const overrides = seed.documents;
    next.documents = rec.documents.map((d) => {
      const status = overrides[d.id as keyof typeof overrides];
      if (!status) return d;
      const done = status !== "pending";
      return {
        ...d,
        status,
        date: done ? a.submitted : null,
        fileLabel: !done
          ? undefined
          : d.type === "e-signature"
            ? "Signed electronically"
            : `${d.name.replace(/\W+/g, "_")}_${a.id}.pdf`,
      };
    });
  }
  if (seed.references)
    next.references = seed.references.map((r, i) => ({
      id: `${a.id}-ref-${i + 1}`,
      ...r,
      sentDate: a.submitted,
      submittedDate:
        r.status === "submitted" ? a.submitted : undefined,
      notes: "",
    }));
  if (seed.checks) {
    const reviewed = (result?: CheckResult): ManualCheck =>
      !result || result === "pending"
        ? { result: "pending" }
        : { result, date: addDays(a.submitted, 7) };
    next.checks = {
      background: seed.checks.background
        ? reviewed(seed.checks.background)
        : rec.checks.background,
      orientation: seed.checks.orientation
        ? reviewed(seed.checks.orientation)
        : rec.checks.orientation,
    };
  }
  if (seed.matches) next.matches = seed.matches;
  return next;
}

function seedRecord(a: TutorApplicant): TutorRecordState {
  return applySeed(a, deriveRecord(a));
}

function deriveRecord(a: TutorApplicant): TutorRecordState {
  const stage = a.stage as TutorStage;
  const idx = stageIndex(stage);
  const closed = stage === "Closed/Rejected";
  const pastBackground =
    !closed && idx > stageIndex("Awaiting Background Check");
  const pastOrientation =
    !closed && idx > stageIndex("Needs Orientation");
  return {
    stage,
    stageHistory: seedHistory(a, stage),
    type: a.tutorType ?? "InKind",
    inactive: a.searchStatus === "Inactive" && !closed,
    coordinator: a.coordinator,
    notes: a.notes,
    subPrograms: a.subPrograms,
    availability: submittedAvailability(a),
    documents: seedDocuments(a, stage),
    references: seedReferences(a),
    checks: {
      background: pastBackground
        ? { result: "passed", date: addDays(a.submitted, 9) }
        : { result: "pending" },
      orientation: pastOrientation
        ? { result: "passed", date: addDays(a.submitted, 24) }
        : { result: "pending" },
    },
    matches: SEED_MATCHES[a.id] ?? [],
  };
}

// ─── Store ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "mh.tutorApplicantRecords.v1";

function load(): Record<string, TutorRecordState> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw
      ? (JSON.parse(raw) as Record<string, TutorRecordState>)
      : {};
  } catch {
    return {};
  }
}

let records: Record<string, TutorRecordState> = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(records),
    );
  } catch {
    /* storage unavailable — in-memory state still applies */
  }
}

export function getTutorRecord(
  a: TutorApplicant,
): TutorRecordState {
  if (!records[a.id])
    records = { ...records, [a.id]: seedRecord(a) };
  return records[a.id];
}

function commit(id: string, next: TutorRecordState) {
  records = { ...records, [id]: next };
  persist();
  listeners.forEach((l) => l());
}

/**
 * All-or-nothing save of one tutor record: the full next state is written
 * in one setItem first; memory and subscribers change only on success.
 */
export function commitTutorRecordAtomic(
  a: TutorApplicant,
  next: TutorRecordState,
): boolean {
  const nextAll = { ...records, [a.id]: next };
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextAll),
    );
  } catch {
    return false;
  }
  records = nextAll;
  listeners.forEach((l) => l());
  return true;
}

/** Every saved tutor-inactive Match closure (US 20093), by Match id. */
export function getSharedMatchClosures(): Record<
  string,
  SharedMatchClosure
> {
  const out: Record<string, SharedMatchClosure> = {};
  Object.values(records).forEach((r) =>
    Object.assign(out, r.sharedMatchClosures ?? {}),
  );
  return out;
}

/** Approved and not marked inactive (live, saved state). */
export function isTutorApplicantEligible(
  applicantId: string,
): boolean {
  const a = MOCK_TUTOR_APPLICANTS.find(
    (x) => x.id === applicantId,
  );
  return (
    !!a &&
    a.status === "approved" &&
    !getTutorRecord(a).inactive
  );
}

/** Subscribe to tutor record changes (non-React callers). */
export function subscribeTutorRecords(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function updateTutorRecord(
  a: TutorApplicant,
  update: (rec: TutorRecordState) => TutorRecordState,
) {
  commit(a.id, update(getTutorRecord(a)));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Live record state for one applicant. */
export function useTutorRecord(
  a: TutorApplicant,
): TutorRecordState {
  return useSyncExternalStore(subscribe, () =>
    getTutorRecord(a),
  );
}

/** Live record state for every applicant (grids / search). */
export function useTutorRecords(): Record<
  string,
  TutorRecordState
> {
  return useSyncExternalStore(subscribe, () => {
    MOCK_TUTOR_APPLICANTS.forEach((a) => getTutorRecord(a));
    return records;
  });
}

// ─── Mutations ──────────────────────────────────────────────────────────────

/** Changes Stage and appends it to the Stage Timeline (never replaces). */
export function changeStage(
  rec: TutorRecordState,
  stage: TutorStage,
): TutorRecordState {
  if (rec.stage === stage) return rec;
  return {
    ...rec,
    stage,
    stageHistory: [
      ...rec.stageHistory,
      {
        stage,
        date: formatDisplayDate(new Date()),
        user: CURRENT_USER,
      },
    ],
  };
}

/** Ends every Active match at the current system date/time. */
export function endActiveMatches(rec: TutorRecordState): {
  rec: TutorRecordState;
  ended: number;
  endDate: string;
  endTime: string;
} {
  const now = new Date();
  const endDate = now.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
  const endTime = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  let ended = 0;
  const matches = rec.matches.map((m) => {
    if (m.status !== "Active") return m;
    ended += 1;
    return { ...m, status: "Ended" as const, endDate, endTime };
  });
  return { rec: { ...rec, matches }, ended, endDate, endTime };
}