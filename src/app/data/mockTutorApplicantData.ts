// Shared data for the Tutor section's Applications and Tutor Search tabs.
// Both tabs open the same applicant record, so their types/mock data/status
// config live together here rather than duplicated per page.

export type TutorApplicantStatus =
  | "approved"
  | "pending"
  | "under-review"
  | "waitlisted"
  | "inactive";

// PGC Training status tracks the PGC Training Certificate upload (doc-5):
// pending = not uploaded, pending-approval = uploaded awaiting review,
// approved / rejected = the uploaded certificate's review outcome.
export type PgcStatus =
  "approved" | "rejected" | "pending" | "pending-approval";

// Which of the tutor program's sub-programs this applicant is tied to —
// shown as a row of toggleable pills in Applicant Summary (left of PGC
// Training). Multi-select: an applicant can belong to any combination,
// all of them, or none, so this is an array rather than a single value.
export const TUTOR_SUB_PROGRAMS = ["CB", "SB", "WB"] as const;
export type TutorSubProgram =
  (typeof TUTOR_SUB_PROGRAMS)[number];

export type BadgeVariant =
  "success" | "warning" | "info" | "neutral" | "error";

export const STATUS_LABEL: Record<
  TutorApplicantStatus,
  string
> = {
  approved: "Approved",
  pending: "Pending",
  "under-review": "Under Review",
  waitlisted: "Waitlisted",
  inactive: "Inactive",
};

export const STATUS_BADGE_VARIANT: Record<
  TutorApplicantStatus,
  BadgeVariant
> = {
  approved: "success",
  pending: "warning",
  "under-review": "info",
  waitlisted: "neutral",
  inactive: "error",
};

export const PGC_LABEL: Record<PgcStatus, string> = {
  approved: "Approved",
  rejected: "Rejected",
  pending: "Pending",
  "pending-approval": "Pending Approval",
};

export const PGC_BADGE_VARIANT: Record<
  PgcStatus,
  BadgeVariant
> = {
  approved: "success",
  rejected: "error",
  pending: "neutral",
  "pending-approval": "warning",
};

// Post-approval matching status, shown only on the Tutor Search tab — a
// different concept from TutorApplicantStatus above (which tracks the
// application pipeline). Independent field so narrowing Search's status
// filter to these 3 values never touches Applications' own status/badges.
export type TutorSearchStatus =
  "Available" | "Matched" | "Inactive";

export const SEARCH_STATUS_BADGE_VARIANT: Record<
  TutorSearchStatus,
  BadgeVariant
> = {
  Available: "success",
  Matched: "info",
  Inactive: "error",
};

// Same Program/Campus vocabulary as Tutor Matches (TutorModule.tsx), kept as
// an independent copy here since Tutor Matches is not meant to be touched.
export const TUTOR_APPLICANT_PROGRAMS = [
  "Residential",
  "ECR Tutor",
  "Day Treatment",
  "Foster Care",
  "Community Support",
] as const;
export type TutorApplicantProgram =
  (typeof TUTOR_APPLICANT_PROGRAMS)[number];

export const TUTOR_APPLICANT_CAMPUSES = [
  "West Loop Campus",
  "Walsh Campus",
  "Other",
  "Offsite",
] as const;
export type TutorApplicantCampus =
  (typeof TUTOR_APPLICANT_CAMPUSES)[number];

// Volunteer Applications landing page (US 19846) — the volunteer program an
// application belongs to. Independent of `program` above (the youth program
// shown on the applicant record), so the record page is unaffected.
export const TUTOR_COORDINATORS = [
  "Sarah Mitchell",
  "James Thompson",
  "Lisa Chen",
  "Nikki",
  "Swapnali",
  "Megan",
] as const;

// Tutor funding type picklist shown beside PGC Training in Applicant Summary.
export const TUTOR_TYPES = ["Title 1", "Contract", "InKind"] as const;
export type TutorType = (typeof TUTOR_TYPES)[number];

export const VOLUNTEER_PROGRAMS = [
  "ECR Tutor",
  "Friends First",
] as const;
export type VolunteerProgram =
  (typeof VOLUNTEER_PROGRAMS)[number];

// Application pipeline stage shown on the Applications grid (US 19846).
// Independent of TutorApplicantStatus, which still drives the applicant
// record page's status badge and stepper.
export const APPLICATION_STAGES = [
  "Not Started",
  "In Progress",
  "Awaiting Background Check",
  "References Under Review",
  "Needs Orientation",
  "Determination Pending",
  "Closed/Rejected",
  "Ready for Match",
] as const;
export type ApplicationStage =
  (typeof APPLICATION_STAGES)[number];

export const APPLICATION_STAGE_BADGE_VARIANT: Record<
  ApplicationStage,
  | "orange"
  | "info"
  | "warning"
  | "dark"
  | "purple"
  | "neutral"
  | "error"
  | "success"
> = {
  "Not Started": "orange",
  "In Progress": "info",
  "Awaiting Background Check": "warning",
  "References Under Review": "dark",
  "Needs Orientation": "purple",
  "Determination Pending": "neutral",
  "Closed/Rejected": "error",
  "Ready for Match": "success",
};

export const TUTOR_STAGES = [
  "Not Started",
  "In Progress",
  "Awaiting Background Check",
  "References Under Review",
  "Needs Orientation",
  "Determination Pending",
  "Closed/Rejected",
  "Ready for Match",
] as const;

export const STATUS_TO_STAGE: Record<
  TutorApplicantStatus,
  number
> = {
  pending: 0, // Not Started
  "under-review": 2, // Awaiting Background Check
  approved: 7, // Ready for Match
  waitlisted: 1, // In Progress
  inactive: 6, // Closed/Rejected
};

export interface LanguageProficiency {
  language: string;
  read: boolean;
  write: boolean;
  speak: boolean;
}

export interface TutorApplicationDetails {
  legalFirstName: string;
  legalMiddleName?: string;
  legalLastName: string;
  dateOfBirth: string;
  preferredPhone: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  anticipatedLengthOfService: string;
  howDidYouHear: string;
  daysAvailable: string[];
  personalStrengths: string;
  whyTutor: string;
  employmentStatus: string;
  currentEmployer: string;
  employerContact: string;
  jobTitle: string;
  profession: string;
  lengthOfEmployment: string;
  volunteerHistory: string;
  highestEducation: string;
  mathProficiency: string;
  scienceProficiency: string;
  subjectAreas: string[];
  preferredAgeGroups: string[];
  languagesFluent: LanguageProficiency[];
  positiveExperience: string;
  handlingStruggles: string;
  convictedOfCrime: string;
  ssn?: string;
}

