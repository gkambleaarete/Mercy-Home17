import React, {
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Eye,
  ChevronsUpDown,
  Check,
  AlertCircle,
  Copy,
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
  approvedTutorOptions,
  closeTutorMatch,
  fixtureTutorRef,
  labelForRef,
  listedMatches,
  newTutorMatchId,
  saveTutorMatch,
  useTutorMatchSnapshot,
  visibleOccurrences,
  youthOptions,
  type PersonRef,
  type TutorMatch,
} from "../../data/tutorMatchStore";
import { useTutorRecords } from "../../data/tutorApplicantStore";
import { dayNumber } from "../../data/tutorRecurrence";

// ─── Types ────────────────────────────────────────────────────────────────────

type TutorMatchStatus = "Active" | "Inactive" | "Ended";

interface TutorMatchRecord {
  id: string;
  tutorId: string;
  youthId: string;
  tutor: string;
  youth: string;
  campus: string;
  location: string;
  startDate: string;
  endDate: string;
  sessionStartTime: string;
  sessionEndTime: string;
  status: TutorMatchStatus;
  isPrimaryTutor: boolean;
  comment: string;
  recurEvery: number;
  recurDays: string[];
  lastModifiedBy: string;
  lastModifiedDate: string;
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

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DAY_ABBR: Record<string, string> = {
  Sunday: "Sun",
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
};

const STATUS_BADGE: Record<
  TutorMatchStatus,
  { bg: string; color: string; border: string }
> = {
  Active: {
    bg: "#f0fdf4",
    color: "#145F33",
    border: "#bbf7d0",
  },
  Inactive: {
    bg: "#f3f4f6",
    color: "#6b7280",
    border: "#d1d5db",
  },
  Ended: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
};

const END_REASONS = [
  "Pairing Change",
  "Data Entry Error",
  "Youth Left Mercy Home",
  "Tutor Dismissed – Attendance",
  "Tutor Dismissed – Bad Fit",
  "Tutor Resigned – Personal Life",
  "Tutor Resigned – Moved",
  "Tutor Resigned – Program Inconsistency",
  "Tutor Resigned – No Longer Committed",
  "Contract Ended Early (Coronavirus 2020)",
];

const EMPTY_FORM = {
  tutor: "",
  youth: "",
  campus: "",
  location: "",
  startDate: "",
  endDate: "",
  sessionStartTime: "",
  sessionEndTime: "",
  status: "Active" as TutorMatchStatus,
  isPrimaryTutor: false,
  comment: "",
  recurEvery: 1,
  recurDays: [] as string[],
};

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
  if (!time24) return "";
  const [h, m] = time24.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

function formatSessionTime(start: string, end: string) {
  if (!start) return "—";
  return `${to12Hour(start)}${end ? ` – ${to12Hour(end)}` : ""}`;
}

interface FutureConnection {
  id: string;
  startDate: string;
  endDate: string;
  participants: string;
}

/** 24-hour "HH:MM" ↔ shared 12-hour "h:mm AM/PM". */
function to24Hour(t12: string) {
  const m = t12.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return "";
  const h =
    (Number(m[1]) % 12) +
    (m[3].toUpperCase() === "PM" ? 12 : 0);
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

const STATUS_DISPLAY: Record<
  TutorMatch["status"],
  TutorMatchStatus
> = {
  Active: "Active",
  Inactive: "Inactive",
  Ended: "Ended",
  Cancelled: "Ended",
  Removed: "Ended",
};

function toRecord(m: TutorMatch): TutorMatchRecord {
  const d = new Date(m.updatedAt || m.createdAt || 0);
  return {
    id: m.id,
    tutorId: m.tutorId,
    youthId: m.youthId,
    tutor: m.tutorName,
    youth: m.youthName,
    campus: m.campus,
    location: m.location,
    startDate: m.startDate,
    // Effective end once closed; the planned end stays on the Match.
    endDate: m.closedDate ?? m.endDate,
    sessionStartTime: to24Hour(m.startTime),
    sessionEndTime: to24Hour(m.endTime),
    status: STATUS_DISPLAY[m.status],
    isPrimaryTutor: !!m.isPrimaryTutor,
    comment: m.comment,
    recurEvery: m.recursEvery,
    recurDays: m.days,
    lastModifiedBy: "—",
    lastModifiedDate: m.updatedAt
      ? `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`
      : "",
  };
}

function formatRecurrence(days: string[], every: number) {
  if (!days.length) return "—";
  const abbrs = days.map((d) => DAY_ABBR[d]).join("/");
  return every === 1
    ? `Weekly — ${abbrs}`
    : `Every ${every}w — ${abbrs}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TutorIllustration() {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="10"
        y="28"
        width="76"
        height="52"
        rx="5"
        fill="#f0fdf4"
        stroke="#bbf7d0"
        strokeWidth="1.5"
      />
      <rect
        x="18"
        y="14"
        width="60"
        height="22"
        rx="4"
        fill="#dcfce7"
        stroke="#bbf7d0"
        strokeWidth="1.5"
      />
      <rect
        x="26"
        y="20"
        width="28"
        height="3"
        rx="1.5"
        fill="#86efac"
      />
      <rect
        x="26"
        y="27"
        width="18"
        height="3"
        rx="1.5"
        fill="#86efac"
      />
      <circle
        cx="66"
        cy="23"
        r="7"
        fill="#145F33"
        opacity="0.18"
      />
      <circle cx="66" cy="23" r="4.5" fill="#145F33" />
      <path
        d="M64 23l1.5 1.5 3-3"
        stroke="white"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="18"
        y="42"
        width="60"
        height="3"
        rx="1.5"
        fill="#dcfce7"
      />
      <rect
        x="18"
        y="50"
        width="44"
        height="3"
        rx="1.5"
        fill="#dcfce7"
      />
      <rect
        x="18"
        y="58"
        width="52"
        height="3"
        rx="1.5"
        fill="#dcfce7"
      />
      <rect
        x="18"
        y="66"
        width="36"
        height="3"
        rx="1.5"
        fill="#dcfce7"
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
          {[90, 90, 80, 100, 80, 80, 120, 70, 90, 80, 60].map(
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
  /** Display text for an option value (values may be stable ids). */
  labelOf?: (value: string) => string;
}

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  hasError,
  labelOf = (v) => v,
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
            {value ? labelOf(value) : placeholder}
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
                  value={`${labelOf(opt)} ${opt}`}
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
                  {labelOf(opt)}
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

function InfoBanner({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex gap-3 px-4 py-3 rounded-lg text-[12px]"
      style={{
        backgroundColor: "#eff6ff",
        border: "1px solid #bfdbfe",
        color: "#1e40af",
      }}
    >
      <AlertCircle
        className="h-4 w-4 flex-shrink-0 mt-0.5"
        style={{ color: "#3b82f6" }}
      />
      <span>{children}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Tutor Matches on a profile (US 20093: shared Tutor Match store). On a
 * Youth profile pass `youth` (Constituent ID); on a Tutor profile pass
 * `tutor`. The fixed side is read-only; the other is chosen in the form.
 */
export function LeadDetailTutorMatchesTab({
  youth,
  tutor: tutorContext,
}: { youth?: PersonRef; tutor?: PersonRef } = {}) {
  const snapshot = useTutorMatchSnapshot();
  const records = useMemo<TutorMatchRecord[]>(
    () =>
      youth || tutorContext
        ? listedMatches(snapshot)
            .filter(
              (m) =>
                (!youth || m.youthId === youth.id) &&
                (!tutorContext ||
                  m.tutorId === tutorContext.id),
            )
            .map(toRecord)
        : [],
    [snapshot, youth, tutorContext],
  );
  // Selection values are stable ids (never names). Tutor options follow the
  // live tutor records (an inactive tutor drops out); the Match being
  // edited keeps its own tutor so history stays readable.
  const tutorRecords = useTutorRecords();
  const [editingTutor, setEditingTutor] =
    useState<PersonRef | null>(null);
  const tutorRefs = useMemo(() => {
    const map = new Map<string, PersonRef>();
    [
      ...approvedTutorOptions(),
      ...TUTOR_OPTIONS.map(fixtureTutorRef),
    ].forEach((t) => map.set(t.id, t));
    if (editingTutor && !map.has(editingTutor.id))
      map.set(editingTutor.id, editingTutor);
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorRecords, editingTutor]);
  const youthRefs = useMemo(
    () => new Map(youthOptions().map((y) => [y.id, y])),
    [],
  );
  // Same display name for two identities → show the id to tell them apart.
  const labelFrom =
    (map: Map<string, PersonRef>) => (id: string) =>
      labelForRef([...map.values()], id);
  // Match id reserved when the form opens; reused on retry.
  const reservedIdRef = useRef("");
  const savingRef = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<
    "create" | "edit" | "view" | "copy"
  >("create");
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<
    Partial<Record<string, string>>
  >({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [endForm, setEndForm] = useState({
    endDate: "",
    endReason: "",
  });
  const [endErrors, setEndErrors] = useState<
    Partial<Record<string, string>>
  >({});
  const [futureConnections, setFutureConnections] = useState<
    FutureConnection[]
  >([]);

  const selectedRecord =
    records.find((r) => r.id === selectedId) ?? null;
  const isViewMode = modalMode === "view";
  const isCopyMode = modalMode === "copy";
  const locationOptions = form.campus
    ? (LOCATIONS_BY_CAMPUS[form.campus] ?? [])
    : [];

  // Read-only side of the form comes from the profile context.
  const YOUTH_NAME = youth?.name ?? "";

  function setField<K extends keyof typeof EMPTY_FORM>(
    key: K,
    value: (typeof EMPTY_FORM)[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function toggleDay(day: string) {
    setForm((f) => {
      const days = f.recurDays.includes(day)
        ? f.recurDays.filter((d) => d !== day)
        : [...f.recurDays, day];
      return { ...f, recurDays: days };
    });
    setErrors((e) => ({ ...e, recurDays: undefined }));
  }

  function openCreate() {
    reservedIdRef.current = newTutorMatchId();
    setEditingTutor(null);
    setModalMode("create");
    setForm({ ...EMPTY_FORM, tutor: tutorContext?.id ?? "" });
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(record?: TutorMatchRecord) {
    const rec = record ?? selectedRecord;
    if (!rec) return;
    setSelectedId(rec.id);
    setEditingTutor({ id: rec.tutorId, name: rec.tutor });
    setModalMode("edit");
    setForm({
      tutor: rec.tutorId,
      youth: rec.youthId,
      campus: rec.campus,
      location: rec.location,
      startDate: rec.startDate,
      endDate: rec.endDate,
      sessionStartTime: rec.sessionStartTime,
      sessionEndTime: rec.sessionEndTime,
      status: rec.status,
      isPrimaryTutor: rec.isPrimaryTutor,
      comment: rec.comment,
      recurEvery: rec.recurEvery,
      recurDays: [...rec.recurDays],
    });
    setErrors({});
    setModalOpen(true);
  }

  function openView(record?: TutorMatchRecord) {
    const rec = record ?? selectedRecord;
    if (!rec) return;
    setSelectedId(rec.id);
    setEditingTutor({ id: rec.tutorId, name: rec.tutor });
    setModalMode("view");
    setForm({
      tutor: rec.tutorId,
      youth: rec.youthId,
      campus: rec.campus,
      location: rec.location,
      startDate: rec.startDate,
      endDate: rec.endDate,
      sessionStartTime: rec.sessionStartTime,
      sessionEndTime: rec.sessionEndTime,
      status: rec.status,
      isPrimaryTutor: rec.isPrimaryTutor,
      comment: rec.comment,
      recurEvery: rec.recurEvery,
      recurDays: [...rec.recurDays],
    });
    setErrors({});
    setModalOpen(true);
  }

  function openEndMatch() {
    if (!selectedRecord || selectedRecord.status !== "Active")
      return;
    setEndForm({ endDate: "", endReason: "" });
    setEndErrors({});
    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${today.getFullYear()}`;
    setFutureConnections(
      visibleOccurrences(snapshot, new Set([selectedRecord.id]))
        .filter(
          (o) => dayNumber(o.date)! >= dayNumber(todayStr)!,
        )
        .map((o) => ({
          id: o.id,
          startDate: o.date,
          endDate: o.date,
          participants: `${selectedRecord.tutor}, ${selectedRecord.youth}`,
        })),
    );
    setEndModalOpen(true);
  }

  function handleEndSave() {
    if (!selectedRecord) return;
    const errs: Record<string, string> = {};
    if (!endForm.endDate)
      errs.endDate = "End Date is required.";
    if (!endForm.endReason)
      errs.endReason = "Reason is required.";
    if (
      endForm.endDate &&
      selectedRecord.startDate &&
      toInputDate(endForm.endDate) <
        toInputDate(selectedRecord.startDate)
    ) {
      errs.endDate =
        "End Date cannot be earlier than Match Start Date.";
    }
    if (Object.keys(errs).length > 0) {
      setEndErrors(errs);
      return;
    }

    // One captured instant ends the Match and its Tutor Session
    // Connection. The staff-entered End Date is kept for reference.
    const result = closeTutorMatch(selectedRecord.id, "Ended", {
      endReason: endForm.endReason,
      requestedEndDate: endForm.endDate,
    });
    if (!result.ok) {
      toast.error("Tutor Match not ended", {
        description: `Nothing was changed. Reference ${result.diagnostic?.errorId ?? "—"}.`,
      });
      return;
    }
    setEndModalOpen(false);
    toast.success("Tutor Match ended.", {
      description: result.noop
        ? "This match had already ended."
        : `Its Tutor Session connection now ends ${result.match?.closedDate} ${result.match?.closedTime}. Already scheduled sessions are unchanged.`,
    });
  }

  function openCopy() {
    if (!selectedRecord) return;
    // A copy is a new Match with its own identity and Connection.
    reservedIdRef.current = newTutorMatchId();
    setModalMode("copy");
    setForm({
      tutor: selectedRecord.tutorId,
      youth: selectedRecord.youthId,
      campus: selectedRecord.campus,
      location: selectedRecord.location,
      startDate: selectedRecord.startDate,
      endDate: selectedRecord.endDate,
      sessionStartTime: selectedRecord.sessionStartTime,
      sessionEndTime: selectedRecord.sessionEndTime,
      status: selectedRecord.status,
      isPrimaryTutor: selectedRecord.isPrimaryTutor,
      comment: selectedRecord.comment,
      recurEvery: selectedRecord.recurEvery,
      recurDays: [...selectedRecord.recurDays],
    });
    setErrors({});
    setModalOpen(true);
  }

  function handleRefresh() {
    setIsLoading(true);
    // Records are live from the shared store; this only confirms it.
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Tutor Matches data refreshed.");
    }, 300);
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.tutor) errs.tutor = "Tutor is required.";
    if (!youth && !form.youth)
      errs.youth = "Youth is required.";
    if (!form.campus) errs.campus = "Campus is required.";
    if (!form.location) errs.location = "Location is required.";
    if (!form.startDate)
      errs.startDate = "Start Date is required.";
    if (!form.sessionStartTime)
      errs.sessionStartTime = "Session Start Time is required.";
    if (!form.sessionEndTime)
      errs.sessionEndTime = "Session End Time is required.";
    if (
      form.sessionStartTime &&
      form.sessionEndTime &&
      form.sessionEndTime <= form.sessionStartTime
    ) {
      errs.sessionEndTime =
        "Session End Time must be after Session Start Time.";
    }
    if (!form.recurEvery || form.recurEvery < 1)
      errs.recurEvery = "Recur Every is required.";
    if (form.recurDays.length === 0)
      errs.recurDays = "At least one weekday must be selected.";
    if (
      form.endDate &&
      form.startDate &&
      toInputDate(form.endDate) < toInputDate(form.startDate)
    ) {
      errs.endDate = "End Date must be on or after Start Date.";
    }
    return errs;
  }

  function handleSave(addAnother: boolean) {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (savingRef.current) return; // no second save while one runs

    const isNew =
      modalMode === "create" || modalMode === "copy";
    const id = isNew
      ? reservedIdRef.current
      : selectedRecord?.id;
    if (!id) return;
    const existing = snapshot.matches[id];
    const tutorRef = tutorContext ?? tutorRefs.get(form.tutor);
    const youthRef = youth ?? youthRefs.get(form.youth);
    savingRef.current = true;
    const result = saveTutorMatch({
      ...(existing ?? {
        program: "",
        otherLocation: "",
        fundingType: undefined,
      }),
      id,
      tutorId: tutorRef?.id ?? "",
      tutorName: tutorRef?.name ?? "",
      youthId: youthRef?.id ?? "",
      youthName: youthRef?.name ?? "",
      startDate: form.startDate,
      endDate: form.endDate,
      startTime: to12Hour(form.sessionStartTime),
      endTime: to12Hour(form.sessionEndTime),
      days: form.recurDays,
      recursEvery: form.recurEvery,
      campus: form.campus,
      location: form.location,
      comment: form.comment,
      isPrimaryTutor: form.isPrimaryTutor,
      program: existing?.program ?? "",
      otherLocation: existing?.otherLocation ?? "",
      // A status change to Inactive/Ended is saved in this same
      // transaction (one captured instant for Match and Connection).
      status: form.status,
    });
    savingRef.current = false;
    if (!result.ok) {
      const e = result.errors ?? {};
      setErrors({
        tutor: e.tutorId,
        youth: e.youthId,
        campus: e.campus,
        startDate: e.startDate,
        endDate: e.endDate,
        sessionStartTime: e.startTime,
        sessionEndTime: e.endTime,
        recurEvery: e.recursEvery,
        recurDays: e.days,
      });
      if (result.diagnostic)
        toast.error("Tutor Match not saved", {
          description: `The match and its Tutor Session connection could not be saved, so nothing was changed. Try again; reference ${result.diagnostic.errorId}.`,
        });
      return; // keep the form open with the entered values
    }
    setSelectedId(id);
    toast.success(
      result.outcome === "unchanged"
        ? "No changes to save."
        : modalMode === "copy"
          ? "Tutor Match copied successfully."
          : isNew
            ? "Tutor Match created successfully."
            : result.closed
              ? `Tutor Match updated and marked ${result.match?.status}.`
              : "Tutor Match updated successfully.",
      result.outcome === "unchanged"
        ? undefined
        : {
            description: result.closed
              ? `Its Tutor Session connection now ends ${result.match?.closedDate} ${result.match?.closedTime}.`
              : result.openEnded
                ? "Tutor Session connection created. No sessions were scheduled because there is no End Date."
                : `Tutor Session connection and ${result.sessionCount} scheduled session${result.sessionCount === 1 ? "" : "s"} saved.`,
          },
    );

    if (addAnother && modalMode !== "copy") {
      reservedIdRef.current = newTutorMatchId();
      setForm({ ...EMPTY_FORM, tutor: tutorContext?.id ?? "" });
      setErrors({});
      setModalMode("create");
    } else {
      setModalOpen(false);
    }
  }

  function handleDeleteConfirm() {
    if (!selectedRecord) return;
    // Removal keeps the Match (and its Connection's source link) for
    // audit; it ends the linked Tutor Session Connection.
    const result = closeTutorMatch(
      selectedRecord.id,
      "Removed",
    );
    if (!result.ok) {
      toast.error("Tutor Match not removed", {
        description: `Nothing was changed. Reference ${result.diagnostic?.errorId ?? "—"}.`,
      });
      return;
    }
    setSelectedId(null);
    setDeleteConfirmOpen(false);
    toast.success("Tutor Match removed.", {
      description:
        "Its Tutor Session connection has been ended.",
    });
  }

  const inputStyle = (
    hasErr?: boolean,
    view?: boolean,
  ): React.CSSProperties => ({
    border: hasErr
      ? "1px solid #c23934"
      : "1px solid var(--slds-g-color-border-base-1)",
    backgroundColor: view
      ? "var(--slds-g-color-background-alt)"
      : "var(--slds-g-color-background-base)",
    color: "var(--slds-g-color-text-default)",
  });

  const labelCls = "block slds-form-label mb-1";
  const labelStyle: React.CSSProperties = {
    color: "var(--slds-g-color-text-weak)",
  };
  const inputBase =
    "w-full h-9 px-3 rounded text-[13px] focus:outline-none focus:ring-1 focus:ring-[#145F33] disabled:opacity-50 disabled:cursor-not-allowed";

  const secondaryBtnBase =
    "h-8 px-3 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const secondaryBtnStyle: React.CSSProperties = {
    border: "1px solid var(--slds-g-color-border-base-1)",
    backgroundColor: "var(--slds-g-color-background-base)",
    color: "var(--slds-g-color-text-default)",
  };

  return (
    <>
      {/* ── Card ─────────────────────────────────────────────────────────────── */}
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
            Tutor Matches
          </h3>
          <p
            className="slds-text-3 mt-0.5"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Assign tutors, manage tutoring engagements, and
            configure recurring tutoring schedules for the
            selected Youth constituent.
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
            Create New Tutor Match
          </button>

          {/* Copy Match — enabled when exactly one record is selected */}
          <button
            onClick={openCopy}
            disabled={!selectedRecord}
            className={secondaryBtnBase}
            style={secondaryBtnStyle}
            title={
              selectedRecord
                ? "Copy selected Tutor Match"
                : "Select a record to copy"
            }
          >
            <Copy
              className="h-3.5 w-3.5"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            />
            Copy Match
          </button>

          {/* End Match — enabled only when an Active record is selected */}
          <button
            onClick={openEndMatch}
            disabled={
              !selectedRecord ||
              selectedRecord.status !== "Active"
            }
            className={secondaryBtnBase}
            style={secondaryBtnStyle}
            title={
              !selectedRecord
                ? "Select a record to end"
                : selectedRecord.status !== "Active"
                  ? "Only Active Tutor Matches can be ended"
                  : "End selected Tutor Match"
            }
          >
            <X
              className="h-3.5 w-3.5"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            />
            End Match
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="h-8 w-8 rounded-full flex items-center justify-center transition-colors"
            style={secondaryBtnStyle}
            title="Refresh"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
              style={{ color: "var(--slds-g-color-text-weak)" }}
            />
          </button>
        </div>

        {/* Table / Empty State */}
        {isLoading ? (
          <div className="py-4">
            <TableSkeleton />
          </div>
        ) : records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  {[
                    "Tutor",
                    "Youth",
                    "Campus",
                    "Location",
                    "Start Date",
                    "End Date",
                    "Session Time",
                    "Status",
                    "Last Modified By",
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
                {records.map((row) => {
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
                        className="px-4 py-3 font-medium"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {row.tutor}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
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
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {formatDisplayDate(row.startDate)}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {formatDisplayDate(row.endDate)}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {formatSessionTime(
                          row.sessionStartTime,
                          row.sessionEndTime,
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
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
                        {row.lastModifiedBy}
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
                              openView(row);
                            }}
                            className="h-7 w-7 rounded flex items-center justify-center hover:bg-[#eff6ff]"
                            style={{ color: "#0176d3" }}
                            title="View"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(row);
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
                              setDeleteConfirmOpen(true);
                            }}
                            className="h-7 w-7 rounded flex items-center justify-center hover:bg-[#fff1f0]"
                            style={{ color: "#c23934" }}
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div
              className="px-4 py-2 text-[12px]"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-weak)",
              }}
            >
              {records.length} record
              {records.length !== 1 ? "s" : ""}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
            <TutorIllustration />
            <h3
              className="mt-4 text-[14px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              No Tutor Matches
            </h3>
            <p
              className="mt-1.5 slds-text-4 max-w-xs"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              No tutor assignments exist for this Youth
              constituent.
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
              Create New Tutor Match
            </button>
          </div>
        )}
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget)
              setModalOpen(false);
          }}
        >
          <div
            className="w-full flex flex-col shadow-2xl rounded-xl overflow-hidden"
            style={{
              maxWidth: 900,
              maxHeight: "90vh",
              backgroundColor:
                "var(--slds-g-color-background-base)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            {/* Modal Header */}
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
                  {isViewMode
                    ? "View Tutor Match"
                    : modalMode === "edit"
                      ? "Edit Tutor Match"
                      : isCopyMode
                        ? "Copy Tutor Match"
                        : "Create Tutor Match"}
                </h2>
                <p
                  className="slds-text-3 mt-0.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  {isViewMode
                    ? "Viewing tutor match details in read-only mode."
                    : isCopyMode
                      ? "Create a new tutor match using an existing match as a starting point."
                      : "Assign a tutor and configure recurring tutoring sessions."}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="ml-4 flex-shrink-0 h-7 w-7 rounded flex items-center justify-center"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* ── Tutor Assignment ── */}
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
                  Tutor Assignment
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Youth — fixed on a Youth profile, chosen on a Tutor profile */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      Youth
                      {!youth && (
                        <span className="text-red-600"> *</span>
                      )}
                    </label>
                    {youth ? (
                      <input
                        type="text"
                        readOnly
                        aria-label="Youth"
                        value={YOUTH_NAME}
                        className={inputBase}
                        style={inputStyle(false, true)}
                      />
                    ) : (
                      <>
                        <SearchableSelect
                          value={form.youth}
                          onChange={(v) => setField("youth", v)}
                          options={[...youthRefs.keys()]}
                          labelOf={labelFrom(youthRefs)}
                          placeholder="Search youth…"
                          disabled={
                            isViewMode || modalMode === "edit"
                          }
                          hasError={!!errors.youth}
                        />
                        <FieldError msg={errors.youth} />
                      </>
                    )}
                  </div>

                  {/* Tutor */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      Tutor{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    {tutorContext ? (
                      <input
                        type="text"
                        readOnly
                        aria-label="Tutor"
                        value={tutorContext.name}
                        className={inputBase}
                        style={inputStyle(false, true)}
                      />
                    ) : (
                      <SearchableSelect
                        value={form.tutor}
                        onChange={(v) => setField("tutor", v)}
                        options={[...tutorRefs.keys()]}
                        labelOf={labelFrom(tutorRefs)}
                        placeholder="Search tutors…"
                        disabled={isViewMode}
                        hasError={!!errors.tutor}
                      />
                    )}
                    <FieldError msg={errors.tutor} />
                  </div>

                  {/* Campus */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
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
                      disabled={isViewMode}
                      hasError={!!errors.campus}
                    />
                    <FieldError msg={errors.campus} />
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
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
                      disabled={isViewMode || !form.campus}
                      hasError={!!errors.location}
                    />
                    <FieldError msg={errors.location} />
                  </div>

                  {/* Title 1 — Primary Tutor */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      Title 1
                    </label>
                    <label
                      className="flex items-center gap-2.5 cursor-pointer"
                      style={{ opacity: isViewMode ? 0.6 : 1 }}
                    >
                      <input
                        type="checkbox"
                        checked={form.isPrimaryTutor}
                        onChange={(e) =>
                          !isViewMode &&
                          setField(
                            "isPrimaryTutor",
                            e.target.checked,
                          )
                        }
                        disabled={isViewMode}
                        className="h-4 w-4 rounded"
                        style={{ accentColor: "#145F33" }}
                      />
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Primary Tutor
                      </span>
                    </label>
                  </div>

                  {/* Comment */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label
                      className={labelCls}
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
                        (optional, max 500 characters)
                      </span>
                    </label>
                    <textarea
                      disabled={isViewMode}
                      value={form.comment}
                      onChange={(e) =>
                        setField(
                          "comment",
                          e.target.value.slice(0, 500),
                        )
                      }
                      placeholder="Enter any additional comments…"
                      rows={3}
                      className="w-full px-3 py-2 rounded text-[13px] resize-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                      style={inputStyle(false, isViewMode)}
                    />
                    {!isViewMode && (
                      <p
                        className="text-[11px] text-right"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {form.comment.length}/500
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Match Schedule ── */}
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
                  Match Schedule
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      Start Date{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <DateInput
                      disabled={isViewMode}
                      value={isoToMdy(
                        toInputDate(form.startDate),
                      )}
                      onChange={(v) =>
                        ((e) =>
                          setField(
                            "startDate",
                            fromInputDate(e.target.value),
                          ))({ target: { value: mdyToIso(v) } })
                      }
                      className={inputBase}
                      style={inputStyle(
                        !!errors.startDate,
                        isViewMode,
                      )}
                    />
                    <FieldError msg={errors.startDate} />
                  </div>

                  {/* End Date */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      End Date
                    </label>
                    <DateInput
                      disabled={isViewMode}
                      value={isoToMdy(
                        toInputDate(form.endDate),
                      )}
                      onChange={(v) =>
                        ((e) =>
                          setField(
                            "endDate",
                            fromInputDate(e.target.value),
                          ))({ target: { value: mdyToIso(v) } })
                      }
                      className={inputBase}
                      style={inputStyle(
                        !!errors.endDate,
                        isViewMode,
                      )}
                    />
                    <FieldError msg={errors.endDate} />
                  </div>

                  {/* Session Start Time */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      Session Start Time{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <TimeInput
                      format="24h"
                      disabled={isViewMode}
                      value={form.sessionStartTime}
                      onChange={(val) => {
                        setField("sessionStartTime", val);
                        setErrors((err) => ({
                          ...err,
                          sessionEndTime: undefined,
                        }));
                      }}
                      aria-invalid={
                        errors.sessionStartTime
                          ? true
                          : undefined
                      }
                      placeholder="hh:mm AM/PM"
                    />
                    <FieldError msg={errors.sessionStartTime} />
                  </div>

                  {/* Session End Time */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      Session End Time{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <TimeInput
                      format="24h"
                      disabled={isViewMode}
                      value={form.sessionEndTime}
                      onChange={(val) =>
                        setField("sessionEndTime", val)
                      }
                      aria-invalid={
                        errors.sessionEndTime ? true : undefined
                      }
                      placeholder="hh:mm AM/PM"
                    />
                    <FieldError msg={errors.sessionEndTime} />
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      Status{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <select
                      disabled={isViewMode}
                      value={form.status}
                      onChange={(e) =>
                        setField(
                          "status",
                          e.target.value as TutorMatchStatus,
                        )
                      }
                      className="w-full h-9 px-3 rounded text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={inputStyle(false, isViewMode)}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Recurring Tutoring Schedule ── */}
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <div
                  className="px-4 py-3"
                  style={{
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <h4
                    className="text-[12px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Recurring Tutoring Schedule
                  </h4>
                  <p
                    className="slds-text-3 mt-0.5"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Configure recurring tutoring sessions.
                  </p>
                </div>
                <div className="px-4 py-4 space-y-4">
                  {/* Recur Every */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      Recur Every{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={52}
                        disabled={isViewMode}
                        value={form.recurEvery}
                        onChange={(e) =>
                          setField(
                            "recurEvery",
                            Math.max(
                              1,
                              parseInt(e.target.value) || 1,
                            ),
                          )
                        }
                        className="h-9 px-3 rounded text-[13px] focus:outline-none focus:ring-1 focus:ring-[#145F33] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          ...inputStyle(
                            !!errors.recurEvery,
                            isViewMode,
                          ),
                          width: 80,
                        }}
                      />
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        week{form.recurEvery !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <FieldError msg={errors.recurEvery} />
                  </div>

                  {/* Weekday chips */}
                  <div className="space-y-2">
                    <p
                      className="slds-text-3"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Select one or more recurring tutoring
                      days.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {WEEKDAYS.map((day) => {
                        const selected =
                          form.recurDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            disabled={isViewMode}
                            onClick={() =>
                              !isViewMode && toggleDay(day)
                            }
                            className="h-8 px-3 rounded-full text-[12px] font-medium transition-colors disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: selected
                                ? "#145F33"
                                : "var(--slds-g-color-background-base)",
                              color: selected
                                ? "white"
                                : "var(--slds-g-color-text-default)",
                              border: selected
                                ? "1px solid #145F33"
                                : "1px solid var(--slds-g-color-border-base-1)",
                              opacity: isViewMode ? 0.7 : 1,
                            }}
                          >
                            {DAY_ABBR[day]}
                          </button>
                        );
                      })}
                    </div>
                    <FieldError msg={errors.recurDays} />
                  </div>

                  {/* Recurrence summary */}
                  {(form.recurDays.length > 0 ||
                    form.recurEvery > 0) && (
                    <div
                      className="px-3 py-2 rounded-lg text-[12px]"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                        color: "var(--slds-g-color-text-weak)",
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <span
                        className="font-medium"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Schedule:{" "}
                      </span>
                      {formatRecurrence(
                        form.recurDays,
                        form.recurEvery,
                      )}
                      {form.sessionStartTime &&
                        form.sessionEndTime &&
                        ` • ${to12Hour(form.sessionStartTime)} – ${to12Hour(form.sessionEndTime)}`}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="px-6 py-4 flex items-center justify-end gap-2 flex-shrink-0"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              {isViewMode ? (
                <button
                  onClick={() => setModalOpen(false)}
                  className="h-9 px-5 rounded-full text-[13px] font-medium"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Close
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setModalOpen(false)}
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
                  {modalMode === "create" && (
                    <button
                      onClick={() => handleSave(true)}
                      className="h-9 px-5 rounded-full text-[13px] font-medium"
                      style={{
                        border: "1px solid #145F33",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        color: "#145F33",
                      }}
                    >
                      Save &amp; Add Another
                    </button>
                  )}
                  <button
                    onClick={() => handleSave(false)}
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
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── End Match Modal ───────────────────────────────────────────────── */}
      {endModalOpen && selectedRecord && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget)
              setEndModalOpen(false);
          }}
        >
          <div
            className="w-full flex flex-col shadow-2xl rounded-xl overflow-hidden"
            style={{
              maxWidth: 900,
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
                  End Tutor Match
                </h2>
                <p
                  className="slds-text-3 mt-0.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  End the tutoring relationship while preserving
                  historical records.
                </p>
              </div>
              <button
                onClick={() => setEndModalOpen(false)}
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
              {/* Section 1 — End Tutor Match Information */}
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
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
                    className="text-[12px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    End Tutor Match Information
                  </h3>
                </div>
                <div className="px-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Youth — read-only */}
                    <div className="space-y-1.5">
                      <label
                        className="block slds-form-label mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Youth
                      </label>
                      <input
                        readOnly
                        value={selectedRecord.youth}
                        className="w-full h-9 px-3 rounded text-[13px]"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-alt)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      />
                    </div>

                    {/* Tutor — read-only */}
                    <div className="space-y-1.5">
                      <label
                        className="block slds-form-label mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Tutor
                      </label>
                      <input
                        readOnly
                        value={selectedRecord.tutor}
                        className="w-full h-9 px-3 rounded text-[13px]"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-alt)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      />
                    </div>

                    {/* End Date */}
                    <div className="space-y-1.5">
                      <label
                        className="block slds-form-label mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        End Date{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <DateInput
                        value={isoToMdy(
                          toInputDate(endForm.endDate),
                        )}
                        onChange={(v) =>
                          ((e) => {
                            const val = fromInputDate(
                              e.target.value,
                            );
                            setEndForm((f) => ({
                              ...f,
                              endDate: val,
                            }));
                            setEndErrors((err) => ({
                              ...err,
                              endDate: undefined,
                            }));
                          })({ target: { value: mdyToIso(v) } })
                        }
                        className="w-full h-9 px-3 rounded text-[13px] focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                        style={{
                          border: endErrors.endDate
                            ? "1px solid #c23934"
                            : "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      />
                      <FieldError msg={endErrors.endDate} />
                    </div>

                    {/* End Reason */}
                    <div className="space-y-1.5">
                      <label
                        className="block slds-form-label mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        End Reason{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <SearchableSelect
                        value={endForm.endReason}
                        onChange={(v) => {
                          setEndForm((f) => ({
                            ...f,
                            endReason: v,
                          }));
                          setEndErrors((err) => ({
                            ...err,
                            endReason: undefined,
                          }));
                        }}
                        options={END_REASONS}
                        placeholder="Select reason…"
                        hasError={!!endErrors.endReason}
                      />
                      <FieldError msg={endErrors.endReason} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2 — Future Tutor Connections */}
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
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
                    className="text-[12px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Future Tutor Connections
                  </h3>
                </div>
                <div className="px-4 py-4 space-y-4">
                  <InfoBanner>
                    These Tutor Sessions are scheduled and have
                    not occurred yet. Ending the match ends its
                    Tutor Session connection now; these
                    scheduled sessions are not changed (what
                    happens to them is pending a business
                    decision).
                  </InfoBanner>

                  {/* Summary message */}
                  {endForm.endDate &&
                    (() => {
                      const affected = futureConnections.filter(
                        (s) =>
                          toInputDate(s.startDate) >=
                          toInputDate(endForm.endDate),
                      );
                      if (!affected.length) return null;
                      return (
                        <div
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium"
                          style={{
                            backgroundColor: "#fff7ed",
                            border: "1px solid #fed7aa",
                            color: "#c2410c",
                          }}
                        >
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                          {affected.length} scheduled session
                          {affected.length !== 1 ? "s" : ""} on
                          or after this End Date (not changed).
                        </div>
                      );
                    })()}

                  {/* Grid */}
                  {futureConnections.length > 0 ? (
                    <div
                      className="overflow-x-auto rounded-lg"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <table className="w-full text-[13px]">
                        <thead>
                          <tr
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-alt)",
                            }}
                          >
                            {[
                              "Start Date",
                              "End Date",
                              "Participants",
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
                          {futureConnections.map((session) => {
                            const isAffected =
                              endForm.endDate &&
                              toInputDate(session.startDate) >=
                                toInputDate(endForm.endDate);
                            return (
                              <tr
                                key={session.id}
                                style={{
                                  backgroundColor: isAffected
                                    ? "#fff7ed"
                                    : undefined,
                                  borderBottom:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                <td
                                  className="px-4 py-2.5"
                                  style={{
                                    color: isAffected
                                      ? "#c2410c"
                                      : "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  <span className="flex items-center gap-1.5">
                                    {isAffected && (
                                      <AlertCircle
                                        className="h-3 w-3 flex-shrink-0"
                                        style={{
                                          color: "#f97316",
                                        }}
                                      />
                                    )}
                                    {formatDisplayDate(
                                      session.startDate,
                                    )}
                                  </span>
                                </td>
                                <td
                                  className="px-4 py-2.5"
                                  style={{
                                    color: isAffected
                                      ? "#c2410c"
                                      : "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {formatDisplayDate(
                                    session.endDate,
                                  )}
                                </td>
                                <td
                                  className="px-4 py-2.5"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  {session.participants}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div
                      className="py-8 text-center rounded-lg"
                      style={{
                        border:
                          "1px dashed var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <p
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        No future tutoring sessions found for
                        this match.
                      </p>
                    </div>
                  )}
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
                onClick={() => setEndModalOpen(false)}
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
                onClick={handleEndSave}
                className="h-9 px-5 rounded-full text-[13px] font-medium"
                style={{
                  border: "1px solid #145F33",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "#145F33",
                }}
              >
                Save
              </button>
              <button
                onClick={handleEndSave}
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
                Save &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ────────────────────────────────────────────── */}
      {deleteConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="w-full max-w-sm rounded-xl shadow-2xl overflow-hidden"
            style={{
              backgroundColor:
                "var(--slds-g-color-background-base)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <div className="px-6 py-5">
              <h3
                className="text-[15px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Delete Tutor Match
              </h3>
              <p
                className="mt-2 text-[13px]"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Are you sure you want to delete this Tutor
                Match?{" "}
                <span
                  className="font-medium"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {selectedRecord?.tutor}
                </span>{" "}
                will be unassigned from this constituent.
              </p>
            </div>
            <div
              className="px-6 py-4 flex items-center justify-end gap-2"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <button
                onClick={() => setDeleteConfirmOpen(false)}
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
                onClick={handleDeleteConfirm}
                className="h-9 px-5 rounded-full text-[13px] font-medium text-white"
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}