// Mock medication oversight data: sample doses for the Global Medication
// Error Dashboard (US 20142) and Missing or Incomplete Medication
// Documentation (US 20143). Everything is FICTIONAL FIXTURE DATA, written
// through the shared stores — canonical medication logs, their attestation
// records, documentation reviews and correction overlays — so both screens
// derive their rows through their normal selectors / evaluator. Nothing
// here feeds a table directly, and no expected-dose schedule is registered.
//
// Applied additively and idempotently (applyMedicationOversightDemoSeed):
// records are added only when their stable id is not already saved, never
// replaced, re-timestamped or re-added, so refreshes, existing browser data
// and later user corrections / resolutions / deletions are all preserved.
// This module imports the stores; the stores never import it.
//
// Samples (the contribution is 6 outstanding errors + 4 known issues):
//   A Assigned  · Yes/Yes · REF   → both tables
//   B Updated   · Yes/Yes · MDS   → both tables
//   C Assigned  · Yes/Yes · EMP   → both tables
//   D Updated   · documented receipt ("Given") → outstanding errors only
//   E Assigned  · documented receipt ("Given") → outstanding errors only
//   F Updated   · documented receipt ("Given") → outstanding errors only
//   G Resolved  · Yes/Yes · MED   → known documentation issues only
//   H Resolved  · documented receipt ("Given") → neither
// Staff Dispensed = Yes is supplied the only supported way: a correction
// overlay (the dispensing staff NAME on the log is not a Yes attestation).
// "Given" is the evaluator's existing legacy mapping to a receipt meaning
// (still provisional policy). No attestation stage is recorded, because the
// source records none.

import { getAssignmentById } from "./youthMedicationAssignments";
import {
  addMissingSeedRecords,
  type MedicationAttestationRecord,
  type MedicationLogRecord,
} from "./medicationLogStore";
import {
  addMissingSeedReviewRecords,
  type DispensationCorrection,
  type DocumentationReview,
  type MedReviewLog,
  type ReviewType,
} from "./medReviewStore";

/** Marks every record this module writes as fixture data. */
export const DEMO_ACTOR = "Medication Oversight Demo Data";

const ATTEST_TEXT =
  "I attest that I have followed Mercy Home's policies and procedures for medication dispensation & documentation.";

type Status = "Assigned" | "Updated" | "Resolved";
type HistoryStep = [
  status: Status,
  assignee: string,
  /** ISO instant */
  at: string,
  comment: string,
];

interface Sample {
  key: string;
  /** Program the dose was recorded under (Youth 1 → Program 1,
   *  Youth 12 → Program 3 per their active enrollments). */
  programId: number;
  youthId: string;
  /** youthMedicationAssignments id — name, dose, period come from it. */
  assignmentId: string;
  /** ISO date and the instant the log was recorded. */
  doseDate: string;
  recordedAt: string;
  /** Recorded medication code ("Given" = supported legacy receipt value). */
  code: string;
  /** Dispensing staff NAME shown on the log (not a Yes attestation). */
  staff: string;
  instructions: string;
  history: HistoryStep[];
}

const WINDOW: Record<string, [string, string]> = {
  Morning: ["06:00 AM", "11:00 AM"],
  Afternoon: ["12:00 PM", "03:00 PM"],
  Evening: ["05:00 PM", "08:00 PM"],
  Bedtime: ["08:00 PM", "10:30 PM"],
};

