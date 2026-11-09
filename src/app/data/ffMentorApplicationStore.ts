// Friends First Mentor Application store (US 20039) — the one place a
// submitted Mentor Application lives, read by application id from both the
// applicant side and the staff record.
//
// Same approach as ffMenteeStore.ts: a versioned localStorage key so records
// survive a refresh, and useSyncExternalStore so every reader sees writes
// immediately. Differences, on purpose:
//   • Saved data that cannot be read is reported as "unavailable" and is
//     never overwritten — writes are refused until it is fixed.
//   • Submitted answers and staff processing are stored side by side but
//     separately (`applications` vs `staff`), so applicant-facing reads can
//     never pick up staff-only fields.
//   • The SSN is only ever stored masked (maskSsn).
//
// Seed applications are read-only defaults: a saved record with the same id
// always wins, and a seed is only written to storage once something changes
// on it (e.g. a certificate upload).

import { useSyncExternalStore } from "react";
import {
  FF_EDITABLE_DESCRIBE_KEYS,
  FF_EDITABLE_OVERVIEW_KEYS,
  applyFFApplicationEdit,
  currentAvailability,
  validateFFApplicationDetails,
  type FFApplicationDetailsChange,
  type FFApplicationDetailsEdit,
  defaultFFMentorApplicationStaff,
  isFFMentorPipelineStage,
  isFFMentorSelectableStage,
  maskSsn,
  validateFFAvailability,
  type FFApplicationReference,
  FF_MAX_BUSINESS_REFERENCES,
  isBusinessReference,
  type FFActor,
  type FFChecklistResult,
  type FFMentorAvailability,
  type FFMentorMatchClosure,
  type FFDocumentReview,
  type FFReferenceRequestRecord,
  type FFAvailabilityOverride,
  type FFMatchReadiness,
  type FFMentorPipelineStage,
  type FFStageHistoryEntry,
  type FFCertificateKey,
  type FFFileRef,
  type FFMentorApplication,
  type FFMentorApplicationAnswers,
  type FFMentorApplicationStaff,
  type FFSubProgramId,
} from "./ffMentorApplication";
import {
  CONSTITUENTS,
  getConstituentStatus,
  type Constituent,
} from "./mockConstituents";
import {
  constituentLabel,
  type IdOption,
} from "./transitionSummaryDetailsSources";
import { SEED_FF_MENTOR_APPLICATIONS } from "./mockFFMentorApplications";
import {
  LEGACY_MENTOR_APPLICATIONS,
  LEGACY_MENTOR_STAFF,
} from "./ffLegacyMentorApplications";
import { localStamp } from "./ffMenteeIntake";
import {
  evaluateFFMentorReadiness,
  type FFMentorReadiness,
} from "./ffMentorChecklist";
import {
  checkDcfsDate,
  currentDocumentFile,
  ffDocumentDefinition,
  fileIdentity,
} from "./ffMentorDocuments";
import {
  applicableInterviewQuestions,
  interviewPayloadProblems,
  validateInterviewAnswers,
  type FFInterviewAnswers,
  type FFInterviewRecord,
} from "./ffMentorInterview";
import { CURRENT_CONNECTION_USER } from "../lib/connectionSchedulingNotification";

const STORAGE_KEY = "mh.ffMentorApplications.v1";

interface Persisted {
  version: 1;
  applications: Record<string, FFMentorApplication>;
  staff: Record<string, FFMentorApplicationStaff>;
  /** Mentor-level availability, by canonical mentor id (applicant id). */
  mentors?: Record<string, FFMentorAvailability>;
  /** Staff corrections to Application Details, by application id. The
   *  submitted / seeded application itself is never rewritten. */
  applicationEdits?: Record<string, FFApplicationDetailsEdit>;
  /** Staff-recorded Interview Summary, by exact application id. Staff-only:
   *  never part of the application or of applicant-facing reads. */
  interviews?: Record<string, FFInterviewRecord>;
  /** Constituent records created from a Mentor Application at Ready for
   *  Match, by constituent id. Kept in this state (not a second store) so a
   *  stage change and its constituent commit in one write. */
  constituents?: Record<string, Constituent>;
  /** Applicant id → the verified Constituent linked to that mentor and the
   *  applications that have entered Ready for Match for them. */
  constituentLinks?: Record<string, FFMentorConstituentLink>;
}

export interface FFMentorConstituentLink {
  constituentId: number;
  applicationIds: string[];
  createdAt: string;
  createdBy: string;
  createdById: string;
}

/** "corrupt" = saved data exists but can't be read; it is left untouched. */
type StorageHealth = "ok" | "unavailable" | "corrupt";

export type FFMentorApplicationLookup =
  | {
      status: "found";
      application: FFMentorApplication;
      staff: FFMentorApplicationStaff;
    }
  | { status: "missing" }
  | { status: "unavailable" };

export type FFMentorApplicationWrite =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "missing"
        | "conflict"
        | "invalid"
        | "storage"
        | "business-reference-limit";
    };

const emptyState = (): Persisted => ({
  version: 1,
  applications: {},
  staff: {},
});

function isPersisted(v: unknown): v is Persisted {
  const p = v as Partial<Persisted> | null;
  return (
    !!p &&
    p.version === 1 &&
    typeof p.applications === "object" &&
    p.applications !== null &&
    typeof p.staff === "object" &&
    p.staff !== null
  );
}

// ─── Narrow migration of valid saved records ───────────────────────────────

const SUB_PROGRAM_IDS: Record<string, FFSubProgramId> = {
  community: "community",
  work: "work",
  school: "school",
  "Community-Based": "community",
  "Work-Based": "work",
  "School-Based": "school",
};

/**
 * Older records may hold one sub-program (`subProgram`, or a string) and a
 * raw SSN. Everything else on the record is kept as saved.
 */
function normalizeApplication(
  raw: FFMentorApplication,
): FFMentorApplication {
  const legacy = raw as FFMentorApplication & {
    subProgram?: string;
    subPrograms?: unknown;
  };
  const list = Array.isArray(legacy.subPrograms)
    ? legacy.subPrograms
    : [legacy.subPrograms ?? legacy.subProgram].filter(Boolean);
  const subPrograms = list
    .map((s) => SUB_PROGRAM_IDS[String(s)])
    .filter((s): s is FFSubProgramId => !!s);
  const overview = raw.answers?.overview;
  return {
    ...raw,
    subPrograms,
    answers: overview
      ? {
          ...raw.answers,
          overview: { ...overview, ssn: maskSsn(overview.ssn) },
        }
      : raw.answers,
  };
}

/**
 * Chunk 1 saved `coordinator` (a name) and `internalNotes` (a list). Notes
 * carry over as text; a name can't be resolved to a staff id safely, so the
 * coordinator stays unassigned. A stage outside the pipeline is not mapped.
 */
