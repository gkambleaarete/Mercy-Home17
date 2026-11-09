// Transition Summary records (US 20101 / US 20103) — shared data foundation.
//
// Model (prototype interpretation — not a confirmed Salesforce schema):
//   Youth Constituent ──1:N── Transition Summary records
//   Each record carries shared metadata (stable id, owning Youth Constituent
//   ID, explicit Internal/External type, saved status) and type-specific
//   content kept under `content`, so Internal fields added later can never
//   overwrite External report content. Records are keyed by summary id, not
//   by youth, so one youth can own several summaries of either type.
//
// Ownership uses Constituent IDs only (names are display values) and is
// validated through the canonical Youth identity in lib/youthIdentity.
//
// MOCK_TRANSITION_SUMMARY is a display fixture with no explicit owner; it is
// NOT copied into this store and no record is created during rendering.
//
// Persistence: one versioned localStorage key holding the whole snapshot.
// Every save prepares the complete next snapshot without mutating the
// current one, writes it in a single setItem, and only then swaps memory and
// notifies subscribers — a failed write leaves memory and storage unchanged
// and returns a failure. Reads never write. Stored data that is malformed or
// from an unsupported version is left untouched in storage, reported through
// getTransitionSummaryLoadIssue(), and all saves are refused until it is
// resolved so it can never be overwritten with empty data.

import { useSyncExternalStore } from "react";
import { resolveYouthConstituent } from "../lib/youthIdentity";
import type {
  TransitionSummary,
  TransitionSummaryStatus,
} from "./mockTransitionSummary";

// ─── Types ──────────────────────────────────────────────────────────────────

export type TransitionSummaryType = "Internal" | "External";

/** External report content: the existing report shape; status is metadata. */
export type ExternalTransitionSummaryContent = Omit<
  TransitionSummary,
  "status"
>;

export const PLANNED_STATUS_OPTIONS = [
  "Planned Transition",
  "Unplanned Transition",
] as const;
export type PlannedStatus =
  (typeof PLANNED_STATUS_OPTIONS)[number];

/** Internal → Details (US 20101). Every field is optional: a Draft may be
 *  saved partially, and records created before these fields existed
 *  (content `{}`) stay valid. IDs reference CONSTITUENTS / programs. */
export interface InternalTransitionDetails {
  /** "MM/DD/YYYY" or "" when not entered. */
  transitionDate?: string;
  plannedStatus?: PlannedStatus;
  programId?: number;
  communityCareContactId?: number;
  placementDescription?: string;
}

/** Internal → Details → Contacts (US 20101). Values are a summary-specific
 *  copy: editing them never changes the linked constituent. Only a
 *  "Constituent" contact carries a constituentId. */
export interface TransitionContact {
  id: string;
  kind: "Constituent" | "Non-Constituent";
  constituentId?: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  description: string;
}

export const RECOMMENDATION_TYPE_OPTIONS = [
  "Education",
  "Employment",
  "Health Services",
  "Housing",
  "Mental Health",
  "Community Care",
  "Other",
] as const;
export type RecommendationType =
  (typeof RECOMMENDATION_TYPE_OPTIONS)[number];

export interface TransitionRecommendation {
  id: string;
  type: RecommendationType;
  recommendation: string;
}

/** Internal → Summary (US 20101). PTPs are NOT stored here; the Summary
 *  table reads them live from the youth-owned PTP store. */
export interface InternalTransitionSummarySection {
  reasonForTransition?: string;
  involvementSummary?: string;
  recommendations?: TransitionRecommendation[];
}

/** Internal → Plan (US 20101): the only connection types a Plan connection
 *  may have (mirrors TRANSITION_SUMMARY_CONNECTION_TYPES in the form). */
export const PLAN_CONNECTION_TYPES = [
  "Post-Transition Contact",
  "Transition Meeting",
  "Transition Shadow",
] as const;

export interface PlanParticipant {
  id: number;
  constituentType: "Constituent" | "Non-Constituent";
  /** Verified Constituent ID for a Constituent participant. */
  entityId?: string;
  participant: string;
  role: string;
  attended: boolean | null;
  reasonMissed: string;
  [k: string]: unknown;
}

