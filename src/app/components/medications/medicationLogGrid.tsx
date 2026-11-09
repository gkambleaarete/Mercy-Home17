import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Filter,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import {
  type MedicationAttestationRecord,
  type MedicationLogRecord,
  type MedicationLogType,
  countValueLabel,
} from "../../data/medicationLogStore";
import { formatMdy, isoToMdy } from "../../lib/dateFormat";

// Shared Medication Log grid (US 20100) — extracted unchanged from the
// Admissions Log (components/admissions/LogView.tsx) so the youth Log and
// the central Medications → Logs workspace use the same columns, column
// filters, header/rows markup and read-only Log Entry modal.

// ── Types ─────────────────────────────────────────────────────────────────────

/** Same union as the repository (AC-25 types + earlier reference types). */
export type LogType = MedicationLogType;

export type ViewMode = "general" | "counts" | "comments";
export type SortDir = "asc" | "desc";

// AC9: full text filter op set including Custom Filter
export type TextFilterOp =
  | "contains"
  | "not-contain"
  | "equals"
  | "not-equal"
  | "begins-with"
  | "ends-with"
  | "blank"
  | "not-blank"
  | "custom";

export interface ColumnFilter {
  mode: "text" | "value-select";
  textOp: TextFilterOp;
  textValue: string;
  selectedValues: Set<string>;
}

// AC12: LogEntry carries all common modal fields as top-level properties
export interface LogEntry {
  id: number;
  // Grid display fields
  doseDate: string;
  dosePeriod: string;
  inst: string;
  seq: number;
  logType: LogType;
  num: string;
  primaryCode: string;
  attestationDate: string;
  attestationTime: string;
  attestationStaff: string;
  medicationDose: string; // combined "Name - Dose" for grid display
  comments: string;
  dosePeriodComments: string;
  // AC12: common modal fields
  medicationId: string;
  constituentId: string;
  medicationName: string;
  dose: string;
  attestationText: string;
  // Central Logs (Chunk 2): stored Program ownership + Youth, resolved
  // to names from canonical ids; ISO timestamps for date sorting.
  logId: string;
  programId: number;
  program: string;
  youthId: string;
  youth: string;
  attestedAt: string;
  /** "#" in the central grid: the stored count / quantity, or "". */
  quantity: string;
  // Type-specific modal fields
  details: Record<string, string>;
}

export interface AttestationRecord {
  id: string;
  date: string;
  time: string;
  logType: LogType;
  staff: string;
  logEntryIds: number[];
  at?: string;
}

export interface ColumnDef {
  key: string;
  label: string;
  sortable: boolean;
  filterable: boolean;
  filterType?: "text" | "value-select";
  width?: string;
  minWidth?: string;
}

// ── Column Sets (AC4 / AC5 / AC6) ────────────────────────────────────────────

export const GENERAL_COLS: ColumnDef[] = [
  {
    key: "doseDate",
    label: "Dose Date",
    sortable: true,
    filterable: true,
    filterType: "text",
    minWidth: "110px",
  },
  {
    key: "dosePeriod",
    label: "Dose Period",
    sortable: true,
    filterable: true,
    filterType: "value-select",
    minWidth: "110px",
  },
  {
    key: "inst",
    label: "Inst",
    sortable: true,
    filterable: true,
    filterType: "text",
    minWidth: "90px",
  },
  {
    key: "seq",
    label: "Seq",
    sortable: true,
    filterable: true,
    filterType: "text",
    width: "60px",
  },
  {
    key: "logType",
    label: "Log Type",
    sortable: true,
    filterable: true,
    filterType: "value-select",
    minWidth: "200px",
  },
  {
    key: "num",
    label: "#",
    sortable: true,
    filterable: true,
    filterType: "text",
    width: "55px",
  },
  {
    key: "primaryCode",
    label: "Primary Code",
    sortable: true,
    filterable: true,
    filterType: "text",
    minWidth: "150px",
  },
  {
    key: "attestationDate",
    label: "Attestation Date",
    sortable: true,
    filterable: true,
    filterType: "text",
    minWidth: "130px",
  },
  {
    key: "attestationStaff",
    label: "Attestation Staff",
    sortable: true,
    filterable: true,
    filterType: "text",
    minWidth: "140px",
  },
  {
    key: "medicationDose",
    label: "Medication/Dose",
    sortable: true,
    filterable: true,
    filterType: "text",
    minWidth: "180px",
  },
];

