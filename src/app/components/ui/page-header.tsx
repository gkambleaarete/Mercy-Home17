import * as React from "react";

import { cn } from "./utils";

export interface PageHeaderProps {
  /** Icon shown in the brand tile. */
  icon: React.ElementType;
  /** Small uppercase line above the title (module / section name). */
  eyebrow?: string;
  title: string;
  /** Right-aligned actions (icon buttons, etc.). */
  actions?: React.ReactNode;
  className?: string;
}

// The standard list/search page header band, promoted from the copy that
// Incident Reports, Admissions, Program Log and the Friends First search
// screens each retyped inline. Built only from tokens: --slds-g-color-
// background-alt-2 surface, border-base-1 bottom edge, shadow-1 elevation,
// the brand tile (card radius, Mercy Green) and the responsive --app-*
// spacing, so a token change reaches every page that uses it.
function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        "app-page-x border-b border-[var(--slds-g-color-border-base-1)] bg-[var(--slds-g-color-background-alt-2)] py-[var(--slds-c-spacing-medium)]",
        className,
      )}
      style={{ boxShadow: "var(--slds-g-shadow-1)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-[var(--app-content-gap)]">
        <div className="flex items-center gap-[var(--slds-c-spacing-small)]">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-[var(--slds-c-card-radius-border)] bg-[var(--color-brand-primary)] text-[var(--slds-g-color-text-inverse)]"
            style={{ boxShadow: "var(--slds-g-shadow-1)" }}
          >
            <Icon className="size-6" aria-hidden="true" />
          </div>
          <div>
            {eyebrow && (
              <p className="slds-text-3 font-medium uppercase tracking-wide text-[var(--slds-g-color-text-weak)]">
                {eyebrow}
              </p>
            )}
            <h1 className="slds-page-header-title text-[var(--slds-g-color-text-default)]">
              {title}
            </h1>
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-[var(--app-control-gap)]">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

export { PageHeader };