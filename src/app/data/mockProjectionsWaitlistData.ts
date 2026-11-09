// Mock data layer for Staffing: Youth Projections & Waitlist (US 17573).
//
// Models the Salesforce records the feature will eventually read, so the UI
// can later be pointed at real data without being rewritten:
//
//   Program Enrollment (actual residents)      -> PROGRAM_ENROLLMENTS
//   Admissions / Waitlist (prospective youth)  -> ALL_LEADS + WAITLIST_DETAILS
//   Connections (Clinical/Shadow/Staffing)     -> WAITLIST_CONNECTIONS
//   Residential homes + capacity               -> RESIDENTIAL_HOMES (+ the
//                                                 Capacity Snapshots already
//                                                 owned by mockProgramsData)
//
// Staff never type youth into Bed Projections — every projected youth comes
// from an enrollment or from a waitlist candidate's Anticipated Program +
// Anticipated Move-In Date. Staff edits (projection code overrides, notes,
// waitlist changes) live in the module-level store at the bottom, the same
// convention mockProgramsData.ts uses so edits survive route changes.
//
// All seed dates are relative to today so the prototype never goes stale.

import { ALL_LEADS, type Lead } from "./mockLeadsData";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Campus = "West Loop" | "Walsh";

/** Monthly occupancy code. Staff-managed (Admissions Team only): nothing
 *  derives or overwrites these from program activity or planning fields. */
export type ProjectionCode = "S" | "LV" | "T" | "X" | "?";

export type WaitlistCategory =
  | "Referral"
  | "Info Session Scheduled"
  | "Program Waitlist"
  | "Delayed"
  | "Closed";

export type AgeGroup =
  "Middle School" | "High School" | "Young Adult";

export type PriorityRank = "High" | "Medium" | "Low";

export type YouthType = "External" | "Readmit";

/** Resident status in Bed Projections. Transitioning = an internal move
 *  is being planned (Anticipated Program + Move-In Date). */
export type ResidentStatus = "Active" | "Transitioning";

export type DelayReason =
  | "Legal / Guardianship Documentation"
  | "Medical / TB Clearance Hold"
  | "School / IEP / Transportation Transition"
  | "Family Request"
  | "No Bed Available";

export interface ResidentialHome {
  id: string;
  name: string;
  campus: Campus;
  /** Links to a ProgramRecord in mockProgramsData when one exists, so
   *  capacity resolves from that program's Capacity Snapshot history. */
  programId?: number;
  /** Used only when the home has no linked Program/Capacity Snapshot yet. */
  defaultCapacity: number;
}

/** Mirrors the Program Enrollment shape used by ProgramEnrolmentSection. */
export interface ProgramEnrollment {
  id: string;
  youthName: string;
  dateOfBirth: string; // ISO
  homeId: string;
  actualMoveInDate: string; // ISO
  actualMoveOutDate?: string; // ISO — set once the youth has left
  /** Planned Agency Discharge date. Seed only: used once to seed the
   *  prototype's initial LV code (see seedResidentCode) — never re-read to
   *  overwrite a staff-entered code. */
  anticipatedMoveOutDate?: string; // ISO
  /** Seed only: plans were unsure starting this month (initial "?"). */
  plansUnsureFrom?: string; // ISO
  /** Admissions lead this enrollment came from (removes them from the
   *  active waitlist — see getActiveWaitlist). */
  leadId?: string;
  /** Explicit link to the resident's Youth Constituent ID, when known.
   *  Never inferred from the name. */
  constituentId?: number;
}

export interface FieldHistoryEntry {
  id: string;
  field:
    | "Category"
    | "Delay Reason"
    | "Status"
    | "Anticipated Program"
    | "Anticipated Move-In Date";
  oldValue: string;
  newValue: string;
  /** Required when an existing projection is changed or cancelled. */
  comment?: string;
  changedBy: string;
  changedAt: string; // ISO timestamp
}

