import { useState, useRef, useMemo, useCallback } from "react";
import {
  getAlternateAdmissionProfiles,
  formatAdmissionAttemptLabel,
} from "../../data/mockLeadsData";
import { Button } from "../ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Eye,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
} from "@/app/lib/lucide-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";

import {
  ConnectionFormDialog,
  PHYSICAL_HEALTH_CONNECTION_TYPES,
  type ConnectionsMode,
} from "./ConnectionFormDialog";
import {
  updateYouthConnections,
  useAllYouthConnections,
  useYouthConnections,
} from "../../data/youthConnectionStore";
import {
  allTutorConnections,
  getTutorMatchSnapshot,
  tutorConnectionsForYouth,
  updateTutorConnection,
  useTutorMatchSnapshot,
  type TutorSessionConnection,
} from "../../data/tutorMatchStore";
import {
  getFriendsFirstSessions,
  updateFriendsFirstSession,
  useFriendsFirstSessions,
} from "../../data/friendsFirstSessionStore";
import { FRIENDS_FIRST_INFO_SESSION_TYPE } from "../../lib/friendsFirstSession";
import { useAutomaticConnectionStatus } from "./connectionStatusRules";
import { completeAdmissionShadowReportTask } from "../../lib/admissionShadowReportTask";
import { createConnectionRescheduleTask } from "../../lib/connectionRescheduleTask";
import { cancelConnectionCalendarEvents } from "../../lib/outlookConnectionCalendarSync";
import { CONNECTION_FORM_YOUTH } from "../../data/mockYouthProgramData";
import { CONSTITUENTS } from "../../data/mockConstituents";
import { toast } from "sonner";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

type ConnectionStatus =
  | "Scheduled"
  | "Completed"
  | "Incomplete"
  | "Submitted/Finalized"
  | "Cancelled";

interface Connection {
  id: string;
  type: string;
  status?: ConnectionStatus;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  attended: boolean;
  participants: string;
  programs: string;
  homeVisit: boolean;
  transitionRelated?: boolean;
  location?: string;
  serviceCoordination?: boolean;
  department?: string;
  language?: string;
  languageOther?: string;
  summary?: string;
  // Therapy Session specific fields
  sessionType?: string;
  therapySessionVariant?: string;
  mood?: string;
  affect?: string;
  behavior?: string;
  themesAddressed?: string;
  description?: string;
  plan?: string;
  treatmentTargets?: string[];
  // Milieu Meeting specific fields
  meetingSummary?: string;
  individualParticipantNotes?: {
    participantId: number;
    participantName: string;
    notes: string;
  }[];
  goals?: { id: number; goal: string; comments: string }[];
  // Advocate Meeting specific fields
  goalsDiscussed?: string[];
  copingSkills?: string[];
  triggers?: string[];
  strengths?: string[];
  assessmentResponses?: {
    participation?: string;
    understanding?: string;
    expression?: string;
  };
  advocateMeetingSummary?: string;
  finalized?: boolean;
  // Care Planning Meeting specific fields
  relatedITP?: string;
  transitionPlanningDiscussion?: string;
  carePlanningMeetingSummary?: string;
  // Therapy Session Individual Variant - Skill Assessment fields
  skillAssessment?: {
    identifyExpressEmotions?: string;
    regulateStrongEmotions?: string;
    healthyBoundaries?: string;
    reflectChallengingSituations?: string;
    selfAcceptance?: string;
    hopefulAboutFuture?: string;
  };
}

interface ConnectionParticipant {
  id: number;
  constituentType: "Constituent" | "Non-Constituent";
  participant: string;
  role: string;
  attended: boolean | null;
  reasonMissed: string;
  attendanceNotes?: string;
  otherReasonDetails?: string;
  isOrganizer?: boolean;
}

interface ParticipantRating {
  participantId: number;
  participantName: string;
  participantRole: string;
  participantLocation: string;
  relationshipRating: string;
  goalsTopicsRating: string;
  approachMethodRating: string;
  overallRating: string;
  therapistEngagementRating: string;
}

type SortColumn =
  | "id"
  | "startDate"
  | "endDate"
  | "type"
  | "attended"
  | "participants"
  | "programs"
  | "homeVisit";
type SortDirection = "asc" | "desc" | null;

// Connection type options (focused on Info Sessions for this implementation)
const connectionTypeOptions = [
  "Individual Info Session",
  "Group Info Session",
  "Admissions Clinical Assessment",
  "Admissions Shadow",
  "Admissions Wait List Group",
  "Advocate Meeting",
  "Annual Physical Appointment",
  "Care Planning Meeting",
  "Class Session",
  "Collaborative Event",
  "Community Care Contact",
  "Community Care Event",
  "Community Care Family Therapy Session",
  "Community Care File Request",
  "Community Care Group Therapy Session",
  "Community Care Individual Therapy Session",
  "Dentist Appointment",
  "Dietitian/Nutritionist Appointment",
  "Doctor Office Visit",
  "Employee Site Visit",
  "ER Visit",
  "Eye Doctor Appointment",
  "Family Event",
  "Family Partnership Meeting",
  FRIENDS_FIRST_INFO_SESSION_TYPE,
  "Group Therapy Session - Contract",
  "Group Therapy Session - External",
  "Group Therapy Session - Program",
  "Hearing Doctor Appointment",
  "Integrated Substance Use Assessment",
  "Justice, Diversity, and Inclusion Event",
  "Medical Hospitalization",
  "Mercy Home Activity",
  "Milieu meeting",
  "Nurse Visit",
  "Orthodontist Appointment",
  "Other Admissions Meeting",
  "Parent / Family Contact",
  "Psychiatric Hospitalization",
  "Spiritual Connection",
  "Staff Meeting",
  "Surgery Appointment",
  "Therapy Session",
  "Transition Meeting",
  "Tutor Session",
  "Urgent Care Visit",
];

// Connection types that support "Add Program" functionality (AC1, AC21)
const programSupportedConnectionTypes = [
  "Class Session",
  "Employee Site Visit",
  "Family Event",
  "Group Therapy Session - Contract",
  "Group Therapy Session - External",
  "Group Therapy Session - Program",
  "Justice, Diversity, and Inclusion Event",
  "Mercy Home Activity",
  "Milieu meeting",
  "Spiritual Connection",
  "Therapy Session",
];

// Session Type options (for Therapy Session)
const sessionTypeOptions = ["Contract", "External", "Program"];

// Therapy Session Variant options
const therapySessionVariantOptions = [
  "Individual",
  "Group",
  "Family",
];

// Mood options (for Therapy Session Details)
const moodOptions = [
  "Euthymic",
  "Depressed",
  "Anxious",
  "Angry",
  "Euphoric",
  "Irritable",
];

// Affect options (for Therapy Session Details)
const affectOptions = [
  "Full",
  "Constricted",
  "Flat",
  "Inappropriate",
  "Labile",
];

// Behavior options (for Therapy Session Details)
const behaviorOptions = [
  "Cooperative",
  "Resistant",
  "Agitated",
  "Impulsive",
  "Over Sedated",
  "Aggressive",
  "Hyperactive",
  "Restless",
  "Other",
];

// Participant Location options (for Therapy Session Participant Ratings)
const participantLocationOptions = ["In-Person", "Virtual"];

// Rating Scale options (for Therapy Session Participant Ratings)
const ratingScaleOptions = [
  "Excellent",
  "Good",
  "Fair",
  "Poor",
  "Very Poor",
];

// Engagement options (for Therapy Session Participant Ratings)
const engagementOptions = [
  "1 – Very Disengaged",
  "2 – Somewhat Disengaged",
  "3 – Somewhat Engaged",
  "4 – Very Engaged",
];

// Community Care File Request - Reason for Request options
const fileRequestReasonOptions = [
  "Subpoena",
  "Court Order",
  "Triage Support",
  "Personal Documents",
  "ROI by Member",
  "ROI by Family Member",
];

// Community Care File Request - Documents Given options
const fileRequestDocumentOptions = [
  "Admissions Narrative",
  "Transition Summary",
  "ITP",
  "Behavioral Records",
  "Psychiatric Visit Form",
  "Incident Report Summary",
  "Copy of Social Security Card",
  "Copy of Birth Certificate",
  "Copy of State ID",
];

// Community Care Contact - Interaction Type options
const interactionTypeOptions = [
  "Onsite Visit - Scheduled",
  "Onsite Visit - Unscheduled",
  "Offsite Visit",
  "Text",
  "Phone Call",
  "Letter",
  "Email",
  "Social Media",
  "Video",
  "Mail",
];

// Community Care Contact - Support Provided options
const supportProvidedOptions = [
  "General Check-In",
  "Scholarship",
  "Assessment",
  "Adult Education",
  "Caregiver Skills",
  "Childcare",
  "Clothing",
  "Education (Children/Adolescents)",
  "Employment & Finances",
  "Executive Functions",
  "Food",
  "Housing",
  "Legal (criminal)",
  "Legal (non-criminal)",
  "Mental Health",
  "Physical Disabilities & Learning Difficulties",
  "Physical Health & Health Care Coverage",
  "Safety",
  "Social Supports",
  "Substance Use",
  "Transportation",
];

// Treatment Targets options (for Parent / Family Contact)
const treatmentTargetOptions = [
  "Caregiver System Engagement",
  "Assessment & Psychoeducation",
  "Routines, Rituals, & Care Vision",
  "Calm (Caregiver Affect Management)",
  "Connect (Caregiver Attunement)",
  "Effective Caregiving Response",
  "Reflection (Affect Identification)",
  "Modulation",
  "Self-Discipline & Problem Solving (Executive Functions)",
  "Identity & Purpose",
  "Relational Engagement & Self Expression",
  "Resilience (Trauma Experience Integration)",
  "Resilience (Skill Coaching)",
];

// Advocate Meeting - Youth Goals (mock data pre-populated from Youth record)
// status "Complete" goals are excluded from the Add Goal picklist per AC25
const youthGoalsData: {
  goal: string;
  status: "Active" | "Complete";
  type: "Major" | "Intermediate";
  majorGoal?: string;
}[] = [
  {
    goal: "Improve emotional regulation",
    status: "Active",
    type: "Major",
  },
  {
    goal: "Develop healthy coping strategies",
    status: "Active",
    type: "Major",
  },
  {
    goal: "Build positive relationships with peers",
    status: "Active",
    type: "Major",
  },
  {
    goal: "Enhance communication skills",
    status: "Active",
    type: "Intermediate",
    majorGoal: "Build positive relationships with peers",
  },
  {
    goal: "Increase self-awareness",
    status: "Active",
    type: "Intermediate",
    majorGoal: "Improve emotional regulation",
  },
  {
    goal: "Manage anger appropriately",
    status: "Active",
    type: "Intermediate",
    majorGoal: "Improve emotional regulation",
  },
  {
    goal: "Complete school assignments on time",
    status: "Complete",
    type: "Major",
  },
];
const youthGoalsOptions = youthGoalsData.map((g) => g.goal);

// Advocate Meeting - Youth Coping Skills (mock data pre-populated from Youth record)
const youthCopingSkillsOptions = [
  "Deep breathing exercises",
  "Journaling",
  "Physical activity/exercise",
  "Talking to a trusted adult",
  "Listening to music",
  "Taking a break/timeout",
  "Progressive muscle relaxation",
];

// Advocate Meeting - Youth Triggers (mock data pre-populated from Youth record)
const youthTriggersOptions = [
  "Loud noises",
  "Crowded spaces",
  "Academic pressure",
  "Peer conflict",
  "Authority figures",
  "Unstructured time",
  "Transitions between activities",
];

// Advocate Meeting - Youth Strengths (mock data pre-populated from Youth record)
const youthStrengthsOptions = [
  "Creative and artistic",
  "Good problem solver",
  "Empathetic toward others",
  "Strong athletic ability",
  "Leadership qualities",
  "Sense of humor",
  "Resilient and determined",
];

// Advocate Meeting - Assessment Question Likert Scale Options
const likertScaleOptions = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
];

// Reason missed options (23 values per requirements)
const reasonMissedOptions = [
  "Youth Not Intended to Attend",
  "Program Conflict - Excused",
  "Sick - Excused",
  "On Pass - Excused",
  "Hospitalized - Excused",
  "Youth Schedule Conflict - Excused",
  "Suspended From Program - Excused",
  "Youth Refusal - Unexcused",
  "No Show - Unexcused",
  "AWOL - Unexcused",
  "Youth Asked To Leave - Unexcused",
  "Other",
  "Family Event - Youth Don't Attend",
  "Staff Not Intended to Attend",
  "Did not reply",
  "Rescheduled",
  "Supervisor reviewed note",
  "Cancelled but not Rescheduled (Admissions)",
  "Dropped Class/Final Class",
  "Youth Needs to Complete Homework",
  "Excused Program Staff Recommendation-Excused",
  "Youth Not Home From School-Excused",
  "Excused - In School",
  "Excused - Work",
];

const LOCATION_OPTIONS = [
  "Other",
  "DePalmaGarden",
  "Conference Room - Community Care Satellite Office",
  "20/30 club",
  "Conference Room - Daley Home Therapy Room",
  "Conference Room - Daley Home Staff Office",
  "Conference Room - Daley Home Living Room",
  "Conference Room - Daley Home SMART Room",
  "Girls Campus Back Office",
  "Boys Campus Soccer Field (restricted)",
  "Boys Campus Gym (restricted)",
  "Our Lady of Mercy Chapel",
  "Learning Center Computer Lab (West Loop)",
  "Jesus the Healer Chapel",
  "Field of Dreams (restricted)",
  "Conference Room - 227 Basement",
  "Soccer Building Waiting Area",
  "Conference Room - MW Living Room",
  "Conference Room - BOA Conference Room",
  "Conference Room - Advancement",
  "Conference Room - Boys Multipurpose Room (restricted)",
  "Conference Room - Boys Campus Cafeteria (restricted)",
  "Conference Room - Admissions",
  "Conference Room - Board of Regents (restricted) (cap. 50)",
  "Conference Room - HR",
  "Conference Room - Chairman's Room",
  "Conference Room - Girls SMART Room",
  "Conference Room - Girls Auditorium",
  "Conference Room - Girls Computer Room",
  "Conference Room - MercyWorks",
  "Conference Room - Girls Learning Center",
  "Conference Room - Friends First",
  "Conference Room - Learning Center Large Classroom (West Loop)",
  "Conference Room - Learning Center Small Classroom (West Loop)",
  "Conference Room - Mission Press",
  "Conference Room - Girls Campus",
  "Conference Room - White Sox (Advancement)",
  "Conference Room - Girls Cafeteria",
  "Conference Room - 227 1st Floor",
  "Fountain in West Loop Courtyard",
  "Conference Room - 227 Back Porch",
  "Speh Lawn",
  "Conference Room - 227 Lawn",
  "Conference Room - WL Music Room",
  "Conference Room - IS",
] as const;

