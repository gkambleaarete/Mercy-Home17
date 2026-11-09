import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  Search,
  Calendar,
  FileText,
  AlertTriangle,
  User,
  Filter,
  ChevronRight,
  ChevronDown,
  Settings,
  RefreshCw,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Clock,
  Check,
  CheckCircle,
  LayoutGrid,
  MessageSquare,
  ClipboardList,
  Upload,
  Activity,
  CheckSquare,
  Sparkles,
  Info,
  X,
  Users,
} from "@/app/lib/lucide-icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import NewLeadIntake from "./NewLeadIntake";
import { LeadDetailView } from "../admissions/LeadDetailView";
import { ActiveLeadsView } from "../admissions/ActiveLeadsView";
import { TotalLeadsView } from "../admissions/TotalLeadsView";
import { InAssessmentView } from "../admissions/InAssessmentView";
import { AlertsView } from "../admissions/AlertsView";
import {
  ALL_LEADS,
  ADMISSION_STAGES,
  getInProgressLeads,
  getLeadsInAssessment,
  getLeadsWithAlerts,
  getTotalAlertCount,
  getLeadsInMoveIn,
} from "../../data/mockLeadsData";
import { MyFollowUpTasksWidget } from "../MyFollowUpTasksWidget";
import { formatMdy } from "../../lib/dateFormat";
import { useCaseClosures } from "../../data/caseClosureStore";
import {
  admissionsCategoryHistory,
  getAlertsKpiTotal,
  useLeadsWithSavedCategories,
} from "../../data/admissionsCategoryStore";
import { AdmissionsCategoryNotice } from "../admissions/AdmissionsCategoryNotice";
import { CategoryCommentsPopover } from "../admissions/CategoryCommentsPopover";
import { AdmissionsCategoryBadge } from "../admissions/AdmissionsCategoryBadge";
import { AdmissionsStageBadge } from "../admissions/AdmissionsStageBadge";

// --- COMPONENTS ---

// SLDS-style Pipeline Progress Bar
function PipelineTracker({
  currentStage,
}: {
  currentStage: string;
}) {
  const currentIndex = ADMISSION_STAGES.indexOf(currentStage);

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex min-w-[600px] gap-[2px] rounded-full overflow-hidden">
        {ADMISSION_STAGES.map((stage, idx) => {
          let status = "upcoming";
          if (idx < currentIndex) status = "completed";
          if (idx === currentIndex) status = "current";
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
              className={cn(
                "flex-1 h-10 flex items-center justify-center text-xs font-bold uppercase tracking-wider relative transition-colors cursor-default",
                status === "completed"
                  ? "bg-[#A0E8DE] text-teal-800"
                  : status === "current"
                    ? "bg-[#003366] text-white"
                    : "bg-[#E5E5E5] text-gray-500",
              )}
              style={{ clipPath }}
            >
              {status === "completed" ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : (
                <span className="px-4 truncate">{stage}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Agentforce Assistant Panel
function AgentforceAssistant({
  lead,
}: {
  lead: (typeof ALL_LEADS)[0];
}) {
  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm rounded-[8px]">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-indigo-600" />
          </div>
          <CardTitle className="text-sm font-bold text-indigo-900">
            Agentforce Insights
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-3">
          <div className="p-3 bg-white rounded-[8px] border border-indigo-50 shadow-sm text-sm text-gray-700">
            <span className="font-semibold text-indigo-700 block mb-1">
              Suggested Action
            </span>
            Based on stage <strong>{lead.stage}</strong>, you
            should{" "}
            <span className="text-blue-600 font-medium cursor-pointer hover:underline">
              Schedule Clinical Assessment
            </span>{" "}
            or{" "}
            <span className="text-blue-600 font-medium cursor-pointer hover:underline">
              Upload External Documents
            </span>
            .
          </div>

          {lead.alerts.length > 0 && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-[8px] border border-red-100">
              <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
              <span>Critical: {lead.alerts.join(", ")}</span>
            </div>
          )}

          <div className="relative">
            <Input
              placeholder="Ask Agentforce..."
              className="pr-8 text-xs h-8 bg-white rounded-full"
            />
            <MessageSquare className="absolute right-2 top-2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Dashboard Component
export function AdmissionsDashboard() {
  const [selectedLead, setSelectedLead] = useState<
    (typeof ALL_LEADS)[0] | null
  >(null);
  const [showNewLeadIntake, setShowNewLeadIntake] =
    useState(false);
  const [showActiveLeads, setShowActiveLeads] = useState(false);
  const [showTotalLeads, setShowTotalLeads] = useState(false);
  const [showInAssessment, setShowInAssessment] =
    useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [filterStage, setFilterStage] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterAge, setFilterAge] = useState("all");
  const [filterCampus, setFilterCampus] = useState("all");
  const [filterTimePeriod, setFilterTimePeriod] =
    useState("all");
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] =
    useState(false);
  // `baseLeads` holds the lead fields the dashboard edits locally; the
  // Pipeline category (Lead.status) always comes from the saved category
  // state (US 20140), applied on top without mutating ALL_LEADS.
  const [baseLeads, setBaseLeads] = useState(ALL_LEADS);
  const { leads, categoryRead, categoryError } =
    useLeadsWithSavedCategories(baseLeads);

  // Deep link (e.g. from task notifications): "/?leadId=L-001" opens that
  // youth's Admissions profile; "&section=connections" opens it on that
  // section (scheduling notifications). Params are consumed so Back works.
  const [searchParams, setSearchParams] = useSearchParams();
  const deepLinkLeadId = searchParams.get("leadId");
  const [deepLinkSection, setDeepLinkSection] = useState<
    string | undefined
  >(undefined);
  useEffect(() => {
    if (!deepLinkLeadId) return;
    const target = leads.find((l) => l.id === deepLinkLeadId);
    if (target) {
      setSelectedLead(target);
      setDeepLinkSection(
        searchParams.get("section") ?? undefined,
      );
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("leadId");
        next.delete("section");
        next.delete("connectionId");
        return next;
      },
      { replace: true },
    );
  }, [deepLinkLeadId]);

  const LEADS_PAGE_SIZE = 12;
  const [leadsPage, setLeadsPage] = useState(1);

  // Handle lead updates. The Pipeline category (`status`) is NOT updatable
  // here: it changes only through the Change Category dialog, which requires
  // a comment and saves the category, its history and the coupled Closing
  // List effect together (admissionsCategoryStore.changeAdmissionsCategory).
  // A `status` in `updates` is dropped so this callback can't bypass that.
  const handleLeadUpdate = (leadId: string, updates: any) => {
    const { status: _ignoredStatus, ...allowed } = updates ?? {};
    if (Object.keys(allowed).length === 0) return;
    setBaseLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === leadId ? { ...lead, ...allowed } : lead,
      ),
    );

    // Also update the selectedLead if it matches
    if (selectedLead?.id === leadId) {
      setSelectedLead((prev) =>
        prev ? { ...prev, ...allowed } : null,
      );
    }
  };

  // Handle time period change and reset year if needed
  const handleTimePeriodChange = (value: string) => {
    setFilterTimePeriod(value);
    // Reset year to current year when changing time period
    if (value === "year") {
      setSelectedYear(new Date().getFullYear().toString());
    }
  };

  // Helper function to check if a date falls within the selected time period
  const isWithinTimePeriod = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    switch (filterTimePeriod) {
      case "today":
        return date.toDateString() === now.toDateString();

      case "week":
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo && date <= now;

      case "month":
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );

      case "quarter":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const dateQuarter = Math.floor(date.getMonth() / 3);
        return (
          dateQuarter === currentQuarter &&
          date.getFullYear() === now.getFullYear()
        );

      case "year":
        return date.getFullYear() === parseInt(selectedYear);

      case "all":
      default:
        return true;
    }
  };

  // A case in closure leaves the running Pipeline immediately; it is shown
  // only under "Closing List" until staff complete the closure, then under
  // "Closed". Closure started from Projections & Waitlist also counts.
  const { closures } = useCaseClosures();
  const filteredLeads = leads.filter((lead) => {
    const closure = closures[lead.id];
    const closing = closure?.state === "closing";
    if (filterCategory === "Closing List") {
      if (!closing) return false;
    } else {
      if (closing) return false;
      const status = closure ? "Closed" : lead.status;
      if (filterCategory === "all" && status === "Closed")
        return false;
      if (filterCategory !== "all" && status !== filterCategory)
        return false;
    }
    if (filterStage !== "all" && lead.stage !== filterStage)
      return false;
    if (
      filterProgram !== "all" &&
      lead.program !== filterProgram
    )
      return false;
    if (filterAge !== "all" && lead.ageGroup !== filterAge)
      return false;
    if (filterCampus !== "all" && lead.campus !== filterCampus)
      return false;
    if (!isWithinTimePeriod(lead.createdDate)) return false;
    return true;
  });

  // Check if any filters are active
  const hasActiveFilters =
    filterStage !== "all" ||
    filterCategory !== "all" ||
    filterProgram !== "all" ||
    filterAge !== "all" ||
    filterCampus !== "all" ||
    filterTimePeriod !== "all";

  const handleRefresh = () => {
    setFilterStage("all");
    setFilterCategory("all");
    setFilterProgram("all");
    setFilterAge("all");
    setFilterCampus("all");
    setFilterTimePeriod("all");
    setSearchQuery("");
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setFilterStage("all");
    setFilterCategory("all");
    setFilterProgram("all");
    setFilterAge("all");
    setFilterCampus("all");
    setFilterTimePeriod("all");
    setSelectedYear(new Date().getFullYear().toString());
  };

  const leadsTotalPages = Math.max(
    1,
    Math.ceil(filteredLeads.length / LEADS_PAGE_SIZE),
  );
  const leadsSafePage = Math.min(leadsPage, leadsTotalPages);
  const leadsPageRows = filteredLeads.slice(
    (leadsSafePage - 1) * LEADS_PAGE_SIZE,
    leadsSafePage * LEADS_PAGE_SIZE,
  );

  useEffect(() => {
    setLeadsPage(1);
  }, [
    filterStage,
    filterCategory,
    filterProgram,
    filterAge,
    filterCampus,
    filterTimePeriod,
    searchQuery,
  ]);

  // Search filtered results
  const searchFilteredLeads = searchQuery.trim()
    ? leads.filter(
        (lead) =>
          lead.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          lead.guardian
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          lead.id
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          lead.program
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          lead.stage
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      )
    : [];

  if (selectedLead) {
    return (
      <LeadDetailView
        key={selectedLead.id}
        lead={
          leads.find((l) => l.id === selectedLead.id) ??
          selectedLead
        }
        onBack={() => {
          setSelectedLead(null);
          setDeepLinkSection(undefined);
        }}
        onLeadUpdate={handleLeadUpdate}
        initialOverviewSection={deepLinkSection}
      />
    );
  }

  if (showActiveLeads) {
    return (
      <ActiveLeadsView
        baseLeads={baseLeads}
        onBack={() => setShowActiveLeads(false)}
        onViewLead={(lead) => {
          setShowActiveLeads(false);
          setSelectedLead(lead);
        }}
      />
    );
  }

  if (showTotalLeads) {
    return (
      <TotalLeadsView
        baseLeads={baseLeads}
        onBack={() => setShowTotalLeads(false)}
        onViewLead={(lead) => {
          setShowTotalLeads(false);
          setSelectedLead(lead);
        }}
      />
    );
  }

  if (showInAssessment) {
    return (
      <InAssessmentView
        baseLeads={baseLeads}
        onBack={() => setShowInAssessment(false)}
        onViewLead={(lead) => {
          setShowInAssessment(false);
          setSelectedLead(lead);
        }}
      />
    );
  }

  if (showAlerts) {
    return (
      <AlertsView
        baseLeads={baseLeads}
        onBack={() => setShowAlerts(false)}
        onViewLead={(lead) => {
          setShowAlerts(false);
          setSelectedLead(lead);
        }}
      />
    );
  }

  if (showNewLeadIntake) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <NewLeadIntake
          onClose={() => setShowNewLeadIntake(false)}
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: "var(--slds-g-color-background-alt-2)",
      }}
    >
      {/* Header */}
      <div
        className="app-page-x py-4"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-alt-2)",
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
          boxShadow: "var(--slds-g-shadow-1)",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 flex items-center justify-center text-white"
              style={{
                borderRadius:
                  "var(--slds-c-card-radius-border)",
                backgroundColor: "var(--color-brand-primary)",
                boxShadow: "var(--slds-g-shadow-1)",
              }}
            >
              <LayoutGrid className="h-6 w-6" />
            </div>
            <div>
              <div
                className="text-xs font-medium uppercase tracking-wide"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Dashboard
              </div>
              <h1
                className="text-2xl font-medium tracking-tight"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Admissions Pipeline
              </h1>
            </div>
          </div>
          {/* Right: Action Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Refresh"
              onClick={handleRefresh}
              style={{
                backgroundColor: "white",
                borderRadius: "50%",
              }}
            >
              <RefreshCw
                className="h-4 w-4"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div
        className="px-6 pt-6 pb-4"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-alt-2)",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card
            className="shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "var(--slds-c-card-radius-border)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
            onClick={() => setShowTotalLeads(true)}
            role="button"
            tabIndex={0}
            aria-label="View all total youth"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wide group-hover:text-blue-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Total Youth
                  </p>
                  <p
                    className="text-2xl font-bold mt-1 group-hover:text-blue-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {leads.length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Users className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "var(--slds-c-card-radius-border)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
            onClick={() => setShowInAssessment(true)}
            role="button"
            tabIndex={0}
            aria-label="View youth in assessment"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wide group-hover:text-purple-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    In Assessment
                  </p>
                  <p
                    className="text-2xl font-bold mt-1 group-hover:text-teal-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {getLeadsInAssessment(leads).length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <ClipboardList className="h-5 w-5 text-purple-600 group-hover:text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "var(--slds-c-card-radius-border)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
            role="button"
            tabIndex={0}
            aria-label="View youth in move-in stage"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wide group-hover:text-teal-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Move-In
                  </p>
                  <p
                    className="text-2xl font-bold mt-1 group-hover:text-teal-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {getLeadsInMoveIn(leads).length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                  <Upload className="h-5 w-5 text-teal-600 group-hover:text-teal-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "var(--slds-c-card-radius-border)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
            onClick={() => setShowAlerts(true)}
            role="button"
            tabIndex={0}
            aria-label="View all alerts"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wide group-hover:text-red-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Alerts
                  </p>
                  <p
                    className="text-2xl font-bold mt-1 group-hover:text-red-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {
                      // Same shared calculation, same current collection
                      // as the Alerts drilldown total (US 20140): existing
                      // lead.alerts plus category-change comments, across
                      // ALL admissions — not the filtered table.
                      getAlertsKpiTotal(leads, categoryRead)
                    }
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <AlertTriangle className="h-5 w-5 text-red-600 group-hover:text-red-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* List View */}
      <div
        className="flex-1 overflow-y-auto app-page-x mb-6"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-alt-2)",
        }}
      >
        {filteredLeads.length > 0 ? (
          <Card
            className="shadow-sm overflow-hidden gap-0"
            style={{
              backgroundColor:
                "var(--slds-g-color-background-base)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "var(--slds-c-card-radius-border)",
            }}
          >
            <CardHeader
              className="min-h-[50px] px-6 !py-[7px] flex items-center"
              style={{
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
              }}
            >
              <div className="w-full min-w-0 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
                  <CardTitle
                    className="text-base font-bold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    All Youth ({filteredLeads.length})
                  </CardTitle>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-9 px-3 rounded-full text-[12px] flex items-center gap-1.5"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      <X className="h-3 w-3" />
                      Clear Filters
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  {/* Feature 1: Stage filter (first in toolbar) */}
                  <Select
                    value={filterStage}
                    onValueChange={setFilterStage}
                  >
                    <SelectTrigger
                      className="h-9 w-[140px] text-[13px]"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        borderRadius:
                          "var(--slds-c-input-radius-border)",
                      }}
                    >
                      <SelectValue placeholder="Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All Stages
                      </SelectItem>
                      <SelectItem value="Referral">
                        Referral
                      </SelectItem>
                      <SelectItem value="Info Session">
                        Info Session
                      </SelectItem>
                      <SelectItem value="Assessments">
                        Assessments
                      </SelectItem>
                      <SelectItem value="Shadow & FPM">
                        Shadow &amp; FPM
                      </SelectItem>
                      <SelectItem value="Staffing">
                        Staffing
                      </SelectItem>
                      <SelectItem value="Move-In">
                        Move-In
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Feature 2: Category filter */}
                  <Select
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                  >
                    <SelectTrigger
                      className="h-9 w-[175px] text-[13px]"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        borderRadius:
                          "var(--slds-c-input-radius-border)",
                      }}
                    >
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All Categories
                      </SelectItem>
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
                      <SelectItem value="Closing List">
                        Closing List
                      </SelectItem>
                      <SelectItem value="Closed">
                        Closed
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filterProgram}
                    onValueChange={setFilterProgram}
                  >
                    <SelectTrigger
                      className="h-9 w-[140px] text-[13px]"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        borderRadius:
                          "var(--slds-c-input-radius-border)",
                      }}
                    >
                      <SelectValue placeholder="Program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All Programs
                      </SelectItem>
                      <SelectItem value="Bosco Home">
                        Bosco Home
                      </SelectItem>
                      <SelectItem value="Mercy Home">
                        Mercy Home
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filterAge}
                    onValueChange={setFilterAge}
                  >
                    <SelectTrigger
                      className="h-9 w-[160px] text-[13px]"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        borderRadius:
                          "var(--slds-c-input-radius-border)",
                      }}
                    >
                      <SelectValue placeholder="Age Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All Ages
                      </SelectItem>
                      <SelectItem value="Middle School">
                        Middle School
                      </SelectItem>
                      <SelectItem value="High School">
                        High School
                      </SelectItem>
                      <SelectItem value="Young Adult">
                        Young Adult
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filterCampus}
                    onValueChange={setFilterCampus}
                  >
                    <SelectTrigger
                      className="h-9 w-[160px] text-[13px]"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        borderRadius:
                          "var(--slds-c-input-radius-border)",
                      }}
                    >
                      <SelectValue placeholder="Campus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All Campuses
                      </SelectItem>
                      <SelectItem value="Walsh">
                        Walsh
                      </SelectItem>
                      <SelectItem value="West Loop">
                        West Loop
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filterTimePeriod}
                    onValueChange={handleTimePeriodChange}
                  >
                    <SelectTrigger
                      className="h-9 w-[140px] text-[13px]"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        borderRadius:
                          "var(--slds-c-input-radius-border)",
                      }}
                    >
                      <SelectValue placeholder="Time Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All Time
                      </SelectItem>
                      <SelectItem value="today">
                        Today
                      </SelectItem>
                      <SelectItem value="week">
                        This Week
                      </SelectItem>
                      <SelectItem value="month">
                        This Month
                      </SelectItem>
                      <SelectItem value="quarter">
                        This Quarter
                      </SelectItem>
                      <SelectItem value="year">
                        This Year
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {filterTimePeriod === "year" && (
                    <Select
                      value={selectedYear}
                      onValueChange={setSelectedYear}
                    >
                      <SelectTrigger
                        className="h-9 w-[100px] rounded-full text-[13px]"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                        }}
                      >
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">
                          2025
                        </SelectItem>
                        <SelectItem value="2024">
                          2024
                        </SelectItem>
                        <SelectItem value="2023">
                          2023
                        </SelectItem>
                        <SelectItem value="2022">
                          2022
                        </SelectItem>
                        <SelectItem value="2021">
                          2021
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 z-10"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    />
                    <Input
                      placeholder="Search"
                      className="pl-9 pr-9 h-9 w-40 text-[13px]"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        borderRadius:
                          "var(--slds-c-input-radius-border)",
                      }}
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                      onFocus={(e) => {
                        setShowSearchDropdown(true);
                        e.currentTarget.style.borderColor =
                          "var(--color-brand-primary)";
                        e.currentTarget.style.outline =
                          "2px solid var(--color-brand-primary)";
                        e.currentTarget.style.outlineOffset =
                          "0";
                      }}
                      onBlur={(e) => {
                        setTimeout(
                          () => setShowSearchDropdown(false),
                          200,
                        );
                        e.currentTarget.style.borderColor =
                          "var(--slds-g-color-border-base-1)";
                        e.currentTarget.style.outline = "none";
                      }}
                      aria-label="Search youth"
                    />
                    {searchQuery && (
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center z-10 transition-colors"
                        style={{
                          backgroundColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--slds-g-color-neutral-base-90)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "transparent";
                        }}
                        onClick={() => {
                          setSearchQuery("");
                          setShowSearchDropdown(false);
                        }}
                        aria-label="Clear search"
                      >
                        <X
                          className="h-3 w-3"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        />
                      </button>
                    )}

                    {/* SLDS/Omni Studio Search Dropdown */}
                    {showSearchDropdown &&
                      searchQuery.trim() && (
                        <div
                          className="absolute right-0 top-full mt-1 w-[400px] max-h-[400px] overflow-hidden z-50"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            borderRadius:
                              "var(--slds-c-card-radius-border)",
                            boxShadow: "var(--slds-g-shadow-3)",
                          }}
                        >
                          {searchFilteredLeads.length > 0 ? (
                            <>
                              <div
                                className="px-4 py-2"
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-alt)",
                                  borderBottom:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                <p
                                  className="text-xs font-semibold uppercase tracking-wide"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  {searchFilteredLeads.length}{" "}
                                  Result
                                  {searchFilteredLeads.length !==
                                  1
                                    ? "s"
                                    : ""}
                                </p>
                              </div>
                              <div className="max-h-[340px] overflow-y-auto">
                                {searchFilteredLeads
                                  .slice(0, 10)
                                  .map((lead) => (
                                    <div
                                      key={lead.id}
                                      className="px-4 py-3 cursor-pointer transition-colors"
                                      style={{
                                        borderBottom:
                                          "1px solid var(--slds-g-color-border-base-1)",
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                          "var(--slds-g-color-background-row-hover)";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                          "transparent";
                                      }}
                                      onClick={() => {
                                        setSelectedLead(lead);
                                        setSearchQuery("");
                                        setShowSearchDropdown(
                                          false,
                                        );
                                      }}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div
                                          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                          style={{
                                            backgroundColor:
                                              "var(--color-brand-primary)",
                                          }}
                                        >
                                          {lead.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p
                                            className="font-semibold text-sm truncate"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                            }}
                                          >
                                            {lead.name}
                                          </p>
                                          <p
                                            className="text-xs truncate"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-weak)",
                                            }}
                                          >
                                            {lead.program} •{" "}
                                            {lead.stage}
                                          </p>
                                        </div>
                                        <AdmissionsStageBadge stage={lead.stage} />
                                      </div>
                                    </div>
                                  ))}
                                {searchFilteredLeads.length >
                                  10 && (
                                  <div
                                    className="px-4 py-2 text-xs text-center"
                                    style={{
                                      backgroundColor:
                                        "var(--slds-g-color-background-alt)",
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    +
                                    {searchFilteredLeads.length -
                                      10}{" "}
                                    more results
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="px-4 py-8 text-center">
                              <Search
                                className="h-8 w-8 mx-auto mb-2"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              />
                              <p
                                className="text-sm font-medium"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                No results found
                              </p>
                              <p
                                className="text-xs mt-1"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Try searching for youth name,
                                guardian, or ID
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <AdmissionsCategoryNotice error={categoryError} />
              <Table>
                <TableHeader
                  className="sticky top-0 z-10"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <TableRow
                    className="hover:bg-transparent"
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    {[
                      { label: "PROMOTED DATE", cls: "pl-6" },
                      { label: "YOUTH", cls: "px-2" },
                      { label: "CASE MANAGER", cls: "px-2" },
                      { label: "AGE", cls: "px-2" },
                      { label: "CAMPUS", cls: "px-2" },
                      {
                        label: "ANTICIPATED PROGRAM",
                        cls: "px-2",
                      },
                      { label: "STAGE", cls: "px-2" },
                      { label: "CATEGORY", cls: "px-2" },
                      { label: "DAYS IN STAGE", cls: "px-2" },
                      { label: "ALERTS", cls: "px-2 pr-6" },
                    ].map(({ label, cls }) => (
                      <TableHead
                        key={label}
                        className={`h-10 ${cls}`}
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          fontSize: 12,
                          fontWeight: 500,
                          letterSpacing: "0.04em",
                        }}
                      >
                        {label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadsPageRows.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className="transition-colors"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--slds-g-color-background-row-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "transparent";
                      }}
                    >
                      <TableCell className="pl-6 py-3">
                        <span
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                            fontSize: 13,
                          }}
                        >
                          {lead.promotedDate
                            ? formatMdy(
                                new Date(lead.promotedDate),
                              )
                            : "-"}
                        </span>
                      </TableCell>
                      <TableCell className="px-2 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                          className="text-left font-medium hover:underline focus:outline-none focus:underline"
                          style={{
                            color: "var(--color-link-blue)",
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            fontSize: "inherit",
                          }}
                        >
                          {lead.name}
                        </button>
                      </TableCell>
                      <TableCell
                        className="px-2 py-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          fontSize: 13,
                        }}
                      >
                        {lead.guardian}
                      </TableCell>
                      <TableCell
                        className="px-2 py-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          fontSize: 13,
                        }}
                      >
                        {lead.ageGroup}
                      </TableCell>
                      <TableCell
                        className="px-2 py-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          fontSize: 13,
                        }}
                      >
                        {lead.campus}
                      </TableCell>
                      <TableCell
                        className="px-2 py-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          fontSize: 13,
                        }}
                      >
                        {lead.program}
                      </TableCell>
                      <TableCell className="px-2 py-3">
                        <AdmissionsStageBadge stage={lead.stage} />
                      </TableCell>
                      <TableCell className="px-2 py-3">
                        <AdmissionsCategoryBadge
                          category={lead.status}
                        />
                      </TableCell>
                      <TableCell className="px-2 py-3">
                        <Badge
                          variant="outline"
                          className="rounded-full text-xs font-medium px-2.5"
                          style={{
                            backgroundColor:
                              lead.daysInStage > 6
                                ? "#F4C7C3"
                                : lead.daysInStage > 4
                                  ? "#FEF3CD"
                                  : "var(--slds-g-color-background-alt)",
                            color:
                              lead.daysInStage > 6
                                ? "#C23934"
                                : lead.daysInStage > 4
                                  ? "#7A5800"
                                  : "var(--slds-g-color-text-default)",
                            border: "none",
                          }}
                        >
                          {lead.daysInStage}d
                        </Badge>
                      </TableCell>
                      <TableCell className="px-2 py-3 pr-6">
                        {(() => {
                          // Category-change comments (US 20140) are kept
                          // apart from lead.alerts: they never add,
                          // resolve or rate an alert.
                          const history = admissionsCategoryHistory(
                            categoryRead,
                            lead.id,
                          );
                          const hasAlerts = lead.alerts.length > 0;
                          if (!hasAlerts && history.length === 0)
                            return (
                              <span
                                className="text-xs"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                —
                              </span>
                            );
                          return (
                            <div className="flex items-center gap-2">
                              {hasAlerts && (
                                <div
                                  className="flex items-center gap-1.5 text-xs"
                                  style={{ color: "#C23934" }}
                                >
                                  <AlertTriangle className="h-3 w-3 shrink-0" />
                                  <span className="truncate max-w-[150px]">
                                    {lead.alerts[0]}
                                  </span>
                                  {lead.alerts.length > 1 && (
                                    <span
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      +{lead.alerts.length - 1}
                                    </span>
                                  )}
                                </div>
                              )}
                              <CategoryCommentsPopover
                                youthName={lead.name}
                                history={history}
                              />
                            </div>
                          );
                        })()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Pagination */}
              <div
                className="flex items-center justify-between"
                style={{
                  borderTop:
                    "1px solid var(--slds-g-color-border-base-1)",
                  padding: "12px 24px",
                }}
              >
                <p
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    fontSize: 12,
                    lineHeight: "18px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {"Showing "}
                  <span
                    style={{
                      fontWeight: 600,
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {filteredLeads.length === 0
                      ? "0"
                      : `${(leadsSafePage - 1) * LEADS_PAGE_SIZE + 1}–${Math.min(leadsSafePage * LEADS_PAGE_SIZE, filteredLeads.length)}`}
                  </span>
                  {" of "}
                  <span
                    style={{
                      fontWeight: 600,
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {filteredLeads.length}
                  </span>
                  {" records"}
                </p>
                {leadsTotalPages > 1 && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setLeadsPage((p) => Math.max(1, p - 1))
                      }
                      disabled={leadsSafePage === 1}
                      className="flex items-center justify-center rounded-full disabled:opacity-40"
                      style={{
                        width: 28,
                        height: 28,
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        flexShrink: 0,
                      }}
                      aria-label="Previous page"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M8.75 10.5L5.25 7L8.75 3.5"
                          stroke="#706E6B"
                          strokeWidth="1.16667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <p
                      style={{
                        fontSize: 12,
                        lineHeight: "18px",
                        color:
                          "var(--slds-g-color-text-default)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {"Page "}
                      <span style={{ fontWeight: 600 }}>
                        {leadsSafePage}
                      </span>
                      {" of "}
                      <span style={{ fontWeight: 600 }}>
                        {leadsTotalPages}
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setLeadsPage((p) =>
                          Math.min(leadsTotalPages, p + 1),
                        )
                      }
                      disabled={
                        leadsSafePage === leadsTotalPages
                      }
                      className="flex items-center justify-center rounded-full disabled:opacity-40"
                      style={{
                        width: 28,
                        height: 28,
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        flexShrink: 0,
                      }}
                      aria-label="Next page"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M5.25 10.5L8.75 7L5.25 3.5"
                          stroke="#706E6B"
                          strokeWidth="1.16667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div
            className="text-center py-12"
            style={{
              backgroundColor:
                "var(--slds-g-color-background-base)",
              borderRadius: "var(--slds-c-card-radius-border)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <Filter
              className="h-12 w-12 mx-auto mb-4"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            />
            <p
              className="font-medium"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              No youth found
            </p>
            <p
              className="text-sm mt-1 mb-4"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {hasActiveFilters
                ? "No youth match your current filter criteria"
                : "No youth available"}
            </p>
            {hasActiveFilters && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl">
                  {filterStage !== "all" && (
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-700 border-purple-200 rounded-sm text-xs"
                    >
                      Stage: {filterStage}
                    </Badge>
                  )}
                  {filterCategory !== "all" && (
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-700 border-purple-200 rounded-sm text-xs"
                    >
                      Category: {filterCategory}
                    </Badge>
                  )}
                  {filterProgram !== "all" && (
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-700 border-purple-200 rounded-sm text-xs"
                    >
                      Program: {filterProgram}
                    </Badge>
                  )}
                  {filterAge !== "all" && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 rounded-sm text-xs"
                    >
                      Age: {filterAge}
                    </Badge>
                  )}
                  {filterCampus !== "all" && (
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-700 border-purple-200 rounded-sm text-xs"
                    >
                      Campus: {filterCampus}
                    </Badge>
                  )}
                  {filterTimePeriod !== "all" && (
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-700 border-gray-200 rounded-sm text-xs"
                    >
                      Time:{" "}
                      {filterTimePeriod === "year"
                        ? selectedYear
                        : filterTimePeriod}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-[32px] px-4 rounded-full text-[13px] flex items-center gap-2"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  <X className="h-4 w-4" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}