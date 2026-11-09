import { useState, useEffect, useRef } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { getCreatedLeadIncidents, subscribeLeadIncidents } from "../../data/leadIncidentStore";
import {
  deleteIncidentReport,
  getIncidentReportsForConstituent,
  updateIncidentReport,
} from "../../data/incidentReportStore";
import {
  subscribeIncidentReports,
  type IncidentReportRecord,
} from "../../data/mockYouthProgramData";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
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
import { formatMdy } from "../../lib/dateFormat";
import { DateInput } from "../ui/date-input";

// ── Admissions-only incident constants (mirror LeadDetailCreateIncidentDialog) ──
const INCIDENT_TYPES = [
  "Physical Aggression",
  "Property Damage",
  "Elopement",
  "Self-Harm",
  "Medical Emergency",
  "Other",
];

const PROGRAMS = [
  "Mahoney House",
  "Rydell House",
  "Residential Program",
  "Other",
];

const INVOLVEMENT_TYPES = [
  "Youth Involved",
  "Staff Involved",
  "Witness",
  "Restraint Consultant",
  "DCFS Hotline Operator",
  "Other",
];

const INDIVIDUALS = [
  "Marcus Thompson",
  "Swapnali Shingare",
  "Jyotir Dhalmahapatra",
  "Ajit Khulape",
  "Mukesh Jaiswal",
  "Teg Chanderpaul",
];

interface IncidentRecord {
  id: number;
  incidentType: string;
  startDate: string; // MM/DD/YYYY
  startTime: string; // HH:MM (24-hour, for <input type="time">)
  endDate: string;
  endTime: string;
  individuals: string[];
  program: string;
  involvementType: string;
  location: string;
  description: string;
}

const INITIAL_INCIDENTS: IncidentRecord[] = [
  {
    id: 1,
    incidentType: "Physical Aggression",
    startDate: "12/08/2024",
    startTime: "14:30",
    endDate: "12/08/2024",
    endTime: "15:15",
    individuals: [],
    program: "Residential Program",
    involvementType: "Youth Involved",
    location: "Recreation Area",
    description:
      "Youth engaged in verbal altercation with peer during recreation period. Situation was de-escalated through staff intervention.",
  },
  {
    id: 2,
    incidentType: "Other",
    startDate: "11/30/2024",
    startTime: "19:45",
    endDate: "11/30/2024",
    endTime: "20:15",
    individuals: [],
    program: "Residential Program",
    involvementType: "Staff Involved",
    location: "",
    description: "",
  },
  {
    id: 3,
    incidentType: "Elopement",
    startDate: "11/22/2024",
    startTime: "16:20",
    endDate: "11/22/2024",
    endTime: "16:45",
    individuals: [],
    program: "Residential Program",
    involvementType: "Youth Involved",
    location: "Facility Grounds",
    description:
      "Youth left designated program area without staff permission. Youth was located within 15 minutes on facility grounds. Safety protocols reviewed with youth.",
  },
  {
    id: 4,
    incidentType: "Other",
    startDate: "11/15/2024",
    startTime: "10:00",
    endDate: "11/15/2024",
    endTime: "10:30",
    individuals: [],
    program: "Residential Program",
    involvementType: "Youth Involved",
    location: "Common Area",
    description:
      "Youth refused to attend scheduled educational activity. Staff attempted redirection and processing. Youth eventually agreed to participate after one-on-one discussion.",
  },
  {
    id: 5,
    incidentType: "Property Damage",
    startDate: "11/10/2024",
    startTime: "13:15",
    endDate: "11/10/2024",
    endTime: "13:45",
    individuals: [],
    program: "Residential Program",
    involvementType: "Youth Involved",
    location: "Youth Bedroom",
    description:
      "During emotional episode, youth damaged personal belongings. Staff provided support and de-escalation. Youth calmed and discussed appropriate coping strategies. No injuries occurred.",
  },
];

