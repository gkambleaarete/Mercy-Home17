import React, { useState } from "react";
import { CalendarIcon } from "@/app/lib/lucide-icons";
import {
  format,
  parse,
  isValid as isValidDateFns,
} from "date-fns";
import { Input } from "./input";
import { cn } from "./utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "./popover";
import { Calendar } from "./calendar";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  /** Additive, optional: external validation state from the caller (e.g. a
   * save-time error). Combined with the built-in invalid-date check. */
  "aria-invalid"?: boolean;
  /** Additive, optional: id(s) of the caller's error/help text. */
  "aria-describedby"?: string;
  /** Additive, optional: called after the built-in blur handling (which
   * marks the field touched), e.g. to normalize a cleared value. */
  onBlur?: () => void;
}

function isValidDate(val: string): boolean {
  if (val.length !== 10) return false;
  const parts = val.split("/");
  if (parts.length !== 3) return false;
  const [mm, dd, yyyy] = parts.map(Number);
  if (!mm || !dd || !yyyy) return false;
  if (mm < 1 || mm > 12) return false;
  if (dd < 1 || dd > 31) return false;
  if (yyyy < 1900 || yyyy > 2100) return false;
  const date = new Date(yyyy, mm - 1, dd);
  return date.getMonth() === mm - 1 && date.getDate() === dd;
}

// Exported standalone formatter for use in onChange handlers elsewhere
export function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 4)
    return (
      digits.slice(0, 2) +
      "/" +
      digits.slice(2, 4) +
      "/" +
      digits.slice(4)
    );
  if (digits.length > 2)
    return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

// Parses a MM/DD/YYYY string into a Date, independent of browser locale.
function parseMmDdYyyy(val?: string): Date | undefined {
  if (!val || val.length !== 10) return undefined;
  const parsed = parse(val, "MM/dd/yyyy", new Date());
  return isValidDateFns(parsed) ? parsed : undefined;
}

export function DateInput({
  value,
  onChange,
  className,
  style,
  placeholder = "MM/DD/YYYY",
  required,
  disabled,
  id,
  "aria-invalid": externalInvalid,
  "aria-describedby": describedBy,
  onBlur,
}: DateInputProps) {
  const [touched, setTouched] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onChange(formatDateInput(e.target.value));
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      // format() here always outputs MM/DD/YYYY regardless of the
      // user's OS/browser locale — the picker is just a visual aid.
      onChange(format(date, "MM/dd/yyyy"));
      setTouched(true);
    }
    setPopoverOpen(false);
  };

  const isComplete = (value?.length ?? 0) === 10;
  const hasError =
    touched && isComplete && !isValidDate(value ?? "");
  const isPartial =
    touched && (value?.length ?? 0) > 0 && !isComplete;
  const selectedDate = parseMmDdYyyy(value);

  return (
    <div>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <div className="relative">
          <Input
            id={id}
            type="text"
            value={value ?? ""}
            onChange={handleChange}
            onBlur={() => {
              setTouched(true);
              onBlur?.();
            }}
            disabled={disabled}
            className={cn(
              "h-9 slds-text-4 pr-9",
              (hasError || isPartial) &&
                "border-[#c23934] focus-visible:ring-[#c23934]",
              className,
            )}
            style={style}
            placeholder={placeholder}
            maxLength={10}
            inputMode="numeric"
            aria-required={required}
            aria-invalid={hasError || !!externalInvalid}
            aria-describedby={
              [describedBy, hasError && id && `${id}-invalid`]
                .filter(Boolean)
                .join(" ") || undefined
            }
          />
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              aria-label="Open calendar picker"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded hover:bg-[var(--slds-g-color-neutral-95)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CalendarIcon
                className="h-4 w-4"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              />
            </button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            defaultMonth={selectedDate}
            onSelect={handleCalendarSelect}
          />
        </PopoverContent>
      </Popover>
      {hasError && (
        <p
          id={id ? `${id}-invalid` : undefined}
          className="slds-text-3 mt-1"
          style={{ color: "#c23934" }}
        >
          Invalid date
        </p>
      )}
    </div>
  );
}