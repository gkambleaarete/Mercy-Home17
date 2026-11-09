"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import {
  cva,
  type VariantProps,
} from "class-variance-authority";

import { cn } from "./utils";

// 24 / 32 / 40 / 48 / 64px — every Avatar size actually used across the
// app's showcase today, named instead of hand-set via className="size-N"
// at each call site.
const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        xs: "size-6",
        sm: "size-8",
        md: "size-10",
        lg: "size-12",
        xl: "size-16",
      },
      // Additive: the white ring + soft shadow of Program Log's youth row.
      outlined: {
        true: "border-2 border-white shadow-sm",
        false: "",
      },
    },
    defaultVariants: { size: "md", outlined: false },
  },
);

// Fallback text scales with the same size steps as Avatar itself, so the
// initials never need a manual font-size override to look right.
const avatarFallbackVariants = cva(
  "flex size-full items-center justify-center rounded-full font-medium",
  {
    variants: {
      size: {
        xs: "text-[10px]",
        sm: "text-xs",
        md: "text-xs",
        lg: "text-xs",
        xl: "text-xl",
      },
      // Named after this app's real brand tokens (--color-brand-primary
      // etc., see globals.css) rather than inventing a separate palette —
      // these are the same 5 colors already used for per-role avatars.
      color: {
        neutral: "bg-muted text-muted-foreground",
        primary: "bg-[var(--color-brand-primary)] text-white",
        secondary:
          "bg-[var(--color-brand-secondary)] text-white",
        tertiary: "bg-[var(--color-brand-tertiary)] text-white",
        accent: "bg-[var(--color-brand-accent)] text-white",
        info: "bg-[var(--color-link-blue)] text-white",
        // Additive: Program Log's youth avatar (pale green, brand initials).
        "brand-soft":
          "bg-[#d0dfd6] text-[var(--color-brand-primary)] font-semibold",
      },
    },
    // Program Log's 48px youth avatar uses 16px initials.
    compoundVariants: [
      {
        size: "lg",
        color: "brand-soft",
        className: "text-base",
      },
    ],
    defaultVariants: { size: "md", color: "neutral" },
  },
);

function Avatar({
  className,
  size,
  outlined,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        avatarVariants({ size, outlined }),
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  size,
  color,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback> &
  VariantProps<typeof avatarFallbackVariants>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        avatarFallbackVariants({ size, color }),
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };