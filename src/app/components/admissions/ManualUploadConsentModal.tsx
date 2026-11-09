import { useState, useRef, useEffect } from "react";
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
import { Upload, FileText, CheckCircle2, AlertCircle, Eye } from "@/app/lib/lucide-icons";
import { DateInput } from "../ui/date-input";
import { isValidIsoDate } from "../../lib/isoDateCheck";
import { isoToMdy, mdyToIso, localTodayIso, toLocalIso, parseIsoLocal } from "../../lib/dateFormat";

interface OTCMedication {
  id: number;
  name: string;
  category: string;
}

interface ManualUploadConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medications: OTCMedication[];
  preselectedMedications: number[];
  initialStartDate: string;
  initialEndDate: string;
  onComplete: (data: {
    uploadedFile: File;
    confirmedMedications: number[];
    executedDate: string;
    startDate: string;
    endDate: string;
  }) => void;
}

export function ManualUploadConsentModal({
  open,
  onOpenChange,
  medications,
  preselectedMedications,
  initialStartDate,
  initialEndDate,
  onComplete,
}: ManualUploadConsentModalProps) {
  const [step, setStep] = useState<"upload" | "confirm">("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [confirmedMedications, setConfirmedMedications] = useState<number[]>(preselectedMedications);
  const [executedDate, setExecutedDate] = useState("");
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ executed?: string; start?: string; end?: string }>({});
  const [viewerNote, setViewerNote] = useState(false);
  const submittingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending completion timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setValidationError(null);
    }
  };

  // Proceed to confirmation step
  const proceedToConfirmation = () => {
    if (!uploadedFile) {
      setValidationError("Please upload a consent document before proceeding.");
      return;
    }
    setStep("confirm");
    setValidationError(null);
  };

  // Toggle medication confirmation (AC13)
  const toggleMedication = (medicationId: number) => {
    setConfirmedMedications((prev) =>
      prev.includes(medicationId)
        ? prev.filter((id) => id !== medicationId)
        : [...prev, medicationId]
    );
  };

  // AC8: Auto-calculate End Date when Start Date changes
  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate);
    setFieldErrors((prev) => ({ ...prev, start: undefined }));

    // Only auto-calculate from a complete, valid date (not while typing)
    if (!isValidIsoDate(newStartDate)) return;
    const calculatedEnd = parseIsoLocal(newStartDate);
    calculatedEnd.setFullYear(calculatedEnd.getFullYear() + 1);
    calculatedEnd.setDate(calculatedEnd.getDate() - 1);

    setEndDate(toLocalIso(calculatedEnd));
    setFieldErrors((prev) => ({ ...prev, end: undefined }));
  };

  // Complete the upload process (AC7, AC13)
  const handleComplete = () => {
    if (submittingRef.current) return;

    if (!uploadedFile) {
      setValidationError("Consent document is required.");
      return;
    }

    const errors: { executed?: string; start?: string; end?: string } = {};
    // AC7: Executed Date is required
    if (!executedDate) errors.executed = "Executed Date is required for manually uploaded consents.";
    else if (!isValidIsoDate(executedDate)) errors.executed = "Enter a valid Executed Date (MM/DD/YYYY).";

    if (!startDate) errors.start = "Start Date is required.";
    else if (!isValidIsoDate(startDate)) errors.start = "Enter a valid Start Date (MM/DD/YYYY).";

    if (!endDate) errors.end = "End Date is required.";
    else if (!isValidIsoDate(endDate)) errors.end = "Enter a valid End Date (MM/DD/YYYY).";

    if (!errors.start && !errors.end && endDate < startDate) {
      errors.end = "End Date must be on or after Start Date.";
    }
    if (!errors.executed && !errors.start && executedDate > startDate) {
      errors.start = "Start Date cannot be before Executed Date.";
    }

    setFieldErrors(errors);
    if (errors.executed || errors.start || errors.end) {
      setValidationError(null);
      return;
    }
    setValidationError(null);

    // Show success animation, then complete exactly once
    submittingRef.current = true;
    setShowSuccess(true);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onComplete({
        uploadedFile,
        confirmedMedications,
        executedDate,
        startDate,
        endDate,
      });
      resetAndClose();
    }, 2000);
  };

  const resetAndClose = () => {
    setStep("upload");
    setUploadedFile(null);
    setConfirmedMedications(preselectedMedications);
    setExecutedDate("");
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setValidationError(null);
    setShowSuccess(false);
    setFieldErrors({});
    setViewerNote(false);
    submittingRef.current = false;
    onOpenChange(false);
  };

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Consent Uploaded Successfully</DialogTitle>
          <div className="text-center py-8" role="status">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-[18px] font-semibold mb-2" style={{ color: "var(--slds-g-color-text-default)" }}>
              Consent Uploaded Successfully!
            </h3>
            <p className="text-[14px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
              The manually executed consent has been uploaded and confirmed.
            </p>
            <p className="text-[13px] mt-2" style={{ color: "var(--slds-g-color-text-weak)" }}>
              Status has been updated to "Executed"
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "upload" ? "Upload Manually Executed Consent" : "Confirm OTC Selections & Execution Details"}
          </DialogTitle>
          <DialogDescription>
            {step === "upload"
              ? "Upload the signed consent document. You will then confirm the OTC selections and execution details."
              : "Review the uploaded document and confirm the OTC medication selections and execution date from the signed consent."}
          </DialogDescription>
        </DialogHeader>

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

        {/* Step 1: Upload Document */}
        {step === "upload" && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="consentDocument" className="text-[13px] font-medium mb-1.5 block">
                Consent Document <span className="text-red-600">*</span>
              </Label>
              
              {/* Upload Area */}
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center transition-colors hover:border-gray-400"
                style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
              >
                <input
                  id="consentDocument"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="sr-only peer"
                />
                <label htmlFor="consentDocument" className="cursor-pointer block rounded peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: "#F0F9FF" }}
                    >
                      <Upload className="h-8 w-8" style={{ color: "#145F33" }} />
                    </div>
                    <p className="text-[14px] font-medium mb-1" style={{ color: "var(--slds-g-color-text-default)" }}>
                      Click to upload or drag and drop
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                      PDF, DOC, DOCX, JPG, or PNG (max 10MB)
                    </p>
                  </div>
                </label>
              </div>

              {/* Uploaded File Display */}
              {uploadedFile && (
                <div
                  className="mt-4 p-4 rounded-lg flex items-center gap-3"
                  style={{
                    backgroundColor: "#F0FDF4",
                    border: "1px solid #BBF7D0",
                  }}
                >
                  <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-green-900">{uploadedFile.name}</p>
                    <p className="text-[11px] text-green-700">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              )}
            </div>

            {/* Info Note */}
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "#F0F9FF",
                border: "1px solid #BAE6FD",
              }}
            >
              <p className="text-[12px]" style={{ color: "#0C4A6E" }}>
                <strong>Important:</strong> After uploading, you will be required to confirm the OTC medication selections and enter the Executed Date from the signed document. The consent cannot become active until these details are confirmed.
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
                onClick={proceedToConfirmation}
                disabled={!uploadedFile}
                style={{ backgroundColor: "#145F33", color: "white" }}
              >
                Continue to Confirmation
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Confirm OTC Selections & Execution Details */}
        {step === "confirm" && (
          <div className="space-y-6">
            {/* Document Preview */}
            {uploadedFile && (
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: "#F8F9FA",
                  border: "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5" style={{ color: "#145F33" }} />
                  <div className="flex-1">
                    <p className="text-[13px] font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                      {uploadedFile.name}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                      Uploaded consent document
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setViewerNote(true)}
                  >
                    <Eye className="h-4 w-4" />
                    View Document
                  </Button>
                </div>
                {viewerNote && (
                  <p role="status" className="text-[12px] mt-2" style={{ color: "var(--slds-g-color-text-weak)" }}>
                    Simulated: the document viewer is not available in this prototype.
                  </p>
                )}
              </div>
            )}

            {/* AC7, AC8: Execution Details */}
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "#FEF3C7",
                border: "1px solid #FDE047",
              }}
            >
              <h3 className="text-[14px] font-semibold mb-4 text-amber-900">
                Execution Details (Required)
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="executedDate" className="text-[13px] font-medium mb-1.5 block">
                    Executed Date <span className="text-red-600">*</span>
                  </Label>
                  <DateInput
                    id="executedDate"
                    aria-invalid={!!fieldErrors.executed}
                    aria-describedby={fieldErrors.executed ? "executedDate-error" : undefined}
value={isoToMdy(executedDate)}
                    onChange={(v) => {
                      setExecutedDate(mdyToIso(v));
                      setFieldErrors((prev) => ({ ...prev, executed: undefined }));
                    }}
                    max={localTodayIso()}
                  />
                  {fieldErrors.executed && (
                    <p id="executedDate-error" role="alert" className="text-[12px] mt-1 text-red-700">
                      {fieldErrors.executed}
                    </p>
                  )}
                  <p className="text-[11px] mt-1 text-amber-800">
                    Date from signed document
                  </p>
                </div>
                <div>
                  <Label htmlFor="startDateConfirm" className="text-[13px] font-medium mb-1.5 block">
                    Start Date <span className="text-red-600">*</span>
                  </Label>
                  <DateInput
                    id="startDateConfirm"
                    aria-invalid={!!fieldErrors.start}
                    aria-describedby={fieldErrors.start ? "startDateConfirm-error" : undefined}
value={isoToMdy(startDate)}
                    onChange={(v) => handleStartDateChange(mdyToIso(v))}
                  />
                  {fieldErrors.start && (
                    <p id="startDateConfirm-error" role="alert" className="text-[12px] mt-1 text-red-700">
                      {fieldErrors.start}
                    </p>
                  )}
                  <p className="text-[11px] mt-1 text-amber-800">
                    Can be adjusted to match document
                  </p>
                </div>
                <div>
                  <Label htmlFor="endDateConfirm" className="text-[13px] font-medium mb-1.5 block">
                    End Date (Inclusive) <span className="text-red-600">*</span>
                  </Label>
                  <DateInput
                    id="endDateConfirm"
                    aria-invalid={!!fieldErrors.end}
                    aria-describedby={fieldErrors.end ? "endDateConfirm-error" : undefined}
