import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { BookOpen, RefreshCw, Search, X } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { EmptyState } from "../ui/empty-state";
import { Input } from "../ui/input";
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
import { PaginationInfo } from "../ui/pagination";
import { TablePaginationBar } from "../ui/table-toolbar";
import {
  APPLICATION_STAGE_BADGE_VARIANT,
  APPLICATION_STAGES,
  MOCK_TUTOR_APPLICANTS,
} from "../../data/mockTutorApplicantData";
import {
  availableDays,
  useTutorRecords,
} from "../../data/tutorApplicantStore";

const PAGE_SIZE = 5;

// Campus filter options — narrower than TUTOR_APPLICANT_CAMPUSES (no
// Other/Offsite), same as Tutor Search's campus filter.
const FILTER_CAMPUSES = [
  "West Loop Campus",
  "Walsh Campus",
] as const;

export function TutorApplications() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<string>("all");
  const [campus, setCampus] = useState<string>("all");
  const [page, setPage] = useState(1);
  // Stage and availability come from the saved record state, so edits made
  // on the applicant record show here immediately.
  const records = useTutorRecords();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_TUTOR_APPLICANTS.filter((a) => {
      const matchQ =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q);
      const matchStage =
        stage === "all" || records[a.id].stage === stage;
      const matchCampus =
        campus === "all" || a.campus === campus;
      return matchQ && matchStage && matchCampus;
    });
  }, [search, stage, campus, records]);

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
    search !== "" || stage !== "all" || campus !== "all";

  const clearFilters = () => {
    setSearch("");
    setStage("all");
    setCampus("all");
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
              <BookOpen className="h-6 w-6" />
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
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pb-6 pt-4">
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
                "var(--slds-g-color-background-alt)",
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
                  value={campus}
                  onValueChange={withPageReset(setCampus)}
                >
                  <SelectTrigger
                    className="h-9 w-[150px] text-[13px]"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                    aria-label="Campus"
                  >
                    <SelectValue placeholder="All Campuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Campuses
                    </SelectItem>
                    {FILTER_CAMPUSES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={stage}
                  onValueChange={withPageReset(setStage)}
                >
                  <SelectTrigger
                    className="h-9 w-[220px] text-[13px]"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderRadius:
                        "var(--slds-c-input-radius-border)",
                    }}
                    aria-label="Stage"
                  >
                    <SelectValue placeholder="All Stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Stages
                    </SelectItem>
                    {APPLICATION_STAGES.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
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
                      aria-label="Clear search"
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
                  title="No applications match your filters."
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
                    style={{ minWidth: "900px" }}
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
                          "APPLICATION ID",
                          "VOLUNTEER",
                          "CAMPUS",
                          "AVAILABILITY",
                          "SUBMITTED DATE",
                          "STAGE",
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
                      {pageRows.map((a) => (
                        <TableRow
                          key={a.id}
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
                            {a.id}
                          </TableCell>
                          <TableCell
                            className="px-2 py-3 text-sm font-medium whitespace-nowrap"
                            style={{
                              color: "var(--color-link-blue)",
                            }}
                          >
                            <button
                              onClick={() =>
                                navigate(
                                  `/tutor-applicant/${a.id}`,
                                )
                              }
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
                              {a.name}
                            </button>
                          </TableCell>
                          <TableCell
                            className="px-2 py-3 text-sm whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {a.campus}
                          </TableCell>
                          <TableCell
                            className="px-2 py-3 text-sm whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {availableDays(
                              records[a.id].availability,
                            ).join(", ") || "—"}
                          </TableCell>
                          <TableCell
                            className="px-2 py-3 text-sm whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {a.submitted}
                          </TableCell>
                          <TableCell className="px-2 py-3">
                            <Badge
                              variant={
                                APPLICATION_STAGE_BADGE_VARIANT[
                                  records[a.id].stage
                                ]
                              }
                            >
                              {records[a.id].stage}
                            </Badge>
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
