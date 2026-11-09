import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Download,
  Copy,
  Check,
  Palette,
  Type,
  Grid3X3,
  Square,
  Layers,
  Sun,
  Moon,
  ChevronRight,
  Users,
  FileText,
  Calendar,
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
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { useNavigate, useSearchParams } from "react-router";
import { ComponentsTabContent } from "./ComponentsTabContent";
import { formatMdy } from "../../lib/dateFormat";
import { createZip } from "../../lib/zip";
import { generateComponentsCSS } from "./components-showcase/componentsCssRegistry";
import defaultThemeCssRaw from "../../../styles/default_theme.css?raw";
import globalsCssRaw from "../../../styles/globals.css?raw";

type TabKey =
  | "colors"
  | "typography"
  | "spacing"
  | "borders"
  | "shadows"
  | "components";

// ─── Data Definitions ───
const brandColors = [
  {
    name: "Mercy Green (Primary)",
    token: "--color-brand-primary",
    value: "#145F33",
    usage: "Primary brand color, active states, links, buttons",
  },
  {
    name: "Action Maroon (Secondary)",
    token: "--color-brand-secondary",
    value: "#A82031",
    usage: "Secondary actions, destructive states, accents",
  },
  {
    name: "Deep Slate (Tertiary)",
    token: "--color-brand-tertiary",
    value: "#183242",
    usage: "Dark backgrounds, footer, headings",
  },
  {
    name: "Hope Orange (Accent)",
    token: "--color-brand-accent",
    value: "#E86C24",
    usage: "Highlights, call-to-action, attention grabbers",
  },
  {
    name: "Link Blue",
    token: "--color-link-blue",
    value: "#005EA2",
    usage: "Hyperlinks, informational elements",
  },
];

const neutralColors = [
  {
    name: "Neutral 100",
    token: "--slds-g-color-neutral-base-100",
    value: "#ffffff",
  },
  {
    name: "Neutral 95",
    token: "--slds-g-color-neutral-base-95",
    value: "#fafaf9",
  },
  {
    name: "Neutral 90",
    token: "--slds-g-color-neutral-base-90",
    value: "#f3f2f2",
  },
  {
    name: "Neutral 80",
    token: "--slds-g-color-neutral-base-80",
    value: "#ecebea",
  },
  {
    name: "Neutral 70",
    token: "--slds-g-color-neutral-base-70",
    value: "#dddbda",
  },
  {
    name: "Neutral 60",
    token: "--slds-g-color-neutral-base-60",
    value: "#c9c7c5",
  },
  {
    name: "Neutral 50",
    token: "--slds-g-color-neutral-base-50",
    value: "#706e6b",
  },
  {
    name: "Neutral 40",
    token: "--slds-g-color-neutral-base-40",
    value: "#514f4d",
  },
  {
    name: "Neutral 30",
    token: "--slds-g-color-neutral-base-30",
    value: "#3e3e3c",
  },
  {
    name: "Neutral 10",
    token: "--slds-g-color-neutral-base-10",
    value: "#080707",
  },
];

const semanticColors = [
  {
    name: "Success 10",
    token: "--slds-g-color-success-base-10",
    value: "#071b12",
    category: "Success",
  },
  {
    name: "Success 50",
    token: "--slds-g-color-success-base-50",
    value: "#2e844a",
    category: "Success",
  },
  {
    name: "Success 60",
    token: "--slds-g-color-success-base-60",
    value: "#45c65a",
    category: "Success",
  },
  {
    name: "Warning 10",
    token: "--slds-g-color-warning-base-10",
    value: "#4a2413",
    category: "Warning",
  },
  {
    name: "Warning 50",
    token: "--slds-g-color-warning-base-50",
    value: "#b28500",
    category: "Warning",
  },
  {
    name: "Warning 60",
    token: "--slds-g-color-warning-base-60",
    value: "#fed35a",
    category: "Warning",
  },
  {
    name: "Warning 70",
    token: "--slds-g-color-warning-base-70",
    value: "#fef8e6",
    category: "Warning",
  },
  {
    name: "Error 10",
    token: "--slds-g-color-error-base-10",
    value: "#2f030a",
    category: "Error",
  },
  {
    name: "Error 50",
    token: "--slds-g-color-error-base-50",
    value: "#ba0517",
    category: "Error",
  },
  {
    name: "Error 60",
    token: "--slds-g-color-error-base-60",
    value: "#ea001e",
    category: "Error",
  },
];

const brandReferenceColors = [
  {
    name: "Brand Reference 10",
    token: "--slds-g-color-brand-base-10",
    value: "#001639",
  },
  {
    name: "Brand Reference 20",
    token: "--slds-g-color-brand-base-20",
    value: "#032d60",
  },
  {
    name: "Brand Reference 30",
    token: "--slds-g-color-brand-base-30",
    value: "#014486",
  },
  {
    name: "Brand Reference 40",
    token: "--slds-g-color-brand-base-40",
    value: "#0176d3",
  },
  {
    name: "Brand Reference 50",
    token: "--slds-g-color-brand-base-50",
    value: "#0070d2",
  },
  {
    name: "Brand Reference 60",
    token: "--slds-g-color-brand-base-60",
    value: "#1b96ff",
  },
];

const textColors = [
  {
    name: "Default Text",
    token: "--slds-g-color-text-default",
    value: "#080707",
  },
  {
    name: "Weak Text",
    token: "--slds-g-color-text-weak",
    value: "#706e6b",
  },
  {
    name: "Placeholder",
    token: "--slds-g-color-text-placeholder",
    value: "#c9c7c5",
  },
  {
    name: "Inverse Text",
    token: "--slds-g-color-text-inverse",
    value: "#ffffff",
  },
  {
    name: "Link",
    token: "--slds-g-color-text-link",
    value: "#014486",
  },
  {
    name: "Link Hover",
    token: "--slds-g-color-text-link-hover",
    value: "#032d60",
  },
];

const backgroundColors = [
  {
    name: "Base",
    token: "--slds-g-color-background-base",
    value: "#ffffff",
  },
  {
    name: "Alt",
    token: "--slds-g-color-background-alt",
    value: "#fafaf9",
  },
  {
    name: "Alt 2",
    token: "--slds-g-color-background-alt-2",
    value: "#f3f2f2",
  },
  {
    name: "Row Hover",
    token: "--slds-g-color-background-row-hover",
    value: "#f3f2f2",
  },
  {
    name: "Row Selected",
    token: "--slds-g-color-background-row-selected",
    value: "#e8f4f9",
  },
];

const fontSizes = [
  {
    name: "Size 1",
    token: "--slds-g-font-size-1",
    value: "0.625rem",
    px: "10px",
    usage: "Very small, badges",
  },
  {
    name: "Size 2",
    token: "--slds-g-font-size-2",
    value: "0.6875rem",
    px: "11px",
    usage: "Small labels",
  },
  {
    name: "Size 3",
    token: "--slds-g-font-size-3",
    value: "0.75rem",
    px: "12px",
    usage: "Labels, metadata",
  },
  {
    name: "Size 4",
    token: "--slds-g-font-size-4",
    value: "0.8125rem",
    px: "13px",
    usage: "Buttons, form inputs",
  },
  {
    name: "Size 5",
    token: "--slds-g-font-size-5",
    value: "0.875rem",
    px: "14px",
    usage: "Body text small",
  },
  {
    name: "Size 6",
    token: "--slds-g-font-size-6",
    value: "1rem",
    px: "16px",
    usage: "Body text (default)",
  },
  {
    name: "Size 7",
    token: "--slds-g-font-size-7",
    value: "1.25rem",
    px: "20px",
    usage: "Large body, h4",
  },
  {
    name: "Size 8",
    token: "--slds-g-font-size-8",
    value: "1.5rem",
    px: "24px",
    usage: "h3, page titles",
  },
  {
    name: "Size 9",
    token: "--slds-g-font-size-9",
    value: "1.75rem",
    px: "28px",
    usage: "h2",
  },
  {
    name: "Size 10",
    token: "--slds-g-font-size-10",
    value: "2rem",
    px: "32px",
    usage: "h1, hero text",
  },
];

const spacingTokens = [
  {
    name: "xxx-small",
    token: "--slds-c-spacing-xxx-small",
    value: "0.125rem",
    px: "2px",
  },
  {
    name: "xx-small",
    token: "--slds-c-spacing-xx-small",
    value: "0.25rem",
    px: "4px",
  },
  {
    name: "x-small",
    token: "--slds-c-spacing-x-small",
    value: "0.5rem",
    px: "8px",
  },
  {
    name: "small",
    token: "--slds-c-spacing-small",
    value: "0.75rem",
    px: "12px",
  },
  {
    name: "medium",
    token: "--slds-c-spacing-medium",
    value: "1rem",
    px: "16px",
  },
  {
    name: "large",
    token: "--slds-c-spacing-large",
    value: "1.5rem",
    px: "24px",
  },
  {
    name: "x-large",
    token: "--slds-c-spacing-x-large",
    value: "2rem",
    px: "32px",
  },
  {
    name: "xx-large",
    token: "--slds-c-spacing-xx-large",
    value: "3rem",
    px: "48px",
  },
];

const borderRadii = [
  {
    name: "Button",
    token: "--slds-c-button-radius-border",
    value: "0.25rem",
    px: "4px",
  },
  {
    name: "Card",
    token: "--slds-c-card-radius-border",
    value: "0.5rem",
    px: "8px",
  },
  {
    name: "Input",
    token: "--slds-c-input-radius-border",
    value: "0.25rem",
    px: "4px",
  },
];

const shadows = [
  {
    name: "Shadow 1",
    token: "--slds-g-shadow-1",
    value: "0 1px 2px 0 rgba(0,0,0,0.05)",
    usage: "Subtle elevation",
  },
  {
    name: "Shadow 2",
    token: "--slds-g-shadow-2",
    value: "0 2px 4px 0 rgba(0,0,0,0.07)",
    usage: "Cards, dropdowns",
  },
  {
    name: "Shadow 3",
    token: "--slds-g-shadow-3",
    value: "0 4px 8px 0 rgba(0,0,0,0.1)",
    usage: "Modals, popovers",
  },
];

const borderColors = [
  {
    name: "Border 1",
    token: "--slds-g-color-border-base-1",
    value: "#dddbda",
  },
  {
    name: "Border 2",
    token: "--slds-g-color-border-base-2",
    value: "#c9c7c5",
  },
  {
    name: "Border 3",
    token: "--slds-g-color-border-base-3",
    value: "#ecebea",
  },
  {
    name: "Border 4",
    token: "--slds-g-color-border-base-4",
    value: "#f3f2f2",
  },
];

