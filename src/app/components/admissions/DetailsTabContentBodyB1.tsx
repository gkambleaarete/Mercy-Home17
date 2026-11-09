import React from "react";
import { Button } from "../ui/button";
import { Plus, Pencil, Trash2, Users } from "@/app/lib/lucide-icons";
import { AlertCircle } from "@/app/lib/lucide-icons";
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
import { SubstanceUseAssessmentFields } from "./SubstanceUseAssessmentFields";
import { DateInput } from "../ui/date-input";
import { RichTextEditor } from "../ui/rich-text-editor";
import { CopingSkillModal } from "./CopingSkillModal";
import { TriggerModal } from "./TriggerModal";
import { StrengthModal } from "./StrengthModal";
import { TherapySessionFields } from "./TherapySessionFields";

// Constants imported from/shared with ConnectionFormDialog
const moodOptions = [
  "Euthymic",
  "Depressed",
  "Anxious",
  "Angry",
  "Euphoric",
  "Irritable",
];
const affectOptions = [
  "Full",
  "Constricted",
  "Flat",
  "Inappropriate",
  "Labile",
];
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
const fileRequestReasonOptions = [
  "Subpoena",
  "Court Order",
  "Triage Support",
  "Personal Documents",
  "ROI by Member",
  "ROI by Family Member",
];
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
const youthCopingSkillsOptions = [
  "Deep breathing exercises",
  "Journaling",
  "Physical activity/exercise",
  "Talking to a trusted adult",
  "Listening to music",
  "Taking a break/timeout",
  "Progressive muscle relaxation",
];
const youthTriggersOptions = [
  "Loud noises",
  "Crowded spaces",
  "Academic pressure",
  "Peer conflict",
  "Authority figures",
  "Unstructured time",
  "Transitions between activities",
];
const youthStrengthsOptions = [
  "Creative and artistic",
  "Good problem solver",
  "Empathetic toward others",
  "Strong athletic ability",
  "Leadership qualities",
  "Sense of humor",
  "Resilient and determined",
];
const languageOptions = [
  "English",
  "Spanish",
  "Polish",
  "Other",
];

const ECR_PREDEFINED_PURPOSES = [
  "Academic Agreement Review",
  "Career Advising",
  "Employment Advising",
  "Executive Functions Advising",
  "High School Placement Planning",
  "PSO Advising",
  "School Progress Review",
];
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
const PE_PREDEFINED_REASONS = [
  "Assessment of Overall Cognitive Functioning",
  "Determine If Learning Disorder Present",
  "DSM-5 Diagnosis Confirmation",
  "Seeking Further Treatment Recommendations",
  "Appropriateness of Fit for Mercy Home",
];

export interface ConnectionParticipant {
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
  setConnectionFormData: React.Dispatch<
    React.SetStateAction<Partial<any>>
  >;
  connectionDetails: any;
  setConnectionDetails: React.Dispatch<
    React.SetStateAction<any>
  >;
  connectionParticipants: ConnectionParticipant[];

  // Advocate Meeting state
  advocateGoals: {
    id: number;
    goal: string;
    comments: string;
  }[];
  advocateMeetingSummary: string;
  setAdvocateMeetingSummary: (v: string) => void;
  themesAddressedAdvocate: string;
  setThemesAddressedAdvocate: (v: string) => void;
  selectedAdvocateTreatmentTargets: string[];
  setSelectedAdvocateTreatmentTargets: React.Dispatch<
    React.SetStateAction<string[]>
  >;
  advocateCopingSkills: any[];
  setAdvocateCopingSkills: React.Dispatch<
    React.SetStateAction<any[]>
  >;
  advocateTriggers: any[];
  setAdvocateTriggers: React.Dispatch<
    React.SetStateAction<any[]>
  >;
  advocateStrengths: any[];
  setAdvocateStrengths: React.Dispatch<
    React.SetStateAction<any[]>
  >;
  handleOpenAdvocateGoalModal: (goal?: {
    id: number;
    goal: string;
    comments: string;
  }) => void;
  handleDeleteAdvocateGoal: (id: number) => void;
  handleOpenCopingSkillModal: (skill?: any) => void;
  handleDeleteCopingSkill: (id: number) => void;
  handleOpenTriggerModal: (trigger?: any) => void;
  handleDeleteTrigger: (id: number) => void;
  handleOpenStrengthModal: (strength?: any) => void;
  handleDeleteStrength: (id: number) => void;

  // Therapy session state
  therapyGoals: {
    id: number;
    goal: string;
    comments: string;
  }[];
  setTherapyGoals: React.Dispatch<
    React.SetStateAction<
      { id: number; goal: string; comments: string }[]
    >
  >;
  handleOpenAddGoalModal: () => void;
  selectedTreatmentTargets: string[];
  setSelectedTreatmentTargets: React.Dispatch<
    React.SetStateAction<string[]>
  >;
  isTreatmentTargetsModalOpen: boolean;
  setIsTreatmentTargetsModalOpen: (v: boolean) => void;
  participantRatings: ParticipantRating[];
  setParticipantRatings: React.Dispatch<
    React.SetStateAction<ParticipantRating[]>
  >;
  editingParticipantRating: ParticipantRating | null;
  setEditingParticipantRating: React.Dispatch<
    React.SetStateAction<ParticipantRating | null>
  >;
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
  setParticipantNotesModalRecord: React.Dispatch<
    React.SetStateAction<{
      participantId: number;
      participantName: string;
      participantRole: string;
      duration: string;
      interactionTypes: string[];
      notes: string;
    } | null>
  >;

