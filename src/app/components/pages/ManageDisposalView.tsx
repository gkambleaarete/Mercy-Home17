import { useState, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { Plus, Filter, RefreshCw, ArrowLeft, ChevronUp, ChevronDown, ChevronsUpDown, AlertCircle, Lock, Info } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardFooter, CardHeader } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { DateInput } from "../ui/date-input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
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
import { TablePaginationBar } from "../ui/table-toolbar";
import { toast } from "sonner@2.0.3";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogBody,
  DialogTitle,
} from "../ui/dialog";
import { formatMdy } from "../../lib/dateFormat";
import { getDemoUserName } from "../../lib/demoIdentity";

// ── Types ──────────────────────────────────────────────────────────────────────

type DisposalStatus = "Med Cart" | "Lockbox" | "Pharmacy Transfer (Pending)" | "Pharmacy Transfer (Verified)";
type UserRole = "Frontline Staff" | "Therapist" | "Program Manager" | "Nurse";
type CountType = "Units" | "Volume";

interface DisposalRecord {
  id: number;
  program?: string;
  status: DisposalStatus;
  medication: string;
  dose: string;
  youth: string;
  date: string;
  amount: string;
  disposalStaff: string;
  originalComment: string;
  addComment: string;
}

interface LogRecord {
  id: number;
  date: string;
  logType: string;
  medicationId: number;
  medication: string;
  dose: string;
  youth: string;
  attestationDate: string;
  attestationStaff: string;
  attestationText: string;
  count: string;
  comments: string;
  countType?: CountType;
  enteredInError?: boolean;
}

interface AttestationRecord {
  id: number;
  date: string;
  attestationDate: string;
  attestationText: string;
  attestationStaff: string;
}

// ── Mock youth + medication data for Add Disposal form ────────────────────────

interface MedOption {
  id: number;
  name: string;
  dose: string;
  dosePeriod: string;
  countType: CountType;
}

interface YouthOption {
  id: number;
  name: string;
  medications: MedOption[];
}

const MOCK_YOUTHS: YouthOption[] = [
  {
    id: 1, name: "Fozzie Bear",
    medications: [
      { id: 101, name: "Adderall XR", dose: "20mg",    dosePeriod: "Morning",   countType: "Units"  },
      { id: 102, name: "Vitamin D",   dose: "1000 IU", dosePeriod: "Morning",   countType: "Units"  },
    ],
  },
  {
    id: 2, name: "Kermit Frog",
    medications: [
      { id: 103, name: "Melatonin",   dose: "5mg",       dosePeriod: "Bedtime",   countType: "Units"  },
      { id: 104, name: "Amoxicillin", dose: "250mg/5ml", dosePeriod: "Morning",   countType: "Volume" },
    ],
  },
  {
    id: 3, name: "Gonzo Rizzo",
    medications: [
      { id: 105, name: "Ritalin",   dose: "10mg", dosePeriod: "Morning",   countType: "Units" },
      { id: 106, name: "Concerta",  dose: "27mg", dosePeriod: "Afternoon", countType: "Units" },
    ],
  },
  {
    id: 4, name: "Animal Drum",
    medications: [
      { id: 107, name: "Prozac", dose: "20mg", dosePeriod: "Morning", countType: "Units" },
    ],
  },
  {
    id: 5, name: "Rowlf Piano",
    medications: [
      { id: 108, name: "Zoloft",          dose: "50mg",      dosePeriod: "Evening", countType: "Units"  },
      { id: 109, name: "Ibuprofen Susp.", dose: "100mg/5ml", dosePeriod: "Evening", countType: "Volume" },
    ],
  },
];

const VOLUME_OPTIONS = ["Full", "3/4", "1/2", "1/4"] as const;

// ── Constants ──────────────────────────────────────────────────────────────────

const ATTESTATION_TEXT =
  "I attest that I have followed Mercy Home's policies and procedures for medication dispensation & documentation.";

const STATUS_ORDER: Record<string, number> = {
  "Med Cart": 0,
  "Lockbox": 1,
  "Pharmacy Transfer (Pending)": 2,
  "Pharmacy Transfer (Verified)": 3,
};

const ROLE_ALLOWED_STATUSES: Record<UserRole, string[]> = {
  "Frontline Staff": [],
  "Therapist":       ["Lockbox", "Pharmacy Transfer (Pending)", "Pharmacy Transfer (Verified)"],
  "Program Manager": ["Lockbox", "Pharmacy Transfer (Pending)", "Pharmacy Transfer (Verified)"],
  "Nurse":           ["Lockbox", "Pharmacy Transfer (Pending)", "Pharmacy Transfer (Verified)"],
};

const MOCK_PROGRAMS: { id: string; name: string; roles: UserRole[] }[] = [
  { id: "prog-001", name: "Mahoney House",       roles: ["Frontline Staff", "Therapist", "Program Manager", "Nurse"] },
  { id: "prog-002", name: "Rydell House",        roles: ["Therapist", "Program Manager", "Nurse"] },
  { id: "prog-003", name: "Walsh Campus",        roles: ["Therapist", "Program Manager", "Nurse"] },
  { id: "prog-004", name: "West Campus Program", roles: ["Frontline Staff", "Therapist", "Program Manager", "Nurse"] },
];

