import React from "react";
import { Button } from "../ui/button";
import { Plus, Pencil, Trash2, Users } from "@/app/lib/lucide-icons";
import { AlertCircle } from "@/app/lib/lucide-icons";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { SubstanceUseAssessmentFields } from "./SubstanceUseAssessmentFields";
import { DateInput } from "../ui/date-input";
import { RichTextEditor } from "../ui/rich-text-editor";
import { CopingSkillModal } from "./CopingSkillModal";
import { TriggerModal } from "./TriggerModal";
import { StrengthModal } from "./StrengthModal";
import { TherapySessionFields } from "./TherapySessionFields";
import { DetailsTabContentBodyB1 } from "./DetailsTabContentBodyB1";
import { DetailsTabContentBodyB2 } from "./DetailsTabContentBodyB2";
// Constants imported from/shared with ConnectionFormDialog
const moodOptions = [
    "Euthymic", "Depressed", "Anxious", "Angry", "Euphoric", "Irritable",
];
const affectOptions = [
    "Full", "Constricted", "Flat", "Inappropriate", "Labile",
];
const behaviorOptions = [
    "Cooperative", "Resistant", "Agitated", "Impulsive", "Over Sedated",
    "Aggressive", "Hyperactive", "Restless", "Other",
];
const fileRequestReasonOptions = [
    "Subpoena", "Court Order", "Triage Support", "Personal Documents",
    "ROI by Member", "ROI by Family Member",
];
const fileRequestDocumentOptions = [
    "Admissions Narrative", "Transition Summary", "ITP", "Behavioral Records",
    "Psychiatric Visit Form", "Incident Report Summary", "Copy of Social Security Card",
    "Copy of Birth Certificate", "Copy of State ID",
];
const interactionTypeOptions = [
    "Onsite Visit - Scheduled", "Onsite Visit - Unscheduled", "Offsite Visit",
    "Text", "Phone Call", "Letter", "Email", "Social Media", "Video", "Mail",
];
const supportProvidedOptions = [
    "General Check-In", "Scholarship", "Assessment", "Adult Education",
    "Caregiver Skills", "Childcare", "Clothing", "Education (Children/Adolescents)",
    "Employment & Finances", "Executive Functions", "Food", "Housing",
    "Legal (criminal)", "Legal (non-criminal)", "Mental Health",
    "Physical Disabilities & Learning Difficulties", "Physical Health & Health Care Coverage",
    "Safety", "Social Supports", "Substance Use", "Transportation",
];
const treatmentTargetOptions = [
    "Caregiver System Engagement", "Assessment & Psychoeducation",
    "Routines, Rituals, & Care Vision", "Calm (Caregiver Affect Management)",
    "Connect (Caregiver Attunement)", "Effective Caregiving Response",
    "Reflection (Affect Identification)", "Modulation",
    "Self-Discipline & Problem Solving (Executive Functions)", "Identity & Purpose",
    "Relational Engagement & Self Expression", "Resilience (Trauma Experience Integration)",
    "Resilience (Skill Coaching)",
];
const youthCopingSkillsOptions = [
    "Deep breathing exercises", "Journaling", "Physical activity/exercise",
    "Talking to a trusted adult", "Listening to music", "Taking a break/timeout",
    "Progressive muscle relaxation",
];
const youthTriggersOptions = [
    "Loud noises", "Crowded spaces", "Academic pressure", "Peer conflict",
    "Authority figures", "Unstructured time", "Transitions between activities",
];
const youthStrengthsOptions = [
    "Creative and artistic", "Good problem solver", "Empathetic toward others",
    "Strong athletic ability", "Leadership qualities", "Sense of humor",
    "Resilient and determined",
];
const languageOptions = ["English", "Spanish", "Polish", "Other"];

