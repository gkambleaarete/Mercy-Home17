export interface ResidentProfile {
  id: string;
  name: string;
  age: number;
  dateOfBirth: string;
  admissionDate: string;
  lengthOfStay: string;
  caseManager: string;
  status: string;
  programId: string;
  programName: string;
  
  // Personal Information
  personalInfo: {
    ssn: string;
    gender: string;
    race: string;
    ethnicity: string;
    preferredLanguage: string;
    email: string;
    phone: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
      email: string;
    };
  };
  
  // Address Information
  addressInfo: {
    current: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
    prior?: {
      street: string;
      city: string;
      state: string;
      zip: string;
      residencyType: string;
    };
  };
  
  // Medical Information
  medicalInfo: {
    primaryPhysician: string;
    insuranceProvider: string;
    insurancePolicyNumber: string;
    allergies: string[];
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      prescribedBy: string;
      startDate: string;
    }>;
    medicalConditions: string[];
    lastPhysicalExam: string;
  };
  
  // Case Management
  caseManagement: {
    intakeDate: string;
    assessmentDate: string;
    serviceStartDate: string;
    projectedExitDate: string;
    caseManagerEmail: string;
    caseManagerPhone: string;
    supervisionLevel: string;
    currentPhase: string;
    overallProgress: number;
  };
  
  // Goals & Services
  goals: Array<{
    id: string;
    category: string;
    description: string;
    targetDate: string;
    status: string;
    progress: number;
    assignedTo: string;
  }>;
  
  services: Array<{
    id: string;
    serviceName: string;
    provider: string;
    frequency: string;
    startDate: string;
    status: string;
  }>;
  
  // Education & Employment
  educationEmployment: {
    educationLevel: string;
    currentSchool?: string;
    gradeLevel?: string;
    employmentStatus: string;
    employer?: string;
    position?: string;
    hoursPerWeek?: number;
  };
  
  // Family & Guardian
  familyInfo: {
    guardianName?: string;
    guardianRelationship?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    siblings: number;
    familyInvolvement: string;
  };
  
  // Legal Information
  legalInfo?: {
    courtInvolvement: boolean;
    probationOfficer?: string;
    probationOfficerPhone?: string;
    legalStatus?: string;
    courtDates?: Array<{
      date: string;
      type: string;
      location: string;
    }>;
  };
  
  // Activity Timeline
  activities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    date: string;
    time: string;
    author: string;
    category: string;
  }>;
  
  // Documents
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploadedBy: string;
    uploadedDate: string;
    size: string;
  }>;
}

