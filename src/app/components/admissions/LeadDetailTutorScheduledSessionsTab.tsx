import React, { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Copy,
  RefreshCw,
  Printer,
  ChevronsUpDown,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
} from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "../ui/utils";
import { DateInput } from "../ui/date-input";
import { TimeInput } from "../ui/time-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import {
  useTutorMatchSnapshot,
  visibleOccurrences,
  type PersonRef,
} from "../../data/tutorMatchStore";
import { getDemoUserName } from "../../lib/demoIdentity";

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionStatus = "Scheduled" | "Completed" | "Cancelled";

interface SessionRecord {
  id: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  youth: string;
  tutor: string;
  campus: string;
  location: string;
  status: SessionStatus;
  createdBy: string;
  lastModifiedDate: string;
  comment: string;
}

// ─── Reference Data ───────────────────────────────────────────────────────────

const TUTOR_OPTIONS = [
  "Alex Rivera",
  "Brandon Hayes",
  "Christine Park",
  "David Nguyen",
  "Emily Johnson",
  "Franklin Torres",
  "Grace Kim",
  "Henry Okafor",
  "Isabella Reyes",
  "James Washington",
];

const CAMPUS_OPTIONS = [
  "West Loop",
  "Walsh",
  "Offsite",
  "Belmont",
  "Evanston",
];

const LOCATIONS_BY_CAMPUS: Record<string, string[]> = {
  "West Loop": [
    "Room 101",
    "Room 102",
    "Conference Room A",
    "Library — West Loop",
    "Computer Lab",
  ],
  Walsh: [
    "Main Hall",
    "Study Room 1",
    "Study Room 2",
    "Walsh Library",
    "Multipurpose Room",
  ],
  Offsite: [
    "Constituent's Home",
    "Community Center",
    "Public Library",
    "Partner Site",
  ],
  Belmont: ["Room 201", "Room 202", "Belmont Study Hall"],
  Evanston: [
    "Room 301",
    "Room 302",
    "Evanston Resource Center",
  ],
};

const STATUS_BADGE: Record<
  SessionStatus,
  { bg: string; color: string; border: string }
> = {
  Scheduled: {
    bg: "#f0fdf4",
    color: "#145F33",
    border: "#bbf7d0",
  },
  Completed: {
    bg: "#eff6ff",
    color: "#1d4ed8",
    border: "#bfdbfe",
  },
  Cancelled: {
    bg: "#f3f4f6",
    color: "#6b7280",
    border: "#d1d5db",
  },
};

const PAGE_SIZE = 10;

const YOUTH_NAME = "Alex Martinez";

