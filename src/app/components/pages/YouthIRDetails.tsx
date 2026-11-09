import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Plus, Edit2, Trash2, AlertCircle, Save, ChevronDown, Upload, FileText, CheckCircle, Circle, Clock, X, Eye } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { toast } from "sonner";
import { YouthIRDetailsTab } from "./YouthIRDetailsTab";
import { YouthIRDialogsSection } from "./YouthIRDialogsSection";
import { formatMdy } from "../../lib/dateFormat";
import { getIncidentReportById, setIncidentReportStatus } from "../../data/incidentReportStore";
import { MediationMeetingModal, MediationMeetingData } from "./MediationMeetingModal";

// Mock data
const INCIDENT_ROLES = [
    "Restraint Consultant",
    "Youth Involved",
    "Staff Involved",
    "Witness",
    "DCFS Hotline Operator",
    "Police Officer",
    "School Personnel",
    "School",
    "Other"
];

const INCIDENT_TYPES = [
    "Verbal Aggression",
    "Suspended from Mercy Home",
    "Admitted to Inpatient Substance Abuse Program",
    "Substance Use",
    "Contraband – Drugs, Alcohol, or Paraphernalia",
    "Contraband – Weapon",
    "Contraband – Pornography",
    "Contraband – Other",
    "Contraband – Stolen Property",
    "Witnessed a Crime Off Campus",
    "Committed a Crime",
    "Arrest",
    "Vehicle Accident",
    "Threatened Staff",
    "Threatened Peer(s)",
    "Threatened Other(s)",
    "Hospitalization – Medical",
    "Hospitalization – Psychiatric",
    "Problematic Sexual Behavior",
    "Accidental Injury",
    "Alleged Victim of a Crime",
    "Theft",
    "Damage to Property",
    "Physical Aggression Toward Staff",
    "AWOL – Fewer Than 24 Hours",
    "Physical Aggression Toward Peer(s)",
    "Physical Aggression Toward Other(s)",
    "Smoking in Restricted Area",
    "Fire",
    "Suicidal Ideation",
    "Suicide Attempt",
    "Self‑Harm",
    "AWOL – More Than 24 Hours",
    "DCFS Hotline Call",
    "In‑School Suspension",
    "Out‑of‑School Suspension",
    "Expulsion",
    "Sent Home from School",
    "Restorative School Intervention",
    "Other School Incident",
    "Guest Policy Violation",
    "Self‑Harm Ideation",
    "ER Visit"
];

const SCHOOL_RELATED_INCIDENT_TYPES = [
    "In‑School Suspension",
    "Out‑of‑School Suspension",
    "Expulsion",
    "Sent Home from School",
    "Restorative School Intervention",
    "Other School Incident"
];

const LOCATION_OPTIONS = [
    "Campus",
    "School",
    "Community",
    "Pass",
    "Work",
    "Agency Vehicle",
    "Home",
    "Agency Trip",
    "Other"
];

const MOCK_CONSTITUENTS = [
    { id: 1, name: "Bear, Fozzie", type: "Youth", program: "Mahoney House" },
    { id: 2, name: "Frog, Kermit", type: "Youth", program: "Rydell House" },
    { id: 3, name: "Fraggle, Red", type: "Youth", program: "Mahoney House" },
    { id: 4, name: "Smith, John", type: "Staff", program: null },
    { id: 5, name: "Johnson, Sarah", type: "Staff", program: null },
    { id: 6, name: "Davis, Emily", type: "Guardian", program: null }
];

const CONSTITUENT_TYPES = ["Youth", "Staff", "Guardian", "Parent", "Family Member", "Social Worker", "Case Manager", "Other"];

const PROGRAMS = ["Mahoney House", "Rydell House", "Transitional Living", "Independent Living"];

const MOCK_SCHOOLS = [
    "Lincoln Park High School",
    "Roosevelt High School",
    "Washington Academy",
    "Jefferson Middle School"
];

const RELATIONSHIPS = [
    "Mother",
    "Father",
    "Guardian",
    "Sibling",
    "Caseworker",
    "Therapist",
    "Teacher",
    "Coach",
    "Other"
];

const RESTRAINT_TYPES = [
    "Child Control Position",
    "Interim",
    "Team Control",
    "Transport",
    "Other Form of Physical Intervention"
];

const REASON_FOR_RELEASE = [
    "Youth Exhibited Signs of Tension Reduction",
    "Youth Escaped Restraint",
    "Staff Injury Suspected",
    "Youth Injury Suspected",
    "Restraint Transitioned to Unsafe Position",
    "Environmental Safety Concerns",
    "Maximum Restraint Time Limit Reached",
    "Change Staff Involved",
    "Youth Required More Restrictive Hold"
];

const INVOLVEMENT_TYPES = [
    "Implement Hold",
    "Auxiliary"
];

const MOCK_MASTERS_LEVEL_STAFF = [
    { id: 101, name: "Anderson, Patricia", role: "Masters Level Administrative" },
    { id: 102, name: "Brown, Michael", role: "Masters Level Administrative" },
    { id: 103, name: "Chen, Linda", role: "Masters Level Administrative" }
];

const DEBRIEF_EMOTIONS = [
    "Angry", "Anxious", "Calm", "Confused", "Embarrassed",
    "Frustrated", "Hurt", "Overwhelmed", "Sad", "Scared", "Shame"
];

const DEBRIEF_TRIGGERS = [
    "Argument with peer", "Argument with staff", "Family contact",
    "School situation", "Medication change", "Lack of sleep",
    "Hunger", "Trauma reminder", "Loss of privilege", "Other"
];

const DEBRIEF_STRATEGIES = [
    "Deep breathing", "Taking space", "Talking to staff", "Physical activity",
    "Journaling", "Listening to music", "Art / drawing", "Calling a support person", "Other"
];

const MOCK_DEBRIEF_DATA = {
    conductedBy: "Anderson, Patricia",
    conductedDate: "2024-03-15",
    conductedTime: "14:30",
    youthEmotions: ["Frustrated", "Overwhelmed"],
    triggers: ["Argument with peer", "Lack of sleep"],
    youthStatement: "I was really upset because I hadn't slept well and then got into it with my roommate over something small. I know I shouldn't have reacted the way I did.",
    staffObservations: "Youth was visibly escalated upon return from school. De-escalation attempts were made before physical intervention was necessary. Youth was receptive to debrief and showed remorse.",
    youthPlan: "Youth agreed to use deep breathing and request space before reaching escalation point. Will discuss further with therapist at next scheduled session.",
    copingStrategies: ["Deep breathing", "Taking space", "Talking to staff"],
    safetyPlanUpdated: true,
    followUpRequired: true,
    followUpNotes: "Schedule check-in with therapist within 48 hours. Notify guardian of incident and debrief outcome.",
    masterLevelStaffName: "Brown, Michael",
    masterLevelStaffDate: "2024-03-15"
};

interface Individual {
    id: string;
    constituentId: number | null;
    constituentName: string;
    constituentType: string;
    program: string;
    incidentRole: string;
    incidentRoleOther: string;
    injured: boolean;
    restraint: boolean;
    hrNotifiedDate: string;
    comment: string;
}

interface PersonContacted {
    id: string;
    constituentId: number | null;
    constituentName: string;
    youthId: number | null;
    youthName: string;
    relationship: string;
    contactDateTime: string;
    comment: string;
}

interface LegalInvolvement {
    id: string;
    constituentId: number | null;
    constituentName: string;
    youthId: number | null;
    youthName: string;
    comment: string;
}

interface StaffInvolvement {
    id: string;
    staffId: number | null;
    staffName: string;
    involvement: string;
}

interface Restraint {
    id: string;
    startDate: string;
    startTimeHours: string;
    startTimeMinutes: string;
    startTimeSeconds: string;
    endDate: string;
    endTimeHours: string;
    endTimeMinutes: string;
    endTimeSeconds: string;
    type: string;
    reasonForRelease: string;
    staffInvolved: StaffInvolvement[];
}

interface Injury {
    id: string;
    resultOfRestraint: string;
    description: string;
    howDidInjuryOccur: string;
    firstAidAdministered: string;
    professionalMedicalTreatment: string;
    furtherMedicalFollowUp: boolean;
    medicalFollowUpDescription: string;
    comments: string;
}

