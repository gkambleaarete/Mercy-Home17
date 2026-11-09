import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner@2.0.3"
import { MedicationCatalogView } from "./MedicationCatalogView"
import { ManageDisposalView } from "./ManageDisposalView"
import { SingleYouthDispensation } from "./SingleYouthDispensation"
import { CountsView } from "./CountsView"
import { useNavigate, useLocation, useSearchParams } from "react-router"
import {
  Search,
  Filter,
  Pill,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  User,
  Calendar,
  FileText,
  Plus,
  Download,
  Eye,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Package,
  Monitor,
  Tablet,
  X,
  LayoutGrid,
  Users,
  ArrowLeft,
  Briefcase,
  RotateCcw,
  CircleAlert,
  CheckCircle2,
  Link,
  ChevronUp,
  ChevronDown,
  Pencil,
  AlertTriangle,
  SlidersHorizontal,
  ClipboardList,
  SearchX,
  ShieldAlert,
  TriangleAlert,
} from "@/app/lib/lucide-icons"
import { Button } from "../ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb"
import { EmptyState } from "../ui/empty-state"
import {
  getProgramById,
  getProgramDataStatus,
  getPrograms,
  todayIso,
} from "../../data/mockProgramsData"
import {
  getMedicationLogAccess,
  isProgramAuthorized,
  reviewActionAllowed,
  useMedicationLogAccessVersion,
} from "../../data/medicationLogAccess"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Checkbox } from "../ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { useViewMode } from "../../contexts/ViewModeContext"
import { MedicationsNavContent } from "./MedicationsNavContent"
import {
  canViewGlobalMedicationWorklists,
  globalMedicationErrorsSearch,
  isGlobalMedicationSection,
  GLOBAL_MEDICATION_ERRORS_SECTION,
  MED_DOCUMENTATION_SECTION,
  MEDICATION_HOME_SECTION,
  medicationRecordSearch,
  parseGlobalMedicationErrorFilters,
  type GlobalMedicationErrorFilters,
  DOCUMENTATION_ISSUES_RETURN,
  documentationIssueRecordSearch,
  missingDocumentationSearch,
  parseMissingDocumentationFilters,
  type MissingDocumentationFilters,
} from "../../lib/medicationHomeSections"
import { formatMdy, mdyToIso, localTodayIso } from "../../lib/dateFormat"
import {
  REVIEW_TYPES,
  accessibleProgramIds,
  createReviewLog,
  captureReviewBaselines,
  refreshMedReviewsFromStorage,
  saveDispensationCorrection,
  saveDocumentationReviews,
  updateReviewLog,
  useMedReviews,
  type NewReviewLog,
} from "../../data/medReviewStore"
import {
  countRows,
  dispensationRowsForCount,
  docRows,
  OUTSTANDING_REVIEW_STATUSES,
  reviewRows,
  type MrhRecord,
  type ProgramScope,
} from "../../data/medReviewViews"
import {
  reloadMedicationLogs,
  useMedicationLogReadError,
  useMedicationLogState,
} from "../../data/medicationLogStore"

// Mock medication data for all youth
const YOUTH_MEDICATIONS = [
  {
    id: 1,
    name: "Fozzie Bear",
    initials: "FB",
    program: "Mahoney House",
    activeMeds: 3,
    compliance: 98,
    lastAdmin: "Today, 8:00 AM",
    lastAdminDate: localTodayIso(), // Today
    alerts: 0,
    status: "compliant",
    medStatus: "received", // New status: incomplete, coded, received
    documented: 3,
    counted: 3,
    totalExpected: 3,
    hasPack: false,
    medications: [
      {
        name: "Adderall XR",
        dose: "20mg",
        frequency: "Morning",
        prescriber: "Dr. Martinez",
        quantity: 7,
        isActive: true,
        hasConsent: true,
        activeStartDate: "2024-01-01",
      },
      {
        name: "Melatonin",
        dose: "5mg",
        frequency: "Bedtime",
        prescriber: "Dr. Martinez",
        quantity: 7,
        isActive: true,
        hasConsent: true,
        activeStartDate: "2024-01-01",
      },
      {
        name: "Vitamin D",
        dose: "1000 IU",
        frequency: "Morning",
        prescriber: "Dr. Chen",
        quantity: 7,
        isActive: true,
        hasConsent: true,
        activeStartDate: "2024-01-01",
      },
    ],
  },
  {
    id: 2,
    name: "Kermit the Frog",
    initials: "KF",
    program: "Mahoney House",
    activeMeds: 2,
    compliance: 85,
    lastAdmin: "Today, 7:30 AM",
    lastAdminDate: localTodayIso(), // Today
    alerts: 1,
    status: "warning",
    medStatus: "incomplete", // New status: incomplete, coded, received
    documented: 1,
    counted: 0,
    totalExpected: 2,
    hasPack: false,
    medications: [
      {
        name: "Zoloft",
        dose: "50mg",
        frequency: "Morning",
        prescriber: "Dr. Wilson",
        quantity: 7,
        isActive: true,
        hasConsent: true,
        activeStartDate: "2024-01-01",
      },
      {
        name: "Clonidine",
        dose: "0.1mg",
        frequency: "Evening",
        prescriber: "Dr. Wilson",
        quantity: 7,
        isActive: true,
        hasConsent: false,
        activeStartDate: "2024-01-01",
      },
    ],
  },
  {
    id: 3,
    name: "Red Fraggle",
    initials: "RF",
    program: "Mahoney House",
    activeMeds: 4,
    compliance: 95,
    lastAdmin: "Today, 8:15 AM",
    lastAdminDate: localTodayIso(), // Today
    alerts: 0,
    status: "compliant",
    medStatus: "coded", // New status: incomplete, coded, received
    documented: 4,
    counted: 2,
    totalExpected: 4,
    hasPack: true,
    medications: [
      {
        name: "Risperidone",
        dose: "2mg",
        frequency: "Morning & Evening",
        prescriber: "Dr. Martinez",
        quantity: 14,
        isActive: true,
        hasConsent: true,
        activeStartDate: "2024-01-01",
      },
      {
        name: "Prozac",
        dose: "20mg",
        frequency: "Morning",
        prescriber: "Dr. Martinez",
        quantity: 7,
        isActive: true,
        hasConsent: true,
        activeStartDate: "2024-01-01",
      },
      {
        name: "Trazodone",
        dose: "50mg",
        frequency: "Bedtime",
        prescriber: "Dr. Martinez",
        quantity: 7,
        isActive: true,
        hasConsent: true,
        activeStartDate: "2024-01-01",
      },
      {
        name: "Multivitamin",
        dose: "1 tablet",
        frequency: "Morning",
        prescriber: "Dr. Chen",
        quantity: 7,
        isActive: false,
        hasConsent: true,
        activeStartDate: "2024-01-01",
        activeEndDate: "2026-04-01",
      },
    ],
  },
  {
    id: 4,
    name: "Miss Piggy",
    initials: "MP",
    program: "Mahoney House",
    activeMeds: 1,
    compliance: 100,
    lastAdmin: "Today, 8:00 AM",
    lastAdminDate: localTodayIso(), // Today
    alerts: 0,
    status: "compliant",
    medStatus: "received", // New status: incomplete, coded, received
    documented: 1,
    counted: 1,
    totalExpected: 1,
    hasPack: false,
    medications: [
      {
        name: "Lexapro",
        dose: "10mg",
        frequency: "Morning",
        prescriber: "Dr. Wilson",
        quantity: 7,
        isActive: true,
        hasConsent: true,
        activeStartDate: "2024-01-01",
      },
    ],
  },
  {
    id: 5,
    name: "Gonzo the Great",
    initials: "GG",
    program: "Rydell House",
    activeMeds: 2,
    compliance: 72,
    lastAdmin: "Yesterday, 8:00 PM",
    lastAdminDate: new Date(Date.now() - 86400000).toISOString().split("T")[0], // Yesterday
    alerts: 2,
    status: "alert",
    medStatus: "incomplete", // New status: incomplete, coded, received
    medications: [
      {
        name: "Abilify",
        dose: "5mg",
        frequency: "Morning",
        prescriber: "Dr. Martinez",
        quantity: 7,
        isActive: true,
        hasConsent: true,
        activeStartDate: "2024-01-01",
      },
      {
        name: "Propranolol",
        dose: "20mg",
        frequency: "Twice Daily",
        prescriber: "Dr. Martinez",
        quantity: 14,
        isActive: true,
        hasConsent: true,
        activeStartDate: "2024-01-01",
      },
    ],
  },
  {
    id: 6,
    name: "Animal",
    initials: "AN",
    program: "Rydell House",
    activeMeds: 3,
    compliance: 90,
    lastAdmin: "Today, 7:45 AM",
    lastAdminDate: localTodayIso(), // Today
    alerts: 0,
    status: "compliant",
    medStatus: "received", // New status: incomplete, coded, received
    medications: [
      {
        name: "Concerta",
        dose: "36mg",
        frequency: "Morning",
        prescriber: "Dr. Chen",
        quantity: 7,
        isActive: true,
        hasConsent: true,
        activeStartDate: "2024-01-01",
      },
      {
        name: "Guanfacine",
        dose: "1mg",
        frequency: "Morning & Evening",
        prescriber: "Dr. Chen",
        quantity: 14,
        isActive: true,
        hasConsent: true,
        activeStartDate: "2024-01-01",
      },
      {
        name: "Melatonin",
        dose: "3mg",
        frequency: "Bedtime",
        prescriber: "Dr. Chen",
        quantity: 7,
        isActive: true,
        hasConsent: true,
        activeStartDate: "2024-01-01",
      },
    ],
  },
  {
    id: 7,
    name: "Scooter",
    initials: "SC",
    program: "Walsh Campus",
    activeMeds: 1,
    compliance: 88,
    lastAdmin: "Today, 8:30 AM",
    lastAdminDate: localTodayIso(), // Today
    alerts: 0,
    status: "compliant",
    medStatus: "coded", // New status: incomplete, coded, received
    medications: [
      {
        name: "Strattera",
        dose: "40mg",
        frequency: "Morning",
        prescriber: "Dr. Wilson",
        quantity: 7,
        isActive: true,
        hasConsent: true,
        activeStartDate: "2024-01-01",
      },
    ],
  },
  {
    id: 8,
    name: "Rizzo the Rat",
    initials: "RR",
    program: "Walsh Campus",
    activeMeds: 2,
    compliance: 65,
    lastAdmin: "Yesterday, 6:00 PM",
    lastAdminDate: new Date(Date.now() - 86400000).toISOString().split("T")[0], // Yesterday
    alerts: 3,
    status: "alert",
    medStatus: "incomplete", // New status: incomplete, coded, received
    medications: [
      {
        name: "Seroquel",
        dose: "100mg",
        frequency: "Evening",
        prescriber: "Dr. Martinez",
        quantity: 7,
        isActive: true,
        hasConsent: true,
        activeStartDate: "2024-01-01",
      },
      {
        name: "Wellbutrin",
        dose: "150mg",
        frequency: "Morning",
        prescriber: "Dr. Martinez",
        quantity: 7,
        isActive: true,
        hasConsent: true,
        activeStartDate: "2024-01-01",
      },
    ],
  },
]

// ── Med Cart Review — static item definitions ──────────────────────────
const MCR_OTC_ITEMS = [
  {
    id: "otc-1",
    label: "Acetaminophen (Tylenol)",
    hasExpiry: true,
    hasRestock: true,
  },
  {
    id: "otc-2",
    label: "Diphenhydramine (Benadryl)",
    hasExpiry: true,
    hasRestock: true,
  },
  {
    id: "otc-3",
    label: "Ibuprofen (Advil)",
    hasExpiry: true,
    hasRestock: true,
  },
  {
    id: "otc-4",
    label: "Guaifenesin Oral Solution (Cough Medicine, Non-DM only)",
    hasExpiry: false,
    hasRestock: true,
  },
  {
    id: "otc-5",
    label: "Oral Anesthetic Cough Drops",
    hasExpiry: false,
    hasRestock: true,
  },
  {
    id: "otc-6",
    label: "Bismuth Subsalicylate (Pepto Bismol)",
    hasExpiry: true,
    hasRestock: true,
  },
  {
    id: "otc-7",
    label: "Calcium Carbonate Antacid (Tums)",
    hasExpiry: false,
    hasRestock: true,
  },
  {
    id: "otc-8",
    label: "Naproxen / Naproxen Sodium (Aleve)",
    hasExpiry: true,
    hasRestock: true,
  },
  {
    id: "otc-9",
    label:
      "Antibiotic Ointment (Bacitracin / Neomycin / Polymyxin (Neosporin))",
    hasExpiry: true,
    hasRestock: true,
  },
  {
    id: "otc-10",
    label: "Hydrocortisone 1%",
    hasExpiry: true,
    hasRestock: true,
  },
  {
    id: "otc-supply",
    label: "OTC Supply Correct",
    helper: "All program OTCs labeled, no unapproved OTCs present",
    hasExpiry: false,
    hasRestock: false,
  },
]

const MCR_FA_ITEMS = [
  {
    id: "fa-1",
    label: "Rubbing Alcohol (Isopropyl)",
    hasExpiry: false,
    hasRestock: true,
  },
  {
    id: "fa-2",
    label: "Hydrogen Peroxide",
    hasExpiry: false,
    hasRestock: true,
  },
  {
    id: "fa-3",
    label: "Gauze / Dressings / Bandages",
    hasExpiry: false,
    hasRestock: true,
  },
  {
    id: "fa-4",
    label: "Cotton Balls / Swabs",
    hasExpiry: false,
    hasRestock: true,
  },
]

