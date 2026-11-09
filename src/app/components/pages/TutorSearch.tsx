import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import {
  BookOpen,
  Download,
  RefreshCw,
  Search,
  X,
} from "@/app/lib/lucide-icons"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader } from "../ui/card"
import { EmptyState } from "../ui/empty-state"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { PaginationInfo } from "../ui/pagination"
import { TablePaginationBar } from "../ui/table-toolbar"
import {
  MOCK_TUTOR_APPLICANTS,
  SEARCH_STATUS_BADGE_VARIANT,
  type TutorApplicant,
  type TutorSearchStatus,
} from "../../data/mockTutorApplicantData"
import {
  availableDays,
  getTutorRecord,
  referencesReceived,
  searchStatus,
  useTutorRecords,
} from "../../data/tutorApplicantStore"
import { localTodayIso } from "../../lib/dateFormat"

// Status, refs and availability are derived from the saved applicant record
// (tutorApplicantStore.ts) — the same data the record page edits.
function tutorStatus(t: TutorApplicant): TutorSearchStatus {
  return searchStatus(t, getTutorRecord(t)) ?? "Inactive"
}
function tutorRefs(t: TutorApplicant): string {
  const rec = getTutorRecord(t)
  return `${referencesReceived(rec)}/${rec.references.length}`
}
function tutorDays(t: TutorApplicant): string {
  return availableDays(getTutorRecord(t).availability).join(", ") || "—"
}

const escapeCsvValue = (value: unknown) => {
  const stringValue = String(value ?? "")
  return `"${stringValue.replace(/"/g, '""')}"`
}

// Exports exactly the rows currently shown in the table (post-filter),
// never the full MOCK_TUTOR_APPLICANTS list, so the CSV always matches
// what's on screen.
function exportTutorSearchResults(rows: TutorApplicant[]) {
  const header = [
    "Name",
    "Start Date",
    "Completed",
    "Refs",
    "Status",
    "Campus",
    "Availability",
  ]
  const lines = [
    header.map(escapeCsvValue).join(","),
    ...rows.map((t) =>
      [
        t.name,
        t.submitted,
        t.completedDate ?? "",
        tutorRefs(t),
        tutorStatus(t),
        t.campus,
        tutorDays(t),
      ]
        .map(escapeCsvValue)
        .join(","),
    ),
  ]
  const csv = lines.join("\r\n")

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  })
  const url = URL.createObjectURL(blob)
  const date = localTodayIso()
  const link = document.createElement("a")
  link.href = url
  link.download = `tutor-search-results-${date}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Campus filter list — narrower than TUTOR_APPLICANT_CAMPUSES (no
// Other/Offsite), since Search only ever shows West Loop / Walsh tutors.
const SEARCH_CAMPUSES = ["West Loop Campus", "Walsh Campus"] as const

// Tutor Search-only status list, in filter order.
const SEARCH_STATUSES: TutorSearchStatus[] = [
  "Available",
  "Matched",
  "Inactive",
]

interface SearchFilters {
  firstName: string
  lastName: string
  email: string
  status: string
  campus: string
}

const BLANK_FILTERS: SearchFilters = {
  firstName: "",
  lastName: "",
  email: "",
  status: "all",
  campus: "all",
}

const PAGE_SIZE = 12

export function TutorSearch() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<SearchFilters>(BLANK_FILTERS)
  const [page, setPage] = useState(1)

  // Any change to the filters returns to page 1 so the user is never left
  // on a page past the end of the new result set.
  const setF = <K extends keyof SearchFilters>(k: K, v: string) => {
    setFilters((f) => ({ ...f, [k]: v }))
    setPage(1)
  }

  const handleClear = () => {
    setFilters(BLANK_FILTERS)
    setPage(1)
  }

  const records = useTutorRecords()
  const results = useMemo(() => {
    // Only approved tutors (Ready for Match + all readiness items passed)
    // are listed; only "Available" ones can take a new match.
    return MOCK_TUTOR_APPLICANTS.filter((a) => {
      if (searchStatus(a, records[a.id]) === null) return false
      const [first, ...rest] = a.name.split(" ")
      const last = rest.join(" ")
      if (
        filters.firstName &&
        !first.toLowerCase().includes(filters.firstName.toLowerCase())
      )
        return false
      if (
        filters.lastName &&
        !last.toLowerCase().includes(filters.lastName.toLowerCase())
      )
        return false
      if (
        filters.email &&
        !a.email.toLowerCase().includes(filters.email.toLowerCase())
      )
        return false
      if (filters.status !== "all" && tutorStatus(a) !== filters.status)
        return false
      if (filters.campus !== "all" && a.campus !== filters.campus) return false
      return true
    })
  }, [filters, records])

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pageRows = results.slice(pageStart, pageStart + PAGE_SIZE)

  const activeFilterCount = Object.entries(filters).filter(
    ([, v]) => v !== "" && v !== "all",
  ).length

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
          backgroundColor: "var(--slds-g-color-background-alt-2)",
          borderBottom: "1px solid var(--slds-g-color-border-base-1)",
          boxShadow: "var(--slds-g-shadow-1)",
        }}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 flex items-center justify-center text-white"
              style={{
                borderRadius: "var(--slds-c-card-radius-border)",
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
                Tutor Search
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
            aria-label="Refresh tutor search"
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
            backgroundColor: "var(--slds-g-color-background-base)",
            border: "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: "12px",
          }}
        >
          <CardHeader separated className="px-6 !py-0">
            <div className="min-h-[50px] py-2.5 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <span
                  className="text-base font-bold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Tutor Search ({results.length})
                </span>
                <button
                  onClick={() => exportTutorSearchResults(results)}
                  aria-label="Export tutor search results"
                  className="h-9 px-3 rounded-full flex items-center gap-1.5 transition-colors hover:bg-white"
                  style={{
                    border: "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor: "var(--slds-g-color-background-base)",
                    fontSize: "12px",
                    color: "var(--slds-g-color-text-default)",
                    cursor: "pointer",
                  }}
                >
                  <Download className="h-3 w-3" /> Export
                </button>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClear}
                    className="h-9 px-3 rounded-full flex items-center gap-1.5 transition-colors"
                    style={{
                      border: "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor: "var(--slds-g-color-background-base)",
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
                  value={filters.status}
                  onValueChange={(v) => setF("status", v)}
                >
                  <SelectTrigger
                    className="h-9 w-[130px] text-[13px]"
                    style={{
                      border: "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor: "var(--slds-g-color-background-base)",
                      borderRadius: "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {SEARCH_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.campus}
                  onValueChange={(v) => setF("campus", v)}
                >
                  <SelectTrigger
                    className="h-9 w-[150px] text-[13px]"
                    style={{
                      border: "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor: "var(--slds-g-color-background-base)",
                      borderRadius: "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <SelectValue placeholder="Campus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campuses</SelectItem>
                    {SEARCH_CAMPUSES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  value={filters.firstName}
                  onChange={(e) => setF("firstName", e.target.value)}
                  placeholder="First name"
                  className="h-9 w-28 text-[13px]"
                  style={{
                    border: "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor: "var(--slds-g-color-background-base)",
                  }}
                />
                <Input
                  value={filters.lastName}
                  onChange={(e) => setF("lastName", e.target.value)}
                  placeholder="Last name"
                  className="h-9 w-28 text-[13px]"
                  style={{
                    border: "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor: "var(--slds-g-color-background-base)",
                  }}
                />
                <Input
                  value={filters.email}
                  onChange={(e) => setF("email", e.target.value)}
                  placeholder="Email"
                  className="h-9 w-36 text-[13px]"
                  style={{
                    border: "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor: "var(--slds-g-color-background-base)",
                  }}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {results.length === 0 ? (
              <div className="py-16">
                <EmptyState
                  icon={Search}
                  tone="neutral"
                  title="No tutors match your filters"
                  description="Try adjusting or clearing your filters."
                  actionLabel="Clear filters"
                  onAction={handleClear}
                />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table className="w-full" style={{ minWidth: "900px" }}>
                    <TableHeader
                      className="sticky top-0 z-10"
                      style={{
                        backgroundColor: "var(--slds-g-color-background-alt)",
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
                          "NAME",
                          "START DATE",
                          "COMPLETED",
                          "REFS",
                          "STATUS",
                          "CAMPUS",
                          "AVAILABILITY",
                        ].map((h, i) => (
                          <TableHead
                            key={h}
                            className={`h-10 whitespace-nowrap${
                              i === 0 ? " pl-6" : " px-2"
                            }`}
                            style={{
                              color: "var(--slds-g-color-text-weak)",
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
                      {pageRows.map((t) => (
                        <TableRow
                          key={t.id}
                          className="transition-colors h-[57px]"
                          style={{
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <TableCell className="pl-6 pr-2 py-3">
                            <div className="flex items-center gap-3">
                              <span
                                className="text-sm font-medium whitespace-nowrap"
                                style={{
                                  color: "var(--slds-g-color-text-default)",
                                }}
                              ></span>
                              <button
                                onClick={() =>
                                  navigate(`/tutor-applicant/${t.id}`)
                                }
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "transparent"
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "transparent"
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
                                {t.name}
                              </button>
                            </div>
                          </TableCell>
                          <TableCell
                            className="px-2 py-3 text-sm whitespace-nowrap"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {t.submitted}
                          </TableCell>
                          <TableCell
                            className="px-2 py-3 text-sm whitespace-nowrap"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {t.completedDate ?? "—"}
                          </TableCell>
                          <TableCell
                            className="px-2 py-3 text-sm whitespace-nowrap"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {tutorRefs(t)}
                          </TableCell>
                          <TableCell className="px-2 py-3">
                            <Badge
                              variant={
                                SEARCH_STATUS_BADGE_VARIANT[tutorStatus(t)]
                              }
                            >
                              {tutorStatus(t)}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className="px-2 py-3 text-sm whitespace-nowrap"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {t.campus}
                          </TableCell>
                          <TableCell
                            className="px-2 py-3 text-sm whitespace-nowrap"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {tutorDays(t)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div
                  className="flex items-center justify-between"
                  style={{
                    borderTop: "1px solid var(--slds-g-color-border-base-1)",
                    padding: "12px 24px",
                  }}
                >
                  {totalPages > 1 ? (
                    <TablePaginationBar
                      className="w-full"
                      start={pageStart + 1}
                      end={pageStart + pageRows.length}
                      total={results.length}
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
                      total={results.length}
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
  )
}
