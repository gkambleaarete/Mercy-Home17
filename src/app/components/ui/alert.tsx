import * as React from "react";
import { XIcon } from "@/app/lib/lucide-icons";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const alertVariants = cva(
  "group relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
        // Additive — existing default/destructive untouched. These give
        // callers a real semantic tone instead of hand-rolling bg/border/
        // text color per instance (see Component Patterns > Alerts).
        success:
          "bg-[#e6f4ea] border-[#a8d5b8] text-[#145F33] [&>svg]:text-current *:data-[slot=alert-description]:text-[#145F33]/80",
        info:
          "bg-[#e0f2fe] border-[#7dd3fc] text-[#005EA2] [&>svg]:text-current *:data-[slot=alert-description]:text-[#005EA2]/80",
        warning:
          "bg-[#fef3c7] border-[#fcd34d] text-[#92400e] [&>svg]:text-current *:data-[slot=alert-description]:text-[#92400e]/80",
        // Not the same as "destructive" above (kept untouched on purpose —
        // it's text-only red on a plain card, no tinted background). This
        // one matches the success/info/warning pattern: a colored block,
        // consistent with the rest of the row in Component Patterns > Alerts.
        error:
          "bg-[#fce4ec] border-[#f48fb1] text-[#A82031] [&>svg]:text-current *:data-[slot=alert-description]:text-[#A82031]/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface AlertProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof alertVariants> {
  /** Renders a dismiss (X) button, top-right, styled to match variant. */
  dismissible?: boolean;
  onDismiss?: () => void;
  /**
   * A single inline call-to-action, rendered as an underlined text link
   * in the alert's own semantic color -- for nudging the user back into
   * a task ("Resume", "View timeline") rather than just reporting a
   * static state. Same idea as the Actionable Banner pattern, brought
   * into Alert itself as an optional prop instead of a separate
   * component -- omit it for a plain alert.
   */
  action?: { label: string; onClick?: () => void };
  /**
   * Extra controls in the same top-right corner as the dismiss button
   * (e.g. a page's own dev-tool overlay) — an escape hatch for cases
   * that aren't part of Alert's own concern, without the caller having
   * to hand-roll absolute positioning to place them correctly.
   */
  actions?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant,
      dismissible,
      onDismiss,
      action,
      actions,
      children,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      data-slot="alert"
      role="alert"
      className={cn(
        alertVariants({ variant }),
        // A text action link is wider than the dismiss button alone and
        // varies with its label -- reserve more room so title/description
        // text can never end up running underneath it.
        action ? "pr-28" : (dismissible || actions) && "pr-11",
        className,
      )}
      {...props}
    >
      {children}
      {(dismissible || actions || action) && (
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="text-[length:var(--slds-g-font-size-3)] font-semibold underline underline-offset-2"
            >
              {action.label}
            </button>
          )}
          {actions}
          {dismissible && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="p-1 rounded hover:bg-black/10"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  ),
);
Alert.displayName = "Alert";

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight text-[length:var(--slds-g-font-size-4)]",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-[length:var(--slds-g-font-size-3)] [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
