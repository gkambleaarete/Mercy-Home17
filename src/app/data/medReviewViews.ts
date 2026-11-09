// Screen rows for Medications > Med Review Hub / Med Documentation / Count
// (US 20128), built from the two real sources:
//  • review records — medReviewStore.ts;
//  • medication administration evidence — the canonical medication logs in
//    medicationLogStore.ts (never copied; referenced by log id).
//
// Pure functions. `scope` is the caller's accessible Programs
// (accessibleProgramIds()); `programId` is the fixed or chosen Program ID.
// Nothing here matches Programs by name: Program names are only labels.

import { CONSTITUENTS } from "./mockConstituents";
import { formatMdy } from "../lib/dateFormat";
import {
  countValueLabel,
  type MedicationLogRecord,
} from "./medicationLogStore";
import type { getMedicationLogSnapshot } from "./medicationLogStore";
import {
  effectiveDispensation,
  type DispensationCorrection,
  type DocumentationReview,
  type MedReviewLog,
  type MedReviewRead,
  type ReviewType,
} from "./medReviewStore";

type LogSnapshot = ReturnType<typeof getMedicationLogSnapshot>;
export type ProgramScope = "all" | number[];

/** Display for a value the sources don't record (the table's own
 *  missing-value convention). */
const MISSING = "—";
const orMissing = (v: string | undefined | null) =>
  v && v.trim() ? v : MISSING;

/** View options. `attestations`: the user may see attestation details
 *  (the existing viewAttestations capability); without it they stay hidden. */
export interface ViewOptions {
  attestations: boolean;
}

const inScope = (scope: ProgramScope, programId: number) =>
  scope === "all" || scope.includes(programId);

const mdy = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[2]}/${m[3]}/${m[1]}` : "";
};

function mdyTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const h = d.getHours();
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${formatMdy(d)} ${h % 12 || 12}:${mm} ${h < 12 ? "AM" : "PM"}`;
}

export const youthName = (youthId: string) =>
  CONSTITUENTS.find((c) => String(c.id) === youthId)?.name ?? "";

// ─── Med Review Hub ─────────────────────────────────────────────────────────

export interface MrhRecord {
  id: string;
  programId: number;
  reviewDate: string;
  reviewer: string;
  reviewType: ReviewType;
  program: string;
  startDate: string;
  endDate: string;
  numberOfIssues: number | null;
  hasIssue: boolean;
  details: string;
  modifyDateTime: string;
  history: {
    id: string;
    dt: string;
    modifier: string;
    field: string;
    prev: string;
    next: string;
  }[];
}

const toMrh = (
  l: MedReviewLog,
  programName: (id: number) => string,
): MrhRecord => ({
  id: l.id,
  programId: l.programId,
  reviewDate: mdy(l.reviewDate),
  reviewer: l.reviewer,
  reviewType: l.reviewType,
  program: programName(l.programId),
  startDate: l.startDate ? mdy(l.startDate) : "n/a",
  endDate: l.endDate ? mdy(l.endDate) : "n/a",
  numberOfIssues: l.numberOfIssues,
  hasIssue: l.hasIssue,
  details: l.details,
  modifyDateTime: mdyTime(l.modifiedAt),
  history: [...l.history]
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((h) => ({
      id: h.id,
      dt: mdyTime(h.at),
      modifier: h.modifier,
      field: h.field,
      prev: h.prev,
      next: h.next,
    })),
});

/** Review logs the user can access (optionally one Program), newest
 *  modified first. */
export function reviewRows(
  read: MedReviewRead,
  scope: ProgramScope,
  programName: (id: number) => string,
  programId: number | null,
): MrhRecord[] {
  if (read.status !== "ok") return [];
  return read.data.reviewLogs
    .filter(
      (l) =>
        inScope(scope, l.programId) &&
        (programId === null || l.programId === programId),
    )
    .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
    .map((l) => toMrh(l, programName));
}

// ─── Count (canonical Count logs) ───────────────────────────────────────────

export interface CountRow {
  id: string;
  programId: number;
  youthId: string;
  youthMedicationId: string | null;
  youth: string;
  medication: string;
  dose: string;
  dosingPeriod: string;
  logType: string;
  count: string;
  countType: string;
  comments: string;
  attestationStaff: string;
  attestationDate: string;
  pkg: string;
}

const attestationOf = (s: LogSnapshot, l: MedicationLogRecord) =>
  s.attestations.find((a) => a.id === l.attestationId);

function toCountRow(
  s: LogSnapshot,
  l: MedicationLogRecord,
  opts: ViewOptions,
): CountRow {
  const att = opts.attestations ? attestationOf(s, l) : undefined;
  return {
    id: l.id,
    programId: l.programId,
    youthId: l.youthId,
    youthMedicationId: l.youthMedicationId,
    youth: youthName(l.youthId),
    medication: l.medicationName,
    dose: l.dose,
    dosingPeriod: l.dosePeriod,
    logType: l.logType,
    count: l.logType === "Count" ? countValueLabel(l) : "—",
    countType: l.countType ?? "—",
    comments: l.comment,
    attestationStaff: att?.staff ?? "",
    attestationDate: att ? mdyTime(att.attestedAt) : "",
    // The log's own recorded package code, when it has one.
    pkg: l.details?.["Package Code"] ?? "",
  };
}

const activeLogs = (s: LogSnapshot, scope: ProgramScope, programId: number | null) =>
  s.logs.filter(
    (l) =>
      !l.deletedAt &&
      inScope(scope, l.programId) &&
      (programId === null || l.programId === programId),
  );

const newestFirst = (a: MedicationLogRecord, b: MedicationLogRecord) =>
  b.createdAt.localeCompare(a.createdAt);

/** Count logs (log type "Count") of the accessible Programs. */
export function countRows(
  s: LogSnapshot,
  scope: ProgramScope,
  programId: number | null,
  opts: ViewOptions = { attestations: true },
): CountRow[] {
  return activeLogs(s, scope, programId)
    .filter((l) => l.logType === "Count")
    .sort(newestFirst)
    .map((l) => toCountRow(s, l, opts));
}

/** Every other active log of the selected count row's own medication. */
export function dispensationRowsForCount(
  s: LogSnapshot,
  row: CountRow | undefined,
  scope: ProgramScope,
  opts: ViewOptions = { attestations: true },
): CountRow[] {
  if (!row || row.youthMedicationId === null) return [];
  return activeLogs(s, scope, row.programId)
    .filter(
      (l) =>
        l.logType !== "Count" &&
        l.youthMedicationId === row.youthMedicationId &&
        l.youthId === row.youthId,
    )
    .sort(newestFirst)
    .map((l) => toCountRow(s, l, opts));
}

// ─── Med Documentation (canonical non-Count logs + saved reviews) ───────────

export interface MedDocRow {
  id: string;
  programId: number;
  youthId: string;
  program: string;
  reviewStatus: string;
  assignee: string;
  attestationStaff: string;
  medLeader: string;
  dosingDate: string;
  youth: string;
  medication: string;
  /** null = not recorded (no canonical source links to the log). */
  isPsychotropic: boolean | null;
  dose: string;
  dosingPeriod: string;
  start: string;
  end: string;
  attestationDate: string;
  attestationOccurred: string;
  attestationDevice: string;
  staffDispensed: string;
  youthReceived: string;
  primaryCode: string;
  medComments: string;
  dosingPeriodComments: string;
  reviewComments: string;
  instance: string;
  otherReceived: string;
  pkg: string;
  instructions: string;
  reviewer: string;
  reviewCreatedDate: string;
}

const latestBy = <T extends { logId: string }>(
  list: T[],
  key: (x: T) => string,
) => {
  const m = new Map<string, T>();
  for (const x of [...list].sort((a, b) =>
    key(a).localeCompare(key(b)),
  ))
    m.set(x.logId, x);
  return m;
};

/**
 * Documentation rows: every active non-Count log of the accessible
 * Programs, with the latest saved review and any saved corrections applied.
 * Each value comes from a verified source or stays missing:
 *  • Start / End ← the log's recorded "Start Time" / "End Time";
 *  • Instructions ← the log's "Instructions"; Package ← "Package Code";
 *  • Youth Received ← the log's explicit Yes/No, else a saved correction;
 *  • Staff Dispensed ← a saved correction only (the log's own value is a
 *    staff name, a different meaning from this Yes/No column);
 *  • Attestation Staff / Date ← the log's attestation (needs the
 *    viewAttestations capability) — the attesting staff is never assumed to
 *    be the dispensing staff, and no correction time is shown as one;
 *  • Med Leader, Is Psychotropic, Attestation Occurred / Device and Other
 *    Received have no canonical source tied to a log, so they stay missing.
 */
