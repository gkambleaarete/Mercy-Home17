import { useState, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Eye,
  ChevronsUpDown,
  Check,
  AlertCircle,
  X,
  ShieldAlert,
} from "@/app/lib/lucide-icons";
import { PlanDocumentsSection, type PlanDocument } from "./PlanDocumentsSection";
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
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import { getDemoUserName } from "../../lib/demoIdentity";

// ─── Types ────────────────────────────────────────────────────────────────────

type EmploymentStatus = "Active" | "Inactive";

interface DisciplinaryAction {
  id: number;
  date: string; // MM/DD/YYYY
  type: string;
  description: string;
  resolved: boolean;
  resolutionNotes: string;
}

interface EmploymentRecord {
  id: number;
  employer: string;
  companyName: string;
  position: string;
  employmentType: string;
  supervisor: string;
  phone: string;
  email: string;
  startDate: string;
  endDate: string;
  hourlyWage: string;
  workSchedule: string;
  status: EmploymentStatus;
  notes: string;
  // Employment Details
  employerAddress: string;
  workLocation: string;
  employmentBenefits: string;
  transportation: string;
  supervisorContact: string;
  lastModifiedBy: string;
  lastModifiedDate: string;
  disciplinaryActions: DisciplinaryAction[];
  /** Documents attached to this employment record. */
  documents?: PlanDocument[];
}

// ─── Reference Data ───────────────────────────────────────────────────────────

const EMPLOYER_OPTIONS = [
  "Amazon Fulfillment Center",
  "Blue Sky Bakery",
  "Chicago Culinary Academy",
  "City Grounds Coffee",
  "Community Health Clinic",
  "Future Leaders Institute",
  "Green City Construction",
  "Harbor Freight Tools",
  "Mercy Home for Boys & Girls",
  "Metro Transit Authority",
  "Northside Auto Repair",
  "Oak Park Hospital",
  "Southside Grocery",
  "Target — Lincoln Park",
  "Urban Workforce Program",
  "Walgreens",
];

// Dummy organization data — auto-populated when an employer is selected
const ORG_DATA: Record<
  string,
  { address: string; phone: string; contact: string }
> = {
  "Amazon Fulfillment Center": {
    address: "1000 Amazon Way, Chicago, IL 60606",
    phone: "(312) 555-0101",
    contact: "HR Department — hr@amazon-fc.com",
  },
  "Blue Sky Bakery": {
    address: "245 W Division St, Chicago, IL 60610",
    phone: "(312) 555-0202",
    contact: "Manager: Jane Doe — (312) 555-0203",
  },
  "Chicago Culinary Academy": {
    address: "361 W Chestnut St, Chicago, IL 60610",
    phone: "(312) 555-0303",
    contact: "Admissions: info@chicagoculinary.edu",
  },
  "City Grounds Coffee": {
    address: "816 W Fullerton Ave, Chicago, IL 60614",
    phone: "(773) 555-0404",
    contact: "Owner: Marco Rivera — (773) 555-0405",
  },
  "Community Health Clinic": {
    address: "2750 W Roosevelt Rd, Chicago, IL 60608",
    phone: "(312) 555-0505",
    contact: "HR: careers@communityhealthclinic.org",
  },
  "Future Leaders Institute": {
    address: "180 N Wacker Dr, Chicago, IL 60606",
    phone: "(312) 555-0606",
    contact: "Director: Angela Brooks — (312) 555-0607",
  },
  "Green City Construction": {
    address: "4200 W Chicago Ave, Chicago, IL 60651",
    phone: "(773) 555-0707",
    contact: "Foreman: Carlos Mendez — (773) 555-0708",
  },
  "Harbor Freight Tools": {
    address: "6345 N Lincoln Ave, Chicago, IL 60659",
    phone: "(773) 555-0808",
    contact: "Store Manager — (773) 555-0809",
  },
  "Mercy Home for Boys & Girls": {
    address: "1140 W Jackson Blvd, Chicago, IL 60607",
    phone: "(312) 738-7560",
    contact: "HR: hr@mercyhome.org",
  },
  "Metro Transit Authority": {
    address: "567 W Lake St, Chicago, IL 60661",
    phone: "(312) 555-0909",
    contact: "Workforce: workforce@metra.com",
  },
  "Northside Auto Repair": {
    address: "3412 N Clark St, Chicago, IL 60657",
    phone: "(773) 555-1010",
    contact: "Owner: Steve Park — (773) 555-1011",
  },
  "Oak Park Hospital": {
    address: "520 S Maple Ave, Oak Park, IL 60304",
    phone: "(708) 555-1111",
    contact: "HR: staffing@oakparkhospital.org",
  },
  "Southside Grocery": {
    address: "7201 S Cottage Grove, Chicago, IL 60619",
    phone: "(773) 555-1212",
    contact: "Manager: Diane Walsh — (773) 555-1213",
  },
  "Target — Lincoln Park": {
    address: "2656 N Elston Ave, Chicago, IL 60647",
    phone: "(773) 555-1313",
    contact: "Store HR — (773) 555-1314",
  },
  "Urban Workforce Program": {
    address: "29 E Madison St, Chicago, IL 60602",
    phone: "(312) 555-1414",
    contact: "Coordinator: Tamara Hill — (312) 555-1415",
  },
  Walgreens: {
    address: "1200 N Dearborn St, Chicago, IL 60610",
    phone: "(312) 555-1515",
    contact: "District HR — hr@walgreens.com",
  },
};