export const COUNTS_COLS: ColumnDef[] = [
  {
    key: "doseDate",
    label: "Dose Date",
    sortable: true,
    filterable: true,
    filterType: "text",
    minWidth: "110px",
  },
  {
    key: "dosePeriod",
    label: "Dose Period",
    sortable: true,
    filterable: true,
    filterType: "value-select",
    minWidth: "110px",
  },
  {
    key: "inst",
    label: "Inst",
    sortable: true,
    filterable: true,
    filterType: "text",
    minWidth: "90px",
  },
  {
    key: "seq",
    label: "Seq",
    sortable: true,
    filterable: true,
    filterType: "text",
    width: "60px",
  },
  {
    key: "num",
    label: "#",
    sortable: true,
    filterable: true,
    filterType: "text",
    width: "55px",
  },
  {
    key: "comments",
    label: "Comments",
    sortable: true,
    filterable: true,
    filterType: "text",
    minWidth: "220px",
  },
  {
    key: "attestationDate",
    label: "Attestation Date",
    sortable: true,
    filterable: true,
    filterType: "text",
    minWidth: "130px",
  },
  {
    key: "attestationStaff",
    label: "Attestation Staff",
    sortable: true,
    filterable: true,
    filterType: "text",
    minWidth: "140px",
  },
  {
    key: "medicationDose",
    label: "Medication/Dose",
    sortable: true,
    filterable: true,
    filterType: "text",
    minWidth: "180px",
  },
];

export const COMMENTS_COLS: ColumnDef[] = [
  {
    key: "doseDate",
    label: "Dose Date",
    sortable: true,
    filterable: true,
    filterType: "text",
    minWidth: "110px",
  },
  {
    key: "dosePeriod",
    label: "Dose Period",
    sortable: true,
    filterable: true,
    filterType: "value-select",
    minWidth: "110px",
  },
  {
    key: "inst",
    label: "Inst",
    sortable: true,
    filterable: true,
    filterType: "text",
    minWidth: "90px",
  },
  {
    key: "seq",
    label: "Seq",
    sortable: true,
    filterable: true,
    filterType: "text",
    width: "60px",
  },
  {
    key: "logType",
    label: "Log Type",
    sortable: true,
    filterable: true,
    filterType: "value-select",
    minWidth: "200px",
  },
  {
    key: "comments",
    label: "Comments",
    sortable: true,
    filterable: true,
    filterType: "text",
    minWidth: "200px",
  },
  {
    key: "dosePeriodComments",
    label: "Dose Period Comments",
    sortable: true,
    filterable: true,
    filterType: "text",
    minWidth: "200px",
  },
  {
    key: "medicationDose",
    label: "Medication/Dose",
    sortable: true,
    filterable: true,
    filterType: "text",
    minWidth: "180px",
  },
];

// ── Data — the resolved youth's committed records (US 20100, Chunk 1) ─────
// Rows come from the medication log repository, scoped to one youth; there
// is no static or all-youth fallback. Attestations shown are only those
// linked to this youth's logs.

export const toISO = (d: string) => {
  const [m, day, y] = (d || "").split("/");
  return `${y || "0000"}-${m || "00"}-${day || "00"}`;
};

export const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

export function toLogEntry(
  l: MedicationLogRecord,
  att: MedicationAttestationRecord | undefined,
  names: {
    program: (id: number) => string;
    youth: (id: string) => string;
  } = {
    program: () => "",
    youth: () => "",
  },
): LogEntry {
  return {
    logId: l.id,
    programId: l.programId,
    program: names.program(l.programId),
    youthId: l.youthId,
    youth: names.youth(l.youthId),
    attestedAt: att?.attestedAt ?? "",
    // Stored values only — nothing is invented for logs without a quantity.
    quantity:
      l.logType === "Count"
        ? countValueLabel(l)
        : (l.details["Quantity"] ??
          l.details["Amount Disposed"] ??
          ""),
    id: l.recordNumber,
    doseDate: isoToMdy(l.doseDate),
    dosePeriod: l.dosePeriod,
    inst: l.instance,
    seq: l.seq,
    logType: l.logType,
    num: String(l.recordNumber),
    primaryCode: l.primaryCode,
    attestationDate: att ? formatMdy(att.attestedAt) : "",
    attestationTime: att ? timeOf(att.attestedAt) : "",
    attestationStaff: att?.staff ?? "",
    medicationDose: `${l.medicationName} - ${l.dose}`,
    comments: l.comment,
    dosePeriodComments: l.dosePeriodComment,
    medicationId: l.youthMedicationId ?? l.catalogMedicationId,
    constituentId: l.youthId,
    medicationName: l.medicationName,
    dose: l.dose,
    attestationText: att?.text ?? "",
    details:
      l.logType === "Count"
        ? {
            "Package Code": l.primaryCode,
            "Count Type Code ID": l.countType ?? "",
            Quantity: countValueLabel(l),
            "Medication Comment": l.comment,
          }
        : l.details,
  };
}

