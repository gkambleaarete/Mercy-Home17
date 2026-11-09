import { Search } from "@/app/lib/lucide-icons";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { DateInput } from "../ui/date-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  AGE_GROUPS,
  WAITLIST_CATEGORIES,
  YOUTH_TYPES,
} from "../../data/mockProjectionsWaitlistData";
import type { WaitlistOrder } from "../../lib/projectionsWaitlist";

export interface WaitlistFilterState {
  search: string;
  ageGroup: string; // "all" | AgeGroup
  category: string; // "all" | WaitlistCategory
  caseManager: string; // "all" | case manager name
  youthType: string; // "all" | YouthType
  /** Referral Date range as typed in DateInput (MM/DD/YYYY). */
  referralFrom: string;
  referralTo: string;
  order: WaitlistOrder;
}

export const DEFAULT_WAITLIST_FILTERS: WaitlistFilterState = {
  search: "",
  ageGroup: "all",
  category: "all",
  caseManager: "all",
  youthType: "all",
  referralFrom: "",
  referralTo: "",
  order: "referral",
};

interface WaitlistFiltersProps {
  value: WaitlistFilterState;
  onChange: (next: WaitlistFilterState) => void;
  /** Case managers on the active waitlist. */
  caseManagers: string[];
  /** Inverted Referral Date range message (range is not applied). */
  referralRangeError?: string;
}

export function WaitlistFilters({
  value,
  onChange,
  caseManagers,
  referralRangeError,
}: WaitlistFiltersProps) {
  const set = <K extends keyof WaitlistFilterState>(
    key: K,
    v: WaitlistFilterState[K],
  ) => onChange({ ...value, [key]: v });

  const hasFilters =
    value.search !== "" ||
    value.ageGroup !== "all" ||
    value.category !== "all" ||
    value.caseManager !== "all" ||
    value.youthType !== "all" ||
    value.referralFrom !== "" ||
    value.referralTo !== "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-[220px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none text-[var(--slds-g-color-text-weak)]" />
        <Input
          size="md"
          className="pl-8"
          value={value.search}
          onChange={(e) => set("search", e.target.value)}
          placeholder="Search youth or case manager"
          aria-label="Search waitlist"
        />
      </div>

      <Select
        value={value.ageGroup}
        onValueChange={(v) => set("ageGroup", v)}
      >
        <SelectTrigger
          className="w-[160px]"
          aria-label="Age group"
        >
          <SelectValue placeholder="Please Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Age Groups</SelectItem>
          {AGE_GROUPS.map((g) => (
            <SelectItem key={g} value={g}>
              {g}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.category}
        onValueChange={(v) => set("category", v)}
      >
        <SelectTrigger
          className="w-[190px]"
          aria-label="Category"
        >
          <SelectValue placeholder="Please Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {WAITLIST_CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.caseManager}
        onValueChange={(v) => set("caseManager", v)}
      >
        <SelectTrigger
          className="w-[180px]"
          aria-label="Case Manager"
        >
          <SelectValue placeholder="Please Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Case Managers</SelectItem>
          {caseManagers.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.youthType}
        onValueChange={(v) => set("youthType", v)}
      >
        <SelectTrigger
          className="w-[150px]"
          aria-label="Youth Type"
        >
          <SelectValue placeholder="Please Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Youth Types</SelectItem>
          {YOUTH_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1.5">
        <Label
          htmlFor="wl-referral-from"
          className="slds-text-3"
        >
          Referral From
        </Label>
        <div className="w-[140px]">
          <DateInput
            id="wl-referral-from"
            value={value.referralFrom}
            onChange={(v) => set("referralFrom", v)}
            aria-invalid={!!referralRangeError}
            aria-describedby={
              referralRangeError
                ? "wl-referral-range-error"
                : undefined
            }
          />
        </div>
        <Label htmlFor="wl-referral-to" className="slds-text-3">
          To
        </Label>
        <div className="w-[140px]">
          <DateInput
            id="wl-referral-to"
            value={value.referralTo}
            onChange={(v) => set("referralTo", v)}
            aria-invalid={!!referralRangeError}
            aria-describedby={
              referralRangeError
                ? "wl-referral-range-error"
                : undefined
            }
          />
        </div>
      </div>

      <Select
        value={value.order}
        onValueChange={(v) => set("order", v as WaitlistOrder)}
      >
        <SelectTrigger className="w-[250px]" aria-label="Order">
          <SelectValue placeholder="Please Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="referral">
            Referral Date (first-in, first-served)
          </SelectItem>
          <SelectItem value="priority">
            Priority bumps first, then Referral Date
          </SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="link-info"
          size="sm"
          onClick={() =>
            onChange({
              ...DEFAULT_WAITLIST_FILTERS,
              order: value.order,
            })
          }
        >
          Clear filters
        </Button>
      )}
      {referralRangeError && (
        <p
          id="wl-referral-range-error"
          role="alert"
          className="basis-full slds-text-3 text-destructive"
        >
          {referralRangeError}
        </p>
      )}
    </div>
  );
}