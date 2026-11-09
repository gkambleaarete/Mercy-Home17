import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
  cva,
  type VariantProps,
} from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  // rounded-full lives here, once, for every variant — no per-variant
  // repetition and no call site ever needs to patch shape with its own
  // className. Safe to change from the old rounded-md: every one of the
  // 86 real files using Badge already overrides radius explicitly per
  // instance, so none of them were relying on the bare default anyway.
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // ── Additive only — default/secondary/destructive/outline above
        // are used across 86 real files and keep their exact current
        // meaning. Everything below is new: soft, semantic-tone pills
        // (same tone vocabulary as Alert/Button/EmptyState), self-
        // contained — no inline style or className needed at the call
        // site to get the right color, border, or shape.
        // border-color for these 6 lives ONLY in the compoundVariants
        // below, split by `bordered` — cva concatenates every matching
        // class string rather than overriding, so a border color set here
        // too would leave two conflicting border-color utilities on the
        // element with the winner decided by Tailwind's internal
        // stylesheet order, not by `bordered`.
        accent: "bg-[var(--color-brand-accent)] text-white",
        success: "bg-[#e6f4ea] text-[#145F33]",
        info: "bg-[#e0f2fe] text-[#005EA2]",
        warning: "bg-[#fef3c7] text-[#92400e]",
        error: "bg-[#fce4ec] text-[#A82031]",
        neutral: "bg-[#f3f2f2] text-[#706e6b]",
        // Additive — the purple already used by Admissions' "In Assessment"
        // tone; needed for transition-note meaning in Projections & Waitlist.
        purple: "bg-purple-100 text-purple-700",
        // Additive — soft tints (same look as success/info/warning/…) of the
        // brand Hope Orange and the neutral scale's darkest token, mixed the
        // same way as Button's `soft-*` variants. Needed for the Volunteer
        // Applications "Not Started" / "References Under Review" stages
        // (US 19846) so all stage badges share one soft style.
        orange:
          "bg-[color-mix(in_srgb,var(--color-brand-accent)_14%,white)] text-[color:color-mix(in_srgb,var(--color-brand-accent)_70%,black)]",
        dark: "bg-[color-mix(in_srgb,var(--slds-g-color-neutral-base-10)_12%,white)] text-[var(--slds-g-color-neutral-base-10)]",
      },
      // Adds a matching-hue border on top of one of the soft variants
      // above (via the compoundVariants below). Independent of size —
      // either can be combined with either, they're not coupled.
      bordered: {
        true: "",
        false: "",
      },
      // default = 11px (this app's --slds-g-font-size-2 token, "small
      // labels") · lg = 12px (--slds-g-font-size-3, "labels, metadata") —
      // the two sizes already in use in Component Patterns > Status Badges.
      size: {
        default:
          "px-2.5 py-0.5 text-[length:var(--slds-g-font-size-2)]",
        lg: "px-3 py-1 text-[length:var(--slds-g-font-size-3)]",
      },
    },
    compoundVariants: [
      {
        variant: "success",
        bordered: false,
        className: "border-transparent",
      },
      {
        variant: "success",
        bordered: true,
        className: "border-[#a8d5b8]",
      },
      {
        variant: "info",
        bordered: false,
        className: "border-transparent",
      },
      {
        variant: "info",
        bordered: true,
        className: "border-[#7dd3fc]",
      },
      {
        variant: "warning",
        bordered: false,
        className: "border-transparent",
      },
      {
        variant: "warning",
        bordered: true,
        className: "border-[#fcd34d]",
      },
      {
        variant: "error",
        bordered: false,
        className: "border-transparent",
      },
      {
        variant: "error",
        bordered: true,
        className: "border-[#f48fb1]",
      },
      {
        variant: "neutral",
        bordered: false,
        className: "border-transparent",
      },
      {
        variant: "neutral",
        bordered: true,
        className: "border-[#c9c7c5]",
      },
      {
        variant: "purple",
        bordered: false,
        className: "border-transparent",
      },
      {
        variant: "purple",
        bordered: true,
        className: "border-purple-300",
      },
      {
        variant: "orange",
        bordered: false,
        className: "border-transparent",
      },
      {
        variant: "orange",
        bordered: true,
        className:
          "border-[color-mix(in_srgb,var(--color-brand-accent)_40%,white)]",
      },
      {
        variant: "dark",
        bordered: false,
        className: "border-transparent",
      },
      {
        variant: "dark",
        bordered: true,
        className:
          "border-[var(--slds-g-color-neutral-base-60)]",
      },
      {
        variant: "accent",
        bordered: false,
        className: "border-transparent",
      },
      {
        variant: "accent",
        bordered: true,
        className: "border-transparent",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      bordered: false,
    },
  },
);

function Badge({
  className,
  variant,
  size,
  bordered,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(
        badgeVariants({ variant, size, bordered }),
        className,
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };