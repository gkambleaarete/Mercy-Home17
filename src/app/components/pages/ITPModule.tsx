import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  LayoutGrid,
  Users,
  RefreshCw,
  Printer,
  FileBarChart,
  ClipboardList,
  X,
  ChevronDown,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
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
import {
  CreateITPPlanDialog,
  ITPPlanData,
} from "../dialogs/CreateITPPlanDialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { VisuallyHidden } from "../ui/visually-hidden";
import { EditITPWorkspace } from "./EditITPWorkspace";
import { toast } from "sonner";
import { DateInput } from "../ui/date-input";
import {
  isoToMdy,
  mdyToIso,
  formatMdy,
} from "../../lib/dateFormat";

// Mock ITP Plans Data
const INITIAL_ITP_PLANS = [
  {
    id: 1,
    youthName: "Fozzie Bear",
    program: "Mahoney House",
    startDate: "2025-01-06",
    endDate: "2025-04-07",
    status: "Active",
    carePlanningMeeting: "2025-03-24",
    itpDate: "2025-04-07",
    completeDate: "2025-04-14",
    finalizedDate: "2025-04-21",
    completionProgress: 65,
    contributors: ["John Smith", "Sarah Johnson"],
    lifecycleStatus: "In Progress",
    isFinalized: false,
  },
  {
    id: 2,
    youthName: "Kermit the Frog",
    program: "Mahoney House",
    startDate: "2024-12-02",
    endDate: "2025-03-03",
    status: "Finalized",
    carePlanningMeeting: "2025-02-17",
    itpDate: "2025-03-03",
    completeDate: "2025-03-10",
    finalizedDate: "2025-03-17",
    completionProgress: 100,
    contributors: ["John Smith", "Emily Davis"],
    lifecycleStatus: "Finalized",
    isFinalized: true,
  },
  {
    id: 3,
    youthName: "Red Fraggle",
    program: "Mahoney House",
    startDate: "2025-01-20",
    endDate: "2025-04-21",
    status: "Draft",
    carePlanningMeeting: "2025-04-07",
    itpDate: "2025-04-21",
    completeDate: "2025-04-28",
    finalizedDate: "2025-05-05",
    completionProgress: 35,
    contributors: ["Sarah Johnson"],
    lifecycleStatus: "New",
    isFinalized: false,
  },
  {
    id: 4,
    youthName: "Miss Piggy",
    program: "Mahoney House",
    startDate: "2024-11-18",
    endDate: "2025-02-17",
    status: "In Progress",
    carePlanningMeeting: "2025-02-03",
    itpDate: "2025-02-17",
    completeDate: "2025-02-24",
    finalizedDate: "2025-03-03",
    completionProgress: 100,
    contributors: ["Emily Davis", "Michael Brown"],
    lifecycleStatus: "Ready for Review",
    isFinalized: false,
  },
];

// Mock data for filter options
const YOUTH_OPTIONS = [
  "Fozzie Bear",
  "Kermit the Frog",
  "Red Fraggle",
  "Miss Piggy",
];
const PROGRAM_OPTIONS = [
  "Mahoney House",
  "Bosco House",
  "Campbell House",
];
const CONTRIBUTOR_OPTIONS = [
  "John Smith",
  "Sarah Johnson",
  "Emily Davis",
  "Michael Brown",
];

