import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Eye,
  ChevronsUpDown,
  Check,
  AlertCircle,
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
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import { getDemoUserName } from "../../lib/demoIdentity";

// ─── Types ────────────────────────────────────────────────────────────────────

type EnrollmentStatus = "Active" | "Inactive";

interface ProgramComponent {
  component: string;
  form: string;
  status: "Active" | "Pending" | "Inactive";
}

interface EnrollmentRecord {
  id: number;
  organization: string;
  programName: string;
  startDate: string; // MM/DD/YYYY
  endDate: string; // MM/DD/YYYY or ""
  status: EnrollmentStatus;
  lastModifiedBy: string;
  lastModifiedDate: string;
}

// ─── Reference Data ───────────────────────────────────────────────────────────

const PSO_ORGANIZATIONS = [
  "Blue Sky Bakery",
  "Chicago Culinary Academy",
  "Urban Workforce Program",
  "Future Leaders Institute",
  "City College Bridge Program",
];

const PSO_PROGRAMS: Record<string, string[]> = {
  "Blue Sky Bakery": [
    "Baking Fundamentals",
    "Advanced Baking Skills",
  ],
  "Chicago Culinary Academy": [
    "Culinary Foundations",
    "Food Service Internship",
  ],
  "Urban Workforce Program": [
    "Employment Readiness",
    "Job Placement Program",
  ],
  "Future Leaders Institute": [
    "Leadership Development",
    "Mentorship Track",
  ],
  "City College Bridge Program": [
    "College Readiness",
    "Academic Support Services",
  ],
};

const PROGRAM_OVERVIEWS: Record<string, string> = {
  "Baking Fundamentals":
    "An introductory program covering the core skills of commercial baking, ingredient measurement, and kitchen safety practices.",
  "Advanced Baking Skills":
    "Builds on foundational baking knowledge with advanced techniques, pastry arts, and production-scale operations.",
  "Culinary Foundations":
    "Introduces students to professional culinary arts including knife skills, cooking methods, and food safety certification.",
  "Food Service Internship":
    "A hands-on internship placement in a licensed food service establishment with mentored professional development.",
  "Employment Readiness":
    "Prepares participants for the workforce through resume building, interview coaching, and workplace professionalism training.",
  "Job Placement Program":
    "Connects program graduates with employer partners for direct job placement and ongoing career support.",
  "Leadership Development":
    "A structured curriculum focused on personal leadership, communication, conflict resolution, and civic engagement.",
  "Mentorship Track":
    "Pairs youth with experienced professional mentors for guided career exploration and personal growth.",
  "College Readiness":
    "Supports youth in navigating the college application process, financial aid, and academic preparation.",
  "Academic Support Services":
    "Provides tutoring, study skills coaching, and academic advising to improve educational outcomes.",
};

const PROGRAM_COMPONENTS: Record<string, ProgramComponent[]> = {
  "Baking Fundamentals": [
    {
      component: "Employment",
      form: "Employment List",
      status: "Active",
    },
    {
      component: "Advisors",
      form: "Advisors",
      status: "Active",
    },
    {
      component: "Education Plan",
      form: "Education Form",
      status: "Pending",
    },
  ],
  "Advanced Baking Skills": [
    {
      component: "Employment",
      form: "Employment List",
      status: "Active",
    },
    {
      component: "Education Plan",
      form: "Education Form",
      status: "Active",
    },
  ],
  "Culinary Foundations": [
    {
      component: "Advisors",
      form: "Advisors",
      status: "Active",
    },
    {
      component: "Education Plan",
      form: "Education Form",
      status: "Pending",
    },
  ],
  "Food Service Internship": [
    {
      component: "Employment",
      form: "Employment List",
      status: "Active",
    },
    {
      component: "Advisors",
      form: "Advisors",
      status: "Active",
    },
  ],
  "Employment Readiness": [
    {
      component: "Employment",
      form: "Employment List",
      status: "Active",
    },
    {
      component: "Advisors",
      form: "Advisors",
      status: "Active",
    },
    {
      component: "Education Plan",
      form: "Education Form",
      status: "Active",
    },
  ],
  "Job Placement Program": [
    {
      component: "Employment",
      form: "Employment List",
      status: "Active",
    },
  ],
};

