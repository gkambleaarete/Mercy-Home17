import { useState, useEffect, useMemo } from "react";
import { DateInput } from "../ui/date-input";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../ui/alert";
import { YouthAlertIcons } from "../youth/YouthAlertIcons";
import {
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router";
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
import { toast } from "sonner";
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
  getProgramById,
  getPrograms,
  getCapacitySnapshots,
  resolveCapacityForDate,
  todayIso,
} from "../../data/mockProgramsData";
import { getActiveYouthForProgram } from "../../data/mockYouthProgramData";

// --- Components ---

import {
  YouthDetailView,
  ProgramDetailView,
} from "./ProgramDetailView";

// --- Main Container Component ---

function handleRefresh() {}

// Every Program Log entry is a shared ProgramRecord — the list and launches
// from a Program Record alike. Map it into the Program Log's program shape
// (ProgramDetailView only reads name/lastUpdate); its id is the record's id.
function programLogEntryFromRecord(
  programId: unknown,
): (typeof MOCK_PROGRAMS)[0] | null {
  const record = getProgramById(Number(programId));
  if (!record) return null;
  const snapshot = resolveCapacityForDate(
    record.id,
    getCapacitySnapshots(),
    todayIso(),
  );
  return {
    id: String(record.id),
    name: record.name,
    type: record.programType,
    status: record.status,
    // Same live count as the Program list: unique active Constituent IDs
    // (inactive youth / associations excluded by the query).
    census: `${new Set(getActiveYouthForProgram(record.id).map((y) => y.constituentId)).size}/${snapshot?.capacity ?? "—"}`,
    lastUpdate: "—",
    alerts: 0,
  };
}

/** Program from a `?programId=` URL value: digits only, existing record
 *  only — an invalid or unknown id never opens another Program. */
function programLogEntryFromUrl(value: string) {
  return /^\d+$/.test(value)
    ? programLogEntryFromRecord(value)
    : null;
}

