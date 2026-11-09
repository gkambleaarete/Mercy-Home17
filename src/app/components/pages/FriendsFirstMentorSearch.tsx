import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
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
  FF_MENTOR_STAGE_BADGE_VARIANT,
  STATUS_BADGE_VARIANT,
  STATUS_LABEL,
  SUB_PROGRAMMES,
  SUB_PROGRAMME_ABBR,
  SUB_PROGRAMME_BADGE_VARIANT,
  getFFMentorById,
  type BadgeVariant,
  type FFMentorStage,
  type FFSubProgramme,
} from "../../data/mockFriendsFirstData";
import {
  resolveLegacyMentorForDirectory,
  listFFMentorDirectory,
} from "../../data/ffMentorDirectory";
import {
  getFFMentorApplication,
  getFFMentorApplicationStaff,
  isFFMentorApplicationDataAvailable,
  useFFMentorApplications,
} from "../../data/ffMentorApplicationStore";
import {
  FF_APPLICANT_STATUS_LABEL,
  FF_SUB_PROGRAM_NAME,
  ffAccountCreatedDate,
} from "../../data/ffMentorApplication";
import type { FFApplicantFacingStatus } from "../../data/ffMentorApplication";
import { exportToCSV } from "../../lib/exportCsv";
import {
  BLANK_CRITERIA,
  ageFromBirthDate,
  cellText,
  columnFilterOptions,
  filterMentors,
  initialsOf,
  normalizeCriteria,
  sortMentors,
  splitInterests,
  type ColumnFilters,
  type MentorColumnKey,
  type MentorSearchCriteria,
  type MentorSearchRow,
} from "../../lib/mentorSearch";
import { localTodayIso } from "../../lib/dateFormat";

const PAGE_SIZE = 12;
/** Placeholder for a missing value (same dash Mentor Application Details uses). */
const EMPTY = "—";

// Prototype review only: existing seeded mentors shown alongside genuine
// directory members, subject to the same directory rule (approved and
// onboarded). Display-level — never fed to the Mentor Match picker or match
// creation, which use listFFMentorCandidates().
const DEMO_MENTOR_IDS = [
  "FF-CB-101",
  "FF-CB-102",
  "FF-WB-101",
  "FF-WB-102",
  "FF-SB-101",
  "FF-SB-102",
];

const SUB_PROGRAMME_LABEL: Record<FFSubProgramme, string> = {
  "Community-Based": `Community Based (${SUB_PROGRAMME_ABBR["Community-Based"]})`,
  "Work-Based": `Work Based (${SUB_PROGRAMME_ABBR["Work-Based"]})`,
  "School-Based": `School Based (${SUB_PROGRAMME_ABBR["School-Based"]})`,
};

// Colors only — which badge colour an already-saved submission status gets.
// No status value is created, changed or inferred from the pipeline stage.
const SUBMISSION_STATUS_VARIANT: Record<
  FFApplicantFacingStatus,
  BadgeVariant
> = {
  draft: "neutral",
  "in-progress": "info",
  "background-check": "warning",
  "accepted-pending-certs": "info",
  approved: "success",
  waitlisted: "neutral",
  error: "error",
  "under-review": "info",
  inactive: "error",
};

const COLUMNS: { key: MentorColumnKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "subProgramme", label: "Sub-Program" },
  { key: "status", label: "Status" },
  { key: "accountCreatedDate", label: "Account Created Date" },
  { key: "startDate", label: "Start Date" },
  { key: "coordinator", label: "Coordinator" },
  { key: "location", label: "Location" },
  { key: "age", label: "Age" },
  { key: "interests", label: "Interests/hobbies" },
  { key: "ethnicity", label: "Ethnicity" },
  { key: "religion", label: "Religion" },
  { key: "promotionDate", label: "Promotion Date" },
  { key: "pipelineStage", label: "Pipeline Stage" },
];

