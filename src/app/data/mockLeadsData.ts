// Centralized mock data for all leads across the admissions system

export interface Lead {
  id: string;
  name: string;
  program: string;
  guardian: string;
  stage: string;
  daysInStage: number;
  status: string;
  lastActivity: string;
  alerts: string[];
  phone: string;
  email: string;
  caseManager?: string;
  admissionDate?: string;
  nextAction?: string;
  progress?: number;
  assessments?: {
    medical: string;
    psychological: string;
    educational: string;
    background: string;
  };
  completedAssessments?: number;
  totalAssessments?: number;
  alertSeverity?: string;
  alertAge?: string;
  createdDate: string; // ISO date string
  promotedDate?: string; // Date promoted to admissions (ISO date string)
  dateOfBirth?: string; // Date of birth in ISO format
  gender?: string; // Gender of lead
  ageGroup?: string; // Age group: Middle School, High School, Young Adult
  campus?: string; // Campus: Walsh or West Loop
  completedStages?: string[]; // Array of completed admission stages
  // Same youth across multiple Admissions Profiles (admission attempts) —
  // profiles sharing a youthId belong to one youth (US 19983).
  youthId?: string;
  /** Explicit link to the canonical Youth Constituent ID (US 20093). Set
   *  only where the relationship is known — never inferred. In the
   *  prototype only the demo record L-DEMO-20093 has one. */
  youthConstituentId?: number;

  // Stage-specific data populated based on completed stages
  intakeData?: {
    intakeDate?: string;
    inquirySource?: string;
    initialContactNotes?: string;
    intakeFormCompleted?: boolean;
    referralSource?: string;
  };

  infoSessionData?: {
    sessionDate?: string;
    sessionAttended?: boolean;
    attendees?: string[];
    sessionNotes?: string;
    followUpScheduled?: boolean;
    interestLevel?: string;
  };

  assessmentData?: {
    medicalExamDate?: string;
    medicalExamCompleted?: boolean;
    medicalNotes?: string;
    psychExamDate?: string;
    psychExamCompleted?: boolean;
    psychNotes?: string;
    educationalAssessmentDate?: string;
    educationalAssessmentCompleted?: boolean;
    educationalNotes?: string;
    backgroundCheckDate?: string;
    backgroundCheckCompleted?: boolean;
    backgroundCheckStatus?: string;
  };

  shadowFPMData?: {
    shadowDate?: string;
    shadowCompleted?: boolean;
    shadowNotes?: string;
    shadowFeedback?: string;
    fpmDate?: string;
    fpmCompleted?: boolean;
    fpmAttendees?: string[];
    fpmNotes?: string;
    fpmGoals?: string[];
  };

  staffingData?: {
    staffingDate?: string;
    staffingCompleted?: boolean;
    decision?: string; // "Approved", "Pending", "Denied"
    staffingNotes?: string;
    teamMembers?: string[];
    conditions?: string[];
  };

  moveInData?: {
    moveInDate?: string;
    roomNumber?: string;
    roommate?: string;
    orientationCompleted?: boolean;
    checklistCompleted?: boolean;
    welcomePacketProvided?: boolean;
    moveInNotes?: string;
  };
}

export const ADMISSION_STAGES = [
  "Referral",
  "Info Session",
  "Assessments",
  "Shadow & FPM",
  "Staffing",
  "Move-In",
];

