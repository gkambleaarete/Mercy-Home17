import { useState, useEffect, useRef } from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { isValidIsoDate } from "../../lib/isoDateCheck";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { AlertTriangle } from "@/app/lib/lucide-icons";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy, localTodayIso, addDaysIso } from "../../lib/dateFormat";

interface EndRevokeConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consent: {
    id: number;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
  onConfirm: (endDate: string, comment: string, actionType: "end" | "revoke") => void | Promise<void>;
  actionType: "end" | "revoke";
}

export function EndRevokeConsentModal({ open, onOpenChange, consent, onConfirm, actionType }: EndRevokeConsentModalProps) {
  const [comment, setComment] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [selectedAction, setSelectedAction] = useState<"end" | "revoke">(actionType);
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const maxChars = 100;

  // Reset on open: honor the requested action; default end date = yesterday (local)
  useEffect(() => {
    if (open) {
      setSelectedAction(actionType);
      setEndDate(addDaysIso(localTodayIso(), -1));
      setComment("");
      setCharCount(0);
      setDateError(null);
      pendingRef.current = false;
      setPending(false);
    }
  }, [open, actionType]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setComment(value);
      setCharCount(value.length);
    }
  };

  const validateDate = (iso: string): string | null => {
    if (!iso) return "End Date is required.";
    if (!isValidIsoDate(iso)) return "Enter a valid End Date (MM/DD/YYYY).";
    if (consent && isValidIsoDate(consent.startDate) && iso < consent.startDate) {
      return `End Date cannot be before the consent Start Date (${formatMdy(consent.startDate)}).`;
    }
    return null;
  };

  const handleConfirm = async () => {
    if (pendingRef.current) return;
    const err = validateDate(endDate);
    setDateError(err);
    if (err) return;
    pendingRef.current = true;
    setPending(true);
    try {
      await onConfirm(endDate, comment.trim(), selectedAction);
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  };

  const handleCancel = () => {
    if (pendingRef.current) return;
    setComment("");
    setCharCount(0);
    onOpenChange(false);
  };

  if (!consent) return null;

  const formatDate = (dateString: string) => {
    return formatMdy(dateString);
  };

  // Dynamic text based on action type
  const title = selectedAction === "end" ? "End Consent" : "Revoke Consent";
  const description = selectedAction === "end" 
    ? "This will end the consent on the specified date. This action cannot be undone."
    : "This will revoke the consent permanently. This action cannot be undone.";
  const warningText = selectedAction === "end"
    ? "Ending this consent will revoke authorization for all OTC medications on this consent."
    : "Revoking this consent will permanently invalidate it and immediately revoke authorization for all OTC medications.";
  const buttonText = selectedAction === "end" ? "Confirm - End Consent" : "Confirm - Revoke Consent";
  const labelText = selectedAction === "end" 
    ? "Reason for Ending Consent Early (Optional)"
    : "Reason for Revoking Consent (Optional)";
  const placeholderText = selectedAction === "end"
    ? "Enter optional comment explaining why this consent is being ended early..."
    : "Enter optional comment explaining why this consent is being revoked...";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action choice */}
          <fieldset className="space-y-1.5">
            <legend className="text-[13px] font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>Action</legend>
            <RadioGroup
              value={selectedAction}
              onValueChange={(v) => setSelectedAction(v as "end" | "revoke")}
              className="flex gap-6"
              aria-label="Consent action"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="end" id="consent-action-end" disabled={pending} />
                <Label htmlFor="consent-action-end" className="text-[13px]">End Consent</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="revoke" id="consent-action-revoke" disabled={pending} />
                <Label htmlFor="consent-action-revoke" className="text-[13px]">Revoke Consent</Label>
              </div>
            </RadioGroup>
          </fieldset>

          {/* Warning Box */}
          <div
            className="p-4 rounded-lg flex items-start gap-3"
            style={{
              backgroundColor: "#FEF3C7",
              border: "1px solid #FDE68A",
            }}
          >
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#D97706" }} />
            <div>
              <h4 className="text-[14px] font-semibold" style={{ color: "#78350F" }}>
                Warning
              </h4>
              <p className="text-[13px] mt-1" style={{ color: "#92400E" }}>
                {warningText}
              </p>
            </div>
          </div>

          {/* Consent Details */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: "#F9FAFB",
              border: "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <h4 className="text-[13px] font-semibold mb-2" style={{ color: "var(--slds-g-color-text-default)" }}>
              Consent Details
            </h4>
            <div className="space-y-1 text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
              <p>Start Date: {formatDate(consent.startDate)}</p>
              <p>Current End Date: {formatDate(consent.endDate)}</p>
              <p>Status: {consent.status}</p>
            </div>
          </div>

          {/* End Date Field */}
          <div className="space-y-1.5">
            <Label htmlFor="end-date" className="text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
              End Date <span className="text-red-600">*</span>
            </Label>
            <DateInput
              id="end-date"
              value={isoToMdy(endDate)}
              onChange={(v) => {
                const iso = mdyToIso(v);
                setEndDate(iso);
                if (dateError) setDateError(null);
              }}
              aria-invalid={!!dateError}
              aria-describedby={dateError ? "end-date-error" : undefined}
              className="w-full"
              style={{
                borderColor: dateError ? "#DC2626" : "var(--slds-g-color-border-base-1)",
              }}
            />
            {dateError && (
              <p id="end-date-error" role="alert" className="text-[12px]" style={{ color: "#DC2626" }}>
                {dateError}
              </p>
            )}
            <p className="text-[11px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
              Defaults to yesterday. Consents are inclusive of the End Date. To stop medication immediately (e.g., allergic reaction), set to the previous day.
            </p>
          </div>

          {/* Optional Comment Field */}
          <div className="space-y-2">
            <Label htmlFor="revocation-comment" className="text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
              {labelText}
            </Label>
            <Textarea
              id="revocation-comment"
              value={comment}
              onChange={handleCommentChange}
              placeholder={placeholderText}
              className="resize-none text-[13px]"
              rows={3}
              style={{
                borderColor: "var(--slds-g-color-border-base-1)",
              }}
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                This comment will be saved in the consent history.
              </p>
              <p className="text-[11px]" style={{ color: charCount >= maxChars ? "#DC2626" : "var(--slds-g-color-text-weak)" }}>
                {charCount}/{maxChars}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={pending}
              className="px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={pending}
              className="px-4"
              style={{ backgroundColor: "#DC2626", color: "white" }}
            >
              {pending ? "Saving..." : buttonText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}