import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { usePassDialog } from "../../contexts/PassDialogContext";
import {
  type ConstituentPassContext,
  PASS_CONTEXT_UNAVAILABLE_MESSAGE,
  isPassInContext,
  useConstituentPassContext,
} from "../../lib/constituentPassContext";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  List,
  Pill,
  Plus,
  Printer,
  StickyNote,
  X,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { badgeVariants } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { DateInput } from "../ui/date-input";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../ui/toggle-group";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  selectTriggerVariants,
} from "../ui/select";
import { cn } from "../ui/utils";
import {
  type PassRecord,
  type PassStatus,
  PASS_STATUS_BADGE_VARIANT,
  PASS_STATUS_OPTIONS,
  CURRENT_USER_CAN_CREATE_PASS,
  usePasses,
} from "../../data/mockPassData";
import {
  getPrograms,
  isValidMdy,
  todayIso,
} from "../../data/mockProgramsData";
import {
  getActivePassYouthIds,
  getYouthName,
} from "../../data/mockYouthProgramData";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import { printRecordsAsTable } from "../../lib/printTable";
import {
  type CalendarView,
  type WeekSegment,
  dayOfPass,
  dayPhase,
  layoutWeek,
  monthGridWeeks,
  overlaps,
  shiftIso,
  startOfWeekIso,
  viewRange,
} from "../../lib/passCalendar";
import { addDaysIso } from "../../lib/passes";

// The ONE Pass Calendar (20041) for the Pass object (scope="all"), a
// Program (scope="program") and the Constituent Pass tab
// (scope="constituent": that Constituent AND their current Program, the
// same ownership scope as the tab's list). Reads the same
// canonical getPasses() store as the List and record pages; a Pass is one
// event from Start Date + Departure Time to End Date + Return Time.

export type PassCalendarScope =
  | { scope: "all" }
  | { scope: "program"; programId: number }
  | { scope: "constituent"; constituentId: number };

export type PassCalendarProps = PassCalendarScope & {
  /** Embedded workspace (Constituent Pass tab): return to the profile's
   *  list instead of navigating to /pass. */
  onListView?: () => void;
};

const MONTH_LANES = 3; // events per month cell before "+N more"
const WEEKDAY_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

function rangeLabel(iso: string, view: CalendarView): string {
  const { y, m, d } = parts(iso);
  if (view === "month") return `${MONTHS[m - 1]} ${y}`;
  if (view === "day") {
    const dow = new Date(y, m - 1, d).getDay();
    return `${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dow]}, ${MONTHS[m - 1]} ${d}, ${y}`;
  }
  const [s, e] = viewRange(iso, "week");
  return `${isoToMdy(s)} – ${isoToMdy(e)}`;
}

// ─── Multi-select filter (Popover + Checkbox list — the app's existing
// multi-select pattern, e.g. Individuals Involved in the incident dialog) ──