const MCR_PX_ITEMS = [
  {
    id: "px-1",
    label: "Emergency Medications",
    helper: "Accessible, Adequate Supply, and Current dates",
    isDailyCounts: false,
  },
  {
    id: "px-2",
    label: "Disposal Drawer",
    helper: "No medication present on left side. All medication in lock box.",
    isDailyCounts: false,
  },
  {
    id: "px-3",
    label: "Daily Medication Counts",
    helper: "Verify that daily dose counts in cart match Salesforce values.",
    isDailyCounts: true,
  },
  {
    id: "px-4",
    label: "Youth PRNs",
    helper: "Verify PRN supplies and expiration dates for each youth.",
    isDailyCounts: false,
  },
  {
    id: "px-5",
    label: "Pill Cards",
    helper: "Correctly labeled, dose time stickers, organized, etc.",
    isDailyCounts: false,
  },
]

const MCR_MCS_ITEMS = [
  {
    id: "mcs-1",
    label: "Water Cup and Pill Cup Supply",
    helper: undefined as string | undefined,
  },
  {
    id: "mcs-2",
    label: "Coin Envelope Supply",
    helper: undefined,
  },
  {
    id: "mcs-3",
    label: "Label Printer Supply and Functions",
    helper: undefined,
  },
  {
    id: "mcs-4",
    label: "Medical Emergency Magnet",
    helper: undefined,
  },
  {
    id: "mcs-5",
    label: "PPE (gloves and hand sanitizer)",
    helper: undefined,
  },
  {
    id: "mcs-6",
    label: "Tablet / Chromebook charged and functioning",
    helper: undefined,
  },
  {
    id: "mcs-7",
    label: "Med Cart lock functions and is locked",
    helper: undefined,
  },
  {
    id: "mcs-8",
    label: "Med Leader has key",
    helper: undefined,
  },
  {
    id: "mcs-9",
    label: "Med Leader Log shows current Med Leader",
    helper: undefined,
  },
  {
    id: "mcs-10",
    label: "Med Cart organization",
    helper:
      "Top drawer med-related items only, 1st drawer creams and job aids, 2nd drawer active daily medications, 3rd drawer OTCs/PRNs/First Aid, 4th drawer items labeled for disposal",
  },
]

// Reusable filter-bar multi-select — visually matches the single-select SLDS
// dropdowns used across Med Review Hub (same height/border/font), opens a
// checklist popover on click instead of a permanently-visible scroll box.

// ── Program-origin context (US 20128) ───────────────────────────────────
// Entering from a Program record opens the Med Review Hub with the Program
// carried in the URL (?origin=program&programId=<id>&section=<key>), so a
// refresh or direct link keeps it. The Program NAME always comes from the
// Program record, never from the URL. Without that context the screens keep
// their normal editable Program filter.
const REVIEW_SECTIONS = ["med-review-hub", "med-documentation", "counts"]

// Built from sample values (no inline object type literals), so the Figma
// Make formatter cannot strip their member separators.
const PROGRAM_CONTEXT_OK_SHAPE = {
  status: "ok" as const,
  id: 0,
  name: "",
}
const PROGRAM_CONTEXT_ERROR_SHAPE = {
  status: "invalid" as "invalid" | "missing" | "unreadable" | "denied",
  id: null as number | null,
}
type ProgramContextOk = typeof PROGRAM_CONTEXT_OK_SHAPE
type ProgramContextError = typeof PROGRAM_CONTEXT_ERROR_SHAPE
type ProgramContext = ProgramContextOk | ProgramContextError

function resolveProgramContext(params: URLSearchParams): ProgramContext | null {
  if (params.get("origin") !== "program") return null
  const raw = params.get("programId")
  if (raw === null || !/^\d+$/.test(raw)) return { status: "invalid", id: null }
  const id = Number(raw)
  const program = getProgramById(id)
  if (!program)
    return {
      status:
        getProgramDataStatus() === "unreadable" ? "unreadable" : "missing",
      id,
    }
  if (!isProgramAuthorized(getMedicationLogAccess().scope, id))
    return { status: "denied", id }
  return { status: "ok", id, name: program.name }
}

const CONTEXT_ERROR: Record<Exclude<ProgramContext["status"], "ok">, {
  icon: React.ElementType
  title: string
  description: string
}> = {
  invalid: {
    icon: SearchX,
    title: "Program Not Found",
    description: "The Program for these Med Reviews isn't valid.",
  },
  missing: {
    icon: SearchX,
    title: "Program Not Found",
    description: "The Program for these Med Reviews doesn't exist.",
  },
  unreadable: {
    icon: TriangleAlert,
    title: "Program could not be loaded",
    description:
      "Saved Program data could not be read. Nothing has been changed.",
  },
  denied: {
    icon: ShieldAlert,
    title: "No access to this Program",
    description: "You don't have access to Med Reviews for this Program.",
  },
}