// ─── Live token cascade (single source of truth for the CSS downloads) ───
// The curated arrays above only carry the subset of tokens worth labeling
// and swatching in this page's UI. To keep the downloadable CSS files from
// silently drifting out of sync with what's actually loaded in the browser
// (src/main.tsx imports default_theme.css then globals.css, in that order,
// so globals.css wins per-property on overlap), every generator below reads
// straight from the real stylesheets: it prefers the live value for a
// curated token when one exists, and appends any token actually used by the
// product that isn't represented in the curated list at all.
function parseRootVars(cssText: string): Map<string, string> {
  const noComments = cssText.replace(/\/\*[\s\S]*?\*\//g, "");
  const vars = new Map<string, string>();
  const rootStart = noComments.indexOf(":root");
  if (rootStart === -1) return vars;
  const braceStart = noComments.indexOf("{", rootStart);
  if (braceStart === -1) return vars;
  let depth = 0;
  let end = braceStart;
  for (let i = braceStart; i < noComments.length; i++) {
    if (noComments[i] === "{") depth++;
    else if (noComments[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  const block = noComments.slice(braceStart + 1, end);
  const re = /(--[\w-]+)\s*:\s*([\s\S]*?);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) {
    vars.set(m[1], m[2].replace(/\s+/g, " ").trim());
  }
  return vars;
}

const LIVE_ROOT_VARS = new Map<string, string>([
  ...parseRootVars(defaultThemeCssRaw),
  ...parseRootVars(globalsCssRaw),
]);

function liveValue(token: string, fallback: string): string {
  return LIVE_ROOT_VARS.get(token) ?? fallback;
}

function labelFromToken(token: string): string {
  return token
    .replace(/^--/, "")
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

const isBorderVarToken = (t: string) =>
  t === "--border" ||
  t === "--input" ||
  t === "--radius" ||
  /^--radius-(sm|md|lg|xl)$/.test(t) ||
  /^--slds-c-(button|card|input)-radius-border$/.test(t) ||
  /^--slds-g-color-border-base-/.test(t) ||
  t === "--sidebar-border";

const isSpacingVarToken = (t: string) => /^--slds-c-spacing-/.test(t);

const isShadowVarToken = (t: string) => /^--slds-g-shadow-/.test(t);

const isTypographyVarToken = (t: string) =>
  /^--slds-g-font-/.test(t) ||
  /^--font-weight-/.test(t) ||
  /^--slds-g-line-height-/.test(t) ||
  t === "--font-size";

const isColorVarToken = (t: string) =>
  !isBorderVarToken(t) &&
  !isSpacingVarToken(t) &&
  !isShadowVarToken(t) &&
  !isTypographyVarToken(t) &&
  (t.startsWith("--color-") ||
    t.startsWith("--slds-g-color-") ||
    t.startsWith("--chart-") ||
    t.startsWith("--sidebar") ||
    [
      "--background",
      "--foreground",
      "--card",
      "--card-foreground",
      "--popover",
      "--popover-foreground",
      "--primary",
      "--primary-foreground",
      "--secondary",
      "--secondary-foreground",
      "--muted",
      "--muted-foreground",
      "--accent",
      "--accent-foreground",
      "--destructive",
      "--destructive-foreground",
      "--ring",
      "--switch-background",
      "--input-background",
    ].includes(t));

// Appends any live token matching `isMatch` that isn't already in `curated`,
// so a token added to globals.css later shows up here automatically.
function appendUncuratedVars(
  css: string,
  isMatch: (token: string) => boolean,
  curated: Set<string>,
): string {
  const extras = [...LIVE_ROOT_VARS.entries()].filter(
    ([token]) => isMatch(token) && !curated.has(token),
  );
  if (!extras.length) return css;
  let out =
    css +
    `\n  /* ─── Additional tokens (auto-synced from globals.css) ─── */\n`;
  extras.forEach(([token, value]) => {
    out += `  ${token}: ${value}; /* ${labelFromToken(token)} */\n`;
  });
  return out;
}

// ─── Download Helpers ───
function generateColorsCSS(): string {
  let css = `/* Mercy Home Brand Colors - SLDS 2 Design Tokens */\n/* Generated from Figma Make Brand Book */\n/* Date: ${formatMdy(new Date())} */\n\n:root {\n`;
  css += `  /* ─── Brand Colors ─── */\n`;
  brandColors.forEach((c) => {
    css += `  ${c.token}: ${liveValue(c.token, c.value)}; /* ${c.name} */\n`;
  });
  css += `\n  /* ─── Neutral Palette ─── */\n`;
  neutralColors.forEach((c) => {
    css += `  ${c.token}: ${liveValue(c.token, c.value)};\n`;
  });
  css += `\n  /* ─── Brand Reference (Salesforce Blue scale) ─── */\n`;
  brandReferenceColors.forEach((c) => {
    css += `  ${c.token}: ${liveValue(c.token, c.value)};\n`;
  });
  css += `\n  /* ─── Semantic Colors ─── */\n`;
  semanticColors.forEach((c) => {
    css += `  ${c.token}: ${liveValue(c.token, c.value)}; /* ${c.category} */\n`;
  });
  css += `\n  /* ─── Text Colors ─── */\n`;
  textColors.forEach((c) => {
    css += `  ${c.token}: ${liveValue(c.token, c.value)};\n`;
  });
  css += `\n  /* ─── Background Colors ─── */\n`;
  backgroundColors.forEach((c) => {
    css += `  ${c.token}: ${liveValue(c.token, c.value)};\n`;
  });
  css += `\n  /* ─── Border Colors ─── */\n`;
  borderColors.forEach((c) => {
    css += `  ${c.token}: ${liveValue(c.token, c.value)};\n`;
  });
  const curated = new Set([
    ...brandColors.map((c) => c.token),
    ...neutralColors.map((c) => c.token),
    ...brandReferenceColors.map((c) => c.token),
    ...semanticColors.map((c) => c.token),
    ...textColors.map((c) => c.token),
    ...backgroundColors.map((c) => c.token),
    ...borderColors.map((c) => c.token),
  ]);
  css = appendUncuratedVars(css, isColorVarToken, curated);
  css += `}\n`;
  return css;
}

function generateTypographyCSS(): string {
  let css = `/* Mercy Home Typography Tokens - SLDS 2 */\n/* Generated from Figma Make Brand Book */\n\n:root {\n`;
  css += `  /* ─── Font Family ─── */\n`;
  css += `  --slds-g-font-family: ${liveValue("--slds-g-font-family", `'Salesforce Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`)};\n\n`;
  css += `  /* ─── Font Sizes ─── */\n`;
  fontSizes.forEach((f) => {
    css += `  ${f.token}: ${liveValue(f.token, f.value)}; /* ${f.px} - ${f.usage} */\n`;
  });
  css += `\n  /* ─── Line Heights ─── */\n`;
  css += `  --slds-g-line-height-text: ${liveValue("--slds-g-line-height-text", "1.5")};\n`;
  css += `  --slds-g-line-height-heading: ${liveValue("--slds-g-line-height-heading", "1.25")};\n`;
  css += `  --slds-g-line-height-button: ${liveValue("--slds-g-line-height-button", "1.875rem")};\n`;
  css += `\n  /* ─── Font Weights ─── */\n`;
  css += `  --font-weight-normal: ${liveValue("--font-weight-normal", "400")};\n`;
  css += `  --font-weight-medium: ${liveValue("--font-weight-medium", "500")};\n`;
  const curated = new Set([
    ...fontSizes.map((f) => f.token),
    "--slds-g-font-family",
    "--slds-g-line-height-text",
    "--slds-g-line-height-heading",
    "--slds-g-line-height-button",
    "--font-weight-normal",
    "--font-weight-medium",
  ]);
  css = appendUncuratedVars(css, isTypographyVarToken, curated);
  css += `}\n`;
  return css;
}

function generateSpacingCSS(): string {
  let css = `/* Mercy Home Spacing & Layout Tokens - SLDS 2 */\n/* Generated from Figma Make Brand Book */\n\n:root {\n`;
  css += `  /* ─── Spacing Scale ─── */\n`;
  spacingTokens.forEach((s) => {
    css += `  ${s.token}: ${liveValue(s.token, s.value)}; /* ${s.px} */\n`;
  });
  css = appendUncuratedVars(
    css,
    isSpacingVarToken,
    new Set(spacingTokens.map((s) => s.token)),
  );
  css += `\n  /* ─── Border Radius ─── */\n`;
  borderRadii.forEach((b) => {
    css += `  ${b.token}: ${liveValue(b.token, b.value)}; /* ${b.px} */\n`;
  });
  css += `\n  /* ─── Shadows ─── */\n`;
  shadows.forEach((s) => {
    css += `  ${s.token}: ${liveValue(s.token, s.value)}; /* ${s.usage} */\n`;
  });
  css += `}\n`;
  return css;
}

function generateBordersCSS(): string {
  let css = `/* Mercy Home Borders & Radius Tokens - SLDS 2 */\n/* Generated from Figma Make Brand Book */\n/* Date: ${formatMdy(new Date())} */\n\n:root {\n`;
  css += `  /* ─── Border Radius ─── */\n`;
  borderRadii.forEach((b) => {
    css += `  ${b.token}: ${liveValue(b.token, b.value)}; /* ${b.name} - ${b.px} */\n`;
  });
  css += `\n  /* ─── Border Colors ─── */\n`;
  borderColors.forEach((b) => {
    css += `  ${b.token}: ${liveValue(b.token, b.value)}; /* ${b.name} */\n`;
  });
  const curated = new Set([
    ...borderRadii.map((b) => b.token),
    ...borderColors.map((b) => b.token),
  ]);
  css = appendUncuratedVars(css, isBorderVarToken, curated);
  css += `}\n`;
  return css;
}

function generateShadowsCSS(): string {
  let css = `/* Mercy Home Shadow Tokens - SLDS 2 */\n/* Generated from Figma Make Brand Book */\n/* Date: ${formatMdy(new Date())} */\n\n:root {\n`;
  css += `  /* ─── Shadows ─── */\n`;
  shadows.forEach((s) => {
    css += `  ${s.token}: ${liveValue(s.token, s.value)}; /* ${s.name} - ${s.usage} */\n`;
  });
  css = appendUncuratedVars(
    css,
    isShadowVarToken,
    new Set(shadows.map((s) => s.token)),
  );
  css += `}\n`;
  return css;
}

function generateAllTokensJSON(): string {
  const tokens = {
    _meta: {
      name: "Mercy Home for Boys & Girls",
      description: "SLDS 2 Design Tokens - Brand Book Export",
      generatedDate: new Date().toISOString(),
      version: "1.0.0",
    },
    brand: Object.fromEntries(
      brandColors.map((c) => [
        c.token,
        { value: c.value, name: c.name, usage: c.usage },
      ]),
    ),
    neutral: Object.fromEntries(
      neutralColors.map((c) => [
        c.token,
        { value: c.value, name: c.name },
      ]),
    ),
    brandReference: Object.fromEntries(
      brandReferenceColors.map((c) => [
        c.token,
        { value: c.value, name: c.name },
      ]),
    ),
    semantic: Object.fromEntries(
      semanticColors.map((c) => [
        c.token,
        { value: c.value, name: c.name, category: c.category },
      ]),
    ),
    text: Object.fromEntries(
      textColors.map((c) => [
        c.token,
        { value: c.value, name: c.name },
      ]),
    ),
    background: Object.fromEntries(
      backgroundColors.map((c) => [
        c.token,
        { value: c.value, name: c.name },
      ]),
    ),
    border: Object.fromEntries(
      borderColors.map((c) => [
        c.token,
        { value: c.value, name: c.name },
      ]),
    ),
    typography: {
      fontFamily:
        "'Salesforce Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      fontSizes: Object.fromEntries(
        fontSizes.map((f) => [
          f.token,
          { value: f.value, px: f.px, usage: f.usage },
        ]),
      ),
      lineHeights: {
        text: "1.5",
        heading: "1.25",
        button: "1.875rem",
      },
      fontWeights: { normal: "400", medium: "500" },
    },
    spacing: Object.fromEntries(
      spacingTokens.map((s) => [
        s.token,
        { value: s.value, px: s.px },
      ]),
    ),
    borderRadius: Object.fromEntries(
      borderRadii.map((b) => [
        b.token,
        { value: b.value, px: b.px },
      ]),
    ),
    shadows: Object.fromEntries(
      shadows.map((s) => [
        s.token,
        { value: s.value, usage: s.usage },
      ]),
    ),
  };
  return JSON.stringify(tokens, null, 2);
}

function generateSalesforceTokensJSON(): string {
  const sfTokens = {
    _meta: {
      name: "Mercy Home - Salesforce Mapping",
      description:
        "Token mapping for Salesforce Lightning Design System customization",
      generatedDate: new Date().toISOString(),
    },
    brandBand: {
      colorBrand: "#145F33",
      colorBrandDark: "#0d4424",
      colorBrandLight: "#1a7a42",
      colorBrandSecondary: "#A82031",
      colorBrandAccent: "#E86C24",
    },
    globalColors: {
      "color-brand": "#145F33",
      "color-brand-dark": "#0d4424",
      "color-error": "#ba0517",
      "color-success": "#2e844a",
      "color-warning": "#b28500",
      "page-color-background": "#f3f2f2",
      "page-header-color-background": "#ffffff",
    },
    componentOverrides: {
      button: {
        "color-background-brand": "#145F33",
        "color-background-brand-hover": "#0d4424",
        "color-text-brand": "#145F33",
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
        referral: {
          bg: "#e6f4ea",
          text: "#145F33",
          border: "#a8d5b8",
        },
        infoSession: {
          bg: "#e0f2fe",
          text: "#005EA2",
          border: "#7dd3fc",
        },
        programWaitlist: {
          bg: "#fef3c7",
          text: "#92400e",
          border: "#fcd34d",
        },
        delayed: {
          bg: "#fce4ec",
          text: "#A82031",
          border: "#f48fb1",
        },
        closed: {
          bg: "#f3f2f2",
          text: "#706e6b",
          border: "#c9c7c5",
        },
      },
    },
    statusColors: {
      Referral: "#145F33",
      "Info Session": "#005EA2",
      "Program Waitlist": "#E86C24",
      Delayed: "#A82031",
      Closed: "#706e6b",
    },
  };
  return JSON.stringify(sfTokens, null, 2);
}

function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
) {
  downloadBlob(new Blob([content], { type: mimeType }), filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Reusable Components ───
function CopyButton({ text }: { text: string }) {
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
        (navigator.clipboard?.writeText(text) ?? Promise.reject()).catch(fallback);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="p-1 rounded hover:bg-[#f3f2f2] transition-colors"
      title="Copy token"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-[#2e844a]" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-[#706e6b]" />
      )}
    </button>
  );
}

function ColorSwatch({
  color,
  name,
  token,
  usage,
}: {
  color: string;
  name: string;
  token: string;
  usage?: string;
}) {
  const isLight = [
    "#ffffff",
    "#fafaf9",
    "#f3f2f2",
    "#ecebea",
    "#dddbda",
    "#c9c7c5",
    "#fed35a",
    "#fef8e6",
    "#e6f4ea",
    "#f3f4f6",
  ].includes(color.toLowerCase());
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        border: "1px solid var(--slds-g-color-border-base-1)",
      }}
    >
      <div
        className="h-20 flex items-end p-2"
        style={{ backgroundColor: color }}
      >
        <span
          className={`text-[11px] ${isLight ? "text-[#3e3e3c]" : "text-white"}`}
          style={{ fontFamily: "monospace" }}
        >
          {color}
        </span>
      </div>
      <div className="p-3 bg-white">
        <div className="flex items-center justify-between mb-1">
          <span
            style={{
              fontSize: "var(--slds-g-font-size-4)",
              fontWeight: 500,
            }}
          >
            {name}
          </span>
          <CopyButton text={`var(${token})`} />
        </div>
        <code
          className="text-[11px] text-[#706e6b] block"
          style={{ fontFamily: "monospace" }}
        >
          {token}
        </code>
        {usage && (
          <p className="mt-1 text-[11px] text-[#706e6b]">
            {usage}
          </p>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 p-[0px]">
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
        {description}
      </p>
    </div>
  );
}

function DownloadCard({
  title,
  description,
  onDownload,
  format,
}: {
  title: string;
  description: string;
  onDownload: () => void;
  format: string;
}) {
  return (
    <div
      className="p-4 rounded-lg flex items-center justify-between"
      style={{
        border: "1px solid var(--slds-g-color-border-base-1)",
        backgroundColor: "var(--slds-g-color-background-alt)",
      }}
    >
      <div>
        <p
          style={{
            fontSize: "var(--slds-g-font-size-5)",
            fontWeight: 500,
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: "var(--slds-g-font-size-3)",
            color: "var(--slds-g-color-text-weak)",
          }}
        >
          {description}
        </p>
      </div>
      <Button
        onClick={onDownload}
        className="flex items-center gap-2 text-white"
        style={{
          backgroundColor: "#145F33",
          borderRadius: "var(--slds-c-button-radius-border)",
          fontSize: "var(--slds-g-font-size-4)",
        }}
      >
        <Download className="h-4 w-4" />.{format}
      </Button>
    </div>
  );
}

// ─── Tab Content Components ───
function ColorsTab() {
  return (
    <div className="space-y-10">
      {/* Brand Colors */}
      <div className="p-10">
        <SectionHeader
          icon={Palette}
          title="Brand Colors"
          description="Core Mercy Home brand palette — no blue in primary actions."
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {brandColors.map((c) => (
            <ColorSwatch
              key={c.token}
              color={c.value}
              name={c.name}
              token={c.token}
              usage={c.usage}
            />
          ))}
        </div>
      </div>

      {/* Neutral Palette */}
      <div className="p-10">
        <h3
          className="mb-3"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Neutral Palette
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
          {neutralColors.map((c) => (
            <div key={c.token} className="text-center">
              <div
                className="h-14 rounded-md mb-1.5"
                style={{
                  backgroundColor: c.value,
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              />
              <span
                className="text-[10px] block"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {c.name}
              </span>
              <code
                className="text-[9px] block"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                  fontFamily: "monospace",
                }}
              >
                {c.value}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Reference Colors */}
      <div className="p-10">
        <h3
          className="mb-3"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Brand Reference (Salesforce Blue Scale)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {brandReferenceColors.map((c) => (
            <ColorSwatch
              key={c.token}
              color={c.value}
              name={c.name}
              token={c.token}
            />
          ))}
        </div>
      </div>

      {/* Semantic Colors */}
      <div className="p-10">
        <h3
          className="mb-3"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Semantic Colors
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {semanticColors.map((c) => (
            <ColorSwatch
              key={c.token}
              color={c.value}
              name={c.name}
              token={c.token}
            />
          ))}
        </div>
      </div>

      {/* Text Colors */}
      <div className="p-10">
        <h3
          className="mb-3"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Text Colors
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {textColors.map((c) => (
            <ColorSwatch
              key={c.token}
              color={c.value}
              name={c.name}
              token={c.token}
            />
          ))}
        </div>
      </div>

      {/* Background Colors */}
      <div>
        <h3
          className="mb-3"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Background Colors
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {backgroundColors.map((c) => (
            <ColorSwatch
              key={c.token}
              color={c.value}
              name={c.name}
              token={c.token}
            />
          ))}
        </div>
      </div>

      {/* Border Colors */}
      <div className="p-10">
        <h3
          className="mb-3"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Border Colors
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {borderColors.map((c) => (
            <ColorSwatch
              key={c.token}
              color={c.value}
              name={c.name}
              token={c.token}
            />
          ))}
        </div>
      </div>

      {/* Downloads */}
      <div className="p-10">
        <h3
          className="mb-3"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Download Color Tokens
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DownloadCard
            title="Colors CSS Variables"
            description="All color tokens as CSS custom properties"
            format="css"
            onDownload={() =>
              downloadFile(
                generateColorsCSS(),
                "mercy-home-colors.css",
                "text/css",
              )
            }
          />
          <DownloadCard
            title="Colors JSON"
            description="All color tokens as structured JSON"
            format="json"
            onDownload={() =>
              downloadFile(
                generateAllTokensJSON(),
                "mercy-home-tokens.json",
                "application/json",
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

function TypographyTab() {
  return (
    <div className="space-y-10 p-10">
      <SectionHeader
        icon={Type}
        title="Typography"
        description="SLDS 2 type scale and semantic text styles for Mercy Home applications."
      />

      {/* Font Family */}
      <div
        className="p-5 rounded-lg"
        style={{
          backgroundColor: "var(--slds-g-color-background-alt)",
          border: "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            style={{
              fontSize: "var(--slds-g-font-size-5)",
              fontWeight: 500,
            }}
          >
            Font Family
          </span>
          <CopyButton text="var(--slds-g-font-family)" />
        </div>
        <code
          className="text-[12px] text-[#706e6b] block mb-3"
          style={{ fontFamily: "monospace" }}
        >
          --slds-g-font-family
        </code>
        <p style={{ fontSize: "var(--slds-g-font-size-6)" }}>
          Salesforce Sans, -apple-system, BlinkMacSystemFont,
          Segoe UI, Roboto, Helvetica, Arial, sans-serif
        </p>
      </div>

      {/* Font Scale */}
      <div className="p-[0px]">
        <h3
          className="mb-4"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Type Scale
        </h3>
        <div
          className="space-y-1"
          style={{
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: "var(--slds-c-card-radius-border)",
            overflow: "hidden",
          }}
        >
          {fontSizes.map((f, i) => (
            <div
              key={f.token}
              className="flex items-center gap-4 px-4 py-3"
              style={{
                backgroundColor:
                  i % 2 === 0
                    ? "#ffffff"
                    : "var(--slds-g-color-background-alt)",
              }}
            >
              <div
                className="w-16 text-right"
                style={{
                  fontSize: "var(--slds-g-font-size-3)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {f.px}
              </div>
              <div
                className="flex-1"
                style={{ fontSize: f.value }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
              <div className="flex items-center gap-2">
                <code
                  className="text-[11px] text-[#706e6b] hidden lg:block"
                  style={{ fontFamily: "monospace" }}
                >
                  {f.token}
                </code>
                <CopyButton text={`var(${f.token})`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Semantic Text Styles */}
      <div className="px-[0px] py-[40px]">
        <h3
          className="mb-4"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Semantic Text Styles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              cls: "slds-text-heading-large",
              label: "Heading Large",
              desc: "32px / 500 / 1.25",
              sample: "Page Hero Title",
            },
            {
              cls: "slds-text-heading-medium",
              label: "Heading Medium",
              desc: "24px / 500 / 1.25",
              sample: "Section Heading",
            },
            {
              cls: "slds-text-heading-small",
              label: "Heading Small",
              desc: "20px / 500 / 1.25",
              sample: "Card Title",
            },
            {
              cls: "slds-page-header-title",
              label: "Page Header Title",
              desc: "24px / 500 / 1.25",
              sample: "Admissions Dashboard",
            },
            {
              cls: "slds-section-title",
              label: "Section Title",
              desc: "16px / 500",
              sample: "Constituent Details",
            },
            {
              cls: "slds-form-label",
              label: "Form Label",
              desc: "12px / 500 / uppercase",
              sample: "FIRST NAME",
            },
            {
              cls: "slds-stat-value",
              label: "Stat Value",
              desc: "32px / 700 / 1",
              sample: "247",
            },
            {
              cls: "slds-button-text",
              label: "Button Text",
              desc: "13px / 30px line-height",
              sample: "Save & Continue",
            },
          ].map((s) => (
            <div
              key={s.cls}
              className="p-4 rounded-lg"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  style={{
                    fontSize: "var(--slds-g-font-size-4)",
                    fontWeight: 500,
                    color: "#145F33",
                  }}
                >
                  .{s.cls}
                </span>
                <CopyButton text={s.cls} />
              </div>
              <p className="text-[11px] text-[#706e6b] mb-2">
                {s.desc}
              </p>
              <div className={s.cls}>{s.sample}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Line Heights */}
      <div className="px-[0px] py-[40px]">
        <h3
          className="mb-3"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Line Heights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              name: "Text",
              token: "--slds-g-line-height-text",
              value: "1.5",
            },
            {
              name: "Heading",
              token: "--slds-g-line-height-heading",
              value: "1.25",
            },
            {
              name: "Button",
              token: "--slds-g-line-height-button",
              value: "1.875rem (30px)",
            },
          ].map((lh) => (
            <div
              key={lh.token}
              className="p-4 rounded-lg"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  style={{
                    fontSize: "var(--slds-g-font-size-4)",
                    fontWeight: 500,
                  }}
                >
                  {lh.name}
                </span>
                <CopyButton text={`var(${lh.token})`} />
              </div>
              <code
                className="text-[11px] text-[#706e6b]"
                style={{ fontFamily: "monospace" }}
              >
                {lh.value}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* Download */}
      <div className="px-[0px] py-[40px]">
        <h3
          className="mb-3"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Download Typography Tokens
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DownloadCard
            title="Typography CSS"
            description="Font family, sizes, weights, line heights"
            format="css"
            onDownload={() =>
              downloadFile(
                generateTypographyCSS(),
                "mercy-home-typography.css",
                "text/css",
              )
            }
          />
          <DownloadCard
            title="All Tokens JSON"
            description="Complete token set including typography"
            format="json"
            onDownload={() =>
              downloadFile(
                generateAllTokensJSON(),
                "mercy-home-tokens.json",
                "application/json",
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

function SpacingTab() {
  return (
    <div className="space-y-10 p-10">
      <SectionHeader
        icon={Grid3X3}
        title="Spacing"
        description="Consistent spacing scale based on SLDS 2 component spacing hooks."
      />

      {/* Spacing Visual */}
      <div className="px-[0px] py-[40px]">
        <h3
          className="mb-4"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Spacing Scale
        </h3>
        <div className="space-y-3">
          {spacingTokens.map((s) => (
            <div
              key={s.token}
              className="flex items-center gap-4 px-4 py-2 rounded-md"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-3)",
              }}
            >
              <code
                className="text-[12px] text-[#706e6b] w-60 hidden md:block"
                style={{ fontFamily: "monospace" }}
              >
                {s.token}
              </code>
              <div
                className="w-20 text-right"
                style={{
                  fontSize: "var(--slds-g-font-size-4)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {s.px}
              </div>
              <div className="flex-1 flex items-center">
                <div
                  className="h-4 rounded-sm"
                  style={{
                    width: s.px,
                    backgroundColor: "#145F33",
                    minWidth: "4px",
                  }}
                />
              </div>
              <CopyButton text={`var(${s.token})`} />
            </div>
          ))}
        </div>
      </div>

      {/* Download */}
      <div className="px-[0px] py-[40px]">
        <h3
          className="mb-3"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Download Spacing Tokens
        </h3>
        <DownloadCard
          title="Spacing & Layout CSS"
          description="Spacing, border radius, and shadow tokens"
          format="css"
          onDownload={() =>
            downloadFile(
              generateSpacingCSS(),
              "mercy-home-spacing.css",
              "text/css",
            )
          }
        />
      </div>
    </div>
  );
}

function BordersTab() {
  return (
    <div className="space-y-10">
      <SectionHeader
        icon={Square}
        title="Borders & Radius"
        description="Border tokens and radius values for consistent component styling."
      />

      {/* Border Radius */}
      <div className="p-10">
        <h3
          className="mb-4"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Border Radius
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {borderRadii.map((b) => (
            <div
              key={b.token}
              className="p-5 flex flex-col items-center"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                borderRadius:
                  "var(--slds-c-card-radius-border)",
              }}
            >
              <div
                className="w-24 h-24 mb-3"
                style={{
                  backgroundColor: "#145F33",
                  borderRadius: b.value,
                  opacity: 0.15,
                }}
              />
              <div
                className="w-24 h-24 -mt-[108px] mb-3"
                style={{
                  border: "2px solid #145F33",
                  borderRadius: b.value,
                }}
              />
              <span
                style={{
                  fontSize: "var(--slds-g-font-size-5)",
                  fontWeight: 500,
                  marginTop: "0.5rem",
                }}
              >
                {b.name}
              </span>
              <code
                className="text-[11px] text-[#706e6b] mt-1"
                style={{ fontFamily: "monospace" }}
              >
                {b.value} ({b.px})
              </code>
              <div className="mt-1 flex items-center gap-1">
                <code
                  className="text-[10px] text-[#706e6b]"
                  style={{ fontFamily: "monospace" }}
                >
                  {b.token}
                </code>
                <CopyButton text={`var(${b.token})`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Border Colors */}
      <div className="p-10">
        <h3
          className="mb-4"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Border Colors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {borderColors.map((b) => (
            <div
              key={b.token}
              className="flex items-center gap-4 p-4 rounded-lg"
              style={{
                border: `2px solid ${b.value}`,
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <div
                className="w-10 h-10 rounded-md"
                style={{
                  backgroundColor: b.value,
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              />
              <div className="flex-1">
                <span
                  style={{
                    fontSize: "var(--slds-g-font-size-4)",
                    fontWeight: 500,
                  }}
                >
                  {b.name}
                </span>
                <div className="flex items-center gap-2">
                  <code
                    className="text-[11px] text-[#706e6b]"
                    style={{ fontFamily: "monospace" }}
                  >
                    {b.token}
                  </code>
                  <span className="text-[11px] text-[#706e6b]">
                    → {b.value}
                  </span>
                </div>
              </div>
              <CopyButton text={`var(${b.token})`} />
            </div>
          ))}
        </div>
      </div>

      {/* Download */}
      <div className="p-10">
        <h3
          className="mb-3"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Download Border & Radius Tokens
        </h3>
        <DownloadCard
          title="Borders & Radius CSS"
          description="Border radius and border color tokens"
          format="css"
          onDownload={() =>
            downloadFile(
              generateBordersCSS(),
              "mercy-home-borders.css",
              "text/css",
            )
          }
        />
      </div>
    </div>
  );
}

function ShadowsTab() {
  return (
    <div className="space-y-10 p-10">
      <SectionHeader
        icon={Layers}
        title="Shadows"
        description="Elevation system using subtle shadows for depth hierarchy."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shadows.map((s) => (
          <div
            key={s.token}
            className="p-6 rounded-lg bg-white"
            style={{ boxShadow: s.value }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                style={{
                  fontSize: "var(--slds-g-font-size-5)",
                  fontWeight: 500,
                }}
              >
                {s.name}
              </span>
              <CopyButton text={`var(${s.token})`} />
            </div>
            <code
              className="text-[11px] text-[#706e6b] block mb-1"
              style={{ fontFamily: "monospace" }}
            >
              {s.token}
            </code>
            <code
              className="text-[10px] text-[#706e6b] block mb-2"
              style={{ fontFamily: "monospace" }}
            >
              {s.value}
            </code>
            <p className="text-[12px] text-[#706e6b]">
              {s.usage}
            </p>
          </div>
        ))}
      </div>

      {/* Download */}
      <div>
        <h3
          className="mb-3"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Download Shadow Tokens
        </h3>
        <DownloadCard
          title="Shadows CSS"
          description="Elevation shadow tokens"
          format="css"
          onDownload={() =>
            downloadFile(
              generateShadowsCSS(),
              "mercy-home-shadows.css",
              "text/css",
            )
          }
        />
      </div>
    </div>
  );
}

function ComponentsTab() {
  return (
    <div className="space-y-10">
      <SectionHeader
        icon={Grid3X3}
        title="Component Patterns"
        description="SLDS 2 component styling conventions used across the Mercy Home application."
      />

      {/* Status Badges */}
      <div>
        <h3
          className="mb-4"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Status Badges (5 Approved Statuses)
        </h3>
        <div className="flex flex-wrap gap-3">
          {[
            {
              label: "Referral",
              bg: "#e6f4ea",
              text: "#145F33",
              border: "#a8d5b8",
            },
            {
              label: "Info Session",
              bg: "#e0f2fe",
              text: "#005EA2",
              border: "#7dd3fc",
            },
            {
              label: "Program Waitlist",
              bg: "#fef3c7",
              text: "#92400e",
              border: "#fcd34d",
            },
            {
              label: "Delayed",
              bg: "#fce4ec",
              text: "#A82031",
              border: "#f48fb1",
            },
            {
              label: "Closed",
              bg: "#f3f2f2",
              text: "#706e6b",
              border: "#c9c7c5",
            },
          ].map((s) => (
            <span
              key={s.label}
              className="px-3 py-1 rounded-full inline-flex items-center"
              style={{
                backgroundColor: s.bg,
                color: s.text,
                border: `1px solid ${s.border}`,
                fontSize: "var(--slds-g-font-size-3)",
                fontWeight: 500,
              }}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div>
        <h3
          className="mb-4"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Button Variants
        </h3>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            className="px-4 py-2 rounded text-white"
            style={{
              backgroundColor: "#145F33",
              fontSize: "var(--slds-g-font-size-4)",
              borderRadius:
                "var(--slds-c-button-radius-border)",
            }}
          >
            Primary Action
          </button>
          <button
            className="px-4 py-2 rounded"
            style={{
              backgroundColor: "transparent",
              border: "1px solid #145F33",
              color: "#145F33",
              fontSize: "var(--slds-g-font-size-4)",
              borderRadius:
                "var(--slds-c-button-radius-border)",
            }}
          >
            Secondary
          </button>
          <button
            className="px-4 py-2 rounded text-white"
            style={{
              backgroundColor: "#A82031",
              fontSize: "var(--slds-g-font-size-4)",
              borderRadius:
                "var(--slds-c-button-radius-border)",
            }}
          >
            Destructive
          </button>
          <button
            className="px-4 py-2 rounded-full text-white"
            style={{
              backgroundColor: "#145F33",
              fontSize: "var(--slds-g-font-size-4)",
            }}
          >
            Pill Button
          </button>
          <button
            className="px-4 py-2 rounded"
            style={{
              backgroundColor:
                "var(--slds-g-color-background-alt)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              color: "var(--slds-g-color-text-default)",
              fontSize: "var(--slds-g-font-size-4)",
              borderRadius:
                "var(--slds-c-button-radius-border)",
            }}
          >
            Neutral
          </button>
        </div>
      </div>

      {/* Active Tab Indicator */}
      <div>
        <h3
          className="mb-4"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Tab Indicators
        </h3>
        <div
          className="flex gap-6"
          style={{
            borderBottom:
              "2px solid var(--slds-g-color-border-base-3)",
          }}
        >
          {["Overview", "Clinical", "Education"].map(
            (tab, i) => (
              <button
                key={tab}
                className="pb-2 relative"
                style={{
                  fontSize: "var(--slds-g-font-size-5)",
                  fontWeight: i === 0 ? 500 : 400,
                  color:
                    i === 0
                      ? "#145F33"
                      : "var(--slds-g-color-text-weak)",
                  borderBottom:
                    i === 0 ? "3px solid #145F33" : "none",
                  marginBottom: "-2px",
                }}
              >
                {tab}
              </button>
            ),
          )}
        </div>
        <p className="mt-2 text-[12px] text-[#706e6b]">
          Active tabs use green #145F33 underline indicator
          (3px). No blue.
        </p>
      </div>

      {/* Cards */}
      <div>
        <h3
          className="mb-4"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Card Styles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="p-4 bg-white"
            style={{
              borderRadius: "var(--slds-c-card-radius-border)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              boxShadow: "var(--slds-g-shadow-1)",
            }}
          >
            <h4
              style={{
                fontSize: "var(--slds-g-font-size-5)",
                fontWeight: 500,
              }}
            >
              Standard Card
            </h4>
            <p
              className="mt-1"
              style={{
                fontSize: "var(--slds-g-font-size-4)",
                color: "var(--slds-g-color-text-weak)",
              }}
            >
              8px radius, shadow-1, 1px border
            </p>
          </div>
          <div
            className="p-4 bg-white"
            style={{
              borderRadius: "var(--slds-c-card-radius-border)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              boxShadow: "var(--slds-g-shadow-2)",
            }}
          >
            <h4
              style={{
                fontSize: "var(--slds-g-font-size-5)",
                fontWeight: 500,
              }}
            >
              Elevated Card
            </h4>
            <p
              className="mt-1"
              style={{
                fontSize: "var(--slds-g-font-size-4)",
                color: "var(--slds-g-color-text-weak)",
              }}
            >
              8px radius, shadow-2, hover state
            </p>
          </div>
        </div>
      </div>

      {/* Dialog Pattern */}
      <div>
        <h3
          className="mb-4"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Dialog Patterns
        </h3>
        <div
          className="p-4 rounded-lg"
          style={{
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <p
            style={{ fontSize: "var(--slds-g-font-size-4)" }}
            className="mb-2"
          >
            <strong>Structure:</strong> Uses{" "}
            <code
              style={{
                fontFamily: "monospace",
                color: "#145F33",
              }}
            >
              DialogContent
            </code>
            ,{" "}
            <code
              style={{
                fontFamily: "monospace",
                color: "#145F33",
              }}
            >
              DialogHeader
            </code>{" "}
            from shadcn/ui dialog.
          </p>
          <p
            style={{ fontSize: "var(--slds-g-font-size-4)" }}
            className="mb-2"
          >
            <strong>Width Override:</strong> Base{" "}
            <code style={{ fontFamily: "monospace" }}>
              DialogContent
            </code>{" "}
            has hardcoded{" "}
            <code style={{ fontFamily: "monospace" }}>
              sm:max-w-lg
            </code>
            . Override with{" "}
            <code
              style={{
                fontFamily: "monospace",
                color: "#145F33",
              }}
            >
              sm:max-w-2xl
            </code>
            ,{" "}
            <code
              style={{
                fontFamily: "monospace",
                color: "#145F33",
              }}
            >
              sm:max-w-4xl
            </code>
            , etc.
          </p>
          <p
            style={{ fontSize: "var(--slds-g-font-size-4)" }}
            className="mb-2"
          >
            <strong>Accessibility:</strong> Include{" "}
            <code
              style={{
                fontFamily: "monospace",
                color: "#145F33",
              }}
            >
              DialogDescription
            </code>{" "}
            with{" "}
            <code style={{ fontFamily: "monospace" }}>
              sr-only
            </code>{" "}
            class.
          </p>
          <p style={{ fontSize: "var(--slds-g-font-size-4)" }}>
            <strong>Buttons:</strong> Pill-shaped actions in
            footer. No toast notifications in
            relationship/connection dialogs.
          </p>
        </div>
      </div>

      {/* Salesforce Mapping Download */}
      <div>
        <h3
          className="mb-3"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Salesforce Integration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DownloadCard
            title="Salesforce Token Mapping"
            description="JSON mapping for Lightning Design System customization"
            format="json"
            onDownload={() =>
              downloadFile(
                generateSalesforceTokensJSON(),
                "mercy-home-salesforce-mapping.json",
                "application/json",
              )
            }
          />
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
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───
export function DesignTokensPage() {
  const navigate = useNavigate();
  // ?pattern=BTN-07 in the URL activates the Components tab and filters to that card.
  // useSearchParams is synchronous — the correct tab is active from frame 1.
  const [searchParams] = useSearchParams();
  const urlPattern = searchParams.get("pattern")?.toUpperCase() ?? "";

  const [activeTab, setActiveTab] = useState<TabKey>(urlPattern ? "components" : "colors");
  const [patternFilter, setPatternFilter] = useState<string>(urlPattern);

  // Keep in sync when the browser navigates (back/forward) and the param changes.
  useEffect(() => {
    if (urlPattern) {
      setActiveTab("components");
      setPatternFilter(urlPattern);
    } else {
      setPatternFilter("");
    }
  }, [urlPattern]);

  function clearFilter() {
    setPatternFilter("");
    navigate("/design-tokens", { replace: true });
  }

  const tabs: {
    key: TabKey;
    label: string;
    icon: React.ElementType;
  }[] = [
    { key: "colors", label: "Colors", icon: Palette },
    { key: "typography", label: "Typography", icon: Type },
    { key: "spacing", label: "Spacing", icon: Grid3X3 },
    { key: "borders", label: "Borders & Radius", icon: Square },
    { key: "shadows", label: "Shadows", icon: Layers },
    { key: "components", label: "Components", icon: Grid3X3 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "colors":
        return <ColorsTab />;
      case "typography":
        return <TypographyTab />;
      case "spacing":
        return <SpacingTab />;
      case "borders":
        return <BordersTab />;
      case "shadows":
        return <ShadowsTab />;
      case "components":
        return <ComponentsTabContent defaultFilter={patternFilter} onClearFilter={clearFilter} />;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Page Header */}
      <div
        className="px-6 py-4 flex items-center justify-between flex-shrink-0"
        style={{
          backgroundColor: "#ffffff",
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            style={{ color: "var(--slds-g-color-text-weak)" }}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div>
              <h1
                style={{
                  fontSize: "var(--slds-g-font-size-7)",
                  fontWeight: 500,
                  lineHeight: 1.25,
                }}
              >
                Mercy Home - Design System
              </h1>
              <p
                style={{
                  fontSize: "var(--slds-g-font-size-3)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Salesforce Lightning Design System 2 - Optimized
                Design Tokens
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() =>
              downloadFile(
                generateAllTokensJSON(),
                "mercy-home-tokens-complete.json",
                "application/json",
              )
            }
            className="flex items-center gap-2"
            style={{
              backgroundColor: "transparent",
              border: "1px solid #145F33",
              color: "#145F33",
              borderRadius: "9999px",
              fontSize: "var(--slds-g-font-size-4)",
            }}
          >
            <Download className="h-4 w-4" />
            All Tokens (.json)
          </Button>
          <Button
            onClick={() => {
              const zip = createZip([
                { name: "mercy-home-colors.css", content: generateColorsCSS() },
                { name: "mercy-home-typography.css", content: generateTypographyCSS() },
                { name: "mercy-home-spacing.css", content: generateSpacingCSS() },
                { name: "mercy-home-borders.css", content: generateBordersCSS() },
                { name: "mercy-home-shadows.css", content: generateShadowsCSS() },
                { name: "mercy-home-components.css", content: generateComponentsCSS() },
              ]);
              downloadBlob(zip, "mercy-home-design-system-css.zip");
            }}
            className="flex items-center gap-2 text-white"
            style={{
              backgroundColor: "#145F33",
              borderRadius: "9999px",
              fontSize: "var(--slds-g-font-size-4)",
            }}
          >
            <Download className="h-4 w-4" />
            All CSS Files
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        className="px-6 flex gap-1 flex-shrink-0"
        style={{
          backgroundColor: "#ffffff",
          borderBottom:
            "2px solid var(--slds-g-color-border-base-3)",
        }}
      >
        {tabs.map((t) => {
          const isActive = activeTab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-3 relative transition-colors"
              style={{
                fontSize: "var(--slds-g-font-size-4)",
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "#145F33" : "#706e6b",
                borderBottomWidth: "3px",
                borderBottomStyle: "solid",
                borderBottomColor: isActive
                  ? "#145F33"
                  : "rgba(0,0,0,0)",
                marginBottom: "-2px",
              }}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div
        className="flex-1 min-h-0 overflow-y-auto"
        style={{ backgroundColor: "#f3f4f6" }}
      >
        <div className="w-full">{renderContent()}</div>
      </div>
    </div>
  );
}