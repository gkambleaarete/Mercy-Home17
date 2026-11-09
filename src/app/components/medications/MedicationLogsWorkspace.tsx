import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "@/app/lib/lucide-icons";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { EmptyState } from "../ui/empty-state";
import { Input } from "../ui/input";
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
import { TableFooterBar } from "../ui/table-toolbar";
import { Card, CardHeader } from "../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  type ColumnDef,
  type ColumnFilter,
  type LogEntry,
  type SortDir,
  type ViewMode,
  COMMENTS_COLS,
  COUNTS_COLS,
  GENERAL_COLS,
  LogDetailDialog,
  LogGridTable,
  columnValuesFor,
  matchesColumnFilters,
  toLogEntry,
} from "./medicationLogGrid";
import {
  deleteMedicationLog,
  getActiveLogs,
  getAttestationViews,
  reloadMedicationLogs,
  useMedicationLogReadError,
  useMedicationLogState,
} from "../../data/medicationLogStore";
import {
  can,
  getMedicationLogAccess,
  isProgramAuthorized,
  useMedicationLogAccessVersion,
} from "../../data/medicationLogAccess";
import { formatMdy } from "../../lib/dateFormat";
import {
  getProgramById,
  getPrograms,
} from "../../data/mockProgramsData";
import {
  getActiveYouth,
  getActiveYouthForProgram,
  getCurrentProgramIdForYouth,
  getYouthName,
} from "../../data/mockYouthProgramData";

// Medications → Logs (US 20100, Chunk 2): every accessible youth's committed
// medication logs from the shared repository (counts submitted in
// Admissions appear here automatically). Pipeline, in order:
//   access scope → Program/Youth → View → Search → column filters → sort →
//   12-row pages.
//
// PROTOTYPE View rules (assumptions, not confirmed business rules):
//   General  — all accessible logs
//   Counts   — Log Type = Count
//   Comments — a nonblank medication comment or dose-period comment

const PAGE_SIZE = 12;

const PROGRAM_COL: ColumnDef = {
  key: "program",
  label: "Program",
  sortable: true,
  filterable: true,
  filterType: "value-select",
  minWidth: "140px",
};
const YOUTH_COL: ColumnDef = {
  key: "youth",
  label: "Youth",
  sortable: true,
  filterable: true,
  filterType: "value-select",
  minWidth: "150px",
};
// "#" is the stored quantity in the central grid.
const withQuantity = (cols: ColumnDef[]) =>
  cols.map((c) =>
    c.key === "num" ? { ...c, key: "quantity" } : c,
  );

const VIEW_COLUMNS: Record<ViewMode, ColumnDef[]> = {
  general: [
    PROGRAM_COL,
    YOUTH_COL,
    ...withQuantity(GENERAL_COLS),
  ],
  counts: [
    PROGRAM_COL,
    YOUTH_COL,
    ...withQuantity(COUNTS_COLS),
  ],
  comments: [PROGRAM_COL, YOUTH_COL, ...COMMENTS_COLS],
};

const VIEW_MATCH: Record<ViewMode, (e: LogEntry) => boolean> = {
  general: () => true,
  counts: (e) => e.logType === "Count",
  comments: (e) =>
    e.comments.trim() !== "" ||
    e.dosePeriodComments.trim() !== "",
};

const ISO_DATE = (mdy: string) => {
  const [m, d, y] = mdy.split("/");
  return y ? `${y}-${m}-${d}` : "";
};

/** Dates by real timestamps, everything else by displayed text; stable
 *  tie-breaker on the record id. */
function sortEntries(
  rows: LogEntry[],
  field: string | null,
  dir: SortDir,
): LogEntry[] {
  // Default order matches the Admissions Log: newest dose date first.
  if (!field) return sortEntries(rows, "doseDate", "desc");
  const key = (e: LogEntry) =>
    field === "doseDate"
      ? `${ISO_DATE(e.doseDate)}|${e.attestedAt}`
      : field === "attestationDate"
        ? e.attestedAt
        : String((e as Record<string, unknown>)[field] ?? "");
  return [...rows].sort((a, b) => {
    const cmp =
      field === "seq"
        ? a.seq - b.seq
        : key(a).localeCompare(key(b), undefined, {
            numeric: true,
          });
    return (
      (dir === "asc" ? cmp : -cmp) ||
      a.logId.localeCompare(b.logId)
    );
  });
}

