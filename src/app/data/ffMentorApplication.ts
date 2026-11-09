// Friends First Mentor Application — shared record shape (US 20039, built on
// the applicant-side Mentor Application Wizard from US 19968).
//
// The submitted answers mirror the VMS wizard's saved state (FFDraft in the
// VMS portal's FFWizards.tsx) group for group and key for key, so a submission
// can be stored without reshaping or dropping fields. Staff processing
// (stage, Inactive, coordinator, notes, document reviews, stage history) is a
// separate type stored separately, so it can never leak into applicant-facing
// output.

import type { FFSubProgramme } from "./mockFriendsFirstData";

// ─── Applicant side ─────────────────────────────────────────────────────────

/** VMS sub-program ids (one application may hold several). */
export type FFSubProgramId = "community" | "work" | "school";

export const FF_SUB_PROGRAM_NAME: Record<
  FFSubProgramId,
  FFSubProgramme
> = {
  community: "Community-Based",
  work: "Work-Based",
  school: "School-Based",
};

/**
 * Applicant-facing status, exactly as VMS My Applications shows it
 * (VolAppStatus). "background-check" is an applicant status label
 * ("Awaiting Background Check"), not a staff pipeline stage.
 */
export type FFApplicantFacingStatus =
  | "draft"
  | "in-progress"
  | "background-check"
  | "accepted-pending-certs"
  | "approved"
  | "waitlisted"
  | "error"
  // Saved on seeded (pre-wizard) mentors only; never set by the wizard.
  | "under-review"
  | "inactive";

/** Tri-state answers: `false` is a valid "No", `null` is unanswered. */
export type YesNo = boolean | null;

export interface FFSignature {
  signedAs: string;
  /** Date & time stamped by the signature pad. */
  signedAt: string;
  /** How it was captured, when known. */
  method?: "draw" | "type";
  /** Saved image of a drawn signature (data:image/… URL), when one exists. */
  drawnPreview?: string;
}

/**
 * Reference to a stored file. Only ever describes a file the applicant
 * actually uploaded — never fabricated. `storageRef` is the document-store
 * key once one exists; the prototype has no document storage API yet.
 */
export interface FFFileRef {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  /**
   * Document-store key for this exact upload — also its identity for
   * reviews. Absent until a document store exists.
   */
  storageRef?: string;
  /** Who uploaded it, when recorded. */
  uploadedBy?: string;
  /** Date printed on the document (e.g. certificate date), when recorded. */
  documentDate?: string;
}

export interface FFLanguageSkills {
  read: boolean;
  write: boolean;
  speak: boolean;
}

export interface FFOverviewAnswers {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  pronouns: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  phone: string;
  /** Stored and shown masked only (maskSsn) — never the raw number. */
  ssn: string;
  maritalStatus: string;
  sex: string;
  religion: string;
  ethnicity: string;
  occupation: string;
  careerReason: string;
  scheduleChanges: string;
  availableDays: string[];
  cbWeekendAvailable: YesNo;
  cbWeekendDetails: string;
  sbTuesdayAvailable: YesNo;
  wbThursdayAvailable: YesNo;
  anticipatedLength: string;
  mentoringTimeframe: string;
  hearAbout: string;
  hearAboutComment: string;
}

export interface FFDescribeAnswers {
  personalStrengths: string;
  interests: string;
  priorMercyHome: string;
  refusedYouthProgram: string;
  disability: string;
  recentConviction: string;
  psychHelp: string;
  dietaryRestrictions: string;
  emergencyContact: string;
  cbChildType: string;
  cbVehicle: string;
  cbVehicleInsurance: string;
  cbMentorDescription: string;
  wbMentorDescription: string;
  employer: string;
  jobTitle: string;
  industry: string;
  education: string;
  languages: string[];
  otherLanguage: string;
  /** Read / Write / Speak per entry in `languages`. */
  languageProficiency: Record<string, FFLanguageSkills>;
  volunteerHistory: string;
  whyMentor: string;
  strengthsInterests: string;
  professionalStrengths: string;
  volunteerExperience: string;
  youthPositiveExperience: string;
  youthStrugglingStudent: string;
  convicted: YesNo;
  convictedComment: string;
  employmentStatus: string;
  profession: string;
  employmentLength: string;
  employerContact: string;
  ageGroups: string[];
  challengingQ: string;
}

