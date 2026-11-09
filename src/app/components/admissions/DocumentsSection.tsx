import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Upload,
  FileText,
  Pencil,
  Trash2,
  Eye,
  Lock,
  Link2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
} from "@/app/lib/lucide-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, localTodayIso } from "../../lib/dateFormat";
import { toast } from "sonner@2.0.3";
import {
  allocateDocumentId,
  updateOwnerDocuments,
  useOwnerDocuments,
} from "../../data/constituentDocumentStore";

export interface DocRecord {
  id: number;
  documentName: string;
  documentType: string;
  // Generic date fields
  dateExecuted: string;
  dateFiledReceived: string;
  // TB-specific
  testDate: string;
  readDate: string;
  result?: string;
  // Immunization-specific
  documentDate: string;
  // TB + Immunization shared
  dateReceived: string;
  // Renewal
  expirationRenewalDate: string;
  renewalCadence: string;
  // Common
  documentUrl: string;
  notes: string;
  restricted: boolean;
  fileName: string;
  // Audit — read-only, shown only in Document Details
  createdBy: string;
  createdDate: string;
  lastModifiedBy: string;
  lastModifiedDate: string;
}

interface ReceivedItem {
  id: number;
  itemName: string;
  receivedDate: string;
  receivedBy: string;
  status: string;
  notes: string;
}

interface ReuseDocument {
  id: number;
  documentType: string;
  lastUsedDate: string;
  availableForReuse: boolean;
  expirationDate: string;
  notes: string;
}

const TODAY = "2026-08-31";
const YOUTH_NAME = "Marcus Thompson";
const DOCUMENT_TYPES = [
  //"Birth Certificate",
  //"Social Security Card",
  //"ID Card-Front",
  //"ID Card-Back",
  //"Photo",
  //"School/Work Verification",
  //"Medical Records",
  //"Insurance Card",
  "Immunization Records",
  "TB Tests",
  //"Court Order",
  //"DCFS Case Plan",
  //"Psychiatric Evaluation",
  //"Family Therapy Notes",
  "Other",
];

function getDocStatus(doc: DocRecord): string {
  if (doc.restricted) return "Restricted";
  if (
    doc.expirationRenewalDate &&
    doc.expirationRenewalDate < TODAY
  )
    return "Expired";
  if (doc.expirationRenewalDate) {
    const diff =
      new Date(doc.expirationRenewalDate).getTime() -
      new Date(TODAY).getTime();
    if (diff < 90 * 24 * 60 * 60 * 1000) return "Expiring Soon";
  }
  return "Active";
}

function getDocDate(doc: DocRecord): string {
  if (doc.documentType === "TB Tests") return doc.testDate;
  if (doc.documentType === "Immunization Records")
    return doc.documentDate;
  return doc.dateExecuted;
}

function getDocDateReceived(doc: DocRecord): string {
  if (
    doc.documentType === "TB Tests" ||
    doc.documentType === "Immunization Records"
  ) {
    return doc.dateReceived;
  }
  return doc.dateFiledReceived;
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "Active"
      ? "bg-green-50 text-green-700 border-green-200 rounded-full"
      : status === "Expired"
        ? "bg-red-50 text-red-700 border-red-200 rounded-full"
        : status === "Expiring Soon"
          ? "bg-yellow-50 text-yellow-700 border-yellow-200 rounded-full"
          : "bg-gray-50 text-gray-600 border-gray-200 rounded-full";
  return (
    <Badge
      variant="outline"
      className={`${cls} rounded-sm inline-flex items-center gap-1 rounded-full`}
    >
      {status === "Restricted" && <Lock className="h-3 w-3" />}
      {status}
    </Badge>
  );
}

function defaultRenewalCadence(documentType: string): string {
  if (documentType === "TB Tests") return "Annual";
  if (documentType === "Immunization Records")
    return "As Needed";
  return "One-time";
}

const emptyForm = (): Omit<DocRecord, "id"> => ({
  documentName: "",
  documentType: "",
  dateExecuted: "",
  dateFiledReceived: "",
  testDate: "",
  readDate: "",
  result: "",
  documentDate: "",
  dateReceived: "",
  expirationRenewalDate: "",
  renewalCadence: "One-time",
  documentUrl: "",
  notes: "",
  restricted: false,
  fileName: "",
  createdBy: "Sarah Johnson",
  createdDate: TODAY,
  lastModifiedBy: "Sarah Johnson",
  lastModifiedDate: TODAY,
});