/** MM/DD/YYYY h:mm AM/PM for an ISO timestamp. */
const dateTime = (iso: string) =>
  iso
    ? `${formatMdy(iso)} ${new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
    : "";

export function MedicationLogsWorkspace() {
  const logState = useMedicationLogState();
  const readError = useMedicationLogReadError();
  // Access is re-read on every render (and on seam changes), never cached.
  const accessVersion = useMedicationLogAccessVersion();
  const access = getMedicationLogAccess();
  const scope = access.scope;
  const canView = can(access, "viewLogs");
  const canDelete = can(access, "deleteLog");
  const canAttest = can(access, "viewAttestations");

  const [view, setView] = useState<ViewMode>("general");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [programId, setProgramId] = useState("");
  const [youthId, setYouthId] = useState("");
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<
    Record<string, ColumnFilter>
  >({});
  const [sortField, setSortField] = useState<string | null>(
    null,
  );
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    new Set(),
  );
  const [detailId, setDetailId] = useState<string | null>(null);
  // Attestations for these log ids (row action, selected rows, or — with
  // nothing selected — every log matching the current filters).
  const [attestLogIds, setAttestLogIds] = useState<
    string[] | null
  >(null);
  const [attestAllMatching, setAttestAllMatching] =
    useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusHeadingOnClose = useRef(false);
  // Dialogs here open without a Radix trigger, so remember what opened
  // them and give focus back on close (heading if that element is gone).
  const openerRef = useRef<HTMLElement | null>(null);
  const rememberOpener = () => {
    openerRef.current =
      document.activeElement as HTMLElement | null;
  };
  const restoreFocus = (ev: Event) => {
    ev.preventDefault();
    const target =
      focusHeadingOnClose.current ||
      !openerRef.current?.isConnected
        ? headingRef.current
        : openerRef.current;
    focusHeadingOnClose.current = false;
    target?.focus();
  };

  // ── Access scope first: everything below only sees authorized logs ──
  const accessible = useMemo(() => {
    const byId = new Map(
      logState.attestations.map((a) => [a.id, a]),
    );
    const names = {
      program: (id: number) => getProgramById(id)?.name ?? "",
      youth: (id: string) => getYouthName(id),
    };
    if (!canView) return [];
    // Active (not deleted) logs inside the authorized Program scope only.
    return getActiveLogs(logState)
      .filter((l) => isProgramAuthorized(scope, l.programId))
      .map((l) =>
        toLogEntry(l, byId.get(l.attestationId), names),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    logState,
    accessVersion,
    canView,
    scope.kind,
    scope.kind === "programs" ? scope.programIds.join() : "",
  ]);

  // ── Picklists: active canonical Programs / Youth within scope ──
  const programOptions = useMemo(
    () => [
      { value: "", label: "All Programs" },
      ...getPrograms()
        .filter(
          (p) =>
            p.status === "Active" &&
            isProgramAuthorized(scope, p.id),
        )
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((p) => ({ value: String(p.id), label: p.name })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      accessVersion,
      scope.kind,
      scope.kind === "programs" ? scope.programIds.join() : "",
    ],
  );
  const youthOptions = useMemo(() => {
    const youth = programId
      ? getActiveYouthForProgram(Number(programId)).map(
          (y) => ({
            value: String(y.constituentId),
            label: y.name,
          }),
        )
      : getActiveYouth()
          .filter((y) => {
            const current = getCurrentProgramIdForYouth(
              y.youthId,
            );
            return (
              current !== null &&
              isProgramAuthorized(scope, current)
            );
          })
          .map((y) => ({
            value: y.youthId,
            label: y.youthName,
          }));
    return [{ value: "", label: "All Youth" }, ...youth];
    // Recompute when the authorized Programs change, not only the scope kind.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    programId,
    accessVersion,
    scope.kind,
    scope.kind === "programs" ? scope.programIds.join() : "",
  ]);

  // A selected Program that is no longer authorized is cleared (which in
  // turn clears an incompatible Youth below).
  useEffect(() => {
    if (
      programId &&
      !programOptions.some((o) => o.value === programId)
    )
      setProgramId("");
  }, [programOptions, programId]);

  // A Youth that the new Program doesn't enroll is cleared, never kept
  // as an invisible filter.
  useEffect(() => {
    if (
      youthId &&
      !youthOptions.some((o) => o.value === youthId)
    )
      setYouthId("");
  }, [youthOptions, youthId]);

  // ── Program/Youth → View → Search → column filters ──
  const scoped = useMemo(
    () =>
      accessible.filter(
        (e) =>
          (!programId || e.programId === Number(programId)) &&
          (!youthId || e.youthId === youthId),
      ),
    [accessible, programId, youthId],
  );
  const inView = useMemo(
    () => scoped.filter(VIEW_MATCH[view]),
    [scoped, view],
  );
  const columns = VIEW_COLUMNS[view];
  const columnValues = useMemo(
    () => columnValuesFor(inView, columns),
    [inView, columns],
  );
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inView.filter(
      (e) =>
        (!q ||
          [
            e.medicationDose,
            e.youth,
            e.primaryCode,
            e.attestationStaff,
          ]
            .join(" ")
            .toLowerCase()
            .includes(q)) &&
        matchesColumnFilters(e, columnFilters),
    );
  }, [inView, search, columnFilters]);
  const sorted = useMemo(
    () => sortEntries(filtered, sortField, sortDir),
    [filtered, sortField, sortDir],
  );

  // ── Pagination (after filter + sort); page clamps when results shrink ──
  const totalPages = Math.max(
    1,
    Math.ceil(sorted.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);
  useEffect(() => {
    setPage(1);
  }, [view, programId, youthId, search, columnFilters]);
  const pageRows = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // Selection is by record id and never keeps rows that are not visible.
  const visibleIds = pageRows.map((e) => e.id);
  const visibleKey = visibleIds.join();
  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set(
        [...prev].filter((id) => visibleIds.includes(id)),
      );
      return next.size === prev.size ? prev : next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleKey]);
  const allSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedIds.has(id));
  const someSelected =
    visibleIds.some((id) => selectedIds.has(id)) &&
    !allSelected;

  // Dialog records are re-resolved from the accessible set by id, so a
  // deleted or no-longer-accessible record's content disappears.
  const detail = detailId
    ? (accessible.find((e) => e.logId === detailId) ?? null)
    : null;
  const deleteTarget = deleteId
    ? (accessible.find((e) => e.logId === deleteId) ?? null)
    : null;
  useEffect(() => {
    if (deleteId && !deleteTarget && !deleting)
      setDeleteId(null);
  }, [deleteId, deleteTarget, deleting]);
  // Content that becomes inaccessible (deleted, out of scope, permission
  // removed) closes for good — it never reappears if access returns.
  useEffect(() => {
    if (detailId && !detail) setDetailId(null);
  }, [detailId, detail]);

  // Linked attestations of the requested accessible logs, each shown once.
  const attestations = useMemo(() => {
    if (!attestLogIds || !canAttest) return null;
    // Only the requested logs the user can access; each shared attestation
    // is projected so other youths' / Programs' linked logs never leak.
    const logIds = new Set(
      accessible
        .filter((e) => attestLogIds.includes(e.logId))
        .map((e) => e.logId),
    );
    return {
      logCount: logIds.size,
      records: getAttestationViews(logState, logIds).sort(
        (a, b) => b.attestedAt.localeCompare(a.attestedAt),
      ),
    };
  }, [attestLogIds, accessible, logState, canAttest]);
  useEffect(() => {
    if (
      attestLogIds &&
      (!attestations || attestations.logCount === 0)
    )
      setAttestLogIds(null);
  }, [attestLogIds, attestations]);

  function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError("");
    // Current access is read again at execution time.
    const result = deleteMedicationLog(deleteTarget.logId);
    setDeleting(false);
    if (result.ok) {
      if (detailId === deleteTarget.logId) setDetailId(null);
      setSelectedIds((prev) => {
        const n = new Set(prev);
        n.delete(deleteTarget.id);
        return n;
      });
      focusHeadingOnClose.current = true;
      setDeleteId(null);
      toast.success("Medication log deleted.");
    } else if (result.reason === "already-deleted") {
      focusHeadingOnClose.current = true;
      setDeleteId(null);
      toast.info(result.error);
    } else {
      setDeleteError(result.error);
    }
  }

  const filterCount =
    (programId ? 1 : 0) +
    (youthId ? 1 : 0) +
    (search.trim() ? 1 : 0) +
    Object.keys(columnFilters).length;
  function clearFilters() {
    setProgramId("");
    setYouthId("");
    setSearch("");
    setColumnFilters({});
  }
  function handleSort(key: string) {
    if (sortField === key) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortField(null);
        setSortDir("desc");
      }
    } else {
      setSortField(key);
      setSortDir("asc");
    }
  }

  const showStart =
    sorted.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showEnd = Math.min(safePage * PAGE_SIZE, sorted.length);

  return (
    <div className="px-6 pb-6 pt-4 space-y-4">

      <Card variant="container">
        {/* Toolbar: filters left, actions right (Data Table header band) */}
        <CardHeader
          size="sm"
          separated
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 min-w-0"
        >
          <div className="flex items-center gap-2 shrink-0">
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="slds-text-5 font-semibold m-0 outline-none text-[var(--slds-g-color-text-default)]"
            >
              Logs
            </h2>
            {!readError && <Badge variant="success">{sorted.length}</Badge>}
          </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Refresh"
                onClick={() => reloadMedicationLogs()}
              >
                <RefreshCw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
                  <Button
            type="button"
            variant="outline"
            aria-expanded={filtersOpen}
            aria-controls="logs-filter-panel"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            <Filter /> Filters{filterCount > 0 ? ` (${filterCount})` : ""}
            {filtersOpen ? <ChevronUp /> : <ChevronDown />}
          </Button>
          {canAttest && (
            <Button
              variant="outline-primary"
              disabled={
                selectedIds.size === 0 && sorted.length === 0
              }
              title={
                selectedIds.size === 0
                  ? "View attestations for all logs matching the current filters"
                  : undefined
              }
              onClick={() => {
                rememberOpener();
                // Read-only: opening never creates or changes attestations.
                const all = selectedIds.size === 0;
                setAttestAllMatching(all);
                setAttestLogIds(
                  (all
                    ? sorted
                    : pageRows.filter((e) =>
                        selectedIds.has(e.id),
                      )
                  ).map((e) => e.logId),
                );
              }}
            >
              <FileText /> Attestation
            </Button>
          )}
          <Button
            variant="outline-primary"
            disabled={selectedIds.size !== 1}
            title={selectedIds.size !== 1 ? "Select one log to view" : undefined}
            onClick={() => {
              const row = pageRows.find((e) => selectedIds.has(e.id));
              if (!row) return;
              rememberOpener();
              setDetailId(row.logId);
            }}
          >
            <Eye /> View
          </Button>
</div>
        </CardHeader>
        {filtersOpen && (
          <div id="logs-filter-panel" className="flex flex-wrap items-center justify-start gap-3 px-4 py-3 bg-[var(--slds-g-color-background-alt)]" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>

          <div className="flex items-center gap-2">
            <label htmlFor="logs-search" className="slds-form-label whitespace-nowrap text-[var(--slds-g-color-text-weak)]">Search</label>
          <div className="w-52">
          <Input
            id="logs-search"
            size="md"
            surface="base"
            leadingIcon={<Search className="h-3.5 w-3.5" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            aria-label="Search medication, youth, code, staff"
          />
          </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="slds-form-label whitespace-nowrap text-[var(--slds-g-color-text-weak)]">View</label>
            <div className="w-36">
          <Select
            value={view}
            onValueChange={(v) => {
              setView(v as ViewMode);
              setColumnFilters({});
              setSortField(null);
              setSortDir("desc");
            }}
          >
            <SelectTrigger surface="base" aria-label="View">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="counts">Counts</SelectItem>
              <SelectItem value="comments">Comments</SelectItem>
            </SelectContent>
          </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="logs-program" className="slds-form-label whitespace-nowrap text-[var(--slds-g-color-text-weak)]">Program</label>
            <div className="w-48">
          <SearchableSelect
            id="logs-program"
            value={programId}
            onValueChange={setProgramId}
            options={programOptions}
            placeholder="All Programs"
            searchPlaceholder="Search programs…"
            emptyMessage="No matching Programs."
          />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="logs-youth" className="slds-form-label whitespace-nowrap text-[var(--slds-g-color-text-weak)]">Youth</label>
            <div className="w-56">
          <SearchableSelect
            id="logs-youth"
            value={youthId}
            onValueChange={setYouthId}
            options={youthOptions}
            placeholder="All Youth"
            searchPlaceholder="Search youth…"
            emptyMessage="No matching youth."
          />
            </div>
          </div>
        {(
          <Button
            variant="outline-primary"
            disabled={filterCount === 0}
            onClick={clearFilters}
          >
            Clear
          </Button>
        )}
          </div>
        )}


        {/* Filters (collapsible) */}

      {readError ? (
        <EmptyState
          icon={AlertCircle}
          tone="error"
          title="Medication logs could not be loaded"
          description={readError}
        />
      ) : (
        <>
          <LogGridTable
            columns={columns}
            rows={pageRows}
            columnValues={columnValues}
            columnFilters={columnFilters}
            onFilterChange={(key, f) =>
              setColumnFilters((prev) => {
                const n = { ...prev };
                if (f) n[key] = f;
                else delete n[key];
                return n;
              })
            }
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
            selectedIds={selectedIds}
            allSelected={allSelected}
            someSelected={someSelected}
            onToggleAll={() =>
              setSelectedIds(
                allSelected ? new Set() : new Set(visibleIds),
              )
            }
            onToggleRow={(id) =>
              setSelectedIds((prev) => {
                const n = new Set(prev);
                n.has(id) ? n.delete(id) : n.add(id);
                return n;
              })
            }
            onOpen={(e) => setDetailId(e.logId)}
            emptyMessage="No Records Found"
            maxHeight="none"
            bordered={false}
            uppercaseHeaders
            renderActions={(e) => (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost-primary"
                  size="icon-xs"
                  aria-label={`View log ${e.num}`}
                  title="View"
                  onClick={() => {
                    rememberOpener();
                    setDetailId(e.logId);
                  }}
                >
                  <Eye />
                </Button>
                {canAttest && (
                  <Button
                    type="button"
                    variant="ghost-primary"
                    size="icon-xs"
                    aria-label={`Attestation for log ${e.num}`}
                    title="Attestation"
                    onClick={() => {
                      rememberOpener();
                      setAttestAllMatching(false);
                      setAttestLogIds([e.logId]);
                    }}
                  >
                    <FileText />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    type="button"
                    variant="ghost-destructive"
                    size="icon-xs"
                    aria-label={`Delete log ${e.num}`}
                    title="Delete"
                    onClick={() => {
                      rememberOpener();
                      setDeleteError("");
                      setDeleteId(e.logId);
                    }}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            )}
          />
          <TableFooterBar
            start={showStart}
            end={showEnd}
            total={sorted.length}
            countLabel="logs"
            currentPage={safePage}
            totalPages={totalPages}
            onPrevious={() => setPage(safePage - 1)}
            onNext={() => setPage(safePage + 1)}
          />
        </>
      )}
      </Card>

      <LogDetailDialog
        entry={detail}
        onClose={() => setDetailId(null)}
        onCloseAutoFocus={restoreFocus}
        extraFields={
          detail
            ? [
                { label: "Program", value: detail.program },
                { label: "Youth", value: detail.youth },
              ]
            : []
        }
      ></LogDetailDialog>

      {/* Attestation details (row action / selected rows) */}
      <Dialog
        open={!!attestations}
        onOpenChange={(o) => {
          if (!o) setAttestLogIds(null);
        }}
      >
        <DialogContent
          size="xl"
          onCloseAutoFocus={restoreFocus}
        >
          <DialogHeader>
            <DialogTitle>Attestations</DialogTitle>
            <DialogDescription>
              {attestAllMatching
                ? `Distinct attestations linked to all ${attestations?.logCount ?? 0} medication logs matching the current filters.`
                : attestations && attestations.logCount === 1
                  ? "The attestation linked to this medication log."
                  : `Distinct attestations linked to ${attestations?.logCount ?? 0} selected medication logs.`}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {attestations &&
            attestations.records.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No attestation available"
                description={
                  attestAllMatching
                    ? "No attestation record is linked to the matching logs."
                    : "No attestation record is linked to the selected log."
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow hoverable={false}>
                      <TableHead variant="slds">
                        Attestation Date/Time
                      </TableHead>
                      <TableHead variant="slds">
                        Attestation Type
                      </TableHead>
                      <TableHead variant="slds">
                        Staff Name
                      </TableHead>
                      <TableHead variant="slds">
                        Attestation Text
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attestations?.records.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          {dateTime(a.attestedAt) || "—"}
                        </TableCell>
                        <TableCell>
                          {a.logType || "—"}
                        </TableCell>
                        <TableCell>{a.staff || "—"}</TableCell>
                        <TableCell wrap>
                          {a.text || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAttestLogIds(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o && !deleting) setDeleteId(null);
        }}
      >
        <AlertDialogContent onCloseAutoFocus={restoreFocus}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete medication log?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes the log from the active Logs. A
              deletion audit record is kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteTarget && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="YOUTH" value={deleteTarget.youth} />
              <Field
                label="MEDICATION / DOSE"
                value={deleteTarget.medicationDose}
              />
              <Field
                label="LOG TYPE"
                value={deleteTarget.logType}
              />
              <Field
                label="DOSE DATE"
                value={deleteTarget.doseDate}
              />
            </div>
          )}
          {deleteError && (
            <p
              role="alert"
              className="slds-text-3 text-[#c23934]"
            >
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={(ev) => {
                ev.preventDefault();
                confirmDelete();
              }}
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({
  label,
  value,
  italic,
}: {
  label: string;
  value: string;
  italic?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p
        className="slds-form-label"
        style={{ color: "var(--slds-g-color-text-weak)" }}
      >
        {label}
      </p>
      <p
        className={"slds-text-4" + (italic ? " italic" : "")}
        style={{ color: "var(--slds-g-color-text-default)" }}
      >
        {value || "—"}
      </p>
    </div>
  );
}