/** Mentor Profile → About You (every sub-program). */
export interface FFAboutYouAnswers {
  personalStrengths: string;
  whyMentor: string;
  liveInChicago: string;
  neighbourhood: string;
  hometown: string;
  chicagoFavorite: string;
  funFact: string;
  lovedAsKid: string;
  lookForward: string;
  favoriteBook: string;
  favoriteFood: string;
  favoriteMusic: string;
  favoriteMovie: string;
  hearAbout: string;
  hearAboutComment: string;
}

/** Community-Based matching (Overview program preference + Matching step). */
export interface FFMatchingAnswers {
  geographicPref: string;
  sharedInterests: string[];
  preferredActivities: string[];
  specialConsiderations: string[];
  additionalNotes: string;
}

/** Community-Based Matching Preferences step. Legacy keys kept for old drafts. */
export interface FFMatchPrefsAnswers {
  agePreference: string;
  menteeLocations: string[];
  transportationMethod: string;
  travelAreaDetails: string;
  prefersPreviouslyMatched: YesNo;
  prefersSameEthnicity: YesNo;
  inCommon: string;
  notComfortable: string;
  anythingElse: string;
  commuteDistance: string;
  travelAreas: string[];
  ageRanks: Record<string, string>;
  otherRanks: Record<string, string>;
}

export interface FFConsentAnswers {
  backgroundSig: FFSignature | null;
  attestationSig: FFSignature | null;
  /** Agreement key → date/time signed. */
  agreements: Record<string, string>;
  quarterlyUpdates: boolean;
}

/** Sub-program profile groups are kept as submitted (open shape). */
export type FFSubProgramProfile = Record<string, unknown>;

/** Every answer the wizard submits, grouped as the wizard saves them. */
export interface FFMentorApplicationAnswers {
  overview: FFOverviewAnswers;
  describe: FFDescribeAnswers;
  cbProfile: FFSubProgramProfile;
  wbProfile: FFSubProgramProfile;
  sbProfile: FFSubProgramProfile;
  matching: FFMatchingAnswers;
  aboutYou: FFAboutYouAnswers;
  matchPrefs: FFMatchPrefsAnswers;
  consent: FFConsentAnswers;
  /** Agreement key → signed (false = not signed; still a kept answer). */
  docsSigned: Record<string, boolean>;
}

/** Reference response status — the values staff already use. */
export type FFReferenceStatus =
  "submitted" | "awaiting" | "declined";

export interface FFApplicationReference {
  id: string;
  /** "personal" | "business" */
  relationship: string;
  relationToSelf?: string;
  name: string;
  phone: string;
  email: string;
  permissionGranted: boolean;
  /** Applicant pressed Submit on this reference in the wizard. */
  submitted?: boolean;
  /** Reference's own response status, when known. */
  responseStatus?: FFReferenceStatus;
  responseDate?: string;
}

// ─── References (US 20039 Chunk 6) ──────────────────────────────────────────

/** References requested and required per sub-program. */
export const FF_REFERENCE_RULES: Record<
  FFSubProgramId,
  { requested: number; required: number }
> = {
  community: { requested: 3, required: 2 },
  school: { requested: 2, required: 2 },
  work: { requested: 1, required: 1 },
};

/**
 * Response statuses staff see. "Declined" is kept only for references whose
 * saved outcome is declined (an older status); it is never "received".
 */
export type FFReferenceResponseLabel =
  "Awaiting Response" | "Response Received" | "Declined";

/** Only an actual saved "submitted" response counts as received. */
export function isReferenceReceived(
  r: FFApplicationReference,
): boolean {
  return r.responseStatus === "submitted";
}

export function referenceResponseLabel(
  r: FFApplicationReference,
): FFReferenceResponseLabel {
  if (isReferenceReceived(r)) return "Response Received";
  return r.responseStatus === "declined"
    ? "Declined"
    : "Awaiting Response";
}

export const isBusinessReference = (
  r: FFApplicationReference,
) => r.relationship === "business";

