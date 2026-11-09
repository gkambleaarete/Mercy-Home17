import React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Download,
  Filter,
  MoreHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Grid3X3,
  AlignLeft,
  Target,
  Hash,
  Circle,
  Info,
  X,
} from "@/app/lib/lucide-icons";
import { ShowcaseCard, CopyCSSBtn } from "./ShowcaseCard";
import { Button } from "../../ui/button";

// Medium (36px) = Button's existing `default` size, Small (28px) = the new
// `xs` size, Large (44px) = the new `xl` size — all added to ui/button.tsx
// as purely-additive keys so nothing already using size="sm"/"lg" (748
// call sites across the app) shifted pixel value.
const BTN_SIZES = [
  {
    label: "Small — 28px",
    size: "xs" as const,
    iconSize: "icon-xs" as const,
  },
  {
    label: "Medium — 36px",
    size: "default" as const,
    iconSize: "icon" as const,
  },
  {
    label: "Large — 44px",
    size: "xl" as const,
    iconSize: "icon-xl" as const,
  },
];

const SZ: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  color: "#706e6b",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

// ─── Raw-CSS generator for the Copy CSS buttons below ───────────────────────
// Copy CSS must hand back portable CSS, not JSX/component code — these
// values are the real resolved colors (same ones ui/button.tsx's Tailwind
// classes compute to), not re-invented hex.
type BtnVariant =
  | "default"
  | "destructive"
  | "outline"
  | "neutral"
  | "accent"
  | "outline-primary"
  | "outline-destructive"
  | "outline-accent"
  | "ghost"
  | "ghost-primary"
  | "ghost-destructive"
  | "soft"
  | "soft-warning"
  | "soft-destructive";

const BTN_VARIANT_CSS: Record<
  BtnVariant,
  {
    bg: string;
    color: string;
    border?: string;
    hoverBg?: string;
    hoverColor?: string;
  }
> = {
  default: {
    bg: "#145F33",
    color: "#ffffff",
    hoverBg: "color-mix(in srgb, #145F33 90%, transparent)",
  },
  destructive: {
    bg: "#d4183d",
    color: "#ffffff",
    hoverBg: "color-mix(in srgb, #d4183d 90%, transparent)",
  },
  neutral: {
    bg: "#f3f2f2",
    color: "#080707",
    border: "#dddbda",
    hoverBg: "#ecebea",
  },
  accent: {
    bg: "#E86C24",
    color: "#ffffff",
    hoverBg: "color-mix(in srgb, #E86C24 90%, transparent)",
  },
  outline: {
    bg: "transparent",
    color: "#212529",
    border: "#dddbda",
    hoverBg: "#f9fafb",
    hoverColor: "#145F33",
  },
  "outline-primary": {
    bg: "transparent",
    color: "#145F33",
    border: "#145F33",
    hoverBg: "color-mix(in srgb, #145F33 10%, transparent)",
  },
  "outline-destructive": {
    bg: "transparent",
    color: "#d4183d",
    border: "#d4183d",
    hoverBg: "color-mix(in srgb, #d4183d 10%, transparent)",
  },
  "outline-accent": {
    bg: "transparent",
    color: "#E86C24",
    border: "#E86C24",
    hoverBg: "color-mix(in srgb, #E86C24 10%, transparent)",
  },
  ghost: {
    bg: "transparent",
    color: "#212529",
    hoverBg: "#f9fafb",
    hoverColor: "#145F33",
  },
  "ghost-primary": {
    bg: "transparent",
    color: "#145F33",
    hoverBg: "#f9fafb",
  },
  "ghost-destructive": {
    bg: "transparent",
    color: "#d4183d",
    hoverBg: "color-mix(in srgb, #d4183d 10%, transparent)",
  },
  soft: {
    bg: "color-mix(in srgb, #145F33 12%, transparent)",
    color: "#145F33",
    hoverBg: "color-mix(in srgb, #145F33 20%, transparent)",
  },
  "soft-warning": {
    bg: "color-mix(in srgb, #E86C24 12%, transparent)",
    color: "#E86C24",
    hoverBg: "color-mix(in srgb, #E86C24 20%, transparent)",
  },
  "soft-destructive": {
    bg: "color-mix(in srgb, #d4183d 12%, transparent)",
    color: "#d4183d",
    hoverBg: "color-mix(in srgb, #d4183d 20%, transparent)",
  },
};

type BtnSize = "xs" | "default" | "lg" | "xl";
const BTN_SIZE_CSS: Record<
  BtnSize,
  { h: number; padding: string; gap: number; fontSize: number }
> = {
  xs: { h: 28, padding: "0 12px", gap: 6, fontSize: 12 },
  default: { h: 36, padding: "0 16px", gap: 8, fontSize: 14 },
  lg: { h: 40, padding: "0 24px", gap: 8, fontSize: 14 },
  xl: { h: 44, padding: "0 20px", gap: 8, fontSize: 14 },
};

type IconSize = "icon-xs" | "icon" | "icon-xl";
const BTN_ICON_PX: Record<IconSize, number> = {
  "icon-xs": 28,
  icon: 36,
  "icon-xl": 44,
};

function ruleBlock(
  selector: string,
  decls: string[],
  hoverDecls: string[],
) {
  const lines = [
    `${selector} {`,
    ...decls.map((d) => `  ${d}`),
    `}`,
  ];
  if (hoverDecls.length)
    lines.push(
      `${selector}:hover {`,
      ...hoverDecls.map((d) => `  ${d}`),
      `}`,
    );
  return lines.join("\n");
}

