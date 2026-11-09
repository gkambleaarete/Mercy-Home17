import * as React from "react";

import { Label } from "./label";
import { cn } from "./utils";

// Design System FRM-01 field label and field-level error message, promoted
// from the Components showcase so product forms render the same Label /
// error text the showcase documents instead of re-typing the styles.
// Label: the app's .slds-form-label token class (12px, bold, uppercase),
// weak text, red required asterisk. Error: 11px, #A82031.

function FieldLabel({
  error,
  required,
  note,
  htmlFor,
  id,
  className,
  children,
}: {
  error?: boolean;
  required?: boolean;
  note?: string;
  htmlFor?: string;
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      id={id}
      className={cn(
        "slds-form-label mb-1.5 leading-snug",
        error
          ? "text-[#A82031]"
          : "text-[var(--slds-g-color-text-weak)]",
        className,
      )}
    >
      {/* One inline run, so a wrapped label keeps the asterisk after its
          last word instead of in a separate flex column. */}
      <span>
        {children}
        {required && (
          <>
            <span className="text-[#c23934]" aria-hidden="true">
              {" "}
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </span>
      {note && (
        <span className="text-[length:var(--slds-g-font-size-2)] font-normal normal-case tracking-normal">
          {note}
        </span>
      )}
    </Label>
  );
}

/** Field-level error. `id` lets the control reference it via aria-describedby. */
function FieldError({
  id,
  role,
  children,
}: {
  id?: string;
  /** Optional, additive: pass "alert" so assistive tech announces the error. */
  role?: React.AriaRole;
  children?: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <p
      id={id}
      role={role}
      className="mt-1 text-[length:var(--slds-g-font-size-2)] text-[#A82031]"
    >
      {children}
    </p>
  );
}

/**
 * A labelled filter/search control: the approved FieldLabel stacked over its
 * control. Both Friends First search screens lay their filters out this way.
 */
function FilterField({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
    </div>
  );
}

export { FieldLabel, FieldError, FilterField };