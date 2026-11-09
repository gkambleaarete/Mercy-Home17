import { isValidIsoDate } from "../../lib/isoDateCheck";
import { useState } from "react";
import { X, FileText, Upload, CheckCircle2, AlertCircle, Calendar } from "@/app/lib/lucide-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { OTCConsent } from "./OTCConsentsView";
import { OTCSelectionConfirmationModal } from "./OTCSelectionConfirmationModal";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, localTodayIso, toLocalIso, parseIsoLocal } from "../../lib/dateFormat";
import { getDemoUserName } from "../../lib/demoIdentity";

// Standardized OTC Medication List (maintained by System Administrators)
export const STANDARDIZED_OTC_LIST = [
  "Acetaminophen 325mg",
  "Ibuprofen 200mg",
  "Diphenhydramine 25mg",
  "Cetirizine 10mg",
  "Loratadine 10mg",
  "Guaifenesin 200mg",
  "Dextromethorphan 15mg",
  "Calcium Carbonate 500mg",
  "Famotidine 10mg",
  "Loperamide 2mg",
  "Hydrocortisone Cream 1%",
  "Triple Antibiotic Ointment",
  "Calamine Lotion",
  "Saline Nasal Spray",
  "Artificial Tears",
  "Throat Lozenges",
  "Multivitamin",
  "Vitamin D3 1000 IU",
  "Melatonin 3mg",
  "Electrolyte Solution"
];

interface CreateOTCConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConsentCreated: (consent: OTCConsent) => void;
  /** Youth the consent is for (selected record from the parent). */
  youthName?: string;
}

export function CreateOTCConsentModal({ open, onOpenChange, onConsentCreated, youthName }: CreateOTCConsentModalProps) {
  const [executionMethod, setExecutionMethod] = useState<"DocuSign" | "Manual Upload" | null>(null);
  const [selectedOTCs, setSelectedOTCs] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [executedDate, setExecutedDate] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
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

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Handle DocuSign execution
  const handleDocuSignExecution = () => {
    if (!validateForm()) return;

    // In production, this would integrate with DocuSign API
    const newConsent: OTCConsent = {
      id: `OTC-${Date.now()}`,
      youthName: youthName || "Unknown Youth",
      startDate,
      endDate,
      executedDate: localTodayIso(),
      status: "Sent",
      executionMethod: "DocuSign",
      selectedOTCs,
      createdBy: getDemoUserName(),
      createdDate: new Date().toISOString()
    };

    onConsentCreated(newConsent);
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
    const newConsent: OTCConsent = {
      id: `OTC-${Date.now()}`,
      youthName: youthName || "Unknown Youth",
      startDate,
      endDate,
      executedDate,
      status: "Executed",
      executionMethod: "Manual Upload",
      documentUrl: `/documents/${uploadedFile?.name}`,
      selectedOTCs: confirmedOTCs,
      createdBy: getDemoUserName(),
      createdDate: new Date().toISOString()
    };

    onConsentCreated(newConsent);
    setShowConfirmationModal(false);
    resetForm();
    onOpenChange(false);
  };

  // Reset form
  const resetForm = () => {
    setExecutionMethod(null);
    setSelectedOTCs([]);
    setStartDate("");
    setEndDate("");
    setExecutedDate("");
    setUploadedFile(null);
    setNotes("");
    setValidationErrors([]);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
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
              <FileText className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
              Create New OTC Consent
            </DialogTitle>
            <DialogDescription className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Create a new over-the-counter medication consent record for the youth
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
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
                <Label htmlFor="file-upload" className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Upload Consent Document <span className="text-red-600">*</span>
                </Label>
                <div 
                  className="border-2 border-dashed rounded-lg p-6 text-center"
                  style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                >
                  <input
                    type="file"
                    id="file-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="sr-only peer"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block rounded peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2">
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
                <Label htmlFor="otc-executed-date" className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Executed Date <span className="text-red-600">*</span>
                </Label>
                <DateInput id="otc-executed-date"
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
                Select Approved OTC Medications <span className="text-red-600">*</span>
              </Label>
              <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Selected medications will be marked as approved. Unselected medications will be marked as not approved.
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
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[11px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                {selectedOTCs.length} of {STANDARDIZED_OTC_LIST.length} medications selected
              </p>
            </div>

            {/* Step 3: Date Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="otc-start-date" className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Start Date <span className="text-red-600">*</span>
                </Label>
                <DateInput id="otc-start-date"
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
                <Label htmlFor="otc-end-date" className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  End Date <span className="text-red-600">*</span>
                </Label>
                <DateInput id="otc-end-date"
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

            {/* Notes (Optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="otc-notes" className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                Additional Notes (Optional)
              </Label>
              <Textarea id="otc-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any additional notes or special instructions..."
                className="min-h-[80px] text-[13px]"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)'
                }}
              />
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