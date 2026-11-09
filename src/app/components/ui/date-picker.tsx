"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "@/app/lib/lucide-icons";
import { cn } from "./utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Displays the selected date as a locked, fully-legible value (not the
   * grayed-out `disabled` look) and keeps the calendar from opening --
   * for a field that has a real value the user just can't edit here. */
  readOnly?: boolean;
  className?: string;
  id?: string;
  /** Forces the real focus-visible look for a static demo with no actual
   * keyboard focus -- same escape hatch already on Input/Textarea/SelectTrigger. */
  focused?: boolean;
  /** `default` (36px) is this component's original, only size -- omitting
   * `size` renders exactly as before. `sm` (28px) is the app's other real
   * field size, owning its own height/padding/font-size/icon-size instead
   * of a consumer hand-typing `className="h-7 text-[12px]"`. */
  size?: "default" | "sm";
}

// "YYYY-MM-DD" is parsed as a LOCAL date. `new Date("2026-10-01")` treats it
// as UTC midnight, which shows the previous day in US time zones.
function toDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? parse(value, "yyyy-MM-dd", new Date())
    : new Date(value);
  return isValid(d) ? d : undefined;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  readOnly = false,
  className,
  id,
  focused,
  size = "default",
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    toDate(value),
  );
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setDate(toDate(value));
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate && onChange) {
      // Format date as YYYY-MM-DD for consistency with input[type="date"]
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      onChange(formattedDate);
    } else if (!selectedDate && onChange) {
      onChange("");
    }
    // Close after a pick, like DateInput's calendar.
    if (selectedDate) setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled || readOnly}
          className={cn(
            "w-full justify-between text-left font-normal rounded border-[var(--slds-g-color-border-base-1)]",
            size === "sm"
              ? "h-7 text-[12px]"
              : "h-9 text-[13px]",
            readOnly
              ? "bg-[var(--slds-g-color-background-alt)] text-[#080707] cursor-not-allowed disabled:opacity-100"
              : cn(
                  "bg-[var(--slds-g-color-background-base)]",
                  date ? "text-[#080707]" : "text-[#706e6b]",
                ),
            focused &&
              "border-[#145F33] shadow-[0_0_0_3px_rgba(20,95,51,0.2)]",
            className,
          )}
        >
          {date ? (
            format(date, "MM/dd/yyyy")
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon
            className={cn(
              "ml-2 shrink-0",
              size === "sm" ? "h-3 w-3" : "h-4 w-4",
              readOnly ? "opacity-40" : "opacity-50",
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}