const EMPTY_FORM = {
  sessionDate: "",
  startTime: "",
  endTime: "",
  tutor: "",
  campus: "",
  location: "",
  status: "Scheduled" as SessionStatus,
  comment: "",
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_SESSIONS: SessionRecord[] = [
  {
    id: 1,
    sessionDate: "07/07/2026",
    startTime: "09:00",
    endTime: "10:00",
    youth: YOUTH_NAME,
    tutor: "Emily Johnson",
    campus: "West Loop",
    location: "Room 101",
    status: "Completed",
    createdBy: "Admin",
    lastModifiedDate: "07/07/2026",
    comment: "",
  },
  {
    id: 2,
    sessionDate: "07/10/2026",
    startTime: "14:00",
    endTime: "15:00",
    youth: YOUTH_NAME,
    tutor: "Emily Johnson",
    campus: "West Loop",
    location: "Room 101",
    status: "Completed",
    createdBy: "Admin",
    lastModifiedDate: "07/10/2026",
    comment: "",
  },
  {
    id: 3,
    sessionDate: "07/14/2026",
    startTime: "09:00",
    endTime: "10:00",
    youth: YOUTH_NAME,
    tutor: "Emily Johnson",
    campus: "West Loop",
    location: "Room 101",
    status: "Completed",
    createdBy: "Admin",
    lastModifiedDate: "07/14/2026",
    comment: "",
  },
  {
    id: 4,
    sessionDate: "07/17/2026",
    startTime: "09:00",
    endTime: "10:00",
    youth: YOUTH_NAME,
    tutor: "Emily Johnson",
    campus: "West Loop",
    location: "Room 101",
    status: "Scheduled",
    createdBy: "Admin",
    lastModifiedDate: "07/14/2026",
    comment: "",
  },
  {
    id: 5,
    sessionDate: "07/21/2026",
    startTime: "09:00",
    endTime: "10:00",
    youth: YOUTH_NAME,
    tutor: "Emily Johnson",
    campus: "West Loop",
    location: "Room 102",
    status: "Scheduled",
    createdBy: "Admin",
    lastModifiedDate: "07/14/2026",
    comment: "",
  },
  {
    id: 6,
    sessionDate: "07/24/2026",
    startTime: "14:00",
    endTime: "15:00",
    youth: YOUTH_NAME,
    tutor: "Brandon Hayes",
    campus: "Walsh",
    location: "Study Room 1",
    status: "Scheduled",
    createdBy: "Admin",
    lastModifiedDate: "07/14/2026",
    comment: "",
  },
  {
    id: 7,
    sessionDate: "06/23/2026",
    startTime: "10:00",
    endTime: "11:00",
    youth: YOUTH_NAME,
    tutor: "Christine Park",
    campus: "Belmont",
    location: "Room 201",
    status: "Cancelled",
    createdBy: "Admin",
    lastModifiedDate: "06/20/2026",
    comment: "Youth unavailable",
  },
  {
    id: 8,
    sessionDate: "07/28/2026",
    startTime: "09:00",
    endTime: "10:00",
    youth: YOUTH_NAME,
    tutor: "Emily Johnson",
    campus: "West Loop",
    location: "Room 101",
    status: "Scheduled",
    createdBy: "Admin",
    lastModifiedDate: "07/14/2026",
    comment: "",
  },
  {
    id: 9,
    sessionDate: "07/31/2026",
    startTime: "09:00",
    endTime: "10:00",
    youth: YOUTH_NAME,
    tutor: "Emily Johnson",
    campus: "West Loop",
    location: "Room 101",
    status: "Scheduled",
    createdBy: "Admin",
    lastModifiedDate: "07/14/2026",
    comment: "",
  },
  {
    id: 10,
    sessionDate: "08/04/2026",
    startTime: "14:00",
    endTime: "15:00",
    youth: YOUTH_NAME,
    tutor: "Brandon Hayes",
    campus: "Walsh",
    location: "Study Room 2",
    status: "Scheduled",
    createdBy: "Admin",
    lastModifiedDate: "07/14/2026",
    comment: "",
  },
  {
    id: 11,
    sessionDate: "08/07/2026",
    startTime: "09:00",
    endTime: "10:00",
    youth: YOUTH_NAME,
    tutor: "Emily Johnson",
    campus: "West Loop",
    location: "Room 101",
    status: "Scheduled",
    createdBy: "Admin",
    lastModifiedDate: "07/14/2026",
    comment: "",
  },
  {
    id: 12,
    sessionDate: "08/11/2026",
    startTime: "09:00",
    endTime: "10:00",
    youth: YOUTH_NAME,
    tutor: "Grace Kim",
    campus: "Evanston",
    location: "Room 301",
    status: "Scheduled",
    createdBy: "Admin",
    lastModifiedDate: "07/14/2026",
    comment: "",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toInputDate(mmddyyyy: string) {
  if (!mmddyyyy) return "";
  const [m, d, y] = mmddyyyy.split("/");
  return y && m && d ? `${y}-${m}-${d}` : "";
}

function fromInputDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

function formatDisplayDate(mmddyyyy: string) {
  if (!mmddyyyy) return "—";
  const [m, d, y] = mmddyyyy.split("/");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

function to12Hour(time24: string) {
  if (!time24) return "—";
  const [h, m] = time24.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CalendarIllustration() {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="12"
        y="22"
        width="72"
        height="58"
        rx="5"
        fill="#f0fdf4"
        stroke="#bbf7d0"
        strokeWidth="1.5"
      />
      <rect
        x="12"
        y="22"
        width="72"
        height="18"
        rx="5"
        fill="#dcfce7"
        stroke="#bbf7d0"
        strokeWidth="1.5"
      />
      <rect
        x="12"
        y="33"
        width="72"
        height="7"
        fill="#dcfce7"
      />
      <line
        x1="30"
        y1="16"
        x2="30"
        y2="28"
        stroke="#145F33"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="66"
        y1="16"
        x2="66"
        y2="28"
        stroke="#145F33"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect
        x="20"
        y="48"
        width="12"
        height="10"
        rx="2"
        fill="#bbf7d0"
      />
      <rect
        x="38"
        y="48"
        width="12"
        height="10"
        rx="2"
        fill="#145F33"
        opacity="0.7"
      />
      <rect
        x="56"
        y="48"
        width="12"
        height="10"
        rx="2"
        fill="#bbf7d0"
      />
      <rect
        x="20"
        y="64"
        width="12"
        height="10"
        rx="2"
        fill="#bbf7d0"
      />
      <rect
        x="38"
        y="64"
        width="12"
        height="10"
        rx="2"
        fill="#bbf7d0"
      />
      <rect
        x="56"
        y="64"
        width="12"
        height="10"
        rx="2"
        fill="#e5e7eb"
      />
    </svg>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse px-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex gap-4 py-3 border-b"
          style={{
            borderColor: "var(--slds-g-color-border-base-1)",
          }}
        >
          {[80, 70, 70, 90, 90, 80, 100, 80, 80, 80, 50].map(
            (w, j) => (
              <div
                key={j}
                className="h-4 rounded"
                style={{
                  width: w,
                  backgroundColor:
                    "var(--slds-g-color-border-base-1)",
                }}
              />
            ),
          )}
        </div>
      ))}
    </div>
  );
}

interface SearchableSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  hasError?: boolean;
}

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  hasError,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      open={open}
      onOpenChange={disabled ? undefined : setOpen}
    >
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full h-9 px-3 flex items-center justify-between rounded text-[13px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            border: hasError
              ? "1px solid #c23934"
              : "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor: disabled
              ? "var(--slds-g-color-background-alt)"
              : "var(--slds-g-color-background-base)",
            color: value
              ? "var(--slds-g-color-text-default)"
              : "var(--slds-g-color-text-weak)",
          }}
        >
          <span className="truncate">
            {value || placeholder}
          </span>
          <ChevronsUpDown
            className="h-3.5 w-3.5 ml-2 flex-shrink-0"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        style={{
          width: "var(--radix-popover-trigger-width)",
          zIndex: 60,
        }}
      >
        <Command>
          <CommandInput
            placeholder="Search…"
            className="h-9 text-[13px]"
          />
          <CommandList>
            <CommandEmpty
              className="py-4 text-center text-[13px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              No results found.
            </CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className="text-[13px] cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3.5 w-3.5 flex-shrink-0",
                      value === opt
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                    style={{ color: "#145F33" }}
                  />
                  {opt}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p
      className="flex items-center gap-1 text-[11px]"
      style={{ color: "#c23934" }}
    >
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      {msg}
    </p>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/** 12-hour "h:mm AM/PM" → this tab's 24-hour "HH:MM". */
