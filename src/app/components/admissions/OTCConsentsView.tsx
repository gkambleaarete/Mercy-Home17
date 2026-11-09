import { CreateOTCConsentModal } from "./CreateOTCConsentModal";
import { OTCConsentDetailsModal } from "./OTCConsentDetailsModal";
import { RenewOTCConsentModal } from "./RenewOTCConsentModal";
import { EndOTCConsentModal } from "./EndOTCConsentModal";
import { useState } from "react";
import { Plus, FileText, Calendar, CheckCircle2, Clock, XCircle, AlertCircle, Eye, Upload, RefreshCw, Filter, Download, ExternalLink, History, Archive, Copy, Ban } from "@/app/lib/lucide-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMdy, localTodayIso, parseIsoLocal } from "../../lib/dateFormat";
import { getDemoUserName } from "../../lib/demoIdentity";

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

// OTC Consent Record Type
export interface OTCConsent {
  id: string;
  youthName: string;
  startDate: string;
  endDate: string;
  executedDate: string;
  status: "Draft" | "Sent" | "Executed" | "Active" | "Expired";
  executionMethod: "DocuSign" | "Manual Upload";
  documentUrl?: string;
  selectedOTCs: string[];
  approvedMedicationIds: number[]; // IDs from STANDARD_OTC_MEDICATIONS
  createdBy: string;
  createdDate: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
  renewalComment?: string;
}

// Mock data - In production, this would come from the backend
const MOCK_OTC_CONSENTS: OTCConsent[] = [
  {
    id: "OTC-001",
    youthName: "Fozzie Bear",
    startDate: "2026-01-15",
    endDate: "2027-01-14",
    executedDate: "2026-01-15",
    status: "Active",
    executionMethod: "DocuSign",
    selectedOTCs: ["Acetaminophen 325mg", "Ibuprofen 200mg", "Diphenhydramine 25mg", "Cetirizine 10mg"],
    approvedMedicationIds: [1, 2, 3, 6, 7, 9, 10],
    createdBy: "Sarah Johnson",
    createdDate: "2026-01-10",
    lastModifiedBy: "Sarah Johnson",
    lastModifiedDate: "2026-01-15"
  },
  {
    id: "OTC-002",
    youthName: "Fozzie Bear",
    startDate: "2025-01-15",
    endDate: "2026-01-14",
    executedDate: "2025-01-15",
    status: "Expired",
    executionMethod: "Manual Upload",
    documentUrl: "/documents/otc-consent-2025.pdf",
    selectedOTCs: ["Acetaminophen 325mg", "Ibuprofen 200mg"],
    approvedMedicationIds: [1, 2, 3, 4, 5],
    createdBy: "Michael Chen",
    createdDate: "2025-01-10",
    lastModifiedBy: "Michael Chen",
    lastModifiedDate: "2025-01-15"
  }
];

export function OTCConsentsView({ youthName }: { youthName?: string } = {}) {
  const [consents, setConsents] = useState<OTCConsent[]>(MOCK_OTC_CONSENTS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingConsent, setViewingConsent] = useState<OTCConsent | null>(null);
  const [renewingConsent, setRenewingConsent] = useState<OTCConsent | null>(null);
  const [endingConsent, setEndingConsent] = useState<OTCConsent | null>(null);

  // Calculate system status based on dates
  const calculateConsentStatus = (consent: OTCConsent): "Active" | "Expired" | typeof consent.status => {
    if (consent.status === "Draft" || consent.status === "Sent") return consent.status;
    if (consent.status !== "Executed" && consent.status !== "Active" && consent.status !== "Expired") {
      return consent.status;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = parseIsoLocal(consent.startDate);
    start.setHours(0, 0, 0, 0);
    const end = parseIsoLocal(consent.endDate);
    end.setHours(23, 59, 59, 999);

    if (today >= start && today <= end && consent.executedDate) {
      return "Active";
    } else if (today > end) {
      return "Expired";
    } else {
      return "Executed";
    }
  };

  // Get all consents with calculated statuses
  const consentsWithStatus = consents.map(c => ({
    ...c,
    status: calculateConsentStatus(c)
  }));

  // Get the active consent (only one can be active at a time)
  const activeConsent = consentsWithStatus.find((c) => c.status === "Active");

  // Determine approval status for each OTC
  const getApprovalStatus = (medicationId: number) => {
    if (!activeConsent) {
      return "not-approved"; // No active consent = all OTCs are not approved
    }
    return activeConsent.approvedMedicationIds.includes(medicationId) ? "approved" : "not-approved";
  };

  const getStatusBadgeStyle = (status: string) => {
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
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return formatMdy(dateString);
  };

  const handleConsentCreated = (newConsent: OTCConsent) => {
    setConsents([newConsent, ...consents]);
  };

  const handleConsentRenewed = (newConsent: OTCConsent, updatedPreviousConsent: OTCConsent) => {
    setConsents(prevConsents => 
      [newConsent, ...prevConsents.map(c => 
        c.id === updatedPreviousConsent.id ? updatedPreviousConsent : c
      )]
    );
  };

  const handleRenewConsent = (consent: OTCConsent) => {
    setRenewingConsent(consent);
  };

  const handleViewConsent = (consent: OTCConsent) => {
    setViewingConsent(consent);
  };

  const handleConsentRecordClick = (consent: OTCConsent) => {
    console.log(`Opening consent detail page for ID: ${consent.id}`);
  };

  const handleEndConsent = (consent: OTCConsent) => {
    // This would open a modal to confirm ending the consent early
    setEndingConsent(consent);
  };

  const confirmEndConsent = (consentId: string, reason: string) => {
    // Update the consent to set endDate to today and status to Expired
    setConsents(prevConsents => 
      prevConsents.map(c => 
        c.id === consentId 
          ? { 
              ...c, 
              endDate: localTodayIso(),
              status: "Expired" as const,
              lastModifiedBy: getDemoUserName(),
              lastModifiedDate: localTodayIso(),
              renewalComment: reason
            } 
          : c
      )
    );
    setEndingConsent(null);
  };

  return (
    <div className="space-y-6">
      {/* Create New Consent Button */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2"
          style={{ backgroundColor: "#145F33", color: "white" }}
        >
          <Plus className="h-4 w-4" />
          Create New OTC Consent
        </Button>
      </div>

      {/* Top Section: OTC Authorizations */}
      <div>
        <div className="mb-4">
          <h2 className="text-[16px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
            OTC Authorizations
          </h2>
          <p className="text-[13px] mt-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
            Current authorization status for standard over-the-counter medications
          </p>
        </div>

        {/* OTC Medications Grid */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor: "var(--slds-g-color-background-base)",
          }}
        >
          {/* No Active Consent Warning */}
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
                      <td className="px-5 py-4">
                        <div className="text-[13px] font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                          {medication.name}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
                          {medication.category}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
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
                    style={{ color: "var(--slds-g-color-text-weak)", minWidth: "120px" }}
                  >
                    Start Date
                  </th>
                  <th
                    className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--slds-g-color-text-weak)", minWidth: "120px" }}
                  >
                    End Date
                  </th>
                  <th
                    className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--slds-g-color-text-weak)", minWidth: "180px" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {consentsWithStatus.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center">
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
                          className={getStatusBadgeStyle(consent.status as string)}
                          style={{ borderRadius: "12px", padding: "4px 12px" }}
                        >
                          {consent.status}
                        </Badge>
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
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-[12px] rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewConsent(consent);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            View Document
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-[12px] rounded-md"
                            style={{ borderColor: "#145F33", color: "#145F33" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenewConsent(consent);
                            }}
                          >
                            <Copy className="h-3.5 w-3.5 mr-1.5" />
                            Copy
                          </Button>
                          {consent.status === "Active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-[12px] rounded-md"
                              style={{ borderColor: "#DC2626", color: "#DC2626" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEndConsent(consent);
                              }}
                            >
                              <Ban className="h-3.5 w-3.5 mr-1.5" />
                              End
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

      {/* Create OTC Consent Modal */}
      <CreateOTCConsentModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onConsentCreated={handleConsentCreated}
        youthName={youthName ?? consents[0]?.youthName}
      />

      {/* View OTC Consent Details Modal */}
      {viewingConsent && (
        <OTCConsentDetailsModal
          consent={viewingConsent}
          open={!!viewingConsent}
          onOpenChange={(open) => !open && setViewingConsent(null)}
        />
      )}

      {/* Renew OTC Consent Modal */}
      {renewingConsent && (
        <RenewOTCConsentModal
          consent={renewingConsent}
          open={!!renewingConsent}
          onOpenChange={(open) => !open && setRenewingConsent(null)}
          onConsentRenewed={handleConsentRenewed}
        />
      )}

      {/* End OTC Consent Modal */}
      <EndOTCConsentModal
        consent={endingConsent}
        open={!!endingConsent}
        onOpenChange={(open) => !open && setEndingConsent(null)}
        onConsentEnded={confirmEndConsent}
      />
    </div>
  );
}