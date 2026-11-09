"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "@/app/lib/lucide-icons";

import { cn } from "./utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return (
    <DialogPrimitive.Trigger
      data-slot="dialog-trigger"
      {...props}
    />
  );
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return (
    <DialogPrimitive.Portal
      data-slot="dialog-portal"
      {...props}
    />
  );
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      {...props}
    />
  );
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="dialog-overlay"
    className={cn(
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// ── Structured dialog sizes ──────────────────────────────────────────────
// Optional, additive: a DialogContent with no `size` prop renders exactly
// as before (this component has 163 real consumers app-wide). Passing
// size="md" | "lg" | "xl" switches on one cohesive look -- width,
// header/body/footer padding and border bands, title weight, and
// description styling -- all driven by this single prop instead of being
// hand-set separately at every sub-component. Cascaded to the other
// Dialog* pieces via context, the same pattern this codebase already uses
// for ToggleGroup -> ToggleGroupItem, so DialogHeader/DialogTitle/
// DialogDescription/DialogBody/DialogFooter never need the prop repeated.
export type DialogSize = "md" | "lg" | "xl";

interface DialogSizeConfig {
  content: string;
  headerPadding: string;
  bodyPadding: string;
  footerPadding: string;
  titleWeight: string;
  /** xl is the one real case (long scrollable form) that needs the
   * content flex-col + capped height + scrolling body, instead of the
   * default grid layout every other dialog uses. */
  scrollable: boolean;
}

const DIALOG_SIZE_CONFIG: Record<DialogSize, DialogSizeConfig> =
  {
    md: {
      content: "sm:max-w-md",
      headerPadding: "px-5 py-4",
      bodyPadding: "px-5 py-4",
      footerPadding: "px-5 py-3",
      titleWeight: "font-medium",
      scrollable: false,
    },
    lg: {
      content: "sm:max-w-2xl",
      headerPadding: "px-6 pt-5 pb-4",
      bodyPadding: "px-6 py-5",
      footerPadding: "px-6 py-3.5",
      titleWeight: "font-semibold",
      scrollable: false,
    },
    xl: {
      content: "sm:max-w-4xl",
      headerPadding: "px-6 pt-5 pb-4",
      bodyPadding: "px-6 py-5",
      footerPadding: "px-6 py-3.5",
      titleWeight: "font-semibold",
      scrollable: true,
    },
  };

const DialogSizeContext = React.createContext<
  DialogSize | undefined
>(undefined);

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<
    typeof DialogPrimitive.Content
  > & {
    size?: DialogSize;
  }
>(
  (
    {
      className,
      children,
      size,
      onOpenAutoFocus,
      onCloseAutoFocus,
      ...props
    },
    ref,
  ) => {
    const config = size ? DIALOG_SIZE_CONFIG[size] : undefined;
    // Most dialogs here are opened from state, not a Dialog.Trigger, so Radix
    // has no trigger to return focus to and focus falls to <body>. Remember
    // what had focus on open and restore it on close (callers can still
    // preventDefault in their own onCloseAutoFocus).
    const returnFocusRef = React.useRef<HTMLElement | null>(
      null,
    );
    return (
      <DialogPortal data-slot="dialog-portal">
        <DialogOverlay aria-hidden="true" />
        <DialogPrimitive.Content
          ref={ref}
          onOpenAutoFocus={(e) => {
            const active = document.activeElement;
            returnFocusRef.current =
              active instanceof HTMLElement &&
              active !== document.body
                ? active
                : null;
            onOpenAutoFocus?.(e);
          }}
          onCloseAutoFocus={(e) => {
            onCloseAutoFocus?.(e);
            const target = returnFocusRef.current;
            returnFocusRef.current = null;
            if (e.defaultPrevented || !target?.isConnected)
              return;
            e.preventDefault();
            target.focus();
          }}
          data-slot="dialog-content"
          // Responsive foundation: width is (viewport - 2rem) and max-w only
          // sets the *desired* width, so a caller's `sm:max-w-[1100px]` can no
          // longer run edge-to-edge at 1024px. max-h + overflow-y-auto keep a
          // tall dialog inside a 768px-high viewport, scrolling internally.
          // Both are no-ops for dialogs that already fit.
          className={cn(
            "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
            config &&
              cn(
                "p-0 gap-0",
                config.content,
                config.scrollable
                  ? "flex flex-col max-h-[90vh] overflow-hidden"
                  : "overflow-y-auto",
              ),
            className,
          )}
          {...props}
        >
          <DialogSizeContext.Provider value={size}>
            {children}
          </DialogSizeContext.Provider>
          <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

// `separated` remains available as a manual, independent override for
// consumers not using the size system at all. Inside a sized
// DialogContent, the border (and padding) are automatic.
const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { separated?: boolean }
>(({ className, separated, ...props }, ref) => {
  const size = React.useContext(DialogSizeContext);
  const config = size ? DIALOG_SIZE_CONFIG[size] : undefined;
  return (
    <div
      ref={ref}
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-2 text-center sm:text-left",
        (separated || config) && "border-b border-border",
        config?.headerPadding,
        config?.scrollable && "flex-shrink-0",
        className,
      )}
      {...props}
    />
  );
});
DialogHeader.displayName = "DialogHeader";

// New -- the padded (and, for size="xl", scrolling) content area between
// header and footer. Every structured dialog needs this; previously each
// showcase call site hand-rolled its own <div className="px-N py-N ...">
// wrapper instead of a real sub-component existing for it.
const DialogBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const size = React.useContext(DialogSizeContext);
  const config = size ? DIALOG_SIZE_CONFIG[size] : undefined;
  return (
    <div
      ref={ref}
      data-slot="dialog-body"
      className={cn(
        // min-w-0: a grid item otherwise grows to its widest content (e.g.
        // a long lookup label), widening the dialog into a horizontal scroll.
        "min-w-0 bg-white",
        config?.bodyPadding,
        config?.scrollable && "flex-1 overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
});
DialogBody.displayName = "DialogBody";

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { separated?: boolean }
>(({ className, separated, ...props }, ref) => {
  const size = React.useContext(DialogSizeContext);
  const config = size ? DIALOG_SIZE_CONFIG[size] : undefined;
  return (
    <div
      ref={ref}
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        (separated || config) && "border-t border-border",
        config &&
          cn(
            "flex-row items-center justify-end bg-[var(--slds-g-color-background-alt)]",
            config.scrollable && "flex-shrink-0",
          ),
        config?.footerPadding,
        className,
      )}
      {...props}
    />
  );
});
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => {
  const size = React.useContext(DialogSizeContext);
  const config = size ? DIALOG_SIZE_CONFIG[size] : undefined;
  return (
    <DialogPrimitive.Title
      ref={ref}
      data-slot="dialog-title"
      className={cn(
        "leading-none",
        config
          ? cn(
              "text-[length:var(--slds-g-font-size-6)]",
              config.titleWeight,
            )
          : "text-lg font-semibold",
        className,
      )}
      {...props}
    />
  );
});
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<
    typeof DialogPrimitive.Description
  >
>(({ className, ...props }, ref) => {
  const size = React.useContext(DialogSizeContext);
  return (
    <DialogPrimitive.Description
      ref={ref}
      data-slot="dialog-description"
      className={cn(
        size
          ? "mt-0.5 text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]"
          : "text-muted-foreground text-sm",
        className,
      )}
      {...props}
    />
  );
});
DialogDescription.displayName =
  DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};