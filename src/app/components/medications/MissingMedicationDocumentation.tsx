import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ClipboardList,
  Filter,
  RefreshCw,
  SearchX,
  TriangleAlert,
} from "@/app/lib/lucide-icons";
import { MedicationGlobalDestination } from "./MedicationGlobalDestination";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardFooter } from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Checkbox } from "../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { EmptyState } from "../ui/empty-state";
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
import {
  TablePaginationBar,
  TableToolbar,
} from "../ui/table-toolbar";
import {
  reviewActionAllowed,
  useMedicationLogAccessVersion,
} from "../../data/medicationLogAccess";
import {
  accessibleProgramIds,
  refreshMedReviewsFromStorage,
  useMedReviews,
} from "../../data/medReviewStore";
import {
  reloadMedicationLogs,
  useMedicationLogReadError,
  useMedicationLogState,
} from "../../data/medicationLogStore";
import { youthName } from "../../data/medReviewViews";
import { evaluateMedicationDocumentation } from "../../data/medDocumentationLive";
import type {
  DoseIssue,
  DoseIssueRow,
  Fact,
} from "../../data/medDocumentationIssues";
import {
  getProgramById,
  getPrograms,
} from "../../data/mockProgramsData";
import { formatMdy } from "../../lib/dateFormat";
import {
  DOCUMENTATION_ISSUE_TYPES,
  NO_DOCUMENTATION_FILTERS,
  type MissingDocumentationFilters,
} from "../../lib/medicationHomeSections";

const PAGE_SIZE = 10;
const ALL = "all";
/** The application's missing-value convention. */
const MISSING = "—";

const COLUMNS = [
  "Program",
  "Youth",
  "Medication",
  "Dose",
  "Dose Period",
  "Medication Date/Time",
  "Staff Dispensed",
  "Youth Received",
  "Medication Code",
  "Issue Type",
] as const;

const ISSUE_LABEL: Record<DoseIssue["type"], string> = {
  "missing-attestation": "Missing attestation",
  "youth-received-missing": "Youth Received missing",
  "yes-yes-nonreceipt-code": "Yes/Yes with non-receipt code",
};
const issueLabel = (i: DoseIssue) =>
  i.type === "missing-attestation" && i.stage
    ? `Missing ${i.stage} attestation`
    : ISSUE_LABEL[i.type];
const ISSUE_BADGE = {
  "missing-attestation": "warning",
  "youth-received-missing": "info",
  "yes-yes-nonreceipt-code": "error",
} as const;

const factLabel = (f: Fact) =>
  f === "yes"
    ? "Yes"
    : f === "no"
      ? "No"
      : f === "redacted"
        ? "Restricted"
        : f === "unavailable"
          ? "Unavailable"
          : MISSING;

