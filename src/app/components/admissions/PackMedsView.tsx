import React, { useEffect, useRef, useState } from "react";
import {
  Eye,
  Edit2,
  Plus,
  Check,
  AlertCircle,
  AlertTriangle,
  FileText,
  X,
  Package,
  Tag,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Filter,
  ClipboardList,
} from "@/app/lib/lucide-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { cn } from "../../lib/utils";
import { toast } from "sonner@2.0.3";
import {
  MedicationCodeSelector,
  type MedCode,
  MED_CODES,
  SET_PRIMARY_CODES,
  MED_CODE_MAP,
} from "./MedicationCodeSelector";
import { DateInput } from "../ui/date-input";
import {
  formatMdy,
  isoToMdy,
  mdyToIso,
  time12To24,
  time24To12,
} from "../../lib/dateFormat";
import {
  type PackMedRecord,
  nextPackMedId,
  packMedName,
  savePackMeds,
  usePackMeds,
} from "../../data/mockPackMedData";
import { PackMedsCreateDialog } from "./PackMedsCreateDialog";
import { getDemoUserName } from "../../lib/demoIdentity";

// Use SET_PRIMARY_CODES exported from MedicationCodeSelector (PAK/SCH first)
const SET_PRIMARY_CODES_LOCAL: MedCode[] = SET_PRIMARY_CODES;

const codeAuditFlag = (fullCodeValue: string): boolean => {
  const code = fullCodeValue.split(" -- ")[0];
  return MED_CODE_MAP[code]?.auditFlag ?? false;
};

// ── MedCodePicker adapter: wraps MedicationCodeSelector to match string-based API ──
function MedCodePicker({
  codes,
  value,
  onChange,
  allowNull,
  placeholder,
}: {
  codes: MedCode[];
  value: string;
  onChange: (v: string) => void;
  allowNull?: boolean;
  placeholder?: string;
}) {
  const selected =
    codes.find((c) => c.code === value.split(" -- ")[0]) ??
    null;
  return (
    <MedicationCodeSelector
      codes={codes}
      value={selected}
      onChange={(c: MedCode | null) =>
        onChange(c ? c.fullLabel : "")
      }
      maxHeight={272}
    />
  );
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface MedicationPack {
  id: number;
  packName: string;
  packStatus:
    "Available" | "Selected" | "Dispensed" | "Received";
  packType: string;
  expectedHandoffDate: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  status: "active" | "archived";
  medications: Array<{
    name: string;
    dose: string;
    frequency: string;
  }>;
  createdBy: string;
  createdDate: string;
}
type PackSortCol =
  | "packName"
  | "packStatus"
  | "packType"
  | "expectedHandoffDate"
  | "startDate"
  | "startTime"
  | "endDate"
  | "endTime";
type PackStatus =
  | "Available"
  | "Selected"
  | "Dispensed"
  | "Received"
  | "Reviewed";

interface SetPrimaryMedRow {
  id: number;
  selected: boolean;
  drugName: string;
  start: string;
  stop: string;
  packStatus: PackStatus;
  primaryCode: string;
  dateGroup?: string;
  dosePeriod?: string;
  outOfRange?: boolean;
}
interface SetPrimaryOtcRow {
  id: number;
  selected: boolean;
  drugName: string;
  dose: string;
  quantity: string;
  packStatus: PackStatus;
  primaryCode: string;
}
interface SetPrimaryLogEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  detail: string;
}
interface PrnMedication {
  medication: string;
  doses: string;
}
interface OtcMedication {
  medication: string;
  dose: string;
  quantity: string;
  doses: string;
  status: "Approved" | "Not Approved";
  availableDoses: string[];
}
interface PackPrepRow {
  id: number;
  selected: boolean;
  drugName: string;
  start: string;
  stop: string;
  status: string;
}
interface PackPrepLogEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  detail: string;
}
interface DispenseRow {
  id: number;
  selected: boolean;
  drugName: string;
  start: string;
  stop: string;
  status: string;
}
interface DispenseLogEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  detail: string;
}
interface CountRow {
  id: number;
  dosePeriod: string;
  medicationDose: string;
  countType: string;
  lastCount: string;
  currentCount: string;
  comments: string;
  selected: boolean;
}
interface HandOffRow {
  id: number;
  selected: boolean;
  drugName: string;
  start: string;
  stop: string;
  status: string;
  dateGroup?: string;
  dosePeriod?: string;
}
interface HandOffLogEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  detail: string;
}
interface ReviewMedRow {
  id: number;
  selected: boolean;
  medication: string;
  start: string;
  stop: string;
  status: "Received" | "Reviewed" | "Dispensed";
  primaryCode: string;
  dosePeriod: string;
  dateGroup: string;
}
interface ReviewPrnRow {
  id: number;
  selected: boolean;
  medication: string;
  start: string;
  stop: string;
  status: "Received" | "Reviewed" | "Dispensed";
  primaryCode: string;
}
interface ReviewOtcRow {
  id: number;
  selected: boolean;
  medication: string;
  dose: string;
  quantity: string;
  status: "Received" | "Reviewed" | "Dispensed";
  primaryCode: string;
}
interface ReviewLogEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  originalCode: string;
  primaryCode: string;
  comment: string;
  detail: string;
  medication: string;
}
interface DisposalMedRow {
  id: number;
  selected: boolean;
  medication: string;
  start: string;
  stop: string;
  status: "Reviewed" | "Pending" | "Disposed";
  primaryCode: string;
  dosePeriod: string;
  dateGroup: string;
  packComment: string;
  countType: "Units" | "Volume";
}
interface DisposalPrnRow {
  id: number;
  selected: boolean;
  medication: string;
  start: string;
  stop: string;
  status: "Reviewed" | "Pending" | "Disposed";
  primaryCode: string;
  dosePeriod: string;
  packComment: string;
  countType: "Units" | "Volume";
}
interface DisposalOtcRow {
  id: number;
  selected: boolean;
  medication: string;
  dose: string;
  quantity: string;
  status: "Reviewed" | "Pending" | "Disposed";
  primaryCode: string;
  dosePeriod: string;
  packComment: string;
  countType: "Units" | "Volume";
}
interface DisposalLogEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  detail: string;
}
interface MassDisposalModalRow {
  id: number;
  medicationDosePeriod: string;
  countType: "Units" | "Volume";
  amountDisposed: string;
  comments: string;
  removePending: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const DATE_COLS = new Set<PackSortCol>([
  "startDate",
  "endDate",
  "expectedHandoffDate",
]);

function parseDateMMDDYYYY(s: string): number {
  const [m, d, y] = s.split("/").map(Number);
  if (!m || !d || !y) return 0;
  return new Date(y, m - 1, d).getTime();
}
function sortPacks(
  packs: MedicationPack[],
  sort: { col: PackSortCol; dir: "asc" | "desc" },
) {
  return [...packs].sort((a, b) => {
    const av = a[sort.col] ?? "";
    const bv = b[sort.col] ?? "";
    let cmp: number;
    if (DATE_COLS.has(sort.col)) {
      cmp = parseDateMMDDYYYY(av) - parseDateMMDDYYYY(bv);
    } else {
      cmp = av < bv ? -1 : av > bv ? 1 : 0;
    }
    return sort.dir === "asc" ? cmp : -cmp;
  });
}
function filterPacks(packs: MedicationPack[], query: string) {
  if (!query.trim()) return packs;
  const q = query.toLowerCase();
  return packs.filter(
    (p) =>
      p.packName.toLowerCase().includes(q) ||
      p.packStatus.toLowerCase().includes(q) ||
      p.packType.toLowerCase().includes(q) ||
      p.startDate.includes(q) ||
      p.endDate.includes(q) ||
      p.expectedHandoffDate.includes(q),
  );
}
function toggleSort(
  current: { col: PackSortCol; dir: "asc" | "desc" },
  col: PackSortCol,
  setter: (v: {
    col: PackSortCol;
    dir: "asc" | "desc";
  }) => void,
) {
  setter(
    current.col === col
      ? { col, dir: current.dir === "asc" ? "desc" : "asc" }
      : { col, dir: "asc" },
  );
}

const defaultPrnMedications: PrnMedication[] = [
  { medication: "Ibuprofen 400mg", doses: "2" },
  { medication: "Albuterol Inhaler", doses: "1" },
  { medication: "Diphenhydramine (Benadryl) 25mg", doses: "1" },
];
const defaultOtcMedications: OtcMedication[] = [
  {
    medication: "Melatonin",
    dose: "",
    quantity: "",
    doses: "",
    status: "Approved",
    availableDoses: ["1mg", "2.5mg", "3mg", "5mg"],
  },
  {
    medication: "Acetaminophen (Tylenol)",
    dose: "",
    quantity: "",
    doses: "",
    status: "Approved",
    availableDoses: ["325mg", "500mg", "650mg"],
  },
  {
    medication: "Cetirizine (Zyrtec)",
    dose: "",
    quantity: "",
    doses: "",
    status: "Approved",
    availableDoses: ["5mg", "10mg"],
  },
  {
    medication: "Miralax",
    dose: "",
    quantity: "",
    doses: "",
    status: "Not Approved",
    availableDoses: ["17g"],
  },
  {
    medication: "Loratadine (Claritin)",
    dose: "",
    quantity: "",
    doses: "",
    status: "Approved",
    availableDoses: ["5mg", "10mg"],
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
/** A saved Pack Med record shown as this workflow's pack (MM/DD/YYYY dates,
 *  h:mm AM/PM times — the dialog's own formats). */
function toMedicationPack(r: PackMedRecord): MedicationPack {
  return {
    id: r.id,
    packName: r.packName,
    packStatus: r.packStatus ?? "Available",
    packType: r.packType ?? "Non-Scheduled",
    expectedHandoffDate: isoToMdy(
      r.expectedHandoffDate ?? r.endDate,
    ),
    startDate: isoToMdy(r.startDate),
    startTime: time24To12(r.startTime),
    endDate: isoToMdy(r.endDate),
    endTime: time24To12(r.endTime),
    status: r.archived ? "archived" : "active",
    medications: r.medications,
    createdBy: r.createdBy,
    createdDate: formatMdy(r.createdAt),
  };
}

/** Opens the workflow's dialog straight away (dialogOnly hosts): a new pack
 *  with a defaulted packing period, or an existing saved pack. */
export type PackMedLaunch =
  | {
      mode: "create";
      defaults?: {
        startDate?: string;
        startTime?: string;
        endDate?: string;
        endTime?: string;
      };
    }
  | { mode: "edit"; packMedId: number };

// youthId (20042): packs are that youth's saved Pack Med records (canonical
// store) and Save & Close writes there. Without it the view keeps its
// existing local sample packs. dialogOnly renders just the dialogs, for
// hosts (Pass form, Pack Med record) that open this same workflow.
export function PackMedsView({
  youthDisplayName = "Alex Martinez",
  youthId,
  contextLabel,
  dialogOnly = false,
  launch,
  onSaved,
  onClose,
}: {
  youthDisplayName?: string;
  youthId?: string;
  /** Shown in the dialog header, e.g. which youth and Pass it is for. */
  contextLabel?: string;
  dialogOnly?: boolean;
  launch?: PackMedLaunch;
  onSaved?: (packMedId: number) => void;
  onClose?: () => void;
} = {}) {
  // ── State ──
  const [packMedsSubTab, setPackMedsSubTab] = useState<
    "active" | "archive"
  >("active");
  const [selectedPackId, setSelectedPackId] = useState<
    number | null
  >(null);
  const [isCreatePackDialogOpen, setIsCreatePackDialogOpen] =
    useState(false);
  const [isViewPackDialogOpen, setIsViewPackDialogOpen] =
    useState(false);

  const [localPacks, setLocalPacks] = useState<
    MedicationPack[]
  >([
    {
      id: 6,
      packName: "Alex Martinez 06/22/2026-06/28/2026",
      packStatus: "Available",
      packType: "Non-Scheduled",
      expectedHandoffDate: "07/01/2026",
      startDate: "06/22/2026",
      startTime: "08:00 AM",
      endDate: "06/28/2026",
      endTime: "08:00 AM",
      status: "active",
      medications: [
        {
          name: "Abilify (Aripiprazole)",
          dose: "10mg",
          frequency: "Morning",
        },
      ],
      createdBy: "Sarah Johnson, MSW",
      createdDate: "06/22/2026",
    },
    {
      id: 4,
      packName: "Alex Martinez 06/15/2026-06/21/2026",
      packStatus: "Available",
      packType: "Scheduled II",
      expectedHandoffDate: "06/20/2026",
      startDate: "06/15/2026",
      startTime: "08:00 AM",
      endDate: "06/21/2026",
      endTime: "08:00 AM",
      status: "active",
      medications: [
        {
          name: "Lexapro (Escitalopram)",
          dose: "20mg",
          frequency: "Morning",
        },
      ],
      createdBy: "Sarah Johnson, MSW",
      createdDate: "06/15/2026",
    },
    {
      id: 3,
      packName: "Alex Martinez 06/08/2026-06/14/2026",
      packStatus: "Dispensed",
      packType: "Non-Scheduled",
      expectedHandoffDate: "06/15/2026",
      startDate: "06/08/2026",
      startTime: "09:00 AM",
      endDate: "06/14/2026",
      endTime: "09:00 AM",
      status: "active",
      medications: [
        {
          name: "Concerta (Methylphenidate)",
          dose: "36mg",
          frequency: "Morning",
        },
      ],
      createdBy: "Dr. Emily Martinez",
      createdDate: "06/08/2026",
    },
    {
      id: 2,
      packName: "Alex Martinez 06/05/2026-06/22/2026",
      packStatus: "Selected",
      packType: "Scheduled IV",
      expectedHandoffDate: "06/12/2026",
      startDate: "06/05/2026",
      startTime: "12:00 PM",
      endDate: "06/22/2026",
      endTime: "12:00 PM",
      status: "active",
      medications: [
        {
          name: "Abilify (Aripiprazole)",
          dose: "10mg",
          frequency: "Morning",
        },
        {
          name: "Melatonin",
          dose: "3mg",
          frequency: "Bedtime",
        },
      ],
      createdBy: "Dr. Emily Martinez",
      createdDate: "06/05/2026",
    },
    {
      id: 1,
      packName: "Alex Martinez 06/01/2026-06/07/2026",
      packStatus: "Available",
      packType: "Scheduled II",
      expectedHandoffDate: "06/10/2026",
      startDate: "06/01/2026",
      startTime: "08:00 AM",
      endDate: "06/07/2026",
      endTime: "08:00 PM",
      status: "active",
      medications: [
        {
          name: "Lexapro (Escitalopram)",
          dose: "20mg",
          frequency: "Morning",
        },
      ],
      createdBy: "Sarah Johnson, MSW",
      createdDate: "06/01/2026",
    },
    {
      id: 5,
      packName: "Alex Martinez 06/01/2026-06/07/2026",
      packStatus: "Received",
      packType: "Scheduled III",
      expectedHandoffDate: "06/08/2026",
      startDate: "06/01/2026",
      startTime: "10:00 AM",
      endDate: "06/07/2026",
      endTime: "10:00 AM",
      status: "archived",
      medications: [
        {
          name: "Concerta (Methylphenidate)",
          dose: "36mg",
          frequency: "Morning",
        },
        {
          name: "Abilify (Aripiprazole)",
          dose: "10mg",
          frequency: "Morning",
        },
      ],
      createdBy: "Dr. Emily Martinez",
      createdDate: "06/01/2026",
    },
  ]);
  // Canonical mode: this youth's saved Pack Med records, newest first.
  const storePacks = usePackMeds();
  const medicationPacks: MedicationPack[] = youthId
    ? storePacks
        .filter((r) => r.youthId === youthId)
        .sort((a, b) => b.startDate.localeCompare(a.startDate))
        .map(toMedicationPack)
    : localPacks;

  const [activePackSort, setActivePackSort] = useState<{
    col: PackSortCol;
    dir: "asc" | "desc";
  }>({ col: "startDate", dir: "desc" });
  const [archivePackSort, setArchivePackSort] = useState<{
    col: PackSortCol;
    dir: "asc" | "desc";
  }>({ col: "startDate", dir: "desc" });
  const [activePackFilter, setActivePackFilter] = useState("");
  const [archivePackFilter, setArchivePackFilter] =
    useState("");

  // Start Date funnel
  const [startDateFilter, setStartDateFilter] =
    useState<string>("all");
  const [startDateFilterCustom, setStartDateFilterCustom] =
    useState<string>("");
  const [isStartDateFilterOpen, setIsStartDateFilterOpen] =
    useState(false);
  const [dateFilterModalType, setDateFilterModalType] =
    useState<"relative" | "specific">("relative");
  const [dateFilterDraftValue, setDateFilterDraftValue] =
    useState<string>("all");
  const startDateFunnelRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!isStartDateFilterOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        startDateFunnelRef.current &&
        !startDateFunnelRef.current.contains(e.target as Node)
      )
        setIsStartDateFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () =>
      document.removeEventListener("mousedown", handler);
  }, [isStartDateFilterOpen]);

