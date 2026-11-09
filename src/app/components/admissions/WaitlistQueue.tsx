import { memo, useEffect, useMemo, useState } from "react";
import {
  ArrowUp,
  ClipboardList,
  Eye,
  Pencil,
  SearchX,
} from "@/app/lib/lucide-icons";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../ui/card";
import { TablePaginationBar } from "../ui/table-toolbar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import { ColumnFilter } from "../ui/column-filter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  getHomeName,
  type WaitlistCandidate,
  type WaitlistCategory,
  type YouthType,
} from "../../data/mockProjectionsWaitlistData";
import {
  currentAge,
  daysBetween,
  getClosingState,
  isMissingDelayDetails,
  type ConnectionDates,
} from "../../lib/projectionsWaitlist";
import { formatMdy } from "../../lib/dateFormat";
import {
  WaitlistFilters,
  type WaitlistFilterState,
} from "./WaitlistFilters";

const CATEGORY_VARIANT: Record<
  WaitlistCategory,
  "neutral" | "info" | "success" | "error"
> = {
  Referral: "neutral",
  "Info Session Scheduled": "info",
  "Program Waitlist": "success",
  Delayed: "error",
  Closed: "neutral",
};

const PRIORITY_VARIANT = {
  High: "error",
  Medium: "warning",
  Low: "neutral",
} as const;

function fmt(iso?: string) {
  return iso ? formatMdy(`${iso.slice(0, 10)}T00:00:00`) : "—";
}

// Readmit uses the brand orange everywhere it appears (waitlist and Bed
// Projections) — distinct from the red/purple/green/blue/black meanings.
export function YouthTypeBadge({ type }: { type: YouthType }) {
  return type === "Readmit" ? (
    <Badge variant="orange">Readmit</Badge>
  ) : (
    <Badge variant="neutral" bordered>
      External
    </Badge>
  );
}

export function WaitlistClosingBadge({
  candidate,
  today,
}: {
  candidate: WaitlistCandidate;
  today: Date;
}) {
  const closing = getClosingState(candidate, today);
  if (!closing) return null;
  return closing.state === "grace" ? (
    <Badge variant="neutral" bordered>
      Closing List · {closing.daysLeft} days left
    </Badge>
  ) : (
    <Badge variant="error" bordered>
      Eligible for archival
    </Badge>
  );
}

interface WaitlistQueueProps {
  rows: WaitlistCandidate[];
  totalActive: number;
  enrolledCount: number;
  connections: Record<string, ConnectionDates>;
  filters: WaitlistFilterState;
  onFiltersChange: (next: WaitlistFilterState) => void;
  today: Date;
  canEdit: boolean;
  onOpen: (candidateId: string) => void;
  caseManagers: string[];
  /** Closed youth past the 30-day grace period (left the active queue). */
  archivedCount: number;
}

const PAGE_SIZE = 10;

// Header label + the text each column filters on (its displayed value).
function columnsFor(
  connections: Record<string, ConnectionDates>,
  today: Date,
): {
  label: string;
  value?: (c: WaitlistCandidate) => string;
}[] {
  const con = (c: WaitlistCandidate) => connections[c.id] ?? {};
  return [
    { label: "Youth", value: (c) => c.name },
    { label: "Youth Type", value: (c) => c.youthType },
    { label: "DOB / Age", value: (c) => fmt(c.dateOfBirth) },
    { label: "Category", value: (c) => c.category },
    {
      label: "Days in Category",
      value: (c) =>
        String(daysBetween(c.categoryEnteredAt, today)),
    },
    { label: "Priority", value: (c) => c.priorityRank ?? "—" },
    {
      label: "Anticipated Program",
      value: (c) =>
        c.anticipatedProgram
          ? getHomeName(c.anticipatedProgram)
          : "Not determined",
    },
    {
      label: "Anticipated Move-In",
      value: (c) => fmt(c.anticipatedMoveInDate),
    },
    {
      label: "Case Manager",
      value: (c) => c.caseManager || "—",
    },
    {
      label: "Referral Date",
      value: (c) => fmt(c.referralDate),
    },
    {
      label: "Info Session",
      value: (c) => fmt(c.infoSessionDate),
    },
    {
      label: "Clinical Assessment",
      value: (c) =>
        fmt(con(c)["Admissions Clinical Assessment"]),
    },
    {
      label: "Admissions Shadow",
      value: (c) => fmt(con(c)["Admissions Shadow"]),
    },
    {
      label: "Staffing",
      value: (c) => fmt(con(c)["Staffing Meeting"]),
    },
    { label: "Check-In", value: (c) => fmt(c.checkInDate) },
    {
      label: "Next Review",
      value: (c) =>
        c.category === "Delayed" ? fmt(c.nextReviewDate) : "—",
    },
    {
      label: "Delay Reason",
      value: (c) =>
        c.category === "Delayed" ? (c.delayReason ?? "—") : "—",
    },
    { label: "Grade", value: (c) => c.grade || "—" },
    {
      label: "Guardianship Details",
      value: (c) => c.guardianshipDetails || "—",
    },
    {
      label: "Medical Notes",
      value: (c) => c.medicalNotes || "—",
    },
    { label: "Comments", value: (c) => c.comments || "—" },
    { label: "" },
  ];
}

