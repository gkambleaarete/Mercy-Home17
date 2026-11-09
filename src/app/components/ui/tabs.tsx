"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs@1.1.3";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

// "pill" (default) is the existing look — 32 real files use Tabs and rely
// on this exact segmented-control style, untouched. "underline" is
// additive: a bottom-border indicator style, previously hand-built with
// ~10 utility classes copy-pasted at every call site (Card > Tabs,
// Tab Indicators).
// bg/border live ONLY in the compoundVariants below, never in
// `variant.underline` itself — cva concatenates every matching class
// string rather than overriding, so a bg/border set in both places
// would leave two conflicting utilities on the element with the
// winner decided by Tailwind's internal stylesheet order, not by
// which one is "supposed" to apply.
//
// The separated border is an INSET box-shadow, not a real border utility
// — a real `border-b` consumes box height, which pushes every trigger's
// own content up inside a shorter content-box than the list's h-11,
// so a trigger's own bottom edge (and its active indicator, see
// tabsTriggerVariants below) no longer lines up with the list's true
// bottom edge. An inset shadow paints at the edge without taking any
// layout space, so triggers can genuinely fill the full height.
const tabsListVariants = cva("", {
  variants: {
    variant: {
      pill: "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px]",
      underline:
        "text-foreground inline-flex w-full items-center justify-start rounded-none p-0",
    },
    // Same concept as CardHeader's `separated` prop — an underline tab
    // bar sitting on a card's own alt-surface header band (e.g. a
    // tabbed card) instead of directly on the page background.
    separated: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      variant: "underline",
      separated: true,
      className:
        "bg-[var(--slds-g-color-background-alt)] h-11 shadow-[inset_0_-1px_0_0_var(--slds-g-color-border-base-1)]",
    },
  ],
  defaultVariants: { variant: "pill", separated: false },
});

function TabsList({
  className,
  variant,
  separated,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(tabsListVariants({ variant, separated }), className)}
      {...props}
    />
  );
}

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        pill: "data-[state=active]:bg-card dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground h-[calc(100%-1px)] flex-1 rounded-xl border border-transparent px-2 py-1 text-sm focus-visible:ring-[3px] focus-visible:outline-1",
        // The active indicator is an absolutely-positioned after:
        // pseudo-element, not a real border — a real border-b consumes
        // box height, so on a trigger sized h-full to match its list
        // (see tabsListVariants above) that height would come out of
        // the trigger's own content box, leaving the indicator sitting
        // a few px above the list's true bottom edge instead of flush
        // with it. position:absolute + bottom-0 takes it out of flow
        // entirely, so it always sits exactly at the trigger's real
        // bottom edge regardless of its height.
        underline:
          "relative rounded-none px-4 pb-2 h-full flex-none shadow-none data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-brand-primary)] data-[state=active]:font-medium text-[var(--slds-g-color-text-weak)] font-normal outline-none after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-transparent data-[state=active]:after:bg-[var(--color-brand-primary)]",
      },
      size: {
        default: "text-[length:var(--slds-g-font-size-5)]",
        sm: "text-[length:var(--slds-g-font-size-4)]",
      },
    },
    defaultVariants: { variant: "pill", size: "default" },
  },
);

function TabsTrigger({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> &
  VariantProps<typeof tabsTriggerVariants>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant, size }), className)}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