const MOCK_RECORDS: DisposalRecord[] = [
  { id: 1,  program: "Mahoney House",        status: "Med Cart",                    medication: "Adderall XR",  dose: "20mg",      youth: "Fozzie Bear",    date: "05/20/2026", amount: "7 tablets",   disposalStaff: "Sarah Johnson",  originalComment: "Expired stock removed from cart.",   addComment: "" },
  { id: 2,  program: "Mahoney House",        status: "Med Cart",                    medication: "Melatonin",    dose: "5mg",       youth: "Kermit Frog",    date: "05/21/2026", amount: "14 tablets",  disposalStaff: "Sarah Johnson",  originalComment: "Youth discharged, unused supply.",   addComment: "" },
  { id: 3,  program: "Mahoney House",        status: "Lockbox",                     medication: "Ritalin",      dose: "10mg",      youth: "Gonzo Rizzo",    date: "05/22/2026", amount: "5 tablets",   disposalStaff: "Marcus Rivera",  originalComment: "Controlled substance — lockbox.",    addComment: "" },
  { id: 4,  program: "Mahoney House",        status: "Pharmacy Transfer (Pending)", medication: "Concerta",     dose: "27mg",      youth: "Animal Drum",    date: "05/22/2026", amount: "3 tablets",   disposalStaff: "Marcus Rivera",  originalComment: "Prescription changed by doctor.",    addComment: "" },
  { id: 5,  program: "Rydell House",         status: "Med Cart",                    medication: "Prozac",       dose: "20mg",      youth: "Rowlf Piano",    date: "05/23/2026", amount: "10 capsules", disposalStaff: "Tina Morales",   originalComment: "Awaiting pharmacy pickup.",           addComment: "" },
  { id: 6,  program: "Rydell House",         status: "Pharmacy Transfer (Pending)", medication: "Zoloft",       dose: "50mg",      youth: "Scooter Grosse", date: "05/24/2026", amount: "8 tablets",   disposalStaff: "Tina Morales",   originalComment: "Youth transferred to new program.",  addComment: "" },
  { id: 7,  program: "Rydell House",         status: "Lockbox",                     medication: "Vitamin D",    dose: "1000 IU",   youth: "Fozzie Bear",    date: "05/25/2026", amount: "30 tablets",  disposalStaff: "Sarah Johnson",  originalComment: "OTC supplement, near expiry.",        addComment: "" },
  { id: 8,  program: "Walsh Campus",         status: "Med Cart",                    medication: "Amoxicillin",  dose: "250mg/5ml", youth: "Miss Piggy",     date: "05/20/2026", amount: "120ml",       disposalStaff: "Elena Vasquez",  originalComment: "Course completed early.",             addComment: "" },
  { id: 9,  program: "Walsh Campus",         status: "Lockbox",                     medication: "Adderall XR",  dose: "10mg",      youth: "Sam Eagle",      date: "05/21/2026", amount: "12 tablets",  disposalStaff: "Elena Vasquez",  originalComment: "Youth left program.",                 addComment: "" },
  { id: 10, program: "West Campus Program",  status: "Med Cart",                    medication: "Melatonin",    dose: "3mg",       youth: "Pepe Prawn",     date: "05/22/2026", amount: "20 tablets",  disposalStaff: "James Ortega",   originalComment: "Switched to new formulation.",        addComment: "" },
  { id: 11, program: "West Campus Program",  status: "Pharmacy Transfer (Pending)", medication: "Ibuprofen",    dose: "200mg",     youth: "Rizzo Rat",      date: "05/23/2026", amount: "40 tablets",  disposalStaff: "James Ortega",   originalComment: "Expired — pharmacy return needed.",   addComment: "" },
  { id: 12, program: "Mahoney House", status: "Pharmacy Transfer (Pending)", medication: "Zoloft", dose: "50mg", youth: "Gonzo Rizzo", date: "05/24/2026", amount: "12 tablets", disposalStaff: "Marcus Rivera", originalComment: "Discontinued by prescriber.", addComment: "" },
  { id: 13, program: "Mahoney House", status: "Pharmacy Transfer (Verified)", medication: "Clonidine", dose: "0.1mg", youth: "Kermit Frog", date: "05/18/2026", amount: "9 tablets", disposalStaff: "Tina Morales", originalComment: "Returned to pharmacy, receipt filed.", addComment: "" },
  { id: 14, program: "Mahoney House", status: "Med Cart", medication: "Ibuprofen", dose: "200mg", youth: "Fozzie Bear", date: "05/25/2026", amount: "20 tablets", disposalStaff: "Sarah Johnson", originalComment: "Bottle past expiration date.", addComment: "" },
  { id: 15, program: "Mahoney House", status: "Lockbox", medication: "Concerta", dose: "36mg", youth: "Animal Drummer", date: "05/26/2026", amount: "4 tablets", disposalStaff: "Marcus Rivera", originalComment: "Controlled — double-signed into lockbox.", addComment: "" },
  { id: 16, program: "Mahoney House", status: "Med Cart", medication: "Cetirizine", dose: "10mg", youth: "Kermit Frog", date: "05/27/2026", amount: "10 tablets", disposalStaff: "Elena Vasquez", originalComment: "Seasonal allergy course ended.", addComment: "" },
  { id: 17, program: "Mahoney House", status: "Pharmacy Transfer (Pending)", medication: "Abilify", dose: "5mg", youth: "Gonzo Rizzo", date: "05/27/2026", amount: "6 tablets", disposalStaff: "Tina Morales", originalComment: "Dose change — old strength returned.", addComment: "" },
  { id: 18, program: "Mahoney House", status: "Med Cart", medication: "Melatonin", dose: "3mg", youth: "Animal Drummer", date: "05/28/2026", amount: "15 tablets", disposalStaff: "Sarah Johnson", originalComment: "Youth transferred to another program.", addComment: "" },
  { id: 19, program: "Rydell House", status: "Med Cart", medication: "Lexapro", dose: "10mg", youth: "Rowlf Piano", date: "05/24/2026", amount: "8 tablets", disposalStaff: "Tina Morales", originalComment: "Prescription switched to generic.", addComment: "" },
  { id: 20, program: "Rydell House", status: "Lockbox", medication: "Vyvanse", dose: "30mg", youth: "Scooter Grosse", date: "05/25/2026", amount: "3 capsules", disposalStaff: "James Ortega", originalComment: "Controlled substance — awaiting count.", addComment: "" },
  { id: 21, program: "Rydell House", status: "Pharmacy Transfer (Verified)", medication: "Amoxicillin", dose: "500mg", youth: "Rowlf Piano", date: "05/19/2026", amount: "10 capsules", disposalStaff: "Tina Morales", originalComment: "Antibiotic course completed early.", addComment: "" },
  { id: 22, program: "Walsh Campus", status: "Lockbox", medication: "Adderall XR", dose: "10mg", youth: "Miss Piggy", date: "05/23/2026", amount: "6 capsules", disposalStaff: "Elena Vasquez", originalComment: "Controlled — youth discharged.", addComment: "" },
  { id: 23, program: "Walsh Campus", status: "Pharmacy Transfer (Pending)", medication: "Tylenol", dose: "325mg", youth: "Beaker Muppet", date: "05/26/2026", amount: "24 tablets", disposalStaff: "Elena Vasquez", originalComment: "Damaged packaging, unusable.", addComment: "" },
  { id: 24, program: "West Campus Program", status: "Med Cart", medication: "Guanfacine", dose: "1mg", youth: "Pepe Prawn", date: "05/24/2026", amount: "11 tablets", disposalStaff: "James Ortega", originalComment: "Prescriber discontinued medication.", addComment: "" },
  { id: 25, program: "West Campus Program", status: "Pharmacy Transfer (Verified)", medication: "Hydroxyzine", dose: "25mg", youth: "Rizzo Rat", date: "05/20/2026", amount: "18 tablets", disposalStaff: "James Ortega", originalComment: "Returned with pharmacy confirmation.", addComment: "" },
  { id: 26, program: "West Campus Program", status: "Lockbox", medication: "Focalin XR", dose: "15mg", youth: "Pepe Prawn", date: "05/27/2026", amount: "5 capsules", disposalStaff: "Marcus Rivera", originalComment: "Controlled — secured pending pickup.", addComment: "" },
];