export function ProgramLog() {
  const navigate = useNavigate();
  const location = useLocation();
  // A Program-specific launch is either a `?programId=` URL (shareable,
  // opens in a new tab) or the existing location.state launch. The URL wins.
  const [searchParams, setSearchParams] = useSearchParams();
  const urlProgramId = searchParams.get("programId");
  const initialEntry = () => {
    if (urlProgramId !== null)
      return programLogEntryFromUrl(urlProgramId);
    const programId = (location.state as any)?.programId;
    return programId
      ? programLogEntryFromRecord(programId)
      : null;
  };
  const [activeView, setActiveView] = useState<
    "list" | "detail" | "youth-detail"
  >(() => (initialEntry() ? "detail" : "list"));
  // Set when the Program came from a Program Record (or a Program link),
  // so Back returns there. A return to an entry first opened from this
  // list (fromProgramLogList) keeps Back on the list.
  const [programRecordId, setProgramRecordId] = useState<
    string | null
  >(() => {
    if (urlProgramId !== null)
      return programLogEntryFromUrl(urlProgramId)?.id ?? null;
    const state = location.state as any;
    if (!state?.programId || state.fromProgramLogList)
      return null;
    return (
      programLogEntryFromRecord(state.programId)?.id ?? null
    );
  });
  const [selectedProgram, setSelectedProgram] = useState<
    (typeof MOCK_PROGRAMS)[0] | null
  >(initialEntry);

  // Shown on the list (not a toast — on a direct load the app's Toaster
  // isn't subscribed yet when this page first renders).
  const unknownProgramId =
    urlProgramId !== null &&
    !programLogEntryFromUrl(urlProgramId)
      ? urlProgramId
      : null;

  // Back to the generic list also drops ?programId= so the URL matches.
  const showList = () => {
    if (urlProgramId !== null)
      setSearchParams({}, { replace: true });
    setActiveView("list");
  };
  const [selectedYouth, setSelectedYouth] = useState<
    (typeof YOUTH_STATUS)[0] | null
  >(null);

  // Keep the selection in sync with the launch source while mounted: the
  // URL's ?programId= when present, else legacy location.state, else none
  // (generic list). An invalid / unknown URL id never opens another
  // Program. Clicks inside this list don't change these values, so
  // list selection is left alone.
  const stateProgramId =
    (location.state as any)?.programId ?? null;
  const stateFromList = !!(location.state as any)
    ?.fromProgramLogList;
  useEffect(() => {
    let entry: (typeof MOCK_PROGRAMS)[0] | null = null;
    let recordId: string | null = null;
    if (urlProgramId !== null) {
      entry = programLogEntryFromUrl(urlProgramId);
      recordId = entry?.id ?? null;
    } else if (stateProgramId) {
      entry = programLogEntryFromRecord(stateProgramId);
      recordId = entry && !stateFromList ? entry.id : null;
    }
    setSelectedProgram(entry);
    setProgramRecordId(recordId);
    setSelectedYouth(null);
    setActiveView(entry ? "detail" : "list");
  }, [urlProgramId, stateProgramId, stateFromList]);
  const [searchQuery, setSearchQuery] = useState("");
  const [programs] = useState(() =>
    getPrograms().flatMap((p) => {
      const entry = programLogEntryFromRecord(p.id);
      return entry ? [entry] : [];
    }),
  );

  const handleProgramClick = (
    program: (typeof MOCK_PROGRAMS)[0],
  ) => {
    setSelectedProgram(program);
    setActiveView("detail");
  };

  const filteredPrograms = programs.filter(
    (p) =>
      p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const PROG_PAGE_SIZE = 12;
  const [programPage, setProgramPage] = useState(1);
  const programTotalPages = Math.max(
    1,
    Math.ceil(filteredPrograms.length / PROG_PAGE_SIZE),
  );
  const programSafePage = Math.min(
    programPage,
    programTotalPages,
  );
  const programPageRows = filteredPrograms.slice(
    (programSafePage - 1) * PROG_PAGE_SIZE,
    programSafePage * PROG_PAGE_SIZE,
  );

  useEffect(() => {
    setProgramPage(1);
  }, [searchQuery]);

  if (activeView === "youth-detail" && selectedYouth) {
    return (
      <YouthDetailView
        youth={selectedYouth}
        onBack={() => setActiveView("detail")}
        programName={selectedProgram?.name}
        onNavigateToList={showList}
      />
    );
  }

  if (activeView === "detail" && selectedProgram) {
    return (
      <ProgramDetailView
        program={selectedProgram}
        onBack={() =>
          programRecordId
            ? navigate(`/program/${programRecordId}`)
            : showList()
        }
        onNavigateToYouthDetail={(youth) => {
          setSelectedYouth(youth);
          setActiveView("youth-detail");
        }}
        onNavigate={(page) => {
          if (page === "disposal") {
            navigate("/manage-disposal", {
              state: {
                fromProgramLog: true,
                programName: selectedProgram.name,
                programId: selectedProgram.id,
              },
            });
          } else if (page === "pass-calendar") {
            // Pass Calendar scoped to THIS Program, by its Program record id.
            // With no such record there is no Program to scope to, so
            // nothing outside it is ever shown.
            const record = getProgramById(
              Number(selectedProgram.id),
            );
            if (!record) {
              toast.info(
                `No Program record is linked to ${selectedProgram.name}, so its Pass Calendar isn't available.`,
              );
              return;
            }
            navigate("/pass/calendar", {
              state: {
                scope: "program",
                programId: record.id,
                programName: record.name,
              },
            });
          } else if (page.startsWith("medications")) {
            const [, tab] = page.split(":");
            navigate("/medications", {
              state: {
                navSection: tab ?? null,
                fromProgramLog: true,
                fromProgramLogList: !programRecordId,
                programName: selectedProgram.name,
                programId: selectedProgram.id,
              },
            });
          }
        }}
        // Removed onYouthClick to enable observation dialog instead of youth detail page
      />
    );
  }

  // List View (Landing Page)
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
              <ClipboardList className="h-6 w-6" />
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
                Program Logs
              </h1>
            </div>
          </div>

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

      {unknownProgramId !== null && (
        <div className="px-6 pt-4">
          <Alert variant="warning" role="alert">
            <AlertCircle />
            <AlertTitle>Program not found</AlertTitle>
            <AlertDescription>
              {`No Program matches "${unknownProgramId}". Showing all Program Logs.`}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* KPI Metrics */}
      <div
        className="px-6 pt-6 pb-4"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-alt-2)",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            aria-label="View active programs"
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
                    Active Programs
                  </p>
                  <p
                    className="text-2xl font-bold mt-1 group-hover:text-green-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {
                      programs.filter(
                        (p) => p.status === "Active",
                      ).length
                    }
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <ClipboardList className="h-5 w-5 text-green-600 group-hover:text-green-700" />
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
            aria-label="View staff on duty"
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
                    Staff On-Duty
                  </p>
                  <p
                    className="text-2xl font-bold mt-1 group-hover:text-blue-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    10
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <User className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
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
            aria-label="View active alerts"
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
                    Active Alerts
                  </p>
                  <p
                    className="text-2xl font-bold mt-1 group-hover:text-red-700 transition-colors"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {programs.reduce(
                      (sum, p) => sum + p.alerts,
                      0,
                    )}
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
        className="flex-1 overflow-y-auto app-page-x pb-6"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-alt-2)",
        }}
      >
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
            className="h-[52px] px-6 !py-0 flex items-center"
            style={{
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            <div className="w-full flex items-center justify-between">
              <CardTitle
                className="text-base font-bold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                All Programs ({filteredPrograms.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                  <Input
                    placeholder="Search programs"
                    className="pl-9 h-9"
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
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
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
                    { label: "PROGRAM NAME", cls: "pl-6" },
                    { label: "PROGRAM TYPE", cls: "px-2" },
                    { label: "CENSUS", cls: "px-2" },
                    { label: "STATUS", cls: "px-2 pr-6" },
                  ].map(({ label, cls }) => (
                    <TableHead
                      key={label}
                      className={`h-10 ${cls}`}
                      style={{
                        color: "var(--slds-g-color-text-weak)",
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
                {programPageRows.map((program) => (
                  <TableRow
                    key={program.id}
                    className="cursor-pointer transition-colors"
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                    onClick={() => handleProgramClick(program)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--slds-g-color-background-alt)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "transparent";
                    }}
                  >
                    <TableCell className="pl-6 py-3 font-medium">
                      <div className="flex items-center gap-3">
                        <div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProgramClick(program);
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
                            {program.name}
                          </button>
                          <div
                            className="text-xs"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Last Updated: {program.lastUpdate}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className="px-2 py-3"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                        fontSize: 13,
                      }}
                    >
                      {program.type}
                    </TableCell>
                    <TableCell
                      className="px-2 py-3"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                        fontSize: 13,
                      }}
                    >
                      {program.census}
                    </TableCell>
                    <TableCell className="px-2 py-3 pr-6">
                      <Badge
                        variant="outline"
                        className="rounded-full text-xs font-medium px-2.5"
                        style={{
                          backgroundColor:
                            program.status === "Active"
                              ? "#D0E9DA"
                              : "var(--slds-g-color-background-alt)",
                          color:
                            program.status === "Active"
                              ? "#1B5E20"
                              : "var(--slds-g-color-text-weak)",
                          border: "none",
                        }}
                      >
                        {program.status}
                      </Badge>
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
                  {filteredPrograms.length === 0
                    ? "0"
                    : `${(programSafePage - 1) * PROG_PAGE_SIZE + 1}–${Math.min(programSafePage * PROG_PAGE_SIZE, filteredPrograms.length)}`}
                </span>
                {" of "}
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {filteredPrograms.length}
                </span>
                {" records"}
              </p>
              {programTotalPages > 1 && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setProgramPage((p) => Math.max(1, p - 1))
                    }
                    disabled={programSafePage === 1}
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
                      {programSafePage}
                    </span>
                    {" of "}
                    <span style={{ fontWeight: 600 }}>
                      {programTotalPages}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setProgramPage((p) =>
                        Math.min(programTotalPages, p + 1),
                      )
                    }
                    disabled={
                      programSafePage === programTotalPages
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
      </div>
    </div>
  );
}