  // Community Care File Request state
  fileRequestReasons: string[];
  setFileRequestReasons: React.Dispatch<
    React.SetStateAction<string[]>
  >;
  isReasonModalOpen: boolean;
  setIsReasonModalOpen: (v: boolean) => void;
  tempReasonOther: string;
  setTempReasonOther: (v: string) => void;
  fileRequestDocuments: string[];
  setFileRequestDocuments: React.Dispatch<
    React.SetStateAction<string[]>
  >;
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
  setContactPurposeOptions: React.Dispatch<
    React.SetStateAction<string[]>
  >;
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
  setEcrPurposes: React.Dispatch<
    React.SetStateAction<string[]>
  >;
  ecrPurposeDialogOpen: boolean;
  setEcrPurposeDialogOpen: (v: boolean) => void;
  ecrPurposeDraft: string[];
  setEcrPurposeDraft: React.Dispatch<
    React.SetStateAction<string[]>
  >;
  ecrPurposeSearch: string;
  setEcrPurposeSearch: (v: string) => void;
  ecrPurposeOther: string;
  setEcrPurposeOther: (v: string) => void;
  ecrSummary: string;
  setEcrSummary: (v: string) => void;
  ecrGoals: { id: number; goal: string; comment: string }[];
  setEcrGoals: React.Dispatch<
    React.SetStateAction<
      { id: number; goal: string; comment: string }[]
    >
  >;
  ecrGoalDialogOpen: boolean;
  setEcrGoalDialogOpen: (v: boolean) => void;
  ecrGoalEditId: number | null;
  setEcrGoalEditId: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  ecrGoalDraft: { goal: string; comment: string };
  setEcrGoalDraft: React.Dispatch<
    React.SetStateAction<{ goal: string; comment: string }>
  >;
  ecrSkills: Record<string, string>;
  setEcrSkills: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;

  // Psychological Evaluation
  peRequestDate: string;
  setPeRequestDate: (v: string) => void;
  peReasons: { id: number; reason: string }[];
  setPeReasons: React.Dispatch<
    React.SetStateAction<{ id: number; reason: string }[]>
  >;
  peReasonDialogOpen: boolean;
  setPeReasonDialogOpen: (v: boolean) => void;
  peReasonEditId: number | null;
  setPeReasonEditId: React.Dispatch<
    React.SetStateAction<number | null>
  >;
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
  setSmPurposeDraft: React.Dispatch<
    React.SetStateAction<string[]>
  >;
  smPurposeSearch: string;
  setSmPurposeSearch: (v: string) => void;
  smSummary: string;
  setSmSummary: (v: string) => void;
  smIncidents: { id: number; incident: string }[];
  setSmIncidents: React.Dispatch<
    React.SetStateAction<{ id: number; incident: string }[]>
  >;
  smIncidentDialogOpen: boolean;
  setSmIncidentDialogOpen: (v: boolean) => void;
  smIncidentEditId: number | null;
  setSmIncidentEditId: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  smIncidentDraft: string;
  setSmIncidentDraft: (v: string) => void;
  smPlans: { id: number; plan: string }[];
  setSmPlans: React.Dispatch<
    React.SetStateAction<{ id: number; plan: string }[]>
  >;
  smPlanDialogOpen: boolean;
  setSmPlanDialogOpen: (v: boolean) => void;
  smPlanEditId: number | null;
  setSmPlanEditId: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  smPlanDraft: string;
  setSmPlanDraft: (v: string) => void;

  // Utility
  getCurrentDate: () => string;
}

export function DetailsTabContentBodyB1(
  props: DetailsTabContentProps,
) {
  const {
    connectionFormData,
    setConnectionFormData,
    connectionDetails,
    setConnectionDetails,
    connectionParticipants,
    advocateGoals,
    advocateMeetingSummary,
    setAdvocateMeetingSummary,
    themesAddressedAdvocate,
    setThemesAddressedAdvocate,
    selectedAdvocateTreatmentTargets,
    setSelectedAdvocateTreatmentTargets,
    advocateCopingSkills,
    setAdvocateCopingSkills,
    advocateTriggers,
    setAdvocateTriggers,
    advocateStrengths,
    setAdvocateStrengths,
    handleOpenAdvocateGoalModal,
    handleDeleteAdvocateGoal,
    handleOpenCopingSkillModal,
    handleDeleteCopingSkill,
    handleOpenTriggerModal,
    handleDeleteTrigger,
    handleOpenStrengthModal,
    handleDeleteStrength,
    therapyGoals,
    setTherapyGoals,
    handleOpenAddGoalModal,
    selectedTreatmentTargets,
    setSelectedTreatmentTargets,
    isTreatmentTargetsModalOpen,
    setIsTreatmentTargetsModalOpen,
    participantRatings,
    setParticipantRatings,
    editingParticipantRating,
    setEditingParticipantRating,
    isParticipantRatingModalOpen,
    setIsParticipantRatingModalOpen,
    participantNotesModalOpen,
    setParticipantNotesModalOpen,
    participantNotesModalRecord,
    setParticipantNotesModalRecord,
    fileRequestReasons,
    setFileRequestReasons,
    isReasonModalOpen,
    setIsReasonModalOpen,
    tempReasonOther,
    setTempReasonOther,
    fileRequestDocuments,
    setFileRequestDocuments,
    isDocumentModalOpen,
    setIsDocumentModalOpen,
    tempDocumentOther,
    setTempDocumentOther,
    fileRequestContactSummary,
    setFileRequestContactSummary,
    fileRequestFollowUp,
    setFileRequestFollowUp,
    contactPurposeOptions,
    setContactPurposeOptions,
    contactPurpose,
    setContactPurpose,
    isAddContactPurposeModalOpen,
    setIsAddContactPurposeModalOpen,
    newContactPurpose,
    setNewContactPurpose,
    interactionType,
    setInteractionType,
    contactSummary,
    setContactSummary,
    supportProvided,
    setSupportProvided,
    familyEventType,
    setFamilyEventType,
    familyEventTypeOther,
    setFamilyEventTypeOther,
    familyEventSummary,
    setFamilyEventSummary,
    mercyActivityType,
    setMercyActivityType,
    mercyActivityOther,
    setMercyActivityOther,
    mercyActivitySummary,
    setMercyActivitySummary,
    jdiMeetingSummary,
    setJdiMeetingSummary,
    jdiThemesAddressed,
    setJdiThemesAddressed,
    jdiSpiritualDevelopment,
    setJdiSpiritualDevelopment,
    employeeSiteVisitSummary,
    setEmployeeSiteVisitSummary,
    tutorMatch,
    setTutorMatch,
    tutorChangeReason,
    setTutorChangeReason,
    tutorChangeAction,
    setTutorChangeAction,
    tuteeChangeReason,
    setTuteeChangeReason,
    tuteeChangeAction,
    setTuteeChangeAction,
    psychTreatmentType,
    setPsychTreatmentType,
    psychTreatmentLocation,
    setPsychTreatmentLocation,
    psychReasonForTreatment,
    setPsychReasonForTreatment,
    psychOutcomeOfTreatment,
    setPsychOutcomeOfTreatment,
    psychYouthFeedback,
    setPsychYouthFeedback,
    ecrPurposes,
    setEcrPurposes,
    ecrPurposeDialogOpen,
    setEcrPurposeDialogOpen,
    ecrPurposeDraft,
    setEcrPurposeDraft,
    ecrPurposeSearch,
    setEcrPurposeSearch,
    ecrPurposeOther,
    setEcrPurposeOther,
    ecrSummary,
    setEcrSummary,
    ecrGoals,
    setEcrGoals,
    ecrGoalDialogOpen,
    setEcrGoalDialogOpen,
    ecrGoalEditId,
    setEcrGoalEditId,
    ecrGoalDraft,
    setEcrGoalDraft,
    ecrSkills,
    setEcrSkills,
    peRequestDate,
    setPeRequestDate,
    peReasons,
    setPeReasons,
    peReasonDialogOpen,
    setPeReasonDialogOpen,
    peReasonEditId,
    setPeReasonEditId,
    peReasonSelected,
    setPeReasonSelected,
    peReasonOther,
    setPeReasonOther,
    peRequestStatus,
    setPeRequestStatus,
    peRationale,
    setPeRationale,
    peResults,
    setPeResults,
    peRecommendations,
    setPeRecommendations,
    smPurposes,
    setSmPurposes,
    smPurposeDialogOpen,
    setSmPurposeDialogOpen,
    smPurposeDraft,
    setSmPurposeDraft,
    smPurposeSearch,
    setSmPurposeSearch,
    smSummary,
    setSmSummary,
    smIncidents,
    setSmIncidents,
    smIncidentDialogOpen,
    setSmIncidentDialogOpen,
    smIncidentEditId,
    setSmIncidentEditId,
    smIncidentDraft,
    setSmIncidentDraft,
    smPlans,
    setSmPlans,
    smPlanDialogOpen,
    setSmPlanDialogOpen,
    smPlanEditId,
    setSmPlanEditId,
    smPlanDraft,
    setSmPlanDraft,
    getCurrentDate,
  } = props;

  return (
    <>
      {/* Community Care Contact Details */}
      {connectionFormData.type === "Community Care Contact" && (
        <div className="space-y-6">
          {/* Contact Purpose */}
          <div className="space-y-1.5">
            <Label
              htmlFor="ccc-contact-purpose"
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Contact Purpose
            </Label>
            <div className="flex gap-2">
              <Select
                value={contactPurpose}
                onValueChange={setContactPurpose}
              >
                <SelectTrigger
                  id="ccc-contact-purpose"
                  className="h-9 slds-text-4"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                >
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {contactPurposeOptions.map((opt) => (
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
              <Button
                type="button"
                onClick={() =>
                  setIsAddContactPurposeModalOpen(true)
                }
                className="rounded-full h-9 px-4 slds-text-4 flex-shrink-0"
                style={{
                  backgroundColor: "#145F33",
                  color: "white",
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Other
              </Button>
            </div>
          </div>

          {/* Interaction Type */}
          <div className="space-y-1.5">
            <Label
              htmlFor="ccc-interaction-type"
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Interaction Type
            </Label>
            <Select
              value={interactionType}
              onValueChange={setInteractionType}
            >
              <SelectTrigger
                id="ccc-interaction-type"
                className="h-9 slds-text-4"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                }}
              >
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent>
                {interactionTypeOptions.map((opt) => (
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
          </div>

          {/* Contact Summary */}
          <div className="space-y-1.5">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Contact Summary
            </Label>
            <Textarea
              value={contactSummary}
              onChange={(e) =>
                setContactSummary(e.target.value)
              }
              placeholder="Enter contact summary…"
              className="slds-text-4 min-h-[120px] resize-y"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
              }}
            />
          </div>

          {/* Support Provided */}
          <div className="space-y-1.5">
            <Label
              htmlFor="ccc-support-provided"
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Support Provided
            </Label>
            <Select
              value={supportProvided}
              onValueChange={setSupportProvided}
            >
              <SelectTrigger
                id="ccc-support-provided"
                className="h-9 slds-text-4"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                }}
              >
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {supportProvidedOptions.map((opt) => (
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
          </div>
        </div>
      )}

      {/* Family Event Details */}
      {connectionFormData.type === "Family Event" && (
        <div className="space-y-6">
          {/* Event Type */}
          <div className="space-y-1.5">
            <Label
              htmlFor="fe-event-type"
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Event Type
            </Label>
            <Select
              value={familyEventType}
              onValueChange={(val) => {
                setFamilyEventType(val);
                if (val !== "Other")
                  setFamilyEventTypeOther("");
              }}
            >
              <SelectTrigger
                id="fe-event-type"
                className="h-9 slds-text-4"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                }}
              >
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {[
                  "Movie on the Lawn",
                  "Strength In Numbers",
                  "Women's Luncheon",
                  "Men's Event",
                  "Women's Retreat",
                  "Village Night",
                  "Friends First Picnic",
                  "Community Care Picnic",
                  "Community Care Christmas Party",
                  "Variety Show",
                  "Family Cultural Event",
                  "Other",
                ].map((opt) => (
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
          </div>

          {/* Other — conditional mandatory text field */}
          {familyEventType === "Other" && (
            <div className="space-y-1.5">
              <Label
                htmlFor="fe-event-type-other"
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Other <span className="text-red-600">*</span>
              </Label>
              <Input
                id="fe-event-type-other"
                type="text"
                value={familyEventTypeOther}
                onChange={(e) =>
                  setFamilyEventTypeOther(e.target.value)
                }
                placeholder="Please specify event type"
                className="h-9 slds-text-4"
                style={{
                  borderColor:
                    familyEventTypeOther.trim() === ""
                      ? "#c23934"
                      : "var(--slds-g-color-border-base-1)",
                }}
              />
              {familyEventTypeOther.trim() === "" && (
                <p
                  className="slds-text-3"
                  style={{ color: "#c23934" }}
                >
                  This field is required when Event Type is
                  "Other".
                </p>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="space-y-1.5">
            <Label
              htmlFor="fe-summary"
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Summary
            </Label>
            <Textarea
              id="fe-summary"
              value={familyEventSummary}
              onChange={(e) =>
                setFamilyEventSummary(e.target.value)
              }
              placeholder="Enter a summary of the family event…"
              className="slds-text-4 min-h-[180px] resize-y"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
              }}
            />
          </div>
        </div>
      )}

      {/* Employee Site Visit Details */}
      {connectionFormData.type === "Employee Site Visit" && (
        <div className="space-y-1.5">
          <Label
            htmlFor="esv-summary"
            className="slds-form-label"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Summary
          </Label>
          <Textarea
            id="esv-summary"
            value={employeeSiteVisitSummary}
            onChange={(e) =>
              setEmployeeSiteVisitSummary(e.target.value)
            }
            placeholder="Enter a summary of the site visit…"
            className="slds-text-4 min-h-[180px] resize-y"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
            }}
          />
        </div>
      )}

      {/* Family Partnership Meeting & Staff Meeting Details - Summary Field */}
      {(connectionFormData.type ===
        "Family Partnership Meeting" ||
        connectionFormData.type === "Staff Meeting") && (
        <div className="space-y-1.5">
          <Label className="text-[13px] text-[#3e3e3c] font-medium">
            Summary
          </Label>
          <Textarea
            value={connectionDetails.summary || ""}
            onChange={(e) =>
              setConnectionDetails({
                ...connectionDetails,
                summary: e.target.value,
              })
            }
            placeholder="Enter summary details..."
            className="min-h-[180px] text-[13px] border-[#dddbda] resize-none"
            style={{ fontFamily: "inherit" }}
          />
          <p className="text-[11px] text-[#706e6b] mt-1">
            Optional: Provide a summary of the staff meeting
            discussion, decisions, and action items.
          </p>
        </div>
      )}

      {/* Transition Meeting Details - Summary Field */}
      {connectionFormData.type === "Transition Meeting" && (
        <div className="space-y-1.5">
          <Label
            className="slds-form-label"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Summary
          </Label>
          <Textarea
            value={connectionDetails.summary || ""}
            onChange={(e) =>
              setConnectionDetails({
                ...connectionDetails,
                summary: e.target.value,
              })
            }
            placeholder="Enter summary details..."
            className="slds-text-4 min-h-[180px] resize-y"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
            }}
          />
        </div>
      )}

      {/* Mercy Home Activity Details */}
      {connectionFormData.type === "Mercy Home Activity" && (
        <div className="space-y-6">
          {/* Activity Type */}
          <div className="space-y-1.5">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Activity Type{" "}
              <span className="text-red-600">*</span>
            </Label>
            <Select
              value={mercyActivityType}
              onValueChange={(val) => {
                setMercyActivityType(val);
                if (val !== "Other") setMercyActivityOther("");
              }}
            >
              <SelectTrigger
                className="h-9 slds-text-4"
                style={{
                  borderColor:
                    mercyActivityType === ""
                      ? "#c23934"
                      : "var(--slds-g-color-border-base-1)",
                }}
              >
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {[
                  "Academy Awards",
                  "Graduate Luncheon",
                  "Holiday Event",
                  "Spiritual Celebration",
                  "Summer Barbecue",
                  "Haunted Hallways",
                  "Recovery Celebration",
                  "Stand Release Party",
                  "Cultural - Theater",
                  "Cultural - Museum",
                  "Cultural - Concert",
                  "Cultural - Festival",
                  "Youth Advisory Board",
                  "Variety Show",
                  "Hoops to Homework",
                  "Community Service",
                  "Program Activity",
                  "Justice, Diversity, and Inclusion Forum",
                  "Summer Trip",
                  "PRISM Group Sessions",
                  "Other",
                ].map((opt) => (
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
            {mercyActivityType === "" && (
              <p
                className="slds-text-3"
                style={{ color: "#c23934" }}
              >
                Activity Type is required.
              </p>
            )}
          </div>

          {/* Other — conditional mandatory text field */}
          {mercyActivityType === "Other" && (
            <div className="space-y-1.5">
              <Label
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Other <span className="text-red-600">*</span>
              </Label>
              <Input
                type="text"
                value={mercyActivityOther}
                onChange={(e) =>
                  setMercyActivityOther(e.target.value)
                }
                placeholder="Please specify activity type"
                className="h-9 slds-text-4"
                style={{
                  borderColor:
                    mercyActivityOther.trim() === ""
                      ? "#c23934"
                      : "var(--slds-g-color-border-base-1)",
                }}
              />
              {mercyActivityOther.trim() === "" && (
                <p
                  className="slds-text-3"
                  style={{ color: "#c23934" }}
                >
                  This field is required when Activity Type is
                  "Other".
                </p>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="space-y-1.5">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Summary
            </Label>
            <Textarea
              value={mercyActivitySummary}
              onChange={(e) =>
                setMercyActivitySummary(e.target.value)
              }
              placeholder="Enter activity summary and notes…"
              className="slds-text-4 min-h-[180px] resize-y"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
              }}
            />
          </div>

          {/* Individual Participant Notes */}
          <div className="space-y-3">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Individual Participant Notes
            </Label>
            {connectionParticipants.length > 0 ? (
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <table
                  className="w-full"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                      borderBottom:
                        "2px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <tr>
                      <th
                        className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          width: "32%",
                        }}
                      >
                        Participant
                      </th>
                      <th
                        className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Notes
                      </th>
                      <th
                        className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          width: "90px",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {connectionParticipants.map((p, idx) => {
                      const note =
                        (connectionDetails as any)[
                          `participant_note_${p.id}`
                        ] || "";
                      return (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom:
                              idx <
                              connectionParticipants.length - 1
                                ? "1px solid var(--slds-g-color-border-base-1)"
                                : "none",
                          }}
                        >
                          <td className="px-4 py-3">
                            <div
                              className="slds-text-4 font-medium"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              {p.participant}
                            </div>
                            <div
                              className="slds-text-3 mt-0.5"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              {p.role}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {note ? (
                              <span
                                className="slds-text-4"
                                style={
                                  {
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    overflow: "hidden",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                  } as React.CSSProperties
                                }
                                title={note}
                              >
                                {note}
                              </span>
                            ) : (
                              <span
                                className="slds-text-4 italic"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                No notes added
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setParticipantNotesModalRecord({
                                  participantId: p.id,
                                  participantName:
                                    p.participant,
                                  participantRole: p.role,
                                  notes: note,
                                  duration: "",
                                  interactionTypes: [],
                                });
                                setParticipantNotesModalOpen(
                                  true,
                                );
                              }}
                              className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full slds-text-3 font-medium transition-colors"
                              style={{
                                color: "#0176d3",
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "var(--slds-g-color-background-alt)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "var(--slds-g-color-background-base)")
                              }
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
                style={{
                  border:
                    "2px dashed var(--slds-g-color-border-base-1)",
                }}
              >
                <p
                  className="slds-text-4"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  No participants added yet.
                </p>
                <p
                  className="slds-text-3 mt-1"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Add participants in the Connection tab to
                  capture individual notes here.
                </p>
              </div>
            )}
            <p
              className="slds-text-3"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Click Modify to add notes per participant.
            </p>
          </div>
        </div>
      )}

      {/* Justice, Diversity, and Inclusion Event Details */}
      {connectionFormData.type ===
        "Justice, Diversity, and Inclusion Event" && (
        <div className="space-y-6">
          {/* Meeting Summary */}
          <div className="space-y-1.5">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Meeting Summary
            </Label>
            <Textarea
              value={jdiMeetingSummary}
              onChange={(e) =>
                setJdiMeetingSummary(e.target.value)
              }
              placeholder="Enter detailed meeting notes…"
              className="slds-text-4 min-h-[150px] resize-y"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
              }}
            />
          </div>

          {/* Themes Addressed */}
          <div className="space-y-1.5">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Themes Addressed
            </Label>
            <Textarea
              value={jdiThemesAddressed}
              onChange={(e) =>
                setJdiThemesAddressed(e.target.value)
              }
              placeholder="Enter themes and topics discussed during the event…"
              className="slds-text-4 min-h-[120px] resize-y"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
              }}
            />
          </div>

          {/* Spiritual Development Meeting */}
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="jdi-spiritual"
              checked={jdiSpiritualDevelopment}
              onCheckedChange={(checked) =>
                setJdiSpiritualDevelopment(!!checked)
              }
            />
            <Label
              htmlFor="jdi-spiritual"
              className="slds-text-4 cursor-pointer font-normal"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Spiritual Development Meeting
            </Label>
          </div>

          {/* Individual Participant Notes */}
          <div className="space-y-3">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Individual Participant Notes
            </Label>
            {connectionParticipants.length > 0 ? (
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <table
                  className="w-full"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                      borderBottom:
                        "2px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <tr>
                      <th
                        className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          width: "32%",
                        }}
                      >
                        Participant
                      </th>
                      <th
                        className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Notes
                      </th>
                      <th
                        className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          width: "90px",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {connectionParticipants.map((p, idx) => {
                      const note =
                        (connectionDetails as any)[
                          `participant_note_${p.id}`
                        ] || "";
                      return (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom:
                              idx <
                              connectionParticipants.length - 1
                                ? "1px solid var(--slds-g-color-border-base-1)"
                                : "none",
                          }}
                        >
                          <td className="px-4 py-3">
                            <div
                              className="slds-text-4 font-medium"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              {p.participant}
                            </div>
                            <div
                              className="slds-text-3 mt-0.5"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              {p.role}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {note ? (
                              <span
                                className="slds-text-4"
                                style={
                                  {
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    overflow: "hidden",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                  } as React.CSSProperties
                                }
                                title={note}
                              >
                                {note}
                              </span>
                            ) : (
                              <span
                                className="slds-text-4 italic"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                No notes added
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setParticipantNotesModalRecord({
                                  participantId: p.id,
                                  participantName:
                                    p.participant,
                                  participantRole: p.role,
                                  notes: note,
                                  duration: "",
                                  interactionTypes: [],
                                });
                                setParticipantNotesModalOpen(
                                  true,
                                );
                              }}
                              className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full slds-text-3 font-medium transition-colors"
                              style={{
                                color: "#0176d3",
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "var(--slds-g-color-background-alt)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "var(--slds-g-color-background-base)")
                              }
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
                style={{
                  border:
                    "2px dashed var(--slds-g-color-border-base-1)",
                }}
              >
                <p
                  className="slds-text-4"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  No participants added yet.
                </p>
                <p
                  className="slds-text-3 mt-1"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Add participants in the Connection tab to
                  capture individual notes here.
                </p>
              </div>
            )}
            <p
              className="slds-text-3"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Click Modify to add notes per participant.
            </p>
          </div>
        </div>
      )}

      {/* Tutor Session Details */}
      {connectionFormData.type === "Tutor Session" && (
        <div className="space-y-6">
          {/* Match */}
          <div className="space-y-1.5">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Match
            </Label>
            {(() => {
              const youths = connectionParticipants.filter(
                (p) => p.role === "Youth",
              );
              const tutors = connectionParticipants.filter(
                (p) => p.role === "Tutor",
              );
              const pairs: string[] = [];
              youths.forEach((y) =>
                tutors.forEach((t) =>
                  pairs.push(
                    `${y.participant} / ${t.participant}`,
                  ),
                ),
              );
              // Auto-created from a Tutor Match (US 20093): the Match is
              // the source association and stays fixed.
              const sourceMatchId = (
                connectionFormData as { sourceMatchId?: string }
              ).sourceMatchId;
              if (tutorMatch && !pairs.includes(tutorMatch))
                pairs.unshift(tutorMatch);
              return (
                <Select
                  value={tutorMatch}
                  onValueChange={setTutorMatch}
                  disabled={!!sourceMatchId}
                >
                  <SelectTrigger
                    aria-label="Match"
                    className="h-9 slds-text-4"
                    style={{
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <SelectValue placeholder="Please Select" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {pairs.length > 0 ? (
                      pairs.map((pair) => (
                        <SelectItem
                          key={pair}
                          value={pair}
                          className="slds-text-4"
                        >
                          {pair}
                        </SelectItem>
                      ))
                    ) : (
                      <div
                        className="px-3 py-2 slds-text-4"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Add a Youth and Tutor participant first.
                      </div>
                    )}
                  </SelectContent>
                </Select>
              );
            })()}
            <p
              className="slds-text-3"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {(
                connectionFormData as { sourceMatchId?: string }
              ).sourceMatchId
                ? `Created automatically from Tutor Match ${(connectionFormData as { sourceMatchId?: string }).sourceMatchId}.`
                : 'Populated from participants with role "Youth" and "Tutor" in the Connection tab.'}
            </p>
          </div>

          {/* Tutor Change */}
          <div
            className="space-y-4 rounded-lg p-4"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            <Label
              className="slds-text-4 font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Tutor Change
            </Label>

            {/* Tutor Change – Reason */}
            <div className="space-y-1.5">
              <Label
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Reason
              </Label>
              <Select
                value={tutorChangeReason}
                onValueChange={setTutorChangeReason}
              >
                <SelectTrigger
                  className="h-9 slds-text-4"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "No Show",
                    "Tutor Canceled Ahead",
                    "Tutor unable to help with HW",
                    "Program Canceled Ahead",
                    "Agency Cancellation",
                  ].map((opt) => (
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
            </div>

            {/* Tutor Change – Action */}
            <div className="space-y-1.5">
              <Label
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Action
              </Label>
              <Select
                value={tutorChangeAction}
                onValueChange={setTutorChangeAction}
              >
                <SelectTrigger
                  className="h-9 slds-text-4"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  {["Reassigned", "Session Canceled"].map(
                    (opt) => (
                      <SelectItem
                        key={opt}
                        value={opt}
                        className="slds-text-4"
                      >
                        {opt}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tutee Change */}
          <div
            className="space-y-4 rounded-lg p-4"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            <Label
              className="slds-text-4 font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Tutee Change
            </Label>

            {/* Tutee Change – Reason */}
            <div className="space-y-1.5">
              <Label
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Reason
              </Label>
              <Select
                value={tuteeChangeReason}
                onValueChange={setTuteeChangeReason}
              >
                <SelectTrigger
                  className="h-9 slds-text-4"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {[
                    "Program did not communicate scheduled meeting",
                    "Program did not communicate schedule change",
                    "Youth did not communicate schedule change",
                    "Program canceled ahead",
                    "Youth hospitalized",
                    "Youth sick/emergency",
                    "Youth refused tutor",
                    "Tutor canceled ahead",
                    "Agency cancellation",
                  ].map((opt) => (
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
            </div>

            {/* Tutee Change – Action */}
            <div className="space-y-1.5">
              <Label
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Action
              </Label>
              <Select
                value={tuteeChangeAction}
                onValueChange={setTuteeChangeAction}
              >
                <SelectTrigger
                  className="h-9 slds-text-4"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  {["Reassigned", "Session Canceled"].map(
                    (opt) => (
                      <SelectItem
                        key={opt}
                        value={opt}
                        className="slds-text-4"
                      >
                        {opt}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Psychiatric Hospitalization Details */}
      {connectionFormData.type ===
        "Psychiatric Hospitalization" && (
        <div className="space-y-5">
          {/* Treatment Type */}
          <div className="space-y-1.5">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Treatment Type
            </Label>
            <Select
              value={psychTreatmentType}
              onValueChange={setPsychTreatmentType}
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
                {[
                  "Outpatient Therapy",
                  "Intensive Outpatient Therapy",
                  "Specialized Outpatient Therapy",
                  "Case Management",
                  "Mentoring",
                  "Outpatient Substance Abuse",
                  "Inpatient Substance Abuse",
                  "Partial Psychiatric Hospitalization",
                  "Inpatient Psychiatric Hospitalization",
                  "Residential Treatment",
                  "Psychological Assessment",
                  "Medication Management",
                ].map((opt) => (
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
          </div>

          {/* Treatment Location */}
          <div className="space-y-1.5">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Treatment Location
            </Label>
            <Input
              type="text"
              value={psychTreatmentLocation}
              onChange={(e) =>
                setPsychTreatmentLocation(e.target.value)
              }
              placeholder="Enter facility or location name"
              className="h-9 slds-text-4"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
              }}
            />
          </div>

          {/* Reason For Treatment */}
          <div className="space-y-1.5">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Reason For Treatment
            </Label>
            <Textarea
              value={psychReasonForTreatment}
              onChange={(e) =>
                setPsychReasonForTreatment(e.target.value)
              }
              placeholder="Describe the circumstances leading to hospitalization…"
              className="slds-text-4 min-h-[120px] resize-y"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
              }}
            />
          </div>

          {/* Outcome of Treatment */}
          <div className="space-y-1.5">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Outcome of Treatment
            </Label>
            <Textarea
              value={psychOutcomeOfTreatment}
              onChange={(e) =>
                setPsychOutcomeOfTreatment(e.target.value)
              }
              placeholder="Capture treatment results and outcomes…"
              className="slds-text-4 min-h-[120px] resize-y"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
              }}
            />
          </div>

          {/* Youth & Support System Feedback */}
          <div className="space-y-1.5">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Youth &amp; Support System Feedback
            </Label>
            <Textarea
              value={psychYouthFeedback}
              onChange={(e) =>
                setPsychYouthFeedback(e.target.value)
              }
              placeholder="Capture feedback from youth and support network…"
              className="slds-text-4 min-h-[120px] resize-y"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
              }}
            />
          </div>
        </div>
      )}

      {/* Annual Physical Appointment Details */}
      {connectionFormData.type ===
        "Annual Physical Appointment" && (
        <div className="space-y-6">
          {/* Reason */}
          <div className="grid gap-2">
            <Label className="text-[13px] text-[#3e3e3c] font-medium">
              Reason
            </Label>
            <Textarea
              value={connectionDetails.reason || ""}
              onChange={(e) =>
                setConnectionDetails({
                  ...connectionDetails,
                  reason: e.target.value,
                })
              }
              placeholder="Enter reason for appointment..."
              className="min-h-[100px] text-[13px] border-[#dddbda] resize-none"
              style={{ fontFamily: "inherit" }}
            />
          </div>

          {/* Diagnosis */}
          <div className="grid gap-2">
            <Label className="text-[13px] text-[#3e3e3c] font-medium">
              Diagnosis
            </Label>
            <Textarea
              value={connectionDetails.diagnosis || ""}
              onChange={(e) =>
                setConnectionDetails({
                  ...connectionDetails,
                  diagnosis: e.target.value,
                })
              }
              placeholder="Enter diagnosis..."
              className="min-h-[100px] text-[13px] border-[#dddbda] resize-none"
              style={{ fontFamily: "inherit" }}
            />
          </div>

          {/* Was New Medication or Dosage Prescribed? */}
          <div className="space-y-3">
            <Label className="text-[13px] text-[#3e3e3c] font-medium">
              Was New Medication or Dosage Prescribed?
            </Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="newMedicationPrescribed"
                  checked={
                    connectionDetails.newMedicationPrescribed ===
                    true
                  }
                  onChange={() =>
                    setConnectionDetails({
                      ...connectionDetails,
                      newMedicationPrescribed: true,
                    })
                  }
                  className="h-4 w-4"
                  style={{ accentColor: "#145F33" }}
                />
                <span className="text-[13px] text-[#3e3e3c]">
                  Yes
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="newMedicationPrescribed"
                  checked={
                    connectionDetails.newMedicationPrescribed ===
                    false
                  }
                  onChange={() =>
                    setConnectionDetails({
                      ...connectionDetails,
                      newMedicationPrescribed: false,
                    })
                  }
                  className="h-4 w-4"
                  style={{ accentColor: "#145F33" }}
                />
                <span className="text-[13px] text-[#3e3e3c]">
                  No
                </span>
              </label>
            </div>

            {/* AC12: Medication Reminder Message */}
            {connectionDetails.newMedicationPrescribed ===
              true && (
              <div
                className="flex items-start gap-2 p-3 rounded-lg border"
                style={{
                  backgroundColor: "#ebf5ff",
                  borderColor: "#b6deff",
                }}
              >
                <AlertCircle className="h-4 w-4 text-[#0176d3] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[12px] text-[#014486]">
                    Reminder: add the new prescription to the
                    youth's record via Medication functionality
                    and complete a medication consent form.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="grid gap-2">
            <Label className="text-[13px] text-[#3e3e3c] font-medium">
              Recommendations
            </Label>
            <Textarea
              value={connectionDetails.recommendations || ""}
              onChange={(e) =>
                setConnectionDetails({
                  ...connectionDetails,
                  recommendations: e.target.value,
                })
              }
              placeholder="Enter recommendations..."
              className="min-h-[100px] text-[13px] border-[#dddbda] resize-none"
              style={{ fontFamily: "inherit" }}
            />
          </div>
        </div>
      )}

      {/* Dentist Appointment Details */}
      {connectionFormData.type === "Dentist Appointment" && (
        <div className="space-y-6">
          {/* Biannual Dental Requirement Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="biannualDentalRequirement"
              checked={
                connectionDetails.biannualDentalRequirement ||
                false
              }
              onChange={(e) =>
                setConnectionDetails({
                  ...connectionDetails,
                  biannualDentalRequirement: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-[#dddbda] text-[#145F33] focus:ring-[#145F33]"
              style={{
                colorScheme: "light",
                accentColor: "#145F33",
              }}
            />
            <Label
              htmlFor="biannualDentalRequirement"
              className="text-[13px] text-[#3e3e3c] font-medium cursor-pointer"
            >
              This appointment satisfies this youth's biannual
              dental requirement
            </Label>
          </div>

          {/* Reason */}
          <div className="grid gap-2">
            <Label className="text-[13px] text-[#3e3e3c] font-medium">
              Reason
            </Label>
            <Textarea
              value={connectionDetails.reason || ""}
              onChange={(e) =>
                setConnectionDetails({
                  ...connectionDetails,
                  reason: e.target.value,
                })
              }
              placeholder="Enter reason for appointment..."
              className="min-h-[100px] text-[13px] border-[#dddbda] resize-none"
              style={{ fontFamily: "inherit" }}
            />
          </div>

          {/* Diagnosis */}
          <div className="grid gap-2">
            <Label className="text-[13px] text-[#3e3e3c] font-medium">
              Diagnosis
            </Label>
            <Textarea
              value={connectionDetails.diagnosis || ""}
              onChange={(e) =>
                setConnectionDetails({
                  ...connectionDetails,
                  diagnosis: e.target.value,
                })
              }
              placeholder="Enter diagnosis..."
              className="min-h-[100px] text-[13px] border-[#dddbda] resize-none"
              style={{ fontFamily: "inherit" }}
            />
          </div>

          {/* Was New Medication or Dosage Prescribed? */}
          <div className="space-y-3">
            <Label className="text-[13px] text-[#3e3e3c] font-medium">
              Was New Medication or Dosage Prescribed?
            </Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="newMedicationPrescribedDentist"
                  checked={
                    connectionDetails.newMedicationPrescribed ===
                    true
                  }
                  onChange={() =>
                    setConnectionDetails({
                      ...connectionDetails,
                      newMedicationPrescribed: true,
                    })
                  }
                  className="h-4 w-4"
                  style={{ accentColor: "#145F33" }}
                />
                <span className="text-[13px] text-[#3e3e3c]">
                  Yes
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="newMedicationPrescribedDentist"
                  checked={
                    connectionDetails.newMedicationPrescribed ===
                    false
                  }
                  onChange={() =>
                    setConnectionDetails({
                      ...connectionDetails,
                      newMedicationPrescribed: false,
                    })
                  }
                  className="h-4 w-4"
                  style={{ accentColor: "#145F33" }}
                />
                <span className="text-[13px] text-[#3e3e3c]">
                  No
                </span>
              </label>
            </div>

            {/* AC12: Medication Reminder Message */}
            {connectionDetails.newMedicationPrescribed ===
              true && (
              <div
                className="flex items-start gap-2 p-3 rounded-lg border"
                style={{
                  backgroundColor: "#ebf5ff",
                  borderColor: "#b6deff",
                }}
              >
                <AlertCircle className="h-4 w-4 text-[#0176d3] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[12px] text-[#014486]">
                    Reminder: add the new prescription to the
                    youth's record via Medication functionality
                    and complete a medication consent form.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Follow Up */}
          <div className="grid gap-2">
            <Label className="text-[13px] text-[#3e3e3c] font-medium">
              Follow Up
            </Label>
            <Textarea
              value={connectionDetails.followUp || ""}
              onChange={(e) =>
                setConnectionDetails({
                  ...connectionDetails,
                  followUp: e.target.value,
                })
              }
              placeholder="Enter follow up details..."
              className="min-h-[100px] text-[13px] border-[#dddbda] resize-none"
              style={{ fontFamily: "inherit" }}
            />
          </div>
        </div>
      )}

      {/* Eye Doctor Appointment Details */}
      {connectionFormData.type === "Eye Doctor Appointment" && (
        <div className="space-y-6">
          {/* Reason */}
          <div className="grid gap-2">
            <Label className="text-[13px] text-[#3e3e3c] font-medium">
              Reason
            </Label>
            <Textarea
              value={connectionDetails.reason || ""}
              onChange={(e) =>
                setConnectionDetails({
                  ...connectionDetails,
                  reason: e.target.value,
                })
              }
              placeholder="Enter reason for appointment..."
              className="min-h-[100px] text-[13px] border-[#dddbda] resize-none"
              style={{ fontFamily: "inherit" }}
            />
          </div>

          {/* Diagnosis */}
          <div className="grid gap-2">
            <Label className="text-[13px] text-[#3e3e3c] font-medium">
              Diagnosis
            </Label>
            <Textarea
              value={connectionDetails.diagnosis || ""}
              onChange={(e) =>
                setConnectionDetails({
                  ...connectionDetails,
                  diagnosis: e.target.value,
                })
              }
              placeholder="Enter diagnosis..."
              className="min-h-[100px] text-[13px] border-[#dddbda] resize-none"
              style={{ fontFamily: "inherit" }}
            />
          </div>

          {/* Was New Medication or Dosage Prescribed? */}
          <div className="space-y-3">
            <Label className="text-[13px] text-[#3e3e3c] font-medium">
              Was New Medication or Dosage Prescribed?
            </Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="newMedicationPrescribedEyeDoctor"
                  checked={
                    connectionDetails.newMedicationPrescribed ===
                    true
                  }
                  onChange={() =>
                    setConnectionDetails({
                      ...connectionDetails,
                      newMedicationPrescribed: true,
                    })
                  }
                  className="h-4 w-4"
                  style={{ accentColor: "#145F33" }}
                />
                <span className="text-[13px] text-[#3e3e3c]">
                  Yes
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="newMedicationPrescribedEyeDoctor"
                  checked={
                    connectionDetails.newMedicationPrescribed ===
                    false
                  }
                  onChange={() =>
                    setConnectionDetails({
                      ...connectionDetails,
                      newMedicationPrescribed: false,
                    })
                  }
                  className="h-4 w-4"
                  style={{ accentColor: "#145F33" }}
                />
                <span className="text-[13px] text-[#3e3e3c]">
                  No
                </span>
              </label>
            </div>

            {/* AC12: Medication Reminder Message */}
            {connectionDetails.newMedicationPrescribed ===
              true && (
              <div
                className="flex items-start gap-2 p-3 rounded-lg border"
                style={{
                  backgroundColor: "#ebf5ff",
                  borderColor: "#b6deff",
                }}
              >
                <AlertCircle className="h-4 w-4 text-[#0176d3] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[12px] text-[#014486]">
                    Reminder: add the new prescription to the
                    youth's record via Medication functionality
                    and complete a medication consent form.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="grid gap-2">
            <Label className="text-[13px] text-[#3e3e3c] font-medium">
              Recommendations
            </Label>
            <Textarea
              value={connectionDetails.recommendations || ""}
              onChange={(e) =>
                setConnectionDetails({
                  ...connectionDetails,
                  recommendations: e.target.value,
                })
              }
              placeholder="Enter recommendations..."
              className="min-h-[100px] text-[13px] border-[#dddbda] resize-none"
              style={{ fontFamily: "inherit" }}
            />
          </div>
        </div>
      )}

      {/* AC27-AC34: Parent / Family Contact Details */}
      {connectionFormData.type ===
        "Parent / Family Contact" && (
        <div className="space-y-6">
          {/* AC28: Themes Addressed */}
          <div className="grid gap-2">
            <Label className="text-[13px] text-[#3e3e3c] font-medium">
              Themes Addressed
            </Label>
            <Textarea
              value={connectionDetails.themesAddressed || ""}
              onChange={(e) =>
                setConnectionDetails({
                  ...connectionDetails,
                  themesAddressed: e.target.value,
                })
              }
              placeholder="Document key discussion themes during the parent/family contact..."
              className="min-h-[120px] text-[13px] border-[#dddbda] resize-none"
              style={{ fontFamily: "inherit" }}
            />
            <p className="text-[11px] text-[#706e6b] mt-1">
              Optional: Document the primary themes discussed
              during this parent/family contact.
            </p>
          </div>

          {/* AC29: Contact Summary */}
          <div className="grid gap-2">
            <Label className="text-[13px] text-[#3e3e3c] font-medium">
              Contact Summary
            </Label>
            <Textarea
              value={connectionDetails.contactSummary || ""}
              onChange={(e) =>
                setConnectionDetails({
                  ...connectionDetails,
                  contactSummary: e.target.value,
                })
              }
              placeholder="Provide narrative details and outcomes of the interaction..."
              className="min-h-[180px] text-[13px] border-[#dddbda] resize-none"
              style={{ fontFamily: "inherit" }}
            />
            <p className="text-[11px] text-[#706e6b] mt-1">
              Optional: Provide a comprehensive summary of the
              contact including outcomes and relevant notes.
            </p>
          </div>

          {/* AC30-AC34: Treatment Targets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[13px] text-[#3e3e3c] font-medium">
                Treatment Targets
              </Label>
              <button
                onClick={() => {
                  setSelectedTreatmentTargets(
                    connectionDetails.treatmentTargets || [],
                  );
                  setIsTreatmentTargetsModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded border transition-colors"
                style={{
                  backgroundColor: "white",
                  borderColor: "#dddbda",
                  color: "#145F33",
                }}
              >
                <Plus className="h-4 w-4" />
                {(connectionDetails.treatmentTargets?.length ||
                  0) > 0
                  ? "Modify"
                  : "Add"}{" "}
                Treatment Targets
              </button>
            </div>

            {/* Treatment Targets Grid Display */}
            {(connectionDetails.treatmentTargets?.length || 0) >
            0 ? (
              <div className="border rounded-lg overflow-hidden border-[#dddbda]">
                <table className="w-full">
                  <thead
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <tr>
                      <th
                        className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Treatment Target
                      </th>
                      <th
                        className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide"
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
                    {connectionDetails.treatmentTargets?.map(
                      (target, index) => (
                        <tr key={index}>
                          <td
                            className="px-4 py-3 text-[13px]"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {target}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                const updatedTargets =
                                  connectionDetails.treatmentTargets?.filter(
                                    (_, i) => i !== index,
                                  ) || [];
                                setConnectionDetails({
                                  ...connectionDetails,
                                  treatmentTargets:
                                    updatedTargets,
                                });
                              }}
                              className="p-1.5 rounded hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                              title="Remove"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center"
                style={{ borderColor: "#dddbda" }}
              >
                <p className="text-[13px] text-[#706e6b]">
                  No treatment targets selected. Click "Add
                  Treatment Targets" to begin.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}