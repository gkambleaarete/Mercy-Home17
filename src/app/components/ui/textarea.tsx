import * as React from "react";

import { cn } from "./utils";

// `size="default"` is byte-identical to what this component always
// rendered -- omitting `size` changes nothing for existing consumers.
// `size="md"`/`"sm"` are the two SLDS-token text sizes used throughout this
// app's own forms (13px/12px, matching Input's own md/sm); unlike
// `default`, they also own their disabled/read-only/error surface colors
// so a consumer never hand-types those as className.
// `size="lg"` is `md` with a large (10rem) minimum height for long-form
// fields such as Comments; the field still grows with its content.
// `focused` mirrors the same escape hatch already on Input/SelectTrigger --
// forces the real focus-visible look for a static demo that has no actual
// keyboard focus.
// `surface` mirrors Input/SelectTrigger. Editable fields are already white by
// default (disabled/read-only keep the gray input-background); "base" is kept
// for existing call sites.
function Textarea({
  className,
  size = "default",
  focused,
  surface = "default",
  ...props
}: React.ComponentProps<"textarea"> & {
  size?: "default" | "md" | "sm" | "lg";
  focused?: boolean;
  surface?: "default" | "base";
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-[var(--slds-g-color-background-base)] px-3 py-2 transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed",
        size === "md" || size === "sm" || size === "lg"
          ? cn(
              size === "lg" && "min-h-40",
              size === "md" || size === "lg"
                ? "text-[length:var(--slds-g-font-size-4)]"
                : "text-[length:var(--slds-g-font-size-3)]",
              "border-[var(--slds-g-color-border-base-1)] bg-[var(--slds-g-color-background-base)] read-only:cursor-not-allowed read-only:bg-[var(--slds-g-color-background-alt)] disabled:bg-[#f3f2f2] disabled:opacity-60 aria-invalid:border-[#A82031] aria-invalid:ring-[#A82031]/20",
            )
          : "text-base md:text-sm disabled:bg-input-background read-only:bg-input-background disabled:opacity-50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        surface === "base" &&
          "bg-[var(--slds-g-color-background-base)]",
        focused && "border-ring ring-ring/50 ring-[3px]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };