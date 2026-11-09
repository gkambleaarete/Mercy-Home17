import * as React from "react";
import { Star } from "@/app/lib/lucide-icons";

import { cn } from "./utils";

export interface StarRatingProps {
  value: number;
  onHover?: (n: number) => void;
  onSelect?: (n: number) => void;
  size?: number;
  readOnly?: boolean;
  className?: string;
  /**
   * Additive, optional: accessible name. Interactive ratings become a
   * labelled radio group (one radio per star); read-only ratings become a
   * labelled image ("3 of 5"). Omit for the original unlabelled behavior.
   */
  label?: string;
  /** Additive, optional: meaning of each star (index 0 = 1 star). */
  optionLabels?: readonly string[];
}

// Zero real consumers -- was a page-local helper (Stars) inside the VMS
// showcase file, not something another file could import.
function StarRating({
  value,
  onHover,
  onSelect,
  size = 20,
  readOnly,
  className,
  label,
  optionLabels,
}: StarRatingProps) {
  const star = (n: number) => (
    <Star
      width={size}
      height={size}
      aria-hidden
      className={
        n <= value
          ? "text-[#b28500] fill-[#b28500]"
          : "text-[#dddbda] fill-transparent"
      }
    />
  );
  const meaning = (n: number) => optionLabels?.[n - 1];

  if (readOnly && label)
    return (
      <div
        role="img"
        aria-label={`${label}: ${value} of 5${meaning(value) ? ` (${meaning(value)})` : ""}`}
        className={cn("flex items-center gap-1", className)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className="inline-flex leading-none">
            {star(n)}
          </span>
        ))}
      </div>
    );

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role={label ? "radiogroup" : undefined}
      aria-label={label}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          role={label ? "radio" : undefined}
          aria-checked={label ? n === value : undefined}
          aria-label={
            label
              ? `${n} star${n > 1 ? "s" : ""}${meaning(n) ? ` – ${meaning(n)}` : ""}`
              : undefined
          }
          onMouseEnter={() => onHover?.(n)}
          onMouseLeave={() => onHover?.(0)}
          onClick={() => onSelect?.(n)}
          className={cn(
            "inline-flex leading-none bg-transparent border-0 p-0 rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            readOnly ? "cursor-default" : "cursor-pointer",
          )}
          title={
            readOnly
              ? undefined
              : (meaning(n) ??
                `Rate ${n} star${n > 1 ? "s" : ""}`)
          }
        >
          {star(n)}
        </button>
      ))}
    </div>
  );
}

export { StarRating };