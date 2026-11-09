// Friends First Mentor Application — uploaded documents and training
// certificates (US 20039 Chunk 8). Read-side rules shared by the Overview,
// the Uploaded Documents table and the later readiness check.
//
// A file's identity is its recorded storageRef (the document-store key of
// that exact upload) — never its name or list position. A review counts for
// the current file only when it names that same identity, so an approval of
// an earlier file never carries over to a replacement.

import {
  calendarKey,
  parseRecordedDate,
  todayCalendar,
  type FFCalendarDate,
  type FFDocumentReview,
  type FFFileRef,
  type FFMentorApplication,
  type FFMentorApplicationStaff,
  type FFSubProgramId,
} from "./ffMentorApplication";

const ALL: FFSubProgramId[] = ["community", "school", "work"];

export type FFDocumentType =
  | "driversLicense"
  | "autoInsurance"
  | "virtus"
  | "dcfs"
  | "accurateBiometrics"
  | "cpi";

export interface FFDocumentDefinition {
  type: FFDocumentType;
  name: string;
  /** Display grouping only — not an eligibility rule. */
  category: string;
  programs: FFSubProgramId[];
  /** Where the applicant's upload is saved on the application. */
  source: { from: "uploads" | "certificates"; key: string };
}

export const FF_DOCUMENT_DEFINITIONS: FFDocumentDefinition[] = [
  {
    type: "driversLicense",
    name: "Driver's License / State ID",
    category: "Identification",
    programs: ALL,
    source: { from: "uploads", key: "driversLicence" },
  },
  {
    type: "autoInsurance",
    name: "Proof of Auto Insurance",
    category: "Insurance",
    programs: ["community"],
    source: { from: "uploads", key: "autoInsurance" },
  },
  {
    type: "virtus",
    name: "VIRTUS / PGC Certificate",
    category: "Training",
    programs: ALL,
    source: { from: "certificates", key: "virtus" },
  },
  {
    type: "dcfs",
    name: "DCFS Mandated Reporter Certificate",
    category: "Training",
    programs: ALL,
    source: { from: "certificates", key: "dcfs" },
  },
  {
    // An uploaded form with its own file identity and review. Input contract:
    // the applicant-side upload is saved at uploads.accurateBiometrics. The
    // earlier Fingerprint Receipt (certificates.fingerprint) and the retired
    // Accurate Biometrics agreement signature never count as this upload.
    type: "accurateBiometrics",
    name: "Accurate Biometrics Form",
    category: "Background Check",
    programs: ["community", "school"],
    source: { from: "uploads", key: "accurateBiometrics" },
  },
  {
    type: "cpi",
    name: "CPI Assessment Documentation",
    category: "Background Check",
    programs: ["community"],
    source: { from: "certificates", key: "cpi" },
  },
];

export const ffDocumentDefinition = (type: string) =>
  FF_DOCUMENT_DEFINITIONS.find((d) => d.type === type);

/** The ticket's exact approval statuses. */
export type FFApprovalStatus =
  "Pending" | "Pending Approval" | "Approved" | "Rejected";

export type FFFileState =
  "Not Uploaded" | "File Unavailable" | "Uploaded";

export interface FFDocumentStatus {
  definition: FFDocumentDefinition;
  appliesTo: FFSubProgramId[];
  file?: FFFileRef;
  /** Identity of the current file; null when it has none recorded. */
  fileId: string | null;
  fileState: FFFileState;
  approval: FFApprovalStatus;
  /** The saved decision about the current file, when there is one. */
  review?: FFDocumentReview;
  /** A saved decision that is about a different (or unidentified) file. */
  unmatchedReview?: FFDocumentReview;
  issues: string[];
}

export function currentDocumentFile(
  app: FFMentorApplication,
  def: FFDocumentDefinition,
): FFFileRef | undefined {
  const bag = (
    def.source.from === "uploads"
      ? app.uploads
      : app.certificates
  ) as Record<string, FFFileRef | undefined> | undefined;
  const f = bag?.[def.source.key];
  return f && typeof f === "object" && f.fileName
    ? f
    : undefined;
}

export const fileIdentity = (
  f: FFFileRef | undefined,
): string | null =>
  f && typeof f.storageRef === "string" && f.storageRef.trim()
    ? f.storageRef
    : null;

/**
 * One status calculation for a document type — used by the Overview's
 * PGC/VIRTUS status and the Uploaded Documents table.
 */
export function ffDocumentStatus(
  app: FFMentorApplication,
  staff: FFMentorApplicationStaff,
  type: FFDocumentType,
): FFDocumentStatus {
  const definition = ffDocumentDefinition(type)!;
  const file = currentDocumentFile(app, definition);
  const fileId = fileIdentity(file);
  const saved = staff.documentReviews[type];
  const decided =
    saved &&
    (saved.status === "approved" ||
      saved.status === "rejected");
  const issues: string[] = [];
  const base = {
    definition,
    appliesTo: definition.programs.filter((p) =>
      app.subPrograms.includes(p),
    ),
    file,
    fileId,
  };
  if (!file)
    return {
      ...base,
      fileState: "Not Uploaded",
      approval: "Pending",
      unmatchedReview: decided ? saved : undefined,
      issues,
    };
  const fileState: FFFileState = fileId
    ? "Uploaded"
    : "File Unavailable";
  if (!fileId)
    issues.push(
      "This upload has no file on record, so it can't be opened or reviewed.",
    );
  if (decided && fileId && saved!.fileId === fileId)
    return {
      ...base,
      fileState,
      approval:
        saved!.status === "approved" ? "Approved" : "Rejected",
      review: saved,
      issues,
    };
  if (decided)
    issues.push(
      saved!.fileId
        ? "The saved decision was for an earlier file. The current file needs its own review."
        : "A saved decision isn't linked to a specific file, so it can't be confirmed for the current file.",
    );
  return {
    ...base,
    fileState,
    approval: "Pending Approval",
    unmatchedReview: decided ? saved : undefined,
    issues,
  };
}

