import { useState, useMemo } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Copy,
  Trash2,
  ChevronDown,
  ChevronRight,
  Search,
  AlertCircle,
  Upload,
  FileText,
  X,
  Lock,
  Info,
  ExternalLink,
} from "@/app/lib/lucide-icons";
import { DateInput } from "../ui/date-input";
import { TimeInput } from "../ui/time-input";
import { Button } from "../ui/button";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "../ui/alert";
import { cn } from "../../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogBody,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { formatMdy } from "../../lib/dateFormat";
import { getDemoUserName } from "../../lib/demoIdentity";

// Medication type
interface Medication {
  id: number;
  name: string;
  genericName: string;
  requiresDescriptor: boolean;
  packages: string[];
  countType: "Unit" | "Volume";
}

// Medication Consent interface — 1:many (one consent : many dose period records)
interface MedicationConsent {
  id: number;
  medicationRecordIds: number[]; // AC1: 1:many — one consent covers multiple dose period records
  status: "Draft" | "Sent" | "Executed" | "Expired";
  executedDate?: string;
  startDate?: string;
  endDate?: string;
  initialCount?: string; // Read-only once Executed (AC8)
  uploadedFileName?: string;
  uploadedFileUrl?: string;
  docusignEnvelopeId?: string; // Reserved for future DocuSign integration
  docusignStatus?: string;
  createdDate: string;
  createdBy: string;
}

// AC7: Count Log entry stamped with user + timestamp
interface CountLogEntry {
  id: number;
  consentId: number;
  medicationRecordId: number;
  medicationName: string;
  dosingPeriod: string;
  count: string;
  submittedBy: string;
  timestamp: string;
}

// Medication Record type (extended)
interface MedicationRecord {
  id: number;
  medicationId: number;
  medicationName: string;
  medicationType:
    "Prescribed" | "Non-Prescribed (Supplemental OTC)"; // AC3, AC4
  descriptor?: string;
  genericName: string;
  packaging: string;
  dose: string;
  startDate: string;
  endDate?: string;
  // AC16: consentReceived field removed — replaced by consentId pointing to shared consent record
  dosingPeriod: string;
  notTakenDaily: boolean;
  weeklyPattern?: string[];
  monthlyPatternType?: "day" | "weekday";
  monthlyDay?: number;
  monthlyWeeks?: number;
  monthlyOrdinal?: string;
  monthlyWeekday?: string;
  monthlyMonths?: number;
  allDay: boolean;
  doseRangeStartTime?: string;
  doseRangeEndTime?: string;
  treatmentPurpose?: string;
  minHoursBetweenDoses?: number;
  maxDailyDoses?: number;
  countType: "Unit" | "Volume";
  count: string;
  instructions?: string;
  status: "active" | "inactive";
  consentId?: number; // Points to a shared MedicationConsent (1:many — multiple dose period records share one consent)
}

// Consent form type
interface ConsentForm {
  youthId: number;
  medicationId: number;
  dateReceived: string;
  active: boolean;
}

// Dispensation type
interface Dispensation {
  id: number;
  youthId: number;
  medicationId: number;
  date: string;
}

// Medication Pack type
interface MedicationPack {
  id: number;
  youthId: number;
  medicationId: number;
  endDate: string;
  active: boolean;
}

// Dose period order for sorting
const dosePeriodOrder: { [key: string]: number } = {
  Morning: 1,
  Afternoon: 2,
  Evening: 3,
  Bedtime: 4,
  PRN: 5,
};

/** SLDS 2 read-only textarea — multi-line variant for locked text fields. */
function ReadOnlyTextarea({
  label,
  value,
  tooltip,
}: {
  label: string;
  value?: string | null;
  tooltip?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="slds-form-label flex items-center gap-1"
        style={{ color: "var(--slds-g-color-text-weak)" }}
      >
        {label}
        <Lock className="h-2.5 w-2.5 opacity-50" />
      </label>
      <div
        className="min-h-[72px] flex items-start px-3 py-2 rounded-md slds-text-4"
        style={{
          backgroundColor: "var(--slds-g-color-background-alt)",
          border: "1px solid var(--slds-g-color-border-base-1)",
          color: value
            ? "var(--slds-g-color-text-default)"
            : "var(--slds-g-color-text-weak)",
          cursor: "not-allowed",
          whiteSpace: "pre-wrap",
        }}
        title={
          tooltip ??
          "This field is locked for active medication records"
        }
      >
        {value || <span className="italic">—</span>}
      </div>
    </div>
  );
}

/** SLDS 2 read-only field — used for locked fields on active medication records. */
function ReadOnlyField({
  label,
  value,
  tooltip,
}: {
  label: string;
  value?: string | null;
  tooltip?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <label
          className="slds-form-label flex items-center gap-1"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          {label}
          <Lock className="h-2.5 w-2.5 opacity-50" />
        </label>
      </div>
      <div
        className="h-9 flex items-center px-3 rounded-md slds-text-4"
        style={{
          backgroundColor: "var(--slds-g-color-background-alt)",
          border: "1px solid var(--slds-g-color-border-base-1)",
          color: value
            ? "var(--slds-g-color-text-default)"
            : "var(--slds-g-color-text-weak)",
          cursor: "not-allowed",
        }}
        title={
          tooltip ??
          "This field is locked for active medication records"
        }
      >
        {value || (
          <span
            className="italic"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            —
          </span>
        )}
      </div>
    </div>
  );
}

