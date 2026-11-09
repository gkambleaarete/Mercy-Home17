import * as React from "react";

import { cn } from "./utils";

export type TimelineTone = "success" | "info" | "accent";

export interface TimelineEntry {
  icon: React.ElementType;
  tone: TimelineTone;
  title: string;
  time: string;
  detail: string;
}

export interface TimelineProps {
  items: TimelineEntry[];
  className?: string;
}

const TIMELINE_TONE: Record<TimelineTone, { bg: string; fg: string }> = {
  success: { bg: "#e6f4ea", fg: "#145F33" },
  info: { bg: "#e0f2fe", fg: "#005EA2" },
  accent: { bg: "#fef3c7", fg: "#E86C24" },
};

// Zero real consumers -- vertical activity timeline (icon-in-circle
// connected by a line, title/time/detail per entry), previously
// hand-assembled entirely at the call site with the tone->color mapping
// repeated per item instead of centralized.
function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {items.map((item, i) => {
        const Icon = item.icon;
        const tone = TIMELINE_TONE[item.tone];
        const isLast = i === items.length - 1;
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: tone.bg }}
              >
                <Icon className="h-4 w-4" style={{ color: tone.fg }} />
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 my-1 bg-[var(--slds-g-color-border-base-3)]" />
              )}
            </div>
            <div className="pb-5">
              <p className="text-[length:var(--slds-g-font-size-4)] font-medium">
                {item.title}
              </p>
              <p className="text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">
                {item.time}
              </p>
              <p className="mt-1 text-[length:var(--slds-g-font-size-4)] text-[var(--slds-g-color-text-weak)]">
                {item.detail}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { Timeline };