export function btnCss(
  variant: BtnVariant,
  size: BtnSize = "default",
  selector?: string,
) {
  const v = BTN_VARIANT_CSS[variant];
  const s = BTN_SIZE_CSS[size];
  const name =
    selector ??
    `.btn--${variant}${size !== "default" ? `--${size}` : ""}`;
  return ruleBlock(
    name,
    [
      "display: inline-flex",
      "align-items: center",
      "justify-content: center",
      `gap: ${s.gap}px`,
      `height: ${s.h}px`,
      `padding: ${s.padding}`,
      "border-radius: 9999px",
      `font-size: ${s.fontSize}px`,
      "font-weight: 500",
      "white-space: nowrap",
      "cursor: pointer",
      `background-color: ${v.bg}`,
      `color: ${v.color}`,
      `border: ${v.border ? `1px solid ${v.border}` : "none"}`,
    ].map((d) => d + (d.endsWith(";") ? "" : ";")),
    [
      ...(v.hoverBg ? [`background-color: ${v.hoverBg};`] : []),
      ...(v.hoverColor ? [`color: ${v.hoverColor};`] : []),
    ],
  );
}

export function iconBtnCss(
  variant: BtnVariant,
  size: IconSize = "icon",
  selector?: string,
) {
  const v = BTN_VARIANT_CSS[variant];
  const px = BTN_ICON_PX[size];
  const name =
    selector ??
    `.btn-icon--${variant}${size !== "icon" ? `--${size}` : ""}`;
  return ruleBlock(
    name,
    [
      "display: inline-flex;",
      "align-items: center;",
      "justify-content: center;",
      `width: ${px}px;`,
      `height: ${px}px;`,
      "border-radius: 9999px;",
      "cursor: pointer;",
      `background-color: ${v.bg};`,
      `color: ${v.color};`,
      `border: ${v.border ? `1px solid ${v.border}` : "none"};`,
    ],
    [
      ...(v.hoverBg ? [`background-color: ${v.hoverBg};`] : []),
      ...(v.hoverColor ? [`color: ${v.hoverColor};`] : []),
    ],
  );
}

function splitButtonCss(
  name: string,
  variant: BtnVariant,
  size: "xs" | "default" | "xl",
  joined: boolean,
) {
  const v = BTN_VARIANT_CSS[variant];
  const s = BTN_SIZE_CSS[size];
  const iconPx =
    BTN_ICON_PX[
      size === "xs"
        ? "icon-xs"
        : size === "xl"
          ? "icon-xl"
          : "icon"
    ];
  return [
    ruleBlock(
      `.btn-split-${name}__action`,
      [
        "display: inline-flex;",
        "align-items: center;",
        "justify-content: center;",
        `height: ${s.h}px;`,
        `padding: ${s.padding};`,
        `font-size: ${s.fontSize}px;`,
        "font-weight: 500;",
        "border-radius: 9999px 0 0 9999px;",
        `background-color: ${v.bg};`,
        `color: ${v.color};`,
        `border: ${v.border ? `1px solid ${v.border}` : "none"};`,
        ...(joined ? [`border-right: none;`] : []),
      ],
      [],
    ),
    ruleBlock(
      `.btn-split-${name}__toggle`,
      [
        "display: inline-flex;",
        "align-items: center;",
        "justify-content: center;",
        `width: ${iconPx}px;`,
        `height: ${s.h}px;`,
        "border-radius: 0 9999px 9999px 0;",
        `background-color: ${v.bg};`,
        `color: ${v.color};`,
        `border: ${v.border ? `1px solid ${v.border}` : "none"};`,
      ],
      [],
    ),
  ].join("\n");
}

function segmentButtonCss(
  name: string,
  active: boolean,
  size: "xs" | "default" | "xl",
  edge: "left" | "middle" | "right",
) {
  const s = BTN_SIZE_CSS[size];
  const v = active
    ? BTN_VARIANT_CSS.default
    : BTN_VARIANT_CSS.neutral;
  const radius =
    edge === "left"
      ? "9999px 0 0 9999px"
      : edge === "right"
        ? "0 9999px 9999px 0"
        : "0";
  return ruleBlock(
    `.btn-segment--${name}`,
    [
      "display: inline-flex;",
      "align-items: center;",
      "justify-content: center;",
      `height: ${s.h}px;`,
      `padding: ${s.padding};`,
      `font-size: ${s.fontSize}px;`,
      "font-weight: 500;",
      `border-radius: ${radius};`,
      `background-color: ${v.bg};`,
      `color: ${v.color};`,
      `border: 1px solid ${v.border ?? v.bg};`,
      ...(edge !== "left" ? [`border-left: none;`] : []),
    ],
    [],
  );
}

const ALL_BTN_VARIANTS: BtnVariant[] = [
  "default",
  "destructive",
  "outline",
  "neutral",
  "accent",
  "outline-primary",
  "outline-destructive",
  "outline-accent",
  "ghost",
  "ghost-primary",
  "ghost-destructive",
  "soft",
  "soft-warning",
  "soft-destructive",
];
const ALL_BTN_SIZES: BtnSize[] = ["xs", "default", "lg", "xl"];
const ALL_ICON_SIZES: IconSize[] = [
  "icon-xs",
  "icon",
  "icon-xl",
];
// Split/segmented groups pair a button with an icon-sized toggle, and this
// app only defines icon sizes for xs/default/xl (see IconSize) — not lg —
// so those two patterns stick to the 3 sizes actually demoed on this page.
const DEMOED_BTN_SIZES: ("xs" | "default" | "xl")[] = [
  "xs",
  "default",
  "xl",
];