export function MedicationsView() {
  const [activeTab, setActiveTab] = useState<
    "current" | "pending" | "archived"
  >("current");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(
    new Set(),
  );
  const [selectedMedications, setSelectedMedications] =
    useState<number[]>([]);

  // ── Role-based access ─────────────────────────────────────────────────────
  // In production this would come from the auth context / user session.
  // This selector is for demo/prototype purposes only.
  const [currentUserRole, setCurrentUserRole] = useState<
    | "System Admin"
    | "Program Therapist"
    | "Program Manager"
    | "Standard Staff"
  >("Standard Staff");
  const DELETE_ALLOWED_ROLES = [
    "System Admin",
    "Program Therapist",
    "Program Manager",
  ] as const;
  const userCanDelete = (
    DELETE_ALLOWED_ROLES as readonly string[]
  ).includes(currentUserRole);

  // ── Active-record field-level locking ─────────────────────────────────────
  /** Roles that can edit limited fields (Instructions, Dose Range times, End Date after initial entry). */
  const ELEVATED_ROLES = [
    "System Admin",
    "Program Therapist",
    "Program Manager",
  ] as const;
  const userIsElevated = (
    ELEVATED_ROLES as readonly string[]
  ).includes(currentUserRole);

  /**
   * Returns whether a field is editable for the current user on an active record.
   * "endDate"         — all roles if no end date yet; elevated roles only if already set.
   * "instructions"    — elevated roles only.
   * "doseRangeStart"  — elevated roles only.
   * "doseRangeEnd"    — elevated roles only.
   * everything else   — locked for all roles.
   */
  const canEditField = (
    field:
      | "endDate"
      | "instructions"
      | "doseRangeStart"
      | "doseRangeEnd"
      | "other",
    med: MedicationRecord | null,
  ): boolean => {
    if (!med || !isActiveMedicationRecord(med)) return true; // non-active records always editable
    if (field === "endDate") {
      if (!med.endDate) return true; // no end date yet → any staff can set it
      return userIsElevated; // already set → elevated roles only
    }
    if (
      field === "instructions" ||
      field === "doseRangeStart" ||
      field === "doseRangeEnd"
    ) {
      return userIsElevated;
    }
    return false; // all other fields locked on active records
  };

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] =
    useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);
  // Pending-delete workflow dialogs
  const [deleteValidationError, setDeleteValidationError] =
    useState<string | null>(null);
  const [
    deleteNoConsentWarningOpen,
    setDeleteNoConsentWarningOpen,
  ] = useState(false);
  const [deletePendingMed, setDeletePendingMed] =
    useState<MedicationRecord | null>(null);
  // Audit log (AC11)
  const [deletionAuditLog, setDeletionAuditLog] = useState<
    {
      user: string;
      role: string;
      action: string;
      medicationRecordId: number;
      medicationName: string;
      consentRecordDeleted: boolean;
      consentRecordId: number | null;
      timestamp: string;
    }[]
  >([]);
  const [prnWarningDialogOpen, setPrnWarningDialogOpen] =
    useState(false);
  const [saveConfirmDialogOpen, setSaveConfirmDialogOpen] =
    useState(false);
  const [selectedMedication, setSelectedMedication] =
    useState<MedicationRecord | null>(null);

  // NEW: Consent dialog states (AC2, AC8)
  const [consentDialogOpen, setConsentDialogOpen] =
    useState(false);
  const [
    consentOverlapWarningOpen,
    setConsentOverlapWarningOpen,
  ] = useState(false);
  const [viewConsentDocumentOpen, setViewConsentDocumentOpen] =
    useState(false);
  const [
    consentAcknowledgmentOpen,
    setConsentAcknowledgmentOpen,
  ] = useState(false);
  const [overlappingConsent, setOverlappingConsent] =
    useState<MedicationConsent | null>(null);

  // Medication search
  const [medicationSearchTerm, setMedicationSearchTerm] =
    useState("");
  const [showMedicationDropdown, setShowMedicationDropdown] =
    useState(false);

  // Mock medications database
  const [medications] = useState<Medication[]>(
    [
      {
        id: 1,
        name: "Abilify",
        genericName: "Aripiprazole",
        requiresDescriptor: false,
        packages: ["Tablet", "Liquid"],
        countType: "Unit",
      },
      {
        id: 2,
        name: "Adderall XR",
        genericName: "Amphetamine/Dextroamphetamine",
        requiresDescriptor: false,
        packages: ["Capsule"],
        countType: "Unit",
      },
      {
        id: 3,
        name: "Amoxicillin",
        genericName: "Amoxicillin",
        requiresDescriptor: true,
        packages: ["Capsule", "Tablet", "Liquid"],
        countType: "Unit",
      },
      {
        id: 4,
        name: "Benzonatate",
        genericName: "Benzonatate",
        requiresDescriptor: false,
        packages: ["Capsule"],
        countType: "Unit",
      },
      {
        id: 5,
        name: "Clonidine",
        genericName: "Clonidine",
        requiresDescriptor: true,
        packages: ["Tablet", "Patch"],
        countType: "Unit",
      },
      {
        id: 6,
        name: "GenTeal Tears Eye Gel",
        genericName: "Hydroxypropyl Methylcellulose",
        requiresDescriptor: false,
        packages: ["Gel"],
        countType: "Volume",
      },
      {
        id: 7,
        name: "Ibuprofen",
        genericName: "Ibuprofen",
        requiresDescriptor: true,
        packages: ["Tablet", "Capsule", "Liquid"],
        countType: "Unit",
      },
      {
        id: 8,
        name: "Lexapro",
        genericName: "Escitalopram",
        requiresDescriptor: false,
        packages: ["Tablet", "Liquid"],
        countType: "Unit",
      },
      {
        id: 9,
        name: "Melatonin",
        genericName: "Melatonin",
        requiresDescriptor: false,
        packages: ["Tablet", "Gummy", "Liquid"],
        countType: "Unit",
      },
      {
        id: 10,
        name: "Prozac",
        genericName: "Fluoxetine",
        requiresDescriptor: false,
        packages: ["Capsule", "Tablet", "Liquid"],
        countType: "Unit",
      },
      {
        id: 11,
        name: "Risperdal",
        genericName: "Risperidone",
        requiresDescriptor: false,
        packages: ["Tablet", "Liquid"],
        countType: "Unit",
      },
      {
        id: 12,
        name: "Strattera",
        genericName: "Atomoxetine",
        requiresDescriptor: false,
        packages: ["Capsule"],
        countType: "Unit",
      },
      {
        id: 13,
        name: "Trazodone",
        genericName: "Trazodone",
        requiresDescriptor: false,
        packages: ["Tablet"],
        countType: "Unit",
      },
      {
        id: 14,
        name: "Wellbutrin XL",
        genericName: "Bupropion",
        requiresDescriptor: false,
        packages: ["Tablet"],
        countType: "Unit",
      },
      {
        id: 15,
        name: "Zoloft",
        genericName: "Sertraline",
        requiresDescriptor: false,
        packages: ["Tablet", "Liquid"],
        countType: "Unit",
      },
    ].sort((a, b) => a.name.localeCompare(b.name)),
  );

  // Mock consent forms
  const [consentForms] = useState<ConsentForm[]>([
    {
      youthId: 1,
      medicationId: 1,
      dateReceived: "01/01/2026",
      active: true,
    },
    {
      youthId: 1,
      medicationId: 2,
      dateReceived: "12/10/2025",
      active: true,
    },
    {
      youthId: 1,
      medicationId: 8,
      dateReceived: "01/03/2026",
      active: true,
    },
    {
      youthId: 1,
      medicationId: 15,
      dateReceived: "01/08/2026",
      active: true,
    },
  ]);

  // Mock dispensations
  const [dispensations] = useState<Dispensation[]>([
    { id: 1, youthId: 1, medicationId: 8, date: "01/15/2026" },
    { id: 2, youthId: 1, medicationId: 2, date: "01/14/2026" },
    { id: 3, youthId: 1, medicationId: 15, date: "01/13/2026" },
  ]);

  // Mock medication packs
  const [medicationPacks] = useState<MedicationPack[]>([
    {
      id: 1,
      youthId: 1,
      medicationId: 2,
      endDate: "02/15/2026",
      active: true,
    },
  ]);

  // AC1: 1:many consent records — medicationRecordIds links one consent to multiple dose period records
  const [medicationConsents, setMedicationConsents] = useState<
    MedicationConsent[]
  >([
    {
      id: 1,
      // AC1: Consent 1 covers Lexapro Morning (id:1) AND Lexapro Bedtime (id:15 — added below)
      medicationRecordIds: [1, 15],
      status: "Executed",
      executedDate: "01/03/2026",
      startDate: "01/03/2026",
      endDate: "01/02/2027",
      initialCount: "30.00",
      uploadedFileName: "lexapro_consent_jan2026.pdf",
      uploadedFileUrl: "#",
      createdDate: "01/02/2026",
      createdBy: "Dr. Sarah Johnson",
    },
    {
      id: 2,
      medicationRecordIds: [2],
      status: "Executed",
      executedDate: "12/10/2025",
      startDate: "12/10/2025",
      endDate: "12/09/2026",
      initialCount: "28.00",
      uploadedFileName: "adderall_consent_dec2025.pdf",
      uploadedFileUrl: "#",
      createdDate: "12/09/2025",
      createdBy: "Dr. Sarah Johnson",
    },
    {
      id: 3,
      medicationRecordIds: [4],
      status: "Draft",
      executedDate: "",
      startDate: "",
      endDate: "",
      initialCount: "60.00",
      uploadedFileName: "",
      uploadedFileUrl: "",
      createdDate: "02/01/2026",
      createdBy: "Dr. Sarah Johnson",
    },
  ]);

  // AC7: Count Log — auditable entries stamped with user + timestamp
  const [countLog, setCountLog] = useState<CountLogEntry[]>([
    {
      id: 1,
      consentId: 1,
      medicationRecordId: 1,
      medicationName: "Lexapro",
      dosingPeriod: "Morning",
      count: "30.00",
      submittedBy: "Dr. Sarah Johnson",
      timestamp: "01/03/2026 09:14 AM",
    },
    {
      id: 2,
      consentId: 1,
      medicationRecordId: 15,
      medicationName: "Lexapro",
      dosingPeriod: "Bedtime",
      count: "30.00",
      submittedBy: "Dr. Sarah Johnson",
      timestamp: "01/03/2026 09:14 AM",
    },
    {
      id: 3,
      consentId: 2,
      medicationRecordId: 2,
      medicationName: "Adderall XR",
      dosingPeriod: "Morning",
      count: "28.00",
      submittedBy: "Dr. Sarah Johnson",
      timestamp: "12/10/2025 08:30 AM",
    },
  ]);

  // Consent form state (AC4, AC7)
  const [consentForm, setConsentForm] = useState({
    status: "Draft" as
      "Draft" | "Sent" | "Executed" | "Expired",
    executedDate: "",
    startDate: "",
    endDate: "",
    initialCount: "",
    uploadedFileName: "",
    uploadedFileUrl: "",
    acknowledgedDosage: false,
    acknowledgedTreatmentPurpose: false,
    acknowledgedInstructions: false,
  });

  // Per-dose-period count entries: medicationRecordId → count string
  const [perDosePeriodCounts, setPerDosePeriodCounts] =
    useState<Record<number, string>>({});

  // Form state (extended)
  const [medicationForm, setMedicationForm] = useState({
    medicationId: 0,
    medicationName: "",
    medicationType: "" as
      "Prescribed" | "Non-Prescribed (Supplemental OTC)" | "",
    descriptor: "",
    genericName: "",
    packaging: "",
    dose: "",
    startDate: "",
    endDate: "",
    // AC1: consentReceived removed
    dosingPeriod: "",
    notTakenDaily: false,
    weeklyPattern: [] as string[],
    weeklyRecurWeeks: "1",
    monthlyPatternType: "day" as "day" | "weekday",
    monthlyDay: "",
    monthlyWeeks: "1",
    monthlyOrdinal: "",
    monthlyWeekday: "",
    monthlyMonths: "1",
    allDay: false,
    doseRangeStartTime: "",
    doseRangeEndTime: "",
    treatmentPurpose: "",
    minHoursBetweenDoses: "",
    maxDailyDoses: "",
    countType: "Unit" as "Unit" | "Volume",
    count: "",
    instructions: "",
    status: "active" as "active" | "inactive",
  });

  /** True when a medication record is Active (status = "active" and consent is Executed within date range). */
  const isActiveMedicationRecord = (
    med: MedicationRecord,
  ): boolean => {
    if (med.status !== "active") return false;
    if (!med.consentId) return false;
    const consent = medicationConsents.find(
      (c) => c.id === med.consentId,
    );
    return consent?.status === "Executed";
  };

  const isActiveLocked =
    editDialogOpen &&
    !!selectedMedication &&
    isActiveMedicationRecord(selectedMedication);

  // Mock medication records data (extended)
  const [medicationRecords, setMedicationRecords] = useState<
    MedicationRecord[]
  >([
    {
      id: 1,
      medicationId: 8,
      medicationName: "Lexapro",
      medicationType: "Prescribed",
      genericName: "Escitalopram",
      dosingPeriod: "Morning",
      dose: "20mg",
      packaging: "Tablet",
      startDate: "01/05/2026",
      consentId: 1,
      notTakenDaily: false,
      allDay: false,
      doseRangeStartTime: "08:00 AM",
      doseRangeEndTime: "10:00 AM",
      countType: "Unit",
      count: "30.00",
      status: "active",
    },
    {
      id: 2,
      medicationId: 2,
      medicationName: "Adderall XR",
      medicationType: "Prescribed",
      genericName: "Amphetamine/Dextroamphetamine",
      dosingPeriod: "Morning",
      dose: "20mg",
      packaging: "Capsule",
      startDate: "12/15/2025",
      consentId: 2,
      notTakenDaily: false,
      allDay: false,
      doseRangeStartTime: "07:00 AM",
      doseRangeEndTime: "09:00 AM",
      countType: "Unit",
      count: "28.00",
      status: "active",
    },
    {
      id: 3,
      medicationId: 15,
      medicationName: "Zoloft",
      medicationType: "Prescribed",
      genericName: "Sertraline",
      dosingPeriod: "Bedtime",
      dose: "50mg",
      packaging: "Tablet",
      startDate: "01/10/2026",
      notTakenDaily: false,
      allDay: false,
      doseRangeStartTime: "09:00 PM",
      doseRangeEndTime: "10:00 PM",
      countType: "Unit",
      count: "43.00",
      status: "active",
    },
    {
      id: 4,
      medicationId: 1,
      medicationName: "Abilify",
      medicationType: "Prescribed",
      genericName: "Aripiprazole",
      dosingPeriod: "Evening",
      dose: "10mg",
      packaging: "Tablet",
      startDate: "02/01/2026",
      consentId: 3, // Draft consent - demonstrates AC14 blocking
      notTakenDaily: false,
      allDay: true,
      countType: "Unit",
      count: "25.00",
      status: "active",
    },
    {
      id: 5,
      medicationId: 3,
      medicationName: "Amoxicillin",
      medicationType: "Prescribed",
      descriptor: "500mg Capsule",
      genericName: "Amoxicillin",
      dosingPeriod: "Morning",
      dose: "500mg",
      packaging: "Capsule",
      startDate: "01/12/2026",
      notTakenDaily: false,
      allDay: false,
      doseRangeStartTime: "08:00 AM",
      doseRangeEndTime: "09:00 AM",
      countType: "Unit",
      count: "28.00",
      status: "active",
    },
    {
      id: 6,
      medicationId: 4,
      medicationName: "Benzonatate",
      medicationType: "Prescribed",
      genericName: "Benzonatate",
      dosingPeriod: "Bedtime",
      dose: "100mg",
      packaging: "Capsule",
      startDate: "01/08/2026",
      notTakenDaily: false,
      allDay: false,
      doseRangeStartTime: "10:00 PM",
      doseRangeEndTime: "11:00 PM",
      countType: "Unit",
      count: "18.00",
      status: "active",
    },
    {
      id: 7,
      medicationId: 7,
      medicationName: "Ibuprofen",
      medicationType: "Non-Prescribed (Supplemental OTC)",
      descriptor: "200mg Tablet",
      genericName: "Ibuprofen",
      dosingPeriod: "PRN",
      dose: "200mg",
      packaging: "Tablet",
      startDate: "12/20/2025",
      notTakenDaily: false,
      allDay: false,
      doseRangeStartTime: "08:00 AM",
      doseRangeEndTime: "10:00 PM",
      minHoursBetweenDoses: 4,
      maxDailyDoses: 4,
      countType: "Unit",
      count: "50.00",
      status: "active",
    },
    // Pending medication records (Start Date > Today)
    {
      id: 8,
      medicationId: 12,
      medicationName: "Strattera",
      medicationType: "Prescribed",
      genericName: "Atomoxetine",
      dosingPeriod: "Morning",
      dose: "40mg",
      packaging: "Capsule",
      startDate: "03/25/2026",
      endDate: "09/25/2026",
      notTakenDaily: false,
      allDay: false,
      doseRangeStartTime: "08:00 AM",
      doseRangeEndTime: "10:00 AM",
      countType: "Unit",
      count: "0.00",
      status: "inactive",
    },
    {
      id: 9,
      medicationId: 14,
      medicationName: "Wellbutrin XL",
      medicationType: "Prescribed",
      genericName: "Bupropion",
      dosingPeriod: "Morning",
      dose: "150mg",
      packaging: "Tablet",
      startDate: "04/01/2026",
      endDate: "10/01/2026",
      notTakenDaily: false,
      allDay: false,
      doseRangeStartTime: "07:00 AM",
      doseRangeEndTime: "09:00 AM",
      countType: "Unit",
      count: "0.00",
      status: "inactive",
    },
    {
      id: 10,
      medicationId: 13,
      medicationName: "Trazodone",
      medicationType: "Prescribed",
      genericName: "Trazodone",
      dosingPeriod: "Bedtime",
      dose: "50mg",
      packaging: "Tablet",
      startDate: "03/28/2026",
      endDate: "06/28/2026",
      notTakenDaily: false,
      allDay: false,
      doseRangeStartTime: "09:00 PM",
      doseRangeEndTime: "10:00 PM",
      countType: "Unit",
      count: "0.00",
      status: "inactive",
    },
    // Archived medication records (End Date < Today)
    {
      id: 11,
      medicationId: 10,
      medicationName: "Prozac",
      medicationType: "Prescribed",
      genericName: "Fluoxetine",
      dosingPeriod: "Morning",
      dose: "20mg",
      packaging: "Capsule",
      startDate: "10/15/2025",
      endDate: "01/10/2026",
      notTakenDaily: false,
      allDay: false,
      doseRangeStartTime: "08:00 AM",
      doseRangeEndTime: "10:00 AM",
      countType: "Unit",
      count: "30.00",
      status: "inactive",
    },
    {
      id: 12,
      medicationId: 11,
      medicationName: "Risperdal",
      medicationType: "Prescribed",
      genericName: "Risperidone",
      dosingPeriod: "Evening",
      dose: "2mg",
      packaging: "Tablet",
      startDate: "11/01/2025",
      endDate: "12/20/2025",
      notTakenDaily: false,
      allDay: false,
      doseRangeStartTime: "07:00 PM",
      doseRangeEndTime: "09:00 PM",
      countType: "Unit",
      count: "60.00",
      status: "inactive",
    },
    {
      id: 13,
      medicationId: 5,
      medicationName: "Clonidine",
      medicationType: "Prescribed",
      descriptor: "0.1mg Tablet",
      genericName: "Clonidine",
      dosingPeriod: "Bedtime",
      dose: "0.1mg",
      packaging: "Tablet",
      startDate: "09/10/2025",
      endDate: "01/05/2026",
      notTakenDaily: false,
      allDay: false,
      doseRangeStartTime: "10:00 PM",
      doseRangeEndTime: "11:00 PM",
      countType: "Unit",
      count: "90.00",
      status: "inactive",
    },
    {
      id: 14,
      medicationId: 9,
      medicationName: "Melatonin",
      medicationType: "Non-Prescribed (Supplemental OTC)",
      genericName: "Melatonin",
      dosingPeriod: "Bedtime",
      dose: "5mg",
      packaging: "Tablet",
      startDate: "08/15/2025",
      endDate: "12/31/2025",
      notTakenDaily: false,
      allDay: false,
      doseRangeStartTime: "09:30 PM",
      doseRangeEndTime: "10:00 PM",
      countType: "Unit",
      count: "120.00",
      status: "inactive",
    },
    // AC1: Lexapro Bedtime — shares consent id:1 with Lexapro Morning (demonstrates 1:many)
    {
      id: 15,
      medicationId: 8,
      medicationName: "Lexapro",
      medicationType: "Prescribed",
      genericName: "Escitalopram",
      dosingPeriod: "Bedtime",
      dose: "20mg",
      packaging: "Tablet",
      startDate: "01/05/2026",
      consentId: 1,
      notTakenDaily: false,
      allDay: false,
      doseRangeStartTime: "09:00 PM",
      doseRangeEndTime: "10:00 PM",
      countType: "Unit",
      count: "30.00",
      status: "active",
    },
  ]);

  // Get current date for filtering
  const today = new Date("2026-03-20");

  // Filter medication records based on active tab
  const getFilteredMedicationRecords = () => {
    let filtered = medicationRecords;

    if (activeTab === "current") {
      filtered = filtered.filter((p) => p.status === "active");
    } else if (activeTab === "pending") {
      filtered = filtered.filter((p) => {
        if (p.status !== "inactive") return false;
        const startDate = new Date(p.startDate);
        return startDate > today;
      });
    } else if (activeTab === "archived") {
      filtered = filtered.filter((p) => {
        if (p.status !== "inactive" || !p.endDate) return false;
        const endDate = new Date(p.endDate);
        return endDate < today;
      });
    }

    return filtered.sort((a, b) => {
      const orderA = dosePeriodOrder[a.dosingPeriod] || 999;
      const orderB = dosePeriodOrder[b.dosingPeriod] || 999;
      return orderA - orderB;
    });
  };

  // Format medication name for display
  const formatMedicationName = (
    medication: MedicationRecord,
  ) => {
    let name = medication.medicationName;
    if (medication.descriptor) {
      name += ` ${medication.descriptor}`;
    }
    name += ` (${medication.genericName})`;
    return name;
  };

  // Filter medications based on search
  const filteredMedications = useMemo(() => {
    if (!medicationSearchTerm) return medications;
    const term = medicationSearchTerm.toLowerCase();
    return medications.filter(
      (med) =>
        med.name.toLowerCase().includes(term) ||
        med.genericName.toLowerCase().includes(term),
    );
  }, [medicationSearchTerm, medications]);

  // Get selected medication
  const selectedMedicationLookup = useMemo(() => {
    return medications.find(
      (m) => m.id === medicationForm.medicationId,
    );
  }, [medicationForm.medicationId, medications]);

  // AC1: Get consent for a medication record — searches the medicationRecordIds array
  const getConsentForMedication = (
    medicationRecordId: number,
  ): MedicationConsent | undefined => {
    return medicationConsents.find((c) =>
      c.medicationRecordIds.includes(medicationRecordId),
    );
  };

  // AC3: Cascade — when a consent is expired/revoked, all linked dose period records become inactive
  const cascadeConsentStatusToRecords = (
    consentId: number,
    newStatus: MedicationConsent["status"],
  ) => {
    if (newStatus === "Expired") {
      setMedicationRecords((prev) =>
        prev.map((r) =>
          r.consentId === consentId
            ? { ...r, status: "inactive" }
            : r,
        ),
      );
    }
  };

  // AC10: Check for overlapping consents — checks same medication + dose period combination
  const checkConsentOverlap = (
    newStartDate: string,
    newEndDate: string,
    excludeMedicationId?: number,
  ): MedicationConsent | null => {
    if (!medicationForm.medicationId) return null;

    const newStart = new Date(newStartDate);
    const newEnd = newEndDate
      ? new Date(newEndDate)
      : new Date("2099-12-31");

    const existingMedicationRecords = medicationRecords.filter(
      (p) =>
        p.medicationId === medicationForm.medicationId &&
        p.dosingPeriod === medicationForm.dosingPeriod &&
        p.id !== excludeMedicationId &&
        p.consentId,
    );

    for (const medicationRecord of existingMedicationRecords) {
      const consent = medicationConsents.find(
        (c) => c.id === medicationRecord.consentId,
      );
      if (!consent || consent.status !== "Executed") continue;

      const existingStart = new Date(consent.startDate!);
      const existingEnd = consent.endDate
        ? new Date(consent.endDate)
        : new Date("2099-12-31");

      if (newStart <= existingEnd && newEnd >= existingStart) {
        return consent;
      }
    }

    return null;
  };

  // AC9: Helper — parse "MM/DD/YYYY" to end-of-day (23:59:59.999) for inclusive end date gating.
  // A medication with End Date 04/17 is available through 11:59:59 PM on 04/17.
  const parseEndDateInclusive = (dateStr: string): Date => {
    const [m, d, y] = dateStr.split("/").map(Number);
    const dt = new Date(y, m - 1, d, 23, 59, 59, 999);
    return dt;
  };

  // AC9 helper — parse start date as start-of-day
  const parseStartDate = (dateStr: string): Date => {
    const [m, d, y] = dateStr.split("/").map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  };

  // AC7, AC13, AC14: Check if medication is activated (can be dispensed)
  // A medication is activated when: consent is Executed AND (Start Date ≤ Now ≤ End Date 23:59:59)
  const isMedicationActivated = (
    medication: MedicationRecord | null,
  ) => {
    if (!medication || !medication.consentId) return false;

    const consent = medicationConsents.find(
      (c) => c.id === medication.consentId,
    );
    if (!consent || consent.status !== "Executed") return false;

    const now = new Date();
    const startDate = parseStartDate(consent.startDate!);
    // AC9: End Date inclusive — available through 23:59:59 of End Date
    const endDate = consent.endDate
      ? parseEndDateInclusive(consent.endDate)
      : new Date("2099-12-31T23:59:59.999");

    return startDate <= now && now <= endDate;
  };

  // AC13, AC14: Check if medication should be hidden from dispensation workflow
  const shouldHideMedicationFromProgramLog = (
    medication: MedicationRecord,
  ): boolean => {
    if (!medication.consentId) return true;

    const consent = medicationConsents.find(
      (c) => c.id === medication.consentId,
    );
    // AC13: Hidden when consent is Draft, Sent, or Expired
    if (!consent || consent.status !== "Executed") return true;

    const now = new Date();
    const startDate = parseStartDate(consent.startDate!);
    // AC9/AC14: Hide if current moment is outside inclusive Start–End range
    const endDate = consent.endDate
      ? parseEndDateInclusive(consent.endDate)
      : new Date("2099-12-31T23:59:59.999");

    return now < startDate || now > endDate;
  };

  // Helper: Get consent status badge color and text (AC14, AC15)
  const getConsentStatusBadge = (
    medication: MedicationRecord,
  ) => {
    if (!medication.consentId) {
      return {
        color: "bg-gray-100 text-gray-700",
        text: "No Consent",
        icon: "⚠️",
        canDispense: false,
      };
    }

    const consent = medicationConsents.find(
      (c) => c.id === medication.consentId,
    );
    if (!consent) {
      return {
        color: "bg-gray-100 text-gray-700",
        text: "No Consent",
        icon: "⚠️",
        canDispense: false,
      };
    }

    // Check if medication is available for dispensation
    const canDispense = isMedicationActivated(medication);

    switch (consent.status) {
      case "Executed":
        if (canDispense) {
          return {
            color: "bg-green-100 text-green-800",
            text: "Available",
            icon: "✓",
            canDispense: true,
          };
        } else {
          return {
            color: "bg-orange-100 text-orange-800",
            text: "Executed (Out of Range)",
            icon: "📅",
            canDispense: false,
          };
        }
      case "Draft":
        return {
          color: "bg-yellow-100 text-yellow-800",
          text: "Draft",
          icon: "📝",
          canDispense: false,
        };
      case "Sent":
        return {
          color: "bg-blue-100 text-blue-800",
          text: "Sent",
          icon: "📤",
          canDispense: false,
        };
      case "Expired":
        return {
          color: "bg-red-100 text-red-800",
          text: "Expired",
          icon: "⏰",
          canDispense: false,
        };
      default:
        return {
          color: "bg-gray-100 text-gray-700",
          text: "Unknown",
          icon: "?",
          canDispense: false,
        };
    }
  };

  // Toggle row expansion
  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Toggle weekday
  const toggleWeekday = (day: string) => {
    setMedicationForm({
      ...medicationForm,
      weeklyPattern: medicationForm.weeklyPattern.includes(day)
        ? medicationForm.weeklyPattern.filter((d) => d !== day)
        : [...medicationForm.weeklyPattern, day],
    });
  };

  // Reset form
  const resetForm = () => {
    setMedicationForm({
      medicationId: 0,
      medicationName: "",
      medicationType: "",
      descriptor: "",
      genericName: "",
      packaging: "",
      dose: "",
      startDate: "",
      endDate: "",
      dosingPeriod: "",
      notTakenDaily: false,
      weeklyPattern: [],
      weeklyRecurWeeks: "1",
      monthlyPatternType: "day",
      monthlyDay: "",
      monthlyWeeks: "1",
      monthlyOrdinal: "",
      monthlyWeekday: "",
      monthlyMonths: "1",
      allDay: false,
      doseRangeStartTime: "",
      doseRangeEndTime: "",
      treatmentPurpose: "",
      minHoursBetweenDoses: "",
      maxDailyDoses: "",
      countType: "Unit",
      count: "",
      instructions: "",
      status: "active",
    });
    setMedicationSearchTerm("");
  };

  // NEW: Reset consent form
  const resetConsentForm = () => {
    setConsentForm({
      status: "Draft",
      executedDate: "",
      startDate: "",
      endDate: "",
      initialCount: "",
      uploadedFileName: "",
      uploadedFileUrl: "",
      acknowledgedDosage: false,
      acknowledgedTreatmentPurpose: false,
      acknowledgedInstructions: false,
    });
    setPerDosePeriodCounts({});
  };

  // NEW: AC4 - Handle Executed Date change and auto-populate dates
  const handleExecutedDateChange = (date: string) => {
    setConsentForm({
      ...consentForm,
      executedDate: date,
      startDate: date, // Default Start Date to Executed Date
      endDate: date ? calculateDefaultEndDate(date) : "", // Default End Date to Start + 364 days
    });
  };

  // NEW: Handle Start Date manual change — recalculate End Date to Start + 364 days
  const handleConsentStartDateChange = (date: string) => {
    setConsentForm({
      ...consentForm,
      startDate: date,
      endDate: date ? calculateDefaultEndDate(date) : "",
    });
  };

  // NEW: Calculate default end date (1 year minus 1 day from start date)
  const calculateDefaultEndDate = (
    startDate: string,
  ): string => {
    if (!startDate) return "";
    const start = new Date(startDate);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
    return formatMdy(end).replace(/\//g, "/");
  };

  // NEW: AC2 - Handle file upload (manual upload)
  // Opens the Laserfiche Medication Consent form in a new tab.
  // TODO(Laserfiche): replace the placeholder with the consent form URL the
  // backend returns once the medication is submitted and the Laserfiche
  // consent process is created. No production URL is hard-coded here.
  const LASERFICHE_CONSENT_PLACEHOLDER_URL = "about:blank";
  const handleContinueInLaserfiche = () => {
    window.open(
      LASERFICHE_CONSENT_PLACEHOLDER_URL,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleConsentFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // In production, this would upload to server
      setConsentForm({
        ...consentForm,
        uploadedFileName: file.name,
        uploadedFileUrl: URL.createObjectURL(file), // Mock URL
      });
      toast.success(
        `File "${file.name}" uploaded successfully`,
      );
    }
  };

  // NEW: AC13 - Validate acknowledgments before marking as Executed
  const validateConsentAcknowledgments = (): boolean => {
    if (!consentForm.acknowledgedDosage) {
      toast.error(
        "You must acknowledge Dosage before executing the consent",
      );
      return false;
    }
    if (!consentForm.acknowledgedTreatmentPurpose) {
      toast.error(
        "You must acknowledge Treatment Purpose before executing the consent",
      );
      return false;
    }
    if (!consentForm.acknowledgedInstructions) {
      toast.error(
        "You must acknowledge Instructions before executing the consent",
      );
      return false;
    }
    return true;
  };

  // AC7 - Validate per-dose-period counts (all linked records must have a valid count)
  const validateInitialCount = (): boolean => {
    if (!selectedMedication) return false;
    const linkedRecords = medicationRecords.filter(
      (r) =>
        r.medicationId === selectedMedication.medicationId &&
        r.id !== selectedMedication.id,
    );
    const allRecords = [selectedMedication, ...linkedRecords];
    for (const rec of allRecords) {
      const val =
        perDosePeriodCounts[rec.id] ?? consentForm.initialCount;
      if (!val || parseFloat(val) < 0) {
        toast.error(
          `Count is required for dose period "${rec.dosingPeriod}"`,
        );
        return false;
      }
    }
    return true;
  };

  // NEW: AC4 - Validate consent dates
  const validateConsentDates = (): boolean => {
    if (!consentForm.executedDate) {
      toast.error("Executed Date is required");
      return false;
    }
    if (!consentForm.startDate) {
      toast.error("Start Date is required");
      return false;
    }
    if (!consentForm.endDate) {
      toast.error("End Date is required");
      return false;
    }

    const start = new Date(consentForm.startDate);
    const end = new Date(consentForm.endDate);
    if (end < start) {
      toast.error(
        "End Date must be after or equal to Start Date",
      );
      return false;
    }

    return true;
  };

  // AC12: Handle consent overlap replacement — end-dates the existing consent to day prior to new Start Date
  const handleConsentOverlapReplacement = () => {
    if (!overlappingConsent) return;

    const newConsentStart = new Date(consentForm.startDate!);
    const replacementEndDate = new Date(newConsentStart);
    replacementEndDate.setDate(
      replacementEndDate.getDate() - 1,
    );
    const newEndDateStr = formatMdy(replacementEndDate);

    // AC12: Set existing consent End Date to day prior to new Start Date
    setMedicationConsents((prev) =>
      prev.map((c) =>
        c.id === overlappingConsent.id
          ? { ...c, endDate: newEndDateStr, status: "Expired" }
          : c,
      ),
    );

    // AC3: Cascade — deactivate all dose period records linked to the replaced consent
    cascadeConsentStatusToRecords(
      overlappingConsent.id,
      "Expired",
    );

    toast.success(
      "Previous consent end-dated. All associated dose period records deactivated.",
    );
    setConsentOverlapWarningOpen(false);
    setOverlappingConsent(null);

    saveNewConsent();
  };

  // AC1/AC7: Save new consent — links to medicationRecordIds array; creates auditable Count Log entry
  const saveNewConsent = () => {
    if (!selectedMedication) return;

    const newConsentId =
      Math.max(...medicationConsents.map((c) => c.id), 0) + 1;
    const newConsent: MedicationConsent = {
      id: newConsentId,
      medicationRecordIds: [selectedMedication.id], // AC1: array — additional records can be added later
      status: consentForm.status,
      executedDate: consentForm.executedDate,
      startDate: consentForm.startDate,
      endDate: consentForm.endDate,
      initialCount: consentForm.initialCount,
      uploadedFileName: consentForm.uploadedFileName,
      uploadedFileUrl: consentForm.uploadedFileUrl,
      createdDate: formatMdy(new Date()),
      createdBy: getDemoUserName(),
    };

    setMedicationConsents((prev) => [...prev, newConsent]);

    // Link medication record to the new consent
    setMedicationRecords((prev) =>
      prev.map((p) =>
        p.id === selectedMedication.id
          ? { ...p, consentId: newConsentId }
          : p,
      ),
    );

    // AC3: If consent is marked Expired on creation, cascade deactivation
    if (consentForm.status === "Expired") {
      cascadeConsentStatusToRecords(newConsentId, "Expired");
    }

    // AC7: Create auditable Count Log entries — one per linked dose period record
    const timestamp = new Date().toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const linkedRecords = medicationRecords.filter(
      (r) =>
        r.medicationId === selectedMedication.medicationId &&
        r.id !== selectedMedication.id,
    );
    const allRecords = [selectedMedication, ...linkedRecords];
    let nextLogId =
      Math.max(...countLog.map((l) => l.id), 0) + 1;
    const newLogEntries: CountLogEntry[] = allRecords.map(
      (rec) => ({
        id: nextLogId++,
        consentId: newConsentId,
        medicationRecordId: rec.id,
        medicationName: rec.medicationName,
        dosingPeriod: rec.dosingPeriod,
        count:
          perDosePeriodCounts[rec.id] ??
          consentForm.initialCount,
        submittedBy: getDemoUserName(),
        timestamp,
      }),
    );
    setCountLog((prev) => [...prev, ...newLogEntries]);
    // Also link all sibling records to the new consent
    setMedicationRecords((prev) =>
      prev.map((r) =>
        allRecords.some((a) => a.id === r.id)
          ? { ...r, consentId: newConsentId }
          : r,
      ),
    );

    toast.success(
      "Consent saved. Initial Count log entry recorded.",
    );
    setConsentDialogOpen(false);
    resetConsentForm();
  };

  // NEW: AC2, AC5 - Handle consent creation with overlap check
  const handleCreateConsent = () => {
    // Validate all required fields
    if (!validateConsentDates()) return;
    if (!validateInitialCount()) return;
    if (
      consentForm.status === "Executed" &&
      !validateConsentAcknowledgments()
    )
      return;

    // AC5: Check for overlaps
    const overlap = checkConsentOverlap(
      consentForm.startDate!,
      consentForm.endDate!,
    );
    if (overlap) {
      setOverlappingConsent(overlap);
      setConsentOverlapWarningOpen(true);
      return;
    }

    saveNewConsent();
  };

  // Select medication
  const handleMedicationSelect = (medication: Medication) => {
    setMedicationForm({
      ...medicationForm,
      medicationId: medication.id,
      medicationName: medication.name,
      genericName: medication.genericName,
      countType: medication.countType,
      // AC1: consentReceived removed
      packaging: "", // Reset packaging when medication changes
      descriptor: medication.requiresDescriptor
        ? medicationForm.descriptor
        : "",
    });
    setMedicationSearchTerm(
      `${medication.name} (${medication.genericName})`,
    );
    setShowMedicationDropdown(false);
  };

  // Validate dates
  const validateDates = () => {
    if (!medicationForm.startDate) {
      toast.error("Start Date is required");
      return false;
    }

    if (medicationForm.endDate) {
      const startDate = new Date(medicationForm.startDate);
      const endDate = new Date(medicationForm.endDate);

      if (endDate < startDate) {
        toast.error(
          "End Date must be after or equal to Start Date",
        );
        return false;
      }

      // Check dispensations
      const hasDispensation = dispensations.some(
        (d) =>
          d.medicationId === medicationForm.medicationId &&
          new Date(d.date) > endDate,
      );
      if (hasDispensation) {
        toast.error("End date cannot precede a dispensation");
        return false;
      }

      // Check medication packs
      const activePack = medicationPacks.find(
        (p) =>
          p.medicationId === medicationForm.medicationId &&
          p.active &&
          new Date(p.endDate) > endDate,
      );
      if (activePack) {
        toast.error("End date cannot precede an active Pack");
        return false;
      }
    }

    return true;
  };

  // Validate time fields
  const validateTimes = () => {
    if (!medicationForm.allDay) {
      if (
        medicationForm.doseRangeEndTime &&
        !medicationForm.doseRangeStartTime
      ) {
        toast.error(
          "A start time must be provided if an end time is entered",
        );
        return false;
      }
      if (!medicationForm.doseRangeStartTime) {
        toast.error("Dose Range Start Time is required");
        return false;
      }
    }
    return true;
  };

  // Check for duplicates
  const checkDuplicates = () => {
    const duplicate = medicationRecords.find((p) => {
      if (editDialogOpen && p.id === selectedMedication?.id)
        return false;

      const sameParams =
        p.medicationId === medicationForm.medicationId &&
        p.dosingPeriod === medicationForm.dosingPeriod;

      if (!sameParams) return false;

      // Check date overlap
      const formStart = new Date(medicationForm.startDate);
      const formEnd = medicationForm.endDate
        ? new Date(medicationForm.endDate)
        : new Date("2099-12-31");
      const pStart = new Date(p.startDate);
      const pEnd = p.endDate
        ? new Date(p.endDate)
        : new Date("2099-12-31");

      return formStart <= pEnd && formEnd >= pStart;
    });

    if (duplicate) {
      if (medicationForm.dosingPeriod === "PRN") {
        setPrnWarningDialogOpen(true);
        return false;
      } else {
        toast.error(
          `The medication already exists for this dosing period`,
        );
        return false;
      }
    }

    return true;
  };

  // Validate all required fields
  const validateForm = () => {
    if (!medicationForm.medicationId) {
      toast.error("Medication is required");
      return false;
    }
    // AC5: Medication Type is required
    if (!medicationForm.medicationType) {
      toast.error("Medication Type is required");
      return false;
    }
    if (!medicationForm.packaging) {
      toast.error("Package is required");
      return false;
    }
    if (!medicationForm.dose) {
      toast.error("Dose is required");
      return false;
    }
    if (!medicationForm.dosingPeriod) {
      toast.error("Dosing Period is required");
      return false;
    }
    if (!medicationForm.countType) {
      toast.error("Count Type is required");
      return false;
    }
    if (!medicationForm.count) {
      toast.error("Count is required");
      return false;
    }

    // Validate count format
    if (medicationForm.countType === "Unit") {
      const countNum = parseFloat(medicationForm.count);
      if (
        isNaN(countNum) ||
        countNum < 0 ||
        countNum > 999.99
      ) {
        toast.error("Count must be between 0.00 and 999.99");
        return false;
      }
    }

    return (
      validateDates() && validateTimes() && checkDuplicates()
    );
  };

  // Show save confirmation
  const handleSaveAttempt = () => {
    if (!validateForm()) return;
    setSaveConfirmDialogOpen(true);
  };

  // Handle Create
  const handleCreate = () => {
    setSaveConfirmDialogOpen(false);

    const newMedication: MedicationRecord = {
      id:
        Math.max(...medicationRecords.map((p) => p.id), 0) + 1,
      medicationId: medicationForm.medicationId,
      medicationName: medicationForm.medicationName,
      medicationType: medicationForm.medicationType as
        "Prescribed" | "Non-Prescribed (Supplemental OTC)",
      descriptor: medicationForm.descriptor || undefined,
      genericName: medicationForm.genericName,
      packaging: medicationForm.packaging,
      dose: medicationForm.dose,
      startDate: medicationForm.startDate,
      endDate: medicationForm.endDate || undefined,
      dosingPeriod: medicationForm.dosingPeriod,
      notTakenDaily: medicationForm.notTakenDaily,
      weeklyPattern: medicationForm.notTakenDaily
        ? medicationForm.weeklyPattern
        : undefined,
      allDay: medicationForm.allDay,
      doseRangeStartTime: medicationForm.allDay
        ? undefined
        : medicationForm.doseRangeStartTime,
      doseRangeEndTime: medicationForm.allDay
        ? undefined
        : medicationForm.doseRangeEndTime,
      treatmentPurpose:
        medicationForm.treatmentPurpose || undefined,
      minHoursBetweenDoses: medicationForm.minHoursBetweenDoses
        ? parseInt(medicationForm.minHoursBetweenDoses)
        : undefined,
      maxDailyDoses: medicationForm.maxDailyDoses
        ? parseInt(medicationForm.maxDailyDoses)
        : undefined,
      countType: medicationForm.countType,
      count: medicationForm.count,
      instructions: medicationForm.instructions || undefined,
      status: medicationForm.status,
    };

    setMedicationRecords([...medicationRecords, newMedication]);
    toast.success("Medication created successfully");
    setCreateDialogOpen(false);
    resetForm();
  };

  // Handle Edit Click
  const handleEditClick = (medication: MedicationRecord) => {
    setSelectedMedication(medication);

    const med = medications.find(
      (m) => m.id === medication.medicationId,
    );

    setMedicationForm({
      medicationId: medication.medicationId,
      medicationName: medication.medicationName,
      medicationType: medication.medicationType,
      descriptor: medication.descriptor || "",
      genericName: medication.genericName,
      packaging: medication.packaging,
      dose: medication.dose,
      startDate: medication.startDate,
      endDate: medication.endDate || "",
      // AC1: consentReceived removed
      dosingPeriod: medication.dosingPeriod,
      notTakenDaily: medication.notTakenDaily,
      weeklyPattern: medication.weeklyPattern || [],
      weeklyRecurWeeks: "1",
      monthlyPatternType: "day",
      monthlyDay: "",
      monthlyWeeks: "1",
      monthlyOrdinal: "",
      monthlyWeekday: "",
      monthlyMonths: "1",
      allDay: medication.allDay,
      doseRangeStartTime: medication.doseRangeStartTime || "",
      doseRangeEndTime: medication.doseRangeEndTime || "",
      treatmentPurpose: medication.treatmentPurpose || "",
      minHoursBetweenDoses:
        medication.minHoursBetweenDoses?.toString() || "",
      maxDailyDoses: medication.maxDailyDoses?.toString() || "",
      countType: medication.countType,
      count: medication.count,
      instructions: medication.instructions || "",
      status: medication.status,
    });

    setMedicationSearchTerm(
      `${medication.medicationName} (${medication.genericName})`,
    );
    setEditDialogOpen(true);
  };

  // Handle Save Edit
  const handleSaveEdit = () => {
    setSaveConfirmDialogOpen(false);

    if (!selectedMedication) return;

    // ── Active-record field-lock enforcement (AC9) ───────────────────────────
    if (isActiveMedicationRecord(selectedMedication)) {
      const lockedChanges: string[] = [];

      // All-roles locked fields
      if (
        medicationForm.medicationName !==
        selectedMedication.medicationName
      )
        lockedChanges.push("Medication");
      if (
        medicationForm.medicationType !==
        selectedMedication.medicationType
      )
        lockedChanges.push("Medication Type");
      if (
        (medicationForm.descriptor || "") !==
        (selectedMedication.descriptor || "")
      )
        lockedChanges.push("Descriptor");
      if (medicationForm.dose !== selectedMedication.dose)
        lockedChanges.push("Dose");
      if (
        medicationForm.startDate !==
        selectedMedication.startDate
      )
        lockedChanges.push("Start Date");
      if (
        medicationForm.dosingPeriod !==
        selectedMedication.dosingPeriod
      )
        lockedChanges.push("Dose Period");
      if (
        medicationForm.packaging !==
        selectedMedication.packaging
      )
        lockedChanges.push("Packaging");
      if (
        medicationForm.treatmentPurpose !==
        (selectedMedication.treatmentPurpose || "")
      )
        lockedChanges.push("Treatment Purpose");
      if (medicationForm.allDay !== selectedMedication.allDay)
        lockedChanges.push("All Day");
      if (
        medicationForm.notTakenDaily !==
        selectedMedication.notTakenDaily
      )
        lockedChanges.push("Not Taken Daily");
      if (
        medicationForm.countType !==
        selectedMedication.countType
      )
        lockedChanges.push("Count Type");
      if (
        (medicationForm.minHoursBetweenDoses || "") !==
        (selectedMedication.minHoursBetweenDoses?.toString() ||
          "")
      )
        lockedChanges.push("Min Hours Between Doses");
      if (
        (medicationForm.maxDailyDoses || "") !==
        (selectedMedication.maxDailyDoses?.toString() || "")
      )
        lockedChanges.push("Max Daily Doses");

      // End Date: block if changed AND user not elevated AND end date was already set
      if (
        medicationForm.endDate !==
          (selectedMedication.endDate || "") &&
        !canEditField("endDate", selectedMedication)
      ) {
        lockedChanges.push("End Date");
      }

      // Instructions / Dose Range: elevated roles only (AC5-AC8)
      if (!userIsElevated) {
        if (
          medicationForm.instructions !==
          (selectedMedication.instructions || "")
        )
          lockedChanges.push("Instructions");
        if (
          medicationForm.doseRangeStartTime !==
          (selectedMedication.doseRangeStartTime || "")
        )
          lockedChanges.push("Dose Range Start Time");
        if (
          medicationForm.doseRangeEndTime !==
          (selectedMedication.doseRangeEndTime || "")
        )
          lockedChanges.push("Dose Range End Time");
      }

      if (lockedChanges.length > 0) {
        toast.error(
          `Cannot save: the following field(s) are locked on active records — ${lockedChanges.join(", ")}.`,
        );
        return;
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    // ── Partial dose period change guard ────────────────────────────────────
    // If the dose period changed on a record that has an Executed consent,
    // the entire consent is voided: end-date all associated records & the consent.
    const dosingPeriodChanged =
      medicationForm.dosingPeriod !==
      selectedMedication.dosingPeriod;
    if (
      dosingPeriodChanged &&
      selectedMedication.consentId != null
    ) {
      const existingConsent = medicationConsents.find(
        (c) => c.id === selectedMedication.consentId,
      );
      if (
        existingConsent &&
        existingConsent.status === "Executed"
      ) {
        const today = formatMdy(new Date());
        // End-date all medication records linked to this consent
        const linkedIds = new Set(
          existingConsent.medicationRecordIds ?? [
            selectedMedication.id,
          ],
        );
        setMedicationRecords((prev) =>
          prev.map((r) =>
            linkedIds.has(r.id)
              ? {
                  ...r,
                  endDate: today,
                  status: "inactive" as const,
                  consentId: undefined,
                }
              : r,
          ),
        );
        // Void (expire) the consent
        setMedicationConsents((prev) =>
          prev.map((c) =>
            c.id === existingConsent.id
              ? {
                  ...c,
                  status: "Expired" as const,
                  endDate: today,
                }
              : c,
          ),
        );
        toast.error(
          "Dose period change detected. The existing consent has been voided and all associated medication records have been end-dated. Please create new medication records and a new consent for all dose periods.",
          { duration: 8000 },
        );
        setEditDialogOpen(false);
        setSelectedMedication(null);
        resetForm();
        return; // Do NOT apply the edit — new records must be created from scratch
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    setMedicationRecords((prev) =>
      prev.map((p) =>
        p.id === selectedMedication.id
          ? {
              ...p,
              medicationId: medicationForm.medicationId,
              medicationName: medicationForm.medicationName,
              medicationType: medicationForm.medicationType as
                | "Prescribed"
                | "Non-Prescribed (Supplemental OTC)",
              descriptor:
                medicationForm.descriptor || undefined,
              genericName: medicationForm.genericName,
              packaging: medicationForm.packaging,
              dose: medicationForm.dose,
              startDate: medicationForm.startDate,
              endDate: medicationForm.endDate || undefined,
              // AC1: consentReceived removed
              dosingPeriod: medicationForm.dosingPeriod,
              notTakenDaily: medicationForm.notTakenDaily,
              weeklyPattern: medicationForm.notTakenDaily
                ? medicationForm.weeklyPattern
                : undefined,
              allDay: medicationForm.allDay,
              doseRangeStartTime: medicationForm.allDay
                ? undefined
                : medicationForm.doseRangeStartTime,
              doseRangeEndTime: medicationForm.allDay
                ? undefined
                : medicationForm.doseRangeEndTime,
              treatmentPurpose:
                medicationForm.treatmentPurpose || undefined,
              minHoursBetweenDoses:
                medicationForm.minHoursBetweenDoses
                  ? parseInt(
                      medicationForm.minHoursBetweenDoses,
                    )
                  : undefined,
              maxDailyDoses: medicationForm.maxDailyDoses
                ? parseInt(medicationForm.maxDailyDoses)
                : undefined,
              countType: medicationForm.countType,
              // count is NOT editable
              instructions:
                medicationForm.instructions || undefined,
              status: medicationForm.status,
            }
          : p,
      ),
    );

    toast.success("Medication updated successfully");
    setEditDialogOpen(false);
    setSelectedMedication(null);
    resetForm();
  };

  // Handle View
  const handleViewClick = (medication: MedicationRecord) => {
    setSelectedMedication(medication);
    setViewDialogOpen(true);
  };

  // Handle Copy - exclude dose, dosing period, start/end date, start/end time
  const handleCopyClick = (medication: MedicationRecord) => {
    const med = medications.find(
      (m) => m.id === medication.medicationId,
    );

    setMedicationForm({
      medicationId: medication.medicationId,
      medicationName: medication.medicationName,
      medicationType: medication.medicationType,
      descriptor: medication.descriptor || "",
      genericName: medication.genericName,
      packaging: medication.packaging,
      dose: "", // Excluded
      startDate: "", // Excluded
      endDate: "", // Excluded
      // AC1, AC11: consentReceived removed, consent not cloned
      dosingPeriod: "", // Excluded
      notTakenDaily: medication.notTakenDaily,
      weeklyPattern: medication.weeklyPattern || [],
      weeklyRecurWeeks: "1",
      monthlyPatternType: "day",
      monthlyDay: "",
      monthlyWeeks: "1",
      monthlyOrdinal: "",
      monthlyWeekday: "",
      monthlyMonths: "1",
      allDay: medication.allDay,
      doseRangeStartTime: "", // Excluded
      doseRangeEndTime: "", // Excluded
      treatmentPurpose: medication.treatmentPurpose || "",
      minHoursBetweenDoses:
        medication.minHoursBetweenDoses?.toString() || "",
      maxDailyDoses: medication.maxDailyDoses?.toString() || "",
      countType: medication.countType,
      count: "0.00",
      instructions: medication.instructions || "",
      status: "active",
    });

    setMedicationSearchTerm(
      `${medication.medicationName} (${medication.genericName})`,
    );
    setCreateDialogOpen(true);
  };

  // Handle Delete
  // ── Pending-delete helpers ─────────────────────────────────────────────────

  /** True when a record's start date is still in the future. */
  const isPendingStartDateValid = (
    med: MedicationRecord,
  ): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [m, d, y] = med.startDate.split("/").map(Number);
    const start = new Date(y, m - 1, d);
    start.setHours(0, 0, 0, 0);
    return start > today;
  };

  /** True when no dispensation has ever been logged for this medication record. */
  const hasNoDispensation = (med: MedicationRecord): boolean =>
    !dispensations.some((d) => d.medicationId === med.id);

  /**
   * Initiates the pending-delete workflow:
   * 1. Role guard
   * 2. Pre-deletion validation (start date + dispensation)
   * 3. Consent existence check → soft warning or direct confirmation
   */
  const handleDeleteClick = (medication: MedicationRecord) => {
    // Security: enforce at handler level regardless of UI visibility
    if (!userCanDelete) return;

    // Validation 1: start date must not have been reached
    if (!isPendingStartDateValid(medication)) {
      setDeleteValidationError(
        "This record cannot be deleted because the start date has already been reached.",
      );
      return;
    }

    // Validation 2: no dispensation must exist
    if (!hasNoDispensation(medication)) {
      setDeleteValidationError(
        "This record cannot be deleted because one or more dispensations have been logged against it.",
      );
      return;
    }

    setDeletePendingMed(medication);

    // Check consent record existence
    const consentExists =
      medication.consentId != null &&
      medicationConsents.some(
        (c) => c.id === medication.consentId,
      );
    if (!consentExists) {
      // Soft warning: no consent record found
      setDeleteNoConsentWarningOpen(true);
    } else {
      // Go straight to final confirmation
      setDeleteDialogOpen(true);
    }
  };

  /** Called after user acknowledges the no-consent soft warning. */
  const handleNoConsentAcknowledge = () => {
    setDeleteNoConsentWarningOpen(false);
    setDeleteDialogOpen(true);
  };

  /** Executes atomic deletion + audit logging after final confirmation. */
  const handleConfirmDelete = () => {
    const med = deletePendingMed || selectedMedication;
    if (!med) return;

    // AC17: Standard users cannot delete Active (Executed) or Archived (Expired) consent records.
    // This is a belt-and-suspenders guard — Standard Staff cannot reach this handler
    // (blocked in handleDeleteClick), but we enforce explicitly here for auditability.
    if (med.consentId != null) {
      const existingConsent = medicationConsents.find(
        (c) => c.id === med.consentId,
      );
      if (
        existingConsent &&
        (existingConsent.status === "Executed" ||
          existingConsent.status === "Expired")
      ) {
        if (currentUserRole === "Standard Staff") {
          toast.error(
            "Standard users cannot delete Active or Archived consent records.",
          );
          setDeleteDialogOpen(false);
          return;
        }
      }
    }

    // AC8: Only delete the consent if it exists AND no other medication record
    // still references it (consent records are 1:many — shared across dose periods).
    const consentToDelete = (() => {
      if (med.consentId == null) return null;
      const consent = medicationConsents.find(
        (c) => c.id === med.consentId,
      );
      if (!consent) return null;
      // Check no other medication record (besides the one being deleted) references this consent
      const otherRefs = medicationRecords.filter(
        (r) => r.id !== med.id && r.consentId === med.consentId,
      );
      return otherRefs.length === 0 ? consent : null;
    })();

    const medName = `${med.medicationName}${med.descriptor ? ` ${med.descriptor}` : ""} ${med.dose}`;
    const timestamp = new Date().toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // AC10: Atomic deletion — compute both new states BEFORE applying either.
    // Snapshot current state so we can roll back if either operation throws.
    const prevMedRecords = medicationRecords;
    const prevConsents = medicationConsents;

    try {
      const nextMedRecords = prevMedRecords.filter(
        (r) => r.id !== med.id,
      );
      const nextConsents = consentToDelete
        ? prevConsents.filter(
            (c) => c.id !== consentToDelete.id,
          )
        : prevConsents;

      // Apply both state updates together (React 18 batches these in a single flush)
      setMedicationRecords(nextMedRecords);
      setMedicationConsents(nextConsents);

      // AC11: Audit log — capture acting user, ALL records deleted, and timestamp
      const auditEntry = {
        user: "Sohan Jadhavrao", // replace with auth context user in production
        role: currentUserRole,
        action: "DELETE_PENDING_MEDICATION",
        medicationRecordId: med.id,
        medicationName: medName,
        consentRecordDeleted: consentToDelete != null,
        consentRecordId: consentToDelete?.id ?? null,
        timestamp,
      };
      setDeletionAuditLog((prev) => [auditEntry, ...prev]);
      console.log(
        "[AUDIT] Pending medication deleted:",
        auditEntry,
      );

      toast.success("Medication deleted successfully");
      setDeleteDialogOpen(false);
      setDeletePendingMed(null);
      setSelectedMedication(null);
    } catch (err) {
      // AC10: If either operation fails, roll back to the snapshot state
      setMedicationRecords(prevMedRecords);
      setMedicationConsents(prevConsents);
      console.error(
        "[DELETE] Atomic deletion failed — rolled back:",
        err,
      );
      toast.error(
        "Deletion failed. No changes were made. Please try again.",
      );
    }
  };

  const filteredMedicationRecords =
    getFilteredMedicationRecords();

  return (
    <div className="space-y-4">
      {/* Header Section with Tabs */}
      <div
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        style={{
          marginBottom: 0,
          backgroundColor:
            "var(--slds-g-color-background-base)",
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius:
            "var(--slds-c-card-radius-border) var(--slds-c-card-radius-border) 0 0",
        }}
      >
        {/* Tabs on Left */}
        <div
          className="flex border-b overflow-x-auto overflow-y-hidden lg:self-end"
          style={{
            borderColor: "var(--slds-g-color-border-base-1)",
          }}
        >
          <button
            onClick={() => setActiveTab("current")}
            className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
              activeTab === "current"
                ? "text-[#145F33]"
                : "text-[#706e6b] hover:text-[#080707]"
            }`}
            style={
              activeTab === "current"
                ? {
                    borderBottom: "3px solid #145F33",
                    marginBottom: "-1px",
                  }
                : {}
            }
          >
            Current
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
              activeTab === "pending"
                ? "text-[#145F33]"
                : "text-[#706e6b] hover:text-[#080707]"
            }`}
            style={
              activeTab === "pending"
                ? {
                    borderBottom: "3px solid #145F33",
                    marginBottom: "-1px",
                  }
                : {}
            }
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab("archived")}
            className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
              activeTab === "archived"
                ? "text-[#145F33]"
                : "text-[#706e6b] hover:text-[#080707]"
            }`}
            style={
              activeTab === "archived"
                ? {
                    borderBottom: "3px solid #145F33",
                    marginBottom: "-1px",
                  }
                : {}
            }
          >
            Archived
          </button>
        </div>

        {/* Right side: role switcher + create button */}
        <div className="flex flex-col items-stretch lg:items-end gap-1 px-4 py-2">
          <div className="flex flex-wrap items-center lg:justify-end gap-2 sm:gap-3">
            {/* Role switcher — prototype only; replace with auth context in production */}
            <div className="flex items-center gap-1.5">
              <span
                className="slds-text-3"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Role:
              </span>
              <select
                value={currentUserRole}
                onChange={(e) =>
                  setCurrentUserRole(
                    e.target.value as typeof currentUserRole,
                  )
                }
                className="slds-text-3 h-7 rounded px-2 pr-6 appearance-none"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                  fontSize: "11px",
                }}
                title="Prototype: switch role to see field-level locking behaviour"
              >
                <option value="Standard Staff">
                  Standard Staff
                </option>
                <option value="Program Therapist">
                  Program Therapist
                </option>
                <option value="Program Manager">
                  Program Manager
                </option>
                <option value="System Admin">
                  System Admin
                </option>
              </select>
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="h-8 px-4 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              <Plus className="w-4 h-4" />
              Create Medication
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleContinueInLaserfiche}
              aria-describedby="laserfiche-continue-hint"
              className="h-8 px-4 text-[13px] font-medium rounded-full w-full sm:w-auto"
              style={{
                borderColor: "#145F33",
                color: "#145F33",
              }}
            >
              Continue
              <ExternalLink
                className="w-4 h-4 shrink-0"
                aria-hidden="true"
              />
            </Button>
          </div>
          <span
            id="laserfiche-continue-hint"
            className="text-[11px] leading-tight text-right"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Check outstanding consent requests in Laserfiche
          </span>
        </div>
      </div>

      {/* List View - Directly Attached */}
      <div
        className="overflow-hidden"
        style={{
          marginTop: 0,
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderTop: "none",
          borderRadius:
            "0 0 var(--slds-c-card-radius-border) var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="text-left"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                  borderBottom:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <th
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#706e6b]"
                  style={{ width: "40px" }}
                ></th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#706e6b]">
                  Medication
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#706e6b]">
                  Consent Status
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#706e6b]">
                  Dose Period
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#706e6b]">
                  Dose
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#706e6b]">
                  Packaging
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#706e6b]">
                  Start Date
                </th>
                {(activeTab === "pending" ||
                  activeTab === "archived") && (
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#706e6b]">
                    End Date
                  </th>
                )}
                <th
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#706e6b]"
                  style={{ width: "180px" }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Actions</span>
                    {activeTab === "pending" && (
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium leading-none"
                        style={{
                          backgroundColor: userCanDelete
                            ? "#e8f4f8"
                            : "#f5f5f5",
                          color: userCanDelete
                            ? "#0176d3"
                            : "#adadad",
                          border: `1px solid ${userCanDelete ? "#b6deff" : "#e0e0e0"}`,
                        }}
                        title={
                          userCanDelete
                            ? `Delete visible to: System Admin, Program Therapist, Program Manager (current: ${currentUserRole})`
                            : `Delete restricted — not available for ${currentUserRole}`
                        }
                      >
                        {/* Lock icon inline SVG — no extra import needed */}
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="3"
                            y="11"
                            width="18"
                            height="11"
                            rx="2"
                            ry="2"
                          />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        {userCanDelete
                          ? "Role restricted"
                          : "No delete access"}
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMedicationRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === "current" ? 7 : 8}
                    className="px-4 py-8 text-center text-[13px] text-[#706e6b]"
                  >
                    No medication records found
                  </td>
                </tr>
              ) : (
                filteredMedicationRecords.map((medication) => (
                  <tr
                    key={medication.id}
                    className="hover:bg-gray-50/80 transition-colors"
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleRow(medication.id)}
                        className="text-[#706e6b] hover:text-[#080707]"
                      >
                        {expandedRows.has(medication.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium">
                      {formatMedicationName(medication)}
                    </td>
                    {/* AC14, AC15: Consent Status Badge */}
                    <td className="px-4 py-3">
                      {(() => {
                        const badge =
                          getConsentStatusBadge(medication);
                        return (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
                          >
                            <span>{badge.text}</span>
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      {medication.dosingPeriod}
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      {medication.dose}
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      {medication.packaging}
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      {medication.startDate}
                    </td>
                    {(activeTab === "pending" ||
                      activeTab === "archived") && (
                      <td className="px-4 py-3 text-[13px]">
                        {medication.endDate || "-"}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleViewClick(medication)
                          }
                          className="h-7 px-2 text-[#706e6b] hover:text-[#080707] hover:bg-gray-100"
                          title="View Medication"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {/* AC8: View Consent Document */}
                        {medication.consentId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedMedication(medication);
                              setViewConsentDocumentOpen(true);
                            }}
                            className="h-7 px-2 text-[#145F33] hover:text-[#0d4625] hover:bg-green-50"
                            title="View Consent"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        )}
                        {activeTab !== "archived" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleEditClick(medication)
                            }
                            className="h-7 px-2 text-[#706e6b] hover:text-[#080707] hover:bg-gray-100"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleCopyClick(medication)
                          }
                          className="h-7 px-2 text-[#706e6b] hover:text-[#080707] hover:bg-gray-100"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {activeTab === "pending" &&
                          userCanDelete && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleDeleteClick(medication)
                              }
                              className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title={`Delete (${currentUserRole})`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={createDialogOpen || editDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditDialogOpen(false);
            setSelectedMedication(null);
            resetForm();
          }
        }}
      >
        <DialogContent
          size="xl"
          onInteractOutside={(event) => {
            // Prevent the Dialog from closing when clicking outside
            event.preventDefault();
          }}
        >
          <DialogHeader
            className="shrink-0 border-b pb-4"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)]">
                <FileText className="h-4 w-4 text-[var(--color-brand-primary)]" />
              </div>

              <div>
                <DialogTitle>
                  {editDialogOpen
                    ? "Edit Medication"
                    : "Create Medication"}
                </DialogTitle>

                <DialogDescription>
                  {editDialogOpen
                    ? "Update the constituent medication details below"
                    : "Enter the constituent medication details below"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogBody className="space-y-6 bg-white">
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="flex flex-col w-full gap-4">
                {/* Active-record locking banner (AC1, AC9) */}
                {editDialogOpen &&
                  selectedMedication &&
                  isActiveMedicationRecord(
                    selectedMedication,
                  ) &&
                  (() => {
                    const consent = medicationConsents.find(
                      (c) =>
                        c.id === selectedMedication.consentId,
                    );
                    const isMultiDose =
                      consent &&
                      consent.medicationRecordIds.length > 1;
                    return (
                      <>
                        <div
                          className="flex items-start gap-3 rounded-lg px-4 py-3"
                          style={{
                            backgroundColor: "#eff6ff",
                            border: "1px solid #bfdbfe",
                          }}
                        >
                          <Lock
                            className="h-4 w-4 mt-0.5 flex-shrink-0"
                            style={{ color: "#0176d3" }}
                          />
                          <div
                            className="slds-text-3"
                            style={{ color: "#1d4ed8" }}
                          >
                            <p
                              className="font-semibold mb-1"
                              style={{ fontSize: "12px" }}
                            >
                              Active record — field locking
                              enforced
                            </p>
                            {userIsElevated ? (
                              <p>
                                As{" "}
                                <strong>
                                  {currentUserRole}
                                </strong>{" "}
                                you may edit:{" "}
                                <strong>End Date</strong>,{" "}
                                <strong>Instructions</strong>,
                                and{" "}
                                <strong>
                                  Dose Range times
                                </strong>
                                . All other fields are
                                read-only.
                              </p>
                            ) : (
                              <p>
                                As{" "}
                                <strong>
                                  {currentUserRole}
                                </strong>{" "}
                                you may set an{" "}
                                <strong>End Date</strong> if
                                none exists.
                                {selectedMedication.endDate
                                  ? " The End Date is now locked — only Program Therapists, Program Managers, or above may change it."
                                  : " Once set, only Program Therapists, Program Managers, or above may change it."}{" "}
                                All other fields are read-only.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* AC10: Multi-dose period warning */}
                        {isMultiDose && (
                          <div
                            className="flex items-start gap-3 rounded-lg px-4 py-3"
                            style={{
                              backgroundColor: "#fffbeb",
                              border: "1px solid #fde68a",
                            }}
                          >
                            <AlertCircle
                              className="h-4 w-4 mt-0.5 flex-shrink-0"
                              style={{ color: "#92400e" }}
                            />
                            <div
                              className="slds-text-3"
                              style={{ color: "#78350f" }}
                            >
                              <p
                                className="font-semibold mb-1"
                                style={{ fontSize: "12px" }}
                              >
                                Multi-dose medication —{" "}
                                {
                                  consent!.medicationRecordIds
                                    .length
                                }{" "}
                                dose period records share this
                                consent
                              </p>
                              <p>
                                If any dose period needs to
                                change,{" "}
                                <strong>
                                  all{" "}
                                  {
                                    consent!.medicationRecordIds
                                      .length
                                  }{" "}
                                  medication records
                                </strong>{" "}
                                tied to this consent must be
                                end-dated. New medication
                                records and a new consent are
                                required for all dose periods.
                                Dose Period is locked and cannot
                                be changed here.
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}

                {/* Medication Lookup — locked on active records */}
                <div className="space-y-1.5">
                  {!isActiveLocked && (
                    <Label
                      htmlFor="medication"
                      className="slds-form-label"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Medication{" "}
                      <span className="text-red-600">*</span>
                    </Label>
                  )}
                  {isActiveLocked ? (
                    <ReadOnlyField
                      label="Medication *"
                      value={
                        medicationForm.medicationName
                          ? `${medicationForm.medicationName} (${medicationForm.genericName})`
                          : undefined
                      }
                    />
                  ) : (
                    <div className="relative">
                      {/* Trigger row */}
                      <div
                        className="flex items-center h-9 rounded-md px-3 gap-2 cursor-pointer"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                        }}
                        onClick={() =>
                          setShowMedicationDropdown(
                            (prev) => !prev,
                          )
                        }
                      >
                        <Search
                          className="w-3.5 h-3.5 flex-shrink-0"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        />
                        <input
                          id="medication"
                          value={medicationSearchTerm}
                          onChange={(e) => {
                            setMedicationSearchTerm(
                              e.target.value,
                            );
                            setShowMedicationDropdown(true);
                          }}
                          onBlur={() =>
                            setTimeout(
                              () =>
                                setShowMedicationDropdown(
                                  false,
                                ),
                              200,
                            )
                          }
                          placeholder="Search medications…"
                          autoComplete="off"
                          className="flex-1 min-w-0 bg-transparent outline-none slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        />
                        {medicationSearchTerm && (
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setMedicationSearchTerm("");
                              setMedicationForm({
                                ...medicationForm,
                                medicationId: 0,
                                medicationName: "",
                                genericName: "",
                              });
                              setShowMedicationDropdown(true);
                            }}
                            className="flex-shrink-0"
                          >
                            <X
                              className="w-3.5 h-3.5"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            />
                          </button>
                        )}
                        <ChevronDown
                          className="w-3.5 h-3.5 flex-shrink-0 transition-transform"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                            transform: showMedicationDropdown
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                          }}
                        />
                      </div>

                      {/* Dropdown list */}
                      {showMedicationDropdown && (
                        <div
                          className="absolute z-50 w-full mt-1 rounded-md shadow-lg overflow-hidden"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        >
                          <div className="max-h-56 overflow-y-auto">
                            {filteredMedications.length > 0 ? (
                              filteredMedications.map((med) => (
                                <button
                                  key={med.id}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleMedicationSelect(med);
                                  }}
                                  className="w-full px-3 py-2 text-left transition-colors"
                                  style={{
                                    backgroundColor:
                                      medicationForm.medicationId ===
                                      med.id
                                        ? "var(--slds-g-color-background-alt)"
                                        : "transparent",
                                  }}
                                  onMouseEnter={(e) => {
                                    (
                                      e.currentTarget as HTMLElement
                                    ).style.backgroundColor =
                                      "var(--slds-g-color-background-alt)";
                                  }}
                                  onMouseLeave={(e) => {
                                    (
                                      e.currentTarget as HTMLElement
                                    ).style.backgroundColor =
                                      medicationForm.medicationId ===
                                      med.id
                                        ? "var(--slds-g-color-background-alt)"
                                        : "transparent";
                                  }}
                                >
                                  <span
                                    className="slds-text-4 font-medium"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {med.name}
                                  </span>
                                  <span
                                    className="slds-text-3 ml-1.5"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    {med.genericName}
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div
                                className="px-3 py-4 text-center slds-text-3"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                No medications match "
                                {medicationSearchTerm}"
                              </div>
                            )}
                          </div>
                          <div
                            className="px-3 py-1.5 slds-text-3 border-t"
                            style={{
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                              color:
                                "var(--slds-g-color-text-weak)",
                              backgroundColor:
                                "var(--slds-g-color-background-alt)",
                            }}
                          >
                            {filteredMedications.length} of{" "}
                            {medications.length} medication
                            {medications.length !== 1
                              ? "s"
                              : ""}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Medication Type */}
                {isActiveLocked ? (
                  <ReadOnlyField
                    label="Medication Type *"
                    value={medicationForm.medicationType}
                    tooltip="Medication Type is locked on active records"
                  />
                ) : (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="medicationType"
                      className="slds-form-label"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Medication Type{" "}
                      <span className="text-red-600">*</span>
                    </Label>
                    <Select
                      value={medicationForm.medicationType}
                      onValueChange={(value) =>
                        setMedicationForm({
                          ...medicationForm,
                          medicationType: value as
                            | "Prescribed"
                            | "Non-Prescribed (Supplemental OTC)",
                        })
                      }
                    >
                      <SelectTrigger
                        className="h-9 slds-text-4"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <SelectValue placeholder="Select medication type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="Prescribed"
                          className="slds-text-4"
                        >
                          Prescribed
                        </SelectItem>
                        <SelectItem
                          value="Non-Prescribed (Supplemental OTC)"
                          className="slds-text-4"
                        >
                          Non-Prescribed (Supplemental OTC)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Conditional Descriptor */}
                {selectedMedicationLookup?.requiresDescriptor &&
                  (isActiveLocked ? (
                    <ReadOnlyField
                      label="Descriptor"
                      value={medicationForm.descriptor}
                    />
                  ) : (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="descriptor"
                        className="slds-form-label"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Descriptor
                      </Label>
                      <Input
                        id="descriptor"
                        value={medicationForm.descriptor}
                        onChange={(e) =>
                          setMedicationForm({
                            ...medicationForm,
                            descriptor: e.target.value,
                          })
                        }
                        placeholder="e.g., 500mg Capsule"
                        className="h-9 slds-text-4"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                        }}
                      />
                    </div>
                  ))}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Package */}
                  {isActiveLocked ? (
                    <ReadOnlyField
                      label="Package *"
                      value={medicationForm.packaging}
                    />
                  ) : (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="packaging"
                        className="slds-form-label"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Package{" "}
                        <span className="text-red-600">*</span>
                      </Label>
                      <Select
                        value={medicationForm.packaging}
                        onValueChange={(value) =>
                          setMedicationForm({
                            ...medicationForm,
                            packaging: value,
                          })
                        }
                        disabled={!selectedMedicationLookup}
                      >
                        <SelectTrigger
                          className="h-9 slds-text-4"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <SelectValue placeholder="Select package" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedMedicationLookup?.packages.map(
                            (pkg) => (
                              <SelectItem
                                key={pkg}
                                value={pkg}
                                className="slds-text-4"
                              >
                                {pkg}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Dose — locked on active records */}
                  {editDialogOpen &&
                  selectedMedication &&
                  !canEditField("other", selectedMedication) ? (
                    <ReadOnlyField
                      label="Dose *"
                      value={medicationForm.dose}
                    />
                  ) : (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="dose"
                        className="slds-form-label"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Dose{" "}
                        <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="dose"
                        value={medicationForm.dose}
                        onChange={(e) =>
                          setMedicationForm({
                            ...medicationForm,
                            dose: e.target.value,
                          })
                        }
                        placeholder="e.g., 20mg"
                        className="h-9 slds-text-4"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Start Date — locked on active records */}
                  {editDialogOpen &&
                  selectedMedication &&
                  !canEditField("other", selectedMedication) ? (
                    <ReadOnlyField
                      label="Start Date *"
                      value={medicationForm.startDate}
                    />
                  ) : (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="startDate"
                        className="slds-form-label"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Start Date{" "}
                        <span className="text-red-600">*</span>
                      </Label>
                      <DateInput
                        value={medicationForm.startDate}
                        onChange={(v) =>
                          setMedicationForm({
                            ...medicationForm,
                            startDate: v,
                          })
                        }
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                        }}
                      />
                    </div>
                  )}

                  {/* End Date — AC2: all roles if none yet; AC3/AC4: elevated only after initial entry */}
                  {editDialogOpen &&
                  selectedMedication &&
                  !canEditField(
                    "endDate",
                    selectedMedication,
                  ) ? (
                    <ReadOnlyField
                      label="End Date"
                      value={
                        medicationForm.endDate || undefined
                      }
                      tooltip={
                        selectedMedication.endDate
                          ? "End Date was set and is now locked for Standard Staff. Only Program Therapists, Program Managers, or above may change it (AC3)."
                          : "End Date is locked on active records for your role."
                      }
                    />
                  ) : (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="endDate"
                        className="slds-form-label"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        End Date
                        {editDialogOpen &&
                          selectedMedication &&
                          isActiveMedicationRecord(
                            selectedMedication,
                          ) &&
                          !selectedMedication.endDate && (
                            <span
                              className="ml-1 slds-text-3"
                              style={{ color: "#0176d3" }}
                            >
                              (all roles)
                            </span>
                          )}
                        {editDialogOpen &&
                          selectedMedication &&
                          isActiveMedicationRecord(
                            selectedMedication,
                          ) &&
                          selectedMedication.endDate &&
                          userIsElevated && (
                            <span
                              className="ml-1 slds-text-3"
                              style={{ color: "#145F33" }}
                            >
                              (elevated access)
                            </span>
                          )}
                      </Label>
                      <DateInput
                        value={medicationForm.endDate}
                        onChange={(v) =>
                          setMedicationForm({
                            ...medicationForm,
                            endDate: v,
                          })
                        }
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Consent — button/link for Edit, full inline form for Create */}
                {editDialogOpen && selectedMedication && (
                  <div
                    className="space-y-2 p-4 border rounded-md"
                    style={{
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-[13px] font-semibold">
                          Medication Consent
                        </Label>
                        <p className="text-xs text-[#706e6b] mt-1">
                          {selectedMedication.consentId
                            ? `Consent Status: ${medicationConsents.find((c) => c.id === selectedMedication.consentId)?.status || "Unknown"}`
                            : "No consent associated with this medication"}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setConsentDialogOpen(true);
                          const existingConsent =
                            medicationConsents.find(
                              (c) =>
                                c.id ===
                                selectedMedication.consentId,
                            );
                          if (existingConsent) {
                            setConsentForm({
                              status: existingConsent.status,
                              executedDate:
                                existingConsent.executedDate ||
                                "",
                              startDate:
                                existingConsent.startDate || "",
                              endDate:
                                existingConsent.endDate || "",
                              initialCount:
                                existingConsent.initialCount ||
                                "",
                              uploadedFileName:
                                existingConsent.uploadedFileName ||
                                "",
                              uploadedFileUrl:
                                existingConsent.uploadedFileUrl ||
                                "",
                              acknowledgedDosage: false,
                              acknowledgedTreatmentPurpose: false,
                              acknowledgedInstructions: false,
                            });
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-white rounded"
                        style={{ backgroundColor: "#145F33" }}
                      >
                        {selectedMedication.consentId
                          ? "View/Edit Consent"
                          : "Create Consent"}
                      </button>
                    </div>
                  </div>
                )}

                {createDialogOpen && (
                  <div
                    className="space-y-4 pt-2 border-t"
                    style={{
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <Label
                      className="text-[13px] font-semibold"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      Medication Consent
                    </Label>

                    {/* Consent Status */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="createConsentStatus"
                        className="slds-form-label"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Consent Status
                      </Label>
                      <Select
                        value={consentForm.status}
                        onValueChange={(value) =>
                          setConsentForm({
                            ...consentForm,
                            status: value as
                              | "Draft"
                              | "Sent"
                              | "Executed"
                              | "Expired",
                          })
                        }
                      >
                        <SelectTrigger
                          id="createConsentStatus"
                          className="h-9 slds-text-4"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">
                            Draft
                          </SelectItem>
                          <SelectItem value="Sent">
                            Sent
                          </SelectItem>
                          <SelectItem value="Executed">
                            Executed
                          </SelectItem>
                          <SelectItem value="Expired">
                            Expired
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p
                        className="slds-text-3 break-words"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Medication consent is completed through
                        the Laserfiche / DocuSign workflow.
                      </p>
                    </div>

                    {/* Medication Consent Workflow — consent is completed in
                        Laserfiche / DocuSign, not uploaded here */}
                    <Alert variant="info">
                      <Info />
                      <AlertTitle>
                        Medication Consent Workflow
                      </AlertTitle>
                      <AlertDescription>
                        <p>
                          Medication consent is completed
                          through Laserfiche. After this
                          medication is submitted, the
                          information entered here will be used
                          to prepare the consent form for
                          completion and signature.
                        </p>
                        <p className="mt-1">
                          Complete the remaining consent
                          information and signature workflow in
                          Laserfiche.
                        </p>
                      </AlertDescription>
                    </Alert>

                    {/* Consent Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="createConsentExecutedDate"
                          className="slds-form-label"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Executed Date
                        </Label>
                        <DateInput
                          value={consentForm.executedDate}
                          onChange={handleExecutedDateChange}
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="createConsentStartDate"
                          className="slds-form-label"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Consent Start Date
                        </Label>
                        <DateInput
                          value={consentForm.startDate}
                          onChange={(v) =>
                            setConsentForm({
                              ...consentForm,
                              startDate: v,
                            })
                          }
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                          }}
                        />
                        <p
                          className="slds-text-3"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Defaults from Executed Date
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="createConsentEndDate"
                          className="slds-form-label"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Consent End Date
                        </Label>
                        <DateInput
                          value={consentForm.endDate}
                          onChange={(v) =>
                            setConsentForm({
                              ...consentForm,
                              endDate: v,
                            })
                          }
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                          }}
                        />
                        <p
                          className="slds-text-3"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Defaults to 1 year - 1 day
                        </p>
                      </div>
                    </div>

                    {/* End Date Inclusivity Notice */}
                    <div
                      className="p-3 rounded-md"
                      style={{
                        backgroundColor: "#eff6ff",
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      <p className="slds-text-3 text-blue-900 flex items-start gap-1.5">
                        <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        The End Date is inclusive. Medication
                        remains available through 11:59 PM of
                        the End Date.
                      </p>
                    </div>

                    {/* Initial Count */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="createConsentInitialCount"
                        className="slds-form-label"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Initial Count
                      </Label>
                      <Input
                        id="createConsentInitialCount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={consentForm.initialCount}
                        onChange={(e) =>
                          setConsentForm({
                            ...consentForm,
                            initialCount: e.target.value,
                          })
                        }
                        placeholder="0.00"
                        disabled={
                          consentForm.status === "Executed" &&
                          consentForm.initialCount !== ""
                        }
                        className={
                          consentForm.status === "Executed" &&
                          consentForm.initialCount !== ""
                            ? "bg-gray-100 h-9 slds-text-4"
                            : "h-9 slds-text-4"
                        }
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                        }}
                      />
                      {consentForm.status === "Executed" &&
                        consentForm.initialCount !== "" && (
                          <p
                            className="slds-text-3 italic"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Initial Count is read-only once
                            consent is Executed
                          </p>
                        )}
                    </div>

                    {/* Acknowledgments — only when Executed */}
                    {consentForm.status === "Executed" && (
                      <div
                        className="space-y-3 p-4 rounded-md"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <Label
                          className="text-[13px] font-semibold"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          Required Acknowledgments
                        </Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="createAckDosage"
                              checked={
                                consentForm.acknowledgedDosage
                              }
                              onCheckedChange={(checked) =>
                                setConsentForm({
                                  ...consentForm,
                                  acknowledgedDosage:
                                    checked as boolean,
                                })
                              }
                            />
                            <Label
                              htmlFor="createAckDosage"
                              className="cursor-pointer text-[13px]"
                            >
                              I acknowledge the Dosage for this
                              medication
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="createAckTreatment"
                              checked={
                                consentForm.acknowledgedTreatmentPurpose
                              }
                              onCheckedChange={(checked) =>
                                setConsentForm({
                                  ...consentForm,
                                  acknowledgedTreatmentPurpose:
                                    checked as boolean,
                                })
                              }
                            />
                            <Label
                              htmlFor="createAckTreatment"
                              className="cursor-pointer text-[13px]"
                            >
                              I acknowledge the Treatment
                              Purpose for this medication
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="createAckInstructions"
                              checked={
                                consentForm.acknowledgedInstructions
                              }
                              onCheckedChange={(checked) =>
                                setConsentForm({
                                  ...consentForm,
                                  acknowledgedInstructions:
                                    checked as boolean,
                                })
                              }
                            />
                            <Label
                              htmlFor="createAckInstructions"
                              className="cursor-pointer text-[13px]"
                            >
                              I acknowledge the Instructions for
                              this medication
                            </Label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Dosing Period */}
                  {isActiveLocked ? (
                    <ReadOnlyField
                      label="Dosing Period *"
                      value={medicationForm.dosingPeriod}
                    />
                  ) : (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="dosingPeriod"
                        className="slds-form-label"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Dosing Period{" "}
                        <span className="text-red-600">*</span>
                      </Label>
                      <Select
                        value={medicationForm.dosingPeriod}
                        onValueChange={(value) =>
                          setMedicationForm({
                            ...medicationForm,
                            dosingPeriod: value,
                          })
                        }
                      >
                        <SelectTrigger
                          className="h-9 slds-text-4"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <SelectValue placeholder="Select dosing period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="Morning"
                            className="slds-text-4"
                          >
                            Morning
                          </SelectItem>
                          <SelectItem
                            value="Afternoon"
                            className="slds-text-4"
                          >
                            Afternoon
                          </SelectItem>
                          <SelectItem
                            value="Evening"
                            className="slds-text-4"
                          >
                            Evening
                          </SelectItem>
                          <SelectItem
                            value="Bedtime"
                            className="slds-text-4"
                          >
                            Bedtime
                          </SelectItem>
                          <SelectItem
                            value="PRN"
                            className="slds-text-4"
                          >
                            PRN
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Not Taken Daily */}
                <div className="space-y-3">
                  {isActiveLocked ? (
                    <ReadOnlyField
                      label="Not Taken Daily"
                      value={
                        medicationForm.notTakenDaily
                          ? "Yes"
                          : "No"
                      }
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="notTakenDaily"
                        checked={medicationForm.notTakenDaily}
                        onCheckedChange={(checked) =>
                          setMedicationForm({
                            ...medicationForm,
                            notTakenDaily: checked as boolean,
                          })
                        }
                      />
                      <Label
                        htmlFor="notTakenDaily"
                        className="cursor-pointer slds-text-4"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Not Taken Daily
                      </Label>
                    </div>
                  )}

                  {/* Weekly Pattern */}
                  {medicationForm.notTakenDaily && (
                    <div
                      className="space-y-4 p-4 border rounded-md"
                      style={{
                        borderColor:
                          "var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {/* Weekly Pattern Section */}
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-[#706e6b] font-semibold">
                          Weekly Pattern
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="text-[13px]">
                            Recur every
                          </span>
                          <Input
                            type="number"
                            value={
                              medicationForm.weeklyRecurWeeks
                            }
                            onChange={(e) =>
                              setMedicationForm({
                                ...medicationForm,
                                weeklyRecurWeeks:
                                  e.target.value,
                              })
                            }
                            className="w-16 text-center"
                            min="1"
                          />
                          <span className="text-[13px]">
                            week(s) on:
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {[
                            "Sunday",
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                          ].map((day) => (
                            <div
                              key={day}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`day-${day}`}
                                checked={medicationForm.weeklyPattern.includes(
                                  day,
                                )}
                                onCheckedChange={() =>
                                  toggleWeekday(day)
                                }
                              />
                              <Label
                                htmlFor={`day-${day}`}
                                className="cursor-pointer text-[13px]"
                              >
                                {day}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Monthly Pattern Section */}
                      <div
                        className="space-y-3 pt-3 border-t"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <Label className="text-xs uppercase text-[#706e6b] font-semibold">
                          Monthly Pattern
                        </Label>

                        {/* Option 1: Day of month */}
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="monthlyPatternDay"
                            name="monthlyPattern"
                            checked={
                              medicationForm.monthlyPatternType ===
                              "day"
                            }
                            onChange={() =>
                              setMedicationForm({
                                ...medicationForm,
                                monthlyPatternType: "day",
                              })
                            }
                            className="w-4 h-4 text-[#145F33]"
                          />
                          <Label
                            htmlFor="monthlyPatternDay"
                            className="cursor-pointer text-[13px] flex items-center gap-2"
                          >
                            <span>Day</span>
                            <Input
                              type="number"
                              min="1"
                              max="31"
                              value={medicationForm.monthlyDay}
                              onChange={(e) =>
                                setMedicationForm({
                                  ...medicationForm,
                                  monthlyDay: e.target.value,
                                  monthlyPatternType: "day",
                                })
                              }
                              className="w-16 text-center"
                              placeholder="1-31"
                            />
                            <span>of every</span>
                            <Input
                              type="number"
                              min="1"
                              value={
                                medicationForm.monthlyMonths
                              }
                              onChange={(e) =>
                                setMedicationForm({
                                  ...medicationForm,
                                  monthlyMonths: e.target.value,
                                  monthlyPatternType: "day",
                                })
                              }
                              className="w-16 text-center"
                            />
                            <span>month(s)</span>
                          </Label>
                        </div>

                        {/* Option 2: Weekday of month */}
                        <div className="flex items-start gap-2">
                          <input
                            type="radio"
                            id="monthlyPatternWeekday"
                            name="monthlyPattern"
                            checked={
                              medicationForm.monthlyPatternType ===
                              "weekday"
                            }
                            onChange={() =>
                              setMedicationForm({
                                ...medicationForm,
                                monthlyPatternType: "weekday",
                              })
                            }
                            className="w-4 h-4 text-[#145F33] mt-1"
                          />
                          <Label
                            htmlFor="monthlyPatternWeekday"
                            className="cursor-pointer text-[13px] flex flex-wrap items-center gap-2"
                          >
                            <span>The</span>
                            <Select
                              value={
                                medicationForm.monthlyOrdinal
                              }
                              onValueChange={(value) =>
                                setMedicationForm({
                                  ...medicationForm,
                                  monthlyOrdinal: value,
                                  monthlyPatternType: "weekday",
                                })
                              }
                            >
                              <SelectTrigger className="w-24 h-8">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="First">
                                  First
                                </SelectItem>
                                <SelectItem value="Second">
                                  Second
                                </SelectItem>
                                <SelectItem value="Third">
                                  Third
                                </SelectItem>
                                <SelectItem value="Fourth">
                                  Fourth
                                </SelectItem>
                                <SelectItem value="Last">
                                  Last
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Select
                              value={
                                medicationForm.monthlyWeekday
                              }
                              onValueChange={(value) =>
                                setMedicationForm({
                                  ...medicationForm,
                                  monthlyWeekday: value,
                                  monthlyPatternType: "weekday",
                                })
                              }
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue placeholder="Day" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Sunday">
                                  Sunday
                                </SelectItem>
                                <SelectItem value="Monday">
                                  Monday
                                </SelectItem>
                                <SelectItem value="Tuesday">
                                  Tuesday
                                </SelectItem>
                                <SelectItem value="Wednesday">
                                  Wednesday
                                </SelectItem>
                                <SelectItem value="Thursday">
                                  Thursday
                                </SelectItem>
                                <SelectItem value="Friday">
                                  Friday
                                </SelectItem>
                                <SelectItem value="Saturday">
                                  Saturday
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <span>of every</span>
                            <Input
                              type="number"
                              min="1"
                              value={
                                medicationForm.monthlyWeeks
                              }
                              onChange={(e) =>
                                setMedicationForm({
                                  ...medicationForm,
                                  monthlyWeeks: e.target.value,
                                  monthlyPatternType: "weekday",
                                })
                              }
                              className="w-16 text-center"
                            />
                            <span>month(s)</span>
                          </Label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* All Day */}
                {isActiveLocked ? (
                  <ReadOnlyField
                    label="All Day"
                    value={medicationForm.allDay ? "Yes" : "No"}
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allDay"
                      checked={medicationForm.allDay}
                      onCheckedChange={(checked) =>
                        setMedicationForm({
                          ...medicationForm,
                          allDay: checked as boolean,
                        })
                      }
                    />
                    <Label
                      htmlFor="allDay"
                      className="cursor-pointer slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      All Day
                    </Label>
                  </div>
                )}

                {/* Time Range — conditional; elevated roles only on active records */}
                {!medicationForm.allDay && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {editDialogOpen &&
                    selectedMedication &&
                    !canEditField(
                      "doseRangeStart",
                      selectedMedication,
                    ) ? (
                      <ReadOnlyField
                        label="Dose Range Start Time *"
                        value={
                          medicationForm.doseRangeStartTime
                        }
                        tooltip="Editable by Program Therapists, Program Managers, or above on active records"
                      />
                    ) : (
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="doseRangeStartTime"
                          className="slds-form-label"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Dose Range Start Time{" "}
                          <span className="text-red-600">
                            *
                          </span>
                          {editDialogOpen &&
                            selectedMedication &&
                            isActiveMedicationRecord(
                              selectedMedication,
                            ) &&
                            userIsElevated && (
                              <span
                                className="ml-1"
                                style={{ color: "#145F33" }}
                              >
                                (elevated access)
                              </span>
                            )}
                        </Label>
                        <TimeInput
                          value={
                            medicationForm.doseRangeStartTime
                          }
                          onChange={(v) =>
                            setMedicationForm({
                              ...medicationForm,
                              doseRangeStartTime: v,
                            })
                          }
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                          }}
                        />
                      </div>
                    )}
                    {editDialogOpen &&
                    selectedMedication &&
                    !canEditField(
                      "doseRangeEnd",
                      selectedMedication,
                    ) ? (
                      <ReadOnlyField
                        label="Dose Range End Time"
                        value={medicationForm.doseRangeEndTime}
                        tooltip="Editable by Program Therapists, Program Managers, or above on active records"
                      />
                    ) : (
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="doseRangeEndTime"
                          className="slds-form-label"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Dose Range End Time
                          {editDialogOpen &&
                            selectedMedication &&
                            isActiveMedicationRecord(
                              selectedMedication,
                            ) &&
                            userIsElevated && (
                              <span
                                className="ml-1"
                                style={{ color: "#145F33" }}
                              >
                                (elevated access)
                              </span>
                            )}
                        </Label>
                        <TimeInput
                          value={
                            medicationForm.doseRangeEndTime
                          }
                          onChange={(v) =>
                            setMedicationForm({
                              ...medicationForm,
                              doseRangeEndTime: v,
                            })
                          }
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Treatment Purpose — locked on active records */}
                {isActiveLocked ? (
                  <ReadOnlyField
                    label="Treatment Purpose"
                    value={
                      medicationForm.treatmentPurpose ||
                      undefined
                    }
                  />
                ) : (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="treatmentPurpose"
                      className="slds-form-label"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Treatment Purpose
                    </Label>
                    <Input
                      id="treatmentPurpose"
                      value={medicationForm.treatmentPurpose}
                      onChange={(e) =>
                        setMedicationForm({
                          ...medicationForm,
                          treatmentPurpose: e.target.value,
                        })
                      }
                      placeholder="Enter treatment purpose"
                      className="h-9 slds-text-4"
                      style={{
                        borderColor:
                          "var(--slds-g-color-border-base-1)",
                      }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Min Hours Between Doses — locked on active records */}
                  {isActiveLocked ? (
                    <ReadOnlyField
                      label="Min Hours Between Doses"
                      value={
                        medicationForm.minHoursBetweenDoses ||
                        undefined
                      }
                    />
                  ) : (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="minHoursBetweenDoses"
                        className="slds-form-label"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Min Hours Between Doses
                      </Label>
                      <Input
                        id="minHoursBetweenDoses"
                        type="number"
                        min="0"
                        value={
                          medicationForm.minHoursBetweenDoses
                        }
                        onChange={(e) =>
                          setMedicationForm({
                            ...medicationForm,
                            minHoursBetweenDoses:
                              e.target.value,
                          })
                        }
                        placeholder="e.g., 4"
                        className="h-9 slds-text-4"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                        }}
                      />
                    </div>
                  )}

                  {/* Max Daily Doses — locked on active records */}
                  {isActiveLocked ? (
                    <ReadOnlyField
                      label="Max Daily Doses"
                      value={
                        medicationForm.maxDailyDoses ||
                        undefined
                      }
                    />
                  ) : (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="maxDailyDoses"
                        className="slds-form-label"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Max Daily Doses
                      </Label>
                      <Input
                        id="maxDailyDoses"
                        type="number"
                        min="0"
                        value={medicationForm.maxDailyDoses}
                        onChange={(e) =>
                          setMedicationForm({
                            ...medicationForm,
                            maxDailyDoses: e.target.value,
                          })
                        }
                        placeholder="e.g., 4"
                        className="h-9 slds-text-4"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Count Type — locked on active records */}
                  {isActiveLocked ? (
                    <ReadOnlyField
                      label="Count Type *"
                      value={medicationForm.countType}
                    />
                  ) : (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="countType"
                        className="slds-form-label"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Count Type{" "}
                        <span className="text-red-600">*</span>
                      </Label>
                      <Select
                        value={medicationForm.countType}
                        onValueChange={(value) =>
                          setMedicationForm({
                            ...medicationForm,
                            countType: value as
                              "Unit" | "Volume",
                          })
                        }
                        disabled={!!selectedMedicationLookup}
                      >
                        <SelectTrigger
                          className="h-9 slds-text-4"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <SelectValue placeholder="Select count type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="Unit"
                            className="slds-text-4"
                          >
                            Unit
                          </SelectItem>
                          <SelectItem
                            value="Volume"
                            className="slds-text-4"
                          >
                            Volume
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Count — read-only in Edit (managed via Consent/Count Log); editable in Create */}
                  {editDialogOpen ? (
                    <ReadOnlyField
                      label="Count *"
                      value={medicationForm.count}
                      tooltip="Count is managed via the Consent record and Count Log — use the Consent workflow to update"
                    />
                  ) : (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="count"
                        className="slds-form-label"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Count{" "}
                        <span className="text-red-600">*</span>
                      </Label>
                      {medicationForm.countType === "Unit" ? (
                        <Input
                          id="count"
                          type="number"
                          step="0.01"
                          min="0"
                          max="999.99"
                          value={medicationForm.count}
                          onChange={(e) =>
                            setMedicationForm({
                              ...medicationForm,
                              count: e.target.value,
                            })
                          }
                          placeholder="0.00 – 999.99"
                          className="h-9 slds-text-4"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                          }}
                        />
                      ) : (
                        <Select
                          value={medicationForm.count}
                          onValueChange={(value) =>
                            setMedicationForm({
                              ...medicationForm,
                              count: value,
                            })
                          }
                        >
                          <SelectTrigger
                            className="h-9 slds-text-4"
                            style={{
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <SelectValue placeholder="Select volume" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="1"
                              className="slds-text-4"
                            >
                              Full
                            </SelectItem>
                            <SelectItem
                              value="0.75"
                              className="slds-text-4"
                            >
                              3/4
                            </SelectItem>
                            <SelectItem
                              value="0.5"
                              className="slds-text-4"
                            >
                              1/2
                            </SelectItem>
                            <SelectItem
                              value="0.25"
                              className="slds-text-4"
                            >
                              1/4
                            </SelectItem>
                            <SelectItem
                              value="0"
                              className="slds-text-4"
                            >
                              Empty
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                </div>

                {/* Instructions — elevated roles only on active records */}
                {editDialogOpen &&
                selectedMedication &&
                !canEditField(
                  "instructions",
                  selectedMedication,
                ) ? (
                  <ReadOnlyTextarea
                    label="Instructions"
                    value={
                      medicationForm.instructions || undefined
                    }
                    tooltip="Editable by Program Therapists, Program Managers, or above on active records"
                  />
                ) : (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="instructions"
                      className="slds-form-label"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Instructions
                      {editDialogOpen &&
                        selectedMedication &&
                        isActiveMedicationRecord(
                          selectedMedication,
                        ) &&
                        userIsElevated && (
                          <span
                            className="ml-1"
                            style={{ color: "#145F33" }}
                          >
                            (elevated access)
                          </span>
                        )}
                    </Label>
                    <Textarea
                      id="instructions"
                      value={medicationForm.instructions}
                      onChange={(e) =>
                        setMedicationForm({
                          ...medicationForm,
                          instructions: e.target.value,
                        })
                      }
                      placeholder="Enter instructions"
                      rows={3}
                      className="slds-text-4 resize-y"
                      style={{
                        borderColor:
                          "var(--slds-g-color-border-base-1)",
                      }}
                    />
                  </div>
                )}

                {/* Status — locked on active records */}
                {isActiveLocked ? (
                  <ReadOnlyField
                    label="Status *"
                    value={
                      medicationForm.status === "active"
                        ? "Active"
                        : "Inactive"
                    }
                  />
                ) : (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="status"
                      className="slds-form-label"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Status{" "}
                      <span className="text-red-600">*</span>
                    </Label>
                    <Select
                      value={medicationForm.status}
                      onValueChange={(value) =>
                        setMedicationForm({
                          ...medicationForm,
                          status: value as
                            "active" | "inactive",
                        })
                      }
                    >
                      <SelectTrigger
                        className="h-9 slds-text-4"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="active"
                          className="slds-text-4"
                        >
                          Active
                        </SelectItem>
                        <SelectItem
                          value="inactive"
                          className="slds-text-4"
                        >
                          Inactive
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </DialogBody>
          <DialogFooter
            className="shrink-0 border-t pt-4"
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
              onClick={() => {
                setCreateDialogOpen(false);
                setEditDialogOpen(false);
                setSelectedMedication(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAttempt}
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              {editDialogOpen ? "Submit" : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog
        open={saveConfirmDialogOpen}
        onOpenChange={setSaveConfirmDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#145F33]" />
              Confirm Medication Details
            </DialogTitle>
            <DialogDescription>
              Please confirm that all information is accurate
              and correct before proceeding.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={
                editDialogOpen ? handleSaveEdit : handleCreate
              }
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PRN Warning Dialog */}
      <Dialog
        open={prnWarningDialogOpen}
        onOpenChange={setPrnWarningDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Multiple PRN Medications
            </DialogTitle>
            <DialogDescription>
              A PRN medication entry for this medication already
              exists. Multiple PRN medications are allowed but
              should be reviewed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setPrnWarningDialogOpen(false);
                setSaveConfirmDialogOpen(true);
              }}
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Medication</DialogTitle>
            <DialogDescription>
              Medication details (read-only)
            </DialogDescription>
          </DialogHeader>
          {selectedMedication && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[#706e6b] text-xs uppercase">
                    Medication
                  </Label>
                  <p className="text-[13px] font-medium">
                    {formatMedicationName(selectedMedication)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[#706e6b] text-xs uppercase">
                    Packaging
                  </Label>
                  <p className="text-[13px] font-medium">
                    {selectedMedication.packaging}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[#706e6b] text-xs uppercase">
                    Dose
                  </Label>
                  <p className="text-[13px] font-medium">
                    {selectedMedication.dose}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[#706e6b] text-xs uppercase">
                    Dosing Period
                  </Label>
                  <p className="text-[13px] font-medium">
                    {selectedMedication.dosingPeriod}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[#706e6b] text-xs uppercase">
                    Start Date
                  </Label>
                  <p className="text-[13px] font-medium">
                    {selectedMedication.startDate}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[#706e6b] text-xs uppercase">
                    End Date
                  </Label>
                  <p className="text-[13px] font-medium">
                    {selectedMedication.endDate || "-"}
                  </p>
                </div>
              </div>
              {/* AC1: Consent Received field removed - replaced with consent management system */}
              {selectedMedication.consentId &&
                (() => {
                  const consent = medicationConsents.find(
                    (c) =>
                      c.id === selectedMedication.consentId,
                  );
                  return consent ? (
                    <div
                      className="p-4 border rounded-md"
                      style={{
                        borderColor:
                          "var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                      }}
                    >
                      <Label className="text-[#706e6b] text-xs uppercase mb-1.5 block">
                        Consent Information
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[#706e6b] text-xs">
                            Status
                          </Label>
                          <p className="text-[13px] font-medium">
                            {consent.status}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[#706e6b] text-xs">
                            Executed Date
                          </Label>
                          <p className="text-[13px] font-medium">
                            {consent.executedDate || "-"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[#706e6b] text-xs">
                            Start Date
                          </Label>
                          <p className="text-[13px] font-medium">
                            {consent.startDate || "-"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[#706e6b] text-xs">
                            End Date (Inclusive)
                          </Label>
                          <p className="text-[13px] font-medium">
                            {consent.endDate || "-"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[#706e6b] text-xs">
                            Initial Count
                          </Label>
                          <p className="text-[13px] font-medium">
                            {consent.initialCount || "-"}
                          </p>
                        </div>
                        {consent.uploadedFileName && (
                          <div className="space-y-1">
                            <Label className="text-[#706e6b] text-xs">
                              Document
                            </Label>
                            <button
                              onClick={() =>
                                setViewConsentDocumentOpen(true)
                              }
                              className="text-[13px] font-medium text-[#145F33] hover:underline flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              {consent.uploadedFileName}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null;
                })()}
              {/* AC14: Warning when consent is missing or not Executed */}
              {!selectedMedication.consentId && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <strong>Dispensation Blocked:</strong> No
                    consent associated with this medication.
                    Create a consent to enable dispensation.
                  </p>
                </div>
              )}
              {selectedMedication.consentId &&
                (() => {
                  const consent = medicationConsents.find(
                    (c) =>
                      c.id === selectedMedication.consentId,
                  );
                  if (
                    consent &&
                    (consent.status === "Draft" ||
                      consent.status === "Sent" ||
                      consent.status === "Expired")
                  ) {
                    return (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-xs text-yellow-900 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          <strong>
                            Dispensation Blocked:
                          </strong>{" "}
                          Consent status is "{consent.status}".
                          Medication will not appear in
                          dispensation workflows.
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              {!selectedMedication.allDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[#706e6b] text-xs uppercase">
                      Start Time
                    </Label>
                    <p className="text-[13px] font-medium">
                      {selectedMedication.doseRangeStartTime ||
                        "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[#706e6b] text-xs uppercase">
                      End Time
                    </Label>
                    <p className="text-[13px] font-medium">
                      {selectedMedication.doseRangeEndTime ||
                        "-"}
                    </p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[#706e6b] text-xs uppercase">
                    Count Type
                  </Label>
                  <p className="text-[13px] font-medium">
                    {selectedMedication.countType}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[#706e6b] text-xs uppercase">
                    Count
                  </Label>
                  <p className="text-[13px] font-medium">
                    {selectedMedication.count}
                  </p>
                </div>
              </div>
              {selectedMedication.instructions && (
                <div className="space-y-1">
                  <Label className="text-[#706e6b] text-xs uppercase">
                    Instructions
                  </Label>
                  <p className="text-[13px] font-medium">
                    {selectedMedication.instructions}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {/* ── Validation Error Dialog (blocked deletion) ──────────────────────── */}
      <Dialog
        open={!!deleteValidationError}
        onOpenChange={() => setDeleteValidationError(null)}
      >
        <DialogContent
          className="max-w-md"
          aria-describedby="del-val-desc"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[15px]">
              <span
                className="inline-flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: "#fef2f2" }}
              >
                <X className="h-4 w-4 text-red-600" />
              </span>
              Cannot Delete Record
            </DialogTitle>
            <DialogDescription
              id="del-val-desc"
              className="sr-only"
            >
              Deletion blocked
            </DialogDescription>
          </DialogHeader>
          <div
            className="flex items-start gap-3 rounded-lg px-4 py-3 text-[13px]"
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fca5a5",
              color: "#991b1b",
            }}
          >
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>{deleteValidationError}</p>
          </div>
          <DialogFooter className="mt-2">
            <Button
              className="rounded-full h-9 px-5 text-[13px]"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
              onClick={() => setDeleteValidationError(null)}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── No-Consent Soft Warning Dialog ──────────────────────────────────── */}
      <Dialog
        open={deleteNoConsentWarningOpen}
        onOpenChange={setDeleteNoConsentWarningOpen}
      >
        <DialogContent
          className="max-w-md"
          aria-describedby="del-noconsent-desc"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[15px]">
              <span
                className="inline-flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: "#fffbeb" }}
              >
                <AlertCircle
                  className="h-4 w-4"
                  style={{ color: "#d97706" }}
                />
              </span>
              No Consent Record Found
            </DialogTitle>
            <DialogDescription
              id="del-noconsent-desc"
              className="sr-only"
            >
              Soft warning before deletion
            </DialogDescription>
          </DialogHeader>
          <div
            className="rounded-lg px-4 py-3 text-[13px] leading-relaxed"
            style={{
              backgroundColor: "#fffbeb",
              border: "1px solid #fcd34d",
              color: "#78350f",
            }}
          >
            <p>
              No consent record was found for this medication.
              Please confirm there is no paper consent or
              outstanding signature request before proceeding.
            </p>
            <p
              className="mt-2 text-[11px]"
              style={{ color: "#92400e" }}
            >
              <em>
                Note: When DocuSign integration is enabled, this
                step will be re-evaluated to account for
                outstanding envelopes.
              </em>
            </p>
          </div>
          {deletePendingMed && (
            <div
              className="rounded-md px-3 py-2 text-[12px] font-medium"
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {formatMedicationName(deletePendingMed)}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-full h-9 px-5 text-[13px]"
              onClick={() => {
                setDeleteNoConsentWarningOpen(false);
                setDeletePendingMed(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full h-9 px-5 text-[13px]"
              style={{
                backgroundColor: "#d97706",
                color: "white",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#b45309")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#d97706")
              }
              onClick={handleNoConsentAcknowledge}
            >
              I Acknowledge — Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Final Confirmation Dialog ────────────────────────────────────────── */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogOpen(false);
            setDeletePendingMed(null);
            setSelectedMedication(null);
          }
        }}
      >
        <DialogContent
          className="max-w-md"
          aria-describedby="del-confirm-desc"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[15px]">
              <span
                className="inline-flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: "#fef2f2" }}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </span>
              Confirm Deletion
            </DialogTitle>
            <DialogDescription
              id="del-confirm-desc"
              className="text-[13px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {(deletePendingMed || selectedMedication) && (
            <div className="space-y-3 py-1">
              <div
                className="rounded-md px-3 py-2.5 text-[13px]"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <p
                  className="font-medium"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {formatMedicationName(
                    (deletePendingMed || selectedMedication)!,
                  )}
                </p>
                <p
                  className="text-[11px] mt-0.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Start Date:{" "}
                  {
                    (deletePendingMed || selectedMedication)!
                      .startDate
                  }
                </p>
              </div>

              {/* Consent-record callout (AC8 — shared-consent guard) */}
              {(() => {
                const med =
                  deletePendingMed || selectedMedication;
                if (!med || med.consentId == null) return null;
                const consent = medicationConsents.find(
                  (c) => c.id === med.consentId,
                );
                if (!consent) return null;
                const sharedWith = medicationRecords.filter(
                  (r) =>
                    r.id !== med.id &&
                    r.consentId === med.consentId,
                );
                return sharedWith.length > 0 ? (
                  <div
                    className="flex items-start gap-2 rounded-md px-3 py-2 text-[12px]"
                    style={{
                      backgroundColor: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      color: "#1d4ed8",
                    }}
                  >
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span>
                      The associated consent record is shared
                      with other medication records and will{" "}
                      <strong>not</strong> be deleted.
                    </span>
                  </div>
                ) : (
                  <div
                    className="flex items-start gap-2 rounded-md px-3 py-2 text-[12px]"
                    style={{
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fca5a5",
                      color: "#991b1b",
                    }}
                  >
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span>
                      The associated consent record will also be
                      permanently deleted.
                    </span>
                  </div>
                );
              })()}

              <div
                className="flex items-start gap-2 rounded-md px-3 py-2 text-[12px]"
                style={{
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#1d4ed8",
                }}
              >
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  This deletion will be recorded in the audit
                  log with your name and timestamp.
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-full h-9 px-5 text-[13px]"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletePendingMed(null);
                setSelectedMedication(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full h-9 px-5 text-[13px] text-white"
              style={{ backgroundColor: "#c23934" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#8a2a27")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#c23934")
              }
              onClick={handleConfirmDelete}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NEW: AC2, AC4 - Consent Management Dialog */}
      <Dialog
        open={consentDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setConsentDialogOpen(false);
            resetConsentForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Medication Consent Management
            </DialogTitle>
            <DialogDescription>
              Upload the executed consent document and configure
              required dates. DocuSign integration is reserved
              for future state.
            </DialogDescription>
            {/* AC17: Explicit restriction — standard users cannot delete Active or Archived consent records */}
            <div
              className="flex items-start gap-2 mt-2 p-2 rounded text-[11px]"
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
                color: "var(--slds-g-color-text-weak)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              Standard users cannot delete Active or Archived
              consent records. Deletion of protected records
              requires administrator access.
            </div>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Consent Status */}
            <div className="space-y-1.5">
              <Label htmlFor="consentStatus">
                Consent Status
              </Label>
              <Select
                value={consentForm.status}
                onValueChange={(value) =>
                  setConsentForm({
                    ...consentForm,
                    status: value as any,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Executed">
                    Executed
                  </SelectItem>
                  <SelectItem value="Expired">
                    Expired
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[#706e6b]">
                DocuSign integration is reserved for future
                state. Use "Draft" for manual uploads.
              </p>
            </div>

            {/* AC2: Manual Upload */}
            <div className="space-y-1.5">
              <Label
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Upload Consent Document
              </Label>
              {consentForm.uploadedFileName ? (
                <div
                  className="flex items-center justify-between gap-3 rounded-md px-4 py-3"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-md shrink-0"
                      style={{
                        backgroundColor: "#ffffff",
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <FileText
                        className="w-4 h-4"
                        style={{ color: "#145F33" }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div
                        className="slds-text-4 truncate"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {consentForm.uploadedFileName}
                      </div>
                      <div
                        className="slds-text-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Uploaded
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <label
                      htmlFor="consentFileInput"
                      className="slds-text-4 rounded-full px-3 h-9 inline-flex items-center cursor-pointer"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        color:
                          "var(--slds-g-color-text-default)",
                        backgroundColor: "#ffffff",
                      }}
                    >
                      Replace
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        handleConsentFileUpload({
                          target: { files: null },
                        } as unknown as React.ChangeEvent<HTMLInputElement>)
                      }
                      className="inline-flex items-center justify-center w-9 h-9 rounded-full"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: "#ffffff",
                        color: "#c23934",
                      }}
                      aria-label="Remove uploaded document"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <Input
                      id="consentFileInput"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleConsentFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="consentFileInput"
                  className="flex flex-col items-center justify-center gap-2 rounded-md px-4 py-8 cursor-pointer transition-colors"
                  style={{
                    border:
                      "1px dashed var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full"
                    style={{
                      backgroundColor: "#ffffff",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <Upload
                      className="w-5 h-5"
                      style={{ color: "#145F33" }}
                    />
                  </div>
                  <div className="text-center space-y-1">
                    <div
                      className="slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      <span
                        style={{
                          color: "#145F33",
                          fontWeight: 600,
                        }}
                      >
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </div>
                    <div
                      className="slds-text-3"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      PDF, DOC, or DOCX up to 10MB
                    </div>
                  </div>
                  <Input
                    id="consentFileInput"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleConsentFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* AC4: Required Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="executedDate">
                  Executed Date *
                </Label>
                <Input
                  id="executedDate"
                  type="text"
                  value={consentForm.executedDate}
                  onChange={(e) =>
                    handleExecutedDateChange(e.target.value)
                  }
                  placeholder="MM/DD/YYYY"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="text"
                  value={consentForm.startDate}
                  onChange={(e) =>
                    handleConsentStartDateChange(e.target.value)
                  }
                  placeholder="MM/DD/YYYY"
                />
                <p className="text-xs text-[#706e6b]">
                  Defaults from Executed Date · changing
                  recalculates End Date
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="text"
                  value={consentForm.endDate}
                  onChange={(e) =>
                    setConsentForm({
                      ...consentForm,
                      endDate: e.target.value,
                    })
                  }
                  placeholder="MM/DD/YYYY"
                />
                <p className="text-xs text-[#706e6b]">
                  Defaults to Start Date + 364 days (editable)
                </p>
              </div>
            </div>

            {/* AC3: End Date Inclusivity Notice */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-900">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                The End Date is inclusive. Medication remains
                available through 11:59 PM of the End Date.
              </p>
            </div>

            {/* Count per dose period — required for all linked records before consent can be activated */}
            {selectedMedication &&
              (() => {
                const linkedRecords = medicationRecords.filter(
                  (r) =>
                    r.medicationId ===
                      selectedMedication.medicationId &&
                    r.id !== selectedMedication.id,
                );
                const allRecords = [
                  selectedMedication,
                  ...linkedRecords,
                ];
                const isExecuted =
                  consentForm.status === "Executed";
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label
                        className="slds-text-4 font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Initial Count per Dose Period *
                      </Label>
                      {allRecords.length > 1 && (
                        <span
                          className="slds-text-3 px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: "#e8f4f8",
                            color: "#0176d3",
                            border: "1px solid #b6deff",
                          }}
                        >
                          {allRecords.length} dose period
                          {allRecords.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div
                      className="rounded-lg overflow-hidden"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <table
                        className="w-full"
                        style={{ borderCollapse: "collapse" }}
                      >
                        <thead
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                          }}
                        >
                          <tr>
                            <th
                              className="px-3 py-2 text-left slds-text-3 font-semibold uppercase tracking-wide"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              Dose Period
                            </th>
                            <th
                              className="px-3 py-2 text-left slds-text-3 font-semibold uppercase tracking-wide"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              Medication
                            </th>
                            <th
                              className="px-3 py-2 text-left slds-text-3 font-semibold uppercase tracking-wide"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                width: "120px",
                              }}
                            >
                              Count *
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {allRecords.map((rec, idx) => {
                            const val =
                              perDosePeriodCounts[rec.id] ?? "";
                            const existingLogEntry =
                              countLog.find(
                                (l) =>
                                  l.medicationRecordId ===
                                    rec.id &&
                                  l.consentId != null,
                              );
                            const readOnly =
                              isExecuted && !!existingLogEntry;
                            return (
                              <tr
                                key={rec.id}
                                style={{
                                  borderBottom:
                                    idx < allRecords.length - 1
                                      ? "1px solid var(--slds-g-color-border-base-1)"
                                      : "none",
                                }}
                              >
                                <td className="px-3 py-2.5">
                                  <span
                                    className="slds-text-4 font-medium"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {rec.dosingPeriod}
                                  </span>
                                  {rec.id ===
                                    selectedMedication.id && (
                                    <span
                                      className="ml-1.5 slds-text-3 px-1.5 py-0.5 rounded"
                                      style={{
                                        backgroundColor:
                                          "#e6f2eb",
                                        color: "#145F33",
                                      }}
                                    >
                                      Primary
                                    </span>
                                  )}
                                </td>
                                <td
                                  className="px-3 py-2.5 slds-text-4"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  {rec.dose}
                                </td>
                                <td className="px-3 py-2.5">
                                  {readOnly ? (
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className="slds-text-4 font-medium"
                                        style={{
                                          color:
                                            "var(--slds-g-color-text-default)",
                                        }}
                                      >
                                        {existingLogEntry?.count ??
                                          val}
                                      </span>
                                      <span
                                        className="slds-text-3"
                                        style={{
                                          color: "#16a34a",
                                        }}
                                      >
                                        ✓ Logged
                                      </span>
                                    </div>
                                  ) : (
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={val}
                                      onChange={(e) =>
                                        setPerDosePeriodCounts(
                                          (prev) => ({
                                            ...prev,
                                            [rec.id]:
                                              e.target.value,
                                          }),
                                        )
                                      }
                                      placeholder="0.00"
                                      className="h-8 slds-text-4"
                                      style={{
                                        borderColor: val
                                          ? "var(--slds-g-color-border-base-1)"
                                          : "#fca5a5",
                                        width: "100px",
                                      }}
                                    />
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {isExecuted && (
                      <p
                        className="slds-text-3 italic"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Count values are read-only once the
                        consent is marked Executed.
                      </p>
                    )}
                  </div>
                );
              })()}

            {/* Pre-Submission Confirmation — required before marking Executed */}
            {consentForm.status === "Executed" && (
              <div
                className="space-y-4 rounded-lg p-4"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="inline-flex items-center justify-center h-6 w-6 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: "#e8f4f8",
                      border: "1px solid #b6deff",
                    }}
                  >
                    <AlertCircle
                      className="h-3.5 w-3.5"
                      style={{ color: "#0176d3" }}
                    />
                  </div>
                  <p
                    className="slds-text-4 font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Pre-Submission Confirmation
                  </p>
                </div>
                <p
                  className="slds-text-3"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Review each field value below and check the
                  box to confirm it is correct before this
                  consent can be marked Executed.
                </p>

                {/* Dosage */}
                <div
                  className="rounded-md p-3 space-y-2"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border: `1px solid ${consentForm.acknowledgedDosage ? "#86efac" : "var(--slds-g-color-border-base-1)"}`,
                  }}
                >
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="ackDosage"
                      checked={consentForm.acknowledgedDosage}
                      onCheckedChange={(checked) =>
                        setConsentForm({
                          ...consentForm,
                          acknowledgedDosage:
                            checked as boolean,
                        })
                      }
                    />
                    <div className="flex-1 space-y-1">
                      <Label
                        htmlFor="ackDosage"
                        className="cursor-pointer slds-text-4 font-medium"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Dosage
                      </Label>
                      <p
                        className="slds-text-4"
                        style={{
                          color: consentForm.acknowledgedDosage
                            ? "#166534"
                            : "var(--slds-g-color-text-default)",
                        }}
                      >
                        {selectedMedication?.dose || (
                          <span
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            —
                          </span>
                        )}
                      </p>
                    </div>
                    {consentForm.acknowledgedDosage && (
                      <span
                        style={{
                          color: "#16a34a",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        ✓ Confirmed
                      </span>
                    )}
                  </div>
                </div>

                {/* Treatment Purpose */}
                <div
                  className="rounded-md p-3 space-y-2"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border: `1px solid ${consentForm.acknowledgedTreatmentPurpose ? "#86efac" : "var(--slds-g-color-border-base-1)"}`,
                  }}
                >
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="ackTreatment"
                      checked={
                        consentForm.acknowledgedTreatmentPurpose
                      }
                      onCheckedChange={(checked) =>
                        setConsentForm({
                          ...consentForm,
                          acknowledgedTreatmentPurpose:
                            checked as boolean,
                        })
                      }
                    />
                    <div className="flex-1 space-y-1">
                      <Label
                        htmlFor="ackTreatment"
                        className="cursor-pointer slds-text-4 font-medium"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Treatment Purpose
                      </Label>
                      <p
                        className="slds-text-4"
                        style={{
                          color:
                            consentForm.acknowledgedTreatmentPurpose
                              ? "#166534"
                              : "var(--slds-g-color-text-default)",
                        }}
                      >
                        {selectedMedication?.treatmentPurpose || (
                          <span
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            —
                          </span>
                        )}
                      </p>
                    </div>
                    {consentForm.acknowledgedTreatmentPurpose && (
                      <span
                        style={{
                          color: "#16a34a",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        ✓ Confirmed
                      </span>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <div
                  className="rounded-md p-3 space-y-2"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border: `1px solid ${consentForm.acknowledgedInstructions ? "#86efac" : "var(--slds-g-color-border-base-1)"}`,
                  }}
                >
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="ackInstructions"
                      checked={
                        consentForm.acknowledgedInstructions
                      }
                      onCheckedChange={(checked) =>
                        setConsentForm({
                          ...consentForm,
                          acknowledgedInstructions:
                            checked as boolean,
                        })
                      }
                    />
                    <div className="flex-1 space-y-1">
                      <Label
                        htmlFor="ackInstructions"
                        className="cursor-pointer slds-text-4 font-medium"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Instructions
                      </Label>
                      <p
                        className="slds-text-4"
                        style={{
                          color:
                            consentForm.acknowledgedInstructions
                              ? "#166534"
                              : "var(--slds-g-color-text-default)",
                        }}
                      >
                        {selectedMedication?.instructions || (
                          <span
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            —
                          </span>
                        )}
                      </p>
                    </div>
                    {consentForm.acknowledgedInstructions && (
                      <span
                        style={{
                          color: "#16a34a",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        ✓ Confirmed
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress indicator */}
                {(() => {
                  const confirmed = [
                    consentForm.acknowledgedDosage,
                    consentForm.acknowledgedTreatmentPurpose,
                    consentForm.acknowledgedInstructions,
                  ].filter(Boolean).length;
                  return confirmed < 3 ? (
                    <p
                      className="slds-text-3"
                      style={{ color: "#d97706" }}
                    >
                      {3 - confirmed} confirmation
                      {3 - confirmed !== 1 ? "s" : ""} remaining
                      before this consent can be saved as
                      Executed.
                    </p>
                  ) : (
                    <p
                      className="slds-text-3 font-medium"
                      style={{ color: "#166534" }}
                    >
                      ✓ All fields confirmed — consent is ready
                      to be marked Executed.
                    </p>
                  );
                })()}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConsentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateConsent}
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              Save Consent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AC10/AC11: Consent Overlap — HARD BLOCK per spec */}
      <Dialog
        open={consentOverlapWarningOpen}
        onOpenChange={(open) => {
          if (!open) {
            setConsentOverlapWarningOpen(false);
            setOverlappingConsent(null);
          }
        }}
      >
        <DialogContent
          className="max-w-md"
          aria-describedby="overlap-desc"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[15px]">
              <span
                className="inline-flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: "#fef2f2" }}
              >
                <AlertCircle className="h-4 w-4 text-red-600" />
              </span>
              Submission Blocked
            </DialogTitle>
            {/* AC11: Exact required error message */}
            <DialogDescription
              id="overlap-desc"
              className="sr-only"
            >
              Overlap hard block
            </DialogDescription>
          </DialogHeader>

          <div
            className="flex items-start gap-3 rounded-lg px-4 py-3 text-[13px] leading-relaxed"
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fca5a5",
              color: "#991b1b",
            }}
          >
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-600" />
            <p>
              An active medication record and consent already
              exist for this medication and dose period. Please
              end-date the existing record before creating a new
              one.
            </p>
          </div>

          {overlappingConsent && (
            <div
              className="rounded-md px-3 py-2.5 text-[12px] space-y-1"
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <p
                className="font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Conflicting consent
              </p>
              <p
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {overlappingConsent.startDate} –{" "}
                {overlappingConsent.endDate || "No end date"} ·
                Status: {overlappingConsent.status}
              </p>
            </div>
          )}

          <DialogFooter>
            {/* AC11: Hard block — only Cancel; no "proceed" or "replace" path */}
            <Button
              className="rounded-full h-9 px-5 text-[13px]"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
              onClick={() => {
                setConsentOverlapWarningOpen(false);
                setOverlappingConsent(null);
              }}
            >
              OK — Go Back and End-Date Existing Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NEW: AC8 - View Consent Document Dialog */}
      <Dialog
        open={viewConsentDocumentOpen}
        onOpenChange={setViewConsentDocumentOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Consent Document</DialogTitle>
            <DialogDescription>
              View uploaded consent document
            </DialogDescription>
          </DialogHeader>
          {selectedMedication &&
            (() => {
              const consent = medicationConsents.find(
                (c) => c.id === selectedMedication.consentId,
              );
              return consent ? (
                <div className="py-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-[#706e6b]">
                        File Name
                      </Label>
                      <p className="text-[13px] font-medium">
                        {consent.uploadedFileName ||
                          "No file uploaded"}
                      </p>
                    </div>
                    {consent.uploadedFileUrl && (
                      <div className="bg-gray-50 p-8 rounded border flex items-center justify-center min-h-[400px]">
                        <p className="text-[13px] text-[#706e6b]">
                          Document preview placeholder. In
                          production, this would display the PDF
                          or document viewer.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-[#706e6b] py-4">
                  No consent document found.
                </p>
              );
            })()}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewConsentDocumentOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NEW: AC13 - Acknowledgment Confirmation Dialog */}
      <Dialog
        open={consentAcknowledgmentOpen}
        onOpenChange={setConsentAcknowledgmentOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acknowledgment Required</DialogTitle>
            <DialogDescription>
              Please acknowledge all required fields before
              marking this consent as Executed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="finalAckDosage"
                checked={consentForm.acknowledgedDosage}
                onCheckedChange={(checked) =>
                  setConsentForm({
                    ...consentForm,
                    acknowledgedDosage: checked as boolean,
                  })
                }
              />
              <Label
                htmlFor="finalAckDosage"
                className="cursor-pointer text-[13px]"
              >
                I acknowledge the Dosage for this medication
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="finalAckTreatment"
                checked={
                  consentForm.acknowledgedTreatmentPurpose
                }
                onCheckedChange={(checked) =>
                  setConsentForm({
                    ...consentForm,
                    acknowledgedTreatmentPurpose:
                      checked as boolean,
                  })
                }
              />
              <Label
                htmlFor="finalAckTreatment"
                className="cursor-pointer text-[13px]"
              >
                I acknowledge the Treatment Purpose for this
                medication
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="finalAckInstructions"
                checked={consentForm.acknowledgedInstructions}
                onCheckedChange={(checked) =>
                  setConsentForm({
                    ...consentForm,
                    acknowledgedInstructions:
                      checked as boolean,
                  })
                }
              />
              <Label
                htmlFor="finalAckInstructions"
                className="cursor-pointer text-[13px]"
              >
                I acknowledge the Instructions for this
                medication
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConsentAcknowledgmentOpen(false)
              }
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (validateConsentAcknowledgments()) {
                  setConsentAcknowledgmentOpen(false);
                  handleCreateConsent();
                }
              }}
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
              disabled={
                !consentForm.acknowledgedDosage ||
                !consentForm.acknowledgedTreatmentPurpose ||
                !consentForm.acknowledgedInstructions
              }
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}