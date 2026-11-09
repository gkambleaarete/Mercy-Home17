import {
  useState,
  useEffect,
  useRef,
  useContext,
  Fragment,
} from "react";
import {
  ClipboardList,
  ArrowLeft,
  Download,
  Copy,
  Check,
  Type,
  Grid3X3,
  Square,
  Layers,
  ChevronRight,
  Users,
  FileText,
  Calendar as CalendarIcon,
  Clock,
  Bell,
  Search,
  Settings,
  HelpCircle,
  Plus,
  Home,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  Filter,
  MoreHorizontal,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  X,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Star,
  Heart,
  Shield,
  Activity,
  BarChart3,
  PieChart,
  MapPin,
  Phone,
  Mail,
  User,
  Briefcase,
  GraduationCap,
  Stethoscope,
  Scale,
  BookOpen,
  MessageSquare,
  Paperclip,
  Upload,
  ExternalLink,
  RefreshCw,
  Zap,
  Target,
  Award,
  Flag,
  ChevronLeft,
  PanelLeft,
  Sliders,
  Hash,
  ToggleLeft,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Circle,
  Tag,
  ArrowRight,
  Pill,
} from "@/app/lib/lucide-icons";
import {
  ShowcaseCard,
  usePatternAnchor,
  PatternIdBadge,
  CopyCSSBtn,
  PatternFilterContext,
  PatternSection,
} from "./components-showcase/ShowcaseCard";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "../ui/alert";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../ui/avatar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Progress } from "../ui/progress";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../ui/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../ui/tooltip";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../ui/popover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { PageHeader } from "../ui/page-header";
import { EmptyState } from "../ui/empty-state";
import { ContactMetaRow } from "../ui/contact-meta-row";
import {
  Stepper,
  CHEVRON_TONE,
  type StepStatus,
} from "../ui/stepper";
import { DownloadCard } from "../ui/download-card";
import {
  StatusIndicatorRow,
  STATUS_INDICATOR_TONE,
  type StatusIndicatorTone,
} from "../ui/status-indicator-row";
import { Timeline } from "../ui/timeline";
import {
  AlertIconCluster,
  ALERT_ICON_META,
  type AlertIconKind,
} from "../ui/alert-icon-cluster";
import {
  SideNav,
  SideNavItem,
  SideNavGroup,
  SideNavSubItem,
  SideNavSectionLabel,
} from "../ui/side-nav";
import { Input } from "../ui/input";
import { cn } from "../ui/utils";
import { ButtonsSection } from "./components-showcase/ButtonsSection";
import {
  AccordionSection,
  AlertDialogSection,
  CalendarSection,
  DatePickerSection,
  DrawerSection,
  DropdownSection,
  OtpSection,
  PaginationSection,
  RadioSection,
  SliderSection,
  TextareaSection,
  ToastSection,
  ToggleGroupSection,
  ToggleSection,
} from "./components-showcase/NewComponentSections";
import {
  DialogSection,
  KPICardsSection,
  FormControlsSection,
  DataTableSection,
} from "./components-showcase/ExtractedSections";
import {
  StarRatingSection,
  SSNFieldSection,
  DocumentAgreementSection,
  SignaturePadSection,
  MentorMatchSection,
} from "./components-showcase/VMSPortedSections";

// ─── Nav config ─────────────────────────────────────────────────────────────

const NAV_ITEMS: {
  id: string;
  label: string;
  icon: React.ElementType;
}[] = [
  {
    id: "sec-accordion",
    label: "Accordion",
    icon: ChevronDown,
  },
  {
    id: "sec-alert-dialog",
    label: "Alert Dialog",
    icon: AlertTriangle,
  },
  { id: "sec-alerts", label: "Alerts", icon: Bell },
  { id: "sec-avatars", label: "Avatars", icon: User },
  { id: "sec-breadcrumbs", label: "Breadcrumbs", icon: Home },
  { id: "sec-buttons", label: "Buttons", icon: Square },
  { id: "sec-calendar", label: "Calendar", icon: CalendarIcon },
  { id: "sec-cards", label: "Cards", icon: Square },
  { id: "sec-data-table", label: "Data Table", icon: FileText },
  {
    id: "sec-data-vis",
    label: "Data Visualization",
    icon: PieChart,
  },
  {
    id: "sec-dialog",
    label: "Dialog/Modal",
    icon: MessageSquare,
  },
  {
    id: "sec-drawer",
    label: "Drawer / Sheet",
    icon: PanelLeft,
  },
  {
    id: "sec-empty-states",
    label: "Empty States",
    icon: HelpCircle,
  },
  {
    id: "sec-form-controls",
    label: "Form Controls",
    icon: Edit,
  },
  { id: "sec-textarea", label: "Textarea", icon: Type },
  {
    id: "sec-dropdown",
    label: "Dropdown Menu",
    icon: MoreHorizontal,
  },
  { id: "sec-radio", label: "Radio", icon: Circle },
  {
    id: "sec-toggle-group",
    label: "Toggle Group",
    icon: Layers,
  },
  { id: "sec-toggle", label: "Toggle", icon: ToggleLeft },
  { id: "sec-otp", label: "OTP Input", icon: Hash },
  {
    id: "sec-pagination-sub",
    label: "Pagination",
    icon: ChevronRight,
  },
  {
    id: "sec-date-picker",
    label: "Date Picker",
    icon: CalendarIcon,
  },
  {
    id: "sec-icon-library",
    label: "Icon Library",
    icon: Layers,
  },
  { id: "sec-kpi-cards", label: "KPI Cards", icon: BarChart3 },
  { id: "sec-progress", label: "Progress", icon: Activity },
  {
    id: "sec-stage-progress",
    label: "Stage Progress",
    icon: Flag,
  },
  {
    id: "sec-alert-icons",
    label: "Alert Icon Cluster",
    icon: Heart,
  },
  {
    id: "sec-contact-meta",
    label: "Contact Meta Row",
    icon: Phone,
  },
  {
    id: "sec-record-header",
    label: "Record Header",
    icon: ClipboardList,
  },
  {
    id: "sec-sf-downloads",
    label: "SF Downloads",
    icon: Download,
  },
  { id: "sec-slider", label: "Slider", icon: Sliders },
  {
    id: "sec-status-badges",
    label: "Status Badges",
    icon: Tag,
  },
  {
    id: "sec-side-nav",
    label: "Side Navigation",
    icon: PanelLeft,
  },
  {
    id: "sec-status-row",
    label: "Status Indicator Row",
    icon: Pill,
  },
  { id: "sec-tabs", label: "Tabs", icon: Layers },
  { id: "sec-timeline", label: "Timeline", icon: Clock },
  { id: "sec-toast", label: "Toast", icon: Zap },
  { id: "sec-tooltips", label: "Tooltips", icon: Info },
  { id: "sec-star-rating", label: "Star Rating", icon: Star },
  { id: "sec-ssn-field", label: "Masked SSN Field", icon: Eye },
  {
    id: "sec-document-agreement",
    label: "Document Agreement",
    icon: FileText,
  },
  {
    id: "sec-signature-pad",
    label: "E-Signature Pad",
    icon: Edit,
  },
  {
    id: "sec-mentor-match",
    label: "Mentor Search & Match",
    icon: Users,
  },
];

// ─── Shared helpers ──────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        const fallback = () => {
          const el = document.createElement("textarea");
          el.value = text;
          el.style.position = "fixed";
          el.style.opacity = "0";
          document.body.appendChild(el);
          el.select();
          document.execCommand("copy");
          document.body.removeChild(el);
        };
        (
          navigator.clipboard?.writeText(text) ??
          Promise.reject()
        ).catch(fallback);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="p-1 rounded hover:bg-[#f3f2f2] transition-colors"
      title="Copy"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-[#2e844a]" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-[#706e6b]" />
      )}
    </button>
  );
}

function AlertRow({
  id,
  icon: AI,
  variant,
  msg,
  detail,
  cssCode,
  actionLabel,
}: {
  id: string;
  icon: React.ElementType;
  variant: "success" | "info" | "warning" | "error";
  msg: string;
  detail: string;
  cssCode: string;
  /** Optional call-to-action link (e.g. "Resume", "Retry") -- same idea
   * as Actionable Banner's actionLabel, now available on the real Alert
   * component itself via its `action` prop. Omit for a plain alert. */
  actionLabel?: string;
}) {
  const filter = useContext(PatternFilterContext);
  const { ref, pulsing, idCopied, cssCopied, copyId, copyCss } =
    usePatternAnchor(id);

  if (
    filter &&
    id &&
    !id.toUpperCase().includes(filter.toUpperCase())
  ) {
    return null;
  }

  return (
    <div className="group">
      <Alert
        ref={ref}
        id={id}
        variant={variant}
        dismissible
        action={
          actionLabel ? { label: actionLabel } : undefined
        }
        className={pulsing ? "showcase-card-pulse" : undefined}
        style={{ scrollMarginTop: "24px" }}
      >
        <AI className="h-5 w-5" />
        <AlertTitle>{msg}</AlertTitle>
        <AlertDescription>{detail}</AlertDescription>
      </Alert>
      {/* Showcase-only chrome (ID badge / Copy CSS) -- kept out of Alert's
          own top-right corner so it never competes for space with a real
          alert's own action link + dismiss button. */}
      <div className="mt-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <PatternIdBadge
          id={id}
          idCopied={idCopied}
          cssCopied={cssCopied}
          onCopyId={copyId}
          onCopyCss={() => copyCss(cssCode)}
          cssCode={cssCode}
        />
      </div>
    </div>
  );
}

function SectionHdr({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon
          className="h-5 w-5"
          style={{ color: "#145F33" }}
        />
        <h2
          style={{
            fontSize: "var(--slds-g-font-size-8)",
            fontWeight: 500,
          }}
        >
          {title}
        </h2>
      </div>
      <p
        style={{
          fontSize: "var(--slds-g-font-size-5)",
          color: "var(--slds-g-color-text-weak)",
        }}
      >
        {desc}
      </p>
    </div>
  );
}

function SideNavDemo() {
  const [navSection, setNavSection] = useState("home");
  const medReviewIds = [
    "med-review-hub",
    "med-documentation",
    "counts",
    "cart-audit",
  ];
  const isGroupActive = medReviewIds.includes(navSection);

  return (
    <SideNav>
      <div className="pt-3 pb-1">
        <SideNavItem
          active={navSection === "home"}
          onClick={() => setNavSection("home")}
        >
          Home
        </SideNavItem>
      </div>

      <div className="pt-2 pb-2 border-t border-[var(--slds-g-color-border-base-1)]">
        <SideNavSectionLabel>
          Administration
        </SideNavSectionLabel>
        {[
          {
            id: "coderef-med-library",
            label: "Medication Library",
          },
          { id: "logs", label: "Logs" },
          { id: "disposal-admin", label: "Disposal" },
          { id: "pack-meds-admin", label: "Pack Meds" },
        ].map(({ id, label }) => (
          <SideNavItem
            key={id}
            active={navSection === id}
            onClick={() => setNavSection(id)}
          >
            {label}
          </SideNavItem>
        ))}

        <SideNavGroup
          active={isGroupActive}
          expanded={isGroupActive}
          onClick={() => {
            if (!isGroupActive) setNavSection("med-review-hub");
          }}
          label="Med Review Hub"
        >
          {[
            { id: "med-review-hub", label: "Med Review Hub" },
            {
              id: "med-documentation",
              label: "Med Documentation",
            },
            { id: "counts", label: "Count" },
            { id: "cart-audit", label: "Med Cart" },
          ].map(({ id, label }) => (
            <SideNavSubItem
              key={id}
              active={navSection === id}
              onClick={() => setNavSection(id)}
            >
              {label}
            </SideNavSubItem>
          ))}
        </SideNavGroup>

        <SideNavItem
          active={navSection === "audits-reports"}
          onClick={() => setNavSection("audits-reports")}
        >
          Medication Weekly / Monthly Audits &amp; Reports
        </SideNavItem>
      </div>
    </SideNav>
  );
}

function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateSalesforceTokensJSON(): string {
  return JSON.stringify(
    {
      _meta: {
        name: "Mercy Home - Salesforce Mapping",
        generatedDate: new Date().toISOString(),
      },
      brandBand: {
        colorBrand: "#145F33",
        colorBrandDark: "#0d4424",
        colorBrandLight: "#1a7a42",
        colorBrandSecondary: "#A82031",
        colorBrandAccent: "#E86C24",
      },
      componentOverrides: {
        button: {
          "color-background-brand": "#145F33",
          "color-background-brand-hover": "#0d4424",
          "border-radius": "0.25rem",
        },
        card: {
          "border-radius": "0.5rem",
          "color-background": "#ffffff",
          shadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
        },
        input: {
          "border-radius": "0.25rem",
          "color-border": "#dddbda",
          "color-border-focus": "#145F33",
        },
        badge: {
          referral: { bg: "#e6f4ea", text: "#145F33" },
          infoSession: { bg: "#e0f2fe", text: "#005EA2" },
          programWaitlist: { bg: "#fef3c7", text: "#92400e" },
          delayed: { bg: "#fce4ec", text: "#A82031" },
          closed: { bg: "#f3f2f2", text: "#706e6b" },
        },
      },
      statusColors: {
        Referral: "#145F33",
        "Info Session": "#005EA2",
        "Program Waitlist": "#E86C24",
        Delayed: "#A82031",
        Closed: "#706e6b",
      },
    },
    null,
    2,
  );
}