export const ALL_LEADS: Lead[] = [
  {
    id: "L-001",
    youthId: "Y-001",
    name: "Marcus Thompson",
    program: "Bosco Home",
    guardian: "Patricia Thompson",
    stage: "Referral",
    daysInStage: 1,
    status: "Referral",
    lastActivity: "Initial inquiry received via phone",
    alerts: [],
    phone: "(312) 555-0101",
    email: "patricia.thompson@email.com",
    caseManager: "Sarah Williams",
    admissionDate: "2026-02-25",
    nextAction: "Schedule intake appointment",
    progress: 5,
    createdDate: "2026-02-19",
    promotedDate: "2026-02-20",
    dateOfBirth: "2010-03-15",
    gender: "Male",
    ageGroup: "High School",
    campus: "Walsh",
    completedStages: [],
    intakeData: {
      intakeDate: "2026-02-19",
      inquirySource: "School Counselor Referral",
      initialContactNotes:
        "Mother reached out after counselor recommendation",
      intakeFormCompleted: false,
      referralSource: "Lincoln Park High School",
    },
  },
  {
    id: "L-002",
    name: "Jamal Washington",
    program: "Mercy Home",
    guardian: "Angela Washington",
    stage: "Referral",
    daysInStage: 3,
    status: "Referral",
    lastActivity: "Application form sent to guardian",
    alerts: ["Follow-up needed"],
    phone: "(773) 555-0202",
    email: "a.washington@email.com",
    caseManager: "David Chen",
    admissionDate: "2026-02-28",
    nextAction: "Follow up on application status",
    progress: 10,
    alertSeverity: "low",
    alertAge: "2 days",
    createdDate: "2026-02-17",
    promotedDate: "2026-02-18",
    dateOfBirth: "2008-11-22",
    gender: "Male",
    ageGroup: "High School",
    campus: "West Loop",
    completedStages: [],
    intakeData: {
      intakeDate: "2026-02-17",
      inquirySource: "DCFS Referral",
      initialContactNotes:
        "Guardian seeking residential support",
      intakeFormCompleted: false,
      referralSource: "DCFS Case Worker",
    },
  },
  {
    id: "L-003",
    name: "Isabella Rodriguez",
    program: "Mercy Home",
    guardian: "Sofia Rodriguez",
    stage: "Info Session",
    daysInStage: 2,
    status: "Info Session Scheduled",
    lastActivity: "Registered for Feb 25 session",
    alerts: [],
    phone: "(312) 555-0303",
    email: "sofia.rodriguez@email.com",
    caseManager: "Sarah Williams",
    admissionDate: "2026-03-05",
    nextAction: "Send session reminder and welcome packet",
    progress: 20,
    createdDate: "2026-02-10",
    promotedDate: "2026-02-12",
    dateOfBirth: "2011-05-18",
    gender: "Female",
    ageGroup: "Middle School",
    campus: "West Loop",
    completedStages: ["Referral"],
    intakeData: {
      intakeDate: "2026-02-08",
      inquirySource: "Community Referral",
      initialContactNotes:
        "Family seeking academic and emotional support",
      intakeFormCompleted: true,
      referralSource: "Previous Client",
    },
    infoSessionData: {
      sessionDate: "2026-02-25",
      sessionAttended: false,
      attendees: ["Isabella Rodriguez", "Sofia Rodriguez"],
      sessionNotes: "Session scheduled",
      followUpScheduled: true,
      interestLevel: "High",
    },
  },
  {
    id: "L-004",
    name: "Tyrone Mitchell",
    program: "Bosco Home",
    guardian: "Gloria Mitchell",
    stage: "Info Session",
    daysInStage: 5,
    status: "Info Session Scheduled",
    lastActivity: "Attended info session on Feb 15",
    alerts: ["Schedule follow-up call"],
    phone: "(773) 555-0404",
    email: "gloria.mitchell@email.com",
    caseManager: "David Chen",
    admissionDate: "2026-03-01",
    nextAction: "Schedule assessment intake meeting",
    progress: 25,
    alertSeverity: "low",
    alertAge: "3 days",
    createdDate: "2026-02-01",
    promotedDate: "2026-02-03",
    dateOfBirth: "2009-08-07",
    gender: "Male",
    ageGroup: "High School",
    campus: "Walsh",
    completedStages: ["Referral"],
    intakeData: {
      intakeDate: "2026-01-30",
      inquirySource: "Online Inquiry",
      initialContactNotes:
        "Guardian researching residential programs",
      intakeFormCompleted: true,
      referralSource: "Website",
    },
    infoSessionData: {
      sessionDate: "2026-02-15",
      sessionAttended: true,
      attendees: ["Tyrone Mitchell", "Gloria Mitchell"],
      sessionNotes:
        "Family very engaged, asked detailed questions about academics",
      followUpScheduled: true,
      interestLevel: "Very High",
    },
  },
  {
    id: "L-005",
    name: "Emma Chen",
    program: "Mercy Home",
    guardian: "Lisa Chen",
    stage: "Assessments",
    daysInStage: 3,
    status: "Program Waitlist",
    lastActivity: "Medical exam completed",
    alerts: [],
    phone: "(312) 555-0505",
    email: "lisa.chen@email.com",
    caseManager: "Sarah Williams",
    admissionDate: "2026-03-10",
    nextAction: "Schedule psychological evaluation",
    progress: 40,
    assessments: {
      medical: "Completed",
      psychological: "Pending",
      educational: "Pending",
      background: "In Progress",
    },
    completedAssessments: 1,
    totalAssessments: 4,
    createdDate: "2026-01-20",
    promotedDate: "2026-01-22",
    dateOfBirth: "2010-12-30",
    gender: "Female",
    ageGroup: "High School",
    campus: "West Loop",
    completedStages: ["Referral", "Info Session"],
    intakeData: {
      intakeDate: "2026-01-18",
      inquirySource: "Previous Client Referral",
      initialContactNotes: "Sister attended program previously",
      intakeFormCompleted: true,
      referralSource: "Alumni Family",
    },
    infoSessionData: {
      sessionDate: "2026-01-25",
      sessionAttended: true,
      attendees: ["Emma Chen", "Lisa Chen"],
      sessionNotes: "Familiar with program structure",
      followUpScheduled: true,
      interestLevel: "High",
    },
    assessmentData: {
      medicalExamDate: "2026-02-17",
      medicalExamCompleted: true,
      medicalNotes:
        "Standard health screening completed, all clear",
      psychExamDate: "2026-02-24",
      psychExamCompleted: false,
      psychNotes: "Evaluation scheduled",
      educationalAssessmentDate: "2026-02-28",
      educationalAssessmentCompleted: false,
      educationalNotes: "Pending",
      backgroundCheckDate: "2026-02-15",
      backgroundCheckCompleted: false,
      backgroundCheckStatus: "In Progress",
    },
  },
  {
    id: "L-006",
    name: "Carlos Hernandez",
    program: "Bosco Home",
    guardian: "Maria Hernandez",
    stage: "Assessments",
    daysInStage: 8,
    status: "Delayed",
    lastActivity: "Waiting on educational records",
    alerts: [
      "Document request overdue",
      "School not responding",
    ],
    phone: "(773) 555-0606",
    email: "maria.hernandez@email.com",
    caseManager: "David Chen",
    admissionDate: "2026-03-15",
    nextAction: "Contact school district office directly",
    progress: 45,
    assessments: {
      medical: "Completed",
      psychological: "Completed",
      educational: "Pending",
      background: "Completed",
    },
    completedAssessments: 2,
    totalAssessments: 4,
    alertSeverity: "high",
    alertAge: "6 days",
    createdDate: "2026-01-15",
    promotedDate: "2026-01-18",
    dateOfBirth: "2011-04-12",
    gender: "Male",
    ageGroup: "Middle School",
    campus: "Walsh",
    completedStages: ["Referral", "Info Session"],
    intakeData: {
      intakeDate: "2026-01-12",
      inquirySource: "Therapist Referral",
      initialContactNotes: "Clinical support recommended",
      intakeFormCompleted: true,
      referralSource: "Community Mental Health Center",
    },
    infoSessionData: {
      sessionDate: "2026-01-20",
      sessionAttended: true,
      attendees: ["Carlos Hernandez", "Maria Hernandez"],
      sessionNotes:
        "Youth engaged, interested in sports programs",
      followUpScheduled: true,
      interestLevel: "High",
    },
    assessmentData: {
      medicalExamDate: "2026-02-05",
      medicalExamCompleted: true,
      medicalNotes: "Medical clearance obtained",
      psychExamDate: "2026-02-08",
      psychExamCompleted: true,
      psychNotes: "Clinical assessment completed",
      educationalAssessmentDate: "2026-02-12",
      educationalAssessmentCompleted: false,
      educationalNotes:
        "Waiting on school records - multiple follow-ups sent",
      backgroundCheckDate: "2026-02-05",
      backgroundCheckCompleted: true,
      backgroundCheckStatus: "Clear",
    },
  },
  {
    id: "L-007",
    name: "Destiny Johnson",
    program: "Mercy Home",
    guardian: "Tanya Johnson",
    stage: "Assessments",
    daysInStage: 5,
    status: "Program Waitlist",
    lastActivity: "All assessments complete",
    alerts: [],
    phone: "(312) 555-0707",
    email: "tanya.johnson@email.com",
    caseManager: "Sarah Williams",
    admissionDate: "2026-03-08",
    nextAction: "Schedule shadow day",
    progress: 55,
    assessments: {
      medical: "Completed",
      psychological: "Completed",
      educational: "Completed",
      background: "Completed",
    },
    completedAssessments: 4,
    totalAssessments: 4,
    createdDate: "2026-01-05",
    promotedDate: "2026-01-08",
    dateOfBirth: "2009-07-25",
    gender: "Female",
    ageGroup: "High School",
    campus: "West Loop",
    completedStages: ["Referral", "Info Session"],
    intakeData: {
      intakeDate: "2026-01-03",
      inquirySource: "School Social Worker",
      initialContactNotes:
        "Seeking stable environment for academic success",
      intakeFormCompleted: true,
      referralSource: "CPS School District",
    },
    infoSessionData: {
      sessionDate: "2026-01-10",
      sessionAttended: true,
      attendees: ["Destiny Johnson", "Tanya Johnson"],
      sessionNotes:
        "Very positive session, youth excited about program",
      followUpScheduled: true,
      interestLevel: "Very High",
    },
    assessmentData: {
      medicalExamDate: "2026-02-01",
      medicalExamCompleted: true,
      medicalNotes: "Health screening complete",
      psychExamDate: "2026-02-05",
      psychExamCompleted: true,
      psychNotes: "Clinical evaluation complete",
      educationalAssessmentDate: "2026-02-10",
      educationalAssessmentCompleted: true,
      educationalNotes:
        "Academic assessment complete, IEP reviewed",
      backgroundCheckDate: "2026-02-01",
      backgroundCheckCompleted: true,
      backgroundCheckStatus: "Clear",
    },
  },
  {
    id: "L-008",
    name: "Andre Williams",
    program: "Bosco Home",
    guardian: "Sharon Williams",
    stage: "Shadow & FPM",
    daysInStage: 2,
    status: "Program Waitlist",
    lastActivity: "Shadow day scheduled for Feb 22",
    alerts: [],
    phone: "(773) 555-0808",
    email: "sharon.williams@email.com",
    caseManager: "David Chen",
    admissionDate: "2026-03-12",
    nextAction: "Confirm shadow day attendance",
    progress: 65,
    createdDate: "2025-12-10",
    promotedDate: "2025-12-12",
    dateOfBirth: "2010-09-14",
    gender: "Male",
    ageGroup: "High School",
    campus: "Walsh",
    completedStages: [
      "Referral",
      "Info Session",
      "Assessments",
    ],
    intakeData: {
      intakeDate: "2025-12-08",
      inquirySource: "Court Referral",
      initialContactNotes:
        "Probation officer recommended program",
      intakeFormCompleted: true,
      referralSource: "Juvenile Justice",
    },
    infoSessionData: {
      sessionDate: "2025-12-15",
      sessionAttended: true,
      attendees: ["Andre Williams", "Sharon Williams"],
      sessionNotes:
        "Mother supportive, youth somewhat hesitant but open",
      followUpScheduled: true,
      interestLevel: "Medium",
    },
    assessmentData: {
      medicalExamDate: "2026-01-10",
      medicalExamCompleted: true,
      medicalNotes: "Medical clearance obtained",
      psychExamDate: "2026-01-15",
      psychExamCompleted: true,
      psychNotes: "Clinical assessment completed",
      educationalAssessmentDate: "2026-01-20",
      educationalAssessmentCompleted: true,
      educationalNotes: "Academic needs identified",
      backgroundCheckDate: "2026-01-10",
      backgroundCheckCompleted: true,
      backgroundCheckStatus: "Clear",
    },
    shadowFPMData: {
      shadowDate: "2026-02-22",
      shadowCompleted: false,
      shadowNotes: "Scheduled",
      shadowFeedback: "",
      fpmDate: "",
      fpmCompleted: false,
      fpmAttendees: [],
      fpmNotes: "",
      fpmGoals: [],
    },
  },
  {
    id: "L-009",
    name: "Sophia Martinez",
    program: "Mercy Home",
    guardian: "Eduardo Martinez",
    stage: "Shadow & FPM",
    daysInStage: 6,
    status: "Program Waitlist",
    lastActivity: "FPM meeting completed",
    alerts: [],
    phone: "(312) 555-0909",
    email: "eduardo.martinez@email.com",
    caseManager: "Sarah Williams",
    admissionDate: "2026-03-18",
    nextAction: "Submit for staffing review",
    progress: 75,
    createdDate: "2025-11-20",
    promotedDate: "2025-11-22",
    dateOfBirth: "2011-01-08",
    gender: "Female",
    ageGroup: "Middle School",
    campus: "West Loop",
    completedStages: [
      "Referral",
      "Info Session",
      "Assessments",
    ],
    intakeData: {
      intakeDate: "2025-11-18",
      inquirySource: "Community Partner",
      initialContactNotes:
        "Family seeking structured environment",
      intakeFormCompleted: true,
      referralSource: "Boys & Girls Club",
    },
    infoSessionData: {
      sessionDate: "2025-11-25",
      sessionAttended: true,
      attendees: ["Sophia Martinez", "Eduardo Martinez"],
      sessionNotes: "Strong family engagement",
      followUpScheduled: true,
      interestLevel: "Very High",
    },
    assessmentData: {
      medicalExamDate: "2025-12-15",
      medicalExamCompleted: true,
      medicalNotes: "All health requirements met",
      psychExamDate: "2025-12-20",
      psychExamCompleted: true,
      psychNotes: "Clinical evaluation complete",
      educationalAssessmentDate: "2026-01-05",
      educationalAssessmentCompleted: true,
      educationalNotes: "Academic profile established",
      backgroundCheckDate: "2025-12-15",
      backgroundCheckCompleted: true,
      backgroundCheckStatus: "Clear",
    },
    shadowFPMData: {
      shadowDate: "2026-02-10",
      shadowCompleted: true,
      shadowNotes: "Very positive shadow experience",
      shadowFeedback:
        "Youth connected well with residents and staff",
      fpmDate: "2026-02-14",
      fpmCompleted: true,
      fpmAttendees: [
        "Sophia Martinez",
        "Eduardo Martinez",
        "Sarah Williams",
      ],
      fpmNotes:
        "Goals established, family aligned with program expectations",
      fpmGoals: [
        "Improve academic performance",
        "Build social connections",
        "Develop independent living skills",
      ],
    },
  },
  {
    id: "L-010",
    name: "Kevin Brown",
    program: "Bosco Home",
    guardian: "Denise Brown",
    stage: "Staffing",
    daysInStage: 1,
    status: "Program Waitlist",
    lastActivity: "Staffing review scheduled",
    alerts: [],
    phone: "(773) 555-1010",
    email: "denise.brown@email.com",
    caseManager: "David Chen",
    admissionDate: "2026-03-20",
    nextAction: "Attend staffing meeting",
    progress: 85,
    createdDate: "2025-10-15",
    promotedDate: "2025-10-18",
    dateOfBirth: "2009-11-03",
    gender: "Male",
    ageGroup: "High School",
    campus: "Walsh",
    completedStages: [
      "Referral",
      "Info Session",
      "Assessments",
      "Shadow & FPM",
    ],
    intakeData: {
      intakeDate: "2025-10-12",
      inquirySource: "Hospital Referral",
      initialContactNotes: "Post-discharge planning",
      intakeFormCompleted: true,
      referralSource: "Children's Hospital Social Work",
    },
    infoSessionData: {
      sessionDate: "2025-10-20",
      sessionAttended: true,
      attendees: ["Kevin Brown", "Denise Brown"],
      sessionNotes: "Family well-informed about program",
      followUpScheduled: true,
      interestLevel: "High",
    },
    assessmentData: {
      medicalExamDate: "2025-11-10",
      medicalExamCompleted: true,
      medicalNotes:
        "Medical clearance with follow-up care plan",
      psychExamDate: "2025-11-15",
      psychExamCompleted: true,
      psychNotes:
        "Clinical needs identified and treatment plan established",
      educationalAssessmentDate: "2025-11-22",
      educationalAssessmentCompleted: true,
      educationalNotes:
        "IEP in place, accommodations documented",
      backgroundCheckDate: "2025-11-10",
      backgroundCheckCompleted: true,
      backgroundCheckStatus: "Clear",
    },
    shadowFPMData: {
      shadowDate: "2026-01-20",
      shadowCompleted: true,
      shadowNotes: "Positive shadow day experience",
      shadowFeedback: "Youth engaged with program activities",
      fpmDate: "2026-01-25",
      fpmCompleted: true,
      fpmAttendees: [
        "Kevin Brown",
        "Denise Brown",
        "David Chen",
      ],
      fpmNotes: "Comprehensive family plan developed",
      fpmGoals: [
        "Academic stability",
        "Therapeutic engagement",
        "Family communication",
      ],
    },
    staffingData: {
      staffingDate: "2026-02-20",
      staffingCompleted: false,
      decision: "Pending",
      staffingNotes: "Staffing scheduled for Feb 20",
      teamMembers: [
        "David Chen",
        "Sarah Williams",
        "Clinical Director",
      ],
      conditions: [],
    },
  },
  {
    id: "L-011",
    name: "Aaliyah Davis",
    program: "Mercy Home",
    guardian: "Marcus Davis",
    stage: "Referral",
    daysInStage: 7,
    status: "Delayed",
    lastActivity: "Waiting for guardian signature",
    alerts: ["Application incomplete", "Deadline approaching"],
    phone: "(312) 555-1111",
    email: "marcus.davis@email.com",
    caseManager: "Sarah Williams",
    admissionDate: "2026-03-05",
    nextAction: "Follow up with guardian for signatures",
    progress: 8,
    alertSeverity: "medium",
    alertAge: "5 days",
    createdDate: "2026-02-13",
    promotedDate: "2026-02-14",
    dateOfBirth: "2010-06-19",
    gender: "Female",
    ageGroup: "High School",
    campus: "West Loop",
    completedStages: [],
    intakeData: {
      intakeDate: "2026-02-12",
      inquirySource: "Online Inquiry",
      initialContactNotes:
        "Guardian interested but slow to respond",
      intakeFormCompleted: false,
      referralSource: "Website",
    },
  },
  {
    id: "L-012",
    name: "DeShawn Taylor",
    program: "Bosco Home",
    guardian: "Keisha Taylor",
    stage: "Info Session",
    daysInStage: 9,
    status: "Delayed",
    lastActivity: "No-show to scheduled session",
    alerts: ["Missed appointment", "No response to follow-up"],
    phone: "(773) 555-1212",
    email: "keisha.taylor@email.com",
    caseManager: "David Chen",
    admissionDate: "2026-03-10",
    nextAction: "Attempt phone contact, send final follow-up",
    progress: 18,
    alertSeverity: "high",
    alertAge: "7 days",
    createdDate: "2026-02-11",
    promotedDate: "2026-02-12",
    dateOfBirth: "2011-08-27",
    gender: "Male",
    ageGroup: "Middle School",
    campus: "Walsh",
    completedStages: ["Referral"],
    intakeData: {
      intakeDate: "2026-02-10",
      inquirySource: "Walk-in",
      initialContactNotes:
        "Guardian interested, youth hesitant",
      intakeFormCompleted: true,
      referralSource: "Self",
    },
    infoSessionData: {
      sessionDate: "2026-02-11",
      sessionAttended: false,
      attendees: [],
      sessionNotes: "No-show to scheduled session, no call",
      followUpScheduled: true,
      interestLevel: "Unknown",
    },
  },
  {
    id: "L-013",
    name: "Brianna Garcia",
    program: "Mercy Home",
    guardian: "Rosa Garcia",
    stage: "Assessments",
    daysInStage: 12,
    status: "Delayed",
    lastActivity: "Rescheduled psych eval (3rd time)",
    alerts: [
      "Multiple missed appointments",
      "Engagement concerns",
    ],
    phone: "(312) 555-1313",
    email: "rosa.garcia@email.com",
    caseManager: "Sarah Williams",
    admissionDate: "2026-03-22",
    nextAction: "Discuss barriers with guardian",
    progress: 35,
    assessments: {
      medical: "Completed",
      psychological: "Pending",
      educational: "Pending",
      background: "In Progress",
    },
    completedAssessments: 1,
    totalAssessments: 4,
    alertSeverity: "high",
    alertAge: "10 days",
    createdDate: "2026-01-10",
    promotedDate: "2026-01-12",
    dateOfBirth: "2009-02-14",
    gender: "Female",
    ageGroup: "High School",
    campus: "West Loop",
    completedStages: ["Referral", "Info Session"],
    intakeData: {
      intakeDate: "2026-01-08",
      inquirySource: "Family Service Agency",
      initialContactNotes: "Complex family situation",
      intakeFormCompleted: true,
      referralSource: "Community Agency",
    },
    infoSessionData: {
      sessionDate: "2026-01-15",
      sessionAttended: true,
      attendees: ["Brianna Garcia", "Rosa Garcia"],
      sessionNotes: "Promising initial engagement",
      followUpScheduled: true,
      interestLevel: "Medium",
    },
    assessmentData: {
      medicalExamDate: "2026-01-28",
      medicalExamCompleted: true,
      medicalNotes: "Medical exam complete",
      psychExamDate: "2026-02-20",
      psychExamCompleted: false,
      psychNotes:
        "Multiple reschedules, appointment set for Feb 25",
      educationalAssessmentDate: "",
      educationalAssessmentCompleted: false,
      educationalNotes: "Pending psychological completion",
      backgroundCheckDate: "2026-01-28",
      backgroundCheckCompleted: false,
      backgroundCheckStatus: "In Progress",
    },
  },
  {
    id: "L-014",
    name: "Malik Jackson",
    program: "Bosco Home",
    guardian: "Tamara Jackson",
    stage: "Referral",
    daysInStage: 2,
    status: "Referral",
    lastActivity: "Initial paperwork sent",
    alerts: [],
    phone: "(773) 555-1414",
    email: "tamara.jackson@email.com",
    caseManager: "David Chen",
    admissionDate: "2026-02-27",
    nextAction: "Schedule intake meeting",
    progress: 5,
    createdDate: "2026-02-18",
    promotedDate: "2026-02-19",
    dateOfBirth: "2012-05-11",
    gender: "Male",
    ageGroup: "Middle School",
    campus: "Walsh",
    completedStages: [],
    intakeData: {
      intakeDate: "2026-02-17",
      inquirySource: "Phone Inquiry",
      initialContactNotes: "Family relocating to Chicago",
      intakeFormCompleted: false,
      referralSource: "Out of State",
    },
  },
  {
    id: "L-015",
    name: "Jasmine Lewis",
    program: "Mercy Home",
    guardian: "Crystal Lewis",
    stage: "Info Session",
    daysInStage: 1,
    status: "Info Session Scheduled",
    lastActivity: "Session attended today",
    alerts: [],
    phone: "(312) 555-1515",
    email: "crystal.lewis@email.com",
    caseManager: "Sarah Williams",
    admissionDate: "2026-03-08",
    nextAction: "Send assessment intake information",
    progress: 22,
    createdDate: "2026-02-05",
    promotedDate: "2026-02-07",
    dateOfBirth: "2010-10-29",
    gender: "Female",
    ageGroup: "High School",
    campus: "West Loop",
    completedStages: ["Referral"],
    intakeData: {
      intakeDate: "2026-02-03",
      inquirySource: "Clergy Referral",
      initialContactNotes: "Church pastor recommended program",
      intakeFormCompleted: true,
      referralSource: "Faith Community",
    },
    infoSessionData: {
      sessionDate: "2026-02-20",
      sessionAttended: true,
      attendees: ["Jasmine Lewis", "Crystal Lewis"],
      sessionNotes:
        "Very engaged family, asked excellent questions",
      followUpScheduled: true,
      interestLevel: "Very High",
    },
  },
  {
    id: "L-016",
    name: "Jordan White",
    program: "Bosco Home",
    guardian: "Michelle White",
    stage: "Assessments",
    daysInStage: 15,
    status: "Closed",
    lastActivity: "Family withdrew application",
    alerts: ["Case closed"],
    phone: "(773) 555-1616",
    email: "michelle.white@email.com",
    caseManager: "David Chen",
    admissionDate: "",
    nextAction: "Archive file",
    progress: 30,
    assessments: {
      medical: "Pending",
      psychological: "Pending",
      educational: "Pending",
      background: "Not Started",
    },
    completedAssessments: 0,
    totalAssessments: 4,
    alertSeverity: "low",
    alertAge: "1 day",
    createdDate: "2026-01-05",
    promotedDate: "2026-01-08",
    dateOfBirth: "2009-04-02",
    gender: "Male",
    ageGroup: "High School",
    campus: "Walsh",
    completedStages: ["Referral", "Info Session"],
    intakeData: {
      intakeDate: "2026-01-03",
      inquirySource: "Online Inquiry",
      initialContactNotes: "Family exploring options",
      intakeFormCompleted: true,
      referralSource: "Website",
    },
    infoSessionData: {
      sessionDate: "2026-01-10",
      sessionAttended: true,
      attendees: ["Jordan White", "Michelle White"],
      sessionNotes:
        "Family decided on different program closer to home",
      followUpScheduled: false,
      interestLevel: "Low",
    },
    assessmentData: {
      medicalExamDate: "",
      medicalExamCompleted: false,
      medicalNotes: "Family withdrew before scheduling",
      psychExamDate: "",
      psychExamCompleted: false,
      psychNotes: "",
      educationalAssessmentDate: "",
      educationalAssessmentCompleted: false,
      educationalNotes: "",
      backgroundCheckDate: "",
      backgroundCheckCompleted: false,
      backgroundCheckStatus: "Not Started",
    },
  },
  {
    id: "L-017",
    name: "Aiden Murphy",
    program: "Mercy Home",
    guardian: "Patrick Murphy",
    stage: "Info Session",
    daysInStage: 4,
    status: "Delayed",
    lastActivity: "Guardian requested postponement",
    alerts: ["On hold per family request"],
    phone: "(312) 555-1717",
    email: "patrick.murphy@email.com",
    caseManager: "Sarah Williams",
    admissionDate: "2026-04-01",
    nextAction: "Check in with family on March 1",
    progress: 15,
    alertSeverity: "low",
    alertAge: "3 days",
    createdDate: "2026-02-08",
    promotedDate: "2026-02-10",
    dateOfBirth: "2011-12-16",
    gender: "Male",
    ageGroup: "Middle School",
    campus: "West Loop",
    completedStages: ["Referral"],
    intakeData: {
      intakeDate: "2026-02-06",
      inquirySource: "Physician Referral",
      initialContactNotes: "Pediatrician recommended program",
      intakeFormCompleted: true,
      referralSource: "Medical Provider",
    },
    infoSessionData: {
      sessionDate: "2026-03-15",
      sessionAttended: false,
      attendees: [],
      sessionNotes:
        "Family requested postponement due to personal matter",
      followUpScheduled: true,
      interestLevel: "Medium",
    },
  },
  {
    id: "L-018",
    name: "Zoe Adams",
    program: "Bosco Home",
    guardian: "Jennifer Adams",
    stage: "Move-In",
    daysInStage: 4,
    status: "Closed",
    lastActivity: "Family declined admission offer",
    alerts: ["Position declined"],
    phone: "(773) 555-1818",
    email: "jennifer.adams@email.com",
    caseManager: "David Chen",
    admissionDate: "",
    nextAction: "Close case file",
    progress: 90,
    alertSeverity: "low",
    alertAge: "2 days",
    createdDate: "2025-09-15",
    promotedDate: "2025-09-18",
    dateOfBirth: "2010-07-08",
    gender: "Female",
    ageGroup: "High School",
    campus: "Walsh",
    completedStages: [
      "Referral",
      "Info Session",
      "Assessments",
      "Shadow & FPM",
      "Staffing",
    ],
    intakeData: {
      intakeDate: "2025-09-12",
      inquirySource: "DCFS Referral",
      initialContactNotes: "Case worker referral",
      intakeFormCompleted: true,
      referralSource: "DCFS",
    },
    infoSessionData: {
      sessionDate: "2025-09-20",
      sessionAttended: true,
      attendees: ["Zoe Adams", "Jennifer Adams"],
      sessionNotes: "Positive session",
      followUpScheduled: true,
      interestLevel: "High",
    },
    assessmentData: {
      medicalExamDate: "2025-10-10",
      medicalExamCompleted: true,
      medicalNotes: "All requirements met",
      psychExamDate: "2025-10-15",
      psychExamCompleted: true,
      psychNotes: "Clinical assessment complete",
      educationalAssessmentDate: "2025-10-20",
      educationalAssessmentCompleted: true,
      educationalNotes: "Academic profile complete",
      backgroundCheckDate: "2025-10-10",
      backgroundCheckCompleted: true,
      backgroundCheckStatus: "Clear",
    },
    shadowFPMData: {
      shadowDate: "2025-11-05",
      shadowCompleted: true,
      shadowNotes: "Successful shadow day",
      shadowFeedback: "Positive experience",
      fpmDate: "2025-11-10",
      fpmCompleted: true,
      fpmAttendees: [
        "Zoe Adams",
        "Jennifer Adams",
        "David Chen",
      ],
      fpmNotes: "Comprehensive planning completed",
      fpmGoals: ["Academic success", "Social integration"],
    },
    staffingData: {
      staffingDate: "2025-12-01",
      staffingCompleted: true,
      decision: "Approved",
      staffingNotes: "Approved for admission",
      teamMembers: [
        "David Chen",
        "Sarah Williams",
        "Clinical Director",
      ],
      conditions: [],
    },
    moveInData: {
      moveInDate: "2026-02-16",
      roomNumber: "",
      roommate: "",
      orientationCompleted: false,
      checklistCompleted: false,
      welcomePacketProvided: false,
      moveInNotes:
        "Family accepted placement at alternative program closer to extended family",
    },
  },
  {
    // Earlier, closed admission attempt for Marcus Thompson (same youth as
    // L-001) — gives one youth more than one Admissions Profile (US 19983).
    id: "L-019",
    youthId: "Y-001",
    name: "Marcus Thompson",
    program: "Bosco Home",
    guardian: "Patricia Thompson",
    stage: "Info Session",
    daysInStage: 0,
    status: "Closed",
    lastActivity: "Family withdrew before assessments",
    alerts: [],
    phone: "(312) 555-0101",
    email: "patricia.thompson@email.com",
    caseManager: "Sarah Williams",
    admissionDate: "",
    nextAction: "",
    progress: 20,
    createdDate: "2025-06-10",
    promotedDate: "2025-06-12",
    dateOfBirth: "2010-03-15",
    gender: "Male",
    ageGroup: "High School",
    campus: "Walsh",
    completedStages: ["Referral"],
    intakeData: {
      intakeDate: "2025-06-10",
      inquirySource: "School Counselor Referral",
      initialContactNotes:
        "Mother inquired; family later withdrew",
      intakeFormCompleted: true,
      referralSource: "Lincoln Park High School",
    },
  },
  // ── Demo Admission for US 20093 (prototype only) ────────────────────────
  // Explicitly linked to Youth Constituent 1 (Emily Johnson) so the shared
  // Tutor Session Connections can be shown in Admissions. This fixture does
  // not establish the production relationship.
  {
    id: "L-DEMO-20093",
    youthId: "Y-DEMO-20093",
    youthConstituentId: 1,
    name: "Emily Johnson (Demo – US 20093)",
    program: "Bosco Home",
    guardian: "Laura Johnson",
    stage: "Referral",
    daysInStage: 2,
    status: "Referral",
    lastActivity: "Demo admission linked to Constituent 1",
    alerts: [],
    phone: "(312) 555-0199",
    email: "laura.johnson@email.com",
    caseManager: "Sarah Williams",
    createdDate: "2026-10-12",
    promotedDate: "2026-10-13",
    dateOfBirth: "2011-05-20",
    gender: "Female",
    ageGroup: "High School",
    campus: "West Loop",
    completedStages: [],
  },
];

