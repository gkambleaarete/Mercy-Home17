import * as React from "react";
import {
  cva,
  type VariantProps,
} from "class-variance-authority";

import { cn } from "./utils";

// `size="default"` reproduces the exact classes this component always
// rendered -- omitting `size` keeps every existing consumer (~125 real call
// sites app-wide) byte-identical to before. `md`/`sm` are the two real
// field sizes used throughout the app's own SLDS-token forms (36px/28px);
// unlike `default`, they also own their disabled/read-only/error surface
// colors, so a consumer never has to hand-type those as className.
// `focused`/`hovered` force the real focus-visible/hover look for a static
// demo that has no actual keyboard focus or mouse over it (same escape
// hatch as SelectTrigger's `focused`) -- everywhere else, real :hover
// already works on its own via the unconditional hover: class below.
const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-[var(--slds-g-color-background-base)] transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      size: {
        default:
          "h-9 px-3 py-1 text-base md:text-sm disabled:bg-input-background read-only:bg-input-background disabled:opacity-50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        md: "h-9 px-3 py-1 text-[length:var(--slds-g-font-size-4)] hover:border-[#b0adab] read-only:cursor-not-allowed read-only:bg-[var(--slds-g-color-background-alt)] disabled:bg-[#f3f2f2] disabled:opacity-100 aria-invalid:border-[#A82031] aria-invalid:ring-[#A82031]/20",
        sm: "h-7 px-2.5 py-1 text-[length:var(--slds-g-font-size-3)] hover:border-[#b0adab] read-only:cursor-not-allowed read-only:bg-[var(--slds-g-color-background-alt)] disabled:bg-[#f3f2f2] disabled:opacity-100 aria-invalid:border-[#A82031] aria-invalid:ring-[#A82031]/20",
      },
      focused: {
        true: "border-ring ring-ring/50 ring-[3px]",
        false: "",
      },
      hovered: {
        true: "border-[#b0adab]",
        false: "",
      },
      // Editable fields are already white by default (disabled/read-only keep
      // the gray input-background); "base" is kept for existing call sites.
      surface: {
        default: "",
        base: "bg-[var(--slds-g-color-background-base)]",
      },
    },
    defaultVariants: {
      size: "default",
      focused: false,
      hovered: false,
      surface: "default",
    },
  },
);

interface InputProps
  // The native <input> element's own `size` HTML attribute (a number of
  // visible characters) is a different thing from -- and would otherwise
  // silently collide with -- the `size` variant below.
  extends
    Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  /** Icon rendered inside the field's left edge -- Input owns the wrapper,
   * positioning, and the padding adjustment this needs, so a consumer never
   * hand-builds a `relative` div + absolutely-positioned icon + pl-9 itself. */
  leadingIcon?: React.ReactNode;
  /** Same as `leadingIcon`, anchored to the right edge (e.g. a password
   * show/hide toggle or a search field's clear button). */
  trailingIcon?: React.ReactNode;
}

function Input({
  className,
  type,
  size,
  focused,
  hovered,
  surface,
  leadingIcon,
  trailingIcon,
  ...props
}: InputProps) {
  const input = (
    <input
      type={type}
      data-slot="input"
      className={cn(
        inputVariants({ size, focused, hovered, surface }),
        leadingIcon && (size === "sm" ? "pl-[30px]" : "pl-9"),
        trailingIcon && (size === "sm" ? "pr-[30px]" : "pr-9"),
        className,
      )}
      {...props}
    />
  );

  if (!leadingIcon && !trailingIcon) return input;

  return (
    <div className="relative">
      {leadingIcon && (
        <span
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 [&_svg]:shrink-0",
            size === "sm" ? "left-2.5" : "left-3",
          )}
        >
          {leadingIcon}
        </span>
      )}
      {input}
      {trailingIcon && (
        <span
          className={cn(
            "absolute top-1/2 -translate-y-1/2 [&_svg]:shrink-0",
            size === "sm" ? "right-2.5" : "right-3",
          )}
        >
          {trailingIcon}
        </span>
      )}
    </div>
  );
}

export { Input };