/** PGC/VIRTUS training status (Overview and documents use the same rule). */
export const ffPgcStatus = (
  app: FFMentorApplication,
  staff: FFMentorApplicationStaff,
) => ffDocumentStatus(app, staff, "virtus");

// ─── DCFS certificate date ──────────────────────────────────────────────────

/** DCFS certificates must be dated within the last three years. */
export const DCFS_VALID_YEARS = 3;

export type FFCertificateDateCheck =
  | {
      ok: true;
      date: FFCalendarDate;
      source: "recorded" | "reviewer";
    }
  | { ok: false; reason: string };

const MDY = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/** A reviewer-entered MM/DD/YYYY date, or null when it isn't a real date. */
export function parseEnteredDate(
  v: string,
): FFCalendarDate | null {
  const m = MDY.exec(v.trim());
  return m ? parseRecordedDate(v.trim()) : null;
}

/**
 * Checks a DCFS certificate date: the date recorded with the upload when
 * valid, otherwise the date a reviewer entered after inspecting it.
 * Calendar dates only (no timezone shifts).
 */
export function checkDcfsDate(
  file: FFFileRef | undefined,
  entered: string | undefined,
  now = new Date(),
): FFCertificateDateCheck {
  const recorded = parseRecordedDate(file?.documentDate);
  let date: FFCalendarDate | null = recorded;
  let source: "recorded" | "reviewer" = "recorded";
  if (!date) {
    if (!entered?.trim())
      return {
        ok: false,
        reason:
          "Enter the certificate date shown on the document.",
      };
    date = parseEnteredDate(entered);
    source = "reviewer";
    if (!date)
      return {
        ok: false,
        reason: "Enter a valid certificate date (MM/DD/YYYY).",
      };
  }
  const today = todayCalendar(now);
  if (calendarKey(date) > calendarKey(today))
    return {
      ok: false,
      reason: "The certificate date can't be in the future.",
    };
  const earliest = { ...today, y: today.y - DCFS_VALID_YEARS };
  if (calendarKey(date) < calendarKey(earliest))
    return {
      ok: false,
      reason: `The certificate is more than ${DCFS_VALID_YEARS} years old.`,
    };
  return { ok: true, date, source };
}

// ─── Assessment (for the later readiness check) ─────────────────────────────

export interface FFDocumentAssessment {
  applicable: FFDocumentType[];
  missing: FFDocumentType[];
  unavailable: FFDocumentType[];
  approved: FFDocumentType[];
  rejected: FFDocumentType[];
  pending: FFDocumentType[];
  /** Approved DCFS certificates whose date no longer passes the rule. */
  trainingDateIssues: {
    type: FFDocumentType;
    reason: string;
  }[];
  issues: { type: FFDocumentType; reason: string }[];
}

export function ffApplicableDocuments(
  app: FFMentorApplication,
) {
  return FF_DOCUMENT_DEFINITIONS.filter((d) =>
    d.programs.some((p) => app.subPrograms.includes(p)),
  );
}

export function assessFFDocuments(
  app: FFMentorApplication,
  staff: FFMentorApplicationStaff,
  now = new Date(),
): FFDocumentAssessment {
  const statuses = ffApplicableDocuments(app).map((d) =>
    ffDocumentStatus(app, staff, d.type),
  );
  const of = (pred: (s: FFDocumentStatus) => boolean) =>
    statuses.filter(pred).map((s) => s.definition.type);
  const trainingDateIssues: FFDocumentAssessment["trainingDateIssues"] =
    [];
  const dcfs = statuses.find(
    (s) => s.definition.type === "dcfs",
  );
  if (dcfs?.approval === "Approved") {
    const check = checkDcfsDate(
      dcfs.file,
      dcfs.review?.verifiedDocumentDate,
      now,
    );
    if (!check.ok)
      trainingDateIssues.push({
        type: "dcfs",
        reason: check.reason,
      });
  }
  return {
    applicable: statuses.map((s) => s.definition.type),
    missing: of((s) => s.fileState === "Not Uploaded"),
    unavailable: of((s) => s.fileState === "File Unavailable"),
    approved: of((s) => s.approval === "Approved"),
    rejected: of((s) => s.approval === "Rejected"),
    pending: of(
      (s) =>
        s.approval === "Pending" ||
        s.approval === "Pending Approval",
    ),
    trainingDateIssues,
    issues: statuses.flatMap((s) =>
      s.issues.map((reason) => ({
        type: s.definition.type,
        reason,
      })),
    ),
  };
}