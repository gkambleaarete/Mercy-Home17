import * as React from "react";
import {
  cva,
  type VariantProps,
} from "class-variance-authority@0.7.1";

import { cn } from "./utils";
import { Button } from "./button";

// Same tone vocabulary as Alert (success/info/warning/error) plus a
// neutral default and a brand option — so an EmptyState's icon circle
// stays consistent with how every other "colored surface" in this app
// is named, instead of inventing its own one-off color system.
const emptyStateIconVariants = cva(
  "flex items-center justify-center rounded-full shrink-0 h-14 w-14",
  {
    variants: {
      tone: {
        neutral: "bg-[#f3f2f2] text-[#706e6b]",
        brand:
          "bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] text-[var(--color-brand-primary)]",
        success: "bg-[#e6f4ea] text-[#145F33]",
        info: "bg-[#e0f2fe] text-[#005EA2]",
        warning: "bg-[#fef3c7] text-[#92400e]",
        error: "bg-[#fce4ec] text-[#A82031]",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface EmptyStateProps extends VariantProps<
  typeof emptyStateIconVariants
> {
  /** The main icon shown in the colored circle. */
  icon: React.ElementType;
  title: string;
  description?: string;
  /** Omit to render with no call-to-action button at all. */
  actionLabel?: string;
  actionIcon?: React.ElementType;
  onAction?: () => void;
  /** Passed straight through to the action Button's variant prop. */
  actionVariant?: React.ComponentProps<
    typeof Button
  >["variant"];
  className?: string;
}

function EmptyState({
  icon: Icon,
  tone,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  actionVariant = "default",
  className,
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center text-center",
        className,
      )}
    >
      <div
        className={cn(emptyStateIconVariants({ tone }), "mb-3")}
      >
        <Icon className="h-7 w-7" />
      </div>
      <p
        style={{
          fontSize: "var(--slds-g-font-size-5)",
          fontWeight: 500,
        }}
      >
        {title}
      </p>
      {description && (
        <p
          className="mt-1 max-w-xs"
          style={{
            fontSize: "var(--slds-g-font-size-4)",
            color: "var(--slds-g-color-text-weak)",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export { EmptyState, emptyStateIconVariants };