function MultiSelectFilter({
  label,
  allLabel,
  options,
  selected,
  onChange,
}: {
  label: string;
  allLabel: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const summary =
    selected.length === 0
      ? allLabel
      : selected.length === 1
        ? (options.find((o) => o.value === selected[0])
            ?.label ?? allLabel)
        : `${selected.length} ${label} selected`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            selectTriggerVariants(),
            "w-48 justify-between",
          )}
        >
          <span className="truncate">{summary}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        <div
          role="group"
          aria-label={label}
          className="max-h-64 overflow-y-auto space-y-1"
        >
          {options.length === 0 && (
            <p className="slds-text-3 px-1 text-[var(--slds-g-color-text-weak)]">
              No options.
            </p>
          )}
          {options.map((o) => {
            const id = `cal-${label}-${o.value}`;
            const checked = selected.includes(o.value);
            return (
              <div
                key={o.value}
                className="flex items-center gap-2 px-1 py-1"
              >
                <Checkbox
                  surface="base"
                  id={id}
                  checked={checked}
                  onCheckedChange={(c) =>
                    onChange(
                      c === true
                        ? [...selected, o.value]
                        : selected.filter((v) => v !== o.value),
                    )
                  }
                />
                <label
                  htmlFor={id}
                  className="slds-text-4 cursor-pointer"
                >
                  {o.label}
                </label>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function PassCalendar(props: PassCalendarProps) {
  if (props.scope === "constituent")
    return <ConstituentPassCalendarGate {...props} />;
  return <PassCalendarBody {...props} />;
}

/** Constituent scope: the calendar exists only while the Constituent is
 *  eligible and has a uniquely resolved current Program — never an
 *  unscoped calendar. List View stays available either way. */
function ConstituentPassCalendarGate(props: {
  scope: "constituent";
  constituentId: number;
  onListView?: () => void;
}) {
  const ctx = useConstituentPassContext(props.constituentId);
  if (!ctx || ctx.status !== "ok")
    return (
      <div className="space-y-2">
        {props.onListView && (
          <Button
            variant="outline"
            data-view-switch
            onClick={props.onListView}
          >
            <List /> List View
          </Button>
        )}
        <p
          role="alert"
          data-testid="pass-context-unavailable"
          className="slds-text-4 rounded border px-3 py-2 border-[#c23934] text-[#c23934] bg-white"
        >
          {!ctx || ctx.status === "ineligible"
            ? "This Constituent is not eligible for Pass records."
            : PASS_CONTEXT_UNAVAILABLE_MESSAGE}
        </p>
      </div>
    );
  return (
    <PassCalendarBody
      {...props}
      // A different Program is a different calendar (fresh filters).
      key={`${ctx.youthId}:${ctx.programId}`}
      ownerContext={ctx}
    />
  );
}

function PassCalendarBody(
  props: PassCalendarProps & {
    ownerContext?: Extract<
      ConstituentPassContext,
      { status: "ok" }
    >;
  },
) {
  const navigate = useNavigate();
  const { openCreate, openView } = usePassDialog();
  const today = todayIso();

  const [view, setView] = useState<CalendarView>("week");
  const [selected, setSelected] = useState(today);
  // `selected` is the one authoritative date. The date control always shows
  // it, except while the user is mid-way through typing a new one (draft).
  const [dateDraft, setDateDraft] = useState<string | null>(
    null,
  );
  function selectDate(iso: string) {
    setSelected(iso);
    setDateDraft(null);
  }
  const [programFilter, setProgramFilter] = useState("all");
  const [youthSel, setYouthSel] = useState<string[]>([]);
  const [statusSel, setStatusSel] = useState<string[]>([]);

  // Live view of the canonical store — re-renders on any Pass write.
  const allPasses = usePasses();
  const programName = useMemo(() => {
    const m = new Map(getPrograms().map((p) => [p.id, p.name]));
    return (id: number) => m.get(id) ?? "";
  }, []);

  // Hard scope, then Program / Youth (any of) / Status (any of) — AND.
  // Program scope: the Pass's own Program AND a youth currently active in
  // it, so a youth's Passes never follow them to another Program.
  const scoped = useMemo(
    () => {
      if (props.scope === "constituent") {
        // Applied before filters, the date range, layout and printing.
        const owner = props.ownerContext;
        return owner
          ? allPasses.filter((p) => isPassInContext(p, owner))
          : [];
      }
      if (props.scope !== "program") return allPasses;
      const active = getActivePassYouthIds(props.programId);
      return allPasses.filter(
        (p) =>
          p.programId === props.programId &&
          active.has(p.youthId),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      allPasses,
      props.scope,
      props.ownerContext?.youthId,
      props.ownerContext?.programId,
      (props as { programId?: number }).programId,
    ],
  );
  const visible = useMemo(
    () =>
      scoped.filter(
        (p) =>
          (programFilter === "all" ||
            String(p.programId) === programFilter) &&
          (youthSel.length === 0 ||
            youthSel.includes(p.youthId)) &&
          (statusSel.length === 0 ||
            statusSel.includes(p.status)),
      ),
    [scoped, programFilter, youthSel, statusSel],
  );

  const [rangeStart, rangeEnd] = viewRange(selected, view);
  const inRange = visible
    .filter((p) => overlaps(p, rangeStart, rangeEnd))
    .sort(
      (a, b) =>
        a.startDate.localeCompare(b.startDate) || a.id - b.id,
    );

  const youthOptions = useMemo(() => {
    // Youth on the scoped Passes; NAME resolves from CONSTITUENTS.
    const ids = new Set<string>(
      scoped.map((p: { youthId: string }) => p.youthId),
    );
    return [...ids]
      .map((id) => ({ value: id, label: getYouthName(id) }))
      .filter((o) => o.label)
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [scoped]);

  const hasFilters =
    programFilter !== "all" ||
    youthSel.length > 0 ||
    statusSel.length > 0;

  // ── Navigation ─────────────────────────────────────────────────────────
  const scopeState =
    props.scope === "program"
      ? {
          scope: "program",
          programId: props.programId,
          programName: programName(props.programId),
        }
      : { scope: "all" };

  const ownerLock =
    props.scope === "constituent"
      ? { constituentId: props.constituentId }
      : undefined;
  // Global / Program calendars are unchanged; the Constituent tab honors
  // the same create permission as its list.
  const canCreate =
    props.scope !== "constituent" ||
    (!!props.ownerContext && CURRENT_USER_CAN_CREATE_PASS);

  function newPass(dateIso?: string) {
    if (!canCreate) return;
    // Opens the Pass modal over the calendar (selected date, view and
    // filters stay as they are).
    openCreate({
      ...(props.scope === "program"
        ? { defaultProgramId: props.programId }
        : {}),
      ...(props.scope === "constituent"
        ? {
            defaultYouthId: props.ownerContext!.youthId,
            defaultProgramId: props.ownerContext!.programId,
            ownerLock,
          }
        : {}),
      ...(dateIso ? { defaultStartDate: dateIso } : {}),
    });
  }

  function openDay(iso: string) {
    selectDate(iso);
    setView("day");
  }

  function handlePrint() {
    const scopeLabel =
      props.scope === "program"
        ? programName(props.programId)
        : props.scope === "constituent"
          ? `${props.ownerContext?.youthName ?? ""} · ${props.ownerContext?.programName ?? ""}`
          : "All Programs";
    const filters = [
      programFilter !== "all"
        ? `Program: ${programName(Number(programFilter))}`
        : "",
      youthSel.length
        ? `Youth: ${youthSel.map(getYouthName).join(", ")}`
        : "",
      statusSel.length ? `Status: ${statusSel.join(", ")}` : "",
    ].filter(Boolean);
    printRecordsAsTable({
      title: `Passes — ${scopeLabel} — ${rangeLabel(selected, view)}${filters.length ? ` (${filters.join("; ")})` : ""}`,
      // Exactly the fields Story 20041 requires.
      columns: [
        "Youth",
        "Start Date",
        "Departure Time",
        "Staying Where",
        "End Date",
        "Return Time",
      ],
      rows: inRange.map((p) => [
        getYouthName(p.youthId),
        isoToMdy(p.startDate),
        p.departureTime,
        p.stayingAtAddress,
        isoToMdy(p.endDate),
        p.returnTime,
      ]),
    });
  }

  // ── Event bar (one Pass) with hover details; click → existing View ────
  function EventBar({
    pass,
    label,
    continuesBefore = false,
    continuesAfter = false,
  }: {
    pass: PassRecord;
    label: string;
    continuesBefore?: boolean;
    continuesAfter?: boolean;
  }) {
    return (
      <HoverCard openDelay={250}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            data-pass-id={pass.id}
            onClick={() => openView(pass.id, { ownerLock })}
            className={cn(
              badgeVariants({
                variant: PASS_STATUS_BADGE_VARIANT[pass.status],
              }),
              "w-full justify-start gap-1 overflow-hidden cursor-pointer",
            )}
            aria-label={`${pass.recordName} (${pass.status})`}
          >
            {continuesBefore && (
              <ChevronLeft
                className="h-3 w-3 flex-shrink-0"
                aria-label="continues from earlier"
              />
            )}
            <span
              className={cn(
                "truncate",
                pass.status === "Cancelled" && "line-through",
              )}
            >
              {label}
            </span>
            {pass.noteworthyDetails && (
              <StickyNote
                className="h-3 w-3 flex-shrink-0"
                aria-label="Has noteworthy details"
                data-icon="note"
              />
            )}
            {pass.packMedId != null && (
              <Pill
                className="h-3 w-3 flex-shrink-0"
                aria-label="Pack Med linked"
                data-icon="pill"
              />
            )}
            {continuesAfter && (
              <ChevronRight
                className="h-3 w-3 flex-shrink-0 ml-auto"
                aria-label="continues later"
              />
            )}
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-72 slds-text-3 space-y-1">
          <p className="font-semibold text-[var(--slds-g-color-text-default)]">
            {pass.recordName}
          </p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[var(--slds-g-color-text-default)]">
            <dt className="text-[var(--slds-g-color-text-weak)]">
              Youth
            </dt>
            <dd>{getYouthName(pass.youthId)}</dd>
            <dt className="text-[var(--slds-g-color-text-weak)]">
              Program
            </dt>
            <dd>{programName(pass.programId)}</dd>
            <dt className="text-[var(--slds-g-color-text-weak)]">
              Departs
            </dt>
            <dd>
              {isoToMdy(pass.startDate)} {pass.departureTime}
            </dd>
            <dt className="text-[var(--slds-g-color-text-weak)]">
              Returns
            </dt>
            <dd>
              {isoToMdy(pass.endDate)} {pass.returnTime}
            </dd>
            <dt className="text-[var(--slds-g-color-text-weak)]">
              Staying With
            </dt>
            <dd>{pass.stayingWithName}</dd>
            <dt className="text-[var(--slds-g-color-text-weak)]">
              Staying Where
            </dt>
            <dd>{pass.stayingAtAddress}</dd>
            <dt className="text-[var(--slds-g-color-text-weak)]">
              Status
            </dt>
            <dd>{pass.status}</dd>
            {pass.noteworthyDetails && (
              <>
                <dt className="text-[var(--slds-g-color-text-weak)]">
                  Noteworthy
                </dt>
                <dd>{pass.noteworthyDetails}</dd>
              </>
            )}
          </dl>
        </HoverCardContent>
      </HoverCard>
    );
  }

  function segmentLabel(s: WeekSegment, roomy: boolean) {
    const p = s.pass;
    const name = getYouthName(p.youthId);
    const time = s.continuesBefore ? "" : p.departureTime;
    const end = s.continuesAfter ? "" : ` → ${p.returnTime}`;
    return roomy
      ? `${name} · ${time ? time : "cont."}${end} · ${p.stayingAtAddress}`
      : `${time ? `${time} ` : ""}${name}`;
  }

  // ── A 7-day row: day headers + continuous bars spanning their days ────
  function WeekRow({
    days,
    mode,
  }: {
    days: string[];
    mode: "week" | "month";
  }) {
    const segs = layoutWeek(visible, days);
    const lanes = Math.max(1, ...segs.map((s) => s.lane + 1));
    const shown =
      mode === "month" ? Math.min(lanes, MONTH_LANES) : lanes;
    const month = parts(selected).m;
    const hiddenFor = (col: number) =>
      mode === "month"
        ? segs.filter(
            (s) =>
              s.lane >= MONTH_LANES &&
              s.startCol <= col &&
              s.endCol >= col,
          )
        : [];
    const anyHidden = days.some(
      (_, i) => hiddenFor(i).length > 0,
    );
    const rowCount = 1 + shown + (anyHidden ? 1 : 0);
    return (
      <div className="relative" data-week-start={days[0]}>
        {/* day cell backgrounds */}
        <div className="absolute inset-0 grid grid-cols-7">
          {days.map((d) => (
            <div
              key={d}
              className={cn(
                "border-r border-b border-border last:border-r-0",
                mode === "month" &&
                  parts(d).m !== month &&
                  "bg-[var(--slds-g-color-background-alt)]",
              )}
            />
          ))}
        </div>
        <div
          className="relative grid grid-cols-7 gap-y-1 pb-2"
          style={{
            gridTemplateRows: `auto repeat(${rowCount - 1}, minmax(1.5rem, auto))`,
          }}
        >
          {days.map((d, i) => (
            <div
              key={d}
              className="flex items-center justify-between px-1.5 pt-1"
              style={{ gridColumn: i + 1, gridRow: 1 }}
            >
              <button
                type="button"
                onClick={() => openDay(d)}
                aria-label={`Open ${isoToMdy(d)} in Day view`}
                data-day={d}
                className={cn(
                  "slds-text-3 h-6 min-w-6 px-1 rounded-full",
                  d === today
                    ? "bg-[var(--color-brand-primary)] text-white font-semibold"
                    : "text-[var(--slds-g-color-text-default)] hover:underline",
                )}
              >
                {mode === "week"
                  ? `${WEEKDAY_SHORT[i]} ${parts(d).d}`
                  : parts(d).d}
              </button>
              <Button
                type="button"
                variant="ghost-primary"
                size="icon-xs"
                onClick={() => newPass(d)}
                disabled={!canCreate}
                aria-label={`New Pass on ${isoToMdy(d)}`}
                title={`New Pass on ${isoToMdy(d)}`}
              >
                <Plus />
              </Button>
            </div>
          ))}
          {segs
            .filter((s) => s.lane < shown)
            .map((s) => (
              <div
                key={s.pass.id}
                className="px-1 min-w-0"
                style={{
                  gridColumn: `${s.startCol + 1} / ${s.endCol + 2}`,
                  gridRow: s.lane + 2,
                }}
              >
                <EventBar
                  pass={s.pass}
                  label={segmentLabel(
                    s,
                    mode === "week" && s.endCol > s.startCol,
                  )}
                  continuesBefore={s.continuesBefore}
                  continuesAfter={s.continuesAfter}
                />
              </div>
            ))}
          {anyHidden &&
            days.map((d, i) => {
              const hidden = hiddenFor(i);
              if (!hidden.length) return null;
              const all = visible.filter((p) =>
                overlaps(p, d, d),
              );
              return (
                <div
                  key={`more-${d}`}
                  className="px-1"
                  style={{
                    gridColumn: i + 1,
                    gridRow: rowCount,
                  }}
                >
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="link-info"
                        size="xs"
                        className="px-1"
                      >
                        +{hidden.length} more
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="w-64 space-y-1"
                    >
                      <p className="slds-text-3 font-semibold">
                        {isoToMdy(d)}
                      </p>
                      {all.map((p) => (
                        <EventBar
                          key={p.id}
                          pass={p}
                          label={`${p.departureTime} ${getYouthName(p.youthId)}`}
                        />
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  function DayView() {
    const items = visible.filter((p) =>
      overlaps(p, selected, selected),
    );
    return (
      <div className="p-4 space-y-2">
        {items.length === 0 ? (
          <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
            No Passes on this day.
          </p>
        ) : (
          items.map((p) => {
            const phase = dayPhase(p, selected);
            const [n, total] = dayOfPass(p, selected);
            const when =
              phase === "single"
                ? `${p.departureTime} – ${p.returnTime}`
                : phase === "departs"
                  ? `Departs ${p.departureTime} · returns ${isoToMdy(p.endDate)} ${p.returnTime}`
                  : phase === "returns"
                    ? `Returns ${p.returnTime} · departed ${isoToMdy(p.startDate)} ${p.departureTime}`
                    : `In progress (departed ${isoToMdy(p.startDate)} ${p.departureTime}, returns ${isoToMdy(p.endDate)} ${p.returnTime})`;
            return (
              <div
                key={p.id}
                className="grid grid-cols-1 sm:grid-cols-[12rem_1fr] gap-2 items-center border-b border-border pb-2"
                data-day-item={p.id}
              >
                <EventBar
                  pass={p}
                  label={getYouthName(p.youthId)}
                  continuesBefore={
                    phase === "continues" || phase === "returns"
                  }
                  continuesAfter={
                    phase === "continues" || phase === "departs"
                  }
                />
                <div className="slds-text-3 text-[var(--slds-g-color-text-default)] min-w-0">
                  <p data-phase={phase}>
                    {when}
                    {total > 1 && (
                      <span className="text-[var(--slds-g-color-text-weak)]">
                        {" "}
                        · Day {n} of {total}
                      </span>
                    )}
                  </p>
                  <p className="truncate text-[var(--slds-g-color-text-weak)]">
                    {programName(p.programId)} ·{" "}
                    {p.stayingAtAddress}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDaysIso(startOfWeekIso(selected), i),
  );

  return (
    <div className="overflow-hidden rounded-[var(--slds-c-card-radius-border)] border border-border bg-[var(--slds-g-color-background-base)]">
      {/* Toolbar */}
      <div className="px-4 py-3 space-y-3 border-b border-border">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => selectDate(todayIso())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous"
            onClick={() =>
              selectDate(shiftIso(selected, view, -1))
            }
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next"
            onClick={() =>
              selectDate(shiftIso(selected, view, 1))
            }
          >
            <ChevronRight />
          </Button>
          <h2
            className="slds-text-5 font-semibold px-1 text-[var(--slds-g-color-text-default)]"
            data-range-label
          >
            {rangeLabel(selected, view)}
          </h2>
          <div className="w-40">
            <DateInput
              id="pass-cal-date"
              value={dateDraft ?? isoToMdy(selected)}
              onChange={(v) => {
                if (isValidMdy(v)) selectDate(mdyToIso(v));
                else setDateDraft(v);
              }}
            />
          </div>
          <ToggleGroup
            type="single"
            variant="outline"
            value={view}
            onValueChange={(v) =>
              v && setView(v as CalendarView)
            }
            aria-label="Calendar view"
          >
            <ToggleGroupItem value="day" aria-label="Day">
              Day
            </ToggleGroupItem>
            <ToggleGroupItem value="week" aria-label="Week">
              Week
            </ToggleGroupItem>
            <ToggleGroupItem value="month" aria-label="Month">
              Month
            </ToggleGroupItem>
          </ToggleGroup>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              data-view-switch
              onClick={() =>
                props.onListView
                  ? props.onListView()
                  : navigate("/pass", { state: scopeState })
              }
            >
              <List /> List View
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer /> Print
            </Button>
            <Button
              onClick={() => newPass()}
              disabled={!canCreate}
            >
              <Plus /> New Pass
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {props.scope === "all" && (
            <Select
              value={programFilter}
              onValueChange={setProgramFilter}
            >
              <SelectTrigger
                surface="base"
                className="w-48"
                aria-label="Program"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Programs
                </SelectItem>
                {getPrograms()
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
          {props.scope !== "constituent" && (
            <MultiSelectFilter
              label="Youth"
              allLabel="All Youth"
              options={youthOptions}
              selected={youthSel}
              onChange={setYouthSel}
            />
          )}
          <MultiSelectFilter
            label="Status"
            allLabel="All Statuses"
            options={PASS_STATUS_OPTIONS.map((s) => ({
              value: s,
              label: s,
            }))}
            selected={statusSel}
            onChange={(v) => setStatusSel(v as PassStatus[])}
          />
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setProgramFilter("all");
                setYouthSel([]);
                setStatusSel([]);
              }}
            >
              Clear Filters <X />
            </Button>
          )}
          <span
            className="slds-text-3 text-[var(--slds-g-color-text-weak)]"
            data-count
          >
            {inRange.length === 0
              ? "No Passes in this range"
              : `${inRange.length} Pass${inRange.length === 1 ? "" : "es"} in this range`}
          </span>
        </div>
      </div>

      {/* Body — horizontal scroll stays inside this region */}
      <div className="overflow-x-auto">
        <div
          className={view === "day" ? "" : "min-w-[700px]"}
          data-view={view}
        >
          {view === "day" && <DayView />}
          {view === "week" && (
            <WeekRow days={weekDays} mode="week" />
          )}
          {view === "month" && (
            <>
              <div className="grid grid-cols-7 border-b border-border bg-[var(--slds-g-color-background-alt)]">
                {WEEKDAY_SHORT.map((w) => (
                  <div
                    key={w}
                    className="slds-text-3 px-1.5 py-1 font-semibold text-[var(--slds-g-color-text-weak)]"
                  >
                    {w}
                  </div>
                ))}
              </div>
              {monthGridWeeks(selected).map((wk) => (
                <WeekRow key={wk[0]} days={wk} mode="month" />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}