// Program options
const programOptions = [
  "Boys Town",
  "CILA",
  "Connections",
  "Day School",
  "Emergency",
  "Family Services",
  "Foster Care",
  "IndependFent Living",
  "Residential",
  "Transitional Living",
];

// Mock Program-Youth associations (for "Add Program" functionality)
const programYouthAssociations: Record<string, string[]> = {
  "Boys Town": ["J. Smith", "M. Johnson"],
  CILA: ["A. Williams", "R. Davis"],
  Connections: ["T. Brown", "K. Lee"],
  "Day School": ["P. Garcia", "S. Martinez", "Aarete Test"],
  Emergency: ["J. Smith"],
  "Family Services": ["M. Johnson", "A. Williams"],
  "Foster Care": ["R. Davis", "T. Brown"],
  "Independent Living": ["K. Lee", "P. Garcia"],
  Residential: ["S. Martinez", "Aarete Test", "J. Smith"],
  "Transitional Living": [
    "M. Johnson",
    "A. Williams",
    "R. Davis",
  ],
};

// Department options
const departmentOptions = [
  "Admissions",
  "Clinical Services",
  "Education",
  "Family Services",
  "Health Services",
  "Residential",
];

// Participant options (for filter)
const participantOptions = [
  "J. Smith",
  "M. Johnson",
  "A. Williams",
  "R. Davis",
  "T. Brown",
  "K. Lee",
  "P. Garcia",
  "S. Martinez",
  "Sohan Jadhavrao",
  "Aarete Test",
];

// Language options for Info Sessions
const languageOptions = [
  "English",
  "Spanish",
  "Polish",
  "Other",
];

// Non-Constituent Roles (36 items per requirements)
const nonConstituentRoleOptions = [
  "Coordinator",
  "Director",
  "Manager",
  "Tutor",
  "Advisor",
  "Other Role",
  "Instructor",
  "MHBG Staff",
  "Youth",
  "Volunteer",
  "School Staff",
  "Contractor",
  "PSO Staff",
  "Case Manager",
  "Masters Level Administrative Staff",
  "Mental Health Professional",
  "Physical Health Professional",
  "Community Care Staff",
  "External Constituent",
  "Clinician",
  "Residential Program Authorization Agent",
  "Community Care Member",
  "Ridgeland Tenant",
  "Drivers Education instructor",
  "Community Care Scholar",
  "Friends First Mentee",
  "Friends First Mentor",
  "Friends First MSR",
  "Friends First Coordinator",
  "Nurse",
  "Community Care Employment",
  "Med Leader",
  "Community Care Housing",
  "Community Care Therapy",
  "Community Care-Care Management",
  "Medical Professional",
];

// Constituent Roles (for Constituent type participants)
const constituentRoleOptions = [
  "Youth",
  "Parent/Guardian",
  "Sibling",
  "Family Member",
  "MHBG Staff",
  "Organizer",
];

// Reason for Request options (for Integrated Substance Use Assessment)
const reasonForRequestOptions = [
  "Possession of Drugs, Paraphernalia, or Alcohol",
  "Positive Toxicology Test",
  "History of Drug/Alcohol Abuse",
  "Pattern of Drug/Alcohol Use",
  "Other",
];

// Request Status options (for Integrated Substance Use Assessment)
const requestStatusOptions = [
  "Approved",
  "Denied",
  "Cancelled",
];

// Mock connection data
// ── Status workflow ────────────────────────────────────────────────────────────

/** Event-based types follow: Scheduled → Completed → Cancelled */
const EVENT_BASED_TYPES = new Set([
  FRIENDS_FIRST_INFO_SESSION_TYPE,
  "Group Info Session",
  "Individual Info Session",
  "Collaborative Event",
  "Outreach",
]);

/** Returns the category for any connection type. */
function getConnectionCategory(
  type: string,
): "event-based" | "documentation-based" {
  return EVENT_BASED_TYPES.has(type)
    ? "event-based"
    : "documentation-based";
}

/** Allowed next statuses from a given current status, per category. */
function getAllowedNextStatuses(
  current: ConnectionStatus | undefined,
  type: string,
): ConnectionStatus[] {
  const cat = getConnectionCategory(type);
  const cur = current ?? "Scheduled";
  if (cat === "event-based") {
    const flow: Record<ConnectionStatus, ConnectionStatus[]> = {
      Scheduled: ["Completed", "Cancelled"],
      Completed: ["Cancelled"],
      Incomplete: [], // not used for event-based
      "Submitted/Finalized": [],
      Cancelled: [],
    };
    return flow[cur] ?? [];
  } else {
    const flow: Record<ConnectionStatus, ConnectionStatus[]> = {
      Scheduled: [
        "Incomplete",
        "Submitted/Finalized",
        "Cancelled",
      ],
      Incomplete: ["Submitted/Finalized", "Cancelled"],
      "Submitted/Finalized": ["Cancelled"],
      Completed: ["Cancelled"], // fallback
      Cancelled: [],
    };
    return flow[cur] ?? [];
  }
}

/** SLDS 2-aligned badge style per status. */
function getStatusBadgeStyle(
  status: ConnectionStatus | undefined,
): React.CSSProperties & { label: string } {
  switch (status) {
    case "Scheduled":
      return {
        backgroundColor: "#e8f4f8",
        color: "#0176d3",
        border: "1px solid #b6deff",
        label: "Scheduled",
      };
    case "Completed":
      return {
        backgroundColor: "#e8f5e9",
        color: "#145F33",
        border: "1px solid #a5d6a7",
        label: "Completed",
      };
    case "Incomplete":
      return {
        backgroundColor: "#fff8e1",
        color: "#b45309",
        border: "1px solid #fcd34d",
        label: "Incomplete",
      };
    case "Submitted/Finalized":
      return {
        backgroundColor: "#e8f5e9",
        color: "#145F33",
        border: "1px solid #a5d6a7",
        label: "Submitted/Finalized",
      };
    case "Cancelled":
      return {
        backgroundColor: "#fef2f2",
        color: "#c23934",
        border: "1px solid #fca5a5",
        label: "Cancelled",
      };
    default:
      return {
        backgroundColor: "#e8f4f8",
        color: "#0176d3",
        border: "1px solid #b6deff",
        label: "Scheduled",
      };
  }
}

/** Stable empty list (outside overall mode) — avoids render loops. */
const NO_CONNECTIONS: Connection[] = [];