// Full stylesheet for every button/icon-button variant × size combination
// shown across this section, plus the one-off link/state/width/split/
// segmented patterns that aren't part of the variant × size matrix.
// Reused (not copy-pasted) by the "All CSS Files" download in
// componentsCssRegistry.ts, so it can never drift from what's on this page.
export function generateButtonsSectionCSS(): string {
  const parts: string[] = [
    "/* ── Buttons: variant × size ── */",
    ...ALL_BTN_VARIANTS.flatMap((variant) =>
      ALL_BTN_SIZES.map((size) => btnCss(variant, size)),
    ),
    "\n/* ── Icon Buttons: variant × size ── */",
    ...ALL_BTN_VARIANTS.flatMap((variant) =>
      ALL_ICON_SIZES.map((size) => iconBtnCss(variant, size)),
    ),
    "\n/* ── Link Buttons ── */",
    `.btn-link { background: transparent; border: none; cursor: pointer; font-weight: 500; font-size: 13px; color: #005EA2; text-decoration: underline; text-underline-offset: 3px; }`,
    `.btn-link-trailing-icon { background: transparent; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 500; font-size: 13px; color: #005EA2; }`,
    `.btn-link-leading-icon { background: transparent; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 500; font-size: 13px; color: #005EA2; }`,
    `.btn-link-external { background: transparent; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 500; font-size: 13px; color: #005EA2; }`,
    "\n/* ── Width Variants ── */",
    btnCss("default", "default", ".btn-hug") +
      "\n.btn-hug { width: auto; }",
    btnCss("default", "default", ".btn-fixed") +
      "\n.btn-fixed { width: 180px; }",
    btnCss("default", "default", ".btn-fill") +
      "\n.btn-fill { width: 100%; }",
    "\n/* ── States ── */",
    ".btn:hover { background-color: color-mix(in srgb, #145F33 90%, transparent); }",
    ".btn:active { filter: brightness(0.9); transform: scale(0.95); }",
    ".btn:focus-visible { box-shadow: 0 0 0 3px rgba(20,95,51,0.5); }",
    btnCss("default", "default", ".btn:disabled") +
      "\n.btn:disabled { pointer-events: none; opacity: 0.5; }",
    btnCss("default", "default", ".btn--loading") +
      "\n.btn--loading { cursor: wait; }\n.btn--loading svg { animation: spin 1s linear infinite; }\n@keyframes spin { to { transform: rotate(360deg); } }",
    "\n/* ── Split Buttons ── */",
    ...DEMOED_BTN_SIZES.flatMap((size) => [
      splitButtonCss("primary", "default", size, false),
      splitButtonCss("outlined", "outline-primary", size, true),
      splitButtonCss("neutral", "neutral", size, true),
    ]),
    "\n/* ── Segmented Button Groups ── */",
    ...DEMOED_BTN_SIZES.flatMap((size) => [
      segmentButtonCss("day", true, size, "left"),
      segmentButtonCss("week", false, size, "middle"),
      segmentButtonCss("month", false, size, "right"),
      segmentButtonCss("grid", true, size, "left"),
      segmentButtonCss("list", false, size, "right"),
    ]),
  ];
  return parts.join("\n");
}

