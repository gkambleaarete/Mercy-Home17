import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import {
  cva,
  type VariantProps,
} from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        "outline-primary":
          "border bg-background text-primary border-primary hover:bg-primary/10 dark:bg-input/30",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        // ── Additive only — every variant above is used across 700+ real
        // call sites in the app and must keep its exact current meaning.
        // Everything below is new, so nothing existing can regress.
        neutral:
          "border bg-[var(--slds-g-color-neutral-base-90)] text-[var(--slds-g-color-text-default)] border-[var(--slds-g-color-border-base-1)] hover:bg-[var(--slds-g-color-neutral-base-80)]",
        accent:
          "bg-[var(--color-brand-accent)] text-white hover:bg-[var(--color-brand-accent)]/90",
        "outline-destructive":
          "border bg-background text-destructive border-destructive hover:bg-destructive/10 dark:bg-input/30",
        "outline-accent":
          "border bg-background text-[var(--color-brand-accent)] border-[var(--color-brand-accent)] hover:bg-[var(--color-brand-accent)]/10",
        "ghost-primary":
          "text-primary hover:bg-accent hover:text-accent-foreground",
        "ghost-destructive":
          "text-destructive hover:bg-destructive/10",
        soft: "bg-[color-mix(in_srgb,var(--color-brand-primary)_12%,transparent)] text-primary hover:bg-[color-mix(in_srgb,var(--color-brand-primary)_20%,transparent)]",
        "soft-warning":
          "bg-[color-mix(in_srgb,var(--color-brand-accent)_12%,transparent)] text-[var(--color-brand-accent)] hover:bg-[color-mix(in_srgb,var(--color-brand-accent)_20%,transparent)]",
        "soft-destructive":
          "bg-[color-mix(in_srgb,var(--destructive)_12%,transparent)] text-destructive hover:bg-[color-mix(in_srgb,var(--destructive)_20%,transparent)]",
        "soft-info":
          "bg-[color-mix(in_srgb,var(--color-link-blue)_12%,transparent)] text-[var(--color-link-blue)] hover:bg-[color-mix(in_srgb,var(--color-link-blue)_20%,transparent)]",
        "link-info":
          "text-[var(--color-link-blue)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-full gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-full px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-full",
        // ── Additive only, same reasoning as above: existing sm/lg/icon
        // keep their exact current pixel values (32/40/36px). These are
        // new 28px/44px tiers matching this app's other 3-tier controls
        // (e.g. Select's Small=28/Medium=36).
        xs: "h-7 rounded-full gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        xl: "h-11 rounded-full gap-2 px-5 has-[>svg]:px-4",
        "icon-xs": "size-7 rounded-full",
        "icon-xl": "size-11 rounded-full",
        // Additive: a text-sized button that sits inline in running text or
        // a table cell or header (name links, sort buttons) -- no fixed height or
        // padding, and it takes its font size from the surrounding text.
        inline:
          "h-auto rounded-sm p-0 has-[>svg]:p-0 font-medium text-[length:inherit]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(
  (
    { className, variant, size, asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        data-slot="button"
        className={cn(
          buttonVariants({ variant, size, className }),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };