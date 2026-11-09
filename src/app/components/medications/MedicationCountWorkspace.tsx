import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  AlertCircle,
  RefreshCw,
  Search,
  X,
} from "@/app/lib/lucide-icons";
import { toast } from "sonner";
import { Button } from "../ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { Card, CardFooter, CardHeader } from "../ui/card";
import { TablePaginationBar } from "../ui/table-toolbar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  type ColumnDef,
  type ColumnFilter,
  type SortDir,
  LogGridTable,
  columnValuesFor,
  matchesColumnFilters,
} from "./medicationLogGrid";
import {
  COUNT_ATTESTATION_TEXT,
  COUNT_ROW_UNAVAILABLE,
  VOLUME_LEVELS,
  countValueLabel,
  formatUnitsInput,
  getLatestCount,
  reloadMedicationLogs,
  submitCountBatch,
  useMedicationLogReadError,
  useMedicationLogState,
} from "../../data/medicationLogStore";
import {
  type CountType,
  type DosePeriod,
  YOUTH_MEDICATION_ASSIGNMENTS,
} from "../../data/youthMedicationAssignments";
import {
  can,
  getMedicationLogAccess,
  isProgramAuthorized,
  useMedicationLogAccessVersion,
} from "../../data/medicationLogAccess";
import { getPrograms } from "../../data/mockProgramsData";
import { useUnsavedChangesGuard } from "../../lib/useUnsavedChangesGuard";
import {
  getActiveYouthForProgram,
  getYouthName,
} from "../../data/mockYouthProgramData";

// Medications → Medication Count (US 20102, Chunk 4): count entry for every
// accessible youth's medication assignments. Separate from Med Review Hub →
// Count Review. Rows are explicit youth medication assignments (PROTOTYPE
// FIXTURES — data/youthMedicationAssignments.ts, not production records).
// Validation and saving use the same service as Admissions → Count.
// Pipeline: access scope → Program/Youth → Search → column filters → sort
// → 12-row pages. Drafts are kept separately and never filtered away.

const PAGE_SIZE = 12;
const DOSE_PERIOD_ORDER: Record<DosePeriod, number> = {
  Morning: 0,
  Afternoon: 1,
  Evening: 2,
  Bedtime: 3,
};
/** Volume levels in their real order (not numbers). */
const VOLUME_ORDER = ["Empty", "1/4", "1/2", "3/4", "Full"];

// ── Drafts: module-level so they survive filters, pages, Refresh and moving
// to another Medications section; keyed by assignment + dose period. ──
interface Draft {
  assignmentId: string;
  youthId: string;
  currentCount: string;
  comment: string;
}
let drafts: Record<string, Draft> = {};
const draftListeners = new Set<() => void>();
function setDrafts(next: Record<string, Draft>) {
  drafts = next;
  draftListeners.forEach((l) => l());
}
function useDrafts() {
  return useSyncExternalStore(
    (l) => {
      draftListeners.add(l);
      return () => {
        draftListeners.delete(l);
      };
    },
    () => drafts,
    () => drafts,
  );
}
const draftKey = (assignmentId: string, dosePeriod: string) =>
  `${assignmentId}|${dosePeriod}`;

interface CountRow {
  id: number;
  key: string;
  assignmentId: string;
  youthId: string;
  youth: string;
  /** Eligible (active + authorized) Programs for this youth. */
  programIds: number[];
  /** The Program the count will belong to; null = must be chosen. */
  programId: number | null;
  program: string;
  dosePeriod: DosePeriod;
  medicationDose: string;
  countType: CountType;
  /** Displayed Last Count ("0" when none, as in Admissions). */
  lastCount: string;
  /** Raw latest count ("" when none) — used for sorting. */
  lastRaw: string;
  currentCount: string;
  comments: string;
}

