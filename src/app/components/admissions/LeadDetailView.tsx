import { useState, useMemo, useEffect, useRef } from "react";
import { CommunityCareObservationsFeed } from "../pages/CommunityCareObservationsFeed";
import { getProfileObservations } from "../../data/profileObservations";
import { CommunityCareFinancialSupport } from "../pages/CommunityCareFinancialSupport";
// Members column on the profile's read-only Referrals (Community Care staff).
const PROFILE_REFERRAL_MEMBERS = [
  "Maya Patel (Housing Coordinator)",
  "Dr. Samuel Brooks (Therapist)",
  "Jordan Ellis (Vocation Coach)",
  "Rachel Nguyen (Care Manager)",
];
import {
  categoryChangeBlocker,
  changeAdmissionsCategory,
  effectiveAdmissionsCategory,
  useAdmissionsCategories,
} from "../../data/admissionsCategoryStore";
import { ChangeCategoryDialog } from "./ChangeCategoryDialog";
import { AdmissionsCategoryNotice } from "./AdmissionsCategoryNotice";
import { YouthAlertIcons } from "../youth/YouthAlertIcons";
import { RestrictionsIndicator } from "../youth/RestrictionsIndicator";
import {
  saveCampusRestriction,
  useCampusRestrictions,
} from "../../data/campusRestrictionStore";
import {
  ChevronRight,
  Plus,
  User,
  Users,
  Building2,
  Phone,
  Mail,
  CheckSquare,
  Upload,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle,
  Pencil,
  Trash2,
  ChevronDown,
  FileText,
  ChevronUp,
  Check,
  X as XIcon,
  ChevronUp as ArrowUp,
  ChevronDown as ArrowDown,
  MoreVertical,
  Download,
  Eye,
  File,
} from "@/app/lib/lucide-icons";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
import {
  Dialog,
  DialogBody,
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
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { IncidentDetailsDialog } from "../dialogs/IncidentDetailsDialog";
import {
  LegalInvolvementDialog,
  LegalInvolvementRecord,
} from "../dialogs/LegalInvolvementDialog";
import {
  DCFSInvolvementDialog,
  DCFSInvolvementRecord,
} from "../dialogs/DCFSInvolvementDialog";
import { MedicationsTabContent } from "./MedicationsTabContent";
import { MedicationsSection } from "./MedicationsSection";
import { PsychosocialFactorsSection } from "./PsychosocialFactorsSection";
import { RiskFactorsSection } from "./RiskFactorsSection";
import { BiologicalHistorySection } from "./BiologicalHistorySection";
import { SocialHistorySection } from "./SocialHistorySection";
import { ROITrackingSection } from "./ROITrackingSection";
import { FamilyHistorySection } from "./FamilyHistorySection";
import { LegalHistorySection } from "./LegalHistorySection";
import { PhysicalHealthSection } from "./PhysicalHealthSection";
import { MentalHealthSection } from "./MentalHealthSection";
import { MentalStatusExamSection } from "./MentalStatusExamSection";
import { SubstanceUseSection } from "./SubstanceUseSection";
import { RecommendationsSection } from "./RecommendationsSection";
import { ConstituentDetailsSection } from "./ConstituentDetailsSection";
import { CPIEligibilitySection } from "./CPIEligibilitySection";
import { ProfileAdmissionsAttempts, ProfileProgramEnrollment } from "./ProfileProgramAndAdmissions";
import { TransitionSummaryWorkspace } from "./TransitionSummaryWorkspace";
import { IndividualTreatmentPlanSection } from "../youth/IndividualTreatmentPlanSection";
import { CommunityCareMemberProfileNav } from "./CommunityCareMemberProfileNav";
import { addIncidentReportRecord } from "../../data/incidentReportStore";
import type { SubmittedIncident } from "./ConstituentCreateIncidentDialog";
import {
  OrgconstituentDetailsView,
  OrgConstituentRolesView,
  OrgRelationshipsView,
  OrgConnectionsView,
  mentorContactSeed,
} from "../pages/OrganizationConstituentDetailPage";
import { hasRole, CONSTITUENTS } from "../../data/mockConstituents";
import { Tabs as MemberTabs, TabsList as MemberTabsList, TabsTrigger as MemberTabsTrigger } from "../ui/tabs";
import { RelationshipsSection } from "./RelationshipsSection";
import { ConnectionsSection } from "./ConnectionsSection";
import {
  testingYouthKey,
  useYouthTestingAssessments,
} from "../../data/youthTestingAssessmentStore";
import { DocumentsSection } from "./DocumentsSection";
import { YouthDocumentsArea } from "./youth-documents/YouthDocumentsArea";
import {
  admissionScope,
  scopeDisplayName,
  scopeKey,
  youthScope,
} from "../../lib/youthDocumentOwner";
import { ContactLogDialogSLDS } from "../ContactLogDialogSLDS";
import { AssignAcademicSnapshotDialog } from "./AssignAcademicSnapshotDialog";
import type { AssignAcademicSnapshotResult } from "../../lib/academicSnapshotTask";
import {
  CONTACT_LOGS,
  ContactLog as ContactLogType,
} from "../../data/mockContactLogs";
import { CreateInfoSessionDialog } from "./CreateInfoSessionDialog";
import { CreateClinicalAssessmentDialog } from "./CreateClinicalAssessmentDialog";
import { CreateAdmissionsShadowDialog } from "./CreateAdmissionsShadowDialog";
import { CreateFamilyPartnershipMeetingDialog } from "./CreateFamilyPartnershipMeetingDialog";
import { ClinicalAssessmentsView } from "./ClinicalAssessmentsView";
import { EducationCareerView } from "./EducationCareerView";
import { DeterminationView } from "./DeterminationView";
import { TreatmentPlanningView } from "./TreatmentPlanningView";
import { NeedsTabContent } from "./NeedsTabContent";
import { RichTextEditor } from "../ui/rich-text-editor";
import { StageProgressData } from "./StageProgressData";
import { SubstanceUseTestingModals } from "./SubstanceUseTestingModals";
import { AdditionalDocumentation } from "./AdditionalDocumentation";
import {
  ActivityTimeline,
  TimelineActivity,
} from "../ActivityTimeline";
import { getTimelineForAdmissionsLead } from "../../data/mockAdmissionsTimelineData";
import { CaseyLifeSkillsCaregiverFields } from "./CaseyLifeSkillsCaregiverFields";
import { CaseyLifeSkillsYouthFields } from "./CaseyLifeSkillsYouthFields";
import { LeadDetailCaseDetailsTab } from "./LeadDetailCaseDetailsTab";
import { LeadDetailEducationTab } from "./LeadDetailEducationTab";
import { LeadDetailIncidentsTab } from "./LeadDetailIncidentsTab";
import { LeadDetailHealthOverviewTab } from "./LeadDetailHealthOverviewTab";
import { LeadDetailHealthDialogs } from "./LeadDetailHealthDialogs";
import { LeadDetailTestingTab } from "./LeadDetailTestingTab";
import { LeadDetailCampusRestrictionsTab } from "./LeadDetailCampusRestrictionsTab";
import { LeadDetailTestingDialog } from "./LeadDetailTestingDialog";
import {
  emptyAcesFormData,
  type AcesDocument,
  type AcesFormData,
} from "./LeadDetailAcesFields";
import { LeadDetailRemainingDialogs } from "./LeadDetailRemainingDialogs";
import { LeadDetailCreateIncidentDialog } from "./LeadDetailCreateIncidentDialog";
import { ConstituentCreateIncidentDialog } from "./ConstituentCreateIncidentDialog";
import { LeadDetailCredentialsTab } from "./LeadDetailCredentialsTab";
import { LeadDetailFinancialLiteracyTab } from "./LeadDetailFinancialLiteracyTab";
import { LeadDetailPSOTab } from "./LeadDetailPSOTab";
import { LeadDetailSpecialtyTab } from "./LeadDetailSpecialtyTab";
import { LeadDetailEmploymentTab } from "./LeadDetailEmploymentTab";
import { LeadDetailTutorMatchesTab } from "./LeadDetailTutorMatchesTab";
import {
  resolveProfileYouth,
  resolveYouthConstituent,
} from "../../lib/youthIdentity";
import { resolveCssrsOwnership } from "../../lib/cssrsOwnership";
import {
  cssrsAsTestRows,
  cssrsForAdmissionsRecord,
  cssrsForYouth,
  useCssrsAssessments,
} from "../../data/cssrsAssessmentStore";
import { saveCssrsScreener } from "../../data/cssrsScreenerSave";
import {
  activeScreenerQuestions,
  firstScreenerErrorKey,
  getScreenerAnswer,
  type ScreenerErrors,
} from "../../data/cssrsScreener";
import {
  emptyFullLifetimeResponses,
  upgradeFullLifetimeResponses,
  emptyScreenerResponses,
  type FullLifetimeResponses,
  type ScreenerResponses,
} from "../../data/cssrsTypes";
import { saveCssrsFullLifetime } from "../../data/cssrsFullLifetimeSave";
import { useRiskFactors } from "../../data/riskFactorStore";
import { deriveFullLifetimeRequirement } from "../../lib/cssrsRequirement";
import {
  fullLifetimeErrorOrder,
  validateFullLifetime,
} from "../../data/cssrsFullLifetimeRules";
import {
  CSSRS_FULL_LIFETIME_TEST,
  fullLifetimeFieldFocusId,
} from "./CssrsFullLifetimeFields";
import { getIncidentReports } from "../../data/mockYouthProgramData";
import { eligibleIncidentReports } from "../../lib/cssrsRelatedIr";
import {
  CSSRS_SCREENER_TEST,
  SCREENER_RELATED_IR_ID,
  screenerFocusId,
} from "./CssrsScreenerFields";
import { LeadDetailTutorScheduledSessionsTab } from "./LeadDetailTutorScheduledSessionsTab";
import { YouthAcademicsView } from "./YouthAcademicsView";
import { LeadDetailClassesTab } from "./LeadDetailClassesTab";
import { LeadDetailNeedsDialog } from "./LeadDetailNeedsDialog";
import { ConstituentDetailsView } from "./ConstituentDetailsView";
import { ConstituentContactView } from "./ConstituentContactView";
import { ConstituentRolesView } from "./ConstituentRolesView";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy, localTodayIso } from "../../lib/dateFormat";
import { addLeadIncident } from "../../data/leadIncidentStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { getDemoUserName } from "../../lib/demoIdentity";
import { ConstituentPassWorkspace } from "../passes/ConstituentPassWorkspace";

// Emergency Contact Relationship Types
const EMERGENCY_CONTACT_RELATIONSHIP_TYPES = [
  "Admissions Clinician",
  "Adoptive Brother",
  "Adoptive Daughter",
  "Adoptive Father",
  "Adoptive Granddaughter",
  "Adoptive Grandfather",
  "Adoptive Grandmother",
  "Adoptive Grandson",
  "Adoptive Mother",
  "Adoptive Sister",
  "Adoptive Son",
  "Advisee",
  "Advisor",
  "Aunt",
  "Brother",
  "Case Worker",
  "Cousin",
  "Father",
  "Foster Parent",
  "Grandfather",
  "Grandmother",
  "Grandparent",
  "Guardian",
  "Mother",
  "Other",
  "Sibling",
  "Sister",
  "Uncle",
];

// Physical/Medical Need Types
const PHYSICAL_MEDICAL_NEED_TYPES = [
  "Allergies",
  "Asthma",
  "Seizures",
  "Diabetes",
  "Other",
];

// Allergy Types
const ALLERGY_TYPES = [
  "Environmental",
  "Food",
  "Medical",
  "Animal/Bug/Insect",
];

// Dietary Need Types
const DIETARY_NEED_TYPES = [
  "Vegetarian",
  "No Red Meat",
  "No Chicken",
  "No Fish",
  "No Shellfish",
  "No Eggs",
  "No Pork",
  "No Dairy Products",
  "Vegetarian But Eats Fish",
  "Vegan",
  "Kosher",
  "Halal",
  "Celiac Disease",
  "Gluten Free",
  "Dairy Free",
  "Other",
];

// DSM Codes Library (migrated from Blueprint SQL Reference Library)
const DSM_CODES = {
  "DSM V": [
    {
      code: "F32.0",
      description:
        "Major Depressive Disorder, Single Episode, Mild",
    },
    {
      code: "F32.1",
      description:
        "Major Depressive Disorder, Single Episode, Moderate",
    },
    {
      code: "F32.2",
      description:
        "Major Depressive Disorder, Single Episode, Severe",
    },
    {
      code: "F32.9",
      description:
        "Major Depressive Disorder, Single Episode, Unspecified",
    },
    {
      code: "F33.0",
      description: "Major Depressive Disorder, Recurrent, Mild",
    },
    {
      code: "F33.1",
      description:
        "Major Depressive Disorder, Recurrent, Moderate",
    },
    {
      code: "F33.2",
      description:
        "Major Depressive Disorder, Recurrent, Severe",
    },
    { code: "F41.0", description: "Panic Disorder" },
    {
      code: "F41.1",
      description: "Generalized Anxiety Disorder",
    },
    {
      code: "F41.9",
      description: "Anxiety Disorder, Unspecified",
    },
    {
      code: "F43.10",
      description: "Post-Traumatic Stress Disorder",
    },
    {
      code: "F43.20",
      description: "Adjustment Disorder, Unspecified",
    },
    {
      code: "F43.21",
      description: "Adjustment Disorder with Depressed Mood",
    },
    {
      code: "F43.22",
      description: "Adjustment Disorder with Anxiety",
    },
    {
      code: "F43.23",
      description:
        "Adjustment Disorder with Mixed Anxiety and Depressed Mood",
    },
    {
      code: "F43.24",
      description:
        "Adjustment Disorder with Disturbance of Conduct",
    },
    {
      code: "F60.3",
      description: "Borderline Personality Disorder",
    },
    { code: "F84.0", description: "Autism Spectrum Disorder" },
    {
      code: "F90.0",
      description:
        "Attention-Deficit/Hyperactivity Disorder, Predominantly Inattentive",
    },
    {
      code: "F90.1",
      description:
        "Attention-Deficit/Hyperactivity Disorder, Predominantly Hyperactive",
    },
    {
      code: "F90.2",
      description:
        "Attention-Deficit/Hyperactivity Disorder, Combined Presentation",
    },
    {
      code: "F91.1",
      description: "Conduct Disorder, Childhood-Onset Type",
    },
    {
      code: "F91.2",
      description: "Conduct Disorder, Adolescent-Onset Type",
    },
    {
      code: "F91.3",
      description: "Oppositional Defiant Disorder",
    },
    {
      code: "F94.1",
      description: "Reactive Attachment Disorder",
    },
    {
      code: "F94.2",
      description: "Disinhibited Social Engagement Disorder",
    },
  ],
  "DSM IV": [
    {
      code: "296.21",
      description:
        "Major Depressive Disorder, Single Episode, Mild",
    },
    {
      code: "296.22",
      description:
        "Major Depressive Disorder, Single Episode, Moderate",
    },
    {
      code: "296.23",
      description:
        "Major Depressive Disorder, Single Episode, Severe",
    },
    {
      code: "296.31",
      description: "Major Depressive Disorder, Recurrent, Mild",
    },
    {
      code: "296.32",
      description:
        "Major Depressive Disorder, Recurrent, Moderate",
    },
    {
      code: "296.33",
      description:
        "Major Depressive Disorder, Recurrent, Severe",
    },
    {
      code: "300.01",
      description: "Panic Disorder Without Agoraphobia",
    },
    {
      code: "300.02",
      description: "Generalized Anxiety Disorder",
    },
    {
      code: "309.81",
      description: "Posttraumatic Stress Disorder",
    },
    {
      code: "309.0",
      description: "Adjustment Disorder with Depressed Mood",
    },
    {
      code: "309.24",
      description: "Adjustment Disorder with Anxiety",
    },
    {
      code: "309.28",
      description:
        "Adjustment Disorder with Mixed Anxiety and Depressed Mood",
    },
    {
      code: "309.3",
      description:
        "Adjustment Disorder with Disturbance of Conduct",
    },
    {
      code: "301.83",
      description: "Borderline Personality Disorder",
    },
    { code: "299.00", description: "Autistic Disorder" },
    {
      code: "314.00",
      description:
        "Attention-Deficit/Hyperactivity Disorder, Predominantly Inattentive Type",
    },
    {
      code: "314.01",
      description:
        "Attention-Deficit/Hyperactivity Disorder, Combined Type",
    },
    {
      code: "312.81",
      description: "Conduct Disorder, Childhood-Onset Type",
    },
    {
      code: "312.82",
      description: "Conduct Disorder, Adolescent-Onset Type",
    },
    {
      code: "313.81",
      description: "Oppositional Defiant Disorder",
    },
    {
      code: "313.89",
      description: "Reactive Attachment Disorder",
    },
  ],
};

// SLDS-style Pipeline Progress Bar
function PipelineTracker({
  currentStage,
  completedStages = [],
}: {
  currentStage: string;
  completedStages?: string[];
}) {
  const ADMISSION_STAGES = [
    "Referral",
    "Info Session",
    "Assessments",
    "Shadow & FPM",
    "Staffing",
    "Move-In",
  ];
  const currentIndex = ADMISSION_STAGES.indexOf(currentStage);

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex min-w-[600px] gap-[2px] rounded-full overflow-hidden">
        {ADMISSION_STAGES.map((stage, idx) => {
          let status = "upcoming";
          if (completedStages.includes(stage)) {
            status = "completed";
          } else if (idx === currentIndex) {
            status = "current";
          }
          const isFirst = idx === 0;
          const isLast = idx === ADMISSION_STAGES.length - 1;

          const arrowSize = "12px";
          let clipPath = `polygon(0 0, calc(100% - ${arrowSize}) 0, 100% 50%, calc(100% - ${arrowSize}) 100%, 0 100%, ${arrowSize} 50%)`;

          if (isFirst) {
            clipPath = `polygon(0 0, calc(100% - ${arrowSize}) 0, 100% 50%, calc(100% - ${arrowSize}) 100%, 0 100%)`;
          } else if (isLast) {
            clipPath = `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${arrowSize} 50%)`;
          }

          return (
            <div
              key={stage}
              className={`flex-1 h-10 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider relative transition-colors cursor-default ${
                status === "completed"
                  ? "bg-[#C8E6C9] text-[#1B5E20]"
                  : status === "current"
                    ? "bg-[#145F33] text-white"
                    : "bg-[#E5E5E5] text-gray-500"
              }`}
              style={{ clipPath }}
            >
              {status === "completed" && (
                <CheckCircle
                  className="h-4 w-4 flex-shrink-0"
                  strokeWidth={3}
                />
              )}
              <span className="px-2 truncate">{stage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Overview sub-sections, in sidebar order, for the General accordion. */
const GENERAL_NAV_ITEMS = [
  { key: "constituent-details", label: "Constituent Details" },
  { key: "cpi", label: "CPI" },
  { key: "relationships", label: "Relationships" },
  { key: "connections", label: "Connections" },
  { key: "documents", label: "Documents" },
  { key: "contact-log", label: "Contact Log" },
  { key: "roi-tracking", label: "ROI Tracking" },
] as const;

// MOCK Self Sufficiency Matrix v2 records for the Community Care page's
// Assessments screen (prototype data, not real records).
function communityCareSsmMock(memberOptions?: string[]) {
  const ssm = (
    id: number,
    date: string,
    rater: string,
    examiner: string,
    statuses: Record<string, string>,
    comment: string,
  ) => {
    const label: Record<string, string> = {
      housing: "Housing",
      employmentFinances: "Employment/Finances",
      food: "Food",
      transportation: "Transportation",
      adultEducation: "Adult Education",
    };
    return {
      id,
      date,
      test: "Self Sufficiency Matrix v2",
      summary: Object.entries(statuses)
        .map(([k, v]) => `${label[k]}: ${v}`)
        .join(", "),
      raterType: "",
      raterTypeOther: "",
      rater,
      ssmData: {
        examiner,
        examinerOther: "",
        ...Object.fromEntries(
          Object.entries(statuses).flatMap(([k, v]) => [
            [`${k}Status`, v],
            [`${k}Comment`, k === "housing" ? comment : ""],
          ]),
        ),
      },
    };
  };
  const pick = (...i: number[]) =>
    memberOptions ? i.map((n) => memberOptions[n]).filter(Boolean) : undefined;
  const withMembers = (rec: ReturnType<typeof ssm>, members?: string[]) =>
    members ? { ...rec, members } : rec;
  return [
    withMembers(ssm(1, "2026-10-28", "Demo Community Care Member", "Jeremy Karpen",
      { housing: "Building Capacity", employmentFinances: "Safe", food: "Empowered", transportation: "Safe" },
      "Signed a 12-month lease; rent is current."), pick(0, 1)),
    withMembers(ssm(2, "2026-09-15", "Demo Community Care Member", "Joe Wronka",
      { housing: "Safe", employmentFinances: "Vulnerable", food: "Safe", adultEducation: "Building Capacity" },
      "Moved into transitional housing."), pick(2)),
    withMembers(ssm(3, "2026-07-02", "Demo Community Care Member", "Jeremy Karpen",
      { housing: "Vulnerable", employmentFinances: "In Crisis", food: "Vulnerable", transportation: "Vulnerable" },
      "Staying with a relative while searching for an apartment."), pick(3, 4, 5)),
    withMembers(ssm(4, "2026-04-20", "Demo Community Care Member", "Emily Neal",
      { housing: "In Crisis", employmentFinances: "In Crisis", food: "Vulnerable" },
      "Recently left placement; no stable address yet."), pick(6)),
  ];
}

export function LeadDetailView({
  lead,
  onBack,
  onLeadUpdate,
  backLabel = "Admissions",
  profileExtras,
  hideConvertButton = false,
  hidePipelineProgress = false,
  hideStatusSelect = false,
  hideOtcDashboard = false,
  hideTreatmentPlanningTabs = [],
  useConstituentIncidentDialog = false,
  showTransitionSummary = false,
  initialTransitionSummaryId,
  initialOverviewSection = "constituent-details",
  useGeneralAccordion = false,
  initialTab,
  contentOnly = false,
  constituentPassId,
}: {
  lead: any;
  onBack: () => void;
  onLeadUpdate?: (leadId: string, updates: any) => void;
  backLabel?: string;
  /** Constituent profile extras (Observations, Referrals, Financial
   *  Support). Defaults to backLabel === "Constituents". */
  profileExtras?: boolean;
  hideConvertButton?: boolean;
  hidePipelineProgress?: boolean;
  hideStatusSelect?: boolean;
  hideOtcDashboard?: boolean;
  hideTreatmentPlanningTabs?: string[];
  useConstituentIncidentDialog?: boolean;
  /** Constituent Detail only — adds Treatment Planning > Transition Summary
   *  for Constituent Youth profiles (US 20101 / 20103). */
  showTransitionSummary?: boolean;
  /** Deep link (?section=transition-summary&summary=…): open Treatment
   *  Planning → Transition Summary on that summary. Ownership is rechecked
   *  by the workspace. */
  initialTransitionSummaryId?: string;
  /** Overview sub-section to open on — e.g. "documents" for a deep link
   *  (/constituents/:id?section=documents). */
  initialOverviewSection?: string;
  /** Optional, additive: tab to open first (default "overview"). */
  initialTab?: string;
  /** Optional, additive: render only the active tab's content (no profile
   *  header or left navigation). Used to embed one section elsewhere. */
  contentOnly?: boolean;
  /** Constituent Detail only — renames Overview to "General" and moves its
   *  sub-tabs into a left-nav accordion. Admissions keeps the horizontal
   *  sub-tab row (default false). */
  useGeneralAccordion?: boolean;
  /** Constituent Detail only — the Constituent whose Pass workspace is shown
   *  as the last General section. Passed only for a saved Individual
   *  Youth / Community Care Member; Admissions never sets it, so its
   *  navigation is unchanged. */
  constituentPassId?: number;
}) {
  // Role-based left nav helpers
  const isYouthNav =
    (lead as any).constituentType === "Individual" &&
    (lead as any).role === "Youth";
  // Community Care Member profile: an Individual whose saved role is
  // Community Care Member. Gets its own seven-item navigation and the
  // member-specific General views; it is never treated as a Youth.
  const isCommunityCareMemberNav =
    (lead as any).constituentType === "Individual" &&
    (lead as any).role === "Community Care Member";
  const memberConstituent = isCommunityCareMemberNav
    ? CONSTITUENTS.find((c) => String(c.id) === String(lead.id))
    : undefined;
  // Restricted nav: any Individual constituent whose role isn't Youth only gets Overview + Education and Vocation (Credentials/Specialty)
  const isRestrictedRoleNav =
    (lead as any).constituentType === "Individual" &&
    (lead as any).role !== "Youth" &&
    !isCommunityCareMemberNav;
  // Admissions module identifies itself via the default backLabel ("Admissions"); the
  // Constituents module always overrides backLabel (e.g. "Constituents"). Campus
  // Restrictions, General Information, and Education and Vocation are hidden only
  // when viewing an Admission record so the Constituents module is unaffected.
  const isAdmissionsModule = backLabel === "Admissions";
  // Observations + Referrals: Constituents page only (set below once
  // useMemberProfileNav is known).
  // Shared constituent-profile layout (left menu + Constituent Details tabs)
  // for Community Care Members and Constituent Youth. Admissions records and
  // every other role keep their existing navigation.
  // Decided by hasRole on the saved Constituent, so Youth only, Community
  // Care Member only, and Youth + Community Care Member all match.
  const profileConstituent = !isAdmissionsModule
    ? CONSTITUENTS.find((c) => String(c.id) === String(lead.id))
    : undefined;
  const useMemberProfileNav =
    isCommunityCareMemberNav ||
    (!isAdmissionsModule &&
      (isYouthNav ||
        (!!profileConstituent &&
          profileConstituent.type === "Individual" &&
          (hasRole(profileConstituent, "Youth") ||
            hasRole(profileConstituent, "Community Care Member")))));
  const showMemberExtras =
    useMemberProfileNav && (profileExtras ?? backLabel === "Constituents");
  // Admissions Pipeline category (Lead.status), US 20140. The saved category
  // comes from the shared store (baseline: the lead's own status); a chosen
  // change stays PENDING here until the Change Category dialog saves it.
  const categoryRead = useAdmissionsCategories();
  const savedCategory = isAdmissionsModule
    ? effectiveAdmissionsCategory(
        categoryRead,
        lead.id,
        lead.status ?? "",
      )
    : (lead.status ?? "");
  const [pendingCategory, setPendingCategory] = useState<
    string | null
  >(null);
  // Constituent Youth profile: lead.id is the Constituent ID (admissions
  // leads use "L-…" ids and are excluded).
  // Canonical Youth for the Connections and Tutor views (US 20093): the
  // Constituent ID on a Constituent profile, or an Admissions profile's
  // explicit youthConstituentId link — null when there is no such link.
  const linkedYouth =
    isCommunityCareMemberNav && memberConstituent
      ? // The member's own Constituent ID (never a Youth, never a name).
        { id: String(memberConstituent.id), name: memberConstituent.name }
      : resolveProfileYouth(
          lead as {
            id: string | number;
            youthConstituentId?: number;
          },
          isAdmissionsModule,
        );
  // Ownership for new C-SSRS assessments (US 20105 / 20139): this Admissions
  // record's id, the testing youth key and the verified Youth Constituent
  // (null when unverified). Foundation only — no C-SSRS form is exposed yet
  // and nothing reads this until the questionnaires land.
  const cssrsOwnership = resolveCssrsOwnership(
    lead as {
      id: string | number;
      youthId?: string;
      youthConstituentId?: number;
    },
    isAdmissionsModule,
  );
  // Transition Summary workspace (US 20101 / 20103): Constituent Youth
  // profiles only. undefined hides it; null means the owner can't be
  // verified as a Youth Constituent.
  const transitionSummaryYouth =
    showTransitionSummary && !isAdmissionsModule && isYouthNav
      ? resolveYouthConstituent(String(lead.id))
      : undefined;
  const youthConstituentId =
    !isAdmissionsModule &&
    (isYouthNav || isCommunityCareMemberNav) &&
    /^\d+$/.test(String(lead.id))
      ? Number(lead.id)
      : null;
  // Youth Documents (US 20147) owner scope, from verified records only: an
  // Admissions profile is owned by its own record id until an explicit Youth
  // link exists (then it resolves the same records as that Youth); a
  // Constituent Youth by its Constituent id. Never inferred from names.
  const documentScope = isAdmissionsModule
    ? admissionScope(String(lead.id))
    : linkedYouth
      ? youthScope(linkedYouth.id)
      : null;
  const documentOwnerName = documentScope
    ? scopeDisplayName(documentScope)
    : null;

  // Contact Log Dialog (SLDS) State
  const [contactLogDialogOpen, setContactLogDialogOpen] =
    useState(false);

  const handleContactLogDialogSubmit = (data: any) => {
    const callerFullName =
      `${data.callerFirstName} ${data.callerLastName}`.trim();
    const candidateFullName =
      data.candidateFirstName && data.candidateLastName
        ? `${data.candidateFirstName} ${data.candidateLastName}`.trim()
        : "N/A";

    const newLog: ContactLogType = {
      id: `CL-${String(CONTACT_LOGS.length + 1).padStart(3, "0")}`,
      referralDate: data.contactDate,
      caller: callerFullName,
      candidate: candidateFullName,
      phone: data.callerPhone,
      language: data.language,
      details: `${data.contactType || "Contact"} - ${data.contactResult || "No result specified"}${data.notes ? "\n" + data.notes : ""}`,
      needsFollowUp: data.needsFollowUp ? "Yes" : "No",
      promoted: false,
      mostRecentHistory: localTodayIso(),
    };

    CONTACT_LOGS.unshift(newLog);

    // If follow-up is needed, automatically create a Task
    if (data.needsFollowUp && data.followUpDueDate) {
      const taskDescription = `Follow-up from Contact Log (${data.category || "General"})

Original Contact Details:
${data.notes || "No details provided"}

${data.followUpNotes ? `Follow-up Notes:\n${data.followUpNotes}` : ""}

Contact Information:
- Date: ${formatMdy(new Date(data.contactDate))}
- Type: ${data.contactType || "N/A"}
- Result: ${data.contactResult || "N/A"}
- Caller: ${callerFullName}
- Candidate: ${candidateFullName}`;

      const newTask: TimelineActivity = {
        id: `task-${Date.now()}`,
        type: "task",
        title: `Follow-up: ${data.category || "Contact Log"} - ${candidateFullName}`,
        description: taskDescription,
        user: getDemoUserName(),
        timestamp: `${data.followUpDueDate}T09:00:00.000Z`,
        status: "pending",
        category: data.category
          ?.toLowerCase()
          .replace(/\s+/g, "_"),
      };

      setTimelineActivities((prev) => [newTask, ...prev]);
      toast.success(
        "Contact log created with follow-up task assigned to you",
      );
    } else {
      toast.success("Contact log created successfully");
    }
  };

  // Assign Academic Snapshot (US 19988) — manual quick action only; the task is
  // always related to the youth whose profile is open.
  const [
    academicSnapshotDialogOpen,
    setAcademicSnapshotDialogOpen,
  ] = useState(false);

  const handleAcademicSnapshotAssigned = ({
    task,
  }: AssignAcademicSnapshotResult) => {
    const details = [
      `Assigned To: ${task.assignedTo.name}`,
      `Due Date: ${task.dueDate || "None"}`,
      task.comments && `Comments: ${task.comments}`,
    ]
      .filter(Boolean)
      .join("\n");

    setTimelineActivities((prev) => [
      {
        id: task.id,
        type: "task",
        title: `${task.subject} (Academic Snapshot)`,
        description: details,
        user: task.createdBy,
        timestamp: task.createdAt,
        status: "pending",
      },
      ...prev,
    ]);
    toast.success(
      "Academic Snapshot task assigned successfully.",
      {
        description: `${task.assignedTo.name} was notified in-app and by email.`,
      },
    );
  };

  // Log Activity Dialog States
  const [logActivityOpen, setLogActivityOpen] = useState(false);
  const [activityType, setActivityType] = useState("note");
  const [activityDate, setActivityDate] = useState(
    localTodayIso(),
  );
  const [activityTime, setActivityTime] = useState(
    new Date().toTimeString().slice(0, 5),
  );
  const [activitySubject, setActivitySubject] = useState("");
  const [activityDescription, setActivityDescription] =
    useState("");

  // Activity Timeline State
  const [timelineActivities, setTimelineActivities] = useState<
    TimelineActivity[]
  >(() => getTimelineForAdmissionsLead(lead.id));

  // IR Dialog States
  const [selectedIncident, setSelectedIncident] =
    useState<any>(null);
  const [irDialogOpen, setIrDialogOpen] = useState(false);
  const [incidentTab, setIncidentTab] = useState("general");
  const [incidentType, setIncidentType] = useState("");
  const [incidentLocation, setIncidentLocation] = useState("");
  const [incidentStartDate, setIncidentStartDate] =
    useState("");
  const [incidentStartTime, setIncidentStartTime] =
    useState("");
  const [incidentEndDate, setIncidentEndDate] = useState("");
  const [incidentEndTime, setIncidentEndTime] = useState("");
  const [incidentOverview, setIncidentOverview] = useState("");
  const [incidentNarrative, setIncidentNarrative] =
    useState("");
  const [incidentResponse, setIncidentResponse] = useState("");
  const [
    incidentPersonsContacted,
    setIncidentPersonsContacted,
  ] = useState<
    Array<{
      id: number;
      name: string;
      relationship: string;
      contactTime: string;
    }>
  >([]);
  const [incidentYouthInjuries, setIncidentYouthInjuries] =
    useState<
      Array<{
        id: number;
        description: string;
        cause: string;
        firstAid: boolean;
        firstAidDetails: string;
      }>
    >([]);
  const [incidentRestraints, setIncidentRestraints] = useState<
    Array<{
      id: number;
      type: string;
      startTime: string;
      endTime: string;
      staffInvolved: string;
      reason: string;
    }>
  >([]);
  const [
    incidentDebriefParticipants,
    setIncidentDebriefParticipants,
  ] = useState<
    Array<{
      id: number;
      name: string;
      role: string;
      attendedDate: string;
    }>
  >([]);
  const [incidentDebriefNotes, setIncidentDebriefNotes] =
    useState("");
  const [incidentFinalized, setIncidentFinalized] =
    useState(false);
  const [irConfirm, setIrConfirm] = useState<
    "cancel" | "finalize" | null
  >(null);
  const irSubmittingRef = useRef(false);
  const [incidentYouthList, setIncidentYouthList] = useState<
    Array<{
      id: number;
      name: string;
      youthId: string;
      age: string;
      status: string;
      statusColor: string;
      program: string;
      initials: string;
      color: string;
      isPrimary: boolean;
    }>
  >([]);

  // Create New Incident Dialog States
  const [
    createIncidentDialogOpen,
    setCreateIncidentDialogOpen,
  ] = useState(false);
  const [newIncidentType, setNewIncidentType] = useState("");
  const [newIncidentOtherType, setNewIncidentOtherType] =
    useState("");
  const [
    newIncidentOtherTypeError,
    setNewIncidentOtherTypeError,
  ] = useState(false);
  const [newIncidentStartDate, setNewIncidentStartDate] =
    useState("");
  const [newIncidentStartTime, setNewIncidentStartTime] =
    useState("");
  const [newIncidentEndDate, setNewIncidentEndDate] =
    useState("");
  const [newIncidentEndTime, setNewIncidentEndTime] =
    useState("");
  const [newIncidentIndividuals, setNewIncidentIndividuals] =
    useState("");
  const [newIncidentProgram, setNewIncidentProgram] =
    useState("");
  const [
    newIncidentInvolvementType,
    setNewIncidentInvolvementType,
  ] = useState("");
  const [newIncidentLocation, setNewIncidentLocation] =
    useState("");
  const [newIncidentDescription, setNewIncidentDescription] =
    useState("");

  // DCFS Section State
  const [dcfsCaseStatus, setDcfsCaseStatus] =
    useState("Active");
  const [dcfsCaseNumber, setDcfsCaseNumber] = useState(
    "DCFS-2024-IL-8472639",
  );
  const [dcfsCaseworker, setDcfsCaseworker] =
    useState("Sarah Johnson");
  const [dcfsCaseworkerPhone, setDcfsCaseworkerPhone] =
    useState("(312) 555-0198");
  const [dcfsCaseworkerEmail, setDcfsCaseworkerEmail] =
    useState("s.johnson@dcfs.illinois.gov");
  const [dcfsRegionalOffice, setDcfsRegionalOffice] = useState(
    "Cook County - Chicago",
  );
  const [dcfsCaseOpenedDate, setDcfsCaseOpenedDate] =
    useState("03/15/2024");
  const [dcfsNextReviewDate, setDcfsNextReviewDate] =
    useState("02/15/2026");
  const [dcfsPlacementType, setDcfsPlacementType] = useState(
    "Residential Treatment",
  );
  const [dcfsPermanencyGoal, setDcfsPermanencyGoal] = useState(
    "Reunification with Parent",
  );
  const [dcfsCaseNotes, setDcfsCaseNotes] = useState(
    "Constituent placed in residential treatment following removal from home due to abuse and neglect. Family services plan includes parent counseling, substance abuse treatment for mother, and supervised visitation. Progress reviews scheduled quarterly. All DCFS documentation on file.",
  );

  // Feature A: Pipeline Stage — controls Pipeline Progress component
  const PIPELINE_STAGES = [
    "Referral",
    "Info Session",
    "Assessments",
    "Shadow & FPM",
    "Staffing",
    "Move-In",
  ];
  const [pipelineStage, setPipelineStage] =
    useState("Referral");
  const pipelineCompletedStages = PIPELINE_STAGES.slice(
    0,
    PIPELINE_STAGES.indexOf(pipelineStage),
  );

  const [savedDcfsData, setSavedDcfsData] = useState({
    caseStatus: "Active",
    caseNumber: "DCFS-2024-IL-8472639",
    caseworker: "Sarah Johnson",
    caseworkerPhone: "(312) 555-0198",
    caseworkerEmail: "s.johnson@dcfs.illinois.gov",
    regionalOffice: "Cook County - Chicago",
    caseOpenedDate: "03/15/2024",
    nextReviewDate: "02/15/2026",
    placementType: "Residential Treatment",
    permanencyGoal: "Reunification with Parent",
    caseNotes:
      "Constituent placed in residential treatment following removal from home due to abuse and neglect. Family services plan includes parent counseling, substance abuse treatment for mother, and supervised visitation. Progress reviews scheduled quarterly. All DCFS documentation on file.",
  });

  // Legal Involvement Records State
  const [legalInvolvementRecords, setLegalInvolvementRecords] =
    useState<LegalInvolvementRecord[]>([
      {
        id: 1,
        date: "2024-08-15",
        courtType: "Juvenile Court",
        levelOfCrime: "Misdemeanor",
        description:
          "Shoplifting incident at local store. Youth took items valued under $50.",
        status: "Resolved",
      },
      {
        id: 2,
        date: "2024-03-22",
        courtType: "Juvenile Court",
        levelOfCrime: "Status Offense",
        description:
          "Truancy - Multiple unexcused absences from school over 30-day period.",
        status: "Active",
      },
    ]);
  const [
    legalInvolvementDialogOpen,
    setLegalInvolvementDialogOpen,
  ] = useState(false);
  const [legalInvolvementMode, setLegalInvolvementMode] =
    useState<"view" | "edit" | "create">("create");
  const [editingLegalInvolvement, setEditingLegalInvolvement] =
    useState<LegalInvolvementRecord | null>(null);

  // DCFS Involvement Records State
  const [dcfsInvolvementRecords, setDcfsInvolvementRecords] =
    useState<DCFSInvolvementRecord[]>([
      {
        id: 1,
        investigationDate: "2024-03-15",
        incidentSummary:
          "Allegation of neglect - inadequate supervision and unsafe living conditions. Home visit conducted by DCFS investigator.",
        relatedIncident: "IR-2024-0315",
        resolution: "Indicated",
        resolutionDate: "2024-04-20",
      },
      {
        id: 2,
        investigationDate: "2023-11-08",
        incidentSummary:
          "Report of potential emotional abuse. Investigation included interviews with youth, family members, and school staff.",
        relatedIncident: "",
        resolution: "Unfounded",
        resolutionDate: "2023-12-15",
      },
    ]);
  const [
    dcfsInvolvementDialogOpen,
    setDcfsInvolvementDialogOpen,
  ] = useState(false);
  const [dcfsInvolvementMode, setDcfsInvolvementMode] =
    useState<"view" | "edit" | "create">("create");
  const [editingDcfsInvolvement, setEditingDcfsInvolvement] =
    useState<DCFSInvolvementRecord | null>(null);

  // Navigation States
  const openSummaryLink =
    !!initialTransitionSummaryId && !!transitionSummaryYouth;
  const [activeTab, setActiveTab] = useState(
    openSummaryLink ? (useMemberProfileNav ? "transitionSummary" : "treatmentPlanning") : (initialTab ?? "overview"),
  );
  const [activeOverviewSection, setActiveOverviewSection] =
    useState<string>(initialOverviewSection);
  // Re-apply the requested section when the URL or the constituent changes
  // while this instance is reused; manual sub-tab switches don't touch these
  // deps, so they are never overridden.
  useEffect(() => {
    setActiveTab(
      openSummaryLink ? (useMemberProfileNav ? "transitionSummary" : "treatmentPlanning") : (initialTab ?? "overview"),
    );
    setActiveOverviewSection(initialOverviewSection);
  }, [initialOverviewSection, lead.id, openSummaryLink, initialTab]);
  // General accordion expansion is independent of the selected sub-section,
  // but re-opens whenever a sub-section is requested (deep link, record
  // switch, or a callback) so the selection stays visible.
  const [generalExpanded, setGeneralExpanded] = useState(true);
  useEffect(() => {
    setGeneralExpanded(true);
  }, [activeOverviewSection, lead.id, initialOverviewSection]);
  const [activeClinicalSection, setActiveClinicalSection] =
    useState<string>("health-medical");
  const [clinicalExpanded, setClinicalExpanded] =
    useState(false);
  // Physical Health Connections is Youth-only; any other record falls back
  // to the standard Clinical Assessments view.
  const showPhysicalHealthConnections =
    activeClinicalSection === "physical-health-connections" &&
    youthConstituentId !== null;
  const [
    activeClinicalSubSection,
    setActiveClinicalSubSection,
  ] = useState<string>("biological");
  const [activeHealthSection, setActiveHealthSection] =
    useState<string | null>(null);
  const [activeMedicationSection, setActiveMedicationSection] =
    useState<string | null>(null);
  const [activePhysicalSection, setActivePhysicalSection] =
    useState<string>("general");
  const [
    activeSubstanceUseSection,
    setActiveSubstanceUseSection,
  ] = useState<string>("testing");
  const [activeIncidentSection, setActiveIncidentSection] =
    useState<string | null>(null);
  const [activeEducationSection, setActiveEducationSection] =
    useState<string>("academic");
  const [careerType, setCareerType] = useState<string>("");
  const [newSchoolRecommendation, setNewSchoolRecommendation] =
    useState<string>("");
  const [recommendedSchool, setRecommendedSchool] =
    useState<string>("");

  // School Lookup States
  const [schoolSearch, setSchoolSearch] = useState<string>("");
  const [selectedSchoolAccount, setSelectedSchoolAccount] =
    useState<{ id: string; name: string } | null>(null);
  const [showSchoolDropdown, setShowSchoolDropdown] =
    useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [newSchoolData, setNewSchoolData] = useState({
    name: "",
    schoolType: "",
    schoolLevel: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phoneNumber: "",
  });

  // Career Recommendations Multi-Select State
  const [careerRecommendations, setCareerRecommendations] =
    useState<string[]>([]);
  const [schoolComments, setSchoolComments] =
    useState<string>("");
  const [careerComment, setCareerComment] =
    useState<string>("");
  const [
    careerRecommendationComments,
    setCareerRecommendationComments,
  ] = useState<Record<string, string>>({});

  // Mock school accounts data
  const mockSchoolAccounts = [
    {
      id: "1",
      name: "Lincoln High School",
      type: "Public High School",
      level: "High School",
    },
    {
      id: "2",
      name: "Roosevelt Academy",
      type: "Private School",
      level: "Middle & High School",
    },
    {
      id: "3",
      name: "Washington Preparatory School",
      type: "Charter School",
      level: "High School",
    },
    {
      id: "4",
      name: "Jefferson Alternative High School",
      type: "Alternative School",
      level: "High School",
    },
    {
      id: "5",
      name: "Kennedy Vocational Institute",
      type: "Vocational School",
      level: "High School",
    },
    {
      id: "6",
      name: "Madison Technical Academy",
      type: "Technical School",
      level: "High School",
    },
    {
      id: "7",
      name: "Hamilton Charter School",
      type: "Charter School",
      level: "K-12",
    },
    {
      id: "8",
      name: "Franklin Academy",
      type: "Private School",
      level: "High School",
    },
    {
      id: "9",
      name: "Chicago Virtual Learning Center",
      type: "Online School",
      level: "K-12",
    },
  ];

  // Presenting Needs Dialog States
  const [needsDialogOpen, setNeedsDialogOpen] = useState(false);
  const [currentNeedsSection, setCurrentNeedsSection] =
    useState<
      | "psychiatric"
      | "behavioral"
      | "emotional"
      | "education"
      | null
    >(null);
  const [editingNeedsIndex, setEditingNeedsIndex] = useState<
    number | null
  >(null);
  const [needsFormData, setNeedsFormData] = useState({
    assessment: "",
    description: "",
    level: "",
    occurrences: "",
    needs: "",
    goals: "",
    gradeAtRelease: "",
    levelEvent: "",
    activity: "",
    comment: "",
  });

  // Recommendation/Referrals Table States
  const [referrals, setReferrals] = useState([
    {
      id: 1,
      recommendation: "Individual Therapy (Weekly)",
      dateApproved: "11/15/2025",
    },
    {
      id: 2,
      recommendation: "Group Therapy",
      dateApproved: "11/20/2025",
    },
    {
      id: 3,
      recommendation: "Educational Assessment",
      dateApproved: "12/01/2025",
    },
  ]);
  const [referralDialogOpen, setReferralDialogOpen] =
    useState(false);
  const [editingReferralId, setEditingReferralId] = useState<
    number | null
  >(null);
  const [referralFormData, setReferralFormData] = useState({
    recommendation: "",
    dateApproved: "",
  });

  // SAT Test States
  const [satDialogOpen, setSatDialogOpen] = useState(false);
  const [editingSatTestId, setEditingSatTestId] = useState<
    number | null
  >(null);
  const [satFormData, setSatFormData] = useState({
    totalScore: "",
    commentary: "",
  });
  const [satFormErrors, setSatFormErrors] = useState({
    totalScore: "",
  });
  const [satDocuments, setSatDocuments] = useState<
    Array<{
      id: number;
      name: string;
      size: number;
      type: string;
      uploadedDate: string;
      url: string;
    }>
  >([]);
  const [satDocumentViewerOpen, setSatDocumentViewerOpen] =
    useState(false);
  const [selectedSatDocument, setSelectedSatDocument] =
    useState<{
      id: number;
      name: string;
      size: number;
      type: string;
      uploadedDate: string;
      url: string;
    } | null>(null);
  const satFileInputRef = useRef<HTMLInputElement>(null);

  // ACT Test States
  const [actFormData, setActFormData] = useState({
    compositeScore: "",
    commentary: "",
  });
  const [actFormErrors, setActFormErrors] = useState({
    compositeScore: "",
  });

  // PLAN Test States
  const [planFormData, setPlanFormData] = useState({
    compositeScore: "",
    commentary: "",
  });
  const [planFormErrors, setPlanFormErrors] = useState({
    compositeScore: "",
  });

  // EXPLORE Test States
  const [exploreFormData, setExploreFormData] = useState({
    compositeScore: "",
    commentary: "",
  });
  const [exploreFormErrors, setExploreFormErrors] = useState({
    compositeScore: "",
  });

  // GAIN Test States
  const [gainFormData, setGainFormData] = useState({
    englishCompositeScore: "",
    mathCompositeScore: "",
    commentary: "",
  });
  const [gainFormErrors, setGainFormErrors] = useState({
    englishCompositeScore: "",
    mathCompositeScore: "",
  });
  const [gainDocuments, setGainDocuments] = useState<
    Array<{
      id: number;
      name: string;
      size: number;
      type: string;
      uploadedDate: string;
      url: string;
    }>
  >([]);
  const gainFileInputRef = useRef<HTMLInputElement>(null);

  // GED Official Test States
  const [gedOfficialFormData, setGedOfficialFormData] =
    useState({
      compositeScore: "",
      commentary: "",
    });
  const [gedOfficialFormErrors, setGedOfficialFormErrors] =
    useState({
      compositeScore: "",
    });
  const [gedOfficialDocuments, setGedOfficialDocuments] =
    useState<
      Array<{
        id: number;
        name: string;
        size: number;
        type: string;
        uploadedDate: string;
        url: string;
      }>
    >([]);
  const gedOfficialFileInputRef =
    useRef<HTMLInputElement>(null);

  // GED Ready Test States
  const [gedReadyFormData, setGedReadyFormData] = useState({
    compositeScore: "",
    commentary: "",
  });
  const [gedReadyFormErrors, setGedReadyFormErrors] = useState({
    compositeScore: "",
  });
  const [gedReadyDocuments, setGedReadyDocuments] = useState<
    Array<{
      id: number;
      name: string;
      size: number;
      type: string;
      uploadedDate: string;
      url: string;
    }>
  >([]);
  const gedReadyFileInputRef = useRef<HTMLInputElement>(null);

  // Casey Life Skills - Caregiver Test States
  const [caseyLifeSkillsFormData, setCaseyLifeSkillsFormData] =
    useState({
      dailyLiving: "",
      selfCare: "",
      relationshipsCommunication: "",
      housingMoneyManagement: "",
      workStudyLife: "",
      careerEducation: "",
      civicEngagement: "",
      navigatingChildWelfare: "",
      lookingForward: "",
      commentary: "",
    });
  const [
    caseyLifeSkillsFormErrors,
    setCaseyLifeSkillsFormErrors,
  ] = useState<Record<string, string>>({});
  const [
    caseyLifeSkillsDocuments,
    setCaseyLifeSkillsDocuments,
  ] = useState<
    Array<{
      id: string;
      name: string;
      size: number;
      uploadedDate: string;
    }>
  >([]);

  // Casey Life Skills - Youth Test States
  const [
    caseyLifeSkillsYouthFormData,
    setCaseyLifeSkillsYouthFormData,
  ] = useState({
    examiner: "",
    programScoresId: "",
    guardianScoresId: "",
    dailyLiving: "",
    selfCare: "",
    relationshipsCommunication: "",
    housingMoneyManagement: "",
    workStudyLife: "",
    careerEducation: "",
    civicEngagement: "",
    navigatingChildWelfare: "",
    lookingForward: "",
    commentary: "",
  });
  const [
    caseyLifeSkillsYouthFormErrors,
    setCaseyLifeSkillsYouthFormErrors,
  ] = useState<Record<string, string>>({});
  const [
    caseyLifeSkillsYouthDocuments,
    setCaseyLifeSkillsYouthDocuments,
  ] = useState<
    Array<{
      id: string;
      name: string;
      size: number;
      uploadedDate: string;
    }>
  >([]);

  // Employability and Life Skills Assessment States
  const [employabilityFormData, setEmployabilityFormData] =
    useState({
      // FUNDAMENTAL (Yes/No)
      appearanceHygiene: "",
      timeliness: "",
      oratoryPublicSpeaking: "",
      // WORK ETHIC/CHARACTER (1-3)
      attitude: "",
      accountabilityIntegrity: "",
      selfControl: "",
      ambitionInitiative: "",
      // PROBLEM SOLVING (1-3)
      supervision: "",
      procedureRuleFollowing: "",
      problemSolvingApproach: "",
      informationManagement: "",
      // INTERPERSONAL (1-3)
      verbalCommunication: "",
      activeListening: "",
      feedback: "",
      teamwork: "",
      // COMPUTER (1-3)
      computerLiteracy: "",
      // Commentary
      commentary: "",
    });

  // WJ-4 Test States
  const [wj4FormData, setWj4FormData] = useState({
    // Data Grid - 4 rows x 3 columns
    broadAchievementAE: "", // Age Equivalency: Years-Months format
    broadAchievementRPI: "", // RPI: ###/90 format
    broadAchievementPercentile: "", // Percentile: 0.01-100.00

    broadReadingAE: "",
    broadReadingRPI: "",
    broadReadingPercentile: "",

    broadMathAE: "",
    broadMathRPI: "",
    broadMathPercentile: "",

    broadWrittenLanguageAE: "",
    broadWrittenLanguageRPI: "",
    broadWrittenLanguagePercentile: "",

    commentary: "",
  });

  const [wj4FormErrors, setWj4FormErrors] = useState({
    broadAchievementAE: "",
    broadAchievementRPI: "",
    broadAchievementPercentile: "",
    broadReadingAE: "",
    broadReadingRPI: "",
    broadReadingPercentile: "",
    broadMathAE: "",
    broadMathRPI: "",
    broadMathPercentile: "",
    broadWrittenLanguageAE: "",
    broadWrittenLanguageRPI: "",
    broadWrittenLanguagePercentile: "",
  });

  // WJ-4 (Grade) Test States
  const [wj4GradeFormData, setWj4GradeFormData] = useState({
    // Data Grid - 4 rows x 3 columns
    broadAchievementGE: "", // Grade Equivalency: 0-17.9
    broadAchievementRPI: "", // RPI: ###/90 format
    broadAchievementPercentile: "", // Percentile: 0.01-100.00

    broadReadingGE: "",
    broadReadingRPI: "",
    broadReadingPercentile: "",

    broadMathGE: "",
    broadMathRPI: "",
    broadMathPercentile: "",

    broadWrittenLanguageGE: "",
    broadWrittenLanguageRPI: "",
    broadWrittenLanguagePercentile: "",

    commentary: "",
  });

  const [wj4GradeFormErrors, setWj4GradeFormErrors] = useState({
    broadAchievementGE: "",
    broadAchievementRPI: "",
    broadAchievementPercentile: "",
    broadReadingGE: "",
    broadReadingRPI: "",
    broadReadingPercentile: "",
    broadMathGE: "",
    broadMathRPI: "",
    broadMathPercentile: "",
    broadWrittenLanguageGE: "",
    broadWrittenLanguageRPI: "",
    broadWrittenLanguagePercentile: "",
  });

  // Case Information Edit Dialog States
  const [caseInfoEditOpen, setCaseInfoEditOpen] =
    useState(false);
  const [caseInfoFormData, setCaseInfoFormData] = useState({
    // Display copy only — never written back (the saved category lives in
    // admissionsCategoryStore).
    status: lead.status ?? "",
    type: "Residential",
    date: "12/11/2025",
    caseManager: "Sarah Johnson, MSW",
    guardians:
      "Maria Rodriguez (Mother), James Thompson (Uncle)",
    medicalConditions: "Asthma (controlled with inhaler), ADHD",
    intendedProgram: "A Program #2",
    category: "Closing",
    schoolType: "Current", // "Current" or "Intended"
    currentIntendedSchool: "Existing",
    grade: "Grade 10",
    iep504Plan: "Yes",
  });

  // Clinical Summary - Long Range Placement Plan States
  const [longRangePlacementPlan, setLongRangePlacementPlan] =
    useState("");
  const [placementPlanDetails, setPlacementPlanDetails] =
    useState("");

  // Additional Documentation Received States
  interface DocumentationReceived {
    id: number;
    documentationType: string;
    date: string;
  }
  const [documentationReceived, setDocumentationReceived] =
    useState<DocumentationReceived[]>([
      {
        id: 1,
        documentationType: "Psychological Records",
        date: "01/10/2025",
      },
      {
        id: 2,
        documentationType: "Psychological Records",
        date: "01/15/2025",
      },
      {
        id: 3,
        documentationType: "School Records",
        date: "01/18/2025",
      },
    ]);
  const [docReceivedDialogOpen, setDocReceivedDialogOpen] =
    useState(false);
  const [editingDocReceivedId, setEditingDocReceivedId] =
    useState<number | null>(null);
  const [docReceivedFormData, setDocReceivedFormData] =
    useState({
      documentationType: "",
      date: "",
    });

  // Documentation Releases Sent States
  interface ReleasesSent {
    id: number;
    releaseType: string;
    date: string;
  }
  const [releasesSent, setReleasesSent] = useState<
    ReleasesSent[]
  >([
    { id: 1, releaseType: "Hospital", date: "01/08/2025" },
    { id: 2, releaseType: "School", date: "01/12/2025" },
  ]);
  const [releasesSentDialogOpen, setReleasesSentDialogOpen] =
    useState(false);
  const [editingReleasesSentId, setEditingReleasesSentId] =
    useState<number | null>(null);
  const [releasesSentFormData, setReleasesSentFormData] =
    useState({
      releaseType: "",
      date: "",
    });

  // Covid Vaccination Status States
  interface VaccinationStatus {
    id: number;
    dose: string;
    date: string;
  }
  const [vaccinationStatus, setVaccinationStatus] = useState<
    VaccinationStatus[]
  >([
    { id: 1, dose: "1st Dose - Pfizer", date: "06/15/2024" },
    { id: 2, dose: "2nd Dose - Pfizer", date: "07/15/2024" },
  ]);
  const [vaccinationDialogOpen, setVaccinationDialogOpen] =
    useState(false);
  const [editingVaccinationId, setEditingVaccinationId] =
    useState<number | null>(null);
  const [vaccinationFormData, setVaccinationFormData] =
    useState({
      dose: "",
      date: "",
    });

  // Process Steps States
  interface ProcessStep {
    id: number;
    stepNumber: number;
    stepName: string;
    date: string;
    daysSincePrevious: string | number;
    recordId?: string;
    scheduleStatus?:
      "Scheduled" | "Attended" | "Schedule Connection" | "—";
  }

  // Mock data for sessions/meetings with attendance tracking
  const [mockInfoSessions] = useState([
    {
      id: "is-001",
      date: "12/18/2024",
      youthAttendance: "Yes",
      title: "General Info Session - December",
    },
    {
      id: "is-002",
      date: "12/10/2024",
      youthAttendance: "No",
      title: "Info Session - Early December",
    },
  ]);

  const [mockClinicalAssessments] = useState([
    {
      id: "ca-001",
      date: "12/22/2024",
      title: "Initial Clinical Assessment",
      assessor: "Dr. Johnson",
    },
    {
      id: "ca-002",
      date: "12/28/2024",
      title: "Follow-up Assessment",
      assessor: "Dr. Smith",
    },
  ]);

  const [mockAdmissionsShadows] = useState([
    {
      id: "as-001",
      date: "01/05/2025",
      youthAttendance: "Yes",
      title: "Campus Shadow Visit",
    },
    {
      id: "as-002",
      date: "12/30/2024",
      youthAttendance: "No",
      title: "Virtual Shadow Session",
    },
  ]);

  const [mockFamilyPartnershipMeetings] = useState([
    {
      id: "fpm-001",
      date: "01/12/2025",
      youthAttendance: "Yes",
      title: "Initial Family Partnership Meeting",
    },
    {
      id: "fpm-002",
      date: "01/08/2025",
      youthAttendance: "No",
      title: "Pre-meeting Consultation",
    },
  ]);

  const [mockStaffMeetings] = useState([
    {
      id: "sm-001",
      date: "01/19/2025",
      youthAttendance: "Yes",
      title: "Admissions Review Committee",
    },
    {
      id: "sm-002",
      date: "01/15/2025",
      youthAttendance: "No",
      title: "Preliminary Staff Discussion",
    },
  ]);

  // Youth record creation date (for Referral milestone)
  const youthRecordCreationDate = "12/11/2024";

  // Helper function to calculate days between two dates
  const calculateDaysBetween = (
    date1: string,
    date2: string,
  ): number => {
    if (!date1 || !date2) return 0;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper function to find earliest record with attendance = Yes
  const findEarliestWithAttendance = (records: any[]) => {
    const attendedRecords = records.filter(
      (r) => r.youthAttendance === "Yes",
    );
    if (attendedRecords.length === 0) return null;
    return attendedRecords.reduce((earliest, current) => {
      return new Date(current.date) < new Date(earliest.date)
        ? current
        : earliest;
    });
  };

  // Helper function to find earliest record (no attendance requirement)
  const findEarliest = (records: any[]) => {
    if (records.length === 0) return null;
    return records.reduce((earliest, current) => {
      return new Date(current.date) < new Date(earliest.date)
        ? current
        : earliest;
    });
  };

  // Calculate Process Steps based on milestones
  const calculateProcessSteps = (): ProcessStep[] => {
    const steps: ProcessStep[] = [];

    // Step 1: Referral
    const referralStep: ProcessStep = {
      id: 1,
      stepNumber: 1,
      stepName: "Referral",
      date: youthRecordCreationDate,
      daysSincePrevious: "N/A",
      scheduleStatus: "—",
    };
    steps.push(referralStep);

    // Step 2: Info Session (AC5: earliest record regardless of attendance)
    const infoSession = findEarliest(mockInfoSessions);
    const infoSessionAttended = infoSession
      ? mockInfoSessions.find(
          (r) =>
            r.id === infoSession.id &&
            r.youthAttendance === "Yes",
        )
      : null;
    const infoSessionStep: ProcessStep = {
      id: 2,
      stepNumber: 2,
      stepName: "Info Session",
      date: infoSession?.date || "",
      daysSincePrevious: infoSession
        ? calculateDaysBetween(
            referralStep.date,
            infoSession.date,
          )
        : "N/A",
      recordId: infoSession?.id,
      scheduleStatus: !infoSession
        ? "Schedule Connection"
        : infoSessionAttended
          ? "Attended"
          : "Scheduled",
    };
    steps.push(infoSessionStep);

    // Step 3: Clinical Assessment (AC4: earliest record regardless of attendance)
    const clinicalAssessment = findEarliest(
      mockClinicalAssessments,
    );
    const clinicalStep: ProcessStep = {
      id: 3,
      stepNumber: 3,
      stepName: "Clinical Assessment",
      date: clinicalAssessment?.date || "",
      daysSincePrevious:
        clinicalAssessment && infoSessionStep.date
          ? calculateDaysBetween(
              infoSessionStep.date,
              clinicalAssessment.date,
            )
          : "N/A",
      recordId: clinicalAssessment?.id,
      scheduleStatus: !clinicalAssessment
        ? "Schedule Connection"
        : "Scheduled",
    };
    steps.push(clinicalStep);

    // Step 4: Admissions Shadow (AC3: earliest with Youth attendance = Yes)
    const admissionsShadow = findEarliestWithAttendance(
      mockAdmissionsShadows,
    );
    const anyShadow = findEarliest(mockAdmissionsShadows);
    const shadowStep: ProcessStep = {
      id: 4,
      stepNumber: 4,
      stepName: "Admissions Shadow",
      date: admissionsShadow?.date || "",
      daysSincePrevious:
        admissionsShadow && clinicalStep.date
          ? calculateDaysBetween(
              clinicalStep.date,
              admissionsShadow.date,
            )
          : "N/A",
      recordId: admissionsShadow?.id,
      scheduleStatus: !anyShadow
        ? "Schedule Connection"
        : admissionsShadow
          ? "Attended"
          : "Scheduled",
    };
    steps.push(shadowStep);

    // Step 5: Family Partnership Meeting (AC2: earliest with Youth attendance = Yes)
    const fpmMeeting = findEarliestWithAttendance(
      mockFamilyPartnershipMeetings,
    );
    const anyFpm = findEarliest(mockFamilyPartnershipMeetings);
    const fpmStep: ProcessStep = {
      id: 5,
      stepNumber: 5,
      stepName: "Family Partnership Meeting",
      date: fpmMeeting?.date || "",
      daysSincePrevious:
        fpmMeeting && shadowStep.date
          ? calculateDaysBetween(
              shadowStep.date,
              fpmMeeting.date,
            )
          : "N/A",
      recordId: fpmMeeting?.id,
      scheduleStatus: !anyFpm
        ? "Schedule Connection"
        : fpmMeeting
          ? "Attended"
          : "Scheduled",
    };
    steps.push(fpmStep);

    // Step 6: Staff Meeting (AC1: earliest with Youth attendance = Yes)
    const staffMeeting = findEarliestWithAttendance(
      mockStaffMeetings,
    );
    const anyStaff = findEarliest(mockStaffMeetings);
    const staffStep: ProcessStep = {
      id: 6,
      stepNumber: 6,
      stepName: "Staff Meeting",
      date: staffMeeting?.date || "",
      daysSincePrevious:
        staffMeeting && fpmStep.date
          ? calculateDaysBetween(
              fpmStep.date,
              staffMeeting.date,
            )
          : "N/A",
      recordId: staffMeeting?.id,
      scheduleStatus: !anyStaff
        ? "Schedule Connection"
        : staffMeeting
          ? "Attended"
          : "Scheduled",
    };
    steps.push(staffStep);

    return steps;
  };

  const [processSteps, setProcessSteps] = useState<
    ProcessStep[]
  >(calculateProcessSteps());

  // AC11: Admissions Finalization State - when true, Process Steps become read-only
  const [isAdmissionsFinalized, setIsAdmissionsFinalized] =
    useState(false);

  const [processStepsData, setProcessStepsData] = useState({
    lastContactDate: "01/15/2025",
    cadcEvaluation: "Yes",
    substanceUseAssessmentComplete: "",
    substanceUseConnectionLink: "",
    comments:
      "Constituent expressed strong interest in the residential program. Family is very engaged and supportive. Waiting on final medical records to complete application.",
  });

  // Info Session Dialog (opened from Process Steps hyperlinks)
  const [
    isStepInfoSessionDialogOpen,
    setIsStepInfoSessionDialogOpen,
  ] = useState(false);
  const [
    isStepClinicalAssessmentDialogOpen,
    setIsStepClinicalAssessmentDialogOpen,
  ] = useState(false);
  const [
    isStepAdmissionsShadowDialogOpen,
    setIsStepAdmissionsShadowDialogOpen,
  ] = useState(false);
  const [
    isStepFamilyPartnershipMeetingDialogOpen,
    setIsStepFamilyPartnershipMeetingDialogOpen,
  ] = useState(false);
  const [
    isStepStaffMeetingDialogOpen,
    setIsStepStaffMeetingDialogOpen,
  ] = useState(false);

  const handleStepNameClick = (
    stepName: string,
    recordId?: string,
  ) => {
    // Referral has no hyperlink
    if (stepName === "Referral") {
      return;
    }

    if (stepName === "Info Session") {
      setIsStepInfoSessionDialogOpen(true);
    } else if (stepName === "Clinical Assessment") {
      setIsStepClinicalAssessmentDialogOpen(true);
    } else if (stepName === "Admissions Shadow") {
      setIsStepAdmissionsShadowDialogOpen(true);
    } else if (stepName === "Family Partnership Meeting") {
      setIsStepFamilyPartnershipMeetingDialogOpen(true);
    } else if (stepName === "Staff Meeting") {
      setIsStepStaffMeetingDialogOpen(true);
    } else {
      toast.info(`Opening ${stepName} details...`);
    }
  };

  // Recommendation Reference Grid Table States
  const [references, setReferences] = useState([
    {
      id: 1,
      mentor: "Dr. Emily Martinez",
      email: "e.martinez@mercyhome.org",
      comment: "Primary therapist assigned",
    },
    {
      id: 2,
      mentor: "James Wilson",
      email: "j.wilson@mercyhome.org",
      comment: "Educational coordinator",
    },
  ]);
  const [referenceDialogOpen, setReferenceDialogOpen] =
    useState(false);
  const [editingReferenceId, setEditingReferenceId] = useState<
    number | null
  >(null);
  const [referenceFormData, setReferenceFormData] = useState({
    mentor: "",
    email: "",
    comment: "",
  });

  // Presenting Needs Table Data
  const [psychiatricData, setPsychiatricData] = useState([
    {
      id: 1,
      assessment: "Depression",
      description: "Ongoing",
      level: "Assistance",
      occurrences: "-",
      needs: "Moderate",
      goals: "n/a",
    },
  ]);
  const [behavioralData, setBehavioralData] = useState([
    {
      id: 1,
      assessment: "Assessment - Ongoing",
      description: "Group Member",
      level: "Assistance",
      occurrences: "-",
      needs: "Major",
      goals: "-",
    },
  ]);
  const [emotionalData, setEmotionalData] = useState<any[]>([]);
  const [educationData, setEducationData] = useState([
    {
      id: 1,
      gradeAtRelease: "11/18/2020",
      levelEvent: "Assessment - Ongoing",
      activity: "Group Member",
      comment: "n/a",
    },
  ]);

  // Physical Health - Emergency Contacts States
  const [emergencyContacts, setEmergencyContacts] = useState([
    {
      id: 1,
      sortOrder: 1,
      name: "Maria Rodriguez",
      relationship: "Mother",
      phone: "(312) 555-0142",
      address: "1234 W Madison St, Chicago, IL 60607",
      isPrimary: true,
    },
    {
      id: 2,
      sortOrder: 2,
      name: "James Thompson",
      relationship: "Uncle",
      phone: "(773) 555-0198",
      address: "567 N Clark St, Chicago, IL 60654",
      isPrimary: false,
    },
    {
      id: 3,
      sortOrder: 3,
      name: "Sarah Williams",
      relationship: "Aunt",
      phone: "(312) 555-0176",
      address: "890 S Michigan Ave, Chicago, IL 60605",
      isPrimary: false,
    },
  ]);
  const [
    emergencyContactDialogOpen,
    setEmergencyContactDialogOpen,
  ] = useState(false);
  const [
    editingEmergencyContactId,
    setEditingEmergencyContactId,
  ] = useState<number | null>(null);
  const [
    emergencyContactFormData,
    setEmergencyContactFormData,
  ] = useState({
    sortOrder: "",
    name: "",
    relationship: "",
    phone: "",
    address: "",
  });
  const [inlineEditingECId, setInlineEditingECId] = useState<
    number | null
  >(null);
  const [inlineECEditData, setInlineECEditData] = useState({
    name: "",
    relationship: "",
    phone: "",
    address: "",
  });
  const [isAddingInlineEC, setIsAddingInlineEC] =
    useState(false);
  const [inlineECAddData, setInlineECAddData] = useState({
    name: "",
    relationship: "",
    phone: "",
    address: "",
  });

  // Physical Health - Medical Professionals States
  const [medicalProfessionals, setMedicalProfessionals] =
    useState([
      {
        id: 1,
        type: "Primary Care Physician",
        name: "Dr. Jennifer Martinez, MD",
        phone: "(312) 555-0234",
        address:
          "Northwestern Medical Center, 251 E Huron St, Chicago, IL 60611",
      },
      {
        id: 2,
        type: "Psychiatrist",
        name: "Dr. Michael Chen, MD",
        phone: "(773) 555-0287",
        address:
          "Rush University Medical Center, 1620 W Harrison St, Chicago, IL 60612",
      },
      {
        id: 3,
        type: "Dentist",
        name: "Dr. Robert Anderson, DDS",
        phone: "(312) 555-0156",
        address:
          "Chicago Dental Associates, 645 N Michigan Ave, Chicago, IL 60611",
      },
      {
        id: 4,
        type: "Therapist",
        name: "Lisa Thompson, LCSW",
        phone: "(773) 555-0312",
        address:
          "Family Counseling Center, 1901 W Harrison St, Chicago, IL 60612",
      },
    ]);
  const [
    medicalProfessionalDialogOpen,
    setMedicalProfessionalDialogOpen,
  ] = useState(false);
  const [
    editingMedicalProfessionalId,
    setEditingMedicalProfessionalId,
  ] = useState<number | null>(null);
  const [
    medicalProfessionalFormData,
    setMedicalProfessionalFormData,
  ] = useState({
    type: "",
    name: "",
    phone: "",
    address: "",
  });

  // Physical Health - Medical Professionals States
  const [keyMedicalDates, setKeyMedicalDates] = useState({
    annualPhysical: "12/15/2025",
    annualPhysicalConnectionId: "conn-annual-001",
    biannualDental: "08/22/2025",
    biannualDentalConnectionId: "conn-dental-001",
    hearing: "03/10/2025",
    hearingConnectionId: "conn-hearing-001",
    vision: "03/10/2025",
    visionConnectionId: "conn-vision-001",
    tbTest: "11/05/2025",
    tbTestConnectionId: "doc-tbtest-001",
    immunizations: "09/12/2025",
    immunizationsConnectionId: "doc-immunization-001",
  });
  const [medicalDateDialogOpen, setMedicalDateDialogOpen] =
    useState(false);
  const [editingMedicalDateType, setEditingMedicalDateType] =
    useState<string>("");
  const [medicalDateFormData, setMedicalDateFormData] =
    useState("");

  // Mock medical appointment connection records
  const mockMedicalConnections = [
    {
      id: "conn-annual-001",
      type: "Annual Physical Appointment",
      startDate: "12/15/2025",
      endDate: "12/15/2025",
      startTime: "10:00",
      endTime: "11:00",
      attended: true,
      participants: "Maria Rodriguez (Youth)",
      programs: "Residential",
      homeVisit: false,
      location: "Northwestern Medical Center",
      department: "Health Services",
      summary:
        "Annual physical examination completed. Youth is in good health. Updated immunization records. Prescribed new allergy medication.",
      reason: "Annual wellness check",
      diagnosis: "Seasonal allergies",
      newMedicationPrescribed: true,
    },
    {
      id: "conn-dental-001",
      type: "Dentist Appointment",
      startDate: "08/22/2025",
      endDate: "08/22/2025",
      startTime: "14:00",
      endTime: "15:00",
      attended: true,
      participants: "Maria Rodriguez (Youth)",
      programs: "Residential",
      homeVisit: false,
      location: "Chicago Dental Care",
      department: "Health Services",
      summary:
        "Routine dental cleaning and examination completed. No cavities found. Proper oral hygiene discussed.",
      biannualDentalRequirement: true,
      followUp: "Schedule next cleaning in 6 months",
    },
    {
      id: "conn-hearing-001",
      type: "Hearing Doctor Appointment",
      startDate: "03/10/2025",
      endDate: "03/10/2025",
      startTime: "09:30",
      endTime: "10:30",
      attended: true,
      participants: "Maria Rodriguez (Youth)",
      programs: "Residential",
      homeVisit: false,
      location: "Illinois Audiology Center",
      department: "Health Services",
      summary:
        "Hearing test conducted. Results show normal hearing in both ears. No concerns at this time.",
    },
    {
      id: "conn-vision-001",
      type: "Eye Doctor Appointment",
      startDate: "03/10/2025",
      endDate: "03/10/2025",
      startTime: "13:00",
      endTime: "14:00",
      attended: true,
      participants: "Maria Rodriguez (Youth)",
      programs: "Residential",
      homeVisit: false,
      location: "Vision Care Specialists",
      department: "Health Services",
      summary:
        "Eye examination completed. Prescription updated for corrective lenses. New glasses ordered.",
    },
    {
      id: "doc-tbtest-001",
      type: "TB Test Record",
      startDate: "11/05/2025",
      testDate: "11/05/2025",
      readDate: "11/07/2025",
      result: "Negative",
      document: "TB_Test_Result_11052025.pdf",
      participants: "Maria Rodriguez (Youth)",
      programs: "Residential",
      location: "Northwestern Medical Center",
      department: "Health Services",
      summary:
        "TB skin test administered on 11/05/2025. Test read on 11/07/2025. Result: Negative. Document on file.",
    },
    {
      id: "doc-immunization-001",
      type: "Immunization Record",
      startDate: "09/12/2025",
      documentDate: "09/12/2025",
      dateReceived: "09/15/2025",
      document: "Immunization_Record_09122025.pdf",
      participants: "Maria Rodriguez (Youth)",
      programs: "Residential",
      location: "Cook County Health Department",
      department: "Health Services",
      summary:
        "Immunization records received on 09/15/2025. Document date 09/12/2025. All required immunizations current. Document on file.",
    },
  ];

  // Medical Connection Details Modal State
  const [
    viewMedicalConnectionModalOpen,
    setViewMedicalConnectionModalOpen,
  ] = useState(false);
  const [
    viewingMedicalConnection,
    setViewingMedicalConnection,
  ] = useState<any | null>(null);

  // Physical Health - Insurance States
  const [insurancePolicies, setInsurancePolicies] = useState([
    {
      id: 1,
      type: "Medical",
      startDate: "01/01/2025",
      endDate: "12/31/2025",
      subscriber: "Maria Rodriguez",
      provider: "Blue Cross Blue Shield",
      policyNumber: "BCBS-IL-8472639",
    },
    {
      id: 2,
      type: "Dental",
      startDate: "01/01/2025",
      endDate: "12/31/2025",
      subscriber: "Maria Rodriguez",
      provider: "Delta Dental",
      policyNumber: "DD-IL-5639284",
    },
  ]);
  const [insuranceDialogOpen, setInsuranceDialogOpen] =
    useState(false);
  const [editingInsuranceId, setEditingInsuranceId] = useState<
    number | null
  >(null);
  const [insuranceFormData, setInsuranceFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    subscriber: "",
    provider: "",
    policyNumber: "",
  });

  // Physical Health - Medical & Physical Needs States
  const [medicalNeeds, setMedicalNeeds] = useState<any[]>([
    {
      id: 1,
      type: "Allergies",
      allergyType: "Environmental",
      startDate: "03/15/2022",
      endDate: "",
      details:
        "Seasonal allergies - pollen, dust mites. Requires antihistamine during spring/fall.",
      dietary: false,
      relatedDocument: "",
      other: "",
    },
    {
      id: 2,
      type: "Asthma",
      allergyType: "",
      startDate: "01/10/2023",
      endDate: "",
      details:
        "Asthma - mild persistent. Prescribed albuterol inhaler as needed and daily controller medication.",
      dietary: false,
      relatedDocument: "",
      other: "",
    },
    {
      id: 3,
      type: "Allergies",
      allergyType: "Food",
      startDate: "09/12/2019",
      endDate: "",
      details:
        "Severe allergy to all tree nuts (almonds, walnuts, cashews). Risk of anaphylaxis. EpiPen required at all times.",
      dietary: true,
      dietaryNeedType: "Other",
      dietaryNeedOther: "Tree Nuts",
      isFoodAllergy: "Yes",
      relatedDocument: "",
      other: "",
    },
  ]);
  const [medicalNeedDialogOpen, setMedicalNeedDialogOpen] =
    useState(false);
  const [editingMedicalNeedId, setEditingMedicalNeedId] =
    useState<number | null>(null);
  const [medicalNeedFormData, setMedicalNeedFormData] =
    useState({
      type: "",
      allergyType: "",
      startDate: "",
      endDate: "",
      details: "",
      dietary: false,
      dietaryNeedType: "",
      dietaryNeedOther: "",
      isFoodAllergy: "Yes",
      relatedDocument: "",
      other: "",
    });

  // Physical Health - Dietary Needs States (cross-populated from Medical Needs)
  const [dietaryNeedDialogOpen, setDietaryNeedDialogOpen] =
    useState(false);
  const [editingDietaryNeedId, setEditingDietaryNeedId] =
    useState<number | null>(null);
  const [dietaryNeedFormData, setDietaryNeedFormData] =
    useState({
      dietaryNeedType: "",
      dietaryNeedOther: "",
      isFoodAllergy: "Yes",
      startDate: "",
      endDate: "",
      details: "",
      dietary: true, // Always true for dietary section
      type: "", // Auto-populated
      allergyType: "", // Auto-populated
      relatedDocument: "",
      other: "",
    });

  // Computed fields for Case Details - Medical Needs (filtered by active date range)
  const physicalHealthConditions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeRecords = medicalNeeds.filter((need) => {
      // Parse start date (MM/DD/YYYY format)
      const [startMonth, startDay, startYear] = need.startDate
        .split("/")
        .map(Number);
      const startDate = new Date(
        startYear,
        startMonth - 1,
        startDay,
      );

      // Check if start date <= today
      if (startDate > today) return false;

      // Check end date if it exists
      if (need.endDate) {
        const [endMonth, endDay, endYear] = need.endDate
          .split("/")
          .map(Number);
        const endDate = new Date(endYear, endMonth - 1, endDay);
        if (endDate < today) return false;
      }

      // Filter for physical health: not allergies and not dietary
      return need.type !== "Allergies" && !need.dietary;
    });

    if (activeRecords.length === 0) return "N/A";

    return activeRecords
      .map((record) => {
        const displayType =
          record.type === "Other" ? record.other : record.type;
        return `${displayType}: ${record.details}`;
      })
      .join("; ");
  }, [medicalNeeds]);

  const allergiesConditions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeRecords = medicalNeeds.filter((need) => {
      // Parse start date
      const [startMonth, startDay, startYear] = need.startDate
        .split("/")
        .map(Number);
      const startDate = new Date(
        startYear,
        startMonth - 1,
        startDay,
      );

      if (startDate > today) return false;

      if (need.endDate) {
        const [endMonth, endDay, endYear] = need.endDate
          .split("/")
          .map(Number);
        const endDate = new Date(endYear, endMonth - 1, endDay);
        if (endDate < today) return false;
      }

      // Filter for allergies: type is Allergies and not dietary
      return need.type === "Allergies" && !need.dietary;
    });

    if (activeRecords.length === 0) return "N/A";

    return activeRecords
      .map((record) => {
        return `${record.allergyType}: ${record.details}`;
      })
      .join("; ");
  }, [medicalNeeds]);

  const dietaryNeedsFormatted = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeRecords = medicalNeeds.filter((need) => {
      // Parse start date
      const [startMonth, startDay, startYear] = need.startDate
        .split("/")
        .map(Number);
      const startDate = new Date(
        startYear,
        startMonth - 1,
        startDay,
      );

      if (startDate > today) return false;

      if (need.endDate) {
        const [endMonth, endDay, endYear] = need.endDate
          .split("/")
          .map(Number);
        const endDate = new Date(endYear, endMonth - 1, endDay);
        if (endDate < today) return false;
      }

      // Filter for dietary needs
      return need.dietary === true;
    });

    if (activeRecords.length === 0) return "N/A";

    return activeRecords
      .map((record) => {
        const displayType =
          record.dietaryNeedType === "Other"
            ? record.dietaryNeedOther
            : record.dietaryNeedType;
        return `${displayType}: ${record.details}`;
      })
      .join("; ");
  }, [medicalNeeds]);

  // Mental Health - Diagnoses States
  const [diagnoses, setDiagnoses] = useState([
    {
      id: 1,
      startDate: "03/15/2024",
      dsmVersion: "DSM V",
      code: "F32.1",
      details:
        "Major Depressive Disorder, Single Episode, Moderate",
      endDate: "",
      preliminary: true,
      progressNotes: [
        {
          id: 1,
          date: "03/15/2024",
          comment:
            "Initial diagnosis during admissions assessment",
          createdBy: "Dr. Emily Martinez",
        },
        {
          id: 2,
          date: "04/20/2024",
          comment:
            "Youth showing improvement with therapy and medication management",
          createdBy: "Sarah Johnson, LCSW",
        },
      ],
    },
    {
      id: 2,
      startDate: "05/22/2024",
      dsmVersion: "DSM V",
      code: "F41.1",
      details: "Generalized Anxiety Disorder",
      endDate: "",
      preliminary: true,
      progressNotes: [
        {
          id: 1,
          date: "05/22/2024",
          comment:
            "Diagnosis confirmed after comprehensive evaluation",
          createdBy: "Dr. Emily Martinez",
        },
      ],
    },
    {
      id: 3,
      startDate: "01/10/2023",
      dsmVersion: "DSM V",
      code: "F43.10",
      details: "Post-Traumatic Stress Disorder",
      endDate: "11/20/2024",
      preliminary: false,
      progressNotes: [
        {
          id: 1,
          date: "01/10/2023",
          comment:
            "PTSD diagnosis following trauma history review",
          createdBy: "Dr. Robert Chen",
        },
        {
          id: 2,
          date: "06/15/2023",
          comment:
            "Significant progress with trauma-focused CBT",
          createdBy: "Sarah Johnson, LCSW",
        },
        {
          id: 3,
          date: "11/20/2024",
          comment: "Symptoms resolved, diagnosis closed",
          createdBy: "Dr. Emily Martinez",
        },
      ],
    },
  ]);
  const [diagnosisDialogOpen, setDiagnosisDialogOpen] =
    useState(false);
  const [editingDiagnosisId, setEditingDiagnosisId] = useState<
    number | null
  >(null);
  const [diagnosisFormData, setDiagnosisFormData] = useState({
    startDate: "",
    dsmVersion: "DSM V",
    code: "",
    details: "",
    endDate: "",
    preliminary: true,
  });
  const [diagnosisActiveTab, setDiagnosisActiveTab] =
    useState("details");
  const [diagnosisSortColumn, setDiagnosisSortColumn] =
    useState<string | null>(null);
  const [diagnosisSortDirection, setDiagnosisSortDirection] =
    useState<"asc" | "desc">("asc");

  // Progress tracking state
  const [progressNoteFormData, setProgressNoteFormData] =
    useState({
      date: localTodayIso(),
      comment: "",
      createdBy: getDemoUserName(), // In production, this would be from auth context
    });

  // Mental Health - Professionals States
  const [
    mentalHealthProfessionals,
    setMentalHealthProfessionals,
  ] = useState([
    {
      id: 1,
      type: "Psychiatrist",
      name: "Dr. Emily Martinez, MD",
      phone: "(312) 555-0198",
      address:
        "Northwestern Medical Center, 251 E Huron St, Chicago, IL 60611",
    },
    {
      id: 2,
      type: "Therapist",
      name: "Sarah Johnson, LCSW",
      phone: "(773) 555-0234",
      address:
        "Mercy Home Counseling Center, 1140 W Jackson Blvd, Chicago, IL 60607",
    },
    {
      id: 3,
      type: "Case Manager",
      name: "Michael Davis, MSW",
      phone: "(312) 555-0176",
      address:
        "Mercy Home Administrative Office, 1140 W Jackson Blvd, Chicago, IL 60607",
    },
  ]);
  const [
    mentalHealthProfessionalDialogOpen,
    setMentalHealthProfessionalDialogOpen,
  ] = useState(false);
  const [
    editingMentalHealthProfessionalId,
    setEditingMentalHealthProfessionalId,
  ] = useState<number | null>(null);
  const [
    mentalHealthProfessionalFormData,
    setMentalHealthProfessionalFormData,
  ] = useState({
    type: "",
    name: "",
    phone: "",
    address: "",
  });

  // Substance Use - Test States
  const [substanceUseTests, setSubstanceUseTests] = useState([
    {
      id: 1,
      dateTime: "12/15/2025, 9:30 AM",
      reason: "Program Random Test",
      newUse: "No",
      testDetails: [
        {
          id: 1,
          testType: "Instant Test",
          testPanel: "iCup Instant 10-Panel",
          relatedTest: "",
          refusalDetail: "",
          resultsDate: "12/15/2025",
          results: "Negative",
          testResults: [
            {
              id: 1,
              substance: "THC",
              result: "Negative",
              level: "",
              units: "",
            },
            {
              id: 2,
              substance: "Cocaine",
              result: "Negative",
              level: "",
              units: "",
            },
            {
              id: 3,
              substance: "Opiates",
              result: "Negative",
              level: "",
              units: "",
            },
          ],
        },
      ],
      substanceResults: [],
      suspectTampering: false,
      tamperingComments: "",
      labConsultation: "",
      action: "",
      refrigeratorDate: "",
      pickupDate: "",
      discardDate: "",
      discardReason: "",
    },
    {
      id: 2,
      dateTime: "11/15/2025, 2:15 PM",
      reason: "Suspicion of Use",
      newUse: "No",
      testDetails: [
        {
          id: 1,
          testType: "Lab Test",
          testPanel: "",
          relatedTest: "",
          refusalDetail: "",
          resultsDate: "11/18/2025",
          results: "Positive",
          testResults: [
            {
              id: 1,
              substance: "THC",
              result: "Positive",
              level: "50",
              units: "ng/mL",
            },
            {
              id: 2,
              substance: "Amphetamines",
              result: "Positive",
              level: "1000",
              units: "ng/mL",
            },
            {
              id: 3,
              substance: "Cocaine",
              result: "Negative",
              level: "",
              units: "",
            },
          ],
        },
      ],
      substanceResults: [],
      suspectTampering: false,
      tamperingComments: "",
      labConsultation: "",
      action: "",
      refrigeratorDate: "",
      pickupDate: "",
      discardDate: "",
      discardReason: "",
    },
    {
      id: 3,
      dateTime: "10/15/2025, 10:00 AM",
      reason: "Admissions Test",
      newUse: "Pending",
      testDetails: [],
      substanceResults: [],
      suspectTampering: false,
      tamperingComments: "",
      labConsultation: "",
      action: "",
      refrigeratorDate: "",
      pickupDate: "",
      discardDate: "",
      discardReason: "",
    },
  ]);
  const [
    substanceUseTestDialogOpen,
    setSubstanceUseTestDialogOpen,
  ] = useState(false);
  const [testDetailsDialogOpen, setTestDetailsDialogOpen] =
    useState(false);
  const [viewingTestId, setViewingTestId] = useState<
    number | null
  >(null);
  const [
    editingSubstanceUseTestId,
    setEditingSubstanceUseTestId,
  ] = useState<number | null>(null);
  const [
    substanceUseTestFormData,
    setSubstanceUseTestFormData,
  ] = useState({
    date: "",
    time: "",
    reason: "",
    otherReason: "",
  });

  // Test Details within a test record
  const [testDetails, setTestDetails] = useState<
    Array<{
      id: number;
      testType: string;
      testPanel: string;
      relatedTest: string;
      refusalDetail: string;
      resultsDate: string;
      results: string;
    }>
  >([]);
  const [editingTestDetailId, setEditingTestDetailId] =
    useState<number | null>(null);
  const [
    testDetailFormDialogOpen,
    setTestDetailFormDialogOpen,
  ] = useState(false);
  const [testDetailFormData, setTestDetailFormData] = useState({
    testType: "",
    testPanel: "",
    relatedTest: "",
    refusalDetail: "",
    resultsDate: "",
    results: "",
  });

  // Substance Results
  const [substanceResults, setSubstanceResults] = useState<
    Array<{
      id: number;
      substance: string;
      result: string;
      level: string;
      unitOfMeasure: string;
    }>
  >([]);
  const [
    editingSubstanceResultId,
    setEditingSubstanceResultId,
  ] = useState<number | null>(null);
  const [
    substanceResultDialogOpen,
    setSubstanceResultDialogOpen,
  ] = useState(false);
  const [substanceResultFormData, setSubstanceResultFormData] =
    useState({
      substance: "",
      result: "",
      level: "",
      unitOfMeasure: "",
    });

  // Additional Test Details
  const [testAdditionalDetails, setTestAdditionalDetails] =
    useState({
      newUse: "Pending",
      suspectTampering: false,
      tamperingComments: "",
      labConsultation: "",
      action: "",
      refrigeratorDate: "",
      pickupDate: "",
      discardDate: "",
      discardReason: "",
    });

  // Sorting for tests
  const [testSortField, setTestSortField] = useState<
    string | null
  >(null);
  const [testSortDirection, setTestSortDirection] = useState<
    "asc" | "desc"
  >("asc");

  // Substance Use - Disclosure States
  const [substanceUseDisclosures, setSubstanceUseDisclosures] =
    useState([
      {
        id: 1,
        date: "01/15/2026",
        time: "2:30 PM",
        relatedToTest: "Yes",
        beforeAfterTest: "After Test",
        relatedTestSet: "Test #1 - 01/15/2026 9:30 AM",
        reporter: "John Smith, MSW",
        substances: "Marijuana, THC Vape",
        comments:
          "Constituent disclosed use after returning from unsupervised home visit. Stated used marijuana with peers during weekend. Discussed relapse prevention strategies and updated safety plan.",
      },
      {
        id: 2,
        date: "01/10/2026",
        time: "10:15 AM",
        relatedToTest: "No",
        beforeAfterTest: "",
        relatedTestSet: "",
        reporter: "Sarah Johnson, LCSW",
        substances: "Alcohol",
        comments:
          "Voluntary disclosure during individual therapy session. Reported craving alcohol after stressful family phone call. No actual use occurred. Praised for disclosure and proactive coping.",
      },
      {
        id: 3,
        date: "12/28/2025",
        time: "9:00 AM",
        relatedToTest: "Yes",
        beforeAfterTest: "After Test",
        relatedTestSet: "Test #2 - 12/28/2025 8:00 AM",
        reporter: "Michael Davis, RN",
        substances: "Nicotine, Cigarettes",
        comments:
          "Disclosed cigarette use following positive nicotine screening. Used approximately 3 days prior to test during unsupervised community outing. Referred to cessation support group.",
      },
      {
        id: 4,
        date: "12/15/2025",
        time: "4:45 PM",
        relatedToTest: "No",
        beforeAfterTest: "",
        relatedTestSet: "",
        reporter: "Emily Rodriguez, MSW",
        substances: "Alcohol, Beer",
        comments:
          "Constituent self-reported after exposure at family gathering during therapeutic home visit. Took one drink but stopped and immediately contacted staff. Demonstrated strong recovery skills.",
      },
    ]);
  const [disclosureDialogOpen, setDisclosureDialogOpen] =
    useState(false);
  const [editingDisclosureId, setEditingDisclosureId] =
    useState<number | null>(null);
  const [disclosureFormData, setDisclosureFormData] = useState({
    date: "",
    time: "",
    relatedToTest: "No",
    beforeAfterTest: "",
    relatedTestSet: "",
    reporter: "",
    substances: [] as string[],
    comments: "",
  });
  const [
    disclosureSubstanceDialogOpen,
    setDisclosureSubstanceDialogOpen,
  ] = useState(false);
  const [disclosureSortField, setDisclosureSortField] =
    useState<string | null>(null);
  const [disclosureSortDirection, setDisclosureSortDirection] =
    useState<"asc" | "desc">("asc");

  // Disclosure View (read-only) mode
  const [disclosureReadOnly, setDisclosureReadOnly] =
    useState(false);

  // Disclosure Substances Selection Modal - staged selection/search state
  const [
    disclosureSubstanceSelection,
    setDisclosureSubstanceSelection,
  ] = useState<string[]>([]);
  const [
    disclosureSubstanceSearchInput,
    setDisclosureSubstanceSearchInput,
  ] = useState("");
  const [
    disclosureSubstanceSearchApplied,
    setDisclosureSubstanceSearchApplied,
  ] = useState("");

  // Substance list for Disclosure multi-select (exact values per User Story 19974)
  const availableSubstances = [
    "Alcohol (Ethanol)",
    "Alcohol (Instant)",
    "Alcohol (Lab)",
    "Amphetamines",
    "Benzodiazepines",
    "Cocaine",
    "Designer Stimulants - Premium",
    "Dextromethorphan",
    "Ethyl Glucuronide (EtG)",
    "Ethyl Glucuronide (EtG)/Ethyl Sulfate",
    "Fentanyl",
    "Lysergic Acid Diethylamide (LSD)",
    "Methamphetamines",
    "Morphine",
    "Opiates",
    "Oxycodone/Oxymorphone",
    "Phencyclidine (PCP)",
    "Selective Serotonin Reuptake Inhibitors (SSRIs)",
    "THC Ratio",
    "THC/Cannabinoids",
    "Unknown",
    "Other",
  ];

  // Campus Restrictions States
  const RESTRICTION_TYPES = [
    "No Access to West Loop",
    "No Access to Walsh",
    "Access Restricted to Community Care Only",
    "Supervised Access Required",
    "No Mercy Home Access",
  ];
  const MHGB_STAFF = [
    "Sohan Jadhavrao",
    "Maria Santos",
    "James Carter",
    "Linda Okafor",
    "David Reyes",
    "Priya Nair",
  ];
  const ALL_YOUTH_CONSTITUENTS = [
    "Aarete Test",
    "Marcus Williams",
    "Jordan Lee",
    "Elena Vasquez",
    "Sofia Morales",
  ];

  const YOUTH_CONSTITUENTS =
    youthConstituentId !== null
      ? [lead.name]
      : ALL_YOUTH_CONSTITUENTS;

  const [localCampusRestrictions, setCampusRestrictions] = useState<
    Array<{
      id: number;
      youth: string;
      type: string;
      startDate: string;
      endDate: string;
      implementedBy: string;
      restrictionReason: string;
      campusContact: string;
      restorativeMeasureDetails: string;
      endedBy: string;
    }>
  >([
    {
      id: 1,
      youth: "Aarete Test",
      type: "No Access to West Loop",
      startDate: "06/01/2026",
      endDate: "",
      implementedBy: "Maria Santos",
      restrictionReason:
        "Conflict with peer group in West Loop area.",
      campusContact: "James Carter",
      restorativeMeasureDetails:
        "Weekly check-ins with case manager.",
      endedBy: "",
    },
    {
      id: 2,
      youth: "Marcus Williams",
      type: "Supervised Access Required",
      startDate: "05/15/2026",
      endDate: "06/15/2026",
      implementedBy: "Sohan Jadhavrao",
      restrictionReason: "Safety planning following incident.",
      campusContact: "Linda Okafor",
      restorativeMeasureDetails:
        "Restorative circle completed.",
      endedBy: "Sohan Jadhavrao",
    },
  ]);
  // Constituent Youth: restrictions come from the shared saved source scoped
  // to this youth's Constituent ID (the header indicator reads the same
  // source). Other profiles keep the local list.
  const crOwnerId =
    youthConstituentId !== null
      ? String(youthConstituentId)
      : undefined;
  const savedRestrictions = useCampusRestrictions(crOwnerId);
  const campusRestrictions =
    savedRestrictions?.status === "ok"
      ? savedRestrictions.records
      : crOwnerId
        ? []
        : localCampusRestrictions;
  const [crDialogOpen, setCrDialogOpen] = useState(false);
  const [crEditingId, setCrEditingId] = useState<number | null>(
    null,
  );
  const [crSelectedId, setCrSelectedId] = useState<
    number | null
  >(null);
  const [crForm, setCrForm] = useState({
    youth: "",
    type: "",
    startDate: "",
    endDate: "",
    implementedBy: "",
    restrictionReason: "",
    campusContact: "",
    restorativeMeasureDetails: "",
    endedBy: "",
  });

  function openCrAdd() {
    setCrEditingId(null);
    setCrForm({
      youth: crOwnerId ? lead.name : "",
      type: "",
      startDate: "",
      endDate: "",
      implementedBy: "",
      restrictionReason: "",
      campusContact: "",
      restorativeMeasureDetails: "",
      endedBy: "",
    });
    setCrDialogOpen(true);
  }

  function openCrModify() {
    const rec = campusRestrictions.find(
      (r) => r.id === crSelectedId,
    );
    if (!rec) return;
    setCrEditingId(rec.id);
    setCrForm({
      youth: rec.youth,
      type: rec.type,
      startDate: rec.startDate,
      endDate: rec.endDate,
      implementedBy: rec.implementedBy,
      restrictionReason: rec.restrictionReason,
      campusContact: rec.campusContact,
      restorativeMeasureDetails: rec.restorativeMeasureDetails,
      endedBy: rec.endedBy,
    });
    setCrDialogOpen(true);
  }

  function saveCrForm() {
    if (!crForm.youth || !crForm.type || !crForm.startDate)
      return;
    if (crOwnerId) {
      const saved = saveCampusRestriction(crOwnerId, {
        ...crForm,
        youth: lead.name,
        id: crEditingId ?? Date.now(),
      });
      if (!saved) {
        toast.error("Campus restriction could not be saved.", {
          description:
            "Browser storage is unavailable. Your changes are still on the form — try again.",
        });
        return;
      }
    } else if (crEditingId !== null) {
      setCampusRestrictions((prev) =>
        prev.map((r) =>
          r.id === crEditingId ? { ...r, ...crForm } : r,
        ),
      );
    } else {
      setCampusRestrictions((prev) => [
        ...prev,
        { id: Date.now(), ...crForm },
      ]);
    }
    setCrDialogOpen(false);
  }

  // Testing & Assessments States — shared by every Admissions profile of the
  // same youth (US 20063), seeded once from the sample records below.
  const [testingAssessments, setTestingAssessments] =
    useYouthTestingAssessments<
      Array<{
        id: number;
        date: string;
        test: string;
        summary: string;
        totalAces?: number;
        documents?: Array<{
          id: number;
          name: string;
          size: number;
          type: string;
          uploadedDate: string;
          url: string;
        }>;
        satData?: {
          date: string;
          essayReading: string;
          essayAnalysis: string;
          essayWriting: string;
          sectionEvidenceReading: string;
          sectionMath: string;
          testReading: string;
          testWritingLanguage: string;
          testMath: string;
          crossTestHistory: string;
          crossTestScience: string;
          subscoreEvidence: string;
          subscoreWords: string;
          subscoreExpression: string;
          subscoreConventions: string;
          subscoreAlgebra: string;
          subscoreDataAnalysis: string;
          subscoreAdvancedMath: string;
          totalScore: string;
          commentary: string;
        };
      }>
    >(testingYouthKey(lead), ((lead as any)?.communityCareSsmOnly ? communityCareSsmMock((lead as any)?.communityCareMemberOptions) as any : isCommunityCareMemberNav ? [] : [
      {
        id: 1,
        date: "2026-01-15",
        test: "ASEBA - YSR",
        summary: "TPT: 66 IPT: 60 EPT: 63",
        raterType: "Youth",
        rater: "Marcus Johnson",
        asebaYsrData: {
          examiner: "Dr. Sarah Williams",
          examinerOther: "",
          activities: "46",
          social: "49",
          academicPerformance: "44",
          totalCompetence: "46",
          anxiousDepressed: "63",
          withdrawnDepressed: "57",
          somaticComplaints: "53",
          socialProblems: "59",
          thoughtProblems: "54",
          attentionProblems: "61",
          ruleBreakingBehavior: "63",
          aggressiveBehavior: "66",
          internalizingProblems: "60",
          externalizingProblems: "63",
          totalProblems: "66",
          otherProblems: "57",
          depressiveProblems: "62",
          anxietyProblems: "59",
          somaticProblems: "53",
          attentionDeficitProblems: "60",
          oppositionalDefiantProblems: "64",
          conductProblems: "61",
          obsessiveCompulsiveProblems: "56",
          stressProblems: "59",
          positiveQualities: "48",
          commentary:
            "Youth self-report indicates moderate elevations in externalizing behaviors and internalizing symptoms. Positive qualities score suggests some areas of strength.",
        },
      },
      {
        id: 2,
        date: "2026-01-15",
        test: "ASEBA - ABCL",
        summary: "ABCL: Adult Behavior Checklist",
      },
      {
        id: 3,
        date: "2026-01-15",
        test: "ASEBA - ASR",
        summary: "TPT: 65 IPT: 58 EPT: 62",
      },
      {
        id: 4,
        date: "2026-01-12",
        test: "KBIT-2",
        summary: "V: 95 NV: 102 Composite: 98",
        raterType: "Youth",
        rater: "Marcus Johnson",
        kbit2Data: {
          examiner: "Dr. Sarah Williams",
          examinerOther: "",
          verbalStandardScore: "95",
          nonverbalStandardScore: "102",
          iqCompositeStandardScore: "98",
          commentary:
            "Youth demonstrates average cognitive abilities with relatively balanced verbal and nonverbal reasoning skills.",
        },
      },
      {
        id: 5,
        date: "2026-01-10",
        test: "PHQ-9",
        summary: "PHQ-9: Depression Screening, Score: Moderate",
      },
      {
        id: 6,
        date: "2026-01-10",
        test: "GAIN-SS",
        summary: "GAIN-SS: Substance Use Screening",
      },
      {
        id: 7,
        date: "2025-12-20",
        test: "WAIS-IV",
        summary: "WAIS-IV: IQ Assessment, FSIQ: 108",
      },
      {
        id: 8,
        date: "2025-12-18",
        test: "SAT",
        summary:
          "RE: 8 WR: 8 WE: 8 PSD: 15 RT: 36 HA: 14 ES: 730 CE: 15 MS: 780 WL: 40 AHC: 37 ASC: 36 WC: 13 PAM: 15 MT: 39 E1: 15 SEC: 13",
        satData: {
          date: "2025-12-18",
          essayReading: "8",
          essayAnalysis: "8",
          essayWriting: "8",
          sectionEvidenceReading: "730",
          sectionMath: "780",
          testReading: "36",
          testWritingLanguage: "40",
          testMath: "39",
          crossTestHistory: "37",
          crossTestScience: "36",
          subscoreEvidence: "15",
          subscoreWords: "13",
          subscoreExpression: "15",
          subscoreConventions: "13",
          subscoreAlgebra: "14",
          subscoreDataAnalysis: "15",
          subscoreAdvancedMath: "15",
          totalScore: "1510",
          commentary:
            "Strong performance across all sections with particularly high scores in Math and Reading.",
        },
        documents: [
          {
            id: 1,
            name: "SAT_Report_December_2025.pdf",
            size: 524288,
            type: "application/pdf",
            uploadedDate: "12/18/2025",
            url: "data:application/pdf;base64,sample",
          },
          {
            id: 2,
            name: "SAT_Score_Details.pdf",
            size: 245760,
            type: "application/pdf",
            uploadedDate: "12/18/2025",
            url: "data:application/pdf;base64,sample",
          },
        ],
      },
      {
        id: 9,
        date: "2025-12-15",
        test: "ACEs",
        summary: "Total Number of ACEs: 4",
        totalAces: 4,
      },
      {
        id: 10,
        date: "2025-12-10",
        test: "ASEBA - CBCL",
        summary: "TPT: 68 IPT: 62 EPT: 64",
        raterType: "Parent/Guardian",
        rater: "Jane Smith",
        asebaCbclData: {
          activities: "45",
          social: "48",
          school: "42",
          totalCompetence: "45",
          anxiousDepressed: "65",
          withdrawnDepressed: "58",
          somaticComplaints: "52",
          socialProblems: "60",
          thoughtProblems: "55",
          attentionProblems: "62",
          ruleBreakingBehavior: "64",
          aggressiveBehavior: "68",
          internalizingProblems: "62",
          externalizingProblems: "64",
          totalProblems: "68",
          otherProblems: "58",
          depressiveProblems: "63",
          anxietyProblems: "60",
          somaticProblems: "54",
          attentionDeficitProblems: "61",
          oppositionalDefiantProblems: "65",
          conductProblems: "62",
          sluggishCognitiveTempo: "58",
          obsessiveCompulsiveProblems: "55",
          stressProblems: "60",
          commentary:
            "Youth shows elevated scores in externalizing behaviors, particularly aggressive behavior and rule-breaking. Internalizing problems also present.",
        },
      },
      {
        id: 11,
        date: "2025-12-05",
        test: "MACI",
        summary: "MACI Assessment",
        raterType: "Youth",
        rater: "Marcus Johnson",
        maciData: {
          examiner: "Dr. Emily Rodriguez",
          examinerOther: "",
          commentary:
            "Youth completed MACI assessment. Results indicate moderate concerns in several clinical scales. Further evaluation recommended for trauma-related symptoms and adjustment difficulties.",
        },
        documents: [
          {
            id: 1,
            name: "MACI_Assessment_Report.pdf",
            size: 389120,
            type: "application/pdf",
            uploadedDate: "12/05/2025",
            url: "data:application/pdf;base64,sample",
          },
        ],
      },
      {
        id: 12,
        date: "2025-11-28",
        test: "MCMI-III",
        summary:
          "Personality assessment shows elevated scales on anxiety and thought disorder. Client demonstrates resilience in interpersonal relationships.",
        raterType: "Youth",
        rater: "Marcus Johnson",
        mcmi3Data: {
          examiner: "Dr. Sarah Williams",
          examinerOther: "",
          commentary:
            "Personality assessment shows elevated scales on anxiety and thought disorder. Client demonstrates resilience in interpersonal relationships.",
        },
        documents: [
          {
            id: 1,
            name: "MCMI-III_Assessment_Report.pdf",
            size: 425984,
            type: "application/pdf",
            uploadedDate: "11/28/2025",
            url: "data:application/pdf;base64,sample",
          },
        ],
      },
      {
        id: 13,
        date: "2025-11-20",
        test: "WJ-4",
        summary: "BAAE: 8-4 BRAE: 7-9 BMAE: 8-1 BWAE: 7-6",
      },
      {
        id: 14,
        date: "2025-10-08",
        test: "WJ-4 (Grade)",
        summary: "BAGE: 3.2 BRGE: 2.8 BMGE: 3.5 BWGE: 2.9",
      },
    ]));
  // Legacy tests have numeric ids; C-SSRS records have string ids
  // ("CSSRS-000001") and live in their own store.
  const [selectedTestId, setSelectedTestId] = useState<
    number | string | null
  >(null);
  const [testingDialogOpen, setTestingDialogOpen] =
    useState(false);
  const [viewTestDialogOpen, setViewTestDialogOpen] =
    useState(false);
  const [editingTestingId, setEditingTestingId] = useState<
    number | null
  >(null);
  // C-SSRS Screener (US 20105): the saved records live in
  // cssrsAssessmentStore; this is only the current editing draft.
  const [editingCssrsId, setEditingCssrsId] = useState<
    string | null
  >(null);
  const [cssrsResponses, setCssrsResponses] =
    useState<ScreenerResponses>(emptyScreenerResponses);
  const [cssrsErrors, setCssrsErrors] =
    useState<ScreenerErrors>({});
  const [cssrsSaveError, setCssrsSaveError] = useState<
    string | null
  >(null);
  // C-SSRS Full-Lifetime (US 20139): editing draft only, same store.
  const [cssrsFlResponses, setCssrsFlResponses] =
    useState<FullLifetimeResponses>(emptyFullLifetimeResponses);
  const [cssrsFlErrors, setCssrsFlErrors] = useState<
    Record<string, string>
  >({});
  const cssrsRead = useCssrsAssessments();
  // Full-Lifetime requirement from the saved Risk Factors of THIS Admissions
  // record only (never another record's, never a default youth).
  const riskFactorRead = useRiskFactors();
  const fullLifetimeRequirement = deriveFullLifetimeRequirement(
    riskFactorRead,
    cssrsOwnership.admissionsRecordId,
  );
  const ownedFullLifetime = useMemo(
    () =>
      cssrsOwnership.admissionsRecordId === null
        ? []
        : cssrsForAdmissionsRecord(
            cssrsRead,
            cssrsOwnership.admissionsRecordId,
          )
            .filter(
              (r) => r.instrument === "cssrs-full-lifetime",
            )
            .map((r) => ({ id: r.id, date: r.assessmentDate })),
    [cssrsRead, cssrsOwnership.admissionsRecordId],
  );
  const cssrsRecords = useMemo(
    () => cssrsForYouth(cssrsRead, cssrsOwnership.youthKey),
    [cssrsRead, cssrsOwnership.youthKey],
  );
  const cssrsRows = useMemo(
    () => cssrsAsTestRows(cssrsRecords),
    [cssrsRecords],
  );
  const editingCssrsRecord =
    editingCssrsId === null
      ? undefined
      : cssrsRecords.find((r) => r.id === editingCssrsId);
  // Related IR needs a VERIFIED Youth Constituent: the saved record's own
  // link when editing, else this profile's.
  const cssrsIrConstituentId =
    editingCssrsRecord?.youthConstituentId ??
    cssrsOwnership.youthConstituentId;
  const cssrsIrOptions = eligibleIncidentReports(
    cssrsIrConstituentId,
    getIncidentReports(),
  );
  const cssrsIrStatus =
    cssrsIrConstituentId === null
      ? ("unverified" as const)
      : cssrsIrOptions.length === 0
        ? ("none" as const)
        : ("available" as const);
  // A field's error goes away once that field is corrected.
  const updateCssrsResponses = (next: ScreenerResponses) => {
    setCssrsResponses(next);
    setCssrsErrors((prev) => {
      const active = activeScreenerQuestions(next);
      const kept: ScreenerErrors = {};
      for (const k of Object.keys(prev) as Array<
        keyof ScreenerErrors
      >) {
        if (k === "assessmentDate") kept[k] = prev[k];
        else if (k === "relatedIncidentReportId") {
          if (
            next.relatedIncidentReportId ===
            cssrsResponses.relatedIncidentReportId
          )
            kept[k] = prev[k];
        } else if (
          active.includes(k) &&
          getScreenerAnswer(next, k) === "unanswered"
        )
          kept[k] = prev[k];
      }
      return kept;
    });
  };
  // Errors drop away as the fields they flag are corrected.
  const updateCssrsFlResponses = (
    next: FullLifetimeResponses,
  ) => {
    setCssrsFlResponses(next);
    setCssrsFlErrors((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      const live = validateFullLifetime({
        assessmentDate: testingFormData.date,
        responses: next,
      });
      const kept: Record<string, string> = {};
      for (const k of Object.keys(prev))
        if (live[k]) kept[k] = live[k];
      return kept;
    });
  };
  const resetCssrsDraft = () => {
    setEditingCssrsId(null);
    setCssrsFlResponses(emptyFullLifetimeResponses());
    setCssrsFlErrors({});
    setCssrsResponses(emptyScreenerResponses());
    setCssrsErrors({});
    setCssrsSaveError(null);
  };
  const [testingFormData, setTestingFormData] = useState({
    date: localTodayIso(), // Default to today's date
    test: "",
    raterType: "",
    raterTypeOther: "",
    rater: "",
  });
  useEffect(() => {
    setCssrsErrors((prev) =>
      prev.assessmentDate
        ? { ...prev, assessmentDate: undefined }
        : prev,
    );
  }, [testingFormData.date]);
  // A save error belongs to the instrument that produced it.
  useEffect(() => {
    setCssrsSaveError(null);
  }, [testingFormData.test]);
  useEffect(() => {
    setCssrsFlErrors((prev) => {
      if (!prev.assessmentDate) return prev;
      const { assessmentDate: _drop, ...rest } = prev;
      return rest;
    });
  }, [testingFormData.date]);

  // ASEBA - ABCL Form Data
  const [asebaAbclFormData, setAsebaAbclFormData] = useState({
    // Adaptive Functioning Scale T Scores
    friends: "",
    spousePartner: "",
    personalStrengths: "",
    // Syndrome Scale T Scores
    anxiousDepressed: "",
    withdrawn: "",
    somaticComplaints: "",
    thoughtProblems: "",
    attentionProblems: "",
    aggressiveBehavior: "",
    ruleBreakingBehavior: "",
    intrusive: "",
    // Internalizing, Externalizing, Total Problems, Critical Items T Scores
    internalizingProblems: "",
    externalizingProblems: "",
    totalProblems: "",
    clinicalItems: "",
    // Substance Use T Scores
    tobaccoTimesPerDay: "",
    alcoholDaysDrunk: "",
    drugsDaysUsed: "",
    meanSubstanceUse: "",
    // DSM Oriented Scales T Scores
    depressiveProblems: "",
    anxietyProblems: "",
    somaticProblems: "",
    avoidantPersonality: "",
    adHProblems: "",
    antisocialPersonality: "",
    attentionProblemsInattention: "",
    attentionProblemsHyperactivity: "",
    // 2014 Scale T Scores
    sluggishCognitiveTempo: "",
    obsessiveCompulsiveProblems: "",
    // Additional Fields
    commentary: "",
  });

  // ASEBA - ABCL Documents
  const [asebaAbclDocuments, setAsebaAbclDocuments] = useState<
    Array<{
      id: number;
      name: string;
      size: number;
      type: string;
      uploadedDate: string;
      url: string;
    }>
  >([]);

  // ASEBA - ASR Form Data
  const [asebaAsrFormData, setAsebaAsrFormData] = useState({
    // Top Section
    examiner: "",
    examinerOther: "",
    // Adaptive Functioning Scale T Scores
    friends: "",
    spousePartner: "",
    family: "",
    job: "",
    education: "",
    meanAdaptive: "",
    personalStrengths: "",
    // Syndrome Scale T Scores
    anxiousDepressed: "",
    withdrawn: "",
    somaticComplaints: "",
    thoughtProblems: "",
    attentionProblem: "",
    aggressiveBehavior: "",
    ruleBreakingBehavior: "",
    intrusive: "",
    // Internalizing, Externalizing, Total Problems, Critical Items T Scores
    internalizingProblems: "",
    externalizingProblems: "",
    totalProblems: "",
    criticalItems: "",
    // Substance Use T Scores
    tobaccoTimesPerDay: "",
    alcoholDaysDrunk: "",
    drugsDaysUsed: "",
    meanSubstanceUse: "",
    // DSM Oriented Scales T Scores
    depressiveProblems: "",
    anxietyProblems: "",
    somaticProblems: "",
    avoidantPersonality: "",
    adHProblems: "",
    antisocialPersonality: "",
    attentionProblemsInattention: "",
    attentionProblemsHyperactivity: "",
    // 2014 Scale T Scores
    sluggishCognitiveTempo: "",
    obsessiveCompulsiveProblems: "",
    // Additional Fields
    commentary: "",
  });

  // ASEBA - CBCL Form Data
  const [asebaCbclFormData, setAsebaCbclFormData] = useState({
    // Competence Scale T Scores
    activities: "",
    social: "",
    school: "",
    totalCompetence: "",
    // Syndrome Scale T Scores
    anxiousDepressed: "",
    withdrawnDepressed: "",
    somaticComplaints: "",
    socialProblems: "",
    thoughtProblems: "",
    attentionProblems: "",
    ruleBreakingBehavior: "",
    aggressiveBehavior: "",
    // Internalizing, Externalizing, Total Problems, Critical Items T Scores
    internalizingProblems: "",
    externalizingProblems: "",
    totalProblems: "",
    otherProblems: "",
    // DSM Oriented Scales T Scores
    depressiveProblems: "",
    anxietyProblems: "",
    somaticProblems: "",
    attentionDeficitProblems: "",
    oppositionalDefiantProblems: "",
    conductProblems: "",
    // 2007 Scale T Scores
    sluggishCognitiveTempo: "",
    obsessiveCompulsiveProblems: "",
    stressProblems: "",
    // Additional Fields
    commentary: "",
  });

  // ASEBA - YSR Form Data
  const [asebaYsrFormData, setAsebaYsrFormData] = useState({
    // Top Section
    examiner: "",
    examinerOther: "",
    // Competence Scale T Scores
    activities: "",
    social: "",
    academicPerformance: "",
    totalCompetence: "",
    // Syndrome Scale T Scores
    anxiousDepressed: "",
    withdrawnDepressed: "",
    somaticComplaints: "",
    socialProblems: "",
    thoughtProblems: "",
    attentionProblems: "",
    ruleBreakingBehavior: "",
    aggressiveBehavior: "",
    // Internalizing, Externalizing, Total Problems, Critical Items T Scores
    internalizingProblems: "",
    externalizingProblems: "",
    totalProblems: "",
    otherProblems: "",
    // DSM Oriented Scales T Scores
    depressiveProblems: "",
    anxietyProblems: "",
    somaticProblems: "",
    attentionDeficitProblems: "",
    oppositionalDefiantProblems: "",
    conductProblems: "",
    // 2007 Scale T Scores
    obsessiveCompulsiveProblems: "",
    stressProblems: "",
    positiveQualities: "",
    // Additional Fields
    commentary: "",
  });

  // KBIT-2 Form Data
  const [kbit2FormData, setKbit2FormData] = useState({
    examiner: "",
    examinerOther: "",
    verbalStandardScore: "",
    nonverbalStandardScore: "",
    iqCompositeStandardScore: "",
    commentary: "",
  });
  const [kbit2FormErrors, setKbit2FormErrors] = useState({
    verbalStandardScore: "",
    nonverbalStandardScore: "",
    iqCompositeStandardScore: "",
  });
  const [kbit2Documents, setKbit2Documents] = useState<
    Array<{
      id: number;
      name: string;
      size: number;
      type: string;
      uploadedDate: string;
      url: string;
    }>
  >([]);

  // M-PACI Form Data
  const [mpaciFormData, setMpaciFormData] = useState({
    examiner: "",
    examinerOther: "",
    commentary: "",
  });
  const [mpaciDocuments, setMpaciDocuments] = useState<
    Array<{
      id: number;
      name: string;
      size: number;
      type: string;
      uploadedDate: string;
      url: string;
    }>
  >([]);

  // MACI Form Data
  const [maciFormData, setMaciFormData] = useState({
    examiner: "",
    examinerOther: "",
    commentary: "",
  });
  const [maciDocuments, setMaciDocuments] = useState<
    Array<{
      id: number;
      name: string;
      size: number;
      type: string;
      uploadedDate: string;
      url: string;
    }>
  >([]);

  // MCMI-IV Form Data
  const [mcmiFormData, setMcmiFormData] = useState({
    examiner: "",
    examinerOther: "",
    commentary: "",
  });
  const [mcmiDocuments, setMcmiDocuments] = useState<
    Array<{
      id: number;
      name: string;
      size: number;
      type: string;
      uploadedDate: string;
      url: string;
    }>
  >([]);

  // MCMI-III Form Data
  const [mcmi3FormData, setMcmi3FormData] = useState({
    examiner: "",
    examinerOther: "",
    commentary: "",
  });
  const [mcmi3Documents, setMcmi3Documents] = useState<
    Array<{
      id: number;
      name: string;
      size: number;
      type: string;
      uploadedDate: string;
      url: string;
    }>
  >([]);

  // Self Sufficiency Matrix v2 Form Data
  const [ssmFormData, setSsmFormData] = useState({
    examiner: "",
    examinerOther: "",
    // Topic fields - each has status and comment
    housingStatus: "",
    housingComment: "",
    employmentFinancesStatus: "",
    employmentFinancesComment: "",
    foodStatus: "",
    foodComment: "",
    clothingStatus: "",
    clothingComment: "",
    transportationStatus: "",
    transportationComment: "",
    executiveFunctionsStatus: "",
    executiveFunctionsComment: "",
    adultEducationStatus: "",
    adultEducationComment: "",
    educationChildAdolescentStatus: "",
    educationChildAdolescentComment: "",
    childcareStatus: "",
    childcareComment: "",
    caregiverSkillsStatus: "",
    caregiverSkillsComment: "",
    socialSupportsStatus: "",
    socialSupportsComment: "",
    legalNonCriminalStatus: "",
    legalNonCriminalComment: "",
    legalCriminalStatus: "",
    legalCriminalComment: "",
    physicalHealthStatus: "",
    physicalHealthComment: "",
    physicalDisabilitiesStatus: "",
    physicalDisabilitiesComment: "",
    substanceUseStatus: "",
    substanceUseComment: "",
    mentalHealthStatus: "",
    mentalHealthComment: "",
    safetyStatus: "",
    safetyComment: "",
    // Additional fields
    notesForGoals: "",
    passionStatement: "",
  });
  const [ssmDocuments, setSsmDocuments] = useState<
    Array<{
      id: number;
      name: string;
      size: number;
      type: string;
      uploadedDate: string;
      url: string;
    }>
  >([]);

  // ACT Test Documents
  const [actDocuments, setActDocuments] = useState<
    Array<{
      id: number;
      name: string;
      size: number;
      type: string;
      uploadedDate: string;
      url: string;
    }>
  >([]);

  // PLAN Test Documents
  const [planDocuments, setPlanDocuments] = useState<
    Array<{
      id: number;
      name: string;
      size: number;
      type: string;
      uploadedDate: string;
      url: string;
    }>
  >([]);

  // EXPLORE Test Documents
  const [exploreDocuments, setExploreDocuments] = useState<
    Array<{
      id: number;
      name: string;
      size: number;
      type: string;
      uploadedDate: string;
      url: string;
    }>
  >([]);

  // Employability and Life Skills Assessment Documents
  const [employabilityDocuments, setEmployabilityDocuments] =
    useState<
      Array<{
        id: number;
        name: string;
        size: number;
        type: string;
        uploadedDate: string;
        url: string;
      }>
    >([]);

  // Testing & Assessments - Sorting, Actions, and User Role States
  const [testingSortColumn, setTestingSortColumn] = useState<
    "date" | "test"
  >("date");
  const [testingSortDirection, setTestingSortDirection] =
    useState<"asc" | "desc">("desc");
  const [deleteTestConfirmOpen, setDeleteTestConfirmOpen] =
    useState(false);
  const [testToDelete, setTestToDelete] = useState<
    number | null
  >(null);
  const [
    caregiverLinkedToAssessment,
    setCaregiverLinkedToAssessment,
  ] = useState(false);
  const [hoveredTestId, setHoveredTestId] = useState<
    number | string | null
  >(null);
  const [testDocumentViewerOpen, setTestDocumentViewerOpen] =
    useState(false);
  const [selectedTestDocuments, setSelectedTestDocuments] =
    useState<Array<{
      id: number;
      name: string;
      size: number;
      type: string;
      uploadedDate: string;
      url: string;
    }> | null>(null);
  const [
    currentTestDocumentIndex,
    setCurrentTestDocumentIndex,
  ] = useState(0);
  // ACEs form (US 20063): answers, manually entered total, commentary, files
  const [acesFormData, setAcesFormData] =
    useState<AcesFormData>(emptyAcesFormData);
  const [acesDocuments, setAcesDocuments] = useState<
    AcesDocument[]
  >([]);

  // Mock user role - in a real app, this would come from authentication context
  const isSystemAdministrator = true; // Set to false to test non-admin behavior

  // Close school dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside the dropdown and input
      if (
        showSchoolDropdown &&
        !target.closest("#school-search-container")
      ) {
        setShowSchoolDropdown(false);
      }
    };

    if (showSchoolDropdown) {
      document.addEventListener(
        "mousedown",
        handleClickOutside,
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, [showSchoolDropdown]);

  const handleSaveActivity = () => {
    if (!activitySubject.trim()) {
      toast.error("Please enter a subject for the activity");
      return;
    }
    if (!activityDescription.trim()) {
      toast.error(
        "Please enter a description for the activity",
      );
      return;
    }

    toast.success(
      `Activity logged successfully for ${lead.name}`,
    );

    setLogActivityOpen(false);
    setActivityType("note");
    setActivitySubject("");
    setActivityDescription("");
    setActivityDate(localTodayIso());
    setActivityTime(new Date().toTimeString().slice(0, 5));
  };

  // Referral Handlers
  const handleAddReferral = () => {
    setEditingReferralId(null);
    setReferralFormData({
      recommendation: "",
      dateApproved: "",
    });
    setReferralDialogOpen(true);
  };

  const handleEditReferral = (referral: any) => {
    setEditingReferralId(referral.id);
    setReferralFormData({
      recommendation: referral.recommendation,
      dateApproved: referral.dateApproved,
    });
    setReferralDialogOpen(true);
  };

  const handleDeleteReferral = (id: number) => {
    setReferrals(referrals.filter((r) => r.id !== id));
    toast.success("Referral deleted successfully");
  };

  const handleSaveReferral = () => {
    if (!referralFormData.recommendation.trim()) {
      toast.error("Please enter a recommendation");
      return;
    }
    if (!referralFormData.dateApproved.trim()) {
      toast.error("Please enter a date approved");
      return;
    }

    if (editingReferralId) {
      setReferrals(
        referrals.map((r) =>
          r.id === editingReferralId
            ? { ...r, ...referralFormData }
            : r,
        ),
      );
      toast.success("Referral updated successfully");
    } else {
      const newId =
        Math.max(...referrals.map((r) => r.id), 0) + 1;
      setReferrals([
        ...referrals,
        { id: newId, ...referralFormData },
      ]);
      toast.success("Referral added successfully");
    }

    setReferralDialogOpen(false);
    setEditingReferralId(null);
    setReferralFormData({
      recommendation: "",
      dateApproved: "",
    });
  };

  // Reference Handlers
  const handleAddReference = () => {
    setEditingReferenceId(null);
    setReferenceFormData({
      mentor: "",
      email: "",
      comment: "",
    });
    setReferenceDialogOpen(true);
  };

  const handleEditReference = (reference: any) => {
    setEditingReferenceId(reference.id);
    setReferenceFormData({
      mentor: reference.mentor,
      email: reference.email,
      comment: reference.comment,
    });
    setReferenceDialogOpen(true);
  };

  const handleDeleteReference = (id: number) => {
    setReferences(references.filter((r) => r.id !== id));
    toast.success("Reference deleted successfully");
  };

  const handleSaveReference = () => {
    if (!referenceFormData.mentor.trim()) {
      toast.error("Please enter a mentor name");
      return;
    }
    if (!referenceFormData.email.trim()) {
      toast.error("Please enter an email");
      return;
    }

    if (editingReferenceId) {
      setReferences(
        references.map((r) =>
          r.id === editingReferenceId
            ? { ...r, ...referenceFormData }
            : r,
        ),
      );
      toast.success("Reference updated successfully");
    } else {
      const newId =
        Math.max(...references.map((r) => r.id), 0) + 1;
      setReferences([
        ...references,
        { id: newId, ...referenceFormData },
      ]);
      toast.success("Reference added successfully");
    }

    setReferenceDialogOpen(false);
    setEditingReferenceId(null);
    setReferenceFormData({
      mentor: "",
      email: "",
      comment: "",
    });
  };

  // Documentation Received Handlers
  const handleAddDocReceived = () => {
    setEditingDocReceivedId(null);
    setDocReceivedFormData({ documentationType: "", date: "" });
    setDocReceivedDialogOpen(true);
  };

  const handleEditDocReceived = (
    doc: DocumentationReceived,
  ) => {
    setEditingDocReceivedId(doc.id);
    setDocReceivedFormData({
      documentationType: doc.documentationType,
      date: doc.date,
    });
    setDocReceivedDialogOpen(true);
  };

  const handleDeleteDocReceived = (id: number) => {
    setDocumentationReceived(
      documentationReceived.filter((d) => d.id !== id),
    );
    toast.success("Document deleted successfully");
  };

  const handleSaveDocReceived = () => {
    if (!docReceivedFormData.documentationType.trim()) {
      toast.error("Please select a documentation type");
      return;
    }
    if (!docReceivedFormData.date.trim()) {
      toast.error("Please select a date");
      return;
    }

    if (editingDocReceivedId) {
      setDocumentationReceived(
        documentationReceived.map((d) =>
          d.id === editingDocReceivedId
            ? { ...d, ...docReceivedFormData }
            : d,
        ),
      );
      toast.success("Document updated successfully");
    } else {
      const newId =
        Math.max(...documentationReceived.map((d) => d.id), 0) +
        1;
      setDocumentationReceived([
        ...documentationReceived,
        { id: newId, ...docReceivedFormData },
      ]);
      toast.success("Document added successfully");
    }

    setDocReceivedDialogOpen(false);
    setEditingDocReceivedId(null);
    setDocReceivedFormData({ documentationType: "", date: "" });
  };

  // Releases Sent Handlers
  const handleAddReleaseSent = () => {
    setEditingReleasesSentId(null);
    setReleasesSentFormData({ releaseType: "", date: "" });
    setReleasesSentDialogOpen(true);
  };

  const handleEditReleaseSent = (release: ReleasesSent) => {
    setEditingReleasesSentId(release.id);
    setReleasesSentFormData({
      releaseType: release.releaseType,
      date: release.date,
    });
    setReleasesSentDialogOpen(true);
  };

  const handleDeleteReleaseSent = (id: number) => {
    setReleasesSent(releasesSent.filter((r) => r.id !== id));
    toast.success("Release deleted successfully");
  };

  const handleSaveReleaseSent = () => {
    if (!releasesSentFormData.releaseType.trim()) {
      toast.error("Please select a release type");
      return;
    }
    if (!releasesSentFormData.date.trim()) {
      toast.error("Please select a date");
      return;
    }

    if (editingReleasesSentId) {
      setReleasesSent(
        releasesSent.map((r) =>
          r.id === editingReleasesSentId
            ? { ...r, ...releasesSentFormData }
            : r,
        ),
      );
      toast.success("Release updated successfully");
    } else {
      const newId =
        Math.max(...releasesSent.map((r) => r.id), 0) + 1;
      setReleasesSent([
        ...releasesSent,
        { id: newId, ...releasesSentFormData },
      ]);
      toast.success("Release added successfully");
    }

    setReleasesSentDialogOpen(false);
    setEditingReleasesSentId(null);
    setReleasesSentFormData({ releaseType: "", date: "" });
  };

  // Vaccination Status Handlers
  const handleAddVaccination = () => {
    setEditingVaccinationId(null);
    setVaccinationFormData({ dose: "", date: "" });
    setVaccinationDialogOpen(true);
  };

  const handleEditVaccination = (vax: VaccinationStatus) => {
    setEditingVaccinationId(vax.id);
    setVaccinationFormData({
      dose: vax.dose,
      date: vax.date,
    });
    setVaccinationDialogOpen(true);
  };

  const handleDeleteVaccination = (id: number) => {
    setVaccinationStatus(
      vaccinationStatus.filter((v) => v.id !== id),
    );
    toast.success("Vaccination record deleted successfully");
  };

  const handleSaveVaccination = () => {
    if (!vaccinationFormData.dose.trim()) {
      toast.error("Please enter a dose");
      return;
    }
    if (!vaccinationFormData.date.trim()) {
      toast.error("Please select a date");
      return;
    }

    if (editingVaccinationId) {
      setVaccinationStatus(
        vaccinationStatus.map((v) =>
          v.id === editingVaccinationId
            ? { ...v, ...vaccinationFormData }
            : v,
        ),
      );
      toast.success("Vaccination record updated successfully");
    } else {
      const newId =
        Math.max(...vaccinationStatus.map((v) => v.id), 0) + 1;
      setVaccinationStatus([
        ...vaccinationStatus,
        { id: newId, ...vaccinationFormData },
      ]);
      toast.success("Vaccination record added successfully");
    }

    setVaccinationDialogOpen(false);
    setEditingVaccinationId(null);
    setVaccinationFormData({ dose: "", date: "" });
  };

  // IR Dialog Handlers
  const resetIncidentForm = () => {
    setIrDialogOpen(false);
    setSelectedIncident(null);
    setIncidentTab("general");
    setIncidentType("");
    setIncidentLocation("");
    setIncidentStartDate("");
    setIncidentStartTime("");
    setIncidentEndDate("");
    setIncidentEndTime("");
    setIncidentOverview("");
    setIncidentNarrative("");
    setIncidentResponse("");
    setIncidentPersonsContacted([]);
    setIncidentYouthInjuries([]);
    setIncidentRestraints([]);
    setIncidentDebriefParticipants([]);
    setIncidentDebriefNotes("");
    setIncidentFinalized(false);
  };

  const handleCancelIncident = () => {
    // Check if there are any unsaved changes
    const hasChanges =
      incidentType ||
      incidentLocation ||
      incidentNarrative ||
      incidentPersonsContacted.length > 0;

    if (hasChanges) {
      setIrConfirm("cancel");
    } else {
      resetIncidentForm();
    }
  };

  // End must not be before start where both are entered (ISO date / HH:MM).
  const incidentEndBeforeStart = () =>
    !!(
      incidentStartDate &&
      incidentEndDate &&
      `${incidentEndDate}T${incidentEndTime || "00:00"}` <
        `${incidentStartDate}T${incidentStartTime || "00:00"}`
    );

  // Writes the incident into the lead's Incidents list (session mock state).
  const persistLeadIncident = (): boolean => {
    const toMdy = (d: string) => (d ? isoToMdy(d) : "");
    const result = addLeadIncident({
      incidentType,
      startDate: toMdy(incidentStartDate),
      startTime: incidentStartTime,
      endDate: toMdy(incidentEndDate),
      endTime: incidentEndTime,
      individuals: [],
      program: "Residential Program",
      involvementType: "",
      location: incidentLocation,
      description: incidentOverview,
    });
    if (!result.ok) {
      toast.error("Incident report could not be saved", {
        description: "Your entries are preserved. " + result.message,
      });
      return false;
    }
    return true;
  };

  const handleSaveIncident = () => {
    if (irSubmittingRef.current) return;
    if (incidentEndBeforeStart()) {
      toast.error("End date and time must not be before the start date and time.");
      return;
    }
    irSubmittingRef.current = true;
    const ok = persistLeadIncident();
    irSubmittingRef.current = false;
    if (!ok) return;
    toast.success("Incident report saved as a draft");
    setIrDialogOpen(false);
  };

  const handleSaveIncidentsTab = () => {
    setSavedDcfsData({
      caseStatus: dcfsCaseStatus,
      caseNumber: dcfsCaseNumber,
      caseworker: dcfsCaseworker,
      caseworkerPhone: dcfsCaseworkerPhone,
      caseworkerEmail: dcfsCaseworkerEmail,
      regionalOffice: dcfsRegionalOffice,
      caseOpenedDate: dcfsCaseOpenedDate,
      nextReviewDate: dcfsNextReviewDate,
      placementType: dcfsPlacementType,
      permanencyGoal: dcfsPermanencyGoal,
      caseNotes: dcfsCaseNotes,
    });
  };

  const handleCancelIncidentsTab = () => {
    setDcfsCaseStatus(savedDcfsData.caseStatus);
    setDcfsCaseNumber(savedDcfsData.caseNumber);
    setDcfsCaseworker(savedDcfsData.caseworker);
    setDcfsCaseworkerPhone(savedDcfsData.caseworkerPhone);
    setDcfsCaseworkerEmail(savedDcfsData.caseworkerEmail);
    setDcfsRegionalOffice(savedDcfsData.regionalOffice);
    setDcfsCaseOpenedDate(savedDcfsData.caseOpenedDate);
    setDcfsNextReviewDate(savedDcfsData.nextReviewDate);
    setDcfsPlacementType(savedDcfsData.placementType);
    setDcfsPermanencyGoal(savedDcfsData.permanencyGoal);
    setDcfsCaseNotes(savedDcfsData.caseNotes);
  };

  const handleFinalizeIncident = () => {
    if (!canFinalizeIncident()) {
      toast.error("Cannot finalize incident", {
        description:
          "Please complete all required fields: Incident Type, Location, Start Date & Time, and Narrative.",
      });
      return;
    }
    if (incidentEndBeforeStart()) {
      toast.error("End date and time must not be before the start date and time.");
      return;
    }
    setIrConfirm("finalize");
  };

  const confirmFinalizeIncident = () => {
    if (irSubmittingRef.current) return;
    irSubmittingRef.current = true;
    const ok = persistLeadIncident();
    irSubmittingRef.current = false;
    if (!ok) return;
    setIncidentFinalized(true);
    toast.success("Incident report finalized", {
      description: "Report has been finalized and locked.",
    });
    setIrDialogOpen(false);
  };

  const canFinalizeIncident = () => {
    return (
      incidentType &&
      incidentLocation &&
      incidentStartDate &&
      incidentStartTime &&
      incidentNarrative
    );
  };

  const handleAddPersonContacted = () => {
    const newId =
      Math.max(
        ...incidentPersonsContacted.map((p) => p.id),
        0,
      ) + 1;
    setIncidentPersonsContacted([
      ...incidentPersonsContacted,
      {
        id: newId,
        name: "",
        relationship: "",
        contactTime: "",
      },
    ]);
  };

  const handleRemovePersonContacted = (id: number) => {
    setIncidentPersonsContacted(
      incidentPersonsContacted.filter((p) => p.id !== id),
    );
  };

  const handleAddYouthInjury = () => {
    const newId =
      Math.max(...incidentYouthInjuries.map((i) => i.id), 0) +
      1;
    setIncidentYouthInjuries([
      ...incidentYouthInjuries,
      {
        id: newId,
        description: "",
        cause: "",
        firstAid: false,
        firstAidDetails: "",
      },
    ]);
  };

  const handleRemoveYouthInjury = (id: number) => {
    setIncidentYouthInjuries(
      incidentYouthInjuries.filter((i) => i.id !== id),
    );
  };

  const handleAddRestraint = () => {
    const newId =
      Math.max(...incidentRestraints.map((r) => r.id), 0) + 1;
    setIncidentRestraints([
      ...incidentRestraints,
      {
        id: newId,
        type: "",
        startTime: "",
        endTime: "",
        staffInvolved: "",
        reason: "",
      },
    ]);
  };

  const handleRemoveRestraint = (id: number) => {
    setIncidentRestraints(
      incidentRestraints.filter((r) => r.id !== id),
    );
  };

  const handleAddDebriefParticipant = () => {
    const newId =
      Math.max(
        ...incidentDebriefParticipants.map((p) => p.id),
        0,
      ) + 1;
    setIncidentDebriefParticipants([
      ...incidentDebriefParticipants,
      { id: newId, name: "", role: "", attendedDate: "" },
    ]);
  };

  const handleRemoveDebriefParticipant = (id: number) => {
    setIncidentDebriefParticipants(
      incidentDebriefParticipants.filter((p) => p.id !== id),
    );
  };

  // Create New Incident Handlers
  const handleOpenCreateIncident = () => {
    // Set default values
    const today = localTodayIso();
    const now = new Date().toTimeString().slice(0, 5);

    setNewIncidentStartDate(today);
    setNewIncidentStartTime(now);
    setNewIncidentEndDate(today);
    setNewIncidentEndTime(now);
    setNewIncidentIndividuals(lead.name);
    setNewIncidentProgram("Residential Program");
    setCreateIncidentDialogOpen(true);
  };

  const handleCancelCreateIncident = () => {
    setCreateIncidentDialogOpen(false);
    setNewIncidentType("");
    setNewIncidentOtherType("");
    setNewIncidentOtherTypeError(false);
    setNewIncidentStartDate("");
    setNewIncidentStartTime("");
    setNewIncidentEndDate("");
    setNewIncidentEndTime("");
    setNewIncidentIndividuals("");
    setNewIncidentProgram("");
    setNewIncidentInvolvementType("");
    setNewIncidentLocation("");
    setNewIncidentDescription("");
  };

  // Community Care Member: the incident is saved to the shared Incident
  // Reports list, associated by the member's Constituent ID (and any other
  // constituent picked on the dialog). Returns an error message, or null.
  const submitMemberIncident = (
    data: SubmittedIncident,
  ): string | null => {
    if (!memberConstituent)
      return "This member's record could not be verified.";
    const ids = Array.from(
      new Set(
        data.individuals
          .map((i) => i.constituentId)
          .filter((n): n is number => n !== null),
      ),
    );
    if (!ids.includes(memberConstituent.id))
      return `${memberConstituent.name} must be one of the individuals involved.`;
    const mine = data.individuals.find(
      (i) => i.constituentId === memberConstituent.id,
    );
    const result = addIncidentReportRecord({
      constituentIds: ids,
      youthInvolved: data.individuals
        .filter((i) => i.constituentId !== null)
        .map((i) => i.name)
        .join(", "),
      incidentStartDateTime: data.startDateTime,
      endDateTime: data.endDateTime || undefined,
      program: mine?.program ?? "",
      staffInvolved: getDemoUserName(),
      incidentTypes: [],
      participants: data.individuals,
    });
    return result.ok ? null : result.message;
  };

  const handleSaveCreateIncident = () => {
    // Validation
    if (!newIncidentType) {
      toast.error("Please select an incident type");
      return;
    }
    if (
      newIncidentType === "Other" &&
      !newIncidentOtherType.trim()
    ) {
      setNewIncidentOtherTypeError(true);
      return;
    }
    if (!newIncidentStartDate || !newIncidentStartTime) {
      toast.error("Please enter start date and time");
      return;
    }
    if (!newIncidentEndDate || !newIncidentEndTime) {
      toast.error("Please enter end date and time");
      return;
    }
    if (!newIncidentInvolvementType) {
      toast.error("Please select an involvement type");
      return;
    }

    toast.success("New incident created successfully");
    handleCancelCreateIncident();
  };

  // Legal Involvement Handlers
  const handleCreateLegalInvolvement = () => {
    setEditingLegalInvolvement(null);
    setLegalInvolvementMode("create");
    setLegalInvolvementDialogOpen(true);
  };

  const handleViewLegalInvolvement = (
    record: LegalInvolvementRecord,
  ) => {
    setEditingLegalInvolvement(record);
    setLegalInvolvementMode("view");
    setLegalInvolvementDialogOpen(true);
  };

  const handleEditLegalInvolvement = (
    record: LegalInvolvementRecord,
  ) => {
    setEditingLegalInvolvement(record);
    setLegalInvolvementMode("edit");
    setLegalInvolvementDialogOpen(true);
  };

  const handleSaveLegalInvolvement = (
    record:
      | Omit<LegalInvolvementRecord, "id">
      | LegalInvolvementRecord,
  ) => {
    if ("id" in record) {
      // Editing existing record
      setLegalInvolvementRecords(
        legalInvolvementRecords.map((r) =>
          r.id === record.id ? record : r,
        ),
      );
    } else {
      // Creating new record
      const newId =
        Math.max(
          ...legalInvolvementRecords.map((r) => r.id),
          0,
        ) + 1;
      setLegalInvolvementRecords([
        ...legalInvolvementRecords,
        { ...record, id: newId },
      ]);
    }
  };

  const handleDeleteLegalInvolvement = (id: number) => {
    setLegalInvolvementRecords(
      legalInvolvementRecords.filter((r) => r.id !== id),
    );
  };

  // DCFS Involvement Handlers
  const handleCreateDcfsInvolvement = () => {
    setEditingDcfsInvolvement(null);
    setDcfsInvolvementMode("create");
    setDcfsInvolvementDialogOpen(true);
  };

  const handleViewDcfsInvolvement = (
    record: DCFSInvolvementRecord,
  ) => {
    setEditingDcfsInvolvement(record);
    setDcfsInvolvementMode("view");
    setDcfsInvolvementDialogOpen(true);
  };

  const handleEditDcfsInvolvement = (
    record: DCFSInvolvementRecord,
  ) => {
    setEditingDcfsInvolvement(record);
    setDcfsInvolvementMode("edit");
    setDcfsInvolvementDialogOpen(true);
  };

  const handleSaveDcfsInvolvement = (
    record:
      Omit<DCFSInvolvementRecord, "id"> | DCFSInvolvementRecord,
  ) => {
    if ("id" in record) {
      setDcfsInvolvementRecords(
        dcfsInvolvementRecords.map((r) =>
          r.id === record.id ? record : r,
        ),
      );
      toast.success(
        "DCFS Involvement was updated successfully.",
      );
    } else {
      const newId =
        Math.max(
          ...dcfsInvolvementRecords.map((r) => r.id),
          0,
        ) + 1;
      setDcfsInvolvementRecords([
        ...dcfsInvolvementRecords,
        { ...record, id: newId },
      ]);
      toast.success(
        "DCFS Involvement was created successfully.",
      );
    }
  };

  const handleDeleteDcfsInvolvement = (id: number) => {
    setDcfsInvolvementRecords(
      dcfsInvolvementRecords.filter((r) => r.id !== id),
    );
  };

  // Physical Health - Emergency Contact Handlers
  const handleAddEmergencyContact = () => {
    if (isAddingInlineEC || inlineEditingECId) return;
    setInlineECAddData({
      name: "",
      relationship: "",
      phone: "",
      address: "",
    });
    setIsAddingInlineEC(true);
  };

  const handleSaveInlineECAdd = () => {
    if (
      !inlineECAddData.name ||
      !inlineECAddData.relationship
    ) {
      return;
    }
    const newId =
      Math.max(...emergencyContacts.map((c) => c.id), 0) + 1;
    const newSortOrder =
      Math.max(
        ...emergencyContacts.map((c) => c.sortOrder),
        0,
      ) + 1;
    const isFirstContact = emergencyContacts.length === 0;
    setEmergencyContacts([
      ...emergencyContacts,
      {
        id: newId,
        sortOrder: newSortOrder,
        ...inlineECAddData,
        isPrimary: isFirstContact, // First contact is automatically primary
      },
    ]);
    setIsAddingInlineEC(false);
    setInlineECAddData({
      name: "",
      relationship: "",
      phone: "",
      address: "",
    });
  };

  const handleCancelInlineECAdd = () => {
    setIsAddingInlineEC(false);
    setInlineECAddData({
      name: "",
      relationship: "",
      phone: "",
      address: "",
    });
  };

  const handleEditEmergencyContact = (contact: any) => {
    setEditingEmergencyContactId(contact.id);
    setEmergencyContactFormData({
      sortOrder: String(contact.sortOrder),
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      address: contact.address,
    });
    setEmergencyContactDialogOpen(true);
  };

  const handleDeleteEmergencyContact = (id: number) => {
    const contactToDelete = emergencyContacts.find(
      (c) => c.id === id,
    );

    // Prevent deleting the primary contact if it's the only one
    if (
      contactToDelete?.isPrimary &&
      emergencyContacts.length === 1
    ) {
      alert(
        "Cannot delete the primary emergency contact. At least one primary contact is required.",
      );
      return;
    }

    // If deleting a primary contact and there are others, reassign primary to the next contact
    if (
      contactToDelete?.isPrimary &&
      emergencyContacts.length > 1
    ) {
      const remainingContacts = emergencyContacts.filter(
        (c) => c.id !== id,
      );
      const newPrimary = remainingContacts[0];
      setEmergencyContacts(
        remainingContacts.map((c) =>
          c.id === newPrimary.id
            ? { ...c, isPrimary: true }
            : c,
        ),
      );
    } else {
      setEmergencyContacts(
        emergencyContacts.filter((c) => c.id !== id),
      );
    }
  };

  const handleSaveEmergencyContact = () => {
    if (
      !emergencyContactFormData.name ||
      !emergencyContactFormData.relationship ||
      !emergencyContactFormData.phone
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingEmergencyContactId) {
      setEmergencyContacts(
        emergencyContacts.map((c) =>
          c.id === editingEmergencyContactId
            ? {
                ...c,
                ...emergencyContactFormData,
                sortOrder: parseInt(
                  emergencyContactFormData.sortOrder,
                ),
              }
            : c,
        ),
      );
      toast.success("Emergency contact updated successfully");
    } else {
      const newId =
        Math.max(...emergencyContacts.map((c) => c.id), 0) + 1;
      setEmergencyContacts([
        ...emergencyContacts,
        {
          id: newId,
          ...emergencyContactFormData,
          sortOrder: parseInt(
            emergencyContactFormData.sortOrder,
          ),
        },
      ]);
      toast.success("Emergency contact added successfully");
    }

    setEmergencyContactDialogOpen(false);
    setEditingEmergencyContactId(null);
    setEmergencyContactFormData({
      sortOrder: "",
      name: "",
      relationship: "",
      phone: "",
      address: "",
    });
  };

  const handleInlineEditEmergencyContact = (contact: any) => {
    if (inlineEditingECId) return;
    setInlineECEditData({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      address: contact.address,
    });
    setInlineEditingECId(contact.id);
  };

  const handleSaveInlineECEdit = () => {
    if (
      !inlineECEditData.name ||
      !inlineECEditData.relationship
    ) {
      return;
    }
    setEmergencyContacts(
      emergencyContacts.map((c) =>
        c.id === inlineEditingECId
          ? { ...c, ...inlineECEditData }
          : c,
      ),
    );
    setInlineEditingECId(null);
  };

  const handleCancelInlineECEdit = () => {
    setInlineEditingECId(null);
  };

  const handleSetPrimaryContact = (id: number) => {
    setEmergencyContacts(
      emergencyContacts.map((c) => ({
        ...c,
        isPrimary: c.id === id,
      })),
    );
  };

  const handleMoveSortOrder = (
    id: number,
    direction: "up" | "down",
  ) => {
    const sortedContacts = [...emergencyContacts].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    const index = sortedContacts.findIndex((c) => c.id === id);

    if (
      (direction === "up" && index === 0) ||
      (direction === "down" &&
        index === sortedContacts.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const temp = sortedContacts[index].sortOrder;
    sortedContacts[index].sortOrder =
      sortedContacts[newIndex].sortOrder;
    sortedContacts[newIndex].sortOrder = temp;

    setEmergencyContacts([...sortedContacts]);
  };

  // Physical Health - Medical Professional Handlers
  const handleAddMedicalProfessional = () => {
    setEditingMedicalProfessionalId(null);
    setMedicalProfessionalFormData({
      type: "",
      name: "",
      phone: "",
      address: "",
    });
    setMedicalProfessionalDialogOpen(true);
  };

  const handleEditMedicalProfessional = (professional: any) => {
    setEditingMedicalProfessionalId(professional.id);
    setMedicalProfessionalFormData({
      type: professional.type,
      name: professional.name,
      phone: professional.phone,
      address: professional.address,
    });
    setMedicalProfessionalDialogOpen(true);
  };

  const handleDeleteMedicalProfessional = (id: number) => {
    setMedicalProfessionals(
      medicalProfessionals.filter((p) => p.id !== id),
    );
    toast.success("Medical professional deleted successfully");
  };

  const handleSaveMedicalProfessional = () => {
    if (
      !medicalProfessionalFormData.type ||
      !medicalProfessionalFormData.name ||
      !medicalProfessionalFormData.phone
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingMedicalProfessionalId) {
      setMedicalProfessionals(
        medicalProfessionals.map((p) =>
          p.id === editingMedicalProfessionalId
            ? { ...p, ...medicalProfessionalFormData }
            : p,
        ),
      );
      toast.success(
        "Medical professional updated successfully",
      );
    } else {
      const newId =
        Math.max(...medicalProfessionals.map((p) => p.id), 0) +
        1;
      setMedicalProfessionals([
        ...medicalProfessionals,
        { id: newId, ...medicalProfessionalFormData },
      ]);
      toast.success("Medical professional added successfully");
    }

    setMedicalProfessionalDialogOpen(false);
    setEditingMedicalProfessionalId(null);
    setMedicalProfessionalFormData({
      type: "",
      name: "",
      phone: "",
      address: "",
    });
  };

  // Physical Health - Medical Date Handlers
  const handleEditMedicalDate = (
    type: string,
    currentDate: string,
  ) => {
    setEditingMedicalDateType(type);
    setMedicalDateFormData(currentDate);
    setMedicalDateDialogOpen(true);
  };

  const handleSaveMedicalDate = () => {
    if (!medicalDateFormData) {
      toast.error("Please enter a date");
      return;
    }

    const dateTypeMap: any = {
      "Annual Physical": "annualPhysical",
      "Biannual Dental": "biannualDental",
      Hearing: "hearing",
      Vision: "vision",
      "TB Test": "tbTest",
      "Immunizations/Records Received": "immunizations",
    };

    const fieldKey = dateTypeMap[editingMedicalDateType];
    if (fieldKey) {
      setKeyMedicalDates({
        ...keyMedicalDates,
        [fieldKey]: medicalDateFormData,
      });
      toast.success(
        `${editingMedicalDateType} date updated successfully`,
      );
    }

    setMedicalDateDialogOpen(false);
    setEditingMedicalDateType("");
    setMedicalDateFormData("");
  };

  // Handler to view medical connection details
  const handleViewMedicalConnection = (
    connectionId: string,
  ) => {
    const connection = mockMedicalConnections.find(
      (c) => c.id === connectionId,
    );
    if (connection) {
      setViewingMedicalConnection(connection);
      setViewMedicalConnectionModalOpen(true);
    }
  };

  // Physical Health - Medical & Physical Needs Handlers
  const handleAddMedicalNeed = () => {
    setEditingMedicalNeedId(null);
    setMedicalNeedFormData({
      type: "",
      allergyType: "",
      startDate: "",
      endDate: "",
      details: "",
      dietary: false,
      dietaryNeedType: "",
      dietaryNeedOther: "",
      isFoodAllergy: "Yes",
      relatedDocument: "",
      other: "",
    });
    setMedicalNeedDialogOpen(true);
  };

  const handleEditMedicalNeed = (need: any) => {
    setEditingMedicalNeedId(need.id);
    // Convert dates from MM/DD/YYYY to YYYY-MM-DD
    const startParts = need.startDate.split("/");
    const endParts = need.endDate
      ? need.endDate.split("/")
      : [];
    setMedicalNeedFormData({
      type: need.type,
      allergyType: need.allergyType || "",
      startDate: `${startParts[2]}-${startParts[0].padStart(2, "0")}-${startParts[1].padStart(2, "0")}`,
      endDate:
        endParts.length === 3
          ? `${endParts[2]}-${endParts[0].padStart(2, "0")}-${endParts[1].padStart(2, "0")}`
          : "",
      details: need.details || "",
      dietary: need.dietary || false,
      dietaryNeedType: need.dietaryNeedType || "",
      dietaryNeedOther: need.dietaryNeedOther || "",
      isFoodAllergy: need.isFoodAllergy || "Yes",
      relatedDocument: need.relatedDocument || "",
      other: need.other || "",
    });
    setMedicalNeedDialogOpen(true);
  };

  const handleDeleteMedicalNeed = (id: number) => {
    setMedicalNeeds(medicalNeeds.filter((n) => n.id !== id));
  };

  const handleSaveMedicalNeed = () => {
    // Validate required fields
    if (
      !medicalNeedFormData.startDate ||
      !medicalNeedFormData.type
    ) {
      return; // Silently block save
    }

    // Validate "Other" field if "Other" type is selected
    if (
      medicalNeedFormData.type === "Other" &&
      !medicalNeedFormData.other?.trim()
    ) {
      return; // Silently block save
    }

    // Validate dietary need other field if dietary need type is "Other"
    if (
      medicalNeedFormData.dietaryNeedType === "Other" &&
      !medicalNeedFormData.dietaryNeedOther?.trim()
    ) {
      return; // Silently block save
    }

    // Convert dates from YYYY-MM-DD to MM/DD/YYYY
    const startParts = medicalNeedFormData.startDate.split("-");
    const displayStartDate = `${startParts[1]}/${startParts[2]}/${startParts[0]}`;
    let displayEndDate = "";
    if (medicalNeedFormData.endDate) {
      const endParts = medicalNeedFormData.endDate.split("-");
      displayEndDate = `${endParts[1]}/${endParts[2]}/${endParts[0]}`;
    }

    if (editingMedicalNeedId) {
      setMedicalNeeds(
        medicalNeeds.map((n) =>
          n.id === editingMedicalNeedId
            ? {
                ...n,
                ...medicalNeedFormData,
                startDate: displayStartDate,
                endDate: displayEndDate,
              }
            : n,
        ),
      );
    } else {
      const newId =
        Math.max(...medicalNeeds.map((n) => n.id), 0) + 1;
      setMedicalNeeds([
        ...medicalNeeds,
        {
          id: newId,
          ...medicalNeedFormData,
          startDate: displayStartDate,
          endDate: displayEndDate,
        },
      ]);
    }

    setMedicalNeedDialogOpen(false);
    setEditingMedicalNeedId(null);
    setMedicalNeedFormData({
      type: "",
      allergyType: "",
      startDate: "",
      endDate: "",
      details: "",
      dietary: false,
      dietaryNeedType: "",
      dietaryNeedOther: "",
      isFoodAllergy: "Yes",
      relatedDocument: "",
      other: "",
    });
  };

  // Physical Health - Dietary Needs Handlers
  const handleAddDietaryNeed = () => {
    setEditingDietaryNeedId(null);
    setDietaryNeedFormData({
      dietaryNeedType: "",
      dietaryNeedOther: "",
      isFoodAllergy: "Yes",
      startDate: "",
      endDate: "",
      details: "",
      dietary: true,
      type: "",
      allergyType: "",
      relatedDocument: "",
      other: "",
    });
    setDietaryNeedDialogOpen(true);
  };

  const handleEditDietaryNeed = (need: any) => {
    setEditingDietaryNeedId(need.id);
    // Convert dates from MM/DD/YYYY to YYYY-MM-DD
    const startParts = need.startDate.split("/");
    const endParts = need.endDate
      ? need.endDate.split("/")
      : [];
    setDietaryNeedFormData({
      dietaryNeedType: need.dietaryNeedType || "",
      dietaryNeedOther: need.dietaryNeedOther || "",
      isFoodAllergy: need.isFoodAllergy || "Yes",
      startDate: `${startParts[2]}-${startParts[0].padStart(2, "0")}-${startParts[1].padStart(2, "0")}`,
      endDate:
        endParts.length === 3
          ? `${endParts[2]}-${endParts[0].padStart(2, "0")}-${endParts[1].padStart(2, "0")}`
          : "",
      details: need.details || "",
      dietary: true,
      type: need.type || "",
      allergyType: need.allergyType || "",
      relatedDocument: need.relatedDocument || "",
      other: need.other || "",
    });
    setDietaryNeedDialogOpen(true);
  };

  const handleDeleteDietaryNeed = (id: number) => {
    setMedicalNeeds(medicalNeeds.filter((n) => n.id !== id));
  };

  const handleSaveDietaryNeed = () => {
    // Validate required fields
    if (
      !dietaryNeedFormData.startDate ||
      !dietaryNeedFormData.dietaryNeedType
    ) {
      return; // Silently block save
    }

    // Validate dietary need other field if dietary need type is "Other"
    if (
      dietaryNeedFormData.dietaryNeedType === "Other" &&
      !dietaryNeedFormData.dietaryNeedOther?.trim()
    ) {
      return; // Silently block save
    }

    // Auto-populate based on "Is this a food allergy?"
    let finalType = dietaryNeedFormData.type;
    let finalAllergyType = dietaryNeedFormData.allergyType;
    if (dietaryNeedFormData.isFoodAllergy === "Yes") {
      finalType = "Allergies";
      finalAllergyType = "Food";
    }

    // Convert dates from YYYY-MM-DD to MM/DD/YYYY
    const startParts = dietaryNeedFormData.startDate.split("-");
    const displayStartDate = `${startParts[1]}/${startParts[2]}/${startParts[0]}`;
    let displayEndDate = "";
    if (dietaryNeedFormData.endDate) {
      const endParts = dietaryNeedFormData.endDate.split("-");
      displayEndDate = `${endParts[1]}/${endParts[2]}/${endParts[0]}`;
    }

    if (editingDietaryNeedId) {
      setMedicalNeeds(
        medicalNeeds.map((n) =>
          n.id === editingDietaryNeedId
            ? {
                ...n,
                ...dietaryNeedFormData,
                type: finalType,
                allergyType: finalAllergyType,
                startDate: displayStartDate,
                endDate: displayEndDate,
              }
            : n,
        ),
      );
    } else {
      const newId =
        Math.max(...medicalNeeds.map((n) => n.id), 0) + 1;
      setMedicalNeeds([
        ...medicalNeeds,
        {
          id: newId,
          ...dietaryNeedFormData,
          type: finalType,
          allergyType: finalAllergyType,
          startDate: displayStartDate,
          endDate: displayEndDate,
        },
      ]);
    }

    setDietaryNeedDialogOpen(false);
    setEditingDietaryNeedId(null);
    setDietaryNeedFormData({
      dietaryNeedType: "",
      dietaryNeedOther: "",
      isFoodAllergy: "Yes",
      startDate: "",
      endDate: "",
      details: "",
      dietary: true,
      type: "",
      allergyType: "",
      relatedDocument: "",
      other: "",
    });
  };

  // Physical Health - Insurance Handlers
  const handleAddInsurance = () => {
    setEditingInsuranceId(null);
    setInsuranceFormData({
      type: "",
      startDate: "",
      endDate: "",
      subscriber: "",
      provider: "",
      policyNumber: "",
    });
    setInsuranceDialogOpen(true);
  };

  const handleEditInsurance = (policy: any) => {
    setEditingInsuranceId(policy.id);
    // Convert dates from MM/DD/YYYY to YYYY-MM-DD
    const startParts = policy.startDate.split("/");
    const endParts = policy.endDate.split("/");
    setInsuranceFormData({
      type: policy.type,
      startDate: `${startParts[2]}-${startParts[0].padStart(2, "0")}-${startParts[1].padStart(2, "0")}`,
      endDate: `${endParts[2]}-${endParts[0].padStart(2, "0")}-${endParts[1].padStart(2, "0")}`,
      subscriber: policy.subscriber,
      provider: policy.provider,
      policyNumber: policy.policyNumber,
    });
    setInsuranceDialogOpen(true);
  };

  const handleDeleteInsurance = (id: number) => {
    setInsurancePolicies(
      insurancePolicies.filter((p) => p.id !== id),
    );
    toast.success("Insurance policy deleted successfully");
  };

  const handleSaveInsurance = (data?: any) => {
    if (editingInsuranceId) {
      setInsurancePolicies((prev) =>
        prev.map((p) =>
          p.id === editingInsuranceId
            ? { ...p, ...(data ?? {}) }
            : p,
        ),
      );
    } else {
      const newId =
        Math.max(...insurancePolicies.map((p) => p.id), 0) + 1;
      setInsurancePolicies((prev) => [
        ...prev,
        { id: newId, ...(data ?? {}) },
      ]);
    }
    setInsuranceDialogOpen(false);
    setEditingInsuranceId(null);
  };

  // Mental Health - Diagnosis Handlers
  const handleSaveDiagnosis = () => {
    if (
      !diagnosisFormData.startDate ||
      !diagnosisFormData.dsmVersion ||
      !diagnosisFormData.code
    ) {
      return; // Silently block save if required fields missing
    }

    // Convert dates from YYYY-MM-DD to MM/DD/YYYY
    const startParts = diagnosisFormData.startDate.split("-");
    const displayStartDate = `${startParts[1]}/${startParts[2]}/${startParts[0]}`;
    let displayEndDate = "";
    if (diagnosisFormData.endDate) {
      const endParts = diagnosisFormData.endDate.split("-");
      displayEndDate = `${endParts[1]}/${endParts[2]}/${endParts[0]}`;
    }

    if (editingDiagnosisId) {
      setDiagnoses(
        diagnoses.map((d) =>
          d.id === editingDiagnosisId
            ? {
                ...d,
                ...diagnosisFormData,
                startDate: displayStartDate,
                endDate: displayEndDate,
              }
            : d,
        ),
      );
    } else {
      const newId =
        Math.max(...diagnoses.map((d) => d.id), 0) + 1;
      setDiagnoses([
        ...diagnoses,
        {
          id: newId,
          ...diagnosisFormData,
          startDate: displayStartDate,
          endDate: displayEndDate,
          progressNotes: [],
        },
      ]);
    }

    setDiagnosisDialogOpen(false);
    setEditingDiagnosisId(null);
    setDiagnosisFormData({
      startDate: "",
      dsmVersion: "DSM V",
      code: "",
      details: "",
      endDate: "",
      preliminary: true,
    });
    setDiagnosisActiveTab("details");
  };

  // Diagnosis sorting handler
  const handleDiagnosisSort = (column: string) => {
    if (diagnosisSortColumn === column) {
      setDiagnosisSortDirection(
        diagnosisSortDirection === "asc" ? "desc" : "asc",
      );
    } else {
      setDiagnosisSortColumn(column);
      setDiagnosisSortDirection("asc");
    }
  };

  // Get sorted diagnoses
  const sortedDiagnoses = [...diagnoses].sort((a, b) => {
    if (!diagnosisSortColumn) return 0;

    let aVal = a[diagnosisSortColumn as keyof typeof a];
    let bVal = b[diagnosisSortColumn as keyof typeof b];

    // Handle date sorting
    if (
      diagnosisSortColumn === "startDate" ||
      diagnosisSortColumn === "endDate"
    ) {
      const aDate = aVal ? new Date(String(aVal)) : new Date(0);
      const bDate = bVal ? new Date(String(bVal)) : new Date(0);
      return diagnosisSortDirection === "asc"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    }

    // Handle string sorting
    aVal = String(aVal || "").toLowerCase();
    bVal = String(bVal || "").toLowerCase();

    if (aVal < bVal)
      return diagnosisSortDirection === "asc" ? -1 : 1;
    if (aVal > bVal)
      return diagnosisSortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Progress note handlers
  const handleAddProgressNote = () => {
    if (!progressNoteFormData.comment.trim()) {
      return; // Silently block if comment is empty
    }

    if (editingDiagnosisId) {
      setDiagnoses(
        diagnoses.map((d) => {
          if (d.id === editingDiagnosisId) {
            const dateParts =
              progressNoteFormData.date.split("-");
            const displayDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;

            const newNote = {
              id:
                Math.max(
                  ...(d.progressNotes?.map((n) => n.id) || [0]),
                  0,
                ) + 1,
              date: displayDate,
              comment: progressNoteFormData.comment,
              createdBy: progressNoteFormData.createdBy,
            };

            return {
              ...d,
              progressNotes: [
                ...(d.progressNotes || []),
                newNote,
              ],
            };
          }
          return d;
        }),
      );

      // Reset form
      setProgressNoteFormData({
        date: localTodayIso(),
        comment: "",
        createdBy: getDemoUserName(),
      });
    }
  };

  const handleDeleteProgressNote = (noteId: number) => {
    if (editingDiagnosisId) {
      setDiagnoses(
        diagnoses.map((d) => {
          if (d.id === editingDiagnosisId) {
            return {
              ...d,
              progressNotes: (d.progressNotes || []).filter(
                (n) => n.id !== noteId,
              ),
            };
          }
          return d;
        }),
      );
    }
  };

  // Get available DSM codes based on selected version
  const getAvailableDsmCodes = () => {
    const version = diagnosisFormData.dsmVersion;
    return DSM_CODES[version as keyof typeof DSM_CODES] || [];
  };

  // Mental Health - Professional Handlers
  const handleSaveMentalHealthProfessional = () => {
    if (
      !mentalHealthProfessionalFormData.type ||
      !mentalHealthProfessionalFormData.name ||
      !mentalHealthProfessionalFormData.phone
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingMentalHealthProfessionalId) {
      setMentalHealthProfessionals(
        mentalHealthProfessionals.map((p) =>
          p.id === editingMentalHealthProfessionalId
            ? { ...p, ...mentalHealthProfessionalFormData }
            : p,
        ),
      );
      toast.success(
        "Mental health professional updated successfully",
      );
    } else {
      const newId =
        Math.max(
          ...mentalHealthProfessionals.map((p) => p.id),
          0,
        ) + 1;
      setMentalHealthProfessionals([
        ...mentalHealthProfessionals,
        { id: newId, ...mentalHealthProfessionalFormData },
      ]);
      toast.success(
        "Mental health professional added successfully",
      );
    }

    setMentalHealthProfessionalDialogOpen(false);
    setEditingMentalHealthProfessionalId(null);
    setMentalHealthProfessionalFormData({
      type: "",
      name: "",
      phone: "",
      address: "",
    });
  };

  // Substance Use - Test Handlers
  const handleSaveInitialEntry = () => {
    // Validate required fields
    if (
      !substanceUseTestFormData.date ||
      !substanceUseTestFormData.time ||
      !substanceUseTestFormData.reason
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if "Other" is selected and Other field is filled
    if (
      substanceUseTestFormData.reason === "Other" &&
      !substanceUseTestFormData.otherReason.trim()
    ) {
      toast.error("Please specify the other reason");
      return;
    }

    // Convert date from YYYY-MM-DD to MM/DD/YYYY and combine with time
    const dateParts = substanceUseTestFormData.date.split("-");
    const displayDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;

    // Convert time from 24hr to 12hr format
    const timeParts = substanceUseTestFormData.time.split(":");
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayTime = `${displayHours}:${minutes} ${ampm}`;

    const dateTime = `${displayDate}, ${displayTime}`;

    if (editingSubstanceUseTestId) {
      // Editing existing test - update and open details
      setSubstanceUseTests(
        substanceUseTests.map((t) =>
          t.id === editingSubstanceUseTestId
            ? {
                ...t,
                dateTime,
                reason:
                  substanceUseTestFormData.reason === "Other"
                    ? substanceUseTestFormData.otherReason
                    : substanceUseTestFormData.reason,
              }
            : t,
        ),
      );

      // Load existing test details
      const existingTest = substanceUseTests.find(
        (t) => t.id === editingSubstanceUseTestId,
      );
      if (existingTest) {
        setTestDetails(existingTest.testDetails || []);
        setSubstanceResults(
          existingTest.substanceResults || [],
        );
        setTestAdditionalDetails({
          newUse: existingTest.newUse || "Pending",
          suspectTampering:
            existingTest.suspectTampering || false,
          tamperingComments:
            existingTest.tamperingComments || "",
          labConsultation: existingTest.labConsultation || "",
          action: existingTest.action || "",
          refrigeratorDate: existingTest.refrigeratorDate || "",
          pickupDate: existingTest.pickupDate || "",
          discardDate: existingTest.discardDate || "",
          discardReason: existingTest.discardReason || "",
        });
      }
    } else {
      // Creating new test
      const newId =
        Math.max(...substanceUseTests.map((t) => t.id), 0) + 1;
      setSubstanceUseTests([
        ...substanceUseTests,
        {
          id: newId,
          dateTime,
          reason:
            substanceUseTestFormData.reason === "Other"
              ? substanceUseTestFormData.otherReason
              : substanceUseTestFormData.reason,
          newUse: "Pending",
          testDetails: [],
          substanceResults: [],
          suspectTampering: false,
          tamperingComments: "",
          labConsultation: "",
          action: "",
          refrigeratorDate: "",
          pickupDate: "",
          discardDate: "",
          discardReason: "",
        },
      ]);
      setEditingSubstanceUseTestId(newId);

      // Initialize empty arrays for new test
      setTestDetails([]);
      setSubstanceResults([]);
      setTestAdditionalDetails({
        newUse: "Pending",
        suspectTampering: false,
        tamperingComments: "",
        labConsultation: "",
        action: "",
        refrigeratorDate: "",
        pickupDate: "",
        discardDate: "",
        discardReason: "",
      });
    }

    // Close initial entry, open details dialog
    setSubstanceUseTestDialogOpen(false);
    setTestDetailsDialogOpen(true);
  };

  const handleSaveTestDetails = () => {
    if (!editingSubstanceUseTestId) return;

    // Update the test record with all details
    setSubstanceUseTests(
      substanceUseTests.map((t) =>
        t.id === editingSubstanceUseTestId
          ? {
              ...t,
              newUse: testAdditionalDetails.newUse,
              testDetails: testDetails,
              substanceResults: substanceResults,
              suspectTampering:
                testAdditionalDetails.suspectTampering,
              tamperingComments:
                testAdditionalDetails.tamperingComments,
              labConsultation:
                testAdditionalDetails.labConsultation,
              action: testAdditionalDetails.action,
              refrigeratorDate:
                testAdditionalDetails.refrigeratorDate,
              pickupDate: testAdditionalDetails.pickupDate,
              discardDate: testAdditionalDetails.discardDate,
              discardReason:
                testAdditionalDetails.discardReason,
            }
          : t,
      ),
    );

    toast.success("Test details saved successfully");

    // Reset state
    setTestDetailsDialogOpen(false);
    setEditingSubstanceUseTestId(null);
    setViewingTestId(null);
    setSubstanceUseTestFormData({
      date: "",
      time: "",
      reason: "",
      otherReason: "",
    });
    setTestDetails([]);
    setSubstanceResults([]);
    setTestAdditionalDetails({
      newUse: "Pending",
      suspectTampering: false,
      tamperingComments: "",
      labConsultation: "",
      action: "",
      refrigeratorDate: "",
      pickupDate: "",
      discardDate: "",
      discardReason: "",
    });
  };

  // Test Detail (nested) Handlers
  const handleSaveTestDetail = () => {
    if (!testDetailFormData.testType) {
      toast.error("Test Type is required");
      return;
    }

    // Validate dependent fields
    if (
      testDetailFormData.testType === "Instant Test" &&
      !testDetailFormData.testPanel
    ) {
      toast.error("Test Panel is required for Instant Test");
      return;
    }

    if (testDetailFormData.testType === "Refused Test") {
      if (!testDetailFormData.testPanel) {
        toast.error("Test Panel is required for Refused Test");
        return;
      }
      if (!testDetailFormData.refusalDetail) {
        toast.error(
          "Refusal Detail is required for Refused Test",
        );
        return;
      }
    }

    if (editingTestDetailId) {
      setTestDetails(
        testDetails.map((td) =>
          td.id === editingTestDetailId
            ? { ...td, ...testDetailFormData }
            : td,
        ),
      );
      toast.success("Test updated successfully");
    } else {
      const newId =
        Math.max(...testDetails.map((td) => td.id), 0) + 1;
      setTestDetails([
        ...testDetails,
        {
          id: newId,
          ...testDetailFormData,
        },
      ]);
      toast.success("Test added successfully");
    }

    setTestDetailFormDialogOpen(false);
    setEditingTestDetailId(null);
    setTestDetailFormData({
      testType: "",
      testPanel: "",
      relatedTest: "",
      refusalDetail: "",
      resultsDate: "",
      results: "",
    });
  };

  // Substance Result Handlers
  const handleSaveSubstanceResult = () => {
    if (
      !substanceResultFormData.substance ||
      !substanceResultFormData.result
    ) {
      toast.error("Substance and Result are required");
      return;
    }

    // If result is Positive, level and unit are required
    if (substanceResultFormData.result === "Positive") {
      if (
        !substanceResultFormData.level ||
        !substanceResultFormData.unitOfMeasure
      ) {
        toast.error(
          "Level and Unit of Measure are required for Positive results",
        );
        return;
      }
    }

    if (editingSubstanceResultId) {
      setSubstanceResults(
        substanceResults.map((sr) =>
          sr.id === editingSubstanceResultId
            ? { ...sr, ...substanceResultFormData }
            : sr,
        ),
      );
      toast.success("Substance result updated successfully");
    } else {
      const newId =
        Math.max(...substanceResults.map((sr) => sr.id), 0) + 1;
      setSubstanceResults([
        ...substanceResults,
        {
          id: newId,
          ...substanceResultFormData,
        },
      ]);
      toast.success("Substance result added successfully");
    }

    setSubstanceResultDialogOpen(false);
    setEditingSubstanceResultId(null);
    setSubstanceResultFormData({
      substance: "",
      result: "",
      level: "",
      unitOfMeasure: "",
    });
  };

  // Test sorting handler
  const handleTestSort = (column: string) => {
    if (testSortField === column) {
      setTestSortDirection(
        testSortDirection === "asc" ? "desc" : "asc",
      );
    } else {
      setTestSortField(column);
      setTestSortDirection("asc");
    }
  };

  // Get sorted tests
  const getSortedTests = () => {
    if (!testSortField) return substanceUseTests;

    return [...substanceUseTests].sort((a, b) => {
      // Handle results sorting specially
      if (testSortField === "results") {
        // Calculate results summary for both tests
        const getResultsSummary = (test: any) => {
          let resultsSummary = "";
          if (test.testDetails && test.testDetails.length > 0) {
            const allResults: any[] = [];
            test.testDetails.forEach((td: any) => {
              if (td.testResults && td.testResults.length > 0) {
                allResults.push(...td.testResults);
              }
            });
            if (allResults.length > 0) {
              const positiveResults = allResults.filter(
                (r) => r.result === "Positive",
              );
              if (positiveResults.length > 0) {
                resultsSummary = positiveResults
                  .map((r) => {
                    const levelUnit =
                      r.level && r.units
                        ? ` - ${r.level} ${r.units}`
                        : "";
                    return `${r.substance} (${r.result})${levelUnit}`;
                  })
                  .join("; ");
              } else {
                resultsSummary = "[All Negative]";
              }
            }
          } else if (
            test.substanceResults &&
            test.substanceResults.length > 0
          ) {
            const positiveResults =
              test.substanceResults.filter(
                (sr) => sr.result === "Positive",
              );
            if (positiveResults.length > 0) {
              resultsSummary = positiveResults
                .map((sr) => {
                  const levelUnit =
                    sr.level && sr.units
                      ? ` - ${sr.level} ${sr.units}`
                      : "";
                  return `${sr.substance} (${sr.result})${levelUnit}`;
                })
                .join("; ");
            } else {
              resultsSummary = "[All Negative]";
            }
          }
          return resultsSummary.toLowerCase();
        };

        const aResults = getResultsSummary(a);
        const bResults = getResultsSummary(b);

        if (aResults < bResults)
          return testSortDirection === "asc" ? -1 : 1;
        if (aResults > bResults)
          return testSortDirection === "asc" ? 1 : -1;
        return 0;
      }

      let aVal = a[testSortField as keyof typeof a];
      let bVal = b[testSortField as keyof typeof b];

      // Handle date sorting
      if (testSortField === "dateTime") {
        const aDate = new Date(aVal as string);
        const bDate = new Date(bVal as string);
        return testSortDirection === "asc"
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      }

      // Handle string sorting
      aVal = String(aVal || "").toLowerCase();
      bVal = String(bVal || "").toLowerCase();

      if (aVal < bVal)
        return testSortDirection === "asc" ? -1 : 1;
      if (aVal > bVal)
        return testSortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Substance Use - Disclosure Handlers
  const handleSaveDisclosure = () => {
    // Read-only (View) guard: never allow mutation to run, not just hidden buttons
    if (disclosureReadOnly) return;

    // Validate required fields
    if (
      !disclosureFormData.date ||
      !disclosureFormData.time ||
      !disclosureFormData.reporter ||
      disclosureFormData.substances.length === 0
    ) {
      toast.error(
        "Please fill in all required fields (Date, Time, Reporter, and at least one Substance)",
      );
      return;
    }

    // Validate conditional fields when Related to Test = Yes
    if (disclosureFormData.relatedToTest === "Yes") {
      if (
        !disclosureFormData.beforeAfterTest ||
        !disclosureFormData.relatedTestSet
      ) {
        toast.error(
          "Please complete Before/After Test and Related Test Set fields",
        );
        return;
      }
    }

    // Convert date from YYYY-MM-DD to MM/DD/YYYY
    const dateParts = disclosureFormData.date.split("-");
    const displayDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;

    // Convert time from 24hr to 12hr format
    const timeParts = disclosureFormData.time.split(":");
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayTime = `${displayHours}:${minutes} ${ampm}`;

    // Join substances array into string for display
    const substancesDisplay =
      disclosureFormData.substances.join(", ");

    if (editingDisclosureId) {
      setSubstanceUseDisclosures(
        substanceUseDisclosures.map((d) =>
          d.id === editingDisclosureId
            ? {
                ...d,
                date: displayDate,
                time: displayTime,
                relatedToTest: disclosureFormData.relatedToTest,
                beforeAfterTest:
                  disclosureFormData.beforeAfterTest,
                relatedTestSet:
                  disclosureFormData.relatedTestSet,
                reporter: disclosureFormData.reporter,
                substances: substancesDisplay,
                comments: disclosureFormData.comments,
              }
            : d,
        ),
      );
      toast.success("Disclosure updated successfully");
    } else {
      const newId =
        Math.max(
          ...substanceUseDisclosures.map((d) => d.id),
          0,
        ) + 1;
      setSubstanceUseDisclosures([
        ...substanceUseDisclosures,
        {
          id: newId,
          date: displayDate,
          time: displayTime,
          relatedToTest: disclosureFormData.relatedToTest,
          beforeAfterTest: disclosureFormData.beforeAfterTest,
          relatedTestSet: disclosureFormData.relatedTestSet,
          reporter: disclosureFormData.reporter,
          substances: substancesDisplay,
          comments: disclosureFormData.comments,
        },
      ]);
      toast.success("Disclosure added successfully");
    }

    setDisclosureDialogOpen(false);
    setEditingDisclosureId(null);
    setDisclosureFormData({
      date: "",
      time: "",
      relatedToTest: "No",
      beforeAfterTest: "",
      relatedTestSet: "",
      reporter: "",
      substances: [],
      comments: "",
    });
  };

  const handleRemoveDisclosureSubstance = (index: number) => {
    if (disclosureReadOnly) return;
    setDisclosureFormData({
      ...disclosureFormData,
      substances: disclosureFormData.substances.filter(
        (_, i) => i !== index,
      ),
    });
    toast.success("Substance removed");
  };

  // Disclosure Substances Selection Modal Handlers
  const handleOpenDisclosureSubstances = () => {
    if (disclosureReadOnly) return;
    setDisclosureSubstanceSelection(
      disclosureFormData.substances,
    );
    setDisclosureSubstanceSearchInput("");
    setDisclosureSubstanceSearchApplied("");
    setDisclosureSubstanceDialogOpen(true);
  };

  const toggleDisclosureSubstance = (substance: string) => {
    setDisclosureSubstanceSelection((prev) =>
      prev.includes(substance)
        ? prev.filter((s) => s !== substance)
        : [...prev, substance],
    );
  };

  const handleFindDisclosureSubstances = () => {
    setDisclosureSubstanceSearchApplied(
      disclosureSubstanceSearchInput.trim(),
    );
  };

  const handleClearDisclosureSubstances = () => {
    setDisclosureSubstanceSearchInput("");
    setDisclosureSubstanceSearchApplied("");
  };

  const handleApplyDisclosureSubstances = () => {
    if (disclosureReadOnly) return;
    if (disclosureSubstanceSelection.length === 0) {
      toast.error("Please select at least one substance");
      return;
    }
    setDisclosureFormData({
      ...disclosureFormData,
      substances: disclosureSubstanceSelection,
    });
    setDisclosureSubstanceDialogOpen(false);
  };

  const handleDisclosureSort = (field: string) => {
    if (disclosureSortField === field) {
      // Toggle direction
      setDisclosureSortDirection(
        disclosureSortDirection === "asc" ? "desc" : "asc",
      );
    } else {
      // Set new field and default to ascending
      setDisclosureSortField(field);
      setDisclosureSortDirection("asc");
    }
  };

  const getSortedDisclosures = () => {
    if (!disclosureSortField) return substanceUseDisclosures;

    return [...substanceUseDisclosures].sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      if (disclosureSortField === "dateTime") {
        // Combine date and time for sorting
        aValue = new Date(`${a.date} ${a.time}`).getTime();
        bValue = new Date(`${b.date} ${b.time}`).getTime();
      } else if (disclosureSortField === "relatedToTest") {
        aValue = a.relatedToTest;
        bValue = b.relatedToTest;
      } else if (disclosureSortField === "substances") {
        aValue = a.substances.toLowerCase();
        bValue = b.substances.toLowerCase();
      } else if (disclosureSortField === "comments") {
        aValue = a.comments.toLowerCase();
        bValue = b.comments.toLowerCase();
      }

      if (
        typeof aValue === "number" &&
        typeof bValue === "number"
      ) {
        return disclosureSortDirection === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      if (aValue < bValue)
        return disclosureSortDirection === "asc" ? -1 : 1;
      if (aValue > bValue)
        return disclosureSortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Testing & Assessments Handlers
  // Same restriction as the Create New Test button.
  const newTestRestriction =
    lead.status !== "Active" && lead.status !== "Referral"
      ? "New tests can only be added while the record is Active or Referral."
      : null;
  // Requirement action: opens the existing Add Standardized Test dialog on
  // C-SSRS Full-Lifetime. Nothing is saved until the form's own Save, and an
  // assessment draft that is already open is never replaced.
  const handleCompleteCssrsFullLifetime = () => {
    if (testingDialogOpen || newTestRestriction) return;
    handleCreateNewTest();
    setTestingFormData((prev) => ({
      ...prev,
      test: CSSRS_FULL_LIFETIME_TEST,
    }));
  };
  const handleCreateNewTest = () => {
    setEditingTestingId(null);
    resetCssrsDraft();
    setAcesFormData(emptyAcesFormData());
    setAcesDocuments([]);
    setTestingFormData({
      date: localTodayIso(),
      test: "",
      raterType: "",
      raterTypeOther: "",
      rater: "",
    });
    setSatFormData({
      totalScore: "",
      commentary: "",
    });
    setSatFormErrors({
      totalScore: "",
    });
    setActFormData({ compositeScore: "", commentary: "" });
    setActFormErrors({ compositeScore: "" });
    setPlanFormData({ compositeScore: "", commentary: "" });
    setPlanFormErrors({ compositeScore: "" });
    setWj4FormData({
      broadAchievementAE: "",
      broadAchievementRPI: "",
      broadAchievementPercentile: "",
      broadReadingAE: "",
      broadReadingRPI: "",
      broadReadingPercentile: "",
      broadMathAE: "",
      broadMathRPI: "",
      broadMathPercentile: "",
      broadWrittenLanguageAE: "",
      broadWrittenLanguageRPI: "",
      broadWrittenLanguagePercentile: "",
      commentary: "",
    });
    setWj4FormErrors({
      broadAchievementAE: "",
      broadAchievementRPI: "",
      broadAchievementPercentile: "",
      broadReadingAE: "",
      broadReadingRPI: "",
      broadReadingPercentile: "",
      broadMathAE: "",
      broadMathRPI: "",
      broadMathPercentile: "",
      broadWrittenLanguageAE: "",
      broadWrittenLanguageRPI: "",
      broadWrittenLanguagePercentile: "",
    });
    setAsebaAbclFormData({
      friends: "",
      spousePartner: "",
      personalStrengths: "",
      anxiousDepressed: "",
      withdrawn: "",
      somaticComplaints: "",
      thoughtProblems: "",
      attentionProblems: "",
      aggressiveBehavior: "",
      ruleBreakingBehavior: "",
      intrusive: "",
      internalizingProblems: "",
      externalizingProblems: "",
      totalProblems: "",
      clinicalItems: "",
      tobaccoTimesPerDay: "",
      alcoholDaysDrunk: "",
      drugsDaysUsed: "",
      meanSubstanceUse: "",
      depressiveProblems: "",
      anxietyProblems: "",
      somaticProblems: "",
      avoidantPersonality: "",
      adHProblems: "",
      antisocialPersonality: "",
      attentionProblemsInattention: "",
      attentionProblemsHyperactivity: "",
      sluggishCognitiveTempo: "",
      obsessiveCompulsiveProblems: "",
      commentary: "",
    });
    setAsebaAbclDocuments([]);
    setTestingDialogOpen(true);
  };

  const handleEditTest = () => {
    if (selectedTestId === null) {
      toast.error("Please select a test to edit");
      return;
    }
    const test = testingAssessments.find(
      (t) => t.id === selectedTestId,
    );
    if (test) {
      setEditingTestingId(test.id);
      setTestingFormData({
        date: test.date,
        test: test.test,
        raterType: test.raterType || "",
        raterTypeOther: test.raterTypeOther || "",
        rater: test.rater || "",
      });

      // Load ASEBA-ABCL data if it exists
      if (test.asebaAbclData) {
        setAsebaAbclFormData(test.asebaAbclData);
      }

      // Load ASEBA-ABCL documents if they exist
      if (test.test === "ASEBA - ABCL" && test.documents) {
        setAsebaAbclDocuments(test.documents);
      }

      // Load ASEBA-ASR data if it exists
      if (test.asebaAsrData) {
        setAsebaAsrFormData(test.asebaAsrData);
      }

      // Load ASEBA-CBCL data if it exists
      if (test.asebaCbclData) {
        setAsebaCbclFormData(test.asebaCbclData);
      }

      // Load ASEBA-YSR data if it exists
      if (test.asebaYsrData) {
        setAsebaYsrFormData(test.asebaYsrData);
      }

      // Load KBIT-2 data if it exists
      if (test.kbit2Data) {
        setKbit2FormData(test.kbit2Data);
        setKbit2FormErrors({
          verbalStandardScore: "",
          nonverbalStandardScore: "",
          iqCompositeStandardScore: "",
        });
      }

      // Load KBIT-2 documents if they exist
      if (test.test === "KBIT-2" && test.documents) {
        setKbit2Documents(test.documents);
      }

      // Load M-PACI data if it exists
      if (test.mpaciData) {
        setMpaciFormData(test.mpaciData);
      }

      // Load M-PACI documents if they exist
      if (test.test === "M-PACI" && test.documents) {
        setMpaciDocuments(test.documents);
      }

      // Load MACI data if it exists
      if (test.maciData) {
        setMaciFormData(test.maciData);
      }

      // Load MACI documents if they exist
      if (test.test === "MACI" && test.documents) {
        setMaciDocuments(test.documents);
      }

      // Load MCMI-III data if it exists
      if (test.mcmi3Data) {
        setMcmi3FormData(test.mcmi3Data);
      }

      // Load MCMI-III documents if they exist
      if (test.test === "MCMI-III" && test.documents) {
        setMcmi3Documents(test.documents);
      }

      // Load MCMI-IV data if it exists
      if (test.mcmiData) {
        setMcmiFormData(test.mcmiData);
      }

      // Load MCMI-IV documents if they exist
      if (test.test === "MCMI-IV" && test.documents) {
        setMcmiDocuments(test.documents);
      }

      // Load Self Sufficiency Matrix v2 data if it exists
      if (test.ssmData) {
        setSsmFormData(test.ssmData);
      }

      // Load Self Sufficiency Matrix v2 documents if they exist
      if (
        test.test === "Self Sufficiency Matrix v2" &&
        test.documents
      ) {
        setSsmDocuments(test.documents);
      }

      setTestingDialogOpen(true);
    }
  };

  const handleViewTest = () => {
    if (selectedTestId === null) {
      toast.error("Please select a test to view");
      return;
    }
    setViewTestDialogOpen(true);
  };

  const handleRefreshTests = () => {
    toast.success("Test data refreshed");
  };

  const handlePrintTest = () => {
    if (selectedTestId === null) {
      toast.error("Please select a test to print");
      return;
    }
    toast.success("Preparing test for printing...");
  };

  // C-SSRS Screener: validated and saved through its own store. The dialog
  // closes only after a successful write.
  const saveCssrsScreenerDraft = () => {
    const result = saveCssrsScreener({
      editingId: editingCssrsId,
      ownership: cssrsOwnership,
      assessmentDate: testingFormData.date,
      responses: cssrsResponses,
      eligibleIncidentReportIds: cssrsIrOptions.map(
        (o) => o.id,
      ),
    });
    if (!result.ok) {
      if (result.errors) {
        setCssrsErrors(result.errors);
        setCssrsSaveError(null);
        const first = firstScreenerErrorKey(
          result.errors,
          cssrsResponses,
        );
        const focusId =
          first === "assessmentDate"
            ? "test-date"
            : first === "relatedIncidentReportId"
              ? SCREENER_RELATED_IR_ID
              : first
                ? screenerFocusId(first)
                : null;
        if (focusId)
          requestAnimationFrame(() =>
            document.getElementById(focusId)?.focus(),
          );
      } else {
        setCssrsErrors({});
        setCssrsSaveError(result.error);
        toast.error(result.error);
      }
      return;
    }
    toast.success(
      editingCssrsId !== null
        ? "Test updated successfully"
        : "Test added successfully",
    );
    resetCssrsDraft();
    setEditingTestingId(null);
    setTestingFormData({ date: "", test: "" });
    setTestingDialogOpen(false);
  };

  // C-SSRS Full-Lifetime: all four sections validated, then saved through
  // the same store. The dialog closes only after a successful write.
  const saveCssrsFullLifetimeDraft = () => {
    const result = saveCssrsFullLifetime({
      editingId: editingCssrsId,
      ownership: cssrsOwnership,
      assessmentDate: testingFormData.date,
      responses: cssrsFlResponses,
    });
    if (!result.ok) {
      if (result.errors) {
        setCssrsFlErrors(result.errors);
        setCssrsSaveError(
          result.reason === "invalid" ? null : result.error,
        );
        const first = fullLifetimeErrorOrder(
          cssrsFlResponses,
        ).find((k) => result.errors![k]);
        const focusId = first
          ? fullLifetimeFieldFocusId(
              `cssrs-fl-${editingCssrsId ?? "new"}`,
              first,
            )
          : null;
        if (focusId)
          requestAnimationFrame(() =>
            document.getElementById(focusId)?.focus(),
          );
      } else {
        setCssrsFlErrors({});
        setCssrsSaveError(result.error);
        toast.error(result.error);
      }
      return;
    }
    toast.success(
      editingCssrsId !== null
        ? "Test updated successfully"
        : "Test added successfully",
    );
    resetCssrsDraft();
    setEditingTestingId(null);
    setTestingFormData({ date: "", test: "" });
    setTestingDialogOpen(false);
  };

  const handleSaveTesting = () => {
    if (testingFormData.test === CSSRS_FULL_LIFETIME_TEST) {
      saveCssrsFullLifetimeDraft();
      return;
    }
    if (testingFormData.test === CSSRS_SCREENER_TEST) {
      saveCssrsScreenerDraft();
      return;
    }
    if (!testingFormData.date.trim()) {
      toast.error("Please select a test date");
      return;
    }
    if (!testingFormData.test.trim()) {
      toast.error("Please select a test");
      return;
    }
    // Community Care: at least one member is required.
    if (
      (lead as any)?.communityCareMemberOptions &&
      !((testingFormData as any).members ?? []).length
    ) {
      toast.error("Please select at least one member");
      return;
    }

    // ACEs: answers, the manually entered Total Number of ACEs (never
    // calculated), commentary and documents are saved on the record.
    if (testingFormData.test === "ACEs") {
      const acesRecord = {
        date: testingFormData.date,
        test: "ACEs",
        summary: `Total Number of ACEs: ${acesFormData.totalAces}`,
        acesData: {
          ...acesFormData,
          answers: { ...acesFormData.answers },
        },
        documents:
          acesDocuments.length > 0 ? acesDocuments : undefined,
      };
      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? { ...t, ...acesRecord }
              : t,
          ),
        );
        toast.success("ACEs test updated successfully");
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          { id: newId, ...acesRecord },
        ]);
        toast.success("ACEs test added successfully");
      }
      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({
        date: localTodayIso(),
        test: "",
        raterType: "",
        raterTypeOther: "",
        rater: "",
      });
      setAcesFormData(emptyAcesFormData());
      setAcesDocuments([]);
      return;
    }

    // If it's a SAT test, use the SAT save logic
    if (testingFormData.test === "SAT") {
      // Validate total score is required
      if (!satFormData.totalScore) {
        setSatFormErrors({
          totalScore: "Total Score is required",
        });
        toast.error("Please enter the Total Score");
        return;
      }

      // Validate the total score
      const error = validateSatScore(
        "totalScore",
        satFormData.totalScore,
      );
      if (error) {
        setSatFormErrors({ totalScore: error });
        toast.error("Please correct the Total Score value");
        return;
      }

      // Convert date from YYYY-MM-DD to MM/DD/YYYY
      const dateParts = testingFormData.date.split("-");
      const displayDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;

      // Build summary string: Total Score: [Score]
      const summary = `Total Score: ${satFormData.totalScore}`;

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: displayDate,
                  test: "SAT",
                  summary: summary,
                  satData: {
                    ...satFormData,
                    date: testingFormData.date,
                  },
                }
              : t,
          ),
        );
        toast.success("SAT test updated successfully");
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: displayDate,
            test: "SAT",
            summary: summary,
            satData: {
              ...satFormData,
              date: testingFormData.date,
            },
          },
        ]);
        toast.success("SAT test added successfully");
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({ date: "", test: "" });
      setSatFormData({
        totalScore: "",
        commentary: "",
      });
      return;
    }

    // If it's an ACT test, use the ACT save logic
    if (testingFormData.test === "ACT") {
      // Validate composite score is required
      if (!actFormData.compositeScore) {
        setActFormErrors({
          compositeScore: "Composite Score is required",
        });
        return;
      }

      const errors: Record<string, string> = {};
      let hasError = false;
      if (actFormData.compositeScore) {
        const err = validateActScore(
          "compositeScore",
          actFormData.compositeScore,
        );
        if (err) {
          errors.compositeScore = err;
          hasError = true;
        }
      }
      if (hasError) {
        setActFormErrors((prev) => ({ ...prev, ...errors }));
        return;
      }

      const dateParts = testingFormData.date.split("-");
      const displayDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;

      // Build summary: Composite Score: [Score]
      const summary = `Composite Score: ${actFormData.compositeScore}`;

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: displayDate,
                  test: "ACT",
                  summary,
                  actData: { ...actFormData },
                }
              : t,
          ),
        );
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: displayDate,
            test: "ACT",
            summary,
            actData: { ...actFormData },
          },
        ]);
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({ date: "", test: "" });
      setActFormData({ compositeScore: "", commentary: "" });
      setActFormErrors({ compositeScore: "" });
      return;
    }

    // If it's a PLAN test, use the PLAN save logic
    if (testingFormData.test === "PLAN") {
      // Validate composite score is required
      if (!planFormData.compositeScore) {
        setPlanFormErrors({
          compositeScore: "Composite Score is required",
        });
        return;
      }

      const errors: Record<string, string> = {};
      let hasError = false;
      if (planFormData.compositeScore) {
        const err = validatePlanScore(
          "compositeScore",
          planFormData.compositeScore,
        );
        if (err) {
          errors.compositeScore = err;
          hasError = true;
        }
      }
      if (hasError) {
        setPlanFormErrors((prev) => ({ ...prev, ...errors }));
        return;
      }

      const dateParts = testingFormData.date.split("-");
      const displayDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;

      // Build summary: Composite Score: [Score]
      const summary = `Composite Score: ${planFormData.compositeScore}`;

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: displayDate,
                  test: "PLAN",
                  summary,
                  planData: { ...planFormData },
                }
              : t,
          ),
        );
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: displayDate,
            test: "PLAN",
            summary,
            planData: { ...planFormData },
          },
        ]);
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({ date: "", test: "" });
      setPlanFormData({ compositeScore: "", commentary: "" });
      setPlanFormErrors({ compositeScore: "" });
      return;
    }

    // If it's an EXPLORE test, use the EXPLORE save logic
    if (testingFormData.test === "EXPLORE") {
      // Validate composite score is required
      if (!exploreFormData.compositeScore) {
        setExploreFormErrors({
          compositeScore: "Composite Score is required",
        });
        return;
      }

      const errors: Record<string, string> = {};
      let hasError = false;
      if (exploreFormData.compositeScore) {
        const err = validateExploreScore(
          "compositeScore",
          exploreFormData.compositeScore,
        );
        if (err) {
          errors.compositeScore = err;
          hasError = true;
        }
      }
      if (hasError) {
        setExploreFormErrors((prev) => ({
          ...prev,
          ...errors,
        }));
        return;
      }

      const dateParts = testingFormData.date.split("-");
      const displayDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;

      // Build summary: Composite Score: [Score]
      const summary = `Composite Score: ${exploreFormData.compositeScore}`;

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: displayDate,
                  test: "EXPLORE",
                  summary,
                  exploreData: { ...exploreFormData },
                }
              : t,
          ),
        );
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: displayDate,
            test: "EXPLORE",
            summary,
            exploreData: { ...exploreFormData },
          },
        ]);
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({ date: "", test: "" });
      setExploreFormData({
        compositeScore: "",
        commentary: "",
      });
      setExploreFormErrors({ compositeScore: "" });
      return;
    }

    // If it's a GAIN test, use the GAIN save logic
    if (testingFormData.test === "GAIN") {
      // Validate English Composite Score is required
      if (!gainFormData.englishCompositeScore) {
        setGainFormErrors((prev) => ({
          ...prev,
          englishCompositeScore:
            "English Composite Score is required",
        }));
        toast.error("Please enter the English Composite Score");
        return;
      }

      // Validate Math Composite Score is required
      if (!gainFormData.mathCompositeScore) {
        setGainFormErrors((prev) => ({
          ...prev,
          mathCompositeScore:
            "Math Composite Score is required",
        }));
        toast.error("Please enter the Math Composite Score");
        return;
      }

      const errors: Record<string, string> = {};
      let hasError = false;

      // Validate English Composite Score
      const englishErr = validateGainScore(
        "englishCompositeScore",
        gainFormData.englishCompositeScore,
      );
      if (englishErr) {
        errors.englishCompositeScore = englishErr;
        hasError = true;
      }

      // Validate Math Composite Score
      const mathErr = validateGainScore(
        "mathCompositeScore",
        gainFormData.mathCompositeScore,
      );
      if (mathErr) {
        errors.mathCompositeScore = mathErr;
        hasError = true;
      }

      if (hasError) {
        setGainFormErrors((prev) => ({ ...prev, ...errors }));
        toast.error("Please correct the score values");
        return;
      }

      const dateParts = testingFormData.date.split("-");
      const displayDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;

      // Build summary: English: [XXXX] Math: [XXXX]
      const summary = `English: ${gainFormData.englishCompositeScore} Math: ${gainFormData.mathCompositeScore}`;

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: displayDate,
                  test: "GAIN",
                  summary,
                  gainData: { ...gainFormData },
                  documents: gainDocuments,
                }
              : t,
          ),
        );
        toast.success("GAIN test updated successfully");
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: displayDate,
            test: "GAIN",
            summary,
            gainData: { ...gainFormData },
            documents: gainDocuments,
          },
        ]);
        toast.success("GAIN test added successfully");
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({
        date: localTodayIso(),
        test: "",
        raterType: "",
        raterTypeOther: "",
        rater: "",
      });
      setGainFormData({
        englishCompositeScore: "",
        mathCompositeScore: "",
        commentary: "",
      });
      setGainFormErrors({
        englishCompositeScore: "",
        mathCompositeScore: "",
      });
      setGainDocuments([]);
      return;
    }

    // If it's a GED Official test, use the GED Official save logic
    if (testingFormData.test === "GED Official") {
      // Validate Composite Score is required
      if (!gedOfficialFormData.compositeScore) {
        setGedOfficialFormErrors((prev) => ({
          ...prev,
          compositeScore: "Composite Score is required",
        }));
        toast.error("Please enter the Composite Score");
        return;
      }

      const errors: Record<string, string> = {};
      let hasError = false;

      // Validate Composite Score
      const scoreErr = validateGedOfficialScore(
        "compositeScore",
        gedOfficialFormData.compositeScore,
      );
      if (scoreErr) {
        errors.compositeScore = scoreErr;
        hasError = true;
      }

      if (hasError) {
        setGedOfficialFormErrors((prev) => ({
          ...prev,
          ...errors,
        }));
        toast.error("Please correct the score value");
        return;
      }

      const dateParts = testingFormData.date.split("-");
      const displayDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;

      // Build summary: Composite Score: [XXX]
      const summary = `Composite Score: ${gedOfficialFormData.compositeScore}`;

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: displayDate,
                  test: "GED Official",
                  summary,
                  gedOfficialData: { ...gedOfficialFormData },
                  documents: gedOfficialDocuments,
                }
              : t,
          ),
        );
        toast.success("GED Official test updated successfully");
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: displayDate,
            test: "GED Official",
            summary,
            gedOfficialData: { ...gedOfficialFormData },
            documents: gedOfficialDocuments,
          },
        ]);
        toast.success("GED Official test added successfully");
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({
        date: localTodayIso(),
        test: "",
        raterType: "",
        raterTypeOther: "",
        rater: "",
      });
      setGedOfficialFormData({
        compositeScore: "",
        commentary: "",
      });
      setGedOfficialFormErrors({ compositeScore: "" });
      setGedOfficialDocuments([]);
      return;
    }

    // If it's a GED Ready test, use the GED Ready save logic
    if (testingFormData.test === "GED Ready") {
      // Validate Composite Score is required
      if (!gedReadyFormData.compositeScore) {
        setGedReadyFormErrors((prev) => ({
          ...prev,
          compositeScore: "Composite Score is required",
        }));
        toast.error("Please enter the Composite Score");
        return;
      }

      const errors: Record<string, string> = {};
      let hasError = false;

      // Validate Composite Score
      const scoreErr = validateGedReadyScore(
        "compositeScore",
        gedReadyFormData.compositeScore,
      );
      if (scoreErr) {
        errors.compositeScore = scoreErr;
        hasError = true;
      }

      if (hasError) {
        setGedReadyFormErrors((prev) => ({
          ...prev,
          ...errors,
        }));
        toast.error("Please correct the score value");
        return;
      }

      const dateParts = testingFormData.date.split("-");
      const displayDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;

      // Build summary: Composite Score: [XXX]
      const summary = `Composite Score: ${gedReadyFormData.compositeScore}`;

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: displayDate,
                  test: "GED Ready",
                  summary,
                  gedReadyData: { ...gedReadyFormData },
                  documents: gedReadyDocuments,
                }
              : t,
          ),
        );
        toast.success("GED Ready test updated successfully");
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: displayDate,
            test: "GED Ready",
            summary,
            gedReadyData: { ...gedReadyFormData },
            documents: gedReadyDocuments,
          },
        ]);
        toast.success("GED Ready test added successfully");
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({
        date: localTodayIso(),
        test: "",
        raterType: "",
        raterTypeOther: "",
        rater: "",
      });
      setGedReadyFormData({
        compositeScore: "",
        commentary: "",
      });
      setGedReadyFormErrors({ compositeScore: "" });
      setGedReadyDocuments([]);
      return;
    }

    // If it's a Casey Life Skills - Caregiver test, use the Casey save logic
    if (
      testingFormData.test === "Casey Life Skills - Caregiver"
    ) {
      // Validate scores (0.00-5.00 range) - all fields are optional
      const validateCaseyScore = (
        value: string,
      ): string | null => {
        if (value === "") return null; // Optional field
        const num = parseFloat(value);
        if (isNaN(num) || num < 0 || num > 5) {
          return "Please enter a value from 0.00–5.00";
        }
        return null;
      };

      const errors: Record<string, string> = {};
      let hasError = false;

      // Validate all score fields
      const scoreFields = [
        "dailyLiving",
        "selfCare",
        "relationshipsCommunication",
        "housingMoneyManagement",
        "workStudyLife",
        "careerEducation",
        "civicEngagement",
        "navigatingChildWelfare",
        "lookingForward",
      ];

      scoreFields.forEach((field) => {
        const value =
          caseyLifeSkillsFormData[
            field as keyof typeof caseyLifeSkillsFormData
          ];
        if (typeof value === "string") {
          const error = validateCaseyScore(value);
          if (error) {
            errors[field] = error;
            hasError = true;
          }
        }
      });

      if (hasError) {
        setCaseyLifeSkillsFormErrors(errors);
        toast.error("Please correct the score values");
        return;
      }

      const dateParts = testingFormData.date.split("-");
      const displayDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;

      // Build summary: DL: [X] SC: [X] RC: [X] HMT: [X] WSL: [X] CRP: [X] CE: [X] NWS: [X] LF: [X]
      const summary = `DL: ${caseyLifeSkillsFormData.dailyLiving || "N/A"} SC: ${caseyLifeSkillsFormData.selfCare || "N/A"} RC: ${caseyLifeSkillsFormData.relationshipsCommunication || "N/A"} HMT: ${caseyLifeSkillsFormData.housingMoneyManagement || "N/A"} WSL: ${caseyLifeSkillsFormData.workStudyLife || "N/A"} CRP: ${caseyLifeSkillsFormData.careerEducation || "N/A"} CE: ${caseyLifeSkillsFormData.civicEngagement || "N/A"} NWS: ${caseyLifeSkillsFormData.navigatingChildWelfare || "N/A"} LF: ${caseyLifeSkillsFormData.lookingForward || "N/A"}`;

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: displayDate,
                  test: "Casey Life Skills - Caregiver",
                  summary,
                  caseyLifeSkillsData: {
                    ...caseyLifeSkillsFormData,
                  },
                  documents: caseyLifeSkillsDocuments,
                }
              : t,
          ),
        );
        toast.success(
          "Casey Life Skills - Caregiver test updated successfully",
        );
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: displayDate,
            test: "Casey Life Skills - Caregiver",
            summary,
            caseyLifeSkillsData: { ...caseyLifeSkillsFormData },
            documents: caseyLifeSkillsDocuments,
          },
        ]);
        toast.success(
          "Casey Life Skills - Caregiver test added successfully",
        );
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({
        date: localTodayIso(),
        test: "",
        raterType: "",
        raterTypeOther: "",
        rater: "",
      });
      setCaseyLifeSkillsFormData({
        dailyLiving: "",
        selfCare: "",
        relationshipsCommunication: "",
        housingMoneyManagement: "",
        workStudyLife: "",
        careerEducation: "",
        civicEngagement: "",
        navigatingChildWelfare: "",
        lookingForward: "",
        commentary: "",
      });
      setCaseyLifeSkillsFormErrors({});
      setCaseyLifeSkillsDocuments([]);
      return;
    }

    // If it's a Casey Life Skills (Youth) test, use the Casey Youth save logic
    if (testingFormData.test === "Casey Life Skills") {
      // Validate scores (0.00-5.00 range) - all fields are optional
      const validateCaseyScore = (
        value: string,
      ): string | null => {
        if (value === "") return null; // Optional field
        const num = parseFloat(value);
        if (isNaN(num) || num < 0 || num > 5) {
          return "Please enter a value from 0.00–5.00";
        }
        return null;
      };

      const errors: Record<string, string> = {};
      let hasError = false;

      // Validate all score fields
      const scoreFields = [
        "dailyLiving",
        "selfCare",
        "relationshipsCommunication",
        "housingMoneyManagement",
        "workStudyLife",
        "careerEducation",
        "civicEngagement",
        "navigatingChildWelfare",
        "lookingForward",
      ];

      scoreFields.forEach((field) => {
        const value =
          caseyLifeSkillsYouthFormData[
            field as keyof typeof caseyLifeSkillsYouthFormData
          ];
        if (typeof value === "string") {
          const error = validateCaseyScore(value);
          if (error) {
            errors[field] = error;
            hasError = true;
          }
        }
      });

      if (hasError) {
        setCaseyLifeSkillsYouthFormErrors(errors);
        toast.error("Please correct the score values");
        return;
      }

      const dateParts = testingFormData.date.split("-");
      const displayDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;

      // Build summary: DL: [X] SC: [X] RC: [X] HMT: [X] WSL: [X] CRP: [X] CE: [X] NWS: [X] LF: [X]
      const summary = `DL: ${caseyLifeSkillsYouthFormData.dailyLiving || "N/A"} SC: ${caseyLifeSkillsYouthFormData.selfCare || "N/A"} RC: ${caseyLifeSkillsYouthFormData.relationshipsCommunication || "N/A"} HMT: ${caseyLifeSkillsYouthFormData.housingMoneyManagement || "N/A"} WSL: ${caseyLifeSkillsYouthFormData.workStudyLife || "N/A"} CRP: ${caseyLifeSkillsYouthFormData.careerEducation || "N/A"} CE: ${caseyLifeSkillsYouthFormData.civicEngagement || "N/A"} NWS: ${caseyLifeSkillsYouthFormData.navigatingChildWelfare || "N/A"} LF: ${caseyLifeSkillsYouthFormData.lookingForward || "N/A"}`;

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: displayDate,
                  test: "Casey Life Skills",
                  raterType: testingFormData.raterType,
                  rater: testingFormData.rater,
                  summary,
                  caseyLifeSkillsYouthData: {
                    ...caseyLifeSkillsYouthFormData,
                  },
                  documents: caseyLifeSkillsYouthDocuments,
                }
              : t,
          ),
        );
        toast.success(
          "Casey Life Skills test updated successfully",
        );
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: displayDate,
            test: "Casey Life Skills",
            raterType: testingFormData.raterType,
            rater: testingFormData.rater,
            summary,
            caseyLifeSkillsYouthData: {
              ...caseyLifeSkillsYouthFormData,
            },
            documents: caseyLifeSkillsYouthDocuments,
          },
        ]);
        toast.success(
          "Casey Life Skills test added successfully",
        );
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({
        date: localTodayIso(),
        test: "",
        raterType: "",
        raterTypeOther: "",
        rater: "",
      });
      setCaseyLifeSkillsYouthFormData({
        examiner: "",
        programScoresId: "",
        guardianScoresId: "",
        dailyLiving: "",
        selfCare: "",
        relationshipsCommunication: "",
        housingMoneyManagement: "",
        workStudyLife: "",
        careerEducation: "",
        civicEngagement: "",
        navigatingChildWelfare: "",
        lookingForward: "",
        commentary: "",
      });
      setCaseyLifeSkillsYouthFormErrors({});
      setCaseyLifeSkillsYouthDocuments([]);
      return;
    }

    // If it's a WJ-4 test, use the WJ-4 save logic
    if (testingFormData.test === "WJ-4") {
      const dateParts = testingFormData.date.split("-");
      const displayDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;

      // Auto-append /90 to RPI fields if not present
      const formattedData = {
        ...wj4FormData,
        broadAchievementRPI:
          wj4FormData.broadAchievementRPI &&
          !wj4FormData.broadAchievementRPI.includes("/")
            ? `${wj4FormData.broadAchievementRPI}/90`
            : wj4FormData.broadAchievementRPI,
        broadReadingRPI:
          wj4FormData.broadReadingRPI &&
          !wj4FormData.broadReadingRPI.includes("/")
            ? `${wj4FormData.broadReadingRPI}/90`
            : wj4FormData.broadReadingRPI,
        broadMathRPI:
          wj4FormData.broadMathRPI &&
          !wj4FormData.broadMathRPI.includes("/")
            ? `${wj4FormData.broadMathRPI}/90`
            : wj4FormData.broadMathRPI,
        broadWrittenLanguageRPI:
          wj4FormData.broadWrittenLanguageRPI &&
          !wj4FormData.broadWrittenLanguageRPI.includes("/")
            ? `${wj4FormData.broadWrittenLanguageRPI}/90`
            : wj4FormData.broadWrittenLanguageRPI,
      };

      // Validate all fields
      const errors: any = {};
      let hasError = false;

      Object.keys(wj4FormErrors).forEach((field) => {
        if (field !== "commentary") {
          const value =
            formattedData[field as keyof typeof formattedData];
          const error = validateWj4Field(
            field,
            value as string,
          );
          if (error) {
            errors[field] = error;
            hasError = true;
          }
        }
      });

      if (hasError) {
        setWj4FormErrors((prev) => ({ ...prev, ...errors }));
        toast.error("Please correct the validation errors");
        return;
      }

      // Build summary: BAAE: [Year-Month] BRAE: [Year-Month] BMAE: [Year-Month] BWAE: [Year-Month]
      const summary = `BAAE: ${formattedData.broadAchievementAE || "-"} BRAE: ${formattedData.broadReadingAE || "-"} BMAE: ${formattedData.broadMathAE || "-"} BWAE: ${formattedData.broadWrittenLanguageAE || "-"}`;

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: displayDate,
                  test: "WJ-4",
                  summary,
                  wj4Data: formattedData,
                }
              : t,
          ),
        );
        toast.success("WJ-4 test updated successfully");
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: displayDate,
            test: "WJ-4",
            summary,
            wj4Data: formattedData,
          },
        ]);
        toast.success("WJ-4 test added successfully");
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({ date: "", test: "" });
      setWj4FormData({
        broadAchievementAE: "",
        broadAchievementRPI: "",
        broadAchievementPercentile: "",
        broadReadingAE: "",
        broadReadingRPI: "",
        broadReadingPercentile: "",
        broadMathAE: "",
        broadMathRPI: "",
        broadMathPercentile: "",
        broadWrittenLanguageAE: "",
        broadWrittenLanguageRPI: "",
        broadWrittenLanguagePercentile: "",
        commentary: "",
      });
      setWj4FormErrors({
        broadAchievementAE: "",
        broadAchievementRPI: "",
        broadAchievementPercentile: "",
        broadReadingAE: "",
        broadReadingRPI: "",
        broadReadingPercentile: "",
        broadMathAE: "",
        broadMathRPI: "",
        broadMathPercentile: "",
        broadWrittenLanguageAE: "",
        broadWrittenLanguageRPI: "",
        broadWrittenLanguagePercentile: "",
      });
      return;
    }

    // If it's an Employability and Life Skills Assessment, use the Employability save logic
    if (
      testingFormData.test ===
      "Employability and Life Skills Assessment"
    ) {
      const dateParts = testingFormData.date.split("-");
      const displayDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;

      // Build summary: F: Y/N, Y/N, Y/N WE: #,#,#,# PS: #,#,#,# I: #,#,#,# C: #,#,#,#
      const f1 = employabilityFormData.appearanceHygiene
        ? employabilityFormData.appearanceHygiene === "Yes"
          ? "Y"
          : "N"
        : "-";
      const f2 = employabilityFormData.timeliness
        ? employabilityFormData.timeliness === "Yes"
          ? "Y"
          : "N"
        : "-";
      const f3 = employabilityFormData.oratoryPublicSpeaking
        ? employabilityFormData.oratoryPublicSpeaking === "Yes"
          ? "Y"
          : "N"
        : "-";

      const we1 = employabilityFormData.attitude || "-";
      const we2 =
        employabilityFormData.accountabilityIntegrity || "-";
      const we3 = employabilityFormData.selfControl || "-";
      const we4 =
        employabilityFormData.ambitionInitiative || "-";

      const ps1 = employabilityFormData.supervision || "-";
      const ps2 =
        employabilityFormData.procedureRuleFollowing || "-";
      const ps3 =
        employabilityFormData.problemSolvingApproach || "-";
      const ps4 =
        employabilityFormData.informationManagement || "-";

      const i1 =
        employabilityFormData.verbalCommunication || "-";
      const i2 = employabilityFormData.activeListening || "-";
      const i3 = employabilityFormData.feedback || "-";
      const i4 = employabilityFormData.teamwork || "-";

      const c1 = employabilityFormData.computerLiteracy || "-";

      const summary = `F: ${f1},${f2},${f3} WE: ${we1},${we2},${we3},${we4} PS: ${ps1},${ps2},${ps3},${ps4} I: ${i1},${i2},${i3},${i4} C: ${c1}`;

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: displayDate,
                  test: "Employability and Life Skills Assessment",
                  summary,
                  employabilityData: {
                    ...employabilityFormData,
                  },
                }
              : t,
          ),
        );
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: displayDate,
            test: "Employability and Life Skills Assessment",
            summary,
            employabilityData: { ...employabilityFormData },
          },
        ]);
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({ date: "", test: "" });
      setEmployabilityFormData({
        appearanceHygiene: "",
        timeliness: "",
        oratoryPublicSpeaking: "",
        attitude: "",
        accountabilityIntegrity: "",
        selfControl: "",
        ambitionInitiative: "",
        supervision: "",
        procedureRuleFollowing: "",
        problemSolvingApproach: "",
        informationManagement: "",
        verbalCommunication: "",
        activeListening: "",
        feedback: "",
        teamwork: "",
        computerLiteracy: "",
        commentary: "",
      });
      return;
    }

    // If it's an ASEBA - ABCL test, use ASEBA - ABCL logic
    if (testingFormData.test === "ASEBA - ABCL") {
      // Validate required fields
      if (!testingFormData.raterType) {
        toast.error("Please select a Rater Type");
        return;
      }
      if (
        testingFormData.raterType === "Other" &&
        !testingFormData.raterTypeOther.trim()
      ) {
        toast.error("Please specify the Other rater type");
        return;
      }
      if (!testingFormData.rater.trim()) {
        toast.error("Please enter a Rater");
        return;
      }

      // Build summary string: TPT: [Total Problems] IPT: [Internalizing Problems] EPT: [Externalizing Problems]
      const summary = `TPT: ${asebaAbclFormData.totalProblems || "N/A"} IPT: ${asebaAbclFormData.internalizingProblems || "N/A"} EPT: ${asebaAbclFormData.externalizingProblems || "N/A"}`;

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: testingFormData.date,
                  test: "ASEBA - ABCL",
                  summary: summary,
                  raterType: testingFormData.raterType,
                  raterTypeOther:
                    testingFormData.raterTypeOther,
                  rater: testingFormData.rater,
                  asebaAbclData: { ...asebaAbclFormData },
                  documents:
                    asebaAbclDocuments.length > 0
                      ? asebaAbclDocuments
                      : undefined,
                }
              : t,
          ),
        );
        toast.success("ASEBA - ABCL test updated successfully");
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: testingFormData.date,
            test: "ASEBA - ABCL",
            summary: summary,
            raterType: testingFormData.raterType,
            raterTypeOther: testingFormData.raterTypeOther,
            rater: testingFormData.rater,
            asebaAbclData: { ...asebaAbclFormData },
            documents:
              asebaAbclDocuments.length > 0
                ? asebaAbclDocuments
                : undefined,
          },
        ]);
        toast.success("ASEBA - ABCL test added successfully");
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({
        date: localTodayIso(),
        test: "",
        raterType: "",
        raterTypeOther: "",
        rater: "",
      });
      setAsebaAbclFormData({
        friends: "",
        spousePartner: "",
        personalStrengths: "",
        anxiousDepressed: "",
        withdrawn: "",
        somaticComplaints: "",
        thoughtProblems: "",
        attentionProblems: "",
        aggressiveBehavior: "",
        ruleBreakingBehavior: "",
        intrusive: "",
        internalizingProblems: "",
        externalizingProblems: "",
        totalProblems: "",
        clinicalItems: "",
        tobaccoTimesPerDay: "",
        alcoholDaysDrunk: "",
        drugsDaysUsed: "",
        meanSubstanceUse: "",
        depressiveProblems: "",
        anxietyProblems: "",
        somaticProblems: "",
        avoidantPersonality: "",
        adHProblems: "",
        antisocialPersonality: "",
        attentionProblemsInattention: "",
        attentionProblemsHyperactivity: "",
        sluggishCognitiveTempo: "",
        obsessiveCompulsiveProblems: "",
        commentary: "",
      });
      setAsebaAbclDocuments([]);
      return;
    }

    // If it's an ASEBA - ASR test, use ASEBA - ASR logic
    if (testingFormData.test === "ASEBA - ASR") {
      // Validate required fields
      if (!testingFormData.raterType) {
        toast.error("Please select a Rater Type");
        return;
      }
      if (
        testingFormData.raterType === "Other" &&
        !testingFormData.raterTypeOther.trim()
      ) {
        toast.error("Please specify the Other rater type");
        return;
      }
      if (!testingFormData.rater.trim()) {
        toast.error("Please enter a Rater");
        return;
      }
      if (
        asebaAsrFormData.examiner === "Other" &&
        !asebaAsrFormData.examinerOther.trim()
      ) {
        toast.error("Please specify the Other examiner");
        return;
      }

      // Build summary string: TPT: [Total Problems] IPT: [Internalizing Problems] EPT: [Externalizing Problems]
      const summary = `TPT: ${asebaAsrFormData.totalProblems || "N/A"} IPT: ${asebaAsrFormData.internalizingProblems || "N/A"} EPT: ${asebaAsrFormData.externalizingProblems || "N/A"}`;

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: testingFormData.date,
                  test: "ASEBA - ASR",
                  summary: summary,
                  raterType: testingFormData.raterType,
                  raterTypeOther:
                    testingFormData.raterTypeOther,
                  rater: testingFormData.rater,
                  asebaAsrData: { ...asebaAsrFormData },
                }
              : t,
          ),
        );
        toast.success("ASEBA - ASR test updated successfully");
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: testingFormData.date,
            test: "ASEBA - ASR",
            summary: summary,
            raterType: testingFormData.raterType,
            raterTypeOther: testingFormData.raterTypeOther,
            rater: testingFormData.rater,
            asebaAsrData: { ...asebaAsrFormData },
          },
        ]);
        toast.success("ASEBA - ASR test added successfully");
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({
        date: localTodayIso(),
        test: "",
        raterType: "",
        raterTypeOther: "",
        rater: "",
      });
      setAsebaAsrFormData({
        examiner: "",
        examinerOther: "",
        friends: "",
        spousePartner: "",
        family: "",
        job: "",
        education: "",
        meanAdaptive: "",
        personalStrengths: "",
        anxiousDepressed: "",
        withdrawn: "",
        somaticComplaints: "",
        thoughtProblems: "",
        attentionProblem: "",
        aggressiveBehavior: "",
        ruleBreakingBehavior: "",
        intrusive: "",
        internalizingProblems: "",
        externalizingProblems: "",
        totalProblems: "",
        criticalItems: "",
        tobaccoTimesPerDay: "",
        alcoholDaysDrunk: "",
        drugsDaysUsed: "",
        meanSubstanceUse: "",
        depressiveProblems: "",
        anxietyProblems: "",
        somaticProblems: "",
        avoidantPersonality: "",
        adHProblems: "",
        antisocialPersonality: "",
        attentionProblemsInattention: "",
        attentionProblemsHyperactivity: "",
        sluggishCognitiveTempo: "",
        obsessiveCompulsiveProblems: "",
        commentary: "",
      });
      return;
    }

    // If it's an ASEBA - CBCL test, use ASEBA - CBCL logic
    if (testingFormData.test === "ASEBA - CBCL") {
      // Validate required fields
      if (!testingFormData.raterType) {
        toast.error("Please select a Rater Type");
        return;
      }
      if (
        testingFormData.raterType === "Other" &&
        !testingFormData.raterTypeOther.trim()
      ) {
        toast.error("Please specify the Other rater type");
        return;
      }
      if (!testingFormData.rater.trim()) {
        toast.error("Please enter a Rater");
        return;
      }

      // Build summary string: TPT: [Total Problems] IPT: [Internalizing Problems] EPT: [Externalizing Problems]
      const summary = `TPT: ${asebaCbclFormData.totalProblems || "N/A"} IPT: ${asebaCbclFormData.internalizingProblems || "N/A"} EPT: ${asebaCbclFormData.externalizingProblems || "N/A"}`;

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: testingFormData.date,
                  test: "ASEBA - CBCL",
                  summary: summary,
                  raterType: testingFormData.raterType,
                  raterTypeOther:
                    testingFormData.raterTypeOther,
                  rater: testingFormData.rater,
                  asebaCbclData: { ...asebaCbclFormData },
                }
              : t,
          ),
        );
        toast.success("ASEBA - CBCL test updated successfully");
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: testingFormData.date,
            test: "ASEBA - CBCL",
            summary: summary,
            raterType: testingFormData.raterType,
            raterTypeOther: testingFormData.raterTypeOther,
            rater: testingFormData.rater,
            asebaCbclData: { ...asebaCbclFormData },
          },
        ]);
        toast.success("ASEBA - CBCL test added successfully");
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({
        date: localTodayIso(),
        test: "",
        raterType: "",
        raterTypeOther: "",
        rater: "",
      });
      setAsebaCbclFormData({
        activities: "",
        social: "",
        school: "",
        totalCompetence: "",
        anxiousDepressed: "",
        withdrawnDepressed: "",
        somaticComplaints: "",
        socialProblems: "",
        thoughtProblems: "",
        attentionProblems: "",
        ruleBreakingBehavior: "",
        aggressiveBehavior: "",
        internalizingProblems: "",
        externalizingProblems: "",
        totalProblems: "",
        otherProblems: "",
        depressiveProblems: "",
        anxietyProblems: "",
        somaticProblems: "",
        attentionDeficitProblems: "",
        oppositionalDefiantProblems: "",
        conductProblems: "",
        sluggishCognitiveTempo: "",
        obsessiveCompulsiveProblems: "",
        stressProblems: "",
        commentary: "",
      });
      return;
    }

    // If it's an ASEBA - YSR test, use ASEBA - YSR logic
    if (testingFormData.test === "ASEBA - YSR") {
      // Validate required fields
      if (!testingFormData.raterType) {
        toast.error("Please select a Rater Type");
        return;
      }
      if (
        testingFormData.raterType === "Other" &&
        !testingFormData.raterTypeOther.trim()
      ) {
        toast.error("Please specify the Other rater type");
        return;
      }
      if (!testingFormData.rater.trim()) {
        toast.error("Please enter a Rater");
        return;
      }
      if (
        asebaYsrFormData.examiner === "Other" &&
        !asebaYsrFormData.examinerOther.trim()
      ) {
        toast.error("Please specify the Other examiner");
        return;
      }

      // Build summary string: TPT: [Total Problems] IPT: [Internalizing Problems] EPT: [Externalizing Problems]
      const summary = `TPT: ${asebaYsrFormData.totalProblems || "N/A"} IPT: ${asebaYsrFormData.internalizingProblems || "N/A"} EPT: ${asebaYsrFormData.externalizingProblems || "N/A"}`;

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: testingFormData.date,
                  test: "ASEBA - YSR",
                  summary: summary,
                  raterType: testingFormData.raterType,
                  raterTypeOther:
                    testingFormData.raterTypeOther,
                  rater: testingFormData.rater,
                  asebaYsrData: { ...asebaYsrFormData },
                }
              : t,
          ),
        );
        toast.success("ASEBA - YSR test updated successfully");
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: testingFormData.date,
            test: "ASEBA - YSR",
            summary: summary,
            raterType: testingFormData.raterType,
            raterTypeOther: testingFormData.raterTypeOther,
            rater: testingFormData.rater,
            asebaYsrData: { ...asebaYsrFormData },
          },
        ]);
        toast.success("ASEBA - YSR test added successfully");
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({
        date: localTodayIso(),
        test: "",
        raterType: "",
        raterTypeOther: "",
        rater: "",
      });
      setAsebaYsrFormData({
        examiner: "",
        examinerOther: "",
        activities: "",
        social: "",
        academicPerformance: "",
        totalCompetence: "",
        anxiousDepressed: "",
        withdrawnDepressed: "",
        somaticComplaints: "",
        socialProblems: "",
        thoughtProblems: "",
        attentionProblems: "",
        ruleBreakingBehavior: "",
        aggressiveBehavior: "",
        internalizingProblems: "",
        externalizingProblems: "",
        totalProblems: "",
        otherProblems: "",
        depressiveProblems: "",
        anxietyProblems: "",
        somaticProblems: "",
        attentionDeficitProblems: "",
        oppositionalDefiantProblems: "",
        conductProblems: "",
        obsessiveCompulsiveProblems: "",
        stressProblems: "",
        positiveQualities: "",
        commentary: "",
      });
      return;
    }

    // If it's a KBIT-2 test, use KBIT-2 logic
    if (testingFormData.test === "KBIT-2") {
      // Validate required fields
      if (!testingFormData.raterType) {
        toast.error("Please select a Rater Type");
        return;
      }
      if (
        testingFormData.raterType === "Other" &&
        !testingFormData.raterTypeOther.trim()
      ) {
        toast.error("Please specify the Other rater type");
        return;
      }
      if (!testingFormData.rater.trim()) {
        toast.error("Please enter a Rater");
        return;
      }
      if (
        kbit2FormData.examiner === "Other" &&
        !kbit2FormData.examinerOther.trim()
      ) {
        toast.error("Please specify the Other examiner");
        return;
      }

      // Validate score ranges
      const errors: Record<string, string> = {};
      let hasError = false;

      if (kbit2FormData.verbalStandardScore) {
        const err = validateKbit2Score(
          "verbalStandardScore",
          kbit2FormData.verbalStandardScore,
        );
        if (err) {
          errors.verbalStandardScore = err;
          hasError = true;
        }
      }

      if (kbit2FormData.nonverbalStandardScore) {
        const err = validateKbit2Score(
          "nonverbalStandardScore",
          kbit2FormData.nonverbalStandardScore,
        );
        if (err) {
          errors.nonverbalStandardScore = err;
          hasError = true;
        }
      }

      if (kbit2FormData.iqCompositeStandardScore) {
        const err = validateKbit2Score(
          "iqCompositeStandardScore",
          kbit2FormData.iqCompositeStandardScore,
        );
        if (err) {
          errors.iqCompositeStandardScore = err;
          hasError = true;
        }
      }

      if (hasError) {
        setKbit2FormErrors((prev) => ({ ...prev, ...errors }));
        toast.error("Please correct the validation errors");
        return;
      }

      // Build summary string: V: [Verbal] NV: [Nonverbal] Composite: [IQ Composite]
      const summary = `V: ${kbit2FormData.verbalStandardScore || "N/A"} NV: ${kbit2FormData.nonverbalStandardScore || "N/A"} Composite: ${kbit2FormData.iqCompositeStandardScore || "N/A"}`;

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: testingFormData.date,
                  test: "KBIT-2",
                  summary: summary,
                  raterType: testingFormData.raterType,
                  raterTypeOther:
                    testingFormData.raterTypeOther,
                  rater: testingFormData.rater,
                  kbit2Data: { ...kbit2FormData },
                  documents:
                    kbit2Documents.length > 0
                      ? kbit2Documents
                      : undefined,
                }
              : t,
          ),
        );
        toast.success("KBIT-2 test updated successfully");
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: testingFormData.date,
            test: "KBIT-2",
            summary: summary,
            raterType: testingFormData.raterType,
            raterTypeOther: testingFormData.raterTypeOther,
            rater: testingFormData.rater,
            kbit2Data: { ...kbit2FormData },
            documents:
              kbit2Documents.length > 0
                ? kbit2Documents
                : undefined,
          },
        ]);
        toast.success("KBIT-2 test added successfully");
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({
        date: localTodayIso(),
        test: "",
        raterType: "",
        raterTypeOther: "",
        rater: "",
      });
      setKbit2FormData({
        examiner: "",
        examinerOther: "",
        verbalStandardScore: "",
        nonverbalStandardScore: "",
        iqCompositeStandardScore: "",
        commentary: "",
      });
      setKbit2FormErrors({
        verbalStandardScore: "",
        nonverbalStandardScore: "",
        iqCompositeStandardScore: "",
      });
      setKbit2Documents([]);
      return;
    }

    // If it's a M-PACI test, use M-PACI logic
    if (testingFormData.test === "M-PACI") {
      // Validate required fields
      if (!testingFormData.raterType) {
        toast.error("Please select a Rater Type");
        return;
      }
      if (
        testingFormData.raterType === "Other" &&
        !testingFormData.raterTypeOther.trim()
      ) {
        toast.error("Please specify the Other rater type");
        return;
      }
      if (!testingFormData.rater.trim()) {
        toast.error("Please enter a Rater");
        return;
      }
      if (
        mpaciFormData.examiner === "Other" &&
        !mpaciFormData.examinerOther.trim()
      ) {
        toast.error("Please specify the Other examiner");
        return;
      }

      // Build summary string
      const summary = "M-PACI Assessment";

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: testingFormData.date,
                  test: "M-PACI",
                  summary: summary,
                  raterType: testingFormData.raterType,
                  raterTypeOther:
                    testingFormData.raterTypeOther,
                  rater: testingFormData.rater,
                  mpaciData: { ...mpaciFormData },
                  documents:
                    mpaciDocuments.length > 0
                      ? mpaciDocuments
                      : undefined,
                }
              : t,
          ),
        );
        toast.success("M-PACI test updated successfully");
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: testingFormData.date,
            test: "M-PACI",
            summary: summary,
            raterType: testingFormData.raterType,
            raterTypeOther: testingFormData.raterTypeOther,
            rater: testingFormData.rater,
            mpaciData: { ...mpaciFormData },
            documents:
              mpaciDocuments.length > 0
                ? mpaciDocuments
                : undefined,
          },
        ]);
        toast.success("M-PACI test added successfully");
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({
        date: localTodayIso(),
        test: "",
        raterType: "",
        raterTypeOther: "",
        rater: "",
      });
      setMpaciFormData({
        examiner: "",
        examinerOther: "",
        commentary: "",
      });
      setMpaciDocuments([]);
      return;
    }

    // If it's a MACI test, use MACI logic
    if (testingFormData.test === "MACI") {
      // Validate required fields
      if (!testingFormData.raterType) {
        toast.error("Please select a Rater Type");
        return;
      }
      if (
        testingFormData.raterType === "Other" &&
        !testingFormData.raterTypeOther.trim()
      ) {
        toast.error("Please specify the Other rater type");
        return;
      }
      if (!testingFormData.rater.trim()) {
        toast.error("Please enter a Rater");
        return;
      }
      if (
        maciFormData.examiner === "Other" &&
        !maciFormData.examinerOther.trim()
      ) {
        toast.error("Please specify the Other examiner");
        return;
      }

      // Build summary string
      const summary = "MACI Assessment";

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: testingFormData.date,
                  test: "MACI",
                  summary: summary,
                  raterType: testingFormData.raterType,
                  raterTypeOther:
                    testingFormData.raterTypeOther,
                  rater: testingFormData.rater,
                  maciData: { ...maciFormData },
                  documents:
                    maciDocuments.length > 0
                      ? maciDocuments
                      : undefined,
                }
              : t,
          ),
        );
        toast.success("MACI test updated successfully");
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: testingFormData.date,
            test: "MACI",
            summary: summary,
            raterType: testingFormData.raterType,
            raterTypeOther: testingFormData.raterTypeOther,
            rater: testingFormData.rater,
            maciData: { ...maciFormData },
            documents:
              maciDocuments.length > 0
                ? maciDocuments
                : undefined,
          },
        ]);
        toast.success("MACI test added successfully");
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({
        date: localTodayIso(),
        test: "",
        raterType: "",
        raterTypeOther: "",
        rater: "",
      });
      setMaciFormData({
        examiner: "",
        examinerOther: "",
        commentary: "",
      });
      setMaciDocuments([]);
      return;
    }

    // If it's a MCMI-III test, use MCMI-III logic
    if (testingFormData.test === "MCMI-III") {
      // Validate required fields
      if (!testingFormData.raterType) {
        toast.error("Please select a Rater Type");
        return;
      }
      if (
        testingFormData.raterType === "Other" &&
        !testingFormData.raterTypeOther.trim()
      ) {
        toast.error("Please specify the Other rater type");
        return;
      }
      if (!testingFormData.rater.trim()) {
        toast.error("Please enter a Rater");
        return;
      }
      if (
        mcmi3FormData.examiner === "Other" &&
        !mcmi3FormData.examinerOther.trim()
      ) {
        toast.error("Please specify the Other examiner");
        return;
      }

      // Build summary string from commentary
      const summary = mcmi3FormData.commentary
        ? mcmi3FormData.commentary
        : "MCMI-III Assessment";

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: testingFormData.date,
                  test: "MCMI-III",
                  summary: summary,
                  raterType: testingFormData.raterType,
                  raterTypeOther:
                    testingFormData.raterTypeOther,
                  rater: testingFormData.rater,
                  mcmi3Data: { ...mcmi3FormData },
                  documents:
                    mcmi3Documents.length > 0
                      ? mcmi3Documents
                      : undefined,
                }
              : t,
          ),
        );
        toast.success("MCMI-III test updated successfully");
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: testingFormData.date,
            test: "MCMI-III",
            summary: summary,
            raterType: testingFormData.raterType,
            raterTypeOther: testingFormData.raterTypeOther,
            rater: testingFormData.rater,
            mcmi3Data: { ...mcmi3FormData },
            documents:
              mcmi3Documents.length > 0
                ? mcmi3Documents
                : undefined,
          },
        ]);
        toast.success("MCMI-III test added successfully");
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({
        date: localTodayIso(),
        test: "",
        raterType: "",
        raterTypeOther: "",
        rater: "",
      });
      setMcmi3FormData({
        examiner: "",
        examinerOther: "",
        commentary: "",
      });
      setMcmi3Documents([]);
      return;
    }

    // If it's a MCMI-IV test, use MCMI-IV logic
    if (testingFormData.test === "MCMI-IV") {
      // Validate required fields
      if (!testingFormData.raterType) {
        toast.error("Please select a Rater Type");
        return;
      }
      if (
        testingFormData.raterType === "Other" &&
        !testingFormData.raterTypeOther.trim()
      ) {
        toast.error("Please specify the Other rater type");
        return;
      }
      if (!testingFormData.rater.trim()) {
        toast.error("Please enter a Rater");
        return;
      }
      if (
        mcmiFormData.examiner === "Other" &&
        !mcmiFormData.examinerOther.trim()
      ) {
        toast.error("Please specify the Other examiner");
        return;
      }

      // Build summary string
      const summary = "MCMI-IV Assessment";

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: testingFormData.date,
                  test: "MCMI-IV",
                  summary: summary,
                  raterType: testingFormData.raterType,
                  raterTypeOther:
                    testingFormData.raterTypeOther,
                  rater: testingFormData.rater,
                  mcmiData: { ...mcmiFormData },
                  documents:
                    mcmiDocuments.length > 0
                      ? mcmiDocuments
                      : undefined,
                }
              : t,
          ),
        );
        toast.success("MCMI-IV test updated successfully");
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: testingFormData.date,
            test: "MCMI-IV",
            summary: summary,
            raterType: testingFormData.raterType,
            raterTypeOther: testingFormData.raterTypeOther,
            rater: testingFormData.rater,
            mcmiData: { ...mcmiFormData },
            documents:
              mcmiDocuments.length > 0
                ? mcmiDocuments
                : undefined,
          },
        ]);
        toast.success("MCMI-IV test added successfully");
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({
        date: localTodayIso(),
        test: "",
        raterType: "",
        raterTypeOther: "",
        rater: "",
      });
      setMcmiFormData({
        examiner: "",
        examinerOther: "",
        commentary: "",
      });
      setMcmiDocuments([]);
      return;
    }

    // If it's a Self Sufficiency Matrix v2 test, use SSM logic
    if (testingFormData.test === "Self Sufficiency Matrix v2") {
      // Community Care Member: SSM has no Rater Type (not required, not saved).
      const ssmHasRaterType = !isCommunityCareMemberNav;
      // Validate required fields
      if (ssmHasRaterType && !testingFormData.raterType) {
        toast.error("Please select a Rater Type");
        return;
      }
      if (
        ssmHasRaterType &&
        testingFormData.raterType === "Other" &&
        !testingFormData.raterTypeOther.trim()
      ) {
        toast.error("Please specify the Other rater type");
        return;
      }
      if (!testingFormData.rater.trim()) {
        toast.error("Please enter a Rater");
        return;
      }
      if (
        ssmFormData.examiner === "Other" &&
        !ssmFormData.examinerOther.trim()
      ) {
        toast.error("Please specify the Other examiner");
        return;
      }

      // Build summary string from topic statuses
      const topicsWithStatus = [];
      if (ssmFormData.housingStatus)
        topicsWithStatus.push(
          `Housing: ${ssmFormData.housingStatus}`,
        );
      if (ssmFormData.employmentFinancesStatus)
        topicsWithStatus.push(
          `Employment/Finances: ${ssmFormData.employmentFinancesStatus}`,
        );
      if (ssmFormData.foodStatus)
        topicsWithStatus.push(
          `Food: ${ssmFormData.foodStatus}`,
        );
      const summary =
        topicsWithStatus.length > 0
          ? topicsWithStatus.slice(0, 3).join(", ") +
            (topicsWithStatus.length > 3 ? "..." : "")
          : "Self Sufficiency Matrix v2 Assessment";

      if (editingTestingId !== null) {
        setTestingAssessments(
          testingAssessments.map((t) =>
            t.id === editingTestingId
              ? {
                  ...t,
                  date: testingFormData.date,
                  test: "Self Sufficiency Matrix v2",
                  summary: summary,
                  raterType: ssmHasRaterType ? testingFormData.raterType : "",
                  raterTypeOther: ssmHasRaterType
                    ? testingFormData.raterTypeOther
                    : "",
                  rater: testingFormData.rater,
                  ssmData: { ...ssmFormData },
                  members: (testingFormData as any).members ?? (t as any).members ?? [],
                  documents:
                    ssmDocuments.length > 0
                      ? ssmDocuments
                      : undefined,
                }
              : t,
          ),
        );
        toast.success(
          "Self Sufficiency Matrix v2 test updated successfully",
        );
      } else {
        const newId =
          testingAssessments.length > 0
            ? Math.max(...testingAssessments.map((t) => t.id)) +
              1
            : 1;
        setTestingAssessments([
          ...testingAssessments,
          {
            id: newId,
            date: testingFormData.date,
            test: "Self Sufficiency Matrix v2",
            summary: summary,
            raterType: ssmHasRaterType ? testingFormData.raterType : "",
            raterTypeOther: ssmHasRaterType ? testingFormData.raterTypeOther : "",
            rater: testingFormData.rater,
            ssmData: { ...ssmFormData },
            members: (testingFormData as any).members ?? [],
            documents:
              ssmDocuments.length > 0
                ? ssmDocuments
                : undefined,
          },
        ]);
        toast.success(
          "Self Sufficiency Matrix v2 test added successfully",
        );
      }

      setTestingDialogOpen(false);
      setEditingTestingId(null);
      setTestingFormData({
        date: localTodayIso(),
        test: "",
        raterType: "",
        raterTypeOther: "",
        rater: "",
      });
      setSsmFormData({
        examiner: "",
        examinerOther: "",
        housingStatus: "",
        housingComment: "",
        employmentFinancesStatus: "",
        employmentFinancesComment: "",
        foodStatus: "",
        foodComment: "",
        clothingStatus: "",
        clothingComment: "",
        transportationStatus: "",
        transportationComment: "",
        executiveFunctionsStatus: "",
        executiveFunctionsComment: "",
        adultEducationStatus: "",
        adultEducationComment: "",
        educationChildAdolescentStatus: "",
        educationChildAdolescentComment: "",
        childcareStatus: "",
        childcareComment: "",
        caregiverSkillsStatus: "",
        caregiverSkillsComment: "",
        socialSupportsStatus: "",
        socialSupportsComment: "",
        legalNonCriminalStatus: "",
        legalNonCriminalComment: "",
        legalCriminalStatus: "",
        legalCriminalComment: "",
        physicalHealthStatus: "",
        physicalHealthComment: "",
        physicalDisabilitiesStatus: "",
        physicalDisabilitiesComment: "",
        substanceUseStatus: "",
        substanceUseComment: "",
        mentalHealthStatus: "",
        mentalHealthComment: "",
        safetyStatus: "",
        safetyComment: "",
        notesForGoals: "",
        passionStatement: "",
      });
      setSsmDocuments([]);
      return;
    }

    // For non-SAT/ACT/PLAN/EXPLORE/Employability/ASEBA/KBIT-2/M-PACI/MACI/MCMI-IV/SSM tests, use regular logic
    if (editingTestingId !== null) {
      setTestingAssessments(
        testingAssessments.map((t) =>
          t.id === editingTestingId
            ? {
                ...t,
                date: testingFormData.date,
                test: testingFormData.test,
                summary: `${testingFormData.test}: Assessment details`,
              }
            : t,
        ),
      );
      toast.success("Test updated successfully");
    } else {
      const newId =
        testingAssessments.length > 0
          ? Math.max(...testingAssessments.map((t) => t.id)) + 1
          : 1;
      setTestingAssessments([
        ...testingAssessments,
        {
          id: newId,
          date: testingFormData.date,
          test: testingFormData.test,
          summary: `${testingFormData.test}: Assessment details`,
        },
      ]);
      toast.success("Test added successfully");
    }

    setEditingTestingId(null);
    setTestingFormData({ date: "", test: "" });
    setTestingDialogOpen(false);
  };

  // Testing & Assessments - Sorting Handler
  const handleTestingSort = (column: "date" | "test") => {
    if (testingSortColumn === column) {
      setTestingSortDirection(
        testingSortDirection === "asc" ? "desc" : "asc",
      );
    } else {
      setTestingSortColumn(column);
      setTestingSortDirection("asc");
    }
  };

  // Testing & Assessments - Edit Handler (from row)
  const handleEditTestRow = (testId: number | string) => {
    // C-SSRS records are edited from their own store, never the legacy list.
    if (typeof testId === "string") {
      const record = cssrsRecords.find((r) => r.id === testId);
      if (!record) return;
      setEditingTestingId(null);
      setEditingCssrsId(record.id);
      setCssrsErrors({});
      setCssrsFlErrors({});
      setCssrsSaveError(null);
      if (record.instrument === "cssrs-screener")
        setCssrsResponses(structuredClone(record.responses));
      // A saved record from before the Actual Attempt questions opens with
      // them added (unanswered); the stored record is untouched until Save.
      else
        setCssrsFlResponses(
          upgradeFullLifetimeResponses(
            structuredClone(record.responses),
          ),
        );
      setTestingFormData({
        date: record.assessmentDate,
        test:
          record.instrument === "cssrs-screener"
            ? CSSRS_SCREENER_TEST
            : CSSRS_FULL_LIFETIME_TEST,
        raterType: "",
        raterTypeOther: "",
        rater: "",
      });
      setTestingDialogOpen(true);
      return;
    }
    const test = testingAssessments.find(
      (t) => t.id === testId,
    );
    if (test) {
      {
        setEditingTestingId(test.id);

        // Convert date from MM/DD/YYYY to YYYY-MM-DD format
        const dateParts = test.date.split("/");
        const formattedDate =
          dateParts.length === 3
            ? `${dateParts[2]}-${dateParts[0].padStart(2, "0")}-${dateParts[1].padStart(2, "0")}`
            : test.date;

        setTestingFormData({
          date: formattedDate,
          test: test.test,
          raterType: test.raterType || "",
          raterTypeOther: test.raterTypeOther || "",
          rater: test.rater || "",
          members: (test as any).members ?? [],
        } as any);

        // ACEs: restore answers, the saved total and commentary, and files.
        // Older records hold only totalAces.
        if (test.test === "ACEs") {
          const saved = (test as any).acesData as
            AcesFormData | undefined;
          setAcesFormData(
            saved
              ? { ...saved, answers: { ...saved.answers } }
              : {
                  ...emptyAcesFormData(),
                  totalAces:
                    test.totalAces != null
                      ? String(test.totalAces)
                      : "0",
                },
          );
          setAcesDocuments(test.documents ?? []);
        }

        // If it's an ASEBA - ABCL test, populate ASEBA - ABCL form data
        if (
          test.test === "ASEBA - ABCL" &&
          test.asebaAbclData
        ) {
          setAsebaAbclFormData(test.asebaAbclData);
        }

        // If it's an ASEBA - ASR test, populate ASEBA - ASR form data
        if (test.test === "ASEBA - ASR" && test.asebaAsrData) {
          setAsebaAsrFormData(test.asebaAsrData);
        }

        // If it's an ASEBA - CBCL test, populate ASEBA - CBCL form data
        if (
          test.test === "ASEBA - CBCL" &&
          test.asebaCbclData
        ) {
          setAsebaCbclFormData(test.asebaCbclData);
        }

        // If it's an ACT test, populate ACT form data
        if (test.test === "ACT" && test.actData) {
          setActFormData({
            compositeScore: test.actData.compositeScore || "",
            commentary: test.actData.commentary || "",
          });
          setActFormErrors({ compositeScore: "" });
        }

        // If it's a SAT test, populate SAT form data
        if (test.test === "SAT" && test.satData) {
          const dateParts = test.date.split("/");
          const formattedDate = `${dateParts[2]}-${dateParts[0].padStart(2, "0")}-${dateParts[1].padStart(2, "0")}`;
          setSatFormData({
            date: formattedDate,
            essayReading: test.satData.essayReading || "",
            essayAnalysis: test.satData.essayAnalysis || "",
            essayWriting: test.satData.essayWriting || "",
            sectionEvidenceReading:
              test.satData.sectionEvidenceReading || "",
            sectionMath: test.satData.sectionMath || "",
            testReading: test.satData.testReading || "",
            testWritingLanguage:
              test.satData.testWritingLanguage || "",
            testMath: test.satData.testMath || "",
            crossTestHistory:
              test.satData.crossTestHistory || "",
            crossTestScience:
              test.satData.crossTestScience || "",
            subscoreEvidence:
              test.satData.subscoreEvidence || "",
            subscoreWords: test.satData.subscoreWords || "",
            subscoreExpression:
              test.satData.subscoreExpression || "",
            subscoreConventions:
              test.satData.subscoreConventions || "",
            subscoreAlgebra: test.satData.subscoreAlgebra || "",
            subscoreDataAnalysis:
              test.satData.subscoreDataAnalysis || "",
            subscoreAdvancedMath:
              test.satData.subscoreAdvancedMath || "",
            totalScore: test.satData.totalScore || "",
            commentary: test.satData.commentary || "",
          });
          // Load documents if they exist
          if (test.documents) {
            setSatDocuments(test.documents);
          } else {
            setSatDocuments([]);
          }
        }

        // If it's a PLAN test, populate PLAN form data
        if (test.test === "PLAN" && test.planData) {
          setPlanFormData({
            compositeScore: test.planData.compositeScore || "",
            commentary: test.planData.commentary || "",
          });
          setPlanFormErrors({ compositeScore: "" });
        }

        // If it's an EXPLORE test, populate EXPLORE form data
        if (test.test === "EXPLORE" && test.exploreData) {
          setExploreFormData({
            compositeScore:
              test.exploreData.compositeScore || "",
            commentary: test.exploreData.commentary || "",
          });
          setExploreFormErrors({ compositeScore: "" });
        }

        // If it's a GAIN test, populate GAIN form data
        if (test.test === "GAIN" && test.gainData) {
          setGainFormData({
            englishCompositeScore:
              test.gainData.englishCompositeScore || "",
            mathCompositeScore:
              test.gainData.mathCompositeScore || "",
            commentary: test.gainData.commentary || "",
          });
          setGainFormErrors({
            englishCompositeScore: "",
            mathCompositeScore: "",
          });
        }

        // Load GAIN documents if they exist
        if (test.test === "GAIN" && test.documents) {
          setGainDocuments(test.documents);
        }

        // If it's a GED Official test, populate GED Official form data
        if (
          test.test === "GED Official" &&
          test.gedOfficialData
        ) {
          setGedOfficialFormData({
            compositeScore:
              test.gedOfficialData.compositeScore || "",
            commentary: test.gedOfficialData.commentary || "",
          });
          setGedOfficialFormErrors({
            compositeScore: "",
          });
        }

        // Load GED Official documents if they exist
        if (test.test === "GED Official" && test.documents) {
          setGedOfficialDocuments(test.documents);
        }

        // If it's a GED Ready test, populate GED Ready form data
        if (test.test === "GED Ready" && test.gedReadyData) {
          setGedReadyFormData({
            compositeScore:
              test.gedReadyData.compositeScore || "",
            commentary: test.gedReadyData.commentary || "",
          });
          setGedReadyFormErrors({
            compositeScore: "",
          });
        }

        // Load GED Ready documents if they exist
        if (test.test === "GED Ready" && test.documents) {
          setGedReadyDocuments(test.documents);
        }

        // If it's a Casey Life Skills - Caregiver test, populate Casey form data
        if (
          test.test === "Casey Life Skills - Caregiver" &&
          test.caseyLifeSkillsData
        ) {
          setCaseyLifeSkillsFormData({
            dailyLiving:
              test.caseyLifeSkillsData.dailyLiving || "",
            selfCare: test.caseyLifeSkillsData.selfCare || "",
            relationshipsCommunication:
              test.caseyLifeSkillsData
                .relationshipsCommunication || "",
            housingMoneyManagement:
              test.caseyLifeSkillsData.housingMoneyManagement ||
              "",
            workStudyLife:
              test.caseyLifeSkillsData.workStudyLife || "",
            careerEducation:
              test.caseyLifeSkillsData.careerEducation || "",
            civicEngagement:
              test.caseyLifeSkillsData.civicEngagement || "",
            navigatingChildWelfare:
              test.caseyLifeSkillsData.navigatingChildWelfare ||
              "",
            lookingForward:
              test.caseyLifeSkillsData.lookingForward || "",
            commentary:
              test.caseyLifeSkillsData.commentary || "",
          });
          setCaseyLifeSkillsFormErrors({});
        }

        // Load Casey Life Skills documents if they exist
        if (
          test.test === "Casey Life Skills - Caregiver" &&
          test.documents
        ) {
          setCaseyLifeSkillsDocuments(test.documents);
        }

        // If it's a Casey Life Skills (Youth) test, populate Casey Youth form data
        if (
          test.test === "Casey Life Skills" &&
          test.caseyLifeSkillsYouthData
        ) {
          setCaseyLifeSkillsYouthFormData({
            examiner:
              test.caseyLifeSkillsYouthData.examiner || "",
            programScoresId:
              test.caseyLifeSkillsYouthData.programScoresId ||
              "",
            guardianScoresId:
              test.caseyLifeSkillsYouthData.guardianScoresId ||
              "",
            dailyLiving:
              test.caseyLifeSkillsYouthData.dailyLiving || "",
            selfCare:
              test.caseyLifeSkillsYouthData.selfCare || "",
            relationshipsCommunication:
              test.caseyLifeSkillsYouthData
                .relationshipsCommunication || "",
            housingMoneyManagement:
              test.caseyLifeSkillsYouthData
                .housingMoneyManagement || "",
            workStudyLife:
              test.caseyLifeSkillsYouthData.workStudyLife || "",
            careerEducation:
              test.caseyLifeSkillsYouthData.careerEducation ||
              "",
            civicEngagement:
              test.caseyLifeSkillsYouthData.civicEngagement ||
              "",
            navigatingChildWelfare:
              test.caseyLifeSkillsYouthData
                .navigatingChildWelfare || "",
            lookingForward:
              test.caseyLifeSkillsYouthData.lookingForward ||
              "",
            commentary:
              test.caseyLifeSkillsYouthData.commentary || "",
          });
          setCaseyLifeSkillsYouthFormErrors({});
        }

        // Load Casey Life Skills Youth documents if they exist
        if (
          test.test === "Casey Life Skills" &&
          test.documents
        ) {
          setCaseyLifeSkillsYouthDocuments(test.documents);
        }

        // If it's an Employability and Life Skills Assessment, populate Employability form data
        if (
          test.test ===
            "Employability and Life Skills Assessment" &&
          test.employabilityData
        ) {
          setEmployabilityFormData({
            appearanceHygiene:
              test.employabilityData.appearanceHygiene || "",
            timeliness: test.employabilityData.timeliness || "",
            oratoryPublicSpeaking:
              test.employabilityData.oratoryPublicSpeaking ||
              "",
            attitude: test.employabilityData.attitude || "",
            accountabilityIntegrity:
              test.employabilityData.accountabilityIntegrity ||
              "",
            selfControl:
              test.employabilityData.selfControl || "",
            ambitionInitiative:
              test.employabilityData.ambitionInitiative || "",
            supervision:
              test.employabilityData.supervision || "",
            procedureRuleFollowing:
              test.employabilityData.procedureRuleFollowing ||
              "",
            problemSolvingApproach:
              test.employabilityData.problemSolvingApproach ||
              "",
            informationManagement:
              test.employabilityData.informationManagement ||
              "",
            verbalCommunication:
              test.employabilityData.verbalCommunication || "",
            activeListening:
              test.employabilityData.activeListening || "",
            feedback: test.employabilityData.feedback || "",
            teamwork: test.employabilityData.teamwork || "",
            computerLiteracy:
              test.employabilityData.computerLiteracy || "",
            commentary: test.employabilityData.commentary || "",
          });
        }

        // If it's a M-PACI test, populate M-PACI form data
        if (test.test === "M-PACI" && test.mpaciData) {
          setMpaciFormData({
            examiner: test.mpaciData.examiner || "",
            examinerOther: test.mpaciData.examinerOther || "",
            commentary: test.mpaciData.commentary || "",
          });
          // Load documents if they exist
          if (test.documents) {
            setMpaciDocuments(test.documents);
          } else {
            setMpaciDocuments([]);
          }
        }

        // If it's a MACI test, populate MACI form data
        if (test.test === "MACI" && test.maciData) {
          setMaciFormData({
            examiner: test.maciData.examiner || "",
            examinerOther: test.maciData.examinerOther || "",
            commentary: test.maciData.commentary || "",
          });
          // Load documents if they exist
          if (test.documents) {
            setMaciDocuments(test.documents);
          } else {
            setMaciDocuments([]);
          }
        }

        // If it's a MCMI-III test, populate MCMI-III form data
        if (test.test === "MCMI-III" && test.mcmi3Data) {
          setMcmi3FormData({
            examiner: test.mcmi3Data.examiner || "",
            examinerOther: test.mcmi3Data.examinerOther || "",
            commentary: test.mcmi3Data.commentary || "",
          });
          // Load documents if they exist
          if (test.documents) {
            setMcmi3Documents(test.documents);
          } else {
            setMcmi3Documents([]);
          }
        }

        // If it's a MCMI-IV test, populate MCMI-IV form data
        if (test.test === "MCMI-IV" && test.mcmiData) {
          setMcmiFormData({
            examiner: test.mcmiData.examiner || "",
            examinerOther: test.mcmiData.examinerOther || "",
            commentary: test.mcmiData.commentary || "",
          });
          // Load documents if they exist
          if (test.documents) {
            setMcmiDocuments(test.documents);
          } else {
            setMcmiDocuments([]);
          }
        }

        // If it's a Self Sufficiency Matrix v2 test, populate SSM form data
        if (
          test.test === "Self Sufficiency Matrix v2" &&
          test.ssmData
        ) {
          setSsmFormData(test.ssmData);
          // Load documents if they exist
          if (test.documents) {
            setSsmDocuments(test.documents);
          } else {
            setSsmDocuments([]);
          }
        }

        setTestingDialogOpen(true);
      }
    }
  };

  // Testing & Assessments - Delete Handler
  const handleDeleteTest = (testId: number) => {
    if (!isSystemAdministrator) {
      toast.error(
        "Only System Administrators can delete test records",
      );
      return;
    }

    // Check if this is a Casey Life Skills - Caregiver record (AC1, AC12)
    const testToDeleteRecord = testingAssessments.find(
      (t) => t.id === testId,
    );

    if (
      testToDeleteRecord &&
      testToDeleteRecord.test ===
        "Casey Life Skills - Caregiver"
    ) {
      // Check if there's a linked Casey Life Skills (Youth) assessment
      const linkedYouthAssessment = testingAssessments.find(
        (t) =>
          t.test === "Casey Life Skills" &&
          t.caseyLifeSkillsYouthData?.guardianScoresId ===
            testId.toString(),
      );

      if (linkedYouthAssessment) {
        // Caregiver is linked to a Youth's Casey Life Skills Assessment (AC1)
        setCaregiverLinkedToAssessment(true);
      } else {
        // No linkage - proceed with normal deletion (AC12)
        setCaregiverLinkedToAssessment(false);
      }
    } else {
      // Not a Caregiver record - normal deletion (AC12)
      setCaregiverLinkedToAssessment(false);
    }

    setTestToDelete(testId);
    setDeleteTestConfirmOpen(true);
  };

  const confirmDeleteTest = () => {
    if (testToDelete !== null) {
      // AC7: Delete the Caregiver record
      // AC8: Remove the Caregiver's association to the Youth's Casey Life Skills Assessment
      if (caregiverLinkedToAssessment) {
        // Remove association from Youth's Casey Life Skills Assessment
        setTestingAssessments(
          testingAssessments
            .map((t) => {
              if (
                t.test === "Casey Life Skills" &&
                t.caseyLifeSkillsYouthData?.guardianScoresId ===
                  testToDelete.toString()
              ) {
                // AC9: Only modify the guardian association, no other assessment data
                return {
                  ...t,
                  caseyLifeSkillsYouthData: {
                    ...t.caseyLifeSkillsYouthData!,
                    guardianScoresId: "", // Remove the association
                  },
                };
              }
              return t;
            })
            .filter((t) => t.id !== testToDelete),
        ); // Remove the Caregiver record

        toast.success(
          "Caregiver record deleted and removed from Youth's Casey Life Skills Assessment",
        );
      } else {
        // Normal deletion for non-linked records
        setTestingAssessments(
          testingAssessments.filter(
            (t) => t.id !== testToDelete,
          ),
        );
        toast.success("Test record deleted successfully");
      }

      setTestToDelete(null);
      setDeleteTestConfirmOpen(false);
      setSelectedTestId(null);
      setCaregiverLinkedToAssessment(false);
    }
  };

  // Testing Dialog - Cancel Handler
  const handleCancelTesting = () => {
    setTestingDialogOpen(false);
    setEditingTestingId(null);
    resetCssrsDraft();
    setAcesFormData(emptyAcesFormData());
    setAcesDocuments([]);
    // Reset all test-specific forms
    setCaseyLifeSkillsFormData({
      dailyLiving: "",
      selfCare: "",
      relationshipsCommunication: "",
      housingMoneyManagement: "",
      workStudyLife: "",
      careerEducation: "",
      civicEngagement: "",
      navigatingChildWelfare: "",
      lookingForward: "",
      commentary: "",
    });
    setCaseyLifeSkillsFormErrors({});
    setCaseyLifeSkillsDocuments([]);
    setCaseyLifeSkillsYouthFormData({
      examiner: "",
      programScoresId: "",
      guardianScoresId: "",
      dailyLiving: "",
      selfCare: "",
      relationshipsCommunication: "",
      housingMoneyManagement: "",
      workStudyLife: "",
      careerEducation: "",
      civicEngagement: "",
      navigatingChildWelfare: "",
      lookingForward: "",
      commentary: "",
    });
    setCaseyLifeSkillsYouthFormErrors({});
    setCaseyLifeSkillsYouthDocuments([]);
  };

  // SAT Test Validation
  const validateSatScore = (field: string, value: string) => {
    if (!value) return "";
    const num = parseInt(value);

    // Total Score: 400-1600
    if (field === "totalScore") {
      if (num < 400 || num > 1600) {
        return "Please enter a value from 400-1600";
      }
    }
    return "";
  };

  // ACT Test Validation
  const validateActScore = (field: string, value: string) => {
    if (!value) return "";
    const num = parseInt(value);
    // Composite Score: 1-36
    if (field === "compositeScore") {
      if (isNaN(num) || num < 1 || num > 36)
        return "Please enter a value from 1-36";
    }
    return "";
  };

  // ACT Score Change Handler
  const handleActScoreChange = (
    field: string,
    value: string,
  ) => {
    if (value && !/^\d+$/.test(value)) return;
    setActFormData((prev) => ({ ...prev, [field]: value }));
    setActFormErrors((prev) => ({
      ...prev,
      [field]: validateActScore(field, value),
    }));
  };

  // SAT Document Handlers
  const handleSatFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleSatFilesUpload(Array.from(files));
    }
  };

  const handleSatFilesUpload = (files: File[]) => {
    const newDocuments = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedDate: formatMdy(new Date()),
      url: URL.createObjectURL(file),
    }));
    setSatDocuments((prev) => [...prev, ...newDocuments]);
    toast.success(
      `${files.length} document${files.length > 1 ? "s" : ""} uploaded successfully`,
    );
  };

  // KBIT-2 Validation
  const validateKbit2Score = (field: string, value: string) => {
    if (!value) return "";
    const num = parseInt(value);
    if (isNaN(num) || num < 40 || num > 160) {
      return "The number entered must be between 40 – 160";
    }
    return "";
  };

  // KBIT-2 Score Change Handler
  const handleKbit2ScoreChange = (
    field: string,
    value: string,
  ) => {
    if (value && !/^\d+$/.test(value)) return;
    setKbit2FormData((prev) => ({ ...prev, [field]: value }));
    setKbit2FormErrors((prev) => ({
      ...prev,
      [field]: validateKbit2Score(field, value),
    }));
  };

  // Calculate KBIT-2 Difference and Significance
  const calculateKbit2Difference = () => {
    const verbal = parseInt(kbit2FormData.verbalStandardScore);
    const nonverbal = parseInt(
      kbit2FormData.nonverbalStandardScore,
    );

    if (
      isNaN(verbal) ||
      isNaN(nonverbal) ||
      verbal < 40 ||
      verbal > 160 ||
      nonverbal < 40 ||
      nonverbal > 160
    ) {
      return null;
    }

    return Math.abs(verbal - nonverbal);
  };

  const calculateKbit2Significance = () => {
    const difference = calculateKbit2Difference();

    if (difference === null) {
      return "";
    }

    if (difference >= 0 && difference <= 12) {
      return "No Significance";
    } else if (difference >= 13 && difference <= 16) {
      return "p<.05";
    } else if (difference >= 17 && difference <= 120) {
      return "p<.01";
    }

    return "";
  };

  // ASEBA - ABCL Document Handlers
  const handleAsebaAbclFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleAsebaAbclFilesUpload(Array.from(files));
    }
  };

  const handleAsebaAbclFilesUpload = (files: File[]) => {
    const newDocuments = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedDate: formatMdy(new Date()),
      url: URL.createObjectURL(file),
    }));
    setAsebaAbclDocuments((prev) => [...prev, ...newDocuments]);
    toast.success(
      `${files.length} document${files.length > 1 ? "s" : ""} uploaded successfully`,
    );
  };

  const handleAsebaAbclRemoveDocument = (docId: number) => {
    setAsebaAbclDocuments((prev) =>
      prev.filter((doc) => doc.id !== docId),
    );
    toast.success("Document removed successfully");
  };

  // KBIT-2 Document Handlers
  const handleKbit2FileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleKbit2FilesUpload(Array.from(files));
    }
  };

  const handleKbit2FilesUpload = (files: File[]) => {
    const newDocuments = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedDate: formatMdy(new Date()),
      url: URL.createObjectURL(file),
    }));
    setKbit2Documents((prev) => [...prev, ...newDocuments]);
    toast.success(
      `${files.length} document${files.length > 1 ? "s" : ""} uploaded successfully`,
    );
  };

  // ACEs documents — same prototype upload as the other tests (object URLs)
  const handleAcesFilesUpload = (files: File[]) => {
    const newDocuments = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedDate: formatMdy(new Date()),
      url: URL.createObjectURL(file),
    }));
    setAcesDocuments((prev) => [...prev, ...newDocuments]);
    toast.success(
      `${files.length} document${files.length > 1 ? "s" : ""} uploaded successfully`,
    );
  };

  const handleAcesRemoveDocument = (docId: number) => {
    setAcesDocuments((prev) =>
      prev.filter((doc) => doc.id !== docId),
    );
    toast.success("Document removed successfully");
  };

  /** Opens the existing test document viewer on a given list and file. */
  const handleViewDocumentAt = (
    docs: AcesDocument[],
    index: number,
  ) => {
    setSelectedTestDocuments(docs);
    setCurrentTestDocumentIndex(index);
    setTestDocumentViewerOpen(true);
  };

  const handleKbit2RemoveDocument = (docId: number) => {
    setKbit2Documents((prev) =>
      prev.filter((doc) => doc.id !== docId),
    );
    toast.success("Document removed successfully");
  };

  // M-PACI Document Handlers
  const handleMpaciFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleMpaciFilesUpload(Array.from(files));
    }
  };

  const handleMpaciFilesUpload = (files: File[]) => {
    const newDocuments = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedDate: formatMdy(new Date()),
      url: URL.createObjectURL(file),
    }));
    setMpaciDocuments((prev) => [...prev, ...newDocuments]);
    toast.success(
      `${files.length} document${files.length > 1 ? "s" : ""} uploaded successfully`,
    );
  };

  const handleMpaciRemoveDocument = (docId: number) => {
    setMpaciDocuments((prev) =>
      prev.filter((doc) => doc.id !== docId),
    );
    toast.success("Document removed successfully");
  };

  // MACI Document Handlers
  const handleMaciFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleMaciFilesUpload(Array.from(files));
    }
  };

  const handleMaciFilesUpload = (files: File[]) => {
    const newDocuments = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedDate: formatMdy(new Date()),
      url: URL.createObjectURL(file),
    }));
    setMaciDocuments((prev) => [...prev, ...newDocuments]);
    toast.success(
      `${files.length} document${files.length > 1 ? "s" : ""} uploaded successfully`,
    );
  };

  const handleMaciRemoveDocument = (docId: number) => {
    setMaciDocuments((prev) =>
      prev.filter((doc) => doc.id !== docId),
    );
    toast.success("Document removed successfully");
  };

  // MCMI-IV Document Handlers
  const handleMcmiFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleMcmiFilesUpload(Array.from(files));
    }
  };

  const handleMcmiFilesUpload = (files: File[]) => {
    const newDocuments = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedDate: formatMdy(new Date()),
      url: URL.createObjectURL(file),
    }));
    setMcmiDocuments((prev) => [...prev, ...newDocuments]);
    toast.success(
      `${files.length} document${files.length > 1 ? "s" : ""} uploaded successfully`,
    );
  };

  const handleMcmiRemoveDocument = (docId: number) => {
    setMcmiDocuments((prev) =>
      prev.filter((doc) => doc.id !== docId),
    );
    toast.success("Document removed successfully");
  };

  // Self Sufficiency Matrix v2 Document Handlers
  const handleSsmFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleSsmFilesUpload(Array.from(files));
    }
  };

  const handleSsmFilesUpload = (files: File[]) => {
    const newDocuments = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedDate: formatMdy(new Date()),
      url: URL.createObjectURL(file),
    }));
    setSsmDocuments((prev) => [...prev, ...newDocuments]);
    toast.success(
      `${files.length} document${files.length > 1 ? "s" : ""} uploaded successfully`,
    );
  };

  const handleSsmRemoveDocument = (docId: number) => {
    setSsmDocuments((prev) =>
      prev.filter((doc) => doc.id !== docId),
    );
    toast.success("Document removed successfully");
  };

  // ACT Document Handlers
  const handleActFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleActFilesUpload(Array.from(files));
    }
  };

  const handleActFilesUpload = (files: File[]) => {
    const newDocuments = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedDate: formatMdy(new Date()),
      url: URL.createObjectURL(file),
    }));
    setActDocuments((prev) => [...prev, ...newDocuments]);
    toast.success(
      `${files.length} document${files.length > 1 ? "s" : ""} uploaded successfully`,
    );
  };

  const handleActRemoveDocument = (docId: number) => {
    setActDocuments((prev) =>
      prev.filter((doc) => doc.id !== docId),
    );
    toast.success("Document removed successfully");
  };

  // PLAN Document Handlers
  const handlePlanFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handlePlanFilesUpload(Array.from(files));
    }
  };

  const handlePlanFilesUpload = (files: File[]) => {
    const newDocuments = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedDate: formatMdy(new Date()),
      url: URL.createObjectURL(file),
    }));
    setPlanDocuments((prev) => [...prev, ...newDocuments]);
    toast.success(
      `${files.length} document${files.length > 1 ? "s" : ""} uploaded successfully`,
    );
  };

  const handlePlanRemoveDocument = (docId: number) => {
    setPlanDocuments((prev) =>
      prev.filter((doc) => doc.id !== docId),
    );
    toast.success("Document removed successfully");
  };

  // EXPLORE Document Handlers
  const handleExploreFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleExploreFilesUpload(Array.from(files));
    }
  };

  const handleExploreFilesUpload = (files: File[]) => {
    const newDocuments = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedDate: formatMdy(new Date()),
      url: URL.createObjectURL(file),
    }));
    setExploreDocuments((prev) => [...prev, ...newDocuments]);
    toast.success(
      `${files.length} document${files.length > 1 ? "s" : ""} uploaded successfully`,
    );
  };

  const handleExploreRemoveDocument = (docId: number) => {
    setExploreDocuments((prev) =>
      prev.filter((doc) => doc.id !== docId),
    );
    toast.success("Document removed successfully");
  };

  // Employability Document Handlers
  const handleEmployabilityFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleEmployabilityFilesUpload(Array.from(files));
    }
  };

  const handleEmployabilityFilesUpload = (files: File[]) => {
    const newDocuments = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedDate: formatMdy(new Date()),
      url: URL.createObjectURL(file),
    }));
    setEmployabilityDocuments((prev) => [
      ...prev,
      ...newDocuments,
    ]);
    toast.success(
      `${files.length} document${files.length > 1 ? "s" : ""} uploaded successfully`,
    );
  };

  const handleEmployabilityRemoveDocument = (docId: number) => {
    setEmployabilityDocuments((prev) =>
      prev.filter((doc) => doc.id !== docId),
    );
    toast.success("Document removed successfully");
  };

  const handleSatDragOver = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleSatDrop = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleSatFilesUpload(Array.from(files));
    }
  };

  const handleSatDocumentView = (
    document: (typeof satDocuments)[0],
  ) => {
    setSelectedSatDocument(document);
    setSatDocumentViewerOpen(true);
  };

  const handleSatDocumentDownload = (
    document: (typeof satDocuments)[0],
  ) => {
    const link = document.createElement("a");
    link.href = document.url;
    link.download = document.name;
    link.click();
    toast.success("Document downloaded");
  };

  const handleSatDocumentDelete = (documentId: number) => {
    setSatDocuments((prev) =>
      prev.filter((doc) => doc.id !== documentId),
    );
    toast.success("Document deleted");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Math.round((bytes / Math.pow(k, i)) * 100) / 100 +
      " " +
      sizes[i]
    );
  };

  // Test Row Document Handlers
  const handleViewTestDocuments = (testId: number) => {
    const test = testingAssessments.find(
      (t) => t.id === testId,
    );
    if (test && test.documents && test.documents.length > 0) {
      setSelectedTestDocuments(test.documents);
      setCurrentTestDocumentIndex(0);
      setTestDocumentViewerOpen(true);
    }
  };

  const handleTestDocumentDownload = (
    document: typeof selectedTestDocuments extends Array<
      infer T
    >
      ? T
      : never,
  ) => {
    const link = document.createElement("a");
    link.href = document.url;
    link.download = document.name;
    link.click();
    toast.success("Document downloaded");
  };

  const handleNextTestDocument = () => {
    if (
      selectedTestDocuments &&
      currentTestDocumentIndex <
        selectedTestDocuments.length - 1
    ) {
      setCurrentTestDocumentIndex(currentTestDocumentIndex + 1);
    }
  };

  const handlePreviousTestDocument = () => {
    if (currentTestDocumentIndex > 0) {
      setCurrentTestDocumentIndex(currentTestDocumentIndex - 1);
    }
  };

  // PLAN Test Validation
  const validatePlanScore = (field: string, value: string) => {
    if (!value) return "";
    const num = parseInt(value);
    // Composite Score: 1-32
    if (field === "compositeScore") {
      if (isNaN(num) || num < 1 || num > 32)
        return "Please enter a value from 1-32";
    }
    return "";
  };

  // PLAN Score Change Handler
  const handlePlanScoreChange = (
    field: string,
    value: string,
  ) => {
    if (value && !/^\d+$/.test(value)) return;
    setPlanFormData((prev) => ({ ...prev, [field]: value }));
    setPlanFormErrors((prev) => ({
      ...prev,
      [field]: validatePlanScore(field, value),
    }));
  };

  // EXPLORE Test Validation
  const validateExploreScore = (
    field: string,
    value: string,
  ) => {
    if (!value) return "";
    const num = parseInt(value);
    // Composite Score: 1-25
    if (field === "compositeScore") {
      if (isNaN(num) || num < 1 || num > 25)
        return "Please enter a value from 1-25";
    }
    return "";
  };

  // EXPLORE Score Change Handler
  const handleExploreScoreChange = (
    field: string,
    value: string,
  ) => {
    if (value && !/^\d+$/.test(value)) return;
    setExploreFormData((prev) => ({ ...prev, [field]: value }));
    setExploreFormErrors((prev) => ({
      ...prev,
      [field]: validateExploreScore(field, value),
    }));
  };

  // GAIN Test Validation
  const validateGainScore = (field: string, value: string) => {
    if (!value) return "";
    const num = parseInt(value);
    // English Composite Score and Math Composite Score: 200-1000
    if (
      field === "englishCompositeScore" ||
      field === "mathCompositeScore"
    ) {
      if (isNaN(num) || num < 200 || num > 1000) {
        return "Please enter a value from 200-1000";
      }
    }
    return "";
  };

  // GAIN Score Change Handler
  const handleGainScoreChange = (
    field: string,
    value: string,
  ) => {
    if (value && !/^\d+$/.test(value)) return;
    setGainFormData((prev) => ({ ...prev, [field]: value }));
    setGainFormErrors((prev) => ({
      ...prev,
      [field]: validateGainScore(field, value),
    }));
  };

  // GAIN File Upload Handlers
  const handleGainFileSelect = () => {
    gainFileInputRef.current?.click();
  };

  const handleGainFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleGainFilesUpload(Array.from(files));
    }
  };

  const handleGainFilesUpload = (files: File[]) => {
    const newDocuments = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedDate: formatMdy(new Date()),
      url: URL.createObjectURL(file),
    }));
    setGainDocuments((prev) => [...prev, ...newDocuments]);
    toast.success(
      `${files.length} document${files.length > 1 ? "s" : ""} uploaded successfully`,
    );
  };

  const handleGainRemoveDocument = (docId: number) => {
    setGainDocuments((prev) =>
      prev.filter((doc) => doc.id !== docId),
    );
    toast.success("Document removed successfully");
  };

  // GED Official Test Validation
  const validateGedOfficialScore = (
    field: string,
    value: string,
  ) => {
    if (!value) return "";
    const num = parseInt(value);
    // Composite Score: 400-800
    if (field === "compositeScore") {
      if (isNaN(num) || num < 400 || num > 800) {
        return "Please enter a value from 400-800";
      }
    }
    return "";
  };

  // GED Official Score Change Handler
  const handleGedOfficialScoreChange = (
    field: string,
    value: string,
  ) => {
    if (value && !/^\d+$/.test(value)) return;
    setGedOfficialFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setGedOfficialFormErrors((prev) => ({
      ...prev,
      [field]: validateGedOfficialScore(field, value),
    }));
  };

  // GED Official File Upload Handlers
  const handleGedOfficialFileSelect = () => {
    gedOfficialFileInputRef.current?.click();
  };

  const handleGedOfficialFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleGedOfficialFilesUpload(Array.from(files));
    }
  };

  const handleGedOfficialFilesUpload = (files: File[]) => {
    const newDocuments = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedDate: formatMdy(new Date()),
      url: URL.createObjectURL(file),
    }));
    setGedOfficialDocuments((prev) => [
      ...prev,
      ...newDocuments,
    ]);
    toast.success(
      `${files.length} document${files.length > 1 ? "s" : ""} uploaded successfully`,
    );
  };

  const handleGedOfficialRemoveDocument = (docId: number) => {
    setGedOfficialDocuments((prev) =>
      prev.filter((doc) => doc.id !== docId),
    );
    toast.success("Document removed successfully");
  };

  // GED Ready Test Validation
  const validateGedReadyScore = (
    field: string,
    value: string,
  ) => {
    if (!value) return "";
    const num = parseInt(value);
    // Composite Score: 400-800
    if (field === "compositeScore") {
      if (isNaN(num) || num < 400 || num > 800) {
        return "Please enter a value from 400-800";
      }
    }
    return "";
  };

  // GED Ready Score Change Handler
  const handleGedReadyScoreChange = (
    field: string,
    value: string,
  ) => {
    if (value && !/^\d+$/.test(value)) return;
    setGedReadyFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setGedReadyFormErrors((prev) => ({
      ...prev,
      [field]: validateGedReadyScore(field, value),
    }));
  };

  // GED Ready File Upload Handlers
  const handleGedReadyFileSelect = () => {
    gedReadyFileInputRef.current?.click();
  };

  const handleGedReadyFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleGedReadyFilesUpload(Array.from(files));
    }
  };

  const handleGedReadyFilesUpload = (files: File[]) => {
    const newDocuments = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedDate: formatMdy(new Date()),
      url: URL.createObjectURL(file),
    }));
    setGedReadyDocuments((prev) => [...prev, ...newDocuments]);
    toast.success(
      `${files.length} document${files.length > 1 ? "s" : ""} uploaded successfully`,
    );
  };

  const handleGedReadyRemoveDocument = (docId: number) => {
    setGedReadyDocuments((prev) =>
      prev.filter((doc) => doc.id !== docId),
    );
    toast.success("Document removed successfully");
  };

  // Casey Life Skills - Caregiver File Upload Handlers
  const handleCaseyLifeSkillsFileChange = (
    files: FileList | null,
  ) => {
    if (!files) return;
    const newDocs = Array.from(files).map((file) => ({
      id: `doc-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      uploadedDate: formatMdy(new Date()),
    }));
    setCaseyLifeSkillsDocuments((prev) => [
      ...prev,
      ...newDocs,
    ]);
    toast.success(
      `${files.length} document${files.length > 1 ? "s" : ""} uploaded successfully`,
    );
  };

  const handleRemoveCaseyLifeSkillsDocument = (id: string) => {
    setCaseyLifeSkillsDocuments((prev) =>
      prev.filter((doc) => doc.id !== id),
    );
    toast.success("Document removed successfully");
  };

  // Casey Life Skills - Youth File Upload Handlers
  const handleCaseyLifeSkillsYouthFileChange = (
    files: FileList | null,
  ) => {
    if (!files) return;
    const newDocs = Array.from(files).map((file) => ({
      id: `doc-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      uploadedDate: formatMdy(new Date()),
    }));
    setCaseyLifeSkillsYouthDocuments((prev) => [
      ...prev,
      ...newDocs,
    ]);
    toast.success(
      `${files.length} document${files.length > 1 ? "s" : ""} uploaded successfully`,
    );
  };

  const handleRemoveCaseyLifeSkillsYouthDocument = (
    id: string,
  ) => {
    setCaseyLifeSkillsYouthDocuments((prev) =>
      prev.filter((doc) => doc.id !== id),
    );
    toast.success("Document removed successfully");
  };

  // WJ-4 Test Validation
  const validateWj4Field = (field: string, value: string) => {
    if (!value) return "";

    // Age Equivalency fields: ##-## format (Years: 0-99, Months: 0-11)
    if (field.includes("AE")) {
      const aePattern = /^(\d{1,2})-(\d{1,2})$/;
      const match = value.match(aePattern);
      if (!match)
        return "Please use format ##-## (e.g., 12-06)";
      const years = parseInt(match[1]);
      const months = parseInt(match[2]);
      if (years < 0 || years > 99)
        return "Years must be between 0-99";
      if (months < 0 || months > 11)
        return "Months must be between 0-11";
    }

    // RPI fields: ###/90 format (Integers 0-100)
    if (field.includes("RPI")) {
      const rpiPattern = /^(\d{1,3})\/90$/;
      const match = value.match(rpiPattern);
      if (!match)
        return "Please use format ###/90 (e.g., 85/90)";
      const num = parseInt(match[1]);
      if (num < 0 || num > 100)
        return "Please enter a value from 0-100";
    }

    // Percentile fields: 0.01 - 100.00 (Allow two decimal places)
    if (field.includes("Percentile")) {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0.01 || num > 100)
        return "Please enter a value from 0.01-100.00";
    }

    return "";
  };

  // WJ-4 Field Change Handlers
  const handleWj4AgeEquivalencyChange = (
    field: string,
    value: string,
  ) => {
    // Allow digits and hyphen only
    if (value && !/^[\d-]*$/.test(value)) return;
    setWj4FormData((prev) => ({ ...prev, [field]: value }));
    setWj4FormErrors((prev) => ({
      ...prev,
      [field]: validateWj4Field(field, value),
    }));
  };

  const handleWj4RPIChange = (field: string, value: string) => {
    // Auto-append /90 if user enters just the number
    let formattedValue = value;
    if (value && !value.includes("/")) {
      // Only allow digits before /90
      if (!/^\d*$/.test(value)) return;
      // If they've entered 1-3 digits, we'll store it as-is
      formattedValue = value;
    } else if (value.includes("/")) {
      // If they're typing the full format, validate it
      if (!/^[\d/]*$/.test(value)) return;
      formattedValue = value;
    }

    setWj4FormData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));

    // For validation, auto-append /90 if not present
    const valueForValidation = formattedValue.includes("/")
      ? formattedValue
      : formattedValue
        ? `${formattedValue}/90`
        : "";
    setWj4FormErrors((prev) => ({
      ...prev,
      [field]: validateWj4Field(field, valueForValidation),
    }));
  };

  const handleWj4PercentileChange = (
    field: string,
    value: string,
  ) => {
    // Allow digits and decimal point only
    if (value && !/^[\d.]*$/.test(value)) return;
    // Ensure only one decimal point and max 2 decimal places
    const parts = value.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;

    setWj4FormData((prev) => ({ ...prev, [field]: value }));
    setWj4FormErrors((prev) => ({
      ...prev,
      [field]: validateWj4Field(field, value),
    }));
  };

  // WJ-4 (Grade) Validation Function
  const validateWj4GradeField = (
    field: string,
    value: string,
  ): string => {
    if (!value) return "";

    // Grade Equivalency fields: 0-17.9 (One decimal place)
    if (field.includes("GE")) {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0 || num > 17.9)
        return "Please enter a value from 0-17.9";
      // Check for one decimal place
      const parts = value.split(".");
      if (parts[1] && parts[1].length > 1)
        return "Please use one decimal place (e.g., 12.5)";
    }

    // RPI fields: ###/90 format (Integers 0-100)
    if (field.includes("RPI")) {
      const rpiPattern = /^(\d{1,3})\/90$/;
      const match = value.match(rpiPattern);
      if (!match)
        return "Please use format ###/90 (e.g., 85/90)";
      const num = parseInt(match[1]);
      if (num < 0 || num > 100)
        return "Please enter a value from 0-100";
    }

    // Percentile fields: 0.01 - 100.00 (Allow two decimal places)
    if (field.includes("Percentile")) {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0.01 || num > 100)
        return "Please enter a value from 0.01-100.00";
    }

    return "";
  };

  // WJ-4 (Grade) Field Change Handlers
  const handleWj4GradeEquivalencyChange = (
    field: string,
    value: string,
  ) => {
    // Allow digits and decimal point only
    if (value && !/^[\d.]*$/.test(value)) return;
    // Ensure only one decimal point and max 1 decimal place
    const parts = value.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 1) return;

    setWj4GradeFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setWj4GradeFormErrors((prev) => ({
      ...prev,
      [field]: validateWj4GradeField(field, value),
    }));
  };

  const handleWj4GradeRPIChange = (
    field: string,
    value: string,
  ) => {
    // Auto-append /90 if user enters just the number
    let formattedValue = value;
    if (value && !value.includes("/")) {
      // Only allow digits before /90
      if (!/^\d*$/.test(value)) return;
      // If they've entered 1-3 digits, we'll store it as-is
      formattedValue = value;
    } else if (value.includes("/")) {
      // If they're typing the full format, validate it
      if (!/^[\d/]*$/.test(value)) return;
      formattedValue = value;
    }

    setWj4GradeFormData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));

    // For validation, auto-append /90 if not present
    const valueForValidation = formattedValue.includes("/")
      ? formattedValue
      : formattedValue
        ? `${formattedValue}/90`
        : "";
    setWj4GradeFormErrors((prev) => ({
      ...prev,
      [field]: validateWj4GradeField(field, valueForValidation),
    }));
  };

  const handleWj4GradePercentileChange = (
    field: string,
    value: string,
  ) => {
    // Allow digits and decimal point only
    if (value && !/^[\d.]*$/.test(value)) return;
    // Ensure only one decimal point and max 2 decimal places
    const parts = value.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;

    setWj4GradeFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setWj4GradeFormErrors((prev) => ({
      ...prev,
      [field]: validateWj4GradeField(field, value),
    }));
  };

  // SAT Test Handlers
  const handleOpenSatDialog = () => {
    setEditingSatTestId(null);
    setSatFormData({
      totalScore: "",
      commentary: "",
    });
    setSatFormErrors({
      totalScore: "",
    });
    setSatDialogOpen(true);
  };

  const handleEditSatTest = (testId: number) => {
    const test = testingAssessments.find(
      (t) => t.id === testId,
    );
    if (test && test.satData) {
      setEditingSatTestId(test.id);
      setSatFormData({
        totalScore: test.satData.totalScore || "",
        commentary: test.satData.commentary || "",
      });
      setSatFormErrors({
        totalScore: "",
      });
      setSatDialogOpen(true);
    }
  };

  const handleSatScoreChange = (
    field: string,
    value: string,
  ) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    setSatFormData({ ...satFormData, [field]: value });

    // Validate the score
    const error = validateSatScore(field, value);
    setSatFormErrors({ ...satFormErrors, [field]: error });
  };

  const handleSaveSatTest = () => {
    // Validate required fields
    if (!satFormData.date) {
      toast.error("Please select a test date");
      return;
    }

    // Validate all score fields if they have values
    const errors: any = {};
    let hasError = false;

    Object.keys(satFormData).forEach((key) => {
      if (
        key !== "date" &&
        key !== "commentary" &&
        satFormData[key as keyof typeof satFormData]
      ) {
        const error = validateSatScore(
          key,
          satFormData[key as keyof typeof satFormData],
        );
        if (error) {
          errors[key] = error;
          hasError = true;
        }
      }
    });

    if (hasError) {
      setSatFormErrors(errors);
      toast.error("Please correct the score values");
      return;
    }

    // Convert date from YYYY-MM-DD to MM/DD/YYYY
    const dateParts = satFormData.date.split("-");
    const displayDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;

    // Build summary string with abbreviations as specified
    const summaryParts = [];
    if (satFormData.essayReading)
      summaryParts.push(`RE: ${satFormData.essayReading}`);
    if (satFormData.essayWriting)
      summaryParts.push(`WR: ${satFormData.essayWriting}`);
    if (satFormData.essayAnalysis)
      summaryParts.push(`WE: ${satFormData.essayAnalysis}`);
    if (satFormData.subscoreDataAnalysis)
      summaryParts.push(
        `PSD: ${satFormData.subscoreDataAnalysis}`,
      );
    if (satFormData.testReading)
      summaryParts.push(`RT: ${satFormData.testReading}`);
    if (satFormData.subscoreAlgebra)
      summaryParts.push(`HA: ${satFormData.subscoreAlgebra}`);
    if (satFormData.sectionEvidenceReading)
      summaryParts.push(
        `ES: ${satFormData.sectionEvidenceReading}`,
      );
    if (satFormData.subscoreEvidence)
      summaryParts.push(`CE: ${satFormData.subscoreEvidence}`);
    if (satFormData.sectionMath)
      summaryParts.push(`MS: ${satFormData.sectionMath}`);
    if (satFormData.testWritingLanguage)
      summaryParts.push(
        `WL: ${satFormData.testWritingLanguage}`,
      );
    if (satFormData.crossTestHistory)
      summaryParts.push(`AHC: ${satFormData.crossTestHistory}`);
    if (satFormData.crossTestScience)
      summaryParts.push(`ASC: ${satFormData.crossTestScience}`);
    if (satFormData.subscoreWords)
      summaryParts.push(`WC: ${satFormData.subscoreWords}`);
    if (satFormData.subscoreAdvancedMath)
      summaryParts.push(
        `PAM: ${satFormData.subscoreAdvancedMath}`,
      );
    if (satFormData.testMath)
      summaryParts.push(`MT: ${satFormData.testMath}`);
    if (satFormData.subscoreExpression)
      summaryParts.push(
        `E1: ${satFormData.subscoreExpression}`,
      );
    if (satFormData.subscoreConventions)
      summaryParts.push(
        `SEC: ${satFormData.subscoreConventions}`,
      );
    const summary = summaryParts.join(" ");

    if (editingSatTestId !== null) {
      setTestingAssessments(
        testingAssessments.map((t) =>
          t.id === editingSatTestId
            ? {
                ...t,
                date: displayDate,
                test: "SAT",
                summary: summary,
                satData: satFormData,
                documents:
                  satDocuments.length > 0
                    ? satDocuments
                    : undefined,
              }
            : t,
        ),
      );
      toast.success("SAT test updated successfully");
    } else {
      const newId =
        testingAssessments.length > 0
          ? Math.max(...testingAssessments.map((t) => t.id)) + 1
          : 1;
      setTestingAssessments([
        ...testingAssessments,
        {
          id: newId,
          date: displayDate,
          test: "SAT",
          summary: summary,
          satData: satFormData,
          documents:
            satDocuments.length > 0 ? satDocuments : undefined,
        },
      ]);
      toast.success("SAT test added successfully");
    }

    setSatDialogOpen(false);
    setEditingSatTestId(null);
    setSatFormData({
      totalScore: "",
      commentary: "",
    });
    setSatFormErrors({
      totalScore: "",
    });
    setSatDocuments([]);
  };

  // Sort testing assessments
  const sortedTestingAssessments = useMemo(() => {
    // Legacy rows and C-SSRS rows (string ids) are listed together; each
    // keeps its own store for every mutation.
    const sorted = [...testingAssessments, ...cssrsRows].sort(
      (a, b) => {
        if (testingSortColumn === "date") {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return testingSortDirection === "asc"
            ? dateA - dateB
            : dateB - dateA;
        } else {
          // Sort by test name
          return testingSortDirection === "asc"
            ? a.test.localeCompare(b.test)
            : b.test.localeCompare(a.test);
        }
      },
    );
    return sorted;
  }, [
    testingAssessments,
    cssrsRows,
    testingSortColumn,
    testingSortDirection,
  ]);

  // Presenting Needs Handlers
  const openNeedsDialog = (
    section:
      "psychiatric" | "behavioral" | "emotional" | "education",
    index: number | null = null,
  ) => {
    setCurrentNeedsSection(section);
    setEditingNeedsIndex(index);

    if (index !== null) {
      // Edit mode - populate form with existing data
      let data;
      if (section === "psychiatric")
        data = psychiatricData[index];
      else if (section === "behavioral")
        data = behavioralData[index];
      else if (section === "emotional")
        data = emotionalData[index];
      else if (section === "education")
        data = educationData[index];

      setNeedsFormData(
        data || {
          factor: "",
          level: "",
          assessment: "",
          need: "",
          goals: "",
          progress: "",
          gradeAtRelease: "",
          levelOfSchool: "",
          lastGrade: "",
          activity: "",
          comment: "",
          occurrences: "",
        },
      );
    } else {
      // Add mode - reset form
      setNeedsFormData({
        factor: "",
        level: "",
        assessment: "",
        need: "",
        goals: "",
        progress: "",
        gradeAtRelease: "",
        levelOfSchool: "",
        lastGrade: "",
        activity: "",
        comment: "",
        occurrences: "",
      });
    }

    setNeedsDialogOpen(true);
  };

  const handleApplyNeeds = () => {
    if (!currentNeedsSection) return;

    const newEntry = { ...needsFormData, id: Date.now() };

    if (editingNeedsIndex !== null) {
      // Edit existing entry
      if (currentNeedsSection === "psychiatric") {
        const updated = [...psychiatricData];
        updated[editingNeedsIndex] = {
          ...updated[editingNeedsIndex],
          ...needsFormData,
        };
        setPsychiatricData(updated);
      } else if (currentNeedsSection === "behavioral") {
        const updated = [...behavioralData];
        updated[editingNeedsIndex] = {
          ...updated[editingNeedsIndex],
          ...needsFormData,
        };
        setBehavioralData(updated);
      } else if (currentNeedsSection === "emotional") {
        const updated = [...emotionalData];
        updated[editingNeedsIndex] = {
          ...updated[editingNeedsIndex],
          ...needsFormData,
        };
        setEmotionalData(updated);
      } else if (currentNeedsSection === "education") {
        const updated = [...educationData];
        updated[editingNeedsIndex] = {
          ...updated[editingNeedsIndex],
          ...needsFormData,
        };
        setEducationData(updated);
      }
      toast.success("Entry updated successfully");
    } else {
      // Add new entry
      if (currentNeedsSection === "psychiatric") {
        setPsychiatricData([...psychiatricData, newEntry]);
      } else if (currentNeedsSection === "behavioral") {
        setBehavioralData([...behavioralData, newEntry]);
      } else if (currentNeedsSection === "emotional") {
        setEmotionalData([...emotionalData, newEntry]);
      } else if (currentNeedsSection === "education") {
        setEducationData([...educationData, newEntry]);
      }
      toast.success("Entry added successfully");
    }

    setNeedsDialogOpen(false);
    setCurrentNeedsSection(null);
    setEditingNeedsIndex(null);
  };

  const handleRemoveNeeds = (
    section:
      "psychiatric" | "behavioral" | "emotional" | "education",
    index: number,
  ) => {
    if (section === "psychiatric") {
      setPsychiatricData(
        psychiatricData.filter((_, i) => i !== index),
      );
    } else if (section === "behavioral") {
      setBehavioralData(
        behavioralData.filter((_, i) => i !== index),
      );
    } else if (section === "emotional") {
      setEmotionalData(
        emotionalData.filter((_, i) => i !== index),
      );
    } else if (section === "education") {
      setEducationData(
        educationData.filter((_, i) => i !== index),
      );
    }
    toast.success("Entry removed successfully");
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4"
      style={{
        backgroundColor: "var(--slds-g-color-background-alt-2)",
      }}
    >
      {!contentOnly && (<>
      {/* Header - SLDS v2 */}
      <div
        className="px-6 py-4 shadow-sm shrink-0"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <div
          className="flex items-center gap-2 text-[11px] mb-3"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          {/* Back: a real button for keyboard users; focus ring matches the
              Design System Select's focus-visible ring */}
          <button
            type="button"
            className={`hover:text-[#014486] hover:underline cursor-pointer transition-colors rounded-sm outline-none focus-visible:underline focus-visible:ring-[3px] focus-visible:ring-[color:rgba(20,95,51,0.5)] text-[14px]`}
            onClick={onBack}
          >
            {backLabel}
          </button>
          <ChevronRight className="h-3 w-3" />
          <span
            className="font-medium"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            {lead.name}
          </span>
        </div>
        <div className="flex items-start justify-between max-desktop:flex-wrap max-desktop:gap-y-3">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center text-white shadow-sm"
              style={{
                backgroundColor: "var(--color-brand-primary)",
              }}
            >
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[20px] font-bold text-[#080707]">
                  {lead.name}
                </h1>
                <YouthAlertIcons />
                {/* Restrictions indicator (US 20160): Constituent Youth only */}
                {savedRestrictions && (
                  <RestrictionsIndicator read={savedRestrictions} />
                )}
                {/* Status badge — shown only in Constituent context (Status dropdown is hidden there) */}
                {hideStatusSelect &&
                  lead.status &&
                  (() => {
                    const s = lead.status as string;
                    const cfg =
                      s === "Active"
                        ? {
                            dot: "#2e7d32",
                            bg: "#e8f5e9",
                            text: "#1b5e20",
                            border: "#a5d6a7",
                          }
                        : s === "Inactive"
                          ? {
                              dot: "#757575",
                              bg: "#f5f5f5",
                              text: "#424242",
                              border: "#bdbdbd",
                            }
                          : s === "Pending"
                            ? {
                                dot: "#e65100",
                                bg: "#fff3e0",
                                text: "#bf360c",
                                border: "#ffcc80",
                              }
                            : {
                                dot: "#546e7a",
                                bg: "#eceff1",
                                text: "#37474f",
                                border: "#b0bec5",
                              };
                    return (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: cfg.bg,
                          border: `1px solid ${cfg.border}`,
                          fontSize: "11px",
                          fontWeight: 600,
                          color: cfg.text,
                          letterSpacing: "0.02em",
                          lineHeight: 1,
                        }}
                        aria-label={`Status: ${s}`}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: cfg.dot,
                            flexShrink: 0,
                            display: "inline-block",
                          }}
                        />
                        {s}
                      </span>
                    );
                  })()}
              </div>
              <div
                className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {/* Constituent Type — shown only in Constituent context */}
                {hideStatusSelect &&
                  (lead as any).constituentType &&
                  (() => {
                    const t = (lead as any)
                      .constituentType as string;
                    const iconMap: Record<
                      string,
                      React.ReactNode
                    > = {
                      Individual: (
                        <User className="h-3.5 w-3.5 flex-shrink-0" />
                      ),
                      Family: (
                        <Users className="h-3.5 w-3.5 flex-shrink-0" />
                      ),
                      Organization: (
                        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                      ),
                    };
                    const icon = iconMap[t] ?? (
                      <User className="h-3.5 w-3.5 flex-shrink-0" />
                    );
                    return (
                      <>
                        <span
                          className="flex items-center gap-1.5 font-medium"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                          aria-label={`Type: ${t}`}
                        >
                          {icon}
                          {t}
                        </span>
                        <span className="text-[#c9c7c5]">
                          •
                        </span>
                      </>
                    );
                  })()}
                <span className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="font-medium text-[11px]"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {lead.role}
                  </Badge>
                </span>
                <span className="text-[#c9c7c5]">•</span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <Phone className="h-3.5 w-3.5" /> {lead.phone}
                </span>
                <span className="text-[#c9c7c5]">•</span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <Mail className="h-3.5 w-3.5" /> {lead.email}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!hideStatusSelect && (
              <>
                {/* Feature A: Pipeline Stage dropdown — controls Pipeline Progress */}
                <Select
                  value={pipelineStage}
                  onValueChange={setPipelineStage}
                >
                  <SelectTrigger
                    className="h-9 rounded-full text-[13px] shadow-none w-[160px]"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--slds-g-color-background-row-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--slds-g-color-background-base)";
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Feature B: Category dropdown (renamed from Status) */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-[13px]"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Category:
                  </span>
                  <Select
                    value={
                      isAdmissionsModule
                        ? savedCategory
                        : caseInfoFormData.status
                    }
                    disabled={
                      isAdmissionsModule &&
                      categoryRead.status !== "ok"
                    }
                    onValueChange={(value) => {
                      if (isAdmissionsModule) {
                        // Same category: nothing to do. Otherwise a
                        // pending change — saved only by the dialog.
                        if (value === savedCategory) return;
                        // No category yet: how a first one is assigned is
                        // an unconfirmed business rule — refuse up front,
                        // leaving the record as it is.
                        const blocker =
                          categoryChangeBlocker(savedCategory);
                        if (blocker) {
                          toast.error(blocker);
                          return;
                        }
                        setPendingCategory(value);
                        return;
                      }
                      setCaseInfoFormData({
                        ...caseInfoFormData,
                        status: value,
                      });
                      if (onLeadUpdate) {
                        onLeadUpdate(lead.id, {
                          status: value,
                        });
                      }
                    }}
                  >
                    <SelectTrigger
                      className="h-9 rounded-full text-[13px] shadow-none w-[180px]"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--slds-g-color-background-row-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--slds-g-color-background-base)";
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Referral">
                        Referral
                      </SelectItem>
                      <SelectItem value="Info Session Scheduled">
                        Info Session Scheduled
                      </SelectItem>
                      <SelectItem value="Program Waitlist">
                        Program Waitlist
                      </SelectItem>
                      <SelectItem value="Delayed">
                        Delayed
                      </SelectItem>
                      <SelectItem value="Closed">
                        Closed
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isAdmissionsModule && (
                  <AdmissionsCategoryNotice
                    error={
                      categoryRead.status === "error"
                        ? categoryRead.reason
                        : null
                    }
                  />
                )}
              </>
            )}
            <Button
              variant="outline"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--slds-g-color-background-row-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--slds-g-color-background-base)";
              }}
              onClick={() => setContactLogDialogOpen(true)}
            >
              + New Log
            </Button>
            {isAdmissionsModule && (
              <Button
                variant="outline-primary"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--slds-g-color-background-row-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--slds-g-color-background-base)";
                }}
                onClick={() =>
                  setAcademicSnapshotDialogOpen(true)
                }
              >
                Assign Academic Snapshot
              </Button>
            )}
            {!hideConvertButton && (
              <Button
                variant="default"
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                <CheckSquare className="h-3.5 w-3.5" />
                Convert to Active
              </Button>
            )}
          </div>
        </div>

        {!hidePipelineProgress && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-[11px] font-bold uppercase tracking-wide"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Pipeline Progress
              </span>
              <span
                className="text-[11px] font-medium"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                <span
                  className="font-bold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {lead.daysInStage}
                </span>{" "}
                Days in {lead.stage}
              </span>
            </div>
            <PipelineTracker
              currentStage={pipelineStage}
              completedStages={pipelineCompletedStages}
            />
          </div>
        )}
      </div>
      </>)}

      {/* Content with Left Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex h-full">
          {!contentOnly && (<>
          {/* LEFT NAVIGATION — data-leave-guard: an editor with unsaved
              changes (Transition Summary) can confirm before a section
              change unmounts it. */}
          <div
            data-leave-guard
            className="w-52 lg:w-64 border-r overflow-y-auto shrink-0"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            <div className="p-4 pb-12">
              {useMemberProfileNav && (
                <CommunityCareMemberProfileNav
                  showReferrals={showMemberExtras}
                  ariaLabel={
                    isCommunityCareMemberNav
                      ? "Community Care Member sections"
                      : "Youth sections"
                  }
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  activeOverviewSection={activeOverviewSection}
                  setActiveOverviewSection={setActiveOverviewSection}
                  activeHealthSection={activeHealthSection}
                  setActiveHealthSection={setActiveHealthSection}
                  activeMedicationSection={activeMedicationSection}
                  setActiveMedicationSection={setActiveMedicationSection}
                  activeIncidentSection={activeIncidentSection}
                  setActiveIncidentSection={setActiveIncidentSection}
                  activeClinicalSection={activeClinicalSection}
                  setActiveClinicalSection={setActiveClinicalSection}
                  hasPass={constituentPassId !== undefined}
                />
              )}
              {!useMemberProfileNav && (<>
              {/* 1. Overview — rendered as the "General" accordion on Constituent profiles */}
              {useGeneralAccordion ? (
                <Accordion
                  type="single"
                  collapsible
                  value={generalExpanded ? "general" : ""}
                  onValueChange={(v) =>
                    setGeneralExpanded(v === "general")
                  }
                >
                  <AccordionItem
                    value="general"
                    className="border-b-0"
                  >
                    <AccordionTrigger
                      className={`items-center px-3 py-2 text-[13px] font-medium rounded hover:no-underline [&>svg]:text-current [&>svg]:size-3.5 [&>svg]:translate-y-0 ${
                        activeTab === "overview"
                          ? "bg-[#145F33] text-white"
                          : "text-[#080707] hover:bg-[#f3f3f3]"
                      }`}
                    >
                      General
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-0">
                      <ul
                        className="space-y-0.5"
                        aria-label="General sections"
                      >
                        {[
                          ...GENERAL_NAV_ITEMS,
                          ...(constituentPassId !== undefined
                            ? [{ key: "pass", label: "Pass" }]
                            : []),
                        ].map((item) => {
                          const selected =
                            activeTab === "overview" &&
                            activeOverviewSection === item.key;
                          return (
                            <li key={item.key}>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab("overview");
                                  setActiveOverviewSection(
                                    item.key,
                                  );
                                }}
                                aria-current={
                                  selected ? "page" : undefined
                                }
                                className={`w-full text-left pl-6 pr-3 py-1.5 text-[12px] rounded border-l-[3px] transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                                  selected
                                    ? "border-[#145F33] bg-[#f3f3f3] text-[#145F33] font-semibold"
                                    : "border-transparent font-medium text-[#706e6b] hover:bg-[#f3f3f3]"
                                }`}
                              >
                                {item.label}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full text-left px-3 py-2 text-[13px] font-medium rounded transition-colors ${
                    activeTab === "overview"
                      ? "bg-[#145F33] text-white"
                      : "text-[#080707] hover:bg-[#f3f3f3]"
                  }`}
                >
                  Overview
                </button>
              )}

              {/* 2–11: hidden for MHBG Staff */}
              {!isRestrictedRoleNav && (
                <>
                  {/* 2. Case Details */}
                  <button
                    onClick={() => setActiveTab("caseDetails")}
                    className={`w-full text-left px-3 py-2 text-[13px] font-medium rounded transition-colors mt-2 ${
                      activeTab === "caseDetails"
                        ? "bg-[#145F33] text-white"
                        : "text-[#080707] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Case Details
                  </button>

                  {/* 3. Presenting Needs */}
                  <button
                    onClick={() =>
                      setActiveTab("presentingNeeds")
                    }
                    className={`w-full text-left px-3 py-2 text-[13px] font-medium rounded transition-colors mt-2 ${
                      activeTab === "presentingNeeds"
                        ? "bg-[#145F33] text-white"
                        : "text-[#080707] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Presenting Needs
                  </button>

                  {/* 4. Clinical Assessments */}
                  <button
                    onClick={() => {
                      setClinicalExpanded((prev) => !prev);
                      setActiveTab("clinical");
                      if (!activeClinicalSection)
                        setActiveClinicalSection(
                          "health-medical",
                        );
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium rounded transition-colors ${
                      activeTab === "clinical"
                        ? "bg-[#145F33] text-white"
                        : "text-[#080707] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    <span>Clinical Assessments</span>
                    {clinicalExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                    )}
                  </button>

                  {/* Clinical Sub-navigation - Shown when Clinical Assessments is expanded */}
                  {clinicalExpanded && (
                    <div className="mt-2 space-y-1">
                      <button
                        onClick={() => {
                          setActiveTab("clinical");
                          setActiveClinicalSection(
                            "health-medical",
                          );
                          setActiveClinicalSubSection(
                            "biological",
                          );
                        }}
                        className={`w-full text-left px-2 py-1.5 text-[12px] font-medium rounded transition-colors ${
                          activeClinicalSection ===
                          "health-medical"
                            ? "text-[#145F33]"
                            : "text-[#706e6b] hover:bg-[#f3f3f3]"
                        }`}
                      >
                        Health & Medical History
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("clinical");
                          setActiveClinicalSection(
                            "social-family",
                          );
                          setActiveClinicalSubSection("social");
                        }}
                        className={`w-full text-left px-2 py-1.5 text-[12px] font-medium rounded transition-colors ${
                          activeClinicalSection ===
                          "social-family"
                            ? "text-[#145F33]"
                            : "text-[#706e6b] hover:bg-[#f3f3f3]"
                        }`}
                      >
                        Social & Family
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("clinical");
                          setActiveClinicalSection(
                            "risk-legal",
                          );
                          setActiveClinicalSubSection("risk");
                        }}
                        className={`w-full text-left px-2 py-1.5 text-[12px] font-medium rounded transition-colors ${
                          activeClinicalSection === "risk-legal"
                            ? "text-[#145F33]"
                            : "text-[#706e6b] hover:bg-[#f3f3f3]"
                        }`}
                      >
                        Risk & Legal
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("clinical");
                          setActiveClinicalSection(
                            "clinical-summary",
                          );
                        }}
                        className={`w-full text-left px-2 py-1.5 text-[12px] font-medium rounded transition-colors ${
                          activeClinicalSection ===
                          "clinical-summary"
                            ? "text-[#145F33]"
                            : "text-[#706e6b] hover:bg-[#f3f3f3]"
                        }`}
                      >
                        Clinical Summary
                      </button>
                      {youthConstituentId !== null && (
                        <button
                          onClick={() => {
                            setActiveTab("clinical");
                            setActiveClinicalSection(
                              "physical-health-connections",
                            );
                          }}
                          className={`w-full text-left px-2 py-1.5 text-[12px] font-medium rounded transition-colors ${
                            activeClinicalSection ===
                            "physical-health-connections"
                              ? "text-[#145F33]"
                              : "text-[#706e6b] hover:bg-[#f3f3f3]"
                          }`}
                        >
                          Physical Health Connections
                        </button>
                      )}
                    </div>
                  )}

                  {/* 5. Education & Career Snapshot */}
                  <button
                    onClick={() => setActiveTab("education")}
                    className={`w-full text-left px-3 py-2 text-[13px] font-medium rounded transition-colors mt-2 ${
                      activeTab === "education"
                        ? "bg-[#145F33] text-white"
                        : "text-[#080707] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Education & Career Snapshot
                  </button>

                  {/* 6. Determination */}
                  <button
                    onClick={() =>
                      setActiveTab("determination")
                    }
                    className={`w-full text-left px-3 py-2 text-[13px] font-medium rounded transition-colors mt-2 ${
                      activeTab === "determination"
                        ? "bg-[#145F33] text-white"
                        : "text-[#080707] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Determination
                  </button>

                  {/* 7. Treatment Planning */}
                  <button
                    data-leave-guard-ignore={
                      activeTab === "treatmentPlanning" ||
                      undefined
                    }
                    onClick={() =>
                      setActiveTab("treatmentPlanning")
                    }
                    className={`w-full text-left px-3 py-2 text-[13px] font-medium rounded transition-colors mt-2 ${
                      activeTab === "treatmentPlanning"
                        ? "bg-[#145F33] text-white"
                        : "text-[#080707] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Treatment Planning
                  </button>

                  {/* 8. Incidents */}
                  <button
                    onClick={() => {
                      setActiveTab("incidents");
                      if (!activeIncidentSection)
                        setActiveIncidentSection("all");
                    }}
                    className={`w-full text-left px-3 py-2 text-[13px] font-medium rounded transition-colors mt-2 ${
                      activeTab === "incidents"
                        ? "bg-[#145F33] text-white"
                        : "text-[#080707] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Incidents
                  </button>

                  {/* 9. Health Overview with sub-tabs */}
                  <div className="mt-2">
                    <button
                      onClick={() => {
                        setActiveTab("healthOverview");
                        if (!activeHealthSection)
                          setActiveHealthSection("medication");
                      }}
                      className={`w-full text-left px-3 py-2 text-[13px] font-medium rounded transition-colors flex items-center justify-between ${
                        activeTab === "healthOverview"
                          ? "bg-[#145F33] text-white"
                          : "text-[#080707] hover:bg-[#f3f3f3]"
                      }`}
                    >
                      Health Overview
                      {activeTab === "healthOverview" ? (
                        <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                      )}
                    </button>
                    {activeTab === "healthOverview" && (
                      <div className="ml-4 mt-1 space-y-1">
                        <button
                          onClick={() => {
                            setActiveHealthSection(
                              "medication",
                            );
                            if (!activeMedicationSection)
                              setActiveMedicationSection(
                                "prescriptions",
                              );
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition-colors ${
                            activeHealthSection === "medication"
                              ? "bg-white text-[#145F33] font-medium"
                              : "text-[#3e3e3c] hover:bg-[#f3f3f3]"
                          }`}
                        >
                          Medication
                        </button>
                        <button
                          onClick={() =>
                            setActiveHealthSection("physical")
                          }
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition-colors ${
                            activeHealthSection === "physical"
                              ? "bg-white text-[#145F33] font-medium"
                              : "text-[#3e3e3c] hover:bg-[#f3f3f3]"
                          }`}
                        >
                          Physical Health
                        </button>
                        <button
                          onClick={() =>
                            setActiveHealthSection("mental")
                          }
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition-colors ${
                            activeHealthSection === "mental"
                              ? "bg-white text-[#145F33] font-medium"
                              : "text-[#3e3e3c] hover:bg-[#f3f3f3]"
                          }`}
                        >
                          Mental Health
                        </button>
                        <button
                          onClick={() =>
                            setActiveHealthSection("substance")
                          }
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition-colors ${
                            activeHealthSection === "substance"
                              ? "bg-white text-[#145F33] font-medium"
                              : "text-[#3e3e3c] hover:bg-[#f3f3f3]"
                          }`}
                        >
                          Substance Use
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 10. Testing & Assessments */}
                  <button
                    onClick={() => setActiveTab("testing")}
                    className={`w-full text-left px-3 py-2 text-[13px] font-medium rounded transition-colors mt-2 ${
                      activeTab === "testing"
                        ? "bg-[#145F33] text-white"
                        : "text-[#080707] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Testing & Assessments
                  </button>

                  {/* 11. Campus Restrictions */}
                  {!isAdmissionsModule && (
                    <button
                      onClick={() =>
                        setActiveTab("campusRestrictions")
                      }
                      className={`w-full text-left px-3 py-2 text-[13px] font-medium rounded transition-colors mt-2 ${
                        activeTab === "campusRestrictions"
                          ? "bg-[#145F33] text-white"
                          : "text-[#080707] hover:bg-[#f3f3f3]"
                      }`}
                    >
                      Campus Restrictions
                    </button>
                  )}
                </>
              )}

              {/* 12. General Information — shown for non-Individual types, and also for Youth role */}
              {!isAdmissionsModule &&
                (lead?.constituentType !== "Individual" ||
                  isYouthNav) && (
                  <div className="mt-2">
                    <button
                      onClick={() =>
                        setActiveTab("constituentDetails")
                      }
                      className={`w-full text-left px-3 py-2 text-[13px] font-medium rounded transition-colors flex items-center justify-between ${
                        activeTab === "constituentDetails" ||
                        activeTab === "constituentContact" ||
                        activeTab === "constituentRoles" ||
                        activeTab === "constituentDocuments"
                          ? "bg-[#145F33] text-white"
                          : "text-[#080707] hover:bg-[#f3f3f3]"
                      }`}
                    >
                      General Information
                      {activeTab === "constituentDetails" ||
                      activeTab === "constituentContact" ||
                      activeTab === "constituentRoles" ||
                      activeTab === "constituentDocuments" ? (
                        <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                      )}
                    </button>
                    {(activeTab === "constituentDetails" ||
                      activeTab === "constituentContact" ||
                      activeTab === "constituentRoles" ||
                      activeTab === "constituentDocuments") && (
                      <div className="ml-4 mt-1 space-y-1">
                        <button
                          onClick={() =>
                            setActiveTab("constituentDetails")
                          }
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition-colors font-medium ${
                            activeTab === "constituentDetails"
                              ? "bg-white text-[#145F33]"
                              : "text-[#3e3e3c] hover:bg-[#f3f3f3]"
                          }`}
                        >
                          Constituent Details
                        </button>
                        <button
                          onClick={() =>
                            setActiveTab("constituentContact")
                          }
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition-colors font-medium ${
                            activeTab === "constituentContact"
                              ? "bg-white text-[#145F33]"
                              : "text-[#3e3e3c] hover:bg-[#f3f3f3]"
                          }`}
                        >
                          Contact
                        </button>
                        <button
                          onClick={() =>
                            setActiveTab("constituentRoles")
                          }
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition-colors font-medium ${
                            activeTab === "constituentRoles"
                              ? "bg-white text-[#145F33]"
                              : "text-[#3e3e3c] hover:bg-[#f3f3f3]"
                          }`}
                        >
                          Constituent Roles
                        </button>
                        {youthConstituentId !== null && (
                          <button
                            onClick={() =>
                              setActiveTab(
                                "constituentDocuments",
                              )
                            }
                            className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition-colors font-medium ${
                              activeTab ===
                              "constituentDocuments"
                                ? "bg-white text-[#145F33]"
                                : "text-[#3e3e3c] hover:bg-[#f3f3f3]"
                            }`}
                          >
                            Documents
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* 13. Education and Vocation */}
              {!isAdmissionsModule && (
                <div className="mt-2">
                  <button
                    onClick={() =>
                      setActiveTab("educationVocation")
                    }
                    className={`w-full text-left px-3 py-2 text-[13px] font-medium rounded transition-colors flex items-center justify-between ${
                      activeTab === "educationVocation" ||
                      activeTab === "financialLiteracy" ||
                      activeTab === "postSecondaryOptions" ||
                      activeTab === "specialty" ||
                      activeTab === "employment" ||
                      activeTab === "tutorMatches" ||
                      activeTab === "tutorScheduledSessions" ||
                      activeTab === "academics" ||
                      activeTab === "classes"
                        ? "bg-[#145F33] text-white"
                        : "text-[#080707] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Education and Vocation
                    {activeTab === "educationVocation" ||
                    activeTab === "financialLiteracy" ||
                    activeTab === "postSecondaryOptions" ||
                    activeTab === "specialty" ||
                    activeTab === "employment" ||
                    activeTab === "tutorMatches" ||
                    activeTab === "tutorScheduledSessions" ||
                    activeTab === "academics" ||
                    activeTab === "classes" ? (
                      <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                    )}
                  </button>
                  {(activeTab === "educationVocation" ||
                    activeTab === "financialLiteracy" ||
                    activeTab === "postSecondaryOptions" ||
                    activeTab === "specialty" ||
                    activeTab === "employment" ||
                    activeTab === "tutorMatches" ||
                    activeTab === "tutorScheduledSessions" ||
                    activeTab === "academics" ||
                    activeTab === "classes") && (
                    <div className="ml-4 mt-1 space-y-1">
                      {!isRestrictedRoleNav && (
                        <button
                          onClick={() =>
                            setActiveTab("academics")
                          }
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition-colors font-medium ${
                            activeTab === "academics"
                              ? "bg-white text-[#145F33] font-medium"
                              : "text-[#3e3e3c] hover:bg-[#f3f3f3]"
                          }`}
                        >
                          Academics
                        </button>
                      )}
                      {!isRestrictedRoleNav && (
                        <button
                          onClick={() =>
                            setActiveTab("classes")
                          }
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition-colors font-medium ${
                            activeTab === "classes"
                              ? "bg-white text-[#145F33] font-medium"
                              : "text-[#3e3e3c] hover:bg-[#f3f3f3]"
                          }`}
                        >
                          Classes
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setActiveTab("educationVocation")
                        }
                        className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition-colors font-medium ${
                          activeTab === "educationVocation"
                            ? "bg-white text-[#145F33] font-medium"
                            : "text-[#3e3e3c] hover:bg-[#f3f3f3]"
                        }`}
                      >
                        Credentials
                      </button>
                      {!isRestrictedRoleNav && (
                        <button
                          onClick={() =>
                            setActiveTab("financialLiteracy")
                          }
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition-colors font-medium ${
                            activeTab === "financialLiteracy"
                              ? "bg-white text-[#145F33] font-medium"
                              : "text-[#3e3e3c] hover:bg-[#f3f3f3]"
                          }`}
                        >
                          Financial Literacy
                        </button>
                      )}
                      {!isRestrictedRoleNav && (
                        <button
                          onClick={() =>
                            setActiveTab("postSecondaryOptions")
                          }
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition-colors font-medium ${
                            activeTab === "postSecondaryOptions"
                              ? "bg-white text-[#145F33] font-medium"
                              : "text-[#3e3e3c] hover:bg-[#f3f3f3]"
                          }`}
                        >
                          Post Secondary Options
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setActiveTab("specialty")
                        }
                        className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition-colors font-medium ${
                          activeTab === "specialty"
                            ? "bg-white text-[#145F33] font-medium"
                            : "text-[#3e3e3c] hover:bg-[#f3f3f3]"
                        }`}
                      >
                        Specialty
                      </button>
                      {lead?.constituentType === "Individual" &&
                        !isRestrictedRoleNav && (
                          <button
                            onClick={() =>
                              setActiveTab("employment")
                            }
                            className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition-colors font-medium ${
                              activeTab === "employment"
                                ? "bg-white text-[#145F33] font-medium"
                                : "text-[#3e3e3c] hover:bg-[#f3f3f3]"
                            }`}
                          >
                            Employment
                          </button>
                        )}
                      {!isRestrictedRoleNav && (
                        <button
                          onClick={() =>
                            setActiveTab("tutorMatches")
                          }
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition-colors font-medium ${
                            activeTab === "tutorMatches"
                              ? "bg-white text-[#145F33] font-medium"
                              : "text-[#3e3e3c] hover:bg-[#f3f3f3]"
                          }`}
                        >
                          Tutor Matches
                        </button>
                      )}
                      {!isRestrictedRoleNav && (
                        <button
                          onClick={() =>
                            setActiveTab(
                              "tutorScheduledSessions",
                            )
                          }
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition-colors font-medium ${
                            activeTab ===
                            "tutorScheduledSessions"
                              ? "bg-white text-[#145F33] font-medium"
                              : "text-[#3e3e3c] hover:bg-[#f3f3f3]"
                          }`}
                        >
                          Tutor Scheduled Sessions
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              </>)}
            </div>
          </div>
          </>)}

          {/* RIGHT CONTENT */}
          <div className={contentOnly ? "flex-1 min-w-0" : "flex-1 overflow-y-auto p-3 sm:p-6 mb-8"}>
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div
                className="overflow-hidden w-full"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  borderRadius:
                    "var(--slds-c-card-radius-border)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              >
                {/* Card Header — Sub-Tab Navigation (moved to the left-nav
                    General accordion when useGeneralAccordion is set) */}
                {!useGeneralAccordion && (
                  <div
                    className="flex w-full min-w-0"
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <div className="app-scroll-strip w-full">
                      <button
                        onClick={() =>
                          setActiveOverviewSection(
                            "constituent-details",
                          )
                        }
                        className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                          activeOverviewSection ===
                          "constituent-details"
                            ? "text-[#145F33]"
                            : "text-[#706e6b] hover:text-[#080707]"
                        }`}
                      >
                        Constituent Details
                        {activeOverviewSection ===
                          "constituent-details" && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: "-1px",
                              left: 0,
                              right: 0,
                              height: "3px",
                              backgroundColor: "#145F33",
                            }}
                          />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          setActiveOverviewSection("cpi")
                        }
                        className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                          activeOverviewSection === "cpi"
                            ? "text-[#145F33]"
                            : "text-[#706e6b] hover:text-[#080707]"
                        }`}
                        style={
                          activeOverviewSection === "cpi"
                            ? {
                                borderBottom:
                                  "3px solid #145F33",
                                marginBottom: "-1px",
                              }
                            : {}
                        }
                      >
                        CPI
                      </button>
                      <button
                        onClick={() =>
                          setActiveOverviewSection(
                            "relationships",
                          )
                        }
                        className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                          activeOverviewSection ===
                          "relationships"
                            ? "text-[#145F33]"
                            : "text-[#706e6b] hover:text-[#080707]"
                        }`}
                        style={
                          activeOverviewSection ===
                          "relationships"
                            ? {
                                borderBottom:
                                  "3px solid #145F33",
                                marginBottom: "-1px",
                              }
                            : {}
                        }
                      >
                        Relationships
                      </button>
                      <button
                        onClick={() =>
                          setActiveOverviewSection(
                            "connections",
                          )
                        }
                        className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                          activeOverviewSection ===
                          "connections"
                            ? "text-[#145F33]"
                            : "text-[#706e6b] hover:text-[#080707]"
                        }`}
                        style={
                          activeOverviewSection ===
                          "connections"
                            ? {
                                borderBottom:
                                  "3px solid #145F33",
                                marginBottom: "-1px",
                              }
                            : {}
                        }
                      >
                        Connections
                      </button>
                      <button
                        onClick={() =>
                          setActiveOverviewSection("documents")
                        }
                        className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                          activeOverviewSection === "documents"
                            ? "text-[#145F33]"
                            : "text-[#706e6b] hover:text-[#080707]"
                        }`}
                        style={
                          activeOverviewSection === "documents"
                            ? {
                                borderBottom:
                                  "3px solid #145F33",
                                marginBottom: "-1px",
                              }
                            : {}
                        }
                      >
                        Documents
                      </button>
                      <button
                        onClick={() =>
                          setActiveOverviewSection(
                            "contact-log",
                          )
                        }
                        className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                          activeOverviewSection ===
                          "contact-log"
                            ? "text-[#145F33]"
                            : "text-[#706e6b] hover:text-[#080707]"
                        }`}
                        style={
                          activeOverviewSection ===
                          "contact-log"
                            ? {
                                borderBottom:
                                  "3px solid #145F33",
                                marginBottom: "-1px",
                              }
                            : {}
                        }
                      >
                        Contact Log
                      </button>
                      <button
                        onClick={() =>
                          setActiveOverviewSection(
                            "roi-tracking",
                          )
                        }
                        className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                          activeOverviewSection ===
                          "roi-tracking"
                            ? "text-[#145F33]"
                            : "text-[#706e6b] hover:text-[#080707]"
                        }`}
                      >
                        ROI Tracking
                        {activeOverviewSection ===
                          "roi-tracking" && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: "-1px",
                              left: 0,
                              right: 0,
                              height: "3px",
                              backgroundColor: "#145F33",
                            }}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Community Care Member / Youth: the six horizontal tabs. */}
                {useMemberProfileNav && (
                  <div
                    className="px-4 pt-2"
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <MemberTabs
                      value={
                        [
                          "constituent-details",
                          "cpi",
                          "relationships",
                          "connections",
                          "contact-log",
                          "documents",
                          ...(showMemberExtras ? ["observations"] : []),
                        ].includes(activeOverviewSection)
                          ? activeOverviewSection
                          : ""
                      }
                      onValueChange={setActiveOverviewSection}
                    >
                      <MemberTabsList
                        variant="underline"
                        aria-label="Constituent Details sections"
                      >
                        {[
                          ["constituent-details", "Constituent Details"],
                          ["cpi", "CPI"],
                          ["relationships", "Relationships"],
                          ["connections", "Connections"],
                          ["contact-log", "Contact Log"],
                          ["documents", "Documents"],
                          ...(showMemberExtras ? [["observations", "Observations"]] : []),
                        ].map(([value, label]) => (
                          <MemberTabsTrigger
                            key={value}
                            value={value}
                            variant="underline"
                            size="sm"
                          >
                            {label}
                          </MemberTabsTrigger>
                        ))}
                      </MemberTabsList>
                    </MemberTabs>
                  </div>
                )}

                {/* Card Body — Sub-Tab Content */}
                <div className="p-4 sm:p-6 w-full">
                  {/* Observations (Youth / Community Care Member profiles):
                      only this member's observations. */}
                  {showMemberExtras &&
                    activeOverviewSection === "observations" && (
                      <CommunityCareObservationsFeed
                        observations={getProfileObservations(
                          String(lead.id),
                          lead.name ?? "",
                        )}
                        currentUser={getDemoUserName()}
                        pageMemberName={lead.name ?? ""}
                        hideScopeTabs
                      />
                    )}
                  {isCommunityCareMemberNav && memberConstituent && (
                    <>
                      {activeOverviewSection ===
                        "constituent-details" && (
                        <OrgconstituentDetailsView
                          key={memberConstituent.id}
                          constituent={memberConstituent}
                        />
                      )}
                      {activeOverviewSection === "relationships" && (
                        <OrgRelationshipsView
                          key={memberConstituent.id}
                          constituent={memberConstituent}
                        />
                      )}
                      {activeOverviewSection === "connections" && (
                        <OrgConnectionsView
                          key={memberConstituent.id}
                          constituent={memberConstituent}
                        />
                      )}
                      {activeOverviewSection === "documents" && (
                        <DocumentsSection
                          key={memberConstituent.id}
                          ownerId={String(memberConstituent.id)}
                          ownerName={memberConstituent.name}
                          scoped
                        />
                      )}
                    </>
                  )}
                  {!isCommunityCareMemberNav &&
                    activeOverviewSection ===
                    "constituent-details" && (
                    <ConstituentDetailsSection
                      // Remount per person so a draft never carries over.
                      key={
                        isAdmissionsModule
                          ? `a-${lead.id}`
                          : `c-${lead.id}`
                      }
                      constituentId={
                        youthConstituentId !== null
                          ? String(youthConstituentId)
                          : undefined
                      }
                      // Birth Name / Maiden Name (US 20161): Admissions and
                      // Constituent Youth only, owned by stable id.
                      birthNameOwner={
                        isAdmissionsModule
                          ? {
                              admissionId: String(lead.id),
                              constituentId: linkedYouth?.id,
                            }
                          : youthConstituentId !== null
                            ? {
                                constituentId:
                                  String(youthConstituentId),
                              }
                            : undefined
                      }
                    />
                  )}
                  {activeOverviewSection === "cpi" && (
                    <CPIEligibilitySection />
                  )}
                  {!isCommunityCareMemberNav &&
                    activeOverviewSection ===
                    "relationships" && <RelationshipsSection />}
                  {!isCommunityCareMemberNav &&
                    activeOverviewSection === "connections" && (
                    <ConnectionsSection
                      key={linkedYouth?.id}
                      admissionProfileId={
                        isAdmissionsModule
                          ? String(lead.id)
                          : undefined
                      }
                      youthId={linkedYouth?.id}
                    />
                  )}
                  {activeOverviewSection === "contact-log" && (
                    <div style={{ minHeight: "600px" }}>
                      <ActivityTimeline
                        activities={timelineActivities}
                        onAddActivity={(newActivity) => {
                          setTimelineActivities((prev) => [
                            newActivity,
                            ...prev,
                          ]);
                        }}
                        onOpenNewLogDialog={() =>
                          setContactLogDialogOpen(true)
                        }
                        embedded
                      />
                    </div>
                  )}
                  {/* Youth Documents (US 20147): the same centralized,
                      folder-grouped Documents area for a verified Youth and
                      for an Admissions record that has no Youth link yet.
                      A record that cannot be verified gets the same shell
                      with an explicit unavailable state. Other profiles
                      keep the existing section. */}
                  {!isCommunityCareMemberNav &&
                    activeOverviewSection === "documents" &&
                    (isAdmissionsModule || linkedYouth ? (
                      <YouthDocumentsArea
                        key={
                          scopeKey(documentScope) ||
                          `unverified-${lead.id}`
                        }
                        scope={documentScope}
                        youthName={documentOwnerName}
                      />
                    ) : youthConstituentId !== null ? (
                      <DocumentsSection
                        key={youthConstituentId}
                        ownerId={String(youthConstituentId)}
                      />
                    ) : (
                      <DocumentsSection />
                    ))}
                  {activeOverviewSection === "roi-tracking" && (
                    <ROITrackingSection />
                  )}
                  {activeOverviewSection === "pass" &&
                    constituentPassId !== undefined && (
                      <ConstituentPassWorkspace
                        key={constituentPassId}
                        constituentId={constituentPassId}
                      />
                    )}
                </div>
              </div>
            )}

            {/* CLINICAL TAB */}
            {/* CLINICAL — PHYSICAL HEALTH CONNECTIONS (Youth only, US 20075) */}
            {activeTab === "clinical" &&
              showPhysicalHealthConnections && (
                <ConnectionsSection
                  key={youthConstituentId}
                  youthId={String(youthConstituentId)}
                  mode="physical-health"
                />
              )}
            {activeTab === "clinical" &&
              !showPhysicalHealthConnections && (
                <ClinicalAssessmentsView
                  initialMainSection={
                    (activeClinicalSection ===
                    "physical-health-connections"
                      ? "health-medical"
                      : activeClinicalSection) as any
                  }
                  initialSubSection={activeClinicalSubSection}
                  riskFactorOwner={{
                    admissionsRecordId:
                      cssrsOwnership.admissionsRecordId,
                    youthKey: cssrsOwnership.youthKey,
                  }}
                  onCompleteFullLifetime={
                    handleCompleteCssrsFullLifetime
                  }
                  fullLifetimeUnavailableReason={
                    newTestRestriction
                  }
                  onSectionChange={(
                    mainSection,
                    subSection,
                  ) => {
                    setActiveClinicalSection(mainSection);
                    if (subSection) {
                      setActiveClinicalSubSection(subSection);
                    }
                  }}
                />
              )}

            {/* CASE DETAILS TAB */}
            <LeadDetailCaseDetailsTab
              activeTab={activeTab}
              allergiesConditions={allergiesConditions}
              caseInfoFormData={caseInfoFormData}
              dietaryNeedsFormatted={dietaryNeedsFormatted}
              handleAddReleaseSent={handleAddReleaseSent}
              handleDeleteReleaseSent={handleDeleteReleaseSent}
              handleEditReleaseSent={handleEditReleaseSent}
              handleStepNameClick={handleStepNameClick}
              onScheduleConnection={handleStepNameClick}
              isAdmissionsFinalized={isAdmissionsFinalized}
              physicalHealthConditions={
                physicalHealthConditions
              }
              processSteps={processSteps}
              processStepsData={processStepsData}
              releasesSent={releasesSent}
              setActiveOverviewSection={
                useGeneralAccordion
                  ? // Show the requested General sub-section, not just
                    // select it while Case Details stays on screen.
                    (section: string) => {
                      setActiveTab("overview");
                      setActiveOverviewSection(section);
                    }
                  : setActiveOverviewSection
              }
              setCaseInfoFormData={setCaseInfoFormData}
              setProcessStepsData={setProcessStepsData}
            />

            {/* Community Care Member: General > Contact / Constituent Roles */}
            {isCommunityCareMemberNav && memberConstituent && (
              <>
                {activeTab === "constituentContact" && (
                  <ConstituentContactView
                    key={memberConstituent.id}
                    seed={mentorContactSeed(memberConstituent)}
                  />
                )}
                {activeTab === "constituentRoles" && (
                  <OrgConstituentRolesView
                    key={memberConstituent.id}
                    constituent={memberConstituent}
                  />
                )}
              </>
            )}

            {/* PRESENTING NEEDS TAB */}
            {activeTab === "presentingNeeds" && (
              <div className="space-y-6 w-full">
                {/* Card Container */}
                <div
                  className="overflow-hidden"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    borderRadius:
                      "var(--slds-c-card-radius-border)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  {/* Title Header */}
                  <div
                    className="px-4 py-3 border-b"
                    style={{
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <h3 className="text-[13px] font-semibold text-[#080707]">
                      Presenting Needs
                    </h3>
                  </div>

                  {/* Needs Content */}
                  <div className="p-3 sm:p-6">
                    <NeedsTabContent />
                  </div>
                </div>
              </div>
            )}

            {/* EDUCATION & CAREER TAB */}
            <LeadDetailEducationTab
              activeEducationSection={activeEducationSection}
              activeTab={activeTab}
              careerRecommendationComments={
                careerRecommendationComments
              }
              careerRecommendations={careerRecommendations}
              mockSchoolAccounts={mockSchoolAccounts}
              newSchoolData={newSchoolData}
              newSchoolRecommendation={newSchoolRecommendation}
              schoolComments={schoolComments}
              schoolSearch={schoolSearch}
              selectedSchoolAccount={selectedSchoolAccount}
              setActiveEducationSection={
                setActiveEducationSection
              }
              setCareerRecommendationComments={
                setCareerRecommendationComments
              }
              setCareerRecommendations={
                setCareerRecommendations
              }
              setNewSchoolData={setNewSchoolData}
              setNewSchoolRecommendation={
                setNewSchoolRecommendation
              }
              setSchoolComments={setSchoolComments}
              setSchoolSearch={setSchoolSearch}
              setSelectedSchoolAccount={
                setSelectedSchoolAccount
              }
              setShowSchoolDropdown={setShowSchoolDropdown}
              setShowSchoolModal={setShowSchoolModal}
              showSchoolDropdown={showSchoolDropdown}
              showSchoolModal={showSchoolModal}
            />

            {/* PROGRAM ENROLLMENT / ADMISSIONS ATTEMPT / ITP / TRANSITION
                SUMMARY — Community Care Member + Youth profile menu */}
            {useMemberProfileNav && activeTab === "programEnrollment" && (
              <ProfileProgramEnrollment key={String(lead.id)} ownerId={String(lead.id)} />
            )}
            {useMemberProfileNav && activeTab === "admissionsAttempt" && (
              <ProfileAdmissionsAttempts key={String(lead.id)} ownerId={String(lead.id)} />
            )}
            {useMemberProfileNav && activeTab === "itp" && (
              <IndividualTreatmentPlanSection />
            )}
            {/* Education and Vocation > Financial Support (view only) */}
            {showMemberExtras && activeTab === "financialSupport" && (
              <CommunityCareFinancialSupport
                memberName={lead.name ?? ""}
                readOnly
              />
            )}
            {/* Treatment > Referrals (view only) */}
            {showMemberExtras && activeTab === "referrals" && (
              <DeterminationView referralsOnly />
            )}
            {useMemberProfileNav && activeTab === "transitionSummary" && (
              <TransitionSummaryWorkspace
                key={String(lead.id)}
                youth={
                  isCommunityCareMemberNav
                    ? memberConstituent
                      ? { id: String(memberConstituent.id), name: memberConstituent.name }
                      : null
                    : (transitionSummaryYouth ??
                      resolveYouthConstituent(String(lead.id)))
                }
                initialSummaryId={openSummaryLink ? initialTransitionSummaryId : undefined}
              />
            )}

            {/* DETERMINATION TAB */}
            {activeTab === "determination" && (
              <DeterminationView />
            )}

            {/* TREATMENT PLANNING TAB */}
            {activeTab === "treatmentPlanning" && (
              <TreatmentPlanningView
                hiddenTabs={
                  (useMemberProfileNav
                    ? [...(hideTreatmentPlanningTabs ?? []), "supplementalPlans", "transitionSummary"]
                    : hideTreatmentPlanningTabs) as any
                }
                testingAssessments={testingAssessments}
                transitionSummaryYouth={transitionSummaryYouth}
                constituentYouth={transitionSummaryYouth}
                initialTransitionSummaryId={
                  openSummaryLink
                    ? initialTransitionSummaryId
                    : undefined
                }
              />
            )}

            {/* INCIDENTS TAB */}
            <LeadDetailIncidentsTab
              memberConstituentId={
                isCommunityCareMemberNav
                  ? memberConstituent?.id
                  : undefined
              }
              activeTab={activeTab}
              dcfsInvolvementRecords={dcfsInvolvementRecords}
              lead={lead}
              handleCreateDcfsInvolvement={
                handleCreateDcfsInvolvement
              }
              handleCreateLegalInvolvement={
                handleCreateLegalInvolvement
              }
              handleDeleteDcfsInvolvement={
                handleDeleteDcfsInvolvement
              }
              handleDeleteLegalInvolvement={
                handleDeleteLegalInvolvement
              }
              handleEditDcfsInvolvement={
                handleEditDcfsInvolvement
              }
              handleEditLegalInvolvement={
                handleEditLegalInvolvement
              }
              handleViewDcfsInvolvement={
                handleViewDcfsInvolvement
              }
              handleOpenCreateIncident={
                handleOpenCreateIncident
              }
              legalInvolvementRecords={legalInvolvementRecords}
              setIncidentEndDate={setIncidentEndDate}
              setIncidentEndTime={setIncidentEndTime}
              setIncidentLocation={setIncidentLocation}
              setIncidentNarrative={setIncidentNarrative}
              setIncidentOverview={setIncidentOverview}
              setIncidentStartDate={setIncidentStartDate}
              setIncidentStartTime={setIncidentStartTime}
              setIncidentTab={setIncidentTab}
              setIncidentType={setIncidentType}
              setIrDialogOpen={setIrDialogOpen}
              setSelectedIncident={setSelectedIncident}
            />

            <AlertDialog
              open={irConfirm !== null}
              onOpenChange={(o) => {
                if (!o) setIrConfirm(null);
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {irConfirm === "finalize"
                      ? "Finalize this incident?"
                      : "Discard this incident report?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {irConfirm === "finalize"
                      ? "Once finalized, it cannot be edited."
                      : "Any unsaved changes will be lost."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {irConfirm === "finalize" ? "Not yet" : "Keep editing"}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      const kind = irConfirm;
                      setIrConfirm(null);
                      if (kind === "finalize") confirmFinalizeIncident();
                      else {
                        resetIncidentForm();
                        toast.info("Incident report cancelled");
                      }
                    }}
                  >
                    {irConfirm === "finalize" ? "Finalize" : "Discard"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Incident Details Dialog */}
            <IncidentDetailsDialog
              open={irDialogOpen}
              onOpenChange={setIrDialogOpen}
              incidentYouth={
                selectedIncident || {
                  id: lead.id || 1,
                  name: lead.name || "Unknown",
                  initials: lead.name
                    ? lead.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                    : "UN",
                  color: "bg-blue-600",
                  status: "Onground",
                  statusColor:
                    "bg-green-50 text-green-700 border-green-200",
                  program: "Residential Program",
                }
              }
              program={{
                id: "prog-001",
                name: "Residential Program",
                type: "Residential Treatment",
                status: "Active",
                census: "6/8",
                lastUpdate: "Just now",
                alerts: 0,
              }}
              incidentTab={incidentTab}
              setIncidentTab={setIncidentTab}
              incidentType={incidentType}
              setIncidentType={setIncidentType}
              incidentLocation={incidentLocation}
              setIncidentLocation={setIncidentLocation}
              incidentStartDate={incidentStartDate}
              setIncidentStartDate={setIncidentStartDate}
              incidentStartTime={incidentStartTime}
              setIncidentStartTime={setIncidentStartTime}
              incidentEndDate={incidentEndDate}
              setIncidentEndDate={setIncidentEndDate}
              incidentEndTime={incidentEndTime}
              setIncidentEndTime={setIncidentEndTime}
              incidentOverview={incidentOverview}
              setIncidentOverview={setIncidentOverview}
              incidentNarrative={incidentNarrative}
              setIncidentNarrative={setIncidentNarrative}
              incidentResponse={incidentResponse}
              setIncidentResponse={setIncidentResponse}
              incidentPersonsContacted={
                incidentPersonsContacted
              }
              setIncidentPersonsContacted={
                setIncidentPersonsContacted
              }
              incidentYouthInjuries={incidentYouthInjuries}
              setIncidentYouthInjuries={
                setIncidentYouthInjuries
              }
              incidentRestraints={incidentRestraints}
              setIncidentRestraints={setIncidentRestraints}
              incidentDebriefParticipants={
                incidentDebriefParticipants
              }
              setIncidentDebriefParticipants={
                setIncidentDebriefParticipants
              }
              incidentDebriefNotes={incidentDebriefNotes}
              setIncidentDebriefNotes={setIncidentDebriefNotes}
              incidentFinalized={incidentFinalized}
              incidentYouthList={incidentYouthList}
              setIncidentYouthList={setIncidentYouthList}
              handleCancelIncident={handleCancelIncident}
              handleSaveIncident={handleSaveIncident}
              handleFinalizeIncident={handleFinalizeIncident}
              canFinalizeIncident={canFinalizeIncident}
              handleAddPersonContacted={
                handleAddPersonContacted
              }
              handleRemovePersonContacted={
                handleRemovePersonContacted
              }
              handleAddYouthInjury={handleAddYouthInjury}
              handleRemoveYouthInjury={handleRemoveYouthInjury}
              handleAddRestraint={handleAddRestraint}
              handleRemoveRestraint={handleRemoveRestraint}
              handleAddDebriefParticipant={
                handleAddDebriefParticipant
              }
              handleRemoveDebriefParticipant={
                handleRemoveDebriefParticipant
              }
              handleAddIncidentYouth={() => {}}
              handleRemoveIncidentYouth={(id: number) => {
                setIncidentYouthList(
                  incidentYouthList.filter((y) => y.id !== id),
                );
              }}
              handleSetPrimaryYouth={(id: number) => {
                setIncidentYouthList(
                  incidentYouthList.map((y) => ({
                    ...y,
                    isPrimary: y.id === id,
                  })),
                );
              }}
            />

            {/* Create New Incident Dialog */}
            {useConstituentIncidentDialog ? (
              <ConstituentCreateIncidentDialog
                {...(isCommunityCareMemberNav && memberConstituent
                  ? {
                      participant: {
                        id: memberConstituent.id,
                        name: memberConstituent.name,
                        type: "Community Care Member",
                        program: "",
                      },
                      constituentOptions: CONSTITUENTS.filter(
                        (c) => c.type === "Individual",
                      ).map((c) => ({
                        id: c.id,
                        name: c.name,
                        type: c.role,
                        program: null,
                      })),
                      onSubmitIncident: submitMemberIncident,
                    }
                  : {})}
                createIncidentDialogOpen={
                  createIncidentDialogOpen
                }
                setCreateIncidentDialogOpen={
                  setCreateIncidentDialogOpen
                }
                newIncidentType={newIncidentType}
                setNewIncidentType={setNewIncidentType}
                newIncidentOtherType={newIncidentOtherType}
                setNewIncidentOtherType={
                  setNewIncidentOtherType
                }
                newIncidentOtherTypeError={
                  newIncidentOtherTypeError
                }
                setNewIncidentOtherTypeError={
                  setNewIncidentOtherTypeError
                }
                newIncidentStartDate={newIncidentStartDate}
                setNewIncidentStartDate={
                  setNewIncidentStartDate
                }
                newIncidentStartTime={newIncidentStartTime}
                setNewIncidentStartTime={
                  setNewIncidentStartTime
                }
                newIncidentEndDate={newIncidentEndDate}
                setNewIncidentEndDate={setNewIncidentEndDate}
                newIncidentEndTime={newIncidentEndTime}
                setNewIncidentEndTime={setNewIncidentEndTime}
                newIncidentIndividuals={newIncidentIndividuals}
                setNewIncidentIndividuals={
                  setNewIncidentIndividuals
                }
                newIncidentProgram={newIncidentProgram}
                setNewIncidentProgram={setNewIncidentProgram}
                newIncidentInvolvementType={
                  newIncidentInvolvementType
                }
                setNewIncidentInvolvementType={
                  setNewIncidentInvolvementType
                }
                newIncidentLocation={newIncidentLocation}
                setNewIncidentLocation={setNewIncidentLocation}
                newIncidentDescription={newIncidentDescription}
                setNewIncidentDescription={
                  setNewIncidentDescription
                }
                handleCancelCreateIncident={
                  handleCancelCreateIncident
                }
                handleSaveCreateIncident={
                  handleSaveCreateIncident
                }
              />
            ) : (
              <LeadDetailCreateIncidentDialog
                createIncidentDialogOpen={
                  createIncidentDialogOpen
                }
                setCreateIncidentDialogOpen={
                  setCreateIncidentDialogOpen
                }
                newIncidentType={newIncidentType}
                setNewIncidentType={setNewIncidentType}
                newIncidentOtherType={newIncidentOtherType}
                setNewIncidentOtherType={
                  setNewIncidentOtherType
                }
                newIncidentOtherTypeError={
                  newIncidentOtherTypeError
                }
                setNewIncidentOtherTypeError={
                  setNewIncidentOtherTypeError
                }
                newIncidentStartDate={newIncidentStartDate}
                setNewIncidentStartDate={
                  setNewIncidentStartDate
                }
                newIncidentStartTime={newIncidentStartTime}
                setNewIncidentStartTime={
                  setNewIncidentStartTime
                }
                newIncidentEndDate={newIncidentEndDate}
                setNewIncidentEndDate={setNewIncidentEndDate}
                newIncidentEndTime={newIncidentEndTime}
                setNewIncidentEndTime={setNewIncidentEndTime}
                newIncidentIndividuals={newIncidentIndividuals}
                setNewIncidentIndividuals={
                  setNewIncidentIndividuals
                }
                newIncidentProgram={newIncidentProgram}
                setNewIncidentProgram={setNewIncidentProgram}
                newIncidentInvolvementType={
                  newIncidentInvolvementType
                }
                setNewIncidentInvolvementType={
                  setNewIncidentInvolvementType
                }
                newIncidentLocation={newIncidentLocation}
                setNewIncidentLocation={setNewIncidentLocation}
                newIncidentDescription={newIncidentDescription}
                setNewIncidentDescription={
                  setNewIncidentDescription
                }
                handleCancelCreateIncident={
                  handleCancelCreateIncident
                }
                handleSaveCreateIncident={
                  handleSaveCreateIncident
                }
              />
            )}

            {/* HEALTH OVERVIEW TAB */}
            <LeadDetailHealthOverviewTab
              youthConstituentId={youthConstituentId}
              medicationYouthId={linkedYouth?.id ?? null}
              activeHealthSection={activeHealthSection}
              activePhysicalSection={activePhysicalSection}
              activeSubstanceUseSection={
                activeSubstanceUseSection
              }
              activeTab={activeTab}
              diagnoses={diagnoses}
              diagnosisSortColumn={diagnosisSortColumn}
              diagnosisSortDirection={diagnosisSortDirection}
              dietaryNeedDialogOpen={dietaryNeedDialogOpen}
              dietaryNeedFormData={dietaryNeedFormData}
              disclosureSortDirection={disclosureSortDirection}
              disclosureSortField={disclosureSortField}
              editingDietaryNeedId={editingDietaryNeedId}
              editingMedicalNeedId={editingMedicalNeedId}
              emergencyContacts={emergencyContacts}
              getSortedDisclosures={getSortedDisclosures}
              getSortedTests={getSortedTests}
              handleAddDietaryNeed={handleAddDietaryNeed}
              handleAddMedicalNeed={handleAddMedicalNeed}
              handleDeleteDietaryNeed={handleDeleteDietaryNeed}
              handleDeleteMedicalNeed={handleDeleteMedicalNeed}
              handleDiagnosisSort={handleDiagnosisSort}
              handleDisclosureSort={handleDisclosureSort}
              handleEditDietaryNeed={handleEditDietaryNeed}
              handleEditMedicalNeed={handleEditMedicalNeed}
              handleSaveDietaryNeed={handleSaveDietaryNeed}
              handleSaveMedicalNeed={handleSaveMedicalNeed}
              handleTestSort={handleTestSort}
              handleViewMedicalConnection={
                handleViewMedicalConnection
              }
              hideOtcDashboard={hideOtcDashboard}
              insurancePolicies={insurancePolicies}
              keyMedicalDates={keyMedicalDates}
              onCreateInsurance={() => {
                setEditingInsuranceId(null);
                setInsuranceDialogOpen(true);
              }}
              onUpdateInsurance={(policy: any) =>
                setInsurancePolicies((prev) =>
                  prev.map((p) =>
                    p.id === policy.id
                      ? { ...p, ...policy }
                      : p,
                  ),
                )
              }
              medicalNeedDialogOpen={medicalNeedDialogOpen}
              medicalNeedFormData={medicalNeedFormData}
              medicalNeeds={medicalNeeds}
              setActivePhysicalSection={
                setActivePhysicalSection
              }
              setActiveSubstanceUseSection={
                setActiveSubstanceUseSection
              }
              setDiagnosisActiveTab={setDiagnosisActiveTab}
              setDiagnosisDialogOpen={setDiagnosisDialogOpen}
              setDiagnosisFormData={setDiagnosisFormData}
              setDietaryNeedDialogOpen={
                setDietaryNeedDialogOpen
              }
              setDietaryNeedFormData={setDietaryNeedFormData}
              setDisclosureDialogOpen={setDisclosureDialogOpen}
              setDisclosureFormData={setDisclosureFormData}
              setEditingDiagnosisId={setEditingDiagnosisId}
              setEditingDisclosureId={setEditingDisclosureId}
              setEditingSubstanceUseTestId={
                setEditingSubstanceUseTestId
              }
              setMedicalNeedDialogOpen={
                setMedicalNeedDialogOpen
              }
              setMedicalNeedFormData={setMedicalNeedFormData}
              setSubstanceResults={setSubstanceResults}
              setSubstanceUseTestDialogOpen={
                setSubstanceUseTestDialogOpen
              }
              setSubstanceUseTestFormData={
                setSubstanceUseTestFormData
              }
              setTestAdditionalDetails={
                setTestAdditionalDetails
              }
              setTestDetails={setTestDetails}
              setTestDetailsDialogOpen={
                setTestDetailsDialogOpen
              }
              setViewingTestId={setViewingTestId}
              sortedDiagnoses={sortedDiagnoses}
              substanceResults={substanceResults}
              substanceUseDisclosures={substanceUseDisclosures}
              substanceUseTests={substanceUseTests}
              testDetails={testDetails}
              testSortDirection={testSortDirection}
              testSortField={testSortField}
            />

            <LeadDetailHealthDialogs
              availableSubstances={availableSubstances}
              diagnoses={diagnoses}
              diagnosisActiveTab={diagnosisActiveTab}
              diagnosisDialogOpen={diagnosisDialogOpen}
              diagnosisFormData={diagnosisFormData}
              disclosureDialogOpen={disclosureDialogOpen}
              disclosureFormData={disclosureFormData}
              disclosureReadOnly={disclosureReadOnly}
              setDisclosureReadOnly={setDisclosureReadOnly}
              disclosureSubstanceDialogOpen={
                disclosureSubstanceDialogOpen
              }
              disclosureSubstanceSelection={
                disclosureSubstanceSelection
              }
              toggleDisclosureSubstance={
                toggleDisclosureSubstance
              }
              disclosureSubstanceSearchInput={
                disclosureSubstanceSearchInput
              }
              setDisclosureSubstanceSearchInput={
                setDisclosureSubstanceSearchInput
              }
              disclosureSubstanceSearchApplied={
                disclosureSubstanceSearchApplied
              }
              handleFindDisclosureSubstances={
                handleFindDisclosureSubstances
              }
              handleClearDisclosureSubstances={
                handleClearDisclosureSubstances
              }
              handleApplyDisclosureSubstances={
                handleApplyDisclosureSubstances
              }
              handleOpenDisclosureSubstances={
                handleOpenDisclosureSubstances
              }
              editingDiagnosisId={editingDiagnosisId}
              editingDisclosureId={editingDisclosureId}
              editingEmergencyContactId={
                editingEmergencyContactId
              }
              editingInsuranceId={editingInsuranceId}
              editingMedicalDateType={editingMedicalDateType}
              editingMedicalProfessionalId={
                editingMedicalProfessionalId
              }
              editingSubstanceResultId={
                editingSubstanceResultId
              }
              editingSubstanceUseTestId={
                editingSubstanceUseTestId
              }
              editingTestDetailId={editingTestDetailId}
              emergencyContactDialogOpen={
                emergencyContactDialogOpen
              }
              emergencyContactFormData={
                emergencyContactFormData
              }
              getAvailableDsmCodes={getAvailableDsmCodes}
              handleAddProgressNote={handleAddProgressNote}
              handleDeleteProgressNote={
                handleDeleteProgressNote
              }
              handleRemoveDisclosureSubstance={
                handleRemoveDisclosureSubstance
              }
              handleSaveDiagnosis={handleSaveDiagnosis}
              handleSaveDisclosure={handleSaveDisclosure}
              handleSaveEmergencyContact={
                handleSaveEmergencyContact
              }
              handleSaveInitialEntry={handleSaveInitialEntry}
              handleSaveInsurance={handleSaveInsurance}
              handleSaveMedicalDate={handleSaveMedicalDate}
              handleSaveMedicalProfessional={
                handleSaveMedicalProfessional
              }
              handleSaveSubstanceResult={
                handleSaveSubstanceResult
              }
              handleSaveTestDetail={handleSaveTestDetail}
              handleSaveTestDetails={handleSaveTestDetails}
              insuranceDialogOpen={insuranceDialogOpen}
              insuranceFormData={insuranceFormData}
              medicalDateDialogOpen={medicalDateDialogOpen}
              medicalDateFormData={medicalDateFormData}
              medicalProfessionalDialogOpen={
                medicalProfessionalDialogOpen
              }
              medicalProfessionalFormData={
                medicalProfessionalFormData
              }
              progressNoteFormData={progressNoteFormData}
              setDiagnosisActiveTab={setDiagnosisActiveTab}
              setDiagnosisDialogOpen={setDiagnosisDialogOpen}
              setDiagnosisFormData={setDiagnosisFormData}
              setDisclosureDialogOpen={setDisclosureDialogOpen}
              setDisclosureFormData={setDisclosureFormData}
              setDisclosureSubstanceDialogOpen={
                setDisclosureSubstanceDialogOpen
              }
              setEditingSubstanceResultId={
                setEditingSubstanceResultId
              }
              setEditingSubstanceUseTestId={
                setEditingSubstanceUseTestId
              }
              setEditingTestDetailId={setEditingTestDetailId}
              setEmergencyContactDialogOpen={
                setEmergencyContactDialogOpen
              }
              setEmergencyContactFormData={
                setEmergencyContactFormData
              }
              setInsuranceDialogOpen={setInsuranceDialogOpen}
              setInsuranceFormData={setInsuranceFormData}
              setMedicalDateDialogOpen={
                setMedicalDateDialogOpen
              }
              setMedicalDateFormData={setMedicalDateFormData}
              setMedicalProfessionalDialogOpen={
                setMedicalProfessionalDialogOpen
              }
              setMedicalProfessionalFormData={
                setMedicalProfessionalFormData
              }
              setProgressNoteFormData={setProgressNoteFormData}
              setSubstanceResultDialogOpen={
                setSubstanceResultDialogOpen
              }
              setSubstanceResultFormData={
                setSubstanceResultFormData
              }
              setSubstanceResults={setSubstanceResults}
              setSubstanceUseTestDialogOpen={
                setSubstanceUseTestDialogOpen
              }
              setSubstanceUseTestFormData={
                setSubstanceUseTestFormData
              }
              setSubstanceUseTests={setSubstanceUseTests}
              setTestAdditionalDetails={
                setTestAdditionalDetails
              }
              setTestDetailFormData={setTestDetailFormData}
              setTestDetailFormDialogOpen={
                setTestDetailFormDialogOpen
              }
              setTestDetailsDialogOpen={
                setTestDetailsDialogOpen
              }
              setViewMedicalConnectionModalOpen={
                setViewMedicalConnectionModalOpen
              }
              setViewingTestId={setViewingTestId}
              substanceResultDialogOpen={
                substanceResultDialogOpen
              }
              substanceResultFormData={substanceResultFormData}
              substanceResults={substanceResults}
              substanceUseTestDialogOpen={
                substanceUseTestDialogOpen
              }
              substanceUseTestFormData={
                substanceUseTestFormData
              }
              substanceUseTests={substanceUseTests}
              testAdditionalDetails={testAdditionalDetails}
              testDetailFormData={testDetailFormData}
              testDetailFormDialogOpen={
                testDetailFormDialogOpen
              }
              testDetails={testDetails}
              testDetailsDialogOpen={testDetailsDialogOpen}
              viewMedicalConnectionModalOpen={
                viewMedicalConnectionModalOpen
              }
              viewingMedicalConnection={
                viewingMedicalConnection
              }
            />
            {/* TESTING & ASSESSMENTS TAB */}
            <LeadDetailTestingTab
              activeTab={activeTab}
              lead={lead}
              handleCreateNewTest={handleCreateNewTest}
              handleDeleteTest={handleDeleteTest}
              handleEditTestRow={handleEditTestRow}
              handleTestingSort={handleTestingSort}
              handleViewTestDocuments={handleViewTestDocuments}
              hoveredTestId={hoveredTestId}
              isSystemAdministrator={isSystemAdministrator}
              setHoveredTestId={setHoveredTestId}
              setSelectedTestId={setSelectedTestId}
              setViewTestDialogOpen={setViewTestDialogOpen}
              sortedTestingAssessments={
                sortedTestingAssessments
              }
              testingSortColumn={testingSortColumn}
              testingSortDirection={testingSortDirection}
              fullLifetimeRequirement={fullLifetimeRequirement}
              ownedFullLifetime={ownedFullLifetime}
              onCompleteFullLifetime={
                handleCompleteCssrsFullLifetime
              }
              fullLifetimeUnavailableReason={newTestRestriction}
              onViewCssrs={(id: string) => {
                setSelectedTestId(id);
                setViewTestDialogOpen(true);
              }}
              onEditCssrs={handleEditTestRow}
            />

            {/* CAMPUS RESTRICTIONS TAB */}
            <LeadDetailCampusRestrictionsTab
              MHGB_STAFF={MHGB_STAFF}
              RESTRICTION_TYPES={RESTRICTION_TYPES}
              YOUTH_CONSTITUENTS={YOUTH_CONSTITUENTS}
              activeTab={activeTab}
              campusRestrictions={campusRestrictions}
              crDialogOpen={crDialogOpen}
              crEditingId={crEditingId}
              crForm={crForm}
              crSelectedId={crSelectedId}
              openCrAdd={openCrAdd}
              openCrModify={openCrModify}
              restrictionsReadFailed={
                savedRestrictions?.status === "error"
              }
              saveCrForm={saveCrForm}
              setCrDialogOpen={setCrDialogOpen}
              setCrForm={setCrForm}
              setCrSelectedId={setCrSelectedId}
            />

            {/* GENERAL INFORMATION — CONSTITUENT DETAILS */}
            {activeTab === "constituentDetails" && (
              <ConstituentDetailsView />
            )}

            {/* GENERAL INFORMATION — CONTACT */}
            {!isCommunityCareMemberNav &&
              activeTab === "constituentContact" && (
              <ConstituentContactView />
            )}

            {/* GENERAL INFORMATION — CONSTITUENT ROLES */}
            {!isCommunityCareMemberNav &&
              activeTab === "constituentRoles" && (
              <ConstituentRolesView />
            )}

            {/* GENERAL INFORMATION — DOCUMENTS (Youth only) — same store as
                Overview → Documents, scoped by Constituent ID */}
            {activeTab === "constituentDocuments" &&
              youthConstituentId !== null &&
              (linkedYouth ? (
                <YouthDocumentsArea
                  key={
                    scopeKey(documentScope) || linkedYouth.id
                  }
                  scope={documentScope}
                  youthName={documentOwnerName}
                />
              ) : (
                <DocumentsSection
                  key={youthConstituentId}
                  ownerId={String(youthConstituentId)}
                />
              ))}

            {/* EDUCATION AND VOCATION — CREDENTIALS TAB */}
            {activeTab === "educationVocation" && (
              <LeadDetailCredentialsTab />
            )}

            {/* EDUCATION AND VOCATION — FINANCIAL LITERACY TAB */}
            {activeTab === "financialLiteracy" && (
              <div className="space-y-6 w-full">
                <LeadDetailFinancialLiteracyTab />
              </div>
            )}

            {/* EDUCATION AND VOCATION — POST SECONDARY OPTIONS TAB */}
            {activeTab === "postSecondaryOptions" && (
              <div className="space-y-6 w-full">
                <LeadDetailPSOTab />
              </div>
            )}

            {/* EDUCATION AND VOCATION — SPECIALTY TAB */}
            {activeTab === "specialty" && (
              <div className="space-y-6 w-full">
                <LeadDetailSpecialtyTab />
              </div>
            )}

            {/* EDUCATION AND VOCATION — EMPLOYMENT TAB */}
            {activeTab === "employment" && (
              <div className="space-y-6 w-full">
                <LeadDetailEmploymentTab />
              </div>
            )}

            {/* EDUCATION AND VOCATION — TUTOR MATCHES TAB */}
            {activeTab === "tutorMatches" && (
              <div className="space-y-6 w-full">
                <LeadDetailTutorMatchesTab
                  youth={linkedYouth ?? undefined}
                />
              </div>
            )}

            {/* EDUCATION AND VOCATION — TUTOR SCHEDULED SESSIONS TAB */}
            {activeTab === "tutorScheduledSessions" && (
              <div className="space-y-6 w-full">
                <LeadDetailTutorScheduledSessionsTab
                  youth={linkedYouth ?? undefined}
                />
              </div>
            )}

            {/* EDUCATION AND VOCATION — ACADEMICS TAB */}
            {activeTab === "academics" && (
              <div className="w-full">
                <YouthAcademicsView />
              </div>
            )}

            {/* EDUCATION AND VOCATION — CLASSES TAB */}
            {activeTab === "classes" && (
              <div className="w-full">
                <LeadDetailClassesTab lead={lead} />
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === "documents" && (
              <div className="space-y-6 w-full">
                <div
                  className="overflow-hidden"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    borderRadius:
                      "var(--slds-c-card-radius-border)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <div
                    className="px-4 py-3 flex items-center justify-between"
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <h3 className="text-[13px] font-semibold text-[#080707]">
                      External Documents (6)
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 rounded-full text-[11px] shadow-none"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--slds-g-color-background-row-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--slds-g-color-background-base)";
                      }}
                    >
                      <Upload className="h-3 w-3 mr-1" /> Upload
                    </Button>
                  </div>
                  <div className="p-4">
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full text-[13px]">
                        <thead>
                          <tr
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-alt)",
                            }}
                          >
                            <th
                              className="px-3 py-2 text-left font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              Document Name
                            </th>
                            <th
                              className="px-3 py-2 text-left font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              Type
                            </th>
                            <th
                              className="px-3 py-2 text-left font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              Upload Date
                            </th>
                            <th
                              className="px-3 py-2 text-left font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              Uploaded By
                            </th>
                            <th
                              className="px-3 py-2 text-left font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              Size
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <FileText
                                  className="h-4 w-4"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                />
                                Psychiatric Evaluation - Dr.
                                Wong.pdf
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <Badge className="bg-blue-50 text-blue-700 border-blue-200 rounded-sm">
                                Assessment
                              </Badge>
                            </td>
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              11/15/2024
                            </td>
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              Sarah Johnson
                            </td>
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              2.4 MB
                            </td>
                          </tr>
                          <tr
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <FileText
                                  className="h-4 w-4"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                />
                                School Records - Lincoln HS.pdf
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <Badge className="bg-purple-50 text-purple-700 border-purple-200 rounded-sm">
                                Education
                              </Badge>
                            </td>
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              11/10/2024
                            </td>
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              Michael Davis
                            </td>
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              1.8 MB
                            </td>
                          </tr>
                          <tr
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <FileText
                                  className="h-4 w-4"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                />
                                Medical History Summary.pdf
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <Badge className="bg-green-50 text-green-700 border-green-200 rounded-sm">
                                Medical
                              </Badge>
                            </td>
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              11/05/2024
                            </td>
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              Lisa Chen
                            </td>
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              3.1 MB
                            </td>
                          </tr>
                          <tr
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <FileText
                                  className="h-4 w-4"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                />
                                Court Order - Custody.pdf
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <Badge className="bg-red-50 text-red-700 border-red-200 rounded-sm">
                                Legal
                              </Badge>
                            </td>
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              10/28/2024
                            </td>
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              Sarah Johnson
                            </td>
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              856 KB
                            </td>
                          </tr>
                          <tr
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <FileText
                                  className="h-4 w-4"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                />
                                DCFS Case Plan.pdf
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 rounded-sm">
                                DCFS
                              </Badge>
                            </td>
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              10/15/2024
                            </td>
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              Michael Davis
                            </td>
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              1.2 MB
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <FileText
                                  className="h-4 w-4"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                />
                                Family Therapy Notes.pdf
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <Badge className="bg-blue-50 text-blue-700 border-blue-200 rounded-sm">
                                Assessment
                              </Badge>
                            </td>
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              10/10/2024
                            </td>
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              Lisa Chen
                            </td>
                            <td
                              className="px-3 py-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              645 KB
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div
                      className="text-center text-[13px] py-8 border-2 border-dashed"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                        borderColor:
                          "var(--slds-g-color-border-base-1)",
                        borderRadius:
                          "var(--slds-c-card-radius-border)",
                      }}
                    >
                      Drag and drop files here to upload
                      external assessments (OCR enabled)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Log Dialog - SLDS v2 (shared with Contact Log page) */}
      <ContactLogDialogSLDS
        isOpen={contactLogDialogOpen}
        onClose={() => setContactLogDialogOpen(false)}
        onSubmit={handleContactLogDialogSubmit}
      />

      <AssignAcademicSnapshotDialog
        open={academicSnapshotDialogOpen}
        onOpenChange={setAcademicSnapshotDialogOpen}
        youth={{ id: String(lead.id), name: lead.name }}
        onAssigned={handleAcademicSnapshotAssigned}
      />

      {/* Presenting Needs Dialog */}
      <LeadDetailNeedsDialog
        needsDialogOpen={needsDialogOpen}
        setNeedsDialogOpen={setNeedsDialogOpen}
        editingNeedsIndex={editingNeedsIndex}
        currentNeedsSection={currentNeedsSection}
        needsFormData={needsFormData}
        setNeedsFormData={setNeedsFormData}
        handleRemoveNeeds={handleRemoveNeeds}
        handleApplyNeeds={handleApplyNeeds}
      />

      {/* Referral Dialog - SLDS v2 */}
      <Dialog
        open={referralDialogOpen}
        onOpenChange={setReferralDialogOpen}
      >
        <DialogContent size="md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {editingReferralId ? "Edit" : "Add"} Referral
            </DialogTitle>
            <DialogDescription>
              {editingReferralId
                ? "Update the referral details below."
                : "Enter the referral details below."}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 bg-white">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-[13px] text-[#3e3e3c] font-medium">
                Recommendation
              </Label>
              <Input
                value={referralFormData.recommendation}
                onChange={(e) =>
                  setReferralFormData({
                    ...referralFormData,
                    recommendation: e.target.value,
                  })
                }
                className="col-span-3 h-9 text-[13px] border-[#dddbda]"
                placeholder="Enter recommendation"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-[13px] text-[#3e3e3c] font-medium">
                Date Approved
              </Label>
              <DateInput
                value={isoToMdy(referralFormData.dateApproved)}
                onChange={(v) =>
                  ((e) =>
                    setReferralFormData({
                      ...referralFormData,
                      dateApproved: e.target.value,
                    }))({ target: { value: mdyToIso(v) } })
                }
                className="col-span-3 h-9 text-[13px] border-[#dddbda]"
              />
            </div>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setReferralDialogOpen(false)}
              className="h-9 rounded-full text-[13px] border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
            >
              Cancel
            </Button>
            <Button
              className="h-9 rounded-full text-[13px] bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
              onClick={handleSaveReferral}
            >
              {editingReferralId ? "Update" : "Add"} Referral
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reference Dialog - SLDS v2 */}
      <Dialog
        open={referenceDialogOpen}
        onOpenChange={setReferenceDialogOpen}
      >
        <DialogContent size="md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {editingReferenceId ? "Edit" : "Add"} Reference
            </DialogTitle>
            <DialogDescription>
              {editingReferenceId
                ? "Update the reference details below."
                : "Enter the reference details below."}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 bg-white">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-[13px] text-[#3e3e3c] font-medium">
                Mentor
              </Label>
              <Input
                value={referenceFormData.mentor}
                onChange={(e) =>
                  setReferenceFormData({
                    ...referenceFormData,
                    mentor: e.target.value,
                  })
                }
                className="col-span-3 h-9 text-[13px] border-[#dddbda]"
                placeholder="Enter mentor name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-[13px] text-[#3e3e3c] font-medium">
                Email
              </Label>
              <Input
                type="email"
                value={referenceFormData.email}
                onChange={(e) =>
                  setReferenceFormData({
                    ...referenceFormData,
                    email: e.target.value,
                  })
                }
                className="col-span-3 h-9 text-[13px] border-[#dddbda]"
                placeholder="Enter email address"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2 text-[13px] text-[#3e3e3c] font-medium">
                Comment
              </Label>
              <Textarea
                value={referenceFormData.comment}
                onChange={(e) =>
                  setReferenceFormData({
                    ...referenceFormData,
                    comment: e.target.value,
                  })
                }
                className="col-span-3 min-h-[100px] text-[13px] border-[#dddbda]"
                placeholder="Enter comment"
              />
            </div>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setReferenceDialogOpen(false)}
              className="h-9 rounded-full text-[13px] border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
            >
              Cancel
            </Button>
            <Button
              className="h-9 rounded-full text-[13px] bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
              onClick={handleSaveReference}
            >
              {editingReferenceId ? "Update" : "Add"} Reference
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Documentation Received Dialog */}
      <Dialog
        open={docReceivedDialogOpen}
        onOpenChange={setDocReceivedDialogOpen}
      >
        <DialogContent size="md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {editingDocReceivedId
                ? "Edit Documentation"
                : "Add Documentation"}
            </DialogTitle>
            <DialogDescription>
              {editingDocReceivedId
                ? "Update documentation details"
                : "Add new documentation received"}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 bg-white">
            <div>
              <Label
                htmlFor="doc-type"
                className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
              >
                Documentation Type
              </Label>
              <Select
                value={docReceivedFormData.documentationType}
                onValueChange={(value) =>
                  setDocReceivedFormData({
                    ...docReceivedFormData,
                    documentationType: value,
                  })
                }
              >
                <SelectTrigger
                  id="doc-type"
                  className="h-9 text-[13px] border-[#dddbda]"
                >
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Psychological Records">
                    Psychological Records
                  </SelectItem>
                  <SelectItem value="School Records">
                    School Records
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="doc-date"
                className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
              >
                Date
              </Label>
              <DateInput
                id="doc-date"
                value={isoToMdy(docReceivedFormData.date)}
                onChange={(v) =>
                  ((e) =>
                    setDocReceivedFormData({
                      ...docReceivedFormData,
                      date: e.target.value,
                    }))({ target: { value: mdyToIso(v) } })
                }
                className="h-9 text-[13px] border-[#dddbda]"
              />
            </div>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDocReceivedDialogOpen(false)}
              className="h-9 rounded-full text-[13px] border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
            >
              Cancel
            </Button>
            <Button
              className="h-9 rounded-full text-[13px] bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
              onClick={handleSaveDocReceived}
            >
              {editingDocReceivedId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Releases Sent Dialog */}
      <Dialog
        open={releasesSentDialogOpen}
        onOpenChange={setReleasesSentDialogOpen}
      >
        <DialogContent size="md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {editingReleasesSentId
                ? "Edit Release"
                : "Add Release"}
            </DialogTitle>
            <DialogDescription>
              {editingReleasesSentId
                ? "Update release details"
                : "Add new documentation release"}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 bg-white">
            <div>
              <Label
                htmlFor="release-type"
                className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
              >
                Release Type
              </Label>
              <Select
                value={releasesSentFormData.releaseType}
                onValueChange={(value) =>
                  setReleasesSentFormData({
                    ...releasesSentFormData,
                    releaseType: value,
                  })
                }
              >
                <SelectTrigger
                  id="release-type"
                  className="h-9 text-[13px] border-[#dddbda]"
                >
                  <SelectValue placeholder="Select release type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hospital">
                    Hospital
                  </SelectItem>
                  <SelectItem value="School">School</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="date"
                className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
              >
                Date
              </Label>
              <DateInput
                id="date"
                value={isoToMdy(releasesSentFormData.date)}
                onChange={(v) =>
                  ((e) =>
                    setReleasesSentFormData({
                      ...releasesSentFormData,
                      date: e.target.value,
                    }))({ target: { value: mdyToIso(v) } })
                }
                className="h-9 text-[13px] border-[#dddbda]"
              />
            </div>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setReleasesSentDialogOpen(false)}
              className="h-9 rounded-full text-[13px] border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
            >
              Cancel
            </Button>
            <Button
              className="h-9 rounded-full text-[13px] bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
              onClick={handleSaveReleaseSent}
            >
              {editingReleasesSentId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vaccination Status Dialog */}
      <Dialog
        open={vaccinationDialogOpen}
        onOpenChange={setVaccinationDialogOpen}
      >
        <DialogContent size="md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {editingVaccinationId
                ? "Edit Vaccination"
                : "Add Vaccination"}
            </DialogTitle>
            <DialogDescription>
              {editingVaccinationId
                ? "Update vaccination details"
                : "Add new vaccination record"}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 bg-white">
            <div>
              <Label
                htmlFor="vax-dose"
                className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
              >
                Dose
              </Label>
              <Input
                id="vax-dose"
                value={vaccinationFormData.dose}
                onChange={(e) =>
                  setVaccinationFormData({
                    ...vaccinationFormData,
                    dose: e.target.value,
                  })
                }
                className="h-9 text-[13px] border-[#dddbda]"
                placeholder="e.g., 1st Dose - Pfizer"
              />
            </div>
            <div>
              <Label
                htmlFor="vax-date"
                className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
              >
                Date
              </Label>
              <DateInput
                id="vax-date"
                value={isoToMdy(vaccinationFormData.date)}
                onChange={(v) =>
                  ((e) =>
                    setVaccinationFormData({
                      ...vaccinationFormData,
                      date: e.target.value,
                    }))({ target: { value: mdyToIso(v) } })
                }
                className="h-9 text-[13px] border-[#dddbda]"
              />
            </div>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setVaccinationDialogOpen(false)}
              className="h-9 rounded-full text-[13px] border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
            >
              Cancel
            </Button>
            <Button
              className="h-9 rounded-full text-[13px] bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
              onClick={handleSaveVaccination}
            >
              {editingVaccinationId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Testing & Assessments - Create/Edit Dialog */}
      <LeadDetailTestingDialog
        lead={lead}
        acesFormData={acesFormData}
        setAcesFormData={setAcesFormData}
        acesDocuments={acesDocuments}
        handleAcesFilesUpload={handleAcesFilesUpload}
        handleAcesRemoveDocument={handleAcesRemoveDocument}
        handleViewDocumentAt={handleViewDocumentAt}
        actDocuments={actDocuments}
        actFormData={actFormData}
        actFormErrors={actFormErrors}
        asebaAbclDocuments={asebaAbclDocuments}
        asebaAbclFormData={asebaAbclFormData}
        asebaAsrFormData={asebaAsrFormData}
        asebaCbclFormData={asebaCbclFormData}
        asebaYsrFormData={asebaYsrFormData}
        calculateKbit2Difference={calculateKbit2Difference}
        calculateKbit2Significance={calculateKbit2Significance}
        caseyLifeSkillsDocuments={caseyLifeSkillsDocuments}
        caseyLifeSkillsFormData={caseyLifeSkillsFormData}
        caseyLifeSkillsFormErrors={caseyLifeSkillsFormErrors}
        caseyLifeSkillsYouthDocuments={
          caseyLifeSkillsYouthDocuments
        }
        caseyLifeSkillsYouthFormData={
          caseyLifeSkillsYouthFormData
        }
        caseyLifeSkillsYouthFormErrors={
          caseyLifeSkillsYouthFormErrors
        }
        editingTestingId={editingTestingId}
        editingCssrsId={editingCssrsId}
        cssrsResponses={cssrsResponses}
        cssrsFlResponses={cssrsFlResponses}
        setCssrsFlResponses={updateCssrsFlResponses}
        cssrsFlErrors={cssrsFlErrors}
        cssrsFlIdPrefix={`cssrs-fl-${editingCssrsId ?? "new"}`}
        setCssrsResponses={updateCssrsResponses}
        cssrsErrors={cssrsErrors}
        cssrsSaveError={cssrsSaveError}
        cssrsIrOptions={cssrsIrOptions}
        cssrsIrStatus={cssrsIrStatus}
        employabilityDocuments={employabilityDocuments}
        employabilityFormData={employabilityFormData}
        exploreDocuments={exploreDocuments}
        exploreFormData={exploreFormData}
        exploreFormErrors={exploreFormErrors}
        formatFileSize={formatFileSize}
        gainDocuments={gainDocuments}
        gainFileInputRef={gainFileInputRef}
        gainFormData={gainFormData}
        gainFormErrors={gainFormErrors}
        gedOfficialDocuments={gedOfficialDocuments}
        gedOfficialFileInputRef={gedOfficialFileInputRef}
        gedOfficialFormData={gedOfficialFormData}
        gedOfficialFormErrors={gedOfficialFormErrors}
        gedReadyDocuments={gedReadyDocuments}
        gedReadyFileInputRef={gedReadyFileInputRef}
        gedReadyFormData={gedReadyFormData}
        gedReadyFormErrors={gedReadyFormErrors}
        handleActFileSelect={handleActFileSelect}
        handleActRemoveDocument={handleActRemoveDocument}
        handleActScoreChange={handleActScoreChange}
        handleAsebaAbclFileSelect={handleAsebaAbclFileSelect}
        handleAsebaAbclRemoveDocument={
          handleAsebaAbclRemoveDocument
        }
        handleCancelTesting={handleCancelTesting}
        handleCaseyLifeSkillsFileChange={
          handleCaseyLifeSkillsFileChange
        }
        handleCaseyLifeSkillsYouthFileChange={
          handleCaseyLifeSkillsYouthFileChange
        }
        handleEmployabilityFileSelect={
          handleEmployabilityFileSelect
        }
        handleEmployabilityRemoveDocument={
          handleEmployabilityRemoveDocument
        }
        handleExploreFileSelect={handleExploreFileSelect}
        handleExploreRemoveDocument={
          handleExploreRemoveDocument
        }
        handleExploreScoreChange={handleExploreScoreChange}
        handleGainFileChange={handleGainFileChange}
        handleGainRemoveDocument={handleGainRemoveDocument}
        handleGainScoreChange={handleGainScoreChange}
        handleGedOfficialFileChange={
          handleGedOfficialFileChange
        }
        handleGedOfficialRemoveDocument={
          handleGedOfficialRemoveDocument
        }
        handleGedOfficialScoreChange={
          handleGedOfficialScoreChange
        }
        handleGedReadyFileChange={handleGedReadyFileChange}
        handleGedReadyRemoveDocument={
          handleGedReadyRemoveDocument
        }
        handleGedReadyScoreChange={handleGedReadyScoreChange}
        handleKbit2FileSelect={handleKbit2FileSelect}
        handleKbit2RemoveDocument={handleKbit2RemoveDocument}
        handleKbit2ScoreChange={handleKbit2ScoreChange}
        handleMaciFileSelect={handleMaciFileSelect}
        handleMaciRemoveDocument={handleMaciRemoveDocument}
        handleMcmiFileSelect={handleMcmiFileSelect}
        handleMcmiRemoveDocument={handleMcmiRemoveDocument}
        handleMpaciFileSelect={handleMpaciFileSelect}
        handleMpaciRemoveDocument={handleMpaciRemoveDocument}
        handlePlanFileSelect={handlePlanFileSelect}
        handlePlanRemoveDocument={handlePlanRemoveDocument}
        handlePlanScoreChange={handlePlanScoreChange}
        handleRemoveCaseyLifeSkillsDocument={
          handleRemoveCaseyLifeSkillsDocument
        }
        handleRemoveCaseyLifeSkillsYouthDocument={
          handleRemoveCaseyLifeSkillsYouthDocument
        }
        handleSatDocumentDelete={handleSatDocumentDelete}
        handleSatDocumentDownload={handleSatDocumentDownload}
        handleSatDocumentView={handleSatDocumentView}
        handleSatDragOver={handleSatDragOver}
        handleSatDrop={handleSatDrop}
        handleSatFileSelect={handleSatFileSelect}
        handleSatScoreChange={handleSatScoreChange}
        handleSaveTesting={handleSaveTesting}
        handleSsmFileSelect={handleSsmFileSelect}
        handleSsmRemoveDocument={handleSsmRemoveDocument}
        handleWj4AgeEquivalencyChange={
          handleWj4AgeEquivalencyChange
        }
        handleWj4GradeEquivalencyChange={
          handleWj4GradeEquivalencyChange
        }
        handleWj4GradePercentileChange={
          handleWj4GradePercentileChange
        }
        handleWj4GradeRPIChange={handleWj4GradeRPIChange}
        handleWj4PercentileChange={handleWj4PercentileChange}
        handleWj4RPIChange={handleWj4RPIChange}
        kbit2Documents={kbit2Documents}
        kbit2FormData={kbit2FormData}
        kbit2FormErrors={kbit2FormErrors}
        maciDocuments={maciDocuments}
        maciFormData={maciFormData}
        mcmi3Documents={mcmi3Documents}
        mcmi3FormData={mcmi3FormData}
        mcmiDocuments={mcmiDocuments}
        mcmiFormData={mcmiFormData}
        mpaciDocuments={mpaciDocuments}
        mpaciFormData={mpaciFormData}
        planDocuments={planDocuments}
        planFormData={planFormData}
        planFormErrors={planFormErrors}
        satDocuments={satDocuments}
        satFileInputRef={satFileInputRef}
        satFormData={satFormData}
        satFormErrors={satFormErrors}
        setActFormData={setActFormData}
        setAsebaAbclFormData={setAsebaAbclFormData}
        setAsebaAsrFormData={setAsebaAsrFormData}
        setAsebaCbclFormData={setAsebaCbclFormData}
        setAsebaYsrFormData={setAsebaYsrFormData}
        setCaseyLifeSkillsFormData={setCaseyLifeSkillsFormData}
        setCaseyLifeSkillsYouthFormData={
          setCaseyLifeSkillsYouthFormData
        }
        setEmployabilityFormData={setEmployabilityFormData}
        setExploreFormData={setExploreFormData}
        setGainFormData={setGainFormData}
        setGedOfficialFormData={setGedOfficialFormData}
        setGedReadyFormData={setGedReadyFormData}
        setKbit2FormData={setKbit2FormData}
        setMaciFormData={setMaciFormData}
        setMcmi3Documents={setMcmi3Documents}
        setMcmi3FormData={setMcmi3FormData}
        setMcmiFormData={setMcmiFormData}
        setMpaciFormData={setMpaciFormData}
        setPlanFormData={setPlanFormData}
        setSatFormData={setSatFormData}
        setSsmFormData={setSsmFormData}
        setTestingDialogOpen={setTestingDialogOpen}
        setTestingFormData={setTestingFormData}
        setWj4FormData={setWj4FormData}
        setWj4GradeFormData={setWj4GradeFormData}
        ssmDocuments={ssmDocuments}
        ssmFormData={ssmFormData}
        testingAssessments={testingAssessments}
        testingDialogOpen={testingDialogOpen}
        testingFormData={testingFormData}
        wj4FormData={wj4FormData}
        wj4FormErrors={wj4FormErrors}
        wj4GradeFormData={wj4GradeFormData}
        wj4GradeFormErrors={wj4GradeFormErrors}
      />

      {isAdmissionsModule && pendingCategory && (
        <ChangeCategoryDialog
          youthName={lead.name}
          currentCategory={savedCategory}
          proposedCategory={pendingCategory}
          onCancel={() => setPendingCategory(null)}
          onSave={(comment) => {
            const result = changeAdmissionsCategory({
              admissionId: lead.id,
              admissionName: lead.name,
              baselineCategory: lead.status ?? "",
              expectedCurrentCategory: savedCategory,
              newCategory: pendingCategory,
              comment,
            });
            if (!result.ok)
              return { ok: false, error: result.error };
            toast.success(
              `Category changed to ${pendingCategory}`,
            );
            setPendingCategory(null);
            return { ok: true };
          }}
        />
      )}

      <LeadDetailRemainingDialogs
        lead={lead}
        handleViewDocumentAt={handleViewDocumentAt}
        onLeadUpdate={onLeadUpdate}
        caregiverLinkedToAssessment={
          caregiverLinkedToAssessment
        }
        caseInfoEditOpen={caseInfoEditOpen}
        caseInfoFormData={caseInfoFormData}
        confirmDeleteTest={confirmDeleteTest}
        currentTestDocumentIndex={currentTestDocumentIndex}
        dcfsInvolvementDialogOpen={dcfsInvolvementDialogOpen}
        dcfsInvolvementMode={dcfsInvolvementMode}
        deleteTestConfirmOpen={deleteTestConfirmOpen}
        editingDcfsInvolvement={editingDcfsInvolvement}
        editingLegalInvolvement={editingLegalInvolvement}
        formatFileSize={formatFileSize}
        handleEditTestRow={handleEditTestRow}
        handleNextTestDocument={handleNextTestDocument}
        handlePreviousTestDocument={handlePreviousTestDocument}
        handleSatDocumentDownload={handleSatDocumentDownload}
        handleSaveDcfsInvolvement={handleSaveDcfsInvolvement}
        handleSaveLegalInvolvement={handleSaveLegalInvolvement}
        handleTestDocumentDownload={handleTestDocumentDownload}
        isStepAdmissionsShadowDialogOpen={
          isStepAdmissionsShadowDialogOpen
        }
        isStepClinicalAssessmentDialogOpen={
          isStepClinicalAssessmentDialogOpen
        }
        isStepFamilyPartnershipMeetingDialogOpen={
          isStepFamilyPartnershipMeetingDialogOpen
        }
        isStepInfoSessionDialogOpen={
          isStepInfoSessionDialogOpen
        }
        isStepStaffMeetingDialogOpen={
          isStepStaffMeetingDialogOpen
        }
        legalInvolvementDialogOpen={legalInvolvementDialogOpen}
        legalInvolvementMode={legalInvolvementMode}
        processSteps={processSteps}
        satDocumentViewerOpen={satDocumentViewerOpen}
        selectedSatDocument={selectedSatDocument}
        selectedTestDocuments={selectedTestDocuments}
        selectedTestId={selectedTestId}
        cssrsAssessments={cssrsRecords}
        setCaregiverLinkedToAssessment={
          setCaregiverLinkedToAssessment
        }
        setCaseInfoEditOpen={setCaseInfoEditOpen}
        setCaseInfoFormData={setCaseInfoFormData}
        setDcfsInvolvementDialogOpen={
          setDcfsInvolvementDialogOpen
        }
        setDeleteTestConfirmOpen={setDeleteTestConfirmOpen}
        setIsStepAdmissionsShadowDialogOpen={
          setIsStepAdmissionsShadowDialogOpen
        }
        setIsStepClinicalAssessmentDialogOpen={
          setIsStepClinicalAssessmentDialogOpen
        }
        setIsStepFamilyPartnershipMeetingDialogOpen={
          setIsStepFamilyPartnershipMeetingDialogOpen
        }
        setIsStepInfoSessionDialogOpen={
          setIsStepInfoSessionDialogOpen
        }
        setIsStepStaffMeetingDialogOpen={
          setIsStepStaffMeetingDialogOpen
        }
        setLegalInvolvementDialogOpen={
          setLegalInvolvementDialogOpen
        }
        setSatDocumentViewerOpen={setSatDocumentViewerOpen}
        setTestDocumentViewerOpen={setTestDocumentViewerOpen}
        setTestToDelete={setTestToDelete}
        setViewTestDialogOpen={setViewTestDialogOpen}
        testDocumentViewerOpen={testDocumentViewerOpen}
        testingAssessments={testingAssessments}
        viewTestDialogOpen={viewTestDialogOpen}
      />
    </div>
  );
}