function generateAllTokensJSON(): string {
  return JSON.stringify(
    {
      _meta: {
        name: "Mercy Home for Boys & Girls",
        description: "SLDS 2 Design Tokens",
        generatedDate: new Date().toISOString(),
        version: "1.0.0",
      },
      brand: {
        "--color-brand-primary": "#145F33",
        "--color-brand-secondary": "#A82031",
        "--color-brand-tertiary": "#183242",
        "--color-brand-accent": "#E86C24",
        "--color-link-blue": "#005EA2",
      },
      chartColors: {
        "--chart-1": "#145F33",
        "--chart-2": "#A82031",
        "--chart-3": "#183242",
        "--chart-4": "#E86C24",
        "--chart-5": "#005EA2",
      },
    },
    null,
    2,
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function ComponentsTabContent({
  defaultFilter = "",
  onClearFilter,
}: {
  defaultFilter?: string;
  onClearFilter?: () => void;
}) {
  // ── pattern filter (from URL hash deep-link) ──
  const [patternFilter, setPatternFilter] =
    useState(defaultFilter);
  useEffect(() => {
    setPatternFilter(defaultFilter);
  }, [defaultFilter]);

  // ── existing state ──
  const [hoveredRow, setHoveredRow] = useState<number | null>(
    null,
  );
  const [iconSearch, setIconSearch] = useState("");

  // ── nav state ──
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const [activeSection, setActiveSection] =
    useState("sec-accordion");
  const rootRef = useRef<HTMLDivElement>(null);
  const navListRef = useRef<HTMLDivElement>(null);
  const [navHeight, setNavHeight] = useState<string>("100vh");

  // ── card pattern anchors ──
  const crd05 = usePatternAnchor("CRD-05");

  // ── dialog ──

  // ── scroll spy ──
  // Note: NAV_ITEMS is sorted alphabetically for lookup, NOT in physical
  // page order, so we can't rely on array order to find the "topmost"
  // visible section. We track every section's live position on scroll
  // instead of IntersectionObserver, which had two problems: entries in
  // a batch aren't guaranteed to arrive in page order (so the *last*
  // entry processed — not necessarily the topmost — silently won,
  // causing the desync), and observed nodes go stale forever once a
  // section unmounts/remounts (e.g. when a deep-link pattern filter is
  // applied then cleared), since it only attached once on mount.
  //
  // This component is embedded inside a parent with its own
  // overflow-y:auto wrapper (not the window), so the listener has to
  // attach to whichever ancestor is actually scrolling — found at
  // runtime by walking up from the root, with window as a fallback if
  // none is found (e.g. if this is ever rendered standalone).
  function findScrollParent(
    node: HTMLElement | null,
  ): HTMLElement | Window {
    let el = node?.parentElement || null;
    while (el) {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      if (
        (overflowY === "auto" || overflowY === "scroll") &&
        el.scrollHeight >= el.clientHeight
      ) {
        return el;
      }
      el = el.parentElement;
    }
    return window;
  }

  // The left nav is `position: sticky` with its own internal scroll,
  // sized to fill the visible viewport of whichever ancestor actually
  // scrolls. Plain `height: 100vh` breaks here because this page is
  // nested inside a shorter overflow-y:auto wrapper (below a page
  // header + tab bar) — 100vh measures the full browser viewport, which
  // is taller than that wrapper's real visible height, so the nav's own
  // bottom items end up clipped below the fold with no way to reach
  // them by scrolling (sticky pins the top, so the excess height at the
  // bottom is simply unreachable). We measure the real scroll parent's
  // clientHeight instead and keep it in sync on resize.
  useEffect(() => {
    const scrollParent = findScrollParent(rootRef.current);

    function updateHeight() {
      if (scrollParent instanceof Window) {
        setNavHeight("100vh");
      } else {
        setNavHeight(`${scrollParent.clientHeight}px`);
      }
    }

    updateHeight();
    window.addEventListener("resize", updateHeight);
    let resizeObserver: ResizeObserver | undefined;
    if (
      !(scrollParent instanceof Window) &&
      typeof ResizeObserver !== "undefined"
    ) {
      resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(scrollParent);
    }
    return () => {
      window.removeEventListener("resize", updateHeight);
      resizeObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    const scrollParent = findScrollParent(rootRef.current);
    const ids = NAV_ITEMS.map((i) => i.id);
    let ticking = false;

    // "Current section" line: a percentage of the visible viewport height,
    // not a fixed pixel value. A fixed value like 120px is too tight —
    // a heading can sit well below that (e.g. 300px+ down) while its
    // section already fills most of the screen, and the previous
    // section would stay "active" until its heading scrolled almost to
    // the very top edge, which doesn't match what's actually on screen.
    // A percentage also scales correctly across different viewport
    // sizes instead of a pixel value tuned for one screen height.
    function getThreshold() {
      const viewportHeight =
        scrollParent instanceof Window
          ? window.innerHeight
          : scrollParent.clientHeight;
      return viewportHeight * 0.35;
    }

    function computeActive() {
      const threshold = getThreshold();
      let bestId: string | null = null;
      let bestTop = -Infinity;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= threshold && top > bestTop) {
          bestTop = top;
          bestId = id;
        }
      }
      if (bestId) setActiveSection(bestId);
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          computeActive();
          ticking = false;
        });
      }
    }

    scrollParent.addEventListener("scroll", onScroll, {
      passive: true,
    });
    computeActive();
    return () =>
      scrollParent.removeEventListener("scroll", onScroll);
  }, [patternFilter]);

  // Keep the nav list itself scrolled so the active item is always
  // visible — the highlight updating alone isn't enough if the item
  // has scrolled out of view within the nav's own list (e.g. scrolling
  // past a section far down the page, like Date Picker).
  //
  // This deliberately does NOT use Element.scrollIntoView() on the
  // button. scrollIntoView walks the *entire* scrollable-ancestor
  // chain, and the nav button lives inside a `position: sticky`
  // element — browsers compute a sticky element's ancestors' "is this
  // in view" geometry inconsistently, and calling scrollIntoView from
  // inside one can spuriously scroll outer containers (up to and
  // including the page's own html/body) trying to "fully reveal" a
  // button that's already on-screen. That outer, unwanted scroll is
  // exactly what produced the double-scroll/blank-space-at-the-bottom
  // bug on left-nav clicks. Scrolling *only* the nav list's own
  // scrollTop, computed directly from the button's offset within it,
  // reproduces the same "scroll into view if not already visible"
  // behavior without ever touching an ancestor outside this list.
  useEffect(() => {
    const activeBtn = document.querySelector(
      `[data-nav-id="${activeSection}"]`,
    ) as HTMLElement | null;
    const list = navListRef.current;
    if (!activeBtn || !list) return;
    const btnTop = activeBtn.offsetTop;
    const btnBottom = btnTop + activeBtn.offsetHeight;
    const viewTop = list.scrollTop;
    const viewBottom = viewTop + list.clientHeight;
    if (btnTop < viewTop) {
      list.scrollTo({ top: btnTop, behavior: "smooth" });
    } else if (btnBottom > viewBottom) {
      list.scrollTo({
        top: btnBottom - list.clientHeight,
        behavior: "smooth",
      });
    }
  }, [activeSection]);

  // Deliberately not Element.scrollIntoView(el, {block:"start"}) here.
  // scrollIntoView walks *every* scrollable-box ancestor in the chain,
  // not just the nearest one -- and this page's real scroller (the
  // DesignTokensPage content pane) isn't the only such ancestor:
  // html/body are still nominally "scroll containers" even with
  // overflow:hidden (that CSS property blocks the user-facing
  // scrollbar/gesture, it doesn't remove them from this walk), and
  // Chrome's scrollIntoView happily scrolls them too, trying to flush
  // the target section to the very top of the *browser viewport*, not
  // just to the top of the content pane. Since the content pane's own
  // scroll already puts the section right below this page's own
  // header, that "helpful" extra scroll shoves the whole app up by
  // the header's height -- which is exactly the double-scroll /
  // blank-space-at-the-bottom bug reported from left-nav clicks.
  // Scrolling the real scroll parent directly via .scrollTo() only
  // ever touches that one element, never its ancestors.
  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const scrollParent = findScrollParent(rootRef.current);
      if (scrollParent instanceof Window) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        const elTop = el.getBoundingClientRect().top;
        const parentTop =
          scrollParent.getBoundingClientRect().top;
        scrollParent.scrollTo({
          top: scrollParent.scrollTop + (elTop - parentTop),
          behavior: "smooth",
        });
      }
    }
    setActiveSection(id);
  }

  // ── icon library data ──
  const iconLibrary: {
    name: string;
    icon: React.ElementType;
    category: string;
    usage: string;
  }[] = [
    {
      name: "Users",
      icon: Users,
      category: "People",
      usage: "Youth lists, contacts, relationships",
    },
    {
      name: "User",
      icon: User,
      category: "People",
      usage: "Profile avatar, individual record",
    },
    {
      name: "GraduationCap",
      icon: GraduationCap,
      category: "People",
      usage: "Education, school enrollment",
    },
    {
      name: "Briefcase",
      icon: Briefcase,
      category: "People",
      usage: "Employment, case worker",
    },
    {
      name: "FileText",
      icon: FileText,
      category: "Documents",
      usage: "Documents, reports, files",
    },
    {
      name: "Paperclip",
      icon: Paperclip,
      category: "Documents",
      usage: "Attachments, file links",
    },
    {
      name: "Upload",
      icon: Upload,
      category: "Documents",
      usage: "Upload files, import data",
    },
    {
      name: "Download",
      icon: Download,
      category: "Documents",
      usage: "Download, export actions",
    },
    {
      name: "Calendar",
      icon: CalendarIcon,
      category: "Time",
      usage: "Date pickers, scheduling",
    },
    {
      name: "Clock",
      icon: Clock,
      category: "Time",
      usage: "Time tracking, timestamps",
    },
    {
      name: "Bell",
      icon: Bell,
      category: "Notifications",
      usage: "Alerts, notification center",
    },
    {
      name: "AlertTriangle",
      icon: AlertTriangle,
      category: "Notifications",
      usage: "Warnings, caution states",
    },
    {
      name: "AlertCircle",
      icon: AlertCircle,
      category: "Notifications",
      usage: "Error states, critical info",
    },
    {
      name: "Info",
      icon: Info,
      category: "Notifications",
      usage: "Informational tooltips, help",
    },
    {
      name: "CheckCircle",
      icon: CheckCircle,
      category: "Notifications",
      usage: "Success, completion states",
    },
    {
      name: "Search",
      icon: Search,
      category: "Actions",
      usage: "Global search, filtering",
    },
    {
      name: "Settings",
      icon: Settings,
      category: "Actions",
      usage: "Configuration, preferences",
    },
    {
      name: "Plus",
      icon: Plus,
      category: "Actions",
      usage: "Create new, add items",
    },
    {
      name: "Edit",
      icon: Edit,
      category: "Actions",
      usage: "Edit record, modify content",
    },
    {
      name: "Trash2",
      icon: Trash2,
      category: "Actions",
      usage: "Delete record, remove item",
    },
    {
      name: "Eye",
      icon: Eye,
      category: "Actions",
      usage: "View details, preview",
    },
    {
      name: "Filter",
      icon: Filter,
      category: "Actions",
      usage: "Filter lists, refine results",
    },
    {
      name: "RefreshCw",
      icon: RefreshCw,
      category: "Actions",
      usage: "Refresh, reload data",
    },
    {
      name: "ExternalLink",
      icon: ExternalLink,
      category: "Actions",
      usage: "Open external link",
    },
    {
      name: "MoreHorizontal",
      icon: MoreHorizontal,
      category: "Actions",
      usage: "Overflow menu, more options",
    },
    {
      name: "X",
      icon: X,
      category: "Actions",
      usage: "Close, dismiss, cancel",
    },
    {
      name: "ChevronDown",
      icon: ChevronDown,
      category: "Navigation",
      usage: "Dropdowns, expandable",
    },
    {
      name: "ChevronRight",
      icon: ChevronRight,
      category: "Navigation",
      usage: "Breadcrumbs, drill-down",
    },
    {
      name: "ArrowLeft",
      icon: ArrowLeft,
      category: "Navigation",
      usage: "Back navigation, return",
    },
    {
      name: "Home",
      icon: Home,
      category: "Navigation",
      usage: "Home page, dashboard link",
    },
    {
      name: "HelpCircle",
      icon: HelpCircle,
      category: "Navigation",
      usage: "Help, documentation",
    },
    {
      name: "TrendingUp",
      icon: TrendingUp,
      category: "Data",
      usage: "Positive trends, increase",
    },
    {
      name: "TrendingDown",
      icon: TrendingDown,
      category: "Data",
      usage: "Negative trends, decrease",
    },
    {
      name: "ArrowUp",
      icon: ArrowUp,
      category: "Data",
      usage: "Sort ascending, positive delta",
    },
    {
      name: "ArrowDown",
      icon: ArrowDown,
      category: "Data",
      usage: "Sort descending, negative delta",
    },
    {
      name: "BarChart3",
      icon: BarChart3,
      category: "Data",
      usage: "Bar charts, analytics",
    },
    {
      name: "PieChart",
      icon: PieChart,
      category: "Data",
      usage: "Pie/donut charts",
    },
    {
      name: "Activity",
      icon: Activity,
      category: "Data",
      usage: "Timeline, activity feed",
    },
    {
      name: "Target",
      icon: Target,
      category: "Data",
      usage: "Goals, targets, KPIs",
    },
    {
      name: "MapPin",
      icon: MapPin,
      category: "Contact",
      usage: "Location, address",
    },
    {
      name: "Phone",
      icon: Phone,
      category: "Contact",
      usage: "Phone number, call",
    },
    {
      name: "Mail",
      icon: Mail,
      category: "Contact",
      usage: "Email, message",
    },
    {
      name: "MessageSquare",
      icon: MessageSquare,
      category: "Contact",
      usage: "Contact log, notes",
    },
    {
      name: "Stethoscope",
      icon: Stethoscope,
      category: "Clinical",
      usage: "Medical, health records",
    },
    {
      name: "Shield",
      icon: Shield,
      category: "Clinical",
      usage: "Safety, CPI, protection",
    },
    {
      name: "Heart",
      icon: Heart,
      category: "Clinical",
      usage: "Wellness, mental health",
    },
    {
      name: "Scale",
      icon: Scale,
      category: "Clinical",
      usage: "Legal, court involvement",
    },
    {
      name: "BookOpen",
      icon: BookOpen,
      category: "Clinical",
      usage: "Case notes, assessments",
    },
    {
      name: "Star",
      icon: Star,
      category: "Status",
      usage: "Favorites, priority, primary",
    },
    {
      name: "Flag",
      icon: Flag,
      category: "Status",
      usage: "Flagged items, milestones",
    },
    {
      name: "Award",
      icon: Award,
      category: "Status",
      usage: "Achievements, certifications",
    },
    {
      name: "Zap",
      icon: Zap,
      category: "Status",
      usage: "Urgent, high priority",
    },
  ];

  const filteredIcons = iconSearch
    ? iconLibrary.filter(
        (i) =>
          i.name
            .toLowerCase()
            .includes(iconSearch.toLowerCase()) ||
          i.category
            .toLowerCase()
            .includes(iconSearch.toLowerCase()) ||
          i.usage
            .toLowerCase()
            .includes(iconSearch.toLowerCase()),
      )
    : iconLibrary;
  const iconCategories = [
    ...new Set(iconLibrary.map((i) => i.category)),
  ];

  const tableData = [
    {
      id: "YTH-001",
      name: "Marcus Johnson",
      program: "Boys Program",
      status: "Referral",
      date: "02/15/2026",
      caseworker: "Sarah Mitchell",
    },
    {
      id: "YTH-002",
      name: "Aisha Williams",
      program: "Girls Program",
      status: "Info Session",
      date: "02/18/2026",
      caseworker: "James Carter",
    },
    {
      id: "YTH-003",
      name: "Diego Ramirez",
      program: "Boys Program",
      status: "Program Waitlist",
      date: "02/20/2026",
      caseworker: "Lisa Nguyen",
    },
    {
      id: "YTH-004",
      name: "Taylor Brooks",
      program: "Girls Program",
      status: "Delayed",
      date: "02/10/2026",
      caseworker: "Michael Davis",
    },
    {
      id: "YTH-005",
      name: "Jordan Lee",
      program: "Boys Program",
      status: "Closed",
      date: "01/28/2026",
      caseworker: "Sarah Mitchell",
    },
  ];

  const badgeStyle = (status: string) => {
    const m: Record<
      string,
      { bg: string; text: string; border: string }
    > = {
      Referral: {
        bg: "#e6f4ea",
        text: "#145F33",
        border: "#a8d5b8",
      },
      "Info Session": {
        bg: "#e0f2fe",
        text: "#005EA2",
        border: "#7dd3fc",
      },
      "Program Waitlist": {
        bg: "#fef3c7",
        text: "#92400e",
        border: "#fcd34d",
      },
      Delayed: {
        bg: "#fce4ec",
        text: "#A82031",
        border: "#f48fb1",
      },
      Closed: {
        bg: "#f3f2f2",
        text: "#706e6b",
        border: "#c9c7c5",
      },
    };
    return m[status] || m.Closed;
  };
  return (
    <PatternFilterContext.Provider value={patternFilter}>
      <div
        ref={rootRef}
        style={{
          display: "flex",
          gap: 0,
          minHeight: "100vh",
          alignItems: "flex-start",
        }}
      >
        {/* ═══ Sticky Left Nav ═══ */}
        <nav
          aria-label="Component sections"
          style={{
            position: "sticky",
            top: 0,
            height: navHeight,
            width: navCollapsed ? 56 : 220,
            flexShrink: 0,
            overflowX: "hidden",
            borderRight:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-base)",
            transition: "width 0.2s ease",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Nav header + collapse toggle */}
          <div
            className="flex items-center justify-between px-2"
            style={{
              height: 48,
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
              flexShrink: 0,
            }}
          >
            {!navCollapsed && (
              <span
                style={{
                  fontSize: "var(--slds-g-font-size-3)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--slds-g-color-text-weak)",
                  whiteSpace: "nowrap",
                }}
              >
                Components
              </span>
            )}
            <button
              onClick={() => setNavCollapsed((c) => !c)}
              className="p-1.5 rounded hover:bg-[#f3f2f2] transition-colors flex-shrink-0"
              style={{
                color: "var(--slds-g-color-text-weak)",
                marginLeft: navCollapsed ? "auto" : undefined,
              }}
              aria-label={
                navCollapsed
                  ? "Expand navigation"
                  : "Collapse navigation"
              }
            >
              {navCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Search — expanded nav only */}
          {!navCollapsed && (
            <div
              className="px-2 py-2"
              style={{
                flexShrink: 0,
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <div className="relative">
                <Search
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                />
                <input
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder="Search components…"
                  aria-label="Search navigation"
                  style={{
                    width: "100%",
                    paddingLeft: 26,
                    paddingRight: navSearch ? 24 : 8,
                    paddingTop: 5,
                    paddingBottom: 5,
                    fontSize: "var(--slds-g-font-size-3)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    borderRadius: 4,
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                    outline: "none",
                  }}
                />
                {navSearch && (
                  <button
                    onClick={() => setNavSearch("")}
                    aria-label="Clear search"
                    style={{
                      position: "absolute",
                      right: 5,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 2,
                      color: "var(--slds-g-color-text-weak)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Nav items */}
          <div
            ref={navListRef}
            className="p-1.5"
            style={{
              overflowY: "auto",
              flex: 1,
              minHeight: 0,
              paddingBottom: 32,
            }}
          >
            {(() => {
              const q = navSearch.trim().toLowerCase();
              const filtered = q
                ? NAV_ITEMS.filter((item) =>
                    item.label.toLowerCase().includes(q),
                  )
                : NAV_ITEMS;

              if (!navCollapsed && q && filtered.length === 0) {
                return (
                  <p
                    className="px-2 py-4 text-center"
                    style={{
                      fontSize: "var(--slds-g-font-size-3)",
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    No results
                  </p>
                );
              }

              return filtered.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const matchIdx = q
                  ? item.label.toLowerCase().indexOf(q)
                  : -1;

                return (
                  <button
                    key={item.id}
                    data-nav-id={item.id}
                    onClick={() => {
                      scrollToSection(item.id);
                      setNavSearch("");
                    }}
                    title={
                      navCollapsed ? item.label : undefined
                    }
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded transition-colors text-left"
                    style={{
                      backgroundColor: isActive
                        ? "#e6f4ea"
                        : "transparent",
                      color: isActive
                        ? "#145F33"
                        : "var(--slds-g-color-text-weak)",
                      fontWeight: isActive ? 500 : 400,
                      fontSize: "var(--slds-g-font-size-3)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        (
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor = "#f3f2f2";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        (
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor = "transparent";
                    }}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!navCollapsed && (
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {matchIdx >= 0 ? (
                          <>
                            {item.label.slice(0, matchIdx)}
                            <mark
                              style={{
                                backgroundColor: "#fef08a",
                                color: "inherit",
                                borderRadius: 2,
                                padding: "0 1px",
                              }}
                            >
                              {item.label.slice(
                                matchIdx,
                                matchIdx + navSearch.length,
                              )}
                            </mark>
                            {item.label.slice(
                              matchIdx + navSearch.length,
                            )}
                          </>
                        ) : (
                          item.label
                        )}
                      </span>
                    )}
                  </button>
                );
              });
            })()}
          </div>
        </nav>

        {/* ═══ Main Content ═══ */}
        <div
          // overflow-x-hidden contains horizontal overflow (paired with
          // min-w-0, so this flex item can shrink below its content's
          // natural width). overflow-y-visible pins the vertical axis
          // explicitly so this column never becomes a scroll container
          // of its own -- it has no fixed height (this div's clientHeight
          // always equals its scrollHeight; it just grows with its
          // content), so the one real scroller stays the outer
          // DesignTokensPage pane.
          className="flex-1 min-w-0 space-y-12 overflow-x-hidden overflow-y-visible"
          style={{ padding: "24px 28px 64px" }}
        >
          <SectionHdr
            icon={Grid3X3}
            title="Component Patterns"
            desc="SLDS 2 component styling conventions used across the Mercy Home application."
          />

          {/* ── Pattern filter chip (shown when a deep-link filter is active) ── */}
          {patternFilter && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                backgroundColor: "#edf7f0",
                border: "1px solid #a3d9b8",
                display: "inline-flex",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: "#145F33",
                  fontWeight: 500,
                }}
              >
                Showing:
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#ffffff",
                  backgroundColor: "#145F33",
                  padding: "2px 7px",
                  borderRadius: "4px",
                }}
              >
                {patternFilter}
              </span>
              <button
                onClick={() => {
                  setPatternFilter("");
                  onClearFilter?.();
                }}
                className="flex items-center gap-1 rounded hover:bg-[#c8ead4] transition-colors px-1.5 py-0.5"
                style={{ fontSize: "11px", color: "#145F33" }}
                type="button"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            </div>
          )}

          <PatternSection prefixes={["ACC"]}>
            <AccordionSection />
          </PatternSection>

          <PatternSection prefixes={["ALD"]}>
            <AlertDialogSection />
          </PatternSection>

          {/* ═══ 9. ALERTS ═══ */}
          <PatternSection prefixes={["ALT"]}>
            <div id="sec-alerts">
              <h3
                className="mb-4"
                style={{
                  fontSize: "var(--slds-g-font-size-6)",
                  fontWeight: 500,
                }}
              >
                Alerts & Notifications
              </h3>
              <div className="space-y-3">
                {[
                  {
                    id: "ALT-01",
                    type: "Success",
                    icon: CheckCircle,
                    variant: "success" as const,
                    msg: "Lead record saved successfully.",
                    detail: "Changes applied to YTH-001.",
                    cssCode: `.alert-row--success {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background-color: #e6f4ea;
  border: 1px solid #a8d5b8;
}

.alert-row--success .alert-title {
  font-size: 13px;
  font-weight: 500;
  color: #145f33;
}

.alert-row--success .alert-detail {
  font-size: 12px;
  color: #145f33;
  opacity: 0.8;
}`,
                  },
                  {
                    id: "ALT-02",
                    type: "Info",
                    icon: Info,
                    variant: "info" as const,
                    msg: "Info session scheduled for Feb 28.",
                    detail: "Calendar invite sent.",
                    actionLabel: "View details",
                    cssCode: `.alert-row--info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background-color: #e0f2fe;
  border: 1px solid #7dd3fc;
}

.alert-row--info .alert-title {
  font-size: 13px;
  font-weight: 500;
  color: #005ea2;
}

.alert-row--info .alert-detail {
  font-size: 12px;
  color: #005ea2;
  opacity: 0.8;
}`,
                  },
                  {
                    id: "ALT-03",
                    type: "Warning",
                    icon: AlertTriangle,
                    variant: "warning" as const,
                    msg: "Incomplete CPI assessment.",
                    detail: "Complete before proceeding.",
                    actionLabel: "Resume",
                    cssCode: `.alert-row--warning {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background-color: #fef3c7;
  border: 1px solid #fcd34d;
}

.alert-row--warning .alert-title {
  font-size: 13px;
  font-weight: 500;
  color: #92400e;
}

.alert-row--warning .alert-detail {
  font-size: 12px;
  color: #92400e;
  opacity: 0.8;
}`,
                  },
                  {
                    id: "ALT-04",
                    type: "Error",
                    icon: AlertCircle,
                    variant: "error" as const,
                    msg: "Failed to save emergency contact.",
                    detail: "Primary contact required.",
                    actionLabel: "Retry",
                    cssCode: `.alert-row--error {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background-color: #fce4ec;
  border: 1px solid #f48fb1;
}

.alert-row--error .alert-title {
  font-size: 13px;
  font-weight: 500;
  color: #a82031;
}

.alert-row--error .alert-detail {
  font-size: 12px;
  color: #a82031;
  opacity: 0.8;
}`,
                  },
                ].map((a) => (
                  <AlertRow key={a.type} {...a} />
                ))}
              </div>
            </div>
          </PatternSection>

          {/* ═══ 10. AVATARS ═══ */}
          <PatternSection prefixes={["AVT"]}>
            <div id="sec-avatars">
              <h3
                className="mb-4"
                style={{
                  fontSize: "var(--slds-g-font-size-6)",
                  fontWeight: 500,
                }}
              >
                Avatars & Profile Elements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ShowcaseCard
                  id="AVT-01"
                  title="Avatar Sizes"
                  cssCode={`.avatar {
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 500;
  background-color: #145f33;
}

.avatar--24 { width: 24px; height: 24px; font-size: 10px; }
.avatar--32 { width: 32px; height: 32px; font-size: 12px; }
.avatar--40 { width: 40px; height: 40px; font-size: 12px; }
.avatar--48 { width: 48px; height: 48px; font-size: 12px; }
.avatar--64 { width: 64px; height: 64px; font-size: 20px; }

.avatar-size-label {
  font-size: 10px;
  color: #706e6b;
}`}
                >
                  <div className="flex items-end gap-4">
                    {[
                      {
                        size: "xs" as const,
                        px: "24px",
                        i: "M",
                        css: `.avatar--24 { width: 24px; height: 24px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; background-color: #145F33; color: #ffffff; font-size: 10px; font-weight: 500; }`,
                      },
                      {
                        size: "sm" as const,
                        px: "32px",
                        i: "MJ",
                        css: `.avatar--32 { width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; background-color: #145F33; color: #ffffff; font-size: 12px; font-weight: 500; }`,
                      },
                      {
                        size: "md" as const,
                        px: "40px",
                        i: "MJ",
                        css: `.avatar--40 { width: 40px; height: 40px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; background-color: #145F33; color: #ffffff; font-size: 12px; font-weight: 500; }`,
                      },
                      {
                        size: "lg" as const,
                        px: "48px",
                        i: "MJ",
                        css: `.avatar--48 { width: 48px; height: 48px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; background-color: #145F33; color: #ffffff; font-size: 12px; font-weight: 500; }`,
                      },
                      {
                        size: "xl" as const,
                        px: "64px",
                        i: "MJ",
                        css: `.avatar--64 { width: 64px; height: 64px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; background-color: #145F33; color: #ffffff; font-size: 20px; font-weight: 500; }`,
                      },
                    ].map((a) => (
                      <div
                        key={a.px}
                        className="group/item flex flex-col items-center gap-1"
                      >
                        <Avatar size={a.size}>
                          <AvatarFallback
                            size={a.size}
                            color="primary"
                          >
                            {a.i}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className="text-[10px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {a.px}
                        </span>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity mt-1">
                          <CopyCSSBtn css={a.css} />
                        </div>
                      </div>
                    ))}
                  </div>
                </ShowcaseCard>
                <ShowcaseCard
                  id="AVT-02"
                  title="Avatar Colors (Per Role)"
                  cssCode={`.avatar {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
}

.avatar-role-label {
  font-size: 10px;
  color: #706e6b;
}`}
                >
                  <div className="flex items-center gap-3">
                    {[
                      {
                        i: "SM",
                        color: "primary" as const,
                        l: "Caseworker",
                        css: `.avatar--caseworker { width: 40px; height: 40px; border-radius: 9999px; background-color: #145F33; color: #ffffff; font-size: 12px; font-weight: 500; display: flex; align-items: center; justify-content: center; }`,
                      },
                      {
                        i: "JC",
                        color: "secondary" as const,
                        l: "Clinical",
                        css: `.avatar--clinical { width: 40px; height: 40px; border-radius: 9999px; background-color: #A82031; color: #ffffff; font-size: 12px; font-weight: 500; display: flex; align-items: center; justify-content: center; }`,
                      },
                      {
                        i: "LN",
                        color: "tertiary" as const,
                        l: "Admin",
                        css: `.avatar--admin { width: 40px; height: 40px; border-radius: 9999px; background-color: #183242; color: #ffffff; font-size: 12px; font-weight: 500; display: flex; align-items: center; justify-content: center; }`,
                      },
                      {
                        i: "MD",
                        color: "accent" as const,
                        l: "Educator",
                        css: `.avatar--educator { width: 40px; height: 40px; border-radius: 9999px; background-color: #E86C24; color: #ffffff; font-size: 12px; font-weight: 500; display: flex; align-items: center; justify-content: center; }`,
                      },
                      {
                        i: "YP",
                        color: "info" as const,
                        l: "Youth",
                        css: `.avatar--youth { width: 40px; height: 40px; border-radius: 9999px; background-color: #005EA2; color: #ffffff; font-size: 12px; font-weight: 500; display: flex; align-items: center; justify-content: center; }`,
                      },
                    ].map((a) => (
                      <div
                        key={a.l}
                        className="group/item flex flex-col items-center gap-1"
                      >
                        <Avatar size="md">
                          <AvatarFallback
                            size="md"
                            color={a.color}
                          >
                            {a.i}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className="text-[10px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {a.l}
                        </span>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity mt-1">
                          <CopyCSSBtn css={a.css} />
                        </div>
                      </div>
                    ))}
                  </div>
                </ShowcaseCard>
              </div>
            </div>
          </PatternSection>

          {/* ═══ 11. BREADCRUMBS ═══ */}
          <PatternSection prefixes={["BRD"]}>
            <div id="sec-breadcrumbs">
              <h3
                className="mb-4"
                style={{
                  fontSize: "var(--slds-g-font-size-6)",
                  fontWeight: 500,
                }}
              >
                Breadcrumbs & Navigation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ShowcaseCard
                  id="BRD-01"
                  title="Standard Breadcrumb"
                  cssCode={`.breadcrumb-item {
  font-size: 13px;
  color: #005ea2;
}

.breadcrumb-item--current {
  color: #080707;
  font-weight: 500;
}

.breadcrumb-separator {
  width: 14px;
  height: 14px;
  color: #706e6b;
}`}
                >
                  <Breadcrumb>
                    <BreadcrumbList className="flex-nowrap">
                      {[
                        "Admissions",
                        "Total Leads",
                        "YTH-001",
                        "Marcus Johnson",
                      ].map((c, i, a) => (
                        <Fragment key={c}>
                          <BreadcrumbItem>
                            {i < a.length - 1 ? (
                              <BreadcrumbLink href="#">
                                {c}
                              </BreadcrumbLink>
                            ) : (
                              <BreadcrumbPage>
                                {c}
                              </BreadcrumbPage>
                            )}
                          </BreadcrumbItem>
                          {i < a.length - 1 && (
                            <BreadcrumbSeparator />
                          )}
                        </Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                </ShowcaseCard>
                <ShowcaseCard
                  id="BRD-02"
                  title="Page Header with Back"
                  cssCode={`.page-header-back-btn {
  padding: 6px;
  border-radius: 4px;
  background-color: transparent;
  border: none;
  color: #706e6b;
  cursor: pointer;
}
.page-header-back-btn:hover {
  background-color: #f3f2f2;
}

.page-header-eyebrow {
  font-size: 12px;
  color: #706e6b;
}

.page-header-title {
  font-size: 16px;
  font-weight: 500;
}`}
                >
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Back"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                      <p
                        style={{
                          fontSize: "var(--slds-g-font-size-3)",
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Lead Record
                      </p>
                      <p
                        style={{
                          fontSize: "var(--slds-g-font-size-6)",
                          fontWeight: 500,
                        }}
                      >
                        Marcus Johnson
                      </p>
                    </div>
                  </div>
                </ShowcaseCard>
                <ShowcaseCard
                  id="BRD-03"
                  title="Page Header (list & search pages)"
                  description="PageHeader: brand icon tile, uppercase eyebrow, page title (.slds-page-header-title) and an actions slot, on the --slds-g-color-background-alt-2 band with border-base-1 and shadow-1. Padding follows the responsive --app-page-padding."
                >
                  <PageHeader
                    icon={Heart}
                    eyebrow="Friends First"
                    title="Mentee Search"
                    actions={
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Refresh"
                      >
                        <RefreshCw />
                      </Button>
                    }
                  />
                </ShowcaseCard>
              </div>
            </div>
          </PatternSection>

          <PatternSection prefixes={["BTN"]}>
            <ButtonsSection />
          </PatternSection>

          <PatternSection prefixes={["CAL"]}>
            <CalendarSection />
          </PatternSection>

          {/* ═══ 13. CARDS ═══ */}
          <PatternSection prefixes={["CRD"]}>
            <div id="sec-cards">
              <h3
                className="mb-4"
                style={{
                  fontSize: "var(--slds-g-font-size-6)",
                  fontWeight: 500,
                }}
              >
                Card Styles
              </h3>

              {/* ── Base variants (4-up grid) ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Standard Card */}
                <ShowcaseCard
                  id="CRD-01"
                  title="Standard Card"
                  cssCode={`.card { border-radius: 8px; border: 1px solid #dddbda; background-color: #ffffff; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); overflow: hidden; }\n.card-header { padding: 12px 16px; background-color: #fafaf9; border-bottom: 1px solid #dddbda; display: flex; align-items: center; justify-content: space-between; }\n.card-header h4 { font-size: 13px; font-weight: 600; line-height: 19.5px; color: #080707; margin: 0; }\n.card-body { padding: 16px; background-color: #ffffff; }`}
                >
                  <Card variant="section" elevation="sm">
                    <CardHeader size="sm" separated>
                      <CardTitle size="sm">
                        Standard Card
                      </CardTitle>
                    </CardHeader>
                    <CardContent size="sm">
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#706e6b",
                        }}
                      >
                        8px radius, shadow-1, 1px border
                      </p>
                    </CardContent>
                  </Card>
                </ShowcaseCard>

                {/* Elevated Card */}
                <ShowcaseCard
                  id="CRD-02"
                  title="Elevated Card"
                  cssCode={`.card--elevated { border-radius: 8px; border: 1px solid #dddbda; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }\n.card--elevated .card-header { padding: 12px 16px; background-color: #fafaf9; border-bottom: 1px solid #dddbda; display: flex; align-items: center; justify-content: space-between; }\n.card--elevated .card-header h4 { font-size: 13px; font-weight: 600; line-height: 19.5px; color: #080707; margin: 0; }\n.card--elevated .card-body { padding: 16px; background-color: #ffffff; }`}
                >
                  <Card variant="section" elevation="md">
                    <CardHeader size="sm" separated>
                      <CardTitle size="sm">
                        Elevated Card
                      </CardTitle>
                    </CardHeader>
                    <CardContent size="sm">
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#706e6b",
                        }}
                      >
                        8px radius, shadow-2
                      </p>
                    </CardContent>
                  </Card>
                </ShowcaseCard>

                {/* Accent Top Card */}
                <ShowcaseCard
                  id="CRD-03"
                  title="Accent Top"
                  cssCode={`.card--accent-top { border-radius: 8px; border: 1px solid #dddbda; background-color: #ffffff; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); overflow: hidden; }\n.card--accent-top::before { content: ""; display: block; height: 6px; background-color: #145F33; }\n.card--accent-top .card-header { padding: 12px 16px; background-color: #fafaf9; border-bottom: 1px solid #dddbda; display: flex; align-items: center; justify-content: space-between; }\n.card--accent-top .card-header h4 { font-size: 13px; font-weight: 600; line-height: 19.5px; color: #080707; margin: 0; }\n.card--accent-top .card-body { padding: 16px; background-color: #ffffff; }`}
                >
                  <Card variant="section" elevation="sm">
                    <div className="h-1.5 rounded-t-[8px] bg-[var(--color-brand-primary)]" />
                    <CardHeader size="sm" separated>
                      <CardTitle size="sm">
                        Accent Top
                      </CardTitle>
                    </CardHeader>
                    <CardContent size="sm">
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#706e6b",
                        }}
                      >
                        Brand green top bar
                      </p>
                    </CardContent>
                  </Card>
                </ShowcaseCard>

                {/* Compact Card */}
                <ShowcaseCard
                  id="CRD-04"
                  title="Compact Card"
                  cssCode={`.card--compact { border-radius: 8px; border: 1px solid #dddbda; background-color: #ffffff; overflow: hidden; }\n.card--compact .card-header { padding: 10px 16px; background-color: #fafaf9; border-bottom: 1px solid #dddbda; display: flex; align-items: center; justify-content: space-between; }\n.card--compact .card-header h4 { font-size: 13px; font-weight: 600; line-height: 19.5px; color: #080707; margin: 0; }\n.card--compact .card-body { padding: 10px 16px; background-color: #ffffff; }`}
                >
                  <Card variant="section" elevation="none">
                    <CardHeader size="xs" separated>
                      <CardTitle size="sm">
                        Compact Card
                      </CardTitle>
                    </CardHeader>
                    <CardContent size="xs">
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#706e6b",
                        }}
                      >
                        Reduced padding, no shadow
                      </p>
                    </CardContent>
                  </Card>
                </ShowcaseCard>
              </div>

              {/* ── With Tabs — full-width reference pattern (CRD-05) ── */}
              <div className="group/item">
                <Card
                  ref={crd05.ref}
                  id="CRD-05"
                  variant="section"
                  className={cn(
                    "scroll-mt-6",
                    crd05.pulsing && "showcase-card-pulse",
                  )}
                >
                  <Tabs defaultValue="Constituent Details">
                    <TabsList
                      variant="underline"
                      separated
                      className="flex-shrink-0 overflow-x-auto"
                    >
                      {[
                        "Constituent Details",
                        "CPI",
                        "Relationships",
                        "Connections",
                        "Documents",
                        "Contact Log",
                      ].map((tab) => (
                        <TabsTrigger
                          key={tab}
                          value={tab}
                          variant="underline"
                          size="sm"
                        >
                          {tab}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {[
                      "Constituent Details",
                      "CPI",
                      "Relationships",
                      "Connections",
                      "Documents",
                      "Contact Log",
                    ].map((tab) => (
                      <TabsContent
                        key={tab}
                        value={tab}
                        className="p-6 mt-0"
                      >
                        <Card variant="section">
                          <CardHeader size="sm" separated>
                            <CardTitle size="sm">
                              Basic Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent
                            size="sm"
                            className="h-[120px]"
                          />
                        </Card>
                      </TabsContent>
                    ))}
                  </Tabs>
                </Card>

                {/* Hover actions — badge + CSS button, hidden until hover */}
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 mt-1 flex items-center gap-2">
                  <PatternIdBadge
                    id="CRD-05"
                    idCopied={crd05.idCopied}
                    cssCopied={false}
                    onCopyId={crd05.copyId}
                    onCopyCss={() => {}}
                  />
                  <CopyCSSBtn
                    css={`
                      .card--with-tabs {
                        border-radius: 8px;
                        border: 1px solid #dddbda;
                        background-color: #ffffff;
                        overflow: hidden;
                      }
                      \n.card--with-tabs .tab-bar {
                        display: flex;
                        align-items: stretch;
                        background-color: #fafaf9;
                        border-bottom: 1px solid #dddbda;
                        height: 44px;
                        overflow-x: auto;
                      }
                      \n.card--with-tabs .tab {
                        position: relative;
                        display: flex;
                        align-items: center;
                        padding: 0 16px;
                        font-size: 13px;
                        font-weight: 500;
                        line-height: 19.5px;
                        color: #706e6b;
                        white-space: nowrap;
                        cursor: pointer;
                      }
                      \n.card--with-tabs .tab--active {
                        color: #145f33;
                      }
                      \n.card--with-tabs .tab--active::after {
                        content: "";
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 3px;
                        background-color: #145f33;
                      }
                      \n.card--with-tabs .content {
                        padding: 24px;
                      }
                      \n.card--with-tabs .card {
                        border-radius: 8px;
                        border: 1px solid #dddbda;
                        overflow: hidden;
                      }
                      \n.card--with-tabs .card-header {
                        padding: 12px 16px;
                        background-color: #fafaf9;
                        border-bottom: 1px solid #dddbda;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                      }
                      \n.card--with-tabs .card-header h4 {
                        font-size: 13px;
                        font-weight: 600;
                        line-height: 19.5px;
                        color: #080707;
                        margin: 0;
                      }
                      \n.card--with-tabs .card-body {
                        padding: 16px;
                        background-color: #ffffff;
                      }
                    `}
                  />
                </div>
              </div>
            </div>
          </PatternSection>

          {/* ═══ 3. DATA TABLE ═══ */}
          <PatternSection prefixes={["DTB", "PGN"]}>
            <DataTableSection />
            <div id="sec-pagination-sub">
              <PaginationSection />
            </div>
          </PatternSection>

          {/* ═══ 6. DATA VIS ═══ */}
          <PatternSection prefixes={["DVZ"]}>
            <div id="sec-data-vis">
              <h3
                className="mb-4"
                style={{
                  fontSize: "var(--slds-g-font-size-6)",
                  fontWeight: 500,
                }}
              >
                Data Visualization
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ShowcaseCard
                  id="DVZ-01"
                  title="Chart Color Sequence"
                  cssCode={`.chart-color-1 { background-color: #145F33; }\n.chart-color-2 { background-color: #A82031; }\n.chart-color-3 { background-color: #183242; }\n.chart-color-4 { background-color: #E86C24; }\n.chart-color-5 { background-color: #005EA2; }`}
                >
                  <div className="flex gap-2">
                    {[
                      { c: "#145F33", l: "Chart 1" },
                      { c: "#A82031", l: "Chart 2" },
                      { c: "#183242", l: "Chart 3" },
                      { c: "#E86C24", l: "Chart 4" },
                      { c: "#005EA2", l: "Chart 5" },
                    ].map((x) => (
                      <div
                        key={x.l}
                        className="flex-1 text-center"
                      >
                        <div
                          className="h-12 rounded-md mb-1"
                          style={{ backgroundColor: x.c }}
                        />
                        <span
                          className="text-[10px] block"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {x.l}
                        </span>
                        <code
                          className="text-[9px]"
                          style={{
                            fontFamily: "monospace",
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {x.c}
                        </code>
                      </div>
                    ))}
                  </div>
                </ShowcaseCard>
                <ShowcaseCard
                  id="DVZ-02"
                  title="Horizontal Bar Chart"
                  cssCode={`.hbar-track { height: 20px; border-radius: 2px; background-color: #f3f2f2; overflow: hidden; }\n.hbar-fill { height: 100%; border-radius: 2px; }\n.hbar-label { font-size: 13px; color: var(--slds-g-color-text-weak); }\n.hbar-value { font-size: 13px; font-weight: 500; }`}
                >
                  <div className="space-y-2">
                    {[
                      { l: "Referral", v: 85, c: "#145F33" },
                      {
                        l: "Info Session",
                        v: 62,
                        c: "#005EA2",
                      },
                      { l: "Waitlist", v: 45, c: "#E86C24" },
                      { l: "Delayed", v: 28, c: "#A82031" },
                      { l: "Closed", v: 72, c: "#706e6b" },
                    ].map((b) => (
                      <div
                        key={b.l}
                        className="flex items-center gap-2"
                      >
                        <span
                          className="w-20 text-right"
                          style={{
                            fontSize:
                              "var(--slds-g-font-size-3)",
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {b.l}
                        </span>
                        <div className="flex-1 h-5 rounded-sm bg-[#f3f2f2] overflow-hidden">
                          <div
                            className="h-full rounded-sm"
                            style={{
                              width: `${b.v}%`,
                              backgroundColor: b.c,
                            }}
                          />
                        </div>
                        <span
                          className="w-8 text-right"
                          style={{
                            fontSize:
                              "var(--slds-g-font-size-3)",
                            fontWeight: 500,
                          }}
                        >
                          {b.v}
                        </span>
                      </div>
                    ))}
                  </div>
                </ShowcaseCard>
              </div>
            </div>
          </PatternSection>

          {/* ═══ 14. DIALOG ═══ */}
          <PatternSection prefixes={["DLG"]}>
            <DialogSection />
          </PatternSection>

          <PatternSection prefixes={["DRW"]}>
            <DrawerSection />
          </PatternSection>

          {/* ═══ 15. EMPTY STATES ═══ */}
          <PatternSection prefixes={["EMP"]}>
            <div id="sec-empty-states">
              <h3
                className="mb-4"
                style={{
                  fontSize: "var(--slds-g-font-size-6)",
                  fontWeight: 500,
                }}
              >
                Empty States
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ShowcaseCard
                  id="EMP-01"
                  title="Empty State — No Documents"
                  cssCode={`.empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 32px; }\n.empty-state__icon { width: 56px; height: 56px; border-radius: 9999px; background-color: #f3f2f2; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }\n.empty-state__title { font-size: 14px; font-weight: 500; }\n.empty-state__desc { font-size: 13px; color: #706e6b; margin-top: 4px; max-width: 320px; }\n.empty-state__btn { margin-top: 16px; padding: 8px 16px; border-radius: 9999px; background-color: #145F33; color: #ffffff; display: flex; align-items: center; gap: 8px; border: none; }`}
                >
                  <EmptyState
                    icon={FileText}
                    tone="neutral"
                    title="No Documents Found"
                    description="Upload documents to get started."
                    actionLabel="Upload"
                    actionIcon={Upload}
                  />
                </ShowcaseCard>
                <ShowcaseCard
                  id="EMP-02"
                  title="Empty State — No Relationships"
                  cssCode={`.empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 32px; }\n.empty-state__icon--green { width: 56px; height: 56px; border-radius: 9999px; background-color: #e6f4ea; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }\n.empty-state__title { font-size: 14px; font-weight: 500; }\n.empty-state__desc { font-size: 13px; color: #706e6b; margin-top: 4px; max-width: 320px; }\n.empty-state__btn { margin-top: 16px; padding: 8px 16px; border-radius: 9999px; background-color: #145F33; color: #ffffff; display: flex; align-items: center; gap: 8px; border: none; }`}
                >
                  <EmptyState
                    icon={Users}
                    tone="success"
                    title="No Relationships"
                    description="Add at least one emergency contact."
                    actionLabel="Add Relationship"
                    actionIcon={Plus}
                  />
                </ShowcaseCard>
              </div>
            </div>
          </PatternSection>

          {/* ═══ 8. FORM CONTROLS ═══ */}
          <PatternSection prefixes={["FRM"]}>
            <FormControlsSection />
          </PatternSection>

          <PatternSection prefixes={["TXA"]}>
            <TextareaSection />
          </PatternSection>
          <PatternSection prefixes={["DRP"]}>
            <DropdownSection />
          </PatternSection>
          <PatternSection prefixes={["RAD"]}>
            <RadioSection />
          </PatternSection>
          <PatternSection prefixes={["TGG"]}>
            <ToggleGroupSection />
          </PatternSection>
          <PatternSection prefixes={["TGL"]}>
            <ToggleSection />
          </PatternSection>
          <PatternSection prefixes={["OTP"]}>
            <OtpSection />
          </PatternSection>

          <PatternSection prefixes={["DPK"]}>
            <DatePickerSection />
          </PatternSection>

          {/* ═══ 5. ICON LIBRARY ═══ */}
          <PatternSection prefixes={["ICN"]}>
            <div id="sec-icon-library">
              <h3
                className="mb-2"
                style={{
                  fontSize: "var(--slds-g-font-size-6)",
                  fontWeight: 500,
                }}
              >
                Icon Library (Lucide React)
              </h3>
              <p className="mb-4 text-[12px] text-[#706e6b]">
                All icons from{" "}
                <code style={{ fontFamily: "monospace" }}>
                  lucide-react
                </code>
                . Standard: 16px inline, 20px headers.
              </p>
              <div className="relative mb-4 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#706e6b] z-10" />
                <Input
                  type="text"
                  placeholder="Search icons..."
                  value={iconSearch}
                  onChange={(e) =>
                    setIconSearch(e.target.value)
                  }
                  className="w-full pl-9 text-[length:var(--slds-g-font-size-4)]"
                />
              </div>
              <ShowcaseCard
                id="ICN-01"
                title="Icon Tile Pattern"
                description="The searchable, categorized icon browser below uses this tile pattern for every entry — a bordered 1:1 tile with a centered icon and small caption."
                cssCode={`.icon-tile {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 6px;\n  padding: 12px;\n  border-radius: 8px;\n  background-color: #ffffff;\n  border: 1px solid #dddbda;\n  cursor: pointer;\n  transition: background-color 0.15s;\n}\n.icon-tile:hover {\n  background-color: #f3f2f2;\n}\n.icon-tile svg {\n  height: 20px;\n  width: 20px;\n  color: #3e3e3c;\n}\n.icon-tile__label {\n  font-size: 10px;\n  text-align: center;\n  color: var(--slds-g-color-text-weak, #706e6b);\n}`}
              >
                {iconCategories.map((cat) => {
                  const catIcons = filteredIcons.filter(
                    (i) => i.category === cat,
                  );
                  if (!catIcons.length) return null;
                  return (
                    <div key={cat} className="mb-5">
                      <h4
                        className="mb-2"
                        style={{
                          fontSize: "var(--slds-g-font-size-4)",
                          fontWeight: 600,
                          color: "#706e6b",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {cat}
                      </h4>
                      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2">
                        {catIcons.map((ic) => {
                          const Ic = ic.icon;
                          return (
                            <div
                              key={ic.name}
                              className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white hover:bg-[#f3f2f2] transition-colors cursor-pointer"
                              style={{
                                border:
                                  "1px solid var(--slds-g-color-border-base-3)",
                              }}
                              title={ic.usage}
                            >
                              <Ic
                                className="h-5 w-5"
                                style={{ color: "#3e3e3c" }}
                              />
                              <span
                                className="text-[10px] text-center"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                {ic.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </ShowcaseCard>
            </div>
          </PatternSection>

          {/* ═══ 2. KPI CARDS ═══ */}
          <PatternSection prefixes={["KPI"]}>
            <KPICardsSection />
          </PatternSection>

          {/* ═══ 12. PROGRESS ═══ */}
          <PatternSection prefixes={["PRG"]}>
            <div id="sec-progress">
              <h3
                className="mb-4"
                style={{
                  fontSize: "var(--slds-g-font-size-6)",
                  fontWeight: 500,
                }}
              >
                Progress & Status Indicators
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ShowcaseCard
                  id="PRG-01"
                  title="Progress Bars"
                  description="Linear progress bar — track + fill, colored by status/urgency."
                  cssCode={`.progress-bar { height: 8px; border-radius: 9999px; background-color: #f3f2f2; overflow: hidden; }\n.progress-fill { height: 100%; border-radius: 9999px; }`}
                >
                  <div className="space-y-3">
                    {[
                      {
                        l: "Assessment",
                        p: 75,
                        c: "#145F33",
                        tone: "primary" as const,
                        css: `.progress-bar { height: 8px; border-radius: 9999px; background-color: #f3f2f2; overflow: hidden; }\n.progress-fill--assessment { width: 75%; height: 100%; border-radius: 9999px; background-color: #145F33; }`,
                      },
                      {
                        l: "Documents",
                        p: 40,
                        c: "#E86C24",
                        tone: "accent" as const,
                        css: `.progress-bar { height: 8px; border-radius: 9999px; background-color: #f3f2f2; overflow: hidden; }\n.progress-fill--documents { width: 40%; height: 100%; border-radius: 9999px; background-color: #E86C24; }`,
                      },
                      {
                        l: "Review",
                        p: 10,
                        c: "#A82031",
                        tone: "secondary" as const,
                        css: `.progress-bar { height: 8px; border-radius: 9999px; background-color: #f3f2f2; overflow: hidden; }\n.progress-fill--review { width: 10%; height: 100%; border-radius: 9999px; background-color: #A82031; }`,
                      },
                    ].map((x) => (
                      <div key={x.l} className="group/item">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            style={{
                              fontSize:
                                "var(--slds-g-font-size-3)",
                            }}
                          >
                            {x.l}
                          </span>
                          <span
                            style={{
                              fontSize:
                                "var(--slds-g-font-size-3)",
                              fontWeight: 500,
                              color: x.c,
                            }}
                          >
                            {x.p}%
                          </span>
                        </div>
                        <Progress
                          value={x.p}
                          tone={x.tone}
                          trackTone="neutral"
                        />
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity mt-1">
                          <CopyCSSBtn css={x.css} />
                        </div>
                      </div>
                    ))}
                  </div>
                </ShowcaseCard>
                <ShowcaseCard
                  id="PRG-02"
                  title="Status Path / Pipeline (Dot Stepper)"
                  description="Numbered circular steps connected by a line — completed (filled, check icon), active (outlined), upcoming (gray)."
                  cssCode={`.status-path { display: flex; align-items: center; gap: 4px; }\n.status-path__dot { width: 24px; height: 24px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; }\n.status-path__dot--complete { background-color: #145F33; color: #ffffff; }\n.status-path__dot--active { background-color: #e6f4ea; border: 2px solid #145F33; color: #145F33; }\n.status-path__dot--upcoming { background-color: #f3f2f2; color: #706e6b; }\n.status-path__connector { height: 2px; flex: 1; margin-top: -16px; background-color: #dddbda; }\n.status-path__connector--complete { background-color: #145F33; }\n.status-path__label { font-size: 10px; margin-top: 4px; text-align: center; }`}
                >
                  <Stepper
                    variant="dot"
                    steps={[
                      {
                        label: "Referral",
                        status: "completed",
                      },
                      {
                        label: "Info Session",
                        status: "completed",
                      },
                      {
                        label: "Assessment",
                        status: "current",
                      },
                      {
                        label: "Determination",
                        status: "upcoming",
                      },
                      { label: "Admitted", status: "upcoming" },
                    ]}
                  />
                </ShowcaseCard>
              </div>
            </div>
          </PatternSection>

          {/* ═══ 19. STAGE PROGRESS ═══ */}
          <PatternSection prefixes={["STG"]}>
            <div id="sec-stage-progress">
              <h3
                className="mb-4"
                style={{
                  fontSize: "var(--slds-g-font-size-6)",
                  fontWeight: 500,
                }}
              >
                Stage Progress (Pipeline Chevron Stepper)
              </h3>

              {/* STG-01 — Pipeline Chevron Stepper (matches LeadDetailView PipelineTracker) */}
              <ShowcaseCard
                id="STG-01"
                title="Pipeline Progress — Chevron Stepper"
                description="Full-width arrow-segmented stage tracker used in record headers (e.g. Admissions Lead Detail). Segments are clipped into chevrons via clip-path; completed segments show a check icon."
                cssCode={`.pipeline-tracker {\n  width: 100%;\n  overflow-x: auto;\n  padding-bottom: 8px;\n}\n.pipeline-tracker__track {\n  display: flex;\n  min-width: 600px;\n  gap: 2px;\n  border-radius: 9999px;\n  overflow: hidden;\n}\n.pipeline-tracker__segment {\n  flex: 1;\n  height: 40px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  font-size: 12px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  position: relative;\n  cursor: default;\n}\n/* Chevron shape (middle segment) — first/last segments drop the notch on their outer edge */\n.pipeline-tracker__segment {\n  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%);\n}\n.pipeline-tracker__segment--first {\n  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%);\n}\n.pipeline-tracker__segment--last {\n  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 12px 50%);\n}\n.pipeline-tracker__segment--completed {\n  background-color: #C8E6C9;\n  color: #1B5E20;\n}\n.pipeline-tracker__segment--current {\n  background-color: #145F33;\n  color: #ffffff;\n}\n.pipeline-tracker__segment--upcoming {\n  background-color: #E5E5E5;\n  color: #6b7280;\n}\n.pipeline-tracker__label {\n  padding: 0 8px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}`}
              >
                <Stepper
                  variant="chevron"
                  steps={[
                    { label: "Referral", status: "completed" },
                    {
                      label: "Info Session",
                      status: "current",
                    },
                    {
                      label: "Assessments",
                      status: "upcoming",
                    },
                    {
                      label: "Shadow & FPM",
                      status: "upcoming",
                    },
                    { label: "Staffing", status: "upcoming" },
                    { label: "Move-In", status: "upcoming" },
                  ]}
                />
              </ShowcaseCard>

              {/* STG-02 — Segment states side by side */}
              <div className="mt-4">
                <ShowcaseCard
                  id="STG-02"
                  title="Segment States"
                  description="The three visual states a single chevron segment can be in."
                  cssCode={`.pipeline-tracker__segment--completed { background-color: #C8E6C9; color: #1B5E20; }\n.pipeline-tracker__segment--current { background-color: #145F33; color: #ffffff; }\n.pipeline-tracker__segment--upcoming { background-color: #E5E5E5; color: #6b7280; }`}
                >
                  <div className="flex gap-3">
                    {(
                      Object.keys(CHEVRON_TONE) as StepStatus[]
                    ).map((status) => {
                      const tone = CHEVRON_TONE[status];
                      const label =
                        status[0].toUpperCase() +
                        status.slice(1);
                      return (
                        <div
                          key={status}
                          className="group/item flex flex-col items-center gap-1"
                        >
                          <div
                            className="h-10 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider rounded-md px-4"
                            style={{
                              backgroundColor: tone.bg,
                              color: tone.fg,
                            }}
                          >
                            {status === "completed" && (
                              <CheckCircle
                                className="h-4 w-4"
                                strokeWidth={3}
                              />
                            )}
                            {label}
                          </div>
                          <div className="opacity-0 group-hover/item:opacity-100 transition-opacity mt-1">
                            <CopyCSSBtn
                              css={`
                                .pipeline-tracker__segment--${status} {
                                  background-color: ${tone.bg};
                                  color: ${tone.fg};
                                }
                              `}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ShowcaseCard>
              </div>

              {/* STG-03 — Days in Stage counter */}
              <div className="mt-4">
                <ShowcaseCard
                  id="STG-03"
                  title="Days in Stage Counter"
                  description="Right-aligned meta label above the tracker, e.g. '1 Days in Referral'."
                  cssCode={`.stage-days-counter {\n  font-size: 12px;\n  color: #706e6b;\n  text-align: right;\n}\n.stage-days-counter strong {\n  color: #080707;\n  font-weight: 700;\n}`}
                >
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#706e6b",
                      textAlign: "right",
                    }}
                  >
                    <strong
                      style={{
                        color: "#080707",
                        fontWeight: 700,
                      }}
                    >
                      1
                    </strong>{" "}
                    Days in Referral
                  </p>
                </ShowcaseCard>
              </div>
            </div>
          </PatternSection>

          {/* ═══ 20. ALERT ICON CLUSTER ═══ */}
          <PatternSection prefixes={["AIC"]}>
            <div id="sec-alert-icons">
              <h3
                className="mb-4"
                style={{
                  fontSize: "var(--slds-g-font-size-6)",
                  fontWeight: 500,
                }}
              >
                Status / Alert Icon Cluster
              </h3>

              {/* AIC-01 — Full cluster, matches record header (YouthAlertIcons) */}
              <ShowcaseCard
                id="AIC-01"
                title="Alert Icon Cluster"
                description="Up to 3 circular icon buttons shown next to a youth's name — each is independently conditional on whether its data array has records (no icon = no placeholder). Source: YouthAlertIcons.tsx."
                cssCode={`.alert-icon-cluster {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.alert-icon-btn {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 34px;\n  height: 34px;\n  border-radius: 50%;\n  border: none;\n  cursor: pointer;\n  flex-shrink: 0;\n  transition: background 0.15s;\n  padding: 0;\n}\n.alert-icon-btn--restraints {\n  background-color: #fef2f2;\n  color: #c23934;\n}\n.alert-icon-btn--restraints:hover {\n  background-color: #fee2e2;\n}\n.alert-icon-btn--medical,\n.alert-icon-btn--dietary {\n  background-color: #e8f0fd;\n  color: #1e3a5f;\n}\n.alert-icon-btn--medical:hover,\n.alert-icon-btn--dietary:hover {\n  background-color: #d0e2fb;\n}`}
              >
                <AlertIconCluster
                  kinds={["restraints", "medical", "dietary"]}
                />
              </ShowcaseCard>

              {/* AIC-02 — Individual icon button states */}
              <div className="mt-4">
                <ShowcaseCard
                  id="AIC-02"
                  title="Icon Button Color States"
                  description="Each alert type maps to a fixed icon + color pair. Restraints is the only red variant; Medical and Dietary share the navy variant."
                  cssCode={`.alert-icon-btn--restraints { background-color: #fef2f2; color: #c23934; }\n.alert-icon-btn--medical,\n.alert-icon-btn--dietary { background-color: #e8f0fd; color: #1e3a5f; }`}
                >
                  <div className="flex gap-4">
                    {(
                      [
                        "restraints",
                        "medical",
                        "dietary",
                      ] as AlertIconKind[]
                    ).map((kind) => {
                      const meta = ALERT_ICON_META[kind];
                      return (
                        <div
                          key={kind}
                          className="group/item flex flex-col items-center gap-1.5"
                        >
                          <AlertIconCluster kinds={[kind]} />
                          <span className="text-[11px] text-[var(--slds-g-color-text-weak)]">
                            {meta.label}
                          </span>
                          <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <CopyCSSBtn
                              css={`
                                .alert-icon-btn--${kind} {
                                  background-color: ${meta.bg};
                                  color: ${meta.fg};
                                }
                              `}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ShowcaseCard>
              </div>
            </div>
          </PatternSection>

          {/* ═══ 21. CONTACT META ROW ═══ */}
          <PatternSection prefixes={["CTM"]}>
            <div id="sec-contact-meta">
              <h3
                className="mb-4"
                style={{
                  fontSize: "var(--slds-g-font-size-6)",
                  fontWeight: 500,
                }}
              >
                Contact Meta Row
              </h3>

              {/* CTM-01 — Phone + Email, dot-separated (matches record header) */}
              <ShowcaseCard
                id="CTM-01"
                title="Contact Meta Row"
                description="Icon + text pairs joined by a middle-dot separator, shown under a record header (phone, email). Muted 13px text."
                cssCode={`.contact-meta-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 13px;\n  color: var(--slds-g-color-text-weak, #706e6b);\n}\n.contact-meta-item {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.contact-meta-item svg {\n  height: 14px;\n  width: 14px;\n  flex-shrink: 0;\n}\n.contact-meta-dot {\n  color: var(--slds-g-color-text-weak, #706e6b);\n}`}
              >
                <ContactMetaRow
                  items={[
                    { icon: Phone, label: "(312) 555-0101" },
                    {
                      icon: Mail,
                      label: "eduardo.martinez@email.com",
                    },
                  ]}
                />
              </ShowcaseCard>

              {/* CTM-02 — Individual meta items */}
              <div className="mt-4">
                <ShowcaseCard
                  id="CTM-02"
                  title="Individual Meta Item"
                  description="A single icon+text pair — the building block of the row above. Reuse with any lucide icon (Phone, Mail, MapPin, etc.)."
                  cssCode={`.contact-meta-item {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 13px;\n  color: var(--slds-g-color-text-weak, #706e6b);\n}\n.contact-meta-item svg {\n  height: 14px;\n  width: 14px;\n  flex-shrink: 0;\n}`}
                >
                  <div className="flex gap-6">
                    {[
                      { icon: Phone, label: "(312) 555-0101" },
                      {
                        icon: Mail,
                        label: "eduardo.martinez@email.com",
                      },
                      { icon: MapPin, label: "Chicago, IL" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="group/item flex flex-col gap-1"
                      >
                        <ContactMetaRow items={[s]} />
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn css=".contact-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #706e6b; }" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ShowcaseCard>
              </div>
            </div>
          </PatternSection>

          {/* ═══ 22. RECORD HEADER (COMPOSITE) ═══ */}
          <PatternSection prefixes={["RHD"]}>
            <div id="sec-record-header">
              <h3
                className="mb-2"
                style={{
                  fontSize: "var(--slds-g-font-size-6)",
                  fontWeight: 500,
                }}
              >
                Record Header (Composite)
              </h3>
              <p
                className="mb-4"
                style={{
                  fontSize: "var(--slds-g-font-size-4)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                The full record header used on Admissions Lead
                Detail — assembled from{" "}
                <code style={{ fontFamily: "monospace" }}>
                  BRD-01
                </code>
                ,{" "}
                <code style={{ fontFamily: "monospace" }}>
                  AVT-01
                </code>
                ,{" "}
                <code style={{ fontFamily: "monospace" }}>
                  AIC-01
                </code>
                ,{" "}
                <code style={{ fontFamily: "monospace" }}>
                  CTM-01
                </code>
                , the standard{" "}
                <code style={{ fontFamily: "monospace" }}>
                  FRM-02
                </code>{" "}
                select (Default, Medium — 36px), and{" "}
                <code style={{ fontFamily: "monospace" }}>
                  STG-01
                </code>
                . Copy the whole block below, or grab the
                individual pieces from their own sections above.
              </p>

              <ShowcaseCard
                id="RHD-01"
                title="Record Header — Full Assembly"
                description="Breadcrumb → avatar + name + alert icons + contact meta → stage select / category select (standard FRM-02 select) / action buttons → pipeline stage tracker. Source: LeadDetailView.tsx."
                cssCode={`.record-header {\n  padding: 16px 20px;\n  background-color: #ffffff;\n  border-bottom: 1px solid #dddbda;\n}\n.record-header__breadcrumb {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 11px;\n  color: #706e6b;\n  margin-bottom: 12px;\n}\n.record-header__breadcrumb-current {\n  font-weight: 500;\n  color: #080707;\n}\n.record-header__row {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  margin-bottom: 16px;\n}\n.record-header__identity {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n}\n.record-header__avatar {\n  height: 48px;\n  width: 48px;\n  border-radius: 9999px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: #ffffff;\n  background-color: #145F33;\n}\n.record-header__name-row {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin-bottom: 4px;\n}\n.record-header__name {\n  font-size: 20px;\n  font-weight: 700;\n  color: #080707;\n}\n.record-header__actions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.record-header__select {\n  height: 36px;\n  padding: 8px 12px;\n  border: 1px solid #dddbda;\n  border-radius: 4px;\n  font-size: 13px;\n  background-color: #ffffff;\n}\n.record-header__select:focus {\n  border-color: #145F33;\n  box-shadow: 0 0 0 3px rgba(20,95,51,0.5);\n  outline: none;\n}\n.record-header__btn-outline {\n  height: 36px;\n  border-radius: 9999px;\n  padding: 0 16px;\n  font-size: 13px;\n  background-color: #ffffff;\n  border: 1px solid #dddbda;\n}\n.record-header__btn-primary {\n  height: 36px;\n  border-radius: 9999px;\n  padding: 0 16px;\n  font-size: 13px;\n  color: #ffffff;\n  background-color: #145F33;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  border: none;\n}\n.record-header__days-label {\n  font-size: 12px;\n  color: #706e6b;\n  text-align: right;\n  margin-bottom: 8px;\n}\n.record-header__days-label strong {\n  color: #080707;\n  font-weight: 700;\n}`}
              >
                <div
                  className="rounded-lg overflow-hidden"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <div
                    style={{
                      padding: "16px 20px",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    {/* Breadcrumb */}
                    <div
                      className="flex items-center gap-2 mb-3"
                      style={{
                        fontSize: "11px",
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      <span>Admissions</span>
                      <ChevronRight className="h-3 w-3" />
                      <span
                        style={{
                          fontWeight: 500,
                          color: "#080707",
                        }}
                      >
                        Sophia Martinez
                      </span>
                    </div>

                    {/* Identity row + actions */}
                    <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        <Avatar
                          size="lg"
                          className="flex-shrink-0"
                        >
                          <AvatarFallback
                            size="lg"
                            color="primary"
                          >
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h1
                              style={{
                                fontSize: "20px",
                                fontWeight: 700,
                                color: "#080707",
                              }}
                            >
                              Sophia Martinez
                            </h1>
                            <AlertIconCluster
                              kinds={[
                                "restraints",
                                "medical",
                                "dietary",
                              ]}
                            />
                          </div>
                          <ContactMetaRow
                            items={[
                              {
                                icon: Phone,
                                label: "(312) 555-0909",
                              },
                              {
                                icon: Mail,
                                label:
                                  "eduardo.martinez@email.com",
                              },
                            ]}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Select defaultValue="Assessments">
                          <SelectTrigger size="default">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "Referral",
                              "Info Session",
                              "Assessments",
                              "Shadow & FPM",
                              "Staffing",
                              "Move-In",
                            ].map((o) => (
                              <SelectItem key={o} value={o}>
                                {o}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              fontSize: "13px",
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Category:
                          </span>
                          <Select defaultValue="Referral">
                            <SelectTrigger size="default">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                "Referral",
                                "Info Session Scheduled",
                                "Program Waitlist",
                                "Delayed",
                                "Closed",
                              ].map((o) => (
                                <SelectItem key={o} value={o}>
                                  {o}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="outline"
                          className="text-[length:var(--slds-g-font-size-4)]"
                        >
                          + New Log
                        </Button>
                        <Button
                          variant="default"
                          className="text-[length:var(--slds-g-font-size-4)]"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Convert to Active
                        </Button>
                      </div>
                    </div>

                    {/* Pipeline progress */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            color: "#080707",
                          }}
                        >
                          PIPELINE PROGRESS
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#706e6b",
                          }}
                        >
                          <strong
                            style={{
                              color: "#080707",
                              fontWeight: 700,
                            }}
                          >
                            6
                          </strong>{" "}
                          Days in Shadow &amp; FPM
                        </span>
                      </div>
                      <Stepper
                        variant="chevron"
                        steps={[
                          {
                            label: "Referral",
                            status: "completed",
                          },
                          {
                            label: "Info Session",
                            status: "completed",
                          },
                          {
                            label: "Assessments",
                            status: "current",
                          },
                          {
                            label: "Shadow & FPM",
                            status: "upcoming",
                          },
                          {
                            label: "Staffing",
                            status: "upcoming",
                          },
                          {
                            label: "Move-In",
                            status: "upcoming",
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </ShowcaseCard>
            </div>
          </PatternSection>

          {/* ═══ 18. SF DOWNLOADS ═══ */}
          <PatternSection prefixes={["SFD"]}>
            <div id="sec-sf-downloads">
              <h3
                className="mb-3"
                style={{
                  fontSize: "var(--slds-g-font-size-6)",
                  fontWeight: 500,
                }}
              >
                Salesforce Integration Downloads
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ShowcaseCard
                  id="SFD-01"
                  title="Download Card — Salesforce Token Mapping"
                  cssCode={`.dl-card { display: flex; align-items: center; justify-content: space-between; padding: 16px; border-radius: 8px; border: 1px solid #dddbda; background-color: #fafaf9; }\n.dl-card__title { font-size: 14px; font-weight: 500; }\n.dl-card__desc { font-size: 12px; color: #706e6b; }\n.dl-card__btn { display: flex; align-items: center; gap: 8px; color: #ffffff; background-color: #145F33; padding: 6px 12px; border-radius: 4px; font-size: 13px; border: none; }`}
                >
                  <DownloadCard
                    title="Salesforce Token Mapping"
                    description="JSON mapping for Lightning Design System"
                    format="json"
                    onDownload={() =>
                      downloadFile(
                        generateSalesforceTokensJSON(),
                        "mercy-home-salesforce-mapping.json",
                        "application/json",
                      )
                    }
                  />
                </ShowcaseCard>
                <ShowcaseCard
                  id="SFD-02"
                  title="Download Card — Complete Design Tokens"
                  cssCode={`.dl-card { display: flex; align-items: center; justify-content: space-between; padding: 16px; border-radius: 8px; border: 1px solid #dddbda; background-color: #fafaf9; }\n.dl-card__title { font-size: 14px; font-weight: 500; }\n.dl-card__desc { font-size: 12px; color: #706e6b; }\n.dl-card__btn { display: flex; align-items: center; gap: 8px; color: #ffffff; background-color: #145F33; padding: 6px 12px; border-radius: 4px; font-size: 13px; border: none; }`}
                >
                  <DownloadCard
                    title="Complete Design Tokens"
                    description="Full token set — colors, typography, spacing, shadows"
                    format="json"
                    onDownload={() =>
                      downloadFile(
                        generateAllTokensJSON(),
                        "mercy-home-tokens-complete.json",
                        "application/json",
                      )
                    }
                  />
                </ShowcaseCard>
              </div>
            </div>
          </PatternSection>

          <PatternSection prefixes={["SLD"]}>
            <SliderSection />
          </PatternSection>

          {/* ═══ 1. STATUS BADGES ═══ */}
          <PatternSection prefixes={["SBG"]}>
            <div id="sec-status-badges">
              <h3
                className="mb-2"
                style={{
                  fontSize: "var(--slds-g-font-size-6)",
                  fontWeight: 500,
                }}
              >
                Status Badges (5 Approved Statuses)
              </h3>
              <p className="mb-4 text-[12px] text-[#706e6b]">
                Only these 5 status values are permitted in the
                TotalLeadsView status column.
              </p>
              <ShowcaseCard
                id="SBG-01"
                title="Status Badges — Approved Statuses + General Variants"
                description="The 5 status values permitted in the TotalLeadsView status column, plus Badge's two solid-fill variants (Primary, Count) shown alongside for combination coverage -- those two aren't TotalLeadsView statuses, and (like `accent`) don't render a visible border, so their bordered rows below look identical to their unbordered ones. Shown here in every combination the Badge component supports: both sizes, both border states."
                cssCode={`.status-badge { display: inline-flex; align-items: center; justify-content: center; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 500; }\n.status-badge--lg { padding: 4px 12px; font-size: 12px; }\n.status-badge--referral { background-color: #e6f4ea; color: #145F33; }\n.status-badge--info-session { background-color: #e0f2fe; color: #005EA2; }\n.status-badge--waitlist { background-color: #fef3c7; color: #92400e; }\n.status-badge--delayed { background-color: #fce4ec; color: #A82031; }\n.status-badge--closed { background-color: #f3f2f2; color: #706e6b; }\n.status-badge--primary { background-color: #145F33; color: #ffffff; }\n.status-badge--count { background-color: #E86C24; color: #ffffff; }\n.status-badge--referral.status-badge--bordered { border: 1px solid #a8d5b8; }\n.status-badge--info-session.status-badge--bordered { border: 1px solid #7dd3fc; }\n.status-badge--waitlist.status-badge--bordered { border: 1px solid #fcd34d; }\n.status-badge--delayed.status-badge--bordered { border: 1px solid #f48fb1; }\n.status-badge--closed.status-badge--bordered { border: 1px solid #c9c7c5; }\n.status-badge--primary.status-badge--bordered,\n.status-badge--count.status-badge--bordered { border: 1px solid transparent; }`}
              >
                <div className="flex flex-col gap-4">
                  {[
                    {
                      rowLabel: "Small",
                      size: "default" as const,
                      bordered: false,
                    },
                    {
                      rowLabel: "Small — Bordered",
                      size: "default" as const,
                      bordered: true,
                    },
                    {
                      rowLabel: "Large",
                      size: "lg" as const,
                      bordered: false,
                    },
                    {
                      rowLabel: "Large — Bordered",
                      size: "lg" as const,
                      bordered: true,
                    },
                  ].map((row) => (
                    <div key={row.rowLabel}>
                      <p
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#706e6b",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          marginBottom: "6px",
                        }}
                      >
                        {row.rowLabel}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {[
                          {
                            label: "Referral",
                            variant: "success" as const,
                            bg: "#e6f4ea",
                            text: "#145F33",
                            border: "#a8d5b8",
                          },
                          {
                            label: "Info Session",
                            variant: "info" as const,
                            bg: "#e0f2fe",
                            text: "#005EA2",
                            border: "#7dd3fc",
                          },
                          {
                            label: "Program Waitlist",
                            variant: "warning" as const,
                            bg: "#fef3c7",
                            text: "#92400e",
                            border: "#fcd34d",
                          },
                          {
                            label: "Delayed",
                            variant: "error" as const,
                            bg: "#fce4ec",
                            text: "#A82031",
                            border: "#f48fb1",
                          },
                          {
                            label: "Closed",
                            variant: "neutral" as const,
                            bg: "#f3f2f2",
                            text: "#706e6b",
                            border: "#c9c7c5",
                          },
                          {
                            label: "Primary",
                            variant: "default" as const,
                            bg: "#145F33",
                            text: "#ffffff",
                            border: "#145F33",
                          },
                          {
                            label: "Count: 12",
                            variant: "accent" as const,
                            bg: "#E86C24",
                            text: "#ffffff",
                            border: "#E86C24",
                          },
                        ].map((s) => {
                          const padding =
                            row.size === "lg"
                              ? "4px 12px"
                              : "2px 10px";
                          const fontSize =
                            row.size === "lg" ? "12px" : "11px";
                          const border = row.bordered
                            ? `1px solid ${s.border}`
                            : "none";
                          return (
                            <div
                              key={s.label}
                              className="group/item flex flex-col items-center gap-1.5"
                            >
                              <Badge
                                variant={s.variant}
                                bordered={row.bordered}
                                size={row.size}
                              >
                                {s.label}
                              </Badge>
                              <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <CopyCSSBtn
                                  css={`
                                    .status-badge--${s.variant} {
                                      display: inline-flex;
                                      align-items: center;
                                      justify-content: center;
                                      padding: ${padding};
                                      border-radius: 9999px;
                                      font-size: ${fontSize};
                                      font-weight: 500;
                                      background-color: ${s.bg};
                                      color: ${s.text};
                                      border: ${border};
                                    }
                                  `}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ShowcaseCard>
            </div>
          </PatternSection>

          {/* ═══ 24. SIDE NAVIGATION ═══ */}
          <PatternSection prefixes={["SNV"]}>
            <div id="sec-side-nav">
              <h3
                className="mb-2"
                style={{
                  fontSize: "var(--slds-g-font-size-6)",
                  fontWeight: 500,
                }}
              >
                Side Navigation
              </h3>
              <p
                className="mb-4"
                style={{
                  fontSize: "var(--slds-g-font-size-4)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                The module-level left nav used inside feature
                areas with multiple pages and hierarchy (e.g.
                Medications). Broken into its parts below — L1
                standalone item, section label, L1 expandable
                group, L2 sub-item — plus a fully working
                assembly. Source: Medications.tsx.
              </p>

              {/* SNV-01 — L1 standalone item (flat, no children) */}
              <ShowcaseCard
                id="SNV-01"
                title="L1 Item — Standalone"
                description="A top-level nav item with no children. Active state: solid brand-green background, white text, 3px darker-green left border. Inactive: transparent, default text, transparent left border."
                cssCode={`.side-nav__l1-item {\n  width: 100%;\n  padding: 8px 16px;\n  text-align: left;\n  font-size: 13px;\n  font-weight: 500;\n  line-height: 1.2;\n  border-left-width: 3px;\n  border-left-style: solid;\n  border-left-color: transparent;\n  background-color: transparent;\n  color: var(--slds-g-color-text-default, #080707);\n  transition: background-color 0.15s, color 0.15s;\n}\n.side-nav__l1-item--active {\n  background-color: #145F33;\n  color: #ffffff;\n  border-left-color: #0e4524;\n}`}
              >
                <SideNav>
                  <SideNavItem active>
                    Home (active)
                  </SideNavItem>
                  <SideNavItem>Home (default)</SideNavItem>
                </SideNav>
              </ShowcaseCard>

              {/* SNV-02 — Section label */}
              <div className="mt-4">
                <ShowcaseCard
                  id="SNV-02"
                  title="Section Label"
                  description="Small uppercase group heading above a set of related L1 items (e.g. 'ADMINISTRATION'). Not clickable."
                  cssCode={`.side-nav__section-label {\n  padding: 0 16px 6px;\n  font-size: 10px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  color: var(--slds-g-color-text-weak, #706e6b);\n}`}
                >
                  <SideNav className="py-2">
                    <SideNavSectionLabel>
                      Administration
                    </SideNavSectionLabel>
                  </SideNav>
                </ShowcaseCard>
              </div>

              {/* SNV-03 — L1 expandable group trigger */}
              <div className="mt-4">
                <ShowcaseCard
                  id="SNV-03"
                  title="L1 Group — Expandable"
                  description="A top-level item that owns children (like Med Review Hub). Shows a chevron and toggles between up/down. Its active/highlighted state fires when any of its own children is the current selection, not just itself."
                  cssCode={`.side-nav__l1-group {\n  width: 100%;\n  padding: 8px 16px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  font-size: 13px;\n  font-weight: 500;\n  border-left-width: 3px;\n  border-left-style: solid;\n  border-left-color: transparent;\n  background-color: transparent;\n  color: var(--slds-g-color-text-default, #080707);\n}\n.side-nav__l1-group--active {\n  background-color: #145F33;\n  color: #ffffff;\n  border-left-color: #0e4524;\n}\n.side-nav__l1-group svg { width: 14px; height: 14px; flex-shrink: 0; }`}
                >
                  <SideNav>
                    <SideNavGroup
                      active
                      expanded
                      label="Med Review Hub (expanded)"
                    />
                    <SideNavGroup
                      active={false}
                      expanded={false}
                      label="Med Review Hub (collapsed)"
                    />
                  </SideNav>
                </ShowcaseCard>
              </div>

              {/* SNV-04 — L2 sub-item */}
              <div className="mt-4">
                <ShowcaseCard
                  id="SNV-04"
                  title="L2 Item — Sub-item"
                  description="Indented child item shown only while its parent L1 group is expanded. Active state uses a light green tint (not solid fill like L1), green text, and a green left border — visually distinct from an active L1 item."
                  cssCode={`.side-nav__l2-item {\n  width: 100%;\n  padding: 6px 16px 6px 32px;\n  text-align: left;\n  font-size: 13px;\n  font-weight: 500;\n  border-left-width: 3px;\n  border-left-style: solid;\n  border-left-color: transparent;\n  background-color: transparent;\n  color: var(--slds-g-color-text-default, #080707);\n}\n.side-nav__l2-item--active {\n  background-color: rgba(20, 95, 51, 0.12);\n  color: #145F33;\n  border-left-color: #145F33;\n}`}
                >
                  <SideNav>
                    {[
                      { l: "Med Review Hub", active: false },
                      { l: "Med Documentation", active: true },
                      { l: "Count", active: false },
                      { l: "Med Cart", active: false },
                    ].map((item) => (
                      <SideNavSubItem
                        key={item.l}
                        active={item.active}
                      >
                        {item.l}
                      </SideNavSubItem>
                    ))}
                  </SideNav>
                </ShowcaseCard>
              </div>

              {/* SNV-05 — Full working assembly */}
              <div className="mt-4">
                <ShowcaseCard
                  id="SNV-05"
                  title="Full Assembly — Working Nav"
                  description="All four pieces composed together with the real interaction logic: clicking the group header expands it and selects its first child; clicking any L2 item selects it and keeps the group expanded; clicking a flat L1 item selects it and collapses the group. Try it."
                  cssCode={`.side-nav { width: 224px; display: flex; flex-direction: column; border-right: 1px solid #dddbda; background-color: var(--slds-g-color-background-alt); }\n.side-nav__l1-item, .side-nav__l1-group, .side-nav__l2-item { width: 100%; text-align: left; border-left-width: 3px; border-left-style: solid; border-left-color: transparent; background: none; }\n.side-nav__l1-item, .side-nav__l1-group { padding: 8px 16px; font-size: 13px; font-weight: 500; }\n.side-nav__l2-item { padding: 6px 16px 6px 32px; font-size: 13px; font-weight: 500; }\n.side-nav__l1-item--active, .side-nav__l1-group--active { background-color: #145F33; color: #ffffff; border-left-color: #0e4524; }\n.side-nav__l2-item--active { background-color: rgba(20,95,51,0.12); color: #145F33; border-left-color: #145F33; }`}
                >
                  <SideNavDemo />
                </ShowcaseCard>
              </div>
            </div>
          </PatternSection>

          {/* ═══ 23. STATUS INDICATOR ROW ═══ */}
          <PatternSection prefixes={["STR"]}>
            <div id="sec-status-row">
              <h3
                className="mb-2"
                style={{
                  fontSize: "var(--slds-g-font-size-6)",
                  fontWeight: 500,
                }}
              >
                Status Indicator Row
              </h3>
              <p
                className="mb-4"
                style={{
                  fontSize: "var(--slds-g-font-size-4)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                The colored dashboard-card rows used in widgets
                like Medications (Program Detail sidebar) — a
                colored dot, label, meta line, count, and
                chevron, tinted by completion status. Source:
                ProgramDetailView.tsx.
              </p>

              {/* STR-01 — the 3 official production states */}
              <ShowcaseCard
                id="STR-01"
                title="Status Row — Completion States"
                description="Green = Complete (documented & counted match total), Yellow = In Progress (partial), Red = Not Started (nothing documented or counted). These are the only 3 states the Medications widget actually computes."
                cssCode={`.status-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px;\n  border-radius: 6px;\n  cursor: pointer;\n}\n.status-row__dot {\n  width: 10px;\n  height: 10px;\n  border-radius: 9999px;\n  flex-shrink: 0;\n}\n.status-row__label {\n  font-size: 12px;\n  font-weight: 500;\n  color: var(--slds-g-color-text-default);\n}\n.status-row__meta {\n  font-size: 10px;\n  color: var(--slds-g-color-text-weak);\n}\n.status-row__count {\n  font-size: 16px;\n  font-weight: 700;\n  color: var(--slds-g-color-text-default);\n}\n.status-row--complete {\n  background-color: #d1fae5;\n  border: 1px solid #10b98140;\n}\n.status-row--complete .status-row__dot {\n  background-color: #10b981;\n}\n.status-row--in-progress {\n  background-color: #fef3c7;\n  border: 1px solid #f59e0b40;\n}\n.status-row--in-progress .status-row__dot {\n  background-color: #f59e0b;\n}\n.status-row--not-started {\n  background-color: #fee2e2;\n  border: 1px solid #ef444440;\n}\n.status-row--not-started .status-row__dot {\n  background-color: #ef4444;\n}`}
              >
                <div className="space-y-2">
                  {(
                    [
                      {
                        l: "Morning",
                        meta: "Documented: 2 • Counted: 2",
                        count: 2,
                        state: "complete",
                      },
                      {
                        l: "Afternoon",
                        meta: "Documented: 1 • Counted: 0",
                        count: 1,
                        state: "in-progress",
                      },
                      {
                        l: "Evening",
                        meta: "Documented: 0 • Counted: 0",
                        count: 1,
                        state: "not-started",
                      },
                    ] as {
                      l: string;
                      meta: string;
                      count: number;
                      state: StatusIndicatorTone;
                    }[]
                  ).map((s) => (
                    <div key={s.l} className="group/item">
                      <StatusIndicatorRow
                        label={s.l}
                        meta={s.meta}
                        count={s.count}
                        tone={s.state}
                      />
                      <div className="opacity-0 group-hover/item:opacity-100 transition-opacity mt-1">
                        <CopyCSSBtn
                          css={`
                            .status-row--${s.state} {
                              background-color: ${STATUS_INDICATOR_TONE[s.state].bg};
                              border: 1px solid
                                ${STATUS_INDICATOR_TONE[s.state].dot}40;
                            }
                            \n.status-row--${s.state}
                              .status-row__dot {
                              background-color: ${STATUS_INDICATOR_TONE[s.state].dot};
                            }
                          `}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ShowcaseCard>

              {/* STR-02 — Orange, extended state (not an official production value for this widget) */}
              <div className="mt-4">
                <ShowcaseCard
                  id="STR-02"
                  title="Status Row — Extended (Orange)"
                  description="Not one of the Medications widget's own states — the production logic only computes Green/Yellow/Red. This uses the existing design-system orange (#E86C24, the same color as the Count badge in Status Badges and the avatar-presence dots) for cases elsewhere in the app that need a 4th 'Attention' tier."
                  cssCode={`.status-row--attention {\n  background-color: #fde8d7;\n  border: 1px solid #E86C2440;\n}\n.status-row--attention .status-row__dot {\n  background-color: #E86C24;\n}`}
                >
                  <StatusIndicatorRow
                    label="Needs Attention"
                    meta="Documented: 1 • Counted: 2"
                    count={2}
                    tone="attention"
                  />
                </ShowcaseCard>
              </div>

              {/* STR-03 — Full widget assembly, matching the screenshot */}
              <div className="mt-4">
                <ShowcaseCard
                  id="STR-03"
                  title="Medications Card — Full Widget"
                  description="The complete sidebar card: header (icon + title + external-link affordance) and stacked status rows, matching the Program Detail 'Medications' widget."
                  cssCode={`.med-card {\n  border-radius: var(--slds-c-card-radius-border);\n  border: 1px solid var(--slds-g-color-border-base-1);\n  background-color: var(--slds-g-color-background-base);\n  overflow: hidden;\n}\n.med-card__header {\n  padding: 12px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border-bottom: 1px solid var(--slds-g-color-border-base-1);\n  background-color: var(--slds-g-color-background-alt);\n  cursor: pointer;\n}\n.med-card__title {\n  font-size: 12px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.025em;\n}\n.med-card__body {\n  padding: 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}`}
                >
                  <Card
                    variant="section"
                    className="max-w-[320px]"
                  >
                    <CardHeader
                      separated
                      className="p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-[var(--slds-g-color-text-weak)]" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--slds-g-color-text-default)]">
                          Medications
                        </span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-[var(--slds-g-color-text-weak)]" />
                    </CardHeader>
                    <CardContent className="p-3 space-y-2">
                      {(
                        [
                          {
                            l: "Morning",
                            meta: "Documented: 1 • Counted: 1",
                            count: 2,
                            tone: "in-progress",
                          },
                          {
                            l: "Afternoon",
                            meta: "Documented: 1 • Counted: 0",
                            count: 1,
                            tone: "in-progress",
                          },
                          {
                            l: "Evening",
                            meta: "Documented: 0 • Counted: 0",
                            count: 1,
                            tone: "not-started",
                          },
                          {
                            l: "Bedtime",
                            meta: "Documented: 0 • Counted: 0",
                            count: 2,
                            tone: "not-started",
                          },
                        ] as {
                          l: string;
                          meta: string;
                          count: number;
                          tone: StatusIndicatorTone;
                        }[]
                      ).map((s) => (
                        <StatusIndicatorRow
                          key={s.l}
                          label={s.l}
                          meta={s.meta}
                          count={s.count}
                          tone={s.tone}
                        />
                      ))}
                    </CardContent>
                  </Card>
                </ShowcaseCard>
              </div>
            </div>
          </PatternSection>

          {/* ═══ 7. TABS ═══ */}
          <PatternSection prefixes={["TAB"]}>
            <div id="sec-tabs">
              <h3
                className="mb-4"
                style={{
                  fontSize: "var(--slds-g-font-size-6)",
                  fontWeight: 500,
                }}
              >
                Tab Indicators
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ShowcaseCard
                  id="TAB-01"
                  title="Primary Tabs"
                  cssCode={`.tab-primary { font-size: 14px; font-weight: 500; color: #706e6b; padding-bottom: 8px; border-bottom: 3px solid transparent; }\n.tab-primary--active { color: #145F33; border-bottom-color: #145F33; }`}
                >
                  <Tabs defaultValue="Overview">
                    <TabsList
                      variant="underline"
                      className="w-full gap-6"
                    >
                      {[
                        "Overview",
                        "Clinical",
                        "Education",
                      ].map((tab) => (
                        <TabsTrigger
                          key={tab}
                          value={tab}
                          variant="underline"
                          size="default"
                          className="px-0"
                        >
                          {tab}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </ShowcaseCard>
                <ShowcaseCard
                  id="TAB-02"
                  title="Sub-tabs (Scrollable)"
                  cssCode={`.tab-sub { font-size: 13px; font-weight: 500; color: #706e6b; padding-bottom: 8px; border-bottom: 3px solid transparent; white-space: nowrap; }\n.tab-sub--active { color: #145F33; border-bottom-color: #145F33; }`}
                >
                  <Tabs defaultValue="Constituent Details">
                    <TabsList
                      variant="underline"
                      className="w-full overflow-x-auto gap-4 pb-1"
                    >
                      {[
                        "Constituent Details",
                        "Program Enrolment",
                        "CPI",
                        "Relationships",
                        "Connections",
                        "Documents",
                        "Contact Log",
                      ].map((tab) => (
                        <TabsTrigger
                          key={tab}
                          value={tab}
                          variant="underline"
                          size="sm"
                          className="px-0"
                        >
                          {tab}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </ShowcaseCard>
              </div>
            </div>
          </PatternSection>

          {/* ═══ 17. TIMELINE ═══ */}
          <PatternSection prefixes={["TML"]}>
            <div id="sec-timeline">
              <h3
                className="mb-4"
                style={{
                  fontSize: "var(--slds-g-font-size-6)",
                  fontWeight: 500,
                }}
              >
                Activity Timeline
              </h3>
              <ShowcaseCard
                id="TML-01"
                title="Activity Timeline"
                description="Vertical timeline: icon-in-circle connected by a line, with title/timestamp/detail per entry. Icon and background color vary by activity type."
                cssCode={`.timeline { display: flex; flex-direction: column; }\n.timeline-item { display: flex; gap: 12px; }\n.timeline-icon { width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }\n.timeline-connector { width: 2px; flex: 1; margin: 4px 0; background-color: #dddbda; }\n.timeline-item__title { font-size: 14px; font-weight: 500; }\n.timeline-item__time { font-size: 13px; color: #706e6b; }\n.timeline-item__detail { font-size: 14px; color: #706e6b; margin-top: 4px; }`}
              >
                <Timeline
                  className="max-w-lg"
                  items={[
                    {
                      icon: Phone,
                      tone: "success",
                      title: "Phone Call with Guardian",
                      time: "Today, 2:30 PM",
                      detail: "Discussed enrollment timeline.",
                    },
                    {
                      icon: FileText,
                      tone: "info",
                      title: "Document Uploaded",
                      time: "Yesterday, 10:15 AM",
                      detail: "Birth certificate uploaded.",
                    },
                    {
                      icon: MessageSquare,
                      tone: "accent",
                      title: "Contact Log Entry",
                      time: "Feb 24, 2026",
                      detail:
                        "Initial intake interview completed.",
                    },
                    {
                      icon: CheckCircle,
                      tone: "success",
                      title: "Status Changed",
                      time: "Feb 22, 2026",
                      detail: "Referral → Info Session.",
                    },
                  ]}
                />
              </ShowcaseCard>
            </div>
          </PatternSection>

          <PatternSection prefixes={["TST"]}>
            <ToastSection />
          </PatternSection>

          {/* ═══ 16. TOOLTIPS ═══ */}
          <PatternSection prefixes={["TTP"]}>
            <div id="sec-tooltips">
              <h3
                className="mb-4"
                style={{
                  fontSize: "var(--slds-g-font-size-6)",
                  fontWeight: 500,
                }}
              >
                Tooltips & Popovers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ShowcaseCard
                  id="TTP-01"
                  title="Dark Tooltip"
                  cssCode={`.tooltip--dark { background-color: #183242; color: #ffffff; font-size: 12px; padding: 6px 12px; border-radius: 4px; position: relative; }\n.tooltip--dark::after { content: ''; position: absolute; left: 50%; bottom: -4px; transform: translateX(-50%) rotate(45deg); width: 8px; height: 8px; background-color: #183242; }`}
                >
                  <div className="flex flex-col items-center py-2">
                    <Tooltip>
                      {/* A disabled native <button> doesn't reliably fire the
                      hover/focus events Radix's Tooltip listens for, so the
                      trigger wraps it in a plain focusable <span> instead --
                      the standard pattern for "tooltip on a disabled
                      control" (see Radix docs), and a real, hover-driven
                      tooltip rather than one forced permanently open. */}
                      <TooltipTrigger asChild>
                        <span
                          tabIndex={0}
                          className="inline-flex"
                        >
                          <Button
                            variant="outline"
                            size="icon"
                            disabled
                            aria-label="Delete (disabled)"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent tone="dark">
                        Delete disabled for primary contact
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </ShowcaseCard>
                <ShowcaseCard
                  id="TTP-02"
                  title="Light Popover"
                  cssCode={`.popover--light { border: 1px solid #dddbda; border-radius: 8px; padding: 12px 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); font-size: 13px; }`}
                >
                  <div className="flex flex-col items-center py-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Show info"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto">
                        <p className="font-medium">
                          Quick Info
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Additional context
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>
                </ShowcaseCard>
                <ShowcaseCard
                  id="TTP-03"
                  title="Dropdown Menu"
                  cssCode={`.dropdown-menu { border: 1px solid #dddbda; border-radius: 8px; padding: 4px 0; background-color: #ffffff; min-width: 160px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }\n.dropdown-item { width: 100%; display: flex; align-items: center; gap: 8px; padding: 6px 12px; font-size: 13px; }\n.dropdown-item:hover { background-color: #f3f2f2; }\n.dropdown-item--destructive { color: #A82031; }`}
                >
                  <div className="flex flex-col items-center py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="More actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4" /> View
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4" /> Edit
                          Record
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4" />{" "}
                          Open in SF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </ShowcaseCard>
              </div>
            </div>
          </PatternSection>

          {/* ═══ Ported from VMS Portal — rebuilt in Staff's design language ═══ */}
          <StarRatingSection />
          <SSNFieldSection />
          <DocumentAgreementSection />
          <SignaturePadSection />
          <MentorMatchSection />
        </div>
      </div>
    </PatternFilterContext.Provider>
  );
}