import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { CheckCircle2, XCircle, Eye, Copy, FileText, Plus, Pill, AlertTriangle, Clock, StopCircle, Download, File } from "@/app/lib/lucide-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { OTCConsentCreationModal } from "./OTCConsentCreationModal";
import { DocuSignConsentModal } from "./DocuSignConsentModal";
import { ManualUploadConsentModal } from "./ManualUploadConsentModal";
import { OTCDispensationModal } from "./OTCDispensationModal";
import { OTCConsentAlerts } from "./OTCConsentAlerts";
import { EndRevokeConsentModal } from "./EndRevokeConsentModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { formatMdy, toLocalIso, parseIsoLocal } from "../../lib/dateFormat";
import { getDemoUserName } from "../../lib/demoIdentity";
import { toast } from "sonner@2.0.3";

// Standard OTC Medications List (AC2)
const STANDARD_OTC_MEDICATIONS = [
  { id: 1, name: "Acetaminophen (Tylenol)", category: "Pain Relief" },
  { id: 2, name: "Diphenhydramine (Benadryl)", category: "Antihistamine" },
  { id: 3, name: "Ibuprofen (Advil)", category: "Pain Relief" },
  { id: 4, name: "Guaifenesin Oral Solution (Cough Medicine (Non-DM only))", category: "Cough/Cold" },
  { id: 5, name: "Oral Anesthetic (Cough Drops)", category: "Cough/Cold" },
  { id: 6, name: "Bismuth Subsalicylate (Pepto Bismol)", category: "Digestive" },
  { id: 7, name: "Calcium Carbonate Antacid (Tums)", category: "Digestive" },
  { id: 8, name: "Naproxen/Naproxen Sodium (Aleve)", category: "Pain Relief" },
  { id: 9, name: "Antibiotic Ointment (Bacitracin/Neomycin/Polymyxin (Neosporin))", category: "Topical" },
  { id: 10, name: "Hydrocortisone 1%", category: "Topical" },
];

// AC14, AC16: Consent Status Types
type ConsentStatus = "Draft" | "Sent" | "Executed" | "Active" | "Expired" | "Ended" | "Revoked";

interface ConsentRecord {
  id: number;
  status: ConsentStatus;
  startDate: string;
  endDate: string;
  executedDate: string | null;
  approvedMedications: number[];
  docuSignEnvelopeId?: string;
  uploadedDocument?: string;
  createdBy: string;
  createdDate: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
  /** Set when the consent is ended early or revoked (demo state). */
  endRevoke?: {
    action: "end" | "revoke";
    comment: string;
    by: string;
    /** ISO timestamp */
    at: string;
  };
  attachedDocuments?: Array<{
    id: number;
    name: string;
    type: string;
    size: string;
    uploadedDate: string;
    uploadedBy: string;
  }>;
}

// AC13: Dispensation Record with consent reference
interface DispensationRecord {
  id: number;
  administrationDate: string;
  medications: Array<{
    medicationId: number;
    medicationName: string;
    quantity: number;
  }>;
  administeredBy: string;
  notes: string;
  consentId: number | null;
  recordedAt: string;
  recordedBy: string;
}

