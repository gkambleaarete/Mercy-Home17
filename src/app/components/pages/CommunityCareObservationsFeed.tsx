// Observations feed for the Community Care member page ("Observations" in the
// left list). Shows only observations saved from the Observation modal in
// this page session -- no sample entries. Built from design-system pieces
// (Tabs underline, Button, DateInput, Badge, EmptyState).

import { useMemo, useState } from "react";
import { Eye, Search } from "@/app/lib/lucide-icons";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { DateInput } from "../ui/date-input";
import { EmptyState } from "../ui/empty-state";
import type { SavedObservation } from "./CommunityCareObservationSheet";

export type FeedObservation = SavedObservation & {
  /** Staff member who saved it. */
  author: string;
  /** Member the observation is about. */
  memberName: string;
};

type Scope = "all" | "by-me" | "for-me";
type Range = "24h" | "7d" | "month" | "custom" | null;

const PAGE = 8;

/** Observation's own Date + Time (MM/DD/YYYY + "h:mm AM") as a Date. */
function observedAt(o: SavedObservation): Date {
  const [m, d, y] = o.date.split("/").map(Number);
  const t = /^(\d{1,2}):(\d{2})\s*([AP]M)$/i.exec(o.time.trim());
  let h = t ? Number(t[1]) % 12 : 0;
  if (t && t[3].toUpperCase() === "PM") h += 12;
  return new Date(y, m - 1, d, h, t ? Number(t[2]) : 0);
}

function parseMdy(v: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  return m ? new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2])) : null;
}

