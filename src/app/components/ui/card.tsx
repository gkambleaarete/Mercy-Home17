import * as React from "react";
import {
  cva,
  type VariantProps,
} from "class-variance-authority@0.7.1";

import { cn } from "./utils";

// default = the existing, untouched shape (18px radius, gap-6 between
// children) — 40 real files use Card and rely on this. "section" is
// additive: the tighter 8px-radius, no-gap shape every card in Component
// Patterns > Cards actually wants, previously achieved by hand-copying
// `rounded-[8px] gap-0` as a className at every call site.
const cardVariants = cva(
  "text-card-foreground flex flex-col border",
  {
    variants: {
      variant: {
        default: "rounded-[18px] gap-6",
        // overflow-hidden clips CardHeader's own bg/border-b band to this
        // rounded corner -- without it the header's square corner pokes
        // past the card's radius. Safe here: "section" has zero real
        // consumers outside this session's own additions.
        section: "rounded-[8px] gap-0 overflow-hidden",
        // "container" is Data Table's own wrapper shape (6px radius, not
        // Card Styles' 8px -- a different real spec, not a typo), also
        // additive/zero real consumers.
        container: "rounded-[6px] gap-0 overflow-hidden",
      },
      elevation: {
        none: "",
        sm: "[box-shadow:var(--slds-g-shadow-1)]",
        md: "shadow-[0_2px_8px_rgba(0,0,0,0.08)]",
      },
      // base = existing bg-card (white), untouched. alt/alt2 are additive —
      // this app's two "recessed surface" tokens (background-alt is the
      // lighter #fafaf9, background-alt-2 is the more visible #f3f2f2 used
      // by table header/footer bars).
      surface: {
        base: "bg-card",
        alt: "bg-[var(--slds-g-color-background-alt)]",
        alt2: "bg-[var(--slds-g-color-background-alt-2)]",
      },
      // The one clickable-card hover treatment for the whole app: raise the
      // shadow on hover. Previously every clickable card hand-assembled its
      // own version of this (some also recolored icon/text via group-hover,
      // some only tinted the background) -- now there's exactly one design,
      // and it also owns the button semantics (role/tabIndex) a clickable
      // card needs, so a consumer doesn't have to declare those either.
      interactive: {
        true: "cursor-pointer transition-shadow hover:shadow-md",
        false: "",
      },
      // The one "this card is the chosen one" look for the whole app --
      // previously hand-copied per call site (Program Picker's own
      // now-deleted SelectableCard button, KPI cards' "ACTIVE" card) with
      // the same values retyped each time. Any card that needs a selected
      // state reaches for this instead of re-deriving the border/bg itself.
      selected: {
        true: "border-2 border-[var(--color-brand-primary)] bg-[#f4faf6]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      elevation: "none",
      surface: "base",
      interactive: false,
      selected: false,
    },
  },
);

const Card = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    VariantProps<typeof cardVariants>
>(
  (
    {
      className,
      variant,
      elevation,
      surface,
      interactive,
      selected,
      role,
      tabIndex,
      onClick,
      onKeyDown,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      data-slot="card"
      role={role ?? (interactive ? "button" : undefined)}
      tabIndex={tabIndex ?? (interactive ? 0 : undefined)}
      onClick={onClick}
      // Real keyboard activation for a clickable card -- `interactive`
      // already claims role="button", and a button-role element needs
      // Enter/Space to activate it, not just a mouse click.
      onKeyDown={
        interactive && onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(
                  e as unknown as React.MouseEvent<HTMLDivElement>,
                );
              }
              onKeyDown?.(e);
            }
          : onKeyDown
      }
      className={cn(
        cardVariants({
          variant,
          elevation,
          surface,
          interactive,
          selected,
        }),
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

// size "default" (px-6 pt-6, existing/untouched) pairs with Card's
// "default" variant. "sm"/"xs" pair with Card's "section" variant — the
// two tightness levels already in use (Standard/Elevated/Accent Top vs
// Compact). `separated` bundles the header-band background + bottom
// border look (bg + border-b) that was previously hand-set via inline
// style on every section-style card.
const cardHeaderVariants = cva(
  "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start has-data-[slot=card-action]:grid-cols-[1fr_auto]",
  {
    variants: {
      size: {
        default: "px-6 pt-6 gap-1.5 [.border-b]:pb-6",
        sm: "px-4 py-3 gap-0",
        xs: "px-4 py-2.5 gap-0",
      },
      separated: {
        true: "bg-[var(--slds-g-color-background-alt)] border-b border-border",
        false: "",
      },
    },
    defaultVariants: { size: "default", separated: false },
  },
);

function CardHeader({
  className,
  size,
  separated,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardHeaderVariants>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        cardHeaderVariants({ size, separated }),
        className,
      )}
      {...props}
    />
  );
}

// "default" is the exact original, untouched (no explicit font-size —
// inherits from the h4 element). "sm" is additive, for CardHeader's "sm"/
// "xs" tighter sizes — those never had their own title treatment before,
// it was hand-set inline at every call site instead.
const cardTitleVariants = cva("leading-none", {
  variants: {
    size: {
      default: "",
      sm: "text-[13px] font-semibold",
    },
  },
  defaultVariants: { size: "default" },
});

function CardTitle({
  className,
  size,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardTitleVariants>) {
  return (
    <h4
      data-slot="card-title"
      className={cn(cardTitleVariants({ size }), className)}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

// Sizes mirror CardHeader's — "default" keeps the original last-child-only
// bottom padding (so Card's own gap-6 still does the spacing work between
// siblings); "sm"/"xs" get explicit vertical padding since section-style
// cards pair a header+content directly with no gap between them.
const cardContentVariants = cva("", {
  variants: {
    size: {
      default: "px-6 [&:last-child]:pb-6",
      sm: "px-4 py-4",
      xs: "px-4 py-2.5",
    },
  },
  defaultVariants: { size: "default" },
});

function CardContent({
  className,
  size,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardContentVariants>) {
  return (
    <div
      data-slot="card-content"
      className={cn(cardContentVariants({ size }), className)}
      {...props}
    />
  );
}

// Mirrors CardHeader's `separated` exactly, just on the opposite edge
// (border-t instead of border-b) -- a footer band sitting on its own
// tinted surface, e.g. a table's pagination bar. `size` is additive:
// "default" is the original px-6/pb-6 footer; "sm" is the compact 12px/20px
// pagination band the Data Table pattern (DTB-05) documents.
const cardFooterVariants = cva("flex items-center", {
  variants: {
    size: {
      default: "px-6 pb-6 [.border-t]:pt-6",
      sm: "px-5 py-3",
    },
    separated: {
      true: "bg-[var(--slds-g-color-background-alt-2)] border-t border-border",
      false: "",
    },
  },
  defaultVariants: { size: "default", separated: false },
});

function CardFooter({
  className,
  size,
  separated,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardFooterVariants>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        cardFooterVariants({ size, separated }),
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};