/** The search as the user left it, kept on this list's history entry. */
interface SearchState {
  draft: MentorSearchCriteria;
  applied: MentorSearchCriteria;
  colFilters: ColumnFilters;
  page: number;
  sortKey: MentorColumnKey | null;
  sortDir: "asc" | "desc";
}

export function FriendsFirstMentorSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  // Coming back from a record restores the search as it was left.
  const restored = (
    location.state as {
      searchState?: SearchState;
    } | null
  )?.searchState;
  // Entered (draft) text/selections vs. the criteria Search last applied.
  const [draft, setDraft] = useState<MentorSearchCriteria>(
    restored?.draft ?? BLANK_CRITERIA,
  );
  const [applied, setApplied] = useState<MentorSearchCriteria>(
    restored?.applied ?? BLANK_CRITERIA,
  );
  const [colFilters, setColFilters] = useState<ColumnFilters>(
    restored?.colFilters ?? {},
  );
  const [page, setPage] = useState(restored?.page ?? 1);
  const [sortKey, setSortKey] =
    useState<MentorColumnKey | null>(restored?.sortKey ?? null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(
    restored?.sortDir ?? "asc",
  );

  // Remember the search on this history entry before leaving for a record.
  const rememberSearch = () =>
    navigate(location.pathname, {
      replace: true,
      state: {
        searchState: {
          draft,
          applied,
          colFilters,
          page,
          sortKey,
          sortDir,
        } satisfies SearchState,
      },
    });

  // Recomputed whenever saved applications/staff processing change.
  const savedApps = useFFMentorApplications();
  const dataAvailable = isFFMentorApplicationDataAvailable();

  const pool = useMemo<MentorSearchRow[]>(() => {
    const candidates =
      listFFMentorDirectory().map<MentorSearchRow>((c) => {
        const lookup = getFFMentorApplication(c.applicationId);
        const o =
          lookup.status === "found"
            ? lookup.application.answers.overview
            : undefined;
        const submitted =
          lookup.status === "found"
            ? lookup.application
            : undefined;
        const staff = getFFMentorApplicationStaff(
          c.applicationId,
        );
        const describe = submitted?.answers.describe;
        return {
          id: c.applicationId,
          name: c.name,
          firstName: o?.firstName ?? c.name.split(" ")[0] ?? "",
          lastName:
            o?.lastName ?? c.name.split(" ").slice(1).join(" "),
          initials: initialsOf(c.name),
          email: c.email,
          subProgrammes: c.subProgrammes,
          status: submitted
            ? FF_APPLICANT_STATUS_LABEL[
                submitted.applicantStatus
              ]
            : "",
          pipelineStage: staff.stage ?? "",
          // Only a recorded account creation date; never another date.
          accountCreatedDate: ffAccountCreatedDate(submitted),
          // No mentoring start date is recorded for applicants; the
          // application submission date is not a substitute.
          startDate: "",
          coordinator: c.coordinator,
          location: [o?.city, o?.state]
            .filter(Boolean)
            .join(", "),
          age: ageFromBirthDate(o?.dob),
          interests: splitInterests(describe?.interests),
          ethnicity: o?.ethnicity ?? "",
          religion: o?.religion ?? "",
          promotionDate: "",
          readinessWarnings: c.readinessWarnings,
          demo: false,
        };
      });
    // No sample rows when storage can't be read — keep the unavailable state.
    if (!dataAvailable) return candidates;
    // A saved application owning an id wins the record link, so drop that
    // demo row rather than let it open a different person.
    const taken = new Set([
      ...candidates.map((c) => c.id),
      ...savedApps.map((a) => a.applicationId),
    ]);
    const demos = DEMO_MENTOR_IDS.filter((id) => !taken.has(id))
      .map((id) => getFFMentorById(id))
      .filter(
        (m): m is NonNullable<typeof m> => m !== undefined,
      )
      .map((m) => ({
        m,
        resolved: resolveLegacyMentorForDirectory(m),
      }))
      .filter(({ resolved }) => resolved.inDirectory)
      .map<MentorSearchRow>(({ m, resolved }) => {
        // The saved application answers (staff corrections included) win
        // over the seed; the seed fills only what isn't available.
        const d = m.applicationDetails;
        const o = resolved.application?.answers.overview;
        const desc = resolved.application?.answers.describe;
        const first =
          o?.firstName ||
          d.legalFirstName ||
          m.name.split(" ")[0];
        const last =
          o?.lastName ||
          d.legalLastName ||
          m.name.split(" ").slice(1).join(" ");
        const name =
          [first, last].filter(Boolean).join(" ") || m.name;
        const subs = resolved.application
          ? resolved.application.subPrograms.map(
              (p) => FF_SUB_PROGRAM_NAME[p],
            )
          : [m.subProgramme];
        return {
          id: m.id,
          name,
          firstName: first,
          lastName: last,
          initials: initialsOf(name),
          email: o ? o.email : m.email,
          subProgrammes: subs,
          status: STATUS_LABEL[m.status],
          pipelineStage: resolved.stage,
          accountCreatedDate: ffAccountCreatedDate(
            resolved.application,
          ),
          startDate: m.startDate,
          coordinator: resolved.coordinator,
          location: [o ? o.city : d.city, o ? o.state : d.state]
            .filter(Boolean)
            .join(", "),
          age: ageFromBirthDate(o ? o.dob : d.dateOfBirth),
          interests: desc
            ? splitInterests(desc.interests)
            : m.profile.hobbies.filter(Boolean),
          // Not recorded on seeded mentors — never guessed.
          ethnicity: o?.ethnicity ?? "",
          religion: o?.religion ?? "",
          promotionDate: "",
          readinessWarnings: [],
          demo: true,
        };
      });
    return [...candidates, ...demos];
  }, [savedApps, dataAvailable]);

  // Badge colour comes from the same saved value shown in the grid.
  const statusVariantFor = (
    m: MentorSearchRow,
  ): BadgeVariant => {
    if (!m.status) return "neutral";
    const sub = (
      Object.keys(
        FF_APPLICANT_STATUS_LABEL,
      ) as FFApplicantFacingStatus[]
    ).find((k) => FF_APPLICANT_STATUS_LABEL[k] === m.status);
    if (!m.demo && sub) return SUBMISSION_STATUS_VARIANT[sub];
    const legacy = (
      Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]
    ).find((k) => STATUS_LABEL[k] === m.status);
    return legacy ? STATUS_BADGE_VARIANT[legacy] : "neutral";
  };

  const results = useMemo(
    () => filterMentors(pool, applied, colFilters),
    [pool, applied, colFilters],
  );
  const sortedResults = useMemo(
    () => sortMentors(results, sortKey, sortDir),
    [results, sortKey, sortDir],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(sortedResults.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageRows = sortedResults.slice(
    pageStart,
    pageStart + PAGE_SIZE,
  );

  const matchCount = results.length;
  const filteredOutCount = pool.length - matchCount;

  const optionsByColumn = useMemo(() => {
    const out = {} as Record<MentorColumnKey, string[]>;
    for (const { key } of COLUMNS)
      out[key] = columnFilterOptions(pool, key);
    return out;
  }, [pool]);

  // Filters apply as you type/select: every change updates the entered
  // values and the applied criteria together, and returns to page 1.
  const updateCriteria = (
    patch: Partial<MentorSearchCriteria>,
  ) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    setApplied(normalizeCriteria(next));
    setPage(1);
  };

  const handleSearch = (e: FormEvent) => e.preventDefault();

  const clearAll = () => {
    setDraft(BLANK_CRITERIA);
    setApplied(BLANK_CRITERIA);
    setColFilters({});
    setPage(1);
  };

  const setColumnFilter = (
    key: MentorColumnKey,
    v: string[],
  ) => {
    setColFilters((f) => ({ ...f, [key]: v }));
    setPage(1);
  };

  const handleSort = (key: MentorColumnKey) => {
    setPage(1);
    if (sortKey === key)
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Every matching mentor across all pages, in the displayed sort order,
  // from the applied search + column filters.
  const exportResults = () => {
    const date = localTodayIso();
    exportToCSV(
      `mentor-search-results-${date}.csv`,
      [...COLUMNS.map((c) => c.label), "Email Address"],
      sortedResults.map((m) => [
        ...COLUMNS.map((c) => cellText(m, c.key)),
        m.email,
      ]),
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
        title="Mentor Search"
        actions={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => window.location.reload()}
                aria-label="Refresh mentor search"
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
                disabled={matchCount === 0}
                title={
                  matchCount === 0
                    ? "No mentors to export"
                    : undefined
                }
                aria-label="Export mentor search results"
              >
                <Download /> Export
              </Button>
            }
            live
            title={
              dataAvailable
                ? `${matchCount} ${matchCount === 1 ? "mentor" : "mentors"} found · ${filteredOutCount} filtered out`
                : "Mentor Search"
            }
          >
            <form
              onSubmit={handleSearch}
              className="flex flex-wrap items-center justify-end gap-2"
              aria-label="Mentor search criteria"
            >
              <MultiSelect
                id="mentor-search-subprogram"
                aria-label="Sub-Program"
                display="inline"
                className="w-52"
                placeholder="All Sub-Programs"
                options={SUB_PROGRAMMES}
                getOptionLabel={(v) =>
                  SUB_PROGRAMME_LABEL[v as FFSubProgramme] ?? v
                }
                value={draft.subProgrammes}
                onValueChange={(v) =>
                  updateCriteria({
                    subProgrammes: v as FFSubProgramme[],
                  })
                }
              />
              {(
                [
                  ["firstName", "First Name", "w-36"],
                  ["lastName", "Last Name", "w-36"],
                  ["email", "Email Address", "w-56"],
                ] as const
              ).map(([field, label, width]) => (
                <Input
                  key={field}
                  id={`mentor-search-${field}`}
                  size="md"
                  aria-label={label}
                  placeholder={label}
                  value={draft[field]}
                  onChange={(e) =>
                    updateCriteria({ [field]: e.target.value })
                  }
                  className={width}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={clearAll}
              >
                <X /> Clear All
              </Button>
            </form>
          </TableToolbar>

          {!dataAvailable ? (
            <div className="py-16">
              <EmptyState
                icon={Search}
                title="Mentor information can't be loaded right now."
                description="Search results aren't available until it can be read."
              />
            </div>
          ) : pool.length === 0 ? (
            <div className="py-16">
              <EmptyState
                icon={Search}
                title="No mentors are in the directory yet."
                description="Mentors appear here once their application is Approved and they are at Ready for Match, Matched or Active and aren't inactive."
              />
            </div>
          ) : (
            <>
              {/* The Table container is the single scrolling area: both
                  axes scroll here so the header stays sticky and every
                  column is reachable. */}
              <Table
                containerClassName="max-h-[calc(100vh-430px)] min-h-[280px] overflow-auto"
                className="min-w-[1850px]"
              >
                <TableHeader>
                  <TableRow hoverable={false}>
                    {COLUMNS.map(({ key, label }) => {
                      const active = sortKey === key;
                      const SortIcon = !active
                        ? ChevronsUpDown
                        : sortDir === "asc"
                          ? ChevronUp
                          : ChevronDown;
                      const selected = colFilters[key] ?? [];
                      const known = optionsByColumn[key];
                      return (
                        <TableHead
                          key={key}
                          variant="slds"
                          size="md"
                          active={active}
                          className="sticky top-0 z-10"
                          aria-sort={
                            active
                              ? sortDir === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                        >
                          <div className="inline-flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="inline"
                              onClick={() => handleSort(key)}
                              aria-label={`Sort by ${label}`}
                            >
                              {label}
                              <SortIcon
                                className={
                                  active
                                    ? "size-3"
                                    : "size-3 opacity-40"
                                }
                              />
                            </Button>
                            <ColumnFilter
                              label={label}
                              options={[
                                ...known,
                                // Keep a selection removable even if the
                                // directory no longer has that value.
                                ...selected.filter(
                                  (v) => !known.includes(v),
                                ),
                              ]}
                              value={selected}
                              onValueChange={(v) =>
                                setColumnFilter(key, v)
                              }
                              getOptionLabel={
                                key === "subProgramme"
                                  ? (v) =>
                                      SUB_PROGRAMME_LABEL[
                                        v as FFSubProgramme
                                      ] ?? v
                                  : undefined
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
                            <div className="flex items-center gap-[var(--app-control-gap)]">
                              <Button
                                asChild
                                variant="link-info"
                                size="inline"
                              >
                                <Link
                                  to={`/friends-first-mentor/${m.id}`}
                                  state={{
                                    backLabel: "Mentor Search",
                                  }}
                                  onClick={rememberSearch}
                                >
                                  {m.name}
                                </Link>
                              </Button>
                              {m.demo && (
                                <Badge variant="neutral">
                                  Demo
                                </Badge>
                              )}
                              {m.readinessWarnings.length >
                                0 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="soft-warning"
                                      size="icon-xs"
                                      aria-label={`Readiness warning for ${m.name}: ${m.readinessWarnings.join(" ")}`}
                                    >
                                      <AlertTriangle />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p
                                      style={{
                                        fontWeight:
                                          "var(--font-weight-bold)",
                                      }}
                                    >
                                      Readiness requirements not
                                      met
                                    </p>
                                    <ul className="list-disc pl-4">
                                      {m.readinessWarnings.map(
                                        (w) => (
                                          <li key={w}>{w}</li>
                                        ),
                                      )}
                                    </ul>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            <span className="slds-text-3 block text-[var(--slds-g-color-text-weak)]">
                              {m.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {m.subProgrammes.map((p) => (
                            <Badge
                              key={p}
                              variant={
                                SUB_PROGRAMME_BADGE_VARIANT[p]
                              }
                            >
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {m.status ? (
                          <Badge variant={statusVariantFor(m)}>
                            {m.status}
                          </Badge>
                        ) : (
                          <span className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                            {EMPTY}
                          </span>
                        )}
                      </TableCell>
                      <PlainCell value={m.accountCreatedDate} />
                      <PlainCell value={m.startDate} />
                      <PlainCell value={m.coordinator} />
                      <PlainCell value={m.location} />
                      <PlainCell
                        value={
                          m.age === null ? "" : String(m.age)
                        }
                      />
                      <PlainCell
                        value={m.interests.join(", ")}
                        wrap
                      />
                      <PlainCell value={m.ethnicity} />
                      <PlainCell value={m.religion} />
                      <PlainCell value={m.promotionDate} />
                      <TableCell>
                        {m.pipelineStage ? (
                          <Badge
                            variant={
                              FF_MENTOR_STAGE_BADGE_VARIANT[
                                m.pipelineStage as FFMentorStage
                              ] ?? "neutral"
                            }
                          >
                            {m.pipelineStage}
                          </Badge>
                        ) : (
                          <span className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                            {EMPTY}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {pageRows.length === 0 && (
                    <TableRow hoverable={false}>
                      <TableCell colSpan={COLUMNS.length}>
                        <div className="sticky left-0 w-full max-w-[min(100vw,900px)] py-16">
                          <EmptyState
                            icon={Search}
                            title="No mentors found"
                            description="No mentors match your filters. Try adjusting or clearing filters."
                            actionLabel="Clear All"
                            onAction={clearAll}
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
                  total={sortedResults.length}
                  countLabel="records"
                  currentPage={safePage}
                  totalPages={totalPages}
                  onPrevious={() => setPage(safePage - 1)}
                  onNext={() => setPage(safePage + 1)}
                />
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

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