"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import {
  cva,
  type VariantProps,
} from "class-variance-authority";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@/app/lib/lucide-icons";

import { cn } from "./utils";

// Medium (default) = 36px, Small = 28px — the two sizes used throughout the app.
// Height, padding and text size are all defined here once so every consumer gets
// a consistent trigger instead of hand-copying h-9/h-7 + padding + font-size per instance.
// Text sizes use this app's own --slds-g-font-size-* tokens (13px/12px)
// rather than Tailwind's generic text-sm/text-xs (14px/12px) — Select has
// no other real consumer yet, so its own default can just be the actually-
// correct value instead of something every caller has to override.
//
// `focused` is additive: SelectTrigger's own focus-visible:border-ring/
// ring-ring/50/ring-[3px] classes, exposed as a prop so a static showcase
// can demonstrate the focus look without needing real keyboard focus —
// the same real classes the trigger already applies interactively, not a
// separately-invented approximation.
// The trailing [&>[data-slot=select-value]] rules truncate a value that is
// longer than the trigger (ellipsis, chevron stays visible). They live here
// because Radix's Select.Value ignores className. No change when it fits.
const selectTriggerVariants = cva(
  "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-[color:rgba(20,95,51,0.5)] aria-invalid:ring-[color:rgba(212,24,61,0.2)] dark:aria-invalid:ring-[color:rgba(212,24,61,0.4)] aria-invalid:border-destructive dark:bg-[rgba(221,219,218,0.3)] dark:hover:bg-[rgba(221,219,218,0.5)] flex w-full items-center justify-between gap-2 rounded-md border bg-[var(--slds-g-color-background-base)] disabled:bg-input-background whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      size: {
        default:
          "h-9 px-3 py-2 text-[length:var(--slds-g-font-size-4)]",
        sm: "h-7 px-2.5 py-1 text-[length:var(--slds-g-font-size-3)]",
      },
      // Long selected values: "truncate" (default, unchanged) cuts them with
      // an ellipsis; "wrap" lets the trigger grow so the full text shows.
      valueOverflow: {
        truncate:
          "[&>[data-slot=select-value]]:min-w-0 [&>[data-slot=select-value]]:truncate",
        wrap: "h-auto min-h-9 whitespace-normal text-left [&>[data-slot=select-value]]:min-w-0",
      },
      focused: {
        true: "border-ring ring-[color:rgba(20,95,51,0.5)] ring-[3px]",
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
      valueOverflow: "truncate",
      focused: false,
      surface: "default",
    },
  },
);

// Filter out Figma-specific props that shouldn't be passed to DOM elements
function filterFigmaProps<T extends Record<string, any>>(
  props: T,
): T {
  const filtered = { ...props };
  Object.keys(filtered).forEach((key) => {
    if (key.startsWith("_fg")) {
      delete filtered[key];
    }
  });
  return filtered;
}

// Wrapper components for icons to filter Figma props
const FilteredChevronDown = React.forwardRef<
  SVGSVGElement,
  React.ComponentPropsWithoutRef<typeof ChevronDownIcon>
>((props, ref) => (
  <ChevronDownIcon ref={ref} {...filterFigmaProps(props)} />
));
FilteredChevronDown.displayName = "FilteredChevronDown";

const FilteredChevronUp = React.forwardRef<
  SVGSVGElement,
  React.ComponentPropsWithoutRef<typeof ChevronUpIcon>
>((props, ref) => (
  <ChevronUpIcon ref={ref} {...filterFigmaProps(props)} />
));
FilteredChevronUp.displayName = "FilteredChevronUp";

const FilteredCheckIcon = React.forwardRef<
  SVGSVGElement,
  React.ComponentPropsWithoutRef<typeof CheckIcon>