function normalizeStaff(
  raw: unknown,
): FFMentorApplicationStaff {
  const s = (raw ?? {}) as Partial<FFMentorApplicationStaff> & {
    internalNotes?: { text?: string }[];
  };
  const base = defaultFFMentorApplicationStaff();
  return {
    ...base,
    ...s,
    stage: isFFMentorPipelineStage(s.stage) ? s.stage : null,
    inactive: s.inactive === true,
    coordinatorId:
      typeof s.coordinatorId === "number"
        ? s.coordinatorId
        : null,
    coordinatorNotes:
      typeof s.coordinatorNotes === "string"
        ? s.coordinatorNotes
        : (s.internalNotes ?? [])
            .map((n) => n.text ?? "")
            .filter(Boolean)
            .join("\n\n"),
    documentReviews: s.documentReviews ?? {},
    stageHistory: Array.isArray(s.stageHistory)
      ? s.stageHistory
      : [],
    availabilityOverride: normalizeAvailability(
      s.availabilityOverride,
    ),
    referenceResponses:
      s.referenceResponses &&
      typeof s.referenceResponses === "object"
        ? s.referenceResponses
        : {},
    referenceRequests:
      s.referenceRequests &&
      typeof s.referenceRequests === "object"
        ? s.referenceRequests
        : {},
    documentReviewHistory:
      s.documentReviewHistory &&
      typeof s.documentReviewHistory === "object"
        ? s.documentReviewHistory
        : {},
    checklistAssessments:
      s.checklistAssessments &&
      typeof s.checklistAssessments === "object"
        ? s.checklistAssessments
        : {},
  };
}

function normalizeAvailability(
  v: unknown,
): FFAvailabilityOverride | null {
  const a = v as
    Partial<FFAvailabilityOverride> | null | undefined;
  if (
    !a ||
    typeof a !== "object" ||
    !Array.isArray(a.availableDays)
  )
    return null;
  const yn = (x: unknown) =>
    typeof x === "boolean" ? x : null;
  return {
    availableDays: a.availableDays.filter(
      (d) => typeof d === "string",
    ),
    cbWeekendAvailable: yn(a.cbWeekendAvailable),
    cbWeekendDetails:
      typeof a.cbWeekendDetails === "string"
        ? a.cbWeekendDetails
        : "",
    sbTuesdayAvailable: yn(a.sbTuesdayAvailable),
    wbThursdayAvailable: yn(a.wbThursdayAvailable),
  };
}

/**
 * The one migration applied to saved data: a raw SSN is masked. Only the
 * records that hold one change; everything else stays exactly as saved.
 * (Other defaults are applied when a record is read, never written back.)
 */
function maskRawSsns(p: Persisted): {
  state: Persisted;
  changed: boolean;
} {
  let changed = false;
  const applications = { ...p.applications };
  for (const [id, a] of Object.entries(p.applications)) {
    const ssn = a?.answers?.overview?.ssn;
    if (
      typeof ssn === "string" &&
      ssn &&
      maskSsn(ssn) !== ssn
    ) {
      changed = true;
      applications[id] = {
        ...a,
        answers: {
          ...a.answers,
          overview: {
            ...a.answers.overview,
            ssn: maskSsn(ssn),
          },
        },
      };
    }
  }
  return {
    state: changed ? { ...p, applications } : p,
    changed,
  };
}

function load(): { state: Persisted; health: StorageHealth } {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { state: emptyState(), health: "unavailable" };
  }
  if (raw === null)
    return { state: emptyState(), health: "ok" };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { state: emptyState(), health: "corrupt" };
  }
  if (!isPersisted(parsed))
    return { state: emptyState(), health: "corrupt" };
  // A raw SSN is the only thing that forces a write on load, so it never
  // stays in storage. If that write fails, readers still only see the
  // masked copy.
  const { state, changed } = maskRawSsns(parsed);
  if (changed) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Keep the in-memory migration.
    }
  }
  return { state, health: "ok" };
}

let { state, health } = load();
const seeds = new Map(
  SEED_FF_MENTOR_APPLICATIONS.map((a) => [
    a.applicationId,
    normalizeApplication(a),
  ]),
);
// Seeded pre-wizard mentors, resolved by their own id like any application.
// Looked up and listed for staff, but kept out of listFFMentorApplications()
// so Mentor Search / Mentor Match eligibility is exactly what it was.
const legacySeeds = new Map(
  LEGACY_MENTOR_APPLICATIONS.map((a) => [
    a.applicationId,
    normalizeApplication(a),
  ]),
);
// Constituents created from applications are part of the saved state; bring
// the shared CONSTITUENTS array (what the Constituents list and profile
// route read) in line with it as soon as this module loads.
syncMentorConstituents();

const listeners = new Set<() => void>();
// Lookup results cached per id so useSyncExternalStore gets a stable
// snapshot; cleared on every commit.
let lookupCache = new Map<string, FFMentorApplicationLookup>();
let listSnapshot: FFMentorApplication[] | null = null;
let staffListSnapshot: FFMentorApplication[] | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * All-or-nothing write: the next state goes to storage in one setItem, and
 * memory/subscribers change only if it succeeded. Refused while the saved
 * data is unreadable so it is never replaced.
 */
function commit(next: Persisted): boolean {
  if (health === "corrupt") return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return false;
  }
  health = "ok";
  state = next;
  syncMentorConstituents();
  lookupCache = new Map();
  listSnapshot = null;
  staffListSnapshot = null;
  listeners.forEach((l) => l());
  return true;
}

function invalidate() {
  syncMentorConstituents();
  lookupCache = new Map();
  listSnapshot = null;
  staffListSnapshot = null;
  listeners.forEach((l) => l());
}

/**
 * Re-reads saved data so the next write builds on the latest copy (another
 * tab may have saved since this one loaded). Returns false when saved data
 * can't be read; it is then left untouched.
 */
function refreshFromStorage(): boolean {
  const fresh = load();
  if (fresh.health === "unavailable")
    return health !== "corrupt";
  if (fresh.health === "corrupt") {
    if (health !== "corrupt") {
      health = "corrupt";
      invalidate();
    }
    return false;
  }
  health = "ok";
  if (JSON.stringify(fresh.state) !== JSON.stringify(state)) {
    state = fresh.state;
    invalidate();
  }
  return true;
}

/**
 * Re-reads saved application data (incl. mentor availability and match
 * closures) for other modules that must decide on current data. False when
 * it can't be read.
 */
export function refreshFFMentorApplicationsFromStorage(): boolean {
  return refreshFromStorage();
}

// Saves made in another tab show up here too.
if (typeof window !== "undefined")
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY || e.key === null)
      refreshFromStorage();
  });

/** The application exactly as submitted (or seeded) — no staff corrections. */
function findBaseApplication(
  id: string,
): FFMentorApplication | undefined {
  const saved = state.applications[id];
  return saved
    ? normalizeApplication(saved)
    : (seeds.get(id) ?? legacySeeds.get(id));
}

/** The application staff see: base answers with staff corrections applied. */
function findApplication(
  id: string,
): FFMentorApplication | undefined {
  const base = findBaseApplication(id);
  return base
    ? applyFFApplicationEdit(base, state.applicationEdits?.[id])
    : undefined;
}