// ── Common / type-specific modal field config ─────────────────────────────────

// AC12: common fields shown in the View modal header section
export const COMMON_FIELD_KEYS = [
  "doseDate",
  "logType",
  "medicationId",
  "constituentId",
  "medicationName",
  "dose",
  "inst",
  "attestationText",
];
export const COMMON_FIELD_LABELS: Record<string, string> = {
  doseDate: "Date",
  logType: "Log Type",
  medicationId: "Medication ID",
  constituentId: "Constituent ID",
  medicationName: "Medication Name",
  dose: "Dose",
  inst: "Instance",
  attestationText: "Attestation Text",
};

// AC13 (Prescription Dispensation), AC14 (OTC Dispensation), AC15 (Count)
/** Known field lists; other types show the record's own stored fields. */
export const TYPE_SPECIFIC_FIELDS: Partial<
  Record<LogType, string[]>
> = {
  "Prescription Dispensation": [
    "Start Time",
    "End Time",
    "Package Code",
    "Primary Status",
    "Dose Period",
    "Dose Period Comment",
    "Instructions",
    "Medication Comment",
    "Staff Dispensed",
    "Youth Received",
    "Other Received",
    "Other Comment",
    "Constituent Medication Schedule",
  ],
  "OTC Dispensation": [
    "Medication Comment",
    "Quantity", // AC14
  ],
  Count: [
    "Package Code",
    "Count Type Code ID",
    "Quantity",
    "Medication Comment", // AC15
  ],
  Disposal: ["Amount Disposed", "Status", "Comment"],
  Lockbox: ["Action", "Medication Location", "Comment"],
  "Pharmacy Transfer (Pending)": [
    "Transfer Date",
    "Pharmacy",
    "Quantity",
    "Transfer Status",
    "Comment",
  ],
  "Pharmacy Transfer (Verified)": [
    "Transfer Date",
    "Pharmacy",
    "Quantity",
    "Transfer Status",
    "Comment",
  ],
};

// AC9: text filter op list including Custom Filter
export const TEXT_FILTER_OPS: {
  value: TextFilterOp;
  label: string;
}[] = [
  { value: "contains", label: "Contains" },
  { value: "not-contain", label: "Does Not Contain" },
  { value: "equals", label: "Equals" },
  { value: "not-equal", label: "Does Not Equal" },
  { value: "begins-with", label: "Begins With" },
  { value: "ends-with", label: "Ends With" },
  { value: "blank", label: "Is Blank" },
  { value: "not-blank", label: "Is Not Blank" },
  { value: "custom", label: "Custom Filter" },
];

export const BLANK_SENTINEL = "(Blank)"; // AC9: selectable "(Blank)" in value-select filters

// Reference badge palettes; the AC-25 types reuse them by family.
const BADGE = {
  blue: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  green: { bg: "#F0FDF4", color: "#14532D", border: "#86EFAC" },
  amber: { bg: "#FEF3C7", color: "#92400E", border: "#FCD34D" },
  red: { bg: "#FEF2F2", color: "#991B1B", border: "#FCA5A5" },
  violet: {
    bg: "#F5F3FF",
    color: "#5B21B6",
    border: "#DDD6FE",
  },
  orange: {
    bg: "#FFF7ED",
    color: "#9A3412",
    border: "#FDBA74",
  },
  teal: { bg: "#ECFDF5", color: "#065F46", border: "#6EE7B7" },
};
export const LOG_TYPE_BADGE: Record<
  LogType,
  { bg: string; color: string; border: string }
