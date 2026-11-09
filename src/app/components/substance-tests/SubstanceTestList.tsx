import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Eye,
  Pencil,
  Search,
  ShieldAlert,
  X,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { DateInput } from "../ui/date-input";
import { EmptyState } from "../ui/empty-state";
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
  type ProgramSubstanceTest,
  useProgramSubstanceTests,
} from "../../data/mockSubstanceTestData";
import {
  getProgramById,
  isValidMdy,
} from "../../data/mockProgramsData";
import { getYouthNames } from "../../data/mockYouthProgramData";
import { mdyToIso } from "../../lib/dateFormat";
import { formatSampleDateTime } from "./substanceTestDateTime";
import { SubstanceTestViewDialog } from "./SubstanceTestViewDialog";
import { SubstanceTestEditDialog } from "./SubstanceTestEditDialog";

// Program Substance Tests — individual tests (20065). Same pipeline as the
// Pass List: canonical store → Program scope (stored programId, never current
// enrollment) → date filters → sort → pagination. Includes bulk-linked tests.

type SortCol =
  | "dateTime"
  | "youth"
  | "reason"
  | "newUse"
  | "results"
  | "substance"
  | "number";

const PAGE_SIZE = 12;

/** Every substance line across every test detail, in record order. */
function resultLines(t: ProgramSubstanceTest) {
  return t.testDetails.flatMap((d) => d.testResults);
}

// Multi-value columns sort on their values joined in record order.
function sortKey(
  t: ProgramSubstanceTest,
  col: SortCol,
): string {
  switch (col) {
    case "dateTime":
      return t.sampleDateTime;
    case "youth":
      return getYouthNames([t.constituentId]);
    case "reason":
      return t.reason;
    case "newUse":
      return t.newUse;
    case "results":
      return resultLines(t)
        .map((r) => r.result)
        .join(", ");
    case "substance":
      return resultLines(t)
        .map((r) => r.substance)
        .join(", ");
    case "number":
      // # is not yet defined by the BA: no value of its own, so rows fall
      // through to the chronological tie-break below.
      return "";
  }
}

/** One value per line, in the same order across Results and Substance. */
/** Results / Substance cells show a preview of this many lines; the rest
 *  are counted ("+N more") and shown in full by View. */
const PREVIEW_LINES = 2;

/** One value per line, in the same order across Results and Substance. Both
 *  columns cut at the same line and show the same "+N more", so the preview
 *  stays aligned. Nothing is summarized or interpreted. */
function LineList({ values }: { values: string[] }) {
  if (values.every((v) => !v)) return <>—</>;
  const hidden = values.length - PREVIEW_LINES;
  return (
    <ul>
      {values.slice(0, PREVIEW_LINES).map((v, i) => (
        <li key={i}>{v || "—"}</li>
      ))}
      {hidden > 0 && (
        <li className="text-[var(--slds-g-color-text-weak)]">
          +{hidden} more
        </li>
      )}
    </ul>
  );
}

