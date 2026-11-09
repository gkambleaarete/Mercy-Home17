"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

// trackTone default ("bg-primary/20") is the one real consumer's existing,
// untouched look (DocumentRepository.tsx). "neutral" is additive — a plain
// gray track, for cases (like a multi-color status list) where the track
// shouldn't visually tint toward whichever color the fill happens to be.
const progressVariants = cva(
  "relative h-2 w-full overflow-hidden rounded-full",
  {
    variants: {
      trackTone: {
        primary: "bg-primary/20",
        neutral: "bg-[var(--slds-g-color-neutral-base-90)]",
      },
    },
    defaultVariants: { trackTone: "primary" },
  },
);

// Named after this app's real brand tokens, same as Avatar's color prop —
// one shared vocabulary for "which brand color" across every component.
const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all",
  {
    variants: {
      tone: {
        primary: "bg-primary",
        secondary: "bg-[var(--color-brand-secondary)]",
        accent: "bg-[var(--color-brand-accent)]",
        neutral: "bg-[var(--slds-g-color-neutral-base-50)]",
      },
    },
    defaultVariants: { tone: "primary" },
  },
);

function Progress({
  className,
  value,
  trackTone,
  tone,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> &
  VariantProps<typeof progressVariants> &
  VariantProps<typeof progressIndicatorVariants>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(progressVariants({ trackTone }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={progressIndicatorVariants({ tone })}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
