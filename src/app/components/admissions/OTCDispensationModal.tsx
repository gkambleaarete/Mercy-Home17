import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { AlertCircle, CheckCircle2, XCircle, Calendar, Package } from "@/app/lib/lucide-icons";
import { Badge } from "../ui/badge";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy, toLocalIso, parseIsoLocal } from "../../lib/dateFormat";
import { isValidIsoDate } from "../../lib/isoDateCheck";
import { getDemoUserName } from "../../lib/demoIdentity";

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

interface DispensationItem {
  medicationId: number;
  quantity: number;
}

interface OTCDispensationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medications: OTCMedication[];
  consents: ConsentRecord[];
  onRecordDispensation: (data: {
    administrationDate: string;
    medications: DispensationItem[];
    administeredBy: string;
    notes: string;
    consentId: number | null;
  }) => void;
}

// AC11: Configurable future-date limit (in days)
const FUTURE_DATE_LIMIT_DAYS = 30;

export function OTCDispensationModal({
  open,
  onOpenChange,
  medications,
  consents,
  onRecordDispensation,
}: OTCDispensationModalProps) {
  const [administrationDate, setAdministrationDate] = useState(() => {
    const today = new Date();
    return toLocalIso(today);
  });
  const [selectedMedications, setSelectedMedications] = useState<Map<number, number>>(new Map());
  const [administeredBy, setAdministeredBy] = useState(() => getDemoUserName());
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Defensive checks for undefined props
  const safeMedications = medications || [];
  const safeConsents = consents || [];

  // AC2: Evaluate active consent for the selected date
  const getActiveConsentForDate = (dateString: string): ConsentRecord | null => {
    if (!safeConsents.length) return null;
    
    const selectedDate = parseIsoLocal(dateString);
    selectedDate.setHours(0, 0, 0, 0);

    // Find consent where Start Date ≤ Selected Date ≤ End Date (AC2, AC7)
    const activeConsent = safeConsents.find((consent) => {
      // Only consider executed consents
      if (consent.status !== "Executed" && consent.status !== "Active" && consent.status !== "Expired" && consent.status !== "Ended" && consent.status !== "Revoked") {
        return false;
      }

      const start = parseIsoLocal(consent.startDate);
      start.setHours(0, 0, 0, 0);

      const end = parseIsoLocal(consent.endDate);
      end.setHours(23, 59, 59, 999); // AC10: End date is inclusive

      return selectedDate >= start && selectedDate <= end;
    });

    return activeConsent || null;
  };

  const [activeConsent, setActiveConsent] = useState<ConsentRecord | null>(() =>
    getActiveConsentForDate(administrationDate)
  );

  // AC1, AC2: Re-evaluate consent when date changes
  useEffect(() => {
    const consent = getActiveConsentForDate(administrationDate);
    setActiveConsent(consent);
    setSelectedMedications(new Map()); // Clear selections when consent changes
    setValidationError(null);
  }, [administrationDate, safeConsents]);

  // AC1, AC6, AC9, AC10: Validate administration date
  const validateAdministrationDate = (dateString: string): string | null => {
    if (!isValidIsoDate(dateString)) return "Enter a valid administration date (MM/DD/YYYY).";
    const selectedDate = parseIsoLocal(dateString);
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // AC6: Backdated entries are supported (no restriction on past dates)
    // Past dates are always allowed

    // AC9, AC10: Future-dated entries limited to configurable days
    if (selectedDate > today) {
      const maxFutureDate = new Date(today);
      maxFutureDate.setDate(maxFutureDate.getDate() + FUTURE_DATE_LIMIT_DAYS);

      if (selectedDate > maxFutureDate) {
        return `Future-dated entries cannot exceed ${FUTURE_DATE_LIMIT_DAYS} days from today.`;
      }
    }

    return null;
  };

  // Handle date change
  const handleDateChange = (newDate: string) => {
    const error = validateAdministrationDate(newDate);
    if (error) {
      setValidationError(error);
    } else {
      setValidationError(null);
    }
    setAdministrationDate(newDate);
  };

  // AC3, AC4, AC8: Check if medication is selectable
  const isMedicationSelectable = (medicationId: number): boolean => {
    // AC5: If no consent exists, no OTCs are selectable
    if (!activeConsent) {
      return false;
    }

    // AC3: Approved OTCs are selectable
    return activeConsent.approvedMedications.includes(medicationId);
  };

  // Toggle medication selection
  const toggleMedication = (medicationId: number) => {
    if (!isMedicationSelectable(medicationId)) {
      return; // AC8: Prevent selection of unapproved OTCs
    }

    setSelectedMedications((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(medicationId)) {
        newMap.delete(medicationId);
      } else {
        newMap.set(medicationId, 1); // Default quantity of 1
      }
      return newMap;
    });
  };

  // Update medication quantity
  const updateQuantity = (medicationId: number, quantity: number) => {
    if (quantity < 1) {
      setSelectedMedications((prev) => {
        const newMap = new Map(prev);
        newMap.delete(medicationId);
        return newMap;
      });
    } else {
      setSelectedMedications((prev) => {
        const newMap = new Map(prev);
        newMap.set(medicationId, quantity);
        return newMap;
      });
    }
  };

  // AC13: Record dispensation with consent reference
  const handleRecordDispensation = () => {
    // Validation
    if (!administrationDate) {
      setValidationError("Administration date is required.");
      return;
    }

    const dateError = validateAdministrationDate(administrationDate);
    if (dateError) {
      setValidationError(dateError);
      return;
    }

    if (selectedMedications.size === 0) {
      setValidationError("Please select at least one medication to dispense.");
      return;
    }

    if (!administeredBy.trim()) {
      setValidationError("Administered by field is required.");
      return;
    }

    // Prepare dispensation data
    const dispensationItems: DispensationItem[] = Array.from(selectedMedications.entries()).map(
      ([medicationId, quantity]) => ({
        medicationId,
        quantity,
      })
    );

    // AC13: Store consent reference
    onRecordDispensation({
      administrationDate,
      medications: dispensationItems,
      administeredBy,
      notes,
      consentId: activeConsent?.id || null,
    });

    resetAndClose();
  };

  const resetAndClose = () => {
    const today = new Date();
    setAdministrationDate(toLocalIso(today));
    setSelectedMedications(new Map());
    setAdministeredBy(getDemoUserName());
    setNotes("");
    setValidationError(null);
    onOpenChange(false);
  };

  // Calculate date constraints
  const getMaxDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + FUTURE_DATE_LIMIT_DAYS);
    return toLocalIso(today);
  };

  const formatDate = (dateString: string) => {
    const date = parseIsoLocal(dateString);
    return formatMdy(date);
  };

  // AC12: Get no consent message
  const getNoConsentMessage = (): string => {
    const selectedDate = parseIsoLocal(administrationDate);
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there are any consents at all
    const hasAnyConsents = safeConsents.some(
      (c) => c.status === "Executed" || c.status === "Active" || c.status === "Expired" || c.status === "Ended" || c.status === "Revoked"
    );

    if (!hasAnyConsents) {
      return "No OTC consent record exists for this youth. Please create a consent before recording dispensations.";
    }

    // Check if date is before earliest consent
    const earliestConsent = safeConsents
      .filter((c) => c.status === "Executed" || c.status === "Active" || c.status === "Expired" || c.status === "Ended" || c.status === "Revoked")
      .sort((a, b) => parseIsoLocal(a.startDate).getTime() - parseIsoLocal(b.startDate).getTime())[0];

    if (earliestConsent && selectedDate < parseIsoLocal(earliestConsent.startDate)) {
      return `No consent was active on ${formatDate(administrationDate)}. The earliest consent starts on ${formatDate(earliestConsent.startDate)}.`;
    }

    // Check if date is after latest consent
    const latestConsent = safeConsents
      .filter((c) => c.status === "Executed" || c.status === "Active" || c.status === "Expired" || c.status === "Ended" || c.status === "Revoked")
      .sort((a, b) => parseIsoLocal(b.endDate).getTime() - parseIsoLocal(a.endDate).getTime())[0];

    if (latestConsent && selectedDate > parseIsoLocal(latestConsent.endDate)) {
      return `The consent has expired as of ${formatDate(administrationDate)}. The most recent consent ended on ${formatDate(latestConsent.endDate)}. Please create a new consent.`;
    }

    // Gap between consents
    return `No consent was active on ${formatDate(administrationDate)}. Please verify the consent dates or create a new consent.`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record OTC Dispensation</DialogTitle>
          <DialogDescription>
            Select the administration date and medications dispensed. The system will automatically determine which consent applies.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Validation Error */}
          {validationError && (
            <div
              role="alert"
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

          {/* AC1: Administration Date Selection */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: "#F8F9FA",
              border: "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <Label htmlFor="administrationDate" className="text-[13px] font-medium mb-1.5 block">
                  <Calendar className="inline h-4 w-4 mr-1.5" />
                  Administration Date <span className="text-red-600">*</span>
                </Label>
                <DateInput
                  id="administrationDate"
value={isoToMdy(administrationDate)}
                  onChange={(v) => ((e) => handleDateChange(e.target.value))({ target: { value: mdyToIso(v) } })}
                  max={getMaxDate()}
                  className="w-full"
                />
                <p className="text-[11px] mt-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  Supports past dates and future dates up to {FUTURE_DATE_LIMIT_DAYS} days from today
                </p>
              </div>

              {/* Consent Status Indicator */}
              <div className="flex-1">
                <Label className="text-[13px] font-medium mb-1.5 block">Active Consent for Selected Date</Label>
                {activeConsent ? (
                  <div
                    className="p-3 rounded-md"
                    style={{
                      backgroundColor: "#F0FDF4",
                      border: "1px solid #BBF7D0",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-[13px] font-semibold text-green-900">Consent Found</span>
                    </div>
                    <div className="text-[12px] text-green-800">
                      <div>Period: {formatDate(activeConsent.startDate)} - {formatDate(activeConsent.endDate)}</div>
                      <div>Approved Medications: {activeConsent.approvedMedications?.length || 0} of {safeMedications.length}</div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="p-3 rounded-md"
                    style={{
                      backgroundColor: "#FEF2F2",
                      border: "1px solid #FECACA",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-[13px] font-semibold text-red-900">No Consent</span>
                    </div>
                    <div className="text-[12px] text-red-800">
                      No medications available
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AC5, AC12: No Consent Warning */}
          {!activeConsent && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
              }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[14px] font-semibold text-red-900">No Active Consent</h4>
                  <p className="text-[13px] text-red-800 mt-1">{getNoConsentMessage()}</p>
                </div>
              </div>
            </div>
          )}

          {/* AC3, AC4: OTC Medication Selection */}
          <div>
            <h3 className="text-[14px] font-semibold mb-3" style={{ color: "var(--slds-g-color-text-default)" }}>
              <Package className="inline h-4 w-4 mr-1.5" />
              Select Medications to Dispense
            </h3>
            <p className="text-[13px] mb-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
              Select the OTC medications that were dispensed. Only medications approved by the active consent are selectable.
            </p>

            {/* Medications List */}
            <div
              className="rounded-lg border overflow-hidden"
              style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
            >
              <div className="max-h-[350px] overflow-y-auto">
                {safeMedications.map((medication) => {
                  const isSelectable = isMedicationSelectable(medication.id);
                  const isSelected = selectedMedications.has(medication.id);
                  const quantity = selectedMedications.get(medication.id) || 1;
                  const isApproved = activeConsent?.approvedMedications.includes(medication.id);

                  return (
                    <div
                      key={medication.id}
                      className={`flex items-center gap-3 p-4 border-b transition-colors ${
                        isSelectable ? "hover:bg-gray-50/80" : "opacity-60"
                      }`}
                      style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
                    >
                      {/* AC3, AC4: Checkbox (enabled for approved, disabled for unapproved) */}
                      <Checkbox
                        id={`dispense-med-${medication.id}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleMedication(medication.id)}
                        disabled={!isSelectable}
                      />

                      {/* Medication Info */}
                      <label
                        htmlFor={`dispense-med-${medication.id}`}
                        className={`flex-1 ${isSelectable ? "cursor-pointer" : "cursor-not-allowed"}`}
                      >
                        <div className="text-[13px] font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                          {medication.name}
                        </div>
                        <div className="text-[11px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                          {medication.category}
                        </div>
                      </label>

                      {/* Approval Status Badge */}
                      <div className="w-28">
                        {!activeConsent ? (
                          <Badge className="bg-gray-100 text-gray-700 border-gray-300 text-[11px]">
                            Unavailable
                          </Badge>
                        ) : isApproved ? (
                          <Badge className="bg-green-100 text-green-800 border-green-300 text-[11px]">
                            Approved
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 border-red-300 text-[11px]">
                            Not Approved
                          </Badge>
                        )}
                      </div>

                      {/* Quantity Input */}
                      {isSelected && (
                        <div className="w-24">
                          <Input
                            type="number"
                            min="1"
                            max="99"
                            aria-label={`Quantity for ${medication.name}`}
                            value={quantity}
                            onChange={(e) => updateQuantity(medication.id, parseInt(e.target.value) || 0)}
                            className="h-8 text-[13px]"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-2 text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
              {selectedMedications.size} medication(s) selected
              {activeConsent && ` • ${activeConsent.approvedMedications?.length || 0} available`}
            </div>
          </div>

          {/* Dispensation Details */}
          

          {/* Info Note */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: "#F0F9FF",
              border: "1px solid #BAE6FD",
            }}
          >
            <p className="text-[12px]" style={{ color: "#0C4A6E" }}>
              <strong>Note:</strong> This dispensation will be linked to the consent that was active on {formatDate(administrationDate)}.
              {activeConsent && ` (Consent ID: ${activeConsent.id}, Period: ${formatDate(activeConsent.startDate)} - ${formatDate(activeConsent.endDate)})`}
            </p>
          </div>

          {/* Action Buttons */}
          <div
            className="pt-4 border-t flex gap-3 justify-end"
            style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
          >
            <Button type="button" variant="outline" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRecordDispensation}
              disabled={selectedMedications.size === 0 || !administeredBy.trim()}
              style={{ backgroundColor: "#145F33", color: "white" }}
            >
              Record Dispensation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}