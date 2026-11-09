import { Component, ErrorInfo, ReactNode, startTransition } from "react"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router"
import { GlobalHeader } from "./components/layout/GlobalHeader"
import { Navbar } from "./components/layout/Navbar"
import { UtilityBar } from "./components/layout/UtilityBar"
import { PassLocationAutomation } from "./lib/passLocationAutomation"

import { Toaster, toast } from "sonner"
import { useAdmissionShadowTaskReminders } from "./lib/admissionShadowReportReminders"
import { ViewModeProvider } from "./contexts/ViewModeContext"
import { PassDialogProvider } from "./contexts/PassDialogContext"

// Error Boundary to catch and display errors
import { lazy, Suspense, type ComponentType } from "react"

function lazyNamed(loader: () => Promise<unknown>, name: string) {
  return lazy(async () => {
    const module = (await loader()) as Record<string, ComponentType<any>>
    return { default: module[name] }
  })
}

const AdmissionsDashboard = lazyNamed(
  () => import("./components/pages/AdmissionsDashboard"),
  "AdmissionsDashboard",
)
const ProjectionsWaitlistDashboard = lazyNamed(
  () => import("./components/pages/ProjectionsWaitlistDashboard"),
  "ProjectionsWaitlistDashboard",
)
const ProgramLog = lazyNamed(
  () => import("./components/pages/ProgramLog"),
  "ProgramLog",
)
const ContactLog = lazyNamed(
  () => import("./components/pages/ContactLog"),
  "ContactLog",
)
const Dashboard = lazyNamed(
  () => import("./components/pages/Dashboard"),
  "Dashboard",
)
const Medications = lazyNamed(
  () => import("./components/pages/Medications"),
  "Medications",
)
const ITPModule = lazyNamed(
  () => import("./components/pages/ITPModule"),
  "ITPModule",
)
const EditITPWorkspace = lazyNamed(
  () => import("./components/pages/EditITPWorkspace"),
  "EditITPWorkspace",
)
const VerifiedItpGoalsPage = lazyNamed(
  () => import("./components/pages/VerifiedItpGoalsPage"),
  "VerifiedItpGoalsPage",
)
const IncidentReports = lazyNamed(
  () => import("./components/pages/IncidentReports"),
  "IncidentReports",
)
const YouthIRDetails = lazyNamed(
  () => import("./components/pages/YouthIRDetails"),
  "YouthIRDetails",
)
const ResidentProfilePage = lazyNamed(
  () => import("./components/pages/ResidentProfilePage"),
  "ResidentProfilePage",
)
const ConstituentProfilePage = lazyNamed(
  () => import("./components/pages/ConstituentProfileExport"),
  "ConstituentProfilePage",
)
const ConstituentLeadDetailPage = lazyNamed(
  () => import("./components/pages/ConstituentLeadDetailPage"),
  "ConstituentLeadDetailPage",
)
const PackMedsPage = lazyNamed(
  () => import("./components/pages/PackMedsPage"),
  "PackMedsPage",
)
const MedReviewPage = lazyNamed(
  () => import("./components/pages/MedReviewPage"),
  "MedReviewPage",
)
const DesignTokensPage = lazyNamed(
  () => import("./components/pages/DesignTokensPage"),
  "DesignTokensPage",
)
const MedicationDispensationPage = lazyNamed(
  () => import("./components/pages/MedicationDispensationPage"),
  "MedicationDispensationPage",
)
const SingleYouthDispensation = lazyNamed(
  () => import("./components/pages/SingleYouthDispensation"),
  "SingleYouthDispensation",
)
const MedicationCountPage = lazyNamed(
  () => import("./components/pages/MedicationCountPage"),
  "MedicationCountPage",
)
const MedLeaderListView = lazyNamed(
  () => import("./components/pages/MedLeaderListView"),
  "MedLeaderListView",
)
const ManageDisposalView = lazyNamed(
  () => import("./components/pages/ManageDisposalView"),
  "ManageDisposalView",
)
const DisposalQueue = lazyNamed(
  () => import("./components/pages/DisposalQueue"),
  "DisposalQueue",
)
const MyTasks = lazyNamed(() => import("./components/pages/MyTasks"), "MyTasks")
const Constituents = lazy(() => import("./components/pages/Constituents"))
const Programs = lazyNamed(
  () => import("./components/pages/Programs"),
  "Programs",
)
const ProgramRecordPage = lazyNamed(
  () => import("./components/pages/ProgramRecordPage"),
  "ProgramRecordPage",
)
const PassRecordPage = lazyNamed(
  () => import("./components/pages/PassRecordPage"),
  "PassRecordPage",
)
const PassListPage = lazyNamed(
  () => import("./components/pages/PassListPage"),
  "PassListPage",
)
const SubstanceTestListPage = lazyNamed(
  () => import("./components/pages/SubstanceTestListPage"),
  "SubstanceTestListPage",
)
const ProgramMedReviewsRedirect = lazyNamed(
  () => import("./components/pages/ProgramMedReviewsRedirect"),
  "ProgramMedReviewsRedirect",
)
const PassCalendarPage = lazyNamed(
  () => import("./components/pages/PassCalendarPage"),
  "PassCalendarPage",
)
const PackMedRecordPage = lazyNamed(
  () => import("./components/pages/PackMedRecordPage"),
  "PackMedRecordPage",
)
const Classes = lazyNamed(() => import("./components/pages/Classes"), "Classes")
const Reports = lazyNamed(() => import("./components/pages/Reports"), "Reports")
const ReportView = lazyNamed(
  () => import("./components/pages/Reports"),
  "ReportView",
)
const CommunityCarePage = lazyNamed(
  () => import("./components/pages/CommunityCarePage"),
  "CommunityCarePage",
)
const CommunityCareMemberPage = lazyNamed(
  () => import("./components/pages/CommunityCareMemberPage"),
  "CommunityCareMemberPage",
)
const LearningModules = lazyNamed(
  () => import("./components/pages/LearningModules"),
  "LearningModules",
)
const TutorModule = lazyNamed(
  () => import("./components/pages/TutorModule"),
  "TutorModule",
)
const ConnectionsPage = lazyNamed(
  () => import("./components/pages/ConnectionsPage"),
  "ConnectionsPage",
)
const TutorApplications = lazyNamed(
  () => import("./components/pages/TutorApplications"),
  "TutorApplications",
)
const TutorSearch = lazyNamed(
  () => import("./components/pages/TutorSearch"),
  "TutorSearch",
)
const TutorApplicantRecordPage = lazyNamed(
  () => import("./components/pages/TutorApplicantRecordPage"),
  "TutorApplicantRecordPage",
)
const FriendsFirstApplications = lazyNamed(
  () => import("./components/pages/FriendsFirstApplications"),
  "FriendsFirstApplications",
)
const FriendsFirstMentorMatches = lazyNamed(
  () => import("./components/pages/FriendsFirstMentorMatches"),
  "FriendsFirstMentorMatches",
)
const FriendsFirstMatchRecordPage = lazyNamed(
  () => import("./components/pages/FriendsFirstMatchRecordPage"),
  "FriendsFirstMatchRecordPage",
)
const FriendsFirstMentorSearch = lazyNamed(
  () => import("./components/pages/FriendsFirstMentorSearch"),
  "FriendsFirstMentorSearch",
)
const FriendsFirstMentorRecordPage = lazyNamed(
  () => import("./components/pages/FriendsFirstMentorRecordPage"),
  "FriendsFirstMentorRecordPage",
)
const FriendsFirstMenteeSearch = lazyNamed(
  () => import("./components/pages/FriendsFirstMenteeSearch"),
  "FriendsFirstMenteeSearch",
)
const FriendsFirstMenteeRecordPage = lazyNamed(
  () => import("./components/pages/FriendsFirstMenteeRecordPage"),
  "FriendsFirstMenteeRecordPage",
)
const FriendsFirstMenteeReferral = lazyNamed(
  () => import("./components/pages/FriendsFirstMenteeReferral"),
  "FriendsFirstMenteeReferral",
)
const DocumentsChecklist = lazyNamed(
  () => import("./components/admissions/DocumentsChecklist"),
  "DocumentsChecklist",
)
class ErrorBoundary extends Component<{ children: ReactNode }, {
  hasError: boolean
  error: Error | null
}> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    // Suspension during synchronous rendering (Figma Make inspector uses flushSync).
    // Return unchanged state so React retries in async mode where Suspense works.
    if (
      error.message?.includes("suspended while responding to synchronous input")
    ) {
      return { hasError: false, error: null }
    }
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (
      error.message?.includes("suspended while responding to synchronous input")
    )
      return
    console.error("ErrorBoundary caught:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: "monospace" }}>
          <h1 style={{ color: "red" }}>Application Error</h1>
          <p>
            <strong>Error:</strong> {this.state.error?.message}
          </p>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f5f5f5",
              padding: 16,
              borderRadius: 8,
              fontSize: 12,
            }}
          >
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: 16,
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()

  // Admission Shadow Report reminders/escalation (US 17656-D): one app-wide
  // evaluator; the toast shows the prototype what was sent and to whom.
  useAdmissionShadowTaskReminders((events) =>
    events.forEach((e) =>
      toast.info(
        `${e.notifications[0].content.title}: sent to ${e.notifications.map((n) => n.recipient.name).join(", ")}.`,
      ),
    ),
  )

  // Determine active tab from route
  const getActiveTab = () => {
    if (location.pathname.startsWith("/resident/")) return "Dashboard"
    if (location.pathname.startsWith("/constituent/")) return "Constituents"
    if (location.pathname.startsWith("/constituents")) return "Constituents"
    if (location.pathname === "/community-care/my-members") return "CC My Members"
    if (location.pathname === "/community-care/my-tasks") return "CC My Tasks"
    if (location.pathname.startsWith("/community-care")) return "Community Care"
    if (location.pathname.startsWith("/youth/")) return "Dashboard"
    if (location.pathname === "/pack-meds") return "Medications"
    if (location.pathname === "/med-review") return "Medications"
    if (location.pathname === "/contact-log") return "Contact Log"
    if (location.pathname === "/connections") return "Connections"
    if (location.pathname === "/dashboard") return "Dashboard"
    if (location.pathname === "/projections-waitlist")
      return "Projections & Waitlist"
    if (location.pathname === "/program") return "Program"
    if (location.pathname.startsWith("/program/")) return "Program"
    // Legacy Substance Tests path (redirects into /program/:id/…).
    if (location.pathname === "/substance-tests") return "Program"
    if (location.pathname === "/pass" || location.pathname.startsWith("/pass/"))
      return "Pass"
    if (location.pathname === "/program-log") return "Program Log"
    if (location.pathname === "/medications") return "Medications"
    if (location.pathname === "/itp-module") return "ITPs"
    if (location.pathname === "/incident-reports") return "Incident Reports"
    if (location.pathname === "/classes") return "Classes"
    if (
      location.pathname === "/reports" ||
      location.pathname.startsWith("/reports/")
    )
      return "Reports"
    if (location.pathname === "/tutor-applications") return "Applications"
    if (location.pathname === "/tutor") return "Tutor Matches"
    if (location.pathname === "/tutor-search") return "Tutor Search"
    if (location.pathname.startsWith("/tutor-applicant/")) return "Applications"
    if (location.pathname === "/friends-first-applications")
      return "FF Applications"
    if (
      location.pathname === "/friends-first-mentor-match" ||
      location.pathname.startsWith("/friends-first-mentor-match/")
    )
      return "Mentor Match"
    if (location.pathname === "/friends-first-mentor-search")
      return "Mentor Search"
    if (location.pathname === "/friends-first-mentee-search")
      return "Mentee Search"
    if (location.pathname === "/friends-first-mentee-referral")
      return "Mentee Referral"
    if (location.pathname.startsWith("/friends-first-mentor/"))
      return "FF Applications"
    if (location.pathname.startsWith("/friends-first-mentee/"))
      return "Mentee Search"
    return "Admissions"
  }

  const activeTab = getActiveTab()

  // Navigation Handler
  const handleTabChange = (tab: string) => {
    startTransition(() => {
      switch (tab) {
        case "Admissions":
          navigate("/")
          break
        case "Contact Log":
          navigate("/contact-log")
          break
        case "Connections":
          navigate("/connections")
          break
        case "Constituents":
          navigate("/constituents")
          break
        case "Community Care":
          navigate("/community-care")
          break
        case "CC My Members":
          navigate("/community-care/my-members")
          break
        case "CC My Tasks":
          navigate("/community-care/my-tasks")
          break
        case "Dashboard":
          navigate("/dashboard")
          break
        case "Projections & Waitlist":
          navigate("/projections-waitlist")
          break
        case "Program":
          navigate("/program")
          break
        case "Program Log":
          navigate("/program-log")
          break
        case "Pass":
          navigate("/pass")
          break
        case "Medications":
          navigate("/medications")
          break
        case "ITPs":
          navigate("/itp-module")
          break
        case "Incident Reports":
          navigate("/incident-reports")
          break
        case "Classes":
          navigate("/classes")
          break
        case "Reports":
          navigate("/reports")
          break
        case "Applications":
          navigate("/tutor-applications")
          break
        case "Tutor Matches":
          navigate("/tutor")
          break
        case "Tutor Search":
          navigate("/tutor-search")
          break
        case "FF Applications":
          navigate("/friends-first-applications")
          break
        case "Mentor Match":
          navigate("/friends-first-mentor-match")
          break
        case "Mentor Search":
          navigate("/friends-first-mentor-search")
          break
        case "Mentee Search":
          navigate("/friends-first-mentee-search")
          break
        case "Mentee Referral":
          navigate("/friends-first-mentee-referral")
          break
        default:
          navigate("/")
      }
    })
  }

  // Check if we're on a profile page or Pack Meds page or Med Review page (pages that should hide navbar)
  const isProfilePage =
    location.pathname.startsWith("/resident/") ||
    (location.pathname.startsWith("/constituent/") &&
      location.pathname !== "/constituents") ||
    location.pathname.startsWith("/youth/") ||
    location.pathname === "/pack-meds" ||
    location.pathname === "/med-review" ||
    location.pathname === "/med-leader" ||
    location.pathname === "/manage-disposal" ||
    location.pathname === "/disposal-queue" ||
    location.pathname === "/design-tokens" ||
    location.pathname === "/my-tasks" ||
    location.pathname.startsWith("/itp-module/") ||
    location.pathname.startsWith("/youth-ir-details/") ||
    location.pathname.startsWith("/dispense/") ||
    location.pathname === "/single-youth-dispensation"

  return (
    <div className="h-screen flex flex-col bg-background font-sans text-foreground overflow-hidden">
      {/* Global App Header */}
      <GlobalHeader />
      {/* Pass start → Current Location automation (20043), app-wide */}
      <PassLocationAutomation />

      {/* Navigation Bar - Hide on profile pages */}
      {!isProfilePage && (
        <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
      )}

      {/* Main Page Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#f3f4f6]">
        <ErrorBoundary>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<AdmissionsDashboard />} />
              <Route path="/contact-log" element={<ContactLog />} />
              <Route path="/constituents" element={<Constituents />} />
              <Route
                path="/constituents/:id"
                element={<ConstituentLeadDetailPage />}
              />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/projections-waitlist"
                element={<ProjectionsWaitlistDashboard />}
              />
              <Route path="/program" element={<Programs />} />
              <Route path="/program/new" element={<ProgramRecordPage />} />
              <Route path="/program/:id/edit" element={<ProgramRecordPage />} />
              <Route path="/program/:id" element={<ProgramRecordPage />} />
              {/* Pass List (19992) + Pass Record (19998). Static /pass/new is
                matched before the /pass/:id param route by React Router's
                ranking, independent of order. */}
              <Route path="/pass" element={<PassListPage />} />
              {/* Pass Calendar (20041) — static segment, ranked above /pass/:id */}
              <Route path="/pass/calendar" element={<PassCalendarPage />} />
              <Route path="/pass/new" element={<PassRecordPage />} />
              <Route path="/pass/:id/edit" element={<PassRecordPage />} />
              <Route path="/pass/:id" element={<PassRecordPage />} />
              {/* Program Substance Tests (20065) — nested under the Program
                (ranked apart from /program/:id and /program/:id/edit). The
                old /substance-tests path stays for compatibility and
                redirects when it carries Program state. */}
              <Route
                path="/program/:id/substance-tests"
                element={<SubstanceTestListPage />}
              />
              <Route
                path="/substance-tests"
                element={<SubstanceTestListPage />}
              />
              {/* Program Med Reviews (20128): old page URL → Medications > Med Review Hub. */}
              <Route
                path="/program/:id/med-reviews"
                element={<ProgramMedReviewsRedirect />}
              />
              <Route path="/program-log" element={<ProgramLog />} />
              <Route path="/medications" element={<Medications />} />
              <Route path="/med-leader" element={<MedLeaderListView />} />
              <Route path="/manage-disposal" element={<ManageDisposalView />} />
              <Route path="/disposal-queue" element={<DisposalQueue />} />
              <Route
                path="/single-youth-dispensation"
                element={<SingleYouthDispensation />}
              />
              <Route path="/incident-reports" element={<IncidentReports />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/:reportId" element={<ReportView />} />
              <Route path="/community-care" element={<CommunityCarePage />} />
              <Route
                path="/community-care/my-members"
                element={<CommunityCarePage key="my-members" view="my-members" />}
              />
              <Route
                path="/community-care/my-tasks"
                element={<CommunityCarePage key="my-tasks" view="my-tasks" />}
              />
              <Route
                path="/community-care/:id"
                element={<CommunityCareMemberPage />}
              />
              <Route path="/learning-modules" element={<LearningModules />} />
              <Route
                path="/tutor-applications"
                element={<TutorApplications />}
              />
              <Route path="/tutor" element={<TutorModule />} />
              <Route path="/connections" element={<ConnectionsPage />} />
              <Route path="/tutor-search" element={<TutorSearch />} />
              <Route
                path="/tutor-applicant/:id"
                element={<TutorApplicantRecordPage />}
              />
              <Route
                path="/friends-first-applications"
                element={<FriendsFirstApplications />}
              />
              <Route
                path="/friends-first-mentor-match"
                element={<FriendsFirstMentorMatches />}
              />
              <Route
                path="/friends-first-mentor-match/:matchId"
                element={<FriendsFirstMatchRecordPage />}
              />
              <Route
                path="/friends-first-mentor-search"
                element={<FriendsFirstMentorSearch />}
              />
              <Route
                path="/friends-first-mentor/:id"
                element={<FriendsFirstMentorRecordPage />}
              />
              <Route
                path="/friends-first-mentee-search"
                element={<FriendsFirstMenteeSearch />}
              />
              <Route
                path="/friends-first-mentee/:id"
                element={<FriendsFirstMenteeRecordPage />}
              />
              <Route
                path="/friends-first-mentee-referral"
                element={<FriendsFirstMenteeReferral />}
              />
              <Route path="/resident/:id" element={<ResidentProfilePage />} />
              <Route
                path="/constituent/:id"
                element={<ConstituentProfilePage />}
              />
              <Route path="/youth/:id" element={<ConstituentProfilePage />} />
              <Route
                path="/youth/:id/medication-count"
                element={<MedicationCountPage />}
              />
              <Route path="/pack-meds" element={<PackMedsPage />} />
              {/* Pack Med record (20042) */}
              <Route path="/pack-med/:id" element={<PackMedRecordPage />} />
              <Route path="/med-review" element={<MedReviewPage />} />
              <Route path="/design-tokens" element={<DesignTokensPage />} />
              <Route path="/my-tasks" element={<MyTasks />} />
              <Route path="/itp-module" element={<ITPModule />} />
              {/* Verified ITP goals (US 20103): ITP id from the compliance
                records; separate from the sample ITP workspaces. */}
              <Route
                path="/itp-module/verified/:itpId"
                element={<VerifiedItpGoalsPage />}
              />
              <Route path="/itp-module/:id" element={<EditITPWorkspace />} />
              <Route
                path="/itp-module/:id/edit"
                element={<EditITPWorkspace />}
              />
              <Route
                path="/youth-ir-details/:id"
                element={<YouthIRDetails />}
              />
              <Route
                path="/admissions/documents-checklist"
                element={<DocumentsChecklist />}
              />
              <Route
                path="/dispense/:youthId/:timeframe"
                element={<MedicationDispensationPage />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      <UtilityBar />
      <Toaster position="top-right" richColors />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ViewModeProvider>
        <ErrorBoundary>
          {/* Hosts the Pass record modal over whatever page is open */}
          <PassDialogProvider>
            <AppContent />
          </PassDialogProvider>
        </ErrorBoundary>
      </ViewModeProvider>
    </BrowserRouter>
  )
}
