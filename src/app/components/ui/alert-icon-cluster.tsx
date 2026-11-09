import * as React from "react";
import { Flower, Stethoscope, Apple } from "@/app/lib/lucide-icons";

import { cn } from "./utils";
import { Button } from "./button";

export type AlertIconKind =
  "restraints" | "medical" | "dietary";

// bg/fg/hoverBg are the source of truth (also used by anything that needs
// the raw values, e.g. a "Copy CSS" button); className is just those same
// 3 values pre-written as static Tailwind arbitrary-value classes so
// Tailwind's build-time scanner can actually find them (it can't discover
// a class assembled from a runtime template string).
const ALERT_ICON_META: Record<
  AlertIconKind,
  {
    icon: React.ElementType;
    label: string;
    bg: string;
    fg: string;
    hoverBg: string;
    className: string;
  }
> = {
  restraints: {
    icon: Flower,
    label: "Active Restraints",
    bg: "#fef2f2",
    fg: "#c23934",
    hoverBg: "#fee2e2",
    className: "bg-[#fef2f2] text-[#c23934] hover:bg-[#fee2e2]",
  },
  medical: {
    icon: Stethoscope,
    label: "Medical Needs",
    bg: "#e8f0fd",
    fg: "#1e3a5f",
    hoverBg: "#d0e2fb",
    className: "bg-[#e8f0fd] text-[#1e3a5f] hover:bg-[#d0e2fb]",
  },
  dietary: {
    icon: Apple,
    label: "Dietary Needs",
    bg: "#e8f0fd",
    fg: "#1e3a5f",
    hoverBg: "#d0e2fb",
    className: "bg-[#e8f0fd] text-[#1e3a5f] hover:bg-[#d0e2fb]",
  },
};

export interface AlertIconClusterProps {
  /** Which of the 3 alert types to render, in order. Real usage renders
   * each conditionally on whether that type has any records -- pass only
   * the kinds that apply. */
  kinds: AlertIconKind[];
  className?: string;
}

// Matches YouthAlertIcons.tsx (src/app/components/youth/YouthAlertIcons.tsx),
// the real component this pattern is modeled on -- up to 3 circular icon
// buttons next to a youth's name (restraints/medical/dietary), each
// independently conditional. Zero real consumers of this exact showcase
// component, but it was hand-copied twice already within the showcase
// itself (the full cluster demo and the Record Header composite) with
// inline style={{backgroundColor, color}} at every Button instead of a
// shared color lookup.
function AlertIconCluster({
  kinds,
  className,
}: AlertIconClusterProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {kinds.map((kind) => {
        const meta = ALERT_ICON_META[kind];
        const Icon = meta.icon;
        return (
          <Button
            key={kind}
            variant="ghost"
            size="icon"
            title={meta.label}
            aria-label={meta.label}
            className={meta.className}
          >
            <Icon className="h-5 w-5" />
          </Button>
        );
      })}
    </div>
  );
}

export { AlertIconCluster, ALERT_ICON_META };