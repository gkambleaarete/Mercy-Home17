import { PhoneCall, Mail, MessageSquare, CheckSquare, AlertCircle, Calendar, FileText, X, Search, Flag, SlidersHorizontal, Check } from "@/app/lib/lucide-icons";
import { Button } from "./ui/button";
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogClose, DialogDescription, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner@2.0.3";
import { DateInput } from "./ui/date-input";
import { isoToMdy, mdyToIso, formatMdy, localTodayIso, toLocalIso } from "../lib/dateFormat";
import { getDemoUserName } from "../lib/demoIdentity";

export interface TimelineActivity {
  id: string;
  type: "call" | "email" | "note" | "task" | "status_change" | "meeting";
  title: string;
  description: string;
  user: string;
  timestamp: string;
  status?: "completed" | "pending" | "cancelled";
  isFlagged?: boolean;
  tags?: string[];
  category?: string;
}

interface ActivityTimelineProps {
  activities: TimelineActivity[];
  onAddActivity?: (activity: TimelineActivity) => void;
  /** When true, removes the left border and uses a transparent background (for embedding in sub-tab content). */
  embedded?: boolean;
  /** Optional callback to open a custom dialog instead of the built-in one */
  onOpenNewLogDialog?: () => void;
  /** Optional callback when a task-type activity title is clicked */
  onTaskClick?: (activity: TimelineActivity) => void;
}

// Log filter categories
const LOG_FILTER_CATEGORIES = [
  { id: "dcfs", label: "DCFS", color: "#DC2626" },
  { id: "medical", label: "Medical", color: "#0891B2" },
  { id: "legal", label: "Legal", color: "#7C3AED" },
  { id: "school", label: "School", color: "#EA580C" },
  { id: "family", label: "Family", color: "#E11D48" },
  { id: "housing", label: "Housing", color: "#0D9488" },
  { id: "mental_health", label: "Mental Health", color: "#8B5CF6" },
  { id: "internal", label: "Internal", color: "#6B7280" },
];

const getActivityIcon = (type: TimelineActivity["type"]) => {
  switch (type) {
    case "call":
      return { icon: PhoneCall, color: "#06A59A", bgColor: "#06A59A" };
    case "email":
      return { icon: Mail, color: "#E52E2A", bgColor: "#E52E2A" };
    case "note":
      return { icon: MessageSquare, color: "#FFB75D", bgColor: "#FFB75D" };
    case "task":
      return { icon: CheckSquare, color: "#34B3A0", bgColor: "#34B3A0" };
    case "meeting":
      return { icon: Calendar, color: "#CB65FF", bgColor: "#CB65FF" };
    case "status_change":
      return { icon: AlertCircle, color: "#145F33", bgColor: "#145F33" };
    default:
      return { icon: FileText, color: "#5C5C5C", bgColor: "#5C5C5C" };
  }
};

