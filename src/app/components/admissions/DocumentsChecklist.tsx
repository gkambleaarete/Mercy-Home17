import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  MinusCircle,
  XCircle,
  FileText,
  Plus,
  Search,
  RotateCcw,
  ArrowLeft,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { DateInput } from "../ui/date-input";
import { toast } from "sonner@2.0.3";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import { useNavigate } from "react-router";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type ItemStatus = "received" | "outstanding" | "not-needed";

interface BaseItem {
  id: string;
  name: string;
  formCode?: string;
  required: boolean;
}

interface SingleItem extends BaseItem {
  type: "single";
  status: ItemStatus;
  dateFiledReceived?: string;
  expirationDate?: string;
  notes?: string;
}

interface BilingualSubStatus {
  status: ItemStatus;
  dateFiledReceived?: string;
}

interface BilingualItem extends BaseItem {
  type: "bilingual";
  formCodeEs?: string;
  en: BilingualSubStatus;
  es: BilingualSubStatus;
}

interface SubDoc {
  id: string;
  label: string;
  status: ItemStatus;
  dateFiledReceived?: string;
}

interface MultiItem extends BaseItem {
  type: "multi";
  docs: SubDoc[];
}

interface RoiSub {
  type: string;
  status: ItemStatus;
  dateFiledReceived?: string;
}

interface RoiItem extends BaseItem {
  type: "roi";
  roiItems: RoiSub[];
}

type ChecklistItem = SingleItem | BilingualItem | MultiItem | RoiItem;

interface Section {
  id: string;
  name: string;
  items: ChecklistItem[];
}

// ─────────────────────────────────────────────────────────────
// Initial Data
// ─────────────────────────────────────────────────────────────

const TODAY = "2026-08-17";

