import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Download,
  Heart,
  RefreshCw,
  Search,
  X,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { EmptyState } from "../ui/empty-state";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { PaginationInfo } from "../ui/pagination";
import { printMentorProfile } from "../../lib/printMentorProfile";
import { TablePaginationBar } from "../ui/table-toolbar";
import {
  SUB_PROGRAMMES,
  SUB_PROGRAMME_BADGE_VARIANT,
  type BadgeVariant,
  type FFSubProgramme,
} from "../../data/mockFriendsFirstData";
import {
  FF_APPLICANT_STATUS_LABEL,
  FF_SUB_PROGRAM_NAME,
  type FFApplicantFacingStatus,
} from "../../data/ffMentorApplication";
import {
  coordinatorName,
  getFFMentorApplication,
  getFFMentorApplicationStaff,
  useFFStaffApplications,
} from "../../data/ffMentorApplicationStore";

/** One list row — a Mentor Application, opened by its own id. */
interface ApplicationRow {
  id: string;
  name: string;
  subProgrammes: FFSubProgramme[];
  coordinator: string;
  submitted: string;
  /** Status filter key: "submission:<saved applicant status>". */
  statusKey: string;
  stageLabel: string;
  stageVariant: BadgeVariant;
}

/** Filters and page, kept on this list's history entry while a record is open. */
interface ListState {
  search: string;
  subProgramme: string;
  status: string;
  page: number;
}

const PAGE_SIZE = 12;

export function FriendsFirstApplications() {
  const navigate = useNavigate();
  const location = useLocation();
  // Coming back from a record restores the list as it was left.
  const restored = (
    location.state as {
      listState?: ListState;
    } | null
  )?.listState;
  const [search, setSearch] = useState(restored?.search ?? "");
  const [subProgramme, setSubProgramme] = useState<string>(
    restored?.subProgramme ?? "all",
  );
  const [status, setStatus] = useState<string>(
    restored?.status ?? "all",
  );
  const [page, setPage] = useState(restored?.page ?? 1);

  const openRecord = (id: string) => {
    const listState: ListState = {
      search,
      subProgramme,
      status,
      page,
    };
    navigate(location.pathname, {
      replace: true,
      state: { listState },
    });
    navigate(`/friends-first-mentor/${id}`, {
      state: { backLabel: "Applications" },
    });
  };

  const downloadMentorProfile = (id: string) => {
    const found = getFFMentorApplication(id);
    if (found.status === "found")
      printMentorProfile(found.application);
  };

  const storeApps = useFFStaffApplications();
  const rows = useMemo<ApplicationRow[]>(
    () =>
      storeApps.map((a): ApplicationRow => {
        const staff = getFFMentorApplicationStaff(
          a.applicationId,
        );
        const o = a.answers.overview;
        return {
          id: a.applicationId,
          name:
            [o.firstName, o.lastName]
              .filter(Boolean)
              .join(" ") || "—",
          subProgrammes: a.subPrograms.map(
            (p) => FF_SUB_PROGRAM_NAME[p],
          ),
          coordinator:
            coordinatorName(staff.coordinatorId) ??
            "Not assigned",
          submitted: a.submittedAt || "—",
          statusKey: `submission:${a.applicantStatus}`,
          stageLabel: staff.stage ?? "Not set",
          stageVariant: "neutral",
        };
      }),
    [storeApps],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((m) => {
      const matchQ =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q);
      const matchSub =
        subProgramme === "all" ||
        m.subProgrammes.includes(
          subProgramme as FFSubProgramme,
        );
      const matchStatus =
        status === "all" || m.statusKey === status;
      return matchQ && matchSub && matchStatus;
    });
  }, [rows, search, subProgramme, status]);

  // Submission statuses actually saved on store applications, in VMS order.
  const submissionStatuses = useMemo(
    () =>
      (
        Object.keys(
          FF_APPLICANT_STATUS_LABEL,
        ) as FFApplicantFacingStatus[]
      ).filter((st) =>
        storeApps.some((a) => a.applicantStatus === st),
      ),
    [storeApps],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(
    pageStart,
    pageStart + PAGE_SIZE,
  );

  // Any change to search/filter criteria returns to page 1 so the user is
  // never left on a page past the end of the new result set.
  const withPageReset =
    (set: (value: string) => void) => (value: string) => {
      set(value);
      setPage(1);
    };

  const hasFilters =
    search !== "" || subProgramme !== "all" || status !== "all";

  const clearFilters = () => {
    setSearch("");
    setSubProgramme("all");
    setStatus("all");
    setPage(1);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: "var(--slds-g-color-background-alt-2)",
      }}
    >
      {/* ── Page Header ── */}
      <div
        className="px-4 sm:px-6 py-4"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-alt-2)",
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
          boxShadow: "var(--slds-g-shadow-1)",
        }}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 flex items-center justify-center text-white"
              style={{
                borderRadius:
                  "var(--slds-c-card-radius-border)",
                backgroundColor: "var(--color-brand-primary)",
                boxShadow: "var(--slds-g-shadow-1)",
              }}
            >
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <div
                className="text-xs font-medium uppercase tracking-wide"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Dashboard
              </div>
              <h1
                className="text-2xl font-medium tracking-tight"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Applications
              </h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            style={{
              backgroundColor: "white",
              borderRadius: "50%",
            }}
            onClick={() => window.location.reload()}
            aria-label="Refresh applications"
            title="Refresh"
          >
            <RefreshCw
              className="h-4 w-4"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            />
          </Button>
        </div>
      </div>

      {/* ── Main content ── */}
      {/* Extra bottom padding clears the fixed 40px UtilityBar (To Do
          List / History / Notes) so the last content is never hidden
          behind it — same approach as Tutor Matches. */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pb-16 pt-4">
        <Card
          className="w-full shadow-sm overflow-hidden !gap-0"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: "12px",
          }}
        >
          <CardHeader
            className="px-6 !py-0"
            style={{
              backgroundColor:
                "var(--slds-g-color-background-brand-primary-lighter)",
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <div className="min-h-[50px] py-2.5 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <span
                  className="text-base font-bold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Volunteer Applications ({filtered.length})
                </span>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="h-9 px-3 rounded-full flex items-center gap-1.5 transition-colors"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      fontSize: "12px",
                      color: "var(--slds-g-color-text-default)",
                      cursor: "pointer",
                    }}
                  >
                    <X className="h-3 w-3" /> Clear Filters
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap py-2">
                <Select
                  value={subProgramme}
                  onValueChange={withPageReset(setSubProgramme)}
                >
                  <SelectTrigger
                    className="h-9 w-[170px] text-[13px]"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <SelectValue placeholder="Sub-Program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Sub-Programs
                    </SelectItem>
                    {SUB_PROGRAMMES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={status}
                  onValueChange={withPageReset(setStatus)}
                >
                  <SelectTrigger
                    className="h-9 w-[140px] text-[13px]"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Stages
                    </SelectItem>
                    {submissionStatuses.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>
                          Submission Status
                        </SelectLabel>
                        {submissionStatuses.map((s) => (
                          <SelectItem
                            key={s}
                            value={`submission:${s}`}
                          >
                            {FF_APPLICANT_STATUS_LABEL[s]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 z-10"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                  <Input
                    value={search}
                    onChange={(e) =>
                      withPageReset(setSearch)(e.target.value)
                    }
                    placeholder="Search"
                    className="pl-9 pr-9 h-9 w-44 text-[13px]"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                    aria-label="Search applications"
                  />
                  {search && (
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
                      onClick={() =>
                        withPageReset(setSearch)("")
                      }
                    >
                      <X
                        className="h-3 w-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="py-16">
                <EmptyState
                  icon={Search}
                  tone="neutral"
                  title="No applications match your filters"
                  description="Try adjusting your search or filters."
                  actionLabel={
                    hasFilters ? "Clear filters" : undefined
                  }
                  onAction={clearFilters}
                />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table
                    className="w-full"
                    style={{ minWidth: "1100px" }}
                  >
                    <TableHeader
                      className="sticky top-0 z-10"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                      }}
                    >
                      <TableRow
                        className="hover:bg-transparent"
                        style={{
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        {[
                          "APP ID",
                          "VOLUNTEER",
                          "SUB-PROGRAM",
                          "COORDINATOR",
                          "SUBMITTED",
                          "STAGE",
                          "ACTIONS",
                        ].map((h, i) => (
                          <TableHead
                            key={h}
                            className={`h-10 whitespace-nowrap${i === 0 ? " pl-6" : " px-2"}`}
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                              fontSize: 12,
                              fontWeight: 600,
                              letterSpacing: "0.04em",
                            }}
                          >
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pageRows.map((m) => (
                        <TableRow
                          key={m.id}
                          className="transition-colors h-[53px]"
                          style={{
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <TableCell
                            className="pl-6 pr-2 py-3 text-sm font-mono whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {m.id}
                          </TableCell>
                          <TableCell
                            className="px-2 py-3 text-sm font-medium whitespace-nowrap"
                            style={{
                              color: "var(--color-link-blue)",
                            }}
                          >
                            <button
                              onClick={() => openRecord(m.id)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }}
                              className="text-left font-medium hover:underline focus:outline-none focus:underline"
                              style={{
                                color: "var(--color-link-blue)",
                                background: "none",
                                border: "none",
                                padding: 0,
                                cursor: "pointer",
                                fontSize: "inherit",
                              }}
                            >
                              {m.name}
                            </button>
                          </TableCell>
                          <TableCell className="px-2 py-3">
                            <div className="flex flex-wrap gap-1">
                              {m.subProgrammes.map((sp) => (
                                <Badge
                                  key={sp}
                                  variant={
                                    SUB_PROGRAMME_BADGE_VARIANT[
                                      sp
                                    ]
                                  }
                                >
                                  {sp}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell
                            className="px-2 py-3 text-sm whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {m.coordinator}
                          </TableCell>
                          <TableCell
                            className="px-2 py-3 text-sm whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {m.submitted}
                          </TableCell>
                          <TableCell className="px-2 py-3">
                            <Badge variant={m.stageVariant}>
                              {m.stageLabel}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-2 py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                downloadMentorProfile(m.id)
                              }
                            >
                              <Download className="h-4 w-4" />
                              Download Mentor Profile
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div
                  className="flex items-center justify-between"
                  style={{
                    borderTop:
                      "1px solid var(--slds-g-color-border-base-1)",
                    padding: "12px 24px",
                  }}
                >
                  {totalPages > 1 ? (
                    <TablePaginationBar
                      className="w-full"
                      start={pageStart + 1}
                      end={pageStart + pageRows.length}
                      total={filtered.length}
                      countLabel="records"
                      currentPage={safePage}
                      totalPages={totalPages}
                      onPrevious={() => setPage(safePage - 1)}
                      onNext={() => setPage(safePage + 1)}
                    />
                  ) : (
                    <PaginationInfo
                      start={pageStart + 1}
                      end={pageStart + pageRows.length}
                      total={filtered.length}
                      label="records"
                    />
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