const mockConnections: Connection[] = [
  {
    id: "157013",
    type: "Therapy Session",
    status: "Submitted/Finalized",
    startDate: "04/16/2026",
    endDate: "04/16/2026",
    startTime: "02:00 PM",
    endTime: "03:00 PM",
    attended: true,
    participants: "Aarete Test, Dr. Sarah Thompson",
    programs: "Residential",
    homeVisit: false,
    department: "Clinical Services",
    sessionType: "Contract",
    therapySessionVariant: "Individual",
    mood: "Euthymic",
    affect: "Full",
    behavior: "Cooperative",
    themesAddressed:
      "Discussed emotional regulation strategies and coping mechanisms",
    description:
      "Youth engaged well during the session. We worked on identifying triggers and developing healthy coping strategies.",
    plan: "Continue working on emotion regulation techniques. Schedule follow-up session next week.",
    treatmentTargets: [
      "Assessment & Psychoeducation",
      "Self-Discipline & Problem Solving (Executive Functions)",
      "Resilience (Skill Coaching)",
    ],
    finalized: true,
  },
  {
    id: "157012",
    type: "Staffing Meeting",
    status: "Submitted/Finalized",
    startDate: "02/11/2026",
    endDate: "02/11/2026",
    startTime: "05:33 AM",
    endTime: "06:00 AM",
    attended: true,
    participants: "J. Smith, M. Johnson",
    programs: "Residential",
    homeVisit: false,
    department: "Clinical Services",
  },
  {
    id: "157011",
    type: "Family Partnership Meeting",
    status: "Submitted/Finalized",
    startDate: "02/11/2026",
    endDate: "02/11/2026",
    startTime: "05:30 AM",
    endTime: "08:00 AM",
    attended: true,
    participants: "A. Williams, R. Davis",
    programs: "Family Services, Foster Care",
    homeVisit: true,
    department: "Family Services",
  },
  {
    id: "157010",
    type: "Individual Info Session",
    status: "Completed",
    startDate: "02/11/2026",
    endDate: "02/11/2026",
    startTime: "05:30 AM",
    endTime: "07:00 AM",
    attended: false,
    participants: "T. Brown",
    programs: "Residential",
    homeVisit: false,
    department: "Admissions",
    language: "English",
  },
  {
    id: "157009",
    type: "Group Info Session",
    status: "Scheduled",
    startDate: "02/11/2026",
    endDate: "02/11/2026",
    startTime: "05:29 AM",
    endTime: "06:00 AM",
    attended: true,
    participants: "K. Lee, P. Garcia",
    programs: "Day School, Connections",
    homeVisit: false,
    department: "Admissions",
    language: "Spanish",
  },
  {
    id: "157008",
    type: "Individual Info Session",
    startDate: "02/11/2026",
    endDate: "02/11/2026",
    startTime: "05:28 AM",
    endTime: "06:00 AM",
    attended: false,
    participants: "S. Martinez",
    programs: "Transitional Living",
    homeVisit: true,
    department: "Admissions",
    language: "English",
  },
];