const COLUMNS: ColumnDef[] = [
  {
    key: "program",
    label: "Program",
    sortable: true,
    filterable: true,
    filterType: "value-select",
    minWidth: "150px",
  },
  {
    key: "youth",
    label: "Youth",
    sortable: true,
    filterable: true,
    filterType: "value-select",
    minWidth: "150px",
  },
  {
    key: "dosePeriod",
    label: "Dose Period",
    sortable: true,
    filterable: true,
    filterType: "value-select",
    minWidth: "120px",
  },
  {
    key: "medicationDose",
    label: "Medication / Dose",
    sortable: true,
    filterable: true,
    filterType: "text",
    minWidth: "180px",
  },
  {
    key: "countType",
    label: "Count Type",
    sortable: true,
    filterable: true,
    filterType: "value-select",
    minWidth: "120px",
  },
  {
    key: "lastCount",
    label: "Last Count",
    sortable: true,
    filterable: true,
    filterType: "text",
    minWidth: "110px",
  },
  {
    key: "currentCount",
    label: "Current Count",
    sortable: false,
    filterable: false,
    minWidth: "140px",
  },
  {
    key: "comments",
    label: "Comments",
    sortable: false,
    filterable: false,
    minWidth: "220px",
  },
];

/** Last Count: blank last; Units numerically; Volume by level order; Units
 *  before Volume when types are mixed. */
function lastCountKey(r: CountRow): [number, number] {
  if (r.lastRaw === "") return [2, 0];
  return r.countType === "Units"
    ? [0, Number(r.lastRaw)]
    : [1, VOLUME_ORDER.indexOf(r.lastRaw)];
}
function compareRows(
  a: CountRow,
  b: CountRow,
  field: string,
): number {
  if (field === "dosePeriod")
    return (
      DOSE_PERIOD_ORDER[a.dosePeriod] -
      DOSE_PERIOD_ORDER[b.dosePeriod]
    );
  if (field === "lastCount") {
    const [ag, av] = lastCountKey(a);
    const [bg, bv] = lastCountKey(b);
    return ag - bg || av - bv;
  }
  return String(
    (a as Record<string, unknown>)[field] ?? "",
  ).localeCompare(
    String((b as Record<string, unknown>)[field] ?? ""),
  );
}