export interface TutorApplicant {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  role: string;
  program: TutorApplicantProgram;
  campus: TutorApplicantCampus;
  site: string;
  hours: string;
  submitted: string;
  completedDate: string | null;
  status: TutorApplicantStatus;
  volunteerProgram: VolunteerProgram;
  stage: ApplicationStage;
  searchStatus: TutorSearchStatus;
  pgc: PgcStatus;
  /** Funding Type already assigned to this record; new records default to InKind. */
  tutorType?: TutorType;
  subPrograms: TutorSubProgram[];
  refsReceived: number;
  refsTotal: number;
  coordinator: string;
  notes: string;
  applicationDetails: TutorApplicationDetails;
  seed?: TutorRecordSeed;
}

// Result of a Match Readiness checklist item (see tutorApplicantStore.ts).
export type CheckResult = "passed" | "failed" | "pending";

// Pending = not yet signed/uploaded. Complete = e-signed (no review needed).
// Pending Approval = uploaded, awaiting staff validation.
export type DocStatus =
  | "pending"
  | "complete"
  | "pending-approval"
  | "approved"
  | "rejected";

// Stable document ids used by tutorApplicantStore.ts.
export type TutorDocId =
  | "doc-bgc"
  | "doc-cants"
  | "doc-attest"
  | "doc-confid"
  | "doc-ethics"
  | "doc-publicity"
  | "doc-pgc"
  | "doc-dcfs";

// Optional explicit starting state for a record's staff-maintained data
// (stage history, availability, documents, references, checklist reviews,
// matches). Anything omitted is derived from the applicant's own fields.
// Used by the QA records (TA-110 – TA-114) so every US 20026 state is
// reproducible.
export interface TutorRecordSeed {
  inactive?: boolean;
  /** Oldest first; dates MM/DD/YYYY. */
  stageHistory?: {
    stage: ApplicationStage;
    date: string;
    user: string;
  }[];
  availability?: {
    campus: TutorApplicantCampus;
    day: "Monday" | "Tuesday" | "Wednesday" | "Thursday";
    slot: "6:15–7:15 PM" | "7:15–8:15 PM";
  }[];
  documents?: Partial<Record<TutorDocId, DocStatus>>;
  references?: {
    name: string;
    relationship: string;
    email: string;
    phone: string;
    status: "submitted" | "awaiting";
  }[];
  checks?: { background?: CheckResult; orientation?: CheckResult };
  matches?: {
    id: string;
    youth: string;
    program?: string;
    startDate: string;
    endDate: string | null;
    endTime: string | null;
    status: "Active" | "Ended";
  }[];
}

// ─── Mock records ───────────────────────────────────────────────────────────

const LANG_EN: LanguageProficiency = {
  language: "English",
  read: true,
  write: true,
  speak: true,
};
const LANG_ES_FULL: LanguageProficiency = {
  language: "Spanish",
  read: true,
  write: true,
  speak: true,
};

