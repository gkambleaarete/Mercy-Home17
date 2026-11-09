import { isValidIsoDate } from "../../lib/isoDateCheck";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { AlertCircle, Send, Upload, AlertTriangle } from "@/app/lib/lucide-icons";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy, toLocalIso, parseIsoLocal, addDaysIso } from "../../lib/dateFormat";

interface OTCMedication {
  id: number;
  name: string;
  category: string;
}

interface ConsentRecord {
  id: number;
  status: "Draft" | "Sent" | "Executed" | "Active" | "Expired" | "Ended" | "Revoked";
  startDate: string;
  endDate: string;
  executedDate: string | null;
  approvedMedications: number[];
}

interface OTCConsentCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medications: OTCMedication[];
  existingConsents: ConsentRecord[];
  onCreateConsent: (consent: Partial<ConsentRecord>) => void;
  onSendViaDocuSign: (selectedMeds: number[], startDate: string, endDate: string, replaceConsentId?: number) => void;
  onManualUpload: (selectedMeds: number[], startDate: string, endDate: string, replaceConsentId?: number) => void;
  onUpdateConsentEndDate?: (consentId: number, newEndDate: string) => void;
}

export function OTCConsentCreationModal({
  open,
  onOpenChange,
  medications,
  existingConsents,
  onCreateConsent,
  onSendViaDocuSign,
  onManualUpload,
  onUpdateConsentEndDate,
}: OTCConsentCreationModalProps) {
  const [selectedMedications, setSelectedMedications] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return toLocalIso(today);
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    const oneYearMinusDay = new Date(today);
    oneYearMinusDay.setFullYear(oneYearMinusDay.getFullYear() + 1);
    oneYearMinusDay.setDate(oneYearMinusDay.getDate() - 1);
    return toLocalIso(oneYearMinusDay);
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeConsentToReplace, setActiveConsentToReplace] = useState<ConsentRecord | null>(null);
  const [pendingAction, setPendingAction] = useState<"docusign" | "manual" | null>(null);

  // AC9: Auto-calculate End Date when Start Date changes
  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate);
    
    if (!isValidIsoDate(newStartDate)) return;
    const calculatedEnd = parseIsoLocal(newStartDate);
    calculatedEnd.setFullYear(calculatedEnd.getFullYear() + 1);
    calculatedEnd.setDate(calculatedEnd.getDate() - 1);
    
    setEndDate(toLocalIso(calculatedEnd));
    setValidationError(null);
  };

  // Find active consent that would overlap
  const findActiveConsentOverlap = (start: string, end: string): ConsentRecord | null => {
    const newStart = parseIsoLocal(start);
    const newEnd = parseIsoLocal(end);

    const activeConsent = existingConsents.find((consent) => {
      // Only check Active consents
      if (consent.status !== "Active") return false;

      const existingStart = parseIsoLocal(consent.startDate);
      const existingEnd = parseIsoLocal(consent.endDate);

      // Check if ranges overlap
      return (
        (newStart >= existingStart && newStart <= existingEnd) ||
        (newEnd >= existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });

    return activeConsent || null;
  };

  // Check for overlapping consent date ranges (non-active consents)
  const checkForNonActiveOverlap = (start: string, end: string): boolean => {
    const newStart = parseIsoLocal(start);
    const newEnd = parseIsoLocal(end);

    return existingConsents.some((consent) => {
      // Skip expired consents and active consents (handled separately)
      if (consent.status === "Expired" || consent.status === "Active" || consent.status === "Ended" || consent.status === "Revoked") return false;

      const existingStart = parseIsoLocal(consent.startDate);
      const existingEnd = parseIsoLocal(consent.endDate);

      // Check if ranges overlap
      return (
        (newStart >= existingStart && newStart <= existingEnd) ||
        (newEnd >= existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
  };

  // Toggle medication selection (AC3, AC4, AC5)
  const toggleMedication = (medicationId: number) => {
    setSelectedMedications((prev) =>
      prev.includes(medicationId)
        ? prev.filter((id) => id !== medicationId)
        : [...prev, medicationId]
    );
  };

  // Select/Deselect All
  const toggleSelectAll = () => {
    if (selectedMedications.length === medications.length) {
      setSelectedMedications([]);
    } else {
      setSelectedMedications(medications.map((m) => m.id));
    }
  };

  // AC11: Send via DocuSign
  const handleSendViaDocuSign = () => {
    // Validate dates
    if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate)) {
      setValidationError("Enter a valid Start Date and End Date (MM/DD/YYYY).");
      return;
    }
    if (parseIsoLocal(endDate) < parseIsoLocal(startDate)) {
      setValidationError("End Date must be on or after Start Date.");
      return;
    }

    // Check for non-active overlaps
    if (checkForNonActiveOverlap(startDate, endDate)) {
      setValidationError("The consent date range overlaps with an existing consent (Draft, Sent, or Executed). Please adjust the dates.");
      return;
    }

    // Check for active consent overlap
    const activeOverlap = findActiveConsentOverlap(startDate, endDate);
    if (activeOverlap) {
      setActiveConsentToReplace(activeOverlap);
      setPendingAction("docusign");
      setShowConfirmation(true);
      return;
    }

    // No overlap, proceed
    onSendViaDocuSign(selectedMedications, startDate, endDate);
    resetAndClose();
  };

  // AC12: Manual Upload
  const handleManualUpload = () => {
    // Validate dates
    if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate)) {
      setValidationError("Enter a valid Start Date and End Date (MM/DD/YYYY).");
      return;
    }
    if (parseIsoLocal(endDate) < parseIsoLocal(startDate)) {
      setValidationError("End Date must be on or after Start Date.");
      return;
    }

    // Check for non-active overlaps
    if (checkForNonActiveOverlap(startDate, endDate)) {
      setValidationError("The consent date range overlaps with an existing consent (Draft, Sent, or Executed). Please adjust the dates.");
      return;
    }

    // Check for active consent overlap
    const activeOverlap = findActiveConsentOverlap(startDate, endDate);
    if (activeOverlap) {
      setActiveConsentToReplace(activeOverlap);
      setPendingAction("manual");
      setShowConfirmation(true);
      return;
    }

    // No overlap, proceed
    onManualUpload(selectedMedications, startDate, endDate);
    resetAndClose();
  };

  // Handle confirmation to replace active consent
  const handleConfirmReplace = () => {
    if (!activeConsentToReplace) return;

    // Calculate the new end date for the active consent (day before new start date)
    const newConsentStart = parseIsoLocal(startDate);
    const updatedEndDate = new Date(newConsentStart);
    updatedEndDate.setDate(updatedEndDate.getDate() - 1);
    const updatedEndDateString = toLocalIso(updatedEndDate);

    // Update the previous consent's end date
    if (onUpdateConsentEndDate) {
      onUpdateConsentEndDate(activeConsentToReplace.id, updatedEndDateString);
    }

    // Proceed with creating the new consent
    if (pendingAction === "docusign") {
      onSendViaDocuSign(selectedMedications, startDate, endDate, activeConsentToReplace.id);
    } else if (pendingAction === "manual") {
      onManualUpload(selectedMedications, startDate, endDate, activeConsentToReplace.id);
    }

    // Reset and close
    setShowConfirmation(false);
    setActiveConsentToReplace(null);
    setPendingAction(null);
    resetAndClose();
  };

  // Handle cancel confirmation
  const handleCancelReplace = () => {
    setShowConfirmation(false);
    setActiveConsentToReplace(null);
    setPendingAction(null);
  };

  const resetAndClose = () => {
    setSelectedMedications([]);
    const today = new Date();
    setStartDate(toLocalIso(today));
    const oneYearMinusDay = new Date(today);
    oneYearMinusDay.setFullYear(oneYearMinusDay.getFullYear() + 1);
    oneYearMinusDay.setDate(oneYearMinusDay.getDate() - 1);
    setEndDate(toLocalIso(oneYearMinusDay));
    setValidationError(null);
    onOpenChange(false);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return formatMdy(parseIsoLocal(dateString));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>Create New OTC Consent</DialogTitle>
            <DialogDescription>
              Select approved OTC medications and set the consent period. The consent can be sent via DocuSign or manually uploaded after execution.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Validation Error */}
            {validationError && (
              <div
                className="p-4 rounded-lg flex items-start gap-3"
                style={{
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECACA",
                }}
              >
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[14px] font-semibold text-red-900">Validation Error</h4>
                  <p className="text-[13px] text-red-800 mt-1">{validationError}</p>
                </div>
              </div>
            )}

            {/* Consent Period */}
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "#F8F9FA",
                border: "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <h3 className="text-[14px] font-semibold mb-4" style={{ color: "var(--slds-g-color-text-default)" }}>
                Consent Period
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-[13px] font-medium mb-1.5 block">
                    Start Date <span className="text-red-600">*</span>
                  </Label>
                  <DateInput
                    id="startDate"
value={isoToMdy(startDate)}
                    onChange={(v) => ((e) => handleStartDateChange(e.target.value))({ target: { value: mdyToIso(v) } })}
                    className="w-full"
                  />
                  <p className="text-[11px] mt-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
                    Based on execution date (can be adjusted for manual uploads)
                  </p>
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-[13px] font-medium mb-1.5 block">
                    End Date (Inclusive) <span className="text-red-600">*</span>
                  </Label>
                  <DateInput
                    id="endDate"
value={isoToMdy(endDate)}
                    onChange={(v) => ((e) => setEndDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                    className="w-full"
                  />
                  <p className="text-[11px] mt-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
                    Defaults to 1 year minus 1 day from Start Date
                  </p>
                </div>
              </div>
            </div>

            {/* AC2: OTC Medication Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[14px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
                  Approved OTC Medications
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="text-[12px]"
                >
                  {selectedMedications.length === medications.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <p className="text-[13px] mb-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
                Select the OTC medications that are approved for this consent. Selected medications will be marked as approved; unselected medications will be marked as not approved.
              </p>

              {/* Medications List */}
              <div
                className="rounded-lg border overflow-hidden"
                style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
              >
                <div className="max-h-[300px] overflow-y-auto">
                  {medications.map((medication) => {
                    const isSelected = selectedMedications.includes(medication.id);
                    return (
                      <div
                        key={medication.id}
                        className="flex items-center gap-3 p-4 hover:bg-gray-50/80 transition-colors border-b"
                        style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
                      >
                        <Checkbox
                          id={`med-${medication.id}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleMedication(medication.id)}
                        />
                        <label
                          htmlFor={`med-${medication.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="text-[13px] font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                            {medication.name}
                          </div>
                          <div className="text-[11px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            {medication.category}
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-2 text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                {selectedMedications.length} of {medications.length} medications selected
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className="pt-4 border-t flex gap-3 justify-end flex-wrap"
              style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={resetAndClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleManualUpload}
                className="gap-2"
                style={{ borderColor: "#145F33", color: "#145F33" }}
              >
                <Upload className="h-4 w-4" />
                Manual Upload
              </Button>
              <div className="flex flex-col items-center gap-1">
                <Button
                  type="button"
                  onClick={handleSendViaDocuSign}
                  className="gap-2 whitespace-nowrap"
                  style={{ backgroundColor: "#145F33", color: "white" }}
                >
                  <Send className="h-4 w-4" />
                  Send via DocuSign
                </Button>
                <span
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: "#FEF3C7", color: "#78350F", border: "1px solid #FDE68A" }}
                >
                  FUTURE STATE
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Replacing Active Consent */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#FEF3C7" }}
              >
                <AlertTriangle className="h-5 w-5" style={{ color: "#D97706" }} />
              </div>
              <DialogTitle>Replace Active Consent?</DialogTitle>
            </div>
            <DialogDescription>
              An active OTC consent already exists for this period.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {activeConsentToReplace && (
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: "#F9FAFB",
                  border: "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <p className="text-[13px] mb-2" style={{ color: "var(--slds-g-color-text-default)" }}>
                  <strong>Current Active Consent:</strong>
                </p>
                <div className="space-y-1 text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  <p>Start Date: {formatDate(activeConsentToReplace.startDate)}</p>
                  <p>End Date: {formatDate(activeConsentToReplace.endDate)}</p>
                </div>
              </div>
            )}

            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "#FFFBEB",
                border: "1px solid #FDE68A",
              }}
            >
              <p className="text-[13px]" style={{ color: "#78350F" }}>
                <strong>What will happen:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-[12px] ml-4 list-disc" style={{ color: "#92400E" }}>
                <li>The current active consent will be updated to end on {formatDate(addDaysIso(startDate, -1))}</li>
                <li>The new consent will start on {formatDate(startDate)}</li>
                <li>There will be no gaps or overlaps in coverage</li>
              </ul>
            </div>

            <p className="text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
              Do you want to end the active OTC consent and replace it with this one?
            </p>
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelReplace}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmReplace}
              style={{ backgroundColor: "#145F33", color: "white" }}
            >
              Confirm & Replace
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}