export function Medications() {
  // Load the existing demo records when the Medication workspace opens.
  useEffect(() => {
    import("../../data/medicationOversightDemoSeed")
      .then(({ applyMedicationOversightDemoSeed }) => {
        const result = applyMedicationOversightDemoSeed()

        if (!result.logs.ok || !result.reviews.ok) {
          console.error("Medication demo seed failed:", result)
          toast.error("Unable to load sample medication data.")
        }
      })
      .catch((error) => {
        console.error("Medication demo seed failed:", error)
        toast.error("Unable to load sample medication data.")
      })
  }, [])

  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  // Re-evaluates the Program scope if the access seam changes.
  useMedicationLogAccessVersion()
  const programContext = resolveProgramContext(searchParams)
  const initialLockedId =
    programContext?.status === "ok" ? String(programContext.id) : null
  const getTodayDate = () => {
    const today = new Date()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const year = today.getFullYear()
    return `${month}/${day}/${year}`
  }
  const [searchQuery, setSearchQuery] = useState("")
  const [filterProgram, setFilterProgram] = useState("West Campus Program") // Default to current program
  const [currentMedLeader, setCurrentMedLeader] = useState("Sarah Johnson") // Default

  // Load current Med Leader from localStorage on mount and when returning from Med Leader page
  useEffect(() => {
    const storedMedLeader = localStorage.getItem("currentMedLeader")
    if (storedMedLeader) {
      setCurrentMedLeader(storedMedLeader)
    }
  }, [location]) // Re-run when location changes (e.g., returning from /med-leader)
  const [selectedOverviewSection, setSelectedOverviewSection] = useState("all")
  const [filterDate, setFilterDate] = useState(getTodayDate()) // Default to current date
  const { viewMode, setViewMode } = useViewMode()
  const [showDeferredCounts, setShowDeferredCounts] = useState(false)
  const [showIncompleteWork, setShowIncompleteWork] = useState(false)

  // Add Medication Dialog State
  const [navSectionState, setNavSectionState] = useState(() => {
    // Program-origin entry: the URL names the section (default: Hub).
    if (programContext) {
      const requested = searchParams.get("section")
      return REVIEW_SECTIONS.includes(requested ?? "")
        ? requested as string
        : "med-review-hub"
    }
    const state = location.state as {
      navSection?: string
      fromProgramLog?: boolean
    } | null
    if (state?.fromProgramLog) return state?.navSection ?? "med-overview"
    return state?.navSection ?? "home"
  })
  // Home and the two global worklists live in the URL (?section=), so
  // refresh and Back/Forward keep them; the URL wins over the other state.
  // On the Program-origin review screens the URL's section also wins, so
  // Back into that entry restores its screen.
  const urlSection = searchParams.get("section")
  // A single documentation record opened by id (from the Global Medication
  // Error Dashboard). Not part of a Program-origin session.
  const focusedRecordId =
    !programContext &&
    urlSection === MED_DOCUMENTATION_SECTION &&
    searchParams.get("recordId")
      ? searchParams.get("recordId") as string
      : null
  const navSection = isGlobalMedicationSection(urlSection)
    ? urlSection
    : focusedRecordId
      ? MED_DOCUMENTATION_SECTION
      : programContext && REVIEW_SECTIONS.includes(urlSection ?? "")
        ? urlSection as string
        : navSectionState
  const urlOwnsSection =
    isGlobalMedicationSection(urlSection) || !!focusedRecordId
  // Global Medication Error Dashboard filters (kept in the URL).
  const gmeFilters = parseGlobalMedicationErrorFilters(searchParams)
  const setGmeFilters = (next: GlobalMedicationErrorFilters) =>
    setSearchParams(
      (prev) => {
        const n = new URLSearchParams(prev)
        n.delete("gmeProgram")
        n.delete("gmeStatus")
        if (next.program) n.set("gmeProgram", next.program)
        if (next.status) n.set("gmeStatus", next.status)
        return n
      },
      { replace: true },
    )
  const openDashboardRecord = (logId: string) =>
    navigate(
      {
        pathname: location.pathname,
        search: medicationRecordSearch(logId, gmeFilters),
      },
      { state: location.state },
    )
  const backToDashboard = () =>
    navigate(
      {
        pathname: location.pathname,
        search: globalMedicationErrorsSearch(gmeFilters),
      },
      { state: location.state },
    )
  // Missing or Incomplete Medication Documentation: filters in the URL, and
  // a record opened from it returns to it (?returnTo=documentation-issues).
  const dmFilters = parseMissingDocumentationFilters(searchParams)
  const setDmFilters = (next: MissingDocumentationFilters) =>
    setSearchParams(
      (prev) => {
        const n = new URLSearchParams(prev)
        n.delete("dmProgram")
        n.delete("dmIssue")
        if (next.program) n.set("dmProgram", next.program)
        if (next.issue) n.set("dmIssue", next.issue)
        return n
      },
      { replace: true },
    )
  const openDocumentationIssueRecord = (logId: string) =>
    navigate(
      {
        pathname: location.pathname,
        search: documentationIssueRecordSearch(logId, dmFilters),
      },
      { state: location.state },
    )
  const backToDocumentationIssues = () =>
    navigate(
      {
        pathname: location.pathname,
        search: missingDocumentationSearch(dmFilters),
      },
      { state: location.state },
    )
  const focusReturnTo =
    searchParams.get("returnTo") === DOCUMENTATION_ISSUES_RETURN
      ? DOCUMENTATION_ISSUES_RETURN
      : "dashboard"
  /** Opens a section. Entering Home or a global worklist pushes a URL with
   *  no Program-origin params, which ends any inherited Program lock. */
  const setNavSection = (id: string) => {
    if (isGlobalMedicationSection(id)) {
      if (navSection !== id || programContext)
        navigate(
          {
            pathname: location.pathname,
            search: `?section=${id}`,
          },
          { state: location.state },
        )
      return
    }
    setNavSectionState(id)
    if (programContext) {
      setSearchParams(
        (prev) => {
          const n = new URLSearchParams(prev)
          if (REVIEW_SECTIONS.includes(id)) n.set("section", id)
          else ["origin", "programId", "section"].forEach((k) => n.delete(k))
          return n
        },
        { replace: true },
      )
    } else if (urlOwnsSection) {
      navigate({ pathname: location.pathname, search: "" }, {
        state: location.state,
      })
    }
  }
  // The originating Program, locked — only while on the three review
  // screens, never on unrelated Administration screens.
  const inReviewSection = REVIEW_SECTIONS.includes(navSection)
  const fixedProgram =
    programContext?.status === "ok" && inReviewSection
      ? { id: programContext.id, name: programContext.name }
      : null

  // ── Med Review Hub — real records (US 20128) ────────────────────────
  // Review logs come from the shared review store; Count and Documentation
  // rows from the canonical medication logs. Everything is limited to the
  // Programs the user may access, and keyed by canonical Program ID.
  const reviewRead = useMedReviews()
  const medLogs = useMedicationLogState()
  const logReadError = useMedicationLogReadError()
  const scope: ProgramScope = accessibleProgramIds()
  const scopeKey = JSON.stringify(scope)
  const programName = (id: number) =>
    getProgramById(id)?.name ?? "Program unavailable"
  /** Accessible Programs, as { id, name } options (id is the value). */
  const PROGRAM_OPTIONS = useMemo(
    () =>
      getPrograms()
        .filter((p) => scope === "all" || scope.includes(p.id))
        .map((p) => ({ id: String(p.id), name: p.name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scopeKey],
  )
  const MRH_REVIEW_TYPES = [...REVIEW_TYPES]
  const MRH_MOCK: MrhRecord[] = useMemo(
    () => reviewRows(reviewRead, scope, programName, null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reviewRead, scopeKey],
  )
  const MRH_REVIEWERS = useMemo(
    () => [...new Set(MRH_MOCK.map((r) => r.reviewer))].sort(),
    [MRH_MOCK],
  )
  /** "MM/DD/YYYY" → sortable ISO ("n/a" / "" sort first). */
  const isoOf = (v: string) =>
    /^\d{2}\/\d{2}\/\d{4}$/.test(v) ? mdyToIso(v) : ""

  function mrhDaysSince(dateStr: string): number {
    const [m, d, y] = dateStr.split("/").map(Number)
    const past = new Date(y, m - 1, d)
    const t = new Date()
    const now = new Date(t.getFullYear(), t.getMonth(), t.getDate())
    return Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60 * 24))
  }

  const [mrhProgram, setMrhProgram] = useState<string>(
    initialLockedId ?? "All Programs",
  )
  const [mrhReviewType, setMrhReviewType] = useState<string>(
    () => (location.state as any)?.mrhReviewType ?? "",
  )
  const [mrhReviewer, setMrhReviewer] = useState<string>("")
  const [mrhDateStart, setMrhDateStart] = useState<string>("")
  const [mrhDateEnd, setMrhDateEnd] = useState<string>("")
  const [mrhSortCol, setMrhSortCol] = useState<keyof MrhRecord>("reviewDate")
  const [mrhSortDir, setMrhSortDir] = useState<"asc" | "desc">("desc")
  const [mrhSelectedId, setMrhSelectedId] = useState<string | null>(null)
  const [mrhViewOpen, setMrhViewOpen] = useState(false)
  // ── Count Review form state ──────────────────────────────────────────
  const [crStartDate, setCrStartDate] = useState("")
  const [crEndDate, setCrEndDate] = useState("")
  const [crConcernsNoted, setCrConcernsNoted] = useState<"Yes" | "No">("No")
  const [crDetails, setCrDetails] = useState("")

  // ── Counts tab state ─────────────────────────────────────────────────
  // Count rows are the canonical Count logs of the accessible Programs;
  // the Dispensation Logs below are that medication's other logs.
  const viewOpts = {
    attestations: reviewActionAllowed("viewAttestationDetails"),
  }
  const COUNT_ROWS = useMemo(
    () => countRows(medLogs, scope, null, viewOpts),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [medLogs, scopeKey, viewOpts.attestations],
  )
  const COUNT_YOUTHS = useMemo(
    () => [...new Set(COUNT_ROWS.map((r) => r.youth))].sort(),
    [COUNT_ROWS],
  )
  const COUNT_MEDS = useMemo(
    () => [...new Set(COUNT_ROWS.map((r) => r.medication))].sort(),
    [COUNT_ROWS],
  )
  const COUNT_PERIODS = ["Morning", "Afternoon", "Evening", "Bedtime", "PRN"]
  const DISP_BY_ID = useMemo(
    () =>
      Object.fromEntries(
        COUNT_ROWS.map((r) => [
          r.id,
          dispensationRowsForCount(medLogs, r, scope, viewOpts),
        ]),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [COUNT_ROWS, medLogs, scopeKey, viewOpts.attestations],
  )
  const [cntSelectedId, setCntSelectedId] = useState<string | null>(null)
  const [cntFilterYouth, setCntFilterYouth] = useState("")
  const [cntFilterMed, setCntFilterMed] = useState("")
  const [cntFilterPeriod, setCntFilterPeriod] = useState("")
  const [cntCreateOpen, setCntCreateOpen] = useState(false)
  const [cntCountModalOpen, setCntCountModalOpen] = useState(false)

  const cntFiltered = useMemo(() => {
    // The fixed Program's own Count logs, by canonical Program ID.
    let rows = fixedProgram
      ? COUNT_ROWS.filter((r) => r.programId === fixedProgram.id)
      : COUNT_ROWS
    if (cntFilterYouth) rows = rows.filter((r) => r.youth === cntFilterYouth)
    if (cntFilterMed) rows = rows.filter((r) => r.medication === cntFilterMed)
    if (cntFilterPeriod)
      rows = rows.filter((r) => r.dosingPeriod === cntFilterPeriod)
    return rows
  }, [
    COUNT_ROWS,
    cntFilterYouth,
    cntFilterMed,
    cntFilterPeriod,
    fixedProgram?.id,
  ])

  // ── Saving review logs (US 20128) ────────────────────────────────────
  // Every create goes to the shared review store with the canonical Program
  // ID; success is reported only after storage accepted it. In a Program-
  // origin session the fixed Program is the only one that can be saved.
  const [createProgramId, setCreateProgramId] = useState(initialLockedId ?? "")
  const [createProgramError, setCreateProgramError] = useState("")
  const writeCtx = fixedProgram
    ? { expectedProgramId: fixedProgram.id }
    : undefined
  /** The Program a new review belongs to: the fixed one, else the chosen
   *  one. null when none is chosen. */
  const createProgramNumber = (chosen: string): number | null => {
    if (fixedProgram) return fixedProgram.id
    const n = Number(chosen)
    return chosen !== "" && Number.isInteger(n) ? n : null
  }
  function persistReview(
    input: Omit<NewReviewLog, "programId">,
    chosenProgram: string,
  ): boolean {
    const programId = createProgramNumber(chosenProgram)
    if (programId === null) {
      setCreateProgramError("Program is required.")
      return false
    }
    setCreateProgramError("")
    const result = createReviewLog({ ...input, programId }, writeCtx)
    if (!result.ok) {
      if (result.fieldErrors?.programId)
        setCreateProgramError(result.fieldErrors.programId)
      toast.error("Review log not saved", {
        description: result.error,
      })
      return false
    }
    toast.success("Review log created.")
    return true
  }
  /** Review Log of a type with a period + concerns (Count / Med
   *  Documentation reviews). */
  function savePeriodReview(
    type: "Count Review" | "Med Documentation Review",
    start: string,
    end: string,
    concerns: boolean,
    details: string,
    chosenProgram: string,
  ): boolean {
    if (!start || !end) {
      toast.error("Review log not saved", {
        description: "Start Date and End Date are required.",
      })
      return false
    }
    if (concerns && !details.trim()) {
      toast.error("Review log not saved", {
        description: "Details are required when concerns are noted.",
      })
      return false
    }
    return persistReview(
      {
        reviewType: type,
        reviewDate: todayIso(),
        startDate: start,
        endDate: end,
        numberOfIssues: null,
        hasIssue: concerns,
        details,
      },
      chosenProgram,
    )
  }
  function saveCntReview() {
    if (
      !savePeriodReview(
        "Count Review",
        crStartDate,
        crEndDate,
        crConcernsNoted === "Yes",
        crDetails,
        createProgramId,
      )
    )
      return
    setCntCreateOpen(false)
    setCrStartDate("")
    setCrEndDate("")
    setCrConcernsNoted("No")
    setCrDetails("")
  }
  /** Hub create modal: Count / Med Documentation reviews. */
  function saveHubPeriodReview(closeAfter: boolean) {
    if (
      !savePeriodReview(
        mrhNewType as "Count Review" | "Med Documentation Review",
        crStartDate,
        crEndDate,
        crConcernsNoted === "Yes",
        crDetails,
        createProgramId,
      )
    )
      return
    setCrStartDate("")
    setCrEndDate("")
    setCrConcernsNoted("No")
    setCrDetails("")
    if (closeAfter) {
      setMrhCreateOpen(false)
      setMrhNewType("")
    }
  }
  /** Edit Review Log: only Has Issue and Comments are editable. */
  function saveReviewEdit(
    id: string,
    patch: { hasIssue: boolean; details: string },
  ): boolean {
    const result = updateReviewLog(id, patch, writeCtx)
    if (!result.ok) {
      toast.error("Review log not saved", {
        description: result.error,
      })
      return false
    }
    toast.success("Review log updated.")
    return true
  }

  const [mrhCreateOpen, setMrhCreateOpen] = useState(false)
  const [mrhNewType, setMrhNewType] = useState<string>("")
  const [mrhNewTypeError, setMrhNewTypeError] = useState(false)

  // ── Med Documentation (ticket 19256) ────────────────────────────────────
  const MEDDOC_MOCK = useMemo(
    () => docRows(medLogs, reviewRead, scope, null, programName, viewOpts),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [medLogs, reviewRead, scopeKey, viewOpts.attestations],
  )
  const MEDDOC_YOUTHS = useMemo(
    () => [...new Set(MEDDOC_MOCK.map((r) => r.youth))].sort(),
    [MEDDOC_MOCK],
  )
  const MEDDOC_MEDS = useMemo(
    () => [...new Set(MEDDOC_MOCK.map((r) => r.medication))].sort(),
    [MEDDOC_MOCK],
  )
  const MEDDOC_STAFF_FILTER = useMemo(
    () =>
      [
        ...new Set(MEDDOC_MOCK.map((r) => r.attestationStaff).filter(Boolean)),
      ].sort(),
    [MEDDOC_MOCK],
  )
  const MEDDOC_CODES = ["Given", "Refused", "Held", "Not Available"]
  const MEDDOC_REVIEW_STATUSES = [
    "Non-Issue",
    "Fixed by Reviewer",
    "Assigned",
    "Updated",
    "Resolved",
  ]
  const MEDDOC_DOSING_PERIODS = [
    "Morning",
    "Afternoon",
    "Evening",
    "Bedtime",
    "PRN",
  ]
  const MEDDOC_MEDLEADERS = [
    "Sarah Johnson",
    "Maria Santos",
    "David Reyes",
    "Linda Okafor",
    "James Carter",
  ]

  const todayStr = () => formatMdy(new Date())
  const weekAgoStr = () => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return formatMdy(d)
  }

  const [mdStartDate, setMdStartDate] = useState(weekAgoStr())
  const [mdEndDate, setMdEndDate] = useState(todayStr())
  const [mdFilterProgram, setMdFilterProgram] = useState(initialLockedId ?? "")
  const [mdFilterYouth, setMdFilterYouth] = useState<string[]>([])
  const [mdFilterMed, setMdFilterMed] = useState<string[]>([])
  const [mdFilterStaff, setMdFilterStaff] = useState<string[]>([])
  const [mdFilterStaffDispensed, setMdFilterStaffDispensed] = useState("")
  const [mdFilterYouthReceived, setMdFilterYouthReceived] = useState("")
  const [mdFilterCodes, setMdFilterCodes] = useState<string[]>([])
  const [mdFilterComments, setMdFilterComments] = useState("")
  const [mdFilterReviewStatus, setMdFilterReviewStatus] = useState<string[]>([])
  const [mdFilterDosingPeriod, setMdFilterDosingPeriod] = useState<string[]>([])

  const [mdSelectedIds, setMdSelectedIds] = useState<string[]>([])
  const [mdActiveRowId, setMdActiveRowId] = useState<string | null>(null)

  // A record opened by id: only that record, whatever filters were used
  // elsewhere. Out-of-scope and missing ids are both "not available".
  const focusedRecordAvailable =
    !!focusedRecordId && MEDDOC_MOCK.some((r) => r.id === focusedRecordId)
  useEffect(() => {
    if (!focusedRecordId) return
    setMdActiveRowId(focusedRecordAvailable ? focusedRecordId : null)
    setMdSelectedIds(focusedRecordAvailable ? [focusedRecordId] : [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedRecordId, focusedRecordAvailable])

  const outstandingOnly = navSection === GLOBAL_MEDICATION_ERRORS_SECTION
  const mdFiltered = useMemo(() => {
    if (focusedRecordId)
      return MEDDOC_MOCK.filter((r) => r.id === focusedRecordId)
    // The Global Medication Error Dashboard shows the same grid, limited to
    // records whose latest review is Assigned or Updated.
    let rows = outstandingOnly
      ? MEDDOC_MOCK.filter((r) =>
          (OUTSTANDING_REVIEW_STATUSES as readonly string[]).includes(
            r.reviewStatus,
          ),
        )
      : MEDDOC_MOCK
    // By canonical Program ID: the fixed Program, else the chosen filter.
    const pid = fixedProgram
      ? fixedProgram.id
      : mdFilterProgram
        ? Number(mdFilterProgram)
        : null
    if (pid !== null) rows = rows.filter((r) => r.programId === pid)
    if (mdFilterYouth.length)
      rows = rows.filter((r) => mdFilterYouth.includes(r.youth))
    if (mdFilterMed.length)
      rows = rows.filter((r) => mdFilterMed.includes(r.medication))
    if (mdFilterStaff.length)
      rows = rows.filter((r) => mdFilterStaff.includes(r.attestationStaff))
    if (mdFilterStaffDispensed)
      rows = rows.filter((r) => r.staffDispensed === mdFilterStaffDispensed)
    if (mdFilterYouthReceived)
      rows = rows.filter((r) => r.youthReceived === mdFilterYouthReceived)
    if (mdFilterCodes.length)
      rows = rows.filter((r) => mdFilterCodes.includes(r.primaryCode))
    if (mdFilterComments === "Not Blank")
      rows = rows.filter(
        (r) =>
          r.medComments !== "—" ||
          r.dosingPeriodComments !== "—" ||
          r.reviewComments !== "—",
      )
    if (mdFilterComments === "Blank")
      rows = rows.filter(
        (r) =>
          r.medComments === "—" &&
          r.dosingPeriodComments === "—" &&
          r.reviewComments === "—",
      )
    if (mdFilterReviewStatus.length)
      rows = rows.filter((r) => mdFilterReviewStatus.includes(r.reviewStatus))
    if (mdFilterDosingPeriod.length)
      rows = rows.filter((r) => mdFilterDosingPeriod.includes(r.dosingPeriod))
    return rows
  }, [
    MEDDOC_MOCK,
    focusedRecordId,
    outstandingOnly,
    mdFilterProgram,
    fixedProgram?.id,
    mdFilterYouth,
    mdFilterMed,
    mdFilterStaff,
    mdFilterStaffDispensed,
    mdFilterYouthReceived,
    mdFilterCodes,
    mdFilterComments,
    mdFilterReviewStatus,
    mdFilterDosingPeriod,
  ])

  const mdActiveRow = MEDDOC_MOCK.find((r) => r.id === mdActiveRowId) ?? null
  const mdDispensationLogs = useMemo(() => {
    if (!mdActiveRow) return []
    return MEDDOC_MOCK.filter(
      (r) =>
        r.programId === mdActiveRow.programId &&
        r.youthId === mdActiveRow.youthId &&
        r.medication === mdActiveRow.medication &&
        r.dosingPeriod === mdActiveRow.dosingPeriod,
    )
  }, [mdActiveRow, MEDDOC_MOCK])

  const handleMdClearFilters = () => {
    // A fixed Program survives Clear Filters.
    setMdFilterProgram(fixedProgram ? String(fixedProgram.id) : "")
    setMdFilterYouth([])
    setMdFilterMed([])
    setMdFilterStaff([])
    setMdFilterStaffDispensed("")
    setMdFilterYouthReceived("")
    setMdFilterCodes([])
    setMdFilterComments("")
    setMdFilterReviewStatus([])
    setMdFilterDosingPeriod([])
  }
  const handleMdToggleAll = (checked: boolean) =>
    setMdSelectedIds(checked ? mdFiltered.map((r) => r.id) : [])
  const handleMdToggleRow = (id: number, checked: boolean) =>
    setMdSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id),
    )

  // ── Review Dispensations modal ──────────────────────────────────────────
  const [mdReviewOpen, setMdReviewOpen] = useState(false)
  const [mdReviewStatus, setMdReviewStatus] = useState("")
  const [mdReviewAssignee, setMdReviewAssignee] = useState("")
  const [mdReviewComment, setMdReviewComment] = useState("")
  const [mdReviewRowIds, setMdReviewRowIds] = useState<string[]>([])
  const [mdReviewActiveId, setMdReviewActiveId] = useState<string | null>(null)

  // Each selected log's latest review as it was when the form opened. It
  // stays fixed while the form is open; the save is refused if any of them
  // has changed since ("no review yet" is an explicit null).
  const [mdReviewBaselines, setMdReviewBaselines] =
    useState<ReturnType<typeof captureReviewBaselines>>({})

  const handleOpenMdReview = () => {
    setMdReviewBaselines(captureReviewBaselines(mdSelectedIds))
    setMdReviewRowIds([...mdSelectedIds])
    setMdReviewActiveId(mdSelectedIds[0] ?? null)
    setMdReviewStatus("")
    setMdReviewAssignee("")
    setMdReviewComment("")
    setMdReviewOpen(true)
  }
  const mdReviewRows = MEDDOC_MOCK.filter((r) => mdReviewRowIds.includes(r.id))
  const mdReviewActiveRow =
    MEDDOC_MOCK.find((r) => r.id === mdReviewActiveId) ?? null
  const mdReviewDispLogs = useMemo(() => {
    if (!mdReviewActiveRow) return []
    return MEDDOC_MOCK.filter(
      (r) =>
        r.youth === mdReviewActiveRow.youth &&
        r.medication === mdReviewActiveRow.medication &&
        r.dosingPeriod === mdReviewActiveRow.dosingPeriod,
    )
  }, [mdReviewActiveRow])

  // ── Update Dispensation modal ───────────────────────────────────────────
  const [mdUpdateOpen, setMdUpdateOpen] = useState(false)
  const [mdUpdStaffDispensed, setMdUpdStaffDispensed] = useState("")
  const [mdUpdYouthReceived, setMdUpdYouthReceived] = useState("")
  const [mdUpdPrimaryCode, setMdUpdPrimaryCode] = useState("")
  const [mdUpdComment, setMdUpdComment] = useState("")
  // The log a correction is saved against — set explicitly when the modal
  // opens (from a selected record, or chained from a review), never inferred
  // from a previously submitted review.
  const [mdUpdateTargetId, setMdUpdateTargetId] = useState<string | null>(null)
  const mdUpdateTarget =
    MEDDOC_MOCK.find((r) => r.id === mdUpdateTargetId) ?? null
  /** Opens Update Dispensation for the one selected record, with no review. */
  const handleOpenMdUpdate = () => {
    if (mdSelectedIds.length !== 1) return
    setMdUpdateTargetId(mdSelectedIds[0])
    setMdUpdStaffDispensed("")
    setMdUpdYouthReceived("")
    setMdUpdPrimaryCode("")
    setMdUpdComment("")
    setMdUpdateOpen(true)
  }

  const handleSaveMdReview = (close: boolean, chainToUpdate: boolean) => {
    // Saved in the shared review store against each canonical log; the
    // success message only follows a successful write.
    const result = saveDocumentationReviews(
      {
        logIds: mdReviewRowIds,
        reviewStatus: mdReviewStatus,
        assignee: mdReviewAssignee,
        comment: mdReviewComment,
        baselines: mdReviewBaselines,
      },
      writeCtx,
    )
    if (!result.ok) {
      // A conflict keeps the form and its entries; the table behind it
      // already shows the newer review.
      toast.error(
        result.reason === "conflict"
          ? "Review changed — nothing was saved"
          : "Review not saved",
        { description: result.error },
      )
      return
    }
    setMdSelectedIds((prev) =>
      prev.filter((id) => !mdReviewRowIds.includes(id)),
    )
    toast.success(
      `Review saved for ${result.count} dispensation${
        result.count !== 1 ? "s" : ""
      }.`,
    )
    if (chainToUpdate) {
      setMdUpdateTargetId(mdReviewActiveId)
      setMdUpdStaffDispensed("")
      setMdUpdYouthReceived("")
      setMdUpdPrimaryCode("")
      setMdUpdComment("")
      setMdReviewOpen(false)
      setMdUpdateOpen(true)
      return
    }
    if (close) {
      setMdReviewOpen(false)
      return
    }
    setMdReviewRowIds([])
    setMdReviewActiveId(null)
  }
  const handleSubmitMdUpdate = () => {
    if (
      !mdUpdStaffDispensed &&
      !mdUpdYouthReceived &&
      !mdUpdPrimaryCode &&
      !mdUpdComment.trim()
    )
      return
    if (
      (mdUpdStaffDispensed || mdUpdYouthReceived || mdUpdPrimaryCode) &&
      !mdUpdComment.trim()
    )
      return
    if (mdUpdateTargetId === null) return
    // A correction saved against the canonical log; the log itself is
    // not rewritten. It appends no review and changes no review status.
    const result = saveDispensationCorrection(
      {
        logId: mdUpdateTargetId,
        staffDispensed: mdUpdStaffDispensed,
        youthReceived: mdUpdYouthReceived,
        primaryCode: mdUpdPrimaryCode,
        comment: mdUpdComment,
      },
      writeCtx,
    )
    if (!result.ok) {
      toast.error("Dispensation update not saved", {
        description: result.error,
      })
      return
    }
    toast.success("Dispensation update saved.")
    setMdUpdateOpen(false)
    setMdUpdateTargetId(null)
  }

  // ── Create New Review Log (Med Documentation Review) ────────────────────
  const [mdCreateOpen, setMdCreateOpen] = useState(false)
  const [mdrStartDate, setMdrStartDate] = useState("")
  const [mdrEndDate, setMdrEndDate] = useState("")
  const [mdrDetails, setMdrDetails] = useState("")

  const saveMdReviewLog = () => {
    if (
      !savePeriodReview(
        "Med Documentation Review",
        mdrStartDate,
        mdrEndDate,
        false,
        mdrDetails,
        createProgramId,
      )
    )
      return
    setMdCreateOpen(false)
    setMdrStartDate("")
    setMdrEndDate("")
    setMdrDetails("")
  }

  // ── Med Cart Review Form State ───────────────────────────────────────
  const MCR_TODAY_STR = formatMdy(new Date())
  const [mcrTab, setMcrTab] = useState<"med-cart" | "history">("med-cart")
  const [mcrProgram, setMcrProgram] = useState(initialLockedId ?? "")
  const [mcrReviewDate, setMcrReviewDate] = useState(MCR_TODAY_STR)
  // Shown read-only on the forms: the CURRENT user, which is also who the
  // store records as the reviewer / modifier.
  const MCR_REVIEWER = getMedicationLogAccess().user.name
  const [mcrResp, setMcrResp] = useState<Record<string, "Yes" | "No" | "">>({})
  const [mcrComment, setMcrComment] = useState<Record<string, string>>({})
  const [mcrRestock, setMcrRestock] = useState<Record<string, boolean>>({})
  const [mcrExpiry, setMcrExpiry] = useState<Record<string, string>>({})
  const [mcrDCStart, setMcrDCStart] = useState("")
  const [mcrDCEnd, setMcrDCEnd] = useState("")
  const [mcrDCDetails, setMcrDCDetails] = useState("")
  const [mcrErrors, setMcrErrors] = useState<string[]>([])
  const [mcrCancelConfirm, setMcrCancelConfirm] = useState(false)
  const [mcrNotifyOpen, setMcrNotifyOpen] = useState(false)
  const [mcrNotifyCloseAfter, setMcrNotifyCloseAfter] = useState(false)
  const [mcrHistory] = useState<Array<{
    id: number
    dt: string
    modifier: string
    field: string
    prev: string
    next: string
  }>>([
    {
      id: 1,
      dt: "06/29/2026 10:15 AM",
      modifier: "Sohan Jadhavrao",
      field: "",
      prev: "",
      next: "Created record",
    },
  ])

  function mcrSetResp(id: string, val: "Yes" | "No") {
    setMcrResp((p) => ({ ...p, [id]: val }))
    if (val === "Yes") {
      setMcrComment((p) => ({ ...p, [id]: "" }))
      setMcrRestock((p) => ({ ...p, [id]: false }))
    }
  }

  function mcrValidateAndSave(closeAfter: boolean) {
    const errs: string[] = []
    if (!mcrReviewDate) errs.push("Review Date is required.")
    if (mcrResp["px-3"] === "Yes") {
      if (!mcrDCStart)
        errs.push("Daily Medication Counts: Start Date is required.")
      if (!mcrDCEnd) errs.push("Daily Medication Counts: End Date is required.")
    }
    const allItems = [
      ...MCR_OTC_ITEMS,
      ...MCR_FA_ITEMS,
      ...MCR_PX_ITEMS,
      ...MCR_MCS_ITEMS,
    ]
    allItems.forEach((item) => {
      if (mcrResp[item.id] === "No" && !mcrComment[item.id]?.trim()) {
        errs.push(`Comment required for "${item.label}" (No response).`)
      }
    })
    if (errs.length > 0) {
      setMcrErrors(errs)
      return
    }
    setMcrErrors([])
    if (closeAfter) {
      setMrhCreateOpen(false)
      setMrhNewType("")
    }
  }

  function mcrHandleSave(closeAfter: boolean) {
    const errs: string[] = []
    if (!mcrReviewDate) errs.push("Review Date is required.")
    if (!fixedProgram && !mcrProgram) errs.push("Program is required.")
    if (mcrResp["px-3"] === "Yes") {
      if (!mcrDCStart)
        errs.push("Daily Medication Counts: Start Date is required.")
      if (!mcrDCEnd) errs.push("Daily Medication Counts: End Date is required.")
    }
    const allItems = [
      ...MCR_OTC_ITEMS,
      ...MCR_FA_ITEMS,
      ...MCR_PX_ITEMS,
      ...MCR_MCS_ITEMS,
    ]
    allItems.forEach((item) => {
      if (mcrResp[item.id] === "No" && !mcrComment[item.id]?.trim()) {
        errs.push(`Comment required for "${item.label}" (No response).`)
      }
    })
    if (errs.length > 0) {
      setMcrErrors(errs)
      return
    }
    setMcrErrors([])
    // Check whether a notification is warranted
    const noItems = allItems.filter((i) => mcrResp[i.id] === "No")
    const dailyCounts = mcrResp["px-3"] === "Yes"
    const hasIssues = noItems.length > 0 || dailyCounts
    // Persist first; the success message and any follow-up only happen
    // once the shared store accepted the review.
    const saved = persistReview(
      {
        reviewType: "Med Cart Review",
        reviewDate: mdyToIso(mcrReviewDate),
        startDate: dailyCounts ? mcrDCStart : "",
        endDate: dailyCounts ? mcrDCEnd : "",
        numberOfIssues: noItems.length + (dailyCounts ? 1 : 0),
        hasIssue: hasIssues,
        details: noItems
          .map((i) => `${i.label}: ${mcrComment[i.id]}`)
          .join("; "),
        payload: {
          responses: mcrResp,
          comments: mcrComment,
          restock: mcrRestock,
          expiry: mcrExpiry,
          dailyCountDetails: mcrDCDetails,
        },
      },
      mcrProgram,
    )
    if (!saved) return
    if (hasIssues) {
      setMcrNotifyCloseAfter(closeAfter)
      setMcrNotifyOpen(true)
    } else {
      if (closeAfter) {
        setMrhCreateOpen(false)
        setMrhNewType("")
      }
    }
  }

  const mrhFiltered = useMemo(() => {
    // By canonical Program ID: the fixed Program, else the chosen filter.
    let rows = MRH_MOCK
    const pid = fixedProgram
      ? fixedProgram.id
      : mrhProgram !== "All Programs"
        ? Number(mrhProgram)
        : null
    if (pid !== null) rows = rows.filter((r) => r.programId === pid)
    if (mrhReviewType) rows = rows.filter((r) => r.reviewType === mrhReviewType)
    if (mrhReviewer) rows = rows.filter((r) => r.reviewer === mrhReviewer)
    const from = mrhDateStart ? isoOf(mrhDateStart) : ""
    const to = mrhDateEnd ? isoOf(mrhDateEnd) : ""
    if (from) rows = rows.filter((r) => isoOf(r.reviewDate) >= from)
    if (to) rows = rows.filter((r) => isoOf(r.reviewDate) <= to)
    const dateCols = ["reviewDate", "startDate", "endDate"]
    const key = (r: MrhRecord) =>
      dateCols.includes(mrhSortCol)
        ? isoOf(String(r[mrhSortCol]))
        : String(r[mrhSortCol] ?? "")
    return [...rows].sort((a, b) =>
      mrhSortDir === "asc"
        ? key(a).localeCompare(key(b))
        : key(b).localeCompare(key(a)),
    )
  }, [
    MRH_MOCK,
    mrhProgram,
    fixedProgram?.id,
    mrhReviewType,
    mrhReviewer,
    mrhDateStart,
    mrhDateEnd,
    mrhSortCol,
    mrhSortDir,
  ])

  const mrhSelectedRecord = MRH_MOCK.find((r) => r.id === mrhSelectedId) ?? null
  const isSingleProgram = !!fixedProgram || mrhProgram !== "All Programs"

  function mrhToggleSort(col: keyof MrhRecord) {
    if (mrhSortCol === col) setMrhSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setMrhSortCol(col)
      setMrhSortDir("desc")
    }
  }

  function mrhLastCompleted(type: string): MrhRecord | undefined {
    const pid = fixedProgram ? fixedProgram.id : Number(mrhProgram)
    return MRH_MOCK.filter(
      (r) => r.programId === pid && r.reviewType === type,
    ).sort((a, b) => isoOf(b.reviewDate).localeCompare(isoOf(a.reviewDate)))[0]
  }

  // Pack Meds Modal State
  const [isPackMedsModalOpen, setIsPackMedsModalOpen] = useState(false)
  const [packMedsModalYouth, setPackMedsModalYouth] = useState<any>(null)
  const [packMedsViewPack, setPackMedsViewPack] = useState<any>(null)

  const [showAddMedicationDialog, setShowAddMedicationDialog] = useState(false)
  const [selectedYouth, setSelectedYouth] = useState("")
  const [medicationName, setMedicationName] = useState("")
  const [dose, setDose] = useState("")
  const [frequency, setFrequency] = useState("")
  const [prescriber, setPrescriber] = useState("")
  const [instructions, setInstructions] = useState("")

  // Mock data for medication overview - program level view
  const mockYouthMedicationData = [
    {
      id: "1",
      name: "Alex Martinez",
      initials: "AM",
      program: "West Campus Program",
      morning: {
        total: 3,
        documented: 3,
        counted: 3,
        hasPackMed: false,
      },
      afternoon: {
        total: 2,
        documented: 2,
        counted: 1,
        hasPackMed: false,
      },
      evening: {
        total: 2,
        documented: 1,
        counted: 0,
        hasPackMed: false,
      },
      bedtime: {
        total: 1,
        documented: 1,
        counted: 1,
        hasPackMed: false,
      },
      standardOTC: { hasConsent: true, dispensed: false },
      prn: {
        hasApprovedPRN: true,
        dispensedCount: 0,
        countedEntries: 0,
        hasPackMedPRN: false,
      },
    },
    {
      id: "2",
      name: "Jordan Chen",
      initials: "JC",
      program: "West Campus Program",
      morning: {
        total: 2,
        documented: 2,
        counted: 2,
        hasPackMed: true,
      },
      afternoon: {
        total: 1,
        documented: 0,
        counted: 0,
        hasPackMed: false,
      },
      evening: {
        total: 3,
        documented: 3,
        counted: 3,
        hasPackMed: false,
      },
      bedtime: {
        total: 2,
        documented: 2,
        counted: 2,
        hasPackMed: false,
      },
      standardOTC: { hasConsent: true, dispensed: true },
      prn: {
        hasApprovedPRN: true,
        dispensedCount: 2,
        countedEntries: 2,
        hasPackMedPRN: false,
      },
    },
    {
      id: "3",
      name: "Taylor Rodriguez",
      initials: "TR",
      program: "West Campus Program",
      morning: {
        total: 1,
        documented: 1,
        counted: 1,
        hasPackMed: false,
      },
      afternoon: {
        total: 0,
        documented: 0,
        counted: 0,
        hasPackMed: false,
      },
      evening: {
        total: 1,
        documented: 0,
        counted: 0,
        hasPackMed: false,
      },
      bedtime: {
        total: 1,
        documented: 1,
        counted: 1,
        hasPackMed: false,
      },
      standardOTC: { hasConsent: true, dispensed: false },
      prn: {
        hasApprovedPRN: true,
        dispensedCount: 1,
        countedEntries: 0,
        hasPackMedPRN: true,
      },
    },
    {
      id: "4",
      name: "Cameron Lee",
      initials: "CL",
      program: "West Campus Program",
      morning: {
        total: 4,
        documented: 2,
        counted: 1,
        hasPackMed: false,
      },
      afternoon: {
        total: 2,
        documented: 2,
        counted: 2,
        hasPackMed: false,
      },
      evening: {
        total: 0,
        documented: 0,
        counted: 0,
        hasPackMed: false,
      },
      bedtime: {
        total: 2,
        documented: 0,
        counted: 0,
        hasPackMed: false,
      },
      standardOTC: { hasConsent: false, dispensed: false },
      prn: {
        hasApprovedPRN: false,
        dispensedCount: 0,
        countedEntries: 0,
        hasPackMedPRN: false,
      },
    },
    {
      id: "5",
      name: "Morgan Williams",
      initials: "MW",
      program: "West Campus Program",
      morning: {
        total: 0,
        documented: 0,
        counted: 0,
        hasPackMed: false,
      },
      afternoon: {
        total: 1,
        documented: 1,
        counted: 1,
        hasPackMed: false,
      },
      evening: {
        total: 2,
        documented: 2,
        counted: 2,
        hasPackMed: false,
      },
      bedtime: {
        total: 1,
        documented: 1,
        counted: 1,
        hasPackMed: false,
      },
      standardOTC: { hasConsent: true, dispensed: true },
      prn: {
        hasApprovedPRN: true,
        dispensedCount: 0,
        countedEntries: 0,
        hasPackMedPRN: false,
      },
    },
  ]

  const handleAddMedication = () => {
    if (selectedYouth && medicationName && dose && frequency && prescriber) {
      // In a real app, this would save to database
      console.log("Adding medication:", {
        youthId: selectedYouth,
        medicationName,
        dose,
        frequency,
        prescriber,
        instructions,
      })

      // Reset form and close dialog
      setShowAddMedicationDialog(false)
      setSelectedYouth("")
      setMedicationName("")
      setDose("")
      setFrequency("")
      setPrescriber("")
      setInstructions("")
    }
  }

  // Filter youth based on program
  const filteredYouth = mockYouthMedicationData.filter((youth) => {
    const matchesProgram =
      filterProgram === "all" || youth.program === filterProgram
    return matchesProgram
  })

  // Helper functions for status indicators
  const getStatusColor = (completed: number, total: number) => {
    if (total === 0) return null
    if (completed === 0) return "#DC2626" // Red
    if (completed < total) return "#F59E0B" // Yellow
    return "#16A34A" // Green
  }

  // Calculate totals for incomplete indicators.
  // Each unique Youth + Medication + Dosing Period record contributes exactly 1 to the
  // scheduled total, and 0 or 1 to documented/counted — never more, regardless of how many
  // Dispensation or Count Logs were submitted for that record today.
  const calculateIncompleteMedications = () => {
    let total = 0
    filteredYouth.forEach((youth) => {
      ;["morning", "afternoon", "evening", "bedtime"].forEach((period) => {
        const data = youth[(period as keyof typeof youth)] as any
        if (data && data.total > 0) {
          const effectiveDocumented = Math.min(data.documented, data.total)
          total += data.total - effectiveDocumented
        }
      })
    })
    return total
  }

  const calculateIncompleteCounts = () => {
    let total = 0
    filteredYouth.forEach((youth) => {
      ;["morning", "afternoon", "evening", "bedtime"].forEach((period) => {
        const data = youth[(period as keyof typeof youth)] as any
        if (data && data.total > 0) {
          const effectiveCounted = Math.min(data.counted, data.total)
          total += data.total - effectiveCounted
        }
      })
    })
    return total
  }

  // ── Program-origin context: keep the URL, filters and selections in step
  // with the originating Program. ──────────────────────────────────────
  const lockedProgramId =
    programContext?.status === "ok" ? programContext.id : null
  // Leaving the three review screens ends the Program-origin context (it
  // never applies to the other Administration screens).
  useEffect(() => {
    if (programContext && !inReviewSection)
      setSearchParams(
        (prev) => {
          const n = new URLSearchParams(prev)
          ;["origin", "programId"].forEach((k) => n.delete(k))
          if (!isGlobalMedicationSection(n.get("section"))) n.delete("section")
          return n
        },
        { replace: true },
      )
  }, [programContext?.status, inReviewSection])
  // The section is kept in the URL so a refresh stays on it.
  useEffect(() => {
    if (
      programContext &&
      inReviewSection &&
      searchParams.get("section") !== navSection
    )
      setSearchParams(
        (prev) => {
          const n = new URLSearchParams(prev)
          n.set("section", navSection)
          return n
        },
        { replace: true },
      )
  }, [navSection, programContext?.status])
  // A different Program (or none) replaces the previous context: the Program
  // fields follow it, and selections, other filters and open dialogs that
  // belonged to the previous one are cleared.
  const contextKey = lockedProgramId
  const [appliedContextKey, setAppliedContextKey] = useState<number | null>(
    contextKey,
  )
  useEffect(() => {
    if (appliedContextKey === contextKey) return
    setAppliedContextKey(contextKey)
    setMrhProgram(
      lockedProgramId !== null ? String(lockedProgramId) : "All Programs",
    )
    setMdFilterProgram(lockedProgramId !== null ? String(lockedProgramId) : "")
    setMcrProgram(lockedProgramId !== null ? String(lockedProgramId) : "")
    setCreateProgramId(lockedProgramId !== null ? String(lockedProgramId) : "")
    setCreateProgramError("")
    setMrhReviewType("")
    setMrhReviewer("")
    setMrhDateStart("")
    setMrhDateEnd("")
    setMrhSelectedId(null)
    setMrhViewOpen(false)
    setMrhCreateOpen(false)
    setMdCreateOpen(false)
    setMdSelectedIds([])
    setMdActiveRowId(null)
    setMdReviewOpen(false)
    setCntSelectedId(null)
    setCntFilterYouth("")
    setCntFilterMed("")
    setCntFilterPeriod("")
    setCntCreateOpen(false)
    setCntCountModalOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextKey])

  const contextError =
    programContext && programContext.status !== "ok" && inReviewSection
      ? CONTEXT_ERROR[programContext.status]
      : null
  // Saved review / medication log data that can't be read is an error with
  // a retry — never an empty list, and never a broader one.
  const dataError =
    inReviewSection &&
    !contextError &&
    (reviewRead.status === "error" || !!logReadError)
      ? reviewRead.status === "error"
        ? "Saved Med Review data could not be read. Nothing has been changed."
        : logReadError as string
      : null

  return (
    // pb-10: the fixed UtilityBar (h-10) overlays the bottom of the page, so
    // reserve its height or the last rows can't scroll clear of it.
    <div className="h-full flex flex-col overflow-hidden pb-10">
      {/* Compact Page Header - Two Rows */}
      <div
        style={{
          backgroundColor: "var(--slds-g-color-background-base)",
          borderBottom: "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        {/* Page title kept for screen readers only (visible banner removed). */}
        <h1 className="sr-only">Medications</h1>

        {/* Row 1: Program Name, Med Leader Info, and Action Buttons */}
        <div
          className="px-6 py-3 flex items-center justify-between gap-3"
          style={{
            display: (location.state as any)?.fromProgramLog ? "flex" : "none",
          }}
        >
          {/* Left: Back + Title */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <Button
              onClick={() =>
                (location.state as any)?.returnTo
                  ? navigate((location.state as any).returnTo.path)
                  : navigate("/program-log", {
                      state: {
                        programId: (location.state as any)?.programId,
                        fromProgramLogList: (location.state as any)
                          ?.fromProgramLogList,
                      },
                    })
              }
              className="h-9 px-4 rounded-full flex items-center gap-2 flex-shrink-0 slds-text-4 font-medium"
              style={{
                backgroundColor: "var(--slds-g-color-background-base)",
                color: "var(--slds-g-color-text-default)",
                border: "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <ArrowLeft className="h-4 w-4 flex-shrink-0" />
              Return to{" "}
              {(location.state as any)?.returnTo?.label ?? "Program Log"}
            </Button>
            <h1
              className="mb-0 font-medium tracking-tight whitespace-nowrap text-[16px]"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {(location.state as any)?.programName ||
                filterProgram ||
                "Medications"}
            </h1>
          </div>

          {/* Right: Med Leader pill + action buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Med Leader info pill */}
            <div
              className="flex items-center gap-2 h-[30px] px-3 rounded-[4px]"
              style={{
                backgroundColor: "var(--slds-g-color-background-alt)",
              }}
            >
              <User
                className="h-4 w-4 flex-shrink-0"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              />
              <span
                className="slds-text-3 whitespace-nowrap"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Med Leader:{" "}
                <span className="font-semibold">{currentMedLeader}</span>
              </span>
            </div>
            {/* Med Leader button */}
            <Button
              onClick={() => navigate("/med-leader")}
              className="h-8 rounded-full px-5 flex-shrink-0 slds-text-4 font-semibold"
              style={{
                backgroundColor: "#145F33",
                color: "white",
                border: "none",
              }}
            >
              Med Leader
            </Button>
            {/* Disposal button */}
            <Button
              onClick={() =>
                navigate("/manage-disposal", {
                  state: {
                    fromProgramLog: true,
                    programName: filterProgram,
                  },
                })
              }
              className="h-8 rounded-full px-5 flex-shrink-0 slds-text-4 font-semibold flex items-center gap-1.5"
              style={{
                backgroundColor: "var(--slds-g-color-background-base)",
                color: "var(--slds-g-color-text-default)",
                border: "1px solid var(--slds-g-color-border-base-1)",
              }}
              title="Navigate to Manage Disposal screen"
            >
              Manage Disposal
            </Button>
          </div>
        </div>
      </div>

      {/* App Body — Left Nav + Content */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{
          backgroundColor: "var(--slds-g-color-background-base)",
        }}
      >
        {/* ── Left Navigation Panel ───────────────────────────────────────── */}
        <nav
          // Unsaved Medication Count entries guard section changes here
          // (lib/useUnsavedChangesGuard); inert when nothing is pending.
          data-leave-guard=""
          className="flex-shrink-0 flex flex-col overflow-y-auto"
          style={{
            width: 224,
            borderRight: "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor: "var(--slds-g-color-background-alt)",
            display: (location.state as any)?.fromProgramLog ? "none" : "flex",
          }}
        >
          {/* Home — standalone above Administration */}
          <div className="pt-3 pb-1">
            <button
              onClick={() => setNavSection(MEDICATION_HOME_SECTION)}
              // The two global worklists are children of Home.
              aria-current={
                isGlobalMedicationSection(navSection) ? "page" : undefined
              }
              className="w-full px-4 py-2 text-left transition-colors"
              style={{
                backgroundColor: isGlobalMedicationSection(navSection)
                  ? "#145F33"
                  : "transparent",
                color: isGlobalMedicationSection(navSection)
                  ? "white"
                  : "var(--slds-g-color-text-default)",
                borderLeftWidth: "3px",
                borderLeftStyle: "solid",
                borderLeftColor: isGlobalMedicationSection(navSection)
                  ? "#0e4524"
                  : "transparent",
              }}
            >
              <span className="slds-text-3 font-medium leading-tight">
                Home
              </span>
            </button>
          </div>

          {/* Medication tools (section heading removed) */}
          <div
            className="pt-2 pb-2"
            style={{
              borderTop: "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            {[
              {
                id: "coderef-med-library",
                label: "Medication Library",
              },
              { id: "logs", label: "Logs" },
              {
                id: "medication-count",
                label: "Count",
              },
              { id: "disposal-admin", label: "Disposal" },
            ].map(({ id, label }) => (
              <button
                key={id}
                data-leave-guard-ignore={navSection === id ? "" : undefined}
                onClick={() => setNavSection(id)}
                className="w-full px-4 py-2 text-left transition-colors"
                style={{
                  backgroundColor:
                    navSection === id ? "#145F33" : "transparent",
                  color:
                    navSection === id
                      ? "white"
                      : "var(--slds-g-color-text-default)",
                  boxShadow:
                    navSection === id ? "inset 3px 0 0 #0e4524" : "none",
                }}
              >
                <span className="slds-text-3 font-medium leading-tight">
                  {label}
                </span>
              </button>
            ))}

            {/* Med Review Hub — expandable group */}
            {(() => {
              const medReviewIds = [
                "med-review-hub",
                "med-documentation",
                "counts",
                "cart-audit",
              ]
              const isGroupActive = medReviewIds.includes(navSection)
              return (
                <>
                  <button
                    onClick={() => {
                      if (!isGroupActive) setNavSection("med-review-hub")
                    }}
                    className="w-full px-4 py-2 text-left transition-colors flex items-center justify-between"
                    style={{
                      backgroundColor: isGroupActive
                        ? "#145F33"
                        : "transparent",
                      color: isGroupActive
                        ? "white"
                        : "var(--slds-g-color-text-default)",
                      borderLeftWidth: "3px",
                      borderLeftStyle: "solid",
                      borderLeftColor: isGroupActive
                        ? "#0e4524"
                        : "transparent",
                    }}
                  >
                    <span className="slds-text-3 font-medium leading-tight">
                      Med Review Hub
                    </span>
                    {isGroupActive ? (
                      <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                    )}
                  </button>
                  {isGroupActive &&
                    [
                      {
                        id: "med-review-hub",
                        label: "Med Review Hub",
                      },
                      {
                        id: "med-documentation",
                        label: "Med Documentation",
                      },
                      { id: "counts", label: "Count" },
                    ].map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => setNavSection(id)}
                        className="w-full pl-8 pr-4 py-1.5 text-left transition-colors"
                        style={{
                          backgroundColor:
                            navSection === id
                              ? "rgba(20,95,51,0.12)"
                              : "transparent",
                          color:
                            navSection === id
                              ? "#145F33"
                              : "var(--slds-g-color-text-default)",
                          borderLeftWidth: "3px",
                          borderLeftStyle: "solid",
                          borderLeftColor:
                            navSection === id ? "#145F33" : "transparent",
                        }}
                      >
                        <span className="slds-text-3 font-medium leading-tight">
                          {label}
                        </span>
                      </button>
                    ))}
                </>
              )
            })()}
          </div>
        </nav>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto flex flex-col"
          style={{
            backgroundColor: "var(--slds-g-color-background-base)",
          }}
        >
          {fixedProgram && (
            <div
              className="px-6 pt-3 flex items-center justify-between gap-3 flex-wrap"
              style={{
                backgroundColor: "var(--slds-g-color-background-base)",
              }}
            >
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink className="text-[14px]" asChild>
                      <button
                        type="button"
                        onClick={() => navigate("/program")}
                      >
                        Programs
                      </button>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink className="text-[14px]" asChild>
                      <button
                        type="button"
                        onClick={() => navigate(`/program/${fixedProgram.id}`)}
                      >
                        {fixedProgram.name}
                      </button>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbPage>Med Reviews</BreadcrumbPage>
                </BreadcrumbList>
              </Breadcrumb>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate(`/program/${fixedProgram.id}`)}
              >
                <ArrowLeft /> Back to Program
              </Button>
            </div>
          )}
          {dataError ? (
            <div className="flex-1 flex flex-col items-center gap-4 px-6 py-16">
              <EmptyState
                icon={TriangleAlert}
                tone="error"
                title="Med Review data could not be loaded"
                description={dataError}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  refreshMedReviewsFromStorage()
                  reloadMedicationLogs()
                }}
              >
                Try again
              </Button>
            </div>
          ) : contextError ? (
            <div className="flex-1 flex flex-col items-center gap-4 px-6 py-16">
              <EmptyState
                icon={contextError.icon}
                tone="neutral"
                title={contextError.title}
                description={contextError.description}
              />
              <Button type="button" onClick={() => navigate("/program")}>
                Back to Programs
              </Button>
            </div>
          ) : (
            <MedicationsNavContent
              {...{
                fixedProgram,
                navigate,
                location,
                getTodayDate,
                searchQuery,
                setSearchQuery,
                filterProgram,
                setFilterProgram,
                currentMedLeader,
                setCurrentMedLeader,
                selectedOverviewSection,
                setSelectedOverviewSection,
                filterDate,
                setFilterDate,
                showDeferredCounts,
                setShowDeferredCounts,
                showIncompleteWork,
                setShowIncompleteWork,
                navSection,
                setNavSection,
                canViewGlobalWorklists: canViewGlobalMedicationWorklists(scope),
                dmFilters,
                setDmFilters,
                openDocumentationIssueRecord,
                backToDocumentationIssues,
                focusReturnTo,
                gmeFilters,
                setGmeFilters,
                openDashboardRecord,
                backToDashboard,
                focusedRecordId,
                focusedRecordAvailable,
                PROGRAM_OPTIONS,
                perms: {
                  create: reviewActionAllowed("createReviewLog"),
                  edit: reviewActionAllowed("editReviewLog"),
                  review: reviewActionAllowed("reviewDocumentation"),
                  correct: reviewActionAllowed("saveCorrection"),
                  count: reviewActionAllowed("recordCount"),
                  export: reviewActionAllowed("exportReviews"),
                },
                createProgramId,
                setCreateProgramId,
                createProgramError,
                setCreateProgramError,
                saveReviewEdit,
                saveHubPeriodReview,
                MRH_REVIEW_TYPES,
                MRH_REVIEWERS,
                MRH_MOCK,
                mrhDaysSince,
                mrhProgram,
                setMrhProgram,
                mrhReviewType,
                setMrhReviewType,
                mrhReviewer,
                setMrhReviewer,
                mrhDateStart,
                setMrhDateStart,
                mrhDateEnd,
                setMrhDateEnd,
                mrhSortCol,
                setMrhSortCol,
                mrhSortDir,
                setMrhSortDir,
                mrhSelectedId,
                setMrhSelectedId,
                mrhViewOpen,
                setMrhViewOpen,
                crStartDate,
                setCrStartDate,
                crEndDate,
                setCrEndDate,
                crConcernsNoted,
                setCrConcernsNoted,
                crDetails,
                setCrDetails,
                COUNT_YOUTHS,
                COUNT_MEDS,
                COUNT_PERIODS,
                COUNT_ROWS,
                DISP_BY_ID,
                cntSelectedId,
                setCntSelectedId,
                cntFilterYouth,
                setCntFilterYouth,
                cntFilterMed,
                setCntFilterMed,
                cntFilterPeriod,
                setCntFilterPeriod,
                cntCreateOpen,
                setCntCreateOpen,
                cntCountModalOpen,
                setCntCountModalOpen,
                cntFiltered,
                saveCntReview,
                mrhCreateOpen,
                setMrhCreateOpen,
                mrhNewType,
                setMrhNewType,
                mrhNewTypeError,
                setMrhNewTypeError,
                MEDDOC_MOCK,
                MEDDOC_YOUTHS,
                MEDDOC_MEDS,
                MEDDOC_STAFF: MEDDOC_STAFF_FILTER,
                MEDDOC_CODES,
                MEDDOC_REVIEW_STATUSES,
                MEDDOC_DOSING_PERIODS,
                MEDDOC_MEDLEADERS,
                todayStr,
                weekAgoStr,
                mdStartDate,
                setMdStartDate,
                mdEndDate,
                setMdEndDate,
                mdFilterProgram,
                setMdFilterProgram,
                mdFilterYouth,
                setMdFilterYouth,
                mdFilterMed,
                setMdFilterMed,
                mdFilterStaff,
                setMdFilterStaff,
                mdFilterStaffDispensed,
                setMdFilterStaffDispensed,
                mdFilterYouthReceived,
                setMdFilterYouthReceived,
                mdFilterCodes,
                setMdFilterCodes,
                mdFilterComments,
                setMdFilterComments,
                mdFilterReviewStatus,
                setMdFilterReviewStatus,
                mdFilterDosingPeriod,
                setMdFilterDosingPeriod,
                mdSelectedIds,
                setMdSelectedIds,
                mdActiveRowId,
                setMdActiveRowId,
                mdFiltered,
                outstandingOnly,
                mdActiveRow,
                mdDispensationLogs,
                handleMdClearFilters,
                handleMdToggleAll,
                handleMdToggleRow,
                mdReviewOpen,
                setMdReviewOpen,
                mdReviewStatus,
                setMdReviewStatus,
                mdReviewAssignee,
                setMdReviewAssignee,
                mdReviewComment,
                setMdReviewComment,
                mdReviewRowIds,
                setMdReviewRowIds,
                mdReviewActiveId,
                setMdReviewActiveId,
                handleOpenMdReview,
                mdReviewRows,
                mdReviewActiveRow,
                mdReviewDispLogs,
                mdUpdateOpen,
                setMdUpdateOpen,
                handleOpenMdUpdate,
                mdUpdateTarget,
                mdUpdStaffDispensed,
                setMdUpdStaffDispensed,
                mdUpdYouthReceived,
                setMdUpdYouthReceived,
                mdUpdPrimaryCode,
                setMdUpdPrimaryCode,
                mdUpdComment,
                setMdUpdComment,
                handleSaveMdReview,
                handleSubmitMdUpdate,
                mdCreateOpen,
                setMdCreateOpen,
                mdrStartDate,
                setMdrStartDate,
                mdrEndDate,
                setMdrEndDate,
                mdrDetails,
                setMdrDetails,
                saveMdReviewLog,
                MCR_TODAY_STR,
                mcrTab,
                setMcrTab,
                mcrProgram,
                setMcrProgram,
                mcrReviewDate,
                setMcrReviewDate,
                MCR_REVIEWER,
                mcrResp,
                setMcrResp,
                mcrComment,
                setMcrComment,
                mcrRestock,
                setMcrRestock,
                mcrExpiry,
                setMcrExpiry,
                mcrDCStart,
                setMcrDCStart,
                mcrDCEnd,
                setMcrDCEnd,
                mcrDCDetails,
                setMcrDCDetails,
                mcrErrors,
                setMcrErrors,
                mcrCancelConfirm,
                setMcrCancelConfirm,
                mcrNotifyOpen,
                setMcrNotifyOpen,
                mcrNotifyCloseAfter,
                setMcrNotifyCloseAfter,
                mcrSetResp,
                mcrValidateAndSave,
                mcrHandleSave,
                mcrHistory,
                mrhFiltered,
                mrhSelectedRecord,
                isSingleProgram,
                mrhToggleSort,
                mrhLastCompleted,
                isPackMedsModalOpen,
                setIsPackMedsModalOpen,
                packMedsModalYouth,
                setPackMedsModalYouth,
                packMedsViewPack,
                setPackMedsViewPack,
                showAddMedicationDialog,
                setShowAddMedicationDialog,
                selectedYouth,
                setSelectedYouth,
                medicationName,
                setMedicationName,
                dose,
                setDose,
                frequency,
                setFrequency,
                prescriber,
                setPrescriber,
                instructions,
                setInstructions,
                mockYouthMedicationData,
                handleAddMedication,
                filteredYouth,
                getStatusColor,
                calculateIncompleteMedications,
                calculateIncompleteCounts,
              }}
            />
          )}
        </div>
      </div>

      {/* ── LEGACY DISPENSATION CONTENT PRESERVED BELOW (hidden) ─────────────
          Original morning/afternoon/evening/bedtime dispensation sections
          kept for reference. Re-expose by reverting this block.
      ──────────────────────────────────────────────────────────────────── */}
      {false && (
        <div
          className="flex-1 overflow-y-auto px-6 pb-6 pt-4"
          style={{
            backgroundColor: "var(--slds-g-color-background-base)",
          }}
        >
          <div className="space-y-4">
            {(() => {
              // Helper function to render youth row
              const renderYouthRow = (
                youth: any,
                period: "morning" | "afternoon" | "evening" | "bedtime",
              ) => {
                const data = youth[period]
                if (data.total === 0) return null

                const docColor = getStatusColor(data.documented, data.total)
                const countColor = getStatusColor(data.counted, data.total)

                return (
                  <tr
                    key={`${youth.id}-${period}`}
                    className="group hover:bg-gray-50 cursor-pointer transition-colors"
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                    onClick={() =>
                      navigate(
                        `/single-youth-dispensation?date=${filterDate}&youthId=${youth.id}`,
                        {
                          state: {
                            fromProgramLog: (location.state as any)
                              ?.fromProgramLog,
                            programId: (location.state as any)?.programId,
                            programName: (location.state as any)?.programName,
                          },
                        },
                      )
                    }
                  >
                    <td className="px-6 py-3.5">
                      <span
                        className="slds-text-4 font-medium"
                        style={{ color: "var(--color-link-blue)" }}
                      >
                        {youth.name}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span
                        className="slds-text-4"
                        style={{
                          color: "var(--slds-g-color-text-default)",
                        }}
                      >
                        {data.total}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: docColor }}
                        />
                        <span
                          className="slds-text-4"
                          style={{
                            color: "var(--slds-g-color-text-default)",
                          }}
                        >
                          {data.documented}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: countColor,
                          }}
                        />
                        <span
                          className="slds-text-4"
                          style={{
                            color: "var(--slds-g-color-text-default)",
                          }}
                        >
                          {data.counted}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      {data.hasPackMed && (
                        <Briefcase
                          className="h-5 w-5 mx-auto"
                          style={{ color: "var(--color-link-blue)" }}
                        />
                      )}
                    </td>
                  </tr>
                )
              }

              const sections = [
                {
                  id: "morning",
                  label: "Morning",
                  icon: Sunrise,
                  color: "#FFA500",
                  timeRange: "6:00 AM - 11:00 AM",
                  youths: filteredYouth.filter((y) => y.morning.total > 0),
                },
                {
                  id: "afternoon",
                  label: "Afternoon",
                  icon: Sun,
                  color: "#16A34A",
                  timeRange: "12:00 PM - 4:59 PM",
                  youths: filteredYouth.filter((y) => y.afternoon.total > 0),
                },
                {
                  id: "evening",
                  label: "Evening",
                  icon: Sunset,
                  color: "#EAB308",
                  timeRange: "5:00 PM - 7:59 PM",
                  youths: filteredYouth.filter((y) => y.evening.total > 0),
                },
                {
                  id: "bedtime",
                  label: "Bedtime",
                  icon: Moon,
                  color: "#9333EA",
                  timeRange: "8:00 PM - 11:59 PM",
                  youths: filteredYouth.filter((y) => y.bedtime.total > 0),
                },
              ]

              return (
                <>
                  {/* Scheduled Dosing Periods */}
                  {sections.map((section) => {
                    // Hide section if filtered out or no youths
                    if (
                      selectedOverviewSection !== "all" &&
                      selectedOverviewSection !== section.id
                    )
                      return null
                    if (section.youths.length === 0) return null

                    const Icon = section.icon

                    return (
                      <div
                        key={section.id}
                        className="rounded-lg overflow-hidden"
                        style={{
                          border: "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                        }}
                      >
                        {/* Section Header */}
                        <div
                          className="px-6 py-3.5 flex items-center gap-3"
                          style={{
                            backgroundColor: section.color,
                          }}
                        >
                          <Icon className="w-5 h-5 text-white" />
                          <span className="font-semibold text-[15px] text-white">
                            {section.label}
                          </span>
                          <span className="slds-text-3 ml-2 text-white opacity-90">
                            {section.timeRange}
                          </span>
                        </div>

                        {/* Youth Table */}
                        <div className="overflow-x-auto">
                          <table
                            className="w-full"
                            style={{
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-alt)",
                                  borderBottom:
                                    "2px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                <th
                                  className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider"
                                  style={{
                                    color: "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  Youth
                                </th>
                                <th
                                  className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider"
                                  style={{
                                    color: "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  Total Meds
                                </th>
                                <th
                                  className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider"
                                  style={{
                                    color: "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  Documented
                                </th>
                                <th
                                  className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider"
                                  style={{
                                    color: "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  Counted
                                </th>
                                <th
                                  className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider"
                                  style={{
                                    color: "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  Pack Med
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {section.youths.map((youth) =>
                                renderYouthRow(youth, section.id as any),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  })}

                  {/* Standard OTC Section */}
                  {(selectedOverviewSection === "all" ||
                    selectedOverviewSection === "standard-otc-prn") &&
                    filteredYouth.filter((y) => y.standardOTC.hasConsent)
                      .length > 0 && (
                      <div
                        className="rounded-lg overflow-hidden"
                        style={{
                          border: "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                        }}
                      >
                        {/* Section Header */}
                        <div
                          className="px-6 py-3.5 flex items-center gap-3"
                          style={{ backgroundColor: "#808080" }}
                        >
                          <Pill className="w-5 h-5 text-white" />
                          <span className="font-semibold text-[15px] text-white">
                            Standard OTC
                          </span>
                          <span className="slds-text-3 ml-2 text-white opacity-90">
                            Over-the-Counter Medications
                          </span>
                        </div>

                        {/* Youth Table */}
                        <div className="overflow-x-auto">
                          <table
                            className="w-full"
                            style={{
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-alt)",
                                  borderBottom:
                                    "2px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                <th
                                  className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider"
                                  style={{
                                    color: "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  Youth
                                </th>
                                <th
                                  className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider"
                                  style={{
                                    color: "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredYouth
                                .filter((y) => y.standardOTC.hasConsent)
                                .map((youth) => (
                                  <tr
                                    key={`otc-${youth.id}`}
                                    className="group hover:bg-gray-50 cursor-pointer transition-colors"
                                    style={{
                                      borderBottom:
                                        "1px solid var(--slds-g-color-border-base-1)",
                                    }}
                                    onClick={() =>
                                      navigate(
                                        `/single-youth-dispensation?date=${filterDate}&youthId=${youth.id}`,
                                        {
                                          state: {
                                            fromProgramLog:
                                              (location.state as any)
                                                ?.fromProgramLog,
                                            programId: (location.state as any)
                                              ?.programId,
                                            programName: (location.state as any)
                                              ?.programName,
                                          },
                                        },
                                      )
                                    }
                                  >
                                    <td className="px-6 py-3.5">
                                      <span
                                        className="slds-text-4 font-medium"
                                        style={{
                                          color: "var(--color-link-blue)",
                                        }}
                                      >
                                        {youth.name}
                                      </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-center">
                                      {youth.standardOTC.dispensed && (
                                        <div className="flex items-center justify-center">
                                          <CheckCircle2
                                            className="h-5 w-5"
                                            style={{
                                              color: "#16A34A",
                                            }}
                                          />
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {/* PRN Section */}
                  {(selectedOverviewSection === "all" ||
                    selectedOverviewSection === "standard-otc-prn") &&
                    filteredYouth.filter((y) => y.prn.hasApprovedPRN).length >
                      0 && (
                      <div
                        className="rounded-lg overflow-hidden"
                        style={{
                          border: "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                        }}
                      >
                        {/* Section Header */}
                        <div
                          className="px-6 py-3.5 flex items-center gap-3"
                          style={{ backgroundColor: "#000000" }}
                        >
                          <AlertCircle className="w-5 h-5 text-white" />
                          <span className="font-semibold text-[15px] text-white">
                            PRN (As Needed)
                          </span>
                          <span className="slds-text-3 ml-2 text-white opacity-90">
                            Emergency & As-Needed Medications
                          </span>
                        </div>

                        {/* Youth Table */}
                        <div className="overflow-x-auto">
                          <table
                            className="w-full"
                            style={{
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-alt)",
                                  borderBottom:
                                    "2px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                <th
                                  className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider"
                                  style={{
                                    color: "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  Youth
                                </th>
                                <th
                                  className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider"
                                  style={{
                                    color: "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  PRN Entries
                                </th>
                                <th
                                  className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider"
                                  style={{
                                    color: "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  Count Status
                                </th>
                                <th
                                  className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider"
                                  style={{
                                    color: "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  Pack Med
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredYouth
                                .filter((y) => y.prn.hasApprovedPRN)
                                .map((youth) => {
                                  const prnData = youth.prn
                                  const countColor =
                                    prnData.dispensedCount > 0
                                      ? getStatusColor(
                                          prnData.countedEntries,
                                          prnData.dispensedCount,
                                        )
                                      : null

                                  return (
                                    <tr
                                      key={`prn-${youth.id}`}
                                      className="group hover:bg-gray-50 cursor-pointer transition-colors"
                                      style={{
                                        borderBottom:
                                          "1px solid var(--slds-g-color-border-base-1)",
                                      }}
                                      onClick={() =>
                                        navigate(
                                          `/single-youth-dispensation?date=${filterDate}&youthId=${youth.id}`,
                                          {
                                            state: {
                                              fromProgramLog:
                                                (location.state as any)
                                                  ?.fromProgramLog,
                                              programId: (location.state as any)
                                                ?.programId,
                                              programName:
                                                (location.state as any)
                                                  ?.programName,
                                            },
                                          },
                                        )
                                      }
                                    >
                                      <td className="px-6 py-3.5">
                                        <span
                                          className="slds-text-4 font-medium"
                                          style={{
                                            color: "var(--color-link-blue)",
                                          }}
                                        >
                                          {youth.name}
                                        </span>
                                      </td>
                                      <td className="px-6 py-3.5 text-center">
                                        {prnData.dispensedCount > 0 && (
                                          <span
                                            className="slds-text-4 font-medium"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                            }}
                                          >
                                            {prnData.dispensedCount}
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-6 py-3.5">
                                        {prnData.dispensedCount > 0 &&
                                          countColor && (
                                            <div className="flex items-center justify-center gap-2">
                                              <div
                                                className="w-3 h-3 rounded-full"
                                                style={{
                                                  backgroundColor: countColor,
                                                }}
                                              />
                                            </div>
                                          )}
                                      </td>
                                      <td className="px-6 py-3.5 text-center">
                                        {prnData.hasPackMedPRN && (
                                          <Briefcase
                                            className="h-5 w-5 mx-auto"
                                            style={{
                                              color: "var(--color-link-blue)",
                                            }}
                                          />
                                        )}
                                      </td>
                                    </tr>
                                  )
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                </>
              )
            })()}
          </div>

          {/* Empty state - show when no sections visible */}
          {(() => {
            const hasMorningSections =
              selectedOverviewSection === "all" ||
              selectedOverviewSection === "morning"
            const hasAfternoonSections =
              selectedOverviewSection === "all" ||
              selectedOverviewSection === "afternoon"
            const hasEveningSections =
              selectedOverviewSection === "all" ||
              selectedOverviewSection === "evening"
            const hasBedtimeSections =
              selectedOverviewSection === "all" ||
              selectedOverviewSection === "bedtime"
            const hasOTCPRNSections =
              selectedOverviewSection === "all" ||
              selectedOverviewSection === "standard-otc-prn"

            const morningYouth = hasMorningSections
              ? filteredYouth.filter((y) => y.morning.total > 0).length
              : 0
            const afternoonYouth = hasAfternoonSections
              ? filteredYouth.filter((y) => y.afternoon.total > 0).length
              : 0
            const eveningYouth = hasEveningSections
              ? filteredYouth.filter((y) => y.evening.total > 0).length
              : 0
            const bedtimeYouth = hasBedtimeSections
              ? filteredYouth.filter((y) => y.bedtime.total > 0).length
              : 0
            const otcYouth = hasOTCPRNSections
              ? filteredYouth.filter((y) => y.standardOTC.hasConsent).length
              : 0
            const prnYouth = hasOTCPRNSections
              ? filteredYouth.filter((y) => y.prn.hasApprovedPRN).length
              : 0

            const totalVisible =
              morningYouth +
              afternoonYouth +
              eveningYouth +
              bedtimeYouth +
              otcYouth +
              prnYouth

            if (totalVisible === 0) {
              return (
                <div
                  className="text-center py-12 border-2 border-dashed rounded-lg mt-4"
                  style={{
                    borderColor: "var(--slds-g-color-border-base-1)",
                    backgroundColor: "var(--slds-g-color-background-alt)",
                  }}
                >
                  <Pill
                    className="h-12 w-12 mx-auto mb-3"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                  <p
                    className="text-[15px] font-medium"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    No medications found
                  </p>
                  <p
                    className="text-[13px] mt-1"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    No qualifying medications for the selected date and section
                  </p>
                </div>
              )
            }
            return null
          })()}
        </div>
      )}

      {/* Add Medication Dialog */}
      <Dialog
        open={showAddMedicationDialog}
        onOpenChange={setShowAddMedicationDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Medication</DialogTitle>
            <DialogDescription>
              Add a new medication for a youth.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="youth">Youth</Label>
              <Select value={selectedYouth} onValueChange={setSelectedYouth}>
                <SelectTrigger className="h-9 rounded-md">
                  <SelectValue placeholder="Select Youth" />
                </SelectTrigger>
                <SelectContent>
                  {YOUTH_MEDICATIONS.map((youth) => (
                    <SelectItem key={youth.id} value={youth.id.toString()}>
                      {youth.name} ({youth.program})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="medicationName">Medication Name</Label>
              <Input
                id="medicationName"
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                placeholder="e.g., Adderall XR"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dose">Dose</Label>
              <Input
                id="dose"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="e.g., 20mg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="h-9 rounded-md">
                  <SelectValue placeholder="Select Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning">Morning</SelectItem>
                  <SelectItem value="Afternoon">Afternoon</SelectItem>
                  <SelectItem value="Evening">Evening</SelectItem>
                  <SelectItem value="Bedtime">Bedtime</SelectItem>
                  <SelectItem value="Twice Daily">Twice Daily</SelectItem>
                  <SelectItem value="Three Times Daily">
                    Three Times Daily
                  </SelectItem>
                  <SelectItem value="As Needed (PRN)">
                    As Needed (PRN)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prescriber">Prescriber</Label>
              <Input
                id="prescriber"
                value={prescriber}
                onChange={(e) => setPrescriber(e.target.value)}
                placeholder="e.g., Dr. Martinez"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instructions">Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g., Take with food"
                className="h-20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-full text-[13px] shadow-none"
              style={{
                backgroundColor: "var(--slds-g-color-background-base)",
                border: "1px solid var(--slds-g-color-border-base-1)",
              }}
              onClick={() => setShowAddMedicationDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-9 rounded-full text-[13px] text-white shadow-none"
              style={{
                backgroundColor: "var(--color-brand-primary)",
              }}
              onClick={handleAddMedication}
            >
              Add Medication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ── Active Pack Meds List Modal ──────────────────────────────────── */}
      <Dialog
        open={isPackMedsModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsPackMedsModalOpen(false)
            setPackMedsViewPack(null)
          }
        }}
      >
        <DialogContent
          className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-0"
          style={{
            backgroundColor: "var(--slds-g-color-background-base)",
            border: "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          {/* Header */}
          <DialogHeader
            className="px-6 pt-5 pb-4 border-b flex-shrink-0"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
            }}
          >
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" style={{ color: "#145F33" }} />
              <DialogTitle className="text-[15px] font-semibold text-[#080707]">
                Active Pack Meds
                {packMedsModalYouth ? ` — ${packMedsModalYouth.name}` : ""}
              </DialogTitle>
            </div>
            <DialogDescription
              className="text-[13px] mt-0.5"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Viewing active medication packs. Use the eye icon to view pack
              details.
            </DialogDescription>
          </DialogHeader>

          {/* Active tab indicator */}
          <div
            className="px-4 border-b flex-shrink-0"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
              backgroundColor: "var(--slds-g-color-background-base)",
            }}
          >
            <button
              className="px-3 py-2.5 text-[13px] font-semibold relative whitespace-nowrap flex items-center gap-1.5"
              style={{
                color: "#145F33",
                borderBottom: "2px solid #145F33",
                marginBottom: "-1px",
              }}
            >
              Active
              <span
                className="slds-text-3 px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: "#e6f2eb",
                  color: "#145F33",
                }}
              >
                {packMedsModalYouth
                  ? packMedsModalYouth.name === "Jordan Chen"
                    ? 1
                    : 0
                  : 0}
              </span>
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            <div className="overflow-x-auto">
              <table
                className="w-full slds-text-4"
                style={{ minWidth: "860px" }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "var(--slds-g-color-background-alt)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    {[
                      "Pack Name",
                      "Status",
                      "Pack Type",
                      "Expected Handoff Date",
                      "Start Date",
                      "Start Time",
                      "End Date",
                      "End Time",
                      "Actions",
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-3 py-2.5 text-left slds-text-3 font-semibold whitespace-nowrap"
                        style={{
                          color: "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Mock pack data — shown only for youth with hasPackMed */}
                  {packMedsModalYouth?.name === "Jordan Chen" ? (
                    <tr
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: "var(--slds-g-color-background-base)",
                      }}
                      onMouseEnter={(e) => {
                        ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                          "var(--slds-g-color-background-alt)"
                      }}
                      onMouseLeave={(e) => {
                        ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                          "var(--slds-g-color-background-base)"
                      }}
                    >
                      <td
                        className="px-3 py-2.5 slds-text-4 font-medium"
                        style={{
                          color: "var(--slds-g-color-text-default)",
                          maxWidth: "200px",
                        }}
                      >
                        <span
                          className="block truncate"
                          title="Jordan Chen 06/22/2026-06/28/2026"
                        >
                          Jordan Chen 06/22/2026-06/28/2026
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full slds-text-3 font-medium"
                          style={{
                            backgroundColor: "#dbeafe",
                            color: "#1d4ed8",
                            border: "1px solid #93c5fd",
                          }}
                        >
                          Available
                        </span>
                      </td>
                      <td
                        className="px-3 py-2.5 slds-text-4"
                        style={{
                          color: "var(--slds-g-color-text-default)",
                        }}
                      >
                        Non-Scheduled
                      </td>
                      <td
                        className="px-3 py-2.5 slds-text-4"
                        style={{
                          color: "var(--slds-g-color-text-default)",
                        }}
                      >
                        07/01/2026
                      </td>
                      <td
                        className="px-3 py-2.5 slds-text-4"
                        style={{
                          color: "var(--slds-g-color-text-default)",
                        }}
                      >
                        06/22/2026
                      </td>
                      <td
                        className="px-3 py-2.5 slds-text-4"
                        style={{
                          color: "var(--slds-g-color-text-default)",
                        }}
                      >
                        08:00 AM
                      </td>
                      <td
                        className="px-3 py-2.5 slds-text-4"
                        style={{
                          color: "var(--slds-g-color-text-default)",
                        }}
                      >
                        06/28/2026
                      </td>
                      <td
                        className="px-3 py-2.5 slds-text-4"
                        style={{
                          color: "var(--slds-g-color-text-default)",
                        }}
                      >
                        08:00 AM
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() =>
                            setPackMedsViewPack({
                              packName: "Jordan Chen 06/22/2026-06/28/2026",
                              packStatus: "Available",
                              packType: "Non-Scheduled",
                              expectedHandoffDate: "07/01/2026",
                              startDate: "06/22/2026",
                              startTime: "08:00 AM",
                              endDate: "06/28/2026",
                              endTime: "08:00 AM",
                              recordStatus: "Active",
                              createdBy: "Sarah Johnson, MSW",
                              createdDate: "06/22/2026",
                              medications: [
                                {
                                  name: "Lexapro (Escitalopram)",
                                  dose: "20mg",
                                  frequency: "Morning",
                                },
                              ],
                            })
                          }
                          className="p-1.5 rounded transition-colors"
                          title="View pack details"
                          style={{
                            color: "var(--color-link-blue)",
                            backgroundColor: "transparent",
                          }}
                          onMouseEnter={(e) => {
                            ;(e.currentTarget as HTMLElement).style.backgroundColor =
                              "#e8f4fd"
                          }}
                          onMouseLeave={(e) => {
                            ;(e.currentTarget as HTMLElement).style.backgroundColor =
                              "transparent"
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-3 py-10 text-center slds-text-4"
                        style={{
                          color: "var(--slds-g-color-text-weak)",
                        }}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Package className="h-8 w-8 opacity-30" />
                          <span>
                            No active medication packs for this youth.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Record count footer */}
            {packMedsModalYouth?.name === "Jordan Chen" && (
              <div className="px-3 py-2">
                <span
                  className="slds-text-3"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  1 record
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter
            className="px-6 py-4 border-t flex-shrink-0"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
            }}
          >
            <Button
              variant="outline"
              onClick={() => {
                setIsPackMedsModalOpen(false)
                setPackMedsViewPack(null)
              }}
              className="h-9 px-4 rounded-full text-[13px]"
              style={{
                borderColor: "var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-weak)",
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Pack Detail View Modal (matches Dialog.png) ───────────────────── */}
      <Dialog
        open={!!packMedsViewPack}
        onOpenChange={(open) => {
          if (!open) setPackMedsViewPack(null)
        }}
      >
        <DialogContent
          className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0"
          style={{
            backgroundColor: "var(--slds-g-color-background-base)",
            border: "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          {/* Header */}
          <DialogHeader
            className="px-6 pt-5 pb-4 border-b flex-shrink-0"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
            }}
          >
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" style={{ color: "#145F33" }} />
              <DialogTitle className="text-[15px] font-semibold text-[#080707]">
                Medication Pack Details
              </DialogTitle>
            </div>
            <DialogDescription
              className="text-[13px] mt-0.5"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Viewing details for the selected medication pack.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {packMedsViewPack && (
              <>
                {/* Pack Identity */}
                <div
                  className="rounded-lg p-4 space-y-4"
                  style={{
                    backgroundColor: "var(--slds-g-color-background-alt)",
                    border: "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <div>
                    <span
                      className="slds-form-label block mb-0.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      PACK NAME
                    </span>
                    <span
                      className="slds-text-4 font-medium"
                      style={{
                        color: "var(--slds-g-color-text-default)",
                      }}
                    >
                      {packMedsViewPack.packName}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span
                        className="slds-form-label block mb-0.5"
                        style={{
                          color: "var(--slds-g-color-text-weak)",
                        }}
                      >
                        PACK STATUS
                      </span>
                      <span
                        className="slds-text-4 font-medium"
                        style={{
                          color: "var(--slds-g-color-text-default)",
                        }}
                      >
                        {packMedsViewPack.packStatus}
                      </span>
                    </div>
                    <div>
                      <span
                        className="slds-form-label block mb-0.5"
                        style={{
                          color: "var(--slds-g-color-text-weak)",
                        }}
                      >
                        PACK TYPE
                      </span>
                      <span
                        className="slds-text-4 font-medium"
                        style={{
                          color: "var(--slds-g-color-text-default)",
                        }}
                      >
                        {packMedsViewPack.packType}
                      </span>
                    </div>
                    <div>
                      <span
                        className="slds-form-label block mb-0.5"
                        style={{
                          color: "var(--slds-g-color-text-weak)",
                        }}
                      >
                        EXPECTED HANDOFF DATE
                      </span>
                      <span
                        className="slds-text-4 font-medium"
                        style={{
                          color: "var(--slds-g-color-text-default)",
                        }}
                      >
                        {packMedsViewPack.expectedHandoffDate}
                      </span>
                    </div>
                    <div>
                      <span
                        className="slds-form-label block mb-0.5"
                        style={{
                          color: "var(--slds-g-color-text-weak)",
                        }}
                      >
                        RECORD STATUS
                      </span>
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full slds-text-3 font-medium"
                        style={{
                          backgroundColor: "#dcfce7",
                          color: "#166534",
                          border: "1px solid #86efac",
                        }}
                      >
                        {packMedsViewPack.recordStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pack Date & Time */}
                <div>
                  <h4
                    className="slds-text-4 font-semibold mb-2"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Pack Date &amp; Time
                  </h4>
                  <div
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: "var(--slds-g-color-background-alt)",
                      border: "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        {
                          label: "START DATE",
                          value: packMedsViewPack.startDate,
                        },
                        {
                          label: "START TIME",
                          value: packMedsViewPack.startTime,
                        },
                        {
                          label: "END DATE",
                          value: packMedsViewPack.endDate,
                        },
                        {
                          label: "END TIME",
                          value: packMedsViewPack.endTime,
                        },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <span
                            className="slds-form-label block mb-0.5"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {label}
                          </span>
                          <span
                            className="slds-text-4 font-medium"
                            style={{
                              color: "var(--slds-g-color-text-default)",
                            }}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Medications in Pack */}
                <div>
                  <h4
                    className="slds-text-4 font-semibold mb-2"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Medications in Pack
                  </h4>
                  {packMedsViewPack.medications?.length > 0 ? (
                    <div
                      className="rounded overflow-hidden"
                      style={{
                        border: "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <table className="w-full slds-text-3">
                        <thead>
                          <tr
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-alt)",
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            {["Medication", "Dose", "Frequency"].map((h) => (
                              <th
                                key={h}
                                className="px-3 py-2.5 text-left font-semibold"
                                style={{
                                  color: "var(--slds-g-color-text-weak)",
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {packMedsViewPack.medications.map(
                            (med: any, idx: number) => (
                              <tr
                                key={idx}
                                style={{
                                  borderBottom:
                                    idx <
                                    packMedsViewPack.medications.length - 1
                                      ? "1px solid var(--slds-g-color-border-base-1)"
                                      : "none",
                                }}
                              >
                                <td
                                  className="px-3 py-2.5"
                                  style={{
                                    color: "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {med.name}
                                </td>
                                <td
                                  className="px-3 py-2.5"
                                  style={{
                                    color: "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {med.dose}
                                </td>
                                <td
                                  className="px-3 py-2.5"
                                  style={{
                                    color: "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {med.frequency}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p
                      className="slds-text-4"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      No medications assigned.
                    </p>
                  )}
                </div>

                {/* Audit */}
                <div
                  className="grid grid-cols-2 gap-4 pt-2"
                  style={{
                    borderTop: "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <div>
                    <span
                      className="slds-form-label block mb-0.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      CREATED BY
                    </span>
                    <span
                      className="slds-text-4"
                      style={{
                        color: "var(--slds-g-color-text-default)",
                      }}
                    >
                      {packMedsViewPack.createdBy}
                    </span>
                  </div>
                  <div>
                    <span
                      className="slds-form-label block mb-0.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      CREATED DATE
                    </span>
                    <span
                      className="slds-text-4"
                      style={{
                        color: "var(--slds-g-color-text-default)",
                      }}
                    >
                      {packMedsViewPack.createdDate}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <DialogFooter
            className="px-6 py-4 border-t flex-shrink-0"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
            }}
          >
            <Button
              variant="outline"
              onClick={() => setPackMedsViewPack(null)}
              className="h-9 px-4 rounded-full text-[13px]"
              style={{
                borderColor: "var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-weak)",
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
