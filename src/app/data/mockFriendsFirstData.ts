// Shared data for the Friends First section: Applications, Mentor Search,
// Mentee Search, and Mentee Referral all read/write through here. Mentor
// application status reuses the same 5-value status already defined for
// Tutor (VMS uses the identical AppStatus enum for both programs).
import {
  STATUS_LABEL,
  STATUS_BADGE_VARIANT,
  type TutorApplicantStatus as FFApplicantStatus,
  type BadgeVariant,
} from "./mockTutorApplicantData";
import {
  FF_MATCH_ACTIVITY_TYPES,
  FF_MATCH_MEETING_METHODS,
} from "./ffMatchActivityConfig";

// Checklist / document / reference row shapes for the Friends First mentor
// record. These were previously shared with the Tutor record; Tutor now keeps
// its own (tutorApplicantStore.ts), so Friends First owns the original shapes.
export type CheckResult =
  "passed" | "failed" | "pending" | "n/a";
export type CheckStatus = "complete" | "incomplete" | "failed";

interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  status: CheckStatus;
  result: CheckResult;
  date?: string;
  note?: string;
}

export type DocType = "e-signature" | "upload";
export type DocStatus = "complete" | "pending" | "missing";

interface DocumentRow {
  id: string;
  name: string;
  type: DocType;
  category: string;
  date: string | null;
  status: DocStatus;
  fileLabel?: string;
}

export type RefStatus = "submitted" | "awaiting" | "declined";

