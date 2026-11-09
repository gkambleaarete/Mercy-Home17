"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "@/app/lib/lucide-icons";

import { cn } from "./utils";
import { selectTriggerVariants } from "./select";
import { Badge } from "./badge";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./command";

export interface MultiSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  options: readonly string[];
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  /** Additive, default true: the removable Badge row below the trigger.
   * false keeps the control single-line (e.g. inside a list-view filter
   * toolbar); the trigger still shows the selected count. */
  showSelected?: boolean;
  /** Additive, default "badges" (existing behaviour, unchanged). "inline"
   * is the compact list-filter mode: the trigger keeps a fixed height and
   * summarizes the selection as "N selected"; options use the Design System
   * Checkbox; the list ends with a Clear All action; no chips are ever
   * rendered outside the control (showSelected is ignored). */
  display?: "badges" | "inline";
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  /** Additive, optional: display text for an option value. Lets callers
   * key selections by a stable id while showing a name. Defaults to the
   * value itself (existing behaviour, unchanged). */
  getOptionLabel?: (value: string) => string;
}

// Multi-value picklist: a Select-styled trigger opening a Command list where
// each option toggles; selections show below as removable Badges. Shared
// replacement for the page-local multi-select copies, built only from
// existing primitives (Popover + Command + Badge) and SelectTrigger's styling.
function MultiSelect({
  value,
  onValueChange,
  options,
  placeholder = "Please Select",
  disabled,
  id,
  className,
  showSelected = true,
  display = "badges",
  getOptionLabel = (v: string) => v,
  ...aria
}: MultiSelectProps) {
  const inline = display === "inline";
  const showChips = showSelected && !inline;
  // Selected values in option order, for the trigger's accessible name.
  const selectedInOrder = options
    .filter((o) => value.includes(o))
    .map(getOptionLabel);
  const ariaLabel =
    inline && aria["aria-label"] && value.length
      ? `${aria["aria-label"]}: ${selectedInOrder.join(", ")}`
      : aria["aria-label"];
  const [open, setOpen] = React.useState(false);
  const toggle = (option: string) =>
    onValueChange(
      value.includes(option)
        ? value.filter((v) => v !== option)
        : [...value, option],
    );
  return (
    <div className={showChips ? "space-y-2" : undefined}>
      <Popover
        open={open}
        onOpenChange={disabled ? undefined : setOpen}
      >
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            data-slot="multi-select-trigger"
            data-placeholder={value.length ? undefined : ""}
            className={cn(selectTriggerVariants(), className)}
            {...aria}
            aria-label={ariaLabel}
          >
            <span className="truncate">
              {value.length
                ? `${value.length} selected`
                : placeholder}
            </span>
            <ChevronsUpDown
              className="size-4 opacity-50"
              aria-hidden="true"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn(
            "p-0",
            inline
              ? "w-max min-w-(--radix-popover-trigger-width) max-w-[calc(100vw-2rem)]"
              : "w-(--radix-popover-trigger-width)",
          )}
          onOpenAutoFocus={
            inline
              ? (e) => {
                  // No search input here, so put focus on the Command root
                  // itself -- that is where its arrow-key / Enter handling
                  // lives. Otherwise focus lands on the popover wrapper and
                  // the keyboard cannot reach the options.
                  e.preventDefault();
                  (e.currentTarget as HTMLElement | null)
                    ?.querySelector<HTMLElement>(
                      "[data-slot=command]",
                    )
                    ?.focus();
                }
              : undefined
          }
        >
          <Command
            tabIndex={inline ? -1 : undefined}
            className={inline ? "outline-none" : undefined}
            aria-label={inline ? aria["aria-label"] : undefined}
          >
            <CommandList>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => toggle(option)}
                    aria-selected={value.includes(option)}
                    aria-checked={
                      inline
                        ? value.includes(option)
                        : undefined
                    }
                  >
                    {inline ? (
                      // Visual only: the option row itself is the
                      // keyboard/pointer target (Command handles arrows +
                      // Enter), so the checkbox is not a second tab stop.
                      <Checkbox
                        checked={value.includes(option)}
                        tabIndex={-1}
                        aria-hidden="true"
                        className="pointer-events-none"
                      />
                    ) : (
                      <Check
                        className={cn(
                          "size-4",
                          value.includes(option)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                        aria-hidden="true"
                      />
                    )}
                    {getOptionLabel(option)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          {inline && (
            <div className="flex justify-end border-t border-border p-1">
              <Button
                type="button"
                variant="ghost-primary"
                size="xs"
                disabled={value.length === 0}
                onClick={() => onValueChange([])}
              >
                Clear All
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {showChips && value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <Badge key={v} variant="success">
              {getOptionLabel(v)}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => toggle(v)}
                  aria-label={`Remove ${getOptionLabel(v)}`}
                  className="inline-flex"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export { MultiSelect };