// Mock Care Planning Summary Data
const CARE_PLANNING_SUMMARY_DATA: Record<number, any> = {
  1: {
    goals: [
      {
        id: 1,
        category: "Education & Academic Success",
        title: "Improve Math Skills",
        description:
          "Achieve grade-level proficiency in mathematics",
        targetDate: "2025-04-07",
        progress: 75,
        status: "On Track",
        interventions: [
          "Daily tutoring sessions",
          "Online learning platform access",
          "Weekly progress assessments",
        ],
      },
      {
        id: 2,
        category: "Social & Emotional Development",
        title: "Develop Healthy Peer Relationships",
        description:
          "Build positive social connections with peers",
        targetDate: "2025-04-07",
        progress: 60,
        status: "In Progress",
        interventions: [
          "Group therapy sessions",
          "Social skills workshops",
          "Supervised social activities",
        ],
      },
      {
        id: 3,
        category: "Independent Living Skills",
        title: "Master Basic Cooking Skills",
        description:
          "Learn to prepare 5 healthy meals independently",
        targetDate: "2025-04-07",
        progress: 50,
        status: "In Progress",
        interventions: [
          "Weekly cooking classes",
          "Meal planning exercises",
          "Kitchen safety training",
        ],
      },
    ],
    milestones: [
      {
        date: "2025-01-15",
        achievement:
          "Completed initial assessment and goal setting",
      },
      {
        date: "2025-02-10",
        achievement: "Math score improved from 65% to 75%",
      },
      {
        date: "2025-03-05",
        achievement:
          "Successfully participated in first group social activity",
      },
      {
        date: "2025-03-20",
        achievement:
          "Prepared first independent meal with minimal supervision",
      },
    ],
    upcomingActivities: [
      {
        date: "2025-04-12",
        activity: "Mid-term academic review meeting",
      },
      {
        date: "2025-04-18",
        activity: "Social skills workshop: Conflict Resolution",
      },
      { date: "2025-04-24", activity: "Care Planning Meeting" },
    ],
  },
  2: {
    goals: [
      {
        id: 1,
        category: "Education & Academic Success",
        title: "High School Diploma Completion",
        description:
          "Complete all required coursework for graduation",
        targetDate: "2025-03-03",
        progress: 100,
        status: "Completed",
        interventions: [
          "Academic support tutoring",
          "College prep counseling",
          "Study skills development",
        ],
      },
      {
        id: 2,
        category: "Career & Employment Readiness",
        title: "Secure Part-Time Employment",
        description:
          "Obtain and maintain part-time job for 3 months",
        targetDate: "2025-03-03",
        progress: 100,
        status: "Completed",
        interventions: [
          "Resume building workshop",
          "Interview preparation",
          "Job placement support",
        ],
      },
    ],
    milestones: [
      {
        date: "2024-12-15",
        achievement: "Completed college application process",
      },
      {
        date: "2025-01-20",
        achievement:
          "Secured part-time position at local retailer",
      },
      {
        date: "2025-02-28",
        achievement: "Successfully graduated high school",
      },
      {
        date: "2025-03-10",
        achievement:
          "Received acceptance letter from community college",
      },
    ],
    upcomingActivities: [
      {
        date: "2025-04-15",
        activity: "Transition planning meeting",
      },
      {
        date: "2025-04-30",
        activity: "College orientation attendance",
      },
    ],
  },
  3: {
    goals: [
      {
        id: 1,
        category: "Behavioral Health",
        title: "Anger Management Skills",
        description:
          "Develop coping strategies for managing frustration",
        targetDate: "2025-04-21",
        progress: 35,
        status: "Needs Attention",
        interventions: [
          "Individual therapy twice weekly",
          "Mindfulness exercises",
          "Emotion regulation workbook",
        ],
      },
      {
        id: 2,
        category: "Education & Academic Success",
        title: "Improve School Attendance",
        description: "Maintain 90% attendance rate",
        targetDate: "2025-04-21",
        progress: 40,
        status: "In Progress",
        interventions: [
          "Morning routine support",
          "Attendance incentive program",
          "Transportation assistance",
        ],
      },
    ],
    milestones: [
      {
        date: "2025-02-01",
        achievement: "Completed initial behavioral assessment",
      },
      {
        date: "2025-03-15",
        achievement: "First full week of perfect attendance",
      },
    ],
    upcomingActivities: [
      {
        date: "2025-04-10",
        activity: "Behavioral health evaluation",
      },
      {
        date: "2025-04-17",
        activity: "Parent-teacher conference",
      },
      {
        date: "2025-04-28",
        activity: "Progress review meeting",
      },
    ],
  },
  4: {
    goals: [
      {
        id: 1,
        category: "Family Reunification",
        title: "Rebuild Family Relationships",
        description:
          "Participate in family therapy and maintain regular contact",
        targetDate: "2025-02-17",
        progress: 100,
        status: "Completed",
        interventions: [
          "Family therapy sessions",
          "Supervised family visits",
          "Communication skills training",
        ],
      },
      {
        id: 2,
        category: "Independent Living Skills",
        title: "Financial Literacy",
        description:
          "Complete financial literacy course and create personal budget",
        targetDate: "2025-02-17",
        progress: 100,
        status: "Completed",
        interventions: [
          "Financial literacy workshops",
          "Budgeting exercises",
          "Savings account setup",
        ],
      },
    ],
    milestones: [
      {
        date: "2024-12-01",
        achievement: "Initiated weekly family therapy sessions",
      },
      {
        date: "2025-01-10",
        achievement:
          "Completed financial literacy course with honors",
      },
      {
        date: "2025-02-05",
        achievement:
          "Successfully managed personal budget for 30 days",
      },
      {
        date: "2025-02-20",
        achievement:
          "Transitioned to unsupervised family visits",
      },
    ],
    upcomingActivities: [
      {
        date: "2025-04-10",
        activity: "Follow-up family therapy session",
      },
      {
        date: "2025-04-25",
        activity: "Financial goal check-in meeting",
      },
    ],
  },
};