function findStaff(id: string): FFMentorApplicationStaff {
  // Defaults are applied on read only; the saved record isn't rewritten.
  // A saved record always wins over the seeded mentor's defaults.
  return normalizeStaff(
    state.staff[id] ?? LEGACY_MENTOR_STAFF[id],
  );
}

// ─── Staff reads ────────────────────────────────────────────────────────────

/** Exact application-id lookup. Never falls back to another record. */
export function getFFMentorApplication(
  applicationId: string,
): FFMentorApplicationLookup {
  const cached = lookupCache.get(applicationId);
  if (cached) return cached;
  let result: FFMentorApplicationLookup;
  if (health === "corrupt") result = { status: "unavailable" };
  else {
    const application = findApplication(applicationId);
    result = application
      ? {
          status: "found",
          application,
          staff: findStaff(applicationId),
        }
      : { status: "missing" };
  }
  lookupCache.set(applicationId, result);
  return result;
}

export function useFFMentorApplication(
  applicationId: string,
): FFMentorApplicationLookup {
  return useSyncExternalStore(subscribe, () =>
    getFFMentorApplication(applicationId),
  );
}

/** False when saved application data can't be read (not "no records"). */
export function isFFMentorApplicationDataAvailable(): boolean {
  return health !== "corrupt";
}

/** Every submitted application (saved records over seeds), for staff lists. */
export function listFFMentorApplications(): FFMentorApplication[] {
  if (health === "corrupt") return [];
  if (listSnapshot) return listSnapshot;
  const byId = new Map<string, FFMentorApplication>();
  for (const id of seeds.keys()) {
    const a = findApplication(id);
    if (a) byId.set(id, a);
  }
  Object.keys(state.applications).forEach((id) => {
    const a = findApplication(id);
    if (a) byId.set(a.applicationId, a);
  });
  listSnapshot = [...byId.values()];
  return listSnapshot;
}

/**
 * Every application a staff member can open from the Applications list: the
 * submitted ones plus the seeded mentors, each by its own id.
 */
export function listFFStaffApplications(): FFMentorApplication[] {
  if (health === "corrupt") return [];
  if (staffListSnapshot) return staffListSnapshot;
  const byId = new Map<string, FFMentorApplication>();
  for (const id of legacySeeds.keys()) {
    const a = findApplication(id);
    if (a) byId.set(id, a);
  }
  for (const a of listFFMentorApplications())
    byId.set(a.applicationId, a);
  staffListSnapshot = [...byId.values()];
  return staffListSnapshot;
}

export function useFFStaffApplications(): FFMentorApplication[] {
  return useSyncExternalStore(
    subscribe,
    listFFStaffApplications,
  );
}

export function useFFMentorApplications(): FFMentorApplication[] {
  return useSyncExternalStore(
    subscribe,
    listFFMentorApplications,
  );
}

/** Staff processing for a list row (no lookup object needed). */
export function getFFMentorApplicationStaff(
  applicationId: string,
): FFMentorApplicationStaff {
  return findStaff(applicationId);
}

// ─── Applicant-facing reads (never include staff processing) ───────────────

/** The applicant's own application, or undefined if it isn't theirs. */
export function getFFMentorApplicationForApplicant(
  applicationId: string,
  applicantId: string,
): FFMentorApplication | undefined {
  if (health === "corrupt") return undefined;
  // As submitted: staff corrections and processing are not shown here.
  const app = findBaseApplication(applicationId);
  return app && app.applicantId === applicantId
    ? app
    : undefined;
}

export function listFFMentorApplicationsForApplicant(
  applicantId: string,
): FFMentorApplication[] {
  if (health === "corrupt") return [];
  const ids = new Set([
    ...seeds.keys(),
    ...Object.keys(state.applications),
  ]);
  return [...ids]
    .map((id) => findBaseApplication(id))
    .filter(
      (a): a is FFMentorApplication =>
        !!a && a.applicantId === applicantId,
    );
}

// ─── Writes ─────────────────────────────────────────────────────────────────

function isValidApplication(a: FFMentorApplication): boolean {
  return (
    !!a.applicationId?.trim() &&
    !!a.applicantId?.trim() &&
    Array.isArray(a.subPrograms) &&
    a.subPrograms.length > 0 &&
    !!a.answers
  );
}

/**
 * Saves a submitted application under its own id, with the SSN masked.
 * Refuses a record whose id already belongs to a different applicant.
 * Certificates already uploaded are kept, and existing staff processing is
 * never touched.
 */
export function recordFFMentorApplicationSubmission(
  app: FFMentorApplication,
): FFMentorApplicationWrite {
  if (!isValidApplication(app))
    return { ok: false, reason: "invalid" };
  if (
    (app.references ?? []).filter(isBusinessReference).length >
    FF_MAX_BUSINESS_REFERENCES
  )
    return { ok: false, reason: "business-reference-limit" };
  if (!refreshFromStorage())
    return { ok: false, reason: "storage" };
  const existing = findBaseApplication(app.applicationId);
  if (existing && existing.applicantId !== app.applicantId)
    return { ok: false, reason: "conflict" };
  const saved = normalizeApplication({
    ...app,
    certificates: {
      ...existing?.certificates,
      ...app.certificates,
    },
  });
  const next: Persisted = {
    ...state,
    applications: {
      ...state.applications,
      [app.applicationId]: saved,
    },
  };
  return commit(next)
    ? { ok: true }
    : { ok: false, reason: "storage" };
}

/** Post-submission certificate upload, on the applicant's own application. */
export function attachFFMentorCertificate(
  applicationId: string,
  applicantId: string,
  key: FFCertificateKey,
  file: FFFileRef,
): FFMentorApplicationWrite {
  if (!refreshFromStorage())
    return { ok: false, reason: "storage" };
  const app = findBaseApplication(applicationId);
  if (!app) return { ok: false, reason: "missing" };
  if (app.applicantId !== applicantId)
    return { ok: false, reason: "conflict" };
  const next: Persisted = {
    ...state,
    applications: {
      ...state.applications,
      [applicationId]: {
        ...app,
        certificates: { ...app.certificates, [key]: file },
      },
    },
  };
  return commit(next)
    ? { ok: true }
    : { ok: false, reason: "storage" };
}

/**
 * Saves the Overview staff edits (Assigned Coordinator + Coordinator Notes).
 * Only the staff-processing record changes; applicant answers and
 * submission metadata are untouched.
 */
export function saveFFMentorCoordinatorDetails(
  applicationId: string,
  details: { coordinatorId: number; coordinatorNotes: string },
): FFMentorApplicationWrite {
  if (!refreshFromStorage())
    return { ok: false, reason: "storage" };
  if (!findApplication(applicationId))
    return { ok: false, reason: "missing" };
  if (!constituentLabel(details.coordinatorId))
    return { ok: false, reason: "invalid" };
  const next: Persisted = {
    ...state,
    staff: {
      ...state.staff,
      [applicationId]: {
        ...findStaff(applicationId),
        coordinatorId: details.coordinatorId,
        coordinatorNotes: details.coordinatorNotes,
      },
    },
  };
  return commit(next)
    ? { ok: true }
    : { ok: false, reason: "storage" };
}

