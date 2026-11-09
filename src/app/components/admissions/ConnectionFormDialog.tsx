import React, { useState, useEffect, useRef } from "react";
import { FieldLabel } from "../ui/field";
import { CONSTITUENTS } from "../../data/mockConstituents";
import { Button } from "../ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Check,
  X as XIcon,
  HelpCircle,
  Eye,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Users,
  Upload,
  FileText,
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
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { SubstanceUseAssessmentFields } from "./SubstanceUseAssessmentFields";
import { DateInput } from "../ui/date-input";
import { TimeInput } from "../ui/time-input";
import { RichTextEditor } from "../ui/rich-text-editor";
import { CopingSkillModal } from "./CopingSkillModal";
import { TriggerModal } from "./TriggerModal";
import { StrengthModal } from "./StrengthModal";
import { DetailsTabContent } from "./DetailsTabContent";
import { getFinalizationBlocker } from "./connectionStatusRules";
import {
  INITIAL_CLASSES,
  addModuleToClass,
  upsertSharedClassSession,
  useClassSessionForm,
  ClassSessionConnectionFields,
  ClassSessionDetailsFields,
  ClassSessionPopups,
  type ClassSession,
} from "../pages/Classes";
import {
  constituentRoleOptions,
  nonConstituentRoleOptions,
  participantOptions,
  reasonMissedOptions,
} from "./connectionParticipantOptions";
import { notifyAdmissionsCaseManagerOfScheduling } from "../../lib/connectionSchedulingNotification";
import { createConnectionRescheduleTask } from "../../lib/connectionRescheduleTask";
import { notifyAdmissionShadowFinalized } from "../../lib/admissionShadowFinalizationNotification";
import { syncConnectionToOutlookCalendar } from "../../lib/outlookConnectionCalendarSync";
import {
  createAdmissionShadowReportTask,
  completeAdmissionShadowReportTask,
} from "../../lib/admissionShadowReportTask";
import { MultiSelect } from "../ui/multi-select";
import { toast } from "sonner";
import { getDemoUserName } from "../../lib/demoIdentity";
import {
  CONNECTION_FORM_YOUTH,
  getParentGuardianRelationships,
} from "../../data/mockYouthProgramData";
import { ConnectionFormDialogModals } from "./ConnectionFormDialogModals";
import {
  FRIENDS_FIRST_INFO_SESSION_TYPE,
  firstFriendsFirstSessionError,
  validateFriendsFirstSession,
  type FFSessionErrors,
} from "../../lib/friendsFirstSession";
import {
  createFriendsFirstSession,
  updateFriendsFirstSession,
} from "../../data/friendsFirstSessionStore";

type ConnectionStatus =
  | "Scheduled"
  | "Completed"
  | "Incomplete"
  | "Submitted/Finalized"
  | "Cancelled";

export interface Connection {
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
  /** Summary entered in the Details tab (Transition Meeting, FPM, …) */
  transitionMeetingSummary?: string;
  // Class Session specific fields
  classId?: string;
  comments?: string;
  /** Full session (programs, participants, modules) entered in the
   *  Class Session fields (US 20051). */
  classSession?: ClassSession;
  // Admissions Shadow — Shadow Report fields
  shadowMostSignificantStrength?: string;
  shadowPeerInteractions?: string;
  shadowStaffInteractions?: string;
  shadowBehaviorConcerns?: string;
  shadowExcelledStructures?: string[];
  shadowExcelledOther?: string;
  shadowStruggledStructures?: string[];
  shadowStruggledOther?: string;
  shadowParticipationLevel?: string;
  shadowMood?: string[];
  shadowInteractionStyle?: string[];
  shadowAdditionalComments?: string;
  shadowOverallEvaluation?: string;
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
  /** Stable row identity (Friends First Info Session participants). */
  uid?: string;
  source?: "staff" | "applicant-registration";
  addedInVersion?: number;
  id: number;
  constituentType: "Constituent" | "Non-Constituent";
  /** Verified Constituent ID (Tutor Session source participants and
   *  transition-summary participants). */
  entityId?: string;
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

/** Clinical Assessments → Physical Health Connections (US 20075): the only
 *  types offered, filtered and accepted in "physical-health" mode. Lab/Testing
 *  Appointment and Medical Provider Consultation are Physical Health only. */
export const PHYSICAL_HEALTH_CONNECTION_TYPES = [
  "Annual Physical Appointment",
  "Dentist Appointment",
  "Dietitian/Nutritionist Appointment",
  "Doctor Office Visit",
  "ER Visit",
  "Eye Doctor Appointment",
  "Hearing Doctor Appointment",
  "Lab/Testing Appointment",
  "Medical Hospitalization",
  "Medical Provider Consultation",
  "Nurse Visit",
  "Orthodontist Appointment",
  "Surgery Appointment",
  "Urgent Care Visit",
];

/** Internal Transition Summary → Plan (US 20101): the only types offered
 *  and accepted in "transition-summary" mode. Transition Shadow is not
 *  Admissions Shadow and gets none of its reporting or automation. */
export const TRANSITION_SUMMARY_CONNECTION_TYPES = [
  "Post-Transition Contact",
  "Transition Meeting",
  "Transition Shadow",
];

export type ConnectionsMode =
  | "default"
  | "physical-health"
  | "transition-summary"
  /** Overall Connections: Friends First Info Sessions (US 20145) — a shared
   *  session record that belongs to no youth. Only that Type is offered. */
  | "friends-first";

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
const sessionTypeOptions = ["Program", "Contract", "External"];

// Therapy Session Variant options
const therapySessionVariantOptions = [
  "Individual",
  "Group",
  "Family",
];

const RSVP_OPTIONS = ["Accept", "Tentative", "Decline", "No Response"];

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

// Language options for Info Sessions
const languageOptions = [
  "English",
  "Spanish",
  "Polish",
  "Other",
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

/** Family Partnership Meeting: `list` plus a Parent/Guardian row for each
 *  parent/guardian linked to the youth that is not already in it. Rows only
 *  store a participant name, so presence is matched by name. */
function withLinkedParentGuardians(
  list: ConnectionParticipant[],
  getNextParticipantId: () => number,
  youthId: string,
): ConnectionParticipant[] {
  const present = new Set(
    list.map((p) => p.participant.trim().toLowerCase()),
  );
  const missing = getParentGuardianRelationships(
    youthId,
  )
    .map((r) => `${r.firstName} ${r.lastName}`)
    .filter((name) => !present.has(name.toLowerCase()));
  return [
    ...list,
    ...missing.map((name) => ({
      id: getNextParticipantId(),
      constituentType: "Constituent" as const,
      participant: name,
      role: "Parent/Guardian",
      attended: null,
      reasonMissed: "",
    })),
  ];
}

export interface ConnectionFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingConnection: Connection | null;
  setEditingConnection: (conn: Connection | null) => void;
  connections: Connection[];
  setConnections: React.Dispatch<
    React.SetStateAction<Connection[]>
  >;
  getNextParticipantId: () => number;
  /** Alternate Admissions Profiles for the current youth, shown in
   *  Related Admission Attempt (US 19983). Omit outside Admissions. */
  relatedAdmissionAttemptOptions?: {
    value: string;
    label: string;
  }[];
  /** Pre-selects the Type dropdown when opening a brand-new (non-editing) connection.
   *  Ignored when editingConnection is set. */
  initialType?: string;
  /** When true (with initialType set), renders Type as a readonly field instead
   *  of an editable dropdown — the type is fixed for this entry point. */
  lockType?: boolean;
  /** View mode (Class Session): Connection + Details tabs read-only, Close
   *  only. Requires editingConnection. */
  readOnly?: boolean;
  /** "physical-health": Type limited to PHYSICAL_HEALTH_CONNECTION_TYPES,
   *  Home Visit / Service Coordination not shown or saved, and participants
   *  saved with the record. Default leaves Admissions behavior unchanged. */
  mode?: ConnectionsMode;
  /** True when the connections belong to an Individual constituent whose
   *  saved role is Community Care Member. Community Care Event then omits
   *  its Participant Notes (and offers no Service Coordination); stored
   *  values on existing records are left as they are. */
  communityCareMemberContext?: boolean;
  /** Optional, additive: restricts the Type dropdown to these values (in
   *  this order) and accepts only them on save. Omitted everywhere except
   *  the Community Care member page, so other callers are unchanged. */
  typeOptionsOverride?: string[];
  /** Optional, additive: display text for a Type value (the stored value is
   *  unchanged), e.g. "Community Care File Request" shown as "File Request". */
  typeOptionLabels?: Record<string, string>;
  /** Optional, additive: title for a new connection before a Type is chosen
   *  (default "New Connection / Interaction"). */
  newConnectionTitle?: string;
  /** Optional, additive: names offered in a "Participants List" multi-select above
   *  Participants. Each selected name is a Constituent participant with the
   *  role "Community Care Member". Omitted everywhere else. */
  memberOptions?: string[];
  /** Optional: names pre-selected in that multi-select when a new
   *  connection opens (e.g. the member whose button was clicked). */
  initialMembers?: string[];
  /** Optional label for that multi-select (default "Participants List"). */
  memberFieldLabel?: string;
  /** View mode: shows an Edit button (bottom right) that calls this. */
  onEditFromView?: () => void;
  /** The youth this Connection belongs to (id + display name). Drives the
   *  Youth participant, linked Parent/Guardians and every task, notification
   *  and calendar sync the save creates. Omit only where no youth context
   *  exists; the prototype's sample youth is then used. */
  youth?: { id: string; name: string };
  /**
   * US 20093: saves an edited auto-created Tutor Session (it carries a
   * sourceMatchId) to its own store. On failure the dialog stays open with
   * the draft, shows the error, and runs no follow-up actions.
   */
  onSaveGeneratedTutorSession?: (c: Connection) => {
    ok: boolean;
    error?: string;
    diagnostic?: { errorId: string };
  };
}

export function ConnectionFormDialog({
  isOpen,
  onOpenChange,
  editingConnection,
  setEditingConnection,
  connections,
  setConnections,
  getNextParticipantId,
  initialType,
  lockType,
  relatedAdmissionAttemptOptions,
  readOnly = false,
  mode = "default",
  youth,
  communityCareMemberContext = false,
  typeOptionsOverride,
  typeOptionLabels,
  newConnectionTitle,
  memberOptions,
  initialMembers,
  memberFieldLabel = "Participants List",
  onEditFromView,
  onSaveGeneratedTutorSession,
}: ConnectionFormDialogProps) {
  const formYouth = youth ?? CONNECTION_FORM_YOUTH;
  const isPhysicalHealth = mode === "physical-health";
  const isTransitionSummary = mode === "transition-summary";
  const isFriendsFirstMode = mode === "friends-first";
  // Auto-created Tutor Session (US 20093): its Tutor and Youth come from the
  // Tutor Match and can't be removed or renamed here (attendance and notes
  // stay editable).
  const isSourceParticipant = (
    p?: { entityId?: string } | null,
  ) =>
    !!p?.entityId &&
    !!(editingConnection as { sourceMatchId?: string } | null)
      ?.sourceMatchId;
  const blockSourceChange = () =>
    toast.error("This participant comes from the Tutor Match", {
      description:
        "The Tutor and Youth of an auto-created Tutor Session can't be removed or changed here.",
    });
  const typeOptions = typeOptionsOverride
    ? typeOptionsOverride
    : isFriendsFirstMode
    ? [FRIENDS_FIRST_INFO_SESSION_TYPE]
    : isPhysicalHealth
      ? PHYSICAL_HEALTH_CONNECTION_TYPES
      : isTransitionSummary
        ? TRANSITION_SUMMARY_CONNECTION_TYPES
        : connectionTypeOptions;
  const [connectionFormData, setConnectionFormData] = useState<
    Partial<Connection>
  >({});
  const [connectionParticipants, setConnectionParticipants] =
    useState<ConnectionParticipant[]>([]);
  // FPM Parent/Guardian auto-add runs at most once per open, so a parent the
  // user removes is not re-added. Editing an existing FPM never auto-adds.
  const parentGuardiansAddedRef = useRef(false);

  // Class Session uses the shared Class Session form (same as Classes >
  // New Session) with the Connection rules of US 20051. No Class context
  // here, so Class Name is selectable on a new Connection.
  const isClassSession =
    connectionFormData.type === "Class Session";
  // Friends First Info Session (US 20145): Connection + Details tabs only;
  // saved to the shared session store, not to any youth's list.
  const isFriendsFirstSession =
    connectionFormData.type === FRIENDS_FIRST_INFO_SESSION_TYPE;
  const [ffErrors, setFfErrors] = useState<FFSessionErrors>({});
  // Participant picker: transition-summary mode offers verified
  // constituents and records the Constituent ID; other modes keep the
  // existing name list.
  // Friends First Info Sessions use the same verified-constituent picker, so
  // a Constituent participant keeps a stable Constituent ID.
  const usesVerifiedConstituents =
    isTransitionSummary || isFriendsFirstSession;
  const participantPickerOptions = usesVerifiedConstituents
    ? CONSTITUENTS.map((c) => ({
        value: String(c.id),
        label: c.name,
      }))
    : participantOptions.map((p) => ({ value: p, label: p }));
  const pickParticipant = (val: string) =>
    usesVerifiedConstituents
      ? {
          entityId: val,
          participant:
            CONSTITUENTS.find((c) => String(c.id) === val)
              ?.name ?? "",
        }
      : { participant: val };
  const classSessionForm = useClassSessionForm({
    open: isOpen && isClassSession,
    editing: editingConnection?.classSession ?? null,
    allClasses: INITIAL_CLASSES,
    onModuleCreated: addModuleToClass,
    connectionRules: true,
    readOnly,
  });
  // Community Care: RSVP column + bulk RSVP for selected participants.
  // RSVP column / bulk RSVP: Community Care Event connections only.
  const showRsvp =
    !!communityCareMemberContext &&
    connectionFormData.type === "Community Care Event";
  const [bulkRsvp, setBulkRsvp] = useState("");
  const [selectedParticipantIds, setSelectedParticipantIds] =
    useState<number[]>([]);
  const [inlineEditingId, setInlineEditingId] = useState<
    number | null
  >(null);
  const [inlineEditData, setInlineEditData] = useState<{
    constituentType: "Constituent" | "Non-Constituent";
    entityId?: string;
    participant: string;
    role: string;
    attended: boolean | null;
    reasonMissed: string;
    attendanceNotes?: string;
    otherReasonDetails?: string;
  }>({
    constituentType: "Constituent",
    participant: "",
    role: "",
    attended: null,
    reasonMissed: "",
    attendanceNotes: "",
    otherReasonDetails: "",
  });
  const [
    isAddingInlineParticipant,
    setIsAddingInlineParticipant,
  ] = useState(false);
  const [inlineAddData, setInlineAddData] = useState<{
    constituentType: "Constituent" | "Non-Constituent";
    entityId?: string;
    participant: string;
    role: string;
    attended: boolean | null;
    reasonMissed: string;
    attendanceNotes?: string;
    otherReasonDetails?: string;
  }>({
    constituentType: "Constituent",
    participant: "",
    role: "",
    attended: null,
    reasonMissed: "",
    attendanceNotes: "",
    otherReasonDetails: "",
  });
  const [viewingOtherReason, setViewingOtherReason] = useState<
    string | null
  >(null);
  const [
    editingOtherReasonParticipantId,
    setEditingOtherReasonParticipantId,
  ] = useState<number | null>(null);
  const [
    editingOtherReasonContext,
    setEditingOtherReasonContext,
  ] = useState<"add" | "edit" | "participant" | null>(null);
  const [editedOtherReasonText, setEditedOtherReasonText] =
    useState("");
  const [isOtherReasonDialogOpen, setIsOtherReasonDialogOpen] =
    useState(false);
  const [otherReasonMode, setOtherReasonMode] = useState<
    "add" | "edit" | null
  >(null);
  const [tempOtherReason, setTempOtherReason] = useState("");

  const [locationOther, setLocationOther] = useState("");

  // Modal Tab State
  const [activeTab, setActiveTab] = useState<
    "connection" | "details"
  >("connection");

  // AC5: Universal file attachments for documentation-based connection types
  const [tempAttachments, setTempAttachments] = useState<
    {
      name: string;
      url: string;
      size: string;
      uploadedAt: string;
    }[]
  >([]);

  // Service Coordination Alert
  const [
    showServiceCoordinationAlert,
    setShowServiceCoordinationAlert,
  ] = useState(false);

  // Connection Details State (for Admissions Shadow and Wait List Group)
  const [connectionDetails, setConnectionDetails] = useState<{
    relatedAdmissionAttempt: string;
    summary: string;
    requestedDate?: string;
    reasonForRequest?: string[];
    reasonForRequestOther?: string;
    requestStatus?: string;
    results?: string;
    recommendations?: string;
    // Annual Physical Appointment fields
    reason?: string;
    diagnosis?: string;
    newMedicationPrescribed?: boolean | null;
    // Orthodontist Appointment fields
    orthodontistReason?: string;
    orthodontistDiagnosis?: string;
    orthodontistNewMedication?: string;
    orthodontistRecommendations?: string;
    // Dietitian/Nutritionist Appointment fields
    dietitianReason?: string;
    dietitianDiagnosis?: string;
    dietitianNewMedication?: string;
    dietitianRecommendations?: string;
    // Medical Hospitalization fields
    medHospReason?: string;
    medHospDiagnosis?: string;
    medHospNewMedication?: string;
    medHospRecommendations?: string;
    // Surgery Appointment fields
    surgeryReason?: string;
    surgeryDiagnosis?: string;
    surgeryNewMedication?: string;
    surgeryRecommendations?: string;
    // Urgent Care Visit fields
    urgentCareReason?: string;
    urgentCareDiagnosis?: string;
    urgentCareNewMedication?: string;
    urgentCareRecommendations?: string;
    // ER Visit fields
    erVisitReason?: string;
    erVisitDiagnosis?: string;
    erVisitNewMedication?: string;
    erVisitRecommendations?: string;
    // Doctor Office Visit fields
    doctorReason?: string;
    doctorDiagnosis?: string;
    doctorNewMedication?: string;
    doctorRecommendations?: string;
    // Nurse Visit fields
    nurseVisitReason?: string;
    nurseVisitDiagnosis?: string;
    nurseVisitNewMedication?: string;
    nurseVisitRecommendations?: string;
    // Dentist Appointment fields
    biannualDentalRequirement?: boolean;
    followUp?: string;
    // Parent / Family Contact fields
    themesAddressed?: string;
    contactSummary?: string;
    treatmentTargets?: string[];
    // Milieu Meeting specific fields
    meetingSummary?: string;
  }>({
    relatedAdmissionAttempt: "",
    summary: "",
    reasonForRequest: [],
    newMedicationPrescribed: null,
    biannualDentalRequirement: false,
    treatmentTargets: [],
    meetingSummary: "",
  });

  // Attendance validation popup state
  // Inline validation message (replaces browser showFormError() dialogs).
  const [formError, setFormError] = useState<string | null>(null);
  const showFormError = (message: string) => {
    setFormError(message);
    requestAnimationFrame(() =>
      document
        .getElementById("connection-form-error")
        ?.scrollIntoView({ block: "nearest" }),
    );
  };
  const [showAttendanceWarning, setShowAttendanceWarning] =
    useState(false);
  const [
    completedAttendanceError,
    setCompletedAttendanceError,
  ] = useState(false);

  // Treatment Targets modal state (for Parent / Family Contact)
  const [
    isTreatmentTargetsModalOpen,
    setIsTreatmentTargetsModalOpen,
  ] = useState(false);
  const [
    selectedTreatmentTargets,
    setSelectedTreatmentTargets,
  ] = useState<string[]>([]);

  // Therapy Session Goals state
  const [therapyGoals, setTherapyGoals] = useState<
    { id: number; goal: string; comments: string }[]
  >([
    {
      id: 1,
      goal: "Improve emotional regulation",
      comments: "",
    },
    {
      id: 2,
      goal: "Develop healthy coping strategies",
      comments: "",
    },
    {
      id: 3,
      goal: "Build positive relationships",
      comments: "",
    },
  ]);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] =
    useState(false);
  const [availableYouthGoals, setAvailableYouthGoals] =
    useState<string[]>([]);
  const [selectedGoalsToAdd, setSelectedGoalsToAdd] = useState<
    string[]
  >([]);
  const [therapyGoalModalMode, setTherapyGoalModalMode] =
    useState<"select" | "new-major" | "new-intermediate">(
      "select",
    );
  const [therapyNewGoalName, setTherapyNewGoalName] =
    useState("");
  const [
    therapySelectedMajorForIntermediate,
    setTherapySelectedMajorForIntermediate,
  ] = useState("");

  // Therapy Session Participant Ratings state
  const [participantRatings, setParticipantRatings] = useState<
    ParticipantRating[]
  >([]);
  const [
    isParticipantRatingModalOpen,
    setIsParticipantRatingModalOpen,
  ] = useState(false);
  const [
    editingParticipantRating,
    setEditingParticipantRating,
  ] = useState<ParticipantRating | null>(null);

  // Add Program functionality state
  const [isAddProgramModalOpen, setIsAddProgramModalOpen] =
    useState(false);
  const [selectedPrograms, setSelectedPrograms] = useState<
    string[]
  >([]);
  const [tempSelectedPrograms, setTempSelectedPrograms] =
    useState<string[]>([]);

  // Manage Participants Modal state (for Therapy Session and Milieu Meeting)
  const [
    isManageParticipantsModalOpen,
    setIsManageParticipantsModalOpen,
  ] = useState(false);
  const [tempParticipants, setTempParticipants] = useState<
    ConnectionParticipant[]
  >([]);
  const [
    selectedModalParticipantIds,
    setSelectedModalParticipantIds,
  ] = useState<number[]>([]);