const INITIAL_SECTIONS: Section[] = [
  {
    id: "admissions",
    name: "Admissions Documents",
    items: [
      {
        id: "adm-1",
        name: "Admission Agreement",
        formCode: "YC-FORM-100.04",
        formCodeEs: "YC-FORM-100.04s",
        type: "bilingual",
        required: true,
        en: { status: "received", dateFiledReceived: "2026-07-15" },
        es: { status: "received", dateFiledReceived: "2026-07-15" },
      } as BilingualItem,
      {
        id: "adm-2",
        name: "Bill of Rights",
        formCode: "YC-FORM-100.05",
        formCodeEs: "YC-FORM-100.05s",
        type: "bilingual",
        required: true,
        en: { status: "received", dateFiledReceived: "2026-07-15" },
        es: { status: "outstanding" },
      } as BilingualItem,
      {
        id: "adm-3",
        name: "Photo Release",
        formCode: "YC-FORM-100.09",
        formCodeEs: "YC-FORM-100.09s",
        type: "bilingual",
        required: false,
        en: { status: "outstanding" },
        es: { status: "outstanding" },
      } as BilingualItem,
      {
        id: "adm-4",
        name: "Placement Summary",
        type: "single",
        required: true,
        status: "received",
        dateFiledReceived: "2026-07-14",
      } as SingleItem,
      {
        id: "adm-5",
        name: "DCFS Authorization Letter",
        type: "single",
        required: true,
        status: "outstanding",
      } as SingleItem,
      {
        id: "adm-6",
        name: "Program Orientation Acknowledgment",
        formCode: "YC-FORM-100.11",
        type: "single",
        required: false,
        status: "not-needed",
      } as SingleItem,
    ],
  },
  {
    id: "consent",
    name: "Consent Forms",
    items: [
      {
        id: "con-1",
        name: "General Consent for Treatment",
        formCode: "YC-FORM-200.01",
        type: "single",
        required: true,
        status: "received",
        dateFiledReceived: "2026-07-15",
      } as SingleItem,
      {
        id: "con-2",
        name: "Consent for Psychiatric Treatment",
        formCode: "YC-FORM-200.03",
        type: "single",
        required: true,
        status: "outstanding",
      } as SingleItem,
      {
        id: "con-3",
        name: "Consent for Medication Administration",
        formCode: "YC-FORM-200.04",
        type: "single",
        required: true,
        status: "outstanding",
      } as SingleItem,
      {
        id: "con-4",
        name: "Release of Information (ROI)",
        formCode: "YC-FORM-200.10",
        type: "roi",
        required: true,
        roiItems: [
          { type: "Blank", status: "received", dateFiledReceived: "2026-07-15" },
          { type: "Employer", status: "outstanding" },
          { type: "Hospital", status: "received", dateFiledReceived: "2026-07-15" },
          { type: "Mercy Home", status: "received", dateFiledReceived: "2026-07-15" },
          { type: "Significant Other", status: "outstanding" },
          { type: "Missing Persons / Law Enforcement", status: "outstanding" },
          { type: "Upgrade Pharmacy", status: "outstanding" },
          { type: "School", status: "outstanding" },
        ],
      } as RoiItem,
      {
        id: "con-5",
        name: "HIPAA Notice of Privacy Practices",
        formCode: "YC-FORM-200.15",
        type: "single",
        required: true,
        status: "received",
        dateFiledReceived: "2026-07-15",
      } as SingleItem,
    ],
  },
  {
    id: "medical",
    name: "Medical Records",
    items: [
      {
        id: "med-1",
        name: "Physical Examination Form",
        type: "single",
        required: true,
        status: "received",
        dateFiledReceived: "2026-07-10",
        expirationDate: "2027-07-10",
      } as SingleItem,
      {
        id: "med-2",
        name: "Immunization Records",
        type: "multi",
        required: true,
        docs: [
          { id: "med-2a", label: "Cook County Health — 2024", status: "received", dateFiledReceived: "2026-07-16" },
          { id: "med-2b", label: "Lurie Children's Hospital — 2023", status: "received", dateFiledReceived: "2026-07-16" },
        ],
      } as MultiItem,
      {
        id: "med-3",
        name: "Hospital Records",
        type: "multi",
        required: false,
        docs: [
          { id: "med-3a", label: "Northwestern Memorial — 2025", status: "received", dateFiledReceived: "2026-07-16" },
          { id: "med-3b", label: "Stroger Hospital — 2024", status: "outstanding" },
        ],
      } as MultiItem,
      {
        id: "med-4",
        name: "Dental Records",
        type: "multi",
        required: false,
        docs: [],
      } as MultiItem,
      {
        id: "med-5",
        name: "TB Test Results",
        type: "multi",
        required: true,
        docs: [
          { id: "med-5a", label: "Cook County — 05/2026", status: "received", dateFiledReceived: "2026-07-16" },
        ],
      } as MultiItem,
      {
        id: "med-6",
        name: "Current Medication List",
        type: "single",
        required: true,
        status: "received",
        dateFiledReceived: "2026-07-15",
      } as SingleItem,
      {
        id: "med-7",
        name: "Insurance Card (front & back)",
        type: "single",
        required: true,
        status: "outstanding",
      } as SingleItem,
      {
        id: "med-8",
        name: "Vision / Hearing Screening",
        type: "single",
        required: false,
        status: "not-needed",
      } as SingleItem,
    ],
  },
  {
    id: "mental-health",
    name: "Mental Health Records",
    items: [
      {
        id: "mh-1",
        name: "Psychiatric Evaluation",
        type: "multi",
        required: true,
        docs: [
          { id: "mh-1a", label: "Dr. Reyes — 03/2026", status: "received", dateFiledReceived: "2026-07-18" },
        ],
      } as MultiItem,
      {
        id: "mh-2",
        name: "Psychological Assessment",
        type: "multi",
        required: false,
        docs: [],
      } as MultiItem,
      {
        id: "mh-3",
        name: "Previous Therapy Records",
        type: "multi",
        required: false,
        docs: [
          { id: "mh-3a", label: "Chicago Family Services — 2024", status: "received", dateFiledReceived: "2026-07-18" },
          { id: "mh-3b", label: "CDPH Mental Health — 2025", status: "received", dateFiledReceived: "2026-07-18" },
        ],
      } as MultiItem,
      {
        id: "mh-4",
        name: "Diagnosis Documentation",
        type: "single",
        required: true,
        status: "received",
        dateFiledReceived: "2026-07-18",
      } as SingleItem,
      {
        id: "mh-5",
        name: "Crisis Plan",
        type: "single",
        required: true,
        status: "outstanding",
      } as SingleItem,
    ],
  },
  {
    id: "education",
    name: "Education Records",
    items: [
      {
        id: "edu-1",
        name: "School Records / Transcripts",
        type: "multi",
        required: true,
        docs: [
          { id: "edu-1a", label: "Lincoln Park High — 2024–2025", status: "received", dateFiledReceived: "2026-07-20" },
        ],
      } as MultiItem,
      {
        id: "edu-2",
        name: "IEP / 504 Plan",
        type: "multi",
        required: false,
        docs: [],
      } as MultiItem,
      {
        id: "edu-3",
        name: "Most Recent Report Card",
        type: "single",
        required: true,
        status: "received",
        dateFiledReceived: "2026-07-20",
      } as SingleItem,
      {
        id: "edu-4",
        name: "School Enrollment Verification",
        type: "single",
        required: true,
        status: "outstanding",
      } as SingleItem,
      {
        id: "edu-5",
        name: "Employment Records",
        type: "single",
        required: false,
        status: "not-needed",
      } as SingleItem,
      {
        id: "edu-6",
        name: "GED / High School Diploma",
        type: "single",
        required: false,
        status: "not-needed",
      } as SingleItem,
    ],
  },
  {
    id: "identification",
    name: "Identification Records",
    items: [
      {
        id: "id-1",
        name: "Birth Certificate",
        type: "single",
        required: true,
        status: "received",
        dateFiledReceived: "2026-07-14",
      } as SingleItem,
      {
        id: "id-2",
        name: "Social Security Card",
        type: "single",
        required: true,
        status: "received",
        dateFiledReceived: "2026-07-14",
      } as SingleItem,
      {
        id: "id-3",
        name: "State ID / Driver's License",
        type: "single",
        required: false,
        status: "outstanding",
      } as SingleItem,
      {
        id: "id-4",
        name: "Passport",
        type: "single",
        required: false,
        status: "not-needed",
      } as SingleItem,
      {
        id: "id-5",
        name: "DCFS ID Card",
        type: "single",
        required: true,
        status: "outstanding",
      } as SingleItem,
      {
        id: "id-6",
        name: "Intake Photo",
        formCode: "YC-FORM-100.02",
        type: "single",
        required: true,
        status: "received",
        dateFiledReceived: "2026-07-15",
      } as SingleItem,
    ],
  },
  {
    id: "legal",
    name: "Legal Records",
    items: [
      {
        id: "leg-1",
        name: "Court Orders",
        type: "multi",
        required: true,
        docs: [
          { id: "leg-1a", label: "Cook County — Order of Protection 06/2026", status: "received", dateFiledReceived: "2026-07-16" },
          { id: "leg-1b", label: "Cook County — Temporary Custody 07/2026", status: "received", dateFiledReceived: "2026-07-16" },
        ],
      } as MultiItem,
      {
        id: "leg-2",
        name: "DCFS Case Plan",
        type: "single",
        required: true,
        status: "received",
        dateFiledReceived: "2026-07-16",
      } as SingleItem,
      {
        id: "leg-3",
        name: "Guardianship Documentation",
        type: "single",
        required: false,
        status: "not-needed",
      } as SingleItem,
      {
        id: "leg-4",
        name: "Juvenile Justice Records",
        type: "multi",
        required: false,
        docs: [],
      } as MultiItem,
      {
        id: "leg-5",
        name: "Probation Agreement",
        type: "single",
        required: false,
        status: "not-needed",
      } as SingleItem,
    ],
  },
  {
    id: "financial",
    name: "Financial Records",
    items: [
      {
        id: "fin-1",
        name: "Medicaid / Insurance Information",
        type: "single",
        required: true,
        status: "received",
        dateFiledReceived: "2026-07-15",
      } as SingleItem,
      {
        id: "fin-2",
        name: "SSI / Benefits Documentation",
        type: "single",
        required: false,
        status: "outstanding",
      } as SingleItem,
      {
        id: "fin-3",
        name: "Financial Aid Records",
        type: "single",
        required: false,
        status: "not-needed",
      } as SingleItem,
      {
        id: "fin-4",
        name: "Trust Fund Documentation",
        type: "single",
        required: false,
        status: "not-needed",
      } as SingleItem,
    ],
  },
  {
    id: "diagrams",
    name: "Safety & Diagrams",
    items: [
      {
        id: "diag-1",
        name: "Body Map (Intake)",
        formCode: "YC-FORM-300.01",
        type: "single",
        required: true,
        status: "outstanding",
      } as SingleItem,
      {
        id: "diag-2",
        name: "Body Map (Discharge)",
        formCode: "YC-FORM-300.02",
        type: "single",
        required: false,
        status: "not-needed",
      } as SingleItem,
      {
        id: "diag-3",
        name: "Property Inventory Sheet",
        formCode: "YC-FORM-300.05",
        type: "single",
        required: true,
        status: "received",
        dateFiledReceived: "2026-07-15",
      } as SingleItem,
    ],
  },
  {
    id: "misc",
    name: "Miscellaneous",
    items: [
      {
        id: "misc-1",
        name: "Other Supporting Documents",
        type: "multi",
        required: false,
        docs: [
          { id: "misc-1a", label: "Previous Placement Summary — 2025", status: "received", dateFiledReceived: "2026-07-18" },
        ],
      } as MultiItem,
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function getItemReceivedCount(item: ChecklistItem): number {
  if (item.type === "single") return item.status === "received" ? 1 : 0;
  if (item.type === "bilingual") {
    return (item.en.status === "received" ? 1 : 0) + (item.es.status === "received" ? 1 : 0);
  }
  if (item.type === "multi") return item.docs.filter((d) => d.status === "received").length;
  if (item.type === "roi") return item.roiItems.filter((r) => r.status === "received").length;
  return 0;
}

function getItemTotalCount(item: ChecklistItem): number {
  if (item.type === "single") return 1;
  if (item.type === "bilingual") return 2;
  if (item.type === "multi") return Math.max(item.docs.length, 1);
  if (item.type === "roi") return item.roiItems.length;
  return 1;
}

function getItemPrimaryStatus(item: ChecklistItem): ItemStatus {
  if (item.type === "single") return item.status;
  if (item.type === "bilingual") {
    if (item.en.status === "received" && item.es.status === "received") return "received";
    if (item.en.status === "not-needed" && item.es.status === "not-needed") return "not-needed";
    return "outstanding";
  }
  if (item.type === "multi") {
    if (item.docs.length === 0) return "outstanding";
    if (item.docs.every((d) => d.status === "received")) return "received";
    return "outstanding";
  }
  if (item.type === "roi") {
    if (item.roiItems.every((r) => r.status === "received" || r.status === "not-needed")) return "received";
    if (item.roiItems.some((r) => r.status === "outstanding")) return "outstanding";
    return "received";
  }
  return "outstanding";
}

function getSectionProgress(section: Section): { received: number; total: number; notNeeded: number } {
  let received = 0;
  let total = 0;
  let notNeeded = 0;
  for (const item of section.items) {
    const status = getItemPrimaryStatus(item);
    if (status === "received") received++;
    else if (status === "not-needed") notNeeded++;
    total++;
  }
  return { received, total, notNeeded };
}

// ─────────────────────────────────────────────────────────────
// Status Icon
// ─────────────────────────────────────────────────────────────

function StatusIcon({ status, size = 18 }: { status: ItemStatus; size?: number }) {
  if (status === "received")
    return <CheckCircle2 size={size} style={{ color: "#145F33" }} />;
  if (status === "not-needed")
    return <XCircle size={size} style={{ color: "var(--slds-g-color-text-weak)" }} />;
  return <MinusCircle size={size} style={{ color: "#b45309" }} />;
}

function StatusLabel({ status }: { status: ItemStatus }) {
  const map = {
    received: { label: "Received", bg: "#f0f9f4", color: "#145F33", border: "#a8d5bc" },
    outstanding: { label: "Outstanding", bg: "#fffbeb", color: "#92400e", border: "#fcd34d" },
    "not-needed": { label: "Not Needed", bg: "#f3f4f6", color: "var(--slds-g-color-text-weak)", border: "var(--slds-g-color-border-base-1)" },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 slds-text-3 font-medium"
      style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Mark Received Modal
// ─────────────────────────────────────────────────────────────

interface MarkReceivedState {
  itemId: string;
  subId?: string;
  name: string;
}

function MarkReceivedModal({
  target,
  onClose,
  onSave,
}: {
  target: MarkReceivedState;
  onClose: () => void;
  onSave: (date: string, notes: string) => void;
}) {
  const [date, setDate] = useState(isoToMdy(TODAY));
  const [notes, setNotes] = useState("");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="slds-text-6">Mark as Received</DialogTitle>
          <DialogDescription className="slds-text-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
            {target.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-1">
          <div className="space-y-1.5">
            <Label htmlFor="mark-date" className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
              DATE FILED / RECEIVED <span style={{ color: "#c23934" }}>*</span>
            </Label>
            <DateInput id="mark-date" value={date} onChange={setDate} placeholder="MM/DD/YYYY" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mark-notes" className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
              NOTES
            </Label>
            <Textarea
              id="mark-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="slds-text-4 resize-none"
              style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
              placeholder="Optional notes..."
            />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            className="rounded-full h-9 slds-text-4"
            style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="rounded-full h-9 slds-text-4 text-white"
            style={{ backgroundColor: "#145F33" }}
            onClick={() => {
              if (!date || date.length < 10) {
                toast.error("Please enter a valid date.");
                return;
              }
              onSave(date, notes);
            }}
          >
            Mark Received
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Row — Single
// ─────────────────────────────────────────────────────────────

function SingleRow({
  item,
  onMarkReceived,
  onToggleNotNeeded,
}: {
  item: SingleItem;
  onMarkReceived: (target: MarkReceivedState) => void;
  onToggleNotNeeded: (id: string) => void;
}) {
  return (
    <tr style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <StatusIcon status={item.status} />
          <span className="slds-text-4 font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
            {item.name}
          </span>
          {item.formCode && (
            <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
              {item.formCode}
            </span>
          )}
          {item.required && (
            <span style={{ color: "#c23934", fontWeight: 600, fontSize: "12px" }}>*</span>
          )}
        </div>
      </td>
      <td className="px-4 py-2.5 whitespace-nowrap">
        <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
          {item.dateFiledReceived ? isoToMdy(item.dateFiledReceived) : "—"}
        </span>
      </td>
      <td className="px-4 py-2.5">
        <StatusLabel status={item.status} />
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          {item.status !== "received" && item.status !== "not-needed" && (
            <button
              onClick={() => onMarkReceived({ itemId: item.id, name: item.name })}
              className="rounded-full h-7 px-3 slds-text-3 font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-default)" }}
            >
              Received
            </button>
          )}
          {item.status !== "not-needed" ? (
            <button
              onClick={() => onToggleNotNeeded(item.id)}
              className="rounded-full h-7 px-3 slds-text-3 border transition-colors hover:bg-gray-50"
              style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-weak)" }}
            >
              N/A
            </button>
          ) : (
            <button
              onClick={() => onToggleNotNeeded(item.id)}
              className="rounded-full h-7 px-2.5 slds-text-3 border transition-colors hover:bg-gray-50 flex items-center gap-1"
              style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-weak)" }}
            >
              <RotateCcw size={12} /> Restore
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
// Row — Bilingual
// ─────────────────────────────────────────────────────────────

function BilingualRow({
  item,
  onMarkReceived,
  onToggleNotNeeded,
}: {
  item: BilingualItem;
  onMarkReceived: (target: MarkReceivedState) => void;
  onToggleNotNeeded: (id: string) => void;
}) {
  const overall = getItemPrimaryStatus(item);
  const displayDate = item.en.dateFiledReceived || item.es.dateFiledReceived;
  const formCodeDisplay = [item.formCode, item.formCodeEs].filter(Boolean).join(" / ");

  return (
    <tr style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <StatusIcon status={overall} />
          <span className="slds-text-4 font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
            {item.name}
          </span>
          {item.required && (
            <span style={{ color: "#c23934", fontWeight: 600, fontSize: "12px" }}>*</span>
          )}
          <span
            className="slds-text-3 rounded-full px-1.5 py-0.5 font-medium"
            style={{ background: "#f0f4ff", color: "#1e40af", border: "1px solid #c7d2fe" }}
          >
            EN / ES
          </span>
          {formCodeDisplay && (
            <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
              {formCodeDisplay}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-2.5 whitespace-nowrap">
        <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
          {displayDate ? isoToMdy(displayDate) : "—"}
        </span>
      </td>
      <td className="px-4 py-2.5">
        <StatusLabel status={overall} />
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          {overall !== "received" && overall !== "not-needed" && (
            <button
              onClick={() => onMarkReceived({ itemId: item.id, name: item.name })}
              className="rounded-full h-7 px-3 slds-text-3 font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-default)" }}
            >
              Received
            </button>
          )}
          {overall !== "not-needed" ? (
            <button
              onClick={() => onToggleNotNeeded(item.id)}
              className="rounded-full h-7 px-3 slds-text-3 border transition-colors hover:bg-gray-50"
              style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-weak)" }}
            >
              N/A
            </button>
          ) : (
            <button
              onClick={() => onToggleNotNeeded(item.id)}
              className="rounded-full h-7 px-2.5 slds-text-3 border transition-colors hover:bg-gray-50 flex items-center gap-1"
              style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-weak)" }}
            >
              <RotateCcw size={12} /> Restore
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
// Row — Multi
// ─────────────────────────────────────────────────────────────

function MultiRow({
  item,
  onMarkReceived,
  onAddDoc,
}: {
  item: MultiItem;
  onMarkReceived: (target: MarkReceivedState) => void;
  onAddDoc: (itemId: string) => void;
}) {
  const [expanded, setExpanded] = useState(item.docs.length > 0 && item.docs.some((d) => d.status === "outstanding"));
  const overall = getItemPrimaryStatus(item);
  const receivedCount = item.docs.filter((d) => d.status === "received").length;

  return (
    <>
      <tr style={{ borderBottom: expanded && item.docs.length > 0 ? "none" : "1px solid var(--slds-g-color-border-base-1)" }}>
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-2">
            <StatusIcon status={overall} />
            <span className="slds-text-4 font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
              {item.name}
            </span>
            {item.required && (
              <span style={{ color: "#c23934", fontWeight: 600, fontSize: "12px" }}>*</span>
            )}
            {item.docs.length > 0 && (
              <span
                className="slds-text-3 rounded-full px-2 py-0.5"
                style={{ background: "var(--slds-g-color-background-alt)", color: "var(--slds-g-color-text-weak)", border: "1px solid var(--slds-g-color-border-base-1)" }}
              >
                {receivedCount}/{item.docs.length}
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-2.5">
          <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>—</span>
        </td>
        <td className="px-4 py-2.5">
          <StatusLabel status={overall} />
        </td>
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onAddDoc(item.id)}
              className="rounded-full h-7 px-2.5 slds-text-3 border transition-colors hover:bg-gray-50 flex items-center gap-1"
              style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "#0176d3" }}
            >
              <Plus size={13} /> Add
            </button>
            {item.docs.length > 0 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="rounded-full h-7 px-2.5 slds-text-3 border transition-colors hover:bg-gray-50 flex items-center gap-1"
                style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-weak)" }}
              >
                {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                {item.docs.length}
              </button>
            )}
          </div>
        </td>
      </tr>
      {expanded && item.docs.map((doc) => (
        <tr
          key={doc.id}
          style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)", background: "var(--slds-g-color-background-alt)" }}
        >
          <td className="px-4 py-2 pl-10">
            <div className="flex items-center gap-2">
              <StatusIcon status={doc.status} size={15} />
              <span className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{doc.label}</span>
            </div>
          </td>
          <td className="px-4 py-2 whitespace-nowrap">
            <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
              {doc.dateFiledReceived ? isoToMdy(doc.dateFiledReceived) : "—"}
            </span>
          </td>
          <td className="px-4 py-2">
            <StatusLabel status={doc.status} />
          </td>
          <td className="px-4 py-2">
            {doc.status !== "received" && (
              <button
                onClick={() => onMarkReceived({ itemId: item.id, subId: doc.id, name: `${item.name} — ${doc.label}` })}
                className="rounded-full h-6 px-2.5 slds-text-3 border transition-colors hover:bg-white"
                style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-default)" }}
              >
                Received
              </button>
            )}
          </td>
        </tr>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Row — ROI
// ─────────────────────────────────────────────────────────────

function RoiRow({
  item,
  onMarkReceived,
}: {
  item: RoiItem;
  onMarkReceived: (target: MarkReceivedState) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const overall = getItemPrimaryStatus(item);
  const receivedCount = item.roiItems.filter((r) => r.status === "received").length;

  return (
    <>
      <tr style={{ borderBottom: expanded ? "none" : "1px solid var(--slds-g-color-border-base-1)" }}>
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-2">
            <StatusIcon status={overall} />
            <span className="slds-text-4 font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
              {item.name}
            </span>
            {item.formCode && (
              <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>{item.formCode}</span>
            )}
            {item.required && <span style={{ color: "#c23934", fontWeight: 600, fontSize: "12px" }}>*</span>}
            <span
              className="slds-text-3 rounded-full px-2 py-0.5"
              style={{ background: "#f0f4ff", color: "#1e40af", border: "1px solid #c7d2fe" }}
            >
              {receivedCount}/{item.roiItems.length} types
            </span>
          </div>
        </td>
        <td className="px-4 py-2.5">
          <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>—</span>
        </td>
        <td className="px-4 py-2.5">
          <StatusLabel status={overall} />
        </td>
        <td className="px-4 py-2.5">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-full h-7 px-2.5 slds-text-3 border transition-colors hover:bg-gray-50 flex items-center gap-1"
            style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-weak)" }}
          >
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            {expanded ? "Collapse" : "Expand"}
          </button>
        </td>
      </tr>
      {expanded && item.roiItems.map((roi) => (
        <tr
          key={roi.type}
          style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)", background: "var(--slds-g-color-background-alt)" }}
        >
          <td className="px-4 py-2 pl-10">
            <div className="flex items-center gap-2">
              <StatusIcon status={roi.status} size={15} />
              <span className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{roi.type}</span>
            </div>
          </td>
          <td className="px-4 py-2 whitespace-nowrap">
            <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
              {roi.dateFiledReceived ? isoToMdy(roi.dateFiledReceived) : "—"}
            </span>
          </td>
          <td className="px-4 py-2">
            <StatusLabel status={roi.status} />
          </td>
          <td className="px-4 py-2">
            {roi.status === "outstanding" && (
              <button
                onClick={() => onMarkReceived({ itemId: item.id, subId: roi.type, name: `ROI — ${roi.type}` })}
                className="rounded-full h-6 px-2.5 slds-text-3 border transition-colors hover:bg-white"
                style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-default)" }}
              >
                Received
              </button>
            )}
          </td>
        </tr>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Section Accordion
// ─────────────────────────────────────────────────────────────

function SectionAccordion({
  section,
  defaultOpen,
  onMarkReceived,
  onToggleNotNeeded,
  onAddDoc,
}: {
  section: Section;
  defaultOpen: boolean;
  onMarkReceived: (target: MarkReceivedState) => void;
  onToggleNotNeeded: (itemId: string) => void;
  onAddDoc: (itemId: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const prog = getSectionProgress(section);
  const pct = prog.total > 0 ? Math.round((prog.received / prog.total) * 100) : 0;

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid var(--slds-g-color-border-base-1)", background: "var(--slds-g-color-background-base)" }}
    >
      {/* Section header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
        style={{ background: open ? "var(--slds-g-color-background-alt)" : "var(--slds-g-color-background-base)" }}
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown size={16} style={{ color: "var(--slds-g-color-text-weak)", flexShrink: 0 }} />
        ) : (
          <ChevronRight size={16} style={{ color: "var(--slds-g-color-text-weak)", flexShrink: 0 }} />
        )}
        <span className="slds-text-4 font-semibold flex-1" style={{ color: "var(--slds-g-color-text-default)" }}>
          {section.name}
        </span>
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden sm:flex items-center gap-2">
            <div
              className="w-24 h-1.5 rounded-full overflow-hidden"
              style={{ background: "var(--slds-g-color-neutral-95)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: pct === 100 ? "#145F33" : "#f59e0b" }}
              />
            </div>
            <span className="slds-text-3 whitespace-nowrap" style={{ color: "var(--slds-g-color-text-weak)" }}>
              {prog.received} / {prog.total}
            </span>
          </div>
          {prog.notNeeded > 0 && (
            <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
              {prog.notNeeded} N/A
            </span>
          )}
          {pct === 100 && (
            <CheckCircle2 size={16} style={{ color: "#145F33" }} />
          )}
        </div>
      </button>

      {/* Table of items */}
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-alt)" }}>
                <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: "var(--slds-g-color-text-weak)" }}>Document</th>
                <th className="px-4 py-2 text-left slds-text-3 font-semibold whitespace-nowrap w-44" style={{ color: "var(--slds-g-color-text-weak)" }}>Date Received / Executed</th>
                <th className="px-4 py-2 text-left slds-text-3 font-semibold w-28" style={{ color: "var(--slds-g-color-text-weak)" }}>Status</th>
                <th className="px-4 py-2 text-left slds-text-3 font-semibold w-40" style={{ color: "var(--slds-g-color-text-weak)" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {section.items.map((item) => {
                if (item.type === "single") {
                  return (
                    <SingleRow
                      key={item.id}
                      item={item}
                      onMarkReceived={onMarkReceived}
                      onToggleNotNeeded={onToggleNotNeeded}
                    />
                  );
                }
                if (item.type === "bilingual") {
                  return (
                    <BilingualRow
                      key={item.id}
                      item={item}
                      onMarkReceived={onMarkReceived}
                      onToggleNotNeeded={onToggleNotNeeded}
                    />
                  );
                }
                if (item.type === "multi") {
                  return (
                    <MultiRow
                      key={item.id}
                      item={item}
                      onMarkReceived={onMarkReceived}
                      onAddDoc={onAddDoc}
                    />
                  );
                }
                if (item.type === "roi") {
                  return (
                    <RoiRow
                      key={item.id}
                      item={item}
                      onMarkReceived={onMarkReceived}
                    />
                  );
                }
                return null;
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Add Multi-Doc Modal
// ─────────────────────────────────────────────────────────────

function AddDocModal({
  itemName,
  onClose,
  onSave,
}: {
  itemName: string;
  onClose: () => void;
  onSave: (label: string, date: string) => void;
}) {
  const [label, setLabel] = useState("");
  const [date, setDate] = useState(isoToMdy(TODAY));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="slds-text-6">Add Document</DialogTitle>
          <DialogDescription className="slds-text-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
            {itemName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-1">
          <div className="space-y-1.5">
            <Label htmlFor="doc-label" className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
              DOCUMENT DESCRIPTION <span style={{ color: "#c23934" }}>*</span>
            </Label>
            <input
              id="doc-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Lurie Children's — 2024"
              className="w-full h-9 rounded-md px-3 slds-text-4"
              style={{ border: "1px solid var(--slds-g-color-border-base-1)", outline: "none" }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doc-date" className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
              DATE FILED / RECEIVED <span style={{ color: "#c23934" }}>*</span>
            </Label>
            <DateInput id="doc-date" value={date} onChange={setDate} placeholder="MM/DD/YYYY" />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            className="rounded-full h-9 slds-text-4"
            style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="rounded-full h-9 slds-text-4 text-white"
            style={{ backgroundColor: "#145F33" }}
            onClick={() => {
              if (!label.trim()) { toast.error("Please enter a description."); return; }
              if (!date || date.length < 10) { toast.error("Please enter a valid date."); return; }
              onSave(label.trim(), date);
            }}
          >
            Add Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export function DocumentsChecklist() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | ItemStatus>("all");
  const [markTarget, setMarkTarget] = useState<MarkReceivedState | null>(null);
  const [addDocTarget, setAddDocTarget] = useState<{ itemId: string; sectionId: string; itemName: string } | null>(null);

  // ── Computed stats ──────────────────────────────────────────
  const stats = useMemo(() => {
    let total = 0, received = 0, outstanding = 0, notNeeded = 0;
    for (const section of sections) {
      for (const item of section.items) {
        const status = getItemPrimaryStatus(item);
        total++;
        if (status === "received") received++;
        else if (status === "outstanding") outstanding++;
        else notNeeded++;
      }
    }
    return { total, received, outstanding, notNeeded };
  }, [sections]);

  // ── Filtered sections ───────────────────────────────────────
  const filteredSections = useMemo(() => {
    const q = search.toLowerCase().trim();
    return sections
      .map((section) => {
        const items = section.items.filter((item) => {
          const matchName = !q || item.name.toLowerCase().includes(q);
          const matchStatus = filterStatus === "all" || getItemPrimaryStatus(item) === filterStatus;
          return matchName && matchStatus;
        });
        return { ...section, items };
      })
      .filter((s) => s.items.length > 0);
  }, [sections, search, filterStatus]);

  // ── Mutation helpers ────────────────────────────────────────

  function markSingleReceived(sectionId: string, itemId: string, date: string) {
    const isoDate = mdyToIso(date);
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              items: s.items.map((item) =>
                item.id !== itemId || item.type !== "single"
                  ? item
                  : { ...item, status: "received" as ItemStatus, dateFiledReceived: isoDate }
              ),
            }
      )
    );
  }

  function markBilingualReceived(sectionId: string, itemId: string, lang: string, date: string) {
    const isoDate = mdyToIso(date);
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              items: s.items.map((item) =>
                item.id !== itemId || item.type !== "bilingual"
                  ? item
                  : {
                      ...item,
                      [lang]: { status: "received" as ItemStatus, dateFiledReceived: isoDate },
                    }
              ),
            }
      )
    );
  }

  function markBilingualBothReceived(sectionId: string, itemId: string, date: string) {
    const isoDate = mdyToIso(date);
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId ? s : {
          ...s,
          items: s.items.map((item) =>
            item.id !== itemId || item.type !== "bilingual" ? item : {
              ...item,
              en: { status: "received" as ItemStatus, dateFiledReceived: isoDate },
              es: { status: "received" as ItemStatus, dateFiledReceived: isoDate },
            }
          ),
        }
      )
    );
  }

  function markMultiSubReceived(sectionId: string, itemId: string, subId: string, date: string) {
    const isoDate = mdyToIso(date);
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              items: s.items.map((item) =>
                item.id !== itemId || item.type !== "multi"
                  ? item
                  : {
                      ...item,
                      docs: item.docs.map((d) =>
                        d.id !== subId ? d : { ...d, status: "received" as ItemStatus, dateFiledReceived: isoDate }
                      ),
                    }
              ),
            }
      )
    );
  }

  function markRoiSubReceived(sectionId: string, itemId: string, roiType: string, date: string) {
    const isoDate = mdyToIso(date);
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              items: s.items.map((item) =>
                item.id !== itemId || item.type !== "roi"
                  ? item
                  : {
                      ...item,
                      roiItems: item.roiItems.map((r) =>
                        r.type !== roiType ? r : { ...r, status: "received" as ItemStatus, dateFiledReceived: isoDate }
                      ),
                    }
              ),
            }
      )
    );
  }

  function toggleNotNeeded(sectionId: string, itemId: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId ? s : {
          ...s,
          items: s.items.map((item) => {
            if (item.id !== itemId) return item;
            if (item.type === "single") {
              return { ...item, status: (item.status === "not-needed" ? "outstanding" : "not-needed") as ItemStatus };
            }
            if (item.type === "bilingual") {
              const allNotNeeded = item.en.status === "not-needed" && item.es.status === "not-needed";
              const newStatus = (allNotNeeded ? "outstanding" : "not-needed") as ItemStatus;
              return { ...item, en: { ...item.en, status: newStatus }, es: { ...item.es, status: newStatus } };
            }
            return item;
          }),
        }
      )
    );
  }

  function addMultiDoc(sectionId: string, itemId: string, label: string, date: string) {
    const isoDate = mdyToIso(date);
    const newDoc: SubDoc = {
      id: `${itemId}-${Date.now()}`,
      label,
      status: "received",
      dateFiledReceived: isoDate,
    };
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              items: s.items.map((item) =>
                item.id !== itemId || item.type !== "multi"
                  ? item
                  : { ...item, docs: [...item.docs, newDoc] }
              ),
            }
      )
    );
  }

  // ── Mark Received dispatch ──────────────────────────────────

  function handleMarkReceived(target: MarkReceivedState) {
    setMarkTarget(target);
  }

  function handleMarkReceivedSave(date: string, _notes: string) {
    if (!markTarget) return;
    const { itemId, subId } = markTarget;

    // Find the section
    let sectionId = "";
    let itemType: string = "single";
    for (const s of sections) {
      const found = s.items.find((i) => i.id === itemId);
      if (found) { sectionId = s.id; itemType = found.type; break; }
    }

    if (itemType === "single") markSingleReceived(sectionId, itemId, date);
    else if (itemType === "bilingual") markBilingualBothReceived(sectionId, itemId, date);
    else if (itemType === "multi" && subId) markMultiSubReceived(sectionId, itemId, subId, date);
    else if (itemType === "roi" && subId) markRoiSubReceived(sectionId, itemId, subId, date);

    toast.success("Marked as received.");
    setMarkTarget(null);
  }

  function handleAddDoc(sectionId: string, itemId: string) {
    const section = sections.find((s) => s.id === sectionId);
    const item = section?.items.find((i) => i.id === itemId);
    if (item) setAddDocTarget({ itemId, sectionId, itemName: item.name });
  }

  function handleAddDocSave(label: string, date: string) {
    if (!addDocTarget) return;
    addMultiDoc(addDocTarget.sectionId, addDocTarget.itemId, label, date);
    toast.success("Document added.");
    setAddDocTarget(null);
  }

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  const overallPct = stats.total > 0 ? Math.round((stats.received / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--slds-g-color-background-base)" }}>
      {/* Page header */}
      <div
        className="sticky top-0 z-20 px-6 py-3 flex items-center gap-3"
        style={{ background: "var(--slds-g-color-background-base)", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="rounded-full h-8 w-8 flex items-center justify-center border transition-colors hover:bg-gray-50"
          style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
          aria-label="Go back"
        >
          <ArrowLeft size={16} style={{ color: "var(--slds-g-color-text-weak)" }} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
              Youth Profile
            </span>
            <ChevronRight size={12} style={{ color: "var(--slds-g-color-text-weak)" }} />
            <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
              Case Details
            </span>
            <ChevronRight size={12} style={{ color: "var(--slds-g-color-text-weak)" }} />
            <span className="slds-text-3 font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
              Documents Checklist
            </span>
          </div>
          <h1 className="slds-page-header-title leading-tight">
            Documents Checklist
          </h1>
        </div>
      </div>

      <div className="px-6 py-5 max-w-5xl mx-auto space-y-5">
        {/* Summary bar */}
        <div
          className="rounded-xl p-4"
          style={{ border: "1px solid var(--slds-g-color-border-base-1)", background: "var(--slds-g-color-background-base)" }}
        >
          <div className="flex items-center gap-6 flex-wrap">
            {/* Progress bar + pct */}
            <div className="flex items-center gap-3 flex-1 min-w-48">
              <div
                className="flex-1 h-2 rounded-full overflow-hidden"
                style={{ background: "var(--slds-g-color-neutral-95)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${overallPct}%`, background: overallPct === 100 ? "#145F33" : "#f59e0b" }}
                />
              </div>
              <span className="slds-text-4 font-semibold whitespace-nowrap" style={{ color: "var(--slds-g-color-text-default)" }}>
                {overallPct}% complete
              </span>
            </div>
            <div className="flex items-center gap-6">
              {[
                { label: "Total", value: stats.total, color: "var(--slds-g-color-text-default)" },
                { label: "Received", value: stats.received, color: "#145F33" },
                { label: "Outstanding", value: stats.outstanding, color: "#b45309" },
                { label: "Not Needed", value: stats.notNeeded, color: "var(--slds-g-color-text-weak)" },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <div className="slds-text-6 font-bold" style={{ color }}>{value}</div>
                  <div className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="flex items-center gap-2 flex-1 min-w-48 rounded-full h-9 px-3"
            style={{ border: "1px solid var(--slds-g-color-border-base-1)", background: "var(--slds-g-color-background-base)" }}
          >
            <Search size={14} style={{ color: "var(--slds-g-color-text-weak)", flexShrink: 0 }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents…"
              className="flex-1 bg-transparent slds-text-4 outline-none"
              style={{ color: "var(--slds-g-color-text-default)" }}
              aria-label="Search documents"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {(["all", "received", "outstanding", "not-needed"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setFilterStatus(v)}
                className="rounded-full h-8 px-3 slds-text-3 font-medium border transition-colors"
                style={{
                  backgroundColor: filterStatus === v ? "#145F33" : "transparent",
                  color: filterStatus === v ? "#fff" : "var(--slds-g-color-text-default)",
                  borderColor: filterStatus === v ? "#145F33" : "var(--slds-g-color-border-base-1)",
                }}
              >
                {v === "all" ? "All" : v === "received" ? "Received" : v === "outstanding" ? "Outstanding" : "Not Needed"}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          {[
            { status: "received" as ItemStatus, label: "Received" },
            { status: "outstanding" as ItemStatus, label: "Outstanding" },
            { status: "not-needed" as ItemStatus, label: "Not Needed" },
          ].map(({ status, label }) => (
            <div key={status} className="flex items-center gap-1.5">
              <StatusIcon status={status} size={14} />
              <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>{label}</span>
            </div>
          ))}
          <span className="slds-text-3" style={{ color: "#c23934" }}>* Required</span>
        </div>

        {/* Sections */}
        {filteredSections.length === 0 ? (
          <div
            className="rounded-xl flex flex-col items-center justify-center py-16"
            style={{ border: "2px dashed var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-weak)" }}
          >
            <FileText size={32} className="mb-3 opacity-40" />
            <p className="slds-text-6">No items match your search or filter.</p>
            <button
              onClick={() => { setSearch(""); setFilterStatus("all"); }}
              className="mt-3 rounded-full h-8 px-4 slds-text-4 border transition-colors hover:bg-gray-50"
              style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-default)" }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSections.map((section, idx) => (
              <SectionAccordion
                key={section.id}
                section={section}
                defaultOpen={idx < 2}
                onMarkReceived={handleMarkReceived}
                onToggleNotNeeded={(itemId) => {
                  const sec = sections.find((s) => s.items.some((i) => i.id === itemId));
                  if (sec) toggleNotNeeded(sec.id, itemId);
                }}
                onAddDoc={(itemId) => {
                  const sec = sections.find((s) => s.items.some((i) => i.id === itemId));
                  if (sec) handleAddDoc(sec.id, itemId);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {markTarget && (
        <MarkReceivedModal
          target={markTarget}
          onClose={() => setMarkTarget(null)}
          onSave={handleMarkReceivedSave}
        />
      )}
      {addDocTarget && (
        <AddDocModal
          itemName={addDocTarget.itemName}
          onClose={() => setAddDocTarget(null)}
          onSave={handleAddDocSave}
        />
      )}
    </div>
  );
}