function formatTime12h(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

// ── Admissions-only View/Edit dialog ──────────────────────────────────────────
function AdmissionsIncidentDialog({
  open,
  mode,
  data,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: "view" | "edit";
  data: IncidentRecord | null;
  onClose: () => void;
  onSave: (updated: IncidentRecord) => void;
}) {
  const isView = mode === "view";

  const [incidentType, setIncidentType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedIndividuals, setSelectedIndividuals] =
    useState<string[]>([]);
  const [individualsOpen, setIndividualsOpen] = useState(false);
  const [individualsSearch, setIndividualsSearch] =
    useState("");
  const [program, setProgram] = useState("");
  const [involvementType, setInvolvementType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const individualsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && data) {
      setIncidentType(data.incidentType);
      setStartDate(data.startDate);
      setStartTime(data.startTime);
      setEndDate(data.endDate);
      setEndTime(data.endTime);
      setSelectedIndividuals(data.individuals ?? []);
      setIndividualsSearch("");
      setIndividualsOpen(false);
      setProgram(data.program);
      setInvolvementType(data.involvementType);
      setLocation(data.location);
      setDescription(data.description);
    }
  }, [open, data]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        individualsRef.current &&
        !individualsRef.current.contains(e.target as Node)
      ) {
        setIndividualsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  const filteredIndividuals = INDIVIDUALS.filter((name) =>
    name
      .toLowerCase()
      .includes(individualsSearch.toLowerCase()),
  );

  const individualsDisplayValue = () => {
    if (selectedIndividuals.length === 0)
      return isView ? "—" : "";
    if (selectedIndividuals.length <= 2)
      return selectedIndividuals.join(", ");
    return `${selectedIndividuals.slice(0, 2).join(", ")} +${selectedIndividuals.length - 2} more`;
  };

  const handleSave = () => {
    if (!incidentType) {
      toast.error("Please select an Incident Type.");
      return;
    }
    if (!startDate) {
      toast.error("Please enter a Start Date.");
      return;
    }
    if (!startTime) {
      toast.error("Please enter a Start Time.");
      return;
    }
    if (!endDate) {
      toast.error("Please enter an End Date.");
      return;
    }
    if (!endTime) {
      toast.error("Please enter an End Time.");
      return;
    }
    if (!involvementType) {
      toast.error("Please select an Involvement Type.");
      return;
    }

    onSave({
      ...data!,
      incidentType,
      startDate,
      startTime,
      endDate,
      endTime,
      individuals: selectedIndividuals,
      program,
      involvementType,
      location,
      description,
    });
    toast.success("Incident updated successfully.");
    onClose();
  };

  const inputBorder = {
    border: "1px solid var(--slds-g-color-border-base-1)",
  };
  const labelStyle = { color: "var(--slds-g-color-text-weak)" };
  const req = <span style={{ color: "#c23934" }}>*</span>;

  const readValue = (val: string, fallback = "—") =>
    val && val.trim() ? val : fallback;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        className="!w-[540px] !max-w-[90vw] flex flex-col gap-0 p-0"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          border: "1px solid var(--slds-g-color-border-base-1)",
          maxHeight: "90vh",
        }}
      >
        <DialogHeader
          className="px-6 py-4 flex-shrink-0"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <DialogTitle
            className="text-[16px] font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            {isView ? "View Incident" : "Edit Incident"}
          </DialogTitle>
          <DialogDescription
            className="text-[13px]"
            style={labelStyle}
          >
            {isView
              ? "Incident record details"
              : "Update the incident details below"}
          </DialogDescription>
        </DialogHeader>

        <div
          className={`flex-1 min-h-0 overflow-y-auto px-6 py-5 ${isView ? "space-y-5" : "space-y-4"}`}
        >
          {/* 1. Incident Type */}
          <div
            className={isView ? "space-y-0.5" : "space-y-1.5"}
          >
            <Label
              className="block text-[12px] font-semibold uppercase tracking-wide"
              style={labelStyle}
            >
              INCIDENT TYPE {!isView && req}
            </Label>
            {isView ? (
              <p
                className="text-[13px]"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {readValue(incidentType)}
              </p>
            ) : (
              <select
                value={incidentType}
                onChange={(e) =>
                  setIncidentType(e.target.value)
                }
                className="w-full h-9 text-[13px] px-3 rounded"
                style={{
                  ...inputBorder,
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: incidentType
                    ? "var(--slds-g-color-text-default)"
                    : "var(--slds-g-color-text-weak)",
                }}
              >
                <option value="">Select incident type</option>
                {INCIDENT_TYPES.map((t) => (
                  <option
                    key={t}
                    value={t}
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {t}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2. Start Date / Start Time */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className={isView ? "space-y-0.5" : "space-y-1.5"}
            >
              <Label
                className="block text-[12px] font-semibold uppercase tracking-wide"
                style={labelStyle}
              >
                START DATE {!isView && req}
              </Label>
              {isView ? (
                <p
                  className="text-[13px]"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {readValue(startDate)}
                </p>
              ) : (
                <DateInput
                  value={startDate}
                  onChange={(v) => setStartDate(v)}
                  className="h-9 text-[13px] w-full"
                  style={inputBorder}
                  required
                />
              )}
            </div>
            <div
              className={isView ? "space-y-0.5" : "space-y-1.5"}
            >
              <Label
                className="block text-[12px] font-semibold uppercase tracking-wide"
                style={labelStyle}
              >
                START TIME {!isView && req}
              </Label>
              {isView ? (
                <p
                  className="text-[13px]"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {startTime ? formatTime12h(startTime) : "—"}
                </p>
              ) : (
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-9 text-[13px] w-full px-3 rounded"
                  style={{
                    ...inputBorder,
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                  required
                />
              )}
            </div>
          </div>

          {/* 3. End Date / End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className={isView ? "space-y-0.5" : "space-y-1.5"}
            >
              <Label
                className="block text-[12px] font-semibold uppercase tracking-wide"
                style={labelStyle}
              >
                END DATE {!isView && req}
              </Label>
              {isView ? (
                <p
                  className="text-[13px]"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {readValue(endDate)}
                </p>
              ) : (
                <DateInput
                  value={endDate}
                  onChange={(v) => setEndDate(v)}
                  className="h-9 text-[13px] w-full"
                  style={inputBorder}
                  required
                />
              )}
            </div>
            <div
              className={isView ? "space-y-0.5" : "space-y-1.5"}
            >
              <Label
                className="block text-[12px] font-semibold uppercase tracking-wide"
                style={labelStyle}
              >
                END TIME {!isView && req}
              </Label>
              {isView ? (
                <p
                  className="text-[13px]"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {endTime ? formatTime12h(endTime) : "—"}
                </p>
              ) : (
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-9 text-[13px] w-full px-3 rounded"
                  style={{
                    ...inputBorder,
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                  required
                />
              )}
            </div>
          </div>

          {/* 4. Individuals Involved */}
          <div
            className={isView ? "space-y-0.5" : "space-y-1.5"}
          >
            <Label
              className="block text-[12px] font-semibold uppercase tracking-wide"
              style={labelStyle}
            >
              INDIVIDUALS INVOLVED
            </Label>
            {isView ? (
              <p
                className="text-[13px]"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {individualsDisplayValue()}
              </p>
            ) : (
              <div ref={individualsRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIndividualsOpen((v) => !v)}
                  className="w-full h-9 flex items-center justify-between px-3 rounded text-[13px] text-left"
                  style={{
                    ...inputBorder,
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: selectedIndividuals.length
                      ? "var(--slds-g-color-text-default)"
                      : "var(--slds-g-color-text-weak)",
                  }}
                >
                  <span className="truncate flex-1">
                    {selectedIndividuals.length
                      ? individualsDisplayValue()
                      : "Select individuals"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`flex-shrink-0 ml-2 transition-transform ${individualsOpen ? "rotate-180" : ""}`}
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                </button>
                {individualsOpen && (
                  <div
                    className="absolute z-50 left-0 right-0 mt-1 rounded shadow-lg"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <div
                      className="p-2"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <div
                        className="flex items-center gap-2 h-8 px-2 rounded"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <Search
                          size={12}
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                            flexShrink: 0,
                          }}
                        />
                        <input
                          type="text"
                          value={individualsSearch}
                          onChange={(e) =>
                            setIndividualsSearch(e.target.value)
                          }
                          placeholder="Search individuals"
                          className="flex-1 text-[13px] bg-transparent outline-none"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                          autoFocus
                        />
                      </div>
                    </div>
                    <ul className="py-1 max-h-48 overflow-y-auto">
                      {filteredIndividuals.length === 0 ? (
                        <li
                          className="px-3 py-2 text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          No results found
                        </li>
                      ) : (
                        filteredIndividuals.map((name) => {
                          const checked =
                            selectedIndividuals.includes(name);
                          return (
                            <li key={name}>
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedIndividuals(
                                    (prev) =>
                                      checked
                                        ? prev.filter(
                                            (n) => n !== name,
                                          )
                                        : [...prev, name],
                                  )
                                }
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left hover:bg-gray-50"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                <span
                                  className="flex-shrink-0 h-4 w-4 rounded flex items-center justify-center"
                                  style={{
                                    border: checked
                                      ? "none"
                                      : "1px solid var(--slds-g-color-border-base-1)",
                                    backgroundColor: checked
                                      ? "#145F33"
                                      : "transparent",
                                  }}
                                >
                                  {checked && (
                                    <Check
                                      size={10}
                                      color="white"
                                    />
                                  )}
                                </span>
                                {name}
                              </button>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5. Program(s) */}
          <div
            className={isView ? "space-y-0.5" : "space-y-1.5"}
          >
            <Label
              className="block text-[12px] font-semibold uppercase tracking-wide"
              style={labelStyle}
            >
              PROGRAM(S)
            </Label>
            {isView ? (
              <p
                className="text-[13px]"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {readValue(program)}
              </p>
            ) : (
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full h-9 text-[13px] px-3 rounded"
                style={{
                  ...inputBorder,
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: program
                    ? "var(--slds-g-color-text-default)"
                    : "var(--slds-g-color-text-weak)",
                }}
              >
                <option value="">Select program</option>
                {PROGRAMS.map((p) => (
                  <option
                    key={p}
                    value={p}
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {p}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 6. Involvement Type */}
          <div
            className={isView ? "space-y-0.5" : "space-y-1.5"}
          >
            <Label
              className="block text-[12px] font-semibold uppercase tracking-wide"
              style={labelStyle}
            >
              INVOLVEMENT TYPE {!isView && req}
            </Label>
            {isView ? (
              <p
                className="text-[13px]"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {readValue(involvementType)}
              </p>
            ) : (
              <select
                value={involvementType}
                onChange={(e) =>
                  setInvolvementType(e.target.value)
                }
                className="w-full h-9 text-[13px] px-3 rounded"
                style={{
                  ...inputBorder,
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: involvementType
                    ? "var(--slds-g-color-text-default)"
                    : "var(--slds-g-color-text-weak)",
                }}
              >
                <option value="">
                  Select involvement type
                </option>
                {INVOLVEMENT_TYPES.map((t) => (
                  <option
                    key={t}
                    value={t}
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {t}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 7. Location */}
          <div
            className={isView ? "space-y-0.5" : "space-y-1.5"}
          >
            <Label
              className="block text-[12px] font-semibold uppercase tracking-wide"
              style={labelStyle}
            >
              LOCATION
            </Label>
            {isView ? (
              <p
                className="text-[13px]"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {readValue(location)}
              </p>
            ) : (
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location..."
                className="h-9 text-[13px] w-full px-3 rounded"
                style={{
                  ...inputBorder,
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                  outline: "none",
                }}
              />
            )}
          </div>

          {/* 8. Description */}
          <div
            className={isView ? "space-y-0.5" : "space-y-1.5"}
          >
            <Label
              className="block text-[12px] font-semibold uppercase tracking-wide"
              style={labelStyle}
            >
              DESCRIPTION
            </Label>
            {isView ? (
              <p
                className="text-[13px] leading-relaxed"
                style={{
                  color: "var(--slds-g-color-text-default)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {readValue(description)}
              </p>
            ) : (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter incident description"
                rows={4}
                className="w-full px-3 py-2 text-[13px] rounded resize-none"
                style={{
                  ...inputBorder,
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            )}
          </div>
        </div>

        <DialogFooter
          className="px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0"
          style={{
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <Button
            onClick={onClose}
            className="h-9 px-6 text-[13px] font-medium rounded-full"
            style={{
              backgroundColor: "var(--slds-g-color-neutral-95)",
              color: "var(--slds-g-color-text-default)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            {isView ? "Close" : "Cancel"}
          </Button>
          {!isView && (
            <Button
              onClick={handleSave}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              Save Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
/** A shared Incident Report as this tab's row/dialog shape. */
function toIncidentRow(
  r: IncidentReportRecord,
  memberId: number,
): IncidentRecord {
  const [sd = "", st = ""] = r.incidentStartDateTime.split("T");
  const [ed = "", et = ""] = (r.endDateTime ?? "").split("T");
  const mine = r.participants?.find((p) => p.constituentId === memberId);
  return {
    id: r.id,
    incidentType: r.incidentTypes?.[0] ?? "",
    startDate: isoToMdy(sd),
    startTime: st.slice(0, 5),
    endDate: ed ? isoToMdy(ed) : "",
    endTime: et.slice(0, 5),
    individuals: (r.participants ?? []).map((p) => p.name),
    program: r.program,
    involvementType: mine?.role ?? "",
    location: r.location ?? "",
    description: r.description ?? "",
  };
}

interface LeadDetailIncidentsTabProps {
  /** Community Care Member profile: the member's Constituent ID. Rows then
   *  come from the shared Incident Reports associated with that ID. */
  memberConstituentId?: number;
  activeTab: any;
  dcfsInvolvementRecords: any;
  lead: any;
  handleCreateDcfsInvolvement: any;
  handleCreateLegalInvolvement: any;
  handleDeleteDcfsInvolvement: any;
  handleDeleteLegalInvolvement: any;
  handleEditDcfsInvolvement: any;
  handleEditLegalInvolvement: any;
  handleViewDcfsInvolvement: any;
  handleOpenCreateIncident: any;
  legalInvolvementRecords: any;
  s: any;
  setIncidentEndDate: any;
  setIncidentEndTime: any;
  setIncidentLocation: any;
  setIncidentNarrative: any;
  setIncidentOverview: any;
  setIncidentStartDate: any;
  setIncidentStartTime: any;
  setIncidentTab: any;
  setIncidentType: any;
  setIrDialogOpen: any;
  setSelectedIncident: any;
}

export function LeadDetailIncidentsTab({
  memberConstituentId,
  activeTab,
  dcfsInvolvementRecords,
  lead,
  handleCreateDcfsInvolvement,
  handleCreateLegalInvolvement,
  handleDeleteDcfsInvolvement,
  handleDeleteLegalInvolvement,
  handleEditDcfsInvolvement,
  handleEditLegalInvolvement,
  handleViewDcfsInvolvement,
  handleOpenCreateIncident,
  legalInvolvementRecords,
  s,
  setIncidentEndDate,
  setIncidentEndTime,
  setIncidentLocation,
  setIncidentNarrative,
  setIncidentOverview,
  setIncidentStartDate,
  setIncidentStartTime,
  setIncidentTab,
  setIncidentType,
  setIrDialogOpen,
  setSelectedIncident,
}: LeadDetailIncidentsTabProps) {
  const [incidents, setIncidents] = useState<IncidentRecord[]>(
    () => [...getCreatedLeadIncidents(), ...INITIAL_INCIDENTS],
  );
  // Member mode: the shared source, selected by explicit participant ID.
  const [, setMemberTick] = useState(0);
  useEffect(
    () =>
      memberConstituentId === undefined
        ? undefined
        : subscribeIncidentReports(() => setMemberTick((t) => t + 1)),
    [memberConstituentId],
  );
  const memberMode = memberConstituentId !== undefined;
  const shownIncidents: IncidentRecord[] = memberMode
    ? getIncidentReportsForConstituent(memberConstituentId as number).map(
        (r) => toIncidentRow(r, memberConstituentId as number),
      )
    : incidents;
  // Incidents created from the "Create New Incident" dialog appear here.
  useEffect(
    () =>
      subscribeLeadIncidents(() =>
        setIncidents((prev) => {
          const have = new Set(prev.map((r) => r.id));
          const added = getCreatedLeadIncidents().filter((r) => !have.has(r.id));
          return added.length ? [...added, ...prev] : prev;
        }),
      ),
    [],
  );
  const [confirmDeleteDcfsId, setConfirmDeleteDcfsId] =
    useState<number | null>(null);
  const [confirmDeleteIncidentId, setConfirmDeleteIncidentId] =
    useState<number | null>(null);
  const [confirmDeleteLegalId, setConfirmDeleteLegalId] =
    useState<number | null>(null);
  const [incidentDialog, setIncidentDialog] = useState<{
    open: boolean;
    mode: "view" | "edit";
    data: IncidentRecord | null;
  }>({ open: false, mode: "view", data: null });

  const openIncidentDialog = (
    mode: "view" | "edit",
    incident: IncidentRecord,
  ) => {
    setIncidentDialog({ open: true, mode, data: incident });
  };

  const closeIncidentDialog = () => {
    setIncidentDialog((prev) => ({ ...prev, open: false }));
  };

  const handleSaveIncident = (updated: IncidentRecord) => {
    if (memberMode) {
      const result = updateIncidentReport(updated.id, {
        incidentStartDateTime: `${mdyToIso(updated.startDate)}T${updated.startTime || "00:00"}:00`,
        endDateTime: updated.endDate
          ? `${mdyToIso(updated.endDate)}T${updated.endTime || "00:00"}:00`
          : "",
        program: updated.program,
        incidentTypes: updated.incidentType ? [updated.incidentType] : [],
        location: updated.location,
        description: updated.description,
      });
      if (!result.ok)
        toast.error("Incident was not saved.", {
          description: result.message,
        });
      return;
    }
    setIncidents((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r)),
    );
  };

  const handleDeleteIncident = (id: number) => {
    if (memberMode) {
      const result = deleteIncidentReport(id, memberConstituentId as number);
      if (!result.ok) {
        toast.error("Incident was not deleted.", {
          description: result.message,
        });
        setConfirmDeleteIncidentId(null);
        return;
      }
      toast.success("Incident was deleted successfully.");
      setConfirmDeleteIncidentId(null);
      return;
    }
    setIncidents((prev) => prev.filter((r) => r.id !== id));
    toast.success("Incident was deleted successfully.");
    setConfirmDeleteIncidentId(null);
  };

  return (
    <>
      {activeTab === "incidents" && (
        <div className="space-y-6 max-w-full">
          {/* Incidents Table */}
          <div
            className="overflow-hidden"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "var(--slds-c-card-radius-border)",
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
                Incidents
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleOpenCreateIncident}
                  className="h-7 text-[11px] rounded-full bg-[#145F33] hover:bg-[#0f4a26] text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create New Incident
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] min-w-[600px]">
                  <thead>
                    <tr
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-neutral-95)",
                      }}
                    >
                      <th
                        className="text-left px-3 py-2.5 font-semibold uppercase text-[11px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Youth Involved
                      </th>
                      <th
                        className="text-left px-3 py-2.5 font-semibold uppercase text-[11px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Incident Start Date &amp; Time
                      </th>
                      <th
                        className="text-left px-3 py-2.5 font-semibold uppercase text-[11px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Program
                      </th>
                      <th
                        className="text-left px-3 py-2.5 font-semibold uppercase text-[11px]"
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
                    {shownIncidents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-8 text-center text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {memberMode
                            ? "No incidents recorded for this member."
                            : "No incidents recorded"}
                        </td>
                      </tr>
                    ) : (
                      shownIncidents.map((incident) => (
                        <tr
                          key={incident.id}
                          style={{
                            borderTop:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td
                            className="px-3 py-3"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {memberMode && incident.individuals.length
                              ? incident.individuals.join(", ")
                              : lead.name}
                          </td>
                          <td
                            className="px-3 py-3"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {incident.startDate}{" "}
                            {formatTime12h(incident.startTime)}
                          </td>
                          <td
                            className="px-3 py-3"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {incident.program || "—"}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                className="cursor-pointer p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                title="View"
                                onClick={() =>
                                  openIncidentDialog(
                                    "view",
                                    incident,
                                  )
                                }
                              >
                                <Eye
                                  className="h-3.5 w-3.5"
                                  style={{ color: "#0176d3" }}
                                />
                              </button>
                              <button
                                className="cursor-pointer p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                title="Edit"
                                onClick={() =>
                                  openIncidentDialog(
                                    "edit",
                                    incident,
                                  )
                                }
                              >
                                <Pencil
                                  className="h-3.5 w-3.5"
                                  style={{ color: "#0176d3" }}
                                />
                              </button>
                              <button
                                className="cursor-pointer p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                title="Delete"
                                onClick={() =>
                                  setConfirmDeleteIncidentId(
                                    incident.id,
                                  )
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5 text-[#c23934]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Legal Involvement Section */}
          <div
            className="overflow-hidden"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "var(--slds-c-card-radius-border)",
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
                Legal Involvement
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateLegalInvolvement}
                  className="h-7 text-[11px] rounded-full bg-[#145F33] hover:bg-[#0f4a26] text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create New
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] min-w-[900px]">
                  <thead>
                    <tr
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-neutral-95)",
                      }}
                    >
                      <th
                        className="text-left px-3 py-2.5 font-semibold uppercase text-[11px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Date
                      </th>
                      <th
                        className="text-left px-3 py-2.5 font-semibold uppercase text-[11px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Court Type
                      </th>
                      <th
                        className="text-left px-3 py-2.5 font-semibold uppercase text-[11px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Level of Crime
                      </th>
                      <th
                        className="text-left px-3 py-2.5 font-semibold uppercase text-[11px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Description
                      </th>
                      <th
                        className="text-left px-3 py-2.5 font-semibold uppercase text-[11px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Status
                      </th>
                      <th
                        className="text-left px-3 py-2.5 font-semibold uppercase text-[11px]"
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
                    {legalInvolvementRecords.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-8 text-center"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Data not available
                        </td>
                      </tr>
                    ) : (
                      legalInvolvementRecords.map((record) => (
                        <tr
                          key={record.id}
                          style={{
                            borderTop:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td
                            className="px-3 py-3"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {formatMdy(new Date(record.date))}
                          </td>
                          <td
                            className="px-3 py-3"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {record.courtType}
                          </td>
                          <td
                            className="px-3 py-3"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {record.levelOfCrime}
                          </td>
                          <td
                            className="px-3 py-3"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {record.description.length > 50
                              ? `${record.description.substring(0, 50)}...`
                              : record.description}
                          </td>
                          <td className="px-3 py-3">
                            {(() => {
                              const st =
                                record.status === "Active"
                                  ? {
                                      bg: "#e6f4ea",
                                      border: "#a8d5b8",
                                      color: "#145f33",
                                    }
                                  : record.status === "Pending"
                                    ? {
                                        bg: "#fef3c7",
                                        border: "#fcd34d",
                                        color: "#92400e",
                                      }
                                    : {
                                        bg: "#f3f2f2",
                                        border: "#c9c7c5",
                                        color: "#706e6b",
                                      };
                              return (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    height: "20px",
                                    padding: "0 8px",
                                    borderRadius: "9999px",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    backgroundColor: st.bg,
                                    border: `1px solid ${st.border}`,
                                    color: st.color,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {record.status}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  handleEditLegalInvolvement(
                                    record,
                                  )
                                }
                                className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                title="Edit"
                              >
                                <Pencil
                                  className="h-3.5 w-3.5"
                                  style={{ color: "#0176d3" }}
                                />
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmDeleteLegalId(
                                    record.id,
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* DCFS Involvement Section */}
          <div
            className="overflow-hidden"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "var(--slds-c-card-radius-border)",
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
                DCFS Involvement
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateDcfsInvolvement}
                  className="h-7 text-[11px] rounded-full bg-[#145F33] hover:bg-[#0f4a26] text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create New
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] min-w-[1000px]">
                  <thead>
                    <tr
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-neutral-95)",
                      }}
                    >
                      <th
                        className="text-left px-3 py-2.5 font-semibold uppercase text-[11px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Investigation Date
                      </th>
                      <th
                        className="text-left px-3 py-2.5 font-semibold uppercase text-[11px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Incident Summary
                      </th>
                      <th
                        className="text-left px-3 py-2.5 font-semibold uppercase text-[11px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Related Incident
                      </th>
                      <th
                        className="text-left px-3 py-2.5 font-semibold uppercase text-[11px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Resolution
                      </th>
                      <th
                        className="text-left px-3 py-2.5 font-semibold uppercase text-[11px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Resolution Date
                      </th>
                      <th
                        className="text-left px-3 py-2.5 font-semibold uppercase text-[11px]"
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
                    {dcfsInvolvementRecords.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-8 text-center"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Data not available
                        </td>
                      </tr>
                    ) : (
                      dcfsInvolvementRecords.map((record) => (
                        <tr
                          key={record.id}
                          style={{
                            borderTop:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td
                            className="px-3 py-3"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {formatMdy(
                              new Date(
                                record.investigationDate,
                              ),
                            )}
                          </td>
                          <td
                            className="px-3 py-3"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {record.incidentSummary.length > 60
                              ? `${record.incidentSummary.substring(0, 60)}...`
                              : record.incidentSummary}
                          </td>
                          <td
                            className="px-3 py-3"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {record.relatedIncident || "—"}
                          </td>
                          <td
                            className="px-3 py-3"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {record.resolution}
                          </td>
                          <td
                            className="px-3 py-3"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {record.resolutionDate
                              ? formatMdy(
                                  new Date(
                                    record.resolutionDate,
                                  ),
                                )
                              : "—"}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  handleViewDcfsInvolvement(
                                    record,
                                  )
                                }
                                className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                title="View"
                              >
                                {/* <Eye
                                  className="cursor-pointer h-3.5 w-3.5"
                                  style={{ color: "#0176d3" }}
                                />
                              </button>
                              <button
                                onClick={() =>
                                  handleEditDcfsInvolvement(
                                    record,
                                  )
                                }
                                className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                title="Edit"
                              >*/}
                                <Pencil
                                  className="cursor-pointer h-3.5 w-3.5"
                                  style={{ color: "#0176d3" }}
                                />
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmDeleteDcfsId(
                                    record.id,
                                  )
                                }
                                className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="cursor-pointer h-3.5 w-3.5 text-[#c23934]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admissions Incident View/Edit Dialog */}
      <AdmissionsIncidentDialog
        open={incidentDialog.open}
        mode={incidentDialog.mode}
        data={incidentDialog.data}
        onClose={closeIncidentDialog}
        onSave={handleSaveIncident}
      />

      {/* Incident Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteIncidentId !== null}
        onOpenChange={() => setConfirmDeleteIncidentId(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle
              className="text-[15px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Delete Incident?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this incident
              record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteIncidentId(null)}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor:
                  "var(--slds-g-color-neutral-95)",
                color: "var(--slds-g-color-text-default)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                confirmDeleteIncidentId !== null &&
                handleDeleteIncident(confirmDeleteIncidentId)
              }
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#c23934",
                color: "white",
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Legal Involvement Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteLegalId !== null}
        onOpenChange={() => setConfirmDeleteLegalId(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle
              className="text-[15px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Delete Legal Involvement?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this legal
              involvement record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteLegalId(null)}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor:
                  "var(--slds-g-color-neutral-95)",
                color: "var(--slds-g-color-text-default)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (confirmDeleteLegalId !== null) {
                  handleDeleteLegalInvolvement(
                    confirmDeleteLegalId,
                  );
                  toast.success(
                    "Legal Involvement was deleted successfully.",
                  );
                  setConfirmDeleteLegalId(null);
                }
              }}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#c23934",
                color: "white",
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DCFS Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteDcfsId !== null}
        onOpenChange={() => setConfirmDeleteDcfsId(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle
              className="text-[15px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Delete DCFS Involvement?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this DCFS
              involvement record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteDcfsId(null)}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor:
                  "var(--slds-g-color-neutral-95)",
                color: "var(--slds-g-color-text-default)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (confirmDeleteDcfsId !== null) {
                  handleDeleteDcfsInvolvement(
                    confirmDeleteDcfsId,
                  );
                  toast.success(
                    "DCFS Involvement was deleted successfully.",
                  );
                  setConfirmDeleteDcfsId(null);
                }
              }}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#c23934",
                color: "white",
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}