  // Individual Participant Notes state (for Milieu Meeting)
  const [
    individualParticipantNotes,
    setIndividualParticipantNotes,
  ] = useState<
    {
      participantId: number;
      participantName: string;
      notes: string;
    }[]
  >([]);
  const [editingParticipantNote, setEditingParticipantNote] =
    useState<{ participantId: number; notes: string } | null>(
      null,
    );
  const [
    editingNoteParticipantId,
    setEditingNoteParticipantId,
  ] = useState<number | null>(null);
  const [tempNoteValue, setTempNoteValue] = useState("");
  const [
    participantNotesModalOpen,
    setParticipantNotesModalOpen,
  ] = useState(false);
  const [
    participantNotesModalRecord,
    setParticipantNotesModalRecord,
  ] = useState<{
    participantId: number;
    participantName: string;
    participantRole: string;
    duration: string;
    interactionTypes: string[];
    notes: string;
  } | null>(null);

  // Advocate Meeting state - Goals Table
  const [advocateGoals, setAdvocateGoals] = useState<
    { id: number; goal: string; comments: string }[]
  >([]);
  const [
    isAddAdvocateGoalModalOpen,
    setIsAddAdvocateGoalModalOpen,
  ] = useState(false);
  const [editingAdvocateGoal, setEditingAdvocateGoal] =
    useState<{
      id: number;
      goal: string;
      comments: string;
    } | null>(null);
  const [selectedAdvocateGoal, setSelectedAdvocateGoal] =
    useState("");
  const [advocateGoalComments, setAdvocateGoalComments] =
    useState("");
  // AC28-AC30: New goal creation flow
  const [advocateGoalModalMode, setAdvocateGoalModalMode] =
    useState<"select" | "new-major" | "new-intermediate">(
      "select",
    );
  const [dynamicYouthGoals, setDynamicYouthGoals] =
    useState(youthGoalsData);
  const [newGoalName, setNewGoalName] = useState("");
  const [
    selectedMajorForIntermediate,
    setSelectedMajorForIntermediate,
  ] = useState("");

  // Advocate Meeting - Coping Skills Table
  const [advocateCopingSkills, setAdvocateCopingSkills] =
    useState<
      {
        id: number;
        skill: string;
        dateReported: string;
        reportedBy: string;
        relationshipToYouth: string;
        description?: string;
        effectiveWhen?: string;
      }[]
    >([]);
  const [
    isAddCopingSkillModalOpen,
    setIsAddCopingSkillModalOpen,
  ] = useState(false);
  const [editingCopingSkill, setEditingCopingSkill] =
    useState<any>(null);

  // Advocate Meeting - Triggers Table
  const [advocateTriggers, setAdvocateTriggers] = useState<
    {
      id: number;
      trigger: string;
      dateReported: string;
      reportedBy: string;
      relationshipToYouth: string;
      description?: string;
      presentWhen?: string;
    }[]
  >([]);
  const [isAddTriggerModalOpen, setIsAddTriggerModalOpen] =
    useState(false);
  const [editingTrigger, setEditingTrigger] =
    useState<any>(null);

  // Advocate Meeting - Strengths Table
  const [advocateStrengths, setAdvocateStrengths] = useState<
    {
      id: number;
      strength: string;
      dateReported: string;
      reportedBy: string;
      relationshipToYouth: string;
      description?: string;
      demonstratedWhen?: string;
    }[]
  >([]);
  const [isAddStrengthModalOpen, setIsAddStrengthModalOpen] =
    useState(false);
  const [editingStrength, setEditingStrength] =
    useState<any>(null);

  // Advocate Meeting - Treatment Targets
  const [
    selectedAdvocateTreatmentTargets,
    setSelectedAdvocateTreatmentTargets,
  ] = useState<string[]>([]);

  // Advocate Meeting - Text Fields
  const [goalDiscussionSummary, setGoalDiscussionSummary] =
    useState("");
  const [advocateMeetingSummary, setAdvocateMeetingSummary] =
    useState("");

  // Internal ECR Meeting state
  const ECR_PREDEFINED_PURPOSES = [
    "Academic Agreement Review",
    "Career Advising",
    "Employment Advising",
    "Executive Functions Advising",
    "High School Placement Planning",
    "PSO Advising",
    "School Progress Review",
  ];
  const [ecrPurposes, setEcrPurposes] = useState<string[]>([]);
  const [ecrPurposeDialogOpen, setEcrPurposeDialogOpen] =
    useState(false);
  const [ecrPurposeDraft, setEcrPurposeDraft] = useState<
    string[]
  >([]);
  const [ecrPurposeSearch, setEcrPurposeSearch] = useState("");
  const [ecrPurposeOther, setEcrPurposeOther] = useState("");
  const [ecrSummary, setEcrSummary] = useState("");
  const [ecrGoals, setEcrGoals] = useState<
    { id: number; goal: string; comment: string }[]
  >([]);
  const [ecrGoalDialogOpen, setEcrGoalDialogOpen] =
    useState(false);
  const [ecrGoalEditId, setEcrGoalEditId] = useState<
    number | null
  >(null);
  const [ecrGoalDraft, setEcrGoalDraft] = useState({
    goal: "",
    comment: "",
  });
  const [ecrSkills, setEcrSkills] = useState<
    Record<string, string>
  >({});

  // School Meeting state
  const SM_PREDEFINED_PURPOSES = [
    "Academic Discussion or Intervention",
    "Behavioral Discussion or Intervention",
    "IEP / 504",
    "Introduction to School",
    "Other School Incident",
    "Parent Teacher Conference",
    "School Placement",
    "School Withdrawal",
    "Suspension",
    "School Observation",
    "Orientation / Back to School Meeting",
  ];
  const [smPurposes, setSmPurposes] = useState<string[]>([]);
  const [smPurposeDialogOpen, setSmPurposeDialogOpen] =
    useState(false);
  const [smPurposeDraft, setSmPurposeDraft] = useState<
    string[]
  >([]);
  const [smPurposeSearch, setSmPurposeSearch] = useState("");
  const [smSummary, setSmSummary] = useState("");
  const [smIncidents, setSmIncidents] = useState<
    { id: number; incident: string }[]
  >([]);
  const [smIncidentDialogOpen, setSmIncidentDialogOpen] =
    useState(false);
  const [smIncidentEditId, setSmIncidentEditId] = useState<
    number | null
  >(null);
  const [smIncidentDraft, setSmIncidentDraft] = useState("");
  const [smPlans, setSmPlans] = useState<
    { id: number; plan: string }[]
  >([]);
  const [smPlanDialogOpen, setSmPlanDialogOpen] =
    useState(false);
  const [smPlanEditId, setSmPlanEditId] = useState<
    number | null
  >(null);
  const [smPlanDraft, setSmPlanDraft] = useState("");

  // Psychological Evaluation state
  const PE_PREDEFINED_REASONS = [
    "Assessment of Overall Cognitive Functioning",
    "Determine If Learning Disorder Present",
    "DSM-5 Diagnosis Confirmation",
    "Seeking Further Treatment Recommendations",
    "Appropriateness of Fit for Mercy Home",
  ];
  const [peRequestDate, setPeRequestDate] = useState("");
  const [peReasons, setPeReasons] = useState<
    { id: number; reason: string }[]
  >([]);
  const [peReasonDialogOpen, setPeReasonDialogOpen] =
    useState(false);
  const [peReasonEditId, setPeReasonEditId] = useState<
    number | null
  >(null);
  const [peReasonSelected, setPeReasonSelected] = useState("");
  const [peReasonOther, setPeReasonOther] = useState("");
  const [peRequestStatus, setPeRequestStatus] = useState("");
  const [peRationale, setPeRationale] = useState("");
  const [peResults, setPeResults] = useState("");
  const [peRecommendations, setPeRecommendations] =
    useState("");

  // Community Care File Request state
  const [fileRequestReasons, setFileRequestReasons] = useState<
    string[]
  >([]);
  const [isReasonModalOpen, setIsReasonModalOpen] =
    useState(false);
  const [tempReasonOther, setTempReasonOther] = useState("");
  const [fileRequestDocuments, setFileRequestDocuments] =
    useState<string[]>([]);
  const [isDocumentModalOpen, setIsDocumentModalOpen] =
    useState(false);
  const [tempDocumentOther, setTempDocumentOther] =
    useState("");
  const [
    fileRequestContactSummary,
    setFileRequestContactSummary,
  ] = useState("");
  const [fileRequestFollowUp, setFileRequestFollowUp] =
    useState("");
  const [themesAddressedAdvocate, setThemesAddressedAdvocate] =
    useState("");
  const [
    employeeSiteVisitSummary,
    setEmployeeSiteVisitSummary,
  ] = useState("");

  // Family Event state
  const [familyEventType, setFamilyEventType] = useState("");
  const [familyEventTypeOther, setFamilyEventTypeOther] =
    useState("");
  const [familyEventSummary, setFamilyEventSummary] =
    useState("");

  // Mercy Home Activity state
  const [mercyActivityType, setMercyActivityType] =
    useState("");
  const [mercyActivityOther, setMercyActivityOther] =
    useState("");
  const [mercyActivitySummary, setMercyActivitySummary] =
    useState("");

  // Justice, Diversity, and Inclusion Event state
  const [jdiMeetingSummary, setJdiMeetingSummary] =
    useState("");
  const [jdiThemesAddressed, setJdiThemesAddressed] =
    useState("");
  const [jdiSpiritualDevelopment, setJdiSpiritualDevelopment] =
    useState(false);

  // Psychiatric Hospitalization state
  const [psychHospType, setPsychHospType] = useState("");
  const [psychTreatmentType, setPsychTreatmentType] =
    useState("");
  const [psychTreatmentLocation, setPsychTreatmentLocation] =
    useState("");
  const [psychReasonForTreatment, setPsychReasonForTreatment] =
    useState("");
  const [psychOutcomeOfTreatment, setPsychOutcomeOfTreatment] =
    useState("");
  const [psychYouthFeedback, setPsychYouthFeedback] =
    useState("");

  // Tutor Session state
  const [tutorMatch, setTutorMatch] = useState("");
  const [tutorChangeReason, setTutorChangeReason] =
    useState("");
  const [tutorChangeAction, setTutorChangeAction] =
    useState("");
  const [tuteeChangeReason, setTuteeChangeReason] =
    useState("");
  const [tuteeChangeAction, setTuteeChangeAction] =
    useState("");