export function ActivityTimeline({ activities, onAddActivity, embedded = false, onOpenNewLogDialog, onTaskClick }: ActivityTimelineProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [flaggedActivities, setFlaggedActivities] = useState<Set<string>>(new Set());
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());

  // Tab state for Activity Timeline (only used when NOT embedded)
  const [activeTimelineTab, setActiveTimelineTab] = useState<"log" | "tasks-emails">("log");

  // Filter dropdown state
  const [logFilterOpen, setLogFilterOpen] = useState(false);
  const [selectedLogCategories, setSelectedLogCategories] = useState<Set<string>>(new Set());
  const logFilterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (logFilterRef.current && !logFilterRef.current.contains(e.target as Node)) {
        setLogFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLogCategory = (categoryId: string) => {
    setSelectedLogCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [logType, setLogType] = useState<string>("note");
  const [logTopic, setLogTopic] = useState("");
  const [logContact, setLogContact] = useState("");
  const [logDate, setLogDate] = useState(() => {
    const today = new Date();
    return toLocalIso(today);
  });
  const [logTime, setLogTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });
  const [logSubject, setLogSubject] = useState("");
  const [logDescription, setLogDescription] = useState("");
  const [logTags, setLogTags] = useState("");
  const [logCategory, setLogCategory] = useState<string>("");

  const handleNewLog = () => {
    if (onOpenNewLogDialog) {
      onOpenNewLogDialog();
    } else {
      setIsLogDialogOpen(true);
    }
  };

  const handleSaveLog = () => {
    if (!logContact.trim()) {
      toast.error("Please enter a contact name");
      return;
    }
    if (!logSubject.trim()) {
      toast.error("Please enter a log subject");
      return;
    }
    if (!logDescription.trim()) {
      toast.error("Please enter a description");
      return;
    }

    const timestamp = new Date(`${logDate}T${logTime}`).toISOString();
    const tagArray = logTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    const newActivity: TimelineActivity = {
      id: `log-${Date.now()}`,
      type: logType as TimelineActivity["type"],
      title: logSubject,
      description: `logged: "${logDescription}"`,
      user: getDemoUserName(),
      timestamp: timestamp,
      status: "completed",
      tags: tagArray.length > 0 ? tagArray : undefined,
      category: logCategory || undefined
    };

    if (onAddActivity) {
      onAddActivity(newActivity);
    }

    toast.success("Log added successfully!");
    resetLogForm();
  };

  const handleCancelLog = () => {
    resetLogForm();
  };

  const resetLogForm = () => {
    setIsLogDialogOpen(false);
    setLogType("note");
    setLogTopic("");
    setLogContact("");
    setLogDate(localTodayIso());
    setLogTime(new Date().toTimeString().slice(0, 5));
    setLogSubject("");
    setLogDescription("");
    setLogTags("");
    setLogCategory("");
  };

  const toggleFlag = (activityId: string) => {
    setFlaggedActivities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) newSet.delete(activityId);
      else newSet.add(activityId);
      return newSet;
    });
  };

  const toggleExpand = (activityId: string) => {
    setExpandedActivities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) newSet.delete(activityId);
      else newSet.add(activityId);
      return newSet;
    });
  };

  // Filter log activities (calls, notes, meetings, status changes)
  const logTypeActivities = activities.filter((a) => ["call", "note", "meeting", "status_change"].includes(a.type));

  // Filter tasks and emails
  const tasksEmailsActivities = activities.filter((a) => ["task", "email"].includes(a.type));

  const filteredLogActivities = logTypeActivities.filter((activity) => {
    const matchesSearch =
      searchQuery === "" ||
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.tags && activity.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesFlag = !showFlaggedOnly || flaggedActivities.has(activity.id) || activity.isFlagged;
    const matchesCategory = selectedLogCategories.size === 0 || (activity.category && selectedLogCategories.has(activity.category));
    return matchesSearch && matchesFlag && matchesCategory;
  });

  // Helper to render timeline items
  const renderTimelineItems = (items: TimelineActivity[]) => (
    <div className="relative space-y-4">
      {items.map((activity, index) => {
        const { icon: Icon, color, bgColor } = getActivityIcon(activity.type);
        const isLast = index === items.length - 1;
        return (
          <div key={activity.id} className="relative flex gap-3">
            <div className="flex flex-col items-center" style={{ width: '28px' }}>
              <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: '28px', height: '28px', backgroundColor: bgColor }}>
                <Icon className="h-4 w-4" style={{ color: 'white' }} />
              </div>
              {!isLast && (<div className="flex-1 mt-1" style={{ width: '2px', backgroundColor: color, minHeight: '40px' }} />)}
            </div>
            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-start gap-2 flex-1">
                  {activity.type === "task" && onTaskClick ? (
                    <button
                      onClick={() => onTaskClick(activity)}
                      className="text-sm font-semibold text-left hover:underline cursor-pointer"
                      style={{ color: '#145F33' }}
                    >
                      {activity.title}
                    </button>
                  ) : (
                    <h4 className="text-sm font-semibold" style={{ color: '#145F33' }}>{activity.title}</h4>
                  )}
                  <button onClick={() => toggleFlag(activity.id)} className="flex-shrink-0 transition-all hover:scale-110" style={{ marginTop: '2px' }} title={flaggedActivities.has(activity.id) || activity.isFlagged ? "Unflag" : "Flag"}>
                    <Flag className="h-3.5 w-3.5" style={{ fill: flaggedActivities.has(activity.id) || activity.isFlagged ? '#F59E0B' : 'none', stroke: flaggedActivities.has(activity.id) || activity.isFlagged ? '#F59E0B' : 'var(--slds-g-color-text-weak)', transition: 'all 0.2s' }} />
                  </button>
                </div>
                <span className="text-xs whitespace-nowrap flex-shrink-0" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  {new Date(activity.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  {' | '}
                  {formatMdy(new Date(activity.timestamp))}
                </span>
              </div>
              <div className="mb-1">
                <p className="text-xs" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  <span style={{ color: '#145F33' }}>{activity.user}</span>{' '}
                  {(() => {
                    const isExpanded = expandedActivities.has(activity.id);
                    const MAX_LENGTH = 150;
                    if (activity.description.length <= MAX_LENGTH) return activity.description;
                    if (isExpanded) return activity.description;
                    return activity.description.substring(0, MAX_LENGTH) + '...';
                  })()}
                </p>
                {activity.description.length > 150 && (
                  <button onClick={() => toggleExpand(activity.id)} className="text-xs mt-1 font-medium transition-colors hover:underline" style={{ color: '#145F33' }}>
                    {expandedActivities.has(activity.id) ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
              {expandedActivities.has(activity.id) && (
                <div className="mt-3 rounded" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                  <div className="p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div><span style={{ color: 'var(--slds-g-color-text-weak)' }}>Type:</span><span className="ml-1 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{activity.type.charAt(0).toUpperCase() + activity.type.slice(1).replace('_', ' ')}</span></div>
                      <div><span style={{ color: 'var(--slds-g-color-text-weak)' }}>Created by:</span><span className="ml-1 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{activity.user}</span></div>
                      <div><span style={{ color: 'var(--slds-g-color-text-weak)' }}>Date:</span><span className="ml-1 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{formatMdy(new Date(activity.timestamp))}</span></div>
                      <div><span style={{ color: 'var(--slds-g-color-text-weak)' }}>Time:</span><span className="ml-1 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{new Date(activity.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span></div>
                    </div>
                    {activity.description.length > 150 && (
                      <div className="pt-2" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Full Details:</p>
                        <p className="text-xs mt-1 whitespace-pre-wrap" style={{ color: 'var(--slds-g-color-text-default)', lineHeight: '1.5' }}>{activity.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {(activity.status || activity.category) && (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  {activity.status && (
                    <span className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-medium uppercase tracking-wide ${activity.status === 'completed' ? 'bg-green-100 text-green-800' : activity.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>{activity.status}</span>
                  )}
                  {activity.category && (() => {
                    const cat = LOG_FILTER_CATEGORIES.find(c => c.id === activity.category);
                    if (!cat) return null;
                    return (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: cat.color + '18', color: cat.color, border: `1px solid ${cat.color}40` }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.label}
                      </span>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      className={`h-full overflow-y-auto ${embedded ? 'p-5' : 'p-4'}`}
      style={{
        backgroundColor: 'var(--slds-g-color-background-alt)',
        ...(!embedded ? { borderLeft: '1px solid var(--slds-g-color-border-base-1)' } : {})
      }}
    >
      {/* Timeline Header */}
      <div className="mb-4">
        <h3
          className="text-sm font-semibold uppercase tracking-wide"
          style={{ color: 'var(--slds-g-color-text-default)' }}
        >
          Activity Timeline
        </h3>
      </div>

      {/* Tab Navigation - Only show when NOT embedded */}
      {!embedded && (
        <div className="mb-4">
          <div className="flex items-center gap-6" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
            <button
              onClick={() => setActiveTimelineTab("log")}
              className="relative pb-3 text-xs font-medium transition-colors"
              style={{
                color: activeTimelineTab === "log" ? '#145F33' : 'var(--slds-g-color-text-weak)',
              }}
            >
              Log
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: activeTimelineTab === "log" ? '#e6f2eb' : 'var(--slds-g-color-background-alt)', color: activeTimelineTab === "log" ? '#145F33' : 'var(--slds-g-color-text-weak)', border: `1px solid ${activeTimelineTab === "log" ? '#145F33' : 'var(--slds-g-color-border-base-4)'}`, minWidth: '20px' }}>
                {logTypeActivities.length}
              </span>
              {activeTimelineTab === "log" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: '#145F33' }} />
              )}
            </button>
            <button
              onClick={() => setActiveTimelineTab("tasks-emails")}
              className="relative pb-3 text-xs font-medium transition-colors"
              style={{
                color: activeTimelineTab === "tasks-emails" ? '#145F33' : 'var(--slds-g-color-text-weak)',
              }}
            >
              Tasks & Emails
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: activeTimelineTab === "tasks-emails" ? '#e6f2eb' : 'var(--slds-g-color-background-alt)', color: activeTimelineTab === "tasks-emails" ? '#145F33' : 'var(--slds-g-color-text-weak)', border: `1px solid ${activeTimelineTab === "tasks-emails" ? '#145F33' : 'var(--slds-g-color-border-base-4)'}`, minWidth: '20px' }}>
                {tasksEmailsActivities.length}
              </span>
              {activeTimelineTab === "tasks-emails" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: '#145F33' }} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Conditionally render based on active tab or embedded mode */}
      {(embedded || activeTimelineTab === "log") && (
        <>
          {/* Log Header Bar - Only show when embedded */}
          {embedded && (
            <div className="flex items-center mb-4 pb-3" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
              <span className="text-xs font-medium" style={{ color: '#145F33' }}>
                Log
                <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: '#e6f2eb', color: '#145F33', border: '1px solid #145F33', minWidth: '20px' }}>
                  {logTypeActivities.length}
                </span>
              </span>
              <div className="ml-auto flex-shrink-0">
                <Button
                  onClick={handleNewLog}
                  className="justify-center gap-1 rounded-full text-xs font-medium transition-all hover:shadow-md"
                  style={{
                    backgroundColor: '#145F33',
                    color: 'white',
                    border: '1px solid #145F33',
                    height: '28px',
                    padding: '0 12px',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.backgroundColor = '#0f4526';
                    e.currentTarget.style.borderColor = '#0f4526';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.backgroundColor = '#145F33';
                    e.currentTarget.style.borderColor = '#145F33';
                  }}
                >
                  + New Log
                </Button>
              </div>
            </div>
          )}

          {/* Log Header Bar - Only show when NOT embedded */}
          {!embedded && (
            <div className="flex items-center mb-4">
              <div className="ml-auto flex-shrink-0">
                <Button
                  onClick={handleNewLog}
                  className="justify-center gap-1 rounded-full text-xs font-medium transition-all hover:shadow-md"
                  style={{
                    backgroundColor: '#145F33',
                    color: 'white',
                    border: '1px solid #145F33',
                    height: '28px',
                    padding: '0 12px',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.backgroundColor = '#0f4526';
                    e.currentTarget.style.borderColor = '#0f4526';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.backgroundColor = '#145F33';
                    e.currentTarget.style.borderColor = '#145F33';
                  }}
                >
                  + New Log
                </Button>
              </div>
            </div>
          )}

          {/* Log Content */}
          <div className="mb-4 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                <Input type="text" placeholder="Search logs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-9 text-xs" style={{ border: '1px solid var(--slds-g-color-border-base-4)', borderRadius: '0.25rem', backgroundColor: 'var(--slds-g-color-neutral-base-100)', color: 'var(--slds-g-color-text-default)' }} />
              </div>
              <div className="relative" ref={logFilterRef}>
                <button
                  onClick={() => setLogFilterOpen(!logFilterOpen)}
                  className="flex items-center justify-center h-9 w-9 rounded transition-colors"
                  style={{
                    border: `1px solid ${selectedLogCategories.size > 0 ? '#145F33' : 'var(--slds-g-color-border-base-4)'}`,
                    backgroundColor: selectedLogCategories.size > 0 ? '#e6f2eb' : 'var(--slds-g-color-neutral-base-100)',
                    color: selectedLogCategories.size > 0 ? '#145F33' : 'var(--slds-g-color-text-weak)',
                  }}
                  title="Filter by category"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {selectedLogCategories.size > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-medium" style={{ backgroundColor: '#145F33', color: 'white' }}>
                      {selectedLogCategories.size}
                    </span>
                  )}
                </button>
                {logFilterOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-md shadow-lg py-1" style={{ backgroundColor: 'var(--slds-g-color-neutral-base-100)', border: '1px solid var(--slds-g-color-border-base-4)' }}>
                    <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                      <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>Filter by Category</span>
                      {selectedLogCategories.size > 0 && (
                        <button onClick={() => setSelectedLogCategories(new Set())} className="text-[10px] font-medium" style={{ color: '#145F33' }}>Clear</button>
                      )}
                    </div>
                    {LOG_FILTER_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => toggleLogCategory(cat.id)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-gray-50"
                        style={{ color: 'var(--slds-g-color-text-default)' }}
                      >
                        <div
                          className="flex items-center justify-center w-4 h-4 rounded-sm flex-shrink-0"
                          style={{
                            border: `1.5px solid ${selectedLogCategories.has(cat.id) ? '#145F33' : 'var(--slds-g-color-border-base-4)'}`,
                            backgroundColor: selectedLogCategories.has(cat.id) ? '#145F33' : 'transparent',
                          }}
                        >
                          {selectedLogCategories.has(cat.id) && <Check className="h-2.5 w-2.5" style={{ color: 'white' }} />}
                        </div>
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Active category filter pills */}
            {selectedLogCategories.size > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {LOG_FILTER_CATEGORIES.filter(c => selectedLogCategories.has(c.id)).map(cat => (
                  <span key={cat.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: cat.color + '18', color: cat.color, border: `1px solid ${cat.color}40` }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.label}
                    <button onClick={() => toggleLogCategory(cat.id)} className="ml-0.5 hover:opacity-70">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between">
              <button onClick={() => setShowFlaggedOnly(!showFlaggedOnly)} className="flex items-center gap-2 text-xs transition-colors" style={{ color: showFlaggedOnly ? '#145F33' : 'var(--slds-g-color-text-weak)' }}>
                <Flag className="h-3.5 w-3.5" style={{ fill: showFlaggedOnly ? '#145F33' : 'none', stroke: showFlaggedOnly ? '#145F33' : 'currentColor' }} />
                <span>Show Flagged Only</span>
              </button>
              <span className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                {filteredLogActivities.length} {filteredLogActivities.length === 1 ? 'record' : 'records'}
              </span>
            </div>
          </div>
          {renderTimelineItems(filteredLogActivities)}
          {filteredLogActivities.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--slds-g-color-text-weak)' }} />
              <p className="text-sm" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                {searchQuery || showFlaggedOnly || selectedLogCategories.size > 0 ? 'No matching log records found' : 'No log entries recorded yet'}
              </p>
              {(searchQuery || showFlaggedOnly || selectedLogCategories.size > 0) && (
                <button onClick={() => { setSearchQuery(''); setShowFlaggedOnly(false); setSelectedLogCategories(new Set()); }} className="text-xs mt-2 transition-colors" style={{ color: '#145F33' }}>Clear filters</button>
              )}
            </div>
          )}
        </>
      )}

      {/* Tasks & Emails Tab - Only show when NOT embedded and active */}
      {!embedded && activeTimelineTab === "tasks-emails" && (
        <>
          <div className="mb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--slds-g-color-text-weak)' }} />
              <Input type="text" placeholder="Search tasks and emails..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-9 text-xs" style={{ border: '1px solid var(--slds-g-color-border-base-4)', borderRadius: '0.25rem', backgroundColor: 'var(--slds-g-color-neutral-base-100)', color: 'var(--slds-g-color-text-default)' }} />
            </div>
            <div className="flex items-center justify-between">
              <button onClick={() => setShowFlaggedOnly(!showFlaggedOnly)} className="flex items-center gap-2 text-xs transition-colors" style={{ color: showFlaggedOnly ? '#145F33' : 'var(--slds-g-color-text-weak)' }}>
                <Flag className="h-3.5 w-3.5" style={{ fill: showFlaggedOnly ? '#145F33' : 'none', stroke: showFlaggedOnly ? '#145F33' : 'currentColor' }} />
                <span>Show Flagged Only</span>
              </button>
              <span className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                {tasksEmailsActivities.filter((activity) => {
                  const matchesSearch = searchQuery === "" || activity.title.toLowerCase().includes(searchQuery.toLowerCase()) || activity.description.toLowerCase().includes(searchQuery.toLowerCase()) || activity.user.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesFlag = !showFlaggedOnly || flaggedActivities.has(activity.id) || activity.isFlagged;
                  return matchesSearch && matchesFlag;
                }).length} {tasksEmailsActivities.filter((activity) => {
                  const matchesSearch = searchQuery === "" || activity.title.toLowerCase().includes(searchQuery.toLowerCase()) || activity.description.toLowerCase().includes(searchQuery.toLowerCase()) || activity.user.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesFlag = !showFlaggedOnly || flaggedActivities.has(activity.id) || activity.isFlagged;
                  return matchesSearch && matchesFlag;
                }).length === 1 ? 'record' : 'records'}
              </span>
            </div>
          </div>
          {renderTimelineItems(tasksEmailsActivities.filter((activity) => {
            const matchesSearch = searchQuery === "" || activity.title.toLowerCase().includes(searchQuery.toLowerCase()) || activity.description.toLowerCase().includes(searchQuery.toLowerCase()) || activity.user.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFlag = !showFlaggedOnly || flaggedActivities.has(activity.id) || activity.isFlagged;
            return matchesSearch && matchesFlag;
          }))}
          {tasksEmailsActivities.filter((activity) => {
            const matchesSearch = searchQuery === "" || activity.title.toLowerCase().includes(searchQuery.toLowerCase()) || activity.description.toLowerCase().includes(searchQuery.toLowerCase()) || activity.user.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFlag = !showFlaggedOnly || flaggedActivities.has(activity.id) || activity.isFlagged;
            return matchesSearch && matchesFlag;
          }).length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--slds-g-color-text-weak)' }} />
              <p className="text-sm" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                {searchQuery || showFlaggedOnly ? 'No matching tasks or emails found' : 'No tasks or emails recorded yet'}
              </p>
              {(searchQuery || showFlaggedOnly) && (
                <button onClick={() => { setSearchQuery(''); setShowFlaggedOnly(false); }} className="text-xs mt-2 transition-colors" style={{ color: '#145F33' }}>Clear filters</button>
              )}
            </div>
          )}
        </>
      )}

      {/* Log Dialog */}
      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent
          className="sm:max-w-3xl p-0 gap-0"
          style={{
            backgroundColor: 'var(--slds-g-color-neutral-base-100, #ffffff)',
            borderRadius: '0.25rem',
            boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1), 0 2px 4px 0 rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* SLDS Modal Header */}
          <div
            className="relative px-6 py-3 border-b"
            style={{
              borderColor: 'var(--slds-g-color-border-base-1, #e5e5e5)'
            }}
          >
            <DialogTitle asChild>
              <h2
                className="text-lg pr-8"
                style={{
                  color: 'var(--slds-g-color-neutral-base-10, #181818)',
                  lineHeight: '1.25'
                }}
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" style={{ color: '#145F33' }} />
                  Add Log
                </span>
              </h2>
            </DialogTitle>

            <DialogDescription asChild>
              <p
                className="text-xs mt-1"
                style={{ color: 'var(--slds-g-color-neutral-base-50, #706e6b)' }}
              >
                Record a new log entry for the family
              </p>
            </DialogDescription>
          </div>

          {/* SLDS Modal Body - Scrollable */}
          <div
            className="px-6 py-4 overflow-y-auto"
            style={{
              maxHeight: 'calc(85vh - 160px)',
              backgroundColor: 'var(--slds-g-color-neutral-base-100, #ffffff)'
            }}
          >
            {/* SLDS Form */}
            <form className="space-y-4">
              {/* Type Selection */}
              <div className="slds-form-element">
                <Label
                  htmlFor="log-type"
                  className="block text-xs mb-1.5"
                  style={{
                    color: 'var(--slds-g-color-neutral-base-10, #181818)',
                    fontWeight: '400'
                  }}
                >
                  Log Type
                </Label>
                <div className="slds-form-element__control">
                  <Select value={logType} onValueChange={setLogType}>
                    <SelectTrigger
                      id="log-type"
                      className="h-[32px] text-[13px]"
                      style={{
                        border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                        borderRadius: '0.25rem',
                        backgroundColor: 'var(--slds-g-color-neutral-base-100, #ffffff)',
                        color: 'var(--slds-g-color-neutral-base-10, #181818)'
                      }}
                    >
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="slds-form-element__help text-[11px] mt-1" style={{ color: 'var(--slds-g-color-neutral-base-50, #706e6b)' }}>
                  Choose the type of log entry
                </div>
              </div>

              {/* Topic Selection */}
              <div className="slds-form-element">
                <Label
                  htmlFor="log-topic"
                  className="block text-xs mb-1.5"
                  style={{
                    color: 'var(--slds-g-color-neutral-base-10, #181818)',
                    fontWeight: '400'
                  }}
                >
                  Topic
                </Label>
                <div className="slds-form-element__control">
                  <Select value={logTopic} onValueChange={setLogTopic}>
                    <SelectTrigger
                      id="log-topic"
                      className="h-[32px] text-[13px]"
                      style={{
                        border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                        borderRadius: '0.25rem',
                        backgroundColor: 'var(--slds-g-color-neutral-base-100, #ffffff)',
                        color: 'var(--slds-g-color-neutral-base-10, #181818)'
                      }}
                    >
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dcfs">DCFS Follow-Ups</SelectItem>
                      <SelectItem value="medical">Medical Considerations</SelectItem>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="guardianship">Guardianship</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="slds-form-element__help text-[11px] mt-1" style={{ color: 'var(--slds-g-color-neutral-base-50, #706e6b)' }}>
                  Choose the topic associated with this log
                </div>
              </div>

              {/* Category Selection */}
              <div className="slds-form-element">
                <Label
                  htmlFor="log-category"
                  className="block text-xs mb-1.5"
                  style={{
                    color: 'var(--slds-g-color-neutral-base-10, #181818)',
                    fontWeight: '400'
                  }}
                >
                  Category
                </Label>
                <div className="slds-form-element__control">
                  <Select value={logCategory} onValueChange={setLogCategory}>
                    <SelectTrigger
                      id="log-category"
                      className="h-[32px] text-[13px]"
                      style={{
                        border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                        borderRadius: '0.25rem',
                        backgroundColor: 'var(--slds-g-color-neutral-base-100, #ffffff)',
                        color: 'var(--slds-g-color-neutral-base-10, #181818)'
                      }}
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOG_FILTER_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: cat.color }} />
                            {cat.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="slds-form-element__help text-[11px] mt-1" style={{ color: 'var(--slds-g-color-neutral-base-50, #706e6b)' }}>
                  Assign a category flag to this log entry
                </div>
              </div>

              {/* Contact Field */}
              <div className="slds-form-element slds-is-required">
                <Label
                  htmlFor="log-contact"
                  className="block text-xs mb-1.5"
                  style={{
                    color: 'var(--slds-g-color-neutral-base-10, #181818)',
                    fontWeight: '400'
                  }}
                >
                  Contact <span className="text-red-600">*</span>
                </Label>
                <div className="slds-form-element__control">
                  <Input
                    id="log-contact"
                    type="text"
                    placeholder="Contact name"
                    className="h-[32px] text-[13px]"
                    value={logContact}
                    onChange={(e) => setLogContact(e.target.value)}
                    style={{
                      border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                      borderRadius: '0.25rem',
                      backgroundColor: 'var(--slds-g-color-neutral-base-100, #ffffff)',
                      color: 'var(--slds-g-color-neutral-base-10, #181818)',
                      padding: '0 0.75rem',
                      transition: 'border-color 0.1s linear, background-color 0.1s linear'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = 'none';
                      e.currentTarget.style.borderColor = '#145F33';
                      e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Date Field */}
              <div className="slds-form-element slds-is-required">
                <Label
                  htmlFor="log-date"
                  className="block text-xs mb-1.5"
                  style={{
                    color: 'var(--slds-g-color-neutral-base-10, #181818)',
                    fontWeight: '400'
                  }}
                >
                  Date <span className="text-red-600">*</span>
                </Label>
                <div className="slds-form-element__control">
                  <DateInput
                    id="log-date"
className="h-[32px] text-[13px]"
                    value={isoToMdy(logDate)}
                    onChange={(v) => ((e) => setLogDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                    style={{
                      border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                      borderRadius: '0.25rem',
                      backgroundColor: 'var(--slds-g-color-neutral-base-100, #ffffff)',
                      color: 'var(--slds-g-color-neutral-base-10, #181818)',
                      padding: '0 0.75rem',
                      transition: 'border-color 0.1s linear, background-color 0.1s linear'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = 'none';
                      e.currentTarget.style.borderColor = '#145F33';
                      e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Time Field */}
              <div className="slds-form-element slds-is-required">
                <Label
                  htmlFor="log-time"
                  className="block text-xs mb-1.5"
                  style={{
                    color: 'var(--slds-g-color-neutral-base-10, #181818)',
                    fontWeight: '400'
                  }}
                >
                  Time <span className="text-red-600">*</span>
                </Label>
                <div className="slds-form-element__control">
                  <Input
                    id="log-time"
                    type="time"
                    className="h-[32px] text-[13px]"
                    value={logTime}
                    onChange={(e) => setLogTime(e.target.value)}
                    style={{
                      border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                      borderRadius: '0.25rem',
                      backgroundColor: 'var(--slds-g-color-neutral-base-100, #ffffff)',
                      color: 'var(--slds-g-color-neutral-base-10, #181818)',
                      padding: '0 0.75rem',
                      transition: 'border-color 0.1s linear, background-color 0.1s linear'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = 'none';
                      e.currentTarget.style.borderColor = '#145F33';
                      e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Notes Field */}
              <div className="slds-form-element slds-is-required">
                <Label
                  htmlFor="log-description"
                  className="block text-xs mb-1.5"
                  style={{
                    color: 'var(--slds-g-color-neutral-base-10, #181818)',
                    fontWeight: '400'
                  }}
                >
                  Notes <span className="text-red-600">*</span>
                </Label>
                <div className="slds-form-element__control">
                  <Textarea
                    id="log-description"
                    placeholder="Type your notes here..."
                    className="text-[13px] min-h-[200px] resize-y"
                    value={logDescription}
                    onChange={(e) => setLogDescription(e.target.value)}
                    style={{
                      border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                      borderRadius: '0.25rem',
                      backgroundColor: 'var(--slds-g-color-neutral-base-100, #ffffff)',
                      color: 'var(--slds-g-color-neutral-base-10, #181818)',
                      padding: '0.75rem',
                      transition: 'border-color 0.1s linear, background-color 0.1s linear',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = 'none';
                      e.currentTarget.style.borderColor = '#145F33';
                      e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* SLDS Modal Footer */}
          <div
            className="px-6 py-3 border-t flex justify-end gap-2"
            style={{
              borderColor: 'var(--slds-g-color-border-base-1, #e5e5e5)',
              backgroundColor: 'var(--slds-g-color-neutral-base-100, #ffffff)'
            }}
          >
            <Button
              type="button"
              onClick={handleCancelLog}
              className="h-[32px] rounded-full text-[13px] transition-all"
              style={{
                backgroundColor: 'var(--slds-g-color-neutral-base-100, #ffffff)',
                color: '#145F33',
                border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                padding: '0 1rem',
                boxShadow: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-neutral-base-95, #f3f3f3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-neutral-base-100, #ffffff)';
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveLog}
              className="h-[32px] rounded-full text-[13px] text-white transition-all"
              style={{
                backgroundColor: '#145F33',
                border: '1px solid #145F33',
                padding: '0 1rem',
                boxShadow: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0f4526';
                e.currentTarget.style.borderColor = '#0f4526';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#145F33';
                e.currentTarget.style.borderColor = '#145F33';
              }}
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Add Log
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}