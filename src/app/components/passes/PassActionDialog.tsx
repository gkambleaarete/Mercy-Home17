import { useEffect, useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import type { PassSeriesScope } from "../../lib/passes";

// One dialog for both record actions that may need a series scope (19998):
//   • Edit of a recurring occurrence → choose scope before the edit applies
//   • Cancel Pass → Cancellation Reason (+ scope when recurring)

const SCOPE_OPTIONS: {
  value: PassSeriesScope;
  label: string;
}[] = [
  { value: "this", label: "This Pass" },
  { value: "future", label: "This and Future Passes" },
  { value: "series", label: "Entire Series" },
];

export interface PassActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  /** Confirm button style — "accent" for Cancel Pass. */
  confirmVariant?: "default" | "accent";
  /** Show the scope choice (the Pass belongs to a series). */
  showScope: boolean;
  /** Scopes the user may not pick, with the reason shown under the list. */
  disabledScopes?: {
    scopes: PassSeriesScope[];
    reason: string;
  };
  /** Require a Cancellation Reason. */
  requireReason: boolean;
  onConfirm: (scope: PassSeriesScope, reason: string) => void;
}

export function PassActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmVariant = "default",
  showScope,
  disabledScopes,
  requireReason,
  onConfirm,
}: PassActionDialogProps) {
  const [scope, setScope] = useState<PassSeriesScope | "">("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{
    scope?: string;
    reason?: string;
  }>({});

  // Fresh state every time it opens — no scope is ever pre-selected.
  useEffect(() => {
    if (open) {
      setScope(showScope ? "" : "this");
      setReason("");
      setErrors({});
    }
  }, [open, showScope]);

  function handleConfirm() {
    const e: { scope?: string; reason?: string } = {};
    if (!scope)
      e.scope = "Choose which passes this applies to.";
    if (requireReason && !reason.trim())
      e.reason = "Cancellation Reason is required.";
    setErrors(e);
    if (Object.keys(e).length === 0)
      onConfirm(scope as PassSeriesScope, reason.trim());
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="md"
        aria-describedby="pass-action-description"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription id="pass-action-description">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4 bg-white">
          {showScope && (
            <div>
              <p className="slds-form-label mb-1.5 text-[var(--slds-g-color-text-weak)]">
                APPLY TO
                <span className="text-[#c23934]"> *</span>
              </p>
              <RadioGroup
                value={scope}
                onValueChange={(v) => {
                  setScope(v as PassSeriesScope);
                  setErrors((x) => ({
                    ...x,
                    scope: undefined,
                  }));
                }}
                className="space-y-2"
              >
                {SCOPE_OPTIONS.map((o) => {
                  const disabled =
                    disabledScopes?.scopes.includes(o.value);
                  return (
                    <div
                      key={o.value}
                      className="flex items-center gap-2"
                    >
                      <RadioGroupItem
                        value={o.value}
                        id={`pass-scope-${o.value}`}
                        disabled={disabled}
                      />
                      <Label
                        htmlFor={`pass-scope-${o.value}`}
                        className="font-normal text-[length:var(--slds-g-font-size-4)] cursor-pointer"
                      >
                        {o.label}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
              {disabledScopes && (
                <p className="slds-text-3 mt-1 text-[var(--slds-g-color-text-weak)]">
                  {disabledScopes.reason}
                </p>
              )}
              {errors.scope && (
                <p
                  role="alert"
                  className="slds-text-3 mt-1 text-[#c23934]"
                >
                  {errors.scope}
                </p>
              )}
            </div>
          )}
          {requireReason && (
            <div>
              <label
                htmlFor="pass-action-reason"
                className="slds-form-label block mb-1.5 text-[var(--slds-g-color-text-weak)]"
              >
                CANCELLATION REASON
                <span className="text-[#c23934]"> *</span>
              </label>
              <Textarea
                surface="base"
                id="pass-action-reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setErrors((x) => ({
                    ...x,
                    reason: undefined,
                  }));
                }}
                placeholder="Enter cancellation reason"
                aria-invalid={!!errors.reason}
              />
              {errors.reason && (
                <p
                  role="alert"
                  className="slds-text-3 mt-1 text-[#c23934]"
                >
                  {errors.reason}
                </p>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Back
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}