/**
 * Saves staff-updated availability for one application. The submitted
 * answers stay as they are; only the staff-processing record's availability
 * changes, merged into its latest saved copy (coordinator, notes, stage,
 * history, Inactive and document reviews are kept). Weekend details are
 * cleared from the update when weekend availability is No.
 */
export function saveFFMentorAvailability(
  applicationId: string,
  availability: FFAvailabilityOverride,
): FFMentorApplicationWrite {
  if (!refreshFromStorage())
    return { ok: false, reason: "storage" };
  const app = findApplication(applicationId);
  if (!app) return { ok: false, reason: "missing" };
  const next = normalizeAvailability(availability);
  if (
    !next ||
    Object.keys(validateFFAvailability(app.subPrograms, next))
      .length
  )
    return { ok: false, reason: "invalid" };
  if (next.cbWeekendAvailable !== true)
    next.cbWeekendDetails = "";
  return commit({
    ...state,
    staff: {
      ...state.staff,
      [applicationId]: {
        ...findStaff(applicationId),
        availabilityOverride: next,
      },
    },
  })
    ? { ok: true }
    : { ok: false, reason: "storage" };
}

// ─── Application Details (staff corrections) ───────────────────────────────

export type FFApplicationDetailsWrite =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "missing"
        | "storage"
        | "invalid"
        | "protected"
        | "actor"
        | "conflict"
        | "empty";
      /** Field id → message, on an invalid change. */
      fieldErrors?: Record<string, string>;
      /** Field ids changed elsewhere while the draft was open. */
      conflicts?: string[];
      /** Protected keys named in a refused change. */
      protectedKeys?: string[];
    };

const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

/**
 * Saves staff corrections to one application's Application Details — an
 * explicit allowlist only — in ONE write. `base` holds what the draft
 * started from for each changed field; if any of those fields has since been
 * changed elsewhere nothing is saved (a conflict) and the caller keeps the
 * draft. Unrelated fields, references, uploads, signatures, stage, history,
 * approval, coordinator, document reviews, Inactive and match closures are
 * untouched, and the original application is never rewritten. Availability
 * goes to the same staff availability record the Availability & Preferences
 * editor uses.
 */
export function saveFFMentorApplicationDetails(
  applicationId: string,
  change: FFApplicationDetailsChange,
  base: FFApplicationDetailsChange,
  actor: FFActor | null = getFFActingUser(),
  now: Date = new Date(),
): FFApplicationDetailsWrite {
  if (!actor?.id?.trim() || !actor.name?.trim())
    return { ok: false, reason: "actor" };
  if (!refreshFromStorage())
    return { ok: false, reason: "storage" };
  const app = findApplication(applicationId);
  if (!app) return { ok: false, reason: "missing" };

  // Only allowlisted keys: a tampered payload naming anything else is
  // refused outright, before any value is looked at.
  const protectedKeys = [
    ...Object.keys(change.overview ?? {}).filter(
      (k) =>
        !(
          FF_EDITABLE_OVERVIEW_KEYS as readonly string[]
        ).includes(k),
    ),
    ...Object.keys(change.describe ?? {}).filter(
      (k) =>
        !(
          FF_EDITABLE_DESCRIBE_KEYS as readonly string[]
        ).includes(k),
    ),
    ...Object.keys(change).filter(
      (k) =>
        ![
          "overview",
          "describe",
          "subPrograms",
          "availability",
        ].includes(k),
    ),
  ];
  if (protectedKeys.length)
    return { ok: false, reason: "protected", protectedKeys };

  const staff = findStaff(applicationId);
  const hasChange =
    Object.keys(change.overview ?? {}).length > 0 ||
    Object.keys(change.describe ?? {}).length > 0 ||
    !!change.subPrograms ||
    !!change.availability;
  if (!hasChange) return { ok: false, reason: "empty" };

  // Conflicts: a changed field whose latest value is no longer what the
  // draft started from.
  const conflicts: string[] = [];
  const cur = app.answers;
  for (const k of Object.keys(change.overview ?? {}))
    if (
      !same(
        (cur.overview as unknown as Record<string, unknown>)[k],
        (
          base.overview as Record<string, unknown> | undefined
        )?.[k],
      )
    )
      conflicts.push(k);
  for (const k of Object.keys(change.describe ?? {}))
    if (
      !same(
        (cur.describe as unknown as Record<string, unknown>)[k],
        (
          base.describe as Record<string, unknown> | undefined
        )?.[k],
      )
    )
      conflicts.push(k);
  if (
    change.subPrograms &&
    !same(app.subPrograms, base.subPrograms)
  )
    conflicts.push("subPrograms");
  if (
    change.availability &&
    !same(currentAvailability(app, staff), base.availability)
  )
    conflicts.push("availability");
  if (conflicts.length)
    return { ok: false, reason: "conflict", conflicts };

  const effective = applyFFApplicationEdit(app, {
    overview: change.overview,
    describe: change.describe,
    subPrograms: change.subPrograms,
    updatedAt: "",
    updatedBy: "",
    updatedById: "",
  });
  const fieldErrors = validateFFApplicationDetails(
    change,
    effective,
  );
  if (Object.keys(fieldErrors).length)
    return { ok: false, reason: "invalid", fieldErrors };

  const prev = state.applicationEdits?.[applicationId];
  const { date, time } = localStamp(now);
  const edit: FFApplicationDetailsEdit = {
    overview: {
      ...(prev?.overview ?? {}),
      ...(change.overview ?? {}),
    },
    describe: {
      ...(prev?.describe ?? {}),
      ...(change.describe ?? {}),
    },
    ...(change.subPrograms || prev?.subPrograms
      ? { subPrograms: change.subPrograms ?? prev?.subPrograms }
      : {}),
    updatedAt: `${date} ${time}`,
    updatedBy: actor.name,
    updatedById: actor.id,
  };
  let nextStaff = state.staff;
  if (change.availability) {
    const av = normalizeAvailability(change.availability);
    if (!av) return { ok: false, reason: "invalid" };
    if (av.cbWeekendAvailable !== true)
      av.cbWeekendDetails = "";
    nextStaff = {
      ...state.staff,
      [applicationId]: { ...staff, availabilityOverride: av },
    };
  }
  return commit({
    ...state,
    staff: nextStaff,
    applicationEdits: {
      ...(state.applicationEdits ?? {}),
      [applicationId]: edit,
    },
  })
    ? { ok: true }
    : { ok: false, reason: "storage" };
}

/** Who last corrected this application's details, and when (if anyone). */
export function getFFApplicationDetailsEditInfo(
  applicationId: string,
): { updatedBy: string; updatedAt: string } | null {
  const e = state.applicationEdits?.[applicationId];
  return e
    ? { updatedBy: e.updatedBy, updatedAt: e.updatedAt }
    : null;
}

// ─── Interview Summary (staff-only) ─────────────────────────────────────────

const noInterviewAnswers: FFInterviewAnswers = Object.freeze(
  {},
) as FFInterviewAnswers;

/** The saved interview for one application id, or null. Read-only: nothing
 *  is created by reading. Anything malformed in saved data is ignored. */