export function docRows(
  s: LogSnapshot,
  read: MedReviewRead,
  scope: ProgramScope,
  programId: number | null,
  programName: (id: number) => string,
  opts: ViewOptions = { attestations: true },
): MedDocRow[] {
  const reviews: DocumentationReview[] =
    read.status === "ok" ? read.data.documentationReviews : [];
  const corrections: DispensationCorrection[] =
    read.status === "ok" ? read.data.corrections : [];
  const latestReview = latestBy(reviews, (r) => r.reviewedAt + r.id);
  const firstReview = new Map<string, DocumentationReview>();
  for (const r of [...reviews].sort((a, b) =>
    (a.reviewedAt + a.id).localeCompare(b.reviewedAt + b.id),
  ))
    if (!firstReview.has(r.logId)) firstReview.set(r.logId, r);

  return activeLogs(s, scope, programId)
    .filter((l) => l.logType !== "Count")
    .sort(newestFirst)
    .map((l): MedDocRow => {
      const att = opts.attestations ? attestationOf(s, l) : undefined;
      const rv = latestReview.get(l.id);
      const first = firstReview.get(l.id);
      const eff = effectiveDispensation(
        l,
        corrections.filter((c) => c.logId === l.id),
      );
      return {
        id: l.id,
        programId: l.programId,
        youthId: l.youthId,
        program: programName(l.programId),
        reviewStatus: orMissing(rv?.reviewStatus),
        assignee: orMissing(rv?.assignee),
        attestationStaff: orMissing(att?.staff),
        medLeader: MISSING,
        dosingDate: mdy(l.doseDate),
        youth: youthName(l.youthId),
        medication: l.medicationName,
        isPsychotropic: null,
        dose: l.dose,
        dosingPeriod: l.dosePeriod,
        start: orMissing(l.details?.["Start Time"]),
        end: orMissing(l.details?.["End Time"]),
        attestationDate: att ? mdyTime(att.attestedAt) : MISSING,
        attestationOccurred: MISSING,
        attestationDevice: MISSING,
        staffDispensed: orMissing(eff.staffDispensed),
        youthReceived: orMissing(eff.youthReceived),
        primaryCode: orMissing(eff.primaryCode),
        medComments: orMissing(l.comment),
        dosingPeriodComments: orMissing(l.dosePeriodComment),
        reviewComments: orMissing(rv?.comment),
        instance: orMissing(l.instance),
        otherReceived: MISSING,
        pkg: orMissing(l.details?.["Package Code"]),
        instructions: orMissing(l.details?.["Instructions"]),
        reviewer: orMissing(rv?.reviewer),
        reviewCreatedDate: first ? mdy(first.reviewedAt.slice(0, 10)) : MISSING,
      };
    });
}

// ─── Outstanding documentation reviews (US 20142) ───────────────────────────

/** Latest review statuses that are still outstanding. Resolved, and every
 *  other status, leave the Global Medication Error Dashboard. */
export const OUTSTANDING_REVIEW_STATUSES = ["Assigned", "Updated"] as const;
export type OutstandingReviewStatus =
  (typeof OUTSTANDING_REVIEW_STATUSES)[number];

export interface OutstandingReviewRow {
  /** Canonical medication log id — the review target. */
  id: string;
  /** The log's own recorded Program ID. */
  programId: number;
  program: string;
  youthId: string;
  youth: string;
  medication: string;
  dose: string;
  dosingPeriod: string;
  reviewStatus: OutstandingReviewStatus;
  /** Saved review information of that latest review. */
  assignee: string;
  reviewComments: string;
  reviewer: string;
  reviewedAt: string;
}

/**
 * One row per documentation-review target (an active, non-Count canonical
 * log of an accessible Program) whose LATEST saved review is Assigned or
 * Updated. "Latest" is the same rule docRows uses (newest reviewedAt, then
 * id), so an older Assigned never reappears after a newer Resolved. The
 * review history itself is only read, never changed. Programs come from the
 * log's recorded Program ID — never from names or current enrollment. A
 * review store that cannot be read yields no rows; callers must show that
 * as an error (read.status), not as an empty result.
 */
export function outstandingReviewRows(
  s: LogSnapshot,
  read: MedReviewRead,
  scope: ProgramScope,
  programName: (id: number) => string,
): OutstandingReviewRow[] {
  if (read.status !== "ok") return [];
  const latest = latestBy(
    read.data.documentationReviews,
    (r) => r.reviewedAt + r.id,
  );
  const rows: OutstandingReviewRow[] = [];
  for (const l of activeLogs(s, scope, null)) {
    if (l.logType === "Count") continue;
    const rv = latest.get(l.id);
    if (
      !rv ||
      !(OUTSTANDING_REVIEW_STATUSES as readonly string[]).includes(
        rv.reviewStatus,
      )
    )
      continue;
    rows.push({
      id: l.id,
      programId: l.programId,
      program: programName(l.programId),
      youthId: l.youthId,
      youth: youthName(l.youthId),
      medication: l.medicationName,
      dose: l.dose,
      dosingPeriod: l.dosePeriod,
      reviewStatus: rv.reviewStatus as OutstandingReviewStatus,
      assignee: rv.assignee,
      reviewComments: rv.comment,
      reviewer: rv.reviewer,
      reviewedAt: rv.reviewedAt,
    });
  }
  return rows.sort(
    (a, b) =>
      b.reviewedAt.localeCompare(a.reviewedAt) ||
      a.id.localeCompare(b.id),
  );
}