/**
 * The other Admissions Profiles for the same youth as `profileId` (matched by
 * youthId), newest first. Empty when the youth has only one profile.
 */
export const getAlternateAdmissionProfiles = (
  profileId: string,
  /** The collection to search — pass the current leads (saved categories
   *  applied) so related profiles don't show a stale baseline category. */
  leads: readonly Lead[] = ALL_LEADS,
): Lead[] => {
  const current = leads.find((l) => l.id === profileId);
  if (!current?.youthId) return [];
  return leads
    .filter(
      (l) =>
        l.youthId === current.youthId && l.id !== current.id,
    )
    .sort((a, b) => b.createdDate.localeCompare(a.createdDate));
};

/** Display label in the existing Related Admission Attempt format: "M/D/YYYY (Status)". */
export const formatAdmissionAttemptLabel = (
  lead: Lead,
): string => {
  const [y, m, d] = lead.createdDate.split("-").map(Number);
  return `${m}/${d}/${y} (${lead.status})`;
};

// Helper functions to filter leads by category
// Each takes the lead collection to filter (default: the seed ALL_LEADS), so
// views can apply the same membership rules to leads with their saved
// categories (US 20140) instead of the baseline.
export const getInProgressLeads = (
  leads: readonly Lead[] = ALL_LEADS,
) => leads.filter((l) => l.status !== "Closed");
export const getLeadsInAssessment = (
  leads: readonly Lead[] = ALL_LEADS,
) => leads.filter((l) => l.stage === "Assessments");
export const getLeadsWithAlerts = (
  leads: readonly Lead[] = ALL_LEADS,
) => leads.filter((l) => l.alerts.length > 0);
export const getTotalAlertCount = (
  leads: readonly Lead[] = ALL_LEADS,
) => leads.reduce((acc, l) => acc + l.alerts.length, 0);
export const getLeadsInMoveIn = (
  leads: readonly Lead[] = ALL_LEADS,
) => leads.filter((l) => l.stage === "Move-In");