interface ReferenceRecord {
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

export type {
  FFApplicantStatus,
  BadgeVariant,
  ChecklistItem,
  DocumentRow,
  ReferenceRecord,
};
export { STATUS_LABEL, STATUS_BADGE_VARIANT };

// ─── Sub-programme ──────────────────────────────────────────────────────────

export type FFSubProgramme =
  "Community-Based" | "Work-Based" | "School-Based";

export const SUB_PROGRAMME_ABBR: Record<
  FFSubProgramme,
  string
> = {
  "Community-Based": "CB",
  "Work-Based": "WB",
  "School-Based": "SB",
};

export const SUB_PROGRAMME_BADGE_VARIANT: Record<
  FFSubProgramme,
  BadgeVariant
> = {
  "Community-Based": "success",
  "Work-Based": "warning",
  "School-Based": "info",
};

export const SUB_PROGRAMMES: FFSubProgramme[] = [
  "Community-Based",
  "Work-Based",
  "School-Based",
];

// ─── Mentor pipeline ────────────────────────────────────────────────────────

export const FF_MENTOR_STAGES = [
  "Application Received",
  "References Pending",
  "Background Check",
  "Psychological Screening",
  "Training",
  "Matched",
  "Active",
  "On Hold",
  "Closed",
] as const;
export type FFMentorStage = (typeof FF_MENTOR_STAGES)[number];

export const FF_MENTOR_STAGE_BADGE_VARIANT: Record<
  FFMentorStage,
  BadgeVariant
> = {
  "Application Received": "neutral",
  "References Pending": "warning",
  "Background Check": "warning",
  "Psychological Screening": "warning",
  Training: "info",
  Matched: "accent",
  Active: "success",
  "On Hold": "neutral",
  Closed: "error",
};

// Only mentors at these stages surface in Mentor Search — mirrors VMS's own
// business rule that Search finds already-onboarded mentors, not applicants.
export const FF_MENTOR_SEARCH_STAGES: FFMentorStage[] = [
  "Active",
  "Matched",
];

export const FF_STATUS_TO_STAGE: Record<
  FFApplicantStatus,
  number
> = {
  pending: 0,
  "under-review": 2,
  approved: 6, // Active
  waitlisted: 1, // References Pending
  inactive: 8, // Closed
};

// ─── Mentee pipeline ────────────────────────────────────────────────────────

export const FF_MENTEE_STAGES = [
  "Referral Received",
  "Under Review",
  "Intake Scheduled",
  "Guardian Intake Complete",
  "Youth Intake Complete",
  "Ready for Match",
  "Matched",
  "Active",
] as const;
export type FFMenteeStage = (typeof FF_MENTEE_STAGES)[number];

export const FF_MENTEE_STAGE_BADGE_VARIANT: Record<
  FFMenteeStage,
  BadgeVariant
> = {
  "Referral Received": "info",
  "Under Review": "warning",
  "Intake Scheduled": "accent",
  "Guardian Intake Complete": "success",
  "Youth Intake Complete": "success",
  "Ready for Match": "success",
  Matched: "accent",
  Active: "success",
};

// ─── Mentor: application details / profile / matching preferences ─────────

export interface FFApplicationDetails {
  legalFirstName: string;
  legalMiddleName?: string;
  legalLastName: string;
  dateOfBirth: string;
  preferredPhone: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  occupation: string;
  employer: string;
  howDidYouHear: string;
  anticipatedLengthOfService: string;
  whyMentor: string;
  volunteerHistory: string;
  languagesFluent: string[];
  convictedOfCrime: string;
  ssn?: string;
}

export interface FFMentorProfileData {
  hometown: string;
  hobbies: string[];
  favouriteChicagoActivity: string;
  favouriteFood: string;
  favouriteBook: string;
  favouriteMusic: string;
  lovedAsAKid: string;
  looksForwardTo: string;
  funFact: string;
}

export interface FFMatchingPreferences {
  transportationMethods: string[];
  commuteDistance: string;
  areasWillingToTravel: string[];
  agePreferences: {
    preferred: string[];
    open: string[];
    notPreferred: string[];
  };
  rankedPreferences: {
    rank: number;
    label: string;
    note: string;
  }[];
  hopedInCommon: string[];
}

// ─── Match & Activity (Community-Based) ────────────────────────────────────

export type EngagementRating = 1 | 2 | 3 | 4 | 5;

export interface FFActivityRow {
  id: string;
  date: string;
  type: string;
  duration: number;
  engMentor: EngagementRating;
  engMentee: EngagementRating;
  meetMethod: string;
  notes: string;
  happened: "yes" | "no" | "partial";
}

// One configured source for activity options (US 20039 Chunk 11).
export const FF_ACTIVITY_TYPES: string[] = [
  ...FF_MATCH_ACTIVITY_TYPES,
];

export const FF_MEET_METHODS: string[] = [
  ...FF_MATCH_MEETING_METHODS,
];

// ─── Match & Activity (Work-Based / School-Based attendance) ──────────────

export type AttendanceStatus =
  "present" | "absent" | "cancelled" | "pending";

export const ATTENDANCE_LABEL: Record<
  AttendanceStatus,
  string
> = {
  present: "Present",
  absent: "Absent",
  cancelled: "Cancelled",
  pending: "Pending",
};

export const ATTENDANCE_BADGE_VARIANT: Record<
  AttendanceStatus,
  BadgeVariant
> = {
  present: "success",
  absent: "error",
  cancelled: "neutral",
  pending: "warning",
};

export interface AttendanceSession {
  id: string;
  date: string;
  status: AttendanceStatus;
  duration: number;
  note: string;
}

export interface AttendanceWeek {
  week: string;
  sessions: AttendanceSession[];
}

// ─── Mentor record ──────────────────────────────────────────────────────────

export interface FFMentor {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  subProgramme: FFSubProgramme;
  status: FFApplicantStatus;
  stage: FFMentorStage;
  startDate: string;
  coordinator: string;
  notes: string;
  applicationDetails: FFApplicationDetails;
  profile: FFMentorProfileData;
  matchingPreferences?: FFMatchingPreferences;
}

export const MOCK_FF_MENTORS: FFMentor[] = [
  {
    id: "FF-CB-101",
    name: "Angela Moretti",
    initials: "AM",
    email: "a.moretti@gmail.com",
    phone: "(312) 555-0142",
    subProgramme: "Community-Based",
    status: "approved",
    stage: "Active",
    startDate: "01/08/2025",
    coordinator: "D. Reyes",
    notes:
      "Consistently high engagement. Great fit for a younger mentee.",
    applicationDetails: {
      legalFirstName: "Angela",
      legalLastName: "Moretti",
      dateOfBirth: "04/11/1991",
      preferredPhone: "(312) 555-0142",
      streetAddress: "1140 W Belmont Ave",
      city: "Chicago",
      state: "Illinois",
      zip: "60657",
      occupation: "Marketing Coordinator",
      employer: "Lakeview Creative Co.",
      howDidYouHear: "Mercy Home website",
      anticipatedLengthOfService: "1+ years",
      whyMentor:
        "Wants to be a steady, consistent presence for a young person the way a coach was for her growing up.",
      volunteerHistory:
        "Big Brothers Big Sisters volunteer, 2019–2021.",
      languagesFluent: ["English", "Italian"],
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "528-71-4390",
    },
    profile: {
      hometown: "Oak Park, IL",
      hobbies: ["Painting", "Hiking", "Board games"],
      favouriteChicagoActivity:
        "Wandering the Art Institute on a slow Sunday.",
      favouriteFood: "Deep dish, unapologetically.",
      favouriteBook: "The Alchemist",
      favouriteMusic: "Indie folk and 90s R&B.",
      lovedAsAKid:
        "Building elaborate blanket forts and drawing comics.",
      looksForwardTo:
        "Introducing a mentee to museums and art she loves.",
      funFact:
        "Once ran a half-marathon dressed as a taco for charity.",
    },
    matchingPreferences: {
      transportationMethods: ["Personal vehicle", "CTA"],
      commuteDistance: "Up to 10 miles",
      areasWillingToTravel: [
        "Lincoln Park",
        "Logan Square",
        "Lakeview",
        "Downtown",
      ],
      agePreferences: {
        preferred: ["10-12"],
        open: ["8-9", "13-14"],
        notPreferred: ["15+"],
      },
      rankedPreferences: [
        {
          rank: 1,
          label: "Shared interest in art or creativity",
          note: "Mentor is a working artist in her free time.",
        },
        {
          rank: 2,
          label: "Consistent weekly availability",
          note: "Prefers Saturday mornings.",
        },
        {
          rank: 3,
          label: "Similar communication style",
          note: "Comfortable with a quieter, thoughtful mentee.",
        },
      ],
      hopedInCommon: [
        "An interest in creative projects",
        "Enjoys being outdoors",
        "Curious and asks a lot of questions",
      ],
    },
  },
  {
    id: "FF-CB-102",
    name: "Marcus Delacroix",
    initials: "MD",
    email: "marcusd@outlook.com",
    phone: "(312) 555-0187",
    subProgramme: "Community-Based",
    status: "approved",
    stage: "Matched",
    startDate: "02/03/2025",
    coordinator: "D. Reyes",
    notes:
      "Matched in March; check-ins have been very positive.",
    applicationDetails: {
      legalFirstName: "Marcus",
      legalLastName: "Delacroix",
      dateOfBirth: "09/02/1988",
      preferredPhone: "(312) 555-0187",
      streetAddress: "220 S Racine Ave",
      city: "Chicago",
      state: "Illinois",
      zip: "60607",
      occupation: "Civil Engineer",
      employer: "Midwest Structural Group",
      howDidYouHear: "Colleague or coworker",
      anticipatedLengthOfService: "1+ years",
      whyMentor:
        "Had a mentor in college who changed his trajectory; wants to pay it forward.",
      volunteerHistory: "Youth basketball coach for 4 seasons.",
      languagesFluent: ["English"],
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "528-71-4390",
    },
    profile: {
      hometown: "Gary, IN",
      hobbies: ["Basketball", "Woodworking", "Cooking"],
      favouriteChicagoActivity:
        "Pickup basketball at the park.",
      favouriteFood: "His grandmother's gumbo recipe.",
      favouriteBook: "Between the World and Me",
      favouriteMusic: "Jazz and hip-hop.",
      lovedAsAKid:
        "Taking things apart to see how they worked.",
      looksForwardTo:
        "Teaching a mentee to build something with his hands.",
      funFact:
        "Built his own dining table from reclaimed wood.",
    },
    matchingPreferences: {
      transportationMethods: ["Personal vehicle"],
      commuteDistance: "Up to 15 miles",
      areasWillingToTravel: [
        "West Loop",
        "Pilsen",
        "Bridgeport",
      ],
      agePreferences: {
        preferred: ["11-13"],
        open: ["14-15"],
        notPreferred: ["8-10"],
      },
      rankedPreferences: [
        {
          rank: 1,
          label: "Interest in sports",
          note: "Especially basketball.",
        },
        {
          rank: 2,
          label: "Hands-on / builder mindset",
          note: "Enjoys teaching practical skills.",
        },
        {
          rank: 3,
          label: "Weekend availability",
          note: "Works standard weekday hours.",
        },
      ],
      hopedInCommon: [
        "Enjoys sports",
        "Curious about how things work",
      ],
    },
  },
  {
    id: "FF-CB-103",
    name: "Priya Krishnamurthy",
    initials: "PK",
    email: "p.krish@yahoo.com",
    phone: "(773) 555-0119",
    subProgramme: "Community-Based",
    status: "under-review",
    stage: "Background Check",
    startDate: "03/17/2025",
    coordinator: "L. Okonkwo",
    notes:
      "Background check initiated; references already returned positively.",
    applicationDetails: {
      legalFirstName: "Priya",
      legalLastName: "Krishnamurthy",
      dateOfBirth: "12/20/1994",
      preferredPhone: "(773) 555-0119",
      streetAddress: "5310 S Kimbark Ave",
      city: "Chicago",
      state: "Illinois",
      zip: "60615",
      occupation: "Pediatric Nurse",
      employer: "University of Chicago Medicine",
      howDidYouHear: "Community event",
      anticipatedLengthOfService: "6–12 months",
      whyMentor:
        "Works with kids professionally and wants to build a longer-term relationship outside a clinical setting.",
      volunteerHistory:
        "Hospital volunteer reading program, 2 years.",
      languagesFluent: ["English", "Tamil", "Hindi"],
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "528-71-4390",
    },
    profile: {
      hometown: "Naperville, IL",
      hobbies: ["Reading", "Yoga", "Baking"],
      favouriteChicagoActivity: "Farmers markets in Hyde Park.",
      favouriteFood: "Her mom's biryani.",
      favouriteBook: "The Immortal Life of Henrietta Lacks",
      favouriteMusic: "Classical and Bollywood soundtracks.",
      lovedAsAKid:
        "Reading under the covers with a flashlight.",
      looksForwardTo:
        "Sharing her love of books with a mentee.",
      funFact: "Ran the Chicago marathon in 2023.",
    },
    matchingPreferences: {
      transportationMethods: ["CTA", "Rideshare"],
      commuteDistance: "Up to 8 miles",
      areasWillingToTravel: [
        "Hyde Park",
        "Woodlawn",
        "Bronzeville",
      ],
      agePreferences: {
        preferred: ["8-10"],
        open: ["11-12"],
        notPreferred: ["15+"],
      },
      rankedPreferences: [
        {
          rank: 1,
          label: "Shared love of reading",
          note: "Would love a mentee who enjoys books.",
        },
        {
          rank: 2,
          label: "Weekday evening availability",
          note: "Works rotating shifts, needs flexibility.",
        },
      ],
      hopedInCommon: [
        "Enjoys reading",
        "Interested in health/science",
      ],
    },
  },
  {
    id: "FF-WB-101",
    name: "Janelle Hutchinson",
    initials: "JH",
    email: "jhutch@corporatehq.com",
    phone: "(312) 555-0271",
    subProgramme: "Work-Based",
    status: "approved",
    stage: "Active",
    startDate: "02/14/2025",
    coordinator: "M. Callahan",
    notes: "Hosts weekly job-shadowing sessions at her office.",
    applicationDetails: {
      legalFirstName: "Janelle",
      legalLastName: "Hutchinson",
      dateOfBirth: "06/09/1985",
      preferredPhone: "(312) 555-0271",
      streetAddress: "233 S Wacker Dr",
      city: "Chicago",
      state: "Illinois",
      zip: "60606",
      occupation: "HR Director",
      employer: "Corporate HQ Solutions",
      howDidYouHear: "Referred by current volunteer",
      anticipatedLengthOfService: "1+ years",
      whyMentor:
        "Wants to expose a teen to a professional office environment early.",
      volunteerHistory:
        "Career day speaker at local high schools.",
      languagesFluent: ["English"],
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "528-71-4390",
    },
    profile: {
      hometown: "Evanston, IL",
      hobbies: ["Golf", "Wine tasting", "Travel"],
      favouriteChicagoActivity: "Rooftop dinners downtown.",
      favouriteFood: "Sushi.",
      favouriteBook: "Lean In",
      favouriteMusic: "R&B classics.",
      lovedAsAKid:
        "Running her own neighborhood lemonade-stand empire.",
      looksForwardTo:
        "Showing a mentee what a career path in HR/business looks like.",
      funFact: "Has visited 20 countries.",
    },
  },
  {
    id: "FF-WB-102",
    name: "Richard Osei",
    initials: "RO",
    email: "r.osei@techworks.io",
    phone: "(312) 555-0304",
    subProgramme: "Work-Based",
    status: "approved",
    stage: "Matched",
    startDate: "01/27/2025",
    coordinator: "M. Callahan",
    notes:
      "Matched with a mentee interested in software engineering.",
    applicationDetails: {
      legalFirstName: "Richard",
      legalLastName: "Osei",
      dateOfBirth: "03/30/1990",
      preferredPhone: "(312) 555-0304",
      streetAddress: "600 W Chicago Ave",
      city: "Chicago",
      state: "Illinois",
      zip: "60654",
      occupation: "Software Engineer",
      employer: "TechWorks Inc.",
      howDidYouHear: "Mercy Home website",
      anticipatedLengthOfService: "1+ years",
      whyMentor:
        "First-generation college graduate who wants to open doors in tech for youth who don't see a path in.",
      volunteerHistory:
        "Coding workshop volunteer, CoderDojo Chicago.",
      languagesFluent: ["English", "Twi"],
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "528-71-4390",
    },
    profile: {
      hometown: "Chicago, IL",
      hobbies: ["Coding side-projects", "Chess", "Soccer"],
      favouriteChicagoActivity:
        "Pickup soccer at Ping Tom Park.",
      favouriteFood: "Jollof rice.",
      favouriteBook: "Clean Code",
      favouriteMusic: "Afrobeats.",
      lovedAsAKid:
        "Taking apart the family computer, much to his parents' dismay.",
      looksForwardTo:
        "Showing a mentee that a tech career is within reach.",
      funFact: "Built his first website at age 12.",
    },
  },
  {
    id: "FF-SB-101",
    name: "Yasmin Castellano",
    initials: "YC",
    email: "ycastellano@cps.edu",
    phone: "(773) 555-0412",
    subProgramme: "School-Based",
    status: "approved",
    stage: "Active",
    startDate: "01/15/2025",
    coordinator: "L. Okonkwo",
    notes:
      "Meets her mentee weekly during lunch period at the school site.",
    applicationDetails: {
      legalFirstName: "Yasmin",
      legalLastName: "Castellano",
      dateOfBirth: "07/18/1993",
      preferredPhone: "(773) 555-0412",
      streetAddress: "3120 W Fullerton Ave",
      city: "Chicago",
      state: "Illinois",
      zip: "60647",
      occupation: "School Counselor",
      employer: "Chicago Public Schools",
      howDidYouHear: "Colleague or coworker",
      anticipatedLengthOfService: "1+ years",
      whyMentor:
        "Sees students every day who could use one more consistent adult in their corner.",
      volunteerHistory:
        "After-school tutoring coordinator, 3 years.",
      languagesFluent: ["English", "Spanish"],
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "528-71-4390",
    },
    profile: {
      hometown: "Chicago, IL",
      hobbies: ["Journaling", "Salsa dancing", "Gardening"],
      favouriteChicagoActivity:
        "Sunday farmers market in Logan Square.",
      favouriteFood: "Tamales, homemade.",
      favouriteBook: "The House on Mango Street",
      favouriteMusic: "Salsa and bachata.",
      lovedAsAKid:
        "Putting on backyard plays for the neighborhood.",
      looksForwardTo:
        "Being a steady, familiar face a mentee can count on at school.",
      funFact:
        "Competed in salsa dance competitions in her 20s.",
    },
  },
  {
    id: "FF-SB-102",
    name: "Liam O'Sullivan",
    initials: "LO",
    email: "losullivan@proton.me",
    phone: "(312) 555-0558",
    subProgramme: "School-Based",
    status: "under-review",
    stage: "Psychological Screening",
    startDate: "04/08/2025",
    coordinator: "L. Okonkwo",
    notes:
      "Screening scheduled for next week; application otherwise complete.",
    applicationDetails: {
      legalFirstName: "Liam",
      legalLastName: "O'Sullivan",
      dateOfBirth: "10/05/1996",
      preferredPhone: "(312) 555-0558",
      streetAddress: "1801 N Milwaukee Ave",
      city: "Chicago",
      state: "Illinois",
      zip: "60647",
      occupation: "Graduate Student",
      employer: "Northwestern University",
      howDidYouHear: "Social media",
      anticipatedLengthOfService: "6–12 months",
      whyMentor:
        "Studying education policy and wants direct experience working with youth.",
      volunteerHistory: "Tutor at a community learning center.",
      languagesFluent: ["English"],
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "528-71-4390",
    },
    profile: {
      hometown: "Dublin, Ireland (moved to Chicago in 2019)",
      hobbies: ["Running", "Podcasts", "Trivia nights"],
      favouriteChicagoActivity: "Lakefront runs at sunrise.",
      favouriteFood:
        "Deep dish (still adjusting from Irish food).",
      favouriteBook: "Educated by Tara Westover",
      favouriteMusic: "Indie rock.",
      lovedAsAKid: "Organizing neighborhood scavenger hunts.",
      looksForwardTo:
        "Helping a student navigate the college application process.",
      funFact:
        "Ran his first marathon the year he moved to Chicago.",
    },
  },
  {
    id: "FF-CB-104",
    name: "Sophia Adeyemi",
    initials: "SA",
    email: "sadeyemi@proton.me",
    phone: "(312) 555-0673",
    subProgramme: "Community-Based",
    status: "waitlisted",
    stage: "References Pending",
    startDate: "05/12/2025",
    coordinator: "D. Reyes",
    notes:
      "Waitlisted — one of two references has not yet responded.",
    applicationDetails: {
      legalFirstName: "Sophia",
      legalLastName: "Adeyemi",
      dateOfBirth: "02/14/1997",
      preferredPhone: "(312) 555-0673",
      streetAddress: "4700 N Broadway",
      city: "Chicago",
      state: "Illinois",
      zip: "60640",
      occupation: "Graphic Designer",
      employer: "Freelance",
      howDidYouHear: "Mercy Home website",
      anticipatedLengthOfService: "6–12 months",
      whyMentor:
        "Wants a consistent weekly volunteer commitment that uses her creative skills.",
      volunteerHistory: "No prior formal mentoring experience.",
      languagesFluent: ["English", "Yoruba"],
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "528-71-4390",
    },
    profile: {
      hometown: "Chicago, IL",
      hobbies: ["Graphic design", "Photography", "Thrifting"],
      favouriteChicagoActivity:
        "Wandering Wicker Park vintage shops.",
      favouriteFood: "Jollof rice and plantains.",
      favouriteBook: "The Sellout",
      favouriteMusic: "Afrobeats and neo-soul.",
      lovedAsAKid: "Doodling on every surface she could find.",
      looksForwardTo:
        "Doing creative art projects with a mentee.",
      funFact:
        "Designed the logo for a local nonprofit pro bono.",
    },
    matchingPreferences: {
      transportationMethods: ["CTA"],
      commuteDistance: "Up to 6 miles",
      areasWillingToTravel: ["Uptown", "Edgewater", "Lakeview"],
      agePreferences: {
        preferred: ["9-11"],
        open: ["12-13"],
        notPreferred: [],
      },
      rankedPreferences: [
        {
          rank: 1,
          label: "Interest in art or design",
          note: "Would love to share creative projects.",
        },
      ],
      hopedInCommon: ["Enjoys art", "Curious and creative"],
    },
  },
  {
    id: "FF-WB-103",
    name: "Elena Sobieski",
    initials: "ES",
    email: "esobieski@gmail.com",
    phone: "(312) 555-0741",
    subProgramme: "Work-Based",
    status: "inactive",
    stage: "Closed",
    startDate: "10/14/2024",
    coordinator: "M. Callahan",
    notes:
      "Application closed — applicant relocated out of state before match.",
    applicationDetails: {
      legalFirstName: "Elena",
      legalLastName: "Sobieski",
      dateOfBirth: "05/25/1989",
      preferredPhone: "(312) 555-0741",
      streetAddress: "N/A — relocated",
      city: "Chicago",
      state: "Illinois",
      zip: "60601",
      occupation: "Financial Analyst",
      employer: "Formerly Sunrise Financial",
      howDidYouHear: "Community event",
      anticipatedLengthOfService: "6–12 months",
      whyMentor:
        "Wanted hands-on volunteer experience with youth interested in finance.",
      volunteerHistory: "Junior Achievement volunteer.",
      languagesFluent: ["English", "Polish"],
      convictedOfCrime: "No — confirmed by applicant",
      ssn: "528-71-4390",
    },
    profile: {
      hometown: "Chicago, IL",
      hobbies: ["Personal finance", "Running", "Cooking"],
      favouriteChicagoActivity:
        "N/A — application closed before onboarding.",
      favouriteFood: "Pierogi.",
      favouriteBook: "N/A",
      favouriteMusic: "N/A",
      lovedAsAKid: "N/A",
      looksForwardTo:
        "N/A — application closed before onboarding.",
      funFact: "N/A",
    },
  },
];

export function getFFMentorById(
  id: string,
): FFMentor | undefined {
  return MOCK_FF_MENTORS.find((m) => m.id === id);
}

// ─── Mentor onboarding checklist (8 real VMS items) ────────────────────────

export function defaultFFMentorChecklist(
  mentor: FFMentor,
): ChecklistItem[] {
  const advanced =
    mentor.stage === "Active" || mentor.stage === "Matched";
  const passed = (
    label: string,
    id: string,
    date?: string,
  ): ChecklistItem => ({
    id,
    label,
    required: true,
    status: "complete",
    result: "passed",
    date: date ?? mentor.startDate,
  });
  const pending = (
    label: string,
    id: string,
    note: string,
  ): ChecklistItem => ({
    id,
    label,
    required: true,
    status: "incomplete",
    result: "pending",
    note,
  });
  return [
    advanced
      ? passed("Fingerprinting", "fingerprinting")
      : pending(
          "Fingerprinting",
          "fingerprinting",
          "ISP/IDHS fingerprint appointment required.",
        ),
    advanced
      ? passed("CPI Assessment", "cpi")
      : pending(
          "CPI Assessment",
          "cpi",
          "Child Protection Investigation screening initiated with Sterling Volunteers.",
        ),
    passed("Mentor Profile Complete", "mentor-profile"),
    advanced
      ? passed("Mentor Training", "mentor-training")
      : pending(
          "Mentor Training",
          "mentor-training",
          "Registered for the next available training cohort.",
        ),
    advanced
      ? passed("PGC Training", "pgc")
      : pending(
          "PGC Training",
          "pgc",
          "Protecting God's Children training — online module not yet completed.",
        ),
    advanced
      ? passed("DCFS Mandated Reporter", "dcfs")
      : pending(
          "DCFS Mandated Reporter",
          "dcfs",
          "Certificate must be dated within the last 3 years — not yet uploaded.",
        ),
    advanced
      ? passed("Background and Driving Check", "background")
      : pending(
          "Background and Driving Check",
          "background",
          "MVR and national criminal background check in progress.",
        ),
  ];
}

// ─── Mentor documents ───────────────────────────────────────────────────────

export function defaultFFMentorDocuments(
  mentor: FFMentor,
): DocumentRow[] {
  const signed = mentor.status !== "pending";
  const cleared =
    mentor.stage === "Active" || mentor.stage === "Matched";
  return [
    {
      id: "doc-1",
      name: "Background Check Consent",
      type: "e-signature",
      category: "Consent",
      date: signed ? mentor.startDate : null,
      status: signed ? "complete" : "pending",
      fileLabel: signed ? "Signed electronically" : undefined,
    },
    {
      id: "doc-2",
      name: "Volunteer Attestation",
      type: "e-signature",
      category: "Consent",
      date: signed ? mentor.startDate : null,
      status: signed ? "complete" : "pending",
      fileLabel: signed ? "Signed electronically" : undefined,
    },
    {
      id: "doc-3",
      name: "PGC Training Certificate",
      type: "upload",
      category: "Training",
      date: cleared ? mentor.startDate : null,
      status: cleared ? "complete" : "missing",
      fileLabel: cleared
        ? `PGC_Certificate_${mentor.id}.pdf`
        : undefined,
    },
    {
      id: "doc-4",
      name: "DCFS Mandated Reporter Certificate",
      type: "upload",
      category: "Training",
      date: cleared ? mentor.startDate : null,
      status: cleared ? "complete" : "missing",
      fileLabel: cleared
        ? `DCFS_Certificate_${mentor.id}.pdf`
        : undefined,
    },
  ];
}

// ─── References ─────────────────────────────────────────────────────────────

export function defaultFFReferences(
  mentor: FFMentor,
): ReferenceRecord[] {
  const advanced = mentor.stage !== "Application Received";
  return [
    {
      id: `${mentor.id}-ref-1`,
      name: "Patricia Alvarez",
      relationship: "Former Supervisor",
      email: "p.alvarez@example.org",
      phone: "(312) 555-0110",
      status: "submitted",
      sentDate: mentor.startDate,
      submittedDate: mentor.startDate,
      notes:
        "Direct supervisor for two years; strongly recommends.",
    },
    {
      id: `${mentor.id}-ref-2`,
      name: "Jordan Blake",
      relationship: "Colleague",
      email: "jordan.blake@example.com",
      phone: "(773) 555-0142",
      status: advanced ? "submitted" : "awaiting",
      sentDate: mentor.startDate,
      submittedDate: advanced ? mentor.startDate : undefined,
      notes:
        "Worked together on a community outreach initiative.",
    },
  ];
}

// ─── Match & Activity ───────────────────────────────────────────────────────

export function defaultFFActivities(
  mentor: FFMentor,
): FFActivityRow[] {
  if (mentor.subProgramme !== "Community-Based") return [];
  return [
    {
      id: `${mentor.id}-a1`,
      date: "05/04/2026",
      type: "Library Visit",
      duration: 2,
      engMentor: 4,
      engMentee: 4,
      meetMethod: "In-person",
      happened: "yes",
      notes:
        "Worked on a school project together. Great focus.",
    },
    {
      id: `${mentor.id}-a2`,
      date: "04/20/2026",
      type: "Museum Visit",
      duration: 3,
      engMentor: 5,
      engMentee: 5,
      meetMethod: "In-person",
      happened: "yes",
      notes:
        "Art Institute — mentee was captivated by the modern art wing.",
    },
    {
      id: `${mentor.id}-a3`,
      date: "04/05/2026",
      type: "Phone Check-in",
      duration: 0.5,
      engMentor: 4,
      engMentee: 3,
      meetMethod: "Phone",
      happened: "partial",
      notes:
        "Brief call — weather prevented the planned outing.",
    },
  ];
}

export function defaultFFAttendance(
  mentor: FFMentor,
): AttendanceWeek[] {
  if (mentor.subProgramme === "Community-Based") return [];
  return [
    {
      week: "Week of May 5",
      sessions: [
        {
          id: `${mentor.id}-s1`,
          date: "05/07/2026",
          status: "present",
          duration: 1.5,
          note: "Career exploration Q&A session.",
        },
        {
          id: `${mentor.id}-s2`,
          date: "05/09/2026",
          status: "cancelled",
          duration: 0,
          note: "Site closed for maintenance.",
        },
      ],
    },
    {
      week: "Week of Apr 28",
      sessions: [
        {
          id: `${mentor.id}-s3`,
          date: "04/29/2026",
          status: "present",
          duration: 1,
          note: "Job shadowing — morning session.",
        },
        {
          id: `${mentor.id}-s4`,
          date: "05/01/2026",
          status: "present",
          duration: 1.5,
          note: "Goal-setting workbook completed.",
        },
      ],
    },
    {
      week: "Week of Apr 21",
      sessions: [
        {
          id: `${mentor.id}-s5`,
          date: "04/22/2026",
          status: "absent",
          duration: 0,
          note: "Mentee absent — school conflict.",
        },
        {
          id: `${mentor.id}-s6`,
          date: "04/24/2026",
          status: "pending",
          duration: 0,
          note: "",
        },
      ],
    },
  ];
}

// ─── Mentee record ──────────────────────────────────────────────────────────

export const FF_TRANSPORTATION_OPTIONS = [
  "Parent / Guardian",
  "Self-Transportation",
  "Public Transportation",
  "School Transportation",
  "Mentor Transportation",
  "Transportation Assistance Required",
  "Other",
] as const;

// Youth Availability is stored as "Day|Time" keys (e.g. "Mon|Afternoon") —
// same string-key shape as the tutor availability grid.
export const FF_AVAILABILITY_DAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;
export const FF_AVAILABILITY_TIMES = [
  "Morning",
  "Afternoon",
  "Evening",
] as const;
export const ffAvailabilityKey = (day: string, time: string) =>
  `${day}|${time}`;

export interface FFAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

/** One row of an intake grid (Youth Contact Information, Medications…).
 *  `id` is stable so edits and removals never shift other rows. */
export interface FFGridRow {
  id: string;
  [column: string]: string;
}

// US 20040 detailed questionnaire. Question answers live in `answers`, keyed
// by the stable question keys in ffMenteeIntake.ts; grids live in `grids`.
// The older summary fields (whyMentoring, concernsExpectations, the youth
// textareas, relationship) are kept as-is so earlier saved responses stay
// readable — they are never split or copied into the new questions.
export interface FFGuardianIntake {
  guardianName: string;
  /** Legacy guardian-entered relationship; the referral's Relationship to
   *  Youth is shown on Mentee Process. */
  relationship: string;
  phone: string;
  email: string;
  address: FFAddress;
  /** Legacy summary answer (pre-US 20040 form). */
  whyMentoring: string;
  youthAvailability: string[];
  /** Legacy summary answer (pre-US 20040 form). */
  concernsExpectations: string;
  answers?: Record<string, string>;
  grids?: Record<string, FFGridRow[]>;
}

export interface FFYouthIntake {
  /** Legacy summary answers (pre-US 20040 form). */
  educationHistory: string;
  interestsHobbies: string;
  structureBoundaries: string;
  specialNeeds: string;
  answers?: Record<string, string>;
  grids?: Record<string, FFGridRow[]>;
}

export interface FFIntakeParticipant {
  /** Stable identity, e.g. "mentee:MT-101", "guardian:MT-101". */
  id: string;
  label: string;
}

/** Intake Connection (Schedule Intake grid), owned by one mentee. */
export interface FFIntakeConnection {
  id: string;
  menteeId: string;
  startDate: string; // MM/DD/YYYY
  startTime: string; // h:mm AM/PM
  endDate: string;
  endTime: string;
  location: string;
  participants: FFIntakeParticipant[];
  attended: boolean;
}

/** Document checklist completion, keyed by stable document id. */
export interface FFDocumentStatus {
  complete: boolean;
  /** Local timestamp of the last change (prototype; not an audit log). */
  updatedAt: string;
}

/** Saved Mentee Referral — the record a mentee's Referral Source looks up. */
export interface FFReferralRecord extends FFReferralForm {
  id: string;
  /** MM/DD/YYYY the referral was submitted; "" while still a draft. */
  submittedDate: string;
  // US 20002 fields. All optional: seeded and older saved referrals have
  // none of them and are normalized with empty defaults, never invented.
  status?: FFReferralStatus;
  /** User-entered Referral Date (MM/DD/YYYY) — distinct from submittedDate. */
  referralDate?: string;
  /** Every form answer, keyed by the stable keys in ffReferralDefinitions. */
  answers?: Record<string, string>;
  grids?: Record<string, FFGridRow[]>;
  detailsHistory?: FFReferralHistoryEntry[];
  /** Mentee created by Promote to Pipeline. */
  menteeId?: string | null;
  /** ISO timestamps of the actual events. */
  createdAt?: string | null;
  updatedAt?: string | null;
  submittedAt?: string | null;
  promotedAt?: string | null;
}

export type FFReferralStatus =
  "draft" | "submitted" | "promoted";

/** One successful save that changed Contact Details or Follow Up. */
export interface FFReferralHistoryEntry {
  id: string;
  /** Local "MM/DD/YYYY h:mm AM/PM" of the save. */
  savedAt: string;
  changes: {
    key: string;
    label: string;
    from: string;
    to: string;
  }[];
}

export interface FFMentee {
  id: string;
  name: string;
  initials: string;
  dob: string;
  gender: string;
  programme: FFSubProgramme;
  stage: FFMenteeStage;
  /** MM/DD/YYYY — set when the mentee is moved to Ready for Match. Shown on
   * Mentee Search only; null until the mentee first reaches that stage. */
  promotionDate: string | null;
  /** Linked Mentee Referral record, when the mentee came from one. */
  referralId?: string | null;
  /** Free-text source for mentees with no linked referral record. */
  referralSource: string;
  transportation: string;
  coordinator: string;
  intakeScheduledDate: string | null;
  guardianIntakeDate: string | null;
  youthIntakeDate: string | null;
  /** Mentee Process "Comments" (mandatory). New referrals seed it from the
   *  referral's staff recommendation. */
  notes: string;
  guardianIntake?: FFGuardianIntake | null;
  youthIntake?: FFYouthIntake | null;
  /** Temporarily unavailable for new matches. Independent of `stage`. */
  inactive?: boolean;
  /** Local timestamp of the last confirmed Inactive change. */
  inactiveChangedAt?: string | null;
  intakeConnections?: FFIntakeConnection[];
  documents?: Record<string, FFDocumentStatus>;
}

export const MOCK_FF_MENTEES: FFMentee[] = [
  {
    id: "MT-101",
    name: "Aiden Torres",
    initials: "AT",
    dob: "03/15/2013",
    gender: "Male",
    programme: "Community-Based",
    stage: "Matched",
    promotionDate: "09/02/2025",
    referralSource: "School",
    transportation: "Public Transportation",
    coordinator: "L. Chen",
    intakeScheduledDate: "09/10/2025",
    guardianIntakeDate: "09/12/2025",
    youthIntakeDate: "09/14/2025",
    notes:
      "Matched with Marcus Delacroix; first outing scheduled.",
    referralId: "RF-101",
    guardianIntake: {
      guardianName: "Maria Torres",
      relationship: "Parent / Guardian",
      phone: "(312) 555-0181",
      email: "maria.torres@example.com",
      address: {
        street: "1820 W Cermak Rd",
        city: "Chicago",
        state: "IL",
        zip: "60608",
      },
      whyMentoring:
        "Aiden needs a steady adult outside the family to build confidence.",
      youthAvailability: [
        "Tue|Afternoon",
        "Thu|Afternoon",
        "Sat|Morning",
      ],
      concernsExpectations:
        "Hopes the mentor can help with homework habits.",
    },
    youthIntake: {
      educationHistory:
        "6th grade at Whittier Elementary; reading support since 4th grade.",
      interestsHobbies:
        "Soccer, Minecraft, building with LEGO.",
      structureBoundaries:
        "Does best with a clear plan for each outing and a 9pm curfew.",
      specialNeeds:
        "Reading support \u2014 prefers instructions read aloud.",
    },
  },
  {
    id: "MT-102",
    name: "Brianna Wells",
    initials: "BW",
    dob: "07/22/2012",
    gender: "Female",
    programme: "Work-Based",
    stage: "Ready for Match",
    promotionDate: "09/24/2025",
    referralSource: "DCFS",
    transportation: "Parent / Guardian",
    coordinator: "M. Rivera",
    intakeScheduledDate: "10/01/2025",
    guardianIntakeDate: "10/03/2025",
    youthIntakeDate: null,
    notes:
      "Ready for match — interested in a career in business.",
    referralId: "RF-102",
    guardianIntake: {
      guardianName: "Loretta Wells",
      relationship: "Parent / Guardian",
      phone: "(773) 555-0146",
      email: "loretta.wells@example.com",
      address: {
        street: "6401 S Halsted St",
        city: "Chicago",
        state: "IL",
        zip: "60621",
      },
      whyMentoring:
        "Brianna wants exposure to careers and professional settings.",
      youthAvailability: ["Mon|Evening", "Wed|Evening"],
      concernsExpectations:
        "Needs pick-up and drop-off; grandmother does not drive.",
    },
    youthIntake: {
      educationHistory:
        "8th grade honor roll at Bond Elementary.",
      interestsHobbies:
        "Entrepreneurship club, braiding hair, YouTube tutorials.",
      structureBoundaries:
        "Responsible and independent; check in by text when plans change.",
      specialNeeds: "None reported.",
    },
  },
  {
    id: "MT-103",
    name: "Carlos Mena",
    initials: "CM",
    dob: "11/08/2011",
    gender: "Male",
    programme: "School-Based",
    stage: "Youth Intake Complete",
    promotionDate: null,
    referralSource: "Court",
    transportation: "Public Transportation",
    coordinator: "T. Adams",
    intakeScheduledDate: "09/20/2025",
    guardianIntakeDate: "09/22/2025",
    youthIntakeDate: "09/25/2025",
    notes:
      "Youth intake complete; awaiting sub-program placement review.",
    referralId: "RF-103",
    guardianIntake: {
      guardianName: "Rosa Mena",
      relationship: "Parent / Guardian",
      phone: "(312) 555-0142",
      email: "rosa.mena@example.com",
      address: {
        street: "2650 W Fulton St",
        city: "Chicago",
        state: "IL",
        zip: "60612",
      },
      whyMentoring:
        "Wants a steady adult role model and structure after school.",
      youthAvailability: ["Tue|Afternoon", "Thu|Evening"],
      concernsExpectations:
        "Concerned about peer influence on weekends.",
    },
    youthIntake: {
      educationHistory:
        "7th grade at Jones Academy; 504 plan in place.",
      interestsHobbies: "Basketball, drawing, video games.",
      structureBoundaries:
        "Responds well to clear routines and consistent consequences.",
      specialNeeds:
        "ADHD \u2014 benefits from short, active outings.",
    },
  },
  {
    id: "MT-104",
    name: "Destiny Owusu",
    initials: "DO",
    dob: "02/14/2014",
    gender: "Female",
    programme: "Community-Based",
    stage: "Guardian Intake Complete",
    promotionDate: null,
    referralSource: "School",
    transportation: "School Transportation",
    coordinator: "L. Chen",
    intakeScheduledDate: "10/05/2025",
    guardianIntakeDate: "10/07/2025",
    youthIntakeDate: null,
    notes: "Youth intake being scheduled for next week.",
    referralId: "RF-104",
    guardianIntake: {
      guardianName: "Grace Owusu",
      relationship: "Parent / Guardian",
      phone: "(872) 555-0119",
      email: "grace.owusu@example.com",
      address: {
        street: "4410 N Broadway",
        city: "Chicago",
        state: "IL",
        zip: "60640",
      },
      whyMentoring:
        "Destiny is new to the city and needs a friend and guide.",
      youthAvailability: [
        "Sat|Morning",
        "Sat|Afternoon",
        "Sun|Afternoon",
      ],
      concernsExpectations: "Prefers a female mentor.",
    },
    youthIntake: {
      educationHistory: "5th grade at Uplift Community School.",
      interestsHobbies:
        "Singing in church choir, crafts, reading.",
      structureBoundaries:
        "Needs reassurance in new places; give advance notice of plans.",
      specialNeeds:
        "None reported — first time in a new school district.",
    },
  },
  {
    id: "MT-105",
    name: "Elijah Park",
    initials: "EP",
    dob: "09/30/2012",
    gender: "Male",
    programme: "Community-Based",
    stage: "Intake Scheduled",
    promotionDate: null,
    referralSource: "Self",
    transportation: "Public Transportation",
    coordinator: "M. Rivera",
    intakeScheduledDate: "10/15/2025",
    guardianIntakeDate: null,
    youthIntakeDate: null,
    notes: "Guardian intake scheduled for Oct 15.",
    referralId: "RF-105",
    guardianIntake: {
      guardianName: "Daniel Park",
      relationship: "Parent / Guardian",
      phone: "(312) 555-0177",
      email: "daniel.park@example.com",
      address: {
        street: "3101 N Clark St",
        city: "Chicago",
        state: "IL",
        zip: "60657",
      },
      whyMentoring:
        "Elijah asked for a mentor himself; we fully support it.",
      youthAvailability: ["Wed|Afternoon", "Fri|Afternoon"],
      concernsExpectations:
        "Would like the mentor to encourage his interest in engineering.",
    },
    youthIntake: {
      educationHistory:
        "7th grade at Hawthorne Scholastic Academy.",
      interestsHobbies: "Robotics, chess, coding.",
      structureBoundaries:
        "Self-directed; parents ask to be told about any schedule changes.",
      specialNeeds: "None reported.",
    },
  },
  {
    id: "MT-106",
    name: "Fatima Hassan",
    initials: "FH",
    dob: "05/19/2013",
    gender: "Female",
    programme: "School-Based",
    stage: "Under Review",
    promotionDate: null,
    referralSource: "DCFS",
    transportation: "Parent / Guardian",
    coordinator: "T. Adams",
    intakeScheduledDate: "10/24/2025",
    guardianIntakeDate: null,
    youthIntakeDate: null,
    notes: "Referral under coordinator review.",
    referralId: "RF-106",
    guardianIntake: {
      guardianName: "Amina Hassan",
      relationship: "Parent / Guardian",
      phone: "(773) 555-0158",
      email: "amina.hassan@example.com",
      address: {
        street: "5000 N Kedzie Ave",
        city: "Chicago",
        state: "IL",
        zip: "60625",
      },
      whyMentoring:
        "Fatima wants help adjusting to school and making friends.",
      youthAvailability: ["Mon|Afternoon", "Wed|Afternoon"],
      concernsExpectations: "Prefers outings close to home.",
    },
    youthIntake: {
      educationHistory:
        "6th grade at Albany Park Multicultural Academy; ELL services.",
      interestsHobbies: "Art, cooking with family, volleyball.",
      structureBoundaries:
        "Family prefers outings end before dark.",
      specialNeeds:
        "English learner \u2014 speaks Arabic at home.",
    },
  },
  {
    id: "MT-107",
    name: "Gabriel Reyes",
    initials: "GR",
    dob: "12/01/2011",
    gender: "Male",
    programme: "Work-Based",
    stage: "Referral Received",
    promotionDate: null,
    referralSource: "Court",
    transportation: "Public Transportation",
    coordinator: "L. Chen",
    intakeScheduledDate: "11/03/2025",
    guardianIntakeDate: null,
    youthIntakeDate: null,
    notes: "New referral — not yet reviewed.",
    referralId: "RF-107",
    guardianIntake: {
      guardianName: "Sofia Reyes",
      relationship: "Parent / Guardian",
      phone: "(312) 555-0193",
      email: "sofia.reyes@example.com",
      address: {
        street: "1700 S Blue Island Ave",
        city: "Chicago",
        state: "IL",
        zip: "60608",
      },
      whyMentoring:
        "Gabriel misses his brother and needs someone to talk to.",
      youthAvailability: ["Tue|Evening", "Sat|Afternoon"],
      concernsExpectations:
        "Wants regular updates from the coordinator.",
    },
    youthIntake: {
      educationHistory: "8th grade at Pilsen Academy.",
      interestsHobbies:
        "Boxing, music production, skateboarding.",
      structureBoundaries:
        "Needs firm but caring boundaries; respects consistency.",
      specialNeeds:
        "Benefits from a check-in after weekends with family visits.",
    },
  },
  {
    id: "MT-108",
    name: "Hannah Kim",
    initials: "HK",
    dob: "08/11/2014",
    gender: "Female",
    programme: "Community-Based",
    stage: "Matched",
    promotionDate: "08/12/2025",
    referralSource: "School",
    transportation: "Public Transportation",
    coordinator: "M. Rivera",
    intakeScheduledDate: "08/20/2025",
    guardianIntakeDate: "08/22/2025",
    youthIntakeDate: "08/25/2025",
    notes: "Matched with Angela Moretti — going well.",
    referralId: "RF-108",
    guardianIntake: {
      guardianName: "Joon Kim",
      relationship: "Parent / Guardian",
      phone: "(773) 555-0134",
      email: "joon.kim@example.com",
      address: {
        street: "3300 W Bryn Mawr Ave",
        city: "Chicago",
        state: "IL",
        zip: "60659",
      },
      whyMentoring:
        "Hannah would benefit from enrichment outside school.",
      youthAvailability: ["Sun|Morning", "Sun|Afternoon"],
      concernsExpectations:
        "Allergic to peanuts \u2014 please share with mentor.",
    },
    youthIntake: {
      educationHistory:
        "4th grade at Peterson Elementary; gifted program.",
      interestsHobbies: "Science museums, painting, piano.",
      structureBoundaries:
        "Follows rules well; bedtime 8:30pm on school nights.",
      specialNeeds:
        "Severe peanut allergy \u2014 carries an EpiPen.",
    },
  },
];

// Referral records the seeded mentees were created from (Referral Source lookup).
export const MOCK_FF_REFERRALS: FFReferralRecord[] = [
  {
    id: "RF-101",
    submittedDate: "08/28/2025",
    callerName: "Ms. Patel",
    referrerRole: "School Counselor",
    candidateName: "Aiden Torres",
    candidateDob: "03/15/2013",
    candidateGender: "Male",
    historyBackground:
      "Lives with mother and younger sister; dad works nights.",
    familySituation: "",
    whyMentor: "Quiet in class, opening up in small groups.",
    specialEducation: "IEP for reading support.",
    publicTransit: "yes",
    staffRecommendation: "",
    recommendedProgram: "Community-Based",
  },
  {
    id: "RF-102",
    submittedDate: "09/15/2025",
    callerName: "Darnell Brooks",
    referrerRole: "DCFS Caseworker",
    candidateName: "Brianna Wells",
    candidateDob: "07/22/2012",
    candidateGender: "Female",
    historyBackground:
      "In kinship care with grandmother since 2024.",
    familySituation: "",
    whyMentor: "Strong student, interested in business.",
    specialEducation: "",
    publicTransit: "no",
    staffRecommendation: "",
    recommendedProgram: "Work-Based",
  },
  {
    id: "RF-103",
    submittedDate: "09/05/2025",
    callerName: "Judge Harmon's office",
    referrerRole: "Probation Officer",
    candidateName: "Carlos Mena",
    candidateDob: "11/08/2011",
    candidateGender: "Male",
    historyBackground:
      "On informal supervision after a school incident.",
    familySituation: "",
    whyMentor: "Needs positive structure after school.",
    specialEducation: "504 plan for ADHD.",
    publicTransit: "yes",
    staffRecommendation: "",
    recommendedProgram: "School-Based",
  },
  {
    id: "RF-104",
    submittedDate: "09/22/2025",
    callerName: "Mr. Okafor",
    referrerRole: "Teacher",
    candidateName: "Destiny Owusu",
    candidateDob: "02/14/2014",
    candidateGender: "Female",
    historyBackground: "Recently moved from Indianapolis.",
    familySituation: "",
    whyMentor: "Shy, adjusting to a new school.",
    specialEducation: "",
    publicTransit: "yes",
    staffRecommendation: "",
    recommendedProgram: "Community-Based",
  },
  {
    id: "RF-105",
    submittedDate: "10/01/2025",
    callerName: "Elijah Park",
    referrerRole: "Self-Referral",
    candidateName: "Elijah Park",
    candidateDob: "09/30/2012",
    candidateGender: "Male",
    historyBackground:
      "Asked his school social worker how to find a mentor.",
    familySituation: "",
    whyMentor:
      "Self-motivated; wants help with college planning.",
    specialEducation: "",
    publicTransit: "yes",
    staffRecommendation: "",
    recommendedProgram: "Community-Based",
  },
  {
    id: "RF-106",
    submittedDate: "10/12/2025",
    callerName: "Amina Hassan",
    referrerRole: "Community Partner",
    candidateName: "Fatima Hassan",
    candidateDob: "05/19/2013",
    candidateGender: "Female",
    historyBackground:
      "Family arrived via refugee resettlement in 2023.",
    familySituation: "",
    whyMentor: "English learner, very social.",
    specialEducation: "English language learner services.",
    publicTransit: "unknown",
    staffRecommendation: "",
    recommendedProgram: "School-Based",
  },
  {
    id: "RF-107",
    submittedDate: "10/20/2025",
    callerName: "Ms. Gutierrez",
    referrerRole: "Social Worker",
    candidateName: "Gabriel Reyes",
    candidateDob: "12/01/2011",
    candidateGender: "Male",
    historyBackground: "Older brother recently incarcerated.",
    familySituation: "",
    whyMentor: "Needs a positive male role model.",
    specialEducation: "",
    publicTransit: "yes",
    staffRecommendation: "",
    recommendedProgram: "Work-Based",
  },
  {
    id: "RF-108",
    submittedDate: "08/10/2025",
    callerName: "Mrs. Kim",
    referrerRole: "Parent / Guardian",
    candidateName: "Hannah Kim",
    candidateDob: "08/11/2014",
    candidateGender: "Female",
    historyBackground: "Parents both work long shifts.",
    familySituation: "",
    whyMentor: "Curious, loves museums and science.",
    specialEducation: "",
    publicTransit: "yes",
    staffRecommendation: "",
    recommendedProgram: "Community-Based",
  },
];

export function getFFMenteeById(
  id: string,
): FFMentee | undefined {
  return MOCK_FF_MENTEES.find((m) => m.id === id);
}

// Promoting a referral appends the new mentee to the shared pool so it's
// immediately reachable by id once the page navigates to its record.
export function addFFMentee(mentee: FFMentee): void {
  MOCK_FF_MENTEES.unshift(mentee);
}

// ─── Mentee Referral form ───────────────────────────────────────────────────

export interface FFReferralForm {
  callerName: string;
  referrerRole: string;
  candidateName: string;
  candidateDob: string;
  candidateGender: string;
  historyBackground: string;
  familySituation: string;
  whyMentor: string;
  specialEducation: string;
  publicTransit: "yes" | "no" | "unknown" | "";
  staffRecommendation: string;
  recommendedProgram: FFSubProgramme | "";
}

export const EMPTY_FF_REFERRAL: FFReferralForm = {
  callerName: "",
  referrerRole: "",
  candidateName: "",
  candidateDob: "",
  candidateGender: "",
  historyBackground: "",
  familySituation: "",
  whyMentor: "",
  specialEducation: "",
  publicTransit: "",
  staffRecommendation: "",
  recommendedProgram: "",
};

export const REFERRER_ROLES = [
  "Parent / Guardian",
  "School Counselor",
  "Social Worker",
  "Teacher",
  "DCFS Caseworker",
  "Probation Officer",
  "Community Partner",
  "Self-Referral",
  "Other",
];