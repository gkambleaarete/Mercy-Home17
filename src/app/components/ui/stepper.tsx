import * as React from "react";
import { Check } from "@/app/lib/lucide-icons";

import { cn } from "./utils";

export type StepStatus = "completed" | "current" | "upcoming";

export interface Step {
  label: string;
  status: StepStatus;
}

export interface StepperProps {
  steps: Step[];
  /** "chevron" = full-width arrow-segmented pipeline tracker (record
   * headers). "dot" = numbered circular steps with connector lines
   * (compact process indicators). Same step-status color logic either
   * way, just two real, distinct visual treatments. */
  variant?: "chevron" | "dot";
  className?: string;
}

export const CHEVRON_TONE: Record<StepStatus, { bg: string; fg: string }> = {
  completed: { bg: "#C8E6C9", fg: "#1B5E20" },
  current: { bg: "var(--color-brand-primary)", fg: "#ffffff" },
  upcoming: { bg: "#E5E5E5", fg: "#6b7280" },
};

function ChevronStepper({
  steps,
  className,
}: {
  steps: Step[];
  className?: string;
}) {
  return (
    <div className={cn("w-full overflow-x-auto pb-2", className)}>
      <div className="flex min-w-[600px] gap-0.5 rounded-full overflow-hidden">
        {steps.map((step, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === steps.length - 1;
          const notch = "12px";
          let clipPath = `polygon(0 0, calc(100% - ${notch}) 0, 100% 50%, calc(100% - ${notch}) 100%, 0 100%, ${notch} 50%)`;
          if (isFirst) {
            clipPath = `polygon(0 0, calc(100% - ${notch}) 0, 100% 50%, calc(100% - ${notch}) 100%, 0 100%)`;
          } else if (isLast) {
            clipPath = `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${notch} 50%)`;
          }
          const tone = CHEVRON_TONE[step.status];
          return (
            <div
              key={step.label}
              className="flex-1 min-h-10 flex items-center justify-center gap-1.5 py-1.5 font-bold uppercase tracking-wider"
              style={{
                clipPath,
                backgroundColor: tone.bg,
                color: tone.fg,
                fontSize: "var(--slds-g-font-size-2)",
              }}
            >
              <span className="px-2 text-center leading-tight">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const DOT_TONE: Record<
  StepStatus,
  { bg: string; fg: string; border?: string }
> = {
  completed: { bg: "var(--color-brand-primary)", fg: "#ffffff" },
  current: {
    bg: "#e6f4ea",
    fg: "var(--color-brand-primary)",
    border: "2px solid var(--color-brand-primary)",
  },
  upcoming: {
    bg: "var(--slds-g-color-background-alt-2)",
    fg: "var(--slds-g-color-text-weak)",
  },
};

function DotStepper({
  steps,
  className,
}: {
  steps: Step[];
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {steps.map((step, i) => {
        const tone = DOT_TONE[step.status];
        return (
          <div key={step.label} className="flex items-center gap-1 flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: tone.bg,
                  color: tone.fg,
                  border: tone.border,
                }}
              >
                {step.status === "completed" ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span className="text-[10px] font-medium">{i + 1}</span>
                )}
              </div>
              <span
                className="mt-1 text-center text-[10px]"
                style={{
                  color:
                    step.status === "upcoming"
                      ? "var(--slds-g-color-text-weak)"
                      : "var(--color-brand-primary)",
                  fontWeight: step.status === "current" ? 500 : 400,
                }}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="h-0.5 flex-1 -mt-4"
                style={{
                  backgroundColor:
                    step.status === "completed"
                      ? "var(--color-brand-primary)"
                      : "#dddbda",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Zero real consumers yet -- both the chevron pipeline tracker (Admissions
// Lead Detail) and the dot stepper were hand-copied at every showcase call
// site (3 places for chevron alone: standalone demo, segment-states demo,
// and the Record Header composite). One component, one status→color
// mapping per variant, instead of three independent copies drifting apart.
function Stepper({ steps, variant = "chevron", className }: StepperProps) {
  return variant === "dot" ? (
    <DotStepper steps={steps} className={className} />
  ) : (
    <ChevronStepper steps={steps} className={className} />
  );
}

export { Stepper };
