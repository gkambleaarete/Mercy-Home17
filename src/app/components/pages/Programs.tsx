import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Plus,
  ChevronDown,
  Pencil,
  X,
  LayoutGrid,
  RefreshCw,
  AlertCircle,
} from "@/app/lib/lucide-icons";
import { EmptyState } from "../ui/empty-state";
import { Button } from "../ui/button";
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
import { Badge } from "../ui/badge";
import { useTodayIso } from "../../lib/useTodayIso";
import { PaginationInfo } from "../ui/pagination";
import { TablePaginationBar } from "../ui/table-toolbar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  type ProgramRecord,
  CAMPUS_OPTIONS,
  AGE_RANGE_OPTIONS,
  PROGRAM_STATUS_OPTIONS,
  getPrograms,
  getProgramDataStatus,
  refreshProgramsFromStorage,
  getCapacitySnapshots,
  resolveCapacityForDate,
  programStatusBadgeVariant,
  CURRENT_USER_IS_SYSTEM_ADMIN,
} from "../../data/mockProgramsData";
import { getActiveYouthForProgram } from "../../data/mockYouthProgramData";

// The Program record page (view/edit/create) lives at /program/:id,
// /program/:id/edit and /program/new — see ProgramRecordPage.tsx. This file
// is the List View only (19845): Campus / Age / Status filters, sorting,
// pagination, and navigation into the record page or the Program's Log.
// Create and Edit are System Admin only and fully hidden for Staff.

type SortCol =
  "campus" | "name" | "ageRange" | "capacity" | "status";

const PAGE_SIZE = 5;

const sldsBorder =
  "1px solid var(--slds-g-color-border-base-1)";
const sldsWeak = "var(--slds-g-color-text-weak)";
const sldsDefault = "var(--slds-g-color-text-default)";
const sldsBase = "var(--slds-g-color-background-base)";
const sldsAlt = "var(--slds-g-color-background-alt)";
// Non-sortable header cells — same treatment as SortHead's inactive state.
const plainHeadStyle = {
  color: sldsWeak,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
} as const;

