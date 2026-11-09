import { useState, useEffect, useMemo, useRef } from "react";
import { DateInput } from "../ui/date-input";
import { YouthAlertIcons } from "../youth/YouthAlertIcons";
import { useNavigate, useLocation } from "react-router";
import { IncidentDetailsDialog } from "../dialogs/IncidentDetailsDialog";
import {
  Search,
  Calendar,
  FileText,
  AlertTriangle,
  User,
  Filter,
  ChevronRight,
  Settings,
  RefreshCw,
  LayoutGrid,
  Clock,
  Check,
  ArrowRight,
  MoreHorizontal,
  Mail,
  ClipboardList,
  Stethoscope,
  MessageCircle,
  Eye,
  Pill,
  File,
  AlertCircle,
  X,
  Plus,
  ChevronDown,
  Download,
  ExternalLink,
  Users,
  Target,
  Briefcase,
  TrendingUp,
  Edit2,
  Save,
  Phone,
  Trash2,
  MessageSquare,
  Sparkles,
  FileEdit,
  Upload,
  Paperclip,
  Image,
  Pencil,
  ChevronUp,
  EyeOff,
  SlidersHorizontal,
  Send,
  Tag,
  CheckCircle,
  XCircle,
  CalendarDays,
} from "@/app/lib/lucide-icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { VisuallyHidden } from "../ui/visually-hidden";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Checkbox } from "../ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { cn } from "../../lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";
import { toast } from "sonner@2.0.3";
import { GeneralTabContent } from "../youth/GeneralTabContent";
import { ProfileContentRenderer } from "../youth/ProfileContentRenderer";
import { OtherTabsContentRenderer } from "../youth/OtherTabsContentRenderer";
import { MedicationsSection } from "../admissions/MedicationsSection";
import {
  MOCK_PROGRAMS,
  YOUTH_STATUS,
  PROGRAM_TEAM,
  OTHER_INDIVIDUALS,
  MY_TASKS,
  PREVIOUS_SESSIONS,
  EVENTS,
  getTimelineItems,
  MEDICATIONS,
  LOG_FEED,
} from "./programLogData";
import {
  SHIFT_HANDOVERS,
  BEHAVIORAL_INCIDENTS,
  BEHAVIORAL_SUMMARY,
} from "./programLogBehavioralData";
import {
  getSessionHandovers,
  setSessionHandovers,
} from "../../data/handoverSessionStore";
import {
  useShiftRoleState,
  type StaffStatusSnapshot,
} from "../../data/shiftRoleStore";
import { projectProgramLogFeed } from "../program-log/programLogFeed";
import {
  localDateTimeParts,
  useGeneratedEvents,
  useManualLogEntries,
} from "../../data/programLogEntryStore";
import {
  displayShiftLabel,
  type SavedChecklistResult,
} from "../../data/shiftHandoverChecklistStore";
import { ChecklistIndicator } from "../shift-handover/ChecklistResults";

import { ProgramDetailViewDialogs } from "./ProgramDetailViewDialogs";
import { isoToMdy, mdyToIso, formatMdy, toLocalIso } from "../../lib/dateFormat";
import { getDemoUserName } from "../../lib/demoIdentity";
import { addIncidentReportRecord, setIncidentReportStatus } from "../../data/incidentReportStore";
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
import {
  DEFAULT_YOUTH_LOCATION,
  getYouthLocation,
  setYouthLocation,
  useYouthLocation,
  youthLocationKey,
} from "../../data/youthLocationStore";
import {
  isYouthWritableInProgram,
  useProgramYouthStrip,
} from "../program-log/useProgramYouthStrip";
// --- Components ---

function YouthDetailView({
  youth,
  onBack,
  programName,
  onNavigateToList,
}: {
  youth: (typeof YOUTH_STATUS)[0];
  onBack: () => void;
  programName?: string;
  onNavigateToList?: () => void;
}) {
  const [activeTab, setActiveTab] = useState("profile");
  const [activeDropdownItem, setActiveDropdownItem] = useState(
    "profile-overview",
  );
  const [activeHorizontalTab, setActiveHorizontalTab] =
    useState("demographics");
  const [expandedTabs, setExpandedTabs] = useState<string[]>([
    "profile",
  ]);

  // Default sub-items for each main category
  const defaultSubItems: Record<
    string,
    { dropdownId: string; horizontalTab?: string }
  > = {
    profile: {
      dropdownId: "profile-overview",
      horizontalTab: "demographics",
    },
    program: {
      dropdownId: "program-overview",
      horizontalTab: "pass-management",
    },
    health: {
      dropdownId: "physical-health",
      horizontalTab: "current-medical-needs",
    },
    "health-overview": { dropdownId: "ho-medication" },
    treatment: { dropdownId: "positive-transition" },
    medications: {
      dropdownId: "medication-overview",
      horizontalTab: "prescriptions",
    },
    substance: {
      dropdownId: "substance-overview",
      horizontalTab: "testing",
    },
    education: {
      dropdownId: "academic-overview",
      horizontalTab: "academics",
    },
  };

  const toggleTabExpansion = (tabId: string) => {
    // Set this tab as active
    setActiveTab(tabId);

    // Set default sub-item for this category
    const defaultItem = defaultSubItems[tabId];
    if (defaultItem) {
      setActiveDropdownItem(defaultItem.dropdownId);
      if (defaultItem.horizontalTab) {
        setActiveHorizontalTab(defaultItem.horizontalTab);
      }
    }

    // Accordion behavior - close all other tabs and open only the clicked one
    setExpandedTabs([tabId]);
  };

  const handleDropdownClick = (
    tabId: string,
    dropdownId: string,
    defaultHorizontalTab?: string,
  ) => {
    setActiveTab(tabId);
    setActiveDropdownItem(dropdownId);
    if (defaultHorizontalTab) {
      setActiveHorizontalTab(defaultHorizontalTab);
    }
    // Auto-expand parent tab if not expanded
    if (!expandedTabs.includes(tabId)) {
      setExpandedTabs([...expandedTabs, tabId]);
    }
  };

  const getYouthRecentLogs = (youthName: string) => {
    return LOG_FEED.filter(
      (log) =>
        log.details &&
        log.details
          .toLowerCase()
          .includes(youthName.toLowerCase().split(" ")[0]),
    ).slice(0, 5);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: "var(--slds-g-color-background-alt-2)",
      }}
    >
      {/* Page Header with Youth Details - SLDS Style - Full Width */}
      <div
        className="px-6 py-5 flex-shrink-0"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        {/* Breadcrumb Navigation */}
        <nav
          className="flex items-center gap-2 mb-4"
          aria-label="Breadcrumb"
        >
          <button
            onClick={onNavigateToList || onBack}
            className="text-[13px] hover:underline focus:outline-none focus:underline"
            style={{ color: "var(--color-brand-primary)" }}
          >
            Program Logs
          </button>
          <ChevronRight
            className="h-3.5 w-3.5"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          />
          <button
            onClick={onBack}
            className="text-[13px] hover:underline focus:outline-none focus:underline"
            style={{ color: "var(--color-brand-primary)" }}
          >
            {programName || youth.program}
          </button>
          <ChevronRight
            className="h-3.5 w-3.5"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          />
          <span
            className="text-[13px]"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            {youth.name}
          </span>
        </nav>

        {/* Youth Header Section */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className={cn(
                  "h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold text-white",
                  youth.color,
                )}
              >
                {youth.initials}
              </div>
              {youth.status === "Onground" && (
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2"
                  style={{
                    backgroundColor: "#4caf50",
                    borderColor:
                      "var(--slds-g-color-background-base)",
                  }}
                />
              )}
            </div>

            {/* Youth Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1
                  className="text-[22px] font-light leading-tight"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {youth.name}
                </h1>
                <Badge
                  className="text-[11px] font-medium px-2.5 py-0.5"
                  style={{
                    backgroundColor:
                      youth.status === "Onground"
                        ? "#4caf50"
                        : "#e3f2fd",
                    color:
                      youth.status === "Onground"
                        ? "white"
                        : "#1976d2",
                    border: "none",
                  }}
                >
                  {youth.status}
                </Badge>
                <YouthAlertIcons />
              </div>
              <div
                className="flex items-center gap-3 text-[13px]"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
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
                    {youth.program}
                  </Badge>
                </span>
                <span className="text-[#c9c7c5]">•</span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> (312)
                  555-0123
                </span>
                <span className="text-[#c9c7c5]">•</span>
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />{" "}
                  {youth.name
                    .toLowerCase()
                    .split(" ")
                    .join(".")}
                  @mercyhome.org
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-9 rounded-full text-[13px] shadow-none hover:bg-[var(--slds-g-color-background-row-hover)]"
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-base)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Log Activity
            </Button>
            <Button
              className="h-9 rounded-full text-[13px] text-white shadow-none hover:opacity-90"
              style={{
                backgroundColor: "var(--color-brand-primary)",
              }}
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              View Records
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area with Left Navigation */}
      <div className="flex h-full overflow-hidden">
        {/* Left Navigation */}
        <div
          className="w-64 flex-shrink-0 overflow-y-auto"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            borderRight:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          {/* Youth Identity Section removed - now displayed in header */}

          {/* Navigation Tabs */}
          <nav className="p-4">
            {/* Profile & General Info */}
            <div className="mb-1">
              <button
                onClick={() => toggleTabExpansion("profile")}
                className="w-full text-left px-4 py-3 text-[13px] font-medium transition-colors hover:bg-[var(--slds-g-color-background-row-hover)] rounded"
                style={{
                  backgroundColor:
                    activeTab === "profile"
                      ? "var(--color-brand-primary)"
                      : "transparent",
                  color:
                    activeTab === "profile"
                      ? "white"
                      : "#706e6b",
                }}
              >
                Profile & General Info
              </button>
              {expandedTabs.includes("profile") && (
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "profile",
                        "profile-overview",
                        "demographics",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem === "profile-overview"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "profile",
                        "program-enrollment",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem ===
                      "program-enrollment"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Program Enrollment
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "profile",
                        "admissions",
                        "intake",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem === "admissions"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Admissions
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "profile",
                        "relationships-connections",
                        "relationships",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem ===
                      "relationships-connections"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Relationships & Connections
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "profile",
                        "documents-notes",
                        "documents",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem === "documents-notes"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Documents & Notes
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "profile",
                        "campus-restrictions",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem ===
                      "campus-restrictions"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Campus Restrictions
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "profile",
                        "eligibility",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem === "eligibility"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Eligibility
                  </button>
                </div>
              )}
            </div>

            {/* Program Management */}
            <div className="mb-1">
              <button
                onClick={() => toggleTabExpansion("program")}
                className="w-full text-left px-4 py-3 text-[13px] font-medium transition-colors hover:bg-[var(--slds-g-color-background-row-hover)] rounded"
                style={{
                  backgroundColor:
                    activeTab === "program"
                      ? "var(--color-brand-primary)"
                      : "transparent",
                  color:
                    activeTab === "program"
                      ? "white"
                      : "#706e6b",
                }}
              >
                Program Management
              </button>
              {expandedTabs.includes("program") && (
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "program",
                        "program-overview",
                        "pass-management",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem === "program-overview"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Program Overview
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "program",
                        "legal-matters",
                        "legal-involvement",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem === "legal-matters"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Legal Matters
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "program",
                        "assessments-trauma",
                        "trauma-history",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem ===
                      "assessments-trauma"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Assessments & Trauma
                  </button>
                </div>
              )}
            </div>

            {/* Health */}
            <div className="mb-1">
              <button
                onClick={() => toggleTabExpansion("health")}
                className="w-full text-left px-4 py-3 text-[13px] font-medium transition-colors hover:bg-[var(--slds-g-color-background-row-hover)] rounded"
                style={{
                  backgroundColor:
                    activeTab === "health"
                      ? "var(--color-brand-primary)"
                      : "transparent",
                  color:
                    activeTab === "health"
                      ? "white"
                      : "#706e6b",
                }}
              >
                Health
              </button>
              {expandedTabs.includes("health") && (
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "health",
                        "physical-health",
                        "current-medical-needs",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem === "physical-health"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Physical Health
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "health",
                        "mental-health",
                        "mental-health-overview",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem === "mental-health"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Mental Health
                  </button>
                </div>
              )}
            </div>

            {/* Health Overview */}
            <div className="mb-1">
              <button
                onClick={() =>
                  toggleTabExpansion("health-overview")
                }
                className="w-full text-left px-4 py-3 text-[13px] font-medium transition-colors hover:bg-[var(--slds-g-color-background-row-hover)] rounded"
                style={{
                  backgroundColor:
                    activeTab === "health-overview"
                      ? "var(--color-brand-primary)"
                      : "transparent",
                  color:
                    activeTab === "health-overview"
                      ? "white"
                      : "#706e6b",
                }}
              >
                Health Overview
              </button>
              {expandedTabs.includes("health-overview") && (
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "health-overview",
                        "ho-medication",
                        "medications",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem === "ho-medication"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Medication
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "health-overview",
                        "ho-physical",
                        "current-medical-needs",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem === "ho-physical"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Physical Health
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "health-overview",
                        "ho-mental",
                        "mental-health-overview",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem === "ho-mental"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Mental Health
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "health-overview",
                        "ho-substance",
                        "testing",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem === "ho-substance"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Substance Use
                  </button>
                </div>
              )}
            </div>

            {/* Treatment Planning */}
            <div className="mb-1">
              <button
                onClick={() => toggleTabExpansion("treatment")}
                className="w-full text-left px-4 py-3 text-[13px] font-medium transition-colors hover:bg-[var(--slds-g-color-background-row-hover)] rounded"
                style={{
                  backgroundColor:
                    activeTab === "treatment"
                      ? "var(--color-brand-primary)"
                      : "transparent",
                  color:
                    activeTab === "treatment"
                      ? "white"
                      : "#706e6b",
                }}
              >
                Treatment Planning
              </button>
              {expandedTabs.includes("treatment") && (
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "treatment",
                        "positive-transition",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem ===
                      "positive-transition"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Positive Transition Planning
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "treatment",
                        "personal-development",
                        "goals",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem ===
                      "personal-development"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Personal Development
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "treatment",
                        "supplemental-plans",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem ===
                      "supplemental-plans"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Supplemental Plans
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "treatment",
                        "individual-treatment",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem ===
                      "individual-treatment"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Individual Treatment Plan
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "treatment",
                        "transition-planning",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem ===
                      "transition-planning"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Transition Planning
                  </button>
                </div>
              )}
            </div>

            {/* Medications */}
            <div className="mb-1">
              <button
                onClick={() =>
                  toggleTabExpansion("medications")
                }
                className="w-full text-left px-4 py-3 text-[13px] font-medium transition-colors hover:bg-[var(--slds-g-color-background-row-hover)] rounded"
                style={{
                  backgroundColor:
                    activeTab === "medications"
                      ? "var(--color-brand-primary)"
                      : "transparent",
                  color:
                    activeTab === "medications"
                      ? "white"
                      : "#706e6b",
                }}
              >
                Medications
              </button>
              {expandedTabs.includes("medications") && (
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "medications",
                        "medication-overview",
                        "prescriptions",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem ===
                      "medication-overview"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Medication Overview
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "medications",
                        "administration",
                        "pack-meds",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem === "administration"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Administration
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "medications",
                        "compliance",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem === "compliance"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Compliance
                  </button>
                </div>
              )}
            </div>

            {/* Substance Use */}
            <div className="mb-1">
              <button
                onClick={() => toggleTabExpansion("substance")}
                className="w-full text-left px-4 py-3 text-[13px] font-medium transition-colors hover:bg-[var(--slds-g-color-background-row-hover)] rounded"
                style={{
                  backgroundColor:
                    activeTab === "substance"
                      ? "var(--color-brand-primary)"
                      : "transparent",
                  color:
                    activeTab === "substance"
                      ? "white"
                      : "#706e6b",
                }}
              >
                Substance Use
              </button>
              {expandedTabs.includes("substance") && (
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "substance",
                        "substance-overview",
                        "testing",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem ===
                      "substance-overview"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Substance Use Overview
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "substance",
                        "plan-of-action",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem === "plan-of-action"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Plan of Action
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "substance",
                        "substance-history",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem === "substance-history"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    History
                  </button>
                </div>
              )}
            </div>

            {/* Education & Vocation */}
            <div className="mb-1">
              <button
                onClick={() => toggleTabExpansion("education")}
                className="w-full text-left px-4 py-3 text-[13px] font-medium transition-colors hover:bg-[var(--slds-g-color-background-row-hover)] rounded"
                style={{
                  backgroundColor:
                    activeTab === "education"
                      ? "var(--color-brand-primary)"
                      : "transparent",
                  color:
                    activeTab === "education"
                      ? "white"
                      : "#706e6b",
                }}
              >
                Education & Vocation
              </button>
              {expandedTabs.includes("education") && (
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "education",
                        "academic-overview",
                        "academics",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem === "academic-overview"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Academic Overview
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "education",
                        "career-development",
                        "credentials",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem ===
                      "career-development"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Career Development
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "education",
                        "post-secondary",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem === "post-secondary"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Post Secondary Options
                  </button>
                  <button
                    onClick={() =>
                      handleDropdownClick(
                        "education",
                        "tutoring",
                        "tutor-matches",
                      )
                    }
                    className={`w-full text-left pl-6 pr-4 py-1.5 text-[12px] font-medium rounded transition-colors ${
                      activeDropdownItem === "tutoring"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    Tutoring
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main Content */}
          <div
            className="flex-1 overflow-auto"
            style={{
              backgroundColor:
                "var(--slds-g-color-background-alt-2)",
            }}
          >
            {/* Profile & General Info Tab Content */}
            {activeTab === "profile" && (
              <ProfileContentRenderer
                activeDropdownItem={activeDropdownItem}
                activeHorizontalTab={activeHorizontalTab}
                setActiveHorizontalTab={setActiveHorizontalTab}
              />
            )}

            {/* All Other Tabs Content (Program, Health, Treatment, Medications, Substance, Education) */}
            {[
              "program",
              "health",
              "treatment",
              "medications",
              "substance",
              "education",
            ].includes(activeTab) && (
              <OtherTabsContentRenderer
                activeTab={activeTab}
                activeDropdownItem={activeDropdownItem}
                activeHorizontalTab={activeHorizontalTab}
                setActiveHorizontalTab={setActiveHorizontalTab}
                youth={youth}
              />
            )}

            {/* Health Overview Tab — exact replica of Admissions module */}
            {activeTab === "health-overview" && (
              <div className="max-w-6xl">
                {/* Medication sub-section: identical MedicationsSection used by Admissions */}
                {activeDropdownItem === "ho-medication" && (
                  <MedicationsSection youthDisplayName={youth?.name} />
                )}

                {/* Physical Health sub-section: routed through OtherTabsContentRenderer */}
                {activeDropdownItem === "ho-physical" && (
                  <OtherTabsContentRenderer
                    activeTab="health"
                    activeDropdownItem="physical-health"
                    activeHorizontalTab={
                      activeHorizontalTab ||
                      "current-medical-needs"
                    }
                    setActiveHorizontalTab={
                      setActiveHorizontalTab
                    }
                    youth={youth}
                  />
                )}

                {/* Mental Health sub-section: routed through OtherTabsContentRenderer */}
                {activeDropdownItem === "ho-mental" && (
                  <OtherTabsContentRenderer
                    activeTab="health"
                    activeDropdownItem="mental-health"
                    activeHorizontalTab={
                      activeHorizontalTab ||
                      "mental-health-overview"
                    }
                    setActiveHorizontalTab={
                      setActiveHorizontalTab
                    }
                    youth={youth}
                  />
                )}

                {/* Substance Use sub-section: routed through OtherTabsContentRenderer */}
                {activeDropdownItem === "ho-substance" && (
                  <OtherTabsContentRenderer
                    activeTab="substance"
                    activeDropdownItem="substance-overview"
                    activeHorizontalTab={
                      activeHorizontalTab || "testing"
                    }
                    setActiveHorizontalTab={
                      setActiveHorizontalTab
                    }
                    youth={youth}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Program Log youth-row Current Location dot (20043): reads the reactive
// Current Location store; the hover text extends only the Pass case
// ("Pass M/D - M/D" when a Pass's start automation set it).
function ProgramLogLocationDot({
  youth,
}: {
  youth: (typeof YOUTH_STATUS)[0];
}) {
  const { location, label } = useYouthLocation(youth);
  return (
    <div
      className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm"
      style={{
        backgroundColor:
          location === "Onground"
            ? "#00c950"
            : location === "School"
              ? "#ad46ff"
              : location === "Offground"
                ? "#ff6b35"
                : location === "Pass"
                  ? "#fbbf24"
                  : location === "Alert"
                    ? "#ea001e"
                    : "#99a1af",
      }}
      title={label}
    />
  );
}

function ProgramDetailView({
  program,
  onBack,
  onYouthClick,
  onNavigateToYouthDetail,
  onNavigate,
}: {
  program: (typeof MOCK_PROGRAMS)[0];
  onBack: () => void;
  onYouthClick?: (youth: (typeof YOUTH_STATUS)[0]) => void;
  onNavigateToYouthDetail?: (
    youth: (typeof YOUTH_STATUS)[0],
  ) => void;
  onNavigate?: (page: string) => void;
}) {
  // Youth-specific goals data structure
  const [youthGoalsData, setYouthGoalsData] = useState<
    Record<number, any[]>
  >({
    1: [
      // Fozzie Bear
      {
        id: 1,
        goal: "Enhance Emotional Regulation and Mental Health Stability",
        targetDate: "2026-07-15",
        progress: 75,
        status: "On Track",
        category: "Clinical/Behavioral",
        parentId: null,
        goalText:
          "Develop comprehensive emotional regulation skills and achieve mental health stability through evidence-based therapeutic interventions.",
        enrollee: "Fozzie Bear",
        comments: [
          {
            id: 1,
            author: "Dr. Sarah Mitchell",
            date: "Jan 13, 2026",
            time: "3:15 PM",
            text: "Fozzie successfully utilized coping skills during a challenging situation today. Excellent progress on emotional regulation.",
          },
        ],
      },
      {
        id: 2,
        goal: "Maintain Academic Excellence",
        targetDate: "2026-06-01",
        progress: 85,
        status: "On Track",
        category: "Education",
        parentId: null,
        goalText:
          "Maintain consistent academic performance across all subjects with focus on college preparation.",
        enrollee: "Fozzie Bear",
        comments: [],
      },
      {
        id: 3,
        goal: "Develop Peer Leadership Skills",
        targetDate: "2026-05-15",
        progress: 90,
        status: "On Track",
        category: "Social/Peer Leadership",
        parentId: null,
        goalText:
          "Continue mentoring newer residents and lead weekly peer support groups.",
        enrollee: "Fozzie Bear",
        comments: [
          {
            id: 1,
            author: "Michael Chen",
            date: "Jan 10, 2026",
            time: "4:30 PM",
            text: "Fozzie led an excellent peer support session this week. His mentorship of Animal has been particularly effective.",
          },
        ],
      },
    ],
    2: [
      // Kermit the Frog
      {
        id: 4,
        goal: "Improve Family Communication and Relationship Building",
        targetDate: "2026-08-01",
        progress: 65,
        status: "On Track",
        category: "Family Engagement",
        parentId: null,
        goalText:
          "Develop healthier communication patterns with family members and rebuild trust through consistent contact and family therapy sessions.",
        enrollee: "Kermit the Frog",
        comments: [
          {
            id: 1,
            author: "Family Therapist Jane Smith",
            date: "Jan 12, 2026",
            time: "2:00 PM",
            text: "Kermit had a productive family session today. He expressed his feelings constructively and listened actively to his father's perspective.",
          },
        ],
      },
      {
        id: 5,
        goal: "Develop Consistent Medication Adherence",
        targetDate: "2026-04-01",
        progress: 45,
        status: "In Progress",
        category: "Clinical/Behavioral",
        parentId: null,
        goalText:
          "Establish routine for daily medication compliance and understand the importance of psychiatric medication in treatment plan.",
        enrollee: "Kermit the Frog",
        comments: [],
      },
    ],
    3: [
      // Miss Piggy
      {
        id: 6,
        goal: "Reduce Conflict Incidents and Improve Anger Management",
        targetDate: "2026-09-01",
        progress: 40,
        status: "In Progress",
        category: "Clinical/Behavioral",
        parentId: null,
        goalText:
          "Learn and practice anger management techniques to reduce physical altercations and verbal conflicts with peers.",
        enrollee: "Miss Piggy",
        comments: [],
      },
    ],
    4: [
      // Animal
      {
        id: 7,
        goal: "Build Foundation of Emotional Regulation Skills",
        targetDate: "2026-10-01",
        progress: 25,
        status: "In Progress",
        category: "Clinical/Behavioral",
        parentId: null,
        goalText:
          "As a new resident, develop basic emotional awareness and learn initial coping strategies for managing intense emotions.",
        enrollee: "Animal",
        comments: [],
      },
    ],
    5: [
      // Red Fraggle
      {
        id: 8,
        goal: "Academic Support and Learning Skills Development",
        targetDate: "2026-07-01",
        progress: 70,
        status: "On Track",
        category: "Education",
        parentId: null,
        goalText:
          "Improve study habits, time management, and academic performance with focus on math skills.",
        enrollee: "Red Fraggle",
        comments: [],
      },
    ],
    6: [
      // Gonzo the Great
      {
        id: 9,
        goal: "Community Reintegration and Independent Living Skills",
        targetDate: "2026-06-15",
        progress: 80,
        status: "On Track",
        category: "Life Skills/Transition",
        parentId: null,
        goalText:
          "Prepare for independent living through job readiness training, budgeting skills, and community connections.",
        enrollee: "Gonzo the Great",
        comments: [],
      },
    ],
  });

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [handoverDialogOpen, setHandoverDialogOpen] =
    useState(false);
  const [emailSubject, setEmailSubject] = useState(
    "Follow-up: Kermit's Evening Call",
  );
  const [emailBody, setEmailBody] = useState(
    "Hi Jim,\n\nI wanted to follow up on our earlier conversation regarding Kermit. As discussed, we'll make sure Kermit calls home tonight after 7pm.\n\nPlease let me know if you have any questions or concerns.\n\nBest regards,",
  );
  const [handoverNote, setHandoverNote] =
    useState(`SHIFT SUMMARY - ${program.name} - ${formatMdy(new Date())}

CRITICAL ALERTS:
• Heat Advisory in effect - All outdoor activities canceled including 7:00 PM tutoring session
• Kermit the Frog: Parent contact with Jim Henson - REQUIRES evening call home after 7:00 PM (reminder set for 6:55 PM)

YOUTH STATUS (6 residents):
• Onground: Fozzie Bear, Kermit the Frog, Miss Piggy, Animal (4)
• School: Red Fraggle (1)
• Offground: Gonzo the Great (1)

MEDICATION UPDATES:
• Morning: Kermit missed medication (flagged)
• Afternoon: Red Fraggle - Tenex 2.5mg administered successfully
• Pending: Gonzo (Evening), Fozzie & Kermit (Bedtime)

ACTIVITIES & SESSIONS:
• Therapy completed: Fozzie Bear session at 2:30 PM (Therapist Office)
• Academic: Red Fraggle has math homework, requested Learning Center time with Elizabeth Sorice tonight
• Quarterly Testing: YRS completed for Miss Piggy

RECOMMENDED ACTIONS FOR INCOMING SHIFT:
1. Ensure Kermit calls home after 7:00 PM per parent request
2. Monitor heat-related concerns and maintain hydration protocols
3. Support Red Fraggle's homework session in Learning Center
4. Complete pending evening/bedtime medication administration
5. Follow up on Kermit's missed morning medication

NOTES: Care Planning Meeting scheduled for 7:30 PM with Fozzie.`);
  const [isAiGenerated, setIsAiGenerated] = useState(true);
  const [handoverNoteMode, setHandoverNoteMode] = useState<
    "none" | "ai" | "manual"
  >("none");
  const [isGeneratingAiNote, setIsGeneratingAiNote] =
    useState(false);

  // Shift Handover state management
  // Session-only, per Program (US 20185): handovers created here — with
  // their checklist results — survive switching Programs; reload resets.
  const [handovers, setHandovers] = useState<
    ((typeof SHIFT_HANDOVERS)[0] & {
      narrative?: string;
      checklist?: SavedChecklistResult | null;
      staffStatus?: StaffStatusSnapshot | null;
      savedShift?: { key: string; date: string; time: string };
    })[]
  >(() => getSessionHandovers(program.id, () => SHIFT_HANDOVERS));
  // US 20221: handovers state belongs to ONE Program. On a direct Program
  // switch while mounted, load the new Program's list before any write, so
  // one Program's handovers are never stored under another's id.
  const [handoversProgramId, setHandoversProgramId] = useState(program.id);
  if (handoversProgramId !== program.id) {
    setHandoversProgramId(program.id);
    setHandovers(getSessionHandovers(program.id, () => SHIFT_HANDOVERS));
  }
  useEffect(() => {
    if (handoversProgramId === program.id)
      setSessionHandovers(program.id, handovers);
  }, [program.id, handoversProgramId, handovers]);
  const [editingHandoverId, setEditingHandoverId] = useState<
    number | null
  >(null);
  const [viewingHandover, setViewingHandover] = useState<
    (typeof SHIFT_HANDOVERS)[0] | null
  >(null);
  const [viewHandoverDialogOpen, setViewHandoverDialogOpen] =
    useState(false);
  const [
    deleteHandoverDialogOpen,
    setDeleteHandoverDialogOpen,
  ] = useState(false);
  const [handoverToDelete, setHandoverToDelete] = useState<
    number | null
  >(null);
  const [handoverShift, setHandoverShift] = useState("morning");
  const [handoverAuthor, setHandoverAuthor] =
    useState("Staff User");
  const [handoverDate, setHandoverDate] = useState(() => {
    const today = new Date();
    return toLocalIso(today);
  });
  const [handoverTime, setHandoverTime] = useState(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  });
  const [handoverCriticalCount, setHandoverCriticalCount] =
    useState(0);
  const [expandedShiftId, setExpandedShiftId] =
    useState<number>(1); // Track which shift accordion is expanded (default to current shift)

  // Goals state management
  const [viewingYouthGoals, setViewingYouthGoals] = useState<
    (typeof YOUTH_STATUS)[0] | null
  >(null);
  const [viewGoalsDialogOpen, setViewGoalsDialogOpen] =
    useState(false);
  const [goals, setGoals] = useState<any[]>([]);
  const [showAddGoal, setShowAddGoal] = useState<
    "top" | "child" | null
  >(null);
  const [expandedGoals, setExpandedGoals] = useState<number[]>(
    [],
  );
  const [newGoal, setNewGoal] = useState({
    goal: "",
    goalText: "",
    relatedPTPStatement: "",
    reasonForGoal: "",
    pointPersonName: "",
    outcomeDomain: "",
    startDate: "",
    targetDuration: "",
    targetEndDate: "",
    endDate: "",
    goalPercentage: "",
    targetDate: "",
    category: "",
    parentId: null as number | null,
    progress: 0,
    description: "",
    enrollee: "",
    youthNotes: "",
    enrolleeCount: 0,
  });
  const [editingGoalId, setEditingGoalId] = useState<
    number | null
  >(null);
  const [editGoalData, setEditGoalData] = useState({
    goal: "",
    goalText: "",
    relatedPTPStatement: "",
    reasonForGoal: "",
    pointPersonName: "",
    outcomeDomain: "",
    startDate: "",
    targetDuration: "",
    targetEndDate: "",
    endDate: "",
    targetDate: "",
    category: "",
    progress: 0,
    description: "",
    enrollee: "",
    youthNotes: "",
    parentId: null as number | null,
  });
  const [showCommentForm, setShowCommentForm] = useState<
    number | null
  >(null);
  const [newComment, setNewComment] = useState("");

  // Load youth-specific goals when dialog opens
  useEffect(() => {
    if (viewingYouthGoals) {
      const youthGoals =
        youthGoalsData[viewingYouthGoals.id] || [];
      setGoals(youthGoals);
    }
  }, [viewingYouthGoals]);

  // Incident Report state management
  const [incidentDialogOpen, setIncidentDialogOpen] =
    useState(false);
  const [incidentYouth, setIncidentYouth] = useState<
    (typeof YOUTH_STATUS)[0] | null
  >(null);
  const [incidentTab, setIncidentTab] = useState("general");
  const [incidentType, setIncidentType] = useState("");
  const [incidentStartDate, setIncidentStartDate] = useState(
    () => {
      const today = new Date();
      return toLocalIso(today);
    },
  );
  const [incidentStartTime, setIncidentStartTime] = useState(
    () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    },
  );
  const [incidentEndDate, setIncidentEndDate] = useState(() => {
    const today = new Date();
    return toLocalIso(today);
  });
  const [incidentEndTime, setIncidentEndTime] = useState(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  });
  const [incidentLocation, setIncidentLocation] = useState("");
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
  const [incidentParticipants, setIncidentParticipants] =
    useState<
      Array<{
        id: number;
        name: string;
        role: string;
        injured: boolean;
        details: string;
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

  // Filter states
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    [],
  );
  const [selectedAuthors, setSelectedAuthors] = useState<
    string[]
  >([]);
  const [selectedYouthFilter, setSelectedYouthFilter] =
    useState<string[]>([]);
  const [
    selectedObservationFilter,
    setSelectedObservationFilter,
  ] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<
    string[]
  >([]);
  const [dateRangeFilter, setDateRangeFilter] = useState<
    | "all"
    | "last24hours"
    | "last7days"
    | "last30days"
    | "custom"
  >("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // ── Program Log My Tasks (table-based) ─────────────────────────────
  const PL_USER = "Sohan Jadhavrao";
  const PL_TODAY = "06/29/2026";
  const PL_TOMORROW = "06/30/2026";
  const PL_STAFF = [
    "Sohan Jadhavrao",
    "Maria Santos",
    "James Carter",
    "Linda Okafor",
    "David Reyes",
    "Priya Nair",
  ];
  const PL_CONSTITUENTS = [
    "Aarete Test",
    "Marcus Williams",
    "Jordan Lee",
    "Elena Vasquez",
    "Sofia Morales",
    "Tyler Brooks",
  ];

  type PlTaskStatus =
    | "Open"
    | "In Progress"
    | "Completed"
    | "On Hold"
    | "Cancelled";
  type PlHistEntry = {
    id: number;
    type: "log" | "comment";
    timestamp: string;
    author: string;
    field?: string;
    oldValue?: string;
    newValue?: string;
    comment?: string;
  };
  type PlTask = {
    id: number;
    subject: string;
    dueDate: string;
    assignedTo: string;
    relatedTo: string;
    createDate: string;
    modifiedDate: string;
    status: PlTaskStatus;
    createdBy: string;
    isSystem?: boolean;
    history: PlHistEntry[];
  };

  const mkL2 = (
    id: number,
    f: string,
    o: string,
    n: string,
    a = PL_USER,
  ): PlHistEntry => ({
    id,
    type: "log",
    timestamp: "06/29/2026 09:00 AM",
    author: a,
    field: f,
    oldValue: o,
    newValue: n,
  });
  const mkC2 = (
    id: number,
    c: string,
    a = PL_USER,
  ): PlHistEntry => ({
    id,
    type: "comment",
    timestamp: "06/29/2026 09:30 AM",
    author: a,
    comment: c,
  });

  const PL_INIT_TASKS: PlTask[] = [
    {
      id: 201,
      subject: "Complete ITP documentation",
      dueDate: PL_TODAY,
      assignedTo: PL_USER,
      relatedTo: "Aarete Test",
      createDate: "06/20/2026",
      modifiedDate: "06/28/2026",
      status: "Open",
      createdBy: PL_USER,
      history: [
        mkL2(1, "Status", "", "Open"),
        mkC2(
          2,
          "Working on sections 2 and 3. Need supervisor sign-off.",
        ),
      ],
    },
    {
      id: 202,
      subject: "Schedule psychiatric evaluation follow-up",
      dueDate: PL_TOMORROW,
      assignedTo: PL_USER,
      relatedTo: "Marcus Williams",
      createDate: "06/22/2026",
      modifiedDate: "06/27/2026",
      status: "Open",
      createdBy: PL_USER,
      history: [mkL2(1, "Status", "", "Open")],
    },
    {
      id: 203,
      subject: "Review advocate meeting notes",
      dueDate: "07/02/2026",
      assignedTo: PL_USER,
      relatedTo: "Jordan Lee",
      createDate: "06/18/2026",
      modifiedDate: "06/25/2026",
      status: "In Progress",
      createdBy: "Maria Santos",
      history: [
        mkL2(1, "Status", "", "In Progress", "Maria Santos"),
      ],
    },
    {
      id: 204,
      subject: "Update family contact information",
      dueDate: PL_TOMORROW,
      assignedTo: PL_USER,
      relatedTo: "Elena Vasquez",
      createDate: "06/24/2026",
      modifiedDate: "06/28/2026",
      status: "Open",
      createdBy: PL_USER,
      history: [mkL2(1, "Status", "", "Open")],
    },
    {
      id: 205,
      subject: "File therapy session progress report",
      dueDate: "06/30/2026",
      assignedTo: PL_USER,
      relatedTo: "Aarete Test",
      createDate: "06/23/2026",
      modifiedDate: "06/28/2026",
      status: "Open",
      createdBy: PL_USER,
      history: [mkL2(1, "Status", "", "Open")],
    },
    {
      id: 206,
      subject: "ITP Review — Aarete Test (Annual)",
      dueDate: "07/10/2026",
      assignedTo: PL_USER,
      relatedTo: "Aarete Test",
      createDate: "06/01/2026",
      modifiedDate: "06/01/2026",
      status: "Open",
      createdBy: "System",
      isSystem: true,
      history: [mkL2(1, "Status", "", "Open", "System")],
    },
    {
      id: 207,
      subject: "Call Back Follow-Up — Marcus Williams",
      dueDate: PL_TODAY,
      assignedTo: PL_USER,
      relatedTo: "Marcus Williams",
      createDate: "06/28/2026",
      modifiedDate: "06/28/2026",
      status: "Open",
      createdBy: "System",
      isSystem: true,
      history: [mkL2(1, "Status", "", "Open", "System")],
    },
    {
      id: 208,
      subject: "Medication Error Review — Elena Vasquez",
      dueDate: PL_TODAY,
      assignedTo: PL_USER,
      relatedTo: "Elena Vasquez",
      createDate: "06/29/2026",
      modifiedDate: "06/29/2026",
      status: "Open",
      createdBy: "System",
      isSystem: true,
      history: [mkL2(1, "Status", "", "Open", "System")],
    },
    {
      id: 209,
      subject: "CPI Approval Required — Sofia Morales",
      dueDate: PL_TOMORROW,
      assignedTo: PL_USER,
      relatedTo: "Sofia Morales",
      createDate: "06/27/2026",
      modifiedDate: "06/27/2026",
      status: "Open",
      createdBy: "System",
      isSystem: true,
      history: [mkL2(1, "Status", "", "Open", "System")],
    },
  ];

  const PL_CONNECTIONS = [
    {
      id: 1,
      type: "Therapy Session",
      status: "Submitted/Finalized",
      startDate: "06/27/2026",
      participants: "Aarete Test, Sohan Jadhavrao",
      location: "Office",
    },
    {
      id: 2,
      type: "Advocate Meeting",
      status: "Completed",
      startDate: "06/25/2026",
      participants: "Aarete Test, Maria Santos",
      location: "Home Visit",
    },
    {
      id: 3,
      type: "School Meeting",
      status: "Scheduled",
      startDate: "07/02/2026",
      participants: "Aarete Test, Jordan Lee",
      location: "School",
    },
    {
      id: 4,
      type: "Doctor Office Visit",
      status: "Completed",
      startDate: "06/20/2026",
      participants: "Aarete Test",
      location: "Clinic",
    },
    {
      id: 5,
      type: "Parent / Family Contact",
      status: "Incomplete",
      startDate: "06/15/2026",
      participants: "Aarete Test, Elena Vasquez",
      location: "Phone",
    },
    {
      id: 6,
      type: "Milieu Meeting",
      status: "Scheduled",
      startDate: "06/30/2026",
      participants:
        "Aarete Test, Sohan Jadhavrao, Maria Santos",
      location: "Program",
    },
  ];

  function parsePlDate(s: string): Date {
    if (!s) return new Date(0);
    const [m, d, y] = s.split("/").map(Number);
    return new Date(y, m - 1, d);
  }

  const [plTasks, setPlTasks] =
    useState<PlTask[]>(PL_INIT_TASKS);
  const [plHiddenIds, setPlHiddenIds] = useState<Set<number>>(
    new Set(),
  );
  const [plSearch, setPlSearch] = useState("");
  const [plFCStart, setPlFCStart] = useState("");
  const [plFCEnd, setPlFCEnd] = useState("");
  const [plFAssigned, setPlFAssigned] = useState("");
  const [plFRelated, setPlFRelated] = useState("");
  const [plFStatus, setPlFStatus] = useState("");
  const [plAdvanced, setPlAdvanced] = useState(false);
  const [plSortCol, setPlSortCol] = useState<
    | "subject"
    | "dueDate"
    | "assignedTo"
    | "relatedTo"
    | "createDate"
    | "modifiedDate"
    | "status"
  >("dueDate");
  const [plSortDir, setPlSortDir] = useState<"asc" | "desc">(
    "asc",
  );
  const [connDays, setConnDays] = useState(0);
  const [plDetailTask, setPlDetailTask] =
    useState<PlTask | null>(null);
  const [plDS, setPlDS] = useState("");
  const [plDD, setPlDD] = useState("");
  const [plDA, setPlDA] = useState("");
  const [plDR, setPlDR] = useState("");
  const [plDSt, setPlDSt] = useState<PlTaskStatus>("Open");
  const [plComment, setPlComment] = useState("");

  function openPlDetail(t: PlTask) {
    setPlDetailTask(t);
    setPlDS(t.subject);
    setPlDD(t.dueDate);
    setPlDA(t.assignedTo);
    setPlDR(t.relatedTo);
    setPlDSt(t.status);
    setPlComment("");
  }

  function savePlDetail() {
    if (!plDetailTask) return;
    const logs: PlHistEntry[] = [];
    let nid =
      Math.max(...plDetailTask.history.map((h) => h.id), 0) + 1;
    const ts =
      "06/29/2026 " +
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    (
      [
        ["Subject", plDetailTask.subject, plDS],
        ["Due Date", plDetailTask.dueDate, plDD],
        ["Assigned To", plDetailTask.assignedTo, plDA],
        ["Related To", plDetailTask.relatedTo, plDR],
        ["Status", plDetailTask.status, plDSt],
      ] as [string, string, string][]
    ).forEach(([f, o, n]) => {
      if (o !== n)
        logs.push({
          id: nid++,
          type: "log",
          timestamp: ts,
          author: PL_USER,
          field: f,
          oldValue: o,
          newValue: n,
        });
    });
    const u: PlTask = {
      ...plDetailTask,
      subject: plDS,
      dueDate: plDD,
      assignedTo: plDA,
      relatedTo: plDR,
      status: plDSt,
      modifiedDate: PL_TODAY,
      history: [...plDetailTask.history, ...logs],
    };
    setPlTasks((ts2) =>
      ts2.map((t) => (t.id === u.id ? u : t)),
    );
    setPlDetailTask(u);
  }

  function addPlComment() {
    if (!plDetailTask || !plComment.trim()) return;
    const ts =
      "06/29/2026 " +
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    const e: PlHistEntry = {
      id:
        Math.max(...plDetailTask.history.map((h) => h.id), 0) +
        1,
      type: "comment",
      timestamp: ts,
      author: PL_USER,
      comment: plComment.trim(),
    };
    const u: PlTask = {
      ...plDetailTask,
      modifiedDate: PL_TODAY,
      history: [...plDetailTask.history, e],
    };
    setPlTasks((ts2) =>
      ts2.map((t) => (t.id === u.id ? u : t)),
    );
    setPlDetailTask(u);
    setPlComment("");
  }

  function completePlTask() {
    if (!plDetailTask) return;
    const ts =
      "06/29/2026 " +
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    const e: PlHistEntry = {
      id:
        Math.max(...plDetailTask.history.map((h) => h.id), 0) +
        1,
      type: "log",
      timestamp: ts,
      author: PL_USER,
      field: "Status",
      oldValue: plDetailTask.status,
      newValue: "Completed",
    };
    const u: PlTask = {
      ...plDetailTask,
      status: "Completed",
      modifiedDate: PL_TODAY,
      history: [...plDetailTask.history, e],
    };
    setPlTasks((ts2) =>
      ts2.map((t) => (t.id === u.id ? u : t)),
    );
    setPlDetailTask(u);
    setPlDSt("Completed");
  }

  function cancelPlTask() {
    if (!plDetailTask) return;
    const ts =
      "06/29/2026 " +
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    const e: PlHistEntry = {
      id:
        Math.max(...plDetailTask.history.map((h) => h.id), 0) +
        1,
      type: "log",
      timestamp: ts,
      author: PL_USER,
      field: "Status",
      oldValue: plDetailTask.status,
      newValue: "Cancelled",
    };
    const u: PlTask = {
      ...plDetailTask,
      status: "Cancelled",
      modifiedDate: PL_TODAY,
      history: [...plDetailTask.history, e],
    };
    setPlTasks((ts2) =>
      ts2.map((t) => (t.id === u.id ? u : t)),
    );
    setPlDetailTask(u);
    setPlDSt("Cancelled");
  }

  function reopenPlTask() {
    if (!plDetailTask) return;
    const ts =
      "06/29/2026 " +
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    const e: PlHistEntry = {
      id:
        Math.max(...plDetailTask.history.map((h) => h.id), 0) +
        1,
      type: "log",
      timestamp: ts,
      author: PL_USER,
      field: "Status",
      oldValue: plDetailTask.status,
      newValue: "Open",
    };
    const u: PlTask = {
      ...plDetailTask,
      status: "Open",
      modifiedDate: PL_TODAY,
      history: [...plDetailTask.history, e],
    };
    setPlTasks((ts2) =>
      ts2.map((t) => (t.id === u.id ? u : t)),
    );
    setPlDetailTask(u);
    setPlDSt("Open");
  }

  const plFiltered = useMemo(() => {
    let ts = plTasks.filter(
      (t) => !plHiddenIds.has(t.id) && t.assignedTo === PL_USER,
    );
    if (plSearch.trim()) {
      const q = plSearch.toLowerCase();
      ts = ts.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.assignedTo.toLowerCase().includes(q) ||
          t.relatedTo.toLowerCase().includes(q) ||
          t.status.toLowerCase().includes(q),
      );
    }
    if (plFAssigned)
      ts = ts.filter((t) => t.assignedTo === plFAssigned);
    if (plFRelated)
      ts = ts.filter((t) => t.relatedTo === plFRelated);
    if (plFStatus)
      ts = ts.filter((t) => t.status === plFStatus);
    if (plFCStart) {
      const s = parsePlDate(plFCStart);
      ts = ts.filter((t) => parsePlDate(t.createDate) >= s);
    }
    if (plFCEnd) {
      const e = parsePlDate(plFCEnd);
      ts = ts.filter((t) => parsePlDate(t.createDate) <= e);
    }
    const df = ["dueDate", "createDate", "modifiedDate"];
    return [...ts].sort((a, b) => {
      const av = df.includes(plSortCol)
        ? parsePlDate((a as any)[plSortCol])
            .getTime()
            .toString()
        : ((a as any)[plSortCol] as string).toLowerCase();
      const bv = df.includes(plSortCol)
        ? parsePlDate((b as any)[plSortCol])
            .getTime()
            .toString()
        : ((b as any)[plSortCol] as string).toLowerCase();
      return plSortDir === "asc"
        ? av.localeCompare(bv)
        : bv.localeCompare(av);
    });
  }, [
    plTasks,
    plHiddenIds,
    plSearch,
    plFAssigned,
    plFRelated,
    plFStatus,
    plFCStart,
    plFCEnd,
    plSortCol,
    plSortDir,
  ]);

  const connFiltered = useMemo(() => {
    if (connDays === 999) return PL_CONNECTIONS;
    const cutoff = parsePlDate(PL_TODAY);
    cutoff.setDate(cutoff.getDate() + connDays);
    return PL_CONNECTIONS.filter(
      (c) => parsePlDate(c.startDate) <= cutoff,
    );
  }, [connDays]);

  function togglePlSort(col: typeof plSortCol) {
    if (plSortCol === col)
      setPlSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setPlSortCol(col);
      setPlSortDir("asc");
    }
  }

  const PL_BADGE: Record<
    PlTaskStatus,
    { bg: string; color: string }
  > = {
    Open: { bg: "rgba(1,118,211,0.10)", color: "#0176d3" },
    "In Progress": {
      bg: "rgba(20,95,51,0.10)",
      color: "#145F33",
    },
    Completed: { bg: "rgba(44,147,65,0.12)", color: "#2c9341" },
    "On Hold": { bg: "rgba(146,64,14,0.10)", color: "#92400E" },
    Cancelled: { bg: "rgba(194,57,52,0.10)", color: "#c23934" },
  };
  const CONN_BADGE: Record<
    string,
    { bg: string; color: string }
  > = {
    "Submitted/Finalized": {
      bg: "rgba(44,147,65,0.12)",
      color: "#2c9341",
    },
    Completed: { bg: "rgba(20,95,51,0.10)", color: "#145F33" },
    Scheduled: { bg: "rgba(1,118,211,0.10)", color: "#0176d3" },
    Incomplete: {
      bg: "rgba(146,64,14,0.10)",
      color: "#92400E",
    },
    Cancelled: { bg: "rgba(194,57,52,0.10)", color: "#c23934" },
  };

  // Task states
  const [tasks, setTasks] = useState([
    {
      id: 1,
      type: "youth-followup",
      title: "Follow up with specific youth",
      description:
        "Schedule check-in meeting to discuss recent behavioral progress",
      priority: "High Priority",
      priorityColor: {
        bg: "#FEF7E0",
        text: "#705E2E",
        border: "#F4D587",
      },
      dueDate: "Today, 5:00 PM",
      assignedTo: "Assigned to you",
      icon: Clock,
      completed: false,
      youthName: "Red Fraggle",
      followupReason: "Behavioral Progress Review",
      lastContact: "Dec 15, 2025",
      notes:
        "Red has shown significant improvement in anger management. Schedule follow-up to discuss continued progress and next steps.",
    },
    {
      id: 2,
      type: "advocate-meeting",
      title: "Schedule Advocate meeting",
      description:
        "Coordinate with legal advocate for upcoming case review",
      priority: "Urgent",
      priorityColor: {
        bg: "#FEEFEE",
        text: "#8C2016",
        border: "#F89489",
      },
      dueDate: "Tomorrow, 12:00 PM",
      assignedTo: "No meeting scheduled",
      icon: Calendar,
      completed: false,
      advocateName: "Sarah Thompson, Esq.",
      advocatePhone: "(312) 555-0198",
      advocateEmail: "s.thompson@legalaid.org",
      youthName: "Kermit the Frog",
      caseNumber: "CASE-2025-1156",
      meetingPurpose:
        "Quarterly case review and permanency planning discussion",
    },
    {
      id: 3,
      type: "itp-completion",
      title: "Complete ITP",
      description:
        "Finalize Individual Treatment Plan for quarterly review",
      priority: "Medium Priority",
      priorityColor: {
        bg: "#E8F4F8",
        text: "#0B5CAD",
        border: "#8EC8E6",
      },
      dueDate: "Dec 20, 2025",
      assignedTo: "Draft in progress",
      icon: FileText,
      completed: false,
      youthName: "Fozzie Bear",
      reviewPeriod: "Q4 2025",
      sections: [
        { name: "Current Assessment", completed: true },
        { name: "Treatment Goals", completed: true },
        { name: "Intervention Strategies", completed: false },
        { name: "Progress Measurements", completed: false },
        { name: "Discharge Planning", completed: false },
      ],
    },
    {
      id: 4,
      type: "med-cart-review",
      title: "Complete Med Cart review",
      description:
        "Perform monthly medication inventory and expiration check",
      priority: "High Priority",
      priorityColor: {
        bg: "#FEF7E0",
        text: "#705E2E",
        border: "#F4D587",
      },
      dueDate: "Dec 19, 2025",
      assignedTo: "Monthly recurring",
      icon: Pill,
      completed: false,
      reviewType: "Monthly Inventory",
      lastReview: "Nov 19, 2025",
      checklist: [
        {
          item: "Verify medication inventory counts",
          completed: false,
        },
        { item: "Check expiration dates", completed: false },
        {
          item: "Inspect for damaged packaging",
          completed: false,
        },
        {
          item: "Verify controlled substances log",
          completed: false,
        },
        {
          item: "Update medication administration records",
          completed: false,
        },
        {
          item: "Submit review report to nursing supervisor",
          completed: false,
        },
      ],
    },
  ]);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Task-specific states
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [meetingNotes, setMeetingNotes] = useState("");

  // New Task Dialog states
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] =
    useState("");
  const [newTaskPriority, setNewTaskPriority] = useState(
    "Medium Priority",
  );
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState(
    "Assigned to you",
  );

  // Youth states
  const [youthDetailOpen, setYouthDetailOpen] = useState(false);
  const [selectedYouth, setSelectedYouth] = useState<
    (typeof YOUTH_STATUS)[0] | null
  >(null);

  // Youth Observation Dialog states
  const [observationDialogOpen, setObservationDialogOpen] =
    useState(false);
  const [observationYouth, setObservationYouth] = useState<
    (typeof YOUTH_STATUS)[0] | null
  >(null);
  const [observationLocation, setObservationLocation] =
    useState("Onground");
  const [locationComments, setLocationComments] = useState("");
  const [selectedObservations, setSelectedObservations] =
    useState<string[]>([]);
  const [observationComments, setObservationComments] =
    useState("");

  // Event states
  const [eventDetailOpen, setEventDetailOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<
    (typeof EVENTS)[0] | null
  >(null);
  const [showExpandedDetails, setShowExpandedDetails] =
    useState(false);

  // Behavioral youth states
  const [expandedYouth, setExpandedYouth] = useState<
    string | null
  >(null);

  // Shift filter state
  const [selectedShift, setSelectedShift] = useState("all");

  // New Entry states
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [newEntryType, setNewEntryType] = useState(
    "Communication Log",
  );
  const [newEntryLogType, setNewEntryLogType] =
    useState("Milieu Observation");
  const [newEntryContent, setNewEntryContent] = useState("");
  const [newEntryPriority, setNewEntryPriority] =
    useState("Medium");
  const [newEntryTags, setNewEntryTags] = useState<string[]>(
    [],
  );
  const [newEntryYouth, setNewEntryYouth] = useState<string[]>(
    [],
  );
  const [newEntryProgramTeam, setNewEntryProgramTeam] =
    useState<string[]>([]);
  const [newEntryOther, setNewEntryOther] = useState<string[]>(
    [],
  );
  const [newEntryFiles, setNewEntryFiles] = useState<File[]>(
    [],
  );
  const [isDragging, setIsDragging] = useState(false);
  const [youthSearchQuery, setYouthSearchQuery] = useState("");
  const [programTeamSearchQuery, setProgramTeamSearchQuery] =
    useState("");
  const [otherSearchQuery, setOtherSearchQuery] = useState("");
  const [logFeedData, setLogFeedData] = useState(LOG_FEED);
  const shiftRoleState = useShiftRoleState();
  // US 20222 fix: the writable Youth strip is THIS Program's active youth.
  const programYouth = useProgramYouthStrip(Number(program.id), program.name);
  const manualLogRead = useManualLogEntries();
  const generatedLogEvents = useGeneratedEvents();
  const [newEntryDate, setNewEntryDate] = useState(() => {
    const today = new Date();
    return toLocalIso(today);
  });
  const [newEntryTime, setNewEntryTime] = useState(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  });
  const [externalIndividuals, setExternalIndividuals] =
    useState<string[]>([]);
  const [externalIndividualInput, setExternalIndividualInput] =
    useState("");

  // Connections Dialog states
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const [connectionType, setConnectionType] = useState(
    "Advocate Meeting",
  );
  const [connectionStartDate, setConnectionStartDate] =
    useState(() => {
      const today = new Date();
      return toLocalIso(today);
    });
  const [connectionEndDate, setConnectionEndDate] = useState(
    () => {
      const today = new Date();
      return toLocalIso(today);
    },
  );
  const [connectionRecurring, setConnectionRecurring] =
    useState(false);
  const [connectionCadence, setConnectionCadence] = useState<
    "daily" | "weekly" | "biweekly"
  >("weekly");
  const [connectionRepeatType, setConnectionRepeatType] =
    useState<"none" | "daily" | "weekly" | "monthly">("none");
  const [
    connectionRepeatInterval,
    setConnectionRepeatInterval,
  ] = useState<number>(1);
  const [connectionDaysOfWeek, setConnectionDaysOfWeek] =
    useState<string[]>([]);
  const [connectionEndType, setConnectionEndType] = useState<
    "never" | "on" | "after"
  >("never");
  const [connectionOccurrences, setConnectionOccurrences] =
    useState<number>(1);
  const [connectionStartTime, setConnectionStartTime] =
    useState(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    });
  const [connectionEndTime, setConnectionEndTime] = useState(
    () => {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    },
  );
  const [connectionYouth, setConnectionYouth] = useState<
    string[]
  >([]);
  const [connectionLocation, setConnectionLocation] =
    useState("");
  const [
    connectionTransitionRelated,
    setConnectionTransitionRelated,
  ] = useState(false);
  const [connectionHomeVisit, setConnectionHomeVisit] =
    useState(false);
  const [connectionSession, setConnectionSession] =
    useState("");
  const [connectionGoals, setConnectionGoals] = useState<
    Array<{ id: string; text: string; checked: boolean }>
  >([
    {
      id: "1",
      text: "Improve emotional regulation skills",
      checked: false,
    },
    {
      id: "2",
      text: "Develop healthy coping strategies",
      checked: false,
    },
    {
      id: "3",
      text: "Strengthen family relationships",
      checked: false,
    },
    {
      id: "4",
      text: "Improve school attendance and performance",
      checked: false,
    },
  ]);
  const [connectionNewGoal, setConnectionNewGoal] =
    useState("");

  // Coping Skills, Triggers, Strengths
  const [connectionCopingSkills, setConnectionCopingSkills] =
    useState<
      Array<{ id: string; text: string; checked: boolean }>
    >([
      {
        id: "1",
        text: "Deep breathing exercises",
        checked: false,
      },
      {
        id: "2",
        text: "Physical activity/exercise",
        checked: false,
      },
      { id: "3", text: "Journaling", checked: false },
      {
        id: "4",
        text: "Talking to a trusted person",
        checked: false,
      },
      { id: "5", text: "Listening to music", checked: false },
      {
        id: "6",
        text: "Mindfulness/meditation",
        checked: false,
      },
    ]);
  const [
    connectionNewCopingSkill,
    setConnectionNewCopingSkill,
  ] = useState("");

  const [connectionTriggers, setConnectionTriggers] = useState<
    Array<{ id: string; text: string; checked: boolean }>
  >([
    { id: "1", text: "Conflict with peers", checked: false },
    { id: "2", text: "Academic stress", checked: false },
    { id: "3", text: "Family issues", checked: false },
    { id: "4", text: "Sleep deprivation", checked: false },
    { id: "5", text: "Loud noises", checked: false },
    { id: "6", text: "Crowded spaces", checked: false },
  ]);
  const [connectionNewTrigger, setConnectionNewTrigger] =
    useState("");

  const [connectionStrengths, setConnectionStrengths] =
    useState<
      Array<{ id: string; text: string; checked: boolean }>
    >([
      {
        id: "1",
        text: "Good communication skills",
        checked: false,
      },
      {
        id: "2",
        text: "Creative/artistic abilities",
        checked: false,
      },
      { id: "3", text: "Resilient/determined", checked: false },
      { id: "4", text: "Empathetic/caring", checked: false },
      { id: "5", text: "Leadership qualities", checked: false },
      {
        id: "6",
        text: "Problem-solving skills",
        checked: false,
      },
    ]);
  const [connectionNewStrength, setConnectionNewStrength] =
    useState("");

  // Meeting Summary
  const [
    connectionMeetingSummary,
    setConnectionMeetingSummary,
  ] = useState("");

  // Other Meeting Attendees
  const [
    connectionOtherAttendees,
    setConnectionOtherAttendees,
  ] = useState<string[]>([]);

  // Advocate Meeting Likert Scale Questions
  const [advocateQuestion1, setAdvocateQuestion1] =
    useState<number>(3); // Default to neutral
  const [advocateQuestion2, setAdvocateQuestion2] =
    useState<number>(3);
  const [advocateQuestion3, setAdvocateQuestion3] =
    useState<number>(3);

  // Milieu Meeting specific states
  const [milieuYouthAttendance, setMilieuYouthAttendance] =
    useState<Record<string, boolean>>({});
  const [milieuYouthNotes, setMilieuYouthNotes] = useState<
    Record<string, string>
  >({});
  const [milieuYouthObservations, setMilieuYouthObservations] =
    useState<Record<string, string[]>>({});
  const [milieuThemesAddressed, setMilieuThemesAddressed] =
    useState("");

  // Available observation tags for milieu meetings
  const availableObservations = [
    "Engaged",
    "Active Participant",
    "Quiet",
    "Listening",
    "Sharing",
    "Distracted",
    "Needs Redirection",
    "Energetic",
    "Expressive",
    "Focused",
    "Thoughtful",
    "Cooperative",
    "Withdrawn",
  ];

  // IR Dialog states
  const [irOpen, setIrOpen] = useState(false);
  const [irType, setIrType] = useState("Behavioral");
  const [irSeverity, setIrSeverity] = useState("Medium");
  const [irDate, setIrDate] = useState(() => {
    const today = new Date();
    return toLocalIso(today);
  });
  const [irTime, setIrTime] = useState(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  });
  const [irLocation, setIrLocation] = useState("");
  const [irYouthInvolved, setIrYouthInvolved] = useState<
    string[]
  >([]);
  const [irStaffInvolved, setIrStaffInvolved] = useState<
    string[]
  >([]);
  const [irDescription, setIrDescription] = useState("");
  const [irImmediateAction, setIrImmediateAction] =
    useState("");
  const [irFollowUp, setIrFollowUp] = useState("");
  const [irNotificationRequired, setIrNotificationRequired] =
    useState(false);
  const [irNotifiedParties, setIrNotifiedParties] = useState<
    string[]
  >([]);

  // @mention states for youth tagging
  const [mentionInput, setMentionInput] = useState("");
  const [showMentionDropdown, setShowMentionDropdown] =
    useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [selectedMentionIndex, setSelectedMentionIndex] =
    useState(0);

  // Comment states
  const [expandedComments, setExpandedComments] = useState<
    Record<number, boolean>
  >({});
  const [showAllComments, setShowAllComments] = useState<
    Record<number, boolean>
  >({});
  const [newCommentText, setNewCommentText] = useState<
    Record<number, string>
  >({});

  // Edit states for one-time editing
  const [editingLogId, setEditingLogId] = useState<
    number | null
  >(null);
  const [editedContent, setEditedContent] =
    useState<string>("");
  const [editedLogs, setEditedLogs] = useState<Set<number>>(
    new Set(),
  );

  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<
    (typeof LOG_FEED)[0] | null
  >(null);
  const [editEntryLogType, setEditEntryLogType] = useState("");
  const [editEntryDate, setEditEntryDate] = useState("");
  const [editEntryTime, setEditEntryTime] = useState("");
  const [editEntryPriority, setEditEntryPriority] = useState<
    "Low" | "Medium" | "High"
  >("Low");
  const [editEntryContent, setEditEntryContent] = useState("");
  const [editEntryYouth, setEditEntryYouth] = useState<
    string[]
  >([]);
  const [editEntryProgramTeam, setEditEntryProgramTeam] =
    useState<string[]>([]);
  const [editEntryOther, setEditEntryOther] = useState<
    string[]
  >([]);
  const [editEntryTags, setEditEntryTags] = useState<string[]>(
    [],
  );
  const [editEntryAttachments, setEditEntryAttachments] =
    useState<File[]>([]);

  // State to track which log entries have their original content expanded
  const [expandedOriginals, setExpandedOriginals] = useState<
    Set<number>
  >(new Set());

  // View log entry detail states
  const [viewingLogEntry, setViewingLogEntry] = useState<
    (typeof LOG_FEED)[0] | null
  >(null);
  const [viewLogEntryDialogOpen, setViewLogEntryDialogOpen] =
    useState(false);

  // Therapy detail dialog states
  const [therapyDetailOpen, setTherapyDetailOpen] =
    useState(false);
  const [selectedTherapyEntry, setSelectedTherapyEntry] =
    useState<(typeof LOG_FEED)[0] | null>(null);

  // Helper functions
  const getCurrentDate = () => {
    const today = new Date();
    return toLocalIso(today);
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Goal handler functions
  const calculateOverallProgress = () => {
    const parentGoals = goals.filter(
      (g) => g.parentId === null,
    );
    if (parentGoals.length === 0) return 0;
    const totalProgress = parentGoals.reduce(
      (sum, goal) => sum + goal.progress,
      0,
    );
    return Math.round(totalProgress / parentGoals.length);
  };

  const handleDeleteGoal = (id: number) => {
    if (!viewingYouthGoals) return;
    const goal = goals.find((g) => g.id === id);
    const updatedGoals =
      goal && goal.parentId === null
        ? goals.filter((g) => g.id !== id && g.parentId !== id)
        : goals.filter((g) => g.id !== id);

    setGoals(updatedGoals);
    setYouthGoalsData({
      ...youthGoalsData,
      [viewingYouthGoals.id]: updatedGoals,
    });
  };

  const handleEditGoal = (id: number) => {
    const goal = goals.find((g) => g.id === id);
    if (goal) {
      setEditingGoalId(id);
      setEditGoalData({
        goal: goal.goal,
        goalText: goal.goalText || "",
        relatedPTPStatement: goal.relatedPTPStatement || "",
        reasonForGoal: goal.reasonForGoal || "",
        pointPersonName: goal.pointPersonName || "",
        outcomeDomain: goal.outcomeDomain || "",
        startDate: goal.startDate || "",
        targetDuration: goal.targetDuration || "",
        targetEndDate: goal.targetEndDate || "",
        endDate: goal.endDate || "",
        targetDate: goal.targetDate,
        category: goal.category,
        progress: goal.progress,
        description: goal.description || "",
        enrollee: goal.enrollee || "",
        youthNotes: goal.youthNotes || "",
        parentId: goal.parentId,
      });
    }
  };

  const handleSaveGoal = () => {
    if (
      !editGoalData.goal ||
      !editGoalData.targetDate ||
      !viewingYouthGoals
    )
      return;

    const updatedGoals = goals.map((g) => {
      if (g.id === editingGoalId) {
        return {
          ...g,
          goal: editGoalData.goal,
          goalText: editGoalData.goalText,
          relatedPTPStatement: editGoalData.relatedPTPStatement,
          reasonForGoal: editGoalData.reasonForGoal,
          pointPersonName: editGoalData.pointPersonName,
          outcomeDomain: editGoalData.outcomeDomain,
          startDate: editGoalData.startDate,
          targetDuration: editGoalData.targetDuration,
          targetEndDate: editGoalData.targetEndDate,
          endDate: editGoalData.endDate,
          targetDate: editGoalData.targetDate,
          category: editGoalData.category,
          progress: editGoalData.progress,
          description: editGoalData.description,
          enrollee: editGoalData.enrollee,
          youthNotes: editGoalData.youthNotes,
          status: "Active",
        };
      }
      return g;
    });

    setGoals(updatedGoals);
    setYouthGoalsData({
      ...youthGoalsData,
      [viewingYouthGoals.id]: updatedGoals,
    });
    setEditingGoalId(null);
    setEditGoalData({
      goal: "",
      goalText: "",
      relatedPTPStatement: "",
      reasonForGoal: "",
      pointPersonName: "",
      outcomeDomain: "",
      startDate: "",
      targetDuration: "",
      targetEndDate: "",
      endDate: "",
      targetDate: "",
      category: "",
      progress: 0,
      description: "",
      enrollee: "",
      youthNotes: "",
      parentId: null,
    });
  };

  const handleCancelEditGoal = () => {
    setEditingGoalId(null);
    setEditGoalData({
      goal: "",
      goalText: "",
      relatedPTPStatement: "",
      reasonForGoal: "",
      pointPersonName: "",
      outcomeDomain: "",
      startDate: "",
      targetDuration: "",
      targetEndDate: "",
      endDate: "",
      targetDate: "",
      category: "",
      progress: 0,
      description: "",
      enrollee: "",
      youthNotes: "",
      parentId: null,
    });
  };

  const handleAddGoal = () => {
    if (
      !newGoal.goal ||
      !newGoal.targetDate ||
      !viewingYouthGoals
    )
      return;

    // Generate new ID across all youth goals
    const allGoalIds = Object.values(youthGoalsData)
      .flat()
      .map((g) => g.id);
    const newId =
      allGoalIds.length > 0 ? Math.max(...allGoalIds) + 1 : 1;

    const goalToAdd = {
      ...newGoal,
      id: newId,
      status: "Active",
      comments: [],
    };

    const updatedGoals = [...goals, goalToAdd];
    setGoals(updatedGoals);
    setYouthGoalsData({
      ...youthGoalsData,
      [viewingYouthGoals.id]: updatedGoals,
    });
    setNewGoal({
      goal: "",
      goalText: "",
      relatedPTPStatement: "",
      reasonForGoal: "",
      pointPersonName: "",
      outcomeDomain: "",
      startDate: "",
      targetDuration: "",
      targetEndDate: "",
      endDate: "",
      goalPercentage: "",
      targetDate: "",
      category: "",
      parentId: null,
      progress: 0,
      description: "",
      enrollee: viewingYouthGoals?.name || "",
      youthNotes: "",
      enrolleeCount: 0,
    });
    setShowAddGoal(null);
  };

  const handleAddComment = (goalId: number) => {
    if (!newComment.trim() || !viewingYouthGoals) return;

    const updatedGoals = goals.map((g) => {
      if (g.id === goalId) {
        const comments = g.comments || [];
        return {
          ...g,
          comments: [
            ...comments,
            {
              id: comments.length + 1,
              author: "Staff User",
              date: formatMdy(new Date()),
              time: new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
              text: newComment,
            },
          ],
        };
      }
      return g;
    });

    setGoals(updatedGoals);
    setYouthGoalsData({
      ...youthGoalsData,
      [viewingYouthGoals.id]: updatedGoals,
    });
    setNewComment("");
    setShowCommentForm(null);
  };

  // US 20221/20222/20223 — rows projected from committed sources for THIS
  // Program: Staff Member Status + manual entries (durable), generated
  // Location/Incident events and saved handovers (session).
  const staffStatusFeed = projectProgramLogFeed({
    programId: Number(program.id),
    staffStatus: shiftRoleState.status === "ok" ? shiftRoleState.statusEntries : [],
    manual: manualLogRead.status === "ok" ? manualLogRead.entries : [],
    generated: generatedLogEvents,
    handovers,
  });
  // Filters list every recorded type (manual, generated and legacy).
  const logTypes = Array.from(
    new Set([...staffStatusFeed, ...(logFeedData || [])].map((log) => log.type)),
  );
  const authors = Array.from(
    new Set([...staffStatusFeed, ...(logFeedData || [])].map((log) => log.author)),
  );

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type],
    );
  };

  const toggleAuthor = (author: string) => {
    setSelectedAuthors((prev) =>
      prev.includes(author)
        ? prev.filter((a) => a !== author)
        : [...prev, author],
    );
  };

  const toggleYouthFilter = (youthName: string) => {
    setSelectedYouthFilter((prev) =>
      prev.includes(youthName)
        ? prev.filter((y) => y !== youthName)
        : [...prev, youthName],
    );
  };

  const toggleObservationFilter = (observation: string) => {
    setSelectedObservationFilter((prev) =>
      prev.includes(observation)
        ? prev.filter((o) => o !== observation)
        : [...prev, observation],
    );
  };

  const togglePriority = (priority: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority],
    );
  };

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedAuthors([]);
    setSelectedYouthFilter([]);
    setSelectedObservationFilter([]);
    setSelectedPriorities([]);
    setDateRangeFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  // Filter shift handovers based on selected shift and date range
  const filteredHandovers = handovers.filter((handover) => {
    // Shift filter
    let passesShiftFilter = true;
    if (selectedShift !== "all") {
      if (selectedShift === "morning")
        passesShiftFilter =
          handover.shift === "Morning (7A - 3P)";
      else if (selectedShift === "afternoon")
        passesShiftFilter =
          handover.shift === "Afternoon (3P - 11P)";
      else if (selectedShift === "night")
        passesShiftFilter =
          handover.shift === "Night (11P - 7A)";
    }

    // Date range filter
    let passesDateFilter = true;
    if (dateRangeFilter !== "all") {
      const handoverDate = new Date(
        handover.date + " " + handover.time,
      );
      const now = new Date();

      if (dateRangeFilter === "last24hours") {
        const twentyFourHoursAgo = new Date(
          now.getTime() - 24 * 60 * 60 * 1000,
        );
        passesDateFilter = handoverDate >= twentyFourHoursAgo;
      } else if (dateRangeFilter === "last7days") {
        const sevenDaysAgo = new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000,
        );
        passesDateFilter = handoverDate >= sevenDaysAgo;
      } else if (
        dateRangeFilter === "custom" &&
        customStartDate &&
        customEndDate
      ) {
        const startDate = new Date(customStartDate);
        const endDate = new Date(customEndDate + " 23:59:59");
        passesDateFilter =
          handoverDate >= startDate && handoverDate <= endDate;
      }
    }

    return passesShiftFilter && passesDateFilter;
  });

  // Handover CRUD functions
  const handleGenerateAiNote = () => {
    setIsGeneratingAiNote(true);

    // Simulate AI generation with realistic handover note
    setTimeout(() => {
      const aiGeneratedNote = `SHIFT SUMMARY - ${program.name} - ${formatMdy(new Date())}

CRITICAL ALERTS:
• Heat Advisory in effect - All outdoor activities canceled including 7:00 PM tutoring session
• Kermit the Frog: Parent contact with Jim Henson - REQUIRES evening call home after 7:00 PM (reminder set for 6:55 PM)

YOUTH STATUS (6 residents):
• Onground: Fozzie Bear, Kermit the Frog, Miss Piggy, Animal (4)
• School: Red Fraggle (1)
• Offground: Gonzo the Great (1)

MEDICATION UPDATES:
• Morning: Kermit missed medication (flagged)
• Afternoon: Red Fraggle - Tenex 2.5mg administered successfully
• Pending: Gonzo (Evening), Fozzie & Kermit (Bedtime)

ACTIVITIES & SESSIONS:
• Therapy completed: Fozzie Bear session at 2:30 PM (Therapist Office)
• Academic: Red Fraggle has math homework, requested Learning Center time with Elizabeth Sorice tonight
• Quarterly Testing: YRS completed for Miss Piggy

RECOMMENDED ACTIONS FOR INCOMING SHIFT:
1. Ensure Kermit calls home after 7:00 PM per parent request
2. Monitor heat-related concerns and maintain hydration protocols
3. Support Red Fraggle's homework session in Learning Center
4. Complete pending evening/bedtime medication administration
5. Follow up on Kermit's missed morning medication

NOTES: Care Planning Meeting scheduled for 7:30 PM with Fozzie.`;

      setHandoverNote(aiGeneratedNote);
      setHandoverNoteMode("ai");
      setIsGeneratingAiNote(false);
    }, 1500); // 1.5 second delay to simulate AI processing
  };

  /** `extra` comes from the Create/Edit dialog: the reviewed summary
   *  (narrative + checklist block), the narrative alone, and the frozen
   *  checklist results (US 20185). */
  const handleSaveHandover = (extra?: {
    summary: string;
    narrative: string;
    checklist: SavedChecklistResult | null;
    staffStatus?: StaffStatusSnapshot | null;
  }) => {
    const summary = extra?.summary ?? handoverNote;
    const shiftMap: Record<string, string> = {
      morning: "Morning (7A - 3P)",
      afternoon: "Afternoon (3P - 11P)",
      evening: "Night (11P - 7A)",
      night: "Night (11P - 7A)",
    };

    const dateObj = new Date(handoverDate + "T" + handoverTime);
    const formattedDate = formatMdy(dateObj);
    const formattedTime = dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    if (editingHandoverId) {
      // Update existing handover
      setHandovers((prev) =>
        prev.map((h) =>
          h.id === editingHandoverId
            ? {
                ...h,
                shift:
                  shiftMap[handoverShift] ||
                  "Morning (7A - 3P)",
                date: formattedDate,
                time: formattedTime,
                author: handoverAuthor,
                timestamp: formattedTime,
                summary,
                narrative: extra?.narrative ?? handoverNote,
                checklist: extra ? extra.checklist : h.checklist,
                staffStatus: extra ? (extra.staffStatus ?? null) : h.staffStatus,
                // US 20222: the same handover keeps its one feed row.
                savedShift: { key: handoverShift, date: handoverDate, time: handoverTime },
                aiGenerated:
                  h.aiGenerated || handoverNoteMode === "ai",
                criticalCount: handoverCriticalCount,
              }
            : h,
        ),
      );
    } else {
      // Create new handover
      const newHandover = {
        id: Math.max(...handovers.map((h) => h.id), 0) + 1,
        shift: shiftMap[handoverShift] || "Morning (7A - 3P)",
        date: formattedDate,
        time: formattedTime,
        author: handoverAuthor,
        role: "Staff Member",
        timestamp: formattedTime,
        summary,
        narrative: extra?.narrative ?? handoverNote,
        checklist: extra?.checklist ?? null,
        staffStatus: extra?.staffStatus ?? null,
        savedShift: { key: handoverShift, date: handoverDate, time: handoverTime },
        criticalCount: handoverCriticalCount,
        aiGenerated: handoverNoteMode === "ai",
      };
      setHandovers((prev) => [newHandover, ...prev]);
    }

    // Reset form
    setHandoverDialogOpen(false);
    setEditingHandoverId(null);
    setHandoverNote("");
    setHandoverShift("morning");
    setHandoverAuthor("Staff User");
    setHandoverDate(getCurrentDate());
    setHandoverTime(getCurrentTime());
    setHandoverCriticalCount(0);
    setHandoverNoteMode("none");
    setIsGeneratingAiNote(false);
  };

  const handleEditHandover = (
    handover: (typeof SHIFT_HANDOVERS)[0],
  ) => {
    setEditingHandoverId(handover.id);
    // Restore the staff narrative only; the checklist block is rebuilt
    // from the recorded results, so it is never duplicated.
    setHandoverNote(
      (handover as { narrative?: string }).narrative ?? handover.summary,
    );
    setHandoverCriticalCount(handover.criticalCount);
    setHandoverAuthor(handover.author);

    // Parse shift
    if (handover.shift.includes("Morning"))
      setHandoverShift("morning");
    else if (handover.shift.includes("Afternoon"))
      setHandoverShift("afternoon");
    else if (handover.shift.includes("Night"))
      setHandoverShift("night");

    // Parse date and time
    const dateMatch = handover.date.match(
      /(\w+)\s+(\d+),\s+(\d+)/,
    );
    // Saved handovers use MM/DD/YYYY; older ones a long date.
    const mdy = handover.date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mdy) {
      setHandoverDate(
        `${mdy[3]}-${mdy[1].padStart(2, "0")}-${mdy[2].padStart(2, "0")}`,
      );
    } else if (dateMatch) {
      const monthMap: Record<string, string> = {
        January: "01",
        February: "02",
        March: "03",
        April: "04",
        May: "05",
        June: "06",
        July: "07",
        August: "08",
        September: "09",
        October: "10",
        November: "11",
        December: "12",
      };
      const month = monthMap[dateMatch[1]];
      const day = dateMatch[2].padStart(2, "0");
      const year = dateMatch[3];
      setHandoverDate(`${year}-${month}-${day}`);
    }

    // Parse time
    const timeMatch = handover.timestamp.match(
      /(\d+):(\d+)\s*(AM|PM)/,
    );
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2];
      const period = timeMatch[3];

      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;

      setHandoverTime(
        `${String(hours).padStart(2, "0")}:${minutes}`,
      );
    }

    setHandoverNoteMode("manual"); // Set to manual when editing existing note
    setHandoverDialogOpen(true);
  };

  const handleDeleteHandover = (id: number) => {
    setHandoverToDelete(id);
    setDeleteHandoverDialogOpen(true);
  };

  const confirmDeleteHandover = () => {
    if (handoverToDelete) {
      setHandovers((prev) =>
        prev.filter((h) => h.id !== handoverToDelete),
      );
      setDeleteHandoverDialogOpen(false);
      setHandoverToDelete(null);
    }
  };

  const handleViewHandover = (
    handover: (typeof SHIFT_HANDOVERS)[0],
  ) => {
    setViewingHandover(handover);
    setViewHandoverDialogOpen(true);
  };

  const handleViewGoals = (youth: (typeof YOUTH_STATUS)[0]) => {
    setViewingYouthGoals(youth);
    setViewGoalsDialogOpen(true);
  };

  const handleNewHandover = () => {
    setEditingHandoverId(null);
    setHandoverNote("");
    setHandoverNoteMode("none");
    setHandoverShift("morning");
    setHandoverAuthor("Staff User");
    setHandoverDate(getCurrentDate());
    setHandoverTime(getCurrentTime());
    setHandoverCriticalCount(0);
    setHandoverDialogOpen(true);
  };

  const toggleTaskCompletion = (taskId: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task,
      ),
    );
  };

  const openTaskDetail = (task: (typeof MY_TASKS)[0]) => {
    setSelectedTask(task);
    setTaskDetailOpen(true);
  };

  const isTaskOverdue = (dueDate: string) => {
    if (!dueDate) return false;

    const today = new Date("2024-06-25"); // Using consistent date from the scenario

    // Handle old format like "6/25"
    if (dueDate.includes("/")) {
      const [month, day] = dueDate.split("/");
      const taskDate = new Date(
        2024,
        parseInt(month) - 1,
        parseInt(day),
      );
      return taskDate < today;
    }

    // New format - for now, return false since we can't parse complex formats
    // Like "Today, 5:00 PM" or "Dec 20, 2025"
    return false;
  };

  const openYouthDetail = (youth: (typeof YOUTH_STATUS)[0]) => {
    if (onYouthClick) {
      onYouthClick(youth);
    } else {
      // The dialog's Location starts at the youth's live Current Location.
      const live =
        getYouthLocation(youthLocationKey(youth))?.location ??
        youth.status;
      setObservationYouth({ ...youth, status: live });
      setObservationLocation(live);
      setObservationDialogOpen(true);
    }
  };

  const toggleObservation = (observation: string) => {
    setSelectedObservations((prev) =>
      prev.includes(observation)
        ? prev.filter((o) => o !== observation)
        : [...prev, observation],
    );
  };

  const handleSaveObservation = () => {
    if (!observationYouth) return;
    // US 20222 fix: recheck the youth's ACTIVE enrollment in this Program
    // before writing anything; the dialog stays open with its values.
    if (!isYouthWritableInProgram(observationYouth as { constituentId?: number }, Number(program.id))) {
      toast.error("Observation not saved", {
        description: `${observationYouth.name} is no longer actively enrolled in ${program.name}, so their location can't be updated here. Your entries are kept.`,
      });
      return;
    }

    // Format the current time for display
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Build the observation content
    let content = `Observation of ${observationYouth.name}. Location: ${observationLocation}.`;

    if (locationComments.trim()) {
      content += ` Location notes: ${locationComments}.`;
    }

    if (selectedObservations.length > 0) {
      content += ` ${selectedObservations.join(", ")}.`;
    }

    if (observationComments.trim()) {
      content += ` ${observationComments}`;
    }

    // Create new log entry
    const newLogEntry = {
      id: logFeedData.length + 1,
      author: "Staff User", // You can replace with actual logged-in user
      type: "Observation",
      title: "logged a Observation",
      time: timeString,
      content: content,
      badges: [observationYouth.name],
      // The selected observation values (string[]), kept for filtering.
      observations: [...selectedObservations],
      icon: Eye,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      details: observationYouth.name, // For filtering by youth
    };

    // Add to log feed at the beginning (most recent first)
    setLogFeedData((prev) => [newLogEntry, ...prev]);

    // A changed Location is a manual Current Location edit (clears any Pass
    // association); an unchanged one leaves the stored location untouched.
    const key = youthLocationKey(observationYouth);
    const currentLocation =
      getYouthLocation(key)?.location ?? DEFAULT_YOUTH_LOCATION;
    if (observationLocation !== currentLocation)
      setYouthLocation(key, observationLocation, {
        source: "manual",
        // Explicit Program context: the Location row belongs to it.
        programId: Number(program.id),
      });

    // Reset and close dialog
    setObservationDialogOpen(false);
    setObservationLocation("Onground");
    setLocationComments("");
    setSelectedObservations([]);
    setObservationComments("");
    setObservationYouth(null);
  };

  const getYouthRecentLogs = (youthName: string) => {
    return logFeedData
      .filter(
        (log) =>
          log.details &&
          log.details
            .toLowerCase()
            .includes(youthName.toLowerCase().split(" ")[0]),
      )
      .slice(0, 3);
  };

  const openEventDetail = (event: (typeof EVENTS)[0]) => {
    setSelectedEvent(event);
    setEventDetailOpen(true);
    setShowExpandedDetails(false);
  };

  const handleAddToCalendar = () => {
    if (!selectedEvent) return;

    // Generate event details
    const eventTitle = selectedEvent.title;
    const eventDescription =
      selectedEvent.id === 1
        ? "Weekly team meeting to review program progress, discuss youth status updates, and coordinate care plans for the upcoming week."
        : selectedEvent.id === 2
          ? "Individual therapy session focused on cognitive behavioral techniques and emotion regulation skills development."
          : selectedEvent.id === 3
            ? "Group recreational activity designed to promote social skills, teamwork, and positive peer interactions."
            : "Structured educational workshop covering life skills, independent living preparation, and goal-setting activities.";

    const eventLocation =
      selectedEvent.id === 1
        ? "Conference Room A"
        : selectedEvent.id === 2
          ? "Therapy Office 3"
          : selectedEvent.id === 3
            ? "Main Hall"
            : "Learning Center";

    // Parse the date/time (format: "Today, 2:00 PM")
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

    // Extract time from event.time
    const timeStr = selectedEvent.time.includes("2:00 PM")
      ? "T140000"
      : selectedEvent.time.includes("3:30 PM")
        ? "T153000"
        : selectedEvent.time.includes("4:15 PM")
          ? "T161500"
          : "T100000";

    const duration =
      selectedEvent.id === 1
        ? 1
        : selectedEvent.id === 2
          ? 0.5
          : selectedEvent.id === 3
            ? 0.75
            : 2;

    // Create .ics file content
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Mercy Home//Program Management//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `DTSTART:${dateStr}${timeStr}`,
      `DTEND:${dateStr}${timeStr.replace(/T(\d{2})/, (_, h) => `T${String(Number(h) + Math.floor(duration)).padStart(2, "0")}`)}`,
      `DTSTAMP:${dateStr}${timeStr}`,
      `SUMMARY:${eventTitle}`,
      `DESCRIPTION:${eventDescription}`,
      `LOCATION:${eventLocation}`,
      `STATUS:CONFIRMED`,
      `SEQUENCE:0`,
      `BEGIN:VALARM`,
      `TRIGGER:-PT15M`,
      `ACTION:DISPLAY`,
      `DESCRIPTION:Reminder`,
      `END:VALARM`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    // Create blob and download
    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${eventTitle.replace(/\s+/g, "_")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleViewFullDetails = () => {
    setShowExpandedDetails(true);
  };

  const handleNewEntry = () => {
    // US 20222: date and time start together from the current local time.
    const now = localDateTimeParts();
    setNewEntryDate(now.date);
    setNewEntryTime(now.time);
    setNewEntryLogType("Milieu Observation");
    setNewEntryOpen(true);
  };

  const handleOpenConnections = () => {
    setConnectionsOpen(true);
  };

  const handleOpenIR = () => {
    // Select first youth by default for incident
    if (YOUTH_STATUS.length > 0) {
      setIncidentYouth(YOUTH_STATUS[0]);
      // Initialize youth list with the first youth
      setIncidentYouthList([
        {
          id: 1,
          name: YOUTH_STATUS[0].name,
          youthId: String(YOUTH_STATUS[0].id),
          age: "", // Age not in YOUTH_STATUS, can be filled manually
          status: YOUTH_STATUS[0].status,
          statusColor: "bg-gray-100 text-gray-800", // Default status color
          program:
            YOUTH_STATUS[0].program || "Residential Treatment",
          initials: YOUTH_STATUS[0].initials,
          color: YOUTH_STATUS[0].color,
          isPrimary: true,
        },
      ]);
    }
    irSubmittingRef.current = false; // new dialog session
    setIncidentDialogOpen(true);
    setIncidentTab("general");
  };

  const [irConfirm, setIrConfirm] = useState<"cancel" | "finalize" | null>(null);
  const irSubmittingRef = useRef(false);
  // Id of the list record this dialog session has already created (draft saved).
  const irRecordIdRef = useRef<number | null>(null);

  const incidentEndBeforeStart = () =>
    !!(
      incidentStartDate &&
      incidentEndDate &&
      `${incidentEndDate}T${incidentEndTime || "00:00"}` <
        `${incidentStartDate}T${incidentStartTime || "00:00"}`
    );

  // Adds (first time) or updates (later) the shared Incident Reports record.
  const persistIncident = (status: "In Progress" | "Finalized"): boolean => {
    let result: { ok: true; record: { id: number } } | { ok: false; message: string };
    if (irRecordIdRef.current !== null) {
      result = setIncidentReportStatus(irRecordIdRef.current, status);
    } else {
      const youthIds = incidentYouthList
        .map((y) => Number(y.youthId))
        .filter((n) => Number.isFinite(n));
      result = addIncidentReportRecord({
        constituentIds: youthIds,
        youthInvolved: incidentYouthList.map((y) => y.name).join("; "),
        incidentStartDateTime: `${incidentStartDate}T${(incidentStartTime || "00:00").slice(0, 5)}:00`,
        program: program.name,
        programId: Number(program.id),
        staffInvolved: getDemoUserName(),
        incidentTypes: incidentType ? [incidentType] : [],
        status,
      });
    }
    if (!result.ok) {
      toast.error("Incident report could not be saved", {
        description: `Your entries are preserved. ${result.message}`,
      });
      return false;
    }
    irRecordIdRef.current = result.record.id;
    return true;
  };

  const handleSaveIncident = () => {
    if (irSubmittingRef.current) return;
    if (incidentEndBeforeStart()) {
      toast.error("End date and time must not be before the start date and time.");
      return;
    }
    // Lock synchronously. It stays locked after a successful save (until the
    // dialog is opened again), so a second immediate call cannot create a
    // duplicate from the same form values. A failure re-arms it for retry.
    irSubmittingRef.current = true;
    const ok = persistIncident("In Progress");
    if (!ok) {
      irSubmittingRef.current = false;
      return;
    }
    toast.success("Incident report saved as a draft", {
      description: `Report for ${incidentYouth?.name || "youth"} is now listed as In Progress.`,
    });
    setIncidentDialogOpen(false);
    irRecordIdRef.current = null;
    resetIncidentForm();
  };

  const handleCancelIncident = () => {
    // Check if there are any unsaved changes
    const hasChanges =
      incidentType ||
      incidentLocation ||
      incidentNarrative ||
      incidentYouthList.length > 0 ||
      incidentPersonsContacted.length > 0;

    if (hasChanges) {
      setIrConfirm("cancel");
    } else {
      setIncidentDialogOpen(false);
      resetIncidentForm();
    }
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
    const ok = persistIncident("Finalized");
    if (!ok) {
      irSubmittingRef.current = false;
      return;
    }
    setIncidentFinalized(true);
    toast.success("Incident report finalized", {
      description: `Report for ${incidentYouth?.name || "youth"} has been finalized and locked.`,
    });
    // Close dialog after a brief delay to show the success message
    setTimeout(() => {
      setIncidentDialogOpen(false);
      irRecordIdRef.current = null;
      resetIncidentForm();
    }, 500);
  };

  const canFinalizeIncident = () => {
    return (
      incidentType &&
      incidentStartDate &&
      incidentStartTime &&
      incidentLocation &&
      incidentNarrative
    );
  };

  const resetIncidentForm = () => {
    setIncidentYouth(null);
    setIncidentType("");
    setIncidentLocation("");
    setIncidentOverview("");
    setIncidentNarrative("");
    setIncidentResponse("");
    setIncidentPersonsContacted([]);
    setIncidentParticipants([]);
    setIncidentYouthInjuries([]);
    setIncidentRestraints([]);
    setIncidentDebriefParticipants([]);
    setIncidentDebriefNotes("");
    setIncidentFinalized(false);
    setIncidentYouthList([]);
    irRecordIdRef.current = null;
  };

  const handleAddPersonContacted = () => {
    const newId =
      incidentPersonsContacted.length > 0
        ? Math.max(
            ...incidentPersonsContacted.map((p) => p.id),
          ) + 1
        : 1;
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

  const handleAddParticipant = () => {
    const newId =
      incidentParticipants.length > 0
        ? Math.max(...incidentParticipants.map((p) => p.id)) + 1
        : 1;
    setIncidentParticipants([
      ...incidentParticipants,
      {
        id: newId,
        name: "",
        role: "",
        injured: false,
        details: "",
      },
    ]);
  };

  const handleRemoveParticipant = (id: number) => {
    setIncidentParticipants(
      incidentParticipants.filter((p) => p.id !== id),
    );
  };

  const handleAddYouthInjury = () => {
    const newId =
      incidentYouthInjuries.length > 0
        ? Math.max(...incidentYouthInjuries.map((i) => i.id)) +
          1
        : 1;
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
      incidentRestraints.length > 0
        ? Math.max(...incidentRestraints.map((r) => r.id)) + 1
        : 1;
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
      incidentDebriefParticipants.length > 0
        ? Math.max(
            ...incidentDebriefParticipants.map((p) => p.id),
          ) + 1
        : 1;
    setIncidentDebriefParticipants([
      ...incidentDebriefParticipants,
      {
        id: newId,
        name: "",
        role: "",
        attendedDate: "",
      },
    ]);
  };

  const handleRemoveDebriefParticipant = (id: number) => {
    setIncidentDebriefParticipants(
      incidentDebriefParticipants.filter((p) => p.id !== id),
    );
  };

  const handleAddIncidentYouth = () => {
    const newId =
      incidentYouthList.length > 0
        ? Math.max(...incidentYouthList.map((y) => y.id)) + 1
        : 1;
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-teal-500",
    ];
    const randomColor =
      colors[Math.floor(Math.random() * colors.length)];

    setIncidentYouthList([
      ...incidentYouthList,
      {
        id: newId,
        name: "",
        youthId: "",
        age: "",
        status: "",
        statusColor: "bg-gray-100 text-gray-800",
        program: "",
        initials: "??",
        color: randomColor,
        isPrimary: incidentYouthList.length === 0, // First youth is automatically primary
      },
    ]);
  };

  const handleRemoveIncidentYouth = (id: number) => {
    // Don't allow removing the last youth
    if (incidentYouthList.length <= 1) {
      alert(
        "An incident must have at least one youth involved.",
      );
      return;
    }

    const removedYouth = incidentYouthList.find(
      (y) => y.id === id,
    );
    const updatedList = incidentYouthList.filter(
      (y) => y.id !== id,
    );

    // If we removed the primary youth, set the first remaining youth as primary
    if (removedYouth?.isPrimary && updatedList.length > 0) {
      updatedList[0].isPrimary = true;
    }

    setIncidentYouthList(updatedList);
  };

  const handleSetPrimaryYouth = (id: number) => {
    const updated = incidentYouthList.map((youth) => ({
      ...youth,
      isPrimary: youth.id === id,
    }));
    setIncidentYouthList(updated);
  };

  const handleSaveConnection = () => {
    if (!connectionStartDate || !connectionStartTime) {
      return;
    }

    // Get icon properties for connection type
    const getIconByConnectionType = (type: string) => {
      const iconMap: Record<
        string,
        { icon: any; iconColor: string; iconBg: string }
      > = {
        "Advocate Meeting": {
          icon: Briefcase,
          iconColor: "text-blue-600",
          iconBg: "bg-blue-100",
        },
        "Parent Contact": {
          icon: User,
          iconColor: "text-purple-600",
          iconBg: "bg-purple-100",
        },
        "Therapy Session": {
          icon: Stethoscope,
          iconColor: "text-green-600",
          iconBg: "bg-green-100",
        },
        "Shift Summary": {
          icon: Clock,
          iconColor: "text-indigo-600",
          iconBg: "bg-indigo-100",
        },
        "Goal Progress": {
          icon: Target,
          iconColor: "text-amber-600",
          iconBg: "bg-amber-100",
        },
        "Milieu Meeting": {
          icon: Users,
          iconColor: "text-indigo-600",
          iconBg: "bg-indigo-100",
        },
      };
      return (
        iconMap[type] || {
          icon: Users,
          iconColor: "text-gray-600",
          iconBg: "bg-gray-100",
        }
      );
    };

    const iconProps = getIconByConnectionType(connectionType);

    // Build content summary
    const goalsSummary =
      connectionGoals.filter((g) => g.checked).length > 0
        ? `\nGoals Discussed: ${connectionGoals
            .filter((g) => g.checked)
            .map((g) => g.text)
            .join(", ")}`
        : "";
    const locationInfo = connectionLocation
      ? `\nLocation: ${connectionLocation}`
      : "";
    const content = `${connectionStartDate} ${connectionStartTime} - ${connectionEndTime}${locationInfo}${goalsSummary}`;

    // Create new log entry for the connection
    const newEntry = {
      id: logFeedData.length + 1,
      type: connectionType,
      title: `logged a ${connectionType}`,
      content: content,
      author: "You",
      time: "Just now",
      date: new Date(),
      priority: "Medium",
      tags: [],
      youthAssociated: connectionYouth,
      badges: connectionYouth,
      icon: iconProps.icon,
      iconColor: iconProps.iconColor,
      iconBg: iconProps.iconBg,
    };

    // Add to log feed at the top
    setLogFeedData([newEntry, ...logFeedData]);

    // Reset form
    const today = new Date();
    setConnectionStartDate(toLocalIso(today));
    setConnectionEndDate(toLocalIso(today));
    setConnectionRecurring(false);
    setConnectionRepeatType("none");
    setConnectionRepeatInterval(1);
    setConnectionDaysOfWeek([]);
    setConnectionEndType("never");
    setConnectionOccurrences(1);
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setConnectionStartTime(`${hours}:${minutes}`);
    now.setHours(now.getHours() + 1);
    const endHours = String(now.getHours()).padStart(2, "0");
    const endMinutes = String(now.getMinutes()).padStart(
      2,
      "0",
    );
    setConnectionEndTime(`${endHours}:${endMinutes}`);
    setConnectionYouth([]);
    setConnectionLocation("");
    setConnectionTransitionRelated(false);
    setConnectionHomeVisit(false);
    setConnectionSession("");
    setConnectionGoals([
      {
        id: "1",
        text: "Improve emotional regulation skills",
        checked: false,
      },
      {
        id: "2",
        text: "Develop healthy coping strategies",
        checked: false,
      },
      {
        id: "3",
        text: "Strengthen family relationships",
        checked: false,
      },
      {
        id: "4",
        text: "Improve school attendance and performance",
        checked: false,
      },
    ]);
    setConnectionNewGoal("");
    setConnectionType("Advocate Meeting");
    setConnectionsOpen(false);
  };

  const handleFinalizeAndSubmitConnection = () => {
    if (!connectionStartDate || !connectionStartTime) {
      return;
    }

    // Same logic as handleSaveConnection but marks as completed and adds to Program Log
    const getIconByConnectionType = (type: string) => {
      const iconMap: Record<
        string,
        { icon: any; iconColor: string; iconBg: string }
      > = {
        "Advocate Meeting": {
          icon: Briefcase,
          iconColor: "text-blue-600",
          iconBg: "bg-blue-100",
        },
        "Parent Contact": {
          icon: User,
          iconColor: "text-purple-600",
          iconBg: "bg-purple-100",
        },
        "Therapy Session": {
          icon: Stethoscope,
          iconColor: "text-green-600",
          iconBg: "bg-green-100",
        },
        "Shift Summary": {
          icon: Clock,
          iconColor: "text-indigo-600",
          iconBg: "bg-indigo-100",
        },
        "Goal Progress": {
          icon: Target,
          iconColor: "text-amber-600",
          iconBg: "bg-amber-100",
        },
        "Milieu Meeting": {
          icon: Users,
          iconColor: "text-indigo-600",
          iconBg: "bg-indigo-100",
        },
      };
      return (
        iconMap[type] || {
          icon: Users,
          iconColor: "text-gray-600",
          iconBg: "bg-gray-100",
        }
      );
    };

    const iconProps = getIconByConnectionType(connectionType);

    // Build comprehensive content summary
    const goalsSummary =
      connectionGoals.filter((g) => g.checked).length > 0
        ? `\nGoals Discussed: ${connectionGoals
            .filter((g) => g.checked)
            .map((g) => g.text)
            .join(", ")}`
        : "";
    const copingSkillsSummary =
      connectionCopingSkills.filter((s) => s.checked).length > 0
        ? `\nCoping Skills: ${connectionCopingSkills
            .filter((s) => s.checked)
            .map((s) => s.text)
            .join(", ")}`
        : "";
    const triggersSummary =
      connectionTriggers.filter((t) => t.checked).length > 0
        ? `\nTriggers: ${connectionTriggers
            .filter((t) => t.checked)
            .map((t) => t.text)
            .join(", ")}`
        : "";
    const strengthsSummary =
      connectionStrengths.filter((s) => s.checked).length > 0
        ? `\nStrengths: ${connectionStrengths
            .filter((s) => s.checked)
            .map((s) => s.text)
            .join(", ")}`
        : "";
    const locationInfo = connectionLocation
      ? `\nLocation: ${connectionLocation}`
      : "";
    const meetingSummaryInfo = connectionMeetingSummary
      ? `\nSummary: ${connectionMeetingSummary}`
      : "";
    const content = `${connectionStartDate} ${connectionStartTime} - ${connectionEndTime}${locationInfo}${goalsSummary}${copingSkillsSummary}${triggersSummary}${strengthsSummary}${meetingSummaryInfo}`;

    // Create new log entry marked as completed and added to Program Log
    const newEntry = {
      id: logFeedData.length + 1,
      type: connectionType,
      content: content,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      date: connectionStartDate,
      author: "Staff User",
      icon: iconProps.icon,
      iconColor: iconProps.iconColor,
      iconBg: iconProps.iconBg,
      youth: connectionYouth.join(", "),
      completed: true, // Mark as completed
      addedToProgramLog: true, // Indicate it's been added to Program Log
    };

    setLogFeedData([newEntry, ...logFeedData]);

    // Reset form
    const today = new Date();
    setConnectionStartDate(toLocalIso(today));
    setConnectionEndDate(toLocalIso(today));
    setConnectionRecurring(false);
    setConnectionRepeatType("none");
    setConnectionRepeatInterval(1);
    setConnectionDaysOfWeek([]);
    setConnectionEndType("never");
    setConnectionOccurrences(1);
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setConnectionStartTime(`${hours}:${minutes}`);
    now.setHours(now.getHours() + 1);
    const endHours = String(now.getHours()).padStart(2, "0");
    const endMinutes = String(now.getMinutes()).padStart(
      2,
      "0",
    );
    setConnectionEndTime(`${endHours}:${endMinutes}`);
    setConnectionYouth([]);
    setConnectionLocation("");
    setConnectionTransitionRelated(false);
    setConnectionHomeVisit(false);
    setConnectionSession("");
    setConnectionGoals([
      {
        id: "1",
        text: "Improve emotional regulation skills",
        checked: false,
      },
      {
        id: "2",
        text: "Develop healthy coping strategies",
        checked: false,
      },
      {
        id: "3",
        text: "Strengthen family relationships",
        checked: false,
      },
      {
        id: "4",
        text: "Improve school attendance and performance",
        checked: false,
      },
    ]);
    setConnectionNewGoal("");
    setConnectionType("Advocate Meeting");
    setConnectionsOpen(false);
  };

  const handleCancelConnection = () => {
    const today = new Date();
    setConnectionStartDate(toLocalIso(today));
    setConnectionEndDate(toLocalIso(today));
    setConnectionRecurring(false);
    setConnectionRepeatType("none");
    setConnectionRepeatInterval(1);
    setConnectionDaysOfWeek([]);
    setConnectionEndType("never");
    setConnectionOccurrences(1);
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setConnectionStartTime(`${hours}:${minutes}`);
    now.setHours(now.getHours() + 1);
    const endHours = String(now.getHours()).padStart(2, "0");
    const endMinutes = String(now.getMinutes()).padStart(
      2,
      "0",
    );
    setConnectionEndTime(`${endHours}:${endMinutes}`);
    setConnectionYouth([]);
    setConnectionLocation("");
    setConnectionTransitionRelated(false);
    setConnectionHomeVisit(false);
    setConnectionSession("");
    setConnectionGoals([
      {
        id: "1",
        text: "Improve emotional regulation skills",
        checked: false,
      },
      {
        id: "2",
        text: "Develop healthy coping strategies",
        checked: false,
      },
      {
        id: "3",
        text: "Strengthen family relationships",
        checked: false,
      },
      {
        id: "4",
        text: "Improve school attendance and performance",
        checked: false,
      },
    ]);
    setConnectionNewGoal("");
    setConnectionType("Advocate Meeting");
    setConnectionsOpen(false);
  };

  const handleSaveIR = () => {
    if (!irDescription.trim()) {
      return;
    }

    // Here you would typically save to your backend
    console.log("Saving incident report:", {
      type: irType,
      severity: irSeverity,
      date: irDate,
      time: irTime,
      location: irLocation,
      youthInvolved: irYouthInvolved,
      staffInvolved: irStaffInvolved,
      description: irDescription,
      immediateAction: irImmediateAction,
      followUp: irFollowUp,
      notificationRequired: irNotificationRequired,
      notifiedParties: irNotifiedParties,
    });

    // Reset form
    setIrType("Behavioral");
    setIrSeverity("Medium");
    setIrDate(() => {
      const today = new Date();
      return toLocalIso(today);
    });
    setIrTime(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    });
    setIrLocation("");
    setIrYouthInvolved([]);
    setIrStaffInvolved([]);
    setIrDescription("");
    setIrImmediateAction("");
    setIrFollowUp("");
    setIrNotificationRequired(false);
    setIrNotifiedParties([]);
    setIrOpen(false);
  };

  const handleCancelIR = () => {
    setIrType("Behavioral");
    setIrSeverity("Medium");
    setIrLocation("");
    setIrYouthInvolved([]);
    setIrStaffInvolved([]);
    setIrDescription("");
    setIrImmediateAction("");
    setIrFollowUp("");
    setIrNotificationRequired(false);
    setIrNotifiedParties([]);
    setIrOpen(false);
  };

  // Task Management Handlers
  const handleOpenNewTask = () => {
    setNewTaskOpen(true);
  };

  const handleToggleTaskComplete = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task,
      ),
    );
  };

  const handleSaveNewTask = () => {
    if (!newTaskTitle.trim()) {
      return;
    }

    // Determine priority color
    const getPriorityColor = (priority: string) => {
      const colorMap: Record<
        string,
        { bg: string; text: string; border: string }
      > = {
        "High Priority": {
          bg: "#FEF7E0",
          text: "#705E2E",
          border: "#F4D587",
        },
        Urgent: {
          bg: "#FEEFEE",
          text: "#8C2016",
          border: "#F89489",
        },
        "Medium Priority": {
          bg: "#E8F4F8",
          text: "#0B5CAD",
          border: "#8EC8E6",
        },
        "Low Priority": {
          bg: "#F3F4F6",
          text: "#4B5563",
          border: "#D1D5DB",
        },
      };
      return colorMap[priority] || colorMap["Medium Priority"];
    };

    const newTask = {
      id: tasks.length + 1,
      title: newTaskTitle,
      description: newTaskDescription,
      priority: newTaskPriority,
      priorityColor: getPriorityColor(newTaskPriority),
      dueDate: newTaskDueDate || "No due date",
      assignedTo: newTaskAssignee,
      icon: ClipboardList,
      completed: false,
    };

    setTasks([...tasks, newTask]);

    // Reset form
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskPriority("Medium Priority");
    setNewTaskDueDate("");
    setNewTaskAssignee("Assigned to you");
    setNewTaskOpen(false);
  };

  const handleCancelNewTask = () => {
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskPriority("Medium Priority");
    setNewTaskDueDate("");
    setNewTaskAssignee("Assigned to you");
    setNewTaskOpen(false);
  };

  const handleOpenTaskDetail = (task: any) => {
    setSelectedTask(task);
    setTaskDetailOpen(true);
  };

  const handleCloseTaskDetail = () => {
    setSelectedTask(null);
    setTaskDetailOpen(false);
    setMeetingDate("");
    setMeetingTime("");
    setMeetingLocation("");
    setMeetingNotes("");
  };

  const handleToggleTaskSection = (
    taskId: number,
    sectionName: string,
  ) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId && task.sections) {
          return {
            ...task,
            sections: task.sections.map((section: any) =>
              section.name === sectionName
                ? { ...section, completed: !section.completed }
                : section,
            ),
          };
        }
        return task;
      }),
    );
  };

  const handleToggleChecklistItem = (
    taskId: number,
    itemName: string,
  ) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId && task.checklist) {
          return {
            ...task,
            checklist: task.checklist.map((item: any) =>
              item.item === itemName
                ? { ...item, completed: !item.completed }
                : item,
            ),
          };
        }
        return task;
      }),
    );
  };

  const handleScheduleMeeting = () => {
    if (selectedTask && meetingDate && meetingTime) {
      // Update task with meeting details
      setTasks(
        tasks.map((task) =>
          task.id === selectedTask.id
            ? {
                ...task,
                meetingScheduled: true,
                meetingDateTime: `${meetingDate} ${meetingTime}`,
                meetingLocation,
                meetingNotes,
              }
            : task,
        ),
      );
      handleCloseTaskDetail();
    }
  };

  const handleCompleteTaskFromDetail = () => {
    if (selectedTask) {
      handleToggleTaskComplete(selectedTask.id);
      handleCloseTaskDetail();
    }
  };

  // Quick Action Handlers for Task Cards
  const handleQuickSchedule = (
    task: any,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setSelectedTask(task);
    setTaskDetailOpen(true);
  };

  const handleSendEmail = (
    email: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    window.location.href = `mailto:${email}`;
  };

  const handleQuickViewYouth = (
    youthName: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    const youth = YOUTH_STATUS.find(
      (y) => y.name === youthName,
    );
    if (youth) {
      setSelectedYouth(youth);
      setYouthDetailOpen(true);
    }
  };

  const handleMarkSectionComplete = (
    taskId: number,
    sectionName: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    handleToggleTaskSection(taskId, sectionName);
  };

  const handleQuickCheckItem = (
    taskId: number,
    itemName: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    handleToggleChecklistItem(taskId, itemName);
  };

  const handleQuickViewTask = (
    task: any,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    handleOpenTaskDetail(task);
  };

  const getTaskProgress = (task: any) => {
    if (task.sections) {
      const completed = task.sections.filter(
        (s: any) => s.completed,
      ).length;
      const total = task.sections.length;
      return {
        completed,
        total,
        percentage: Math.round((completed / total) * 100),
      };
    }
    if (task.checklist) {
      const completed = task.checklist.filter(
        (item: any) => item.completed,
      ).length;
      const total = task.checklist.length;
      return {
        completed,
        total,
        percentage: Math.round((completed / total) * 100),
      };
    }
    return null;
  };

  const getYouthForTask = (task: any) => {
    if (task.youthName) {
      return YOUTH_STATUS.find(
        (y) => y.name === task.youthName,
      );
    }
    return null;
  };

  const handleSaveNewEntry = () => {
    if (!newEntryContent.trim()) {
      return;
    }

    // Map entry type to icon properties
    const getIconByType = (type: string) => {
      const iconMap: Record<
        string,
        { icon: any; iconColor: string; iconBg: string }
      > = {
        "Communication Log": {
          icon: MessageCircle,
          iconColor: "text-purple-600",
          iconBg: "bg-purple-100",
        },
        Observation: {
          icon: Eye,
          iconColor: "text-blue-600",
          iconBg: "bg-blue-100",
        },
        Medical: {
          icon: Stethoscope,
          iconColor: "text-orange-600",
          iconBg: "bg-orange-100",
        },
        Therapy: {
          icon: User,
          iconColor: "text-green-600",
          iconBg: "bg-green-100",
        },
        Contact: {
          icon: MessageCircle,
          iconColor: "text-purple-600",
          iconBg: "bg-purple-100",
        },
        Admin: {
          icon: FileText,
          iconColor: "text-indigo-600",
          iconBg: "bg-indigo-100",
        },
        Alert: {
          icon: AlertCircle,
          iconColor: "text-red-600",
          iconBg: "bg-red-100",
        },
      };
      return (
        iconMap[type] || {
          icon: FileText,
          iconColor: "text-gray-600",
          iconBg: "bg-gray-100",
        }
      );
    };

    const iconProps = getIconByType(newEntryType);

    // Create new entry object
    const newEntry = {
      id: logFeedData.length + 1,
      type: newEntryType,
      title: `logged a ${newEntryType}`,
      content: newEntryContent,
      author: "You",
      time: "Just now",
      date: new Date(), // Add current date for filtering
      priority: newEntryPriority,
      tags: newEntryTags,
      youthAssociated: newEntryYouth,
      badges: newEntryYouth,
      icon: iconProps.icon,
      iconColor: iconProps.iconColor,
      iconBg: iconProps.iconBg,
    };

    // Add to log feed at the top
    setLogFeedData([newEntry, ...logFeedData]);

    // Reset form
    setNewEntryContent("");
    setNewEntryType("Communication Log");
    setNewEntryLogType("Milieu Observation");
    setNewEntryPriority("Medium");
    setNewEntryTags([]);
    setNewEntryYouth([]);
    setNewEntryProgramTeam([]);
    setNewEntryOther([]);
    setNewEntryFiles([]);
    setNewEntryDate(getCurrentDate());
    setNewEntryTime(getCurrentTime());
    setExternalIndividuals([]);
    setExternalIndividualInput("");
    setNewEntryOpen(false);
  };

  const handleCancelNewEntry = () => {
    setNewEntryOpen(false);
    setNewEntryContent("");
    setNewEntryType("Communication Log");
    setNewEntryLogType("Milieu Observation");
    setNewEntryPriority("Medium");
    setNewEntryTags([]);
    setNewEntryYouth([]);
    setNewEntryProgramTeam([]);
    setNewEntryOther([]);
    setNewEntryFiles([]);
    setNewEntryDate(getCurrentDate());
    setNewEntryTime(getCurrentTime());
    setExternalIndividuals([]);
    setExternalIndividualInput("");
  };

  const toggleTag = (tag: string) => {
    setNewEntryTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag],
    );
  };

  const toggleYouthAssociation = (youthName: string) => {
    setNewEntryYouth((prev) =>
      prev.includes(youthName)
        ? prev.filter((y) => y !== youthName)
        : [...prev, youthName],
    );
  };

  // File handling functions
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) => {
        // Max 10MB per file
        if (file.size > 10 * 1024 * 1024) {
          alert(
            `File "${file.name}" is too large. Maximum size is 10MB.`,
          );
          return false;
        }
        return true;
      });
      setNewEntryFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setNewEntryFiles((prev) =>
      prev.filter((_, i) => i !== index),
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files) {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) => {
        // Max 10MB per file
        if (file.size > 10 * 1024 * 1024) {
          alert(
            `File "${file.name}" is too large. Maximum size is 10MB.`,
          );
          return false;
        }
        return true;
      });
      setNewEntryFiles((prev) => [...prev, ...validFiles]);
    }
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

  // @mention handler functions
  const handleMentionInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const value = e.target.value;
    setMentionInput(value);

    // Check for @ symbol
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf("@");

    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.substring(
        lastAtSymbol + 1,
      );
      // Check if there's a space after @ (which would close the mention)
      if (
        !textAfterAt.includes(" ") &&
        !textAfterAt.includes("\n")
      ) {
        setMentionQuery(textAfterAt.toLowerCase());
        setShowMentionDropdown(true);
        setSelectedMentionIndex(0);
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }
  };

  const handleMentionSelect = (youthName: string) => {
    // Add youth to selected list if not already there
    if (!newEntryYouth.includes(youthName)) {
      setNewEntryYouth((prev) => [...prev, youthName]);
    }

    // Remove the @mention text from input
    const cursorPosition = mentionInput.length;
    const textBeforeCursor = mentionInput.substring(
      0,
      cursorPosition,
    );
    const lastAtSymbol = textBeforeCursor.lastIndexOf("@");

    const newValue =
      mentionInput.substring(0, lastAtSymbol) +
      mentionInput.substring(cursorPosition);
    setMentionInput(newValue);
    setShowMentionDropdown(false);
    setMentionQuery("");
  };

  const handleMentionKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (showMentionDropdown) {
      const filteredYouth = YOUTH_STATUS.filter((youth) =>
        youth.name.toLowerCase().includes(mentionQuery),
      );

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev < filteredYouth.length - 1 ? prev + 1 : prev,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev > 0 ? prev - 1 : 0,
        );
      } else if (
        e.key === "Enter" &&
        filteredYouth.length > 0
      ) {
        e.preventDefault();
        handleMentionSelect(
          filteredYouth[selectedMentionIndex].name,
        );
      } else if (e.key === "Escape") {
        setShowMentionDropdown(false);
      }
    }
  };

  const removeYouthMention = (youthName: string) => {
    setNewEntryYouth((prev) =>
      prev.filter((y) => y !== youthName),
    );
  };

  const addExternalIndividual = () => {
    if (
      externalIndividualInput.trim() &&
      !externalIndividuals.includes(
        externalIndividualInput.trim(),
      )
    ) {
      setExternalIndividuals([
        ...externalIndividuals,
        externalIndividualInput.trim(),
      ]);
      setExternalIndividualInput("");
    }
  };

  const removeExternalIndividual = (individual: string) => {
    setExternalIndividuals(
      externalIndividuals.filter((i) => i !== individual),
    );
  };

  // Comment helper functions
  const toggleComments = (logId: number) => {
    setExpandedComments((prev) => ({
      ...prev,
      [logId]: !prev[logId],
    }));
  };

  const toggleShowAllComments = (logId: number) => {
    setShowAllComments((prev) => ({
      ...prev,
      [logId]: !prev[logId],
    }));
  };

  // Edit helper functions for one-time editing
  const startEditingLog = (
    logId: number,
    currentContent: string,
  ) => {
    setEditingLogId(logId);
    setEditedContent(currentContent);
  };

  const cancelEditingLog = () => {
    setEditingLogId(null);
    setEditedContent("");
  };

  const saveEditedLog = (logId: number) => {
    // Update the log feed data
    setLogFeedData((prev) =>
      prev.map((log) =>
        log.id === logId
          ? {
              ...log,
              originalContent: log.content, // Save original content
              content: editedContent,
              edited: true,
              editedAt: new Date().toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
            }
          : log,
      ),
    );

    // Mark this log as edited (prevent future edits)
    setEditedLogs((prev) => new Set(prev).add(logId));

    // Clear edit state
    setEditingLogId(null);
    setEditedContent("");
  };

  const toggleOriginalContent = (logId: number) => {
    setExpandedOriginals((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  // Edit modal helper functions
  const openEditModal = (logEntry: (typeof LOG_FEED)[0]) => {
    setEditingEntry(logEntry);
    setEditEntryLogType(logEntry.type || "");

    // Parse date and time from the log entry
    const entryDate = logEntry.date
      ? new Date(logEntry.date)
      : new Date();
    setEditEntryDate(entryDate.toISOString().split("T")[0]);
    setEditEntryTime(logEntry.time || getCurrentTime());

    // Set priority - default to Low if not specified
    setEditEntryPriority((logEntry as any).priority || "Low");

    setEditEntryContent(logEntry.content || "");

    // Extract youth names from badges
    const youthNames = logEntry.badges
      ? logEntry.badges.filter((badge) =>
          YOUTH_STATUS.some((youth) => youth.name === badge),
        )
      : [];
    setEditEntryYouth(youthNames);

    // Extract program team from badges
    const teamNames = logEntry.badges
      ? logEntry.badges.filter((badge) =>
          PROGRAM_TEAM.some((member) => member.name === badge),
        )
      : [];
    setEditEntryProgramTeam(teamNames);

    // Extract other individuals from badges
    const otherNames = logEntry.badges
      ? logEntry.badges.filter((badge) =>
          OTHER_INDIVIDUALS.some(
            (individual) => individual.name === badge,
          ),
        )
      : [];
    setEditEntryOther(otherNames);

    // Set tags - you might need to adjust this based on how tags are stored
    setEditEntryTags((logEntry as any).tags || []);

    // Clear attachments for edit
    setEditEntryAttachments([]);

    setEditModalOpen(true);
  };

  const handleSaveEditedEntry = () => {
    if (!editingEntry) return;

    // Combine all selected individuals into badges
    const allBadges = [
      ...editEntryYouth,
      ...editEntryProgramTeam,
      ...editEntryOther,
    ];

    // Update the log feed data
    setLogFeedData((prev) =>
      prev.map((log) =>
        log.id === editingEntry.id
          ? {
              ...log,
              type: editEntryLogType,
              content: editEntryContent,
              time: editEntryTime,
              date: new Date(editEntryDate),
              badges: allBadges,
              priority: editEntryPriority,
              tags: editEntryTags,
              edited: true,
              editedAt: new Date().toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
            }
          : log,
      ),
    );

    // Mark this log as edited
    setEditedLogs((prev) => new Set(prev).add(editingEntry.id));

    // Close modal and reset state
    handleCancelEditEntry();
  };

  const handleCancelEditEntry = () => {
    setEditModalOpen(false);
    setEditingEntry(null);
    setEditEntryLogType("");
    setEditEntryDate("");
    setEditEntryTime("");
    setEditEntryPriority("Low");
    setEditEntryContent("");
    setEditEntryYouth([]);
    setEditEntryProgramTeam([]);
    setEditEntryOther([]);
    setEditEntryTags([]);
    setEditEntryAttachments([]);
  };

  // Helper function to check if a log entry falls within the selected date range
  const isWithinDateRange = (logDate: Date) => {
    if (dateRangeFilter === "all") return true;

    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const logDateOnly = new Date(
      logDate.getFullYear(),
      logDate.getMonth(),
      logDate.getDate(),
    );

    if (dateRangeFilter === "last24hours") {
      const twentyFourHoursAgo = new Date(
        now.getTime() - 24 * 60 * 60 * 1000,
      );
      return logDate >= twentyFourHoursAgo;
    }

    if (dateRangeFilter === "last7days") {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      return (
        logDateOnly >= sevenDaysAgo && logDateOnly <= today
      );
    }

    if (dateRangeFilter === "last30days") {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return (
        logDateOnly >= thirtyDaysAgo && logDateOnly <= today
      );
    }

    if (
      dateRangeFilter === "custom" &&
      customStartDate &&
      customEndDate
    ) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999); // Include the full end date
      return logDate >= startDate && logDate <= endDate;
    }

    return true;
  };

  const openLogEntryDetail = (log: (typeof LOG_FEED)[0]) => {
    setViewingLogEntry(log);
    setViewLogEntryDialogOpen(true);
  };

  const openTherapyDetail = (log: (typeof LOG_FEED)[0]) => {
    setSelectedTherapyEntry(log);
    setTherapyDetailOpen(true);
  };

  const activeFilterCount =
    selectedTypes.length +
    selectedAuthors.length +
    selectedYouthFilter.length +
    selectedObservationFilter.length +
    selectedPriorities.length +
    (dateRangeFilter !== "all" ? 1 : 0);

  const filteredLogFeed = [
    ...(staffStatusFeed as unknown as typeof logFeedData),
    ...logFeedData,
  ].filter((log) => {
    const typeMatch =
      selectedTypes.length === 0 ||
      selectedTypes.includes(log.type);
    const authorMatch =
      selectedAuthors.length === 0 ||
      selectedAuthors.includes(log.author);
    const youthMatch =
      selectedYouthFilter.length === 0 ||
      (log.badges &&
        log.badges.some((badge) =>
          selectedYouthFilter.some((youth) =>
            badge
              .toLowerCase()
              .includes(youth.toLowerCase().split(" ")[0]),
          ),
        ));
    // Entries tagged with ANY selected observation (e.g. Pass Related).
    const observationMatch =
      selectedObservationFilter.length === 0 ||
      (
        (log as { observations?: string[] }).observations ?? []
      ).some((o) => selectedObservationFilter.includes(o));
    const priorityMatch =
      selectedPriorities.length === 0 ||
      selectedPriorities.includes(log.priority);
    const dateMatch = log.date
      ? isWithinDateRange(log.date)
      : true;

    return (
      typeMatch &&
      authorMatch &&
      youthMatch &&
      observationMatch &&
      priorityMatch &&
      dateMatch
    );
  });

  const regenerateHandoverNote = () => {
    // Simulate AI regeneration with slight variation
    setHandoverNote(`SHIFT SUMMARY - ${program.name} - ${formatMdy(new Date())}

PRIORITY ITEMS:
• URGENT: Kermit the Frog must call home after 7:00 PM (parent request from Jim Henson) - Set reminder for 6:55 PM
• Weather Alert: Extreme heat advisory - outdoor programming suspended, tutoring session canceled

RESIDENT OVERVIEW (Census: 6/8):
• Actively Engaged (3): Fozzie Bear, Kermit the Frog, Red Fraggle
• Present (3): Miss Piggy, Gonzo the Great, Animal

MEDICAL ADMINISTRATION:
• ATTENTION: Kermit - Missed morning medication, requires follow-up
• Completed: Red Fraggle received Afternoon Tenex 2.5mg (1:55 PM, Emily Neal)
• Pending: Gonzo (Evening dose), Fozzie & Kermit (Bedtime doses)

TODAY'S COMPLETED ACTIVITIES:
• Clinical: Fozzie Bear therapy session completed (2:30 PM)
• Assessment: Miss Piggy quarterly YRS testing completed
• Academic: Red Fraggle returned from school, math homework assigned

EVENING PRIORITIES:
1. Parent contact fulfillment - Kermit's 7:00 PM+ home call (CRITICAL)
2. Academic support - Red Fraggle math tutoring with Elizabeth Sorice
3. Medication compliance - Evening and bedtime administration rounds
4. Scheduled meeting - Care Planning with Fozzie at 7:30 PM
5. Heat safety monitoring - Ensure adequate hydration and indoor activities

All youth accounted for and safe. No behavioral incidents reported.`);
    setIsAiGenerated(true);
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{
        backgroundColor: "var(--slds-g-color-background-alt-2)",
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-3 shadow-sm shrink-0"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded flex items-center justify-center text-white shadow-sm"
              style={{
                backgroundColor: "var(--color-brand-primary)",
              }}
            >
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <nav
                className="flex items-center text-xs mb-0.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
                aria-label="Breadcrumb"
              >
                <span
                  className="hover:underline cursor-pointer"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color =
                      "var(--color-brand-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color =
                      "var(--slds-g-color-text-weak)";
                  }}
                  onClick={onBack}
                >
                  Programs
                </span>
                <ChevronRight
                  className="h-3 w-3 mx-1"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                />
                <span className="font-medium text-gray-900">
                  {program.name}
                </span>
              </nav>

              <div className="flex items-center gap-2">
                <h1 className="text-xl font-medium text-gray-900 tracking-tight">
                  {program.name}
                </h1>
                <span
                  className="text-xs"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  • Last Updated: {program.lastUpdate}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-8 relative"
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
              onClick={() => setFilterOpen(true)}
            >
              <Filter className="h-3.5 w-3.5 mr-2" /> Filter
              {activeFilterCount > 0 && (
                <span
                  className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    backgroundColor:
                      "var(--color-brand-primary)",
                    color: "white",
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-8 w-8 p-0"
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
              onClick={() => {
                // Refresh action - reloads data without resetting filters
                window.location.reload();
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-8"
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
              onClick={handleOpenConnections}
            >
              Connections
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-8"
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
              onClick={handleOpenIR}
            >
              IR
            </Button>
            {/* Pass Calendar (20041) for this Program — handled by the host
                (ProgramLog) through the existing onNavigate pattern. */}
            {onNavigate && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-8"
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
                onClick={() => onNavigate("pass-calendar")}
              >
                <CalendarDays className="h-3.5 w-3.5 mr-2" />{" "}
                Calendar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-8"
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
              onClick={handleNewEntry}
            >
              <Plus className="h-3.5 w-3.5 mr-2" /> Log
            </Button>
          </div>
        </div>
      </div>

      {/* Main Scrollable Content — pb-16 clears the fixed Utility Bar
          (To Do List / History / Notes), same as the Program record page. */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-[1600px] mx-auto">
          {/* Left Column (Feed) - 3/4 width */}
          <div className="lg:col-span-3 space-y-6">
            {/* Youth Status - Horizontal Scrollable Row */}
            <div className="p-[0px] overflow-x-auto mt-[0px] mr-[0px] mb-[14px] ml-[0px]">
              <div className="flex gap-0">
                {programYouth.length === 0 && (
                  <p className="slds-text-3 py-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
                    No youth are currently active in this Program.
                  </p>
                )}
                {programYouth.map((youth) => (
                  <div
                    key={youth.id}
                    className="flex flex-col items-center gap-2 cursor-pointer group min-w-[80px]"
                    onClick={() => openYouthDetail(youth)}
                  >
                    <div className="relative">
                      <Avatar
                        className="h-12 w-12 border-2 border-white shadow-sm"
                        style={{ backgroundColor: "#d0dfd6" }}
                      >
                        <AvatarFallback
                          className="font-semibold"
                          style={{
                            backgroundColor: "#d0dfd6",
                            color: "var(--color-brand-primary)",
                            fontSize: "16px",
                          }}
                        >
                          {youth.initials}
                        </AvatarFallback>
                      </Avatar>
                      {/* Status Dot Indicator */}
                      <ProgramLogLocationDot youth={youth} />
                    </div>
                    <div className="text-center">
                      <div
                        className="text-xs font-medium group-hover:underline whitespace-nowrap"
                        style={{ color: "#155dfc" }}
                      >
                        {youth.name.split(" ")[0]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Tabs & Feed */}
            <div
              className="shadow-sm"
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-base)",
                borderRadius:
                  "var(--slds-c-card-radius-border)",
              }}
            >
              <Tabs defaultValue="feed" className="w-full">
                <div
                  className="pt-[8px] pr-[0px] pb-[0px] pl-[0px]"
                  style={{
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <TabsList className="bg-transparent px-4 py-0 h-11 gap-6 w-full justify-start !border-0">
                    <TabsTrigger
                      value="feed"
                      className="rounded-none !border-0 !border-b-2 !border-b-transparent data-[state=active]:!border-b-[var(--color-brand-primary)] data-[state=active]:text-[var(--color-brand-primary)] data-[state=active]:font-semibold px-0 pb-2 h-11 text-[13px] hover:text-[#080707] !bg-transparent shadow-none data-[state=active]:!bg-transparent hover:!bg-transparent outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:shadow-none focus-visible:shadow-none !outline-none !ring-0"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Log Feed
                    </TabsTrigger>
                    <TabsTrigger
                      value="tasks"
                      className="rounded-none !border-0 !border-b-2 !border-b-transparent data-[state=active]:!border-b-[var(--color-brand-primary)] data-[state=active]:text-[var(--color-brand-primary)] data-[state=active]:font-semibold px-0 pb-2 h-11 text-[13px] hover:text-[#080707] !bg-transparent shadow-none data-[state=active]:!bg-transparent hover:!bg-transparent outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:shadow-none focus-visible:shadow-none !outline-none !ring-0"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      My Tasks
                    </TabsTrigger>
                    <TabsTrigger
                      value="handovers"
                      className="rounded-none !border-0 !border-b-2 !border-b-transparent data-[state=active]:!border-b-[var(--color-brand-primary)] data-[state=active]:text-[var(--color-brand-primary)] data-[state=active]:font-semibold px-0 pb-2 h-11 text-[13px] hover:text-[#080707] !bg-transparent shadow-none data-[state=active]:!bg-transparent hover:!bg-transparent outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:shadow-none focus-visible:shadow-none !outline-none !ring-0"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Shift Handovers
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="feed" className="p-0 m-0">
                  {/* Quick Date Range Filters */}
                  <div
                    className="px-4 py-3 flex items-center gap-2"
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor: "white",
                    }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs px-3 py-1 font-medium"
                      style={{
                        height: "24px",
                        backgroundColor:
                          dateRangeFilter === "last24hours"
                            ? "var(--color-brand-primary)"
                            : "white",
                        color:
                          dateRangeFilter === "last24hours"
                            ? "white"
                            : "#080707",
                        border: "1px solid #dddbda",
                        fontSize: "12px",
                      }}
                      onClick={() =>
                        setDateRangeFilter("last24hours")
                      }
                    >
                      Last 24 Hours
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs px-3 py-1 font-medium"
                      style={{
                        height: "24px",
                        backgroundColor:
                          dateRangeFilter === "last7days"
                            ? "var(--color-brand-primary)"
                            : "white",
                        color:
                          dateRangeFilter === "last7days"
                            ? "white"
                            : "#080707",
                        border: "1px solid #dddbda",
                        fontSize: "12px",
                      }}
                      onClick={() =>
                        setDateRangeFilter("last7days")
                      }
                    >
                      Last 7 Days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs px-3 py-1 font-medium"
                      style={{
                        height: "24px",
                        backgroundColor:
                          dateRangeFilter === "last30days"
                            ? "var(--color-brand-primary)"
                            : "white",
                        color:
                          dateRangeFilter === "last30days"
                            ? "white"
                            : "#080707",
                        border: "1px solid #dddbda",
                        fontSize: "12px",
                      }}
                      onClick={() =>
                        setDateRangeFilter("last30days")
                      }
                    >
                      Last Month
                    </Button>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-medium"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Custom:
                      </span>
                      <DateInput
                        value={isoToMdy(customStartDate)}
                        onChange={(v) =>
                          ((e) => {
                            setCustomStartDate(e.target.value);
                            if (e.target.value && customEndDate)
                              setDateRangeFilter("custom");
                          })({ target: { value: mdyToIso(v) } })
                        }
                        placeholder="Start Date"
                        className="h-7 text-xs px-2 pr-3 w-[138px] [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:mr-0.5 [&::-webkit-inner-spin-button]:hidden [&::-webkit-clear-button]:hidden"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          color:
                            "var(--slds-g-color-text-default)",
                          borderRadius: "0.25rem",
                          lineHeight: "1",
                        }}
                      />
                      <span
                        className="text-xs"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        to
                      </span>
                      <DateInput
                        value={isoToMdy(customEndDate)}
                        onChange={(v) =>
                          ((e) => {
                            setCustomEndDate(e.target.value);
                            if (
                              customStartDate &&
                              e.target.value
                            )
                              setDateRangeFilter("custom");
                          })({ target: { value: mdyToIso(v) } })
                        }
                        placeholder="End Date"
                        className="h-7 text-xs px-2 pr-3 w-[138px] [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:mr-0.5 [&::-webkit-inner-spin-button]:hidden [&::-webkit-clear-button]:hidden"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          color:
                            "var(--slds-g-color-text-default)",
                          borderRadius: "0.25rem",
                          lineHeight: "1",
                        }}
                      />
                    </div>
                    {activeFilterCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full h-6 text-xs ml-auto"
                        style={{
                          color:
                            "var(--slds-g-color-text-link)",
                        }}
                        onClick={clearAllFilters}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear All
                      </Button>
                    )}
                  </div>

                  {/* Feed Items */}
                  <div className="p-6 space-y-4">
                    {/* Results Count */}
                    {filteredLogFeed.length > 0 && (
                      <div
                        className="pb-1"
                        style={{
                          fontSize: "12px",
                          color: "#706e6b",
                        }}
                      >
                        Showing{" "}
                        <span
                          className="font-semibold"
                          style={{ color: "#080707" }}
                        >
                          {filteredLogFeed.length}
                        </span>{" "}
                        {filteredLogFeed.length === 1
                          ? "entry"
                          : "entries"}
                        {activeFilterCount > 0 &&
                          ` (${activeFilterCount} ${activeFilterCount === 1 ? "filter" : "filters"} applied)`}
                      </div>
                    )}

                    {filteredLogFeed.length === 0 && (
                      <div className="text-center py-12">
                        <FileText
                          className="h-12 w-12 mx-auto mb-3"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        />
                        <p
                          className="text-sm font-semibold mb-1"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          No entries found
                        </p>
                        <p
                          className="text-xs"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Try adjusting your filters to see more
                          results
                        </p>
                        {activeFilterCount > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full mt-4"
                            onClick={clearAllFilters}
                          >
                            <X className="h-3 w-3 mr-1.5" />
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    )}

                    {filteredLogFeed.map((item, idx) => (
                      <div
                        key={item.id}
                        className="relative pl-7 group"
                      >
                        {/* Timeline Line */}
                        {idx !== filteredLogFeed.length - 1 && (
                          <div
                            className="absolute left-[9px] top-6 bottom-[-16px] w-px group-last:hidden"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-border-base-1)",
                            }}
                          ></div>
                        )}

                        {/* Icon */}
                        <div
                          className={cn(
                            "absolute left-0 top-0 h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10",
                            item.iconBg,
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-2.5 w-2.5",
                              item.iconColor,
                            )}
                          />
                        </div>

                        {/* Content */}
                        {editingLogId === item.id ? (
                          // EDIT MODE - Inline editing
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div
                                className="text-[11px]"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Editing entry...
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full h-6 px-2 text-[11px]"
                                  onClick={cancelEditingLog}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  className="rounded-full h-6 px-2 text-[11px]"
                                  style={{
                                    backgroundColor:
                                      "var(--color-brand-primary)",
                                  }}
                                  onClick={() =>
                                    saveEditedLog(item.id)
                                  }
                                >
                                  <Save className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                              </div>
                            </div>
                            <textarea
                              value={editedContent}
                              onChange={(e) =>
                                setEditedContent(e.target.value)
                              }
                              className="w-full px-2 py-1.5 text-[12px] border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                                minHeight: "60px",
                              }}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                  cancelEditingLog();
                                } else if (
                                  e.key === "Enter" &&
                                  (e.metaKey || e.ctrlKey)
                                ) {
                                  saveEditedLog(item.id);
                                }
                              }}
                            />
                            <div
                              className="text-[10px]"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              Press{" "}
                              <kbd className="px-1 py-0.5 bg-gray-100 rounded border text-[9px]">
                                Esc
                              </kbd>{" "}
                              to cancel or{" "}
                              <kbd className="px-1 py-0.5 bg-gray-100 rounded border text-[9px]">
                                ⌘/Ctrl + Enter
                              </kbd>{" "}
                              to save
                            </div>
                          </div>
                        ) : (
                          // DISPLAY MODE - Compact two-row layout
                          <div className="flex flex-col">
                            {/* Row 1: Author, Title, Time, Edit Button */}
                            <div className="flex items-center justify-between group/entry">
                              <div className="text-[12px] leading-tight">
                                <span
                                  className="font-semibold hover:underline cursor-pointer"
                                  style={{ color: "#155dfc" }}
                                >
                                  {item.author}
                                </span>
                                <span
                                  className="mx-1 cursor-pointer hover:underline"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                  onClick={() =>
                                    openLogEntryDetail(item)
                                  }
                                >
                                  {item.type === "Therapy" ? (
                                    <>
                                      logged a{" "}
                                      <span
                                        className="hover:underline font-medium"
                                        style={{
                                          color: "#155dfc",
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openTherapyDetail(
                                            item,
                                          );
                                        }}
                                      >
                                        Therapy
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      {item.title.startsWith(
                                        "logged a ",
                                      ) ? (
                                        <>
                                          logged a{" "}
                                          <span
                                            className="hover:underline font-medium"
                                            style={{
                                              color: "#155dfc",
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openLogEntryDetail(
                                                item,
                                              );
                                            }}
                                          >
                                            {item.title.replace(
                                              "logged a ",
                                              "",
                                            )}
                                          </span>
                                        </>
                                      ) : (
                                        <span
                                          className="hover:underline font-medium"
                                          style={{
                                            color: "#155dfc",
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openLogEntryDetail(
                                              item,
                                            );
                                          }}
                                        >
                                          {item.title}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </span>
                                {item.badges &&
                                  item.badges.length > 0 && (
                                    <>
                                      {item.badges.map((b) => (
                                        <span
                                          key={b}
                                          className="inline-flex items-center ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium"
                                          style={{
                                            backgroundColor:
                                              "#eff6ff",
                                            color: "#1447e6",
                                            border:
                                              "1px solid #dbeafe",
                                          }}
                                        >
                                          {b}
                                        </span>
                                      ))}
                                    </>
                                  )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div
                                  className="flex items-center gap-1"
                                  style={{
                                    fontSize: "10px",
                                    color: "#706e6b",
                                  }}
                                >
                                  <span>{item.time}</span>
                                  {item.edited &&
                                    item.editedAt && (
                                      <span className="italic">
                                        • edited {item.editedAt}
                                      </span>
                                    )}
                                </div>
                                {/* Edit Button - Only show if not already edited */}
                                {!editedLogs.has(item.id) && (
                                  <button
                                    onClick={() =>
                                      openEditModal(item)
                                    }
                                    className="p-1 hover:bg-gray-100 rounded"
                                    title="Edit entry"
                                  >
                                    <Edit2
                                      className="h-3 w-3"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Row 2: Content - Show updated content with option to view original */}
                            <div className="mt-1">
                              {/* Current/Updated Content */}
                              <div
                                className="text-[12px] leading-snug"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {item.content}
                              </div>

                              {/* Show "View original" link if edited */}
                              {item.edited &&
                                item.originalContent && (
                                  <div className="mt-1.5">
                                    <button
                                      onClick={() =>
                                        toggleOriginalContent(
                                          item.id,
                                        )
                                      }
                                      className="hover:underline flex items-center gap-0.5"
                                      style={{
                                        fontSize: "11px",
                                        color: "#155dfc",
                                      }}
                                    >
                                      {expandedOriginals.has(
                                        item.id,
                                      ) ? (
                                        <>
                                          <ChevronDown className="h-3 w-3" />
                                          Hide original
                                        </>
                                      ) : (
                                        <>
                                          <ChevronRight className="h-3 w-3" />
                                          Show original
                                        </>
                                      )}
                                    </button>

                                    {/* Original Content - Shown when expanded */}
                                    {expandedOriginals.has(
                                      item.id,
                                    ) && (
                                      <div
                                        className="mt-2 rounded-md p-2"
                                        style={{
                                          backgroundColor:
                                            "var(--slds-g-color-background-alt)",
                                          border:
                                            "1px solid var(--slds-g-color-border-base-1)",
                                        }}
                                      >
                                        <div
                                          className="text-[10px] font-semibold uppercase tracking-wide mb-1"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-weak)",
                                          }}
                                        >
                                          Original Entry
                                        </div>
                                        <div
                                          className="text-[12px] leading-snug"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-weak)",
                                            textDecoration:
                                              "line-through",
                                          }}
                                        >
                                          {item.originalContent}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="text-center pt-2">
                      <Button
                        variant="link"
                        className="rounded-full text-blue-600 text-xs"
                      >
                        View Additional Entries
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tasks" className="p-0 m-0">
                  <div>
                    {/* ── Task Table Toolbar ─────────────────── */}
                    <div
                      className="flex items-center justify-between px-4 py-2 gap-3 flex-wrap"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          />
                          <input
                            type="text"
                            value={plSearch}
                            onChange={(e) =>
                              setPlSearch(e.target.value)
                            }
                            placeholder="Search tasks…"
                            className="h-8 pl-8 pr-3 rounded slds-text-4 focus:outline-none w-44"
                            style={{
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          />
                        </div>
                        <button
                          onClick={() =>
                            setPlAdvanced((v) => !v)
                          }
                          className="h-8 px-3 rounded slds-text-3 font-medium flex items-center gap-1.5 transition-colors"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor: plAdvanced
                              ? "rgba(20,95,51,0.07)"
                              : "var(--slds-g-color-background-base)",
                            color: plAdvanced
                              ? "#145F33"
                              : "var(--slds-g-color-text-default)",
                          }}
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                          Filters
                          {(plFAssigned ||
                            plFRelated ||
                            plFStatus ||
                            plFCStart ||
                            plFCEnd) && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#145F33]" />
                          )}
                        </button>
                      </div>
                      <span
                        className="slds-text-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {plFiltered.length} task
                        {plFiltered.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Advanced Filters */}
                    {plAdvanced && (
                      <div
                        className="flex items-end gap-3 px-4 py-3 flex-wrap"
                        style={{
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-alt)",
                        }}
                      >
                        <div className="space-y-1.5">
                          <label
                            className="slds-form-label"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            CREATE DATE FROM
                          </label>
                          <DateInput
                            value={plFCStart}
                            onChange={setPlFCStart}
                            style={{
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                            }}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            className="slds-form-label"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            TO
                          </label>
                          <DateInput
                            value={plFCEnd}
                            onChange={setPlFCEnd}
                            style={{
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                            }}
                          />
                        </div>
                        <div className="space-y-1.5 min-w-[140px]">
                          <label
                            className="slds-form-label"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            ASSIGNED TO
                          </label>
                          <Select
                            value={plFAssigned || "__all__"}
                            onValueChange={(v) =>
                              setPlFAssigned(
                                v === "__all__" ? "" : v,
                              )
                            }
                          >
                            <SelectTrigger
                              className="h-9 slds-text-4 w-full"
                              style={{
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                              }}
                            >
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value="__all__"
                                className="slds-text-4"
                              >
                                All
                              </SelectItem>
                              {PL_STAFF.map((s) => (
                                <SelectItem
                                  key={s}
                                  value={s}
                                  className="slds-text-4"
                                >
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5 min-w-[140px]">
                          <label
                            className="slds-form-label"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            RELATED TO
                          </label>
                          <Select
                            value={plFRelated || "__all__"}
                            onValueChange={(v) =>
                              setPlFRelated(
                                v === "__all__" ? "" : v,
                              )
                            }
                          >
                            <SelectTrigger
                              className="h-9 slds-text-4 w-full"
                              style={{
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                              }}
                            >
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value="__all__"
                                className="slds-text-4"
                              >
                                All
                              </SelectItem>
                              {PL_CONSTITUENTS.map((c) => (
                                <SelectItem
                                  key={c}
                                  value={c}
                                  className="slds-text-4"
                                >
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5 min-w-[130px]">
                          <label
                            className="slds-form-label"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            STATUS
                          </label>
                          <Select
                            value={plFStatus || "__all__"}
                            onValueChange={(v) =>
                              setPlFStatus(
                                v === "__all__" ? "" : v,
                              )
                            }
                          >
                            <SelectTrigger
                              className="h-9 slds-text-4 w-full"
                              style={{
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                              }}
                            >
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value="__all__"
                                className="slds-text-4"
                              >
                                All
                              </SelectItem>
                              {(
                                [
                                  "Open",
                                  "In Progress",
                                  "Completed",
                                  "On Hold",
                                  "Cancelled",
                                ] as PlTaskStatus[]
                              ).map((s) => (
                                <SelectItem
                                  key={s}
                                  value={s}
                                  className="slds-text-4"
                                >
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <button
                          onClick={() => {
                            setPlFAssigned("");
                            setPlFRelated("");
                            setPlFStatus("");
                            setPlFCStart("");
                            setPlFCEnd("");
                            setPlSearch("");
                          }}
                          className="h-9 px-3 rounded slds-text-3 font-medium self-end transition-colors"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            color:
                              "var(--slds-g-color-text-weak)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        >
                          Clear
                        </button>
                      </div>
                    )}

                    {/* Tasks Table */}
                    <div className="overflow-x-auto">
                      <table
                        className="w-full"
                        style={{
                          borderCollapse: "collapse",
                          minWidth: "540px",
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-alt)",
                              borderBottom:
                                "2px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            {(
                              [
                                {
                                  col: "subject",
                                  label: "SUBJECT",
                                },
                                {
                                  col: "dueDate",
                                  label: "DUE DATE",
                                },
                                {
                                  col: "modifiedDate",
                                  label: "MODIFIED DATE",
                                },
                                {
                                  col: "status",
                                  label: "STATUS",
                                },
                              ] as {
                                col: typeof plSortCol;
                                label: string;
                              }[]
                            ).map(({ col, label }) => (
                              <th
                                key={col}
                                className="px-3 py-2.5 text-left slds-text-3 font-semibold cursor-pointer select-none whitespace-nowrap"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                                onClick={() =>
                                  togglePlSort(col)
                                }
                              >
                                {label}
                                <span
                                  className="inline-flex flex-col ml-1"
                                  style={{
                                    opacity:
                                      plSortCol === col
                                        ? 1
                                        : 0.3,
                                  }}
                                >
                                  <ChevronUp
                                    className="h-2.5 w-2.5 -mb-0.5"
                                    style={{
                                      color:
                                        plSortCol === col &&
                                        plSortDir === "asc"
                                          ? "#145F33"
                                          : "currentColor",
                                    }}
                                  />
                                  <ChevronDown
                                    className="h-2.5 w-2.5"
                                    style={{
                                      color:
                                        plSortCol === col &&
                                        plSortDir === "desc"
                                          ? "#145F33"
                                          : "currentColor",
                                    }}
                                  />
                                </span>
                              </th>
                            ))}
                            <th
                              className="px-3 py-2.5 text-center slds-text-3 font-semibold w-10"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              <MessageSquare className="h-3.5 w-3.5 inline" />
                            </th>
                            <th
                              className="px-3 py-2.5 text-right slds-text-3 font-semibold w-24"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              ACTIONS
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {plFiltered.length === 0 ? (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-6 py-10 text-center"
                              >
                                <p
                                  className="slds-text-4"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  No tasks match the selected
                                  filters.
                                </p>
                              </td>
                            </tr>
                          ) : (
                            plFiltered.map((task, idx) => {
                              const badge =
                                PL_BADGE[task.status];
                              const isOverdue =
                                task.status === "Open" &&
                                parsePlDate(task.dueDate) <
                                  parsePlDate(PL_TODAY);
                              const cmts = task.history.filter(
                                (h) => h.type === "comment",
                              ).length;
                              return (
                                <tr
                                  key={task.id}
                                  style={{
                                    borderBottom:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                    backgroundColor:
                                      idx % 2 === 0
                                        ? "var(--slds-g-color-background-base)"
                                        : "var(--slds-g-color-background-alt)",
                                  }}
                                >
                                  <td
                                    className="px-3 py-2.5 slds-text-4 max-w-[300px]"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      {task.isSystem && (
                                        <span
                                          className="slds-text-3 px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                                          style={{
                                            backgroundColor:
                                              "rgba(146,64,14,0.08)",
                                            color: "#92400E",
                                            border:
                                              "1px solid rgba(146,64,14,0.2)",
                                          }}
                                        >
                                          System
                                        </span>
                                      )}
                                      <span
                                        className="truncate"
                                        title={task.subject}
                                      >
                                        {task.subject}
                                      </span>
                                    </div>
                                  </td>
                                  <td
                                    className="px-3 py-2.5 slds-text-4 whitespace-nowrap"
                                    style={{
                                      color: isOverdue
                                        ? "#c23934"
                                        : "var(--slds-g-color-text-default)",
                                      fontWeight: isOverdue
                                        ? 600
                                        : undefined,
                                    }}
                                  >
                                    {task.dueDate || "—"}
                                  </td>
                                  <td
                                    className="px-3 py-2.5 slds-text-4 whitespace-nowrap"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    {task.modifiedDate}
                                  </td>
                                  <td className="px-3 py-2.5 whitespace-nowrap">
                                    <span
                                      className="slds-text-3 px-2 py-0.5 rounded-full font-medium"
                                      style={{
                                        backgroundColor:
                                          badge.bg,
                                        color: badge.color,
                                      }}
                                    >
                                      {task.status}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2.5 text-center">
                                    {cmts > 0 ? (
                                      <span
                                        className="inline-flex items-center gap-1 slds-text-3"
                                        style={{
                                          color: "#0176d3",
                                        }}
                                      >
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        {cmts}
                                      </span>
                                    ) : (
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
                                  <td className="px-3 py-2.5 text-right">
                                    <div className="inline-flex items-center gap-1">
                                      <button
                                        onClick={() =>
                                          openPlDetail(task)
                                        }
                                        className="inline-flex items-center gap-1 px-2.5 h-7 rounded slds-text-3 font-medium transition-colors"
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
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          setPlHiddenIds(
                                            (prev) =>
                                              new Set([
                                                ...prev,
                                                task.id,
                                              ]),
                                          )
                                        }
                                        title="Hide from view"
                                        className="h-7 w-7 rounded flex items-center justify-center transition-colors"
                                        style={{
                                          color:
                                            "var(--slds-g-color-text-weak)",
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
                                        <EyeOff className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* ── Connections Section — mirrors Admissions > Overview > Connections ── */}
                    <div
                      style={{
                        borderTop:
                          "2px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {/* Header: title + count + day-range filter + search + Add button */}
                      <div
                        className="px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap"
                        style={{
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-alt)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[13px] font-semibold"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            Connections
                          </span>
                          <span
                            className="text-[12px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor:
                                "rgba(20,95,51,0.1)",
                              color: "#145F33",
                            }}
                          >
                            {connFiltered.length}
                          </span>
                          <span
                            style={{
                              color:
                                "var(--slds-g-color-border-base-1)",
                            }}
                          >
                            ·
                          </span>
                          {/* Day-range pills */}
                          {[
                            { days: 0, label: "Today" },
                            { days: 2, label: "+3 Days" },
                            { days: 6, label: "+7 Days" },
                            { days: 29, label: "+30 Days" },
                            { days: 999, label: "All" },
                            { days: 24, label: "Incomplete" },
                          ].map(({ days, label }) => (
                            <button
                              key={days}
                              onClick={() => setConnDays(days)}
                              className="px-2.5 py-1 rounded text-[12px] font-medium transition-colors"
                              style={{
                                backgroundColor:
                                  connDays === days
                                    ? "#145F33"
                                    : "var(--slds-g-color-background-base)",
                                color:
                                  connDays === days
                                    ? "white"
                                    : "var(--slds-g-color-text-default)",
                                border: "1px solid",
                                borderColor:
                                  connDays === days
                                    ? "#145F33"
                                    : "var(--slds-g-color-border-base-1)",
                              }}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Search
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Search connections…"
                              className="h-8 pl-8 pr-3 rounded text-[13px] focus:outline-none w-44"
                              style={{
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            />
                          </div>
                          <button
                            className="h-8 px-3 rounded-full text-[12px] font-medium text-white flex items-center gap-1.5"
                            style={{
                              backgroundColor: "#145F33",
                            }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Connection
                          </button>
                        </div>
                      </div>

                      {/* Table — same columns as Admissions ConnectionsSection */}
                      <div className="overflow-x-auto">
                        <table
                          className="w-full"
                          style={{
                            borderCollapse: "collapse",
                            minWidth: "900px",
                          }}
                        >
                          <thead>
                            <tr
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-alt)",
                                borderBottom:
                                  "2px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              {[
                                { label: "ID", w: "80px" },
                                {
                                  label: "START DATE / TIME",
                                  w: "",
                                },
                                {
                                  label: "END DATE / TIME",
                                  w: "",
                                },
                                {
                                  label: "CONNECTION TYPE",
                                  w: "",
                                },
                                {
                                  label: "ATTENDED",
                                  w: "80px",
                                },
                                {
                                  label: "PARTICIPANTS",
                                  w: "",
                                },
                                { label: "STATUS", w: "110px" },
                                {
                                  label: "ACTIONS",
                                  w: "100px",
                                },
                              ].map(({ label, w }) => (
                                <th
                                  key={label}
                                  className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                    width: w || undefined,
                                  }}
                                >
                                  {label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {connFiltered.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={8}
                                  className="px-6 py-10 text-center"
                                >
                                  <p
                                    className="text-[13px]"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    No connections in the
                                    selected date range.
                                  </p>
                                </td>
                              </tr>
                            ) : (
                              connFiltered.map((conn, idx) => {
                                const statusStyle: Record<
                                  string,
                                  {
                                    bg: string;
                                    color: string;
                                    border: string;
                                  }
                                > = {
                                  "Submitted/Finalized": {
                                    bg: "#e8f5e9",
                                    color: "#145F33",
                                    border: "#a3d7a8",
                                  },
                                  Completed: {
                                    bg: "#e8f5e9",
                                    color: "#145F33",
                                    border: "#a3d7a8",
                                  },
                                  Scheduled: {
                                    bg: "#e8f4f8",
                                    color: "#0176d3",
                                    border: "#9acced",
                                  },
                                  Incomplete: {
                                    bg: "#fff8e1",
                                    color: "#b45309",
                                    border: "#fed35a",
                                  },
                                  Cancelled: {
                                    bg: "#fef2f2",
                                    color: "#c23934",
                                    border: "#fecdca",
                                  },
                                };
                                const s = statusStyle[
                                  conn.status
                                ] || {
                                  bg: "var(--slds-g-color-background-alt)",
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                  border:
                                    "var(--slds-g-color-border-base-1)",
                                };
                                return (
                                  <tr
                                    key={conn.id}
                                    className="group"
                                    style={{
                                      borderBottom:
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
                                    <td
                                      className="px-3 py-2.5 text-[13px] font-medium"
                                      style={{
                                        color: "#145F33",
                                      }}
                                    >
                                      CON-
                                      {String(conn.id).padStart(
                                        4,
                                        "0",
                                      )}
                                    </td>
                                    <td
                                      className="px-3 py-2.5 text-[13px] whitespace-nowrap"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {conn.startDate} 9:00 AM
                                    </td>
                                    <td
                                      className="px-3 py-2.5 text-[13px] whitespace-nowrap"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {conn.startDate} 10:00 AM
                                    </td>
                                    <td
                                      className="px-3 py-2.5 text-[13px]"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {conn.type}
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                      <div
                                        className="inline-flex items-center justify-center h-4 w-4 rounded border"
                                        style={{
                                          borderColor:
                                            "var(--slds-g-color-border-base-1)",
                                          backgroundColor:
                                            conn.status ===
                                              "Completed" ||
                                            conn.status ===
                                              "Submitted/Finalized"
                                              ? "#145F33"
                                              : "transparent",
                                        }}
                                      >
                                        {(conn.status ===
                                          "Completed" ||
                                          conn.status ===
                                            "Submitted/Finalized") && (
                                          <Check className="h-2.5 w-2.5 text-white" />
                                        )}
                                      </div>
                                    </td>
                                    <td
                                      className="px-3 py-2.5 text-[13px] max-w-[180px]"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      <span
                                        className="truncate block"
                                        title={
                                          conn.participants
                                        }
                                      >
                                        {conn.participants}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2.5 whitespace-nowrap">
                                      <span
                                        className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                        style={{
                                          backgroundColor: s.bg,
                                          color: s.color,
                                          border: `1px solid ${s.border}`,
                                        }}
                                      >
                                        {conn.status}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2.5">
                                      <div className="flex items-center gap-1">
                                        <button
                                          className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                          title="View"
                                        >
                                          <Eye
                                            className="h-3.5 w-3.5"
                                            style={{
                                              color: "#0176d3",
                                            }}
                                          />
                                        </button>
                                        <button
                                          className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                          title="Edit"
                                        >
                                          <Pencil
                                            className="h-3.5 w-3.5"
                                            style={{
                                              color: "#0176d3",
                                            }}
                                          />
                                        </button>
                                        <button
                                          className="p-1.5 rounded hover:bg-red-50 transition-colors"
                                          title="Delete"
                                        >
                                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                      {/* Row count footer */}
                      <div
                        className="px-4 py-2"
                        style={{
                          borderTop:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-alt)",
                        }}
                      >
                        <p
                          className="text-[12px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Showing {connFiltered.length}{" "}
                          connection
                          {connFiltered.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="handovers"
                  className="p-0 m-0"
                >
                  {/* Handovers Header - SLDS v2 */}
                  <div
                    className="px-4 py-3"
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    {/* Row 1: Title and New Handover Button */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileText
                          className="h-4 w-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        />
                        <span
                          className="text-[13px] font-semibold"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          Shift Handover Notes
                        </span>
                        <span
                          style={{
                            color:
                              "var(--slds-g-color-border-base-1)",
                          }}
                        >
                          •
                        </span>
                        <span
                          className="text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {filteredHandovers.length} Records
                        </span>
                      </div>
                      <Button
                        className="rounded-full h-8 text-[13px] text-white shadow-none"
                        style={{
                          backgroundColor:
                            "var(--color-brand-primary)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = "0.9";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = "1";
                        }}
                        onClick={handleNewHandover}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        New Handover Note
                      </Button>
                    </div>

                    {/* Row 2: Shift Filters and Date Filters */}
                    <div className="flex flex-wrap items-center justify-between gap-x-1.5 gap-y-2">
                      {/* Shift Filters */}
                      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs px-2.5 py-1 font-medium whitespace-nowrap"
                          style={{
                            height: "32px",
                            backgroundColor:
                              selectedShift === "all"
                                ? "var(--color-brand-primary)"
                                : "white",
                            color:
                              selectedShift === "all"
                                ? "white"
                                : "#080707",
                            border: "1px solid #dddbda",
                            fontSize: "13px",
                          }}
                          onClick={() =>
                            setSelectedShift("all")
                          }
                        >
                          All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs px-2.5 py-1 font-medium whitespace-nowrap"
                          style={{
                            height: "32px",
                            backgroundColor:
                              selectedShift === "morning"
                                ? "var(--color-brand-primary)"
                                : "white",
                            color:
                              selectedShift === "morning"
                                ? "white"
                                : "#080707",
                            border: "1px solid #dddbda",
                            fontSize: "13px",
                          }}
                          onClick={() =>
                            setSelectedShift("morning")
                          }
                        >
                          Morning (7A–3P)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs px-2.5 py-1 font-medium whitespace-nowrap"
                          style={{
                            height: "32px",
                            backgroundColor:
                              selectedShift === "afternoon"
                                ? "var(--color-brand-primary)"
                                : "white",
                            color:
                              selectedShift === "afternoon"
                                ? "white"
                                : "#080707",
                            border: "1px solid #dddbda",
                            fontSize: "13px",
                          }}
                          onClick={() =>
                            setSelectedShift("afternoon")
                          }
                        >
                          Evening (3P–11P)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs px-2.5 py-1 font-medium whitespace-nowrap"
                          style={{
                            height: "32px",
                            backgroundColor:
                              selectedShift === "night"
                                ? "var(--color-brand-primary)"
                                : "white",
                            color:
                              selectedShift === "night"
                                ? "white"
                                : "#080707",
                            border: "1px solid #dddbda",
                            fontSize: "13px",
                          }}
                          onClick={() =>
                            setSelectedShift("night")
                          }
                        >
                          Overnight (11P–7A)
                        </Button>
                      </div>

                      {/* Date Range Filters */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs px-2.5 py-1 font-medium whitespace-nowrap"
                          style={{
                            height: "32px",
                            backgroundColor:
                              dateRangeFilter === "last24hours"
                                ? "var(--color-brand-primary)"
                                : "white",
                            color:
                              dateRangeFilter === "last24hours"
                                ? "white"
                                : "#080707",
                            border: "1px solid #dddbda",
                            fontSize: "13px",
                          }}
                          onClick={() =>
                            setDateRangeFilter("last24hours")
                          }
                        >
                          24 Hours
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs px-2.5 py-1 font-medium whitespace-nowrap"
                          style={{
                            height: "32px",
                            backgroundColor:
                              dateRangeFilter === "last7days"
                                ? "var(--color-brand-primary)"
                                : "white",
                            color:
                              dateRangeFilter === "last7days"
                                ? "white"
                                : "#080707",
                            border: "1px solid #dddbda",
                            fontSize: "13px",
                          }}
                          onClick={() =>
                            setDateRangeFilter("last7days")
                          }
                        >
                          Last 7 Days
                        </Button>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <DateInput
                            value={isoToMdy(customStartDate)}
                            onChange={(v) =>
                              ((e) => {
                                setCustomStartDate(
                                  e.target.value,
                                );
                                if (
                                  e.target.value &&
                                  customEndDate
                                )
                                  setDateRangeFilter("custom");
                              })({
                                target: { value: mdyToIso(v) },
                              })
                            }
                            placeholder="Start Date"
                            className="h-8 text-xs px-2 pr-3 w-[118px] [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:mr-0.5 [&::-webkit-inner-spin-button]:hidden [&::-webkit-clear-button]:hidden"
                            style={{
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              color:
                                "var(--slds-g-color-text-default)",
                              borderRadius: "0.25rem",
                              lineHeight: "1",
                              fontSize: "13px",
                            }}
                          />
                          <DateInput
                            value={isoToMdy(customEndDate)}
                            onChange={(v) =>
                              ((e) => {
                                setCustomEndDate(
                                  e.target.value,
                                );
                                if (
                                  customStartDate &&
                                  e.target.value
                                )
                                  setDateRangeFilter("custom");
                              })({
                                target: { value: mdyToIso(v) },
                              })
                            }
                            placeholder="End Date"
                            className="h-8 text-xs px-2 pr-3 w-[118px] [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:mr-0.5 [&::-webkit-inner-spin-button]:hidden [&::-webkit-clear-button]:hidden"
                            style={{
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              color:
                                "var(--slds-g-color-text-default)",
                              borderRadius: "0.25rem",
                              lineHeight: "1",
                              fontSize: "13px",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shift Handovers Accordion */}
                  <div
                    className="divide-y"
                    style={{
                      borderTop:
                        "1px solid var(--slds-g-color-border-base-1)",
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                    }}
                  >
                    {filteredHandovers.map(
                      (handover, index) => {
                        const isExpanded =
                          expandedShiftId === handover.id;
                        const isCurrentShift = index === 0; // First item is current shift

                        return (
                          <div
                            key={handover.id}
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                            }}
                          >
                            {/* Accordion Header */}
                            <div
                              className="px-4 py-4 cursor-pointer hover:bg-opacity-60 transition-colors"
                              style={{
                                backgroundColor: isExpanded
                                  ? "var(--slds-g-color-background-row-hover)"
                                  : "transparent",
                              }}
                              onClick={() =>
                                setExpandedShiftId(
                                  isExpanded ? -1 : handover.id,
                                )
                              }
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                                    style={{
                                      backgroundColor:
                                        isCurrentShift
                                          ? "#E8F5E9"
                                          : "var(--slds-g-color-background-alt)",
                                    }}
                                  >
                                    <FileText
                                      className="h-4 w-4"
                                      style={{
                                        color: isCurrentShift
                                          ? "#145F33"
                                          : "var(--slds-g-color-text-weak)",
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h3
                                        className="text-sm font-semibold"
                                        style={{
                                          color:
                                            "var(--slds-g-color-text-default)",
                                        }}
                                      >
                                        {isCurrentShift
                                          ? "Current Shift"
                                          : displayShiftLabel(
                                              handover.shift,
                                            )}
                                      </h3>
                                      {handover.criticalCount >
                                        0 && (
                                        <Badge className="bg-[#feded8] text-[#ba0517] border-[#fdb9aa] text-[11px] px-2 py-0.5 h-5 flex items-center gap-1">
                                          <AlertTriangle className="h-3 w-3" />
                                          {
                                            handover.criticalCount
                                          }
                                        </Badge>
                                      )}
                                      <Badge
                                        className="text-[10px] px-2 py-0.5 rounded-full h-5"
                                        style={{
                                          backgroundColor:
                                            handover.aiGenerated
                                              ? "#E8F4F9"
                                              : "#FEF7E0",
                                          color:
                                            handover.aiGenerated
                                              ? "#014486"
                                              : "#705E2E",
                                          border: "none",
                                        }}
                                      >
                                        {handover.aiGenerated
                                          ? "AI Generated"
                                          : "Manual"}
                                      </Badge>
                                    </div>
                                    <div
                                      className="flex items-center gap-2 mt-1 text-xs flex-wrap"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      <span>
                                        {handover.date}
                                      </span>
                                      <span>•</span>
                                      <span>
                                        {handover.timestamp}
                                      </span>
                                      <span>•</span>
                                      <span>
                                        {handover.author}
                                      </span>
                                    </div>
                                    {handover.checklist && (
                                      <div className="mt-1">
                                        <ChecklistIndicator
                                          result={
                                            handover.checklist
                                          }
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <ChevronDown
                                  className={cn(
                                    "h-5 w-5 shrink-0 transition-transform duration-200",
                                    isExpanded &&
                                      "transform rotate-180",
                                  )}
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                />
                              </div>
                            </div>

                            {/* Accordion Content */}
                            {isExpanded && (
                              <div className="px-4 pb-4 space-y-3">
                                {/* Shift Summary Content */}
                                <div
                                  className="p-3 rounded text-sm whitespace-pre-wrap font-mono"
                                  style={{
                                    border:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                    backgroundColor:
                                      "var(--slds-g-color-background-alt)",
                                    color:
                                      "var(--slds-g-color-text-default)",
                                    maxHeight: "400px",
                                    overflowY: "auto",
                                  }}
                                >
                                  {/* Always this record's saved summary —
                                      never the open Create draft. */}
                                  {handover.summary}
                                </div>

                                {/* Quick Actions */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full h-8 text-[13px]"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewHandover(handover);
                                    }}
                                    style={{
                                      border:
                                        "1px solid var(--slds-g-color-border-base-1)",
                                      backgroundColor:
                                        "var(--slds-g-color-background-base)",
                                    }}
                                  >
                                    <Eye className="h-3 w-3 mr-1.5" />
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full h-8 text-[13px]"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditHandover(handover);
                                    }}
                                    style={{
                                      border:
                                        "1px solid var(--slds-g-color-border-base-1)",
                                      backgroundColor:
                                        "var(--slds-g-color-background-base)",
                                    }}
                                  >
                                    <Edit2 className="h-3 w-3 mr-1.5" />
                                    Edit Summary
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full h-8 text-[13px]"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEmailSubject(
                                        `Shift Handover - ${program.name} - ${handover.date}`,
                                      );
                                      setEmailBody(handover.summary);
                                      setEmailDialogOpen(true);
                                    }}
                                    style={{
                                      border:
                                        "1px solid var(--slds-g-color-border-base-1)",
                                      backgroundColor:
                                        "var(--slds-g-color-background-base)",
                                    }}
                                  >
                                    <Mail className="h-3 w-3 mr-1.5" />
                                    Email Summary
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full h-8 text-[13px]"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const content =
                                        handover.summary;
                                      const blob = new Blob(
                                        [content],
                                        { type: "text/plain" },
                                      );
                                      const url =
                                        window.URL.createObjectURL(
                                          blob,
                                        );
                                      const a =
                                        document.createElement(
                                          "a",
                                        );
                                      a.href = url;
                                      a.download = `Shift-Handover-${handover.date.replace(/,|\s/g, "-")}.txt`;
                                      document.body.appendChild(
                                        a,
                                      );
                                      a.click();
                                      document.body.removeChild(
                                        a,
                                      );
                                      window.URL.revokeObjectURL(
                                        url,
                                      );
                                    }}
                                    style={{
                                      border:
                                        "1px solid var(--slds-g-color-border-base-1)",
                                      backgroundColor:
                                        "var(--slds-g-color-background-base)",
                                    }}
                                  >
                                    <Download className="h-3 w-3 mr-1.5" />
                                    Download
                                  </Button>
                                  {!isCurrentShift && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="rounded-full h-8 text-[13px] ml-auto"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteHandover(
                                          handover.id,
                                        );
                                      }}
                                      style={{
                                        border:
                                          "1px solid #ba0517",
                                        color: "#ba0517",
                                        backgroundColor:
                                          "var(--slds-g-color-background-base)",
                                      }}
                                    >
                                      <X className="h-3 w-3 mr-1.5" />
                                      Delete
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                </TabsContent>

                <TabsContent
                  value="behavioral"
                  className="p-0 m-0"
                >
                  {/* Behavioral Analysis Header - SLDS v2 */}
                  <div
                    className="px-4 py-3"
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className="h-4 w-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        />
                        <span
                          className="text-[13px] font-semibold"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          Weekly Behavioral Summary
                        </span>
                        <span
                          style={{
                            color:
                              "var(--slds-g-color-border-base-1)",
                          }}
                        >
                          •
                        </span>
                        <span
                          className="text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          June 19-25, 2024
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full h-8 text-[13px] shadow-none"
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
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Export Report
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Weekly Trends Overview - SLDS v2 */}
                    <div className="grid grid-cols-5 gap-3">
                      <div
                        className="rounded-[8px] p-3"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                        }}
                      >
                        <div
                          className="text-[11px] font-medium mb-1"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Total Incidents
                        </div>
                        <div
                          className="text-[28px] leading-none font-bold"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {
                            BEHAVIORAL_SUMMARY.weeklyTrends
                              .totalIncidents
                          }
                        </div>
                        <div className="text-[11px] text-[#2e844a] mt-1.5 flex items-center gap-1">
                          <ArrowRight className="h-3 w-3 rotate-[-45deg]" />
                          {Math.abs(
                            BEHAVIORAL_SUMMARY.weeklyTrends
                              .comparedToLastWeek,
                          )}{" "}
                          fewer
                        </div>
                      </div>
                      <div
                        className="rounded-[8px] p-3"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                        }}
                      >
                        <div
                          className="text-[11px] font-medium mb-1"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Avg Per Day
                        </div>
                        <div
                          className="text-[28px] leading-none font-bold"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {BEHAVIORAL_SUMMARY.weeklyTrends.avgPerDay.toFixed(
                            1,
                          )}
                        </div>
                        <div
                          className="text-[11px] mt-1.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          incidents/day
                        </div>
                      </div>
                      <div
                        className="rounded-[8px] p-3"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                        }}
                      >
                        <div
                          className="text-[11px] font-medium mb-1"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Most Common
                        </div>
                        <div
                          className="text-[13px] font-bold leading-tight mt-1"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {
                            BEHAVIORAL_SUMMARY.weeklyTrends
                              .mostCommonType
                          }
                        </div>
                        <div
                          className="text-[11px] mt-1"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          incident type
                        </div>
                      </div>
                      <div
                        className="rounded-[8px] p-3"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                        }}
                      >
                        <div
                          className="text-[11px] font-medium mb-1"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Peak Time
                        </div>
                        <div
                          className="text-[13px] font-bold leading-tight mt-1"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {
                            BEHAVIORAL_SUMMARY.weeklyTrends
                              .peakTime
                          }
                        </div>
                        <div
                          className="text-[11px] mt-1"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          time window
                        </div>
                      </div>
                      <div
                        className="rounded-[8px] p-3"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                        }}
                      >
                        <div className="text-[11px] text-[#706e6b] font-medium mb-1">
                          Compliance
                        </div>
                        <div className="text-[28px] leading-none font-bold text-[#2e844a]">
                          96%
                        </div>
                        <div className="text-[11px] text-[#2e844a] mt-1.5">
                          Above target
                        </div>
                      </div>
                    </div>

                    {/* Youth Breakdown - SLDS v2 */}
                    <div
                      className="rounded-[8px] overflow-hidden"
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
                        <h3
                          className="text-[13px] font-semibold"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          Youth Behavioral Status
                        </h3>
                      </div>
                      <div>
                        {(
                          BEHAVIORAL_SUMMARY?.youthBreakdown ||
                          []
                        ).map((youth) => (
                          <div key={youth.name}>
                            {/* Youth Row */}
                            <div
                              className="px-4 py-3 transition-colors"
                              style={{
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "var(--slds-g-color-background-alt)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div
                                  className="flex items-center gap-3 flex-1 cursor-pointer"
                                  onClick={() =>
                                    setExpandedYouth(
                                      expandedYouth ===
                                        youth.name
                                        ? null
                                        : youth.name,
                                    )
                                  }
                                >
                                  <div
                                    className={cn(
                                      "h-8 w-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold",
                                      youth.color,
                                    )}
                                  >
                                    {youth.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </div>
                                  <div>
                                    <div className="text-[13px] font-medium text-[#080707]">
                                      {youth.name}
                                    </div>
                                    <div className="text-[11px] text-[#706e6b] flex items-center gap-2 mt-0.5">
                                      <span>
                                        {youth.incidents}{" "}
                                        incident
                                        {youth.incidents !== 1
                                          ? "s"
                                          : ""}{" "}
                                        this week
                                      </span>
                                      <span className="text-[#c9c7c5]">
                                        •
                                      </span>
                                      <span
                                        className={cn(
                                          "font-medium",
                                          youth.trend ===
                                            "improving" &&
                                            "text-[#2e844a]",
                                          youth.trend ===
                                            "stable" &&
                                            "text-[#014486]",
                                        )}
                                      >
                                        {youth.trend ===
                                        "improving"
                                          ? "↓ Improving"
                                          : "→ Stable"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={cn(
                                      "font-semibold text-[11px] px-2 py-0.5 h-5",
                                      youth.incidents === 0 &&
                                        "bg-[#cdefc4] text-[#2e844a] border-[#91db8b]",
                                      youth.incidents === 1 &&
                                        "bg-[#fef8e6] text-[#b28500] border-[#fed35a]",
                                      youth.incidents > 1 &&
                                        "bg-[#feded8] text-[#ba0517] border-[#fdb9aa]",
                                    )}
                                  >
                                    {youth.incidents === 0
                                      ? "Excellent"
                                      : youth.incidents === 1
                                        ? "Good"
                                        : "Needs Support"}
                                  </Badge>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 hover:bg-[#f3f2f2]"
                                        onClick={(e) =>
                                          e.stopPropagation()
                                        }
                                      >
                                        <MoreHorizontal className="h-4 w-4 text-[#706e6b]" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-56 p-1 shadow-lg"
                                      align="end"
                                      style={{
                                        backgroundColor:
                                          "var(--slds-g-color-background-base)",
                                        border:
                                          "1px solid var(--slds-g-color-border-base-1)",
                                      }}
                                    >
                                      <div className="space-y-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="w-full justify-start h-8 text-[13px] hover:bg-[#f3f2f2]"
                                          onClick={() => {
                                            // View full profile
                                          }}
                                        >
                                          <User className="h-3.5 w-3.5 mr-2" />
                                          View Full Profile
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="w-full justify-start h-8 text-[13px] hover:bg-[#f3f2f2]"
                                          onClick={() => {
                                            // Add incident report
                                          }}
                                        >
                                          <AlertTriangle className="h-3.5 w-3.5 mr-2" />
                                          Add Incident Report
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="w-full justify-start h-8 text-[13px] hover:bg-[#f3f2f2]"
                                          onClick={() => {
                                            // View history
                                          }}
                                        >
                                          <Clock className="h-3.5 w-3.5 mr-2" />
                                          View History
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="w-full justify-start h-8 text-[13px] hover:bg-[#f3f2f2]"
                                          onClick={() => {
                                            // Generate report
                                          }}
                                        >
                                          <FileText className="h-3.5 w-3.5 mr-2" />
                                          Generate Report
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="w-full justify-start h-8 text-[13px] hover:bg-[#f3f2f2]"
                                          onClick={() => {
                                            // Contact team
                                          }}
                                        >
                                          <Mail className="h-3.5 w-3.5 mr-2" />
                                          Contact Team
                                        </Button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 hover:bg-[#f3f2f2]"
                                    onClick={() =>
                                      setExpandedYouth(
                                        expandedYouth ===
                                          youth.name
                                          ? null
                                          : youth.name,
                                      )
                                    }
                                  >
                                    <ChevronDown
                                      className={cn(
                                        "h-4 w-4 text-[#706e6b] transition-transform",
                                        expandedYouth ===
                                          youth.name &&
                                          "rotate-180",
                                      )}
                                    />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedYouth === youth.name && (
                              <div className="px-4 py-3 bg-[#fafaf9] border-b border-[#dddbda]">
                                <div className="space-y-3">
                                  {/* Quick Stats */}
                                  <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-white border border-[#dddbda] rounded p-2">
                                      <div className="text-[10px] text-[#706e6b] uppercase tracking-wide mb-0.5">
                                        Last Incident
                                      </div>
                                      <div className="text-[12px] font-semibold text-[#080707]">
                                        {youth.lastIncident}
                                      </div>
                                    </div>
                                    <div className="bg-white border border-[#dddbda] rounded p-2">
                                      <div className="text-[10px] text-[#706e6b] uppercase tracking-wide mb-0.5">
                                        Strengths
                                      </div>
                                      <div className="text-[12px] font-semibold text-[#080707]">
                                        {youth.strengths.length}{" "}
                                        identified
                                      </div>
                                    </div>
                                    <div className="bg-white border border-[#dddbda] rounded p-2">
                                      <div className="text-[10px] text-[#706e6b] uppercase tracking-wide mb-0.5">
                                        Active Goals
                                      </div>
                                      <div className="text-[12px] font-semibold text-[#080707]">
                                        {youth.goals.length}{" "}
                                        goals
                                      </div>
                                    </div>
                                  </div>

                                  {/* Intervention Plan */}
                                  <div className="bg-[#e8f4f9] border border-[#9acced] rounded p-3">
                                    <div className="text-[11px] font-semibold text-[#014486] mb-1">
                                      Current Intervention Plan
                                    </div>
                                    <div className="text-[12px] text-[#080707]">
                                      {youth.interventionPlan}
                                    </div>
                                  </div>

                                  {/* Recent History */}
                                  <div>
                                    <div className="text-[11px] font-semibold text-[#080707] mb-2">
                                      Recent Activity
                                    </div>
                                    <div className="space-y-2">
                                      {youth.recentHistory.map(
                                        (item, idx) => (
                                          <div
                                            key={idx}
                                            className="flex gap-2 bg-white border border-[#dddbda] rounded p-2"
                                          >
                                            <div
                                              className={cn(
                                                "shrink-0 w-1 rounded",
                                                item.type ===
                                                  "Incident" &&
                                                  "bg-[#fdb9aa]",
                                                item.type ===
                                                  "Achievement" &&
                                                  "bg-[#91db8b]",
                                                item.type ===
                                                  "Observation" &&
                                                  "bg-[#9acced]",
                                              )}
                                            />
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-[10px] text-[#706e6b]">
                                                  {item.date}
                                                </span>
                                                <Badge
                                                  className={cn(
                                                    "text-[10px] px-1.5 py-0 h-4",
                                                    item.type ===
                                                      "Incident" &&
                                                      "bg-[#feded8] text-[#ba0517] border-[#fdb9aa]",
                                                    item.type ===
                                                      "Achievement" &&
                                                      "bg-[#cdefc4] text-[#2e844a] border-[#91db8b]",
                                                    item.type ===
                                                      "Observation" &&
                                                      "bg-[#e8f4f9] text-[#014486] border-[#9acced]",
                                                  )}
                                                >
                                                  {item.type}
                                                </Badge>
                                                {item.severity && (
                                                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-[#fef8e6] text-[#b28500] border-[#fed35a]">
                                                    {
                                                      item.severity
                                                    }
                                                  </Badge>
                                                )}
                                              </div>
                                              <div className="text-[11px] text-[#3e3e3c]">
                                                {item.note}
                                              </div>
                                            </div>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>

                                  {/* Strengths & Goals */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <div className="text-[11px] font-semibold text-[#080707] mb-1.5">
                                        Strengths
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {youth.strengths.map(
                                          (strength, idx) => (
                                            <Badge
                                              key={idx}
                                              className="bg-[#cdefc4] text-[#2e844a] border-[#91db8b] text-[10px] px-2 py-0.5"
                                            >
                                              {strength}
                                            </Badge>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-[11px] font-semibold text-[#080707] mb-1.5">
                                        Active Goals
                                      </div>
                                      <div className="space-y-1">
                                        {youth.goals.map(
                                          (goal, idx) => (
                                            <div
                                              key={idx}
                                              className="flex items-start gap-1.5 text-[11px] text-[#3e3e3c]"
                                            >
                                              <Check className="h-3 w-3 text-[#014486] shrink-0 mt-0.5" />
                                              <span>
                                                {goal}
                                              </span>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-2 pt-2 border-t border-[#dddbda]">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-[11px] border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
                                      onClick={() => {
                                        /* View profile */
                                      }}
                                    >
                                      <User className="h-3 w-3 mr-1" />
                                      View Profile
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-[11px] border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
                                      onClick={() => {
                                        /* Add note */
                                      }}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add Note
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-[11px] border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
                                      onClick={() => {
                                        /* Generate report */
                                      }}
                                    >
                                      <Download className="h-3 w-3 mr-1" />
                                      Export
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Incidents - SLDS v2 */}
                    <div className="border border-[#dddbda] rounded-[8px] bg-white overflow-hidden">
                      <div className="px-4 py-3 border-b border-[#dddbda] bg-[#fafaf9]">
                        <h3 className="text-[13px] font-semibold text-[#080707]">
                          Recent Behavioral Incidents
                        </h3>
                      </div>
                      <div className="divide-y divide-[#dddbda]">
                        {(BEHAVIORAL_INCIDENTS || []).map(
                          (incident) => (
                            <div
                              key={incident.id}
                              className="px-4 py-3 hover:bg-[#fafaf9] transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={cn(
                                      "font-medium text-[11px] px-2 py-0.5 h-5",
                                      incident.severity ===
                                        "Low" &&
                                        "bg-[#fef8e6] text-[#b28500] border-[#fed35a]",
                                      incident.severity ===
                                        "Medium" &&
                                        "bg-[#feded8] text-[#ba0517] border-[#fdb9aa]",
                                      incident.severity ===
                                        "High" &&
                                        "bg-[#feded8] text-[#ba0517] border-[#ea001e]",
                                    )}
                                  >
                                    {incident.severity}
                                  </Badge>
                                  <span className="text-[11px] text-[#706e6b]">
                                    {incident.date} at{" "}
                                    {incident.time}
                                  </span>
                                </div>
                                <Badge className="bg-[#e8f4f9] text-[#014486] border-[#9acced] text-[11px] px-2 py-0.5 h-5">
                                  {incident.type}
                                </Badge>
                              </div>

                              <div className="mb-2">
                                <span className="text-[13px] font-semibold text-[#080707]">
                                  {incident.youth}
                                </span>
                              </div>

                              <div className="space-y-1.5 text-[11px]">
                                <div>
                                  <span className="font-semibold text-[#3e3e3c]">
                                    Description:
                                  </span>
                                  <span className="text-[#706e6b] ml-2">
                                    {incident.description}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-semibold text-[#3e3e3c]">
                                    Intervention:
                                  </span>
                                  <span className="text-[#706e6b] ml-2">
                                    {incident.intervention}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-semibold text-[#3e3e3c]">
                                    Outcome:
                                  </span>
                                  <span className="text-[#2e844a] ml-2">
                                    {incident.outcome}
                                  </span>
                                </div>
                                <div className="pt-1.5 border-t border-[#dddbda] mt-2">
                                  <span className="text-[#706e6b]">
                                    Staff: {incident.staff}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Positive Observations - SLDS v2 */}
                    <div className="border border-[#91db8b] rounded-[8px] bg-[#ecf9e6] overflow-hidden">
                      <div className="px-4 py-3 border-b border-[#91db8b] bg-[#cdefc4]">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-[#2e844a]" />
                          <h3 className="text-[13px] font-semibold text-[#2e844a]">
                            Positive Observations & Highlights
                          </h3>
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <ul className="space-y-2">
                          {(
                            BEHAVIORAL_SUMMARY?.positiveObservations ||
                            []
                          ).map((obs, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-[13px] text-[#2e844a]"
                            >
                              <Check className="h-4 w-4 shrink-0 mt-0.5" />
                              <span>{obs}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="text-center pt-2">
                      <Button
                        variant="link"
                        className="rounded-full text-[#014486] text-[13px] h-8 hover:text-[#032d60]"
                      >
                        View Full Behavioral Report
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Sidebar - 1/4 width */}
          <div className="space-y-4">
            {/* Medications - List View */}
            <Card
              className="shadow-sm overflow-hidden"
              style={{
                borderRadius:
                  "var(--slds-c-card-radius-border)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
              }}
            >
              <div
                className="p-3 flex items-center justify-between cursor-pointer transition-colors"
                style={{
                  borderBottom:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--slds-g-color-background-row-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--slds-g-color-background-alt)";
                }}
                onClick={() => onNavigate?.("medications")}
              >
                <div className="flex items-center gap-2">
                  <Pill
                    className="h-4 w-4"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Medications
                  </span>
                </div>
                <ExternalLink
                  className="h-3.5 w-3.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                />
              </div>
              <div className="p-3">
                <div className="space-y-2">
                  {(MEDICATIONS || []).map((period) => {
                    // Each unique medicationId counts at most once per day —
                    // a record is either dispensed (1) or not (0) regardless of
                    // how many Dispensation/Count Logs were submitted for it.
                    const uniqueMedIds = new Set<
                      number | string
                    >(
                      period.entries.map(
                        (e: any) => e.medicationId ?? e.name,
                      ),
                    );
                    const total = uniqueMedIds.size;
                    const documentedIds = new Set<
                      number | string
                    >(
                      period.entries
                        .filter(
                          (e: any) => e.status === "taken",
                        )
                        .map(
                          (e: any) => e.medicationId ?? e.name,
                        ),
                    );
                    const countedIds = new Set<number | string>(
                      period.entries
                        .filter((e: any) => e.counted === true)
                        .map(
                          (e: any) => e.medicationId ?? e.name,
                        ),
                    );
                    const documented = documentedIds.size;
                    const counted = countedIds.size;

                    // Determine status color based on completion
                    let statusColor: string;
                    let statusBgColor: string;

                    if (
                      documented === total &&
                      counted === total
                    ) {
                      // Green: Complete
                      statusColor = "#10b981";
                      statusBgColor = "#d1fae5";
                    } else if (
                      documented === 0 &&
                      counted === 0
                    ) {
                      // Red: Not Started
                      statusColor = "#ef4444";
                      statusBgColor = "#fee2e2";
                    } else {
                      // Yellow: In Progress
                      statusColor = "#f59e0b";
                      statusBgColor = "#fef3c7";
                    }

                    return (
                      <div
                        key={period.period}
                        className="flex items-center justify-between p-2.5 rounded cursor-pointer transition-all"
                        style={{
                          backgroundColor: statusBgColor,
                          border: `1px solid ${statusColor}40`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity =
                            "0.85";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = "1";
                        }}
                        onClick={() =>
                          onNavigate?.(
                            "medications:med-overview",
                          )
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="rounded-full flex-shrink-0"
                            style={{
                              width: "10px",
                              height: "10px",
                              backgroundColor: statusColor,
                            }}
                          />
                          <div>
                            <div
                              className="text-xs font-medium mb-0.5"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              {period.period.charAt(0) +
                                period.period
                                  .slice(1)
                                  .toLowerCase()}
                            </div>
                            <div
                              className="text-[10px]"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              Documented: {documented} •
                              Counted: {counted}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-base font-bold"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {total}
                          </span>
                          <ChevronRight
                            className="h-4 w-4"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Events - Compact, with the Pass Calendar (20041) link
                kept directly below it when the layout stacks */}
            <div className="space-y-1">
              <Card
                className="shadow-sm overflow-hidden"
                style={{
                  borderRadius:
                    "var(--slds-c-card-radius-border)",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              >
                <div
                  className="p-3 flex items-center justify-between"
                  style={{
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Calendar
                      className="h-4 w-4"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    />
                    <span
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      Today's Events
                    </span>
                  </div>
                  <span
                    className="text-[10px]"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    {EVENTS.length}
                  </span>
                </div>
                <div className="space-y-2 p-3">
                  {(EVENTS || []).map((event) => (
                    <div
                      key={event.id}
                      className="p-2 rounded cursor-pointer transition-colors"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--slds-g-color-background-alt)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--slds-g-color-background-base)";
                      }}
                      onClick={() => openEventDetail(event)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div
                            className={cn(
                              "text-xs font-medium",
                              event.status === "CANCELED"
                                ? "line-through text-red-500"
                                : "text-gray-900",
                            )}
                          >
                            {event.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="text-[10px]"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              <Clock className="h-2.5 w-2.5 inline mr-0.5" />
                              {event.time}
                            </span>
                            {event.youth && (
                              <span
                                className="text-[10px]"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                <User className="h-2.5 w-2.5 inline mr-0.5" />
                                {event.youth}
                              </span>
                            )}
                          </div>
                        </div>
                        {event.status === "CANCELED" ? (
                          <Badge className="bg-red-50 text-red-700 border-red-200 text-[9px] h-4 px-1.5">
                            <X className="h-2 w-2 mr-0.5" />
                            Canceled
                          </Badge>
                        ) : (
                          <Badge className="bg-green-50 text-green-700 border-green-200 text-[9px] h-4 px-1.5">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Button
                type="button"
                variant="link-info"
                size="sm"
                onClick={() => onNavigate("pass-calendar")}
              >
                Pass Calendar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ProgramDetailViewDialogs
        {...{
          program,
          emailDialogOpen,
          setEmailDialogOpen,
          emailSubject,
          setEmailSubject,
          emailBody,
          setEmailBody,
          handoverDialogOpen,
          setHandoverDialogOpen,
          handoverNote,
          setHandoverNote,
          isAiGenerated,
          setIsAiGenerated,
          handoverNoteMode,
          setHandoverNoteMode,
          isGeneratingAiNote,
          setIsGeneratingAiNote,
          handovers,
          setHandovers,
          editingHandoverId,
          setEditingHandoverId,
          viewingHandover,
          setViewingHandover,
          viewHandoverDialogOpen,
          setViewHandoverDialogOpen,
          deleteHandoverDialogOpen,
          setDeleteHandoverDialogOpen,
          handoverToDelete,
          setHandoverToDelete,
          handoverShift,
          setHandoverShift,
          handoverAuthor,
          setHandoverAuthor,
          handoverDate,
          setHandoverDate,
          handoverTime,
          setHandoverTime,
          handoverCriticalCount,
          setHandoverCriticalCount,
          expandedShiftId,
          setExpandedShiftId,
          viewingYouthGoals,
          setViewingYouthGoals,
          viewGoalsDialogOpen,
          setViewGoalsDialogOpen,
          goals,
          setGoals,
          showAddGoal,
          setShowAddGoal,
          expandedGoals,
          setExpandedGoals,
          newGoal,
          setNewGoal,
          editingGoalId,
          setEditingGoalId,
          editGoalData,
          setEditGoalData,
          showCommentForm,
          setShowCommentForm,
          newComment,
          setNewComment,
          youthGoalsData,
          setYouthGoalsData,
          calculateOverallProgress,
          handleDeleteGoal,
          handleEditGoal,
          handleSaveGoal,
          handleCancelEditGoal,
          handleAddGoal,
          handleAddComment,
          incidentDialogOpen,
          setIncidentDialogOpen,
          incidentYouth,
          setIncidentYouth,
          incidentTab,
          setIncidentTab,
          incidentType,
          setIncidentType,
          incidentStartDate,
          setIncidentStartDate,
          incidentStartTime,
          setIncidentStartTime,
          incidentEndDate,
          setIncidentEndDate,
          incidentEndTime,
          setIncidentEndTime,
          incidentLocation,
          setIncidentLocation,
          incidentOverview,
          setIncidentOverview,
          incidentNarrative,
          setIncidentNarrative,
          incidentResponse,
          setIncidentResponse,
          incidentPersonsContacted,
          setIncidentPersonsContacted,
          incidentParticipants,
          setIncidentParticipants,
          incidentYouthInjuries,
          setIncidentYouthInjuries,
          incidentRestraints,
          setIncidentRestraints,
          incidentDebriefParticipants,
          setIncidentDebriefParticipants,
          incidentDebriefNotes,
          setIncidentDebriefNotes,
          incidentFinalized,
          setIncidentFinalized,
          incidentYouthList,
          setIncidentYouthList,
          handleSaveIncident,
          handleCancelIncident,
          handleFinalizeIncident,
          handleAddPersonContacted,
          handleRemovePersonContacted,
          handleAddYouthInjury,
          handleRemoveYouthInjury,
          handleAddRestraint,
          handleRemoveRestraint,
          handleAddDebriefParticipant,
          handleRemoveDebriefParticipant,
          handleAddIncidentYouth,
          handleRemoveIncidentYouth,
          handleSetPrimaryYouth,
          filterOpen,
          setFilterOpen,
          selectedTypes,
          setSelectedTypes,
          selectedAuthors,
          setSelectedAuthors,
          selectedYouthFilter,
          setSelectedYouthFilter,
          selectedObservationFilter,
          toggleObservationFilter,
          selectedPriorities,
          setSelectedPriorities,
          dateRangeFilter,
          setDateRangeFilter,
          customStartDate,
          setCustomStartDate,
          customEndDate,
          setCustomEndDate,
          toggleType,
          toggleAuthor,
          toggleYouthFilter,
          togglePriority,
          clearAllFilters,
          activeFilterCount,
          plDetailTask,
          setPlDetailTask,
          plDS,
          setPlDS,
          plDD,
          setPlDD,
          plDA,
          setPlDA,
          plDR,
          setPlDR,
          plDSt,
          setPlDSt,
          plComment,
          setPlComment,
          addPlComment,
          cancelPlTask,
          tasks,
          setTasks,
          taskDetailOpen,
          setTaskDetailOpen,
          selectedTask,
          setSelectedTask,
          meetingDate,
          setMeetingDate,
          meetingTime,
          setMeetingTime,
          meetingLocation,
          setMeetingLocation,
          meetingNotes,
          setMeetingNotes,
          newTaskOpen,
          setNewTaskOpen,
          newTaskTitle,
          setNewTaskTitle,
          newTaskDescription,
          setNewTaskDescription,
          newTaskPriority,
          setNewTaskPriority,
          newTaskDueDate,
          setNewTaskDueDate,
          newTaskAssignee,
          setNewTaskAssignee,
          handleSaveNewTask,
          handleCancelNewTask,
          handleCloseTaskDetail,
          handleToggleTaskSection,
          handleToggleChecklistItem,
          handleScheduleMeeting,
          handleCompleteTaskFromDetail,
          handleViewFullDetails,
          isTaskOverdue,
          toggleTaskCompletion,
          youthDetailOpen,
          setYouthDetailOpen,
          selectedYouth,
          setSelectedYouth,
          observationDialogOpen,
          setObservationDialogOpen,
          observationYouth,
          setObservationYouth,
          // "View Full Profile" in the observation dialog (was never passed).
          onNavigateToYouthDetail,
          observationLocation,
          setObservationLocation,
          locationComments,
          setLocationComments,
          selectedObservations,
          setSelectedObservations,
          observationComments,
          setObservationComments,
          handleSaveObservation,
          toggleObservation,
          eventDetailOpen,
          setEventDetailOpen,
          selectedEvent,
          setSelectedEvent,
          showExpandedDetails,
          setShowExpandedDetails,
          handleAddToCalendar,
          expandedYouth,
          setExpandedYouth,
          selectedShift,
          setSelectedShift,
          newEntryOpen,
          setNewEntryOpen,
          newEntryType,
          setNewEntryType,
          newEntryLogType,
          setNewEntryLogType,
          newEntryContent,
          setNewEntryContent,
          newEntryPriority,
          setNewEntryPriority,
          newEntryTags,
          setNewEntryTags,
          newEntryYouth,
          setNewEntryYouth,
          newEntryProgramTeam,
          setNewEntryProgramTeam,
          newEntryOther,
          setNewEntryOther,
          newEntryFiles,
          setNewEntryFiles,
          newEntryDate,
          setNewEntryDate,
          newEntryTime,
          setNewEntryTime,
          isDragging,
          setIsDragging,
          youthSearchQuery,
          setYouthSearchQuery,
          programTeamSearchQuery,
          setProgramTeamSearchQuery,
          otherSearchQuery,
          setOtherSearchQuery,
          externalIndividuals,
          setExternalIndividuals,
          externalIndividualInput,
          setExternalIndividualInput,
          handleSaveNewEntry,
          handleCancelNewEntry,
          toggleTag,
          toggleYouthAssociation,
          handleFileSelect,
          handleRemoveFile,
          handleDragOver,
          handleDragLeave,
          handleDrop,
          formatFileSize,
          addExternalIndividual,
          removeExternalIndividual,
          mentionInput,
          setMentionInput,
          showMentionDropdown,
          setShowMentionDropdown,
          mentionQuery,
          setMentionQuery,
          selectedMentionIndex,
          setSelectedMentionIndex,
          handleMentionInputChange,
          handleMentionSelect,
          handleMentionKeyDown,
          removeYouthMention,
          logFeedData,
          setLogFeedData,
          expandedComments,
          setExpandedComments,
          showAllComments,
          setShowAllComments,
          newCommentText,
          setNewCommentText,
          editingLogId,
          setEditingLogId,
          editedContent,
          setEditedContent,
          editedLogs,
          setEditedLogs,
          expandedOriginals,
          setExpandedOriginals,
          toggleComments,
          toggleShowAllComments,
          startEditingLog,
          cancelEditingLog,
          saveEditedLog,
          toggleOriginalContent,
          editModalOpen,
          setEditModalOpen,
          editingEntry,
          setEditingEntry,
          editEntryLogType,
          setEditEntryLogType,
          editEntryDate,
          setEditEntryDate,
          editEntryTime,
          setEditEntryTime,
          editEntryPriority,
          setEditEntryPriority,
          editEntryContent,
          setEditEntryContent,
          editEntryYouth,
          setEditEntryYouth,
          editEntryProgramTeam,
          setEditEntryProgramTeam,
          editEntryOther,
          setEditEntryOther,
          editEntryTags,
          setEditEntryTags,
          editEntryAttachments,
          setEditEntryAttachments,
          handleSaveEditedEntry,
          handleCancelEditEntry,
          viewingLogEntry,
          setViewingLogEntry,
          viewLogEntryDialogOpen,
          setViewLogEntryDialogOpen,
          getYouthRecentLogs,
          therapyDetailOpen,
          setTherapyDetailOpen,
          selectedTherapyEntry,
          setSelectedTherapyEntry,
          connectionsOpen,
          setConnectionsOpen,
          connectionType,
          setConnectionType,
          connectionStartDate,
          setConnectionStartDate,
          connectionEndDate,
          setConnectionEndDate,
          connectionRecurring,
          setConnectionRecurring,
          connectionCadence,
          setConnectionCadence,
          connectionRepeatType,
          setConnectionRepeatType,
          connectionRepeatInterval,
          setConnectionRepeatInterval,
          connectionDaysOfWeek,
          setConnectionDaysOfWeek,
          connectionEndType,
          setConnectionEndType,
          connectionOccurrences,
          setConnectionOccurrences,
          connectionStartTime,
          setConnectionStartTime,
          connectionEndTime,
          setConnectionEndTime,
          connectionYouth,
          setConnectionYouth,
          connectionLocation,
          setConnectionLocation,
          connectionTransitionRelated,
          setConnectionTransitionRelated,
          connectionHomeVisit,
          setConnectionHomeVisit,
          connectionSession,
          setConnectionSession,
          connectionGoals,
          setConnectionGoals,
          connectionNewGoal,
          setConnectionNewGoal,
          connectionCopingSkills,
          setConnectionCopingSkills,
          connectionNewCopingSkill,
          setConnectionNewCopingSkill,
          connectionTriggers,
          setConnectionTriggers,
          connectionNewTrigger,
          setConnectionNewTrigger,
          connectionStrengths,
          setConnectionStrengths,
          connectionNewStrength,
          setConnectionNewStrength,
          connectionMeetingSummary,
          setConnectionMeetingSummary,
          connectionOtherAttendees,
          setConnectionOtherAttendees,
          advocateQuestion1,
          setAdvocateQuestion1,
          advocateQuestion2,
          setAdvocateQuestion2,
          advocateQuestion3,
          setAdvocateQuestion3,
          milieuYouthAttendance,
          setMilieuYouthAttendance,
          milieuYouthNotes,
          setMilieuYouthNotes,
          milieuYouthObservations,
          setMilieuYouthObservations,
          milieuThemesAddressed,
          setMilieuThemesAddressed,
          handleSaveConnection,
          handleFinalizeAndSubmitConnection,
          handleCancelConnection,
          connDays,
          setConnDays,
          irOpen,
          setIrOpen,
          irType,
          setIrType,
          irSeverity,
          setIrSeverity,
          irDate,
          setIrDate,
          irTime,
          setIrTime,
          irLocation,
          setIrLocation,
          irYouthInvolved,
          setIrYouthInvolved,
          irStaffInvolved,
          setIrStaffInvolved,
          irDescription,
          setIrDescription,
          irImmediateAction,
          setIrImmediateAction,
          irFollowUp,
          setIrFollowUp,
          irNotificationRequired,
          setIrNotificationRequired,
          irNotifiedParties,
          setIrNotifiedParties,
          handleSaveIR,
          handleCancelIR,
          handleGenerateAiNote,
          handleSaveHandover,
          handleViewGoals,
          filteredHandovers,
          regenerateHandoverNote,
          confirmDeleteHandover,
          canFinalizeIncident,
          logTypes,
          authors,
          PL_STAFF,
          PL_CONSTITUENTS,
          completePlTask,
          reopenPlTask,
          savePlDetail,
          openPlDetail,
          handleEditHandover,
        }}
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
                ? "Finalize this incident report?"
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
                  setIncidentDialogOpen(false);
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
    </div>
  );
}

export { YouthDetailView, ProgramDetailView };