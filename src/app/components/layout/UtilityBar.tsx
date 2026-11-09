import { useState, useMemo, useEffect } from "react";
import { onGlobalAction } from "../../lib/globalActions";
import { useLocation } from "react-router";
import {
  CheckSquare,
  History,
  StickyNote,
  X,
  Search,
  MessageSquare,
  Pencil,
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Tag,
  Send,
  EyeOff,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

// ── Types ───────────────────────────────────────────────────────────────
type TaskStatus =
  | "Open"
  | "In Progress"
  | "Completed"
  | "On Hold"
  | "Cancelled";

interface HistoryEntry {
  id: number;
  type: "log" | "comment";
  timestamp: string;
  author: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  comment?: string;
}

interface Task {
  id: number;
  subject: string;
  dueDate: string;
  assignedTo: string;
  relatedTo: string;
  createDate: string;
  modifiedDate: string;
  status: TaskStatus;
  createdBy: string;
  previousOwners: string[];
  isSystem?: boolean;
  history: HistoryEntry[];
}

// ── Constants ────────────────────────────────────────────────────────────
const CURRENT_USER = "Sohan Jadhavrao";
const TODAY = "06/29/2026";
const TOMORROW = "06/30/2026";

const STAFF_OPTIONS = [
  "Sohan Jadhavrao",
  "Maria Santos",
  "James Carter",
  "Linda Okafor",
  "David Reyes",
  "Priya Nair",
];

const CONSTITUENT_OPTIONS = [
  "Aarete Test",
  "Marcus Williams",
  "Jordan Lee",
  "Elena Vasquez",
  "Sofia Morales",
  "Tyler Brooks",
];

// Future connections that can be added to My Tasks view (AC11)
interface AvailableConnection {
  id: string;
  subject: string;
  dueDate: string;
  relatedTo: string;
}
const AVAILABLE_CONNECTIONS: AvailableConnection[] = [
  {
    id: "ac-1",
    subject: "Therapy Session — Aarete Test (07/03/2026)",
    dueDate: "07/03/2026",
    relatedTo: "Aarete Test",
  },
  {
    id: "ac-2",
    subject: "Doctor Visit — Jordan Lee (07/05/2026)",
    dueDate: "07/05/2026",
    relatedTo: "Jordan Lee",
  },
  {
    id: "ac-3",
    subject: "School Meeting — Marcus Williams (07/08/2026)",
    dueDate: "07/08/2026",
    relatedTo: "Marcus Williams",
  },
  {
    id: "ac-4",
    subject: "Advocate Meeting — Elena Vasquez (07/10/2026)",
    dueDate: "07/10/2026",
    relatedTo: "Elena Vasquez",
  },
  {
    id: "ac-5",
    subject:
      "Psychiatric Eval Follow-Up — Sofia Morales (07/12/2026)",
    dueDate: "07/12/2026",
    relatedTo: "Sofia Morales",
  },
];

function now(): string {
  return "06/29/2026 10:30 AM";
}

function makeLog(
  id: number,
  field: string,
  oldValue: string,
  newValue: string,
  author = CURRENT_USER,
): HistoryEntry {
  return {
    id,
    type: "log",
    timestamp: now(),
    author,
    field,
    oldValue,
    newValue,
  };
}

function makeComment(
  id: number,
  comment: string,
  author = CURRENT_USER,
): HistoryEntry {
  return {
    id,
    type: "comment",
    timestamp: now(),
    author,
    comment,
  };
}

const INITIAL_TASKS: Task[] = [
  {
    id: 1,
    subject: "Complete ITP documentation for Aarete Test",
    dueDate: TODAY,
    assignedTo: CURRENT_USER,
    relatedTo: "Aarete Test",
    createDate: "06/20/2026",
    modifiedDate: "06/28/2026",
    status: "Open",
    createdBy: CURRENT_USER,
    previousOwners: [],
    history: [
      makeLog(1, "Status", "", "Open"),
      makeComment(
        2,
        "Started drafting the ITP sections. Need supervisor review before finalizing.",
      ),
    ],
  },
  {
    id: 2,
    subject: "Schedule psychiatric evaluation follow-up",
    dueDate: TOMORROW,
    assignedTo: CURRENT_USER,
    relatedTo: "Marcus Williams",
    createDate: "06/22/2026",
    modifiedDate: "06/27/2026",
    status: "Open",
    createdBy: CURRENT_USER,
    previousOwners: [],
    history: [makeLog(1, "Status", "", "Open")],
  },
  {
    id: 3,
    subject: "Review advocate meeting notes",
    dueDate: "07/02/2026",
    assignedTo: CURRENT_USER,
    relatedTo: "Jordan Lee",
    createDate: "06/18/2026",
    modifiedDate: "06/25/2026",
    status: "In Progress",
    createdBy: "Maria Santos",
    previousOwners: [],
    history: [
      makeLog(1, "Status", "", "Open"),
      makeLog(2, "Status", "Open", "In Progress"),
      makeComment(
        3,
        "Meeting notes received. Cross-referencing with prior session records.",
        "Maria Santos",
      ),
    ],
  },
  {
    id: 4,
    subject: "Submit medication consent form",
    dueDate: "06/25/2026",
    assignedTo: "Maria Santos",
    relatedTo: "Aarete Test",
    createDate: "06/15/2026",
    modifiedDate: "06/25/2026",
    status: "Completed",
    createdBy: CURRENT_USER,
    previousOwners: [CURRENT_USER],
    history: [
      makeLog(1, "Status", "", "Open"),
      makeLog(2, "Assigned To", CURRENT_USER, "Maria Santos"),
      makeLog(3, "Status", "Open", "Completed", "Maria Santos"),
    ],
  },
  {
    id: 5,
    subject: "Update family contact information",
    dueDate: TOMORROW,
    assignedTo: CURRENT_USER,
    relatedTo: "Elena Vasquez",
    createDate: "06/24/2026",
    modifiedDate: "06/28/2026",
    status: "Open",
    createdBy: CURRENT_USER,
    previousOwners: [],
    history: [makeLog(1, "Status", "", "Open")],
  },
  {
    id: 6,
    subject: "Prepare transition plan documentation",
    dueDate: "07/05/2026",
    assignedTo: "James Carter",
    relatedTo: "Marcus Williams",
    createDate: "06/10/2026",
    modifiedDate: "06/20/2026",
    status: "Open",
    createdBy: CURRENT_USER,
    previousOwners: [CURRENT_USER],
    history: [
      makeLog(1, "Status", "", "Open"),
      makeLog(2, "Assigned To", CURRENT_USER, "James Carter"),
      makeComment(
        3,
        "Transition plan outline sent to James for completion.",
      ),
    ],
  },
  {
    id: 7,
    subject: "Coordinate school placement meeting",
    dueDate: TODAY,
    assignedTo: CURRENT_USER,
    relatedTo: "Jordan Lee",
    createDate: "06/26/2026",
    modifiedDate: "06/29/2026",
    status: "Open",
    createdBy: CURRENT_USER,
    previousOwners: [],
    history: [makeLog(1, "Status", "", "Open")],
  },
  {
    id: 8,
    subject: "File therapy session progress report",
    dueDate: "06/30/2026",
    assignedTo: CURRENT_USER,
    relatedTo: "Aarete Test",
    createDate: "06/23/2026",
    modifiedDate: "06/28/2026",
    status: "Open",
    createdBy: CURRENT_USER,
    previousOwners: [],
    history: [makeLog(1, "Status", "", "Open")],
  },
  // System-generated tasks
  {
    id: 9,
    subject: "ITP Review — Aarete Test (Annual)",
    dueDate: "07/10/2026",
    assignedTo: CURRENT_USER,
    relatedTo: "Aarete Test",
    createDate: "06/01/2026",
    modifiedDate: "06/01/2026",
    status: "Open",
    createdBy: "System",
    previousOwners: [],
    isSystem: true,
    history: [makeLog(1, "Status", "", "Open", "System")],
  },
  {
    id: 10,
    subject:
      "Call Back Follow-Up — Marcus Williams (Contact Log)",
    dueDate: TODAY,
    assignedTo: CURRENT_USER,
    relatedTo: "Marcus Williams",
    createDate: "06/28/2026",
    modifiedDate: "06/28/2026",
    status: "Open",
    createdBy: "System",
    previousOwners: [],
    isSystem: true,
    history: [makeLog(1, "Status", "", "Open", "System")],
  },
  {
    id: 11,
    subject: "Medication Error Review — Elena Vasquez",
    dueDate: TODAY,
    assignedTo: CURRENT_USER,
    relatedTo: "Elena Vasquez",
    createDate: "06/29/2026",
    modifiedDate: "06/29/2026",
    status: "Open",
    createdBy: "System",
    previousOwners: [],
    isSystem: true,
    history: [makeLog(1, "Status", "", "Open", "System")],
  },
  {
    id: 12,
    subject:
      "Finalize Connection — Therapy Session 06/15/2026 (Jordan Lee)",
    dueDate: "07/01/2026",
    assignedTo: CURRENT_USER,
    relatedTo: "Jordan Lee",
    createDate: "06/15/2026",
    modifiedDate: "06/15/2026",
    status: "Open",
    createdBy: "System",
    previousOwners: [],
    isSystem: true,
    history: [makeLog(1, "Status", "", "Open", "System")],
  },
  {
    id: 13,
    subject: "CPI Approval Required — Sofia Morales",
    dueDate: TOMORROW,
    assignedTo: CURRENT_USER,
    relatedTo: "Sofia Morales",
    createDate: "06/27/2026",
    modifiedDate: "06/27/2026",
    status: "Open",
    createdBy: "System",
    previousOwners: [],
    isSystem: true,
    history: [makeLog(1, "Status", "", "Open", "System")],
  },
  {
    id: 14,
    subject: "Obtain guardian signature for ITP",
    dueDate: "07/01/2026",
    assignedTo: "Maria Santos",
    relatedTo: "Jordan Lee",
    createDate: "06/12/2026",
    modifiedDate: "06/22/2026",
    status: "Cancelled",
    createdBy: CURRENT_USER,
    previousOwners: [CURRENT_USER],
    history: [
      makeLog(1, "Status", "", "Open"),
      makeLog(2, "Assigned To", CURRENT_USER, "Maria Santos"),
      makeLog(3, "Status", "Open", "Cancelled", "Maria Santos"),
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────
type QuickFilter =
  "all" | "open" | "today" | "tomorrow" | "transferred";
type SortCol =
  | "subject"
  | "dueDate"
  | "assignedTo"
  | "relatedTo"
  | "createDate"
  | "modifiedDate"
  | "status";
type SortDir = "asc" | "desc";

const STATUS_BADGE: Record<
  TaskStatus,
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

function parseDateMMDD(s: string): Date {
  const [m, d, y] = s.split("/").map(Number);
  return new Date(y, m - 1, d);
}

function commentCount(task: Task): number {
  return task.history.filter((h) => h.type === "comment")
    .length;
}

// ── Component ─────────────────────────────────────────────────────────────
// AC8: Accept optional context so Related To auto-populates when launched from a constituent record
interface UtilityBarProps {
  defaultRelatedTo?: string;
}

export function UtilityBar({
  defaultRelatedTo = "",
}: UtilityBarProps = {}) {
  const { pathname } = useLocation();
  const [taskListOpen, setTaskListOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  // AC12: track hidden task IDs so connections can be dismissed from view
  const [hiddenIds, setHiddenIds] = useState<Set<number>>(
    new Set(),
  );
  // AC11: track which available connections have been added
  const [addedConnectionIds, setAddedConnectionIds] = useState<
    Set<string>
  >(new Set());
  const [showAddConnection, setShowAddConnection] =
    useState(false);
  // Global Actions (+) → Add Connection opens this same existing modal.
  useEffect(
    () =>
      onGlobalAction("add-connection", () =>
        setShowAddConnection(true),
      ),
    [],
  );
  const [selectedConnections, setSelectedConnections] =
    useState<Set<string>>(new Set());

  // List filters
  const [quickFilter, setQuickFilter] =
    useState<QuickFilter>("all");
  const [search, setSearch] = useState("");
  const [filterCreateStart, setFilterCreateStart] =
    useState("");
  const [filterCreateEnd, setFilterCreateEnd] = useState("");
  const [filterAssignedTo, setFilterAssignedTo] = useState("");
  const [filterRelatedTo, setFilterRelatedTo] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sort
  const [sortCol, setSortCol] = useState<SortCol>("dueDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Modals
  const [detailTask, setDetailTask] = useState<Task | null>(
    null,
  );
  const [showCreate, setShowCreate] = useState(false);

  // Create form
  const [newSubject, setNewSubject] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newAssignedTo, setNewAssignedTo] =
    useState(CURRENT_USER);
  // AC8: pre-populate from constituent context when available
  const [newRelatedTo, setNewRelatedTo] =
    useState(defaultRelatedTo);
  const [newSubjectError, setNewSubjectError] = useState(false);

  // Detail form (ephemeral edits)
  const [detailSubject, setDetailSubject] = useState("");
  const [detailDueDate, setDetailDueDate] = useState("");
  const [detailAssignedTo, setDetailAssignedTo] = useState("");
  const [detailRelatedTo, setDetailRelatedTo] = useState("");
  const [detailStatus, setDetailStatus] =
    useState<TaskStatus>("Open");
  const [detailDirty, setDetailDirty] = useState<
    Record<string, string>
  >({});

  // Comment input
  const [newComment, setNewComment] = useState("");

  function openDetail(task: Task) {
    setDetailTask(task);
    setDetailSubject(task.subject);
    setDetailDueDate(task.dueDate);
    setDetailAssignedTo(task.assignedTo);
    setDetailRelatedTo(task.relatedTo);
    setDetailStatus(task.status);
    setDetailDirty({});
    setNewComment("");
  }

  function getTaskLink(
    task: Task,
  ): { url: string; label: string } | null {
    if (task.isSystem) {
      const sub = task.subject.toLowerCase();
      if (sub.includes("itp review") || sub.includes("itp"))
        return { url: "/itp-module", label: "Open ITP Module" };
      if (
        sub.includes("contact log") ||
        sub.includes("call back")
      )
        return {
          url: "/contact-log",
          label: "Open Contact Log",
        };
      if (sub.includes("medication") || sub.includes("med"))
        return {
          url: "/medications",
          label: "Open Medications",
        };
      if (
        sub.includes("connection") ||
        sub.includes("finalize")
      )
        return { url: "/", label: "Open Admissions" };
      if (sub.includes("cpi"))
        return {
          url: "/constituents",
          label: "Open Constituents",
        };
      return { url: "/", label: "Open Related Page" };
    }
    // Manual task → Youth Profile of Related To
    if (task.relatedTo)
      return {
        url: "/constituents",
        label: `View ${task.relatedTo}'s Profile`,
      };
    return null;
  }

  function closeDetail() {
    setDetailTask(null);
    setNewComment("");
  }

  function trackChange(
    field: string,
    oldValue: string,
    newValue: string,
  ) {
    if (oldValue === newValue) return;
    setDetailDirty((d) => ({ ...d, [field]: oldValue }));
    return { field, oldValue, newValue };
  }

  function saveDetail() {
    if (!detailTask) return;
    const logs: HistoryEntry[] = [];
    let nextId =
      Math.max(...detailTask.history.map((h) => h.id), 0) + 1;

    const fields: {
      field: string;
      oldVal: string;
      newVal: string;
    }[] = [
      {
        field: "Subject",
        oldVal: detailTask.subject,
        newVal: detailSubject,
      },
      {
        field: "Due Date",
        oldVal: detailTask.dueDate,
        newVal: detailDueDate,
      },
      {
        field: "Assigned To",
        oldVal: detailTask.assignedTo,
        newVal: detailAssignedTo,
      },
      {
        field: "Related To",
        oldVal: detailTask.relatedTo,
        newVal: detailRelatedTo,
      },
      {
        field: "Status",
        oldVal: detailTask.status,
        newVal: detailStatus,
      },
    ];

    for (const { field, oldVal, newVal } of fields) {
      if (oldVal !== newVal) {
        logs.push({
          id: nextId++,
          type: "log",
          timestamp: now(),
          author: CURRENT_USER,
          field,
          oldValue: oldVal,
          newValue: newVal,
        });
      }
    }

    const prevOwners =
      detailAssignedTo !== detailTask.assignedTo
        ? [
            ...new Set([
              ...detailTask.previousOwners,
              detailTask.assignedTo,
            ]),
          ]
        : detailTask.previousOwners;

    const updated: Task = {
      ...detailTask,
      subject: detailSubject,
      dueDate: detailDueDate,
      assignedTo: detailAssignedTo,
      relatedTo: detailRelatedTo,
      status: detailStatus,
      modifiedDate: TODAY,
      previousOwners: prevOwners,
      history: [...detailTask.history, ...logs],
    };

    setTasks((ts) =>
      ts.map((t) => (t.id === updated.id ? updated : t)),
    );
    setDetailTask(updated);
    setDetailDirty({});
  }

  function addComment() {
    if (!detailTask || !newComment.trim()) return;
    const entry: HistoryEntry = {
      id:
        Math.max(...detailTask.history.map((h) => h.id), 0) + 1,
      type: "comment",
      timestamp: now(),
      author: CURRENT_USER,
      comment: newComment.trim(),
    };
    const updated = {
      ...detailTask,
      modifiedDate: TODAY,
      history: [...detailTask.history, entry],
    };
    setTasks((ts) =>
      ts.map((t) => (t.id === updated.id ? updated : t)),
    );
    setDetailTask(updated);
    setNewComment("");
  }

  function completeTask() {
    if (!detailTask) return;
    const entry: HistoryEntry = {
      id:
        Math.max(...detailTask.history.map((h) => h.id), 0) + 1,
      type: "log",
      timestamp: now(),
      author: CURRENT_USER,
      field: "Status",
      oldValue: detailTask.status,
      newValue: "Completed",
    };
    const updated = {
      ...detailTask,
      status: "Completed" as TaskStatus,
      modifiedDate: TODAY,
      history: [...detailTask.history, entry],
    };
    setTasks((ts) =>
      ts.map((t) => (t.id === updated.id ? updated : t)),
    );
    setDetailTask(updated);
    setDetailStatus("Completed");
  }

  function cancelTask() {
    if (!detailTask) return;
    const entry: HistoryEntry = {
      id:
        Math.max(...detailTask.history.map((h) => h.id), 0) + 1,
      type: "log",
      timestamp: now(),
      author: CURRENT_USER,
      field: "Status",
      oldValue: detailTask.status,
      newValue: "Cancelled",
    };
    const updated = {
      ...detailTask,
      status: "Cancelled" as TaskStatus,
      modifiedDate: TODAY,
      history: [...detailTask.history, entry],
    };
    setTasks((ts) =>
      ts.map((t) => (t.id === updated.id ? updated : t)),
    );
    setDetailTask(updated);
    setDetailStatus("Cancelled");
  }

  function reopenTask() {
    if (!detailTask) return;
    const entry: HistoryEntry = {
      id:
        Math.max(...detailTask.history.map((h) => h.id), 0) + 1,
      type: "log",
      timestamp: now(),
      author: CURRENT_USER,
      field: "Status",
      oldValue: detailTask.status,
      newValue: "Open",
    };
    const updated = {
      ...detailTask,
      status: "Open" as TaskStatus,
      modifiedDate: TODAY,
      history: [...detailTask.history, entry],
    };
    setTasks((ts) =>
      ts.map((t) => (t.id === updated.id ? updated : t)),
    );
    setDetailTask(updated);
    setDetailStatus("Open");
  }

  function createTask() {
    if (!newSubject.trim()) {
      setNewSubjectError(true);
      return;
    }
    const newTask: Task = {
      id: Math.max(...tasks.map((t) => t.id)) + 1,
      subject: newSubject.trim(),
      dueDate: newDueDate,
      assignedTo: newAssignedTo,
      relatedTo: newRelatedTo,
      createDate: TODAY,
      modifiedDate: TODAY,
      status: "Open",
      createdBy: CURRENT_USER,
      previousOwners: [],
      history: [
        {
          id: 1,
          type: "log",
          timestamp: now(),
          author: CURRENT_USER,
          field: "Status",
          oldValue: "",
          newValue: "Open",
        },
      ],
    };
    setTasks((ts) => [newTask, ...ts]);
    setNewSubject("");
    setNewDueDate("");
    setNewAssignedTo(CURRENT_USER);
    setNewRelatedTo(defaultRelatedTo);
    setNewSubjectError(false);
    setShowCreate(false);
  }

  function toggleSort(col: SortCol) {
    if (sortCol === col)
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  }

  const allAssignees = [
    ...new Set(tasks.map((t) => t.assignedTo)),
  ].sort();
  const allRelated = [
    ...new Set(tasks.map((t) => t.relatedTo).filter(Boolean)),
  ].sort();

  // AC11: add a future connection as a task
  function addConnections() {
    const toAdd = AVAILABLE_CONNECTIONS.filter(
      (c) =>
        selectedConnections.has(c.id) &&
        !addedConnectionIds.has(c.id),
    );
    const newTasks: Task[] = toAdd.map((c, i) => ({
      id: Math.max(...tasks.map((t) => t.id)) + i + 1,
      subject: c.subject,
      dueDate: c.dueDate,
      assignedTo: CURRENT_USER,
      relatedTo: c.relatedTo,
      createDate: TODAY,
      modifiedDate: TODAY,
      status: "Open" as TaskStatus,
      createdBy: "System",
      previousOwners: [],
      isSystem: true,
      history: [
        {
          id: 1,
          type: "log" as const,
          timestamp: now(),
          author: "System",
          field: "Status",
          oldValue: "",
          newValue: "Open",
        },
      ],
    }));
    setTasks((ts) => [...ts, ...newTasks]);
    setAddedConnectionIds(
      (prev) => new Set([...prev, ...selectedConnections]),
    );
    setSelectedConnections(new Set());
    setShowAddConnection(false);
  }

  // AC12: hide a task from the view
  function hideTask(id: number) {
    setHiddenIds((prev) => new Set([...prev, id]));
  }

  const filtered = useMemo(() => {
    let ts = tasks
      .filter((t) => !hiddenIds.has(t.id))
      .filter(
        (t) =>
          t.assignedTo === CURRENT_USER ||
          t.previousOwners.includes(CURRENT_USER) ||
          t.createdBy === CURRENT_USER,
      );

    if (quickFilter === "open")
      ts = ts.filter(
        (t) =>
          t.status === "Open" && t.assignedTo === CURRENT_USER,
      );
    else if (quickFilter === "today")
      ts = ts.filter(
        (t) =>
          t.status === "Open" &&
          t.assignedTo === CURRENT_USER &&
          t.dueDate === TODAY,
      );
    else if (quickFilter === "tomorrow")
      ts = ts.filter(
        (t) =>
          t.status === "Open" &&
          t.assignedTo === CURRENT_USER &&
          t.dueDate === TOMORROW,
      );
    else if (quickFilter === "transferred")
      ts = ts.filter(
        (t) =>
          t.status === "Open" &&
          t.assignedTo !== CURRENT_USER &&
          (t.createdBy === CURRENT_USER ||
            t.previousOwners.includes(CURRENT_USER)),
      );

    if (search.trim()) {
      const q = search.toLowerCase();
      ts = ts.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.assignedTo.toLowerCase().includes(q) ||
          t.relatedTo.toLowerCase().includes(q) ||
          t.status.toLowerCase().includes(q),
      );
    }
    if (filterAssignedTo)
      ts = ts.filter((t) => t.assignedTo === filterAssignedTo);
    if (filterRelatedTo)
      ts = ts.filter((t) => t.relatedTo === filterRelatedTo);
    if (filterStatus)
      ts = ts.filter((t) => t.status === filterStatus);
    if (filterCreateStart) {
      const s = parseDateMMDD(filterCreateStart);
      ts = ts.filter((t) => parseDateMMDD(t.createDate) >= s);
    }
    if (filterCreateEnd) {
      const e = parseDateMMDD(filterCreateEnd);
      ts = ts.filter((t) => parseDateMMDD(t.createDate) <= e);
    }

    return [...ts].sort((a, b) => {
      const dateFields = [
        "dueDate",
        "createDate",
        "modifiedDate",
      ] as SortCol[];
      const av = dateFields.includes(sortCol)
        ? parseDateMMDD(a[sortCol]).getTime().toString()
        : (a[sortCol] as string).toLowerCase();
      const bv = dateFields.includes(sortCol)
        ? parseDateMMDD(b[sortCol]).getTime().toString()
        : (b[sortCol] as string).toLowerCase();
      return sortDir === "asc"
        ? av.localeCompare(bv)
        : bv.localeCompare(av);
    });
  }, [
    tasks,
    quickFilter,
    search,
    filterAssignedTo,
    filterRelatedTo,
    filterStatus,
    filterCreateStart,
    filterCreateEnd,
    sortCol,
    sortDir,
  ]);

  const QUICK_FILTERS: { key: QuickFilter; label: string }[] = [
    { key: "all", label: "All Tasks" },
    { key: "open", label: "Open Tasks" },
    { key: "today", label: "Today's Tasks" },
    { key: "tomorrow", label: "Tomorrow's Tasks" },
    { key: "transferred", label: "Transferred Tasks" },
  ];

  const SortIcon = ({ col }: { col: SortCol }) => (
    <span
      className="inline-flex flex-col ml-1"
      style={{ opacity: sortCol === col ? 1 : 0.35 }}
    >
      <ChevronUp
        className="h-2.5 w-2.5 -mb-0.5"
        style={{
          color:
            sortCol === col && sortDir === "asc"
              ? "#145F33"
              : "currentColor",
        }}
      />
      <ChevronDown
        className="h-2.5 w-2.5"
        style={{
          color:
            sortCol === col && sortDir === "desc"
              ? "#145F33"
              : "currentColor",
        }}
      />
    </span>
  );

  const isClosed =
    detailTask?.status === "Completed" ||
    detailTask?.status === "Cancelled";

  return (
    <>
      {/* ── Utility Bar ──────────────────────────────────────────────── */}
      {pathname !== "/design-tokens" && (
        <div
          className="h-10 flex items-center gap-2 justify-between fixed bottom-0 left-0 right-0 z-40"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
            paddingLeft: "var(--slds-c-spacing-medium)",
            paddingRight: "var(--slds-c-spacing-medium)",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
          }}
          role="complementary"
          aria-label="Utility Bar"
        >
          <div className="flex items-center gap-2 h-full">
            <Button
              variant="ghost"
              className="h-full rounded-none border-r border-transparent flex items-center gap-2 px-4"
              style={{
                fontSize: "var(--slds-g-font-size-4)",
                fontWeight: taskListOpen ? 600 : 400,
                color: taskListOpen
                  ? "#145F33"
                  : "var(--slds-g-color-text-default)",
                borderBottom: taskListOpen
                  ? "2px solid #145F33"
                  : undefined,
              }}
              aria-label="Open To Do List"
              onClick={() => setTaskListOpen((o) => !o)}
            >
              <CheckSquare className="h-4 w-4" />
              To Do List
            </Button>
            <Button
              variant="ghost"
              className="h-full rounded-none border-r border-transparent flex items-center gap-2 px-4"
              style={{
                fontSize: "var(--slds-g-font-size-4)",
                fontWeight: 400,
                color: "var(--slds-g-color-text-default)",
              }}
              aria-label="View History"
            >
              <History className="h-4 w-4" />
              History
            </Button>
            <Button
              variant="ghost"
              className="h-full rounded-none border-r border-transparent flex items-center gap-2 px-4"
              style={{
                fontSize: "var(--slds-g-font-size-4)",
                fontWeight: 400,
                color: "var(--slds-g-color-text-default)",
              }}
              aria-label="Open Notes"
            >
              <StickyNote className="h-4 w-4" />
              Notes
            </Button>
          </div>
          <div
            style={{
              fontSize: "var(--slds-g-font-size-3)",
              color: "var(--slds-g-color-text-weak)",
            }}
          >
            NPO Connect v1.0
          </div>
        </div>
      )}

      {/* ── Task List Panel ───────────────────────────────────────────── */}
      {taskListOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget)
              setTaskListOpen(false);
          }}
        >
          <div
            className="absolute bottom-10 left-0 right-0 flex flex-col overflow-hidden"
            style={{
              top: "60px",
              backgroundColor:
                "var(--slds-g-color-background-base)",
              borderTop:
                "1px solid var(--slds-g-color-border-base-1)",
              boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-3 flex-shrink-0"
              style={{
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <div className="flex items-center gap-3">
                <CheckSquare
                  className="h-5 w-5"
                  style={{ color: "#145F33" }}
                />
                <h2
                  className="slds-text-6 font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  My Tasks
                </h2>
                <span
                  className="slds-text-3 px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: "rgba(20,95,51,0.1)",
                    color: "#145F33",
                  }}
                >
                  {filtered.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedConnections(new Set());
                    setShowAddConnection(true);
                  }}
                  className="h-8 px-3 rounded-full slds-text-3 font-medium flex items-center gap-1.5"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Connection
                </button>
                <button
                  onClick={() => setShowCreate(true)}
                  className="h-8 px-3 rounded-full slds-text-3 font-medium flex items-center gap-1.5 text-white"
                  style={{ backgroundColor: "#145F33" }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Task
                </button>
                <button
                  onClick={() => setTaskListOpen(false)}
                  className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick Filters + Search */}
            <div
              className="flex items-center justify-between px-6 py-2 flex-shrink-0 gap-4"
              style={{
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <div className="flex items-center gap-1 overflow-x-auto">
                {QUICK_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setQuickFilter(f.key)}
                    className="px-3 py-1.5 rounded slds-text-3 font-medium whitespace-nowrap transition-colors"
                    style={{
                      backgroundColor:
                        quickFilter === f.key
                          ? "#145F33"
                          : "var(--slds-g-color-background-alt)",
                      color:
                        quickFilter === f.key
                          ? "white"
                          : "var(--slds-g-color-text-default)",
                      border: "1px solid",
                      borderColor:
                        quickFilter === f.key
                          ? "#145F33"
                          : "var(--slds-g-color-border-base-1)",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="relative">
                  <Search
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tasks…"
                    className="h-8 pl-8 pr-3 rounded slds-text-4 focus:outline-none w-52"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  />
                </div>
                <button
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="h-8 px-3 rounded slds-text-3 font-medium flex items-center gap-1.5 transition-colors"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor: showAdvanced
                      ? "rgba(20,95,51,0.07)"
                      : "var(--slds-g-color-background-base)",
                    color: showAdvanced
                      ? "#145F33"
                      : "var(--slds-g-color-text-default)",
                  }}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                  {(filterAssignedTo ||
                    filterRelatedTo ||
                    filterStatus ||
                    filterCreateStart ||
                    filterCreateEnd) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#145F33]" />
                  )}
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
              <div
                className="flex items-end gap-4 px-6 py-3 flex-shrink-0 flex-wrap"
                style={{
                  borderBottom:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <div className="space-y-1.5">
                  <Label
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    CREATE DATE FROM
                  </Label>
                  <DateInput
                    value={filterCreateStart}
                    onChange={setFilterCreateStart}
                    style={{
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    TO
                  </Label>
                  <DateInput
                    value={filterCreateEnd}
                    onChange={setFilterCreateEnd}
                    style={{
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                    }}
                  />
                </div>
                <div className="space-y-1.5 min-w-[160px]">
                  <Label
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    ASSIGNED TO
                  </Label>
                  <Select
                    value={filterAssignedTo || "__all__"}
                    onValueChange={(v) =>
                      setFilterAssignedTo(
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
                      {allAssignees.map((a) => (
                        <SelectItem
                          key={a}
                          value={a}
                          className="slds-text-4"
                        >
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 min-w-[160px]">
                  <Label
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    RELATED TO
                  </Label>
                  <Select
                    value={filterRelatedTo || "__all__"}
                    onValueChange={(v) =>
                      setFilterRelatedTo(
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
                      {allRelated.map((r) => (
                        <SelectItem
                          key={r}
                          value={r}
                          className="slds-text-4"
                        >
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 min-w-[140px]">
                  <Label
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    STATUS
                  </Label>
                  <Select
                    value={filterStatus || "__all__"}
                    onValueChange={(v) =>
                      setFilterStatus(v === "__all__" ? "" : v)
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
                        ] as TaskStatus[]
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
                    setFilterAssignedTo("");
                    setFilterRelatedTo("");
                    setFilterStatus("");
                    setFilterCreateStart("");
                    setFilterCreateEnd("");
                    setSearch("");
                    setQuickFilter("all");
                  }}
                  className="h-9 px-3 rounded slds-text-3 font-medium self-end transition-colors"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-weak)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table
                className="w-full"
                style={{
                  borderCollapse: "collapse",
                  minWidth: "920px",
                }}
              >
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  }}
                >
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
                        { col: "subject", label: "SUBJECT" },
                        { col: "dueDate", label: "DUE DATE" },
                        {
                          col: "assignedTo",
                          label: "ASSIGNED TO",
                        },
                        {
                          col: "relatedTo",
                          label: "RELATED TO",
                        },
                        {
                          col: "createDate",
                          label: "CREATE DATE",
                        },
                        {
                          col: "modifiedDate",
                          label: "MODIFIED DATE",
                        },
                        { col: "status", label: "STATUS" },
                      ] as { col: SortCol; label: string }[]
                    ).map(({ col, label }) => (
                      <th
                        key={col}
                        className="px-4 py-2.5 text-left slds-text-3 font-semibold cursor-pointer select-none whitespace-nowrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                        onClick={() => toggleSort(col)}
                      >
                        {label}
                        <SortIcon col={col} />
                      </th>
                    ))}
                    <th
                      className="px-4 py-2.5 text-center slds-text-3 font-semibold w-12"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      <MessageSquare className="h-3.5 w-3.5 inline" />
                    </th>
                    <th
                      className="px-4 py-2.5 text-right slds-text-3 font-semibold w-20"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-12 text-center"
                      >
                        <p
                          className="slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          No tasks match the selected filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((task, idx) => {
                      const badge = STATUS_BADGE[task.status];
                      const isOverdue =
                        task.status === "Open" &&
                        parseDateMMDD(task.dueDate) <
                          parseDateMMDD(TODAY);
                      const cmts = commentCount(task);
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
                            className="px-4 py-2.5 slds-text-4 max-w-[280px]"
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
                            className="px-4 py-2.5 slds-text-4 whitespace-nowrap"
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
                            className="px-4 py-2.5 slds-text-4 whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {task.assignedTo}
                          </td>
                          <td
                            className="px-4 py-2.5 slds-text-4 whitespace-nowrap"
                            style={{ color: "#0176d3" }}
                          >
                            {task.relatedTo || "—"}
                          </td>
                          <td
                            className="px-4 py-2.5 slds-text-4 whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {task.createDate}
                          </td>
                          <td
                            className="px-4 py-2.5 slds-text-4 whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {task.modifiedDate}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span
                              className="slds-text-3 px-2 py-0.5 rounded-full font-medium"
                              style={{
                                backgroundColor: badge.bg,
                                color: badge.color,
                              }}
                            >
                              {task.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {cmts > 0 ? (
                              <span
                                className="inline-flex items-center gap-1 slds-text-3"
                                style={{ color: "#0176d3" }}
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
                          <td className="px-4 py-2.5 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => openDetail(task)}
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
                              {/* AC12: hide connection from view */}
                              <button
                                onClick={() =>
                                  hideTask(task.id)
                                }
                                className="h-7 w-7 rounded flex items-center justify-center transition-colors"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                  border:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                  backgroundColor:
                                    "var(--slds-g-color-background-base)",
                                }}
                                title="Hide from view"
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

            {/* Footer */}
            <div
              className="px-6 py-2 flex-shrink-0"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <p
                className="slds-text-3"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Showing {filtered.length} of {tasks.length} task
                {tasks.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Task Modal ────────────────────────────────────────── */}
      {showCreate && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="rounded-lg w-full max-w-lg mx-4 overflow-hidden"
            style={{
              backgroundColor:
                "var(--slds-g-color-background-base)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <h3
                className="slds-text-5 font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                New Task
              </h3>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1.5 rounded hover:bg-gray-200"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Subject */}
              <div className="space-y-1.5">
                <Label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  SUBJECT{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => {
                    setNewSubject(e.target.value);
                    setNewSubjectError(false);
                  }}
                  placeholder="Enter task subject…"
                  className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                  style={{
                    border: `1px solid ${newSubjectError ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
                {newSubjectError && (
                  <p
                    className="slds-text-3"
                    style={{ color: "#c23934" }}
                  >
                    Subject is required.
                  </p>
                )}
              </div>
              {/* Due Date */}
              <div className="space-y-1.5">
                <Label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  DUE DATE
                </Label>
                <DateInput
                  value={isoToMdy(
                    newDueDate
                      ? (() => {
                          const [m, d, y] =
                            newDueDate.split("/");
                          return `${y}-${m}-${d}`;
                        })()
                      : "",
                  )}
                  onChange={(v) =>
                    ((e) => {
                      if (!e.target.value) {
                        setNewDueDate("");
                        return;
                      }
                      const [y, m, d] =
                        e.target.value.split("-");
                      setNewDueDate(`${m}/${d}/${y}`);
                    })({ target: { value: mdyToIso(v) } })
                  }
                  className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              </div>
              {/* Assigned To */}
              <div className="space-y-1.5">
                <Label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  ASSIGNED TO{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={newAssignedTo}
                  onValueChange={setNewAssignedTo}
                >
                  <SelectTrigger
                    className="h-9 slds-text-4"
                    style={{
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ zIndex: 70 }}>
                    {STAFF_OPTIONS.map((s) => (
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
              {/* Related To — AC8: auto-populated from constituent context when available */}
              <div className="space-y-1.5">
                <Label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  RELATED TO
                </Label>
                <Select
                  value={newRelatedTo || "__none__"}
                  onValueChange={(v) =>
                    setNewRelatedTo(v === "__none__" ? "" : v)
                  }
                >
                  <SelectTrigger
                    className="h-9 slds-text-4"
                    style={{
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <SelectValue placeholder="Select constituent" />
                  </SelectTrigger>
                  <SelectContent style={{ zIndex: 70 }}>
                    <SelectItem
                      value="__none__"
                      className="slds-text-4"
                    >
                      None
                    </SelectItem>
                    {CONSTITUENT_OPTIONS.map((c) => (
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
                {defaultRelatedTo && (
                  <p
                    className="slds-text-3"
                    style={{ color: "#145F33" }}
                  >
                    Auto-populated from current record:{" "}
                    {defaultRelatedTo}
                  </p>
                )}
              </div>
            </div>
            <div
              className="px-6 py-4 flex justify-end gap-2"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <button
                onClick={() => setShowCreate(false)}
                className="h-9 px-4 rounded-full slds-text-4 font-medium"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={createTask}
                className="h-9 px-4 rounded-full slds-text-4 font-medium text-white"
                style={{ backgroundColor: "#145F33" }}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Connection Modal (AC11) ─────────────────────────────── */}
      {showAddConnection && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="rounded-lg w-full max-w-md mx-4 overflow-hidden"
            style={{
              backgroundColor:
                "var(--slds-g-color-background-base)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <h3
                className="slds-text-5 font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Add Connection to My Tasks
              </h3>
              <button
                onClick={() => setShowAddConnection(false)}
                className="p-1.5 rounded hover:bg-gray-200"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              <p
                className="slds-text-3 mb-3"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Select upcoming connections to include in your
                task view.
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {AVAILABLE_CONNECTIONS.filter(
                  (c) => !addedConnectionIds.has(c.id),
                ).map((c) => (
                  <label
                    key={c.id}
                    className="flex items-start gap-3 cursor-pointer rounded-lg px-3 py-2.5 transition-colors"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor: selectedConnections.has(
                        c.id,
                      )
                        ? "rgba(20,95,51,0.06)"
                        : "var(--slds-g-color-background-base)",
                      borderColor: selectedConnections.has(c.id)
                        ? "#145F33"
                        : "var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedConnections.has(c.id)}
                      onChange={(e) => {
                        const s = new Set(selectedConnections);
                        e.target.checked
                          ? s.add(c.id)
                          : s.delete(c.id);
                        setSelectedConnections(s);
                      }}
                      className="h-4 w-4 mt-0.5 flex-shrink-0"
                      style={{ accentColor: "#145F33" }}
                    />
                    <div>
                      <p
                        className="slds-text-4 font-medium"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {c.subject}
                      </p>
                      <p
                        className="slds-text-3 mt-0.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Due: {c.dueDate} · {c.relatedTo}
                      </p>
                    </div>
                  </label>
                ))}
                {AVAILABLE_CONNECTIONS.filter(
                  (c) => !addedConnectionIds.has(c.id),
                ).length === 0 && (
                  <p
                    className="slds-text-4 text-center py-6"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    All available connections have been added.
                  </p>
                )}
              </div>
            </div>
            <div
              className="px-6 py-4 flex justify-end gap-2"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <button
                onClick={() => setShowAddConnection(false)}
                className="h-9 px-4 rounded-full slds-text-4 font-medium"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={addConnections}
                disabled={selectedConnections.size === 0}
                className="h-9 px-4 rounded-full slds-text-4 font-medium text-white disabled:opacity-40"
                style={{ backgroundColor: "#145F33" }}
              >
                Add{" "}
                {selectedConnections.size > 0
                  ? `(${selectedConnections.size})`
                  : ""}{" "}
                to My Tasks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Task Detail Modal ────────────────────────────────────────── */}
      {detailTask && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="rounded-lg w-full max-w-3xl mx-4 flex flex-col overflow-hidden"
            style={{
              maxHeight: "90vh",
              backgroundColor:
                "var(--slds-g-color-background-base)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
            }}
          >
            {/* Detail Header */}
            <div
              className="px-6 py-4 flex items-start justify-between flex-shrink-0 gap-3"
              style={{
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 min-w-0">
                  <h3
                    className="slds-text-5 font-semibold truncate"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                    title={detailTask.subject}
                  >
                    {detailTask.subject}
                  </h3>
                  {detailTask.isSystem && (
                    <span
                      className="slds-text-3 px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                      style={{
                        backgroundColor: "rgba(146,64,14,0.08)",
                        color: "#92400E",
                        border: "1px solid rgba(146,64,14,0.2)",
                      }}
                    >
                      System
                    </span>
                  )}
                </div>
                {(() => {
                  const link = getTaskLink(detailTask);
                  if (!link) return null;
                  return (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1 slds-text-3 font-medium hover:underline"
                      style={{ color: "#0176d3" }}
                    >
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      {link.label}
                    </a>
                  );
                })()}
              </div>
              <button
                onClick={closeDetail}
                className="p-1.5 rounded hover:bg-gray-200 flex-shrink-0"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Fields */}
              <div
                className="px-6 py-5 grid grid-cols-2 gap-4"
                style={{
                  borderBottom:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                {/* Subject */}
                <div className="col-span-2 space-y-1.5">
                  <Label
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    SUBJECT{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <input
                    type="text"
                    value={detailSubject}
                    disabled={isClosed}
                    onChange={(e) =>
                      setDetailSubject(e.target.value)
                    }
                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor: isClosed
                        ? "var(--slds-g-color-neutral-95)"
                        : "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                      cursor: isClosed
                        ? "not-allowed"
                        : undefined,
                    }}
                  />
                </div>
                {/* Due Date */}
                <div className="space-y-1.5">
                  <Label
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    DUE DATE
                  </Label>
                  {isClosed ? (
                    <div
                      className="h-9 flex items-center px-3 rounded slds-text-4"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-neutral-95)",
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {detailDueDate || "—"}
                    </div>
                  ) : (
                    <DateInput
                      value={detailDueDate}
                      onChange={setDetailDueDate}
                      style={{
                        borderColor:
                          "var(--slds-g-color-border-base-1)",
                      }}
                    />
                  )}
                </div>
                {/* Status */}
                <div className="space-y-1.5">
                  <Label
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    STATUS
                  </Label>
                  {isClosed ? (
                    <div
                      className="h-9 flex items-center px-3 rounded slds-text-4"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-neutral-95)",
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {detailStatus}
                    </div>
                  ) : (
                    <Select
                      value={detailStatus}
                      onValueChange={(v) =>
                        setDetailStatus(v as TaskStatus)
                      }
                    >
                      <SelectTrigger
                        className="h-9 slds-text-4"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          [
                            "Open",
                            "In Progress",
                            "On Hold",
                          ] as TaskStatus[]
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
                  )}
                </div>
                {/* Assigned To */}
                <div className="space-y-1.5">
                  <Label
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    ASSIGNED TO{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  {isClosed ? (
                    <div
                      className="h-9 flex items-center px-3 rounded slds-text-4"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-neutral-95)",
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {detailAssignedTo}
                    </div>
                  ) : (
                    <Select
                      value={detailAssignedTo}
                      onValueChange={setDetailAssignedTo}
                    >
                      <SelectTrigger
                        className="h-9 slds-text-4"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAFF_OPTIONS.map((s) => (
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
                  )}
                </div>
                {/* Related To */}
                <div className="space-y-1.5">
                  <Label
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    RELATED TO
                  </Label>
                  {isClosed ? (
                    <div
                      className="h-9 flex items-center px-3 rounded slds-text-4"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-neutral-95)",
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {detailRelatedTo || "—"}
                    </div>
                  ) : (
                    <Select
                      value={detailRelatedTo || "__none__"}
                      onValueChange={(v) =>
                        setDetailRelatedTo(
                          v === "__none__" ? "" : v,
                        )
                      }
                    >
                      <SelectTrigger
                        className="h-9 slds-text-4"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="__none__"
                          className="slds-text-4"
                        >
                          None
                        </SelectItem>
                        {CONSTITUENT_OPTIONS.map((c) => (
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
                  )}
                </div>
                {/* Meta */}
                <div className="col-span-2 flex items-center gap-6 pt-1">
                  {[
                    {
                      icon: User,
                      label: "Created by",
                      value: detailTask.createdBy,
                    },
                    {
                      icon: Calendar,
                      label: "Created",
                      value: detailTask.createDate,
                    },
                    {
                      icon: Clock,
                      label: "Modified",
                      value: detailTask.modifiedDate,
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-1.5"
                    >
                      <Icon
                        className="h-3.5 w-3.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      />
                      <span
                        className="slds-text-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {label}:
                      </span>
                      <span
                        className="slds-text-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Task History (Log + Comments) */}
              <div className="px-6 py-4">
                <p
                  className="slds-text-3 font-semibold mb-3"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  TASK HISTORY
                </p>
                <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                  {detailTask.history.length === 0 ? (
                    <p
                      className="slds-text-4 italic"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      No history yet.
                    </p>
                  ) : (
                    detailTask.history.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3"
                      >
                        {entry.type === "comment" ? (
                          <>
                            <div
                              className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{
                                backgroundColor:
                                  "rgba(1,118,211,0.12)",
                                color: "#0176d3",
                              }}
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </div>
                            <div
                              className="flex-1 rounded-lg px-3 py-2"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-alt)",
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className="slds-text-3 font-semibold"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {entry.author}
                                </span>
                                <span
                                  className="slds-text-3"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  {entry.timestamp}
                                </span>
                              </div>
                              <p
                                className="slds-text-4"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {entry.comment}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div
                              className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{
                                backgroundColor:
                                  "rgba(20,95,51,0.1)",
                                color: "#145F33",
                              }}
                            >
                              <Tag className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 py-1">
                              <span
                                className="slds-text-3 font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {entry.author}
                              </span>
                              <span
                                className="slds-text-3"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                {" "}
                                changed{" "}
                              </span>
                              <span
                                className="slds-text-3 font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {entry.field}
                              </span>
                              {entry.oldValue ? (
                                <>
                                  <span
                                    className="slds-text-3"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    {" "}
                                    from{" "}
                                  </span>
                                  <span
                                    className="slds-text-3 font-medium"
                                    style={{ color: "#c23934" }}
                                  >
                                    {entry.oldValue}
                                  </span>
                                  <span
                                    className="slds-text-3"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    {" "}
                                    to{" "}
                                  </span>
                                  <span
                                    className="slds-text-3 font-medium"
                                    style={{ color: "#145F33" }}
                                  >
                                    {entry.newValue}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span
                                    className="slds-text-3"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    {" "}
                                    set to{" "}
                                  </span>
                                  <span
                                    className="slds-text-3 font-medium"
                                    style={{ color: "#145F33" }}
                                  >
                                    {entry.newValue}
                                  </span>
                                </>
                              )}
                              <span
                                className="slds-text-3 ml-2"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                · {entry.timestamp}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment */}
                {!isClosed && (
                  <div className="mt-4 flex items-start gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) =>
                        setNewComment(e.target.value)
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        addComment()
                      }
                      placeholder="Add a comment…"
                      className="flex-1 h-9 px-3 rounded slds-text-4 focus:outline-none"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    <button
                      onClick={addComment}
                      disabled={!newComment.trim()}
                      className="h-9 w-9 rounded-full flex items-center justify-center disabled:opacity-40 transition-opacity"
                      style={{
                        backgroundColor: "#145F33",
                        color: "white",
                      }}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Detail Footer */}
            <div
              className="px-6 py-4 flex items-center justify-between flex-shrink-0"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <div className="flex items-center gap-2">
                {!isClosed && (
                  <>
                    <button
                      onClick={completeTask}
                      className="h-9 px-4 rounded-full slds-text-4 font-medium flex items-center gap-1.5 text-white"
                      style={{ backgroundColor: "#145F33" }}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Complete
                    </button>
                    <button
                      onClick={cancelTask}
                      className="h-9 px-4 rounded-full slds-text-4 font-medium flex items-center gap-1.5"
                      style={{
                        border: "1px solid #c23934",
                        color: "#c23934",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel Task
                    </button>
                  </>
                )}
                {isClosed && (
                  <div className="flex items-center gap-3">
                    <span
                      className="slds-text-3 italic"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      This task is{" "}
                      {detailTask.status.toLowerCase()} and
                      cannot be edited.
                    </span>
                    <button
                      onClick={reopenTask}
                      className="h-9 px-4 rounded-full slds-text-4 font-medium flex items-center gap-1.5"
                      style={{
                        border: "1px solid #0176d3",
                        color: "#0176d3",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                      }}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Re-Open
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={closeDetail}
                  className="h-9 px-4 rounded-full slds-text-4 font-medium"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  Close
                </button>
                {!isClosed && (
                  <button
                    onClick={saveDetail}
                    className="h-9 px-4 rounded-full slds-text-4 font-medium text-white"
                    style={{ backgroundColor: "#145F33" }}
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}