export function getFFMentorInterview(
  applicationId: string,
): FFInterviewRecord | null {
  const r = state.interviews?.[applicationId];
  if (
    !r ||
    typeof r !== "object" ||
    typeof r.answers !== "object" ||
    !r.answers
  )
    return null;
  return r;
}

export function useFFMentorInterview(
  applicationId: string,
): FFInterviewRecord | null {
  return useSyncExternalStore(subscribe, () =>
    getFFMentorInterview(applicationId),
  );
}

export type FFInterviewWrite =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "missing"
        | "storage"
        | "invalid"
        | "unknown"
        | "actor"
        | "conflict"
        | "empty";
      /** Question id → message, on an invalid save. */
      fieldErrors?: Record<string, string>;
      /** Question ids changed elsewhere while the draft was open. */
      conflicts?: string[];
      /** Keys in a refused payload that are not interview questions, or
       *  whose value has the wrong type, or that do not apply. */
      rejectedKeys?: string[];
    };

/**
 * Saves interview answers for one application in ONE write, into the
 * staff-only `interviews` record — separate from the submitted answers, the
 * Application Details corrections and everything else, none of which is
 * touched (the latest saved state is re-read first and merged into).
 *
 * `change` holds only the answers that changed and `base` what each started
 * from; if any of those was changed elsewhere meanwhile nothing is saved
 * (conflict). Unknown ids, wrong value types and answers to questions that
 * do not apply to the application's current sub-programs / children answer
 * are refused. Every applicable mandatory text question must be answered
 * (non-blank). Answers to questions that are currently hidden are retained.
 */
export function saveFFMentorInterview(
  applicationId: string,
  change: FFInterviewAnswers,
  base: Record<string, string | undefined>,
  actor: FFActor | null = getFFActingUser(),
  now: Date = new Date(),
): FFInterviewWrite {
  if (!actor?.id?.trim() || !actor.name?.trim())
    return { ok: false, reason: "actor" };
  if (!refreshFromStorage())
    return { ok: false, reason: "storage" };
  const app = findApplication(applicationId);
  if (!app) return { ok: false, reason: "missing" };
  if (
    !change ||
    typeof change !== "object" ||
    Array.isArray(change)
  )
    return { ok: false, reason: "unknown" };
  const keys = Object.keys(change);
  if (!keys.length) return { ok: false, reason: "empty" };

  const problems = interviewPayloadProblems(change);
  if (problems.unknown.length || problems.badValue.length)
    return {
      ok: false,
      reason: "unknown",
      rejectedKeys: [...problems.unknown, ...problems.badValue],
    };

  const prev = getFFMentorInterview(applicationId);
  const saved = prev?.answers ?? noInterviewAnswers;

  const conflicts = keys.filter(
    (k) => !same(saved[k], base?.[k]),
  );
  if (conflicts.length)
    return { ok: false, reason: "conflict", conflicts };

  const merged: FFInterviewAnswers = { ...saved, ...change };
  const applicable = new Set(
    applicableInterviewQuestions(app.subPrograms, merged).map(
      (q) => q.id,
    ),
  );
  const notApplicable = keys.filter((k) => !applicable.has(k));
  if (notApplicable.length)
    return {
      ok: false,
      reason: "unknown",
      rejectedKeys: notApplicable,
    };

  const fieldErrors = validateInterviewAnswers(
    app.subPrograms,
    merged,
  );
  if (Object.keys(fieldErrors).length)
    return { ok: false, reason: "invalid", fieldErrors };

  const { date, time } = localStamp(now);
  const record: FFInterviewRecord = {
    answers: merged,
    updatedAt: `${date} ${time}`,
    updatedBy: actor.name,
    updatedById: actor.id,
  };
  return commit({
    ...state,
    interviews: {
      ...(state.interviews ?? {}),
      [applicationId]: record,
    },
  })
    ? { ok: true }
    : { ok: false, reason: "storage" };
}

// ─── Constituents created at Ready for Match ───────────────────────────────

/** The Role value (distinct from Type = Individual). A literal, not a
 *  const, because syncMentorConstituents runs while this module loads. */
function mentorRole(): Constituent["role"] {
  return "Friends First Mentor";
}

/** True for a record this workflow created and still owns. */
function isMentorConstituent(c: Constituent): boolean {
  return (
    !!c.ffMentorApplicantId &&
    c.type === "Individual" &&
    c.role === mentorRole()
  );
}

/**
 * Makes the shared CONSTITUENTS array match the saved mentor constituents:
 * adds missing ones, refreshes the ones this workflow owns in place (so
 * readers holding the array see the change) and removes owned entries that
 * are no longer saved. Records this workflow does not own are never touched.
 */
function syncMentorConstituents(): void {
  const saved = state.constituents ?? {};
  const savedIds = new Set<number>();
  for (const c of Object.values(saved)) {
    if (
      !c ||
      typeof c.id !== "number" ||
      !isMentorConstituent(c)
    )
      continue;
    savedIds.add(c.id);
    const live = CONSTITUENTS.find((x) => x.id === c.id);
    if (!live) CONSTITUENTS.unshift({ ...c });
    else if (isMentorConstituent(live)) Object.assign(live, c);
  }
  for (let i = CONSTITUENTS.length - 1; i >= 0; i--)
    if (
      isMentorConstituent(CONSTITUENTS[i]) &&
      !savedIds.has(CONSTITUENTS[i].id)
    )
      CONSTITUENTS.splice(i, 1);
}

/** Next constituent id: above every seeded, in-memory and saved id. */
function nextConstituentId(): number {
  const ids = [
    ...CONSTITUENTS.map((c) => c.id),
    ...Object.values(state.constituents ?? {}).map((c) => c.id),
  ];
  return Math.max(0, ...ids) + 1;
}

/** The mentor's verified Constituent link, or null. Verified = the link's
 *  constituent exists, is owned by this workflow and names this applicant. */
export function getFFMentorConstituentLink(
  applicantId: string,
): { constituentId: number; applicationIds: string[] } | null {
  const link = state.constituentLinks?.[applicantId];
  if (!link) return null;
  const c = state.constituents?.[String(link.constituentId)];
  return c &&
    isMentorConstituent(c) &&
    c.ffMentorApplicantId === applicantId
    ? {
        constituentId: c.id,
        applicationIds: link.applicationIds,
      }
    : null;
}

const linkExists = (applicantId: string) =>
  !!state.constituentLinks?.[applicantId];

export function useFFMentorConstituentLink(
  applicantId: string,
) {
  const key = useSyncExternalStore(subscribe, () => {
    const l = getFFMentorConstituentLink(applicantId);
    return l ? String(l.constituentId) : "";
  });
  return key ? Number(key) : null;
}

/** Application fields → constituent fields (see the Chunk 4 mapping table).
 *  Built from the staff-corrected effective application. */
