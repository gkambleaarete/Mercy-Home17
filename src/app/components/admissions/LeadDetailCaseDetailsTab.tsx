import { useState, useMemo, useEffect, useRef } from "react";
import { DocumentsChecklistPanel } from "./DocumentsChecklistPanel";
import { YouthAlertIcons } from "../youth/YouthAlertIcons";
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
  Search,
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
import { ROITrackingSection } from "./ROITrackingSection";
import {
  ActivityTimeline,
  TimelineActivity,
} from "../ActivityTimeline";
import { CaseyLifeSkillsCaregiverFields } from "./CaseyLifeSkillsCaregiverFields";
import { CaseyLifeSkillsYouthFields } from "./CaseyLifeSkillsYouthFields";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface LeadDetailCaseDetailsTabProps {
  activeTab: any;
  allergiesConditions: any;
  caseInfoFormData: any;
  dietaryNeedsFormatted: any;
  handleAddReleaseSent: any;
  handleDeleteReleaseSent: any;
  handleEditReleaseSent: any;
  handleStepNameClick: any;
  onScheduleConnection?: (stepName: string) => void;
  isAdmissionsFinalized: any;
  physicalHealthConditions: any;
  processSteps: any;
  processStepsData: any;
  releasesSent: any;
  setActiveOverviewSection: any;
  setCaseInfoFormData: any;
  setProcessStepsData: any;
}

