import { useState } from "react";
import { useNavigate } from "react-router";
import { CheckSquare, Calendar, Clock, AlertCircle, ChevronRight, User, ArrowRight } from "@/app/lib/lucide-icons";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { TimelineActivity } from "./ActivityTimeline";
import { formatMdy } from "../lib/dateFormat";

// Mock data - should match the tasks created from Contact Logs
const MOCK_RECENT_TASKS: TimelineActivity[] = [
  {
    id: "task-1",
    type: "task",
    title: "Follow-up: DCFS - Marcus Johnson",
    description: "Follow-up from Contact Log (DCFS)\n\nOriginal Contact Details:\nDiscussed placement options and timeline.",
    user: "Current User",
    timestamp: "2026-03-16T09:00:00.000Z",
    status: "pending",
    category: "dcfs",
  },
  {
    id: "task-2",
    type: "task",
    title: "Follow-up: School - Sarah Williams",
    description: "Follow-up from Contact Log (School)\n\nOriginal Contact Details:\nSchool counselor reported behavioral incidents.",
    user: "Current User",
    timestamp: "2026-03-18T14:00:00.000Z",
    status: "pending",
    category: "school",
  },
  {
    id: "task-3",
    type: "task",
    title: "Follow-up: Medical - David Chen",
    description: "Follow-up from Contact Log (Medical)\n\nOriginal Contact Details:\nRequested medical records from previous provider.",
    user: "Current User",
    timestamp: "2026-03-19T10:00:00.000Z",
    status: "pending",
    category: "medical",
  },
  {
    id: "task-4",
    type: "task",
    title: "Follow-up: Legal - Jennifer Martinez",
    description: "Follow-up from Contact Log (Legal)\n\nOriginal Contact Details:\nCourt date scheduled for custody hearing.",
    user: "Current User",
    timestamp: "2026-03-14T09:00:00.000Z",
    status: "pending",
    category: "legal",
  },
];

const CATEGORY_COLORS = {
  dcfs: "#DC2626",
  medical: "#0891B2",
  legal: "#7C3AED",
  school: "#EA580C",
  family: "#E11D48",
  housing: "#0D9488",
  mental_health: "#8B5CF6",
  internal: "#6B7280",
  other: "#9CA3AF",
};

export function MyFollowUpTasksWidget() {
  const navigate = useNavigate();

  const getTaskPriority = (task: TimelineActivity) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.timestamp);
    dueDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) return "overdue";
    if (daysDiff === 0) return "today";
    if (daysDiff <= 3) return "upcoming";
    return "future";
  };

  const formatDueDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) return "Today";
    if (daysDiff === 1) return "Tomorrow";
    if (daysDiff === -1) return "Yesterday";
    if (daysDiff < 0) return `${Math.abs(daysDiff)}d overdue`;

    return formatMdy(date);
  };

  const extractYouthName = (title: string) => {
    const match = title.match(/- (.+)$/);
    return match ? match[1] : "Unknown Youth";
  };

  const getPriorityBadge = (task: TimelineActivity) => {
    const priority = getTaskPriority(task);
    const config = {
      overdue: { label: "OVERDUE", bg: "#FEE2E2", text: "#991B1B" },
      today: { label: "TODAY", bg: "#FEF3C7", text: "#92400E" },
      upcoming: { label: "SOON", bg: "#DBEAFE", text: "#1E40AF" },
      future: { label: "SCHEDULED", bg: "#F3F4F6", text: "#374151" },
    };

    const style = config[priority as keyof typeof config];

    return (
      <Badge
        className="text-[9px] font-bold px-1.5 py-0"
        style={{
          backgroundColor: style.bg,
          color: style.text,
        }}
      >
        {style.label}
      </Badge>
    );
  };

  // Sort by priority
  const sortedTasks = [...MOCK_RECENT_TASKS]
    .sort((a, b) => {
      const priorityOrder = { overdue: 0, today: 1, upcoming: 2, future: 3 };
      const aPriority = priorityOrder[getTaskPriority(a) as keyof typeof priorityOrder];
      const bPriority = priorityOrder[getTaskPriority(b) as keyof typeof priorityOrder];
      return aPriority - bPriority;
    })
    .slice(0, 5);

  const openTasks = MOCK_RECENT_TASKS.filter(t => t.status === "pending");
  const overdueTasks = openTasks.filter(t => getTaskPriority(t) === "overdue");
  const todayTasks = openTasks.filter(t => getTaskPriority(t) === "today");

  return (
    <Card
      className="border"
      style={{
        borderColor: "var(--slds-g-color-border-base-1)",
        borderRadius: "var(--slds-c-card-radius-border)",
      }}
    >
      <CardHeader className="border-b pb-3" style={{ borderColor: "var(--slds-g-color-border-base-1)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#145F33" }}
            >
              <CheckSquare className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-base font-semibold">My Follow-up Tasks</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            style={{ color: "#145F33" }}
            onClick={() => navigate("/my-tasks")}
          >
            View All
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="text-center py-2 rounded" style={{ backgroundColor: "var(--slds-g-color-background-alt)" }}>
            <div className="text-lg font-bold" style={{ color: "var(--slds-g-color-text-default)" }}>
              {openTasks.length}
            </div>
            <div className="text-[10px] font-medium" style={{ color: "var(--slds-g-color-text-weak)" }}>
              OPEN
            </div>
          </div>
          <div className="text-center py-2 rounded" style={{ backgroundColor: "#FEF2F2" }}>
            <div className="text-lg font-bold text-red-900">{overdueTasks.length}</div>
            <div className="text-[10px] font-medium text-red-700">OVERDUE</div>
          </div>
          <div className="text-center py-2 rounded" style={{ backgroundColor: "#FFFBEB" }}>
            <div className="text-lg font-bold text-amber-900">{todayTasks.length}</div>
            <div className="text-[10px] font-medium text-amber-700">TODAY</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8" style={{ color: "var(--slds-g-color-text-weak)" }}>
            <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No pending follow-up tasks</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--slds-g-color-border-base-1)" }}>
            {sortedTasks.map((task) => {
              const youthName = extractYouthName(task.title);
              const categoryColor = CATEGORY_COLORS[task.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.other;

              return (
                <div
                  key={task.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate("/my-tasks")}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: categoryColor }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-xs font-semibold truncate" style={{ color: "var(--slds-g-color-text-default)" }}>
                          {youthName}
                        </h4>
                        {getPriorityBadge(task)}
                      </div>
                      <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                        <Calendar className="h-3 w-3" />
                        <span>{formatDueDate(task.timestamp)}</span>
                      </div>
                      <p className="text-[10px] mt-1 line-clamp-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
                        {task.description.split("\n\n")[1]?.split("\n")[0] || task.title}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 mt-1" style={{ color: "var(--slds-g-color-text-weak)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {sortedTasks.length > 0 && (
          <div className="p-3 border-t" style={{ borderColor: "var(--slds-g-color-border-base-1)" }}>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs"
              style={{
                borderColor: "#145F33",
                color: "#145F33",
              }}
              onClick={() => navigate("/my-tasks")}
            >
              View All {openTasks.length} Tasks
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