export function MedicationCountWorkspace() {
  const logState = useMedicationLogState();
  const readError = useMedicationLogReadError();
  const accessVersion = useMedicationLogAccessVersion();
  const access = getMedicationLogAccess();
  const canSubmit = can(access, "submitCount");
  const allDrafts = useDrafts();

  const [programId, setProgramId] = useState("");
  const [youthId, setYouthId] = useState("");
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<
    Record<string, ColumnFilter>
  >({});
  const [sortField, setSortField] = useState<string | null>(
    null,
  );
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [rowErrors, setRowErrors] = useState<
    Record<string, string>
  >({});
  const [onlyErrors, setOnlyErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [assignVersion, setAssignVersion] = useState(0);

  // ── Access scope first: active authorized Programs → their active youth ──
  const scopeKey = `${accessVersion}|${access.scope.kind}|${access.scope.kind === "programs" ? access.scope.programIds.join() : ""}`;
  const { programOptions, enrolledIn } = useMemo(() => {
    const programs = canSubmit
      ? getPrograms().filter(
          (p) =>
            p.status === "Active" &&
            isProgramAuthorized(access.scope, p.id),
        )
      : [];
    const enrolledIn = new Map<string, number[]>();
    programs.forEach((p) =>
      getActiveYouthForProgram(p.id).forEach((y) => {
        const id = String(y.constituentId);
        enrolledIn.set(id, [
          ...(enrolledIn.get(id) ?? []),
          p.id,
        ]);
      }),
    );
    return {
      programOptions: [
        { value: "", label: "All Programs" },
        ...programs
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((p) => ({ value: String(p.id), label: p.name })),
      ],
      enrolledIn,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeKey, canSubmit, assignVersion]);
  const programName = (id: number) =>
    programOptions.find((o) => o.value === String(id))?.label ??
    "";

  const youthOptions = useMemo(() => {
    const ids = [...enrolledIn.entries()]
      .filter(
        ([, progs]) =>
          !programId || progs.includes(Number(programId)),
      )
      .map(([id]) => ({ value: id, label: getYouthName(id) }))
      .filter((o) => o.label)
      .sort((a, b) => a.label.localeCompare(b.label));
    return [{ value: "", label: "All Youth" }, ...ids];
  }, [enrolledIn, programId]);
  // Never keep an invisible incompatible Youth filter.
  useEffect(() => {
    if (
      youthId &&
      !youthOptions.some((o) => o.value === youthId)
    )
      setYouthId("");
  }, [youthOptions, youthId]);

  // ── Eligible rows: one per assignment (never duplicated across Programs) ──
  const allRows: CountRow[] = useMemo(
    () =>
      YOUTH_MEDICATION_ASSIGNMENTS.flatMap((a, i) => {
        const progs = enrolledIn.get(a.youthId);
        if (!progs?.length) return [];
        const chosen =
          progs.length === 1
            ? progs[0]
            : programId && progs.includes(Number(programId))
              ? Number(programId)
              : null;
        const latest = getLatestCount(
          logState,
          a.youthId,
          a.id,
          a.dosePeriod,
        );
        const key = draftKey(a.id, a.dosePeriod);
        return [
          {
            id: i + 1,
            key,
            assignmentId: a.id,
            youthId: a.youthId,
            youth: getYouthName(a.youthId),
            programIds: progs,
            programId: chosen,
            program:
              chosen !== null
                ? programName(chosen)
                : "Multiple — select a Program",
            dosePeriod: a.dosePeriod,
            medicationDose: `${a.medicationName} - ${a.dose}`,
            countType: a.countType,
            lastCount: latest ? countValueLabel(latest) : "0",
            lastRaw: latest ? countValueLabel(latest) : "",
            currentCount: allDrafts[key]?.currentCount ?? "",
            comments: allDrafts[key]?.comment ?? "",
          },
        ];
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enrolledIn, logState, allDrafts, programId],
  );
  const rowByKey = useMemo(
    () => new Map(allRows.map((r) => [r.key, r])),
    [allRows],
  );

  // ── Program/Youth → Search → column filters → sort ──
  const scoped = useMemo(
    () =>
      allRows.filter(
        (r) =>
          (!programId ||
            r.programIds.includes(Number(programId))) &&
          (!youthId || r.youthId === youthId),
      ),
    [allRows, programId, youthId],
  );
  const columnValues = useMemo(
    () => columnValuesFor(scoped, COLUMNS),
    [scoped],
  );
  const filtered = useMemo(() => {
    if (onlyErrors)
      return allRows.filter((r) => rowErrors[r.key]);
    const q = search.trim().toLowerCase();
    return scoped.filter(
      (r) =>
        (!q ||
          [r.medicationDose, r.youth, r.program, r.dosePeriod]
            .join(" ")
            .toLowerCase()
            .includes(q)) &&
        matchesColumnFilters(r, columnFilters),
    );
  }, [
    scoped,
    allRows,
    search,
    columnFilters,
    onlyErrors,
    rowErrors,
  ]);
  const sorted = useMemo(() => {
    const rows = [...filtered];
    rows.sort((a, b) => {
      // A missing Last Count stays last in both directions (it is not a
      // committed zero, even though both display "0").
      if (
        sortField === "lastCount" &&
        (a.lastRaw === "") !== (b.lastRaw === "")
      )
        return a.lastRaw === "" ? 1 : -1;
      const cmp = sortField ? compareRows(a, b, sortField) : 0;
      return (
        (sortDir === "asc" ? cmp : -cmp) ||
        a.youth.localeCompare(b.youth) ||
        DOSE_PERIOD_ORDER[a.dosePeriod] -
          DOSE_PERIOD_ORDER[b.dosePeriod] ||
        a.assignmentId.localeCompare(b.assignmentId)
      );
    });
    return rows;
  }, [filtered, sortField, sortDir]);

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
  }, [programId, youthId, search, columnFilters, onlyErrors]);
  const pageRows = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // ── Drafts ──
  const pending = Object.keys(allDrafts).length;
  const unavailable = Object.keys(allDrafts).filter(
    (k) => !rowByKey.has(k),
  );
  const errorCount = Object.keys(rowErrors).filter(
    (k) => allDrafts[k],
  ).length;
  useEffect(() => {
    if (onlyErrors && errorCount === 0) setOnlyErrors(false);
  }, [onlyErrors, errorCount]);
  // Leaving with pending entries (router navigation incl. the header, Back/
  // Forward, the Medications left nav, reload/close) asks once — the app's
  // existing guard (lib/useUnsavedChangesGuard). Keep Editing stays here.
  const leaveGuard = useUnsavedChangesGuard(
    pending > 0,
    () => setDrafts({}),
    {
      title: "Discard pending counts?",
      description: `${pending} pending medication count ${pending === 1 ? "entry has" : "entries have"} not been saved. Leaving Medication Count will discard ${pending === 1 ? "it" : "them"}.`,
      discardLabel: "Discard and Leave",
    },
  );

  function updateDraft(
    row: CountRow,
    field: "currentCount" | "comment",
    value: string,
  ) {
    const cur = allDrafts[row.key] ?? {
      assignmentId: row.assignmentId,
      youthId: row.youthId,
      currentCount: "",
      comment: "",
    };
    const next = { ...cur, [field]: value };
    const out = { ...allDrafts, [row.key]: next };
    if (!next.currentCount && !next.comment)
      delete out[row.key];
    setDrafts(out);
    if (rowErrors[row.key]) {
      const e = { ...rowErrors };
      delete e[row.key];
      setRowErrors(e);
    }
  }

  function saveCounts() {
    if (saving || !pending) return;
    setSaveError("");
    if (unavailable.length) {
      setSaveError(
        `${unavailable.length} pending ${unavailable.length === 1 ? "entry is" : "entries are"} no longer available to you. Discard ${unavailable.length === 1 ? "it" : "them"} to continue.`,
      );
      return;
    }
    // A youth in several Programs needs an explicit Program for this save.
    const needProgram = Object.keys(allDrafts).filter(
      (k) => rowByKey.get(k)?.programId == null,
    );
    if (needProgram.length) {
      setRowErrors(
        Object.fromEntries(
          needProgram.map((k) => [
            k,
            "This youth is in more than one Program — choose the Program filter before saving.",
          ]),
        ),
      );
      setSaveError(
        "Choose a Program for the highlighted rows. Nothing was saved.",
      );
      return;
    }
    setSaving(true);
    // The service re-checks permission, scope, enrollment and ownership.
    const byAssignment = new Map<string, string>();
    const result = submitCountBatch({
      staff: getMedicationLogAccess().user.name,
      rows: Object.entries(allDrafts).map(([k, d]) => {
        byAssignment.set(d.assignmentId, k);
        return {
          youthMedicationId: d.assignmentId,
          youthId: d.youthId,
          programId: rowByKey.get(k)!.programId!,
          currentCount: d.currentCount,
          comment: d.comment,
        };
      }),
    });
    setSaving(false);
    if (!result.ok) {
      setRowErrors(
        Object.fromEntries(
          Object.entries(result.rowErrors).map(([aid, msg]) => [
            byAssignment.get(aid) ?? aid,
            msg,
          ]),
        ),
      );
      setSaveError(result.error);
      toast.error(result.error);
      return;
    }
    const youthCount = new Set(
      Object.values(allDrafts).map((d) => d.youthId),
    ).size;
    const saved = result.logIds.length;
    setDrafts({});
    setRowErrors({});
    toast.success(
      `${saved} count${saved === 1 ? "" : "s"} saved for ${youthCount} youth${youthCount === 1 ? "" : "s"}.`,
    );
  }

  function discardUnavailable() {
    const out = { ...allDrafts };
    unavailable.forEach((k) => delete out[k]);
    setDrafts(out);
    setSaveError("");
  }

  function handleSort(key: string) {
    if (sortField === key) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortField(null);
        setSortDir("asc");
      }
    } else {
      setSortField(key);
      setSortDir("asc");
    }
  }

  const filterCount =
    (programId ? 1 : 0) +
    (youthId ? 1 : 0) +
    (search.trim() ? 1 : 0) +
    Object.keys(columnFilters).length;
  const showStart =
    sorted.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showEnd = Math.min(safePage * PAGE_SIZE, sorted.length);

  function renderCell(r: CountRow, col: ColumnDef) {
    const err = rowErrors[r.key];
    if (col.key === "currentCount")
      return (
        <div>
          {r.countType === "Units" ? (
            <Input
              size="sm"
              surface="base"
              value={r.currentCount}
              onChange={(e) =>
                updateDraft(
                  r,
                  "currentCount",
                  formatUnitsInput(e.target.value),
                )
              }
              placeholder="0-1000"
              inputMode="decimal"
              aria-label={`Current Count for ${r.youth}, ${r.medicationDose}, ${r.dosePeriod}`}
              aria-invalid={!!err}
              className="w-24"
            />
          ) : (
            <Select
              value={r.currentCount}
              onValueChange={(v) =>
                updateDraft(r, "currentCount", v)
              }
            >
              <SelectTrigger
                surface="base"
                className="w-28"
                aria-label={`Current Count for ${r.youth}, ${r.medicationDose}, ${r.dosePeriod}`}
                aria-invalid={!!err}
              >
                <SelectValue placeholder="-" />
              </SelectTrigger>
              <SelectContent>
                {VOLUME_LEVELS.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {err && (
            <p
              role="alert"
              className="slds-text-3 mt-1 text-[#c23934] whitespace-normal"
            >
              {err}
            </p>
          )}
        </div>
      );
    if (col.key === "comments")
      return (
        <Input
          size="sm"
          surface="base"
          value={r.comments}
          onChange={(e) =>
            updateDraft(r, "comment", e.target.value)
          }
          placeholder="Enter comments"
          aria-label={`Comments for ${r.youth}, ${r.medicationDose}, ${r.dosePeriod}`}
        />
      );
    return undefined;
  }

  if (!canSubmit)
    return (
      <div className="px-6 pb-6 pt-4">
        <EmptyState
          icon={AlertCircle}
          tone="warning"
          title="Medication Count unavailable"
          description="You don't have permission to record medication counts."
        />
      </div>
    );

  return (
    <div className="px-6 pb-6 pt-4">
      <Card variant="container">
        {/* ── Card header: title + date + count (left), filters (right) ── */}
        <CardHeader
          size="sm"
          separated
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 min-w-0"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="slds-text-5 font-semibold m-0 text-[var(--slds-g-color-text-default)]">
                  Medication Count
                </h2>
                {!readError && <Badge variant="success">{sorted.length}</Badge>}
              </div>
              <p className="slds-text-3 m-0 text-[var(--slds-g-color-text-weak)]">
                Current Date:{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-x-3 gap-y-2 flex-wrap justify-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Refresh"
              onClick={() => {
                reloadMedicationLogs();
                setAssignVersion((v) => v + 1);
              }}
            >
              <RefreshCw />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh</TooltipContent>
        </Tooltip>
          <div className="flex items-center gap-2">
            <label htmlFor="count-search" className="slds-form-label whitespace-nowrap text-[var(--slds-g-color-text-weak)]">Search</label>
          <div className="w-64 max-w-full">
          <Input
            id="count-search"
            size="md"
            surface="base"
            leadingIcon={<Search className="h-3.5 w-3.5" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            aria-label="Search medication, dose, youth, program, period"
          />
          </div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="count-program" className="slds-form-label whitespace-nowrap text-[var(--slds-g-color-text-weak)]">Program</label>
            <div className="w-48">
          <SearchableSelect
            id="count-program"
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
            <label htmlFor="count-youth" className="slds-form-label whitespace-nowrap text-[var(--slds-g-color-text-weak)]">Youth</label>
            <div className="w-48">
          <SearchableSelect
            id="count-youth"
            value={youthId}
            onValueChange={setYouthId}
            options={youthOptions}
            placeholder="All Youth"
            searchPlaceholder="Search youth…"
            emptyMessage="No matching youth."
          />
            </div>
          </div>
  {filterCount > 0 && (
          <Button
            variant="outline-primary"
            onClick={() => {
              setProgramId("");
              setYouthId("");
              setSearch("");
              setColumnFilters({});
            }}
          >
            Clear
          </Button>
        )}
          </div>
        </CardHeader>

        {readError ? (
          <div className="p-6">
            <EmptyState
              icon={AlertCircle}
              tone="error"
              title="Medication counts could not be loaded"
              description={readError}
            />
          </div>
        ) : (
          <>
            {(saveError || errorCount > 0) && (
              <div
                className="flex items-center gap-3 flex-wrap px-4 py-2.5"
                style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
              >
          {saveError && (
            <div
              role="alert"
              className="flex items-center gap-3 flex-wrap slds-text-4 text-[#c23934]"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{saveError}</span>
              {unavailable.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={discardUnavailable}
                >
                  Discard unavailable entries
                </Button>
              )}
            </div>
          )}
          {errorCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOnlyErrors((v) => !v)}
            >
              {onlyErrors
                ? "Show all rows"
                : `Review ${errorCount} row${errorCount === 1 ? "" : "s"} with errors`}
            </Button>
          )}
              </div>
            )}
            <LogGridTable<CountRow>
              columns={COLUMNS}
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
              selectable={false}
              selectedIds={new Set()}
              allSelected={false}
              someSelected={false}
              onToggleAll={() => {}}
              onToggleRow={() => {}}
              renderCell={renderCell}
              rowKey={(r) => r.key}
              emptyMessage="No Records Found"
              maxHeight="none"
              bordered={false}
              uppercaseHeaders
            />
            <CardFooter size="sm" separated>
              <TablePaginationBar
                className="w-full"
                start={showStart}
                end={showEnd}
                total={sorted.length}
                countLabel="medications"
                currentPage={safePage}
                totalPages={totalPages}
                onPrevious={() => setPage(safePage - 1)}
                onNext={() => setPage(safePage + 1)}
              />
            </CardFooter>
          </>
        )}

        {/* Footer — reference attestation statement + actions */}
        <div
          className="flex items-center justify-end gap-3 flex-wrap px-4 py-3"
          style={{
            backgroundColor: "var(--slds-g-color-background-alt)",
            borderTop: "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
        <p
          className="slds-text-3 italic"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          {COUNT_ATTESTATION_TEXT}
        </p>
        <Button
          variant="outline"
          disabled={!pending || saving}
          onClick={() => setConfirmDiscard(true)}
        >
          Cancel
        </Button>
        <Button
          disabled={!pending || saving || !!readError}
          onClick={saveCounts}
        >
          {saving ? "Saving…" : "Submit"}
        </Button>
        </div>
      </Card>

      {leaveGuard}
      <AlertDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Discard pending counts?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending} pending{" "}
              {pending === 1 ? "entry" : "entries"} on every
              page will be discarded. Nothing is saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setDrafts({});
                setRowErrors({});
                setSaveError("");
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}