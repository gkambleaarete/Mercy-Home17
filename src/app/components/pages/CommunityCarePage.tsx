// Community Care module landing page (Chunk 2): a read-only directory of the
// existing Constituents that are an Individual with the explicit
// "Community Care Member" role, in every status. It is not the full
// engaged-member population or a staff caseload: membership is never
// inferred from Community Needs, and nothing here creates or edits records.
// Data comes from the same sources the Constituents page reads
// (CONSTITUENTS, communityNeedsStore); names open /constituents/:id.

import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { BookUser, ListChecks, RefreshCw } from "@/app/lib/lucide-icons"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react"
import { Tabs, TabsContent } from "../ui/tabs"
import { TableToolbar } from "../ui/table-toolbar"
import { CommunityCareMemberPage } from "./CommunityCareMemberPage"
import { CommunityCareMyTasks } from "./CommunityCareMyTasks"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { OverflowList } from "../ui/overflow-list"
import { EmptyState } from "../ui/empty-state"
import { PaginationInfo, PaginationPageLabel } from "../ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { CONSTITUENTS, getConstituentStatus, hasRole } from "../../data/mockConstituents"
import { formatMdy } from "../../lib/dateFormat"
// Brings constituents created from Mentor Applications into CONSTITUENTS,
// exactly as the Constituents page does (side-effect import).
import "../../data/ffMentorApplicationStore"
import {
  distinctNeeds,
  useAllCommunityCare,
} from "../../data/communityNeedsStore"

const PAGE_SIZE = 12

// Mock: members with no active relationship AND no finalized Connection in
// the last 180 days (Imani Scott, Nia Washington) — shown as Engaged: No.
const NOT_ENGAGED_IDS = new Set([9408, 9406])

// Mock: each member has at least one active relationship with a Community
// Care Staff member, in one of these four relationship types.
const CC_STAFF_RELATIONSHIPS: [string, string][] = [
  ["Housing Coordinator", "Maya Patel"],
  ["Vocation Coach", "Jordan Ellis"],
  ["Care Manager", "Rachel Nguyen"],
  ["Therapist", "Dr. Samuel Brooks"],
]
// Shuffled leading relationship for page-1 members (index into
// CC_STAFF_RELATIONSHIPS: 0 Housing Coordinator, 1 Vocation Coach,
// 2 Care Manager, 3 Therapist).
const LEADING_RELATIONSHIP: Record<number, number> = {
  9402: 0, // Aaliyah Turner — Housing Coordinator
  9405: 3, // Devin Carter — Therapist
  9406: 1, // Nia Washington — Vocation Coach
  9409: 2, // Tyler Hughes — Care Manager
  9407: 0, // Ethan Price — Housing Coordinator
  9410: 3, // Grace Kim — Therapist
  1: 2, // Emily Johnson — Care Manager
  2: 1, // Michael Rodriguez — Vocation Coach
}
function activeRelationshipsFor(id: number): string[] {
  // Mock: roughly 1 in 4 members (plus the not-engaged ones) has no active
  // staff relationship.
  if (id % 4 === 0 || NOT_ENGAGED_IDS.has(id)) return []
  const start = LEADING_RELATIONSHIP[id] ?? id % CC_STAFF_RELATIONSHIPS.length
  const count = 1 + (id % 3) // 1–3 relationships
  return Array.from({ length: count }, (_, i) => {
    const [rel, staff] =
      CC_STAFF_RELATIONSHIPS[(start + i) % CC_STAFF_RELATIONSHIPS.length]
    return `${staff} (${rel})`
  })
}

// Mock: date of the member's most recent finalized Connection they attended.
// Members with no active relationship always have one within 180 days.
const TODAY = new Date(2026, 10, 6)
const DAY_MS = 24 * 60 * 60 * 1000
function lastFinalizedConnectionFor(id: number): Date {
  if (NOT_ENGAGED_IDS.has(id))
    return new Date(TODAY.getTime() - (200 + (id % 60)) * DAY_MS)
  return new Date(TODAY.getTime() - ((id * 37) % 170) * DAY_MS)
}

/** Community Care membership rule: at least one active relationship with
 *  Community Care Staff, OR (if none) at least one finalized Connection
 *  attended in the last 180 days. */
