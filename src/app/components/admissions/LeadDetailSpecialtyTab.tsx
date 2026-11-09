// Education and Vocation → Specialty / Specialties.
//
// Two modes, chosen by the optional `owner` prop:
//  - No owner (legacy callers): records live in component state, Specialty
//    is picked from SPECIALTY_OPTIONS, and Supporting Credentials come from
//    the fixed AVAILABLE_CREDENTIALS sample list (existing behavior).
//  - With owner (Contractor, US 20097): records are read from and written to
//    the owner-keyed constituentEducationVocationStore. Specialty is free
//    text, and Supporting Credentials are this owner's saved Credentials,
//    linked by stable credential id so later credential edits show through.
// Supporting-credential Add / Modify / Remove are staged in the specialty
// draft and committed only when the specialty is saved; Cancel discards
// them. Dialogs use the DLG-01 structure.

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
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { DateInput } from "../ui/date-input";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
  FieldError,
  focusFirstError,
} from "../ff-mentee/IntakeQuestionnaire";
import { parseCalendarDate } from "../../data/ffMenteeIntake";
import { formatMdy } from "../../lib/dateFormat";
import {
  allocateEducationVocationId,
  credentialDisplayName,
  deleteOwnerSpecialty,
  saveOwnerSpecialty,
  useOwnerEducationVocation,
  type OwnedCredential,
  type OwnedSpecialty,
  type SpecialtyCredentialLink,
} from "../../data/constituentEducationVocationStore";
import { getDemoUserName } from "../../lib/demoIdentity";

// ─── Types ────────────────────────────────────────────────────────────────────

type SpecialtyStatus = OwnedSpecialty["status"];

// ─── Reference Data ───────────────────────────────────────────────────────────

const SPECIALTY_OPTIONS = [
  "Baking & Pastry Arts",
  "Carpentry",
  "Certified Nursing Assistant (CNA)",
  "Commercial Driving (CDL)",
  "Computer Networking",
  "Cosmetology",
  "Culinary Arts",
  "Customer Service",
  "Data Entry & Office Administration",
  "Electrical Wiring",
  "HVAC Technician",
  "Medical Billing & Coding",
  "Phlebotomy",
  "Plumbing",
  "Retail Management",
  "Screen Printing",
  "Software Development",
  "Welding",
  "Woodworking",
  "Youth Entrepreneurship",
];

const CATEGORY_OPTIONS = [
  "Culinary Arts",
  "Healthcare",
  "Information Technology",
  "Construction",
  "Manufacturing",
  "Business Administration",
  "Automotive",
  "Hospitality",
  "Graphic Design",
  "Skilled Trades",
  "Other",
];

const AVAILABLE_CREDENTIALS = [
  {
    label: "OSHA Construction Certification (10 Hour)",
    type: "Certification",
    issueDate: "01/15/2024",
    expirationDate: "01/15/2026",
  },
  {
    label: "OSHA Safety Certification (10 Hour)",
    type: "Certification",
    issueDate: "03/22/2024",
    expirationDate: "03/22/2026",
  },
  {
    label: "PERC Card",
    type: "Identification",
    issueDate: "06/01/2023",
    expirationDate: "06/01/2025",
  },
  {
    label: "Comp",
    type: "Certification",
    issueDate: "09/10/2023",
    expirationDate: "",
  },
];

const STATUS_BADGE: Record<
  SpecialtyStatus,
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

const CREDENTIAL_STATUS_BADGE: Record<
  string,
  { bg: string; color: string; border: string }
> = {
  Active: {
    bg: "#f0fdf4",
    color: "#145F33",
    border: "#bbf7d0",
  },
  Expired: {
    bg: "#fff1f0",
    color: "#c23934",
    border: "#fecaca",
  },
};

/** Legacy sample credentials as resolvable records (stable ids). */
const LEGACY_CREDENTIAL_POOL: OwnedCredential[] =
  AVAILABLE_CREDENTIALS.map((c) => ({
    id: `legacy:${c.label}`,
    credential: c.label,
    credentialOther: "",
    credentialType: c.type,
    issuingOrganization: "",
    issueDate: c.issueDate,
    expirationDate: c.expirationDate,
  }));

