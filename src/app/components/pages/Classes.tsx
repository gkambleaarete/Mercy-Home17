import React, {
  useState,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  LearningModules,
  ModuleModal as LMModuleModal,
} from "./LearningModules";
import type { LearningModule as LMLearningModule } from "./LearningModules";
import {
  Search,
  RefreshCw,
  GraduationCap,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronLeft,
  ChevronDown,
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  FileText,
  Filter,
  Printer,
  CheckSquare,
  Square,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader } from "../ui/card";
import { DateInput } from "../ui/date-input";
import { TimeInput } from "../ui/time-input";
import { MultiSelect } from "../ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { toast } from "sonner";
import { formatMdy } from "../../lib/dateFormat";
import { Checkbox } from "../ui/checkbox";
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
import { MOCK_PROGRAMS } from "./programLogData";
import {
  constituentRoleOptions,
  nonConstituentRoleOptions,
  participantOptions,
  reasonMissedOptions,
} from "../admissions/connectionParticipantOptions";
import { parseConnectionStart } from "../admissions/connectionStatusRules";
import { CONSTITUENTS } from "../../data/mockConstituents";
import {
  INSTRUCTOR_CONSTITUENT_LINKS,
  constituentInstructorId,
} from "../../data/instructorConstituentLinks";

// ─── Constants ────────────────────────────────────────────────────────────────

const CLASS_TYPES = [
  "Character Building",
  "Educational and Therapeutic Resources",
  "The Arts",
  "Post-Secondary Options",
  "Spiritual Development",
  "Job Skills",
  "Financial Literacy",
  "Career Exposure",
  "Executive Functions",
] as const;
type ClassType = (typeof CLASS_TYPES)[number];

const BUDGET_CATEGORIES = [
  "Educational and Therapeutic Resources",
  "The Arts",
  "Character Building",
  "Title I",
  "Spiritual Development",
  "Post-Secondary Options",
  "Career Resources",
  "Academy",
] as const;
type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

const TEACHING_CAMPUSES = [
  "West Loop Campus",
  "Walsh Campus",
  "Other",
] as const;
type TeachingCampus = (typeof TEACHING_CAMPUSES)[number];

// ─── Types ────────────────────────────────────────────────────────────────────

interface LearningModule {
  id: string;
  name: string;
}
export interface Instructor {
  id: string;
  name: string;
  title: string;
}
interface Program {
  id: string;
  name: string;
}

export interface ClassRecord {
  id: string;
  name: string;
  description: string;
  comments: string;
  classType: ClassType;
  budgetCategory: BudgetCategory;
  active: boolean;
  modules: LearningModule[];
  programs: Program[];
}

export interface SessionParticipant {
  id: string;
  type: "Constituent" | "Non-Constituent";
  name: string;
  role: string;
  isOrganizer: boolean;
  attended: boolean | null;
  reasonMissed: string;
  otherReason: string;
  comment: string;
}