value={isoToMdy(endDate)}
                    onChange={(v) => {
                      setEndDate(mdyToIso(v));
                      setFieldErrors((prev) => ({ ...prev, end: undefined }));
                    }}
                  />
                  {fieldErrors.end && (
                    <p id="endDateConfirm-error" role="alert" className="text-[12px] mt-1 text-red-700">
                      {fieldErrors.end}
                    </p>
                  )}
                  <p className="text-[11px] mt-1 text-amber-800">
                    Auto-calculated (1 year - 1 day)
                  </p>
                </div>
              </div>
            </div>

            {/* AC13: Confirm OTC Selections */}
            <div>
              <h3 className="text-[14px] font-semibold mb-3" style={{ color: "var(--slds-g-color-text-default)" }}>
                Confirm OTC Medication Selections
              </h3>
              <p className="text-[13px] mb-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
                Review and confirm the OTC medications approved on the signed consent document. Check the boxes for all medications that are approved.
              </p>

              <div
                className="rounded-lg border overflow-hidden"
                style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
              >
                <div className="max-h-[300px] overflow-y-auto">
                  {medications.map((medication) => {
                    const isConfirmed = confirmedMedications.includes(medication.id);
                    return (
                      <div
                        key={medication.id}
                        className="flex items-center gap-3 p-4 hover:bg-gray-50/80 transition-colors border-b"
                        style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
                      >
                        <Checkbox
                          id={`confirm-med-${medication.id}`}
                          checked={isConfirmed}
                          onCheckedChange={() => toggleMedication(medication.id)}
                        />
                        <label
                          htmlFor={`confirm-med-${medication.id}`}
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
                {confirmedMedications.length} of {medications.length} medications confirmed as approved
              </div>
            </div>

            {/* Warning Note */}
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
              }}
            >
              <p className="text-[12px] text-red-900">
                <strong>Important:</strong> OTC selections cannot be directly edited after execution. Please ensure the selections match the signed consent document exactly.
              </p>
            </div>

            {/* Action Buttons */}
            <div
              className="pt-4 border-t flex gap-3 justify-end"
              style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("upload")}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetAndClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleComplete}
                disabled={showSuccess}
                style={{ backgroundColor: "#145F33", color: "white" }}
              >
                Complete Upload
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
