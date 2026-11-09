import { useState } from "react";
import { X, AlertCircle } from "@/app/lib/lucide-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OTCConsent } from "./OTCConsentsView";
import { formatMdy } from "../../lib/dateFormat";

interface EndOTCConsentModalProps {
  consent: OTCConsent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConsentEnded: (consentId: string, reason: string) => void;
}

export function EndOTCConsentModal({
  consent,
  open,
  onOpenChange,
  onConsentEnded,
}: EndOTCConsentModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleEnd = () => {
    if (!reason.trim()) {
      setError("Please provide a reason for ending this consent early.");
      return;
    }

    if (consent) {
      onConsentEnded(consent.id, reason);
      handleClose();
    }
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onOpenChange(false);
  };

  if (!consent) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-2xl"
        style={{
          backgroundColor: "white",
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "8px",
          padding: "0"
        }}
      >
        <DialogHeader 
          className="px-6 py-4"
          style={{
            borderBottom: "2px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <DialogTitle 
            className="text-lg font-semibold flex items-center gap-2"
            style={{ color: "var(--slds-g-color-text-default)" }}
          >
            <AlertCircle className="h-5 w-5" style={{ color: "#DC2626" }} />
            End OTC Consent Early
          </DialogTitle>
          <DialogDescription className="text-[13px] mt-2" style={{ color: "var(--slds-g-color-text-weak)" }}>
            This action will immediately terminate the active OTC consent and set its end date to today. 
            All approved medications will become unavailable.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          {/* Consent Information */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FCA5A5",
            }}
          >
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span style={{ color: "#991B1B", fontWeight: 500 }}>Consent ID:</span>
                <span style={{ color: "#991B1B" }}>{consent.id}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#991B1B", fontWeight: 500 }}>Current End Date:</span>
                <span style={{ color: "#991B1B" }}>
                  {formatMdy(new Date(consent.endDate))}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#991B1B", fontWeight: 500 }}>New End Date:</span>
                <span style={{ color: "#991B1B", fontWeight: 600 }}>
                  {formatMdy(new Date())} (Today)
                </span>
              </div>
            </div>
          </div>

          {/* Reason Field */}
          <div className="space-y-1.5">
            <Label 
              htmlFor="end-otc-reason"
              className="text-[13px] font-semibold" 
              style={{ color: "var(--slds-g-color-text-default)" }}
            >
              Reason for Early Termination <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="end-otc-reason"
              aria-invalid={!!error}
              aria-describedby={error ? "end-otc-reason-error" : undefined}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              placeholder="Enter the reason for ending this consent early (e.g., youth discharged, parent withdrew consent, safety concern, etc.)"
              rows={4}
              className="text-[13px]"
              style={{
                border: error ? "1px solid #DC2626" : "1px solid var(--slds-g-color-border-base-1)",
                borderRadius: "4px",
                resize: "vertical",
              }}
            />
            {error && (
              <p id="end-otc-reason-error" role="alert" className="text-[12px] flex items-center gap-1.5" style={{ color: "#DC2626" }}>
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
          </div>

          {/* Warning Notice */}
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: "#FFFBEB",
              border: "1px solid #FCD34D",
            }}
          >
            <p className="text-[12px]" style={{ color: "#92400E" }}>
              <strong>Important:</strong> This action cannot be undone. The consent will be marked as Expired 
              and all approved OTC medications will become immediately unavailable. You can create a new consent 
              if needed.
            </p>
          </div>
        </div>

        <DialogFooter
          className="px-6 py-4"
          style={{
            borderTop: "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor: "#F9FAFB",
          }}
        >
          <button
            onClick={handleClose}
            className="px-4 py-2 text-[13px] font-medium rounded-md transition-colors"
            style={{
              border: "1px solid var(--slds-g-color-border-base-1)",
              color: "var(--slds-g-color-text-default)",
              backgroundColor: "white",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F3F4F6";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "white";
            }}
          >
            <X className="h-3.5 w-3.5 inline mr-1.5" />
            Cancel
          </button>
          <button
            onClick={handleEnd}
            className="px-4 py-2 text-[13px] font-medium rounded-md transition-colors"
            style={{
              backgroundColor: "#DC2626",
              color: "white",
              border: "1px solid #DC2626",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#B91C1C";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#DC2626";
            }}
          >
            <AlertCircle className="h-3.5 w-3.5 inline mr-1.5" />
            End Consent Now
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