const STATUS_BADGE: Record<
  EnrollmentStatus,
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

const COMPONENT_STATUS_BADGE: Record<
  "Active" | "Pending" | "Inactive",
  { bg: string; color: string; border: string }
> = {
  Active: {
    bg: "#f0fdf4",
    color: "#145F33",
    border: "#bbf7d0",
  },
  Pending: {
    bg: "#fff7ed",
    color: "#92400e",
    border: "#fed7aa",
  },
  Inactive: {
    bg: "#f3f4f6",
    color: "#6b7280",
    border: "#d1d5db",
  },
};

const EMPTY_FORM = {
  organization: "",
  programName: "",
  startDate: "",
  endDate: "",
  status: "Active" as EnrollmentStatus,
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function PSOIllustration() {
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
        y="30"
        width="68"
        height="46"
        rx="5"
        fill="#f0fdf4"
        stroke="#bbf7d0"
        strokeWidth="1.5"
      />
      <rect
        x="22"
        y="40"
        width="30"
        height="4"
        rx="2"
        fill="#86efac"
      />
      <rect
        x="22"
        y="48"
        width="46"
        height="3"
        rx="1.5"
        fill="#dcfce7"
      />
      <rect
        x="22"
        y="55"
        width="38"
        height="3"
        rx="1.5"
        fill="#dcfce7"
      />
      <rect
        x="22"
        y="62"
        width="28"
        height="3"
        rx="1.5"
        fill="#dcfce7"
      />
      {/* Graduation cap */}
      <polygon
        points="48,14 62,21 48,28 34,21"
        fill="#145F33"
      />
      <rect
        x="60"
        y="21"
        width="2"
        height="10"
        rx="1"
        fill="#145F33"
      />
      <ellipse cx="61" cy="32" rx="3" ry="2" fill="#145F33" />
      <path d="M40 26 v5 a8 4 0 0 0 16 0 v-5" fill="#0e4524" />
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
          {[120, 140, 90, 90, 72, 100, 90, 60].map((w, j) => (
            <div
              key={j}
              className="h-4 rounded"
              style={{
                width: w,
                backgroundColor:
                  "var(--slds-g-color-border-base-1)",
              }}
            />
          ))}
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
            placeholder="Search..."
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

export function LeadDetailPSOTab() {
  const [records, setRecords] = useState<EnrollmentRecord[]>(
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
    Partial<Record<keyof typeof EMPTY_FORM, string>>
  >({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectedRecord =
    records.find((r) => r.id === selectedId) ?? null;
  const hasSelection = selectedRecord !== null;
  const isViewMode = modalMode === "view";

  const availablePrograms = form.organization
    ? (PSO_PROGRAMS[form.organization] ?? [])
    : [];
  const programOverview = form.programName
    ? (PROGRAM_OVERVIEWS[form.programName] ?? "")
    : "";
  const programComponents = form.programName
    ? (PROGRAM_COMPONENTS[form.programName] ?? [])
    : [];

  function setField<K extends keyof typeof EMPTY_FORM>(
    key: K,
    value: (typeof EMPTY_FORM)[K],
  ) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      // Clearing org clears program too
      if (key === "organization") next.programName = "";
      return next;
    });
    setFormErrors((e) => ({ ...e, [key]: undefined }));
  }

  function openCreate() {
    setModalMode("create");
    setForm({ ...EMPTY_FORM });
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit() {
    if (!selectedRecord) return;
    setModalMode("edit");
    setForm({
      organization: selectedRecord.organization,
      programName: selectedRecord.programName,
      startDate: selectedRecord.startDate,
      endDate: selectedRecord.endDate,
      status: selectedRecord.status,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function openView() {
    if (!selectedRecord) return;
    setModalMode("view");
    setForm({
      organization: selectedRecord.organization,
      programName: selectedRecord.programName,
      startDate: selectedRecord.startDate,
      endDate: selectedRecord.endDate,
      status: selectedRecord.status,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function handleRefresh() {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Post Secondary Options data refreshed.");
    }, 800);
  }

  function validate() {
    const errs: typeof formErrors = {};
    if (!form.organization)
      errs.organization = "PSO Organization is required.";
    if (!form.programName)
      errs.programName = "PSO Program is required.";
    if (!form.startDate)
      errs.startDate = "Start Date is required.";
    if (
      form.endDate &&
      form.startDate &&
      form.endDate < form.startDate
    ) {
      errs.endDate =
        "End Date must be greater than or equal to Start Date.";
    }
    return errs;
  }

  function handleSave(addAnother: boolean) {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    const now = "07/16/2026";
    if (modalMode === "create") {
      const rec: EnrollmentRecord = {
        id: Date.now(),
        organization: form.organization,
        programName: form.programName,
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
        lastModifiedBy: getDemoUserName(),
        lastModifiedDate: now,
      };
      setRecords((prev) => [...prev, rec]);
      setSelectedId(rec.id);
      toast.success("Enrollment created successfully.");
    } else if (selectedRecord) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === selectedRecord.id
            ? {
                ...r,
                organization: form.organization,
                programName: form.programName,
                startDate: form.startDate,
                endDate: form.endDate,
                status: form.status,
                lastModifiedDate: now,
              }
            : r,
        ),
      );
      toast.success("Enrollment updated successfully.");
    }

    if (addAnother) {
      setForm({ ...EMPTY_FORM });
      setFormErrors({});
      setModalMode("create");
    } else {
      setModalOpen(false);
    }
  }

  function handleDeleteConfirm() {
    if (!selectedRecord) return;
    setRecords((prev) =>
      prev.filter((r) => r.id !== selectedRecord.id),
    );
    setSelectedId(null);
    setDeleteConfirmOpen(false);
    toast.success("Enrollment deleted successfully.");
  }

  function handleRowClick(id: number) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  const secondaryBtn = {
    base: "h-8 px-3 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-colors",
    style: {
      border: "1px solid var(--slds-g-color-border-base-1)",
      backgroundColor: "var(--slds-g-color-background-base)",
      color: "var(--slds-g-color-text-default)",
    } as React.CSSProperties,
  };

  const labelStyle = {
    className: "block slds-form-label mb-1",
    style: {
      color: "var(--slds-g-color-text-weak)",
    } as React.CSSProperties,
  };

  const inputStyle = {
    className:
      "w-full h-9 px-3 rounded text-[13px] focus:outline-none focus:ring-1 focus:ring-[#145F33]",
    style: {
      border: "1px solid var(--slds-g-color-border-base-1)",
      backgroundColor: "var(--slds-g-color-background-base)",
      color: "var(--slds-g-color-text-default)",
    } as React.CSSProperties,
  };

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
            Post Secondary Options
          </h3>
          <p
            className="slds-text-3 mt-0.5"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Manage post-secondary enrollment records,
            participating organizations, programs, and
            enrollment history for the selected Youth
            constituent.
          </p>
        </div>

        {/* Action Toolbar */}
        <div
          className="px-4 py-2 flex items-center gap-2 flex-wrap"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-base)",
          }}
        >
          {/* Primary: Create New Enrollment */}
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
            Create New Enrollment
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="h-8 w-8 rounded-full flex items-center justify-center transition-colors"
            style={secondaryBtn.style}
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
                    "Organization",
                    "PSO Program Name",
                    "Start Date",
                    "End Date",
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
                      <td
                        className="px-4 py-3 font-medium"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {row.organization}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {row.programName}
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
                              setSelectedId(row.id);
                              openView();
                            }}
                            className="h-7 w-7 rounded flex items-center justify-center transition-colors hover:bg-[#eff6ff]"
                            style={{ color: "#0176d3" }}
                            title="View enrollment"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(row.id);
                              setTimeout(openEdit, 0);
                            }}
                            className="h-7 w-7 rounded flex items-center justify-center transition-colors hover:bg-[#eff6ff]"
                            style={{ color: "#0176d3" }}
                            title="Edit enrollment"
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
                            title="Delete enrollment"
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

            {/* Row count */}
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
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
            <PSOIllustration />
            <h3
              className="mt-4 text-[14px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              No Post Secondary Enrollments
            </h3>
            <p
              className="mt-1.5 slds-text-4 max-w-xs"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              This youth has not been enrolled in any Post
              Secondary Options program.
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
              maxWidth: 800,
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
                    ? "View Enrollment"
                    : modalMode === "edit"
                      ? "Edit Enrollment"
                      : "Create New Enrollment"}
                </h2>
                <p
                  className="slds-text-3 mt-0.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  {isViewMode
                    ? "Viewing enrollment details in read-only mode."
                    : modalMode === "edit"
                      ? "Update the details for this enrollment record."
                      : "Enroll this youth into a Post Secondary Options program."}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="ml-4 flex-shrink-0 h-7 w-7 rounded flex items-center justify-center transition-colors"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--slds-g-color-background-alt)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "")
                }
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* ── Section: Enrollment Information ── */}
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
                  Enrollment Information
                </h3>

                {/* Two-column grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {/* PSO Organization */}
                  <div className="space-y-1.5">
                    <label {...labelStyle}>
                      PSO Organization{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <SearchableSelect
                      value={form.organization}
                      onChange={(val) =>
                        setField("organization", val)
                      }
                      options={PSO_ORGANIZATIONS}
                      placeholder="Search organizations…"
                      disabled={isViewMode}
                      hasError={!!formErrors.organization}
                    />
                    {formErrors.organization && (
                      <p
                        className="flex items-center gap-1 text-[11px]"
                        style={{ color: "#c23934" }}
                      >
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        {formErrors.organization}
                      </p>
                    )}
                  </div>

                  {/* PSO Program Name */}
                  <div className="space-y-1.5">
                    <label {...labelStyle}>
                      PSO Program Name{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <SearchableSelect
                      value={form.programName}
                      onChange={(val) =>
                        setField("programName", val)
                      }
                      options={availablePrograms}
                      placeholder={
                        form.organization
                          ? "Search programs…"
                          : "Select an organization first"
                      }
                      disabled={
                        isViewMode || !form.organization
                      }
                      hasError={!!formErrors.programName}
                    />
                    {formErrors.programName && (
                      <p
                        className="flex items-center gap-1 text-[11px]"
                        style={{ color: "#c23934" }}
                      >
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        {formErrors.programName}
                      </p>
                    )}
                  </div>

                  {/* Overview — full width */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label {...labelStyle}>Overview</label>
                    <textarea
                      readOnly
                      value={programOverview}
                      placeholder="Automatically populated after selecting a PSO Program."
                      rows={3}
                      className="w-full px-3 py-2 rounded text-[13px] resize-none"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                        color: programOverview
                          ? "var(--slds-g-color-text-default)"
                          : "var(--slds-g-color-text-weak)",
                      }}
                    />
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label {...labelStyle}>
                      Start Date{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <DateInput
disabled={isViewMode}
                      value={isoToMdy(toInputDate(form.startDate))}
                      onChange={(v) => ((e) =>
                        setField(
                          "startDate",
                          fromInputDate(e.target.value),
                        )
                      )({ target: { value: mdyToIso(v) } })}
                      className={`${inputStyle.className} disabled:opacity-50 disabled:cursor-not-allowed`}
                      style={{
                        ...inputStyle.style,
                        border: formErrors.startDate
                          ? "1px solid #c23934"
                          : "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    />
                    {formErrors.startDate && (
                      <p
                        className="flex items-center gap-1 text-[11px]"
                        style={{ color: "#c23934" }}
                      >
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        {formErrors.startDate}
                      </p>
                    )}
                  </div>

                  {/* End Date */}
                  <div className="space-y-1.5">
                    <label {...labelStyle}>End Date</label>
                    <DateInput
disabled={isViewMode}
                      value={isoToMdy(toInputDate(form.endDate))}
                      onChange={(v) => ((e) =>
                        setField(
                          "endDate",
                          fromInputDate(e.target.value),
                        )
                      )({ target: { value: mdyToIso(v) } })}
                      className={`${inputStyle.className} disabled:opacity-50 disabled:cursor-not-allowed`}
                      style={{
                        ...inputStyle.style,
                        border: formErrors.endDate
                          ? "1px solid #c23934"
                          : "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    />
                    {formErrors.endDate && (
                      <p
                        className="flex items-center gap-1 text-[11px]"
                        style={{ color: "#c23934" }}
                      >
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        {formErrors.endDate}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label {...labelStyle}>Status</label>
                    <select
                      disabled={isViewMode}
                      value={form.status}
                      onChange={(e) =>
                        setField(
                          "status",
                          e.target.value as EnrollmentStatus,
                        )
                      }
                      className="w-full h-9 px-3 rounded text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: isViewMode
                          ? "var(--slds-g-color-background-alt)"
                          : "var(--slds-g-color-background-base)",
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Section: Program Components ── */}
              {form.programName && (
                <div
                  className="rounded-lg overflow-hidden"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  {/* Section header */}
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
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      Program Components
                    </h4>
                    <p
                      className="slds-text-3 mt-0.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      The selected Post Secondary Program
                      includes the following informational
                      components.
                    </p>
                  </div>

                  {programComponents.length > 0 ? (
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                          }}
                        >
                          {["Component", "Form", "Status"].map(
                            (col) => (
                              <th
                                key={col}
                                className="px-4 py-2 text-left font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                  borderBottom:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                {col}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {programComponents.map((comp, i) => {
                          const badge =
                            COMPONENT_STATUS_BADGE[comp.status];
                          return (
                            <tr
                              key={i}
                              style={{
                                borderBottom:
                                  i <
                                  programComponents.length - 1
                                    ? "1px solid var(--slds-g-color-border-base-1)"
                                    : undefined,
                              }}
                            >
                              <td
                                className="px-4 py-2.5"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {comp.component}
                              </td>
                              <td
                                className="px-4 py-2.5"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                {comp.form}
                              </td>
                              <td className="px-4 py-2.5">
                                <span
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                  style={{
                                    backgroundColor: badge.bg,
                                    color: badge.color,
                                    border: `1px solid ${badge.border}`,
                                  }}
                                >
                                  {comp.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div
                      className="px-4 py-6 text-center text-[13px]"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      No components defined for this program.
                    </div>
                  )}
                </div>
              )}
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
                  className="h-9 px-5 rounded-full text-[13px] font-medium transition-colors"
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
                    className="h-9 px-5 rounded-full text-[13px] font-medium transition-colors"
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
                      className="h-9 px-5 rounded-full text-[13px] font-medium transition-colors"
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
                    className="h-9 px-5 rounded-full text-[13px] font-medium text-white transition-colors"
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
                Delete Enrollment
              </h3>
              <p
                className="mt-2 text-[13px]"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Are you sure you want to remove this enrollment?{" "}
                <span
                  className="font-medium"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {selectedRecord?.programName}
                </span>{" "}
                will be permanently removed from this youth's
                record.
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
                className="h-9 px-5 rounded-full text-[13px] font-medium transition-colors"
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
                className="h-9 px-5 rounded-full text-[13px] font-medium text-white transition-colors"
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