/** A Plan connection: the shared Connection record shape (saved by the
 *  existing Connection form), owned by this summary. Its participants are
 *  stored on it, so this summary holds the one persisted copy. */
export interface PlanConnection {
  id: string;
  type: (typeof PLAN_CONNECTION_TYPES)[number];
  startDate: string;
  endDate: string;
  participantList: PlanParticipant[];
  [k: string]: unknown;
}

/** Internal content. Sections are added by later chunks; unknown keys are
 *  kept as saved so a section update never drops another section. */
export type InternalTransitionSummaryContent = {
  details?: InternalTransitionDetails;
  contacts?: TransitionContact[];
  summary?: InternalTransitionSummarySection;
  planConnections?: PlanConnection[];
} & Record<string, unknown>;

interface TransitionSummaryMeta {
  id: string;
  youthId: string; // owning Youth Constituent ID
  status: TransitionSummaryStatus;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  /** Increments on every write; workflow actions must name the revision
   *  they acted on (stale-version check). Absent on older records = 0. */
  revision?: number;
  /** External review workflow (US 20103). */
  workflow?: ExternalWorkflow;
}

export type WorkflowAction =
  "Ready for Review" | "Reviewed" | "Finalized";

export interface WorkflowEvent {
  action: WorkflowAction;
  at: string; // ISO timestamp of the action
  /** Display name of the acting user where the prototype provides one. */
  actor: string | null;
  /** Record revision after the action. */
  revision: number;
}

export interface ExternalWorkflow {
  /** The report version captured at Ready for Review (validated where it is
   *  read — see externalReportModel). */
  snapshot?: unknown;
  /** Record revision at capture. */
  capturedRevision?: number;
  events: WorkflowEvent[];
}

export type ExternalTransitionSummaryRecord =
  TransitionSummaryMeta & {
    type: "External";
    content: ExternalTransitionSummaryContent;
  };

export type InternalTransitionSummaryRecord =
  TransitionSummaryMeta & {
    type: "Internal";
    content: InternalTransitionSummaryContent;
  };

export type TransitionSummaryRecord =
  | ExternalTransitionSummaryRecord
  | InternalTransitionSummaryRecord;

type ContentFor<T extends TransitionSummaryType> =
  T extends "External"
    ? ExternalTransitionSummaryContent
    : InternalTransitionSummaryContent;

interface Snapshot {
  version: 1;
  records: Record<string, TransitionSummaryRecord>;
}

export type TransitionSummaryErrorCode =
  | "invalid-owner"
  | "invalid-type"
  | "invalid-content"
  | "already-exists"
  | "not-found"
  | "owner-mismatch"
  | "type-mismatch"
  | "finalized"
  | "not-draft"
  | "invalid-transition"
  | "stale"
  | "storage-unreadable"
  | "persistence-failed";

export type TransitionSummaryResult =
  | { ok: true; record: TransitionSummaryRecord }
  | {
      ok: false;
      error: TransitionSummaryErrorCode;
      message: string;
    };

export interface TransitionSummaryLoadIssue {
  reason:
    "unparseable" | "unsupported-version" | "invalid-shape";
  message: string;
}

// ─── Validation ─────────────────────────────────────────────────────────────

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const allStrings = (
  o: unknown,
  keys: readonly string[],
): o is Record<string, unknown> =>
  isObj(o) && keys.every((k) => typeof o[k] === "string");

const EXTERNAL_TEXT_KEYS = [
  "youthName",
  "dateOfBirth",
  "admissionDate",
  "transitionDate",
  "lengthOfStay",
  "generatedDate",
  "finalizedBy",
  "finalizedDate",
] as const;

function isExternalContent(
  v: unknown,
): v is ExternalTransitionSummaryContent {
  return (
    allStrings(v, EXTERNAL_TEXT_KEYS) &&
    Array.isArray(v.programHistory) &&
    v.programHistory.every((p: unknown) =>
      allStrings(p, ["program", "startDate", "endDate"]),
    ) &&
    Array.isArray(v.keyStaffHistory) &&
    v.keyStaffHistory.every(
      (s: unknown) =>
        allStrings(s, [
          "role",
          "staffMember",
          "startDate",
          "endDate",
        ]) &&
        // Rows added/modified in the editor carry a stable id and, when
        // linked, the staff member's Constituent ID; legacy rows have
        // neither and stay valid as saved.
        optional(
          s.id,
          (x) => typeof x === "string" && x !== "",
        ) &&
        optional(s.constituentId, Number.isInteger),
    ) &&
    new Set(
      v.keyStaffHistory
        .map((s: { id?: string }) => s.id)
        .filter((x: string | undefined) => x !== undefined),
    ).size ===
      v.keyStaffHistory.filter(
        (s: { id?: string }) => s.id !== undefined,
      ).length &&
    Array.isArray(v.narratives) &&
    v.narratives.every((n: unknown) =>
      allStrings(n, ["title", "content"]),
    )
  );
}

/** A real calendar date in MM/DD/YYYY (same rule as DateInput). */
export function isValidMdy(v: string): boolean {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  if (!m) return false;
  const [mm, dd, yyyy] = [
    Number(m[1]),
    Number(m[2]),
    Number(m[3]),
  ];
  if (yyyy < 1900 || yyyy > 2100) return false;
  const d = new Date(yyyy, mm - 1, dd);
  return d.getMonth() === mm - 1 && d.getDate() === dd;
}

const optional = (v: unknown, test: (x: unknown) => boolean) =>
  v === undefined || test(v);

function isInternalDetails(
  v: unknown,
): v is InternalTransitionDetails {
  return (
    isObj(v) &&
    optional(
      v.transitionDate,
      (x) =>
        typeof x === "string" && (x === "" || isValidMdy(x)),
    ) &&
    optional(v.plannedStatus, (x) =>
      (PLANNED_STATUS_OPTIONS as readonly unknown[]).includes(
        x,
      ),
    ) &&
    optional(v.programId, Number.isInteger) &&
    optional(v.communityCareContactId, Number.isInteger) &&
    optional(
      v.placementDescription,
      (x) => typeof x === "string",
    )
  );
}

function isContact(v: unknown): v is TransitionContact {
  return (
    allStrings(v, [
      "id",
      "name",
      "phone",
      "email",
      "address",
      "description",
    ]) &&
    v.id !== "" &&
    (v.kind === "Constituent"
      ? Number.isInteger(v.constituentId)
      : v.kind === "Non-Constituent" &&
        v.constituentId === undefined) &&
    // A row needs an identity: a linked constituent or a name.
    (v.kind === "Constituent" ||
      (v.name as string).trim() !== "")
  );
}

function isContactList(v: unknown): boolean {
  return (
    Array.isArray(v) &&
    v.every(isContact) &&
    new Set(v.map((c: TransitionContact) => c.id)).size ===
      v.length
  );
}

function isRecommendation(
  v: unknown,
): v is TransitionRecommendation {
  return (
    allStrings(v, ["id", "type", "recommendation"]) &&
    v.id !== "" &&
    (
      RECOMMENDATION_TYPE_OPTIONS as readonly unknown[]
    ).includes(v.type) &&
    (v.recommendation as string).trim() !== ""
  );
}

function isSummarySection(v: unknown): boolean {
  return (
    isObj(v) &&
    optional(
      v.reasonForTransition,
      (x) => typeof x === "string",
    ) &&
    optional(
      v.involvementSummary,
      (x) => typeof x === "string",
    ) &&
    optional(
      v.recommendations,
      (x) =>
        Array.isArray(x) &&
        x.every(isRecommendation) &&
        new Set(x.map((r: TransitionRecommendation) => r.id))
          .size === x.length,
    )
  );
}

function isPlanParticipant(v: unknown): boolean {
  return (
    allStrings(v, ["participant", "role"]) &&
    Number.isInteger(v.id) &&
    (v.constituentType === "Constituent" ||
      v.constituentType === "Non-Constituent") &&
    optional(
      v.entityId,
      (x) => typeof x === "string" && x !== "",
    ) &&
    // A Non-Constituent never carries a constituent link.
    (v.constituentType === "Constituent" ||
      v.entityId === undefined)
  );
}

function isPlanConnection(v: unknown): v is PlanConnection {
  return (
    allStrings(v, ["id", "type", "startDate", "endDate"]) &&
    v.id !== "" &&
    (PLAN_CONNECTION_TYPES as readonly unknown[]).includes(
      v.type,
    ) &&
    Array.isArray(v.participantList) &&
    v.participantList.every(isPlanParticipant)
  );
}

function isInternalContent(v: unknown): boolean {
  return (
    isObj(v) &&
    optional(v.details, isInternalDetails) &&
    optional(v.contacts, isContactList) &&
    optional(v.summary, isSummarySection) &&
    optional(
      v.planConnections,
      (x) =>
        Array.isArray(x) &&
        x.every(isPlanConnection) &&
        new Set(x.map((c: PlanConnection) => c.id)).size ===
          x.length,
    )
  );
}

const isType = (v: unknown): v is TransitionSummaryType =>
  v === "Internal" || v === "External";

const isStatus = (v: unknown): v is TransitionSummaryStatus =>
  v === "Draft" ||
  v === "Ready for Review" ||
  v === "Reviewed" ||
  v === "Finalized";

const WORKFLOW_ACTIONS: readonly unknown[] = [
  "Ready for Review",
  "Reviewed",
  "Finalized",
];

function isWorkflow(v: unknown): boolean {
  return (
    isObj(v) &&
    Array.isArray(v.events) &&
    v.events.every(
      (e: unknown) =>
        isObj(e) &&
        WORKFLOW_ACTIONS.includes(e.action) &&
        typeof e.at === "string" &&
        (e.actor === null || typeof e.actor === "string") &&
        Number.isInteger(e.revision),
    ) &&
    optional(v.capturedRevision, Number.isInteger)
    // `snapshot` is validated where it is read, so a damaged snapshot is
    // reported on that report instead of blocking every summary.
  );
}

function isContentFor(
  type: TransitionSummaryType,
  v: unknown,
): boolean {
  return type === "External"
    ? isExternalContent(v)
    : isInternalContent(v);
}

function isRecord(
  id: string,
  v: unknown,
): v is TransitionSummaryRecord {
  return (
    allStrings(v, [
      "id",
      "youthId",
      "createdAt",
      "updatedAt",
    ]) &&
    v.id === id &&
    isType(v.type) &&
    isStatus(v.status) &&
    // The review statuses and workflow belong to External summaries only.
    (v.type === "External" ||
      ((v.status === "Draft" || v.status === "Finalized") &&
        v.workflow === undefined)) &&
    optional(v.revision, Number.isInteger) &&
    optional(v.workflow, isWorkflow) &&
    isContentFor(v.type, v.content)
  );
}

// ─── State + persistence ────────────────────────────────────────────────────

const STORAGE_KEY = "mh.transitionSummaries.v1";

const emptySnapshot = (): Snapshot => ({
  version: 1,
  records: {},
});

function load(): {
  snapshot: Snapshot;
  issue: TransitionSummaryLoadIssue | null;
} {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: nothing saved can be read or overwritten.
    raw = null;
  }
  if (raw === null)
    return { snapshot: emptySnapshot(), issue: null };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      snapshot: emptySnapshot(),
      issue: {
        reason: "unparseable",
        message:
          "Saved Transition Summary data could not be read.",
      },
    };
  }
  if (!isObj(parsed) || parsed.version !== 1) {
    return {
      snapshot: emptySnapshot(),
      issue: {
        reason: "unsupported-version",
        message:
          "Saved Transition Summary data uses an unsupported format.",
      },
    };
  }
  const records = parsed.records;
  if (
    !isObj(records) ||
    !Object.entries(records).every(([id, r]) => isRecord(id, r))
  ) {
    return {
      snapshot: emptySnapshot(),
      issue: {
        reason: "invalid-shape",
        message:
          "Saved Transition Summary data contains invalid records.",
      },
    };
  }
  return {
    snapshot: {
      version: 1,
      records: records as Snapshot["records"],
    },
    issue: null,
  };
}

const loaded = load();
let state: Snapshot = loaded.snapshot;
const loadIssue = loaded.issue;
const listeners = new Set<() => void>();

/** Test seam: simulate a storage write failure on subsequent saves. */
let persistenceFault = false;
export function __setTransitionSummaryPersistenceFault(
  on: boolean,
) {
  persistenceFault = on;
}

/** All-or-nothing: write the full next snapshot, then publish it. */
function commit(next: Snapshot): boolean {
  try {
    if (persistenceFault)
      throw new Error("Simulated persistence failure");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return false;
  }
  state = next;
  listeners.forEach((l) => l());
  return true;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useTransitionSummarySnapshot(): Readonly<Snapshot> {
  return useSyncExternalStore(subscribe, () => state);
}

export function getTransitionSummarySnapshot(): Readonly<Snapshot> {
  return state;
}

/** Non-null when stored data was left untouched because it was unreadable. */
export function getTransitionSummaryLoadIssue(): TransitionSummaryLoadIssue | null {
  return loadIssue;
}

// ─── Reads (never write) ────────────────────────────────────────────────────

/**
 * A summary only when it belongs to the expected youth and type; a record
 * owned by another youth or of the other type resolves to null.
 */
export function getTransitionSummary<
  T extends TransitionSummaryType,
>(
  s: Readonly<Snapshot>,
  id: string,
  expected: { youthId: string; type: T },
): Extract<TransitionSummaryRecord, { type: T }> | null {
  const r = s.records[id];
  return r &&
    r.youthId === expected.youthId &&
    r.type === expected.type
    ? (r as Extract<TransitionSummaryRecord, { type: T }>)
    : null;
}

export function transitionSummariesForYouth(
  s: Readonly<Snapshot>,
  youthId: string,
  type?: TransitionSummaryType,
): TransitionSummaryRecord[] {
  return Object.values(s.records).filter(
    (r) =>
      r.youthId === youthId &&
      (type === undefined || r.type === type),
  );
}

// ─── Writes ─────────────────────────────────────────────────────────────────

/** A fresh summary id. Reserve it when a form opens and reuse it on retry. */
export function newTransitionSummaryId(): string {
  return `TS-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const fail = (
  error: TransitionSummaryErrorCode,
  message: string,
): TransitionSummaryResult => ({ ok: false, error, message });

const UNREADABLE = () =>
  fail(
    "storage-unreadable",
    "Saved Transition Summary data could not be read, so changes were not saved.",
  );

const PERSIST_FAILED = () =>
  fail(
    "persistence-failed",
    "The Transition Summary could not be saved. Your previous saved version is unchanged.",
  );

/** Creates a new Draft summary owned by a Youth Constituent. */
export function createTransitionSummary<
  T extends TransitionSummaryType,
>(
  input: {
    id: string;
    youthId: string;
    type: T;
    content: ContentFor<T>;
  },
  now: Date = new Date(),
): TransitionSummaryResult {
  if (loadIssue) return UNREADABLE();
  if (!resolveYouthConstituent(input.youthId))
    return fail(
      "invalid-owner",
      "The summary owner must be a Youth constituent.",
    );
  if (!isType(input.type))
    return fail(
      "invalid-type",
      "Summary type must be Internal or External.",
    );
  if (!isContentFor(input.type, input.content))
    return fail(
      "invalid-content",
      `The ${input.type} summary content is invalid.`,
    );
  if (!input.id || state.records[input.id])
    return fail(
      "already-exists",
      "A summary with this id already exists.",
    );

  const at = now.toISOString();
  const record = {
    id: input.id,
    youthId: input.youthId,
    type: input.type,
    status: "Draft",
    createdAt: at,
    updatedAt: at,
    content: structuredClone(input.content),
  } as TransitionSummaryRecord;
  const next: Snapshot = {
    version: 1,
    records: { ...state.records, [record.id]: record },
  };
  return commit(next) ? { ok: true, record } : PERSIST_FAILED();
}

/**
 * Updates the content of an existing summary. The caller states the owner
 * and type it expects; neither can be changed here. Fields not supplied keep
 * their latest saved value. Finalized summaries are read-only.
 */
export function updateTransitionSummaryContent<
  T extends TransitionSummaryType,
>(
  input: {
    id: string;
    youthId: string;
    type: T;
    content: Partial<ContentFor<T>>;
  },
  now: Date = new Date(),
): TransitionSummaryResult {
  if (loadIssue) return UNREADABLE();
  if (!resolveYouthConstituent(input.youthId))
    return fail(
      "invalid-owner",
      "The summary owner must be a Youth constituent.",
    );
  const prev = state.records[input.id];
  if (!prev)
    return fail(
      "not-found",
      "This summary has not been created yet.",
    );
  if (prev.youthId !== input.youthId)
    return fail(
      "owner-mismatch",
      "This summary belongs to a different youth.",
    );
  if (prev.type !== input.type)
    return fail(
      "type-mismatch",
      `This summary is not an ${input.type} summary.`,
    );
  if (prev.status === "Finalized")
    return fail(
      "finalized",
      "Finalized summaries cannot be edited.",
    );
  if (prev.status !== "Draft")
    return fail(
      "not-draft",
      `A summary that is ${prev.status} can't be edited.`,
    );
  if (!isObj(input.content))
    return fail(
      "invalid-content",
      `The ${input.type} summary content is invalid.`,
    );

  const content = {
    ...prev.content,
    ...structuredClone(input.content),
  };
  if (!isContentFor(prev.type, content))
    return fail(
      "invalid-content",
      `The ${prev.type} summary content is invalid.`,
    );

  const record = {
    ...prev,
    content,
    updatedAt: now.toISOString(),
    revision: (prev.revision ?? 0) + 1,
  } as TransitionSummaryRecord;
  const next: Snapshot = {
    version: 1,
    records: { ...state.records, [record.id]: record },
  };
  return commit(next) ? { ok: true, record } : PERSIST_FAILED();
}