export const MEDICATION_OVERSIGHT_SAMPLES: readonly Sample[] = [
  {
    key: "A", programId: 1, youthId: "1", assignmentId: "YM-1-001",
    doseDate: "2026-10-21", recordedAt: "2026-10-21T13:10:00.000Z",
    code: "REF", staff: "Sarah Johnson", instructions: "Take with food",
    history: [["Assigned", "Maria Santos", "2026-10-23T14:05:00.000Z", "REF code recorded alongside a Yes/Yes entry — please verify with the staff member."]],
  },
  {
    key: "B", programId: 1, youthId: "1", assignmentId: "YM-1-003",
    doseDate: "2026-10-22", recordedAt: "2026-10-22T18:25:00.000Z",
    code: "MDS", staff: "Michael Chen", instructions: "Take in the afternoon",
    history: [
      ["Assigned", "David Reyes", "2026-10-23T15:30:00.000Z", "Missed-dose code with both attestations marked Yes."],
      ["Updated", "David Reyes", "2026-10-25T16:10:00.000Z", "Staff updated the dose record; awaiting verification."],
    ],
  },
  {
    key: "C", programId: 3, youthId: "12", assignmentId: "YM-12-001",
    doseDate: "2026-10-23", recordedAt: "2026-10-23T13:05:00.000Z",
    code: "EMP", staff: "Lisa Martinez", instructions: "Take at the same time daily",
    history: [["Assigned", "Linda Okafor", "2026-10-24T13:40:00.000Z", "Out-of-stock code recorded with a Yes/Yes entry — confirm what was given."]],
  },
  {
    key: "D", programId: 1, youthId: "1", assignmentId: "YM-1-004",
    doseDate: "2026-10-20", recordedAt: "2026-10-21T02:40:00.000Z",
    code: "Given", staff: "Sarah Johnson", instructions: "Give at bedtime",
    history: [
      ["Assigned", "James Carter", "2026-10-21T14:00:00.000Z", "Attestation wording needs clarification."],
      ["Updated", "James Carter", "2026-10-24T15:20:00.000Z", "Med leader clarified the attestation; ready for verification."],
    ],
  },
  {
    key: "E", programId: 3, youthId: "12", assignmentId: "YM-12-002",
    doseDate: "2026-10-22", recordedAt: "2026-10-23T02:55:00.000Z",
    code: "Given", staff: "Michael Chen", instructions: "Give at bedtime",
    history: [["Assigned", "Sarah Johnson", "2026-10-23T16:45:00.000Z", "Documentation clarification requested by the med leader."]],
  },
  {
    key: "F", programId: 3, youthId: "12", assignmentId: "YM-12-001",
    doseDate: "2026-10-19", recordedAt: "2026-10-19T13:20:00.000Z",
    code: "Given", staff: "Lisa Martinez", instructions: "Take at the same time daily",
    history: [
      ["Assigned", "Maria Santos", "2026-10-20T12:50:00.000Z", "Dose time entry looked incomplete."],
      ["Updated", "Maria Santos", "2026-10-22T17:35:00.000Z", "Corrected entry submitted for verification."],
    ],
  },
  {
    key: "G", programId: 3, youthId: "12", assignmentId: "YM-12-002",
    doseDate: "2026-10-17", recordedAt: "2026-10-18T02:30:00.000Z",
    code: "MED", staff: "Sarah Johnson", instructions: "Give at bedtime",
    history: [
      ["Assigned", "David Reyes", "2026-10-18T14:15:00.000Z", "Medical-orders code recorded with a Yes/Yes entry."],
      ["Resolved", "David Reyes", "2026-10-20T13:25:00.000Z", "Review closed after the med leader follow-up."],
    ],
  },
  {
    key: "H", programId: 1, youthId: "1", assignmentId: "YM-1-002",
    doseDate: "2026-10-15", recordedAt: "2026-10-15T13:00:00.000Z",
    code: "Given", staff: "Michael Chen", instructions: "Take with breakfast",
    history: [
      ["Assigned", "Linda Okafor", "2026-10-16T14:30:00.000Z", "Dose period comment missing."],
      ["Updated", "Linda Okafor", "2026-10-17T15:10:00.000Z", "Comment added by staff."],
      ["Resolved", "Linda Okafor", "2026-10-18T16:00:00.000Z", "Verified and closed."],
    ],
  },
];

const minutesAfter = (iso: string, m: number) =>
  new Date(Date.parse(iso) + m * 60_000).toISOString();

