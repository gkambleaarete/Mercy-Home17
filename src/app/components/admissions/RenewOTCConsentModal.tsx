import { isValidIsoDate } from "../../lib/isoDateCheck";
import { useState } from "react";
import { RefreshCw, FileText, Upload, CheckCircle2, AlertCircle, Calendar, Info } from "@/app/lib/lucide-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { OTCConsent } from "./OTCConsentsView";
import { STANDARDIZED_OTC_LIST } from "./CreateOTCConsentModal";
import { OTCSelectionConfirmationModal } from "./OTCSelectionConfirmationModal";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy, localTodayIso, toLocalIso, parseIsoLocal } from "../../lib/dateFormat";
import { getDemoUserName } from "../../lib/demoIdentity";

interface RenewOTCConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consent: OTCConsent;
  onConsentRenewed: (newConsent: OTCConsent, updatedPreviousConsent: OTCConsent) => void;
}

export function RenewOTCConsentModal({ open, onOpenChange, consent, onConsentRenewed }: RenewOTCConsentModalProps) {
  const [executionMethod, setExecutionMethod] = useState<"DocuSign" | "Manual Upload" | null>(null);
  const [selectedOTCs, setSelectedOTCs] = useState<string[]>(consent.selectedOTCs);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [executedDate, setExecutedDate] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Calculate default end date (1 year - 1 day from start date)
  const calculateEndDate = (start: string) => {
    if (!isValidIsoDate(start)) return "";
    const startDateObj = parseIsoLocal(start);
    const endDateObj = new Date(startDateObj);
    endDateObj.setFullYear(endDateObj.getFullYear() + 1);
    endDateObj.setDate(endDateObj.getDate() - 1);
    return toLocalIso(endDateObj);
  };

  // Handle start date change
  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    if (value && !endDate) {
      setEndDate(calculateEndDate(value));
    }
  };

  // Handle executed date change (for Manual Upload)
  const handleExecutedDateChange = (value: string) => {
    setExecutedDate(value);
    // Auto-set start date to executed date if not already set
    if (!startDate) {
      setStartDate(value);
      setEndDate(calculateEndDate(value));
    }
  };

  // Toggle OTC selection
  const toggleOTC = (otc: string) => {
    setSelectedOTCs(prev =>
      prev.includes(otc)
        ? prev.filter(item => item !== otc)
        : [...prev, otc]
    );
  };

  // Check if renewal is early (before previous consent expires)
  const isEarlyRenewal = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const prevEnd = parseIsoLocal(consent.endDate);
    prevEnd.setHours(0, 0, 0, 0);
    return today <= prevEnd;
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!executionMethod) {
      errors.push("Please select an execution method (DocuSign or Manual Upload)");
    }

    if (executionMethod === "Manual Upload" && !uploadedFile) {
      errors.push("Please upload a consent document");
    }

    if (executionMethod === "Manual Upload" && !executedDate) {
      errors.push("Executed Date is required for manual uploads");
    }

    if (!startDate) {
      errors.push("Start Date is required");
    }

    if (!endDate) {
      errors.push("End Date is required");
    }

    if (startDate && endDate && parseIsoLocal(endDate) <= parseIsoLocal(startDate)) {
      errors.push("End Date must be after Start Date");
    }

    if (selectedOTCs.length === 0) {
      errors.push("Please select at least one OTC medication");
    }

    // Check for early renewal comment requirement
    if (isEarlyRenewal() && !comment.trim()) {
      errors.push("A comment is required when renewing a consent before it expires");
    }

    if (comment.length > 100) {
      errors.push("Comment must be 100 characters or less");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Calculate updated previous consent end date (one day before new start)
  const calculateUpdatedPreviousEndDate = (newStartDate: string): string => {
    const newStart = parseIsoLocal(newStartDate);
    const updatedEnd = new Date(newStart);
    updatedEnd.setDate(updatedEnd.getDate() - 1);
    return toLocalIso(updatedEnd);
  };

  // Handle DocuSign execution
  const handleDocuSignExecution = () => {
    if (!validateForm()) return;

    const today = localTodayIso();
    const actualStartDate = startDate || today;

    // Create new consent
    const newConsent: OTCConsent = {
      id: `OTC-${Date.now()}`,
      youthName: consent.youthName,
      startDate: actualStartDate,
      endDate: endDate || calculateEndDate(actualStartDate),
      executedDate: today,
      status: "Sent",
      executionMethod: "DocuSign",
      selectedOTCs,
      createdBy: getDemoUserName(),
      createdDate: new Date().toISOString(),
      renewalComment: comment.trim() || undefined
    };

    // Update previous consent end date
    const updatedPreviousConsent: OTCConsent = {
      ...consent,
      endDate: calculateUpdatedPreviousEndDate(actualStartDate),
      lastModifiedBy: getDemoUserName(),
      lastModifiedDate: new Date().toISOString()
    };

    onConsentRenewed(newConsent, updatedPreviousConsent);
    resetForm();
    onOpenChange(false);
  };

  // Handle Manual Upload - Show Confirmation Modal
  const handleManualUploadNext = () => {
    if (!validateForm()) return;
    setShowConfirmationModal(true);
  };

  // Handle Manual Upload Confirmation
  const handleManualUploadConfirm = (confirmedOTCs: string[]) => {
    const actualStartDate = startDate || executedDate;

    // Create new consent
    const newConsent: OTCConsent = {
      id: `OTC-${Date.now()}`,
      youthName: consent.youthName,
      startDate: actualStartDate,
      endDate: endDate || calculateEndDate(actualStartDate),
      executedDate,
      status: "Executed",
      executionMethod: "Manual Upload",
      documentUrl: `/documents/${uploadedFile?.name}`,
      selectedOTCs: confirmedOTCs,
      createdBy: getDemoUserName(),
      createdDate: new Date().toISOString(),
      renewalComment: comment.trim() || undefined
    };

    // Update previous consent end date
    const updatedPreviousConsent: OTCConsent = {
      ...consent,
      endDate: calculateUpdatedPreviousEndDate(actualStartDate),
      lastModifiedBy: getDemoUserName(),
      lastModifiedDate: new Date().toISOString()
    };

    onConsentRenewed(newConsent, updatedPreviousConsent);
    setShowConfirmationModal(false);
    resetForm();
    onOpenChange(false);
  };

  // Reset form
  const resetForm = () => {
    setExecutionMethod(null);
    setSelectedOTCs(consent.selectedOTCs);
    setStartDate("");
    setEndDate("");
    setExecutedDate("");
    setUploadedFile(null);
    setComment("");
    setValidationErrors([]);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  // Calculate what the previous consent's new end date will be
  const getProposedPreviousEndDate = () => {
    if (!startDate && executionMethod !== "Manual Upload") {
      const today = localTodayIso();
      return calculateUpdatedPreviousEndDate(today);
    }
    if (startDate) {
      return calculateUpdatedPreviousEndDate(startDate);
    }
    if (executedDate) {
      return calculateUpdatedPreviousEndDate(executedDate);
    }
    return "";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-semibold flex items-center gap-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
              <RefreshCw className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
              Renew OTC Consent
            </DialogTitle>
            <DialogDescription className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Create a new OTC consent to replace the existing consent. OTC selections are pre-populated and can be modified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Previous Consent Information */}
            <div 
              className="rounded-lg p-4 border"
              style={{
                border: '1px solid rgba(209, 236, 241, 0.5)',
                backgroundColor: 'rgba(209, 236, 241, 0.25)'
              }}
            >
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-[#0c5460] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[#0c5460] mb-2">
                    Renewing from Previous Consent
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-[12px] text-[#0c5460]">
                    <div>
                      <span className="font-medium">Current End Date:</span> {formatMdy(new Date(consent.endDate))}
                    </div>
                    <div>
                      <span className="font-medium">Medications:</span> {consent.selectedOTCs.length} selected
                    </div>
                    {getProposedPreviousEndDate() && (
                      <div className="col-span-2">
                        <span className="font-medium">→ New End Date:</span> {formatMdy(new Date(getProposedPreviousEndDate()))}
                        <span className="ml-2 text-[11px]">(automatically adjusted to prevent overlap)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Early Renewal Notice */}
            {isEarlyRenewal() && (
              <div 
                className="rounded-lg p-4 border-l-4"
                style={{
                  backgroundColor: 'rgba(255, 243, 205, 0.3)',
                  borderColor: '#856404',
                  border: '1px solid rgba(255, 234, 167, 0.5)',
                  borderLeftWidth: '4px',
                  borderLeftColor: '#856404'
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-[#856404] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#856404] mb-1">
                      Early Renewal Detected
                    </p>
                    <p className="text-[13px] text-[#856404]">
                      The current consent is still active (expires {formatMdy(new Date(consent.endDate))}). Please provide a comment explaining the reason for early replacement.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div 
                className="rounded-lg p-4 border-l-4"
                style={{
                  backgroundColor: 'rgba(248, 215, 218, 0.3)',
                  borderColor: '#721c24',
                  border: '1px solid rgba(245, 198, 203, 0.5)',
                  borderLeftWidth: '4px',
                  borderLeftColor: '#721c24'
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-[#721c24] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#721c24] mb-2">
                      Please correct the following errors:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, idx) => (
                        <li key={idx} className="text-[13px] text-[#721c24]">{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Execution Method */}
            <div className="space-y-3">
              <Label className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                Execution Method <span className="text-red-600">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExecutionMethod("DocuSign")}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    executionMethod === "DocuSign"
                      ? 'border-[var(--color-brand-primary)] bg-[#f0f9f4]'
                      : 'border-[var(--slds-g-color-border-base-1)] hover:border-[#706e6b]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      executionMethod === "DocuSign" ? 'bg-[var(--color-brand-primary)]' : 'bg-[#f3f3f3]'
                    }`}>
                      <FileText className={`h-5 w-5 ${executionMethod === "DocuSign" ? 'text-white' : 'text-[#706e6b]'}`} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        DocuSign
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        Electronic signature
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setExecutionMethod("Manual Upload")}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    executionMethod === "Manual Upload"
                      ? 'border-[var(--color-brand-primary)] bg-[#f0f9f4]'
                      : 'border-[var(--slds-g-color-border-base-1)] hover:border-[#706e6b]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      executionMethod === "Manual Upload" ? 'bg-[var(--color-brand-primary)]' : 'bg-[#f3f3f3]'
                    }`}>
                      <Upload className={`h-5 w-5 ${executionMethod === "Manual Upload" ? 'text-white' : 'text-[#706e6b]'}`} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Manual Upload
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        Upload signed document
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Manual Upload: File Upload */}
            {executionMethod === "Manual Upload" && (
              <div className="space-y-3">
                <Label htmlFor="file-upload-renew" className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Upload Consent Document <span className="text-red-600">*</span>
                </Label>
                <div 
                  className="border-2 border-dashed rounded-lg p-6 text-center"
                  style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                >
                  <input
                    type="file"
                    id="file-upload-renew"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="sr-only peer"
                  />
                  <label htmlFor="file-upload-renew" className="cursor-pointer block rounded peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2">
                    <Upload className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                    <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      PDF, JPG, or PNG (Max 10MB)
                    </p>
                  </label>
                </div>
              </div>
            )}

            {/* Manual Upload: Executed Date */}
            {executionMethod === "Manual Upload" && (
              <div className="space-y-1.5">
                <Label htmlFor="renew-executed-date" className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Executed Date <span className="text-red-600">*</span>
                </Label>
                <DateInput id="renew-executed-date"
value={isoToMdy(executedDate)}
                  onChange={(v) => ((e) => handleExecutedDateChange(e.target.value))({ target: { value: mdyToIso(v) } })}
                  className="h-9 text-[13px]"
                  style={{
                    border: '1px solid var(--slds-g-color-border-base-1)'
                  }}
                />
                <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  Enter the date the consent was signed from the uploaded document
                </p>
              </div>
            )}

            {/* Step 2: OTC Medication Selection */}
            <div className="space-y-3">
              <Label className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                Review and Modify OTC Medications <span className="text-red-600">*</span>
              </Label>
              <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Pre-populated from previous consent. You can modify selections before execution.
              </p>
              <div 
                className="border rounded-lg p-4 max-h-64 overflow-y-auto"
                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
              >
                <div className="space-y-2">
                  {STANDARDIZED_OTC_LIST.map((otc) => (
                    <div
                      key={otc}
                      className="flex items-center gap-3 p-2 rounded hover:bg-[#f3f3f3] transition-colors"
                    >
                      <Checkbox
                        checked={selectedOTCs.includes(otc)}
                        onCheckedChange={() => toggleOTC(otc)}
                        className="h-4 w-4"
                      />
                      <label className="text-[13px] flex-1 cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        {otc}
                      </label>
                      {consent.selectedOTCs.includes(otc) && !selectedOTCs.includes(otc) && (
                        <span className="text-[10px] text-amber-600 font-medium">REMOVED</span>
                      )}
                      {!consent.selectedOTCs.includes(otc) && selectedOTCs.includes(otc) && (
                        <span className="text-[10px] text-green-600 font-medium">ADDED</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[11px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                {selectedOTCs.length} of {STANDARDIZED_OTC_LIST.length} medications selected
                {selectedOTCs.length !== consent.selectedOTCs.length && (
                  <span className="ml-2 text-amber-600">
                    (Modified from previous: {consent.selectedOTCs.length})
                  </span>
                )}
              </p>
            </div>

            {/* Step 3: Date Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="renew-start-date" className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Start Date <span className="text-red-600">*</span>
                </Label>
                <DateInput id="renew-start-date"
value={isoToMdy(startDate)}
                  onChange={(v) => ((e) => handleStartDateChange(e.target.value))({ target: { value: mdyToIso(v) } })}
                  className="h-9 text-[13px]"
                  style={{
                    border: '1px solid var(--slds-g-color-border-base-1)'
                  }}
                />
                <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  {executionMethod === "Manual Upload" ? "Can be adjusted to match signed document" : "Based on execution date"}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="renew-end-date" className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  End Date <span className="text-red-600">*</span>
                </Label>
                <DateInput id="renew-end-date"
value={isoToMdy(endDate)}
                  onChange={(v) => ((e) => setEndDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                  className="h-9 text-[13px]"
                  style={{
                    border: '1px solid var(--slds-g-color-border-base-1)'
                  }}
                />
                <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  Defaults to one year minus one day (inclusive)
                </p>
              </div>
            </div>

            {/* Renewal Comment (Required for early renewal) */}
            <div className="space-y-2">
              <Label htmlFor="renew-comment" className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                Renewal Comment {isEarlyRenewal() && <span className="text-red-600">*</span>}
              </Label>
              <Textarea id="renew-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isEarlyRenewal() ? "Required: Explain reason for early renewal..." : "Optional: Add context for this renewal..."}
                maxLength={100}
                className="min-h-[80px] text-[13px]"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)'
                }}
              />
              <div className="flex items-center justify-between">
                <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  {isEarlyRenewal() ? "Required when replacing an active consent" : "Optional context for the renewal"}
                </p>
                <p className="text-[11px]" style={{ color: comment.length > 100 ? '#c23934' : 'var(--slds-g-color-text-weak)' }}>
                  {comment.length}/100
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              className="h-9 px-4 text-[13px] rounded-full"
            >
              Cancel
            </Button>
            {executionMethod === "DocuSign" && (
              <span className="text-[11px] self-center" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Simulated: no DocuSign envelope is actually sent in this prototype.
              </span>
            )}
            {executionMethod === "DocuSign" && (
              <Button
                onClick={handleDocuSignExecution}
                className="h-9 px-4 text-[13px] rounded-full gap-2"
                style={{
                  backgroundColor: 'var(--color-brand-primary)',
                  color: 'white'
                }}
              >
                <FileText className="h-4 w-4" />
                Send via DocuSign
              </Button>
            )}
            {executionMethod === "Manual Upload" && (
              <Button
                onClick={handleManualUploadNext}
                className="h-9 px-4 text-[13px] rounded-full gap-2"
                style={{
                  backgroundColor: 'var(--color-brand-primary)',
                  color: 'white'
                }}
              >
                <CheckCircle2 className="h-4 w-4" />
                Next: Confirm Selections
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OTC Selection Confirmation Modal (for Manual Upload) */}
      {showConfirmationModal && uploadedFile && (
        <OTCSelectionConfirmationModal
          open={showConfirmationModal}
          onOpenChange={setShowConfirmationModal}
          selectedOTCs={selectedOTCs}
          documentName={uploadedFile.name}
          onConfirm={handleManualUploadConfirm}
        />
      )}
    </>
  );
}