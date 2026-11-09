// Program ↔ Youth enrollments plus the Youth-owned records the Program
// Record's Compliance & Activity Snapshot (19991) reads:
//
//   Program → Enrollment (programId) → Constituent (constituentId)
//   Constituent → Documents / Incident Reports / Connections / ITPs /
//                 Med Errors / Missing Med Documentation / Substance Tests
//
// CONSTITUENTS (mockConstituents.ts) is the source of truth for youth
// identity, NAME, Role and Status; records here reference it only by
// constituentId and never copy the name. Only Individual / Youth / Active
// constituents count as Active Youth. Profile links use /constituents/:id,
// the same route as the Constituents List View. Recent dates are generated
// relative to today so the 30-day windows always have something to show.
// Same module-store convention as mockProgramsData.ts.

import { getProgramById } from "./mockProgramsData";
import {
  CONSTITUENTS,
  type Constituent,
  getConstituentStatus,
} from "./mockConstituents";

export interface YouthProgramEnrollment {
  constituentId: number;
  programId: number;
  active: boolean;
}

/** An Active Youth resolved from CONSTITUENTS. */
export interface ActiveYouth {
  constituentId: number;
  name: string;
}

export interface YouthDocument {
  id: string;
  constituentId: number;
  name: string;
  /** ISO "YYYY-MM-DD" */
  expirationDate: string;
}

export interface IncidentReportRecord {
  id: number;
  /** Constituent IDs of every youth involved. */
  constituentIds: number[];
  /** Incident Reports list display text ("Last, First, …"). */
  youthInvolved: string;
  /** ISO local date-time "YYYY-MM-DDTHH:MM:SS" */
  incidentStartDateTime: string;
  program: string;
  /** Canonical Program ID (US 20222). Absent on older reports, which only
   *  carry the Program name. */
  programId?: number;
  staffInvolved: string;
  /** Business source of truth — "Finalized" once the IR is finalized. */
  status: string;
  /** Kept for Incident Reports list compatibility; mirrors Status. */
  isFinalized: boolean;
  /** Explicit incident types chosen on the IR. Absent on records created
   *  before types were preserved: the type is then unknown, not "none". */
  incidentTypes?: string[];
  /** Optional detail saved from a constituent profile's Create New Incident
   *  dialog (absent on every other record). */
  endDateTime?: string;
  location?: string;
  description?: string;
  /** Everyone on the incident, with the role each had. `constituentIds`
   *  stays the association key. */
  participants?: {
    constituentId: number | null;
    name: string;
    role: string;
  }[];
}

export const FINALIZED_STATUS = "Finalized";

// ─── Date helpers ────────────────────────────────────────────────────────────

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** ISO date `days` from today (negative = past). */
function daysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

function dateTimeDaysAgo(days: number, time: string): string {
  return `${daysFromToday(-days)}T${time}:00`;
}

// ─── Seed ────────────────────────────────────────────────────────────────────

const SEED_ENROLLMENTS: YouthProgramEnrollment[] = [
  { constituentId: 1, programId: 1, active: true },
  { constituentId: 2, programId: 1, active: true },
  { constituentId: 8, programId: 1, active: true },
  // Kevin Martinez — ended enrollment (and an Inactive constituent).
  { constituentId: 17, programId: 1, active: false },
  { constituentId: 12, programId: 3, active: true },
  { constituentId: 20, programId: 3, active: true },
  { constituentId: 25, programId: 4, active: true },
  // Demo Community Care Member (mockConstituents.ts, id 9301) — enrolled in
  // Program 1 so the Constituent Pass tab has an explicit, ID-based
  // Constituent → Program relationship to resolve.
  { constituentId: 9301, programId: 1, active: true },
];

const SEED_DOCUMENTS: YouthDocument[] = [
  {
    id: "D-101",
    constituentId: 1,
    name: "Immunization Records",
    expirationDate: daysFromToday(6),
  },
  {
    id: "D-102",
    constituentId: 1,
    name: "Photo ID",
    expirationDate: daysFromToday(400),
  },
  {
    id: "D-103",
    constituentId: 2,
    name: "Court Order",
    expirationDate: daysFromToday(18),
  },
  {
    id: "D-104",
    constituentId: 8,
    name: "Insurance Card",
    expirationDate: daysFromToday(29),
  },
  {
    id: "D-105",
    constituentId: 8,
    name: "Medical Consent",
    expirationDate: daysFromToday(45),
  },
  {
    id: "D-106",
    constituentId: 17,
    name: "Insurance Card",
    expirationDate: daysFromToday(10),
  },
  {
    id: "D-107",
    constituentId: 12,
    name: "Immunization Records",
    expirationDate: daysFromToday(3),
  },
  {
    id: "D-108",
    constituentId: 20,
    name: "Court Order",
    expirationDate: daysFromToday(90),
  },
  {
    id: "D-109",
    constituentId: 25,
    name: "Photo ID",
    expirationDate: daysFromToday(21),
  },
];

function programNameFor(constituentId: number): string {
  const e = SEED_ENROLLMENTS.find(
    (x) => x.constituentId === constituentId,
  );
  return (e && getProgramById(e.programId)?.name) ?? "";
}

const SEED_INCIDENT_REPORTS: IncidentReportRecord[] = [
  // Historical records (previously local to IncidentReports.tsx)
  {
    id: 1,
    constituentIds: [1],
    youthInvolved: "Johnson, Emily",
    incidentStartDateTime: "2025-04-15T14:30:00",
    program: "Mahoney House",
    staffInvolved: "John Smith, Sarah Johnson",
    status: "In Progress",
    isFinalized: false,
  },
  {
    id: 2,
    constituentIds: [2],
    youthInvolved: "Rodriguez, Michael",
    incidentStartDateTime: "2025-04-14T09:15:00",
    program: "Rydell House",
    staffInvolved: "Emily Davis",
    status: "Finalized",
    isFinalized: true,
  },
  {
    id: 3,
    constituentIds: [8, 12],
    youthInvolved: "Anderson, Robert, Lee, Patricia",
    incidentStartDateTime: "2025-04-13T16:45:00",
    program: "Mahoney House",
    staffInvolved: "Michael Brown, John Smith",
    status: "Not Started",
    isFinalized: false,
  },
  {
    id: 4,
    constituentIds: [12],
    youthInvolved: "Lee, Patricia",
    incidentStartDateTime: "2025-04-12T11:00:00",
    program: "Walsh Campus",
    staffInvolved: "Sarah Johnson",
    status: "In Progress",
    isFinalized: false,
  },
  {
    id: 5,
    constituentIds: [],
    youthInvolved: "Monster, Cookie, Bird, Big",
    incidentStartDateTime: "2025-04-11T13:20:00",
    program: "Mahoney House",
    staffInvolved: "Emily Davis, Michael Brown",
    status: "Finalized",
    isFinalized: true,
  },
  {
    id: 6,
    constituentIds: [],
    youthInvolved: "Bird, Big",
    incidentStartDateTime: "2025-04-10T08:50:00",
    program: "Rydell House",
    staffInvolved: "John Smith",
    status: "In Progress",
    isFinalized: false,
  },
  // Recent records
  {
    id: 7,
    constituentIds: [1],
    youthInvolved: "Johnson, Emily",
    incidentStartDateTime: dateTimeDaysAgo(2, "19:40"),
    program: programNameFor(1),
    staffInvolved: "Sarah Johnson",
    status: "In Progress",
    isFinalized: false,
  },
  {
    id: 8,
    constituentIds: [2, 8],
    youthInvolved: "Rodriguez, Michael, Anderson, Robert",
    incidentStartDateTime: dateTimeDaysAgo(9, "15:10"),
    program: programNameFor(2),
    staffInvolved: "John Smith",
    status: "Not Started",
    isFinalized: false,
  },
  {
    id: 9,
    constituentIds: [8],
    youthInvolved: "Anderson, Robert",
    incidentStartDateTime: dateTimeDaysAgo(12, "08:25"),
    program: programNameFor(8),
    staffInvolved: "Emily Davis",
    status: "Finalized",
    isFinalized: true,
  },
  {
    id: 10,
    constituentIds: [2],
    youthInvolved: "Rodriguez, Michael",
    incidentStartDateTime: dateTimeDaysAgo(41, "13:00"),
    program: programNameFor(2),
    staffInvolved: "Michael Brown",
    status: "In Progress",
    isFinalized: false,
  },
  {
    id: 11,
    constituentIds: [12],
    youthInvolved: "Lee, Patricia",
    incidentStartDateTime: dateTimeDaysAgo(5, "21:15"),
    program: programNameFor(12),
    staffInvolved: "Sarah Johnson",
    status: "In Progress",
    isFinalized: false,
  },
  {
    id: 12,
    constituentIds: [25],
    youthInvolved: "Clark, Rachel",
    incidentStartDateTime: dateTimeDaysAgo(20, "10:30"),
    program: programNameFor(25),
    staffInvolved: "Emily Davis",
    status: "Not Started",
    isFinalized: false,
  },
  // Inactive youth (Kevin Martinez left Program 1) — must not reach Program 1's page.
  {
    id: 13,
    constituentIds: [17],
    youthInvolved: "Martinez, Kevin",
    incidentStartDateTime: dateTimeDaysAgo(1, "17:20"),
    program: programNameFor(17),
    staffInvolved: "John Smith",
    status: "In Progress",
    isFinalized: false,
  },
];

// ─── Module-level store ─────────────────────────────────────────────────────

let enrollments = [...SEED_ENROLLMENTS];
let documents = [...SEED_DOCUMENTS];
let incidentReports = [...SEED_INCIDENT_REPORTS];

