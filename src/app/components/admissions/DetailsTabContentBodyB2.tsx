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


export function DetailsTabContentBodyB2(props: DetailsTabContentProps) {
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
                                {/* Milieu Meeting Details */}
                                {connectionFormData.type === "Milieu meeting" && (
                                    <div className="space-y-6">
                                        {/* Themes Addressed */}
                                        <div className="grid gap-2">
                                            <Label className="text-[13px] text-[#3e3e3c] font-medium">Themes Addressed</Label>
                                            <Textarea
                                              value={connectionDetails.themesAddressed || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, themesAddressed: e.target.value })}
                                              placeholder="Enter themes addressed during the meeting…"
                                              className="min-h-[120px] text-[13px] border-[#dddbda] resize-none"
                                              style={{ fontFamily: 'inherit' }}
                                            />
                                            <p className="text-[11px] text-[#706e6b] mt-1">
                                                Optional: Capture key discussion topics and group dynamics.
                                            </p>
                                        </div>

                                        {/* Meeting Summary */}
                                        <div className="grid gap-2">
                                            <Label className="text-[13px] text-[#3e3e3c] font-medium">Meeting Summary</Label>
                                            <Textarea
                                              value={connectionDetails.summary || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, summary: e.target.value })}
                                              placeholder="Enter meeting summary and notes…"
                                              className="min-h-[180px] text-[13px] border-[#dddbda] resize-none"
                                              style={{ fontFamily: 'inherit' }}
                                            />
                                            <p className="text-[11px] text-[#706e6b] mt-1">
                                                Optional: Capture overall meeting context, outcomes, and observations.
                                            </p>
                                        </div>

                                        {/* Individual Participant Notes */}
                                        <div className="space-y-3">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Individual Participant Notes</Label>

                                            {(() => {
                                                const attendedParticipants = connectionParticipants.filter(p => p.attended === true);
                                                const INTERACTION_TYPES = ["Lunch", "Food Donation", "Computer Access", "Rush Medical Visit"];

                                                const openModifyModal = (participant: typeof attendedParticipants[0]) => {
                                                    const noteKey = `participant_note_${participant.id}`;
                                                    const durationKey = `participant_duration_${participant.id}`;
                                                    const interactionKey = `participant_interactions_${participant.id}`;
                                                    setParticipantNotesModalRecord({
                                                        participantId: participant.id,
                                                        participantName: participant.participant,
                                                        participantRole: participant.role,
                                                        notes: (connectionDetails as any)[noteKey] || "",
                                                        duration: (connectionDetails as any)[durationKey] || "",
                                                        interactionTypes: (connectionDetails as any)[interactionKey] || [],
                                                    });
                                                    setParticipantNotesModalOpen(true);
                                                };

                                                return attendedParticipants.length > 0 ? (
                                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                                                            <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                                                                <tr>
                                                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)', width: '25%' }}>
                                                                        Participant
                                                                    </th>
                                                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                        Notes
                                                                    </th>
                                                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)', width: '90px' }}>
                                                                        Actions
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {attendedParticipants.map((participant, idx) => {
                                                                    const noteKey = `participant_note_${participant.id}`;
                                                                    const currentNote = (connectionDetails as any)[noteKey] || "";

                                                                    return (
                                                                        <tr
                                                                            key={participant.id}
                                                                            style={{ borderBottom: idx < attendedParticipants.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                                        >
                                                                            <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                                <div className="slds-text-4 font-medium">{participant.participant}</div>
                                                                                <div className="slds-text-3 mt-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>{participant.role}</div>
                                                                            </td>
                                                                            <td className="px-4 py-3">
                                                                                {currentNote ? (
                                                                                    <span
                                                                                        className="slds-text-4 block"
                                                                                        style={{
                                                                                            color: 'var(--slds-g-color-text-default)',
                                                                                            overflow: 'hidden',
                                                                                            display: '-webkit-box',
                                                                                            WebkitLineClamp: 2,
                                                                                            WebkitBoxOrient: 'vertical',
                                                                                        } as React.CSSProperties}
                                                                                        title={currentNote}
                                                                                    >
                                                                                        {currentNote}
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="slds-text-4 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                                        No notes added
                                                                                    </span>
                                                                                )}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-right">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openModifyModal(participant)}
                                                                                    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full slds-text-3 font-medium transition-colors"
                                                                                    style={{ color: '#0176d3', border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                                                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)')}
                                                                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)')}
                                                                                    title="Modify participant notes"
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
                                                    <div
                                                        className="flex flex-col items-center justify-center rounded-lg py-8 text-center"
                                                        style={{ border: '2px dashed var(--slds-g-color-border-base-1)' }}
                                                    >
                                                        <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            No attended participants yet.
                                                        </p>
                                                        <p className="slds-text-3 mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            Participant notes appear here once participants are marked as Attended in the Participants section.
                                                        </p>
                                                    </div>
                                                );
                                            })()}

                                            <p className="slds-text-3 mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Participant notes are auto-populated from participants marked as Attended = Yes. Click Modify to add duration, interaction type, and notes.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Advocate Meeting Details */}
                                {connectionFormData.type === "Advocate Meeting" && (
                                    <div className="space-y-6">
                                        {/* Assessment Questions - 3 Likert Scale Questions */}
                                        <div className="space-y-4">
                                            <Label className="text-[13px] text-[#3e3e3c] font-medium">Assessment Questions</Label>
                                            
                                            {/* Question 1 */}
                                            <div className="border rounded-lg p-4 space-y-3" style={{ borderColor: '#dddbda' }}>
                                                <Label className="text-[13px] text-[#3e3e3c]">
                                                    The youth actively participated and engaged in the session
                                                </Label>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {[
                                                        { value: 1, label: "Strongly Disagree" },
                                                        { value: 2, label: "Disagree" },
                                                        { value: 3, label: "Neutral" },
                                                        { value: 4, label: "Agree" },
                                                        { value: 5, label: "Strongly Agree" }
                                                    ].map((option) => (
                                                        <button
                                                          key={option.value}
                                                          type="button"
                                                          onClick={() => setConnectionDetails({ ...connectionDetails, advocateQuestion1: option.value })}
                                                          className="px-2 py-2 rounded-md text-xs transition-all text-center"
                                                          style={{
                                                            border: `2px solid ${(connectionDetails.advocateQuestion1 || 3) === option.value ? '#145F33' : '#dddbda'}`,
                                                            backgroundColor: (connectionDetails.advocateQuestion1 || 3) === option.value ? 'rgba(20, 95, 51, 0.1)' : 'white',
                                                            color: (connectionDetails.advocateQuestion1 || 3) === option.value ? '#145F33' : '#3e3e3c',
                                                            fontWeight: (connectionDetails.advocateQuestion1 || 3) === option.value ? '600' : '400'
                                                          }}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Question 2 */}
                                            <div className="border rounded-lg p-4 space-y-3" style={{ borderColor: '#dddbda' }}>
                                                <Label className="text-[13px] text-[#3e3e3c]">
                                                    The youth demonstrated understanding of discussed goals and action steps
                                                </Label>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {[
                                                        { value: 1, label: "Strongly Disagree" },
                                                        { value: 2, label: "Disagree" },
                                                        { value: 3, label: "Neutral" },
                                                        { value: 4, label: "Agree" },
                                                        { value: 5, label: "Strongly Agree" }
                                                    ].map((option) => (
                                                        <button
                                                          key={option.value}
                                                          type="button"
                                                          onClick={() => setConnectionDetails({ ...connectionDetails, advocateQuestion2: option.value })}
                                                          className="px-2 py-2 rounded-md text-xs transition-all text-center"
                                                          style={{
                                                            border: `2px solid ${(connectionDetails.advocateQuestion2 || 3) === option.value ? '#145F33' : '#dddbda'}`,
                                                            backgroundColor: (connectionDetails.advocateQuestion2 || 3) === option.value ? 'rgba(20, 95, 51, 0.1)' : 'white',
                                                            color: (connectionDetails.advocateQuestion2 || 3) === option.value ? '#145F33' : '#3e3e3c',
                                                            fontWeight: (connectionDetails.advocateQuestion2 || 3) === option.value ? '600' : '400'
                                                          }}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Question 3 */}
                                            <div className="border rounded-lg p-4 space-y-3" style={{ borderColor: '#dddbda' }}>
                                                <Label className="text-[13px] text-[#3e3e3c]">
                                                    The youth expressed feelings and concerns openly during the meeting
                                                </Label>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {[
                                                        { value: 1, label: "Strongly Disagree" },
                                                        { value: 2, label: "Disagree" },
                                                        { value: 3, label: "Neutral" },
                                                        { value: 4, label: "Agree" },
                                                        { value: 5, label: "Strongly Agree" }
                                                    ].map((option) => (
                                                        <button
                                                          key={option.value}
                                                          type="button"
                                                          onClick={() => setConnectionDetails({ ...connectionDetails, advocateQuestion3: option.value })}
                                                          className="px-2 py-2 rounded-md text-xs transition-all text-center"
                                                          style={{
                                                            border: `2px solid ${(connectionDetails.advocateQuestion3 || 3) === option.value ? '#145F33' : '#dddbda'}`,
                                                            backgroundColor: (connectionDetails.advocateQuestion3 || 3) === option.value ? 'rgba(20, 95, 51, 0.1)' : 'white',
                                                            color: (connectionDetails.advocateQuestion3 || 3) === option.value ? '#145F33' : '#3e3e3c',
                                                            fontWeight: (connectionDetails.advocateQuestion3 || 3) === option.value ? '600' : '400'
                                                          }}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Meeting Summary */}
                                        <div className="grid gap-2">
                                            <Label className="text-[13px] text-[#3e3e3c] font-medium">Meeting Summary</Label>
                                            <Textarea
                                              value={connectionDetails.summary || ""}
                                              onChange={(e) => setConnectionDetails({ ...connectionDetails, summary: e.target.value })}
                                              placeholder="Enter meeting summary and notes..."
                                              className="min-h-[180px] text-[13px] border-[#dddbda] resize-none"
                                              style={{ fontFamily: 'inherit' }}
                                            />
                                            <p className="text-[11px] text-[#706e6b] mt-1">
                                                Optional: Provide a comprehensive summary of the advocate meeting including outcomes and relevant notes.
                                            </p>
                                        </div>

                                        {/* Skill Assessment Questions — Advocate Meeting */}
                                        <div className="space-y-4">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Skill Assessment</Label>

                                            {[
                                                { key: "advocateSkillBounceBack",       label: "Youth can effectively bounce back from challenges/mistakes." },
                                                { key: "advocateSkillKindRespectful",   label: "Youth is kind and respectful to others." },
                                                { key: "advocateSkillFriendships",      label: "Youth can make and maintain healthy friendships." },
                                                { key: "advocateSkillDecisionsStress",  label: "Youth can make healthy decisions even while under stress." },
                                                { key: "advocateSkillDailyLiving",      label: "Youth demonstrates age-appropriate daily living skills." },
                                            ].map(({ key, label }, qIdx) => (
                                                <div key={key} className="space-y-2">
                                                    <Label className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{label}</Label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {["Needs to Learn", "Needs Support", "Usually Demonstrates Skill", "Independent Skill", "N/A"].map((opt) => (
                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name={`advocate-skill-${qIdx}`}
                                                                    value={opt}
                                                                    checked={(connectionFormData.skillAssessment as any)?.[key] === opt}
                                                                    onChange={() => setConnectionFormData({
                                                                        ...connectionFormData,
                                                                        skillAssessment: {
                                                                            ...(connectionFormData.skillAssessment as any),
                                                                            [key]: opt,
                                                                        }
                                                                    })}
                                                                    className="h-4 w-4"
                                                                    style={{ accentColor: '#145F33' }}
                                                                />
                                                                <span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── Internal ECR Meeting Details ── */}
                                {connectionFormData.type === "Internal ECR Meeting" && (
                                    <div className="space-y-6">

                                        {/* 1. Purpose Grid */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>PURPOSE</Label>
                                                <button
                                                    onClick={() => {
                                                        setEcrPurposeDraft([...ecrPurposes]);
                                                        setEcrPurposeSearch("");
                                                        setEcrPurposeOther("");
                                                        setEcrPurposeDialogOpen(true);
                                                    }}
                                                    className="flex items-center gap-1.5 h-8 px-3 rounded-full slds-text-3 font-medium transition-colors"
                                                    style={{ backgroundColor: '#145F33', color: 'white' }}
                                                >
                                                    Add
                                                </button>
                                            </div>

                                            {/* Purpose table */}
                                            {ecrPurposes.length > 0 ? (
                                                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <table className="w-full slds-text-4">
                                                        <thead>
                                                            <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                <th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>PURPOSE</th>
                                                                <th className="px-4 py-2.5 text-right slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-weak)' }}>ACTIONS</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {ecrPurposes.map((p, idx) => (
                                                                <tr key={idx} style={{ borderBottom: idx < ecrPurposes.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                    <td className="px-4 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>{p}</td>
                                                                    <td className="px-4 py-2.5 text-right">
                                                                        <div className="flex items-center justify-end gap-1">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEcrPurposeDraft([p]);
                                                                                    setEcrPurposeSearch("");
                                                                                    setEcrPurposeOther(ECR_PREDEFINED_PURPOSES.includes(p) ? "" : p);
                                                                                    setEcrPurposeDialogOpen(true);
                                                                                }}
                                                                                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                                                                title="Modify"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" style={{ color: '#0176d3' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setEcrPurposes(prev => prev.filter((_, i) => i !== idx))}
                                                                                className="p-1.5 rounded hover:bg-red-50 transition-colors"
                                                                                title="Delete"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center rounded-lg py-8" style={{ border: '2px dashed var(--slds-g-color-border-base-1)' }}>
                                                    <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No purposes added yet. Click "Add" to select purposes.</p>
                                                </div>
                                            )}

                                            {/* Purpose Selection Dialog */}
                                            {ecrPurposeDialogOpen && (
                                                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                                                    <div className="rounded-lg w-full max-w-md mx-4 overflow-hidden" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                                                        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                            <h3 className="slds-text-5 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Select Purpose(s)</h3>
                                                            <button onClick={() => setEcrPurposeDialogOpen(false)} className="p-1 rounded hover:bg-gray-200" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </button>
                                                        </div>
                                                        <div className="px-5 py-4 space-y-3">
                                                            {/* Search */}
                                                            <input
                                                                type="text"
                                                                placeholder="Search purposes…"
                                                                value={ecrPurposeSearch}
                                                                onChange={e => setEcrPurposeSearch(e.target.value)}
                                                                className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }}
                                                            />
                                                            {/* Predefined list */}
                                                            <div className="space-y-1.5 max-h-52 overflow-y-auto">
                                                                {ECR_PREDEFINED_PURPOSES.filter(p => p.toLowerCase().includes(ecrPurposeSearch.toLowerCase())).map(p => (
                                                                    <label key={p} className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 transition-colors hover:bg-gray-50">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={ecrPurposeDraft.includes(p)}
                                                                            onChange={e => setEcrPurposeDraft(prev => e.target.checked ? [...prev, p] : prev.filter(x => x !== p))}
                                                                            className="h-4 w-4 rounded"
                                                                            style={{ accentColor: '#145F33' }}
                                                                        />
                                                                        <span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{p}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                            {/* Other */}
                                                            <div className="space-y-1.5">
                                                                <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>OTHER (free text)</Label>
                                                                <input
                                                                    type="text"
                                                                    value={ecrPurposeOther}
                                                                    onChange={e => setEcrPurposeOther(e.target.value)}
                                                                    placeholder="Enter custom purpose…"
                                                                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="px-5 py-3 flex justify-end gap-2" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                            <button onClick={() => setEcrPurposeDialogOpen(false)} className="h-9 px-4 rounded-full slds-text-4 font-medium" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>Cancel</button>
                                                            <button
                                                                onClick={() => {
                                                                    const selected = [...ecrPurposeDraft];
                                                                    if (ecrPurposeOther.trim() && !selected.includes(ecrPurposeOther.trim())) selected.push(ecrPurposeOther.trim());
                                                                    setEcrPurposes(selected);
                                                                    setEcrPurposeDialogOpen(false);
                                                                }}
                                                                className="h-9 px-4 rounded-full slds-text-4 font-medium text-white"
                                                                style={{ backgroundColor: '#145F33' }}
                                                            >Apply</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 2. Summary */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>SUMMARY</Label>
                                            <textarea
                                                value={ecrSummary}
                                                onChange={e => setEcrSummary(e.target.value)}
                                                placeholder="Enter summary…"
                                                rows={4}
                                                className="w-full px-3 py-2 rounded slds-text-4 focus:outline-none resize-y"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)', minHeight: '80px' }}
                                            />
                                        </div>

                                        {/* 3. Goals Addressed Grid */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>GOALS ADDRESSED</Label>
                                                <button
                                                    onClick={() => {
                                                        setEcrGoalEditId(null);
                                                        setEcrGoalDraft({ goal: "", comment: "" });
                                                        setEcrGoalDialogOpen(true);
                                                    }}
                                                    className="flex items-center gap-1.5 h-8 px-3 rounded-full slds-text-3 font-medium transition-colors"
                                                    style={{ backgroundColor: '#145F33', color: 'white' }}
                                                >
                                                    Add Goal
                                                </button>
                                            </div>

                                            {ecrGoals.length > 0 ? (
                                                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <table className="w-full slds-text-4">
                                                        <thead>
                                                            <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                <th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>GOAL</th>
                                                                <th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>COMMENT</th>
                                                                <th className="px-4 py-2.5 text-right slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-weak)' }}>ACTIONS</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {ecrGoals.map((g, idx) => (
                                                                <tr key={g.id} style={{ borderBottom: idx < ecrGoals.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                    <td className="px-4 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>{g.goal}</td>
                                                                    <td className="px-4 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>{g.comment || '—'}</td>
                                                                    <td className="px-4 py-2.5 text-right">
                                                                        <div className="flex items-center justify-end gap-1">
                                                                            <button
                                                                                onClick={() => { setEcrGoalEditId(g.id); setEcrGoalDraft({ goal: g.goal, comment: g.comment }); setEcrGoalDialogOpen(true); }}
                                                                                className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Modify"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" style={{ color: '#0176d3' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setEcrGoals(prev => prev.filter(x => x.id !== g.id))}
                                                                                className="p-1.5 rounded hover:bg-red-50 transition-colors" title="Delete"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center rounded-lg py-8" style={{ border: '2px dashed var(--slds-g-color-border-base-1)' }}>
                                                    <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No goals added yet. Click "Add Goal" to begin.</p>
                                                </div>
                                            )}

                                            {/* Add/Edit Goal Dialog */}
                                            {ecrGoalDialogOpen && (
                                                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                                                    <div className="rounded-lg w-full max-w-md mx-4 overflow-hidden" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                                                        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                            <h3 className="slds-text-5 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>{ecrGoalEditId !== null ? 'Edit Goal' : 'Add Goal'}</h3>
                                                            <button onClick={() => setEcrGoalDialogOpen(false)} className="p-1 rounded hover:bg-gray-200" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </button>
                                                        </div>
                                                        <div className="px-5 py-4 space-y-4">
                                                            <div className="space-y-1.5">
                                                                <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>GOAL <span className="text-red-600">*</span></Label>
                                                                <input
                                                                    type="text"
                                                                    value={ecrGoalDraft.goal}
                                                                    onChange={e => setEcrGoalDraft(prev => ({ ...prev, goal: e.target.value }))}
                                                                    placeholder="Enter or select goal…"
                                                                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }}
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>COMMENT</Label>
                                                                <textarea
                                                                    value={ecrGoalDraft.comment}
                                                                    onChange={e => setEcrGoalDraft(prev => ({ ...prev, comment: e.target.value }))}
                                                                    placeholder="Enter comment…"
                                                                    rows={3}
                                                                    className="w-full px-3 py-2 rounded slds-text-4 focus:outline-none resize-y"
                                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="px-5 py-3 flex justify-end gap-2" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                            <button onClick={() => setEcrGoalDialogOpen(false)} className="h-9 px-4 rounded-full slds-text-4 font-medium" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>Cancel</button>
                                                            <button
                                                                disabled={!ecrGoalDraft.goal.trim()}
                                                                onClick={() => {
                                                                    if (!ecrGoalDraft.goal.trim()) return;
                                                                    if (ecrGoalEditId !== null) {
                                                                        setEcrGoals(prev => prev.map(g => g.id === ecrGoalEditId ? { ...g, goal: ecrGoalDraft.goal, comment: ecrGoalDraft.comment } : g));
                                                                    } else {
                                                                        setEcrGoals(prev => [...prev, { id: Date.now(), goal: ecrGoalDraft.goal, comment: ecrGoalDraft.comment }]);
                                                                    }
                                                                    setEcrGoalDialogOpen(false);
                                                                }}
                                                                className="h-9 px-4 rounded-full slds-text-4 font-medium text-white disabled:opacity-50"
                                                                style={{ backgroundColor: '#145F33' }}
                                                            >Apply</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 4. Likert Scale Questions */}
                                        <div className="space-y-4">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>SKILL ASSESSMENT</Label>
                                            {[
                                                { key: "ecrSkillTimeManagement",     label: "Youth manages time effectively and plans ahead." },
                                                { key: "ecrSkillFlexibility",         label: "Youth can flexibly meet expectations of different settings." },
                                                { key: "ecrSkillOrganized",           label: "Youth is generally organized and prepared." },
                                                { key: "ecrSkillCommunication",       label: "Youth can effectively communicate with authority figures (teachers, supervisors, staff members, etc.)." },
                                                { key: "ecrSkillAcademic",            label: "Youth demonstrates age-appropriate academic skills." },
                                                { key: "ecrSkillCareer",              label: "Youth demonstrates age-appropriate career skills." },
                                            ].map(({ key, label }, qIdx) => (
                                                <div key={key} className="space-y-2">
                                                    <Label className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{qIdx + 1}. {label}</Label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {["Needs to Learn", "Needs Support", "Usually Demonstrates Skill", "Independent Skill", "N/A"].map(opt => (
                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name={`ecr-skill-${qIdx}`}
                                                                    value={opt}
                                                                    checked={ecrSkills[key] === opt}
                                                                    onChange={() => setEcrSkills(prev => ({ ...prev, [key]: opt }))}
                                                                    className="h-4 w-4"
                                                                    style={{ accentColor: '#145F33' }}
                                                                />
                                                                <span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                    </div>
                                )}

                                {/* ── Psychological Evaluation Details ── */}
                                {connectionFormData.type === "Psychological Evaluation" && (
                                    <div className="space-y-6">

                                        {/* 1. Request Date */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                REQUEST DATE <span className="text-red-600">*</span>
                                            </Label>
                                            <DateInput
                                                value={peRequestDate}
                                                onChange={setPeRequestDate}
                                                required
                                            />
                                        </div>

                                        {/* 2. Reason for Request Grid */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>REASON FOR REQUEST</Label>
                                                <button
                                                    onClick={() => {
                                                        setPeReasonEditId(null);
                                                        setPeReasonSelected("");
                                                        setPeReasonOther("");
                                                        setPeReasonDialogOpen(true);
                                                    }}
                                                    className="h-8 px-3 rounded-full slds-text-3 font-medium text-white"
                                                    style={{ backgroundColor: '#145F33' }}
                                                >Add</button>
                                            </div>

                                            {peReasons.length > 0 ? (
                                                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <table className="w-full slds-text-4">
                                                        <thead>
                                                            <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                <th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>REASON</th>
                                                                <th className="px-4 py-2.5 text-right slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-weak)' }}>ACTIONS</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {peReasons.map((r, idx) => (
                                                                <tr key={r.id} style={{ borderBottom: idx < peReasons.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                    <td className="px-4 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.reason}</td>
                                                                    <td className="px-4 py-2.5 text-right">
                                                                        <div className="flex items-center justify-end gap-1">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setPeReasonEditId(r.id);
                                                                                    const isPredefined = PE_PREDEFINED_REASONS.includes(r.reason);
                                                                                    setPeReasonSelected(isPredefined ? r.reason : "Other");
                                                                                    setPeReasonOther(isPredefined ? "" : r.reason);
                                                                                    setPeReasonDialogOpen(true);
                                                                                }}
                                                                                className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Modify"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" style={{ color: '#0176d3' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setPeReasons(prev => prev.filter(x => x.id !== r.id))}
                                                                                className="p-1.5 rounded hover:bg-red-50 transition-colors" title="Delete"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center rounded-lg py-8" style={{ border: '2px dashed var(--slds-g-color-border-base-1)' }}>
                                                    <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No reasons added. Click "Add" to begin.</p>
                                                </div>
                                            )}

                                            {/* Reason Add/Edit Dialog */}
                                            {peReasonDialogOpen && (
                                                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                                                    <div className="rounded-lg w-full max-w-md mx-4 overflow-hidden" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                                                        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                            <h3 className="slds-text-5 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>{peReasonEditId !== null ? 'Edit Reason' : 'Add Reason'}</h3>
                                                            <button onClick={() => setPeReasonDialogOpen(false)} className="p-1 rounded hover:bg-gray-200" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </button>
                                                        </div>
                                                        <div className="px-5 py-4 space-y-4">
                                                            <div className="space-y-1.5">
                                                                <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>SELECT REASON <span className="text-red-600">*</span></Label>
                                                                <div className="space-y-2 rounded-lg p-3" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)', maxHeight: '240px', overflowY: 'auto' }}>
                                                                    {[...PE_PREDEFINED_REASONS, "Other"].map(opt => (
                                                                        <label key={opt} className="flex items-center gap-2.5 cursor-pointer rounded px-2 py-1.5 hover:bg-white transition-colors">
                                                                            <input
                                                                                type="radio"
                                                                                name="pe-reason-radio"
                                                                                value={opt}
                                                                                checked={peReasonSelected === opt}
                                                                                onChange={() => {
                                                                                    setPeReasonSelected(opt);
                                                                                    if (opt !== "Other") setPeReasonOther("");
                                                                                }}
                                                                                className="h-4 w-4 flex-shrink-0"
                                                                                style={{ accentColor: '#145F33' }}
                                                                            />
                                                                            <span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{opt}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            {peReasonSelected === "Other" && (
                                                                <div className="space-y-1.5">
                                                                    <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>OTHER <span className="text-red-600">*</span></Label>
                                                                    <input
                                                                        type="text"
                                                                        value={peReasonOther}
                                                                        onChange={e => setPeReasonOther(e.target.value)}
                                                                        placeholder="Enter custom reason…"
                                                                        className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                                                                        style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="px-5 py-3 flex justify-end gap-2" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                            <button onClick={() => setPeReasonDialogOpen(false)} className="h-9 px-4 rounded-full slds-text-4 font-medium" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>Cancel</button>
                                                            <button
                                                                disabled={!peReasonSelected || (peReasonSelected === "Other" && !peReasonOther.trim())}
                                                                onClick={() => {
                                                                    const value = peReasonSelected === "Other" ? peReasonOther.trim() : peReasonSelected;
                                                                    if (!value) return;
                                                                    if (peReasonEditId !== null) {
                                                                        setPeReasons(prev => prev.map(x => x.id === peReasonEditId ? { ...x, reason: value } : x));
                                                                    } else {
                                                                        setPeReasons(prev => [...prev, { id: Date.now(), reason: value }]);
                                                                    }
                                                                    setPeReasonDialogOpen(false);
                                                                }}
                                                                className="h-9 px-4 rounded-full slds-text-4 font-medium text-white disabled:opacity-50"
                                                                style={{ backgroundColor: '#145F33' }}
                                                            >Apply</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 3. Request Status */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>REQUEST STATUS</Label>
                                            <Select value={peRequestStatus} onValueChange={setPeRequestStatus}>
                                                <SelectTrigger className="h-9 slds-text-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                    <SelectValue placeholder="Please Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Approved" className="slds-text-4">Approved</SelectItem>
                                                    <SelectItem value="Denied" className="slds-text-4">Denied</SelectItem>
                                                    <SelectItem value="Cancelled" className="slds-text-4">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* 4. Rationale */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>RATIONALE</Label>
                                            <Textarea
                                                value={peRationale}
                                                onChange={e => setPeRationale(e.target.value)}
                                                placeholder="Capture justification for request decision…"
                                                className="slds-text-4 min-h-[100px] resize-y"
                                                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                            />
                                        </div>

                                        {/* 5. Results */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>RESULTS</Label>
                                            <Textarea
                                                value={peResults}
                                                onChange={e => setPeResults(e.target.value)}
                                                placeholder="Capture evaluation outcome and summary…"
                                                className="slds-text-4 min-h-[100px] resize-y"
                                                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                            />
                                        </div>

                                        {/* 6. Recommendations */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>RECOMMENDATIONS</Label>
                                            <Textarea
                                                value={peRecommendations}
                                                onChange={e => setPeRecommendations(e.target.value)}
                                                placeholder="Capture clinical recommendations post evaluation…"
                                                className="slds-text-4 min-h-[100px] resize-y"
                                                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                            />
                                        </div>

                                    </div>
                                )}

                                {/* ── School Meeting Details ── */}
                                {connectionFormData.type === "School Meeting" && (() => {
                                    // Youth participant check for conditional grids
                                    const hasYouthParticipant = connectionParticipants.some(p => p.role === "Youth");

                                    const iconEdit = <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" style={{ color: '#0176d3' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
                                    const iconDelete = <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
                                    const iconClose = <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

                                    return (
                                        <div className="space-y-6">

                                            {/* 1. Purpose Grid */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>PURPOSE</Label>
                                                    <button
                                                        onClick={() => { setSmPurposeDraft([...smPurposes]); setSmPurposeSearch(""); setSmPurposeDialogOpen(true); }}
                                                        className="h-8 px-3 rounded-full slds-text-3 font-medium text-white"
                                                        style={{ backgroundColor: '#145F33' }}
                                                    >Add</button>
                                                </div>

                                                {smPurposes.length > 0 ? (
                                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                        <table className="w-full slds-text-4">
                                                            <thead>
                                                                <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>PURPOSE</th>
                                                                    <th className="px-4 py-2.5 text-right slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-weak)' }}>ACTIONS</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {smPurposes.map((p, idx) => (
                                                                    <tr key={idx} style={{ borderBottom: idx < smPurposes.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                        <td className="px-4 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>{p}</td>
                                                                        <td className="px-4 py-2.5 text-right">
                                                                            <div className="flex items-center justify-end gap-1">
                                                                                <button onClick={() => { setSmPurposeDraft([p]); setSmPurposeSearch(""); setSmPurposeDialogOpen(true); }} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Modify">{iconEdit}</button>
                                                                                <button onClick={() => setSmPurposes(prev => prev.filter((_, i) => i !== idx))} className="p-1.5 rounded hover:bg-red-50 transition-colors" title="Delete">{iconDelete}</button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center rounded-lg py-8" style={{ border: '2px dashed var(--slds-g-color-border-base-1)' }}>
                                                        <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No purposes added. Click "Add" to select.</p>
                                                    </div>
                                                )}

                                                {/* Purpose selection dialog */}
                                                {smPurposeDialogOpen && (
                                                    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                                                        <div className="rounded-lg w-full max-w-md mx-4 overflow-hidden" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                                                            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                                <h3 className="slds-text-5 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Select Purpose(s)</h3>
                                                                <button onClick={() => setSmPurposeDialogOpen(false)} className="p-1 rounded hover:bg-gray-200" style={{ color: 'var(--slds-g-color-text-weak)' }}>{iconClose}</button>
                                                            </div>
                                                            <div className="px-5 py-4 space-y-3">
                                                                <input type="text" placeholder="Search purposes…" value={smPurposeSearch} onChange={e => setSmPurposeSearch(e.target.value)}
                                                                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }} />
                                                                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                                                                    {SM_PREDEFINED_PURPOSES.filter(p => p.toLowerCase().includes(smPurposeSearch.toLowerCase())).map(p => (
                                                                        <label key={p} className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 hover:bg-gray-50">
                                                                            <input type="checkbox" checked={smPurposeDraft.includes(p)}
                                                                                onChange={e => setSmPurposeDraft(prev => e.target.checked ? [...prev, p] : prev.filter(x => x !== p))}
                                                                                className="h-4 w-4 rounded" style={{ accentColor: '#145F33' }} />
                                                                            <span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{p}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="px-5 py-3 flex justify-end gap-2" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                                <button onClick={() => setSmPurposeDialogOpen(false)} className="h-9 px-4 rounded-full slds-text-4 font-medium"
                                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>Cancel</button>
                                                                <button onClick={() => { setSmPurposes(smPurposeDraft); setSmPurposeDialogOpen(false); }}
                                                                    className="h-9 px-4 rounded-full slds-text-4 font-medium text-white" style={{ backgroundColor: '#145F33' }}>Apply</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 2. Summary */}
                                            <div className="space-y-1.5">
                                                <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>SUMMARY</Label>
                                                <textarea value={smSummary} onChange={e => setSmSummary(e.target.value)} placeholder="Enter summary…" rows={4}
                                                    className="w-full px-3 py-2 rounded slds-text-4 focus:outline-none resize-y"
                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)', minHeight: '80px' }} />
                                            </div>

                                            {/* 3. Related Incidents — enabled only when Youth participant exists */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>RELATED INCIDENTS</Label>
                                                        {!hasYouthParticipant && (
                                                            <p className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>Add a Youth participant to enable this section.</p>
                                                        )}
                                                    </div>
                                                    {hasYouthParticipant && (
                                                        <button onClick={() => { setSmIncidentEditId(null); setSmIncidentDraft(""); setSmIncidentDialogOpen(true); }}
                                                            className="h-8 px-3 rounded-full slds-text-3 font-medium text-white" style={{ backgroundColor: '#145F33' }}>Add Incident</button>
                                                    )}
                                                </div>
                                                {hasYouthParticipant ? (
                                                    smIncidents.length > 0 ? (
                                                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <table className="w-full slds-text-4">
                                                                <thead>
                                                                    <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                        <th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>INCIDENT</th>
                                                                        <th className="px-4 py-2.5 text-right slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-weak)' }}>ACTIONS</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {smIncidents.map((inc, idx) => (
                                                                        <tr key={inc.id} style={{ borderBottom: idx < smIncidents.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                            <td className="px-4 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>{inc.incident}</td>
                                                                            <td className="px-4 py-2.5 text-right">
                                                                                <div className="flex items-center justify-end gap-1">
                                                                                    <button onClick={() => { setSmIncidentEditId(inc.id); setSmIncidentDraft(inc.incident); setSmIncidentDialogOpen(true); }} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Modify">{iconEdit}</button>
                                                                                    <button onClick={() => setSmIncidents(prev => prev.filter(x => x.id !== inc.id))} className="p-1.5 rounded hover:bg-red-50 transition-colors" title="Delete">{iconDelete}</button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center rounded-lg py-8" style={{ border: '2px dashed var(--slds-g-color-border-base-1)' }}>
                                                            <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No incidents linked. Click "Add Incident" to begin.</p>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="flex items-center justify-center rounded-lg py-8" style={{ border: '2px dashed var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                        <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>Available once a Youth participant is added.</p>
                                                    </div>
                                                )}

                                                {/* Incident dialog */}
                                                {smIncidentDialogOpen && (
                                                    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                                                        <div className="rounded-lg w-full max-w-md mx-4 overflow-hidden" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                                                            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                                <h3 className="slds-text-5 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>{smIncidentEditId !== null ? 'Edit Incident' : 'Add Incident'}</h3>
                                                                <button onClick={() => setSmIncidentDialogOpen(false)} className="p-1 rounded hover:bg-gray-200" style={{ color: 'var(--slds-g-color-text-weak)' }}>{iconClose}</button>
                                                            </div>
                                                            <div className="px-5 py-4">
                                                                <div className="space-y-1.5">
                                                                    <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>INCIDENT <span className="text-red-600">*</span></Label>
                                                                    <input type="text" value={smIncidentDraft} onChange={e => setSmIncidentDraft(e.target.value)} placeholder="Enter incident…"
                                                                        className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                                                                        style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }} />
                                                                </div>
                                                            </div>
                                                            <div className="px-5 py-3 flex justify-end gap-2" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                                <button onClick={() => setSmIncidentDialogOpen(false)} className="h-9 px-4 rounded-full slds-text-4 font-medium"
                                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>Cancel</button>
                                                                <button disabled={!smIncidentDraft.trim()}
                                                                    onClick={() => {
                                                                        if (!smIncidentDraft.trim()) return;
                                                                        if (smIncidentEditId !== null) {
                                                                            setSmIncidents(prev => prev.map(x => x.id === smIncidentEditId ? { ...x, incident: smIncidentDraft } : x));
                                                                        } else {
                                                                            setSmIncidents(prev => [...prev, { id: Date.now(), incident: smIncidentDraft }]);
                                                                        }
                                                                        setSmIncidentDialogOpen(false);
                                                                    }}
                                                                    className="h-9 px-4 rounded-full slds-text-4 font-medium text-white disabled:opacity-50" style={{ backgroundColor: '#145F33' }}>Apply</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 4. Related Supplemental Plans — enabled only when Youth participant exists */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>RELATED SUPPLEMENTAL PLANS</Label>
                                                        {!hasYouthParticipant && (
                                                            <p className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>Add a Youth participant to enable this section.</p>
                                                        )}
                                                    </div>
                                                    {hasYouthParticipant && (
                                                        <button onClick={() => { setSmPlanEditId(null); setSmPlanDraft(""); setSmPlanDialogOpen(true); }}
                                                            className="h-8 px-3 rounded-full slds-text-3 font-medium text-white" style={{ backgroundColor: '#145F33' }}>Add Plan</button>
                                                    )}
                                                </div>
                                                {hasYouthParticipant ? (
                                                    smPlans.length > 0 ? (
                                                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <table className="w-full slds-text-4">
                                                                <thead>
                                                                    <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                        <th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>PLAN</th>
                                                                        <th className="px-4 py-2.5 text-right slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-weak)' }}>ACTIONS</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {smPlans.map((pl, idx) => (
                                                                        <tr key={pl.id} style={{ borderBottom: idx < smPlans.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                            <td className="px-4 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>{pl.plan}</td>
                                                                            <td className="px-4 py-2.5 text-right">
                                                                                <div className="flex items-center justify-end gap-1">
                                                                                    <button onClick={() => { setSmPlanEditId(pl.id); setSmPlanDraft(pl.plan); setSmPlanDialogOpen(true); }} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Modify">{iconEdit}</button>
                                                                                    <button onClick={() => setSmPlans(prev => prev.filter(x => x.id !== pl.id))} className="p-1.5 rounded hover:bg-red-50 transition-colors" title="Delete">{iconDelete}</button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center rounded-lg py-8" style={{ border: '2px dashed var(--slds-g-color-border-base-1)' }}>
                                                            <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No plans linked. Click "Add Plan" to begin.</p>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="flex items-center justify-center rounded-lg py-8" style={{ border: '2px dashed var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                        <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>Available once a Youth participant is added.</p>
                                                    </div>
                                                )}

                                                {/* Plan dialog */}
                                                {smPlanDialogOpen && (
                                                    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                                                        <div className="rounded-lg w-full max-w-md mx-4 overflow-hidden" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                                                            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                                <h3 className="slds-text-5 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>{smPlanEditId !== null ? 'Edit Plan' : 'Add Plan'}</h3>
                                                                <button onClick={() => setSmPlanDialogOpen(false)} className="p-1 rounded hover:bg-gray-200" style={{ color: 'var(--slds-g-color-text-weak)' }}>{iconClose}</button>
                                                            </div>
                                                            <div className="px-5 py-4">
                                                                <div className="space-y-1.5">
                                                                    <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>PLAN <span className="text-red-600">*</span></Label>
                                                                    <input type="text" value={smPlanDraft} onChange={e => setSmPlanDraft(e.target.value)} placeholder="Enter supplemental plan…"
                                                                        className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                                                                        style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }} />
                                                                </div>
                                                            </div>
                                                            <div className="px-5 py-3 flex justify-end gap-2" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                                <button onClick={() => setSmPlanDialogOpen(false)} className="h-9 px-4 rounded-full slds-text-4 font-medium"
                                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>Cancel</button>
                                                                <button disabled={!smPlanDraft.trim()}
                                                                    onClick={() => {
                                                                        if (!smPlanDraft.trim()) return;
                                                                        if (smPlanEditId !== null) {
                                                                            setSmPlans(prev => prev.map(x => x.id === smPlanEditId ? { ...x, plan: smPlanDraft } : x));
                                                                        } else {
                                                                            setSmPlans(prev => [...prev, { id: Date.now(), plan: smPlanDraft }]);
                                                                        }
                                                                        setSmPlanDialogOpen(false);
                                                                    }}
                                                                    className="h-9 px-4 rounded-full slds-text-4 font-medium text-white disabled:opacity-50" style={{ backgroundColor: '#145F33' }}>Apply</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    );
                                })()}

                                {/* Therapy Session Details */}
                                {connectionFormData.type === "Therapy Session" && (
                                    <TherapySessionFields
                                        connectionFormData={connectionFormData}
                                        setConnectionFormData={setConnectionFormData}
                                        connectionDetails={connectionDetails}
                                        setConnectionDetails={setConnectionDetails}
                                        connectionParticipants={connectionParticipants}
                                        therapyGoals={therapyGoals}
                                        setTherapyGoals={setTherapyGoals}
                                        handleOpenAddGoalModal={handleOpenAddGoalModal}
                                        selectedTreatmentTargets={selectedTreatmentTargets}
                                        setSelectedTreatmentTargets={setSelectedTreatmentTargets}
                                        setIsTreatmentTargetsModalOpen={setIsTreatmentTargetsModalOpen}
                                        participantRatings={participantRatings}
                                        setParticipantRatings={setParticipantRatings}
                                        editingParticipantRating={editingParticipantRating}
                                        setEditingParticipantRating={setEditingParticipantRating}
                                        setIsParticipantRatingModalOpen={setIsParticipantRatingModalOpen}
                                        advocateCopingSkills={advocateCopingSkills}
                                        setAdvocateCopingSkills={setAdvocateCopingSkills}
                                        advocateTriggers={advocateTriggers}
                                        setAdvocateTriggers={setAdvocateTriggers}
                                        advocateStrengths={advocateStrengths}
                                        setAdvocateStrengths={setAdvocateStrengths}
                                        handleOpenCopingSkillModal={handleOpenCopingSkillModal}
                                        handleDeleteCopingSkill={handleDeleteCopingSkill}
                                        handleOpenTriggerModal={handleOpenTriggerModal}
                                        handleDeleteTrigger={handleDeleteTrigger}
                                        handleOpenStrengthModal={handleOpenStrengthModal}
                                        handleDeleteStrength={handleDeleteStrength}
                                        getCurrentDate={getCurrentDate}
                                    />
                                )}

                                {!connectionFormData.type && (
                                    <div className="text-center py-12 text-[13px] text-gray-500">
                                        <p>Please select a Connection Type in the Connection tab to view additional details.</p>
                                    </div>
                                )}

                            {/* ── Individual Participant Notes Modal ─────────────────────────── */}
                            <Dialog open={participantNotesModalOpen} onOpenChange={(open) => { if (!open) setParticipantNotesModalOpen(false); }}>
                                <DialogContent className="max-w-lg" aria-describedby="ipn-modal-desc">
                                    <DialogHeader>
                                        <DialogTitle>Individual Participant Notes</DialogTitle>
                                        <DialogDescription id="ipn-modal-desc">
                                            Add or update notes, duration, and interaction types for this participant.
                                        </DialogDescription>
                                    </DialogHeader>

                                    {participantNotesModalRecord && (() => {
                                        const INTERACTION_TYPES = ["Lunch", "Food Donation", "Computer Access", "Rush Medical Visit"];
                                        const rec = participantNotesModalRecord;

                                        const toggleInteraction = (type: string) => {
                                            const updated = rec.interactionTypes.includes(type)
                                                ? rec.interactionTypes.filter(t => t !== type)
                                                : [...rec.interactionTypes, type];
                                            setParticipantNotesModalRecord({ ...rec, interactionTypes: updated });
                                        };

                                        return (
                                            <div className="space-y-4 py-2">
                                                {/* Participant Name — read-only */}
                                                <div className="space-y-1.5">
                                                    <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Participant Name</Label>
                                                    <div
                                                        className="h-9 flex items-center px-3 rounded-md slds-text-4"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-neutral-95)',
                                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                                            color: 'var(--slds-g-color-text-weak)',
                                                        }}
                                                    >
                                                        {rec.participantName}
                                                        {rec.participantRole && (
                                                            <span className="ml-2 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                — {rec.participantRole}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Duration */}
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="ipn-duration" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Duration (Minutes)</Label>
                                                    <Input
                                                        id="ipn-duration"
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={rec.duration}
                                                        onChange={(e) => setParticipantNotesModalRecord({ ...rec, duration: e.target.value })}
                                                        placeholder="e.g. 30"
                                                        className="h-9 slds-text-4"
                                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                    />
                                                </div>

                                                {/* Interaction Type / Activity — multi-select */}
                                                <div className="space-y-2">
                                                    <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Interaction Type / Activity</Label>
                                                    <div
                                                        className="rounded-md p-3 space-y-2"
                                                        style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                                    >
                                                        {INTERACTION_TYPES.map((type) => (
                                                            <div key={type} className="flex items-center gap-2">
                                                                <Checkbox
                                                                    id={`ipn-type-${type}`}
                                                                    checked={rec.interactionTypes.includes(type)}
                                                                    onCheckedChange={() => toggleInteraction(type)}
                                                                />
                                                                <Label
                                                                    htmlFor={`ipn-type-${type}`}
                                                                    className="slds-text-4 cursor-pointer font-normal"
                                                                    style={{ color: 'var(--slds-g-color-text-default)' }}
                                                                >
                                                                    {type}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {rec.interactionTypes.length > 0 && (
                                                        <p className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            Selected: {rec.interactionTypes.join(", ")}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Notes */}
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="ipn-notes" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Notes</Label>
                                                    <Textarea
                                                        id="ipn-notes"
                                                        value={rec.notes}
                                                        onChange={(e) => setParticipantNotesModalRecord({ ...rec, notes: e.target.value })}
                                                        placeholder="Enter notes for this participant…"
                                                        className="slds-text-4 min-h-[100px] resize-y"
                                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            className="rounded-full h-9"
                                            onClick={() => setParticipantNotesModalOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="rounded-full h-9"
                                            style={{ backgroundColor: '#145F33', color: 'white' }}
                                            onClick={() => {
                                                if (!participantNotesModalRecord) return;
                                                const { participantId, notes, duration, interactionTypes } = participantNotesModalRecord;
                                                setConnectionDetails({
                                                    ...connectionDetails,
                                                    [`participant_note_${participantId}`]: notes,
                                                    [`participant_duration_${participantId}`]: duration,
                                                    [`participant_interactions_${participantId}`]: interactionTypes,
                                                });
                                                setParticipantNotesModalOpen(false);
                                                setParticipantNotesModalRecord(null);
                                            }}
                                        >
                                            Apply
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* ── Reason for Request Modal (Community Care File Request) ───────── */}
                            <Dialog open={isReasonModalOpen} onOpenChange={setIsReasonModalOpen}>
                                <DialogContent className="max-w-lg" aria-describedby="reason-modal-desc">
                                    <DialogHeader>
                                        <DialogTitle>Add Reason for Request</DialogTitle>
                                        <DialogDescription id="reason-modal-desc">
                                            Select from predefined reasons or enter a custom reason.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-2">
                                        {/* Predefined Reasons */}
                                        <div className="space-y-2">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Select Reason</Label>
                                            <div className="rounded-md p-3 space-y-2" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                {fileRequestReasonOptions.map((reason) => (
                                                    <div key={reason} className="flex items-center gap-2">
                                                        <Checkbox
                                                            id={`reason-${reason}`}
                                                            checked={fileRequestReasons.includes(reason)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setFileRequestReasons([...fileRequestReasons, reason]);
                                                                } else {
                                                                    setFileRequestReasons(fileRequestReasons.filter(r => r !== reason));
                                                                }
                                                            }}
                                                        />
                                                        <Label
                                                            htmlFor={`reason-${reason}`}
                                                            className="slds-text-4 cursor-pointer font-normal"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            {reason}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Other Reason */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Other Reason</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={tempReasonOther}
                                                    onChange={(e) => setTempReasonOther(e.target.value)}
                                                    placeholder="Enter custom reason…"
                                                    className="h-9 slds-text-4"
                                                    style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => {
                                                        if (tempReasonOther.trim()) {
                                                            setFileRequestReasons([...fileRequestReasons, tempReasonOther.trim()]);
                                                            setTempReasonOther("");
                                                        }
                                                    }}
                                                    disabled={!tempReasonOther.trim()}
                                                    className="rounded-full h-9 px-4 slds-text-4"
                                                    style={{ backgroundColor: tempReasonOther.trim() ? '#145F33' : 'var(--slds-g-color-neutral-95)', color: tempReasonOther.trim() ? 'white' : 'var(--slds-g-color-text-weak)' }}
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Selected Reasons Preview */}
                                        {fileRequestReasons.length > 0 && (
                                            <div className="space-y-1.5">
                                                <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Selected Reasons</Label>
                                                <div className="rounded-md p-3" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}>
                                                    <ul className="space-y-1">
                                                        {fileRequestReasons.map((reason, idx) => (
                                                            <li key={idx} className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>• {reason}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            className="rounded-full h-9"
                                            onClick={() => {
                                                setIsReasonModalOpen(false);
                                                setTempReasonOther("");
                                            }}
                                        >
                                            Done
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* ── Documents Given Modal (Community Care File Request) ───────── */}
                            <Dialog open={isDocumentModalOpen} onOpenChange={setIsDocumentModalOpen}>
                                <DialogContent className="max-w-lg" aria-describedby="document-modal-desc">
                                    <DialogHeader>
                                        <DialogTitle>Add Documents Given</DialogTitle>
                                        <DialogDescription id="document-modal-desc">
                                            Select from predefined documents or enter a custom document.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-2">
                                        {/* Predefined Documents */}
                                        <div className="space-y-2">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Select Document</Label>
                                            <div className="rounded-md p-3 space-y-2" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                {fileRequestDocumentOptions.map((doc) => (
                                                    <div key={doc} className="flex items-center gap-2">
                                                        <Checkbox
                                                            id={`doc-${doc}`}
                                                            checked={fileRequestDocuments.includes(doc)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setFileRequestDocuments([...fileRequestDocuments, doc]);
                                                                } else {
                                                                    setFileRequestDocuments(fileRequestDocuments.filter(d => d !== doc));
                                                                }
                                                            }}
                                                        />
                                                        <Label
                                                            htmlFor={`doc-${doc}`}
                                                            className="slds-text-4 cursor-pointer font-normal"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            {doc}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Other Document */}
                                        <div className="space-y-1.5">
                                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Other Document</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={tempDocumentOther}
                                                    onChange={(e) => setTempDocumentOther(e.target.value)}
                                                    placeholder="Enter custom document…"
                                                    className="h-9 slds-text-4"
                                                    style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => {
                                                        if (tempDocumentOther.trim()) {
                                                            setFileRequestDocuments([...fileRequestDocuments, tempDocumentOther.trim()]);
                                                            setTempDocumentOther("");
                                                        }
                                                    }}
                                                    disabled={!tempDocumentOther.trim()}
                                                    className="rounded-full h-9 px-4 slds-text-4"
                                                    style={{ backgroundColor: tempDocumentOther.trim() ? '#145F33' : 'var(--slds-g-color-neutral-95)', color: tempDocumentOther.trim() ? 'white' : 'var(--slds-g-color-text-weak)' }}
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Selected Documents Preview */}
                                        {fileRequestDocuments.length > 0 && (
                                            <div className="space-y-1.5">
                                                <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Selected Documents</Label>
                                                <div className="rounded-md p-3" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}>
                                                    <ul className="space-y-1">
                                                        {fileRequestDocuments.map((doc, idx) => (
                                                            <li key={idx} className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>• {doc}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            className="rounded-full h-9"
                                            onClick={() => {
                                                setIsDocumentModalOpen(false);
                                                setTempDocumentOther("");
                                            }}
                                        >
                                            Done
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* ── Add Contact Purpose Modal (Community Care Contact) ───────── */}
                            <Dialog open={isAddContactPurposeModalOpen} onOpenChange={setIsAddContactPurposeModalOpen}>
                                <DialogContent className="max-w-md" aria-describedby="contact-purpose-modal-desc">
                                    <DialogHeader>
                                        <DialogTitle>Add Contact Purpose</DialogTitle>
                                        <DialogDescription id="contact-purpose-modal-desc">
                                            Enter a custom contact purpose to add to the list.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="new-contact-purpose" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Contact Purpose</Label>
                                            <Input
                                                id="new-contact-purpose"
                                                value={newContactPurpose}
                                                onChange={(e) => setNewContactPurpose(e.target.value)}
                                                placeholder="Enter custom contact purpose…"
                                                className="h-9 slds-text-4"
                                                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                            />
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            className="rounded-full h-9"
                                            onClick={() => {
                                                setIsAddContactPurposeModalOpen(false);
                                                setNewContactPurpose("");
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="rounded-full h-9"
                                            style={{ backgroundColor: '#145F33', color: 'white' }}
                                            disabled={!newContactPurpose.trim()}
                                            onClick={() => {
                                                if (newContactPurpose.trim()) {
                                                    setContactPurposeOptions([...contactPurposeOptions, newContactPurpose.trim()]);
                                                    setContactPurpose(newContactPurpose.trim());
                                                    setNewContactPurpose("");
                                                    setIsAddContactPurposeModalOpen(false);
                                                }
                                            }}
                                        >
                                            Add
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
        </>
    );
}