const ECR_PREDEFINED_PURPOSES = [
    "Academic Agreement Review", "Career Advising", "Employment Advising",
    "Executive Functions Advising", "High School Placement Planning",
    "PSO Advising", "School Progress Review",
];
const SM_PREDEFINED_PURPOSES = [
    "Academic Discussion or Intervention", "Behavioral Discussion or Intervention",
    "IEP / 504", "Introduction to School", "Other School Incident",
    "Parent Teacher Conference", "School Placement", "School Withdrawal",
    "Suspension", "School Observation", "Orientation / Back to School Meeting",
];
const PE_PREDEFINED_REASONS = [
    "Assessment of Overall Cognitive Functioning",
    "Determine If Learning Disorder Present",
    "DSM-5 Diagnosis Confirmation",
    "Seeking Further Treatment Recommendations",
    "Appropriateness of Fit for Mercy Home",
];

export interface ConnectionParticipant {
    id: number;
    constituentType: 'Constituent' | 'Non-Constituent';
    participant: string;
    role: string;
    attended: boolean | null;
    reasonMissed: string;
    attendanceNotes?: string;
    otherReasonDetails?: string;
    isOrganizer?: boolean;
}

export interface ParticipantRating {
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

export interface DetailsTabContentProps {
    // Core form state
    connectionFormData: Partial<any>;
    setConnectionFormData: React.Dispatch<React.SetStateAction<Partial<any>>>;
    connectionDetails: any;
    setConnectionDetails: React.Dispatch<React.SetStateAction<any>>;
    connectionParticipants: ConnectionParticipant[];

    // Advocate Meeting state
    advocateGoals: { id: number; goal: string; comments: string }[];
    advocateMeetingSummary: string;
    setAdvocateMeetingSummary: (v: string) => void;
    themesAddressedAdvocate: string;
    setThemesAddressedAdvocate: (v: string) => void;
    selectedAdvocateTreatmentTargets: string[];
    setSelectedAdvocateTreatmentTargets: React.Dispatch<React.SetStateAction<string[]>>;
    advocateCopingSkills: any[];
    setAdvocateCopingSkills: React.Dispatch<React.SetStateAction<any[]>>;
    advocateTriggers: any[];
    setAdvocateTriggers: React.Dispatch<React.SetStateAction<any[]>>;
    advocateStrengths: any[];
    setAdvocateStrengths: React.Dispatch<React.SetStateAction<any[]>>;
    handleOpenAdvocateGoalModal: (goal?: { id: number; goal: string; comments: string }) => void;
    handleDeleteAdvocateGoal: (id: number) => void;
    handleOpenCopingSkillModal: (skill?: any) => void;
    handleDeleteCopingSkill: (id: number) => void;
    handleOpenTriggerModal: (trigger?: any) => void;
    handleDeleteTrigger: (id: number) => void;
    handleOpenStrengthModal: (strength?: any) => void;
    handleDeleteStrength: (id: number) => void;

    // Therapy session state
    therapyGoals: { id: number; goal: string; comments: string }[];
    setTherapyGoals: React.Dispatch<React.SetStateAction<{ id: number; goal: string; comments: string }[]>>;
    handleOpenAddGoalModal: () => void;
    selectedTreatmentTargets: string[];
    setSelectedTreatmentTargets: React.Dispatch<React.SetStateAction<string[]>>;
    isTreatmentTargetsModalOpen: boolean;
    setIsTreatmentTargetsModalOpen: (v: boolean) => void;
    participantRatings: ParticipantRating[];
    setParticipantRatings: React.Dispatch<React.SetStateAction<ParticipantRating[]>>;
    editingParticipantRating: ParticipantRating | null;
    setEditingParticipantRating: React.Dispatch<React.SetStateAction<ParticipantRating | null>>;
    isParticipantRatingModalOpen: boolean;
    setIsParticipantRatingModalOpen: (v: boolean) => void;

    // Participant notes modal
    participantNotesModalOpen: boolean;
    setParticipantNotesModalOpen: (v: boolean) => void;
    participantNotesModalRecord: {
        participantId: number;
        participantName: string;
        participantRole: string;
        duration: string;
        interactionTypes: string[];
        notes: string;
    } | null;
    setParticipantNotesModalRecord: React.Dispatch<React.SetStateAction<{
        participantId: number;
        participantName: string;
        participantRole: string;
        duration: string;
        interactionTypes: string[];
        notes: string;
    } | null>>;

    // Community Care File Request state
    fileRequestReasons: string[];
    setFileRequestReasons: React.Dispatch<React.SetStateAction<string[]>>;
    isReasonModalOpen: boolean;
    setIsReasonModalOpen: (v: boolean) => void;
    tempReasonOther: string;
    setTempReasonOther: (v: string) => void;
    fileRequestDocuments: string[];
    setFileRequestDocuments: React.Dispatch<React.SetStateAction<string[]>>;
    isDocumentModalOpen: boolean;
    setIsDocumentModalOpen: (v: boolean) => void;
    tempDocumentOther: string;
    setTempDocumentOther: (v: string) => void;
    fileRequestContactSummary: string;
    setFileRequestContactSummary: (v: string) => void;
    fileRequestFollowUp: string;
    setFileRequestFollowUp: (v: string) => void;

    // Community Care Contact state
    contactPurposeOptions: string[];
    setContactPurposeOptions: React.Dispatch<React.SetStateAction<string[]>>;
    contactPurpose: string;
    setContactPurpose: (v: string) => void;
    isAddContactPurposeModalOpen: boolean;
    setIsAddContactPurposeModalOpen: (v: boolean) => void;
    newContactPurpose: string;
    setNewContactPurpose: (v: string) => void;
    interactionType: string;
    setInteractionType: (v: string) => void;
    contactSummary: string;
    setContactSummary: (v: string) => void;
    supportProvided: string;
    setSupportProvided: (v: string) => void;

    // Family Event state
    familyEventType: string;
    setFamilyEventType: (v: string) => void;
    familyEventTypeOther: string;
    setFamilyEventTypeOther: (v: string) => void;
    familyEventSummary: string;
    setFamilyEventSummary: (v: string) => void;

    // Mercy Home Activity state
    mercyActivityType: string;
    setMercyActivityType: (v: string) => void;
    mercyActivityOther: string;
    setMercyActivityOther: (v: string) => void;
    mercyActivitySummary: string;
    setMercyActivitySummary: (v: string) => void;

    // JDI state
    jdiMeetingSummary: string;
    setJdiMeetingSummary: (v: string) => void;
    jdiThemesAddressed: string;
    setJdiThemesAddressed: (v: string) => void;
    jdiSpiritualDevelopment: boolean;
    setJdiSpiritualDevelopment: (v: boolean) => void;

    // Employee Site Visit
    employeeSiteVisitSummary: string;
    setEmployeeSiteVisitSummary: (v: string) => void;

    // Tutor Session
    tutorMatch: string;
    setTutorMatch: (v: string) => void;
    tutorChangeReason: string;
    setTutorChangeReason: (v: string) => void;
    tutorChangeAction: string;
    setTutorChangeAction: (v: string) => void;
    tuteeChangeReason: string;
    setTuteeChangeReason: (v: string) => void;
    tuteeChangeAction: string;
    setTuteeChangeAction: (v: string) => void;

    // Psychiatric Hospitalization
    psychTreatmentType: string;
    setPsychTreatmentType: (v: string) => void;
    psychTreatmentLocation: string;
    setPsychTreatmentLocation: (v: string) => void;
    psychReasonForTreatment: string;
    setPsychReasonForTreatment: (v: string) => void;
    psychOutcomeOfTreatment: string;
    setPsychOutcomeOfTreatment: (v: string) => void;
    psychYouthFeedback: string;
    setPsychYouthFeedback: (v: string) => void;

    // Internal ECR Meeting
    ecrPurposes: string[];
    setEcrPurposes: React.Dispatch<React.SetStateAction<string[]>>;
    ecrPurposeDialogOpen: boolean;
    setEcrPurposeDialogOpen: (v: boolean) => void;
    ecrPurposeDraft: string[];
    setEcrPurposeDraft: React.Dispatch<React.SetStateAction<string[]>>;
    ecrPurposeSearch: string;
    setEcrPurposeSearch: (v: string) => void;
    ecrPurposeOther: string;
    setEcrPurposeOther: (v: string) => void;
    ecrSummary: string;
    setEcrSummary: (v: string) => void;
    ecrGoals: { id: number; goal: string; comment: string }[];
    setEcrGoals: React.Dispatch<React.SetStateAction<{ id: number; goal: string; comment: string }[]>>;
    ecrGoalDialogOpen: boolean;
    setEcrGoalDialogOpen: (v: boolean) => void;
    ecrGoalEditId: number | null;
    setEcrGoalEditId: React.Dispatch<React.SetStateAction<number | null>>;
    ecrGoalDraft: { goal: string; comment: string };
    setEcrGoalDraft: React.Dispatch<React.SetStateAction<{ goal: string; comment: string }>>;
    ecrSkills: Record<string, string>;
    setEcrSkills: React.Dispatch<React.SetStateAction<Record<string, string>>>;

    // Psychological Evaluation
    peRequestDate: string;
    setPeRequestDate: (v: string) => void;
    peReasons: { id: number; reason: string }[];
    setPeReasons: React.Dispatch<React.SetStateAction<{ id: number; reason: string }[]>>;
    peReasonDialogOpen: boolean;
    setPeReasonDialogOpen: (v: boolean) => void;
    peReasonEditId: number | null;
    setPeReasonEditId: React.Dispatch<React.SetStateAction<number | null>>;
    peReasonSelected: string;
    setPeReasonSelected: (v: string) => void;
    peReasonOther: string;
    setPeReasonOther: (v: string) => void;
    peRequestStatus: string;
    setPeRequestStatus: (v: string) => void;
    peRationale: string;
    setPeRationale: (v: string) => void;
    peResults: string;
    setPeResults: (v: string) => void;
    peRecommendations: string;
    setPeRecommendations: (v: string) => void;

    // School Meeting
    smPurposes: string[];
    setSmPurposes: React.Dispatch<React.SetStateAction<string[]>>;
    smPurposeDialogOpen: boolean;
    setSmPurposeDialogOpen: (v: boolean) => void;
    smPurposeDraft: string[];
    setSmPurposeDraft: React.Dispatch<React.SetStateAction<string[]>>;
    smPurposeSearch: string;
    setSmPurposeSearch: (v: string) => void;
    smSummary: string;
    setSmSummary: (v: string) => void;
    smIncidents: { id: number; incident: string }[];
    setSmIncidents: React.Dispatch<React.SetStateAction<{ id: number; incident: string }[]>>;
    smIncidentDialogOpen: boolean;
    setSmIncidentDialogOpen: (v: boolean) => void;
    smIncidentEditId: number | null;
    setSmIncidentEditId: React.Dispatch<React.SetStateAction<number | null>>;
    smIncidentDraft: string;
    setSmIncidentDraft: (v: string) => void;
    smPlans: { id: number; plan: string }[];
    setSmPlans: React.Dispatch<React.SetStateAction<{ id: number; plan: string }[]>>;
    smPlanDialogOpen: boolean;
    setSmPlanDialogOpen: (v: boolean) => void;
    smPlanEditId: number | null;
    setSmPlanEditId: React.Dispatch<React.SetStateAction<number | null>>;
    smPlanDraft: string;
    setSmPlanDraft: (v: string) => void;