export const WaitlistQueue = memo(function WaitlistQueue({
  rows,
  totalActive,
  enrolledCount,
  connections,
  filters,
  onFiltersChange,
  today,
  canEdit,
  onOpen,
  caseManagers,
  archivedCount,
}: WaitlistQueueProps) {
  const [page, setPage] = useState(1);
  const columns = useMemo(
    () => columnsFor(connections, today),
    [connections, today],
  );
  // Column filters (Excel-style), applied on top of the top-level filters.
  const [columnFilters, setColumnFilters] = useState<
    Record<string, string[]>
  >({});
  const filteredRows = useMemo(
    () =>
      rows.filter((c) =>
        columns.every(
          (col) =>
            !col.value ||
            !columnFilters[col.label]?.length ||
            columnFilters[col.label].includes(col.value(c)),
        ),
      ),
    [rows, columns, columnFilters],
  );
  const columnOptions = useMemo(
    () =>
      Object.fromEntries(
        columns
          .filter((col) => col.value)
          .map((col) => [
            col.label,
            [...new Set(rows.map((c) => col.value!(c)))].sort(
              (a, b) =>
                a.localeCompare(b, undefined, {
                  numeric: true,
                }),
            ),
          ]),
      ) as Record<string, string[]>,
    [rows, columns],
  );
  const hasColumnFilters = Object.values(columnFilters).some(
    (v) => v.length > 0,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const pageRows = filteredRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // New filters/order start from the first page; individual edits keep it.
  useEffect(() => setPage(1), [filters, columnFilters]);

  return (
    <Card variant="section" elevation="sm">
      <CardHeader
        size="sm"
        separated
        className="flex flex-wrap items-start justify-between gap-3"
      >
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="slds-text-5 font-semibold">
              Waitlist
            </CardTitle>
            <Badge variant="success">
              {filteredRows.length} of {totalActive} youth
            </Badge>
          </div>
          <CardDescription className="slds-text-3">
            Individual admissions work queue, ordered by
            Referral Date. Youth with a saved Program Enrollment
            move to Bed Projections
            {enrolledCount > 0 &&
              ` (${enrolledCount} recently enrolled and removed from this list)`}
            . Closed youth stay on the Closing List for 30 days
            {archivedCount > 0 &&
              ` (${archivedCount} past the grace period no longer shown)`}
            .
          </CardDescription>
        </div>
        <WaitlistFilters
          value={filters}
          onChange={onFiltersChange}
          caseManagers={caseManagers}
        />
      </CardHeader>

      {totalActive === 0 ? (
        <EmptyState
          className="py-10"
          icon={ClipboardList}
          title="No youth on the waitlist"
          description="Prospective youth appear here once they are referred to Admissions."
        />
      ) : filteredRows.length === 0 ? (
        <EmptyState
          className="py-10"
          icon={SearchX}
          title="No youth match these filters"
          description="Try a different age group, category, search or column filter."
          actionLabel={
            hasColumnFilters
              ? "Clear column filters"
              : undefined
          }
          actionVariant="outline"
          onAction={() => setColumnFilters({})}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              {columns.map(({ label: c, value }, i) => (
                <TableHead
                  key={c || i}
                  variant="slds"
                  active={
                    c === "Referral Date" &&
                    filters.order === "referral"
                  }
                  className={
                    i === 0 ? "sticky left-0 z-20" : undefined
                  }
                >
                  <span className="inline-flex items-center gap-1">
                    {c}
                    {c === "Referral Date" &&
                      filters.order === "referral" && (
                        <ArrowUp
                          className="h-3 w-3"
                          aria-label="sorted ascending"
                        />
                      )}
                    {value && (
                      <ColumnFilter
                        label={c}
                        options={columnOptions[c] ?? []}
                        value={columnFilters[c] ?? []}
                        onValueChange={(v) =>
                          setColumnFilters((prev) => ({
                            ...prev,
                            [c]: v,
                          }))
                        }
                      />
                    )}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((c) => {
              const con = connections[c.id] ?? {};
              const age = currentAge(c.dateOfBirth, today);
              const missingProgram = !c.anticipatedProgram;
              const missingMoveIn =
                !!c.anticipatedProgram &&
                !c.anticipatedMoveInDate;
              return (
                <TableRow
                  key={c.id}
                  tone={
                    c.youthType === "Readmit"
                      ? "accent"
                      : "default"
                  }
                  className="cursor-pointer"
                  onClick={() => onOpen(c.id)}
                >
                  <TableCell
                    className={`sticky left-0 z-10 ${c.youthType === "Readmit" ? "bg-inherit" : "bg-card"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="slds-text-4 font-medium">
                        {c.name}
                      </span>
                      {c.isInternalTransfer && (
                        <Badge variant="success">
                          Internal transfer
                        </Badge>
                      )}
                    </div>
                    <p className="slds-text-2 text-[var(--slds-g-color-text-weak)]">
                      {c.ageGroup}
                    </p>
                  </TableCell>
                  <TableCell>
                    <YouthTypeBadge type={c.youthType} />
                  </TableCell>
                  <TableCell className="slds-text-3">
                    {fmt(c.dateOfBirth)}
                    {age != null && (
                      <span className="text-[var(--slds-g-color-text-weak)]">
                        {" "}
                        · {age}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant={CATEGORY_VARIANT[c.category]}
                      >
                        {c.category}
                      </Badge>
                      <WaitlistClosingBadge
                        candidate={c}
                        today={today}
                      />
                      {isMissingDelayDetails(c) && (
                        <Badge variant="warning" bordered>
                          Missing delay details
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="slds-text-3 text-center">
                    {daysBetween(c.categoryEnteredAt, today)}
                  </TableCell>
                  <TableCell>
                    {c.priorityRank ? (
                      <Badge
                        variant={
                          PRIORITY_VARIANT[c.priorityRank]
                        }
                      >
                        {c.priorityRank}
                      </Badge>
                    ) : (
                      <span className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                        —
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="slds-text-3">
                    {missingProgram ? (
                      <span className="text-[var(--slds-g-color-text-weak)]">
                        Not determined
                      </span>
                    ) : (
                      getHomeName(c.anticipatedProgram)
                    )}
                  </TableCell>
                  <TableCell className="slds-text-3">
                    {missingMoveIn ? (
                      <Badge variant="warning">
                        Move-in date needed
                      </Badge>
                    ) : (
                      fmt(c.anticipatedMoveInDate)
                    )}
                  </TableCell>
                  <TableCell className="slds-text-3">
                    {c.caseManager || "—"}
                  </TableCell>
                  <TableCell className="slds-text-3">
                    {fmt(c.referralDate)}
                  </TableCell>
                  <TableCell className="slds-text-3">
                    {fmt(c.infoSessionDate)}
                  </TableCell>
                  <TableCell className="slds-text-3">
                    {fmt(con["Admissions Clinical Assessment"])}
                  </TableCell>
                  <TableCell className="slds-text-3">
                    {fmt(con["Admissions Shadow"])}
                  </TableCell>
                  <TableCell className="slds-text-3">
                    {fmt(con["Staffing Meeting"])}
                  </TableCell>
                  <TableCell className="slds-text-3">
                    {fmt(c.checkInDate)}
                  </TableCell>
                  <TableCell className="slds-text-3">
                    {c.category === "Delayed"
                      ? fmt(c.nextReviewDate)
                      : "—"}
                  </TableCell>
                  <TableCell className="slds-text-3">
                    {c.category === "Delayed"
                      ? (c.delayReason ?? "—")
                      : "—"}
                  </TableCell>
                  <TableCell className="slds-text-3">
                    {c.grade || "—"}
                  </TableCell>
                  <TableCell
                    className="slds-text-3 max-w-[240px] truncate"
                    title={c.guardianshipDetails}
                  >
                    {c.guardianshipDetails || "—"}
                  </TableCell>
                  <TableCell
                    className="slds-text-3 max-w-[240px] truncate"
                    title={c.medicalNotes}
                  >
                    {c.medicalNotes || "—"}
                  </TableCell>
                  <TableCell
                    className="slds-text-3 max-w-[240px] truncate"
                    title={c.comments}
                  >
                    {c.comments || "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`${canEdit ? "Edit" : "View"} ${c.name}`}
                      title={canEdit ? "Edit" : "View"}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpen(c.id);
                      }}
                    >
                      {canEdit ? <Pencil /> : <Eye />}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {filteredRows.length > 0 && (
        <CardFooter separated>
          <TablePaginationBar
            className="w-full"
            start={(currentPage - 1) * PAGE_SIZE + 1}
            end={Math.min(
              currentPage * PAGE_SIZE,
              filteredRows.length,
            )}
            total={filteredRows.length}
            countLabel="youth"
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={() => setPage(currentPage - 1)}
            onNext={() => setPage(currentPage + 1)}
          />
        </CardFooter>
      )}
    </Card>
  );
});