export function LeadDetailCaseDetailsTab({
  activeTab,
  allergiesConditions,
  caseInfoFormData,
  dietaryNeedsFormatted,
  handleAddReleaseSent,
  handleDeleteReleaseSent,
  handleEditReleaseSent,
  handleStepNameClick,
  onScheduleConnection,
  isAdmissionsFinalized,
  physicalHealthConditions,
  processSteps,
  processStepsData,
  releasesSent,
  setActiveOverviewSection,
  setCaseInfoFormData,
  setProcessStepsData,
}: LeadDetailCaseDetailsTabProps) {
  const [caseSubTab, setCaseSubTab] = useState<
    "caseInfo" | "documentsChecklist"
  >("caseInfo");

  // Case Information — school lookup state
  const [caseSchoolSearch, setCaseSchoolSearch] = useState("");
  const [caseSchoolDropdownOpen, setCaseSchoolDropdownOpen] =
    useState(false);
  const [caseShowNewSchoolModal, setCaseShowNewSchoolModal] =
    useState(false);
  const [caseNewSchoolData, setCaseNewSchoolData] = useState({
    name: "",
    schoolType: "",
    schoolLevel: "",
    street: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "--None--",
    zipCode: "",
    zipPlus4: "",
    neighborhood: "",
    type: "",
    status: "",
    isPrimaryAddress: false,
    phoneNumber: "",
  });
  const [caseSchoolAccounts, setCaseSchoolAccounts] = useState([
    {
      id: "1",
      name: "Lincoln Elementary",
      type: "Public",
      level: "Elementary School",
    },
    {
      id: "2",
      name: "Washington Middle School",
      type: "Public",
      level: "Middle School",
    },
    {
      id: "3",
      name: "Roosevelt High School",
      type: "Public",
      level: "High School",
    },
    {
      id: "4",
      name: "Jefferson Academy",
      type: "Charter",
      level: "K-12",
    },
    {
      id: "5",
      name: "St. Mary's School",
      type: "Private",
      level: "K-12",
    },
    {
      id: "6",
      name: "Holy Cross Academy",
      type: "Private",
      level: "High School",
    },
    {
      id: "7",
      name: "Chicago Public School #42",
      type: "Public",
      level: "Elementary School",
    },
    {
      id: "8",
      name: "Simeon Career Academy",
      type: "Public",
      level: "High School",
    },
    {
      id: "9",
      name: "De La Salle Institute",
      type: "Private",
      level: "High School",
    },
    {
      id: "10",
      name: "Morgan Park High School",
      type: "Public",
      level: "High School",
    },
  ]);

  return (
    <>
      {activeTab === "caseDetails" && (
        <div className="bg-white space-y-4 w-full pb-8">
          {/* Sub-tab bar */}
          <div
            className="app-scroll-strip w-full"
            style={{
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            {(["caseInfo", "documentsChecklist"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setCaseSubTab(tab)}
                  className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                    caseSubTab === tab
                      ? "text-[#145F33]"
                      : "text-[#706e6b] hover:text-[#080707]"
                  }`}
                >
                  {tab === "caseInfo"
                    ? "Case Information"
                    : "Documents Checklist"}
                  {caseSubTab === tab && (
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
              ),
            )}
          </div>

          {/* Documents Checklist tab */}
          {caseSubTab === "documentsChecklist" && (
            <DocumentsChecklistPanel />
          )}

          {/* Case Information tab */}
          {caseSubTab === "caseInfo" && (
            <>
              <div className="space-y-6 w-full px-4">
                {/* Case Information Card */}
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
                    className="px-4 py-3"
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <h3 className="text-[13px] font-semibold text-[#080707]">
                      Case Information
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Case Manager & Guardians - Side by Side */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Case Manager */}
                      <div>
                        <Label
                          htmlFor="case-manager"
                          className="block text-[11px] font-medium mb-1.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          CASE MANAGER
                        </Label>
                        <Input
                          id="case-manager"
                          value={caseInfoFormData.caseManager}
                          readOnly
                          className="h-9 text-[13px] rounded bg-[#f3f2f2] cursor-not-allowed"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-4)",
                          }}
                        />
                      </div>

                      {/* Guardians */}
                      <div>
                        <Label
                          htmlFor="guardians"
                          className="block text-[11px] font-medium mb-1.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          GUARDIANS
                        </Label>
                        <Input
                          id="guardians"
                          value={caseInfoFormData.guardians}
                          readOnly
                          className="h-9 text-[13px] rounded bg-[#f3f2f2] cursor-not-allowed"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-4)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Medical & Health Conditions - Grouped */}
                    <div
                      className="p-4 rounded-lg space-y-3"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <h4
                        className="text-[11px] font-semibold uppercase tracking-wide"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Medical & Health Conditions
                      </h4>

                      {/* Physical Health Conditions */}
                      <div>
                        <Label
                          htmlFor="physical-health-conditions"
                          className="block text-[11px] font-medium mb-1.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          PHYSICAL HEALTH CONDITIONS
                        </Label>
                        <Textarea
                          id="physical-health-conditions"
                          value={physicalHealthConditions}
                          readOnly
                          className="text-[13px] rounded bg-[#f3f2f2] cursor-not-allowed resize-none min-h-[60px]"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-4)",
                          }}
                        />
                      </div>

                      {/* Allergies */}
                      <div>
                        <Label
                          htmlFor="allergies-conditions"
                          className="block text-[11px] font-medium mb-1.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          ALLERGIES
                        </Label>
                        <Textarea
                          id="allergies-conditions"
                          value={allergiesConditions}
                          readOnly
                          className="text-[13px] rounded bg-[#f3f2f2] cursor-not-allowed resize-none min-h-[60px]"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-4)",
                          }}
                        />
                      </div>

                      {/* Dietary Needs */}
                      <div>
                        <Label
                          htmlFor="dietary-needs-conditions"
                          className="block text-[11px] font-medium mb-1.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          DIETARY NEEDS
                        </Label>
                        <Textarea
                          id="dietary-needs-conditions"
                          value={dietaryNeedsFormatted}
                          readOnly
                          className="text-[13px] rounded bg-[#f3f2f2] cursor-not-allowed resize-none min-h-[60px]"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-4)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <Label
                        htmlFor="category"
                        className="block text-[11px] font-medium mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        CATEGORY
                      </Label>
                      <Select
                        value={caseInfoFormData.category}
                        onValueChange={(value) =>
                          setCaseInfoFormData({
                            ...caseInfoFormData,
                            category: value,
                          })
                        }
                      >
                        <SelectTrigger
                          id="category"
                          className="h-9 text-[13px] rounded"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Closing">
                            Closing
                          </SelectItem>
                          <SelectItem value="Info Session Waitlist">
                            Info Session Waitlist
                          </SelectItem>
                          <SelectItem value="Program Waitlist">
                            Program Waitlist
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Current/Intended School */}
                    <div className="space-y-2">
                      <Label
                        className="block text-[11px] font-medium"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        CURRENT/INTENDED SCHOOL
                      </Label>

                      <div className="flex items-center gap-2">
                        {/* School Lookup */}
                        <div
                          id="case-school-search-container"
                          className="relative w-[42%] min-w-0"
                        >
                          {caseInfoFormData.currentIntendedSchool ? (
                            <div
                              className="h-9 px-3 rounded flex items-center justify-between text-[13px]"
                              style={{
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              <span className="truncate">
                                {
                                  caseInfoFormData.currentIntendedSchool
                                }
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setCaseInfoFormData({
                                    ...caseInfoFormData,
                                    currentIntendedSchool: "",
                                  })
                                }
                                className="ml-2 flex-shrink-0 hover:bg-gray-200 rounded p-0.5"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                <XIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="relative">
                                <Search
                                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                />
                                <Input
                                  type="text"
                                  placeholder="Search / School Lookup"
                                  value={caseSchoolSearch}
                                  onChange={(e) => {
                                    setCaseSchoolSearch(
                                      e.target.value,
                                    );
                                    setCaseSchoolDropdownOpen(
                                      true,
                                    );
                                  }}
                                  onFocus={() =>
                                    setCaseSchoolDropdownOpen(
                                      true,
                                    )
                                  }
                                  onBlur={() =>
                                    setTimeout(
                                      () =>
                                        setCaseSchoolDropdownOpen(
                                          false,
                                        ),
                                      150,
                                    )
                                  }
                                  className="h-9 text-[13px] pl-8 rounded"
                                  style={{
                                    border:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                    backgroundColor:
                                      "var(--slds-g-color-background-base)",
                                  }}
                                />
                              </div>

                              {caseSchoolDropdownOpen && (
                                <div
                                  className="absolute z-50 w-full mt-1 rounded shadow-lg"
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-base)",
                                    border:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                  }}
                                >
                                  {caseSchoolAccounts
                                    .filter((s) =>
                                      s.name
                                        .toLowerCase()
                                        .includes(
                                          caseSchoolSearch.toLowerCase(),
                                        ),
                                    )
                                    .map((s) => (
                                      <button
                                        type="button"
                                        key={s.id}
                                        onMouseDown={(e) =>
                                          e.preventDefault()
                                        }
                                        onClick={() => {
                                          setCaseInfoFormData({
                                            ...caseInfoFormData,
                                            currentIntendedSchool:
                                              s.name,
                                          });
                                          setCaseSchoolSearch(
                                            "",
                                          );
                                          setCaseSchoolDropdownOpen(
                                            false,
                                          );
                                        }}
                                        className="w-full px-3 py-2 text-left text-[13px] hover:bg-gray-100"
                                      >
                                        <div
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-default)",
                                            fontWeight: 500,
                                          }}
                                        >
                                          {s.name}
                                        </div>
                                        <div
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-weak)",
                                            fontSize: "12px",
                                          }}
                                        >
                                          {s.type} • {s.level}
                                        </div>
                                      </button>
                                    ))}

                                  {caseSchoolAccounts.filter(
                                    (s) =>
                                      s.name
                                        .toLowerCase()
                                        .includes(
                                          caseSchoolSearch.toLowerCase(),
                                        ),
                                  ).length === 0 && (
                                    <div
                                      className="px-3 py-3 text-[13px]"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      No schools found.
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* + New School button */}
                        <button
                          type="button"
                          onClick={() =>
                            setCaseShowNewSchoolModal(true)
                          }
                          className="h-9 px-3 rounded-full flex items-center gap-1 text-[13px] font-medium whitespace-nowrap flex-shrink-0 hover:opacity-90 transition-opacity"
                          style={{
                            backgroundColor: "#145F33",
                            color: "white",
                          }}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          New School
                        </button>

                        {/* Grade */}
                        <div className="flex-1 min-w-0">
                          <Select
                            value={caseInfoFormData.grade}
                            onValueChange={(value) =>
                              setCaseInfoFormData({
                                ...caseInfoFormData,
                                grade: value,
                              })
                            }
                          >
                            <SelectTrigger
                              className="h-9 text-[13px] rounded"
                              style={{
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                              }}
                            >
                              <SelectValue placeholder="Select Grade" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="Kindergarden">
                                Kindergarden
                              </SelectItem>
                              <SelectItem value="Grade 1">
                                Grade 1
                              </SelectItem>
                              <SelectItem value="Grade 2">
                                Grade 2
                              </SelectItem>
                              <SelectItem value="Grade 3">
                                Grade 3
                              </SelectItem>
                              <SelectItem value="Grade 4">
                                Grade 4
                              </SelectItem>
                              <SelectItem value="Grade 5">
                                Grade 5
                              </SelectItem>
                              <SelectItem value="Grade 6">
                                Grade 6
                              </SelectItem>
                              <SelectItem value="Grade 7">
                                Grade 7
                              </SelectItem>
                              <SelectItem value="Grade 8">
                                Grade 8
                              </SelectItem>
                              <SelectItem value="Grade 9">
                                Grade 9
                              </SelectItem>
                              <SelectItem value="Grade 10">
                                Grade 10
                              </SelectItem>
                              <SelectItem value="Grade 11">
                                Grade 11
                              </SelectItem>
                              <SelectItem value="Grade 12">
                                Grade 12
                              </SelectItem>
                              <SelectItem value="Post Secondary">
                                Post Secondary
                              </SelectItem>
                              <SelectItem value="Grade 13">
                                Grade 13
                              </SelectItem>
                              <SelectItem value="Grade 14">
                                Grade 14
                              </SelectItem>
                              <SelectItem value="Grade 15">
                                Grade 15
                              </SelectItem>
                              <SelectItem value="Grade 16">
                                Grade 16
                              </SelectItem>
                              <SelectItem value="Grade 17">
                                Grade 17 (graduate/advanced
                                degree)
                              </SelectItem>
                              <SelectItem value="Grade 18">
                                Grade 18 (graduate/advanced
                                degree)
                              </SelectItem>
                              <SelectItem value="Grade 19">
                                Grade 19 (graduate/advanced
                                degree)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* IEP/504 Plan */}
                    <div>
                      <Label
                        htmlFor="iep-504-plan"
                        className="block text-[11px] font-medium mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        YOUTH HAS BEEN OR IS ON IEP, 504 OR
                        OTHER?
                      </Label>
                      <Select
                        value={caseInfoFormData.iep504Plan}
                        onValueChange={(value) =>
                          setCaseInfoFormData({
                            ...caseInfoFormData,
                            iep504Plan: value,
                          })
                        }
                      >
                        <SelectTrigger
                          id="iep-504-plan"
                          className="h-9 text-[13px] rounded"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        >
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">
                            Yes
                          </SelectItem>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="Unknown">
                            Unknown
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Anticipated Program / Anticipated Move-In Date */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Anticipated Program */}
                      <div>
                        <Label
                          htmlFor="intended-program"
                          className="block text-[11px] font-medium mb-1.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          ANTICIPATED PROGRAM
                        </Label>
                        <Select
                          value={
                            caseInfoFormData.intendedProgram
                          }
                          onValueChange={(value) =>
                            setCaseInfoFormData({
                              ...caseInfoFormData,
                              intendedProgram: value,
                            })
                          }
                        >
                          <SelectTrigger
                            id="intended-program"
                            className="h-9 text-[13px] rounded"
                            style={{
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                            }}
                          >
                            <SelectValue placeholder="Select anticipated program" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A Program #2">
                              A Program #2
                            </SelectItem>
                            <SelectItem value="Bernardin">
                              Bernardin
                            </SelectItem>
                            <SelectItem value="Bosco">
                              Bosco
                            </SelectItem>
                            <SelectItem value="Campbell">
                              Campbell
                            </SelectItem>
                            <SelectItem value="Cooke">
                              Cooke
                            </SelectItem>
                            <SelectItem value="Couderc">
                              Couderc
                            </SelectItem>
                            <SelectItem value="Daley">
                              Daley
                            </SelectItem>
                            <SelectItem value="Kelly">
                              Kelly
                            </SelectItem>
                            <SelectItem value="Mahoney">
                              Mahoney
                            </SelectItem>
                            <SelectItem value="Noha">
                              Noha
                            </SelectItem>
                            <SelectItem value="Other">
                              Other
                            </SelectItem>
                            <SelectItem value="Quille">
                              Quille
                            </SelectItem>
                            <SelectItem value="Self-Awareness">
                              Self-Awareness
                            </SelectItem>
                            <SelectItem value="Seton">
                              Seton
                            </SelectItem>
                            <SelectItem value="Shell">
                              Shell
                            </SelectItem>
                            <SelectItem value="Speh">
                              Speh
                            </SelectItem>
                            <SelectItem value="Walgreen">
                              Walgreen
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Anticipated Move-In Date */}
                      <div>
                        <Label
                          htmlFor="anticipated-movein-date"
                          className="block text-[11px] font-medium mb-1.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          ANTICIPATED MOVE-IN DATE
                        </Label>
                        <DateInput
                          id="anticipated-movein-date"
                          value={isoToMdy(
                            caseInfoFormData.anticipatedMoveInDate ||
                              "",
                          )}
                          onChange={(v) =>
                            setCaseInfoFormData({
                              ...caseInfoFormData,
                              anticipatedMoveInDate:
                                mdyToIso(v),
                            })
                          }
                          className="h-9 w-full slds-text-4 rounded"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Is a CADC evaluation needed? */}
                    {/*<div>
                      <Label
                        htmlFor="cadc-evaluation-needed"
                        className="block text-[11px] font-medium mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        IS A CADC EVALUATION NEEDED?
                      </Label>
                      <Select
                        value={
                          caseInfoFormData.cadcEvaluationNeeded ||
                          ""
                        }
                        onValueChange={(value) =>
                          setCaseInfoFormData({
                            ...caseInfoFormData,
                            cadcEvaluationNeeded: value,
                            substanceUseAssessmentComplete:
                              value === "Yes"
                                ? caseInfoFormData.substanceUseAssessmentComplete
                                : "",
                          })
                        }
                      >
                        <SelectTrigger
                          id="cadc-evaluation-needed"
                          className="h-9 text-[13px] rounded"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        >
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">
                            Yes
                          </SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>*/}

                    {/* Substance Use Assessment complete? - Conditional Field 1 */}
                    {caseInfoFormData.cadcEvaluationNeeded ===
                      "Yes" && (
                      <div>
                        <Label
                          htmlFor="substance-use-assessment-complete"
                          className="block text-[11px] font-medium mb-1.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          SUBSTANCE USE ASSESSMENT COMPLETE?
                        </Label>
                        <Select
                          value={
                            caseInfoFormData.substanceUseAssessmentComplete ||
                            ""
                          }
                          onValueChange={(value) =>
                            setCaseInfoFormData({
                              ...caseInfoFormData,
                              substanceUseAssessmentComplete:
                                value,
                            })
                          }
                        >
                          <SelectTrigger
                            id="substance-use-assessment-complete"
                            className="h-9 text-[13px] rounded"
                            style={{
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                            }}
                          >
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">
                              Yes
                            </SelectItem>
                            <SelectItem value="No">
                              No
                            </SelectItem>
                            <SelectItem value="Unknown">
                              Unknown
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Dynamic Connection Validation - Conditional Field 2 */}
                    {caseInfoFormData.cadcEvaluationNeeded ===
                      "Yes" &&
                      caseInfoFormData.substanceUseAssessmentComplete ===
                        "Yes" &&
                      (() => {
                        // Mock Connection records - In production, this would be fetched from database
                        const mockConnections = [
                          {
                            id: "conn-001",
                            name: "Integrated Substance Use Assessment",
                            attendance: "Yes",
                            date: "11/15/2024",
                            type: "Assessment",
                          },
                          {
                            id: "conn-002",
                            name: "Family Therapy Session",
                            attendance: "No",
                            date: "11/10/2024",
                            type: "Therapy",
                          },
                        ];

                        // Search for matching Connection record
                        const matchingConnection =
                          mockConnections.find(
                            (conn) =>
                              conn.name ===
                                "Integrated Substance Use Assessment" &&
                              conn.attendance === "Yes",
                          );

                        return (
                          <div
                            className="p-3 rounded-lg"
                            style={{
                              backgroundColor:
                                matchingConnection
                                  ? "#e6f4ea"
                                  : "#fef3c7",
                              border: `1px solid ${matchingConnection ? "#34a853" : "#f5d87a"}`,
                            }}
                          >
                            <Label
                              className="block text-[11px] font-medium mb-1.5 uppercase"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              CONNECTION VALIDATION
                            </Label>
                            {matchingConnection ? (
                              // Scenario A: Record Found with Attendance = Yes
                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <Check
                                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                                    style={{ color: "#34a853" }}
                                  />
                                  <div className="flex-1">
                                    <button
                                      onClick={() => {
                                        setActiveOverviewSection(
                                          "connections",
                                        );
                                        toast.info(
                                          `Opening Connection: ${matchingConnection.name}`,
                                        );
                                      }}
                                      className="text-[13px] font-medium text-[#145F33] hover:underline text-left"
                                    >
                                      {matchingConnection.name}
                                    </button>
                                    <p
                                      className="text-[12px] mt-1"
                                      style={{
                                        color: "#1e7e34",
                                      }}
                                    >
                                      Substance Use Assessment
                                      completed.
                                    </p>
                                    <p
                                      className="text-[11px] mt-1"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      Date:{" "}
                                      {matchingConnection.date}{" "}
                                      • Attendance:{" "}
                                      {
                                        matchingConnection.attendance
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // Scenario B & C: Record not found or Attendance = No
                              <div className="flex items-start gap-2">
                                <AlertTriangle
                                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                                  style={{ color: "#856404" }}
                                />
                                <div className="flex-1">
                                  <p
                                    className="text-[13px] font-medium"
                                    style={{ color: "#856404" }}
                                  >
                                    Substance Use Assessment not
                                    found or completed.
                                  </p>
                                  <p
                                    className="text-[12px] mt-1"
                                    style={{ color: "#856404" }}
                                  >
                                    Please ensure a Connection
                                    record exists with:
                                  </p>
                                  <ul
                                    className="text-[11px] mt-1 ml-4 list-disc space-y-0.5"
                                    style={{ color: "#856404" }}
                                  >
                                    <li>
                                      Connection Name:
                                      "Integrated Substance Use
                                      Assessment"
                                    </li>
                                    <li>Attendance: "Yes"</li>
                                  </ul>
                                  <button
                                    onClick={() => {
                                      setActiveOverviewSection(
                                        "connections",
                                      );
                                      toast.info(
                                        "Navigate to Connections tab to add or update the record",
                                      );
                                    }}
                                    className="mt-2 text-[12px] text-[#145F33] hover:underline font-medium"
                                  >
                                    Go to Connections →
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                  </div>
                </div>

                {/* Documentation Releases Sent Table */}
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
                    className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <h3 className="text-[13px] font-semibold text-[#080707]">
                      Documentation Releases Sent (
                      {releasesSent.length})
                    </h3>
                    <Button
                      size="sm"
                      onClick={handleAddReleaseSent}
                      className="h-7 text-[11px] rounded-full bg-[#145F33] hover:bg-[#0f4a26] text-white w-full sm:w-auto"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[500px]">
                        <thead>
                          <tr
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <th
                              className="text-left py-2 px-3 text-[11px] font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              Release Type
                            </th>
                            <th
                              className="text-left py-2 px-3 text-[11px] font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              Date
                            </th>
                            <th
                              className="text-left py-2 px-3 text-[11px] font-semibold w-20"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {releasesSent.length === 0 ? (
                            <tr>
                              <td
                                colSpan={3}
                                className="py-6 text-center text-[13px]"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                No releases sent yet
                              </td>
                            </tr>
                          ) : (
                            releasesSent.map(
                              (release, index) => (
                                <tr
                                  key={release.id}
                                  style={{
                                    borderBottom:
                                      index <
                                      releasesSent.length - 1
                                        ? "1px solid var(--slds-g-color-border-base-1)"
                                        : "none",
                                  }}
                                >
                                  <td className="py-3 px-3 text-[13px] text-[#080707]">
                                    {release.releaseType}
                                  </td>
                                  <td className="py-3 px-3 text-[13px] text-[#080707]">
                                    {release.date}
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() =>
                                          handleEditReleaseSent(
                                            release,
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
                                          handleDeleteReleaseSent(
                                            release.id,
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
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* ROI Tracking Section */}
                <ROITrackingSection />

                {/* Process Steps */}
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
                      Process Steps
                    </h3>
                    {isAdmissionsFinalized && (
                      <Badge className="bg-gray-100 text-gray-700 border-gray-300 text-[11px] font-semibold px-2 py-0.5 h-5">
                        Finalized - Read Only
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Process Steps Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <th
                              className="text-left py-2 px-3 text-[11px] font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              STEP #
                            </th>
                            <th
                              className="text-left py-2 px-3 text-[11px] font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              STEP NAME
                            </th>
                            <th
                              className="text-left py-2 px-3 text-[11px] font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              DATE
                            </th>
                            <th
                              className="text-left py-2 px-3 text-[11px] font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              DAYS SINCE PREVIOUS STEP
                            </th>
                            <th
                              className="text-left py-2 px-3 text-[11px] font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              STATUS
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {processSteps.map((step, index) => (
                            <tr
                              key={step.id}
                              style={{
                                borderBottom:
                                  index <
                                  processSteps.length - 1
                                    ? "1px solid var(--slds-g-color-border-base-1)"
                                    : "none",
                              }}
                            >
                              <td className="py-3 px-3 text-[13px] text-[#080707]">
                                {step.stepNumber}
                              </td>
                              <td className="py-3 px-3 text-[13px]">
                                {/* AC6: Referral has no hyperlink. AC7: Other steps have hyperlinks to source records */}
                                {step.stepName === "Referral" ||
                                !step.recordId ||
                                !step.date ? (
                                  <span className="text-[13px] text-[#080707]">
                                    {step.stepName}
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStepNameClick(
                                        step.stepName,
                                        step.recordId,
                                      )
                                    }
                                    className="text-[13px] hover:underline cursor-pointer bg-transparent border-none p-0 m-0 text-left font-medium"
                                    style={{ color: "#145F33" }}
                                    title={`View ${step.stepName} record`}
                                  >
                                    {step.stepName}
                                  </button>
                                )}
                              </td>
                              <td className="py-3 px-3 text-[13px] text-[#080707]">
                                {step.date || "—"}
                              </td>
                              <td
                                className="py-3 px-3 text-[13px]"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {/* AC8-AC10: Calculate days between current and previous step */}
                                {step.stepName === "Referral"
                                  ? "N/A"
                                  : !step.date ||
                                      step.daysSincePrevious ===
                                        "N/A"
                                    ? "N/A"
                                    : `${step.daysSincePrevious} days`}
                              </td>
                              <td className="py-3 px-3">
                                {step.scheduleStatus === "—" ? (
                                  <span
                                    className="text-[13px]"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    —
                                  </span>
                                ) : step.scheduleStatus ===
                                  "Attended" ? (
                                  <span
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                    style={{
                                      backgroundColor:
                                        "#d4edda",
                                      color: "#155724",
                                    }}
                                  >
                                    Attended
                                  </span>
                                ) : step.scheduleStatus ===
                                  "Scheduled" ? (
                                  <span
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                    style={{
                                      backgroundColor:
                                        "var(--slds-g-color-neutral-95)",
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    Scheduled
                                  </span>
                                ) : step.scheduleStatus ===
                                  "Schedule Connection" ? (
                                  <button
                                    type="button"
                                    className="h-7 px-3 rounded-full text-[12px] font-medium text-white shadow-none"
                                    style={{
                                      backgroundColor:
                                        "#145F33",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "#0e4524";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "#145F33";
                                    }}
                                    onClick={() =>
                                      onScheduleConnection &&
                                      onScheduleConnection(
                                        step.stepName,
                                      )
                                    }
                                  >
                                    Schedule Connection
                                  </button>
                                ) : (
                                  <span
                                    className="text-[13px]"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    —
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Additional Fields */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      {/* Days Since Referral - Read Only */}
                      <div>
                        <Label
                          htmlFor="days-since-referral"
                          className="block text-[11px] font-medium mb-1.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          DAYS SINCE REFERRAL
                        </Label>
                        <Input
                          id="days-since-referral"
                          value={(() => {
                            const referralDate =
                              processSteps.find(
                                (s) =>
                                  s.stepName === "Referral",
                              )?.date;
                            if (!referralDate) return "—";
                            const today = new Date();
                            const refDate = new Date(
                              referralDate,
                            );
                            const diffTime = Math.abs(
                              today.getTime() -
                                refDate.getTime(),
                            );
                            const diffDays = Math.ceil(
                              diffTime / (1000 * 60 * 60 * 24),
                            );
                            return diffDays.toString();
                          })()}
                          readOnly
                          className="h-9 text-[13px] rounded bg-[#f3f2f2] cursor-not-allowed"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-4)",
                          }}
                        />
                      </div>

                      {/* Last Contact Date */}
                      <div>
                        <Label
                          htmlFor="last-contact-date"
                          className="block text-[11px] font-medium mb-1.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          LAST CONTACT DATE
                        </Label>
                        <DateInput
                          id="last-contact-date"
                          value={isoToMdy(
                            processStepsData.lastContactDate,
                          )}
                          onChange={() => {}}
                          disabled
                          className="h-9 text-[13px] rounded bg-[#f3f2f2] cursor-not-allowed"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Total Info Session No Shows - Read Only */}
                    <div>
                      <Label
                        htmlFor="total-info-session-no-shows"
                        className="block text-[11px] font-medium mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        TOTAL INFO SESSION NO SHOWS
                      </Label>
                      <Input
                        id="total-info-session-no-shows"
                        value={(() => {
                          // Mock data: Count of Interaction Summary records where Type = "Info Session" AND Attended = "No"
                          // In production, this would query actual Interaction Summary records
                          const mockInteractionSummaries = [
                            {
                              type: "Info Session",
                              attended: "No",
                              date: "2024-01-15",
                            },
                            {
                              type: "Info Session",
                              attended: "Yes",
                              date: "2024-01-22",
                            },
                            {
                              type: "Info Session",
                              attended: "No",
                              date: "2024-02-05",
                            },
                            {
                              type: "Clinical Assessment",
                              attended: "No",
                              date: "2024-02-10",
                            },
                            {
                              type: "Info Session",
                              attended: "Not Completed",
                              date: "2024-02-20",
                            },
                          ];

                          const noShowCount =
                            mockInteractionSummaries.filter(
                              (record) =>
                                record.type ===
                                  "Info Session" &&
                                (record.attended === "No" ||
                                  record.attended ===
                                    "Not Completed"),
                            ).length;

                          return noShowCount.toString();
                        })()}
                        readOnly
                        className="h-9 text-[13px] rounded bg-[#f3f2f2] cursor-not-allowed"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-4)",
                        }}
                      />
                    </div>

                    {/* Is a CADC Evaluation Needed? */}
                    <div>
                      <Label
                        htmlFor="cadc-evaluation"
                        className="block text-[11px] font-medium mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        IS A CADC EVALUATION NEEDED?
                      </Label>
                      <Select
                        value={processStepsData.cadcEvaluation}
                        onValueChange={(value) =>
                          setProcessStepsData({
                            ...processStepsData,
                            cadcEvaluation: value,
                          })
                        }
                      >
                        <SelectTrigger
                          id="cadc-evaluation"
                          className="h-9 text-[13px] rounded"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        >
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">
                            Yes
                          </SelectItem>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="Unknown">
                            Unknown
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Substance Use Assessment complete? - Conditional (only shows if CADC Evaluation is Yes) */}
                    {processStepsData.cadcEvaluation ===
                      "Yes" && (
                      <div>
                        <Label
                          htmlFor="substance-use-assessment-complete"
                          className="block text-[11px] font-medium mb-1.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          SUBSTANCE USE ASSESSMENT COMPLETE?
                        </Label>
                        <Select
                          value={
                            processStepsData.substanceUseAssessmentComplete
                          }
                          onValueChange={(value) =>
                            setProcessStepsData({
                              ...processStepsData,
                              substanceUseAssessmentComplete:
                                value,
                            })
                          }
                        >
                          <SelectTrigger
                            id="substance-use-assessment-complete"
                            className="h-9 text-[13px] rounded"
                            style={{
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                            }}
                          >
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">
                              Yes
                            </SelectItem>
                            <SelectItem value="No">
                              No
                            </SelectItem>
                            <SelectItem value="Unknown">
                              Unknown
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Substance Use Connection Link - Conditional (only shows if Substance Use Assessment is Yes) */}
                    {processStepsData.substanceUseAssessmentComplete ===
                      "Yes" && (
                      <div>
                        <Label
                          htmlFor="substance-use-connection-link"
                          className="block text-[11px] font-medium mb-1.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          SUBSTANCE USE CONNECTION LINK
                        </Label>
                        <Input
                          id="substance-use-connection-link"
                          type="text"
                          value={
                            processStepsData.substanceUseConnectionLink
                          }
                          onChange={(e) =>
                            setProcessStepsData({
                              ...processStepsData,
                              substanceUseConnectionLink:
                                e.target.value,
                            })
                          }
                          className="h-9 text-[13px] rounded"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                          }}
                          placeholder="Placeholder for future dynamic lookup/formula"
                          maxLength={255}
                        />
                      </div>
                    )}

                    {/* Comments */}
                    <div>
                      <Label
                        htmlFor="process-comments"
                        className="block text-[11px] font-medium mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        COMMENTS
                      </Label>
                      <Textarea
                        id="process-comments"
                        value={processStepsData.comments}
                        onChange={(e) =>
                          setProcessStepsData({
                            ...processStepsData,
                            comments: e.target.value,
                          })
                        }
                        className="text-[13px] rounded min-h-[80px]"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                        }}
                        placeholder="Enter any relevant comments or notes about the process steps..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* New School Modal */}
              <Dialog
                open={caseShowNewSchoolModal}
                onOpenChange={(open) => {
                  setCaseShowNewSchoolModal(open);
                  if (!open)
                    setCaseNewSchoolData({
                      name: "",
                      schoolType: "",
                      schoolLevel: "",
                      street: "",
                      addressLine2: "",
                      city: "",
                      state: "",
                      country: "--None--",
                      zipCode: "",
                      zipPlus4: "",
                      neighborhood: "",
                      type: "",
                      status: "",
                      isPrimaryAddress: false,
                      phoneNumber: "",
                    });
                }}
              >
                <DialogContent
                  className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0"
                  aria-describedby="new-school-desc"
                >
                  <DialogHeader
                    className="px-6 pt-5 pb-4 flex-shrink-0"
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <DialogTitle
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      New School
                    </DialogTitle>
                    <DialogDescription
                      id="new-school-desc"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Create a new school account record.
                    </DialogDescription>
                  </DialogHeader>

                  <div
                    className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  >
                    {/* NAME */}
                    <div>
                      <Label
                        htmlFor="ci-new-school-name"
                        className="block text-[11px] font-medium mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        NAME{" "}
                        <span style={{ color: "#c23934" }}>
                          *
                        </span>
                      </Label>
                      <Input
                        id="ci-new-school-name"
                        value={caseNewSchoolData.name}
                        onChange={(e) =>
                          setCaseNewSchoolData({
                            ...caseNewSchoolData,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter school name..."
                        className="h-9 text-[13px] rounded"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                        }}
                      />
                    </div>

                    {/* SCHOOL TYPE */}
                    <div>
                      <Label
                        htmlFor="ci-new-school-type"
                        className="block text-[11px] font-medium mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        SCHOOL TYPE
                      </Label>
                      <Select
                        value={caseNewSchoolData.schoolType}
                        onValueChange={(v) =>
                          setCaseNewSchoolData({
                            ...caseNewSchoolData,
                            schoolType: v,
                          })
                        }
                      >
                        <SelectTrigger
                          id="ci-new-school-type"
                          className="h-9 text-[13px] rounded"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        >
                          <SelectValue placeholder="Select school type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Public">
                            Public
                          </SelectItem>
                          <SelectItem value="Private">
                            Private
                          </SelectItem>
                          <SelectItem value="Charter">
                            Charter
                          </SelectItem>
                          <SelectItem value="Alternative">
                            Alternative
                          </SelectItem>
                          <SelectItem value="Vocational">
                            Vocational
                          </SelectItem>
                          <SelectItem value="Technical">
                            Technical
                          </SelectItem>
                          <SelectItem value="Online">
                            Online
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* SCHOOL LEVEL */}
                    <div>
                      <Label
                        htmlFor="ci-new-school-level"
                        className="block text-[11px] font-medium mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        SCHOOL LEVEL
                      </Label>
                      <Select
                        value={caseNewSchoolData.schoolLevel}
                        onValueChange={(v) =>
                          setCaseNewSchoolData({
                            ...caseNewSchoolData,
                            schoolLevel: v,
                          })
                        }
                      >
                        <SelectTrigger
                          id="ci-new-school-level"
                          className="h-9 text-[13px] rounded"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        >
                          <SelectValue placeholder="Select school level..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Elementary School">
                            Elementary School
                          </SelectItem>
                          <SelectItem value="Middle School">
                            Middle School
                          </SelectItem>
                          <SelectItem value="High School">
                            High School
                          </SelectItem>
                          <SelectItem value="Middle & High School">
                            Middle & High School
                          </SelectItem>
                          <SelectItem value="K-12">
                            K-12
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* ADDRESS section divider */}
                    <div
                      className="pt-2 pb-1"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <span
                        className="text-[11px] font-semibold uppercase tracking-wide"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        ADDRESS
                      </span>
                    </div>

                    {/* STREET ADDRESS */}
                    <div>
                      <Label
                        htmlFor="ci-new-school-street"
                        className="block text-[11px] font-medium mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        STREET ADDRESS
                      </Label>
                      <Input
                        id="ci-new-school-street"
                        value={caseNewSchoolData.street}
                        onChange={(e) =>
                          setCaseNewSchoolData({
                            ...caseNewSchoolData,
                            street: e.target.value,
                          })
                        }
                        placeholder="e.g., 123 Main St"
                        className="h-9 text-[13px] rounded"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                        }}
                      />
                    </div>

                    {/* ADDRESS LINE 2 */}
                    <div>
                      <Label
                        htmlFor="ci-new-school-addr2"
                        className="block text-[11px] font-medium mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        ADDRESS LINE 2
                      </Label>
                      <Input
                        id="ci-new-school-addr2"
                        value={caseNewSchoolData.addressLine2}
                        onChange={(e) =>
                          setCaseNewSchoolData({
                            ...caseNewSchoolData,
                            addressLine2: e.target.value,
                          })
                        }
                        placeholder="Apt, suite, unit, etc."
                        className="h-9 text-[13px] rounded"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                        }}
                      />
                    </div>

                    {/* CITY */}
                    <div>
                      <Label
                        htmlFor="ci-new-school-city"
                        className="block text-[11px] font-medium mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        CITY
                      </Label>
                      <Input
                        id="ci-new-school-city"
                        value={caseNewSchoolData.city}
                        onChange={(e) =>
                          setCaseNewSchoolData({
                            ...caseNewSchoolData,
                            city: e.target.value,
                          })
                        }
                        placeholder="e.g., Chicago"
                        className="h-9 text-[13px] rounded"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                        }}
                      />
                    </div>

                    {/* STATE */}
                    <div>
                      <Label
                        htmlFor="ci-new-school-state"
                        className="block text-[11px] font-medium mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        STATE
                      </Label>
                      <Select
                        value={caseNewSchoolData.state}
                        onValueChange={(v) =>
                          setCaseNewSchoolData({
                            ...caseNewSchoolData,
                            state: v,
                          })
                        }
                      >
                        <SelectTrigger
                          id="ci-new-school-state"
                          className="h-9 text-[13px] rounded"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        >
                          <SelectValue placeholder="Select state..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IL">
                            Illinois
                          </SelectItem>
                          <SelectItem value="IN">
                            Indiana
                          </SelectItem>
                          <SelectItem value="WI">
                            Wisconsin
                          </SelectItem>
                          <SelectItem value="MO">
                            Missouri
                          </SelectItem>
                          <SelectItem value="OH">
                            Ohio
                          </SelectItem>
                          <SelectItem value="MI">
                            Michigan
                          </SelectItem>
                          <SelectItem value="IA">
                            Iowa
                          </SelectItem>
                          <SelectItem value="MN">
                            Minnesota
                          </SelectItem>
                          <SelectItem value="KY">
                            Kentucky
                          </SelectItem>
                          <SelectItem value="Other">
                            Other
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* COUNTRY */}
                    <div>
                      <Label
                        htmlFor="ci-new-school-country"
                        className="block text-[11px] font-medium mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        COUNTRY
                      </Label>
                      <Select
                        value={caseNewSchoolData.country}
                        onValueChange={(v) =>
                          setCaseNewSchoolData({
                            ...caseNewSchoolData,
                            country: v,
                          })
                        }
                      >
                        <SelectTrigger
                          id="ci-new-school-country"
                          className="h-9 text-[13px] rounded"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        >
                          <SelectValue placeholder="--None--" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="--None--">
                            --None--
                          </SelectItem>
                          <SelectItem value="US">
                            United States
                          </SelectItem>
                          <SelectItem value="CA">
                            Canada
                          </SelectItem>
                          <SelectItem value="MX">
                            Mexico
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* ZIP CODE / ZIP +4 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label
                          htmlFor="ci-new-school-zip"
                          className="block text-[11px] font-medium mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          ZIP CODE
                        </Label>
                        <Input
                          id="ci-new-school-zip"
                          value={caseNewSchoolData.zipCode}
                          onChange={(e) =>
                            setCaseNewSchoolData({
                              ...caseNewSchoolData,
                              zipCode: e.target.value,
                            })
                          }
                          placeholder="e.g., 60601"
                          className="h-9 text-[13px] rounded"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="ci-new-school-zip4"
                          className="block text-[11px] font-medium mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          ZIP +4
                        </Label>
                        <Input
                          id="ci-new-school-zip4"
                          value={caseNewSchoolData.zipPlus4}
                          onChange={(e) =>
                            setCaseNewSchoolData({
                              ...caseNewSchoolData,
                              zipPlus4: e.target.value,
                            })
                          }
                          placeholder="Enter zip plus4"
                          className="h-9 text-[13px] rounded"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        />
                      </div>
                    </div>

                    {/* NEIGHBORHOOD */}
                    <div>
                      <Label
                        htmlFor="ci-new-school-neighborhood"
                        className="block text-[11px] font-medium mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        NEIGHBORHOOD
                      </Label>
                      <Input
                        id="ci-new-school-neighborhood"
                        value={caseNewSchoolData.neighborhood}
                        onChange={(e) =>
                          setCaseNewSchoolData({
                            ...caseNewSchoolData,
                            neighborhood: e.target.value,
                          })
                        }
                        placeholder="e.g., Downtown"
                        className="h-9 text-[13px] rounded"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                        }}
                      />
                    </div>

                    {/* TYPE */}
                    <div>
                      <Label
                        htmlFor="ci-new-school-type2"
                        className="block text-[11px] font-medium mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        TYPE
                      </Label>
                      <Select
                        value={caseNewSchoolData.type}
                        onValueChange={(v) =>
                          setCaseNewSchoolData({
                            ...caseNewSchoolData,
                            type: v,
                          })
                        }
                      >
                        <SelectTrigger
                          id="ci-new-school-type2"
                          className="h-9 text-[13px] rounded"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        >
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Billing">
                            Billing
                          </SelectItem>
                          <SelectItem value="Mailing">
                            Mailing
                          </SelectItem>
                          <SelectItem value="Other">
                            Other
                          </SelectItem>
                          <SelectItem value="Physical">
                            Physical
                          </SelectItem>
                          <SelectItem value="Shipping">
                            Shipping
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* STATUS */}
                    <div>
                      <Label
                        htmlFor="ci-new-school-status"
                        className="block text-[11px] font-medium mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        STATUS
                      </Label>
                      <Select
                        value={caseNewSchoolData.status}
                        onValueChange={(v) =>
                          setCaseNewSchoolData({
                            ...caseNewSchoolData,
                            status: v,
                          })
                        }
                      >
                        <SelectTrigger
                          id="ci-new-school-status"
                          className="h-9 text-[13px] rounded"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        >
                          <SelectValue placeholder="Select status..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">
                            Active
                          </SelectItem>
                          <SelectItem value="Inactive">
                            Inactive
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* IS PRIMARY ADDRESS */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="ci-new-school-primary"
                        checked={
                          caseNewSchoolData.isPrimaryAddress
                        }
                        onChange={(e) =>
                          setCaseNewSchoolData({
                            ...caseNewSchoolData,
                            isPrimaryAddress: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded cursor-pointer"
                        style={{
                          accentColor: "#145F33",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                        }}
                      />
                      <label
                        htmlFor="ci-new-school-primary"
                        className="text-[11px] font-medium uppercase cursor-pointer"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        IS PRIMARY ADDRESS
                      </label>
                    </div>

                    {/* PHONE section divider */}
                    <div
                      className="pt-2 pb-1"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <span
                        className="text-[11px] font-semibold uppercase tracking-wide"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        PHONE
                      </span>
                    </div>

                    {/* PHONE NUMBER */}
                    <div>
                      <Label
                        htmlFor="ci-new-school-phone"
                        className="block text-[11px] font-medium mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        PHONE NUMBER
                      </Label>
                      <Input
                        id="ci-new-school-phone"
                        value={caseNewSchoolData.phoneNumber}
                        onChange={(e) =>
                          setCaseNewSchoolData({
                            ...caseNewSchoolData,
                            phoneNumber: e.target.value,
                          })
                        }
                        placeholder="phone number"
                        className="h-9 text-[13px] rounded"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                        }}
                      />
                    </div>
                  </div>

                  <DialogFooter
                    className="px-6 py-4 flex-shrink-0"
                    style={{
                      borderTop:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCaseShowNewSchoolModal(false);
                        setCaseNewSchoolData({
                          name: "",
                          schoolType: "",
                          schoolLevel: "",
                          street: "",
                          addressLine2: "",
                          city: "",
                          state: "",
                          country: "--None--",
                          zipCode: "",
                          zipPlus4: "",
                          neighborhood: "",
                          type: "",
                          status: "",
                          isPrimaryAddress: false,
                          phoneNumber: "",
                        });
                      }}
                      className="rounded-full px-5 h-9 text-[13px]"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (!caseNewSchoolData.name.trim())
                          return;
                        const newSchool = {
                          id: `new-${Date.now()}`,
                          name: caseNewSchoolData.name.trim(),
                          type:
                            caseNewSchoolData.schoolType ||
                            "Other",
                          level:
                            caseNewSchoolData.schoolLevel || "",
                        };
                        setCaseSchoolAccounts((prev) => [
                          ...prev,
                          newSchool,
                        ]);
                        setCaseInfoFormData({
                          ...caseInfoFormData,
                          currentIntendedSchool: newSchool.name,
                        });
                        setCaseShowNewSchoolModal(false);
                        setCaseNewSchoolData({
                          name: "",
                          schoolType: "",
                          schoolLevel: "",
                          street: "",
                          addressLine2: "",
                          city: "",
                          state: "",
                          country: "--None--",
                          zipCode: "",
                          zipPlus4: "",
                          neighborhood: "",
                          type: "",
                          status: "",
                          isPrimaryAddress: false,
                          phoneNumber: "",
                        });
                        toast.success(
                          `School "${newSchool.name}" created successfully.`,
                        );
                      }}
                      className="rounded-full px-5 h-9 text-[13px]"
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
            </>
          )}
        </div>
      )}
    </>
  );
}