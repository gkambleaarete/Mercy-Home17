import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Layers,
  Pencil,
  Plus,
  Search,
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
import { useBulkSubstanceTestGroups } from "../../data/mockSubstanceTestData";
import {
  getProgramById,
  isValidMdy,
} from "../../data/mockProgramsData";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import { BulkSubstanceTestDialog } from "./BulkSubstanceTestDialog";

// Program Bulk Substance Tests (20065 / 20066). Same pipeline and patterns as
// SubstanceTestList: canonical store → Program scope (stored programId) →
// date filters → sort → pagination. Filters, sort and selection are this
// section's own and never touch the individual list.

type SortCol = "dateTime" | "reason";

const PAGE_SIZE = 12;

/** "YYYY-MM-DDTHH:mm" → "MM/DD/YYYY hh:mm AM". "" when not parseable.
 *  Same output as SubstanceTestList's formatter. */
function formatSampleDateTime(value: string): string {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return "";
  const hours = Number(m[2]);
  const hh = String(hours % 12 || 12).padStart(2, "0");
  return `${isoToMdy(m[1])} ${hh}:${m[3]} ${hours < 12 ? "AM" : "PM"}`;
}

export function BulkSubstanceTestList({
  programId,
}: {
  programId: number;
}) {
  const allGroups = useBulkSubstanceTestGroups();
  const scoped = useMemo(
    () => allGroups.filter((g) => g.programId === programId),
    [allGroups, programId],
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
    return scoped.filter((g) => {
      const day = g.sampleDateTime.slice(0, 10);
      if (startIso && day < startIso) return false;
      if (endIso && day > endIso) return false;
      return true;
    });
  }, [scoped, startIso, endIso, filterError]);

  // ── Sort — blanks always last; ties fall back to Date/Time, then id ────
  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const ka =
        sortCol === "dateTime" ? a.sampleDateTime : a.reason;
      const kb =
        sortCol === "dateTime" ? b.sampleDateTime : b.reason;
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

  // ── Selection — Modify will act on exactly one group. Rows that leave the
  // filtered list are deselected. ───────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  useEffect(() => {
    setSelectedIds((prev) => {
      const next = prev.filter((id) =>
        sorted.some((g) => g.id === id),
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
  const pageIds = pageRows.map((g) => g.id);
  const allPageSelected =
    pageIds.length > 0 &&
    pageIds.every((id) => selectedIds.includes(id));
  const toggleAllOnPage = () =>
    setSelectedIds((prev) =>
      allPageSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : [...new Set([...prev, ...pageIds])],
    );
  // Modify acts on exactly one selected group of THIS Program.
  const canModify =
    selectedIds.length === 1 &&
    scoped.some((g) => g.id === selectedIds[0]);

  // Add — a fresh form per open, so closing it discards all its state.
  const programName = getProgramById(programId)?.name ?? "";
  const [addOpen, setAddOpen] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  // Modify — a fresh form per open (session key), on the group's own id.
  const [modify, setModify] = useState<{
    groupId: number;
    session: number;
  } | null>(null);
  const modifyButtonRef = useRef<HTMLButtonElement>(null);

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

  const colCount = 3;

  return (
    <>
      {/* Toolbar — date filters and group actions */}
      <div className="px-4 py-3 space-y-3 border-b border-border">
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-40">
            <label
              htmlFor="bulk-substance-test-filter-start"
              className="slds-form-label block mb-1.5 text-[var(--slds-g-color-text-weak)]"
            >
              Start Date
            </label>
            <DateInput
              id="bulk-substance-test-filter-start"
              value={startDate}
              onChange={setStartDate}
            />
          </div>
          <div className="w-40">
            <label
              htmlFor="bulk-substance-test-filter-end"
              className="slds-form-label block mb-1.5 text-[var(--slds-g-color-text-weak)]"
            >
              End Date
            </label>
            <DateInput
              id="bulk-substance-test-filter-end"
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
              ref={addButtonRef}
              variant="outline"
              onClick={() => setAddOpen(true)}
            >
              <Plus /> Add
            </Button>
            <Button
              ref={modifyButtonRef}
              variant="outline"
              disabled={!canModify}
              title={
                canModify
                  ? "Modify the selected Bulk Substance Test"
                  : "Select exactly one Bulk Substance Test to modify"
              }
              onClick={() =>
                canModify &&
                setModify((prev) => ({
                  groupId: selectedIds[0],
                  session: (prev?.session ?? 0) + 1,
                }))
              }
            >
              <Pencil /> Modify
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
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead variant="slds" className="w-10">
                <Checkbox
                  checked={allPageSelected}
                  onCheckedChange={toggleAllOnPage}
                  aria-label="Select all Bulk Substance Tests on this page"
                />
              </TableHead>
              <SortHead col="dateTime" label="Date / Time" />
              <SortHead col="reason" label="Reason" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow hoverable={false}>
                <TableCell colSpan={colCount}>
                  {scoped.length === 0 ? (
                    <EmptyState
                      icon={Layers}
                      title="No Bulk Substance Tests yet"
                      description="No Bulk Substance Tests have been recorded for this Program."
                    />
                  ) : (
                    <EmptyState
                      icon={Search}
                      title="No Bulk Substance Tests match the current filters"
                      description="Try changing the dates or clear the filters."
                    />
                  )}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((g) => {
                const dateTime = formatSampleDateTime(
                  g.sampleDateTime,
                );
                return (
                  <TableRow key={g.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(g.id)}
                        onCheckedChange={() =>
                          toggleSelected(g.id)
                        }
                        aria-label={`Select Bulk Substance Test on ${dateTime || "unknown date"}`}
                      />
                    </TableCell>
                    <TableCell>{dateTime || "—"}</TableCell>
                    <TableCell>{g.reason || "—"}</TableCell>
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
            countLabel="Bulk Substance Tests"
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
            label="Bulk Substance Tests"
          />
        )}
      </div>

      {addOpen && (
        <BulkSubstanceTestDialog
          programId={programId}
          programName={programName}
          onClose={() => setAddOpen(false)}
          returnFocusRef={addButtonRef}
        />
      )}
      {modify && (
        <BulkSubstanceTestDialog
          key={modify.session}
          programId={programId}
          programName={programName}
          groupId={modify.groupId}
          onClose={() => setModify(null)}
          returnFocusRef={modifyButtonRef}
        />
      )}
    </>
  );
}