type Draft = Omit<
  OwnedSpecialty,
  "id" | "lastModifiedBy" | "lastModifiedDate"
>;
const EMPTY_DRAFT: Draft = {
  specialty: "",
  category: "",
  description: "",
  startDate: "",
  endDate: "",
  status: "Active",
  credentials: [],
};
type DraftErrors = Partial<
  Record<
    | "specialty"
    | "startDate"
    | "endDate"
    | "status"
    | "duplicate",
    string
  >
>;

const EMPTY_LINK_DRAFT = {
  credentialId: "",
  associationDate: "",
};
type LinkErrors = Partial<
  Record<keyof typeof EMPTY_LINK_DRAFT, string>
>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Comparable day number for a real MM/DD/YYYY date, else null. */
function dayValue(mdy: string): number | null {
  const p = parseCalendarDate(mdy);
  return p ? p[0] * 10000 + p[1] * 100 + p[2] : null; // [yyyy, mm, dd]
}

function todayMdy() {
  return formatMdy(new Date());
}

function isCredentialExpired(expirationDate: string) {
  const expiry = dayValue(expirationDate);
  const today = dayValue(todayMdy());
  return expiry !== null && today !== null && expiry < today;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SpecialtyIllustration() {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="16"
        y="28"
        width="64"
        height="48"
        rx="5"
        fill="#f0fdf4"
        stroke="#bbf7d0"
        strokeWidth="1.5"
      />
      <rect
        x="24"
        y="38"
        width="32"
        height="4"
        rx="2"
        fill="#86efac"
      />
      <rect
        x="24"
        y="46"
        width="48"
        height="3"
        rx="1.5"
        fill="#dcfce7"
      />
      <rect
        x="24"
        y="53"
        width="40"
        height="3"
        rx="1.5"
        fill="#dcfce7"
      />
      <rect
        x="24"
        y="60"
        width="24"
        height="3"
        rx="1.5"
        fill="#dcfce7"
      />
      {/* Star/badge */}
      <polygon
        points="48,10 51,20 62,20 53,26 56,37 48,31 40,37 43,26 34,20 45,20"
        fill="#145F33"
        opacity="0.15"
      />
      <polygon
        points="48,13 50.5,20.5 59,20.5 52.5,25 55,33 48,28.5 41,33 43.5,25 37,20.5 45.5,20.5"
        fill="#145F33"
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
          {[120, 110, 90, 90, 72, 100, 90, 60].map((w, j) => (
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

export function LeadDetailSpecialtyTab({
  owner,
  dateLabel = "Association Date",
}: {
  /** Constituent that owns the specialties. Omit for legacy local state. */
  owner?: { id: string; name: string };
  /** Label for a supporting credential's associationDate (Instructor uses
   *  "Date", US 20096). */
  dateLabel?: string;
} = {}) {
  const ownerRecords = useOwnerEducationVocation(
    owner?.id ?? "",
  );
  const [localRecords, setLocalRecords] = useState<
    OwnedSpecialty[]
  >([]);
  const records = owner
    ? ownerRecords.specialties
    : localRecords;
  // Credentials eligible as Supporting Credentials, resolved by id.
  const credentialPool = owner
    ? ownerRecords.credentials
    : LEGACY_CREDENTIAL_POOL;
  const credentialById = new Map(
    credentialPool.map((c) => [c.id, c]),
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<
    "create" | "edit" | "view"
  >("create");
  const [editingId, setEditingId] = useState<string | null>(
    null,
  );
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [deleteTarget, setDeleteTarget] =
    useState<OwnedSpecialty | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Supporting-credential sub-dialog (Add / Modify a staged link).
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkEditingId, setLinkEditingId] = useState<
    string | null
  >(null);
  const [linkDraft, setLinkDraft] = useState({
    ...EMPTY_LINK_DRAFT,
  });
  const [linkErrors, setLinkErrors] = useState<LinkErrors>({});
  // Supporting-credential row selected for Modify / Remove.
  const [selectedLinkId, setSelectedLinkId] = useState("");

  const isViewMode = modalMode === "view";
  const subjectCopy = owner
    ? owner.name
    : "the selected Youth constituent";

  const writeRecord = (rec: OwnedSpecialty) => {
    if (owner) saveOwnerSpecialty(owner.id, rec);
    else
      setLocalRecords((prev) =>
        prev.some((r) => r.id === rec.id)
          ? prev.map((r) => (r.id === rec.id ? rec : r))
          : [...prev, rec],
      );
  };

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({
      ...e,
      [k]: undefined,
      duplicate: undefined,
    }));
  };

  function openCreate() {
    setModalMode("create");
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setSelectedLinkId("");
    setModalOpen(true);
  }

  // Row actions receive the clicked record itself.
  function openRecord(
    rec: OwnedSpecialty,
    mode: "edit" | "view",
  ) {
    setModalMode(mode);
    setEditingId(rec.id);
    setDraft({
      specialty: rec.specialty,
      category: rec.category,
      description: rec.description,
      startDate: rec.startDate,
      endDate: rec.endDate,
      status: rec.status,
      credentials: rec.credentials.map((l) => ({ ...l })),
    });
    setErrors({});
    setSelectedLinkId("");
    setModalOpen(true);
  }

  function handleRefresh() {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Specialty data refreshed.");
    }, 800);
  }

  function validate(): DraftErrors {
    const e: DraftErrors = {};
    const name = draft.specialty.trim();
    if (!name) e.specialty = "Specialty is required.";
    const start = dayValue(draft.startDate);
    const end = dayValue(draft.endDate);
    if (!draft.startDate)
      e.startDate = "Start Date is required.";
    else if (start === null)
      e.startDate = "Enter a valid date (MM/DD/YYYY).";
    if (draft.endDate && end === null)
      e.endDate = "Enter a valid date (MM/DD/YYYY).";
    else if (start !== null && end !== null && end < start)
      e.endDate =
        "End Date must be greater than or equal to Start Date.";
    if (!draft.status) e.status = "Status is required.";
    if (draft.status === "Active" && name) {
      const conflict = records.find(
        (r) =>
          r.id !== editingId &&
          r.status === "Active" &&
          r.specialty.trim().toLowerCase() ===
            name.toLowerCase(),
      );
      if (conflict)
        e.duplicate =
          "Active Specialty already exists for this constituent.";
    }
    return e;
  }

  function handleSave(addAnother: boolean) {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      const { duplicate, ...fields } = e;
      focusFirstError(
        Object.fromEntries(
          Object.entries(
            duplicate && !Object.keys(fields).length
              ? { specialty: duplicate }
              : fields,
          ).map(([k, v]) => [`spec-${k}`, v ?? ""]),
        ),
      );
      return;
    }
    const rec: OwnedSpecialty = {
      id: editingId ?? allocateEducationVocationId("SPEC"),
      ...draft,
      specialty: draft.specialty.trim(),
      lastModifiedBy: getDemoUserName(),
      lastModifiedDate: todayMdy(),
    };
    writeRecord(rec);
    toast.success(
      editingId
        ? "Specialty updated successfully."
        : "Specialty created successfully.",
    );
    if (addAnother) {
      setModalMode("create");
      setEditingId(null);
      setDraft(EMPTY_DRAFT);
      setErrors({});
    } else {
      setModalOpen(false);
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    if (owner) deleteOwnerSpecialty(owner.id, deleteTarget.id);
    else
      setLocalRecords((prev) =>
        prev.filter((r) => r.id !== deleteTarget.id),
      );
    setDeleteTarget(null);
    toast.success("Specialty deleted successfully.");
  }

  // ── Supporting credentials (staged in the draft) ──────────────────────────

  /** Pool credentials not already linked (except the link being modified). */
  const eligibleFor = (editingLinkId: string | null) =>
    credentialPool.filter(
      (c) =>
        !draft.credentials.some(
          (l) =>
            l.credentialId === c.id && l.id !== editingLinkId,
        ),
    );

  function openAddLink() {
    setLinkEditingId(null);
    setLinkDraft({ ...EMPTY_LINK_DRAFT });
    setLinkErrors({});
    setLinkOpen(true);
  }

  function openModifyLink(link: SpecialtyCredentialLink) {
    setLinkEditingId(link.id);
    setLinkDraft({
      credentialId: link.credentialId,
      associationDate: link.associationDate,
    });
    setLinkErrors({});
    setLinkOpen(true);
  }

  function saveLink() {
    const e: LinkErrors = {};
    if (!linkDraft.credentialId)
      e.credentialId = "Please select a credential.";
    else if (
      draft.credentials.some(
        (l) =>
          l.credentialId === linkDraft.credentialId &&
          l.id !== linkEditingId,
      )
    )
      e.credentialId =
        "This credential has already been associated.";
    if (!linkDraft.associationDate)
      e.associationDate = `${dateLabel} is required.`;
    else if (dayValue(linkDraft.associationDate) === null)
      e.associationDate = "Enter a valid date (MM/DD/YYYY).";
    setLinkErrors(e);
    if (Object.keys(e).length) {
      focusFirstError(
        Object.fromEntries(
          Object.entries(e).map(([k, v]) => [
            `link-${k}`,
            v ?? "",
          ]),
        ),
      );
      return;
    }
    setDraft((d) => ({
      ...d,
      credentials: linkEditingId
        ? d.credentials.map((l) =>
            l.id === linkEditingId ? { ...l, ...linkDraft } : l,
          )
        : [
            ...d.credentials,
            {
              id: allocateEducationVocationId("LINK"),
              ...linkDraft,
            },
          ],
    }));
    setLinkOpen(false);
  }

  function removeLink(linkId: string) {
    setDraft((d) => ({
      ...d,
      credentials: d.credentials.filter((l) => l.id !== linkId),
    }));
    setSelectedLinkId("");
  }
  const selectedLink =
    draft.credentials.find((l) => l.id === selectedLinkId) ??
    null;

  const fieldErr = (k: keyof DraftErrors) => ({
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k]
      ? `spec-${k}-error`
      : undefined,
  });
  const linkFieldErr = (k: keyof LinkErrors) => ({
    "aria-invalid": !!linkErrors[k],
    "aria-describedby": linkErrors[k]
      ? `link-${k}-error`
      : undefined,
  });

  const noEligibleCredentials =
    credentialPool.length === 0 ||
    eligibleFor(null).length === 0;
  const linkOptions = eligibleFor(linkEditingId);

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
            {owner ? "Specialties" : "Specialty"}
          </h3>
          <p
            className="slds-text-3 mt-0.5"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Manage areas of specialization, career interests,
            focus programs, and supporting credentials for{" "}
            {subjectCopy}.
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
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            Create New Specialty
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-full"
            onClick={handleRefresh}
            aria-label="Refresh"
            title="Refresh"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Table / Empty State */}
        {isLoading ? (
          <div className="py-4">
            <TableSkeleton />
          </div>
        ) : records.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {[
                    "Specialty",
                    "Category",
                    "Start Date",
                    "End Date",
                    "Status",
                    "Last Modified By",
                    "Last Modified Date",
                  ].map((col) => (
                    <TableHead key={col} variant="slds">
                      {col}
                    </TableHead>
                  ))}
                  <TableHead variant="slds">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((row) => {
                  const badge = STATUS_BADGE[row.status];
                  return (
                    <TableRow key={row.id}>
                      <TableCell
                        wrap
                        className="px-4 font-medium"
                      >
                        {row.specialty}
                      </TableCell>
                      <TableCell className="px-4">
                        {row.category || "—"}
                      </TableCell>
                      <TableCell className="px-4">
                        {row.startDate || "—"}
                      </TableCell>
                      <TableCell className="px-4">
                        {row.endDate || "—"}
                      </TableCell>
                      <TableCell className="px-4">
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
                      </TableCell>
                      <TableCell className="px-4">
                        {row.lastModifiedBy}
                      </TableCell>
                      <TableCell className="px-4">
                        {row.lastModifiedDate}
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() =>
                              openRecord(row, "view")
                            }
                            aria-label={`View ${row.specialty}`}
                            title="View specialty"
                          >
                            <Eye
                              className="h-3.5 w-3.5"
                              style={{ color: "#0176d3" }}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() =>
                              openRecord(row, "edit")
                            }
                            aria-label={`Edit ${row.specialty}`}
                            title="Edit specialty"
                          >
                            <Pencil
                              className="h-3.5 w-3.5"
                              style={{ color: "#0176d3" }}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => setDeleteTarget(row)}
                            aria-label={`Delete ${row.specialty}`}
                            title="Delete specialty"
                          >
                            <Trash2
                              className="h-3.5 w-3.5"
                              style={{ color: "#c23934" }}
                            />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
            <SpecialtyIllustration />
            <h3
              className="mt-4 text-[14px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              No Specialty Records
            </h3>
            <p
              className="mt-1.5 slds-text-4 max-w-xs"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {owner
                ? `${owner.name} does not currently have any specialty records.`
                : "This youth does not currently have any specialty records."}
            </p>
          </div>
        )}
      </div>

      {/* ── Create / Edit / View Specialty — DLG-01 ─────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>
              {isViewMode
                ? "View Specialty"
                : modalMode === "edit"
                  ? "Edit Specialty"
                  : "Create New Specialty"}
            </DialogTitle>
            <DialogDescription>
              {isViewMode
                ? `Viewing specialty details for ${subjectCopy} in read-only mode.`
                : modalMode === "edit"
                  ? `Update this specialty record for ${subjectCopy}.`
                  : `Add a specialty for ${subjectCopy} and optionally associate supporting credentials.`}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-6">
            {/* ── Section: Specialty Information ── */}
            <section aria-labelledby="spec-info-heading">
              <h3
                id="spec-info-heading"
                className="text-[12px] font-semibold uppercase tracking-wide mb-4 pb-2"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                  borderBottom:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                Specialty Information
              </h3>

              {errors.duplicate && (
                <div
                  role="alert"
                  className="mb-4 px-4 py-3 rounded-lg flex items-start gap-2 text-[13px]"
                  style={{
                    backgroundColor: "#fff1f0",
                    border: "1px solid #fecaca",
                    color: "#c23934",
                  }}
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  {errors.duplicate}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {/* Specialty */}
                <div>
                  <label
                    htmlFor="spec-specialty"
                    className="slds-form-label block mb-1.5"
                  >
                    Specialty{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  {owner ? (
                    <Input
                      id="spec-specialty"
                      surface="base"
                      aria-required
                      className="h-9 text-[13px]"
                      placeholder="Enter specialty…"
                      value={draft.specialty}
                      readOnly={isViewMode}
                      onChange={(e) =>
                        set("specialty", e.target.value)
                      }
                      {...fieldErr("specialty")}
                    />
                  ) : (
                    <SearchableSelect
                      value={draft.specialty}
                      onChange={(val) => set("specialty", val)}
                      options={SPECIALTY_OPTIONS}
                      placeholder="Search specialties…"
                      disabled={isViewMode}
                      hasError={!!errors.specialty}
                    />
                  )}
                  <FieldError
                    id="spec-specialty"
                    msg={errors.specialty}
                  />
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="spec-category"
                    className="slds-form-label block mb-1.5"
                  >
                    Category
                  </label>
                  <Select
                    value={draft.category}
                    onValueChange={(v) => set("category", v)}
                    disabled={isViewMode}
                  >
                    <SelectTrigger
                      id="spec-category"
                      surface="base"
                    >
                      <SelectValue placeholder="Select category…" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description — full width */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="spec-description"
                    className="slds-form-label block mb-1.5"
                  >
                    Description{" "}
                    <span className="font-normal normal-case">
                      (optional, max 500 characters)
                    </span>
                  </label>
                  <Textarea
                    id="spec-description"
                    rows={3}
                    className="text-[13px] resize-none"
                    placeholder="Enter a brief description…"
                    value={draft.description}
                    readOnly={isViewMode}
                    onChange={(e) =>
                      set(
                        "description",
                        e.target.value.slice(0, 500),
                      )
                    }
                  />
                  {!isViewMode && (
                    <p
                      className="text-[11px] text-right mt-1"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {draft.description.length}/500
                    </p>
                  )}
                </div>

                {/* Start / End Date */}
                {(
                  [
                    ["startDate", "Start Date", true],
                    ["endDate", "End Date", false],
                  ] as const
                ).map(([k, label, required]) => (
                  <div key={k}>
                    <label
                      htmlFor={`spec-${k}`}
                      className="slds-form-label block mb-1.5"
                    >
                      {label}{" "}
                      {required && (
                        <span className="text-red-600">*</span>
                      )}
                    </label>
                    <DateInput
                      id={`spec-${k}`}
                      value={draft[k]}
                      onChange={(v) => set(k, v)}
                      required={required}
                      disabled={isViewMode}
                      {...fieldErr(k)}
                    />
                    <FieldError
                      id={`spec-${k}`}
                      msg={errors[k]}
                    />
                  </div>
                ))}

                {/* Status */}
                <div>
                  <label
                    htmlFor="spec-status"
                    className="slds-form-label block mb-1.5"
                  >
                    Status{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <Select
                    value={draft.status}
                    onValueChange={(v) =>
                      set("status", v as SpecialtyStatus)
                    }
                    disabled={isViewMode}
                  >
                    <SelectTrigger
                      id="spec-status"
                      surface="base"
                      aria-required
                      {...fieldErr("status")}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">
                        Active
                      </SelectItem>
                      <SelectItem value="Inactive">
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError
                    id="spec-status"
                    msg={errors.status}
                  />
                </div>
              </div>
            </section>

            {/* ── Section: Supporting Credentials ── */}
            <section
              aria-labelledby="spec-creds-heading"
              className="rounded-lg overflow-hidden"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <div
                className="px-4 py-3 flex items-start justify-between gap-3 flex-wrap"
                style={{
                  borderBottom:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <div>
                  <h4
                    id="spec-creds-heading"
                    className="text-[12px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Supporting Credentials
                  </h4>
                  <p
                    className="slds-text-3 mt-0.5"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Associate existing credential records with
                    this specialty. Changes are saved with the
                    specialty.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openAddLink}
                    disabled={
                      isViewMode || noEligibleCredentials
                    }
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Credential
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      selectedLink &&
                      openModifyLink(selectedLink)
                    }
                    disabled={isViewMode || !selectedLink}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Modify
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      selectedLink &&
                      removeLink(selectedLink.id)
                    }
                    disabled={isViewMode || !selectedLink}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>
              </div>

              {owner &&
                credentialPool.length === 0 &&
                !isViewMode && (
                  <p
                    role="status"
                    className="px-4 py-3 text-[13px]"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    No credentials available. Create one in{" "}
                    <strong>
                      Education and Vocation → Credentials
                    </strong>{" "}
                    for {owner.name}, then associate it here.
                  </p>
                )}

              {draft.credentials.length > 0 ? (
                <RadioGroup
                  value={selectedLinkId}
                  onValueChange={setSelectedLinkId}
                  disabled={isViewMode}
                  aria-label="Select a supporting credential"
                  className="block overflow-x-auto"
                >
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead
                          variant="slds"
                          className="w-10"
                        >
                          <span className="sr-only">
                            Select
                          </span>
                        </TableHead>
                        {[
                          "Supporting Credential",
                          "Credential Type",
                          dateLabel,
                          "Issue Date",
                          "Expiration Date",
                          "Status",
                        ].map((col) => (
                          <TableHead key={col} variant="slds">
                            {col}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {draft.credentials.map((link) => {
                        const cred = credentialById.get(
                          link.credentialId,
                        );
                        const name = cred
                          ? credentialDisplayName(cred)
                          : "Unavailable credential";
                        const expired = cred
                          ? isCredentialExpired(
                              cred.expirationDate,
                            )
                          : false;
                        const credBadge = expired
                          ? CREDENTIAL_STATUS_BADGE["Expired"]
                          : CREDENTIAL_STATUS_BADGE["Active"];
                        return (
                          <TableRow
                            key={link.id}
                            data-state={
                              link.id === selectedLinkId
                                ? "selected"
                                : undefined
                            }
                            onClick={() =>
                              !isViewMode &&
                              setSelectedLinkId(link.id)
                            }
                          >
                            <TableCell className="px-4">
                              <RadioGroupItem
                                value={link.id}
                                aria-label={`Select ${name}`}
                              />
                            </TableCell>
                            <TableCell wrap className="px-4">
                              {name}
                            </TableCell>
                            <TableCell className="px-4">
                              {cred?.credentialType || "—"}
                            </TableCell>
                            <TableCell className="px-4">
                              {link.associationDate || "—"}
                            </TableCell>
                            <TableCell className="px-4">
                              {cred?.issueDate || "—"}
                            </TableCell>
                            <TableCell className="px-4">
                              {cred?.expirationDate || "—"}
                            </TableCell>
                            <TableCell className="px-4">
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                style={{
                                  backgroundColor: credBadge.bg,
                                  color: credBadge.color,
                                  border: `1px solid ${credBadge.border}`,
                                }}
                              >
                                {expired ? "Expired" : "Active"}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </RadioGroup>
              ) : (
                <p
                  className="px-4 py-6 text-center text-[13px]"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  No supporting credentials associated.
                </p>
              )}
            </section>
          </DialogBody>
          <DialogFooter>
            {isViewMode ? (
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Close
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                {modalMode === "create" && (
                  <Button
                    variant="outline"
                    onClick={() => handleSave(true)}
                  >
                    Save &amp; New
                  </Button>
                )}
                <Button onClick={() => handleSave(false)}>
                  {modalMode === "edit"
                    ? "Save Changes"
                    : "Save"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add / Modify Supporting Credential — DLG-01 ─────────────────────── */}
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {linkEditingId
                ? "Modify Supporting Credential"
                : "Add Supporting Credential"}
            </DialogTitle>
            <DialogDescription>
              Choose a credential for {subjectCopy} and the date
              it was associated with this specialty.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div>
              <label
                htmlFor="link-credentialId"
                className="slds-form-label block mb-1.5"
              >
                Credential{" "}
                <span className="text-red-600">*</span>
              </label>
              <Select
                value={linkDraft.credentialId}
                onValueChange={(v) => {
                  setLinkDraft((d) => ({
                    ...d,
                    credentialId: v,
                  }));
                  setLinkErrors((e) => ({
                    ...e,
                    credentialId: undefined,
                  }));
                }}
              >
                <SelectTrigger
                  id="link-credentialId"
                  surface="base"
                  aria-required
                  {...linkFieldErr("credentialId")}
                >
                  <SelectValue placeholder="Select a credential" />
                </SelectTrigger>
                <SelectContent>
                  {linkOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {credentialDisplayName(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError
                id="link-credentialId"
                msg={linkErrors.credentialId}
              />
            </div>
            <div>
              <label
                htmlFor="link-associationDate"
                className="slds-form-label block mb-1.5"
              >
                {dateLabel}{" "}
                <span className="text-red-600">*</span>
              </label>
              <DateInput
                id="link-associationDate"
                value={linkDraft.associationDate}
                onChange={(v) => {
                  setLinkDraft((d) => ({
                    ...d,
                    associationDate: v,
                  }));
                  setLinkErrors((e) => ({
                    ...e,
                    associationDate: undefined,
                  }));
                }}
                required
                {...linkFieldErr("associationDate")}
              />
              <FieldError
                id="link-associationDate"
                msg={linkErrors.associationDate}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLinkOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveLink}>
              {linkEditingId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ────────────────────────────────────────────── */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Specialty
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this Specialty?{" "}
              <strong>{deleteTarget?.specialty}</strong> will be
              permanently removed from{" "}
              {owner ? `${owner.name}'s` : "this youth's"}{" "}
              record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}