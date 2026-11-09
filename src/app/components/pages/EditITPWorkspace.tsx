import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { 
    ArrowLeft, 
    Calendar, 
    Users, 
    Building2,
    Heart,
    CheckCircle2,
    Circle,
    Clock,
    FileText,
    Target,
    Brain,
    Flag,
    Users2,
    Sparkles,
    Activity,
    Smile,
    ClipboardList,
    UserCircle,
    Home,
    Church,
    Stethoscope,
    HeartPulse,
    Pill,
    AlertTriangle,
    AlertCircle,
    MessageCircle,
    Scale,
    Gavel,
    Shield,
    ShieldAlert,
    Hand,
    FileBarChart,
    BookOpen,
    Briefcase,
    GraduationCap,
    TrendingUp,
    School,
    ClipboardCheck,
    ChevronDown,
    ChevronRight,
    Save,
    Star,
    X,
    History,
    Lock,
    Unlock,
    Trash2,
    Info
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { toast } from "sonner@2.0.3";
import { EditITPWorkspaceSectionsA } from "./EditITPWorkspaceSectionsA";
import { EditITPWorkspaceSectionsB } from "./EditITPWorkspaceSectionsB";
import { EditITPWorkspaceSectionsC } from "./EditITPWorkspaceSectionsC";
import { EditITPWorkspaceSectionsD } from "./EditITPWorkspaceSectionsD";
import { formatMdy } from "../../lib/dateFormat";
import { getDemoUserName } from "../../lib/demoIdentity";
import { getItpSectionProgress, writeItpSectionProgress, getItpConnections, writeItpConnections } from "../../data/itpSectionStore";
import { isWithinItpDateRange, overlapsItpDateRange } from "../../lib/itpDateRange";
import { ConnectionFormDialog, Connection } from "../admissions/ConnectionFormDialog";

// Mock medication data - sourced from youth's Medication records
const MOCK_MEDICATION_DATA = {
    1: [ // Fozzie Bear - has medications with some missed doses
        {
            id: "med-001",
            medication: "Sertraline",
            dosePeriod: "Once Daily",
            dose: "50mg",
            totalExpectedDoses: 90,
            missedDoses: 3,
            startDate: "2025-01-06",
            endDate: null
        },
        {
            id: "med-002",
            medication: "Melatonin",
            dosePeriod: "Nightly",
            dose: "3mg",
            totalExpectedDoses: 90,
            missedDoses: 1,
            startDate: "2025-01-06",
            endDate: null
        },
        {
            id: "med-003",
            medication: "Guanfacine",
            dosePeriod: "Twice Daily",
            dose: "1mg",
            totalExpectedDoses: 180,
            missedDoses: 8,
            startDate: "2025-01-06",
            endDate: null
        }
    ],
    2: [ // Kermit - has medications with perfect compliance
        {
            id: "med-004",
            medication: "Fluoxetine",
            dosePeriod: "Once Daily",
            dose: "20mg",
            totalExpectedDoses: 91,
            missedDoses: 0,
            startDate: "2024-12-02",
            endDate: null
        }
    ],
    3: [], // Red Fraggle - no medications (empty state)
    4: [ // Miss Piggy - has medications with compliance concerns
        {
            id: "med-005",
            medication: "Methylphenidate",
            dosePeriod: "Twice Daily",
            dose: "10mg",
            totalExpectedDoses: 182,
            missedDoses: 15,
            startDate: "2024-11-18",
            endDate: null
        },
        {
            id: "med-006",
            medication: "Clonidine",
            dosePeriod: "Nightly",
            dose: "0.1mg",
            totalExpectedDoses: 91,
            missedDoses: 2,
            startDate: "2024-11-18",
            endDate: null
        }
    ]
};

// Mock Physical Health data - sourced from youth's profile and Connection records
const MOCK_PHYSICAL_HEALTH_DATA = {
    1: { // Fozzie Bear
        currentMedicalNeeds: [
            {
                id: "need-001",
                type: "Asthma",
                startDate: "2023-09-14",
                endDate: null,
                details: "Exercise-induced asthma managed with rescue inhaler as needed"
            },
            {
                id: "need-002",
                type: "Seasonal Allergies",
                startDate: "2024-03-01",
                endDate: null,
                details: "Moderate seasonal allergies (pollen, dust mites)"
            }
        ],
        medicalConnections: [
            {
                id: "conn-001",
                date: "2025-03-15",
                type: "Annual Physical",
                reason: "Routine annual examination"
            },
            {
                id: "conn-002",
                date: "2025-02-10",
                type: "Dentist Appointment",
                reason: "Routine cleaning and checkup"
            },
            {
                id: "conn-003",
                date: "2025-01-22",
                type: "Allergy Specialist",
                reason: "Seasonal allergy management consultation"
            }
        ],
        keyMedicalDates: {
            lastAnnualPhysical: "2025-03-15",
            lastBiennialDental: "2025-02-10",
            lastHearing: "2024-08-12",
            lastVision: "2024-09-05",
            behavior: "Compliant with medical appointments"
        },
        cpiHolds: []
    },
    2: { // Kermit
        currentMedicalNeeds: [],
        medicalConnections: [
            {
                id: "conn-004",
                date: "2025-01-28",
                type: "Annual Physical",
                reason: "Routine annual examination"
            },
            {
                id: "conn-005",
                date: "2024-12-15",
                type: "Vision Screening",
                reason: "Routine vision checkup"
            }
        ],
        keyMedicalDates: {
            lastAnnualPhysical: "2025-01-28",
            lastBiennialDental: "2024-06-20",
            lastHearing: "2024-03-10",
            lastVision: "2024-12-15",
            behavior: "Excellent compliance with all medical care"
        },
        cpiHolds: []
    },
    3: { // Red Fraggle - has compliance issues
        currentMedicalNeeds: [
            {
                id: "need-003",
                type: "Type 1 Diabetes",
                startDate: "2022-05-18",
                endDate: null,
                details: "Insulin-dependent diabetes, requires daily glucose monitoring and insulin administration"
            }
        ],
        medicalConnections: [
            {
                id: "conn-006",
                date: "2025-03-05",
                type: "Endocrinologist",
                reason: "Diabetes management follow-up"
            },
            {
                id: "conn-007",
                date: "2025-01-30",
                type: "Endocrinologist",
                reason: "Diabetes management quarterly review"
            }
        ],
        keyMedicalDates: {
            lastAnnualPhysical: "2024-08-15",
            lastBiennialDental: "2023-11-10",
            lastHearing: "2023-09-22",
            lastVision: "2025-02-01",
            behavior: "Overdue for annual physical and biennial dental"
        },
        cpiHolds: []
    },
    4: { // Miss Piggy - has CPI hold record
        currentMedicalNeeds: [
            {
                id: "need-004",
                type: "Seizure Disorder",
                startDate: "2021-11-03",
                endDate: null,
                details: "Epilepsy controlled with medication, no seizures in past 18 months"
            }
        ],
        medicalConnections: [
            {
                id: "conn-008",
                date: "2025-02-20",
                type: "Neurologist",
                reason: "Seizure disorder medication review"
            },
            {
                id: "conn-009",
                date: "2025-01-15",
                type: "Annual Physical",
                reason: "Routine annual examination"
            },
            {
                id: "conn-010",
                date: "2024-12-08",
                type: "Dentist Appointment",
                reason: "Routine cleaning and checkup"
            }
        ],
        keyMedicalDates: {
            lastAnnualPhysical: "2025-01-15",
            lastBiennialDental: "2024-12-08",
            lastHearing: "2024-07-18",
            lastVision: "2024-10-25",
            behavior: "Compliant with medical appointments"
        },
        cpiHolds: [
            {
                id: "cpi-001",
                startDate: "2024-11-20",
                type: "Medical Precaution",
                details: "Temporary hold due to seizure activity - resolved with medication adjustment",
                status: "Inactive",
                endDate: "2024-12-10"
            }
        ]
    }
};

// Mock Mental Health data - sourced from youth's profile and Connection records
const MOCK_MENTAL_HEALTH_DATA = {
    1: { // Fozzie Bear - has active supplemental plans and diagnoses
        supplementalPlans: [
            {
                id: "supp-001",
                startDate: "2025-01-15",
                type: "No Harm Contract",
                planDescription: "Youth agreed to notify staff immediately if experiencing thoughts of self-harm or suicide",
                endDate: null
            },
            {
                id: "supp-002",
                startDate: "2024-12-10",
                type: "Self Harm Safety Plan",
                planDescription: "Developed safety plan including coping strategies, trusted contacts, and crisis resources",
                endDate: "2025-02-28"
            }
        ],
        diagnosticImpression: [
            {
                id: "diag-001",
                startDate: "2023-08-15",
                code: "F41.1",
                details: "Generalized Anxiety Disorder",
                endDate: null
            },
            {
                id: "diag-002",
                startDate: "2024-01-20",
                code: "F33.1",
                details: "Major Depressive Disorder, Recurrent, Moderate",
                endDate: null
            }
        ],
        mentalHealthConnections: [
            {
                id: "mh-conn-001",
                date: "2025-03-18",
                type: "Individual Therapy",
                reason: "Weekly therapy session - anxiety management and coping skills"
            },
            {
                id: "mh-conn-002",
                date: "2025-03-11",
                type: "Individual Therapy",
                reason: "Weekly therapy session - processing recent family visit"
            },
            {
                id: "mh-conn-003",
                date: "2025-03-01",
                type: "Psychiatric Consultation",
                reason: "Medication review and adjustment"
            }
        ]
    },
    2: { // Kermit - minimal mental health records
        supplementalPlans: [],
        diagnosticImpression: [
            {
                id: "diag-003",
                startDate: "2023-05-10",
                code: "F90.0",
                details: "Attention-Deficit/Hyperactivity Disorder, Predominantly Inattentive Type",
                endDate: null
            }
        ],
        mentalHealthConnections: [
            {
                id: "mh-conn-004",
                date: "2025-02-25",
                type: "Individual Therapy",
                reason: "Bi-weekly therapy session - focus and organizational skills"
            }
        ]
    },
    3: { // Red Fraggle - empty state for supplemental plans
        supplementalPlans: [],
        diagnosticImpression: [
            {
                id: "diag-004",
                startDate: "2022-11-05",
                code: "F43.10",
                details: "Post-Traumatic Stress Disorder",
                endDate: null
            },
            {
                id: "diag-005",
                startDate: "2024-02-18",
                code: "F91.1",
                details: "Conduct Disorder, Childhood-Onset Type",
                endDate: null
            }
        ],
        mentalHealthConnections: [
            {
                id: "mh-conn-005",
                date: "2025-03-20",
                type: "Individual Therapy",
                reason: "Trauma-focused therapy session"
            },
            {
                id: "mh-conn-006",
                date: "2025-03-13",
                type: "Individual Therapy",
                reason: "Trauma-focused therapy session"
            },
            {
                id: "mh-conn-007",
                date: "2025-03-06",
                type: "Group Therapy",
                reason: "Anger management group session"
            }
        ]
    },
    4: { // Miss Piggy - has suicide prevention agreement
        supplementalPlans: [
            {
                id: "supp-003",
                startDate: "2024-11-25",
                type: "Suicide Prevention Agreement",
                planDescription: "Youth committed to safety contract with 24/7 crisis support access and immediate staff notification protocol",
                endDate: "2025-01-15"
            },
            {
                id: "supp-004",
                startDate: "2025-01-20",
                type: "No Harm Contract",
                planDescription: "Renewed safety agreement following psychiatric evaluation",
                endDate: null
            }
        ],
        diagnosticImpression: [
            {
                id: "diag-006",
                startDate: "2021-09-12",
                code: "F31.81",
                details: "Bipolar II Disorder",
                endDate: null
            },
            {
                id: "diag-007",
                startDate: "2023-06-22",
                code: "F60.3",
                details: "Borderline Personality Disorder",
                endDate: null
            }
        ],
        mentalHealthConnections: [
            {
                id: "mh-conn-008",
                date: "2025-02-28",
                type: "Psychiatric Consultation",
                reason: "Medication management and mood stabilization review"
            },
            {
                id: "mh-conn-009",
                date: "2025-02-21",
                type: "Individual Therapy",
                reason: "DBT skills training - emotion regulation"
            },
            {
                id: "mh-conn-010",
                date: "2025-02-14",
                type: "Individual Therapy",
                reason: "DBT skills training - distress tolerance"
            }
        ]
    }
};

// Mock Prior ITPs data - Finalized ITPs for each youth
const MOCK_PRIOR_ITPS = {
    1: [ // Fozzie Bear - prior finalized ITPs
        {
            id: "itp-1-003",
            name: "Q4 2024 Treatment Plan",
            startDate: "2024-10-01",
            endDate: "2024-12-31",
            status: "Finalized",
            finalizedDate: "2025-01-05"
        },
        {
            id: "itp-1-002",
            name: "Q3 2024 Treatment Plan",
            startDate: "2024-07-01",
            endDate: "2024-09-30",
            status: "Finalized",
            finalizedDate: "2024-10-03"
        },
        {
            id: "itp-1-001",
            name: "Q2 2024 Treatment Plan",
            startDate: "2024-04-01",
            endDate: "2024-06-30",
            status: "Finalized",
            finalizedDate: "2024-07-02"
        }
    ],
    2: [ // Kermit - prior finalized ITPs
        {
            id: "itp-2-004",
            name: "Q4 2024 Treatment Plan",
            startDate: "2024-10-01",
            endDate: "2024-12-31",
            status: "Finalized",
            finalizedDate: "2025-01-08"
        },
        {
            id: "itp-2-003",
            name: "Q3 2024 Treatment Plan",
            startDate: "2024-07-01",
            endDate: "2024-09-30",
            status: "Finalized",
            finalizedDate: "2024-10-05"
        },
        {
            id: "itp-2-002",
            name: "Q2 2024 Treatment Plan",
            startDate: "2024-04-01",
            endDate: "2024-06-30",
            status: "Finalized",
            finalizedDate: "2024-07-03"
        },
        {
            id: "itp-2-001",
            name: "Q1 2024 Treatment Plan",
            startDate: "2024-01-01",
            endDate: "2024-03-31",
            status: "Finalized",
            finalizedDate: "2024-04-02"
        }
    ],
    3: [ // Red Fraggle - prior finalized ITPs
        {
            id: "itp-3-002",
            name: "Q4 2024 Treatment Plan",
            startDate: "2024-10-01",
            endDate: "2024-12-31",
            status: "Finalized",
            finalizedDate: "2025-01-10"
        },
        {
            id: "itp-3-001",
            name: "Q3 2024 Treatment Plan",
            startDate: "2024-07-01",
            endDate: "2024-09-30",
            status: "Finalized",
            finalizedDate: "2024-10-08"
        }
    ],
    4: [ // Miss Piggy - prior finalized ITPs
        {
            id: "itp-4-005",
            name: "Q4 2024 Treatment Plan",
            startDate: "2024-10-01",
            endDate: "2024-12-31",
            status: "Finalized",
            finalizedDate: "2025-01-06"
        },
        {
            id: "itp-4-004",
            name: "Q3 2024 Treatment Plan",
            startDate: "2024-07-01",
            endDate: "2024-09-30",
            status: "Finalized",
            finalizedDate: "2024-10-04"
        },
        {
            id: "itp-4-003",
            name: "Q2 2024 Treatment Plan",
            startDate: "2024-04-01",
            endDate: "2024-06-30",
            status: "Finalized",
            finalizedDate: "2024-07-01"
        },
        {
            id: "itp-4-002",
            name: "Q1 2024 Treatment Plan",
            startDate: "2024-01-01",
            endDate: "2024-03-31",
            status: "Finalized",
            finalizedDate: "2024-04-01"
        },
        {
            id: "itp-4-001",
            name: "Q4 2023 Treatment Plan",
            startDate: "2023-10-01",
            endDate: "2023-12-31",
            status: "Finalized",
            finalizedDate: "2024-01-03"
        }
    ]
};

// Mock Triggers data - sourced from youth's Triggers and Coping Skills records
const MOCK_TRIGGERS_DATA = {
    1: [ // Fozzie Bear - has multiple triggers with associated coping skills
        {
            id: "trigger-001",
            trigger: "Peer conflict or confrontation",
            description: "Becomes agitated when peers challenge or criticize him, particularly during group activities",
            relatedCopingSkills: "Deep breathing, Request staff support",
            reportedDate: "2024-09-20",
            selectedBy: "Sarah Johnson"
        },
        {
            id: "trigger-002",
            trigger: "Unexpected schedule changes",
            description: "Experiences heightened anxiety when daily routines are modified without advance notice",
            relatedCopingSkills: "Use grounding techniques, Journal feelings",
            reportedDate: "2024-10-05",
            selectedBy: "Dr. Emily Roberts"
        },
        {
            id: "trigger-003",
            trigger: "Reminders of past trauma",
            description: "Certain sounds, smells, or visual cues trigger traumatic memories from previous living situations",
            relatedCopingSkills: "Safe space retreat, Talk to therapist",
            reportedDate: "2024-09-15",
            selectedBy: "Dr. Emily Roberts"
        }
    ],
    2: [ // Kermit - fewer triggers, good self-awareness
        {
            id: "trigger-004",
            trigger: "Academic pressure",
            description: "Feels overwhelmed when facing multiple assignments or tests in short timeframes",
            relatedCopingSkills: "Break tasks into steps, Ask for help",
            reportedDate: "2024-09-10",
            selectedBy: "Sarah Johnson"
        },
        {
            id: "trigger-005",
            trigger: "Family contact uncertainty",
            description: "Experiences anxiety before scheduled family visits, particularly when contact has been inconsistent",
            relatedCopingSkills: "Talk to advocate, Write in journal",
            reportedDate: "2024-11-02",
            selectedBy: "Sarah Johnson"
        }
    ],
    3: [ // Red Fraggle - multiple triggers, working on awareness
        {
            id: "trigger-006",
            trigger: "Authority figures giving directions",
            description: "Reacts negatively when staff provide instructions or corrections, perceives as controlling",
            relatedCopingSkills: "Count to ten, Take a walk",
            reportedDate: "2024-12-05",
            selectedBy: "Dr. Patricia Williams"
        },
        {
            id: "trigger-007",
            trigger: "Medical procedures or appointments",
            description: "Displays avoidance behaviors and heightened stress related to medical care, especially injections",
            relatedCopingSkills: "Deep breathing, Hold stress ball",
            reportedDate: "2024-11-20",
            selectedBy: "Nurse Patricia Miller"
        },
        {
            id: "trigger-008",
            trigger: "Being alone or isolated",
            description: "Becomes distressed when separated from peers or during quiet time in room",
            relatedCopingSkills: "Listen to music, Request check-in",
            reportedDate: "2025-01-12",
            selectedBy: "Sarah Johnson"
        },
        {
            id: "trigger-009",
            trigger: "Loud noises or yelling",
            description: "Becomes hypervigilant and defensive in response to raised voices or sudden loud sounds",
            relatedCopingSkills: "Use headphones, Go to quiet space",
            reportedDate: "2024-12-15",
            selectedBy: "Dr. Patricia Williams"
        }
    ],
    4: [ // Miss Piggy - several triggers identified, improving coping
        {
            id: "trigger-010",
            trigger: "Perceived rejection by peers",
            description: "Interprets social cues as rejection, leading to emotional outbursts or withdrawal",
            relatedCopingSkills: "Reality check with staff, Practice self-affirmations",
            reportedDate: "2024-10-15",
            selectedBy: "Dr. Emily Roberts"
        },
        {
            id: "trigger-011",
            trigger: "Transitions between activities",
            description: "Struggles with shifting focus from preferred to non-preferred activities",
            relatedCopingSkills: "Use timer, Positive self-talk",
            reportedDate: "2024-11-08",
            selectedBy: "Sarah Johnson"
        },
        {
            id: "trigger-012",
            trigger: "Homework or academic challenges",
            description: "Becomes frustrated and may shut down when encountering difficult schoolwork",
            relatedCopingSkills: "Ask for help, Take short breaks",
            reportedDate: "2024-09-25",
            selectedBy: "Sarah Johnson"
        }
    ]
};

// Mock Coping Skills data - sourced from youth's Triggers and Coping Skills records
const MOCK_COPING_SKILLS_DATA = {
    1: [ // Fozzie Bear - developing multiple coping strategies
        {
            id: "coping-001",
            copingSkill: "Deep breathing exercises",
            description: "4-7-8 breathing technique: inhale for 4, hold for 7, exhale for 8",
            effectiveWhen: "Feeling angry or anxious, before confrontations escalate",
            reportedDate: "2024-09-20",
            selectedBy: "Dr. Emily Roberts"
        },
        {
            id: "coping-002",
            copingSkill: "Request staff support",
            description: "Proactively seeking out trusted staff when overwhelmed rather than acting out",
            effectiveWhen: "When triggers are identified and emotional escalation begins",
            reportedDate: "2024-10-01",
            selectedBy: "Sarah Johnson"
        },
        {
            id: "coping-003",
            copingSkill: "Use grounding techniques",
            description: "5-4-3-2-1 sensory grounding method to stay present during flashbacks",
            effectiveWhen: "When experiencing trauma reminders or dissociative symptoms",
            reportedDate: "2024-09-15",
            selectedBy: "Dr. Emily Roberts"
        },
        {
            id: "coping-004",
            copingSkill: "Journal feelings",
            description: "Writing thoughts and emotions in personal journal before bedtime",
            effectiveWhen: "Processing daily events, managing anxiety about schedule changes",
            reportedDate: "2024-10-10",
            selectedBy: "Sarah Johnson"
        }
    ],
    2: [ // Kermit - well-developed coping strategies
        {
            id: "coping-005",
            copingSkill: "Break tasks into steps",
            description: "Using a planner to divide large assignments into manageable daily tasks",
            effectiveWhen: "Facing academic pressure or multiple deadlines",
            reportedDate: "2024-09-10",
            selectedBy: "Sarah Johnson"
        },
        {
            id: "coping-006",
            copingSkill: "Ask for help",
            description: "Reaching out to teachers, tutors, or peers when stuck on schoolwork",
            effectiveWhen: "When experiencing academic challenges or confusion",
            reportedDate: "2024-09-15",
            selectedBy: "Sarah Johnson"
        },
        {
            id: "coping-007",
            copingSkill: "Talk to advocate",
            description: "Scheduling conversations with advocate to process family-related anxiety",
            effectiveWhen: "Before or after family visits, when feeling uncertain about relationships",
            reportedDate: "2024-11-02",
            selectedBy: "Sarah Johnson"
        },
        {
            id: "coping-008",
            copingSkill: "Write in journal",
            description: "Reflective writing about family interactions and emotional responses",
            effectiveWhen: "Processing complex emotions about family contact",
            reportedDate: "2024-11-05",
            selectedBy: "Sarah Johnson"
        },
        {
            id: "coping-009",
            copingSkill: "Progressive muscle relaxation",
            description: "Systematically tensing and relaxing muscle groups to reduce physical tension",
            effectiveWhen: "Before bed, when anxious about upcoming events",
            reportedDate: "2024-10-20",
            selectedBy: "Dr. Emily Roberts"
        }
    ],
    3: [ // Red Fraggle - building coping skills toolkit
        {
            id: "coping-010",
            copingSkill: "Count to ten",
            description: "Pausing and counting slowly before responding to authority figures",
            effectiveWhen: "When receiving directions or corrections from staff",
            reportedDate: "2024-12-05",
            selectedBy: "Dr. Patricia Williams"
        },
        {
            id: "coping-011",
            copingSkill: "Take a walk",
            description: "Requesting permission to walk the hallway or go outside to cool down",
            effectiveWhen: "When feeling angry or defiant, before behaviors escalate",
            reportedDate: "2024-12-08",
            selectedBy: "Sarah Johnson"
        },
        {
            id: "coping-012",
            copingSkill: "Hold stress ball",
            description: "Squeezing stress ball during medical appointments to manage anxiety",
            effectiveWhen: "During medical procedures, injections, or health-related discussions",
            reportedDate: "2024-11-20",
            selectedBy: "Nurse Patricia Miller"
        },
        {
            id: "coping-013",
            copingSkill: "Listen to music",
            description: "Using headphones and calming playlist during quiet time",
            effectiveWhen: "When alone in room, to reduce feelings of isolation",
            reportedDate: "2025-01-12",
            selectedBy: "Sarah Johnson"
        },
        {
            id: "coping-014",
            copingSkill: "Go to quiet space",
            description: "Retreating to designated calm area when overstimulated",
            effectiveWhen: "In response to loud noises, yelling, or chaotic environments",
            reportedDate: "2024-12-15",
            selectedBy: "Dr. Patricia Williams"
        }
    ],
    4: [ // Miss Piggy - actively practicing coping strategies
        {
            id: "coping-015",
            copingSkill: "Reality check with staff",
            description: "Asking trusted staff to help evaluate social situations objectively",
            effectiveWhen: "When perceiving rejection or misinterpreting peer interactions",
            reportedDate: "2024-10-15",
            selectedBy: "Dr. Emily Roberts"
        },
        {
            id: "coping-016",
            copingSkill: "Practice self-affirmations",
            description: "Repeating positive statements about self-worth and belonging",
            effectiveWhen: "When feeling rejected or socially anxious",
            reportedDate: "2024-10-18",
            selectedBy: "Dr. Emily Roberts"
        },
        {
            id: "coping-017",
            copingSkill: "Use timer",
            description: "Setting visual timer to prepare for activity transitions",
            effectiveWhen: "When moving from preferred to non-preferred activities",
            reportedDate: "2024-11-08",
            selectedBy: "Sarah Johnson"
        },
        {
            id: "coping-018",
            copingSkill: "Positive self-talk",
            description: "Using encouraging internal dialogue during challenging moments",
            effectiveWhen: "During transitions, academic frustration, or social difficulties",
            reportedDate: "2024-11-10",
            selectedBy: "Dr. Emily Roberts"
        },
        {
            id: "coping-019",
            copingSkill: "Take short breaks",
            description: "Requesting 5-minute breaks during homework to prevent overwhelm",
            effectiveWhen: "When facing difficult academic tasks or frustration",
            reportedDate: "2024-09-25",
            selectedBy: "Sarah Johnson"
        }
    ]
};

// Mock PTP (Positive Transition Planning) Statements data - sourced from youth's PTP records
const MOCK_PTP_STATEMENTS_DATA = {
    1: [ // Fozzie Bear - has active PTP statements
        {
            id: "ptp-001",
            statement: "I will practice mindfulness techniques daily to manage anxiety and maintain emotional regulation",
            startDate: "2024-09-15",
            endDate: null, // Active statement
            outcomeDomain: "Behavioral Health",
            status: "Active"
        },
        {
            id: "ptp-002",
            statement: "I will complete at least 30 minutes of homework each evening to improve my academic performance",
            startDate: "2024-10-01",
            endDate: null,
            outcomeDomain: "Education",
            status: "Active"
        },
        {
            id: "ptp-003",
            statement: "I will participate in weekly group activities to develop positive peer relationships",
            startDate: "2024-08-20",
            endDate: "2025-01-15",
            outcomeDomain: "Social Well-Being",
            status: "Completed"
        }
    ],
    2: [ // Gonzo - has mix of active and completed
        {
            id: "ptp-004",
            statement: "I will explore creative outlets (art, music, writing) as healthy coping mechanisms",
            startDate: "2024-09-01",
            endDate: null,
            outcomeDomain: "Behavioral Health",
            status: "Active"
        },
        {
            id: "ptp-005",
            statement: "I will maintain consistent communication with my mentor twice weekly",
            startDate: "2024-11-01",
            endDate: null,
            outcomeDomain: "Connections",
            status: "Active"
        }
    ],
    3: [ // Red Fraggle - has one active statement
        {
            id: "ptp-006",
            statement: "I will practice conflict resolution skills in daily interactions with peers and staff",
            startDate: "2024-10-15",
            endDate: null,
            outcomeDomain: "Social Well-Being",
            status: "Active"
        }
    ],
    4: [] // Miss Piggy - no PTP statements (demonstrates empty state)
};

// Mock Goals data - sourced from youth's Goals records
const MOCK_GOALS_DATA = {
    1: [ // Fozzie Bear - mix of achieved, in progress, and discontinued goals
        {
            id: "goal-001",
            goal: "Attend all scheduled therapy sessions and actively participate in treatment activities for 4 consecutive weeks",
            startDate: "2024-09-01",
            targetEndDate: "2024-12-31",
            endDate: "2024-11-15",
            outcomeDomain: "Mental Health",
            status: "Achieved"
        },
        {
            id: "goal-002",
            goal: "Reduce physical aggression incidents to zero for 30 consecutive days",
            startDate: "2024-10-01",
            targetEndDate: "2025-03-31",
            endDate: null,
            outcomeDomain: "Behavioral Health",
            status: "In Progress"
        },
        {
            id: "goal-003",
            goal: "Complete daily hygiene routine independently 5 days per week for 6 consecutive weeks",
            startDate: "2024-09-15",
            targetEndDate: "2025-02-28",
            endDate: null,
            outcomeDomain: "Independent Living Skills",
            status: "In Progress"
        },
        {
            id: "goal-004",
            goal: "Identify and verbalize 3 personal triggers before situations escalate",
            startDate: "2024-08-01",
            targetEndDate: "2024-12-31",
            endDate: "2024-12-20",
            outcomeDomain: "Social & Emotional Development",
            status: "Achieved"
        }
    ],
    2: [ // Kermit - strong progress, mostly achieved goals
        {
            id: "goal-005",
            goal: "Maintain a GPA of 3.0 or higher for the entire semester",
            startDate: "2024-08-15",
            targetEndDate: "2024-12-20",
            endDate: "2024-12-18",
            outcomeDomain: "Education & Vocation",
            status: "Achieved"
        },
        {
            id: "goal-006",
            goal: "Participate in at least 2 extracurricular activities per week",
            startDate: "2024-09-01",
            targetEndDate: "2025-06-30",
            endDate: null,
            outcomeDomain: "Recreation & Leisure",
            status: "In Progress"
        },
        {
            id: "goal-007",
            goal: "Practice conflict resolution skills with peers, reducing arguments to less than 1 per week for 8 weeks",
            startDate: "2024-10-01",
            targetEndDate: "2025-01-31",
            endDate: "2025-01-10",
            outcomeDomain: "Social & Emotional Development",
            status: "Achieved"
        },
        {
            id: "goal-008",
            goal: "Complete all homework assignments on time for 6 consecutive weeks",
            startDate: "2024-09-15",
            targetEndDate: "2025-03-15",
            endDate: null,
            outcomeDomain: "Education & Vocation",
            status: "In Progress"
        },
        {
            id: "goal-009",
            goal: "Build positive relationship with biological mother through consistent weekly contact",
            startDate: "2024-11-01",
            targetEndDate: "2025-05-31",
            endDate: null,
            outcomeDomain: "Family Engagement",
            status: "In Progress"
        }
    ],
    3: [ // Red Fraggle - several discontinued goals, working on new strategies
        {
            id: "goal-010",
            goal: "Follow staff directives without verbal refusal or argument for 14 consecutive days",
            startDate: "2024-11-01",
            targetEndDate: "2025-02-28",
            endDate: "2024-12-15",
            outcomeDomain: "Behavioral Health",
            status: "Discontinued"
        },
        {
            id: "goal-011",
            goal: "Attend all scheduled medical appointments without behavioral incidents",
            startDate: "2024-10-15",
            targetEndDate: "2025-04-15",
            endDate: null,
            outcomeDomain: "Physical Health",
            status: "In Progress"
        },
        {
            id: "goal-012",
            goal: "Use at least 2 coping skills when feeling angry or overwhelmed, 4 times per week for 8 weeks",
            startDate: "2024-12-01",
            targetEndDate: "2025-03-31",
            endDate: null,
            outcomeDomain: "Mental Health",
            status: "In Progress"
        },
        {
            id: "goal-013",
            goal: "Maintain appropriate peer relationships without physical altercations for 30 days",
            startDate: "2024-09-20",
            targetEndDate: "2024-12-31",
            endDate: "2024-11-05",
            outcomeDomain: "Social & Emotional Development",
            status: "Discontinued"
        },
        {
            id: "goal-014",
            goal: "Complete household chores as assigned without staff reminders 5 days per week",
            startDate: "2025-01-05",
            targetEndDate: "2025-04-30",
            endDate: null,
            outcomeDomain: "Independent Living Skills",
            status: "In Progress"
        }
    ],
    4: [ // Miss Piggy - balanced mix with recent achievement
        {
            id: "goal-015",
            goal: "Reduce verbal outbursts to less than 2 per week for 6 consecutive weeks",
            startDate: "2024-10-01",
            targetEndDate: "2025-01-31",
            endDate: "2025-01-28",
            outcomeDomain: "Behavioral Health",
            status: "Achieved"
        },
        {
            id: "goal-016",
            goal: "Participate in individual therapy weekly and complete all assigned therapeutic activities",
            startDate: "2024-09-15",
            targetEndDate: "2025-06-30",
            endDate: null,
            outcomeDomain: "Mental Health",
            status: "In Progress"
        },
        {
            id: "goal-017",
            goal: "Develop and practice 5 positive self-affirmations daily for 4 weeks",
            startDate: "2024-11-01",
            targetEndDate: "2025-02-28",
            endDate: null,
            outcomeDomain: "Social & Emotional Development",
            status: "In Progress"
        },
        {
            id: "goal-018",
            goal: "Complete transition preparation activities without resistance or shutdown behaviors",
            startDate: "2024-10-15",
            targetEndDate: "2025-03-31",
            endDate: null,
            outcomeDomain: "Independent Living Skills",
            status: "In Progress"
        }
    ]
};

// Mock Care Planning Meeting data - sourced from youth's Connection records
const MOCK_CARE_PLANNING_MEETING_DATA = {
    1: [ // Fozzie Bear - one meeting held this quarter
        {
            id: "cpm-001",
            date: "2025-03-24",
            participants: "Fozzie Bear, Sarah Johnson (Advocate), Dr. Emily Roberts (Therapist), Ms. Bear (Mother)",
            summary: "The team reviewed Fozzie's progress across all treatment domains. Fozzie expressed pride in his behavioral improvements and shared goals for the coming quarter. His mother noted positive changes in his communication skills during home visits. The team agreed to continue current goals with increased focus on independent living skills.",
            transitionPlanning: "Fozzie and the team discussed potential placement options for after discharge, including extended family support and possible transitional living. He expressed interest in pursuing vocational training."
        }
    ],
    2: [ // Kermit the Frog - meeting held and documented
        {
            id: "cpm-002",
            date: "2025-02-17",
            participants: "Kermit the Frog, Michael Chen (Advocate), Dr. Patricia Williams (Therapist), Jim H. (Uncle)",
            summary: "Kermit demonstrated strong insight into his treatment progress during the meeting. His uncle participated actively and reported improvements in Kermit's mood and communication during family visits. The team celebrated the achievement of two goals and discussed new goals for the upcoming quarter.",
            transitionPlanning: "The team explored independent living resources and community supports. Kermit expressed interest in attending community college after discharge."
        }
    ],
    3: [], // Red Fraggle - no meeting held yet
    4: [ // Miss Piggy - meeting held
        {
            id: "cpm-003",
            date: "2025-02-03",
            participants: "Miss Piggy, Amanda Thompson (Advocate), Dr. Robert Garcia (Therapist)",
            summary: "Miss Piggy reflected on her significant progress in reducing verbal outbursts, sharing pride in her achieved goal. The team discussed her continued work on self-affirmations and emotional regulation. Miss Piggy identified specific coping strategies that have been most helpful this quarter.",
            transitionPlanning: null
        }
    ]
};

// Mock Transition Planning data - sourced from youth's profile and Connection records
const MOCK_TRANSITION_PLANNING_DATA = {
    1: { // Fozzie Bear
        programEnrollment: [
            {
                id: "pe-001",
                program: "McGivney House",
                moveInDate: "2024-06-15",
                moveOutDate: null
            },
            {
                id: "pe-002",
                program: "Mahoney House (Prior)",
                moveInDate: "2023-09-01",
                moveOutDate: "2024-06-14"
            }
        ],
        communityLaunchPlan: [
            {
                id: "clp-001",
                domain: "Independent Living Skills",
                content: "Complete life skills curriculum including budgeting, cooking, and household management",
                timeframeMonths: 6
            },
            {
                id: "clp-002",
                domain: "Employment Readiness",
                content: "Obtain part-time employment and maintain for 3 consecutive months",
                timeframeMonths: 4
            },
            {
                id: "clp-003",
                domain: "Education",
                content: "Complete GED preparation and testing",
                timeframeMonths: 5
            }
        ]
    },
    2: { // Kermit the Frog
        programEnrollment: [
            {
                id: "pe-003",
                program: "Mahoney House",
                moveInDate: "2024-09-01",
                moveOutDate: null
            }
        ],
        communityLaunchPlan: [
            {
                id: "clp-004",
                domain: "Education",
                content: "Graduate high school and enroll in community college",
                timeframeMonths: 8
            },
            {
                id: "clp-005",
                domain: "Independent Living Skills",
                content: "Participate in independent living skills training program",
                timeframeMonths: 6
            },
            {
                id: "clp-006",
                domain: "Social Connections",
                content: "Maintain positive peer relationships and family connections",
                timeframeMonths: 12
            }
        ]
    },
    3: { // Red Fraggle
        programEnrollment: [
            {
                id: "pe-004",
                program: "McGivney House",
                moveInDate: "2025-01-20",
                moveOutDate: null
            }
        ],
        communityLaunchPlan: []
    },
    4: { // Miss Piggy
        programEnrollment: [
            {
                id: "pe-005",
                program: "Mahoney House",
                moveInDate: "2024-08-01",
                moveOutDate: null
            }
        ],
        communityLaunchPlan: [
            {
                id: "clp-007",
                domain: "Mental Health",
                content: "Establish consistent outpatient mental health treatment plan",
                timeframeMonths: 3
            },
            {
                id: "clp-008",
                domain: "Family Reunification",
                content: "Complete family therapy and transition to home placement",
                timeframeMonths: 9
            }
        ]
    }
};

// Mock Strengths data - sourced from youth's profile
const MOCK_STRENGTHS_DATA = {
    1: [ // Fozzie Bear - has several strengths
        {
            id: "str-001",
            strength: "Sense of Humor",
            description: "Uses humor appropriately to connect with peers and staff, helping to diffuse tense situations",
            reportedDate: "2024-09-15",
            selectedBy: "Dr. Emily Roberts"
        },
        {
            id: "str-002",
            strength: "Artistic Talent",
            description: "Demonstrates exceptional creative abilities in visual arts and enjoys sharing work with others",
            reportedDate: "2024-10-20",
            selectedBy: "Sarah Johnson"
        },
        {
            id: "str-003",
            strength: "Resilience",
            description: "Shows ability to bounce back from setbacks and maintain a positive outlook despite challenges",
            reportedDate: "2024-11-05",
            selectedBy: "Dr. Emily Roberts"
        }
    ],
    2: [ // Kermit the Frog - has strengths
        {
            id: "str-004",
            strength: "Leadership Skills",
            description: "Natural leader who mentors younger residents and models positive behavior",
            reportedDate: "2024-09-10",
            selectedBy: "Dr. Emily Roberts"
        },
        {
            id: "str-005",
            strength: "Academic Achievement",
            description: "Consistently maintains high grades and demonstrates strong commitment to education",
            reportedDate: "2024-10-01",
            selectedBy: "Sarah Johnson"
        }
    ],
    3: [], // Red Fraggle - no strengths identified yet (empty state)
    4: [ // Miss Piggy - has strengths
        {
            id: "str-006",
            strength: "Self-Advocacy",
            description: "Effectively communicates needs and boundaries in a respectful manner",
            reportedDate: "2024-08-15",
            selectedBy: "Dr. Emily Roberts"
        },
        {
            id: "str-007",
            strength: "Performance Talent",
            description: "Confident performer with strong stage presence and vocal abilities",
            reportedDate: "2024-09-20",
            selectedBy: "Sarah Johnson"
        },
        {
            id: "str-008",
            strength: "Determination",
            description: "Sets high goals and works persistently to achieve them despite obstacles",
            reportedDate: "2024-10-12",
            selectedBy: "Dr. Emily Roberts"
        }
    ]
};

// Mock Testing & Assessments data - sourced from youth's profile testing records
const MOCK_TESTING_ASSESSMENTS_DATA = {
    1: [ // Fozzie Bear - has multiple test records
        {
            id: "test-001",
            date: "2025-01-10",
            test: "MACI (Millon Adolescent Clinical Inventory)",
            summary: "Assessment indicates moderate anxiety and introversive tendencies. Results suggest youth benefits from structured support and positive reinforcement. Clinical scales align with observed behavior in program."
        },
        {
            id: "test-002",
            date: "2025-02-15",
            test: "BASC-3 (Behavior Assessment System for Children)",
            summary: "Teacher and parent ratings show improvement in emotional regulation since admission. Adaptive skills scores are in the average range. Some discrepancy noted between self-report and staff observations regarding social functioning."
        },
        {
            id: "test-003",
            date: "2025-03-20",
            test: "Conners 3 (ADHD Assessment)",
            summary: "Results indicate significant attention difficulties and executive function challenges. Scores support continued medication management and academic accommodations. Youth demonstrates improved focus in structured settings."
        }
    ],
    2: [ // Gonzo - has one test record
        {
            id: "test-004",
            date: "2025-02-28",
            test: "MCMI-IV (Millon Clinical Multiaxial Inventory)",
            summary: "Assessment reveals creative problem-solving strengths alongside some risk-taking tendencies. Youth shows high motivation for treatment engagement and demonstrates insight into behavioral patterns."
        }
    ],
    3: [ // Red Fraggle - has test records
        {
            id: "test-005",
            date: "2025-01-05",
            test: "WISC-V (Wechsler Intelligence Scale for Children)",
            summary: "Cognitive assessment shows average to above-average intellectual functioning across all indices. Strengths noted in verbal comprehension. Results support current educational placement and goals."
        },
        {
            id: "test-006",
            date: "2025-03-12",
            test: "TraumaScreen",
            summary: "Screening indicates significant trauma exposure and PTSD symptoms. Results support continued trauma-focused therapy and safety planning interventions."
        }
    ],
    4: [] // Miss Piggy - no testing records during this period (demonstrates empty state)
};

// Mock Milieu Engagement - Supplemental Plans data
const MOCK_MILIEU_SUPPLEMENTAL_PLANS_DATA = {
    1: [
        {
            id: "msp-1",
            startDate: "2024-09-15",
            type: "Behavioral Support Plan",
            planDescription: "Individualized behavior intervention plan focusing on de-escalation strategies and positive reinforcement",
            endDate: null
        },
        {
            id: "msp-2",
            startDate: "2024-10-01",
            type: "Academic Support Plan",
            planDescription: "Tutoring and study skills development to support educational goals",
            endDate: null
        }
    ],
    2: [],
    3: [
        {
            id: "msp-3",
            startDate: "2024-09-01",
            type: "Social Skills Plan",
            planDescription: "Structured social skills training to improve peer interactions",
            endDate: "2024-11-30"
        }
    ]
};

// Mock Milieu Engagement - Milieu Meetings/Connections data
const MOCK_MILIEU_MEETINGS_DATA = {
    1: [
        {
            id: "mm-1",
            connectionType: "Milieu Meeting",
            date: "2024-10-05",
            attended: "Yes",
            themesAddressed: "Conflict resolution, Peer relationships",
            participantNote: "Active participation, shared personal experiences",
            summary: "Youth engaged positively in group discussion about managing peer conflicts. Demonstrated understanding of de-escalation techniques."
        },
        {
            id: "mm-2",
            connectionType: "Milieu Meeting",
            date: "2024-10-12",
            attended: "Yes",
            themesAddressed: "Emotional regulation, Coping skills",
            participantNote: "Good engagement, asked clarifying questions",
            summary: "Youth participated in discussion about identifying emotional triggers and applying coping strategies."
        },
        {
            id: "mm-3",
            connectionType: "House Meeting",
            date: "2024-10-19",
            attended: "No",
            themesAddressed: "Community expectations, House rules",
            participantNote: "Absent - conflict with medical appointment",
            summary: null
        },
        {
            id: "mm-4",
            connectionType: "Community Circle",
            date: "2024-10-26",
            attended: "Yes",
            themesAddressed: "Gratitude, Peer support",
            participantNote: "Shared appreciation for staff and peers",
            summary: "Youth actively contributed to gratitude circle, demonstrating growth in expressing positive emotions."
        },
        {
            id: "mm-5",
            connectionType: "Milieu Meeting",
            date: "2024-11-02",
            attended: "Yes",
            themesAddressed: "Goal setting, Personal growth",
            participantNote: "Reflective participation",
            summary: "Youth discussed progress toward treatment goals and identified areas for continued growth."
        }
    ],
    2: [],
    3: [
        {
            id: "mm-6",
            connectionType: "Milieu Meeting",
            date: "2024-10-08",
            attended: "Yes",
            themesAddressed: "Trust building, Communication",
            participantNote: "Engaged positively with peers",
            summary: "Youth demonstrated improved communication skills during group activities."
        }
    ]
};

// Mock Milieu Engagement - Community Service data
const MOCK_COMMUNITY_SERVICE_DATA = {
    1: [
        {
            id: "cs-1",
            startDate: "2024-10-10",
            endDate: "2024-10-10",
            durationHours: 3,
            summary: "Volunteer work at local food pantry - sorting and organizing donations",
            location: "Greater Chicago Food Depository",
            attended: "Yes"
        },
        {
            id: "cs-2",
            startDate: "2024-10-24",
            endDate: "2024-10-24",
            durationHours: 2.5,
            summary: "Park cleanup and beautification project",
            location: "Humboldt Park",
            attended: "Yes"
        },
        {
            id: "cs-3",
            startDate: "2024-11-07",
            endDate: "2024-11-07",
            durationHours: 4,
            summary: "Assisted with community meal preparation and serving",
            location: "Mercy Home Community Kitchen",
            attended: "Yes"
        }
    ],
    2: [],
    3: [
        {
            id: "cs-4",
            startDate: "2024-10-15",
            endDate: "2024-10-15",
            durationHours: 2,
            summary: "Neighborhood litter cleanup initiative",
            location: "West Loop Community",
            attended: "Yes"
        }
    ]
};

// Mock Activity Participation data
const MOCK_ACTIVITY_PARTICIPATION_DATA = {
    1: [
        {
            id: "act-1",
            activity: "Basketball League",
            date: "2024-10-05",
            registered: "Yes",
            attended: "Yes",
            summary: "Youth participated actively in the weekly basketball game, demonstrating good teamwork and sportsmanship."
        },
        {
            id: "act-2",
            activity: "Art Workshop",
            date: "2024-10-12",
            registered: "Yes",
            attended: "Yes",
            summary: "Engaged in creative expression through painting. Completed a personal canvas project."
        },
        {
            id: "act-3",
            activity: "Music Therapy Group",
            date: "2024-10-19",
            registered: "Yes",
            attended: "No",
            summary: null
        },
        {
            id: "act-4",
            activity: "Cooking Class",
            date: "2024-10-26",
            registered: "Yes",
            attended: "Yes",
            summary: "Learned to prepare a healthy meal. Showed enthusiasm and followed instructions well."
        },
        {
            id: "act-5",
            activity: "Movie Night",
            date: "2024-11-02",
            registered: "Yes",
            attended: "Yes",
            summary: "Participated in group movie viewing and discussion. Engaged positively with peers during the activity."
        },
        {
            id: "act-6",
            activity: "Yoga and Mindfulness",
            date: "2024-11-09",
            registered: "No",
            attended: "No",
            summary: null
        }
    ],
    2: [],
    3: [
        {
            id: "act-7",
            activity: "Game Night",
            date: "2024-10-15",
            registered: "Yes",
            attended: "Yes",
            summary: "Participated in board games with peers. Demonstrated patience and good sportsmanship."
        }
    ]
};

// Mock Advocate Meetings data
const MOCK_ADVOCATE_MEETINGS_DATA = {
    1: [
        {
            id: "adv-1",
            date: "2024-10-07",
            attended: "Yes",
            themesAddressed: "Academic progress, peer relationships",
            otherTopicsCovered: "Upcoming family visit, weekend activities",
            treatmentTargetsAddressed: "Emotional regulation, social skills development"
        },
        {
            id: "adv-2",
            date: "2024-10-14",
            attended: "Yes",
            themesAddressed: "Emotional regulation, therapy engagement",
            otherTopicsCovered: "Personal goals, community service opportunities",
            treatmentTargetsAddressed: "Anxiety management, goal setting"
        },
        {
            id: "adv-3",
            date: "2024-10-21",
            attended: "No",
            themesAddressed: null,
            otherTopicsCovered: null,
            treatmentTargetsAddressed: null
        },
        {
            id: "adv-4",
            date: "2024-10-28",
            attended: "Yes",
            themesAddressed: "Coping skills, peer conflicts",
            otherTopicsCovered: "School performance, extracurricular interests",
            treatmentTargetsAddressed: "Conflict resolution, academic engagement"
        },
        {
            id: "adv-5",
            date: "2024-11-04",
            attended: "Yes",
            themesAddressed: "Family relationships, transition planning",
            otherTopicsCovered: "Future goals, strengths and accomplishments",
            treatmentTargetsAddressed: "Family communication, positive transition planning"
        },
        {
            id: "adv-6",
            date: "2024-11-11",
            attended: "Yes",
            themesAddressed: "Overall treatment progress, goal achievements",
            otherTopicsCovered: "Self-care, personal interests",
            treatmentTargetsAddressed: "Self-advocacy, independence skills"
        }
    ],
    2: [],
    3: [
        {
            id: "adv-7",
            date: "2024-10-10",
            attended: "Yes",
            themesAddressed: "Behavioral progress, milieu engagement",
            otherTopicsCovered: "Recreation activities",
            treatmentTargetsAddressed: "Social engagement, positive peer interactions"
        },
        {
            id: "adv-8",
            date: "2024-10-17",
            attended: "Yes",
            themesAddressed: "Academic challenges, support needs",
            otherTopicsCovered: "Tutoring resources",
            treatmentTargetsAddressed: "Academic success, executive functioning"
        }
    ]
};

// Mock Parent/Family Contacts data
const MOCK_PARENT_FAMILY_CONTACTS_DATA = {
    1: [
        {
            id: "pfc-1",
            date: "2024-10-08",
            attendees: "Mother, Youth Advocate",
            themesAddressed: "Academic progress, peer relationships, family communication",
            treatmentTargetsAddressed: "Emotional regulation, family engagement"
        },
        {
            id: "pfc-2",
            date: "2024-10-15",
            attendees: "Mother, Father, Therapist",
            themesAddressed: "Treatment progress, home visit planning",
            treatmentTargetsAddressed: "Positive transition planning, family reunification"
        },
        {
            id: "pfc-3",
            date: "2024-10-29",
            attendees: "Mother, Youth Advocate",
            themesAddressed: "Behavioral concerns, coping skills application at home",
            treatmentTargetsAddressed: "Anger management, family boundaries"
        },
        {
            id: "pfc-4",
            date: "2024-11-05",
            attendees: "Mother, Case Manager",
            themesAddressed: "Discharge planning, community resources",
            treatmentTargetsAddressed: "Independent living skills, family support systems"
        }
    ],
    2: [],
    3: [
        {
            id: "pfc-5",
            date: "2024-10-12",
            attendees: "Guardian, Therapist",
            themesAddressed: "Mental health progress, medication compliance",
            treatmentTargetsAddressed: "Anxiety management, self-advocacy"
        }
    ]
};

// Mock Family Visits data
const MOCK_FAMILY_VISITS_DATA = {
    1: [
        {
            id: "fv-1",
            startDate: "2024-10-12",
            attendees: "Mother, Father, Sibling (age 10)",
            summary: "Family spent quality time together during on-campus visit. Youth demonstrated improved communication skills and emotional regulation during interactions."
        },
        {
            id: "fv-2",
            startDate: "2024-10-26",
            attendees: "Mother, Grandmother",
            summary: "Positive visit focused on discussing upcoming holidays and family traditions. Youth expressed appreciation for family support."
        },
        {
            id: "fv-3",
            startDate: "2024-11-09",
            attendees: "Mother, Father, Two siblings",
            summary: "Extended family visit included recreational activities. Youth showed progress in conflict resolution when minor disagreement arose with sibling."
        }
    ],
    2: [],
    3: [
        {
            id: "fv-4",
            startDate: "2024-10-19",
            attendees: "Guardian, Mentor",
            summary: "Structured visit with supportive adults. Youth engaged positively and discussed educational goals."
        }
    ]
};

// Mock Passes data
const MOCK_PASSES_DATA = {
    1: [
        {
            id: "pass-1",
            startDate: "2024-10-19",
            endDate: "2024-10-20",
            location: "Family Home",
            summary: "Successful weekend home visit. Youth followed all house rules and demonstrated improved family communication skills.",
            between: "Youth and Mother",
            cancelled: "No"
        },
        {
            id: "pass-2",
            startDate: "2024-11-02",
            endDate: "2024-11-03",
            location: "Family Home",
            summary: "Overnight pass completed successfully. Youth participated in family activities and used coping skills when feeling anxious.",
            between: "Youth and Mother, Father",
            cancelled: "No"
        },
        {
            id: "pass-3",
            startDate: "2024-11-16",
            endDate: "2024-11-17",
            location: "Family Home",
            summary: "Pass cancelled due to family emergency (grandmother hospitalized).",
            between: "Youth and Mother",
            cancelled: "Yes"
        }
    ],
    2: [],
    3: [
        {
            id: "pass-4",
            startDate: "2024-10-25",
            endDate: "2024-10-25",
            location: "Community Outing with Guardian",
            summary: "Day pass for lunch and shopping with guardian. Youth behaved appropriately and followed all expectations.",
            between: "Youth and Guardian",
            cancelled: "No"
        }
    ]
};

// Mock Mercy Home Family Activities data
const MOCK_FAMILY_ACTIVITIES_DATA = {
    1: [
        {
            id: "fa-1",
            date: "2024-10-20",
            eventType: "Family Day Picnic",
            attendees: "Mother, Father, Youth"
        },
        {
            id: "fa-2",
            date: "2024-11-10",
            eventType: "Family Workshop: Positive Communication",
            attendees: "Mother, Youth"
        }
    ],
    2: [],
    3: [
        {
            id: "fa-3",
            date: "2024-10-27",
            eventType: "Family Game Night",
            attendees: "Guardian, Youth"
        }
    ]
};

// Mock Spiritual Development Class Participation data
const MOCK_SPIRITUAL_DEV_CLASSES_DATA = {
    1: [ // Fozzie Bear - has spiritual development classes
        {
            id: "sdc-001",
            className: "Bible Study - Youth Group",
            numberPlanned: 12,
            numberAttended: 10
        },
        {
            id: "sdc-002",
            className: "Meditation & Mindfulness",
            numberPlanned: 8,
            numberAttended: 7
        }
    ],
    2: [ // Kermit - has one spiritual class
        {
            id: "sdc-003",
            className: "Interfaith Dialogue",
            numberPlanned: 4,
            numberAttended: 4
        }
    ],
    3: [], // Red Fraggle - no spiritual development (empty state)
    4: [ // Miss Piggy
        {
            id: "sdc-004",
            className: "Prayer & Reflection",
            numberPlanned: 10,
            numberAttended: 8
        }
    ]
};

// Mock Spiritual Development Connections data
const MOCK_SPIRITUAL_DEV_CONNECTIONS_DATA = {
    1: [ // Fozzie Bear - has spiritual connections
        {
            id: "sdcon-001",
            date: "2025-01-15",
            type: "Spiritual Counseling",
            attended: "Yes",
            participantNote: "Youth engaged in discussion about personal faith journey",
            summary: "Productive session discussing the youth's spiritual identity and connections to faith community."
        },
        {
            id: "sdcon-002",
            date: "2025-02-20",
            type: "Retreat Attendance",
            attended: "Yes",
            participantNote: "Participated fully in weekend retreat activities",
            summary: "Youth attended weekend spiritual retreat, demonstrated openness to new experiences and reflection."
        },
        {
            id: "sdcon-003",
            date: "2025-03-10",
            type: "Faith Service",
            attended: "No",
            participantNote: "Youth declined to attend due to scheduling conflict",
            summary: "—"
        }
    ],
    2: [ // Kermit
        {
            id: "sdcon-004",
            date: "2024-12-25",
            type: "Holiday Service",
            attended: "Yes",
            participantNote: "Attended Christmas service with peers",
            summary: "Youth participated in holiday celebration and demonstrated respect for diverse faith traditions."
        }
    ],
    3: [], // Red Fraggle - no connections (empty state)
    4: [
        {
            id: "sdcon-005",
            date: "2024-11-30",
            type: "Spiritual Check-In",
            attended: "Yes",
            participantNote: "Brief conversation about spiritual wellbeing",
            summary: "Youth shared thoughts about maintaining connection to personal faith practices."
        }
    ]
};

// Mock Trauma data - sourced from youth's profile
const MOCK_TRAUMA_DATA = {
    1: [ // Fozzie Bear - has trauma records
        {
            id: "trauma-001",
            type: "Physical Abuse",
            subject: "Father",
            description: "History of physical abuse by biological father during early childhood. Youth reports incidents of hitting and threats.",
            selectedBy: "Dr. Emily Roberts"
        },
        {
            id: "trauma-002",
            type: "Neglect",
            subject: "Primary Caregiver",
            description: "Chronic neglect including lack of supervision, inadequate nutrition, and inconsistent housing during ages 8-11.",
            selectedBy: "Dr. Emily Roberts"
        },
        {
            id: "trauma-003",
            type: "Witness to Violence",
            subject: "Domestic Violence",
            description: "Youth witnessed domestic violence between parents from ages 4-9, including verbal and physical altercations.",
            selectedBy: "Sarah Johnson"
        }
    ],
    2: [ // Kermit - has one trauma record
        {
            id: "trauma-004",
            type: "Emotional Abuse",
            subject: "Mother",
            description: "Pattern of emotional abuse including verbal degradation and isolation from peers during adolescence.",
            selectedBy: "Dr. Patricia Williams"
        }
    ],
    3: [], // Red Fraggle - no trauma records selected (empty state)
    4: [ // Miss Piggy - has trauma records
        {
            id: "trauma-005",
            type: "Sexual Abuse",
            subject: "Family Member",
            description: "Disclosed sexual abuse by extended family member. Matter under investigation. Details documented in secure file.",
            selectedBy: "Dr. Robert Garcia"
        },
        {
            id: "trauma-006",
            type: "Community Violence",
            subject: "Neighborhood",
            description: "Exposed to community violence including witnessing shooting and gang activity in home neighborhood.",
            selectedBy: "Dr. Robert Garcia"
        }
    ]
};

// Mock Individual Therapy Sessions data - sourced from Connection records
const MOCK_INDIVIDUAL_THERAPY_SESSIONS = {
    1: [ // Fozzie Bear - has individual therapy sessions
        {
            id: "indiv-therapy-001",
            date: "2024-01-05",
            type: "Individual Therapy",
            attendance: "Yes",
            description: "Weekly individual therapy session focusing on anxiety management and coping strategies.",
            themesAddressed: "Anxiety, Emotional Regulation, Peer Relationships",
            treatmentTargetsAddressed: "Goal 1: Reduce anxiety symptoms; Goal 2: Improve emotional regulation"
        },
        {
            id: "indiv-therapy-002",
            date: "2024-01-12",
            type: "Individual Therapy",
            attendance: "Yes",
            description: "Continued work on identifying triggers and implementing learned coping skills.",
            themesAddressed: "Triggers, Coping Skills, Self-Awareness",
            treatmentTargetsAddressed: "Goal 1: Identify personal triggers; Goal 3: Apply coping skills independently"
        },
        {
            id: "indiv-therapy-003",
            date: "2024-01-19",
            type: "Individual Therapy",
            attendance: "No",
            description: "Youth was in medical appointment during scheduled therapy time.",
            themesAddressed: "—",
            treatmentTargetsAddressed: "—"
        },
        {
            id: "indiv-therapy-004",
            date: "2024-01-26",
            type: "Individual Therapy",
            attendance: "Yes",
            description: "Processing recent family contact and exploring feelings about upcoming transition planning.",
            themesAddressed: "Family Relationships, Transition Planning, Future Goals",
            treatmentTargetsAddressed: "Goal 4: Develop positive family communication skills"
        }
    ],
    2: [ // Kermit - has individual therapy sessions
        {
            id: "indiv-therapy-005",
            date: "2024-01-08",
            type: "Individual Therapy",
            attendance: "Yes",
            description: "Weekly therapy session focusing on depression and mood management.",
            themesAddressed: "Depression, Mood Management, Daily Routines",
            treatmentTargetsAddressed: "Goal 1: Improve mood stability"
        }
    ],
    3: [], // Red Fraggle - no therapy sessions (empty state)
    4: [ // Miss Piggy - has individual therapy sessions
        {
            id: "indiv-therapy-006",
            date: "2024-01-04",
            type: "Individual Therapy",
            attendance: "Yes",
            description: "Trauma-focused therapy session addressing recent disclosures.",
            themesAddressed: "Trauma Processing, Safety Planning, Trust Building",
            treatmentTargetsAddressed: "Goal 1: Process trauma in safe environment"
        },
        {
            id: "indiv-therapy-007",
            date: "2024-01-11",
            type: "Individual Therapy",
            attendance: "Yes",
            description: "Continued trauma processing and skills development.",
            themesAddressed: "Trauma, Coping Skills, Emotional Safety",
            treatmentTargetsAddressed: "Goal 1: Build trauma coping skills"
        }
    ]
};

// Mock Family Therapy Sessions data - sourced from Connection records
const MOCK_FAMILY_THERAPY_SESSIONS = {
    1: [ // Fozzie Bear - has family therapy sessions
        {
            id: "fam-therapy-001",
            date: "2024-01-10",
            type: "Family Therapy",
            attendance: "Yes",
            description: "Family therapy session with youth and mother focusing on communication patterns.",
            themesAddressed: "Communication, Boundaries, Family Dynamics",
            treatmentTargetsAddressed: "Goal 5: Improve family communication and reduce conflict"
        },
        {
            id: "fam-therapy-002",
            date: "2024-01-24",
            type: "Family Therapy",
            attendance: "Yes",
            description: "Joint session addressing upcoming transition plans and family reunification goals.",
            themesAddressed: "Transition Planning, Reunification, Role Expectations",
            treatmentTargetsAddressed: "Goal 6: Prepare for successful family reunification"
        }
    ],
    2: [], // Kermit - no family therapy sessions
    3: [], // Red Fraggle - no family therapy sessions (empty state)
    4: [ // Miss Piggy - has family therapy sessions
        {
            id: "fam-therapy-003",
            date: "2024-01-15",
            type: "Family Therapy",
            attendance: "No",
            description: "Session cancelled due to guardian unavailability.",
            themesAddressed: "—",
            treatmentTargetsAddressed: "—"
        },
        {
            id: "fam-therapy-004",
            date: "2024-01-29",
            type: "Family Therapy",
            attendance: "Yes",
            description: "Family session focusing on rebuilding trust and safety within family relationships.",
            themesAddressed: "Trust, Safety, Family Healing",
            treatmentTargetsAddressed: "Goal 7: Rebuild trust with family members"
        }
    ]
};

// Mock Group Therapy Sessions data - sourced from Connection records
const MOCK_GROUP_THERAPY_SESSIONS = {
    1: [ // Fozzie Bear - has group therapy sessions
        {
            id: "group-therapy-001",
            date: "2024-01-03",
            type: "Group Therapy",
            attendance: "Yes",
            themesAddressed: "Anger Management, Emotional Regulation",
            participantNote: "Youth actively participated in anger management exercises and shared experiences with peers."
        },
        {
            id: "group-therapy-002",
            date: "2024-01-10",
            type: "Group Therapy",
            attendance: "Yes",
            themesAddressed: "Social Skills, Peer Relationships",
            participantNote: "Engaged in group activities focused on building healthy peer relationships and communication."
        },
        {
            id: "group-therapy-003",
            date: "2024-01-17",
            type: "Group Therapy",
            attendance: "No",
            themesAddressed: "—",
            participantNote: "Youth was sick and unable to attend group session."
        },
        {
            id: "group-therapy-004",
            date: "2024-01-24",
            type: "Group Therapy",
            attendance: "Yes",
            themesAddressed: "Conflict Resolution, Self-Advocacy",
            participantNote: "Youth demonstrated leadership in conflict resolution role-play activities."
        },
        {
            id: "group-therapy-005",
            date: "2024-01-31",
            type: "Group Therapy",
            attendance: "Yes",
            themesAddressed: "Emotional Expression, Mindfulness",
            participantNote: "Participated in mindfulness exercises and shared personal emotional experiences with group."
        }
    ],
    2: [], // Kermit - no group therapy sessions
    3: [], // Red Fraggle - no group therapy sessions (empty state)
    4: [ // Miss Piggy - has group therapy sessions
        {
            id: "group-therapy-006",
            date: "2024-01-08",
            type: "Group Therapy",
            attendance: "Yes",
            themesAddressed: "Trauma Processing, Support Network",
            participantNote: "Youth shared trauma experiences in supportive group environment."
        },
        {
            id: "group-therapy-007",
            date: "2024-01-15",
            type: "Group Therapy",
            attendance: "No",
            themesAddressed: "—",
            participantNote: "Youth refused to attend group session."
        },
        {
            id: "group-therapy-008",
            date: "2024-01-22",
            type: "Group Therapy",
            attendance: "Yes",
            themesAddressed: "Coping Skills, Resilience Building",
            participantNote: "Actively participated in coping skills workshop and supported peers."
        }
    ]
};

// Mock Substance Use data.
//
// Each category models the youth's full record set ("ALL_..."); which of those
// records are already associated with a given ITP is tracked separately
// (ASSOCIATED_..._IDS), and the current ITP's date range further narrows which
// records are even eligible to be associated (see isWithinItpDateRange /
// overlapsItpDateRange usage below). This mirrors the real business rule: the
// records themselves are owned by the youth's Health Overview / Substance Use
// workflows, and the ITP only ever associates existing records — it never
// creates, edits, or deletes them.

// Substance Use Assessments are Connections of type "Integrated Substance Use
// Assessment" (see connectionTypeOptions in ConnectionFormDialog.tsx). This
// reuses the shared `Connection` type rather than inventing a parallel one,
// and layers on the two Assessment-specific fields captured by
// SubstanceUseAssessmentFields.tsx (reasonForRequest/results) for display.
type SubstanceUseAssessmentConnection = Connection & {
    reasonForRequest?: string;
    results?: string;
};

// Mock ALL Substance Use Testing data (the youth's full testing history)
const MOCK_ALL_SUBSTANCE_USE_TESTING = {
    1: [ // Fozzie Bear
        {
            id: "su-test-001",
            dateTime: "2025-01-10 09:30",
            reason: "Random Testing",
            results: "Negative",
            newUse: "No"
        },
        {
            id: "su-test-002",
            dateTime: "2025-01-15 14:00",
            reason: "Suspicion of Use",
            results: "Positive for THC",
            newUse: "Yes"
        },
        {
            id: "su-test-003",
            dateTime: "2025-01-22 10:00",
            reason: "Follow-up Testing",
            results: "Negative",
            newUse: "No"
        },
        {
            id: "su-test-005",
            dateTime: "2025-02-19 09:00",
            reason: "Weekly Scheduled Testing",
            results: "Negative",
            newUse: "No"
        },
        {
            id: "su-test-006",
            dateTime: "2025-03-05 14:30",
            reason: "Random Testing",
            results: "Negative",
            newUse: "No"
        },
        {
            id: "su-test-009",
            dateTime: "2024-11-20 10:00",
            reason: "Admission Testing",
            results: "Negative",
            newUse: "No"
        }
    ],
    2: [],
    3: [],
    4: [ // Miss Piggy
        {
            id: "su-test-004",
            dateTime: "2024-11-25 11:00",
            reason: "Admission Testing",
            results: "Positive for Alcohol",
            newUse: "Yes"
        },
        {
            id: "su-test-007",
            dateTime: "2025-01-12 10:00",
            reason: "Follow-up Testing",
            results: "Negative",
            newUse: "No"
        },
        {
            id: "su-test-008",
            dateTime: "2025-02-10 15:30",
            reason: "Random Testing",
            results: "Negative",
            newUse: "No"
        },
        {
            id: "su-test-010",
            dateTime: "2025-03-01 09:00",
            reason: "Random Testing",
            results: "Negative",
            newUse: "No"
        }
    ]
};

// IDs of Testing records already associated with the current ITP (seed data
// simulating records saved on a prior visit to this section)
const MOCK_ASSOCIATED_SUBSTANCE_USE_TESTING_IDS = {
    1: ["su-test-001", "su-test-002", "su-test-003"],
    2: [] as string[],
    3: [] as string[],
    4: ["su-test-004", "su-test-007"]
};

// Mock ALL Substance Use Disclosures data (the youth's full disclosure history)
const MOCK_ALL_SUBSTANCE_USE_DISCLOSURES = {
    1: [
        {
            id: "su-disc-001",
            dateTime: "2025-01-14 16:30",
            substances: "Marijuana",
            comments: "Youth disclosed use during weekend pass with peers. Discussed triggers and coping strategies in follow-up session."
        },
        {
            id: "su-disc-003",
            dateTime: "2025-02-20 11:00",
            substances: "Alcohol",
            comments: "Youth disclosed drinking at friend's house. Processing event in therapy."
        },
        {
            id: "su-disc-004",
            dateTime: "2025-03-28 14:00",
            substances: "Marijuana, Vaping",
            comments: "Youth disclosed marijuana use and vaping. Discussed health impacts and alternative coping strategies."
        }
    ],
    2: [],
    3: [],
    4: [
        {
            id: "su-disc-002",
            dateTime: "2024-11-28 14:00",
            substances: "Alcohol",
            comments: "Youth disclosed alcohol use prior to admission. Working on relapse prevention strategies."
        },
        {
            id: "su-disc-005",
            dateTime: "2025-01-17 09:30",
            substances: "Prescription Medication (Non-prescribed)",
            comments: "Youth disclosed using prescription medication not prescribed to them. Safety planning initiated."
        }
    ]
};

// IDs of Disclosure records already associated with the current ITP
const MOCK_ASSOCIATED_SUBSTANCE_USE_DISCLOSURE_IDS = {
    1: ["su-disc-001"],
    2: [] as string[],
    3: [] as string[],
    4: ["su-disc-002"]
};

// Mock Substance Use Assessment connections (the youth's full Connections
// history, filtered at render time to type "Integrated Substance Use
// Assessment" — includes a couple of other-type/out-of-range connections
// below to demonstrate that both filter conditions are enforced)
const MOCK_SUBSTANCE_USE_ASSESSMENT_CONNECTIONS: Record<number, SubstanceUseAssessmentConnection[]> = {
    1: [ // Fozzie Bear
        {
            id: "su-assess-001",
            type: "Integrated Substance Use Assessment",
            status: "Completed",
            startDate: "2025-01-18",
            endDate: "2025-01-20",
            startTime: "10:00 AM",
            endTime: "11:30 AM",
            attended: true,
            participants: "Fozzie Bear",
            programs: "Mahoney House",
            homeVisit: false,
            reasonForRequest: "Recent positive drug test and disclosure",
            results: "Moderate risk for continued substance use. Recommend continued individual therapy and group participation."
        },
        {
            id: "su-assess-003",
            type: "Integrated Substance Use Assessment",
            status: "Scheduled",
            startDate: "2025-03-25",
            endDate: "2025-03-28",
            startTime: "09:00 AM",
            endTime: "10:00 AM",
            attended: false,
            participants: "Fozzie Bear",
            programs: "Mahoney House",
            homeVisit: false,
            reasonForRequest: "Quarterly assessment update",
            results: "—"
        },
        { // decoy: wrong type — must be excluded by the type filter
            id: "su-assess-005",
            type: "Therapy Session",
            status: "Completed",
            startDate: "2025-02-01",
            endDate: "2025-02-01",
            startTime: "01:00 PM",
            endTime: "02:00 PM",
            attended: true,
            participants: "Fozzie Bear",
            programs: "Mahoney House",
            homeVisit: false
        },
        { // decoy: right type, end date outside the ITP range — must be excluded by the date filter
            id: "su-assess-006",
            type: "Integrated Substance Use Assessment",
            status: "Completed",
            startDate: "2024-10-01",
            endDate: "2024-10-05",
            startTime: "09:00 AM",
            endTime: "10:00 AM",
            attended: true,
            participants: "Fozzie Bear",
            programs: "Mahoney House",
            homeVisit: false,
            reasonForRequest: "Prior admission assessment",
            results: "Low risk at time of assessment."
        }
    ],
    2: [],
    3: [],
    4: [ // Miss Piggy
        {
            id: "su-assess-002",
            type: "Integrated Substance Use Assessment",
            status: "Completed",
            startDate: "2024-11-20",
            endDate: "2024-11-22",
            startTime: "10:00 AM",
            endTime: "11:30 AM",
            attended: true,
            participants: "Miss Piggy",
            programs: "Mahoney House",
            homeVisit: false,
            reasonForRequest: "Admission assessment following positive alcohol test",
            results: "High risk level. Intensive monitoring and therapeutic intervention recommended."
        },
        {
            id: "su-assess-004",
            type: "Integrated Substance Use Assessment",
            status: "Scheduled",
            startDate: "2025-02-05",
            endDate: "2025-02-08",
            startTime: "09:00 AM",
            endTime: "10:00 AM",
            attended: false,
            participants: "Miss Piggy",
            programs: "Mahoney House",
            homeVisit: false,
            reasonForRequest: "Discharge planning assessment",
            results: "—"
        }
    ]
};

// IDs of eligible Assessment connections already associated with the current ITP
const MOCK_ASSOCIATED_SUBSTANCE_USE_ASSESSMENT_IDS = {
    1: ["su-assess-001"],
    2: [] as string[],
    3: [] as string[],
    4: ["su-assess-002"]
};

// Mock ALL Substance Use Supplemental Plans data (the youth's full plan history)
const MOCK_ALL_SUBSTANCE_USE_SUPPLEMENTAL_PLANS = {
    1: [
        {
            id: "su-supp-001",
            startDate: "2025-01-17",
            type: "Relapse Prevention Plan",
            planDescription: "Individualized relapse prevention plan addressing marijuana use triggers, high-risk situations, and coping strategies. Includes weekly check-ins and progress tracking.",
            endDate: "—"
        },
        {
            id: "su-supp-003",
            startDate: "2025-02-25",
            type: "Safety Plan",
            planDescription: "Safety plan for managing high-risk situations and accessing support during moments of vulnerability.",
            endDate: "—"
        }
    ],
    2: [],
    3: [],
    4: [
        {
            id: "su-supp-002",
            startDate: "2024-11-20",
            type: "Relapse Prevention Plan",
            planDescription: "Comprehensive relapse prevention plan for alcohol use. Focuses on identifying triggers, building healthy coping mechanisms, and developing support network.",
            endDate: "—"
        },
        {
            id: "su-supp-004",
            startDate: "2025-01-25",
            type: "Safety Plan",
            planDescription: "Safety plan for managing high-risk situations and accessing support during moments of vulnerability.",
            endDate: "—"
        }
    ]
};

// IDs of Supplemental Plan records already associated with the current ITP
const MOCK_ASSOCIATED_SUBSTANCE_USE_SUPPLEMENTAL_PLAN_IDS = {
    1: ["su-supp-001"],
    2: [] as string[],
    3: [] as string[],
    4: ["su-supp-002"]
};

// Mock Incidents data
const MOCK_INCIDENTS = {
    1: [ // Fozzie Bear - has incident records
        {
            id: "inc-001",
            startDateTime: "2024-01-10 14:30",
            endDateTime: "2024-01-10 14:45",
            incidentType: "Physical Aggression",
            overview: "Youth engaged in physical altercation with peer during recreational activity. Staff intervened and de-escalated situation.",
            restraintOccurred: "Yes"
        },
        {
            id: "inc-002",
            startDateTime: "2024-01-18 09:15",
            endDateTime: "2024-01-18 09:30",
            incidentType: "Verbal Aggression",
            overview: "Youth became verbally aggressive toward staff when asked to complete assigned chores.",
            restraintOccurred: "No"
        },
        {
            id: "inc-003",
            startDateTime: "2024-01-25 16:00",
            endDateTime: "2024-01-25 16:20",
            incidentType: "Physical Aggression",
            overview: "Youth displayed physical aggression during group therapy session. Multiple restraint holds required to ensure safety.",
            restraintOccurred: "Yes"
        }
    ],
    2: [], // Kermit - no incidents
    3: [], // Red Fraggle - no incidents (empty state)
    4: [ // Miss Piggy - has incident records
        {
            id: "inc-004",
            startDateTime: "2024-01-12 11:00",
            endDateTime: "2024-01-12 11:10",
            incidentType: "Property Destruction",
            overview: "Youth damaged bedroom furniture during emotional outburst. No restraint required.",
            restraintOccurred: "No"
        }
    ]
};

// Mock Legal Involvement data
const MOCK_LEGAL_INVOLVEMENT = {
    1: [ // Fozzie Bear - has legal involvement records
        {
            id: "legal-001",
            startDate: "2024-01-05",
            courtType: "Juvenile Court",
            overview: "Youth is on probation for prior theft charges. Required to complete community service hours and attend weekly check-ins with probation officer.",
            status: "Open",
            endDate: null
        },
        {
            id: "legal-002",
            startDate: "2024-01-20",
            courtType: "Family Court",
            overview: "Custody hearing regarding permanent placement options. Youth participated in court hearing with advocate present.",
            status: "Closed",
            endDate: "2024-01-20"
        }
    ],
    2: [], // Kermit - no legal involvement
    3: [], // Red Fraggle - no legal involvement (empty state)
    4: [ // Miss Piggy - has legal involvement records
        {
            id: "legal-003",
            startDate: "2023-12-15",
            courtType: "Juvenile Court",
            overview: "Youth adjudicated delinquent for assault charges. Court ordered participation in anger management programming and individual therapy.",
            status: "Open",
            endDate: null
        }
    ]
};

// Mock DCFS Involvement data
const MOCK_DCFS_INVOLVEMENT = {
    1: [ // Fozzie Bear - has DCFS involvement records
        {
            id: "dcfs-001",
            investigationDate: "2024-01-08",
            summary: "Investigation opened following report of alleged neglect. Youth placed in care as result of investigation findings.",
            relatedIncident: "Incident #2024-001",
            resolution: "Indicated - Neglect",
            resolutionDate: "2024-01-15"
        },
        {
            id: "dcfs-002",
            investigationDate: "2024-02-12",
            summary: "Follow-up investigation regarding youth's progress in placement. No new concerns identified.",
            relatedIncident: null,
            resolution: "Unfounded",
            resolutionDate: "2024-02-18"
        }
    ],
    2: [], // Kermit - no DCFS involvement
    3: [], // Red Fraggle - no DCFS involvement (empty state)
    4: [ // Miss Piggy - has DCFS involvement records
        {
            id: "dcfs-003",
            investigationDate: "2024-01-20",
            summary: "Investigation initiated following incident at facility. Youth alleged physical abuse by peer. Investigation determined no staff involvement.",
            relatedIncident: "Incident #2024-012",
            resolution: "Unfounded",
            resolutionDate: "2024-01-28"
        }
    ]
};

// Mock Testing & Assessments data
const MOCK_TESTING_ASSESSMENTS = {
    1: [ // Fozzie Bear - has testing records
        {
            id: "test-001",
            date: "2025-01-15",
            test: "MACI (Millon Adolescent Clinical Inventory)",
            summary: "Results indicate moderate elevation on Anxiety and Depressive Affect scales, consistent with clinical presentation. Youth demonstrates good insight and motivation for treatment."
        },
        {
            id: "test-002",
            date: "2025-02-22",
            test: "BASC-3 (Behavior Assessment System for Children)",
            summary: "Teacher and parent ratings show concordance on Attention Problems and Hyperactivity scales. Youth demonstrates strengths in Adaptability and Social Skills domains."
        }
    ],
    2: [ // Kermit - has testing records
        {
            id: "test-003",
            date: "2024-12-10",
            test: "WISC-V (Wechsler Intelligence Scale for Children)",
            summary: "Full Scale IQ in the average range. Significant scatter between Verbal Comprehension (high average) and Processing Speed (low average) indices noted."
        }
    ],
    3: [], // Red Fraggle - no testing records (empty state)
    4: [ // Miss Piggy - has testing records
        {
            id: "test-004",
            date: "2024-11-20",
            test: "MCMI-IV (Millon Clinical Multiaxial Inventory)",
            summary: "Elevated scores on Negativistic and Borderline scales. Results suggest difficulty with emotional regulation and interpersonal relationships."
        },
        {
            id: "test-005",
            date: "2025-03-05",
            test: "Conners 3 (Conners Comprehensive Behavior Rating Scales)",
            summary: "Ratings indicate clinically significant elevations on Hyperactivity/Impulsivity and Defiance/Aggression scales across multiple raters."
        }
    ]
};

// Mock ASP Participation data
const MOCK_ASP_PARTICIPATION = {
    1: [ // Fozzie Bear - has ASP classes
        {
            id: "asp-001",
            class: "Creative Writing Workshop",
            numberPlanned: 12,
            numberAttended: 11,
            numberTardy: 2,
            averageEngagement: 4.2,
            averageScore: 3.8
        },
        {
            id: "asp-002",
            class: "Digital Music Production",
            numberPlanned: 12,
            numberAttended: 10,
            numberTardy: 1,
            averageEngagement: 4.5,
            averageScore: 4.3
        }
    ],
    2: [ // Kermit - has ASP classes
        {
            id: "asp-003",
            class: "Photography Basics",
            numberPlanned: 12,
            numberAttended: 12,
            numberTardy: 0,
            averageEngagement: 4.8,
            averageScore: 4.6
        }
    ],
    3: [], // Red Fraggle - no ASP classes (empty state)
    4: [ // Miss Piggy - has ASP classes
        {
            id: "asp-004",
            class: "Theatre Arts",
            numberPlanned: 12,
            numberAttended: 8,
            numberTardy: 3,
            averageEngagement: 3.5,
            averageScore: 3.2
        },
        {
            id: "asp-005",
            class: "Culinary Arts",
            numberPlanned: 12,
            numberAttended: 9,
            numberTardy: 2,
            averageEngagement: 4.0,
            averageScore: 3.9
        }
    ]
};

// Mock Executive Functions data
const MOCK_EXECUTIVE_FUNCTIONS = {
    1: { // Fozzie Bear - has Executive Functions participation
        participationSummary: {
            classSessionsScheduled: 12,
            classSessionsAttended: 10,
            averageEngagementLevel: 4.2,
            averageSessionScore: 3.9
        },
        learningModules: [
            {
                id: "ef-lm-001",
                learningModule: "Time Management & Organization",
                numberPlanned: 4,
                numberAttended: 4,
                numberTardy: 0,
                averageEngagement: 4.5,
                averageScore: 4.2
            },
            {
                id: "ef-lm-002",
                learningModule: "Planning & Prioritization",
                numberPlanned: 4,
                numberAttended: 3,
                numberTardy: 1,
                averageEngagement: 4.0,
                averageScore: 3.8
            },
            {
                id: "ef-lm-003",
                learningModule: "Self-Monitoring & Reflection",
                numberPlanned: 4,
                numberAttended: 3,
                numberTardy: 0,
                averageEngagement: 4.1,
                averageScore: 3.7
            }
        ],
        organizationalSystems: [
            {
                id: "ef-os-001",
                system: "Weekly Planner",
                numberCompleted: 10,
                numberOfRatings: 12,
                averageSystemRating: 4.3,
                averagePlannerRating: 4.1
            },
            {
                id: "ef-os-002",
                system: "Goal Tracking Sheet",
                numberCompleted: 9,
                numberOfRatings: 12,
                averageSystemRating: 3.8,
                averagePlannerRating: 3.9
            }
        ],
        connections: [
            {
                id: "ef-conn-001",
                startDate: "2025-01-08",
                type: "Internal Academy Meeting",
                purpose: "Executive Functions Coaching",
                attendance: "Yes"
            },
            {
                id: "ef-conn-002",
                startDate: "2025-01-22",
                type: "Internal Academy Meeting",
                purpose: "Executive Functions Coaching",
                attendance: "Yes"
            },
            {
                id: "ef-conn-003",
                startDate: "2025-02-05",
                type: "Internal Academy Meeting",
                purpose: "Executive Functions Coaching",
                attendance: "No"
            }
        ]
    },
    2: { // Kermit - has Executive Functions participation
        participationSummary: {
            classSessionsScheduled: 12,
            classSessionsAttended: 12,
            averageEngagementLevel: 4.7,
            averageSessionScore: 4.5
        },
        learningModules: [
            {
                id: "ef-lm-004",
                learningModule: "Time Management & Organization",
                numberPlanned: 4,
                numberAttended: 4,
                numberTardy: 0,
                averageEngagement: 4.8,
                averageScore: 4.6
            },
            {
                id: "ef-lm-005",
                learningModule: "Planning & Prioritization",
                numberPlanned: 4,
                numberAttended: 4,
                numberTardy: 0,
                averageEngagement: 4.7,
                averageScore: 4.5
            },
            {
                id: "ef-lm-006",
                learningModule: "Self-Monitoring & Reflection",
                numberPlanned: 4,
                numberAttended: 4,
                numberTardy: 0,
                averageEngagement: 4.6,
                averageScore: 4.4
            }
        ],
        organizationalSystems: [
            {
                id: "ef-os-003",
                system: "Weekly Planner",
                numberCompleted: 12,
                numberOfRatings: 12,
                averageSystemRating: 4.7,
                averagePlannerRating: 4.8
            },
            {
                id: "ef-os-004",
                system: "Goal Tracking Sheet",
                numberCompleted: 11,
                numberOfRatings: 12,
                averageSystemRating: 4.5,
                averagePlannerRating: 4.6
            }
        ],
        connections: [
            {
                id: "ef-conn-004",
                startDate: "2025-01-10",
                type: "Internal Academy Meeting",
                purpose: "Executive Functions Coaching",
                attendance: "Yes"
            },
            {
                id: "ef-conn-005",
                startDate: "2025-01-24",
                type: "Internal Academy Meeting",
                purpose: "Executive Functions Coaching",
                attendance: "Yes"
            },
            {
                id: "ef-conn-006",
                startDate: "2025-02-07",
                type: "Internal Academy Meeting",
                purpose: "Executive Functions Coaching",
                attendance: "Yes"
            }
        ]
    },
    3: { // Red Fraggle - no Executive Functions (empty state)
        participationSummary: {
            classSessionsScheduled: 0,
            classSessionsAttended: 0,
            averageEngagementLevel: 0,
            averageSessionScore: 0
        },
        learningModules: [],
        organizationalSystems: [],
        connections: []
    },
    4: { // Miss Piggy - has Executive Functions participation
        participationSummary: {
            classSessionsScheduled: 12,
            classSessionsAttended: 8,
            averageEngagementLevel: 3.6,
            averageSessionScore: 3.4
        },
        learningModules: [
            {
                id: "ef-lm-007",
                learningModule: "Time Management & Organization",
                numberPlanned: 4,
                numberAttended: 3,
                numberTardy: 2,
                averageEngagement: 3.7,
                averageScore: 3.5
            },
            {
                id: "ef-lm-008",
                learningModule: "Planning & Prioritization",
                numberPlanned: 4,
                numberAttended: 2,
                numberTardy: 1,
                averageEngagement: 3.5,
                averageScore: 3.2
            },
            {
                id: "ef-lm-009",
                learningModule: "Self-Monitoring & Reflection",
                numberPlanned: 4,
                numberAttended: 3,
                numberTardy: 0,
                averageEngagement: 3.6,
                averageScore: 3.5
            }
        ],
        organizationalSystems: [
            {
                id: "ef-os-005",
                system: "Weekly Planner",
                numberCompleted: 7,
                numberOfRatings: 12,
                averageSystemRating: 3.4,
                averagePlannerRating: 3.6
            }
        ],
        connections: [
            {
                id: "ef-conn-007",
                startDate: "2025-01-15",
                type: "Internal Academy Meeting",
                purpose: "Executive Functions Coaching",
                attendance: "Yes"
            },
            {
                id: "ef-conn-008",
                startDate: "2025-02-12",
                type: "Internal Academy Meeting",
                purpose: "Executive Functions Coaching",
                attendance: "No"
            }
        ]
    }
};

// Mock Career data - sourced from youth's Employment, Career Classes, Financial Literacy, Driver's Ed, and Connection records
const MOCK_CAREER_DATA = {
    1: { // Fozzie Bear
        employment: [
            {
                id: "career-emp-001",
                employer: "Mercy Home Gift Shop",
                type: "Part-time",
                position: "Sales Associate",
                discipline: "Retail",
                startDate: "2024-10-01",
                endDate: null,
                status: "Active",
                hoursPerWeek: 10
            },
            {
                id: "career-emp-002",
                employer: "Local Grocery Store",
                type: "Part-time",
                position: "Bagger",
                discipline: "Food Service",
                startDate: "2024-07-15",
                endDate: "2024-09-30",
                status: "Ended",
                hoursPerWeek: 8
            }
        ],
        learningModules: [
            {
                id: "career-lm-001",
                learningModule: "Job Application Skills",
                numberPlanned: 4,
                numberAttended: 4,
                averageEngagement: 4.3
            },
            {
                id: "career-lm-002",
                learningModule: "Interview Preparation",
                numberPlanned: 3,
                numberAttended: 3,
                averageEngagement: 4.5
            },
            {
                id: "career-lm-003",
                learningModule: "Workplace Communication",
                numberPlanned: 4,
                numberAttended: 3,
                averageEngagement: 3.8
            }
        ],
        classParticipation: [
            {
                id: "career-cp-001",
                className: "Resume Writing & Interview Skills",
                classType: "Job Skills",
                startDate: "2025-01-06",
                endDate: "2025-03-28",
                numberPlanned: 6,
                numberAttended: 5,
                numberTardy: 1,
                averageEngagement: 4.2,
                averageScore: 3.9
            },
            {
                id: "career-cp-002",
                className: "Workplace Readiness",
                classType: "Career Exposure",
                startDate: "2025-01-13",
                endDate: "2025-03-28",
                numberPlanned: 4,
                numberAttended: 4,
                numberTardy: 0,
                averageEngagement: 4.5,
                averageScore: 4.3
            }
        ],
        financialLiteracy: [
            {
                id: "career-fl-001",
                className: "Budgeting Basics",
                curriculumVersion: "2024 v1",
                numberPlanned: 4,
                numberAttended: 4,
                numberTardy: 0,
                averageEngagement: 4.0,
                averageScore: 3.8,
                datePassed: "2025-02-15",
                status: "Complete"
            },
            {
                id: "career-fl-002",
                className: "Banking & Savings",
                curriculumVersion: "2024 v1",
                numberPlanned: 3,
                numberAttended: 2,
                numberTardy: 1,
                averageEngagement: 3.7,
                averageScore: 3.5,
                datePassed: null,
                status: "In Progress"
            }
        ],
        driversEducation: [
            {
                id: "career-de-001",
                type: "Classroom Instruction",
                status: "Complete",
                date: "2025-01-20",
                notes: "Completed all required classroom sessions"
            },
            {
                id: "career-de-002",
                type: "Behind-the-Wheel Training",
                status: "In Progress",
                date: "2025-02-15",
                notes: "4 of 6 sessions completed"
            }
        ],
        careerConnections: [
            {
                id: "career-conn-001",
                date: "2025-01-10",
                type: "Career Counseling",
                purpose: "Explore career interests and identify strengths",
                attended: "Yes",
                participantNote: "Youth explored career interests in arts and communications",
                summary: "Productive session identifying career strengths and interests. Youth expressed interest in graphic design and media production."
            },
            {
                id: "career-conn-002",
                date: "2025-02-08",
                type: "Job Shadow",
                purpose: "Gain exposure to graphic design career",
                attended: "Yes",
                participantNote: "Shadowed graphic designer at local marketing firm",
                summary: "Youth engaged enthusiastically with the experience and asked thoughtful questions about career pathways."
            },
            {
                id: "career-conn-003",
                date: "2025-03-05",
                type: "Career Fair",
                purpose: "Explore employment opportunities",
                attended: "No",
                participantNote: "Youth was absent due to medical appointment",
                summary: "—"
            }
        ]
    },
    2: { // Kermit the Frog
        employment: [
            {
                id: "career-emp-003",
                employer: "Public Library",
                type: "Part-time",
                position: "Library Assistant",
                discipline: "Public Service",
                startDate: "2024-09-15",
                endDate: null,
                status: "Active",
                hoursPerWeek: 12
            }
        ],
        learningModules: [
            {
                id: "career-lm-004",
                learningModule: "Customer Service Excellence",
                numberPlanned: 4,
                numberAttended: 4,
                averageEngagement: 4.8
            },
            {
                id: "career-lm-005",
                learningModule: "Professional Networking",
                numberPlanned: 3,
                numberAttended: 3,
                averageEngagement: 4.7
            }
        ],
        classParticipation: [
            {
                id: "career-cp-003",
                className: "Leadership & Professional Development",
                classType: "Job Skills",
                startDate: "2025-01-06",
                endDate: "2025-03-28",
                numberPlanned: 6,
                numberAttended: 6,
                numberTardy: 0,
                averageEngagement: 4.9,
                averageScore: 4.7
            }
        ],
        financialLiteracy: [
            {
                id: "career-fl-003",
                className: "Budgeting Basics",
                curriculumVersion: "2024 v1",
                numberPlanned: 4,
                numberAttended: 4,
                numberTardy: 0,
                averageEngagement: 4.8,
                averageScore: 4.6,
                datePassed: "2025-01-28",
                status: "Complete"
            },
            {
                id: "career-fl-004",
                className: "Investing & Future Planning",
                curriculumVersion: "2024 v2",
                numberPlanned: 3,
                numberAttended: 3,
                numberTardy: 0,
                averageEngagement: 4.7,
                averageScore: 4.5,
                datePassed: "2025-03-15",
                status: "Complete"
            }
        ],
        driversEducation: [],
        careerConnections: [
            {
                id: "career-conn-004",
                date: "2025-01-22",
                type: "College Admissions Meeting",
                purpose: "Review college acceptance letters and financial aid",
                attended: "Yes",
                participantNote: "Discussed application status and financial aid options",
                summary: "Youth is on track for college enrollment. Reviewed three acceptance letters and discussed scholarship opportunities."
            },
            {
                id: "career-conn-005",
                date: "2025-03-10",
                type: "Career Counseling",
                purpose: "Explore environmental science career pathways",
                attended: "Yes",
                participantNote: "Explored career paths in environmental science",
                summary: "Youth showed strong interest in environmental advocacy and explored relevant college majors and career options."
            }
        ]
    },
    3: { // Red Fraggle - minimal career involvement (empty state)
        employment: [],
        learningModules: [],
        classParticipation: [],
        financialLiteracy: [],
        driversEducation: [],
        careerConnections: []
    },
    4: { // Miss Piggy
        employment: [
            {
                id: "career-emp-004",
                employer: "Community Theater",
                type: "Internship",
                position: "Junior Stage Hand",
                discipline: "Arts & Entertainment",
                startDate: "2024-11-01",
                endDate: "2025-01-31",
                status: "Ended",
                hoursPerWeek: 6
            }
        ],
        learningModules: [
            {
                id: "career-lm-006",
                learningModule: "Job Search Strategies",
                numberPlanned: 3,
                numberAttended: 2,
                averageEngagement: 3.5
            }
        ],
        classParticipation: [
            {
                id: "career-cp-004",
                className: "Performing Arts Career Pathways",
                classType: "Career Exposure",
                startDate: "2024-11-04",
                endDate: "2025-01-31",
                numberPlanned: 4,
                numberAttended: 3,
                numberTardy: 2,
                averageEngagement: 3.8,
                averageScore: 3.5
            }
        ],
        financialLiteracy: [
            {
                id: "career-fl-005",
                className: "Budgeting Basics",
                curriculumVersion: "2024 v1",
                numberPlanned: 4,
                numberAttended: 2,
                numberTardy: 1,
                averageEngagement: 3.2,
                averageScore: 3.0,
                datePassed: null,
                status: "Enrolled"
            }
        ],
        driversEducation: [
            {
                id: "career-de-003",
                type: "Permit Test Preparation",
                status: "In Progress",
                date: "2025-02-01",
                notes: "Currently studying for permit exam"
            }
        ],
        careerConnections: [
            {
                id: "career-conn-006",
                date: "2025-01-15",
                type: "Career Counseling",
                purpose: "Explore entertainment industry career options",
                attended: "Yes",
                participantNote: "Discussed interest in entertainment and performing arts",
                summary: "Youth shared passion for performance. Explored career pathways in entertainment industry including acting, stage management, and talent representation."
            }
        ]
    }
};

// Mock Post Secondary data - sourced from youth's PSO Enrollment, Class Participation, Credentials, and Connection records
const MOCK_POST_SECONDARY_DATA = {
    1: { // Fozzie Bear - active PSO involvement
        psoEnrollment: [
            {
                id: "pso-001",
                program: "Greater West Town Project",
                organization: "Greater West Town Community Development Project",
                startDate: "2024-10-14",
                endDate: null,
                status: "Active"
            },
            {
                id: "pso-002",
                program: "City Colleges of Chicago – Malcolm X",
                organization: "City Colleges of Chicago",
                startDate: "2025-01-13",
                endDate: null,
                status: "Active"
            }
        ],
        classParticipation: [
            {
                id: "ps-cp-001",
                className: "Culinary Arts Fundamentals",
                classType: "Post Secondary Options",
                numberPlanned: 12,
                numberAttended: 11,
                numberTardy: 1,
                averageEngagement: 4.6,
                averageScore: 4.4
            },
            {
                id: "ps-cp-002",
                className: "English Composition 101",
                classType: "Post Secondary Options",
                numberPlanned: 14,
                numberAttended: 13,
                numberTardy: 0,
                averageEngagement: 4.1,
                averageScore: 3.9
            }
        ],
        credentials: [
            {
                id: "cred-001",
                credential: "ServSafe Food Handler Certificate",
                issuingOrganization: "Greater West Town Community Development Project",
                type: "Food Safety Certification",
                issueDate: "2025-02-28",
                expirationDate: "2028-02-28",
                status: "Earned"
            },
            {
                id: "cred-002",
                credential: "OSHA 10-Hour General Industry",
                issuingOrganization: "Greater West Town Community Development Project",
                type: "Safety Certification",
                issueDate: null,
                expirationDate: null,
                status: "In Progress"
            }
        ],
        psConnections: [
            {
                id: "ps-conn-001",
                date: "2025-01-08",
                type: "Internal Academy Meeting",
                purpose: "PSO Advising",
                summary: "Reviewed spring semester goals and established a PSO engagement plan for the quarter.",
                attended: "Yes"
            },
            {
                id: "ps-conn-002",
                date: "2025-02-05",
                type: "Internal Academy Meeting",
                purpose: "PSO Advising",
                summary: "Discussed progress in culinary program and explored credential timeline.",
                attended: "Yes"
            },
            {
                id: "ps-conn-003",
                date: "2025-03-12",
                type: "Internal Academy Meeting",
                purpose: "PSO Advising",
                summary: "Mid-quarter check-in. Youth on track with all PSO goals and OSHA certification in progress.",
                attended: "Yes"
            }
        ]
    },
    2: { // Kermit - college enrollment pathway
        psoEnrollment: [
            {
                id: "pso-003",
                program: "DePaul University – Incoming Freshman",
                organization: "DePaul University",
                startDate: "2025-01-06",
                endDate: null,
                status: "Pending"
            }
        ],
        classParticipation: [],
        credentials: [
            {
                id: "cred-003",
                credential: "High School Diploma",
                issuingOrganization: "Mercy Home Academy",
                type: "Academic Diploma",
                issueDate: "2024-06-15",
                expirationDate: null,
                status: "Earned"
            }
        ],
        psConnections: [
            {
                id: "ps-conn-004",
                date: "2025-02-20",
                type: "Internal Academy Meeting",
                purpose: "PSO Advising",
                summary: "Reviewed financial aid status and confirmed enrollment steps for DePaul University.",
                attended: "Yes"
            }
        ]
    },
    3: { // Red Fraggle - no PSO involvement
        psoEnrollment: [],
        classParticipation: [],
        credentials: [],
        psConnections: []
    },
    4: { // Miss Piggy - early exploration via Year Up
        psoEnrollment: [
            {
                id: "pso-004",
                program: "Year Up – Information Technology",
                organization: "Year Up",
                startDate: "2025-01-13",
                endDate: null,
                status: "Active"
            }
        ],
        classParticipation: [
            {
                id: "ps-cp-003",
                className: "Introduction to IT & Networking",
                classType: "Post Secondary Options",
                numberPlanned: 8,
                numberAttended: 6,
                numberTardy: 2,
                averageEngagement: 3.5,
                averageScore: 3.3
            }
        ],
        credentials: [],
        psConnections: [
            {
                id: "ps-conn-005",
                date: "2025-01-22",
                type: "Internal Academy Meeting",
                purpose: "PSO Advising",
                summary: "Program introduction meeting. Youth reviewed Year Up expectations and onboarding requirements.",
                attended: "Yes"
            },
            {
                id: "ps-conn-006",
                date: "2025-03-05",
                type: "Internal Academy Meeting",
                purpose: "PSO Advising",
                summary: "Quarterly engagement review. Youth was unable to attend; follow-up scheduled.",
                attended: "No"
            }
        ]
    }
};

// Mock School data - sourced from youth's profile, Report Card, Course, Incident, Connection, and Tutor Session records
const MOCK_SCHOOL_DATA = {
    1: { // Fozzie Bear - active school involvement
        reportCards: [
            { id: "rc-001", reportCardDate: "2025-03-14", creditsEarned: 3.5, numberOfAbsences: 4, gpa: 2.8, cumulativeGpa: 2.75 },
            { id: "rc-002", reportCardDate: "2024-12-20", creditsEarned: 3.0, numberOfAbsences: 6, gpa: 2.6, cumulativeGpa: 2.72 }
        ],
        courseGrades: [
            { id: "cg-001", course: "English Language Arts", grade: "B", creditsEarned: 1.0 },
            { id: "cg-002", course: "Algebra II", grade: "C+", creditsEarned: 1.0 },
            { id: "cg-003", course: "U.S. History", grade: "B-", creditsEarned: 0.5 },
            { id: "cg-004", course: "Physical Education", grade: "A-", creditsEarned: 0.5 }
        ],
        courseEnrollments: [
            { id: "ce-001", course: "English Language Arts" },
            { id: "ce-002", course: "Algebra II" },
            { id: "ce-003", course: "U.S. History" },
            { id: "ce-004", course: "Physical Education" },
            { id: "ce-005", course: "Art Studio" }
        ],
        schoolIncidents: [
            {
                id: "si-001",
                startDateTime: "2025-02-12 9:30 AM",
                endDateTime: "2025-02-12 10:15 AM",
                incidentType: "Verbal Altercation",
                overview: "Youth was involved in a verbal disagreement with a peer in the hallway. Staff intervened promptly and de-escalated the situation.",
                restraintOccurred: "No"
            }
        ],
        schoolConnections: [
            { id: "sc-001", date: "2025-03-05", type: "Teacher Check-In", purpose: "Academic progress review", attended: "Yes" },
            { id: "sc-002", date: "2025-01-22", type: "Parent-Teacher Conference", purpose: "Quarterly academic review with advocate", attended: "Yes" }
        ],
        tutorSessions: [
            { id: "ts-001", day: "Monday", type: "Math", sessionsPlanned: 12, sessionsAttended: 10 },
            { id: "ts-002", day: "Wednesday", type: "English", sessionsPlanned: 12, sessionsAttended: 11 }
        ]
    },
    2: { // Kermit - strong academic performance
        reportCards: [
            { id: "rc-003", reportCardDate: "2025-03-14", creditsEarned: 4.0, numberOfAbsences: 1, gpa: 3.6, cumulativeGpa: 3.5 }
        ],
        courseGrades: [
            { id: "cg-005", course: "AP English Literature", grade: "A-", creditsEarned: 1.0 },
            { id: "cg-006", course: "Pre-Calculus", grade: "B+", creditsEarned: 1.0 },
            { id: "cg-007", course: "Biology", grade: "A", creditsEarned: 1.0 },
            { id: "cg-008", course: "World History", grade: "A-", creditsEarned: 1.0 }
        ],
        courseEnrollments: [
            { id: "ce-006", course: "AP English Literature" },
            { id: "ce-007", course: "Pre-Calculus" },
            { id: "ce-008", course: "Biology" },
            { id: "ce-009", course: "World History" }
        ],
        schoolIncidents: [],
        schoolConnections: [
            { id: "sc-003", date: "2025-02-14", type: "Academic Counselor Meeting", purpose: "College planning and course selection", attended: "Yes" }
        ],
        tutorSessions: []
    },
    3: { // Red Fraggle - attendance challenges
        reportCards: [
            { id: "rc-004", reportCardDate: "2025-03-14", creditsEarned: 2.0, numberOfAbsences: 14, gpa: 1.9, cumulativeGpa: 2.1 }
        ],
        courseGrades: [
            { id: "cg-009", course: "English Language Arts", grade: "D+", creditsEarned: 0.5 },
            { id: "cg-010", course: "Geometry", grade: "D", creditsEarned: 0.5 },
            { id: "cg-011", course: "Science", grade: "C-", creditsEarned: 0.5 },
            { id: "cg-012", course: "Social Studies", grade: "C", creditsEarned: 0.5 }
        ],
        courseEnrollments: [
            { id: "ce-010", course: "English Language Arts" },
            { id: "ce-011", course: "Geometry" },
            { id: "ce-012", course: "Science" },
            { id: "ce-013", course: "Social Studies" }
        ],
        schoolIncidents: [
            {
                id: "si-002",
                startDateTime: "2025-01-30 11:00 AM",
                endDateTime: "2025-01-30 11:45 AM",
                incidentType: "Disruption",
                overview: "Youth left class without permission and refused to return when asked by staff. Situation resolved after a 45-minute de-escalation.",
                restraintOccurred: "No"
            }
        ],
        schoolConnections: [
            { id: "sc-004", date: "2025-02-20", type: "Attendance Review", purpose: "Address chronic absenteeism and develop attendance plan", attended: "Yes" },
            { id: "sc-005", date: "2025-01-10", type: "Teacher Check-In", purpose: "Academic support planning", attended: "No" }
        ],
        tutorSessions: [
            { id: "ts-003", day: "Tuesday", type: "Math / Reading", sessionsPlanned: 12, sessionsAttended: 5 }
        ]
    },
    4: { // Miss Piggy - school not applicable
        reportCards: [],
        courseGrades: [],
        courseEnrollments: [],
        schoolIncidents: [],
        schoolConnections: [],
        tutorSessions: []
    }
};

// Mock Academic Plans data - sourced from youth's IEP/504 Plan and Academic Plan records
const MOCK_ACADEMIC_PLANS_DATA = {
    1: { // Fozzie Bear - has IEP and a study time plan
        iepPlans: [
            {
                id: "iep-001",
                startDate: "2024-09-01",
                planType: "IEP",
                description: "Individualized Education Program addressing reading comprehension deficits and math learning disability. Accommodations include extended time, preferential seating, and resource room support.",
                endDate: "2025-06-30"
            }
        ],
        academicPlans: [
            {
                id: "ap-001",
                startDate: "2025-01-06",
                planType: "Study Time Plan",
                description: "Structured daily study time from 4–5 PM with advocate check-in. Focus areas: Algebra II and English Language Arts. Weekly progress review with school liaison.",
                endDate: null
            }
        ]
    },
    2: { // Kermit - high achiever, no IEP needed
        iepPlans: [],
        academicPlans: [
            {
                id: "ap-002",
                startDate: "2024-12-02",
                planType: "Academic Agreement",
                description: "Agreement outlining expectations for AP coursework balance with residential responsibilities. Youth agreed to communicate proactively with advocate when academic workload becomes unmanageable.",
                endDate: null
            }
        ]
    },
    3: { // Red Fraggle - attendance and compliance challenges
        iepPlans: [
            {
                id: "iep-002",
                startDate: "2023-11-01",
                planType: "504 Plan",
                description: "504 Plan providing accommodations for ADHD: extended time on tests, check-ins with school counselor, and permission to take movement breaks.",
                endDate: null
            }
        ],
        academicPlans: [
            {
                id: "ap-003",
                startDate: "2025-01-15",
                planType: "Academic Agreement",
                description: "Behavioral and academic agreement following multiple absences. Outlines attendance expectations, makeup work procedures, and weekly check-ins with residential advocate.",
                endDate: null
            },
            {
                id: "ap-004",
                startDate: "2025-02-10",
                planType: "Study Time Plan",
                description: "Structured 45-minute daily study block in the evening. Advocate present during first 15 minutes to ensure youth begins tasks.",
                endDate: null
            }
        ]
    },
    4: { // Miss Piggy - school not applicable
        iepPlans: [],
        academicPlans: []
    }
};

// Mock Section Contributors - tracks who has saved content in each section
const MOCK_SECTION_CONTRIBUTORS = {
    'itp-details': ['Sarah Johnson', 'Dr. Emily Roberts'],
    'schedule': ['Sarah Johnson'],
    'finalization': [],
    'triggers': ['Dr. Emily Roberts', 'Dr. Patricia Williams'],
    'medication': ['Dr. Emily Roberts', 'Nurse Patricia Miller'],
    'physical-health': ['Dr. Emily Roberts'],
    'mental-health': ['Dr. Emily Roberts', 'Dr. Patricia Williams'],
    'substance-use': [],
    'behavioral-concerns': [],
    'family-engagement': [],
    'education': [],
    'independent-living': [],
    'recreation-leisure': [],
    'legal': [],
    'goals-objectives': ['Dr. Emily Roberts', 'Sarah Johnson'],
    'care-planning': [],
    'discharge-aftercare': [],
    'strengths': [],
    'milieu-engagement': [],
    'activities': [],
    'advocate-notes': [],
    'family': []
};

// Mock data - in production this would come from the API based on planId
const MOCK_ITP_DATA = {
    1: {
        id: 1,
        youthName: "Fozzie Bear",
        program: "Mahoney House",
        advocates: ["Sarah Johnson", "Michael Chen"],
        therapists: ["Dr. Emily Roberts", "Dr. Patricia Williams"],
        startDate: "2025-01-06",
        endDate: "2025-04-07",
        status: "Active",
        schedule: {
            carePlanningMeeting: {
                expectedDate: "2025-03-24",
                actualDate: null
            },
            itpDate: {
                expectedDate: "2025-04-07",
                actualDate: null
            },
            completeDate: {
                expectedDate: "2025-04-14",
                actualDate: null
            },
            finalizedDate: {
                expectedDate: "2025-04-21",
                actualDate: null
            }
        }
    },
    2: {
        id: 2,
        youthName: "Kermit the Frog",
        program: "Mahoney House",
        advocates: ["Michael Chen"],
        therapists: ["Dr. Patricia Williams", "Dr. David Anderson"],
        startDate: "2024-12-02",
        endDate: "2025-03-03",
        status: "Finalized",
        schedule: {
            carePlanningMeeting: {
                expectedDate: "2025-02-17",
                actualDate: "2025-02-17"
            },
            itpDate: {
                expectedDate: "2025-03-03",
                actualDate: "2025-03-03"
            },
            completeDate: {
                expectedDate: "2025-03-10",
                actualDate: "2025-03-08"
            },
            finalizedDate: {
                expectedDate: "2025-03-17",
                actualDate: "2025-03-15"
            }
        }
    },
    3: {
        id: 3,
        youthName: "Red Fraggle",
        program: "Mahoney House",
        advocates: ["Jessica Martinez", "Sarah Johnson"],
        therapists: ["Dr. David Anderson"],
        startDate: "2025-01-20",
        endDate: "2025-04-21",
        status: "Draft",
        schedule: {
            carePlanningMeeting: {
                expectedDate: "2025-04-07",
                actualDate: null
            },
            itpDate: {
                expectedDate: "2025-04-21",
                actualDate: null
            },
            completeDate: {
                expectedDate: "2025-04-28",
                actualDate: null
            },
            finalizedDate: {
                expectedDate: "2025-05-05",
                actualDate: null
            }
        }
    },
    4: {
        id: 4,
        youthName: "Miss Piggy",
        program: "Mahoney House",
        advocates: ["Amanda Thompson"],
        therapists: ["Dr. Robert Garcia", "Dr. Emily Roberts"],
        startDate: "2024-11-18",
        endDate: "2025-02-17",
        status: "Complete",
        schedule: {
            carePlanningMeeting: {
                expectedDate: "2025-02-03",
                actualDate: "2025-02-03"
            },
            itpDate: {
                expectedDate: "2025-02-17",
                actualDate: "2025-02-17"
            },
            completeDate: {
                expectedDate: "2025-02-24",
                actualDate: "2025-02-22"
            },
            finalizedDate: {
                expectedDate: "2025-03-03",
                actualDate: null
            }
        }
    }
};

// Section definitions with progress tracking - organized by category
const ITP_SECTION_CATEGORIES = [
    {
        id: 'overview',
        name: 'Overview',
        icon: FileText,
        sections: [
            { id: 'itp-details', name: 'ITP Details', icon: FileText, status: 'complete' },
            { id: 'schedule', name: 'Schedule & Meetings', icon: Calendar, status: 'complete' },
            { id: 'finalization', name: 'Finalization', icon: Lock, status: 'not-started' },
        ]
    },
    {
        id: 'treatment',
        name: 'Treatment & Planning',
        icon: Target,
        sections: [
            { id: 'triggers', name: 'Triggers and Coping Skills', icon: Brain, status: 'complete' },
            { id: 'goals-objectives', name: 'Goals', icon: Flag, status: 'in-progress' },
            { id: 'care-planning', name: 'Care Planning Meeting', icon: Users2, status: 'not-started' },
            { id: 'transition', name: 'Transition Planning', icon: TrendingUp, status: 'not-started' },
            { id: 'testing', name: 'Testing & Assessments', icon: FileBarChart, status: 'not-started' },
        ]
    },
    {
        id: 'personal-development',
        name: 'Personal Development',
        icon: Sparkles,
        sections: [
            { id: 'strengths', name: 'Strengths', icon: Sparkles, status: 'complete' },
            { id: 'milieu-engagement', name: 'Milieu Engagement', icon: Activity, status: 'not-started' },
            { id: 'activities', name: 'Activities', icon: Smile, status: 'not-started' },
        ]
    },
    {
        id: 'relationships',
        name: 'Relationships & Support',
        icon: Users2,
        sections: [
            { id: 'advocate-notes', name: 'Advocate Notes', icon: ClipboardList, status: 'in-progress' },
            { id: 'family', name: 'Family', icon: Home, status: 'complete' },
            { id: 'spirituality', name: 'Spirituality', icon: Church, status: 'not-started' },
        ]
    },
    {
        id: 'health',
        name: 'Health & Wellness',
        icon: HeartPulse,
        sections: [
            { id: 'physical-health', name: 'Physical Health', icon: Stethoscope, status: 'complete' },
            { id: 'mental-health', name: 'Mental Health', icon: HeartPulse, status: 'complete' },
            { id: 'medication', name: 'Medication', icon: Pill, status: 'complete' },
            { id: 'trauma', name: 'Trauma', icon: AlertTriangle, status: 'in-progress' },
            { id: 'therapy', name: 'Therapy', icon: MessageCircle, status: 'in-progress' },
            { id: 'substance-use', name: 'Substance Use', icon: Heart, status: 'not-started' },
        ]
    },
    {
        id: 'incidents-legal',
        name: 'Incidents & Legal',
        icon: Shield,
        sections: [
            { id: 'incidents', name: 'Incidents', icon: AlertTriangle, status: 'not-started' },
            { id: 'legal', name: 'Legal Involvement', icon: Gavel, status: 'not-started' },
            { id: 'dcfs-involvement', name: 'DCFS Involvement', icon: Shield, status: 'not-started' },
        ]
    },
    {
        id: 'education',
        name: 'Education & Career',
        icon: GraduationCap,
        sections: [
            { id: 'asp', name: 'ASP', icon: BookOpen, status: 'not-started' },
            { id: 'executive-functions', name: 'Executive Functions', icon: Brain, status: 'not-started' },
            { id: 'career', name: 'Career', icon: Briefcase, status: 'not-started' },
            { id: 'post-secondary', name: 'Post Secondary', icon: GraduationCap, status: 'not-started' },
            { id: 'school', name: 'School', icon: School, status: 'not-started' },
            { id: 'academic-plans', name: 'Education & Career Plans', icon: ClipboardCheck, status: 'not-started' },
        ]
    },
];

type SectionStatus = 'not-started' | 'in-progress' | 'complete';

// Remounts the workspace when the plan/youth id changes so no state (field values, local dates,
// connections, refs) from the previous plan can leak into the next one or be saved under it.
export function EditITPWorkspace(props: { overrideId?: string; onBack?: () => void } = {}) {
    const { id: routeId } = useParams<{ id: string }>();
    const effectiveId = props.overrideId ?? routeId;
    return <EditITPWorkspaceInner key={effectiveId} {...props} />;
}

function EditITPWorkspaceInner({
    overrideId,
    onBack,
}: {
    // When provided (modal usage inside Constituents), this id is used
    // instead of the route param, and onBack is called instead of
    // navigating away. The standalone /itp-module/:id route is unaffected.
    overrideId?: string;
    onBack?: () => void;
} = {}) {
    const { id: routeId } = useParams<{ id: string }>();
    const id = overrideId ?? routeId;
    const navigate = useNavigate();
    const handleBackToItpModule = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/itp-module');
        }
    };
    const [activeSection, setActiveSection] = useState('itp-details');
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['overview']);
    const [isItpFinalized, setIsItpFinalized] = useState(false);
    const [medicationNarrative, setMedicationNarrative] = useState('');
    const [physicalHealthNarrative, setPhysicalHealthNarrative] = useState('');
    const [mentalHealthSupplementalPlansNarrative, setMentalHealthSupplementalPlansNarrative] = useState('');
    const [diagnosticImpressionNarrative, setDiagnosticImpressionNarrative] = useState('');
    const [mentalHealthConnectionsNarrative, setMentalHealthConnectionsNarrative] = useState('');
    
    // Triggers & Coping Skills narrative state
    const [triggersNarrative, setTriggersNarrative] = useState('');
    const [copingSkillsNarrative, setCopingSkillsNarrative] = useState('');
    
    // Goals & Objectives narrative state
    const [goalsAchievedNarrative, setGoalsAchievedNarrative] = useState('');
    const [goalsDiscontinuedNarrative, setGoalsDiscontinuedNarrative] = useState('');
    const [goalsOpenNarrative, setGoalsOpenNarrative] = useState('');
    
    // Goals Generate Summary modal state
    const [showAchievedGoalsModal, setShowAchievedGoalsModal] = useState(false);
    const [showDiscontinuedGoalsModal, setShowDiscontinuedGoalsModal] = useState(false);
    const [showOpenGoalsModal, setShowOpenGoalsModal] = useState(false);
    const [selectedGoalsForSummary, setSelectedGoalsForSummary] = useState<string[]>([]);

    // Care Planning Meeting connection state
    const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);
    const [connections, setConnections] = useState<Connection[]>(() => (getItpConnections(id)?.connections as Connection[] | undefined) ?? []);
    const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
    const nextParticipantIdRef = useRef(getItpConnections(id)?.nextParticipantId ?? 1);
    const getNextParticipantId = () => nextParticipantIdRef.current++;

    // Care Planning Meeting narrative state
    const [carePlanningMeetingNarrative, setCarePlanningMeetingNarrative] = useState('');
    
    // Transition Planning narrative state
    const [transitionPlanningNarrative, setTransitionPlanningNarrative] = useState('');
    
    // Transition Planning - Select Domains modal state
    const [showSelectDomainsModal, setShowSelectDomainsModal] = useState(false);
    const [selectedDomainsForModal, setSelectedDomainsForModal] = useState<string[]>([]);
    const [communityLaunchPlanData, setCommunityLaunchPlanData] = useState<any[]>([]);
    
    // Strengths narrative state
    const [strengthsNarrative, setStrengthsNarrative] = useState('');
    
    // Strengths selection modal state
    const [isSelectStrengthsModalOpen, setIsSelectStrengthsModalOpen] = useState(false);
    const [selectedStrengthIds, setSelectedStrengthIds] = useState<string[]>([]);
    
    // Prior ITPs modal state
    const [isPriorITPsModalOpen, setIsPriorITPsModalOpen] = useState(false);
    
    // Milieu Engagement narrative state
    const [milieuSupplementalPlansNarrative, setMilieuSupplementalPlansNarrative] = useState('');
    const [milieuMeetingsNarrative, setMilieuMeetingsNarrative] = useState('');
    const [hygieneCleanlinessNarrative, setHygieneCleanlinessNarrative] = useState('');
    const [dailyRoutinesNarrative, setDailyRoutinesNarrative] = useState('');
    const [relationshipsWithPeersNarrative, setRelationshipsWithPeersNarrative] = useState('');
    const [relationshipsWithStaffNarrative, setRelationshipsWithStaffNarrative] = useState('');
    
    // Activities narrative state
    const [activitiesNarrative, setActivitiesNarrative] = useState('');
    
    // Advocate Notes narrative state
    const [advocateNotesNarrative, setAdvocateNotesNarrative] = useState('');
    
    // Family section narrative states
    const [familyInvolvementNarrative, setFamilyInvolvementNarrative] = useState('');
    const [whoLivesInFamilyHomeNarrative, setWhoLivesInFamilyHomeNarrative] = useState('');
    const [familySystemChangesNarrative, setFamilySystemChangesNarrative] = useState('');
    
    // Spirituality section narrative state
    const [spiritualityNarrative, setSpiritualityNarrative] = useState('');
    
    // Trauma section narrative state
    const [traumaNarrative, setTraumaNarrative] = useState('');
    const [selectedTraumaIds, setSelectedTraumaIds] = useState<string[]>([]);
    const [showSelectTraumaModal, setShowSelectTraumaModal] = useState(false);
    const [tempSelectedTraumaIds, setTempSelectedTraumaIds] = useState<string[]>([]);
    
    // Triggers & Coping Skills modal states
    const [isSelectTriggersModalOpen, setIsSelectTriggersModalOpen] = useState(false);
    const [isSelectCopingSkillsModalOpen, setIsSelectCopingSkillsModalOpen] = useState(false);
    const [selectedTriggersList, setSelectedTriggersList] = useState<string[]>([]);
    const [selectedCopingSkillsList, setSelectedCopingSkillsList] = useState<string[]>([]);
    
    // Therapy section narrative state
    const [individualTherapyNarrative, setIndividualTherapyNarrative] = useState('');
    const [familyTherapyNarrative, setFamilyTherapyNarrative] = useState('');
    const [groupTherapyNarrative, setGroupTherapyNarrative] = useState('');
    
    // Substance Use section narrative state
    const [substanceUseNarrative, setSubstanceUseNarrative] = useState('');

    // IDs of existing Substance Use records associated with this ITP (seeded from
    // mock "already associated" data below). Associating a record never creates,
    // edits, or deletes it.
    const [associatedSubstanceUseTestingIds, setAssociatedSubstanceUseTestingIds] = useState<string[]>(
        MOCK_ASSOCIATED_SUBSTANCE_USE_TESTING_IDS[Number(id) as keyof typeof MOCK_ASSOCIATED_SUBSTANCE_USE_TESTING_IDS] || []
    );
    const [associatedSubstanceUseDisclosureIds, setAssociatedSubstanceUseDisclosureIds] = useState<string[]>(
        MOCK_ASSOCIATED_SUBSTANCE_USE_DISCLOSURE_IDS[Number(id) as keyof typeof MOCK_ASSOCIATED_SUBSTANCE_USE_DISCLOSURE_IDS] || []
    );
    const [associatedSubstanceUseAssessmentIds, setAssociatedSubstanceUseAssessmentIds] = useState<string[]>(
        MOCK_ASSOCIATED_SUBSTANCE_USE_ASSESSMENT_IDS[Number(id) as keyof typeof MOCK_ASSOCIATED_SUBSTANCE_USE_ASSESSMENT_IDS] || []
    );
    const [associatedSubstanceUseSupplementalPlanIds, setAssociatedSubstanceUseSupplementalPlanIds] = useState<string[]>(
        MOCK_ASSOCIATED_SUBSTANCE_USE_SUPPLEMENTAL_PLAN_IDS[Number(id) as keyof typeof MOCK_ASSOCIATED_SUBSTANCE_USE_SUPPLEMENTAL_PLAN_IDS] || []
    );

    // Substance Use "View Details" (read-only) dialog state — clicking a row's
    // date opens the existing record's details; it never edits the record.
    const [viewingSubstanceUseTest, setViewingSubstanceUseTest] = useState<typeof MOCK_ALL_SUBSTANCE_USE_TESTING[1][number] | null>(null);
    const [viewingSubstanceUseDisclosure, setViewingSubstanceUseDisclosure] = useState<typeof MOCK_ALL_SUBSTANCE_USE_DISCLOSURES[1][number] | null>(null);
    const [viewingSubstanceUseAssessment, setViewingSubstanceUseAssessment] = useState<SubstanceUseAssessmentConnection | null>(null);
    const [viewingSubstanceUseSupplementalPlan, setViewingSubstanceUseSupplementalPlan] = useState<typeof MOCK_ALL_SUBSTANCE_USE_SUPPLEMENTAL_PLANS[1][number] | null>(null);
    
    // Incidents section narrative state
    const [incidentsNarrative, setIncidentsNarrative] = useState('');
    
    // Legal Involvement section narrative state
    const [legalInvolvementNarrative, setLegalInvolvementNarrative] = useState('');
    
    // Legal Involvement Generate Summary modal state
    const [showLegalInvolvementModal, setShowLegalInvolvementModal] = useState(false);
    const [selectedLegalRecords, setSelectedLegalRecords] = useState<string[]>([]);
    
    // DCFS Involvement section narrative state
    const [dcfsInvolvementNarrative, setDcfsInvolvementNarrative] = useState('');
    
    // Testing & Assessments section narrative state
    const [testingAssessmentsNarrative, setTestingAssessmentsNarrative] = useState('');
    const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
    const [showSelectTestsModal, setShowSelectTestsModal] = useState(false);
    const [tempSelectedTestIds, setTempSelectedTestIds] = useState<string[]>([]);
    
    // ASP section narrative state
    const [aspNarrative, setAspNarrative] = useState('');
    
    // Executive Functions section narrative state
    const [executiveFunctionsNarrative, setExecutiveFunctionsNarrative] = useState('');
    
    // Career section narrative state
    const [careerPlanningNarrative, setCareerPlanningNarrative] = useState('');

    // Post Secondary section narrative state
    const [postSecondaryNarrative, setPostSecondaryNarrative] = useState('');

    // School section narrative state
    const [schoolPerformanceNarrative, setSchoolPerformanceNarrative] = useState('');
    const [schoolTutoringNarrative, setSchoolTutoringNarrative] = useState('');

    // Academic Plans section narrative state
    const [iepPlansNarrative, setIepPlansNarrative] = useState('');
    const [academicPlansNarrative, setAcademicPlansNarrative] = useState('');

    // ITP Lifecycle Status
    const [itpLifecycleStatus, setItpLifecycleStatus] = useState<'New' | 'In Progress' | 'Complete' | 'Ready for Review' | 'Finalized'>('New');
    const [sectionSavedAt, setSectionSavedAt] = useState<{[key: string]: string}>(() => getItpSectionProgress(id)?.savedAt ?? {});

    // Section status and contributors state
    const [sectionStatus, setSectionStatus] = useState<{[key: string]: 'Not Started' | 'In Progress' | 'Complete'}>(() => getItpSectionProgress(id)?.status ?? {
        'itp-details': 'In Progress',
        'schedule': 'In Progress',
        'finalization': 'Not Started',
        'triggers': 'In Progress',
        'medication': 'In Progress',
        'physical-health': 'In Progress',
        'mental-health': 'In Progress',
        'substance-use': 'Not Started',
        'incidents': 'Not Started',
        'behavioral-concerns': 'Not Started',
        'family-engagement': 'Not Started',
        'education': 'Not Started',
        'independent-living': 'Not Started',
        'recreation-leisure': 'Not Started',
        'legal': 'Not Started',
        'dcfs-involvement': 'Not Started',
        'goals-objectives': 'In Progress',
        'care-planning': 'Not Started',
        'transition': 'Not Started',
        'discharge-aftercare': 'Not Started',
        'strengths': 'Not Started',
        'milieu-engagement': 'Not Started',
        'activities': 'Not Started',
        'advocate-notes': 'Not Started',
        'family': 'Not Started',
        'spirituality': 'Not Started',
        'trauma': 'Not Started',
        'therapy': 'Not Started',
        'asp': 'Not Started',
        'executive-functions': 'Not Started',
        'career': 'Not Started',
        'post-secondary': 'Not Started',
        'school': 'Not Started',
        'academic-plans': 'Not Started'
    });
    
    const [sectionContributors, setSectionContributors] = useState<{[key: string]: string[]}>(() => getItpSectionProgress(id)?.contributors ?? MOCK_SECTION_CONTRIBUTORS);

    // Get ITP data
    const itpData = MOCK_ITP_DATA[Number(id) as keyof typeof MOCK_ITP_DATA];

    // ITP Details Start/End dates (edited in Sections A; lifted here so they snapshot/rehydrate with the section).
    const [itpStartDate, setItpStartDate] = useState<string | undefined>(itpData?.startDate);
    const [itpEndDate, setItpEndDate] = useState<string | undefined>(itpData?.endDate);

    // Persist connection records (written by the connection dialog's own Save) for this ITP.
    useEffect(() => {
        writeItpConnections(id, { connections, nextParticipantId: nextParticipantIdRef.current });
    }, [connections]);
    
    // Get medication data for current youth
    const medicationRecords = MOCK_MEDICATION_DATA[Number(id) as keyof typeof MOCK_MEDICATION_DATA] || [];
    
    // Calculate total missed doses
    const totalMissedDoses = medicationRecords.reduce((sum, med) => sum + med.missedDoses, 0);

    // Get physical health data for current youth
    const physicalHealthData = MOCK_PHYSICAL_HEALTH_DATA[Number(id) as keyof typeof MOCK_PHYSICAL_HEALTH_DATA] || {
        currentMedicalNeeds: [],
        medicalConnections: [],
        keyMedicalDates: {
            lastAnnualPhysical: null,
            lastBiennialDental: null,
            lastHearing: null,
            lastVision: null,
            behavior: null
        },
        cpiHolds: []
    };

    // Get mental health data for current youth
    const mentalHealthData = MOCK_MENTAL_HEALTH_DATA[Number(id) as keyof typeof MOCK_MENTAL_HEALTH_DATA] || {
        supplementalPlans: [],
        diagnosticImpression: [],
        mentalHealthConnections: []
    };

    // Get Triggers and Coping Skills data for current youth
    const triggersData = MOCK_TRIGGERS_DATA[Number(id) as keyof typeof MOCK_TRIGGERS_DATA] || [];
    const copingSkillsData = MOCK_COPING_SKILLS_DATA[Number(id) as keyof typeof MOCK_COPING_SKILLS_DATA] || [];

    // Get PTP Statements data for current youth
    const ptpStatementsData = MOCK_PTP_STATEMENTS_DATA[Number(id) as keyof typeof MOCK_PTP_STATEMENTS_DATA] || [];
    
    // Get Goals data for current youth
    const goalsData = MOCK_GOALS_DATA[Number(id) as keyof typeof MOCK_GOALS_DATA] || [];
    
    // Filter Goals by status
    const achievedGoals = goalsData.filter(g => g.status === 'Achieved');
    const discontinuedGoals = goalsData.filter(g => g.status === 'Discontinued');
    const openGoals = goalsData.filter(g => g.status === 'In Progress');

    // Get Care Planning Meeting data for current youth
    const carePlanningMeetingData = MOCK_CARE_PLANNING_MEETING_DATA[Number(id) as keyof typeof MOCK_CARE_PLANNING_MEETING_DATA] || [];

    // Get Transition Planning data for current youth
    const transitionPlanningData = MOCK_TRANSITION_PLANNING_DATA[Number(id) as keyof typeof MOCK_TRANSITION_PLANNING_DATA] || {
        programEnrollment: [],
        communityLaunchPlan: []
    };
    
    // Initialize community launch plan data when transitionPlanningData is available
    useEffect(() => {
        if (getItpSectionProgress(id)?.fields?.['transition']?.communityLaunchPlanData !== undefined) return; // saved snapshot wins over the mock seed
        if (transitionPlanningData.communityLaunchPlan.length > 0 && communityLaunchPlanData.length === 0) {
            setCommunityLaunchPlanData(transitionPlanningData.communityLaunchPlan);
            setSelectedDomainsForModal(transitionPlanningData.communityLaunchPlan.map(d => d.id));
        }
    }, [transitionPlanningData.communityLaunchPlan]);

    // Get Prior ITPs data for current youth
    const priorITPsData = MOCK_PRIOR_ITPS[Number(id) as keyof typeof MOCK_PRIOR_ITPS] || [];
    
    // Get Strengths data for current youth
    const allStrengthsData = MOCK_STRENGTHS_DATA[Number(id) as keyof typeof MOCK_STRENGTHS_DATA] || [];
    
    // Initialize selected strengths with all strengths on first load
    useEffect(() => {
        if (getItpSectionProgress(id)?.fields?.['strengths']?.selectedStrengthIds !== undefined) return; // saved selection wins over the seed
        if (allStrengthsData.length > 0 && selectedStrengthIds.length === 0) {
            setSelectedStrengthIds(allStrengthsData.map(s => s.id));
        }
    }, [id]); // Only run when youth ID changes
    
    // Filter to show only selected strengths (or all if none selected yet)
    const strengthsData = selectedStrengthIds.length > 0 
        ? allStrengthsData.filter(s => selectedStrengthIds.includes(s.id))
        : allStrengthsData;
    
    // Get Milieu Engagement data for current youth
    const milieuSupplementalPlansData = MOCK_MILIEU_SUPPLEMENTAL_PLANS_DATA[Number(id) as keyof typeof MOCK_MILIEU_SUPPLEMENTAL_PLANS_DATA] || [];
    const milieuMeetingsData = MOCK_MILIEU_MEETINGS_DATA[Number(id) as keyof typeof MOCK_MILIEU_MEETINGS_DATA] || [];
    const communityServiceData = MOCK_COMMUNITY_SERVICE_DATA[Number(id) as keyof typeof MOCK_COMMUNITY_SERVICE_DATA] || [];
    
    // Calculate Milieu Engagement metrics
    const milieuMeetingsAttended = milieuMeetingsData.filter(m => m.connectionType === 'Milieu Meeting' && m.attended === 'Yes').length;
    const milieuMeetingsExpected = milieuMeetingsData.filter(m => m.connectionType === 'Milieu Meeting').length;
    const otherMilieuMeetingsAttended = milieuMeetingsData.filter(m => m.connectionType !== 'Milieu Meeting' && m.attended === 'Yes').length;
    const otherMilieuMeetingsExpected = milieuMeetingsData.filter(m => m.connectionType !== 'Milieu Meeting').length;
    
    // Calculate Community Service metrics
    const totalCommunityServiceHours = communityServiceData
        .filter(cs => cs.attended === 'Yes')
        .reduce((total, cs) => total + cs.durationHours, 0);
    const communityServiceActivitiesAttended = communityServiceData.filter(cs => cs.attended === 'Yes').length;
    
    // Get Activity Participation data for current youth
    const activityParticipationData = MOCK_ACTIVITY_PARTICIPATION_DATA[Number(id) as keyof typeof MOCK_ACTIVITY_PARTICIPATION_DATA] || [];
    
    // Calculate Activity Participation metrics
    const activitiesRegisteredFor = activityParticipationData.filter(a => a.registered === 'Yes').length;
    const activitiesAttended = activityParticipationData.filter(a => a.attended === 'Yes').length;
    
    // Get Advocate Meetings data for current youth
    const advocateMeetingsData = MOCK_ADVOCATE_MEETINGS_DATA[Number(id) as keyof typeof MOCK_ADVOCATE_MEETINGS_DATA] || [];

    // Calculate ITP period in weeks
    const calculateITPWeeks = () => {
        if (!itpData) return 0;
        const start = new Date(itpData.startDate);
        const end = new Date(itpData.endDate);
        const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return Math.ceil(totalDays / 7);
    };
    const itpWeeks = calculateITPWeeks();

    // Calculate Advocate Meeting metrics
    const advocateMeetingsPlanned = itpWeeks; // 1 meeting per week
    const advocateMeetingsScheduled = advocateMeetingsData.length; // Previously "Expected" - total scheduled
    const advocateMeetingsAttended = advocateMeetingsData.filter(m => m.attended === 'Yes').length;
    
    // Get Family section data for current youth
    const parentFamilyContactsData = MOCK_PARENT_FAMILY_CONTACTS_DATA[Number(id) as keyof typeof MOCK_PARENT_FAMILY_CONTACTS_DATA] || [];
    const familyVisitsData = MOCK_FAMILY_VISITS_DATA[Number(id) as keyof typeof MOCK_FAMILY_VISITS_DATA] || [];
    const passesData = MOCK_PASSES_DATA[Number(id) as keyof typeof MOCK_PASSES_DATA] || [];
    const familyActivitiesData = MOCK_FAMILY_ACTIVITIES_DATA[Number(id) as keyof typeof MOCK_FAMILY_ACTIVITIES_DATA] || [];
    
    // Calculate Family section metrics
    // Parent/Family Contacts metrics
    const parentFamilyContactsExpected = parentFamilyContactsData.length; // Logic TBD
    const parentFamilyContactsAttended = parentFamilyContactsData.length; // All listed contacts are attended
    const homeVisitsCount = 0; // Would be calculated from Connection records marked as "Home Visit"
    
    // Family Visits metric
    const numberOfFamilyVisits = familyVisitsData.length;
    
    // Passes metrics
    const passesPlanned = passesData.length; // Logic TBD
    const passesOccurred = passesData.filter(p => p.cancelled === 'No').length;
    
    // Get Spirituality section data for current youth
    const spiritualDevClassesData = MOCK_SPIRITUAL_DEV_CLASSES_DATA[Number(id) as keyof typeof MOCK_SPIRITUAL_DEV_CLASSES_DATA] || [];
    const spiritualDevConnectionsData = MOCK_SPIRITUAL_DEV_CONNECTIONS_DATA[Number(id) as keyof typeof MOCK_SPIRITUAL_DEV_CONNECTIONS_DATA] || [];
    
    // Get Trauma section data for current youth
    const allTraumaData = MOCK_TRAUMA_DATA[Number(id) as keyof typeof MOCK_TRAUMA_DATA] || [];
    
    // Initialize selected trauma with all trauma on first load
    useEffect(() => {
        if (getItpSectionProgress(id)?.fields?.['trauma']?.selectedTraumaIds !== undefined) return; // saved selection wins over the seed
        if (allTraumaData.length > 0 && selectedTraumaIds.length === 0) {
            setSelectedTraumaIds(allTraumaData.map(t => t.id));
        }
    }, [id]); // Only run when youth ID changes
    
    // Filter to show only selected trauma (or all if none selected yet)
    const traumaData = selectedTraumaIds.length > 0
        ? allTraumaData.filter(t => selectedTraumaIds.includes(t.id))
        : allTraumaData;
    
    // Handler for Select Trauma modal
    const handleOpenSelectTrauma = () => {
        setShowSelectTraumaModal(true);
        // Pre-populate with currently selected trauma
        setTempSelectedTraumaIds(selectedTraumaIds);
    };
    
    const handleCloseSelectTraumaModal = () => {
        setShowSelectTraumaModal(false);
    };
    
    const handleToggleTraumaSelection = (traumaId: string) => {
        setTempSelectedTraumaIds(prev => 
            prev.includes(traumaId)
                ? prev.filter(id => id !== traumaId)
                : [...prev, traumaId]
        );
    };
    
    const handleConfirmTraumaSelection = () => {
        setSelectedTraumaIds(tempSelectedTraumaIds);
        setShowSelectTraumaModal(false);
        toast.success(`${tempSelectedTraumaIds.length} trauma record(s) selected for this ITP`);
    };
    
    // Handlers for Select Domains modal (Transition Planning)
    const handleOpenSelectDomainsModal = () => {
        setShowSelectDomainsModal(true);
        // Pre-populate with currently displayed domains
        setSelectedDomainsForModal(communityLaunchPlanData.map(d => d.id));
    };
    
    const handleCloseSelectDomainsModal = () => {
        setShowSelectDomainsModal(false);
    };
    
    const handleToggleDomainSelection = (domainId: string) => {
        setSelectedDomainsForModal(prev => 
            prev.includes(domainId)
                ? prev.filter(id => id !== domainId)
                : [...prev, domainId]
        );
    };
    
    const handleAddDomains = () => {
        // Filter transition planning data to show only selected domains
        const newDomainData = transitionPlanningData.communityLaunchPlan.filter(d => 
            selectedDomainsForModal.includes(d.id)
        );
        setCommunityLaunchPlanData(newDomainData);
        setShowSelectDomainsModal(false);
        toast.success(`${selectedDomainsForModal.length} domain(s) added to Community Launch Plan`);
    };
    
    const handleDeleteDomain = (domainId: string) => {
        setCommunityLaunchPlanData(prev => prev.filter(d => d.id !== domainId));
        setSelectedDomainsForModal(prev => prev.filter(id => id !== domainId));
        toast.success("Domain removed from Community Launch Plan");
    };
    
    // Handlers for Select Triggers modal
    const handleOpenSelectTriggersModal = () => {
        setIsSelectTriggersModalOpen(true);
        // Pre-populate with currently displayed triggers
        setSelectedTriggersList(triggersData.map(t => t.id));
    };
    
    const handleCloseSelectTriggersModal = () => {
        setIsSelectTriggersModalOpen(false);
    };
    
    const handleDeleteTrigger = (triggerId: string) => {
        toast.success('Trigger removed from this ITP period');
        // In production, this would update the backend
    };
    
    // Handlers for Select Coping Skills modal
    const handleOpenSelectCopingSkillsModal = () => {
        setIsSelectCopingSkillsModalOpen(true);
        // Pre-populate with currently displayed coping skills
        setSelectedCopingSkillsList(copingSkillsData.map(cs => cs.id));
    };
    
    const handleCloseSelectCopingSkillsModal = () => {
        setIsSelectCopingSkillsModalOpen(false);
    };
    
    const handleDeleteCopingSkill = (copingSkillId: string) => {
        toast.success('Coping skill removed from this ITP period');
        // In production, this would update the backend
    };
    
    // Handler for viewing an existing Substance Use Test's read-only details
    const handleViewSubstanceUseTest = (test: typeof MOCK_ALL_SUBSTANCE_USE_TESTING[1][number]) => {
        setViewingSubstanceUseTest(test);
    };

    // Handler for viewing an existing Disclosure's read-only details
    const handleViewSubstanceUseDisclosure = (disclosure: typeof MOCK_ALL_SUBSTANCE_USE_DISCLOSURES[1][number]) => {
        setViewingSubstanceUseDisclosure(disclosure);
    };

    // Handler for viewing an existing Assessment connection's read-only details
    const handleViewSubstanceUseAssessment = (assessment: SubstanceUseAssessmentConnection) => {
        setViewingSubstanceUseAssessment(assessment);
    };

    // Handler for viewing an existing Supplemental Plan's read-only details
    const handleViewSubstanceUseSupplementalPlan = (plan: typeof MOCK_ALL_SUBSTANCE_USE_SUPPLEMENTAL_PLANS[1][number]) => {
        setViewingSubstanceUseSupplementalPlan(plan);
    };
    
    // Get Therapy section data for current youth
    const individualTherapySessionsData = MOCK_INDIVIDUAL_THERAPY_SESSIONS[Number(id) as keyof typeof MOCK_INDIVIDUAL_THERAPY_SESSIONS] || [];
    const familyTherapySessionsData = MOCK_FAMILY_THERAPY_SESSIONS[Number(id) as keyof typeof MOCK_FAMILY_THERAPY_SESSIONS] || [];
    const groupTherapySessionsData = MOCK_GROUP_THERAPY_SESSIONS[Number(id) as keyof typeof MOCK_GROUP_THERAPY_SESSIONS] || [];

    // Calculate Individual Therapy Session Metrics
    const individualTherapySessionsPlanned = itpWeeks; // 1 session per week
    const individualTherapySessionsScheduled = individualTherapySessionsData.length; // Previously "Expected"
    const individualTherapySessionsAttended = individualTherapySessionsData.filter(session => session.attendance === 'Yes').length;

    // Calculate Family Therapy Session Metrics
    const familyTherapySessionsPlanned = itpWeeks; // 1 session per week
    const familyTherapySessionsScheduled = familyTherapySessionsData.length; // Previously "Expected"
    const familyTherapySessionsAttended = familyTherapySessionsData.filter(session => session.attendance === 'Yes').length;

    // Calculate Group Therapy Session Metrics
    const groupTherapySessionsPlanned = itpWeeks; // 1 session per week
    const groupTherapySessionsScheduled = groupTherapySessionsData.length; // Previously "Expected"
    const groupTherapySessionsAttended = groupTherapySessionsData.filter(session => session.attendance === 'Yes').length;
    
    // Get Substance Use section data for current youth, scoped to the current ITP's
    // date range. Each category is derived in three tiers:
    //  - all...Data: the youth's full record set (source of truth, never mutated here)
    //  - eligible...Data: records whose date falls within this ITP's date range
    //  - substanceUse...Data: the eligible records already associated with this ITP (shown in the read-only table)
    const itpDateRangeStart = itpData?.startDate ?? '';
    const itpDateRangeEnd = itpData?.endDate ?? '';

    const allSubstanceUseTestingData = MOCK_ALL_SUBSTANCE_USE_TESTING[Number(id) as keyof typeof MOCK_ALL_SUBSTANCE_USE_TESTING] || [];
    const eligibleSubstanceUseTestingData = allSubstanceUseTestingData.filter(test =>
        isWithinItpDateRange(test.dateTime, itpDateRangeStart, itpDateRangeEnd)
    );
    const substanceUseTestingData = eligibleSubstanceUseTestingData.filter(test => associatedSubstanceUseTestingIds.includes(test.id));

    const allSubstanceUseDisclosuresData = MOCK_ALL_SUBSTANCE_USE_DISCLOSURES[Number(id) as keyof typeof MOCK_ALL_SUBSTANCE_USE_DISCLOSURES] || [];
    const eligibleSubstanceUseDisclosuresData = allSubstanceUseDisclosuresData.filter(disclosure =>
        isWithinItpDateRange(disclosure.dateTime, itpDateRangeStart, itpDateRangeEnd)
    );
    const substanceUseDisclosuresData = eligibleSubstanceUseDisclosuresData.filter(d => associatedSubstanceUseDisclosureIds.includes(d.id));

    // Mandatory filter (per ticket 18472): only Connections of type "Integrated
    // Substance Use Assessment" whose Connection End Date falls within the
    // current ITP's date range are eligible to appear/be added here.
    const allSubstanceUseAssessmentConnectionsData = MOCK_SUBSTANCE_USE_ASSESSMENT_CONNECTIONS[Number(id)] || [];
    const eligibleSubstanceUseAssessmentsData = allSubstanceUseAssessmentConnectionsData.filter(connection =>
        connection.type === 'Integrated Substance Use Assessment' &&
        isWithinItpDateRange(connection.endDate, itpDateRangeStart, itpDateRangeEnd)
    );
    const substanceUseAssessmentsData = eligibleSubstanceUseAssessmentsData.filter(a => associatedSubstanceUseAssessmentIds.includes(a.id));

    const allSubstanceUseSupplementalPlansData = MOCK_ALL_SUBSTANCE_USE_SUPPLEMENTAL_PLANS[Number(id) as keyof typeof MOCK_ALL_SUBSTANCE_USE_SUPPLEMENTAL_PLANS] || [];
    const eligibleSubstanceUseSupplementalPlansData = allSubstanceUseSupplementalPlansData.filter(plan =>
        overlapsItpDateRange(plan.startDate, plan.endDate, itpDateRangeStart, itpDateRangeEnd)
    );
    const substanceUseSupplementalPlansData = eligibleSubstanceUseSupplementalPlansData.filter(p => associatedSubstanceUseSupplementalPlanIds.includes(p.id));

    // Get Incidents data for current youth
    const incidentsData = MOCK_INCIDENTS[Number(id) as keyof typeof MOCK_INCIDENTS] || [];
    
    // Calculate Incident Metrics
    const numberOfIncidents = incidentsData.length;
    const numberOfIncidentsWithRestraint = incidentsData.filter(incident => incident.restraintOccurred === 'Yes').length;
    // For total number of holds, we'll count each incident with restraint as having at least 1 hold
    // In a real system, this would come from the actual hold records linked to incidents
    const totalNumberOfHolds = incidentsData.filter(incident => incident.restraintOccurred === 'Yes').reduce((total, incident) => {
        // Simulate: incidents with "Multiple" in overview have 2 holds, others have 1
        return total + (incident.overview.includes('Multiple') || incident.overview.includes('multiple') ? 2 : 1);
    }, 0);
    
    // Calculate Length of Stay (Program Move In Date to ITP period end date)
    const calculateLengthOfStay = () => {
        if (transitionPlanningData.programEnrollment.length === 0 || !itpData.endDate) return 0;
        
        // Get most recent program with null moveOutDate (current program)
        const currentProgram = transitionPlanningData.programEnrollment.find(p => !p.moveOutDate);
        if (!currentProgram) return 0;
        
        const moveInDate = new Date(currentProgram.moveInDate);
        const itpEndDate = new Date(itpData.endDate);
        
        // Calculate difference in months
        const yearsDiff = itpEndDate.getFullYear() - moveInDate.getFullYear();
        const monthsDiff = itpEndDate.getMonth() - moveInDate.getMonth();
        const totalMonths = yearsDiff * 12 + monthsDiff;
        
        return totalMonths > 0 ? totalMonths : 0;
    };
    
    const lengthOfStayMonths = calculateLengthOfStay();
    
    // Get Legal Involvement data for current youth
    const legalInvolvementData = MOCK_LEGAL_INVOLVEMENT[Number(id) as keyof typeof MOCK_LEGAL_INVOLVEMENT] || [];
    
    // Get DCFS Involvement data for current youth
    const dcfsInvolvementData = MOCK_DCFS_INVOLVEMENT[Number(id) as keyof typeof MOCK_DCFS_INVOLVEMENT] || [];
    
    // Get Testing & Assessments data for current youth
    const allTestingAssessmentsData = MOCK_TESTING_ASSESSMENTS_DATA[Number(id) as keyof typeof MOCK_TESTING_ASSESSMENTS_DATA] || [];
    
    // Filter to show only selected tests (or empty if none selected yet)
    const testingAssessmentsData = selectedTestIds.length > 0
        ? allTestingAssessmentsData.filter(t => selectedTestIds.includes(t.id))
        : [];
    
    // Get ASP Participation data for current youth
    const aspParticipationData = MOCK_ASP_PARTICIPATION[Number(id) as keyof typeof MOCK_ASP_PARTICIPATION] || [];
    
    // Get Executive Functions data for current youth
    const executiveFunctionsData = MOCK_EXECUTIVE_FUNCTIONS[Number(id) as keyof typeof MOCK_EXECUTIVE_FUNCTIONS] || {
        participationSummary: {
            classSessionsScheduled: 0,
            classSessionsAttended: 0,
            averageEngagementLevel: 0,
            averageSessionScore: 0
        },
        learningModules: [],
        organizationalSystems: []
    };

    // Get Career data for current youth
    const careerDataForYouth = MOCK_CAREER_DATA[Number(id) as keyof typeof MOCK_CAREER_DATA] || {
        employment: [],
        learningModules: [],
        classParticipation: [],
        financialLiteracy: [],
        driversEducation: [],
        careerConnections: []
    };
    const careerEmploymentData = careerDataForYouth.employment;
    const careerLearningModulesData = careerDataForYouth.learningModules;
    const careerClassParticipationData = careerDataForYouth.classParticipation;
    const careerFinancialLiteracyData = careerDataForYouth.financialLiteracy;
    const careerDriversEducationData = careerDataForYouth.driversEducation;
    const careerConnectionsData = careerDataForYouth.careerConnections;

    // Get Post Secondary data for current youth
    const postSecondaryDataForYouth = MOCK_POST_SECONDARY_DATA[Number(id) as keyof typeof MOCK_POST_SECONDARY_DATA] || {
        psoEnrollment: [],
        classParticipation: [],
        credentials: [],
        psConnections: []
    };
    const psoEnrollmentData = postSecondaryDataForYouth.psoEnrollment;
    const psClassParticipationData = postSecondaryDataForYouth.classParticipation;
    const psCredentialsData = postSecondaryDataForYouth.credentials;
    const psConnectionsData = postSecondaryDataForYouth.psConnections;

    // Get School data for current youth
    const schoolDataForYouth = MOCK_SCHOOL_DATA[Number(id) as keyof typeof MOCK_SCHOOL_DATA] || {
        reportCards: [],
        courseGrades: [],
        courseEnrollments: [],
        schoolIncidents: [],
        schoolConnections: [],
        tutorSessions: []
    };
    const reportCardsData = schoolDataForYouth.reportCards;
    const courseGradesData = schoolDataForYouth.courseGrades;
    const courseEnrollmentsData = schoolDataForYouth.courseEnrollments;
    const schoolIncidentsData = schoolDataForYouth.schoolIncidents;
    const schoolConnectionsData = schoolDataForYouth.schoolConnections;
    const tutorSessionsData = schoolDataForYouth.tutorSessions;

    // Get Academic Plans data for current youth
    const academicPlansDataForYouth = MOCK_ACADEMIC_PLANS_DATA[Number(id) as keyof typeof MOCK_ACADEMIC_PLANS_DATA] || {
        iepPlans: [],
        academicPlans: []
    };
    const iepPlansData = academicPlansDataForYouth.iepPlans;
    const academicPlansRecordsData = academicPlansDataForYouth.academicPlans;

    if (!itpData) {
        return (
            <div className="h-full flex items-center justify-center" style={{ backgroundColor: 'var(--slds-g-color-background-alt-2)' }}>
                <Card style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                    <CardContent className="p-8 text-center">
                        <p className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            ITP Plan not found
                        </p>
                        <Button
                            onClick={handleBackToItpModule}
                            className="mt-4"
                            size="sm"
                            variant="outline"
                        >
                            Back to ITP Module
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Auto-update ITP lifecycle status based on section statuses (AC2 & AC3)
    useEffect(() => {
        // Don't auto-update if already Finalized or Ready for Review
        if (itpLifecycleStatus === 'Finalized' || itpLifecycleStatus === 'Ready for Review') {
            return;
        }

        const sectionIds = Object.keys(sectionStatus).filter(id => id !== 'finalization');
        const allNotStarted = sectionIds.every(id => sectionStatus[id] === 'Not Started');
        const allComplete = sectionIds.every(id => sectionStatus[id] === 'Complete');
        const anyInProgress = sectionIds.some(id => sectionStatus[id] === 'In Progress' || sectionStatus[id] === 'Complete');

        if (allNotStarted) {
            // AC1: All sections not started = New
            setItpLifecycleStatus('New');
        } else if (allComplete) {
            // AC3: All sections complete = Complete
            setItpLifecycleStatus('Complete');
        } else if (anyInProgress) {
            // AC2: At least one section saved = In Progress
            setItpLifecycleStatus('In Progress');
        }
    }, [sectionStatus, itpLifecycleStatus]);

    // Field registry: section id -> { field key: [current value, setter] }. Save/Complete snapshots only the
    // saved section's entries into the session store; they are rehydrated on mount (other sections untouched).
    const sectionFieldRegistry: Record<string, Record<string, [unknown, (v: any) => void]>> = {
        'itp-details': {
            itpStartDate: [itpStartDate, setItpStartDate],
            itpEndDate: [itpEndDate, setItpEndDate],
        },
        'medication': { medicationNarrative: [medicationNarrative, setMedicationNarrative] },
        'physical-health': { physicalHealthNarrative: [physicalHealthNarrative, setPhysicalHealthNarrative] },
        'mental-health': {
            mentalHealthSupplementalPlansNarrative: [mentalHealthSupplementalPlansNarrative, setMentalHealthSupplementalPlansNarrative],
            diagnosticImpressionNarrative: [diagnosticImpressionNarrative, setDiagnosticImpressionNarrative],
            mentalHealthConnectionsNarrative: [mentalHealthConnectionsNarrative, setMentalHealthConnectionsNarrative],
        },
        'triggers': {
            triggersNarrative: [triggersNarrative, setTriggersNarrative],
            copingSkillsNarrative: [copingSkillsNarrative, setCopingSkillsNarrative],
            selectedTriggersList: [selectedTriggersList, setSelectedTriggersList],
            selectedCopingSkillsList: [selectedCopingSkillsList, setSelectedCopingSkillsList],
        },
        'goals-objectives': {
            goalsAchievedNarrative: [goalsAchievedNarrative, setGoalsAchievedNarrative],
            goalsDiscontinuedNarrative: [goalsDiscontinuedNarrative, setGoalsDiscontinuedNarrative],
            goalsOpenNarrative: [goalsOpenNarrative, setGoalsOpenNarrative],
        },
        'care-planning': { carePlanningMeetingNarrative: [carePlanningMeetingNarrative, setCarePlanningMeetingNarrative] },
        'transition': {
            transitionPlanningNarrative: [transitionPlanningNarrative, setTransitionPlanningNarrative],
            communityLaunchPlanData: [communityLaunchPlanData, setCommunityLaunchPlanData],
        },
        'testing': {
            testingAssessmentsNarrative: [testingAssessmentsNarrative, setTestingAssessmentsNarrative],
            selectedTestIds: [selectedTestIds, setSelectedTestIds],
        },
        'strengths': {
            strengthsNarrative: [strengthsNarrative, setStrengthsNarrative],
            selectedStrengthIds: [selectedStrengthIds, setSelectedStrengthIds],
        },
        'milieu-engagement': {
            milieuSupplementalPlansNarrative: [milieuSupplementalPlansNarrative, setMilieuSupplementalPlansNarrative],
            milieuMeetingsNarrative: [milieuMeetingsNarrative, setMilieuMeetingsNarrative],
            hygieneCleanlinessNarrative: [hygieneCleanlinessNarrative, setHygieneCleanlinessNarrative],
            dailyRoutinesNarrative: [dailyRoutinesNarrative, setDailyRoutinesNarrative],
            relationshipsWithPeersNarrative: [relationshipsWithPeersNarrative, setRelationshipsWithPeersNarrative],
            relationshipsWithStaffNarrative: [relationshipsWithStaffNarrative, setRelationshipsWithStaffNarrative],
        },
        'activities': { activitiesNarrative: [activitiesNarrative, setActivitiesNarrative] },
        'advocate-notes': { advocateNotesNarrative: [advocateNotesNarrative, setAdvocateNotesNarrative] },
        'family': {
            familyInvolvementNarrative: [familyInvolvementNarrative, setFamilyInvolvementNarrative],
            whoLivesInFamilyHomeNarrative: [whoLivesInFamilyHomeNarrative, setWhoLivesInFamilyHomeNarrative],
            familySystemChangesNarrative: [familySystemChangesNarrative, setFamilySystemChangesNarrative],
        },
        'spirituality': { spiritualityNarrative: [spiritualityNarrative, setSpiritualityNarrative] },
        'trauma': {
            traumaNarrative: [traumaNarrative, setTraumaNarrative],
            selectedTraumaIds: [selectedTraumaIds, setSelectedTraumaIds],
        },
        'therapy': {
            individualTherapyNarrative: [individualTherapyNarrative, setIndividualTherapyNarrative],
            familyTherapyNarrative: [familyTherapyNarrative, setFamilyTherapyNarrative],
            groupTherapyNarrative: [groupTherapyNarrative, setGroupTherapyNarrative],
        },
        'substance-use': {
            substanceUseNarrative: [substanceUseNarrative, setSubstanceUseNarrative],
            associatedSubstanceUseTestingIds: [associatedSubstanceUseTestingIds, setAssociatedSubstanceUseTestingIds],
            associatedSubstanceUseDisclosureIds: [associatedSubstanceUseDisclosureIds, setAssociatedSubstanceUseDisclosureIds],
            associatedSubstanceUseAssessmentIds: [associatedSubstanceUseAssessmentIds, setAssociatedSubstanceUseAssessmentIds],
            associatedSubstanceUseSupplementalPlanIds: [associatedSubstanceUseSupplementalPlanIds, setAssociatedSubstanceUseSupplementalPlanIds],
        },
        'incidents': { incidentsNarrative: [incidentsNarrative, setIncidentsNarrative] },
        'legal': {
            legalInvolvementNarrative: [legalInvolvementNarrative, setLegalInvolvementNarrative],
            selectedLegalRecords: [selectedLegalRecords, setSelectedLegalRecords],
        },
        'dcfs-involvement': { dcfsInvolvementNarrative: [dcfsInvolvementNarrative, setDcfsInvolvementNarrative] },
        'asp': { aspNarrative: [aspNarrative, setAspNarrative] },
        'executive-functions': { executiveFunctionsNarrative: [executiveFunctionsNarrative, setExecutiveFunctionsNarrative] },
        'career': { careerPlanningNarrative: [careerPlanningNarrative, setCareerPlanningNarrative] },
        'post-secondary': { postSecondaryNarrative: [postSecondaryNarrative, setPostSecondaryNarrative] },
        'school': {
            schoolPerformanceNarrative: [schoolPerformanceNarrative, setSchoolPerformanceNarrative],
            schoolTutoringNarrative: [schoolTutoringNarrative, setSchoolTutoringNarrative],
        },
        'academic-plans': {
            iepPlansNarrative: [iepPlansNarrative, setIepPlansNarrative],
            academicPlansNarrative: [academicPlansNarrative, setAcademicPlansNarrative],
        },
    };

    // Rehydrate saved section fields (only the saved sections' own fields) before first paint.
    useLayoutEffect(() => {
        const saved = getItpSectionProgress(id)?.fields;
        if (!saved) return;
        for (const [sec, vals] of Object.entries(saved)) {
            const reg = sectionFieldRegistry[sec];
            if (!reg) continue;
            for (const [key, value] of Object.entries(vals)) {
                if (reg[key]) reg[key][1](structuredClone(value));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Guards against duplicate Save/Complete submits (double click) while one is settling.
    const sectionSubmitLock = useRef(false);
    const runGuarded = (fn: () => void) => {
        if (sectionSubmitLock.current) return;
        sectionSubmitLock.current = true;
        try { fn(); } finally { setTimeout(() => { sectionSubmitLock.current = false; }, 700); }
    };

    // Section status helper functions
    const sectionLabel = (section: string) => section.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    // Persist section progress to the session mock store; state updates only after the write succeeds.
    const commitSection = (section: string, nextStatus: 'In Progress' | 'Complete'): boolean => {
        const currentUser = getDemoUserName();
        const prevContrib = sectionContributors[section] || [];
        const nextContrib = prevContrib.includes(currentUser) ? sectionContributors : { ...sectionContributors, [section]: [...prevContrib, currentUser] };
        const nextStatusMap = { ...sectionStatus, [section]: nextStatus };
        const nextSaved = { ...sectionSavedAt, [section]: new Date().toISOString() };
        const prevFields = getItpSectionProgress(id)?.fields ?? {};
        const snapshot = Object.fromEntries(Object.entries(sectionFieldRegistry[section] ?? {}).map(([k, [v]]) => [k, v]));
        const result = writeItpSectionProgress(id, { status: nextStatusMap, contributors: nextContrib, savedAt: nextSaved, fields: { ...prevFields, [section]: snapshot } });
        if (!result.ok) {
            toast.error(`${sectionLabel(section)} section could not be saved. Your entries are still on screen. ${result.message}`);
            return false;
        }
        setSectionStatus(nextStatusMap);
        setSectionContributors(nextContrib);
        setSectionSavedAt(nextSaved);
        return true;
    };

    const handleSaveSection = (section: string) => {
        if (sectionStatus[section] === 'Complete') return;
        runGuarded(() => {
            if (commitSection(section, 'In Progress')) {
                toast.success(`${sectionLabel(section)} section saved (demo session)`, { id: `itp-section-${section}` });
            }
        });
    };

    const handleCompleteSection = (section: string) => {
        if (sectionStatus[section] === 'Complete') return;
        runGuarded(() => {
            if (commitSection(section, 'Complete')) {
                toast.success(`${sectionLabel(section)} section marked as complete (demo session)`, { id: `itp-section-${section}` });
            }
        });
    };

    const handleReopenSection = (section: string) => {
        const nextStatusMap = { ...sectionStatus, [section]: 'In Progress' as const };
        const result = writeItpSectionProgress(id, { status: nextStatusMap, contributors: sectionContributors, savedAt: sectionSavedAt });
        if (!result.ok) { toast.error('Section could not be reopened. ' + result.message); return; }
        setSectionStatus(nextStatusMap);
        toast.info(`${section.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} section reopened for editing`);
    };

    // Format date
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return formatMdy(date);
    };

    // Get status badge for section
    const getStatusIcon = (status: SectionStatus) => {
        const styles = {
            'not-started': { icon: Circle, color: '#9CA3AF' },
            'in-progress': { icon: Clock, color: '#F59E0B' },
            'complete': { icon: CheckCircle2, color: '#10B981' }
        };

        const style = styles[status];
        const IconComponent = style.icon;

        return <IconComponent className="h-3 w-3" style={{ color: style.color }} />;
    };

    // Render section header with Contributors and Status
    const renderSectionHeader = (sectionId: string) => {
        const status = sectionStatus[sectionId] || 'Not Started';
        const contributors = sectionContributors[sectionId] || [];
        const isComplete = status === 'Complete';
        
        const statusColors = {
            'Not Started': { bg: '#F3F4F6', color: '#6B7280', border: '#D1D5DB' },
            'In Progress': { bg: '#FEF3C7', color: '#D97706', border: '#FCD34D' },
            'Complete': { bg: '#D1FAE5', color: '#059669', border: '#6EE7B7' }
        };
        
        const statusColor = statusColors[status];
        
        return (
            <div 
                className="mb-4 p-4 rounded-lg"
                style={{ 
                    backgroundColor: 'var(--slds-g-color-background-alt)',
                    border: '1px solid var(--slds-g-color-border-base-1)'
                }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <label 
                                className="text-xs font-medium uppercase tracking-wide"
                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                                Contributors
                            </label>
                            <Badge 
                                className="text-xs px-2 py-0.5 font-medium"
                                style={{
                                    backgroundColor: statusColor.bg,
                                    color: statusColor.color,
                                    border: `1px solid ${statusColor.border}`
                                }}
                            >
                                {status === 'Complete' && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                                {status === 'In Progress' && <Clock className="h-3 w-3 inline mr-1" />}
                                {status === 'Not Started' && <Circle className="h-3 w-3 inline mr-1" />}
                                {status}
                            </Badge>
                        </div>
                        {contributors.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {contributors.map((contributor, index) => (
                                    <div 
                                        key={index}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                                        style={{ 
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            color: 'var(--slds-g-color-text-default)'
                                        }}
                                    >
                                        <UserCircle className="h-3.5 w-3.5" style={{ color: 'var(--color-brand-primary)' }} />
                                        {contributor}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                No contributors yet
                            </p>
                        )}
                        {sectionSavedAt[sectionId] && (
                            <p className="text-xs mt-2" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                Last saved {new Date(sectionSavedAt[sectionId]).toLocaleString()} (demo session)
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Handle schedule care planning meeting
    const handleScheduleMeeting = () => {
        const cpm = connections.find(c => c.type === "Care Planning Meeting");
        setEditingConnection(cpm ?? null);
        setIsConnectionDialogOpen(true);
    };

    // Handle Select Strengths modal
    const handleOpenSelectStrengths = () => {
        setIsSelectStrengthsModalOpen(true);
    };

    const handleCloseSelectStrengths = () => {
        setIsSelectStrengthsModalOpen(false);
    };
    
    // Handle Select Tests & Assessments modal
    const handleOpenSelectTestsAssessments = () => {
        setShowSelectTestsModal(true);
        // Pre-populate with currently selected tests
        setTempSelectedTestIds(selectedTestIds);
    };
    
    const handleCloseSelectTestsModal = () => {
        setShowSelectTestsModal(false);
    };
    
    const handleToggleTestSelection = (testId: string) => {
        setTempSelectedTestIds(prev => 
            prev.includes(testId)
                ? prev.filter(id => id !== testId)
                : [...prev, testId]
        );
    };
    
    const handleConfirmTestSelection = () => {
        setSelectedTestIds(tempSelectedTestIds);
        setShowSelectTestsModal(false);
        toast.success(`${tempSelectedTestIds.length} test(s) added to Testing & Assessments table`);
    };
    
    // Handlers for Achieved Goals Generate Summary modal
    const handleOpenAchievedGoalsModal = () => {
        if (achievedGoals.length === 0) {
            toast.info("No Achieved goals to import");
            return;
        }
        setShowAchievedGoalsModal(true);
        setSelectedGoalsForSummary([]);
    };
    
    const handleCloseAchievedGoalsModal = () => {
        setShowAchievedGoalsModal(false);
        setSelectedGoalsForSummary([]);
    };
    
    const handleToggleGoalSelection = (goalId: string) => {
        setSelectedGoalsForSummary(prev => 
            prev.includes(goalId)
                ? prev.filter(id => id !== goalId)
                : [...prev, goalId]
        );
    };
    
    const handleConfirmAchievedGoalsSummary = () => {
        const selectedGoalsData = achievedGoals.filter(g => selectedGoalsForSummary.includes(g.id));
        const generatedText = selectedGoalsData.map(goal => 
            `**${goal.goal}**\n\nThe youth successfully achieved this goal during this treatment quarter, demonstrating significant progress in ${goal.outcomeDomain}. Through consistent effort and staff support, the youth met all measurable criteria associated with this SMART goal. This achievement represents an important milestone in the youth's treatment progress.\n\n*Progress Tracking:* [Placeholder for progress tracking entries - would be populated from actual goal progress data in production]`
        ).join('\n\n---\n\n');
        
        setGoalsAchievedNarrative(generatedText);
        setShowAchievedGoalsModal(false);
        toast.success(`Summary generated for ${selectedGoalsData.length} achieved goal(s)`);
    };
    
    // Handlers for Discontinued Goals Generate Summary modal
    const handleOpenDiscontinuedGoalsModal = () => {
        if (discontinuedGoals.length === 0) {
            toast.info("No Discontinued goals to import");
            return;
        }
        setShowDiscontinuedGoalsModal(true);
        setSelectedGoalsForSummary([]);
    };
    
    const handleCloseDiscontinuedGoalsModal = () => {
        setShowDiscontinuedGoalsModal(false);
        setSelectedGoalsForSummary([]);
    };
    
    const handleConfirmDiscontinuedGoalsSummary = () => {
        const selectedGoalsData = discontinuedGoals.filter(g => selectedGoalsForSummary.includes(g.id));
        const generatedText = selectedGoalsData.map(goal => 
            `**${goal.goal}**\n\nThis goal was discontinued during this treatment quarter. The decision to discontinue aligns with the youth's evolving treatment needs and clinical assessment. Alternative goals or approaches are being explored to address the ${goal.outcomeDomain} outcome domain in ways that better match the youth's current functioning and readiness.\n\n*Progress Tracking:* [Placeholder for progress tracking entries - would be populated from actual goal progress data in production]`
        ).join('\n\n---\n\n');
        
        setGoalsDiscontinuedNarrative(generatedText);
        setShowDiscontinuedGoalsModal(false);
        toast.success(`Summary generated for ${selectedGoalsData.length} discontinued goal(s)`);
    };
    
    // Handlers for Open Goals Generate Summary modal
    const handleOpenOpenGoalsModal = () => {
        if (openGoals.length === 0) {
            toast.info("No In Progress goals to import");
            return;
        }
        setShowOpenGoalsModal(true);
        setSelectedGoalsForSummary([]);
    };
    
    const handleCloseOpenGoalsModal = () => {
        setShowOpenGoalsModal(false);
        setSelectedGoalsForSummary([]);
    };
    
    const handleConfirmOpenGoalsSummary = () => {
        const selectedGoalsData = openGoals.filter(g => selectedGoalsForSummary.includes(g.id));
        const generatedText = selectedGoalsData.map(goal => 
            `**${goal.goal}**\n\nThe youth continues to work toward this goal. During this treatment quarter, progress has been demonstrated through consistent engagement in treatment activities and measurable improvements in ${goal.outcomeDomain}. Staff observations indicate the youth is making steady progress toward achieving this SMART goal, and it remains an active component of the overall treatment plan.\n\n*Progress Tracking:* [Placeholder for progress tracking entries - would be populated from actual goal progress data in production]`
        ).join('\n\n---\n\n');
        
        setGoalsOpenNarrative(generatedText);
        setShowOpenGoalsModal(false);
        toast.success(`Summary generated for ${selectedGoalsData.length} open goal(s)`);
    };
    
    // Handlers for Legal Involvement Generate Summary modal
    const handleOpenLegalInvolvementModal = () => {
        if (legalInvolvementData.length === 0) {
            toast.info("No legal involvement records to import");
            return;
        }
        setShowLegalInvolvementModal(true);
        setSelectedLegalRecords([]);
    };
    
    const handleCloseLegalInvolvementModal = () => {
        setShowLegalInvolvementModal(false);
        setSelectedLegalRecords([]);
    };
    
    const handleToggleLegalRecordSelection = (recordId: string) => {
        setSelectedLegalRecords(prev => 
            prev.includes(recordId)
                ? prev.filter(id => id !== recordId)
                : [...prev, recordId]
        );
    };
    
    const handleConfirmLegalInvolvementSummary = () => {
        const selectedRecordsData = legalInvolvementData.filter(legal => selectedLegalRecords.includes(legal.id));
        const generatedText = selectedRecordsData.map(legal => 
            `**${legal.courtType} - ${legal.status}**\n\n${legal.overview}\n\nThis ${legal.status.toLowerCase()} legal matter is ${legal.status === 'Open' ? 'actively impacting' : 'relevant to'} the youth's treatment planning during this quarter. ${legal.endDate ? `This matter concluded on ${formatDate(legal.endDate)}, and the youth has demonstrated appropriate engagement with the resolution process.` : 'The youth continues to engage with court-ordered requirements and interventions as part of their overall treatment approach.'}\n\n*Court Type:* ${legal.courtType}\n*Status Updates:* [Placeholder for status update entries - would be populated from actual legal involvement status data in production]`
        ).join('\n\n---\n\n');
        
        setLegalInvolvementNarrative(generatedText);
        setShowLegalInvolvementModal(false);
        toast.success(`Summary generated for ${selectedRecordsData.length} legal involvement record(s)`);
    };

    const handleToggleStrength = (strengthId: string) => {
        if (selectedStrengthIds.includes(strengthId)) {
            setSelectedStrengthIds(selectedStrengthIds.filter(id => id !== strengthId));
        } else {
            setSelectedStrengthIds([...selectedStrengthIds, strengthId]);
        }
    };

    const handleSaveStrengthSelection = () => {
        setIsSelectStrengthsModalOpen(false);
        toast.success(`${selectedStrengthIds.length} strength(s) selected for this ITP period`);
    };

    // Toggle category expansion
    const toggleCategory = (categoryId: string) => {
        if (expandedCategories.includes(categoryId)) {
            setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
        } else {
            setExpandedCategories([...expandedCategories, categoryId]);
        }
    };

    // Get current active section details
    const getCurrentSection = () => {
        for (const category of ITP_SECTION_CATEGORIES) {
            const section = category.sections.find(s => s.id === activeSection);
            if (section) return section;
        }
        return ITP_SECTION_CATEGORIES[0].sections[0];
    };

    const currentSection = getCurrentSection();

    const sectionProps = {
        // Helpers
        formatDate,
        itpStartDate, setItpStartDate, itpEndDate, setItpEndDate,
        // Core state
        activeSection, setActiveSection,
        isItpFinalized, setIsItpFinalized,
        sectionStatus, setSectionStatus,
        sectionContributors, setSectionContributors,
        itpLifecycleStatus, setItpLifecycleStatus,
        // Helpers
        renderSectionHeader, handleSaveSection, handleCompleteSection, handleReopenSection,
        handleScheduleMeeting,
        // Connection state (Care Planning Meeting)
        connections, setConnections, editingConnection, setEditingConnection, setIsConnectionDialogOpen,
        // Narrative state
        medicationNarrative, setMedicationNarrative,
        physicalHealthNarrative, setPhysicalHealthNarrative,
        mentalHealthSupplementalPlansNarrative, setMentalHealthSupplementalPlansNarrative,
        diagnosticImpressionNarrative, setDiagnosticImpressionNarrative,
        mentalHealthConnectionsNarrative, setMentalHealthConnectionsNarrative,
        triggersNarrative, setTriggersNarrative,
        copingSkillsNarrative, setCopingSkillsNarrative,
        goalsAchievedNarrative, setGoalsAchievedNarrative,
        goalsDiscontinuedNarrative, setGoalsDiscontinuedNarrative,
        goalsOpenNarrative, setGoalsOpenNarrative,
        carePlanningMeetingNarrative, setCarePlanningMeetingNarrative,
        transitionPlanningNarrative, setTransitionPlanningNarrative,
        strengthsNarrative, setStrengthsNarrative,
        milieuSupplementalPlansNarrative, setMilieuSupplementalPlansNarrative,
        milieuMeetingsNarrative, setMilieuMeetingsNarrative,
        hygieneCleanlinessNarrative, setHygieneCleanlinessNarrative,
        dailyRoutinesNarrative, setDailyRoutinesNarrative,
        relationshipsWithPeersNarrative, setRelationshipsWithPeersNarrative,
        relationshipsWithStaffNarrative, setRelationshipsWithStaffNarrative,
        activitiesNarrative, setActivitiesNarrative,
        advocateNotesNarrative, setAdvocateNotesNarrative,
        familyInvolvementNarrative, setFamilyInvolvementNarrative,
        whoLivesInFamilyHomeNarrative, setWhoLivesInFamilyHomeNarrative,
        familySystemChangesNarrative, setFamilySystemChangesNarrative,
        spiritualityNarrative, setSpiritualityNarrative,
        traumaNarrative, setTraumaNarrative,
        individualTherapyNarrative, setIndividualTherapyNarrative,
        familyTherapyNarrative, setFamilyTherapyNarrative,
        groupTherapyNarrative, setGroupTherapyNarrative,
        substanceUseNarrative, setSubstanceUseNarrative,
        incidentsNarrative, setIncidentsNarrative,
        legalInvolvementNarrative, setLegalInvolvementNarrative,
        dcfsInvolvementNarrative, setDcfsInvolvementNarrative,
        testingAssessmentsNarrative, setTestingAssessmentsNarrative,
        aspNarrative, setAspNarrative,
        executiveFunctionsNarrative, setExecutiveFunctionsNarrative,
        careerPlanningNarrative, setCareerPlanningNarrative,
        postSecondaryNarrative, setPostSecondaryNarrative,
        schoolPerformanceNarrative, setSchoolPerformanceNarrative,
        schoolTutoringNarrative, setSchoolTutoringNarrative,
        iepPlansNarrative, setIepPlansNarrative,
        academicPlansNarrative, setAcademicPlansNarrative,
        // Modal open state
        showSelectTraumaModal, setShowSelectTraumaModal,
        tempSelectedTraumaIds, setTempSelectedTraumaIds,
        selectedTraumaIds, setSelectedTraumaIds,
        isSelectStrengthsModalOpen, setIsSelectStrengthsModalOpen,
        selectedStrengthIds, setSelectedStrengthIds,
        isPriorITPsModalOpen, setIsPriorITPsModalOpen,
        isSelectTriggersModalOpen, setIsSelectTriggersModalOpen,
        isSelectCopingSkillsModalOpen, setIsSelectCopingSkillsModalOpen,
        selectedTriggersList, setSelectedTriggersList,
        selectedCopingSkillsList, setSelectedCopingSkillsList,
        showAchievedGoalsModal, setShowAchievedGoalsModal,
        showDiscontinuedGoalsModal, setShowDiscontinuedGoalsModal,
        showOpenGoalsModal, setShowOpenGoalsModal,
        selectedGoalsForSummary, setSelectedGoalsForSummary,
        showSelectDomainsModal, setShowSelectDomainsModal,
        selectedDomainsForModal, setSelectedDomainsForModal,
        communityLaunchPlanData, setCommunityLaunchPlanData,
        viewingSubstanceUseTest, setViewingSubstanceUseTest,
        viewingSubstanceUseDisclosure, setViewingSubstanceUseDisclosure,
        viewingSubstanceUseAssessment, setViewingSubstanceUseAssessment,
        viewingSubstanceUseSupplementalPlan, setViewingSubstanceUseSupplementalPlan,
        showLegalInvolvementModal, setShowLegalInvolvementModal,
        selectedLegalRecords, setSelectedLegalRecords,
        selectedTestIds, setSelectedTestIds,
        showSelectTestsModal, setShowSelectTestsModal,
        tempSelectedTestIds, setTempSelectedTestIds,
        // Computed values / data
        medicationRecords, totalMissedDoses,
        physicalHealthData,
        mentalHealthData,
        carePlanningMeetingData,
        transitionPlanningData,
        lengthOfStayMonths,
        milieuSupplementalPlansData,
        familyActivitiesData,
        ptpStatementsData,
        incidentsData, numberOfIncidents, numberOfIncidentsWithRestraint, totalNumberOfHolds,
        spiritualDevClassesData,
        spiritualDevConnectionsData,
        individualTherapySessionsData,
        individualTherapySessionsPlanned,
        individualTherapySessionsScheduled,
        individualTherapySessionsAttended,
        familyTherapySessionsData,
        familyTherapySessionsPlanned,
        familyTherapySessionsScheduled,
        familyTherapySessionsAttended,
        substanceUseTestingData,
        substanceUseDisclosuresData,
        substanceUseAssessmentsData,
        substanceUseSupplementalPlansData,
        dcfsInvolvementData,
        legalInvolvementData,
        groupTherapySessionsData,
        groupTherapySessionsPlanned,
        groupTherapySessionsScheduled,
        groupTherapySessionsAttended,
        achievedGoals, discontinuedGoals, openGoals, goalsData,
        strengthsData,
        milieuMeetingsAttended, milieuMeetingsExpected,
        otherMilieuMeetingsAttended, otherMilieuMeetingsExpected,
        milieuMeetingsData,
        totalCommunityServiceHours, communityServiceActivitiesAttended, communityServiceData,
        activitiesRegisteredFor, activitiesAttended, activityParticipationData,
        itpWeeks,
        advocateMeetingsPlanned, advocateMeetingsScheduled, advocateMeetingsAttended, advocateMeetingsData,
        parentFamilyContactsExpected, parentFamilyContactsAttended, parentFamilyContactsData,
        homeVisitsCount, numberOfFamilyVisits, familyVisitsData,
        passesPlanned, passesOccurred, passesData,
        traumaData,
        triggersData,
        copingSkillsData,
        aspParticipationData,
        executiveFunctionsData,
        testingAssessmentsData,
        careerEmploymentData,
        careerClassParticipationData,
        careerFinancialLiteracyData,
        careerLearningModulesData,
        careerDriversEducationData,
        careerConnectionsData,
        psoEnrollmentData,
        psClassParticipationData,
        psCredentialsData,
        psConnectionsData,
        schoolIncidentsData,
        schoolConnectionsData,
        reportCardsData,
        courseGradesData,
        courseEnrollmentsData,
        tutorSessionsData,
        iepPlansData,
        academicPlansRecordsData,
        // Handler functions
        handleOpenSelectStrengths, handleCloseSelectStrengths,
        handleOpenAchievedGoalsModal, handleOpenDiscontinuedGoalsModal, handleOpenOpenGoalsModal,
        handleOpenSelectTrauma, handleCloseSelectTraumaModal,
        handleToggleTraumaSelection, handleConfirmTraumaSelection,
        handleOpenSelectDomainsModal, handleCloseSelectDomainsModal,
        handleToggleDomainSelection, handleAddDomains, handleDeleteDomain,
        handleOpenSelectTriggersModal, handleCloseSelectTriggersModal, handleDeleteTrigger,
        handleOpenSelectCopingSkillsModal, handleCloseSelectCopingSkillsModal, handleDeleteCopingSkill,
        handleViewSubstanceUseTest,
        handleViewSubstanceUseDisclosure,
        handleViewSubstanceUseAssessment,
        handleViewSubstanceUseSupplementalPlan,
        handleOpenLegalInvolvementModal, handleCloseLegalInvolvementModal,
        handleToggleLegalRecordSelection, handleConfirmLegalInvolvementSummary,
        handleOpenSelectTestsAssessments, handleCloseSelectTestsModal,
        handleToggleTestSelection, handleConfirmTestSelection,
        // ITP data
        itpData,
        navigate, id,
    };

    return (
        <>
            {/* Select Trauma Modal */}
            {showSelectTraumaModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={handleCloseSelectTraumaModal}
                >
                    <div 
                        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col mx-4"
                        onClick={(e) => e.stopPropagation()}
                        style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                        {/* Modal Header */}
                        <div 
                            className="px-6 py-4 border-b flex items-center justify-between"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <div>
                                <h2 className="text-lg font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    Select Trauma Records
                                </h2>
                                <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    Choose trauma records from the youth's profile that are relevant to this ITP period
                                </p>
                            </div>
                            <button
                                onClick={handleCloseSelectTraumaModal}
                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-4 overflow-y-auto flex-1">
                            {allTraumaData.length > 0 ? (
                                <div className="space-y-2">
                                    {allTraumaData.map((trauma) => (
                                        <label
                                            key={trauma.id}
                                            className="flex items-start gap-3 p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={tempSelectedTraumaIds.includes(trauma.id)}
                                                onChange={() => handleToggleTraumaSelection(trauma.id)}
                                                className="mt-0.5"
                                            />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                    {trauma.type} - {trauma.subject}
                                                </div>
                                                <div className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                    {trauma.description}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div 
                                    className="text-center py-8"
                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                >
                                    <p className="text-sm italic">
                                        No trauma records exist in the youth's profile.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div 
                            className="px-6 py-4 border-t flex justify-end gap-2"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <button
                                onClick={handleCloseSelectTraumaModal}
                                className="px-4 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                                style={{ 
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    color: 'var(--slds-g-color-text-default)'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmTraumaSelection}
                                className="px-4 py-2 text-sm rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                disabled={allTraumaData.length === 0}
                            >
                                Confirm Selection ({tempSelectedTraumaIds.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

        <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--slds-g-color-background-alt-2)' }}>
            {/* Header with Details Always Visible */}
            <div 
                className="px-6 py-4"
                style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                    boxShadow: 'var(--slds-g-shadow-1)'
                }}
            >
                {/* Back Button - hidden when embedded as a modal (Constituents
                    page); the modal's own close affordance replaces it.
                    Still shown on the standalone ITP Module route. */}
                {!onBack && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToItpModule}
                        className="mb-3 -ml-2 h-7"
                        style={{ color: 'var(--color-brand-primary)' }}
                    >
                        <ArrowLeft className="h-4 w-4 mr-1.5" />
                        Back to ITP Plans
                    </Button>
                )}

                {/* Header Content */}
                <div className="space-y-4">
                    {/* Title Row */}
                    <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-3">
                            <div 
                                className="h-10 w-10 flex items-center justify-center text-white"
                                style={{
                                    borderRadius: 'var(--slds-c-card-radius-border)',
                                    backgroundColor: 'var(--color-brand-primary)',
                                    boxShadow: 'var(--slds-g-shadow-1)'
                                }}
                            >
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <div 
                                    className="text-xs font-medium uppercase tracking-wide"
                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                >
                                    Individual Treatment Plan
                                </div>
                                <h1 
                                    className="text-xl font-medium"
                                    style={{ color: 'var(--slds-g-color-text-default)' }}
                                >
                                    {itpData.youthName}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsPriorITPsModalOpen(true)}
                                className="h-8"
                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                            >
                                <History className="h-3.5 w-3.5 mr-1.5" />
                                View Prior ITPs
                            </Button>
                            
                            <Badge 
                                className="text-xs px-3 py-1 font-medium"
                                style={{
                                    backgroundColor: itpData.status === 'Active' ? '#E8F5E9' : 
                                                   itpData.status === 'Draft' ? '#FFF3E0' :
                                                   itpData.status === 'Complete' ? '#E3F2FD' : '#F3E5F5',
                                    color: itpData.status === 'Active' ? '#2E7D32' :
                                           itpData.status === 'Draft' ? '#E65100' :
                                           itpData.status === 'Complete' ? '#1565C0' : '#6A1B9A',
                                    border: `1px solid ${itpData.status === 'Active' ? '#81C784' :
                                                         itpData.status === 'Draft' ? '#FFB74D' :
                                                         itpData.status === 'Complete' ? '#64B5F6' : '#BA68C8'}`
                                }}
                            >
                                {itpData.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Separator */}
                    <div 
                        className="w-full"
                        style={{ 
                            borderTop: '1px solid var(--slds-g-color-border-base-1)',
                            margin: '0 -1.5rem 1rem -1.5rem',
                            width: 'calc(100% + 3rem)'
                        }} 
                    />

                    {/* Metadata Grid - Always Visible */}
                    <div className="grid grid-cols-5 gap-4">
                        {/* Start Date */}
                        <div>
                            <label 
                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                                Start Date
                            </label>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                <span className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    {formatDate(itpData.startDate)}
                                </span>
                            </div>
                        </div>

                        {/* End Date */}
                        <div>
                            <label 
                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                                End Date
                            </label>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                <span className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    {formatDate(itpData.endDate)}
                                </span>
                            </div>
                        </div>

                        {/* Advocate(s) */}
                        <div>
                            <label
                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                                {itpData.advocates.length > 1 ? 'Advocates' : 'Advocate'}
                            </label>
                            <div className="flex items-start gap-2">
                                <UserCircle className="h-3.5 w-3.5 mt-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                <div className="flex-1">
                                    {itpData.advocates.length > 0 ? (
                                        itpData.advocates.map((advocate, index) => (
                                            <div key={index} className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                {advocate}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            —
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Therapist(s) */}
                        <div>
                            <label
                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                                {itpData.therapists.length > 1 ? 'Therapists' : 'Therapist'}
                            </label>
                            <div className="flex items-start gap-2">
                                <Users className="h-3.5 w-3.5 mt-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                <div className="flex-1">
                                    {itpData.therapists.length > 0 ? (
                                        itpData.therapists.map((therapist, index) => (
                                            <div key={index} className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                {therapist}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            —
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Program */}
                        <div>
                            <label 
                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                                Program
                            </label>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                <span className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    {itpData.program}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area with Left Navigation */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Navigation Panel */}
                <div 
                    className="w-72 overflow-y-auto flex-shrink-0"
                    style={{
                        backgroundColor: 'var(--slds-g-color-background-base)',
                        borderRight: '1px solid var(--slds-g-color-border-base-1)'
                    }}
                >
                    <div className="p-4">
                        <nav className="space-y-1">
                            {ITP_SECTION_CATEGORIES.map((category) => {
                                // Check if this category contains the active section
                                const isCategoryActive = category.sections.some(s => s.id === activeSection);
                                
                                // Calculate category completion status
                                const completedSections = category.sections.filter(s => 
                                    sectionStatus[s.id] === 'Complete'
                                ).length;
                                const totalSections = category.sections.length;
                                const allComplete = completedSections === totalSections;
                                const someComplete = completedSections > 0 && completedSections < totalSections;
                                
                                // Get unique contributors for this category
                                const categoryContributors = new Set<string>();
                                category.sections.forEach(section => {
                                    const contributors = sectionContributors[section.id] || [];
                                    contributors.forEach(c => categoryContributors.add(c));
                                });
                                const contributorCount = categoryContributors.size;
                                
                                return (
                                    <div key={category.id}>
                                        {/* Category Header */}
                                        <button
                                            onClick={() => {
                                                // Set first section of category as active when clicking category
                                                setActiveSection(category.sections[0].id);
                                            }}
                                            className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold transition-colors mb-1 hover:bg-gray-100"
                                            style={{
                                                backgroundColor: isCategoryActive ? 'var(--color-brand-primary)' : 'transparent',
                                                color: isCategoryActive ? '#FFFFFF' : 'var(--slds-g-color-text-default)'
                                            }}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="flex-1 truncate">{category.name}</span>
                                                
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    {/* Contributor Count */}
                                                    {contributorCount > 0 && (
                                                        null
                                                    )}
                                                    
                                                    {/* Completion Status Badge */}
                                                    <div 
                                                        className="rounded text-xs font-semibold"
                                                        style={{
                                                            backgroundColor: allComplete 
                                                                ? 'transparent'
                                                                : someComplete 
                                                                    ? (isCategoryActive ? 'rgba(255, 255, 255, 0.2)' : '#FEF3C7')
                                                                    : (isCategoryActive ? 'rgba(255, 255, 255, 0.2)' : '#F3F4F6'),
                                                            color: allComplete
                                                                ? (isCategoryActive ? '#FFFFFF' : '#16A34A')
                                                                : someComplete
                                                                    ? (isCategoryActive ? '#FFFFFF' : '#D97706')
                                                                    : (isCategoryActive ? '#FFFFFF' : '#6B7280'),
                                                            padding: '2px 6px'
                                                        }}
                                                        title={`${completedSections} of ${totalSections} sections complete`}
                                                    >
                                                        {allComplete ? (
                                                            <>✓</>
                                                        ) : (
                                                            <>{completedSections}/{totalSections}</>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>

                                        {/* Nested Sections - Show only for active category */}
                                        {isCategoryActive && (
                                            <div className="ml-4 space-y-0.5 mb-2">
                                                {category.sections.map((section) => {
                                                    const isActive = activeSection === section.id;
                                                    const status = sectionStatus[section.id] || 'Not Started';
                                                    
                                                    // Determine dot color based on status
                                                    let dotColor = '#CBD5E0'; // Not Started (gray)
                                                    let dotTitle = 'Not Started';
                                                    if (status === 'Complete') {
                                                        dotColor = '#16A34A'; // Complete (green)
                                                        dotTitle = 'Complete';
                                                    } else if (status === 'In Progress') {
                                                        dotColor = '#F59E0B'; // In Progress (yellow/orange)
                                                        dotTitle = 'In Progress';
                                                    }
                                                    
                                                    return (
                                                        <button
                                                            key={section.id}
                                                            onClick={() => setActiveSection(section.id)}
                                                            aria-current={isActive ? 'page' : undefined}
                                                            className="w-full text-left px-3 py-1.5 slds-text-3 transition-colors flex items-center justify-between rounded-md"
                                                            style={{
                                                                backgroundColor: isActive ? 'rgba(20, 95, 51, 0.08)' : 'transparent',
                                                                color: isActive ? 'var(--color-brand-primary)' : 'var(--slds-g-color-text-default)',
                                                                fontWeight: isActive ? 600 : 400
                                                            }}
                                                            onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--slds-g-color-background-alt)'; }}
                                                            onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                                                        >
                                                            <span className="truncate">{section.name}</span>
                                                            <div
                                                                role="img"
                                                                aria-hidden="true"
                                                                className="h-2 w-2 rounded-full flex-shrink-0"
                                                                style={{ backgroundColor: dotColor }}
                                                                title={dotTitle}
                                                            />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div 
                    className="flex-1 overflow-y-auto p-6"
                    style={{ backgroundColor: 'var(--slds-g-color-background-alt-2)' }}
                >
                    <Card 
                        className="shadow-sm"
                        style={{
                            backgroundColor: 'var(--slds-g-color-background-base)',
                            border: '1px solid var(--slds-g-color-border-base-1)',
                            borderRadius: 'var(--slds-c-card-radius-border)'
                        }}
                    >
                        <CardHeader style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', paddingTop: '12px', paddingBottom: '12px', display: 'flex', alignItems: 'center' }}>
                            <div className="flex items-center justify-between" style={{ width: '100%' }}>
                                <CardTitle 
                                    className="text-base font-semibold"
                                    style={{ color: 'var(--slds-g-color-text-default)', fontSize: '0.8rem', margin: 0, lineHeight: 1.2, display: 'flex', alignItems: 'center' }}
                                >
                                    {currentSection.name}
                                </CardTitle>
                                
                                {/* Special action for Schedule section */}
                                {activeSection === 'schedule' && (
                                    <Button
                                        size="sm"
                                        className="h-8 text-xs rounded-full text-white"
                                        onClick={handleScheduleMeeting}
                                        style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                    >
                                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                        {connections.find(c => c.type === "Care Planning Meeting") ? "Edit Care Planning Meeting" : "Schedule Care Planning Meeting"}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>

                            <EditITPWorkspaceSectionsA {...sectionProps} />
                            <EditITPWorkspaceSectionsB {...sectionProps} />
                            <EditITPWorkspaceSectionsC {...sectionProps} />
                            <EditITPWorkspaceSectionsD {...sectionProps} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Select Strengths Modal */}
            {isSelectStrengthsModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={handleCloseSelectStrengths}
                >
                    <div 
                        className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col"
                        style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div 
                            className="px-6 py-4 border-b"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <div className="flex items-center justify-between">
                                <h2 
                                    className="text-lg font-semibold"
                                    style={{ color: 'var(--slds-g-color-text-default)' }}
                                >
                                    Select Strengths
                                </h2>
                                <button
                                    onClick={handleCloseSelectStrengths}
                                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                Select only strengths that were relevant or important during this treatment quarter. 
                                Selected strengths will appear in the Strengths table.
                            </p>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {allStrengthsData.length > 0 ? (
                                <div className="space-y-3">
                                    {allStrengthsData.map((strength) => (
                                        <div 
                                            key={strength.id}
                                            className="p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                                            style={{ 
                                                borderColor: selectedStrengthIds.includes(strength.id) 
                                                    ? 'var(--color-brand-primary)' 
                                                    : 'var(--slds-g-color-border-base-1)',
                                                backgroundColor: selectedStrengthIds.includes(strength.id) 
                                                    ? '#F0FDF4' 
                                                    : 'white'
                                            }}
                                            onClick={() => handleToggleStrength(strength.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5">
                                                    <div 
                                                        className="h-5 w-5 rounded border-2 flex items-center justify-center"
                                                        style={{
                                                            borderColor: selectedStrengthIds.includes(strength.id) 
                                                                ? 'var(--color-brand-primary)' 
                                                                : 'var(--slds-g-color-border-base-1)',
                                                            backgroundColor: selectedStrengthIds.includes(strength.id) 
                                                                ? 'var(--color-brand-primary)' 
                                                                : 'white'
                                                        }}
                                                    >
                                                        {selectedStrengthIds.includes(strength.id) && (
                                                            <CheckCircle2 className="h-4 w-4 text-white" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 
                                                        className="text-sm font-semibold mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-default)' }}
                                                    >
                                                        {strength.strength}
                                                    </h3>
                                                    <p 
                                                        className="text-xs mb-2"
                                                        style={{ color: 'var(--slds-g-color-text-default)' }}
                                                    >
                                                        {strength.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        <span>Reported: {formatDate(strength.reportedDate)}</span>
                                                        <span>•</span>
                                                        <span>By: {strength.selectedBy}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-sm" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        No strengths are currently on file for this youth.
                                        <br />
                                        Please add strengths through the youth's profile first.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div 
                            className="px-6 py-4 border-t"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    {selectedStrengthIds.length} of {allStrengthsData.length} strength(s) selected
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-full h-8"
                                        style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                        onClick={handleCloseSelectStrengths}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="rounded-full text-white h-8"
                                        style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                        onClick={handleSaveStrengthSelection}
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                        Save Selection
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Select Domains Modal (Transition Planning) */}
            {showSelectDomainsModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={handleCloseSelectDomainsModal}
                >
                    <div 
                        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                        style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                        {/* Modal Header */}
                        <div 
                            className="px-6 py-4 border-b flex items-center justify-between"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <h2 className="text-lg font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                Select Domains
                            </h2>
                            <button
                                onClick={handleCloseSelectDomainsModal}
                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-4 overflow-y-auto flex-1">
                            <p className="text-sm mb-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                Select the Community Launch Plan domains you want to include in this ITP. Domains are sourced from the youth's profile records during the ITP period.
                            </p>

                            <div className="space-y-2">
                                {transitionPlanningData.communityLaunchPlan.map((domain) => (
                                    <label
                                        key={domain.id}
                                        className="flex items-start gap-3 p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                                        style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedDomainsForModal.includes(domain.id)}
                                            onChange={() => handleToggleDomainSelection(domain.id)}
                                            className="mt-0.5"
                                        />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                {domain.domain}
                                            </div>
                                            <div className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                {domain.content}
                                            </div>
                                            <div className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Timeframe: {domain.timeframeMonths} months
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div 
                            className="px-6 py-4 border-t flex justify-end gap-2"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <button
                                onClick={handleCloseSelectDomainsModal}
                                className="px-4 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                                style={{ 
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    color: 'var(--slds-g-color-text-default)'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddDomains}
                                className="px-4 py-2 text-sm rounded text-white transition-colors"
                                style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                disabled={selectedDomainsForModal.length === 0}
                            >
                                Add Domains ({selectedDomainsForModal.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Select Tests & Assessments Modal */}
            {showSelectTestsModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={handleCloseSelectTestsModal}
                >
                    <div 
                        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col mx-4"
                        onClick={(e) => e.stopPropagation()}
                        style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                        {/* Modal Header */}
                        <div 
                            className="px-6 py-4 border-b flex items-center justify-between"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <h2 className="text-lg font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                Select Tests & Assessments
                            </h2>
                            <button
                                onClick={handleCloseSelectTestsModal}
                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-4 overflow-y-auto flex-1">
                            <p className="text-sm mb-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                Select the testing and assessment records you want to include in this ITP. Only tests completed during the current ITP timeframe are available for selection.
                            </p>

                            {allTestingAssessmentsData.length > 0 ? (
                                <div className="space-y-2">
                                    {allTestingAssessmentsData.map((test) => (
                                        <label
                                            key={test.id}
                                            className="flex items-start gap-3 p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={tempSelectedTestIds.includes(test.id)}
                                                onChange={() => handleToggleTestSelection(test.id)}
                                                className="mt-0.5"
                                            />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                    {test.test}
                                                </div>
                                                <div className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                    Date: {formatDate(test.date)}
                                                </div>
                                                <div className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                    {test.summary}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div 
                                    className="text-center py-8"
                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                >
                                    <p className="text-sm italic">
                                        No testing or assessment records exist for the current ITP period.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div 
                            className="px-6 py-4 border-t flex justify-end gap-2"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <button
                                onClick={handleCloseSelectTestsModal}
                                className="px-4 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                                style={{ 
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    color: 'var(--slds-g-color-text-default)'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmTestSelection}
                                className="px-4 py-2 text-sm rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                disabled={allTestingAssessmentsData.length === 0}
                            >
                                Add Tests ({tempSelectedTestIds.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate Summary Modal - Achieved Goals */}
            {showAchievedGoalsModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={handleCloseAchievedGoalsModal}
                >
                    <div 
                        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col mx-4"
                        onClick={(e) => e.stopPropagation()}
                        style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                        {/* Modal Header */}
                        <div 
                            className="px-6 py-4 border-b flex items-center justify-between"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <div>
                                <h2 className="text-lg font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    Generate Summary - Achieved Goals
                                </h2>
                                <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    Select the achieved goals to include in the narrative summary
                                </p>
                            </div>
                            <button
                                onClick={handleCloseAchievedGoalsModal}
                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-4 overflow-y-auto flex-1">
                            <div className="space-y-3">
                                {achievedGoals.map((goal) => (
                                    <label
                                        key={goal.id}
                                        className="flex items-start gap-3 p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                                        style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedGoalsForSummary.includes(goal.id)}
                                            onChange={() => handleToggleGoalSelection(goal.id)}
                                            className="mt-0.5"
                                        />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                {goal.goal}
                                            </div>
                                            <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                <span>Start: {formatDate(goal.startDate)}</span>
                                                <span>Target End: {formatDate(goal.targetEndDate)}</span>
                                                <span>Outcome: {goal.outcomeDomain}</span>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div 
                            className="px-6 py-4 border-t flex justify-end gap-2"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <button
                                onClick={handleCloseAchievedGoalsModal}
                                className="px-4 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                                style={{ 
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    color: 'var(--slds-g-color-text-default)'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAchievedGoalsSummary}
                                className="px-4 py-2 text-sm rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                disabled={selectedGoalsForSummary.length === 0}
                            >
                                <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                                Generate Summary ({selectedGoalsForSummary.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate Summary Modal - Discontinued Goals */}
            {showDiscontinuedGoalsModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={handleCloseDiscontinuedGoalsModal}
                >
                    <div 
                        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col mx-4"
                        onClick={(e) => e.stopPropagation()}
                        style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                        {/* Modal Header */}
                        <div 
                            className="px-6 py-4 border-b flex items-center justify-between"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <div>
                                <h2 className="text-lg font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    Generate Summary - Discontinued Goals
                                </h2>
                                <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    Select the discontinued goals to include in the narrative summary
                                </p>
                            </div>
                            <button
                                onClick={handleCloseDiscontinuedGoalsModal}
                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-4 overflow-y-auto flex-1">
                            <div className="space-y-3">
                                {discontinuedGoals.map((goal) => (
                                    <label
                                        key={goal.id}
                                        className="flex items-start gap-3 p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                                        style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedGoalsForSummary.includes(goal.id)}
                                            onChange={() => handleToggleGoalSelection(goal.id)}
                                            className="mt-0.5"
                                        />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                {goal.goal}
                                            </div>
                                            <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                <span>Start: {formatDate(goal.startDate)}</span>
                                                <span>Target End: {formatDate(goal.targetEndDate)}</span>
                                                <span>Outcome: {goal.outcomeDomain}</span>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div 
                            className="px-6 py-4 border-t flex justify-end gap-2"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <button
                                onClick={handleCloseDiscontinuedGoalsModal}
                                className="px-4 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                                style={{ 
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    color: 'var(--slds-g-color-text-default)'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDiscontinuedGoalsSummary}
                                className="px-4 py-2 text-sm rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                disabled={selectedGoalsForSummary.length === 0}
                            >
                                <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                                Generate Summary ({selectedGoalsForSummary.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate Summary Modal - Open Goals */}
            {showOpenGoalsModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={handleCloseOpenGoalsModal}
                >
                    <div 
                        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col mx-4"
                        onClick={(e) => e.stopPropagation()}
                        style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                        {/* Modal Header */}
                        <div 
                            className="px-6 py-4 border-b flex items-center justify-between"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <div>
                                <h2 className="text-lg font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    Generate Summary - Open Goals
                                </h2>
                                <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    Select the open (in progress) goals to include in the narrative summary
                                </p>
                            </div>
                            <button
                                onClick={handleCloseOpenGoalsModal}
                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-4 overflow-y-auto flex-1">
                            <div className="space-y-3">
                                {openGoals.map((goal) => (
                                    <label
                                        key={goal.id}
                                        className="flex items-start gap-3 p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                                        style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedGoalsForSummary.includes(goal.id)}
                                            onChange={() => handleToggleGoalSelection(goal.id)}
                                            className="mt-0.5"
                                        />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                {goal.goal}
                                            </div>
                                            <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                <span>Start: {formatDate(goal.startDate)}</span>
                                                <span>Target End: {formatDate(goal.targetEndDate)}</span>
                                                <span>Outcome: {goal.outcomeDomain}</span>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div 
                            className="px-6 py-4 border-t flex justify-end gap-2"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <button
                                onClick={handleCloseOpenGoalsModal}
                                className="px-4 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                                style={{ 
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    color: 'var(--slds-g-color-text-default)'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmOpenGoalsSummary}
                                className="px-4 py-2 text-sm rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                disabled={selectedGoalsForSummary.length === 0}
                            >
                                <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                                Generate Summary ({selectedGoalsForSummary.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate Summary Modal - Legal Involvement */}
            {showLegalInvolvementModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={handleCloseLegalInvolvementModal}
                >
                    <div 
                        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col mx-4"
                        onClick={(e) => e.stopPropagation()}
                        style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                        {/* Modal Header */}
                        <div 
                            className="px-6 py-4 border-b flex items-center justify-between"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <div>
                                <h2 className="text-lg font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    Generate Summary - Legal Involvement
                                </h2>
                                <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    Select the legal involvement records to include in the narrative summary
                                </p>
                            </div>
                            <button
                                onClick={handleCloseLegalInvolvementModal}
                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-4 overflow-y-auto flex-1">
                            <div className="space-y-3">
                                {legalInvolvementData.map((legal) => (
                                    <label
                                        key={legal.id}
                                        className="flex items-start gap-3 p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                                        style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedLegalRecords.includes(legal.id)}
                                            onChange={() => handleToggleLegalRecordSelection(legal.id)}
                                            className="mt-0.5"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                    {legal.courtType}
                                                </div>
                                                <Badge 
                                                    className="text-xs px-2 py-0.5"
                                                    style={{
                                                        backgroundColor: legal.status === 'Open' ? '#FEF3C7' : '#DCFCE7',
                                                        color: legal.status === 'Open' ? '#D97706' : '#16A34A',
                                                        border: `1px solid ${legal.status === 'Open' ? '#FCD34D' : '#BBF7D0'}`
                                                    }}
                                                >
                                                    {legal.status}
                                                </Badge>
                                            </div>
                                            <div className="text-sm mt-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                {legal.overview}
                                            </div>
                                            <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                <span>Start: {formatDate(legal.startDate)}</span>
                                                {legal.endDate && <span>End: {formatDate(legal.endDate)}</span>}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div 
                            className="px-6 py-4 border-t flex justify-end gap-2"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <button
                                onClick={handleCloseLegalInvolvementModal}
                                className="px-4 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                                style={{ 
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    color: 'var(--slds-g-color-text-default)'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmLegalInvolvementSummary}
                                className="px-4 py-2 text-sm rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                disabled={selectedLegalRecords.length === 0}
                            >
                                <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                                Generate Summary ({selectedLegalRecords.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Select Triggers Modal */}
            {isSelectTriggersModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={handleCloseSelectTriggersModal}
                >
                    <div 
                        className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col"
                        style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div 
                            className="px-6 py-4 border-b"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <div className="flex items-center justify-between">
                                <h2 
                                    className="text-lg font-semibold"
                                    style={{ color: 'var(--slds-g-color-text-default)' }}
                                >
                                    Select Triggers
                                </h2>
                                <button
                                    onClick={handleCloseSelectTriggersModal}
                                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                Select only triggers that were relevant or important during this treatment quarter. 
                                Selected triggers will appear in the Triggers table.
                            </p>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {triggersData.length > 0 ? (
                                <div className="space-y-3">
                                    {triggersData.map((trigger) => (
                                        <div 
                                            key={trigger.id}
                                            className="p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                                            style={{ 
                                                borderColor: selectedTriggersList.includes(trigger.id) 
                                                    ? 'var(--color-brand-primary)' 
                                                    : 'var(--slds-g-color-border-base-1)',
                                                backgroundColor: selectedTriggersList.includes(trigger.id) 
                                                    ? '#F0FDF4' 
                                                    : 'white'
                                            }}
                                            onClick={() => {
                                                if (selectedTriggersList.includes(trigger.id)) {
                                                    setSelectedTriggersList(selectedTriggersList.filter(id => id !== trigger.id));
                                                } else {
                                                    setSelectedTriggersList([...selectedTriggersList, trigger.id]);
                                                }
                                            }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5">
                                                    <div 
                                                        className="h-5 w-5 rounded border-2 flex items-center justify-center"
                                                        style={{
                                                            borderColor: selectedTriggersList.includes(trigger.id) 
                                                                ? 'var(--color-brand-primary)' 
                                                                : 'var(--slds-g-color-border-base-1)',
                                                            backgroundColor: selectedTriggersList.includes(trigger.id) 
                                                                ? 'var(--color-brand-primary)' 
                                                                : 'white'
                                                        }}
                                                    >
                                                        {selectedTriggersList.includes(trigger.id) && (
                                                            <CheckCircle2 className="h-4 w-4 text-white" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 
                                                        className="text-sm font-semibold mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-default)' }}
                                                    >
                                                        {trigger.trigger}
                                                    </h3>
                                                    <p 
                                                        className="text-xs mb-2"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        {trigger.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        <span>Reported: {formatDate(trigger.reportedDate)}</span>
                                                        <span>By: {trigger.selectedBy}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-sm py-8" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    No triggers available for selection.
                                </p>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div 
                            className="px-6 py-4 border-t"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    {selectedTriggersList.length} of {triggersData.length} trigger(s) selected
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-full h-8"
                                        style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                        onClick={handleCloseSelectTriggersModal}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="rounded-full text-white h-8"
                                        style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                        onClick={() => {
                                            handleCloseSelectTriggersModal();
                                            toast.success(`${selectedTriggersList.length} trigger(s) added to this ITP period`);
                                        }}
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                        Add Triggers
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Select Coping Skills Modal */}
            {isSelectCopingSkillsModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={handleCloseSelectCopingSkillsModal}
                >
                    <div 
                        className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col"
                        style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div 
                            className="px-6 py-4 border-b"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <div className="flex items-center justify-between">
                                <h2 
                                    className="text-lg font-semibold"
                                    style={{ color: 'var(--slds-g-color-text-default)' }}
                                >
                                    Select Coping Skills
                                </h2>
                                <button
                                    onClick={handleCloseSelectCopingSkillsModal}
                                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                Select only coping skills that were relevant or important during this treatment quarter. 
                                Selected coping skills will appear in the Coping Skills table.
                            </p>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {copingSkillsData.length > 0 ? (
                                <div className="space-y-3">
                                    {copingSkillsData.map((skill) => (
                                        <div 
                                            key={skill.id}
                                            className="p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                                            style={{ 
                                                borderColor: selectedCopingSkillsList.includes(skill.id) 
                                                    ? 'var(--color-brand-primary)' 
                                                    : 'var(--slds-g-color-border-base-1)',
                                                backgroundColor: selectedCopingSkillsList.includes(skill.id) 
                                                    ? '#F0FDF4' 
                                                    : 'white'
                                            }}
                                            onClick={() => {
                                                if (selectedCopingSkillsList.includes(skill.id)) {
                                                    setSelectedCopingSkillsList(selectedCopingSkillsList.filter(id => id !== skill.id));
                                                } else {
                                                    setSelectedCopingSkillsList([...selectedCopingSkillsList, skill.id]);
                                                }
                                            }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5">
                                                    <div 
                                                        className="h-5 w-5 rounded border-2 flex items-center justify-center"
                                                        style={{
                                                            borderColor: selectedCopingSkillsList.includes(skill.id) 
                                                                ? 'var(--color-brand-primary)' 
                                                                : 'var(--slds-g-color-border-base-1)',
                                                            backgroundColor: selectedCopingSkillsList.includes(skill.id) 
                                                                ? 'var(--color-brand-primary)' 
                                                                : 'white'
                                                        }}
                                                    >
                                                        {selectedCopingSkillsList.includes(skill.id) && (
                                                            <CheckCircle2 className="h-4 w-4 text-white" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 
                                                        className="text-sm font-semibold mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-default)' }}
                                                    >
                                                        {skill.copingSkill}
                                                    </h3>
                                                    <p 
                                                        className="text-xs mb-2"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        {skill.description}
                                                    </p>
                                                    <p 
                                                        className="text-xs mb-2"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        <strong>Effective When:</strong> {skill.effectiveWhen}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        <span>Reported: {formatDate(skill.reportedDate)}</span>
                                                        <span>By: {skill.selectedBy}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-sm py-8" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    No coping skills available for selection.
                                </p>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div 
                            className="px-6 py-4 border-t"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    {selectedCopingSkillsList.length} of {copingSkillsData.length} coping skill(s) selected
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-full h-8"
                                        style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                        onClick={handleCloseSelectCopingSkillsModal}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="rounded-full text-white h-8"
                                        style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                        onClick={() => {
                                            handleCloseSelectCopingSkillsModal();
                                            toast.success(`${selectedCopingSkillsList.length} coping skill(s) added to this ITP period`);
                                        }}
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                        Add Coping Skills
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Prior ITPs Modal */}
            {isPriorITPsModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setIsPriorITPsModalOpen(false)}
                >
                    <div 
                        className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4"
                        style={{ 
                            maxHeight: '80vh',
                            border: '1px solid var(--slds-g-color-border-base-1)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div 
                            className="px-6 py-4 flex items-center justify-between"
                            style={{ 
                                borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-alt)'
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div 
                                    className="h-8 w-8 flex items-center justify-center text-white rounded"
                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                >
                                    <History className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 
                                        className="text-lg font-semibold"
                                        style={{ color: 'var(--slds-g-color-text-default)' }}
                                    >
                                        Prior ITPs
                                    </h2>
                                    <p className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Finalized treatment plans for {itpData.youthName}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsPriorITPsModalOpen(false)}
                                className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
                            {priorITPsData.length > 0 ? (
                                <div 
                                    className="rounded-lg overflow-hidden"
                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                >
                                    <table className="w-full">
                                        <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                            <tr>
                                                <th 
                                                    className="text-left text-xs font-semibold px-4 py-3"
                                                    style={{ color: 'var(--slds-g-color-text-default)' }}
                                                >
                                                    Name
                                                </th>
                                                <th 
                                                    className="text-left text-xs font-semibold px-4 py-3"
                                                    style={{ color: 'var(--slds-g-color-text-default)' }}
                                                >
                                                    Date Range
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {priorITPsData.map((itp, index) => (
                                                <tr 
                                                    key={itp.id}
                                                    onClick={() => {
                                                        toast.info(`Opening ITP: ${itp.name}`);
                                                        // Navigate to the ITP record
                                                        // In a real implementation, this would navigate to the ITP detail page
                                                        // navigate(`/itp-module/${itp.id}`);
                                                    }}
                                                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                                                    style={{ 
                                                        borderBottom: index < priorITPsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none'
                                                    }}
                                                >
                                                    <td 
                                                        className="text-sm px-4 py-3"
                                                        style={{ color: 'var(--color-brand-primary)' }}
                                                    >
                                                        {itp.name}
                                                    </td>
                                                    <td 
                                                        className="text-sm px-4 py-3"
                                                        style={{ color: 'var(--slds-g-color-text-default)' }}
                                                    >
                                                        {formatDate(itp.startDate)} - {formatDate(itp.endDate)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div 
                                    className="text-center py-12 rounded-lg"
                                    style={{ 
                                        backgroundColor: 'var(--slds-g-color-background-alt)',
                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                    }}
                                >
                                    <FileText 
                                        className="h-12 w-12 mx-auto mb-3"
                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                    />
                                    <p 
                                        className="text-sm font-medium mb-1"
                                        style={{ color: 'var(--slds-g-color-text-default)' }}
                                    >
                                        No Prior ITPs
                                    </p>
                                    <p 
                                        className="text-xs"
                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                    >
                                        There are no finalized treatment plans for this youth.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div 
                            className="px-6 py-4 flex justify-end"
                            style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsPriorITPsModalOpen(false)}
                                className="h-8"
                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Substance Use Test Details Modal — read-only view of a single existing test */}
            <Dialog open={!!viewingSubstanceUseTest} onOpenChange={(open) => { if (!open) setViewingSubstanceUseTest(null); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Substance Use Test Details</DialogTitle>
                        <DialogDescription className="sr-only">Read-only details for this substance use test</DialogDescription>
                    </DialogHeader>
                    {viewingSubstanceUseTest && (
                        <div className="space-y-3 py-2">
                            <div>
                                <p className="text-xs font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Date & Time</p>
                                <p className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>{viewingSubstanceUseTest.dateTime}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Reason</p>
                                <p className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>{viewingSubstanceUseTest.reason}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Results</p>
                                <p className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>{viewingSubstanceUseTest.results}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>New Use</p>
                                <p className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>{viewingSubstanceUseTest.newUse}</p>
                            </div>
                            <p className="text-xs italic pt-2 border-t" style={{ color: 'var(--slds-g-color-text-weak)', borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                This record is view-only within the ITP. To edit it, use the youth's Substance Use records.
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button size="sm" variant="outline" onClick={() => setViewingSubstanceUseTest(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Disclosure Details Modal — read-only view of a single existing disclosure */}
            <Dialog open={!!viewingSubstanceUseDisclosure} onOpenChange={(open) => { if (!open) setViewingSubstanceUseDisclosure(null); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Disclosure Details</DialogTitle>
                        <DialogDescription className="sr-only">Read-only details for this disclosure</DialogDescription>
                    </DialogHeader>
                    {viewingSubstanceUseDisclosure && (
                        <div className="space-y-3 py-2">
                            <div>
                                <p className="text-xs font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Date & Time</p>
                                <p className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>{viewingSubstanceUseDisclosure.dateTime}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Substance(s)</p>
                                <p className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>{viewingSubstanceUseDisclosure.substances}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Comments</p>
                                <p className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>{viewingSubstanceUseDisclosure.comments}</p>
                            </div>
                            <p className="text-xs italic pt-2 border-t" style={{ color: 'var(--slds-g-color-text-weak)', borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                This record is view-only within the ITP. To edit it, use the youth's Substance Use records.
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button size="sm" variant="outline" onClick={() => setViewingSubstanceUseDisclosure(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assessment Details Modal — read-only view of a single existing assessment Connection */}
            <Dialog open={!!viewingSubstanceUseAssessment} onOpenChange={(open) => { if (!open) setViewingSubstanceUseAssessment(null); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Assessment Details</DialogTitle>
                        <DialogDescription className="sr-only">Read-only details for this substance use assessment</DialogDescription>
                    </DialogHeader>
                    {viewingSubstanceUseAssessment && (
                        <div className="space-y-3 py-2">
                            <div>
                                <p className="text-xs font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Date</p>
                                <p className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>{formatDate(viewingSubstanceUseAssessment.endDate)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Status</p>
                                <p className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>{viewingSubstanceUseAssessment.status}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Reason for Request</p>
                                <p className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>{viewingSubstanceUseAssessment.reasonForRequest}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Results</p>
                                <p className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>{viewingSubstanceUseAssessment.results}</p>
                            </div>
                            <p className="text-xs italic pt-2 border-t" style={{ color: 'var(--slds-g-color-text-weak)', borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                This record is view-only within the ITP. To edit it, use the youth's Connections records.
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button size="sm" variant="outline" onClick={() => setViewingSubstanceUseAssessment(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Supplemental Plan Details Modal — read-only view of a single existing plan */}
            <Dialog open={!!viewingSubstanceUseSupplementalPlan} onOpenChange={(open) => { if (!open) setViewingSubstanceUseSupplementalPlan(null); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Supplemental Plan Details</DialogTitle>
                        <DialogDescription className="sr-only">Read-only details for this supplemental plan</DialogDescription>
                    </DialogHeader>
                    {viewingSubstanceUseSupplementalPlan && (
                        <div className="space-y-3 py-2">
                            <div>
                                <p className="text-xs font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Start Date</p>
                                <p className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>{formatDate(viewingSubstanceUseSupplementalPlan.startDate)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Type</p>
                                <p className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>{viewingSubstanceUseSupplementalPlan.type}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Plan Description</p>
                                <p className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>{viewingSubstanceUseSupplementalPlan.planDescription}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>End Date</p>
                                <p className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>{viewingSubstanceUseSupplementalPlan.endDate}</p>
                            </div>
                            <p className="text-xs italic pt-2 border-t" style={{ color: 'var(--slds-g-color-text-weak)', borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                This record is view-only within the ITP. To edit it, use the youth's Treatment Planning records.
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button size="sm" variant="outline" onClick={() => setViewingSubstanceUseSupplementalPlan(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        <ConnectionFormDialog
            isOpen={isConnectionDialogOpen}
            onOpenChange={setIsConnectionDialogOpen}
            editingConnection={editingConnection}
            setEditingConnection={setEditingConnection}
            connections={connections}
            setConnections={setConnections}
            getNextParticipantId={getNextParticipantId}
            initialType="Care Planning Meeting"
            lockType={true}
        />
        </>
    );
}