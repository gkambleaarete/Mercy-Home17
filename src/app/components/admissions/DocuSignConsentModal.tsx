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
import { Input } from "../ui/input";
import { CheckCircle2, Send, Loader2 } from "@/app/lib/lucide-icons";
import { formatMdy } from "../../lib/dateFormat";

interface DocuSignConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMedications: number[];
  startDate: string;
  endDate: string;
  onSend: (recipientEmail: string, recipientName: string) => void;
}

export function DocuSignConsentModal({
  open,
  onOpenChange,
  selectedMedications,
  startDate,
  endDate,
  onSend,
}: DocuSignConsentModalProps) {
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSend = async () => {
    if (!recipientEmail || !recipientName) {
      return;
    }

    setIsSending(true);

    // Simulate DocuSign API call
    setTimeout(() => {
      setIsSending(false);
      setShowSuccess(true);

      // Show success for 2 seconds, then close
      setTimeout(() => {
        onSend(recipientEmail, recipientName);
        resetAndClose();
      }, 2000);
    }, 1500);
  };

  const resetAndClose = () => {
    setRecipientName("");
    setRecipientEmail("");
    setIsSending(false);
    setShowSuccess(false);
    onOpenChange(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatMdy(date);
  };

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Consent Sent Successfully</DialogTitle>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-[18px] font-semibold mb-2" style={{ color: "var(--slds-g-color-text-default)" }}>
              Consent Sent Successfully!
            </h3>
            <p className="text-[14px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
              The OTC consent has been sent to {recipientName} via DocuSign.
            </p>
            <p className="text-[13px] mt-2" style={{ color: "var(--slds-g-color-text-weak)" }}>
              Status has been updated to "Sent"
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Send OTC Consent via DocuSign</DialogTitle>
            <span
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "#FEF3C7", color: "#78350F", border: "1px solid #FDE68A" }}
            >
              FUTURE STATE
            </span>
          </div>
          <DialogDescription>
            Enter the recipient information to send the consent for electronic signature via DocuSign.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Consent Summary */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: "#F8F9FA",
              border: "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <h3 className="text-[14px] font-semibold mb-3" style={{ color: "var(--slds-g-color-text-default)" }}>
              Consent Summary
            </h3>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <div className="font-medium" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  Consent Period:
                </div>
                <div style={{ color: "var(--slds-g-color-text-default)" }}>
                  {formatDate(startDate)} - {formatDate(endDate)}
                </div>
              </div>
              <div>
                <div className="font-medium" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  Approved Medications:
                </div>
                <div style={{ color: "var(--slds-g-color-text-default)" }}>
                  {selectedMedications.length} selected
                </div>
              </div>
            </div>
          </div>

          {/* Recipient Information */}
          <div className="space-y-4">
            <h3 className="text-[14px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              Recipient Information
            </h3>

            <div>
              <Label htmlFor="recipientName" className="text-[13px] font-medium mb-1.5 block">
                Recipient Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="recipientName"
                type="text"
                placeholder="Enter full name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                disabled={isSending}
              />
            </div>

            <div>
              <Label htmlFor="recipientEmail" className="text-[13px] font-medium mb-1.5 block">
                Email Address <span className="text-red-600">*</span>
              </Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="email@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                disabled={isSending}
              />
              <p className="text-[11px] mt-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
                DocuSign will send the consent document to this email address
              </p>
            </div>
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
              <strong>Note:</strong> Once sent, the consent status will change to "Sent". The consent will automatically become "Executed" when signed via DocuSign, and will become "Active" based on the Start Date and End Date.
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
              onClick={resetAndClose}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSend}
              disabled={!recipientEmail || !recipientName || isSending}
              className="gap-2"
              style={{ backgroundColor: "#145F33", color: "white" }}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send via DocuSign
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}