// Filter dropdown — shared trigger treatment for Campus / Age / Status.
function FilterSelect({
  value,
  onChange,
  allLabel,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  allLabel: string;
  options: readonly string[];
  ariaLabel: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        surface="base"
        className="h-9 slds-text-4 w-40"
        aria-label={ariaLabel}
        style={{
          border: sldsBorder,
          backgroundColor: sldsBase,
          borderRadius: "var(--slds-c-input-radius-border)",
        }}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function Programs() {
  const navigate = useNavigate();

  // ── Data — read fresh from the shared store on every mount, so a Program
  // created/edited (or a Capacity Snapshot added) from the Program Record
  // page is reflected here as soon as the user navigates back, with no
  // browser refresh required. ────────────────────────────────────────────
  // Re-read when the date rolls over so derived Status and the effective
  // Capacity (below) update while the list stays open (19989 / 17673).
  const todayIsoStr = useTodayIso();
  // Bumped by Refresh to re-read Programs, Capacity Snapshots and active
  // Youth from the shared stores (no browser reload).
  const [dataVersion, setDataVersion] = useState(0);
  const programs = useMemo<ProgramRecord[]>(
    () => getPrograms(),
    [todayIsoStr, dataVersion],
  );
  const capacitySnapshots = useMemo(
    () => getCapacitySnapshots(),
    [dataVersion],
  );

  // Active = unique Constituent IDs with an active association to the
  // Program — the same query as the Program Record's Active Youth list
  // (not the seed's sample activeConstituents count).
  const activeYouthCountById = useMemo(() => {
    const map = new Map<number, number>();
    programs.forEach((p) =>
      map.set(
        p.id,
        new Set(
          getActiveYouthForProgram(p.id).map(
            (y) => y.constituentId,
          ),
        ).size,
      ),
    );
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programs, dataVersion]);

  // Effective Capacity for every program, resolved from snapshots as of
  // today. Recomputed on every render, so the date rolling over is
  // reflected immediately — no manual refresh needed.
  const currentCapacityById = useMemo(() => {
    const map = new Map<number, number | null>();
    programs.forEach((p) => {
      const snap = resolveCapacityForDate(
        p.id,
        capacitySnapshots,
        todayIsoStr,
      );
      map.set(p.id, snap ? snap.capacity : null);
    });
    return map;
  }, [programs, capacitySnapshots, todayIsoStr]);

  // ── List filters / sort / pagination ──────────────────────────────────────
  const [filterCampus, setFilterCampus] = useState("all");
  const [filterAgeRange, setFilterAgeRange] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortCol, setSortCol] = useState<SortCol | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterCampus, filterAgeRange, filterStatus]);

  const hasFilters =
    filterCampus !== "all" ||
    filterAgeRange !== "all" ||
    filterStatus !== "all";

  function clearFilters() {
    setFilterCampus("all");
    setFilterAgeRange("all");
    setFilterStatus("all");
  }

  // Re-reads data only; filters, sort and page are kept (page is clamped
  // below if the refreshed results have fewer pages).
  function handleRefresh() {
    setDataVersion((v) => v + 1);
  }

  function handleSort(col: SortCol) {
    if (sortCol === col)
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
    setPage(1);
  }

  const filtered = useMemo(
    () =>
      programs.filter(
        (p) =>
          (filterCampus === "all" ||
            p.campus === filterCampus) &&
          (filterAgeRange === "all" ||
            p.ageRange === filterAgeRange) &&
          (filterStatus === "all" || p.status === filterStatus),
      ),
    [programs, filterCampus, filterAgeRange, filterStatus],
  );

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      if (sortCol === "capacity") {
        const aNum = currentCapacityById.get(a.id) ?? -1;
        const bNum = currentCapacityById.get(b.id) ?? -1;
        return sortDir === "asc" ? aNum - bNum : bNum - aNum;
      }
      const aVal = (a[sortCol] as string) ?? "";
      const bVal = (b[sortCol] as string) ?? "";
      const cmp = aVal.localeCompare(bVal);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir, currentCapacityById]);

  const totalPages = Math.max(
    1,
    Math.ceil(sorted.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);
  const pageRows = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const showStart =
    sorted.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showEnd = Math.min(safePage * PAGE_SIZE, sorted.length);

  // ── Sort header ───────────────────────────────────────────────────────────
  // Called as a render function (not <SortHead/>), so the header button
  // keeps keyboard focus across re-renders. The native button gives Tab /
  // Enter / Space; aria-sort sits on the active <th> only.
  function sortHead(
    col: SortCol,
    label: string,
    width?: string,
  ) {
    const active = sortCol === col;
    return (
      <TableHead
        key={col}
        className="px-3 h-10"
        aria-sort={
          active
            ? sortDir === "asc"
              ? "ascending"
              : "descending"
            : undefined
        }
        style={{
          color: active ? "#145F33" : sldsWeak,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.04em",
          width,
          whiteSpace: "nowrap",
        }}
      >
        <button
          type="button"
          onClick={() => handleSort(col)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "none",
            padding: 0,
            color: "inherit",
            font: "inherit",
            letterSpacing: "inherit",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          {label}
          <ChevronDown
            aria-hidden="true"
            className="h-3 w-3"
            style={
              active
                ? {
                    transform:
                      sortDir === "asc"
                        ? "rotate(180deg)"
                        : undefined,
                  }
                : { opacity: 0.3 }
            }
          />
        </button>
      </TableHead>
    );
  }

  // Saved Programs that can't be read are an error, never an empty list —
  // and they are left untouched.
  if (getProgramDataStatus() === "unreadable")
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={AlertCircle}
          tone="error"
          title="Programs could not be loaded"
          description="Saved Program data could not be read. Nothing has been changed."
          actionLabel="Try again"
          actionIcon={RefreshCw}
          actionVariant="outline"
          onAction={() => {
            refreshProgramsFromStorage();
            setDataVersion((v) => v + 1);
          }}
        />
      </div>
    );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    // The page's single vertical scroll region (the app shell's <main> is
    // overflow-hidden and hands scrolling to each page — same pattern as
    // ProgramRecordPage). pb-16 clears the fixed 40px UtilityBar so the
    // table and pagination are never hidden behind it.
    <div
      className="flex-1 min-h-0 overflow-y-auto pb-16"
      style={{
        backgroundColor: "var(--slds-g-color-background-alt-2)",
      }}
    >
      {/* ── Page header ── */}
      <div className="px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-start gap-3">
          <LayoutGrid
            className="h-8 w-8 mt-0.5 flex-shrink-0"
            style={{ color: "#145F33" }}
          />
          <div>
            <p
              className="slds-text-3 uppercase tracking-widest font-semibold"
              style={{ color: sldsWeak }}
            >
              Dashboard
            </p>
            <h1
              className="slds-page-header-title"
              style={{ color: sldsDefault }}
            >
              Programs
            </h1>
          </div>
        </div>
        {/* Right: Action Controls */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Refresh"
                onClick={handleRefresh}
              >
                <RefreshCw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>

          {/* Divider */}
          <div
            className="h-6 w-px mx-1"
            style={{
              backgroundColor:
                "var(--slds-g-color-border-base-1)",
            }}
          />
          {/* Create — System Admin only (19845/17673) */}
          {CURRENT_USER_IS_SYSTEM_ADMIN && (
            <Button
              className="h-9 rounded-full slds-text-4 text-white shadow-none flex-shrink-0 flex items-center gap-1.5"
              style={{ backgroundColor: "#145F33" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#0e4524")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#145F33")
              }
              onClick={() => navigate("/program/new")}
            >
              <Plus className="h-3.5 w-3.5" />
              New Program
            </Button>
          )}
        </div>
      </div>

      {/* ── Card ── */}
      <div
        className="overflow-hidden mx-6"
        style={{
          border: sldsBorder,
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor: sldsBase,
        }}
      >
        {/* Card Header — filters */}
        <div
          className="px-4 py-2 flex flex-wrap items-center justify-end gap-2 flex-shrink-0"
          style={{ borderBottom: sldsBorder }}
        >
          <FilterSelect
            value={filterCampus}
            onChange={setFilterCampus}
            allLabel="All Campuses"
            options={CAMPUS_OPTIONS}
            ariaLabel="Campus"
          />
          <FilterSelect
            value={filterAgeRange}
            onChange={setFilterAgeRange}
            allLabel="All Ages"
            options={AGE_RANGE_OPTIONS}
            ariaLabel="Age"
          />
          <FilterSelect
            value={filterStatus}
            onChange={setFilterStatus}
            allLabel="All Statuses"
            options={PROGRAM_STATUS_OPTIONS}
            ariaLabel="Status"
          />
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Clear <X />
            </Button>
          )}
        </div>

        {/* Card Body — table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader style={{ backgroundColor: sldsAlt }}>
              <TableRow style={{ borderBottom: sldsBorder }}>
                {sortHead("name", "PROGRAM")}
                {sortHead("campus", "CAMPUS")}
                {sortHead("ageRange", "AGE RANGE")}
                {sortHead("capacity", "ACTIVE / CAPACITY")}
                <TableHead
                  className="px-3 h-10"
                  style={plainHeadStyle}
                >
                  PROGRAM LOG
                </TableHead>
                <TableHead
                  className="px-3 h-10"
                  style={plainHeadStyle}
                >
                  ENGAGEMENT DASHBOARD
                </TableHead>
                {sortHead("status", "STATUS")}
                {/* Actions (Edit) — System Admin only; Staff get no
                    column at all rather than an empty one. */}
                {CURRENT_USER_IS_SYSTEM_ADMIN && (
                  <TableHead
                    className="px-3 h-10"
                    style={plainHeadStyle}
                  >
                    ACTIONS
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      CURRENT_USER_IS_SYSTEM_ADMIN ? 8 : 7
                    }
                  >
                    <div
                      className="py-12 text-center"
                      style={{ color: sldsWeak }}
                    >
                      <p className="text-[14px] font-medium mb-1">
                        {hasFilters
                          ? "No Programs match your filters."
                          : "No Programs found."}
                      </p>
                      {hasFilters ? (
                        <button
                          onClick={clearFilters}
                          className="slds-text-4 underline"
                          style={{
                            color: "#145F33",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Clear filters
                        </button>
                      ) : CURRENT_USER_IS_SYSTEM_ADMIN ? (
                        <button
                          onClick={() =>
                            navigate("/program/new")
                          }
                          className="slds-text-4 underline"
                          style={{
                            color: "#145F33",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          + New Program
                        </button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((p) => (
                  <TableRow
                    key={p.id}
                    style={{ borderBottom: sldsBorder }}
                    className="hover:bg-[#fafaf9] transition-colors"
                  >
                    {/* Program Name — View trigger */}
                    <TableCell className="px-3 py-3 slds-text-4">
                      <Link
                        to={`/program/${p.id}`}
                        className="font-medium text-left hover:underline focus:outline-none focus:underline text-[14px]"
                        style={{
                          color: "var(--color-link-blue)",
                        }}
                        aria-label={`View ${p.name}`}
                      >
                        {p.name}
                      </Link>
                    </TableCell>

                    <TableCell
                      className="px-3 py-3 slds-text-4"
                      style={{ color: sldsDefault }}
                    >
                      {p.campus || "—"}
                    </TableCell>

                    <TableCell
                      className="px-3 py-3 slds-text-4"
                      style={{ color: sldsDefault }}
                    >
                      {p.ageRange || "—"}
                    </TableCell>

                    <TableCell
                      className="px-3 py-3 slds-text-4"
                      style={{ color: sldsDefault }}
                      title="Active Youth / Capacity"
                    >
                      {activeYouthCountById.get(p.id) ?? 0} /{" "}
                      {currentCapacityById.get(p.id) ?? "—"}
                    </TableCell>

                    {/* Program Log — straight to this Program's Log;
                        every user who can see this list */}
                    <TableCell className="px-3 py-3">
                      <Button
                        asChild
                        variant="link-info"
                        size="sm"
                        className="px-0"
                      >
                        <Link
                          to={`/program-log?programId=${p.id}`}
                          aria-label={`Open Program Log for ${p.name}`}
                        >
                          Program Log
                        </Link>
                      </Button>
                    </TableCell>

                    {/* Engagement Dashboard — placeholder until the
                        dashboard exists (no route yet); not interactive. */}
                    <TableCell
                      className="px-3 py-3 slds-text-4"
                      style={{ color: sldsWeak }}
                    >
                      —
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <Badge
                        variant={programStatusBadgeVariant(
                          p.status,
                        )}
                      >
                        {p.status}
                      </Badge>
                    </TableCell>

                    {/* Edit — System Admin only */}
                    {CURRENT_USER_IS_SYSTEM_ADMIN && (
                      <TableCell className="px-3 py-3">
                        <Button
                          type="button"
                          variant="ghost-primary"
                          size="icon-xs"
                          onClick={() =>
                            navigate(`/program/${p.id}/edit`)
                          }
                          aria-label={`Edit ${p.name}`}
                          title="Edit Program"
                        >
                          <Pencil />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Card Footer — pagination */}
        <div
          className="px-4 py-2.5 flex items-center justify-between flex-shrink-0"
          style={{
            borderTop: sldsBorder,
            backgroundColor: sldsBase,
          }}
        >
          {totalPages > 1 ? (
            <TablePaginationBar
              className="w-full"
              start={showStart}
              end={showEnd}
              total={sorted.length}
              countLabel="records"
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
              label="records"
            />
          )}
        </div>
      </div>
    </div>
  );
}