export function ButtonsSection() {
  return (
    <>
      {/* ═══ 4. BUTTONS ═══ */}
      <div id="sec-buttons">
        <h3
          className="mb-6"
          style={{
            fontSize: "var(--slds-g-font-size-6)",
            fontWeight: 500,
          }}
        >
          Button Component Library
        </h3>

        {/* ── Button Sizes ── */}
        <div className="flex flex-col mb-6">
          <ShowcaseCard
            id="BTN-01"
            title="Button Sizes"
            description="Three standard heights: 28px · 36px · 44px — via the size prop"
          >
            <div className="flex flex-wrap items-end gap-6">
              {BTN_SIZES.map(({ label, size }) => (
                <div
                  key={label}
                  className="group/item flex flex-col items-center gap-2"
                >
                  <Button size={size}>
                    {label.split(" — ")[0]}
                  </Button>
                  <div className="flex flex-col items-center gap-0.5">
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#706e6b",
                        fontWeight: 600,
                      }}
                    >
                      {label.split(" — ")[1]}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#b0adab",
                      }}
                    >
                      size=&quot;{size}&quot;
                    </span>
                  </div>
                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <CopyCSSBtn css={btnCss("default", size)} />
                  </div>
                </div>
              ))}
            </div>
          </ShowcaseCard>
        </div>

        <div className="flex flex-col gap-6">
          {/* ── Row 1: Filled + Outlined ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ShowcaseCard id="BTN-02" title="Filled Buttons">
              <div className="flex flex-col gap-4">
                {BTN_SIZES.map(({ label, size }) => (
                  <div key={label}>
                    <p style={SZ}>{label}</p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="default" size={size}>
                          Primary
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss("default", size)}
                          />
                        </div>
                      </div>
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="neutral" size={size}>
                          Neutral
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss("neutral", size)}
                          />
                        </div>
                      </div>
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button
                          variant="destructive"
                          size={size}
                        >
                          Destructive
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss("destructive", size)}
                          />
                        </div>
                      </div>
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="accent" size={size}>
                          Accent
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss("accent", size)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ShowcaseCard>

            <ShowcaseCard id="BTN-03" title="Outlined Buttons">
              <div className="flex flex-col gap-4">
                {BTN_SIZES.map(({ label, size }) => (
                  <div key={label}>
                    <p style={SZ}>{label}</p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button
                          variant="outline-primary"
                          size={size}
                        >
                          Primary
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss(
                              "outline-primary",
                              size,
                            )}
                          />
                        </div>
                      </div>
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="outline" size={size}>
                          Neutral
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss("outline", size)}
                          />
                        </div>
                      </div>
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button
                          variant="outline-destructive"
                          size={size}
                        >
                          Destructive
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss(
                              "outline-destructive",
                              size,
                            )}
                          />
                        </div>
                      </div>
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button
                          variant="outline-accent"
                          size={size}
                        >
                          Accent
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss("outline-accent", size)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ShowcaseCard>
          </div>

          {/* ── Row 2: Ghost + Soft ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ShowcaseCard id="BTN-04" title="Ghost Buttons">
              <div className="flex flex-col gap-4">
                {BTN_SIZES.map(({ label, size }) => (
                  <div key={label}>
                    <p style={SZ}>{label}</p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button
                          variant="ghost-primary"
                          size={size}
                        >
                          Primary
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss("ghost-primary", size)}
                          />
                        </div>
                      </div>
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="ghost" size={size}>
                          Neutral
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss("ghost", size)}
                          />
                        </div>
                      </div>
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button
                          variant="ghost-destructive"
                          size={size}
                        >
                          Destructive
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss(
                              "ghost-destructive",
                              size,
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ShowcaseCard>

            <ShowcaseCard id="BTN-05" title="Soft Buttons">
              <div className="flex flex-col gap-4">
                {BTN_SIZES.map(({ label, size, iconSize }) => (
                  <div key={label}>
                    <p style={SZ}>{label}</p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="soft" size={size}>
                          Primary
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss("soft", size)}
                          />
                        </div>
                      </div>
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="soft" size={size}>
                          <CheckCircle
                            className={
                              iconSize === "icon-xs"
                                ? "h-3 w-3"
                                : "h-3.5 w-3.5"
                            }
                          />{" "}
                          Success
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss(
                              "soft",
                              size,
                              ".btn--soft-success",
                            )}
                          />
                        </div>
                      </div>
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button
                          variant="soft-warning"
                          size={size}
                        >
                          <AlertTriangle
                            className={
                              iconSize === "icon-xs"
                                ? "h-3 w-3"
                                : "h-3.5 w-3.5"
                            }
                          />{" "}
                          Warning
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss("soft-warning", size)}
                          />
                        </div>
                      </div>
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button
                          variant="soft-destructive"
                          size={size}
                        >
                          <AlertCircle
                            className={
                              iconSize === "icon-xs"
                                ? "h-3 w-3"
                                : "h-3.5 w-3.5"
                            }
                          />{" "}
                          Error
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss(
                              "soft-destructive",
                              size,
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ShowcaseCard>
          </div>

          {/* ── Link Buttons ── */}
          <ShowcaseCard id="BTN-06" title="Link Buttons">
            <div className="flex flex-wrap gap-5 items-start">
              <div className="group/item flex flex-col items-center gap-1">
                <Button
                  variant="link-info"
                  className="px-0 h-auto"
                >
                  Learn More
                </Button>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <CopyCSSBtn css=".btn-link { background: transparent; border: none; cursor: pointer; font-weight: 500; font-size: 13px; color: #005EA2; text-decoration: underline; text-underline-offset: 3px; }" />
                </div>
              </div>
              <div className="group/item flex flex-col items-center gap-1">
                <Button
                  variant="link-info"
                  className="px-0 h-auto gap-1"
                >
                  View Details{" "}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <CopyCSSBtn css=".btn-link-trailing-icon { background: transparent; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 500; font-size: 13px; color: #005EA2; }" />
                </div>
              </div>
              <div className="group/item flex flex-col items-center gap-1">
                <Button
                  variant="link-info"
                  className="px-0 h-auto gap-1"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <CopyCSSBtn css=".btn-link-leading-icon { background: transparent; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 500; font-size: 13px; color: #005EA2; }" />
                </div>
              </div>
              <div className="group/item flex flex-col items-center gap-1">
                <Button
                  variant="link-info"
                  className="px-0 h-auto gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open
                  Link
                </Button>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <CopyCSSBtn css=".btn-link-external { background: transparent; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 500; font-size: 13px; color: #005EA2; }" />
                </div>
              </div>
            </div>
          </ShowcaseCard>

          {/* ── Inline size ── */}
          <ShowcaseCard
            id="BTN-06B"
            title="Link Button — Inline Size"
            description="size=inline drops the fixed height and padding and takes its font size from the surrounding text — for name links in table cells and sort buttons in table headers. Pair with variant=link-info (and asChild for a router Link)."
          >
            <div className="flex flex-wrap items-center gap-6">
              <Button variant="link-info" size="inline">
                Marcus Johnson
              </Button>
              <span className="text-[length:var(--slds-g-font-size-3)] uppercase tracking-wide text-[var(--slds-g-color-text-weak)]">
                <Button variant="ghost" size="inline">
                  Start Date
                </Button>
              </span>
            </div>
          </ShowcaseCard>

          {/* ── Icon Buttons ── */}
          <ShowcaseCard id="BTN-07" title="Icon Buttons">
            <div className="flex flex-col gap-5">
              <div>
                <p
                  className="mb-3 font-medium"
                  style={{
                    fontSize: "var(--slds-g-font-size-3)",
                    color: "var(--slds-g-color-text-weak)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Sizes — 28 / 36 / 44px
                </p>
                <div className="flex flex-wrap items-end gap-4">
                  {BTN_SIZES.map(({ label, iconSize }) => (
                    <div
                      key={label}
                      className="group/item flex flex-col items-center gap-2"
                    >
                      <Button size={iconSize} aria-label="Add">
                        <Plus />
                      </Button>
                      <span
                        style={{
                          fontSize: "10px",
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {label.split(" — ")[1]}
                      </span>
                      <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <CopyCSSBtn
                          css={iconBtnCss("default", iconSize)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {[
                  {
                    label: "Filled",
                    variant: "default" as const,
                    destructiveVariant: "destructive" as const,
                  },
                  {
                    label: "Outlined",
                    variant: "outline-primary" as const,
                    destructiveVariant:
                      "outline-destructive" as const,
                  },
                  {
                    label: "Ghost",
                    variant: "ghost-primary" as const,
                    destructiveVariant:
                      "ghost-destructive" as const,
                  },
                  {
                    label: "Soft",
                    variant: "soft" as const,
                    destructiveVariant:
                      "soft-destructive" as const,
                  },
                ].map(
                  ({ label, variant, destructiveVariant }) => (
                    <div key={label}>
                      <p
                        className="mb-2"
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#706e6b",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(
                          [
                            Plus,
                            Pencil,
                            Trash2,
                            Search,
                            Download,
                            Filter,
                            MoreHorizontal,
                          ] as React.ElementType[]
                        ).map((Icon, i) => (
                          <div
                            key={`${label}-${i}`}
                            className="group/item flex flex-col items-center gap-1"
                          >
                            <Button
                              variant={
                                i === 2
                                  ? destructiveVariant
                                  : variant
                              }
                              size="icon"
                            >
                              <Icon />
                            </Button>
                            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <CopyCSSBtn
                                css={iconBtnCss(
                                  i === 2
                                    ? destructiveVariant
                                    : variant,
                                  "icon",
                                )}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </ShowcaseCard>

          {/* ── Buttons with Icons + Split ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ShowcaseCard
              id="BTN-08"
              title="Buttons with Icons"
            >
              <div className="flex flex-wrap gap-x-10 gap-y-4">
                <div className="flex flex-col gap-4">
                  <p style={SZ}>Medium — 36px</p>
                  <div>
                    <p
                      className="mb-2"
                      style={{
                        fontSize: "12px",
                        color: "#706e6b",
                      }}
                    >
                      Leading Icon
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="default">
                          <Plus /> Add User
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn css={btnCss("default")} />
                        </div>
                      </div>
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="outline-primary">
                          <Filter /> Filters
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss("outline-primary")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p
                      className="mb-2"
                      style={{
                        fontSize: "12px",
                        color: "#706e6b",
                      }}
                    >
                      Trailing Icon
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="default">
                          Export <Download />
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn css={btnCss("default")} />
                        </div>
                      </div>
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="outline">
                          Next <ChevronRight />
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn css={btnCss("outline")} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p
                      className="mb-2"
                      style={{
                        fontSize: "12px",
                        color: "#706e6b",
                      }}
                    >
                      Leading + Trailing
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="default">
                          <Filter /> Filters <ChevronDown />
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn css={btnCss("default")} />
                        </div>
                      </div>
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="outline">
                          <ChevronLeft /> Page <ChevronRight />
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn css={btnCss("outline")} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <p style={SZ}>Small — 28px</p>
                  <div>
                    <p
                      className="mb-2"
                      style={{
                        fontSize: "12px",
                        color: "#706e6b",
                      }}
                    >
                      Leading Icon
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="default" size="xs">
                          <Plus /> Add
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss("default", "xs")}
                          />
                        </div>
                      </div>
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button
                          variant="outline-primary"
                          size="xs"
                        >
                          <Plus /> Add
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss(
                              "outline-primary",
                              "xs",
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p
                      className="mb-2"
                      style={{
                        fontSize: "12px",
                        color: "#706e6b",
                      }}
                    >
                      Trailing Icon
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="default" size="xs">
                          Export <Download />
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss("default", "xs")}
                          />
                        </div>
                      </div>
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="outline" size="xs">
                          Next <ChevronRight />
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss("outline", "xs")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p
                      className="mb-2"
                      style={{
                        fontSize: "12px",
                        color: "#706e6b",
                      }}
                    >
                      Leading + Trailing
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="default" size="xs">
                          <Filter /> Filters <ChevronDown />
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss("default", "xs")}
                          />
                        </div>
                      </div>
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="outline" size="xs">
                          <ChevronLeft /> Page <ChevronRight />
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss("outline", "xs")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ShowcaseCard>

            <ShowcaseCard
              id="BTN-09"
              title="Split Buttons"
              description="Two adjacent Button instances glued into one control via className overrides on the shared edge — this app has no separate SplitButton primitive, and top design systems generally don't ship one either (it's a composition, not a new component)."
            >
              <div className="flex flex-col gap-4">
                {BTN_SIZES.map(({ label, size, iconSize }) => {
                  const s = BTN_SIZE_CSS[size];
                  const iconPx = BTN_ICON_PX[iconSize];
                  const splitCss = (
                    name: string,
                    variant: BtnVariant,
                    joined: boolean,
                  ) => {
                    const v = BTN_VARIANT_CSS[variant];
                    return [
                      ruleBlock(
                        `.btn-split-${name}__action`,
                        [
                          "display: inline-flex;",
                          "align-items: center;",
                          "justify-content: center;",
                          `height: ${s.h}px;`,
                          `padding: ${s.padding};`,
                          `font-size: ${s.fontSize}px;`,
                          "font-weight: 500;",
                          "border-radius: 9999px 0 0 9999px;",
                          `background-color: ${v.bg};`,
                          `color: ${v.color};`,
                          `border: ${v.border ? `1px solid ${v.border}` : "none"};`,
                          ...(joined
                            ? [`border-right: none;`]
                            : []),
                        ],
                        [],
                      ),
                      ruleBlock(
                        `.btn-split-${name}__toggle`,
                        [
                          "display: inline-flex;",
                          "align-items: center;",
                          "justify-content: center;",
                          `width: ${iconPx}px;`,
                          `height: ${s.h}px;`,
                          "border-radius: 0 9999px 9999px 0;",
                          `background-color: ${v.bg};`,
                          `color: ${v.color};`,
                          `border: ${v.border ? `1px solid ${v.border}` : "none"};`,
                        ],
                        [],
                      ),
                    ].join("\n");
                  };
                  return (
                    <div key={label}>
                      <p style={SZ}>{label}</p>
                      <div className="flex flex-wrap gap-3 items-center mt-2">
                        <div className="group/item flex flex-col items-center gap-1">
                          <div className="flex items-center">
                            <Button
                              variant="default"
                              size={size}
                              className="rounded-r-none"
                            >
                              Save
                            </Button>
                            <div
                              style={{
                                width: 1,
                                alignSelf: "stretch",
                                backgroundColor:
                                  "rgba(255,255,255,0.35)",
                              }}
                            />
                            <Button
                              variant="default"
                              size={iconSize}
                              className="rounded-l-none"
                              aria-label="More save options"
                            >
                              <ChevronDown />
                            </Button>
                          </div>
                          <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <CopyCSSBtn
                              css={splitCss(
                                "primary",
                                "default",
                                false,
                              )}
                            />
                          </div>
                        </div>
                        <div className="group/item flex flex-col items-center gap-1">
                          <div className="flex items-center">
                            <Button
                              variant="outline-primary"
                              size={size}
                              className="rounded-r-none border-r-0"
                            >
                              Export
                            </Button>
                            <Button
                              variant="outline-primary"
                              size={iconSize}
                              className="rounded-l-none"
                              aria-label="More export options"
                            >
                              <ChevronDown />
                            </Button>
                          </div>
                          <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <CopyCSSBtn
                              css={splitCss(
                                "outlined",
                                "outline-primary",
                                true,
                              )}
                            />
                          </div>
                        </div>
                        <div className="group/item flex flex-col items-center gap-1">
                          <div className="flex items-center">
                            <Button
                              variant="neutral"
                              size={size}
                              className="rounded-r-none border-r-0"
                            >
                              Assign
                            </Button>
                            <Button
                              variant="neutral"
                              size={iconSize}
                              className="rounded-l-none"
                              aria-label="More assign options"
                            >
                              <ChevronDown />
                            </Button>
                          </div>
                          <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <CopyCSSBtn
                              css={splitCss(
                                "neutral",
                                "neutral",
                                true,
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ShowcaseCard>
          </div>

          {/* ── Dropdown + Segmented ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ShowcaseCard id="BTN-10" title="Dropdown Buttons">
              <div className="flex flex-col gap-4">
                {BTN_SIZES.map(({ label, size }) => (
                  <div key={label}>
                    <p style={SZ}>{label}</p>
                    <div className="flex flex-wrap gap-2 items-center mt-2">
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="default" size={size}>
                          Actions <ChevronDown />
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss("default", size)}
                          />
                        </div>
                      </div>
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="outline" size={size}>
                          Status <ChevronDown />
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss("outline", size)}
                          />
                        </div>
                      </div>
                      <div className="group/item flex flex-col items-center gap-1">
                        <Button variant="neutral" size={size}>
                          <MoreHorizontal /> More
                        </Button>
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CopyCSSBtn
                            css={btnCss("neutral", size)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ShowcaseCard>

            <ShowcaseCard
              id="BTN-11"
              title="Segmented Button Groups"
              description="A row of Buttons sharing one border, active segment set via variant. Composed here rather than as a new primitive — same reasoning as Split Buttons."
            >
              <div className="flex flex-col gap-4">
                {BTN_SIZES.map(({ label, size }) => {
                  const s = BTN_SIZE_CSS[size];
                  const segRule = (
                    name: string,
                    active: boolean,
                    edge: "left" | "middle" | "right",
                  ) => {
                    const v = active
                      ? BTN_VARIANT_CSS.default
                      : BTN_VARIANT_CSS.neutral;
                    const radius =
                      edge === "left"
                        ? "9999px 0 0 9999px"
                        : edge === "right"
                          ? "0 9999px 9999px 0"
                          : "0";
                    return ruleBlock(
                      `.btn-segment--${name}`,
                      [
                        "display: inline-flex;",
                        "align-items: center;",
                        "justify-content: center;",
                        `height: ${s.h}px;`,
                        `padding: ${s.padding};`,
                        `font-size: ${s.fontSize}px;`,
                        "font-weight: 500;",
                        `border-radius: ${radius};`,
                        `background-color: ${v.bg};`,
                        `color: ${v.color};`,
                        `border: 1px solid ${v.border ?? v.bg};`,
                        ...(edge !== "left"
                          ? [`border-left: none;`]
                          : []),
                      ],
                      [],
                    );
                  };
                  return (
                    <div key={label}>
                      <p style={SZ}>{label}</p>
                      <div className="flex flex-wrap gap-5 items-start mt-2">
                        <div>
                          <p
                            className="mb-1.5"
                            style={{
                              fontSize:
                                "var(--slds-g-font-size-3)",
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Time Range
                          </p>
                          <div className="group/item flex flex-col items-start gap-1">
                            <div className="flex">
                              {(
                                [
                                  "Day",
                                  "Week",
                                  "Month",
                                ] as string[]
                              ).map((seg, i) => (
                                <Button
                                  key={seg}
                                  variant={
                                    i === 0
                                      ? "default"
                                      : "neutral"
                                  }
                                  size={size}
                                  className={
                                    i === 0
                                      ? "rounded-r-none"
                                      : i === 2
                                        ? "rounded-l-none border-l-0"
                                        : "rounded-none border-l-0"
                                  }
                                >
                                  {seg}
                                </Button>
                              ))}
                            </div>
                            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <CopyCSSBtn
                                css={[
                                  segRule("day", true, "left"),
                                  segRule(
                                    "week",
                                    false,
                                    "middle",
                                  ),
                                  segRule(
                                    "month",
                                    false,
                                    "right",
                                  ),
                                ].join("\n")}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <p
                            className="mb-1.5"
                            style={{
                              fontSize:
                                "var(--slds-g-font-size-3)",
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            View Mode
                          </p>
                          <div className="group/item flex flex-col items-start gap-1">
                            <div className="flex">
                              {(
                                [
                                  {
                                    label: "Grid",
                                    Icon: Grid3X3,
                                    active: true,
                                  },
                                  {
                                    label: "List",
                                    Icon: AlignLeft,
                                    active: false,
                                  },
                                ] as {
                                  label: string;
                                  Icon: React.ElementType;
                                  active: boolean;
                                }[]
                              ).map(
                                (
                                  { label: seg, Icon, active },
                                  i,
                                ) => (
                                  <Button
                                    key={seg}
                                    variant={
                                      active
                                        ? "default"
                                        : "neutral"
                                    }
                                    size={size}
                                    className={
                                      i === 0
                                        ? "rounded-r-none"
                                        : "rounded-l-none border-l-0"
                                    }
                                  >
                                    <Icon /> {seg}
                                  </Button>
                                ),
                              )}
                            </div>
                            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <CopyCSSBtn
                                css={[
                                  segRule("grid", true, "left"),
                                  segRule(
                                    "list",
                                    false,
                                    "right",
                                  ),
                                ].join("\n")}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ShowcaseCard>
          </div>

          {/* ── Width Variants ── */}
          <ShowcaseCard id="BTN-12" title="Width Variants">
            <div className="flex flex-col gap-3 max-w-lg">
              <div className="group/item flex flex-col gap-1">
                <div className="flex items-center gap-4">
                  <span
                    className="w-28 shrink-0 font-medium"
                    style={{
                      fontSize: "var(--slds-g-font-size-3)",
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Hug Content
                  </span>
                  <Button variant="default">
                    Save Changes
                  </Button>
                </div>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity pl-32">
                  <CopyCSSBtn
                    css={
                      btnCss("default", "default", ".btn-hug") +
                      "\n.btn-hug { width: auto; }"
                    }
                  />
                </div>
              </div>
              <div className="group/item flex flex-col gap-1">
                <div className="flex items-center gap-4">
                  <span
                    className="w-28 shrink-0 font-medium"
                    style={{
                      fontSize: "var(--slds-g-font-size-3)",
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Fixed Width
                  </span>
                  <Button
                    variant="default"
                    className="w-[180px]"
                  >
                    Save Changes
                  </Button>
                </div>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity pl-32">
                  <CopyCSSBtn
                    css={
                      btnCss(
                        "default",
                        "default",
                        ".btn-fixed",
                      ) + "\n.btn-fixed { width: 180px; }"
                    }
                  />
                </div>
              </div>
              <div className="group/item flex flex-col gap-1">
                <div className="flex items-center gap-4">
                  <span
                    className="w-28 shrink-0 font-medium"
                    style={{
                      fontSize: "var(--slds-g-font-size-3)",
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Fill Container
                  </span>
                  <Button variant="default" className="flex-1">
                    Save Changes
                  </Button>
                </div>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity pl-32">
                  <CopyCSSBtn
                    css={
                      btnCss(
                        "default",
                        "default",
                        ".btn-fill",
                      ) + "\n.btn-fill { width: 100%; }"
                    }
                  />
                </div>
              </div>
            </div>
          </ShowcaseCard>

          {/* ── States ── */}
          <ShowcaseCard
            id="BTN-13"
            title="States"
            description="Hover/Pressed/Focused can't be held open in a static page without stealing real interaction, so — same technique used for Select's Focus demo — each one is the real Button with that state's own utility classes applied unconditionally instead of behind :hover/:active/:focus-visible."
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5">
              <div className="group/item flex flex-col items-start gap-2">
                <span
                  className="font-medium"
                  style={{
                    fontSize: "var(--slds-g-font-size-3)",
                    color: "var(--slds-g-color-text-weak)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Default
                </span>
                <Button variant="default">Button</Button>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <CopyCSSBtn css={btnCss("default")} />
                </div>
              </div>
              <div className="group/item flex flex-col items-start gap-2">
                <span
                  className="font-medium"
                  style={{
                    fontSize: "var(--slds-g-font-size-3)",
                    color: "var(--slds-g-color-text-weak)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Hover
                </span>
                <Button
                  variant="default"
                  className="bg-primary/90"
                >
                  Button
                </Button>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <CopyCSSBtn css=".btn:hover { background-color: color-mix(in srgb, #145F33 90%, transparent); }" />
                </div>
              </div>
              <div className="group/item flex flex-col items-start gap-2">
                <span
                  className="font-medium"
                  style={{
                    fontSize: "var(--slds-g-font-size-3)",
                    color: "var(--slds-g-color-text-weak)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Pressed
                </span>
                <Button
                  variant="default"
                  className="scale-95 brightness-90"
                >
                  Button
                </Button>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <CopyCSSBtn css=".btn:active { filter: brightness(0.9); transform: scale(0.95); }" />
                </div>
              </div>
              <div className="group/item flex flex-col items-start gap-2">
                <span
                  className="font-medium"
                  style={{
                    fontSize: "var(--slds-g-font-size-3)",
                    color: "var(--slds-g-color-text-weak)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Focused
                </span>
                <Button
                  variant="default"
                  className="border-ring ring-ring/50 ring-[3px]"
                >
                  Button
                </Button>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <CopyCSSBtn css=".btn:focus-visible { box-shadow: 0 0 0 3px rgba(20,95,51,0.5); }" />
                </div>
              </div>
              <div className="group/item flex flex-col items-start gap-2">
                <span
                  className="font-medium"
                  style={{
                    fontSize: "var(--slds-g-font-size-3)",
                    color: "var(--slds-g-color-text-weak)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Disabled
                </span>
                <Button variant="default" disabled>
                  Button
                </Button>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <CopyCSSBtn
                    css={
                      btnCss(
                        "default",
                        "default",
                        ".btn:disabled",
                      ) +
                      "\n.btn:disabled { pointer-events: none; opacity: 0.5; }"
                    }
                  />
                </div>
              </div>
              <div className="group/item flex flex-col items-start gap-2">
                <span
                  className="font-medium"
                  style={{
                    fontSize: "var(--slds-g-font-size-3)",
                    color: "var(--slds-g-color-text-weak)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Loading
                </span>
                <Button
                  variant="default"
                  aria-busy="true"
                  className="cursor-wait"
                >
                  <RefreshCw className="animate-spin" /> Saving…
                </Button>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <CopyCSSBtn
                    css={
                      btnCss(
                        "default",
                        "default",
                        ".btn--loading",
                      ) +
                      "\n.btn--loading { cursor: wait; }\n.btn--loading svg { animation: spin 1s linear infinite; }\n@keyframes spin { to { transform: rotate(360deg); } }"
                    }
                  />
                </div>
              </div>
              <div className="group/item flex flex-col items-start gap-2">
                <span
                  className="font-medium"
                  style={{
                    fontSize: "var(--slds-g-font-size-3)",
                    color: "var(--slds-g-color-text-weak)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Success
                </span>
                <Button variant="soft">
                  <CheckCircle /> Saved!
                </Button>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <CopyCSSBtn css={btnCss("soft")} />
                </div>
              </div>
              <div className="group/item flex flex-col items-start gap-2">
                <span
                  className="font-medium"
                  style={{
                    fontSize: "var(--slds-g-font-size-3)",
                    color: "var(--slds-g-color-text-weak)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Error
                </span>
                <Button variant="soft-destructive">
                  <AlertCircle /> Failed
                </Button>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <CopyCSSBtn
                    css={btnCss("soft-destructive")}
                  />
                </div>
              </div>
            </div>
          </ShowcaseCard>

          {/* ── Accessibility + Component Properties ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ShowcaseCard
              id="BTN-14"
              title="Accessibility Guidelines"
            >
              <div className="flex flex-col gap-3.5">
                {(
                  [
                    {
                      Icon: Target,
                      label: "Touch Target",
                      desc: 'Minimum 44×44px tap area — use size="xl" / size="icon-xl" for touch-first surfaces',
                    },
                    {
                      Icon: Hash,
                      label: "Keyboard Navigation",
                      desc: "Tab to focus · Enter or Space to activate",
                    },
                    {
                      Icon: Circle,
                      label: "Focus Ring",
                      desc: "focus-visible:ring-ring/50 ring-[3px] — from the real Button component, not redrawn per instance",
                    },
                    {
                      Icon: X,
                      label: "Disabled Behaviour",
                      desc: "disabled prop → disabled:pointer-events-none disabled:opacity-50",
                    },
                    {
                      Icon: RefreshCw,
                      label: "Loading Behaviour",
                      desc: "aria-busy='true' · aria-label describes the in-progress action",
                    },
                    {
                      Icon: Info,
                      label: "ARIA Guidelines",
                      desc: "aria-label required on icon-only buttons (size='icon'/'icon-xs'/'icon-xl')",
                    },
                  ] as {
                    Icon: React.ElementType;
                    label: string;
                    desc: string;
                  }[]
                ).map(({ Icon, label, desc }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3"
                  >
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-full"
                      style={{
                        width: 28,
                        height: 28,
                        backgroundColor:
                          "color-mix(in srgb, var(--color-brand-primary) 10%, transparent)",
                        color: "var(--color-brand-primary)",
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div
                        className="font-medium"
                        style={{
                          fontSize: "var(--slds-g-font-size-4)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: "var(--slds-g-font-size-3)",
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ShowcaseCard>

            <ShowcaseCard
              id="BTN-15"
              title="Component Properties"
              description="The real, implemented prop surface of ui/button.tsx — every value below actually exists as a cva variant, not aspirational."
            >
              <div className="flex flex-col">
                {(
                  [
                    {
                      prop: "variant",
                      values:
                        "default · destructive · outline · secondary · ghost · link (existing, untouched) · neutral · accent · outline-primary · outline-destructive · outline-accent · ghost-primary · ghost-destructive · soft · soft-warning · soft-destructive · link-info (new)",
                    },
                    {
                      prop: "size",
                      values:
                        "default(36) · sm(32) · lg(40) · icon(36) (existing, untouched) · xs(28) · xl(44) · icon-xs(28) · icon-xl(44) · inline (auto height, no padding, inherits font size) (new)",
                    },
                    {
                      prop: "asChild",
                      values:
                        "boolean — render as a different element via Radix Slot",
                    },
                    { prop: "disabled", values: "boolean" },
                    {
                      prop: "aria-busy",
                      values:
                        "boolean — pairs with a spinner child for loading state",
                    },
                  ] as { prop: string; values: string }[]
                ).map(({ prop, values }, i, arr) => (
                  <div
                    key={prop}
                    className="flex items-start gap-3 py-2"
                    style={{
                      borderBottom:
                        i < arr.length - 1
                          ? "1px solid var(--slds-g-color-border-base-1)"
                          : "none",
                    }}
                  >
                    <code
                      className="shrink-0 font-mono font-semibold"
                      style={{
                        width: 110,
                        color: "var(--color-brand-primary)",
                        fontSize: "var(--slds-g-font-size-3)",
                      }}
                    >
                      {prop}
                    </code>
                    <span
                      style={{
                        fontSize: "var(--slds-g-font-size-3)",
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {values}
                    </span>
                  </div>
                ))}
              </div>
            </ShowcaseCard>
          </div>
        </div>
      </div>
    </>
  );
}