> = {
  "Prescription Dispensation": BADGE.blue,
  "OTC Dispensation": BADGE.green,
  Count: BADGE.amber,
  Disposal: BADGE.red,
  Lockbox: BADGE.violet,
  "Pharmacy Transfer (Pending)": BADGE.orange,
  "Pharmacy Transfer (Verified)": BADGE.teal,
  "Disposal – Med Cart": BADGE.red,
  "Disposal – Controlled Substance": BADGE.red,
  "Missed Dose": BADGE.orange,
  "Refused Dose": BADGE.orange,
  "Missed Packed Med": BADGE.orange,
  "PRN Declined": BADGE.orange,
  "Packed School Medication": BADGE.violet,
  "Adjusted Dose": BADGE.blue,
  "Medical Orders Update": BADGE.blue,
  "PRN Administration": BADGE.green,
  "Inventory Adjustment": BADGE.amber,
};
/** Badge colors for a type (neutral fallback for an unknown saved value). */
export function logTypeBadge(t: string) {
  return (
    LOG_TYPE_BADGE[t as LogType] ?? {
      bg: "var(--slds-g-color-background-alt)",
      color: "var(--slds-g-color-text-default)",
      border: "var(--slds-g-color-border-base-1)",
    }
  );
}

// ── Pure helpers (shared filter / sort logic) ────────────────────────────────

/** AC9: unique values per value-select column, with "(Blank)" first. */
export function columnValuesFor(
  entries: object[],
  columns: ColumnDef[],
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  columns.forEach((col) => {
    if (col.filterType === "value-select") {
      const vals = new Set<string>();
      let hasBlank = false;
      entries.forEach((e) => {
        const v = String(
          (e as Record<string, unknown>)[col.key] ?? "",
        );
        if (v.trim() === "") {
          hasBlank = true;
        } else {
          vals.add(v);
        }
      });
      const sorted = [...vals].sort();
      result[col.key] = hasBlank
        ? [BLANK_SENTINEL, ...sorted]
        : sorted;
    }
  });
  return result;
}

/** Column filters (AND) — value-select "(Blank)" sentinel and text ops. */
export function matchesColumnFilters(
  entry: object,
  columnFilters: Record<string, ColumnFilter>,
): boolean {
  for (const [col, filter] of Object.entries(columnFilters)) {
    const raw = String(
      (entry as Record<string, unknown>)[col] ?? "",
    );
    const v = raw.toLowerCase();
    if (filter.mode === "value-select") {
      if (filter.selectedValues.size > 0) {
        const matchesValue = filter.selectedValues.has(raw);
        const matchesBlank =
          filter.selectedValues.has(BLANK_SENTINEL) &&
          raw.trim() === "";
        if (!matchesValue && !matchesBlank) return false;
      }
    } else {
      const fv = (filter.textValue || "").toLowerCase();
      switch (filter.textOp) {
        case "contains":
        case "custom":
          if (!v.includes(fv)) return false;
          break;
        case "not-contain":
          if (v.includes(fv)) return false;
          break;
        case "equals":
          if (v !== fv) return false;
          break;
        case "not-equal":
          if (v === fv) return false;
          break;
        case "begins-with":
          if (!v.startsWith(fv)) return false;
          break;
        case "ends-with":
          if (!v.endsWith(fv)) return false;
          break;
        case "blank":
          if (v.trim() !== "") return false;
          break;
        case "not-blank":
          if (v.trim() === "") return false;
          break;
      }
    }
  }
  return true;
}

// ── Grid table (header sort + column filter dropdowns, rows, selection) ─────

/** Reused by the central Count grid (Chunk 4) with `selectable={false}` and
 *  `renderCell` for its editable columns. Defaults keep the Log behavior. */
