// Community Care member landing (/community-care/:id), opened from a member
// name in the Community Care directory. Layout prototype from the supplied
// design: breadcrumb, left section list, three summary cards and a
// "My Members" table. PROTOTYPE: summary counts and the member rows are
// placeholder values, not computed from any store.

import { useRef, useState } from "react"
import { OverflowList } from "../ui/overflow-list"
import { useNavigate, useParams } from "react-router"
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronLeft,
  HelpCircle,
  XCircle,
  ChevronRight,
  Network,
  Plus,
  LayoutGrid,
  List,
  Mail,
  Phone,
  Search,
  User,
  Users,
} from "@/app/lib/lucide-icons"
import { toast } from "sonner@2.0.3"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"
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
import { PaginationInfo, PaginationPageLabel } from "../ui/pagination"
import { CONSTITUENTS, getConstituentStatus, hasRole } from "../../data/mockConstituents"
import { ContactMetaRow } from "../ui/contact-meta-row"
import { Badge } from "../ui/badge"
import { EmptyState } from "../ui/empty-state"
import {
  ConnectionFormDialog,
  type Connection,
} from "../admissions/ConnectionFormDialog"
import { RelationshipsSection } from "../admissions/RelationshipsSection"
import { TreatmentPlanningView } from "../admissions/TreatmentPlanningView"
import { DeterminationView } from "../admissions/DeterminationView"
import { LeadDetailView } from "../admissions/LeadDetailView"
import { constituentToLead } from "./ConstituentLeadDetailPage"
import { RestrictionsIndicator } from "../youth/RestrictionsIndicator"
import { useCampusRestrictions } from "../../data/campusRestrictionStore"
import { findYouthIdByName } from "../../data/mockYouthProgramData"
import {
  CommunityCareObservationSheet,
  type ObservationMember,
} from "./CommunityCareObservationSheet"
import {
  CommunityCareObservationsFeed,
  type FeedObservation,
} from "./CommunityCareObservationsFeed"
import { getDemoUserName } from "../../lib/demoIdentity"
import { useCommunityCareConnectionFilters } from "./useCommunityCareConnectionFilters"
import { CommunityCareFinancialSupport } from "./CommunityCareFinancialSupport"

const SECTIONS = [
  "My Members",
  "Observations",
  "Connections",
  "Relationships",
  "Plans",
  "Assessments",
  "Referral",
  "Financial Support",
]

const STATS = [
  {
    label: "MY MEMBERS",
    value: 33,
    icon: Users,
    bg: "#dbeafe",
    fg: "#2563eb",
  },
  {
    label: "UPCOMING CONNECTION",
    value: 7,
    icon: Network,
    bg: "#f3e8ff",
    fg: "#9333ea",
  },
  {
    label: "UPCOMING EVENTS",
    value: 1,
    icon: CalendarDays,
    bg: "#fef3c7",
    fg: "#d97706",
  },
]

// My Members: the Community Care Staff working with Community Care
// members, with their relationship role. Names are plain text (no profile
// link) for now.
export const MEMBER_ROWS = [
  { id: 1, name: "Maya Patel", relationship: "Housing Coordinator", program: "Self-Awareness", lastContact: "11/05/2026" },
  { id: 2, name: "Dr. Samuel Brooks", relationship: "Therapist", program: "Residential Treatment", lastContact: "11/02/2026" },
  { id: 3, name: "Jordan Ellis", relationship: "Vocation Coach", program: "Day Treatment", lastContact: "10/30/2026" },
  { id: 4, name: "Rachel Nguyen", relationship: "Care Manager", program: "Family Support Services", lastContact: "10/27/2026" },
  { id: 5, name: "Carlos Mendoza", relationship: "Vocation Coach", program: "Bernardin", lastContact: "10/24/2026" },
  { id: 6, name: "Aisha Robinson", relationship: "Care Manager", program: "Seton", lastContact: "10/21/2026" },
  { id: 7, name: "Kevin O'Brien", relationship: "Housing Coordinator", program: "Couderc", lastContact: "10/18/2026" },
  { id: 8, name: "Dr. Lena Fischer", relationship: "Therapist", program: "Self-Awareness", lastContact: "10/15/2026" },
  { id: 9, name: "Tasha Coleman", relationship: "Vocation Coach", program: "Residential Treatment", lastContact: "10/12/2026" },
  { id: 10, name: "Brian Okafor", relationship: "Housing Coordinator", program: "Day Treatment", lastContact: "10/09/2026" },
  { id: 11, name: "Megan Walsh", relationship: "Vocation Coach", program: "Family Support Services", lastContact: "10/06/2026" },
  { id: 12, name: "Dr. Arjun Mehta", relationship: "Therapist", program: "Bernardin", lastContact: "10/03/2026" },
  { id: 13, name: "Lauren Diaz", relationship: "Housing Coordinator", program: "Seton", lastContact: "09/30/2026" },
  { id: 14, name: "Marcus Webb", relationship: "Vocation Coach", program: "Couderc", lastContact: "09/27/2026" },
  { id: 15, name: "Hannah Lindqvist", relationship: "Care Manager", program: "Self-Awareness", lastContact: "09/24/2026" },
  { id: 16, name: "Dr. Olivia Grant", relationship: "Therapist", program: "Residential Treatment", lastContact: "09/21/2026" },
  { id: 17, name: "Darnell Price", relationship: "Care Manager", program: "Day Treatment", lastContact: "09/18/2026" },
  { id: 18, name: "Sofia Castillo", relationship: "Vocation Coach", program: "Family Support Services", lastContact: "09/15/2026" },
  { id: 19, name: "Ryan Gallagher", relationship: "Housing Coordinator", program: "Bernardin", lastContact: "09/12/2026" },
  { id: 20, name: "Dr. Nadia Rahman", relationship: "Therapist", program: "Seton", lastContact: "09/09/2026" },
  { id: 21, name: "Erin McCarthy", relationship: "Care Manager", program: "Couderc", lastContact: "11/05/2026" },
  { id: 22, name: "Victor Alvarez", relationship: "Housing Coordinator", program: "Self-Awareness", lastContact: "11/02/2026" },
  { id: 23, name: "Jasmine Holt", relationship: "Vocation Coach", program: "Residential Treatment", lastContact: "10/30/2026" },
  { id: 24, name: "Dr. Peter Novak", relationship: "Therapist", program: "Day Treatment", lastContact: "10/27/2026" },
  { id: 25, name: "Monica Reyes", relationship: "Housing Coordinator", program: "Family Support Services", lastContact: "10/24/2026" },
  { id: 26, name: "Trevor Banks", relationship: "Care Manager", program: "Bernardin", lastContact: "10/21/2026" },
  { id: 27, name: "Alicia Romero", relationship: "Vocation Coach", program: "Seton", lastContact: "10/18/2026" },
  { id: 28, name: "Dr. Grace Chen", relationship: "Therapist", program: "Couderc", lastContact: "10/15/2026" },
  { id: 29, name: "Isaac Turner", relationship: "Vocation Coach", program: "Self-Awareness", lastContact: "10/12/2026" },
  { id: 30, name: "Bianca Morales", relationship: "Care Manager", program: "Residential Treatment", lastContact: "10/09/2026" },
  { id: 31, name: "Owen Fitzgerald", relationship: "Housing Coordinator", program: "Day Treatment", lastContact: "10/06/2026" },
  { id: 32, name: "Dr. Keisha Barnes", relationship: "Therapist", program: "Family Support Services", lastContact: "10/03/2026" },
  { id: 33, name: "Natalie Brooks", relationship: "Care Manager", program: "Bernardin", lastContact: "09/30/2026" },
].map((r) => ({ ...r, roles: ["Community Care Staff"] as string[], assigned: "You" }))
const PAGE_SIZE = 12

