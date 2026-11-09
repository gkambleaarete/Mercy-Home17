import * as React from "react";
import { ChevronRight } from "@/app/lib/lucide-icons";

import { cn } from "./utils";

export type StatusIndicatorTone =
  | "complete"
  | "in-progress"
  | "not-started"
  | "attention";

export interface StatusIndicatorRowProps {
  label: string;
  meta: string;
  count: number;
  tone: StatusIndicatorTone;
  className?: string;
}

export const STATUS_INDICATOR_TONE: Record<
  StatusIndicatorTone,
  { bg: string; dot: string }
> = {
  complete: { bg: "#d1fae5", dot: "#10b981" },
  "in-progress": { bg: "#fef3c7", dot: "#f59e0b" },
  "not-started": { bg: "#fee2e2", dot: "#ef4444" },
  // Not one of the Medications widget's own computed states (only
  // complete/in-progress/not-started are real) -- an extra tier for
  // other dashboard widgets elsewhere that need a 4th "needs attention"
  // level, using this app's existing accent orange.
  attention: { bg: "#fde8d7", dot: "#E86C24" },
};

// Zero real consumers -- the colored dashboard-card row (dot + label/meta +
// count + chevron, tinted by completion status) was hand-copied identically
// 7 times across 3 showcase cards (Medications widget, Program Detail
// sidebar pattern).
function StatusIndicatorRow({
  label,
  meta,
  count,
  tone,
  className,
}: StatusIndicatorRowProps) {
  const t = STATUS_INDICATOR_TONE[tone];
  return (
    <div
      className={cn("flex items-center justify-between p-2.5 rounded", className)}
      style={{ backgroundColor: t.bg, border: `1px solid ${t.dot}40` }}
    >
      <div className="flex items-center gap-2.5">
        <div className="rounded-full flex-shrink-0 w-2.5 h-2.5" style={{ backgroundColor: t.dot }} />
        <div>
          <div className="text-xs font-medium mb-0.5 text-[var(--slds-g-color-text-default)]">
            {label}
          </div>
          <div className="text-[10px] text-[var(--slds-g-color-text-weak)]">
            {meta}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-base font-bold text-[var(--slds-g-color-text-default)]">
          {count}
        </span>
        <ChevronRight className="h-4 w-4 text-[var(--slds-g-color-text-weak)]" />
      </div>
    </div>
  );
}

export { StatusIndicatorRow };
