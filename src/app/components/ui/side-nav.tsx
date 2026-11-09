import * as React from "react";
import { ChevronDown, ChevronUp } from "@/app/lib/lucide-icons";

import { cn } from "./utils";

// Module-level left nav used inside feature areas with multiple pages and
// hierarchy (e.g. Medications). Zero real consumers of this exact component
// yet, but the L1/group/L2 button markup below was hand-copied 4 times
// across the showcase (one per isolated state, plus again inside the
// working assembly demo) with the active/inactive styling re-derived by
// hand at each site.

function SideNav({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-56 border border-[var(--slds-g-color-border-base-1)] bg-[var(--slds-g-color-background-alt)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

const navItemBase =
  "w-full text-left text-[13px] font-medium leading-tight border-l-[3px] transition-colors";
const navItemTone = {
  active: "bg-[var(--color-brand-primary)] text-white border-l-[#0e4524]",
  inactive:
    "bg-transparent text-[var(--slds-g-color-text-default)] border-l-transparent hover:bg-[var(--slds-g-color-background-row-hover)]",
};

function SideNavItem({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        navItemBase,
        "px-4 py-2",
        active ? navItemTone.active : navItemTone.inactive,
        className,
      )}
    >
      {children}
    </button>
  );
}

// A top-level item that owns children (e.g. Med Review Hub). `active`
// fires when any of its own children is the current selection, not just
// itself -- the caller decides that, this just renders the state.
function SideNavGroup({
  active,
  expanded,
  onClick,
  label,
  children,
  className,
}: {
  active?: boolean;
  expanded: boolean;
  onClick?: () => void;
  label: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          navItemBase,
          "px-4 py-2 flex items-center justify-between",
          active ? navItemTone.active : navItemTone.inactive,
          className,
        )}
      >
        <span>{label}</span>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
        )}
      </button>
      {expanded && children}
    </>
  );
}

// Indented child item shown only while its parent group is expanded --
// a light green tint (not solid fill like an active L1), visually
// distinct from an active top-level item.
function SideNavSubItem({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        navItemBase,
        "pl-8 pr-4 py-1.5",
        active
          ? "bg-[rgba(20,95,51,0.12)] text-[var(--color-brand-primary)] border-l-[var(--color-brand-primary)]"
          : navItemTone.inactive,
        className,
      )}
    >
      {children}
    </button>
  );
}

function SideNavSectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "px-4 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--slds-g-color-text-weak)]",
        className,
      )}
    >
      {children}
    </p>
  );
}

export {
  SideNav,
  SideNavItem,
  SideNavGroup,
  SideNavSubItem,
  SideNavSectionLabel,
};
