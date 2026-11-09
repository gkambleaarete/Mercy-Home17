import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Plus,
  Edit2,
  RefreshCw,
  Printer,
  FileBarChart,
  ClipboardList,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  Eye,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileWarning,
  ArrowLeft,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { CreateIncidentReportDialog } from "../dialogs/CreateIncidentReportDialog";
import { toast } from "sonner";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import {
  getIncidentReports,
  getRecentIncidentsForProgram,
} from "../../data/mockYouthProgramData";

// Incident Reports come from the shared Youth/Program store so the Program
// Record's Compliance & Activity Snapshot reads the same records.
const INITIAL_INCIDENT_REPORTS = getIncidentReports();

// Mock data for filter options
// Youth names as they appear on the reports ("Last, First" pairs).
const YOUTH_OPTIONS = Array.from(
  new Set(
    INITIAL_INCIDENT_REPORTS.flatMap((r) =>
      (r.youthInvolved.match(/[^,]+,[^,]+/g) ?? []).map((n) =>
        n.trim(),
      ),
    ),
  ),
).sort();
const PROGRAM_OPTIONS = Array.from(
  new Set(
    INITIAL_INCIDENT_REPORTS.map((r) => r.program).filter(
      Boolean,
    ),
  ),
).sort();
const STAFF_OPTIONS = [
  "John Smith",
  "Sarah Johnson",
  "Emily Davis",
  "Michael Brown",
];

// Program scope — set by the Program Record's "Incidents in the Last 7 Days"
// tile (19990): navigate("/incident-reports", { state: { scope: "program",
// programId, programName, days } }). The scoped set is re-queried live from
// the shared store, so it is always this Program's currently active youth.
interface ProgramIncidentScope {
  scope: "program";
  programId: number;
  programName: string;
  days: number;
}

function resolveProgramScope(
  state: unknown,
): ProgramIncidentScope | null {
  const s = state as Partial<ProgramIncidentScope> | null;
  if (s?.scope !== "program" || typeof s.programId !== "number")
    return null;
  return {
    scope: "program",
    programId: s.programId,
    programName: s.programName ?? "",
    days: s.days ?? 7,
  };
}