export function CommunityCareObservationsFeed({
  observations,
  currentUser,
  pageMemberName,
  onOpenObservation,
  hideScopeTabs = false,
}: {
  /** Hide the All / Created by Me tabs (e.g. on a constituent profile). */
  hideScopeTabs?: boolean;
  observations: FeedObservation[];
  currentUser: string;
  /** "Created for Me": observations about this page's member. */
  pageMemberName: string;
  /** Opens the observation in the Observation modal. */
  onOpenObservation?: (o: FeedObservation) => void;
}) {
  const [scope, setScope] = useState<Scope>("all");
  const [range, setRange] = useState<Range>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const now = Date.now();
    const from =
      range === "24h"
        ? now - 24 * 3600e3
        : range === "7d"
          ? now - 7 * 24 * 3600e3
          : range === "month"
            ? now - 30 * 24 * 3600e3
            : null;
    const cs = range === "custom" ? parseMdy(start) : null;
    const ceRaw = range === "custom" ? parseMdy(end) : null;
    const ce = ceRaw ? new Date(ceRaw.getTime() + 24 * 3600e3 - 1) : null;
    return observations
      .filter((o) =>
        scope === "by-me"
          ? o.author === currentUser
          : scope === "for-me"
            ? o.memberName === pageMemberName
            : true,
      )
      .filter((o) => {
        const q = query.trim().toLowerCase();
        if (
          q &&
          ![o.author, o.memberName, o.outcomeDomain, o.comments, ...o.areas]
            .join(" ")
            .toLowerCase()
            .includes(q)
        )
          return false;
        const t = observedAt(o).getTime();
        if (from !== null && (t < from || t > now)) return false;
        if (cs && t < cs.getTime()) return false;
        if (ce && t > ce.getTime()) return false;
        return true;
      })
      .sort((a, b) => observedAt(b).getTime() - observedAt(a).getTime());
  }, [observations, scope, range, start, end, currentUser, pageMemberName, query]);

  const pick = (r: Range) => {
    setRange((cur) => (cur === r ? null : r));
    setStart("");
    setEnd("");
    setShown(PAGE);
  };
  const chip = (r: Exclude<Range, "custom" | null>, label: string) => (
    <Button
      key={r}
      variant="outline"
      size="sm"
      aria-pressed={range === r}
      onClick={() => pick(r)}
      className={`rounded-full ${range === r ? "border-[#145F33] bg-[#145F33] text-white hover:bg-[#145F33] hover:text-white" : ""}`}
    >
      {label}
    </Button>
  );

  const fmt = (o: SavedObservation) =>
    observedAt(o).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <section
      aria-label="Observations"
      className="overflow-hidden"
      style={{
        border: "1px solid var(--slds-g-color-border-base-1)",
        borderRadius: "var(--slds-c-card-radius-border)",
        backgroundColor: "var(--slds-g-color-background-base)",
      }}
    >
      {!hideScopeTabs && (
      <Tabs
        value={scope}
        onValueChange={(v) => {
          setScope(v as Scope);
          setShown(PAGE);
        }}
      >
        <TabsList variant="underline" separated aria-label="Observation scope">
          <TabsTrigger value="all" variant="underline" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="by-me" variant="underline" className="flex-1">Created by Me</TabsTrigger>
        </TabsList>
      </Tabs>
      )}

      <div className="px-5 py-3 flex flex-wrap items-center gap-2 border-b border-border">
        {chip("24h", "Last 24 Hours")}
        {chip("7d", "Last 7 Days")}
        {chip("month", "Last Month")}
        <span className="text-[13px] ml-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
          Custom:
        </span>
        <div className="w-[160px]">
          <DateInput
            id="obs-feed-start"
            value={start}
            placeholder="Start Date"
            onChange={(v) => {
              setStart(v);
              setRange("custom");
              setShown(PAGE);
            }}
          />
        </div>
        <span className="text-[13px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
          to
        </span>
        <div className="w-[160px]">
          <DateInput
            id="obs-feed-end"
            value={end}
            placeholder="End Date"
            onChange={(v) => {
              setEnd(v);
              setRange("custom");
              setShown(PAGE);
            }}
          />
        </div>
        <div className="relative w-full sm:w-60 sm:ml-auto">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 z-10"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          />
          <Input
            aria-label="Search observations"
            placeholder="Search observations..."
            surface="base"
            className="pl-9 h-8 w-full text-[13px]"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShown(PAGE);
            }}
          />
        </div>
      </div>

      <div className="px-5 py-4">
        {list.length === 0 ? (
          <EmptyState
            icon={Eye}
            title={observations.length === 0 ? "No observations yet" : "No observations match"}
            description={
              observations.length === 0
                ? "Observations saved from My Members appear here."
                : "Try another tab or date range."
            }
            className="py-6"
          />
        ) : (
          <>
            <p className="text-[13px] mb-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
              Showing <strong style={{ color: "var(--slds-g-color-text-default)" }}>{Math.min(shown, list.length)}</strong> of {list.length} entries
            </p>
            <ol className="relative space-y-5" aria-label="Observation entries">
              {list.slice(0, shown).map((o, i) => (
                <li key={`${o.savedAt}-${i}`} className="relative flex gap-3">
                  {i < Math.min(shown, list.length) - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute left-[13px] top-8 bottom-[-20px] w-px"
                      style={{ backgroundColor: "var(--slds-g-color-border-base-1)" }}
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className="relative z-10 h-7 w-7 flex-shrink-0 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#e8f0fd", color: "#1d4ed8" }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[14px] font-semibold" style={{ color: "var(--color-link-blue)" }}>
                        {o.author}
                      </span>
                      <span className="text-[13px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                        recorded a
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenObservation?.(o)}
                        className="text-[14px] font-semibold hover:underline focus-visible:underline outline-none"
                        style={{ color: "var(--color-link-blue)" }}
                        aria-label={`Open ${o.areas.join(", ")} observation for ${o.memberName}`}
                      >
                        {o.areas.join(", ")}
                      </button>
                      <span className="text-[13px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                        observation for
                      </span>
                      <Badge variant="outline" className="rounded font-medium bg-[#eef4ff] text-[#1d4ed8] border-[#c7d7fe]">
                        {o.memberName}
                      </Badge>
                      <span className="ml-auto text-[12px] whitespace-nowrap" style={{ color: "var(--slds-g-color-text-weak)" }}>
                        {fmt(o)}
                      </span>
                    </div>
                    <p className="text-[13px] mt-1" style={{ color: "var(--slds-g-color-text-default)" }}>
                      {o.comments || "No additional comments."}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            {shown < list.length && (
              <div className="pt-5 text-center">
                <Button variant="link" onClick={() => setShown((n) => n + PAGE)}>
                  View Additional Entries
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
