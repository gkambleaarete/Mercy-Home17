// Search + filters for Community Care connection tables (same pattern as
// Admissions > Connections: search box, Filters toggle, filter bar applied
// with Submit, Clear, "Filters active"). Shared by the Community Care
// directory and the member page.

import { useState } from "react";
import { ChevronDown, ChevronUp, Search, SlidersHorizontal } from "@/app/lib/lucide-icons";
import type { Connection } from "../admissions/ConnectionFormDialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { DateInput } from "../ui/date-input";
import { FieldLabel } from "../ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const ANY = "__any__";
const EMPTY = { start: "", end: "", type: ANY, status: ANY, member: ANY, location: ANY };
type Filters = typeof EMPTY;

export const connectionMember = (c: Connection) =>
  (c as { memberName?: string }).memberName || c.participants || "";
const typeLabel = (t: string) =>
  t === "Community Care File Request" ? "File Request" : t;
const mdyToTime = (v: string) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v || "");
  return m ? new Date(+m[3], +m[1] - 1, +m[2]).getTime() : NaN;
};
const uniq = (xs: string[]) => Array.from(new Set(xs.filter(Boolean))).sort();

export function useCommunityCareConnectionFilters(rows: Connection[], idPrefix: string) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters | null>(null);

  const options = {
    type: uniq(rows.map((c) => c.type)),
    status: uniq(rows.map((c) => c.status || "")),
    member: uniq(rows.flatMap((c) => connectionMember(c).split(", "))),
    location: uniq(rows.map((c) => c.location || "")),
  };

  const visible = rows.filter((c) => {
    const q = search.trim().toLowerCase();
    if (
      q &&
      ![typeLabel(c.type), connectionMember(c), c.status || "", c.location || "", c.startDate, c.endDate]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
      return false;
    const f = applied;
    if (f) {
      const t = mdyToTime(c.startDate);
      if (f.start && !(t >= mdyToTime(f.start))) return false;
      if (f.end && !(t <= mdyToTime(f.end))) return false;
      if (f.type !== ANY && c.type !== f.type) return false;
      if (f.status !== ANY && (c.status || "") !== f.status) return false;
      if (f.location !== ANY && (c.location || "") !== f.location) return false;
      if (f.member !== ANY && !connectionMember(c).split(", ").includes(f.member)) return false;
    }
    return true;
  });

  const panelId = `${idPrefix}-connection-filters`;

  /** Search box (place before Add Connection). */
  const searchBox = (
    <div className="relative w-full sm:w-56">
      <Search
        aria-hidden="true"
        className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 z-10"
        style={{ color: "var(--slds-g-color-text-weak)" }}
      />
      <Input
        aria-label="Search connections"
        placeholder="Search connections..."
        surface="base"
        className="pl-9 h-8 w-full text-[13px]"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );

  /** Filters toggle + "Filters active" (place after Add Connection). */
  const filtersButton = (
    <>
      <Button
        variant={open ? "outline-primary" : "outline"}
        size="sm"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <SlidersHorizontal aria-hidden="true" />
        Filters
        {open ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
      </Button>
      {applied && <Badge variant="success">Filters active</Badge>}
    </>
  );

  /** Collapsible filter bar (place between the header and the table). */
  const panel = open ? (
    <div
      id={panelId}
      className="px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
      style={{
        borderBottom: "1px solid var(--slds-g-color-border-base-1)",
        backgroundColor: "var(--slds-g-color-background-alt)",
      }}
    >
      <div className="space-y-1.5">
        <FieldLabel htmlFor={`${idPrefix}-start`}>Start Date</FieldLabel>
        <DateInput id={`${idPrefix}-start`} value={draft.start} onChange={(v) => setDraft((d) => ({ ...d, start: v }))} />
      </div>
      <div className="space-y-1.5">
        <FieldLabel htmlFor={`${idPrefix}-end`}>End Date</FieldLabel>
        <DateInput id={`${idPrefix}-end`} value={draft.end} onChange={(v) => setDraft((d) => ({ ...d, end: v }))} />
      </div>
      {([
        ["type", "Type"],
        ["status", "Status"],
        ["member", "Member"],
        ["location", "Location"],
      ] as const).map(([key, label]) => (
        <div key={key} className="space-y-1.5">
          <FieldLabel htmlFor={`${idPrefix}-${key}`}>{label}</FieldLabel>
          <Select value={draft[key]} onValueChange={(v) => setDraft((d) => ({ ...d, [key]: v }))}>
            <SelectTrigger id={`${idPrefix}-${key}`} surface="base"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-[260px]">
              <SelectItem value={ANY}>All</SelectItem>
              {options[key].map((o) => (
                <SelectItem key={o} value={o}>{key === "type" ? typeLabel(o) : o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
      <div className="sm:col-span-3 flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setDraft(EMPTY);
            setApplied(null);
          }}
        >
          Clear
        </Button>
        <Button size="sm" onClick={() => setApplied({ ...draft })}>
          Submit
        </Button>
      </div>
    </div>
  ) : null;

  return { visible, searchBox, filtersButton, panel };
}
