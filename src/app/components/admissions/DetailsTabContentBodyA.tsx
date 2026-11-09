import React from "react";
import { Button } from "../ui/button";
import { Plus, Pencil, Trash2, Users } from "@/app/lib/lucide-icons";
import { AlertCircle } from "@/app/lib/lucide-icons";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
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
import { AdmissionsShadowReportFields } from "./AdmissionsShadowReportFields";
import { INITIAL_CLASSES } from "../pages/Classes";

const ACTIVE_CLASSES = INITIAL_CLASSES.filter((cls) => cls.active);

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
const skillOptions = ["Not Yet", "Emerging", "Developing", "Achieved"];

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
    /** Community Care Member context: Community Care Event omits Participant Notes. */
    hideEventParticipantNotes?: boolean;
    /** Alternate Admissions Profiles for the same youth (US 19983). Related
     *  Admission Attempt is shown only when this is non-empty. */
    relatedAdmissionAttemptOptions?: { value: string; label: string }[];
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


export function DetailsTabContentBodyA(props: DetailsTabContentProps) {
    const {
        relatedAdmissionAttemptOptions = [],
        hideEventParticipantNotes = false,
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
                                {/* Class Session Details */}
                                {connectionFormData.type === "Class Session" && (
                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Class Name <span className="text-red-600">*</span></Label>
                                            <Select
                                              value={connectionFormData.classId || ""}
                                              onValueChange={(value) => setConnectionFormData({ ...connectionFormData, classId: value })}
                                            >
                                                <SelectTrigger className="h-9 slds-text-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                    <SelectValue placeholder="Select a class…" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ACTIVE_CLASSES.map((cls) => (
                                                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                {(() => {
                                                    const cls = INITIAL_CLASSES.find((c) => c.id === connectionFormData.classId);
                                                    return cls?.description
                                                        ? `Class description: ${cls.description}`
                                                        : "Insert Class description for the selected class";
                                                })()}
                                            </p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Comments</Label>
                                            <Textarea
                                              value={connectionFormData.comments || ""}
                                              onChange={(e) => setConnectionFormData({ ...connectionFormData, comments: e.target.value })}
                                              className="slds-text-4 min-h-[100px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Add Comments"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Collaborative Event Details */}
                                {connectionFormData.type === "Collaborative Event" && (
                                    <div className="space-y-1.5">
                                        <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Summary</Label>
                                        <Textarea
                                          value={connectionFormData.summary || ""}
                                          onChange={(e) => setConnectionFormData({ ...connectionFormData, summary: e.target.value })}
                                          className="slds-text-4 min-h-[100px] resize-y"
                                          style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                          placeholder="Enter meeting summary"
                                        />
                                    </div>
                                )}

                                {/* Orthodontist Appointment Details */}
                                {connectionFormData.type === "Orthodontist Appointment" && (
                                    <div className="space-y-5">
                                        {/* Reason */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Reason</Label>
                                            <Textarea
                                              value={connectionDetails.orthodontistReason || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, orthodontistReason: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter reason for appointment"
                                            />
                                        </div>

                                        {/* Diagnosis */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Diagnosis</Label>
                                            <Textarea
                                              value={connectionDetails.orthodontistDiagnosis || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, orthodontistDiagnosis: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter diagnosis"
                                            />
                                        </div>

                                        {/* Was New Medication or Dosage Prescribed? */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Was New Medication or Dosage Prescribed?
                                            </Label>
                                            <Select
                                              value={connectionDetails.orthodontistNewMedication || ""}
                                              onValueChange={(val) => setConnectionDetails({ ...connectionDetails, orthodontistNewMedication: val })}
                                            >
                                                <SelectTrigger className="h-9 slds-text-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                    <SelectValue placeholder="Please Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Yes" className="slds-text-4">Yes</SelectItem>
                                                    <SelectItem value="No" className="slds-text-4">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {connectionDetails.orthodontistNewMedication === "Yes" && (
                                                <div
                                                    className="flex items-start gap-2.5 rounded-md px-4 py-3 mt-2"
                                                    style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}
                                                >
                                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#92400E' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                                    </svg>
                                                    <p className="slds-text-4 mb-0" style={{ color: '#92400E' }}>
                                                        Reminder: add the new prescription to the youth's record via Medication functionality and complete a medication consent form.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Recommendations */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Recommendations</Label>
                                            <Textarea
                                              value={connectionDetails.orthodontistRecommendations || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, orthodontistRecommendations: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter recommendations"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Dietitian/Nutritionist Appointment Details */}
                                {connectionFormData.type === "Dietitian/Nutritionist Appointment" && (
                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Reason</Label>
                                            <Textarea
                                              value={connectionDetails.dietitianReason || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, dietitianReason: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter reason for appointment"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Diagnosis</Label>
                                            <Textarea
                                              value={connectionDetails.dietitianDiagnosis || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, dietitianDiagnosis: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter diagnosis"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Was New Medication or Dosage Prescribed?
                                            </Label>
                                            <Select
                                              value={connectionDetails.dietitianNewMedication || ""}
                                              onValueChange={(val) => setConnectionDetails({ ...connectionDetails, dietitianNewMedication: val })}
                                            >
                                                <SelectTrigger className="h-9 slds-text-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                    <SelectValue placeholder="Please Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Yes" className="slds-text-4">Yes</SelectItem>
                                                    <SelectItem value="No" className="slds-text-4">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {connectionDetails.dietitianNewMedication === "Yes" && (
                                                <div
                                                    className="flex items-start gap-2.5 rounded-md px-4 py-3 mt-2"
                                                    style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}
                                                >
                                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#92400E' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                                    </svg>
                                                    <p className="slds-text-4 mb-0" style={{ color: '#92400E' }}>
                                                        Reminder: add the new prescription to the youth's record via Medication functionality and complete a medication consent form.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Recommendations</Label>
                                            <Textarea
                                              value={connectionDetails.dietitianRecommendations || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, dietitianRecommendations: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter recommendations"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ER Visit Details */}
                                {connectionFormData.type === "ER Visit" && (
                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Reason</Label>
                                            <Textarea
                                              value={connectionDetails.erVisitReason || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, erVisitReason: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter reason for ER visit"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Diagnosis</Label>
                                            <Textarea
                                              value={connectionDetails.erVisitDiagnosis || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, erVisitDiagnosis: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter diagnosis"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Was New Medication or Dosage Prescribed?
                                            </Label>
                                            <Select
                                              value={connectionDetails.erVisitNewMedication || ""}
                                              onValueChange={(val) => setConnectionDetails({ ...connectionDetails, erVisitNewMedication: val })}
                                            >
                                                <SelectTrigger className="h-9 slds-text-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                    <SelectValue placeholder="Please Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Yes" className="slds-text-4">Yes</SelectItem>
                                                    <SelectItem value="No" className="slds-text-4">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {connectionDetails.erVisitNewMedication === "Yes" && (
                                                <div
                                                    className="flex items-start gap-2.5 rounded-md px-4 py-3 mt-2"
                                                    style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}
                                                >
                                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#92400E' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                                    </svg>
                                                    <p className="slds-text-4 mb-0" style={{ color: '#92400E' }}>
                                                        Reminder: add the new prescription to the youth's record via Medication functionality and complete a medication consent form.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Recommendations</Label>
                                            <Textarea
                                              value={connectionDetails.erVisitRecommendations || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, erVisitRecommendations: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter recommendations"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Doctor Office Visit Details */}
                                {connectionFormData.type === "Doctor Office Visit" && (
                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Reason</Label>
                                            <Textarea
                                              value={connectionDetails.doctorReason || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, doctorReason: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter reason for appointment"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Diagnosis</Label>
                                            <Textarea
                                              value={connectionDetails.doctorDiagnosis || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, doctorDiagnosis: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter diagnosis"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Was New Medication or Dosage Prescribed?
                                            </Label>
                                            <Select
                                              value={connectionDetails.doctorNewMedication || ""}
                                              onValueChange={(val) => setConnectionDetails({ ...connectionDetails, doctorNewMedication: val })}
                                            >
                                                <SelectTrigger className="h-9 slds-text-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                    <SelectValue placeholder="Please Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Yes" className="slds-text-4">Yes</SelectItem>
                                                    <SelectItem value="No" className="slds-text-4">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {connectionDetails.doctorNewMedication === "Yes" && (
                                                <div
                                                    className="flex items-start gap-2.5 rounded-md px-4 py-3 mt-2"
                                                    style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}
                                                >
                                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#92400E' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                                    </svg>
                                                    <p className="slds-text-4 mb-0" style={{ color: '#92400E' }}>
                                                        Reminder: add the new prescription to the youth's record via Medication functionality and complete a medication consent form.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Recommendations</Label>
                                            <Textarea
                                              value={connectionDetails.doctorRecommendations || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, doctorRecommendations: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter recommendations"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Surgery Appointment Details */}
                                {connectionFormData.type === "Surgery Appointment" && (
                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Reason</Label>
                                            <Textarea
                                              value={connectionDetails.surgeryReason || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, surgeryReason: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter reason for surgery"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Diagnosis</Label>
                                            <Textarea
                                              value={connectionDetails.surgeryDiagnosis || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, surgeryDiagnosis: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter diagnosis"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Was New Medication or Dosage Prescribed?
                                            </Label>
                                            <Select
                                              value={connectionDetails.surgeryNewMedication || ""}
                                              onValueChange={(val) => setConnectionDetails({ ...connectionDetails, surgeryNewMedication: val })}
                                            >
                                                <SelectTrigger className="h-9 slds-text-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                    <SelectValue placeholder="Please Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Yes" className="slds-text-4">Yes</SelectItem>
                                                    <SelectItem value="No" className="slds-text-4">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {connectionDetails.surgeryNewMedication === "Yes" && (
                                                <div
                                                    className="flex items-start gap-2.5 rounded-md px-4 py-3 mt-2"
                                                    style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}
                                                >
                                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#92400E' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                                    </svg>
                                                    <p className="slds-text-4 mb-0" style={{ color: '#92400E' }}>
                                                        Reminder: add the new prescription to the youth's record via Medication functionality and complete a medication consent form.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Recommendations</Label>
                                            <Textarea
                                              value={connectionDetails.surgeryRecommendations || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, surgeryRecommendations: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter recommendations"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Urgent Care Visit Details */}
                                {connectionFormData.type === "Urgent Care Visit" && (
                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Reason</Label>
                                            <Textarea
                                              value={connectionDetails.urgentCareReason || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, urgentCareReason: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter reason for urgent care visit"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Diagnosis</Label>
                                            <Textarea
                                              value={connectionDetails.urgentCareDiagnosis || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, urgentCareDiagnosis: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter diagnosis"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Was New Medication or Dosage Prescribed?
                                            </Label>
                                            <Select
                                              value={connectionDetails.urgentCareNewMedication || ""}
                                              onValueChange={(val) => setConnectionDetails({ ...connectionDetails, urgentCareNewMedication: val })}
                                            >
                                                <SelectTrigger className="h-9 slds-text-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                    <SelectValue placeholder="Please Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Yes" className="slds-text-4">Yes</SelectItem>
                                                    <SelectItem value="No" className="slds-text-4">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {connectionDetails.urgentCareNewMedication === "Yes" && (
                                                <div
                                                    className="flex items-start gap-2.5 rounded-md px-4 py-3 mt-2"
                                                    style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}
                                                >
                                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#92400E' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                                    </svg>
                                                    <p className="slds-text-4 mb-0" style={{ color: '#92400E' }}>
                                                        Reminder: add the new prescription to the youth's record via Medication functionality and complete a medication consent form.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Recommendations</Label>
                                            <Textarea
                                              value={connectionDetails.urgentCareRecommendations || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, urgentCareRecommendations: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter recommendations"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Medical Hospitalization Details */}
                                {connectionFormData.type === "Medical Hospitalization" && (
                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Reason</Label>
                                            <Textarea
                                              value={connectionDetails.medHospReason || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, medHospReason: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter reason for hospitalization"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Diagnosis</Label>
                                            <Textarea
                                              value={connectionDetails.medHospDiagnosis || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, medHospDiagnosis: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter diagnosis"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Was New Medication or Dosage Prescribed?
                                            </Label>
                                            <Select
                                              value={connectionDetails.medHospNewMedication || ""}
                                              onValueChange={(val) => setConnectionDetails({ ...connectionDetails, medHospNewMedication: val })}
                                            >
                                                <SelectTrigger className="h-9 slds-text-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                    <SelectValue placeholder="Please Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Yes" className="slds-text-4">Yes</SelectItem>
                                                    <SelectItem value="No" className="slds-text-4">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {connectionDetails.medHospNewMedication === "Yes" && (
                                                <div
                                                    className="flex items-start gap-2.5 rounded-md px-4 py-3 mt-2"
                                                    style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}
                                                >
                                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#92400E' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                                    </svg>
                                                    <p className="slds-text-4 mb-0" style={{ color: '#92400E' }}>
                                                        Reminder: add the new prescription to the youth's record via Medication functionality and complete a medication consent form.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Recommendations</Label>
                                            <Textarea
                                              value={connectionDetails.medHospRecommendations || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, medHospRecommendations: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter recommendations"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Nurse Visit Details */}
                                {connectionFormData.type === "Nurse Visit" && (
                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Reason</Label>
                                            <Textarea
                                              value={connectionDetails.nurseVisitReason || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, nurseVisitReason: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter reason for visit"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Diagnosis</Label>
                                            <Textarea
                                              value={connectionDetails.nurseVisitDiagnosis || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, nurseVisitDiagnosis: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter diagnosis"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Was New Medication or Dosage Prescribed?
                                            </Label>
                                            <Select
                                              value={connectionDetails.nurseVisitNewMedication || ""}
                                              onValueChange={(val) => setConnectionDetails({ ...connectionDetails, nurseVisitNewMedication: val })}
                                            >
                                                <SelectTrigger className="h-9 slds-text-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                    <SelectValue placeholder="Please Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Yes" className="slds-text-4">Yes</SelectItem>
                                                    <SelectItem value="No" className="slds-text-4">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {connectionDetails.nurseVisitNewMedication === "Yes" && (
                                                <div
                                                    className="flex items-start gap-2.5 rounded-md px-4 py-3 mt-2"
                                                    style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}
                                                >
                                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#92400E' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                                    </svg>
                                                    <p className="slds-text-4 mb-0" style={{ color: '#92400E' }}>
                                                        Reminder: add the new prescription to the youth's record via Medication functionality and complete a medication consent form.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Recommendations</Label>
                                            <Textarea
                                              value={connectionDetails.nurseVisitRecommendations || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, nurseVisitRecommendations: e.target.value })}
                                              className="slds-text-4 min-h-[80px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter recommendations"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Care Planning Meeting Details */}
                                {connectionFormData.type === "Care Planning Meeting" && (
                                    <>
                                        {/* Related ITP */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Related ITP</Label>
                                            <Select
                                              value={connectionFormData.relatedITP || ""}
                                              onValueChange={(val) => setConnectionFormData({ ...connectionFormData, relatedITP: val })}
                                            >
                                                <SelectTrigger className="h-9 slds-text-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                    <SelectValue placeholder="Select ITP record" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[300px] overflow-y-auto">
                                                    <SelectItem value="ITP-2024-001" className="slds-text-4">ITP 2024 — Active (01/15/2024)</SelectItem>
                                                    <SelectItem value="ITP-2023-001" className="slds-text-4">ITP 2023 — Closed (01/10/2023)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="slds-text-3 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>ITP records associated with this youth will appear here.</p>
                                        </div>

                                        {/* Meeting Summary */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Meeting Summary</Label>
                                            <Textarea
                                              value={connectionFormData.carePlanningMeetingSummary || ""}
                                              onChange={(e) => setConnectionFormData({ ...connectionFormData, carePlanningMeetingSummary: e.target.value })}
                                              className="slds-text-4 min-h-[100px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter meeting summary"
                                            />
                                        </div>

                                        {/* Transition Planning Discussion */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Transition Planning Discussion</Label>
                                            <Textarea
                                              value={connectionFormData.transitionPlanningDiscussion || ""}
                                              onChange={(e) => setConnectionFormData({ ...connectionFormData, transitionPlanningDiscussion: e.target.value })}
                                              className="slds-text-4 min-h-[100px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                              placeholder="Enter transition planning discussion notes"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Language Field - For Info Sessions */}
                                {(connectionFormData.type === "Individual Info Session" || connectionFormData.type === "Group Info Session") && (
                                    <>
                                        <div className="grid gap-2">
                                            <Label className="text-[13px] text-[#3e3e3c] font-medium">Language</Label>
                                            <Select
                                              value={connectionFormData.language || ""}
                                              onValueChange={(value) => {
                                                setConnectionFormData({ ...connectionFormData, language: value });
                                                if (value !== "Other") {
                                                  setConnectionFormData({ ...connectionFormData, language: value, languageOther: "" });
                                                }
                                              }}
                                            >
                                                <SelectTrigger className="h-9 text-[13px] border-[#dddbda]">
                                                    <SelectValue placeholder="Please Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {languageOptions.map((lang) => (
                                                        <SelectItem key={lang} value={lang} className="text-[13px]">{lang}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Language Other Text Field */}
                                        {connectionFormData.language === "Other" && (
                                            <div className="grid gap-2">
                                                <Label className="text-[13px] text-[#3e3e3c] font-medium">Specify Other Language <span className="text-red-600">*</span></Label>
                                                <Input
                                                  type="text"
                                                  value={connectionFormData.languageOther || ""}
                                                  onChange={(e) => setConnectionFormData({ ...connectionFormData, languageOther: e.target.value })}
                                                  className="h-9 text-[13px] border-[#dddbda]"
                                                  placeholder="Enter language"
                                                />
                                            </div>
                                        )}

                                        {/* Summary Field */}
                                        <div className="grid gap-2">
                                            <Label className="text-[13px] text-[#3e3e3c] font-medium">Summary</Label>
                                            <Textarea
                                              value={connectionFormData.summary || ""}
                                              onChange={(e) => setConnectionFormData({ ...connectionFormData, summary: e.target.value })}
                                              placeholder="Enter summary details..."
                                              className="min-h-[180px] text-[13px] border-[#dddbda] resize-none"
                                              style={{ fontFamily: 'inherit' }}
                                            />
                                            <p className="text-[11px] text-[#706e6b] mt-1">
                                                Provide a summary of the connection, outcomes, and any relevant notes.
                                            </p>
                                        </div>
                                    </>
                                )}

                                {/* Advocate Meeting Details Tab */}
                                {connectionFormData.type === "Advocate Meeting" && (
                                    <div className="space-y-6">
                                        {/* Goals Table */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[13px] text-[#3e3e3c] font-medium">Goals</Label>
                                                <Button
                                                  onClick={() => handleOpenAdvocateGoalModal()}
                                                  className="rounded-full h-8 px-3 text-[12px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
                                                >
                                                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                                                    Add
                                                </Button>
                                            </div>
                                            {advocateGoals.length > 0 ? (
                                                <div className="border rounded-lg overflow-hidden border-[#dddbda]">
                                                    <table className="w-full">
                                                        <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                            <tr>
                                                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)', width: '35%' }}>Goal</th>
                                                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>Comments</th>
                                                                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)', width: '100px' }}>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                            {advocateGoals.map((goal) => (
                                                                <tr key={goal.id}>
                                                                    <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{goal.goal}</td>
                                                                    <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{goal.comments}</td>
                                                                    <td className="px-4 py-3 text-right">
                                                                        <button
                                                                          onClick={() => handleOpenAdvocateGoalModal(goal)}
                                                                          className="p-1.5 rounded hover:bg-gray-100 transition-colors mr-1"
                                                                          title="Modify"
                                                                        >
                                                                            <Pencil className="h-4 w-4 text-[#0176d3]" />
                                                                        </button>
                                                                        <button
                                                                          onClick={() => handleDeleteAdvocateGoal(goal.id)}
                                                                          className="p-1.5 rounded hover:bg-red-100 transition-colors"
                                                                          title="Delete"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: '#dddbda' }}>
                                                    <p className="text-[13px] text-[#706e6b]">No goals added yet. Click "Add" to add goals.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Meeting Summary */}
                                        <div className="grid gap-2">
                                            <Label className="text-[13px] text-[#3e3e3c] font-medium">Meeting Summary</Label>
                                            <Textarea
                                              value={advocateMeetingSummary}
                                              onChange={(e) => setAdvocateMeetingSummary(e.target.value)}
                                              placeholder="Enter meeting summary and notes..."
                                              className="min-h-[100px] text-[13px] border-[#dddbda] resize-none"
                                              style={{ fontFamily: 'inherit' }}
                                            />
                                        </div>

                                        {/* Themes Addressed */}
                                        <div className="grid gap-2">
                                            <Label className="text-[13px] text-[#3e3e3c] font-medium">Themes Addressed</Label>
                                            <Textarea
                                              value={themesAddressedAdvocate}
                                              onChange={(e) => setThemesAddressedAdvocate(e.target.value)}
                                              placeholder="Enter themes addressed during the meeting..."
                                              className="min-h-[100px] text-[13px] border-[#dddbda] resize-none"
                                              style={{ fontFamily: 'inherit' }}
                                            />
                                        </div>

                                        {/* Treatment Targets */}
                                        <div className="space-y-3">
                                            <Label className="text-[13px] text-[#3e3e3c] font-medium">Treatment Targets</Label>
                                            <div className="border rounded-lg p-4 space-y-2" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                {treatmentTargetOptions.map((target) => (
                                                    <div key={target} className="flex items-center gap-2">
                                                        <Checkbox
                                                          id={`advocate-target-${target}`}
                                                          checked={selectedAdvocateTreatmentTargets.includes(target)}
                                                          onCheckedChange={(checked) => {
                                                              if (checked) {
                                                                  setSelectedAdvocateTreatmentTargets([...selectedAdvocateTreatmentTargets, target]);
                                                              } else {
                                                                  setSelectedAdvocateTreatmentTargets(selectedAdvocateTreatmentTargets.filter(t => t !== target));
                                                              }
                                                          }}
                                                        />
                                                        <Label htmlFor={`advocate-target-${target}`} className="text-[13px] text-[#3e3e3c] cursor-pointer flex-1">
                                                            {target}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Coping Skills Table */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Coping Skills</Label>
                                                <Button
                                                  onClick={() => handleOpenCopingSkillModal()}
                                                  className="rounded-full h-8 px-3 text-[12px] font-medium bg-[#145F33] hover:bg-[#0e4524] text-white shadow-none"
                                                >
                                                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                                                    Add
                                                </Button>
                                            </div>
                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                {youthCopingSkillsOptions.map((option, index) => {
                                                    const existing = advocateCopingSkills.find(s => s.skill === option);
                                                    const isSelected = !!existing;
                                                    return (
                                                        <label
                                                            key={option}
                                                            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                                                            style={{
                                                                borderBottom: index < youthCopingSkillsOptions.length - 1
                                                                    ? '1px solid var(--slds-g-color-border-base-1)'
                                                                    : 'none',
                                                                backgroundColor: isSelected
                                                                    ? 'rgba(20, 95, 51, 0.05)'
                                                                    : 'var(--slds-g-color-background-base)'
                                                            }}
                                                        >
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        setAdvocateCopingSkills(prev => [...prev, {
                                                                            id: Date.now(),
                                                                            skill: option,
                                                                            dateReported: getCurrentDate(),
                                                                            reportedBy: "Sohan Jadhavrao",
                                                                            relationshipToYouth: "Advocate",
                                                                            description: "",
                                                                            effectiveWhen: ""
                                                                        }]);
                                                                    } else {
                                                                        setAdvocateCopingSkills(prev => prev.filter(s => s.skill !== option));
                                                                    }
                                                                }}
                                                            />
                                                            <span className="slds-text-4 flex-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {option}
                                                            </span>
                                                            {isSelected && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                        {existing?.dateReported}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.preventDefault(); handleOpenCopingSkillModal(existing); }}
                                                                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                                                                        title="Edit details"
                                                                    >
                                                                        <Pencil className="h-3.5 w-3.5 text-[#0176d3]" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                                {advocateCopingSkills
                                                    .filter(s => !youthCopingSkillsOptions.includes(s.skill))
                                                    .map((existing, idx, arr) => (
                                                        <div
                                                            key={`custom-coping-${existing.id}`}
                                                            className="flex items-center gap-3 px-4 py-2.5"
                                                            style={{
                                                                borderTop: '1px solid var(--slds-g-color-border-base-1)',
                                                                backgroundColor: 'rgba(20, 95, 51, 0.05)'
                                                            }}
                                                        >
                                                            <Checkbox
                                                                checked={true}
                                                                onCheckedChange={() => handleDeleteCopingSkill(existing.id)}
                                                            />
                                                            <span className="slds-text-4 flex-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {existing.skill}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    {existing.dateReported}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenCopingSkillModal(existing)}
                                                                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                                                                    title="Edit details"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5 text-[#0176d3]" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>

                                        {/* Triggers Table */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Triggers</Label>
                                                <Button
                                                  onClick={() => handleOpenTriggerModal()}
                                                  className="rounded-full h-8 px-3 text-[12px] font-medium bg-[#145F33] hover:bg-[#0e4524] text-white shadow-none"
                                                >
                                                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                                                    Add
                                                </Button>
                                            </div>
                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                {youthTriggersOptions.map((option, index) => {
                                                    const existing = advocateTriggers.find(t => t.trigger === option);
                                                    const isSelected = !!existing;
                                                    return (
                                                        <label
                                                            key={option}
                                                            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                                                            style={{
                                                                borderBottom: index < youthTriggersOptions.length - 1
                                                                    ? '1px solid var(--slds-g-color-border-base-1)'
                                                                    : 'none',
                                                                backgroundColor: isSelected
                                                                    ? 'rgba(20, 95, 51, 0.05)'
                                                                    : 'var(--slds-g-color-background-base)'
                                                            }}
                                                        >
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        setAdvocateTriggers(prev => [...prev, {
                                                                            id: Date.now(),
                                                                            trigger: option,
                                                                            dateReported: getCurrentDate(),
                                                                            reportedBy: "Sohan Jadhavrao",
                                                                            relationshipToYouth: "Advocate",
                                                                            description: ""
                                                                        }]);
                                                                    } else {
                                                                        setAdvocateTriggers(prev => prev.filter(t => t.trigger !== option));
                                                                    }
                                                                }}
                                                            />
                                                            <span className="slds-text-4 flex-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {option}
                                                            </span>
                                                            {isSelected && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                        {existing?.dateReported}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.preventDefault(); handleOpenTriggerModal(existing); }}
                                                                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                                                                        title="Edit details"
                                                                    >
                                                                        <Pencil className="h-3.5 w-3.5 text-[#0176d3]" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                                {advocateTriggers
                                                    .filter(t => !youthTriggersOptions.includes(t.trigger))
                                                    .map((existing) => (
                                                        <div
                                                            key={`custom-trigger-${existing.id}`}
                                                            className="flex items-center gap-3 px-4 py-2.5"
                                                            style={{
                                                                borderTop: '1px solid var(--slds-g-color-border-base-1)',
                                                                backgroundColor: 'rgba(20, 95, 51, 0.05)'
                                                            }}
                                                        >
                                                            <Checkbox
                                                                checked={true}
                                                                onCheckedChange={() => handleDeleteTrigger(existing.id)}
                                                            />
                                                            <span className="slds-text-4 flex-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {existing.trigger}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    {existing.dateReported}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenTriggerModal(existing)}
                                                                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                                                                    title="Edit details"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5 text-[#0176d3]" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>

                                        {/* Strengths Table */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Strengths</Label>
                                                <Button
                                                  onClick={() => handleOpenStrengthModal()}
                                                  className="rounded-full h-8 px-3 text-[12px] font-medium bg-[#145F33] hover:bg-[#0e4524] text-white shadow-none"
                                                >
                                                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                                                    Add
                                                </Button>
                                            </div>
                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                {youthStrengthsOptions.map((option, index) => {
                                                    const existing = advocateStrengths.find(s => s.strength === option);
                                                    const isSelected = !!existing;
                                                    return (
                                                        <label
                                                            key={option}
                                                            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                                                            style={{
                                                                borderBottom: index < youthStrengthsOptions.length - 1
                                                                    ? '1px solid var(--slds-g-color-border-base-1)'
                                                                    : 'none',
                                                                backgroundColor: isSelected
                                                                    ? 'rgba(20, 95, 51, 0.05)'
                                                                    : 'var(--slds-g-color-background-base)'
                                                            }}
                                                        >
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        setAdvocateStrengths(prev => [...prev, {
                                                                            id: Date.now(),
                                                                            strength: option,
                                                                            dateReported: getCurrentDate(),
                                                                            reportedBy: "Sohan Jadhavrao",
                                                                            relationshipToYouth: "Advocate",
                                                                            description: ""
                                                                        }]);
                                                                    } else {
                                                                        setAdvocateStrengths(prev => prev.filter(s => s.strength !== option));
                                                                    }
                                                                }}
                                                            />
                                                            <span className="slds-text-4 flex-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {option}
                                                            </span>
                                                            {isSelected && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                        {existing?.dateReported}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.preventDefault(); handleOpenStrengthModal(existing); }}
                                                                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                                                                        title="Edit details"
                                                                    >
                                                                        <Pencil className="h-3.5 w-3.5 text-[#0176d3]" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                                {advocateStrengths
                                                    .filter(s => !youthStrengthsOptions.includes(s.strength))
                                                    .map((existing) => (
                                                        <div
                                                            key={`custom-strength-${existing.id}`}
                                                            className="flex items-center gap-3 px-4 py-2.5"
                                                            style={{
                                                                borderTop: '1px solid var(--slds-g-color-border-base-1)',
                                                                backgroundColor: 'rgba(20, 95, 51, 0.05)'
                                                            }}
                                                        >
                                                            <Checkbox
                                                                checked={true}
                                                                onCheckedChange={() => handleDeleteStrength(existing.id)}
                                                            />
                                                            <span className="slds-text-4 flex-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {existing.strength}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    {existing.dateReported}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenStrengthModal(existing)}
                                                                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                                                                    title="Edit details"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5 text-[#0176d3]" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Admissions Shadow — Shadow Report (US 17657) */}
                                {connectionFormData.type === "Admissions Shadow" && (
                                    <AdmissionsShadowReportFields
                                        connectionFormData={connectionFormData}
                                        setConnectionFormData={setConnectionFormData}
                                    />
                                )}

                                {/* For other connection types, show different details */}
                                {(connectionFormData.type === "Admissions Wait List Group" ||
                                  connectionFormData.type === "Admissions Clinical Assessment") && (
                                    <div className="space-y-4">
                                        {/* Related Admission Attempt — optional; only when the youth
                                            has more than one Admissions Profile (US 19983) */}
                                        {connectionFormData.type === "Admissions Clinical Assessment" &&
                                          relatedAdmissionAttemptOptions.length > 0 && (
                                            <div className="space-y-1.5">
                                                <Label htmlFor="related-admission-attempt" className="text-[13px] text-[#3e3e3c] font-medium">
                                                    Related Admission Attempt
                                                </Label>
                                                <Select
                                                    value={connectionDetails.relatedAdmissionAttempt || ""}
                                                    onValueChange={(val) => setConnectionDetails({ ...connectionDetails, relatedAdmissionAttempt: val })}
                                                >
                                                    <SelectTrigger id="related-admission-attempt" className="h-9 slds-text-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                        <SelectValue placeholder="Please Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {relatedAdmissionAttemptOptions.map((o) => (
                                                            <SelectItem key={o.value} value={o.value}>
                                                                {o.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {/* Summary */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[13px] text-[#3e3e3c] font-medium">
                                                Summary:
                                            </Label>
                                            <Textarea
                                              value={connectionDetails.summary}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, summary: e.target.value })}
                                              placeholder="Enter summary details..."
                                              className="min-h-[180px] text-[13px] border-[#dddbda] resize-none"
                                              style={{ fontFamily: 'inherit' }}
                                            />
                                            <p className="text-[11px] text-[#706e6b] mt-1">
                                                Provide a detailed summary of the connection activities, outcomes, and any relevant notes.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {connectionFormData.type === "Integrated Substance Use Assessment" && (
                                    <SubstanceUseAssessmentFields 
                                        connectionDetails={connectionDetails} 
                                        setConnectionDetails={setConnectionDetails} 
                                    />
                                )}

                                {/* Community Care Event Details */}
                                {connectionFormData.type === "Community Care Event" && (
                                    <div className="space-y-6">

                                        {/* A. Event Selection */}
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="cce-event" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                    Event <span className="text-red-600">*</span>
                                                </Label>
                                                <Select
                                                    value={(connectionDetails as any).communityEvent || ""}
                                                    onValueChange={(val) => setConnectionDetails({
                                                        ...connectionDetails,
                                                        communityEvent: val,
                                                        ...(val !== "Other" ? { communityEventOther: "" } : {}),
                                                    } as any)}
                                                >
                                                    <SelectTrigger id="cce-event" className="h-9 slds-text-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                        <SelectValue placeholder="Please Select" />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-[300px] overflow-y-auto">
                                                        {[
                                                            "Christmas Party",
                                                            "Convivio",
                                                            "Day of Reflection",
                                                            "Monthly Event",
                                                            "Scholar Retreat",
                                                            "High School Group",
                                                            "Service Trip",
                                                            "Women's Empowerment Group",
                                                            "Mercy Fest",
                                                            "Thanksgiving Dinner",
                                                            "Other",
                                                        ].map((opt) => (
                                                            <SelectItem key={opt} value={opt} className="slds-text-4">{opt}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Conditional "Other" text field */}
                                            {(connectionDetails as any).communityEvent === "Other" && (
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="cce-other" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        Other <span className="text-red-600">*</span>
                                                    </Label>
                                                    <Input
                                                        id="cce-other"
                                                        type="text"
                                                        value={(connectionDetails as any).communityEventOther || ""}
                                                        onChange={(e) => setConnectionDetails({ ...connectionDetails, communityEventOther: e.target.value } as any)}
                                                        placeholder="Specify event name…"
                                                        className="h-9 slds-text-4"
                                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* B. Event Summary */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Event Summary</Label>
                                            <RichTextEditor
                                                value={connectionFormData.description || ""}
                                                onChange={(val) => setConnectionFormData({ ...connectionFormData, description: val })}
                                                placeholder="Capture high-level details of the event…"
                                                minHeight="150px"
                                            />
                                        </div>

                                        {/* C. Participant Notes — omitted for a Community Care Member */}
                                        {!hideEventParticipantNotes && (
                                        <div className="space-y-3">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Participant Notes</Label>
                                            {(() => {
                                                const allParticipants = connectionParticipants;
                                                return allParticipants.length > 0 ? (
                                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                                                            <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                                                                <tr>
                                                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)', width: '28%' }}>Participant</th>
                                                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>Notes</th>
                                                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)', width: '90px' }}>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {allParticipants.map((p, idx) => {
                                                                    const note = (connectionDetails as any)[`participant_note_${p.id}`] || "";
                                                                    return (
                                                                        <tr key={p.id} style={{ borderBottom: idx < allParticipants.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                            <td className="px-4 py-3">
                                                                                <div className="slds-text-4 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{p.participant}</div>
                                                                                <div className="slds-text-3 mt-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>{p.role}</div>
                                                                            </td>
                                                                            <td className="px-4 py-3">
                                                                                {note
                                                                                    ? <span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties} title={note}>{note}</span>
                                                                                    : <span className="slds-text-4 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>No notes added</span>
                                                                                }
                                                                            </td>
                                                                            <td className="px-4 py-3 text-right">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setParticipantNotesModalRecord({
                                                                                            participantId: p.id,
                                                                                            participantName: p.participant,
                                                                                            participantRole: p.role,
                                                                                            notes: note,
                                                                                            duration: "",
                                                                                            interactionTypes: [],
                                                                                        });
                                                                                        setParticipantNotesModalOpen(true);
                                                                                    }}
                                                                                    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full slds-text-3 font-medium transition-colors"
                                                                                    style={{ color: '#0176d3', border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                                                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)')}
                                                                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)')}
                                                                                >
                                                                                    <Pencil className="h-3 w-3" />
                                                                                    Modify
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center rounded-lg py-8 text-center" style={{ border: '2px dashed var(--slds-g-color-border-base-1)' }}>
                                                        <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No participants added yet.</p>
                                                        <p className="slds-text-3 mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>Add participants in the Connection tab to capture individual notes here.</p>
                                                    </div>
                                                );
                                            })()}
                                            <p className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Notes are captured per participant. Click Modify to enter event-specific notes.
                                            </p>
                                        </div>
                                        )}
                                    </div>
                                )}

                                {/* Community Care Family Therapy Session Details */}
                                {connectionFormData.type === "Community Care Family Therapy Session" && (
                                    <div className="space-y-6">

                                        {/* Description */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Description</Label>
                                            <Textarea
                                              value={connectionFormData.description || ""}
                                              onChange={(e) => setConnectionFormData({ ...connectionFormData, description: e.target.value })}
                                              placeholder="Enter session description and narrative…"
                                              className="slds-text-4 min-h-[150px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)',backgroundColor: 'var(--slds-g-color-background-base)' }}
                                            />
                                        </div>
                                      {/* Skill Assessment */}
          <div className="space-y-4">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Skill Assessment
            </Label>

            {[
              {
                label:
                  "Youth can identify and express emotions.",
                name: "skill-identify-express-emotions",
                field: "identifyExpressEmotions",
              },
              {
                label:
                  "Youth can regulate strong emotions in the moment.",
                name: "skill-regulate-emotions",
                field: "regulateStrongEmotions",
              },
              {
                label:
                  "Youth demonstrates healthy boundaries with others.",
                name: "skill-healthy-boundaries",
                field: "healthyBoundaries",
              },
              {
                label:
                  "Youth can effectively reflect on challenging situations.",
                name: "skill-reflect-situations",
                field: "reflectChallengingSituations",
              },
              {
                label: "Youth demonstrates self-acceptance.",
                name: "skill-self-acceptance",
                field: "selfAcceptance",
              },
              {
                label: "Youth is hopeful about their future.",
                name: "skill-hopeful-future",
                field: "hopefulAboutFuture",
              },
            ].map(({ label, name, field }) => (
              <div key={field} className="space-y-2">
                <Label
                  className="slds-text-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {label}
                </Label>
                <div className="flex flex-wrap gap-4">
                  {skillOptions.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={name}
                        value={opt}
                        checked={
                          connectionFormData.skillAssessment?.[
                            field
                          ] === opt
                        }
                        onChange={(e) =>
                          setConnectionFormData({
                            ...connectionFormData,
                            skillAssessment: {
                              ...connectionFormData.skillAssessment,
                              [field]: e.target.value,
                            },
                          })
                        }
                        className="h-4 w-4"
                        style={{ accentColor: "#145F33" }}
                      />
                      <span
                        className="slds-text-4"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

                                        {/* Participant Ratings */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Participant Ratings</Label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // Filter participants: Attended = YES, exclude SRRO:STAF and SRRO:AFTCARECM
                                                        const eligibleParticipants = connectionParticipants.filter(p =>
                                                            p.attended === true &&
                                                            p.role !== "SRRO:STAF" &&
                                                            p.role !== "SRRO:AFTCARECM"
                                                        );
                                                        const refreshed = eligibleParticipants.map(p => {
                                                            const existing = participantRatings.find(r => r.participantId === p.id);
                                                            return existing || {
                                                                participantId: p.id,
                                                                participantName: p.participant,
                                                                participantRole: p.role,
                                                                participantLocation: "In-Person",
                                                                relationshipRating: "",
                                                                goalsTopicsRating: "",
                                                                approachMethodRating: "",
                                                                overallRating: "",
                                                                therapistEngagementRating: "",
                                                            };
                                                        });
                                                        setParticipantRatings(refreshed);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 slds-text-3 font-medium rounded border transition-colors"
                                                    style={{ backgroundColor: 'var(--slds-g-color-background-base)', borderColor: 'var(--slds-g-color-border-base-1)', color: '#145F33' }}
                                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)')}
                                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)')}
                                                >
                                                    <Users className="h-3.5 w-3.5" />
                                                    Refresh Ratings
                                                </button>
                                            </div>
                                            {participantRatings.length > 0 ? (
                                                <div className="rounded-lg overflow-x-auto" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                                                        <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                                                            <tr>
                                                                {["Name", "Role", "Location", "Relationship", "Goals/Topics", "Approach/Method", "Overall", "Engagement", ""].map((h) => (
                                                                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {participantRatings.map((r, idx) => (
                                                                <tr key={r.participantId} style={{ borderBottom: idx < participantRatings.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                    <td className="px-4 py-3 slds-text-4 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.participantName}</td>
                                                                    <td className="px-4 py-3 slds-text-4 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.participantRole}</td>
                                                                    <td className="px-4 py-3 slds-text-4 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.participantLocation}</td>
                                                                    {[r.relationshipRating, r.goalsTopicsRating, r.approachMethodRating, r.overallRating, r.therapistEngagementRating].map((val, i) => (
                                                                        <td key={i} className="px-4 py-3 slds-text-4 text-center whitespace-nowrap" style={{ color: val ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>{val || "—"}</td>
                                                                    ))}
                                                                    <td className="px-4 py-3 text-right">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => { setEditingParticipantRating(r); setIsParticipantRatingModalOpen(true); }}
                                                                            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full slds-text-3 font-medium transition-colors"
                                                                            style={{ color: '#0176d3', border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                                                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)')}
                                                                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)')}
                                                                        >
                                                                            <Pencil className="h-3 w-3" />
                                                                            Modify
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center rounded-lg py-8 text-center" style={{ border: '2px dashed var(--slds-g-color-border-base-1)' }}>
                                                    <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No participant ratings yet.</p>
                                                    <p className="slds-text-3 mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>Click "Refresh Ratings" to populate from attended participants (excludes staff roles).</p>
                                                </div>
                                            )}
                                            <p className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Ratings are populated from participants marked as Attended = Yes, excluding SRRO:STAF and SRRO:AFTCARECM roles. Click Modify to enter ratings (1-10 scale).
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Community Care File Request Details */}
                                {connectionFormData.type === "Community Care File Request" && (
                                    <div className="space-y-6">

                                        {/* Reason for Request */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                    Reason for Request <span className="text-red-600">*</span>
                                                </Label>
                                                <Button
                                                    type="button"
                                                    onClick={() => setIsReasonModalOpen(true)}
                                                    className="rounded-full h-8 px-3 slds-text-3 font-medium"
                                                    style={{ backgroundColor: '#145F33', color: 'white' }}
                                                >
                                                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                                                    Add
                                                </Button>
                                            </div>
                                            {fileRequestReasons.length > 0 ? (
                                                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                                                        <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                                                            <tr>
                                                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>Reason</th>
                                                                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)', width: '100px' }}>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {fileRequestReasons.map((reason, idx) => (
                                                                <tr key={idx} style={{ borderBottom: idx < fileRequestReasons.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                    <td className="px-4 py-3 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{reason}</td>
                                                                    <td className="px-4 py-3 text-right">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setFileRequestReasons(fileRequestReasons.filter((_, i) => i !== idx));
                                                                            }}
                                                                            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full slds-text-3 font-medium transition-colors"
                                                                            style={{ color: '#c23934', border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                                                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)')}
                                                                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)')}
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                            Remove
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center rounded-lg py-8 text-center" style={{ border: '2px dashed var(--slds-g-color-border-base-1)' }}>
                                                    <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No reasons added yet.</p>
                                                    <p className="slds-text-3 mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>Click "Add" to select reasons or enter a custom reason.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Documents Given */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Documents Given</Label>
                                                <Button
                                                    type="button"
                                                    onClick={() => setIsDocumentModalOpen(true)}
                                                    className="rounded-full h-8 px-3 slds-text-3 font-medium"
                                                    style={{ backgroundColor: '#145F33', color: 'white' }}
                                                >
                                                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                                                    Add
                                                </Button>
                                            </div>
                                            {fileRequestDocuments.length > 0 ? (
                                                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                                                        <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                                                            <tr>
                                                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>Document</th>
                                                                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)', width: '100px' }}>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {fileRequestDocuments.map((doc, idx) => (
                                                                <tr key={idx} style={{ borderBottom: idx < fileRequestDocuments.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                    <td className="px-4 py-3 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{doc}</td>
                                                                    <td className="px-4 py-3 text-right">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setFileRequestDocuments(fileRequestDocuments.filter((_, i) => i !== idx));
                                                                            }}
                                                                            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full slds-text-3 font-medium transition-colors"
                                                                            style={{ color: '#c23934', border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                                                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)')}
                                                                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)')}
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                            Remove
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center rounded-lg py-8 text-center" style={{ border: '2px dashed var(--slds-g-color-border-base-1)' }}>
                                                    <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No documents added yet.</p>
                                                    <p className="slds-text-3 mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>Click "Add" to select documents or enter a custom document.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Contact Summary */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Contact Summary <span className="text-red-600">*</span>
                                            </Label>
                                            <RichTextEditor
                                              value={fileRequestContactSummary}
                                              onChange={setFileRequestContactSummary}
                                              placeholder="Enter summary of interaction and request outcome…"
                                              minHeight="150px"
                                            />
                                        </div>

                                        {/* Follow-Up Steps */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Follow-Up Steps (If Any)</Label>
                                            <RichTextEditor
                                              value={fileRequestFollowUp}
                                              onChange={setFileRequestFollowUp}
                                              placeholder="Enter next steps, escalations, or additional actions…"
                                              minHeight="120px"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Community Care Group Therapy Session Details */}
                                {connectionFormData.type === "Community Care Group Therapy Session" && (
                                    <div className="space-y-6">

                                        {/* Meeting Summary — rich text */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Meeting Summary</Label>
                                            <RichTextEditor
                                              value={connectionFormData.description || ""}
                                              onChange={(val) => setConnectionFormData({ ...connectionFormData, description: val })}
                                              placeholder="Document session summary and key outcomes…"
                                              minHeight="150px"
                                            />
                                        </div>

                                        {/* Themes Addressed */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Themes Addressed</Label>
                                            <Textarea
                                              value={connectionDetails.themesAddressed || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, themesAddressed: e.target.value })}
                                              placeholder="Enter themes addressed during the session…"
                                              className="slds-text-4 min-h-[100px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                            />
                                        </div>

                                        {/* Spiritual Development Meeting */}
                                        <div className="flex items-center gap-2.5">
                                            <Checkbox
                                              id="ccgts-spiritual"
                                              checked={!!(connectionDetails as any).spiritualDevelopmentMeeting}
                                              onCheckedChange={(checked) =>
                                                setConnectionDetails({ ...connectionDetails, spiritualDevelopmentMeeting: !!checked } as any)
                                              }
                                            />
                                            <Label
                                              htmlFor="ccgts-spiritual"
                                              className="slds-text-4 cursor-pointer font-normal"
                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                              Spiritual Development Meeting
                                            </Label>
                                        </div>

                                        {/* Individual Participant Notes */}
                                        <div className="space-y-3">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Individual Participant Notes</Label>
                                            {(() => {
                                                const attended = connectionParticipants.filter(p => p.attended === true);
                                                return attended.length > 0 ? (
                                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                                                            <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                                                                <tr>
                                                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)', width: '28%' }}>Participant</th>
                                                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>Notes</th>
                                                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)', width: '90px' }}>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {attended.map((p, idx) => {
                                                                    const note = (connectionDetails as any)[`participant_note_${p.id}`] || "";
                                                                    return (
                                                                        <tr key={p.id} style={{ borderBottom: idx < attended.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                            <td className="px-4 py-3">
                                                                                <div className="slds-text-4 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{p.participant}</div>
                                                                                <div className="slds-text-3 mt-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>{p.role}</div>
                                                                            </td>
                                                                            <td className="px-4 py-3">
                                                                                {note
                                                                                    ? <span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties} title={note}>{note}</span>
                                                                                    : <span className="slds-text-4 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>No notes added</span>
                                                                                }
                                                                            </td>
                                                                            <td className="px-4 py-3 text-right">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setParticipantNotesModalRecord({
                                                                                            participantId: p.id,
                                                                                            participantName: p.participant,
                                                                                            participantRole: p.role,
                                                                                            notes: note,
                                                                                            duration: (connectionDetails as any)[`participant_duration_${p.id}`] || "",
                                                                                            interactionTypes: (connectionDetails as any)[`participant_interactions_${p.id}`] || [],
                                                                                        });
                                                                                        setParticipantNotesModalOpen(true);
                                                                                    }}
                                                                                    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full slds-text-3 font-medium transition-colors"
                                                                                    style={{ color: '#0176d3', border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                                                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)')}
                                                                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)')}
                                                                                >
                                                                                    <Pencil className="h-3 w-3" />
                                                                                    Modify
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center rounded-lg py-8 text-center" style={{ border: '2px dashed var(--slds-g-color-border-base-1)' }}>
                                                        <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No attended participants yet.</p>
                                                        <p className="slds-text-3 mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>Participant notes appear here once participants are marked as Attended.</p>
                                                    </div>
                                                );
                                            })()}
                                            <p className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Click Modify to add duration, interaction type, and notes per participant.
                                            </p>
                                        </div>

                                        {/* Participant Ratings */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Participant Ratings</Label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const youthAttended = connectionParticipants.filter(p => p.attended === true && p.role === "Youth");
                                                        const refreshed = youthAttended.map(p => {
                                                            const existing = participantRatings.find(r => r.participantId === p.id);
                                                            return existing || {
                                                                participantId: p.id,
                                                                participantName: p.participant,
                                                                participantRole: p.role,
                                                                participantLocation: "In-Person",
                                                                relationshipRating: "",
                                                                goalsTopicsRating: "",
                                                                approachMethodRating: "",
                                                                overallRating: "",
                                                                therapistEngagementRating: "",
                                                            };
                                                        });
                                                        setParticipantRatings(refreshed);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 slds-text-3 font-medium rounded border transition-colors"
                                                    style={{ backgroundColor: 'var(--slds-g-color-background-base)', borderColor: 'var(--slds-g-color-border-base-1)', color: '#145F33' }}
                                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)')}
                                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)')}
                                                >
                                                    <Users className="h-3.5 w-3.5" />
                                                    Refresh Ratings
                                                </button>
                                            </div>
                                            {participantRatings.length > 0 ? (
                                                <div className="rounded-lg overflow-x-auto" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                                                        <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                                                            <tr>
                                                                {["Name", "Role", "Location", "Relationship", "Goals/Topic", "Approach/Method", "Overall", "Engagement", ""].map((h) => (
                                                                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {participantRatings.map((r, idx) => (
                                                                <tr key={r.participantId} style={{ borderBottom: idx < participantRatings.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                    <td className="px-4 py-3 slds-text-4 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.participantName}</td>
                                                                    <td className="px-4 py-3 slds-text-4 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.participantRole}</td>
                                                                    <td className="px-4 py-3 slds-text-4 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.participantLocation}</td>
                                                                    {[r.relationshipRating, r.goalsTopicsRating, r.approachMethodRating, r.overallRating, r.therapistEngagementRating].map((val, i) => (
                                                                        <td key={i} className="px-4 py-3 slds-text-4 text-center whitespace-nowrap" style={{ color: val ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>{val || "—"}</td>
                                                                    ))}
                                                                    <td className="px-4 py-3 text-right">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => { setEditingParticipantRating(r); setIsParticipantRatingModalOpen(true); }}
                                                                            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full slds-text-3 font-medium transition-colors"
                                                                            style={{ color: '#0176d3', border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                                                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)')}
                                                                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)')}
                                                                        >
                                                                            <Pencil className="h-3 w-3" />
                                                                            Modify
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center rounded-lg py-8 text-center" style={{ border: '2px dashed var(--slds-g-color-border-base-1)' }}>
                                                    <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No participant ratings yet.</p>
                                                    <p className="slds-text-3 mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>Click "Refresh Ratings" to populate from attended youth participants.</p>
                                                </div>
                                            )}
                                            <p className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Ratings are populated from youth participants marked as Attended. Click Modify to enter scores.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Community Care Individual Therapy Session Details */}
                                {connectionFormData.type === "Community Care Individual Therapy Session" && (
                                    <div className="space-y-6">

                                        {/* Clinical Observation Fields */}
                                        <div className="space-y-4">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Clinical Observations</Label>

                                            {/* Mood */}
                                            <div className="space-y-1.5">
                                                <Label htmlFor="ccits-mood" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Mood</Label>
                                                <Select
                                                    value={connectionFormData.mood || ""}
                                                    onValueChange={(val) => setConnectionFormData({ ...connectionFormData, mood: val })}
                                                >
                                                    <SelectTrigger id="ccits-mood" className="h-9 slds-text-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)',backgroundColor: 'var(--slds-g-color-background-base)' }}>
                                                        <SelectValue placeholder="Please Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {moodOptions.map((opt) => (
                                                            <SelectItem key={opt} value={opt} className="slds-text-4">{opt}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Affect */}
                                            <div className="space-y-1.5">
                                                <Label htmlFor="ccits-affect" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Affect</Label>
                                                <Select
                                                    value={connectionFormData.affect || ""}
                                                    onValueChange={(val) => setConnectionFormData({ ...connectionFormData, affect: val })}
                                                >
                                                    <SelectTrigger id="ccits-affect" className="h-9 slds-text-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)',backgroundColor: 'var(--slds-g-color-background-base)' }}>
                                                        <SelectValue placeholder="Please Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {affectOptions.map((opt) => (
                                                            <SelectItem key={opt} value={opt} className="slds-text-4">{opt}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Behavior */}
                                            <div className="space-y-1.5">
                                                <Label htmlFor="ccits-behavior" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Behavior</Label>
                                                <Select
                                                    value={connectionFormData.behavior || ""}
                                                    onValueChange={(val) => setConnectionFormData({ ...connectionFormData, behavior: val })}
                                                >
                                                    <SelectTrigger id="ccits-behavior" className="h-9 slds-text-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)',backgroundColor: 'var(--slds-g-color-background-base)' }}>
                                                        <SelectValue placeholder="Please Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {behaviorOptions.map((opt) => (
                                                            <SelectItem key={opt} value={opt} className="slds-text-4">{opt}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Assessment */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Assessment</Label>
                                            <Textarea
                                              value={(connectionDetails as any).assessment || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, assessment: e.target.value } as any)}
                                              placeholder="Enter clinical assessment…"
                                              className="slds-text-4 min-h-[120px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)',backgroundColor: 'var(--slds-g-color-background-base)' }}
                                            />
                                        </div>

                                        {/* Data/Description */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Data/Description</Label>
                                            <Textarea
                                              value={connectionFormData.description || ""}
                                              onChange={(e) => setConnectionFormData({ ...connectionFormData, description: e.target.value })}
                                              placeholder="Enter session data and description…"
                                              className="slds-text-4 min-h-[120px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                            />
                                        </div>

                                        {/* Plan */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Plan</Label>
                                            <Textarea
                                              value={connectionFormData.plan || ""}
                                              onChange={(e) => setConnectionFormData({ ...connectionFormData, plan: e.target.value })}
                                              placeholder="Enter treatment plan and next steps…"
                                              className="slds-text-4 min-h-[120px] resize-y"
                                              style={{ borderColor: 'var(--slds-g-color-border-base-1)',backgroundColor: 'var(--slds-g-color-background-base)' }}
                                            />
                                        </div>
                                      {/* Skill Assessment */}
          <div className="space-y-4">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Skill Assessment
            </Label>

            {[
              {
                label:
                  "Youth can identify and express emotions.",
                name: "skill-identify-express-emotions",
                field: "identifyExpressEmotions",
              },
              {
                label:
                  "Youth can regulate strong emotions in the moment.",
                name: "skill-regulate-emotions",
                field: "regulateStrongEmotions",
              },
              {
                label:
                  "Youth demonstrates healthy boundaries with others.",
                name: "skill-healthy-boundaries",
                field: "healthyBoundaries",
              },
              {
                label:
                  "Youth can effectively reflect on challenging situations.",
                name: "skill-reflect-situations",
                field: "reflectChallengingSituations",
              },
              {
                label: "Youth demonstrates self-acceptance.",
                name: "skill-self-acceptance",
                field: "selfAcceptance",
              },
              {
                label: "Youth is hopeful about their future.",
                name: "skill-hopeful-future",
                field: "hopefulAboutFuture",
              },
            ].map(({ label, name, field }) => (
              <div key={field} className="space-y-2">
                <Label
                  className="slds-text-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {label}
                </Label>
                <div className="flex flex-wrap gap-4">
                  {skillOptions.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={name}
                        value={opt}
                        checked={
                          connectionFormData.skillAssessment?.[
                            field
                          ] === opt
                        }
                        onChange={(e) =>
                          setConnectionFormData({
                            ...connectionFormData,
                            skillAssessment: {
                              ...connectionFormData.skillAssessment,
                              [field]: e.target.value,
                            },
                          })
                        }
                        className="h-4 w-4"
                        style={{ accentColor: "#145F33" }}
                      />
                      <span
                        className="slds-text-4"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

                                        {/* Participant Ratings */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Participant Ratings</Label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // Filter participants: Attended = YES, exclude SRRO:STAF and SRRO:AFTCARECM
                                                        const eligibleParticipants = connectionParticipants.filter(p =>
                                                            p.attended === true &&
                                                            p.role !== "SRRO:STAF" &&
                                                            p.role !== "SRRO:AFTCARECM"
                                                        );
                                                        const refreshed = eligibleParticipants.map(p => {
                                                            const existing = participantRatings.find(r => r.participantId === p.id);
                                                            return existing || {
                                                                participantId: p.id,
                                                                participantName: p.participant,
                                                                participantRole: p.role,
                                                                participantLocation: "In-Person",
                                                                relationshipRating: "",
                                                                goalsTopicsRating: "",
                                                                approachMethodRating: "",
                                                                overallRating: "",
                                                                therapistEngagementRating: "",
                                                            };
                                                        });
                                                        setParticipantRatings(refreshed);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 slds-text-3 font-medium rounded border transition-colors"
                                                    style={{ backgroundColor: 'var(--slds-g-color-background-base)', borderColor: 'var(--slds-g-color-border-base-1)', color: '#145F33' }}
                                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)')}
                                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)')}
                                                >
                                                    <Users className="h-3.5 w-3.5" />
                                                    Refresh Ratings
                                                </button>
                                            </div>
                                            {participantRatings.length > 0 ? (
                                                <div className="rounded-lg overflow-x-auto" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                                                        <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                                                            <tr>
                                                                {["Name", "Role", "Location", "Relationship", "Goals/Topics", "Approach/Method", "Overall", "Engagement", ""].map((h) => (
                                                                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {participantRatings.map((r, idx) => (
                                                                <tr key={r.participantId} style={{ borderBottom: idx < participantRatings.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                    <td className="px-4 py-3 slds-text-4 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.participantName}</td>
                                                                    <td className="px-4 py-3 slds-text-4 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.participantRole}</td>
                                                                    <td className="px-4 py-3 slds-text-4 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.participantLocation}</td>
                                                                    {[r.relationshipRating, r.goalsTopicsRating, r.approachMethodRating, r.overallRating, r.therapistEngagementRating].map((val, i) => (
                                                                        <td key={i} className="px-4 py-3 slds-text-4 text-center whitespace-nowrap" style={{ color: val ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>{val || "—"}</td>
                                                                    ))}
                                                                    <td className="px-4 py-3 text-right">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => { setEditingParticipantRating(r); setIsParticipantRatingModalOpen(true); }}
                                                                            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full slds-text-3 font-medium transition-colors"
                                                                            style={{ color: '#0176d3', border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                                                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)')}
                                                                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)')}
                                                                        >
                                                                            <Pencil className="h-3 w-3" />
                                                                            Modify
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center rounded-lg py-8 text-center" style={{ border: '2px dashed var(--slds-g-color-border-base-1)' }}>
                                                    <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No participant ratings yet.</p>
                                                    <p className="slds-text-3 mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>Click "Refresh Ratings" to populate from attended participants (excludes staff roles).</p>
                                                </div>
                                            )}
                                            <p className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Ratings are populated from participants marked as Attended = Yes, excluding SRRO:STAF and SRRO:AFTCARECM roles. Click Modify to enter ratings.
                                            </p>
                                        </div>
                                    </div>
                                )}

        </>
    );
}