  // Community Care Contact state
  const [contactPurposeOptions, setContactPurposeOptions] =
    useState<string[]>([
      "Accountability Meeting",
      "Annual Member Check In",
      "Benefits",
      "Care Management Meeting",
      "Care Management Meeting - Unassigned",
      "Community Care Informational",
      "Community Care Paperwork",
      "Community Care Therapy Assessment",
      "Crisis Management",
      "Donation",
      "Engagement Communication",
      "Housing Grant",
      "Launch",
      "Mail Pickup",
      "Member Assignment",
      "Mental Health/Wellness Management",
      "Readmission",
      "Referral",
      "Residential Family Support",
      "Safety Plan",
      "Scholarship Meeting",
      "Therapy Communication",
      "Therapy Grant",
      "Vocational Assessment",
      "Vocational Meeting",
      "Vocational Referral",
    ]);
  const [contactPurpose, setContactPurpose] = useState("");
  const [
    isAddContactPurposeModalOpen,
    setIsAddContactPurposeModalOpen,
  ] = useState(false);
  const [newContactPurpose, setNewContactPurpose] =
    useState("");
  const [interactionType, setInteractionType] = useState("");
  const [contactSummary, setContactSummary] = useState("");
  const [supportProvided, setSupportProvided] = useState("");
  // Get current date and time for defaults
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${month}/${day}/${year}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Date conversion helpers for modals (MM/DD/YYYY <-> YYYY-MM-DD)
  const convertToInputDate = (displayDate: string): string => {
    if (!displayDate) return "";
    // Convert MM/DD/YYYY to YYYY-MM-DD for input type="date"
    const [month, day, year] = displayDate.split("/");
    if (!month || !day || !year) return "";
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const convertToDisplayDate = (inputDate: string): string => {
    if (!inputDate) return "";
    // Convert YYYY-MM-DD to MM/DD/YYYY for display
    const [year, month, day] = inputDate.split("-");
    if (!year || !month || !day) return "";
    return `${month}/${day}/${year}`;
  };

  // Initialize dialog state when opening
  useEffect(() => {
    if (!isOpen) return;
    const getCurrentDateLocal = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(
        2,
        "0",
      );
      const day = String(today.getDate()).padStart(2, "0");
      return `${month}/${day}/${year}`;
    };
    const getCurrentTimeLocal = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    };
    if (editingConnection) {
      parentGuardiansAddedRef.current =
        editingConnection.type === "Family Partnership Meeting";
      setConnectionFormData(editingConnection);
      setActiveTab("connection");
      setShowServiceCoordinationAlert(false);
      setLocationOther(
        (editingConnection as any).locationOther || "",
      );
      setTempAttachments(
        (editingConnection as any).attachments || [],
      );
      setTherapyGoals(
        Array.isArray((editingConnection as any).goals)
          ? (editingConnection as any).goals
          : [],
      );
      // Physical Health (US 20075) and Tutor Session (US 20093) records
      // carry their participant list
      if ((editingConnection as any).participantList)
        setConnectionParticipants(
          (editingConnection as any).participantList,
        );
      if (editingConnection.type === "Advocate Meeting") {
        setAdvocateGoals(
          (editingConnection as any).advocateGoals || [],
        );
        setAdvocateCopingSkills(
          (editingConnection as any).advocateCopingSkills || [],
        );
        setAdvocateTriggers(
          (editingConnection as any).advocateTriggers || [],
        );
        setAdvocateStrengths(
          (editingConnection as any).advocateStrengths || [],
        );
        setSelectedAdvocateTreatmentTargets(
          (editingConnection as any)
            .selectedAdvocateTreatmentTargets || [],
        );
        setGoalDiscussionSummary(
          (editingConnection as any).goalDiscussionSummary ||
            "",
        );
        setAdvocateMeetingSummary(
          (editingConnection as any).advocateMeetingSummary ||
            "",
        );
        setThemesAddressedAdvocate(
          (editingConnection as any).themesAddressedAdvocate ||
            "",
        );
      }
      if (
        editingConnection.type === "Psychiatric Hospitalization"
      ) {
        setPsychHospType(
          (editingConnection as any).psychHospType || "",
        );
        setPsychTreatmentType(
          (editingConnection as any).psychTreatmentType || "",
        );
        setPsychTreatmentLocation(
          (editingConnection as any).psychTreatmentLocation ||
            "",
        );
        setPsychReasonForTreatment(
          (editingConnection as any).psychReasonForTreatment ||
            "",
        );
        setPsychOutcomeOfTreatment(
          (editingConnection as any).psychOutcomeOfTreatment ||
            "",
        );
        setPsychYouthFeedback(
          (editingConnection as any).psychYouthFeedback || "",
        );
      }
      if (editingConnection.type === "Tutor Session") {
        setTutorMatch(
          (editingConnection as any).tutorMatch || "",
        );
        setTutorChangeReason(
          (editingConnection as any).tutorChangeReason || "",
        );
        setTutorChangeAction(
          (editingConnection as any).tutorChangeAction || "",
        );
        setTuteeChangeReason(
          (editingConnection as any).tuteeChangeReason || "",
        );
        setTuteeChangeAction(
          (editingConnection as any).tuteeChangeAction || "",
        );
      }
      if (editingConnection.type === "Mercy Home Activity") {
        setMercyActivityType(
          (editingConnection as any).mercyActivityType || "",
        );
        setMercyActivityOther(
          (editingConnection as any).mercyActivityOther || "",
        );
        setMercyActivitySummary(
          (editingConnection as any).mercyActivitySummary || "",
        );
      }
      if (
        editingConnection.type ===
        "Justice, Diversity, and Inclusion Event"
      ) {
        setJdiMeetingSummary(
          (editingConnection as any).jdiMeetingSummary || "",
        );
        setJdiThemesAddressed(
          (editingConnection as any).jdiThemesAddressed || "",
        );
        setJdiSpiritualDevelopment(
          (editingConnection as any).jdiSpiritualDevelopment ||
            false,
        );
      }
      if (
        editingConnection.type === "Family Partnership Meeting"
      ) {
        setConnectionDetails((prev) => ({
          ...prev,
          summary:
            editingConnection.transitionMeetingSummary || "",
        }));
      }
      if (
        editingConnection.type === "Parent / Family Contact"
      ) {
        setConnectionDetails((prev) => ({
          ...prev,
          themesAddressed:
            (editingConnection as any).themesAddressed || "",
          contactSummary:
            (editingConnection as any).contactSummary || "",
          treatmentTargets:
            (editingConnection as any).treatmentTargets || [],
        }));
      }
    } else {
      // Friends First Info Session: no "now" defaults — staff enter the real
      // schedule, and a session is normally created ahead of time.
      const isNewFriendsFirst =
        initialType === FRIENDS_FIRST_INFO_SESSION_TYPE;
      setConnectionFormData({
        type: initialType || "",
        status: "Scheduled" as ConnectionStatus,
        startDate: isNewFriendsFirst
          ? ""
          : getCurrentDateLocal(),
        endDate: isNewFriendsFirst ? "" : getCurrentDateLocal(),
        startTime: isNewFriendsFirst
          ? ""
          : getCurrentTimeLocal(),
        endTime: "",
        attended: false,
        participants: "",
        programs: "",
        homeVisit: false,
        transitionRelated: false,
        location: "",
        serviceCoordination: false,
        language: "",
        languageOther: "",
        summary: "",
        relatedITP: "",
        transitionPlanningDiscussion: "",
        carePlanningMeetingSummary: "",
      });
      // Transition summary Plan: no sample organizer/youth names (they have
      // no Constituent IDs); participants are added from verified records.
      let initialParticipants: ConnectionParticipant[] =
        isTransitionSummary || isNewFriendsFirst
          ? []
          : [
              {
                id: getNextParticipantId(),
                constituentType: "Constituent",
                participant: getDemoUserName(),
                role: "Organizer",
                attended: null,
                reasonMissed: "",
                isOrganizer: true,
              },
            ];
      const youthContext = formYouth.name;
      if (
        youthContext &&
        // With the member picker, members come only from the picker (and
        // initialMembers), never a "Youth" row or the sample youth.
        !memberOptions &&
        !isTransitionSummary &&
        !isNewFriendsFirst
      ) {
        initialParticipants.push({
          id: getNextParticipantId(),
          constituentType: "Constituent",
          participant: youthContext,
          role: "Youth",
          attended: null,
          reasonMissed: "",
        });
      }
      if (memberOptions && initialMembers) {
        for (const name of initialMembers) {
          initialParticipants.push({
            id: getNextParticipantId(),
            constituentType: "Constituent",
            participant: name,
            role: "Community Care Member",
            attended: null,
            reasonMissed: "",
          });
        }
      }
      parentGuardiansAddedRef.current =
        initialType === "Family Partnership Meeting";
      if (parentGuardiansAddedRef.current) {
        initialParticipants = withLinkedParentGuardians(
          initialParticipants,
          getNextParticipantId,
          formYouth.id,
        );
      }
      setConnectionParticipants(initialParticipants);
      setConnectionDetails({
        relatedAdmissionAttempt: "",
        summary: "",
        treatmentTargets: [],
        themesAddressed: "",
        contactSummary: "",
        meetingSummary: "",
      });
      setSelectedTreatmentTargets([]);
      setSelectedPrograms([]);
      setTempSelectedPrograms([]);
      setSelectedParticipantIds([]);
      setInlineEditingId(null);
      setIsAddingInlineParticipant(false);
      setIndividualParticipantNotes([]);
      setAdvocateGoals([]);
      setAdvocateCopingSkills([]);
      setAdvocateTriggers([]);
      setAdvocateStrengths([]);
      setTherapyGoals([]);
      setSelectedAdvocateTreatmentTargets([]);
      setGoalDiscussionSummary("");
      setAdvocateMeetingSummary("");
      setThemesAddressedAdvocate("");
      setActiveTab("connection");
      setShowServiceCoordinationAlert(false);
      setLocationOther("");
      setTempAttachments([]);
    }
    setShowAttendanceWarning(false);
    setCompletedAttendanceError(false);
    setFormError(null);
    setFfErrors({});
  }, [isOpen, editingConnection, initialType, formYouth.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // If the record open for edit was changed automatically (Scheduled →
  // Incomplete) while the modal is open, show that status — unless the user
  // already changed Status themselves. Only Status is touched.
  useEffect(() => {
    if (!isOpen || !editingConnection) return;
    const live = connections.find(
      (c) => c.id === editingConnection.id,
    );
    if (!live || live.status === editingConnection.status)
      return;
    setConnectionFormData((prev) =>
      prev.status === editingConnection.status
        ? { ...prev, status: live.status }
        : prev,
    );
  }, [connections, isOpen, editingConnection]);

  // Class Session: validated and built by the shared Class Session form,
  // then stored as a Connection (session kept whole on `classSession`).
  const saveClassSessionConnection = () => {
    if (!classSessionForm.validate()) {
      // Every required Class Session field is on the Connection tab
      setActiveTab("connection");
      return;
    }
    const session = classSessionForm.buildSession();
    const conn = {
      ...(editingConnection ?? {}),
      id:
        editingConnection?.id ??
        (Date.now() % 1000000).toString(),
      type: "Class Session",
      status: editingConnection?.status ?? "Scheduled",
      startDate: session.date,
      startTime: session.time,
      endDate: session.endDate,
      endTime: session.endTime,
      attended: session.participants.some(
        (p) => p.attended === true,
      ),
      participants: session.participants
        .map((p) => p.name)
        .join(", "),
      programs: session.programs.map((p) => p.name).join(", "),
      homeVisit: false,
      location: session.campus,
      locationOther: session.otherLocation,
      description: session.description,
      classId: session.classId,
      comments: session.comments,
      classSession: session,
    } as Connection;
    setConnections(
      editingConnection
        ? connections.map((c) => (c.id === conn.id ? conn : c))
        : [conn, ...connections],
    );
    // Same session record the Classes page and Instructor profiles read.
    upsertSharedClassSession(session);
    onOpenChange(false);
    setConnectionFormData({});
  };

  // Friends First Info Session: required fields and chronological order are
  // checked first (entered values stay in the form on failure); participants
  // and attendance are optional so a future session can be saved before any
  // applicant registers. Success is reported only after the store write.
  const saveFriendsFirstSessionRecord = () => {
    const errors = validateFriendsFirstSession({
      ...connectionFormData,
      locationOther,
    });
    setFfErrors(errors);
    const message = firstFriendsFirstSessionError(errors);
    if (message) {
      setActiveTab("connection");
      toast.error(message);
      return;
    }
    if (
      connectionFormData.status === "Completed" &&
      connectionParticipants.some((p) => p.attended === null)
    ) {
      setActiveTab("connection");
      setCompletedAttendanceError(true);
      return;
    }
    setCompletedAttendanceError(false);
    const fields = {
      status: connectionFormData.status ?? "Scheduled",
      startDate: connectionFormData.startDate,
      startTime: connectionFormData.startTime,
      endDate: connectionFormData.endDate,
      endTime: connectionFormData.endTime,
      location: connectionFormData.location,
      locationOther,
      comments: connectionFormData.comments ?? "",
      participantList: connectionParticipants,
    };
    const result = editingConnection
      ? updateFriendsFirstSession(
          editingConnection.id,
          fields,
          (editingConnection as { version?: number }).version,
        )
      : createFriendsFirstSession(fields);
    if (!result.ok) {
      toast.error("Session was not saved", {
        description: result.error,
      });
      return;
    }
    toast.success(
      editingConnection
        ? `Friends First Info Session ${result.session.id} updated.`
        : `Friends First Info Session ${result.session.id} created.`,
    );
    onOpenChange(false);
    setConnectionFormData({});
  };

  const handleSaveConnection = () => {
    setFormError(null);
    if (isClassSession) {
      saveClassSessionConnection();
      return;
    }
    if (isFriendsFirstSession) {
      saveFriendsFirstSessionRecord();
      return;
    }
    // Community Care (Connections section): Members is required.
    if (
      memberOptions &&
      memberFieldLabel === "Members" &&
      !connectionParticipants.some((p) => p.role === "Community Care Member")
    ) {
      showFormError("Please select at least one member.");
      return;
    }
    // Validate all required fields: Type, Start Date, Start Time, End Date, End Time
    if (
      !connectionFormData.type ||
      !connectionFormData.startDate ||
      !connectionFormData.startTime
    ) {
      showFormError(
        "Please fill in all required fields: Type, Start Date, and Start Time.",
      );
      return;
    }
    if (!connectionFormData.endDate) {
      showFormError("Please fill in End Date. End Date is required.");
      return;
    }
    if (!connectionFormData.endTime) {
      showFormError("Please fill in End Time. End Time is required.");
      return;
    }
    if (
      isPhysicalHealth &&
      !PHYSICAL_HEALTH_CONNECTION_TYPES.includes(
        connectionFormData.type,
      )
    ) {
      showFormError("Please select a Physical Health connection type.");
      return;
    }
    if (
      typeOptionsOverride &&
      !typeOptionsOverride.includes(connectionFormData.type ?? "")
    ) {
      showFormError("Please select a connection type from the list.");
      return;
    }
    if (
      isTransitionSummary &&
      !TRANSITION_SUMMARY_CONNECTION_TYPES.includes(
        connectionFormData.type,
      )
    ) {
      showFormError("Please select a transition connection type.");
      return;
    }

    // Psychiatric Hospitalization: Hospitalization Type is mandatory
    if (
      connectionFormData.type ===
        "Psychiatric Hospitalization" &&
      !psychHospType
    ) {
      showFormError("Please select a Hospitalization Type.");
      return;
    }

    // Mercy Home Activity: Activity Type is mandatory
    if (connectionFormData.type === "Mercy Home Activity") {
      if (!mercyActivityType) {
        showFormError(
          "Please select an Activity Type for the Mercy Home Activity.",
        );
        return;
      }
      if (
        mercyActivityType === "Other" &&
        !mercyActivityOther.trim()
      ) {
        showFormError("Please specify the Other Activity Type.");
        return;
      }
    }

    // Class Session: Class Name is mandatory
    if (
      connectionFormData.type === "Class Session" &&
      !connectionFormData.classId
    ) {
      // Class Name lives on the Details tab — show it, then alert once painted
      setActiveTab("details");
      requestAnimationFrame(() =>
        setTimeout(() => showFormError("Class Name is required.")),
      );
      return;
    }

    // Admissions Shadow: at least one participant must be the Assigned Shadow Reporter
    if (
      connectionFormData.type === "Admissions Shadow" &&
      !connectionParticipants.some(
        (p) => p.role === "Assigned Shadow Reporter",
      )
    ) {
      showFormError(
        "An Assigned Shadow Reporter is required for an Admissions Shadow.",
      );
      return;
    }

    // Admissions Shadow: Overall Evaluation and Next Steps is required to
    // save; the rest of the Shadow Report may be left incomplete as a draft.
    if (
      connectionFormData.type === "Admissions Shadow" &&
      !connectionFormData.shadowOverallEvaluation
    ) {
      // The field lives on the Details tab — show and focus it, then alert once painted
      setActiveTab("details");
      requestAnimationFrame(() =>
        setTimeout(() => {
          document
            .getElementById("shadow-overall-evaluation")
            ?.focus();
          showFormError(
            "Overall Evaluation and Next Steps is required.",
          );
        }),
      );
      return;
    }

    // Submitted/Finalized is a manual choice, allowed only once the
    // documentation and attendance rules for the type are met (Admissions
    // Shadow, FPM). The FPM Summary lives in connectionDetails.
    if (connectionFormData.status === "Submitted/Finalized") {
      const blocker = getFinalizationBlocker(
        {
          ...connectionFormData,
          transitionMeetingSummary: connectionDetails.summary,
        },
        connectionParticipants,
      );
      if (blocker) {
        setActiveTab(blocker.tab);
        requestAnimationFrame(() =>
          setTimeout(() => showFormError(blocker.message)),
        );
        return;
      }
    }

    // Therapy Session specific validation
    if (connectionFormData.type === "Therapy Session") {
      if (!connectionFormData.sessionType) {
        showFormError(
          "Please select a Session Type for the Therapy Session.",
        );
        return;
      }
      if (!connectionFormData.therapySessionVariant) {
        showFormError("Please select a Therapy Session Variant.");
        return;
      }
    }

    // AC12: End Date and/or End Time cannot be earlier than Start Date/Time
    if (connectionFormData.endDate) {
      const parseDate = (s: string) => {
        const [m, d, y] = s.split("/");
        return new Date(+y, +m - 1, +d);
      };
      const parseTime = (s: string) => {
        const match = s?.match(
          /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
        );
        if (!match) return null;
        let h = +match[1];
        const min = +match[2];
        const ap = match[3].toUpperCase();
        if (ap === "PM" && h !== 12) h += 12;
        if (ap === "AM" && h === 12) h = 0;
        return h * 60 + min;
      };
      const startDate = parseDate(connectionFormData.startDate);
      const endDate = parseDate(connectionFormData.endDate);
      if (endDate < startDate) {
        showFormError("End Date cannot be before Start Date.");
        return;
      }
      if (
        endDate.getTime() === startDate.getTime() &&
        connectionFormData.endTime &&
        connectionFormData.startTime
      ) {
        const startMins = parseTime(
          connectionFormData.startTime,
        );
        const endMins = parseTime(connectionFormData.endTime);
        if (
          startMins !== null &&
          endMins !== null &&
          endMins < startMins
        ) {
          showFormError(
            "End Time cannot be before Start Time on the same date.",
          );
          return;
        }
      }
    }

    // Validate: Status "Completed" requires all participant attendance to be marked
    if (connectionFormData.status === "Completed") {
      const hasUnmarkedAttendance = connectionParticipants.some(
        (p) => p.attended === null,
      );
      if (hasUnmarkedAttendance) {
        setCompletedAttendanceError(true);
        return;
      }
    }
    setCompletedAttendanceError(false);

    // Check if all participants have blank attendance
    const allAttendanceBlank = connectionParticipants.every(
      (p) => p.attended === null,
    );
    if (allAttendanceBlank) {
      setShowAttendanceWarning(true);
      return;
    }

    saveConnectionData();
  };

  const saveConnectionData = () => {
    // The record as saved — drives the Admissions Case Manager notification.
    let savedConnection: Connection;
    if (editingConnection) {
      savedConnection = {
        ...editingConnection,
        ...connectionFormData,
        locationOther,
        // Attachments are hydrated for every type on open, so write them
        // back on save or they are lost.
        attachments: tempAttachments,
        // Type-specific fields held in their own form state. Each block
        // mirrors what the open effect hydrates for that type, so values are
        // saved and reopened unchanged and unrelated fields stay untouched.
        ...(connectionFormData.type === "Therapy Session" && {
          goals: therapyGoals,
        }),
        ...(connectionFormData.type === "Advocate Meeting" && {
          advocateGoals,
          advocateCopingSkills,
          advocateTriggers,
          advocateStrengths,
          selectedAdvocateTreatmentTargets,
          goalDiscussionSummary,
          advocateMeetingSummary,
          themesAddressedAdvocate,
        }),
        ...(connectionFormData.type ===
          "Psychiatric Hospitalization" && {
          psychHospType,
          psychTreatmentType,
          psychTreatmentLocation,
          psychReasonForTreatment,
          psychOutcomeOfTreatment,
          psychYouthFeedback,
        }),
        ...(connectionFormData.type === "Mercy Home Activity" && {
          mercyActivityType,
          mercyActivityOther,
          mercyActivitySummary,
        }),
        ...(connectionFormData.type ===
          "Justice, Diversity, and Inclusion Event" && {
          jdiMeetingSummary,
          jdiThemesAddressed,
          jdiSpiritualDevelopment,
        }),
        ...(connectionFormData.type ===
          "Parent / Family Contact" && {
          themesAddressed: connectionDetails.themesAddressed,
          contactSummary: connectionDetails.contactSummary,
          treatmentTargets: connectionDetails.treatmentTargets,
        }),
        ...(connectionFormData.type ===
          "Family Partnership Meeting" && {
          transitionMeetingSummary: connectionDetails.summary,
        }),
        // Tutor Session (US 20093): keep its participant records (with
        // their entity ids) and Details fields after editing.
        ...(connectionFormData.type === "Tutor Session" && {
          participantList: connectionParticipants,
          participants: connectionParticipants
            .map((p) => p.participant)
            .filter(Boolean)
            .join(", "),
          tutorMatch,
          tutorChangeReason,
          tutorChangeAction,
          tuteeChangeReason,
          tuteeChangeAction,
        }),
        // Member picker (Community Care): keep the chosen participants.
        ...(memberOptions && {
          participantList: connectionParticipants,
          participants: connectionParticipants
            .filter((p) => p.role !== "Organizer")
            .map((p) => p.participant)
            .filter(Boolean)
            .join(", "),
        }),
        ...(isPhysicalHealth && {
          homeVisit: false,
          serviceCoordination: false,
          participantList: connectionParticipants,
          participants: connectionParticipants
            .map((p) => p.participant)
            .filter(Boolean)
            .join(", "),
        }),
        // Transition summary Plan: participants (with their Constituent
        // IDs) are saved with the record.
        ...(isTransitionSummary && {
          serviceCoordination:
            !!connectionFormData.serviceCoordination,
          participantList: connectionParticipants,
          participants: connectionParticipants
            .map((p) => p.participant)
            .filter(Boolean)
            .join(", "),
        }),
      } as Connection;
      if (
        (savedConnection as { sourceMatchId?: string })
          .sourceMatchId &&
        onSaveGeneratedTutorSession
      ) {
        // Saved by its own store; the list updates from that store.
        const res =
          onSaveGeneratedTutorSession(savedConnection);
        if (!res.ok) {
          toast.error("Connection not saved", {
            description: `${res.error ?? "The change could not be saved."}${res.diagnostic ? ` Reference ${res.diagnostic.errorId}.` : ""}`,
          });
          return; // keep the dialog open with the draft; no follow-ups
        }
      } else
        setConnections(
          connections.map((c) =>
            c.id === editingConnection.id ? savedConnection : c,
          ),
        );
    } else {
      const newConnection: Connection = {
        id: (Date.now() % 1000000).toString(),
        type: connectionFormData.type || "",
        status: "Scheduled", // Default per spec
        startDate: connectionFormData.startDate || "",
        endDate: connectionFormData.endDate || "",
        startTime: connectionFormData.startTime || "",
        endTime: connectionFormData.endTime || "",
        attended: connectionFormData.attended || false,
        participants: connectionFormData.participants || "",
        programs: connectionFormData.programs || "",
        homeVisit: connectionFormData.homeVisit || false,
        transitionRelated:
          connectionFormData.transitionRelated || false,
        location: connectionFormData.location || "",
        locationOther: locationOther || "",
        serviceCoordination:
          connectionFormData.serviceCoordination || false,
        department: connectionFormData.department || "",
        language: connectionFormData.language || "",
        languageOther: connectionFormData.languageOther || "",
        summary: connectionFormData.summary || "",
        // Class Session specific fields
        classId: connectionFormData.classId,
        comments: connectionFormData.comments,
        // Admissions Shadow — Shadow Report fields
        shadowMostSignificantStrength:
          connectionFormData.shadowMostSignificantStrength,
        shadowPeerInteractions:
          connectionFormData.shadowPeerInteractions,
        shadowStaffInteractions:
          connectionFormData.shadowStaffInteractions,
        shadowBehaviorConcerns:
          connectionFormData.shadowBehaviorConcerns,
        shadowExcelledStructures:
          connectionFormData.shadowExcelledStructures,
        shadowExcelledOther:
          connectionFormData.shadowExcelledOther,
        shadowStruggledStructures:
          connectionFormData.shadowStruggledStructures,
        shadowStruggledOther:
          connectionFormData.shadowStruggledOther,
        shadowParticipationLevel:
          connectionFormData.shadowParticipationLevel,
        shadowMood: connectionFormData.shadowMood,
        shadowInteractionStyle:
          connectionFormData.shadowInteractionStyle,
        shadowAdditionalComments:
          connectionFormData.shadowAdditionalComments,
        shadowOverallEvaluation:
          connectionFormData.shadowOverallEvaluation,
        // Therapy Session specific fields
        sessionType: connectionFormData.sessionType,
        therapySessionVariant:
          connectionFormData.therapySessionVariant,
        mood: connectionFormData.mood,
        affect: connectionFormData.affect,
        behavior: connectionFormData.behavior,
        themesAddressed:
          connectionFormData.themesAddressed ||
          connectionDetails.themesAddressed,
        description: connectionFormData.description,
        plan: connectionFormData.plan,
        treatmentTargets:
          connectionFormData.treatmentTargets ||
          connectionDetails.treatmentTargets,
        goals: therapyGoals,
        finalized: connectionFormData.finalized || false,
        // Advocate Meeting specific fields
        advocateGoals: advocateGoals,
        advocateCopingSkills: advocateCopingSkills,
        advocateTriggers: advocateTriggers,
        advocateStrengths: advocateStrengths,
        selectedAdvocateTreatmentTargets:
          selectedAdvocateTreatmentTargets,
        goalDiscussionSummary: goalDiscussionSummary,
        advocateMeetingSummary: advocateMeetingSummary,
        themesAddressedAdvocate: themesAddressedAdvocate,
        // Milieu Meeting specific fields (participant notes)
        ...Object.keys(connectionDetails)
          .filter((key) => key.startsWith("participant_note_"))
          .reduce((acc, key) => {
            acc[key] = connectionDetails[key];
            return acc;
          }, {} as any),
        // Other connection details
        contactSummary: connectionDetails.contactSummary,
        reason: connectionDetails.reason,
        diagnosis: connectionDetails.diagnosis,
        recommendations: connectionDetails.recommendations,
        followUp: connectionDetails.followUp,
        newMedicationPrescribed:
          connectionDetails.newMedicationPrescribed,
        biannualDentalRequirement:
          connectionDetails.biannualDentalRequirement,
        relatedAdmissionAttempt:
          connectionDetails.relatedAdmissionAttempt,
        // Psychiatric Hospitalization specific fields
        psychHospType,
        psychTreatmentType,
        psychTreatmentLocation,
        psychReasonForTreatment,
        psychOutcomeOfTreatment,
        psychYouthFeedback,
        // Tutor Session specific fields
        tutorMatch,
        tutorChangeReason,
        tutorChangeAction,
        tuteeChangeReason,
        tuteeChangeAction,
        // Mercy Home Activity specific fields
        mercyActivityType,
        mercyActivityOther,
        mercyActivitySummary,
        // Justice, Diversity, and Inclusion Event specific fields
        jdiMeetingSummary,
        jdiThemesAddressed,
        jdiSpiritualDevelopment,
        // Transition Meeting specific fields
        transitionMeetingSummary: connectionDetails.summary,
        // AC5: Universal file attachments (documentation-based types)
        attachments: tempAttachments,
        ...(connectionFormData.type === "Tutor Session" && {
          participantList: connectionParticipants,
          participants: connectionParticipants
            .map((p) => p.participant)
            .filter(Boolean)
            .join(", "),
        }),
        // Member picker (Community Care): keep the chosen participants.
        ...(memberOptions && {
          participantList: connectionParticipants,
          participants: connectionParticipants
            .filter((p) => p.role !== "Organizer")
            .map((p) => p.participant)
            .filter(Boolean)
            .join(", "),
        }),
        ...(isPhysicalHealth && {
          homeVisit: false,
          serviceCoordination: false,
          participantList: connectionParticipants,
          participants: connectionParticipants
            .map((p) => p.participant)
            .filter(Boolean)
            .join(", "),
        }),
        // Transition summary Plan: participants (with their Constituent
        // IDs) are saved with the record.
        ...(isTransitionSummary && {
          serviceCoordination:
            !!connectionFormData.serviceCoordination,
          participantList: connectionParticipants,
          participants: connectionParticipants
            .map((p) => p.participant)
            .filter(Boolean)
            .join(", "),
        }),
      };
      savedConnection = newConnection;
      setConnections([newConnection, ...connections]);

      // AC12 & AC13: If this is a Family Partnership Meeting and the constituent attended, update milestone
      if (
        connectionFormData.type === "Family Partnership Meeting"
      ) {
        const youthParticipant = connectionParticipants.find(
          (p) => p.role === "Youth" && p.attended === true,
        );
        if (youthParticipant) {
          console.log(
            `✅ Family Partnership Meeting milestone updated for ${youthParticipant.participant}`,
          );
          console.log(
            `📅 Date: ${connectionFormData.startDate}`,
          );
          console.log(`🔗 Connection ID: ${newConnection.id}`);
          // In a real implementation, this would update the Case Details Process Steps
          // with the earliest Family Partnership Meeting date and a hyperlink to this connection
        }
      }

      // Staff Meeting milestone logic (existing functionality)
      if (
        connectionFormData.type === "Staff Meeting" ||
        connectionFormData.type === "Staffing Meeting"
      ) {
        const youthParticipant = connectionParticipants.find(
          (p) => p.role === "Youth" && p.attended === true,
        );
        if (youthParticipant) {
          console.log(
            `✅ Staff Meeting milestone updated for ${youthParticipant.participant}`,
          );
          console.log(
            `📅 Date: ${connectionFormData.startDate}`,
          );
          console.log(`🔗 Connection ID: ${newConnection.id}`);
          // In a real implementation, this would update the Case Details Process Steps
          // with the earliest Staff Meeting date and a hyperlink to this connection
        }
      }

      // AC12 & AC13: Admissions Shadow milestone logic
      if (connectionFormData.type === "Admissions Shadow") {
        const youthParticipant = connectionParticipants.find(
          (p) => p.role === "Youth" && p.attended === true,
        );
        if (youthParticipant) {
          console.log(
            `✅ Admissions Shadow milestone updated for ${youthParticipant.participant}`,
          );
          console.log(
            `📅 Date: ${connectionFormData.startDate}`,
          );
          console.log(`🔗 Connection ID: ${newConnection.id}`);
          // In a real implementation, this would update the Case Details Process Steps
          // with the earliest Admissions Shadow date and a hyperlink to this connection
        }
      }

      // AC12 & AC13: Admissions Clinical Assessment milestone logic
      if (
        connectionFormData.type ===
        "Admissions Clinical Assessment"
      ) {
        const youthParticipant = connectionParticipants.find(
          (p) => p.role === "Youth" && p.attended === true,
        );
        if (youthParticipant) {
          console.log(
            `✅ Clinical Assessment milestone updated for ${youthParticipant.participant}`,
          );
          console.log(
            `📅 Date: ${connectionFormData.startDate}`,
          );
          console.log(`🔗 Connection ID: ${newConnection.id}`);
          // In a real implementation, this would update the Case Details Process Steps
          // with the earliest Clinical Assessment date and a hyperlink to this connection
        }
      }

      // AC13, AC14, AC15: Annual Physical Appointment milestone logic
      // Updates the "Annual Physical" date in Health Overview > Physical Health > General > Key Medical Dates
      if (
        connectionFormData.type ===
        "Annual Physical Appointment"
      ) {
        const youthParticipant = connectionParticipants.find(
          (p) => p.role === "Youth" && p.attended === true,
        );
        if (youthParticipant) {
          console.log(
            `✅ Annual Physical milestone updated for ${youthParticipant.participant}`,
          );
          console.log(
            `📅 Date: ${connectionFormData.startDate}`,
          );
          console.log(`🔗 Connection ID: ${newConnection.id}`);
          // In a real implementation, this would:
          // 1. Update the Youth's Health Overview > Physical Health > General > Key Medical Dates
          // 2. Display the most recent Annual Physical Appointment date where Attendance = "Yes"
          // 3. Create a hyperlink to this connection record
          // 4. If multiple records exist with Attendance = "Yes", show only the most recent
          // 5. Exclude any cancelled appointments from the Key Medical Dates display
        }
      }

      // AC13, AC14, AC15: Dentist Appointment milestone logic (DUAL-CONDITION)
      // Updates the "Biannual Dental" date in Health Overview > Physical Health > General > Key Medical Dates
      // REQUIRES BOTH: Attendance = "Yes" AND biannualDentalRequirement checkbox = TRUE
      if (connectionFormData.type === "Dentist Appointment") {
        const youthParticipant = connectionParticipants.find(
          (p) => p.role === "Youth" && p.attended === true,
        );
        // Check BOTH conditions: Youth attended AND biannual requirement is checked
        if (
          youthParticipant &&
          connectionDetails.biannualDentalRequirement === true
        ) {
          console.log(
            `✅ Biannual Dental milestone updated for ${youthParticipant.participant}`,
          );
          console.log(
            `📅 Date: ${connectionFormData.startDate}`,
          );
          console.log(`🔗 Connection ID: ${newConnection.id}`);
          console.log(
            `✓ Biannual Dental Requirement: ${connectionDetails.biannualDentalRequirement}`,
          );
          // In a real implementation, this would:
          // 1. Update the Youth's Health Overview > Physical Health > General > Key Medical Dates
          // 2. Display the most recent Dentist Appointment date where:
          //    - Attendance = "Yes" AND
          //    - "This appointment satisfies this youth's biannual dental requirement" is checked (TRUE)
          // 3. Create a hyperlink to this connection record
          // 4. If multiple records meet both conditions, show only the most recent
          // 5. Exclude any cancelled appointments from the Key Medical Dates display
        } else if (
          youthParticipant &&
          !connectionDetails.biannualDentalRequirement
        ) {
          console.log(
            `ℹ️ Dentist Appointment saved but does NOT update Biannual Dental milestone`,
          );
          console.log(
            `   Reason: Biannual dental requirement checkbox was not checked`,
          );
        }
      }

      // AC13, AC14, AC15: Eye Doctor Appointment milestone logic
      // Updates the "Vision" date in Health Overview > Physical Health > General > Key Medical Dates
      if (
        connectionFormData.type === "Eye Doctor Appointment"
      ) {
        const youthParticipant = connectionParticipants.find(
          (p) => p.role === "Youth" && p.attended === true,
        );
        if (youthParticipant) {
          console.log(
            `✅ Vision milestone updated for ${youthParticipant.participant}`,
          );
          console.log(
            `📅 Date: ${connectionFormData.startDate}`,
          );
          console.log(`🔗 Connection ID: ${newConnection.id}`);
          // In a real implementation, this would:
          // 1. Update the Youth's Health Overview > Physical Health > General > Key Medical Dates
          // 2. Display the most recent Eye Doctor Appointment date where Attendance = "Yes"
          // 3. Create a hyperlink to this connection record
          // 4. If multiple records exist with Attendance = "Yes", show only the most recent
          // 5. Exclude any cancelled appointments from the Key Medical Dates display
        }
      }
    }
    // Transition summary Plan connections have no notification, calendar
    // or task requirements; the Admissions follow-ups below don't run.
    if (!isTransitionSummary) {
      // One save → at most one scheduling notification (new Admissions Shadow /
      // FPM, or its Start Date/Time changed, saved by someone other than the
      // youth's Admissions Case Manager).
      void notifyAdmissionsCaseManagerOfScheduling({
        original: editingConnection,
        updated: savedConnection,
        youth: formYouth,
      }).then((sent) => {
        if (sent)
          toast.success(
            `${sent.notification.content.title}: ${sent.notification.recipient.name} (Admissions Case Manager) has been notified.`,
          );
      });

      // Admissions Shadow / FPM → keep their calendar events in sync (staff
      // participants + program shared calendar) (US 20047, prototype layer).
      const calendarSync = syncConnectionToOutlookCalendar({
        previousConnection: editingConnection,
        connection: savedConnection,
        participants: connectionParticipants,
        youth: formYouth,
      });
      if (
        calendarSync.created +
        calendarSync.updated +
        calendarSync.cancelled
      )
        toast.success("Calendar sync updated.");

      // Admissions Shadow / FPM saved INTO Cancelled → one High-priority
      // reschedule task for the youth's Admissions Case Manager (US 17658-E).
      createConnectionRescheduleTask({
        previousStatus: editingConnection?.status ?? null,
        connection: savedConnection,
        youth: formYouth,
      }).then((task) => {
        if (task)
          toast.success(
            `High-priority task "${task.subject}" assigned to ${task.assignedTo.name}.`,
          );
      });

      // Admissions Shadow saved as Submitted/Finalized → its Shadow Report task
      // is Completed, which stops its reminders (US 17656-D).
      // Then, once finalized: the distribution notification (US 17657-C) —
      // only on the move INTO Submitted/Finalized, after validation passed.
      const previousStatus = editingConnection?.status ?? null;
      const sendFinalizedDistribution = () =>
        notifyAdmissionShadowFinalized({
          previousStatus,
          connection: savedConnection,
          youth: formYouth,
        })
          .then((sent) => {
            if (sent)
              toast.success(
                `Admission Shadow Report Submitted: ${sent.notifications.length} staff notified.`,
              );
          })
          .catch(() =>
            toast.error(
              "The finalization notification could not be sent.",
            ),
          );
      if (editingConnection) {
        // Edit: never a new task; complete the existing one when finalized
        completeAdmissionShadowReportTask(savedConnection);
        sendFinalizedDistribution();
      } else {
        // New: create the task first (Assigned Shadow Reporter, due 24 hours
        // after End Date/Time), then complete it if saved as finalized
        createAdmissionShadowReportTask({
          connection: savedConnection,
          participants: connectionParticipants,
          youth: formYouth,
        })
          .then((task) => {
            if (task) {
              toast.success(
                `Shadow Report task assigned to ${task.assignedTo.name}.`,
              );
              completeAdmissionShadowReportTask(
                savedConnection,
              );
            }
            sendFinalizedDistribution();
          })
          .catch(() =>
            toast.error(
              "The Shadow Report task could not be created.",
            ),
          );
      }
    }

    onOpenChange(false);
    setConnectionFormData({});
    setShowServiceCoordinationAlert(false);
    setShowAttendanceWarning(false);
    setCompletedAttendanceError(false);
    setTempAttachments([]);
    // Reset Psychiatric Hospitalization fields
    setPsychHospType("");
    setPsychTreatmentType("");
    setPsychTreatmentLocation("");
    setPsychReasonForTreatment("");
    setPsychOutcomeOfTreatment("");
    setPsychYouthFeedback("");
    // Reset Tutor Session fields
    setTutorMatch("");
    setTutorChangeReason("");
    setTutorChangeAction("");
    setTuteeChangeReason("");
    setTuteeChangeAction("");
    // Reset Mercy Home Activity fields
    setMercyActivityType("");
    setMercyActivityOther("");
    setMercyActivitySummary("");
    // Reset JDI Event fields
    setJdiMeetingSummary("");
    setJdiThemesAddressed("");
    setJdiSpiritualDevelopment(false);
  };
  // Finalize and Submit handler for Therapy Session and Milieu Meeting
  const handleFinalizeAndSubmit = () => {
    // Run the same validation as Save
    if (
      !connectionFormData.type ||
      !connectionFormData.startDate ||
      !connectionFormData.startTime
    ) {
      showFormError(
        "Please fill in all required fields: Type, Start Date, and Start Time.",
      );
      return;
    }

    if (connectionFormData.type === "Therapy Session") {
      if (!connectionFormData.sessionType) {
        showFormError(
          "Please select a Session Type for the Therapy Session.",
        );
        return;
      }
      if (!connectionFormData.therapySessionVariant) {
        showFormError("Please select a Therapy Session Variant.");
        return;
      }
    }

    // Check attendance
    const allAttendanceBlank = connectionParticipants.every(
      (p) => p.attended === null,
    );
    if (allAttendanceBlank) {
      setShowAttendanceWarning(true);
      return;
    }

    // Mark as finalized
    connectionFormData.finalized = true;

    // For Milieu Meeting, include meeting summary and participant notes
    if (connectionFormData.type === "Milieu meeting") {
      connectionFormData.meetingSummary =
        connectionDetails.meetingSummary;
      connectionFormData.individualParticipantNotes =
        individualParticipantNotes;
    }

    saveConnectionData();

    // Add to Program Log (simulated)
    if (connectionFormData.type === "Therapy Session") {
      console.log(
        "✅ Therapy Session finalized and added to Program Log",
      );
      console.log(
        "Session Type:",
        connectionFormData.sessionType,
      );
      console.log(
        "Variant:",
        connectionFormData.therapySessionVariant,
      );
      console.log("Goals:", therapyGoals);
      console.log("Participant Ratings:", participantRatings);
    } else if (connectionFormData.type === "Milieu meeting") {
      console.log("✅ Milieu Meeting finalized and submitted");
      console.log(
        "Themes Addressed:",
        connectionDetails.themesAddressed,
      );
      console.log(
        "Meeting Summary:",
        connectionDetails.meetingSummary,
      );
      console.log(
        "Individual Participant Notes:",
        individualParticipantNotes,
      );
    }
  };

  // Type change handler with conditional logic
  const handleTypeChange = (newType: string) => {
    const currentType = connectionFormData.type;

    // FPM: add any missing linked Parent/Guardians, once per open
    if (
      newType === "Family Partnership Meeting" &&
      !parentGuardiansAddedRef.current
    ) {
      parentGuardiansAddedRef.current = true;
      setConnectionParticipants(
        withLinkedParentGuardians(
          connectionParticipants,
          getNextParticipantId,
          formYouth.id,
        ),
      );
    }

    // Friends First Info Session: no sample organizer/youth and no "now"
    // defaults — staff enter the real schedule and participants.
    if (
      newType === FRIENDS_FIRST_INFO_SESSION_TYPE &&
      !editingConnection
    ) {
      setConnectionParticipants([]);
      setSelectedParticipantIds([]);
      setIsAddingInlineParticipant(false);
      setFfErrors({});
      setConnectionFormData({
        ...connectionFormData,
        type: newType,
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        location: "",
      });
      return;
    }

    // If editing and switching between Info Session types, allow it
    if (editingConnection) {
      const isCurrentInfoSession =
        currentType === "Individual Info Session" ||
        currentType === "Group Info Session";
      const isNewInfoSession =
        newType === "Individual Info Session" ||
        newType === "Group Info Session";

      if (isCurrentInfoSession && isNewInfoSession) {
        // Switching from Individual to Group removes Home Visit
        if (newType === "Group Info Session") {
          setConnectionFormData({
            ...connectionFormData,
            type: newType,
            homeVisit: false,
          });
        } else {
          setConnectionFormData({
            ...connectionFormData,
            type: newType,
          });
        }
        return;
      }
    }

    // For new records or non-info-session types, update with defaults
    if (newType === "Therapy Session") {
      // Set defaults for Therapy Session: Contract and Individual
      setConnectionFormData({
        ...connectionFormData,
        type: newType,
        sessionType: "Program",
        therapySessionVariant: "Individual",
      });
    } else {
      setConnectionFormData({
        ...connectionFormData,
        type: newType,
      });
    }
  };

  // Service Coordination handler
  const handleServiceCoordinationChange = (
    checked: boolean,
  ) => {
    setConnectionFormData({
      ...connectionFormData,
      serviceCoordination: checked,
    });
    setShowServiceCoordinationAlert(checked);
  };

  // Participant Handlers
  const handleToggleParticipantSelection = (id: number) => {
    setSelectedParticipantIds((prev) =>
      prev.includes(id)
        ? prev.filter((pid) => pid !== id)
        : [...prev, id],
    );
  };

  const handleToggleAllParticipants = () => {
    // Don't select organizer
    const selectableParticipants =
      connectionParticipants.filter((p) => !p.isOrganizer);
    if (
      selectedParticipantIds.length ===
      selectableParticipants.length
    ) {
      setSelectedParticipantIds([]);
    } else {
      setSelectedParticipantIds(
        selectableParticipants.map((p) => p.id),
      );
    }
  };

  const handleBulkSetAttended = () => {
    if (selectedParticipantIds.length === 0) return;
    setConnectionParticipants(
      connectionParticipants.map((p) =>
        selectedParticipantIds.includes(p.id)
          ? { ...p, attended: true, reasonMissed: "" }
          : p,
      ),
    );
    setSelectedParticipantIds([]);
  };

  const handleBulkSetNotAttended = () => {
    if (selectedParticipantIds.length === 0) return;
    setConnectionParticipants(
      connectionParticipants.map((p) =>
        selectedParticipantIds.includes(p.id)
          ? { ...p, attended: false }
          : p,
      ),
    );
    setSelectedParticipantIds([]);
  };

  const handleBulkRemoveParticipants = () => {
    if (selectedParticipantIds.length === 0) return;
    setConnectionParticipants(
      connectionParticipants.filter(
        (p) => !selectedParticipantIds.includes(p.id),
      ),
    );
    setSelectedParticipantIds([]);
  };

  const handleBulkSetUnknown = () => {
    if (selectedParticipantIds.length === 0) return;
    setConnectionParticipants(
      connectionParticipants.map((p) =>
        selectedParticipantIds.includes(p.id)
          ? { ...p, attended: false, reasonMissed: "Unknown" }
          : p,
      ),
    );
    setSelectedParticipantIds([]);
  };

  // Bulk actions for Manage Participants Modal
  const handleBulkSetAttendedInModal = () => {
    if (selectedModalParticipantIds.length === 0) return;
    setTempParticipants(
      tempParticipants.map((p) =>
        selectedModalParticipantIds.includes(p.id)
          ? { ...p, attended: true, reasonMissed: "" }
          : p,
      ),
    );
    setSelectedModalParticipantIds([]);
  };

  const handleBulkSetNotAttendedInModal = () => {
    if (selectedModalParticipantIds.length === 0) return;
    setTempParticipants(
      tempParticipants.map((p) =>
        selectedModalParticipantIds.includes(p.id)
          ? { ...p, attended: false }
          : p,
      ),
    );
    setSelectedModalParticipantIds([]);
  };

  const handleBulkRemoveParticipantsInModal = () => {
    if (selectedModalParticipantIds.length === 0) return;
    setTempParticipants(
      tempParticipants.filter(
        (p) => !selectedModalParticipantIds.includes(p.id),
      ),
    );
    setSelectedModalParticipantIds([]);
  };

  const handleToggleAllModalParticipants = () => {
    const selectableParticipants = tempParticipants.filter(
      (p) => !p.isOrganizer,
    );
    if (
      selectedModalParticipantIds.length ===
      selectableParticipants.length
    ) {
      setSelectedModalParticipantIds([]);
    } else {
      setSelectedModalParticipantIds(
        selectableParticipants.map((p) => p.id),
      );
    }
  };

  // Add Goal Modal Handlers
  const handleOpenAddGoalModal = () => {
    const youthGoalsList = [
      "Improve emotional regulation",
      "Develop healthy coping strategies",
      "Build positive relationships",
      "Enhance communication skills",
      "Manage anxiety effectively",
      "Improve self-esteem",
      "Develop conflict resolution skills",
      "Practice mindfulness techniques",
      "Build trust with caregivers",
      "Improve anger management",
    ];
    setAvailableYouthGoals(youthGoalsList);
    setSelectedGoalsToAdd([]);
    setTherapyGoalModalMode("select");
    setTherapyNewGoalName("");
    setTherapySelectedMajorForIntermediate("");
    setIsAddGoalModalOpen(true);
  };

  const handleSaveNewTherapyMajorGoal = () => {
    if (!therapyNewGoalName.trim()) return;
    const name = therapyNewGoalName.trim();
    setAvailableYouthGoals((prev) =>
      prev.includes(name) ? prev : [...prev, name],
    );
    setSelectedGoalsToAdd((prev) =>
      prev.includes(name) ? prev : [...prev, name],
    );
    setTherapyGoalModalMode("select");
    setTherapyNewGoalName("");
  };

  const handleSaveNewTherapyIntermediateGoal = () => {
    if (
      !therapyNewGoalName.trim() ||
      !therapySelectedMajorForIntermediate
    )
      return;
    const name = therapyNewGoalName.trim();
    setAvailableYouthGoals((prev) =>
      prev.includes(name) ? prev : [...prev, name],
    );
    setSelectedGoalsToAdd((prev) =>
      prev.includes(name) ? prev : [...prev, name],
    );
    setTherapyGoalModalMode("select");
    setTherapyNewGoalName("");
    setTherapySelectedMajorForIntermediate("");
  };

  const handleToggleGoalSelection = (goal: string) => {
    setSelectedGoalsToAdd((prev) =>
      prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : [...prev, goal],
    );
  };

  const handleAddSelectedGoals = () => {
    // Filter out goals that are already in the table
    const existingGoalTexts = therapyGoals.map((g) => g.goal);
    const newGoals = selectedGoalsToAdd
      .filter((goal) => !existingGoalTexts.includes(goal))
      .map((goal) => ({
        id: Date.now() + Math.random(),
        goal: goal,
        comments: "",
      }));

    setTherapyGoals([...therapyGoals, ...newGoals]);
    setIsAddGoalModalOpen(false);
    setSelectedGoalsToAdd([]);
  };

  // Advocate Meeting Handlers - Goals
  const handleOpenAdvocateGoalModal = (goal?: {
    id: number;
    goal: string;
    comments: string;
  }) => {
    if (goal) {
      setEditingAdvocateGoal(goal);
      setSelectedAdvocateGoal(goal.goal);
      setAdvocateGoalComments(goal.comments);
    } else {
      setEditingAdvocateGoal(null);
      setSelectedAdvocateGoal("");
      setAdvocateGoalComments("");
    }
    setAdvocateGoalModalMode("select");
    setNewGoalName("");
    setSelectedMajorForIntermediate("");
    setIsAddAdvocateGoalModalOpen(true);
  };

  const handleSaveAdvocateGoal = () => {
    if (!selectedAdvocateGoal) return;

    if (editingAdvocateGoal) {
      setAdvocateGoals(
        advocateGoals.map((g) =>
          g.id === editingAdvocateGoal.id
            ? {
                ...g,
                goal: selectedAdvocateGoal,
                comments: advocateGoalComments,
              }
            : g,
        ),
      );
    } else {
      setAdvocateGoals([
        ...advocateGoals,
        {
          id: Date.now(),
          goal: selectedAdvocateGoal,
          comments: advocateGoalComments,
        },
      ]);
    }

    setIsAddAdvocateGoalModalOpen(false);
    setEditingAdvocateGoal(null);
    setSelectedAdvocateGoal("");
    setAdvocateGoalComments("");
  };

  // AC29: Save a new Major Goal — adds to youth profile (dynamicYouthGoals), auto-selects
  const handleSaveNewMajorGoal = () => {
    if (!newGoalName.trim()) return;
    const newEntry = {
      goal: newGoalName.trim(),
      status: "Active" as const,
      type: "Major" as const,
    };
    setDynamicYouthGoals((prev) => [...prev, newEntry]);
    setSelectedAdvocateGoal(newEntry.goal);
    setAdvocateGoalModalMode("select");
    setNewGoalName("");
  };

  // AC30: Save a new Intermediate Goal — requires a Major Goal association
  const handleSaveNewIntermediateGoal = () => {
    if (!newGoalName.trim() || !selectedMajorForIntermediate)
      return;
    const newEntry = {
      goal: newGoalName.trim(),
      status: "Active" as const,
      type: "Intermediate" as const,
      majorGoal: selectedMajorForIntermediate,
    };
    setDynamicYouthGoals((prev) => [...prev, newEntry]);
    setSelectedAdvocateGoal(newEntry.goal);
    setAdvocateGoalModalMode("select");
    setNewGoalName("");
    setSelectedMajorForIntermediate("");
  };

  const handleDeleteAdvocateGoal = (id: number) => {
    setAdvocateGoals(advocateGoals.filter((g) => g.id !== id));
  };

  // Advocate Meeting Handlers - Coping Skills
  const handleOpenCopingSkillModal = (skill?: any) => {
    if (skill) {
      setEditingCopingSkill(skill);
    } else {
      setEditingCopingSkill(null);
    }
    setIsAddCopingSkillModalOpen(true);
  };

  const handleSaveCopingSkill = (data: any) => {
    // Map modal data structure to advocateCopingSkills structure (MM/DD/YYYY throughout)
    const mappedData = {
      skill: data.copingSkill,
      dateReported: data.dateReported || "",
      reportedBy: getDemoUserName(),
      relationshipToYouth: "Advocate",
      description: data.description || "",
      effectiveWhen: data.effectiveWhen || "",
      lastITPInclusion: data.lastITPInclusion || "",
    };

    if (editingCopingSkill) {
      setAdvocateCopingSkills(
        advocateCopingSkills.map((s) =>
          s.id === editingCopingSkill.id
            ? { ...s, ...mappedData }
            : s,
        ),
      );
    } else {
      setAdvocateCopingSkills([
        ...advocateCopingSkills,
        { id: Date.now(), ...mappedData },
      ]);
    }

    setIsAddCopingSkillModalOpen(false);
    setEditingCopingSkill(null);
  };

  const handleDeleteCopingSkill = (id: number) => {
    setAdvocateCopingSkills(
      advocateCopingSkills.filter((s) => s.id !== id),
    );
  };

  // Advocate Meeting Handlers - Triggers
  const handleOpenTriggerModal = (trigger?: any) => {
    if (trigger) {
      setEditingTrigger(trigger);
    } else {
      setEditingTrigger(null);
    }
    setIsAddTriggerModalOpen(true);
  };

  const handleSaveTrigger = (data: any) => {
    // Map modal data structure to advocateTriggers structure (MM/DD/YYYY throughout)
    const mappedData = {
      trigger: data.trigger,
      dateReported: data.dateReported || "",
      reportedBy: getDemoUserName(),
      relationshipToYouth: "Advocate",
      description: data.description || "",
      lastITPInclusion: data.lastITPInclusion || "",
      endDate: data.endDate || "",
    };

    if (editingTrigger) {
      setAdvocateTriggers(
        advocateTriggers.map((t) =>
          t.id === editingTrigger.id
            ? { ...t, ...mappedData }
            : t,
        ),
      );
    } else {
      setAdvocateTriggers([
        ...advocateTriggers,
        { id: Date.now(), ...mappedData },
      ]);
    }

    setIsAddTriggerModalOpen(false);
    setEditingTrigger(null);
  };

  const handleDeleteTrigger = (id: number) => {
    setAdvocateTriggers(
      advocateTriggers.filter((t) => t.id !== id),
    );
  };

  // Advocate Meeting Handlers - Strengths
  const handleOpenStrengthModal = (strength?: any) => {
    if (strength) {
      setEditingStrength(strength);
    } else {
      setEditingStrength(null);
    }
    setIsAddStrengthModalOpen(true);
  };

  const handleSaveStrength = (data: any) => {
    // Map modal data structure to advocateStrengths structure (MM/DD/YYYY throughout)
    const mappedData = {
      strength: data.strength,
      subject: data.subject || "",
      dateReported: data.dateReported || "",
      reportedBy: getDemoUserName(),
      relationshipToYouth: "Advocate",
      description: data.description || "",
      lastITPInclusion: data.lastITPInclusion || "",
    };

    if (editingStrength) {
      setAdvocateStrengths(
        advocateStrengths.map((s) =>
          s.id === editingStrength.id
            ? { ...s, ...mappedData }
            : s,
        ),
      );
    } else {
      setAdvocateStrengths([
        ...advocateStrengths,
        { id: Date.now(), ...mappedData },
      ]);
    }

    setIsAddStrengthModalOpen(false);
    setEditingStrength(null);
  };

  const handleDeleteStrength = (id: number) => {
    setAdvocateStrengths(
      advocateStrengths.filter((s) => s.id !== id),
    );
  };

  const handleStartInlineEdit = (
    participant: ConnectionParticipant,
  ) => {
    setInlineEditData({
      constituentType: participant.constituentType,
      entityId: participant.entityId,
      participant: participant.participant,
      role: participant.role,
      attended: participant.attended,
      reasonMissed: participant.reasonMissed,
      attendanceNotes: participant.attendanceNotes || "",
      otherReasonDetails: participant.otherReasonDetails || "",
    });
    setInlineEditingId(participant.id);
    setIsAddingInlineParticipant(false);
  };

  const handleSaveInlineEdit = () => {
    const orig = connectionParticipants.find(
      (p) => p.id === inlineEditingId,
    );
    if (
      isSourceParticipant(orig as never) &&
      (((inlineEditData as { participant?: string })
        .participant !== undefined &&
        (inlineEditData as { participant?: string })
          .participant !== orig!.participant) ||
        ((inlineEditData as { role?: string }).role !==
          undefined &&
          (inlineEditData as { role?: string }).role !==
            orig!.role))
    ) {
      blockSourceChange();
      return;
    }
    setConnectionParticipants(
      connectionParticipants.map((p) =>
        p.id === inlineEditingId
          ? { ...p, ...inlineEditData }
          : p,
      ),
    );
    setInlineEditingId(null);
  };

  const handleCancelInlineEdit = () => {
    setInlineEditingId(null);
  };

  const handleStartInlineAdd = () => {
    setInlineAddData({
      constituentType: "Constituent",
      participant: "",
      role: "",
      attended: null,
      reasonMissed: "",
      attendanceNotes: "",
      otherReasonDetails: "",
    });
    setIsAddingInlineParticipant(true);
    setInlineEditingId(null);
  };

  const handleSaveInlineAdd = () => {
    if (!inlineAddData.participant) {
      return;
    }
    const newId = getNextParticipantId();
    setConnectionParticipants([
      { id: newId, ...inlineAddData },
      ...connectionParticipants,
    ]);
    setInlineAddData({
      constituentType: "Constituent",
      participant: "",
      role: "",
      attended: null,
      reasonMissed: "",
      attendanceNotes: "",
    });
    setIsAddingInlineParticipant(false);
  };

  const handleCancelInlineAdd = () => {
    setInlineAddData({
      constituentType: "Constituent",
      participant: "",
      role: "",
      attended: null,
      reasonMissed: "",
      attendanceNotes: "",
      otherReasonDetails: "",
    });
    setIsAddingInlineParticipant(false);
  };

  const handleDeleteParticipant = (id: number) => {
    if (
      isSourceParticipant(
        connectionParticipants.find(
          (p) => p.id === id,
        ) as never,
      )
    ) {
      blockSourceChange();
      return;
    }
    setConnectionParticipants(
      connectionParticipants.filter((p) => p.id !== id),
    );
  };

  // Add Program Handlers
  const handleOpenAddProgramModal = () => {
    setTempSelectedPrograms([...selectedPrograms]);
    setIsAddProgramModalOpen(true);
  };

  const handleToggleProgramSelection = (program: string) => {
    setTempSelectedPrograms((prev) =>
      prev.includes(program)
        ? prev.filter((p) => p !== program)
        : [...prev, program],
    );
  };

  const handleConfirmProgramSelection = () => {
    // AC5: Auto-add all active youths from selected Programs
    const programsToAdd = tempSelectedPrograms.filter(
      (p) => !selectedPrograms.includes(p),
    );

    // Collect all new participants to add
    const newParticipantsToAdd: ConnectionParticipant[] = [];

    programsToAdd.forEach((program) => {
      const youthInProgram =
        programYouthAssociations[program] || [];

      youthInProgram.forEach((youthName) => {
        // AC7: Prevent duplicate participants
        const isDuplicate =
          connectionParticipants.some(
            (p) => p.participant === youthName,
          ) ||
          newParticipantsToAdd.some(
            (p) => p.participant === youthName,
          );

        if (!isDuplicate) {
          const newParticipant: ConnectionParticipant = {
            id: getNextParticipantId(),
            constituentType: "Constituent",
            participant: youthName,
            role: "Youth",
            attended: null,
            reasonMissed: "",
            attendanceNotes: "",
          };

          newParticipantsToAdd.push(newParticipant);
        }
      });
    });

    // Add all new participants at once
    if (newParticipantsToAdd.length > 0) {
      setConnectionParticipants((prev) => [
        ...prev,
        ...newParticipantsToAdd,
      ]);
    }

    setSelectedPrograms(tempSelectedPrograms);

    // AC8: Update the programs field in connection form data
    setConnectionFormData((prev) => ({
      ...prev,
      programs: tempSelectedPrograms.join(", "),
    }));

    setIsAddProgramModalOpen(false);
  };

  const handleCancelProgramSelection = () => {
    setTempSelectedPrograms([...selectedPrograms]);
    setIsAddProgramModalOpen(false);
  };

  const handleSaveOtherReason = () => {
    if (editingOtherReasonContext === "add") {
      // Update inline add data
      setInlineAddData({
        ...inlineAddData,
        otherReasonDetails: editedOtherReasonText,
      });
    } else if (
      editingOtherReasonContext === "edit" &&
      editingOtherReasonParticipantId !== null
    ) {
      // Update inline edit data
      setInlineEditData({
        ...inlineEditData,
        otherReasonDetails: editedOtherReasonText,
      });
    } else if (
      editingOtherReasonContext === "participant" &&
      editingOtherReasonParticipantId !== null
    ) {
      // Update participant in the array
      setConnectionParticipants(
        connectionParticipants.map((p) =>
          p.id === editingOtherReasonParticipantId
            ? {
                ...p,
                otherReasonDetails: editedOtherReasonText,
              }
            : p,
        ),
      );
    }

    // Close the dialog and reset state
    setViewingOtherReason(null);
    setEditingOtherReasonParticipantId(null);
    setEditingOtherReasonContext(null);
    setEditedOtherReasonText("");
  };

  const handleOpenOtherReasonDialog = (
    mode: "add" | "edit",
  ) => {
    setOtherReasonMode(mode);
    if (mode === "add") {
      setTempOtherReason(
        inlineAddData.otherReasonDetails || "",
      );
    } else {
      setTempOtherReason(
        inlineEditData.otherReasonDetails || "",
      );
    }
    setIsOtherReasonDialogOpen(true);
  };

  const handleSubmitOtherReason = () => {
    if (otherReasonMode === "add") {
      setInlineAddData({
        ...inlineAddData,
        reasonMissed: "Other",
        otherReasonDetails: tempOtherReason,
      });
    } else if (otherReasonMode === "edit") {
      setInlineEditData({
        ...inlineEditData,
        reasonMissed: "Other",
        otherReasonDetails: tempOtherReason,
      });
    }
    setIsOtherReasonDialogOpen(false);
    setTempOtherReason("");
    setOtherReasonMode(null);
  };

  const handleCancelOtherReason = () => {
    setIsOtherReasonDialogOpen(false);
    setTempOtherReason("");
    setOtherReasonMode(null);
  };

  // Manage Participants Modal Handlers (for Milieu Meeting)
  const handleOpenManageParticipantsModal = () => {
    // Clone current participants to temp state
    setTempParticipants(
      JSON.parse(JSON.stringify(connectionParticipants)),
    );
    setSelectedModalParticipantIds([]);
    setIsManageParticipantsModalOpen(true);
  };

  const handleApplyManageParticipants = () => {
    // Apply temp participants to actual state
    setConnectionParticipants(tempParticipants);

    // Clear selections
    setSelectedModalParticipantIds([]);

    // Update individual participant notes based on attended participants
    const attendedParticipants = tempParticipants.filter(
      (p) => p.attended === true,
    );
    setIndividualParticipantNotes((prevNotes) => {
      // Keep existing notes for participants still attended, add new entries for new attended participants
      return attendedParticipants.map((p) => {
        const existingNote = prevNotes.find(
          (n) => n.participantId === p.id,
        );
        return (
          existingNote || {
            participantId: p.id,
            participantName: p.participant,
            notes: "",
          }
        );
      });
    });

    setIsManageParticipantsModalOpen(false);
  };

  const handleCancelManageParticipants = () => {
    setIsManageParticipantsModalOpen(false);
    setTempParticipants([]);
    setSelectedModalParticipantIds([]);
  };

  const handleAddParticipantInModal = () => {
    const newParticipant: ConnectionParticipant = {
      id: getNextParticipantId(),
      constituentType: "Constituent",
      participant: "",
      role: "",
      attended: null,
      reasonMissed: "",
      isOrganizer: false,
    };
    setTempParticipants([...tempParticipants, newParticipant]);
  };

  const handleRemoveParticipantInModal = (id: number) => {
    if (
      isSourceParticipant(
        tempParticipants.find((p) => p.id === id) as never,
      )
    ) {
      blockSourceChange();
      return;
    }
    setTempParticipants(
      tempParticipants.filter((p) => p.id !== id),
    );
  };

  const handleSetOrganizerInModal = (id: number) => {
    setTempParticipants(
      tempParticipants.map((p) => ({
        ...p,
        isOrganizer: p.id === id,
      })),
    );
  };

  const handleUpdateParticipantInModal = (
    id: number,
    field: keyof ConnectionParticipant,
    value: any,
  ) => {
    setTempParticipants(
      tempParticipants.map((p) =>
        p.id === id ? { ...p, [field]: value } : p,
      ),
    );
  };

  const handleSetAttendedInModal = (ids: number[]) => {
    setTempParticipants(
      tempParticipants.map((p) =>
        ids.includes(p.id)
          ? { ...p, attended: true, reasonMissed: "" }
          : p,
      ),
    );
  };

  const handleSetNotAttendedInModal = (ids: number[]) => {
    setTempParticipants(
      tempParticipants.map((p) =>
        ids.includes(p.id) ? { ...p, attended: false } : p,
      ),
    );
  };

  // Individual Participant Notes Handlers (for Milieu Meeting Details tab)
  const handleUpdateParticipantNote = (
    participantId: number,
    notes: string,
  ) => {
    setIndividualParticipantNotes((prevNotes) =>
      prevNotes.map((n) =>
        n.participantId === participantId ? { ...n, notes } : n,
      ),
    );
  };

  const isFinalized = !!editingConnection?.finalized;

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          // Prevent parent dialog from closing when child modals are open
          if (
            !open &&
            (isAddCopingSkillModalOpen ||
              isAddTriggerModalOpen ||
              isAddStrengthModalOpen)
          ) {
            return;
          }
          onOpenChange(open);
        }}
      >
        <DialogContent
          className="sm:max-w-[min(1200px,calc(100vw-4rem))] rounded-[8px] bg-white border border-[#dddbda] max-h-[calc(100vh-4rem)] overflow-hidden flex flex-col gap-0 p-0"
          aria-describedby={undefined}
        >
          <DialogHeader className="border-b border-[#dddbda] pb-4 px-6 pt-6 mb-0">
            <DialogTitle className="text-[16px] font-bold text-[#080707]">
              {readOnly
                ? "View Connection"
                : editingConnection
                  ? "Edit Connection"
                  : connectionFormData.type
                    ? `New Connection for ${connectionFormData.type}`
                    : (newConnectionTitle ?? "New Connection / Interaction")}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b] mt-2">
              {editingConnection?.finalized ? (
                <span className="text-[#145F33] font-medium">
                  ✓ This Therapy Session has been finalized and
                  submitted to the Program Log.
                </span>
              ) : (
                "Complete the connection details across both tabs."
              )}
            </DialogDescription>
          </DialogHeader>

          <>
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {formError && (
                <div
                  id="connection-form-error"
                  className="mx-6 mt-4 flex items-start gap-3 rounded-lg px-4 py-3"
                  style={{
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fca5a5",
                  }}
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#b42318]" />
                  <p className="text-[13px] text-[#b42318]">
                    {formError}
                  </p>
                </div>
              )}
              {/* Completed attendance validation error banner */}
              {completedAttendanceError && (
                <div
                  className="mx-6 mt-4 flex items-start gap-3 rounded-lg px-4 py-3"
                  style={{
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fca5a5",
                  }}
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#b42318]" />
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#b42318]">
                      Cannot set status to "Completed"
                    </p>
                    <p className="text-[12px] mt-0.5 text-[#b42318]">
                      Attendance information must be updated for
                      all participants before the status can be
                      updated to "Completed". Go to the{" "}
                      <button
                        onClick={() =>
                          setActiveTab("connection")
                        }
                        className="underline font-medium"
                      >
                        Participants section
                      </button>{" "}
                      and mark each participant's attendance
                      before saving.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setCompletedAttendanceError(false)
                    }
                    className="flex-shrink-0 p-0.5 rounded hover:bg-[#fee2e2] transition-colors"
                    aria-label="Dismiss"
                  >
                    <XIcon
                      className="h-3.5 w-3.5"
                      style={{ color: "#b42318" }}
                    />
                  </button>
                </div>
              )}

              {/* Tab Navigation - Sticky at top */}
              <div
                className="flex overflow-x-auto overflow-y-hidden border-b m-0 px-2 py-0 bg-[var(--slds-g-color-background-alt)] sticky top-0 z-10"
                style={{
                  borderBottomColor:
                    "var(--slds-g-color-border-base-1)",
                }}
              >
                <button
                  onClick={() => setActiveTab("connection")}
                  className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === "connection"
                      ? "text-[#145F33]"
                      : "text-[#706e6b] hover:text-[#080707]"
                  }`}
                  style={
                    activeTab === "connection"
                      ? {
                          borderBottom: "3px solid #145F33",
                          marginBottom: "-1px",
                        }
                      : {}
                  }
                >
                  Connection
                </button>
                <button
                  onClick={() => setActiveTab("details")}
                  className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === "details"
                      ? "text-[#145F33]"
                      : "text-[#706e6b] hover:text-[#080707]"
                  }`}
                  style={
                    activeTab === "details"
                      ? {
                          borderBottom: "3px solid #145F33",
                          marginBottom: "-1px",
                        }
                      : {}
                  }
                >
                  Details
                </button>
              </div>

              {/* CONNECTION TAB */}
              {activeTab === "connection" && (
                <div className="px-6 py-4">
                  {/* AC54: fieldset disables all inputs when record is finalized */}
                  <fieldset
                    disabled={isFinalized || readOnly}
                    className="border-0 p-0 m-0 min-w-0"
                  >
                    <div className="space-y-6">
                          {memberOptions && !readOnly && (
                            <div className="space-y-1.5 w-full">
                              <FieldLabel
                                htmlFor="connection-members"
                                required={memberFieldLabel === "Members"}
                              >
                                {memberFieldLabel}
                              </FieldLabel>
                              <MultiSelect
                                id="connection-members"
                                aria-label={memberFieldLabel}
                                options={memberOptions}
                                placeholder="Please Select"
                                value={connectionParticipants
                                  .filter((p) => p.role === "Community Care Member")
                                  .map((p) => p.participant)}
                                onValueChange={(names) =>
                                  setConnectionParticipants((prev) => {
                                    const others = prev.filter(
                                      (p) => p.role !== "Community Care Member",
                                    );
                                    const members = names.map(
                                      (name) =>
                                        prev.find(
                                          (p) =>
                                            p.role === "Community Care Member" &&
                                            p.participant === name,
                                        ) ?? {
                                          id: getNextParticipantId(),
                                          constituentType: "Constituent" as const,
                                          participant: name,
                                          role: "Community Care Member",
                                          attended: null,
                                          reasonMissed: "",
                                        },
                                    );
                                    return [...others, ...members];
                                  })
                                }
                              />
                            </div>
                          )}
                      {/* Type */}
                      <div className="space-y-1.5 w-full">
                        <Label
                          className="slds-form-label"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Type{" "}
                          <span className="text-red-600">
                            *
                          </span>
                        </Label>
                        {editingConnection || lockType ? (
                          <Input
                            type="text"
                            value={
                              connectionFormData.type ||
                              initialType ||
                              ""
                            }
                            disabled
                            className="h-9 slds-text-4 cursor-not-allowed"
                            style={{
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                              backgroundColor:
                                "var(--slds-g-color-neutral-95)",
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          />
                        ) : (
                          <Select
                            value={
                              connectionFormData.type || ""
                            }
                            onValueChange={handleTypeChange}
                          >
                            <SelectTrigger
                              className="h-9 slds-text-4"
                              style={{
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                              }}
                            >
                              <SelectValue placeholder="Please Select" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px] overflow-y-auto">
                              {typeOptions.map((opt) => (
                                <SelectItem
                                  key={opt}
                                  value={opt}
                                  className="slds-text-4"
                                >
                                  {typeOptionLabels?.[opt] ?? opt}
                                </SelectItem>
                              ))}
                              {!typeOptionsOverride &&
                                !isPhysicalHealth &&
                                !isTransitionSummary &&
                                !connectionTypeOptions.includes(
                                  "Internal ECR Meeting",
                                ) && (
                                  <SelectItem
                                    value="Internal ECR Meeting"
                                    className="slds-text-4"
                                  >
                                    Internal ECR Meeting
                                  </SelectItem>
                                )}
                              {!typeOptionsOverride &&
                                !isPhysicalHealth &&
                                !isTransitionSummary &&
                                !connectionTypeOptions.includes(
                                  "Psychological Evaluation",
                                ) && (
                                  <SelectItem
                                    value="Psychological Evaluation"
                                    className="slds-text-4"
                                  >
                                    Psychological Evaluation
                                  </SelectItem>
                                )}
                              {!typeOptionsOverride &&
                                !isPhysicalHealth &&
                                !isTransitionSummary &&
                                !connectionTypeOptions.includes(
                                  "School Meeting",
                                ) && (
                                  <SelectItem
                                    value="School Meeting"
                                    className="slds-text-4"
                                  >
                                    School Meeting
                                  </SelectItem>
                                )}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {/* Class Session: same fields as Classes > New Session (US 20051) */}
                      {isClassSession ? (
                        <ClassSessionConnectionFields
                          f={classSessionForm}
                        />
                      ) : (
                        <>
                          {/* Session Type - Only for Therapy Session */}
                          {connectionFormData.type ===
                            "Therapy Session" && (
                            <div className="grid gap-2">
                              <Label className="text-[13px] text-[#3e3e3c] font-medium">
                                Session Type{" "}
                                <span className="text-red-600">
                                  *
                                </span>
                              </Label>
                              {editingConnection ? (
                                <Input
                                  type="text"
                                  value={
                                    connectionFormData.sessionType ||
                                    ""
                                  }
                                  disabled
                                  className="h-9 text-[13px] border-[#dddbda] bg-gray-100 cursor-not-allowed"
                                />
                              ) : (
                                <Select
                                  value={
                                    connectionFormData.sessionType ||
                                    ""
                                  }
                                  onValueChange={(val) =>
                                    setConnectionFormData({
                                      ...connectionFormData,
                                      sessionType: val,
                                    })
                                  }
                                >
                                  <SelectTrigger
                                    className="h-9 text-[13px] border-[#dddbda]"
                                    style={{
                                      borderColor:
                                        "var(--slds-g-color-border-base-1)",
                                    }}
                                  >
                                    <SelectValue placeholder="Please Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {sessionTypeOptions.map(
                                      (opt) => (
                                        <SelectItem
                                          key={opt}
                                          value={opt}
                                          className="text-[13px]"
                                        >
                                          {opt}
                                        </SelectItem>
                                      ),
                                    )}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          )}

                          {/* Therapy Session Variant - Only for Therapy Session */}
                          {connectionFormData.type ===
                            "Therapy Session" && (
                            <div className="grid gap-2">
                              <Label className="text-[13px] text-[#3e3e3c] font-medium">
                                Therapy Session Variant{" "}
                                <span className="text-red-600">
                                  *
                                </span>
                              </Label>
                              {editingConnection ? (
                                <Input
                                  type="text"
                                  value={
                                    connectionFormData.therapySessionVariant ||
                                    ""
                                  }
                                  disabled
                                  className="h-9 text-[13px] border-[#dddbda] bg-gray-100 cursor-not-allowed"
                                />
                              ) : (
                                <Select
                                  value={
                                    connectionFormData.therapySessionVariant ||
                                    ""
                                  }
                                  onValueChange={(val) =>
                                    setConnectionFormData({
                                      ...connectionFormData,
                                      therapySessionVariant:
                                        val,
                                    })
                                  }
                                >
                                  <SelectTrigger
                                    className="h-9 text-[13px] border-[#dddbda]"
                                    style={{
                                      borderColor:
                                        "var(--slds-g-color-border-base-1)",
                                    }}
                                  >
                                    <SelectValue placeholder="Please Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {therapySessionVariantOptions.map(
                                      (opt) => (
                                        <SelectItem
                                          key={opt}
                                          value={opt}
                                          className="text-[13px]"
                                        >
                                          {opt}
                                        </SelectItem>
                                      ),
                                    )}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          )}

                          {/* Hospitalization Type - Only for Psychiatric Hospitalization */}
                          {connectionFormData.type ===
                            "Psychiatric Hospitalization" && (
                            <div className="grid gap-2">
                              <Label
                                className="slds-form-label"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Hospitalization Type{" "}
                                <span className="text-red-600">
                                  *
                                </span>
                              </Label>
                              {editingConnection ? (
                                <Input
                                  type="text"
                                  value={psychHospType}
                                  disabled
                                  className="h-9 slds-text-4 cursor-not-allowed"
                                  style={{
                                    borderColor:
                                      "var(--slds-g-color-border-base-1)",
                                    backgroundColor:
                                      "var(--slds-g-color-neutral-95)",
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                />
                              ) : (
                                <Select
                                  value={psychHospType}
                                  onValueChange={
                                    setPsychHospType
                                  }
                                >
                                  <SelectTrigger
                                    className="h-9 slds-text-4"
                                    style={{
                                      borderColor:
                                        "var(--slds-g-color-border-base-1)",
                                    }}
                                  >
                                    <SelectValue placeholder="Please Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem
                                      value="Inpatient"
                                      className="slds-text-4"
                                    >
                                      Inpatient
                                    </SelectItem>
                                    <SelectItem
                                      value="Partial"
                                      className="slds-text-4"
                                    >
                                      Partial
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          )}

                          {/* Hospitalization Type - Only for Psychological Evaluation */}
                          {connectionFormData.type ===
                            "Psychological Evaluation" && (
                            <div className="grid gap-2">
                              <Label
                                className="slds-form-label"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Hospitalization Type{" "}
                                <span className="text-red-600">
                                  *
                                </span>
                              </Label>
                              {editingConnection ? (
                                <Input
                                  type="text"
                                  value={psychHospType}
                                  disabled
                                  className="h-9 slds-text-4 cursor-not-allowed"
                                  style={{
                                    borderColor:
                                      "var(--slds-g-color-border-base-1)",
                                    backgroundColor:
                                      "var(--slds-g-color-neutral-95)",
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                />
                              ) : (
                                <Select
                                  value={psychHospType}
                                  onValueChange={
                                    setPsychHospType
                                  }
                                >
                                  <SelectTrigger
                                    className="h-9 slds-text-4"
                                    style={{
                                      borderColor:
                                        "var(--slds-g-color-border-base-1)",
                                    }}
                                  >
                                    <SelectValue placeholder="Please Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem
                                      value="Contract"
                                      className="slds-text-4"
                                    >
                                      Contract
                                    </SelectItem>
                                    <SelectItem
                                      value="Partial"
                                      className="slds-text-4"
                                    >
                                      External
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          )}

                          {/* AC5: Transition Related Checkbox - Only for Milieu Meeting */}
                          {connectionFormData.type ===
                            "Milieu meeting" && (
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="transition-related"
                                checked={
                                  connectionFormData.transitionRelated ||
                                  false
                                }
                                onCheckedChange={(checked) =>
                                  setConnectionFormData({
                                    ...connectionFormData,
                                    transitionRelated:
                                      checked as boolean,
                                  })
                                }
                              />
                              <Label
                                htmlFor="transition-related"
                                className="slds-text-4 font-medium cursor-pointer"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                Transition Related
                              </Label>
                            </div>
                          )}

                          {/* Start Date & Time */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="space-y-1.5">
                              <Label
                                className="slds-form-label"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Start Date{" "}
                                <span className="text-red-600">
                                  *
                                </span>
                              </Label>
                              <DateInput
                                value={
                                  connectionFormData.startDate ||
                                  ""
                                }
                                onChange={(val) =>
                                  setConnectionFormData({
                                    ...connectionFormData,
                                    startDate: val,
                                  })
                                }
                                style={{
                                  borderColor:
                                    "var(--slds-g-color-border-base-1)",
                                }}
                                required
                              />
                              <FieldError
                                message={
                                  isFriendsFirstSession
                                    ? ffErrors.startDate
                                    : undefined
                                }
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                className="slds-form-label"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Start Time{" "}
                                <span className="text-red-600">
                                  *
                                </span>
                              </Label>
                              <TimeInput
                                value={
                                  connectionFormData.startTime ||
                                  ""
                                }
                                id={
                                  isFriendsFirstSession
                                    ? "ff-start-time"
                                    : undefined
                                }
                                aria-required={
                                  isFriendsFirstSession ||
                                  undefined
                                }
                                aria-invalid={
                                  isFriendsFirstSession &&
                                  !!ffErrors.startTime
                                    ? true
                                    : undefined
                                }
                                aria-describedby={
                                  isFriendsFirstSession &&
                                  ffErrors.startTime
                                    ? "ff-start-time-error"
                                    : undefined
                                }
                                onChange={(val) =>
                                  setConnectionFormData({
                                    ...connectionFormData,
                                    startTime: val,
                                  })
                                }
                                style={{
                                  borderColor:
                                    "var(--slds-g-color-border-base-1)",
                                }}
                                placeholder="hh:mm AM/PM"
                              />
                              <FieldError
                                id="ff-start-time-error"
                                message={
                                  isFriendsFirstSession
                                    ? ffErrors.startTime
                                    : undefined
                                }
                              />
                            </div>
                          </div>

                          {/* End Date & Time (Required) */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="space-y-1.5">
                              <Label
                                className="slds-form-label"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                End Date{" "}
                                <span className="text-red-600">
                                  *
                                </span>
                              </Label>
                              <DateInput
                                value={
                                  connectionFormData.endDate ||
                                  ""
                                }
                                onChange={(val) =>
                                  setConnectionFormData({
                                    ...connectionFormData,
                                    endDate: val,
                                  })
                                }
                                style={{
                                  borderColor:
                                    "var(--slds-g-color-border-base-1)",
                                }}
                              />
                              <FieldError
                                message={
                                  isFriendsFirstSession
                                    ? ffErrors.endDate
                                    : undefined
                                }
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                className="slds-form-label"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                End Time{" "}
                                <span className="text-red-600">
                                  *
                                </span>
                              </Label>
                              <TimeInput
                                value={
                                  connectionFormData.endTime ||
                                  ""
                                }
                                id={
                                  isFriendsFirstSession
                                    ? "ff-end-time"
                                    : undefined
                                }
                                aria-required={
                                  isFriendsFirstSession ||
                                  undefined
                                }
                                aria-invalid={
                                  isFriendsFirstSession &&
                                  !!ffErrors.endTime
                                    ? true
                                    : undefined
                                }
                                aria-describedby={
                                  isFriendsFirstSession &&
                                  ffErrors.endTime
                                    ? "ff-end-time-error"
                                    : undefined
                                }
                                onChange={(val) =>
                                  setConnectionFormData({
                                    ...connectionFormData,
                                    endTime: val,
                                  })
                                }
                                style={{
                                  borderColor:
                                    "var(--slds-g-color-border-base-1)",
                                }}
                                placeholder="hh:mm AM/PM"
                              />
                              <FieldError
                                id="ff-end-time-error"
                                message={
                                  isFriendsFirstSession
                                    ? ffErrors.endTime
                                    : undefined
                                }
                              />
                              <FieldError
                                message={
                                  isFriendsFirstSession
                                    ? ffErrors.range
                                    : undefined
                                }
                              />
                            </div>
                          </div>

                          {/* Status + Location side by side. Community Care
                              hides Status; Location then takes full width. */}
                          <div className={communityCareMemberContext ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 gap-4"}>
                            {/* Status */}
                            <div className={communityCareMemberContext ? "hidden" : "space-y-1.5"}>
                              <Label
                                className="slds-form-label"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                STATUS{" "}
                                <span className="text-red-600">
                                  *
                                </span>
                              </Label>
                              {editingConnection ? (
                                <Select
                                  value={
                                    (connectionFormData.status as string) ||
                                    "Scheduled"
                                  }
                                  onValueChange={(val) => {
                                    setConnectionFormData({
                                      ...connectionFormData,
                                      status:
                                        val as ConnectionStatus,
                                    });
                                    if (val !== "Completed")
                                      setCompletedAttendanceError(
                                        false,
                                      );
                                  }}
                                >
                                  <SelectTrigger
                                    className="h-9 slds-text-4"
                                    style={{
                                      borderColor:
                                        "var(--slds-g-color-border-base-1)",
                                    }}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(getConnectionCategory(
                                      connectionFormData.type ||
                                        "",
                                    ) === "event-based"
                                      ? [
                                          "Scheduled",
                                          "Completed",
                                          "Cancelled",
                                        ]
                                      : [
                                          "Scheduled",
                                          "Incomplete",
                                          "Submitted/Finalized",
                                          "Cancelled",
                                        ]
                                    ).map((s) => (
                                      <SelectItem
                                        key={s}
                                        value={s}
                                        className="slds-text-4"
                                      >
                                        {s}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Select
                                  value={
                                    (connectionFormData.status as string) ||
                                    "Scheduled"
                                  }
                                  onValueChange={(val) => {
                                    setConnectionFormData({
                                      ...connectionFormData,
                                      status:
                                        val as ConnectionStatus,
                                    });
                                    if (val !== "Completed")
                                      setCompletedAttendanceError(
                                        false,
                                      );
                                  }}
                                >
                                  <SelectTrigger
                                    className="h-9 slds-text-4"
                                    style={{
                                      borderColor:
                                        "var(--slds-g-color-border-base-1)",
                                    }}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(getConnectionCategory(
                                      connectionFormData.type ||
                                        "",
                                    ) === "event-based"
                                      ? [
                                          "Scheduled",
                                          "Completed",
                                          "Cancelled",
                                        ]
                                      : [
                                          "Scheduled",
                                          "Incomplete",
                                          "Submitted/Finalized",
                                          "Cancelled",
                                        ]
                                    ).map((s) => (
                                      <SelectItem
                                        key={s}
                                        value={s}
                                        className="slds-text-4"
                                      >
                                        {s}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>

                            {/* Location */}
                            <div className="space-y-1.5">
                              <Label
                                className="slds-form-label"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                LOCATION
                                {isFriendsFirstSession && (
                                  <>
                                    {" "}
                                    <span className="text-red-600">
                                      *
                                    </span>
                                  </>
                                )}
                              </Label>
                              <Select
                                value={
                                  connectionFormData.location ||
                                  ""
                                }
                                onValueChange={(val) => {
                                  setConnectionFormData({
                                    ...connectionFormData,
                                    location: val,
                                  });
                                  if (val !== "Other")
                                    setLocationOther("");
                                }}
                              >
                                <SelectTrigger
                                  className="h-9 slds-text-4"
                                  style={{
                                    borderColor:
                                      "var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  <SelectValue placeholder="Please Select" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[280px] overflow-y-auto">
                                  {/* A saved value outside the list (e.g. the
                                      Campus of an auto-created Tutor Session,
                                      US 20093) stays selectable and visible. */}
                                  {(connectionFormData.location &&
                                  !LOCATION_OPTIONS.includes(
                                    connectionFormData.location,
                                  )
                                    ? [
                                        connectionFormData.location,
                                        ...LOCATION_OPTIONS,
                                      ]
                                    : LOCATION_OPTIONS
                                  ).map((opt) => (
                                    <SelectItem
                                      key={opt}
                                      value={opt}
                                      className="slds-text-4"
                                    >
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {connectionFormData.location ===
                                "Other" && (
                                <Input
                                  value={locationOther}
                                  onChange={(e) =>
                                    setLocationOther(
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Please specify location..."
                                  className="h-9 slds-text-4 mt-1.5"
                                  style={{
                                    borderColor:
                                      "var(--slds-g-color-border-base-1)",
                                  }}
                                />
                              )}
                              <FieldError
                                message={
                                  isFriendsFirstSession
                                    ? (ffErrors.location ??
                                      ffErrors.locationOther)
                                    : undefined
                                }
                              />
                            </div>
                          </div>

                          {/* Conditional Checkboxes */}
                          <div className="flex items-start gap-6 flex-wrap">
                            {/* AC7: Transition Related - For Therapy Session, Advocate Meeting and Parent / Family Contact */}
                            {(connectionFormData.type ===
                              "Therapy Session" ||
                              connectionFormData.type ===
                                "Advocate Meeting" ||
                              connectionFormData.type ===
                                "Parent / Family Contact") && (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="connTransitionRelated"
                                  checked={
                                    connectionFormData.transitionRelated ||
                                    false
                                  }
                                  onChange={(e) =>
                                    setConnectionFormData({
                                      ...connectionFormData,
                                      transitionRelated:
                                        e.target.checked,
                                    })
                                  }
                                  className="h-4 w-4 rounded border-[#dddbda] text-[#145F33] focus:ring-[#145F33]"
                                  style={{
                                    colorScheme: "light",
                                    accentColor: "#145F33",
                                  }}
                                />
                                <Label
                                  htmlFor="connTransitionRelated"
                                  className="slds-text-4 font-medium cursor-pointer"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  Transition Related
                                </Label>
                              </div>
                            )}

                            {/* AC14: Home Visit - For Therapy Session, Individual Info Session, Admissions Clinical Assessment, Advocate Meeting, and Parent / Family Contact */}
                            {/* Not shown in Physical Health mode (US 20075) */}
                            {!isPhysicalHealth &&
                              (connectionFormData.type ===
                                "Therapy Session" ||
                                connectionFormData.type ===
                                  "Individual Info Session" ||
                                connectionFormData.type ===
                                  "Admissions Clinical Assessment" ||
                                connectionFormData.type ===
                                  "Advocate Meeting" ||
                                connectionFormData.type ===
                                  "Parent / Family Contact") && (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="connHomeVisit"
                                    checked={
                                      connectionFormData.homeVisit ||
                                      false
                                    }
                                    onChange={(e) =>
                                      setConnectionFormData({
                                        ...connectionFormData,
                                        homeVisit:
                                          e.target.checked,
                                      })
                                    }
                                    className="h-4 w-4 rounded border-[#dddbda] text-[#145F33] focus:ring-[#145F33]"
                                    style={{
                                      colorScheme: "light",
                                      accentColor: "#145F33",
                                    }}
                                  />
                                  <Label
                                    htmlFor="connHomeVisit"
                                    className="slds-text-4 font-medium cursor-pointer"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    Home Visit
                                  </Label>
                                </div>
                              )}

                            {/* AC15: Service Coordination - For Therapy Session, Milieu Meeting, Advocate Meeting, and Parent / Family Contact */}
                            {/* Not shown in Physical Health mode (US 20075) */}
                            {/* Also offered for every transition-summary Plan type (US 20101) */}
                            {((!isPhysicalHealth &&
                              (connectionFormData.type ===
                                "Therapy Session" ||
                                connectionFormData.type ===
                                  "Milieu meeting" ||
                                connectionFormData.type ===
                                  "Advocate Meeting" ||
                                connectionFormData.type ===
                                  "Parent / Family Contact")) ||
                              (isTransitionSummary &&
                                !!connectionFormData.type)) && (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="connServiceCoordination"
                                    checked={
                                      connectionFormData.serviceCoordination ||
                                      false
                                    }
                                    onChange={(e) =>
                                      handleServiceCoordinationChange(
                                        e.target.checked,
                                      )
                                    }
                                    className="h-4 w-4 rounded border-[#dddbda] text-[#145F33] focus:ring-[#145F33]"
                                    style={{
                                      colorScheme: "light",
                                      accentColor: "#145F33",
                                    }}
                                  />
                                  <Label
                                    htmlFor="connServiceCoordination"
                                    className="slds-text-4 font-medium cursor-pointer"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    Service Coordination
                                  </Label>
                                </div>

                                {/* Service Coordination Alert Message */}
                                {showServiceCoordinationAlert && (
                                  <div
                                    className="flex items-start gap-2 p-3 rounded-lg border"
                                    style={{
                                      backgroundColor:
                                        "#ebf5ff",
                                      borderColor: "#b6deff",
                                    }}
                                  >
                                    <AlertCircle className="h-4 w-4 text-[#0176d3] mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                      <p className="text-[12px] text-[#014486]">
                                        Add the Referral
                                        Organization as a
                                        Participant.
                                      </p>
                                    </div>
                                    <button
                                      onClick={() =>
                                        setShowServiceCoordinationAlert(
                                          false,
                                        )
                                      }
                                      className="p-0.5 hover:bg-[#d8ecfe] rounded"
                                      title="Dismiss"
                                    >
                                      <XIcon className="h-3.5 w-3.5 text-[#014486]" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Participants Section */}
                          <div className="space-y-4 pt-5 border-t border-[#dddbda]">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <h3 className="text-[15px] font-semibold text-[#080707] flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Participants
                              </h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                {selectedParticipantIds.length >
                                  0 && (
                                  <>
                                    <span className="text-[12px] text-[#706e6b] mr-1">
                                      {
                                        selectedParticipantIds.length
                                      }{" "}
                                      selected
                                    </span>
                                    <Button
                                      variant="outline"
                                      onClick={
                                        handleBulkSetAttended
                                      }
                                      className="rounded-full h-8 px-3 text-[12px] font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] text-[#3e3e3c] shadow-none"
                                    >
                                      <Check className="h-3.5 w-3.5 mr-1" />
                                      Set as Attended
                                    </Button>
                                    <Button
                                      onClick={
                                        handleBulkSetNotAttended
                                      }
                                      variant="outline"
                                      className="rounded-full h-8 px-3 text-[12px] font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
                                      style={{
                                        color: "#080707",
                                      }}
                                    >
                                      <XIcon className="h-3.5 w-3.5 mr-1" />
                                      Set as Not Attended
                                    </Button>
                                    {showRsvp && (
                                      <Select
                                        value={bulkRsvp || undefined}
                                        onValueChange={(v) => {
                                          setBulkRsvp(v);
                                          setConnectionParticipants(
                                            connectionParticipants.map((p) =>
                                              selectedParticipantIds.includes(p.id) ? ({ ...p, rsvp: v } as any) : p,
                                            ),
                                          );
                                        }}
                                      >
                                        <SelectTrigger surface="base" className="h-8 w-[170px] text-[12px]" aria-label="RSVP for selected participants">
                                          <SelectValue placeholder="RSVP: Please Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {RSVP_OPTIONS.map((o) => (
                                            <SelectItem key={o} value={o}>{o}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                    <Button
                                      onClick={
                                        handleBulkRemoveParticipants
                                      }
                                      variant="outline"
                                      className="rounded-full h-8 px-3 text-[12px] font-medium shadow-none"
                                      style={{
                                        color: "#c23934",
                                        borderColor: "#fecdca",
                                        backgroundColor:
                                          "#fef3f2",
                                      }}
                                    >
                                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                                      Remove Participant(s)
                                    </Button>
                                  </>
                                )}
                                {/* AC19: Manage Participants button for Therapy Session, Milieu Meeting, and Parent / Family Contact */}
                                {connectionFormData.type ===
                                  "Therapy Session" ||
                                connectionFormData.type ===
                                  "Milieu meeting" ||
                                connectionFormData.type ===
                                  "Parent / Family Contact" ? (
                                  <Button
                                    onClick={
                                      handleOpenManageParticipantsModal
                                    }
                                    className="rounded-full h-8 px-3 text-[12px] font-medium w-full sm:w-auto bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
                                  >
                                    <Users className="h-3.5 w-3.5 mr-1.5" />
                                    Manage Participants
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={
                                      handleStartInlineAdd
                                    }
                                    disabled={
                                      isAddingInlineParticipant
                                    }
                                    className="rounded-full h-8 px-3 text-[12px] font-medium w-full sm:w-auto bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add Participant
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Also shown while adding, so the inline add row is
                                reachable when the list starts empty. */}
                            {connectionParticipants.length >
                              0 || isAddingInlineParticipant ? (
                              <div className="border rounded-lg overflow-hidden border-[#dddbda]">
                                <div className="overflow-x-auto">
                                  <table className="w-full min-w-[900px]">
                                    <thead
                                      style={{
                                        backgroundColor:
                                          "var(--slds-g-color-background-alt)",
                                      }}
                                    >
                                      <tr>
                                        <th
                                          className="px-3 py-2.5 text-center"
                                          style={{
                                            width: "44px",
                                          }}
                                        >
                                          <Checkbox
                                            checked={
                                              selectedParticipantIds.length >
                                                0 &&
                                              selectedParticipantIds.length ===
                                                connectionParticipants.filter(
                                                  (p) =>
                                                    !p.isOrganizer,
                                                ).length
                                            }
                                            onCheckedChange={
                                              handleToggleAllParticipants
                                            }
                                            aria-label="Select all participants"
                                          />
                                        </th>
                                        <th
                                          className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-weak)",
                                            width: "120px",
                                          }}
                                        >
                                          Type
                                        </th>
                                        <th
                                          className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-weak)",
                                            width: "180px",
                                          }}
                                        >
                                          Participant
                                        </th>
                                        <th
                                          className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-weak)",
                                            width: "140px",
                                          }}
                                        >
                                          Role
                                        </th>
                                        <th
                                          className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-weak)",
                                            width: "90px",
                                          }}
                                        >
                                          Organizer
                                        </th>
                                        {showRsvp && (
                                          <th
                                            className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                                            style={{ color: "var(--slds-g-color-text-weak)", width: "150px" }}
                                          >
                                            RSVP
                                          </th>
                                        )}
                                        <th
                                          className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-weak)",
                                            width: "90px",
                                          }}
                                        >
                                          Attended
                                        </th>
                                        <th
                                          className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-weak)",
                                          }}
                                        >
                                          Reason Missed
                                        </th>
                                        <th
                                          className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-weak)",
                                            width: "100px",
                                          }}
                                        >
                                          Other Reason
                                        </th>
                                        <th
                                          className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-weak)",
                                            width: "80px",
                                          }}
                                        >
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody
                                      className="divide-y"
                                      style={{
                                        borderColor:
                                          "var(--slds-g-color-border-base-1)",
                                      }}
                                    >
                                      {/* Add New Participant Row */}
                                      {isAddingInlineParticipant && (
                                        <tr className="bg-[#f0faf4]">
                                          <td className="px-3 py-3 text-center"></td>
                                          <td className="px-3 py-2">
                                            <Select
                                              value={
                                                inlineAddData.constituentType
                                              }
                                              onValueChange={(
                                                val:
                                                  | "Constituent"
                                                  | "Non-Constituent",
                                              ) =>
                                                setInlineAddData(
                                                  {
                                                    ...inlineAddData,
                                                    constituentType:
                                                      val,
                                                    ...(usesVerifiedConstituents && {
                                                      participant:
                                                        "",
                                                      entityId:
                                                        undefined,
                                                    }),
                                                  },
                                                )
                                              }
                                            >
                                              <SelectTrigger className="h-8 text-[13px] border-[#dddbda]">
                                                <SelectValue placeholder="Type" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="Constituent">
                                                  Constituent
                                                </SelectItem>
                                                <SelectItem value="Non-Constituent">
                                                  Non-Constituent
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </td>
                                          <td className="px-3 py-2">
                                            {inlineAddData.constituentType ===
                                            "Constituent" ? (
                                              <Select
                                                value={
                                                  usesVerifiedConstituents
                                                    ? (inlineAddData.entityId ??
                                                      "")
                                                    : inlineAddData.participant
                                                }
                                                onValueChange={(
                                                  val,
                                                ) =>
                                                  setInlineAddData(
                                                    {
                                                      ...inlineAddData,
                                                      ...pickParticipant(
                                                        val,
                                                      ),
                                                    },
                                                  )
                                                }
                                              >
                                                <SelectTrigger className="h-8 text-[13px] border-[#dddbda]">
                                                  <SelectValue placeholder="Select constituent..." />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[200px] overflow-y-auto">
                                                  {participantPickerOptions.map(
                                                    (p) => (
                                                      <SelectItem
                                                        key={
                                                          p.value
                                                        }
                                                        value={
                                                          p.value
                                                        }
                                                        className="text-[13px]"
                                                      >
                                                        {
                                                          p.label
                                                        }
                                                      </SelectItem>
                                                    ),
                                                  )}
                                                </SelectContent>
                                              </Select>
                                            ) : (
                                              <Input
                                                value={
                                                  inlineAddData.participant
                                                }
                                                onChange={(e) =>
                                                  setInlineAddData(
                                                    {
                                                      ...inlineAddData,
                                                      participant:
                                                        e.target
                                                          .value,
                                                    },
                                                  )
                                                }
                                                className="h-8 text-[13px] border-[#dddbda]"
                                                placeholder="Enter name..."
                                              />
                                            )}
                                          </td>
                                          <td className="px-3 py-2">
                                            <Select
                                              value={
                                                inlineAddData.role
                                              }
                                              onValueChange={(
                                                val,
                                              ) =>
                                                setInlineAddData(
                                                  {
                                                    ...inlineAddData,
                                                    role: val,
                                                  },
                                                )
                                              }
                                            >
                                              <SelectTrigger className="h-8 text-[13px] border-[#dddbda]">
                                                <SelectValue placeholder="Role" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {(inlineAddData.constituentType ===
                                                "Constituent"
                                                  ? constituentRoleOptions
                                                  : nonConstituentRoleOptions
                                                ).map(
                                                  (role) => (
                                                    <SelectItem
                                                      key={role}
                                                      value={
                                                        role
                                                      }
                                                      className="text-[13px]"
                                                    >
                                                      {role}
                                                    </SelectItem>
                                                  ),
                                                )}
                                              </SelectContent>
                                            </Select>
                                          </td>
                                          <td className="px-3 py-2 text-center">
                                            <div className="flex justify-center">
                                              <Checkbox
                                                checked={false}
                                                disabled
                                                aria-label="Organizer (cannot set on new participant)"
                                              />
                                            </div>
                                          </td>
                                          {showRsvp && <td className="px-3 py-2" />}
                                          <td className="px-3 py-2 text-center">
                                            <div className="flex justify-center">
                                              <Select
                                                value={
                                                  inlineAddData.attended ===
                                                  null
                                                    ? "null"
                                                    : inlineAddData.attended
                                                      ? "yes"
                                                      : "no"
                                                }
                                                onValueChange={(
                                                  val,
                                                ) =>
                                                  setInlineAddData(
                                                    {
                                                      ...inlineAddData,
                                                      attended:
                                                        val ===
                                                        "null"
                                                          ? null
                                                          : val ===
                                                            "yes",
                                                    },
                                                  )
                                                }
                                              >
                                                <SelectTrigger className="h-8 w-24 text-[13px] border-[#dddbda]">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem
                                                    value="null"
                                                    className="text-[13px]"
                                                  >
                                                    —
                                                  </SelectItem>
                                                  <SelectItem
                                                    value="yes"
                                                    className="text-[13px]"
                                                  >
                                                    Yes
                                                  </SelectItem>
                                                  <SelectItem
                                                    value="no"
                                                    className="text-[13px]"
                                                  >
                                                    No
                                                  </SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </td>
                                          <td className="px-3 py-2">
                                            {inlineAddData.attended ===
                                            false ? (
                                              <>
                                                {inlineAddData.reasonMissed ===
                                                "Other" ? (
                                                  <span className="text-[13px] text-gray-400">
                                                    —
                                                  </span>
                                                ) : (
                                                  <Select
                                                    value={
                                                      inlineAddData.reasonMissed
                                                    }
                                                    onValueChange={(
                                                      value,
                                                    ) => {
                                                      if (
                                                        value ===
                                                        "Other"
                                                      ) {
                                                        handleOpenOtherReasonDialog(
                                                          "add",
                                                        );
                                                      } else {
                                                        setInlineAddData(
                                                          {
                                                            ...inlineAddData,
                                                            reasonMissed:
                                                              value,
                                                            otherReasonDetails:
                                                              "",
                                                          },
                                                        );
                                                      }
                                                    }}
                                                  >
                                                    <SelectTrigger className="h-8 text-[13px] border-[#dddbda]">
                                                      <SelectValue placeholder="Select reason" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {(inlineAddData.constituentType ===
                                                      "Non-Constituent"
                                                        ? nonConstituentRoleOptions
                                                        : reasonMissedOptions
                                                      ).map(
                                                        (
                                                          opt,
                                                        ) => (
                                                          <SelectItem
                                                            key={
                                                              opt
                                                            }
                                                            value={
                                                              opt
                                                            }
                                                            className="text-[13px]"
                                                          >
                                                            {
                                                              opt
                                                            }
                                                          </SelectItem>
                                                        ),
                                                      )}
                                                    </SelectContent>
                                                  </Select>
                                                )}
                                              </>
                                            ) : (
                                              <span className="text-[13px] text-gray-400">
                                                —
                                              </span>
                                            )}
                                          </td>
                                          <td className="px-3 py-2 text-center">
                                            {inlineAddData.reasonMissed ===
                                              "Other" &&
                                            inlineAddData.otherReasonDetails ? (
                                              <button
                                                onClick={() =>
                                                  handleOpenOtherReasonDialog(
                                                    "add",
                                                  )
                                                }
                                                className="p-1.5 rounded hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                                                title="Edit Other Reason"
                                              >
                                                <Eye className="h-4 w-4 text-[#0176d3]" />
                                              </button>
                                            ) : (
                                              <span className="text-[13px] text-gray-400">
                                                —
                                              </span>
                                            )}
                                          </td>
                                          <td className="px-3 py-2">
                                            <div className="flex items-center justify-end gap-1">
                                              <button
                                                onClick={
                                                  handleSaveInlineAdd
                                                }
                                                className="p-1.5 rounded transition-colors"
                                                style={{
                                                  backgroundColor:
                                                    "#e8f5e9",
                                                  color:
                                                    "#145F33",
                                                }}
                                                title="Save"
                                              >
                                                <Save className="h-4 w-4" />
                                              </button>
                                              <button
                                                onClick={
                                                  handleCancelInlineAdd
                                                }
                                                className="p-1.5 rounded hover:bg-red-100 transition-colors"
                                                title="Cancel"
                                              >
                                                <XIcon className="h-4 w-4 text-red-600" />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                      {/* Existing Participants */}
                                      {connectionParticipants.map(
                                        (participant) => (
                                          <tr
                                            key={participant.id}
                                            className={`${inlineEditingId === participant.id ? "bg-[#e8f5e9]" : ""}`}
                                          >
                                            {inlineEditingId ===
                                            participant.id ? (
                                              <>
                                                <td className="px-3 py-3 text-center"></td>
                                                <td className="px-3 py-2">
                                                  <Select
                                                    value={
                                                      inlineEditData.constituentType
                                                    }
                                                    onValueChange={(
                                                      val:
                                                        | "Constituent"
                                                        | "Non-Constituent",
                                                    ) =>
                                                      setInlineEditData(
                                                        {
                                                          ...inlineEditData,
                                                          constituentType:
                                                            val,
                                                          ...(usesVerifiedConstituents && {
                                                            participant:
                                                              "",
                                                            entityId:
                                                              undefined,
                                                          }),
                                                        },
                                                      )
                                                    }
                                                  >
                                                    <SelectTrigger className="h-8 text-[13px] border-[#dddbda]">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="Constituent">
                                                        Constituent
                                                      </SelectItem>
                                                      <SelectItem value="Non-Constituent">
                                                        Non-Constituent
                                                      </SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </td>
                                                <td className="px-3 py-2">
                                                  {inlineEditData.constituentType ===
                                                  "Constituent" ? (
                                                    <Select
                                                      value={
                                                        usesVerifiedConstituents
                                                          ? (inlineEditData.entityId ??
                                                            "")
                                                          : inlineEditData.participant
                                                      }
                                                      onValueChange={(
                                                        val,
                                                      ) =>
                                                        setInlineEditData(
                                                          {
                                                            ...inlineEditData,
                                                            ...pickParticipant(
                                                              val,
                                                            ),
                                                          },
                                                        )
                                                      }
                                                    >
                                                      <SelectTrigger className="h-8 text-[13px] border-[#dddbda]">
                                                        <SelectValue placeholder="Select constituent..." />
                                                      </SelectTrigger>
                                                      <SelectContent className="max-h-[200px] overflow-y-auto">
                                                        {participantPickerOptions.map(
                                                          (
                                                            p,
                                                          ) => (
                                                            <SelectItem
                                                              key={
                                                                p.value
                                                              }
                                                              value={
                                                                p.value
                                                              }
                                                              className="text-[13px]"
                                                            >
                                                              {
                                                                p.label
                                                              }
                                                            </SelectItem>
                                                          ),
                                                        )}
                                                      </SelectContent>
                                                    </Select>
                                                  ) : (
                                                    <Input
                                                      value={
                                                        inlineEditData.participant
                                                      }
                                                      onChange={(
                                                        e,
                                                      ) =>
                                                        setInlineEditData(
                                                          {
                                                            ...inlineEditData,
                                                            participant:
                                                              e
                                                                .target
                                                                .value,
                                                          },
                                                        )
                                                      }
                                                      className="h-8 text-[13px] border-[#dddbda]"
                                                      placeholder="Enter name..."
                                                    />
                                                  )}
                                                </td>
                                                <td className="px-3 py-2">
                                                  <Select
                                                    value={
                                                      inlineEditData.role
                                                    }
                                                    onValueChange={(
                                                      val,
                                                    ) =>
                                                      setInlineEditData(
                                                        {
                                                          ...inlineEditData,
                                                          role: val,
                                                        },
                                                      )
                                                    }
                                                  >
                                                    <SelectTrigger className="h-8 text-[13px] border-[#dddbda]">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {(inlineEditData.constituentType ===
                                                      "Constituent"
                                                        ? constituentRoleOptions
                                                        : nonConstituentRoleOptions
                                                      ).map(
                                                        (
                                                          role,
                                                        ) => (
                                                          <SelectItem
                                                            key={
                                                              role
                                                            }
                                                            value={
                                                              role
                                                            }
                                                            className="text-[13px]"
                                                          >
                                                            {
                                                              role
                                                            }
                                                          </SelectItem>
                                                        ),
                                                      )}
                                                    </SelectContent>
                                                  </Select>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                  <div className="flex justify-center">
                                                    <Checkbox
                                                      checked={
                                                        connectionParticipants.find(
                                                          (p) =>
                                                            p.id ===
                                                            inlineEditingId,
                                                        )
                                                          ?.isOrganizer ||
                                                        false
                                                      }
                                                      disabled
                                                      aria-label="Organizer (not editable inline)"
                                                    />
                                                  </div>
                                                </td>
                                                {showRsvp && <td className="px-3 py-2" />}
                                                <td className="px-3 py-2 text-center">
                                                  <div className="flex justify-center">
                                                    <Select
                                                      value={
                                                        inlineEditData.attended ===
                                                        null
                                                          ? "null"
                                                          : inlineEditData.attended
                                                            ? "yes"
                                                            : "no"
                                                      }
                                                      onValueChange={(
                                                        val,
                                                      ) =>
                                                        setInlineEditData(
                                                          {
                                                            ...inlineEditData,
                                                            attended:
                                                              val ===
                                                              "null"
                                                                ? null
                                                                : val ===
                                                                  "yes",
                                                          },
                                                        )
                                                      }
                                                    >
                                                      <SelectTrigger className="h-8 w-24 text-[13px] border-[#dddbda]">
                                                        <SelectValue />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                        <SelectItem
                                                          value="null"
                                                          className="text-[13px]"
                                                        >
                                                          —
                                                        </SelectItem>
                                                        <SelectItem
                                                          value="yes"
                                                          className="text-[13px]"
                                                        >
                                                          Yes
                                                        </SelectItem>
                                                        <SelectItem
                                                          value="no"
                                                          className="text-[13px]"
                                                        >
                                                          No
                                                        </SelectItem>
                                                      </SelectContent>
                                                    </Select>
                                                  </div>
                                                </td>
                                                <td className="px-3 py-2">
                                                  {inlineEditData.attended ===
                                                  false ? (
                                                    <>
                                                      {inlineEditData.reasonMissed ===
                                                      "Other" ? (
                                                        <span className="text-[13px] text-gray-400">
                                                          —
                                                        </span>
                                                      ) : (
                                                        <Select
                                                          value={
                                                            inlineEditData.reasonMissed
                                                          }
                                                          onValueChange={(
                                                            value,
                                                          ) => {
                                                            if (
                                                              value ===
                                                              "Other"
                                                            ) {
                                                              handleOpenOtherReasonDialog(
                                                                "edit",
                                                              );
                                                            } else {
                                                              setInlineEditData(
                                                                {
                                                                  ...inlineEditData,
                                                                  reasonMissed:
                                                                    value,
                                                                  otherReasonDetails:
                                                                    "",
                                                                },
                                                              );
                                                            }
                                                          }}
                                                        >
                                                          <SelectTrigger className="h-8 text-[13px] border-[#dddbda]">
                                                            <SelectValue />
                                                          </SelectTrigger>
                                                          <SelectContent>
                                                            {(inlineEditData.constituentType ===
                                                            "Non-Constituent"
                                                              ? nonConstituentRoleOptions
                                                              : reasonMissedOptions
                                                            ).map(
                                                              (
                                                                opt,
                                                              ) => (
                                                                <SelectItem
                                                                  key={
                                                                    opt
                                                                  }
                                                                  value={
                                                                    opt
                                                                  }
                                                                  className="text-[13px]"
                                                                >
                                                                  {
                                                                    opt
                                                                  }
                                                                </SelectItem>
                                                              ),
                                                            )}
                                                          </SelectContent>
                                                        </Select>
                                                      )}
                                                    </>
                                                  ) : (
                                                    <span className="text-[13px] text-gray-400">
                                                      —
                                                    </span>
                                                  )}
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                  {inlineEditData.reasonMissed ===
                                                    "Other" &&
                                                  inlineEditData.otherReasonDetails ? (
                                                    <button
                                                      onClick={() =>
                                                        handleOpenOtherReasonDialog(
                                                          "edit",
                                                        )
                                                      }
                                                      className="p-1.5 rounded hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                                                      title="Edit Other Reason"
                                                    >
                                                      <Eye className="h-4 w-4 text-[#0176d3]" />
                                                    </button>
                                                  ) : (
                                                    <span className="text-[13px] text-gray-400">
                                                      —
                                                    </span>
                                                  )}
                                                </td>
                                                <td className="px-3 py-2">
                                                  <div className="flex items-center justify-end gap-1">
                                                    <button
                                                      onClick={
                                                        handleSaveInlineEdit
                                                      }
                                                      className="p-1.5 rounded transition-colors"
                                                      style={{
                                                        backgroundColor:
                                                          "#e8f5e9",
                                                        color:
                                                          "#145F33",
                                                      }}
                                                      title="Save"
                                                    >
                                                      <Check className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                      onClick={
                                                        handleCancelInlineEdit
                                                      }
                                                      className="p-1.5 rounded hover:bg-red-100 transition-colors"
                                                      title="Cancel"
                                                    >
                                                      <XIcon className="h-4 w-4 text-red-600" />
                                                    </button>
                                                  </div>
                                                </td>
                                              </>
                                            ) : (
                                              <>
                                                <td className="px-3 py-2.5 text-center">
                                                  {participant.isOrganizer ? (
                                                    <span className="text-[11px] font-medium text-[#0176d3]">
                                                      ★
                                                    </span>
                                                  ) : (
                                                    <Checkbox
                                                      checked={selectedParticipantIds.includes(
                                                        participant.id,
                                                      )}
                                                      onCheckedChange={() =>
                                                        handleToggleParticipantSelection(
                                                          participant.id,
                                                        )
                                                      }
                                                      aria-label={`Select ${participant.participant}`}
                                                    />
                                                  )}
                                                </td>
                                                <td
                                                  className="px-3 py-2.5 text-[13px]"
                                                  style={{
                                                    color:
                                                      "var(--slds-g-color-text-default)",
                                                  }}
                                                >
                                                  {
                                                    participant.constituentType
                                                  }
                                                </td>
                                                <td
                                                  className="px-3 py-2.5 text-[13px]"
                                                  style={{
                                                    color:
                                                      "var(--slds-g-color-text-default)",
                                                  }}
                                                >
                                                  {
                                                    participant.participant
                                                  }
                                                </td>
                                                <td
                                                  className="px-3 py-2.5 text-[13px]"
                                                  style={{
                                                    color:
                                                      "var(--slds-g-color-text-default)",
                                                  }}
                                                >
                                                  {
                                                    participant.role
                                                  }
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                  <div className="flex justify-center">
                                                    <Checkbox
                                                      checked={
                                                        participant.isOrganizer ||
                                                        false
                                                      }
                                                      onCheckedChange={(
                                                        checked,
                                                      ) => {
                                                        if (
                                                          checked
                                                        ) {
                                                          // AC23: Only one organizer at a time - uncheck all others
                                                          setConnectionParticipants(
                                                            connectionParticipants.map(
                                                              (
                                                                p,
                                                              ) => ({
                                                                ...p,
                                                                isOrganizer:
                                                                  p.id ===
                                                                  participant.id,
                                                              }),
                                                            ),
                                                          );
                                                        } else {
                                                          setConnectionParticipants(
                                                            connectionParticipants.map(
                                                              (
                                                                p,
                                                              ) =>
                                                                p.id ===
                                                                participant.id
                                                                  ? {
                                                                      ...p,
                                                                      isOrganizer: false,
                                                                    }
                                                                  : p,
                                                            ),
                                                          );
                                                        }
                                                      }}
                                                      aria-label="Organizer"
                                                    />
                                                  </div>
                                                </td>
                                                {showRsvp && (
                                                  <td className="px-3 py-2">
                                                    <Select
                                                      value={(participant as any).rsvp || "No Response"}
                                                      onValueChange={(v) =>
                                                        setConnectionParticipants(
                                                          connectionParticipants.map((p) =>
                                                            p.id === participant.id ? ({ ...p, rsvp: v } as any) : p,
                                                          ),
                                                        )
                                                      }
                                                    >
                                                      <SelectTrigger surface="base" className="h-8 text-[13px]" aria-label={`RSVP for ${participant.participant}`}>
                                                        <SelectValue placeholder="Please Select" />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                        {RSVP_OPTIONS.map((o) => (
                                                          <SelectItem key={o} value={o}>{o}</SelectItem>
                                                        ))}
                                                      </SelectContent>
                                                    </Select>
                                                  </td>
                                                )}
                                                <td className="px-3 py-2.5 text-center">
                                                  <span className="text-[13px]">
                                                    {participant.attended ===
                                                    null
                                                      ? "—"
                                                      : participant.attended
                                                        ? "Yes"
                                                        : "No"}
                                                  </span>
                                                </td>
                                                <td
                                                  className="px-3 py-2.5 text-[13px]"
                                                  style={{
                                                    color:
                                                      "var(--slds-g-color-text-default)",
                                                  }}
                                                >
                                                  {participant.reasonMissed ||
                                                    "—"}
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                  {participant.reasonMissed ===
                                                    "Other" &&
                                                  participant.otherReasonDetails ? (
                                                    <button
                                                      onClick={() => {
                                                        setViewingOtherReason(
                                                          participant.otherReasonDetails!,
                                                        );
                                                        setEditingOtherReasonContext(
                                                          "participant",
                                                        );
                                                        setEditingOtherReasonParticipantId(
                                                          participant.id,
                                                        );
                                                        setEditedOtherReasonText(
                                                          participant.otherReasonDetails ||
                                                            "",
                                                        );
                                                      }}
                                                      className="p-1.5 rounded hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                                                      title="View Other Reason"
                                                    >
                                                      <Eye className="h-4 w-4 text-[#0176d3]" />
                                                    </button>
                                                  ) : (
                                                    <span className="text-[13px] text-gray-400">
                                                      —
                                                    </span>
                                                  )}
                                                </td>
                                                <td className="px-3 py-2.5">
                                                  <div className="flex items-center justify-end gap-1">
                                                    {!participant.isOrganizer && (
                                                      <>
                                                        <button
                                                          onClick={() =>
                                                            handleStartInlineEdit(
                                                              participant,
                                                            )
                                                          }
                                                          className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                                          title="Edit"
                                                        >
                                                          <Pencil
                                                            className="h-4 w-4"
                                                            style={{
                                                              color:
                                                                "var(--slds-g-color-text-weak)",
                                                            }}
                                                          />
                                                        </button>
                                                        <button
                                                          onClick={() =>
                                                            handleDeleteParticipant(
                                                              participant.id,
                                                            )
                                                          }
                                                          className="p-1.5 rounded hover:bg-red-100 transition-colors"
                                                          title="Delete"
                                                        >
                                                          <Trash2 className="h-4 w-4 text-red-600" />
                                                        </button>
                                                      </>
                                                    )}
                                                  </div>
                                                </td>
                                              </>
                                            )}
                                          </tr>
                                        ),
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-[13px] text-gray-500">
                                {usesVerifiedConstituents
                                  ? "No participants added yet."
                                  : "No participants added yet. The organizer is automatically added."}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </fieldset>
                </div>
              )}

              {/* DETAILS TAB */}
              {activeTab === "details" && isClassSession && (
                <fieldset
                  disabled={readOnly}
                  className="border-0 px-6 py-4 m-0 min-w-0 space-y-5"
                >
                  <ClassSessionDetailsFields
                    f={classSessionForm}
                  />
                </fieldset>
              )}
              {activeTab === "details" &&
                isFriendsFirstSession && (
                  <fieldset
                    disabled={readOnly}
                    className="border-0 px-6 py-4 m-0 min-w-0 space-y-5"
                  >
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="ff-session-comments"
                        className="slds-form-label"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Comments
                      </Label>
                      <Textarea
                        id="ff-session-comments"
                        size="lg"
                        placeholder="Add Comments"
                        value={
                          connectionFormData.comments ?? ""
                        }
                        onChange={(e) =>
                          setConnectionFormData({
                            ...connectionFormData,
                            comments: e.target.value,
                          })
                        }
                      />
                    </div>
                  </fieldset>
                )}
              {activeTab === "details" &&
                !isClassSession &&
                !isFriendsFirstSession && (
                  <DetailsTabContent
                    hideEventParticipantNotes={
                      communityCareMemberContext
                    }
                    relatedAdmissionAttemptOptions={
                      relatedAdmissionAttemptOptions
                    }
                    connectionFormData={connectionFormData}
                    setConnectionFormData={
                      setConnectionFormData
                    }
                    connectionDetails={connectionDetails}
                    setConnectionDetails={setConnectionDetails}
                    connectionParticipants={
                      connectionParticipants
                    }
                    advocateGoals={advocateGoals}
                    advocateMeetingSummary={
                      advocateMeetingSummary
                    }
                    setAdvocateMeetingSummary={
                      setAdvocateMeetingSummary
                    }
                    themesAddressedAdvocate={
                      themesAddressedAdvocate
                    }
                    setThemesAddressedAdvocate={
                      setThemesAddressedAdvocate
                    }
                    selectedAdvocateTreatmentTargets={
                      selectedAdvocateTreatmentTargets
                    }
                    setSelectedAdvocateTreatmentTargets={
                      setSelectedAdvocateTreatmentTargets
                    }
                    advocateCopingSkills={advocateCopingSkills}
                    setAdvocateCopingSkills={
                      setAdvocateCopingSkills
                    }
                    advocateTriggers={advocateTriggers}
                    setAdvocateTriggers={setAdvocateTriggers}
                    advocateStrengths={advocateStrengths}
                    setAdvocateStrengths={setAdvocateStrengths}
                    handleOpenAdvocateGoalModal={
                      handleOpenAdvocateGoalModal
                    }
                    handleDeleteAdvocateGoal={
                      handleDeleteAdvocateGoal
                    }
                    handleOpenCopingSkillModal={
                      handleOpenCopingSkillModal
                    }
                    handleDeleteCopingSkill={
                      handleDeleteCopingSkill
                    }
                    handleOpenTriggerModal={
                      handleOpenTriggerModal
                    }
                    handleDeleteTrigger={handleDeleteTrigger}
                    handleOpenStrengthModal={
                      handleOpenStrengthModal
                    }
                    handleDeleteStrength={handleDeleteStrength}
                    therapyGoals={therapyGoals}
                    setTherapyGoals={setTherapyGoals}
                    handleOpenAddGoalModal={
                      handleOpenAddGoalModal
                    }
                    selectedTreatmentTargets={
                      selectedTreatmentTargets
                    }
                    setSelectedTreatmentTargets={
                      setSelectedTreatmentTargets
                    }
                    isTreatmentTargetsModalOpen={
                      isTreatmentTargetsModalOpen
                    }
                    setIsTreatmentTargetsModalOpen={
                      setIsTreatmentTargetsModalOpen
                    }
                    participantRatings={participantRatings}
                    setParticipantRatings={
                      setParticipantRatings
                    }
                    editingParticipantRating={
                      editingParticipantRating
                    }
                    setEditingParticipantRating={
                      setEditingParticipantRating
                    }
                    isParticipantRatingModalOpen={
                      isParticipantRatingModalOpen
                    }
                    setIsParticipantRatingModalOpen={
                      setIsParticipantRatingModalOpen
                    }
                    participantNotesModalOpen={
                      participantNotesModalOpen
                    }
                    setParticipantNotesModalOpen={
                      setParticipantNotesModalOpen
                    }
                    participantNotesModalRecord={
                      participantNotesModalRecord
                    }
                    setParticipantNotesModalRecord={
                      setParticipantNotesModalRecord
                    }
                    fileRequestReasons={fileRequestReasons}
                    setFileRequestReasons={
                      setFileRequestReasons
                    }
                    isReasonModalOpen={isReasonModalOpen}
                    setIsReasonModalOpen={setIsReasonModalOpen}
                    tempReasonOther={tempReasonOther}
                    setTempReasonOther={setTempReasonOther}
                    fileRequestDocuments={fileRequestDocuments}
                    setFileRequestDocuments={
                      setFileRequestDocuments
                    }
                    isDocumentModalOpen={isDocumentModalOpen}
                    setIsDocumentModalOpen={
                      setIsDocumentModalOpen
                    }
                    tempDocumentOther={tempDocumentOther}
                    setTempDocumentOther={setTempDocumentOther}
                    fileRequestContactSummary={
                      fileRequestContactSummary
                    }
                    setFileRequestContactSummary={
                      setFileRequestContactSummary
                    }
                    fileRequestFollowUp={fileRequestFollowUp}
                    setFileRequestFollowUp={
                      setFileRequestFollowUp
                    }
                    contactPurposeOptions={
                      contactPurposeOptions
                    }
                    setContactPurposeOptions={
                      setContactPurposeOptions
                    }
                    contactPurpose={contactPurpose}
                    setContactPurpose={setContactPurpose}
                    isAddContactPurposeModalOpen={
                      isAddContactPurposeModalOpen
                    }
                    setIsAddContactPurposeModalOpen={
                      setIsAddContactPurposeModalOpen
                    }
                    newContactPurpose={newContactPurpose}
                    setNewContactPurpose={setNewContactPurpose}
                    interactionType={interactionType}
                    setInteractionType={setInteractionType}
                    contactSummary={contactSummary}
                    setContactSummary={setContactSummary}
                    supportProvided={supportProvided}
                    setSupportProvided={setSupportProvided}
                    familyEventType={familyEventType}
                    setFamilyEventType={setFamilyEventType}
                    familyEventTypeOther={familyEventTypeOther}
                    setFamilyEventTypeOther={
                      setFamilyEventTypeOther
                    }
                    familyEventSummary={familyEventSummary}
                    setFamilyEventSummary={
                      setFamilyEventSummary
                    }
                    mercyActivityType={mercyActivityType}
                    setMercyActivityType={setMercyActivityType}
                    mercyActivityOther={mercyActivityOther}
                    setMercyActivityOther={
                      setMercyActivityOther
                    }
                    mercyActivitySummary={mercyActivitySummary}
                    setMercyActivitySummary={
                      setMercyActivitySummary
                    }
                    jdiMeetingSummary={jdiMeetingSummary}
                    setJdiMeetingSummary={setJdiMeetingSummary}
                    jdiThemesAddressed={jdiThemesAddressed}
                    setJdiThemesAddressed={
                      setJdiThemesAddressed
                    }
                    jdiSpiritualDevelopment={
                      jdiSpiritualDevelopment
                    }
                    setJdiSpiritualDevelopment={
                      setJdiSpiritualDevelopment
                    }
                    employeeSiteVisitSummary={
                      employeeSiteVisitSummary
                    }
                    setEmployeeSiteVisitSummary={
                      setEmployeeSiteVisitSummary
                    }
                    tutorMatch={tutorMatch}
                    setTutorMatch={setTutorMatch}
                    tutorChangeReason={tutorChangeReason}
                    setTutorChangeReason={setTutorChangeReason}
                    tutorChangeAction={tutorChangeAction}
                    setTutorChangeAction={setTutorChangeAction}
                    tuteeChangeReason={tuteeChangeReason}
                    setTuteeChangeReason={setTuteeChangeReason}
                    tuteeChangeAction={tuteeChangeAction}
                    setTuteeChangeAction={setTuteeChangeAction}
                    psychTreatmentType={psychTreatmentType}
                    setPsychTreatmentType={
                      setPsychTreatmentType
                    }
                    psychTreatmentLocation={
                      psychTreatmentLocation
                    }
                    setPsychTreatmentLocation={
                      setPsychTreatmentLocation
                    }
                    psychReasonForTreatment={
                      psychReasonForTreatment
                    }
                    setPsychReasonForTreatment={
                      setPsychReasonForTreatment
                    }
                    psychOutcomeOfTreatment={
                      psychOutcomeOfTreatment
                    }
                    setPsychOutcomeOfTreatment={
                      setPsychOutcomeOfTreatment
                    }
                    psychYouthFeedback={psychYouthFeedback}
                    setPsychYouthFeedback={
                      setPsychYouthFeedback
                    }
                    ecrPurposes={ecrPurposes}
                    setEcrPurposes={setEcrPurposes}
                    ecrPurposeDialogOpen={ecrPurposeDialogOpen}
                    setEcrPurposeDialogOpen={
                      setEcrPurposeDialogOpen
                    }
                    ecrPurposeDraft={ecrPurposeDraft}
                    setEcrPurposeDraft={setEcrPurposeDraft}
                    ecrPurposeSearch={ecrPurposeSearch}
                    setEcrPurposeSearch={setEcrPurposeSearch}
                    ecrPurposeOther={ecrPurposeOther}
                    setEcrPurposeOther={setEcrPurposeOther}
                    ecrSummary={ecrSummary}
                    setEcrSummary={setEcrSummary}
                    ecrGoals={ecrGoals}
                    setEcrGoals={setEcrGoals}
                    ecrGoalDialogOpen={ecrGoalDialogOpen}
                    setEcrGoalDialogOpen={setEcrGoalDialogOpen}
                    ecrGoalEditId={ecrGoalEditId}
                    setEcrGoalEditId={setEcrGoalEditId}
                    ecrGoalDraft={ecrGoalDraft}
                    setEcrGoalDraft={setEcrGoalDraft}
                    ecrSkills={ecrSkills}
                    setEcrSkills={setEcrSkills}
                    peRequestDate={peRequestDate}
                    setPeRequestDate={setPeRequestDate}
                    peReasons={peReasons}
                    setPeReasons={setPeReasons}
                    peReasonDialogOpen={peReasonDialogOpen}
                    setPeReasonDialogOpen={
                      setPeReasonDialogOpen
                    }
                    peReasonEditId={peReasonEditId}
                    setPeReasonEditId={setPeReasonEditId}
                    peReasonSelected={peReasonSelected}
                    setPeReasonSelected={setPeReasonSelected}
                    peReasonOther={peReasonOther}
                    setPeReasonOther={setPeReasonOther}
                    peRequestStatus={peRequestStatus}
                    setPeRequestStatus={setPeRequestStatus}
                    peRationale={peRationale}
                    setPeRationale={setPeRationale}
                    peResults={peResults}
                    setPeResults={setPeResults}
                    peRecommendations={peRecommendations}
                    setPeRecommendations={setPeRecommendations}
                    smPurposes={smPurposes}
                    setSmPurposes={setSmPurposes}
                    smPurposeDialogOpen={smPurposeDialogOpen}
                    setSmPurposeDialogOpen={
                      setSmPurposeDialogOpen
                    }
                    smPurposeDraft={smPurposeDraft}
                    setSmPurposeDraft={setSmPurposeDraft}
                    smPurposeSearch={smPurposeSearch}
                    setSmPurposeSearch={setSmPurposeSearch}
                    smSummary={smSummary}
                    setSmSummary={setSmSummary}
                    smIncidents={smIncidents}
                    setSmIncidents={setSmIncidents}
                    smIncidentDialogOpen={smIncidentDialogOpen}
                    setSmIncidentDialogOpen={
                      setSmIncidentDialogOpen
                    }
                    smIncidentEditId={smIncidentEditId}
                    setSmIncidentEditId={setSmIncidentEditId}
                    smIncidentDraft={smIncidentDraft}
                    setSmIncidentDraft={setSmIncidentDraft}
                    smPlans={smPlans}
                    setSmPlans={setSmPlans}
                    smPlanDialogOpen={smPlanDialogOpen}
                    setSmPlanDialogOpen={setSmPlanDialogOpen}
                    smPlanEditId={smPlanEditId}
                    setSmPlanEditId={setSmPlanEditId}
                    smPlanDraft={smPlanDraft}
                    setSmPlanDraft={setSmPlanDraft}
                    getCurrentDate={getCurrentDate}
                  />
                )}
            </div>

            <DialogFooter className="border-t border-[#dddbda] px-6 py-4">
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  setShowServiceCoordinationAlert(false);
                }}
                className="rounded-full text-[13px] h-9 px-4"
              >
                {readOnly ? "Close" : "Cancel"}
              </Button>
              {readOnly && onEditFromView && (
                <Button
                  onClick={onEditFromView}
                  className="rounded-full h-9 px-4 text-[13px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
                >
                  <Pencil aria-hidden="true" className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
              )}
              {!readOnly && (
                <Button
                  onClick={handleSaveConnection}
                  className="rounded-full h-8 px-3 text-[12px] font-medium w-full sm:w-auto bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
                  disabled={editingConnection?.finalized}
                >
                  Save Connection
                </Button>
              )}
              {/* AC6: "Finalize and Submit" button removed — use the
                                Status → Submitted/Finalized workflow in the Connections table */}
            </DialogFooter>
          </>
        </DialogContent>
      </Dialog>

      {/* Sub-modals */}
      {/* Class Session pickers, participant dialog, Class-change confirm */}
      <ClassSessionPopups f={classSessionForm} />

      <ConnectionFormDialogModals
        {...{
          advocateGoalComments,
          advocateGoalModalMode,
          advocateGoals,
          availableYouthGoals,
          connectionDetails,
          connectionFormData,
          dynamicYouthGoals,
          editedOtherReasonText,
          editingAdvocateGoal,
          editingCopingSkill,
          editingParticipantRating,
          editingStrength,
          editingTrigger,
          handleAddParticipantInModal,
          handleAddSelectedGoals,
          handleApplyManageParticipants,
          handleBulkRemoveParticipantsInModal,
          handleBulkSetAttendedInModal,
          handleBulkSetNotAttendedInModal,
          handleCancelManageParticipants,
          handleCancelOtherReason,
          handleCancelProgramSelection,
          handleConfirmProgramSelection,
          handleOpenAddProgramModal,
          handleRemoveParticipantInModal,
          handleSaveAdvocateGoal,
          handleSaveCopingSkill,
          handleSaveNewIntermediateGoal,
          handleSaveNewMajorGoal,
          handleSaveNewTherapyIntermediateGoal,
          handleSaveNewTherapyMajorGoal,
          handleSaveOtherReason,
          handleSaveStrength,
          handleSaveTrigger,
          handleSetOrganizerInModal,
          handleSubmitOtherReason,
          handleToggleAllModalParticipants,
          handleToggleGoalSelection,
          handleToggleProgramSelection,
          handleUpdateParticipantInModal,
          isAddAdvocateGoalModalOpen,
          isAddCopingSkillModalOpen,
          isAddGoalModalOpen,
          isAddProgramModalOpen,
          isAddStrengthModalOpen,
          isAddTriggerModalOpen,
          isManageParticipantsModalOpen,
          isOtherReasonDialogOpen,
          isParticipantRatingModalOpen,
          isTreatmentTargetsModalOpen,
          newGoalName,
          participantRatings,
          saveConnectionData,
          selectedAdvocateGoal,
          selectedGoalsToAdd,
          selectedMajorForIntermediate,
          selectedModalParticipantIds,
          selectedTreatmentTargets,
          setAdvocateGoalComments,
          setAdvocateGoalModalMode,
          setConnectionDetails,
          setConnectionFormData,
          setEditedOtherReasonText,
          setEditingAdvocateGoal,
          setEditingCopingSkill,
          setEditingOtherReasonContext,
          setEditingOtherReasonParticipantId,
          setEditingParticipantRating,
          setEditingStrength,
          setEditingTrigger,
          setIsAddAdvocateGoalModalOpen,
          setIsAddCopingSkillModalOpen,
          setIsAddGoalModalOpen,
          setIsAddProgramModalOpen,
          setIsAddStrengthModalOpen,
          setIsAddTriggerModalOpen,
          setIsManageParticipantsModalOpen,
          setIsParticipantRatingModalOpen,
          setIsTreatmentTargetsModalOpen,
          setNewGoalName,
          setParticipantRatings,
          setSelectedAdvocateGoal,
          setSelectedGoalsToAdd,
          setSelectedMajorForIntermediate,
          setSelectedModalParticipantIds,
          setSelectedTreatmentTargets,
          setShowAttendanceWarning,
          setTempOtherReason,
          setTherapyGoalModalMode,
          setTherapyNewGoalName,
          setTherapySelectedMajorForIntermediate,
          setViewingOtherReason,
          showAttendanceWarning,
          tempOtherReason,
          tempParticipants,
          tempSelectedPrograms,
          therapyGoalModalMode,
          therapyNewGoalName,
          therapySelectedMajorForIntermediate,
          viewingOtherReason,
        }}
      />
    </>
  );
}

/** Inline validation message under a form field. */
function FieldError({
  message,
  id,
}: {
  message?: string;
  id?: string;
}) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="text-[12px] text-red-600"
    >
      {message}
    </p>
  );
}