function dateTime(iso: string | null): string {
  const d = iso ? new Date(iso) : null;
  if (!d || isNaN(d.getTime())) return MISSING;
  const h = d.getHours();
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${formatMdy(d)} ${h % 12 || 12}:${mm} ${h < 12 ? "AM" : "PM"}`;
}
function dateOnly(iso: string | null): string {
  const m = iso ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso) : null;
  return m ? `${m[2]}/${m[3]}/${m[1]}` : MISSING;
}

interface MissingMedicationDocumentationProps {
  canView: boolean;
  filters: MissingDocumentationFilters;
  onFiltersChange: (
    filters: MissingDocumentationFilters,
  ) => void;
  /** Opens one documentation record (canonical log id) in Med Documentation. */
  onInvestigateRecord: (logId: string) => void;
  onBackToHome: () => void;
}

// US 20143: doses whose documentation is missing or inconsistent, from the
// shared evaluator (medDocumentationLive → medDocumentationIssues) over the
// canonical logs, attestations and corrections. Nothing is stored here. The
// expected-dose (scheduling) source is unavailable today, so the result is
// always shown as PARTIAL: known issues only.
export function MissingMedicationDocumentation({
  canView,
  filters,
  onFiltersChange,
  onInvestigateRecord,
  onBackToHome,
}: MissingMedicationDocumentationProps) {
  return (
    <MedicationGlobalDestination
      title="Missing or Incomplete Medication Documentation"
      hideTitle={canView}
      canView={canView}
      onBackToHome={onBackToHome}
    >
      <DocumentationIssues
        filters={filters}
        onFiltersChange={onFiltersChange}
        onInvestigateRecord={onInvestigateRecord}
      />
    </MedicationGlobalDestination>
  );
}

function DocumentationIssues({
  filters,
  onFiltersChange,
  onInvestigateRecord,
}: Pick<
  MissingMedicationDocumentationProps,
  "filters" | "onFiltersChange" | "onInvestigateRecord"
>) {
  // Re-evaluates the authorized scope and permissions when access changes.
  useMedicationLogAccessVersion();
  const reviews = useMedReviews();
  const logs = useMedicationLogState();
  const logReadError = useMedicationLogReadError();
  const scope = accessibleProgramIds();
  const scopeKey = JSON.stringify(scope);
  const attestationsVisible = reviewActionAllowed(
    "viewAttestationDetails",
  );
  const [page, setPage] = useState(1);
  // Per-column sort + value filters (table header)
  const [colSort, setColSort] = useState<{ col: string; dir: "asc" | "desc" } | null>(null);
  const [colFilters, setColFilters] = useState<Record<string, string[]>>({});
  const [refreshes, setRefreshes] = useState(0);

  // Recomputed (with the current time) whenever a source changes or Refresh
  // is pressed; the evaluator reads only the shared stores.
  const evaluation = useMemo(
    () =>
      evaluateMedicationDocumentation({
        snapshot: logs,
        reviews,
        scope,
        attestationsVisible,
        now: new Date().toISOString(),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logs, reviews, scopeKey, attestationsVisible, refreshes],
  );
  const programOptions = useMemo(
    () =>
      getPrograms()
        .filter((p) => scope === "all" || scope.includes(p.id))
        .map((p) => ({ id: String(p.id), name: p.name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scopeKey],
  );

  // Filters only narrow the authorized known issues.
  const rows = evaluation.rows.filter(
    (r) =>
      (!filters.program ||
        String(r.programId) === filters.program) &&
      (!filters.issue ||
        r.issues.some((i) => i.type === filters.issue)),
  );
  const complete = evaluation.outcome === "evaluated";

  /** Plain-text value(s) of a cell, for column sort and value filters.
   *  Multi-log / multi-issue cells yield one value per entry. */
  const cellValues = (r: DoseIssueRow, col: (typeof COLUMNS)[number]): string[] => {
    const logs = (pick: (l: DoseIssueRow["logs"][number]) => string) =>
      r.logs.length === 0 ? [String(MISSING)] : r.logs.map(pick);
    switch (col) {
      case "Program": return [getProgramById(r.programId)?.name ?? "Program unavailable"];
      case "Youth": return [youthName(r.youthId) || String(MISSING)];
      case "Medication": return [r.medicationName || String(MISSING)];
      case "Dose": return [r.dose || String(MISSING)];
      case "Dose Period": return [r.dosePeriod || String(MISSING)];
      case "Medication Date/Time": {
        const v = [
          ...(r.expectedDoseId !== null ? [`Scheduled: ${dateTime(r.scheduledFor)}`] : []),
          ...r.logs.map((l) => `Documented dose date: ${dateOnly(l.doseDate)}`),
        ];
        return v.length ? v : [String(MISSING)];
      }
      case "Staff Dispensed": return logs((l) => factLabel(l.staffDispensed));
      case "Youth Received": return logs((l) => factLabel(l.youthReceived));
      case "Medication Code": return logs((l) => l.code || String(MISSING));
      case "Issue Type": return r.issues.map((i) => issueLabel(i));
    }
    return [];
  };
  const columnOptions = Object.fromEntries(
    COLUMNS.map((c) => [
      c,
      Array.from(new Set(rows.flatMap((r) => cellValues(r, c)))).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
      ),
    ]),
  ) as Record<string, string[]>;
  let viewRows = rows.filter((r) =>
    Object.entries(colFilters).every(
      ([c, vals]) =>
        vals.length === 0 ||
        cellValues(r, c as (typeof COLUMNS)[number]).some((v) => vals.includes(v)),
    ),
  );
  if (colSort) {
    const { col, dir } = colSort;
    viewRows = [...viewRows].sort((a, b) => {
      const cmp = cellValues(a, col as (typeof COLUMNS)[number])
        .join(" ")
        .localeCompare(cellValues(b, col as (typeof COLUMNS)[number]).join(" "), undefined, { numeric: true });
      return dir === "asc" ? cmp : -cmp;
    });
  }
  const toggleSort = (col: string) => {
    setPage(1);
    setColSort((prev) =>
      !prev || prev.col !== col ? { col, dir: "asc" } : prev.dir === "asc" ? { col, dir: "desc" } : null,
    );
  };
  const toggleColValue = (col: string, val: string) => {
    setPage(1);
    setColFilters((prev) => {
      const cur = prev[col] ?? [];
      return { ...prev, [col]: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val] };
    });
  };

  const totalPages = Math.max(
    1,
    Math.ceil(viewRows.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRows = viewRows.slice(start, start + PAGE_SIZE);

  const refresh = () => {
    refreshMedReviewsFromStorage();
    reloadMedicationLogs();
    setRefreshes((n) => n + 1);
  };
  const change = (next: MissingDocumentationFilters) => {
    setPage(1);
    onFiltersChange(next);
  };

  // Unreadable medication logs are an error with a retry — never an empty
  // list and never an all-clear.
  if (logReadError)
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <EmptyState
          icon={TriangleAlert}
          tone="error"
          title="Medication documentation could not be loaded"
          description={logReadError}
        />
        <Button
          type="button"
          variant="outline"
          onClick={refresh}
        >
          Try again
        </Button>
      </div>
    );

  /** Scheduled time (expected doses) and documented dose date(s) (logs),
   *  each labelled for what it is. */
  const medicationTime = (r: DoseIssueRow) => (
    <>
      {r.expectedDoseId !== null && (
        <div>Scheduled: {dateTime(r.scheduledFor)}</div>
      )}
      {r.logs.map((l) => (
        <div key={l.logId}>
          Documented dose date: {dateOnly(l.doseDate)}
        </div>
      ))}
      {r.expectedDoseId === null &&
        r.logs.length === 0 &&
        MISSING}
    </>
  );
  const perLog = (
    r: DoseIssueRow,
    pick: (l: DoseIssueRow["logs"][number]) => string,
  ) =>
    r.logs.length === 0
      ? MISSING
      : r.logs.map((l) => <div key={l.logId}>{pick(l)}</div>);

  const empty = () => {
    if (evaluation.rows.length > 0 && viewRows.length === 0)
      return (
        <>
          <EmptyState
            icon={SearchX}
            title="No known issues match your filters"
            description="Try a different Program or issue type."
          />
          <Button
            type="button"
            variant="outline-primary"
            onClick={() => {
              setColFilters({});
              change(NO_DOCUMENTATION_FILTERS);
            }}
          >
            Clear
          </Button>
        </>
      );
    if (complete)
      return (
        <EmptyState
          icon={CheckCircle2}
          tone="success"
          title="No documentation issues found"
          description="Every dose in your Programs was evaluated and none has a documentation issue."
        />
      );
    return (
      <EmptyState
        icon={ClipboardList}
        tone="warning"
        title="No known documentation issues"
        description="This is not an all-clear: only doses that already have documentation are checked."
      />
    );
  };

  return (
    <div className="flex flex-col gap-[var(--app-content-gap)]">
      <Card variant="container" elevation="sm">
        <TableToolbar
          live
          className="bg-[var(--slds-g-color-background-alt)] border-b border-border"
          title="Missing or Incomplete Medication Documentation"
          count={viewRows.length}
          countLabel={viewRows.length === 1 ? "dose" : "doses"}
        >
          <div className="flex flex-wrap items-center justify-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Refresh"
                onClick={refresh}
              >
                <RefreshCw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
          <Select
            value={filters.program || ALL}
            onValueChange={(v) =>
              change({
                ...filters,
                program: v === ALL ? "" : v,
              })
            }
          >
            <SelectTrigger
              size="default"
              className="w-48"
              aria-label="Program"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Programs</SelectItem>
              {programOptions.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.issue || ALL}
            onValueChange={(v) =>
              change({ ...filters, issue: v === ALL ? "" : v })
            }
          >
            <SelectTrigger
              size="default"
              className="w-56"
              aria-label="Issue Type"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>
                All Issue Types
              </SelectItem>
              {DOCUMENTATION_ISSUE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {ISSUE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </TableToolbar>
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              {COLUMNS.map((c) => {
                const sorted = colSort?.col === c ? colSort.dir : null;
                const active = (colFilters[c] ?? []).length > 0;
                return (
                  <TableHead
                    key={c}
                    variant="slds"
                    size="md"
                    scope="col"
                    active={!!sorted}
                    aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"}
                  >
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleSort(c)}
                        title={`Sort by ${c}`}
                        className="inline-flex items-center gap-1 uppercase [font-size:inherit] [font-weight:inherit] [letter-spacing:inherit]"
                      >
                        {c}
                        {sorted === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : sorted === "desc" ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            aria-label={`Filter ${c}`}
                            title={`Filter ${c}`}
                            className="p-0.5 rounded hover:bg-[var(--slds-g-color-background-alt)]"
                            style={{ color: active ? "var(--color-brand-primary)" : undefined }}
                          >
                            <Filter
                              className={`h-3 w-3 ${active ? "" : "opacity-40"}`}
                              fill={active ? "currentColor" : "none"}
                            />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-64 p-0 normal-case tracking-normal font-normal">
                          <div className="px-3 py-2 border-b text-[length:var(--slds-g-font-size-3)] font-semibold text-[var(--slds-g-color-text-default)]">
                            Filter: {c}
                          </div>
                          <div className="max-h-60 overflow-y-auto py-1">
                            {(columnOptions[c] ?? []).map((v) => {
                              const id = `mmd-${c}-${v}`;
                              return (
                                <label
                                  key={v}
                                  htmlFor={id}
                                  className="flex items-center gap-2 px-3 py-1.5 cursor-pointer text-[length:var(--slds-g-font-size-4)] text-[var(--slds-g-color-text-default)] hover:bg-[var(--slds-g-color-background-alt)]"
                                >
                                  <Checkbox
                                    id={id}
                                    checked={(colFilters[c] ?? []).includes(v)}
                                    onCheckedChange={() => toggleColValue(c, v)}
                                  />
                                  <span className="truncate">{v}</span>
                                </label>
                              );
                            })}
                          </div>
                          <div className="flex justify-end px-3 py-2 border-t">
                            <Button
                              type="button"
                              variant="outline-primary"
                              size="sm"
                              disabled={!active}
                              onClick={() => {
                                setPage(1);
                                setColFilters((prev) => ({ ...prev, [c]: [] }));
                              }}
                            >
                              Clear
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((r) => (
              <TableRow
                key={r.doseKey}
                data-dose-key={r.doseKey}
              >
                <TableCell wrap>
                  {getProgramById(r.programId)?.name ??
                    "Program unavailable"}
                </TableCell>
                <TableCell wrap>
                  {youthName(r.youthId) || MISSING}
                </TableCell>
                <TableCell wrap>
                  {r.medicationName || MISSING}
                </TableCell>
                <TableCell wrap>{r.dose || MISSING}</TableCell>
                <TableCell wrap>
                  {r.dosePeriod || MISSING}
                </TableCell>
                <TableCell wrap>{medicationTime(r)}</TableCell>
                <TableCell wrap>
                  {perLog(r, (l) =>
                    factLabel(l.staffDispensed),
                  )}
                </TableCell>
                <TableCell wrap>
                  {perLog(r, (l) => factLabel(l.youthReceived))}
                </TableCell>
                <TableCell wrap>
                  {perLog(r, (l) => l.code || MISSING)}
                </TableCell>
                <TableCell wrap>
                  <ul className="flex flex-col gap-1">
                    {r.issues.map((i, n) => (
                      <li key={n}>
                        <Badge
                          variant={ISSUE_BADGE[i.type]}
                          bordered
                        >
                          {issueLabel(i)}
                        </Badge>
                        <p className="text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">
                          {i.reason}
                        </p>
                      </li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            ))}
            {viewRows.length === 0 && (
              <TableRow hoverable={false}>
                <TableCell colSpan={COLUMNS.length}>
                  <div className="py-12 flex flex-col items-center gap-4">
                    {empty()}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {viewRows.length > 0 && (
          <CardFooter size="sm" separated>
            <TablePaginationBar
              className="w-full"
              start={start + 1}
              end={start + pageRows.length}
              total={viewRows.length}
              countLabel="known issues"
              currentPage={safePage}
              totalPages={totalPages}
              onPrevious={() => setPage(safePage - 1)}
              onNext={() => setPage(safePage + 1)}
            />
          </CardFooter>
        )}
      </Card>
    </div>
  );
}