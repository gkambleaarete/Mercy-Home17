import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { usePassDialog } from "../../contexts/PassDialogContext";
import {
  type ConstituentPassContext,
  PASS_CONTEXT_UNAVAILABLE_MESSAGE,
  isPassInContext,
  useConstituentPassContext,
} from "../../lib/constituentPassContext";
import {
  CalendarDays,
  ChevronDown,
  Copy,
  Eye,
  Pencil,
  Plus,
  Search,
  Ticket,
  X,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { DateInput } from "../ui/date-input";
import { EmptyState } from "../ui/empty-state";
import { SearchableSelect } from "../ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { PaginationInfo } from "../ui/pagination";
import { TablePaginationBar } from "../ui/table-toolbar";
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
  getCurrentProgramIdForYouth,
  getYouthName,
} from "../../data/mockYouthProgramData";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import {
  type PassRelativeDate,
  PASS_RELATIVE_DATE_OPTIONS,
  relativeDateRange,
  timeToMinutes,
} from "../../lib/passes";

// The ONE Pass list (19992). Every entry point renders this component with a
// scope instead of its own table:
//   scope="all"                     Pass object (/pass)
//   scope="program" programId=…     Program Record → Pass
//   scope="youth"   youthId=…       Constituent profile (all Programs)
//   scope="constituent" constituentId=…  Constituent Pass tab: that
//                                   Constituent AND its resolved current
//                                   Program only (Youth/Program fixed)
// The scope is a HARD filter applied before search/filters and never
// cleared by them. Pipeline: canonical getPasses() → scope → search →
// filters → sort → pagination.

export type PassListScope =
  | { scope: "all" }
  | { scope: "program"; programId: number }
  | { scope: "youth"; youthId: string }
  | { scope: "constituent"; constituentId: number };

type SortCol =
  | "youth"
  | "program"
  | "startDate"
  | "departureTime"
  | "endDate"
  | "returnTime"
  | "stayingWith"
  | "stayingAt"
  | "repeats"
  | "status"
  | "noteworthyDetails";

const PAGE_SIZE = 10;

function isRepeating(p: PassRecord): boolean {
  return !!p.seriesId;
}

export type PassListProps = PassListScope & {
  /** Embedded workspace (Constituent Pass tab): switch to the profile's
   *  calendar instead of navigating away. Without it, Calendar View keeps
   *  its route navigation (global / Program lists only). */
  onCalendarView?: () => void;
};

export function PassList(props: PassListProps) {
  if (props.scope === "constituent")
    return <ConstituentPassListGate {...props} />;
  return <PassListBody {...props} />;
}

/** Constituent scope: the list exists only while the Constituent is
 *  eligible and has a uniquely resolved current Program — never an
 *  unscoped list. */
function ConstituentPassListGate(props: {
  scope: "constituent";
  constituentId: number;
  onCalendarView?: () => void;
}) {
  const ctx = useConstituentPassContext(props.constituentId);
  if (!ctx || ctx.status === "ineligible")
    return (
      <p
        role="alert"
        className="slds-text-4 text-[var(--slds-g-color-text-weak)]"
      >
        This Constituent is not eligible for Pass records.
      </p>
    );
  if (ctx.status !== "ok")
    return (
      <p
        role="alert"
        data-testid="pass-context-unavailable"
        className="slds-text-4 rounded border px-3 py-2 border-[#c23934] text-[#c23934] bg-white"
      >
        {PASS_CONTEXT_UNAVAILABLE_MESSAGE}
      </p>
    );
  return (
    <PassListBody
      {...props}
      // A different Program is a different list (fresh filters/paging).
      key={`${ctx.youthId}:${ctx.programId}`}
      ownerContext={ctx}
    />
  );
}