export function SubstanceTestList({
  programId,
}: {
  programId: number;
}) {
  const allTests = useProgramSubstanceTests();
  const scoped = useMemo(
    () => allTests.filter((t) => t.programId === programId),
    [allTests, programId],
  );

  // ── Date filters (Sample Date, inclusive calendar days) ────────────────
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortCol, setSortCol] = useState<SortCol>("dateTime");
  const [sortDir, setSortDir] = useState<"asc" | "desc">(
    "desc",
  );
  const [page, setPage] = useState(1);

  const hasFilters = !!startDate || !!endDate;
  function clearFilters() {
    setStartDate("");
    setEndDate("");
  }
  useEffect(() => {
    setPage(1);
  }, [startDate, endDate]);

  // Applied only when complete and valid; an invalid date is reported, not
  // silently ignored or half-applied.
  const startIso = isValidMdy(startDate)
    ? mdyToIso(startDate)
    : "";
  const endIso = isValidMdy(endDate) ? mdyToIso(endDate) : "";
  const invalidStart = startDate.length === 10 && !startIso;
  const invalidEnd = endDate.length === 10 && !endIso;
  const filterError = invalidStart
    ? "Start Date is not a valid MM/DD/YYYY date."
    : invalidEnd
      ? "End Date is not a valid MM/DD/YYYY date."
      : startIso && endIso && endIso < startIso
        ? "End Date cannot be before Start Date."
        : "";

  const filtered = useMemo(() => {
    if (filterError) return scoped;
    return scoped.filter((t) => {
      const day = t.sampleDateTime.slice(0, 10);
      if (startIso && day < startIso) return false;
      if (endIso && day > endIso) return false;
      return true;
    });
  }, [scoped, startIso, endIso, filterError]);

  // ── Sort — blanks always last; ties fall back to Date/Time, then id ────
  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const ka = sortKey(a, sortCol);
      const kb = sortKey(b, sortCol);
      if (!ka !== !kb) return ka ? -1 : 1;
      const cmp =
        ka.localeCompare(kb) ||
        a.sampleDateTime.localeCompare(b.sampleDateTime) ||
        a.id - b.id;
      return cmp * dir;
    });
  }, [filtered, sortCol, sortDir]);

  function handleSort(col: SortCol) {
    if (sortCol === col)
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
    setPage(1);
  }

  // ── Pagination ─────────────────────────────────────────────────────────
  const totalPages = Math.max(
    1,
    Math.ceil(sorted.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const showStart =
    sorted.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showEnd = Math.min(safePage * PAGE_SIZE, sorted.length);

  // ── Selection — View / Edit act on exactly one test. Rows that leave the
  // filtered list are deselected. ───────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  useEffect(() => {
    setSelectedIds((prev) => {
      const next = prev.filter((id) =>
        sorted.some((t) => t.id === id),
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
  const pageIds = pageRows.map((t) => t.id);
  const allPageSelected =
    pageIds.length > 0 &&
    pageIds.every((id) => selectedIds.includes(id));
  const toggleAllOnPage = () =>
    setSelectedIds((prev) =>
      allPageSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : [...new Set([...prev, ...pageIds])],
    );
  const oneSelected = selectedIds.length === 1;

  // ── View / Edit — exactly one selected test, looked up by id within this
  // Program's records only. Selection is kept after closing (Pass List
  // pattern). Each Edit gets a fresh session key so it starts from the
  // store's current record. ────────────────────────────────────────────
  const programName = getProgramById(programId)?.name ?? "";
  const [viewId, setViewId] = useState<number | null>(null);
  const [edit, setEdit] = useState<{
    id: number;
    session: number;
  } | null>(null);
  const viewTest =
    viewId === null
      ? null
      : (scoped.find((t) => t.id === viewId) ?? null);
  const editTest =
    edit === null
      ? null
      : (scoped.find((t) => t.id === edit.id) ?? null);
  // Focus returns to View / Edit when their dialogs close (table fallback).
  const viewButtonRef = useRef<HTMLButtonElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const tableId = `substance-tests-table-${programId}`;
  function openView() {
    if (oneSelected) setViewId(selectedIds[0]);
  }
  function openEdit() {
    if (!oneSelected) return;
    setEdit((prev) => ({
      id: selectedIds[0],
      session: (prev?.session ?? 0) + 1,
    }));
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

  const colCount = 8;

  return (
    <>
      {/* Toolbar — date filters and record actions */}
      <div className="px-4 py-3 space-y-3 border-b border-border">
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-40">
            <label
              htmlFor="substance-test-filter-start"
              className="slds-form-label block mb-1.5 text-[var(--slds-g-color-text-weak)]"
            >
              Start Date
            </label>
            <DateInput
              id="substance-test-filter-start"
              value={startDate}
              onChange={setStartDate}
            />
          </div>
          <div className="w-40">
            <label
              htmlFor="substance-test-filter-end"
              className="slds-form-label block mb-1.5 text-[var(--slds-g-color-text-weak)]"
            >
              End Date
            </label>
            <DateInput
              id="substance-test-filter-end"
              value={endDate}
              onChange={setEndDate}
            />
          </div>
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Clear Filters <X />
            </Button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Button
              ref={viewButtonRef}
              variant="outline"
              onClick={openView}
              disabled={!oneSelected}
              title={
                oneSelected
                  ? "View the selected Substance Test"
                  : "Select exactly one Substance Test to view"
              }
            >
              <Eye /> View
            </Button>
            <Button
              ref={editButtonRef}
              variant="outline"
              onClick={openEdit}
              disabled={!oneSelected}
              title={
                oneSelected
                  ? "Edit the selected Substance Test"
                  : "Select exactly one Substance Test to edit"
              }
            >
              <Pencil /> Edit
            </Button>
          </div>
        </div>
        {filterError && (
          <p
            role="alert"
            className="slds-text-3 text-[#c23934]"
          >
            {filterError}
          </p>
        )}
      </div>

      {/* Table — scrolls horizontally inside this region only */}
      <div className="overflow-x-auto">
        {/* tabIndex -1: a focus fallback for closed dialogs, not a tab stop. */}
        <Table
          id={tableId}
          tabIndex={-1}
          aria-label="Substance Tests"
        >
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead variant="slds" className="w-10">
                <Checkbox
                  checked={allPageSelected}
                  onCheckedChange={toggleAllOnPage}
                  aria-label="Select all Substance Tests on this page"
                />
              </TableHead>
              <SortHead col="dateTime" label="Date / Time" />
              <SortHead col="youth" label="Youth" />
              <SortHead col="reason" label="Reason" />
              <SortHead col="newUse" label="New Use" />
              <SortHead col="results" label="Results" />
              <SortHead col="substance" label="Substance" />
              <SortHead col="number" label="#" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow hoverable={false}>
                <TableCell colSpan={colCount}>
                  {scoped.length === 0 ? (
                    <EmptyState
                      icon={ShieldAlert}
                      title="No Substance Tests yet"
                      description="No Substance Tests have been recorded for this Program."
                    />
                  ) : (
                    <EmptyState
                      icon={Search}
                      title="No Substance Tests match the current filters"
                      description="Try changing the dates or clear the filters."
                    />
                  )}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((t) => {
                const youth = getYouthNames([t.constituentId]);
                const dateTime = formatSampleDateTime(
                  t.sampleDateTime,
                );
                const lines = resultLines(t);
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(t.id)}
                        onCheckedChange={() =>
                          toggleSelected(t.id)
                        }
                        aria-label={`Select Substance Test for ${youth || "unknown youth"} on ${dateTime || "unknown date"}`}
                      />
                    </TableCell>
                    <TableCell>{dateTime || "—"}</TableCell>
                    <TableCell>{youth || "—"}</TableCell>
                    <TableCell>{t.reason || "—"}</TableCell>
                    <TableCell>{t.newUse || "—"}</TableCell>
                    <TableCell>
                      <LineList
                        values={lines.map((r) => r.result)}
                      />
                    </TableCell>
                    <TableCell>
                      <LineList
                        values={lines.map((r) => r.substance)}
                      />
                    </TableCell>
                    {/* # — meaning not yet defined by the BA. */}
                    <TableCell>—</TableCell>
                  </TableRow>
                );
              })
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
            countLabel="Substance Tests"
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
            label="Substance Tests"
          />
        )}
      </div>

      <SubstanceTestViewDialog
        test={viewTest}
        programName={programName}
        onClose={() => setViewId(null)}
        returnFocusTo={() => viewButtonRef.current}
        fallbackFocusId={tableId}
      />
      {edit && editTest && (
        <SubstanceTestEditDialog
          key={edit.session}
          test={editTest}
          onClose={() => setEdit(null)}
          returnFocusTo={() => editButtonRef.current}
          fallbackFocusId={tableId}
        />
      )}
    </>
  );
}