export function ConnectionsSection({
  admissionProfileId,
  youthId,
  mode = "default",
}: {
  /** The Admissions Profile being viewed — used to list the same youth's
   *  other profiles in Related Admission Attempt (US 19983). */
  admissionProfileId?: string;
  /** Constituent Youth ID — connections come from the shared
   *  youthConnectionStore for this youth instead of local sample state. */
  youthId?: string;
  /** "physical-health" (US 20075): only PHYSICAL_HEALTH_CONNECTION_TYPES are
   *  listed, filterable and creatable. Requires youthId.
   *  "all" (US 20093, overall Connections): every record held by the shared
   *  stores — auto-created Tutor Sessions plus each youth's saved list —
   *  deduplicated by record id. View for all; edit only where a result-aware
   *  owner exists (Tutor Sessions); no create/delete without a youth. */
  mode?: ConnectionsMode | "all";
} = {}) {
  const isGlobal = mode === "all";
  const isPhysicalHealth = mode === "physical-health";
  // The youth whose profile is open. Tasks, notifications and calendar sync
  // created from this section target this youth, not the sample youth.
  const sectionYouth = useMemo(() => {
    if (!youthId) return CONNECTION_FORM_YOUTH;
    const c = CONSTITUENTS.find((x) => String(x.id) === youthId);
    return { id: youthId, name: c?.name ?? CONNECTION_FORM_YOUTH.name };
  }, [youthId]);
  // Friends First Info Sessions (US 20145) belong to no youth: they live in
  // their own store. A youth's list shows only those the youth is a
  // participant of (by Constituent ID); Overall Connections lists all.
  const typeOptions = isPhysicalHealth
    ? PHYSICAL_HEALTH_CONNECTION_TYPES
    : connectionTypeOptions;
  const relatedAdmissionAttemptOptions = useMemo(
    () =>
      admissionProfileId
        ? getAlternateAdmissionProfiles(admissionProfileId).map(
            (p) => ({
              value: p.id,
              label: formatAdmissionAttemptLabel(p),
            }),
          )
        : [],
    [admissionProfileId],
  );

  // ── Participant ID Counter (ensures unique IDs across all operations) ──
  const participantIdCounter = useRef(1000);

  const getNextParticipantId = () => {
    return participantIdCounter.current++;
  };
  const [localConnections, setLocalConnections] =
    useState<Connection[]>(mockConnections);
  const youthConnections = useYouthConnections<Connection>(
    youthId ?? "",
    mockConnections,
  );
  // Tutor Session Connections auto-created from this youth's Tutor Matches
  // (US 20093). They live in the Tutor Match store (single source of
  // truth) and are listed here by Constituent ID; edits made here are
  // written back there, never copied into the youth's own list.
  const tutorSnapshot = useTutorMatchSnapshot();
  const tutorConnections = useMemo(
    () =>
      youthId
        ? (tutorConnectionsForYouth(
            tutorSnapshot,
            youthId,
          ) as unknown as Connection[])
        : [],
    [tutorSnapshot, youthId],
  );
  const friendsFirstAll = useFriendsFirstSessions();
  const youthFriendsFirst = useMemo(
    () =>
      youthId
        ? (friendsFirstAll.filter((s) =>
            s.participantList.some(
              (p) => p.entityId === youthId,
            ),
          ) as unknown as Connection[])
        : [],
    [friendsFirstAll, youthId],
  );
  const storeSetConnections = useCallback<
    React.Dispatch<React.SetStateAction<Connection[]>>
  >(
    (update) => {
      const tutorNow = youthId
        ? (tutorConnectionsForYouth(
            getTutorMatchSnapshot(),
            youthId,
          ) as unknown as Connection[])
        : [];
      const tutorIds = new Set(tutorNow.map((c) => c.id));
      const ffNow = youthId
        ? (getFriendsFirstSessions().filter((s) =>
            s.participantList.some(
              (p) => p.entityId === youthId,
            ),
          ) as unknown as Connection[])
        : [];
      const ffIds = new Set(ffNow.map((c) => c.id));
      updateYouthConnections<Connection>(
        youthId ?? "",
        (prevYouth) => {
          const merged = [...tutorNow, ...ffNow, ...prevYouth];
          const next =
            typeof update === "function"
              ? update(merged)
              : update;
          // Unchanged (e.g. the status automation found nothing to do):
          // keep the same list so nothing re-renders in a loop.
          if (next === merged) return prevYouth;
          for (const c of next) {
            if (ffIds.has(c.id)) {
              // Shared session: only a table status change is written, to
              // its own store — never copied into the youth's list.
              const old = ffNow.find((f) => f.id === c.id);
              if (old && old.status !== c.status)
                updateFriendsFirstSession(c.id, {
                  status: c.status as
                    "Scheduled" | "Completed" | "Cancelled",
                });
              continue;
            }
            if (!tutorIds.has(c.id)) continue;
            const old = tutorNow.find((t) => t.id === c.id);
            if (JSON.stringify(old) !== JSON.stringify(c))
              updateTutorConnection(
                c as unknown as TutorSessionConnection,
              );
          }
          const own = next.filter(
            (c) => !tutorIds.has(c.id) && !ffIds.has(c.id),
          );
          return own.length === prevYouth.length &&
            own.every((c, i) => c === prevYouth[i])
            ? prevYouth
            : own;
        },
        mockConnections,
      );
    },
    [youthId],
  );
  // Overall Connections: canonical shared sources only, deduplicated by id.
  const allYouthLists = useAllYouthConnections();
  const friendsFirstSessions = useFriendsFirstSessions();
  const globalConnections = useMemo(() => {
    if (!isGlobal) return NO_CONNECTIONS;
    const seen = new Set<string>();
    const out: Connection[] = [];
    const add = (c: Connection, owner?: string) => {
      if (seen.has(c.id)) return;
      seen.add(c.id);
      out.push(
        owner
          ? ({ ...c, __ownerYouthId: owner } as Connection)
          : c,
      );
    };
    (
      allTutorConnections(
        tutorSnapshot,
      ) as unknown as Connection[]
    ).forEach((c) => add(c));
    Object.entries(allYouthLists).forEach(([owner, list]) =>
      (list as Connection[]).forEach((c) => add(c, owner)),
    );
    // Friends First Info Sessions: their own shared store, no youth owner.
    (friendsFirstSessions as unknown as Connection[]).forEach(
      (c) => add(c),
    );
    return out;
  }, [
    isGlobal,
    tutorSnapshot,
    allYouthLists,
    friendsFirstSessions,
  ]);
  const globalSetConnections = useCallback<
    React.Dispatch<React.SetStateAction<Connection[]>>
  >(
    (update) => {
      const next =
        typeof update === "function"
          ? update(globalConnections)
          : update;
      if (next === globalConnections) return;
      for (const c of next) {
        const old = globalConnections.find(
          (x) => x.id === c.id,
        );
        if (!old || old === c) continue;
        const owner = (c as { __ownerYouthId?: string })
          .__ownerYouthId;
        if (c.type === FRIENDS_FIRST_INFO_SESSION_TYPE) {
          // Table status change; the session form writes the store itself.
          const result = updateFriendsFirstSession(c.id, {
            status: c.status as
              "Scheduled" | "Completed" | "Cancelled",
          });
          if (!result.ok)
            toast.error("Status was not saved", {
              description: result.error,
            });
        } else if (
          (c as { sourceMatchId?: string }).sourceMatchId
        )
          updateTutorConnection(
            c as unknown as TutorSessionConnection,
          );
        else if (owner) {
          const { __ownerYouthId: _o, ...plain } =
            c as Connection & {
              __ownerYouthId?: string;
            };
          updateYouthConnections<Connection>(
            owner,
            (list) =>
              list.map((x) =>
                x.id === c.id ? (plain as Connection) : x,
              ),
            mockConnections,
          );
        }
      }
    },
    [globalConnections],
  );
  // All of this youth's connections — the dialog and status automation
  // always work on the full list so edits never drop other records.
  const connections = useMemo(
    () =>
      isGlobal
        ? globalConnections
        : youthId
          ? [
              ...tutorConnections,
              ...youthFriendsFirst,
              ...youthConnections,
            ]
          : localConnections,
    [
      isGlobal,
      globalConnections,
      youthId,
      tutorConnections,
      youthFriendsFirst,
      youthConnections,
      localConnections,
    ],
  );
  const setConnections = isGlobal
    ? globalSetConnections
    : youthId
      ? storeSetConnections
      : setLocalConnections;
  useAutomaticConnectionStatus(connections, setConnections);
  // What this section lists: Physical Health shows only its own types.
  const sectionConnections = isPhysicalHealth
    ? connections.filter((c) =>
        PHYSICAL_HEALTH_CONNECTION_TYPES.includes(c.type),
      )
    : connections;
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] =
    useState(false);
  const [editingConnection, setEditingConnection] =
    useState<Connection | null>(null);

  // Connection filters
  const [connFilterStartDate, setConnFilterStartDate] =
    useState("2026-01-13");
  const [connFilterEndDate, setConnFilterEndDate] =
    useState("2026-02-27");
  const [connFilterType, setConnFilterType] = useState("");
  const [connFilterProgram, setConnFilterProgram] =
    useState("");
  const [connFilterParticipants, setConnFilterParticipants] =
    useState("");
  const [connFilterDepartment, setConnFilterDepartment] =
    useState("");
  const [connFilterAttendedOnly, setConnFilterAttendedOnly] =
    useState(false);
  const [connFilterHomeVisitOnly, setConnFilterHomeVisitOnly] =
    useState(false);
  const [connFiltersApplied, setConnFiltersApplied] =
    useState(false);
  const [showConnectionFilters, setShowConnectionFilters] =
    useState(false);
  const [searchText, setSearchText] = useState("");

  // Sorting state
  const [sortColumn, setSortColumn] =
    useState<SortColumn>("startDate");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  // View & Delete modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [connectionReadOnly, setConnectionReadOnly] =
    useState(false);
  const [viewingConnection, setViewingConnection] =
    useState<Connection | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] =
    useState(false);
  const [deletingConnectionId, setDeletingConnectionId] =
    useState<string | null>(null);

  // Calculate Total Info Session No Shows
  const totalInfoSessionNoShows = connections.filter(
    (conn) =>
      (conn.type === "Individual Info Session" ||
        conn.type === "Group Info Session") &&
      conn.attended === false,
  ).length;

  // Sorting handler
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortColumn("startDate");
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Connection Handlers
  const handleAddConnection = () => {
    setEditingConnection(null);
    setConnectionReadOnly(false);
    setIsConnectionDialogOpen(true);
  };

  const handleEditConnection = (conn: Connection) => {
    if (
      isGlobal &&
      conn.type !== FRIENDS_FIRST_INFO_SESSION_TYPE &&
      !(conn as { sourceMatchId?: string }).sourceMatchId
    ) {
      toast.info(
        "Open this connection from the youth's profile to edit it",
        {
          description:
            "Overall Connections edits auto-created Tutor Sessions; other connections are edited on their profile.",
        },
      );
      return;
    }
    setEditingConnection(conn);
    setConnectionReadOnly(false);
    setIsConnectionDialogOpen(true);
  };

  const handleViewConnection = (conn: Connection) => {
    // Class Session (US 20051): view in the Connection modal itself, with
    // its Connection + Details tabs read-only.
    if (
      (conn.type === "Class Session" &&
        "classSession" in conn) ||
      // Auto-created Tutor Session (US 20093): Connection + Details tabs,
      // read-only, with its participants and Details > Match.
      (conn.type === "Tutor Session" &&
        "sourceMatchId" in conn) ||
      // Friends First Info Session (US 20145): same two tabs, read-only.
      conn.type === FRIENDS_FIRST_INFO_SESSION_TYPE
    ) {
      setEditingConnection(conn);
      setConnectionReadOnly(true);
      setIsConnectionDialogOpen(true);
      return;
    }
    setViewingConnection(conn);
    setIsViewModalOpen(true);
  };

  /** Advance a connection's status to the next allowed value in its workflow. */
  const handleStatusChange = (
    connId: string,
    newStatus: ConnectionStatus,
  ) => {
    // Admissions Shadow / FPM can only be finalized from the record, where
    // the 17658-D report/Summary and attendance checks (and, for Admissions
    // Shadow, the 17657-C distribution notification) run. Table rows don't
    // carry participant attendance, so finalizing here would bypass them.
    const target = connections.find((c) => c.id === connId);
    if (
      newStatus === "Submitted/Finalized" &&
      (target?.type === "Admissions Shadow" ||
        target?.type === "Family Partnership Meeting")
    ) {
      toast.error(
        `Open the ${target.type} record to set Submitted/Finalized — its documentation and attendance are checked there.`,
      );
      return;
    }
    setConnections((prev) =>
      prev.map((c) =>
        c.id === connId ? { ...c, status: newStatus } : c,
      ),
    );
    // Finalized from the table → complete its Shadow Report task too
    const conn = connections.find((c) => c.id === connId);
    if (conn)
      completeAdmissionShadowReportTask({
        ...conn,
        status: newStatus,
      });
    // Cancelled from the table → cancel its calendar events (US 20047)
    if (
      conn &&
      newStatus === "Cancelled" &&
      conn.status !== "Cancelled" &&
      cancelConnectionCalendarEvents(conn.id) > 0
    )
      toast.success("Calendar sync updated.");
    // Cancelled from the table → High-priority reschedule task (US 17658-E)
    if (conn)
      createConnectionRescheduleTask({
        previousStatus: conn.status ?? null,
        connection: { ...conn, status: newStatus },
        youth: sectionYouth,
      }).then((task) => {
        if (task)
          toast.success(
            `High-priority task "${task.subject}" assigned to ${task.assignedTo.name}.`,
          );
      });
  };

  const handleDeleteConnection = (id: string) => {
    if (isGlobal) {
      toast.info(
        connections.find((c) => c.id === id)?.type ===
          FRIENDS_FIRST_INFO_SESSION_TYPE
          ? "Friends First Info Sessions are not deleted — set Status to Cancelled instead"
          : "Delete connections from the youth's profile",
      );
      return;
    }
    if (
      (
        connections.find((c) => c.id === id) as
          { sourceMatchId?: string } | undefined
      )?.sourceMatchId
    ) {
      toast.error(
        "This Tutor Session is managed by its Tutor Match",
        {
          description:
            "End or remove the Tutor Match to end this connection.",
        },
      );
      return;
    }
    setDeletingConnectionId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingConnectionId) {
      setConnections(
        connections.filter(
          (c) => c.id !== deletingConnectionId,
        ),
      );
      setIsDeleteConfirmOpen(false);
      setDeletingConnectionId(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setDeletingConnectionId(null);
  };

  const handleSubmitConnectionFilters = () => {
    setConnFiltersApplied(true);
  };

  const handleClearConnectionFilters = () => {
    setConnFilterStartDate("");
    setConnFilterEndDate("");
    setConnFilterType("");
    setConnFilterProgram("");
    setConnFilterParticipants("");
    setConnFilterDepartment("");
    setConnFilterAttendedOnly(false);
    setConnFilterHomeVisitOnly(false);
    setConnFiltersApplied(false);
    setSearchText("");
  };

  // Helper function to parse dates for sorting
  const parseDateTime = (dateStr: string, timeStr: string) => {
    if (!dateStr) return new Date(0);
    const [month, day, year] = dateStr.split("/");
    const dateTimeStr = `${year}-${month}-${day}${timeStr ? " " + timeStr : ""}`;
    return new Date(dateTimeStr);
  };

  // Filter and sort connections
  let filteredConnections = sectionConnections.filter(
    (conn) => {
      // Search filter
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesSearch =
          conn.id.toLowerCase().includes(searchLower) ||
          conn.type.toLowerCase().includes(searchLower) ||
          conn.participants
            .toLowerCase()
            .includes(searchLower) ||
          conn.programs.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Applied filters
      if (connFiltersApplied) {
        if (connFilterType && conn.type !== connFilterType)
          return false;
        if (
          connFilterProgram &&
          !conn.programs
            .toLowerCase()
            .includes(connFilterProgram.toLowerCase())
        )
          return false;
        if (
          connFilterParticipants &&
          !conn.participants
            .toLowerCase()
            .includes(connFilterParticipants.toLowerCase())
        )
          return false;
        if (
          connFilterDepartment &&
          conn.department !== connFilterDepartment
        )
          return false;
        if (connFilterAttendedOnly && !conn.attended)
          return false;
        if (connFilterHomeVisitOnly && !conn.homeVisit)
          return false;
      }
      return true;
    },
  );

  // Apply sorting
  if (sortColumn && sortDirection) {
    filteredConnections = [...filteredConnections].sort(
      (a, b) => {
        let aVal: any;
        let bVal: any;

        switch (sortColumn) {
          case "id":
            aVal = parseInt(a.id);
            bVal = parseInt(b.id);
            break;
          case "startDate":
            aVal = parseDateTime(a.startDate, a.startTime);
            bVal = parseDateTime(b.startDate, b.startTime);
            break;
          case "endDate":
            aVal = parseDateTime(a.endDate, a.endTime);
            bVal = parseDateTime(b.endDate, b.endTime);
            break;
          case "type":
            aVal = a.type.toLowerCase();
            bVal = b.type.toLowerCase();
            break;
          case "attended":
            aVal = a.attended ? 1 : 0;
            bVal = b.attended ? 1 : 0;
            break;
          case "participants":
            aVal = a.participants.toLowerCase();
            bVal = b.participants.toLowerCase();
            break;
          case "programs":
            aVal = a.programs.toLowerCase();
            bVal = b.programs.toLowerCase();
            break;
          case "homeVisit":
            aVal = a.homeVisit ? 1 : 0;
            bVal = b.homeVisit ? 1 : 0;
            break;
          default:
            return 0;
        }

        if (aVal < bVal)
          return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal)
          return sortDirection === "asc" ? 1 : -1;
        return 0;
      },
    );
  }

  // Sort indicator component
  const SortIndicator = ({
    column,
  }: {
    column: SortColumn;
  }) => {
    if (sortColumn !== column) {
      return (
        <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />
      );
    }
    if (sortDirection === "asc") {
      return (
        <ArrowUp
          className="h-3 w-3 ml-1"
          style={{ color: "#145F33" }}
        />
      );
    }
    if (sortDirection === "desc") {
      return (
        <ArrowDown
          className="h-3 w-3 ml-1"
          style={{ color: "#145F33" }}
        />
      );
    }
    return <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />;
  };

  return (
    <div className="space-y-5">
      {/* ══════════════════════════════════════════════════════════════ */}
      {/* Connections Card */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        {/* Card Header + Toolbar (matching Relationships layout) */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <div className="flex items-center gap-4">
            <h3 className="text-[13px] font-semibold text-[#080707]">
              {isPhysicalHealth
                ? "Physical Health Connections"
                : "Connections"}
            </h3>
            {/* Total Info Session No Shows Badge (not applicable to Physical Health) */}
            {!isPhysicalHealth && (
              <div
                className="flex items-center gap-2 px-3 py-1 rounded-full"
                style={{
                  backgroundColor: "#fef3f2",
                  border: "1px solid #fecdca",
                }}
              >
                <AlertCircle className="h-3.5 w-3.5 text-[#b42318]" />
                <span className="text-[11px] font-medium text-[#b42318]">
                  Info Session No Shows:{" "}
                  {totalInfoSessionNoShows}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {/* Search Input */}
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              />
              <Input
                type="text"
                placeholder="Search connections..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="h-8 pl-8 pr-3 text-[12px] w-[200px]"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              />
            </div>
            {
              <Button
                variant="default"
                size="sm"
                className="h-8 rounded-full text-[12px] text-white"
                onClick={handleAddConnection}
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <Plus className="h-3 w-3" />
                Add Connection
              </Button>
            }
            <Button
              variant="outline"
              size="sm"
              className={`h-8 rounded-full text-[12px] ${showConnectionFilters ? "ring-1 ring-[#145F33]" : ""}`}
              style={{
                border: showConnectionFilters
                  ? "1px solid #145F33"
                  : "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor: showConnectionFilters
                  ? "#e8f5e9"
                  : "var(--slds-g-color-background-base)",
                color: showConnectionFilters
                  ? "#145F33"
                  : undefined,
              }}
              onClick={() =>
                setShowConnectionFilters(!showConnectionFilters)
              }
            >
              <SlidersHorizontal className="h-3 w-3 mr-1" />
              Filters
              {showConnectionFilters ? (
                <ChevronUp className="h-3 w-3 ml-1" />
              ) : (
                <ChevronDown className="h-3 w-3 ml-1" />
              )}
            </Button>
            {connFiltersApplied && (
              <span
                className="text-[11px] px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: "#145F33" }}
              >
                Filters active
              </span>
            )}
          </div>
        </div>

        {/* Inline Collapsible Filter Bar */}
        <div
          className="grid"
          style={{
            gridTemplateRows: showConnectionFilters
              ? "1fr"
              : "0fr",
            transition: "grid-template-rows 200ms ease-in-out",
          }}
        >
          <div className="overflow-hidden">
            <div
              className="px-4 py-3"
              style={{
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <div className="grid grid-cols-3 gap-3 items-end">
                <div className="space-y-1.5">
                  <Label
                    className="text-[11px]"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Start Date:
                  </Label>
                  <DateInput
                    value={isoToMdy(connFilterStartDate)}
                    onChange={(v) =>
                      ((e) =>
                        setConnFilterStartDate(e.target.value))(
                        { target: { value: mdyToIso(v) } },
                      )
                    }
                    className="h-8 text-[12px]"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    className="text-[11px]"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    End Date:
                  </Label>
                  <DateInput
                    value={isoToMdy(connFilterEndDate)}
                    onChange={(v) =>
                      ((e) =>
                        setConnFilterEndDate(e.target.value))({
                        target: { value: mdyToIso(v) },
                      })
                    }
                    className="h-8 text-[12px]"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    className="text-[11px]"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Type:
                  </Label>
                  <Select
                    value={connFilterType}
                    onValueChange={setConnFilterType}
                  >
                    <SelectTrigger
                      className="h-8 text-[12px]"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((c) => (
                        <SelectItem
                          key={c}
                          value={c}
                          className="text-[12px]"
                        >
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 items-end mt-3">
                <div className="space-y-1.5">
                  <Label
                    className="text-[11px]"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Participants:
                  </Label>
                  <Select
                    value={connFilterParticipants}
                    onValueChange={setConnFilterParticipants}
                  >
                    <SelectTrigger
                      className="h-8 text-[12px]"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {participantOptions.map((p) => (
                        <SelectItem
                          key={p}
                          value={p}
                          className="text-[12px]"
                        >
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label
                    className="text-[11px]"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Program:
                  </Label>
                  <Select
                    value={connFilterProgram}
                    onValueChange={setConnFilterProgram}
                  >
                    <SelectTrigger
                      className="h-8 text-[12px]"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {programOptions.map((p) => (
                        <SelectItem
                          key={p}
                          value={p}
                          className="text-[12px]"
                        >
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label
                    className="text-[11px]"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Department:
                  </Label>
                  <Select
                    value={connFilterDepartment}
                    onValueChange={setConnFilterDepartment}
                  >
                    <SelectTrigger
                      className="h-8 text-[12px]"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map((d) => (
                        <SelectItem
                          key={d}
                          value={d}
                          className="text-[12px]"
                        >
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="connAttendedOnly"
                      checked={connFilterAttendedOnly}
                      onCheckedChange={(checked) =>
                        setConnFilterAttendedOnly(!!checked)
                      }
                    />
                    <Label
                      htmlFor="connAttendedOnly"
                      className="text-[12px] cursor-pointer"
                    >
                      Attended Only
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="connHomeVisitOnly"
                      checked={connFilterHomeVisitOnly}
                      onCheckedChange={(checked) =>
                        setConnFilterHomeVisitOnly(!!checked)
                      }
                    />
                    <Label
                      htmlFor="connHomeVisitOnly"
                      className="text-[12px] cursor-pointer"
                    >
                      Home Visit Only
                    </Label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-8 rounded-full text-[12px] text-white px-5"
                    style={{ backgroundColor: "#145F33" }}
                    onClick={handleSubmitConnectionFilters}
                  >
                    Submit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full text-[12px] px-5"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                    onClick={handleClearConnectionFilters}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {filteredConnections.length === 0 ? (
            <div
              className="text-[13px] text-center py-8"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {connFiltersApplied || searchText
                ? "No connections match your criteria."
                : "No connections recorded yet."}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <th
                    className="px-3 py-2 text-left text-[11px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center">
                      ID
                      <SortIndicator column="id" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 text-left text-[11px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                    onClick={() => handleSort("startDate")}
                  >
                    <div className="flex items-center">
                      START DATE &amp; TIME
                      <SortIndicator column="startDate" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 text-left text-[11px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                    onClick={() => handleSort("endDate")}
                  >
                    <div className="flex items-center">
                      END DATE &amp; TIME
                      <SortIndicator column="endDate" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 text-left text-[11px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                    onClick={() => handleSort("type")}
                  >
                    <div className="flex items-center">
                      CONNECTION TYPE
                      <SortIndicator column="type" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 text-center text-[11px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                    onClick={() => handleSort("attended")}
                  >
                    <div className="flex items-center justify-center">
                      ATTENDED
                      <SortIndicator column="attended" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 text-left text-[11px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                    onClick={() => handleSort("participants")}
                  >
                    <div className="flex items-center">
                      PARTICIPANTS
                      <SortIndicator column="participants" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 text-left text-[11px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                    onClick={() => handleSort("programs")}
                  >
                    <div className="flex items-center">
                      PROGRAM(S)
                      <SortIndicator column="programs" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 text-center text-[11px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                    onClick={() => handleSort("homeVisit")}
                  >
                    <div className="flex items-center justify-center">
                      HOME VISIT
                      <SortIndicator column="homeVisit" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 text-left text-[11px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                    onClick={() => handleSort("status" as any)}
                  >
                    <div className="flex items-center">
                      STATUS
                      <SortIndicator column={"status" as any} />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredConnections.map((conn) => (
                  <tr
                    key={conn.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td
                      className="px-3 py-2.5 text-[13px]"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <button
                        onClick={() =>
                          handleViewConnection(conn)
                        }
                        className="text-[#145F33] hover:underline font-medium cursor-pointer"
                        title={`View connection ${conn.id}`}
                      >
                        {conn.id}
                      </button>
                    </td>
                    <td
                      className="px-3 py-2.5 text-[13px]"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {conn.startDate
                        ? `${conn.startDate}${conn.startTime ? " " + conn.startTime : ""}`
                        : "—"}
                    </td>
                    <td
                      className="px-3 py-2.5 text-[13px]"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {conn.endDate
                        ? `${conn.endDate}${conn.endTime ? " " + conn.endTime : ""}`
                        : "—"}
                    </td>
                    <td
                      className="px-3 py-2.5 text-[13px]"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {conn.type}
                    </td>
                    <td
                      className="px-3 py-2.5 text-center"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={conn.attended}
                        disabled
                        className="cursor-default accent-[#145F33]"
                      />
                    </td>
                    <td
                      className="px-3 py-2.5 text-[13px]"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {conn.participants || "—"}
                    </td>
                    <td
                      className="px-3 py-2.5 text-[13px]"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {conn.programs || "—"}
                    </td>
                    <td
                      className="px-3 py-2.5 text-center"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={conn.homeVisit}
                        disabled
                        className="cursor-default accent-[#145F33]"
                      />
                    </td>
                    {/* Status — read-only badge */}
                    <td
                      className="px-3 py-2.5"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {(() => {
                        const badgeStyle = getStatusBadgeStyle(
                          conn.status,
                        );
                        return (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
                            style={{
                              backgroundColor:
                                badgeStyle.backgroundColor,
                              color: badgeStyle.color,
                              border: badgeStyle.border,
                            }}
                          >
                            {badgeStyle.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td
                      className="px-3 py-2.5 text-[13px]"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleViewConnection(conn)
                          }
                          className="p-1 hover:bg-gray-100 rounded"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            handleEditConnection(conn)
                          }
                          className="p-1 hover:bg-gray-100 rounded"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteConnection(conn.id)
                          }
                          className="p-1 hover:bg-gray-100 rounded"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                          title="Remove"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* View Connection Modal (Read-Only) */}
      {/* ════════════════════════════��═════════════════════════════════ */}
      <Dialog
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
      >
        <DialogContent
          className="sm:max-w-[800px] rounded-[8px] bg-white border border-[#dddbda] max-h-[90vh] overflow-hidden flex flex-col p-0"
          aria-describedby={undefined}
        >
          <DialogHeader className="border-b border-[#dddbda] pb-4 px-6 pt-6 mb-0">
            <DialogTitle className="text-[16px] font-bold text-[#080707]">
              View Connection - {viewingConnection?.id}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b] mt-2">
              Connection details (read-only)
            </DialogDescription>
          </DialogHeader>

          {viewingConnection && (
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label
                      className="text-[11px] font-semibold"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Type
                    </Label>
                    <p className="text-[13px] mt-1">
                      {viewingConnection.type}
                    </p>
                  </div>
                  <div>
                    <Label
                      className="text-[11px] font-semibold"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Department
                    </Label>
                    <p className="text-[13px] mt-1">
                      {viewingConnection.department || "—"}
                    </p>
                  </div>
                  <div>
                    <Label
                      className="text-[11px] font-semibold"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Status
                    </Label>
                    <div className="mt-1">
                      {(() => {
                        const badgeStyle = getStatusBadgeStyle(
                          viewingConnection.status,
                        );
                        return (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
                            style={{
                              backgroundColor:
                                badgeStyle.backgroundColor,
                              color: badgeStyle.color,
                              border: badgeStyle.border,
                            }}
                          >
                            {badgeStyle.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      className="text-[11px] font-semibold"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Start Date & Time
                    </Label>
                    <p className="text-[13px] mt-1">
                      {viewingConnection.startDate}{" "}
                      {viewingConnection.startTime || ""}
                    </p>
                  </div>
                  <div>
                    <Label
                      className="text-[11px] font-semibold"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      End Date & Time
                    </Label>
                    <p className="text-[13px] mt-1">
                      {viewingConnection.endDate || "—"}{" "}
                      {viewingConnection.endTime || ""}
                    </p>
                  </div>
                </div>
                <div>
                  <Label
                    className="text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Location
                  </Label>
                  <p className="text-[13px] mt-1">
                    {viewingConnection.location === "Other" &&
                    (viewingConnection as any).locationOther
                      ? `Other: ${(viewingConnection as any).locationOther}`
                      : viewingConnection.location || "—"}
                  </p>
                </div>
                <div>
                  <Label
                    className="text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Participants
                  </Label>
                  <p className="text-[13px] mt-1">
                    {viewingConnection.participants || "—"}
                  </p>
                </div>
                <div>
                  <Label
                    className="text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Program(s)
                  </Label>
                  <p className="text-[13px] mt-1">
                    {viewingConnection.programs || "—"}
                  </p>
                </div>
                {(viewingConnection.type ===
                  "Individual Info Session" ||
                  viewingConnection.type ===
                    "Group Info Session") && (
                  <>
                    <div>
                      <Label
                        className="text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Language
                      </Label>
                      <p className="text-[13px] mt-1">
                        {viewingConnection.language ===
                          "Other" &&
                        viewingConnection.languageOther
                          ? `Other: ${viewingConnection.languageOther}`
                          : viewingConnection.language || "—"}
                      </p>
                    </div>
                    <div>
                      <Label
                        className="text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Summary
                      </Label>
                      <p className="text-[13px] mt-1 whitespace-pre-wrap">
                        {viewingConnection.summary || "—"}
                      </p>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={viewingConnection.attended}
                      disabled
                      className="h-4 w-4 accent-[#145F33]"
                    />
                    <Label className="text-[13px]">
                      Attended
                    </Label>
                  </div>
                  {viewingConnection.type ===
                    "Individual Info Session" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={viewingConnection.homeVisit}
                        disabled
                        className="h-4 w-4 accent-[#145F33]"
                      />
                      <Label className="text-[13px]">
                        Home Visit
                      </Label>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        viewingConnection.serviceCoordination
                      }
                      disabled
                      className="h-4 w-4 accent-[#145F33]"
                    />
                    <Label className="text-[13px]">
                      Service Coordination
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-[#dddbda] px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setIsViewModalOpen(false)}
              className="rounded-full text-[13px] h-9 px-4"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (viewingConnection) {
                  handleEditConnection(viewingConnection);
                  setIsViewModalOpen(false);
                }
              }}
              className="rounded-full text-[13px] text-white h-9 px-4"
              style={{ backgroundColor: "#145F33" }}
            >
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* Delete Confirmation Dialog */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <Dialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <DialogContent
          className="sm:max-w-md rounded-[8px] bg-white border border-[#dddbda]"
          aria-describedby={undefined}
        >
          <DialogHeader className="border-b border-[#dddbda] pb-4">
            <DialogTitle className="text-[16px] font-bold text-[#080707]">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b] mt-2">
              Are you sure you want to delete this connection
              record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              className="rounded-full text-[13px] h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="rounded-full text-[13px] text-white h-9 px-4"
              style={{ backgroundColor: "#c23934" }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* Create / Edit Connection Dialog — extracted to ConnectionFormDialog */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <ConnectionFormDialog
        isOpen={isConnectionDialogOpen}
        onOpenChange={setIsConnectionDialogOpen}
        editingConnection={editingConnection}
        setEditingConnection={setEditingConnection}
        connections={connections}
        setConnections={setConnections}
        getNextParticipantId={getNextParticipantId}
        relatedAdmissionAttemptOptions={
          relatedAdmissionAttemptOptions
        }
        readOnly={connectionReadOnly}
        youth={youthId ? sectionYouth : undefined}
        mode={
          isGlobal
            ? !editingConnection ||
              editingConnection.type ===
                FRIENDS_FIRST_INFO_SESSION_TYPE
              ? "friends-first"
              : "default"
            : mode
        }
        initialType={
          isGlobal ? FRIENDS_FIRST_INFO_SESSION_TYPE : undefined
        }
        lockType={isGlobal}
        onSaveGeneratedTutorSession={(c) =>
          updateTutorConnection(
            c as unknown as TutorSessionConnection,
          )
        }
      />
    </div>
  );
}