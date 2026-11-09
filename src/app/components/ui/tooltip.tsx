"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip@1.1.8";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

// "default" (brand green) is the existing, untouched look — 2 real files
// use Tooltip. "dark" is additive: this app's brand-tertiary slate, for
// tooltips that need to read as a neutral system message rather than a
// brand-colored one (e.g. explaining why an action is disabled).
const tooltipContentVariants = cva(
  "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-[length:var(--slds-g-font-size-3)] text-balance",
  {
    variants: {
      tone: {
        default: "bg-primary text-primary-foreground",
        dark: "bg-[var(--color-brand-tertiary)] text-white",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

const tooltipArrowVariants = cva("z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]", {
  variants: {
    tone: {
      default: "bg-primary fill-primary",
      dark: "bg-[var(--color-brand-tertiary)] fill-[var(--color-brand-tertiary)]",
    },
  },
  defaultVariants: { tone: "default" },
});

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  arrowClassName,
  tone,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> &
  VariantProps<typeof tooltipContentVariants> & {
    /** Escape hatch for a one-off arrow color beyond the tone system. */
    arrowClassName?: string;
  }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(tooltipContentVariants({ tone }), className)}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          className={cn(tooltipArrowVariants({ tone }), arrowClassName)}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