const EMPLOYMENT_TYPE_OPTIONS = [
  "Full Time",
  "Part Time",
  "Seasonal",
  "Internship",
  "Apprenticeship",
  "Volunteer",
];

const WORK_SCHEDULE_OPTIONS = [
  "Morning",
  "Afternoon",
  "Evening",
  "Night",
];

const POSITION_TYPE_OPTIONS = [
  "Entry Level",
  "Mid Level",
  "Senior Level",
  "Supervisory",
  "Managerial",
  "Internship",
  "Volunteer",
  "Temporary",
];

const PAY_FREQUENCY_OPTIONS = [
  "Weekly",
  "Bi-Weekly",
  "Semi-Monthly",
  "Monthly",
];

const DISC_ACTION_TYPES = [
  "Verbal Warning",
  "Written Warning",
  "Suspension",
  "Performance Improvement Plan (PIP)",
  "Final Warning",
  "Termination",
  "Other",
];

const STATUS_BADGE: Record<
  EmploymentStatus,
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
};

const EMPTY_FORM: Omit<
  EmploymentRecord,
  "id" | "lastModifiedBy" | "lastModifiedDate"
> = {
  employer: "",
  companyName: "",
  position: "",
  employmentType: "",
  supervisor: "",
  phone: "",
  email: "",
  startDate: "",
  endDate: "",
  hourlyWage: "",
  workSchedule: "",
  status: "Active",
  notes: "",
  employerAddress: "",
  workLocation: "",
  employmentBenefits: "",
  transportation: "",
  supervisorContact: "",
  disciplinaryActions: [],
  documents: [],
};

const EMPTY_DISC: Omit<DisciplinaryAction, "id"> = {
  date: "",
  type: "",
  description: "",
  resolved: false,
  resolutionNotes: "",
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

function isValidEmail(email: string) {
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string) {
  return !phone || /^[\d\s\-().+]{7,}$/.test(phone);
}

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6)
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmploymentIllustration() {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="14"
        y="36"
        width="68"
        height="44"
        rx="5"
        fill="#f0fdf4"
        stroke="#bbf7d0"
        strokeWidth="1.5"
      />
      <rect
        x="34"
        y="24"
        width="28"
        height="18"
        rx="3"
        fill="#dcfce7"
        stroke="#bbf7d0"
        strokeWidth="1.5"
      />
      <rect
        x="38"
        y="28"
        width="20"
        height="3"
        rx="1.5"
        fill="#86efac"
      />
      <rect
        x="38"
        y="34"
        width="12"
        height="3"
        rx="1.5"
        fill="#86efac"
      />
      <rect
        x="22"
        y="50"
        width="24"
        height="3"
        rx="1.5"
        fill="#dcfce7"
      />
      <rect
        x="22"
        y="57"
        width="40"
        height="3"
        rx="1.5"
        fill="#dcfce7"
      />
      <rect
        x="22"
        y="64"
        width="32"
        height="3"
        rx="1.5"
        fill="#dcfce7"
      />
      <circle
        cx="72"
        cy="56"
        r="8"
        fill="#145F33"
        opacity="0.12"
      />
      <circle cx="72" cy="56" r="5" fill="#145F33" />
      <path
        d="M69.5 56l2 2 3.5-3.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
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
          className="flex gap-6 py-3 border-b"
          style={{
            borderColor: "var(--slds-g-color-border-base-1)",
          }}
        >
          {[110, 100, 90, 90, 90, 72, 100, 90, 60].map(
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

// ─── Main Component ───────────────────────────────────────────────────────────

export function LeadDetailEmploymentTab() {
  const [records, setRecords] = useState<EmploymentRecord[]>(
    [],
  );
  const [selectedId, setSelectedId] = useState<number | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<
    "create" | "edit" | "view"
  >("create");
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formErrors, setFormErrors] = useState<
    Partial<
      Record<
        keyof typeof EMPTY_FORM | "active_duplicate",
        string
      >
    >
  >({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Disciplinary action inline state
  const [addingDisc, setAddingDisc] = useState(false);
  const [editingDiscId, setEditingDiscId] = useState<
    number | null
  >(null);
  const [discForm, setDiscForm] = useState<
    Omit<DisciplinaryAction, "id">
  >({ ...EMPTY_DISC });
  const [discFormErrors, setDiscFormErrors] = useState<{
    date?: string;
    type?: string;
    description?: string;
  }>({});
  const discNextId = useRef(1);

  const selectedRecord =
    records.find((r) => r.id === selectedId) ?? null;
  const isViewMode = modalMode === "view";

  function setField<K extends keyof typeof EMPTY_FORM>(
    key: K,
    value: (typeof EMPTY_FORM)[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    setFormErrors((e) => ({
      ...e,
      [key]: undefined,
      active_duplicate: undefined,
    }));
  }

  function openCreate() {
    setModalMode("create");
    setForm({ ...EMPTY_FORM });
    setFormErrors({});
    setAddingDisc(false);
    setEditingDiscId(null);
    setDiscForm({ ...EMPTY_DISC });
    setDiscFormErrors({});
    setModalOpen(true);
  }

  function openEdit(record?: EmploymentRecord) {
    const rec = record ?? selectedRecord;
    if (!rec) return;
    setSelectedId(rec.id);
    setModalMode("edit");
    setForm({
      employer: rec.employer,
      companyName: rec.companyName,
      position: rec.position,
      employmentType: rec.employmentType,
      supervisor: rec.supervisor,
      phone: rec.phone,
      email: rec.email,
      startDate: rec.startDate,
      endDate: rec.endDate,
      hourlyWage: rec.hourlyWage,
      workSchedule: rec.workSchedule,
      status: rec.status,
      notes: rec.notes,
      employerAddress: rec.employerAddress,
      workLocation: rec.workLocation,
      employmentBenefits: rec.employmentBenefits,
      transportation: rec.transportation,
      supervisorContact: rec.supervisorContact,
      disciplinaryActions: rec.disciplinaryActions ?? [],
      documents: rec.documents ?? [],
    });
    setFormErrors({});
    setAddingDisc(false);
    setEditingDiscId(null);
    setDiscForm({ ...EMPTY_DISC });
    setDiscFormErrors({});
    setModalOpen(true);
  }

  function openView(record?: EmploymentRecord) {
    const rec = record ?? selectedRecord;
    if (!rec) return;
    setSelectedId(rec.id);
    setModalMode("view");
    setForm({
      employer: rec.employer,
      companyName: rec.companyName,
      position: rec.position,
      employmentType: rec.employmentType,
      supervisor: rec.supervisor,
      phone: rec.phone,
      email: rec.email,
      startDate: rec.startDate,
      endDate: rec.endDate,
      hourlyWage: rec.hourlyWage,
      workSchedule: rec.workSchedule,
      status: rec.status,
      notes: rec.notes,
      employerAddress: rec.employerAddress,
      workLocation: rec.workLocation,
      employmentBenefits: rec.employmentBenefits,
      transportation: rec.transportation,
      supervisorContact: rec.supervisorContact,
      disciplinaryActions: rec.disciplinaryActions ?? [],
      documents: rec.documents ?? [],
    });
    setFormErrors({});
    setAddingDisc(false);
    setEditingDiscId(null);
    setModalOpen(true);
  }

  function handleRefresh() {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Employment data refreshed.");
    }, 800);
  }

  function validate() {
    const errs: typeof formErrors = {};
    if (!form.employer) errs.employer = "Employer is required.";
    if (!form.companyName)
      errs.companyName = "Company Name is required.";
    if (!form.position) errs.position = "Position is required.";
    if (!form.startDate)
      errs.startDate = "Start Date is required.";
    if (!form.status) errs.status = "Status is required.";
    if (
      form.endDate &&
      form.startDate &&
      form.endDate < form.startDate
    ) {
      errs.endDate =
        "End Date must be greater than or equal to Start Date.";
    }
    if (form.email && !isValidEmail(form.email))
      errs.email = "Enter a valid email address.";
    if (form.phone && !isValidPhone(form.phone))
      errs.phone = "Enter a valid phone number.";
    if (form.status === "Active") {
      const conflict = records.find(
        (r) =>
          r.status === "Active" &&
          (modalMode === "create" ||
            r.id !== selectedRecord?.id),
      );
      if (conflict)
        errs.active_duplicate =
          "An Active employment record already exists for this constituent.";
    }
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    const now = "07/21/2026";
    if (modalMode === "create") {
      const rec: EmploymentRecord = {
        id: Date.now(),
        ...form,
        lastModifiedBy: getDemoUserName(),
        lastModifiedDate: now,
      };
      setRecords((prev) => [...prev, rec]);
      setSelectedId(rec.id);
      toast.success("Employment created successfully.");
    } else if (selectedRecord) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === selectedRecord.id
            ? { ...r, ...form, lastModifiedDate: now }
            : r,
        ),
      );
      toast.success("Employment updated successfully.");
    }

    setModalOpen(false);
  }

  function handleDeleteConfirm() {
    if (!selectedRecord) return;
    setRecords((prev) =>
      prev.filter((r) => r.id !== selectedRecord.id),
    );
    setSelectedId(null);
    setDeleteConfirmOpen(false);
    toast.success("Employment deleted successfully.");
  }

  function handleRowClick(id: number) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  // ── Employer auto-populate ─────────────────────────────────────────────────

  function handleEmployerSelect(employer: string) {
    const org = ORG_DATA[employer];
    setForm((f) => ({
      ...f,
      employer,
      companyName: org ? employer : f.companyName,
      employerAddress: org ? org.address : f.employerAddress,
      phone: org ? org.phone : f.phone,
      supervisorContact: org
        ? org.contact
        : f.supervisorContact,
    }));
    setFormErrors((e) => ({
      ...e,
      employer: undefined,
      active_duplicate: undefined,
    }));
  }

  // ── Disciplinary action handlers ───────────────────────────────────────────

  function validateDisc() {
    const e: typeof discFormErrors = {};
    if (!discForm.date) e.date = "Date is required.";
    if (!discForm.type) e.type = "Type is required.";
    if (!discForm.description)
      e.description = "Description is required.";
    setDiscFormErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleDiscSave() {
    if (!validateDisc()) return;
    if (editingDiscId !== null) {
      setForm((f) => ({
        ...f,
        disciplinaryActions: f.disciplinaryActions.map((d) =>
          d.id === editingDiscId ? { ...d, ...discForm } : d,
        ),
      }));
    } else {
      const newDisc: DisciplinaryAction = {
        id: discNextId.current++,
        ...discForm,
      };
      setForm((f) => ({
        ...f,
        disciplinaryActions: [
          ...f.disciplinaryActions,
          newDisc,
        ],
      }));
    }
    setAddingDisc(false);
    setEditingDiscId(null);
    setDiscForm({ ...EMPTY_DISC });
    setDiscFormErrors({});
  }

  function handleDiscEdit(disc: DisciplinaryAction) {
    setEditingDiscId(disc.id);
    setDiscForm({
      date: disc.date,
      type: disc.type,
      description: disc.description,
      resolved: disc.resolved,
      resolutionNotes: disc.resolutionNotes,
    });
    setDiscFormErrors({});
    setAddingDisc(true);
  }

  function handleDiscDelete(id: number) {
    setForm((f) => ({
      ...f,
      disciplinaryActions: f.disciplinaryActions.filter(
        (d) => d.id !== id,
      ),
    }));
    if (editingDiscId === id) {
      setAddingDisc(false);
      setEditingDiscId(null);
      setDiscForm({ ...EMPTY_DISC });
    }
  }

  function cancelDiscForm() {
    setAddingDisc(false);
    setEditingDiscId(null);
    setDiscForm({ ...EMPTY_DISC });
    setDiscFormErrors({});
  }

  // ── Shared styles ──────────────────────────────────────────────────────────

  const secondaryBtnStyle: React.CSSProperties = {
    border: "1px solid var(--slds-g-color-border-base-1)",
    backgroundColor: "var(--slds-g-color-background-base)",
    color: "var(--slds-g-color-text-default)",
  };

  const labelCls = "block slds-form-label mb-1";
  const labelStyle: React.CSSProperties = {
    color: "var(--slds-g-color-text-weak)",
  };

  const inputBase =
    "w-full h-9 px-3 rounded text-[13px] focus:outline-none focus:ring-1 focus:ring-[#145F33] disabled:opacity-50 disabled:cursor-not-allowed";

  function inputStyle(
    hasErr?: boolean,
    viewMode?: boolean,
  ): React.CSSProperties {
    return {
      border: hasErr
        ? "1px solid #c23934"
        : "1px solid var(--slds-g-color-border-base-1)",
      backgroundColor: viewMode
        ? "var(--slds-g-color-background-alt)"
        : "var(--slds-g-color-background-base)",
      color: "var(--slds-g-color-text-default)",
    };
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

  return (
    <>
      {/* ── Card Container ──────────────────────────────────────────────────── */}
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
            Employment
          </h3>
          <p
            className="slds-text-3 mt-0.5"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Manage employment history, current employment
            details, employers, positions, and employment status
            for this client.
          </p>
        </div>

        {/* Toolbar */}
        <div
          className="px-4 py-2 flex items-center gap-2 flex-wrap"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-base)",
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
            Create New Employment
          </button>
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
                    "ORGANIZATION",
                    "CONSTITUENT TYPE",
                    "EMPLOYMENT TYPE",
                    "TITLE",
                    "START DATE",
                    "END DATE",
                    "NOTES",
                    "ACTIONS",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2.5 text-left whitespace-nowrap"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                        fontSize: 12,
                        fontWeight: 500,
                        letterSpacing: "0.04em",
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
                  const isSelected = row.id === selectedId;
                  const notes = row.notes || "";
                  const notesToShow =
                    notes.length > 50
                      ? notes.slice(0, 50) + "…"
                      : notes;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => handleRowClick(row.id)}
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
                      {/* Organization */}
                      <td
                        className="px-4 py-3 font-medium whitespace-nowrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {row.employer || "—"}
                      </td>
                      {/* Constituent Type */}
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Organization
                      </td>
                      {/* Employment Type */}
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {row.employmentType || "—"}
                      </td>
                      {/* Title */}
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {row.position || "—"}
                      </td>
                      {/* Start Date */}
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {formatDisplayDate(row.startDate)}
                      </td>
                      {/* End Date */}
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {formatDisplayDate(row.endDate) || "—"}
                      </td>
                      {/* Notes — truncated with title tooltip */}
                      <td
                        className="px-4 py-3 max-w-[200px] truncate"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                        title={notes || undefined}
                      >
                        {notes ? notesToShow : "—"}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openView(row);
                            }}
                            className="h-7 w-7 rounded flex items-center justify-center transition-colors hover:bg-[#eff6ff]"
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
                            className="h-7 w-7 rounded flex items-center justify-center transition-colors hover:bg-[#eff6ff]"
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
                            className="h-7 w-7 rounded flex items-center justify-center transition-colors hover:bg-[#fff1f0]"
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
            <EmploymentIllustration />
            <h3
              className="mt-4 text-[14px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              No Employment Records
            </h3>
            <p
              className="mt-1.5 slds-text-4 max-w-xs"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              No employment records have been added for this
              client. Click{" "}
              <strong>Create New Employment</strong> to get
              started.
            </p>
          </div>
        )}
      </div>

      {/* ── Create / Edit / View Modal ─────────────────────────────────────── */}
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
              maxWidth: 860,
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
                    ? "View Employment"
                    : modalMode === "edit"
                      ? "Edit Employment"
                      : "Create New Employment"}
                </h2>
                <p
                  className="slds-text-3 mt-0.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  {isViewMode
                    ? "Viewing employment details in read-only mode."
                    : modalMode === "edit"
                      ? "Update the details for this employment record."
                      : "Capture employment details for this client."}
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
              {/* Active duplicate error banner */}
              {formErrors.active_duplicate && (
                <div
                  className="px-4 py-3 rounded-lg flex items-start gap-2 text-[13px]"
                  style={{
                    backgroundColor: "#fff1f0",
                    border: "1px solid #fecaca",
                    color: "#c23934",
                  }}
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  {formErrors.active_duplicate}
                </div>
              )}

              {/* ── Employer Information ── */}
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
                  Employer Information
                </h3>

                <div className="grid grid-cols-1 gap-y-4">
                  {/* Organization — full width */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      Organization{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <SearchableSelect
                      value={form.employer}
                      onChange={handleEmployerSelect}
                      options={EMPLOYER_OPTIONS}
                      placeholder="Select Organization"
                      disabled={isViewMode}
                      hasError={!!formErrors.employer}
                    />
                    <FieldError msg={formErrors.employer} />
                  </div>

                  {/* Organization Address — read-only, full width */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      Organization Address
                    </label>
                    {form.employerAddress ? (
                      <p
                        className="slds-text-4 px-3 py-2 rounded min-h-[36px]"
                        style={{
                          ...inputStyle(false, true),
                          lineHeight: "1.5",
                        }}
                      >
                        {form.employerAddress}
                      </p>
                    ) : (
                      <p
                        className="slds-text-4 px-3 py-2 rounded min-h-[36px]"
                        style={{
                          ...inputStyle(false, true),
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        —
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Organization Phone — read-only */}
                    <div className="space-y-1.5">
                      <label
                        className={labelCls}
                        style={labelStyle}
                      >
                        Organization Phone
                      </label>
                      <p
                        className="slds-text-4 px-3 py-2 rounded h-9 flex items-center"
                        style={{
                          ...inputStyle(false, true),
                          color: form.phone
                            ? "var(--slds-g-color-text-default)"
                            : "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {form.phone || "—"}
                      </p>
                    </div>

                    {/* spacer — keeps layout balanced on desktop */}
                    <div />
                  </div>

                  {/* Contact Details — read-only, full width */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      Contact Details
                    </label>
                    <p
                      className="slds-text-4 px-3 py-2 rounded min-h-[36px]"
                      style={{
                        ...inputStyle(false, true),
                        color: form.supervisorContact
                          ? "var(--slds-g-color-text-default)"
                          : "var(--slds-g-color-text-weak)",
                        lineHeight: "1.5",
                      }}
                    >
                      {form.supervisorContact || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Employment Details ── */}
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      START DATE{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <DateInput
                      disabled={isViewMode}
                      value={form.startDate}
                      onChange={(v) => setField("startDate", v)}
                      className={inputBase}
                      style={inputStyle(
                        !!formErrors.startDate,
                        isViewMode,
                      )}
                    />
                    <FieldError msg={formErrors.startDate} />
                  </div>
                  {/* End Date */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      END DATE
                    </label>
                    <DateInput
                      disabled={isViewMode}
                      value={form.endDate}
                      onChange={(v) => setField("endDate", v)}
                      className={inputBase}
                      style={inputStyle(
                        !!formErrors.startDate,
                        isViewMode,
                      )}
                    />
                    <FieldError msg={formErrors.endDate} />
                  </div>
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      disabled={isViewMode}
                      value={form.position}
                      onChange={(e) =>
                        setField("position", e.target.value)
                      }
                      placeholder="Enter job title"
                      className={inputBase}
                      style={inputStyle(false, isViewMode)}
                    />
                  </div>

                  {/* Position Type */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      Position Type
                    </label>
                    <select
                      disabled={isViewMode}
                      value={(form as any).positionType ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          positionType: e.target.value,
                        }))
                      }
                      className="w-full h-9 px-3 rounded text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={inputStyle(false, isViewMode)}
                    >
                      <option value="">
                        Select Position Type
                      </option>
                      {POSITION_TYPE_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Employment Type */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      Employment Type
                    </label>
                    <select
                      disabled={isViewMode}
                      value={form.employmentType}
                      onChange={(e) =>
                        setField(
                          "employmentType",
                          e.target.value,
                        )
                      }
                      className="w-full h-9 px-3 rounded text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={inputStyle(false, isViewMode)}
                    >
                      <option value="">
                        Select Employment Type
                      </option>
                      {EMPLOYMENT_TYPE_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pay Frequency */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      Pay Frequency
                    </label>
                    <select
                      disabled={isViewMode}
                      value={(form as any).payFrequency ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          payFrequency: e.target.value,
                        }))
                      }
                      className="w-full h-9 px-3 rounded text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={inputStyle(false, isViewMode)}
                    >
                      <option value="">
                        Select Pay Frequency
                      </option>
                      {PAY_FREQUENCY_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pay Rate */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      Pay Rate
                    </label>
                    <div className="relative">
                      <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        $
                      </span>
                      <input
                        type="text"
                        disabled={isViewMode}
                        value={form.hourlyWage}
                        onChange={(e) =>
                          setField("hourlyWage", e.target.value)
                        }
                        placeholder="Enter pay rate"
                        className={`${inputBase} pl-7`}
                        style={inputStyle(false, isViewMode)}
                      />
                    </div>
                  </div>

                  {/* First Pay Date */}
                  <div className="space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      First Pay Date
                    </label>
                    <DateInput
                      disabled={isViewMode}
                      value={(form as any).firstPayDate ?? ""}
                      onChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          firstPayDate: v,
                        }))
                      }
                      className={inputBase}
                      style={inputStyle(false, isViewMode)}
                    />
                  </div>

                  {/* Reason for Leaving — full width */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label
                      className={labelCls}
                      style={labelStyle}
                    >
                      Reason for Leaving
                    </label>
                    <textarea
                      disabled={isViewMode}
                      value={form.notes}
                      onChange={(e) =>
                        setField("notes", e.target.value)
                      }
                      placeholder="Enter reason for leaving"
                      rows={3}
                      className="w-full px-3 py-2 rounded text-[13px] resize-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                      style={inputStyle(false, isViewMode)}
                    />
                  </div>
                </div>
              </div>

              {/* ── Disciplinary Actions ── */}
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <div>
                    <h4
                      className="text-[12px] font-semibold"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      Disciplinary Actions
                    </h4>
                    <p
                      className="slds-text-3 mt-0.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Record and manage disciplinary actions
                      associated with this employment.
                    </p>
                  </div>
                  {!isViewMode && !addingDisc && (
                    <button
                      onClick={() => {
                        setAddingDisc(true);
                        setEditingDiscId(null);
                        setDiscForm({ ...EMPTY_DISC });
                        setDiscFormErrors({});
                      }}
                      className="cursor-pointer px-3 py-1 bg-transparent font-medium flex items-center gap-1.5 bh-outlined-primary"
                      style={{
                        color: "var(--color-brand-primary)",
                        border:
                          "1.5px solid var(--color-brand-primary)",
                        borderRadius: "9999px",
                        fontSize: "var(--slds-g-font-size-3)",
                      }}
                    >
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  )}
                </div>

                {/* Existing disciplinary action rows */}
                {form.disciplinaryActions.length === 0 &&
                !addingDisc ? (
                  <div className="px-4 py-6 text-center">
                    <ShieldAlert
                      className="h-7 w-7 mx-auto mb-2"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    />
                    <p
                      className="text-[12px]"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      No disciplinary actions recorded.
                    </p>
                  </div>
                ) : (
                  <div>
                    {form.disciplinaryActions.map(
                      (disc, idx) => {
                        const isEditingThis =
                          editingDiscId === disc.id;
                        return (
                          <div
                            key={disc.id}
                            style={{
                              borderBottom:
                                idx <
                                  form.disciplinaryActions
                                    .length -
                                    1 || addingDisc
                                  ? "1px solid var(--slds-g-color-border-base-1)"
                                  : undefined,
                              backgroundColor: isEditingThis
                                ? "rgba(20,95,51,0.03)"
                                : undefined,
                            }}
                          >
                            {isEditingThis ? (
                              /* Inline edit form for this action */
                              <DiscInlineForm
                                discForm={discForm}
                                setDiscForm={setDiscForm}
                                discFormErrors={discFormErrors}
                                inputBase={inputBase}
                                inputStyleFn={inputStyle}
                                labelCls={labelCls}
                                labelStyle={labelStyle}
                                onSave={handleDiscSave}
                                onCancel={cancelDiscForm}
                                isEditing
                              />
                            ) : (
                              /* Read row */
                              <div className="px-4 py-3 flex items-start gap-4">
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 min-w-0">
                                  <div>
                                    <p
                                      className="text-[11px] font-semibold uppercase tracking-wide mb-0.5"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      Date
                                    </p>
                                    <p
                                      className="text-[13px]"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {disc.date || "—"}
                                    </p>
                                  </div>
                                  <div>
                                    <p
                                      className="text-[11px] font-semibold uppercase tracking-wide mb-0.5"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      Type
                                    </p>
                                    <span
                                      className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                      style={{
                                        backgroundColor:
                                          "#fff7ed",
                                        color: "#c2410c",
                                        border:
                                          "1px solid #fed7aa",
                                      }}
                                    >
                                      {disc.type}
                                    </span>
                                  </div>
                                  <div className="sm:col-span-1">
                                    <p
                                      className="text-[11px] font-semibold uppercase tracking-wide mb-0.5"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      Resolved
                                    </p>
                                    <span
                                      className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                      style={
                                        disc.resolved
                                          ? {
                                              backgroundColor:
                                                "#f0fdf4",
                                              color: "#145F33",
                                              border:
                                                "1px solid #bbf7d0",
                                            }
                                          : {
                                              backgroundColor:
                                                "#f3f4f6",
                                              color: "#6b7280",
                                              border:
                                                "1px solid #d1d5db",
                                            }
                                      }
                                    >
                                      {disc.resolved
                                        ? "Yes"
                                        : "No"}
                                    </span>
                                  </div>
                                  <div className="sm:col-span-3 mt-1">
                                    <p
                                      className="text-[11px] font-semibold uppercase tracking-wide mb-0.5"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      Description
                                    </p>
                                    <p
                                      className="text-[13px]"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {disc.description}
                                    </p>
                                  </div>
                                  {disc.resolutionNotes && (
                                    <div className="sm:col-span-3">
                                      <p
                                        className="text-[11px] font-semibold uppercase tracking-wide mb-0.5"
                                        style={{
                                          color:
                                            "var(--slds-g-color-text-weak)",
                                        }}
                                      >
                                        Resolution Notes
                                      </p>
                                      <p
                                        className="text-[13px]"
                                        style={{
                                          color:
                                            "var(--slds-g-color-text-default)",
                                        }}
                                      >
                                        {disc.resolutionNotes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                {!isViewMode && (
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                      onClick={() =>
                                        handleDiscEdit(disc)
                                      }
                                      className="h-7 w-7 rounded flex items-center justify-center transition-colors hover:bg-[#eff6ff]"
                                      style={{
                                        color: "#0176d3",
                                      }}
                                      title="Edit"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDiscDelete(
                                          disc.id,
                                        )
                                      }
                                      className="h-7 w-7 rounded flex items-center justify-center transition-colors hover:bg-[#fff1f0]"
                                      style={{
                                        color: "#c23934",
                                      }}
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      },
                    )}

                    {/* New action inline form (not editing an existing one) */}
                    {addingDisc && editingDiscId === null && (
                      <DiscInlineForm
                        discForm={discForm}
                        setDiscForm={setDiscForm}
                        discFormErrors={discFormErrors}
                        inputBase={inputBase}
                        inputStyleFn={inputStyle}
                        labelCls={labelCls}
                        labelStyle={labelStyle}
                        onSave={handleDiscSave}
                        onCancel={cancelDiscForm}
                        isEditing={false}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* ── Documents ── */}
              <PlanDocumentsSection
                documents={form.documents ?? []}
                onChange={(next) => setForm((f) => ({ ...f, documents: next }))}
                filePrefix="Employment_Document"
                readOnly={isViewMode}
                sectionCard={(title, children) => (
                  <div>
                    <h3
                      className="text-[12px] font-semibold uppercase tracking-wide mb-4"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                        borderBottom: "1px solid var(--slds-g-color-border-base-1)",
                        paddingBottom: "8px",
                      }}
                    >
                      {title}
                    </h3>
                    {children}
                  </div>
                )}
              />
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
                  <button
                    onClick={() => handleSave()}
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
                    {modalMode === "edit"
                      ? "Save Changes"
                      : "Save"}
                  </button>
                </>
              )}
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
                Delete Employment
              </h3>
              <p
                className="mt-2 text-[13px]"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Are you sure you want to delete this employment
                record?{" "}
                <span
                  className="font-medium"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {selectedRecord?.position}
                </span>{" "}
                at{" "}
                <span
                  className="font-medium"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {selectedRecord?.employer}
                </span>{" "}
                will be permanently removed.
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

// ─── Disciplinary Action Inline Form (extracted to avoid re-renders) ──────────

interface DiscInlineFormProps {
  discForm: Omit<DisciplinaryAction, "id">;
  setDiscForm: React.Dispatch<
    React.SetStateAction<Omit<DisciplinaryAction, "id">>
  >;
  discFormErrors: {
    date?: string;
    type?: string;
    description?: string;
  };
  inputBase: string;
  inputStyleFn: (
    hasErr?: boolean,
    viewMode?: boolean,
  ) => React.CSSProperties;
  labelCls: string;
  labelStyle: React.CSSProperties;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

function DiscInlineForm({
  discForm,
  setDiscForm,
  discFormErrors,
  inputBase,
  inputStyleFn,
  labelCls,
  labelStyle,
  onSave,
  onCancel,
  isEditing,
}: DiscInlineFormProps) {
  return (
    <div
      className="px-4 py-4 space-y-4"
      style={{
        backgroundColor: "rgba(20,95,51,0.02)",
        borderTop: isEditing
          ? "1px solid var(--slds-g-color-border-base-1)"
          : undefined,
      }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: "var(--slds-g-color-text-weak)" }}
      >
        {isEditing
          ? "Edit Disciplinary Action"
          : "New Disciplinary Action"}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {/* Date */}
        <div className="space-y-1.5">
          <label className={labelCls} style={labelStyle}>
            Date <span className="text-red-600">*</span>
          </label>
          <DateInput
            value={isoToMdy(
              discForm.date
                ? (() => {
                    const [m, d, y] = discForm.date.split("/");
                    return `${y}-${m}-${d}`;
                  })()
                : "",
            )}
            onChange={(v) =>
              ((e) => {
                if (!e.target.value) {
                  setDiscForm((f) => ({ ...f, date: "" }));
                  return;
                }
                const [y, m, d] = e.target.value.split("-");
                setDiscForm((f) => ({
                  ...f,
                  date: `${m}/${d}/${y}`,
                }));
              })({ target: { value: mdyToIso(v) } })
            }
            className={inputBase}
            style={inputStyleFn(!!discFormErrors.date)}
          />
          {discFormErrors.date && (
            <p
              className="flex items-center gap-1 text-[11px]"
              style={{ color: "#c23934" }}
            >
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              {discFormErrors.date}
            </p>
          )}
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <label className={labelCls} style={labelStyle}>
            Type <span className="text-red-600">*</span>
          </label>
          <select
            value={discForm.type}
            onChange={(e) =>
              setDiscForm((f) => ({
                ...f,
                type: e.target.value,
              }))
            }
            className="w-full h-9 px-3 rounded text-[13px]"
            style={inputStyleFn(!!discFormErrors.type)}
          >
            <option value="">Select type…</option>
            {DISC_ACTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {discFormErrors.type && (
            <p
              className="flex items-center gap-1 text-[11px]"
              style={{ color: "#c23934" }}
            >
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              {discFormErrors.type}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className={labelCls} style={labelStyle}>
            SUMMARY <span className="text-red-600">*</span>
          </label>
          <textarea
            value={discForm.description}
            onChange={(e) =>
              setDiscForm((f) => ({
                ...f,
                description: e.target.value,
              }))
            }
            placeholder="Describe the Sumarry"
            rows={2}
            className="w-full px-3 py-2 rounded text-[13px] resize-none focus:outline-none focus:ring-1 focus:ring-[#145F33]"
            style={inputStyleFn(!!discFormErrors.description)}
          />
          {discFormErrors.description && (
            <p
              className="flex items-center gap-1 text-[11px]"
              style={{ color: "#c23934" }}
            >
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              {discFormErrors.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="cursor-pointer px-3 py-1 bg-transparent font-medium flex items-center gap-1.5 bh-outlined-neutral"
          style={{
            color: "var(--slds-g-color-text-default)",
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: "9999px",
            fontSize: "var(--slds-g-font-size-3)",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="cursor-pointer px-2 py-1 bg-transparent font-medium flex items-center gap-1.5 bh-outlined-primary"
          style={{
            color: "var(--color-brand-primary)",
            border: "1.5px solid var(--color-brand-primary)",
            borderRadius: "9999px",
            fontSize: "var(--slds-g-font-size-3)",
          }}
        >
          {isEditing ? (
            <>
              <RefreshCw className="h-3 w-auto" />
              {""}
            </>
          ) : (
            <>
              <Plus className="h-3 w-auto" />
              {""}
            </>
          )}
          {isEditing ? "Update" : "Add"}
        </button>
      </div>
    </div>
  );
}