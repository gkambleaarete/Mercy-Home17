import * as React from "react";

import { cn } from "./utils";
import { Button } from "./button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

interface OverflowListProps {
  items: readonly string[];
  /** Shown when `items` is empty. */
  emptyText?: string;
  /** Heading inside the full-list popover, e.g. "Community Needs". */
  label?: string;
  className?: string;
  /** Additive: never show more than this many before "+N" (e.g. 1). */
  maxVisible?: number;
}

// Comma-separated values that never grow past their container: measures the
// real text widths and shows as many values as fit, followed by ", +N"
// (N = actual hidden count). Hovering, focusing or clicking "+N" opens a
// Popover listing every value. Width comes from the parent (e.g. a
// max-width table cell); the row never wraps, so row height is unchanged.
function OverflowList({
  items,
  emptyText = "—",
  label,
  className,
  maxVisible,
}: OverflowListProps) {
  const cap = (n: number) =>
    maxVisible ? Math.min(n, Math.max(1, maxVisible)) : n;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const measureRef = React.useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = React.useState(
    cap(items.length),
  );
  const [open, setOpen] = React.useState(false);
  const closeTimer = React.useRef<number>();

  const recompute = React.useCallback(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    const available = container.clientWidth;
    const widths = Array.from(
      measure.querySelectorAll<HTMLElement>("[data-item]"),
    ).map((s) => s.offsetWidth);
    // Widest possible indicator (", +N" with N = all items) as the reserve.
    const reserve =
      measure.querySelector<HTMLElement>("[data-more]")
        ?.offsetWidth ?? 0;
    const sep =
      measure.querySelector<HTMLElement>("[data-sep]")
        ?.offsetWidth ?? 0;
    const total =
      widths.reduce((a, b) => a + b, 0) +
      sep * (widths.length - 1);
    if (total <= available) {
      setVisibleCount(cap(items.length));
      return;
    }
    let used = 0;
    let count = 0;
    for (const w of widths) {
      const next = used + (count ? sep : 0) + w;
      if (next + reserve > available) break;
      used = next;
      count++;
    }
    // Always show at least one value (it truncates with an ellipsis).
    setVisibleCount(cap(Math.max(1, count)));
  }, [items]);

  React.useLayoutEffect(() => {
    recompute();
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined")
      return;
    const ro = new ResizeObserver(recompute);
    ro.observe(container);
    return () => ro.disconnect();
  }, [recompute]);

  React.useEffect(
    () => () => window.clearTimeout(closeTimer.current),
    [],
  );

  if (items.length === 0) {
    return (
      <span
        className={cn(
          "text-[var(--slds-g-color-text-weak)]",
          className,
        )}
      >
        {emptyText}
      </span>
    );
  }

  const hidden = items.length - visibleCount;
  const visibleText = items.slice(0, visibleCount).join(", ");

  // Hover opens/closes with a short grace period so the pointer can move
  // from "+N" into the popover; click and keyboard use Popover's own toggle.
  const hoverOpen = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hoverClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(
      () => setOpen(false),
      150,
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex min-w-0 items-center whitespace-nowrap",
        className,
      )}
    >
      {/* Off-screen measurement copy */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="invisible absolute left-0 top-0 flex whitespace-nowrap pointer-events-none"
      >
        {items.map((item) => (
          <span key={item} data-item>
            {item}
          </span>
        ))}
        <span data-sep>,&nbsp;</span>
        <span data-more>,&nbsp;+{items.length}</span>
      </div>

      <span className="min-w-0 truncate">{visibleText}</span>
      {hidden > 0 && (
        <>
          <span aria-hidden="true" className="shrink-0">
            ,&nbsp;
          </span>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="link-info"
                className="h-auto shrink-0 p-0 font-normal text-[length:inherit]"
                aria-label={`+${hidden} more. Show all ${items.length}${label ? ` ${label}` : ""}`}
                onPointerEnter={hoverOpen}
                onPointerLeave={hoverClose}
              >
                +{hidden}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-auto max-w-[min(20rem,calc(100vw-2rem))] p-3"
              onPointerEnter={hoverOpen}
              onPointerLeave={hoverClose}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              {label && (
                <p className="mb-1.5 text-[length:var(--slds-g-font-size-2)] font-semibold uppercase tracking-wide text-[var(--slds-g-color-text-weak)]">
                  {label}
                </p>
              )}
              <ul className="space-y-1 text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-default)]">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );
}

export { OverflowList };