function qualifiesForCommunityCare(id: number): boolean {
  if (activeRelationshipsFor(id).length > 0) return true
  return TODAY.getTime() - lastFinalizedConnectionFor(id).getTime() <= 180 * DAY_MS
}
// Data Table cell spec from the Mercy Home design system.
const dsCell = "px-4 py-2.5 text-[13px]"
const dsMeta: React.CSSProperties = { color: "var(--slds-g-color-text-weak)" }
const COMMUNITY_CARE_MEMBER_ROLE = "Community Care Member"

export type CommunityCareView = "community-care" | "my-members" | "my-tasks"

export function CommunityCarePage({
  view = "community-care",
}: {
  view?: CommunityCareView
}) {
  const navigate = useNavigate()
  const communityCare = useAllCommunityCare()
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const needsFor = (id: number) => {
    const record = communityCare[String(id)]
    return record ? distinctNeeds(record) : []
  }

  // Read on every render (and the page remounts on each visit), so a member
  // created through the Constituents flow shows according to that source.
  const members = CONSTITUENTS.filter(
    (c) =>
      c.type === "Individual" &&
      // Community Care Member only, or Youth + Community Care Member.
      // Youth-only constituents are not listed.
      hasRole(c, COMMUNITY_CARE_MEMBER_ROLE),
  )
  const query = searchTerm.trim().toLowerCase()
  const results = query
    ? members.filter((c) => c.name.toLowerCase().includes(query))
    : members

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = results.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  useEffect(() => {
    setPage(1)
  }, [searchTerm])

  const title =
    view === "my-members" ? "My Members" : view === "my-tasks" ? "My Tasks" : "Community Care"
  const HeaderIcon =
    view === "my-tasks" ? ListChecks : view === "my-members" ? BookUser : Users

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "var(--slds-g-color-background-alt-2)" }}
    >
      {/* Page header — same pattern as Friends First Applications. */}
      <div
        className="px-4 sm:px-6 py-2"
        style={{
          backgroundColor: "var(--slds-g-color-background-alt-2)",
          borderBottom: "1px solid var(--slds-g-color-border-base-1)",
          boxShadow: "var(--slds-g-shadow-1)",
        }}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 flex items-center justify-center text-white"
              style={{
                borderRadius: "var(--slds-c-card-radius-border)",
                backgroundColor: "var(--color-brand-primary)",
                boxShadow: "var(--slds-g-shadow-1)",
              }}
            >
              <HeaderIcon className="h-5 w-5" />
            </div>
            <div>
              <div
                className="text-[11px] leading-[14px] font-medium uppercase tracking-wide"
                style={{ color: "var(--slds-g-color-text-weak)" }}
              >
                Dashboard
              </div>
              <h1
                className="text-[22px] leading-7 font-medium tracking-tight"
                style={{ color: "var(--slds-g-color-text-default)" }}
              >
                {title}
              </h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            style={{ backgroundColor: "white", borderRadius: "50%" }}
            onClick={() => window.location.reload()}
            aria-label={`Refresh ${title}`}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" style={{ color: "var(--slds-g-color-text-default)" }} />
          </Button>
        </div>
      </div>

      <div
        className={`flex-1 min-h-0 overflow-y-auto pb-16 ${
          view === "my-members" ? "!pb-0 overflow-hidden" : "px-4 sm:px-6 pt-4"
        }`}
      >
        <Tabs value={view} className={view === "my-members" ? "h-full" : undefined}>
          <TabsContent value="my-members" className="mt-0 h-full">
            {/* Same working sections, dialogs and filters as the member page. */}
            <CommunityCareMemberPage embedded memberId={9301} />
          </TabsContent>
          <TabsContent value="my-tasks" className="mt-0">
            <CommunityCareMyTasks />
          </TabsContent>
          <TabsContent value="community-care" className="mt-0">
            <section
              aria-label="Community Care Members"
              className="overflow-hidden"
              style={{
                border: "1px solid var(--slds-g-color-border-base-1)",
                borderRadius: "var(--slds-c-card-radius-border)",
                backgroundColor: "var(--slds-g-color-background-base)",
              }}
            >
              <TableToolbar live title="Community Care Members" count={results.length}>
                <div className="relative w-full sm:w-64">
                  <Search
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 z-10"
                    style={{ color: "var(--slds-g-color-text-weak)" }}
                  />
                  <Input
                    aria-label="Search members by name"
                    placeholder="Search by name"
                    className="pl-9 pr-9 h-9 w-full text-[13px]"
                    surface="base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 z-10"
                      style={{ color: "var(--slds-g-color-text-weak)" }}
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </TableToolbar>

              {results.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    icon={members.length === 0 ? Users : Search}
                    title={
                      members.length === 0
                        ? "No Community Care members found"
                        : "No members match your search"
                    }
                    description={
                      members.length === 0
                        ? "No constituents currently have the Community Care Member role."
                        : undefined
                    }
                    actionLabel={
                      members.length === 0 ? undefined : "Clear search"
                    }
                    actionVariant="outline"
                    onAction={
                      members.length === 0 ? undefined : () => setSearchTerm("")
                    }
                    className="py-6"
                  />
                </div>
              ) : (
                <>
                  {/* Mercy Home DS — Component Patterns > Data Table:
                      slds header (11px uppercase), 13px cells with
                      10px/16px padding, link cell #005EA2/500, meta cells
                      text-weak, bordered status badges. */}
                  <Table className="table-fixed" style={{ minWidth: "900px" }}>
                    <TableHeader>
                      <TableRow hoverable={false}>
                        {([
                          ["Name", "w-[16%]"],
                          ["Role", "w-[19%]"],
                          ["Title", "w-[18%]"],
                          ["Active Relationship", "w-[25%]"],
                          ["Engaged", "w-[10%]"],
                          ["Last Updated", "w-[12%]"],
                        ] as const).map(
                          ([h, w]) => (
                            <TableHead key={h} variant="slds" className={w}>
                              {h}
                            </TableHead>
                          ),
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pageRows.map((c) => {
                        return (
                          <TableRow
                            key={c.id}
                            className="border-[var(--slds-g-color-border-base-1)]"
                          >
                            <TableCell wrap className={dsCell}>
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/constituents/${c.id}`, {
                                    state: { backTo: "/community-care", backLabel: "Community Care" },
                                  })
                                }
                                className="text-left font-medium hover:underline focus-visible:underline outline-none"
                                style={{ color: "var(--color-link-blue)", fontSize: "inherit" }}
                                title={`View profile for ${c.name}`}
                              >
                                {c.name}
                              </button>
                            </TableCell>
                            <TableCell wrap className={dsCell} style={dsMeta}>
                              {[c.role, ...(c.additionalRoles ?? [])].join(", ")}
                            </TableCell>
                            <TableCell
                              className={`${dsCell} overflow-hidden`}
                              style={dsMeta}
                            >
                              <OverflowList items={needsFor(c.id)} label="Titles" />
                            </TableCell>
                            <TableCell
                              className={`${dsCell} overflow-hidden`}
                              style={dsMeta}
                            >
                              {activeRelationshipsFor(c.id).length > 0 ? (
                                <OverflowList
                                  items={activeRelationshipsFor(c.id)}
                                  label="Active Relationships"
                                />
                              ) : (
                                <span
                                  className="block truncate"
                                  title={
                                    qualifiesForCommunityCare(c.id)
                                      ? "No active relationship — engaged through a finalized Connection in the last 180 days"
                                      : "No active relationship and no finalized Connection in the last 180 days"
                                  }
                                >
                                  {qualifiesForCommunityCare(c.id)
                                    ? "Connection attended "
                                    : "None · last Connection "}
                                  {formatMdy(lastFinalizedConnectionFor(c.id))}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className={dsCell}>
                              {/* Engaged = has an active relationship, or a finalized Connection in the last 180 days. */}
                              <Badge
                                variant={qualifiesForCommunityCare(c.id) ? "success" : "error"}
                                bordered
                              >
                                {qualifiesForCommunityCare(c.id) ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell className={dsCell} style={dsMeta}>
                              {formatMdy(new Date(c.lastUpdated))}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-t border-border">
                    <PaginationInfo
                      start={(safePage - 1) * PAGE_SIZE + 1}
                      end={Math.min(safePage * PAGE_SIZE, results.length)}
                      total={results.length}
                      label="records"
                    />
                    {totalPages > 1 && (
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon-xs"
                          aria-label="Previous page"
                          disabled={safePage === 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          <ChevronLeft aria-hidden="true" />
                        </Button>
                        <PaginationPageLabel
                          current={safePage}
                          total={totalPages}
                        />
                        <Button
                          variant="outline"
                          size="icon-xs"
                          aria-label="Next page"
                          disabled={safePage === totalPages}
                          onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                          }
                        >
                          <ChevronRight aria-hidden="true" />
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