/** At most one Business reference per application. */
export const FF_MAX_BUSINESS_REFERENCES = 1;

/**
 * The reference questionnaire's answers (VMS Reference Questionnaire),
 * as received from the reference.
 */
export interface FFReferenceResponse {
  howKnow?: string;
  settings?: string;
  trustBuild?: string;
  /** Reliability rating 1–5. */
  rating?: number | null;
  judgement?: string;
  signedAs?: string;
  /** When the reference submitted it. */
  submittedAt?: string;
}

/** A reference request the delivery service confirmed. */
export interface FFReferenceRequestRecord {
  id: string;
  /** "delivered" = the service confirmed delivery; "accepted" = queued only. */
  outcome: "delivered" | "accepted";
  at: string;
  atIso: string;
  by: string;
  byId: string;
  messageId?: string;
}

/** Post-submission training certificates (VMS Upload Certificates). */
export type FFCertificateKey =
  "virtus" | "dcfs" | "fingerprint" | "cpi";
// (fingerprint receipts stay stored; they are no longer an active document)

/** The applicant's submitted application — the single source for answers. */
export interface FFMentorApplication {
  /** Stable application id (VMS My Applications id, e.g. "VMS-4822"). */
  applicationId: string;
  /** Stable applicant identity (VMS account / constituent id). */
  applicantId: string;
  program: "friends-first";
  /** Every selected sub-program, in the applicant's order. */
  subPrograms: FFSubProgramId[];
  applicantStatus: FFApplicantFacingStatus;
  startedAt: string;
  submittedAt: string;
  /**
   * When the applicant's VMS account was created (YYYY-MM-DD or
   * MM/DD/YYYY). Optional: no source supplies it yet, so it stays absent
   * rather than being guessed from start/submission/constituent dates.
   */
  accountCreatedAt?: string;
  answers: FFMentorApplicationAnswers;
  references: FFApplicationReference[];
  /** Wizard document uploads by key (e.g. driversLicence). */
  uploads: Record<string, FFFileRef>;
  certificates: Partial<Record<FFCertificateKey, FFFileRef>>;
}

// ─── Staff side ─────────────────────────────────────────────────────────────

/** Mentor Application pipeline (US 20039): exactly the eight stages shown on
 *  the record and offered in the staff stage dropdown, in order. Rejected is
 *  always visible at position 7 but is an alternative outcome to Ready for
 *  Match, never a prerequisite of it. */
export const FF_MENTOR_PIPELINE_STAGES = [
  "Info Session",
  "Application",
  "Interview",
  "Profile",
  "Post-Interview Requirements",
  "Determination",
  "Rejected",
  "Ready for Match",
] as const;

/** The alternative outcome (position 7 of the pipeline). */
export const FF_MENTOR_REJECTED_STAGE = "Rejected" as const;

/** Every stage staff can select (and that can be newly saved), in order. */
export const FF_MENTOR_SELECTABLE_STAGES =
  FF_MENTOR_PIPELINE_STAGES;

/** Values older records may still carry. Readable, never offered, never
 *  migrated or converted. */
export const FF_MENTOR_LEGACY_STAGES = [
  "Matched",
  "Active",
] as const;

/** Every persisted stage value the app recognises when reading. */
export const FF_MENTOR_RECOGNISED_STAGES = [
  ...FF_MENTOR_SELECTABLE_STAGES,
  ...FF_MENTOR_LEGACY_STAGES,
] as const;
export type FFMentorPipelineStage =
  (typeof FF_MENTOR_RECOGNISED_STAGES)[number];

/** A stored value this app can read (selectable or legacy). */
export function isFFMentorPipelineStage(
  v: unknown,
): v is FFMentorPipelineStage {
  return (
    FF_MENTOR_RECOGNISED_STAGES as readonly unknown[]
  ).includes(v);
}

export type FFMentorSelectableStage =
  (typeof FF_MENTOR_SELECTABLE_STAGES)[number];

/** A stage staff may choose now (excludes the legacy values). */
export function isFFMentorSelectableStage(
  v: unknown,
): v is FFMentorSelectableStage {
  return (
    FF_MENTOR_SELECTABLE_STAGES as readonly unknown[]
  ).includes(v);
}

