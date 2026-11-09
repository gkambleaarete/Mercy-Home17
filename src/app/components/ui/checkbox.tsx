"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "@/app/lib/lucide-icons";

import { cn } from "./utils";

// `surface` mirrors Input/SelectTrigger.
// The unchecked box is already white by default (disabled keeps the gray
// input-background); "base" is kept for existing call sites.
function Checkbox({
  className,
  surface = "default",
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  surface?: "default" | "base";
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border bg-[var(--slds-g-color-background-base)] disabled:data-[state=unchecked]:bg-input-background dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        surface === "base" &&
          "bg-[var(--slds-g-color-background-base)]",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        {/* text-current keeps the icon on the Checkbox's own color even
            inside containers that tint bare svgs (e.g. CommandItem). */}
        <CheckIcon className="size-3.5 text-current" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };