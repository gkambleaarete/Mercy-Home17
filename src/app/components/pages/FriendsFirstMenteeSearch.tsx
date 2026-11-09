import { useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  Download,
  Heart,
  RefreshCw,
  Search,
  X,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ColumnFilter } from "../ui/column-filter";
import { EmptyState } from "../ui/empty-state";
import { Input } from "../ui/input";
import { MultiSelect } from "../ui/multi-select";
import { PageHeader } from "../ui/page-header";
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
  TableFooterBar,
  TableToolbar,
} from "../ui/table-toolbar";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  FF_MENTEE_STAGES,
  FF_MENTEE_STAGE_BADGE_VARIANT,
  SUB_PROGRAMMES,
  SUB_PROGRAMME_BADGE_VARIANT,
  type FFMenteeStage,
  type FFSubProgramme,
} from "../../data/mockFriendsFirstData";
import {
  listFFReferrals,
  refreshFFStoreFromStorage,
  useFFMentees,
  useFFReferralWork,
} from "../../data/ffMenteeStore";
import { buildMenteeSearchRows } from "../../data/ffMenteeSearch";
import { exportToCSV } from "../../lib/exportCsv";
import {
  AGE_BANDS,
  BLANK_MENTEE_CRITERIA,
  cellText,
  columnFilterOptions,
  filterMentees,
  type AgeBand,
  type MenteeColumnFilters,
  type MenteeColumnKey,
  type MenteeCriteria,
} from "../../lib/menteeSearch";
import { localTodayIso } from "../../lib/dateFormat";

const PAGE_SIZE = 12;
/** Placeholder for a missing value. */
const EMPTY = "—";
const GENDERS = ["Male", "Female", "Other"] as const;
const ALL_AGES = "all";

const COLUMNS: { key: MenteeColumnKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "subProgramme", label: "Sub-Program" },
  { key: "location", label: "Location" },
  { key: "age", label: "Age" },
  { key: "interests", label: "Interests/hobbies" },
  { key: "ethnicity", label: "Ethnicity" },
  { key: "religion", label: "Religion" },
  { key: "dob", label: "Date of Birth" },
  { key: "referralDate", label: "Date of Referral" },
  { key: "promotionDate", label: "Promotion Date" },
  { key: "stage", label: "Pipeline Stage" },
];

function PlainCell({
  value,
  wrap,
}: {
  value: string;
  wrap?: boolean;
}) {
  return (
    <TableCell
      tone="muted"
      wrap={wrap}
      className={
        wrap ? "min-w-[220px] max-w-[320px]" : undefined
      }
      title={wrap && value ? value : undefined}
    >
      {value || EMPTY}
    </TableCell>
  );
}

export function FriendsFirstMenteeSearch() {
  const [criteria, setCriteria] = useState<MenteeCriteria>(
    BLANK_MENTEE_CRITERIA,
  );
  const [colFilters, setColFilters] =
    useState<MenteeColumnFilters>({});
  const [page, setPage] = useState(1);
  // Live shared store: record-page edits (stage, sub-program, intake,
  // Inactive…) and linked-referral changes show here immediately.
  const mentees = useFFMentees();
  const referralWork = useFFReferralWork();

  const pool = useMemo(
    () => buildMenteeSearchRows(mentees, listFFReferrals()),
    // referralWork changes whenever a saved referral does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mentees, referralWork],
  );
  const results = useMemo(
    () => filterMentees(pool, criteria, colFilters),
    [pool, criteria, colFilters],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(results.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageRows = results.slice(
    pageStart,
    pageStart + PAGE_SIZE,
  );

  const optionsByColumn = useMemo(() => {
    const out = {} as Record<MenteeColumnKey, string[]>;
    for (const { key } of COLUMNS)
      out[key] = columnFilterOptions(pool, key);
    return out;
  }, [pool]);

  const hasFilters =
    criteria.name.trim() !== "" ||
    criteria.subProgrammes.length > 0 ||
    criteria.stages.length > 0 ||
    criteria.genders.length > 0 ||
    criteria.ageBand !== "" ||
    Object.values(colFilters).some((v) => v && v.length > 0);

  // Any change to search/filter criteria returns to page 1 so the user is
  // never left on a page past the end of the new result set.
  const updateCriteria = (patch: Partial<MenteeCriteria>) => {
    setCriteria((c) => ({ ...c, ...patch }));
    setPage(1);
  };
  const setColumnFilter = (
    key: MenteeColumnKey,
    v: string[],
  ) => {
    setColFilters((f) => ({ ...f, [key]: v }));
    setPage(1);
  };
  const clearFilters = () => {
    setCriteria(BLANK_MENTEE_CRITERIA);
    setColFilters({});
    setPage(1);
  };

  // Re-reads saved data through the store; search and filters are kept.
  const refresh = () => {
    if (!refreshFFStoreFromStorage())
      toast.error("Mentee data can't be refreshed", {
        description:
          "Saved data could not be read. What you see has not been changed.",
      });
  };

  // Every match across all pages, with the table's own mapped values.
  const exportResults = () => {
    const date = localTodayIso();
    exportToCSV(
      `mentee-search-results-${date}.csv`,
      [
        "Name",
        "Gender",
        ...COLUMNS.slice(1).map((c) => c.label),
      ],
      results.map((m) => [
        m.name,
        m.gender,
        ...COLUMNS.slice(1).map((c) => cellText(m, c.key)),
      ]),
      { bom: true },
    );
  };

  return (
    <div
      className="flex h-full flex-col"
      style={{
        backgroundColor: "var(--slds-g-color-background-alt-2)",
      }}
    >
      <PageHeader
        icon={Heart}
        eyebrow="Friends First"
        title="Mentee Search"
        actions={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={refresh}
                aria-label="Refresh mentee search"
              >
                <RefreshCw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
        }
      />

      {/* Extra bottom padding clears the fixed 40px utility bar. */}
      <div className="app-page-x flex min-h-0 flex-1 flex-col gap-[var(--app-section-gap)] overflow-y-auto pb-16 pt-[var(--app-section-gap)]">
        {/* ── Results (Data Table pattern) ── */}
        <Card variant="container" elevation="sm">
          <TableToolbar
            leading={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={exportResults}
                disabled={results.length === 0}
                title={
                  results.length === 0
                    ? "No mentees to export"
                    : undefined
                }
                aria-label="Export mentee search results"
              >
                <Download /> Export
              </Button>
            }
            live
            title={`Mentee Search (${results.length})`}
          >
            <div
              className="flex flex-wrap items-center justify-end gap-2"
              role="search"
              aria-label="Mentee search filters"
            >
              <MultiSelect
                id="mentee-filter-subprogram"
                aria-label="Sub-Program"
                display="inline"
                className="w-48"
                placeholder="All Sub-Programs"
                options={SUB_PROGRAMMES}
                value={criteria.subProgrammes}
                onValueChange={(v) =>
                  updateCriteria({
                    subProgrammes: v as FFSubProgramme[],
                  })
                }
              />
              <MultiSelect
                id="mentee-filter-stage"
                aria-label="Stage"
                display="inline"
                className="w-56"
                placeholder="All Stages"
                options={FF_MENTEE_STAGES}
                value={criteria.stages}
                onValueChange={(v) =>
                  updateCriteria({
                    stages: v as FFMenteeStage[],
                  })
                }
              />
              <MultiSelect
                id="mentee-filter-gender"
                aria-label="Gender"
                display="inline"
                className="w-44"
                placeholder="All Genders"
                options={GENDERS}
                value={criteria.genders}
                onValueChange={(v) =>
                  updateCriteria({ genders: v })
                }
              />
              <Select
                value={criteria.ageBand || ALL_AGES}
                onValueChange={(v) =>
                  updateCriteria({
                    ageBand:
                      v === ALL_AGES ? "" : (v as AgeBand),
                  })
                }
              >
                <SelectTrigger
                  id="mentee-filter-age"
                  className="w-32"
                >
                  <SelectValue placeholder="All Ages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_AGES}>
                    All Ages
                  </SelectItem>
                  {AGE_BANDS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="mentee-search-name"
                size="md"
                aria-label="Mentee Name"
                placeholder="Search"
                leadingIcon={<Search className="size-4" />}
                value={criteria.name}
                onChange={(e) =>
                  updateCriteria({ name: e.target.value })
                }
                className="w-56"
              />
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                disabled={!hasFilters}
              >
                <X /> Clear Filters
              </Button>
            </div>
          </TableToolbar>

          {/* The Table container is the single scrolling area: both axes
              scroll here so the header stays sticky and every column is
              reachable. */}
          <Table
            containerClassName="max-h-[calc(100vh-430px)] min-h-[280px] overflow-auto"
            className="min-w-[1900px]"
          >
            <TableHeader>
              <TableRow hoverable={false}>
                {COLUMNS.map(({ key, label }) => {
                  const selected = colFilters[key] ?? [];
                  const known = optionsByColumn[key];
                  return (
                    <TableHead
                      key={key}
                      variant="slds"
                      size="md"
                      className="sticky top-0 z-10"
                    >
                      <div className="inline-flex items-center gap-1">
                        {label}
                        <ColumnFilter
                          label={label}
                          options={[
                            ...known,
                            // Keep a selection removable even if the
                            // dataset no longer has that value.
                            ...selected.filter(
                              (v) => !known.includes(v),
                            ),
                          ]}
                          value={selected}
                          onValueChange={(v) =>
                            setColumnFilter(key, v)
                          }
                        />
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-[var(--slds-c-spacing-small)]">
                      <Avatar size="md">
                        <AvatarFallback
                          size="md"
                          color="primary"
                        >
                          {m.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <Button
                          asChild
                          variant="link-info"
                          size="inline"
                        >
                          <Link
                            to={`/friends-first-mentee/${m.id}`}
                          >
                            {m.name}
                          </Link>
                        </Button>
                        <span className="slds-text-3 block text-[var(--slds-g-color-text-weak)]">
                          {m.gender || EMPTY}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        SUB_PROGRAMME_BADGE_VARIANT[
                          m.subProgramme
                        ]
                      }
                    >
                      {m.subProgramme}
                    </Badge>
                  </TableCell>
                  <PlainCell value={m.location} />
                  <PlainCell value={cellText(m, "age")} />
                  <PlainCell
                    value={m.interests.join(", ")}
                    wrap
                  />
                  <PlainCell value={m.ethnicity} />
                  <PlainCell value={m.religion} />
                  <PlainCell value={m.dob} />
                  <PlainCell value={m.referralDate} />
                  <PlainCell value={m.promotionDate} />
                  <TableCell>
                    <Badge
                      variant={
                        FF_MENTEE_STAGE_BADGE_VARIANT[m.stage]
                      }
                    >
                      {m.stage}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {pageRows.length === 0 && (
                <TableRow hoverable={false}>
                  <TableCell colSpan={COLUMNS.length}>
                    <div className="sticky left-0 w-full max-w-[min(100vw,900px)] py-16">
                      <EmptyState
                        icon={Search}
                        title="No mentees found."
                        description="Adjust your search or filters."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {pageRows.length > 0 && (
            <TableFooterBar
              start={pageStart + 1}
              end={pageStart + pageRows.length}
              total={results.length}
              countLabel="records"
              currentPage={safePage}
              totalPages={totalPages}
              onPrevious={() => setPage(safePage - 1)}
              onNext={() => setPage(safePage + 1)}
            />
          )}
        </Card>
      </div>
    </div>
  );
}