/** The canonical records for every sample — plain data, no store access. */
export function buildMedicationOversightDemoRecords() {
  const logs: Omit<MedicationLogRecord, "recordNumber">[] = [];
  const attestations: MedicationAttestationRecord[] = [];
  const reviews: DocumentationReview[] = [];
  const corrections: DispensationCorrection[] = [];

  for (const s of MEDICATION_OVERSIGHT_SAMPLES) {
    const a = getAssignmentById(s.assignmentId);
    // An assignment that no longer exists is skipped rather than guessed.
    if (!a || a.youthId !== s.youthId) continue;
    const logId = `LOG-DEMO-${s.key}`;
    const attId = `ATT-DEMO-${s.key}`;
    const [start, end] = WINDOW[a.dosePeriod];
    logs.push({
      id: logId,
      youthId: s.youthId,
      programId: s.programId,
      youthMedicationId: a.id,
      catalogMedicationId: a.catalogMedicationId,
      medicationName: a.medicationName,
      dose: a.dose,
      dosePeriod: a.dosePeriod,
      doseDate: s.doseDate,
      logType: "Prescription Dispensation",
      instance: a.instance,
      seq: 1,
      primaryCode: s.code,
      comment: "",
      dosePeriodComment: "",
      details: {
        "Start Time": start,
        "End Time": end,
        "Package Code": `PKG-DEMO-${s.key}`,
        "Primary Status": "Received",
        "Dose Period": a.dosePeriod,
        Instructions: s.instructions,
        // A staff NAME — never read as a Yes attestation.
        "Staff Dispensed": s.staff,
        "Youth Received": "Yes",
      },
      attestationId: attId,
      createdAt: s.recordedAt,
    });
    attestations.push({
      id: attId,
      logType: "Prescription Dispensation",
      youthId: s.youthId,
      programId: s.programId,
      staff: s.staff,
      text: ATTEST_TEXT,
      attestedAt: s.recordedAt,
      logIds: [logId],
    });
    // Staff Dispensed = Yes, the supported way: a correction overlay.
    corrections.push({
      id: `DCR-DEMO-${s.key}`,
      logId,
      programId: s.programId,
      staffDispensed: "Yes",
      youthReceived: "",
      primaryCode: "",
      previous: { staffDispensed: "", youthReceived: "Yes", primaryCode: s.code },
      comment: "Demo fixture: Staff Dispensed recorded as Yes.",
      by: DEMO_ACTOR,
      byId: null,
      at: minutesAfter(s.recordedAt, 5),
    });
    s.history.forEach(([reviewStatus, assignee, reviewedAt, comment], i) =>
      reviews.push({
        id: `DRV-DEMO-${s.key}${i + 1}`,
        logId,
        programId: s.programId,
        reviewStatus,
        assignee,
        comment,
        reviewer: DEMO_ACTOR,
        reviewerId: null,
        reviewedAt,
      }),
    );
  }
  return { logs, attestations, reviews, corrections };
}

// ─── Extra demo history (dispensations, counts, review logs) ───────────────
// Fictional fixture data so the Medication Documentation / Count dispensation
// panels, the Count Logs table and the Med Review Hub table are populated.
// Same additive, stable-id rules as above.

/** Prior routine doses: [assignmentId, programId, staff, dates...]. */
const HISTORY_DOSES: [string, number, string, string[]][] = [
  ["YM-1-001", 1, "Sarah Johnson", ["2026-10-14", "2026-10-16", "2026-10-18", "2026-10-20"]],
  ["YM-1-002", 1, "Michael Chen", ["2026-10-12", "2026-10-13", "2026-10-14"]],
  ["YM-1-003", 1, "Michael Chen", ["2026-10-16", "2026-10-18", "2026-10-20", "2026-10-21"]],
  ["YM-1-004", 1, "Sarah Johnson", ["2026-10-16", "2026-10-17", "2026-10-18", "2026-10-19"]],
  ["YM-12-001", 3, "Lisa Martinez", ["2026-10-15", "2026-10-17", "2026-10-21", "2026-10-22"]],
  ["YM-12-002", 3, "Michael Chen", ["2026-10-14", "2026-10-15", "2026-10-19", "2026-10-21"]],
];