export function LogGridTable<T extends { id: number }>({
  columns,
  rows,
  columnValues,
  columnFilters,
  onFilterChange,
  sortField,
  sortDir,
  onSort,
  selectedIds,
  allSelected,
  someSelected,
  onToggleAll,
  onToggleRow,
  onOpen,
  emptyMessage = "No log entries match the current filters.",
  renderActions,
  maxHeight = "calc(100vh - 320px)",
  bordered = true,
  uppercaseHeaders = false,
  selectable = true,
  renderCell,
  rowKey = (e: T) => e.id,
}: {
  columns: ColumnDef[];
  rows: T[];
  columnValues: Record<string, string[]>;
  columnFilters: Record<string, ColumnFilter>;
  /** null removes the column's filter. */
  onFilterChange: (
    colKey: string,
    filter: ColumnFilter | null,
  ) => void;
  sortField: string | null;
  sortDir: SortDir;
  onSort: (key: string) => void;
  selectedIds: Set<number>;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
  onToggleRow: (id: number) => void;
  onOpen?: (entry: T) => void;
  emptyMessage?: string;
  /** Optional Actions column (central Logs). */
  renderActions?: (entry: T) => React.ReactNode;
  /** Inner scroll height; "none" keeps a single page scroll. */
  maxHeight?: string;
  /** false when the grid sits inside a Card container that draws the border. */
  bordered?: boolean;
  /** Established uppercase grid headers (central Logs). */
  uppercaseHeaders?: boolean;
  /** false hides the Select column (central Count). */
  selectable?: boolean;
  /** Custom cell content (e.g. inputs); undefined falls back to the value. */
  renderCell?: (
    entry: T,
    col: ColumnDef,
  ) => React.ReactNode | undefined;
  rowKey?: (entry: T) => React.Key;
}) {
  const headCase = uppercaseHeaders
    ? " uppercase tracking-wide"
    : "";
  const [activeFilterCol, setActiveFilterCol] = useState<
    string | null
  >(null);
  const [filterDraft, setFilterDraft] = useState<
    Partial<ColumnFilter>
  >({});
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeFilterCol) return;
    const handler = (e: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(e.target as Node)
      ) {
        setActiveFilterCol(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () =>
      document.removeEventListener("mousedown", handler);
  }, [activeFilterCol]);

  function openFilter(
    colKey: string,
    filterType: "text" | "value-select",
  ) {
    if (activeFilterCol === colKey) {
      setActiveFilterCol(null);
      return;
    }
    const existing = columnFilters[colKey];
    setFilterDraft(
      existing
        ? {
            ...existing,
            selectedValues: new Set(existing.selectedValues),
          }
        : {
            mode: filterType,
            textOp: "contains",
            textValue: "",
            selectedValues: new Set(),
          },
    );
    setActiveFilterCol(colKey);
  }

  function applyFilter(colKey: string) {
    const d = filterDraft as ColumnFilter;
    const hasValue =
      d.mode === "text"
        ? d.textOp === "blank" ||
          d.textOp === "not-blank" ||
          (d.textValue ?? "").trim() !== ""
        : (d.selectedValues?.size ?? 0) > 0;
    onFilterChange(
      colKey,
      hasValue
        ? {
            ...d,
            selectedValues: d.selectedValues ?? new Set(),
          }
        : null,
    );
    setActiveFilterCol(null);
  }

  function clearFilter(colKey: string) {
    onFilterChange(colKey, null);
    setActiveFilterCol(null);
  }

  function SortIcon({ colKey }: { colKey: string }) {
    if (sortField !== colKey)
      return (
        <ChevronsUpDown className="h-3 w-3 opacity-40 flex-shrink-0" />
      );
    return sortDir === "asc" ? (
      <ChevronUp
        className="h-3 w-3 flex-shrink-0"
        style={{ color: "#145F33" }}
      />
    ) : (
      <ChevronDown
        className="h-3 w-3 flex-shrink-0"
        style={{ color: "#145F33" }}
      />
    );
  }

  // Helper: whether the text op needs a value input (blank/not-blank/custom do not need a text value)
  const needsTextInput = (op: TextFilterOp) =>
    op !== "blank" && op !== "not-blank";

  return (
    // While a column filter is open the scroll box keeps room for it, so a
    // grid with few rows never clips the dropdown's options / Apply.
    <div
      className="overflow-auto"
      style={{
        border: bordered ? "1px solid var(--slds-g-color-border-base-1)" : undefined,
        borderRadius: bordered ? "4px" : undefined,
        maxHeight,
        minHeight: activeFilterCol ? "420px" : undefined,
      }}
    >
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          minWidth: "800px",
        }}
      >
        <thead
          style={{ position: "sticky", top: 0, zIndex: 20 }}
        >
          <tr
            style={{
              backgroundColor:
                "var(--slds-g-color-background-alt)",
              borderBottom:
                "2px solid var(--slds-g-color-border-base-1)",
            }}
          >
            {selectable && (
              <th
                style={{
                  padding: "8px",
                  width: "40px",
                  textAlign: "center",
                }}
              >
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={() => onToggleAll()}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((col) => {
              const hasFilter = !!columnFilters[col.key];
              return (
                <th
                  key={col.key}
                  style={{
                    padding: "6px 8px",
                    minWidth: col.minWidth,
                    width: col.width,
                    position: "relative",
                  }}
                >
                  <div className="flex items-center gap-0.5">
                    {col.sortable ? (
                      <button
                        onClick={() => onSort(col.key)}
                        className={
                          "flex items-center gap-1 slds-text-3 font-semibold whitespace-nowrap" +
                          headCase
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color:
                            sortField === col.key
                              ? "#145F33"
                              : "var(--slds-g-color-text-weak)",
                          padding: 0,
                        }}
                      >
                        {col.label}
                        <SortIcon colKey={col.key} />
                      </button>
                    ) : (
                      <span
                        className={
                          "slds-text-3 font-semibold whitespace-nowrap" +
                          headCase
                        }
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {col.label}
                      </span>
                    )}
                    {col.filterable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openFilter(col.key, col.filterType!);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "0 2px",
                          color: hasFilter
                            ? "#145F33"
                            : "var(--slds-g-color-text-weak)",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                        }}
                        aria-label={`Filter ${col.label}`}
                        title={`Filter ${col.label}`}
                      >
                        <Filter
                          className="h-3 w-3"
                          style={{
                            fill: hasFilter
                              ? "#e8f4ed"
                              : "none",
                            stroke: hasFilter
                              ? "#145F33"
                              : "currentColor",
                          }}
                        />
                      </button>
                    )}
                  </div>

                  {/* ── Filter dropdown ── */}
                  {activeFilterCol === col.key && (
                    <div
                      ref={filterDropdownRef}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        zIndex: 50,
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        borderRadius: "6px",
                        boxShadow:
                          "0 4px 20px rgba(0,0,0,0.12)",
                        padding: "12px",
                        minWidth: "248px",
                      }}
                    >
                      <p
                        className="slds-text-3 font-semibold mb-2"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Filter: {col.label}
                      </p>

                      {col.filterType === "value-select" ? (
                        <>
                          {/* AC9: value selection — all values, specific values, blank values */}
                          <div className="flex gap-3 mb-2">
                            <button
                              onClick={() =>
                                setFilterDraft((d) => ({
                                  ...d,
                                  mode: "value-select",
                                  selectedValues: new Set(
                                    columnValues[col.key] ?? [],
                                  ),
                                }))
                              }
                              className="slds-text-3 underline"
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#145F33",
                                padding: 0,
                              }}
                            >
                              All
                            </button>
                            <button
                              onClick={() =>
                                setFilterDraft((d) => ({
                                  ...d,
                                  mode: "value-select",
                                  selectedValues: new Set(),
                                }))
                              }
                              className="slds-text-3 underline"
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#145F33",
                                padding: 0,
                              }}
                            >
                              None
                            </button>
                            <button
                              onClick={() =>
                                setFilterDraft((d) => ({
                                  ...d,
                                  mode: "value-select",
                                  selectedValues: new Set([
                                    BLANK_SENTINEL,
                                  ]),
                                }))
                              }
                              className="slds-text-3 underline"
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#145F33",
                                padding: 0,
                              }}
                            >
                              Blanks Only
                            </button>
                          </div>
                          <div
                            style={{
                              maxHeight: "180px",
                              overflowY: "auto",
                            }}
                            className="space-y-1.5 mb-3"
                          >
                            {(columnValues[col.key] ?? []).map(
                              (val) => (
                                <label
                                  key={val}
                                  className="flex items-center gap-2 slds-text-4 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      (
                                        filterDraft.selectedValues as
                                          | Set<string>
                                          | undefined
                                      )?.has(val) ?? false
                                    }
                                    onChange={() =>
                                      setFilterDraft((d) => {
                                        const s = new Set(
                                          d.selectedValues ??
                                            [],
                                        );
                                        s.has(val)
                                          ? s.delete(val)
                                          : s.add(val);
                                        return {
                                          ...d,
                                          mode: "value-select",
                                          selectedValues: s,
                                        };
                                      })
                                    }
                                    style={{
                                      accentColor: "#145F33",
                                      width: "13px",
                                      height: "13px",
                                    }}
                                  />
                                  <span
                                    style={{
                                      color:
                                        val === BLANK_SENTINEL
                                          ? "var(--slds-g-color-text-weak)"
                                          : "var(--slds-g-color-text-default)",
                                      fontStyle:
                                        val === BLANK_SENTINEL
                                          ? "italic"
                                          : "normal",
                                    }}
                                  >
                                    {val}
                                  </span>
                                </label>
                              ),
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* AC9: text filters including Custom Filter */}
                          <select
                            value={
                              (filterDraft as ColumnFilter)
                                .textOp ?? "contains"
                            }
                            onChange={(e) =>
                              setFilterDraft((d) => ({
                                ...d,
                                mode: "text",
                                textOp: e.target
                                  .value as TextFilterOp,
                              }))
                            }
                            className="w-full h-8 px-2 rounded slds-text-4 mb-2"
                            style={{
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {TEXT_FILTER_OPS.map((op) => (
                              <option
                                key={op.value}
                                value={op.value}
                              >
                                {op.label}
                              </option>
                            ))}
                          </select>
                          {needsTextInput(
                            (filterDraft as ColumnFilter)
                              .textOp ?? "contains",
                          ) && (
                            <input
                              type="text"
                              value={
                                (filterDraft as ColumnFilter)
                                  .textValue ?? ""
                              }
                              onChange={(e) =>
                                setFilterDraft((d) => ({
                                  ...d,
                                  mode: "text",
                                  textValue: e.target.value,
                                }))
                              }
                              placeholder="Enter value…"
                              autoFocus
                              className="w-full h-8 px-2 rounded slds-text-4 mb-2 outline-none"
                              style={{
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  applyFilter(col.key);
                                if (e.key === "Escape")
                                  setActiveFilterCol(null);
                              }}
                            />
                          )}
                        </>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => applyFilter(col.key)}
                          className="h-7 flex-1 rounded-full slds-text-3 font-semibold text-white"
                          style={{
                            backgroundColor: "#145F33",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => clearFilter(col.key)}
                          className="h-7 flex-1 rounded-full slds-text-3 font-semibold"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-neutral-95)",
                            color:
                              "var(--slds-g-color-text-default)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            cursor: "pointer",
                          }}
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                </th>
              );
            })}
            {renderActions && (
              <th
                style={{
                  padding: "6px 8px",
                  textAlign: "left",
                }}
              >
                <span
                  className={
                    "slds-text-3 font-semibold whitespace-nowrap" +
                    headCase
                  }
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Actions
                </span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={
                  columns.length +
                  (selectable ? 1 : 0) +
                  (renderActions ? 1 : 0)
                }
                className="slds-text-4"
                style={{
                  padding: "40px 16px",
                  textAlign: "center",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((entry, idx) => {
              const isSelected = selectedIds.has(entry.id);
              return (
                <tr
                  key={rowKey(entry)}
                  onClick={
                    selectable
                      ? () => onToggleRow(entry.id)
                      : undefined
                  }
                  onDoubleClick={
                    onOpen ? () => onOpen(entry) : undefined
                  }
                  style={{
                    backgroundColor: isSelected
                      ? "#F0FDF4"
                      : idx % 2 === 0
                        ? "var(--slds-g-color-background-base)"
                        : "var(--slds-g-color-background-alt)",
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                    cursor: selectable ? "pointer" : "default",
                  }}
                >
                  {selectable && (
                    <td
                      style={{
                        padding: "8px",
                        textAlign: "center",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleRow(entry.id)}
                        aria-label={`Select log entry ${entry.id}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => {
                    const val = String(
                      (entry as Record<string, unknown>)[
                        col.key
                      ] ?? "",
                    );
                    const custom = renderCell?.(entry, col);
                    if (custom !== undefined)
                      return (
                        <td
                          key={col.key}
                          className="slds-text-4 align-top"
                          style={{
                            padding: "6px 8px",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {custom}
                        </td>
                      );
                    return (
                      <td
                        key={col.key}
                        className="slds-text-4"
                        style={{
                          padding: "7px 8px",
                          color:
                            "var(--slds-g-color-text-default)",
                          whiteSpace: "nowrap",
                          maxWidth: "220px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={val}
                      >
                        {col.key === "logType" &&
                        "logType" in entry ? (
                          <span
                            className="inline-flex px-2 py-0.5 rounded-full slds-text-3 font-semibold whitespace-nowrap"
                            style={{
                              backgroundColor: logTypeBadge(
                                (entry as unknown as LogEntry)
                                  .logType,
                              ).bg,
                              color: logTypeBadge(
                                (entry as unknown as LogEntry)
                                  .logType,
                              ).color,
                              border: `1px solid ${logTypeBadge((entry as unknown as LogEntry).logType).border}`,
                            }}
                          >
                            {val}
                          </span>
                        ) : (
                          val
                        )}
                      </td>
                    );
                  })}
                  {renderActions && (
                    <td
                      style={{ padding: "4px 8px" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renderActions(entry)}
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Read-only Log Entry modal (AC11–AC16) ────────────────────────────────────

export function LogDetailDialog({
  entry,
  onClose,
  extraFields = [],
  children,
  onCloseAutoFocus,
}: {
  entry: LogEntry | null;
  onClose: () => void;
  /** Focus handling on close (central Logs restores focus to the opener). */
  onCloseAutoFocus?: (ev: Event) => void;
  /** Extra read-only fields (central Logs: Program, Youth). */
  extraFields?: { label: string; value: string }[];
  /** Extra read-only sections (central Logs: permission-gated audit). */
  children?: React.ReactNode;
}) {
  return (
    <Dialog
      open={!!entry}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        size="xl"
        className="sm:max-w-2xl"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DialogHeader>
          <DialogTitle>
            Log Entry
          </DialogTitle>
          {entry && (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className="inline-flex px-2.5 py-0.5 rounded-full slds-text-3 font-semibold"
                style={{
                  backgroundColor: logTypeBadge(entry.logType)
                    .bg,
                  color: logTypeBadge(entry.logType).color,
                  border: `1px solid ${logTypeBadge(entry.logType).border}`,
                }}
              >
                {entry.logType}
              </span>
              <span
                className="slds-text-3 italic"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Read-only
              </span>
            </div>
          )}
        </DialogHeader>
        <DialogDescription className="sr-only">
          Read-only view of a medication log entry.
        </DialogDescription>

        <DialogBody>
        {entry && (
          <div className="space-y-5">
            {/* AC12: Common fields */}
            <div>
              <p
                className="slds-text-3 font-semibold uppercase tracking-wide mb-3"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Common Fields
              </p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {COMMON_FIELD_KEYS.map((field) => (
                  <div
                    key={field}
                    className={
                      field === "attestationText"
                        ? "col-span-2 space-y-1"
                        : "space-y-1"
                    }
                  >
                    <p
                      className="slds-form-label"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {COMMON_FIELD_LABELS[field]}
                    </p>
                    <p
                      className="slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        fontStyle:
                          field === "attestationText"
                            ? "italic"
                            : "normal",
                      }}
                    >
                      {String(
                        (entry as Record<string, unknown>)[
                          field
                        ] ?? "",
                      ) || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {extraFields.length > 0 && (
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {extraFields.map((f) => (
                  <div key={f.label} className="space-y-1">
                    <p
                      className="slds-form-label"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {f.label}
                    </p>
                    <p
                      className="slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {f.value || "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            />

            {/* AC13/AC14/AC15: Type-specific fields */}
            <div>
              <p
                className="slds-text-3 font-semibold uppercase tracking-wide mb-3"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {entry.logType}
              </p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {(
                  TYPE_SPECIFIC_FIELDS[entry.logType] ??
                  Object.keys(entry.details)
                ).map((field) => (
                  <div key={field} className="space-y-1">
                    <p
                      className="slds-form-label"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {field}
                    </p>
                    <p
                      className="slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {entry.details[field] || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {entry && children}
        </DialogBody>

        {/* AC17: Cancel button */}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}