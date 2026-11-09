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

type ChecklistItem =
  SingleItem | BilingualItem | MultiItem | RoiItem;

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
    name: "Admissions",
    items: [
      {
        id: "adm-1",
        name: "Admission Agreement",
        formCode: "YC-FORM-100.04",
        formCodeEs: "YC-FORM-100.04s",
        type: "bilingual",
        required: true,
        en: {
          status: "received",
          dateFiledReceived: "2026-07-15",
        },
        es: {
          status: "received",
          dateFiledReceived: "2026-07-15",
        },
      } as BilingualItem,
      {
        id: "adm-2",
        name: "Bill of Rights",
        formCode: "YC-FORM-100.05",
        formCodeEs: "YC-FORM-100.05s",
        type: "bilingual",
        required: true,
        en: {
          status: "received",
          dateFiledReceived: "2026-07-15",
        },
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
          {
            type: "Blank",
            status: "received",
            dateFiledReceived: "2026-07-15",
          },
          { type: "Employer", status: "outstanding" },
          {
            type: "Hospital",
            status: "received",
            dateFiledReceived: "2026-07-15",
          },
          {
            type: "Mercy Home",
            status: "received",
            dateFiledReceived: "2026-07-15",
          },
          { type: "Significant Other", status: "outstanding" },
          {
            type: "Missing Persons / Law Enforcement",
            status: "outstanding",
          },
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
          {
            id: "med-2a",
            label: "Cook County Health — 2024",
            status: "received",
            dateFiledReceived: "2026-07-16",
          },
          {
            id: "med-2b",
            label: "Lurie Children's Hospital — 2023",
            status: "received",
            dateFiledReceived: "2026-07-16",
          },
        ],
      } as MultiItem,
      {
        id: "med-3",
        name: "Hospital Records",
        type: "multi",
        required: false,
        docs: [
          {
            id: "med-3a",
            label: "Northwestern Memorial — 2025",
            status: "received",
            dateFiledReceived: "2026-07-16",
          },
          {
            id: "med-3b",
            label: "Stroger Hospital — 2024",
            status: "outstanding",
          },
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
          {
            id: "med-5a",
            label: "Cook County — 05/2026",
            status: "received",
            dateFiledReceived: "2026-07-16",
          },
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
          {
            id: "mh-1a",
            label: "Dr. Reyes — 03/2026",
            status: "received",
            dateFiledReceived: "2026-07-18",
          },
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
          {
            id: "mh-3a",
            label: "Chicago Family Services — 2024",
            status: "received",
            dateFiledReceived: "2026-07-18",
          },
          {
            id: "mh-3b",
            label: "CDPH Mental Health — 2025",
            status: "received",
            dateFiledReceived: "2026-07-18",
          },
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
    name: "Education & Employment Records",
    items: [
      {
        id: "edu-1",
        name: "School Records / Transcripts",
        type: "multi",
        required: true,
        docs: [
          {
            id: "edu-1a",
            label: "Lincoln Park High — 2024–2025",
            status: "received",
            dateFiledReceived: "2026-07-20",
          },
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
          {
            id: "leg-1a",
            label: "Cook County — Order of Protection 06/2026",
            status: "received",
            dateFiledReceived: "2026-07-16",
          },
          {
            id: "leg-1b",
            label: "Cook County — Temporary Custody 07/2026",
            status: "received",
            dateFiledReceived: "2026-07-16",
          },
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
    name: "Visual Diagrams",
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
          {
            id: "misc-1a",
            label: "Previous Placement Summary — 2025",
            status: "received",
            dateFiledReceived: "2026-07-18",
          },
        ],
      } as MultiItem,
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function getItemPrimaryStatus(item: ChecklistItem): ItemStatus {
  if (item.type === "single") return item.status;
  if (item.type === "bilingual") {
    if (
      item.en.status === "received" &&
      item.es.status === "received"
    )
      return "received";
    if (
      item.en.status === "not-needed" &&
      item.es.status === "not-needed"
    )
      return "not-needed";
    return "outstanding";
  }
  if (item.type === "multi") {
    if (item.docs.length === 0) return "outstanding";
    if (item.docs.every((d) => d.status === "received"))
      return "received";
    return "outstanding";
  }
  if (item.type === "roi") {
    if (
      item.roiItems.every(
        (r) =>
          r.status === "received" || r.status === "not-needed",
      )
    )
      return "received";
    if (item.roiItems.some((r) => r.status === "outstanding"))
      return "outstanding";
    return "received";
  }
  return "outstanding";
}

function getSectionProgress(section: Section) {
  let received = 0;
  let total = 0;
  let notNeeded = 0;
  for (const item of section.items) {
    const s = getItemPrimaryStatus(item);
    total++;
    if (s === "received") received++;
    else if (s === "not-needed") notNeeded++;
  }
  return { received, total, notNeeded };
}

// ─────────────────────────────────────────────────────────────
// Status Icon + Label
// ─────────────────────────────────────────────────────────────

function StatusIcon({
  status,
  size = 15,
}: {
  status: ItemStatus;
  size?: number;
}) {
  if (status === "received")
    return (
      <CheckCircle2
        size={size}
        style={{ color: "#145F33", flexShrink: 0 }}
      />
    );
  if (status === "not-needed")
    return (
      <XCircle
        size={size}
        style={{
          color: "var(--slds-g-color-text-weak)",
          flexShrink: 0,
        }}
      />
    );
  return (
    <MinusCircle
      size={size}
      style={{ color: "#b45309", flexShrink: 0 }}
    />
  );
}

function StatusBadge({ status }: { status: ItemStatus }) {
  const map = {
    received: {
      label: "Received",
      bg: "#f0f9f4",
      color: "#145F33",
      border: "#a8d5bc",
    },
    outstanding: {
      label: "Outstanding",
      bg: "#fffbeb",
      color: "#92400e",
      border: "#fcd34d",
    },
    "not-needed": {
      label: "Not Needed",
      bg: "#f3f4f6",
      color: "var(--slds-g-color-text-weak)",
      border: "var(--slds-g-color-border-base-1)",
    },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 whitespace-nowrap"
      style={{
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        fontSize: "11px",
        fontWeight: 500,
      }}
    >
      {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Mark Received Modal
// ─────────────────────────────────────────────────────────────

interface MarkReceivedTarget {
  itemId: string;
  subId?: string;
  name: string;
}

function MarkReceivedModal({
  target,
  onClose,
  onSave,
}: {
  target: MarkReceivedTarget;
  onClose: () => void;
  onSave: (date: string) => void;
}) {
  const [date, setDate] = useState(isoToMdy(TODAY));
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle
            className="text-[15px] font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Mark as Received
          </DialogTitle>
          <DialogDescription
            className="text-[13px]"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            {target.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 mt-1">
          <Label
            htmlFor="mr-date"
            className="block text-[11px] font-medium"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            DATE FILED / RECEIVED{" "}
            <span style={{ color: "#c23934" }}>*</span>
          </Label>
          <DateInput
            id="mr-date"
            value={date}
            onChange={setDate}
            placeholder="MM/DD/YYYY"
          />
        </div>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            className="rounded-full h-9 text-[13px]"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
            }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="rounded-full h-9 text-[13px] text-white"
            style={{ backgroundColor: "#145F33" }}
            onClick={() => {
              if (!date || date.length < 10) {
                toast.error("Enter a valid date.");
                return;
              }
              onSave(date);
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
// Add Doc Modal
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
          <DialogTitle
            className="text-[15px] font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Add Document
          </DialogTitle>
          <DialogDescription
            className="text-[13px]"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            {itemName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-1">
          <div className="space-y-1.5">
            <Label
              htmlFor="ad-label"
              className="block text-[11px] font-medium"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              DESCRIPTION{" "}
              <span style={{ color: "#c23934" }}>*</span>
            </Label>
            <input
              id="ad-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Lurie Children's — 2024"
              className="w-full h-9 rounded-md px-3 text-[13px]"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                outline: "none",
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="ad-date"
              className="block text-[11px] font-medium"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              DATE FILED / RECEIVED{" "}
              <span style={{ color: "#c23934" }}>*</span>
            </Label>
            <DateInput
              id="ad-date"
              value={date}
              onChange={setDate}
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            className="rounded-full h-9 text-[13px]"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
            }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="rounded-full h-9 text-[13px] text-white"
            style={{ backgroundColor: "#145F33" }}
            onClick={() => {
              if (!label.trim()) {
                toast.error("Enter a description.");
                return;
              }
              if (!date || date.length < 10) {
                toast.error("Enter a valid date.");
                return;
              }
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
// Row components
// ─────────────────────────────────────────────────────────────

const ROW_BORDER =
  "1px solid var(--slds-g-color-border-base-1)";
const SUB_BG = "var(--slds-g-color-background-alt)";

function SingleRow({
  item,
  onMarkReceived,
  onToggleNotNeeded,
}: {
  item: SingleItem;
  onMarkReceived: (t: MarkReceivedTarget) => void;
  onToggleNotNeeded: (id: string) => void;
}) {
  return (
    <tr style={{ borderBottom: ROW_BORDER }}>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <StatusIcon status={item.status} />
          <span
            className="text-[13px] font-medium"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            {item.name}
          </span>
          {item.formCode && (
            <span
              className="text-[11px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {item.formCode}
            </span>
          )}
          {item.required && (
            <span
              style={{
                color: "#c23934",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              *
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <span
          className="text-[11px]"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          {item.dateFiledReceived
            ? isoToMdy(item.dateFiledReceived)
            : "—"}
        </span>
      </td>
      <td className="px-3 py-2">
        <StatusBadge status={item.status} />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          {item.status !== "received" &&
            item.status !== "not-needed" && (
              <button
                onClick={() =>
                  onMarkReceived({
                    itemId: item.id,
                    name: item.name,
                  })
                }
                className="inline-flex items-center rounded-full h-6 px-2.5 border transition-colors hover:bg-gray-50 text-[11px]"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Received
              </button>
            )}
          {item.status !== "not-needed" ? (
            <button
              onClick={() => onToggleNotNeeded(item.id)}
              className="inline-flex items-center rounded-full h-6 px-2.5 border transition-colors hover:bg-gray-50 text-[11px]"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-weak)",
              }}
            >
              N/A
            </button>
          ) : (
            <button
              onClick={() => onToggleNotNeeded(item.id)}
              className="inline-flex items-center gap-1 rounded-full h-6 px-2.5 border transition-colors hover:bg-gray-50 text-[11px]"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-weak)",
              }}
            >
              <RotateCcw size={10} /> Restore
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function BilingualRow({
  item,
  onMarkReceived,
  onToggleNotNeeded,
}: {
  item: BilingualItem;
  onMarkReceived: (t: MarkReceivedTarget) => void;
  onToggleNotNeeded: (id: string) => void;
}) {
  const overall = getItemPrimaryStatus(item);
  const displayDate =
    item.en.dateFiledReceived || item.es.dateFiledReceived;
  const formCodeDisplay = [item.formCode, item.formCodeEs]
    .filter(Boolean)
    .join(" / ");
  return (
    <tr style={{ borderBottom: ROW_BORDER }}>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusIcon status={overall} />
          <span
            className="text-[13px] font-medium"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            {item.name}
          </span>
          {item.required && (
            <span
              style={{
                color: "#c23934",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              *
            </span>
          )}
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{
              background: "#eff6ff",
              color: "#1d4ed8",
              border: "1px solid #bfdbfe",
            }}
          >
            EN / ES
          </span>
          {formCodeDisplay && (
            <span
              className="text-[11px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {formCodeDisplay}
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <span
          className="text-[11px]"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          {displayDate ? isoToMdy(displayDate) : "—"}
        </span>
      </td>
      <td className="px-3 py-2">
        <StatusBadge status={overall} />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          {overall !== "received" &&
            overall !== "not-needed" && (
              <button
                onClick={() =>
                  onMarkReceived({
                    itemId: item.id,
                    name: item.name,
                  })
                }
                className="inline-flex items-center rounded-full h-6 px-2.5 border transition-colors hover:bg-gray-50 text-[11px]"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Received
              </button>
            )}
          {overall !== "not-needed" ? (
            <button
              onClick={() => onToggleNotNeeded(item.id)}
              className="inline-flex items-center rounded-full h-6 px-2.5 border transition-colors hover:bg-gray-50 text-[11px]"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-weak)",
              }}
            >
              N/A
            </button>
          ) : (
            <button
              onClick={() => onToggleNotNeeded(item.id)}
              className="inline-flex items-center gap-1 rounded-full h-6 px-2.5 border transition-colors hover:bg-gray-50 text-[11px]"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-weak)",
              }}
            >
              <RotateCcw size={10} /> Restore
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function MultiRow({
  item,
  onMarkReceived,
  onAddDoc,
}: {
  item: MultiItem;
  onMarkReceived: (t: MarkReceivedTarget) => void;
  onAddDoc: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(
    item.docs.some((d) => d.status === "outstanding"),
  );
  const overall = getItemPrimaryStatus(item);
  const rcv = item.docs.filter(
    (d) => d.status === "received",
  ).length;
  return (
    <>
      <tr
        style={{
          borderBottom:
            expanded && item.docs.length > 0
              ? "none"
              : ROW_BORDER,
        }}
      >
        <td className="px-3 py-2">
          <div className="flex items-center gap-2">
            <StatusIcon status={overall} />
            <span
              className="text-[13px] font-medium"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {item.name}
            </span>
            {item.required && (
              <span
                style={{
                  color: "#c23934",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                *
              </span>
            )}
            {item.docs.length > 0 && (
              <span
                className="text-[11px] px-1.5 py-0.5 rounded-full"
                style={{
                  background: SUB_BG,
                  color: "var(--slds-g-color-text-weak)",
                  border: ROW_BORDER,
                }}
              >
                {rcv}/{item.docs.length}
              </span>
            )}
          </div>
        </td>
        <td className="px-3 py-2">
          <span
            className="text-[11px]"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            —
          </span>
        </td>
        <td className="px-3 py-2">
          <StatusBadge status={overall} />
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAddDoc(item.id)}
              className="inline-flex items-center gap-1 rounded-full h-6 px-2.5 border transition-colors hover:bg-gray-50 text-[11px]"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                color: "#0176d3",
              }}
            >
              <Plus size={11} /> Add
            </button>
            {item.docs.length > 0 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center gap-0.5 rounded-full h-6 px-2 border transition-colors hover:bg-gray-50 text-[11px]"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {expanded ? (
                  <ChevronDown size={11} />
                ) : (
                  <ChevronRight size={11} />
                )}
                {item.docs.length}
              </button>
            )}
          </div>
        </td>
      </tr>
      {expanded &&
        item.docs.map((doc) => (
          <tr
            key={doc.id}
            style={{
              borderBottom: ROW_BORDER,
              background: SUB_BG,
            }}
          >
            <td className="px-3 py-1.5 pl-9">
              <div className="flex items-center gap-2">
                <StatusIcon status={doc.status} size={13} />
                <span
                  className="text-[12px]"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {doc.label}
                </span>
              </div>
            </td>
            <td className="px-3 py-1.5 whitespace-nowrap">
              <span
                className="text-[11px]"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {doc.dateFiledReceived
                  ? isoToMdy(doc.dateFiledReceived)
                  : "—"}
              </span>
            </td>
            <td className="px-3 py-1.5">
              <StatusBadge status={doc.status} />
            </td>
            <td className="px-3 py-1.5">
              {doc.status !== "received" && (
                <button
                  onClick={() =>
                    onMarkReceived({
                      itemId: item.id,
                      subId: doc.id,
                      name: `${item.name} — ${doc.label}`,
                    })
                  }
                  className="inline-flex items-center rounded-full h-6 px-2.5 border transition-colors hover:bg-white text-[11px]"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
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

function RoiRow({
  item,
  onMarkReceived,
}: {
  item: RoiItem;
  onMarkReceived: (t: MarkReceivedTarget) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const overall = getItemPrimaryStatus(item);
  const rcv = item.roiItems.filter(
    (r) => r.status === "received",
  ).length;
  return (
    <>
      <tr
        style={{ borderBottom: expanded ? "none" : ROW_BORDER }}
      >
        <td className="px-3 py-2">
          <div className="flex items-center gap-2">
            <StatusIcon status={overall} />
            <span
              className="text-[13px] font-medium"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {item.name}
            </span>
            {item.formCode && (
              <span
                className="text-[11px]"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {item.formCode}
              </span>
            )}
            {item.required && (
              <span
                style={{
                  color: "#c23934",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                *
              </span>
            )}
            <span
              className="text-[11px] px-1.5 py-0.5 rounded-full"
              style={{
                background: "#eff6ff",
                color: "#1d4ed8",
                border: "1px solid #bfdbfe",
              }}
            >
              {rcv}/{item.roiItems.length} types
            </span>
          </div>
        </td>
        <td className="px-3 py-2">
          <span
            className="text-[11px]"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            —
          </span>
        </td>
        <td className="px-3 py-2">
          <StatusBadge status={overall} />
        </td>
        <td className="px-3 py-2">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-0.5 rounded-full h-6 px-2.5 border transition-colors hover:bg-gray-50 text-[11px]"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
              color: "var(--slds-g-color-text-weak)",
            }}
          >
            {expanded ? (
              <ChevronDown size={11} />
            ) : (
              <ChevronRight size={11} />
            )}
            {expanded ? "Collapse" : "Expand"}
          </button>
        </td>
      </tr>
      {expanded &&
        item.roiItems.map((roi) => (
          <tr
            key={roi.type}
            style={{
              borderBottom: ROW_BORDER,
              background: SUB_BG,
            }}
          >
            <td className="px-3 py-1.5 pl-9">
              <div className="flex items-center gap-2">
                <StatusIcon status={roi.status} size={13} />
                <span
                  className="text-[12px]"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {roi.type}
                </span>
              </div>
            </td>
            <td className="px-3 py-1.5 whitespace-nowrap">
              <span
                className="text-[11px]"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {roi.dateFiledReceived
                  ? isoToMdy(roi.dateFiledReceived)
                  : "—"}
              </span>
            </td>
            <td className="px-3 py-1.5">
              <StatusBadge status={roi.status} />
            </td>
            <td className="px-3 py-1.5">
              {roi.status === "outstanding" && (
                <button
                  onClick={() =>
                    onMarkReceived({
                      itemId: item.id,
                      subId: roi.type,
                      name: `ROI — ${roi.type}`,
                    })
                  }
                  className="inline-flex items-center rounded-full h-6 px-2.5 border transition-colors hover:bg-white text-[11px]"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
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
  onMarkReceived: (t: MarkReceivedTarget) => void;
  onToggleNotNeeded: (id: string) => void;
  onAddDoc: (id: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const prog = getSectionProgress(section);
  const pct =
    prog.total > 0
      ? Math.round((prog.received / prog.total) * 100)
      : 0;

  return (
    <div
      className="overflow-hidden"
      style={{
        border: ROW_BORDER,
        borderRadius: "var(--slds-c-card-radius-border)",
        background: "var(--slds-g-color-background-base)",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
        style={{
          background: open
            ? SUB_BG
            : "var(--slds-g-color-background-base)",
          borderBottom: open ? ROW_BORDER : "none",
        }}
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown
            size={14}
            style={{
              color: "var(--slds-g-color-text-weak)",
              flexShrink: 0,
            }}
          />
        ) : (
          <ChevronRight
            size={14}
            style={{
              color: "var(--slds-g-color-text-weak)",
              flexShrink: 0,
            }}
          />
        )}
        <span
          className="text-[13px] font-semibold flex-1"
          style={{ color: "var(--slds-g-color-text-default)" }}
        >
          {section.name}
        </span>
        <div className="flex items-center gap-2.5 ml-auto">
          <div className="hidden sm:flex items-center gap-1.5">
            <div
              className="w-20 h-1.5 rounded-full overflow-hidden"
              style={{
                background: "var(--slds-g-color-neutral-95)",
              }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background:
                    pct === 100 ? "#145F33" : "#f59e0b",
                }}
              />
            </div>
            <span
              className="text-[11px] whitespace-nowrap"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {prog.received}/{prog.total}
            </span>
          </div>
          {prog.notNeeded > 0 && (
            <span
              className="text-[11px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {prog.notNeeded} N/A
            </span>
          )}
          {pct === 100 && (
            <CheckCircle2
              size={14}
              style={{ color: "#145F33" }}
            />
          )}
        </div>
      </button>
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr
                style={{
                  borderTop: ROW_BORDER,
                  backgroundColor: SUB_BG,
                }}
              >
                <th
                  className="px-3 py-2 text-left text-[11px] font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Document
                </th>
                <th
                  className="px-3 py-2 text-left text-[11px] font-semibold whitespace-nowrap w-36"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Date Received / Executed
                </th>
                <th
                  className="px-3 py-2 text-left text-[11px] font-semibold w-24"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Status
                </th>
                <th
                  className="px-3 py-2 text-left text-[11px] font-semibold w-36"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {section.items.map((item) => {
                if (item.type === "single")
                  return (
                    <SingleRow
                      key={item.id}
                      item={item}
                      onMarkReceived={onMarkReceived}
                      onToggleNotNeeded={onToggleNotNeeded}
                    />
                  );
                if (item.type === "bilingual")
                  return (
                    <BilingualRow
                      key={item.id}
                      item={item}
                      onMarkReceived={onMarkReceived}
                      onToggleNotNeeded={onToggleNotNeeded}
                    />
                  );
                if (item.type === "multi")
                  return (
                    <MultiRow
                      key={item.id}
                      item={item}
                      onMarkReceived={onMarkReceived}
                      onAddDoc={onAddDoc}
                    />
                  );
                if (item.type === "roi")
                  return (
                    <RoiRow
                      key={item.id}
                      item={item}
                      onMarkReceived={onMarkReceived}
                    />
                  );
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
// Main Panel (exported)
// ─────────────────────────────────────────────────────────────

export function DocumentsChecklistPanel() {
  const [sections, setSections] =
    useState<Section[]>(INITIAL_SECTIONS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | ItemStatus
  >("all");
  const [markTarget, setMarkTarget] =
    useState<MarkReceivedTarget | null>(null);
  const [addDocTarget, setAddDocTarget] = useState<{
    itemId: string;
    sectionId: string;
    itemName: string;
  } | null>(null);

  const stats = useMemo(() => {
    let total = 0,
      received = 0,
      outstanding = 0,
      notNeeded = 0;
    for (const s of sections)
      for (const item of s.items) {
        total++;
        const st = getItemPrimaryStatus(item);
        if (st === "received") received++;
        else if (st === "outstanding") outstanding++;
        else notNeeded++;
      }
    return { total, received, outstanding, notNeeded };
  }, [sections]);

  const filteredSections = useMemo(() => {
    const q = search.toLowerCase().trim();
    return sections
      .map((s) => ({
        ...s,
        items: s.items.filter(
          (item) =>
            (!q || item.name.toLowerCase().includes(q)) &&
            (filterStatus === "all" ||
              getItemPrimaryStatus(item) === filterStatus),
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [sections, search, filterStatus]);

  // ── Mutation helpers ──────────────────────────────────────

  function updateSections(fn: (prev: Section[]) => Section[]) {
    setSections(fn);
  }

  function findSectionId(itemId: string) {
    return (
      sections.find((s) => s.items.some((i) => i.id === itemId))
        ?.id ?? ""
    );
  }

  function handleMarkReceivedSave(date: string) {
    if (!markTarget) return;
    const { itemId, subId } = markTarget;
    const sectionId = findSectionId(itemId);
    const isoDate = mdyToIso(date);
    updateSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              items: s.items.map((item) => {
                if (item.id !== itemId) return item;
                if (item.type === "single")
                  return {
                    ...item,
                    status: "received" as ItemStatus,
                    dateFiledReceived: isoDate,
                  };
                if (item.type === "bilingual")
                  return {
                    ...item,
                    en: {
                      status: "received" as ItemStatus,
                      dateFiledReceived: isoDate,
                    },
                    es: {
                      status: "received" as ItemStatus,
                      dateFiledReceived: isoDate,
                    },
                  };
                if (item.type === "multi" && subId)
                  return {
                    ...item,
                    docs: item.docs.map((d) =>
                      d.id !== subId
                        ? d
                        : {
                            ...d,
                            status: "received" as ItemStatus,
                            dateFiledReceived: isoDate,
                          },
                    ),
                  };
                if (item.type === "roi" && subId)
                  return {
                    ...item,
                    roiItems: item.roiItems.map((r) =>
                      r.type !== subId
                        ? r
                        : {
                            ...r,
                            status: "received" as ItemStatus,
                            dateFiledReceived: isoDate,
                          },
                    ),
                  };
                return item;
              }),
            },
      ),
    );
    toast.success("Marked as received.");
    setMarkTarget(null);
  }

  function handleToggleNotNeeded(itemId: string) {
    const sectionId = findSectionId(itemId);
    updateSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              items: s.items.map((item) => {
                if (item.id !== itemId) return item;
                if (item.type === "single")
                  return {
                    ...item,
                    status: (item.status === "not-needed"
                      ? "outstanding"
                      : "not-needed") as ItemStatus,
                  };
                if (item.type === "bilingual") {
                  const allNotNeeded =
                    item.en.status === "not-needed" &&
                    item.es.status === "not-needed";
                  const newStatus = (
                    allNotNeeded ? "outstanding" : "not-needed"
                  ) as ItemStatus;
                  return {
                    ...item,
                    en: { ...item.en, status: newStatus },
                    es: { ...item.es, status: newStatus },
                  };
                }
                return item;
              }),
            },
      ),
    );
  }

  function handleAddDoc(itemId: string) {
    const sec = sections.find((s) =>
      s.items.some((i) => i.id === itemId),
    );
    const item = sec?.items.find((i) => i.id === itemId);
    if (sec && item)
      setAddDocTarget({
        itemId,
        sectionId: sec.id,
        itemName: item.name,
      });
  }

  function handleAddDocSave(label: string, date: string) {
    if (!addDocTarget) return;
    const { itemId, sectionId } = addDocTarget;
    const isoDate = mdyToIso(date);
    updateSections((prev) =>
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
                      docs: [
                        ...item.docs,
                        {
                          id: `${itemId}-${Date.now()}`,
                          label,
                          status: "received" as ItemStatus,
                          dateFiledReceived: isoDate,
                        },
                      ],
                    },
              ),
            },
      ),
    );
    toast.success("Document added.");
    setAddDocTarget(null);
  }

  const overallPct =
    stats.total > 0
      ? Math.round((stats.received / stats.total) * 100)
      : 0;

  return (
    <div className="space-y-4 px-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3
            className="text-[15px] font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Documents Checklist
          </h3>
        </div>
      </div>

      {/* Summary bar */}
      <div
        className="rounded-lg p-3 flex items-center gap-4 flex-wrap"
        style={{
          border: ROW_BORDER,
          background: "var(--slds-g-color-background-base)",
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-36">
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{
              background: "var(--slds-g-color-neutral-95)",
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${overallPct}%`,
                background:
                  overallPct === 100 ? "#145F33" : "#f59e0b",
              }}
            />
          </div>
          <span
            className="text-[12px] font-semibold whitespace-nowrap"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            {overallPct}%
          </span>
        </div>
        <div className="flex items-center gap-4">
          {[
            {
              label: "Total",
              value: stats.total,
              color: "var(--slds-g-color-text-default)",
            },
            {
              label: "Received",
              value: stats.received,
              color: "#145F33",
            },
            {
              label: "Outstanding",
              value: stats.outstanding,
              color: "#b45309",
            },
            {
              label: "Not Needed",
              value: stats.notNeeded,
              color: "var(--slds-g-color-text-weak)",
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div
                className="text-[15px] font-bold"
                style={{ color }}
              >
                {value}
              </div>
              <div
                className="text-[11px]"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div
          className="flex items-center gap-1.5 flex-1 min-w-40 rounded-full h-8 px-2.5"
          style={{ border: ROW_BORDER }}
        >
          <Search
            size={12}
            style={{
              color: "var(--slds-g-color-text-weak)",
              flexShrink: 0,
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents…"
            className="flex-1 bg-transparent text-[13px] outline-none"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          />
        </div>
        <div className="flex items-center gap-1">
          {(
            [
              "all",
              "received",
              "outstanding",
              "not-needed",
            ] as const
          ).map((v) => (
            <button
              key={v}
              onClick={() => setFilterStatus(v)}
              className="rounded-full h-7 px-2.5 text-[11px] font-medium border transition-colors"
              style={{
                backgroundColor:
                  filterStatus === v
                    ? "#145F33"
                    : "transparent",
                color:
                  filterStatus === v
                    ? "#fff"
                    : "var(--slds-g-color-text-default)",
                borderColor:
                  filterStatus === v
                    ? "#145F33"
                    : "var(--slds-g-color-border-base-1)",
              }}
            >
              {v === "all"
                ? "All"
                : v === "received"
                  ? "Received"
                  : v === "outstanding"
                    ? "Outstanding"
                    : "Not Needed"}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {(
          [
            ["received", "Received"],
            ["outstanding", "Outstanding"],
            ["not-needed", "Not Needed"],
          ] as [ItemStatus, string][]
        ).map(([s, l]) => (
          <div key={s} className="flex items-center gap-1">
            <StatusIcon status={s} size={12} />
            <span
              className="text-[11px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {l}
            </span>
          </div>
        ))}
        <span
          className="text-[11px]"
          style={{ color: "#c23934" }}
        >
          * Required
        </span>
      </div>

      {/* Sections */}
      {filteredSections.length === 0 ? (
        <div
          className="rounded-lg flex flex-col items-center justify-center py-12 text-center"
          style={{
            border:
              "2px dashed var(--slds-g-color-border-base-1)",
          }}
        >
          <FileText
            size={28}
            className="mb-2 opacity-40"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          />
          <p
            className="text-[13px]"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            No items match your search or filter.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setFilterStatus("all");
            }}
            className="mt-2 rounded-full h-7 px-3 text-[12px] border transition-colors hover:bg-gray-50"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSections.map((section, idx) => (
            <SectionAccordion
              key={section.id}
              section={section}
              defaultOpen={idx < 2}
              onMarkReceived={setMarkTarget}
              onToggleNotNeeded={handleToggleNotNeeded}
              onAddDoc={handleAddDoc}
            />
          ))}
        </div>
      )}

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