// Mock data - In production, this would come from API
const INITIAL_MOCK_CONSENTS: ConsentRecord[] = [
  {
    id: 1,
    status: "Executed",
    startDate: "2026-01-15",
    endDate: "2027-01-14",
    executedDate: "2026-01-10",
    approvedMedications: [1, 2, 3, 6, 7, 9, 10],
    createdBy: "Sarah Johnson",
    createdDate: "2026-01-08",
    lastModifiedBy: "Michael Chen",
    lastModifiedDate: "2026-01-10",
    attachedDocuments: [
      {
        id: 1,
        name: "OTC_Consent_Form_Signed.pdf",
        type: "PDF",
        size: "245 KB",
        uploadedDate: "2026-01-10T14:30:00Z",
        uploadedBy: "Sarah Johnson",
      },
      {
        id: 2,
        name: "Guardian_Authorization_Letter.pdf",
        type: "PDF",
        size: "152 KB",
        uploadedDate: "2026-01-10T14:32:00Z",
        uploadedBy: "Sarah Johnson",
      },
      {
        id: 3,
        name: "Medical_History_Summary.docx",
        type: "DOCX",
        size: "89 KB",
        uploadedDate: "2026-01-10T14:35:00Z",
        uploadedBy: "Michael Chen",
      },
    ],
  },
  {
    id: 2,
    status: "Expired",
    startDate: "2023-01-15",
    endDate: "2024-01-14",
    executedDate: "2023-01-10",
    approvedMedications: [1, 2, 3, 4, 5, 6, 7, 8],
    createdBy: "Jennifer Davis",
    createdDate: "2023-01-05",
    lastModifiedBy: "Sarah Johnson",
    lastModifiedDate: "2023-01-08",
    attachedDocuments: [
      {
        id: 4,
        name: "OTC_Consent_2023.pdf",
        type: "PDF",
        size: "198 KB",
        uploadedDate: "2023-01-10T10:15:00Z",
        uploadedBy: "Emily Rodriguez",
      },
    ],
  },
  {
    id: 3,
    status: "Expired",
    startDate: "2022-06-01",
    endDate: "2023-01-14",
    executedDate: "2022-05-28",
    approvedMedications: [1, 2, 3, 6, 7],
    attachedDocuments: [
      {
        id: 5,
        name: "OTC_Consent_2022.pdf",
        type: "PDF",
        size: "210 KB",
        uploadedDate: "2022-05-28T09:00:00Z",
        uploadedBy: "James Patterson",
      },
      {
        id: 6,
        name: "Parent_Acknowledgment.pdf",
        type: "PDF",
        size: "95 KB",
        uploadedDate: "2022-05-28T09:05:00Z",
        uploadedBy: "James Patterson",
      },
    ],
  },
];

// Mock dispensation data
const INITIAL_MOCK_DISPENSATIONS: DispensationRecord[] = [
  {
    id: 1,
    administrationDate: "2024-04-20",
    medications: [
      { medicationId: 1, medicationName: "Acetaminophen (Tylenol)", quantity: 2 },
      { medicationId: 3, medicationName: "Ibuprofen (Advil)", quantity: 1 },
    ],
    administeredBy: "Sarah Johnson, RN",
    notes: "Youth requested for headache relief",
    consentId: 1,
    recordedAt: "2024-04-20T14:30:00Z",
    recordedBy: "Sarah Johnson",
  },
  {
    id: 2,
    administrationDate: "2024-04-18",
    medications: [
      { medicationId: 2, medicationName: "Diphenhydramine (Benadryl)", quantity: 1 },
    ],
    administeredBy: "Michael Chen, RN",
    notes: "Seasonal allergies",
    consentId: 1,
    recordedAt: "2024-04-18T10:15:00Z",
    recordedBy: "Michael Chen",
  },
  {
    id: 3,
    administrationDate: "2024-04-15",
    medications: [
      { medicationId: 9, medicationName: "Antibiotic Ointment (Bacitracin/Neomycin/Polymyxin (Neosporin))", quantity: 1 },
    ],
    administeredBy: "Sarah Johnson, RN",
    notes: "Applied to minor cut on left hand",
    consentId: 1,
    recordedAt: "2024-04-15T16:45:00Z",
    recordedBy: "Sarah Johnson",
  },
  {
    id: 4,
    administrationDate: "2023-08-10",
    medications: [
      { medicationId: 4, medicationName: "Guaifenesin Oral Solution (Cough Medicine (Non-DM only))", quantity: 1 },
      { medicationId: 5, medicationName: "Oral Anesthetic (Cough Drops)", quantity: 3 },
    ],
    administeredBy: "Emily Rodriguez, RN",
    notes: "Mild cold symptoms",
    consentId: 2,
    recordedAt: "2023-08-10T09:20:00Z",
    recordedBy: "Emily Rodriguez",
  },
];

export function StandardOTCView() {
  const [consentHistory, setConsentHistory] = useState<ConsentRecord[]>(INITIAL_MOCK_CONSENTS);
  const [dispensationHistory, setDispensationHistory] = useState<DispensationRecord[]>(INITIAL_MOCK_DISPENSATIONS);
  const [selectedConsentForView, setSelectedConsentForView] = useState<ConsentRecord | null>(null);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<{id: number; name: string; type: string} | null>(null);
  
  // Modal states
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [showDocuSignModal, setShowDocuSignModal] = useState(false);
  const [showManualUploadModal, setShowManualUploadModal] = useState(false);
  const [showDispensationModal, setShowDispensationModal] = useState(false);
  const [showEndRevokeModal, setShowEndRevokeModal] = useState(false);
  const [actionType, setActionType] = useState<"end" | "revoke">("end");
  
  // Temporary state for modal workflows
  const [pendingConsentData, setPendingConsentData] = useState<{
    selectedMedications: number[];
    startDate: string;
    endDate: string;
    replaceConsentId?: number;
  } | null>(null);

  const [selectedConsentToEndRevoke, setSelectedConsentToEndRevoke] = useState<ConsentRecord | null>(null);

  // AC15, AC16: Calculate active consent based on status and dates
  const calculateConsentStatus = (consent: ConsentRecord): ConsentStatus => {
    // Ended early / revoked consents keep that status
    if (consent.endRevoke) {
      return consent.endRevoke.action === "revoke" ? "Revoked" : "Ended";
    }

    // If already marked as Draft or Sent, keep that status
    if (consent.status === "Draft" || consent.status === "Sent") {
      return consent.status;
    }

    // If not executed, it can't be active
    if (consent.status !== "Executed" && consent.status !== "Active" && consent.status !== "Expired") {
      return consent.status;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = parseIsoLocal(consent.startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = parseIsoLocal(consent.endDate);
    end.setHours(23, 59, 59, 999); // AC10: End date is inclusive

    // Check if consent is active based on date range
    if (today >= start && today <= end && consent.executedDate) {
      return "Active";
    } else if (today > end) {
      return "Expired";
    } else {
      return "Executed"; // Executed but not yet active
    }
  };

  // Update consent statuses (AC14, AC16)
  const getConsentWithCalculatedStatus = (consent: ConsentRecord): ConsentRecord => {
    return {
      ...consent,
      status: calculateConsentStatus(consent),
    };
  };

  // Get all consents with calculated statuses
  const consentsWithStatus = consentHistory.map(getConsentWithCalculatedStatus);

  // AC15: Get the active consent (only one can be active at a time)
  const activeConsent = consentsWithStatus.find((c) => c.status === "Active");

  // AC18, AC19, AC20: Determine approval status for each OTC
  const getApprovalStatus = (medicationId: number) => {
    if (!activeConsent) {
      return "not-approved"; // No active consent = all OTCs are not approved
    }
    return activeConsent.approvedMedications.includes(medicationId) ? "approved" : "not-approved";
  };

  // Handle viewing consent document
  const handleViewConsent = (consent: ConsentRecord) => {
    setSelectedConsentForView(consent);
    setShowConsentDialog(true);
  };

  // Handle renewal/copy
  const handleRenewConsent = (consent: ConsentRecord) => {
    // Pre-populate with existing consent data
    const today = new Date();
    const startDate = toLocalIso(today);
    const endDate = new Date(today.setFullYear(today.getFullYear() + 1));
    endDate.setDate(endDate.getDate() - 1);

    setPendingConsentData({
      selectedMedications: consent.approvedMedications,
      startDate,
      endDate: toLocalIso(endDate),
    });
    
    setShowCreationModal(true);
  };

  // Handle clicking on consent record row
  const handleConsentRecordClick = (consent: ConsentRecord) => {
    // In production, this would navigate to consent detail page
    console.log(`Opening consent detail page for ID: ${consent.id}`);
  };

  // AC1: Create new consent
  const handleCreateNewConsent = () => {
    setPendingConsentData(null); // Clear any pending data
    setShowCreationModal(true);
  };

  // AC11: Send via DocuSign
  const handleSendViaDocuSign = (selectedMedications: number[], startDate: string, endDate: string, replaceConsentId?: number) => {
    setPendingConsentData({ selectedMedications, startDate, endDate, replaceConsentId });
    setShowCreationModal(false);
    setShowDocuSignModal(true);
  };

  // Complete DocuSign send
  const handleDocuSignSend = (recipientEmail: string, recipientName: string) => {
    if (!pendingConsentData) return;

    const newConsent: ConsentRecord = {
      id: Date.now(),
      status: "Sent",
      startDate: pendingConsentData.startDate,
      endDate: pendingConsentData.endDate,
      executedDate: null,
      approvedMedications: pendingConsentData.selectedMedications,
      docuSignEnvelopeId: `ENV-${Date.now()}`,
    };

    setConsentHistory((prev) => [newConsent, ...prev]);
    setShowDocuSignModal(false);
    setPendingConsentData(null);
  };

  // AC12: Manual upload
  const handleManualUpload = (selectedMedications: number[], startDate: string, endDate: string, replaceConsentId?: number) => {
    setPendingConsentData({ selectedMedications, startDate, endDate, replaceConsentId });
    setShowCreationModal(false);
    setShowManualUploadModal(true);
  };

  // Update consent end date (for replacement logic)
  const handleUpdateConsentEndDate = (consentId: number, newEndDate: string) => {
    setConsentHistory((prev) =>
      prev.map((consent) =>
        consent.id === consentId
          ? { ...consent, endDate: newEndDate }
          : consent
      )
    );
  };

  // AC13: Complete manual upload with confirmation
  const handleManualUploadComplete = (data: {
    uploadedFile: File;
    confirmedMedications: number[];
    executedDate: string;
    startDate: string;
    endDate: string;
  }) => {
    const newConsent: ConsentRecord = {
      id: Date.now(),
      status: "Executed",
      startDate: data.startDate,
      endDate: data.endDate,
      executedDate: data.executedDate,
      approvedMedications: data.confirmedMedications,
      uploadedDocument: data.uploadedFile.name,
    };

    setConsentHistory((prev) => [newConsent, ...prev]);
    setShowManualUploadModal(false);
    setPendingConsentData(null);
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return formatMdy(dateString);
  };

  // Get status badge styling
  const getStatusBadgeStyle = (status: ConsentStatus) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-300";
      case "Executed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Sent":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "Draft":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "Expired":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "Ended":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Revoked":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  // Handle recording a new dispensation
  const handleRecordDispensation = (data: {
    administrationDate: string;
    medications: Array<{ medicationId: number; quantity: number }>;
    administeredBy: string;
    notes: string;
    consentId: number | null;
  }) => {
    // Convert medication IDs to full medication details
    const medicationsWithNames = data.medications.map((med) => {
      const medication = STANDARD_OTC_MEDICATIONS.find((m) => m.id === med.medicationId);
      return {
        medicationId: med.medicationId,
        medicationName: medication?.name || "Unknown",
        quantity: med.quantity,
      };
    });

    const newDispensation: DispensationRecord = {
      id: Date.now(),
      administrationDate: data.administrationDate,
      medications: medicationsWithNames,
      administeredBy: data.administeredBy,
      notes: data.notes,
      consentId: data.consentId,
      recordedAt: new Date().toISOString(),
      recordedBy: data.administeredBy, // In production, this would be the logged-in user
    };

    setDispensationHistory((prev) => [newDispensation, ...prev]);
    setShowDispensationModal(false);
  };

  // Handle end/revoke consent
  const handleEndRevokeConsent = (endDate: string, comment: string, action: "end" | "revoke") => {
    const target = selectedConsentToEndRevoke;
    if (!target) return;
    // Guard against a repeated confirm once the record already carries the action
    if (consentHistory.find((c) => c.id === target.id)?.endRevoke) return;

    const by = getDemoUserName();
    const at = new Date().toISOString();
    setConsentHistory((prev) =>
      prev.map((consent) =>
        consent.id === target.id
          ? {
              ...consent,
              endDate,
              endRevoke: { action, comment, by, at },
              lastModifiedBy: by,
              lastModifiedDate: toLocalIso(new Date()),
            }
          : consent
      )
    );
    setShowEndRevokeModal(false);
    setSelectedConsentToEndRevoke(null);
    toast.success(action === "revoke" ? "Consent revoked" : "Consent ended", {
      description: `Effective ${formatMdy(endDate)}. Recorded by ${by}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Section: OTC Authorizations */}
      <div>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[16px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              OTC Authorizations
            </h2>
            <p className="text-[13px] mt-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
              Program-supplied over the counter medications approved based on active consent.
            </p>
          </div>
          <Button
            onClick={handleCreateNewConsent}
            className="gap-2 flex-shrink-0"
            style={{ backgroundColor: "#145F33", color: "white" }}
          >
            <Plus className="h-4 w-4" />
            Create New OTC Consent
          </Button>
        </div>

        {/* OTC Medications Grid */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor: "var(--slds-g-color-background-base)",
          }}
        >
          {/* No Active Consent Warning (AC20) */}
          {!activeConsent && (
            <div
              className="px-5 py-4"
              style={{
                backgroundColor: "#FEF3C7",
                borderBottom: "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-[14px] font-semibold text-amber-900">No Active Consent</h3>
                  <p className="text-[13px] text-amber-800 mt-1">
                    There is no active Standard OTC consent on file. All OTC medications are currently unavailable.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Medications Table */}
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: "white",
                    borderBottom: "2px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <th
                    className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--slds-g-color-text-weak)" }}
                  >
                    Medication Name
                  </th>
                  <th
                    className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--slds-g-color-text-weak)" }}
                  >
                    Category
                  </th>
                  <th
                    className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--slds-g-color-text-weak)", minWidth: "140px" }}
                  >
                    Authorization Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {STANDARD_OTC_MEDICATIONS.map((medication) => {
                  const status = getApprovalStatus(medication.id);
                  return (
                    <tr
                      key={medication.id}
                      className="hover:bg-gray-50/80 transition-colors"
                      style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
                    >
                      <td className="px-5 py-2.5">
                        <div className="text-[13px] font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                          {medication.name}
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
                          {medication.category}
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-center">
                        {/* AC18: Approved OTCs are available */}
                        {status === "approved" && (
                          <Badge
                            className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 border-green-300"
                            style={{ borderRadius: "12px", padding: "4px 12px" }}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approved
                          </Badge>
                        )}
                        {status === "not-approved" && (
                          <Badge
                            className="inline-flex items-center gap-1.5 bg-red-100 text-red-800 border-red-300"
                            style={{ borderRadius: "12px", padding: "4px 12px" }}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Not Approved
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Section: Standard OTC Consent History List */}
      <div>
        <div className="mb-4">
          <h2 className="text-[16px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
            Standard OTC Consent History
          </h2>
          <p className="text-[13px] mt-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
            Complete history of all Standard OTC consent records
          </p>
        </div>

        {/* Consent History Table */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor: "var(--slds-g-color-background-base)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: "white",
                    borderBottom: "2px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <th
                    className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--slds-g-color-text-weak)", minWidth: "100px" }}
                  >
                    Status
                  </th>
                  <th
                    className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--slds-g-color-text-weak)", minWidth: "140px" }}
                  >
                    Executed Date
                  </th>
                  <th
                    className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--slds-g-color-text-weak)", minWidth: "120px" }}
                  >
                    Start Date
                  </th>
                  <th
                    className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--slds-g-color-text-weak)", minWidth: "120px" }}
                  >
                    End Date (Inclusive)
                  </th>
                  <th
                    className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--slds-g-color-text-weak)", minWidth: "220px" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {consentsWithStatus.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center">
                      <div style={{ color: "var(--slds-g-color-text-weak)" }}>
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p className="text-[13px]">No consent records found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  consentsWithStatus.map((consent) => (
                    <tr
                      key={consent.id}
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                      style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
                      onClick={() => handleConsentRecordClick(consent)}
                    >
                      <td className="px-5 py-4 text-center">
                        <Badge
                          className={getStatusBadgeStyle(consent.status)}
                          style={{ borderRadius: "12px", padding: "4px 12px" }}
                        >
                          {consent.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
                          {formatDate(consent.executedDate)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
                          {formatDate(consent.startDate)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
                          {formatDate(consent.endDate)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <TooltipProvider>
                          <div className="flex items-center justify-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  aria-label="View consent record details"
                                  className="p-1 transition-colors hover:bg-gray-100 rounded"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewConsent(consent);
                                  }}
                                >
                                  <Eye className="h-4 w-4" style={{ color: "var(--slds-g-color-text-default)" }} />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Record Details</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  aria-label="Copy or renew consent"
                                  className="p-1 transition-colors hover:bg-gray-100 rounded"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRenewConsent(consent);
                                  }}
                                >
                                  <Copy className="h-4 w-4" style={{ color: "#145F33" }} />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy/Renew Consent</p>
                              </TooltipContent>
                            </Tooltip>

                            {(consent.status === "Active" || consent.status === "Executed") ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    aria-label="End or revoke consent"
                                    className="p-1 transition-colors hover:bg-gray-100 rounded"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActionType("end");
                                      setSelectedConsentToEndRevoke(consent);
                                      setShowEndRevokeModal(true);
                                    }}
                                  >
                                    <XCircle className="h-4 w-4" style={{ color: "#DC2626" }} />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>End/Revoke Consent</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <div className="p-1" style={{ width: "24px", height: "24px" }} />
                            )}
                          </div>
                        </TooltipProvider>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Note */}
        <div
          className="mt-4 p-4 rounded-lg"
          style={{
            backgroundColor: "#F0F9FF",
            border: "1px solid #BAE6FD",
          }}
        >
          <p className="text-[12px]" style={{ color: "#0C4A6E" }}>
            <strong>Note:</strong> Only one consent can be active at a time. All consent records remain accessible and
            cannot be deleted. Click on any row to view full consent details.
          </p>
        </div>
      </div>

      {/* Consent Record Viewer Dialog - Read Only */}
      <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: "var(--slds-g-color-text-default)" }}>
              Standard OTC Consent Record (Read-Only)
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Review complete consent information including dates, status, approved medications, and audit history
            </DialogDescription>
          </DialogHeader>
          {selectedConsentForView && !viewingDocument && (
            <div className="space-y-4">
              {/* Consent Details */}
              <div>
                <h3 className="text-[14px] font-semibold mb-3" style={{ color: "var(--slds-g-color-text-default)" }}>
                  Consent Details
                </h3>
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: "var(--slds-g-color-background-alt)",
                    border: "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
                        Status
                      </div>
                      <Badge
                        className={getStatusBadgeStyle(getConsentWithCalculatedStatus(selectedConsentForView).status)}
                        style={{ borderRadius: "12px", padding: "4px 12px" }}
                      >
                        {getConsentWithCalculatedStatus(selectedConsentForView).status}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
                        Approved Medications
                      </div>
                      <div className="text-[13px] font-semibold" style={{ color: "#145F33" }}>
                        {selectedConsentForView.approvedMedications.length} of {STANDARD_OTC_MEDICATIONS.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
                        Start Date
                      </div>
                      <div className="text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
                        {formatDate(selectedConsentForView.startDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
                        End Date
                      </div>
                      <div className="text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
                        {formatDate(selectedConsentForView.endDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
                        Executed Date
                      </div>
                      <div className="text-[13px]" style={{ color: selectedConsentForView.executedDate ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)" }}>
                        {selectedConsentForView.executedDate ? formatDate(selectedConsentForView.executedDate) : '—'}
                      </div>
                    </div>
                    {selectedConsentForView.endRevoke && (
                      <>
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            {selectedConsentForView.endRevoke.action === "revoke" ? "Revoked By" : "Ended By"}
                          </div>
                          <div className="text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
                            {selectedConsentForView.endRevoke.by} on {formatMdy(toLocalIso(new Date(selectedConsentForView.endRevoke.at)))}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            {selectedConsentForView.endRevoke.action === "revoke" ? "Revocation Comment" : "End Comment"}
                          </div>
                          <div className="text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
                            {selectedConsentForView.endRevoke.comment || "—"}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Audit Information - Always Visible */}
              <div>
                <h3 className="text-[14px] font-semibold mb-3" style={{ color: "var(--slds-g-color-text-default)" }}>
                  Audit Information
                </h3>
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: "var(--slds-g-color-background-alt)",
                    border: "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
                        Created By
                      </div>
                      <div className="text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
                        {selectedConsentForView.createdBy}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
                        Created Date
                      </div>
                      <div className="text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
                        {formatDate(selectedConsentForView.createdDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
                        Last Modified By
                      </div>
                      <div className="text-[13px]" style={{ color: selectedConsentForView.lastModifiedBy ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)" }}>
                        {selectedConsentForView.lastModifiedBy || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
                        Last Modified Date
                      </div>
                      <div className="text-[13px]" style={{ color: selectedConsentForView.lastModifiedDate ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)" }}>
                        {selectedConsentForView.lastModifiedDate ? formatDate(selectedConsentForView.lastModifiedDate) : '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approved Medications List */}
              <div>
                <h3 className="text-[14px] font-semibold mb-3" style={{ color: "var(--slds-g-color-text-default)" }}>
                  Approved Medications
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {STANDARD_OTC_MEDICATIONS.map((med) => {
                    const isApproved = selectedConsentForView.approvedMedications.includes(med.id);
                    return (
                      <div
                        key={med.id}
                        className="flex items-center gap-3 p-3 rounded-md"
                        style={{
                          backgroundColor: isApproved ? "#e8f5e9" : "var(--slds-g-color-background-alt)",
                          border: `1px solid ${isApproved ? "#c8e6c9" : "var(--slds-g-color-border-base-1)"}`,
                        }}
                      >
                        {isApproved ? (
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: "#145F33" }} />
                        ) : (
                          <XCircle className="h-4 w-4 flex-shrink-0" style={{ color: "var(--slds-g-color-text-weak)" }} />
                        )}
                        <div className="flex-1">
                          <div className="text-[13px] font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                            {med.name}
                          </div>
                          <div className="text-[11px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            {med.category}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Attached Documents Section - Always Visible */}
              <div>
                <h3 className="text-[14px] font-semibold mb-3" style={{ color: "var(--slds-g-color-text-default)" }}>
                  Attached Documents
                </h3>
                {selectedConsentForView.attachedDocuments && selectedConsentForView.attachedDocuments.length > 0 ? (
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{
                      border: "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor: "var(--slds-g-color-background-base)",
                    }}
                  >
                    {selectedConsentForView.attachedDocuments.map((doc, index) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                        style={{
                          borderBottom: index < selectedConsentForView.attachedDocuments!.length - 1 ? "1px solid var(--slds-g-color-border-base-1)" : "none",
                        }}
                      >
                        <div
                          className="flex items-center justify-center flex-shrink-0"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            backgroundColor: "#e8f5e9",
                          }}
                        >
                          <FileText className="h-5 w-5" style={{ color: "#145F33" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium truncate" style={{ color: "var(--slds-g-color-text-default)" }}>
                            {doc.name}
                          </div>
                          <div className="text-[11px] mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            {doc.type} • {doc.size} • Uploaded by {doc.uploadedBy} on {formatDate(doc.uploadedDate.split("T")[0])}
                          </div>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="flex items-center justify-center flex-shrink-0 h-8 w-8 rounded-md transition-colors hover:bg-gray-100"
                                style={{
                                  border: "1px solid #145F33",
                                  color: "#145F33",
                                }}
                                onClick={() => {
                                  // Open document in new tab without navigating away from modal
                                  window.open(`/documents/${doc.id}`, '_blank');
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Document</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-center py-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
                    No documents attached
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Document Viewer - Inline */}
          {viewingDocument && (
            <div className="space-y-4">
              {/* Back Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingDocument(null)}
                className="rounded-full"
                style={{
                  border: "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                Back to Consent Details
              </Button>

              {/* Document Preview */}
              <div>
                <h3 className="text-[14px] font-semibold mb-3" style={{ color: "var(--slds-g-color-text-default)" }}>
                  {viewingDocument.name}
                </h3>
                <div
                  className="rounded-lg overflow-hidden"
                  style={{
                    border: "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor: "var(--slds-g-color-background-alt)",
                    minHeight: "500px",
                  }}
                >
                  {viewingDocument.type === "PDF" ? (
                    <iframe
                      src={`/documents/${viewingDocument.id}`}
                      className="w-full h-[500px]"
                      title={viewingDocument.name}
                      style={{ border: "none" }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[500px]">
                      <div className="text-center">
                        <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: "#145F33" }} />
                        <p className="text-[13px] mb-2" style={{ color: "var(--slds-g-color-text-default)" }}>
                          {viewingDocument.name}
                        </p>
                        <p className="text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                          Preview not available for this file type
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 rounded-full"
                          onClick={() => window.open(`/documents/${viewingDocument.id}`, '_blank')}
                          style={{
                            border: "1px solid #145F33",
                            color: "#145F33",
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download File
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* OTC Consent Creation Modal (AC1) */}
      <OTCConsentCreationModal
        open={showCreationModal}
        onOpenChange={setShowCreationModal}
        medications={STANDARD_OTC_MEDICATIONS}
        existingConsents={consentsWithStatus}
        onCreateConsent={() => {}}
        onSendViaDocuSign={handleSendViaDocuSign}
        onManualUpload={handleManualUpload}
        onUpdateConsentEndDate={handleUpdateConsentEndDate}
      />

      {/* DocuSign Modal (AC11) */}
      {pendingConsentData && (
        <DocuSignConsentModal
          open={showDocuSignModal}
          onOpenChange={setShowDocuSignModal}
          selectedMedications={pendingConsentData.selectedMedications}
          startDate={pendingConsentData.startDate}
          endDate={pendingConsentData.endDate}
          onSend={handleDocuSignSend}
        />
      )}

      {/* Manual Upload Modal (AC12, AC13) */}
      {pendingConsentData && (
        <ManualUploadConsentModal
          open={showManualUploadModal}
          onOpenChange={setShowManualUploadModal}
          medications={STANDARD_OTC_MEDICATIONS}
          preselectedMedications={pendingConsentData.selectedMedications}
          initialStartDate={pendingConsentData.startDate}
          initialEndDate={pendingConsentData.endDate}
          onComplete={handleManualUploadComplete}
        />
      )}

      {/* OTC Dispensation Modal (AC13) */}
      <OTCDispensationModal
        open={showDispensationModal}
        onOpenChange={setShowDispensationModal}
        medications={STANDARD_OTC_MEDICATIONS}
        consents={consentsWithStatus}
        onRecordDispensation={handleRecordDispensation}
      />

      {/* End/Revoke Consent Modal */}
      <EndRevokeConsentModal
        open={showEndRevokeModal}
        onOpenChange={setShowEndRevokeModal}
        consent={selectedConsentToEndRevoke}
        onConfirm={handleEndRevokeConsent}
        actionType={actionType}
      />
    </div>
  );
}