export const MOCK_TUTOR_APPLICANTS: TutorApplicant[] = [
  {
    id: "TA-101",
    name: "Renata Alvarez",
    initials: "RA",
    email: "renata.alvarez@example.com",
    phone: "(312) 555-0182",
    role: "Reading Tutor",
    program: "ECR Tutor",
    campus: "West Loop Campus",
    site: "Room 101 – West Loop",
    hours: "4–6 hrs/wk",
    submitted: "05/22/2026",
    completedDate: null,
    status: "pending",
    volunteerProgram: "ECR Tutor",
    stage: "Not Started",
    searchStatus: "Available",
    pgc: "approved",
    subPrograms: ["WB"],
    refsReceived: 1,
    refsTotal: 2,
    coordinator: "Sarah Mitchell",
    notes:
      "Strong candidate with prior tutoring experience. Awaiting background check results.",
    applicationDetails: {
      legalFirstName: "Renata",
      legalLastName: "Alvarez",
      dateOfBirth: "03/15/1994",
      preferredPhone: "(312) 555-0182",
      streetAddress: "2847 N Halsted St, Apt 3F",
      city: "Chicago",
      state: "Illinois",
      zip: "60657",
      anticipatedLengthOfService: "6–12 months",
      howDidYouHear: "Colleague or coworker",
      daysAvailable: ["Mon", "Wed"],
      personalStrengths:
        "Patient and adaptable, with a genuine love for working with youth.",
      whyTutor:
        "Grew up without access to mentoring resources and wants to be that guide for someone else.",
      employmentStatus: "Employed full-time",
      currentEmployer: "Chicago Public Schools",
      employerContact: "HR Department · (312) 555-0100",
      jobTitle: "Administrative Coordinator",
      profession: "Education",
      lengthOfEmployment: "3–5 years",
      volunteerHistory:
        "Reading Buddy at a local elementary school (2021–2023).",
      highestEducation: "Bachelor's Degree",
      mathProficiency: "Proficient",
      scienceProficiency: "Basic",
      subjectAreas: [
        "Calculus",
        "Algebra",
        "Algebra 2",
        "Chemistry",
        "Geography",
        "Biography",
        "Biology",
        "Physics",
      ],
      preferredAgeGroups: ["Middle School (11–14)"],
      languagesFluent: [
        {
          language: "English",
          read: true,
          write: true,
          speak: false,
        },
        {
          language: "Spanish",
          read: true,
          write: false,
          speak: true,
        },
      ],
      positiveExperience:
        "Helped a struggling 4th grader reach grade-level reading within a year.",
      handlingStruggles:
        "Identifies the root cause first, then adjusts pace and focuses on small wins.",
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "412-88-1234",
    },
  },
  {
    id: "TA-102",
    name: "Marcus Lindqvist",
    initials: "ML",
    email: "m.lindqvist@example.com",
    phone: "(312) 555-0247",
    role: "Lead Tutor",
    program: "Residential",
    campus: "Walsh Campus",
    site: "Room 105 – Walsh",
    hours: "6–8 hrs/wk",
    submitted: "05/20/2026",
    completedDate: "05/28/2026",
    status: "approved",
    volunteerProgram: "ECR Tutor",
    stage: "Ready for Match",
    searchStatus: "Matched",
    pgc: "approved",
    tutorType: "Contract",
    subPrograms: ["CB"],
    refsReceived: 3,
    refsTotal: 3,
    coordinator: "Sarah Mitchell",
    notes:
      "Cleared all requirements. Ready for placement June 2026.",
    applicationDetails: {
      legalFirstName: "Marcus",
      legalLastName: "Lindqvist",
      dateOfBirth: "07/02/1990",
      preferredPhone: "(312) 555-0247",
      streetAddress: "118 S Wabash Ave, Unit 9",
      city: "Chicago",
      state: "Illinois",
      zip: "60603",
      anticipatedLengthOfService: "1+ years",
      howDidYouHear: "Mercy Home website",
      daysAvailable: ["Tue", "Thu"],
      personalStrengths:
        "Calm under pressure, strong classroom management.",
      whyTutor:
        "Former public-school teacher looking to stay involved with students one-on-one.",
      employmentStatus: "Employed part-time",
      currentEmployer: "Self-employed tutor",
      employerContact: "HR Department · (312) 555-0101",
      jobTitle: "Independent Tutor",
      profession: "Education",
      lengthOfEmployment: "5+ years",
      volunteerHistory:
        "Assisted with after-school programs for 4 years.",
      highestEducation: "Master's Degree",
      mathProficiency: "Advanced",
      scienceProficiency: "Proficient",
      subjectAreas: ["Algebra", "Chemistry"],
      preferredAgeGroups: ["High School (14–18)"],
      languagesFluent: [
        {
          language: "English",
          read: true,
          write: true,
          speak: true,
        },
        {
          language: "Swedish",
          read: true,
          write: true,
          speak: true,
        },
      ],
      positiveExperience:
        "Coached a student through a difficult algebra unit to an A- final grade.",
      handlingStruggles:
        "Breaks concepts into smaller checkpoints and celebrates incremental wins.",
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "412-88-1234",
    },
  },
  {
    id: "TA-103",
    name: "Devon Okafor",
    initials: "DO",
    email: "devon.okafor@example.com",
    phone: "(773) 555-0391",
    role: "Reading Tutor",
    program: "ECR Tutor",
    campus: "West Loop Campus",
    site: "Library – West Loop",
    hours: "8 hrs/wk",
    submitted: "05/17/2026",
    completedDate: null,
    status: "under-review",
    volunteerProgram: "Friends First",
    stage: "References Under Review",
    searchStatus: "Available",
    pgc: "approved",
    subPrograms: ["SB"],
    refsReceived: 2,
    refsTotal: 3,
    coordinator: "James Thompson",
    notes:
      "Coordinator reviewing interview notes before recommending stage change.",
    applicationDetails: {
      legalFirstName: "Devon",
      legalLastName: "Okafor",
      dateOfBirth: "11/09/1996",
      preferredPhone: "(773) 555-0391",
      streetAddress: "540 W Roosevelt Rd",
      city: "Chicago",
      state: "Illinois",
      zip: "60607",
      anticipatedLengthOfService: "6–12 months",
      howDidYouHear: "Referred by current volunteer",
      daysAvailable: ["Mon", "Tue", "Wed"],
      personalStrengths: "Energetic, creative lesson planning.",
      whyTutor:
        "Wants to give back to the community he grew up in.",
      employmentStatus: "Employed full-time",
      currentEmployer: "Horizon Youth Center",
      employerContact: "HR Department · (312) 555-0102",
      jobTitle: "Program Assistant",
      profession: "Nonprofit / Youth Services",
      lengthOfEmployment: "1–3 years",
      volunteerHistory:
        "Weekend youth basketball league coach.",
      highestEducation: "Beyond College",
      mathProficiency: "Basic",
      scienceProficiency: "Advanced",
      subjectAreas: ["Biology"],
      preferredAgeGroups: ["Elementary (5–10)"],
      languagesFluent: [
        {
          language: "English",
          read: true,
          write: true,
          speak: true,
        },
      ],
      positiveExperience:
        "Helped a shy student gain confidence reading aloud in group settings.",
      handlingStruggles:
        "Gives students choice in materials to rebuild engagement.",
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "412-88-1234",
    },
  },
  {
    id: "TA-104",
    name: "Priya Chandran",
    initials: "PC",
    email: "priya.chandran@example.com",
    phone: "(312) 555-0509",
    role: "Reading Tutor",
    program: "Day Treatment",
    campus: "Walsh Campus",
    site: "Conference Room A – Walsh",
    hours: "2–4 hrs/wk",
    submitted: "05/10/2026",
    completedDate: "05/24/2026",
    status: "approved",
    volunteerProgram: "ECR Tutor",
    stage: "Ready for Match",
    searchStatus: "Inactive",
    pgc: "approved",
    tutorType: "Title 1",
    subPrograms: ["WB"],
    refsReceived: 3,
    refsTotal: 3,
    coordinator: "Sarah Mitchell",
    notes:
      "Excellent references. Approved and awaiting site assignment.",
    applicationDetails: {
      legalFirstName: "Priya",
      legalLastName: "Chandran",
      dateOfBirth: "01/28/1992",
      preferredPhone: "(312) 555-0509",
      streetAddress: "77 W Van Buren St, Apt 12B",
      city: "Chicago",
      state: "Illinois",
      zip: "60605",
      anticipatedLengthOfService: "1+ years",
      howDidYouHear: "Social media",
      daysAvailable: ["Wed"],
      personalStrengths:
        "Multilingual, strong rapport with younger kids.",
      whyTutor:
        "Believes early literacy support changes long-term outcomes.",
      employmentStatus: "Self-employed",
      currentEmployer: "Lincoln Park Library",
      employerContact: "HR Department · (312) 555-0103",
      jobTitle: "Youth Services Librarian",
      profession: "Library / Education",
      lengthOfEmployment: "3–5 years",
      volunteerHistory: "Story-time volunteer for 3 years.",
      highestEducation: "Master's Degree",
      mathProficiency: "Proficient",
      scienceProficiency: "Proficient",
      subjectAreas: ["Biology", "Chemistry"],
      preferredAgeGroups: ["Elementary (5–10)"],
      languagesFluent: [
        {
          language: "English",
          read: true,
          write: true,
          speak: true,
        },
        {
          language: "Hindi",
          read: true,
          write: true,
          speak: true,
        },
        {
          language: "Tamil",
          read: true,
          write: true,
          speak: true,
        },
      ],
      positiveExperience:
        "Ran a summer reading challenge that doubled participation.",
      handlingStruggles:
        "Uses picture books and read-alouds to lower the stakes for struggling readers.",
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "412-88-1234",
    },
  },
  {
    id: "TA-105",
    name: "Thomas Whitfield",
    initials: "TW",
    email: "t.whitfield@example.com",
    phone: "(773) 555-0589",
    role: "Reading Tutor",
    program: "Foster Care",
    campus: "Walsh Campus",
    site: "Community Center",
    hours: "4–6 hrs/wk",
    submitted: "05/08/2026",
    completedDate: null,
    status: "waitlisted",
    volunteerProgram: "ECR Tutor",
    stage: "Awaiting Background Check",
    searchStatus: "Available",
    pgc: "pending-approval",
    subPrograms: ["CB"],
    refsReceived: 1,
    refsTotal: 2,
    coordinator: "James Thompson",
    notes:
      "Waitlisted pending capacity at the Community Center site.",
    applicationDetails: {
      legalFirstName: "Thomas",
      legalLastName: "Whitfield",
      dateOfBirth: "09/12/1988",
      preferredPhone: "(773) 555-0589",
      streetAddress: "1500 W Fullerton Ave",
      city: "Chicago",
      state: "Illinois",
      zip: "60614",
      anticipatedLengthOfService: "6–12 months",
      howDidYouHear: "Community event",
      daysAvailable: ["Thu"],
      personalStrengths: "Reliable, structured teaching style.",
      whyTutor:
        "Wants a consistent weekly volunteer commitment.",
      employmentStatus: "Student",
      currentEmployer: "Whitfield Consulting",
      employerContact: "HR Department · (312) 555-0104",
      jobTitle: "Consultant",
      profession: "Business",
      lengthOfEmployment: "5+ years",
      volunteerHistory:
        "Tax-prep volunteer for low-income families.",
      highestEducation: "Bachelor's Degree",
      mathProficiency: "Advanced",
      scienceProficiency: "Basic",
      subjectAreas: ["Algebra"],
      preferredAgeGroups: [
        "Middle School (11–14)",
        "High School (14–18)",
      ],
      languagesFluent: [
        {
          language: "English",
          read: true,
          write: true,
          speak: true,
        },
      ],
      positiveExperience:
        "Tutored a nephew through a difficult geometry course.",
      handlingStruggles:
        "Prefers short, structured practice sets to rebuild confidence.",
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "412-88-1234",
    },
  },
  {
    id: "TA-106",
    name: "Sofia Marchetti",
    initials: "SM",
    email: "sofia.marchetti@example.com",
    phone: "(312) 555-0734",
    role: "Reading Tutor",
    program: "ECR Tutor",
    campus: "West Loop Campus",
    site: "Room 203 – West Loop",
    hours: "4–6 hrs/wk",
    submitted: "04/28/2026",
    completedDate: null,
    status: "inactive",
    volunteerProgram: "Friends First",
    stage: "Closed/Rejected",
    searchStatus: "Inactive",
    pgc: "pending",
    subPrograms: ["SB"],
    refsReceived: 0,
    refsTotal: 2,
    coordinator: "Sarah Mitchell",
    notes:
      "Application closed — applicant withdrew due to scheduling conflict.",
    applicationDetails: {
      legalFirstName: "Sofia",
      legalLastName: "Marchetti",
      dateOfBirth: "05/30/1997",
      preferredPhone: "(312) 555-0734",
      streetAddress: "3210 N Sheffield Ave",
      city: "Chicago",
      state: "Illinois",
      zip: "60657",
      anticipatedLengthOfService: "6–12 months",
      howDidYouHear: "Colleague or coworker",
      daysAvailable: ["Mon", "Wed"],
      personalStrengths: "Organized, dependable communicator.",
      whyTutor:
        "Wanted hands-on volunteer experience with youth.",
      employmentStatus: "Employed full-time",
      currentEmployer: "Marchetti Design Studio",
      employerContact: "HR Department · (312) 555-0105",
      jobTitle: "Graphic Designer",
      profession: "Design",
      lengthOfEmployment: "1–3 years",
      volunteerHistory: "No prior formal tutoring experience.",
      highestEducation: "Bachelor's Degree",
      mathProficiency: "Basic",
      scienceProficiency: "Proficient",
      subjectAreas: ["Biology"],
      preferredAgeGroups: ["Elementary (5–10)"],
      languagesFluent: [
        {
          language: "English",
          read: true,
          write: true,
          speak: true,
        },
        {
          language: "Italian",
          read: true,
          write: true,
          speak: true,
        },
      ],
      positiveExperience:
        "N/A — application withdrawn before placement.",
      handlingStruggles:
        "N/A — application withdrawn before placement.",
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "412-88-1234",
    },
  },
  {
    id: "TA-107",
    name: "Elijah Foster",
    initials: "EF",
    email: "elijah.foster@example.com",
    phone: "(312) 555-0601",
    role: "Algebra Tutor",
    program: "Community Support",
    campus: "West Loop Campus",
    site: "Room 210 – West Loop",
    hours: "4–8 hrs/mo",
    submitted: "05/24/2026",
    completedDate: null,
    status: "pending",
    volunteerProgram: "ECR Tutor",
    stage: "In Progress",
    searchStatus: "Available",
    pgc: "approved",
    subPrograms: ["WB"],
    refsReceived: 0,
    refsTotal: 2,
    coordinator: "Lisa Chen",
    notes: "New application, not yet reviewed.",
    applicationDetails: {
      legalFirstName: "Elijah",
      legalLastName: "Foster",
      dateOfBirth: "02/19/1993",
      preferredPhone: "(312) 555-0601",
      streetAddress: "900 W Madison St",
      city: "Chicago",
      state: "Illinois",
      zip: "60607",
      anticipatedLengthOfService: "6–12 months",
      howDidYouHear: "Colleague or coworker",
      daysAvailable: ["Mon", "Thu"],
      personalStrengths:
        "Analytical, enjoys breaking down Algebra problems.",
      whyTutor:
        "Algebra was hard for him growing up and wants to make it easier for others.",
      employmentStatus: "Employed part-time",
      currentEmployer: "Foster Analytics",
      employerContact: "HR Department · (312) 555-0106",
      jobTitle: "Data Analyst",
      profession: "Technology",
      lengthOfEmployment: "3–5 years",
      volunteerHistory:
        "Algebra club volunteer at a local high school.",
      highestEducation: "Bachelor's Degree",
      mathProficiency: "Proficient",
      scienceProficiency: "Advanced",
      subjectAreas: ["Algebra"],
      preferredAgeGroups: ["High School (14–18)"],
      languagesFluent: [
        {
          language: "English",
          read: true,
          write: true,
          speak: true,
        },
      ],
      positiveExperience:
        "Helped a student go from failing to passing algebra in one semester.",
      handlingStruggles:
        "Uses real-world examples to make abstract concepts click.",
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "412-88-1234",
    },
  },
  {
    id: "TA-108",
    name: "Keisha Bramwell",
    initials: "KB",
    email: "keisha.bramwell@example.com",
    phone: "(312) 555-0774",
    role: "Reading Tutor",
    program: "Residential",
    campus: "West Loop Campus",
    site: "Room 101 – West Loop",
    hours: "4–6 hrs/wk",
    submitted: "05/05/2026",
    completedDate: "05/19/2026",
    status: "approved",
    volunteerProgram: "Friends First",
    stage: "Ready for Match",
    searchStatus: "Available",
    pgc: "approved",
    tutorType: "Contract",
    subPrograms: ["CB"],
    refsReceived: 3,
    refsTotal: 3,
    coordinator: "Sarah Mitchell",
    notes:
      "Approved. Strong references from prior tutoring role.",
    applicationDetails: {
      legalFirstName: "Keisha",
      legalLastName: "Bramwell",
      dateOfBirth: "08/03/1991",
      preferredPhone: "(312) 555-0774",
      streetAddress: "4210 S Michigan Ave",
      city: "Chicago",
      state: "Illinois",
      zip: "60653",
      anticipatedLengthOfService: "1+ years",
      howDidYouHear: "Mercy Home website",
      daysAvailable: ["Mon", "Wed"],
      personalStrengths:
        "Warm, patient, strong classroom presence.",
      whyTutor:
        "Believes every child deserves someone in their corner.",
      employmentStatus: "Retired",
      currentEmployer: "Chicago Public Schools",
      employerContact: "HR Department · (312) 555-0107",
      jobTitle: "Teaching Assistant",
      profession: "Education",
      lengthOfEmployment: "3–5 years",
      volunteerHistory:
        "ESL tutor at a community library for two years.",
      highestEducation: "Bachelor's Degree",
      mathProficiency: "Advanced",
      scienceProficiency: "Proficient",
      subjectAreas: ["Biology", "Chemistry"],
      preferredAgeGroups: ["Middle School (11–14)"],
      languagesFluent: [
        {
          language: "English",
          read: true,
          write: true,
          speak: true,
        },
      ],
      positiveExperience:
        "Watched a student who was two grade levels behind catch up within a year.",
      handlingStruggles:
        "Identifies whether the block is confusion or confidence, then adjusts.",
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "412-88-1234",
    },
  },
  {
    id: "TA-109",
    name: "Nadia Voss",
    initials: "NV",
    email: "nadia.voss@example.com",
    phone: "(773) 555-0831",
    role: "Reading Tutor",
    program: "Day Treatment",
    campus: "Walsh Campus",
    site: "Learning Center – Walsh",
    hours: "2–4 hrs/wk",
    submitted: "02/27/2026",
    completedDate: null,
    status: "inactive",
    volunteerProgram: "ECR Tutor",
    stage: "Closed/Rejected",
    searchStatus: "Inactive",
    pgc: "rejected",
    subPrograms: ["SB"],
    refsReceived: 3,
    refsTotal: 3,
    coordinator: "James Thompson",
    notes:
      "PGC training expired; application closed pending renewal.",
    applicationDetails: {
      legalFirstName: "Nadia",
      legalLastName: "Voss",
      dateOfBirth: "06/14/1985",
      preferredPhone: "(773) 555-0831",
      streetAddress: "2100 N Damen Ave",
      city: "Chicago",
      state: "Illinois",
      zip: "60647",
      anticipatedLengthOfService: "6–12 months",
      howDidYouHear: "Referred by current volunteer",
      daysAvailable: ["Tue"],
      personalStrengths: "Detail-oriented, calm demeanor.",
      whyTutor: "Long-time believer in mentorship programs.",
      employmentStatus: "Employed full-time",
      currentEmployer: "Voss & Co.",
      employerContact: "HR Department · (312) 555-0108",
      jobTitle: "Office Manager",
      profession: "Business",
      lengthOfEmployment: "5+ years",
      volunteerHistory:
        "Youth mentorship committee at a local YMCA.",
      highestEducation: "Associate Degree",
      mathProficiency: "Proficient",
      scienceProficiency: "Basic",
      subjectAreas: ["Biology"],
      preferredAgeGroups: ["Elementary (5–10)"],
      languagesFluent: [
        {
          language: "English",
          read: true,
          write: true,
          speak: true,
        },
        {
          language: "German",
          read: true,
          write: true,
          speak: true,
        },
      ],
      positiveExperience:
        "Helped a mentee complete a school reading log for the first time.",
      handlingStruggles:
        "Uses short breaks and positive reinforcement.",
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "412-88-1234",
    },
  },

  // ─── US 20026 QA records ──────────────────────────────────────────────────
  // Fixed, fictional applicants that exercise every Tutor Application Record
  // state. Keep deterministic — QA scripts depend on these exact values.

  // Scenario A — normal applicant in progress, PGC pending approval.
  {
    id: "TA-110",
    name: "Maya Thompson",
    initials: "MT",
    email: "maya.thompson@example.com",
    phone: "(312) 555-0141",
    role: "Math Tutor",
    program: "ECR Tutor",
    campus: "West Loop Campus",
    site: "Room 101 – West Loop",
    hours: "2 evenings/wk",
    submitted: "09/22/2026",
    completedDate: null,
    status: "pending",
    volunteerProgram: "ECR Tutor",
    stage: "In Progress",
    searchStatus: "Available",
    pgc: "pending-approval",
    tutorType: "InKind",
    subPrograms: ["WB"],
    refsReceived: 1,
    refsTotal: 3,
    coordinator: "Nikki",
    notes:
      "Application is progressing normally. Waiting for background check, remaining reference response, and PGC training approval.",
    applicationDetails: {
      legalFirstName: "Maya",
      legalMiddleName: "Elizabeth",
      legalLastName: "Thompson",
      dateOfBirth: "03/14/1996",
      preferredPhone: "(312) 555-0141",
      streetAddress: "1250 W Monroe St",
      city: "Chicago",
      state: "IL",
      zip: "60607",
      anticipatedLengthOfService: "1 Year",
      howDidYouHear: "Community Event",
      daysAvailable: ["Mon", "Wed"],
      personalStrengths:
        "Patient, dependable, encouraging, and comfortable working with middle-school students.",
      whyTutor:
        "I want to help young people build confidence in math and develop positive study habits.",
      employmentStatus: "Employed Full Time",
      currentEmployer: "Chicago Community Services",
      employerContact: "HR Department · (312) 555-0150",
      jobTitle: "Program Coordinator",
      profession: "Youth Services",
      lengthOfEmployment: "3 years",
      volunteerHistory:
        "Weekend homework-help volunteer at a neighborhood library (2023–2025).",
      highestEducation: "Bachelor's Degree",
      mathProficiency: "Advanced",
      scienceProficiency: "Intermediate",
      subjectAreas: ["Mathematics", "English"],
      preferredAgeGroups: ["Middle School"],
      languagesFluent: [
        LANG_EN,
        { language: "Spanish", read: true, write: false, speak: true },
      ],
      positiveExperience:
        "Led a summer math club where most students raised their end-of-term grades.",
      handlingStruggles:
        "Breaks problems into smaller steps and celebrates progress to rebuild confidence.",
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "900-12-4821",
    },
    seed: {
      inactive: false,
      stageHistory: [
        { stage: "Not Started", date: "09/22/2026", user: "System" },
        { stage: "In Progress", date: "09/24/2026", user: "Nikki" },
      ],
      availability: [
        { campus: "West Loop Campus", day: "Monday", slot: "6:15–7:15 PM" },
        { campus: "Walsh Campus", day: "Monday", slot: "6:15–7:15 PM" },
        { campus: "West Loop Campus", day: "Wednesday", slot: "6:15–7:15 PM" },
        { campus: "Walsh Campus", day: "Wednesday", slot: "6:15–7:15 PM" },
      ],
      documents: {
        "doc-bgc": "complete",
        "doc-cants": "complete",
        "doc-attest": "complete",
        "doc-confid": "complete",
        "doc-ethics": "complete",
        "doc-publicity": "complete",
        "doc-pgc": "pending-approval",
        "doc-dcfs": "pending",
      },
      references: [
        { name: "Sarah Mitchell", relationship: "Former Supervisor", email: "sarah.mitchell@example.com", phone: "(312) 555-0191", status: "submitted" },
        { name: "James Wilson", relationship: "Colleague", email: "james.wilson@example.com", phone: "(312) 555-0192", status: "awaiting" },
        { name: "Angela Davis", relationship: "Community Leader", email: "angela.davis@example.com", phone: "(312) 555-0193", status: "awaiting" },
      ],
      checks: { background: "pending", orientation: "pending" },
      matches: [],
    },
  },

  // Scenario B — most requirements done, waiting on background check.
  {
    id: "TA-111",
    name: "Daniel Rodriguez",
    initials: "DR",
    email: "daniel.rodriguez@example.com",
    phone: "(312) 555-0211",
    role: "Math & Science Tutor",
    program: "ECR Tutor",
    campus: "Walsh Campus",
    site: "Room 204 – Walsh",
    hours: "2 evenings/wk",
    submitted: "09/10/2026",
    completedDate: null,
    status: "under-review",
    volunteerProgram: "ECR Tutor",
    stage: "Awaiting Background Check",
    searchStatus: "Available",
    pgc: "approved",
    tutorType: "Contract",
    subPrograms: ["SB"],
    refsReceived: 2,
    refsTotal: 3,
    coordinator: "Swapnali",
    notes:
      "All major application requirements are complete except background check. Do not move to Ready for Match until background check is completed.",
    applicationDetails: {
      legalFirstName: "Daniel",
      legalMiddleName: "Michael",
      legalLastName: "Rodriguez",
      dateOfBirth: "11/08/1992",
      preferredPhone: "(312) 555-0211",
      streetAddress: "4821 S Morgan St",
      city: "Chicago",
      state: "IL",
      zip: "60609",
      anticipatedLengthOfService: "2 Years",
      howDidYouHear: "Friend / Family",
      daysAvailable: ["Tue", "Thu"],
      personalStrengths:
        "Reliable, organized, patient, and experienced with youth mentoring.",
      whyTutor:
        "I want to provide academic support to students and contribute to my local community.",
      employmentStatus: "Employed Full Time",
      currentEmployer: "Chicago Public Programs",
      employerContact: "HR Department · (312) 555-0250",
      jobTitle: "Academic Advisor",
      profession: "Education",
      lengthOfEmployment: "5 years",
      volunteerHistory:
        "Youth mentor with a South Side after-school program (2019–2024).",
      highestEducation: "Master's Degree",
      mathProficiency: "Advanced",
      scienceProficiency: "Advanced",
      subjectAreas: ["Mathematics", "Science"],
      preferredAgeGroups: ["High School"],
      languagesFluent: [LANG_EN, LANG_ES_FULL],
      positiveExperience:
        "Mentored a high-school junior through chemistry who went on to a STEM program.",
      handlingStruggles:
        "Checks in on what is getting in the way, then sets short, achievable goals together.",
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "900-34-5934",
    },
    seed: {
      inactive: false,
      stageHistory: [
        { stage: "Not Started", date: "09/10/2026", user: "System" },
        { stage: "In Progress", date: "09/12/2026", user: "Swapnali" },
        { stage: "Awaiting Background Check", date: "09/16/2026", user: "Swapnali" },
      ],
      availability: [
        { campus: "Walsh Campus", day: "Tuesday", slot: "6:15–7:15 PM" },
        { campus: "Walsh Campus", day: "Thursday", slot: "7:15–8:15 PM" },
      ],
      documents: {
        "doc-bgc": "complete",
        "doc-cants": "complete",
        "doc-attest": "complete",
        "doc-confid": "complete",
        "doc-ethics": "complete",
        "doc-publicity": "complete",
        "doc-pgc": "approved",
        "doc-dcfs": "approved",
      },
      references: [
        { name: "Karen Lee", relationship: "Former Supervisor", email: "karen.lee@example.com", phone: "(312) 555-0291", status: "submitted" },
        { name: "Michael Brown", relationship: "Colleague", email: "michael.brown@example.com", phone: "(312) 555-0292", status: "submitted" },
        { name: "Robert Green", relationship: "Personal Reference", email: "robert.green@example.com", phone: "(312) 555-0293", status: "awaiting" },
      ],
      checks: { background: "pending", orientation: "passed" },
      matches: [],
    },
  },

  // Scenario C — fully qualified, Ready for Match and available.
  {
    id: "TA-112",
    name: "Priya Shah",
    initials: "PS",
    email: "priya.shah@example.com",
    phone: "(312) 555-0311",
    role: "Reading & Math Tutor",
    program: "ECR Tutor",
    campus: "West Loop Campus",
    site: "Room 101 – West Loop",
    hours: "4 evenings/wk",
    submitted: "08/28/2026",
    completedDate: "09/25/2026",
    status: "approved",
    volunteerProgram: "ECR Tutor",
    stage: "Ready for Match",
    searchStatus: "Available",
    pgc: "approved",
    tutorType: "InKind",
    subPrograms: ["CB", "WB"],
    refsReceived: 3,
    refsTotal: 3,
    coordinator: "Megan",
    notes:
      "All required application, reference, training, orientation, and background requirements are complete. Applicant is ready for matching.",
    applicationDetails: {
      legalFirstName: "Priya",
      legalMiddleName: "Anita",
      legalLastName: "Shah",
      dateOfBirth: "07/19/1995",
      preferredPhone: "(312) 555-0311",
      streetAddress: "640 W Madison St, Unit 12B",
      city: "Chicago",
      state: "IL",
      zip: "60661",
      anticipatedLengthOfService: "1 Year",
      howDidYouHear: "Website",
      daysAvailable: ["Mon", "Tue", "Wed", "Thu"],
      personalStrengths:
        "Clear communicator, structured, and good at making reading and math approachable.",
      whyTutor:
        "Tutoring helped me as a student, and I want to give that same support to young people.",
      employmentStatus: "Employed Full Time",
      currentEmployer: "Lakeshore Analytics",
      employerContact: "HR Department · (312) 555-0350",
      jobTitle: "Data Analyst",
      profession: "Technology",
      lengthOfEmployment: "4 years",
      volunteerHistory:
        "Reading tutor with a city literacy nonprofit (2020–2025).",
      highestEducation: "Bachelor's Degree",
      mathProficiency: "Advanced",
      scienceProficiency: "Intermediate",
      subjectAreas: ["Reading", "Mathematics"],
      preferredAgeGroups: ["Middle School", "High School"],
      languagesFluent: [
        LANG_EN,
        { language: "Hindi", read: true, write: true, speak: true },
      ],
      positiveExperience:
        "Helped a reluctant reader finish their first chapter book over one semester.",
      handlingStruggles:
        "Switches to hands-on examples and lets the student choose the next activity.",
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "900-56-6178",
    },
    seed: {
      inactive: false,
      stageHistory: [
        { stage: "Not Started", date: "08/28/2026", user: "System" },
        { stage: "In Progress", date: "08/29/2026", user: "Nikki" },
        { stage: "Awaiting Background Check", date: "09/02/2026", user: "Nikki" },
        { stage: "References Under Review", date: "09/08/2026", user: "Swapnali" },
        { stage: "Needs Orientation", date: "09/12/2026", user: "Swapnali" },
        { stage: "Determination Pending", date: "09/18/2026", user: "Megan" },
        { stage: "Ready for Match", date: "09/25/2026", user: "Megan" },
      ],
      availability: [
        { campus: "West Loop Campus", day: "Monday", slot: "6:15–7:15 PM" },
        { campus: "Walsh Campus", day: "Tuesday", slot: "6:15–7:15 PM" },
        { campus: "Walsh Campus", day: "Wednesday", slot: "7:15–8:15 PM" },
        { campus: "West Loop Campus", day: "Thursday", slot: "6:15–7:15 PM" },
      ],
      documents: {
        "doc-bgc": "complete",
        "doc-cants": "complete",
        "doc-attest": "complete",
        "doc-confid": "complete",
        "doc-ethics": "complete",
        "doc-publicity": "complete",
        "doc-pgc": "approved",
        "doc-dcfs": "approved",
      },
      references: [
        { name: "Lauren Brooks", relationship: "Former Supervisor", email: "lauren.brooks@example.com", phone: "(312) 555-0391", status: "submitted" },
        { name: "Kevin Park", relationship: "Colleague", email: "kevin.park@example.com", phone: "(312) 555-0392", status: "submitted" },
        { name: "Denise Howard", relationship: "Volunteer Coordinator", email: "denise.howard@example.com", phone: "(312) 555-0393", status: "submitted" },
      ],
      checks: { background: "passed", orientation: "passed" },
      matches: [],
    },
  },

  // Scenarios D–F — approved tutor who is temporarily inactive. Keeps one
  // Active match so the Inactive confirmation workflow can end it.
  {
    id: "TA-113",
    name: "Marcus Johnson",
    initials: "MJ",
    email: "marcus.johnson@example.com",
    phone: "(312) 555-0411",
    role: "Science Tutor",
    program: "ECR Tutor",
    campus: "Walsh Campus",
    site: "Room 204 – Walsh",
    hours: "2 evenings/wk",
    submitted: "08/15/2026",
    completedDate: "09/12/2026",
    status: "approved",
    volunteerProgram: "ECR Tutor",
    stage: "Ready for Match",
    searchStatus: "Inactive",
    pgc: "approved",
    tutorType: "Title 1",
    subPrograms: ["SB"],
    refsReceived: 3,
    refsTotal: 3,
    coordinator: "Nikki",
    notes:
      "Tutor is temporarily unavailable due to work schedule conflict. Application remains approved and Ready for Match.",
    applicationDetails: {
      legalFirstName: "Marcus",
      legalMiddleName: "Allen",
      legalLastName: "Johnson",
      dateOfBirth: "05/02/1990",
      preferredPhone: "(312) 555-0411",
      streetAddress: "11030 S Western Ave",
      city: "Chicago",
      state: "IL",
      zip: "60643",
      anticipatedLengthOfService: "2 Years",
      howDidYouHear: "Friend / Family",
      daysAvailable: ["Tue", "Thu"],
      personalStrengths:
        "Calm, consistent, and skilled at explaining science concepts with everyday examples.",
      whyTutor:
        "I want to show students that science is something they can be good at.",
      employmentStatus: "Employed Full Time",
      currentEmployer: "Midwest Health Labs",
      employerContact: "HR Department · (312) 555-0450",
      jobTitle: "Lab Technician",
      profession: "Healthcare",
      lengthOfEmployment: "6 years",
      volunteerHistory:
        "Science fair judge and mentor for local middle schools (2021–2026).",
      highestEducation: "Bachelor's Degree",
      mathProficiency: "Intermediate",
      scienceProficiency: "Advanced",
      subjectAreas: ["Science", "Biology"],
      preferredAgeGroups: ["Middle School"],
      languagesFluent: [LANG_EN],
      positiveExperience:
        "Coached a student team that placed at the regional science fair.",
      handlingStruggles:
        "Connects the topic to the student's interests and keeps sessions hands-on.",
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "900-78-3307",
    },
    seed: {
      inactive: true,
      stageHistory: [
        { stage: "Not Started", date: "08/15/2026", user: "System" },
        { stage: "In Progress", date: "08/17/2026", user: "Nikki" },
        { stage: "Awaiting Background Check", date: "08/20/2026", user: "Nikki" },
        { stage: "References Under Review", date: "08/27/2026", user: "Nikki" },
        { stage: "Needs Orientation", date: "09/02/2026", user: "Nikki" },
        { stage: "Determination Pending", date: "09/08/2026", user: "Nikki" },
        { stage: "Ready for Match", date: "09/12/2026", user: "Nikki" },
      ],
      availability: [
        { campus: "Walsh Campus", day: "Tuesday", slot: "6:15–7:15 PM" },
        { campus: "Walsh Campus", day: "Thursday", slot: "6:15–7:15 PM" },
      ],
      documents: {
        "doc-bgc": "complete",
        "doc-cants": "complete",
        "doc-attest": "complete",
        "doc-confid": "complete",
        "doc-ethics": "complete",
        "doc-publicity": "complete",
        "doc-pgc": "approved",
        "doc-dcfs": "approved",
      },
      references: [
        { name: "Teresa Gomez", relationship: "Former Supervisor", email: "teresa.gomez@example.com", phone: "(312) 555-0491", status: "submitted" },
        { name: "Brian Foster", relationship: "Colleague", email: "brian.foster@example.com", phone: "(312) 555-0492", status: "submitted" },
        { name: "Alicia Moore", relationship: "Community Leader", email: "alicia.moore@example.com", phone: "(312) 555-0493", status: "submitted" },
      ],
      checks: { background: "passed", orientation: "passed" },
      matches: [
        {
          id: "TM-113-1",
          youth: "Jordan Williams",
          program: "Walsh-Morgan Park",
          startDate: "09/15/2026",
          endDate: null,
          endTime: null,
          status: "Active",
        },
      ],
    },
  },

  // Scenario G — failed requirements; stays Determination Pending (no
  // auto-reject: seeded failures never trigger the Closed/Rejected flow).
  {
    id: "TA-114",
    name: "Emily Carter",
    initials: "EC",
    email: "emily.carter@example.com",
    phone: "(312) 555-0511",
    role: "Reading Tutor",
    program: "ECR Tutor",
    campus: "West Loop Campus",
    site: "Room 101 – West Loop",
    hours: "1 evening/wk",
    submitted: "09/01/2026",
    completedDate: null,
    status: "under-review",
    volunteerProgram: "ECR Tutor",
    stage: "Determination Pending",
    searchStatus: "Available",
    pgc: "rejected",
    tutorType: "InKind",
    subPrograms: ["WB"],
    refsReceived: 1,
    refsTotal: 3,
    coordinator: "Swapnali",
    notes:
      "Application requires further review. Background check and PGC Training requirements have not passed.",
    applicationDetails: {
      legalFirstName: "Emily",
      legalMiddleName: "Rose",
      legalLastName: "Carter",
      dateOfBirth: "12/03/1998",
      preferredPhone: "(312) 555-0511",
      streetAddress: "1717 W Jackson Blvd",
      city: "Chicago",
      state: "IL",
      zip: "60612",
      anticipatedLengthOfService: "6 Months",
      howDidYouHear: "Social Media",
      daysAvailable: ["Wed"],
      personalStrengths:
        "Creative and enthusiastic about reading and storytelling.",
      whyTutor:
        "I enjoy sharing my love of books and want to help students read with confidence.",
      employmentStatus: "Employed Part Time",
      currentEmployer: "Westside Bookshop",
      employerContact: "Store Manager · (312) 555-0550",
      jobTitle: "Sales Associate",
      profession: "Retail",
      lengthOfEmployment: "1 year",
      volunteerHistory: "None reported.",
      highestEducation: "Some College",
      mathProficiency: "Basic",
      scienceProficiency: "Basic",
      subjectAreas: ["Reading", "English"],
      preferredAgeGroups: ["Elementary School"],
      languagesFluent: [LANG_EN],
      positiveExperience:
        "Ran a weekly story time for younger cousins and neighbors.",
      handlingStruggles:
        "Lets the student pick the book and reads alongside them until they are comfortable.",
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "900-90-2245",
    },
    seed: {
      inactive: false,
      stageHistory: [
        { stage: "Not Started", date: "09/01/2026", user: "System" },
        { stage: "In Progress", date: "09/03/2026", user: "Swapnali" },
        { stage: "Awaiting Background Check", date: "09/08/2026", user: "Swapnali" },
        { stage: "References Under Review", date: "09/15/2026", user: "Swapnali" },
        { stage: "Determination Pending", date: "09/26/2026", user: "Swapnali" },
      ],
      availability: [
        { campus: "West Loop Campus", day: "Wednesday", slot: "6:15–7:15 PM" },
      ],
      documents: {
        "doc-bgc": "complete",
        "doc-cants": "complete",
        "doc-attest": "complete",
        "doc-confid": "complete",
        "doc-ethics": "complete",
        "doc-publicity": "complete",
        "doc-pgc": "rejected",
        "doc-dcfs": "pending",
      },
      references: [
        { name: "Nora Patel", relationship: "Former Supervisor", email: "nora.patel@example.com", phone: "(312) 555-0591", status: "submitted" },
        { name: "Chris Allen", relationship: "Colleague", email: "chris.allen@example.com", phone: "(312) 555-0592", status: "awaiting" },
        { name: "Grace Kim", relationship: "Personal Reference", email: "grace.kim@example.com", phone: "(312) 555-0593", status: "awaiting" },
      ],
      checks: { background: "failed", orientation: "pending" },
      matches: [],
    },
  },
];

export function getTutorApplicantById(
  id: string,
): TutorApplicant | undefined {
  return MOCK_TUTOR_APPLICANTS.find((a) => a.id === id);
}