export interface ClassSession {
  id: string;
  classId: string;
  description: string;
  comments: string;
  date: string;
  time: string;
  endDate: string;
  endTime: string;
  sessionMinutes: number;
  campus: TeachingCampus;
  otherLocation: string;
  partnerOrganization: string;
  modules: LearningModule[];
  instructors: Instructor[];
  programs: Program[];
  participants: SessionParticipant[];
  status:
    | "complete"
    | "not-complete"
    | "Scheduled"
    | "Complete"
    | "Cancelled";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ALL_MODULES: LearningModule[] = [
  { id: "m1", name: "Financial Budgeting Basics" },
  { id: "m2", name: "Anger Management Techniques" },
  { id: "m3", name: "Resume Writing & Job Applications" },
  { id: "m4", name: "Reading Comprehension" },
  { id: "m5", name: "Communication Skills" },
  { id: "m6", name: "Conflict Resolution Strategies" },
  { id: "m7", name: "Creative Expression Through Art" },
  { id: "m8", name: "Mindfulness & Stress Reduction" },
  { id: "m9", name: "College Admission Process" },
  { id: "m10", name: "Time Management & Goal Setting" },
  { id: "m11", name: "Interview Preparation" },
  { id: "m12", name: "Critical Thinking Skills" },
];

const ALL_INSTRUCTORS: Instructor[] = [
  { id: "i1", name: "Maria Gonzalez", title: "MSW, LCSW" },
  { id: "i2", name: "James Carter", title: "LCPC" },
  { id: "i3", name: "Sandra Okafor", title: "M.Ed." },
  { id: "i4", name: "David Kim", title: "CPRW" },
  { id: "i5", name: "Angela Brooks", title: "AFC" },
  { id: "i6", name: "Thomas Nguyen", title: "ATR-BC" },
];

const ALL_PROGRAMS: Program[] = [
  { id: "p1", name: "Residential" },
  { id: "p2", name: "Transitional Living" },
  { id: "p3", name: "Day Treatment" },
  { id: "p4", name: "Foster Care" },
  { id: "p5", name: "Community Support" },
];

const ALL_PARTNER_ORGS: string[] = [
  "Chicago Public Schools",
  "City Colleges of Chicago",
  "DePaul University",
  "Chicago Urban League",
  "YMCA of Metropolitan Chicago",
  "Heartland Alliance",
  "Thresholds",
  "—",
];

let _classIdCounter = 9;
let _sessionIdCounter = 13;
const nextClassId = () =>
  `CLS-${String(++_classIdCounter).padStart(3, "0")}`;
const nextSessionId = () =>
  `SES-${String(++_sessionIdCounter).padStart(3, "0")}`;

export const INITIAL_CLASSES: ClassRecord[] = [
  {
    id: "CLS-001",
    name: "Character Building",
    active: true,
    classType: "Residential",
    budgetCategory: "Youth Services",
    description:
      "Residential program providing daily care and life skills for youth.",
    comments: "Priority enrollment for TL youth aged 16–21.",
    modules: [ALL_MODULES[0], ALL_MODULES[4], ALL_MODULES[9]],
    programs: [ALL_PROGRAMS[0]],
  },
  {
    id: "CLS-002",
    name: "Educational and Therapeutic Resources",
    active: true,
    classType: "Residential",
    budgetCategory: "Youth Services",
    description:
      "Group home supporting youth with structured living and case management.",
    comments: "Referrals from therapists encouraged.",
    modules: [ALL_MODULES[1], ALL_MODULES[5], ALL_MODULES[7]],
    programs: [ALL_PROGRAMS[0], ALL_PROGRAMS[2]],
  },
  {
    id: "CLS-003",
    name: "The Arts",
    active: true,
    classType: "Transitional Living",
    budgetCategory: "Independent Living",
    description:
      "Transitional housing focused on preparing young adults for independent living.",
    comments: "Pre-assessment required before enrollment.",
    modules: [ALL_MODULES[3], ALL_MODULES[11]],
    programs: [ALL_PROGRAMS[1]],
  },
  {
    id: "CLS-004",
    name: "Post-Secondary Options",
    active: true,
    classType: "Crisis Care",
    budgetCategory: "Behavioral Health",
    description:
      "Short-term residential program offering crisis intervention and stabilization.",
    comments: "",
    modules: [ALL_MODULES[6], ALL_MODULES[4]],
    programs: [ALL_PROGRAMS[0], ALL_PROGRAMS[2]],
  },
  {
    id: "CLS-005",
    name: "Spiritual Development",
    active: true,
    classType: "Community Program",
    budgetCategory: "Family Support",
    description:
      "Community-based program providing education, counseling, and family support.",
    comments:
      "Partner with Chicago Urban League for job placements.",
    modules: [ALL_MODULES[2], ALL_MODULES[10], ALL_MODULES[4]],
    programs: [ALL_PROGRAMS[4], ALL_PROGRAMS[3]],
  },
  {
    id: "CLS-006",
    name: "Job Skills",
    active: true,
    classType: "Residential Treatment",
    budgetCategory: "Behavioral Health",
    description:
      "Therapeutic residential program with behavioral and mental health services.",
    comments: "Includes college campus visits each semester.",
    modules: [ALL_MODULES[8], ALL_MODULES[9], ALL_MODULES[11]],
    programs: [ALL_PROGRAMS[0], ALL_PROGRAMS[2]],
  },
  {
    id: "CLS-007",
    name: "Financial Literacy",
    active: false,
    classType: "Residental",
    budgetCategory: "Youth Service",
    description:
      "Long-term residential care with individualized treatment and educational support.",
    comments:
      "Retired – content merged into Life Skills Foundations.",
    modules: [ALL_MODULES[0]],
    programs: [ALL_PROGRAMS[0]],
  },
  {
    id: "CLS-008",
    name: "Career Exposure",
    active: true,
    classType: "Day Program",
    budgetCategory: "Community Service",
    description:
      "Day program offering mentoring, recreation, education, and life skills training.",
    comments: "",
    modules: [ALL_MODULES[7], ALL_MODULES[4]],
    programs: [ALL_PROGRAMS[2], ALL_PROGRAMS[4]],
  },
];

export const INITIAL_SESSIONS: ClassSession[] = [
  {
    id: "SES-001",
    classId: "CLS-001",
    comments: "",
    date: "06/09/2026",
    time: "3:00 PM",
    endDate: "06/09/2026",
    endTime: "4:30 PM",
    sessionMinutes: 90,
    campus: "West Loop Campus",
    otherLocation: "",
    partnerOrganization: "—",
    description:
      "Introduction to household budgeting and savings goals.",
    modules: [ALL_MODULES[0]],
    instructors: [ALL_INSTRUCTORS[0]],
    programs: [ALL_PROGRAMS[1]],
    participants: [],
    status: "Complete",
  },
  {
    id: "SES-002",
    classId: "CLS-001",
    comments: "",
    date: "06/11/2026",
    time: "3:00 PM",
    endDate: "06/11/2026",
    endTime: "4:30 PM",
    sessionMinutes: 90,
    campus: "West Loop Campus",
    otherLocation: "",
    partnerOrganization: "—",
    description:
      "Grocery shopping on a budget – hands-on activity.",
    modules: [ALL_MODULES[0], ALL_MODULES[4]],
    instructors: [ALL_INSTRUCTORS[0]],
    programs: [ALL_PROGRAMS[1]],
    participants: [],
    status: "Complete",
  },
  {
    id: "SES-003",
    classId: "CLS-002",
    comments: "",
    date: "06/10/2026",
    time: "10:00 AM",
    endDate: "06/10/2026",
    endTime: "11:30 AM",
    sessionMinutes: 90,
    campus: "West Loop Campus",
    otherLocation: "",
    partnerOrganization: "Thresholds",
    description:
      "Identifying personal triggers and early warning signs.",
    modules: [ALL_MODULES[1]],
    instructors: [ALL_INSTRUCTORS[1]],
    programs: [ALL_PROGRAMS[0], ALL_PROGRAMS[2]],
    participants: [],
    status: "Scheduled",
  },
  {
    id: "SES-004",
    classId: "CLS-002",
    comments: "",
    date: "06/12/2026",
    time: "10:00 AM",
    endDate: "06/12/2026",
    endTime: "11:30 AM",
    sessionMinutes: 90,
    campus: "West Loop Campus",
    otherLocation: "",
    partnerOrganization: "—",
    description:
      "De-escalation techniques and coping strategies.",
    modules: [ALL_MODULES[5], ALL_MODULES[7]],
    instructors: [ALL_INSTRUCTORS[1]],
    programs: [ALL_PROGRAMS[0]],
    participants: [],
    status: "Scheduled",
  },
  {
    id: "SES-005",
    classId: "CLS-003",
    comments: "",
    date: "06/09/2026",
    time: "1:00 PM",
    endDate: "06/09/2026",
    endTime: "2:30 PM",
    sessionMinutes: 90,
    campus: "Walsh Campus",
    otherLocation: "",
    partnerOrganization: "Chicago Public Schools",
    description:
      "Linear equations and systems of equations – practice sets.",
    modules: [ALL_MODULES[3]],
    instructors: [ALL_INSTRUCTORS[2]],
    programs: [ALL_PROGRAMS[0], ALL_PROGRAMS[1]],
    participants: [],
    status: "Complete",
  },
  {
    id: "SES-006",
    classId: "CLS-004",
    comments: "",
    date: "06/13/2026",
    time: "2:00 PM",
    endDate: "06/13/2026",
    endTime: "4:00 PM",
    sessionMinutes: 120,
    campus: "West Loop Campus",
    otherLocation: "",
    partnerOrganization: "—",
    description: "Mixed-media collage – self-portrait project.",
    modules: [ALL_MODULES[6]],
    instructors: [ALL_INSTRUCTORS[5]],
    programs: [
      ALL_PROGRAMS[0],
      ALL_PROGRAMS[1],
      ALL_PROGRAMS[2],
    ],
    participants: [],
    status: "Scheduled",
  },
  {
    id: "SES-007",
    classId: "CLS-005",
    comments: "",
    date: "06/17/2026",
    time: "2:00 PM",
    endDate: "06/17/2026",
    endTime: "3:30 PM",
    sessionMinutes: 90,
    campus: "Other",
    otherLocation:
      "Chicago Urban League – 4510 S. Michigan Ave",
    partnerOrganization: "Chicago Urban League",
    description: "Mock interview sessions with HR volunteers.",
    modules: [ALL_MODULES[10], ALL_MODULES[4]],
    instructors: [ALL_INSTRUCTORS[3]],
    programs: [ALL_PROGRAMS[1]],
    participants: [],
    status: "Scheduled",
  },
  {
    id: "SES-008",
    classId: "CLS-006",
    comments: "",
    date: "06/18/2026",
    time: "4:00 PM",
    endDate: "06/18/2026",
    endTime: "5:00 PM",
    sessionMinutes: 60,
    campus: "West Loop Campus",
    otherLocation: "",
    partnerOrganization: "City Colleges of Chicago",
    description:
      "Understanding FAFSA and Illinois financial aid options.",
    modules: [ALL_MODULES[8]],
    instructors: [ALL_INSTRUCTORS[2], ALL_INSTRUCTORS[4]],
    programs: [ALL_PROGRAMS[1]],
    participants: [],
    status: "Complete",
  },
];

// ─── Shared helpers ────────────────────────────────────────────────────────────

const inputCls = (err?: boolean) => ({
  height: "36px",
  width: "100%",
  padding: "0 12px",
  borderRadius: "4px",
  border: `1px solid ${err ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
  color: "var(--slds-g-color-text-default)",
  backgroundColor: "var(--slds-g-color-background-base)",
  fontSize: "13px",
  outline: "none",
});

// Editable = white; read-only (view mode) keeps the read-only background.
const textareaCls = (err?: boolean, readOnly?: boolean) => ({
  width: "100%",
  padding: "8px 12px",
  borderRadius: "4px",
  border: `1px solid ${err ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
  color: "var(--slds-g-color-text-default)",
  backgroundColor: readOnly
    ? "var(--slds-g-color-background-alt)"
    : "var(--slds-g-color-background-base)",
  fontSize: "13px",
  outline: "none",
  resize: "vertical" as const,
  lineHeight: "1.5",
  minHeight: "72px",
});

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      className="slds-form-label block mb-1.5"
      style={{ color: "var(--slds-g-color-text-weak)" }}
    >
      {children}{" "}
      {required && <span className="text-red-600">*</span>}
    </label>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 slds-text-3 font-medium"
      style={{
        backgroundColor: active ? "#D0E9DA" : "#FEF2F2",
        color: active ? "#1B5E20" : "#c23934",
        border: `1px solid ${active ? "#a3d4b5" : "#f5c6c6"}`,
        borderRadius: "9999px",
      }}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ─── Multi-select picker modal ─────────────────────────────────────────────────

function PickerModal({
  open,
  onClose,
  title,
  description,
  items,
  selectedIds,
  onApply,
  searchPlaceholder = "Search",
  classOptions,
  classByItemId,
  onAddItem,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  items: { id: string; label: string; sublabel?: string }[];
  selectedIds: string[];
  /** Save: the ticked ids. Cancel/close discards the ticks. */
  onApply: (ids: string[]) => void;
  searchPlaceholder?: string;
  classOptions?: { id: string; name: string }[];
  classByItemId?: Record<string, string>;
  onAddItem?: (module: LMLearningModule) => void;
}) {
  const [q, setQ] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  // Ticks are a draft: applied on Save, discarded on Cancel
  const [draftIds, setDraftIds] =
    useState<string[]>(selectedIds);
  React.useEffect(() => {
    if (open) setDraftIds(selectedIds);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const toggleDraft = (id: string) =>
    setDraftIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id],
    );
  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const matchesSearch =
          !q ||
          i.label.toLowerCase().includes(q.toLowerCase()) ||
          (i.sublabel || "")
            .toLowerCase()
            .includes(q.toLowerCase());
        const matchesClass =
          !classOptions ||
          filterClass === "all" ||
          classByItemId?.[i.id] === filterClass;
        return matchesSearch && matchesClass;
      }),
    [items, q, filterClass, classOptions, classByItemId],
  );
  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) {
            setQ("");
            onClose();
          }
        }}
      >
        <DialogContent
          className="sm:max-w-xl max-h-[calc(100vh-32px)] flex flex-col gap-0 p-0 rounded-lg shadow-lg"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dddbda",
          }}
        >
          <DialogHeader
            className="px-6 py-4"
            style={{
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <DialogTitle
                  className="slds-text-6 font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {title}
                </DialogTitle>

                {description && (
                  <DialogDescription
                    className="slds-text-3 mt-0.5"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    {description}
                  </DialogDescription>
                )}
              </div>

              {onAddItem && (
                <Button
                  size="sm"
                  className="h-7 px-3 mr-8 rounded-full flex items-center gap-1.5 flex-shrink-0 text-white text-[12px] font-medium"
                  style={{ backgroundColor: "#145F33" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "#0e4524")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "#145F33")
                  }
                  onClick={() => setIsAddOpen(true)}
                >
                  <Plus className="h-3 w-3" />
                  New Module
                </Button>
              )}
            </div>
          </DialogHeader>
          <div
            className="flex-1 space-y-2 px-6 py-6"
            style={{
              backgroundColor: "#ffffff",
            }}
          >
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder}
                style={{
                  ...inputCls(),
                  paddingLeft: "32px",
                  paddingRight: q ? "32px" : "12px",
                }}
              />
              {q && (
                <button
                  className="absolute right-2.5 top-1/2 -translate-y-1/2"
                  onClick={() => setQ("")}
                >
                  <X
                    className="h-3.5 w-3.5"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                </button>
              )}
            </div>
          </div>
          <div className="px-5 pb-1 flex items-center justify-between">
            <span
              className="slds-text-3 font-semibold uppercase tracking-wide"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Learning Modules
            </span>
          </div>
          {classByItemId && (
            <div
              className="mx-5 flex items-center gap-3 px-3 py-1.5"
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
                borderRadius: "4px 4px 0 0",
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <div className="h-4 w-4 flex-shrink-0" />
              <p
                className="slds-text-3 font-semibold uppercase tracking-wide flex-1 min-w-0 border-b-0"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                  borderBottom: "0",
                }}
              >
                Learning Modules
              </p>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-1">
            {filtered.length === 0 ? (
              <div className="py-10 text-center">
                <p
                  className="slds-text-4 font-medium"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {classOptions
                    ? "No Learning Modules Found"
                    : "No results found."}
                </p>
                {classOptions && (
                  <p
                    className="slds-text-3 mt-1"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Try adjusting your Class filter or search
                    criteria.
                  </p>
                )}
              </div>
            ) : (
              filtered
                .filter(
                  (item, idx, arr) =>
                    arr.findIndex((i) => i.id === item.id) ===
                    idx,
                )
                .map((item) => {
                  const selected = draftIds.includes(item.id);
                  const className = classByItemId?.[item.id];
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleDraft(item.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors text-left"
                      style={{
                        backgroundColor: selected
                          ? "#f0faf4"
                          : "transparent",
                        border: `1px solid ${selected ? "#a3d4b5" : "var(--slds-g-color-border-base-1)"}`,
                      }}
                      onMouseEnter={(e) => {
                        if (!selected)
                          (
                            e.currentTarget as HTMLElement
                          ).style.backgroundColor =
                            "var(--slds-g-color-background-alt-2)";
                      }}
                      onMouseLeave={(e) => {
                        if (!selected)
                          (
                            e.currentTarget as HTMLElement
                          ).style.backgroundColor =
                            "transparent";
                      }}
                    >
                      <div
                        className="h-4 w-4 flex-shrink-0 rounded flex items-center justify-center"
                        style={{
                          border: `1.5px solid ${selected ? "#145F33" : "var(--slds-g-color-border-base-1)"}`,
                          backgroundColor: selected
                            ? "#145F33"
                            : "transparent",
                        }}
                      >
                        {selected && (
                          <Check className="h-2.5 w-2.5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="slds-text-4 font-medium truncate"
                          style={{
                            color: selected
                              ? "#145F33"
                              : "var(--slds-g-color-text-default)",
                          }}
                        >
                          {item.label}
                        </p>
                        {item.sublabel && (
                          <p
                            className="slds-text-3 truncate"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {item.sublabel}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
            )}
          </div>
          <DialogFooter
            className="px-6 py-3 flex items-center justify-between"
            style={{
              borderTop:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            <Button
              variant="outline"
              className="h-9 px-4 rounded-full slds-text-4"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
                fontWeight: 500,
              }}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="h-9 px-5 rounded-full slds-text-4 font-medium text-white"
              style={{ backgroundColor: "#145F33" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#0e4524")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#145F33")
              }
              onClick={() => {
                onApply(draftIds);
                setQ("");
                onClose();
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LMModuleModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        editing={null}
        onSave={(m) => {
          // New module joins the list ticked; it is applied with Save
          onAddItem?.(m);
          setDraftIds((prev) => [...prev, m.id]);
        }}
      />
    </>
  );
}

// ─── Class Form Modal ─────────────────────────────────────────────────────────

const emptyClassForm = (): Partial<ClassRecord> => ({
  name: "",
  description: "",
  comments: "",
  classType: undefined,
  budgetCategory: undefined,
  active: true,
  modules: [],
  programs: [],
});

function ClassModal({
  open,
  onClose,
  editing,
  onSave,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  editing: ClassRecord | null;
  onSave: (data: ClassRecord) => void;
  onDelete: (id: string) => void;
}) {
  const [form, setForm] =
    useState<Partial<ClassRecord>>(emptyClassForm);
  const [errors, setErrors] = useState<Record<string, boolean>>(
    {},
  );
  const [isManageModulesOpen, setIsManageModulesOpen] =
    useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [localModules, setLocalModules] = useState<
    LearningModule[]
  >([]);

  React.useEffect(() => {
    if (open) {
      setForm(editing ? { ...editing } : emptyClassForm());
      setErrors({});
      setIsConfirmDelete(false);
    }
  }, [open, editing]);

  const set = (k: keyof ClassRecord, v: unknown) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: false }));
  };

  const handleSave = () => {
    const errs: Record<string, boolean> = {};
    if (!form.name?.trim()) errs.name = true;
    if (!form.description?.trim()) errs.description = true;
    if (!form.classType) errs.classType = true;
    if (!form.budgetCategory) errs.budgetCategory = true;
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSave({
      id:
        editing?.id ??
        `CLS-${String(++_classIdCounter).padStart(3, "0")}`,
      name: form.name!,
      description: form.description!,
      comments: form.comments || "",
      classType: form.classType!,
      budgetCategory: form.budgetCategory!,
      active: form.active ?? true,
      modules: form.modules ?? [],
      programs: form.programs ?? [],
    });
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) onClose();
        }}
      >
        <DialogContent
          className="sm:max-w-4xl p-0 gap-0 flex flex-col"
          style={{
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            maxHeight: "90vh",
          }}
        >
          <DialogHeader
            className="px-6 py-4"
            style={{
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 flex items-center justify-center text-white flex-shrink-0"
                style={{
                  borderRadius:
                    "var(--slds-c-card-radius-border)",
                  backgroundColor: "var(--color-brand-primary)",
                }}
              >
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle
                  className="slds-text-6 font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {editing ? "Edit Class" : "New Class"}
                </DialogTitle>
                <DialogDescription
                  className="slds-text-3 mt-0.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  {editing
                    ? `Editing ${editing.name}`
                    : "Create a new class record"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div
            className="flex-1 overflow-y-auto px-6 py-6 space-y-4"
            style={{
              backgroundColor: "#ffffff",
            }}
          >
            {/* Name */}
            <div>
              <FieldLabel required>Name</FieldLabel>
              <input
                value={form.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Enter class name"
                style={inputCls(errors.name)}
              />
              {errors.name && (
                <p
                  className="slds-text-3 mt-1"
                  style={{ color: "#c23934" }}
                >
                  Name is required.
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <FieldLabel required>Description</FieldLabel>
              <textarea
                value={form.description ?? ""}
                onChange={(e) =>
                  set("description", e.target.value)
                }
                placeholder="Describe the class objectives and content"
                rows={3}
                style={textareaCls(errors.description)}
              />
              {errors.description && (
                <p
                  className="slds-text-3 mt-1"
                  style={{ color: "#c23934" }}
                >
                  Description is required.
                </p>
              )}
            </div>

            {/* Comments */}
            <div>
              <FieldLabel>Comments</FieldLabel>
              <textarea
                value={form.comments ?? ""}
                onChange={(e) =>
                  set("comments", e.target.value)
                }
                placeholder="Internal notes or enrollment guidance"
                rows={2}
                style={textareaCls()}
              />
            </div>

            {/* Type / Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Class Type</FieldLabel>

                <Select
                  value={form.classType ?? ""}
                  onValueChange={(v) => set("classType", v)}
                >
                  <SelectTrigger
                    className="h-9 w-full slds-text-4"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  >
                    <SelectValue placeholder="Please Select" />
                  </SelectTrigger>

                  <SelectContent>
                    {CLASS_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.classType && (
                  <p
                    className="slds-text-3 mt-1"
                    style={{ color: "#c23934" }}
                  >
                    Class type is required.
                  </p>
                )}
              </div>
              <div>
                <FieldLabel required>
                  Budget Category
                </FieldLabel>

                <Select
                  value={form.budgetCategory ?? ""}
                  onValueChange={(v) =>
                    set("budgetCategory", v)
                  }
                >
                  <SelectTrigger
                    className="h-9 w-full slds-text-4"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  >
                    <SelectValue placeholder="Please Select" />
                  </SelectTrigger>

                  <SelectContent>
                    {BUDGET_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.budgetCategory && (
                  <p
                    className="slds-text-3 mt-1"
                    style={{ color: "#c23934" }}
                  >
                    Budget category is required.
                  </p>
                )}
              </div>
            </div>

            {/* Active */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => set("active", !form.active)}
                className="h-4 w-4 rounded flex items-center justify-center transition-colors"
                style={{
                  border: `1.5px solid ${form.active ? "#145F33" : "var(--slds-g-color-border-base-1)"}`,
                  backgroundColor: form.active
                    ? "#145F33"
                    : "transparent",
                }}
              >
                {form.active && (
                  <Check className="h-2.5 w-2.5 text-white" />
                )}
              </button>
              <span
                className="slds-text-4"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Active
              </span>
            </div>

            {/* Learning Modules */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  LEARNING MODULES
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-3 rounded-full slds-text-3 font-medium"
                  style={{
                    border:
                      "1px solid var(--color-brand-primary)",
                    color: "var(--color-brand-primary)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(20,95,51,0.06)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "transparent")
                  }
                  onClick={() => setIsManageModulesOpen(true)}
                >
                  <Plus className="h-3 w-3" /> Manage Modules
                </Button>
              </div>
              <div
                className="rounded overflow-hidden"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-alt-2)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <th
                        className="px-3 py-2 text-left slds-text-3 font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Module Name
                      </th>
                      <th className="px-3 py-2 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {(form.modules ?? []).length === 0 ? (
                      <tr>
                        <td
                          colSpan={2}
                          className="px-3 py-4 text-center slds-text-3"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          No modules added. Click Manage Modules
                          to add.
                        </td>
                      </tr>
                    ) : (
                      (form.modules ?? []).map((m) => (
                        <tr
                          key={m.id}
                          style={{
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <td
                            className="px-3 py-2 slds-text-4"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {m.name}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              title="Delete"
                              onClick={() =>
                                set(
                                  "modules",
                                  (form.modules ?? []).filter(
                                    (x) => x.id !== m.id,
                                  ),
                                )
                              }
                              className="cursor-pointer p-1.5 rounded transition-colors flex-shrink-0"
                              style={{
                                color: "#c23934",
                                backgroundColor: "transparent",
                                width: "36",
                                height: "36",
                                borderRadius: "9999",
                                border: "none",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) => {
                                (
                                  e.currentTarget as HTMLElement
                                ).style.color = "#c23934";
                                (
                                  e.currentTarget as HTMLElement
                                ).style.backgroundColor =
                                  "rgba(194, 57, 52, 0.08)";
                              }}
                              onMouseLeave={(e) => {
                                (
                                  e.currentTarget as HTMLElement
                                ).style.color = "#c23934";
                                (
                                  e.currentTarget as HTMLElement
                                ).style.backgroundColor =
                                  "transparent";
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <DialogFooter
            className="px-6 py-3 flex items-center justify-between"
            style={{
              borderTop:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            <div>
              {isConfirmDelete && (
                <div className="flex items-center gap-2">
                  <span
                    className="slds-text-3"
                    style={{ color: "#c23934" }}
                  >
                    Delete this class?
                  </span>
                  <Button
                    size="sm"
                    className="h-8 px-3 rounded-full slds-text-3 font-medium text-white"
                    style={{ backgroundColor: "#c23934" }}
                    onClick={() => {
                      onDelete(editing!.id);
                      onClose();
                    }}
                  >
                    Yes, delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 rounded-full slds-text-4"
                    style={{
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                      color: "080707",
                      fontWeight: 500,
                    }}
                    onClick={() => setIsConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-9 px-4 rounded-full slds-text-4"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                  fontWeight: 500,
                }}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className="h-9 px-5 rounded-full slds-text-4 font-medium text-white"
                style={{ backgroundColor: "#145F33" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "#0e4524")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "#145F33")
                }
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PickerModal
        open={isManageModulesOpen}
        onClose={() => setIsManageModulesOpen(false)}
        title="Manage Learning Modules"
        description="Select modules to associate with this class."
        items={[...ALL_MODULES, ...localModules].map((m) => ({
          id: m.id,
          label: m.name,
        }))}
        selectedIds={(form.modules ?? []).map((m) => m.id)}
        onApply={(ids) =>
          set(
            "modules",
            applySelection(
              form.modules,
              [...ALL_MODULES, ...localModules],
              ids,
            ),
          )
        }
        onAddItem={(module) => {
          setLocalModules((prev) => [
            ...prev,
            { id: module.id, name: module.name },
          ]);
        }}
        searchPlaceholder="Search modules..."
      />
    </>
  );
}

// ─── View Class Modal ─────────────────────────────────────────────────────────

function ViewClassModal({
  open,
  onClose,
  cls,
}: {
  open: boolean;
  onClose: () => void;
  cls: ClassRecord | null;
}) {
  if (!cls) return null;
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        className="max-w-xl max-h-[85vh] flex flex-col p-0"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          border: "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <DialogHeader
          className="px-6 pt-6 pb-4"
          style={{
            paddingRight: "48px",
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 flex items-center justify-center text-white flex-shrink-0"
                style={{
                  borderRadius:
                    "var(--slds-c-card-radius-border)",
                  backgroundColor: "var(--color-brand-primary)",
                }}
              >
                <GraduationCap className="h-5 w-5" />
              </div>

              <div>
                <DialogTitle
                  className="slds-text-6 font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {cls.name}
                </DialogTitle>

                <DialogDescription
                  className="slds-text-3 mt-0.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  {cls.id}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {[
            { label: "Description", value: cls.description },
            { label: "Comments", value: cls.comments || "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p
                className="slds-form-label mb-0.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {label.toUpperCase()}
              </p>
              <p
                className="slds-text-4"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {value}
              </p>
            </div>
          ))}
          {/* Status field — above Class Type */}
          <div>
            <p
              className="slds-form-label mb-1"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              STATUS
            </p>
            <div className="pt-1">
              <ActiveBadge active={cls.active} />
            </div>
          </div>
          {[
            { label: "Class Type", value: cls.classType },
            {
              label: "Budget Category",
              value: cls.budgetCategory,
            },
          ].map(({ label, value }) => (
            <div key={label}>
              <p
                className="slds-form-label mb-0.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {label.toUpperCase()}
              </p>
              <p
                className="slds-text-4"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {value}
              </p>
            </div>
          ))}
          <div>
            <p
              className="slds-form-label mb-2"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              LEARNING MODULES ({cls.modules.length})
            </p>
            {cls.modules.length === 0 ? (
              <p
                className="slds-text-4"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                No modules assigned.
              </p>
            ) : (
              <div className="space-y-1">
                {cls.modules.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 px-3 py-2 rounded"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-alt-2)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <BookOpen
                      className="h-3.5 w-3.5 flex-shrink-0"
                      style={{
                        color: "var(--color-brand-primary)",
                      }}
                    />
                    <span
                      className="slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {m.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter
          className="px-6 py-4"
          style={{
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <Button
            variant="outline"
            className="h-9 px-4 rounded-full slds-text-4 font-medium"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
              color: "var(--slds-g-color-text-weak)",
            }}
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Session Form Modal ────────────────────────────────────────────────────────

const emptySessionForm = (
  classId: string,
): Partial<ClassSession> => ({
  classId,
  description: "",
  comments: "",
  date: "",
  time: "",
  endDate: "",
  endTime: "",
  sessionMinutes: 60,
  campus: undefined,
  otherLocation: "",
  partnerOrganization: "—",
  modules: [],
  instructors: [],
  programs: [],
  participants: [],
  status: "Scheduled",
});

/** Picker result: keeps selected items that aren't in `options` (e.g. from
 *  older records) and replaces the rest with the ticked `ids`. */
function applySelection<T extends { id: string }>(
  current: T[] | undefined,
  options: T[],
  ids: string[],
): T[] {
  const inOptions = new Set(options.map((o) => o.id));
  return [
    ...(current ?? []).filter((c) => !inOptions.has(c.id)),
    ...options.filter((o) => ids.includes(o.id)),
  ];
}

/** Associates a newly created Learning Module with its Class in the shared
 *  class data, so the Class keeps it beyond the current form. */
export function addModuleToClass(
  classId: string,
  module: LearningModule,
): void {
  const i = INITIAL_CLASSES.findIndex((c) => c.id === classId);
  if (
    i < 0 ||
    INITIAL_CLASSES[i].modules.some((m) => m.id === module.id)
  )
    return;
  INITIAL_CLASSES[i] = {
    ...INITIAL_CLASSES[i],
    modules: [...INITIAL_CLASSES[i].modules, module],
  };
}

// ─── Class Session form (shared) ──────────────────────────────────────────────
// State + handlers of the Class Session form. Used by the New Session modal
// and by the Connection modal when Type = Class Session (US 20051), so both
// render the same fields and rules.
export function useClassSessionForm({
  open,
  editing,
  parentClass,
  allClasses,
  onModuleCreated,
  connectionRules = false,
  readOnly = false,
}: {
  open: boolean;
  editing: ClassSession | null;
  parentClass?: ClassRecord;
  allClasses: ClassRecord[];
  /** Connection modal, Type = Class Session (US 20051): Class Name on the
   *  Connection tab; Program(s), Participants and Facilitator(s) required;
   *  Location optional; active Programs only. Off = Classes > New Session
   *  (US 20038) rules, unchanged. */
  connectionRules?: boolean;
  /** View mode: every field read-only. */
  readOnly?: boolean;
  /** A module created from "+ New Module" — associate it with its Class. */
  onModuleCreated?: (
    classId: string,
    module: LearningModule,
  ) => void;
}) {
  const [form, setForm] = useState<Partial<ClassSession>>(
    emptySessionForm(parentClass?.id ?? ""),
  );
  const [errors, setErrors] = useState<Record<string, boolean>>(
    {},
  );
  const [isPickerOpen, setIsPickerOpen] = useState<
    "modules" | "programs" | null
  >(null);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  // Modules created from "+ New Module", tagged with the class they belong to
  const [extraModules, setExtraModules] = useState<
    (LearningModule & { classId: string })[]
  >([]);
  // Class picked while modules are selected — waits for confirmation
  const [pendingClassId, setPendingClassId] = useState<
    string | null
  >(null);
  const [sessionTab, setSessionTab] = useState<
    "connection" | "details"
  >("connection");
  const [participants, setParticipants] = useState<
    SessionParticipant[]
  >([]);
  const [addPartOpen, setAddPartOpen] = useState(false);
  const [editingPart, setEditingPart] =
    useState<SessionParticipant | null>(null);
  const [partForm, setPartForm] = useState<
    Partial<SessionParticipant>
  >({});

  React.useEffect(() => {
    if (open) {
      setForm(
        editing
          ? { ...editing }
          : emptySessionForm(parentClass?.id ?? ""),
      );
      setErrors({});
      setIsConfirmDelete(false);
      setExtraModules([]);
      setPendingClassId(null);
      setSessionTab("connection");
      setParticipants(editing?.participants ?? []);
    }
  }, [open, editing, parentClass?.id]);

  const set = (k: keyof ClassSession, v: unknown) => {
    setForm((f) => ({ ...f, [k]: v }));
    const dateTime = [
      "date",
      "time",
      "endDate",
      "endTime",
    ].includes(k);
    if (errors[k as string] || (dateTime && errors.endRange))
      setErrors((e) => ({
        ...e,
        [k]: false,
        ...(dateTime && { endRange: false }),
      }));
  };

  // Class the session belongs to: an edited session keeps its own class;
  // a new session uses the parent class (Sessions view) or the Details pick.
  const lockedClassId = editing?.classId ?? parentClass?.id;
  const sessionClassId = lockedClassId ?? form.classId;
  const selectedClass = allClasses.find(
    (cls) => cls.id === sessionClassId,
  );
  const activeClasses = useMemo(
    () => allClasses.filter((cls) => cls.active),
    [allClasses],
  );
  // Learning Modules always come from the selected Class
  const classModules = useMemo<LearningModule[]>(
    () =>
      sessionClassId
        ? [
            ...(selectedClass?.modules ?? []),
            ...extraModules.filter(
              (m) =>
                m.classId === sessionClassId &&
                !selectedClass?.modules.some(
                  (c) => c.id === m.id,
                ),
            ),
          ]
        : [],
    [sessionClassId, selectedClass, extraModules],
  );
  // Programs come from the Program Log program list
  const programOptions = useMemo<Program[]>(
    () =>
      MOCK_PROGRAMS.filter(
        (p) => !connectionRules || p.status === "Active",
      ).map((p) => ({ id: p.id, name: p.name })),
    [connectionRules],
  );
  // Classes instructors plus Instructor constituents (US 20096). A
  // constituent already linked to a Classes instructor id is represented by
  // that id, never duplicated; others use their stable Constituent ID.
  const linkedConstituents = new Set(
    Object.values(INSTRUCTOR_CONSTITUENT_LINKS),
  );
  const instructorOptions: Instructor[] = [
    ...ALL_INSTRUCTORS,
    ...CONSTITUENTS.filter(
      (c) =>
        c.type === "Individual" &&
        c.role === "Instructor" &&
        !linkedConstituents.has(c.id),
    ).map((c) => ({
      id: constituentInstructorId(c.id),
      name: c.name,
      title: "",
    })),
  ];

  // Selected modules belong to the previous Class, so changing it asks first
  const handleClassChange = (classId: string) => {
    if (classId === form.classId) return;
    // Open the confirm after the Class Select has closed and restored focus;
    // opened during that close, the confirm would dismiss itself at once.
    if ((form.modules ?? []).length > 0)
      setTimeout(() => setPendingClassId(classId));
    else set("classId", classId);
  };
  const confirmClassChange = () => {
    if (!pendingClassId) return;
    setForm((f) => ({
      ...f,
      classId: pendingClassId,
      modules: [],
    }));
    setErrors((e) => ({ ...e, classId: false }));
    setPendingClassId(null);
  };

  /** Required-field check; on failure shows the errors and returns false. */
  const validate = (): boolean => {
    const errs: Record<string, boolean> = {};
    if (!sessionClassId) errs.classId = true;
    if (!form.description?.trim()) errs.description = true;
    if (!form.date?.trim()) errs.date = true;
    if (!form.time?.trim()) errs.time = true;
    if (!form.endDate?.trim()) errs.endDate = true;
    if (!form.endTime?.trim()) errs.endTime = true;
    if (!connectionRules && !form.campus) errs.campus = true;
    if (!form.status) errs.status = true;
    if (connectionRules) {
      if (!(form.programs ?? []).length) errs.programs = true;
      if (!participants.length) errs.participants = true;
      if (!(form.instructors ?? []).length)
        errs.instructors = true;
    }
    const start = parseConnectionStart(form.date, form.time);
    const end = parseConnectionStart(
      form.endDate,
      form.endTime,
    );
    // 20051: End may equal Start (only "before" is invalid).
    if (
      start &&
      end &&
      (connectionRules ? end < start : end <= start)
    )
      errs.endRange = true;
    if (Object.keys(errs).length) {
      setErrors(errs);
      // Class Name lives on the Details tab — surface it when it is the only miss
      if (errs.classId && Object.keys(errs).length === 1)
        setSessionTab("details");
      return false;
    }
    return true;
  };

  /** The session as entered — call after validate(). */
  const buildSession = (): ClassSession => ({
    id:
      editing?.id ??
      `SES-${String(++_sessionIdCounter).padStart(3, "0")}`,
    classId: sessionClassId!,
    description: form.description!,
    comments: form.comments || "",
    date: form.date!,
    time: form.time!,
    endDate: form.endDate!,
    endTime: form.endTime!,
    sessionMinutes: form.sessionMinutes ?? 60,
    campus: form.campus as TeachingCampus,
    otherLocation: form.otherLocation || "",
    partnerOrganization: form.partnerOrganization || "—",
    modules: form.modules ?? [],
    instructors: form.instructors ?? [],
    programs: form.programs ?? [],
    participants: participants,
    status: form.status ?? "Scheduled",
  });

  const toggleItem = <T extends { id: string }>(
    field: keyof ClassSession,
    all: T[],
    id: string,
  ) => {
    const current = (form[field] as T[]) ?? [];
    if (current.find((x) => x.id === id))
      set(
        field,
        current.filter((x) => x.id !== id),
      );
    else {
      const item = all.find((x) => x.id === id);
      if (item) set(field, [...current, item]);
    }
  };

  return {
    open,
    editing,
    parentClass,
    allClasses,
    onModuleCreated,
    form,
    setForm,
    errors,
    setErrors,
    isPickerOpen,
    setIsPickerOpen,
    isConfirmDelete,
    setIsConfirmDelete,
    extraModules,
    setExtraModules,
    pendingClassId,
    setPendingClassId,
    sessionTab,
    setSessionTab,
    participants,
    setParticipants,
    addPartOpen,
    setAddPartOpen,
    editingPart,
    setEditingPart,
    partForm,
    setPartForm,
    set,
    lockedClassId,
    sessionClassId,
    selectedClass,
    activeClasses,
    classModules,
    programOptions,
    handleClassChange,
    confirmClassChange,
    toggleItem,
    validate,
    buildSession,
    connectionRules,
    readOnly,
    instructorOptions,
  };
}

export type ClassSessionForm = ReturnType<
  typeof useClassSessionForm
>;

/** Connection tab: Session Description, dates, Location, Programs,
 *  Participants and Learning Modules. */
export function ClassSessionConnectionFields({
  f,
}: {
  f: ClassSessionForm;
}) {
  const {
    open,
    editing,
    parentClass,
    allClasses,
    onModuleCreated,
    form,
    setForm,
    errors,
    setErrors,
    isPickerOpen,
    setIsPickerOpen,
    isConfirmDelete,
    setIsConfirmDelete,
    extraModules,
    setExtraModules,
    pendingClassId,
    setPendingClassId,
    sessionTab,
    setSessionTab,
    participants,
    setParticipants,
    addPartOpen,
    setAddPartOpen,
    editingPart,
    setEditingPart,
    partForm,
    setPartForm,
    set,
    lockedClassId,
    sessionClassId,
    selectedClass,
    activeClasses,
    classModules,
    programOptions,
    handleClassChange,
    confirmClassChange,
    toggleItem,
    validate,
    buildSession,
  } = f;
  return (
    <>
      {f.connectionRules && <ClassNameField f={f} />}

      {/* SESSION DESCRIPTION */}
      <div>
        <FieldLabel required>Session Description</FieldLabel>
        <textarea
          value={form.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          placeholder="What will be covered in this session?"
          rows={3}
          disabled={f.readOnly}
          style={textareaCls(errors.description, f.readOnly)}
        />
        {errors.description && (
          <p
            className="slds-text-3 mt-1"
            style={{ color: "#c23934" }}
          >
            Description is required.
          </p>
        )}
      </div>

      {/* START DATE / START TIME */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Start Date</FieldLabel>
          <DateInput
            value={form.date ?? ""}
            onChange={(v) => set("date", v)}
            className={
              errors.date
                ? "border-[#c23934] focus-visible:ring-[#c23934]"
                : undefined
            }
          />
        </div>
        <div>
          <FieldLabel required>Start Time</FieldLabel>
          <TimeInput
            value={form.time ?? ""}
            onChange={(v) => set("time", v)}
            placeholder="hh:mm AM/PM"
            surface="base"
            className={
              errors.time
                ? "border-[#c23934] focus-visible:ring-[#c23934]"
                : undefined
            }
          />
        </div>
      </div>

      {/* END DATE / END TIME */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel required>End Date</FieldLabel>
          <DateInput
            value={form.endDate ?? ""}
            onChange={(v) => set("endDate", v)}
            className={
              errors.endDate
                ? "border-[#c23934] focus-visible:ring-[#c23934]"
                : undefined
            }
          />
        </div>
        <div>
          <FieldLabel required>End Time</FieldLabel>
          <TimeInput
            value={form.endTime ?? ""}
            onChange={(v) => set("endTime", v)}
            placeholder="hh:mm AM/PM"
            surface="base"
            className={
              errors.endTime
                ? "border-[#c23934] focus-visible:ring-[#c23934]"
                : undefined
            }
          />
        </div>
      </div>

      {(errors.date ||
        errors.time ||
        errors.endDate ||
        errors.endTime) && (
        <p
          className="slds-text-3 -mt-3"
          style={{ color: "#c23934" }}
        >
          Start Date, Start Time, End Date and End Time are
          required.
        </p>
      )}
      {errors.endRange && (
        <p
          className="slds-text-3 -mt-3"
          style={{ color: "#c23934" }}
        >
          {f.connectionRules
            ? "End Date and End Time cannot be before Start Date and Start Time."
            : "End Date and End Time must be later than Start Date and Start Time."}
        </p>
      )}

      {/* STATUS / LOCATION */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel required={!f.connectionRules}>
            Location
          </FieldLabel>
          <Select
            value={form.campus ?? ""}
            onValueChange={(v) => set("campus", v)}
          >
            <SelectTrigger
              className="h-9 w-full slds-text-4"
              style={{
                border: `1px solid ${errors.campus ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
              }}
            >
              <SelectValue placeholder="Please Select" />
            </SelectTrigger>
            <SelectContent>
              {TEACHING_CAMPUSES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.campus && (
            <p
              className="slds-text-3 mt-1"
              style={{ color: "#c23934" }}
            >
              Location is required.
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop:
            "1px solid var(--slds-g-color-border-base-1)",
        }}
      />

      {/* ── PROGRAMS ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users
              className="h-4 w-4"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            />
            <span
              className="slds-text-4 font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Programs
              {f.connectionRules && (
                <span className="text-red-600"> *</span>
              )}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 rounded-full slds-text-3 font-medium"
            style={{
              border: "1px solid var(--color-brand-primary)",
              color: "var(--color-brand-primary)",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "rgba(20,95,51,0.06)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "transparent")
            }
            onClick={() => setIsPickerOpen("programs")}
          >
            <Plus className="h-3 w-3" /> Add Programs
          </Button>
        </div>
        <div
          className="rounded overflow-hidden"
          style={{
            border:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          {(form.programs ?? []).length === 0 ? (
            <div
              className="px-3 py-3 slds-text-3 text-center"
              style={{
                color: "var(--slds-g-color-text-weak)",
              }}
            >
              No programs assigned.
            </div>
          ) : (
            <table className="w-full">
              <tbody>
                {(form.programs ?? []).map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom:
                        idx < (form.programs ?? []).length - 1
                          ? "1px solid var(--slds-g-color-border-base-1)"
                          : "none",
                    }}
                  >
                    <td
                      className="px-3 py-2 slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {item.name}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        title="Remove"
                        onClick={() =>
                          set(
                            "programs",
                            (form.programs ?? []).filter(
                              (x) => x.id !== item.id,
                            ),
                          )
                        }
                        className="p-1 rounded"
                        style={{ color: "#c23934" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "#fef2f2")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {errors.programs && (
          <p
            className="slds-text-3 mt-1"
            style={{ color: "#c23934" }}
          >
            At least one Program is required.
          </p>
        )}
      </div>

      {/* ── PARTICIPANTS ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users
              className="h-4 w-4"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            />
            <span
              className="slds-text-4 font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Participants
              {f.connectionRules && (
                <span className="text-red-600"> *</span>
              )}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 rounded-full slds-text-3 font-medium"
            style={{
              border: "1px solid var(--color-brand-primary)",
              color: "var(--color-brand-primary)",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "rgba(20,95,51,0.06)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "transparent")
            }
            onClick={() => {
              setEditingPart(null);
              setPartForm({
                type: "Constituent",
                role: "",
                isOrganizer: false,
                attended: null,
                reasonMissed: "",
                otherReason: "",
              });
              setAddPartOpen(true);
            }}
          >
            <Plus className="h-3 w-3" /> Add Participant
          </Button>
        </div>
        <div
          className="rounded overflow-hidden"
          style={{
            border:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          {participants.length === 0 ? (
            <div
              className="px-3 py-3 slds-text-3 text-center"
              style={{
                color: "var(--slds-g-color-text-weak)",
              }}
            >
              No participants added.
            </div>
          ) : (
            <table
              className="w-full"
              style={{ tableLayout: "fixed" }}
            >
              <thead
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <tr
                  style={{
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  {[
                    "TYPE",
                    "PARTICIPANT",
                    "ROLE",
                    "ORGANIZER",
                    "ATTENDED",
                    "REASON MISSED",
                    "COMMENT",
                    "ACTIONS",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-2 py-2 slds-text-3 font-semibold text-left"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        width:
                          col === "PARTICIPANT"
                            ? "18%"
                            : col === "ACTIONS"
                              ? "72px"
                              : col === "REASON MISSED"
                                ? "14%"
                                : "auto",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {participants.map((p, idx) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom:
                        idx < participants.length - 1
                          ? "1px solid var(--slds-g-color-border-base-1)"
                          : "none",
                    }}
                  >
                    <td
                      className="px-2 py-2 slds-text-3"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {p.isOrganizer && (
                          <span
                            style={{
                              color: "#f59e0b",
                            }}
                          >
                            ★
                          </span>
                        )}
                        {p.type}
                      </div>
                    </td>
                    <td
                      className="px-2 py-2 slds-text-4 font-medium truncate"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {p.name}
                    </td>
                    <td
                      className="px-2 py-2 slds-text-3"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {p.role || "—"}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div
                        className="h-4 w-4 rounded inline-flex items-center justify-center mx-auto"
                        style={{
                          border: `1.5px solid ${p.isOrganizer ? "#145F33" : "var(--slds-g-color-border-base-1)"}`,
                          backgroundColor: p.isOrganizer
                            ? "#145F33"
                            : "transparent",
                        }}
                      >
                        {p.isOrganizer && (
                          <Check className="h-2.5 w-2.5 text-white" />
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div
                        className="h-4 w-4 rounded inline-flex items-center justify-center mx-auto"
                        style={{
                          border: `1.5px solid ${p.attended ? "#145F33" : "var(--slds-g-color-border-base-1)"}`,
                          backgroundColor: p.attended
                            ? "#145F33"
                            : "transparent",
                        }}
                      >
                        {p.attended && (
                          <Check className="h-2.5 w-2.5 text-white" />
                        )}
                      </div>
                    </td>
                    <td
                      className="px-2 py-2 slds-text-3 truncate"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {p.reasonMissed
                        ? p.reasonMissed === "Other" &&
                          p.otherReason
                          ? `Other - ${p.otherReason}`
                          : p.reasonMissed
                        : "—"}
                    </td>
                    <td
                      className="px-2 py-2 slds-text-3 truncate"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {p.comment || "—"}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          title="Edit"
                          onClick={() => {
                            setEditingPart(p);
                            setPartForm({ ...p });
                            setAddPartOpen(true);
                          }}
                          className="p-1 rounded"
                          style={{ color: "#0176d3" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "#e8f4fd")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title="Remove"
                          onClick={() =>
                            setParticipants((prev) =>
                              prev.filter((x) => x.id !== p.id),
                            )
                          }
                          className="p-1 rounded"
                          style={{ color: "#c23934" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "#fef2f2")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {errors.participants && (
          <p
            className="slds-text-3 mt-1"
            style={{ color: "#c23934" }}
          >
            At least one Participant is required.
          </p>
        )}
      </div>

      {/* ── FACILITATOR(S) — Connection modal (US 20051) ── */}
      {f.connectionRules && (
        <div>
          <FieldLabel required>Facilitator(s)</FieldLabel>
          <MultiSelect
            value={(form.instructors ?? []).map((i) => i.name)}
            onValueChange={(names) =>
              set(
                "instructors",
                f.instructorOptions.filter((i) =>
                  names.includes(i.name),
                ),
              )
            }
            options={f.instructorOptions.map((i) => i.name)}
            placeholder="Select facilitators"
            disabled={f.readOnly}
            aria-label="Facilitator(s)"
            aria-invalid={!!errors.instructors}
          />
          {errors.instructors && (
            <p
              className="slds-text-3 mt-1"
              style={{ color: "#c23934" }}
            >
              At least one Facilitator is required.
            </p>
          )}
        </div>
      )}

      {/* ── LEARNING MODULES ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users
              className="h-4 w-4"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            />
            <span
              className="slds-text-4 font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Learning Modules
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 rounded-full slds-text-3 font-medium"
            style={{
              border: "1px solid var(--color-brand-primary)",
              color: "var(--color-brand-primary)",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "rgba(20,95,51,0.06)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "transparent")
            }
            onClick={() => setIsPickerOpen("modules")}
            disabled={!sessionClassId}
          >
            <Plus className="h-3 w-3" /> Add Learning Module
          </Button>
        </div>
        {!sessionClassId && (
          <p
            className="slds-text-3 -mt-1 mb-2"
            style={{
              color: "var(--slds-g-color-text-weak)",
            }}
          >
            Select a Class before adding Learning Modules.
          </p>
        )}
        <div
          className="rounded overflow-hidden"
          style={{
            border:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          {(form.modules ?? []).length === 0 ? (
            <div
              className="px-3 py-3 slds-text-3 text-center"
              style={{
                color: "var(--slds-g-color-text-weak)",
              }}
            >
              No modules selected.
            </div>
          ) : (
            <table className="w-full">
              <thead
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <tr
                  style={{
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <th
                    className="px-3 py-2 slds-text-3 font-semibold text-left"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Name
                  </th>
                  <th
                    className="px-3 py-2 slds-text-3 font-semibold text-right w-20"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {(form.modules ?? []).map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom:
                        idx < (form.modules ?? []).length - 1
                          ? "1px solid var(--slds-g-color-border-base-1)"
                          : "none",
                    }}
                  >
                    <td
                      className="px-3 py-2.5 slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {item.name}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        onClick={() =>
                          set(
                            "modules",
                            (form.modules ?? []).filter(
                              (x) => x.id !== item.id,
                            ),
                          )
                        }
                        className="p-1 rounded"
                        style={{ color: "#c23934" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "#fef2f2")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

/** Details tab: Class Name (+ description) and Comments. */
export function ClassSessionDetailsFields({
  f,
}: {
  f: ClassSessionForm;
}) {
  const {
    open,
    editing,
    parentClass,
    allClasses,
    onModuleCreated,
    form,
    setForm,
    errors,
    setErrors,
    isPickerOpen,
    setIsPickerOpen,
    isConfirmDelete,
    setIsConfirmDelete,
    extraModules,
    setExtraModules,
    pendingClassId,
    setPendingClassId,
    sessionTab,
    setSessionTab,
    participants,
    setParticipants,
    addPartOpen,
    setAddPartOpen,
    editingPart,
    setEditingPart,
    partForm,
    setPartForm,
    set,
    lockedClassId,
    sessionClassId,
    selectedClass,
    activeClasses,
    classModules,
    programOptions,
    handleClassChange,
    confirmClassChange,
    toggleItem,
    validate,
    buildSession,
  } = f;
  return (
    <>
      {/* CLASS NAME — on the Connection tab in the Connection modal */}
      {!f.connectionRules && <ClassNameField f={f} />}

      {/* COMMENTS */}
      <div>
        <FieldLabel>Comments</FieldLabel>
        <textarea
          value={form.comments ?? ""}
          onChange={(e) => set("comments", e.target.value)}
          placeholder="Add Comments"
          rows={5}
          disabled={f.readOnly}
          style={textareaCls(false, f.readOnly)}
        />
      </div>
    </>
  );
}

/** Class Name — Active Classes only; read-only when a Class is fixed by
 *  context (edited session / parent Class) or in view mode. */
function ClassNameField({ f }: { f: ClassSessionForm }) {
  const {
    form,
    errors,
    lockedClassId,
    sessionClassId,
    selectedClass,
    activeClasses,
    handleClassChange,
  } = f;
  return (
    <div>
      <FieldLabel required>Class Name</FieldLabel>
      {lockedClassId || f.readOnly ? (
        <div
          className="flex items-center px-3 rounded slds-text-4"
          style={{
            height: "36px",
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt-2)",
            color: "var(--slds-g-color-text-weak)",
            cursor: "not-allowed",
          }}
        >
          {selectedClass?.name ?? sessionClassId ?? "—"}
        </div>
      ) : (
        <Select
          value={form.classId ?? ""}
          onValueChange={handleClassChange}
        >
          <SelectTrigger
            className="h-9 w-full slds-text-4"
            style={{
              border: `1px solid ${errors.classId ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
            }}
          >
            <SelectValue placeholder="Select a class…" />
          </SelectTrigger>
          <SelectContent>
            {activeClasses.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {errors.classId && (
        <p
          className="slds-text-3 mt-1"
          style={{ color: "#c23934" }}
        >
          Class Name is required.
        </p>
      )}
      <p
        className="slds-text-3 mt-1"
        style={{ color: "var(--slds-g-color-text-weak)" }}
      >
        {selectedClass?.description
          ? `Class description: ${selectedClass.description}`
          : "Insert Class description for the selected class"}
      </p>
    </div>
  );
}

/** Pickers, participant dialog and Class-change confirmation. */
export function ClassSessionPopups({
  f,
}: {
  f: ClassSessionForm;
}) {
  const {
    open,
    editing,
    parentClass,
    allClasses,
    onModuleCreated,
    form,
    setForm,
    errors,
    setErrors,
    isPickerOpen,
    setIsPickerOpen,
    isConfirmDelete,
    setIsConfirmDelete,
    extraModules,
    setExtraModules,
    pendingClassId,
    setPendingClassId,
    sessionTab,
    setSessionTab,
    participants,
    setParticipants,
    addPartOpen,
    setAddPartOpen,
    editingPart,
    setEditingPart,
    partForm,
    setPartForm,
    set,
    lockedClassId,
    sessionClassId,
    selectedClass,
    activeClasses,
    classModules,
    programOptions,
    handleClassChange,
    confirmClassChange,
    toggleItem,
    validate,
    buildSession,
  } = f;
  // Participant Name is required — show it instead of ignoring Save
  const [partNameError, setPartNameError] = useState(false);
  React.useEffect(() => setPartNameError(false), [addPartOpen]);
  return (
    <>
      {/* Changing the Class drops modules that belong to the previous one */}
      <AlertDialog
        open={pendingClassId !== null}
        onOpenChange={(v) => {
          if (!v) setPendingClassId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Class?</AlertDialogTitle>
            <AlertDialogDescription>
              Changing the Class will remove the currently
              selected Learning Modules because they are
              associated with the previous Class.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClassChange}>
              Change Class
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Module picker – the selected Class's modules only */}
      <PickerModal
        open={isPickerOpen === "modules" && !!sessionClassId}
        onClose={() => setIsPickerOpen(null)}
        title="Manage Learning Modules"
        description="Select modules to associate with this class."
        items={classModules.map((m) => ({
          id: m.id,
          label: m.name,
        }))}
        selectedIds={(form.modules ?? []).map((m) => m.id)}
        onApply={(ids) =>
          set(
            "modules",
            applySelection(form.modules, classModules, ids),
          )
        }
        searchPlaceholder="Search modules..."
        onAddItem={(module) => {
          // A new module belongs to the selected Class
          const newMod = { id: module.id, name: module.name };
          setExtraModules((prev) => [
            ...prev,
            { ...newMod, classId: sessionClassId! },
          ]);
          onModuleCreated?.(sessionClassId!, newMod);
        }}
      />

      <PickerModal
        open={isPickerOpen === "programs"}
        onClose={() => setIsPickerOpen(null)}
        title="Select Programs"
        items={programOptions.map((p) => ({
          id: p.id,
          label: p.name,
        }))}
        selectedIds={(form.programs ?? []).map((p) => p.id)}
        onApply={(ids) =>
          set(
            "programs",
            applySelection(form.programs, programOptions, ids),
          )
        }
        searchPlaceholder="Search programs..."
      />

      {/* ── Add / Edit Participant dialog ── */}
      <Dialog
        open={addPartOpen}
        onOpenChange={(v) => {
          if (!v) setAddPartOpen(false);
        }}
      >
        <DialogContent
          className="max-w-md p-0"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            border:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <DialogHeader
            className="px-5 pt-5 pb-4"
            style={{
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <DialogTitle
              className="slds-text-6 font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {editingPart
                ? "Edit Participant"
                : "Add Participant"}
            </DialogTitle>
            <DialogDescription
              className="slds-text-3 mt-0.5"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Fill in the participant details below.
            </DialogDescription>
          </DialogHeader>
          <div className="px-5 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel required>Type</FieldLabel>
                <Select
                  value={partForm.type ?? "Constituent"}
                  onValueChange={(v) =>
                    // Name and Role lists depend on Type, so reset them
                    setPartForm((f) => ({
                      ...f,
                      type: v as SessionParticipant["type"],
                      name: "",
                      role: "",
                    }))
                  }
                >
                  <SelectTrigger className="h-9 slds-text-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Constituent">
                      Constituent
                    </SelectItem>
                    <SelectItem value="Non-Constituent">
                      Non-Constituent
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Role</FieldLabel>
                <Select
                  value={partForm.role ?? ""}
                  onValueChange={(v) =>
                    setPartForm((f) => ({ ...f, role: v }))
                  }
                >
                  <SelectTrigger className="h-9 slds-text-4">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {(partForm.type === "Non-Constituent"
                      ? nonConstituentRoleOptions
                      : constituentRoleOptions
                    ).map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <FieldLabel required>Participant Name</FieldLabel>
              {partForm.type === "Non-Constituent" ? (
                <Input
                  value={partForm.name ?? ""}
                  onChange={(e) => {
                    setPartNameError(false);
                    setPartForm((f) => ({
                      ...f,
                      name: e.target.value,
                    }));
                  }}
                  placeholder="Full name…"
                  className="h-9 slds-text-4"
                  aria-invalid={partNameError}
                />
              ) : (
                <Select
                  value={partForm.name ?? ""}
                  onValueChange={(v) => {
                    setPartNameError(false);
                    setPartForm((f) => ({ ...f, name: v }));
                  }}
                >
                  <SelectTrigger
                    className="h-9 slds-text-4"
                    aria-invalid={partNameError}
                  >
                    <SelectValue placeholder="Select constituent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {participantOptions.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {partNameError && (
                <p
                  className="slds-text-3 mt-1"
                  style={{ color: "#c23934" }}
                >
                  Participant Name is required.
                </p>
              )}
            </div>
            <div className="flex items-center gap-6">
              <label
                className="flex items-center gap-2 cursor-pointer slds-text-4"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                <Checkbox
                  checked={!!partForm.isOrganizer}
                  onCheckedChange={(v) =>
                    setPartForm((f) => ({
                      ...f,
                      isOrganizer: !!v,
                    }))
                  }
                />
                Organizer
              </label>
              <label
                className="flex items-center gap-2 cursor-pointer slds-text-4"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                <Checkbox
                  checked={partForm.attended === true}
                  onCheckedChange={(v) =>
                    // Attended again clears any Reason Missed
                    setPartForm((f) =>
                      v
                        ? {
                            ...f,
                            attended: true,
                            reasonMissed: "",
                            otherReason: "",
                          }
                        : { ...f, attended: false },
                    )
                  }
                />
                Attended
              </label>
            </div>
            {/* Not attended (box unchecked) → Reason Missed */}
            {partForm.attended !== true && (
              <div>
                <FieldLabel>Reason Missed</FieldLabel>
                <Select
                  value={partForm.reasonMissed ?? ""}
                  onValueChange={(v) =>
                    setPartForm((f) => ({
                      ...f,
                      reasonMissed: v,
                      otherReason:
                        v !== "Other" ? "" : f.otherReason,
                    }))
                  }
                >
                  <SelectTrigger className="h-9 slds-text-4">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasonMissedOptions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {partForm.attended !== true &&
              partForm.reasonMissed === "Other" && (
                <div>
                  <FieldLabel>Other Reason</FieldLabel>
                  <Input
                    value={partForm.otherReason ?? ""}
                    onChange={(e) =>
                      setPartForm((f) => ({
                        ...f,
                        otherReason: e.target.value,
                      }))
                    }
                    placeholder="Describe the reason…"
                    className="h-9 slds-text-4"
                  />
                </div>
              )}
            <div>
              <FieldLabel>Comment</FieldLabel>
              <textarea
                value={partForm.comment ?? ""}
                onChange={(e) =>
                  setPartForm((f) => ({
                    ...f,
                    comment: e.target.value,
                  }))
                }
                placeholder="Enter a comment…"
                rows={3}
                style={textareaCls()}
              />
            </div>
          </div>
          <DialogFooter
            className="px-5 py-4 flex justify-end gap-2"
            style={{
              borderTop:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <Button
              variant="outline"
              className="h-9 px-4 rounded-full slds-text-4 font-medium"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
              }}
              onClick={() => setAddPartOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="h-9 px-4 rounded-full slds-text-4 font-medium text-white"
              style={{ backgroundColor: "#145F33" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#0e4524")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#145F33")
              }
              onClick={() => {
                if (!partForm.name?.trim()) {
                  setPartNameError(true);
                  return;
                }
                const entry: SessionParticipant = {
                  id: editingPart?.id ?? `part-${Date.now()}`,
                  type: partForm.type ?? "Constituent",
                  name: partForm.name!,
                  role: partForm.role ?? "",
                  isOrganizer: partForm.isOrganizer ?? false,
                  attended: partForm.attended ?? null,
                  reasonMissed: partForm.reasonMissed ?? "",
                  otherReason:
                    partForm.reasonMissed === "Other"
                      ? (partForm.otherReason ?? "")
                      : "",
                  comment: partForm.comment ?? "",
                };
                setParticipants((prev) =>
                  editingPart
                    ? prev.map((x) =>
                        x.id === editingPart.id ? entry : x,
                      )
                    : [...prev, entry],
                );
                setAddPartOpen(false);
              }}
            >
              {editingPart ? "Save" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function SessionModal({
  open,
  onClose,
  editing,
  parentClass,
  allClasses,
  onSave,
  onDelete,
  onModuleCreated,
}: {
  open: boolean;
  onClose: () => void;
  editing: ClassSession | null;
  parentClass?: ClassRecord;
  allClasses: ClassRecord[];
  onSave: (s: ClassSession) => void;
  onDelete: (id: string) => void;
  onModuleCreated?: (
    classId: string,
    module: LearningModule,
  ) => void;
}) {
  const f = useClassSessionForm({
    open,
    editing,
    parentClass,
    allClasses,
    onModuleCreated,
  });
  const {
    form,
    setForm,
    errors,
    setErrors,
    isPickerOpen,
    setIsPickerOpen,
    isConfirmDelete,
    setIsConfirmDelete,
    extraModules,
    setExtraModules,
    pendingClassId,
    setPendingClassId,
    sessionTab,
    setSessionTab,
    participants,
    setParticipants,
    addPartOpen,
    setAddPartOpen,
    editingPart,
    setEditingPart,
    partForm,
    setPartForm,
    set,
    lockedClassId,
    sessionClassId,
    selectedClass,
    activeClasses,
    classModules,
    programOptions,
    handleClassChange,
    confirmClassChange,
    toggleItem,
    validate,
    buildSession,
  } = f;
  const handleSave = () => {
    if (!validate()) return;
    onSave(buildSession());
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) onClose();
        }}
      >
        <DialogContent
          className="sm:max-w-[1200px] rounded-lg shadow-lg bg-white max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0"
          style={{
            border: "1px solid #dddbda",
          }}
        >
          {/* ── Header ── */}
          <DialogHeader
            className="px-6 py-4"
            style={{
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 flex items-center justify-center text-white flex-shrink-0"
                style={{
                  borderRadius: "6px",
                  backgroundColor: "#145F33",
                }}
              >
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle
                  className="slds-text-6 font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {editing ? "Edit Session" : "New Session"}
                </DialogTitle>
                {parentClass ? (
                  <DialogDescription
                    className="slds-text-3 mt-0.5"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Class: {parentClass.name}
                  </DialogDescription>
                ) : (
                  <DialogDescription className="sr-only">
                    Session form
                  </DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* ── Tab bar ── */}
          <div
            className="flex-shrink-0 flex items-end px-6 gap-6"
            style={{
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            {(["connection", "details"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSessionTab(tab)}
                className="py-3 slds-text-4 font-medium capitalize transition-colors"
                style={{
                  borderBottom:
                    sessionTab === tab
                      ? "2px solid #145F33"
                      : "2px solid transparent",
                  color:
                    sessionTab === tab
                      ? "#145F33"
                      : "var(--slds-g-color-text-weak)",
                  marginBottom: "-1px",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {sessionTab === "connection" && (
              <>
                {/* TYPE — connection type is always Class Session */}
                <div>
                  <FieldLabel>Type</FieldLabel>
                  <div
                    className="flex items-center px-3 rounded slds-text-4"
                    style={{
                      height: "36px",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-alt-2)",
                      color: "var(--slds-g-color-text-weak)",
                      cursor: "not-allowed",
                    }}
                  >
                    Class Session
                  </div>
                </div>

                <ClassSessionConnectionFields f={f} />
              </>
            )}

            {sessionTab === "details" && (
              <>
                <ClassSessionDetailsFields f={f} />
              </>
            )}
          </div>

          {/* ── Footer ── */}
          <DialogFooter
            className="px-6 py-3 flex items-center justify-between"
            style={{
              borderTop:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            <div>
              {isConfirmDelete && (
                <div className="flex items-center gap-2">
                  <span
                    className="slds-text-3"
                    style={{ color: "#c23934" }}
                  >
                    Delete this session?
                  </span>
                  <Button
                    size="sm"
                    className="h-8 px-3 rounded-full slds-text-3 font-medium text-white"
                    style={{ backgroundColor: "#c23934" }}
                    onClick={() => {
                      onDelete(editing!.id);
                      onClose();
                    }}
                  >
                    Yes, delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 rounded-full slds-text-3"
                    onClick={() => setIsConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-9 px-4 rounded-full slds-text-4"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                  fontWeight: 500,
                }}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className="h-9 px-5 rounded-full slds-text-4 font-medium text-white"
                style={{ backgroundColor: "#145F33" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "#0e4524")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "#145F33")
                }
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ClassSessionPopups f={f} />
    </>
  );
}

// ─── Session Report ────────────────────────────────────────────────────────────

const MOCK_YOUTH: Record<string, string[]> = {
  p1: [
    "Marcus J.",
    "Cairo B.",
    "Nadia W.",
    "Axel R.",
    "Fatima H.",
  ],
  p2: [
    "Layla T.",
    "Devon S.",
    "Amara K.",
    "Jaylen P.",
    "Simone R.",
  ],
  p3: [
    "Elijah M.",
    "Zara F.",
    "Tobias G.",
    "Isaiah C.",
    "Priscilla M.",
  ],
  p4: ["Darnell F."],
  p5: ["Jordan K.", "Alex M."],
};

function generateSessionReport(
  session: ClassSession,
  cls: ClassRecord,
) {
  const now = new Date();
  const runDate =
    formatMdy(now) +
    " " +
    now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const allYouth = session.programs.flatMap((p) =>
    (MOCK_YOUTH[p.id] ?? []).map((n) => ({
      name: n,
      program: p.name,
    })),
  );

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Class Session Overview Report</title>
<style>
@page { size: letter portrait; margin: 0.5in 0.5in 0.75in 0.5in; }
@page { @bottom-left { content: "Run Date: ${runDate}"; font-family: Arial, sans-serif; font-size: 8pt; color: #706e6b; } }
@page { @bottom-right { content: "Page " counter(page) " of " counter(pages); font-family: Arial, sans-serif; font-size: 8pt; color: #706e6b; } }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, sans-serif; font-size: 10pt; color: #3e3e3c; }
.header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 10pt; margin-bottom: 14pt; border-bottom: 2pt solid #145F33; }
.logo { font-size: 16pt; font-weight: bold; color: #145F33; }
.logo-sub { font-size: 8pt; color: #706e6b; margin-top: 2pt; }
.report-title { font-size: 14pt; font-weight: bold; color: #3e3e3c; text-align: right; }
.report-sub { font-size: 9pt; color: #706e6b; text-align: right; margin-top: 3pt; }
.section { margin-bottom: 16pt; }
.section-title { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #706e6b; border-bottom: 1pt solid #dddbda; padding-bottom: 3pt; margin-bottom: 8pt; }
.field { margin-bottom: 6pt; }
.field-label { font-size: 8pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #706e6b; }
.field-value { font-size: 10pt; color: #3e3e3c; margin-top: 1pt; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10pt 20pt; }
table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 4pt; }
th { background: #f4f6f9; color: #706e6b; font-size: 7.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; padding: 5pt 7pt; border-bottom: 1.5pt solid #dddbda; text-align: left; }
td { padding: 4pt 7pt; border-bottom: 0.5pt solid #e5e5e5; color: #3e3e3c; vertical-align: middle; }
.badge { display: inline-block; padding: 1pt 6pt; border-radius: 12pt; font-size: 8pt; font-weight: 600; background: #e6f2eb; color: #145F33; }
</style></head>
<body>
<div class="header">
  <div><div class="logo">Mercy Home</div><div class="logo-sub">for Boys &amp; Girls</div></div>
  <div><div class="report-title">Class Session Overview Report</div><div class="report-sub">Generated ${runDate}</div></div>
</div>

<div class="section">
  <div class="section-title">Class Information</div>
  <div class="grid">
    <div class="field"><div class="field-label">Class Name</div><div class="field-value">${cls.name}</div></div>
    <div class="field"><div class="field-label">Class Type</div><div class="field-value">${cls.classType}</div></div>
    <div class="field" style="grid-column: 1 / -1"><div class="field-label">Class Description</div><div class="field-value">${cls.description}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Session Details</div>
  <div class="grid">
    <div class="field"><div class="field-label">Session ID</div><div class="field-value">${session.id}</div></div>
    <div class="field"><div class="field-label">Date &amp; Time</div><div class="field-value">${session.date} at ${session.time}</div></div>
    <div class="field"><div class="field-label">Duration</div><div class="field-value">${session.sessionMinutes} minutes</div></div>
    <div class="field"><div class="field-label">Campus</div><div class="field-value">${session.campus === "Other" ? `Other – ${session.otherLocation}` : session.campus}</div></div>
    <div class="field"><div class="field-label">Partner Organization</div><div class="field-value">${session.partnerOrganization}</div></div>
    <div class="field" style="grid-column: 1 / -1"><div class="field-label">Session Description</div><div class="field-value">${session.description}</div></div>
  </div>
</div>

${
  session.instructors.length > 0
    ? `
<div class="section">
  <div class="section-title">Instructors (${session.instructors.length})</div>
  <table>
    <thead><tr><th>Name</th><th>Credentials</th></tr></thead>
    <tbody>${session.instructors.map((i) => `<tr><td>${i.name}</td><td>${i.title}</td></tr>`).join("")}</tbody>
  </table>
</div>`
    : ""
}

${
  session.modules.length > 0
    ? `
<div class="section">
  <div class="section-title">Learning Modules (${session.modules.length})</div>
  <table>
    <thead><tr><th>Module Name</th></tr></thead>
    <tbody>${session.modules.map((m) => `<tr><td>${m.name}</td></tr>`).join("")}</tbody>
  </table>
</div>`
    : ""
}

<div class="section">
  <div class="section-title">Youth by Program (${allYouth.length} total)</div>
  ${
    allYouth.length === 0
      ? '<p style="color:#706e6b;font-size:9pt">No programs assigned to this session.</p>'
      : `<table>
      <thead><tr><th>Youth Name</th><th>Program</th></tr></thead>
      <tbody>${allYouth.map((y) => `<tr><td>${y.name}</td><td>${y.program}</td></tr>`).join("")}</tbody>
    </table>`
  }
</div>
</body></html>`;

  const win = window.open(
    "",
    "_blank",
    "width=900,height=1100,scrollbars=yes",
  );
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
    }, 350);
  } else
    toast.error("Pop-up blocked. Allow pop-ups and try again.");
}

// ─── Class List View ──────────────────────────────────────────────────────────

function ClassListView({
  classes,
  sessions,
  onNew,
  onNewSession,
  onEdit,
  onView,
  onDelete,
  onSessions,
  onLearningModules,
}: {
  classes: ClassRecord[];
  sessions: ClassSession[];
  onNew: () => void;
  onNewSession: () => void;
  onEdit: (c: ClassRecord) => void;
  onView: (c: ClassRecord) => void;
  onDelete: (id: string) => void;
  onSessions: (c: ClassRecord) => void;
  onLearningModules: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [filterActive, setFilterActive] = useState("all");
  const [filterProg, setFilterProg] = useState("all");
  const [pendingDelete, setPendingDelete] = useState<
    string | null
  >(null);
  const [sortCol, setSortCol] = useState<
    | "name"
    | "description"
    | "classType"
    | "budgetCategory"
    | "active"
    | null
  >(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (
    col:
      | "name"
      | "description"
      | "classType"
      | "budgetCategory"
      | "active",
  ) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
    setClsPage(1);
  };

  const filtered = useMemo(
    () =>
      classes.filter((c) => {
        const q = search.toLowerCase();
        const ms =
          !search ||
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q);
        const mt =
          filterType === "all" || c.classType === filterType;
        const mc =
          filterCat === "all" || c.budgetCategory === filterCat;
        const ma =
          filterActive === "all" ||
          (filterActive === "active" ? c.active : !c.active);
        const mp =
          filterProg === "all" ||
          c.programs.some((p) => p.id === filterProg);
        return ms && mt && mc && ma && mp;
      }),
    [
      classes,
      search,
      filterType,
      filterCat,
      filterActive,
      filterProg,
    ],
  );

  const hasFilters =
    search ||
    filterType !== "all" ||
    filterCat !== "all" ||
    filterActive !== "all" ||
    filterProg !== "all";
  const clearFilters = () => {
    setSearch("");
    setFilterType("all");
    setFilterCat("all");
    setFilterActive("all");
    setFilterProg("all");
  };

  const sortedFiltered = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      let aVal: string;
      let bVal: string;
      if (sortCol === "active") {
        aVal = a.active ? "Active" : "Inactive";
        bVal = b.active ? "Active" : "Inactive";
      } else {
        aVal = (a[sortCol] as string) ?? "";
        bVal = (b[sortCol] as string) ?? "";
      }
      const cmp = aVal.localeCompare(bVal);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  const CLS_PAGE_SIZE = 12;
  const [clsPage, setClsPage] = useState(1);
  const clsTotalPages = Math.max(
    1,
    Math.ceil(filtered.length / CLS_PAGE_SIZE),
  );
  const clsSafePage = Math.min(clsPage, clsTotalPages);
  const clsPageRows = sortedFiltered.slice(
    (clsSafePage - 1) * CLS_PAGE_SIZE,
    clsSafePage * CLS_PAGE_SIZE,
  );

  React.useEffect(() => {
    setClsPage(1);
  }, [search, filterType, filterCat, filterActive, filterProg]);

  const totalActive = classes.filter((c) => c.active).length;
  const totalSessions = sessions.length;
  const scheduledSessions = sessions.filter((s) => {
    const d = s.date.split("/");
    if (d.length < 3) return false;
    return new Date(+d[2], +d[0] - 1, +d[1]) >= new Date();
  }).length;

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: "var(--slds-g-color-background-alt)",
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-alt-2)",
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
          boxShadow: "var(--slds-g-shadow-1)",
        }}
      >
        <div className="flex items-center justify-between gap-4">
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
              <GraduationCap className="h-6 w-6" />
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
                Classes
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              style={{
                backgroundColor: "white",
                borderRadius: "50%",
              }}
              onClick={() => window.location.reload()}
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
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-4 rounded-full slds-text-4 font-medium flex items-center gap-1.5"
              style={{
                border: "1px solid var(--color-brand-primary)",
                color: "var(--color-brand-primary)",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                (
                  e.currentTarget as HTMLElement
                ).style.backgroundColor = "rgba(20,95,51,0.06)";
              }}
              onMouseLeave={(e) => {
                (
                  e.currentTarget as HTMLElement
                ).style.backgroundColor = "transparent";
              }}
              onClick={onLearningModules}
            >
              <BookOpen className="h-3.5 w-3.5" /> Learning
              Modules
            </Button>
            <Button
              size="sm"
              className="h-8 px-4 rounded-full slds-text-4 font-medium text-white flex items-center gap-1.5"
              style={{
                backgroundColor: "var(--color-brand-primary)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#0e4524")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--color-brand-primary)")
              }
              onClick={onNewSession}
            >
              <Plus className="h-3.5 w-3.5" /> New Session
            </Button>
            <Button
              size="sm"
              className="h-8 px-4 rounded-full slds-text-4 font-medium text-white flex items-center gap-1.5"
              style={{
                backgroundColor: "var(--color-brand-primary)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#0e4524")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--color-brand-primary)")
              }
              onClick={onNew}
            >
              <Plus className="h-3.5 w-3.5" /> New Class
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {/* Table Section */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-6 pt-4 pb-8"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-alt-2)",
        }}
      >
        <Card
          className="shadow-sm overflow-hidden !gap-0"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: "var(--slds-c-card-radius-border)",
          }}
        >
          {/* Card header — title left, filters + search right */}
          <CardHeader
            className="h-[52px] px-4 !py-0 flex items-center"
            style={{
              backgroundColor:
                "var(--slds-g-color-background-alt)",
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <div className="w-full flex items-center justify-between gap-3 flex-wrap">
              {/* Left — search (primary) + title + clear */}
              <div className="flex items-center gap-3">
                <span
                  className="text-[13px] font-semibold whitespace-nowrap"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  All Classes ({filtered.length})
                </span>
                {/* Search — primary focus, wide, icon inside */}
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="h-9 w-72 text-[13px] pl-9 pr-8"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        "#145F33";
                      e.currentTarget.style.outline =
                        "2px solid rgba(20,95,51,0.20)";
                      e.currentTarget.style.outlineOffset = "0";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--slds-g-color-border-base-1)";
                      e.currentTarget.style.outline = "none";
                    }}
                    aria-label="Search classes"
                  />
                  {search && (
                    <button
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center z-10"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                    >
                      <X
                        className="hidden h-3 w-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      />
                    </button>
                  )}
                </div>

                {hasFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="h-9 px-3 rounded-full text-[12px] flex items-center gap-1.5"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    <X className="h-3 w-3" /> Clear Filters
                  </Button>
                )}
              </div>

              {/* Right — filter dropdowns */}
              <div className="flex items-center gap-2 flex-wrap">
                <Select
                  value={filterType}
                  onValueChange={setFilterType}
                >
                  <SelectTrigger
                    className="
                      relative
                      h-9
                      w-[150px]
                      overflow-hidden
                      text-[13px]
                      pl-3
                      pr-9
                      [&>span]:block
                      [&>span]:min-w-0
                      [&>span]:max-w-full
                      [&>span]:truncate
                      [&>svg]:absolute
                      [&>svg]:right-3
                      [&>svg]:left-auto
                    "
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <SelectValue
                      placeholder="Type"
                      className="text-left"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Types
                    </SelectItem>
                    {CLASS_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterCat}
                  onValueChange={setFilterCat}
                >
                  <SelectTrigger
                    className="
                      relative
                      h-9
                      w-[160px]
                      overflow-hidden
                      text-[13px]
                      pl-3
                      pr-9
                      [&>span]:block
                      [&>span]:min-w-0
                      [&>span]:max-w-full
                      [&>span]:truncate
                      [&>svg]:absolute
                      [&>svg]:right-3
                      [&>svg]:left-auto
                    "
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <SelectValue
                      placeholder="Category"
                      className="text-left"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Categories
                    </SelectItem>
                    {BUDGET_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterActive}
                  onValueChange={setFilterActive}
                >
                  <SelectTrigger
                    className="
                      relative
                      h-9
                      w-[120px]
                      overflow-hidden
                      text-[13px]
                      pl-3
                      pr-9
                      [&>span]:block
                      [&>span]:min-w-0
                      [&>span]:max-w-full
                      [&>span]:truncate
                      [&>svg]:absolute
                      [&>svg]:right-3
                      [&>svg]:left-auto
                    "
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <SelectValue
                      placeholder="Status"
                      className="text-left"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Status
                    </SelectItem>
                    <SelectItem value="active">
                      Active
                    </SelectItem>
                    <SelectItem value="inactive">
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filterProg}
                  onValueChange={setFilterProg}
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
                    <SelectValue placeholder="Program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Programs
                    </SelectItem>
                    {ALL_PROGRAMS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table
              style={{ tableLayout: "fixed", width: "100%" }}
            >
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
                  <TableHead
                    className="pl-4 h-10"
                    onClick={() => handleSort("name")}
                    style={{
                      color:
                        sortCol === "name"
                          ? "#145F33"
                          : "var(--slds-g-color-text-weak)",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      width: "22%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      NAME
                      <ChevronDown
                        className="h-3 w-3"
                        style={
                          sortCol === "name"
                            ? {
                                transform:
                                  sortDir === "asc"
                                    ? "rotate(180deg)"
                                    : undefined,
                              }
                            : { opacity: 0.3 }
                        }
                      />
                    </span>
                  </TableHead>
                  <TableHead
                    className="px-2 h-10"
                    onClick={() => handleSort("description")}
                    style={{
                      color:
                        sortCol === "description"
                          ? "#145F33"
                          : "var(--slds-g-color-text-weak)",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      width: "30%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      DESCRIPTION
                      <ChevronDown
                        className="h-3 w-3"
                        style={
                          sortCol === "description"
                            ? {
                                transform:
                                  sortDir === "asc"
                                    ? "rotate(180deg)"
                                    : undefined,
                              }
                            : { opacity: 0.3 }
                        }
                      />
                    </span>
                  </TableHead>
                  <TableHead
                    className="px-2 h-10"
                    onClick={() => handleSort("classType")}
                    style={{
                      color:
                        sortCol === "classType"
                          ? "#145F33"
                          : "var(--slds-g-color-text-weak)",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      width: "18%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      TYPE
                      <ChevronDown
                        className="h-3 w-3"
                        style={
                          sortCol === "classType"
                            ? {
                                transform:
                                  sortDir === "asc"
                                    ? "rotate(180deg)"
                                    : undefined,
                              }
                            : { opacity: 0.3 }
                        }
                      />
                    </span>
                  </TableHead>
                  <TableHead
                    className="px-2 h-10"
                    onClick={() => handleSort("budgetCategory")}
                    style={{
                      color:
                        sortCol === "budgetCategory"
                          ? "#145F33"
                          : "var(--slds-g-color-text-weak)",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      width: "18%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      CATEGORY
                      <ChevronDown
                        className="h-3 w-3"
                        style={
                          sortCol === "budgetCategory"
                            ? {
                                transform:
                                  sortDir === "asc"
                                    ? "rotate(180deg)"
                                    : undefined,
                              }
                            : { opacity: 0.3 }
                        }
                      />
                    </span>
                  </TableHead>
                  <TableHead
                    className="px-2 h-10"
                    onClick={() => handleSort("active")}
                    style={{
                      color:
                        sortCol === "active"
                          ? "#145F33"
                          : "var(--slds-g-color-text-weak)",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      width: "96px",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      STATUS
                      <ChevronDown
                        className="h-3 w-3"
                        style={
                          sortCol === "active"
                            ? {
                                transform:
                                  sortDir === "asc"
                                    ? "rotate(180deg)"
                                    : undefined,
                              }
                            : { opacity: 0.3 }
                        }
                      />
                    </span>
                  </TableHead>
                  <TableHead
                    className="text-right pr-4 h-10"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      width: "210px",
                    }}
                  >
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-16 text-center"
                    >
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
                        No classes found
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Adjust your search or filters
                      </p>
                      {hasFilters && (
                        <button
                          className="mt-2 text-xs underline"
                          style={{ color: "#145F33" }}
                          onClick={clearFilters}
                        >
                          Clear filters
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  clsPageRows.map((cls) => (
                    <TableRow
                      key={cls.id}
                      className="transition-colors h-[44px]"
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
                      {/* Name — unchanged */}
                      <TableCell className="pl-4 py-2">
                        <p
                          className="cursor-pointer text-sm font-medium truncate hover:underline focus:outline-none focus:underline"
                          style={{
                            color: "var(--color-link-blue)",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSessions(cls);
                          }}
                          title={cls.name}
                        >
                          {cls.name}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {cls.modules.length} module
                          {cls.modules.length !== 1 ? "s" : ""}
                        </p>
                      </TableCell>

                      {/* Description */}
                      <TableCell className="px-2 py-2">
                        <p
                          className="text-xs truncate"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                          title={cls.description}
                        >
                          {cls.description}
                        </p>
                      </TableCell>

                      {/* Type */}
                      <TableCell className="px-2 py-2">
                        <span
                          className="text-xs block truncate"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                          title={cls.classType}
                        >
                          {cls.classType}
                        </span>
                      </TableCell>

                      {/* Category */}
                      <TableCell className="px-2 py-2">
                        <span
                          className="text-xs block truncate"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                          title={cls.budgetCategory}
                        >
                          {cls.budgetCategory}
                        </span>
                      </TableCell>

                      {/* Status badge — unchanged */}
                      <TableCell className="px-2 py-2">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: cls.active
                              ? "#D0E9DA"
                              : "#FCE4E4",
                            color: cls.active
                              ? "#1B5E20"
                              : "#C62828",
                            border: `1px solid ${cls.active ? "#A3D4B5" : "#F5A5A5"}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {cls.active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>

                      {/* Actions — unchanged */}
                      <TableCell className="pr-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          <button
                            title="View"
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(cls);
                            }}
                            className="cursor-pointer p-2 rounded transition-colors flex items-center justify-center flex-shrink-0"
                            style={{
                              color: "#145F33",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#e6f2eb")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(cls);
                            }}
                            className="p-2 rounded transition-colors flex items-center justify-center flex-shrink-0"
                            style={{
                              color: "#145F33",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#e6f2eb")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSessions(cls);
                            }}
                            className="cursor-pointer inline-flex items-center gap-1.5 h-8 px-2 rounded-full text-[12px] font-semibold flex-shrink-0 transition-colors"
                            style={{
                              backgroundColor: "#fafaf9",
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#fafaf9")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#fafaf9")
                            }
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            Sessions
                          </button>
                          <button
                            title="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingDelete({
                                id: cls.id,
                                name: cls.name,
                              });
                            }}
                            className="p-1.5 rounded transition-colors flex-shrink-0"
                            style={{
                              color: "#c23934",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.color = "#c23934";
                              (
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor =
                                "rgba(194, 57, 52, 0.08)";
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.color = "#c23934";
                              (
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor =
                                "transparent";
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {/* Pagination */}
            <div
              className="flex items-center justify-between"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
                padding: "12px 16px",
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
                  {filtered.length === 0
                    ? "0"
                    : `${(clsSafePage - 1) * CLS_PAGE_SIZE + 1}–${Math.min(clsSafePage * CLS_PAGE_SIZE, filtered.length)}`}
                </span>
                {" of "}
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {filtered.length}
                </span>
                {" records"}
              </p>
              {clsTotalPages > 1 && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setClsPage((p) => Math.max(1, p - 1))
                    }
                    disabled={clsSafePage === 1}
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
                      color: "var(--slds-g-color-text-default)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {"Page "}
                    <span style={{ fontWeight: 600 }}>
                      {clsSafePage}
                    </span>
                    {" of "}
                    <span style={{ fontWeight: 600 }}>
                      {clsTotalPages}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setClsPage((p) =>
                        Math.min(clsTotalPages, p + 1),
                      )
                    }
                    disabled={clsSafePage === clsTotalPages}
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
      </div>

      {/* ── Delete confirmation dialog ── */}
      <Dialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent
          className="max-w-sm p-0"
          style={{
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: "var(--slds-c-card-radius-border)",
          }}
          aria-describedby="delete-class-desc"
        >
          <DialogHeader
            className="px-6 pt-6 pb-4"
            style={{
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex-shrink-0 mt-0.5 h-9 w-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#fef2f2" }}
              >
                <Trash2
                  className="h-4 w-4"
                  style={{ color: "#c23934" }}
                />
              </div>
              <div>
                <DialogTitle
                  className="text-[15px] font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Delete Class
                </DialogTitle>
                <DialogDescription
                  id="delete-class-desc"
                  className="text-[13px] mt-1 leading-snug"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Are you sure you want to delete{" "}
                  <span
                    className="font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {pendingDelete?.name}
                  </span>
                  ? This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex items-center justify-end gap-2 px-6 py-4">
            <button
              onClick={() => setPendingDelete(null)}
              className="h-9 px-4 rounded-full text-[13px] font-medium transition-colors"
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
              onClick={() => {
                if (pendingDelete) {
                  onDelete(pendingDelete.id);
                  setPendingDelete(null);
                }
              }}
              className="h-9 px-4 rounded-full text-[13px] font-medium text-white transition-colors"
              style={{ backgroundColor: "#c23934" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#a32e29")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#c23934")
              }
            >
              Delete Class
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sessions View ────────────────────────────────────────────────────────────

function SessionsView({
  parentClass,
  sessions,
  allSessions,
  onBack,
  onNewSession,
  onEditSession,
  onDeleteSession,
}: {
  parentClass: ClassRecord;
  sessions: ClassSession[];
  allSessions: ClassSession[];
  onBack: () => void;
  onNewSession: () => void;
  onEditSession: (s: ClassSession) => void;
  onDeleteSession: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterCampus, setFilterCampus] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateChip, setDateChip] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const parseDate = (d: string) => {
    const p = d.split("/");
    return p.length === 3
      ? new Date(+p[2], +p[0] - 1, +p[1])
      : null;
  };

  const getChipRange = (
    chip: string | null,
  ): { start: Date | null; end: Date | null } => {
    if (!chip) return { start: null, end: null };
    const now = new Date();
    const dow = now.getDay(); // 0=Sun
    const monday = (d: Date, offset = 0) => {
      const m = new Date(d);
      m.setDate(
        d.getDate() - ((d.getDay() + 6) % 7) + offset * 7,
      );
      m.setHours(0, 0, 0, 0);
      return m;
    };
    const sunday = (d: Date, offset = 0) => {
      const s = new Date(monday(d, offset));
      s.setDate(s.getDate() + 6);
      s.setHours(23, 59, 59, 999);
      return s;
    };
    if (chip === "last-week")
      return { start: monday(now, -1), end: sunday(now, -1) };
    if (chip === "this-week")
      return { start: monday(now, 0), end: sunday(now, 0) };
    if (chip === "next-week")
      return { start: monday(now, 1), end: sunday(now, 1) };
    if (chip === "this-month") {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      const e = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
      );
      return { start: s, end: e };
    }
    if (chip === "last-month") {
      const s = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );
      const e = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
      );
      return { start: s, end: e };
    }
    return { start: null, end: null };
  };

  const filtered = useMemo(() => {
    const { start: chipStart, end: chipEnd } =
      getChipRange(dateChip);
    return sessions.filter((s) => {
      const q = search.toLowerCase();
      const ms =
        !search ||
        s.description.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.campus.toLowerCase().includes(q);
      const mc =
        filterCampus === "all" || s.campus === filterCampus;
      const mp =
        filterProgram === "all" ||
        s.programs.some((p) => p.id === filterProgram);
      const mst =
        filterStatus === "all" || s.status === filterStatus;
      const sd = parseDate(s.date);
      const sf = chipStart ? sd && sd >= chipStart : true;
      const ef = chipEnd ? sd && sd <= chipEnd : true;
      return ms && mc && mp && mst && sf && ef;
    });
  }, [
    sessions,
    search,
    filterCampus,
    filterProgram,
    filterStatus,
    dateChip,
  ]);

  const hasFilters =
    search ||
    filterCampus !== "all" ||
    filterProgram !== "all" ||
    filterStatus !== "all" ||
    dateChip;
  const clearFilters = () => {
    setSearch("");
    setFilterCampus("all");
    setFilterProgram("all");
    setFilterStatus("all");
    setDateChip(null);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: "var(--slds-g-color-background-alt)",
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-alt-2)",
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
          boxShadow: "var(--slds-g-shadow-1)",
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="h-8 w-8 flex items-center justify-center rounded-full transition-colors"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
                backgroundColor: "white",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--slds-g-color-background-alt-2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "white")
              }
              title="Back to Classes"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div
              className="h-10 w-10 flex items-center justify-center text-white"
              style={{
                borderRadius:
                  "var(--slds-c-card-radius-border)",
                backgroundColor: "var(--color-brand-primary)",
                boxShadow: "var(--slds-g-shadow-1)",
              }}
            >
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <div
                className="text-xs font-medium uppercase tracking-wide flex items-center gap-1.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                <span
                  className="cursor-pointer hover:underline"
                  onClick={onBack}
                >
                  Classes
                </span>
                <span>›</span>
                <span
                  className="truncate max-w-[200px]"
                  title={parentClass.name}
                >
                  {parentClass.name}
                </span>
              </div>
              <h1
                className="text-2xl font-medium tracking-tight"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Sessions
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              style={{
                backgroundColor: "white",
                borderRadius: "50%",
              }}
              onClick={() => window.location.reload()}
            >
              <RefreshCw
                className="h-4 w-4"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </Button>
            <Button
              size="sm"
              className="h-8 px-4 rounded-full slds-text-4 font-medium text-white flex items-center gap-1.5"
              style={{
                backgroundColor: "var(--color-brand-primary)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#0e4524")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--color-brand-primary)")
              }
              onClick={onNewSession}
            >
              <Plus className="h-3.5 w-3.5" /> New Session
            </Button>
          </div>
        </div>
      </div>

      {/* Class info pill */}
      <div
        className="px-6 py-3 flex items-center gap-4"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-alt-2)",
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-block px-2.5 py-1 rounded-full slds-text-3 font-medium"
            style={{
              backgroundColor: "#e6f2eb",
              color: "#145F33",
              border: "1px solid #a3d4b5",
            }}
          >
            {parentClass.classType}
          </span>
          <span
            className="slds-text-3"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            ·
          </span>
          <span
            className="slds-text-3"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            {parentClass.budgetCategory}
          </span>
          <span
            className="slds-text-3"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            ·
          </span>
          <ActiveBadge active={parentClass.active} />
          <span
            className="slds-text-3"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            ·
          </span>
          <span
            className="slds-text-3"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            {parentClass.modules.length} module
            {parentClass.modules.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div
          className="overflow-hidden"
          style={{
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: "var(--slds-c-card-radius-border)",
            backgroundColor:
              "var(--slds-g-color-background-base)",
            boxShadow: "var(--slds-g-shadow-1)",
          }}
        >
          {/* Toolbar */}
          <div
            className="px-4 py-3 flex flex-wrap items-center gap-2"
            style={{
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
          >
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="h-9 w-72 text-[13px] pl-9 pr-8"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  borderRadius:
                    "var(--slds-c-input-radius-border)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#145F33";
                  e.currentTarget.style.outline =
                    "2px solid rgba(20,95,51,0.20)";
                  e.currentTarget.style.outlineOffset = "0";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--slds-g-color-border-base-1)";
                  e.currentTarget.style.outline = "none";
                }}
                aria-label="Search classes"
              />
              {search && (
                <button
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center z-10"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X
                    className="hidden h-3 w-3"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                </button>
              )}
            </div>
            {hasFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-[28px] px-3 rounded-full text-[12px] flex items-center gap-1.5"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                <X className="h-3 w-3" /> Clear Filters
              </Button>
            )}
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              <Select
                value={filterCampus}
                onValueChange={setFilterCampus}
              >
                <SelectTrigger
                  className="
                      relative
                      h-9
                      w-[160px]
                      overflow-hidden
                      text-[13px]
                      pl-3
                      pr-9
                      [&>span]:block
                      [&>span]:min-w-0
                      [&>span]:max-w-full
                      [&>span]:truncate
                      [&>svg]:absolute
                      [&>svg]:right-3
                      [&>svg]:left-auto
                    "
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    borderRadius:
                      "var(--slds-c-input-radius-border)",
                  }}
                >
                  <SelectValue
                    placeholder="Campus"
                    className="text-left"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Campuses
                  </SelectItem>
                  {TEACHING_CAMPUSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filterProgram}
                onValueChange={setFilterProgram}
              >
                <SelectTrigger
                  className="
                      relative
                      h-9
                      w-[150px]
                      overflow-hidden
                      text-[13px]
                      pl-3
                      pr-9
                      [&>span]:block
                      [&>span]:min-w-0
                      [&>span]:max-w-full
                      [&>span]:truncate
                      [&>svg]:absolute
                      [&>svg]:right-3
                      [&>svg]:left-auto
                    "
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    borderRadius:
                      "var(--slds-c-input-radius-border)",
                  }}
                >
                  <SelectValue
                    placeholder="Program"
                    className="text-left"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Programs
                  </SelectItem>
                  {ALL_PROGRAMS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger
                  className="
                      relative
                      h-9
                      w-[190px]
                      overflow-hidden
                      text-[13px]
                      pl-3
                      pr-9
                      [&>span]:block
                      [&>span]:min-w-0
                      [&>span]:max-w-full
                      [&>span]:truncate
                      [&>svg]:absolute
                      [&>svg]:right-3
                      [&>svg]:left-auto
                    "
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    borderRadius:
                      "var(--slds-c-input-radius-border)",
                  }}
                >
                  <SelectValue
                    placeholder="Status"
                    className="text-left"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Status
                  </SelectItem>
                  <SelectItem value="not-complete">
                    Not Complete / Finalized
                  </SelectItem>
                  <SelectItem value="complete">
                    Complete / Finalized
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div
              className="hidden ml-auto slds-text-3"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {filtered.length} of {sessions.length} sessions
            </div>
          </div>

          {/* Date filter chips */}
          <div
            className="px-4 py-2 flex items-center gap-1.5 flex-wrap"
            style={{
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            <span
              className="slds-text-3 font-medium mr-1"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Period:
            </span>
            {[
              { id: "last-month", label: "Last Month" },
              { id: "last-week", label: "Last Week" },
              { id: "this-week", label: "This Week" },
              { id: "next-week", label: "Next Week" },
              { id: "this-month", label: "This Month" },
            ].map((chip) => {
              const active = dateChip === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() =>
                    setDateChip(active ? null : chip.id)
                  }
                  className="h-7 px-3 rounded-full slds-text-3 font-medium transition-colors"
                  style={
                    active
                      ? {
                          backgroundColor: "#145F33",
                          color: "white",
                          border: "1px solid #145F33",
                        }
                      : {
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          color:
                            "var(--slds-g-color-text-default)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }
                  }
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  {[
                    "ID",
                    "Session Date",
                    "Session Time",
                    "Minutes",
                    "Campus",
                    "Programs",
                    "Description",
                    "Actions",
                  ].map((h) => (
                    <TableHead
                      key={h}
                      className="text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-16 text-center"
                    >
                      <Calendar
                        className="h-8 w-8 mx-auto mb-2"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      />
                      <p
                        className="slds-text-4 font-medium"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        No sessions found
                      </p>
                      <p
                        className="slds-text-3 mt-1"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {sessions.length === 0
                          ? "Click New Session to add the first session for this class."
                          : "Adjust your search or filters."}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s) => (
                    <TableRow
                      key={s.id}
                      className="hover:bg-gray-50 transition-colors"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <TableCell
                        className="slds-text-3 font-mono whitespace-nowrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {s.id}
                      </TableCell>
                      <TableCell
                        className="slds-text-4 whitespace-nowrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {s.date}
                      </TableCell>
                      <TableCell
                        className="slds-text-4 whitespace-nowrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {s.time}
                      </TableCell>
                      <TableCell
                        className="slds-text-4"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {s.sessionMinutes}
                      </TableCell>
                      <TableCell>
                        <p
                          className="slds-text-4 whitespace-nowrap"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {s.campus}
                        </p>
                        {s.campus === "Other" &&
                          s.otherLocation && (
                            <p
                              className="slds-text-3"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                              title={s.otherLocation}
                            >
                              {s.otherLocation.substring(0, 30)}
                              {s.otherLocation.length > 30
                                ? "…"
                                : ""}
                            </p>
                          )}
                      </TableCell>
                      <TableCell style={{ maxWidth: "140px" }}>
                        {s.programs.length === 0 ? (
                          <span
                            className="slds-text-3"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            —
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {s.programs.slice(0, 2).map((p) => (
                              <span
                                key={p.id}
                                className="inline-block px-1.5 py-0.5 rounded slds-text-3"
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-alt-2)",
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                  border:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {p.name}
                              </span>
                            ))}
                            {s.programs.length > 2 && (
                              <span
                                className="slds-text-3"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                +{s.programs.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell style={{ maxWidth: "200px" }}>
                        <p
                          className="slds-text-4 truncate"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                          title={s.description}
                        >
                          {s.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <button
                            title="Edit"
                            onClick={() => onEditSession(s)}
                            className="p-2 rounded transition-colors flex items-center justify-center flex-shrink-0"
                            style={{
                              color: "#145F33",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#e6f2eb")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            title="Generate Report"
                            onClick={() =>
                              generateSessionReport(
                                s,
                                parentClass,
                              )
                            }
                            className="p-1.5 rounded transition-colors"
                            style={{
                              color: "#145F33",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#e6f2eb")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>
                          <button
                            title="Delete"
                            onClick={() =>
                              setPendingDelete({
                                id: s.id,
                                name: s.date,
                              })
                            }
                            className="p-1.5 rounded transition-colors flex-shrink-0"
                            style={{
                              color: "#c23934",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.color = "#c23934";
                              (
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor =
                                "rgba(194, 57, 52, 0.08)";
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.color = "#c23934";
                              (
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor =
                                "transparent";
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent
          className="max-w-sm p-0"
          style={{
            borderRadius: "var(--slds-c-card-radius-border)",
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-0">
            <div className="flex items-start gap-3">
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#fef2f2" }}
              >
                <Trash2
                  className="h-4 w-4"
                  style={{ color: "#c23934" }}
                />
              </div>
              <div>
                <DialogTitle
                  className="slds-text-6 font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Delete Session
                </DialogTitle>
                <DialogDescription
                  className="slds-text-4 mt-1 leading-snug"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Are you sure you want to delete the session on{" "}
                  <span
                    className="font-medium"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {pendingDelete?.name}
                  </span>
                  ? This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex items-center justify-end gap-2 px-6 py-4">
            <button
              onClick={() => setPendingDelete(null)}
              className="h-9 px-4 rounded-full slds-text-4 font-medium transition-colors"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
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
              Cancel
            </button>
            <button
              onClick={() => {
                if (pendingDelete) {
                  onDeleteSession(pendingDelete.id);
                  setPendingDelete(null);
                }
              }}
              className="h-9 px-4 rounded-full slds-text-4 font-medium text-white transition-colors"
              style={{ backgroundColor: "#c23934" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#a61e19")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#c23934")
              }
            >
              Delete Session
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Shared class / session records ──────────────────────────────────────────
// The single in-memory source for the Classes page and the Instructor
// profile's Class Sessions tab (US 20096), so both read the same current
// records. Starts from INITIAL_CLASSES / INITIAL_SESSIONS themselves (no
// copy). In-memory only: edits survive in-app navigation, not a reload.

function createSharedList<T>(initial: T[]) {
  let current = initial;
  const listeners = new Set<() => void>();
  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };
  const get = () => current;
  const set: React.Dispatch<React.SetStateAction<T[]>> = (
    next,
  ) => {
    current =
      typeof next === "function"
        ? (next as (prev: T[]) => T[])(current)
        : next;
    listeners.forEach((l) => l());
  };
  const use = (): [T[], typeof set] => [
    useSyncExternalStore(subscribe, get, get),
    set,
  ];
  return { use, set };
}

const sharedClasses =
  createSharedList<ClassRecord>(INITIAL_CLASSES);
const sharedSessions =
  createSharedList<ClassSession>(INITIAL_SESSIONS);

/** Current classes, shared with every Classes-module entry point. */
export const useSharedClasses = sharedClasses.use;
/** Current class sessions, shared with every Classes-module entry point. */
export const useSharedClassSessions = sharedSessions.use;
/** Insert or replace (by session ID) one session in the shared records —
 *  used by Connections → Class Session so its saves reach the same source. */
export function upsertSharedClassSession(
  session: ClassSession,
) {
  sharedSessions.set((prev) =>
    prev.some((s) => s.id === session.id)
      ? prev.map((s) => (s.id === session.id ? session : s))
      : [session, ...prev],
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export function Classes() {
  const [view, setView] = useState<
    "list" | "sessions" | "learningModules"
  >("list");
  const [activeClass, setActiveClass] =
    useState<ClassRecord | null>(null);
  const [classes, setClasses] = useSharedClasses();
  const [sessions, setSessions] = useSharedClassSessions();

  // Class modal
  const [isClassModalOpen, setIsClassModalOpen] =
    useState(false);
  const [editingClass, setEditingClass] =
    useState<ClassRecord | null>(null);

  // View modal
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingClass, setViewingClass] =
    useState<ClassRecord | null>(null);

  // Session modal
  const [isSessionModalOpen, setIsSessionModalOpen] =
    useState(false);
  const [editingSession, setEditingSession] =
    useState<ClassSession | null>(null);
  // Class the New Session modal was opened from — null from the dashboard,
  // so a previously viewed class never leaks into the modal.
  const [sessionParentClass, setSessionParentClass] =
    useState<ClassRecord | null>(null);

  const openNewClass = () => {
    setEditingClass(null);
    setIsClassModalOpen(true);
  };
  const openEditClass = (c: ClassRecord) => {
    setEditingClass(c);
    setIsClassModalOpen(true);
  };
  const openViewClass = (c: ClassRecord) => {
    setViewingClass(c);
    setIsViewOpen(true);
  };
  const openSessions = (c: ClassRecord) => {
    setActiveClass(c);
    setView("sessions");
  };
  const openLearningModules = () => {
    setView("learningModules");
  };

  const saveClass = (data: ClassRecord) => {
    setClasses((prev) =>
      prev.find((c) => c.id === data.id)
        ? prev.map((c) => (c.id === data.id ? data : c))
        : [data, ...prev],
    );
    toast.success(
      editingClass
        ? "Class updated successfully."
        : "Class created successfully.",
    );
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    setSessions((prev) => prev.filter((s) => s.classId !== id));
    toast.success("Class deleted.");
  };

  const openNewSession = (parentClass?: ClassRecord) => {
    setEditingSession(null);
    setSessionParentClass(parentClass ?? null);
    setIsSessionModalOpen(true);
  };
  const openEditSession = (s: ClassSession) => {
    setEditingSession(s);
    setSessionParentClass(
      classes.find((c) => c.id === s.classId) ?? null,
    );
    setIsSessionModalOpen(true);
  };

  const saveSession = (data: ClassSession) => {
    setSessions((prev) =>
      prev.find((s) => s.id === data.id)
        ? prev.map((s) => (s.id === data.id ? data : s))
        : [data, ...prev],
    );
    toast.success(
      editingSession
        ? "Session updated successfully."
        : "Session created successfully.",
    );
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success("Session deleted.");
  };

  const classSessions = useMemo(
    () => sessions.filter((s) => s.classId === activeClass?.id),
    [sessions, activeClass],
  );

  return (
    <>
      {view === "list" ? (
        <ClassListView
          classes={classes}
          sessions={sessions}
          onNew={openNewClass}
          onNewSession={() => openNewSession()}
          onEdit={openEditClass}
          onView={openViewClass}
          onDelete={deleteClass}
          onSessions={openSessions}
          onLearningModules={openLearningModules}
        />
      ) : view === "sessions" && activeClass ? (
        <SessionsView
          parentClass={activeClass}
          sessions={classSessions}
          allSessions={sessions}
          onBack={() => setView("list")}
          onNewSession={() => openNewSession(activeClass)}
          onEditSession={openEditSession}
          onDeleteSession={deleteSession}
        />
      ) : view === "learningModules" ? (
        <LearningModules onBack={() => setView("list")} />
      ) : null}

      <ClassModal
        open={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        editing={editingClass}
        onSave={saveClass}
        onDelete={deleteClass}
      />

      <ViewClassModal
        open={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        cls={viewingClass}
      />

      <SessionModal
        open={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        editing={editingSession}
        parentClass={sessionParentClass ?? undefined}
        allClasses={classes}
        onSave={saveSession}
        onDelete={deleteSession}
        onModuleCreated={(classId, module) => {
          addModuleToClass(classId, module);
          setClasses((prev) =>
            prev.map((c) =>
              c.id === classId &&
              !c.modules.some((m) => m.id === module.id)
                ? { ...c, modules: [...c.modules, module] }
                : c,
            ),
          );
        }}
      />
    </>
  );
}