function constituentFromApplication(
  app: FFMentorApplication,
  base: Constituent | null,
  id: number,
  now: Date,
): Constituent {
  const o = app.answers.overview;
  const t = (v: string | undefined) => (v ?? "").trim();
  const first = t(o.firstName);
  const last = t(o.lastName);
  return {
    ...(base ?? {}),
    id,
    name: [first, last].filter(Boolean).join(" "),
    type: "Individual",
    role: mentorRole(),
    status: base?.status ?? "Active",
    program: "Friends First",
    lastUpdated: localIsoDate(now),
    email: t(o.email),
    phone: t(o.phone),
    ffMentorApplicantId: app.applicantId,
    mentorDetails: {
      firstName: first,
      middleName: t(o.middleName),
      lastName: last,
      dob: t(o.dob),
      sex: t(o.sex),
      ethnicity: t(o.ethnicity),
      maritalStatus: t(o.maritalStatus),
      religion: t(o.religion),
      address: {
        line1: t(o.address),
        city: t(o.city),
        state: t(o.state),
        zip: t(o.zip),
      },
    },
  };
}

const localIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export type FFReadyForMatchPreview =
  | { status: "missing" }
  | { status: "blocked"; reasons: string[] }
  | { status: "link-invalid" }
  | { status: "create" }
  | { status: "reuse"; constituentId: number };

/** What confirming Ready for Match would do, on the latest saved data.
 *  Writes nothing. */
export function previewFFReadyForMatch(
  applicationId: string,
  now?: Date,
): FFReadyForMatchPreview {
  refreshFromStorage();
  const app = findApplication(applicationId);
  if (!app) return { status: "missing" };
  const readiness = getFFMentorMatchReadiness(
    applicationId,
    now,
  );
  if (!readiness.verified)
    return {
      status: "blocked",
      reasons: readiness.reasons ?? [],
    };
  const link = getFFMentorConstituentLink(app.applicantId);
  if (link)
    return {
      status: "reuse",
      constituentId: link.constituentId,
    };
  return linkExists(app.applicantId)
    ? { status: "link-invalid" }
    : { status: "create" };
}

// ─── Stage changes ──────────────────────────────────────────────────────────

/**
 * The current checklist and readiness for one application, from the latest
 * data in memory. Never saved — always recalculated.
 */
export function getFFMentorReadiness(
  applicationId: string,
  now?: Date,
): FFMentorReadiness | null {
  if (health === "corrupt") return null;
  const app = findApplication(applicationId);
  return app
    ? evaluateFFMentorReadiness(app, findStaff(applicationId), {
        now,
      })
    : null;
}

/**
 * Whether this mentor is eligible for Ready for Match: every applicable
 * checklist requirement Passed and nothing unknown. It doesn't depend on
 * the current stage (the stage gate checks it before moving there).
 * Callers can't assert readiness themselves.
 */
export function getFFMentorMatchReadiness(
  applicationId: string,
  now?: Date,
): FFMatchReadiness {
  const r = getFFMentorReadiness(applicationId, now);
  if (!r)
    return {
      verified: false,
      reason: "Match readiness has not been verified.",
      reasons: [],
    };
  return r.eligible
    ? { verified: true, reasons: [] }
    : {
        verified: false,
        reason: "Match readiness has not been verified.",
        reasons: r.reasons,
      };
}

/**
 * The staff user acting in this prototype — the same signed-in user the
 * rest of the app attributes actions to (no real authentication yet).
 */
export function getFFActingUser(): FFActor | null {
  const u = CURRENT_CONNECTION_USER;
  return u?.id && u.name ? { id: u.id, name: u.name } : null;
}

export type FFStageChangeResult =
  | {
      ok: true;
      changed: boolean;
      /** Set when the move into Ready for Match created or updated the
       *  mentor's linked Constituent. */
      constituent?: { id: number; created: boolean };
    }
  | {
      ok: false;
      reason:
        | "missing"
        | "storage"
        | "invalid"
        | "actor"
        | "not-ready"
        | "constituent-link"
        | "conflict";
      /** The latest saved stage, on a conflict. */
      currentStage?: FFMentorPipelineStage | null;
      /** Blocking readiness reasons, when refused as not ready. */
      reasons?: string[];
    };

