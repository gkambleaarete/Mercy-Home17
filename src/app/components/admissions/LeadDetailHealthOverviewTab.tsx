import { useState, useMemo, useEffect, useRef } from "react";
import { YouthAlertIcons } from "../youth/YouthAlertIcons";
import { YouthSubstanceTestsSection } from "../substance-tests/YouthSubstanceTestsSection";
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
  Paperclip,
} from "@/app/lib/lucide-icons";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
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
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { toast } from "sonner@2.0.3";
import { InsurancePolicyDialog } from "./InsurancePolicyDialog";
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
import { FamilyHistorySection } from "./FamilyHistorySection";
import { LegalHistorySection } from "./LegalHistorySection";
import { PhysicalHealthSection } from "./PhysicalHealthSection";
import { MentalHealthSection } from "./MentalHealthSection";
import { MentalStatusExamSection } from "./MentalStatusExamSection";
import { SubstanceUseSection } from "./SubstanceUseSection";
import { RecommendationsSection } from "./RecommendationsSection";
import { ConstituentDetailsSection } from "./ConstituentDetailsSection";
import { CPIEligibilitySection } from "./CPIEligibilitySection";
import { RelationshipsSection } from "./RelationshipsSection";
import { ConnectionsSection } from "./ConnectionsSection";
import { DocumentsSection } from "./DocumentsSection";
import { ContactLogDialogSLDS } from "../ContactLogDialogSLDS";
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
import { CaseyLifeSkillsCaregiverFields } from "./CaseyLifeSkillsCaregiverFields";
import { CaseyLifeSkillsYouthFields } from "./CaseyLifeSkillsYouthFields";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

const PHYSICAL_MEDICAL_NEED_TYPES = [
  "Allergies",
  "Asthma",
  "Seizures",
  "Diabetes",
  "Other",
];

const ALLERGY_TYPES = [
  "Environmental",
  "Food",
  "Medical",
  "Animal/Bug/Insect",
];

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

interface LeadDetailHealthOverviewTabProps {
  activeHealthSection: any;
  activePhysicalSection: any;
  activeSubstanceUseSection: any;
  activeTab: any;
  diagnoses: any;
  diagnosisSortColumn: any;
  diagnosisSortDirection: any;
  dietaryNeedDialogOpen: any;
  dietaryNeedFormData: any;
  disclosureSortDirection: any;
  disclosureSortField: any;
  editingDietaryNeedId: any;
  editingMedicalNeedId: any;
  emergencyContacts: any;
  getSortedDisclosures: any;
  getSortedTests: any;
  handleAddDietaryNeed: any;
  handleAddMedicalNeed: any;
  handleDeleteDietaryNeed: any;
  handleDeleteMedicalNeed: any;
  handleDiagnosisSort: any;
  handleDisclosureSort: any;
  handleEditDietaryNeed: any;
  handleEditMedicalNeed: any;
  handleSaveDietaryNeed: any;
  handleSaveMedicalNeed: any;
  handleTestSort: any;
  handleViewMedicalConnection: any;
  insurancePolicies: any;
  keyMedicalDates: any;
  medicalNeedDialogOpen: any;
  medicalNeedFormData: any;
  medicalNeeds: any;
  setActivePhysicalSection: any;
  setActiveSubstanceUseSection: any;
  setDiagnosisActiveTab: any;
  setDiagnosisDialogOpen: any;
  setDiagnosisFormData: any;
  setDietaryNeedDialogOpen: any;
  setDietaryNeedFormData: any;
  setDisclosureDialogOpen: any;
  setDisclosureFormData: any;
  setEditingDiagnosisId: any;
  setEditingDisclosureId: any;
  setEditingSubstanceUseTestId: any;
  setMedicalNeedDialogOpen: any;
  setMedicalNeedFormData: any;
  setSubstanceResults: any;
  setSubstanceUseTestDialogOpen: any;
  setSubstanceUseTestFormData: any;
  setTestAdditionalDetails: any;
  setTestDetails: any;
  setTestDetailsDialogOpen: any;
  setViewingTestId: any;
  sortedDiagnoses: any;
  substanceResults: any;
  substanceUseDisclosures: any;
  substanceUseTests: any;
  /** Constituent Youth profile only: the youth's Constituent ID, which
   *  lists their shared Substance Tests (20066 AC14). null elsewhere. */
  youthConstituentId?: number | null;
  /** Resolved Youth Constituent ID (Admissions via the explicit mapping)
   *  for Medication Log / Count; null when it can't be resolved. */
  medicationYouthId?: string | null;
  testDetails: any;
  hideOtcDashboard: any;
  testSortDirection: any;
  testSortField: any;
  onCreateInsurance: () => void;
  onUpdateInsurance: (policy: any) => void;
}

const INSURANCE_TYPE_ORDER = [
  "Medical - Primary",
  "Medical - Secondary",
  "Dental",
  "Vision",
  "Other",
];

function insuranceTypeRank(type: string): number {
  const idx = INSURANCE_TYPE_ORDER.indexOf(type);
  return idx === -1 ? INSURANCE_TYPE_ORDER.length : idx;
}

export function LeadDetailHealthOverviewTab({
  activeHealthSection,
  activePhysicalSection,
  activeSubstanceUseSection,
  activeTab,
  diagnoses,
  diagnosisSortColumn,
  diagnosisSortDirection,
  dietaryNeedDialogOpen,
  dietaryNeedFormData,
  disclosureSortDirection,
  disclosureSortField,
  editingDietaryNeedId,
  editingMedicalNeedId,
  emergencyContacts,
  getSortedDisclosures,
  getSortedTests,
  handleAddDietaryNeed,
  handleAddMedicalNeed,
  handleDeleteDietaryNeed,
  handleDeleteMedicalNeed,
  handleDiagnosisSort,
  handleDisclosureSort,
  handleEditDietaryNeed,
  handleEditMedicalNeed,
  handleSaveDietaryNeed,
  handleSaveMedicalNeed,
  handleTestSort,
  handleViewMedicalConnection,
  hideOtcDashboard,
  insurancePolicies,
  keyMedicalDates,
  medicalNeedDialogOpen,
  medicalNeedFormData,
  medicalNeeds,
  onCreateInsurance,
  onUpdateInsurance,
  setActivePhysicalSection,
  setActiveSubstanceUseSection,
  setDiagnosisActiveTab,
  setDiagnosisDialogOpen,
  setDiagnosisFormData,
  setDietaryNeedDialogOpen,
  setDietaryNeedFormData,
  setDisclosureDialogOpen,
  setDisclosureFormData,
  setEditingDiagnosisId,
  setEditingDisclosureId,
  setEditingSubstanceUseTestId,
  setMedicalNeedDialogOpen,
  setMedicalNeedFormData,
  setSubstanceResults,
  setSubstanceUseTestDialogOpen,
  setSubstanceUseTestFormData,
  setTestAdditionalDetails,
  setTestDetails,
  setTestDetailsDialogOpen,
  setViewingTestId,
  sortedDiagnoses,
  substanceResults,
  substanceUseDisclosures,
  substanceUseTests,
  youthConstituentId = null,
  medicationYouthId = null,
  testDetails,
  testSortDirection,
  testSortField,
}: LeadDetailHealthOverviewTabProps) {
  const [insSortCol, setInsSortCol] =
    useState<string>("default");
  const [insSortDir, setInsSortDir] = useState<"asc" | "desc">(
    "asc",
  );
  // Insurance modal / document state
  const [insViewPolicy, setInsViewPolicy] = useState<
    any | null
  >(null);
  const [insEditPolicy, setInsEditPolicy] = useState<
    any | null
  >(null);
  const [insUploadPolicyId, setInsUploadPolicyId] = useState<
    number | null
  >(null);
  const [policyDocs, setPolicyDocs] = useState<
    Record<number, string>
  >({});
  const [insUploadName, setInsUploadName] = useState("");
  const insFileRef = useRef<HTMLInputElement>(null);

  function handleInsSort(col: string) {
    if (insSortCol === col) {
      setInsSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setInsSortCol(col);
      setInsSortDir("asc");
    }
  }

  const sortedInsurance = useMemo(() => {
    const policies = [...(insurancePolicies || [])];
    if (insSortCol === "default") {
      return policies.sort((a, b) => {
        const aActive = a.active !== false ? 0 : 1;
        const bActive = b.active !== false ? 0 : 1;
        if (aActive !== bActive) return aActive - bActive;
        return (
          insuranceTypeRank(a.type) - insuranceTypeRank(b.type)
        );
      });
    }
    return policies.sort((a, b) => {
      let av: any = "",
        bv: any = "";
      if (insSortCol === "active") {
        av = a.active !== false ? 0 : 1;
        bv = b.active !== false ? 0 : 1;
      } else if (insSortCol === "type") {
        av = insuranceTypeRank(a.type);
        bv = insuranceTypeRank(b.type);
      } else if (insSortCol === "startDate") {
        av = a.startDate || "";
        bv = b.startDate || "";
      } else if (insSortCol === "endDate") {
        av = a.endDate || "";
        bv = b.endDate || "";
      } else if (insSortCol === "subscriber") {
        av = (a.subscriber || "").toLowerCase();
        bv = (b.subscriber || "").toLowerCase();
      } else if (insSortCol === "provider") {
        av = (a.provider || "").toLowerCase();
        bv = (b.provider || "").toLowerCase();
      } else if (insSortCol === "policyNumber") {
        av = (a.policyNumber || "").toLowerCase();
        bv = (b.policyNumber || "").toLowerCase();
      } else if (insSortCol === "documents") {
        av = a.hasDocuments ? 0 : 1;
        bv = b.hasDocuments ? 0 : 1;
      }
      if (av < bv) return insSortDir === "asc" ? -1 : 1;
      if (av > bv) return insSortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [insurancePolicies, insSortCol, insSortDir]);

  return (
    <>
      {activeTab === "healthOverview" && (
        <div className="w-full">
          {activeHealthSection === "medication" && (
            <MedicationsSection
              hideOtcDashboard={hideOtcDashboard}
              youthId={
                youthConstituentId !== null
                  ? String(youthConstituentId)
                  : undefined
              }
              medicationYouthId={medicationYouthId}
            />
          )}
          {activeHealthSection === "physical" && (
            <>
              <div
                className="overflow-hidden pb-8"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  borderRadius:
                    "var(--slds-c-card-radius-border)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              >
                {/* Horizontal Sub-tabs for Physical Health */}
                <div
                  className="flex overflow-x-auto overflow-y-hidden border-b"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <button
                    onClick={() =>
                      setActivePhysicalSection("general")
                    }
                    className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                      activePhysicalSection === "general"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:text-[#080707]"
                    }`}
                    style={
                      activePhysicalSection === "general"
                        ? {
                            borderBottom: "3px solid #145F33",
                            marginBottom: "-1px",
                          }
                        : {}
                    }
                  >
                    General
                  </button>
                  <button
                    onClick={() =>
                      setActivePhysicalSection("current-needs")
                    }
                    className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                      activePhysicalSection === "current-needs"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:text-[#080707]"
                    }`}
                    style={
                      activePhysicalSection === "current-needs"
                        ? {
                            borderBottom: "3px solid #145F33",
                            marginBottom: "-1px",
                          }
                        : {}
                    }
                  >
                    Current Medical Needs
                  </button>
                </div>

                {/* Physical Health Content */}
                {activePhysicalSection === "general" && (
                  <div className="p-3 sm:p-6">
                    <div className="space-y-5">
                      {/* Emergency Contacts - READ ONLY */}
                      {/* Data source: Relationships page. Users cannot edit from this view. */}
                      <div
                        className="overflow-hidden pb-8"
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
                          <div className="flex items-center gap-2">
                            <h3 className="text-[13px] font-semibold text-[#080707]">
                              Emergency Contacts
                            </h3>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-[13px]">
                            <thead>
                              <tr
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-alt)",
                                }}
                              >
                                <th
                                  className="px-4 py-2 text-left text-[11px] font-semibold"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                    width: "20%",
                                  }}
                                >
                                  NAME
                                </th>
                                <th
                                  className="px-4 py-2 text-left text-[11px] font-semibold"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                    width: "18%",
                                  }}
                                >
                                  RELATIONSHIP
                                </th>
                                <th
                                  className="px-4 py-2 text-left text-[11px] font-semibold"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                    width: "16%",
                                  }}
                                >
                                  PHONE
                                </th>
                                <th
                                  className="px-4 py-2 text-left text-[11px] font-semibold"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                    width: "28%",
                                  }}
                                >
                                  ADDRESS
                                </th>
                                <th
                                  className="px-4 py-2 text-left text-[11px] font-semibold"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                    width: "18%",
                                  }}
                                >
                                  PRIMARY
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {emergencyContacts.map(
                                (contact) => (
                                  <tr
                                    key={contact.id}
                                    className="hover:bg-[#fafaf9] border-b border-[#e5e5e4]"
                                  >
                                    <td className="px-4 py-2">
                                      <button
                                        className="text-[#145F33] hover:underline font-medium text-[12px]"
                                        onClick={() => {
                                          /* Navigate to Relationships page */
                                        }}
                                        title="View in Relationships"
                                      >
                                        {contact.name}
                                      </button>
                                    </td>
                                    <td className="px-4 py-2 text-[#3e3e3c] text-[12px]">
                                      {contact.relationship}
                                    </td>
                                    <td className="px-4 py-2 text-[#3e3e3c] text-[12px] whitespace-nowrap">
                                      {contact.phone}
                                    </td>
                                    <td className="px-4 py-2 text-[#3e3e3c] text-[12px]">
                                      {contact.address}
                                    </td>
                                    <td className="px-4 py-2">
                                      {contact.isPrimary && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#e6f2eb] text-[#145F33]">
                                          Primary
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ),
                              )}
                              {emergencyContacts.length ===
                                0 && (
                                <tr>
                                  <td
                                    colSpan={5}
                                    className="px-4 py-8 text-center text-[#706e6b] text-[13px]"
                                  >
                                    No emergency contacts found.
                                    Please add contacts on the
                                    Relationships page.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Key Medical Dates */}
                      <div
                        className="rounded-lg overflow-hidden"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                        }}
                      >
                        <div
                          className="px-4 py-3"
                          style={{
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <h3 className="text-[13px] font-semibold text-[#080707]">
                              Key Medical Dates
                            </h3>
                            <span className="text-[11px] text-[#706e6b] italic">
                              (Most recent connection with
                              "Attendance: Yes" or document
                              received)
                            </span>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table
                            className="w-full text-[13px]"
                            style={{
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-alt)",
                                }}
                              >
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  Medical Type
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  Most Recent Date
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                className="hover:bg-gray-50/50 transition-colors"
                                style={{
                                  borderBottom:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                <td
                                  className="px-4 py-3"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  Annual Physical
                                </td>
                                <td className="px-4 py-3">
                                  {keyMedicalDates.annualPhysical !==
                                  "N/A" ? (
                                    <button
                                      className="text-[#145F33] hover:underline font-medium"
                                      onClick={() =>
                                        handleViewMedicalConnection(
                                          keyMedicalDates.annualPhysicalConnectionId,
                                        )
                                      }
                                      title="View record"
                                    >
                                      {
                                        keyMedicalDates.annualPhysical
                                      }
                                    </button>
                                  ) : (
                                    <span className="text-[#706e6b]">
                                      N/A
                                    </span>
                                  )}
                                </td>
                              </tr>
                              <tr
                                className="hover:bg-gray-50/50 transition-colors"
                                style={{
                                  borderBottom:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                <td
                                  className="px-4 py-3"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  Biannual Dental
                                </td>
                                <td className="px-4 py-3">
                                  {keyMedicalDates.biannualDental !==
                                  "N/A" ? (
                                    <button
                                      className="text-[#145F33] hover:underline font-medium"
                                      onClick={() =>
                                        handleViewMedicalConnection(
                                          keyMedicalDates.biannualDentalConnectionId,
                                        )
                                      }
                                      title="View record"
                                    >
                                      {
                                        keyMedicalDates.biannualDental
                                      }
                                    </button>
                                  ) : (
                                    <span className="text-[#706e6b]">
                                      N/A
                                    </span>
                                  )}
                                </td>
                              </tr>
                              <tr
                                className="hover:bg-gray-50/50 transition-colors"
                                style={{
                                  borderBottom:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                <td
                                  className="px-4 py-3"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  Hearing
                                </td>
                                <td className="px-4 py-3">
                                  {keyMedicalDates.hearing !==
                                  "N/A" ? (
                                    <button
                                      className="text-[#145F33] hover:underline font-medium"
                                      onClick={() =>
                                        handleViewMedicalConnection(
                                          keyMedicalDates.hearingConnectionId,
                                        )
                                      }
                                      title="View record"
                                    >
                                      {keyMedicalDates.hearing}
                                    </button>
                                  ) : (
                                    <span className="text-[#706e6b]">
                                      N/A
                                    </span>
                                  )}
                                </td>
                              </tr>
                              <tr
                                className="hover:bg-gray-50/50 transition-colors"
                                style={{
                                  borderBottom:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                <td
                                  className="px-4 py-3"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  Vision
                                </td>
                                <td className="px-4 py-3">
                                  {keyMedicalDates.vision !==
                                  "N/A" ? (
                                    <button
                                      className="text-[#145F33] hover:underline font-medium"
                                      onClick={() =>
                                        handleViewMedicalConnection(
                                          keyMedicalDates.visionConnectionId,
                                        )
                                      }
                                      title="View record"
                                    >
                                      {keyMedicalDates.vision}
                                    </button>
                                  ) : (
                                    <span className="text-[#706e6b]">
                                      N/A
                                    </span>
                                  )}
                                </td>
                              </tr>
                              <tr
                                className="hover:bg-gray-50/50 transition-colors"
                                style={{
                                  borderBottom:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                <td
                                  className="px-4 py-3"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  TB Tests
                                </td>
                                <td className="px-4 py-3">
                                  {keyMedicalDates.tbTest !==
                                  "N/A" ? (
                                    <button
                                      className="text-[#145F33] hover:underline font-medium"
                                      onClick={() =>
                                        handleViewMedicalConnection(
                                          keyMedicalDates.tbTestConnectionId,
                                        )
                                      }
                                      title="View TB Test record"
                                    >
                                      {keyMedicalDates.tbTest}
                                    </button>
                                  ) : (
                                    <span className="text-[#706e6b]">
                                      N/A
                                    </span>
                                  )}
                                </td>
                              </tr>
                              <tr className="hover:bg-gray-50/50 transition-colors">
                                <td
                                  className="px-4 py-3"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  Immunizations Records Received
                                </td>
                                <td className="px-4 py-3">
                                  {keyMedicalDates.immunizations !==
                                  "N/A" ? (
                                    <button
                                      className="text-[#145F33] hover:underline font-medium"
                                      onClick={() =>
                                        handleViewMedicalConnection(
                                          keyMedicalDates.immunizationsConnectionId,
                                        )
                                      }
                                      title="View Immunization Record"
                                    >
                                      {
                                        keyMedicalDates.immunizations
                                      }
                                    </button>
                                  ) : (
                                    <span className="text-[#706e6b]">
                                      N/A
                                    </span>
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Insurance */}
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
                        {/* Card Header */}
                        <div
                          className="px-4 py-3 flex items-center justify-between"
                          style={{
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                          }}
                        >
                          <h3
                            className="text-[13px] font-semibold"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            Insurance
                          </h3>
                          <Button
                            className="h-7 px-3 rounded-full text-[11px] font-medium text-white"
                            style={{
                              backgroundColor: "#145F33",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#0e4524")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#145F33")
                            }
                            onClick={onCreateInsurance}
                          >
                            <Plus className="h-3" />
                            Create New
                          </Button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                          <table
                            className="w-full text-[13px]"
                            style={{
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-alt)",
                                }}
                              >
                                {/* Active */}
                                {(
                                  [
                                    {
                                      col: "active",
                                      label: "ACTIVE",
                                      width: "6%",
                                    },
                                    {
                                      col: "type",
                                      label: "INSURANCE TYPE",
                                      width: "16%",
                                    },
                                    {
                                      col: "startDate",
                                      label: "START DATE",
                                      width: "10%",
                                    },
                                    {
                                      col: "endDate",
                                      label: "END DATE",
                                      width: "10%",
                                    },
                                    {
                                      col: "subscriber",
                                      label: "SUBSCRIBER",
                                      width: "14%",
                                    },
                                    {
                                      col: "provider",
                                      label: "PROVIDER",
                                      width: "16%",
                                    },
                                    {
                                      col: "policyNumber",
                                      label: "POLICY NUMBER",
                                      width: "14%",
                                    },
                                    {
                                      col: "documents",
                                      label: "DOCS",
                                      width: "6%",
                                    },
                                  ] as {
                                    col: string;
                                    label: string;
                                    width: string;
                                  }[]
                                ).map(
                                  ({ col, label, width }) => (
                                    <th
                                      key={col}
                                      className="px-3 py-2.5 text-left text-[11px] font-semibold cursor-pointer select-none whitespace-nowrap"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                        borderBottom:
                                          "2px solid var(--slds-g-color-border-base-1)",
                                        width,
                                      }}
                                      onClick={() =>
                                        handleInsSort(col)
                                      }
                                    >
                                      <div className="flex items-center gap-1">
                                        {label}
                                        <span
                                          className="inline-flex flex-col"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-weak)",
                                          }}
                                        >
                                          {insSortCol ===
                                          col ? (
                                            insSortDir ===
                                            "asc" ? (
                                              <ArrowUp className="w-3 h-3" />
                                            ) : (
                                              <ArrowDown className="w-3 h-3" />
                                            )
                                          ) : (
                                            <span className="opacity-30">
                                              <ArrowUp className="w-2.5 h-2.5" />
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                    </th>
                                  ),
                                )}
                                <th
                                  className="px-3 py-2.5 text-left text-[11px] font-semibold"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "2px solid var(--slds-g-color-border-base-1)",
                                    width: "8%",
                                  }}
                                >
                                  ACTIONS
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {sortedInsurance.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={9}
                                    className="px-4 py-10 text-center"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-[13px]">
                                      No insurance records
                                      found.
                                    </p>
                                    <p className="text-[12px] mt-0.5">
                                      Use{" "}
                                      <strong>
                                        Create New
                                      </strong>{" "}
                                      to add an insurance
                                      policy.
                                    </p>
                                  </td>
                                </tr>
                              ) : (
                                sortedInsurance.map(
                                  (
                                    policy: any,
                                    index: number,
                                  ) => {
                                    const isActive =
                                      policy.active !== false;
                                    const isEven =
                                      index % 2 === 0;
                                    return (
                                      <tr
                                        key={policy.id}
                                        className="transition-colors"
                                        style={{
                                          borderBottom:
                                            index <
                                            sortedInsurance.length -
                                              1
                                              ? "1px solid var(--slds-g-color-border-base-1)"
                                              : "none",
                                          backgroundColor:
                                            isEven
                                              ? "var(--slds-g-color-background-base)"
                                              : "var(--slds-g-color-background-alt)",
                                        }}
                                        onMouseEnter={(e) =>
                                          (e.currentTarget.style.backgroundColor =
                                            "#f3f3f1")
                                        }
                                        onMouseLeave={(e) =>
                                          (e.currentTarget.style.backgroundColor =
                                            isEven
                                              ? "var(--slds-g-color-background-base)"
                                              : "var(--slds-g-color-background-alt)")
                                        }
                                      >
                                        {/* Active */}
                                        <td className="px-3 py-2.5">
                                          {isActive ? (
                                            <span
                                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                              style={{
                                                backgroundColor:
                                                  "#e6f2eb",
                                                color:
                                                  "#145F33",
                                              }}
                                            >
                                              Active
                                            </span>
                                          ) : (
                                            <span
                                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                              style={{
                                                backgroundColor:
                                                  "var(--slds-g-color-background-alt)",
                                                color:
                                                  "var(--slds-g-color-text-weak)",
                                                border:
                                                  "1px solid var(--slds-g-color-border-base-1)",
                                              }}
                                            >
                                              Inactive
                                            </span>
                                          )}
                                        </td>
                                        {/* Insurance Type */}
                                        <td className="px-3 py-2.5">
                                          <span
                                            className="block max-w-[160px] truncate text-[13px] font-medium"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                            }}
                                            title={policy.type}
                                          >
                                            {policy.type}
                                          </span>
                                        </td>
                                        {/* Start Date */}
                                        <td
                                          className="px-3 py-2.5 whitespace-nowrap text-[13px]"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-default)",
                                          }}
                                        >
                                          {policy.startDate || (
                                            <span
                                              style={{
                                                color:
                                                  "var(--slds-g-color-text-weak)",
                                              }}
                                            >
                                              —
                                            </span>
                                          )}
                                        </td>
                                        {/* End Date */}
                                        <td
                                          className="px-3 py-2.5 whitespace-nowrap text-[13px]"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-default)",
                                          }}
                                        >
                                          {policy.endDate || (
                                            <span
                                              style={{
                                                color:
                                                  "var(--slds-g-color-text-weak)",
                                              }}
                                            >
                                              —
                                            </span>
                                          )}
                                        </td>
                                        {/* Subscriber */}
                                        <td className="px-3 py-2.5">
                                          <span
                                            className="block max-w-[140px] truncate text-[13px]"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                            }}
                                            title={
                                              policy.subscriber
                                            }
                                          >
                                            {policy.subscriber || (
                                              <span
                                                style={{
                                                  color:
                                                    "var(--slds-g-color-text-weak)",
                                                }}
                                              >
                                                —
                                              </span>
                                            )}
                                          </span>
                                        </td>
                                        {/* Provider */}
                                        <td className="px-3 py-2.5">
                                          <span
                                            className="block max-w-[160px] truncate text-[13px]"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                            }}
                                            title={
                                              policy.provider
                                            }
                                          >
                                            {policy.provider || (
                                              <span
                                                style={{
                                                  color:
                                                    "var(--slds-g-color-text-weak)",
                                                }}
                                              >
                                                —
                                              </span>
                                            )}
                                          </span>
                                        </td>
                                        {/* Policy Number */}
                                        <td className="px-3 py-2.5">
                                          <span
                                            className="block max-w-[140px] truncate text-[13px] font-mono"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                            }}
                                            title={
                                              policy.policyNumber
                                            }
                                          >
                                            {policy.policyNumber || (
                                              <span
                                                style={{
                                                  color:
                                                    "var(--slds-g-color-text-weak)",
                                                  fontFamily:
                                                    "inherit",
                                                  fontWeight: 400,
                                                }}
                                              >
                                                —
                                              </span>
                                            )}
                                          </span>
                                        </td>
                                        {/* Documents */}
                                        <td className="px-3 py-2.5">
                                          {policyDocs[
                                            policy.id
                                          ] ? (
                                            <button
                                              title={`View: ${policyDocs[policy.id]}`}
                                              onClick={() =>
                                                toast.success(
                                                  `Opening "${policyDocs[policy.id]}"…`,
                                                )
                                              }
                                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] transition-colors hover:bg-blue-50 max-w-[80px]"
                                              style={{
                                                color:
                                                  "#0176d3",
                                              }}
                                            >
                                              <Paperclip className="h-3 w-3 flex-shrink-0" />
                                              <span className="truncate">
                                                {
                                                  policyDocs[
                                                    policy.id
                                                  ]
                                                }
                                              </span>
                                            </button>
                                          ) : (
                                            <button
                                              title="Upload document"
                                              onClick={() => {
                                                setInsUploadPolicyId(
                                                  policy.id,
                                                );
                                                setInsUploadName(
                                                  "",
                                                );
                                              }}
                                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors hover:bg-gray-50"
                                              style={{
                                                color:
                                                  "var(--slds-g-color-text-weak)",
                                                border:
                                                  "1px solid var(--slds-g-color-border-base-1)",
                                              }}
                                            >
                                              <Upload className="h-3 w-3" />
                                              Upload
                                            </button>
                                          )}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-3 py-2.5">
                                          <div className="flex items-center gap-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 px-2 hover:bg-[var(--slds-g-color-background-row-hover)]"
                                              onClick={() =>
                                                setInsViewPolicy(
                                                  policy,
                                                )
                                              }
                                              title="View"
                                            >
                                              <Eye
                                                className="h-3.5 w-3.5"
                                                style={{
                                                  color:
                                                    "#145F33",
                                                }}
                                              />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 px-2 hover:bg-[var(--slds-g-color-background-row-hover)]"
                                              onClick={() => {
                                                setInsEditForm({
                                                  type:
                                                    policy.type ||
                                                    "",
                                                  startDate:
                                                    policy.startDate ||
                                                    "",
                                                  endDate:
                                                    policy.endDate ||
                                                    "",
                                                  subscriber:
                                                    policy.subscriber ||
                                                    "",
                                                  provider:
                                                    policy.provider ||
                                                    "",
                                                  policyNumber:
                                                    policy.policyNumber ||
                                                    "",
                                                  active:
                                                    policy.active !==
                                                    false,
                                                });
                                                setInsEditNewDoc(
                                                  null,
                                                );
                                                setInsEditErrors(
                                                  {},
                                                );
                                                setInsEditPolicy(
                                                  policy,
                                                );
                                              }}
                                              title="Edit"
                                            >
                                              <Pencil
                                                className="h-3.5 w-3.5"
                                                style={{
                                                  color:
                                                    "var(--slds-g-color-text-default)",
                                                }}
                                              />
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  },
                                )
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Row count footer */}
                        {sortedInsurance.length > 0 && (
                          <div
                            className="px-4 py-2 text-[11px]"
                            style={{
                              borderTop:
                                "1px solid var(--slds-g-color-border-base-1)",
                              color:
                                "var(--slds-g-color-text-weak)",
                              backgroundColor:
                                "var(--slds-g-color-background-alt)",
                            }}
                          >
                            {sortedInsurance.length} record
                            {sortedInsurance.length !== 1
                              ? "s"
                              : ""}{" "}
                            &nbsp;·&nbsp;{" "}
                            {
                              sortedInsurance.filter(
                                (p: any) => p.active !== false,
                              ).length
                            }{" "}
                            active
                          </div>
                        )}
                      </div>

                      {/* ── View Insurance Modal ───────────────────────────── */}
                      <InsurancePolicyDialog
                        open={!!insViewPolicy}
                        mode="view"
                        initialData={insViewPolicy}
                        onClose={() => setInsViewPolicy(null)}
                        onSave={() => {}}
                      />

                      {/* ── Edit Insurance Modal ───────────────────────────── */}
                      <InsurancePolicyDialog
                        open={!!insEditPolicy}
                        mode="edit"
                        initialData={insEditPolicy}
                        onClose={() => {
                          setInsEditPolicy(null);
                        }}
                        onSave={(data) => {
                          onUpdateInsurance({
                            ...insEditPolicy,
                            ...data,
                          });
                          setInsEditPolicy(null);
                        }}
                      />

                      {/* ── Upload Document Modal ──────────────────────────── */}
                      {insUploadPolicyId !== null && (
                        <Dialog
                          open
                          onOpenChange={() => {
                            setInsUploadPolicyId(null);
                            setInsUploadName("");
                          }}
                        >
                          <DialogContent
                            className="max-w-sm"
                            aria-describedby="ins-upload-desc"
                          >
                            <DialogHeader>
                              <DialogTitle
                                className="text-[15px] font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                Upload Document
                              </DialogTitle>
                            </DialogHeader>
                            <DialogDescription
                              id="ins-upload-desc"
                              className="text-[13px]"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              Attach one document to this
                              Insurance record. Maximum 1
                              document per record.
                            </DialogDescription>
                            <div className="mt-3">
                              {insUploadName ? (
                                <div
                                  className="flex items-center gap-2 p-3 rounded-lg"
                                  style={{
                                    backgroundColor: "#f0f9f4",
                                    border: "1px solid #a8d5bc",
                                  }}
                                >
                                  <FileText
                                    className="h-5 w-5 flex-shrink-0"
                                    style={{ color: "#145F33" }}
                                  />
                                  <span
                                    className="text-[13px] flex-1 truncate"
                                    style={{ color: "#145F33" }}
                                  >
                                    {insUploadName}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setInsUploadName("");
                                      if (insFileRef.current)
                                        insFileRef.current.value =
                                          "";
                                    }}
                                    title="Remove file"
                                  >
                                    <XIcon
                                      className="h-4 w-4"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    />
                                  </button>
                                </div>
                              ) : (
                                <label
                                  className="flex flex-col items-center justify-center gap-2 p-8 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                                  style={{
                                    border:
                                      "2px dashed var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  <Upload
                                    className="h-8 w-8"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                      opacity: 0.4,
                                    }}
                                  />
                                  <span
                                    className="text-[13px] font-medium"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    Choose File
                                  </span>
                                  <span
                                    className="text-[12px]"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    or drag and drop
                                  </span>
                                  <input
                                    ref={insFileRef}
                                    type="file"
                                    className="sr-only"
                                    onChange={(e) => {
                                      const f =
                                        e.target.files?.[0];
                                      if (f)
                                        setInsUploadName(
                                          f.name,
                                        );
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                            <DialogFooter className="mt-4">
                              <Button
                                variant="outline"
                                className="rounded-full h-9 text-[13px]"
                                style={{
                                  borderColor:
                                    "var(--slds-g-color-border-base-1)",
                                }}
                                onClick={() => {
                                  setInsUploadPolicyId(null);
                                  setInsUploadName("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                className="rounded-full h-9 text-[13px] text-white flex items-center gap-1.5"
                                style={{
                                  backgroundColor: "#145F33",
                                  opacity: insUploadName
                                    ? 1
                                    : 0.5,
                                }}
                                disabled={!insUploadName}
                                onClick={() => {
                                  if (
                                    !insUploadName ||
                                    insUploadPolicyId === null
                                  )
                                    return;
                                  setPolicyDocs((prev) => ({
                                    ...prev,
                                    [insUploadPolicyId]:
                                      insUploadName,
                                  }));
                                  toast.success(
                                    `"${insUploadName}" uploaded successfully.`,
                                  );
                                  setInsUploadPolicyId(null);
                                  setInsUploadName("");
                                  if (insFileRef.current)
                                    insFileRef.current.value =
                                      "";
                                }}
                              >
                                <Upload className="h-3.5 w-3.5" />{" "}
                                Upload
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                )}

                {/* Current Medical Needs Tab */}
                {activePhysicalSection === "current-needs" && (
                  <div className="p-3 sm:p-6">
                    <div className="space-y-5">
                      {/* Medical & Physical Needs */}
                      <div
                        className="rounded-lg overflow-hidden"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
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
                            Medical & Physical Needs
                          </h3>
                          <Button
                            onClick={handleAddMedicalNeed}
                            className="h-8 px-3 rounded-full text-[13px]"
                            style={{
                              backgroundColor: "#145F33",
                              color: "white",
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                        <div className="overflow-x-auto">
                          <table
                            className="w-full text-[13px]"
                            style={{
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-alt)",
                                }}
                              >
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold"
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
                                  className="px-4 py-3 text-left text-[12px] font-semibold"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  Allergy Type
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  Start Date
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  End Date
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  Details
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold w-24"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {medicalNeeds.map(
                                (need, index) => (
                                  <tr
                                    key={need.id}
                                    className="hover:bg-gray-50/50 transition-colors"
                                    style={{
                                      borderBottom:
                                        index <
                                        medicalNeeds.length - 1
                                          ? "1px solid var(--slds-g-color-border-base-1)"
                                          : "none",
                                    }}
                                  >
                                    <td className="px-4 py-3">
                                      <button
                                        className="text-[#145F33] hover:underline font-medium"
                                        onClick={() =>
                                          handleEditMedicalNeed(
                                            need,
                                          )
                                        }
                                        title="View record"
                                      >
                                        {need.type === "Other"
                                          ? need.other
                                          : need.type}
                                      </button>
                                    </td>
                                    <td
                                      className="px-4 py-3"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {need.allergyType || "—"}
                                    </td>
                                    <td
                                      className="px-4 py-3"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {need.startDate}
                                    </td>
                                    <td
                                      className="px-4 py-3"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {need.endDate || "—"}
                                    </td>
                                    <td
                                      className="px-4 py-3"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {need.details}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() =>
                                            handleEditMedicalNeed(
                                              need,
                                            )
                                          }
                                          className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                          title="Edit"
                                        >
                                          <Pencil
                                            className="h-3.5 w-3.5"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-weak)",
                                            }}
                                          />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteMedicalNeed(
                                              need.id,
                                            )
                                          }
                                          className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                          title="Delete"
                                        >
                                          <Trash2 className="h-3.5 w-3.5 text-[#c23934]" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ),
                              )}
                              {medicalNeeds.length === 0 && (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className="px-4 py-8 text-center text-[#706e6b] text-[13px]"
                                  >
                                    No medical needs documented.
                                    Click Add to create a new
                                    record.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Dietary Needs */}
                      <div
                        className="rounded-lg overflow-hidden"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
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
                            Dietary Needs
                          </h3>
                          <Button
                            onClick={handleAddDietaryNeed}
                            className="h-8 px-3 rounded-full text-[13px]"
                            style={{
                              backgroundColor: "#145F33",
                              color: "white",
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                        <div className="overflow-x-auto">
                          <table
                            className="w-full text-[13px]"
                            style={{
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-alt)",
                                }}
                              >
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold"
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
                                  className="px-4 py-3 text-left text-[12px] font-semibold"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  Allergy
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  Start Date
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  End Date
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  Details
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold w-24"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {medicalNeeds
                                .filter((need) => need.dietary)
                                .map((need, index) => (
                                  <tr
                                    key={need.id}
                                    className="hover:bg-gray-50/50 transition-colors"
                                    style={{
                                      borderBottom:
                                        index <
                                        medicalNeeds.filter(
                                          (n) => n.dietary,
                                        ).length -
                                          1
                                          ? "1px solid var(--slds-g-color-border-base-1)"
                                          : "none",
                                    }}
                                  >
                                    <td className="px-4 py-3">
                                      <button
                                        className="text-[#145F33] hover:underline font-medium"
                                        onClick={() =>
                                          handleEditDietaryNeed(
                                            need,
                                          )
                                        }
                                        title="View record"
                                      >
                                        {need.dietaryNeedType ===
                                        "Other"
                                          ? need.dietaryNeedOther
                                          : need.dietaryNeedType}
                                      </button>
                                    </td>
                                    <td
                                      className="px-4 py-3"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {need.isFoodAllergy ===
                                      "Yes"
                                        ? "Yes"
                                        : "No"}
                                    </td>
                                    <td
                                      className="px-4 py-3"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {need.startDate}
                                    </td>
                                    <td
                                      className="px-4 py-3"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {need.endDate || "—"}
                                    </td>
                                    <td
                                      className="px-4 py-3"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {need.details}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() =>
                                            handleEditDietaryNeed(
                                              need,
                                            )
                                          }
                                          className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                          title="Edit"
                                        >
                                          <Pencil
                                            className="h-3.5 w-3.5"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-weak)",
                                            }}
                                          />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteDietaryNeed(
                                              need.id,
                                            )
                                          }
                                          className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                          title="Delete"
                                        >
                                          <Trash2 className="h-3.5 w-3.5 text-[#c23934]" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              {medicalNeeds.filter(
                                (need) => need.dietary,
                              ).length === 0 && (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className="px-4 py-8 text-center text-[#706e6b] text-[13px]"
                                  >
                                    No dietary needs documented.
                                    Click Add to create a new
                                    record.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Medical & Physical Needs Dialog */}
                <Dialog
                  open={medicalNeedDialogOpen}
                  onOpenChange={setMedicalNeedDialogOpen}
                >
                  <DialogContent
                    className="sm:max-w-3xl max-h-[85vh] overflow-y-auto"
                    aria-describedby={undefined}
                  >
                    <DialogHeader>
                      <DialogTitle className="text-[15px] font-semibold text-[#080707]">
                        {editingMedicalNeedId
                          ? "Edit Medical/Physical Need"
                          : "Add Medical/Physical Need"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Physical/Medical Need */}
                        <div>
                          <Label
                            htmlFor="medical-need-type"
                            className="block text-[12px] font-semibold mb-1.5 uppercase"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Physical/Medical Need{" "}
                            <span className="text-red-600">
                              *
                            </span>
                          </Label>
                          <Select
                            value={medicalNeedFormData.type}
                            onValueChange={(value) =>
                              setMedicalNeedFormData({
                                ...medicalNeedFormData,
                                type: value,
                                allergyType:
                                  value !== "Allergies"
                                    ? ""
                                    : medicalNeedFormData.allergyType,
                                other:
                                  value !== "Other"
                                    ? ""
                                    : medicalNeedFormData.other,
                              })
                            }
                          >
                            <SelectTrigger
                              id="medical-need-type"
                              className="h-9 text-[13px] rounded"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              <SelectValue placeholder="Please Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {PHYSICAL_MEDICAL_NEED_TYPES.map(
                                (type) => (
                                  <SelectItem
                                    key={type}
                                    value={type}
                                  >
                                    {type}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Allergy Type - Only visible when Allergies is selected */}
                        {medicalNeedFormData.type ===
                          "Allergies" && (
                          <div>
                            <Label
                              htmlFor="allergy-type"
                              className="block text-[12px] font-semibold mb-1.5 uppercase"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              Allergy Type
                            </Label>
                            <Select
                              value={
                                medicalNeedFormData.allergyType
                              }
                              onValueChange={(value) =>
                                setMedicalNeedFormData({
                                  ...medicalNeedFormData,
                                  allergyType: value,
                                  // Reset food allergy fields if changing away from Food
                                  isFoodAllergy:
                                    value === "Food"
                                      ? medicalNeedFormData.isFoodAllergy
                                      : "Yes",
                                  dietaryNeedType:
                                    value === "Food"
                                      ? medicalNeedFormData.dietaryNeedType
                                      : "",
                                  dietaryNeedOther:
                                    value === "Food"
                                      ? medicalNeedFormData.dietaryNeedOther
                                      : "",
                                  dietary:
                                    value === "Food"
                                      ? medicalNeedFormData.dietary
                                      : false,
                                })
                              }
                            >
                              <SelectTrigger
                                id="allergy-type"
                                className="h-9 text-[13px] rounded"
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-base)",
                                  border:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                <SelectValue placeholder="Please Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {ALLERGY_TYPES.map((type) => (
                                  <SelectItem
                                    key={type}
                                    value={type}
                                  >
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Other field - Only visible when Other type is selected */}
                        {medicalNeedFormData.type ===
                          "Other" && (
                          <div>
                            <Label
                              htmlFor="medical-need-other"
                              className="block text-[12px] font-semibold mb-1.5 uppercase"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              Other{" "}
                              <span className="text-red-600">
                                *
                              </span>
                            </Label>
                            <Input
                              id="medical-need-other"
                              value={medicalNeedFormData.other}
                              onChange={(e) =>
                                setMedicalNeedFormData({
                                  ...medicalNeedFormData,
                                  other: e.target.value,
                                })
                              }
                              placeholder="Specify medical need"
                              className="h-9 text-[13px]"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Food Allergy Logic - Only visible when Allergy Type = Food */}
                      {medicalNeedFormData.type ===
                        "Allergies" &&
                        medicalNeedFormData.allergyType ===
                          "Food" && (
                          <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Is this a food allergy? */}
                              <div>
                                <Label
                                  htmlFor="is-food-allergy"
                                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  Is this a food allergy?
                                </Label>
                                <Select
                                  value={
                                    medicalNeedFormData.isFoodAllergy
                                  }
                                  onValueChange={(value) =>
                                    setMedicalNeedFormData({
                                      ...medicalNeedFormData,
                                      isFoodAllergy: value,
                                      dietary:
                                        value === "Yes"
                                          ? true
                                          : medicalNeedFormData.dietary,
                                    })
                                  }
                                >
                                  <SelectTrigger
                                    id="is-food-allergy"
                                    className="h-9 text-[13px] rounded"
                                    style={{
                                      backgroundColor:
                                        "var(--slds-g-color-background-base)",
                                      border:
                                        "1px solid var(--slds-g-color-border-base-1)",
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    <SelectValue placeholder="Please Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Yes">
                                      Yes
                                    </SelectItem>
                                    <SelectItem value="No">
                                      No
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Dietary Need Type */}
                              <div>
                                <Label
                                  htmlFor="dietary-need-type"
                                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  Dietary Need Type
                                </Label>
                                <Select
                                  value={
                                    medicalNeedFormData.dietaryNeedType
                                  }
                                  onValueChange={(value) =>
                                    setMedicalNeedFormData({
                                      ...medicalNeedFormData,
                                      dietaryNeedType: value,
                                      dietaryNeedOther:
                                        value !== "Other"
                                          ? ""
                                          : medicalNeedFormData.dietaryNeedOther,
                                    })
                                  }
                                >
                                  <SelectTrigger
                                    id="dietary-need-type"
                                    className="h-9 text-[13px] rounded"
                                    style={{
                                      backgroundColor:
                                        "var(--slds-g-color-background-base)",
                                      border:
                                        "1px solid var(--slds-g-color-border-base-1)",
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    <SelectValue placeholder="Please Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {DIETARY_NEED_TYPES.map(
                                      (type) => (
                                        <SelectItem
                                          key={type}
                                          value={type}
                                        >
                                          {type}
                                        </SelectItem>
                                      ),
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Other (Dietary) field - Only visible when Dietary Need Type = Other */}
                            {medicalNeedFormData.dietaryNeedType ===
                              "Other" && (
                              <div>
                                <Label
                                  htmlFor="dietary-need-other"
                                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  Other (Dietary){" "}
                                  <span className="text-red-600">
                                    *
                                  </span>
                                </Label>
                                <Input
                                  id="dietary-need-other"
                                  value={
                                    medicalNeedFormData.dietaryNeedOther
                                  }
                                  onChange={(e) =>
                                    setMedicalNeedFormData({
                                      ...medicalNeedFormData,
                                      dietaryNeedOther:
                                        e.target.value,
                                    })
                                  }
                                  placeholder="Specify dietary need"
                                  className="h-9 text-[13px]"
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-base)",
                                    border:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                />
                              </div>
                            )}

                            {/* Dietary Checkbox - Read-only, auto-checked */}
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="dietary-checkbox"
                                checked={
                                  medicalNeedFormData.isFoodAllergy ===
                                  "Yes"
                                }
                                disabled={true}
                                className="border-[#d8d8d8]"
                              />
                              <Label
                                htmlFor="dietary-checkbox"
                                className="text-[13px]"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                Dietary (Auto-checked when "Is
                                this a food allergy?" is Yes)
                              </Label>
                            </div>
                          </>
                        )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Start Date */}
                        <div>
                          <Label
                            htmlFor="medical-start-date"
                            className="block text-[12px] font-semibold mb-1.5 uppercase"
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
                            id="medical-start-date"
                            value={isoToMdy(
                              medicalNeedFormData.startDate,
                            )}
                            onChange={(v) =>
                              ((e) =>
                                setMedicalNeedFormData({
                                  ...medicalNeedFormData,
                                  startDate: e.target.value,
                                }))({
                                target: { value: mdyToIso(v) },
                              })
                            }
                            className="h-9 text-[13px]"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          />
                        </div>

                        {/* End Date */}
                        <div>
                          <Label
                            htmlFor="medical-end-date"
                            className="block text-[12px] font-semibold mb-1.5 uppercase"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            End Date
                          </Label>
                          <DateInput
                            id="medical-end-date"
                            value={isoToMdy(
                              medicalNeedFormData.endDate,
                            )}
                            onChange={(v) =>
                              ((e) =>
                                setMedicalNeedFormData({
                                  ...medicalNeedFormData,
                                  endDate: e.target.value,
                                }))({
                                target: { value: mdyToIso(v) },
                              })
                            }
                            className="h-9 text-[13px]"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          />
                        </div>
                      </div>

                      {/* Related Document */}
                      <div>
                        <Label
                          htmlFor="medical-related-document"
                          className="block text-[12px] font-semibold mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Related Document
                        </Label>
                        <Input
                          id="medical-related-document"
                          value={
                            medicalNeedFormData.relatedDocument
                          }
                          onChange={(e) =>
                            setMedicalNeedFormData({
                              ...medicalNeedFormData,
                              relatedDocument: e.target.value,
                            })
                          }
                          placeholder="Document lookup (to be implemented)"
                          className="h-9 text-[13px]"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        />
                      </div>

                      {/* Details */}
                      <div>
                        <Label
                          htmlFor="medical-details"
                          className="block text-[12px] font-semibold mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Details
                        </Label>
                        <Textarea
                          id="medical-details"
                          value={medicalNeedFormData.details}
                          onChange={(e) =>
                            setMedicalNeedFormData({
                              ...medicalNeedFormData,
                              details: e.target.value,
                            })
                          }
                          placeholder="Enter additional details"
                          rows={4}
                          className="text-[13px] resize-none"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setMedicalNeedDialogOpen(false)
                        }
                        className="h-8 px-4 rounded-full text-[13px] border-[#747474] text-[#747474] hover:bg-[#f3f3f2]"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveMedicalNeed}
                        className="h-8 px-4 rounded-full text-[13px]"
                        style={{
                          backgroundColor: "#145F33",
                          color: "white",
                        }}
                      >
                        Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Dietary Needs Dialog */}
                <Dialog
                  open={dietaryNeedDialogOpen}
                  onOpenChange={setDietaryNeedDialogOpen}
                >
                  <DialogContent
                    className="sm:max-w-3xl max-h-[85vh] overflow-y-auto"
                    aria-describedby={undefined}
                  >
                    <DialogHeader>
                      <DialogTitle className="text-[15px] font-semibold text-[#080707]">
                        {editingDietaryNeedId
                          ? "Edit Dietary Need"
                          : "Add Dietary Need"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Dietary Need Type */}
                        <div>
                          <Label
                            htmlFor="dietary-type"
                            className="block text-[12px] font-semibold mb-1.5 uppercase"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Dietary Need Type{" "}
                            <span className="text-red-600">
                              *
                            </span>
                          </Label>
                          <Select
                            value={
                              dietaryNeedFormData.dietaryNeedType
                            }
                            onValueChange={(value) =>
                              setDietaryNeedFormData({
                                ...dietaryNeedFormData,
                                dietaryNeedType: value,
                                dietaryNeedOther:
                                  value !== "Other"
                                    ? ""
                                    : dietaryNeedFormData.dietaryNeedOther,
                              })
                            }
                          >
                            <SelectTrigger
                              id="dietary-type"
                              className="h-9 text-[13px] rounded"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              <SelectValue placeholder="Please Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {DIETARY_NEED_TYPES.map(
                                (type) => (
                                  <SelectItem
                                    key={type}
                                    value={type}
                                  >
                                    {type}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Is this a food allergy? */}
                        <div>
                          <Label
                            htmlFor="is-food-allergy-dietary"
                            className="block text-[12px] font-semibold mb-1.5 uppercase"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Is this a food allergy?
                          </Label>
                          <Select
                            value={
                              dietaryNeedFormData.isFoodAllergy
                            }
                            onValueChange={(value) =>
                              setDietaryNeedFormData({
                                ...dietaryNeedFormData,
                                isFoodAllergy: value,
                              })
                            }
                          >
                            <SelectTrigger
                              id="is-food-allergy-dietary"
                              className="h-9 text-[13px] rounded"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              <SelectValue placeholder="Please Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Yes">
                                Yes
                              </SelectItem>
                              <SelectItem value="No">
                                No
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Other (Dietary) field - Only visible when Dietary Need Type = Other */}
                      {dietaryNeedFormData.dietaryNeedType ===
                        "Other" && (
                        <div>
                          <Label
                            htmlFor="dietary-other"
                            className="block text-[12px] font-semibold mb-1.5 uppercase"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Other (Dietary){" "}
                            <span className="text-red-600">
                              *
                            </span>
                          </Label>
                          <Input
                            id="dietary-other"
                            value={
                              dietaryNeedFormData.dietaryNeedOther
                            }
                            onChange={(e) =>
                              setDietaryNeedFormData({
                                ...dietaryNeedFormData,
                                dietaryNeedOther:
                                  e.target.value,
                              })
                            }
                            placeholder="Specify dietary need"
                            className="h-9 text-[13px]"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          />
                        </div>
                      )}

                      {/* Auto-populated fields when "Is this a food allergy?" = Yes */}
                      {dietaryNeedFormData.isFoodAllergy ===
                        "Yes" && (
                        <div
                          className="p-3 rounded"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <p
                            className="text-[12px] mb-2"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            <strong>
                              Auto-populated fields:
                            </strong>
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-[13px]">
                            <div>
                              <span className="text-[#706e6b]">
                                Physical/Medical Need:
                              </span>
                              <span className="ml-2 font-medium">
                                Allergies
                              </span>
                            </div>
                            <div>
                              <span className="text-[#706e6b]">
                                Allergy Type:
                              </span>
                              <span className="ml-2 font-medium">
                                Food
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dietary Checkbox - Non-editable, auto-checked */}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="dietary-checkbox-dietary"
                          checked={true}
                          disabled={true}
                          className="border-[#d8d8d8]"
                        />
                        <Label
                          htmlFor="dietary-checkbox-dietary"
                          className="text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          Dietary (Auto-checked for all dietary
                          needs)
                        </Label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Start Date */}
                        <div>
                          <Label
                            htmlFor="dietary-start-date"
                            className="block text-[12px] font-semibold mb-1.5 uppercase"
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
                            id="dietary-start-date"
                            value={isoToMdy(
                              dietaryNeedFormData.startDate,
                            )}
                            onChange={(v) =>
                              ((e) =>
                                setDietaryNeedFormData({
                                  ...dietaryNeedFormData,
                                  startDate: e.target.value,
                                }))({
                                target: { value: mdyToIso(v) },
                              })
                            }
                            className="h-9 text-[13px]"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          />
                        </div>

                        {/* End Date */}
                        <div>
                          <Label
                            htmlFor="dietary-end-date"
                            className="block text-[12px] font-semibold mb-1.5 uppercase"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            End Date
                          </Label>
                          <DateInput
                            id="dietary-end-date"
                            value={isoToMdy(
                              dietaryNeedFormData.endDate,
                            )}
                            onChange={(v) =>
                              ((e) =>
                                setDietaryNeedFormData({
                                  ...dietaryNeedFormData,
                                  endDate: e.target.value,
                                }))({
                                target: { value: mdyToIso(v) },
                              })
                            }
                            className="h-9 text-[13px]"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          />
                        </div>
                      </div>

                      {/* Related Document */}
                      <div>
                        <Label
                          htmlFor="dietary-related-document"
                          className="block text-[12px] font-semibold mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Related Document
                        </Label>
                        <Input
                          id="dietary-related-document"
                          value={
                            dietaryNeedFormData.relatedDocument
                          }
                          onChange={(e) =>
                            setDietaryNeedFormData({
                              ...dietaryNeedFormData,
                              relatedDocument: e.target.value,
                            })
                          }
                          placeholder="Document lookup (to be implemented)"
                          className="h-9 text-[13px]"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        />
                      </div>

                      {/* Details */}
                      <div>
                        <Label
                          htmlFor="dietary-details"
                          className="block text-[12px] font-semibold mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Details
                        </Label>
                        <Textarea
                          id="dietary-details"
                          value={dietaryNeedFormData.details}
                          onChange={(e) =>
                            setDietaryNeedFormData({
                              ...dietaryNeedFormData,
                              details: e.target.value,
                            })
                          }
                          placeholder="Enter additional details"
                          rows={4}
                          className="text-[13px] resize-none"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setDietaryNeedDialogOpen(false)
                        }
                        className="h-8 px-4 rounded-full text-[13px] border-[#747474] text-[#747474] hover:bg-[#f3f3f2]"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveDietaryNeed}
                        className="h-8 px-4 rounded-full text-[13px]"
                        style={{
                          backgroundColor: "#145F33",
                          color: "white",
                        }}
                      >
                        Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </>
          )}
          {activeHealthSection === "mental" && (
            <>
              <div className="p-3 sm:p-6">
                <div className="space-y-5">
                  {/* Diagnoses */}
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
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
                        Diagnoses
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            setDiagnosisFormData({
                              startDate: "",
                              dsmVersion: "DSM V",
                              code: "",
                              details: "",
                              endDate: "",
                              preliminary: true,
                            });
                            setEditingDiagnosisId(null);
                            setDiagnosisActiveTab("details");
                            setDiagnosisDialogOpen(true);
                          }}
                          className="h-8 px-3 rounded-full text-[13px]"
                          style={{
                            backgroundColor: "#145F33",
                            color: "white",
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table
                        className="w-full text-[13px]"
                        style={{ borderCollapse: "collapse" }}
                      >
                        <thead>
                          <tr
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-alt)",
                            }}
                          >
                            <th
                              className="px-4 py-3 text-left text-[12px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                              onClick={() =>
                                handleDiagnosisSort("startDate")
                              }
                            >
                              <div className="flex items-center gap-1">
                                Start Date
                                {diagnosisSortColumn ===
                                  "startDate" &&
                                  (diagnosisSortDirection ===
                                  "asc" ? (
                                    <ArrowUp className="w-3 h-3" />
                                  ) : (
                                    <ArrowDown className="w-3 h-3" />
                                  ))}
                              </div>
                            </th>
                            <th
                              className="px-4 py-3 text-left text-[12px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                              onClick={() =>
                                handleDiagnosisSort(
                                  "dsmVersion",
                                )
                              }
                            >
                              <div className="flex items-center gap-1">
                                DSM Version
                                {diagnosisSortColumn ===
                                  "dsmVersion" &&
                                  (diagnosisSortDirection ===
                                  "asc" ? (
                                    <ArrowUp className="w-3 h-3" />
                                  ) : (
                                    <ArrowDown className="w-3 h-3" />
                                  ))}
                              </div>
                            </th>
                            <th
                              className="px-4 py-3 text-left text-[12px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                              onClick={() =>
                                handleDiagnosisSort("code")
                              }
                            >
                              <div className="flex items-center gap-1">
                                DSM Code
                                {diagnosisSortColumn ===
                                  "code" &&
                                  (diagnosisSortDirection ===
                                  "asc" ? (
                                    <ArrowUp className="w-3 h-3" />
                                  ) : (
                                    <ArrowDown className="w-3 h-3" />
                                  ))}
                              </div>
                            </th>
                            <th
                              className="px-4 py-3 text-left text-[12px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                              onClick={() =>
                                handleDiagnosisSort("details")
                              }
                            >
                              <div className="flex items-center gap-1">
                                Details
                                {diagnosisSortColumn ===
                                  "details" &&
                                  (diagnosisSortDirection ===
                                  "asc" ? (
                                    <ArrowUp className="w-3 h-3" />
                                  ) : (
                                    <ArrowDown className="w-3 h-3" />
                                  ))}
                              </div>
                            </th>
                            <th
                              className="px-4 py-3 text-left text-[12px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                              onClick={() =>
                                handleDiagnosisSort("endDate")
                              }
                            >
                              <div className="flex items-center gap-1">
                                End Date
                                {diagnosisSortColumn ===
                                  "endDate" &&
                                  (diagnosisSortDirection ===
                                  "asc" ? (
                                    <ArrowUp className="w-3 h-3" />
                                  ) : (
                                    <ArrowDown className="w-3 h-3" />
                                  ))}
                              </div>
                            </th>
                            <th
                              className="px-4 py-3 text-left text-[12px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                              onClick={() =>
                                handleDiagnosisSort(
                                  "preliminary",
                                )
                              }
                            >
                              <div className="flex items-center gap-1">
                                Preliminary
                                {diagnosisSortColumn ===
                                  "preliminary" &&
                                  (diagnosisSortDirection ===
                                  "asc" ? (
                                    <ArrowUp className="w-3 h-3" />
                                  ) : (
                                    <ArrowDown className="w-3 h-3" />
                                  ))}
                              </div>
                            </th>
                            <th
                              className="px-4 py-3 text-left text-[12px] font-semibold w-24"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedDiagnoses.map(
                            (diagnosis, index) => (
                              <tr
                                key={diagnosis.id}
                                className="hover:bg-gray-50/50 transition-colors"
                                style={{
                                  borderBottom:
                                    index < diagnoses.length - 1
                                      ? "1px solid var(--slds-g-color-border-base-1)"
                                      : "none",
                                }}
                              >
                                <td
                                  className="px-4 py-3"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {diagnosis.startDate}
                                </td>
                                <td
                                  className="px-4 py-3"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {diagnosis.dsmVersion}
                                </td>
                                <td
                                  className="px-4 py-3 font-medium"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {diagnosis.code}
                                </td>
                                <td
                                  className="px-4 py-3"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {diagnosis.details}
                                </td>
                                <td
                                  className="px-4 py-3"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {diagnosis.endDate || "—"}
                                </td>
                                <td
                                  className="px-4 py-3"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {diagnosis.preliminary ? (
                                    <span
                                      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
                                      style={{
                                        backgroundColor:
                                          "#FEF3C7",
                                        color: "#92400E",
                                      }}
                                    >
                                      Preliminary
                                    </span>
                                  ) : (
                                    <span className="text-[#6B7280]">
                                      —
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        const startParts =
                                          diagnosis.startDate.split(
                                            "/",
                                          );
                                        const formattedStartDate = `${startParts[2]}-${startParts[0].padStart(2, "0")}-${startParts[1].padStart(2, "0")}`;
                                        let formattedEndDate =
                                          "";
                                        if (diagnosis.endDate) {
                                          const endParts =
                                            diagnosis.endDate.split(
                                              "/",
                                            );
                                          formattedEndDate = `${endParts[2]}-${endParts[0].padStart(2, "0")}-${endParts[1].padStart(2, "0")}`;
                                        }
                                        setDiagnosisFormData({
                                          startDate:
                                            formattedStartDate,
                                          dsmVersion:
                                            diagnosis.dsmVersion,
                                          code: diagnosis.code,
                                          details:
                                            diagnosis.details,
                                          endDate:
                                            formattedEndDate,
                                          preliminary:
                                            diagnosis.preliminary,
                                        });
                                        setEditingDiagnosisId(
                                          diagnosis.id,
                                        );
                                        setDiagnosisActiveTab(
                                          "details",
                                        );
                                        setDiagnosisDialogOpen(
                                          true,
                                        );
                                      }}
                                      className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                      title="Modify"
                                    >
                                      <Pencil
                                        className="h-3.5 w-3.5"
                                        style={{
                                          color:
                                            "var(--slds-g-color-text-weak)",
                                        }}
                                      />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {activeHealthSection === "substance" && (
            <>
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
                {/* Horizontal Sub-tabs for Substance Use */}
                <div
                  className="flex overflow-x-auto overflow-y-hidden border-b"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <button
                    onClick={() =>
                      setActiveSubstanceUseSection("testing")
                    }
                    className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                      activeSubstanceUseSection === "testing"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:text-[#080707]"
                    }`}
                    style={
                      activeSubstanceUseSection === "testing"
                        ? {
                            borderBottom: "3px solid #145F33",
                            marginBottom: "-1px",
                          }
                        : {}
                    }
                  >
                    Testing
                  </button>
                  <button
                    onClick={() =>
                      setActiveSubstanceUseSection(
                        "disclosures",
                      )
                    }
                    className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                      activeSubstanceUseSection ===
                      "disclosures"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:text-[#080707]"
                    }`}
                    style={
                      activeSubstanceUseSection ===
                      "disclosures"
                        ? {
                            borderBottom: "3px solid #145F33",
                            marginBottom: "-1px",
                          }
                        : {}
                    }
                  >
                    Disclosures
                  </button>
                </div>

                {/* Sub-tab Content */}
                <div className="p-3 sm:p-6">
                  {/* Testing Tab */}
                  {activeSubstanceUseSection === "testing" && (
                    <div className="space-y-5">
                      {/* This youth's tests from the shared store (Program
                          individual + Bulk), above the legacy list. */}
                      {youthConstituentId !== null && (
                        <YouthSubstanceTestsSection
                          constituentId={youthConstituentId}
                        />
                      )}
                      {/* Substance Use Screening & Testing */}
                      <div
                        className="rounded-lg overflow-hidden"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
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
                          <div>
                            <h3 className="text-[13px] font-semibold text-[#080707]">
                              Substance Use Screening & Testing
                            </h3>
                            {/* These sample tests carry no constituent link
                                and appear on every profile; they are kept,
                                unchanged, and labeled — never reassigned. */}
                            {youthConstituentId !== null && (
                              <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                                Unlinked sample tests — not
                                associated with this youth.
                              </p>
                            )}
                          </div>
                          {/* On a Constituent Youth profile, new tests are
                              created in "Substance Tests for this youth"
                              (owned by a Program, 20065 AC3); this unlinked
                              legacy list keeps View / Edit only. Admissions
                              leads keep this Add unchanged. */}
                          {youthConstituentId === null && (
                            <Button
                              onClick={() => {
                                const now = new Date();
                                const currentDate = now
                                  .toISOString()
                                  .split("T")[0];
                                const currentTime = now
                                  .toTimeString()
                                  .slice(0, 5);
                                setSubstanceUseTestFormData({
                                  date: currentDate,
                                  time: currentTime,
                                  reason: "",
                                  otherReason: "",
                                });
                                setEditingSubstanceUseTestId(
                                  null,
                                );
                                setSubstanceUseTestDialogOpen(
                                  true,
                                );
                              }}
                              className="h-8 px-3 rounded-full text-[13px]"
                              style={{
                                backgroundColor: "#145F33",
                                color: "white",
                              }}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                        <div className="overflow-x-auto">
                          <table
                            className="w-full text-[13px]"
                            style={{
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-alt)",
                                }}
                              >
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                  onClick={() =>
                                    handleTestSort("dateTime")
                                  }
                                >
                                  <div className="flex items-center gap-1">
                                    Date/Time
                                    {testSortField ===
                                      "dateTime" &&
                                      (testSortDirection ===
                                      "asc" ? (
                                        <ArrowUp className="w-3 h-3" />
                                      ) : (
                                        <ArrowDown className="w-3 h-3" />
                                      ))}
                                  </div>
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                  onClick={() =>
                                    handleTestSort("reason")
                                  }
                                >
                                  <div className="flex items-center gap-1">
                                    Reason
                                    {testSortField ===
                                      "reason" &&
                                      (testSortDirection ===
                                      "asc" ? (
                                        <ArrowUp className="w-3 h-3" />
                                      ) : (
                                        <ArrowDown className="w-3 h-3" />
                                      ))}
                                  </div>
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                  onClick={() =>
                                    handleTestSort("newUse")
                                  }
                                >
                                  <div className="flex items-center gap-1">
                                    New Use
                                    {testSortField ===
                                      "newUse" &&
                                      (testSortDirection ===
                                      "asc" ? (
                                        <ArrowUp className="w-3 h-3" />
                                      ) : (
                                        <ArrowDown className="w-3 h-3" />
                                      ))}
                                  </div>
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                  onClick={() =>
                                    handleTestSort("results")
                                  }
                                >
                                  <div className="flex items-center gap-1">
                                    Results
                                    {testSortField ===
                                      "results" &&
                                      (testSortDirection ===
                                      "asc" ? (
                                        <ArrowUp className="w-3 h-3" />
                                      ) : (
                                        <ArrowDown className="w-3 h-3" />
                                      ))}
                                  </div>
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold w-24"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {getSortedTests().map(
                                (test, index) => {
                                  // Calculate results summary per requirements
                                  let resultsSummary = "";

                                  if (
                                    test.testDetails &&
                                    test.testDetails.length > 0
                                  ) {
                                    // Collect all test results from all test details
                                    const allResults: any[] =
                                      [];
                                    test.testDetails.forEach(
                                      (td: any) => {
                                        if (
                                          td.testResults &&
                                          td.testResults
                                            .length > 0
                                        ) {
                                          allResults.push(
                                            ...td.testResults,
                                          );
                                        }
                                      },
                                    );

                                    if (allResults.length > 0) {
                                      const positiveResults =
                                        allResults.filter(
                                          (r) =>
                                            r.result ===
                                            "Positive",
                                        );

                                      if (
                                        positiveResults.length >
                                        0
                                      ) {
                                        // Show only positive results with format: [Substance] ([Result]) - [Level] [Units]
                                        resultsSummary =
                                          positiveResults
                                            .map((r) => {
                                              const levelUnit =
                                                r.level &&
                                                r.units
                                                  ? ` - ${r.level} ${r.units}`
                                                  : "";
                                              return `${r.substance} (${r.result})${levelUnit}`;
                                            })
                                            .join("; ");
                                      } else {
                                        // All negative
                                        resultsSummary =
                                          "[All Negative]";
                                      }
                                    }
                                  } else if (
                                    test.substanceResults &&
                                    test.substanceResults
                                      .length > 0
                                  ) {
                                    const positiveResults =
                                      test.substanceResults.filter(
                                        (sr) =>
                                          sr.result ===
                                          "Positive",
                                      );

                                    if (
                                      positiveResults.length > 0
                                    ) {
                                      resultsSummary =
                                        positiveResults
                                          .map((sr) => {
                                            const levelUnit =
                                              sr.level &&
                                              sr.units
                                                ? ` - ${sr.level} ${sr.units}`
                                                : "";
                                            return `${sr.substance} (${sr.result})${levelUnit}`;
                                          })
                                          .join("; ");
                                    } else {
                                      resultsSummary =
                                        "[All Negative]";
                                    }
                                  }
                                  // If no results, leave empty (null display)

                                  return (
                                    <tr
                                      key={test.id}
                                      className="hover:bg-gray-50/50 transition-colors"
                                      style={{
                                        borderBottom:
                                          index <
                                          substanceUseTests.length -
                                            1
                                            ? "1px solid var(--slds-g-color-border-base-1)"
                                            : "none",
                                      }}
                                    >
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => {
                                            // Parse date/time and load test details
                                            const [
                                              datePart,
                                              timePart,
                                            ] =
                                              test.dateTime.split(
                                                ", ",
                                              );
                                            const dateParts =
                                              datePart.split(
                                                "/",
                                              );
                                            const formattedDate = `${dateParts[2]}-${dateParts[0].padStart(2, "0")}-${dateParts[1].padStart(2, "0")}`;

                                            const timeMatch =
                                              timePart.match(
                                                /(\d+):(\d+)\s*(AM|PM)/,
                                              );
                                            if (timeMatch) {
                                              let hours =
                                                parseInt(
                                                  timeMatch[1],
                                                );
                                              const minutes =
                                                timeMatch[2];
                                              const ampm =
                                                timeMatch[3];
                                              if (
                                                ampm === "PM" &&
                                                hours !== 12
                                              )
                                                hours += 12;
                                              if (
                                                ampm === "AM" &&
                                                hours === 12
                                              )
                                                hours = 0;
                                              const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes}`;

                                              setSubstanceUseTestFormData(
                                                {
                                                  date: formattedDate,
                                                  time: formattedTime,
                                                  reason:
                                                    test.reason,
                                                  otherReason:
                                                    "",
                                                },
                                              );
                                            }

                                            // Load existing test details
                                            setTestDetails(
                                              test.testDetails ||
                                                [],
                                            );
                                            setSubstanceResults(
                                              test.substanceResults ||
                                                [],
                                            );
                                            setTestAdditionalDetails(
                                              {
                                                newUse:
                                                  test.newUse ||
                                                  "Pending",
                                                suspectTampering:
                                                  test.suspectTampering ||
                                                  false,
                                                tamperingComments:
                                                  test.tamperingComments ||
                                                  "",
                                                labConsultation:
                                                  test.labConsultation ||
                                                  "",
                                                action:
                                                  test.action ||
                                                  "",
                                                refrigeratorDate:
                                                  test.refrigeratorDate ||
                                                  "",
                                                pickupDate:
                                                  test.pickupDate ||
                                                  "",
                                                discardDate:
                                                  test.discardDate ||
                                                  "",
                                                discardReason:
                                                  test.discardReason ||
                                                  "",
                                              },
                                            );

                                            setEditingSubstanceUseTestId(
                                              test.id,
                                            );
                                            setViewingTestId(
                                              test.id,
                                            );
                                            setTestDetailsDialogOpen(
                                              true,
                                            );
                                          }}
                                          className="text-[#145F33] hover:underline cursor-pointer font-medium text-left"
                                        >
                                          {test.dateTime}
                                        </button>
                                      </td>
                                      <td
                                        className="px-4 py-3"
                                        style={{
                                          color:
                                            "var(--slds-g-color-text-default)",
                                        }}
                                      >
                                        {test.reason}
                                      </td>
                                      <td
                                        className="px-4 py-3"
                                        style={{
                                          color:
                                            "var(--slds-g-color-text-default)",
                                        }}
                                      >
                                        {test.newUse}
                                      </td>
                                      <td
                                        className="px-4 py-3"
                                        style={{
                                          color:
                                            "var(--slds-g-color-text-default)",
                                        }}
                                      >
                                        {resultsSummary
                                          ? resultsSummary.length >
                                            100
                                            ? `${resultsSummary.substring(0, 100)}...`
                                            : resultsSummary
                                          : "—"}
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => {
                                              // Parse date/time
                                              const [
                                                datePart,
                                                timePart,
                                              ] =
                                                test.dateTime.split(
                                                  ", ",
                                                );
                                              const dateParts =
                                                datePart.split(
                                                  "/",
                                                );
                                              const formattedDate = `${dateParts[2]}-${dateParts[0].padStart(2, "0")}-${dateParts[1].padStart(2, "0")}`;

                                              const timeMatch =
                                                timePart.match(
                                                  /(\d+):(\d+)\s*(AM|PM)/,
                                                );
                                              if (timeMatch) {
                                                let hours =
                                                  parseInt(
                                                    timeMatch[1],
                                                  );
                                                const minutes =
                                                  timeMatch[2];
                                                const ampm =
                                                  timeMatch[3];
                                                if (
                                                  ampm ===
                                                    "PM" &&
                                                  hours !== 12
                                                )
                                                  hours += 12;
                                                if (
                                                  ampm ===
                                                    "AM" &&
                                                  hours === 12
                                                )
                                                  hours = 0;
                                                const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes}`;

                                                setSubstanceUseTestFormData(
                                                  {
                                                    date: formattedDate,
                                                    time: formattedTime,
                                                    reason:
                                                      test.reason,
                                                    otherReason:
                                                      "",
                                                  },
                                                );
                                              }
                                              setEditingSubstanceUseTestId(
                                                test.id,
                                              );
                                              setSubstanceUseTestDialogOpen(
                                                true,
                                              );
                                            }}
                                            className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                            title="Edit"
                                          >
                                            <Pencil className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                },
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Disclosures Tab */}
                  {activeSubstanceUseSection ===
                    "disclosures" && (
                    <div className="space-y-5">
                      <div
                        className="rounded-lg overflow-hidden"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
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
                            Substance Use Disclosures
                          </h3>
                          <Button
                            onClick={() => {
                              // Set default date and time to current
                              const now = new Date();
                              const currentDate = now
                                .toISOString()
                                .split("T")[0]; // YYYY-MM-DD
                              const currentTime = now
                                .toTimeString()
                                .slice(0, 5); // HH:MM
                              setDisclosureFormData({
                                date: currentDate,
                                time: currentTime,
                                relatedToTest: "No",
                                beforeAfterTest: "",
                                relatedTestSet: "",
                                reporter: "",
                                substances: [],
                                comments: "",
                              });
                              setEditingDisclosureId(null);
                              setDisclosureDialogOpen(true);
                            }}
                            className="h-8 px-3 rounded-full text-[13px]"
                            style={{
                              backgroundColor: "#145F33",
                              color: "white",
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Create New Disclosure
                          </Button>
                        </div>
                        <div className="overflow-x-auto">
                          <table
                            className="w-full text-[13px]"
                            style={{
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-alt)",
                                }}
                              >
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                  onClick={() =>
                                    handleDisclosureSort(
                                      "dateTime",
                                    )
                                  }
                                >
                                  <div className="flex items-center gap-1">
                                    Disclosure Date & Time
                                    {disclosureSortField ===
                                      "dateTime" &&
                                      (disclosureSortDirection ===
                                      "asc" ? (
                                        <ArrowUp className="w-3 h-3" />
                                      ) : (
                                        <ArrowDown className="w-3 h-3" />
                                      ))}
                                  </div>
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                  onClick={() =>
                                    handleDisclosureSort(
                                      "relatedToTest",
                                    )
                                  }
                                >
                                  <div className="flex items-center gap-1">
                                    Related to Test
                                    {disclosureSortField ===
                                      "relatedToTest" &&
                                      (disclosureSortDirection ===
                                      "asc" ? (
                                        <ArrowUp className="w-3 h-3" />
                                      ) : (
                                        <ArrowDown className="w-3 h-3" />
                                      ))}
                                  </div>
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                  onClick={() =>
                                    handleDisclosureSort(
                                      "substances",
                                    )
                                  }
                                >
                                  <div className="flex items-center gap-1">
                                    Substance(s)
                                    {disclosureSortField ===
                                      "substances" &&
                                      (disclosureSortDirection ===
                                      "asc" ? (
                                        <ArrowUp className="w-3 h-3" />
                                      ) : (
                                        <ArrowDown className="w-3 h-3" />
                                      ))}
                                  </div>
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                  onClick={() =>
                                    handleDisclosureSort(
                                      "comments",
                                    )
                                  }
                                >
                                  <div className="flex items-center gap-1">
                                    Comments
                                    {disclosureSortField ===
                                      "comments" &&
                                      (disclosureSortDirection ===
                                      "asc" ? (
                                        <ArrowUp className="w-3 h-3" />
                                      ) : (
                                        <ArrowDown className="w-3 h-3" />
                                      ))}
                                  </div>
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-[12px] font-semibold w-24"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {getSortedDisclosures().map(
                                (disclosure, index) => (
                                  <tr
                                    key={disclosure.id}
                                    className="hover:bg-gray-50/50 transition-colors"
                                    style={{
                                      borderBottom:
                                        index <
                                        substanceUseDisclosures.length -
                                          1
                                          ? "1px solid var(--slds-g-color-border-base-1)"
                                          : "none",
                                    }}
                                  >
                                    <td className="px-4 py-3 font-medium">
                                      <button
                                        onClick={() => {
                                          // Parse date back to YYYY-MM-DD format
                                          const dateParts =
                                            disclosure.date.split(
                                              "/",
                                            );
                                          const formattedDate = `${dateParts[2]}-${dateParts[0].padStart(2, "0")}-${dateParts[1].padStart(2, "0")}`;

                                          // Parse time from 12hr to 24hr format
                                          const timeMatch =
                                            disclosure.time.match(
                                              /(\d+):(\d+)\s*(AM|PM)/,
                                            );
                                          if (timeMatch) {
                                            let hours =
                                              parseInt(
                                                timeMatch[1],
                                              );
                                            const minutes =
                                              timeMatch[2];
                                            const ampm =
                                              timeMatch[3];
                                            if (
                                              ampm === "PM" &&
                                              hours !== 12
                                            )
                                              hours += 12;
                                            if (
                                              ampm === "AM" &&
                                              hours === 12
                                            )
                                              hours = 0;
                                            const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes}`;

                                            // Convert substances string back to array
                                            const substancesArray =
                                              disclosure.substances
                                                .split(", ")
                                                .map((s) =>
                                                  s.trim(),
                                                );

                                            setDisclosureFormData(
                                              {
                                                date: formattedDate,
                                                time: formattedTime,
                                                relatedToTest:
                                                  disclosure.relatedToTest,
                                                beforeAfterTest:
                                                  disclosure.beforeAfterTest,
                                                relatedTestSet:
                                                  disclosure.relatedTestSet,
                                                reporter:
                                                  disclosure.reporter,
                                                substances:
                                                  substancesArray,
                                                comments:
                                                  disclosure.comments,
                                              },
                                            );
                                          }
                                          setEditingDisclosureId(
                                            disclosure.id,
                                          );
                                          setDisclosureDialogOpen(
                                            true,
                                          );
                                        }}
                                        className="text-[#145F33] hover:underline cursor-pointer text-left"
                                      >
                                        {disclosure.date} at{" "}
                                        {disclosure.time}
                                      </button>
                                    </td>
                                    <td
                                      className="px-4 py-3"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {disclosure.relatedToTest ===
                                        "Yes" &&
                                      disclosure.relatedTestSet ? (
                                        <button
                                          onClick={() =>
                                            toast.info(
                                              `Opening test record: ${disclosure.relatedTestSet}`,
                                            )
                                          }
                                          className="text-[#145F33] hover:underline cursor-pointer"
                                        >
                                          {
                                            disclosure.relatedTestSet
                                          }
                                        </button>
                                      ) : (
                                        <span>No</span>
                                      )}
                                    </td>
                                    <td
                                      className="px-4 py-3"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {disclosure.substances}
                                    </td>
                                    <td
                                      className="px-4 py-3"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {disclosure.comments
                                        .length > 80
                                        ? `${disclosure.comments.substring(0, 80)}...`
                                        : disclosure.comments}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => {
                                            // Parse date back to YYYY-MM-DD format
                                            const dateParts =
                                              disclosure.date.split(
                                                "/",
                                              );
                                            const formattedDate = `${dateParts[2]}-${dateParts[0].padStart(2, "0")}-${dateParts[1].padStart(2, "0")}`;

                                            // Parse time from 12hr to 24hr format
                                            const timeMatch =
                                              disclosure.time.match(
                                                /(\d+):(\d+)\s*(AM|PM)/,
                                              );
                                            if (timeMatch) {
                                              let hours =
                                                parseInt(
                                                  timeMatch[1],
                                                );
                                              const minutes =
                                                timeMatch[2];
                                              const ampm =
                                                timeMatch[3];
                                              if (
                                                ampm === "PM" &&
                                                hours !== 12
                                              )
                                                hours += 12;
                                              if (
                                                ampm === "AM" &&
                                                hours === 12
                                              )
                                                hours = 0;
                                              const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes}`;

                                              // Convert substances string back to array
                                              const substancesArray =
                                                disclosure.substances
                                                  .split(", ")
                                                  .map((s) =>
                                                    s.trim(),
                                                  );

                                              setDisclosureFormData(
                                                {
                                                  date: formattedDate,
                                                  time: formattedTime,
                                                  relatedToTest:
                                                    disclosure.relatedToTest,
                                                  beforeAfterTest:
                                                    disclosure.beforeAfterTest,
                                                  relatedTestSet:
                                                    disclosure.relatedTestSet,
                                                  reporter:
                                                    disclosure.reporter,
                                                  substances:
                                                    substancesArray,
                                                  comments:
                                                    disclosure.comments,
                                                },
                                              );
                                            }
                                            setEditingDisclosureId(
                                              disclosure.id,
                                            );
                                            setDisclosureDialogOpen(
                                              true,
                                            );
                                          }}
                                          className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                          title="Edit"
                                        >
                                          <Pencil
                                            className="h-3.5 w-3.5"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-weak)",
                                            }}
                                          />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}