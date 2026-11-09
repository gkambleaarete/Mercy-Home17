import { useState } from "react";
import { CheckCircle2, AlertTriangle, FileText } from "@/app/lib/lucide-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface OTCSelectionConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOTCs: string[];
  documentName: string;
  onConfirm: (confirmedOTCs: string[]) => void;
}

export function OTCSelectionConfirmationModal({
  open,
  onOpenChange,
  selectedOTCs,
  documentName,
  onConfirm
}: OTCSelectionConfirmationModalProps) {
  const [confirmedOTCs, setConfirmedOTCs] = useState<string[]>(selectedOTCs);
  const [hasReviewedDocument, setHasReviewedDocument] = useState(false);

  const toggleOTC = (otc: string) => {
    setConfirmedOTCs(prev =>
      prev.includes(otc)
        ? prev.filter(item => item !== otc)
        : [...prev, otc]
    );
  };

  const handleConfirm = () => {
    if (confirmedOTCs.length === 0) {
      alert("Please select at least one OTC medication to approve");
      return;
    }
    if (!hasReviewedDocument) {
      alert("Please confirm that you have reviewed the uploaded document");
      return;
    }
    onConfirm(confirmedOTCs);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold flex items-center gap-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
            <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
            Confirm OTC Medication Selections
          </DialogTitle>
          <DialogDescription className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
            Review and confirm the OTC medications approved in the uploaded consent document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Important Notice */}
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
              <AlertTriangle className="h-5 w-5 text-[#856404] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#856404] mb-2">
                  Important: Required Confirmation
                </p>
                <p className="text-[13px] text-[#856404]">
                  Please review the uploaded consent document and confirm the OTC medication selections below match what was signed by the youth or guardian. These selections cannot be edited after the consent is executed.
                </p>
              </div>
            </div>
          </div>

          {/* Document Reference */}
          <div 
            className="rounded-lg p-4 border"
            style={{
              border: '1px solid var(--slds-g-color-border-base-1)',
              backgroundColor: 'var(--slds-g-color-neutral-base-95)'
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-brand-primary)' }}
              >
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Uploaded Document
                </p>
                <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  {documentName}
                </p>
              </div>
            </div>
          </div>

          {/* OTC Selection Confirmation */}
          <div className="space-y-3">
            <Label className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
              Confirm Approved OTC Medications <span className="text-red-600">*</span>
            </Label>
            <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Review the selections below and adjust if needed to match the signed document exactly.
            </p>
            <div 
              className="border rounded-lg p-4 max-h-72 overflow-y-auto"
              style={{ 
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
              <div className="space-y-2">
                {selectedOTCs.map((otc) => (
                  <div
                    key={otc}
                    className={`flex items-center gap-3 p-3 rounded transition-colors ${
                      confirmedOTCs.includes(otc) ? 'bg-[#f0f9f4]' : 'bg-white'
                    }`}
                    style={{
                      border: confirmedOTCs.includes(otc) 
                        ? '1px solid var(--color-brand-primary)' 
                        : '1px solid var(--slds-g-color-border-base-1)'
                    }}
                  >
                    <Checkbox
                      checked={confirmedOTCs.includes(otc)}
                      onCheckedChange={() => toggleOTC(otc)}
                      className="h-4 w-4"
                    />
                    <label 
                      className="text-[13px] flex-1 cursor-pointer" 
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                      onClick={() => toggleOTC(otc)}
                    >
                      {otc}
                    </label>
                    {confirmedOTCs.includes(otc) && (
                      <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--color-brand-primary)' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                {confirmedOTCs.length} medication{confirmedOTCs.length !== 1 ? 's' : ''} confirmed as approved
              </p>
              {confirmedOTCs.length !== selectedOTCs.length && (
                <p className="text-[11px] text-amber-600 font-medium">
                  Selection modified from original
                </p>
              )}
            </div>
          </div>

          {/* Document Review Confirmation Checkbox */}
          <div 
            className="rounded-lg p-4 border"
            style={{
              border: '1px solid var(--slds-g-color-border-base-1)',
              backgroundColor: 'var(--slds-g-color-background-base)'
            }}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={hasReviewedDocument}
                onCheckedChange={(checked) => setHasReviewedDocument(checked as boolean)}
                className="h-4 w-4 mt-1"
              />
              <div className="flex-1">
                <label 
                  className="text-[13px] font-medium cursor-pointer" 
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                  onClick={() => setHasReviewedDocument(!hasReviewedDocument)}
                >
                  I confirm that I have reviewed the uploaded consent document
                </label>
                <p className="text-[11px] mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  By checking this box, you confirm that the OTC medication selections above accurately reflect what was approved and signed in the uploaded document. These selections cannot be changed after confirmation.
                </p>
              </div>
            </div>
          </div>

          {/* Warning about locked selections */}
          <div 
            className="rounded-lg p-3 border"
            style={{
              border: '1px solid rgba(209, 236, 241, 0.5)',
              backgroundColor: 'rgba(209, 236, 241, 0.25)'
            }}
          >
            <p className="text-[12px] text-[#0c5460]">
              <strong>Note:</strong> Once confirmed, these OTC selections will be locked and cannot be directly edited. Any changes would require creating a new consent record.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 text-[13px] rounded-full"
          >
            Go Back
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!hasReviewedDocument || confirmedOTCs.length === 0}
            className="h-9 px-4 text-[13px] rounded-full gap-2"
            style={{
              backgroundColor: hasReviewedDocument && confirmedOTCs.length > 0 
                ? 'var(--color-brand-primary)' 
                : '#c9c7c5',
              color: 'white',
              cursor: hasReviewedDocument && confirmedOTCs.length > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm and Execute Consent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}