/** The status each workflow action requires (no skipping, no going back). */
const REQUIRED_STATUS: Record<
  WorkflowAction,
  TransitionSummaryStatus
> = {
  "Ready for Review": "Draft",
  Reviewed: "Ready for Review",
  Finalized: "Reviewed",
};

/**
 * External review workflow: Draft → Ready for Review → Reviewed → Finalized.
 * The caller names the revision it acted on; a different saved revision is
 * rejected as stale. Ready for Review must carry the captured report
 * version, which is stored with the status change in one write; Reviewed
 * and Finalized keep that captured version unchanged. Content can't change
 * after Draft (see updateTransitionSummaryContent).
 */
export function advanceExternalSummary(
  input: {
    id: string;
    youthId: string;
    action: WorkflowAction;
    expectedRevision: number;
    snapshot?: unknown;
    actor: string | null;
  },
  now: Date = new Date(),
): TransitionSummaryResult {
  if (loadIssue) return UNREADABLE();
  const prev = state.records[input.id];
  if (!prev)
    return fail(
      "not-found",
      "This summary has not been created yet.",
    );
  if (prev.youthId !== input.youthId)
    return fail(
      "owner-mismatch",
      "This summary belongs to a different youth.",
    );
  if (prev.type !== "External")
    return fail(
      "type-mismatch",
      "Only External summaries use the review workflow.",
    );
  if (prev.status !== REQUIRED_STATUS[input.action])
    return fail(
      "invalid-transition",
      `A ${prev.status} summary can't be marked ${input.action}.`,
    );
  if ((prev.revision ?? 0) !== input.expectedRevision)
    return fail(
      "stale",
      "This summary changed since it was opened. Reopen it and try again.",
    );
  const workflow: ExternalWorkflow = prev.workflow ?? {
    events: [],
  };
  if (input.action === "Ready for Review") {
    if (!isObj(input.snapshot))
      return fail(
        "invalid-content",
        "The report version could not be captured.",
      );
  } else if (!isObj(workflow.snapshot)) {
    return fail(
      "invalid-content",
      "This summary has no captured report version.",
    );
  }
  const revision = (prev.revision ?? 0) + 1;
  const at = now.toISOString();
  const record = {
    ...prev,
    status: input.action,
    updatedAt: at,
    revision,
    workflow: {
      ...workflow,
      ...(input.action === "Ready for Review"
        ? {
            snapshot: structuredClone(input.snapshot),
            capturedRevision: revision,
          }
        : {}),
      events: [
        ...workflow.events,
        {
          action: input.action,
          at,
          actor: input.actor,
          revision,
        },
      ],
    },
  } as TransitionSummaryRecord;
  return commit({
    version: 1,
    records: { ...state.records, [record.id]: record },
  })
    ? { ok: true, record }
    : PERSIST_FAILED();
}

/** The existing External report view of a record (status from metadata). */
export function toExternalReport(
  r: ExternalTransitionSummaryRecord,
): TransitionSummary {
  return { ...r.content, status: r.status };
}