"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "@/app/lib/lucide-icons";

import { cn } from "./utils";
import { selectTriggerVariants } from "./select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

export interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

// Type-to-filter picklist: a Select-styled trigger opening a Command list.
// Shared replacement for the page-local SearchableSelect copies, built only
// from existing primitives (Popover + Command) and SelectTrigger's styling.
function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Please Select",
  searchPlaceholder = "Search…",
  emptyMessage = "No results found.",
  disabled,
  id,
  className,
  ...aria
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);
  return (
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
          data-slot="searchable-select-trigger"
          data-placeholder={selected ? undefined : ""}
          className={cn(selectTriggerVariants(), className)}
          {...aria}
        >
          {/* min-w-0 lets a long label truncate instead of widening the
              trigger (same as Select's value) */}
          <span className="min-w-0 truncate">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown
            className="size-4 opacity-50"
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.label}
                  onSelect={() => {
                    onValueChange(o.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "size-4",
                      o.value === value
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                    aria-hidden="true"
                  />
                  {o.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { SearchableSelect };