>((props, ref) => (
  <CheckIcon ref={ref} {...filterFigmaProps(props)} />
));
FilteredCheckIcon.displayName = "FilteredCheckIcon";

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return (
    <SelectPrimitive.Root
      data-slot="select"
      {...filterFigmaProps(props)}
    />
  );
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      {...filterFigmaProps(props)}
    />
  );
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      {...filterFigmaProps(props)}
    />
  );
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.Trigger
  > &
    VariantProps<typeof selectTriggerVariants>
>(
  (
    {
      className,
      children,
      size,
      focused,
      surface,
      valueOverflow,
      ...props
    },
    ref,
  ) => (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="select-trigger"
      className={cn(
        selectTriggerVariants({
          size,
          valueOverflow,
          focused,
          surface,
          className,
        }),
      )}
      {...filterFigmaProps(props)}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <FilteredChevronDown
          className="size-4 opacity-50"
          aria-hidden="true"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  ),
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

// Opt-in long-option mode (`wrapOptions` on SelectContent). By default the
// popup is as wide as its longest option, which is right for short lists.
// With long, multi-sentence options that width runs past the field and the
// browser edge, so `wrapOptions` pins the popup to the trigger's width, keeps
// it inside the viewport (flipping above the field when there is no room
// below, with a small collision margin), limits its height to the room
// available with its own vertical scroll, and lets every option wrap. The
// items read the mode from this context, so call sites only set the one prop.
const SelectWrapOptionsContext = React.createContext(false);

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.Content
  > & {
    wrapOptions?: boolean;
  }
>(
  (
    {
      className,
      children,
      position = "popper",
      wrapOptions = false,
      ...props
    },
    ref,
  ) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        data-slot="select-content"
        {...(wrapOptions
          ? {
              avoidCollisions: true,
              collisionPadding: 8,
              "data-wrap-options": "",
            }
          : {})}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-[96vh] min-w-[8rem] overflow-hidden rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          wrapOptions &&
            "w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-content-available-width)] max-h-[var(--radix-select-content-available-height)]",
          className,
        )}
        position={position}
        {...filterFigmaProps(props)}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",
            wrapOptions &&
              "h-auto max-h-[var(--radix-select-content-available-height)] min-w-0",
          )}
        >
          <SelectWrapOptionsContext.Provider
            value={wrapOptions}
          >
            {children}
          </SelectWrapOptionsContext.Provider>
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  ),
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    data-slot="select-label"
    className={cn(
      "text-muted-foreground px-2 py-1.5 text-xs",
      className,
    )}
    {...filterFigmaProps(props)}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const wrapOptions = React.useContext(
    SelectWrapOptionsContext,
  );
  return (
    <SelectPrimitive.Item
      ref={ref}
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        // Long options: text wraps in a shrinkable box (min-w-0); the check
        // indicator is absolutely placed inside pr-8, so it never overlaps.
        wrapOptions &&
          "min-w-0 items-start whitespace-normal *:[span]:last:block *:[span]:last:min-w-0 *:[span]:last:whitespace-normal *:[span]:last:break-words",
        className,
      )}
      {...filterFigmaProps(props)}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <FilteredCheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.Separator
  >
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    data-slot="select-separator"
    className={cn(
      "bg-border pointer-events-none -mx-1 my-1 h-px",
      className,
    )}
    {...filterFigmaProps(props)}
  />
));
SelectSeparator.displayName =
  SelectPrimitive.Separator.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.ScrollUpButton
  >
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    data-slot="select-scroll-up-button"
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...filterFigmaProps(props)}
  >
    <FilteredChevronUp className="size-4" aria-hidden="true" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName =
  SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.ScrollDownButton
  >
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    data-slot="select-scroll-down-button"
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...filterFigmaProps(props)}
  >
    <FilteredChevronDown
      className="size-4"
      aria-hidden="true"
    />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

export {
  // Shared trigger styling, so other picklist-style triggers (e.g.
  // SearchableSelect) render identically to SelectTrigger.
  selectTriggerVariants,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};