export function getYouthProgramEnrollments(): YouthProgramEnrollment[] {
  return enrollments;
}
export function setYouthProgramEnrollmentsData(
  next: YouthProgramEnrollment[],
): void {
  enrollments = next;
  enrollmentListeners.forEach((l) => l());
}

// Enrollment changes are observable so views that depend on a
// Constituent's current Program (e.g. the Constituent Pass tab) re-resolve
// immediately instead of polling or caching a second copy.
const enrollmentListeners = new Set<() => void>();
export function subscribeYouthProgramEnrollments(
  l: () => void,
): () => void {
  enrollmentListeners.add(l);
  return () => {
    enrollmentListeners.delete(l);
  };
}
export function getYouthDocuments(): YouthDocument[] {
  return documents;
}
export function setYouthDocumentsData(
  next: YouthDocument[],
): void {
  documents = next;
}
export function getIncidentReports(): IncidentReportRecord[] {
  return incidentReports;
}
export function setIncidentReportsData(
  next: IncidentReportRecord[],
): void {
  incidentReports = next;
  incidentReportListeners.forEach((l) => l());
}
// Observable so a profile's Incidents list reflects a save immediately.
const incidentReportListeners = new Set<() => void>();
export function subscribeIncidentReports(
  l: () => void,
): () => void {
  incidentReportListeners.add(l);
  return () => {
    incidentReportListeners.delete(l);
  };
}

// ─── Program-scoped queries ─────────────────────────────────────────────────

/** Effective Active Youth: an Individual constituent with Role "Youth"
 *  that is Active (same effective status the Constituents List uses). */
export function isActiveYouthConstituent(
  c: Constituent,
): boolean {
  return (
    c.type === "Individual" &&
    c.role === "Youth" &&
    c.status === "Active" &&
    getConstituentStatus(c) === "Active"
  );
}

export function getConstituentById(
  constituentId: number,
): Constituent | undefined {
  return CONSTITUENTS.find((c) => c.id === constituentId);
}

/** Program → active Enrollments → Constituents that are Active Youth,
 *  name-sorted. Name comes straight from CONSTITUENTS. */