export function ITPModule({
  openInModal = false,
}: {
  // When true (Constituents context), clicking a plan name opens the
  // ITP workspace as an overlay on this page instead of navigating to
  // the standalone /itp-module/:id route. The global ITP journey
  // (rendered at /itp-module) is unaffected since it doesn't pass this.
  openInModal?: boolean;
} = {}) {
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] =
    useState(false);
  const [modalPlanId, setModalPlanId] = useState<number | null>(
    null,
  );
  const [itpPlans, setItpPlans] = useState(INITIAL_ITP_PLANS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<string>("all");
  const [selectedPlanId, setSelectedPlanId] = useState<
    number | null
  >(null);

  // Advanced Filter States
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [youthFilter, setYouthFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [contributorFilter, setContributorFilter] =
    useState("all");
  const [lifecycleStatusFilter, setLifecycleStatusFilter] =
    useState("all");

  // Report Dialog States
  const [reportDialogOpen, setReportDialogOpen] =
    useState(false);
  const [selectedReportType, setSelectedReportType] = useState<
    string | null
  >(null);

  // Care Planning Summary State
  const [carePlanningSummaryOpen, setCarePlanningSummaryOpen] =
    useState(false);

  // Handle create new ITP plan
  const handleCreatePlan = (planData: ITPPlanData) => {
    const newPlan = {
      id: itpPlans.length + 1,
      youthName: planData.youthName,
      program: planData.program,
      startDate: planData.startDate,
      endDate: planData.endDate,
      status: "Draft",
      carePlanningMeeting:
        planData.carePlanningMeetingExpectedDate,
      itpDate: planData.itpDateExpected,
      completeDate: planData.completeDateExpected,
      finalizedDate: planData.finalizedDateExpected,
      completionProgress: 0,
      contributors: [],
      lifecycleStatus: "New",
      isFinalized: false,
    };

    setItpPlans([newPlan, ...itpPlans]);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatMdy(date);
  };

  // Get status badge style
  const getStatusBadge = (status: string) => {
    const styles: Record<
      string,
      { bg: string; text: string; border: string }
    > = {
      New: {
        bg: "#F5F5F5",
        text: "#616161",
        border: "#BDBDBD",
      },
      "In Progress": {
        bg: "#E3F2FD",
        text: "#1565C0",
        border: "#64B5F6",
      },
      "Ready for Review": {
        bg: "#FFF3E0",
        text: "#E65100",
        border: "#FFB74D",
      },
      Finalized: {
        bg: "#F3E5F5",
        text: "#6A1B9A",
        border: "#BA68C8",
      },
    };

    const style = styles[status] || styles.New;

    return (
      <Badge
        className="text-xs px-2 py-0.5 font-medium"
        style={{
          backgroundColor: style.bg,
          color: style.text,
          border: `1px solid ${style.border}`,
        }}
      >
        {status}
      </Badge>
    );
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Clock
            className="h-4 w-4"
            style={{ color: "#2E7D32" }}
          />
        );
      case "Draft":
        return (
          <Edit2
            className="h-4 w-4"
            style={{ color: "#E65100" }}
          />
        );
      case "Finalized":
        return (
          <CheckCircle2
            className="h-4 w-4"
            style={{ color: "#6A1B9A" }}
          />
        );
      default:
        return (
          <FileText
            className="h-4 w-4"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          />
        );
    }
  };

  // Generate Report Function
  const handleGenerateReport = () => {
    if (!selectedPlanId || !selectedReportType) return;

    const selectedPlan = itpPlans.find(
      (plan) => plan.id === selectedPlanId,
    );
    if (!selectedPlan) return;

    // Simulate report generation
    toast.success(
      `Generating ${selectedReportType} for ${selectedPlan.youthName}...`,
      {
        description: "Your report will download shortly",
      },
    );

    // Simulate download delay
    setTimeout(() => {
      toast.success("Report generated successfully!", {
        description: `${selectedReportType} has been downloaded`,
      });
      setReportDialogOpen(false);
      setSelectedReportType(null);
    }, 1500);
  };

  // Filter plans
  const filteredPlans = itpPlans.filter((plan) => {
    const matchesSearch =
      plan.youthName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      plan.program
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || plan.status === filterStatus;
    const matchesAdvancedFilters =
      (!startDateFilter ||
        new Date(plan.startDate) >=
          new Date(startDateFilter)) &&
      (!endDateFilter ||
        new Date(plan.endDate) <= new Date(endDateFilter)) &&
      (youthFilter === "all" ||
        plan.youthName === youthFilter) &&
      (programFilter === "all" ||
        plan.program === programFilter) &&
      (contributorFilter === "all" ||
        plan.contributors.includes(contributorFilter)) &&
      (lifecycleStatusFilter === "all" ||
        plan.lifecycleStatus === lifecycleStatusFilter);
    return (
      matchesSearch && matchesFilter && matchesAdvancedFilters
    );
  });

  const ITP_PAGE_SIZE = 12;
  const [itpPage, setItpPage] = useState(1);
  const itpTotalPages = Math.max(
    1,
    Math.ceil(filteredPlans.length / ITP_PAGE_SIZE),
  );
  const itpSafePage = Math.min(itpPage, itpTotalPages);
  const itpPageRows = filteredPlans.slice(
    (itpSafePage - 1) * ITP_PAGE_SIZE,
    itpSafePage * ITP_PAGE_SIZE,
  );

  useEffect(() => {
    setItpPage(1);
  }, [
    searchTerm,
    filterStatus,
    startDateFilter,
    endDateFilter,
    youthFilter,
    programFilter,
    contributorFilter,
    lifecycleStatusFilter,
  ]);

  // Get stats
  const stats = {
    total: itpPlans.length,
    new: itpPlans.filter((p) => p.lifecycleStatus === "New")
      .length,
    inProgress: itpPlans.filter(
      (p) => p.lifecycleStatus === "In Progress",
    ).length,
    readyForReview: itpPlans.filter(
      (p) => p.lifecycleStatus === "Ready for Review",
    ).length,
    finalized: itpPlans.filter(
      (p) => p.lifecycleStatus === "Finalized",
    ).length,
  };

  // Check if filters are active
  const hasActiveFilters = filterStatus !== "all";

  // Clear all filters
  const clearAllFilters = () => {
    setStartDateFilter("");
    setEndDateFilter("");
    setYouthFilter("all");
    setProgramFilter("all");
    setContributorFilter("all");
    setLifecycleStatusFilter("all");
    setFilterStatus("all");
  };

  // Count active advanced filters
  const countActiveFilters = () => {
    let count = 0;
    if (startDateFilter) count++;
    if (endDateFilter) count++;
    if (youthFilter !== "all") count++;
    if (programFilter !== "all") count++;
    if (contributorFilter !== "all") count++;
    if (lifecycleStatusFilter !== "all") count++;
    return count;
  };

  const activeFilterCount = countActiveFilters();

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
                Individual Treatment Plans
              </h1>
            </div>
          </div>

          {/* Right: Action Controls */}
          <div className="flex items-center gap-2">
            {/* Print Icon */}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-8 p-0"
              title="Print"
              style={{
                opacity: 0.4,
                cursor: "not-allowed",
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
              className="h-9 w-8 p-0"
              title="Report"
              style={{
                opacity: 0.4,
                cursor: "not-allowed",
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

            {/* Care Planning Summary Button */}
            <Button
              size="sm"
              variant="outline"
              className="h-9 px-3 text-xs"
              style={{
                opacity: 0.4,
                cursor: "not-allowed",
                backgroundColor: "white",
                borderRadius: "12px",
              }}
            >
              <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
              Care Planning Summary
            </Button>

            {/* Refresh Icon */}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-8 p-0"
              title="Refresh"
              onClick={() => setItpPlans([...itpPlans])}
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

            {/* Create New Plan Button - Primary Action at Extreme Right */}
            <Button
              size="sm"
              className="h-9 px-3 text-xs text-white"
              onClick={() => setCreateDialogOpen(true)}
              style={{
                backgroundColor: "var(--color-brand-primary)",
                borderRadius: "9999px",
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Create New Plan
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            aria-label="View all ITP plans"
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
                    Total Plans
                  </p>
                  <p
                    className="text-2xl font-bold mt-1 group-hover:text-gray-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {stats.total}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <FileText className="h-5 w-5 text-gray-600 group-hover:text-gray-700" />
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
            onClick={() =>
              setLifecycleStatusFilter(
                lifecycleStatusFilter === "New" ? "all" : "New",
              )
            }
            role="button"
            tabIndex={0}
            aria-label="View new ITP plans"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wide transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    New
                  </p>
                  <p
                    className="text-2xl font-bold mt-1 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {stats.new}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <FileText className="h-5 w-5 text-gray-600 group-hover:text-gray-700" />
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
            onClick={() =>
              setLifecycleStatusFilter(
                lifecycleStatusFilter === "In Progress"
                  ? "all"
                  : "In Progress",
              )
            }
            role="button"
            tabIndex={0}
            aria-label="View in progress ITP plans"
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
                    In Progress
                  </p>
                  <p
                    className="text-2xl font-bold mt-1 group-hover:text-blue-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {stats.inProgress}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Clock className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
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
            onClick={() =>
              setLifecycleStatusFilter(
                lifecycleStatusFilter === "Ready for Review"
                  ? "all"
                  : "Ready for Review",
              )
            }
            role="button"
            tabIndex={0}
            aria-label="View ready for review ITP plans"
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
                    Ready for Review
                  </p>
                  <p
                    className="text-2xl font-bold mt-1 group-hover:text-orange-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {stats.readyForReview}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <AlertCircle className="h-5 w-5 text-orange-600 group-hover:text-orange-700" />
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
            onClick={() =>
              setLifecycleStatusFilter(
                lifecycleStatusFilter === "Finalized"
                  ? "all"
                  : "Finalized",
              )
            }
            role="button"
            tabIndex={0}
            aria-label="View finalized ITP plans"
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
                    {stats.finalized}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 group-hover:text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* List View */}
      <div
        className="flex-1 overflow-y-auto app-page-x pb-6"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-alt-2)",
        }}
      >
        {filteredPlans.length > 0 ? (
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
                  "var(--slds-g-color-neutral-base-100)",
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
                  All Plans ({filteredPlans.length})
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  {/* Start Date Filter */}
                  <div className="relative w-[128px] shrink-0">
                    <DateInput
                      value={isoToMdy(startDateFilter)}
                      onChange={(v) =>
                        ((e) =>
                          setStartDateFilter(e.target.value))({
                          target: { value: mdyToIso(v) },
                        })
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
                    {startDateFilter && (
                      <button
                        onClick={() => setStartDateFilter("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* End Date Filter */}
                  <div className="relative w-[128px] shrink-0">
                    <DateInput
                      value={isoToMdy(endDateFilter)}
                      onChange={(v) =>
                        ((e) =>
                          setEndDateFilter(e.target.value))({
                          target: { value: mdyToIso(v) },
                        })
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
                    {endDateFilter && (
                      <button
                        onClick={() => setEndDateFilter("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Youth Filter */}
                  <div className="relative w-[110px] shrink-0">
                    <select
                      value={youthFilter}
                      onChange={(e) =>
                        setYouthFilter(e.target.value)
                      }
                      className="w-full h-9 text-sm px-3 pr-7 appearance-none"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        color:
                          "var(--slds-g-color-text-default)",
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
                      value={programFilter}
                      onChange={(e) =>
                        setProgramFilter(e.target.value)
                      }
                      className="w-full h-9 text-sm px-3 pr-7 appearance-none"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        color:
                          "var(--slds-g-color-text-default)",
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

                  {/* Contributor Filter */}
                  <div className="relative w-[120px] shrink-0">
                    <select
                      value={contributorFilter}
                      onChange={(e) =>
                        setContributorFilter(e.target.value)
                      }
                      className="w-full h-9 text-sm px-3 pr-7 appearance-none"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        color:
                          "var(--slds-g-color-text-default)",
                        borderRadius:
                          "var(--slds-c-input-radius-border)",
                      }}
                    >
                      <option value="all">Contributor</option>
                      {CONTRIBUTOR_OPTIONS.map(
                        (contributor) => (
                          <option
                            key={contributor}
                            value={contributor}
                          >
                            {contributor}
                          </option>
                        ),
                      )}
                    </select>
                    <ChevronDown
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    />
                  </div>

                  {/* Lifecycle Status Filter */}
                  <div className="relative w-[110px] shrink-0">
                    <select
                      value={lifecycleStatusFilter}
                      onChange={(e) =>
                        setLifecycleStatusFilter(e.target.value)
                      }
                      className="w-full h-9 text-sm px-3 pr-7 appearance-none"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        color:
                          "var(--slds-g-color-text-default)",
                        borderRadius:
                          "var(--slds-c-input-radius-border)",
                      }}
                    >
                      <option value="all">Status</option>
                      <option value="New">New</option>
                      <option value="In Progress">
                        In Progress
                      </option>
                      <option value="Ready for Review">
                        Ready for Review
                      </option>
                      <option value="Finalized">
                        Finalized
                      </option>
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
                      placeholder="Search plans"
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

                  {/* Clear All */}
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs hover:underline shrink-0 whitespace-nowrap"
                      style={{
                        color: "var(--color-brand-primary)",
                      }}
                    >
                      Clear All ({activeFilterCount})
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent
              className="!p-0 !m-0"
              style={{
                padding: 0,
                margin: 0,
              }}
            >
              <Table className="!m-0">
                <TableHeader
                  className="sticky top-0 z-10"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <TableRow
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    {[
                      { label: "NAME", cls: "pl-6 w-[200px]" },
                      { label: "PERIOD", cls: "px-2" },
                      { label: "PROGRAM", cls: "px-2" },
                      { label: "CONTRIBUTORS", cls: "px-2" },
                      { label: "STATUS", cls: "px-2 pr-6" },
                    ].map(({ label, cls }) => (
                      <TableHead
                        key={label}
                        className={`h-10 ${cls}`}
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          fontSize: 12,
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                        }}
                      >
                        {label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itpPageRows.map((plan) => (
                    <TableRow
                      key={plan.id}
                      className="transition-colors cursor-pointer"
                      onClick={() =>
                        setSelectedPlanId(
                          selectedPlanId === plan.id
                            ? null
                            : plan.id,
                        )
                      }
                      style={{
                        backgroundColor:
                          selectedPlanId === plan.id
                            ? "var(--slds-g-color-background-alt)"
                            : "transparent",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedPlanId !== plan.id) {
                          e.currentTarget.style.backgroundColor =
                            "var(--slds-g-color-background-alt)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedPlanId !== plan.id) {
                          e.currentTarget.style.backgroundColor =
                            "transparent";
                        }
                      }}
                    >
                      <TableCell className="pl-6 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (openInModal) {
                              setModalPlanId(plan.id);
                            } else {
                              navigate(
                                `/itp-module/${plan.id}`,
                              );
                            }
                          }}
                          className="text-left hover:underline focus:outline-none focus:underline"
                          style={{
                            color: "var(--color-link-blue)",
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 13,
                          }}
                        >
                          {plan.youthName}
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
                        {formatDate(plan.startDate)} –{" "}
                        {formatDate(plan.endDate)}
                      </TableCell>
                      <TableCell
                        className="px-2 py-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          fontSize: 13,
                        }}
                      >
                        {plan.program}
                      </TableCell>
                      <TableCell
                        className="px-2 py-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          fontSize: 13,
                        }}
                      >
                        {plan.contributors.join(", ")}
                      </TableCell>
                      <TableCell className="px-2 py-3 pr-6">
                        {(() => {
                          const badgeMap: Record<
                            string,
                            { bg: string; color: string }
                          > = {
                            New: {
                              bg: "var(--slds-g-color-background-alt)",
                              color:
                                "var(--slds-g-color-text-weak)",
                            },
                            "In Progress": {
                              bg: "#DBEAFE",
                              color: "#1E40AF",
                            },
                            "Ready for Review": {
                              bg: "#FEF3C7",
                              color: "#92400E",
                            },
                            Finalized: {
                              bg: "#F3E8FF",
                              color: "#6B21A8",
                            },
                          };
                          const badge =
                            badgeMap[plan.lifecycleStatus] ||
                            badgeMap.New;
                          return (
                            <Badge
                              variant="outline"
                              className="rounded-full text-xs font-medium px-2.5"
                              style={{
                                backgroundColor: badge.bg,
                                color: badge.color,
                                border: "none",
                              }}
                            >
                              {plan.lifecycleStatus}
                            </Badge>
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
                    {filteredPlans.length === 0
                      ? "0"
                      : `${(itpSafePage - 1) * ITP_PAGE_SIZE + 1}–${Math.min(itpSafePage * ITP_PAGE_SIZE, filteredPlans.length)}`}
                  </span>
                  {" of "}
                  <span
                    style={{
                      fontWeight: 600,
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {filteredPlans.length}
                  </span>
                  {" records"}
                </p>
                {itpTotalPages > 1 && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setItpPage((p) => Math.max(1, p - 1))
                      }
                      disabled={itpSafePage === 1}
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
                        {itpSafePage}
                      </span>
                      {" of "}
                      <span style={{ fontWeight: 600 }}>
                        {itpTotalPages}
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setItpPage((p) =>
                          Math.min(itpTotalPages, p + 1),
                        )
                      }
                      disabled={itpSafePage === itpTotalPages}
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
          <Card
            className="shadow-sm overflow-hidden"
            style={{
              backgroundColor:
                "var(--slds-g-color-background-base)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "var(--slds-c-card-radius-border)",
            }}
          >
            <CardContent className="p-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <FileText
                  className="h-12 w-12"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    opacity: 0.3,
                  }}
                />
                <div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    No ITP Plans Found
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    {searchTerm || filterStatus !== "all"
                      ? "Try adjusting your search or filters"
                      : "Create a new plan to get started"}
                  </p>
                </div>
                {!searchTerm && filterStatus === "all" && (
                  <Button
                    size="sm"
                    className="rounded-full h-9 text-sm text-white mt-2"
                    onClick={() => setCreateDialogOpen(true)}
                    style={{
                      backgroundColor:
                        "var(--color-brand-primary)",
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Create First Plan
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ITP Detail Modal - Constituents context only. Opens the exact
          same ITP workspace as an overlay on this page instead of
          navigating to the standalone ITP Module route. */}
      {openInModal && (
        <Dialog
          open={modalPlanId !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) setModalPlanId(null);
          }}
        >
          <DialogContent className="w-[97vw] h-[95vh] max-w-none sm:max-w-none p-0 gap-0 overflow-hidden flex flex-col">
            <VisuallyHidden>
              <DialogTitle>ITP Plan Details</DialogTitle>
              <DialogDescription>
                Individual Treatment Plan workspace
              </DialogDescription>
            </VisuallyHidden>
            {modalPlanId !== null && (
              <EditITPWorkspace
                overrideId={String(modalPlanId)}
                onBack={() => setModalPlanId(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Create ITP Plan Dialog */}
      <CreateITPPlanDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreatePlan={handleCreatePlan}
      />

      {/* Report Generation Dialog */}
      {reportDialogOpen && selectedPlanId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => {
            setReportDialogOpen(false);
            setSelectedReportType(null);
          }}
        >
          <div
            className="relative w-full max-w-lg rounded-lg shadow-xl"
            style={{
              backgroundColor:
                "var(--slds-g-color-background-alt-2)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 flex items-center justify-center rounded-md"
                  style={{
                    backgroundColor:
                      "var(--color-brand-primary)",
                  }}
                >
                  <FileBarChart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2
                    className="text-lg font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Generate ITP Report
                  </h2>
                  <p
                    className="text-sm"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    {
                      itpPlans.find(
                        (p) => p.id === selectedPlanId,
                      )?.youthName
                    }{" "}
                    -{" "}
                    {
                      itpPlans.find(
                        (p) => p.id === selectedPlanId,
                      )?.program
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setReportDialogOpen(false);
                  setSelectedReportType(null);
                }}
                className="h-9 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
              >
                <X
                  className="h-4 w-4"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                />
              </button>
            </div>

            {/* Dialog Content */}
            <div className="px-6 py-6 space-y-4">
              <div>
                <label
                  className="text-sm font-semibold mb-1.5 block"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Select Report Type
                </label>

                {/* Report Type Options */}
                <div className="space-y-3">
                  {/* Compliance Report */}
                  <div
                    className="p-4 rounded-lg border-2 cursor-pointer transition-all"
                    style={{
                      backgroundColor:
                        selectedReportType ===
                        "Compliance Report"
                          ? "var(--slds-g-color-background-alt)"
                          : "var(--slds-g-color-background)",
                      borderColor:
                        selectedReportType ===
                        "Compliance Report"
                          ? "var(--color-brand-primary)"
                          : "var(--slds-g-color-border-base-1)",
                    }}
                    onClick={() =>
                      setSelectedReportType("Compliance Report")
                    }
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <div
                          className="h-4 w-4 rounded-full border-2 flex items-center justify-center"
                          style={{
                            borderColor:
                              selectedReportType ===
                              "Compliance Report"
                                ? "var(--color-brand-primary)"
                                : "var(--slds-g-color-border-base-1)",
                          }}
                        >
                          {selectedReportType ===
                            "Compliance Report" && (
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor:
                                  "var(--color-brand-primary)",
                              }}
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div
                          className="font-semibold text-sm mb-1"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          Compliance Report
                        </div>
                        <p
                          className="text-xs"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Detailed compliance tracking including
                          goal completion rates, documentation
                          status, and regulatory requirements
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Report */}
                  <div
                    className="p-4 rounded-lg border-2 cursor-pointer transition-all"
                    style={{
                      backgroundColor:
                        selectedReportType === "Status Report"
                          ? "var(--slds-g-color-background-alt)"
                          : "var(--slds-g-color-background)",
                      borderColor:
                        selectedReportType === "Status Report"
                          ? "var(--color-brand-primary)"
                          : "var(--slds-g-color-border-base-1)",
                    }}
                    onClick={() =>
                      setSelectedReportType("Status Report")
                    }
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <div
                          className="h-4 w-4 rounded-full border-2 flex items-center justify-center"
                          style={{
                            borderColor:
                              selectedReportType ===
                              "Status Report"
                                ? "var(--color-brand-primary)"
                                : "var(--slds-g-color-border-base-1)",
                          }}
                        >
                          {selectedReportType ===
                            "Status Report" && (
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor:
                                  "var(--color-brand-primary)",
                              }}
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div
                          className="font-semibold text-sm mb-1"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          Status Report
                        </div>
                        <p
                          className="text-xs"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Current progress summary with goal
                          status, milestones achieved, and
                          upcoming deadlines
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Planning Report */}
                  <div
                    className="p-4 rounded-lg border-2 cursor-pointer transition-all"
                    style={{
                      backgroundColor:
                        selectedReportType === "Planning Report"
                          ? "var(--slds-g-color-background-alt)"
                          : "var(--slds-g-color-background)",
                      borderColor:
                        selectedReportType === "Planning Report"
                          ? "var(--color-brand-primary)"
                          : "var(--slds-g-color-border-base-1)",
                    }}
                    onClick={() =>
                      setSelectedReportType("Planning Report")
                    }
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <div
                          className="h-4 w-4 rounded-full border-2 flex items-center justify-center"
                          style={{
                            borderColor:
                              selectedReportType ===
                              "Planning Report"
                                ? "var(--color-brand-primary)"
                                : "var(--slds-g-color-border-base-1)",
                          }}
                        >
                          {selectedReportType ===
                            "Planning Report" && (
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor:
                                  "var(--color-brand-primary)",
                              }}
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div
                          className="font-semibold text-sm mb-1"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          Planning Report
                        </div>
                        <p
                          className="text-xs"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Comprehensive care planning document
                          including goals, interventions, and
                          treatment strategies
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dialog Footer */}
            <div
              className="flex items-center justify-end gap-2 px-6 py-4"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <button
                onClick={() => {
                  setReportDialogOpen(false);
                  setSelectedReportType(null);
                }}
                className="px-4 py-2 text-sm rounded-md transition-colors"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                  backgroundColor:
                    "var(--slds-g-color-background)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={!selectedReportType}
                className="px-4 py-2 text-sm rounded-md text-white transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: selectedReportType
                    ? "var(--color-brand-primary)"
                    : "#9CA3AF",
                  cursor: selectedReportType
                    ? "pointer"
                    : "not-allowed",
                  opacity: selectedReportType ? 1 : 0.6,
                }}
              >
                <Download className="h-4 w-4" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Care Planning Summary Dialog */}
      {carePlanningSummaryOpen && selectedPlanId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setCarePlanningSummaryOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[90vh] overflow-auto rounded-lg shadow-xl"
            style={{
              backgroundColor:
                "var(--slds-g-color-background-alt-2)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
              style={{
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt-2)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 flex items-center justify-center rounded-md"
                  style={{
                    backgroundColor:
                      "var(--color-brand-primary)",
                  }}
                >
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2
                    className="text-lg font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Care Planning Summary
                  </h2>
                  <p
                    className="text-sm"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    {
                      itpPlans.find(
                        (p) => p.id === selectedPlanId,
                      )?.youthName
                    }{" "}
                    -{" "}
                    {
                      itpPlans.find(
                        (p) => p.id === selectedPlanId,
                      )?.program
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toast.success(
                      "Printing Care Planning Summary...",
                    );
                  }}
                  className="h-9 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                  title="Print Summary"
                >
                  <Printer
                    className="h-4 w-4"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                </button>
                <button
                  onClick={() => {
                    toast.success(
                      "Exporting Care Planning Summary...",
                    );
                  }}
                  className="h-9 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                  title="Export as PDF"
                >
                  <Download
                    className="h-4 w-4"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Dialog Content */}
            <div className="px-6 py-6 space-y-6">
              {(() => {
                const selectedPlan = itpPlans.find(
                  (p) => p.id === selectedPlanId,
                );
                const summaryData =
                  CARE_PLANNING_SUMMARY_DATA[selectedPlanId];

                if (!selectedPlan || !summaryData) return null;

                return (
                  <>
                    {/* Overview Section */}
                    <div
                      className="p-5 rounded-lg"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background)",
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div
                            className="text-xs mb-1"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Plan Period
                          </div>
                          <div
                            className="text-sm font-semibold"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {formatDate(selectedPlan.startDate)}{" "}
                            - {formatDate(selectedPlan.endDate)}
                          </div>
                        </div>
                        <div>
                          <div
                            className="text-xs mb-1"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Overall Progress
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="text-sm font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              {selectedPlan.completionProgress}%
                            </div>
                            <div
                              className="flex-1 h-2 rounded-full"
                              style={{
                                backgroundColor: "#E5E7EB",
                              }}
                            >
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{
                                  width: `${selectedPlan.completionProgress}%`,
                                  backgroundColor:
                                    "var(--color-brand-primary)",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <div
                            className="text-xs mb-1"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Status
                          </div>
                          <div>
                            {getStatusBadge(
                              selectedPlan.status,
                            )}
                          </div>
                        </div>
                        <div>
                          <div
                            className="text-xs mb-1"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Contributors
                          </div>
                          <div
                            className="text-sm font-semibold"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {selectedPlan.contributors.length}{" "}
                            Team Members
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Goals & Progress Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2
                          className="h-5 w-5"
                          style={{
                            color: "var(--color-brand-primary)",
                          }}
                        />
                        <h3
                          className="text-base font-semibold"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          Goals & Progress
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {summaryData.goals.map((goal: any) => (
                          <div
                            key={goal.id}
                            className="p-4 rounded-lg"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background)",
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className="text-xs px-2 py-0.5 rounded"
                                    style={{
                                      backgroundColor:
                                        "var(--slds-g-color-background-alt)",
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    {goal.category}
                                  </span>
                                </div>
                                <h4
                                  className="font-semibold text-sm mb-1"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {goal.title}
                                </h4>
                                <p
                                  className="text-xs mb-2"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  {goal.description}
                                </p>
                              </div>
                              <div className="ml-4">
                                <Badge
                                  className="text-xs px-2 py-0.5"
                                  style={{
                                    backgroundColor:
                                      goal.status ===
                                      "Completed"
                                        ? "#E8F5E9"
                                        : goal.status ===
                                            "On Track"
                                          ? "#E3F2FD"
                                          : goal.status ===
                                              "Needs Attention"
                                            ? "#FFEBEE"
                                            : "#FFF3E0",
                                    color:
                                      goal.status ===
                                      "Completed"
                                        ? "#2E7D32"
                                        : goal.status ===
                                            "On Track"
                                          ? "#1565C0"
                                          : goal.status ===
                                              "Needs Attention"
                                            ? "#C62828"
                                            : "#E65100",
                                    border: `1px solid ${
                                      goal.status ===
                                      "Completed"
                                        ? "#81C784"
                                        : goal.status ===
                                            "On Track"
                                          ? "#64B5F6"
                                          : goal.status ===
                                              "Needs Attention"
                                            ? "#E57373"
                                            : "#FFB74D"
                                    }`,
                                  }}
                                >
                                  {goal.status}
                                </Badge>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className="text-xs"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  Progress
                                </span>
                                <span
                                  className="text-xs font-semibold"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {goal.progress}%
                                </span>
                              </div>
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  backgroundColor: "#E5E7EB",
                                }}
                              >
                                <div
                                  className="h-2 rounded-full transition-all"
                                  style={{
                                    width: `${goal.progress}%`,
                                    backgroundColor:
                                      goal.progress === 100
                                        ? "#2E7D32"
                                        : goal.progress >= 60
                                          ? "#1565C0"
                                          : goal.progress >= 40
                                            ? "#E65100"
                                            : "#C62828",
                                  }}
                                />
                              </div>
                            </div>

                            {/* Interventions */}
                            <div>
                              <div
                                className="text-xs font-semibold mb-2"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                Interventions & Strategies:
                              </div>
                              <ul className="space-y-1">
                                {goal.interventions.map(
                                  (
                                    intervention: string,
                                    idx: number,
                                  ) => (
                                    <li
                                      key={idx}
                                      className="text-xs flex items-start gap-2"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      <span className="mt-1">
                                        •
                                      </span>
                                      <span>
                                        {intervention}
                                      </span>
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>

                            <div
                              className="mt-3 pt-3"
                              style={{
                                borderTop:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              <div
                                className="flex items-center gap-1 text-xs"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Target Date:{" "}
                                  {formatDate(goal.targetDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Milestones & Achievements */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2
                          className="h-5 w-5"
                          style={{
                            color: "var(--color-brand-primary)",
                          }}
                        />
                        <h3
                          className="text-base font-semibold"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          Milestones & Achievements
                        </h3>
                      </div>
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <div className="space-y-3">
                          {summaryData.milestones.map(
                            (milestone: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-start gap-3"
                              >
                                <div
                                  className="h-9 w-8 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{
                                    backgroundColor:
                                      "var(--color-brand-primary)",
                                  }}
                                >
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1 pt-1">
                                  <div
                                    className="text-xs mb-1"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    {formatDate(milestone.date)}
                                  </div>
                                  <div
                                    className="text-sm"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {milestone.achievement}
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Upcoming Activities */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Clock
                          className="h-5 w-5"
                          style={{
                            color: "var(--color-brand-primary)",
                          }}
                        />
                        <h3
                          className="text-base font-semibold"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          Upcoming Activities
                        </h3>
                      </div>
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <div className="space-y-3">
                          {summaryData.upcomingActivities.map(
                            (activity: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-start gap-3"
                              >
                                <div
                                  className="h-9 w-8 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-alt)",
                                    border:
                                      "2px solid var(--color-brand-primary)",
                                  }}
                                >
                                  <Calendar
                                    className="h-4 w-4"
                                    style={{
                                      color:
                                        "var(--color-brand-primary)",
                                    }}
                                  />
                                </div>
                                <div className="flex-1 pt-1">
                                  <div
                                    className="text-xs mb-1 font-semibold"
                                    style={{
                                      color:
                                        "var(--color-brand-primary)",
                                    }}
                                  >
                                    {formatDate(activity.date)}
                                  </div>
                                  <div
                                    className="text-sm"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {activity.activity}
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contributors */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Users
                          className="h-5 w-5"
                          style={{
                            color: "var(--color-brand-primary)",
                          }}
                        />
                        <h3
                          className="text-base font-semibold"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          Care Team Contributors
                        </h3>
                      </div>
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <div className="flex flex-wrap gap-2">
                          {selectedPlan.contributors.map(
                            (
                              contributor: string,
                              idx: number,
                            ) => (
                              <div
                                key={idx}
                                className="px-3 py-1.5 rounded-md text-sm flex items-center gap-2"
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-alt)",
                                  border:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                <div
                                  className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                                  style={{
                                    backgroundColor:
                                      "var(--color-brand-primary)",
                                  }}
                                >
                                  {contributor
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </div>
                                <span
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {contributor}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Dialog Footer */}
            <div
              className="sticky bottom-0 flex items-center justify-end gap-2 px-6 py-4"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt-2)",
              }}
            >
              <button
                onClick={() =>
                  setCarePlanningSummaryOpen(false)
                }
                className="px-4 py-2 text-sm rounded-md text-white transition-colors"
                style={{
                  backgroundColor: "var(--color-brand-primary)",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}