// MOCK connections (prototype only, not real records). Dates are relative
// to today: past ones Completed/Cancelled, upcoming ones Scheduled.
export function mockConnections(pageMember: string): Connection[] {
  const at = (offset: number) => {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`
  }
  const rows: [number, string, string, string, string, string, string][] = [
    [
      3,
      "Community Care Event",
      "10:00 AM",
      "12:00 PM",
      "Scheduled",
      "DePalmaGarden",
      "Maya Patel, Dr. Samuel Brooks, Jordan Ellis",
    ],
    [
      1,
      "Community Care Contact",
      "2:00 PM",
      "2:30 PM",
      "Scheduled",
      "Conference Room - Community Care Satellite Office",
      "Rachel Nguyen",
    ],
    [
      0,
      "Community Care Drop-In",
      "11:00 AM",
      "11:45 AM",
      "Completed",
      "Conference Room - Community Care Satellite Office",
      "Carlos Mendoza",
    ],
    [
      -2,
      "Community Care Individual Therapy Session",
      "3:00 PM",
      "4:00 PM",
      "Completed",
      "Conference Room - Daley Home Therapy Room",
      "Aisha Robinson",
    ],
    [
      -4,
      "Community Care Family Therapy Session",
      "5:30 PM",
      "6:30 PM",
      "Cancelled",
      "Conference Room - Daley Home Therapy Room",
      "Kevin O'Brien",
    ],
    [
      -6,
      "Community Care File Request",
      "9:00 AM",
      "9:20 AM",
      "Completed",
      "",
      "Dr. Lena Fischer",
    ],
    [
      -9,
      "Post-Transition Contact",
      "1:00 PM",
      "1:30 PM",
      "Completed",
      "",
      "Tasha Coleman",
    ],
    [
      -15,
      "Community Care Group Therapy Session",
      "4:00 PM",
      "5:30 PM",
      "Completed",
      "Conference Room - Daley Home Therapy Room",
      "Brian Okafor, Megan Walsh, Dr. Arjun Mehta, Lauren Diaz",
    ],
  ]
  return rows.map(
    ([offset, type, startTime, endTime, status, location, names], i) =>
      ({
        id: `mock-cc-${i + 1}`,
        type,
        status: status as Connection["status"],
        startDate: at(offset),
        endDate: at(offset),
        startTime,
        endTime,
        attended: status === "Completed",
        participants: names,
        programs: "",
        homeVisit: false,
        location,
        memberName: names,
      }) as Connection & { memberName: string },
  )
}

// MOCK observations (prototype only, not real records). Dates are relative
// to today so every feed filter has entries. Some are by other staff
// ("Created by Me" differs from "All"); two are about this page's member
// ("Created for Me").
function mockObservations(me: string, pageMember: string): FeedObservation[] {
  const at = (daysAgo: number) => {
    const d = new Date()
    d.setDate(d.getDate() - daysAgo)
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`
  }
  const rows: [number, string, string, string, string, string[], string][] = [
    [
      0,
      "9:15 AM",
      me,
      "Aaliyah Turner",
      "Belonging",
      ["Peer Interaction", "Communication"],
      "Joined the group check-in and helped a newer member find a seat.",
    ],
    [
      0,
      "2:40 PM",
      "Marcus Lee",
      "Devin Carter",
      "Socio-Emotional Wellness",
      ["Regulation/Bounce Back"],
      "Was frustrated after a missed bus but calmed down and rescheduled.",
    ],
    [
      1,
      "11:00 AM",
      me,
      pageMember,
      "Self-Empowerment",
      ["Education/Career"],
      "Asked for help updating a resume for a part-time role.",
    ],
    [
      2,
      "4:05 PM",
      "Dana Kim",
      "Marcus Bell",
      "Navigation",
      ["Timeliness/Attendance"],
      "Arrived on time for the third session in a row.",
    ],
    [3, "10:30 AM", me, "Sofia Ramirez", "Belonging", ["Adult Interaction"], ""],
    [
      5,
      "1:20 PM",
      "Priya Shah",
      "Jaylen Brooks",
      "Navigation",
      ["Problem Solving", "Organization"],
      "Worked out a weekly schedule for appointments and work shifts.",
    ],
    [
      6,
      "3:45 PM",
      me,
      "Nia Washington",
      "Socio-Emotional Wellness",
      ["Healthy Boundaries"],
      "Talked through setting limits with a roommate.",
    ],
    [
      9,
      "9:50 AM",
      "Marcus Lee",
      pageMember,
      "Navigation",
      ["Daily Living"],
      "Set up a budget for groceries and transit.",
    ],
    [
      12,
      "12:10 PM",
      me,
      "Imani Scott",
      "Self-Empowerment",
      ["Transitions"],
      "Shared plans to move into a new apartment next month.",
    ],
    [
      18,
      "5:00 PM",
      "Dana Kim",
      "Tyler Hughes",
      "Belonging",
      ["Communication"],
      "Led part of the community dinner conversation.",
    ],
    [
      24,
      "10:15 AM",
      me,
      "Ethan Price",
      "Socio-Emotional Wellness",
      ["Hygiene/Cleanliness", "Daily Living"],
      "",
    ],
    [
      40,
      "2:30 PM",
      "Priya Shah",
      "Pepe the Prawn",
      "Self-Empowerment",
      ["Other Skill"],
      "Completed a food handler certificate.",
    ],
  ]
  return rows.map(
    // "Observation for" names come from My Members (Community Care Members).
    ([days, time, author, , outcomeDomain, areas, comments], i) => ({
      memberId: 9000 + i,
      date: at(days),
      time,
      outcomeDomain,
      areas,
      comments,
      savedAt: new Date().toISOString(),
      author,
      memberName: MEMBER_ROWS[i % MEMBER_ROWS.length].name,
    }),
  )
}