/** Waitlist-specific planning fields layered on an Admissions lead. */
export interface WaitlistCandidate {
  id: string;
  name: string;
  dateOfBirth: string; // ISO
  ageGroup: AgeGroup;
  youthType: YouthType;
  category: WaitlistCategory;
  /** When the youth entered the current Category (drives Days in Category). */
  categoryEnteredAt: string; // ISO
  /** Seed/legacy closure date. The closure lifecycle itself (Closing List,
   *  Eligible for Archive, finalized Closed) lives in caseClosureStore. */
  closedAt?: string; // ISO
  caseManager: string;
  referralDate: string; // ISO
  infoSessionDate?: string; // ISO — from the lead's Info Session record
  checkInDate?: string; // ISO
  anticipatedProgram?: string; // ResidentialHome.id
  anticipatedMoveInDate?: string; // ISO
  grade: string;
  guardianshipDetails: string;
  medicalNotes: string;
  priorityRank?: PriorityRank;
  nextReviewDate?: string; // ISO
  delayReason?: DelayReason;
  comments: string;
  isInternalTransfer?: boolean;
  history: FieldHistoryEntry[];
}

export type WaitlistConnectionType =
  | "Admissions Clinical Assessment"
  | "Admissions Shadow"
  | "Staffing Meeting";

/** Planning fields for a current resident (opened from the resident's name
 *  in Bed Projections). Keyed by ProgramEnrollment.id. */
export interface ResidentPlan {
  status: ResidentStatus;
  anticipatedProgram?: string; // ResidentialHome.id
  anticipatedMoveInDate?: string; // ISO
  history: FieldHistoryEntry[];
}

export const YOUTH_TYPES: YouthType[] = ["External", "Readmit"];
export const RESIDENT_STATUSES: ResidentStatus[] = [
  "Active",
  "Transitioning",
];

export interface WaitlistConnection {
  id: string;
  youthId: string;
  type: WaitlistConnectionType;
  startDate: string; // ISO
  status: "Scheduled" | "Completed" | "Cancelled";
}