function PassListBody(
  props: PassListProps & {
    ownerContext?: Extract<
      ConstituentPassContext,
      { status: "ok" }
    >;
  },
) {
  const navigate = useNavigate();
  const { openCreate, openEdit, openView } = usePassDialog();
  const today = todayIso();

  // Live view of the canonical store — re-renders on any Pass write.
  const allPasses = usePasses();

  const programName = useMemo(() => {
    const m = new Map(getPrograms().map((p) => [p.id, p.name]));
    return (id: number) => m.get(id) ?? "";
  }, []);

  // ── Hard scope ─────────────────────────────────────────────────────────
  // Program scope matches the Pass Calendar: the Pass's own Program AND a
  // youth currently active in it.
  const scoped = useMemo(
    () => {
      const active =
        props.scope === "program"
          ? getActivePassYouthIds(props.programId)
          : null;
      const owner = props.ownerContext;
      return allPasses.filter((p) =>
        props.scope === "program"
          ? p.programId === props.programId &&
            active!.has(p.youthId)
          : props.scope === "youth"
            ? p.youthId === props.youthId
            : props.scope === "constituent"
              ? !!owner && isPassInContext(p, owner)
              : true,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      allPasses,
      props.scope,
      props.ownerContext?.youthId,
      props.ownerContext?.programId,
      (props as { programId?: number }).programId,
      (props as { youthId?: string }).youthId,
    ],
  );

  // Youth/Program are fixed by the scope (no Youth/Program switching and no
  // Calendar View from a Constituent profile).
  const fixedOwner =
    props.scope === "youth" || props.scope === "constituent";
  const canCreate =
    props.scope !== "constituent" ||
    (!!props.ownerContext && CURRENT_USER_CAN_CREATE_PASS);

  // ── User filters (never touch the scope) ───────────────────────────────
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [relative, setRelative] =
    useState<PassRelativeDate>("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [youthFilter, setYouthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | PassStatus
  >("all");
  const [repeatsFilter, setRepeatsFilter] = useState<
    "all" | "yes" | "no"
  >("all");
  const [sortCol, setSortCol] = useState<SortCol>("startDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const hasFilters =
    !!search ||
    !!fromDate ||
    !!toDate ||
    relative !== "all" ||
    programFilter !== "all" ||
    !!youthFilter ||
    statusFilter !== "all" ||
    repeatsFilter !== "all";

  function clearFilters() {
    setSearch("");
    setFromDate("");
    setToDate("");
    setRelative("all");
    setProgramFilter("all");
    setYouthFilter("");
    setStatusFilter("all");
    setRepeatsFilter("all");
  }

  useEffect(() => {
    setPage(1);
  }, [
    search,
    fromDate,
    toDate,
    relative,
    programFilter,
    youthFilter,
    statusFilter,
    repeatsFilter,
  ]);

  // Explicit date range (Pass Start Date). Applied only when valid.
  const fromIso = isValidMdy(fromDate)
    ? mdyToIso(fromDate)
    : "";
  const toIso = isValidMdy(toDate) ? mdyToIso(toDate) : "";
  const rangeError =
    fromIso && toIso && toIso < fromIso
      ? "To Date cannot be before From Date."
      : "";
  const relRange = relativeDateRange(relative, today);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scoped.filter((p) => {
      if (q) {
        const haystack = [
          getYouthName(p.youthId),
          programName(p.programId),
          p.stayingWithName,
          p.stayingAtAddress,
          p.noteworthyDetails,
          p.status,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (!rangeError) {
        if (fromIso && p.startDate < fromIso) return false;
        if (toIso && p.startDate > toIso) return false;
      }
      if (
        relRange &&
        (p.startDate < relRange[0] || p.startDate > relRange[1])
      )
        return false;
      if (
        programFilter !== "all" &&
        String(p.programId) !== programFilter
      )
        return false;
      if (youthFilter && p.youthId !== youthFilter)
        return false;
      if (statusFilter !== "all" && p.status !== statusFilter)
        return false;
      if (repeatsFilter === "yes" && !isRepeating(p))
        return false;
      if (repeatsFilter === "no" && isRepeating(p))
        return false;
      return true;
    });
  }, [
    scoped,
    search,
    fromIso,
    toIso,
    rangeError,
    relRange?.[0],
    relRange?.[1],
    programFilter,
    youthFilter,
    statusFilter,
    repeatsFilter,
    programName,
  ]);

  const sorted = useMemo(() => {
    const key = (p: PassRecord): string | number => {
      switch (sortCol) {
        case "youth":
          return getYouthName(p.youthId);
        case "program":
          return programName(p.programId);
        case "startDate":
          return p.startDate;
        case "endDate":
          return p.endDate;
        case "departureTime":
          return timeToMinutes(p.departureTime) ?? -1;
        case "returnTime":
          return timeToMinutes(p.returnTime) ?? -1;
        case "stayingWith":
          return p.stayingWithName;
        case "stayingAt":
          return p.stayingAtAddress;
        case "repeats":
          return isRepeating(p) ? 1 : 0;
        case "status":
          return p.status;
        case "noteworthyDetails":
          return p.noteworthyDetails;
      }
    };
    return [...filtered].sort((a, b) => {
      const ka = key(a);
      const kb = key(b);
      const cmp =
        typeof ka === "number" && typeof kb === "number"
          ? ka - kb
          : String(ka).localeCompare(String(kb));
      // Stable, chronological tie-break.
      const tie =
        cmp ||
        a.startDate.localeCompare(b.startDate) ||
        a.id - b.id;
      return sortDir === "asc" ? tie : -tie;
    });
  }, [filtered, sortCol, sortDir, programName]);

  const totalPages = Math.max(
    1,
    Math.ceil(sorted.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  // Row selection — "Copy" acts on exactly one selected Pass. Rows that
  // leave the filtered list are deselected.
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  useEffect(() => {
    setSelectedIds((prev) => {
      const next = prev.filter((id) =>
        sorted.some((p) => p.id === id),
      );
      return next.length === prev.length ? prev : next;
    });
  }, [sorted]);
  const toggleSelected = (id: number) =>
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id],
    );
  const pageIds = pageRows.map((p) => p.id);
  const allPageSelected =
    pageIds.length > 0 &&
    pageIds.every((id) => selectedIds.includes(id));
  const toggleAllOnPage = () =>
    setSelectedIds((prev) =>
      allPageSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : [...new Set([...prev, ...pageIds])],
    );
  const ownerLock =
    props.scope === "constituent"
      ? { constituentId: props.constituentId }
      : undefined;
  function copySelected() {
    if (selectedIds.length !== 1 || !canCreate) return;
    openCreate({ copyFromId: selectedIds[0], ownerLock });
  }

  const showStart =
    sorted.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showEnd = Math.min(safePage * PAGE_SIZE, sorted.length);

  function handleSort(col: SortCol) {
    if (sortCol === col)
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
    setPage(1);
  }

  // ── Filter option sources (within the scope) ──────────────────────────
  const programOptions = useMemo(
    () =>
      getPrograms()
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((p) => ({ value: String(p.id), label: p.name })),
    [],
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

  // ── New Pass — opens the Pass modal over this list (URL unchanged);
  // context defaults ride along as modal options.
  function newPass() {
    if (!canCreate) return;
    if (props.scope === "constituent") {
      openCreate({
        defaultYouthId: props.ownerContext!.youthId,
        defaultProgramId: props.ownerContext!.programId,
        ownerLock,
      });
      return;
    }
    openCreate(
      props.scope === "program"
        ? { defaultProgramId: props.programId }
        : props.scope === "youth"
          ? {
              defaultYouthId: props.youthId,
              // PassForm also derives this; passed explicitly for clarity.
              ...(getCurrentProgramIdForYouth(props.youthId) !==
              null
                ? {
                    defaultProgramId:
                      getCurrentProgramIdForYouth(
                        props.youthId,
                      )!,
                  }
                : {}),
            }
          : {},
    );
  }

  function SortHead({
    col,
    label,
  }: {
    col: SortCol;
    label: string;
  }) {
    const active = sortCol === col;
    return (
      <TableHead
        variant="slds"
        active={active}
        aria-sort={
          active
            ? sortDir === "asc"
              ? "ascending"
              : "descending"
            : "none"
        }
      >
        <button
          type="button"
          onClick={() => handleSort(col)}
          className="inline-flex items-center gap-1 uppercase [font:inherit] [letter-spacing:inherit]"
        >
          {label}
          <ChevronDown
            className={`h-3 w-3 ${active ? (sortDir === "asc" ? "rotate-180" : "") : "opacity-30"}`}
          />
        </button>
      </TableHead>
    );
  }

  const colCount = 13;

  return (
    <div className="overflow-hidden rounded-[var(--slds-c-card-radius-border)] border border-border bg-[var(--slds-g-color-background-base)]">
      {/* Toolbar — search, filters, actions */}
      <div className="px-4 py-3 space-y-3 border-b border-border">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-64 max-w-full">
            <Input
              size="md"
              surface="base"
              leadingIcon={<Search className="h-3.5 w-3.5" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search passes"
              aria-label="Search passes"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* Calendar (20041) — Pass object and Program scopes navigate to
                the route (scope carried over, so Program A's List opens
                Program A's Calendar). The Constituent Pass tab switches its
                embedded calendar instead; the youth scope has none. */}
            {(!fixedOwner ||
              (props.scope === "constituent" &&
                props.onCalendarView)) && (
              <Button
                variant="outline"
                data-view-switch
                onClick={() =>
                  props.onCalendarView
                    ? props.onCalendarView()
                    : navigate("/pass/calendar", {
                    state:
                      props.scope === "program"
                        ? {
                            scope: "program",
                            programId: props.programId,
                            programName: programName(
                              props.programId,
                            ),
                          }
                        : { scope: "all" },
                  })
                }
              >
                <CalendarDays /> Calendar View
              </Button>
            )}
            <Button
              variant="outline"
              onClick={copySelected}
              disabled={selectedIds.length !== 1 || !canCreate}
              title={
                selectedIds.length === 1
                  ? "Copy the selected Pass"
                  : "Select exactly one Pass to copy"
              }
            >
              <Copy /> Copy
            </Button>
            <Button onClick={newPass} disabled={!canCreate}>
              <Plus /> New Pass
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-2">
          <div className="w-40">
            <DateInput
              id="pass-filter-from"
              value={fromDate}
              onChange={setFromDate}
            />
            <p className="slds-text-3 mt-0.5 text-[var(--slds-g-color-text-weak)]">
              From
            </p>
          </div>
          <div className="w-40">
            <DateInput
              id="pass-filter-to"
              value={toDate}
              onChange={setToDate}
            />
            <p className="slds-text-3 mt-0.5 text-[var(--slds-g-color-text-weak)]">
              To
            </p>
          </div>

          <Select
            value={relative}
            onValueChange={(v) =>
              setRelative(v as PassRelativeDate)
            }
          >
            <SelectTrigger
              surface="base"
              className="w-40"
              aria-label="Relative date"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PASS_RELATIVE_DATE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {props.scope === "all" && (
            <Select
              value={programFilter}
              onValueChange={setProgramFilter}
            >
              <SelectTrigger
                surface="base"
                className="w-44"
                aria-label="Program"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Programs
                </SelectItem>
                {programOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {!fixedOwner && (
            <div className="w-48">
              <SearchableSelect
                value={youthFilter}
                onValueChange={setYouthFilter}
                options={youthOptions}
                placeholder="All Youth"
                searchPlaceholder="Search youth…"
                aria-label="Youth"
              />
            </div>
          )}

          <Select
            value={statusFilter}
            onValueChange={(v) =>
              setStatusFilter(v as "all" | PassStatus)
            }
          >
            <SelectTrigger
              surface="base"
              className="w-40"
              aria-label="Status"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {PASS_STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={repeatsFilter}
            onValueChange={(v) =>
              setRepeatsFilter(v as "all" | "yes" | "no")
            }
          >
            <SelectTrigger
              surface="base"
              className="w-40"
              aria-label="Repeats"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Repeating</SelectItem>
              <SelectItem value="no">Non-Repeating</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Clear Filters <X />
            </Button>
          )}
        </div>
        {rangeError && (
          <p
            role="alert"
            className="slds-text-3 text-[#c23934]"
          >
            {rangeError}
          </p>
        )}
      </div>

      {/* Table — scrolls horizontally inside this region only */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead variant="slds" className="w-10">
                <Checkbox
                  checked={allPageSelected}
                  onCheckedChange={toggleAllOnPage}
                  aria-label="Select all passes on this page"
                />
              </TableHead>
              <SortHead col="youth" label="Youth" />
              <SortHead col="program" label="Program" />
              <SortHead col="startDate" label="Start Date" />
              <SortHead
                col="departureTime"
                label="Departure Time"
              />
              <SortHead col="endDate" label="End Date" />
              <SortHead col="returnTime" label="Return Time" />
              <SortHead
                col="stayingWith"
                label="Who will the youth be staying with?"
              />
              <SortHead
                col="stayingAt"
                label="Where will the youth be staying?"
              />
              <SortHead col="repeats" label="Repeats" />
              <SortHead col="status" label="Status" />
              <SortHead
                col="noteworthyDetails"
                label="Noteworthy Details"
              />
              <TableHead variant="slds">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow hoverable={false}>
                <TableCell colSpan={colCount}>
                  {scoped.length === 0 ? (
                    <EmptyState
                      icon={Ticket}
                      title="No passes yet"
                      description="No Pass records exist here. Use New Pass to create one."
                    />
                  ) : (
                    <EmptyState
                      icon={Search}
                      title="No passes match the current filters"
                      description="Try changing the search or filters."
                    />
                  )}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(p.id)}
                      onCheckedChange={() =>
                        toggleSelected(p.id)
                      }
                      aria-label={`Select ${p.recordName}`}
                    />
                  </TableCell>
                  <TableCell>
                    {getYouthName(p.youthId) || "—"}
                  </TableCell>
                  <TableCell>
                    {programName(p.programId) || "—"}
                  </TableCell>
                  <TableCell>{isoToMdy(p.startDate)}</TableCell>
                  <TableCell>{p.departureTime}</TableCell>
                  <TableCell>{isoToMdy(p.endDate)}</TableCell>
                  <TableCell>{p.returnTime}</TableCell>
                  <TableCell>
                    {p.stayingWithName || "—"}
                  </TableCell>
                  <TableCell
                    className="max-w-[220px] truncate"
                    title={p.stayingAtAddress}
                  >
                    {p.stayingAtAddress || "—"}
                  </TableCell>
                  <TableCell>
                    {isRepeating(p) ? "Yes" : "No"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        PASS_STATUS_BADGE_VARIANT[p.status]
                      }
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="max-w-[220px] truncate"
                    title={p.noteworthyDetails}
                  >
                    {p.noteworthyDetails || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost-primary"
                        size="icon-xs"
                        onClick={() => openView(p.id, { ownerLock })}
                        aria-label={`View ${p.recordName}`}
                        title="View Pass"
                      >
                        <Eye />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost-primary"
                        size="icon-xs"
                        onClick={() => openEdit(p.id, { ownerLock })}
                        aria-label={`Edit ${p.recordName}`}
                        title="Edit Pass"
                      >
                        <Pencil />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer — shared Mercy Home pagination */}
      <div className="px-4 py-2.5 border-t border-border">
        {totalPages > 1 ? (
          <TablePaginationBar
            className="w-full"
            start={showStart}
            end={showEnd}
            total={sorted.length}
            countLabel="passes"
            currentPage={safePage}
            totalPages={totalPages}
            onPrevious={() => setPage(safePage - 1)}
            onNext={() => setPage(safePage + 1)}
          />
        ) : (
          <PaginationInfo
            start={showStart}
            end={showEnd}
            total={sorted.length}
            label="passes"
          />
        )}
      </div>
    </div>
  );
}