const ACCOUNT_DATE_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const ACCOUNT_DATE_MDY = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/**
 * The applicant account's creation date as MM/DD/YYYY, or "" when it isn't
 * recorded (or isn't a real calendar date). Calendar text only — no Date
 * parsing, so no timezone shift. Never falls back to another date.
 */
export function ffAccountCreatedDate(
  app:
    Pick<FFMentorApplication, "accountCreatedAt"> | undefined,
): string {
  const v = app?.accountCreatedAt?.trim();
  if (!v) return "";
  const iso = ACCOUNT_DATE_ISO.exec(v);
  const mdy = ACCOUNT_DATE_MDY.exec(v);
  const [y, m, d] = iso
    ? [+iso[1], +iso[2], +iso[3]]
    : mdy
      ? [+mdy[3], +mdy[1], +mdy[2]]
      : [0, 0, 0];
  if (!y || m < 1 || m > 12 || d < 1) return "";
  if (d > new Date(Date.UTC(y, m, 0)).getUTCDate()) return "";
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${pad(m)}/${pad(d)}/${pad(y, 4)}`;
}

/** Applicant-facing status labels, as VMS My Applications shows them. */
export const FF_APPLICANT_STATUS_LABEL: Record<
  FFApplicantFacingStatus,
  string
> = {
  draft: "Draft",
  "in-progress": "In Progress",
  "background-check": "Awaiting Background Check",
  "accepted-pending-certs": "Accepted – Pending Certificates",
  approved: "Approved",
  waitlisted: "Waitlisted",
  error: "Error",
  "under-review": "Under Review",
  inactive: "Inactive",
};

export interface FFDocumentReview {
  status: "pending" | "approved" | "rejected";
  /** Reviewer's display name at the time. */
  reviewedBy?: string;
  /** Reviewer's stable id. */
  reviewedById?: string;
  /** MM/DD/YYYY h:mm AM/PM. */
  reviewedAt?: string;
  reviewedAtIso?: string;
  note?: string;
  /** Identity (storageRef) of the exact file this decision is about. */
  fileId?: string;
  /** Certificate date the reviewer confirmed (MM/DD/YYYY), when entered. */
  verifiedDocumentDate?: string;
}

export interface FFStageHistoryEntry {
  /** Stable event id (absent on entries saved before stage editing). */
  id?: string;
  /** Stage before this change; null = it was not set. */
  fromStage?: string | null;
  stage: string;
  /** Date & time changed, MM/DD/YYYY h:mm AM/PM. */
  at: string;
  /** ISO timestamp of the change, for ordering. */
  atIso?: string;
  /** Display name of the staff user who made the change, as it was then. */
  by: string;
  /** Stable id of that staff user. */
  byId?: string;
  /** Saved status for the entry, when recorded. */
  status?: string;
}

/** The staff user performing an action (stable id + display name). */
export interface FFActor {
  id: string;
  name: string;
}

/**
 * Whether a mentor's readiness for matching has been verified. Only the
 * store produces this — callers can't assert it.
 */
export interface FFMatchReadiness {
  /** Eligible for Ready for Match: every applicable requirement Passed. */
  verified: boolean;
  /** Why not, in product language (first blocking reason). */
  reason?: string;
  /** Every blocking reason. */
  reasons?: string[];
}

/** Checklist result values (exactly these three). */
export type FFChecklistResult = "Pending" | "Passed" | "Failed";

/** A staff assessment of one manual checklist item. */
export interface FFChecklistAssessment {
  result: FFChecklistResult;
  note?: string;
  assessedBy: string;
  assessedById: string;
  /** MM/DD/YYYY h:mm AM/PM. */
  assessedAt: string;
  assessedAtIso: string;
}

/** The availability answers staff may update (US 20039 Chunk 4). */
export const FF_WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/**
 * Staff-updated availability. Same keys as the submitted overview answers,
 * so current availability is the submitted answers with these laid over.
 * `false` is a real "No", never "missing".
 */
export interface FFAvailabilityOverride {
  availableDays: string[];
  cbWeekendAvailable: YesNo;
  cbWeekendDetails: string;
  sbTuesdayAvailable: YesNo;
  wbThursdayAvailable: YesNo;
}

/**
 * Staff-only processing for one application, keyed by the same
 * applicationId. Never part of FFMentorApplication or its applicant view.
 */
export interface FFMentorApplicationStaff {
  /** Pipeline stage; null = not set. Independent of applicantStatus. */
  stage: FFMentorPipelineStage | null;
  /** Inactive is its own flag, not a stage or applicant status. */
  inactive: boolean;
  /** Stable id of the assigned MHBG Staff constituent. */
  coordinatorId: number | null;
  /** Internal only; line breaks preserved. */
  coordinatorNotes: string;
  /** By upload / certificate key. */
  documentReviews: Record<string, FFDocumentReview>;
  /** Saved stage changes only — never generated on read. */
  stageHistory: FFStageHistoryEntry[];
  /** Staff availability updates; null = the submitted answers still apply. */
  availabilityOverride: FFAvailabilityOverride | null;
  /** Response content received from each reference, by reference id. */
  referenceResponses: Record<string, FFReferenceResponse>;
  /** Confirmed reference requests, by reference id (oldest first). */
  referenceRequests: Record<string, FFReferenceRequestRecord[]>;
  /** Earlier review decisions, by document type (oldest first). */
  documentReviewHistory: Record<string, FFDocumentReview[]>;
  /** Staff assessments of manual checklist items, by item id. */
  checklistAssessments: Record<string, FFChecklistAssessment>;
}

/** Nothing assumed: no stage, coordinator, notes or history yet. */
export function defaultFFMentorApplicationStaff(): FFMentorApplicationStaff {
  return {
    stage: null,
    inactive: false,
    coordinatorId: null,
    coordinatorNotes: "",
    documentReviews: {},
    stageHistory: [],
    availabilityOverride: null,
    referenceResponses: {},
    referenceRequests: {},
    documentReviewHistory: {},
    checklistAssessments: {},
  };
}

/** The editable availability as the applicant submitted it. */
export function submittedAvailability(
  app: FFMentorApplication,
): FFAvailabilityOverride {
  const o = app.answers.overview;
  return {
    availableDays: [...(o.availableDays ?? [])],
    cbWeekendAvailable: o.cbWeekendAvailable ?? null,
    cbWeekendDetails: o.cbWeekendDetails ?? "",
    sbTuesdayAvailable: o.sbTuesdayAvailable ?? null,
    wbThursdayAvailable: o.wbThursdayAvailable ?? null,
  };
}

/**
 * Current availability: the submitted answers, with any saved staff update
 * laid over. Weekend details only apply while weekend availability is Yes.
 */
export function currentAvailability(
  app: FFMentorApplication,
  staff: FFMentorApplicationStaff,
): FFAvailabilityOverride {
  const a =
    staff.availabilityOverride ?? submittedAvailability(app);
  return {
    ...a,
    cbWeekendDetails:
      a.cbWeekendAvailable === true ? a.cbWeekendDetails : "",
  };
}

export type FFAvailabilityErrors = Partial<
  Record<keyof FFAvailabilityOverride, string>
>;

/**
 * Only the questions that apply to the selected sub-programs are required;
 * No is a valid answer.
 */
export function validateFFAvailability(
  subPrograms: FFSubProgramId[],
  a: FFAvailabilityOverride,
): FFAvailabilityErrors {
  const e: FFAvailabilityErrors = {};
  if (!a.availableDays.length)
    e.availableDays = "Select at least one available day.";
  if (subPrograms.includes("community")) {
    if (a.cbWeekendAvailable === null)
      e.cbWeekendAvailable = "Select Yes or No.";
    else if (a.cbWeekendAvailable && !a.cbWeekendDetails.trim())
      e.cbWeekendDetails =
        "Enter the weekend days and time frames.";
  }
  if (
    subPrograms.includes("school") &&
    a.sbTuesdayAvailable === null
  )
    e.sbTuesdayAvailable = "Select Yes or No.";
  if (
    subPrograms.includes("work") &&
    a.wbThursdayAvailable === null
  )
    e.wbThursdayAvailable = "Select Yes or No.";
  return e;
}

/**
 * •••-••-1234 — the only form of the SSN the prototype stores or shows.
 * Already-masked input is returned unchanged.
 */
export function maskSsn(ssn: string | undefined): string {
  const digits = (ssn ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return `•••-••-${digits.slice(-4).padStart(4, "•")}`;
}

// ─── Reference assessment ───────────────────────────────────────────────────

export interface FFReferenceAssessment {
  /** Each selected sub-program's own thresholds (never added together). */
  programs: {
    program: FFSubProgramId;
    requested: number;
    required: number;
  }[];
  /** References with an actual saved response, each counted once. */
  received: number;
  /** received / required (capped at 100); null = not determined. */
  completionPct: number | null;
  /** true/false for a single sub-program; null = not determined. */
  requirementMet: boolean | null;
  /** Reasons the outcome is undetermined or the data has a problem. */
  issues: string[];
  businessCount: number;
}

/**
 * Reference counts for one application, for the References tab and the
 * later readiness check. With several sub-programs selected, how references
 * count across them hasn't been confirmed, so completion is not determined.
 */
export function assessFFReferences(
  app: FFMentorApplication,
): FFReferenceAssessment {
  const refs = app.references ?? [];
  const seen = new Set<string>();
  let received = 0;
  refs.forEach((r, i) => {
    const key = r.id || `#${i}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (isReferenceReceived(r)) received++;
  });
  const programs = app.subPrograms.map((p) => ({
    program: p,
    ...FF_REFERENCE_RULES[p],
  }));
  const businessCount = refs.filter(isBusinessReference).length;
  const issues: string[] = [];
  if (businessCount > FF_MAX_BUSINESS_REFERENCES)
    issues.push(
      `${businessCount} Business references are listed; only ${FF_MAX_BUSINESS_REFERENCES} is allowed.`,
    );
  let completionPct: number | null = null;
  let requirementMet: boolean | null = null;
  if (programs.length === 1) {
    const { required } = programs[0];
    completionPct = Math.min(
      100,
      Math.round((received / required) * 100),
    );
    requirementMet = received >= required;
  } else if (programs.length > 1) {
    issues.push(
      "How references count across more than one sub-program has not been confirmed.",
    );
  }
  return {
    programs,
    received,
    completionPct,
    requirementMet,
    issues,
    businessCount,
  };
}