export interface ProjectionNote {
  text: string;
  updatedBy: string;
  updatedAt: string; // ISO timestamp
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const CAMPUSES: Campus[] = ["West Loop", "Walsh"];

export const PROJECTION_CODES: {
  code: ProjectionCode;
  label: string;
}[] = [
  { code: "S", label: "Stay in Program" },
  { code: "LV", label: "Agency Discharge" },
  { code: "T", label: "Internal Transition" },
  { code: "X", label: "Open Bed" },
  { code: "?", label: "Unsure of Plans" },
];

export const WAITLIST_CATEGORIES: WaitlistCategory[] = [
  "Referral",
  "Info Session Scheduled",
  "Program Waitlist",
  "Delayed",
  "Closed",
];

export const AGE_GROUPS: AgeGroup[] = [
  "Middle School",
  "High School",
  "Young Adult",
];

export const PRIORITY_RANKS: PriorityRank[] = [
  "High",
  "Medium",
  "Low",
];

export const DELAY_REASONS: DelayReason[] = [
  "Legal / Guardianship Documentation",
  "Medical / TB Clearance Hold",
  "School / IEP / Transportation Transition",
  "Family Request",
  "No Bed Available",
];

/** Documented vulnerability criteria — contextual only, never used to infer
 *  priority automatically. */
export const PRIORITY_CRITERIA = [
  "Unhoused Status (Young Adult 18+)",
  "Severe Household Crisis / Safety Triggers",
  "Academic Quarter Alignment",
];

export const CLOSING_GRACE_DAYS = 30;

// Business-defined display order (do not alphabetize).
export const RESIDENTIAL_HOMES: ResidentialHome[] = [
  {
    id: "speh",
    name: "Speh Home",
    campus: "West Loop",
    defaultCapacity: 8,
  },
  {
    id: "bosco",
    name: "Bosco Home",
    campus: "West Loop",
    programId: 6,
    defaultCapacity: 10,
  },
  {
    id: "mahoney",
    name: "Mahoney Home",
    campus: "West Loop",
    defaultCapacity: 8,
  },
  {
    id: "cooke",
    name: "Cooke Home",
    campus: "West Loop",
    programId: 8,
    defaultCapacity: 10,
  },
  {
    id: "noha",
    name: "Noha Home",
    campus: "West Loop",
    defaultCapacity: 8,
  },
  {
    id: "daley",
    name: "Daley Home",
    campus: "West Loop",
    defaultCapacity: 8,
  },
  {
    id: "campbell",
    name: "Campbell Home",
    campus: "West Loop",
    programId: 7,
    defaultCapacity: 10,
  },
  {
    id: "sheil",
    name: "Sheil Home",
    campus: "West Loop",
    defaultCapacity: 8,
  },
  {
    id: "kelly",
    name: "Kelly Home",
    campus: "West Loop",
    defaultCapacity: 8,
  },
  {
    id: "quille",
    name: "Quille Home",
    campus: "West Loop",
    defaultCapacity: 6,
  },
  {
    id: "seton",
    name: "Seton Home",
    campus: "Walsh",
    programId: 5,
    defaultCapacity: 10,
  },
  {
    id: "walgreen",
    name: "Walgreen Home",
    campus: "Walsh",
    defaultCapacity: 8,
  },
  {
    id: "couderc",
    name: "Couderc Home",
    campus: "Walsh",
    programId: 4,
    defaultCapacity: 10,
  },
  {
    id: "bernardin",
    name: "Bernardin Home",
    campus: "Walsh",
    programId: 3,
    defaultCapacity: 6,
  },
];

export function getHomeName(homeId?: string): string {
  return (
    RESIDENTIAL_HOMES.find((h) => h.id === homeId)?.name ?? ""
  );
}

// ─── Relative-date helpers (seed only) ──────────────────────────────────────

function toIso(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function daysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toIso(d);
}

/** A day inside the month `offset` months from the current month. */
function inMonth(offset: number, day = 15): string {
  const now = new Date();
  return toIso(
    new Date(now.getFullYear(), now.getMonth() + offset, day),
  );
}

// ─── Program Enrollments (actual residents) ─────────────────────────────────

// Per-home seed: resident names plus the few with a planned transition.
// `lv` = months from now of the planned discharge; `unsure` = months from
// now when plans become unsure.
type ResidentSeed = {
  name: string;
  dob: string;
  lv?: number;
  unsure?: number;
  leadId?: string;
};

const RESIDENT_SEED: Record<string, ResidentSeed[]> = {
  noha: [
    { name: "Darius Coleman", dob: "2009-05-02" },
    { name: "Elijah Brooks", dob: "2010-01-19" },
    { name: "Mateo Ramirez", dob: "2009-11-30", lv: 2 },
    { name: "Josiah Grant", dob: "2010-07-14" },
    { name: "Xavier Bell", dob: "2011-02-08" },
    { name: "Caleb Porter", dob: "2009-09-21" },
    { name: "Omar Haddad", dob: "2010-04-03" },
  ],
  speh: [
    { name: "Terrence Hollis", dob: "2007-08-12", lv: 3 },
    { name: "Isaiah Freeman", dob: "2008-03-27" },
    { name: "Luis Ortega", dob: "2008-12-05" },
    { name: "Brandon Pierce", dob: "2007-10-16", unsure: 4 },
    { name: "Kendrick Moss", dob: "2008-06-09" },
    { name: "Andre Lawson", dob: "2007-12-22" },
    { name: "Tobias Reed", dob: "2008-01-30" },
    { name: "Marcus Hale", dob: "2008-09-18" },
  ],
  daley: [
    { name: "Julian Vega", dob: "2011-03-11" },
    { name: "Noah Kim", dob: "2011-08-24" },
    { name: "Ezekiel Price", dob: "2012-01-07", lv: 1 },
    { name: "Ryan Sullivan", dob: "2011-10-02" },
    { name: "Adrian Flores", dob: "2012-04-15" },
    { name: "Cameron Wade", dob: "2011-06-28" },
  ],
  bosco: [
    { name: "Jaylen Carter", dob: "2009-02-14" },
    { name: "Devon Harris", dob: "2009-07-03" },
    { name: "Miles Turner", dob: "2010-05-26" },
    { name: "Gabriel Santos", dob: "2009-12-12", lv: 4 },
    { name: "Trevon Young", dob: "2010-09-09" },
    { name: "Aaron Nguyen", dob: "2009-04-19" },
    { name: "Dominic Russo", dob: "2010-02-01" },
    { name: "Kevin Brown", dob: "2009-11-03", leadId: "L-010" },
    { name: "Samuel Okoro", dob: "2010-08-17", unsure: 3 },
  ],
  mahoney: [
    { name: "Christopher Lane", dob: "2008-04-11" },
    { name: "Hector Molina", dob: "2008-10-23" },
    { name: "Jordan Ellis", dob: "2009-01-05", lv: 5 },
    { name: "Patrick Doyle", dob: "2008-07-29" },
    { name: "Reggie Watts", dob: "2009-03-16" },
    { name: "Victor Chen", dob: "2008-11-08" },
    { name: "Wesley Tate", dob: "2008-05-20" },
  ],
  cooke: [
    { name: "Brianna Scott", dob: "2009-06-06" },
    { name: "Camila Torres", dob: "2010-03-03" },
    { name: "Danielle Ward", dob: "2009-10-10" },
    { name: "Imani Brooks", dob: "2010-12-24", lv: 2 },
    { name: "Keisha Morgan", dob: "2009-08-08" },
    { name: "Lena Petrova", dob: "2010-01-13" },
    { name: "Maya Johnson", dob: "2009-05-29" },
    { name: "Nadia Ali", dob: "2010-07-07" },
  ],
  campbell: [
    { name: "Ariana Lopez", dob: "2011-01-21" },
    { name: "Chloe Bennett", dob: "2011-09-14" },
    { name: "Faith Robinson", dob: "2012-02-02" },
    { name: "Hannah Price", dob: "2011-05-05", unsure: 2 },
    { name: "Jada Simmons", dob: "2011-11-11" },
    { name: "Kayla Wright", dob: "2012-06-30" },
    { name: "Leah Dawson", dob: "2011-04-04" },
    { name: "Mia Castillo", dob: "2011-08-18" },
    { name: "Nia Franklin", dob: "2012-03-27" },
    { name: "Olivia Grant", dob: "2011-12-09" },
  ],
  sheil: [
    { name: "Aisha Rahman", dob: "2007-09-19" },
    { name: "Bianca Reyes", dob: "2008-02-26" },
    { name: "Destiny Park", dob: "2007-11-04", lv: 1 },
    { name: "Gianna Russo", dob: "2008-08-13" },
    { name: "Jasmine Cole", dob: "2007-06-01" },
    { name: "Kiara Hughes", dob: "2008-04-22" },
  ],
  kelly: [
    { name: "Alexis Monroe", dob: "2008-03-09" },
    { name: "Brooke Palmer", dob: "2008-10-31" },
    { name: "Crystal Vance", dob: "2009-01-17" },
    { name: "Diana Cruz", dob: "2008-07-24" },
    { name: "Erica Stone", dob: "2008-12-15", lv: 3 },
    { name: "Gloria Mendez", dob: "2009-02-20" },
    { name: "Heather Quinn", dob: "2008-05-12" },
    { name: "Ivy Chen", dob: "2008-09-06" },
  ],
  // Quille intentionally has no current residents (empty-program edge case).
  quille: [],
  seton: [
    { name: "Melody Wright", dob: "2009-04-16" },
    { name: "Simone Assaf", dob: "2009-10-28" },
    {
      name: "Xailani Vargas-Modacure",
      dob: "2010-02-11",
      lv: 2,
    },
    { name: "Zara Donald", dob: "2009-07-19" },
    { name: "Amara Okafor", dob: "2010-05-08" },
    { name: "Brielle Thomas", dob: "2009-12-01", unsure: 4 },
    { name: "Coral Jimenez", dob: "2010-08-25" },
    { name: "Dahlia Evans", dob: "2009-03-14" },
  ],
  walgreen: [
    { name: "Esperanza Diaz", dob: "2011-06-19" },
    { name: "Fatima Noor", dob: "2011-01-28" },
    { name: "Grace Lindqvist", dob: "2012-03-05" },
    { name: "Harmony Banks", dob: "2011-09-30", lv: 1 },
    { name: "Isla Moreno", dob: "2011-11-22" },
    { name: "Journee Mitchell", dob: "2012-05-17" },
    { name: "Kenya Holloway", dob: "2011-07-07" },
    { name: "Luna Alvarez", dob: "2012-01-03" },
  ],
  couderc: [
    { name: "Nevaeh Stewart", dob: "2008-02-18" },
    { name: "Paloma Ruiz", dob: "2008-08-29" },
    { name: "Queenie Liu", dob: "2009-01-10" },
    { name: "Renata Silva", dob: "2008-06-14", lv: 4 },
    { name: "Sasha Ivanova", dob: "2008-11-26" },
    { name: "Tiana Brooks", dob: "2009-03-31" },
    { name: "Unique Harris", dob: "2008-04-07" },
  ],
  bernardin: [
    { name: "Valeria Gomez", dob: "2007-05-23" },
    { name: "Willow Bryant", dob: "2007-12-12" },
    { name: "Yasmin Farah", dob: "2008-01-29", lv: 3 },
    { name: "Zoey Carmichael", dob: "2007-09-02" },
    { name: "Ada Nwosu", dob: "2008-03-18" },
  ],
};

export const PROGRAM_ENROLLMENTS: ProgramEnrollment[] =
  Object.entries(RESIDENT_SEED).flatMap(([homeId, residents]) =>
    residents.map((r, i) => ({
      id: `ENR-${homeId}-${i + 1}`,
      youthName: r.name,
      dateOfBirth: r.dob,
      homeId,
      // Kevin Brown (L-010) was just enrolled — his actual move-in is recent,
      // which is what removes him from the active waitlist.
      actualMoveInDate: r.leadId
        ? daysFromToday(-6)
        : daysFromToday(-120 - i * 37),
      anticipatedMoveOutDate:
        r.lv != null ? inMonth(r.lv, 20) : undefined,
      plansUnsureFrom:
        r.unsure != null ? inMonth(r.unsure, 1) : undefined,
      leadId: r.leadId,
    })),
  );

// ─── Waitlist planning overlay (keyed by Admissions lead id) ────────────────

type WaitlistSeed = Partial<
  Omit<
    WaitlistCandidate,
    "id" | "name" | "dateOfBirth" | "history"
  >
> & { categoryDaysAgo: number; closedDaysAgo?: number };

const WAITLIST_DETAILS: Record<string, WaitlistSeed> = {
  "L-001": {
    categoryDaysAgo: 9,
    anticipatedProgram: "bosco",
    anticipatedMoveInDate: inMonth(3, 10),
    grade: "10th",
    guardianshipDetails:
      "Mother (Patricia Thompson) — full legal custody",
    medicalNotes: "None reported",
    comments:
      "Counselor referral; family eager to schedule Info Session.",
  },
  "L-002": {
    categoryDaysAgo: 14,
    youthType: "Readmit",
    anticipatedProgram: "bosco",
    anticipatedMoveInDate: inMonth(2, 3),
    grade: "11th",
    guardianshipDetails:
      "Grandmother — guardianship papers on file",
    medicalNotes: "Asthma — rescue inhaler",
    comments: "",
  },
  "L-003": {
    categoryDaysAgo: 6,
    anticipatedProgram: "couderc",
    anticipatedMoveInDate: inMonth(5, 5),
    grade: "7th",
    guardianshipDetails: "Both parents — joint custody",
    medicalNotes: "None reported",
    comments:
      "Info Session scheduled; family requested Walsh campus.",
  },
  "L-004": {
    categoryDaysAgo: 11,
    anticipatedProgram: "mahoney",
    grade: "11th",
    guardianshipDetails: "Aunt — DCFS placement",
    medicalNotes: "Seasonal allergies",
    comments: "Move-in date not yet discussed.",
  },
  "L-005": {
    categoryDaysAgo: 34,
    anticipatedProgram: "seton",
    anticipatedMoveInDate: inMonth(3, 15),
    checkInDate: daysFromToday(-3),
    grade: "10th",
    guardianshipDetails: "Mother — full legal custody",
    medicalNotes: "TB test cleared",
    comments: "Confirmed to move forward to Seton.",
  },
  "L-006": {
    categoryDaysAgo: 21,
    delayReason: "Medical / TB Clearance Hold",
    nextReviewDate: daysFromToday(10),
    anticipatedProgram: "daley",
    grade: "8th",
    guardianshipDetails: "Father — sole custody",
    medicalNotes: "Awaiting TB chest X-ray result",
    comments: "Hold until TB clearance received.",
  },
  "L-007": {
    categoryDaysAgo: 47,
    priorityRank: "High",
    anticipatedProgram: "noha",
    anticipatedMoveInDate: inMonth(2, 22),
    grade: "11th",
    guardianshipDetails: "Mother — full legal custody",
    medicalNotes: "None reported",
    comments:
      "Severe household crisis documented by case manager; bumped.",
  },
  "L-008": {
    categoryDaysAgo: 60,
    anticipatedProgram: "bosco",
    anticipatedMoveInDate: inMonth(1, 12),
    checkInDate: daysFromToday(-10),
    grade: "10th",
    guardianshipDetails: "Grandparents — legal guardians",
    medicalNotes: "None reported",
    comments: "",
  },
  "L-009": {
    categoryDaysAgo: 75,
    anticipatedProgram: "walgreen",
    anticipatedMoveInDate: inMonth(4, 8),
    grade: "8th",
    guardianshipDetails: "Mother — full legal custody",
    medicalNotes: "Peanut allergy — EpiPen",
    comments: "Timing aligned to academic quarter start.",
  },
  "L-010": {
    categoryDaysAgo: 90,
    anticipatedProgram: "bosco",
    anticipatedMoveInDate: daysFromToday(-6),
    grade: "11th",
    guardianshipDetails: "Mother — full legal custody",
    medicalNotes: "None reported",
    comments: "Enrolled in Bosco Home.",
  },
  "L-011": {
    categoryDaysAgo: 18,
    delayReason: "Legal / Guardianship Documentation",
    nextReviewDate: daysFromToday(4),
    grade: "10th",
    guardianshipDetails:
      "Guardianship transfer pending in court",
    medicalNotes: "None reported",
    comments: "Waiting on court order.",
  },
  "L-012": {
    categoryDaysAgo: 25,
    priorityRank: "Medium",
    delayReason: "School / IEP / Transportation Transition",
    nextReviewDate: daysFromToday(-2),
    grade: "7th",
    guardianshipDetails: "Mother — full legal custody",
    medicalNotes: "IEP on file",
    comments: "IEP meeting with receiving school pending.",
  },
  "L-013": {
    categoryDaysAgo: 40,
    youthType: "Readmit",
    delayReason: "No Bed Available",
    nextReviewDate: daysFromToday(20),
    anticipatedProgram: "kelly",
    anticipatedMoveInDate: inMonth(3, 25),
    grade: "12th",
    guardianshipDetails: "Self — turns 18 this year",
    medicalNotes: "None reported",
    comments: "Waiting for the next open Kelly bed.",
  },
  "L-014": {
    categoryDaysAgo: 12,
    priorityRank: "Low",
    grade: "6th",
    guardianshipDetails: "Father — full legal custody",
    medicalNotes: "None reported",
    comments: "",
  },
  "L-015": {
    categoryDaysAgo: 8,
    grade: "10th",
    guardianshipDetails: "Mother — full legal custody",
    medicalNotes: "None reported",
    comments: "",
  },
  "L-016": {
    categoryDaysAgo: 12,
    closedDaysAgo: 12,
    grade: "11th",
    guardianshipDetails: "Mother — full legal custody",
    medicalNotes: "None reported",
    comments: "Family chose another placement.",
  },
  // Delayed but missing Delay Reason / Next Review Date (edge case).
  "L-017": {
    categoryDaysAgo: 5,
    grade: "7th",
    guardianshipDetails: "Aunt — informal kinship care",
    medicalNotes: "None reported",
    comments: "",
  },
  "L-018": {
    categoryDaysAgo: 45,
    closedDaysAgo: 45,
    grade: "10th",
    guardianshipDetails: "Mother — full legal custody",
    medicalNotes: "None reported",
    comments: "No response after three follow-ups.",
  },
};

function leadToCandidate(lead: Lead): WaitlistCandidate {
  const seed = WAITLIST_DETAILS[lead.id] ?? {
    categoryDaysAgo: lead.daysInStage,
  };
  const { categoryDaysAgo, closedDaysAgo, ...rest } = seed;
  return {
    id: lead.id,
    name: lead.name,
    dateOfBirth: lead.dateOfBirth ?? "",
    ageGroup: (lead.ageGroup as AgeGroup) ?? "High School",
    youthType: "External",
    category: lead.status as WaitlistCategory,
    categoryEnteredAt: daysFromToday(-categoryDaysAgo),
    closedAt:
      closedDaysAgo != null
        ? daysFromToday(-closedDaysAgo)
        : undefined,
    caseManager: lead.caseManager ?? "",
    referralDate: lead.promotedDate ?? lead.createdDate,
    infoSessionDate: lead.infoSessionData?.sessionDate,
    grade: "",
    guardianshipDetails: "",
    medicalNotes: "",
    comments: "",
    history: [],
    ...rest,
  };
}

// Young Adult candidates — none of the Admissions leads are Young Adult yet.
const YOUNG_ADULT_CANDIDATES: WaitlistCandidate[] = [
  {
    id: "W-101",
    name: "Terrence Hollis",
    dateOfBirth: "2007-08-12",
    ageGroup: "Young Adult",
    youthType: "External",
    category: "Program Waitlist",
    categoryEnteredAt: daysFromToday(-20),
    caseManager: "Sarah Williams",
    referralDate: daysFromToday(-65),
    anticipatedProgram: "sheil",
    anticipatedMoveInDate: inMonth(3, 25),
    grade: "12th",
    guardianshipDetails: "Self (18+)",
    medicalNotes: "None reported",
    comments:
      "Internal transfer from Speh Home to Sheil independent-living track.",
    isInternalTransfer: true,
    history: [],
  },
  {
    id: "W-102",
    name: "Nia Okafor",
    dateOfBirth: "2007-03-02",
    ageGroup: "Young Adult",
    youthType: "External",
    category: "Referral",
    categoryEnteredAt: daysFromToday(-3),
    caseManager: "David Chen",
    referralDate: daysFromToday(-3),
    grade: "Graduated",
    guardianshipDetails: "Self (18+)",
    medicalNotes: "None reported",
    priorityRank: "High",
    comments: "Currently unhoused — staying at a shelter.",
    history: [],
  },
];

export const SEED_WAITLIST: WaitlistCandidate[] = [
  ...ALL_LEADS.map(leadToCandidate),
  ...YOUNG_ADULT_CANDIDATES,
];

// ─── Connections (Clinical Assessment / Admissions Shadow / Staffing) ───────
// Built from each lead's existing assessment/shadow/staffing records — the
// same Connection types ConnectionsSection offers — rather than stored as
// separate hand-entered dates on the waitlist.

export const WAITLIST_CONNECTIONS: WaitlistConnection[] =
  ALL_LEADS.flatMap((lead) => {
    const out: WaitlistConnection[] = [];
    const clinical = lead.assessmentData?.psychExamDate;
    if (clinical)
      out.push({
        id: `CON-${lead.id}-CA`,
        youthId: lead.id,
        type: "Admissions Clinical Assessment",
        startDate: clinical,
        status: lead.assessmentData?.psychExamCompleted
          ? "Completed"
          : "Scheduled",
      });
    const shadow = lead.shadowFPMData?.shadowDate;
    if (shadow)
      out.push({
        id: `CON-${lead.id}-SH`,
        youthId: lead.id,
        type: "Admissions Shadow",
        startDate: shadow,
        status: lead.shadowFPMData?.shadowCompleted
          ? "Completed"
          : "Scheduled",
      });
    const staffing = lead.staffingData?.staffingDate;
    if (staffing)
      out.push({
        id: `CON-${lead.id}-ST`,
        youthId: lead.id,
        type: "Staffing Meeting",
        startDate: staffing,
        status: lead.staffingData?.staffingCompleted
          ? "Completed"
          : "Scheduled",
      });
    return out;
  }).concat([
    {
      id: "CON-W-101-CA",
      youthId: "W-101",
      type: "Admissions Clinical Assessment",
      startDate: daysFromToday(-30),
      status: "Completed",
    },
    {
      id: "CON-W-101-ST",
      youthId: "W-101",
      type: "Staffing Meeting",
      startDate: daysFromToday(-12),
      status: "Completed",
    },
  ]);

// ─── Seed notes ──────────────────────────────────────────────────────────────

const SEED_NOTES: Record<string, ProjectionNote> = {
  "enr:ENR-seton-3": {
    text: "Transitioning to family reunification; home visits increasing.",
    updatedBy: "Sarah Williams",
    updatedAt: `${daysFromToday(-4)}T15:00:00.000Z`,
  },
  "enr:ENR-speh-1": {
    text: "Internal transfer to Sheil Home once Young Adult track opens.",
    updatedBy: "David Chen",
    updatedAt: `${daysFromToday(-9)}T15:00:00.000Z`,
  },
  "cand:L-005": {
    text: "Family visit to Seton planned before move-in.",
    updatedBy: "Sarah Williams",
    updatedAt: `${daysFromToday(-2)}T15:00:00.000Z`,
  },
};

// ─── Module-level store ──────────────────────────────────────────────────────
// Same convention as mockProgramsData.ts: the page seeds React state from
// these getters and writes back on every change, so edits persist across
// navigation within the session.

let waitlist: WaitlistCandidate[] = [...SEED_WAITLIST];
let projectionOverrides: Record<string, ProjectionCode> = {};
let projectionNotes: Record<string, ProjectionNote> = {
  ...SEED_NOTES,
};
let residentPlans: Record<string, ResidentPlan> = {};
/** Manual rank of each anticipated youth within its Anticipated Program,
 *  keyed by the projected youth key. Cleared when the Program changes. */
let anticipatedRanks: Record<string, number> = {};

export function getWaitlist(): WaitlistCandidate[] {
  return waitlist;
}
export function setWaitlistData(
  next: WaitlistCandidate[],
): void {
  waitlist = next;
}
export function getProjectionOverrides(): Record<
  string,
  ProjectionCode
> {
  return projectionOverrides;
}
export function setProjectionOverridesData(
  next: Record<string, ProjectionCode>,
): void {
  projectionOverrides = next;
}
export function getProjectionNotes(): Record<
  string,
  ProjectionNote
> {
  return projectionNotes;
}
export function setProjectionNotesData(
  next: Record<string, ProjectionNote>,
): void {
  projectionNotes = next;
}
export function getResidentPlans(): Record<
  string,
  ResidentPlan
> {
  return residentPlans;
}
export function setResidentPlansData(
  next: Record<string, ResidentPlan>,
): void {
  residentPlans = next;
}
export function getAnticipatedRanks(): Record<string, number> {
  return anticipatedRanks;
}
export function setAnticipatedRanksData(
  next: Record<string, number>,
): void {
  anticipatedRanks = next;
}