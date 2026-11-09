import * as React from "react";
import { Filter } from "@/app/lib/lucide-icons";

import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Label } from "./label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

export interface ColumnFilterProps {
  /** Column name, used for accessible labels. */
  label: string;
  /** Distinct values shown in the column ("—" for blank). */
  options: readonly string[];
  /** Selected values; empty = no filter on this column. */
  value: string[];
  onValueChange: (value: string[]) => void;
  /** Additive, optional: display text for an option value. Lets a column
   * filter by a stable value while showing a friendlier label. Defaults to
   * the value itself (existing behaviour, unchanged). */
  getOptionLabel?: (value: string) => string;
}

// Excel-style value filter for a table column header: a filter icon that
// opens a checklist of the column's distinct values. Built only from
// existing primitives (Popover + Button + Checkbox + Label).
function ColumnFilter({
  label,
  options,
  value,
  onValueChange,
  getOptionLabel = (v: string) => v,
}: ColumnFilterProps) {
  const active = value.length > 0;
  const toggle = (option: string) =>
    onValueChange(
      value.includes(option)
        ? value.filter((v) => v !== option)
        : [...value, option],
    );
  const idBase = React.useId();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={active ? "ghost-primary" : "ghost"}
          size="icon-xs"
          aria-label={
            active
              ? `Filter ${label} (${value.length} selected)`
              : `Filter ${label}`
          }
          aria-pressed={active}
          onClick={(e) => e.stopPropagation()}
        >
          <Filter />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 space-y-2">
        <p className="slds-text-3 font-semibold">{label}</p>
        <div className="max-h-60 overflow-y-auto space-y-1.5">
          {options.length === 0 ? (
            <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
              No values
            </p>
          ) : (
            options.map((o, i) => {
              const id = `${idBase}-${i}`;
              return (
                <div
                  key={o}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    id={id}
                    checked={value.includes(o)}
                    onCheckedChange={() => toggle(o)}
                  />
                  <Label
                    htmlFor={id}
                    className="font-normal cursor-pointer"
                  >
                    {getOptionLabel(o)}
                  </Label>
                </div>
              );
            })
          )}
        </div>
        {active && (
          <div className="flex justify-end">
            <Button
              variant="link-info"
              size="sm"
              onClick={() => onValueChange([])}
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export { ColumnFilter };