/** Count logs: [key, assignmentId, programId, staff, date, quantity, comment]. */
const COUNT_SAMPLES: [string, string, number, string, string, number, string][] = [
  ["C01", "YM-1-001", 1, "Sarah Johnson", "2026-10-14", 28, "Weekly count verified."],
  ["C02", "YM-1-001", 1, "Maria Santos", "2026-10-21", 21, "Count matches dispensation log."],
  ["C03", "YM-1-002", 1, "Michael Chen", "2026-10-15", 45, "Bottle count verified."],
  ["C04", "YM-1-003", 1, "David Reyes", "2026-10-18", 26, "Count verified, card intact."],
  ["C05", "YM-1-003", 1, "Michael Chen", "2026-10-22", 22, "Discrepancy of 1 resolved with med leader."],
  ["C06", "YM-1-004", 1, "Sarah Johnson", "2026-10-19", 12, "Bedtime count completed."],
  ["C07", "YM-12-001", 3, "Lisa Martinez", "2026-10-17", 24, "Count verified."],
  ["C08", "YM-12-001", 3, "Linda Okafor", "2026-10-23", 19, "Refill requested — under 3 weeks supply."],
  ["C09", "YM-12-002", 3, "Michael Chen", "2026-10-19", 18, "Bedtime count completed."],
  ["C10", "YM-12-002", 3, "Lisa Martinez", "2026-10-26", 11, "Count verified, 11 remaining."],
];

/** Med Review Hub logs: [key, programId, type, date, reviewer, start, end, issues, details]. */
const REVIEW_LOG_SAMPLES: [string, number, ReviewType, string, string, string, string, number, string][] = [
  ["R01", 1, "Med Cart Review", "2026-10-03", "Maria Santos", "", "", 0, "Med cart clean and stocked; all drawers labeled."],
  ["R02", 1, "Count Review", "2026-10-07", "David Reyes", "2026-09-30", "2026-10-06", 1, "Zoloft count off by one; resolved with staff."],
  ["R03", 1, "Med Documentation Review", "2026-10-10", "James Carter", "2026-10-01", "2026-10-09", 2, "Two dose entries missing period comments."],
  ["R04", 3, "Med Cart Review", "2026-10-12", "Linda Okafor", "", "", 1, "Expired PRN Tylenol removed from cart."],
  ["R05", 3, "Count Review", "2026-10-14", "Linda Okafor", "2026-10-07", "2026-10-13", 0, "All counts reconciled."],
  ["R06", 3, "Med Documentation Review", "2026-10-17", "Sarah Johnson", "2026-10-10", "2026-10-16", 0, "Documentation complete for the period."],
  ["R07", 1, "Count Review", "2026-10-21", "Maria Santos", "2026-10-14", "2026-10-20", 0, "Counts match dispensation history."],
  ["R08", 1, "Med Cart Review", "2026-10-24", "David Reyes", "", "", 0, "Cart inspection passed."],
  ["R09", 3, "Med Documentation Review", "2026-10-27", "Linda Okafor", "2026-10-17", "2026-10-26", 3, "Out-of-stock and bedtime attestation entries need follow-up."],
  ["R10", 1, "Med Documentation Review", "2026-10-30", "James Carter", "2026-10-20", "2026-10-29", 1, "REF code entry assigned for verification."],
];

/** UTC instant for a local wall-clock "HH:MM AM" start on a date (CDT, UTC-5). */
function instantFor(date: string, time12: string, plusMin = 15) {
  const [hm, ap] = time12.split(" ");
  let [h, m] = hm.split(":").map(Number);
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return minutesAfter(`${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00.000-05:00`, plusMin);
}