// Design-system Badge variant per disposal status.
const STATUS_BADGE: Record<string, "info" | "warning" | "error" | "success"> = {
  "Med Cart":                     "info",
  "Lockbox":                      "warning",
  "Pharmacy Transfer (Pending)":  "error",
  "Pharmacy Transfer (Verified)": "success",
};

const PAGE_SIZE = 10;
const ROLE_OPTIONS: UserRole[] = ["Frontline Staff", "Therapist", "Program Manager", "Nurse"];
const STATUS_FILTER_OPTIONS = [
  "All statuses",
  "Med Cart",
  "Lockbox",
  "Pharmacy Transfer (Pending)",
  "Pharmacy Transfer (Verified)",
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  "Med Cart":                     { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Lockbox":                      { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
  "Pharmacy Transfer (Pending)":  { bg: "#FEF2F2", text: "#991B1B", border: "#FCA5A5" },
  "Pharmacy Transfer (Verified)": { bg: "#F0FDF4", text: "#14532D", border: "#86EFAC" },
};

type SortField = keyof Omit<DisposalRecord, "id" | "addComment">;

const COLUMNS: { key: SortField; label: string; width?: string }[] = [
  { key: "status",          label: "Status",           width: "190px" },
  { key: "medication",      label: "Medication",       width: "150px" },
  { key: "dose",            label: "Dose",             width: "90px"  },
  { key: "youth",           label: "Youth",            width: "140px" },
  { key: "date",            label: "Date",             width: "110px" },
  { key: "amount",          label: "Amount",           width: "110px" },
  { key: "disposalStaff",   label: "Disposal Staff",   width: "140px" },
  { key: "originalComment", label: "Original Comment", width: "200px" },
];

let _logId    = 100;
let _recordId = 1000;

function getTodayDate() {
  return formatMdy(new Date());
}

interface AddDisposalForm {
  date: string;
  youthId: string;
  medicationId: string;
  amount: string;
  comment: string;
}

const EMPTY_FORM: AddDisposalForm = {
  date: "",
  youthId: "",
  medicationId: "",
  amount: "",
  comment: "",
};

// ── Component ──────────────────────────────────────────────────────────────────

export function ManageDisposalView() {

  const location      = useLocation();
  const navigate      = useNavigate();
  const locState      = location.state as { fromProgramLog?: boolean; programName?: string } | null;
  const fromProgramLog = locState?.fromProgramLog ?? false;

  const [selectedProgram, setSelectedProgram] = useState<string>(() => locState?.programName ?? "Mahoney House");
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("Therapist");
  const [records,         setRecords]         = useState<DisposalRecord[]>(MOCK_RECORDS);
  const [savedRecords,    setSavedRecords]    = useState<DisposalRecord[]>(MOCK_RECORDS);
  const [stagedStatuses,  setStagedStatuses]  = useState<Record<number, string>>({});
  const [pendingComments, setPendingComments] = useState<Record<number, string>>({});
  const [statusFilter,    setStatusFilter]    = useState("All statuses");
  const [selectedIds,     setSelectedIds]     = useState<Set<number>>(new Set());
  const [massActionStatus,  setMassActionStatus]  = useState("");
  const [massActionComment, setMassActionComment] = useState("");
  const [sortField,       setSortField]       = useState<SortField | null>(null);
  const [sortDir,         setSortDir]         = useState<"asc" | "desc" | null>(null);
  const [showCancelDialog,  setShowCancelDialog]  = useState(false);
  const [logRecords,      setLogRecords]      = useState<LogRecord[]>([]);
  const [attestationRecords, setAttestationRecords] = useState<AttestationRecord[]>([]);
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const submitLock = useRef(false);
  const addSubmitLock = useRef(false);
  const [submitError, setSubmitError] = useState("");
  const [addAttempted, setAddAttempted] = useState(false);

  // Add Disposal modal state
  const [addModalOpen,         setAddModalOpen]         = useState(false);
  const [addForm,              setAddForm]              = useState<AddDisposalForm>({ ...EMPTY_FORM });
  const [showAddCancelConfirm, setShowAddCancelConfirm] = useState(false);

  // ── Add Disposal derived values ────────────────────────────────────────────

  const selectedYouth = MOCK_YOUTHS.find((y) => y.id === Number(addForm.youthId)) ?? null;
  const selectedMed   = selectedYouth?.medications.find((m) => m.id === Number(addForm.medicationId)) ?? null;

  const addDateValid = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/.test(addForm.date.trim());
  const addFormValid = addDateValid &&
    addForm.youthId           !== "" &&
    addForm.medicationId      !== "" &&
    addForm.amount.trim()     !== "" &&
    addForm.comment.trim()    !== "";

  // ── List derived values ────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!selectedProgram) return [];
    let rows = records.filter((r) => r.program === selectedProgram);
    if (statusFilter !== "All statuses") {
      rows = rows.filter((r) => (stagedStatuses[r.id] ?? r.status) === statusFilter);
    }
    if (sortField && sortDir) {
      rows = [...rows].sort((a, b) => {
        const cmp = String(a[sortField] ?? "").localeCompare(String(b[sortField] ?? ""));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [records, stagedStatuses, selectedProgram, statusFilter, sortField, sortDir]);

  const [page, setPage] = useState(1);
  // Opens by default until a Program is chosen (nothing shows without one).
  const [filtersOpen, setFiltersOpen] = useState(() => !selectedProgram);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const allSelected  = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id));
  const someSelected = filtered.some((r) => selectedIds.has(r.id));
  const hasPending   = Object.keys(stagedStatuses).length > 0 || Object.keys(pendingComments).length > 0;

  const availableStatuses = useMemo(() => {
    const roleAllowed = ROLE_ALLOWED_STATUSES[currentUserRole];
    if (!roleAllowed.length) return [];
    const selected = records.filter((r) => selectedIds.has(r.id));
    if (!selected.length) return roleAllowed;
    const maxOrder = Math.max(
      ...selected.map((r) => STATUS_ORDER[stagedStatuses[r.id] ?? r.status] ?? 0)
    );
    return roleAllowed.filter((s) => STATUS_ORDER[s] > maxOrder);
  }, [records, selectedIds, currentUserRole, stagedStatuses]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function toggleAll() {
    if (allSelected) {
      setSelectedIds((prev) => { const n = new Set(prev); filtered.forEach((r) => n.delete(r.id)); return n; });
    } else {
      setSelectedIds((prev) => { const n = new Set(prev); filtered.forEach((r) => n.add(r.id)); return n; });
    }
  }

  function toggleRow(id: number) {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function handleSort(field: SortField) {
    if (sortField !== field) { setSortField(field); setSortDir("asc"); return; }
    if (sortDir === "asc")   { setSortDir("desc"); return; }
    setSortField(null); setSortDir(null);
  }

  function applyMassAction() {
    if (!massActionStatus) return;
    const backward = records.filter((r) => {
      if (!selectedIds.has(r.id)) return false;
      return STATUS_ORDER[massActionStatus] <= STATUS_ORDER[stagedStatuses[r.id] ?? r.status];
    });
    if (backward.length) {
      toast.error("Backward status changes are not permitted.");
      return;
    }
    setStagedStatuses((prev) => {
      const n = { ...prev };
      selectedIds.forEach((id) => { n[id] = massActionStatus; });
      return n;
    });
    if (massActionComment.trim()) {
      setPendingComments((prev) => {
        const n = { ...prev };
        selectedIds.forEach((id) => {
          const rec = records.find((r) => r.id === id);
          const existing = prev[id] ?? rec?.addComment ?? "";
          n[id] = existing ? `${existing} ${massActionComment.trim()}` : massActionComment.trim();
        });
        return n;
      });
    }
    setSelectedIds(new Set());
    setMassActionStatus("");
    setMassActionComment("");
  }

  function handleSubmit() {
    if (submitLock.current) return;
    if (!hasPending) {
      setSubmitError("There are no staged status changes or comments to submit.");
      return;
    }
    submitLock.current = true;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const now = new Date();
      const dateFmt = formatMdy(now);
      const timeFmt = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const attestationDate = `${dateFmt} ${timeFmt}`;
      const actingUser = getDemoUserName();

      const newLogs: LogRecord[] = records
        .filter((r) => stagedStatuses[r.id])
        .map((r) => ({
          id:               ++_logId,
          date:             dateFmt,
          logType:          stagedStatuses[r.id],
          medicationId:     r.id,
          medication:       r.medication,
          dose:             r.dose,
          youth:            r.youth,
          attestationDate,
          attestationStaff: actingUser,
          attestationText:  ATTESTATION_TEXT,
          count:            r.amount,
          comments:         pendingComments[r.id] ?? r.addComment,
        }));

      const updatedCount = newLogs.length;
      const committed = records.map((r) => ({
        ...r,
        status:     (stagedStatuses[r.id] as DisposalStatus | undefined) ?? r.status,
        addComment: pendingComments[r.id] ?? r.addComment,
      }));

      setRecords(committed);
      setSavedRecords(committed);
      setLogRecords((prev) => [...newLogs, ...prev]);
      if (newLogs.length > 0) {
        setAttestationRecords((prev) => [
          { id: ++_logId, date: dateFmt, attestationDate, attestationText: ATTESTATION_TEXT, attestationStaff: actingUser },
          ...prev,
        ]);
      }
      setStagedStatuses({});
      setPendingComments({});
      setSelectedIds(new Set());

      toast.success(
        updatedCount > 0
          ? `${updatedCount} record${updatedCount !== 1 ? "s" : ""} successfully updated.`
          : "Changes saved successfully."
      );
    } catch {
      setSubmitError("Changes could not be saved. Your staged changes were kept; please try again.");
      toast.error("Changes could not be saved.");
    } finally {
      setTimeout(() => { submitLock.current = false; }, 400);
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    if (hasPending) setShowCancelDialog(true);
  }

  function confirmCancel() {
    setRecords(savedRecords);
    setStagedStatuses({});
    setPendingComments({});
    setSelectedIds(new Set());
    setMassActionStatus("");
    setMassActionComment("");
    setShowCancelDialog(false);
  }

  // ── Add Disposal handlers ──────────────────────────────────────────────────

  function openAddModal() {
    setAddForm({ ...EMPTY_FORM, date: getTodayDate() });
    setAddAttempted(false);
    setAddModalOpen(true);
  }

  function handleAddFormChange(patch: Partial<AddDisposalForm>) {
    setAddForm((prev) => {
      const next = { ...prev, ...patch };
      if (patch.youthId !== undefined) { next.medicationId = ""; next.amount = ""; }
      if (patch.medicationId !== undefined) { next.amount = ""; }
      return next;
    });
  }

  function handleAddSubmit() {
    if (addSubmitLock.current) return;
    setAddAttempted(true);
    if (!addFormValid || !selectedYouth || !selectedMed) return;
    addSubmitLock.current = true;
    try {
      const now = new Date();
      const dateFmt = formatMdy(now);
      const timeFmt = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const attestationDate = `${dateFmt} ${timeFmt}`;
      const actingUser = getDemoUserName();

      const disposalLog: LogRecord = {
        id: ++_logId, logType: "Disposal", date: addForm.date,
        medicationId: selectedMed.id, medication: selectedMed.name, dose: selectedMed.dose,
        youth: selectedYouth.name, countType: selectedMed.countType, count: addForm.amount,
        comments: addForm.comment, attestationDate, attestationText: ATTESTATION_TEXT,
        attestationStaff: actingUser, enteredInError: false,
      };
      const attestation: AttestationRecord = {
        id: ++_logId, date: dateFmt, attestationDate,
        attestationText: ATTESTATION_TEXT, attestationStaff: actingUser,
      };

      const newRecord: DisposalRecord = {
        id:              ++_recordId,
        program:         selectedProgram,
        status:          "Med Cart",
        medication:      selectedMed.name,
        dose:            selectedMed.dose,
        youth:           selectedYouth.name,
        date:            addForm.date,
        amount:          addForm.amount,
        disposalStaff:   actingUser,
        originalComment: addForm.comment,
        addComment:      "",
      };

      const updated = [newRecord, ...records];
      setRecords(updated);
      setSavedRecords(updated);
      setLogRecords((prev) => [disposalLog, ...prev]);
      setAttestationRecords((prev) => [attestation, ...prev]);
      setAddModalOpen(false);
      setAddAttempted(false);
      setAddForm({ ...EMPTY_FORM, date: getTodayDate() });

      toast.success("Disposal record created and added to Med Cart.");
    } catch {
      toast.error("Disposal record could not be created. Your entries were kept.");
    } finally {
      setTimeout(() => { addSubmitLock.current = false; }, 400);
    }
  }

  function handleAddXClick() {
    const hasInput =
      addForm.youthId      !== "" ||
      addForm.medicationId !== "" ||
      addForm.amount       !== "" ||
      addForm.comment.trim() !== "";
    if (hasInput) {
      setShowAddCancelConfirm(true);
    } else {
      setAddModalOpen(false);
    }
  }

  function confirmAddCancel() {
    setShowAddCancelConfirm(false);
    setAddAttempted(false);
    setAddModalOpen(false);
    setAddForm({ ...EMPTY_FORM, date: getTodayDate() });
  }

  function changeRole(role: UserRole) {
    setCurrentUserRole(role);
    setSelectedIds(new Set());
    setMassActionStatus("");
    setSelectedProgram((prev) => {
      const accessible = MOCK_PROGRAMS.filter((p) => p.roles.includes(role)).map((p) => p.name);
      return accessible.includes(prev) ? prev : "";
    });
  }

  const roleSelect = (
    <Select value={currentUserRole} onValueChange={(v) => changeRole(v as UserRole)}>
      <SelectTrigger size="default" className="w-36 flex-none" aria-label="Viewing as">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLE_OPTIONS.map((r) => (
          <SelectItem key={r} value={r}>{r}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronsUpDown className="w-3 h-3 ml-1 opacity-40" />;
    return sortDir === "asc"
      ? <ChevronUp   className="w-3 h-3 ml-1" style={{ color: "#145F33" }} />
      : <ChevronDown className="w-3 h-3 ml-1" style={{ color: "#145F33" }} />;
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    // pb-14 clears the fixed 40px UtilityBar so the submit bar stays visible and clickable
    <div className="flex flex-col h-full overflow-auto px-6 pt-4 pb-14">
      <Card variant="container" className="shrink-0">
        {/* ── Card header: title + count (left), actions (right) ─────────────── */}
        <CardHeader
          size="sm"
          separated
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 min-w-0"
        >
          <div className="flex items-center gap-2 min-w-0">
            {fromProgramLog && (
              <>
              <Button
                onClick={() => navigate(-1)}
                className="h-8 px-4 rounded-full flex items-center gap-2 slds-text-4 font-medium"
                style={{
                  backgroundColor: "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                  border: "1px solid var(--slds-g-color-border-base-1)",
                }}
                aria-label="Return to Overview"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Overview
              </Button>
              <div className="h-6 w-px mx-1" style={{ backgroundColor: "var(--slds-g-color-border-base-1)" }} />
              </>
            )}
            <h1 className="slds-text-5 font-semibold m-0 text-[var(--slds-g-color-text-default)]">
              {fromProgramLog ? "Manage Disposal" : "Disposal Records"}
            </h1>
            <Badge variant="success">{filtered.length}</Badge>
            {selectedIds.size > 0 && (
              <span className="slds-text-3 text-[var(--slds-g-color-text-weak)]">· {selectedIds.size} selected</span>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Refresh"
                onClick={() => {
                  // Sample data lives in page state (no data source to re-fetch):
                  // refresh clears the selection and returns to page 1. Unsaved
                  // status changes and comments are kept.
                  setSelectedIds(new Set());
                  setMassActionStatus("");
                  setPage(1);
                }}
              >
                <RefreshCw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
          <Button
            type="button"
            variant="outline"
            aria-expanded={filtersOpen}
            aria-controls="disposal-filter-panel"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            <Filter /> Filters
            {filtersOpen ? <ChevronUp /> : <ChevronDown />}
          </Button>
          <Button
            type="button"
            className="px-5 has-[>svg]:px-5"
            onClick={openAddModal}
          >
            <Plus />
            Add Disposal
          </Button>
          </div>
        </CardHeader>
        {filtersOpen && (
          <div id="disposal-filter-panel" className="flex flex-wrap items-end justify-start gap-x-3 gap-y-2 px-4 py-3 bg-[var(--slds-g-color-background-alt)]" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>

          {!fromProgramLog && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="disposal-program" className="slds-form-label whitespace-nowrap text-[var(--slds-g-color-text-weak)]">Program</label>
              <Select
                  value={selectedProgram || undefined}
                  onValueChange={(v) => {
                    setSelectedProgram(v);
                    setSelectedIds(new Set());
                    setStagedStatuses({});
                    setPendingComments({});
                    setMassActionStatus("");
                    setStatusFilter("All statuses");
                    setPage(1);
                  }}
                >
                  <SelectTrigger id="disposal-program" size="default" className="w-48 flex-none">
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_PROGRAMS.filter((p) => p.roles.includes(currentUserRole)).map((p) => (
                      <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <span className="slds-form-label whitespace-nowrap text-[var(--slds-g-color-text-weak)]">Viewing as</span>
            {roleSelect}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="disposal-status" className="slds-form-label whitespace-nowrap text-[var(--slds-g-color-text-weak)]">Status</label>
            <Select
            value={statusFilter}
            onValueChange={(v) => { setStatusFilter(v); setSelectedIds(new Set()); setPage(1); }}
          >
            <SelectTrigger id="disposal-status" size="default" className="w-56 flex-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
            <Button
              type="button"
              variant="outline-primary"
              disabled={!selectedProgram && statusFilter === "All statuses"}
              onClick={() => {
                setSelectedProgram("");
                setStatusFilter("All statuses");
                setSelectedIds(new Set());
                setStagedStatuses({});
                setPendingComments({});
                setMassActionStatus("");
                setPage(1);
              }}
            >
              Clear
            </Button>
          </div>
        )}


        {/* ── Filters (collapsible) ─────────────────────────────────────────── */}

        {someSelected && (
          <div
            className="flex flex-wrap items-center gap-3 px-6 py-2.5"
            style={{ backgroundColor: "#EFF6FF", borderTop: "1px solid #BFDBFE" }}
          >
            <span className="slds-text-4 font-semibold flex-shrink-0" style={{ color: "#1D4ED8" }}>
              {selectedIds.size} row{selectedIds.size !== 1 ? "s" : ""} selected
            </span>
            {currentUserRole === "Frontline Staff" ? (
              <div className="flex items-center gap-2 slds-text-4" style={{ color: "#92400E" }}>
                <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                Frontline staff cannot change disposal status. Contact a Therapist, Program Manager, or Nurse.
              </div>
            ) : availableStatuses.length === 0 ? (
              <span className="slds-text-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
                No valid forward status transitions available for the selected records.
              </span>
            ) : (
              <>
                <Select value={massActionStatus || undefined} onValueChange={setMassActionStatus}>
                  <SelectTrigger size="default" className="w-64 flex-shrink-0" aria-label="Update status">
                    <SelectValue placeholder="Update status to…" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStatuses.map((st) => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                  </SelectContent>
                </Select>
                <input
                  type="text"
                  value={massActionComment}
                  onChange={(e) => setMassActionComment(e.target.value)}
                  placeholder="Add comment to all selected rows… (optional)"
                  className="h-8 px-3 rounded slds-text-4 flex-1 min-w-[200px]"
                  style={{ border: "1px solid #BFDBFE", backgroundColor: "white", color: "var(--slds-g-color-text-default)", outline: "none" }}
                  aria-label="Mass action comment"
                />
                <Button
                  onClick={applyMassAction}
                  disabled={!massActionStatus}
                  className="h-8 rounded-full px-4 slds-text-4 font-semibold flex-shrink-0"
                  style={{
                    backgroundColor: massActionStatus ? "#145F33" : "var(--slds-g-color-neutral-95)",
                    color: massActionStatus ? "white" : "var(--slds-g-color-text-weak)",
                    border: "none",
                  }}
                >
                  Apply
                </Button>
              </>
            )}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="slds-text-4 underline ml-auto flex-shrink-0"
              style={{ color: "#1D4ED8", background: "none", border: "none", cursor: "pointer" }}
            >
              Clear selection
            </button>
          </div>
        )}

        {/* ── List View (Design System Data Table) ─────────────────────────────── */}
          <Table style={{ minWidth: "1200px" }}>
            <TableHeader className="sticky top-0 z-10">
              <TableRow hoverable={false}>
                <TableHead variant="slds" className="w-11">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={toggleAll}
                    aria-label="Select all rows"
                  />
                </TableHead>
                {COLUMNS.map(({ key, label, width }) => (
                  <TableHead
                    key={key}
                    variant="slds"
                    active={sortField === key}
                    aria-sort={sortField === key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                    style={{ width, minWidth: width }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(key)}
                      className="inline-flex items-center uppercase [font-size:inherit] [font-weight:inherit] [letter-spacing:inherit]"
                    >
                      {label}
                      <SortIcon field={key} />
                    </button>
                  </TableHead>
                ))}
                <TableHead variant="slds" style={{ minWidth: "220px" }}>Add Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow hoverable={false}>
                  <TableCell colSpan={10} wrap className="px-6 py-16 text-center">
                    {!selectedProgram ? (
                      <>
                        <p className="slds-text-4 font-medium mb-1 text-[var(--slds-g-color-text-default)]">Select a program</p>
                        <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                          Choose a program under Filters to view its disposal records.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="slds-text-4 font-medium mb-1 text-[var(--slds-g-color-text-default)]">No disposal records</p>
                        <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                          {statusFilter === "All statuses"
                            ? "No active disposal records for this program."
                            : `No records with status "${statusFilter}".`}
                        </p>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ) : pageRows.map((record) => {
                const displayStatus  = stagedStatuses[record.id] ?? record.status;
                const isSelected     = selectedIds.has(record.id);
                const isStaged       = !!stagedStatuses[record.id];
                const displayComment = pendingComments[record.id] ?? record.addComment;

                return (
                  <TableRow
                    key={record.id}
                    data-state={isSelected ? "selected" : undefined}
                    className="slds-text-4"
                  >
                    <TableCell className="px-4 py-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleRow(record.id)}
                        aria-label={`Select ${record.youth}`}
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant={STATUS_BADGE[displayStatus] ?? "info"} bordered>
                          {displayStatus}
                        </Badge>
                        {isStaged && (
                          <span className="slds-text-3 italic text-[#92400E]">pending</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-medium">{record.medication}</TableCell>
                    <TableCell className="px-4 py-3">{record.dose}</TableCell>
                    <TableCell className="px-4 py-3">{record.youth}</TableCell>
                    <TableCell className="px-4 py-3">{record.date}</TableCell>
                    <TableCell className="px-4 py-3">{record.amount}</TableCell>
                    <TableCell className="px-4 py-3">{record.disposalStaff}</TableCell>
                    <TableCell wrap className="px-4 py-3 slds-text-3 text-[var(--slds-g-color-text-weak)] max-w-[200px]">
                      <span title={record.originalComment} className="line-clamp-2">{record.originalComment}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 min-w-[220px]">
                      <Input
                        size="sm"
                        value={displayComment}
                        onChange={(e) => setPendingComments((prev) => ({ ...prev, [record.id]: e.target.value }))}
                        placeholder="Add comment… (optional)"
                        aria-label={`Add comment for ${record.medication}`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <CardFooter size="sm" separated>
            <TablePaginationBar
              className="w-full"
              start={filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}
              end={Math.min(safePage * PAGE_SIZE, filtered.length)}
              total={filtered.length}
              countLabel="records"
              currentPage={safePage}
              totalPages={totalPages}
              onPrevious={() => setPage(safePage - 1)}
              onNext={() => setPage(safePage + 1)}
            />
          </CardFooter>

        {/* ── Disposal Log + Attestation records (session) ─────────────────────── */}
        {logRecords.length > 0 && (
        <div
          className="flex-shrink-0 overflow-auto"
          style={{ maxHeight: "200px", borderTop: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)" }}
          role="region"
          aria-label="Disposal log"
        >
          <div className="flex items-center gap-2 px-6 py-2">
            <Lock className="w-3.5 h-3.5" style={{ color: "var(--slds-g-color-text-weak)" }} />
            <span className="slds-text-4 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              Disposal log ({logRecords.length})
            </span>
            <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
              Read-only entries from this session · {attestationRecords.length} attestation{attestationRecords.length !== 1 ? "s" : ""} recorded
            </span>
          </div>
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--slds-g-color-background-alt)" }}>
                {["Log type", "Medication", "Youth", "Count", "Comments", "Attested by", "Attested at"].map((h) => (
                  <th key={h} className="px-4 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--slds-g-color-text-weak)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logRecords.map((l) => (
                <tr key={l.id} style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                  <td className="px-4 py-1.5 slds-text-3">{l.logType}</td>
                  <td className="px-4 py-1.5 slds-text-3">{l.medication} {l.dose}</td>
                  <td className="px-4 py-1.5 slds-text-3">{l.youth}</td>
                  <td className="px-4 py-1.5 slds-text-3">{l.count}</td>
                  <td className="px-4 py-1.5 slds-text-3">{l.comments || "—"}</td>
                  <td className="px-4 py-1.5 slds-text-3">{l.attestationStaff}</td>
                  <td className="px-4 py-1.5 slds-text-3">{l.attestationDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

        {/* ── Attestation + Submit Bar ───────────────────────────────────────────── */}
        <div
          className="flex flex-wrap items-center justify-end gap-3 px-4 py-3"
          style={{ backgroundColor: "var(--slds-g-color-background-alt)", borderTop: "1px solid var(--slds-g-color-border-base-1)" }}
        >
        {submitError && (
          <p role="alert" className="m-0 slds-text-3 font-medium" style={{ color: "#c23934" }}>{submitError}</p>
        )}
        <p className="m-0 text-[12px] text-right italic font-medium">
          {ATTESTATION_TEXT}
        </p>
        <Button
          onClick={handleCancel}
          className="h-8 rounded-full px-5 slds-text-4 font-semibold flex-shrink-0"
          style={{ backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)", border: "1px solid var(--slds-g-color-border-base-1)" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="h-8 rounded-full px-5 slds-text-4 font-semibold flex-shrink-0"
          style={{ backgroundColor: "#145F33", color: "white", border: "none" }}
        >
          {isSubmitting ? "Submitting…" : "Submit"}
        </Button>
        </div>
      </Card>

      {/* ── Cancel Confirmation Dialog ─────────────────────────────────────────── */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-sm" aria-describedby="cancel-dialog-desc">
          <DialogHeader>
            <DialogTitle>Are you sure you want to cancel?</DialogTitle>
            <DialogDescription id="cancel-dialog-desc">
              All unsaved changes — including staged status updates and comments — will be cleared and the screen will reset to its last saved state.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setShowCancelDialog(false)}
              className="h-9 rounded-full px-5 slds-text-4 font-semibold"
              style={{ backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)", border: "1px solid var(--slds-g-color-border-base-1)" }}
            >
              No, go back
            </Button>
            <Button
              onClick={confirmCancel}
              className="h-9 rounded-full px-5 slds-text-4 font-semibold"
              style={{ backgroundColor: "#c23934", color: "white", border: "none" }}
            >
              Yes, cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Disposal Modal ─────────────────────────────────────────────────── */}
      <Dialog open={addModalOpen} onOpenChange={() => handleAddXClick()}>
        <DialogContent
          className="flex flex-col max-w-xl w-[calc(100vw-2rem)]"
          size="md"
          aria-describedby="add-disposal-desc"
        >
          <DialogHeader
            className="flex-shrink-0 pb-3"
            style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
          >
            <DialogTitle className="slds-text-6 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              Add Disposal
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable form body */}
          <DialogBody className="space-y-6">
          <div className="flex-1 overflow-y-auto min-h-0">

            {/* Instructional text */}
            <div
              className="flex gap-2.5 rounded-md px-4 py-3"
              style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}
              id="add-disposal-desc"
            >
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#1D4ED8" }} />
              <div className="space-y-1" style={{ color: "#1E40AF" }}>
                <p className="slds-text-4 mb-0">
                  Write the following info on coin envelope for disposal: <strong>DISCARD</strong>, staff initials, date, medication name, doses, and youth.
                </p>
                <p className="slds-text-4 mb-0">
                  Please remember to notify a Med Admin that medications are in the disposal drawer.
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label htmlFor="add-date" className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                Date <span className="text-red-600">*</span>
              </label>
              <DateInput
                id="add-date"
                required
                value={addForm.date}
                onChange={(v) => handleAddFormChange({ date: v })}
                aria-invalid={addAttempted && !addDateValid}
                aria-describedby={addAttempted && !addDateValid ? "add-date-err" : undefined}
              />
              {addAttempted && !addDateValid && (
                <p id="add-date-err" role="alert" className="slds-text-3 mt-0.5" style={{ color: "#c23934" }}>Enter a date as MM/DD/YYYY.</p>
              )}
            </div>

            {/* Youth */}
            <div className="space-y-1.5">
              <label htmlFor="add-youth" className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                Youth <span className="text-red-600">*</span>
              </label>
              <Select
                value={addForm.youthId ? String(addForm.youthId) : undefined}
                onValueChange={(v) => handleAddFormChange({ youthId: v })}
              >
                <SelectTrigger
                  id="add-youth"
                  aria-invalid={addAttempted && addForm.youthId === "" ? true : undefined}
                  aria-describedby={addAttempted && addForm.youthId === "" ? "add-youth-err" : undefined}
                >
                  <SelectValue placeholder="Select youth…" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_YOUTHS.map((y) => (
                    <SelectItem key={y.id} value={String(y.id)}>{y.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {addAttempted && addForm.youthId === "" && (
                <p id="add-youth-err" role="alert" className="slds-text-3 mt-0.5" style={{ color: "#c23934" }}>Select a youth.</p>
              )}
            </div>

            {/* Medication */}
            <div className="space-y-1.5">
              <label htmlFor="add-medication" className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                Medication <span className="text-red-600">*</span>
              </label>
              <Select
                value={addForm.medicationId ? String(addForm.medicationId) : undefined}
                onValueChange={(v) => handleAddFormChange({ medicationId: v })}
                disabled={!selectedYouth}
              >
                <SelectTrigger
                  id="add-medication"
                  aria-invalid={addAttempted && addForm.medicationId === "" ? true : undefined}
                  aria-describedby={addAttempted && addForm.medicationId === "" ? "add-medication-err" : undefined}
                >
                  <SelectValue placeholder={selectedYouth ? "Select medication…" : "Select a youth first"} />
                </SelectTrigger>
                <SelectContent>
                  {selectedYouth?.medications.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>{m.name} — {m.dosePeriod}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {addAttempted && addForm.medicationId === "" && (
                <p id="add-medication-err" role="alert" className="slds-text-3 mt-0.5" style={{ color: "#c23934" }}>Select a medication.</p>
              )}
              {selectedMed && (
                <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  Dose: {selectedMed.dose} &nbsp;·&nbsp; Count Type: {selectedMed.countType}
                </p>
              )}
            </div>

            {/* Amount Disposed */}
            <div className="space-y-1.5">
              <label htmlFor="add-amount" className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                Amount Disposed <span className="text-red-600">*</span>
              </label>
              {!selectedMed ? (
                <input
                  id="add-amount"
                  type="text"
                  disabled
                  placeholder="Select a medication first"
                  className="w-full h-9 px-3 rounded slds-text-4"
                  style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-neutral-95)", color: "var(--slds-g-color-text-weak)", cursor: "not-allowed" }}
                />
              ) : selectedMed.countType === "Units" ? (
                <input
                  id="add-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={addForm.amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d{0,3}(\.\d{0,2})?$/.test(val)) {
                      handleAddFormChange({ amount: val });
                    }
                  }}
                  placeholder="0.00"
                  className="w-full h-9 px-3 rounded slds-text-4 outline-none"
                  style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
                />
              ) : (
                <Select
                  value={addForm.amount || undefined}
                  onValueChange={(v) => handleAddFormChange({ amount: v })}
                >
                  <SelectTrigger id="add-amount">
                    <SelectValue placeholder="Select amount…" />
                  </SelectTrigger>
                  <SelectContent>
                    {VOLUME_OPTIONS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              {addAttempted && addForm.amount.trim() === "" && (
                <p id="add-amount-err" role="alert" className="slds-text-3 mt-0.5" style={{ color: "#c23934" }}>Enter the amount disposed.</p>
              )}
            </div>

            {/* Comments */}
            <div className="space-y-1.5">
              <label htmlFor="add-comment" className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                Comments <span className="text-red-600">*</span>
              </label>
              <textarea
                id="add-comment"
                value={addForm.comment}
                onChange={(e) => handleAddFormChange({ comment: e.target.value })}
                placeholder="Enter reason for disposal…"
                rows={3}
                className="w-full px-3 py-2 rounded slds-text-4 outline-none resize-none"
                style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
              />

              {addAttempted && addForm.comment.trim() === "" && (
                <p id="add-comment-err" role="alert" className="slds-text-3 mt-0.5" style={{ color: "#c23934" }}>Enter a reason for disposal.</p>
              )}
              <p className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
                This comment will appear as a read-only Original Comment on the Manage Disposal screen and cannot be edited at any subsequent stage.
              </p>
            </div>
          </div>
          </DialogBody>
          {/* Attestation + Submit — right-aligned italic text adjacent to Submit, matches SYD */}
          <DialogFooter className="w-full px-6 py-3">
                {/* Attestation */}
                <p className="m-0 text-[12px] text-right italic font-medium"
                >
                  {ATTESTATION_TEXT}
                </p>
            
                {/* Submit */}
                <Button
                  onClick={handleAddSubmit}
                  className="h-8 rounded-full px-5 slds-text-4 font-semibold flex-shrink-0"
                  style={{ backgroundColor: "#145F33", color: "white", border: "none" }}
                >
                  Submit
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Disposal X Confirmation ────────────────────────────────────────── */}
      <Dialog open={showAddCancelConfirm} onOpenChange={setShowAddCancelConfirm}>
        <DialogContent className="max-w-sm" aria-describedby="add-cancel-desc">
          <DialogHeader>
            <DialogTitle>Are you sure you want to cancel?</DialogTitle>
            <DialogDescription id="add-cancel-desc">
              All pending inputs will be cleared and the modal will close.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setShowAddCancelConfirm(false)}
              className="h-9 rounded-full px-5 slds-text-4 font-semibold"
              style={{ backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)", border: "1px solid var(--slds-g-color-border-base-1)" }}
            >
              No, go back
            </Button>
            <Button
              onClick={confirmAddCancel}
              className="h-9 rounded-full px-5 slds-text-4 font-semibold"
              style={{ backgroundColor: "#c23934", color: "white", border: "none" }}
            >
              Yes, cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
