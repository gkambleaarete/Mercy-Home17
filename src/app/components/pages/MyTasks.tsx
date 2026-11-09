import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  CheckSquare,
  Calendar,
  Clock,
  AlertCircle,
  Filter,
  Search,
  ChevronRight,
  User,
  TrendingUp,
  BarChart3,
  ArrowUpDown,
} from "@/app/lib/lucide-icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { TimelineActivity } from "../ActivityTimeline";
import { updateContactLogFollowUpStatus } from "../ContactLogDialogSLDS";
import { toast } from "sonner";
import { formatMdy } from "../../lib/dateFormat";

// Mock data - In production, this would come from a global state or API
const MOCK_TASKS: TimelineActivity[] = [
  {
    id: "task-1",
    type: "task",
    title: "Follow-up: DCFS - Marcus Johnson",
    description:
      "Follow-up from Contact Log (DCFS)\n\nOriginal Contact Details:\nDiscussed placement options and timeline. Mother expressed concerns about distance from family.\n\nFollow-up Notes:\nSchedule home visit to discuss concerns\n\nContact Information:\n- Date: 3/15/2026\n- Type: Phone Call\n- Result: Connected\n- Caller: Maria Rodriguez\n- Candidate: Marcus Johnson",
    user: "Maria Rodriguez",
    timestamp: "2026-03-16T09:00:00.000Z",
    status: "pending",
    category: "dcfs",
  },
  {
    id: "task-2",
    type: "task",
    title: "Follow-up: School - Sarah Williams",
    description:
      "Follow-up from Contact Log (School)\n\nOriginal Contact Details:\nSchool counselor reported behavioral incidents. Need to coordinate IEP meeting.\n\nContact Information:\n- Date: 3/14/2026\n- Type: Email\n- Result: Connected\n- Caller: John Smith\n- Candidate: Sarah Williams",
    user: "Current User",
    timestamp: "2026-03-18T14:00:00.000Z",
    status: "pending",
    category: "school",
  },
  {
    id: "task-3",
    type: "task",
    title: "Follow-up: Medical - David Chen",
    description:
      "Follow-up from Contact Log (Medical)\n\nOriginal Contact Details:\nRequested medical records from previous provider. Still waiting on authorization.\n\nFollow-up Notes:\nCall clinic to check on status of records request\n\nContact Information:\n- Date: 3/12/2026\n- Type: Phone Call\n- Result: Left Message\n- Caller: Anna Kowalski\n- Candidate: David Chen",
    user: "Current User",
    timestamp: "2026-03-19T10:00:00.000Z",
    status: "pending",
    category: "medical",
  },
  {
    id: "task-4",
    type: "task",
    title: "Follow-up: Legal - Jennifer Martinez",
    description:
      "Follow-up from Contact Log (Legal)\n\nOriginal Contact Details:\nCourt date scheduled for custody hearing. Need to coordinate transportation.\n\nContact Information:\n- Date: 3/10/2026\n- Type: In-Person\n- Result: Connected\n- Caller: Michael Johnson\n- Candidate: Jennifer Martinez",
    user: "Current User",
    timestamp: "2026-03-14T09:00:00.000Z",
    status: "pending",
    category: "legal",
  },
  {
    id: "task-5",
    type: "task",
    title: "Follow-up: Mental Health - Kevin Brown",
    description:
      "Follow-up from Contact Log (Mental Health)\n\nOriginal Contact Details:\nInitial therapy session completed. Therapist recommends weekly sessions.\n\nFollow-up Notes:\nSchedule ongoing therapy appointments\n\nContact Information:\n- Date: 3/17/2026\n- Type: Video Call\n- Result: Connected\n- Caller: Sarah Chen\n- Candidate: Kevin Brown",
    user: "Current User",
    timestamp: "2026-03-20T15:00:00.000Z",
    status: "pending",
    category: "mental_health",
  },
  {
    id: "task-6",
    type: "task",
    title: "Follow-up: Family - Ashley Davis",
    description:
      "Follow-up from Contact Log (Family)\n\nOriginal Contact Details:\nMother requested family therapy. Need to coordinate schedules.\n\nContact Information:\n- Date: 3/11/2026\n- Type: Phone Call\n- Result: Connected\n- Caller: David Williams\n- Candidate: Ashley Davis",
    user: "Current User",
    timestamp: "2026-03-13T11:00:00.000Z",
    status: "pending",
    category: "family",
  },
];

// Category colors and labels
const CATEGORY_CONFIG = {
  dcfs: { label: "DCFS", color: "#DC2626" },
  guardianship: { label: "Guardianship", color: "#059669" },
  medical: { label: "Medical", color: "#0891B2" },
  legal: { label: "Legal", color: "#7C3AED" },
  school: { label: "School", color: "#EA580C" },
  family: { label: "Family", color: "#E11D48" },
  housing: { label: "Housing", color: "#0D9488" },
  mental_health: { label: "Mental Health", color: "#8B5CF6" },
  internal: { label: "Internal", color: "#6B7280" },
  other: { label: "Other", color: "#9CA3AF" },
};

export function MyTasks() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("open");
  const [sortBy, setSortBy] = useState<
    "dueDate" | "category" | "priority"
  >("dueDate");

  // Load tasks from localStorage (AC6: tasks from contact logs)
  const [allTasks, setAllTasks] = useState<TimelineActivity[]>(
    () => {
      const storedTasks = localStorage.getItem("followUpTasks");
      if (storedTasks) {
        try {
          const parsed = JSON.parse(storedTasks);
          // Convert stored tasks to TimelineActivity format
          return parsed.map((task: any) => ({
            id: task.id,
            type: "task" as const,
            title: task.subject,
            description: task.description,
            user: task.assignedTo || "Current User",
            timestamp: task.dueDate,
            status:
              task.status === "Completed"
                ? "completed"
                : "pending",
            category: task.category
              ?.toLowerCase()
              .replace(/\s+/g, "_"),
          }));
        } catch (e) {
          console.error("Error loading tasks:", e);
        }
      }
      // Fallback to mock data if no tasks in localStorage
      return MOCK_TASKS;
    },
  );

  // Handler to mark task as complete (AC9: Update contact log when task completed)
  const handleMarkComplete = (taskId: string) => {
    // Update task status in state
    setAllTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: "completed" as const }
          : task,
      ),
    );

    // Update localStorage
    const storedTasks = JSON.parse(
      localStorage.getItem("followUpTasks") || "[]",
    );
    const updatedTasks = storedTasks.map((task: any) =>
      task.id === taskId
        ? { ...task, status: "Completed" }
        : task,
    );
    localStorage.setItem(
      "followUpTasks",
      JSON.stringify(updatedTasks),
    );

    // AC9: Update the corresponding contact log's follow-up status
    updateContactLogFollowUpStatus(taskId, "Completed");

    toast.success(
      "Task marked as complete! Contact log follow-up status updated.",
    );
  };

  // Get task priority based on due date
  const getTaskPriority = (task: TimelineActivity) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.timestamp);
    dueDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.ceil(
      (dueDate.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (daysDiff < 0) return "overdue";
    if (daysDiff === 0) return "today";
    if (daysDiff <= 3) return "upcoming";
    return "future";
  };

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let tasks = allTasks.filter((task) => {
      // Status filter
      if (filterStatus === "open" && task.status !== "pending")
        return false;
      if (
        filterStatus === "completed" &&
        task.status !== "completed"
      )
        return false;

      // Category filter
      if (
        filterCategory !== "all" &&
        task.category !== filterCategory
      )
        return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.user.toLowerCase().includes(query)
        );
      }

      return true;
    });

    // Sort tasks
    tasks.sort((a, b) => {
      if (sortBy === "dueDate") {
        return (
          new Date(a.timestamp).getTime() -
          new Date(b.timestamp).getTime()
        );
      } else if (sortBy === "category") {
        return (a.category || "").localeCompare(
          b.category || "",
        );
      } else {
        // Priority sort (overdue > today > upcoming > future)
        const priorityOrder = {
          overdue: 0,
          today: 1,
          upcoming: 2,
          future: 3,
        };
        const aPriority =
          priorityOrder[
            getTaskPriority(a) as keyof typeof priorityOrder
          ];
        const bPriority =
          priorityOrder[
            getTaskPriority(b) as keyof typeof priorityOrder
          ];
        return aPriority - bPriority;
      }
    });

    return tasks;
  }, [searchQuery, filterCategory, filterStatus, sortBy]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const openTasks = allTasks.filter(
      (t) => t.status === "pending",
    );
    const overdueTasks = openTasks.filter(
      (t) => getTaskPriority(t) === "overdue",
    );
    const todayTasks = openTasks.filter(
      (t) => getTaskPriority(t) === "today",
    );
    const upcomingTasks = openTasks.filter(
      (t) => getTaskPriority(t) === "upcoming",
    );

    // Category breakdown
    const categoryBreakdown = openTasks.reduce(
      (acc, task) => {
        const cat = task.category || "other";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total: openTasks.length,
      overdue: overdueTasks.length,
      today: todayTasks.length,
      upcoming: upcomingTasks.length,
      categoryBreakdown,
    };
  }, [allTasks]);

  const getPriorityBadge = (task: TimelineActivity) => {
    const priority = getTaskPriority(task);
    const config = {
      overdue: {
        label: "OVERDUE",
        bg: "#FEE2E2",
        text: "#991B1B",
        border: "#FCA5A5",
      },
      today: {
        label: "DUE TODAY",
        bg: "#FEF3C7",
        text: "#92400E",
        border: "#FCD34D",
      },
      upcoming: {
        label: "DUE SOON",
        bg: "#DBEAFE",
        text: "#1E40AF",
        border: "#93C5FD",
      },
      future: {
        label: "SCHEDULED",
        bg: "#F3F4F6",
        text: "#374151",
        border: "#D1D5DB",
      },
    };

    const style = config[priority as keyof typeof config];

    return (
      <Badge
        className="text-[10px] font-bold px-2 py-0.5"
        style={{
          backgroundColor: style.bg,
          color: style.text,
          border: `1px solid ${style.border}`,
        }}
      >
        {style.label}
      </Badge>
    );
  };

  const formatDueDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.ceil(
      (taskDate.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (daysDiff === 0) return "Today";
    if (daysDiff === 1) return "Tomorrow";
    if (daysDiff === -1) return "Yesterday";
    if (daysDiff < 0)
      return `${Math.abs(daysDiff)} days overdue`;

    return formatMdy(date);
  };

  const extractYouthName = (title: string) => {
    const match = title.match(/- (.+)$/);
    return match ? match[1] : "Unknown Youth";
  };

  return (
    <div className="h-full overflow-auto bg-[#f3f4f6] app-page">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              My Follow-up Tasks
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Command center for all outstanding follow-ups from
              contact logs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="h-9 text-sm"
              style={{
                backgroundColor: "#145F33",
                color: "white",
                borderRadius:
                  "var(--slds-c-button-radius-border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "#0f4526";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "#145F33";
              }}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Dashboard
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            className="border"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
              borderRadius: "var(--slds-c-card-radius-border)",
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-medium"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Total Open
                  </p>
                  <p
                    className="text-2xl font-bold mt-1"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {kpis.total}
                  </p>
                </div>
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#E0F2FE" }}
                >
                  <CheckSquare
                    className="h-5 w-5"
                    style={{ color: "#0369A1" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border"
            style={{
              borderColor: "#FCA5A5",
              borderRadius: "var(--slds-c-card-radius-border)",
              backgroundColor: "#FEF2F2",
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-red-700">
                    Overdue
                  </p>
                  <p className="text-2xl font-bold mt-1 text-red-900">
                    {kpis.overdue}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-red-100">
                  <AlertCircle className="h-5 w-5 text-red-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border"
            style={{
              borderColor: "#FCD34D",
              borderRadius: "var(--slds-c-card-radius-border)",
              backgroundColor: "#FFFBEB",
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-700">
                    Due Today
                  </p>
                  <p className="text-2xl font-bold mt-1 text-amber-900">
                    {kpis.today}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-amber-100">
                  <Clock className="h-5 w-5 text-amber-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border"
            style={{
              borderColor: "#93C5FD",
              borderRadius: "var(--slds-c-card-radius-border)",
              backgroundColor: "#EFF6FF",
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-700">
                    Due Soon (3 days)
                  </p>
                  <p className="text-2xl font-bold mt-1 text-blue-900">
                    {kpis.upcoming}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-100">
                  <Calendar className="h-5 w-5 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card
          className="border"
          style={{
            borderColor: "var(--slds-g-color-border-base-1)",
            borderRadius: "var(--slds-c-card-radius-border)",
          }}
        >
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks, youth names, or descriptions..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="pl-10 h-9"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-4)",
                    borderRadius:
                      "var(--slds-c-input-radius-border)",
                  }}
                />
              </div>
              <Select
                value={filterCategory}
                onValueChange={setFilterCategory}
              >
                <SelectTrigger className="w-full md:w-[200px] h-9">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Categories
                  </SelectItem>
                  {Object.entries(CATEGORY_CONFIG).map(
                    ([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger className="w-full md:w-[180px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">
                    Open Tasks
                  </SelectItem>
                  <SelectItem value="completed">
                    Completed
                  </SelectItem>
                  <SelectItem value="all">All Tasks</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as any)}
              >
                <SelectTrigger className="w-full md:w-[180px] h-9">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">
                    Due Date
                  </SelectItem>
                  <SelectItem value="priority">
                    Priority
                  </SelectItem>
                  <SelectItem value="category">
                    Category
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Task List */}
        <Card
          className="border"
          style={{
            borderColor: "var(--slds-g-color-border-base-1)",
            borderRadius: "var(--slds-c-card-radius-border)",
          }}
        >
          <CardHeader
            className="border-b"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
            }}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Tasks ({filteredTasks.length})
              </CardTitle>
              <div
                className="flex items-center gap-2 text-xs"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                <ArrowUpDown className="h-3 w-3" />
                <span>
                  Sorted by{" "}
                  {sortBy === "dueDate"
                    ? "Due Date"
                    : sortBy === "priority"
                      ? "Priority"
                      : "Category"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredTasks.length === 0 ? (
              <div
                className="text-center py-12"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  No tasks found matching your filters
                </p>
              </div>
            ) : (
              <div
                className="divide-y"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                }}
              >
                {filteredTasks.map((task) => {
                  const category =
                    CATEGORY_CONFIG[
                      task.category as keyof typeof CATEGORY_CONFIG
                    ] || CATEGORY_CONFIG.other;
                  const youthName = extractYouthName(
                    task.title,
                  );

                  return (
                    <div
                      key={task.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        // Navigate to youth record
                        toast.info(
                          `Navigating to ${youthName}'s record...`,
                        );
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: category.color,
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3
                                className="text-sm font-semibold truncate"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {task.title}
                              </h3>
                            </div>
                            {getPriorityBadge(task)}
                          </div>

                          <div
                            className="flex items-center gap-3 mb-2 text-xs"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{youthName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {formatDueDate(task.timestamp)}
                              </span>
                            </div>
                            <Badge
                              className="text-[10px] px-2 py-0"
                              style={{
                                backgroundColor:
                                  category.color + "20",
                                color: category.color,
                                border: `1px solid ${category.color}`,
                              }}
                            >
                              {category.label}
                            </Badge>
                          </div>

                          <p
                            className="text-xs line-clamp-2"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {task.description.split(
                              "\n\n",
                            )[1] ||
                              task.description.split("\n")[0]}
                          </p>

                          <div className="mt-3 flex items-center justify-between gap-2">
                            {/* AC9: Mark Complete Button */}
                            {task.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                style={{
                                  borderColor: "#145F33",
                                  color: "#145F33",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkComplete(task.id);
                                }}
                              >
                                <CheckSquare className="h-3 w-3 mr-1" />
                                Mark Complete
                              </Button>
                            )}
                            {task.status === "completed" && (
                              <Badge
                                className="text-[10px] px-2 py-1"
                                style={{
                                  backgroundColor: "#e6f2eb",
                                  color: "#145F33",
                                  border: "1px solid #145F33",
                                }}
                              >
                                ✓ Completed
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              className="h-7 text-xs ml-auto"
                              style={{
                                backgroundColor: "#145F33",
                                color: "white",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.info(
                                  `Opening ${youthName}'s record...`,
                                );
                              }}
                            >
                              View Youth Record
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}