export function buildMedicationExtraDemoRecords() {
  const logs: Omit<MedicationLogRecord, "recordNumber">[] = [];
  const attestations: MedicationAttestationRecord[] = [];
  const corrections: DispensationCorrection[] = [];
  const reviewLogs: MedReviewLog[] = [];

  for (const [assignmentId, programId, staff, dates] of HISTORY_DOSES) {
    const a = getAssignmentById(assignmentId);
    if (!a) continue;
    const [start, end] = WINDOW[a.dosePeriod];
    dates.forEach((doseDate, i) => {
      const key = `${assignmentId}-${i + 1}`;
      const logId = `LOG-DEMO-H-${key}`;
      const attId = `ATT-DEMO-H-${key}`;
      const at = instantFor(doseDate, start, 20 + i * 7);
      logs.push({
        id: logId,
        youthId: a.youthId,
        programId,
        youthMedicationId: a.id,
        catalogMedicationId: a.catalogMedicationId,
        medicationName: a.medicationName,
        dose: a.dose,
        dosePeriod: a.dosePeriod,
        doseDate,
        logType: "Prescription Dispensation",
        instance: a.instance,
        seq: 1,
        primaryCode: "",
        comment: "",
        dosePeriodComment: "",
        details: {
          "Start Time": start,
          "End Time": end,
          "Package Code": `PKG-DEMO-H-${key}`,
          "Primary Status": "Received",
          "Dose Period": a.dosePeriod,
          "Staff Dispensed": staff,
          "Youth Received": "Yes",
        },
        attestationId: attId,
        createdAt: at,
      });
      attestations.push({
        id: attId,
        logType: "Prescription Dispensation",
        youthId: a.youthId,
        programId,
        staff,
        text: ATTEST_TEXT,
        attestedAt: at,
        logIds: [logId],
      });
      corrections.push({
        id: `DCR-DEMO-H-${key}`,
        logId,
        programId,
        staffDispensed: "Yes",
        youthReceived: "",
        primaryCode: "",
        previous: { staffDispensed: "", youthReceived: "Yes", primaryCode: "" },
        comment: "Demo fixture: Staff Dispensed recorded as Yes.",
        by: DEMO_ACTOR,
        byId: null,
        at: minutesAfter(at, 5),
      });
    });
  }

  for (const [key, assignmentId, programId, staff, doseDate, quantity, comment] of COUNT_SAMPLES) {
    const a = getAssignmentById(assignmentId);
    if (!a) continue;
    const logId = `LOG-DEMO-${key}`;
    const attId = `ATT-DEMO-${key}`;
    const at = instantFor(doseDate, WINDOW[a.dosePeriod][1], -30);
    logs.push({
      id: logId,
      youthId: a.youthId,
      programId,
      youthMedicationId: a.id,
      catalogMedicationId: a.catalogMedicationId,
      medicationName: a.medicationName,
      dose: a.dose,
      dosePeriod: a.dosePeriod,
      doseDate,
      logType: "Count",
      instance: a.instance,
      seq: 1,
      primaryCode: "",
      countType: "Units",
      quantity,
      comment,
      dosePeriodComment: "",
      details: {},
      attestationId: attId,
      createdAt: at,
    });
    attestations.push({
      id: attId,
      logType: "Count",
      youthId: a.youthId,
      programId,
      staff,
      text: ATTEST_TEXT,
      attestedAt: at,
      logIds: [logId],
    });
  }

  for (const [key, programId, reviewType, reviewDate, reviewer, startDate, endDate, issues, details] of REVIEW_LOG_SAMPLES) {
    const at = `${reviewDate}T19:00:00.000Z`;
    reviewLogs.push({
      id: `MRL-DEMO-${key}`,
      programId,
      reviewType,
      reviewDate,
      reviewer,
      reviewerId: null,
      startDate,
      endDate,
      numberOfIssues: issues,
      hasIssue: issues > 0,
      details,
      createdAt: at,
      modifiedAt: at,
      history: [],
    });
  }
  return { logs, attestations, corrections, reviewLogs };
}

/** Adds any missing sample records through the shared stores. Safe to call
 *  on every start: records already saved are left exactly as they are. */
export function applyMedicationOversightDemoSeed() {
  const d = buildMedicationOversightDemoRecords();
  const x = buildMedicationExtraDemoRecords();
  const logResult = addMissingSeedRecords({
    logs: [...d.logs, ...x.logs],
    attestations: [...d.attestations, ...x.attestations],
  });
  const reviewResult = addMissingSeedReviewRecords({
    documentationReviews: d.reviews,
    corrections: [...d.corrections, ...x.corrections],
    reviewLogs: x.reviewLogs,
  });
  return { logs: logResult, reviews: reviewResult };
}