export const newFFEventId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `stage-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * Moves an application to another pipeline stage and records who did it,
 * in one saved update. Builds on the latest saved staff record; refuses if
 * the stage changed since the editor opened (`expectedStage`). Saving the
 * stage it already has is a no-op. Nothing else changes — documents,
 * checklist, submission status, Inactive, matches and answers stay as they
 * are.
 */
export function changeFFMentorStage(
  applicationId: string,
  change: {
    stage: string;
    expectedStage: FFMentorPipelineStage | null;
    actor: FFActor | null;
    now?: Date;
  },
): FFStageChangeResult {
  const { stage, expectedStage, actor } = change;
  if (!isFFMentorSelectableStage(stage))
    return { ok: false, reason: "invalid" };
  if (!actor?.id?.trim() || !actor.name?.trim())
    return { ok: false, reason: "actor" };
  if (!refreshFromStorage())
    return { ok: false, reason: "storage" };
  if (!findApplication(applicationId))
    return { ok: false, reason: "missing" };
  const latest = findStaff(applicationId);
  if (latest.stage !== expectedStage)
    return {
      ok: false,
      reason: "conflict",
      currentStage: latest.stage,
    };
  if (latest.stage === stage)
    return { ok: true, changed: false };
  // Eligibility is checked on the latest saved data before the stage moves;
  // it doesn't require the record to be at Ready for Match already.
  if (stage === "Ready for Match") {
    const readiness = getFFMentorMatchReadiness(
      applicationId,
      change.now,
    );
    if (!readiness.verified)
      return {
        ok: false,
        reason: "not-ready",
        reasons: readiness.reasons ?? [],
      };
  }
  const when = change.now ?? new Date();
  const { date, time } = localStamp(when);
  const entry: FFStageHistoryEntry = {
    id: newFFEventId(),
    fromStage: latest.stage,
    stage,
    at: `${date} ${time}`,
    atIso: when.toISOString(),
    by: actor.name,
    byId: actor.id,
  };
  const nextStaff = {
    ...state.staff,
    [applicationId]: {
      ...latest,
      stage,
      stageHistory: [...latest.stageHistory, entry],
    },
  };

  // Entering Ready for Match also creates (or updates) the mentor's linked
  // Constituent. The stage, history, record and link commit in ONE write; the
  // shared CONSTITUENTS array only changes after that write succeeded.
  if (stage === "Ready for Match") {
    const app = findApplication(applicationId)!;
    const existing = getFFMentorConstituentLink(
      app.applicantId,
    );
    // A link that no longer resolves to its own record is never replaced
    // by a new record or a look-alike: staff must resolve it.
    if (!existing && linkExists(app.applicantId))
      return { ok: false, reason: "constituent-link" };
    const id = existing?.constituentId ?? nextConstituentId();
    const record = constituentFromApplication(
      app,
      existing
        ? (state.constituents?.[String(id)] ?? null)
        : null,
      id,
      when,
    );
    const prevLink = state.constituentLinks?.[app.applicantId];
    const link: FFMentorConstituentLink = {
      constituentId: id,
      applicationIds: [
        ...new Set([
          ...(prevLink?.applicationIds ?? []),
          applicationId,
        ]),
      ],
      createdAt: prevLink?.createdAt ?? `${date} ${time}`,
      createdBy: prevLink?.createdBy ?? actor.name,
      createdById: prevLink?.createdById ?? actor.id,
    };
    return commit({
      ...state,
      staff: nextStaff,
      constituents: {
        ...(state.constituents ?? {}),
        [String(id)]: record,
      },
      constituentLinks: {
        ...(state.constituentLinks ?? {}),
        [app.applicantId]: link,
      },
    })
      ? {
          ok: true,
          changed: true,
          constituent: { id, created: !existing },
        }
      : { ok: false, reason: "storage" };
  }

  return commit({ ...state, staff: nextStaff })
    ? { ok: true, changed: true }
    : { ok: false, reason: "storage" };
}

// ─── Reference requests ─────────────────────────────────────────────────────

/**
 * Records a reference request the delivery service confirmed, against the
 * exact application and reference. Response status and content are not
 * touched — a request never counts as a response.
 */
export function recordFFReferenceRequest(
  applicationId: string,
  referenceId: string,
  entry: FFReferenceRequestRecord,
): FFMentorApplicationWrite {
  if (!refreshFromStorage())
    return { ok: false, reason: "storage" };
  const app = findApplication(applicationId);
  if (!app) return { ok: false, reason: "missing" };
  if (!(app.references ?? []).some((r) => r.id === referenceId))
    return { ok: false, reason: "missing" };
  const latest = findStaff(applicationId);
  return commit({
    ...state,
    staff: {
      ...state.staff,
      [applicationId]: {
        ...latest,
        referenceRequests: {
          ...latest.referenceRequests,
          [referenceId]: [
            ...(latest.referenceRequests[referenceId] ?? []),
            entry,
          ],
        },
      },
    },
  })
    ? { ok: true }
    : { ok: false, reason: "storage" };
}

// ─── Document reviews ───────────────────────────────────────────────────────

export type FFDocumentReviewResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "missing"
        | "storage"
        | "invalid"
        | "actor"
        | "no-file"
        | "file-changed"
        | "invalid-date";
      message?: string;
    };

/**
 * Saves an Approve/Reject decision about one exact uploaded file. Builds on
 * the latest saved record; refuses if the current file isn't the one that
 * was reviewed (`fileId`), or if it has no file identity. A DCFS approval
 * needs a certificate date within three years. The previous decision moves
 * to history. Stage and submission status never change here.
 */
export function saveFFDocumentReview(
  applicationId: string,
  type: string,
  review: {
    decision: "approved" | "rejected";
    fileId: string;
    actor: FFActor | null;
    note?: string;
    verifiedDocumentDate?: string;
    now?: Date;
  },
): FFDocumentReviewResult {
  const def = ffDocumentDefinition(type);
  if (
    !def ||
    (review.decision !== "approved" &&
      review.decision !== "rejected")
  )
    return { ok: false, reason: "invalid" };
  const { actor } = review;
  if (!actor?.id?.trim() || !actor.name?.trim())
    return { ok: false, reason: "actor" };
  if (!refreshFromStorage())
    return { ok: false, reason: "storage" };
  const app = findApplication(applicationId);
  if (!app) return { ok: false, reason: "missing" };
  if (!def.programs.some((p) => app.subPrograms.includes(p)))
    return { ok: false, reason: "invalid" };
  const file = currentDocumentFile(app, def);
  const currentId = fileIdentity(file);
  if (!currentId) return { ok: false, reason: "no-file" };
  if (currentId !== review.fileId)
    return { ok: false, reason: "file-changed" };
  let verifiedDocumentDate: string | undefined;
  if (def.type === "dcfs" && review.decision === "approved") {
    const check = checkDcfsDate(
      file,
      review.verifiedDocumentDate,
      review.now,
    );
    if (!check.ok)
      return {
        ok: false,
        reason: "invalid-date",
        message: check.reason,
      };
    if (check.source === "reviewer")
      verifiedDocumentDate =
        review.verifiedDocumentDate!.trim();
  }
  const latest = findStaff(applicationId);
  const previous = latest.documentReviews[def.type];
  const when = review.now ?? new Date();
  const { date, time } = localStamp(when);
  const next: FFDocumentReview = {
    status: review.decision,
    reviewedBy: actor.name,
    reviewedById: actor.id,
    reviewedAt: `${date} ${time}`,
    reviewedAtIso: when.toISOString(),
    fileId: currentId,
    ...(review.note?.trim()
      ? { note: review.note.trim() }
      : {}),
    ...(verifiedDocumentDate ? { verifiedDocumentDate } : {}),
  };
  return commit({
    ...state,
    staff: {
      ...state.staff,
      [applicationId]: {
        ...latest,
        documentReviews: {
          ...latest.documentReviews,
          [def.type]: next,
        },
        documentReviewHistory: previous
          ? {
              ...latest.documentReviewHistory,
              [def.type]: [
                ...(latest.documentReviewHistory[def.type] ??
                  []),
                previous,
              ],
            }
          : latest.documentReviewHistory,
      },
    },
  })
    ? { ok: true }
    : { ok: false, reason: "storage" };
}

// ─── Checklist assessments ──────────────────────────────────────────────────

/**
 * Saves staff results for manual checklist items. Only staff items that
 * apply can be saved; system items are never written. Unchanged items keep
 * their earlier assessor and time. No stage or history change.
 */
export function saveFFChecklistAssessments(
  applicationId: string,
  changes: Record<
    string,
    { result: FFChecklistResult; note?: string }
  >,
  actor: FFActor | null,
  now: Date = new Date(),
): FFMentorApplicationWrite | { ok: false; reason: "actor" } {
  if (!actor?.id?.trim() || !actor.name?.trim())
    return { ok: false, reason: "actor" };
  if (!refreshFromStorage())
    return { ok: false, reason: "storage" };
  const app = findApplication(applicationId);
  if (!app) return { ok: false, reason: "missing" };
  const latest = findStaff(applicationId);
  const items = evaluateFFMentorReadiness(app, latest, {
    now,
  }).items;
  const { date, time } = localStamp(now);
  const next = { ...latest.checklistAssessments };
  for (const [id, c] of Object.entries(changes)) {
    const item = items.find((i) => i.id === id);
    if (
      !item ||
      item.kind !== "staff" ||
      item.applicability !== "applies"
    )
      return { ok: false, reason: "invalid" };
    if (!["Pending", "Passed", "Failed"].includes(c.result))
      return { ok: false, reason: "invalid" };
    const note = c.note?.trim() || undefined;
    const prev = next[id];
    if (
      prev
        ? prev.result === c.result &&
          (prev.note ?? undefined) === note
        : c.result === "Pending" && !note
    )
      continue;
    next[id] = {
      result: c.result,
      ...(note ? { note } : {}),
      assessedBy: actor.name,
      assessedById: actor.id,
      assessedAt: `${date} ${time}`,
      assessedAtIso: now.toISOString(),
    };
  }
  return commit({
    ...state,
    staff: {
      ...state.staff,
      [applicationId]: {
        ...latest,
        checklistAssessments: next,
      },
    },
  })
    ? { ok: true }
    : { ok: false, reason: "storage" };
}

// ─── Mentor availability ────────────────────────────────────────────────────

export interface FFMentorAvailabilityState {
  mentorId: string;
  inactive: boolean;
  /** Where the setting comes from: the mentor record, or an older
   *  per-application flag saved before mentor-level availability existed. */
  source: "mentor" | "legacy-application" | "none";
  record?: FFMentorAvailability;
}

/** The canonical mentor id of an application: its applicant id. */
export const ffMentorIdOf = (app: FFMentorApplication) =>
  app.applicantId;

/**
 * Every application belonging to one mentor that staff can open — submitted
 * applications and the older seeded mentors alike, by applicant id. (The
 * strict new-match population, listFFMentorApplications, is unchanged: this
 * only lets availability be read and saved for any record the staff page
 * can show.)
 */
export function listFFMentorApplicationsForMentor(
  mentorId: string,
): FFMentorApplication[] {
  return listFFStaffApplications().filter(
    (a) => a.applicantId === mentorId,
  );
}

/**
 * The one Inactive decision for a mentor, shared by all their applications.
 * Before a mentor record exists, an older per-application Inactive flag on
 * any of their applications still counts (read only — never written again).
 */
export function getFFMentorAvailability(
  mentorId: string,
): FFMentorAvailabilityState {
  const record = state.mentors?.[mentorId];
  if (record)
    return {
      mentorId,
      inactive: record.inactive === true,
      source: "mentor",
      record,
    };
  const legacy = listFFMentorApplicationsForMentor(
    mentorId,
  ).some((a) => findStaff(a.applicationId).inactive);
  return {
    mentorId,
    inactive: legacy,
    source: legacy ? "legacy-application" : "none",
  };
}

/** All mentor Inactive closures, by match id (for the match store). */
export function getFFMentorMatchClosures(): Record<
  string,
  FFMentorMatchClosure
> {
  const out: Record<string, FFMentorMatchClosure> = {};
  for (const m of Object.values(state.mentors ?? {}))
    Object.assign(out, m.matchClosures ?? {});
  return out;
}

/**
 * Saves a mentor's Inactive setting and any match closures in ONE write;
 * memory and subscribers change only if it succeeds. Existing closures are
 * kept. Applications, stages and staff processing are untouched.
 */
export function commitFFMentorAvailability(
  mentorId: string,
  change: {
    inactive: boolean;
    closures?: Record<string, FFMentorMatchClosure>;
    actor: FFActor | null;
    now?: Date;
  },
  /** Optional check against the latest data, run after re-reading it. */
  verify?: () => boolean,
): FFMentorApplicationWrite | { ok: false; reason: "actor" } {
  const { actor } = change;
  if (!actor?.id?.trim() || !actor.name?.trim())
    return { ok: false, reason: "actor" };
  if (!refreshFromStorage())
    return { ok: false, reason: "storage" };
  if (!listFFMentorApplicationsForMentor(mentorId).length)
    return { ok: false, reason: "missing" };
  if (verify && !verify())
    return { ok: false, reason: "conflict" };
  const when = change.now ?? new Date();
  const { date, time } = localStamp(when);
  const prev = state.mentors?.[mentorId];
  const record: FFMentorAvailability = {
    inactive: change.inactive,
    changedAt: `${date} ${time}`,
    changedBy: actor.name,
    changedById: actor.id,
    matchClosures: {
      ...(prev?.matchClosures ?? {}),
      ...(change.closures ?? {}),
    },
  };
  return commit({
    ...state,
    mentors: { ...(state.mentors ?? {}), [mentorId]: record },
  })
    ? { ok: true }
    : { ok: false, reason: "storage" };
}

// ─── Coordinator source ─────────────────────────────────────────────────────

/** Active Individual constituents with the MHBG Staff role. */
export function mhbgCoordinatorOptions(): IdOption[] {
  return CONSTITUENTS.filter(
    (c) =>
      c.type === "Individual" &&
      c.role === "MHBG Staff" &&
      c.status === "Active" &&
      getConstituentStatus(c) === "Active",
  )
    .map((c) => ({ id: c.id, label: c.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** Display name for a saved coordinator id, even if no longer active. */
export function coordinatorName(
  id: number | null,
): string | undefined {
  return id === null ? undefined : constituentLabel(id);
}

// ─── VMS submission adapter ─────────────────────────────────────────────────

/** A browser File, or anything with the same identifying fields. */
interface FileLike {
  name: string;
  type: string;
  size: number;
}

/**
 * The VMS Mentor Application Wizard's saved state (its FFDraft, minus the
 * current step) — answers keyed exactly as the wizard keeps them.
 */
export type FFVmsMentorSubmission =
  Partial<FFMentorApplicationAnswers> & {
    subPrograms: FFSubProgramId[];
    refs: FFApplicationReference[];
    uploads?: Record<string, FileLike | null>;
  };

/**
 * Builds the shared record from a VMS submission without reshaping answers
 * (the SSN is masked when saved). Empty upload slots are skipped — no file
 * metadata is invented.
 */
export function fromVmsMentorSubmission(input: {
  applicationId: string;
  applicantId: string;
  startedAt: string;
  submittedAt: string;
  submission: FFVmsMentorSubmission;
}): FFMentorApplication {
  const { submission: s, submittedAt } = input;
  const uploads: Record<string, FFFileRef> = {};
  Object.entries(s.uploads ?? {}).forEach(([key, f]) => {
    if (f)
      uploads[key] = {
        fileName: f.name,
        mimeType: f.type,
        sizeBytes: f.size,
        uploadedAt: submittedAt,
      };
  });
  return {
    applicationId: input.applicationId,
    applicantId: input.applicantId,
    program: "friends-first",
    subPrograms: [...s.subPrograms],
    applicantStatus: "error", // what VMS shows on submit today (prototype)
    startedAt: input.startedAt,
    submittedAt,
    answers: {
      overview: {
        ...s.overview!,
        ssn: maskSsn(s.overview?.ssn),
      },
      describe: s.describe!,
      cbProfile: s.cbProfile ?? {},
      wbProfile: s.wbProfile ?? {},
      sbProfile: s.sbProfile ?? {},
      matching: s.matching!,
      aboutYou: s.aboutYou!,
      matchPrefs: s.matchPrefs!,
      consent: s.consent!,
      docsSigned: s.docsSigned ?? {},
    },
    references: s.refs.map((r) => ({ ...r })),
    uploads,
    certificates: {},
  };
}

// ─── Test support ───────────────────────────────────────────────────────────

/** Re-reads storage as a page refresh would (tests only). */
export function __reloadFFMentorApplicationsForTest(): void {
  ({ state, health } = load());
  syncMentorConstituents();
  lookupCache = new Map();
  listSnapshot = null;
  staffListSnapshot = null;
}

/** Simulates another tab's save landing in storage (tests only). */
export function __refreshFFMentorApplicationsForTest(): void {
  refreshFromStorage();
}