function to24(t12: string) {
  const m = t12.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return "";
  const h =
    (Number(m[1]) % 12) +
    (m[3].toUpperCase() === "PM" ? 12 : 0);
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

export function LeadDetailTutorScheduledSessionsTab({
  youth,
  tutor: tutorContext,
}: { youth?: PersonRef; tutor?: PersonRef } = {}) {
  const [localRecords, setRecords] =
    useState<SessionRecord[]>(SEED_SESSIONS);
  // Sessions auto-created from this profile's Tutor Matches (US 20093),
  // read from the shared Tutor Match store — shown read-only here (they
  // are managed through their Tutor Match). Negative ids keep them apart
  // from this tab's own records.
  const tutorSnapshot = useTutorMatchSnapshot();
  const generatedIds = React.useRef(new Map<number, string>());
  const generated = useMemo<SessionRecord[]>(() => {
    if (!youth && !tutorContext) return [];
    const matches = Object.values(tutorSnapshot.matches).filter(
      (m) =>
        (!youth || m.youthId === youth.id) &&
        (!tutorContext || m.tutorId === tutorContext.id),
    );
    const byId = new Map(matches.map((m) => [m.id, m]));
    generatedIds.current.clear();
    return visibleOccurrences(
      tutorSnapshot,
      new Set(byId.keys()),
    ).map((o, i) => {
      const m = byId.get(o.matchId)!;
      generatedIds.current.set(-(i + 1), o.id);
      return {
        id: -(i + 1),
        sessionDate: o.date,
        startTime: to24(o.startTime),
        endTime: to24(o.endTime),
        youth: m.youthName,
        tutor: m.tutorName,
        campus: m.campus,
        location: m.location,
        status: "Scheduled" as SessionStatus,
        createdBy: `Tutor Match ${m.id}`,
        lastModifiedDate: "",
        comment: "",
      };
    });
  }, [tutorSnapshot, youth, tutorContext]);
  const records = useMemo(
    () => [...generated, ...localRecords],
    [generated, localRecords],
  );
  const isGenerated = (id: number | null) =>
    id !== null && id < 0;
  const [selectedId, setSelectedId] = useState<number | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [activeStart, setActiveStart] = useState("");
  const [activeEnd, setActiveEnd] = useState("");
  const [filterError, setFilterError] = useState("");

  // Sort
  const [sortCol, setSortCol] = useState<
    "sessionDate" | "status" | null
  >("sessionDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Pagination
  const [page, setPage] = useState(1);

  // Connection modal (Create / Edit / Copy)
  const [connModalOpen, setConnModalOpen] = useState(false);
  const [connMode, setConnMode] = useState<
    "create" | "edit" | "copy"
  >("create");
  const [connEditId, setConnEditId] = useState<number | null>(
    null,
  );
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formErrors, setFormErrors] = useState<
    Partial<Record<string, string>>
  >({});

  const selectedRecord =
    records.find((r) => r.id === selectedId) ?? null;
  const locationOptions = form.campus
    ? (LOCATIONS_BY_CAMPUS[form.campus] ?? [])
    : [];

  // ── Filtering + sorting ────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let rows = [...records];
    if (activeStart)
      rows = rows.filter(
        (r) =>
          toInputDate(r.sessionDate) >=
          toInputDate(activeStart),
      );
    if (activeEnd)
      rows = rows.filter(
        (r) =>
          toInputDate(r.sessionDate) <= toInputDate(activeEnd),
      );
    if (sortCol) {
      rows.sort((a, b) => {
        const av =
          sortCol === "sessionDate"
            ? toInputDate(a.sessionDate)
            : a.status;
        const bv =
          sortCol === "sessionDate"
            ? toInputDate(b.sessionDate)
            : b.status;
        return sortDir === "asc"
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      });
    }
    return rows;
  }, [records, activeStart, activeEnd, sortCol, sortDir]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function toggleSort(col: typeof sortCol) {
    if (sortCol === col)
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  function handleSearch() {
    if (
      filterStart &&
      filterEnd &&
      toInputDate(filterEnd) < toInputDate(filterStart)
    ) {
      setFilterError(
        "End Date must be greater than or equal to Start Date.",
      );
      return;
    }
    setFilterError("");
    setActiveStart(filterStart);
    setActiveEnd(filterEnd);
    setPage(1);
  }

  function handleReset() {
    setFilterStart("");
    setFilterEnd("");
    setActiveStart("");
    setActiveEnd("");
    setFilterError("");
    setPage(1);
  }

  function handleRefresh() {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Session list refreshed.");
    }, 800);
  }

  function handlePrint() {
    toast.success("Preparing print view…");
    window.print();
  }

  function openCreate() {
    setConnMode("create");
    setConnEditId(null);
    setForm({ ...EMPTY_FORM });
    setFormErrors({});
    setConnModalOpen(true);
  }

  function openEdit() {
    if (!selectedRecord) return;
    if (isGenerated(selectedRecord.id)) {
      toast.info("This session comes from a Tutor Match", {
        description:
          "Open the Tutor Session connection or edit its Tutor Match instead.",
      });
      return;
    }
    setConnMode("edit");
    setConnEditId(selectedRecord.id);
    setForm({
      sessionDate: selectedRecord.sessionDate,
      startTime: selectedRecord.startTime,
      endTime: selectedRecord.endTime,
      tutor: selectedRecord.tutor,
      campus: selectedRecord.campus,
      location: selectedRecord.location,
      status: selectedRecord.status,
      comment: selectedRecord.comment,
    });
    setFormErrors({});
    setConnModalOpen(true);
  }

  function openCopy() {
    if (!selectedRecord) return;
    setConnMode("copy");
    setConnEditId(null);
    setForm({
      sessionDate: selectedRecord.sessionDate,
      startTime: selectedRecord.startTime,
      endTime: selectedRecord.endTime,
      tutor: selectedRecord.tutor,
      campus: selectedRecord.campus,
      location: selectedRecord.location,
      status: selectedRecord.status,
      comment: selectedRecord.comment,
    });
    setFormErrors({});
    setConnModalOpen(true);
  }

  function setField<K extends keyof typeof EMPTY_FORM>(
    key: K,
    val: (typeof EMPTY_FORM)[K],
  ) {
    setForm((f) => ({ ...f, [key]: val }));
    setFormErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.sessionDate)
      errs.sessionDate = "Session Date is required.";
    if (!form.startTime)
      errs.startTime = "Start Time is required.";
    if (!form.endTime) errs.endTime = "End Time is required.";
    if (
      form.startTime &&
      form.endTime &&
      form.endTime <= form.startTime
    )
      errs.endTime = "End Time must be after Start Time.";
    if (!form.tutor) errs.tutor = "Tutor is required.";
    if (!form.campus) errs.campus = "Campus is required.";
    if (!form.location) errs.location = "Location is required.";
    return errs;
  }

  function handleConnSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    const now = "07/16/2026";
    if (connMode === "edit" && connEditId !== null) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === connEditId
            ? {
                ...r,
                ...form,
                youth: YOUTH_NAME,
                lastModifiedDate: now,
              }
            : r,
        ),
      );
      toast.success("Session updated successfully.");
    } else {
      const rec: SessionRecord = {
        id: Date.now(),
        ...form,
        youth: YOUTH_NAME,
        createdBy: getDemoUserName(),
        lastModifiedDate: now,
      };
      setRecords((prev) => [...prev, rec]);
      setSelectedId(rec.id);
      if (connMode === "copy")
        toast.success("Session copied successfully.");
      else toast.success("Session created successfully.");
    }
    setConnModalOpen(false);
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const secondaryBtnBase =
    "h-8 px-3 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const secondaryBtnStyle: React.CSSProperties = {
    border: "1px solid var(--slds-g-color-border-base-1)",
    backgroundColor: "var(--slds-g-color-background-base)",
    color: "var(--slds-g-color-text-default)",
  };
  const inputBase =
    "w-full h-9 px-3 rounded text-[13px] focus:outline-none focus:ring-1 focus:ring-[#145F33] disabled:opacity-50 disabled:cursor-not-allowed";
  const labelStyle: React.CSSProperties = {
    color: "var(--slds-g-color-text-weak)",
  };
  const inputStyle = (
    hasErr?: boolean,
    readOnly?: boolean,
  ): React.CSSProperties => ({
    border: hasErr
      ? "1px solid #c23934"
      : "1px solid var(--slds-g-color-border-base-1)",
    backgroundColor: readOnly
      ? "var(--slds-g-color-background-alt)"
      : "var(--slds-g-color-background-base)",
    color: "var(--slds-g-color-text-default)",
  });

  return (
    <>
      {/* ── Page Card ─────────────────────────────────────────────────────── */}
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        {/* Card Header */}
        <div
          className="px-4 py-3"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <h3
            className="text-[13px] font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Tutor Scheduled Sessions
          </h3>
          <p
            className="slds-text-3 mt-0.5"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            View, search, and manage tutoring sessions scheduled
            for the selected Youth constituent.
          </p>
        </div>

        {/* Toolbar */}
        <div
          className="px-4 py-2 flex items-center gap-2 flex-wrap"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <button
            onClick={openCreate}
            className="h-8 px-3 rounded-full text-[12px] font-medium text-white flex items-center gap-1.5 transition-colors"
            style={{ backgroundColor: "#145F33" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#0e4524")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#145F33")
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Create New Connection
          </button>

          <button
            onClick={handleRefresh}
            className="h-8 w-8 rounded-full flex items-center justify-center"
            style={secondaryBtnStyle}
            title="Refresh"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
              style={{ color: "var(--slds-g-color-text-weak)" }}
            />
          </button>

          <button
            onClick={handlePrint}
            className="h-8 w-8 rounded-full flex items-center justify-center"
            style={secondaryBtnStyle}
            title="Print"
          >
            <Printer
              className="h-3.5 w-3.5"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            />
          </button>
        </div>

        {/* Search Section */}
        <div
          className="px-4 py-4"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <p
            className="text-[12px] font-semibold uppercase tracking-wide mb-3"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Search Sessions
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5 flex-1 min-w-[160px]">
              <label
                className="block slds-form-label"
                style={labelStyle}
              >
                Start Date
              </label>
              <DateInput
                value={isoToMdy(toInputDate(filterStart))}
                onChange={(v) =>
                  ((e) => {
                    setFilterStart(
                      fromInputDate(e.target.value),
                    );
                    setFilterError("");
                  })({ target: { value: mdyToIso(v) } })
                }
                className={inputBase}
                style={inputStyle()}
              />
            </div>
            <div className="space-y-1.5 flex-1 min-w-[160px]">
              <label
                className="block slds-form-label"
                style={labelStyle}
              >
                End Date
              </label>
              <DateInput
                value={isoToMdy(toInputDate(filterEnd))}
                onChange={(v) =>
                  ((e) => {
                    setFilterEnd(fromInputDate(e.target.value));
                    setFilterError("");
                  })({ target: { value: mdyToIso(v) } })
                }
                className={inputBase}
                style={inputStyle()}
              />
            </div>
            <div className="flex items-center gap-2 pb-0.5">
              <button
                onClick={handleSearch}
                className="h-9 px-5 rounded-full text-[13px] font-medium text-white"
                style={{ backgroundColor: "#145F33" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "#0e4524")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "#145F33")
                }
              >
                Search
              </button>
              <button
                onClick={handleReset}
                className="h-9 px-5 rounded-full text-[13px] font-medium"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Reset
              </button>
            </div>
          </div>
          {filterError ? (
            <p
              className="mt-2 flex items-center gap-1 text-[11px]"
              style={{ color: "#c23934" }}
            >
              <AlertCircle className="h-3 w-3" />
              {filterError}
            </p>
          ) : (
            <p
              className="mt-2 slds-text-3"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Leave either date blank to perform an open-ended
              search.
            </p>
          )}
        </div>

        {/* Table / Empty State */}
        {isLoading ? (
          <div className="py-4">
            <TableSkeleton />
          </div>
        ) : pageRows.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <th
                      className="px-4 py-2.5 text-left font-semibold whitespace-nowrap cursor-pointer select-none"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                      onClick={() => toggleSort("sessionDate")}
                    >
                      <span className="flex items-center gap-1">
                        Session Date
                        <ArrowUpDown
                          className="h-3 w-3"
                          style={{
                            color:
                              sortCol === "sessionDate"
                                ? "#145F33"
                                : "var(--slds-g-color-text-weak)",
                          }}
                        />
                      </span>
                    </th>
                    {[
                      "Start Time",
                      "End Time",
                      "Youth",
                      "Tutor",
                      "Campus",
                      "Location",
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-2.5 text-left font-semibold whitespace-nowrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                    <th
                      className="px-4 py-2.5 text-left font-semibold whitespace-nowrap cursor-pointer select-none"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                      onClick={() => toggleSort("status")}
                    >
                      <span className="flex items-center gap-1">
                        Session Status
                        <ArrowUpDown
                          className="h-3 w-3"
                          style={{
                            color:
                              sortCol === "status"
                                ? "#145F33"
                                : "var(--slds-g-color-text-weak)",
                          }}
                        />
                      </span>
                    </th>
                    {[
                      "Created By",
                      "Last Modified Date",
                      "Actions",
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-2.5 text-left font-semibold whitespace-nowrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row) => {
                    const badge = STATUS_BADGE[row.status];
                    const isSelected = row.id === selectedId;
                    return (
                      <tr
                        key={row.id}
                        onClick={() =>
                          setSelectedId((p) =>
                            p === row.id ? null : row.id,
                          )
                        }
                        className="cursor-pointer transition-colors"
                        style={{
                          backgroundColor: isSelected
                            ? "rgba(20,95,51,0.06)"
                            : undefined,
                          outline: isSelected
                            ? "2px solid rgba(20,95,51,0.3)"
                            : undefined,
                          outlineOffset: "-2px",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.backgroundColor =
                              "var(--slds-g-color-background-alt)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.backgroundColor =
                              "";
                        }}
                      >
                        <td
                          className="px-4 py-3 font-medium whitespace-nowrap"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {formatDisplayDate(row.sessionDate)}
                        </td>
                        <td
                          className="px-4 py-3 whitespace-nowrap"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {to12Hour(row.startTime)}
                        </td>
                        <td
                          className="px-4 py-3 whitespace-nowrap"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {to12Hour(row.endTime)}
                        </td>
                        <td
                          className="px-4 py-3 whitespace-nowrap"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {row.youth}
                        </td>
                        <td
                          className="px-4 py-3 whitespace-nowrap"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {row.tutor}
                        </td>
                        <td
                          className="px-4 py-3 whitespace-nowrap"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {row.campus}
                        </td>
                        <td
                          className="px-4 py-3 whitespace-nowrap"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {row.location}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
                            style={{
                              backgroundColor: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                            }}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 whitespace-nowrap"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {row.createdBy}
                        </td>
                        <td
                          className="px-4 py-3 whitespace-nowrap"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {formatDisplayDate(
                            row.lastModifiedDate,
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(row.id);
                                setTimeout(openEdit, 0);
                              }}
                              className="h-7 w-7 rounded flex items-center justify-center hover:bg-[#eff6ff]"
                              style={{ color: "#0176d3" }}
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(row.id);
                                setTimeout(() => {
                                  setConnMode("copy");
                                  setConnEditId(null);
                                  setForm({
                                    sessionDate:
                                      row.sessionDate,
                                    startTime: row.startTime,
                                    endTime: row.endTime,
                                    tutor: row.tutor,
                                    campus: row.campus,
                                    location: row.location,
                                    status: row.status,
                                    comment: row.comment,
                                  });
                                  setFormErrors({});
                                  setConnModalOpen(true);
                                }, 0);
                              }}
                              className="h-7 w-7 rounded flex items-center justify-center hover:bg-[#eff6ff]"
                              style={{ color: "#0176d3" }}
                              title="Copy"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              className="px-4 py-2.5 flex items-center justify-between"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <p
                className="slds-text-3"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {filtered.length} record
                {filtered.length !== 1 ? "s" : ""}
                {activeStart || activeEnd ? " (filtered)" : ""}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setPage((p) => Math.max(1, p - 1))
                    }
                    disabled={safePage === 1}
                    className="h-7 w-7 rounded flex items-center justify-center disabled:opacity-40"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  >
                    <ChevronLeft
                      className="h-3.5 w-3.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    />
                  </button>
                  <span
                    className="slds-text-3"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Page {safePage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) =>
                        Math.min(totalPages, p + 1),
                      )
                    }
                    disabled={safePage === totalPages}
                    className="h-7 w-7 rounded flex items-center justify-center disabled:opacity-40"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  >
                    <ChevronRight
                      className="h-3.5 w-3.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
            <CalendarIllustration />
            <h3
              className="mt-4 text-[14px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              No Scheduled Tutor Sessions
            </h3>
            <p
              className="mt-1.5 slds-text-4 max-w-xs"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              No tutoring sessions are currently scheduled for
              this Youth.
            </p>
            <button
              onClick={openCreate}
              className="mt-4 h-8 px-4 rounded-full text-[12px] font-medium text-white flex items-center gap-1.5 transition-colors"
              style={{ backgroundColor: "#145F33" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#0e4524")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#145F33")
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Create New Connection
            </button>
          </div>
        )}
      </div>

      {/* ── Connection Modal ──────────────────────────────────────────────── */}
      {connModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget)
              setConnModalOpen(false);
          }}
        >
          <div
            className="w-full flex flex-col shadow-2xl rounded-xl overflow-hidden"
            style={{
              maxWidth: 760,
              maxHeight: "90vh",
              backgroundColor:
                "var(--slds-g-color-background-base)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 flex items-start justify-between flex-shrink-0"
              style={{
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <div>
                <h2
                  className="text-[15px] font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {connMode === "edit"
                    ? "Edit Connection"
                    : connMode === "copy"
                      ? "Copy Connection"
                      : "Create New Connection"}
                </h2>
                <p
                  className="slds-text-3 mt-0.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  {connMode === "edit"
                    ? "Update the details for this tutoring session."
                    : connMode === "copy"
                      ? "Create a new session using an existing session as a starting point."
                      : "Schedule a new tutoring session for this Youth constituent."}
                </p>
              </div>
              <button
                onClick={() => setConnModalOpen(false)}
                className="ml-4 flex-shrink-0 h-7 w-7 rounded flex items-center justify-center"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Connection Information */}
              <div>
                <h3
                  className="text-[12px] font-semibold uppercase tracking-wide mb-4"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                    paddingBottom: "8px",
                  }}
                >
                  Connection Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Youth — read-only */}
                  <div className="space-y-1.5">
                    <label
                      className="block slds-form-label mb-1.5"
                      style={labelStyle}
                    >
                      Youth
                    </label>
                    <input
                      readOnly
                      value={YOUTH_NAME}
                      className={inputBase}
                      style={inputStyle(false, true)}
                    />
                  </div>

                  {/* Tutor */}
                  <div className="space-y-1.5">
                    <label
                      className="block slds-form-label mb-1.5"
                      style={labelStyle}
                    >
                      Tutor{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <SearchableSelect
                      value={form.tutor}
                      onChange={(v) => setField("tutor", v)}
                      options={TUTOR_OPTIONS}
                      placeholder="Search tutors…"
                      hasError={!!formErrors.tutor}
                    />
                    <FieldError msg={formErrors.tutor} />
                  </div>

                  {/* Session Date */}
                  <div className="space-y-1.5">
                    <label
                      className="block slds-form-label mb-1.5"
                      style={labelStyle}
                    >
                      Session Date{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <DateInput
                      value={isoToMdy(
                        toInputDate(form.sessionDate),
                      )}
                      onChange={(v) =>
                        ((e) =>
                          setField(
                            "sessionDate",
                            fromInputDate(e.target.value),
                          ))({ target: { value: mdyToIso(v) } })
                      }
                      className={inputBase}
                      style={inputStyle(
                        !!formErrors.sessionDate,
                      )}
                    />
                    <FieldError msg={formErrors.sessionDate} />
                  </div>

                  {/* Session Status */}
                  <div className="space-y-1.5">
                    <label
                      className="block slds-form-label mb-1.5"
                      style={labelStyle}
                    >
                      Session Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setField(
                          "status",
                          e.target.value as SessionStatus,
                        )
                      }
                      className="w-full h-9 px-3 rounded text-[13px]"
                      style={inputStyle()}
                    >
                      <option value="Scheduled">
                        Scheduled
                      </option>
                      <option value="Completed">
                        Completed
                      </option>
                      <option value="Cancelled">
                        Cancelled
                      </option>
                    </select>
                  </div>

                  {/* Start Time */}
                  <div className="space-y-1.5">
                    <label
                      className="block slds-form-label mb-1.5"
                      style={labelStyle}
                    >
                      Start Time{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <TimeInput
                      format="24h"
                      value={form.startTime}
                      onChange={(val) => {
                        setField("startTime", val);
                        setFormErrors((err) => ({
                          ...err,
                          endTime: undefined,
                        }));
                      }}
                      aria-invalid={
                        formErrors.startTime ? true : undefined
                      }
                      placeholder="hh:mm AM/PM"
                    />
                    <FieldError msg={formErrors.startTime} />
                  </div>

                  {/* End Time */}
                  <div className="space-y-1.5">
                    <label
                      className="block slds-form-label mb-1.5"
                      style={labelStyle}
                    >
                      End Time{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <TimeInput
                      format="24h"
                      value={form.endTime}
                      onChange={(val) =>
                        setField("endTime", val)
                      }
                      aria-invalid={
                        formErrors.endTime ? true : undefined
                      }
                      placeholder="hh:mm AM/PM"
                    />
                    <FieldError msg={formErrors.endTime} />
                  </div>

                  {/* Campus */}
                  <div className="space-y-1.5">
                    <label
                      className="block slds-form-label mb-1.5"
                      style={labelStyle}
                    >
                      Campus{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <SearchableSelect
                      value={form.campus}
                      onChange={(v) => {
                        setField("campus", v);
                        setField("location", "");
                      }}
                      options={CAMPUS_OPTIONS}
                      placeholder="Select campus…"
                      hasError={!!formErrors.campus}
                    />
                    <FieldError msg={formErrors.campus} />
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label
                      className="block slds-form-label mb-1.5"
                      style={labelStyle}
                    >
                      Location{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <SearchableSelect
                      value={form.location}
                      onChange={(v) => setField("location", v)}
                      options={locationOptions}
                      placeholder={
                        form.campus
                          ? "Select location…"
                          : "Select a campus first"
                      }
                      disabled={!form.campus}
                      hasError={!!formErrors.location}
                    />
                    <FieldError msg={formErrors.location} />
                  </div>

                  {/* Comment */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label
                      className="block slds-form-label mb-1.5"
                      style={labelStyle}
                    >
                      Comment{" "}
                      <span
                        className="font-normal normal-case"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        (optional)
                      </span>
                    </label>
                    <textarea
                      value={form.comment}
                      onChange={(e) =>
                        setField("comment", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 rounded text-[13px] resize-none focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                      style={inputStyle()}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 flex items-center justify-end gap-2 flex-shrink-0"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <button
                onClick={() => setConnModalOpen(false)}
                className="h-9 px-5 rounded-full text-[13px] font-medium"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConnSave}
                className="h-9 px-5 rounded-full text-[13px] font-medium text-white"
                style={{ backgroundColor: "#145F33" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "#0e4524")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "#145F33")
                }
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}