export function getActiveYouthForProgram(
  programId: number,
): ActiveYouth[] {
  return getYouthProgramEnrollments()
    .filter((e) => e.programId === programId && e.active)
    .flatMap((e) => {
      const c = getConstituentById(e.constituentId);
      return c && isActiveYouthConstituent(c)
        ? [{ constituentId: c.id, name: c.name }]
        : [];
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function activeYouthIds(programId: number): Set<number> {
  return new Set(
    getActiveYouthForProgram(programId).map(
      (y) => y.constituentId,
    ),
  );
}

/** Pass youth ids (Constituent ID as string) currently active in the
 *  Program — the same membership as getActiveYouthForProgram. */
export function getActivePassYouthIds(
  programId: number,
): Set<string> {
  return new Set([...activeYouthIds(programId)].map(String));
}

/** Display names for a record's youth, resolved from CONSTITUENTS. */
export function getYouthNames(
  constituentIds: number[],
): string {
  return constituentIds
    .map((id) => getConstituentById(id)?.name ?? "")
    .filter(Boolean)
    .join(", ");
}

export interface ExpiringDocumentRow {
  document: YouthDocument;
  youth: ActiveYouth;
}

/** Program → active Youth → Documents expiring today through today + 30 days,
 *  soonest first. */
export function getExpiringDocumentsForProgram(
  programId: number,
): ExpiringDocumentRow[] {
  const youth = getActiveYouthForProgram(programId);
  const from = daysFromToday(0);
  const to = daysFromToday(30);
  return getYouthDocuments()
    .filter(
      (d) => d.expirationDate >= from && d.expirationDate <= to,
    )
    .flatMap((d) => {
      const y = youth.find(
        (x) => x.constituentId === d.constituentId,
      );
      return y ? [{ document: d, youth: y }] : [];
    })
    .sort((a, b) =>
      a.document.expirationDate.localeCompare(
        b.document.expirationDate,
      ),
    );
}

/** Program → active Youth → every Incident Report (finalized or not) started
 *  in the last `days` days. Drives the Program Record header metric. */
export function getRecentIncidentsForProgram(
  programId: number,
  days: number,
): IncidentReportRecord[] {
  const youthIds = activeYouthIds(programId);
  const from = `${daysFromToday(-days)}T00:00:00`;
  return getIncidentReports().filter(
    (r) =>
      r.incidentStartDateTime >= from &&
      r.constituentIds.some((id) => youthIds.has(id)),
  );
}

/** Program → active Youth → Incident Reports started in the last 30 days that
 *  are not finalized, newest first. */
export function getUnfinalizedIncidentsForProgram(
  programId: number,
): IncidentReportRecord[] {
  const youthIds = activeYouthIds(programId);
  const from = `${daysFromToday(-30)}T00:00:00`;
  return getIncidentReports()
    .filter(
      (r) =>
        r.status !== FINALIZED_STATUS &&
        r.incidentStartDateTime >= from &&
        r.constituentIds.some((id) => youthIds.has(id)),
    )
    .sort((a, b) =>
      b.incidentStartDateTime.localeCompare(
        a.incidentStartDateTime,
      ),
    );
}
// ─── Connections, ITPs, Med Errors (Program Record dashboard) ──────────────
// Program-scoped records for the remaining Program Record dashboard cards.
// Same Program → Youth linkage and module-store convention as above.

export interface ConnectionRecord {
  id: number;
  constituentIds: number[];
  /** ISO local date-time "YYYY-MM-DDTHH:MM:SS" */
  startDateTime: string;
  /** Business source of truth — "Finalized" once finalized. */
  status: string;
  /** Kept for compatibility; mirrors Status. */
  isFinalized: boolean;
  connectionType: string;
  staff: string;
  notes: string;
}

export interface ItpRecord {
  id: number;
  constituentId: number;
  /** ISO "YYYY-MM-DD" the ITP is due */
  itpDate: string;
  /** ISO "YYYY-MM-DD" the ITP was started ("" if not started) */
  startedDate: string;
  /** Business source of truth — "Finalized" once finalized. */
  status: string;
  /** Kept for compatibility; mirrors Status. */
  isFinalized: boolean;
  /** The existing ITP workspace record (/itp-module/:id) for this ITP. */
  itpWorkspaceId: number;
}

/** A Med Documentation Review record (Assigned Med Errors, 19991). Status
 *  moves Assigned → Fixed once the documentation error is corrected. */
export interface MedErrorRecord {
  id: number;
  constituentIds: number[];
  /** ISO local date-time "YYYY-MM-DDTHH:MM:SS" the review was started */
  startedDateTime: string;
  /** "Assigned" | "Fixed" — business source of truth */
  status: string;
  medication: string;
  assignedTo: string;
  details: string;
}

export const MED_ERROR_ASSIGNED_STATUS = "Assigned";
export const MED_ERROR_FIXED_STATUS = "Fixed";

/** A scheduled medication pass with no administration documented (Program
 *  Record header metric, 19990). */
export interface MissingMedDocumentationRecord {
  id: number;
  constituentId: number;
  medication: string;
  /** ISO local date-time "YYYY-MM-DDTHH:MM:SS" the dose was scheduled */
  scheduledDateTime: string;
  /** "Missing" until documented, then "Documented". */
  status: string;
}

export interface SubstanceTestRecord {
  id: number;
  constituentId: number;
  /** ISO "YYYY-MM-DD" */
  testDate: string;
  testType: string;
  result: string;
  status: string;
}

const SEED_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 201,
    constituentIds: [12],
    startDateTime: dateTimeDaysAgo(4, "18:00"),
    status: "In Progress",
    isFinalized: false,
    connectionType: "Family Visit",
    staff: "Sarah Johnson",
    notes: "Visit with mother; follow-up notes pending.",
  },
  {
    id: 202,
    constituentIds: [20],
    startDateTime: dateTimeDaysAgo(15, "11:30"),
    status: FINALIZED_STATUS,
    isFinalized: true,
    connectionType: "Phone Call",
    staff: "Emily Davis",
    notes: "Call with guardian completed.",
  },
  {
    id: 203,
    constituentIds: [1],
    startDateTime: dateTimeDaysAgo(8, "16:45"),
    status: "Not Started",
    isFinalized: false,
    connectionType: "Mentor Meeting",
    staff: "John Smith",
    notes: "",
  },
  {
    id: 204,
    constituentIds: [25],
    startDateTime: dateTimeDaysAgo(45, "09:00"),
    status: "In Progress",
    isFinalized: false,
    connectionType: "Family Visit",
    staff: "Michael Brown",
    notes: "",
  },
  {
    id: 205,
    constituentIds: [17],
    startDateTime: dateTimeDaysAgo(3, "14:00"),
    status: "In Progress",
    isFinalized: false,
    connectionType: "Phone Call",
    staff: "Sarah Johnson",
    notes:
      "Youth (Kevin Martinez) no longer active in the Program — must not appear.",
  },
];

const SEED_ITPS: ItpRecord[] = [
  {
    id: 301,
    constituentId: 12,
    itpDate: daysFromToday(9),
    startedDate: daysFromToday(-5),
    status: "In Progress",
    isFinalized: false,
    itpWorkspaceId: 4,
  },
  {
    id: 302,
    constituentId: 20,
    itpDate: daysFromToday(-3),
    startedDate: daysFromToday(-20),
    status: FINALIZED_STATUS,
    isFinalized: true,
    itpWorkspaceId: 4,
  },
  {
    id: 303,
    constituentId: 2,
    itpDate: daysFromToday(14),
    startedDate: "",
    status: "Not Started",
    isFinalized: false,
    itpWorkspaceId: 2,
  },
  {
    id: 304,
    constituentId: 1,
    itpDate: daysFromToday(-60),
    startedDate: daysFromToday(-90),
    status: "In Progress",
    isFinalized: false,
    itpWorkspaceId: 1,
  },
];

const SEED_MED_ERRORS: MedErrorRecord[] = [
  {
    id: 401,
    constituentIds: [12],
    startedDateTime: dateTimeDaysAgo(6, "21:15"),
    status: MED_ERROR_ASSIGNED_STATUS,
    medication: "Sertraline 50mg",
    assignedTo: "Sarah Johnson",
    details: "Evening dose initials missing on MAR.",
  },
  {
    id: 402,
    constituentIds: [8],
    startedDateTime: dateTimeDaysAgo(3, "08:05"),
    status: MED_ERROR_ASSIGNED_STATUS,
    medication: "Methylphenidate 10mg",
    assignedTo: "Maria Santos",
    details: "Administration time not recorded.",
  },
  {
    id: 403,
    constituentIds: [20],
    startedDateTime: dateTimeDaysAgo(20, "12:40"),
    status: MED_ERROR_FIXED_STATUS,
    medication: "Cetirizine 10mg",
    assignedTo: "James Carter",
    details: "Corrected count entry.",
  },
  {
    id: 404,
    constituentIds: [2],
    startedDateTime: dateTimeDaysAgo(11, "07:30"),
    status: MED_ERROR_FIXED_STATUS,
    medication: "Melatonin 3mg",
    assignedTo: "Linda Okafor",
    details: "Signature added.",
  },
  {
    id: 405,
    constituentIds: [17],
    startedDateTime: dateTimeDaysAgo(2, "20:00"),
    status: MED_ERROR_ASSIGNED_STATUS,
    medication: "Ibuprofen 200mg",
    assignedTo: "Sarah Johnson",
    details:
      "Youth (Kevin Martinez) no longer active in the Program — must not appear.",
  },
];

const SEED_MISSING_MED_DOCS: MissingMedDocumentationRecord[] = [
  {
    id: 501,
    constituentId: 1,
    medication: "Fluoxetine 20mg",
    scheduledDateTime: dateTimeDaysAgo(1, "08:00"),
    status: "Missing",
  },
  {
    id: 502,
    constituentId: 8,
    medication: "Methylphenidate 10mg",
    scheduledDateTime: dateTimeDaysAgo(2, "12:00"),
    status: "Missing",
  },
  {
    id: 503,
    constituentId: 8,
    medication: "Melatonin 3mg",
    scheduledDateTime: dateTimeDaysAgo(2, "21:00"),
    status: "Documented",
  },
  {
    id: 504,
    constituentId: 12,
    medication: "Sertraline 50mg",
    scheduledDateTime: dateTimeDaysAgo(1, "20:00"),
    status: "Missing",
  },
  {
    id: 505,
    constituentId: 17,
    medication: "Ibuprofen 200mg",
    scheduledDateTime: dateTimeDaysAgo(1, "09:00"),
    status: "Missing",
  },
];

const SEED_SUBSTANCE_TESTS: SubstanceTestRecord[] = [
  {
    id: 601,
    constituentId: 2,
    testDate: daysFromToday(-4),
    testType: "Urinalysis",
    result: "Negative",
    status: "Completed",
  },
  {
    id: 602,
    constituentId: 12,
    testDate: daysFromToday(-1),
    testType: "Urinalysis",
    result: "Pending",
    status: "Sent to Lab",
  },
  {
    id: 603,
    constituentId: 25,
    testDate: daysFromToday(-7),
    testType: "Breathalyzer",
    result: "Negative",
    status: "Completed",
  },
];

let connections = [...SEED_CONNECTIONS];
let itps = [...SEED_ITPS];
let medErrors = [...SEED_MED_ERRORS];
let missingMedDocs = [...SEED_MISSING_MED_DOCS];
let substanceTests = [...SEED_SUBSTANCE_TESTS];

export function getConnections(): ConnectionRecord[] {
  return connections;
}
export function setConnectionsData(
  next: ConnectionRecord[],
): void {
  connections = next;
}
export function getItps(): ItpRecord[] {
  return itps;
}
export function setItpsData(next: ItpRecord[]): void {
  itps = next;
}
export function getMedErrors(): MedErrorRecord[] {
  return medErrors;
}
export function setMedErrorsData(next: MedErrorRecord[]): void {
  medErrors = next;
}
export function getMissingMedDocumentation(): MissingMedDocumentationRecord[] {
  return missingMedDocs;
}
export function setMissingMedDocumentationData(
  next: MissingMedDocumentationRecord[],
): void {
  missingMedDocs = next;
}
export function getSubstanceTests(): SubstanceTestRecord[] {
  return substanceTests;
}
export function setSubstanceTestsData(
  next: SubstanceTestRecord[],
): void {
  substanceTests = next;
}

/** Program → active Youth → Connections started in the last 30 days whose
 *  Status is not Finalized, newest first. */
export function getUnfinalizedConnectionsForProgram(
  programId: number,
): ConnectionRecord[] {
  const youthIds = activeYouthIds(programId);
  const from = `${daysFromToday(-30)}T00:00:00`;
  return getConnections()
    .filter(
      (c) =>
        c.status !== FINALIZED_STATUS &&
        c.startDateTime >= from &&
        c.constituentIds.some((id) => youthIds.has(id)),
    )
    .sort((a, b) =>
      b.startDateTime.localeCompare(a.startDateTime),
    );
}

/** Program → active Youth → ITPs whose Status is not Finalized (no date
 *  window), soonest due first. */
export function getUnfinalizedItpsForProgram(
  programId: number,
): ItpRecord[] {
  const youthIds = activeYouthIds(programId);
  return getItps()
    .filter(
      (i) =>
        i.status !== FINALIZED_STATUS &&
        youthIds.has(i.constituentId),
    )
    .sort((a, b) => a.itpDate.localeCompare(b.itpDate));
}

/** Program → active Youth → Med Documentation Review records with Status
 *  "Assigned" (drops out once Fixed), newest first. */
export function getAssignedMedErrorsForProgram(
  programId: number,
): MedErrorRecord[] {
  const youthIds = activeYouthIds(programId);
  return getMedErrors()
    .filter(
      (m) =>
        m.status === MED_ERROR_ASSIGNED_STATUS &&
        m.constituentIds.some((id) => youthIds.has(id)),
    )
    .sort((a, b) =>
      b.startedDateTime.localeCompare(a.startedDateTime),
    );
}

/** Program → active Youth → doses still missing documentation, newest
 *  first. Drives the Program Record header metric. */
export function getMissingMedDocumentationForProgram(
  programId: number,
): MissingMedDocumentationRecord[] {
  const youthIds = activeYouthIds(programId);
  return getMissingMedDocumentation()
    .filter(
      (m) =>
        m.status === "Missing" && youthIds.has(m.constituentId),
    )
    .sort((a, b) =>
      b.scheduledDateTime.localeCompare(a.scheduledDateTime),
    );
}

/** Program → active Youth → Substance Tests, newest first. */
export function getSubstanceTestsForProgram(
  programId: number,
): SubstanceTestRecord[] {
  const youthIds = activeYouthIds(programId);
  return getSubstanceTests()
    .filter((t) => youthIds.has(t.constituentId))
    .sort((a, b) => b.testDate.localeCompare(a.testDate));
}

// ─── Youth relationships & addresses (Pass support, 19998) ─────────────────
// PROTOTYPE SUPPORT DATA. The app has no shared, youth-keyed relationship or
// address store: Relationships (admissions/RelationshipsSection.tsx) keeps
// its rows — including the existing `eligibleForPass` flag — in local
// component state with no youth id and no addresses. This is the smallest
// youth-keyed equivalent the Pass form needs ("Who will the youth be staying
// with?" / "Where will the youth be staying?"), reusing that same
// `eligibleForPass` concept. Replace with the real relationship source when
// one exists.

export interface ContactAddress {
  id: string;
  /** e.g. "Home" */
  label: string;
  /** Single-line display, e.g. "1418 W Elm St, Chicago, IL 60622" */
  line: string;
}

export interface YouthRelationship {
  /** Related constituent's id */
  constituentId: string;
  /** The youth's Constituent ID, as a string (Pass youthId convention). */
  youthId: string;
  firstName: string;
  lastName: string;
  relationship: string;
  active: boolean;
  eligibleForPass: boolean;
  /** "(xxx) xxx-xxxx" */
  primaryPhone: string;
  addresses: ContactAddress[];
}

const SEED_YOUTH_ADDRESSES: Record<string, ContactAddress[]> = {
  "1": [
    {
      id: "ya-1",
      label: "Home",
      line: "2214 N Clark St, Chicago, IL 60614",
    },
  ],
  "2": [
    {
      id: "ya-2",
      label: "Home",
      line: "88 Swamp Rd, Evanston, IL 60201",
    },
  ],
  "8": [
    {
      id: "ya-3",
      label: "Home",
      line: "5 Rock Ln, Oak Park, IL 60302",
    },
  ],
  "12": [
    {
      id: "ya-4a",
      label: "Home",
      line: "1418 W Elm St, Chicago, IL 60622",
    },
    {
      id: "ya-4b",
      label: "Aunt's Home",
      line: "3901 S Halsted St, Chicago, IL 60609",
    },
  ],
  "20": [
    {
      id: "ya-5",
      label: "Home",
      line: "740 W Lake St, Chicago, IL 60661",
    },
  ],
  "25": [
    {
      id: "ya-6",
      label: "Home",
      line: "16 Drum Ct, Cicero, IL 60804",
    },
  ],
};

const SEED_YOUTH_RELATIONSHIPS: YouthRelationship[] = [
  {
    constituentId: "rel-101",
    youthId: "1",
    firstName: "Emily",
    lastName: "Bear",
    relationship: "Mother",
    active: true,
    eligibleForPass: true,
    primaryPhone: "(312) 555-0141",
    addresses: [
      {
        id: "ra-101",
        label: "Home",
        line: "2214 N Clark St, Chicago, IL 60614",
      },
    ],
  },
  {
    constituentId: "rel-102",
    youthId: "1",
    firstName: "Gus",
    lastName: "Bear",
    relationship: "Uncle",
    active: true,
    eligibleForPass: false,
    primaryPhone: "(312) 555-0177",
    addresses: [
      {
        id: "ra-102",
        label: "Home",
        line: "910 W Fullerton Ave, Chicago, IL 60614",
      },
    ],
  },
  {
    constituentId: "rel-201",
    youthId: "2",
    firstName: "Robin",
    lastName: "Frog",
    relationship: "Grandparent",
    active: true,
    eligibleForPass: true,
    primaryPhone: "(847) 555-0102",
    addresses: [
      {
        id: "ra-201",
        label: "Home",
        line: "12 Lily Pad Ct, Skokie, IL 60076",
      },
    ],
  },
  {
    constituentId: "rel-301",
    youthId: "8",
    firstName: "Gobo",
    lastName: "Fraggle",
    relationship: "Brother",
    active: true,
    eligibleForPass: true,
    primaryPhone: "(708) 555-0133",
    addresses: [],
  },
  {
    constituentId: "rel-401",
    youthId: "12",
    firstName: "Linda",
    lastName: "Piggy",
    relationship: "Mother",
    active: true,
    eligibleForPass: true,
    primaryPhone: "(773) 555-0198",
    addresses: [
      {
        id: "ra-401",
        label: "Home",
        line: "1418 W Elm St, Chicago, IL 60622",
      },
    ],
  },
  {
    constituentId: "rel-402",
    youthId: "12",
    firstName: "Hank",
    lastName: "Piggy",
    relationship: "Grandparent",
    active: true,
    eligibleForPass: true,
    primaryPhone: "(630) 555-0164",
    addresses: [
      {
        id: "ra-402",
        label: "Home",
        line: "77 Farm Rd, Naperville, IL 60540",
      },
    ],
  },
  {
    constituentId: "rel-403",
    youthId: "12",
    firstName: "Dana",
    lastName: "Moss",
    relationship: "Former Foster Parent",
    active: false,
    eligibleForPass: true,
    primaryPhone: "(773) 555-0120",
    addresses: [
      {
        id: "ra-403",
        label: "Home",
        line: "450 E 47th St, Chicago, IL 60653",
      },
    ],
  },
  {
    constituentId: "rel-404",
    youthId: "12",
    firstName: "Sam",
    lastName: "Eagle",
    relationship: "Mentor",
    active: true,
    eligibleForPass: false,
    primaryPhone: "(312) 555-0110",
    addresses: [
      {
        id: "ra-404",
        label: "Office",
        line: "1 Eagle Plaza, Chicago, IL 60601",
      },
    ],
  },
  {
    constituentId: "rel-501",
    youthId: "20",
    firstName: "Camilla",
    lastName: "Chicken",
    relationship: "Guardian",
    active: true,
    eligibleForPass: true,
    primaryPhone: "(312) 555-0187",
    addresses: [
      {
        id: "ra-501",
        label: "Home",
        line: "2 Coop Ln, Chicago, IL 60607",
      },
    ],
  },
  {
    constituentId: "rel-601",
    youthId: "25",
    firstName: "Floyd",
    lastName: "Pepper",
    relationship: "Uncle",
    active: true,
    eligibleForPass: true,
    primaryPhone: "(708) 555-0155",
    addresses: [
      {
        id: "ra-601",
        label: "Home",
        line: "33 Bass St, Cicero, IL 60804",
      },
    ],
  },
  {
    constituentId: "rel-701",
    youthId: "25",
    firstName: "Skeeter",
    lastName: "Henson",
    relationship: "Sister",
    active: true,
    eligibleForPass: true,
    primaryPhone: "(708) 555-0119",
    addresses: [
      {
        id: "ra-701",
        label: "Home",
        line: "301 Stage Dr, Berwyn, IL 60402",
      },
    ],
  },
  // Parents of the youth the Connection form is demonstrated with
  // (CONNECTION_FORM_YOUTH below) — used by FPM auto-participants.
  {
    constituentId: "rel-801",
    youthId: "aarete-test",
    firstName: "Laura",
    lastName: "Test",
    relationship: "Mother",
    active: true,
    eligibleForPass: true,
    primaryPhone: "(312) 555-0172",
    addresses: [],
  },
  {
    constituentId: "rel-802",
    youthId: "aarete-test",
    firstName: "Daniel",
    lastName: "Test",
    relationship: "Father",
    active: true,
    eligibleForPass: false,
    primaryPhone: "(312) 555-0173",
    addresses: [],
  },
];

/** The youth the Connection form is opened for. The prototype has no youth
 *  context prop, and this youth is not in CONSTITUENTS, so it is keyed by a
 *  stable string id like other `youthId` values. */
export const CONNECTION_FORM_YOUTH = {
  id: "aarete-test",
  name: "Aarete Test",
};

let youthAddresses = { ...SEED_YOUTH_ADDRESSES };
let youthRelationships = [...SEED_YOUTH_RELATIONSHIPS];

export function getYouthAddresses(
  youthId: string,
): ContactAddress[] {
  return youthAddresses[youthId] ?? [];
}
export function setYouthAddressesData(
  next: Record<string, ContactAddress[]>,
): void {
  youthAddresses = next;
}
export function getYouthRelationships(): YouthRelationship[] {
  return youthRelationships;
}
export function setYouthRelationshipsData(
  next: YouthRelationship[],
): void {
  youthRelationships = next;
}

/** "Who will the youth be staying with?" options: ACTIVE relationships of
 *  this youth that are marked Eligible for Pass. */
export function getPassEligibleRelationships(
  youthId: string,
): YouthRelationship[] {
  return youthRelationships.filter(
    (r) =>
      r.youthId === youthId && r.active && r.eligibleForPass,
  );
}

/** Relationship values (from the Relationships "Relationship" picklist) that
 *  make a related constituent a Parent/Guardian of the youth. */
const PARENT_GUARDIAN_RELATIONSHIPS = [
  "Mother",
  "Father",
  "Adoptive Mother",
  "Adoptive Father",
  "Guardian",
];

/** ACTIVE relationships of this youth that are a parent or guardian. */
export function getParentGuardianRelationships(
  youthId: string,
): YouthRelationship[] {
  return youthRelationships.filter(
    (r) =>
      r.youthId === youthId &&
      r.active &&
      PARENT_GUARDIAN_RELATIONSHIPS.includes(r.relationship),
  );
}

// ─── Pass helpers ───────────────────────────────────────────────────────────
// Pass records key their youth by `youthId` — the youth's Constituent ID as a
// string. Names always resolve from CONSTITUENTS.

/** A youth option for the Pass module: Constituent ID (as string) + NAME. */
export interface PassYouth {
  youthId: string;
  youthName: string;
}

/** Every distinct Active Youth with an active enrollment, name-sorted. */
export function getActiveYouth(): PassYouth[] {
  const seen = new Set<number>();
  return getYouthProgramEnrollments()
    .filter(
      (e) =>
        e.active &&
        !seen.has(e.constituentId) &&
        seen.add(e.constituentId),
    )
    .flatMap((e) => {
      const c = getConstituentById(e.constituentId);
      return c && isActiveYouthConstituent(c)
        ? [{ youthId: String(c.id), youthName: c.name }]
        : [];
    })
    .sort((a, b) => a.youthName.localeCompare(b.youthName));
}

/** The youth's current Program — their active enrollment, if any. */
export function getCurrentProgramIdForYouth(
  youthId: string,
): number | null {
  return (
    getYouthProgramEnrollments().find(
      (e) => String(e.constituentId) === youthId && e.active,
    )?.programId ?? null
  );
}

/** Constituent NAME for a youthId (active or not) — e.g. for a historical
 *  Pass whose youth has since left the Program. */
export function getYouthName(youthId: string): string {
  return getConstituentById(Number(youthId))?.name ?? "";
}

// Program Log (programLogData.ts YOUTH_STATUS) still lists its own display
// names. Until it is migrated to Constituents, this bridge maps those rows to
// the Constituent they represent so Pass ↔ Youth Current Location (20043)
// stays linked. Identity and NAME still come from CONSTITUENTS.
const PROGRAM_LOG_NAME_TO_CONSTITUENT: Record<string, number> =
  {
    "Fozzie Bear": 1,
    "Kermit the Frog": 2,
    "Red Fraggle": 8,
    "Miss Piggy": 12,
    "Gonzo the Great": 20,
    Animal: 25,
  };

/** Resolves the Pass youthId (Constituent ID) from a display name — a
 *  Constituent NAME, or a Program Log row name via the bridge above. */
export function findYouthIdByName(name: string): string | null {
  const c = CONSTITUENTS.find(
    (x) => x.role === "Youth" && x.name === name,
  );
  if (c) return String(c.id);
  const bridged = PROGRAM_LOG_NAME_TO_CONSTITUENT[name];
  return bridged !== undefined ? String(bridged) : null;
}