export const RESIDENT_PROFILES: ResidentProfile[] = [
  // COUDERC PROGRAM RESIDENTS
  {
    id: "C001",
    name: "James Anderson",
    age: 16,
    dateOfBirth: "2008-03-15",
    admissionDate: "2024-03-15",
    lengthOfStay: "8 months",
    caseManager: "Lisa Johnson",
    status: "Active",
    programId: "PROG-001",
    programName: "Couderc Residential",
    
    personalInfo: {
      ssn: "***-**-4521",
      gender: "Male",
      race: "African American",
      ethnicity: "Non-Hispanic",
      preferredLanguage: "English",
      email: "james.anderson@mercyhome.org",
      phone: "(312) 555-0145",
      emergencyContact: {
        name: "Margaret Anderson",
        relationship: "Mother",
        phone: "(312) 555-0198",
        email: "m.anderson@email.com"
      }
    },
    
    addressInfo: {
      current: {
        street: "1125 W Jackson Blvd",
        city: "Chicago",
        state: "IL",
        zip: "60607"
      },
      prior: {
        street: "4523 S King Drive",
        city: "Chicago",
        state: "IL",
        zip: "60653",
        residencyType: "Family Home"
      }
    },
    
    medicalInfo: {
      primaryPhysician: "Dr. Michael Chen, MD",
      insuranceProvider: "Blue Cross Blue Shield",
      insurancePolicyNumber: "BCBS-789456123",
      allergies: ["Penicillin", "Peanuts"],
      medications: [
        {
          name: "Sertraline",
          dosage: "50mg",
          frequency: "Once daily",
          prescribedBy: "Dr. Lisa Martinez",
          startDate: "2024-02-01"
        },
        {
          name: "Albuterol Inhaler",
          dosage: "90mcg",
          frequency: "As needed",
          prescribedBy: "Dr. Michael Chen",
          startDate: "2023-12-15"
        }
      ],
      medicalConditions: ["Asthma", "Anxiety Disorder"],
      lastPhysicalExam: "2024-11-20"
    },
    
    caseManagement: {
      intakeDate: "2024-03-05",
      assessmentDate: "2024-03-08",
      serviceStartDate: "2024-03-15",
      projectedExitDate: "2025-03-15",
      caseManagerEmail: "l.johnson@mercyhome.org",
      caseManagerPhone: "(312) 738-7560",
      supervisionLevel: "Medium",
      currentPhase: "Phase 2: Stabilization",
      overallProgress: 65
    },
    
    goals: [
      {
        id: "GOAL-001",
        category: "Education",
        description: "Complete GED preparation and pass all subject tests",
        targetDate: "2025-06-01",
        status: "In Progress",
        progress: 70,
        assignedTo: "Lisa Johnson"
      },
      {
        id: "GOAL-002",
        category: "Life Skills",
        description: "Develop independent living skills including cooking, budgeting, and time management",
        targetDate: "2025-02-01",
        status: "In Progress",
        progress: 55,
        assignedTo: "Lisa Johnson"
      },
      {
        id: "GOAL-003",
        category: "Employment",
        description: "Secure part-time employment (15-20 hours/week)",
        targetDate: "2025-01-15",
        status: "In Progress",
        progress: 40,
        assignedTo: "Career Counselor"
      },
      {
        id: "GOAL-004",
        category: "Mental Health",
        description: "Attend weekly therapy sessions and demonstrate coping strategies",
        targetDate: "2025-03-15",
        status: "On Track",
        progress: 80,
        assignedTo: "Dr. Lisa Martinez"
      }
    ],
    
    services: [
      {
        id: "SVC-001",
        serviceName: "Individual Therapy",
        provider: "Dr. Lisa Martinez, LCSW",
        frequency: "Weekly",
        startDate: "2024-03-18",
        status: "Active"
      },
      {
        id: "SVC-002",
        serviceName: "Academic Tutoring",
        provider: "Chicago Literacy Alliance",
        frequency: "3x per week",
        startDate: "2024-03-22",
        status: "Active"
      },
      {
        id: "SVC-003",
        serviceName: "Career Readiness Workshop",
        provider: "Youth Job Center",
        frequency: "Bi-weekly",
        startDate: "2024-04-01",
        status: "Active"
      },
      {
        id: "SVC-004",
        serviceName: "Group Therapy",
        provider: "Mercy Home Counseling",
        frequency: "Weekly",
        startDate: "2024-03-20",
        status: "Active"
      }
    ],
    
    educationEmployment: {
      educationLevel: "11th Grade (Not Completed)",
      currentSchool: "GED Program - Chicago Public Schools",
      gradeLevel: "GED Prep",
      employmentStatus: "Job Seeking",
      hoursPerWeek: 0
    },
    
    familyInfo: {
      guardianName: "Margaret Anderson",
      guardianRelationship: "Mother",
      guardianPhone: "(312) 555-0198",
      guardianEmail: "m.anderson@email.com",
      siblings: 2,
      familyInvolvement: "Monthly family therapy sessions; moderate contact"
    },
    
    legalInfo: {
      courtInvolvement: false,
      legalStatus: "No current legal involvement"
    },
    
    activities: [
      {
        id: "ACT-021",
        type: "note",
        title: "Weekly Check-In",
        description: "James reported good progress in GED prep. Math scores improving. Discussed job search strategy and updated resume.",
        date: "2024-12-08",
        time: "2:30 PM",
        author: "Lisa Johnson",
        category: "Case Management"
      },
      {
        id: "ACT-020",
        type: "appointment",
        title: "Therapy Session",
        description: "Individual therapy session focused on anxiety management and coping strategies. James demonstrated good understanding of breathing techniques.",
        date: "2024-12-06",
        time: "4:00 PM",
        author: "Dr. Lisa Martinez",
        category: "Mental Health"
      },
      {
        id: "ACT-019",
        type: "note",
        title: "Academic Progress Report",
        description: "GED Practice Test Results: Math 75%, Reading 82%, Science 78%, Social Studies 80%. Recommend additional math tutoring.",
        date: "2024-12-04",
        time: "10:00 AM",
        author: "Academic Coordinator",
        category: "Education"
      },
      {
        id: "ACT-018",
        type: "task",
        title: "Job Application Follow-Up",
        description: "Assisted James with follow-up calls to three employers. One interview scheduled for next week at local grocery store.",
        date: "2024-12-02",
        time: "1:00 PM",
        author: "Career Counselor",
        category: "Employment"
      },
      {
        id: "ACT-017",
        type: "note",
        title: "Family Therapy Session",
        description: "Productive session with James and his mother. Discussed communication strategies and visit schedule. Next family session scheduled for 12/20.",
        date: "2024-11-29",
        time: "3:00 PM",
        author: "Dr. Lisa Martinez",
        category: "Family Services"
      },
      {
        id: "ACT-016",
        type: "milestone",
        title: "Phase 2 Advancement",
        description: "James successfully advanced to Phase 2: Stabilization. Demonstrated consistent attendance, positive behavior, and engagement in services.",
        date: "2024-11-25",
        time: "9:00 AM",
        author: "Lisa Johnson",
        category: "Program Milestone"
      },
      {
        id: "ACT-015",
        type: "appointment",
        title: "Medical Check-Up",
        description: "Annual physical examination completed. All vitals normal. Asthma well-controlled. Renewed prescriptions.",
        date: "2024-11-20",
        time: "11:00 AM",
        author: "Dr. Michael Chen",
        category: "Medical"
      },
      {
        id: "ACT-014",
        type: "note",
        title: "Life Skills Workshop",
        description: "Participated in budgeting workshop. Created first monthly budget plan. Showed strong interest in financial literacy.",
        date: "2024-11-15",
        time: "5:00 PM",
        author: "Life Skills Coordinator",
        category: "Life Skills"
      }
    ],
    
    documents: [
      {
        id: "DOC-001",
        name: "Birth Certificate",
        type: "Legal Document",
        uploadedBy: "Lisa Johnson",
        uploadedDate: "2024-03-15",
        size: "245 KB"
      },
      {
        id: "DOC-002",
        name: "Medical Records - Dr. Chen",
        type: "Medical",
        uploadedBy: "Medical Dept",
        uploadedDate: "2024-11-20",
        size: "1.2 MB"
      },
      {
        id: "DOC-003",
        name: "Insurance Card - BCBS",
        type: "Insurance",
        uploadedBy: "Lisa Johnson",
        uploadedDate: "2024-03-15",
        size: "156 KB"
      },
      {
        id: "DOC-004",
        name: "Initial Assessment Report",
        type: "Case Management",
        uploadedBy: "Lisa Johnson",
        uploadedDate: "2024-03-08",
        size: "890 KB"
      },
      {
        id: "DOC-005",
        name: "GED Practice Test Results",
        type: "Education",
        uploadedBy: "Academic Coordinator",
        uploadedDate: "2024-12-04",
        size: "423 KB"
      },
      {
        id: "DOC-006",
        name: "Medication List - Current",
        type: "Medical",
        uploadedBy: "Medical Dept",
        uploadedDate: "2024-11-20",
        size: "78 KB"
      }
    ]
  },
  {
    id: "C002",
    name: "Michael Brown",
    age: 15,
    dateOfBirth: "2009-05-20",
    admissionDate: "2024-05-20",
    lengthOfStay: "6 months",
    caseManager: "David Martinez",
    status: "Active",
    programId: "PROG-001",
    programName: "Couderc Residential",
    
    personalInfo: {
      ssn: "***-**-7823",
      gender: "Male",
      race: "Hispanic/Latino",
      ethnicity: "Hispanic",
      preferredLanguage: "English/Spanish",
      email: "m.brown@mercyhome.org",
      phone: "(312) 555-0267",
      emergencyContact: {
        name: "Rosa Brown",
        relationship: "Grandmother",
        phone: "(312) 555-0289",
        email: "r.brown@email.com"
      }
    },
    
    addressInfo: {
      current: {
        street: "1125 W Jackson Blvd",
        city: "Chicago",
        state: "IL",
        zip: "60607"
      },
      prior: {
        street: "2156 W 21st Place",
        city: "Chicago",
        state: "IL",
        zip: "60608",
        residencyType: "Grandmother's Home"
      }
    },
    
    medicalInfo: {
      primaryPhysician: "Dr. Jennifer Lopez, MD",
      insuranceProvider: "Medicaid",
      insurancePolicyNumber: "MCD-456789012",
      allergies: [],
      medications: [],
      medicalConditions: [],
      lastPhysicalExam: "2024-10-15"
    },
    
    caseManagement: {
      intakeDate: "2024-05-10",
      assessmentDate: "2024-05-15",
      serviceStartDate: "2024-05-20",
      projectedExitDate: "2025-05-20",
      caseManagerEmail: "d.martinez@mercyhome.org",
      caseManagerPhone: "(312) 738-7562",
      supervisionLevel: "High",
      currentPhase: "Phase 1: Orientation",
      overallProgress: 45
    },
    
    goals: [
      {
        id: "GOAL-101",
        category: "Education",
        description: "Maintain regular school attendance (95%+)",
        targetDate: "2025-06-01",
        status: "In Progress",
        progress: 60,
        assignedTo: "David Martinez"
      },
      {
        id: "GOAL-102",
        category: "Behavioral",
        description: "Develop anger management and conflict resolution skills",
        targetDate: "2025-04-01",
        status: "In Progress",
        progress: 35,
        assignedTo: "Dr. Robert Kim"
      }
    ],
    
    services: [
      {
        id: "SVC-101",
        serviceName: "Individual Therapy",
        provider: "Dr. Robert Kim, LCSW",
        frequency: "Bi-weekly",
        startDate: "2024-05-25",
        status: "Active"
      },
      {
        id: "SVC-102",
        serviceName: "Academic Support",
        provider: "On-site Tutor",
        frequency: "Daily",
        startDate: "2024-05-20",
        status: "Active"
      }
    ],
    
    educationEmployment: {
      educationLevel: "10th Grade",
      currentSchool: "Whitney M. Young Magnet High School",
      gradeLevel: "10th",
      employmentStatus: "Not Employed"
    },
    
    familyInfo: {
      guardianName: "Rosa Brown",
      guardianRelationship: "Grandmother",
      guardianPhone: "(312) 555-0289",
      guardianEmail: "r.brown@email.com",
      siblings: 1,
      familyInvolvement: "Bi-weekly phone contact; grandmother has health limitations"
    },
    
    activities: [
      {
        id: "ACT-201",
        type: "note",
        title: "Weekly Check-In",
        description: "Michael had a good week. Attendance at school improving. Still working on conflict resolution with peers.",
        date: "2024-12-07",
        time: "3:00 PM",
        author: "David Martinez",
        category: "Case Management"
      },
      {
        id: "ACT-202",
        type: "appointment",
        title: "Therapy Session",
        description: "Discussed triggers for anger. Practiced deep breathing and counting techniques.",
        date: "2024-12-05",
        time: "4:30 PM",
        author: "Dr. Robert Kim",
        category: "Mental Health"
      }
    ],
    
    documents: [
      {
        id: "DOC-101",
        name: "Birth Certificate",
        type: "Legal Document",
        uploadedBy: "David Martinez",
        uploadedDate: "2024-05-20",
        size: "198 KB"
      },
      {
        id: "DOC-102",
        name: "School Enrollment Form",
        type: "Education",
        uploadedBy: "Academic Coordinator",
        uploadedDate: "2024-05-20",
        size: "234 KB"
      }
    ]
  }
];

// Helper function to get resident by name
export function getResidentByName(name: string): ResidentProfile | undefined {
  return RESIDENT_PROFILES.find(resident => resident.name === name);
}

// Helper function to get resident by ID
export function getResidentById(id: string): ResidentProfile | undefined {
  return RESIDENT_PROFILES.find(resident => resident.id === id);
}