    // Utility
    getCurrentDate: () => string;
}


export function DetailsTabContentBodyB(props: DetailsTabContentProps) {
    const {
        connectionFormData, setConnectionFormData,
        connectionDetails, setConnectionDetails,
        connectionParticipants,
        advocateGoals, advocateMeetingSummary, setAdvocateMeetingSummary,
        themesAddressedAdvocate, setThemesAddressedAdvocate,
        selectedAdvocateTreatmentTargets, setSelectedAdvocateTreatmentTargets,
        advocateCopingSkills, setAdvocateCopingSkills,
        advocateTriggers, setAdvocateTriggers,
        advocateStrengths, setAdvocateStrengths,
        handleOpenAdvocateGoalModal, handleDeleteAdvocateGoal,
        handleOpenCopingSkillModal, handleDeleteCopingSkill,
        handleOpenTriggerModal, handleDeleteTrigger,
        handleOpenStrengthModal, handleDeleteStrength,
        therapyGoals, setTherapyGoals, handleOpenAddGoalModal,
        selectedTreatmentTargets, setSelectedTreatmentTargets,
        isTreatmentTargetsModalOpen, setIsTreatmentTargetsModalOpen,
        participantRatings, setParticipantRatings,
        editingParticipantRating, setEditingParticipantRating,
        isParticipantRatingModalOpen, setIsParticipantRatingModalOpen,
        participantNotesModalOpen, setParticipantNotesModalOpen,
        participantNotesModalRecord, setParticipantNotesModalRecord,
        fileRequestReasons, setFileRequestReasons,
        isReasonModalOpen, setIsReasonModalOpen,
        tempReasonOther, setTempReasonOther,
        fileRequestDocuments, setFileRequestDocuments,
        isDocumentModalOpen, setIsDocumentModalOpen,
        tempDocumentOther, setTempDocumentOther,
        fileRequestContactSummary, setFileRequestContactSummary,
        fileRequestFollowUp, setFileRequestFollowUp,
        contactPurposeOptions, setContactPurposeOptions,
        contactPurpose, setContactPurpose,
        isAddContactPurposeModalOpen, setIsAddContactPurposeModalOpen,
        newContactPurpose, setNewContactPurpose,
        interactionType, setInteractionType,
        contactSummary, setContactSummary,
        supportProvided, setSupportProvided,
        familyEventType, setFamilyEventType,
        familyEventTypeOther, setFamilyEventTypeOther,
        familyEventSummary, setFamilyEventSummary,
        mercyActivityType, setMercyActivityType,
        mercyActivityOther, setMercyActivityOther,
        mercyActivitySummary, setMercyActivitySummary,
        jdiMeetingSummary, setJdiMeetingSummary,
        jdiThemesAddressed, setJdiThemesAddressed,
        jdiSpiritualDevelopment, setJdiSpiritualDevelopment,
        employeeSiteVisitSummary, setEmployeeSiteVisitSummary,
        tutorMatch, setTutorMatch,
        tutorChangeReason, setTutorChangeReason,
        tutorChangeAction, setTutorChangeAction,
        tuteeChangeReason, setTuteeChangeReason,
        tuteeChangeAction, setTuteeChangeAction,
        psychTreatmentType, setPsychTreatmentType,
        psychTreatmentLocation, setPsychTreatmentLocation,
        psychReasonForTreatment, setPsychReasonForTreatment,
        psychOutcomeOfTreatment, setPsychOutcomeOfTreatment,
        psychYouthFeedback, setPsychYouthFeedback,
        ecrPurposes, setEcrPurposes,
        ecrPurposeDialogOpen, setEcrPurposeDialogOpen,
        ecrPurposeDraft, setEcrPurposeDraft,
        ecrPurposeSearch, setEcrPurposeSearch,
        ecrPurposeOther, setEcrPurposeOther,
        ecrSummary, setEcrSummary,
        ecrGoals, setEcrGoals,
        ecrGoalDialogOpen, setEcrGoalDialogOpen,
        ecrGoalEditId, setEcrGoalEditId,
        ecrGoalDraft, setEcrGoalDraft,
        ecrSkills, setEcrSkills,
        peRequestDate, setPeRequestDate,
        peReasons, setPeReasons,
        peReasonDialogOpen, setPeReasonDialogOpen,
        peReasonEditId, setPeReasonEditId,
        peReasonSelected, setPeReasonSelected,
        peReasonOther, setPeReasonOther,
        peRequestStatus, setPeRequestStatus,
        peRationale, setPeRationale,
        peResults, setPeResults,
        peRecommendations, setPeRecommendations,
        smPurposes, setSmPurposes,
        smPurposeDialogOpen, setSmPurposeDialogOpen,
        smPurposeDraft, setSmPurposeDraft,
        smPurposeSearch, setSmPurposeSearch,
        smSummary, setSmSummary,
        smIncidents, setSmIncidents,
        smIncidentDialogOpen, setSmIncidentDialogOpen,
        smIncidentEditId, setSmIncidentEditId,
        smIncidentDraft, setSmIncidentDraft,
        smPlans, setSmPlans,
        smPlanDialogOpen, setSmPlanDialogOpen,
        smPlanEditId, setSmPlanEditId,
        smPlanDraft, setSmPlanDraft,
        getCurrentDate,
    } = props;

    return (
        <>
            <div className="space-y-6">
                <DetailsTabContentBodyB1 {...props} />
                <DetailsTabContentBodyB2 {...props} />
            </div>
        </>
    );
}