// ─── Recorded dates ─────────────────────────────────────────────────────────

export interface FFCalendarDate {
  y: number;
  m: number;
  d: number;
}

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];
const TIME = String.raw`(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)`;
const RECORDED_FORMATS: RegExp[] = [
  // 09/14/2026 or 09/14/2026 10:42 AM (prototype stamps)
  new RegExp(
    String.raw`^(\d{2})\/(\d{2})\/(\d{4})(?:,?\s+${TIME})?$`,
    "i",
  ),
  // September 30, 2026 at 9:58:01 AM (wizard's toLocaleString)
  new RegExp(
    String.raw`^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})(?:(?:\s+at|,)\s+${TIME})?$`,
    "i",
  ),
  // 2026-09-30 or 2026-09-30T14:05:00.000Z
  /^(\d{4})-(\d{2})-(\d{2})(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?$/,
];

const validDay = (y: number, m: number, d: number) =>
  m >= 1 &&
  m <= 12 &&
  d >= 1 &&
  d <= new Date(Date.UTC(y, m, 0)).getUTCDate();
const validTime = (h?: string, min?: string, sec?: string) =>
  h === undefined ||
  (+h >= 1 &&
    +h <= 12 &&
    +min! <= 59 &&
    (sec === undefined || +sec <= 59));

/**
 * The calendar date of a recorded date or date/time in one of the formats
 * the wizard and this app save. null when it isn't one, or isn't a real
 * date/time. No timezone conversion is applied.
 */
export function parseRecordedDate(
  value: unknown,
): FFCalendarDate | null {
  const s = typeof value === "string" ? value.trim() : "";
  if (!s) return null;
  let m = RECORDED_FORMATS[0].exec(s);
  if (m) {
    const [y, mo, d] = [+m[3], +m[1], +m[2]];
    return validDay(y, mo, d) && validTime(m[4], m[5], m[6])
      ? { y, m: mo, d }
      : null;
  }
  m = RECORDED_FORMATS[1].exec(s);
  if (m) {
    const mo = MONTHS.indexOf(m[1].toLowerCase()) + 1;
    const [y, d] = [+m[3], +m[2]];
    return mo &&
      validDay(y, mo, d) &&
      validTime(m[4], m[5], m[6])
      ? { y, m: mo, d }
      : null;
  }
  m = RECORDED_FORMATS[2].exec(s);
  if (m) {
    const [y, mo, d] = [+m[1], +m[2], +m[3]];
    return validDay(y, mo, d) ? { y, m: mo, d } : null;
  }
  return null;
}

export const calendarKey = (c: FFCalendarDate) =>
  c.y * 10000 + c.m * 100 + c.d;

export const todayCalendar = (
  now = new Date(),
): FFCalendarDate => ({
  y: now.getFullYear(),
  m: now.getMonth() + 1,
  d: now.getDate(),
});

// ─── Mentor availability (US 20039 Chunk 10) ────────────────────────────────

/** A match ended by a mentor's Inactive action. */
export interface FFMentorMatchClosure {
  /** The mentor whose match this is (checked before applying). */
  mentorId: string;
  endDate: string; // MM/DD/YYYY
  endTime: string; // h:mm AM/PM
  /** Epoch ms of the confirmed action. */
  at: number;
  reason: string;
  by: string;
  byId: string;
}

/**
 * Availability for one mentor (canonical id = the applicant id), shared by
 * every application that applicant has. The single source of the Inactive
 * setting.
 */
export interface FFMentorAvailability {
  inactive: boolean;
  /** MM/DD/YYYY h:mm AM/PM of the last change. */
  changedAt: string;
  changedBy: string;
  changedById: string;
  /** Matches ended by Inactive actions, by match id. */
  matchClosures: Record<string, FFMentorMatchClosure>;
}
// ─── Staff edits to Application Details (US 20039 Chunk 2) ─────────────────
// Staff corrections are saved beside the application, never inside it: the
// submitted answers (or an older seeded mentor's mapped answers) stay as they
// were, and the effective application is those answers with the staff
// corrections laid over (applyFFApplicationEdit). Only the explicit
// allowlists below can be edited; everything else — Youth Experience,
// Background Disclosure, the SSN, references, uploads, signatures,
// processing — is protected, in the write API as well as the UI.
// Availability answers are NOT part of this overlay: they use the existing
// staff availability update (availabilityOverride), so both editors share
// one current-availability record.

export const FF_EDITABLE_OVERVIEW_KEYS = [
  "firstName",
  "middleName",
  "lastName",
  "dob",
  "email",
  "phone",
  "maritalStatus",
  "sex",
  "religion",
  "ethnicity",
  "address",
  "city",
  "state",
  "zip",
  "occupation",
  "careerReason",
  "scheduleChanges",
  "anticipatedLength",
  "mentoringTimeframe",
  "hearAbout",
  "hearAboutComment",
] as const satisfies readonly (keyof FFOverviewAnswers)[];
export type FFEditableOverviewKey =
  (typeof FF_EDITABLE_OVERVIEW_KEYS)[number];

export const FF_EDITABLE_DESCRIBE_KEYS = [
  "personalStrengths",
  "interests",
  "whyMentor",
  "priorMercyHome",
  "refusedYouthProgram",
  "disability",
  "recentConviction",
  "psychHelp",
  "dietaryRestrictions",
  "emergencyContact",
  "cbChildType",
  "cbVehicle",
  "cbVehicleInsurance",
  "languages",
  "otherLanguage",
  "languageProficiency",
] as const satisfies readonly (keyof FFDescribeAnswers)[];
export type FFEditableDescribeKey =
  (typeof FF_EDITABLE_DESCRIBE_KEYS)[number];

/** A staff change set: only the keys that changed. */
export interface FFApplicationDetailsChange {
  overview?: Partial<
    Pick<FFOverviewAnswers, FFEditableOverviewKey>
  >;
  describe?: Partial<
    Pick<FFDescribeAnswers, FFEditableDescribeKey>
  >;
  subPrograms?: FFSubProgramId[];
  availability?: FFAvailabilityOverride;
}

/** Saved staff corrections for one application, with who and when. */
export interface FFApplicationDetailsEdit {
  overview?: FFApplicationDetailsChange["overview"];
  describe?: FFApplicationDetailsChange["describe"];
  subPrograms?: FFSubProgramId[];
  updatedAt: string;
  updatedBy: string;
  updatedById: string;
}

/** The application with staff corrections applied (a new object). */
export function applyFFApplicationEdit(
  app: FFMentorApplication,
  edit: FFApplicationDetailsEdit | undefined,
): FFMentorApplication {
  if (!edit) return app;
  return {
    ...app,
    subPrograms: edit.subPrograms ?? app.subPrograms,
    answers: {
      ...app.answers,
      overview: {
        ...app.answers.overview,
        ...(edit.overview ?? {}),
      },
      describe: {
        ...app.answers.describe,
        ...(edit.describe ?? {}),
      },
    },
  };
}

export type FFDetailsErrors = Record<string, string>;

const MDY = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ZIP = /^\d{5}(-\d{4})?$/;

/** A real calendar date in MM/DD/YYYY. */
export function isValidMdyDate(v: string): boolean {
  const m = MDY.exec(v);
  if (!m) return false;
  const [mo, d, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(y, mo - 1, d);
  return (
    y >= 1900 &&
    dt.getFullYear() === y &&
    dt.getMonth() === mo - 1 &&
    dt.getDate() === d
  );
}

/**
 * Validates only what changed — an unrelated blank legacy answer never blocks
 * a correction. `effective` is the application as it would be after the
 * change; keys are field ids (overview keys, describe keys, "subPrograms",
 * or an availability key).
 */
export function validateFFApplicationDetails(
  change: FFApplicationDetailsChange,
  effective: FFMentorApplication,
): FFDetailsErrors {
  const e: FFDetailsErrors = {};
  const o = change.overview ?? {};
  const d = change.describe ?? {};
  const req = (
    k: string,
    v: string | undefined,
    msg: string,
  ) => {
    if (!(v ?? "").trim()) e[k] = msg;
  };
  if ("firstName" in o)
    req(
      "firstName",
      o.firstName,
      "Legal First Name is required.",
    );
  if ("lastName" in o)
    req("lastName", o.lastName, "Legal Last Name is required.");
  if ("dob" in o) {
    const v = (o.dob ?? "").trim();
    if (!v) e.dob = "Date of Birth is required.";
    else if (!isValidMdyDate(v))
      e.dob = "Enter a valid date (MM/DD/YYYY).";
    else if (new Date(v) > new Date())
      e.dob = "Date of Birth can't be in the future.";
  }
  if ("email" in o) {
    const v = (o.email ?? "").trim();
    if (!v) e.email = "Email Address is required.";
    else if (!EMAIL.test(v))
      e.email = "Enter a valid email address.";
  }
  if ("phone" in o) {
    const digits = (o.phone ?? "").replace(/\D/g, "");
    if (!digits)
      e.phone = "Preferred Phone Number is required.";
    else if (digits.length !== 10)
      e.phone = "Enter a 10-digit phone number.";
  }
  if (
    "zip" in o &&
    (o.zip ?? "").trim() &&
    !ZIP.test((o.zip ?? "").trim())
  )
    e.zip = "Enter a valid ZIP code.";
  if (
    ("hearAbout" in o || "hearAboutComment" in o) &&
    effective.answers.overview.hearAbout === "other" &&
    !effective.answers.overview.hearAboutComment.trim()
  )
    e.hearAboutComment = "Describe how you heard about us.";
  if (change.subPrograms) {
    const ok = change.subPrograms.every((s) =>
      (["community", "work", "school"] as const).includes(s),
    );
    if (!change.subPrograms.length || !ok)
      e.subPrograms = "Select at least one Sub-Program.";
  }
  if (
    ("languages" in d || "otherLanguage" in d) &&
    effective.answers.describe.languages.includes("Other") &&
    !effective.answers.describe.otherLanguage.trim()
  )
    e.otherLanguage = "Enter the other language.";
  if (change.availability)
    Object.assign(
      e,
      validateFFAvailability(
        effective.subPrograms,
        change.availability,
      ),
    );
  return e;
}