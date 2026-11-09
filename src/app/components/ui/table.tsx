"use client";

import * as React from "react";
import {
  cva,
  type VariantProps,
} from "class-variance-authority";

import { cn } from "./utils";

// `containerClassName` is additive and optional: a table that needs its own
// two-axis scroll area (e.g. a sticky header over a height-limited grid)
// sets it on the container, which is what actually scrolls. Omitted, the
// container renders exactly as before.
function Table({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<"table"> & {
  containerClassName?: string;
}) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        "relative w-full overflow-x-auto",
        containerClassName,
      )}
    >
      <table
        data-slot="table"
        className={cn(
          "w-full caption-bottom text-sm",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function TableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b-0", className)}
      {...props}
    />
  );
}

function TableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({
  className,
  ...props
}: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

// hoverable defaults to true (existing, untouched behavior for every real
// consumer). It's additive: a header row hand-suppressing the hover
// highlight via className="hover:bg-transparent" recurs at 10+ real call
// sites (always a TableRow inside TableHeader) -- hoverable={false} is the
// same result through a real prop instead of a one-off className fighting
// the base class.
// `tone` is additive (default = no tint). "accent" is a subtle, opaque
// brand-orange row tint — Projections & Waitlist uses it for Readmit youth.
// Sticky cells inside a toned row should use bg-inherit to keep the tint.
const tableRowToneClasses = {
  default: "",
  accent: "bg-orange-50 hover:bg-orange-100",
} as const;

function TableRow({
  className,
  hoverable = true,
  tone = "default",
  ...props
}: React.ComponentProps<"tr"> & {
  hoverable?: boolean;
  tone?: keyof typeof tableRowToneClasses;
}) {
  return (
    <tr
      data-slot="table-row"
      data-tone={tone === "default" ? undefined : tone}
      className={cn(
        "data-[state=selected]:bg-muted border-b transition-colors",
        hoverable && "hover:bg-muted/50",
        tableRowToneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

// "default" (existing, untouched) is used across 33 real files. "slds" is
// additive: the uppercase/tinted-background sortable-header look used in
// Component Patterns > Data Table — previously ~9 inline style properties
// hand-copied at every header cell. `active` (sorted-column) just swaps
// the text color via compoundVariants rather than a separate near-
// duplicate variant string.
const tableHeadVariants = cva(
  "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
  {
    variants: {
      variant: {
        default: "",
        slds: "h-auto px-4 py-2.5 text-[length:var(--slds-g-font-size-2)] uppercase tracking-wide [&_button]:[text-transform:inherit] border-b-2 border-[var(--slds-g-color-border-base-1)] bg-[var(--slds-g-color-background-alt-2)]",
      },
      active: {
        true: "",
        false: "",
      },
      // Additive. "default" keeps the slds header's 11px
      // (--slds-g-font-size-2); "md" is the 12px (--slds-g-font-size-3)
      // header the Friends First search tables call for. Declared after
      // `variant`, so cn()'s tailwind-merge keeps this size over the
      // variant's own.
      size: {
        default: "",
        md: "text-[length:var(--slds-g-font-size-3)]",
      },
    },
    // The slds-header text color lives ONLY here, split by `active` — cva
    // concatenates every matching class string rather than overriding, so
    // setting a color in `variant.slds` AND again here would leave two
    // conflicting text-color utilities on the element with the winner
    // decided by Tailwind's internal stylesheet order, not by `active`.
    compoundVariants: [
      {
        variant: "slds",
        active: false,
        className: "text-[var(--slds-g-color-text-weak)]",
      },
      {
        variant: "slds",
        active: true,
        className: "text-[var(--color-brand-primary)]",
      },
    ],
    defaultVariants: {
      variant: "default",
      active: false,
      size: "default",
    },
  },
);

function TableHead({
  className,
  variant,
  active,
  size,
  ...props
}: React.ComponentProps<"th"> &
  VariantProps<typeof tableHeadVariants>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        tableHeadVariants({ variant, active, size }),
        className,
      )}
      {...props}
    />
  );
}

// "default" (existing, untouched) is used across 33 real files. "muted"
// is additive — smaller, gray placeholder-row text (e.g. "— rows —" in a
// pattern preview), previously the same 3 inline style properties
// repeated at every placeholder cell. `wrap` is additive too (off by
// default): it lets a long text cell break onto more lines when the table
// is narrower than its content, instead of forcing horizontal scroll.
const tableCellVariants = cva(
  "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
  {
    variants: {
      tone: {
        default: "",
        muted:
          "px-4 py-2 text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]",
      },
      wrap: {
        true: "whitespace-normal",
        false: "",
      },
    },
    defaultVariants: { tone: "default", wrap: false },
  },
);

function TableCell({
  className,
  tone,
  wrap,
  ...props
}: Omit<React.ComponentProps<"td">, "wrap"> &
  VariantProps<typeof tableCellVariants>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        tableCellVariants({ tone, wrap }),
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        "text-muted-foreground mt-4 text-sm",
        className,
      )}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};