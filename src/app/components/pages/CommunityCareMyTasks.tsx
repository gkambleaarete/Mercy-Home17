// Community Care › My Tasks — a copy of Program Log › My Tasks
// (ProgramDetailView.tsx "Program Log My Tasks" + its Task Detail modal from
// ProgramDetailViewDialogs.tsx), with Related To using Community Care
// members ("Name (Role)" from My Members). Prototype data, in-memory only.
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
import { Input } from "../ui/input";
import { TablePaginationBar } from "../ui/table-toolbar";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { MultiSelect } from "../ui/multi-select";
import { SearchableSelect } from "../ui/searchable-select";
import { FieldError, FieldLabel } from "../ui/field";
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
  DialogBody,
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
  displayShiftLabel,
  type SavedChecklistResult,
} from "../../data/shiftHandoverChecklistStore";
import { ChecklistIndicator } from "../shift-handover/ChecklistResults";

import { MEMBER_ROWS } from "./CommunityCareMemberPage";

export function CommunityCareMyTasks() {
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
  // Community Care: Related To = My Members, shown as "Name (Role)".
  const PL_CONSTITUENTS = MEMBER_ROWS.map(
    (r) => `${r.name} (${r.relationship})`,
  );

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
      subject: "Complete intake assessment",
      dueDate: PL_TODAY,
      assignedTo: PL_USER,
      relatedTo: PL_CONSTITUENTS[0],
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
      subject: "Schedule care plan review",
      dueDate: PL_TOMORROW,
      assignedTo: PL_USER,
      relatedTo: PL_CONSTITUENTS[1],
      createDate: "06/22/2026",
      modifiedDate: "06/27/2026",
      status: "Open",
      createdBy: PL_USER,
      history: [mkL2(1, "Status", "", "Open")],
    },
    {
      id: 203,
      subject: "Follow up on employment referral",
      dueDate: "07/02/2026",
      assignedTo: PL_USER,
      relatedTo: PL_CONSTITUENTS[2],
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
      subject: "Upload signed consent form",
      dueDate: PL_TOMORROW,
      assignedTo: PL_USER,
      relatedTo: PL_CONSTITUENTS[3],
      createDate: "06/24/2026",
      modifiedDate: "06/28/2026",
      status: "Open",
      createdBy: PL_USER,
      history: [mkL2(1, "Status", "", "Open")],
    },
    {
      id: 205,
      subject: "Monthly check-in call",
      dueDate: "06/30/2026",
      assignedTo: PL_USER,
      relatedTo: PL_CONSTITUENTS[0],
      createDate: "06/23/2026",
      modifiedDate: "06/28/2026",
      status: "Open",
      createdBy: PL_USER,
      history: [mkL2(1, "Status", "", "Open")],
    },
    {
      id: 206,
      subject: "ITP Review — Maya Patel (Annual)",
      dueDate: "07/10/2026",
      assignedTo: PL_USER,
      relatedTo: PL_CONSTITUENTS[0],
      createDate: "06/01/2026",
      modifiedDate: "06/01/2026",
      status: "Open",
      createdBy: "System",
      isSystem: true,
      history: [mkL2(1, "Status", "", "Open", "System")],
    },
    {
      id: 207,
      subject: "Call Back Follow-Up — Dr. Samuel Brooks",
      dueDate: PL_TODAY,
      assignedTo: PL_USER,
      relatedTo: PL_CONSTITUENTS[1],
      createDate: "06/28/2026",
      modifiedDate: "06/28/2026",
      status: "Open",
      createdBy: "System",
      isSystem: true,
      history: [mkL2(1, "Status", "", "Open", "System")],
    },
    {
      id: 208,
      subject: "Medication Error Review — Rachel Nguyen",
      dueDate: PL_TODAY,
      assignedTo: PL_USER,
      relatedTo: PL_CONSTITUENTS[3],
      createDate: "06/29/2026",
      modifiedDate: "06/29/2026",
      status: "Open",
      createdBy: "System",
      isSystem: true,
      history: [mkL2(1, "Status", "", "Open", "System")],
    },
    {
      id: 209,
      subject: "CPI Approval Required — Carlos Mendoza",
      dueDate: PL_TOMORROW,
      assignedTo: PL_USER,
      relatedTo: PL_CONSTITUENTS[4],
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
      participants: "Maya Patel, Sohan Jadhavrao",
      location: "Office",
    },
    {
      id: 2,
      type: "Advocate Meeting",
      status: "Completed",
      startDate: "06/25/2026",
      participants: "Maya Patel, Maria Santos",
      location: "Home Visit",
    },
    {
      id: 3,
      type: "School Meeting",
      status: "Scheduled",
      startDate: "07/02/2026",
      participants: "Maya Patel, Jordan Ellis",
      location: "School",
    },
    {
      id: 4,
      type: "Doctor Office Visit",
      status: "Completed",
      startDate: "06/20/2026",
      participants: PL_CONSTITUENTS[0],
      location: "Clinic",
    },
    {
      id: 5,
      type: "Parent / Family Contact",
      status: "Incomplete",
      startDate: "06/15/2026",
      participants: "Maya Patel, Rachel Nguyen",
      location: "Phone",
    },
    {
      id: 6,
      type: "Milieu Meeting",
      status: "Scheduled",
      startDate: "06/30/2026",
      participants:
        "Maya Patel, Sohan Jadhavrao, Maria Santos",
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
  type PlQuick = "all" | "open" | "today" | "tomorrow" | "transferred";
  const PL_QUICK_FILTERS: { key: PlQuick; label: string }[] = [
    { key: "all", label: "All Tasks" },
    { key: "open", label: "Open Tasks" },
    { key: "today", label: "Today's Tasks" },
    { key: "tomorrow", label: "Tomorrow's Tasks" },
    { key: "transferred", label: "Transferred Tasks" },
  ];
  const [plQuick, setPlQuick] = useState<PlQuick>("all");
  // New Task dialog
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [ntSubject, setNtSubject] = useState("");
  const [ntDue, setNtDue] = useState("");
  const [ntRelated, setNtRelated] = useState("");
  const [ntAssigned, setNtAssigned] = useState(PL_USER);
  const [ntRelatedType, setNtRelatedType] = useState("Account");
  const NT_RELATED_TYPES = [
    "Account",
    "Account Account Relationship",
    "Accreditation",
    "Action Plan Template Assignment",
    "Activity History",
    "Admission",
    "Applicant",
    "Applicant-Applicant Relation",
    "Application Decision",
    "Application Form",
    "Application Form Evaluation",
  ];
  const [ntSubmitted, setNtSubmitted] = useState(false);
  function openNewTask() {
    setNtSubject("");
    setNtDue("");
    setNtRelated("");
    setNtAssigned(PL_USER);
    setNtRelatedType("Account");
    setNtSubmitted(false);
    setNewTaskOpen(true);
  }
  function saveNewTask() {
    setNtSubmitted(true);
    if (!ntSubject.trim() || !ntAssigned) return;
    if (ntDue && !/^\d{2}\/\d{2}\/\d{4}$/.test(ntDue)) return;
    setPlTasks((ts) => [
      {
        id: Date.now(),
        subject: ntSubject.trim(),
        dueDate: ntDue,
        assignedTo: ntAssigned,
        relatedTo: ntRelated,
        createDate: PL_TODAY,
        modifiedDate: PL_TODAY,
        status: "Open",
        createdBy: PL_USER,
        history: [],
      },
      ...ts,
    ]);
    setNewTaskOpen(false);
    toast.success("Task created.");
  }
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
    if (plQuick === "open")
      ts = ts.filter((t) => t.status === "Open" || t.status === "In Progress");
    else if (plQuick === "today") ts = ts.filter((t) => t.dueDate === PL_TODAY);
    else if (plQuick === "tomorrow")
      ts = ts.filter((t) => t.dueDate === PL_TOMORROW);
    else if (plQuick === "transferred")
      ts = ts.filter((t) => t.createdBy !== PL_USER && t.createdBy !== "System");
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
    plQuick,
    plFAssigned,
    plFRelated,
    plFStatus,
    plFCStart,
    plFCEnd,
    plSortCol,
    plSortDir,
  ]);

  // Connections table (Community Care My Tasks)
  const CC_TYPES = Array.from(new Set(PL_CONNECTIONS.map((c) => c.type)));
  const CC_STATUSES = Array.from(new Set(PL_CONNECTIONS.map((c) => c.status)));
  const CC_DEPTS = ["Community Care", "Clinical", "Education", "Residential"];
  const CC_SUBTYPES: Record<string, string> = {
    "Therapy Session": "Individual",
    "School Meeting": "IEP",
    "Advocate Meeting": "Check-in",
  };
  type CcFilters = { start: string; end: string; types: string[]; participant: string; status: string; depts: string[] };
  const CC_EMPTY: CcFilters = { start: "", end: "", types: [], participant: "", status: "", depts: [] };
  const [ccSearch, setCcSearch] = useState("");
  const [ccFiltersOpen, setCcFiltersOpen] = useState(false);
  const [ccDraft, setCcDraft] = useState<CcFilters>(CC_EMPTY);
  const [ccApplied, setCcApplied] = useState<CcFilters>(CC_EMPTY);
  const ccFiltersActive =
    !!(ccApplied.start || ccApplied.end || ccApplied.participant || ccApplied.status) ||
    ccApplied.types.length > 0 ||
    ccApplied.depts.length > 0;
  const ccRows = PL_CONNECTIONS.map((c, i) => ({
    ...c,
    subType: CC_SUBTYPES[c.type] ?? "",
    startTime: "09:00 AM",
    endDate: "",
    endTime: "",
    department: CC_DEPTS[i % CC_DEPTS.length],
  }))
    .filter((c) => {
      const q = ccSearch.trim().toLowerCase();
      if (q && ![c.type, c.participants, c.location, c.status].join(" ").toLowerCase().includes(q)) return false;
      const t = parsePlDate(c.startDate).getTime();
      if (ccApplied.start && t < parsePlDate(ccApplied.start).getTime()) return false;
      if (ccApplied.end && t > parsePlDate(ccApplied.end).getTime()) return false;
      if (ccApplied.types.length && !ccApplied.types.includes(c.type)) return false;
      if (ccApplied.participant && !c.participants.toLowerCase().includes(ccApplied.participant.toLowerCase())) return false;
      if (ccApplied.status && c.status !== ccApplied.status) return false;
      if (ccApplied.depts.length && !ccApplied.depts.includes(c.department)) return false;
      return true;
    })
    .sort((a, b) => a.type.localeCompare(b.type));

  // Pagination (5 rows per page) for both tables.
  const PAGE_SIZE_TASKS = 5;
  const [plPage, setPlPage] = useState(1);
  const plTotalPages = Math.max(1, Math.ceil(plFiltered.length / PAGE_SIZE_TASKS));
  const plSafePage = Math.min(plPage, plTotalPages);
  const plPageRows = plFiltered.slice((plSafePage - 1) * PAGE_SIZE_TASKS, plSafePage * PAGE_SIZE_TASKS);
  useEffect(() => setPlPage(1), [plQuick, plSearch, plFAssigned, plFRelated, plFStatus, plFCStart, plFCEnd]);
  const [ccPage, setCcPage] = useState(1);
  const ccTotalPages = Math.max(1, Math.ceil(ccRows.length / PAGE_SIZE_TASKS));
  const ccSafePage = Math.min(ccPage, ccTotalPages);
  const ccPageRows = ccRows.slice((ccSafePage - 1) * PAGE_SIZE_TASKS, ccSafePage * PAGE_SIZE_TASKS);
  useEffect(() => setCcPage(1), [ccSearch, ccApplied]);

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


  return (
    <>
                  <div className="space-y-6">
                  {/* Card 1 — Tasks */}
                  <section aria-label="My Tasks" className="overflow-hidden" style={{
                      border: "1px solid var(--slds-g-color-border-base-1)",
                      borderRadius: "var(--slds-c-card-radius-border)",
                      backgroundColor: "var(--slds-g-color-background-base)",
                      boxShadow: "var(--slds-g-shadow-1)",
                    }}>
                    {/* ── Task Table Toolbar ─────────────────── */}
                    {/* Toolbar — Mercy Home DS: quick-filter buttons
                        left; search, Filters, count and New Task right. */}
                    <div
                      className="flex items-center justify-between px-4 py-3 gap-3 flex-wrap"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {/* Mercy Home DS segmented button group */}
                      <ToggleGroup
                        type="single"
                        variant="brand"
                        size="sm"
                        aria-label="Quick task filters"
                        value={plQuick}
                        onValueChange={(v) => v && setPlQuick(v as PlQuick)}
                      >
                        {PL_QUICK_FILTERS.map((q) => (
                          <ToggleGroupItem key={q.key} value={q.key}>
                            {q.label}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative w-56">
                          <Search
                            aria-hidden="true"
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 z-10"
                            style={{ color: "var(--slds-g-color-text-weak)" }}
                          />
                          <Input
                            aria-label="Search tasks"
                            placeholder="Search tasks..."
                            className="pl-9 h-8 w-full text-[13px]"
                            surface="base"
                            value={plSearch}
                            onChange={(e) => setPlSearch(e.target.value)}
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          aria-pressed={plAdvanced}
                          onClick={() => setPlAdvanced((v) => !v)}
                        >
                          <SlidersHorizontal aria-hidden="true" />
                          Filters
                          {(plFAssigned ||
                            plFRelated ||
                            plFStatus ||
                            plFCStart ||
                            plFCEnd) && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#145F33]" />
                          )}
                        </Button>
                        <span
                          className="slds-text-3"
                          style={{ color: "var(--slds-g-color-text-weak)" }}
                        >
                          {plFiltered.length} task
                          {plFiltered.length !== 1 ? "s" : ""}
                        </span>
                        <Button size="sm" onClick={openNewTask}>
                          <Plus aria-hidden="true" />
                          New Task
                        </Button>
                      </div>
                    </div>

                    {/* Advanced Filters — Mercy Home DS (FieldLabel,
                        DateInput, Select, Button). */}
                    {plAdvanced && (
                      <div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto] items-end gap-3 px-4 py-3"
                        style={{
                          borderBottom: "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor: "var(--slds-g-color-background-alt)",
                        }}
                      >
                        <div className="space-y-1.5 min-w-0">
                          <FieldLabel htmlFor="plf-from">Create Date From</FieldLabel>
                          <DateInput id="plf-from" value={plFCStart} onChange={setPlFCStart} />
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <FieldLabel htmlFor="plf-to">To</FieldLabel>
                          <DateInput id="plf-to" value={plFCEnd} onChange={setPlFCEnd} />
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <FieldLabel htmlFor="plf-assigned">Assigned To</FieldLabel>
                          <Select value={plFAssigned || "__all"} onValueChange={(v) => setPlFAssigned(v === "__all" ? "" : v)}>
                            <SelectTrigger id="plf-assigned" surface="base"><SelectValue /></SelectTrigger>
                            <SelectContent className="max-h-[260px]">
                              <SelectItem value="__all">All</SelectItem>
                              {PL_STAFF.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <FieldLabel htmlFor="plf-related">Related To</FieldLabel>
                          <Select value={plFRelated || "__all"} onValueChange={(v) => setPlFRelated(v === "__all" ? "" : v)}>
                            <SelectTrigger id="plf-related" surface="base"><SelectValue /></SelectTrigger>
                            <SelectContent className="max-h-[260px]">
                              <SelectItem value="__all">All</SelectItem>
                              {PL_CONSTITUENTS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <FieldLabel htmlFor="plf-status">Status</FieldLabel>
                          <Select value={plFStatus || "__all"} onValueChange={(v) => setPlFStatus(v === "__all" ? "" : v)}>
                            <SelectTrigger id="plf-status" surface="base"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__all">All</SelectItem>
                              {(["Open", "In Progress", "Completed", "On Hold", "Cancelled"] as PlTaskStatus[]).map((st) => (
                                <SelectItem key={st} value={st}>{st}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setPlFCStart("");
                            setPlFCEnd("");
                            setPlFAssigned("");
                            setPlFRelated("");
                            setPlFStatus("");
                          }}
                        >
                          Clear
                        </Button>
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
                            plPageRows.map((task, idx) => {
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
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      aria-label={`Edit ${task.subject}`}
                                      onClick={() => openPlDetail(task)}
                                    >
                                      <Pencil aria-hidden="true" />
                                      Edit
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                    {plFiltered.length > 0 && (
                      <div className="px-4 py-2.5 border-t border-border">
                        <TablePaginationBar
                          start={(plSafePage - 1) * PAGE_SIZE_TASKS + 1}
                          end={Math.min(plSafePage * PAGE_SIZE_TASKS, plFiltered.length)}
                          total={plFiltered.length}
                          countLabel="tasks"
                          currentPage={plSafePage}
                          totalPages={plTotalPages}
                          onPrevious={() => setPlPage((p) => Math.max(1, p - 1))}
                          onNext={() => setPlPage((p) => Math.min(plTotalPages, p + 1))}
                        />
                      </div>
                    )}
                  </section>

                  </div>
            {plDetailTask && (()=>{
                const closed=plDetailTask.status==="Completed"||plDetailTask.status==="Cancelled";
                const fld=(label:string,val:string,node:React.ReactNode)=>(
                    <div className="space-y-1.5">
                        <label className="slds-form-label" style={{color:"var(--slds-g-color-text-weak)"}}>{label}</label>
                        {closed?<div className="h-9 flex items-center px-3 rounded slds-text-4" style={{border:"1px solid var(--slds-g-color-border-base-1)",backgroundColor:"var(--slds-g-color-neutral-95)",color:"var(--slds-g-color-text-weak)"}}>{val||"—"}</div>:node}
                    </div>
                );
                return (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center" style={{backgroundColor:"rgba(0,0,0,0.45)"}}>
                        <div className="rounded-lg w-full max-w-3xl mx-4 flex flex-col overflow-hidden" style={{maxHeight:"90vh",backgroundColor:"var(--slds-g-color-background-base)",border:"1px solid var(--slds-g-color-border-base-1)",boxShadow:"0 8px 32px rgba(0,0,0,0.22)"}}>
                            <div className="px-6 py-4 flex items-start justify-between flex-shrink-0 gap-3" style={{borderBottom:"1px solid var(--slds-g-color-border-base-1)",backgroundColor:"var(--slds-g-color-background-alt)"}}>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <h3 className="slds-text-5 font-semibold truncate" style={{color:"var(--slds-g-color-text-default)"}}>{plDetailTask.subject}</h3>
                                        {plDetailTask.isSystem&&<span className="slds-text-3 px-1.5 py-0.5 rounded font-medium flex-shrink-0" style={{backgroundColor:"rgba(146,64,14,0.08)",color:"#92400E",border:"1px solid rgba(146,64,14,0.2)"}}>System</span>}
                                    </div>
                                    {(() => {
                                        const sub = plDetailTask.subject.toLowerCase();
                                        let url = "", label = "";
                                        if (plDetailTask.isSystem) {
                                            if (sub.includes("itp")) { url = "/itp-module"; label = "Open ITP Module"; }
                                            else if (sub.includes("contact log") || sub.includes("call back")) { url = "/contact-log"; label = "Open Contact Log"; }
                                            else if (sub.includes("medication") || sub.includes("med")) { url = "/medications"; label = "Open Medications"; }
                                            else if (sub.includes("connection") || sub.includes("finalize")) { url = "/"; label = "Open Admissions"; }
                                            else if (sub.includes("cpi")) { url = "/constituents"; label = "Open Constituents"; }
                                            else { url = "/"; label = "Open Related Page"; }
                                        } else if (plDetailTask.relatedTo) {
                                            url = "/constituents"; label = `View ${plDetailTask.relatedTo}'s Profile`;
                                        }
                                        if (!url) return null;
                                        return (
                                            <a href={url} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 mt-1 slds-text-3 font-medium hover:underline"
                                                style={{color:"#0176d3"}}>
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                {label}
                                            </a>
                                        );
                                    })()}
                                </div>
                                <button onClick={()=>setPlDetailTask(null)} className="p-1.5 rounded hover:bg-gray-200 flex-shrink-0" style={{color:"var(--slds-g-color-text-weak)"}}><X className="h-5 w-5"/></button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <div className="px-6 py-5 grid grid-cols-2 gap-4" style={{borderBottom:"1px solid var(--slds-g-color-border-base-1)"}}>
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="slds-form-label" style={{color:"var(--slds-g-color-text-weak)"}}>SUBJECT <span className="text-red-600">*</span></label>
                                        {closed?<div className="h-9 flex items-center px-3 rounded slds-text-4" style={{border:"1px solid var(--slds-g-color-border-base-1)",backgroundColor:"var(--slds-g-color-neutral-95)",color:"var(--slds-g-color-text-weak)"}}>{plDS}</div>:
                                        <input type="text" value={plDS} onChange={e=>setPlDS(e.target.value)} className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none" style={{border:"1px solid var(--slds-g-color-border-base-1)",backgroundColor:"var(--slds-g-color-background-base)",color:"var(--slds-g-color-text-default)"}}/>}
                                    </div>
                                    {fld("DUE DATE",plDD,<DateInput value={plDD} onChange={setPlDD} style={{borderColor:"var(--slds-g-color-border-base-1)"}}/>)}
                                    {fld("STATUS",plDSt,
                                        <Select value={plDSt} onValueChange={v=>setPlDSt(v as PlTaskStatus)}>
                                            <SelectTrigger surface="base" className="h-9 slds-text-4" style={{borderColor:"var(--slds-g-color-border-base-1)"}}><SelectValue/></SelectTrigger>
                                            <SelectContent>{(["Open","In Progress","On Hold"] as PlTaskStatus[]).map(s=><SelectItem key={s} value={s} className="slds-text-4">{s}</SelectItem>)}</SelectContent>
                                        </Select>
                                    )}
                                    {fld("ASSIGNED TO",plDA,
                                        <Select value={plDA} onValueChange={setPlDA}>
                                            <SelectTrigger surface="base" className="h-9 slds-text-4" style={{borderColor:"var(--slds-g-color-border-base-1)"}}><SelectValue/></SelectTrigger>
                                            <SelectContent>{PL_STAFF.map(s=><SelectItem key={s} value={s} className="slds-text-4">{s}</SelectItem>)}</SelectContent>
                                        </Select>
                                    )}
                                    {fld("RELATED TO",plDR,
                                        <Select value={plDR||"__none__"} onValueChange={v=>setPlDR(v==="__none__"?"":v)}>
                                            <SelectTrigger surface="base" className="h-9 slds-text-4" style={{borderColor:"var(--slds-g-color-border-base-1)"}}><SelectValue placeholder="None"/></SelectTrigger>
                                            <SelectContent><SelectItem value="__none__" className="slds-text-4">None</SelectItem>{PL_CONSTITUENTS.map(c=><SelectItem key={c} value={c} className="slds-text-4">{c}</SelectItem>)}</SelectContent>
                                        </Select>
                                    )}
                                    <div className="col-span-2 flex items-center gap-6">
                                        {[{icon:User,label:"Created by",val:plDetailTask.createdBy},{icon:Calendar,label:"Created",val:plDetailTask.createDate},{icon:Clock,label:"Modified",val:plDetailTask.modifiedDate}].map(({icon:Icon,label,val})=>(
                                            <div key={label} className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" style={{color:"var(--slds-g-color-text-weak)"}}/><span className="slds-text-3" style={{color:"var(--slds-g-color-text-weak)"}}>{label}:</span><span className="slds-text-3" style={{color:"var(--slds-g-color-text-default)"}}>{val}</span></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="px-6 py-4">
                                    <p className="slds-text-3 font-semibold mb-3" style={{color:"var(--slds-g-color-text-weak)"}}>TASK HISTORY</p>
                                    <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                                        {plDetailTask.history.length===0&&<p className="slds-text-4 italic" style={{color:"var(--slds-g-color-text-weak)"}}>No history yet.</p>}
                                        {plDetailTask.history.map(entry=>(
                                            <div key={entry.id} className="flex items-start gap-3">
                                                {entry.type==="comment"?(
                                                    <>
                                                        <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{backgroundColor:"rgba(1,118,211,0.12)",color:"#0176d3"}}><MessageSquare className="h-3.5 w-3.5"/></div>
                                                        <div className="flex-1 rounded-lg px-3 py-2" style={{backgroundColor:"var(--slds-g-color-background-alt)",border:"1px solid var(--slds-g-color-border-base-1)"}}>
                                                            <div className="flex items-center gap-2 mb-1"><span className="slds-text-3 font-semibold" style={{color:"var(--slds-g-color-text-default)"}}>{entry.author}</span><span className="slds-text-3" style={{color:"var(--slds-g-color-text-weak)"}}>{entry.timestamp}</span></div>
                                                            <p className="slds-text-4" style={{color:"var(--slds-g-color-text-default)"}}>{entry.comment}</p>
                                                        </div>
                                                    </>
                                                ):(
                                                    <>
                                                        <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{backgroundColor:"rgba(20,95,51,0.1)",color:"#145F33"}}><Tag className="h-3.5 w-3.5"/></div>
                                                        <div className="flex-1 py-1">
                                                            <span className="slds-text-3 font-semibold" style={{color:"var(--slds-g-color-text-default)"}}>{entry.author}</span>
                                                            <span className="slds-text-3" style={{color:"var(--slds-g-color-text-weak)"}}> changed </span>
                                                            <span className="slds-text-3 font-semibold" style={{color:"var(--slds-g-color-text-default)"}}>{entry.field}</span>
                                                            {entry.oldValue?<><span className="slds-text-3" style={{color:"var(--slds-g-color-text-weak)"}}> from </span><span className="slds-text-3 font-medium" style={{color:"#c23934"}}>{entry.oldValue}</span><span className="slds-text-3" style={{color:"var(--slds-g-color-text-weak)"}}> to </span><span className="slds-text-3 font-medium" style={{color:"#145F33"}}>{entry.newValue}</span></>:<><span className="slds-text-3" style={{color:"var(--slds-g-color-text-weak)"}}> set to </span><span className="slds-text-3 font-medium" style={{color:"#145F33"}}>{entry.newValue}</span></>}
                                                            <span className="slds-text-3 ml-2" style={{color:"var(--slds-g-color-text-weak)"}}>· {entry.timestamp}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {!closed&&(
                                        <div className="mt-4 flex items-start gap-2">
                                            <input type="text" value={plComment} onChange={e=>setPlComment(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&addPlComment()} placeholder="Add a comment…" className="flex-1 h-9 px-3 rounded slds-text-4 focus:outline-none" style={{border:"1px solid var(--slds-g-color-border-base-1)",backgroundColor:"var(--slds-g-color-background-base)",color:"var(--slds-g-color-text-default)"}}/>
                                            <button onClick={addPlComment} disabled={!plComment.trim()} className="h-9 w-9 rounded-full flex items-center justify-center disabled:opacity-40" style={{backgroundColor:"#145F33",color:"white"}}><Send className="h-4 w-4"/></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{borderTop:"1px solid var(--slds-g-color-border-base-1)",backgroundColor:"var(--slds-g-color-background-alt)"}}>
                                <div className="flex items-center gap-2">
                                    {!closed&&<>
                                        <button onClick={completePlTask} className="h-9 px-4 rounded-full slds-text-4 font-medium flex items-center gap-1.5 text-white" style={{backgroundColor:"#145F33"}}><CheckCircle className="h-4 w-4"/>Complete</button>
                                        <button onClick={cancelPlTask} className="h-9 px-4 rounded-full slds-text-4 font-medium flex items-center gap-1.5" style={{border:"1px solid #c23934",color:"#c23934",backgroundColor:"var(--slds-g-color-background-base)"}}><XCircle className="h-4 w-4"/>Cancel Task</button>
                                    </>}
                                    {closed&&<div className="flex items-center gap-3">
                                        <span className="slds-text-3 italic" style={{color:"var(--slds-g-color-text-weak)"}}>This task is {plDetailTask.status.toLowerCase()} and cannot be edited.</span>
                                        <button onClick={reopenPlTask} className="h-9 px-4 rounded-full slds-text-4 font-medium flex items-center gap-1.5" style={{border:"1px solid #0176d3",color:"#0176d3",backgroundColor:"var(--slds-g-color-background-base)"}}><CheckCircle className="h-4 w-4"/>Re-Open</button>
                                    </div>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={()=>setPlDetailTask(null)} className="h-9 px-4 rounded-full slds-text-4 font-medium" style={{border:"1px solid var(--slds-g-color-border-base-1)",color:"var(--slds-g-color-text-default)",backgroundColor:"var(--slds-g-color-background-base)"}}>Close</button>
                                    {!closed&&<button onClick={savePlDetail} className="h-9 px-4 rounded-full slds-text-4 font-medium text-white" style={{backgroundColor:"#145F33"}}>Save Changes</button>}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
      {/* New Task — Mercy Home DS (Dialog, FieldLabel, Input, DateInput,
          Select, SearchableSelect, Button). */}
      <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
            <DialogDescription className="sr-only">Create a new task.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <FieldLabel required htmlFor="nt-subject" error={ntSubmitted && !ntSubject.trim()}>
                Subject
              </FieldLabel>
              <Input
                id="nt-subject"
                surface="base"
                placeholder="Enter task subject..."
                value={ntSubject}
                onChange={(e) => setNtSubject(e.target.value)}
                aria-invalid={(ntSubmitted && !ntSubject.trim()) || undefined}
              />
              {ntSubmitted && !ntSubject.trim() && <FieldError>Enter a subject.</FieldError>}
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="nt-due">Due Date</FieldLabel>
              <DateInput id="nt-due" value={ntDue} onChange={setNtDue} />
            </div>
            <div className="space-y-1.5">
              <FieldLabel required htmlFor="nt-assigned" error={ntSubmitted && !ntAssigned}>
                Assigned To
              </FieldLabel>
              <Select value={ntAssigned || undefined} onValueChange={setNtAssigned}>
                <SelectTrigger id="nt-assigned" surface="base" aria-invalid={(ntSubmitted && !ntAssigned) || undefined}>
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent className="max-h-[260px]">
                  {PL_STAFF.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {ntSubmitted && !ntAssigned && <FieldError>Select who the task is assigned to.</FieldError>}
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="nt-related">Related To</FieldLabel>
              <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-2">
                <Select value={ntRelatedType} onValueChange={(v) => { setNtRelatedType(v); setNtRelated(""); }}>
                  <SelectTrigger aria-label="Related to type" surface="base">
                    <SelectValue placeholder="Please Select" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[260px]">
                    {NT_RELATED_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <SearchableSelect
                  id="nt-related"
                  value={ntRelated}
                  onValueChange={setNtRelated}
                  options={PL_CONSTITUENTS.map((c) => ({ value: c, label: c }))}
                  placeholder="Search..."
                  searchPlaceholder="Search..."
                  emptyMessage="No records found."
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTaskOpen(false)}>Cancel</Button>
            <Button onClick={saveNewTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