  // End Date funnel
  const [endDateFilter, setEndDateFilter] =
    useState<string>("all");
  const [endDateFilterCustom, setEndDateFilterCustom] =
    useState<string>("");
  const [isEndDateFilterOpen, setIsEndDateFilterOpen] =
    useState(false);
  const [endDateFilterModalType, setEndDateFilterModalType] =
    useState<"relative" | "specific">("relative");
  const [endDateFilterDraftValue, setEndDateFilterDraftValue] =
    useState<string>("all");
  const endDateFunnelRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!isEndDateFilterOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        endDateFunnelRef.current &&
        !endDateFunnelRef.current.contains(e.target as Node)
      )
        setIsEndDateFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () =>
      document.removeEventListener("mousedown", handler);
  }, [isEndDateFilterOpen]);

  // Create pack form
  const [newPackForm, setNewPackForm] = useState({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    expectedHandoffDate: "",
  });
  const [createPackActiveTab, setCreatePackActiveTab] =
    useState<
      | "doses"
      | "setPrimary"
      | "packingPrep"
      | "dispense"
      | "count"
      | "handOff"
      | "review"
      | "disposal"
    >("doses");
  const [dateRangeApplied, setDateRangeApplied] =
    useState(false);
  const [appliedDateRange, setAppliedDateRange] = useState({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });
  const [isDateChangeWarningOpen, setIsDateChangeWarningOpen] =
    useState(false);
  const [pendingDateChange, setPendingDateChange] =
    useState<Partial<typeof newPackForm> | null>(null);
  const [isModifyPrnDialogOpen, setIsModifyPrnDialogOpen] =
    useState(false);
  const [
    isModifyAllPrnDialogOpen,
    setIsModifyAllPrnDialogOpen,
  ] = useState(false);
  const [selectedPrnIndex, setSelectedPrnIndex] = useState<
    number | null
  >(null);
  const [prnMedications, setPrnMedications] = useState<
    PrnMedication[]
  >([]);
  const [otcMedications, setOtcMedications] = useState<
    OtcMedication[]
  >([]);

  // Set Primary state
  const [isSetPrimaryModalOpen, setIsSetPrimaryModalOpen] =
    useState(false);
  const [setPrimarySelectedCode, setSetPrimarySelectedCode] =
    useState("");
  const [setPrimaryPackComment, setSetPrimaryPackComment] =
    useState("");
  const [setPrimaryShowLog, setSetPrimaryShowLog] =
    useState(false);
  const [setPrimaryMedRows, setSetPrimaryMedRows] = useState<
    SetPrimaryMedRow[]
  >([
    {
      id: 1,
      selected: false,
      drugName: "Abilify (Aripiprazole) 10mg",
      start: "06/22/2026",
      stop: "06/22/2026",
      packStatus: "Available",
      primaryCode: "",
      dateGroup: "06/22/2026",
      dosePeriod: "Morning",
    },
    {
      id: 2,
      selected: false,
      drugName: "Lexapro (Escitalopram) 20mg",
      start: "06/22/2026",
      stop: "06/22/2026",
      packStatus: "Available",
      primaryCode: "",
      dateGroup: "06/22/2026",
      dosePeriod: "Morning",
    },
    {
      id: 3,
      selected: false,
      drugName: "Concerta (Methylphenidate) 36mg",
      start: "06/22/2026",
      stop: "06/22/2026",
      packStatus: "Dispensed",
      primaryCode: "P-001",
      dateGroup: "06/22/2026",
      dosePeriod: "Morning",
    },
    {
      id: 4,
      selected: false,
      drugName: "Abilify (Aripiprazole) 10mg",
      start: "06/22/2026",
      stop: "06/22/2026",
      packStatus: "Available",
      primaryCode: "",
      dateGroup: "06/22/2026",
      dosePeriod: "Evening",
    },
    {
      id: 5,
      selected: false,
      drugName: "Lexapro (Escitalopram) 20mg",
      start: "06/23/2026",
      stop: "06/23/2026",
      packStatus: "Available",
      primaryCode: "",
      dateGroup: "06/23/2026",
      dosePeriod: "Morning",
    },
    {
      id: 6,
      selected: false,
      drugName: "Concerta (Methylphenidate) 36mg",
      start: "06/23/2026",
      stop: "06/23/2026",
      packStatus: "Selected",
      primaryCode: "P-002",
      dateGroup: "06/23/2026",
      dosePeriod: "Morning",
    },
    {
      id: 7,
      selected: false,
      drugName: "Abilify (Aripiprazole) 10mg",
      start: "06/21/2026",
      stop: "06/21/2026",
      packStatus: "Available",
      primaryCode: "",
      dateGroup: "06/21/2026",
      dosePeriod: "Evening",
      outOfRange: true,
    },
  ]);
  const [setPrimaryPrnRows, setSetPrimaryPrnRows] = useState<
    SetPrimaryMedRow[]
  >([
    {
      id: 10,
      selected: false,
      drugName: "Ibuprofen 400mg",
      start: "ALL DAY",
      stop: "ALL DAY",
      packStatus: "Available",
      primaryCode: "",
    },
    {
      id: 11,
      selected: false,
      drugName: "Ibuprofen 400mg",
      start: "ALL DAY",
      stop: "ALL DAY",
      packStatus: "Available",
      primaryCode: "",
    },
    {
      id: 12,
      selected: false,
      drugName: "Albuterol Inhaler",
      start: "ALL DAY",
      stop: "ALL DAY",
      packStatus: "Dispensed",
      primaryCode: "P-001",
    },
  ]);
  const [setPrimaryOtcRowsData, setSetPrimaryOtcRowsData] =
    useState<SetPrimaryOtcRow[]>([
      {
        id: 20,
        selected: false,
        drugName: "Melatonin",
        dose: "3mg",
        quantity: "7",
        packStatus: "Available",
        primaryCode: "",
      },
      {
        id: 21,
        selected: false,
        drugName: "Acetaminophen (Tylenol)",
        dose: "500mg",
        quantity: "14",
        packStatus: "Selected",
        primaryCode: "P-003",
      },
    ]);
  const [setPrimaryLogEntries, setSetPrimaryLogEntries] =
    useState<SetPrimaryLogEntry[]>([
      {
        id: 1,
        timestamp: "06/22/2026 09:15 AM",
        user: "Sarah Johnson, MSW",
        action: "Code Assigned",
        detail:
          "PAK -- Packed - Pass/Outing assigned to Concerta (Methylphenidate) 36mg",
      },
      {
        id: 2,
        timestamp: "06/22/2026 09:16 AM",
        user: "Sarah Johnson, MSW",
        action: "Code Assigned",
        detail:
          "PAK -- Packed - Pass/Outing assigned to Albuterol Inhaler (PRN)",
      },
    ]);
  const [setPrimaryCommentError, setSetPrimaryCommentError] =
    useState(false);

  // Packing Prep state
  const [packingPrepInnerTab, setPackingPrepInnerTab] =
    useState<"checklist" | "labels" | "log">("checklist");
  const [isLabelStyleModalOpen, setIsLabelStyleModalOpen] =
    useState(false);
  const packPrepCarryStatuses: PackStatus[] = [
    "Selected",
    "Dispensed",
    "Received",
    "Reviewed",
  ];
  const [packPrepMedSelected, setPackPrepMedSelected] =
    useState<Record<number, boolean>>({});
  const [packPrepPrnSelected, setPackPrepPrnSelected] =
    useState<Record<number, boolean>>({});
  const [packPrepOtcSelected, setPackPrepOtcSelected] =
    useState<Record<number, boolean>>({});
  const packPrepMedRows: PackPrepRow[] = setPrimaryMedRows
    .filter((r) => packPrepCarryStatuses.includes(r.packStatus))
    .map((r) => ({
      id: r.id,
      selected: packPrepMedSelected[r.id] ?? false,
      drugName: r.drugName,
      start: r.start,
      stop: r.stop,
      status: r.packStatus,
    }));
  const setPackPrepMedRows = (
    updater:
      PackPrepRow[] | ((prev: PackPrepRow[]) => PackPrepRow[]),
  ) => {
    const next =
      typeof updater === "function"
        ? updater(packPrepMedRows)
        : updater;
    setPackPrepMedSelected(
      Object.fromEntries(next.map((r) => [r.id, r.selected])),
    );
  };
  const packPrepPrnRows: PackPrepRow[] = setPrimaryPrnRows
    .filter((r) => packPrepCarryStatuses.includes(r.packStatus))
    .map((r) => ({
      id: r.id,
      selected: packPrepPrnSelected[r.id] ?? false,
      drugName: r.drugName,
      start: r.start,
      stop: r.stop,
      status: r.packStatus,
    }));
  const setPackPrepPrnRows = (
    updater:
      PackPrepRow[] | ((prev: PackPrepRow[]) => PackPrepRow[]),
  ) => {
    const next =
      typeof updater === "function"
        ? updater(packPrepPrnRows)
        : updater;
    setPackPrepPrnSelected(
      Object.fromEntries(next.map((r) => [r.id, r.selected])),
    );
  };
  const packPrepOtcRows: PackPrepRow[] = setPrimaryOtcRowsData
    .filter((r) => packPrepCarryStatuses.includes(r.packStatus))
    .map((r) => ({
      id: r.id,
      selected: packPrepOtcSelected[r.id] ?? false,
      drugName: r.drugName,
      start: r.dose,
      stop: r.quantity,
      status: r.packStatus,
    }));
  const setPackPrepOtcRows = (
    updater:
      PackPrepRow[] | ((prev: PackPrepRow[]) => PackPrepRow[]),
  ) => {
    const next =
      typeof updater === "function"
        ? updater(packPrepOtcRows)
        : updater;
    setPackPrepOtcSelected(
      Object.fromEntries(next.map((r) => [r.id, r.selected])),
    );
  };
  const [packPrepLogEntries] = useState<PackPrepLogEntry[]>([
    {
      id: 1,
      timestamp: "02/10/2026 10:30 AM",
      user: "Sarah Johnson, MSW",
      action: "Prepared",
      detail:
        "Abilify (Aripiprazole) 10mg prepared for packing",
    },
    {
      id: 2,
      timestamp: "02/10/2026 10:32 AM",
      user: "Sarah Johnson, MSW",
      action: "Label Printed",
      detail: "Label generated for Lexapro (Escitalopram) 20mg",
    },
  ]);

  // Dispense state
  const [dispenseInnerTab, setDispenseInnerTab] = useState<
    "staffDispensed" | "reprintLabels" | "log"
  >("staffDispensed");
  const [dispenseMedRows, setDispenseMedRows] = useState<
    DispenseRow[]
  >([
    {
      id: 1,
      selected: false,
      drugName: "Abilify (Aripiprazole) 10mg",
      start: "02/10/2026",
      stop: "02/14/2026",
      status: "Active",
    },
    {
      id: 2,
      selected: false,
      drugName: "Lexapro (Escitalopram) 20mg",
      start: "02/10/2026",
      stop: "02/14/2026",
      status: "Active",
    },
    {
      id: 3,
      selected: false,
      drugName: "Concerta (Methylphenidate) 36mg",
      start: "02/03/2026",
      stop: "02/07/2026",
      status: "Active",
    },
  ]);
  const [dispensePrnRows, setDispensePrnRows] = useState<
    DispenseRow[]
  >([
    {
      id: 10,
      selected: false,
      drugName: "Ibuprofen 400mg",
      start: "02/10/2026",
      stop: "02/14/2026",
      status: "Active",
    },
  ]);
  const [dispenseOtcRows, setDispenseOtcRows] = useState<
    DispenseRow[]
  >([
    {
      id: 20,
      selected: false,
      drugName: "Melatonin 3mg",
      start: "02/10/2026",
      stop: "02/14/2026",
      status: "Active",
    },
  ]);
  const [dispenseLogEntries] = useState<DispenseLogEntry[]>([
    {
      id: 1,
      timestamp: "02/11/2026 08:15 AM",
      user: "Sarah Johnson, MSW",
      action: "Dispensed",
      detail: "Abilify (Aripiprazole) 10mg dispensed to youth",
    },
    {
      id: 2,
      timestamp: "02/11/2026 08:16 AM",
      user: "Sarah Johnson, MSW",
      action: "Dispensed",
      detail: "Lexapro (Escitalopram) 20mg dispensed to youth",
    },
  ]);

  // Count state
  const [countRows, setCountRows] = useState<CountRow[]>([
    {
      id: 1,
      dosePeriod: "Morning",
      medicationDose: "Abilify (Aripiprazole) 10mg",
      countType: "Units",
      lastCount: "5.00",
      currentCount: "",
      comments: "",
      selected: false,
    },
    {
      id: 2,
      dosePeriod: "Morning",
      medicationDose: "Lexapro (Escitalopram) 20mg",
      countType: "Units",
      lastCount: "7.00",
      currentCount: "",
      comments: "",
      selected: false,
    },
    {
      id: 3,
      dosePeriod: "Afternoon",
      medicationDose: "Acetaminophen and Codeine 34",
      countType: "Units",
      lastCount: "3.00",
      currentCount: "",
      comments: "",
      selected: false,
    },
    {
      id: 4,
      dosePeriod: "Evening",
      medicationDose: "Melatonin 3mg",
      countType: "Units",
      lastCount: "10.00",
      currentCount: "",
      comments: "",
      selected: false,
    },
  ]);
  const [countRowsOriginal, setCountRowsOriginal] = useState<
    Record<number, { currentCount: string; comments: string }>
  >({
    1: { currentCount: "", comments: "" },
    2: { currentCount: "", comments: "" },
    3: { currentCount: "", comments: "" },
    4: { currentCount: "", comments: "" },
  });
  const hasRowChanges = (
    rowId: number,
    currentCount: string,
    comments: string,
  ) => {
    const original = countRowsOriginal[rowId];
    if (!original) return false;
    return (
      original.currentCount !== currentCount ||
      original.comments !== comments
    );
  };

  // Hand Off state
  const [handOffInnerTab, setHandOffInnerTab] = useState<
    "youthReceived" | "log"
  >("youthReceived");
  const [handOffMedRows, setHandOffMedRows] = useState<
    HandOffRow[]
  >([
    {
      id: 1,
      selected: false,
      drugName: "Abilify (Aripiprazole) 10mg",
      start: "02/10/2026",
      stop: "02/14/2026",
      status: "Dispensed",
      dateGroup: "02/10/2026",
      dosePeriod: "Morning",
    },
    {
      id: 2,
      selected: false,
      drugName: "Lexapro (Escitalopram) 20mg",
      start: "02/10/2026",
      stop: "02/14/2026",
      status: "Dispensed",
      dateGroup: "02/10/2026",
      dosePeriod: "Morning",
    },
    {
      id: 5,
      selected: false,
      drugName: "Prozac (Fluoxetine) 20mg",
      start: "02/10/2026",
      stop: "02/14/2026",
      status: "Selected",
      dateGroup: "02/10/2026",
      dosePeriod: "Evening",
    },
    {
      id: 3,
      selected: false,
      drugName: "Concerta (Methylphenidate) 36mg",
      start: "02/11/2026",
      stop: "02/14/2026",
      status: "Received",
      dateGroup: "02/11/2026",
      dosePeriod: "Afternoon",
    },
    {
      id: 4,
      selected: false,
      drugName: "Zoloft (Sertraline) 50mg",
      start: "02/12/2026",
      stop: "02/14/2026",
      status: "Reviewed",
      dateGroup: "02/12/2026",
      dosePeriod: "Morning",
    },
  ]);
  const [handOffPrnRows, setHandOffPrnRows] = useState<
    HandOffRow[]
  >([
    {
      id: 10,
      selected: false,
      drugName: "Ibuprofen 400mg",
      start: "02/10/2026",
      stop: "02/14/2026",
      status: "Dispensed",
    },
    {
      id: 12,
      selected: false,
      drugName: "Diphenhydramine (Benadryl) 25mg",
      start: "02/10/2026",
      stop: "02/14/2026",
      status: "Selected",
    },
    {
      id: 11,
      selected: false,
      drugName: "Albuterol Inhaler",
      start: "02/10/2026",
      stop: "02/14/2026",
      status: "Received",
    },
  ]);
  const [handOffOtcRows, setHandOffOtcRows] = useState<
    HandOffRow[]
  >([
    {
      id: 20,
      selected: false,
      drugName: "Melatonin 3mg",
      start: "02/10/2026",
      stop: "02/14/2026",
      status: "Dispensed",
    },
    {
      id: 21,
      selected: false,
      drugName: "Acetaminophen (Tylenol) 500mg",
      start: "02/10/2026",
      stop: "02/14/2026",
      status: "Dispensed",
    },
    {
      id: 22,
      selected: false,
      drugName: "Cetirizine (Zyrtec) 10mg",
      start: "02/10/2026",
      stop: "02/14/2026",
      status: "Selected",
    },
  ]);
  const [handOffLogEntries] = useState<HandOffLogEntry[]>([
    {
      id: 1,
      timestamp: "02/12/2026 03:45 PM",
      user: "Mike Torres, RN",
      action: "Handed Off",
      detail:
        "Pack handed off to youth — Abilify (Aripiprazole) 10mg confirmed received",
    },
  ]);
  const [
    isYouthReceivedModalOpen,
    setIsYouthReceivedModalOpen,
  ] = useState(false);
  const [youthReceivedToggle, setYouthReceivedToggle] =
    useState<"youthReceived" | "otherRecipient">(
      "youthReceived",
    );
  const [recipientType, setRecipientType] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [packComment, setPackComment] = useState("");

  // Review state
  const [reviewInnerTab, setReviewInnerTab] =
    useState<any>("review");
  const [reviewMedRows, setReviewMedRows] = useState<
    ReviewMedRow[]
  >([
    {
      id: 1,
      selected: false,
      medication: "Abilify (Aripiprazole) 10mg",
      start: "01/15/2026",
      stop: "06/30/2026",
      status: "Received",
      primaryCode: "",
      dosePeriod: "AM",
      dateGroup: "06/09/2026",
    },
    {
      id: 2,
      selected: false,
      medication: "Lexapro (Escitalopram) 20mg",
      start: "02/01/2026",
      stop: "07/31/2026",
      status: "Received",
      primaryCode: "",
      dosePeriod: "AM",
      dateGroup: "06/09/2026",
    },
    {
      id: 3,
      selected: false,
      medication: "Clonidine 0.1mg",
      start: "03/10/2026",
      stop: "06/30/2026",
      status: "Reviewed",
      primaryCode: "MPM -- Missed Packed Med",
      dosePeriod: "PM",
      dateGroup: "06/09/2026",
    },
    {
      id: 4,
      selected: false,
      medication: "Risperdal (Risperidone) 1mg",
      start: "01/15/2026",
      stop: "06/30/2026",
      status: "Received",
      primaryCode: "",
      dosePeriod: "AM",
      dateGroup: "06/10/2026",
    },
  ]);
  const [reviewPrnRows, setReviewPrnRows] = useState<
    ReviewPrnRow[]
  >([
    {
      id: 10,
      selected: false,
      medication: "Ibuprofen 400mg",
      start: "01/01/2026",
      stop: "12/31/2026",
      status: "Received",
      primaryCode: "",
    },
    {
      id: 11,
      selected: false,
      medication: "Melatonin 3mg",
      start: "03/01/2026",
      stop: "12/31/2026",
      status: "Reviewed",
      primaryCode: "MPM -- Missed Packed Med",
    },
  ]);
  const [reviewOtcRows, setReviewOtcRows] = useState<
    ReviewOtcRow[]
  >([
    {
      id: 20,
      selected: false,
      medication: "Vitamin D3 1000IU",
      dose: "1000IU",
      quantity: "30",
      status: "Received",
      primaryCode: "",
    },
    {
      id: 21,
      selected: false,
      medication: "Zinc 25mg",
      dose: "25mg",
      quantity: "60",
      status: "Reviewed",
      primaryCode: "MPM -- Missed Packed Med",
    },
  ]);
  const [reviewLogEntries, setReviewLogEntries] = useState<
    ReviewLogEntry[]
  >([
    {
      id: 1,
      timestamp: "06/09/2026 04:10 PM",
      user: "Sarah Johnson, MSW",
      action: "Review",
      originalCode: "",
      primaryCode: "MPM -- Missed Packed Med",
      comment: "Youth refused evening dose.",
      detail:
        "Pack Status set to Reviewed — Clonidine 0.1mg (PM)",
      medication: "Clonidine 0.1mg",
    },
  ]);
  const [
    isSetReviewStatusModalOpen,
    setIsSetReviewStatusModalOpen,
  ] = useState(false);
  const [reviewModalPrimaryCode, setReviewModalPrimaryCode] =
    useState("MPM -- Missed Packed Med");
  const [reviewModalComment, setReviewModalComment] =
    useState("");
  const [reviewModalCommentError, setReviewModalCommentError] =
    useState(false);
  const [isReviewMedHistoryOpen, setIsReviewMedHistoryOpen] =
    useState(false);
  const [reviewHistoryMedication, setReviewHistoryMedication] =
    useState("");

  // Disposal state
  const [disposalMedRows, setDisposalMedRows] = useState<
    DisposalMedRow[]
  >([
    {
      id: 1,
      selected: false,
      medication: "Abilify (Aripiprazole) 10mg",
      start: "01/15/2026",
      stop: "06/30/2026",
      status: "Reviewed",
      primaryCode: "SC-4521",
      dosePeriod: "AM",
      dateGroup: "06/09/2026",
      packComment: "Administered without issue.",
      countType: "Units",
    },
    {
      id: 2,
      selected: false,
      medication: "Lexapro (Escitalopram) 20mg",
      start: "02/01/2026",
      stop: "07/31/2026",
      status: "Reviewed",
      primaryCode: "SC-4521",
      dosePeriod: "AM",
      dateGroup: "06/09/2026",
      packComment: "",
      countType: "Units",
    },
    {
      id: 3,
      selected: false,
      medication: "Clonidine 0.1mg",
      start: "03/10/2026",
      stop: "06/30/2026",
      status: "Pending",
      primaryCode: "",
      dosePeriod: "PM",
      dateGroup: "06/09/2026",
      packComment: "",
      countType: "Units",
    },
    {
      id: 4,
      selected: false,
      medication: "Risperdal (Risperidone) 1mg",
      start: "01/15/2026",
      stop: "06/30/2026",
      status: "Reviewed",
      primaryCode: "SC-4521",
      dosePeriod: "AM",
      dateGroup: "06/10/2026",
      packComment: "Youth cooperative.",
      countType: "Units",
    },
  ]);
  const [disposalPrnRows, setDisposalPrnRows] = useState<
    DisposalPrnRow[]
  >([
    {
      id: 1,
      selected: false,
      medication: "Ibuprofen 400mg",
      start: "01/01/2026",
      stop: "12/31/2026",
      status: "Reviewed",
      primaryCode: "SC-4521",
      dosePeriod: "PRN",
      packComment: "",
      countType: "Units",
    },
    {
      id: 2,
      selected: false,
      medication: "Melatonin 3mg",
      start: "03/01/2026",
      stop: "12/31/2026",
      status: "Pending",
      primaryCode: "",
      dosePeriod: "PRN",
      packComment: "",
      countType: "Units",
    },
  ]);
  const [disposalOtcRows, setDisposalOtcRows] = useState<
    DisposalOtcRow[]
  >([
    {
      id: 1,
      selected: false,
      medication: "Vitamin D3 1000IU",
      dose: "1000IU",
      quantity: "30",
      status: "Reviewed",
      primaryCode: "SC-4521",
      dosePeriod: "AM",
      packComment: "",
      countType: "Units",
    },
    {
      id: 2,
      selected: false,
      medication: "Zinc 25mg",
      dose: "25mg",
      quantity: "60",
      status: "Pending",
      primaryCode: "",
      dosePeriod: "AM",
      packComment: "",
      countType: "Units",
    },
  ]);
  const [disposalLogEntries, setDisposalLogEntries] = useState<
    DisposalLogEntry[]
  >([]);
  const [disposalInnerTab, setDisposalInnerTab] = useState<
    "dispose" | "log"
  >("dispose");
  const [isMassDisposalModalOpen, setIsMassDisposalModalOpen] =
    useState(false);
  const [massDisposalModalRows, setMassDisposalModalRows] =
    useState<MassDisposalModalRow[]>([]);
  const [massDisposalDate, setMassDisposalDate] = useState("");
  const [
    massDisposalCancelConfirmOpen,
    setMassDisposalCancelConfirmOpen,
  ] = useState(false);

  // ── handleCreatePack / handleArchivePack ──────────────────────────────────
  const handleCreatePack = () => {
    if (
      !newPackForm.startDate ||
      !newPackForm.startTime ||
      !newPackForm.endDate ||
      !newPackForm.endTime
    ) {
      toast.error(
        "Start Date, Start Time, End Date, and End Time are required",
      );
      return;
    }
    const autoPackName = `${youthDisplayName} ${newPackForm.startDate}-${newPackForm.endDate}`;
    if (youthId) {
      // Canonical mode: write the saved Pack Med record (ISO dates, HH:MM).
      const startDate = mdyToIso(newPackForm.startDate);
      const endDate = mdyToIso(newPackForm.endDate);
      const ISO = /^\d{4}-\d{2}-\d{2}$/;
      if (!ISO.test(startDate) || !ISO.test(endDate)) {
        toast.error("Start Date and End Date must be MM/DD/YYYY");
        return;
      }
      const period = {
        packName: packMedName(youthDisplayName, startDate, endDate),
        startDate,
        startTime: time12To24(newPackForm.startTime),
        endDate,
        endTime: time12To24(newPackForm.endTime),
        expectedHandoffDate: mdyToIso(
          newPackForm.expectedHandoffDate || newPackForm.endDate,
        ),
      };
      const existing = selectedPackId
        ? storePacks.find((r) => r.id === selectedPackId)
        : undefined;
      const savedId = existing ? existing.id : nextPackMedId();
      savePackMeds([
        existing
          ? { ...existing, ...period }
          : {
              id: savedId,
              youthId,
              ...period,
              medications: [],
              status: "Packed",
              packStatus: "Available",
              packType: "Non-Scheduled",
              passId: null,
              createdBy: getDemoUserName(),
              createdAt: new Date().toISOString(),
            },
      ]);
      toast.success(
        existing
          ? "Medication pack updated successfully"
          : "Medication pack created successfully",
      );
      onSaved?.(savedId);
    } else if (selectedPackId) {
      setLocalPacks(
        localPacks.map((p) =>
          p.id === selectedPackId
            ? {
                ...p,
                packName: autoPackName,
                expectedHandoffDate:
                  newPackForm.expectedHandoffDate ||
                  newPackForm.endDate,
                startDate: newPackForm.startDate,
                startTime: newPackForm.startTime,
                endDate: newPackForm.endDate,
                endTime: newPackForm.endTime,
              }
            : p,
        ),
      );
      toast.success("Medication pack updated successfully");
    } else {
      const today = formatMdy(new Date());
      const newId =
        Math.max(...localPacks.map((p) => p.id), 0) + 1;
      setLocalPacks([
        {
          id: newId,
          packName: autoPackName,
          packStatus: "Available",
          packType: "Non-Scheduled",
          expectedHandoffDate:
            newPackForm.expectedHandoffDate ||
            newPackForm.endDate,
          startDate: newPackForm.startDate,
          startTime: newPackForm.startTime,
          endDate: newPackForm.endDate,
          endTime: newPackForm.endTime,
          status: "active",
          medications: [],
          createdBy: getDemoUserName(),
          createdDate: today,
        },
        ...localPacks,
      ]);
      toast.success("Medication pack created successfully");
    }
    setNewPackForm({
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      expectedHandoffDate: "",
    });
    setIsCreatePackDialogOpen(false);
    setCreatePackActiveTab("doses");
    setDateRangeApplied(false);
    setAppliedDateRange({
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    });
    setPrnMedications([]);
    setOtcMedications([]);
    setSelectedPackId(null);
    setDispenseInnerTab("staffDispensed");
    setHandOffInnerTab("youthReceived");
    setReviewInnerTab("review");
  };

  const handleArchivePack = () => {
    if (!selectedPackId) {
      toast.error("Please select a pack first");
      return;
    }
    if (youthId) {
      const rec = storePacks.find((r) => r.id === selectedPackId);
      if (rec) savePackMeds([{ ...rec, archived: true }]);
    } else {
      setLocalPacks(
        localPacks.map((p) =>
          p.id === selectedPackId
            ? { ...p, status: "archived" as const }
            : p,
        ),
      );
    }
    setSelectedPackId(null);
    toast.success("Pack archived successfully");
  };

  // ── Derived render values ──────────────────────────────────────────────────
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const isEffectivelyArchived = (p: MedicationPack) => {
    if (p.status === "archived") return true;
    if (!p.endDate) return false;
    const [m, d, y] = p.endDate.split("/").map(Number);
    const end = new Date(y, m - 1, d);
    end.setHours(0, 0, 0, 0);
    return end < todayDate;
  };
  const isActive = packMedsSubTab === "active";
  const rawPacks = medicationPacks.filter((p) =>
    isActive
      ? !isEffectivelyArchived(p)
      : isEffectivelyArchived(p),
  );
  const sort = isActive ? activePackSort : archivePackSort;
  const setSort = isActive
    ? setActivePackSort
    : setArchivePackSort;
  const filter = isActive
    ? activePackFilter
    : archivePackFilter;
  const setFilter = isActive
    ? setActivePackFilter
    : setArchivePackFilter;
  const parseD = (s: string) => {
    const [m, d, y] = s.split("/").map(Number);
    return new Date(y, m - 1, d);
  };
  const selectedPack =
    medicationPacks.find((p) => p.id === selectedPackId) ||
    null;

  function applyDateFilter(
    packs: MedicationPack[],
    dateKey: "startDate" | "endDate",
    filterVal: string,
    customVal: string,
  ): MedicationPack[] {
    if (filterVal === "all") return packs;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return packs.filter((p) => {
      const raw = p[dateKey] as string | undefined;
      if (!raw) return false;
      const pd = parseD(raw);
      pd.setHours(0, 0, 0, 0);
      if (filterVal === "today")
        return pd.getTime() === now.getTime();
      if (filterVal === "yesterday") {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        return pd.getTime() === y.getTime();
      }
      if (filterVal === "this-week") {
        const ws = new Date(now);
        ws.setDate(now.getDate() - now.getDay());
        return pd >= ws && pd <= now;
      }
      if (filterVal === "last-week") {
        const lws = new Date(now);
        lws.setDate(now.getDate() - now.getDay() - 7);
        const lwe = new Date(lws);
        lwe.setDate(lws.getDate() + 6);
        return pd >= lws && pd <= lwe;
      }
      if (filterVal === "this-month")
        return (
          pd.getMonth() === now.getMonth() &&
          pd.getFullYear() === now.getFullYear()
        );
      if (filterVal === "last-month") {
        const lm = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1,
        );
        return (
          pd.getMonth() === lm.getMonth() &&
          pd.getFullYear() === lm.getFullYear()
        );
      }
      if (filterVal === "this-year")
        return pd.getFullYear() === now.getFullYear();
      if (filterVal === "last-year")
        return pd.getFullYear() === now.getFullYear() - 1;
      if (filterVal === "custom" && customVal) {
        try {
          return pd.getTime() === parseD(customVal).getTime();
        } catch {
          return true;
        }
      }
      return true;
    });
  }

  const visiblePacks = sortPacks(
    applyDateFilter(
      applyDateFilter(
        filterPacks(rawPacks, filter),
        "startDate",
        startDateFilter,
        startDateFilterCustom,
      ),
      "endDate",
      endDateFilter,
      endDateFilterCustom,
    ),
    sort,
  );

  function SortIcon({ col }: { col: PackSortCol }) {
    if (sort.col !== col)
      return (
        <ChevronsUpDown className="h-3 w-3 opacity-40 ml-0.5 flex-shrink-0" />
      );
    return sort.dir === "asc" ? (
      <ChevronUp
        className="h-3 w-3 ml-0.5 flex-shrink-0"
        style={{ color: "#145F33" }}
      />
    ) : (
      <ChevronDown
        className="h-3 w-3 ml-0.5 flex-shrink-0"
        style={{ color: "#145F33" }}
      />
    );
  }
  function packStatusBadge(s: MedicationPack["packStatus"]) {
    const map: Record<
      MedicationPack["packStatus"],
      { bg: string; color: string; border: string }
    > = {
      Available: {
        bg: "#dbeafe",
        color: "#1d4ed8",
        border: "#93c5fd",
      },
      Dispensed: {
        bg: "#fee2e2",
        color: "#991b1b",
        border: "#fca5a5",
      },
      Selected: {
        bg: "#fef9c3",
        color: "#854d0e",
        border: "#fde047",
      },
      Received: {
        bg: "#dcfce7",
        color: "#166534",
        border: "#86efac",
      },
    };
    const st = map[s];
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full slds-text-3 font-medium whitespace-nowrap"
        style={{
          backgroundColor: st.bg,
          color: st.color,
          border: `1px solid ${st.border}`,
        }}
      >
        {s}
      </span>
    );
  }
  function thBtn(label: string, col: PackSortCol) {
    return (
      <button
        onClick={() => toggleSort(sort, col, setSort)}
        className="flex items-center gap-0.5 slds-text-3 font-semibold whitespace-nowrap hover:opacity-80 transition-opacity"
        style={{ color: "var(--slds-g-color-text-weak)" }}
      >
        {label}
        <SortIcon col={col} />
      </button>
    );
  }
  function spBadge(ps: PackStatus) {
    const m: Record<
      PackStatus,
      { bg: string; color: string; border: string }
    > = {
      Available: {
        bg: "#eff6ff",
        color: "#1d4ed8",
        border: "#bfdbfe",
      },
      Selected: {
        bg: "#f0faf4",
        color: "#145F33",
        border: "#a3d4b5",
      },
      Dispensed: {
        bg: "#fef2f2",
        color: "#c23934",
        border: "#f5c6c6",
      },
      Received: {
        bg: "#fef9ec",
        color: "#92400e",
        border: "#fde68a",
      },
      Reviewed: {
        bg: "#f3f4f6",
        color: "#374151",
        border: "#d1d5db",
      },
    };
    const s = m[ps];
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full slds-text-3 font-medium whitespace-nowrap"
        style={{
          backgroundColor: s.bg,
          color: s.color,
          border: `1px solid ${s.border}`,
        }}
      >
        {ps}
      </span>
    );
  }

  const tabOrder: Record<string, number> = {
    doses: 0,
    setPrimary: 1,
    packingPrep: 2,
    dispense: 3,
    count: 4,
    handOff: 5,
    review: 6,
    disposal: 7,
  };
  const tabOrderArr = [
    "doses",
    "setPrimary",
    "packingPrep",
    "dispense",
    "count",
    "handOff",
    "review",
    "disposal",
  ] as const;

  // ── Date filter dropdown builder (reused for Start and End) ─────────────────
  const DateFilterDropdown = ({
    title,
    isOpen,
    draftValue,
    setDraftValue,
    modalType,
    setModalType,
    customVal,
    setCustomVal,
    onClear,
    onApply,
    funnelRef,
  }: {
    title: string;
    isOpen: boolean;
    draftValue: string;
    setDraftValue: (v: string) => void;
    modalType: "relative" | "specific";
    setModalType: (v: "relative" | "specific") => void;
    customVal: string;
    setCustomVal: (v: string) => void;
    onClear: () => void;
    onApply: () => void;
    funnelRef: React.RefObject<HTMLDivElement>;
  }) => {
    if (!isOpen) return null;
    return (
      <div
        style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          zIndex: 9999,
          backgroundColor:
            "var(--slds-g-color-background-base)",
          borderRadius: "10px",
          minWidth: "340px",
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)",
          border: "1px solid var(--slds-g-color-border-base-1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 18px 13px",
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <div
            style={{
              height: "28px",
              width: "28px",
              borderRadius: "6px",
              backgroundColor: "#e6f2eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Filter
              className="h-3.5 w-3.5"
              style={{ color: "#145F33" }}
            />
          </div>
          <div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--slds-g-color-text-default)",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {title}
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "var(--slds-g-color-text-weak)",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              Select a filter type and value below
            </p>
          </div>
        </div>
        <div style={{ padding: "16px 18px 18px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label
              className="slds-form-label"
              style={{
                color: "var(--slds-g-color-text-weak)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              FILTER TYPE
            </label>
            <select
              value={modalType}
              onChange={(e) => {
                const t = e.target.value as
                  "relative" | "specific";
                setModalType(t);
                if (t === "relative") setDraftValue("all");
              }}
              style={{
                width: "100%",
                height: "36px",
                padding: "0 10px",
                borderRadius: "6px",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                fontSize: "13px",
                color: "var(--slds-g-color-text-default)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="relative">Relative Date</option>
              <option value="specific">Specific Date</option>
            </select>
          </div>
          {modalType === "relative" ? (
            <div>
              <label
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                RELATIVE DATE
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px",
                }}
              >
                {[
                  { key: "today", label: "Today" },
                  { key: "yesterday", label: "Yesterday" },
                  { key: "this-week", label: "This Week" },
                  { key: "last-week", label: "Last Week" },
                  { key: "this-month", label: "This Month" },
                  { key: "last-month", label: "Last Month" },
                  { key: "this-year", label: "This Year" },
                  { key: "last-year", label: "Last Year" },
                ].map(({ key, label }) => {
                  const isSel = draftValue === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setDraftValue(key)}
                      style={{
                        height: "34px",
                        padding: "0 10px",
                        borderRadius: "6px",
                        border: isSel
                          ? "1.5px solid #145F33"
                          : "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: isSel
                          ? "#f0faf4"
                          : "var(--slds-g-color-background-base)",
                        color: isSel
                          ? "#145F33"
                          : "var(--slds-g-color-text-default)",
                        fontSize: "13px",
                        fontWeight: isSel ? 600 : 400,
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSel)
                          (
                            e.currentTarget as HTMLElement
                          ).style.backgroundColor =
                            "var(--slds-g-color-background-alt)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSel)
                          (
                            e.currentTarget as HTMLElement
                          ).style.backgroundColor =
                            "var(--slds-g-color-background-base)";
                      }}
                    >
                      <span
                        style={{
                          width: "14px",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {isSel && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#145F33"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <label
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                SPECIFIC DATE{" "}
                <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="MM/DD/YYYY"
                value={customVal}
                onChange={(e) => {
                  const c = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 8);
                  let fmt = c;
                  if (c.length > 4)
                    fmt = `${c.slice(0, 2)}/${c.slice(2, 4)}/${c.slice(4)}`;
                  else if (c.length > 2)
                    fmt = `${c.slice(0, 2)}/${c.slice(2)}`;
                  setCustomVal(fmt);
                }}
                maxLength={10}
                autoFocus
                style={{
                  width: "100%",
                  height: "36px",
                  padding: "0 12px",
                  borderRadius: "6px",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  fontSize: "13px",
                  color: "var(--slds-g-color-text-default)",
                  outline: "none",
                  boxSizing: "border-box" as const,
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#145F33";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 2px #145F3330";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--slds-g-color-border-base-1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--slds-g-color-text-weak)",
                  marginTop: "5px",
                  marginBottom: 0,
                }}
              >
                Auto-formatted as MM/DD/YYYY
              </p>
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "8px",
            padding: "12px 18px",
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <button
            onClick={onClear}
            style={{
              height: "32px",
              padding: "0 16px",
              borderRadius: "20px",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
              fontSize: "13px",
              cursor: "pointer",
              color: "var(--slds-g-color-text-weak)",
            }}
            onMouseEnter={(e) => {
              (
                e.currentTarget as HTMLElement
              ).style.backgroundColor =
                "var(--slds-g-color-background-alt-2)";
            }}
            onMouseLeave={(e) => {
              (
                e.currentTarget as HTMLElement
              ).style.backgroundColor =
                "var(--slds-g-color-background-base)";
            }}
          >
            Clear
          </button>
          <button
            onClick={onApply}
            style={{
              height: "32px",
              padding: "0 18px",
              borderRadius: "20px",
              border: "none",
              backgroundColor: "#145F33",
              color: "white",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (
                e.currentTarget as HTMLElement
              ).style.backgroundColor = "#0e4524";
            }}
            onMouseLeave={(e) => {
              (
                e.currentTarget as HTMLElement
              ).style.backgroundColor = "#145F33";
            }}
          >
            Apply
          </button>
        </div>
      </div>
    );
  };

  // ── Open the Create / Edit dialog (list buttons and dialogOnly hosts) ──
  function openCreatePack(
    defaults: Partial<
      Record<
        "startDate" | "startTime" | "endDate" | "endTime",
        string
      >
    > = {},
  ) {
    setSelectedPackId(null);
    setNewPackForm({
      startDate: defaults.startDate ?? "",
      startTime: defaults.startTime ?? "",
      endDate: defaults.endDate ?? "",
      endTime: defaults.endTime ?? "",
      expectedHandoffDate: "",
    });
    setCreatePackActiveTab("doses");
    setDateRangeApplied(false);
    setAppliedDateRange({
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    });
    setPrnMedications([]);
    setOtcMedications([]);
    setSetPrimaryShowLog(false);
    setPackingPrepInnerTab("checklist");
    setDispenseInnerTab("staffDispensed");
    setHandOffInnerTab("youthReceived");
    setReviewInnerTab("review");
    setIsCreatePackDialogOpen(true);
  }
  // Edit loads the pack's own saved period — opening never changes it.
  function openEditPack(pack: MedicationPack) {
    setSelectedPackId(pack.id);
    setNewPackForm({
      startDate: pack.startDate,
      startTime: pack.startTime,
      endDate: pack.endDate,
      endTime: pack.endTime,
      expectedHandoffDate: pack.expectedHandoffDate,
    });
    setAppliedDateRange({
      startDate: pack.startDate,
      startTime: pack.startTime,
      endDate: pack.endDate,
      endTime: pack.endTime,
    });
    setDateRangeApplied(true);
    setIsCreatePackDialogOpen(true);
  }

  // dialogOnly hosts: open on mount; report when the dialog closes.
  const launched = useRef(false);
  useEffect(() => {
    if (!launch || launched.current) return;
    launched.current = true;
    if (launch.mode === "create") openCreatePack(launch.defaults);
    else {
      const pack = medicationPacks.find(
        (p) => p.id === launch.packMedId,
      );
      if (pack) openEditPack(pack);
      else {
        toast.error("That Pack Med no longer exists.");
        onClose?.();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (isCreatePackDialogOpen) wasOpen.current = true;
    else if (wasOpen.current) {
      wasOpen.current = false;
      onClose?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreatePackDialogOpen]);

  return (
    <div className="space-y-0">
      {!dialogOnly && (
        <>
      {/* ── Sub-tab bar ── */}
      <div
        className="flex items-center justify-between px-4 py-2 rounded-t-lg gap-3 flex-wrap"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderBottom: "none",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        <div className="flex items-center gap-0 flex-shrink-0">
          {(["active", "archive"] as const).map((tab) => {
            const label =
              tab === "active" ? "Active" : "Archive";
            const count = medicationPacks.filter((p) =>
              tab === "active"
                ? !isEffectivelyArchived(p)
                : isEffectivelyArchived(p),
            ).length;
            const isSel = packMedsSubTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setPackMedsSubTab(tab)}
                className="flex items-center gap-1.5 px-3 py-1.5 slds-text-4 font-semibold transition-colors relative"
                style={{
                  color: isSel
                    ? "#145F33"
                    : "var(--slds-g-color-text-weak)",
                  borderBottom: isSel
                    ? "2px solid #145F33"
                    : "2px solid transparent",
                }}
              >
                {label}
                <span
                  className="slds-text-3 px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: isSel
                      ? "#e6f2eb"
                      : "var(--slds-g-color-background-alt)",
                    color: isSel
                      ? "#145F33"
                      : "var(--slds-g-color-text-weak)",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
          {(startDateFilter !== "all" ||
            endDateFilter !== "all") && (
            <>
              <div
                className="mx-2 h-4 w-px flex-shrink-0"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-border-base-1)",
                }}
              />
              <button
                onClick={() => {
                  setStartDateFilter("all");
                  setStartDateFilterCustom("");
                  setEndDateFilter("all");
                  setEndDateFilterCustom("");
                }}
                className="flex items-center gap-1.5 h-7 px-3 rounded-full slds-text-3 font-medium transition-colors flex-shrink-0"
                style={{
                  backgroundColor: "#fef2f2",
                  color: "#c23934",
                  border: "1px solid #f5c6c6",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (
                    e.currentTarget as HTMLElement
                  ).style.backgroundColor = "#fee2e2";
                }}
                onMouseLeave={(e) => {
                  (
                    e.currentTarget as HTMLElement
                  ).style.backgroundColor = "#fef2f2";
                }}
              >
                <X className="h-3 w-3" />
                Clear Filters
              </button>
            </>
          )}
        </div>
        <div className="flex items-center flex-shrink-0">
          {isActive && (
            <Button
              size="sm"
              className="h-8 rounded-full slds-text-3 text-white gap-1.5"
              style={{
                backgroundColor: "#145F33",
                border: "1px solid #145F33",
              }}
              onClick={() => openCreatePack()}
            >
              <Plus className="h-3.5 w-3.5" />
              Create New Medication Pack
            </Button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div
        className="overflow-x-auto rounded-b-lg"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        <table
          className="w-full slds-text-4"
          style={{ minWidth: "900px" }}
        >
          <thead>
            <tr
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <th className="px-3 py-2.5 text-left">
                {thBtn("Pack Name", "packName")}
              </th>
              <th className="px-3 py-2.5 text-left">
                {thBtn("Pack Type", "packType")}
              </th>
              <th className="px-3 py-2.5 text-left whitespace-nowrap">
                {thBtn(
                  "Expected Handoff Date",
                  "expectedHandoffDate",
                )}
              </th>
              <th className="px-3 py-2.5 text-left whitespace-nowrap">
                <div
                  ref={startDateFunnelRef}
                  style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {thBtn("Start Date", "startDate")}
                  <button
                    title="Filter by Start Date"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDateFilterModalType(
                        startDateFilter === "custom"
                          ? "specific"
                          : "relative",
                      );
                      setDateFilterDraftValue(
                        startDateFilter === "custom"
                          ? "custom"
                          : startDateFilter,
                      );
                      setIsStartDateFilterOpen((o) => !o);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "20px",
                      height: "20px",
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                      flexShrink: 0,
                      backgroundColor:
                        startDateFilter !== "all"
                          ? "#e6f2eb"
                          : "transparent",
                      color:
                        startDateFilter !== "all"
                          ? "#145F33"
                          : "var(--slds-g-color-text-weak)",
                    }}
                    onMouseEnter={(e) => {
                      if (startDateFilter === "all")
                        (
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor =
                          "var(--slds-g-color-background-alt-2)";
                    }}
                    onMouseLeave={(e) => {
                      if (startDateFilter === "all")
                        (
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor = "transparent";
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                  </button>
                  <DateFilterDropdown
                    title="Filter by Start Date"
                    isOpen={isStartDateFilterOpen}
                    draftValue={dateFilterDraftValue}
                    setDraftValue={setDateFilterDraftValue}
                    modalType={dateFilterModalType}
                    setModalType={setDateFilterModalType}
                    customVal={startDateFilterCustom}
                    setCustomVal={setStartDateFilterCustom}
                    onClear={() => {
                      setStartDateFilter("all");
                      setStartDateFilterCustom("");
                      setDateFilterDraftValue("all");
                      setIsStartDateFilterOpen(false);
                    }}
                    onApply={() => {
                      if (dateFilterModalType === "relative") {
                        setStartDateFilter(
                          dateFilterDraftValue === "all"
                            ? "all"
                            : dateFilterDraftValue,
                        );
                        setStartDateFilterCustom("");
                      } else {
                        if (startDateFilterCustom)
                          setStartDateFilter("custom");
                      }
                      setIsStartDateFilterOpen(false);
                    }}
                    funnelRef={startDateFunnelRef}
                  />
                </div>
              </th>
              <th className="px-3 py-2.5 text-left whitespace-nowrap">
                {thBtn("Start Time", "startTime")}
              </th>
              <th className="px-3 py-2.5 text-left whitespace-nowrap">
                <div
                  ref={endDateFunnelRef}
                  style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {thBtn("End Date", "endDate")}
                  <button
                    title="Filter by End Date"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEndDateFilterModalType(
                        endDateFilter === "custom"
                          ? "specific"
                          : "relative",
                      );
                      setEndDateFilterDraftValue(
                        endDateFilter === "custom"
                          ? "custom"
                          : endDateFilter,
                      );
                      setIsEndDateFilterOpen((o) => !o);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "20px",
                      height: "20px",
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                      flexShrink: 0,
                      backgroundColor:
                        endDateFilter !== "all"
                          ? "#e6f2eb"
                          : "transparent",
                      color:
                        endDateFilter !== "all"
                          ? "#145F33"
                          : "var(--slds-g-color-text-weak)",
                    }}
                    onMouseEnter={(e) => {
                      if (endDateFilter === "all")
                        (
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor =
                          "var(--slds-g-color-background-alt-2)";
                    }}
                    onMouseLeave={(e) => {
                      if (endDateFilter === "all")
                        (
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor = "transparent";
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                  </button>
                  <DateFilterDropdown
                    title="Filter by End Date"
                    isOpen={isEndDateFilterOpen}
                    draftValue={endDateFilterDraftValue}
                    setDraftValue={setEndDateFilterDraftValue}
                    modalType={endDateFilterModalType}
                    setModalType={setEndDateFilterModalType}
                    customVal={endDateFilterCustom}
                    setCustomVal={setEndDateFilterCustom}
                    onClear={() => {
                      setEndDateFilter("all");
                      setEndDateFilterCustom("");
                      setEndDateFilterDraftValue("all");
                      setIsEndDateFilterOpen(false);
                    }}
                    onApply={() => {
                      if (
                        endDateFilterModalType === "relative"
                      ) {
                        setEndDateFilter(
                          endDateFilterDraftValue === "all"
                            ? "all"
                            : endDateFilterDraftValue,
                        );
                        setEndDateFilterCustom("");
                      } else {
                        if (endDateFilterCustom)
                          setEndDateFilter("custom");
                      }
                      setIsEndDateFilterOpen(false);
                    }}
                    funnelRef={endDateFunnelRef}
                  />
                </div>
              </th>
              <th className="px-3 py-2.5 text-left whitespace-nowrap">
                {thBtn("End Time", "endTime")}
              </th>
              <th
                className="px-3 py-2.5 text-left slds-text-3 font-semibold whitespace-nowrap"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {visiblePacks.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-10 text-center"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-8 w-8 opacity-30" />
                    <span className="slds-text-4">
                      {filter
                        ? `No ${isActive ? "active" : "archived"} packs match "${filter}". `
                        : isActive
                          ? 'No active medication packs. Click "Create New Medication Pack" to get started.'
                          : "No archived medication packs found."}
                      {filter && (
                        <button
                          onClick={() => setFilter("")}
                          className="underline ml-1"
                          style={{ color: "#145F33" }}
                        >
                          Clear filter
                        </button>
                      )}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              visiblePacks.map((pack, idx) => (
                <tr
                  key={pack.id}
                  className="transition-colors"
                  style={{
                    borderBottom:
                      idx < visiblePacks.length - 1
                        ? "1px solid var(--slds-g-color-border-base-1)"
                        : "none",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--slds-g-color-background-alt)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--slds-g-color-background-base)";
                  }}
                >
                  <td
                    className="px-3 py-2.5"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                      maxWidth: "240px",
                    }}
                  >
                    <span
                      className="block truncate slds-text-4"
                      title={pack.packName}
                    >
                      {pack.packName}
                    </span>
                  </td>
                  <td
                    className="px-3 py-2.5 slds-text-3"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                      maxWidth: "180px",
                    }}
                  >
                    <span
                      className="block truncate"
                      title={pack.packType}
                    >
                      {pack.packType}
                    </span>
                  </td>
                  <td
                    className="px-3 py-2.5 slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {pack.expectedHandoffDate}
                  </td>
                  <td
                    className="px-3 py-2.5 slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {pack.startDate}
                  </td>
                  <td
                    className="px-3 py-2.5 slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {pack.startTime}
                  </td>
                  <td
                    className="px-3 py-2.5 slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {pack.endDate}
                  </td>
                  <td
                    className="px-3 py-2.5 slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {pack.endTime}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedPackId(pack.id);
                          setIsViewPackDialogOpen(true);
                        }}
                        title="View"
                        className="p-1.5 rounded transition-colors"
                        style={{
                          color: "#0176d3",
                          backgroundColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLElement
                          ).style.backgroundColor = "#e8f4fd";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLElement
                          ).style.backgroundColor =
                            "transparent";
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditPack(pack)}
                        title="Edit"
                        className="p-1.5 rounded transition-colors"
                        style={{
                          color: "#145F33",
                          backgroundColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLElement
                          ).style.backgroundColor = "#e6f2eb";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLElement
                          ).style.backgroundColor =
                            "transparent";
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Row count footer */}
      {visiblePacks.length > 0 && (
        <div className="flex items-center justify-between px-3 pt-2">
          <span
            className="slds-text-3"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            {visiblePacks.length} record
            {visiblePacks.length !== 1 ? "s" : ""}
            {filter && ` (filtered from ${rawPacks.length})`}
          </span>
          {filter && (
            <button
              onClick={() => setFilter("")}
              className="slds-text-3 underline"
              style={{ color: "#145F33" }}
            >
              Clear filter
            </button>
          )}
        </div>
      )}

        </>
      )}

      {/* ── Create / Edit Dialog ── */}
      <PackMedsCreateDialog
        isCreatePackDialogOpen={isCreatePackDialogOpen}
        setIsCreatePackDialogOpen={setIsCreatePackDialogOpen}
        createPackActiveTab={createPackActiveTab}
        setCreatePackActiveTab={setCreatePackActiveTab}
        selectedPackId={selectedPackId}
        setSelectedPackId={setSelectedPackId}
        newPackForm={newPackForm}
        setNewPackForm={setNewPackForm}
        dateRangeApplied={dateRangeApplied}
        setDateRangeApplied={setDateRangeApplied}
        appliedDateRange={appliedDateRange}
        setAppliedDateRange={setAppliedDateRange}
        isDateChangeWarningOpen={isDateChangeWarningOpen}
        setIsDateChangeWarningOpen={setIsDateChangeWarningOpen}
        pendingDateChange={pendingDateChange}
        setPendingDateChange={setPendingDateChange}
        isModifyPrnDialogOpen={isModifyPrnDialogOpen}
        setIsModifyPrnDialogOpen={setIsModifyPrnDialogOpen}
        isModifyAllPrnDialogOpen={isModifyAllPrnDialogOpen}
        setIsModifyAllPrnDialogOpen={
          setIsModifyAllPrnDialogOpen
        }
        selectedPrnIndex={selectedPrnIndex}
        setSelectedPrnIndex={setSelectedPrnIndex}
        prnMedications={prnMedications}
        setPrnMedications={setPrnMedications}
        otcMedications={otcMedications}
        setOtcMedications={setOtcMedications}
        isSetPrimaryModalOpen={isSetPrimaryModalOpen}
        setIsSetPrimaryModalOpen={setIsSetPrimaryModalOpen}
        setPrimarySelectedCode={setPrimarySelectedCode}
        setSetPrimarySelectedCode={setSetPrimarySelectedCode}
        setPrimaryPackComment={setPrimaryPackComment}
        setSetPrimaryPackComment={setSetPrimaryPackComment}
        setPrimaryShowLog={setPrimaryShowLog}
        setSetPrimaryShowLog={setSetPrimaryShowLog}
        setPrimaryMedRows={setPrimaryMedRows}
        setSetPrimaryMedRows={setSetPrimaryMedRows}
        setPrimaryPrnRows={setPrimaryPrnRows}
        setSetPrimaryPrnRows={setSetPrimaryPrnRows}
        setPrimaryOtcRowsData={setPrimaryOtcRowsData}
        setSetPrimaryOtcRowsData={setSetPrimaryOtcRowsData}
        setPrimaryLogEntries={setPrimaryLogEntries}
        setSetPrimaryLogEntries={setSetPrimaryLogEntries}
        setPrimaryCommentError={setPrimaryCommentError}
        setSetPrimaryCommentError={setSetPrimaryCommentError}
        packingPrepInnerTab={packingPrepInnerTab}
        setPackingPrepInnerTab={setPackingPrepInnerTab}
        isLabelStyleModalOpen={isLabelStyleModalOpen}
        setIsLabelStyleModalOpen={setIsLabelStyleModalOpen}
        packPrepCarryStatuses={packPrepCarryStatuses}
        packPrepMedSelected={packPrepMedSelected}
        setPackPrepMedSelected={setPackPrepMedSelected}
        packPrepPrnSelected={packPrepPrnSelected}
        setPackPrepPrnSelected={setPackPrepPrnSelected}
        packPrepOtcSelected={packPrepOtcSelected}
        setPackPrepOtcSelected={setPackPrepOtcSelected}
        packPrepMedRows={packPrepMedRows}
        setPackPrepMedRows={setPackPrepMedRows}
        packPrepPrnRows={packPrepPrnRows}
        setPackPrepPrnRows={setPackPrepPrnRows}
        packPrepOtcRows={packPrepOtcRows}
        setPackPrepOtcRows={setPackPrepOtcRows}
        packPrepLogEntries={packPrepLogEntries}
        dispenseInnerTab={dispenseInnerTab}
        setDispenseInnerTab={setDispenseInnerTab}
        dispenseMedRows={dispenseMedRows}
        setDispenseMedRows={setDispenseMedRows}
        dispensePrnRows={dispensePrnRows}
        setDispensePrnRows={setDispensePrnRows}
        dispenseOtcRows={dispenseOtcRows}
        setDispenseOtcRows={setDispenseOtcRows}
        dispenseLogEntries={dispenseLogEntries}
        countRows={countRows}
        setCountRows={setCountRows}
        countRowsOriginal={countRowsOriginal}
        setCountRowsOriginal={setCountRowsOriginal}
        hasRowChanges={hasRowChanges}
        handOffInnerTab={handOffInnerTab}
        setHandOffInnerTab={setHandOffInnerTab}
        handOffMedRows={handOffMedRows}
        setHandOffMedRows={setHandOffMedRows}
        handOffPrnRows={handOffPrnRows}
        setHandOffPrnRows={setHandOffPrnRows}
        handOffOtcRows={handOffOtcRows}
        setHandOffOtcRows={setHandOffOtcRows}
        handOffLogEntries={handOffLogEntries}
        isYouthReceivedModalOpen={isYouthReceivedModalOpen}
        setIsYouthReceivedModalOpen={
          setIsYouthReceivedModalOpen
        }
        youthReceivedToggle={youthReceivedToggle}
        setYouthReceivedToggle={setYouthReceivedToggle}
        recipientType={recipientType}
        setRecipientType={setRecipientType}
        recipientName={recipientName}
        setRecipientName={setRecipientName}
        packComment={packComment}
        setPackComment={setPackComment}
        reviewInnerTab={reviewInnerTab}
        setReviewInnerTab={setReviewInnerTab}
        reviewMedRows={reviewMedRows}
        setReviewMedRows={setReviewMedRows}
        reviewPrnRows={reviewPrnRows}
        setReviewPrnRows={setReviewPrnRows}
        reviewOtcRows={reviewOtcRows}
        setReviewOtcRows={setReviewOtcRows}
        reviewLogEntries={reviewLogEntries}
        setReviewLogEntries={setReviewLogEntries}
        isSetReviewStatusModalOpen={isSetReviewStatusModalOpen}
        setIsSetReviewStatusModalOpen={
          setIsSetReviewStatusModalOpen
        }
        reviewModalPrimaryCode={reviewModalPrimaryCode}
        setReviewModalPrimaryCode={setReviewModalPrimaryCode}
        reviewModalComment={reviewModalComment}
        setReviewModalComment={setReviewModalComment}
        reviewModalCommentError={reviewModalCommentError}
        setReviewModalCommentError={setReviewModalCommentError}
        isReviewMedHistoryOpen={isReviewMedHistoryOpen}
        setIsReviewMedHistoryOpen={setIsReviewMedHistoryOpen}
        reviewHistoryMedication={reviewHistoryMedication}
        setReviewHistoryMedication={setReviewHistoryMedication}
        disposalMedRows={disposalMedRows}
        setDisposalMedRows={setDisposalMedRows}
        disposalPrnRows={disposalPrnRows}
        setDisposalPrnRows={setDisposalPrnRows}
        disposalOtcRows={disposalOtcRows}
        setDisposalOtcRows={setDisposalOtcRows}
        disposalLogEntries={disposalLogEntries}
        setDisposalLogEntries={setDisposalLogEntries}
        disposalInnerTab={disposalInnerTab}
        setDisposalInnerTab={setDisposalInnerTab}
        isMassDisposalModalOpen={isMassDisposalModalOpen}
        setIsMassDisposalModalOpen={setIsMassDisposalModalOpen}
        massDisposalModalRows={massDisposalModalRows}
        setMassDisposalModalRows={setMassDisposalModalRows}
        massDisposalDate={massDisposalDate}
        setMassDisposalDate={setMassDisposalDate}
        massDisposalCancelConfirmOpen={
          massDisposalCancelConfirmOpen
        }
        setMassDisposalCancelConfirmOpen={
          setMassDisposalCancelConfirmOpen
        }
        handleCreatePack={handleCreatePack}
        youthDisplayName={youthDisplayName}
        contextLabel={
          contextLabel ??
          (youthId ? `For ${youthDisplayName}` : undefined)
        }
      />

      {/* Date Range Warning */}
      <Dialog
        open={isDateChangeWarningOpen}
        onOpenChange={setIsDateChangeWarningOpen}
      >
        <DialogContent
          aria-describedby={undefined}
          className="max-w-md"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            border:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="slds-text-6 font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Date Range Change
            </DialogTitle>
            <DialogDescription
              className="slds-text-4"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Changing the date range will clear existing PRN
              and OTC data. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDateChangeWarningOpen(false);
                setPendingDateChange(null);
              }}
              className="h-9 px-4 rounded-full text-[13px]"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-4)",
                color: "#706e6b",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (pendingDateChange) {
                  setNewPackForm((f) => ({
                    ...f,
                    ...pendingDateChange,
                  }));
                  setDateRangeApplied(false);
                  setPrnMedications([]);
                  setOtcMedications([]);
                }
                setIsDateChangeWarningOpen(false);
                setPendingDateChange(null);
              }}
              className="h-9 px-4 rounded-full text-[13px] text-white"
              style={{
                backgroundColor: "#145F33",
                border: "none",
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Primary Medication Code Modal */}
      <Dialog
        open={isSetPrimaryModalOpen}
        onOpenChange={(open) => {
          setIsSetPrimaryModalOpen(open);
          if (!open) {
            setSetPrimarySelectedCode("");
            setSetPrimaryPackComment("");
            setSetPrimaryCommentError(false);
          }
        }}
      >
        <DialogContent
          size="md"
          onInteractOutside={(event) => {
            // Prevent the Dialog from closing when clicking outside
            event.preventDefault();
          }}
        >
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)]">
                <FileText className="h-4 w-4 text-[var(--color-brand-primary)]" />
              </div>

              <div>
                <DialogTitle>
                  Set Primary Medication Code
                </DialogTitle>

                <DialogDescription>
                  Assign a primary code to all selected
                  medication rows.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogBody className="space-y-6 bg-white">
            <div>
              <div className="space-y-1.5">
                <label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  PRIMARY MEDICATION CODE{" "}
                  <span className="text-red-600">*</span>
                </label>
                <MedCodePicker
                  codes={SET_PRIMARY_CODES_LOCAL}
                  value={setPrimarySelectedCode}
                  onChange={setSetPrimarySelectedCode}
                  placeholder="Select a code..."
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  PACK COMMENT{" "}
                  <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={setPrimaryPackComment}
                  onChange={(e) => {
                    setSetPrimaryPackComment(e.target.value);
                    if (e.target.value.trim())
                      setSetPrimaryCommentError(false);
                  }}
                  placeholder="Enter required comment..."
                  rows={3}
                  className="bg-white w-full px-3 py-2 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33] resize-none"
                  style={{
                    border: setPrimaryCommentError
                      ? "1px solid #c23934"
                      : "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
                {setPrimaryCommentError && (
                  <p
                    className="slds-text-3"
                    style={{ color: "#c23934" }}
                  >
                    Comment is required.
                  </p>
                )}
              </div>
              {setPrimarySelectedCode &&
                codeAuditFlag(setPrimarySelectedCode) && (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded slds-text-3"
                    style={{
                      backgroundColor: "#fef9ec",
                      border: "1px solid #f4c97f",
                      color: "#78520a",
                    }}
                  >
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                    This code will trigger an audit flag.
                  </div>
                )}
            </div>
          </DialogBody>
          <DialogFooter
            className="border-t pt-3 gap-2"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
            }}
          >
            <p className="m-0 text-[12px] text-right italic font-medium">
              I attest that I have followed Mercy Home's
              policies and procedures for medication
              dispensation & documentation.
            </p>
            <Button
              variant="outline"
              onClick={() => setIsSetPrimaryModalOpen(false)}
              className="h-9 px-4 rounded-full text-[13px]"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-4)",
                color: "#706e6b",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!setPrimarySelectedCode) {
                  toast.error("Please select a code first.");
                  return;
                }
                if (!setPrimaryPackComment.trim()) {
                  setSetPrimaryCommentError(true);
                  return;
                }
                const code = setPrimarySelectedCode;
                const ts = new Date().toLocaleString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                setSetPrimaryMedRows((prev) =>
                  prev.map((r) =>
                    r.selected
                      ? {
                          ...r,
                          primaryCode: code,
                          packStatus: "Selected" as PackStatus,
                          selected: false,
                        }
                      : r,
                  ),
                );
                setSetPrimaryPrnRows((prev) =>
                  prev.map((r) =>
                    r.selected
                      ? {
                          ...r,
                          primaryCode: code,
                          packStatus: "Selected" as PackStatus,
                          selected: false,
                        }
                      : r,
                  ),
                );
                setSetPrimaryOtcRowsData((prev) =>
                  prev.map((r) =>
                    r.selected
                      ? {
                          ...r,
                          primaryCode: code,
                          packStatus: "Selected" as PackStatus,
                          selected: false,
                        }
                      : r,
                  ),
                );
                setSetPrimaryLogEntries((prev) => [
                  ...prev,
                  {
                    id: Date.now(),
                    timestamp: ts,
                    user: getDemoUserName(),
                    action: "Code Assigned",
                    detail: `${code} assigned to selected medications`,
                  },
                ]);
                setIsSetPrimaryModalOpen(false);
                setSetPrimarySelectedCode("");
                setSetPrimaryPackComment("");
                toast.success(
                  "Primary code assigned successfully.",
                );
              }}
              className="h-9 px-4 rounded-full text-[13px] text-white"
              style={{
                backgroundColor: "#145F33",
                border: "none",
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modify PRN */}
      <Dialog
        open={isModifyPrnDialogOpen}
        onOpenChange={setIsModifyPrnDialogOpen}
      >
        <DialogContent
          aria-describedby={undefined}
          className="max-w-sm"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            border:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="slds-text-6 font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Modify PRN
            </DialogTitle>
          </DialogHeader>
          {selectedPrnIndex !== null &&
            prnMedications[selectedPrnIndex] && (
              <div className="py-4 space-y-4">
                <div className="space-y-1.5">
                  <label
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    MEDICATION
                  </label>
                  <p
                    className="slds-text-4 font-medium"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {
                      prnMedications[selectedPrnIndex]
                        .medication
                    }
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    DOSES
                  </label>
                  <input
                    type="text"
                    value={
                      prnMedications[selectedPrnIndex].doses
                    }
                    onChange={(e) =>
                      setPrnMedications((prev) =>
                        prev.map((p, i) =>
                          i === selectedPrnIndex
                            ? { ...p, doses: e.target.value }
                            : p,
                        ),
                      )
                    }
                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  />
                </div>
              </div>
            )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsModifyPrnDialogOpen(false)}
              className="h-9 px-4 rounded-full text-[13px]"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-4)",
                color: "#706e6b",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsModifyPrnDialogOpen(false);
                toast.success("PRN updated.");
              }}
              className="h-9 px-4 rounded-full text-[13px] text-white"
              style={{
                backgroundColor: "#145F33",
                border: "none",
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modify All PRN */}
      <Dialog
        open={isModifyAllPrnDialogOpen}
        onOpenChange={setIsModifyAllPrnDialogOpen}
      >
        <DialogContent
          aria-describedby={undefined}
          className="max-w-lg"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            border:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="slds-text-6 font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Modify All PRN
            </DialogTitle>
            <DialogDescription
              className="slds-text-4"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Update doses for all PRN medications.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            {prnMedications.map((prn, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3"
              >
                <span
                  className="slds-text-4 flex-1"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {prn.medication}
                </span>
                <input
                  type="text"
                  value={prn.doses}
                  onChange={(e) =>
                    setPrnMedications((prev) =>
                      prev.map((p, i) =>
                        i === idx
                          ? { ...p, doses: e.target.value }
                          : p,
                      ),
                    )
                  }
                  className="h-8 w-20 px-2 rounded slds-text-3"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                  placeholder="Doses"
                />
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsModifyAllPrnDialogOpen(false)}
              className="h-9 px-4 rounded-full text-[13px]"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-4)",
                color: "#706e6b",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsModifyAllPrnDialogOpen(false);
                toast.success("All PRN doses updated.");
              }}
              className="h-9 px-4 rounded-full text-[13px] text-white"
              style={{
                backgroundColor: "#145F33",
                border: "none",
              }}
            >
              Save All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Youth Received Modal */}
      <Dialog
        open={isYouthReceivedModalOpen}
        onOpenChange={setIsYouthReceivedModalOpen}
      >
        <DialogContent
          size="xl"
          onInteractOutside={(event) => {
            // Prevent the Dialog from closing when clicking outside
            event.preventDefault();
          }}
        >
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div>
                <DialogTitle>
                  Youth Received
                </DialogTitle>

                <DialogDescription>
                  Confirm recipient and add any comments about this
              handoff.
                </DialogDescription>
                </div>
              </div>
          </DialogHeader>
          <DialogBody className="space-y-6 bg-white">
            <div>
              {/* Recipient toggle */}
              <div className="space-y-2">
                <label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  RECIPIENT{" "}
                  <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setYouthReceivedToggle("youthReceived")
                    }
                    className="flex-1 h-10 px-4 rounded slds-text-4 font-medium transition-colors"
                    style={{
                      backgroundColor:
                        youthReceivedToggle === "youthReceived"
                          ? "#145F33"
                          : "var(--slds-g-color-background-base)",
                      color:
                        youthReceivedToggle === "youthReceived"
                          ? "white"
                          : "var(--slds-g-color-text-default)",
                      border:
                        "1px solid " +
                        (youthReceivedToggle === "youthReceived"
                          ? "#145F33"
                          : "var(--slds-g-color-border-base-1)"),
                    }}
                  >
                    Youth Received
                  </button>
                  <button
                    onClick={() =>
                      setYouthReceivedToggle("otherRecipient")
                    }
                    className="flex-1 h-10 px-4 rounded slds-text-4 font-medium transition-colors"
                    style={{
                      backgroundColor:
                        youthReceivedToggle === "otherRecipient"
                          ? "#145F33"
                          : "var(--slds-g-color-background-base)",
                      color:
                        youthReceivedToggle === "otherRecipient"
                          ? "white"
                          : "var(--slds-g-color-text-default)",
                      border:
                        "1px solid " +
                        (youthReceivedToggle === "otherRecipient"
                          ? "#145F33"
                          : "var(--slds-g-color-border-base-1)"),
                    }}
                  >
                    Other Recipient
                  </button>
                </div>
              </div>
              {/* Recipient Type — only for Other Recipient */}
              {youthReceivedToggle === "otherRecipient" && (
                <div className="space-y-1.5">
                  <label
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    RECIPIENT TYPE{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <Select
                    value={recipientType}
                    onValueChange={setRecipientType}
                  >
                    <SelectTrigger
                      className="h-10 w-full rounded slds-text-4"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        color: "var(--slds-g-color-text-default)",
                      }}
                    >
                      <SelectValue placeholder="Select recipient type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Parent">
                        Parent
                      </SelectItem>
                      <SelectItem value="Guardian">
                        Guardian
                      </SelectItem>
                      <SelectItem value="School">
                        School
                      </SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {/* Name — only when Recipient Type is Other */}
              {youthReceivedToggle === "otherRecipient" &&
                recipientType === "Other" && (
                  <div className="space-y-1.5">
                    <label
                      className="slds-form-label"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      NAME <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) =>
                        setRecipientName(e.target.value)
                      }
                      placeholder="Enter recipient name"
                      className="h-10 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        color: "var(--slds-g-color-text-default)",
                      }}
                    />
                  </div>
                )}
              {/* Pack Comment */}
              <div className="space-y-1.5">
                <label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  PACK COMMENT (MEDICATION COMMENT)
                </label>
                <Textarea
                  value={packComment}
                  onChange={(e) => setPackComment(e.target.value)}
                  placeholder="Enter any comments about this handoff..."
                  className="w-full px-3 py-2 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33] min-h-[80px]"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="justify-between">
            <p className="m-0 text-[12px] text-right italic font-medium">
              I attest that I have followed Mercy Home's
              policies and procedures for medication
              dispensation & documentation.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setIsYouthReceivedModalOpen(false);
                setYouthReceivedToggle("youthReceived");
                setRecipientType("");
                setRecipientName("");
                setPackComment("");
              }}
              className="h-9 px-4 rounded-full slds-text-4"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-weak)",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (youthReceivedToggle === "otherRecipient") {
                  if (!recipientType) {
                    toast.error("Recipient Type is required.");
                    return;
                  }
                  if (
                    recipientType === "Other" &&
                    !recipientName.trim()
                  ) {
                    toast.error(
                      "Name is required when Recipient Type is Other.",
                    );
                    return;
                  }
                }
                const count = [
                  ...handOffMedRows,
                  ...handOffPrnRows,
                  ...handOffOtcRows,
                ].filter((r) => r.selected).length;
                setHandOffMedRows((prev) =>
                  prev.map((r) =>
                    r.selected
                      ? {
                          ...r,
                          status: "Received",
                          selected: false,
                        }
                      : r,
                  ),
                );
                setHandOffPrnRows((prev) =>
                  prev.map((r) =>
                    r.selected
                      ? {
                          ...r,
                          status: "Received",
                          selected: false,
                        }
                      : r,
                  ),
                );
                setHandOffOtcRows((prev) =>
                  prev.map((r) =>
                    r.selected
                      ? {
                          ...r,
                          status: "Received",
                          selected: false,
                        }
                      : r,
                  ),
                );
                setIsYouthReceivedModalOpen(false);
                setYouthReceivedToggle("youthReceived");
                setRecipientType("");
                setRecipientName("");
                setPackComment("");
                toast.success(
                  `${count} medication${count !== 1 ? "s" : ""} marked as received. Log and attestation records created.`,
                );
              }}
              className="h-9 px-4 rounded-full slds-text-4 text-white"
              style={{ backgroundColor: "#145F33" }}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Medication Pack Dialog */}
      <Dialog
        open={isViewPackDialogOpen}
        onOpenChange={setIsViewPackDialogOpen}
      >
        <DialogContent
          aria-describedby={undefined}
          className="sm:max-w-[860px] p-0 gap-0 overflow-hidden"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            border:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          {/* Header */}
          <DialogHeader
            className="px-6 pt-5 pb-4"
            style={{
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <DialogTitle className="flex items-center gap-2">
              <span
                className="flex items-center justify-center h-6 w-6 rounded-full flex-shrink-0"
                style={{
                  border: "1.5px solid #145F33",
                  color: "#145F33",
                }}
              >
                <Eye className="h-3.5 w-3.5" />
              </span>
              <span
                className="slds-text-6 font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Medication Pack Details
              </span>
            </DialogTitle>
            <p
              className="slds-text-4 ml-8"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Viewing details for the selected medication pack.
            </p>
          </DialogHeader>

          {selectedPack &&
            (() => {
              const DOSE_ORDER: Record<string, number> = {
                Morning: 0,
                Afternoon: 1,
                Evening: 2,
                Bedtime: 3,
              };
              const sortedMeds = [...setPrimaryMedRows]
                .filter((r) => !r.outOfRange)
                .sort((a, b) => {
                  const da = parseDateMMDDYYYY(
                    a.dateGroup || a.start,
                  );
                  const db = parseDateMMDDYYYY(
                    b.dateGroup || b.start,
                  );
                  if (da !== db) return da - db;
                  return (
                    (DOSE_ORDER[a.dosePeriod || ""] ?? 99) -
                    (DOSE_ORDER[b.dosePeriod || ""] ?? 99)
                  );
                });
              const isActiveRecord =
                !isEffectivelyArchived(selectedPack);
              return (
                <div className="overflow-y-auto max-h-[72vh] px-6 py-5 space-y-5">
                  {/* Pack Summary Card */}
                  <div
                    className="rounded-lg p-4 space-y-3"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <div>
                      <span
                        className="slds-form-label block mb-0.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        PACK NAME
                      </span>
                      <span
                        className="slds-text-4 font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {selectedPack.packName}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <div>
                        <span
                          className="slds-form-label block mb-0.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          PACK STATUS
                        </span>
                        <span
                          className="slds-text-4 font-medium"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {selectedPack.packStatus}
                        </span>
                      </div>
                      <div>
                        <span
                          className="slds-form-label block mb-0.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          PACK TYPE
                        </span>
                        <span
                          className="slds-text-4 font-medium"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {selectedPack.packType || "—"}
                        </span>
                      </div>
                      <div>
                        <span
                          className="slds-form-label block mb-0.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          EXPECTED HANDOFF DATE
                        </span>
                        <span
                          className="slds-text-4 font-medium"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {selectedPack.expectedHandoffDate ||
                            "—"}
                        </span>
                      </div>
                      <div>
                        <span
                          className="slds-form-label block mb-1"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          RECORD STATUS
                        </span>
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full slds-text-3 font-medium"
                          style={{
                            backgroundColor: isActiveRecord
                              ? "#e6f2eb"
                              : "#f3f2f2",
                            color: isActiveRecord
                              ? "#145F33"
                              : "#706e6b",
                            border: `1px solid ${isActiveRecord ? "#a3d4b5" : "#d9d9d9"}`,
                          }}
                        >
                          {isActiveRecord
                            ? "Active"
                            : "Archived"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pack Date & Time */}
                  <div>
                    <h4
                      className="slds-text-4 font-semibold mb-2"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      Pack Date &amp; Time
                    </h4>
                    <div
                      className="rounded-lg p-4"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        <div>
                          <span
                            className="slds-form-label block mb-0.5"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            START DATE
                          </span>
                          <span
                            className="slds-text-4 font-medium"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {selectedPack.startDate}
                          </span>
                        </div>
                        <div>
                          <span
                            className="slds-form-label block mb-0.5"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            START TIME
                          </span>
                          <span
                            className="slds-text-4 font-medium"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {selectedPack.startTime}
                          </span>
                        </div>
                        <div>
                          <span
                            className="slds-form-label block mb-0.5"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            END DATE
                          </span>
                          <span
                            className="slds-text-4 font-medium"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {selectedPack.endDate}
                          </span>
                        </div>
                        <div>
                          <span
                            className="slds-form-label block mb-0.5"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            END TIME
                          </span>
                          <span
                            className="slds-text-4 font-medium"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {selectedPack.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medications in Pack */}
                  <div>
                    <h4
                      className="slds-text-4 font-semibold mb-2"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      Medications in Pack
                    </h4>
                    {sortedMeds.length > 0 ? (
                      <div
                        className="rounded overflow-hidden"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <table className="w-full slds-text-3">
                          <thead>
                            <tr
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-alt)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              <th
                                className="px-3 py-2 text-left font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Medication
                              </th>
                              <th
                                className="px-3 py-2 text-left font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Start
                              </th>
                              <th
                                className="px-3 py-2 text-left font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Stop
                              </th>
                              <th
                                className="px-3 py-2 text-left font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Status
                              </th>
                              <th
                                className="px-3 py-2 text-left font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Primary Code
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedMeds.map((med, idx) => (
                              <tr
                                key={med.id}
                                style={{
                                  borderBottom:
                                    idx < sortedMeds.length - 1
                                      ? "1px solid var(--slds-g-color-border-base-1)"
                                      : "none",
                                }}
                              >
                                <td
                                  className="px-3 py-2"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {med.drugName}
                                </td>
                                <td
                                  className="px-3 py-2 whitespace-nowrap"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {med.start}
                                </td>
                                <td
                                  className="px-3 py-2 whitespace-nowrap"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {med.stop}
                                </td>
                                <td className="px-3 py-2">
                                  {spBadge(med.packStatus)}
                                </td>
                                <td
                                  className="px-3 py-2"
                                  style={{
                                    color: med.primaryCode
                                      ? "var(--slds-g-color-text-default)"
                                      : "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  {med.primaryCode || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div
                        className="rounded px-4 py-6 text-center"
                        style={{
                          border:
                            "1px dashed var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <p
                          className="slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          No medications assigned to this pack.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* PRN */}
                  <div>
                    <h4
                      className="slds-text-4 font-semibold mb-2"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      PRN
                    </h4>
                    {setPrimaryPrnRows.length > 0 ? (
                      <div
                        className="rounded overflow-hidden"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <table className="w-full slds-text-3">
                          <thead>
                            <tr
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-alt)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              <th
                                className="px-3 py-2 text-left font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Medication Name
                              </th>
                              <th
                                className="px-3 py-2 text-left font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Start
                              </th>
                              <th
                                className="px-3 py-2 text-left font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Stop
                              </th>
                              <th
                                className="px-3 py-2 text-left font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Status
                              </th>
                              <th
                                className="px-3 py-2 text-left font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Primary Code
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {setPrimaryPrnRows.map(
                              (prn, idx) => (
                                <tr
                                  key={prn.id}
                                  style={{
                                    borderBottom:
                                      idx <
                                      setPrimaryPrnRows.length -
                                        1
                                        ? "1px solid var(--slds-g-color-border-base-1)"
                                        : "none",
                                  }}
                                >
                                  <td
                                    className="px-3 py-2"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {prn.drugName}
                                  </td>
                                  <td
                                    className="px-3 py-2 whitespace-nowrap"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {prn.start}
                                  </td>
                                  <td
                                    className="px-3 py-2 whitespace-nowrap"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {prn.stop}
                                  </td>
                                  <td className="px-3 py-2">
                                    {spBadge(prn.packStatus)}
                                  </td>
                                  <td
                                    className="px-3 py-2"
                                    style={{
                                      color: prn.primaryCode
                                        ? "var(--slds-g-color-text-default)"
                                        : "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    {prn.primaryCode || "—"}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div
                        className="rounded px-4 py-6 text-center"
                        style={{
                          border:
                            "1px dashed var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <p
                          className="slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          No PRN medications for this pack.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* OTC */}
                  <div>
                    <h4
                      className="slds-text-4 font-semibold mb-2"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      OTC
                    </h4>
                    {setPrimaryOtcRowsData.length > 0 ? (
                      <div
                        className="rounded overflow-hidden"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <table className="w-full slds-text-3">
                          <thead>
                            <tr
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-alt)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              <th
                                className="px-3 py-2 text-left font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Medication Name
                              </th>
                              <th
                                className="px-3 py-2 text-left font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Dose
                              </th>
                              <th
                                className="px-3 py-2 text-left font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Quantity
                              </th>
                              <th
                                className="px-3 py-2 text-left font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Status
                              </th>
                              <th
                                className="px-3 py-2 text-left font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Primary Code
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {setPrimaryOtcRowsData.map(
                              (otc, idx) => (
                                <tr
                                  key={otc.id}
                                  style={{
                                    borderBottom:
                                      idx <
                                      setPrimaryOtcRowsData.length -
                                        1
                                        ? "1px solid var(--slds-g-color-border-base-1)"
                                        : "none",
                                  }}
                                >
                                  <td
                                    className="px-3 py-2"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {otc.drugName}
                                  </td>
                                  <td
                                    className="px-3 py-2"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {otc.dose || "—"}
                                  </td>
                                  <td
                                    className="px-3 py-2"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {otc.quantity || "—"}
                                  </td>
                                  <td className="px-3 py-2">
                                    {spBadge(otc.packStatus)}
                                  </td>
                                  <td
                                    className="px-3 py-2"
                                    style={{
                                      color: otc.primaryCode
                                        ? "var(--slds-g-color-text-default)"
                                        : "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    {otc.primaryCode || "—"}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div
                        className="rounded px-4 py-6 text-center"
                        style={{
                          border:
                            "1px dashed var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <p
                          className="slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          No OTC medications for this pack.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Record Details */}
                  <div>
                    <h4
                      className="slds-text-4 font-semibold mb-2"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      Record Details
                    </h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <div>
                        <span
                          className="slds-form-label block mb-0.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          CREATED BY
                        </span>
                        <span
                          className="slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {selectedPack.createdBy}
                        </span>
                      </div>
                      <div>
                        <span
                          className="slds-form-label block mb-0.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          CREATED DATE
                        </span>
                        <span
                          className="slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {selectedPack.createdDate}
                        </span>
                      </div>
                      <div>
                        <span
                          className="slds-form-label block mb-0.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          LAST MODIFIED BY
                        </span>
                        <span
                          className="slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {selectedPack.createdBy}
                        </span>
                      </div>
                      <div>
                        <span
                          className="slds-form-label block mb-0.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          LAST MODIFIED DATE
                        </span>
                        <span
                          className="slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {selectedPack.createdDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* Footer */}
          <div
            className="px-6 py-4 flex justify-end"
            style={{
              borderTop:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <Button
              variant="outline"
              onClick={() => setIsViewPackDialogOpen(false)}
              className="h-9 px-5 rounded-full slds-text-4"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}