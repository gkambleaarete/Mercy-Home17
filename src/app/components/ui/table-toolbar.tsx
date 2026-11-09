import * as React from "react";
import { ChevronLeft, ChevronRight } from "@/app/lib/lucide-icons";

import { cn } from "./utils";
import { CardFooter, CardHeader } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationInfo,
  PaginationPageLabel,
} from "./pagination";

export interface TableToolbarAction {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

export interface TableToolbarProps {
  title: string;
  /** Omit to render with no count pill at all. */
  count?: number;
  countLabel?: string;
  /** Icon-only actions on the right (Filter/Refresh/Download, etc). */
  actions?: TableToolbarAction[];
  /** Additive: extra controls on the right, after the icon actions (e.g. a
   *  labelled Export button). */
  children?: React.ReactNode;
  /** Additive: controls on the far left, right after the title (e.g. Export). */
  leading?: React.ReactNode;
  /** Additive: announce title changes (result counts) to screen readers. */
  live?: boolean;
  className?: string;
}

// A CardHeader, not a boxed component of its own — meant to sit as the
// first child inside the same <Card variant="container"> that also holds
// the Table body (and, later, a footer bar), so the three assemble into
// one real data table instead of each being its own separate box.
function TableToolbar({
  title,
  count,
  countLabel = "items",
  actions,
  children,
  leading,
  live,
  className,
}: TableToolbarProps) {
  return (
    <CardHeader
      size="sm"
      // flex-wrap: at narrow widths (1024px) the actions drop to their own
      // row instead of being clipped by the Card's overflow-hidden. A single
      // row that already fits (desktop) renders exactly as before.
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 min-w-0",
        className,
      )}
    >
      <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
        <span
          className="text-[length:var(--slds-g-font-size-5)] font-medium text-[var(--slds-g-color-text-default)]"
          role={live ? "status" : undefined}
          aria-live={live ? "polite" : undefined}
        >
          {title}
        </span>
        {count != null && (
          <Badge variant="success">
            {count} {countLabel}
          </Badge>
        )}
        {leading}
      </div>
      {((actions && actions.length > 0) || children) && (
        <div className="flex flex-wrap items-center gap-1 min-w-0">
          {(actions ?? []).map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              size="icon-xs"
              className="text-[var(--slds-g-color-text-weak)]"
              title={action.label}
              aria-label={action.label}
              onClick={action.onClick}
            >
              <action.icon className="h-4 w-4" />
            </Button>
          ))}
          {children}
        </div>
      )}
    </CardHeader>
  );
}

export interface TablePaginationBarProps {
  start: number;
  end: number;
  total: number;
  /** Trailing noun after the total, e.g. "records" — omit for none. */
  countLabel?: string;
  currentPage: number;
  totalPages: number;
  onPrevious?: () => void;
  onNext?: () => void;
  /** Defaults to currentPage <= 1 / >= totalPages when omitted. */
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  className?: string;
}

// No background, border, or padding of its own — a bare flex row, so it
// drops cleanly into whatever spacing the caller's own layout already
// provides instead of imposing its own chrome on top.
function TablePaginationBar({
  start,
  end,
  total,
  countLabel = "",
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  previousDisabled,
  nextDisabled,
  className,
}: TablePaginationBarProps) {
  const isPreviousDisabled =
    previousDisabled ?? currentPage <= 1;
  const isNextDisabled =
    nextDisabled ?? currentPage >= totalPages;

  return (
    <div
      className={cn(
        "flex items-center justify-between",
        className,
      )}
    >
      <PaginationInfo
        start={start}
        end={end}
        total={total}
        label={countLabel}
      />
      <Pagination className="w-auto mx-0">
        <PaginationContent className="gap-3">
          <PaginationItem>
            <Button
              variant="outline"
              size="icon-xs"
              className="text-[var(--slds-g-color-text-weak)]"
              onClick={onPrevious}
              disabled={isPreviousDisabled}
              title="Previous page"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <PaginationPageLabel
              current={currentPage}
              total={totalPages}
            />
          </PaginationItem>
          <PaginationItem>
            <Button
              variant="outline"
              size="icon-xs"
              className="text-[var(--slds-g-color-text-weak)]"
              onClick={onNext}
              disabled={isNextDisabled}
              title="Next page"
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

// The Data Table's footer band (DTB-05): the compact separated CardFooter
// holding the pagination bar, or just the count when everything fits on one
// page. Sits as the last child of the same <Card variant="container">.
function TableFooterBar({
  className,
  ...bar
}: TablePaginationBarProps) {
  return (
    <CardFooter size="sm" separated className={className}>
      {bar.totalPages > 1 ? (
        <TablePaginationBar className="w-full" {...bar} />
      ) : (
        <PaginationInfo
          start={bar.start}
          end={bar.end}
          total={bar.total}
          label={bar.countLabel}
        />
      )}
    </CardFooter>
  );
}

export { TableToolbar, TablePaginationBar, TableFooterBar };