/** "18:07" -> "6:07 PM"; 12-hour values pass through unchanged. */
export function to12h(t: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t ?? "")
  if (!m) return t ?? ""
  const h = Number(m[1])
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? "AM" : "PM"}`
}

// Connection types offered from this page's New Connection dialog.
// "Community Care File Request" keeps its stored value (its Details fields
// depend on it) and is displayed as "File Request".
export const COMMUNITY_CARE_CONNECTION_TYPES = [
  "Community Care Contact",
  "Community Care Event",
  "Community Care Drop-In",
  "Community Care Individual Therapy Session",
  "Community Care Family Therapy Session",
  "Community Care File Request",
  "Post-Transition Contact",
  "Community Care Group Therapy Session",
]

const card = {
  border: "1px solid var(--slds-g-color-border-base-1)",
  borderRadius: "var(--slds-c-card-radius-border)",
  backgroundColor: "var(--slds-g-color-background-base)",
}

/** "A, B" → "A (Role), B (Role)" using each My Members relationship. */
function withRelationships(names: string): string {
  if (!names) return ""
  return names
    .split(", ")
    .map((n) => {
      if (/\)$/.test(n)) return n
      const row = MEMBER_ROWS.find((r) => r.name === n)
      return row ? `${n} (${row.relationship})` : n
    })
    .join(", ")
}

// Session-only store (prototype): page member id → connections.
const connectionCache = new Map<string, Connection[]>()

// Session-only store (prototype): page member id → observations.
const observationCache = new Map<string, FeedObservation[]>()

export function CommunityCareMemberPage({
  embedded = false,
  memberId,
}: {
  /** Rendered inside the Community Care "My Members" tab: no member header
   *  and no summary cards; the section list sits flush. */
  embedded?: boolean
  memberId?: number
} = {}) {
  const navigate = useNavigate()
  const params = useParams()
  const id = memberId != null ? String(memberId) : params.id
  const member = CONSTITUENTS.find(
    (c) =>
      String(c.id) === id &&
      c.type === "Individual" &&
      hasRole(c, "Community Care Member"),
  )
  const restrictions = useCampusRestrictions(
    member ? String(member.id) : undefined,
  )
  const status = member ? getConstituentStatus(member) : null
  const statusCfg =
    status === "Active"
      ? { dot: "#2e7d32", bg: "#e8f5e9", text: "#1b5e20", border: "#a5d6a7" }
      : { dot: "#757575", bg: "#f5f5f5", text: "#424242", border: "#bdbdbd" }
  const contactItems = member
    ? [
        ...(member.phone ? [{ icon: Phone, label: member.phone }] : []),
        ...(member.email ? [{ icon: Mail, label: member.email }] : []),
      ]
    : []
  const [section, setSection] = useState(0)
  const [role, setRole] = useState("all")
  const [program, setProgram] = useState("all")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  type SortKey = "name" | "role" | "program" | "lastContact"
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortKey(key)
      setSortDir("asc")
    }
    setPage(1)
  }
  const sortHead = (key: SortKey, label: string, width: string) => {
    const active = sortKey === key
    return (
      <TableHead
        variant="slds"
        size="md"
        active={active}
        className={width}
        aria-sort={
          active ? (sortDir === "asc" ? "ascending" : "descending") : "none"
        }
      >
        <button
          type="button"
          onClick={() => handleSort(key)}
          className="inline-flex items-center gap-1 uppercase [font:inherit] [letter-spacing:inherit] outline-none focus-visible:underline"
        >
          {label}
          <ChevronDown
            aria-hidden="true"
            className={`h-3 w-3 ${
              active ? (sortDir === "asc" ? "rotate-180" : "") : "opacity-30"
            }`}
          />
        </button>
      </TableHead>
    )
  }
  const [view, setView] = useState<"list" | "card">("card")
  type MemberRow = typeof MEMBER_ROWS[number]
  // RSVP shown after each name: latest RSVP saved on a connection for this
  // member, else a sample value (prototype).
  type Rsvp = "Accept" | "Tentative" | "Decline" | "No Response"
  const rsvpFor = (r: MemberRow): Rsvp => {
    for (let i = connections.length - 1; i >= 0; i--) {
      const list = ((connections[i] as any).participantList ?? []) as {
        participant: string
        rsvp?: string
      }[]
      const hit = list.find(
        (p) =>
          p.rsvp &&
          (p.participant === r.name || p.participant.startsWith(`${r.name} (`)),
      )
      if (hit) return hit.rsvp as Rsvp
    }
    return (["Accept", "Tentative", "Decline", "No Response"] as const)[(r.id - 1) % 4]
  }
  // Community Care Event: RSVP counts (Accept / Tentative / Decline / No
  // Response) from the saved participants; sample split when none saved.
  const rsvpSummary = (c: Connection) => {
    const list = ((c as any).participantList ?? []) as {
      role?: string
      rsvp?: string
    }[]
    const invited = list.filter((p) => p.role !== "Organizer")
    const counts = { Accept: 0, Tentative: 0, Decline: 0, "No Response": 0 }
    if (invited.length) {
      for (const p of invited) {
        const k = (p.rsvp || "No Response") as keyof typeof counts
        counts[k] = (counts[k] ?? 0) + 1
      }
    } else {
      const n = Math.max(
        1,
        (c.participants || "").split(", ").filter(Boolean).length,
      )
      counts.Accept = Math.ceil(n * 0.6)
      counts.Tentative = Math.min(n - counts.Accept, 1)
      counts.Decline = Math.min(n - counts.Accept - counts.Tentative, 1)
      counts["No Response"] =
        n - counts.Accept - counts.Tentative - counts.Decline
    }
    const items = [
      { k: "Accept", Icon: CheckCircle2, color: "#2e844a" },
      { k: "Tentative", Icon: HelpCircle, color: "#706e6b" },
      { k: "Decline", Icon: XCircle, color: "#c23934" },
      { k: "No Response", Icon: Clock, color: "#d97706" },
    ] as const
    return (
      <span
        className="ml-1.5 inline-flex items-center gap-1.5 text-[11px] font-normal leading-none whitespace-nowrap align-middle"
        style={{ color: "var(--slds-g-color-text-weak)" }}
      >
        (RSVP
        {items.map(({ k, Icon, color }) => (
          <span key={k} className="inline-flex items-center gap-0.5" title={`${k}: ${counts[k]}`}>
            <Icon aria-hidden="true" className="h-3.5 w-3.5" fill={color} stroke="#ffffff" strokeWidth={2.5} />
            {counts[k]}
            <span className="sr-only">{k}</span>
          </span>
        ))}
        )
      </span>
    )
  }
  const rsvpIcon = (r: MemberRow) => {
    const v = rsvpFor(r)
    const cfg =
      v === "Accept"
        ? { Icon: CheckCircle2, color: "#2e844a", label: "RSVP: Accept" }
        : v === "Tentative"
          ? { Icon: HelpCircle, color: "#706e6b", label: "RSVP: Tentative" }
          : v === "Decline"
            ? { Icon: XCircle, color: "#c23934", label: "RSVP: Decline" }
            : { Icon: Clock, color: "#d97706", label: "RSVP: No Response" }
    return (
      <span
        className="inline-flex items-center gap-0.5 flex-shrink-0 text-[11px] leading-none"
        style={{ color: "var(--slds-g-color-text-weak)" }}
        title={cfg.label}
      >
        (RSVP
        {/* Filled icon: coloured circle, white glyph */}
        <cfg.Icon
          aria-hidden="true"
          className="h-3.5 w-3.5 ml-0.5"
          fill={cfg.color}
          stroke="#ffffff"
          strokeWidth={2.5}
        />
        <span className="sr-only">{v}</span>)
      </span>
    )
  }
  const memberName = (r: MemberRow) => (
    <span
      className="inline-flex items-center gap-1.5 min-w-0"
      style={{ color: "var(--slds-g-color-text-default)" }}
    >
      <span className="truncate">{r.name}</span>
    </span>
  )
  const memberActions = (r: MemberRow) => (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="rounded-full border-[#145F33] text-[#145F33]"
        onClick={() => {
          setViewingObservation(null)
          setAddingObservation(false)
          setObserving({
            id: r.id,
            name: r.name,
            program: r.program,
            profileId: profileIdFor(r.name),
          })
        }}
      >
        Observation
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full border-[#145F33] text-[#145F33]"
        onClick={() => {
          setEditingConnection(null)
          setConnectionFor(r)
        }}
      >
        Add Connection
      </Button>
    </div>
  )
  // New Connection: the shared Admissions Connection / Interaction dialog.
  // Saved connections live in page memory only (prototype).
  const [connectionFor, setConnectionFor] = useState<MemberRow | null>(null)
  // "Add Connection" in My Members: no preset member; members are picked in
  // the dialog's Members multi-select.
  const [groupConnectionOpen, setGroupConnectionOpen] = useState(false)
  // Connections table actions: view (read-only) / edit / delete.
  const [viewOnlyConn, setViewOnlyConn] = useState(false)
  const [deleteConnId, setDeleteConnId] = useState<string | null>(null)
  const openConnection = (c: Connection, readOnlyView: boolean) => {
    setViewOnlyConn(readOnlyView)
    setEditingConnection(c)
    setConnectionFor({
      id: -1,
      name: member?.name ?? "",
      roles: [],
      relationship: "",
      program: member?.program ?? "",
      assigned: "",
      lastContact: "",
    } as unknown as MemberRow)
  }
  // Add Connection opened from the Connections section (shows Members).
  const [connectionsTabAdd, setConnectionsTabAdd] = useState(false)
  const allConnectionNames = MEMBER_ROWS.map((r) => r.name)
  const [editingConnection, setEditingConnection] = useState<Connection | null>(
    null,
  )
  // Session cache per page member so added connections survive tab switches.
  const [connections, setConnectionsState] = useState<Connection[]>(
    () => connectionCache.get(id ?? "") ?? mockConnections(member?.name ?? ""),
  )
  const setConnections: typeof setConnectionsState = (next) =>
    setConnectionsState((prev) => {
      const value = typeof next === "function" ? next(prev) : next
      connectionCache.set(id ?? "", value)
      return value
    })
  // Summary cards: Community Care Events → Upcoming Events; every other
  // connection → Upcoming Connection.
  const eventCount = connections.filter(
    (c) => c.type === "Community Care Event",
  ).length
  const statValue = (label: string, fallback: number) =>
    label === "UPCOMING EVENTS"
      ? eventCount
      : label === "UPCOMING CONNECTION"
        ? connections.length - eventCount
        : fallback
  const connFilters = useCommunityCareConnectionFilters(connections, "ccm")
  // A ref, not state: the dialog asks for many ids in one pass and each
  // must be unique (they are the participant rows' keys).
  const nextParticipantId = useRef(1000)
  const getNextParticipantId = () => nextParticipantId.current++
  const [observing, setObserving] = useState<ObservationMember | null>(null)
  // Add Observation (Observations section): member chosen in the form.
  const [addingObservation, setAddingObservation] = useState(false)
  const [viewingObservation, setViewingObservation] =
    useState<FeedObservation | null>(null)
  // Kept in a session cache per page member so observations added from
  // My Members still show under Observations after switching tabs/pages.
  const [observations, setObservationsState] = useState<FeedObservation[]>(
    () =>
      observationCache.get(id ?? "") ??
      mockObservations(getDemoUserName(), member?.name ?? ""),
  )
  const setObservations: typeof setObservationsState = (next) =>
    setObservationsState((prev) => {
      const value = typeof next === "function" ? next(prev) : next
      observationCache.set(id ?? "", value)
      return value
    })
  const profileIdFor = (name: string) =>
    CONSTITUENTS.find((c) => c.name === name)?.id ?? findYouthIdByName(name)

  const rows = MEMBER_ROWS.filter(
    (r) =>
      (role === "all" || r.relationship === role) &&
      (program === "all" || r.program === program) &&
      r.name.toLowerCase().includes(query.trim().toLowerCase()),
  )
  const sortedRows = sortKey
    ? [...rows].sort((a, b) => {
        const v = (r: MemberRow) =>
          sortKey === "name"
            ? r.name
            : sortKey === "role"
              ? r.relationship
              : sortKey === "program"
                ? r.program
                : // MM/DD/YYYY -> YYYYMMDD so it compares chronologically
                  r.lastContact.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3$1$2")
        const c = v(a).localeCompare(v(b), undefined, { sensitivity: "base" })
        return sortDir === "asc" ? c : -c
      })
    : rows
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = sortedRows.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )
  const programs = Array.from(new Set(MEMBER_ROWS.map((r) => r.program))).sort()
  const roleOptions = Array.from(
    new Set(MEMBER_ROWS.map((r) => r.relationship)),
  ).sort()

  return (
    <div className="h-full flex flex-col">
      {!embedded && (
      <header
        className="px-6 py-4 space-y-3"
        style={{
          backgroundColor: "var(--slds-g-color-background-base)",
          borderBottom: "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[12px]"
        >
          <button
            type="button"
            onClick={() => navigate("/community-care")}
            className="hover:underline outline-none focus-visible:underline"
            style={{ color: "var(--color-link-blue)", fontSize: "inherit" }}
          >
            Community Care
          </button>
          <ChevronRight
            aria-hidden="true"
            className="h-3 w-3"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          />
          <span
            aria-current="page"
            className="font-medium"
            style={{ color: "var(--slds-g-color-text-default)" }}
          >
            {member?.name ?? "Member not found"}
          </span>
        </nav>
        {member && (
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="h-12 w-12 flex-shrink-0 rounded-full flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: "var(--color-brand-primary)" }}
            >
              <User className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1
                  className="text-[20px] font-bold"
                  style={{ color: "var(--slds-g-color-text-default)" }}
                >
                  {member.name}
                </h1>
                {restrictions && <RestrictionsIndicator read={restrictions} />}
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold leading-none"
                  style={{
                    backgroundColor: statusCfg.bg,
                    border: `1px solid ${statusCfg.border}`,
                    color: statusCfg.text,
                  }}
                  aria-label={`Status: ${status}`}
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: statusCfg.dot }}
                  />
                  {status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[13px]">
                <span
                  className="flex items-center gap-1.5 font-medium"
                  style={{ color: "var(--slds-g-color-text-default)" }}
                >
                  <User className="h-3.5 w-3.5" aria-hidden="true" />
                  {member.type}
                </span>
                <span
                  aria-hidden="true"
                  style={{ color: "var(--slds-g-color-text-weak)" }}
                >
                  •
                </span>
                <Badge variant="outline" className="rounded-full font-medium">
                  {member.role}
                </Badge>
                {contactItems.length > 0 && (
                  <>
                    <span
                      aria-hidden="true"
                      style={{ color: "var(--slds-g-color-text-weak)" }}
                    >
                      •
                    </span>
                    <ContactMetaRow
                      items={contactItems}
                      className="text-[13px]"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      )}

      <div className="flex-1 flex min-h-0">
        <aside
          className={`w-[208px] flex-shrink-0 overflow-y-auto ${embedded ? "p-0 pb-16" : "p-4 pb-16"}`}
          style={{
            backgroundColor: "var(--slds-g-color-background-base)",
            borderRight: "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <nav
            aria-label="Community Care member sections"
            className="space-y-1"
          >
            {SECTIONS.map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSection(i)}
                aria-current={section === i ? "page" : undefined}
                className={`w-full text-left px-3 py-2.5 text-[13px] ${embedded ? "rounded-none" : "rounded"} outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                  section === i
                    ? "bg-[#145F33] text-white font-medium"
                    : "text-[#080707] hover:bg-[#f3f3f3]"
                }`}
              >
                {label.trim()}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 overflow-y-auto p-6 pb-16">
          {!member ? (
            <p
              className="text-[13px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              No Community Care Member was found for this link.
            </p>
          ) : SECTIONS[section] === "Financial Support" ? (
            <CommunityCareFinancialSupport
              memberName={member.name}
              memberRole={member.role}
              memberOptions={MEMBER_ROWS.map((r) => `${r.name} (${r.relationship})`)}
            />
          ) : SECTIONS[section] === "Referral" ? (
            // Same Referrals screen as Admissions > Determination > Referrals.
            <DeterminationView
              referralsOnly
              memberOptions={MEMBER_ROWS.map((r) => `${r.name} (${r.relationship})`)}
            />
          ) : SECTIONS[section] === "Assessments" ? (
            // Same Testing & Assessments screen as Admissions, for this
            // member (records are kept per member).
            <LeadDetailView
              key={member.id}
              lead={{
                ...constituentToLead(member),
                communityCareSsmOnly: true,
                // MEMBER column + member picker: "Name (Relationship)".
                communityCareMemberOptions: MEMBER_ROWS.map(
                  (r) => `${r.name} (${r.relationship})`,
                ),
              }}
              onBack={() => {}}
              initialTab="testing"
              contentOnly
              hideConvertButton
              hidePipelineProgress
              hideStatusSelect
            />
          ) : SECTIONS[section] === "Plans" ? (
            // Same Supplemental Plans screen as Admissions > Treatment
            // Planning, shown on its own (no Treatment Planning sub-tabs).
            <TreatmentPlanningView
              initialSubSection="supplementalPlans"
              supplementalOnly
              showMemberColumn
              memberOptions={MEMBER_ROWS.map((r) => `${r.name} (${r.relationship})`)}
            />
          ) : SECTIONS[section] === "Relationships" ? (
            // Same Relationships + Emergency Contacts screen as Admissions.
            <RelationshipsSection
              subjectName={member.name}
              showEmergencyContacts={false}
              relationshipOptions={["Housing Coordinator", "Vocation Coach", "Care Manager", "Therapist"]}
              relationshipColumnLabel="RELATIONSHIP"
              memberOptions={MEMBER_ROWS.map((r) => `${r.name} (${r.relationship})`)}
            />
          ) : SECTIONS[section] === "Observations" ? (
            <div className="space-y-3">
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setViewingObservation(null)
                  setAddingObservation(true)
                  // Placeholder opens the form; the member is picked inside.
                  setObserving({ id: -1, name: "", program: "", profileId: null })
                }}
              >
                <Plus aria-hidden="true" />
                Add Observation
              </Button>
            </div>
            <CommunityCareObservationsFeed
              observations={observations}
              currentUser={getDemoUserName()}
              pageMemberName={member.name}
              onOpenObservation={(o) => {
                const row = MEMBER_ROWS.find((r) => r.name === o.memberName)
                setViewingObservation(o)
                setAddingObservation(false)
                setObserving({
                  id: row?.id ?? o.memberId,
                  name: o.memberName,
                  program: row?.program ?? member.program,
                  profileId: profileIdFor(o.memberName),
                })
              }}
            />
            </div>
          ) : SECTIONS[section] === "Connections" ? (
            <section
              aria-label="Connections"
              className="overflow-hidden"
              style={card}
            >
              <div
                className="px-5 py-3 border-b border-border flex items-center justify-between gap-3"
                style={{ backgroundColor: "var(--slds-g-color-background-alt)" }}
              >
                <h2
                  className="text-[13px] font-semibold"
                  style={{ color: "var(--slds-g-color-text-default)" }}
                >
                  Connections
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  {connFilters.searchBox}
                  <Button
                    onClick={() => {
                      // A connection for the member whose page this is.
                      setEditingConnection(null)
                      setConnectionsTabAdd(true)
                      setConnectionFor({
                        id: member.id,
                        name: member.name,
                        roles: [member.role],
                        program: member.program,
                        assigned: "",
                        lastContact: "",
                      } as MemberRow)
                    }}
                  >
                    <Plus aria-hidden="true" />
                    Add Connection
                  </Button>
                  {connFilters.filtersButton}
                </div>
              </div>
              {connFilters.panel}
              {connections.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    icon={Network}
                    title="No connections yet"
                    description="Use Add Connection above, or Add Connection in My Members, to add one."
                    className="py-6"
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table style={{ minWidth: "1100px" }}>
                    <TableHeader>
                      <TableRow>
                        {[
                          "CONNECTION TYPE",
                          "MEMBERS",
                          "SUB TYPE",
                          "START DATE & TIME",
                          "END DATE & TIME",
                          "LOCATION",
                          "ATTENDED",
                          "STATUS",
                          "ACTIONS",
                        ].map((h) => (
                          <TableHead
                            key={h}
                            variant="slds"
                            size="md"
                            className={h === "ATTENDED" ? "text-center" : h === "ACTIONS" ? "text-right" : undefined}
                          >
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {connFilters.visible.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="px-4 py-6 text-center"
                            style={{ color: "var(--slds-g-color-text-weak)" }}
                          >
                            No connections match your search or filters.
                          </TableCell>
                        </TableRow>
                      )}
                      {connFilters.visible.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="px-4 font-medium">
                            {/* Click opens the connection in view mode. */}
                            <button
                              type="button"
                              onClick={() => openConnection(c, true)}
                              className="text-left hover:underline focus-visible:underline outline-none"
                              style={{ color: "var(--color-link-blue)", fontSize: "inherit", fontWeight: "inherit" }}
                              title={`View ${c.type}`}
                            >
                              {c.type === "Community Care File Request"
                                ? "File Request"
                                : c.type}
                            </button>
                            {c.type === "Community Care Event" &&
                              rsvpSummary(c)}
                          </TableCell>
                          <TableCell className="px-4 max-w-[280px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            <OverflowList
                              maxVisible={1}
                              label="Members"
                              items={(withRelationships(
                                (c as Connection & { memberName?: string })
                                  .memberName ||
                                  c.participants ||
                                  "",
                              ) || "")
                                .split(", ")
                                .filter(Boolean)}
                            />
                          </TableCell>
                          <TableCell className="px-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            {(c as any).subType || "—"}
                          </TableCell>
                          <TableCell className="px-4 whitespace-nowrap">
                            {/* Click opens the connection in view mode. */}
                            <button
                              type="button"
                              onClick={() => openConnection(c, true)}
                              className="hover:underline focus-visible:underline outline-none"
                              style={{ color: "var(--color-link-blue)", fontSize: "inherit" }}
                              title={`View ${c.type}`}
                            >
                              {c.startDate} {to12h(c.startTime)}
                            </button>
                          </TableCell>
                          <TableCell className="px-4 whitespace-nowrap" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            {c.endDate ? `${c.endDate} ${to12h(c.endTime)}` : "—"}
                          </TableCell>
                          <TableCell className="px-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            {c.location || "—"}
                          </TableCell>
                          <TableCell className="px-4">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={!!c.attended}
                                disabled
                                aria-label={`Attended: ${c.attended ? "Yes" : "No"}`}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="px-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            {c.status || "—"}
                          </TableCell>
                          <TableCell className="px-4">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon-xs" title="View" aria-label={`View ${c.type}`} onClick={() => openConnection(c, true)}>
                                <Eye aria-hidden="true" />
                              </Button>
                              <Button variant="ghost" size="icon-xs" title="Edit" aria-label={`Edit ${c.type}`} onClick={() => openConnection(c, false)}>
                                <Pencil aria-hidden="true" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                title="Delete"
                                aria-label={`Delete ${c.type}`}
                                className="text-[#c23934] hover:text-[#c23934]"
                                onClick={() => setDeleteConnId(c.id)}
                              >
                                <Trash2 aria-hidden="true" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {STATS.map((s, i) => (
                  <div
                    key={i}
                    className="p-4 flex items-start gap-6 shadow-sm justify-between min-w-0"
                    style={card}
                  >
                    <div>
                      <div
                        className="text-[12px] tracking-wide"
                        style={{ color: "var(--slds-g-color-text-weak)" }}
                      >
                        {s.label}
                      </div>
                      <div
                        className="text-[24px] font-semibold mt-1"
                        style={{ color: "var(--slds-g-color-text-default)" }}
                      >
                        {statValue(s.label, s.value)}
                      </div>
                    </div>
                    <span
                      className="h-10 w-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: s.bg, color: s.fg }}
                    >
                      <s.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                ))}
              </div>

              <section
                aria-label="My Members"
                className="overflow-hidden flex flex-col min-h-[480px]"
                style={card}
              >
                <div className="px-5 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-border">
                  <h2
                    className="text-[13px] font-semibold"
                    style={{ color: "var(--slds-g-color-text-default)" }}
                  >
                    My Members
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={role}
                      onValueChange={(v) => {
                        setRole(v)
                        setPage(1)
                      }}
                    >
                      <SelectTrigger
                        surface="base"
                        className="w-[180px] h-9"
                        aria-label="Filter by relationship"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Relationships</SelectItem>
                        {roleOptions.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={program}
                      onValueChange={(v) => {
                        setProgram(v)
                        setPage(1)
                      }}
                    >
                      <SelectTrigger
                        surface="base"
                        className="w-[140px] h-9"
                        aria-label="Filter by program"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Program</SelectItem>
                        {programs.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="relative w-[270px]">
                      <Search
                        aria-hidden="true"
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 z-10"
                        style={{ color: "var(--slds-g-color-text-weak)" }}
                      />
                      <Input
                        aria-label="Search members"
                        placeholder="Search Members"
                        surface="base"
                        className="pl-9 h-9 w-full text-[13px]"
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value)
                          setPage(1)
                        }}
                      />
                    </div>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      value={view}
                      onValueChange={(v) => v && setView(v as "list" | "card")}
                      aria-label="Members layout"
                    >
                      <ToggleGroupItem
                        value="card"
                        aria-label="Card view"
                        title="Card view"
                        className="data-[state=on]:!bg-[#145F33] data-[state=on]:!text-white"
                      >
                        <LayoutGrid aria-hidden="true" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="list"
                        aria-label="List view"
                        title="List view"
                        className="data-[state=on]:!bg-[#145F33] data-[state=on]:!text-white"
                      >
                        <List aria-hidden="true" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                    <Button
                      onClick={() => {
                        setEditingConnection(null)
                        setConnectionFor(null)
                        setGroupConnectionOpen(true)
                      }}
                    >
                      <Plus aria-hidden="true" />
                      Add Connection
                    </Button>
                  </div>
                </div>

                {view === "card" ? (
                  <div className="flex-1 p-4">
                    {rows.length === 0 ? (
                      <p
                        className="py-6 text-center text-[13px]"
                        style={{ color: "var(--slds-g-color-text-weak)" }}
                      >
                        No members match your filters.
                      </p>
                    ) : (
                      <ul
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                        aria-label="Members"
                      >
                        {pageRows.map((r) => (
                          <li
                            key={r.id}
                            className="p-4 flex flex-col gap-3"
                            style={card}
                          >
                            <div className="text-[14px] font-semibold min-w-0">
                              {memberName(r)}
                            </div>
                            <dl className="grid grid-cols-[110px_1fr] gap-x-2 gap-y-1 text-[13px]">
                              <dt
                                style={{
                                  color: "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Relationship
                              </dt>
                              <dd className="truncate">{r.relationship}</dd>
                              <dt
                                style={{
                                  color: "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Program
                              </dt>
                              <dd>{r.program}</dd>
                              <dt
                                style={{
                                  color: "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Last Contact
                              </dt>
                              <dd>{r.lastContact}</dd>
                            </dl>
                            {memberActions(r)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 overflow-x-auto">
                    <Table
                      className="table-fixed"
                      style={{ minWidth: "960px" }}
                    >
                      <TableHeader>
                        <TableRow>
                          {sortHead("name", "NAME", "w-[22%]")}
                          {sortHead("role", "RELATIONSHIP", "w-[16%]")}
                          {sortHead("program", "PROGRAM", "w-[16%]")}

                          {sortHead("lastContact", "LAST CONTACT", "w-[16%]")}
                          <TableHead
                            variant="slds"
                            size="md"
                            className="w-[30%]"
                          >
                            ACTIONS
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="px-4 py-6 text-center"
                              style={{ color: "var(--slds-g-color-text-weak)" }}
                            >
                              No members match your filters.
                            </TableCell>
                          </TableRow>
                        ) : (
                          pageRows.map((r) => (
                            <TableRow key={r.id}>
                              <TableCell className="px-4">
                                {memberName(r)}
                              </TableCell>
                              <TableCell
                                className="px-4 truncate"
                                style={{
                                  color: "var(--slds-g-color-text-weak)",
                                }}
                              >
                                {r.relationship}
                              </TableCell>
                              <TableCell
                                className="px-4"
                                style={{
                                  color: "var(--slds-g-color-text-weak)",
                                }}
                              >
                                {r.program}
                              </TableCell>
                              <TableCell
                                className="px-4"
                                style={{
                                  color: "var(--slds-g-color-text-weak)",
                                }}
                              >
                                {r.lastContact}
                              </TableCell>
                              <TableCell className="px-4">
                                {memberActions(r)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-t border-border">
                  <PaginationInfo
                    start={rows.length ? (safePage - 1) * PAGE_SIZE + 1 : 0}
                    end={Math.min(safePage * PAGE_SIZE, rows.length)}
                    total={rows.length}
                    label="records"
                  />
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
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
      <ConnectionFormDialog
        isOpen={connectionFor !== null || groupConnectionOpen}
        onOpenChange={(open) => {
          if (!open) {
            setViewOnlyConn(false)
            setConnectionsTabAdd(false)
            setGroupConnectionOpen(false)
            setConnectionFor(null)
            setEditingConnection(null)
          }
        }}
        editingConnection={editingConnection}
        setEditingConnection={setEditingConnection}
        readOnly={viewOnlyConn}
        onEditFromView={() => setViewOnlyConn(false)}
        connections={connections}
        // Tag each newly saved connection with the member it was opened for.
        setConnections={(update) =>
          setConnections((prev) => {
            const next = typeof update === "function" ? update(prev) : update
            const memberName = connectionFor?.name ?? ""
            // Group connections carry their picked members in participants.
            return next.map((c) =>
              prev.some((p) => p.id === c.id)
                ? c
                : {
                    ...c,
                    memberName: c.participants || memberName,
                  } as Connection & { memberName: string },
            )
          })
        }
        getNextParticipantId={getNextParticipantId}
        communityCareMemberContext
        typeOptionsOverride={COMMUNITY_CARE_CONNECTION_TYPES}
        newConnectionTitle="New Connection"
        // Name multi-select (all grid names, all selected) only for the
        // top-right Add Connection. A row's New Connection is for that
        // member alone, so it has no Name field.
        // Connections tab Add Connection: a Members multi-select of My
        // Members ("Name (Role)"), nothing preselected.
        memberOptions={
          connectionsTabAdd
            ? MEMBER_ROWS.map((r) => `${r.name} (${r.relationship})`)
            : groupConnectionOpen
              ? allConnectionNames
              : undefined
        }
        initialMembers={
          connectionsTabAdd ? [] : groupConnectionOpen ? allConnectionNames : undefined
        }
        memberFieldLabel={connectionsTabAdd ? "Members" : undefined}
        typeOptionLabels={{ "Community Care File Request": "File Request" }}
        youth={
          connectionFor
            ? {
                id: String(
                  profileIdFor(connectionFor.name) ?? `ccm-${connectionFor.id}`,
                ),
                name: connectionFor.name,
              }
            : undefined
        }
      />
      <CommunityCareObservationSheet
        member={observing}
        memberChoices={
          addingObservation
            ? MEMBER_ROWS.map((r) => ({
                id: r.id,
                name: r.name,
                program: r.program,
                profileId: null,
                label: `${r.name} (${r.relationship})`,
              }))
            : undefined
        }
        viewing={viewingObservation}
        onOpenChange={(open) => {
          if (!open) {
            setObserving(null)
            setAddingObservation(false)
            setViewingObservation(null)
          }
        }}
        onSave={(obs) => {
          if (viewingObservation) {
            // Editing an existing observation: update it in place.
            setObservations((list) =>
              list.map((o) =>
                o === viewingObservation
                  ? {
                      ...o,
                      ...obs,
                      memberId: o.memberId,
                      author: o.author,
                      memberName: o.memberName,
                    }
                  : o,
              ),
            )
            setViewingObservation(null)
          } else {
            setObservations((list) => [
              ...list,
              {
                ...obs,
                author: getDemoUserName(),
                memberName: addingObservation
                  ? (MEMBER_ROWS.find((r) => r.id === obs.memberId)?.name ?? "")
                  : (observing?.name ?? ""),
              },
            ])
          }
          setObserving(null)
          setAddingObservation(false)
          toast.success(`Observation saved for ${observing?.name}.`)
        }}
      />
      {/* Delete connection confirmation */}
      <Dialog open={deleteConnId !== null} onOpenChange={(o) => !o && setDeleteConnId(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Delete Connection</DialogTitle>
            <DialogDescription>
              This connection will be removed. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConnId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConnections((list) => list.filter((x) => x.id !== deleteConnId))
                setDeleteConnId(null)
                toast.success("Connection deleted.")
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