export function DocumentsSection({
  ownerId,
  ownerName,
  scoped = false,
}: {
  /** Stable Constituent ID that owns the documents. */
  ownerId?: string;
  /** Owner's display name, shown in Document Details when scoped. */
  ownerName?: string;
  /** Opt-in (Contractor, US 20097): read and write the owner-keyed
   *  constituentDocumentStore, starting empty, with no Youth sample
   *  documents, received items or reuse rows. Without it the component
   *  keeps its existing local sample data, even when ownerId is passed. */
  scoped?: boolean;
} = {}) {
  const isScoped = scoped && !!ownerId;
  const ownerDocuments = useOwnerDocuments(
    isScoped ? (ownerId as string) : "",
  );
  // ── Documents ───────────────────────────────────────────────────────────────
  const [localDocuments, setLocalDocuments] = useState<
    DocRecord[]
  >([
    {
      id: 1,
      documentName: "TB Tests",
      documentType: "TB Tests",
      dateExecuted: "",
      dateFiledReceived: "",
      testDate: "2026-08-15",
      readDate: "2026-08-17",
      result: "Negative",
      documentDate: "",
      dateReceived: "2026-08-18",
      expirationRenewalDate: "2027-08-15",
      renewalCadence: "Annual",
      documentUrl: "#",
      notes: "Annual TB screening — result negative",
      restricted: false,
      fileName: "TB_Test_Results_Aug2026.pdf",
      createdBy: "Sarah Johnson",
      createdDate: "2026-08-18",
      lastModifiedBy: "Sarah Johnson",
      lastModifiedDate: "2026-08-18",
    },
    {
      id: 2,
      documentName: "Immunization Records",
      documentType: "Immunization Records",
      dateExecuted: "",
      dateFiledReceived: "",
      testDate: "",
      readDate: "",
      documentDate: "2026-08-10",
      dateReceived: "2026-08-12",
      expirationRenewalDate: "",
      renewalCadence: "As Needed",
      documentUrl: "#",
      notes: "Current immunization records on file",
      restricted: false,
      fileName: "Immunization_Records_Aug2026.pdf",
      createdBy: "Michael Davis",
      createdDate: "2026-08-12",
      lastModifiedBy: "Michael Davis",
      lastModifiedDate: "2026-08-12",
    },
    /*{
      id: 3,
      documentName: "ID Card-Front",
      documentType: "ID Card-Front",
      dateExecuted: "2024-01-10",
      dateFiledReceived: "2024-01-15",
      testDate: "",
      readDate: "",
      documentDate: "",
      dateReceived: "",
      expirationRenewalDate: "2029-01-15",
      renewalCadence: "Every 3 Years",
      documentUrl: "#",
      notes: "Valid government-issued ID",
      restricted: false,
      fileName: "ID_Card_Front.pdf",
      createdBy: "Sarah Johnson",
      createdDate: "2024-01-15",
      lastModifiedBy: "Sarah Johnson",
      lastModifiedDate: "2024-01-15",
    },
    {
      id: 4,
      documentName: "ID Card-Back",
      documentType: "ID Card-Back",
      dateExecuted: "2024-01-10",
      dateFiledReceived: "2024-01-15",
      testDate: "",
      readDate: "",
      documentDate: "",
      dateReceived: "",
      expirationRenewalDate: "2029-01-15",
      renewalCadence: "Every 3 Years",
      documentUrl: "#",
      notes: "",
      restricted: false,
      fileName: "ID_Card_Back.pdf",
      createdBy: "Sarah Johnson",
      createdDate: "2024-01-15",
      lastModifiedBy: "Sarah Johnson",
      lastModifiedDate: "2024-01-15",
    },
    {
      id: 5,
      documentName: "Youth Photo 2024",
      documentType: "Photo",
      dateExecuted: "2024-02-05",
      dateFiledReceived: "2024-02-10",
      testDate: "",
      readDate: "",
      documentDate: "",
      dateReceived: "",
      expirationRenewalDate: "2025-02-10",
      renewalCadence: "Annual",
      documentUrl: "#",
      notes: "Annual photo renewal required",
      restricted: false,
      fileName: "Youth_Photo_2024.jpg",
      createdBy: "Sarah Johnson",
      createdDate: "2024-02-10",
      lastModifiedBy: "Sarah Johnson",
      lastModifiedDate: "2024-02-10",
    },
    {
      id: 6,
      documentName: "School Verification 2024",
      documentType: "School/Work Verification",
      dateExecuted: "2024-03-01",
      dateFiledReceived: "2024-03-05",
      testDate: "",
      readDate: "",
      documentDate: "",
      dateReceived: "",
      expirationRenewalDate: "2024-12-31",
      renewalCadence: "Annual",
      documentUrl: "#",
      notes: "Renewal requested from school district",
      restricted: false,
      fileName: "School_Verification_2024.pdf",
      createdBy: "Michael Davis",
      createdDate: "2024-03-05",
      lastModifiedBy: "Michael Davis",
      lastModifiedDate: "2024-03-05",
    },
    {
      id: 7,
      documentName: "Birth Certificate",
      documentType: "Birth Certificate",
      dateExecuted: "2004-05-15",
      dateFiledReceived: "2024-01-20",
      testDate: "",
      readDate: "",
      documentDate: "",
      dateReceived: "",
      expirationRenewalDate: "",
      renewalCadence: "One-time",
      documentUrl: "#",
      notes: "Certified copy on file",
      restricted: false,
      fileName: "Birth_Certificate.pdf",
      createdBy: "Sarah Johnson",
      createdDate: "2024-01-20",
      lastModifiedBy: "Sarah Johnson",
      lastModifiedDate: "2024-01-20",
    },
    {
      id: 8,
      documentName: "Social Security Card",
      documentType: "Social Security Card",
      dateExecuted: "",
      dateFiledReceived: "2024-01-20",
      testDate: "",
      readDate: "",
      documentDate: "",
      dateReceived: "",
      expirationRenewalDate: "",
      renewalCadence: "One-time",
      documentUrl: "#",
      notes: "Original document received",
      restricted: false,
      fileName: "Social_Security_Card.pdf",
      createdBy: "Sarah Johnson",
      createdDate: "2024-01-20",
      lastModifiedBy: "Sarah Johnson",
      lastModifiedDate: "2024-01-20",
    },
    {
      id: 9,
      documentName: "Medical Records 2024",
      documentType: "Medical Records",
      dateExecuted: "2024-02-15",
      dateFiledReceived: "2024-02-28",
      testDate: "",
      readDate: "",
      documentDate: "",
      dateReceived: "",
      expirationRenewalDate: "2025-02-28",
      renewalCadence: "Annual",
      documentUrl: "#",
      notes: "Confidential — restricted access",
      restricted: true,
      fileName: "Medical_Records_2024.pdf",
      createdBy: "Michael Davis",
      createdDate: "2024-02-28",
      lastModifiedBy: "Michael Davis",
      lastModifiedDate: "2024-02-28",
    },
    {
      id: 10,
      documentName: "Insurance Card 2024",
      documentType: "Insurance Card",
      dateExecuted: "2024-01-01",
      dateFiledReceived: "2024-01-01",
      testDate: "",
      readDate: "",
      documentDate: "",
      dateReceived: "",
      expirationRenewalDate: "2024-12-31",
      renewalCadence: "Annual",
      documentUrl: "#",
      notes: "Renewal pending from provider",
      restricted: false,
      fileName: "Insurance_Card_2024.pdf",
      createdBy: "Sarah Johnson",
      createdDate: "2024-01-01",
      lastModifiedBy: "Sarah Johnson",
      lastModifiedDate: "2024-01-01",
    },*/
  ]);
  const documents = isScoped ? ownerDocuments : localDocuments;
  const setDocuments = (
    update: (docs: DocRecord[]) => DocRecord[],
  ) =>
    isScoped
      ? updateOwnerDocuments(ownerId as string, update)
      : setLocalDocuments(update);

  // ── Upload / Edit modal ─────────────────────────────────────────────────────
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(
    null,
  );
  const [form, setForm] =
    useState<Omit<DocRecord, "id">>(emptyForm());
  const [dragOver, setDragOver] = useState(false);
  const [formErrors, setFormErrors] = useState<
    Record<string, string>
  >({});

  // ── Document Details modal ──────────────────────────────────────────────────
  const [detailsDocId, setDetailsDocId] = useState<
    number | null
  >(null);
  const detailsDoc =
    documents.find((d) => d.id === detailsDocId) ?? null;

  // ── Table sort ──────────────────────────────────────────────────────────────
  const [sortCol, setSortCol] = useState("documentName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const sortedDocuments = [...documents].sort((a, b) => {
    let aVal = "";
    let bVal = "";
    if (sortCol === "documentName") {
      aVal = a.documentName;
      bVal = b.documentName;
    } else if (sortCol === "documentType") {
      aVal = a.documentType;
      bVal = b.documentType;
    } else if (sortCol === "documentDate") {
      aVal = getDocDate(a);
      bVal = getDocDate(b);
    } else if (sortCol === "dateReceived") {
      aVal = getDocDateReceived(a);
      bVal = getDocDateReceived(b);
    }
    const cmp = (aVal ?? "").localeCompare(bVal ?? "");
    return sortDir === "asc" ? cmp : -cmp;
  });

  // ── Permission prototype toggle ─────────────────────────────────────────────
  const [isAuthorized, setIsAuthorized] = useState(true);

  // ── Delete confirmation ─────────────────────────────────────────────────────
  const [confirmDeleteId, setConfirmDeleteId] = useState<
    number | null
  >(null);

  // ── Received Items ──────────────────────────────────────────────────────────
  const [receivedItems] = useState<ReceivedItem[]>([
    {
      id: 1,
      itemName: "ID Card (Front & Back)",
      receivedDate: "2024-01-20",
      receivedBy: "Sarah Johnson",
      status: "Received",
      notes: "Original documents scanned and stored",
    },
    {
      id: 2,
      itemName: "Birth Certificate",
      receivedDate: "2024-01-22",
      receivedBy: "Michael Davis",
      status: "Received",
      notes: "Certified copy received",
    },
    {
      id: 3,
      itemName: "Social Security Card",
      receivedDate: "2024-01-22",
      receivedBy: "Michael Davis",
      status: "Received",
      notes: "Original document received",
    },
    {
      id: 4,
      itemName: "Medical Records",
      receivedDate: "",
      receivedBy: "",
      status: "Pending",
      notes: "Requested from healthcare provider",
    },
    {
      id: 5,
      itemName: "School Transcripts",
      receivedDate: "",
      receivedBy: "",
      status: "Missing",
      notes: "Follow-up required with school district",
    },
    {
      id: 6,
      itemName: "Insurance Card",
      receivedDate: "2024-02-05",
      receivedBy: "Sarah Johnson",
      status: "Received",
      notes: "Copy received and verified",
    },
  ]);
  const [receivedItemsOpen, setReceivedItemsOpen] =
    useState(false);

  // ── Reuse Documents ─────────────────────────────────────────────────────────
  const [reuseDocuments] = useState<ReuseDocument[]>([
    {
      id: 1,
      documentType: "ID Card-Front",
      lastUsedDate: "2024-01-15",
      availableForReuse: true,
      expirationDate: "2029-01-15",
      notes: "Valid for all programs",
    },
    {
      id: 2,
      documentType: "ID Card-Back",
      lastUsedDate: "2024-01-15",
      availableForReuse: true,
      expirationDate: "2029-01-15",
      notes: "Valid for all programs",
    },
    {
      id: 3,
      documentType: "Birth Certificate",
      lastUsedDate: "2024-01-20",
      availableForReuse: true,
      expirationDate: "",
      notes: "Permanent document — no expiration",
    },
    {
      id: 4,
      documentType: "Social Security Card",
      lastUsedDate: "2024-01-20",
      availableForReuse: true,
      expirationDate: "",
      notes: "Permanent document — no expiration",
    },
    {
      id: 5,
      documentType: "Medical Records",
      lastUsedDate: "2024-02-28",
      availableForReuse: false,
      expirationDate: "2025-02-28",
      notes: "Outdated — new records required",
    },
    {
      id: 6,
      documentType: "Insurance Card",
      lastUsedDate: "2024-01-01",
      availableForReuse: false,
      expirationDate: "2024-12-31",
      notes: "Expired — renewal needed",
    },
    {
      id: 7,
      documentType: "Photo",
      lastUsedDate: "2024-02-10",
      availableForReuse: false,
      expirationDate: "2025-02-10",
      notes: "Expired — new photo required",
    },
  ]);
  const [reuseOpen, setReuseOpen] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const openUpload = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormErrors({});
    setUploadOpen(true);
  };

  const openEdit = (doc: DocRecord) => {
    setEditingId(doc.id);
    setForm({
      documentName: doc.documentName,
      documentType: doc.documentType,
      dateExecuted: doc.dateExecuted,
      dateFiledReceived: doc.dateFiledReceived,
      testDate: doc.testDate,
      readDate: doc.readDate,
      result: doc.result ?? "",
      documentDate: doc.documentDate,
      dateReceived: doc.dateReceived,
      expirationRenewalDate: doc.expirationRenewalDate,
      renewalCadence: doc.renewalCadence,
      documentUrl: doc.documentUrl,
      notes: doc.notes,
      restricted: doc.restricted,
      fileName: doc.fileName,
      createdBy: doc.createdBy,
      createdDate: doc.createdDate,
      lastModifiedBy: "Sarah Johnson",
      lastModifiedDate: TODAY,
    });
    setFormErrors({});
    setUploadOpen(true);
  };

  const isTB = (type: string) => type === "TB Tests";
  const isImmunization = (type: string) =>
    type === "Immunization Records";
  const isGeneric = (type: string) =>
    !isTB(type) && !isImmunization(type);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.documentType.trim())
      errs.documentType = "Document Type is required.";
    // Prototype (scoped owners, US 20096/20097): a file is optional.
    if (editingId === null && !form.fileName && !isScoped)
      errs.fileName = "A document file is required.";

    if (isTB(form.documentType)) {
      if (!form.testDate.trim())
        errs.testDate = "Test Date is required.";
      if (!form.readDate.trim())
        errs.readDate = "Read Date is required.";
      if (!form.dateReceived.trim())
        errs.dateReceived = "Date Received is required.";
    } else if (isImmunization(form.documentType)) {
      if (!form.documentDate.trim())
        errs.documentDate = "Document Date is required.";
      if (!form.dateReceived.trim())
        errs.dateReceived = "Date Received is required.";
    } else {
      if (!form.dateFiledReceived.trim())
        errs.dateFiledReceived =
          "Date Filed / Received is required.";
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const resolvedName = form.fileName
      ? form.fileName
          .replace(/\.[^.]+$/, "")
          .replace(/[_-]/g, " ")
      : form.documentType;
    const docToSave = { ...form, documentName: resolvedName };

    if (editingId !== null) {
      setDocuments((ds) =>
        ds.map((d) =>
          d.id === editingId ? { ...d, ...docToSave } : d,
        ),
      );
      toast.success("Document updated successfully.");
    } else {
      const newId = isScoped
        ? allocateDocumentId()
        : Math.max(...documents.map((d) => d.id), 0) + 1;
      setDocuments((ds) => [
        ...ds,
        { id: newId, ...docToSave },
      ]);
      toast.success("Document uploaded successfully.");
    }
    setUploadOpen(false);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId === null) return;
    setDocuments((ds) =>
      ds.filter((d) => d.id !== confirmDeleteId),
    );
    toast.success("Document deleted successfully.");
    setConfirmDeleteId(null);
  };

  // ── Shared styles ───────────────────────────────────────────────────────────
  const inputStyle = {
    border: "1px solid var(--slds-g-color-border-base-1)",
    backgroundColor: "var(--slds-g-color-background-base)",
    color: "var(--slds-g-color-text-default)",
  };

  const labelStyle = { color: "var(--slds-g-color-text-weak)" };

  const fieldLabel = (
    text: string,
    required?: boolean,
    htmlFor?: string,
  ) => (
    <Label
      htmlFor={htmlFor}
      className="slds-form-label block mb-1.5"
      style={labelStyle}
    >
      {text}
      {required && <span style={{ color: "#c23934" }}> *</span>}
    </Label>
  );

  const thStyle = {
    color: "var(--slds-g-color-text-weak)",
    borderBottom: "1px solid var(--slds-g-color-border-base-1)",
  };

  const cancelBtn = (onClose: () => void) => (
    <Button
      variant="outline"
      onClick={onClose}
      className="h-9 px-6 rounded-full text-[13px] font-medium"
      style={{
        backgroundColor: "var(--slds-g-color-neutral-95)",
        color: "var(--slds-g-color-text-default)",
        border: "1px solid var(--slds-g-color-border-base-1)",
      }}
    >
      Cancel
    </Button>
  );

  // ── Sortable column header ──────────────────────────────────────────────────
  const SortableHeader = ({
    col,
    label,
  }: {
    col: string;
    label: string;
  }) => (
    <th
      className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase cursor-pointer select-none"
      style={thStyle}
      onClick={() => handleSort(col)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortCol === col ? (
          sortDir === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        ) : (
          <ChevronDown className="h-3 w-3 opacity-25" />
        )}
      </div>
    </th>
  );

  // ── Section header used inside modals ───────────────────────────────────────
  const sectionHeader = (text: string) => (
    <div className="pt-1 pb-0.5">
      <p
        className="slds-form-label font-semibold uppercase"
        style={{
          color: "var(--slds-g-color-text-weak)",
          letterSpacing: "0.04em",
        }}
      >
        {text}
      </p>
      <div
        style={{
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
          marginTop: "4px",
        }}
      />
    </div>
  );

  // ── Detail field row ────────────────────────────────────────────────────────
  const detailRow = (label: string, value: string) => (
    <div className="flex flex-col gap-0.5">
      <span
        className="slds-text-3 uppercase"
        style={{
          color: "var(--slds-g-color-text-weak)",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>
      <span
        className="slds-text-4"
        style={{ color: "var(--slds-g-color-text-default)" }}
      >
        {value || "—"}
      </span>
    </div>
  );

  return (
    <div className="space-y-6 w-full">
      {/* ── Documents Card ──────────────────────────────────────────────────── */}
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex flex-wrap items-center justify-between gap-2"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <h3
              className="text-[13px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Documents ({documents.length})
            </h3>
            {/*<button
              onClick={() => setIsAuthorized((v) => !v)}
              className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11px] font-medium border transition-colors"
              style={{
                backgroundColor: isAuthorized
                  ? "#f0f9f4"
                  : "#fff4f4",
                borderColor: isAuthorized
                  ? "#145F33"
                  : "#c23934",
                color: isAuthorized ? "#145F33" : "#c23934",
              }}
              title="Toggle to simulate authorized vs. unauthorized user (prototype demo)"
            >
              <Lock className="h-3 w-3" />
              {isAuthorized
                ? "Authorized User"
                : "Unauthorized User"}
            </button>*/}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              className="h-8 rounded-full text-[12px] font-medium"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
              onClick={openUpload}
            >
              <Upload className="h-3.5 w-3.5 mr-1" /> Upload
              Document
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table
            className="w-full text-[13px]"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <SortableHeader
                  col="documentName"
                  label="Document Name"
                />
                <SortableHeader
                  col="documentType"
                  label="Document Type"
                />
                <SortableHeader
                  col="documentDate"
                  label="Date"
                />
                <SortableHeader
                  col="dateReceived"
                  label="Date Received"
                />
                <th
                  className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase"
                  style={thStyle}
                >
                  Status
                </th>
                <th
                  className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase"
                  style={thStyle}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedDocuments.map((doc) => {
                const status = getDocStatus(doc);
                const primaryDate = getDocDate(doc);
                const receivedDate = getDocDateReceived(doc);
                return (
                  <tr
                    key={doc.id}
                    className="transition-colors hover:bg-[var(--slds-g-color-background-alt)]"
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    {/* Document Name — clickable link */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <FileText
                          className="h-4 w-4 flex-shrink-0"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        />
                        <button
                          onClick={() =>
                            setDetailsDocId(doc.id)
                          }
                          className="text-left slds-text-4 hover:underline focus:underline focus:outline-none"
                          style={{ color: "#0176d3" }}
                        >
                          {doc.documentName}
                        </button>
                        {doc.restricted && (
                          <Lock
                            className="h-3 w-3 flex-shrink-0"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                            title="Restricted document"
                          />
                        )}
                      </div>
                    </td>
                    {/* Document Type */}
                    <td
                      className="px-3 py-2.5"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {doc.documentType}
                    </td>
                    {/* Document Date */}
                    <td
                      className="px-3 py-2.5"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {primaryDate
                        ? isoToMdy(primaryDate)
                        : "—"}
                    </td>
                    {/* Date Received */}
                    <td
                      className="px-3 py-2.5"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {receivedDate
                        ? isoToMdy(receivedDate)
                        : "—"}
                    </td>
                    {/* Status */}
                    <td className="px-3 py-2.5">
                      <StatusBadge status={status} />
                    </td>
                    {/* Actions */}
                    <td className="px-3 py-2.5">
                      {doc.restricted && !isAuthorized ? (
                        <button
                          onClick={() =>
                            toast.error(
                              "You do not have permission to view this document.",
                            )
                          }
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded"
                          style={{
                            color: "#c23934",
                            backgroundColor: "#fff4f4",
                            border: "1px solid #f5c6c5",
                          }}
                          title="No permission"
                        >
                          <Lock className="h-3 w-3" /> No Access
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          {/*<button
                            onClick={() =>
                              setDetailsDocId(doc.id)
                            }
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                            title="View Details"
                          >
                            <Eye
                              className="h-3.5 w-3.5"
                              style={{ color: "#0176d3" }}
                            />
                          </button>*/}
                          <button
                            onClick={() => openEdit(doc)}
                            className="p-1 rounded hover:bg-[#f3f2f2] transition-colors"
                            title="Edit"
                          >
                            <Pencil
                              className="h-3.5 w-3.5"
                              style={{
                                color: "#145F33",
                                backgroundColor: "transparent",
                              }}
                            />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDeleteId(doc.id)
                            }
                            className="p-1 rounded hover:bg-[rgba(194,57,52,0.08)] transition-colors"
                            title="Delete"
                          >
                            <Trash2
                              className="h-3.5 w-3.5"
                              style={{
                                color: "#c23934",
                                backgroundColor: "transparent",
                              }}
                            />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Upload / Edit Modal ──────────────────────────────────────────────── */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent
          className="sm:max-w-xl max-h-[calc(100vh-32px)] flex flex-col gap-0 p-0 rounded-lg shadow-lg"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dddbda",
          }}
        >
          <DialogHeader
            className="px-6 py-4"
            style={{
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            <DialogTitle
              className="text-[15px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {editingId !== null
                ? "Edit Document"
                : "Upload Document"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingId !== null
                ? "Edit document metadata."
                : "Upload a new document."}
            </DialogDescription>
          </DialogHeader>

          <div
            className="flex-1 overflow-y-auto px-6 space-y-6 py-6"
            style={{
              backgroundColor: "#ffffff",
            }}
          >
            {/* Document Type */}
            <div className="space-y-1.5">
              {fieldLabel(
                "Document Type",
                true,
                "upload-doctype",
              )}
              <select
                id="upload-doctype"
                value={form.documentType}
                onChange={(e) => {
                  const type = e.target.value;
                  setForm((f) => ({
                    ...f,
                    documentType: type,
                    renewalCadence: defaultRenewalCadence(type),
                  }));
                }}
                className="h-9 w-full px-3 rounded slds-text-4"
                style={{
                  ...inputStyle,
                  borderColor: formErrors.documentType
                    ? "#c23934"
                    : "var(--slds-g-color-border-base-1)",
                }}
              >
                <option value="">Select Document Type</option>
                {DOCUMENT_TYPES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              {formErrors.documentType && (
                <p
                  className="text-[11px]"
                  style={{ color: "#c23934" }}
                >
                  {formErrors.documentType}
                </p>
              )}
            </div>

            {/* Document Restricted */}
            {[
              "Immunization Records",
              "TB Tests",
              "Other",
            ].includes(form.documentType) && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="upload-restricted"
                  checked={form.restricted}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      restricted: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded cursor-pointer"
                  style={{ accentColor: "#145F33" }}
                />
                <label
                  htmlFor="upload-restricted"
                  className="slds-form-label cursor-pointer"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  DOCUMENT RESTRICTED
                </label>
              </div>
            )}

            {form.documentType && (
              <div className="space-y-1.5">
                {fieldLabel(
                  "Document File",
                  editingId === null,
                  "upload-file",
                )}
                {editingId !== null &&
                form.fileName &&
                !dragOver ? (
                  <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <FileText
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: "#0176d3" }}
                    />
                    <span
                      className="slds-text-4 flex-1 truncate"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {form.fileName}
                    </span>
                    <button
                      onClick={() =>
                        toast.success(
                          `Opening "${form.fileName}"…`,
                        )
                      }
                      className="text-[12px] font-medium whitespace-nowrap"
                      style={{ color: "#0176d3" }}
                    >
                      View File
                    </button>
                    <button
                      onClick={() =>
                        setForm((f) => ({ ...f, fileName: "" }))
                      }
                      className="text-[12px] whitespace-nowrap"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file)
                        setForm((f) => ({
                          ...f,
                          fileName: file.name,
                        }));
                    }}
                    onClick={() => {
                      const mockName = `Document_${localTodayIso().replace(/-/g, "")}.pdf`;
                      setForm((f) => ({
                        ...f,
                        fileName: mockName,
                      }));
                    }}
                    className="rounded px-4 py-6 text-center border-2 border-dashed transition-colors cursor-pointer"
                    style={{
                      borderColor: dragOver
                        ? "#145F33"
                        : formErrors.fileName
                          ? "#c23934"
                          : "var(--slds-g-color-border-base-1)",
                      backgroundColor: dragOver
                        ? "#f0f9f4"
                        : "var(--slds-g-color-background-alt)",
                    }}
                  >
                    {form.fileName ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText
                          className="h-5 w-5"
                          style={{ color: "#145F33" }}
                        />
                        <span
                          className="slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {form.fileName}
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload
                          className="h-6 w-6 mx-auto mb-2"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        />
                        <p
                          className="slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          Drag and drop a file here, or
                        </p>
                        <p
                          className="text-[12px] mt-1 font-medium"
                          style={{ color: "#0176d3" }}
                        >
                          Browse Files
                        </p>
                      </>
                    )}
                  </div>
                )}
                {formErrors.fileName && (
                  <p
                    className="text-[11px]"
                    style={{ color: "#c23934" }}
                  >
                    {formErrors.fileName}
                  </p>
                )}
              </div>
            )}

            {/* ── TB Tests ─────────────────────────────────────────── */}
            {isTB(form.documentType) && (
              <>
                {sectionHeader("TB Tests")}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    {fieldLabel(
                      "Test Date",
                      true,
                      "upload-testdate",
                    )}
                    <DateInput
                      id="upload-testdate"
                      value={isoToMdy(form.testDate)}
                      onChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          testDate: mdyToIso(v),
                        }))
                      }
                      className="h-9 w-full slds-text-4 rounded"
                      style={{
                        ...inputStyle,
                        borderColor: formErrors.testDate
                          ? "#c23934"
                          : "var(--slds-g-color-border-base-1)",
                      }}
                    />
                    {formErrors.testDate && (
                      <p
                        className="text-[11px]"
                        style={{ color: "#c23934" }}
                      >
                        {formErrors.testDate}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {fieldLabel(
                      "Read Date",
                      true,
                      "upload-readdate",
                    )}
                    <DateInput
                      id="upload-readdate"
                      value={isoToMdy(form.readDate)}
                      onChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          readDate: mdyToIso(v),
                        }))
                      }
                      className="h-9 w-full slds-text-4 rounded"
                      style={{
                        ...inputStyle,
                        borderColor: formErrors.readDate
                          ? "#c23934"
                          : "var(--slds-g-color-border-base-1)",
                      }}
                    />
                    {formErrors.readDate && (
                      <p
                        className="text-[11px]"
                        style={{ color: "#c23934" }}
                      >
                        {formErrors.readDate}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {fieldLabel(
                      "Date Received",
                      true,
                      "upload-tb-received",
                    )}
                    <DateInput
                      id="upload-tb-received"
                      value={isoToMdy(form.dateReceived)}
                      onChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          dateReceived: mdyToIso(v),
                        }))
                      }
                      className="h-9 w-full slds-text-4 rounded"
                      style={{
                        ...inputStyle,
                        borderColor: formErrors.dateReceived
                          ? "#c23934"
                          : "var(--slds-g-color-border-base-1)",
                      }}
                    />
                    {formErrors.dateReceived && (
                      <p
                        className="text-[11px]"
                        style={{ color: "#c23934" }}
                      >
                        {formErrors.dateReceived}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── Immunization Details ────────────────────────────────────── */}
            {isImmunization(form.documentType) && (
              <>
                {sectionHeader("Immunization Details")}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    {fieldLabel(
                      "Document Date",
                      true,
                      "upload-docdate",
                    )}
                    <DateInput
                      id="upload-docdate"
                      value={isoToMdy(form.documentDate)}
                      onChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          documentDate: mdyToIso(v),
                        }))
                      }
                      className="h-9 w-full slds-text-4 rounded"
                      style={{
                        ...inputStyle,
                        borderColor: formErrors.documentDate
                          ? "#c23934"
                          : "var(--slds-g-color-border-base-1)",
                      }}
                    />
                    {formErrors.documentDate && (
                      <p
                        className="text-[11px]"
                        style={{ color: "#c23934" }}
                      >
                        {formErrors.documentDate}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {fieldLabel(
                      "Date Received",
                      true,
                      "upload-imm-received",
                    )}
                    <DateInput
                      id="upload-imm-received"
                      value={isoToMdy(form.dateReceived)}
                      onChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          dateReceived: mdyToIso(v),
                        }))
                      }
                      className="h-9 w-full slds-text-4 rounded"
                      style={{
                        ...inputStyle,
                        borderColor: formErrors.dateReceived
                          ? "#c23934"
                          : "var(--slds-g-color-border-base-1)",
                      }}
                    />
                    {formErrors.dateReceived && (
                      <p
                        className="text-[11px]"
                        style={{ color: "#c23934" }}
                      >
                        {formErrors.dateReceived}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── Generic Date Fields ─────────────────────────────────────── */}
            {form.documentType &&
              isGeneric(form.documentType) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    {fieldLabel(
                      "Date Executed",
                      false,
                      "upload-executed",
                    )}
                    <DateInput
                      id="upload-executed"
                      value={isoToMdy(form.dateExecuted)}
                      onChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          dateExecuted: mdyToIso(v),
                        }))
                      }
                      className="h-9 w-full slds-text-4 rounded"
                      style={inputStyle}
                    />
                  </div>
                  <div className="space-y-1.5">
                    {fieldLabel(
                      "Date Filed / Received",
                      true,
                      "upload-filed",
                    )}
                    <DateInput
                      id="upload-filed"
                      value={isoToMdy(form.dateFiledReceived)}
                      onChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          dateFiledReceived: mdyToIso(v),
                        }))
                      }
                      className="h-9 w-full slds-text-4 rounded"
                      style={{
                        ...inputStyle,
                        borderColor:
                          formErrors.dateFiledReceived
                            ? "#c23934"
                            : "var(--slds-g-color-border-base-1)",
                      }}
                    />
                    {formErrors.dateFiledReceived && (
                      <p
                        className="text-[11px]"
                        style={{ color: "#c23934" }}
                      >
                        {formErrors.dateFiledReceived}
                      </p>
                    )}
                  </div>
                </div>
              )}
          </div>

          <DialogFooter
            className="px-6 py-3 flex items-center justify-between"
            style={{
              borderTop:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            {cancelBtn(() => setUploadOpen(false))}
            <Button
              onClick={handleSave}
              className="px-4 py-2 rounded-full text-white"
              style={{
                backgroundColor: "#145F33",
                fontSize: "var(--slds-g-font-size-4)",
                border: "none",
              }}
            >
              {editingId !== null ? "Save" : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Document Details Modal ───────────────────────────────────────────── */}
      <Dialog
        open={detailsDocId !== null}
        onOpenChange={() => setDetailsDocId(null)}
      >
        <DialogContent
          className="sm:max-w-xl max-h-[calc(100vh-32px)] flex flex-col gap-0 p-0 rounded-lg shadow-lg"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dddbda",
          }}
        >
          {detailsDoc && (
            <>
              <DialogHeader
                className="px-6 py-4"
                style={{
                  borderBottom:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <DialogTitle
                  className="text-[15px] font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {isTB(detailsDoc.documentType)
                    ? "TB Tests"
                    : isImmunization(detailsDoc.documentType)
                      ? "Immunization Record"
                      : "Document Record"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Document details for {detailsDoc.documentName}
                  .
                </DialogDescription>
              </DialogHeader>

              <div
                className="flex-1 overflow-y-auto px-6 space-y-4 py-6"
                style={{
                  backgroundColor: "#ffffff",
                }}
              >
                {/* Basic Information */}
                <div className="space-y-3">
                  {sectionHeader("Basic Information")}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {isScoped
                      ? detailRow(
                          "Constituent",
                          ownerName ?? "—",
                        )
                      : detailRow("Youth", YOUTH_NAME)}
                    {detailRow(
                      "Document Type",
                      detailsDoc.documentType,
                    )}
                    {detailRow(
                      "Document Name",
                      detailsDoc.documentName,
                    )}
                  </div>
                </div>

                {/* Document Information */}
                <div className="space-y-3">
                  {sectionHeader("Document Information")}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {isTB(detailsDoc.documentType) && (
                      <>
                        {detailRow(
                          "Test Date",
                          detailsDoc.testDate
                            ? isoToMdy(detailsDoc.testDate)
                            : "",
                        )}
                        {detailRow(
                          "Read Date",
                          detailsDoc.readDate
                            ? isoToMdy(detailsDoc.readDate)
                            : "",
                        )}
                        {detailRow(
                          "Date Received",
                          detailsDoc.dateReceived
                            ? isoToMdy(detailsDoc.dateReceived)
                            : "",
                        )}
                      </>
                    )}
                    {isImmunization(
                      detailsDoc.documentType,
                    ) && (
                      <>
                        {detailRow(
                          "Document Date",
                          detailsDoc.documentDate
                            ? isoToMdy(detailsDoc.documentDate)
                            : "",
                        )}
                        {detailRow(
                          "Date Received",
                          detailsDoc.dateReceived
                            ? isoToMdy(detailsDoc.dateReceived)
                            : "",
                        )}
                      </>
                    )}
                    {isGeneric(detailsDoc.documentType) && (
                      <>
                        {detailsDoc.dateExecuted
                          ? detailRow(
                              "Date Executed",
                              isoToMdy(detailsDoc.dateExecuted),
                            )
                          : null}
                        {detailRow(
                          "Date Filed / Received",
                          detailsDoc.dateFiledReceived
                            ? isoToMdy(
                                detailsDoc.dateFiledReceived,
                              )
                            : "",
                        )}
                      </>
                    )}
                  </div>
                  {/* Document file link */}
                  <div className="pt-1">
                    <button
                      onClick={() =>
                        toast.success(
                          `Opening "${detailsDoc.fileName}"…`,
                        )
                      }
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium hover:underline focus:underline focus:outline-none"
                      style={{ color: "#0176d3" }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {isTB(detailsDoc.documentType)
                        ? "View TB Tests"
                        : isImmunization(
                              detailsDoc.documentType,
                            )
                          ? "View Immunization Record"
                          : "View Document"}
                    </button>
                  </div>
                </div>

                {/* Audit Information */}
                <div className="space-y-3">
                  {sectionHeader("Audit Information")}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {detailRow(
                      "Created By",
                      detailsDoc.createdBy,
                    )}
                    {detailRow(
                      "Created Date",
                      detailsDoc.createdDate
                        ? isoToMdy(detailsDoc.createdDate)
                        : "",
                    )}
                    {detailRow(
                      "Last Modified By",
                      detailsDoc.lastModifiedBy,
                    )}
                    {detailRow(
                      "Last Modified Date",
                      detailsDoc.lastModifiedDate
                        ? isoToMdy(detailsDoc.lastModifiedDate)
                        : "",
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter
                className="px-6 py-3 flex items-center justify-between"
                style={{
                  borderTop:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <Button
                  variant="outline"
                  onClick={() => setDetailsDocId(null)}
                  className="h-9 px-6 rounded-full text-[13px] font-medium"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-neutral-95)",
                    color: "var(--slds-g-color-text-default)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setDetailsDocId(null);
                    openEdit(detailsDoc);
                  }}
                  className="h-9 px-6 rounded-full text-[13px] font-medium"
                  style={{
                    backgroundColor: "#145F33",
                    color: "white",
                  }}
                >
                  Edit
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ──────────────────────────────────────────────── */}
      <Dialog
        open={confirmDeleteId !== null}
        onOpenChange={() => setConfirmDeleteId(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle
              className="text-[15px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Delete Document?
            </DialogTitle>
            <DialogDescription
              className="text-[13px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {(() => {
                const doc = documents.find(
                  (d) => d.id === confirmDeleteId,
                );
                return doc
                  ? `Are you sure you want to delete "${doc.documentName}"? This action cannot be undone.`
                  : "Are you sure you want to delete this document? This action cannot be undone.";
              })()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter
            className="pt-4"
            style={{
              borderTop:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            {cancelBtn(() => setConfirmDeleteId(null))}
            <Button
              onClick={handleConfirmDelete}
              className="h-9 px-6 rounded-full text-[13px] font-medium"
              style={{
                backgroundColor: "#c23934",
                color: "white",
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Received Items Modal ─────────────────────────────────────────────── */}
      <Dialog
        open={receivedItemsOpen}
        onOpenChange={setReceivedItemsOpen}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle
              className="text-[15px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Received Items
            </DialogTitle>
            <DialogDescription
              className="text-[13px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Tracking status of requested and received
              documents and physical items.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table
              className="w-full text-[13px]"
              style={{ borderCollapse: "collapse" }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  {[
                    "Item Name",
                    "Received Date",
                    "Received By",
                    "Status",
                    "Notes",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase"
                      style={thStyle}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(isScoped ? [] : receivedItems).map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <td
                      className="px-3 py-2.5"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {item.itemName}
                    </td>
                    <td
                      className="px-3 py-2.5"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {item.receivedDate
                        ? isoToMdy(item.receivedDate)
                        : "—"}
                    </td>
                    <td
                      className="px-3 py-2.5"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {item.receivedBy || "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        variant="outline"
                        className={
                          item.status === "Received"
                            ? "bg-green-50 text-green-700 border-green-200 rounded-sm"
                            : item.status === "Pending"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200 rounded-sm"
                              : "bg-red-50 text-red-700 border-red-200 rounded-sm"
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td
                      className="px-3 py-2.5"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        maxWidth: "220px",
                      }}
                    >
                      <div
                        className="truncate"
                        title={item.notes}
                      >
                        {item.notes || "—"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter
            className="pt-4"
            style={{
              borderTop:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <Button
              variant="outline"
              onClick={() => setReceivedItemsOpen(false)}
              className="h-9 px-6 rounded-full text-[13px] font-medium"
              style={{
                backgroundColor:
                  "var(--slds-g-color-neutral-95)",
                color: "var(--slds-g-color-text-default)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Availability for Reuse Modal ─────────────────────────────────────── */}
      <Dialog open={reuseOpen} onOpenChange={setReuseOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle
              className="text-[15px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Document Availability for Reuse
            </DialogTitle>
            <DialogDescription
              className="text-[13px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Reference an existing document from another
              Homebase workflow without creating a duplicate.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table
              className="w-full text-[13px]"
              style={{ borderCollapse: "collapse" }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  {[
                    "Document Type",
                    "Last Used Date",
                    "Available for Reuse",
                    "Expiration Date",
                    "Notes",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase"
                      style={thStyle}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(isScoped ? [] : reuseDocuments).map((doc) => (
                  <tr
                    key={doc.id}
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <td
                      className="px-3 py-2.5"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {doc.documentType}
                    </td>
                    <td
                      className="px-3 py-2.5"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {isoToMdy(doc.lastUsedDate)}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        variant="outline"
                        className={
                          doc.availableForReuse
                            ? "bg-green-50 text-green-700 border-green-200 rounded-sm"
                            : "bg-red-50 text-red-700 border-red-200 rounded-sm"
                        }
                      >
                        {doc.availableForReuse ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td
                      className="px-3 py-2.5"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {doc.expirationDate
                        ? isoToMdy(doc.expirationDate)
                        : "—"}
                    </td>
                    <td
                      className="px-3 py-2.5"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        maxWidth: "200px",
                      }}
                    >
                      <div
                        className="truncate"
                        title={doc.notes}
                      >
                        {doc.notes}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      {doc.availableForReuse ? (
                        <button
                          onClick={() =>
                            toast.success(
                              `"${doc.documentType}" referenced successfully.`,
                            )
                          }
                          className="h-7 px-3 rounded-full text-[11px] font-medium flex items-center gap-1 whitespace-nowrap"
                          style={{
                            backgroundColor: "#145F33",
                            color: "white",
                          }}
                        >
                          <Link2 className="h-3 w-3" /> Use /
                          Reference
                        </button>
                      ) : (
                        <span
                          className="text-[12px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter
            className="pt-4"
            style={{
              borderTop:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <Button
              variant="outline"
              onClick={() => setReuseOpen(false)}
              className="h-9 px-6 rounded-full text-[13px] font-medium"
              style={{
                backgroundColor:
                  "var(--slds-g-color-neutral-95)",
                color: "var(--slds-g-color-text-default)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}