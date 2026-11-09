import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react@0.487.0";

import { cn } from "./utils";
import { Button, buttonVariants } from "./button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

// Zero real consumers (both showcase-only) — the "Showing X–Y of Z" count
// and "Page X of Y" indicator were each hand-typed with inline styles at
// 5 separate call sites (Data Table's footer bar, plus 4 Pagination
// pattern cards), always the same font-size/color tokens. Structured
// number props instead of free-form children so every caller gets the
// same bold/muted treatment without re-deriving it.
function PaginationInfo({
  start,
  end,
  total,
  label = "",
  className,
}: {
  start: number;
  end: number;
  total: number;
  /** Trailing noun, e.g. "records" — omit for none. */
  label?: string;
  className?: string;
}) {
  return (
    <span
      data-slot="pagination-info"
      className={cn(
        "text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]",
        className,
      )}
    >
      Showing{" "}
      <strong className="font-semibold text-[var(--slds-g-color-text-default)]">
        {start}–{end}
      </strong>{" "}
      of{" "}
      <strong className="font-semibold text-[var(--slds-g-color-text-default)]">
        {total}
      </strong>
      {label ? ` ${label}` : ""}
    </span>
  );
}

function PaginationPageLabel({
  current,
  total,
  className,
}: {
  current: number;
  total: number;
  className?: string;
}) {
  return (
    <span
      data-slot="pagination-page-label"
      className={cn(
        "text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-default)] whitespace-nowrap",
        className,
      )}
    >
      Page <strong className="font-semibold">{current}</strong> of{" "}
      <strong className="font-semibold">{total}</strong>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  PaginationInfo,
  PaginationPageLabel,
};