export function IncidentReports() {
  const navigate = useNavigate();
  const location = useLocation();
  const programScope = resolveProgramScope(location.state);
  const programScopedIds = programScope
    ? new Set(
        getRecentIncidentsForProgram(
          programScope.programId,
          programScope.days,
        ).map((r) => r.id),
      )
    : null;
  const [incidentReports, setIncidentReports] = useState(() =>
    getIncidentReports(),
  );
  const [selectedReportId, setSelectedReportId] = useState<
    number | null
  >(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] =
    useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterIncidentDateStart, setFilterIncidentDateStart] =
    useState("");
  const [filterIncidentDateEnd, setFilterIncidentDateEnd] =
    useState("");
  const [filterYouth, setFilterYouth] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterStaff, setFilterStaff] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFinalized, setFilterFinalized] = useState("all");

  // Filter incident reports based on all criteria
  const filteredReports = incidentReports.filter((report) => {
    if (programScopedIds && !programScopedIds.has(report.id))
      return false;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        report.youthInvolved
          .toLowerCase()
          .includes(searchLower) ||
        report.program.toLowerCase().includes(searchLower) ||
        report.staffInvolved
          .toLowerCase()
          .includes(searchLower) ||
        report.status.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Date filters
    if (filterIncidentDateStart) {
      const reportDate = new Date(report.incidentStartDateTime);
      const startDate = new Date(filterIncidentDateStart);
      if (reportDate < startDate) return false;
    }
    if (filterIncidentDateEnd) {
      const reportDate = new Date(report.incidentStartDateTime);
      const endDate = new Date(filterIncidentDateEnd);
      if (reportDate > endDate) return false;
    }

    // Youth filter - check if selected youth is in the list (like Staff filter)
    if (filterYouth !== "all") {
      const reportYouth = (
        report.youthInvolved.match(/[^,]+,[^,]+/g) ?? []
      ).map((n) => n.trim());
      if (!reportYouth.includes(filterYouth)) return false;
    }

    // Program filter
    if (
      filterProgram !== "all" &&
      report.program !== filterProgram
    ) {
      return false;
    }

    // Staff filter
    if (filterStaff !== "all") {
      const reportStaff = report.staffInvolved.split(", ");
      if (!reportStaff.includes(filterStaff)) return false;
    }

    // Status filter
    if (
      filterStatus !== "all" &&
      report.status !== filterStatus
    ) {
      return false;
    }

    // Finalized filter
    if (
      filterFinalized === "finalized" &&
      !report.isFinalized
    ) {
      return false;
    }
    if (
      filterFinalized === "unfinalized" &&
      report.isFinalized
    ) {
      return false;
    }

    return true;
  });

  const IR_PAGE_SIZE = 12;
  const [irPage, setIrPage] = useState(1);
  const irTotalPages = Math.max(
    1,
    Math.ceil(filteredReports.length / IR_PAGE_SIZE),
  );
  const irSafePage = Math.min(irPage, irTotalPages);
  const irPageRows = filteredReports.slice(
    (irSafePage - 1) * IR_PAGE_SIZE,
    irSafePage * IR_PAGE_SIZE,
  );
  useEffect(() => {
    setIrPage(1);
  }, [
    searchTerm,
    filterIncidentDateStart,
    filterIncidentDateEnd,
    filterYouth,
    filterProgram,
    filterStaff,
    filterStatus,
    filterFinalized,
  ]);

  // Calculate active filter count
  const activeFilterCount =
    (filterIncidentDateStart ? 1 : 0) +
    (filterIncidentDateEnd ? 1 : 0) +
    (filterYouth !== "all" ? 1 : 0) +
    (filterProgram !== "all" ? 1 : 0) +
    (filterStaff !== "all" ? 1 : 0) +
    (filterStatus !== "all" ? 1 : 0) +
    (filterFinalized !== "all" ? 1 : 0);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterIncidentDateStart("");
    setFilterIncidentDateEnd("");
    setFilterYouth("all");
    setFilterProgram("all");
    setFilterStaff("all");
    setFilterStatus("all");
    setFilterFinalized("all");
    toast.success("Filters cleared");
  };

  // Action handlers
  const handleCreateNew = () => {
    toast.info("Opening Incident Report creation form...");
    setIsCreateDialogOpen(true);
  };

  const handleEdit = () => {
    if (!selectedReportId) {
      toast.error("Please select an Incident Report to edit");
      return;
    }
    toast.info(
      `Opening Incident Report #${selectedReportId} for editing...`,
    );
    // Future: Navigate to edit page or open edit dialog
  };

  const handleRefresh = () => {
    toast.success("Incident Report list refreshed");
    // In a real app, this would re-fetch data from the server
  };

  const handlePrint = () => {
    if (!selectedReportId) {
      toast.error("Please select an Incident Report to print");
      return;
    }
    const selectedReport = incidentReports.find(
      (r) => r.id === selectedReportId,
    );
    toast.success(
      `Generating printable version for ${selectedReport?.youthInvolved}...`,
    );
    // Future: Generate PDF or print view
  };

  const handleReport = () => {
    if (!selectedReportId) {
      toast.error(
        "Please select an Incident Report to generate a report",
      );
      return;
    }
    const selectedReport = incidentReports.find(
      (r) => r.id === selectedReportId,
    );
    toast.success(
      `Generating report for ${selectedReport?.youthInvolved}...`,
    );
    // Future: Generate compliance or incident report
  };

  const handleIncidentSummary = () => {
    if (!selectedReportId) {
      toast.error(
        "Please select an Incident Report to view summary",
      );
      return;
    }
    toast.info(
      `Navigating to Incident Summary for report #${selectedReportId}...`,
    );
    // Future: Navigate to incident summary view
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${month}/${day}/${year} ${hours}:${minutes}`;
  };

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{
        backgroundColor: "var(--slds-g-color-background-alt)",
      }}
    >
      {/* Page Header */}
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
        {/* Page Title and Actions Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title Section */}
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
              <FileText className="h-6 w-6" />
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
                Incident Reports
              </h1>
              {programScope && (
                <p
                  className="slds-text-4 mt-0.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  {programScope.programName} · Active youth ·
                  Last {programScope.days} days
                </p>
              )}
            </div>
          </div>

          {/* Right: Action Controls */}
          <div className="flex items-center gap-2">
            {programScope && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(`/program/${programScope.programId}`)
                }
              >
                <ArrowLeft /> Back to Program
              </Button>
            )}
            {/* Print Icon */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={selectedReportId === null}
              title="Print"
              onClick={handlePrint}
              style={{
                opacity: selectedReportId === null ? 0.4 : 1,
                cursor:
                  selectedReportId === null
                    ? "not-allowed"
                    : "pointer",
                backgroundColor: "white",
                borderRadius: "50%",
              }}
            >
              <Printer
                className="h-4 w-4"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </Button>

            {/* Report Icon */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={selectedReportId === null}
              title="Report"
              onClick={handleReport}
              style={{
                opacity: selectedReportId === null ? 0.4 : 1,
                cursor:
                  selectedReportId === null
                    ? "not-allowed"
                    : "pointer",
                backgroundColor: "white",
                borderRadius: "50%",
              }}
            >
              <FileBarChart
                className="h-4 w-4"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </Button>

            {/* Incident Summary Button */}
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs"
              disabled={selectedReportId === null}
              onClick={handleIncidentSummary}
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  selectedReportId !== null
                    ? "white"
                    : "transparent",
                opacity: selectedReportId === null ? 0.5 : 1,
                cursor:
                  selectedReportId === null
                    ? "not-allowed"
                    : "pointer",
                borderRadius: "9999px",
              }}
            >
              <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
              Incident Summary
            </Button>

            {/* Refresh Icon */}
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

            {/* Divider */}
            <div
              className="h-6 w-px mx-1"
              style={{
                backgroundColor:
                  "var(--slds-g-color-border-base-1)",
              }}
            />

            {/* Create New Incident Report Button - Primary Action at Extreme Right */}
            <Button
              size="sm"
              className="h-8 px-3 text-xs text-white"
              onClick={handleCreateNew}
              style={{
                backgroundColor: "var(--color-brand-primary)",
                borderRadius: "9999px",
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Create New Incident Report
            </Button>
          </div>
        </div>
      </div>

      {/* Incident Reports Table with Integrated Filters */}
      <div
        className="flex-1 overflow-auto app-page-x py-6"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-alt-2)",
        }}
      >
        {/* KPI Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 desktop:grid-cols-6 gap-4 mb-6">
          {/* Total Incident Reports */}
          <Card
            className="shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "var(--slds-c-card-radius-border)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
            onClick={() => {
              setFilterStatus("all");
              setFilterFinalized("all");
              toast.info("Showing all incident reports");
            }}
            role="button"
            tabIndex={0}
            aria-label="View all incident reports"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wide group-hover:text-gray-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Total Reports
                  </p>
                  <p
                    className="text-2xl font-bold mt-1 group-hover:text-gray-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {incidentReports.length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <FileText className="h-5 w-5 text-gray-600 group-hover:text-gray-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Not Started */}
          <Card
            className="shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "var(--slds-c-card-radius-border)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
            onClick={() => {
              setFilterStatus("Not Started");
              setFilterFinalized("all");
              toast.info(
                "Showing Not Started incident reports",
              );
            }}
            role="button"
            tabIndex={0}
            aria-label="View not started incident reports"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wide group-hover:text-orange-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Not Started
                  </p>
                  <p
                    className="text-2xl font-bold mt-1 group-hover:text-orange-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {
                      incidentReports.filter(
                        (r) => r.status === "Not Started",
                      ).length
                    }
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <AlertCircle className="h-5 w-5 text-orange-600 group-hover:text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* In Progress */}
          <Card
            className="shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "var(--slds-c-card-radius-border)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
            onClick={() => {
              setFilterStatus("In Progress");
              setFilterFinalized("all");
              toast.info(
                "Showing In Progress incident reports",
              );
            }}
            role="button"
            tabIndex={0}
            aria-label="View in progress incident reports"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wide group-hover:text-green-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    In Progress
                  </p>
                  <p
                    className="text-2xl font-bold mt-1 group-hover:text-green-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {
                      incidentReports.filter(
                        (r) => r.status === "In Progress",
                      ).length
                    }
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Clock className="h-5 w-5 text-green-600 group-hover:text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complete */}
          <Card
            className="shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "var(--slds-c-card-radius-border)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
            onClick={() => {
              setFilterStatus("Complete");
              setFilterFinalized("all");
              toast.info("Showing Complete incident reports");
            }}
            role="button"
            tabIndex={0}
            aria-label="View complete incident reports"
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
                    Complete
                  </p>
                  <p
                    className="text-2xl font-bold mt-1 group-hover:text-blue-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {
                      incidentReports.filter(
                        (r) => r.status === "Complete",
                      ).length
                    }
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unfinalized */}
          <Card
            className="shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "var(--slds-c-card-radius-border)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
            onClick={() => {
              setFilterStatus("all");
              setFilterFinalized("unfinalized");
              toast.info(
                "Showing Unfinalized incident reports",
              );
            }}
            role="button"
            tabIndex={0}
            aria-label="View unfinalized incident reports"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wide group-hover:text-yellow-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Unfinalized
                  </p>
                  <p
                    className="text-2xl font-bold mt-1 group-hover:text-yellow-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {
                      incidentReports.filter(
                        (r) => !r.isFinalized,
                      ).length
                    }
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                  <FileWarning className="h-5 w-5 text-yellow-600 group-hover:text-yellow-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Finalized */}
          <Card
            className="shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "var(--slds-c-card-radius-border)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
            onClick={() => {
              setFilterStatus("all");
              setFilterFinalized("finalized");
              toast.info("Showing Finalized incident reports");
            }}
            role="button"
            tabIndex={0}
            aria-label="View finalized incident reports"
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
                    Finalized
                  </p>
                  <p
                    className="text-2xl font-bold mt-1 group-hover:text-purple-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {
                      incidentReports.filter(
                        (r) => r.isFinalized,
                      ).length
                    }
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 group-hover:text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
            {/* Single row: Title left, all filters + search right */}
            <div className="w-full min-w-0 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <CardTitle
                className="text-base font-bold shrink-0 whitespace-nowrap"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                All Incident Reports ({filteredReports.length})
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                {/* Clear All */}
                {activeFilterCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-9 px-3 rounded-full text-[12px] flex items-center gap-1.5"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    <X className="h-3 w-3" />
                    Clear Filters
                  </Button>
                )}
                {/* Incident Date Start */}
                <div className="relative w-[128px] shrink-0">
                  <DateInput
                    value={isoToMdy(filterIncidentDateStart)}
                    onChange={(v) =>
                      ((e) =>
                        setFilterIncidentDateStart(
                          e.target.value,
                        ))({ target: { value: mdyToIso(v) } })
                    }
                    className="h-9 text-sm pr-7 w-full"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                  />
                  {filterIncidentDateStart && (
                    <button
                      onClick={() =>
                        setFilterIncidentDateStart("")
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Incident Date End */}
                <div className="relative w-[128px] shrink-0">
                  <DateInput
                    value={isoToMdy(filterIncidentDateEnd)}
                    onChange={(v) =>
                      ((e) =>
                        setFilterIncidentDateEnd(
                          e.target.value,
                        ))({ target: { value: mdyToIso(v) } })
                    }
                    className="h-9 text-sm pr-7 w-full"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                  />
                  {filterIncidentDateEnd && (
                    <button
                      onClick={() =>
                        setFilterIncidentDateEnd("")
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Youth Filter */}
                <div className="relative w-[110px] shrink-0">
                  <select
                    value={filterYouth}
                    onChange={(e) =>
                      setFilterYouth(e.target.value)
                    }
                    className="w-full h-9 text-sm px-3 pr-7 appearance-none"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <option value="all">Youth</option>
                    {YOUTH_OPTIONS.map((youth) => (
                      <option key={youth} value={youth}>
                        {youth}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                </div>

                {/* Program Filter */}
                <div className="relative w-[110px] shrink-0">
                  <select
                    value={filterProgram}
                    onChange={(e) =>
                      setFilterProgram(e.target.value)
                    }
                    className="w-full h-9 text-sm px-3 pr-7 appearance-none"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <option value="all">Program</option>
                    {PROGRAM_OPTIONS.map((program) => (
                      <option key={program} value={program}>
                        {program}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                </div>

                {/* Staff Involved Filter */}
                <div className="relative min-w-[120px] shrink-0">
                  <select
                    value={filterStaff}
                    onChange={(e) =>
                      setFilterStaff(e.target.value)
                    }
                    className="w-full h-9 text-sm px-3 pr-7 appearance-none"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <option value="all">Staff Involved</option>
                    {STAFF_OPTIONS.map((staff) => (
                      <option key={staff} value={staff}>
                        {staff}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                </div>

                {/* Status Filter */}
                <div className="relative w-[110px] shrink-0">
                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(e.target.value)
                    }
                    className="w-full h-9 text-sm px-3 pr-7 appearance-none"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <option value="all">All</option>
                    <option value="Not Started">
                      Not Started
                    </option>
                    <option value="In Progress">
                      In Progress
                    </option>
                    <option value="Complete">Complete</option>
                    <option value="Finalized">Finalized</option>
                  </select>
                  <ChevronDown
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                </div>

                {/* Finalized Filter */}
                <div className="relative w-[110px] shrink-0">
                  <select
                    value={filterFinalized}
                    onChange={(e) =>
                      setFilterFinalized(e.target.value)
                    }
                    className="w-full h-9 text-sm px-3 pr-7 appearance-none"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <option value="all">All</option>
                    <option value="unfinalized">
                      Unfinalized
                    </option>
                    <option value="finalized">Finalized</option>
                  </select>
                  <ChevronDown
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                </div>

                {/* Search */}
                <div className="relative w-[200px] shrink-0">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                  <Input
                    placeholder="Search reports"
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    className="pl-9 h-9 w-full text-sm"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 gap-0">
            <Table>
              <TableHeader>
                <TableRow
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <TableHead
                    className="pl-6 w-[200px]"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Youth Involved
                  </TableHead>
                  <TableHead
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Incident Date & Time
                  </TableHead>
                  <TableHead
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Program
                  </TableHead>
                  <TableHead
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Staff Involved
                  </TableHead>
                  <TableHead
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Status
                  </TableHead>
                  <TableHead
                    className="text-right pr-6"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                        fontSize: "13px",
                      }}
                    >
                      No incident reports found matching the
                      selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  irPageRows.map((report) => (
                    <TableRow
                      key={report.id}
                      className="transition-colors cursor-pointer"

                      style={{
                        backgroundColor:
                          selectedReportId === report.id
                            ? "var(--slds-g-color-background-alt)"
                            : "transparent",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedReportId !== report.id) {
                          e.currentTarget.style.backgroundColor =
                            "var(--slds-g-color-background-row-hover)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedReportId !== report.id) {
                          e.currentTarget.style.backgroundColor =
                            "transparent";
                        }
                      }}
                    >
                      <TableCell className="pl-6 py-3">
                        <span
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                            fontSize: "13px",
                          }}
                        >
                          {report.youthInvolved}
                        </span>
                      </TableCell>
                      <TableCell
                        className="py-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          fontSize: "13px",
                        }}
                      >
                        {
                          formatDate(
                            report.incidentStartDateTime,
                          ).split(" ")[0]
                        }
                      </TableCell>
                      <TableCell
                        className="py-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          fontSize: "13px",
                        }}
                      >
                        {report.program}
                      </TableCell>
                      <TableCell
                        className="py-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          fontSize: "13px",
                        }}
                      >
                        {report.staffInvolved}
                      </TableCell>
                      <TableCell className="py-3">
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            height: "20px",
                            padding: "0 8px",
                            borderRadius: "9999px",
                            fontSize: "12px",
                            fontWeight: 500,
                            border: "none",
                            ...(report.status === "Complete"
                              ? {
                                  backgroundColor: "#D0E9DA",
                                  color: "#1B5E20",
                                }
                              : report.status === "In Progress"
                                ? {
                                    backgroundColor: "#DBEAFE",
                                    color: "#1E40AF",
                                  }
                                : {
                                    backgroundColor:
                                      "var(--slds-g-color-background-alt)",
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }),
                          }}
                        >
                          {report.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            title="View Report"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info(
                                `Viewing Incident Report #${report.id}...`,
                              );
                            }}
                          >
                            <Eye
                              className="h-3.5 w-3.5"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            title="Edit Report"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/youth-ir-details/${report.id}`,
                              );
                            }}
                          >
                            <Edit2
                              className="h-3.5 w-3.5"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:text-red-600"
                            title="Delete Report"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.error(
                                `Delete functionality for Report #${report.id} not yet implemented`,
                              );
                            }}
                          >
                            <Trash2
                              className="h-3.5 w-3.5"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {/* Pagination footer */}
            {filteredReports.length > 0 && (
              <div
                className="flex items-center justify-between px-6 py-3"
                style={{
                  borderTop:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Showing {(irSafePage - 1) * IR_PAGE_SIZE + 1}–
                  {Math.min(
                    irSafePage * IR_PAGE_SIZE,
                    filteredReports.length,
                  )}{" "}
                  of {filteredReports.length} records
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setIrPage((p) => Math.max(1, p - 1))
                    }
                    disabled={irSafePage === 1}
                    className="h-7 w-7 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-weak)",
                      opacity: irSafePage === 1 ? 0.4 : 1,
                      cursor:
                        irSafePage === 1
                          ? "not-allowed"
                          : "pointer",
                    }}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Page {irSafePage} of {irTotalPages}
                  </span>
                  <button
                    onClick={() =>
                      setIrPage((p) =>
                        Math.min(irTotalPages, p + 1),
                      )
                    }
                    disabled={irSafePage === irTotalPages}
                    className="h-7 w-7 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-weak)",
                      opacity:
                        irSafePage === irTotalPages ? 0.4 : 1,
                      cursor:
                        irSafePage === irTotalPages
                          ? "not-allowed"
                          : "pointer",
                    }}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Create Incident Report Dialog */}
      <CreateIncidentReportDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        // Show the newly saved record in this list right away.
        onSave={() => setIncidentReports(getIncidentReports())}
      />
    </div>
  );
}