export function YouthIRDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("details");
    // Expansion is now driven by activeTab - no separate expandedSections state needed

    // Overall Incident fields
    const [startDate, setStartDate] = useState("2025-04-15");
    const [startTimeHours, setStartTimeHours] = useState("14");
    const [startTimeMinutes, setStartTimeMinutes] = useState("30");
    const [startTimeSeconds, setStartTimeSeconds] = useState("00");
    const [endDate, setEndDate] = useState("2025-04-15");
    const [endTimeHours, setEndTimeHours] = useState("15");
    const [endTimeMinutes, setEndTimeMinutes] = useState("45");
    const [endTimeSeconds, setEndTimeSeconds] = useState("00");
    const [durationDays, setDurationDays] = useState("0");
    const [durationHours, setDurationHours] = useState("1");
    const [durationMinutes, setDurationMinutes] = useState("15");
    const [durationSeconds, setDurationSeconds] = useState("0");

    // Individuals Involved
    const [individuals, setIndividuals] = useState<Individual[]>([
        {
            id: "1",
            constituentId: 4,
            constituentName: "Smith, John",
            constituentType: "Staff",
            program: "",
            incidentRole: "Staff Involved",
            incidentRoleOther: "",
            injured: false,
            restraint: false,
            hrNotifiedDate: "",
            comment: "Report creator"
        },
        {
            id: "2",
            constituentId: 1,
            constituentName: "Bear, Fozzie",
            constituentType: "Youth",
            program: "Mahoney House",
            incidentRole: "Youth Involved",
            incidentRoleOther: "",
            injured: false,
            restraint: true,
            hrNotifiedDate: "",
            comment: "Primary youth involved"
        },
        {
            id: "3",
            constituentId: 2,
            constituentName: "Frog, Kermit",
            constituentType: "Youth",
            program: "Rydell House",
            incidentRole: "Youth Involved",
            incidentRoleOther: "",
            injured: false,
            restraint: false,
            hrNotifiedDate: "",
            comment: ""
        }
    ]);
    const [isAddingIndividual, setIsAddingIndividual] = useState(false);
    const [editingIndividualId, setEditingIndividualId] = useState<string | null>(null);
    const [currentIndividual, setCurrentIndividual] = useState<Individual>({
        id: "",
        constituentId: null,
        constituentName: "",
        constituentType: "",
        program: "",
        incidentRole: "",
        incidentRoleOther: "",
        injured: false,
        restraint: false,
        hrNotifiedDate: "",
        comment: ""
    });

    // Incident Classification
    const [selectedIncidentTypes, setSelectedIncidentTypes] = useState<string[]>(["Verbal Aggression"]);
    const [selectedSchool, setSelectedSchool] = useState("");

    // Location
    const [selectedLocations, setSelectedLocations] = useState<string[]>(["Campus"]);
    const [otherLocation, setOtherLocation] = useState("");

    // Overview Narrative
    const [overviewNarrative, setOverviewNarrative] = useState("");

    // Persons Contacted
    const [personsContacted, setPersonsContacted] = useState<PersonContacted[]>([]);
    const [isAddingPersonContacted, setIsAddingPersonContacted] = useState(false);
    const [editingPersonContactedId, setEditingPersonContactedId] = useState<string | null>(null);
    const [currentPersonContacted, setCurrentPersonContacted] = useState<PersonContacted>({
        id: "",
        constituentId: null,
        constituentName: "",
        youthId: null,
        youthName: "",
        relationship: "",
        contactDateTime: "",
        comment: ""
    });

    // Legal Involvement
    const [legalInvolvements, setLegalInvolvements] = useState<LegalInvolvement[]>([]);
    const [isAddingLegalInvolvement, setIsAddingLegalInvolvement] = useState(false);
    const [editingLegalInvolvementId, setEditingLegalInvolvementId] = useState<string | null>(null);
    const [currentLegalInvolvement, setCurrentLegalInvolvement] = useState<LegalInvolvement>({
        id: "",
        constituentId: null,
        constituentName: "",
        youthId: null,
        youthName: "",
        comment: ""
    });

    // Constituent Management
    const [constituents, setConstituents] = useState(MOCK_CONSTITUENTS);
    const [isAddingConstituent, setIsAddingConstituent] = useState(false);
    const [newConstituent, setNewConstituent] = useState({
        name: "",
        type: "",
        program: ""
    });

    // Youth General Tab State
    const [youthIncidentRole, setYouthIncidentRole] = useState("Youth Involved");
    const [youthIncidentRoleOther, setYouthIncidentRoleOther] = useState("");
    const [youthLocations, setYouthLocations] = useState<string[]>(["Campus"]);
    const [youthOverviewNarrative, setYouthOverviewNarrative] = useState("");
    const [youthSectionStatus, setYouthSectionStatus] = useState<"in-progress" | "complete">("in-progress");
    const [showLoadOverviewModal, setShowLoadOverviewModal] = useState(false);
    const [loadOverviewSource, setLoadOverviewSource] = useState("");

    // Youth Narrative Tab State
    const [youthNarrative, setYouthNarrative] = useState("");
    const [youthNarrativeStatus, setYouthNarrativeStatus] = useState<"in-progress" | "complete">("in-progress");
    const [showLoadNarrativeModal, setShowLoadNarrativeModal] = useState(false);
    const [loadNarrativeSource, setLoadNarrativeSource] = useState("");

    // Youth Restraints Tab State
    const [mastersLevelStaff, setMastersLevelStaff] = useState("");
    const [restraints, setRestraints] = useState<Restraint[]>([]);
    const [isAddingRestraint, setIsAddingRestraint] = useState(false);
    const [editingRestraintId, setEditingRestraintId] = useState<string | null>(null);
    const [currentRestraint, setCurrentRestraint] = useState<Restraint>({
        id: "",
        startDate: startDate,
        startTimeHours: "14",
        startTimeMinutes: "30",
        startTimeSeconds: "00",
        endDate: endDate,
        endTimeHours: "15",
        endTimeMinutes: "00",
        endTimeSeconds: "00",
        type: "",
        reasonForRelease: "",
        staffInvolved: []
    });
    const [isAddingStaffInvolvement, setIsAddingStaffInvolvement] = useState(false);
    const [editingStaffInvolvementId, setEditingStaffInvolvementId] = useState<string | null>(null);
    const [currentStaffInvolvement, setCurrentStaffInvolvement] = useState<StaffInvolvement>({
        id: "",
        staffId: null,
        staffName: "",
        involvement: ""
    });
    const [restraintAnalysis, setRestraintAnalysis] = useState("");
    const [youthCheckedForInjuries, setYouthCheckedForInjuries] = useState("");
    const [medicalProfessionalConsulted, setMedicalProfessionalConsulted] = useState("");
    const [medicalProfessionalComments, setMedicalProfessionalComments] = useState("");
    const [restraintsSectionStatus, setRestraintsSectionStatus] = useState<"in-progress" | "complete">("in-progress");

    // Youth Injuries Tab State
    const [injuries, setInjuries] = useState<Injury[]>([]);
    const [isAddingInjury, setIsAddingInjury] = useState(false);
    const [editingInjuryId, setEditingInjuryId] = useState<string | null>(null);
    const [currentInjury, setCurrentInjury] = useState<Injury>({
        id: "",
        resultOfRestraint: "",
        description: "",
        howDidInjuryOccur: "",
        firstAidAdministered: "",
        professionalMedicalTreatment: "",
        furtherMedicalFollowUp: false,
        medicalFollowUpDescription: "",
        comments: ""
    });
    const [injuriesSectionStatus, setInjuriesSectionStatus] = useState<"in-progress" | "complete">("in-progress");

    // Youth Response Tab State
    const [youthResponse, setYouthResponse] = useState("");
    const [responseSectionStatus, setResponseSectionStatus] = useState<"in-progress" | "complete">("in-progress");
    const [showLoadResponseModal, setShowLoadResponseModal] = useState(false);
    const [loadResponseSource, setLoadResponseSource] = useState("");

    // Youth Debrief Tab State
    const [debriefSectionStatus, setDebriefSectionStatus] = useState<"in-progress" | "complete">("in-progress");
    
    // Debrief Participants
    const [youthDebriefStaff, setYouthDebriefStaff] = useState<Array<{ id: number; staffId: number; staffName: string }>>([]);
    const [parentDebriefStaff, setParentDebriefStaff] = useState<Array<{ id: number; staffId: number; staffName: string }>>([]);
    const [teamDebriefStaff, setTeamDebriefStaff] = useState<Array<{ id: number; staffId: number; staffName: string }>>([]);
    const [unableToParticipate, setUnableToParticipate] = useState<Array<{ id: number; staffId: number; staffName: string }>>([]);
    
    const [isAddingDebriefParticipant, setIsAddingDebriefParticipant] = useState(false);
    const [currentParticipantType, setCurrentParticipantType] = useState<"youth" | "parent" | "team" | "unable" | null>(null);
    const [selectedStaffForDebrief, setSelectedStaffForDebrief] = useState("");
    
    // Youth Witness / Milieu Processing
    const [youthWitnessProcessing, setYouthWitnessProcessing] = useState("");
    
    // Debrief Reflections
    const [precipitatingFactors, setPrecipitatingFactors] = useState("");
    const [deEscalationTechniques, setDeEscalationTechniques] = useState("");
    const [prosOfIntervention, setProsOfIntervention] = useState("");
    const [consOfIntervention, setConsOfIntervention] = useState("");
    const [teamworkSuccesses, setTeamworkSuccesses] = useState("");
    const [teamworkConcerns, setTeamworkConcerns] = useState("");
    const [youthProcessingInput, setYouthProcessingInput] = useState("");
    const [parentProcessingInput, setParentProcessingInput] = useState("");
    const [staffTeamChanges, setStaffTeamChanges] = useState("");
    const [youthTeamChanges, setYouthTeamChanges] = useState("");
    const [responsesReflection, setResponsesReflection] = useState("");

    // Youth Substance Use Tab State (AC1-29)
    const [substanceUseSectionStatus, setSubstanceUseSectionStatus] = useState<"in-progress" | "complete">("in-progress");
    const [selfDisclosedSubstanceUse, setSelfDisclosedSubstanceUse] = useState("");
    const [substanceTestAdministered, setSubstanceTestAdministered] = useState("");
    const [relatedSubstanceTests, setRelatedSubstanceTests] = useState<Array<{
        id: string;
        dateTime: string;
        reason: string;
        newUse: string;
        results: string;
    }>>([]);
    const [isAddingSubstanceTest, setIsAddingSubstanceTest] = useState(false);
    const [editingSubstanceTestId, setEditingSubstanceTestId] = useState<string | null>(null);

    // Finalization State
    const [isFinalized, setIsFinalized] = useState(() => getIncidentReportById(Number(id))?.isFinalized ?? false);
    const irBusyRef = useRef(false);
    const [debriefSectionRequired, setDebriefSectionRequired] = useState(false);
    const [mediationConnections, setMediationConnections] = useState<MediationMeetingData[]>([]); // AC20-22: Mediation meetings
    const [mediationMeetingModalOpen, setMediationMeetingModalOpen] = useState(false);
    const [mediationViewOpen, setMediationViewOpen] = useState(false);
    const [mediationEditOpen, setMediationEditOpen] = useState(false);
    const [mediationDeleteConfirmOpen, setMediationDeleteConfirmOpen] = useState(false);
    const [mediationSelectedIndex, setMediationSelectedIndex] = useState<number | null>(null);
    const [sectionStatuses, setSectionStatuses] = useState<Record<string, "not-started" | "in-progress" | "complete">>({
        "overview-details": "in-progress",
        "overview-debrief": "not-started",
        "youth-1-general": "in-progress",
        "youth-1-narrative": "in-progress",
        "youth-1-restraints": "not-started",
        "youth-1-injuries": "not-started",
        "youth-1-response": "not-started",
        "youth-1-debrief": "not-started",
        "youth-1-substance-use": "not-started"
    });
    const [sectionContributors, setSectionContributors] = useState<Record<string, string[]>>({
        "overview-details": ["Smith, John"],
        "overview-debrief": [],
        "youth-1-general": ["Smith, John", "Johnson, Sarah"],
        "youth-1-narrative": ["Smith, John"],
        "youth-1-restraints": [],
        "youth-1-injuries": [],
        "youth-1-response": [],
        "youth-1-debrief": [],
        "youth-1-substance-use": []
    });

    // Mock Youth Data (would come from the incident report in real implementation)
    const currentYouth = {
        initials: "FB",
        name: "Bear, Fozzie",
        age: 16,
        program: "Mahoney House",
        role: "Youth Involved",
        residencyDateRange: "01/15/2024 - Present"
    };

    // Calculate duration when start/end dates change
    useEffect(() => {
        if (startDate && startTimeHours && startTimeMinutes && endDate && endTimeHours && endTimeMinutes) {
            const start = new Date(`${startDate}T${startTimeHours.padStart(2, '0')}:${startTimeMinutes.padStart(2, '0')}:${startTimeSeconds.padStart(2, '0')}`);
            const end = new Date(`${endDate}T${endTimeHours.padStart(2, '0')}:${endTimeMinutes.padStart(2, '0')}:${endTimeSeconds.padStart(2, '0')}`);
            
            if (end > start) {
                const diffMs = end.getTime() - start.getTime();
                const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
                
                setDurationDays(days.toString());
                setDurationHours(hours.toString());
                setDurationMinutes(minutes.toString());
                setDurationSeconds(seconds.toString());
            }
        }
    }, [startDate, startTimeHours, startTimeMinutes, startTimeSeconds, endDate, endTimeHours, endTimeMinutes, endTimeSeconds]);

    const showSchoolField = selectedIncidentTypes.some(type => 
        SCHOOL_RELATED_INCIDENT_TYPES.includes(type)
    );

    const showOtherLocation = selectedLocations.includes("Other");

    const constituentId = currentIndividual.constituentId;
    const constituent = constituentId != null ? constituents.find(c => c.id === constituentId) ?? null : null;
    const initials = currentYouth.initials;

    // Derived variables used by child components
    const youthId = activeTab.includes("-") ? activeTab.split("-").slice(1).join("-") : "";
    const youth = individuals.find(ind => ind.id === youthId && ind.constituentType === "Youth") ?? null;
    const nameParts = youth ? youth.constituentName.split(" ") : [];
    const staffId = selectedStaffForDebrief ? parseInt(selectedStaffForDebrief) : null;
    const staff = staffId != null ? constituents.find(c => c.id === staffId) ?? null : null;
    const newTest = { id: "", dateTime: "", reason: "", newUse: "", results: "" };
    const days = durationDays;
    const hours = durationHours;
    const minutes = durationMinutes;
    const seconds = durationSeconds;
    const start = startDate && startTimeHours && startTimeMinutes
        ? new Date(`${startDate}T${startTimeHours.padStart(2, '0')}:${startTimeMinutes.padStart(2, '0')}:${(startTimeSeconds || '00').padStart(2, '0')}`)
        : null;
    const end = endDate && endTimeHours && endTimeMinutes
        ? new Date(`${endDate}T${endTimeHours.padStart(2, '0')}:${endTimeMinutes.padStart(2, '0')}:${(endTimeSeconds || '00').padStart(2, '0')}`)
        : null;

    // Individual handlers
    const handleAddIndividual = () => {
        setIsAddingIndividual(true);
        setCurrentIndividual({
            id: "",
            constituentId: null,
            constituentName: "",
            constituentType: "",
            program: "",
            incidentRole: "",
            incidentRoleOther: "",
            injured: false,
            restraint: false,
            hrNotifiedDate: "",
            comment: ""
        });
    };

    const handleSaveIndividual = () => {
        if (!currentIndividual.constituentName || !currentIndividual.incidentRole) {
            toast.error("Please select a constituent and incident role");
            return;
        }

        if (currentIndividual.incidentRole === "Other" && !currentIndividual.incidentRoleOther) {
            toast.error("Please specify the incident role");
            return;
        }

        if (editingIndividualId) {
            setIndividuals(individuals.map(ind => 
                ind.id === editingIndividualId ? currentIndividual : ind
            ));
            toast.success("Individual updated successfully");
        } else {
            setIndividuals([...individuals, { ...currentIndividual, id: Date.now().toString() }]);
            toast.success("Individual added successfully");
        }

        setIsAddingIndividual(false);
        setEditingIndividualId(null);
    };

    const handleEditIndividual = (individual: Individual) => {
        setCurrentIndividual(individual);
        setEditingIndividualId(individual.id);
        setIsAddingIndividual(true);
    };

    const handleDeleteIndividual = (id: string) => {
        setIndividuals(individuals.filter(ind => ind.id !== id));
        toast.success("Individual removed");
    };

    const handleConstituentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const constituentId = parseInt(e.target.value);
        const constituent = constituents.find(c => c.id === constituentId);
        
        if (constituent) {
            setCurrentIndividual({
                ...currentIndividual,
                constituentId: constituent.id,
                constituentName: constituent.name,
                constituentType: constituent.type,
                program: constituent.type === "Youth" ? (constituent.program || "") : ""
            });
        }
    };

    const handleIncidentTypeToggle = (type: string) => {
        if (selectedIncidentTypes.includes(type)) {
            setSelectedIncidentTypes(selectedIncidentTypes.filter(t => t !== type));
        } else {
            setSelectedIncidentTypes([...selectedIncidentTypes, type]);
        }
    };

    const handleLocationToggle = (location: string) => {
        if (selectedLocations.includes(location)) {
            setSelectedLocations(selectedLocations.filter(l => l !== location));
        } else {
            setSelectedLocations([...selectedLocations, location]);
        }
    };

    // Person Contacted handlers
    const handleAddPersonContacted = () => {
        setIsAddingPersonContacted(true);
        setCurrentPersonContacted({
            id: "",
            constituentId: null,
            constituentName: "",
            youthId: null,
            youthName: "",
            relationship: "",
            contactDateTime: "",
            comment: ""
        });
    };

    const handleSavePersonContacted = () => {
        if (!currentPersonContacted.constituentName || !currentPersonContacted.contactDateTime) {
            toast.error("Please select a constituent and contact date/time");
            return;
        }

        if (editingPersonContactedId) {
            setPersonsContacted(personsContacted.map(pc => 
                pc.id === editingPersonContactedId ? currentPersonContacted : pc
            ));
            toast.success("Person contacted updated successfully");
        } else {
            setPersonsContacted([...personsContacted, { ...currentPersonContacted, id: Date.now().toString() }]);
            toast.success("Person contacted added successfully");
        }

        setIsAddingPersonContacted(false);
        setEditingPersonContactedId(null);
    };

    const handleEditPersonContacted = (person: PersonContacted) => {
        setCurrentPersonContacted(person);
        setEditingPersonContactedId(person.id);
        setIsAddingPersonContacted(true);
    };

    const handleDeletePersonContacted = (id: string) => {
        setPersonsContacted(personsContacted.filter(pc => pc.id !== id));
        toast.success("Person contacted removed");
    };

    // Legal Involvement handlers
    const handleAddLegalInvolvement = () => {
        setIsAddingLegalInvolvement(true);
        setCurrentLegalInvolvement({
            id: "",
            constituentId: null,
            constituentName: "",
            comment: ""
        });
    };

    const handleSaveLegalInvolvement = () => {
        if (!currentLegalInvolvement.constituentName) {
            toast.error("Please select a constituent");
            return;
        }

        if (editingLegalInvolvementId) {
            setLegalInvolvements(legalInvolvements.map(li => 
                li.id === editingLegalInvolvementId ? currentLegalInvolvement : li
            ));
            toast.success("Legal involvement updated successfully");
        } else {
            setLegalInvolvements([...legalInvolvements, { ...currentLegalInvolvement, id: Date.now().toString() }]);
            toast.success("Legal involvement added successfully");
        }

        setIsAddingLegalInvolvement(false);
        setEditingLegalInvolvementId(null);
    };

    const handleEditLegalInvolvement = (involvement: LegalInvolvement) => {
        setCurrentLegalInvolvement(involvement);
        setEditingLegalInvolvementId(involvement.id);
        setIsAddingLegalInvolvement(true);
    };

    const handleDeleteLegalInvolvement = (id: string) => {
        setLegalInvolvements(legalInvolvements.filter(li => li.id !== id));
        toast.success("Legal involvement removed");
    };

    // End must not be before start where both are entered.
    const pad2 = (v: string) => (v || "0").padStart(2, "0");
    const incidentTimeError =
        startDate && endDate &&
        `${endDate}T${pad2(endTimeHours)}:${pad2(endTimeMinutes)}:${pad2(endTimeSeconds)}` <
            `${startDate}T${pad2(startTimeHours)}:${pad2(startTimeMinutes)}:${pad2(startTimeSeconds)}`
            ? "End date and time must not be before the start date and time."
            : "";

    const handleSaveAll = () => {
        if (irBusyRef.current || isFinalized) return;
        if (incidentTimeError) {
            toast.error(incidentTimeError);
            return;
        }
        irBusyRef.current = true;
        const rec = getIncidentReportById(Number(id));
        // A "Not Started" report becomes "In Progress" once saved; other statuses are kept.
        const res = rec && rec.status === "Not Started"
            ? setIncidentReportStatus(rec.id, "In Progress")
            : { ok: true as const };
        irBusyRef.current = false;
        if (!res.ok) {
            toast.error(`Incident Report could not be saved. Your entries are preserved. ${res.message}`);
            return;
        }
        toast.success("Incident Report saved (demo session)");
    };

    const getYouthInvolved = () => {
        return individuals.filter(ind => ind.constituentType === "Youth");
    };

    // Constituent Handlers
    const handleAddConstituent = () => {
        if (!newConstituent.name || !newConstituent.type) {
            toast.error("Please enter constituent name and type");
            return;
        }

        if (newConstituent.type === "Youth" && !newConstituent.program) {
            toast.error("Please select a program for Youth constituent");
            return;
        }

        const newId = Math.max(...constituents.map(c => c.id), 0) + 1;
        const constituentToAdd = {
            id: newId,
            name: newConstituent.name,
            type: newConstituent.type,
            program: newConstituent.type === "Youth" ? newConstituent.program : null
        };

        setConstituents([...constituents, constituentToAdd]);
        
        // Auto-select the newly added constituent
        setCurrentPersonContacted({
            ...currentPersonContacted,
            constituentId: newId,
            constituentName: newConstituent.name
        });

        setIsAddingConstituent(false);
        setNewConstituent({ name: "", type: "", program: "" });
        toast.success("Constituent added successfully");
    };

    const handleCancelAddConstituent = () => {
        setIsAddingConstituent(false);
        setNewConstituent({ name: "", type: "", program: "" });
    };

    // Youth General Tab Handlers
    const handleLoadOverview = () => {
        if (loadOverviewSource === "overview-details") {
            setYouthOverviewNarrative(overviewNarrative);
        } else if (loadOverviewSource === "youth-general") {
            setYouthOverviewNarrative(youthOverviewNarrative);
        }
        setShowLoadOverviewModal(false);
        toast.success("Overview loaded successfully");
    };

    const handleSaveYouthGeneral = () => {
        toast.success("Youth General section saved successfully");
    };

    const handleCompleteYouthSection = () => {
        setYouthSectionStatus("complete");
        toast.success("Youth General section marked as complete");
    };

    const handleReopenYouthSection = () => {
        setYouthSectionStatus("in-progress");
        toast.success("Youth General section reopened for editing");
    };

    // Youth Narrative handlers
    const handleSaveYouthNarrative = () => {
        toast.success("Youth Narrative saved");
    };

    const handleCompleteYouthNarrative = () => {
        if (!youthNarrative.trim()) {
            toast.error("Detailed Narrative is required to complete this section");
            return;
        }
        setYouthNarrativeStatus("complete");
        toast.success("Youth Narrative section marked as complete");
    };

    const handleReopenYouthNarrative = () => {
        setYouthNarrativeStatus("in-progress");
        toast.success("Youth Narrative section reopened for editing");
    };

    const handleLoadNarrative = () => {
        if (loadNarrativeSource) {
            // Mock narrative loading - in production, load from the selected source
            const mockNarrative = "This is a loaded narrative from " + loadNarrativeSource + ". The youth was involved in an incident...";
            setYouthNarrative(mockNarrative);
            setShowLoadNarrativeModal(false);
            setLoadNarrativeSource("");
            toast.success("Narrative loaded successfully");
        }
    };

    // Youth Restraints Handlers
    const handleAddRestraint = () => {
        setCurrentRestraint({
            id: "",
            startDate: startDate,
            startTimeHours: "14",
            startTimeMinutes: "30",
            startTimeSeconds: "00",
            endDate: endDate,
            endTimeHours: "15",
            endTimeMinutes: "00",
            endTimeSeconds: "00",
            type: "",
            reasonForRelease: "",
            staffInvolved: []
        });
        setIsAddingRestraint(true);
        setEditingRestraintId(null);
    };

    const handleEditRestraint = (restraint: Restraint) => {
        setCurrentRestraint(restraint);
        setEditingRestraintId(restraint.id);
        setIsAddingRestraint(true);
    };

    const handleDeleteRestraint = (id: string) => {
        setRestraints(restraints.filter(r => r.id !== id));
        toast.success("Restraint deleted successfully");
    };

    const handleSaveRestraint = () => {
        if (!currentRestraint.type || !currentRestraint.reasonForRelease) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (editingRestraintId) {
            setRestraints(restraints.map(r => r.id === editingRestraintId ? currentRestraint : r));
            toast.success("Restraint updated successfully");
        } else {
            const newRestraint = {
                ...currentRestraint,
                id: Date.now().toString()
            };
            setRestraints([...restraints, newRestraint]);
            toast.success("Restraint added successfully");
        }

        setIsAddingRestraint(false);
        setEditingRestraintId(null);
    };

    const handleAddStaffInvolvement = () => {
        setCurrentStaffInvolvement({
            id: "",
            staffId: null,
            staffName: "",
            involvement: ""
        });
        setIsAddingStaffInvolvement(true);
        setEditingStaffInvolvementId(null);
    };

    const handleEditStaffInvolvement = (staff: StaffInvolvement) => {
        setCurrentStaffInvolvement(staff);
        setEditingStaffInvolvementId(staff.id);
        setIsAddingStaffInvolvement(true);
    };

    const handleDeleteStaffInvolvement = (id: string) => {
        setCurrentRestraint({
            ...currentRestraint,
            staffInvolved: currentRestraint.staffInvolved.filter(s => s.id !== id)
        });
        toast.success("Staff involvement deleted successfully");
    };

    const handleViewMediation = (index: number) => {
        setMediationSelectedIndex(index);
        setMediationViewOpen(true);
    };

    const handleEditMediation = (index: number) => {
        setMediationSelectedIndex(index);
        setMediationEditOpen(true);
    };

    const handleDeleteMediation = (index: number) => {
        setMediationSelectedIndex(index);
        setMediationDeleteConfirmOpen(true);
    };

    const handleConfirmDeleteMediation = () => {
        if (mediationSelectedIndex !== null) {
            setMediationConnections(prev => prev.filter((_, i) => i !== mediationSelectedIndex));
            toast.success("Mediation Meeting deleted.");
        }
        setMediationDeleteConfirmOpen(false);
        setMediationSelectedIndex(null);
    };

    const handleSaveEditedMediation = (meeting: MediationMeetingData) => {
        if (mediationSelectedIndex !== null) {
            setMediationConnections(prev =>
                prev.map((m, i) => (i === mediationSelectedIndex ? meeting : m))
            );
            toast.success("Mediation Meeting updated successfully.");
        }
        setMediationEditOpen(false);
        setMediationSelectedIndex(null);
    };

    const handleSaveStaffInvolvement = () => {
        if (!currentStaffInvolvement.staffName || !currentStaffInvolvement.involvement) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (editingStaffInvolvementId) {
            setCurrentRestraint({
                ...currentRestraint,
                staffInvolved: currentRestraint.staffInvolved.map(s => 
                    s.id === editingStaffInvolvementId ? currentStaffInvolvement : s
                )
            });
            toast.success("Staff involvement updated successfully");
        } else {
            const newStaffInvolvement = {
                ...currentStaffInvolvement,
                id: Date.now().toString()
            };
            setCurrentRestraint({
                ...currentRestraint,
                staffInvolved: [...currentRestraint.staffInvolved, newStaffInvolvement]
            });
            toast.success("Staff involvement added successfully");
        }

        setIsAddingStaffInvolvement(false);
        setEditingStaffInvolvementId(null);
    };

    const calculateRestraintDuration = (restraint: Restraint) => {
        if (!restraint.startDate || !restraint.endDate) return "—";
        
        const start = new Date(`${restraint.startDate}T${restraint.startTimeHours.padStart(2, '0')}:${restraint.startTimeMinutes.padStart(2, '0')}:${restraint.startTimeSeconds.padStart(2, '0')}`);
        const end = new Date(`${restraint.endDate}T${restraint.endTimeHours.padStart(2, '0')}:${restraint.endTimeMinutes.padStart(2, '0')}:${restraint.endTimeSeconds.padStart(2, '0')}`);
        
        const diffMs = end.getTime() - start.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    const handleSaveYouthRestraints = () => {
        toast.success("Youth Restraints section saved successfully");
    };

    const handleCompleteYouthRestraints = () => {
        setRestraintsSectionStatus("complete");
        toast.success("Youth Restraints section marked as complete");
    };

    const handleReopenYouthRestraints = () => {
        setRestraintsSectionStatus("in-progress");
        toast.success("Youth Restraints section reopened for editing");
    };

    // Get staff members already associated with incident report (for prioritization in dropdown)
    const getStaffAssociatedWithIncident = () => {
        return individuals
            .filter(ind => ind.constituentType === "Staff")
            .map(ind => ({ id: ind.constituentId, name: ind.constituentName }));
    };

    // Youth Injuries Handlers
    const handleAddInjury = () => {
        setCurrentInjury({
            id: "",
            resultOfRestraint: "",
            description: "",
            howDidInjuryOccur: "",
            firstAidAdministered: "",
            professionalMedicalTreatment: "",
            furtherMedicalFollowUp: false,
            medicalFollowUpDescription: "",
            comments: ""
        });
        setIsAddingInjury(true);
        setEditingInjuryId(null);
    };

    const handleEditInjury = (injury: Injury) => {
        setCurrentInjury(injury);
        setEditingInjuryId(injury.id);
        setIsAddingInjury(true);
    };

    const handleDeleteInjury = (id: string) => {
        setInjuries(injuries.filter(i => i.id !== id));
        toast.success("Injury deleted successfully");
    };

    const handleSaveInjury = () => {
        if (!currentInjury.description || !currentInjury.howDidInjuryOccur) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (currentInjury.furtherMedicalFollowUp && !currentInjury.medicalFollowUpDescription) {
            toast.error("Description of Medical Follow-Up Needed is required");
            return;
        }

        if (editingInjuryId) {
            setInjuries(injuries.map(i => i.id === editingInjuryId ? currentInjury : i));
            toast.success("Injury updated successfully");
        } else {
            const newInjury = {
                ...currentInjury,
                id: Date.now().toString()
            };
            setInjuries([...injuries, newInjury]);
            toast.success("Injury added successfully");
        }

        setIsAddingInjury(false);
        setEditingInjuryId(null);
    };

    const handleSaveYouthInjuries = () => {
        toast.success("Youth Injuries section saved successfully");
    };

    const handleCompleteYouthInjuries = () => {
        setInjuriesSectionStatus("complete");
        toast.success("Youth Injuries section marked as complete");
    };

    const handleReopenYouthInjuries = () => {
        setInjuriesSectionStatus("in-progress");
        toast.success("Youth Injuries section reopened for editing");
    };

    // Youth Response Handlers
    const handleSaveYouthResponse = () => {
        toast.success("Youth Response section saved successfully");
    };

    const handleCompleteYouthResponse = () => {
        if (!youthResponse.trim()) {
            toast.error("Detailed Response is required to complete this section");
            return;
        }
        setResponseSectionStatus("complete");
        toast.success("Youth Response section marked as complete");
    };

    const handleReopenYouthResponse = () => {
        setResponseSectionStatus("in-progress");
        toast.success("Youth Response section reopened for editing");
    };

    const handleLoadResponse = () => {
        if (!loadResponseSource) {
            toast.error("Please select a source");
            return;
        }

        // Mock loading logic - in real implementation, would load from selected source
        if (loadResponseSource === "youth-response") {
            setYouthResponse(youthResponse || "Previously entered response...");
        }

        setShowLoadResponseModal(false);
        setLoadResponseSource("");
        toast.success("Response loaded successfully");
    };

    // Youth Debrief Handlers
    const handleOpenAddParticipant = (type: "youth" | "parent" | "team" | "unable") => {
        setCurrentParticipantType(type);
        setIsAddingDebriefParticipant(true);
        setSelectedStaffForDebrief("");
    };

    const handleAddDebriefParticipant = () => {
        if (!selectedStaffForDebrief) {
            toast.error("Please select a staff member");
            return;
        }

        const staffId = parseInt(selectedStaffForDebrief);
        const staff = constituents.find(c => c.id === staffId);
        
        if (!staff) return;

        const newParticipant = {
            id: Date.now(),
            staffId: staff.id,
            staffName: staff.name
        };

        // Add to appropriate list based on type
        switch (currentParticipantType) {
            case "youth":
                setYouthDebriefStaff([...youthDebriefStaff, newParticipant]);
                break;
            case "parent":
                setParentDebriefStaff([...parentDebriefStaff, newParticipant]);
                break;
            case "team":
                setTeamDebriefStaff([...teamDebriefStaff, newParticipant]);
                break;
            case "unable":
                setUnableToParticipate([...unableToParticipate, newParticipant]);
                break;
        }

        setIsAddingDebriefParticipant(false);
        setSelectedStaffForDebrief("");
        setCurrentParticipantType(null);
        toast.success("Participant added successfully");
    };

    const handleRemoveDebriefParticipant = (id: number, type: "youth" | "parent" | "team" | "unable") => {
        switch (type) {
            case "youth":
                setYouthDebriefStaff(youthDebriefStaff.filter(p => p.id !== id));
                break;
            case "parent":
                setParentDebriefStaff(parentDebriefStaff.filter(p => p.id !== id));
                break;
            case "team":
                setTeamDebriefStaff(teamDebriefStaff.filter(p => p.id !== id));
                break;
            case "unable":
                setUnableToParticipate(unableToParticipate.filter(p => p.id !== id));
                break;
        }
        toast.success("Participant removed");
    };

    const handleSaveYouthDebrief = () => {
        toast.success("Youth Debrief section saved successfully");
    };

    const handleCompleteYouthDebrief = () => {
        // Validate required field
        if (!youthWitnessProcessing) {
            toast.error("Youth witness/milieu processing field is required");
            return;
        }

        // Validate all reflection fields
        if (!precipitatingFactors.trim() || !deEscalationTechniques.trim() || 
            !prosOfIntervention.trim() || !consOfIntervention.trim() ||
            !teamworkSuccesses.trim() || !teamworkConcerns.trim() ||
            !youthProcessingInput.trim() || !parentProcessingInput.trim() ||
            !staffTeamChanges.trim() || !youthTeamChanges.trim() ||
            !responsesReflection.trim()) {
            toast.error("All debrief reflection fields are required to complete this section");
            return;
        }

        setDebriefSectionStatus("complete");
        toast.success("Youth Debrief section marked as complete");
    };

    const handleReopenYouthDebrief = () => {
        setDebriefSectionStatus("in-progress");
        toast.success("Youth Debrief section reopened for editing");
    };

    // Youth Substance Use Handlers (AC21-29)
    const handleSaveYouthSubstanceUse = () => {
        toast.success("Youth Substance Use section saved");
    };

    const handleCompleteYouthSubstanceUse = () => {
        // AC20: Validation - if test was administered, at least one test must be added
        if (substanceTestAdministered === "Yes" && relatedSubstanceTests.length === 0) {
            toast.error("At least one substance use test must be added before completing this section");
            return;
        }

        setSubstanceUseSectionStatus("complete");
        toast.success("Youth Substance Use section marked as complete");
    };

    const handleReopenYouthSubstanceUse = () => {
        setSubstanceUseSectionStatus("in-progress");
        toast.success("Youth Substance Use section reopened for editing");
    };

    const handleAddSubstanceTest = () => {
        setIsAddingSubstanceTest(true);
        setEditingSubstanceTestId(null);
    };

    const handleEditSubstanceTest = (testId: string) => {
        setEditingSubstanceTestId(testId);
        setIsAddingSubstanceTest(true);
    };

    const handleRemoveSubstanceTest = (testId: string) => {
        setRelatedSubstanceTests(prev => prev.filter(test => test.id !== testId));
        toast.success("Substance use test removed");
    };

    const getParticipantModalTitle = () => {
        switch (currentParticipantType) {
            case "youth": return "Staff Involved in Youth Debrief";
            case "parent": return "Staff Involved in Parent/Guardian Debrief";
            case "team": return "Staff Involved in Team Debrief";
            case "unable": return "Staff and/or Witnesses Unable to Participate";
            default: return "Add Participant";
        }
    };

    // Get staff associated with incident for prioritized list
    const getStaffForDebriefPiclist = () => {
        const associatedStaff = individuals
            .filter(ind => ind.constituentType === "Staff")
            .map(ind => constituents.find(c => c.id === ind.constituentId))
            .filter(Boolean);
        
        const allStaff = constituents.filter(c => c.type === "Staff");
        
        return { associatedStaff, allStaff };
    };

    const { allStaff, associatedStaff } = getStaffForDebriefPiclist();

    // Finalization Handlers
    const handleFinalize = () => {
        if (irBusyRef.current || isFinalized) return;
        if (incidentTimeError) {
            toast.error(incidentTimeError);
            return;
        }
        irBusyRef.current = true;
        const rec = getIncidentReportById(Number(id));
        const res = rec ? setIncidentReportStatus(rec.id, "Finalized") : { ok: true as const };
        irBusyRef.current = false;
        if (!res.ok) {
            toast.error(`Incident Report could not be finalized. ${res.message}`);
            return;
        }
        setIsFinalized(true);
        toast.success("Incident Report has been finalized and locked");
    };

    const handleUnFinalize = () => {
        if (irBusyRef.current || !isFinalized) return;
        irBusyRef.current = true;
        const rec = getIncidentReportById(Number(id));
        const res = rec ? setIncidentReportStatus(rec.id, "In Progress") : { ok: true as const };
        irBusyRef.current = false;
        if (!res.ok) {
            toast.error(`Incident Report could not be unlocked. ${res.message}`);
            return;
        }
        setIsFinalized(false);
        toast.success("Incident Report has been unlocked");
    };

    const getStatusIcon = (status: "not-started" | "in-progress" | "complete") => {
        switch (status) {
            case "complete":
                return <CheckCircle className="h-4 w-4" style={{ color: '#28A745' }} />;
            case "in-progress":
                return <Clock className="h-4 w-4" style={{ color: '#FFC107' }} />;
            case "not-started":
                return <Circle className="h-4 w-4" style={{ color: '#6C757D' }} />;
        }
    };

    const getStatusLabel = (status: "not-started" | "in-progress" | "complete") => {
        switch (status) {
            case "complete":
                return "Complete";
            case "in-progress":
                return "In Progress";
            case "not-started":
                return "Not Started";
        }
    };

    // Check if Substance Use should be displayed
    const showSubstanceUseSection = selectedIncidentTypes.includes("Substance Use");

    return (
        <>
        <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
            {/* Header Section */}
            <div 
                className="px-6 py-4"
                style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                }}
            >
                {/* Back Button */}
                <div className="mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/incident-reports')}
                        className="h-8 px-3 text-xs -ml-3"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Incident Reports
                    </Button>
                </div>

                {/* Title */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {/* Youth Initials Icon */}
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
                                Incident Report
                            </div>
                            <h1 
                                className="text-xl font-medium"
                                style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                                Bear, Fozzie
                            </h1>
                        </div>
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

                {/* Metadata Grid - Single Row Layout */}
                <div className="flex items-center gap-6 w-full">
                {/* Metadata */}
                <div className="flex items-center gap-6 flex-1 min-w-0 overflow-hidden">
              
                  {/* Youth Names */}
                  <div className="flex-1 min-w-0">
                    <label
                      className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Youth Names
                    </label>
                    <span
                      className="text-sm font-medium block truncate"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {getYouthInvolved().map(y => y.constituentName).join(", ") || "—"}
                    </span>
                  </div>
              
                  {/* Start Date/Time */}
                  <div className="flex-1 min-w-0">
                    <label
                      className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Start Date/Time
                    </label>
                    <span
                      className="text-sm block truncate"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {startDate && startTimeHours && startTimeMinutes
                        ? `${formatMdy(new Date(startDate))} ${startTimeHours.padStart(2, '0')}:${startTimeMinutes.padStart(2, '0')}:${startTimeSeconds.padStart(2, '0')}`
                        : "—"}
                    </span>
                  </div>
              
                  {/* End Date/Time */}
                  <div className="flex-1 min-w-0">
                    <label
                      className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      End Date/Time
                    </label>
                    <span
                      className="text-sm block truncate"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {endDate && endTimeHours && endTimeMinutes
                        ? `${formatMdy(new Date(endDate))} ${endTimeHours.padStart(2, '0')}:${endTimeMinutes.padStart(2, '0')}:${endTimeSeconds.padStart(2, '0')}`
                        : "—"}
                    </span>
                  </div>
              
                  {/* Duration */}
                  <div className="flex-1 min-w-0">
                    <label
                      className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Duration of Incident
                    </label>
                    <span
                      className="text-sm block truncate"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {`${durationDays}d ${durationHours}h ${durationMinutes}m ${durationSeconds}s`}
                    </span>
                  </div>
              
                  {/* Location */}
                  <div className="flex-1 min-w-0">
                    <label
                      className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Location
                    </label>
                    <span
                      className="text-sm block truncate"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {selectedLocations.length > 0
                        ? selectedLocations
                            .map(loc => loc === "Other" && otherLocation ? otherLocation : loc)
                            .join(", ")
                        : "—"}
                    </span>
                  </div>
              
                  {/* Incident Types */}
                  <div className="flex-1 min-w-0">
                    <label
                      className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Incident Types
                    </label>
                    <span
                      className="text-sm block truncate"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {selectedIncidentTypes.length > 0
                        ? selectedIncidentTypes.join(", ")
                        : "—"}
                    </span>
                  </div>
              
                </div>
              
                {/* Action */}
                <div className="flex-shrink-0">
                  <Button
                    onClick={handleSaveAll}
                    disabled={isFinalized}
                    title={isFinalized ? "Finalized reports are read-only. Un-Finalize to edit." : undefined}
                    className="h-8 px-4 text-xs text-white rounded-full whitespace-nowrap"
                    style={{
                      backgroundColor: 'var(--color-brand-primary)'
                    }}
                  >
                    Save Changes
                  </Button>
                  {incidentTimeError && (
                    <p role="alert" className="text-xs mt-1" style={{ color: '#C23934' }}>{incidentTimeError}</p>
                  )}
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
                            {/* AC23, AC24: Overview Section */}
                            <div>
                                {/* Category Header */}
                                <button
                                    onClick={() => {
                                        // Set to first section in Overview when clicking category
                                        setActiveTab("details");
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md text-[13px] font-semibold transition-colors mb-1"
                                    style={{
                                        backgroundColor: (activeTab === 'details' || activeTab === 'overview-debrief' || activeTab === 'finalization') ? '#145F33' : 'transparent',
                                        color: (activeTab === 'details' || activeTab === 'overview-debrief' || activeTab === 'finalization') ? 'white' : 'var(--slds-g-color-text-default)'
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="flex-1 truncate">Overview</span>
                                        <div className="flex items-center gap-2">
                                            <span 
                                                className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                                                style={{
                                                    backgroundColor: (activeTab === 'details' || activeTab === 'overview-debrief' || activeTab === 'finalization') ? 'rgba(255, 255, 255, 0.2)' : 'rgba(20, 95, 51, 0.1)',
                                                    color: (activeTab === 'details' || activeTab === 'overview-debrief' || activeTab === 'finalization') ? 'white' : '#145F33'
                                                }}
                                            >
                                                0/3
                                            </span>
                                            
                                        </div>
                                    </div>
                                </button>

                                {/* AC24: Nested Sections - Details and Finalization */}
                                {(activeTab === 'details' || activeTab === 'overview-debrief' || activeTab === 'finalization') && (
                                    <div className="ml-4 space-y-0.5 mb-2">
                                        <button
                                            onClick={() => setActiveTab("details")}
                                            className="w-full text-left px-3 py-1.5 text-[13px] transition-colors flex items-center justify-between group hover:bg-gray-50 rounded-md"
                                            style={{
                                                backgroundColor: activeTab === "details" ? 'rgba(20, 95, 51, 0.08)' : 'transparent',
                                                color: activeTab === "details" ? '#145F33' : 'var(--slds-g-color-text-default)',
                                                fontWeight: activeTab === "details" ? 600 : 400
                                            }}
                                        >
                                            <span className="truncate">Details</span>
                                        </button>
                                        {debriefSectionRequired && (
                                            <button
                                                onClick={() => setActiveTab("overview-debrief")}
                                                className="w-full text-left px-3 py-1.5 text-[13px] transition-colors flex items-center justify-between group hover:bg-gray-50 rounded-md"
                                                style={{
                                                    backgroundColor: activeTab === "overview-debrief" ? 'rgba(20, 95, 51, 0.08)' : 'transparent',
                                                    color: activeTab === "overview-debrief" ? '#145F33' : 'var(--slds-g-color-text-default)',
                                                    fontWeight: activeTab === "overview-debrief" ? 600 : 400
                                                }}
                                            >
                                                <span className="truncate">Debrief</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setActiveTab("finalization")}
                                            className="w-full text-left px-3 py-1.5 text-[13px] transition-colors flex items-center justify-between group hover:bg-gray-50 rounded-md"
                                            style={{
                                                backgroundColor: activeTab === "finalization" ? 'rgba(20, 95, 51, 0.08)' : 'transparent',
                                                color: activeTab === "finalization" ? '#145F33' : 'var(--slds-g-color-text-default)',
                                                fontWeight: activeTab === "finalization" ? 600 : 400
                                            }}
                                        >
                                            <span className="truncate">Finalization</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* AC25, AC26, AC27, AC34: Youth-Specific Sections */}
                            {individuals
                                .filter(ind => ind.constituentType === "Youth")
                                .map((youth, youthIndex) => {
                                    const youthKey = `youth-${youth.id}`;
                                    
                                    // AC26: Calculate total subsections - conditional count based on restraint
                                    // Base: General, Narrative, Youth Injuries, Response, Substance Use = 5
                                    // + Restraints (only if youth.restraint === true) = 1
                                    // Note: Debrief has been moved to Overview section
                                    const totalSubsections = youth.restraint ? 6 : 5;
                                    
                                    // Mock completion count (AC28, AC29) - in production, calculate from actual status
                                    const completedCount = 2; // Example: 2 out of 7
                                    
                                    // Check if any of this youth's sections are active
                                    const isYouthActive = activeTab === `general-${youth.id}` || 
                                                         activeTab === `narrative-${youth.id}` || 
                                                         activeTab === `restraints-${youth.id}` || 
                                                         activeTab === `injuries-${youth.id}` || 
                                                         activeTab === `response-${youth.id}` || 
                                                         activeTab === `debrief-${youth.id}` ||
                                                         activeTab === `substance-use-${youth.id}`;
                                    
                                    return (
                                        <div key={youthKey}>
                                            {/* AC25, AC28, AC29: Youth Category Header with Completion Count */}
                                            <button
                                                onClick={() => {
                                                    // Set to first section for this youth when clicking category
                                                    setActiveTab(`general-${youth.id}`);
                                                }}
                                                className="w-full text-left px-3 py-2 rounded-md text-[13px] font-semibold transition-colors mb-1"
                                                style={{
                                                    backgroundColor: isYouthActive ? '#145F33' : 'transparent',
                                                    color: isYouthActive ? 'white' : 'var(--slds-g-color-text-default)'
                                                }}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="flex-1 truncate">{youth.constituentName}</span>
                                                    <div className="flex items-center gap-2">
                                                        {/* AC28, AC29: Completion Count Badge */}
                                                        <span 
                                                            className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                                                            style={{
                                                                backgroundColor: isYouthActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(20, 95, 51, 0.1)',
                                                                color: isYouthActive ? 'white' : '#145F33'
                                                            }}
                                                        >
                                                            {completedCount}/{totalSubsections}
                                                        </span>
                                                        
                                                    </div>
                                                </div>
                                            </button>

                                            {/* AC26, AC27, AC34: Youth Subsections */}
                                            {isYouthActive && (
                                                <div className="ml-4 space-y-0.5 mb-2">
                                                    {/* General */}
                                                    <button
                                                        onClick={() => setActiveTab(`general-${youth.id}`)}
                                                        className="w-full text-left px-3 py-1.5 text-[13px] transition-colors flex items-center justify-between gap-2 group hover:bg-gray-50 rounded-md"
                                                        style={{
                                                            backgroundColor: activeTab === `general-${youth.id}` ? 'rgba(20, 95, 51, 0.08)' : 'transparent',
                                                            color: activeTab === `general-${youth.id}` ? '#145F33' : 'var(--slds-g-color-text-default)',
                                                            fontWeight: activeTab === `general-${youth.id}` ? 600 : 400
                                                        }}
                                                    >
                                                        <span className="truncate">General</span>
                                                        {/* AC30, AC31, AC32, AC33: Status Icon */}
                                                        <div 
                                                            className="h-2 w-2 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: '#28a745' }}
                                                            title="Complete"
                                                        />
                                                    </button>

                                                    {/* Narrative */}
                                                    <button
                                                        onClick={() => setActiveTab(`narrative-${youth.id}`)}
                                                        className="w-full text-left px-3 py-1.5 text-[13px] transition-colors flex items-center justify-between gap-2 group hover:bg-gray-50 rounded-md"
                                                        style={{
                                                            backgroundColor: activeTab === `narrative-${youth.id}` ? 'rgba(20, 95, 51, 0.08)' : 'transparent',
                                                            color: activeTab === `narrative-${youth.id}` ? '#145F33' : 'var(--slds-g-color-text-default)',
                                                            fontWeight: activeTab === `narrative-${youth.id}` ? 600 : 400
                                                        }}
                                                    >
                                                        <span className="truncate">Narrative</span>
                                                        {/* AC30, AC31, AC32, AC33: Status Icon - In Progress */}
                                                        <div 
                                                            className="h-2 w-2 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: '#ffc107' }}
                                                            title="In Progress"
                                                        />
                                                    </button>

                                                    {/* Restraints - Only show if youth was restrained */}
                                                    {youth.restraint && (
                                                        <button
                                                            onClick={() => setActiveTab(`restraints-${youth.id}`)}
                                                            className="w-full text-left px-3 py-1.5 text-[13px] transition-colors flex items-center justify-between gap-2 group hover:bg-gray-50 rounded-md"
                                                            style={{
                                                                backgroundColor: activeTab === `restraints-${youth.id}` ? 'rgba(20, 95, 51, 0.08)' : 'transparent',
                                                                color: activeTab === `restraints-${youth.id}` ? '#145F33' : 'var(--slds-g-color-text-default)',
                                                                fontWeight: activeTab === `restraints-${youth.id}` ? 600 : 400
                                                            }}
                                                        >
                                                            <span className="truncate">Restraints</span>
                                                            {/* AC30, AC31, AC32, AC33: Status Icon - Not Started */}
                                                            <div 
                                                                className="h-2 w-2 rounded-full flex-shrink-0"
                                                                style={{ backgroundColor: '#cbd5e0' }}
                                                                title="Not Started"
                                                            />
                                                        </button>
                                                    )}

                                                    {/* Youth Injuries */}
                                                    <button
                                                        onClick={() => setActiveTab(`injuries-${youth.id}`)}
                                                        className="w-full text-left px-3 py-1.5 text-[13px] transition-colors flex items-center justify-between gap-2 group hover:bg-gray-50 rounded-md"
                                                        style={{
                                                            backgroundColor: activeTab === `injuries-${youth.id}` ? 'rgba(20, 95, 51, 0.08)' : 'transparent',
                                                            color: activeTab === `injuries-${youth.id}` ? '#145F33' : 'var(--slds-g-color-text-default)',
                                                            fontWeight: activeTab === `injuries-${youth.id}` ? 600 : 400
                                                        }}
                                                    >
                                                        <span className="truncate">Youth Injuries</span>
                                                        {/* AC30, AC31, AC32, AC33: Status Icon - Not Started */}
                                                        <div 
                                                            className="h-2 w-2 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: '#cbd5e0' }}
                                                            title="Not Started"
                                                        />
                                                    </button>

                                                    {/* Response */}
                                                    <button
                                                        onClick={() => setActiveTab(`response-${youth.id}`)}
                                                        className="w-full text-left px-3 py-1.5 text-[13px] transition-colors flex items-center justify-between gap-2 group hover:bg-gray-50 rounded-md"
                                                        style={{
                                                            backgroundColor: activeTab === `response-${youth.id}` ? 'rgba(20, 95, 51, 0.08)' : 'transparent',
                                                            color: activeTab === `response-${youth.id}` ? '#145F33' : 'var(--slds-g-color-text-default)',
                                                            fontWeight: activeTab === `response-${youth.id}` ? 600 : 400
                                                        }}
                                                    >
                                                        <span className="truncate">Response</span>
                                                        {/* AC30, AC31, AC32, AC33: Status Icon - Not Started */}
                                                        <div 
                                                            className="h-2 w-2 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: '#cbd5e0' }}
                                                            title="Not Started"
                                                        />
                                                    </button>

                                                    {/* Substance Use - Always displayed */}
                                                    <button
                                                        onClick={() => setActiveTab(`substance-use-${youth.id}`)}
                                                        className="w-full text-left px-3 py-1.5 text-[13px] transition-colors flex items-center justify-between gap-2 group hover:bg-gray-50 rounded-md"
                                                        style={{
                                                            backgroundColor: activeTab === `substance-use-${youth.id}` ? 'rgba(20, 95, 51, 0.08)' : 'transparent',
                                                            color: activeTab === `substance-use-${youth.id}` ? '#145F33' : 'var(--slds-g-color-text-default)',
                                                            fontWeight: activeTab === `substance-use-${youth.id}` ? 600 : 400
                                                        }}
                                                    >
                                                        <span className="truncate">Substance Use</span>
                                                        {/* AC30, AC31, AC32, AC33: Status Icon - Not Started */}
                                                        <div 
                                                            className="h-2 w-2 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: '#cbd5e0' }}
                                                            title="Not Started"
                                                        />
                                                    </button>
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
                    <fieldset disabled={isFinalized && activeTab !== "finalization"} className="min-w-0 border-0 p-0 m-0">
                    {/* Overview > Details Tab */}
                    <YouthIRDetailsTab
                      activeTab={activeTab}
                      constituent={constituent}
                      constituentId={constituentId}
                      constituents={constituents}
                      currentIndividual={currentIndividual}
                      currentLegalInvolvement={currentLegalInvolvement}
                      currentPersonContacted={currentPersonContacted}
                      days={days}
                      debriefSectionRequired={debriefSectionRequired}
                      durationDays={durationDays}
                      durationHours={durationHours}
                      durationMinutes={durationMinutes}
                      durationSeconds={durationSeconds}
                      editingIndividualId={editingIndividualId}
                      editingLegalInvolvementId={editingLegalInvolvementId}
                      editingPersonContactedId={editingPersonContactedId}
                      end={end}
                      endDate={endDate}
                      endTimeHours={endTimeHours}
                      endTimeMinutes={endTimeMinutes}
                      endTimeSeconds={endTimeSeconds}
                      getYouthInvolved={getYouthInvolved}
                      handleAddIndividual={handleAddIndividual}
                      handleAddLegalInvolvement={handleAddLegalInvolvement}
                      handleAddPersonContacted={handleAddPersonContacted}
                      handleConstituentSelect={handleConstituentSelect}
                      handleDeleteIndividual={handleDeleteIndividual}
                      handleDeleteLegalInvolvement={handleDeleteLegalInvolvement}
                      handleDeletePersonContacted={handleDeletePersonContacted}
                      handleEditIndividual={handleEditIndividual}
                      handleEditLegalInvolvement={handleEditLegalInvolvement}
                      handleEditPersonContacted={handleEditPersonContacted}
                      handleIncidentTypeToggle={handleIncidentTypeToggle}
                      handleLocationToggle={handleLocationToggle}
                      handleSaveIndividual={handleSaveIndividual}
                      handleSaveLegalInvolvement={handleSaveLegalInvolvement}
                      handleSavePersonContacted={handleSavePersonContacted}
                      hours={hours}
                      individuals={individuals}
                      initials={initials}
                      isAddingIndividual={isAddingIndividual}
                      isAddingLegalInvolvement={isAddingLegalInvolvement}
                      isAddingPersonContacted={isAddingPersonContacted}
                      legalInvolvements={legalInvolvements}
                      minutes={minutes}
                      otherLocation={otherLocation}
                      overviewNarrative={overviewNarrative}
                      personsContacted={personsContacted}
                      seconds={seconds}
                      selectedIncidentTypes={selectedIncidentTypes}
                      selectedLocations={selectedLocations}
                      selectedSchool={selectedSchool}
                      setCurrentIndividual={setCurrentIndividual}
                      setCurrentLegalInvolvement={setCurrentLegalInvolvement}
                      setCurrentPersonContacted={setCurrentPersonContacted}
                      setDebriefSectionRequired={setDebriefSectionRequired}
                      setDurationDays={setDurationDays}
                      setDurationHours={setDurationHours}
                      setDurationMinutes={setDurationMinutes}
                      setDurationSeconds={setDurationSeconds}
                      setEditingIndividualId={setEditingIndividualId}
                      setEditingLegalInvolvementId={setEditingLegalInvolvementId}
                      setEditingPersonContactedId={setEditingPersonContactedId}
                      setEndDate={setEndDate}
                      setEndTimeHours={setEndTimeHours}
                      setEndTimeMinutes={setEndTimeMinutes}
                      setEndTimeSeconds={setEndTimeSeconds}
                      setIsAddingIndividual={setIsAddingIndividual}
                      setIsAddingLegalInvolvement={setIsAddingLegalInvolvement}
                      setIsAddingPersonContacted={setIsAddingPersonContacted}
                      setOtherLocation={setOtherLocation}
                      setOverviewNarrative={setOverviewNarrative}
                      setSelectedSchool={setSelectedSchool}
                      setStartDate={setStartDate}
                      setStartTimeHours={setStartTimeHours}
                      setStartTimeMinutes={setStartTimeMinutes}
                      setStartTimeSeconds={setStartTimeSeconds}
                      showOtherLocation={showOtherLocation}
                      showSchoolField={showSchoolField}
                      start={start}
                      startDate={startDate}
                      startTimeHours={startTimeHours}
                      startTimeMinutes={startTimeMinutes}
                      startTimeSeconds={startTimeSeconds}
                      youth={youth}
                      youthId={youthId}
                    />
                    {activeTab === "overview-debrief" && debriefSectionRequired && (
                        <Card
                            className="shadow-sm"
                            style={{
                                backgroundColor: 'var(--slds-g-color-background-base)',
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-card-radius-border)'
                            }}
                        >
                            <CardHeader style={{ borderBottom: '1px solid #e0e5ee', paddingTop: '12px', paddingBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                <CardTitle
                                    className="text-base font-semibold"
                                    style={{ color: 'var(--slds-g-color-text-default)', fontSize: '0.8rem', margin: 0, lineHeight: 1.2, display: 'flex', alignItems: 'center' }}
                                >
                                    Debrief
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Youth Header Section */}
                                <div className="pt-4">
                                    <div
                                        className="rounded-lg p-4"
                                        style={{
                                            backgroundColor: 'var(--slds-g-color-background-alt)',
                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Youth Initials Icon */}
                                            <div
                                                className="flex items-center justify-center rounded-full flex-shrink-0"
                                                style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    fontSize: '18px',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {(() => {
                                                    // Get youth name from individuals based on restrained youth
                                                    const youth = individuals.find(ind => ind.restraint && ind.constituentType === "Youth");
                                                    if (!youth) return "Y";
                                                    const nameParts = youth.constituentName.split(' ');
                                                    const initials = nameParts.length >= 2
                                                        ? `${nameParts[0][0]}${nameParts[1][0]}`
                                                        : nameParts[0][0];
                                                    return initials.toUpperCase();
                                                })()}
                                            </div>
                                            {/* Youth Information */}
                                            <div className="flex-1 grid grid-cols-3 gap-4">
                                                <div>
                                                    <div
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Youth Name
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {(() => {
                                                            const youth = individuals.find(ind => ind.restraint && ind.constituentType === "Youth");
                                                            return youth?.constituentName || "N/A";
                                                        })()}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Age
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        16
                                                    </div>
                                                </div>
                                                <div>
                                                    <div
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Program
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {(() => {
                                                            const youth = individuals.find(ind => ind.restraint && ind.constituentType === "Youth");
                                                            return youth?.program || "N/A";
                                                        })()}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Role
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {(() => {
                                                            const youth = individuals.find(ind => ind.restraint && ind.constituentType === "Youth");
                                                            return youth?.incidentRole || "N/A";
                                                        })()}
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <div
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Residency Date Range
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        01/15/2024 - Present
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Debrief Instructions */}
                                <div
                                    className="rounded-lg p-4"
                                    style={{
                                        backgroundColor: 'rgba(232, 244, 248, 0.6)',
                                        border: '1px solid rgba(84, 105, 141, 0.2)'
                                    }}
                                >
                                    <h4
                                        className="text-sm font-semibold mb-3"
                                        style={{ color: 'var(--slds-g-color-text-default)' }}
                                    >
                                        Debrief Instructions
                                    </h4>
                                    <div className="space-y-2" style={{ color: '#54698D', fontSize: '0.6rem' }}>
                                        <p>
                                            <strong>If a restraint occurred, you are required to complete this tab after a period of time for reflection.</strong> Otherwise, please discuss with your Manager or Director to determine if you should complete this tab.
                                        </p>
                                        <p>
           className="text-[15px] text-[14px]"                                  The Narrative should be written in third person. The first mention of Staff should include full name and title; subsequent mentions should only be first name. The primary Youth should be referenced by first name. Additional Youth should be referenced by first and last initials. Do not use 'this writer' or 'this reporter' when referring to yourself.
                                        </p>
                                        <p className="font-semibold mt-3">
                                            The COPING Model – reconnect, debrief for learning, repair the harm, reintegrate into the community
                                        </p>
                                        <ul className="space-y-1 ml-4">
                                            <li><strong>CONTROL</strong> – Get Calm. Youth and Staff are regulated</li>
                                            <li><strong>ORIENT</strong> – What happened? Listen and share perspectives/facts</li>
                                            <li><strong>PATTERNS</strong> – Get Curious. Chase the "Why?"</li>
                                            <li><strong>INVESTIGATE</strong> – Brainstorm. Youth and Staff changes or resources</li>
                                            <li><strong>NEGOTIATE</strong> – Plan. You and staff agree to try new things</li>
                                            <li><strong>GIVE</strong> – Build skill. Praise effort, promote growth and accountability.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Debrief Participants Section */}
                                <div>
                                    <h3
                                        className="text-sm font-semibold mb-4"
                                        style={{ color: 'var(--slds-g-color-text-default)' }}
                                    >
                                        Debrief Participants
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Staff Involved in Youth Debrief */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label
                                                    className="text-xs font-medium uppercase tracking-wide"
                                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                >
                                                    Staff Involved in Youth Debrief
                                                </label>
                                                {debriefSectionStatus === "in-progress" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOpenAddParticipant("youth")}
                                                        style={{
                                                            backgroundColor: 'var(--color-brand-primary)',
                                                            color: 'white',
                                                            borderRadius: '9999px'
                                                        }}
                                                        className="h-7 px-2 text-xs"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Add
                                                    </Button>
                                                )}
                                            </div>
                                            {youthDebriefStaff.length > 0 ? (
                                                <div
                                                    className="border rounded p-3"
                                                    style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                >
                                                    <div className="flex flex-wrap gap-2">
                                                        {youthDebriefStaff.map(participant => (
                                                            <div
                                                                key={participant.id}
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded text-sm"
                                                                style={{
                                                                    backgroundColor: 'var(--slds-g-color-background-alt)',
                                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                                }}
                                                            >
                                                                <span style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {participant.staffName}
                                                                </span>
                                                                {debriefSectionStatus === "in-progress" && (
                                                                    <button
                                                                        onClick={() => handleRemoveDebriefParticipant(participant.id, "youth")}
                                                                        className="hover:opacity-70"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    className="text-center py-4 text-sm rounded"
                                                    style={{
                                                        color: 'var(--slds-g-color-text-weak)',
                                                        backgroundColor: 'var(--slds-g-color-background-alt)',
                                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                                    }}
                                                >
                                                    No participants added yet
                                                </div>
                                            )}
                                        </div>

                                        {/* Staff Involved in Parent/Guardian Debrief */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label
                                                    className="text-xs font-medium uppercase tracking-wide"
                                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                >
                                                    Staff Involved in Parent/Guardian Debrief
                                                </label>
                                                {debriefSectionStatus === "in-progress" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOpenAddParticipant("parent")}
                                                        style={{
                                                            backgroundColor: 'var(--color-brand-primary)',
                                                            color: 'white',
                                                            borderRadius: '9999px'
                                                        }}
                                                        className="h-7 px-2 text-xs"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Add
                                                    </Button>
                                                )}
                                            </div>
                                            {parentDebriefStaff.length > 0 ? (
                                                <div
                                                    className="border rounded p-3"
                                                    style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                >
                                                    <div className="flex flex-wrap gap-2">
                                                        {parentDebriefStaff.map(participant => (
                                                            <div
                                                                key={participant.id}
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded text-sm"
                                                                style={{
                                                                    backgroundColor: 'var(--slds-g-color-background-alt)',
                                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                                }}
                                                            >
                                                                <span style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {participant.staffName}
                                                                </span>
                                                                {debriefSectionStatus === "in-progress" && (
                                                                    <button
                                                                        onClick={() => handleRemoveDebriefParticipant(participant.id, "parent")}
                                                                        className="hover:opacity-70"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    className="text-center py-4 text-sm rounded"
                                                    style={{
                                                        color: 'var(--slds-g-color-text-weak)',
                                                        backgroundColor: 'var(--slds-g-color-background-alt)',
                                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                                    }}
                                                >
                                                    No participants added yet
                                                </div>
                                            )}
                                        </div>

                                        {/* Staff Involved in Team Debrief */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label
                                                    className="text-xs font-medium uppercase tracking-wide"
                                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                >
                                                    Staff Involved in Team Debrief
                                                </label>
                                                {debriefSectionStatus === "in-progress" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOpenAddParticipant("team")}
                                                        style={{
                                                            backgroundColor: 'var(--color-brand-primary)',
                                                            color: 'white',
                                                            borderRadius: '9999px'
                                                        }}
                                                        className="h-7 px-2 text-xs"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Add
                                                    </Button>
                                                )}
                                            </div>
                                            {teamDebriefStaff.length > 0 ? (
                                                <div
                                                    className="border rounded p-3"
                                                    style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                >
                                                    <div className="flex flex-wrap gap-2">
                                                        {teamDebriefStaff.map(participant => (
                                                            <div
                                                                key={participant.id}
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded text-sm"
                                                                style={{
                                                                    backgroundColor: 'var(--slds-g-color-background-alt)',
                                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                                }}
                                                            >
                                                                <span style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {participant.staffName}
                                                                </span>
                                                                {debriefSectionStatus === "in-progress" && (
                                                                    <button
                                                                        onClick={() => handleRemoveDebriefParticipant(participant.id, "team")}
                                                                        className="hover:opacity-70"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    className="text-center py-4 text-sm rounded"
                                                    style={{
                                                        color: 'var(--slds-g-color-text-weak)',
                                                        backgroundColor: 'var(--slds-g-color-background-alt)',
                                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                                    }}
                                                >
                                                    No participants added yet
                                                </div>
                                            )}
                                        </div>

                                        {/* Staff and/or Witnesses Unable to Participate */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label
                                                    className="text-xs font-medium uppercase tracking-wide"
                                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                >
                                                    Staff and/or Witnesses Unable to Participate
                                                </label>
                                                {debriefSectionStatus === "in-progress" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOpenAddParticipant("unable")}
                                                        style={{
                                                            backgroundColor: 'var(--color-brand-primary)',
                                                            color: 'white',
                                                            borderRadius: '9999px'
                                                        }}
                                                        className="h-7 px-2 text-xs"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Add
                                                    </Button>
                                                )}
                                            </div>
                                            {unableToParticipate.length > 0 ? (
                                                <div
                                                    className="border rounded p-3"
                                                    style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                >
                                                    <div className="flex flex-wrap gap-2">
                                                        {unableToParticipate.map(participant => (
                                                            <div
                                                                key={participant.id}
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded text-sm"
                                                                style={{
                                                                    backgroundColor: 'var(--slds-g-color-background-alt)',
                                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                                }}
                                                            >
                                                                <span style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {participant.staffName}
                                                                </span>
                                                                {debriefSectionStatus === "in-progress" && (
                                                                    <button
                                                                        onClick={() => handleRemoveDebriefParticipant(participant.id, "unable")}
                                                                        className="hover:opacity-70"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    className="text-center py-4 text-sm rounded"
                                                    style={{
                                                        color: 'var(--slds-g-color-text-weak)',
                                                        backgroundColor: 'var(--slds-g-color-background-alt)',
                                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                                    }}
                                                >
                                                    No participants added yet
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Youth Witness / Milieu Processing */}
                                <div>
                                    <label
                                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                    >
                                        Is there a plan for youth witness/milieu processing? <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        value={youthWitnessProcessing}
                                        onChange={(e) => setYouthWitnessProcessing(e.target.value)}
                                        disabled={debriefSectionStatus === "complete"}
                                        className="w-full h-9 text-sm px-3 rounded"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white'
                                        }}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No/Not Indicated">No/Not Indicated</option>
                                    </select>
                                </div>

                                {/* Debrief Reflections Section */}
                                <div>
                                    <h3
                                        className="text-sm font-semibold mb-4"
                                        style={{ color: 'var(--slds-g-color-text-default)' }}
                                    >
                                        Debrief Reflections
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Precipitating factors */}
                                        <div>
                                            <label
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Precipitating factors, warning signs, and preventative staff responses <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={precipitatingFactors}
                                                onChange={(e) => setPrecipitatingFactors(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter precipitating factors..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* De-escalation techniques */}
                                        <div>
                                            <label
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Identify de‑escalation techniques and regulation strategies used during the crisis and/or physical intervention to help you regain self-control <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={deEscalationTechniques}
                                                onChange={(e) => setDeEscalationTechniques(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter de-escalation techniques..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* Pros of Intervention */}
                                        <div>
                                            <label
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Pros of Intervention <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={prosOfIntervention}
                                                onChange={(e) => setProsOfIntervention(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter pros of intervention..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* Cons of Intervention */}
                                        <div>
                                            <label
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Cons of Intervention <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={consOfIntervention}
                                                onChange={(e) => setConsOfIntervention(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter cons of intervention..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* Teamwork Successes */}
                                        <div>
                                            <label
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Teamwork Successes <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={teamworkSuccesses}
                                                onChange={(e) => setTeamworkSuccesses(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter teamwork successes..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* Teamwork Concerns */}
                                        <div>
                                            <label
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Teamwork Concerns <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={teamworkConcerns}
                                                onChange={(e) => setTeamworkConcerns(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter teamwork concerns..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* General Input from Youth Processing */}
                                        <div>
                                            <label
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                General Input and Needs from Youth Processing <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={youthProcessingInput}
                                                onChange={(e) => setYouthProcessingInput(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter general input and needs from youth processing..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* General Input from Parent/Guardian Processing */}
                                        <div>
                                            <label
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                General Input and Needs from Parent/Guardian Processing <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={parentProcessingInput}
                                                onChange={(e) => setParentProcessingInput(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter general input and needs from parent/guardian processing..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* Staff Team Changes */}
                                        <div>
                                            <label
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Staff Team Changes <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={staffTeamChanges}
                                                onChange={(e) => setStaffTeamChanges(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter staff team changes..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* Youth Team Changes */}
                                        <div>
                                            <label
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Youth Team Changes <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={youthTeamChanges}
                                                onChange={(e) => setYouthTeamChanges(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter youth team changes..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* Reflection on responses */}
                                        <div>
                                            <label
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Reflect on responses that were or will be implemented for this youth <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={responsesReflection}
                                                onChange={(e) => setResponsesReflection(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter reflection on responses..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section Actions */}
                                <div
                                    className="flex items-center justify-end gap-2 pt-4"
                                    style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}
                                >
                                    {debriefSectionStatus === "in-progress" ? (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => navigate('/incident-reports')}
                                                className="h-8 px-3 text-xs"
                                                style={{ borderRadius: '9999px' }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSaveYouthDebrief}
                                                style={{
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    borderRadius: '9999px'
                                                }}
                                                className="h-8 px-3 text-xs"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleCompleteYouthDebrief}
                                                style={{
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    borderRadius: '9999px'
                                                }}
                                                className="h-8 px-3 text-xs"
                                            >
                                                Complete Section
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={handleReopenYouthDebrief}
                                            style={{
                                                backgroundColor: 'var(--color-brand-primary)',
                                                color: 'white',
                                                borderRadius: '9999px'
                                            }}
                                            className="h-8 px-3 text-xs"
                                        >
                                            Re-Open Section
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Overview > Finalization Tab */}
                    {activeTab === "finalization" && (
                        <Card 
                            className="shadow-sm"
                            style={{
                                backgroundColor: 'var(--slds-g-color-background-base)',
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-card-radius-border)'
                            }}
                        >
                            <CardHeader style={{ borderBottom: '1px solid #e0e5ee', paddingTop: '12px', paddingBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                <CardTitle 
                                    className="text-base font-semibold"
                                    style={{ color: 'var(--slds-g-color-text-default)', fontSize: '0.8rem', margin: 0, lineHeight: 1.2, display: 'flex', alignItems: 'center' }}
                                >
                                    Finalization
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Contributors & Status Table */}
                                <div className="pt-4">
                                    <h3 
                                        className="text-sm font-semibold mb-4"
                                        style={{ color: 'var(--slds-g-color-text-default)' }}
                                    >
                                        Contributors & Status
                                    </h3>

                                    <div 
                                        className="border rounded app-scroll-x"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                    >
                                        <table className="w-full">
                                            <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                <tr>
                                                    <th 
                                                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Section
                                                    </th>
                                                    <th 
                                                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Contributors
                                                    </th>
                                                    <th 
                                                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Overview > Details Row */}
                                                <tr 
                                                    className="border-t"
                                                    style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                >
                                                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        Overview &gt; Details
                                                    </td>
                                                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {sectionContributors["overview-details"] && sectionContributors["overview-details"].length > 0 
                                                            ? sectionContributors["overview-details"].join(", ") 
                                                            : "—"}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(sectionStatuses["overview-details"])}
                                                            <span className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {getStatusLabel(sectionStatuses["overview-details"])}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Youth Sections - Loop through each youth */}
                                                {individuals
                                                    .filter(ind => ind.constituentType === "Youth")
                                                    .map((youth, index) => {
                                                        const youthNumber = index + 1;
                                                        const youthSections = [
                                                            { key: `youth-${youthNumber}-general`, label: `${youth.constituentName} > General`, show: true },
                                                            { key: `youth-${youthNumber}-narrative`, label: `${youth.constituentName} > Narrative`, show: true },
                                                            // AC8: Only show Restraints if Restraint = True
                                                            { key: `youth-${youthNumber}-restraints`, label: `${youth.constituentName} > Restraints`, show: youth.restraint === true },
                                                            // AC9: Only show Youth Injuries if Injured = True
                                                            { key: `youth-${youthNumber}-injuries`, label: `${youth.constituentName} > Youth Injuries`, show: youth.injured === true },
                                                            { key: `youth-${youthNumber}-response`, label: `${youth.constituentName} > Response`, show: true },
                                                            // AC10: Only show Substance Use if incident type includes it
                                                            { key: `youth-${youthNumber}-substance-use`, label: `${youth.constituentName} > Substance Use`, show: showSubstanceUseSection }
                                                        ];

                                                        return youthSections
                                                            .filter(section => section.show)
                                                            .map((section) => (
                                                                <tr 
                                                                    key={section.key}
                                                                    className="border-t"
                                                                    style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                                >
                                                                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                        {section.label}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                        {sectionContributors[section.key] && sectionContributors[section.key].length > 0 
                                                                            ? sectionContributors[section.key].join(", ") 
                                                                            : "—"}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <div className="flex items-center gap-2">
                                                                            {getStatusIcon(sectionStatuses[section.key] || "not-started")}
                                                                            <span className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                                {getStatusLabel(sectionStatuses[section.key] || "not-started")}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ));
                                                    })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Mediation Section */}
                                <div className="pt-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 
                                            className="text-sm font-semibold"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Mediation
                                        </h3>
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={() => setMediationMeetingModalOpen(true)}
                                        >
                                            Schedule Mediation Meeting
                                        </Button>
                                    </div>

                                    <div 
                                        className="border rounded app-scroll-x"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                    >
                                        <table className="w-full">
                                            <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                <tr>
                                                    <th
                                                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Date/Time of Meeting
                                                    </th>
                                                    <th
                                                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Attendees
                                                    </th>
                                                    <th
                                                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Comments
                                                    </th>
                                                    <th
                                                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* AC20-22: Display all Mediation Connections */}
                                                {(() => {
                                                    if (mediationConnections.length === 0) {
                                                        return (
                                                            <tr>
                                                                <td
                                                                    colSpan={4}
                                                                    className="px-4 py-8 text-center text-sm"
                                                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                                >
                                                                    No mediation meetings scheduled
                                                                </td>
                                                            </tr>
                                                        );
                                                    }

                                                    return mediationConnections.map((mediation, index: number) => (
                                                        <tr
                                                            key={index}
                                                            className="border-t"
                                                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                        >
                                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {mediation.dateTime || "—"}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {mediation.attendees || "—"}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {mediation.comments || "—"}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => handleViewMediation(index)}
                                                                        title="View"
                                                                        aria-label="View mediation meeting"
                                                                        style={{
                                                                            display: "inline-flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            width: "32px",
                                                                            height: "32px",
                                                                            borderRadius: "9999px",
                                                                            border: "none",
                                                                            cursor: "pointer",
                                                                            backgroundColor: "transparent",
                                                                            color: "var(--slds-g-color-text-weak)",
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-alt)";
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.currentTarget.style.backgroundColor = "transparent";
                                                                        }}
                                                                    >
                                                                        <Eye className="h-3.5 w-3.5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleEditMediation(index)}
                                                                        title="Edit"
                                                                        aria-label="Edit mediation meeting"
                                                                        style={{
                                                                            display: "inline-flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            width: "32px",
                                                                            height: "32px",
                                                                            borderRadius: "9999px",
                                                                            border: "none",
                                                                            cursor: "pointer",
                                                                            backgroundColor: "transparent",
                                                                            color: "var(--slds-g-color-text-weak)",
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-alt)";
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.currentTarget.style.backgroundColor = "transparent";
                                                                        }}
                                                                    >
                                                                        <Edit2 className="h-3.5 w-3.5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteMediation(index)}
                                                                        title="Delete"
                                                                        aria-label="Delete mediation meeting"
                                                                        style={{
                                                                            display: "inline-flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            width: "32px",
                                                                            height: "32px",
                                                                            borderRadius: "9999px",
                                                                            border: "none",
                                                                            cursor: "pointer",
                                                                            backgroundColor: "transparent",
                                                                            color: "#DC2626",
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.currentTarget.style.backgroundColor = "#fef2f2";
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.currentTarget.style.backgroundColor = "transparent";
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ));
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Finalization Actions */}
                                <div 
                                    className="flex items-center justify-end gap-3 pt-4"
                                    style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}
                                >
                                    {!isFinalized ? (
                                        <Button
                                            size="sm"
                                            onClick={handleFinalize}
                                            style={{
                                                backgroundColor: 'var(--color-brand-primary)',
                                                color: 'white',
                                                borderRadius: '9999px'
                                            }}
                                            className="h-9 px-4 text-sm"
                                        >
                                            Finalize
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={handleUnFinalize}
                                            style={{
                                                backgroundColor: 'var(--color-brand-primary)',
                                                color: 'white',
                                                borderRadius: '9999px'
                                            }}
                                            className="h-9 px-4 text-sm"
                                        >
                                            Un-Finalize
                                        </Button>
                                    )}
                                </div>

                                {/* Finalization Status Banner */}
                                {isFinalized && (
                                    <div 
                                        className="rounded-lg p-4 flex items-start gap-3"
                                        style={{ 
                                            backgroundColor: 'rgba(40, 167, 69, 0.1)',
                                            border: '1px solid rgba(40, 167, 69, 0.3)'
                                        }}
                                    >
                                        <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#28A745' }} />
                                        <div>
                                            <p className="text-sm font-semibold mb-1" style={{ color: '#1E7E34' }}>
                                                Incident Report Finalized
                                            </p>
                                            <p className="text-sm" style={{ color: '#1E7E34' }}>
                                                All sections of this Incident Report are locked and cannot be edited. Select "Un-Finalize" to unlock and resume editing.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Youth > General Tab */}
                    {activeTab.startsWith("general-") && (() => {
                        const youthId = activeTab.replace("general-", "");
                        const youth = individuals.find(ind => ind.id === youthId && ind.constituentType === "Youth");
                        
                        if (!youth) return null;

                        // Helper function to get youth initials
                        const getYouthInitials = (name: string) => {
                            const parts = name.split(' ');
                            if (parts.length >= 2) {
                                return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                            }
                            return name.substring(0, 2).toUpperCase();
                        };

                        return (
                            <Card 
                                className="shadow-sm"
                                style={{
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    borderRadius: 'var(--slds-c-card-radius-border)'
                                }}
                            >
                                <CardHeader style={{ borderBottom: '1px solid #e0e5ee', paddingTop: '12px', paddingBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                    <CardTitle 
                                        className="text-base font-semibold"
                                        style={{ color: 'var(--slds-g-color-text-default)', fontSize: '0.8rem', margin: 0, lineHeight: 1.2, display: 'flex', alignItems: 'center' }}
                                    >
                                        Youth - General
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Youth Header Section */}
                                    <div className="pt-4">
                                        <div 
                                            className="rounded-lg p-4"
                                            style={{ 
                                                backgroundColor: 'var(--slds-g-color-background-alt)',
                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                            }}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Youth Initials Icon */}
                                                
                                                
                                                {/* Youth Information */}
                                                <div className="flex-1 grid grid-cols-3 gap-4">
                                                    <div>
                                                        <div 
                                                            className="text-xs font-medium uppercase tracking-wide mb-1"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Youth Name
                                                        </div>
                                                        <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {currentYouth.name}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div 
                                                            className="text-xs font-medium uppercase tracking-wide mb-1"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Age
                                                        </div>
                                                        <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {currentYouth.age}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div 
                                                            className="text-xs font-medium uppercase tracking-wide mb-1"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Program
                                                        </div>
                                                        <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {currentYouth.program}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div 
                                                            className="text-xs font-medium uppercase tracking-wide mb-1"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Role
                                                        </div>
                                                        <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {currentYouth.role}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <div 
                                                            className="text-xs font-medium uppercase tracking-wide mb-1"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Residency Date Range
                                                        </div>
                                                        <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {currentYouth.residencyDateRange}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AC6-11: Incident Role Section */}
                                    

                                    {/* AC12-17: Location Section */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-4"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Location
                                        </h3>
                                        <div>
                                            {/* AC13-15: Multi-select picklist */}
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Location(s) <span className="text-red-600">*</span>
                                            </label>
                                            {/* AC16: Location Picklist Values */}
                                            <div className="grid grid-cols-3 gap-3">
                                            {LOCATION_OPTIONS.map(location => (
                                                <label key={location} className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={youthLocations.includes(location)}
                                                        disabled={youthSectionStatus === "complete"}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setYouthLocations([...youthLocations, location]);
                                                            } else {
                                                                setYouthLocations(youthLocations.filter(l => l !== location));
                                                            }
                                                        }}
                                                        className="h-4 w-4"
                                                        style={{ accentColor: 'var(--color-brand-primary)' }}
                                                    />
                                                    <span className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {location}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                    {/* AC19-24: Overview Narrative Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Overview
                                            </h3>
                                            {/* AC21-24: Load Overview Button */}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setShowLoadOverviewModal(true)}
                                                disabled={youthSectionStatus === "complete"}
                                                className="h-8 px-3 text-xs"
                                                style={{ borderRadius: '9999px' }}
                                            >
                                                Load Overview
                                            </Button>
                                        </div>
                                        {/* AC20: Instructional text */}
                                        <div 
                                            className="text-xs mb-3 p-3 rounded"
                                            style={{ 
                                                backgroundColor: 'rgba(232, 244, 248, 0.6)',
                                                border: '1px solid rgba(84, 105, 141, 0.2)',
                                                color: 'var(--slds-g-color-text-default)'
                                            }}
                                        >
                                            <p className="mb-1">Include a brief, 1 – 2 sentence explanation.</p>
                                            <p className="mb-1"><strong>Example:</strong> The Youth was escalated in Program. Restraint was needed.</p>
                                            <p>To maintain confidentiality, narratives can only contain Youth initials.</p>
                                        </div>
                                    <textarea
                                        value={youthOverviewNarrative}
                                        onChange={(e) => setYouthOverviewNarrative(e.target.value)}
                                        disabled={youthSectionStatus === "complete"}
                                        placeholder="Enter overview narrative..."
                                        rows={4}
                                        className="w-full px-3 py-2 text-sm rounded resize-none"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            backgroundColor: youthSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white'
                                        }}
                                    />
                                </div>

                                    {/* AC25-41: Persons Contacted Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Persons Contacted
                                            </h3>
                                            {/* AC32: Add / Modify button */}
                                            {youthSectionStatus === "in-progress" && (
                                                <Button
                                                    size="sm"
                                                    onClick={handleAddPersonContacted}
                                                    style={{
                                                        backgroundColor: 'var(--color-brand-primary)',
                                                        color: 'white',
                                                        borderRadius: '9999px'
                                                    }}
                                                    className="h-8 px-3 text-xs"
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Add / Modify
                                                </Button>
                                            )}
                                        </div>
                                        {/* AC30: Instructional Text */}
                                        <div 
                                            className="text-xs mb-3 p-3 rounded"
                                            style={{ 
                                                backgroundColor: 'rgba(232, 244, 248, 0.6)',
                                                border: '1px solid rgba(84, 105, 141, 0.2)',
                                                color: 'var(--slds-g-color-text-default)'
                                            }}
                                        >
                                            Always contact and include the Guardian, Program Manager, Director and On‑call Manager. 
                                            Inform management via calls or text. If front‑line management cannot be reached, 
                                            escalate up the chain of command.
                                        </div>

                                    {personsContacted.length > 0 ? (
                                        <div 
                                            className="border rounded app-scroll-x"
                                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th 
                                                            className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Name
                                                        </th>
                                                        <th 
                                                            className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Youth
                                                        </th>
                                                        <th 
                                                            className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Relationship
                                                        </th>
                                                        <th 
                                                            className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Contact Date / Time
                                                        </th>
                                                        <th 
                                                            className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Comment
                                                        </th>
                                                        {youthSectionStatus === "in-progress" && (
                                                            <th 
                                                                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                Actions
                                                            </th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {personsContacted.map((person) => (
                                                        <tr key={person.id} style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {person.constituentName || '—'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {person.youthName || '—'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {person.relationship || '—'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {person.contactDateTime ? new Date(person.contactDateTime).toLocaleString('en-US', {
                                                                    month: '2-digit',
                                                                    day: '2-digit',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                }) : '—'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {person.comment || '—'}
                                                            </td>
                                                            {youthSectionStatus === "in-progress" && (
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={() => handleEditPersonContacted(person)}
                                                                            className="p-1 hover:bg-gray-100 rounded"
                                                                        >
                                                                            <Edit2 className="h-4 w-4" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeletePersonContacted(person.id)}
                                                                            className="p-1 hover:bg-gray-100 rounded"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" style={{ color: '#DC2626' }} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div 
                                            className="text-center py-8 text-sm rounded"
                                            style={{ 
                                                color: 'var(--slds-g-color-text-weak)',
                                                backgroundColor: 'var(--slds-g-color-background-alt)',
                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                            }}
                                        >
                                            No persons contacted yet. Click "Add / Modify" to add one.
                                        </div>
                                    )}
                                </div>

                                    {/* AC42-52: Associated Legal Involvement Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Associated Legal Involvement
                                            </h3>
                                            {/* AC46: Add / Modify button */}
                                            {youthSectionStatus === "in-progress" && (
                                                <Button
                                                    size="sm"
                                                    onClick={handleAddLegalInvolvement}
                                                    style={{
                                                        backgroundColor: 'var(--color-brand-primary)',
                                                        color: 'white',
                                                        borderRadius: '9999px'
                                                    }}
                                                    className="h-8 px-3 text-xs"
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Add / Modify
                                                </Button>
                                            )}
                                        </div>

                                    {legalInvolvements.length > 0 ? (
                                        <div 
                                            className="border rounded app-scroll-x"
                                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th 
                                                            className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Legal Involvement
                                                        </th>
                                                        <th 
                                                            className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Comment
                                                        </th>
                                                        {youthSectionStatus === "in-progress" && (
                                                            <th 
                                                                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                Actions
                                                            </th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {legalInvolvements.map((involvement) => (
                                                        <tr key={involvement.id} style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {involvement.constituentName}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {involvement.comment || '-'}
                                                            </td>
                                                            {youthSectionStatus === "in-progress" && (
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={() => handleEditLegalInvolvement(involvement)}
                                                                            className="p-1 hover:bg-gray-100 rounded"
                                                                        >
                                                                            <Edit2 className="h-4 w-4" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteLegalInvolvement(involvement.id)}
                                                                            className="p-1 hover:bg-gray-100 rounded"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" style={{ color: '#DC2626' }} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div 
                                            className="text-center py-8 text-sm rounded"
                                            style={{ 
                                                color: 'var(--slds-g-color-text-weak)',
                                                backgroundColor: 'var(--slds-g-color-background-alt)',
                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                            }}
                                        >
                                            No legal involvements yet. Click "Add / Modify" to add one.
                                        </div>
                                    )}
                                </div>

                                    {/* AC53-60: Section Actions */}
                                    <div 
                                        className="flex items-center justify-end gap-2 pt-4"
                                        style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}
                                    >
                                        {youthSectionStatus === "in-progress" ? (
                                            <>
                                                {/* AC53: Cancel, Save, Complete Section */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => navigate('/incident-reports')}
                                                    className="h-8 px-3 text-xs"
                                                    style={{ borderRadius: '9999px' }}
                                                >
                                                    Cancel
                                                </Button>
                                                {/* AC54: Save - sets IR to In Progress */}
                                                <Button
                                                    size="sm"
                                                    onClick={handleSaveYouthGeneral}
                                                    style={{
                                                        backgroundColor: 'var(--color-brand-primary)',
                                                        color: 'white',
                                                        borderRadius: '9999px'
                                                    }}
                                                    className="h-8 px-3 text-xs"
                                                >
                                                    Save
                                                </Button>
                                                {/* AC55-56: Complete Section - locks fields and sets status */}
                                                <Button
                                                    size="sm"
                                                    onClick={handleCompleteYouthSection}
                                                    style={{
                                                        backgroundColor: 'var(--color-brand-primary)',
                                                        color: 'white',
                                                        borderRadius: '9999px'
                                                    }}
                                                    className="h-8 px-3 text-xs"
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        ) : (
                                            /* AC57-60: Re-Open Section - unlocks fields and sets status to In Progress */
                                            <Button
                                                size="sm"
                                                onClick={handleReopenYouthSection}
                                                style={{
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    borderRadius: '9999px'
                                                }}
                                                className="h-8 px-3 text-xs"
                                            >
                                                Re-Open Section
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })()}

                    {/* Youth > Narrative Tab */}
                    {activeTab.startsWith("narrative-") && (
                        <Card 
                            className="shadow-sm"
                            style={{
                                backgroundColor: 'var(--slds-g-color-background-base)',
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-card-radius-border)'
                            }}
                        >
                            <CardHeader style={{ borderBottom: '1px solid #e0e5ee', paddingTop: '12px', paddingBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                <CardTitle 
                                    className="text-base font-semibold"
                                    style={{ color: 'var(--slds-g-color-text-default)', fontSize: '0.8rem', margin: 0, lineHeight: 1.2, display: 'flex', alignItems: 'center' }}
                                >
                                    Youth - Narrative
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Youth Header Section */}
                                <div className="pt-4">
                                    <div 
                                        className="rounded-lg p-4"
                                        style={{ 
                                            backgroundColor: 'var(--slds-g-color-background-alt)',
                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Youth Initials Icon */}
                                            
                                            
                                            {/* Youth Information */}
                                            <div className="flex-1 grid grid-cols-3 gap-4">
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Youth Name
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.name}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Age
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.age}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Program
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.program}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Role
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.role}
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Residency Date Range
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.residencyDateRange}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Confidentiality Notice */}
                                <div 
                                    className="rounded-lg p-3 flex items-start gap-3"
                                    style={{ 
                                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                                        border: '1px solid rgba(255, 193, 7, 0.3)'
                                    }}
                                >
                                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#ff8f00' }} />
                                    <div>
                                        <p className="text-sm font-semibold mb-1" style={{ color: '#e65100' }}>
                                            Confidentiality Notice
                                        </p>
                                        <p className="text-sm" style={{ color: '#e65100' }}>
                                            To maintain confidentiality, narrative can only contain Youth initials.
                                        </p>
                                    </div>
                                </div>

                                {/* Narrative Instructions */}
                                <div 
                                    className="rounded-lg p-4"
                                    style={{ 
                                        backgroundColor: 'rgba(232, 244, 248, 0.6)',
                                        border: '1px solid rgba(84, 105, 141, 0.2)'
                                    }}
                                >
                                    <h4 
                                        className="text-sm font-semibold mb-3"
                                        style={{ color: 'var(--slds-g-color-text-default)' }}
                                    >
                                        Narrative Instructions
                                    </h4>
                                    <div className="text-sm space-y-2" style={{ color: '#54698D' }}>
                                        <p className="text-[14px]">
                                            Please describe the incident in detail including what happened. Staff responses and restraints will be detailed elsewhere but summary level information should be included for chronology. The Narrative should be written in third person.
                                        </p>
                                        <p className="text-[15px] text-[14px]">
                                            Do not use 'this writer' or 'this reporter' when referring to yourself.
                                        </p>
                                        <p className="text-[15px] text-[14px]">
                                            The first mention of Staff should include full name and title; subsequent mentions should only be first name.
                                        </p>
                                        <p className="text-[15px] text-[14px]">
                                            The primary Youth should only be referenced by first name. Additional Youth should only be referenced by first and last initials.
                                        </p>
                                    </div>
                                </div>

                                {/* Detailed Narrative Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label 
                                            className="text-sm font-semibold"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Detailed Narrative <span className="text-red-600">*</span>
                                        </label>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setShowLoadNarrativeModal(true)}
                                            disabled={youthNarrativeStatus === "complete"}
                                            className="h-8 px-3 text-xs gap-1.5"
                                            style={{ borderRadius: '9999px' }}
                                        >
                                            <Upload className="h-3.5 w-3.5" />
                                            Load Narrative
                                        </Button>
                                    </div>
                                    <textarea
                                        value={youthNarrative}
                                        onChange={(e) => setYouthNarrative(e.target.value)}
                                        disabled={youthNarrativeStatus === "complete"}
                                        placeholder="Enter detailed narrative of the incident..."
                                        rows={12}
                                        className="w-full px-3 py-2 text-sm rounded resize-none"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            backgroundColor: youthNarrativeStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                            lineHeight: '1.6'
                                        }}
                                    />
                                </div>

                                {/* Section Actions */}
                                <div 
                                    className="flex items-center justify-end gap-2 pt-4"
                                    style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}
                                >
                                    {youthNarrativeStatus === "in-progress" ? (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => navigate('/incident-reports')}
                                                className="h-8 px-3 text-xs"
                                                style={{ borderRadius: '9999px' }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSaveYouthNarrative}
                                                style={{
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    borderRadius: '9999px'
                                                }}
                                                className="h-8 px-3 text-xs"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleCompleteYouthNarrative}
                                                style={{
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    borderRadius: '9999px'
                                                }}
                                                className="h-8 px-3 text-xs"
                                            >
                                                Complete Section
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={handleReopenYouthNarrative}
                                            style={{
                                                backgroundColor: 'var(--color-brand-primary)',
                                                color: 'white',
                                                borderRadius: '9999px'
                                            }}
                                            className="h-8 px-3 text-xs"
                                        >
                                            Re-Open Section
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Youth > Restraints Tab */}
                    {activeTab.startsWith("restraints-") && (
                        <Card 
                            className="shadow-sm"
                            style={{
                                backgroundColor: 'var(--slds-g-color-background-base)',
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-card-radius-border)'
                            }}
                        >
                            <CardHeader style={{ borderBottom: '1px solid #e0e5ee', paddingTop: '12px', paddingBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                <CardTitle 
                                    className="text-base font-semibold"
                                    style={{ color: 'var(--slds-g-color-text-default)', fontSize: '0.8rem', margin: 0, lineHeight: 1.2, display: 'flex', alignItems: 'center' }}
                                >
                                    Youth - Restraints
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Youth Header Section */}
                                <div className="pt-4">
                                    <div 
                                        className="rounded-lg p-4"
                                        style={{ 
                                            backgroundColor: 'var(--slds-g-color-background-alt)',
                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Youth Information */}
                                            <div className="flex-1 grid grid-cols-3 gap-4">
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Youth Name
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.name}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Age
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.age}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Program
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.program}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Role
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.role}
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Residency Date Range
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.residencyDateRange}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Masters Level Administrative Staff Consulted */}
                                <div>
                                    <label 
                                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                    >
                                        Masters Level Administrative Staff Consulted
                                    </label>
                                    <select
                                        value={mastersLevelStaff}
                                        onChange={(e) => setMastersLevelStaff(e.target.value)}
                                        disabled={restraintsSectionStatus === "complete"}
                                        className="w-full h-9 text-sm px-3 rounded"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            backgroundColor: restraintsSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white'
                                        }}
                                    >
                                        <option value="">Select Staff...</option>
                                        {MOCK_MASTERS_LEVEL_STAFF.map(staff => (
                                            <option key={staff.id} value={staff.id}>
                                                {staff.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Restraints Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 
                                            className="text-sm font-semibold"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Restraints
                                        </h3>
                                        {restraintsSectionStatus === "in-progress" && (
                                            <Button
                                                size="sm"
                                                onClick={handleAddRestraint}
                                                style={{
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    borderRadius: '9999px'
                                                }}
                                                className="h-8 px-3 text-xs"
                                            >
                                                <Plus className="h-3.5 w-3.5 mr-1.5" />
                                                Add Restraint
                                            </Button>
                                        )}
                                    </div>

                                    {/* Restraints Table */}
                                    {restraints.length > 0 ? (
                                        <div 
                                            className="border rounded app-scroll-x"
                                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th 
                                                            className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Type
                                                        </th>
                                                        <th 
                                                            className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Reason for Release
                                                        </th>
                                                        <th 
                                                            className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Duration
                                                        </th>
                                                        <th 
                                                            className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Staff
                                                        </th>
                                                        <th 
                                                            className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Involvement
                                                        </th>
                                                        {restraintsSectionStatus === "in-progress" && (
                                                            <th 
                                                                className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide"
                                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                Actions
                                                            </th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {restraints.map((restraint) => (
                                                        <tr 
                                                            key={restraint.id}
                                                            className="border-t"
                                                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                        >
                                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {restraint.type}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {restraint.reasonForRelease}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {calculateRestraintDuration(restraint)}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {restraint.staffInvolved.map(s => s.staffName).join(", ") || "—"}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {restraint.staffInvolved.map(s => s.involvement).join(", ") || "—"}
                                                            </td>
                                                            {restraintsSectionStatus === "in-progress" && (
                                                                <td className="px-4 py-3 text-right">
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <button
                                                                            onClick={() => handleEditRestraint(restraint)}
                                                                            className="p-1 rounded hover:bg-gray-100"
                                                                            title="Edit"
                                                                        >
                                                                            <Edit2 className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteRestraint(restraint.id)}
                                                                            className="p-1 rounded hover:bg-gray-100"
                                                                            title="Delete"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div 
                                            className="text-center py-8 text-sm rounded"
                                            style={{ 
                                                color: 'var(--slds-g-color-text-weak)',
                                                backgroundColor: 'var(--slds-g-color-background-alt)',
                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                            }}
                                        >
                                            No restraints recorded yet. Click "Add Restraint" to add one.
                                        </div>
                                    )}
                                </div>

                                {/* Restraint Analysis & Medical Review */}
                                <div className="space-y-4">
                                    <h3 
                                        className="text-sm font-semibold"
                                        style={{ color: 'var(--slds-g-color-text-default)' }}
                                    >
                                        Restraint Analysis & Medical Review
                                    </h3>

                                    {/* Analysis Text Area */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Analysis of Restraint Effectiveness and Appropriateness
                                        </label>
                                        <textarea
                                            value={restraintAnalysis}
                                            onChange={(e) => setRestraintAnalysis(e.target.value)}
                                            disabled={restraintsSectionStatus === "complete"}
                                            placeholder="Enter analysis..."
                                            rows={4}
                                            className="w-full px-3 py-2 text-sm rounded resize-none"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: restraintsSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white'
                                            }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Youth Checked for Injuries */}
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Youth Checked for Injuries
                                            </label>
                                            <select
                                                value={youthCheckedForInjuries}
                                                onChange={(e) => setYouthCheckedForInjuries(e.target.value)}
                                                disabled={restraintsSectionStatus === "complete"}
                                                className="w-full h-9 text-sm px-3 rounded"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: restraintsSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white'
                                                }}
                                            >
                                                <option value="">Select...</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                        </div>

                                        {/* Medical Professional Consulted */}
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Medical Professional Consulted
                                            </label>
                                            <select
                                                value={medicalProfessionalConsulted}
                                                onChange={(e) => setMedicalProfessionalConsulted(e.target.value)}
                                                disabled={restraintsSectionStatus === "complete"}
                                                className="w-full h-9 text-sm px-3 rounded"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: restraintsSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white'
                                                }}
                                            >
                                                <option value="">Select...</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Medical Professional Comments - Conditional */}
                                    {medicalProfessionalConsulted === "Yes" && (
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Medical Professional Comments
                                            </label>
                                            <textarea
                                                value={medicalProfessionalComments}
                                                onChange={(e) => setMedicalProfessionalComments(e.target.value)}
                                                disabled={restraintsSectionStatus === "complete"}
                                                placeholder="Enter medical professional comments..."
                                                rows={3}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: restraintsSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white'
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Section Actions */}
                                <div 
                                    className="flex items-center justify-end gap-2 pt-4"
                                    style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}
                                >
                                    {restraintsSectionStatus === "in-progress" ? (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => navigate('/incident-reports')}
                                                className="h-8 px-3 text-xs"
                                                style={{ borderRadius: '9999px' }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSaveYouthRestraints}
                                                style={{
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    borderRadius: '9999px'
                                                }}
                                                className="h-8 px-3 text-xs"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleCompleteYouthRestraints}
                                                style={{
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    borderRadius: '9999px'
                                                }}
                                                className="h-8 px-3 text-xs"
                                            >
                                                Complete Section
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={handleReopenYouthRestraints}
                                            style={{
                                                backgroundColor: 'var(--color-brand-primary)',
                                                color: 'white',
                                                borderRadius: '9999px'
                                            }}
                                            className="h-8 px-3 text-xs"
                                        >
                                            Re-Open Section
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Restraint Modal */}
                    <YouthIRDialogsSection
                      activeTab={activeTab}
                      allStaff={allStaff}
                      associatedStaff={associatedStaff}
                      calculateRestraintDuration={calculateRestraintDuration}
                      consOfIntervention={consOfIntervention}
                      constituent={constituent}
                      constituentId={constituentId}
                      constituents={constituents}
                      currentInjury={currentInjury}
                      currentPersonContacted={currentPersonContacted}
                      currentRestraint={currentRestraint}
                      currentStaffInvolvement={currentStaffInvolvement}
                      currentYouth={currentYouth}
                      deEscalationTechniques={deEscalationTechniques}
                      debriefSectionStatus={debriefSectionStatus}
                      editingInjuryId={editingInjuryId}
                      editingPersonContactedId={editingPersonContactedId}
                      editingRestraintId={editingRestraintId}
                      editingStaffInvolvementId={editingStaffInvolvementId}
                      editingSubstanceTestId={editingSubstanceTestId}
                      end={end}
                      endDate={endDate}
                      endTimeHours={endTimeHours}
                      endTimeMinutes={endTimeMinutes}
                      endTimeSeconds={endTimeSeconds}
                      getParticipantModalTitle={getParticipantModalTitle}
                      getStaffAssociatedWithIncident={getStaffAssociatedWithIncident}
                      getStaffForDebriefPiclist={getStaffForDebriefPiclist}
                      getYouthInvolved={getYouthInvolved}
                      handleAddConstituent={handleAddConstituent}
                      handleAddDebriefParticipant={handleAddDebriefParticipant}
                      handleAddInjury={handleAddInjury}
                      handleAddStaffInvolvement={handleAddStaffInvolvement}
                      handleAddSubstanceTest={handleAddSubstanceTest}
                      handleCancelAddConstituent={handleCancelAddConstituent}
                      handleCompleteYouthDebrief={handleCompleteYouthDebrief}
                      handleCompleteYouthInjuries={handleCompleteYouthInjuries}
                      handleCompleteYouthResponse={handleCompleteYouthResponse}
                      handleCompleteYouthSubstanceUse={handleCompleteYouthSubstanceUse}
                      handleDeleteInjury={handleDeleteInjury}
                      handleDeleteStaffInvolvement={handleDeleteStaffInvolvement}
                      handleEditInjury={handleEditInjury}
                      handleEditStaffInvolvement={handleEditStaffInvolvement}
                      handleEditSubstanceTest={handleEditSubstanceTest}
                      handleLoadNarrative={handleLoadNarrative}
                      handleLoadOverview={handleLoadOverview}
                      handleLoadResponse={handleLoadResponse}
                      handleOpenAddParticipant={handleOpenAddParticipant}
                      handleRemoveDebriefParticipant={handleRemoveDebriefParticipant}
                      handleRemoveSubstanceTest={handleRemoveSubstanceTest}
                      handleReopenYouthDebrief={handleReopenYouthDebrief}
                      handleReopenYouthInjuries={handleReopenYouthInjuries}
                      handleReopenYouthResponse={handleReopenYouthResponse}
                      handleReopenYouthSubstanceUse={handleReopenYouthSubstanceUse}
                      handleSaveInjury={handleSaveInjury}
                      handleSavePersonContacted={handleSavePersonContacted}
                      handleSaveRestraint={handleSaveRestraint}
                      handleSaveStaffInvolvement={handleSaveStaffInvolvement}
                      handleSaveYouthDebrief={handleSaveYouthDebrief}
                      handleSaveYouthInjuries={handleSaveYouthInjuries}
                      handleSaveYouthResponse={handleSaveYouthResponse}
                      handleSaveYouthSubstanceUse={handleSaveYouthSubstanceUse}
                      hours={hours}
                      individuals={individuals}
                      initials={initials}
                      injuries={injuries}
                      injuriesSectionStatus={injuriesSectionStatus}
                      isAddingConstituent={isAddingConstituent}
                      isAddingDebriefParticipant={isAddingDebriefParticipant}
                      isAddingInjury={isAddingInjury}
                      isAddingPersonContacted={isAddingPersonContacted}
                      isAddingRestraint={isAddingRestraint}
                      isAddingStaffInvolvement={isAddingStaffInvolvement}
                      isAddingSubstanceTest={isAddingSubstanceTest}
                      loadNarrativeSource={loadNarrativeSource}
                      loadOverviewSource={loadOverviewSource}
                      loadResponseSource={loadResponseSource}
                      minutes={minutes}
                      nameParts={nameParts}
                      newConstituent={newConstituent}
                      newTest={newTest}
                      parentDebriefStaff={parentDebriefStaff}
                      parentProcessingInput={parentProcessingInput}
                      precipitatingFactors={precipitatingFactors}
                      prosOfIntervention={prosOfIntervention}
                      relatedSubstanceTests={relatedSubstanceTests}
                      responseSectionStatus={responseSectionStatus}
                      responsesReflection={responsesReflection}
                      seconds={seconds}
                      selectedStaffForDebrief={selectedStaffForDebrief}
                      selfDisclosedSubstanceUse={selfDisclosedSubstanceUse}
                      setConsOfIntervention={setConsOfIntervention}
                      setCurrentInjury={setCurrentInjury}
                      setCurrentParticipantType={setCurrentParticipantType}
                      setCurrentPersonContacted={setCurrentPersonContacted}
                      setCurrentRestraint={setCurrentRestraint}
                      setCurrentStaffInvolvement={setCurrentStaffInvolvement}
                      setDeEscalationTechniques={setDeEscalationTechniques}
                      setEditingInjuryId={setEditingInjuryId}
                      setEditingPersonContactedId={setEditingPersonContactedId}
                      setEditingRestraintId={setEditingRestraintId}
                      setEditingStaffInvolvementId={setEditingStaffInvolvementId}
                      setEditingSubstanceTestId={setEditingSubstanceTestId}
                      setIsAddingConstituent={setIsAddingConstituent}
                      setIsAddingDebriefParticipant={setIsAddingDebriefParticipant}
                      setIsAddingInjury={setIsAddingInjury}
                      setIsAddingPersonContacted={setIsAddingPersonContacted}
                      setIsAddingRestraint={setIsAddingRestraint}
                      setIsAddingStaffInvolvement={setIsAddingStaffInvolvement}
                      setIsAddingSubstanceTest={setIsAddingSubstanceTest}
                      setLoadNarrativeSource={setLoadNarrativeSource}
                      setLoadOverviewSource={setLoadOverviewSource}
                      setLoadResponseSource={setLoadResponseSource}
                      setNewConstituent={setNewConstituent}
                      setParentProcessingInput={setParentProcessingInput}
                      setPrecipitatingFactors={setPrecipitatingFactors}
                      setProsOfIntervention={setProsOfIntervention}
                      setRelatedSubstanceTests={setRelatedSubstanceTests}
                      setResponsesReflection={setResponsesReflection}
                      setSelectedStaffForDebrief={setSelectedStaffForDebrief}
                      setSelfDisclosedSubstanceUse={setSelfDisclosedSubstanceUse}
                      setShowLoadNarrativeModal={setShowLoadNarrativeModal}
                      setShowLoadOverviewModal={setShowLoadOverviewModal}
                      setShowLoadResponseModal={setShowLoadResponseModal}
                      setStaffTeamChanges={setStaffTeamChanges}
                      setSubstanceTestAdministered={setSubstanceTestAdministered}
                      setTeamworkConcerns={setTeamworkConcerns}
                      setTeamworkSuccesses={setTeamworkSuccesses}
                      setYouthProcessingInput={setYouthProcessingInput}
                      setYouthResponse={setYouthResponse}
                      setYouthTeamChanges={setYouthTeamChanges}
                      setYouthWitnessProcessing={setYouthWitnessProcessing}
                      showLoadNarrativeModal={showLoadNarrativeModal}
                      showLoadOverviewModal={showLoadOverviewModal}
                      showLoadResponseModal={showLoadResponseModal}
                      staff={staff}
                      staffId={staffId}
                      staffTeamChanges={staffTeamChanges}
                      start={start}
                      startDate={startDate}
                      startTimeHours={startTimeHours}
                      startTimeMinutes={startTimeMinutes}
                      startTimeSeconds={startTimeSeconds}
                      substanceTestAdministered={substanceTestAdministered}
                      substanceUseSectionStatus={substanceUseSectionStatus}
                      teamDebriefStaff={teamDebriefStaff}
                      teamworkConcerns={teamworkConcerns}
                      teamworkSuccesses={teamworkSuccesses}
                      unableToParticipate={unableToParticipate}
                      youth={youth}
                      youthDebriefStaff={youthDebriefStaff}
                      youthId={youthId}
                      youthProcessingInput={youthProcessingInput}
                      youthResponse={youthResponse}
                      youthTeamChanges={youthTeamChanges}
                      youthWitnessProcessing={youthWitnessProcessing}
                    />
                    </fieldset>
                </div>
            </div>
        </div>

        <MediationMeetingModal
            open={mediationMeetingModalOpen}
            onOpenChange={setMediationMeetingModalOpen}
            mode="create"
            incidentReport={{
                id: id ?? "—",
                youthInvolved: individuals
                    .filter(ind => ind.constituentType === "Youth")
                    .map(ind => ind.constituentName),
                incidentDate: startDate ? formatMdy(startDate) : "—",
                program: currentYouth.program,
                staffInvolved: individuals
                    .filter(ind => ind.constituentType === "Staff")
                    .map(ind => ind.constituentName),
                status: isFinalized ? "Finalized" : "In Progress",
            }}
            onSave={(meeting: MediationMeetingData) => {
                setMediationConnections(prev => [...prev, meeting]);
                toast.success("Mediation Meeting scheduled successfully.");
            }}
        />

        {/* View Mediation Meeting */}
        <MediationMeetingModal
            open={mediationViewOpen}
            onOpenChange={setMediationViewOpen}
            mode="view"
            initialData={mediationSelectedIndex !== null ? mediationConnections[mediationSelectedIndex] : undefined}
            incidentReport={{
                id: id ?? "—",
                youthInvolved: individuals
                    .filter(ind => ind.constituentType === "Youth")
                    .map(ind => ind.constituentName),
                incidentDate: startDate ? formatMdy(startDate) : "—",
                program: currentYouth.program,
                staffInvolved: individuals
                    .filter(ind => ind.constituentType === "Staff")
                    .map(ind => ind.constituentName),
                status: isFinalized ? "Finalized" : "In Progress",
            }}
            onSave={() => {}}
        />

        {/* Edit Mediation Meeting */}
        <MediationMeetingModal
            open={mediationEditOpen}
            onOpenChange={(open) => {
                setMediationEditOpen(open);
                if (!open) setMediationSelectedIndex(null);
            }}
            mode="edit"
            initialData={mediationSelectedIndex !== null ? mediationConnections[mediationSelectedIndex] : undefined}
            incidentReport={{
                id: id ?? "—",
                youthInvolved: individuals
                    .filter(ind => ind.constituentType === "Youth")
                    .map(ind => ind.constituentName),
                incidentDate: startDate ? formatMdy(startDate) : "—",
                program: currentYouth.program,
                staffInvolved: individuals
                    .filter(ind => ind.constituentType === "Staff")
                    .map(ind => ind.constituentName),
                status: isFinalized ? "Finalized" : "In Progress",
            }}
            onSave={handleSaveEditedMediation}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={mediationDeleteConfirmOpen} onOpenChange={setMediationDeleteConfirmOpen}>
            <DialogContent
                className="p-0 gap-0"
                style={{ maxWidth: "480px" }}
                aria-describedby={undefined}
            >
                <DialogHeader
                    className="px-6 py-5"
                    style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
                >
                    <DialogTitle style={{ color: "var(--slds-g-color-text-default)" }}>
                        Confirm Deletion
                    </DialogTitle>
                </DialogHeader>
                <div className="px-6 py-5">
                    <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>
                        Are you sure you want to delete this mediation meeting? This action cannot be undone.
                    </p>
                </div>
                <DialogFooter
                    className="px-6 py-4 flex justify-end gap-2"
                    style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}
                >
                    <button
                        onClick={() => {
                            setMediationDeleteConfirmOpen(false);
                            setMediationSelectedIndex(null);
                        }}
                        className="h-9 px-4 rounded-full slds-text-4 font-medium"
                        style={{
                            border: "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor: "var(--slds-g-color-neutral-95)",
                            color: "var(--slds-g-color-text-default)",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmDeleteMediation}
                        className="h-9 px-4 rounded-full slds-text-4 font-medium text-white"
                        style={{ backgroundColor: "#c23934" }}
                    >
                        Delete
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
}