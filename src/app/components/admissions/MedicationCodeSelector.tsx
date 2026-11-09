import { useState, useRef, useEffect } from "react";
import { Check } from "@/app/lib/lucide-icons";

// ── Code data ──────────────────────────────────────────────────────────────────

export interface MedCode {
  code: string;
  fullLabel: string;   // e.g. "PAK -- Packed - Pass/Outing"
  codeType: MedCodeType;
  tooltip: string;
  commentRequired: boolean;
  auditFlag: boolean;
}

export type MedCodeType =
  | "Coded - Routine"
  | "Coded - Staff Concern"
  | "Coded - Youth Concern"
  | "Other";

// Canonical code list — single source of truth per requirements
// 17 codes across 4 groups (note: AC1 references "18" but spec defines 17)
export const MED_CODES: MedCode[] = [
  // Coded - Routine
  { code: "DRA", fullLabel: "DRA -- Adjusted Dose - Medical Orders",  codeType: "Coded - Routine",        tooltip: "Medical professional advised adjusted dose",               commentRequired: true, auditFlag: false },
  { code: "PRN", fullLabel: "PRN -- No Dose - Decline PRN",           codeType: "Coded - Routine",        tooltip: "Youth declined an AS NEEDED medication",                   commentRequired: true, auditFlag: false },
  { code: "MED", fullLabel: "MED -- No Dose - Medical Orders",        codeType: "Coded - Routine",        tooltip: "Medical professional advised to skip dose",                commentRequired: true, auditFlag: false },
  { code: "HOS", fullLabel: "HOS -- No Dose - Youth Hospitalized",    codeType: "Coded - Routine",        tooltip: "Youth hospitalized, medication managed by hospital",        commentRequired: true, auditFlag: false },
  { code: "PAK", fullLabel: "PAK -- Packed - Pass/Outing",            codeType: "Coded - Routine",        tooltip: "Packed medication for pass or outing",                     commentRequired: true, auditFlag: false },
  { code: "SCH", fullLabel: "SCH -- Packed - School",                 codeType: "Coded - Routine",        tooltip: "Packed for school or given at school",                     commentRequired: true, auditFlag: false },
  { code: "WTA", fullLabel: "WTA -- Wrong Time - Approved",           codeType: "Coded - Routine",        tooltip: "Dose provided outside dose window with approval",          commentRequired: true, auditFlag: false },
  // Coded - Staff Concern
  { code: "ADS", fullLabel: "ADS -- Adjusted Dose - Staff Error",     codeType: "Coded - Staff Concern",  tooltip: "Staff provided incorrect dose",                            commentRequired: true, auditFlag: true  },
  { code: "MDS", fullLabel: "MDS -- Missed Dose - Staff Error",       codeType: "Coded - Staff Concern",  tooltip: "Staff did not offer or provide dose",                      commentRequired: true, auditFlag: true  },
  { code: "EMP", fullLabel: "EMP -- No Dose - Out of Stock",          codeType: "Coded - Staff Concern",  tooltip: "No supply of medications in cart",                         commentRequired: true, auditFlag: true  },
  { code: "UNS", fullLabel: "UNS -- Unapproved Dose - Staff Error",   codeType: "Coded - Staff Concern",  tooltip: "Unapproved Dose Given",                                    commentRequired: true, auditFlag: true  },
  { code: "WTU", fullLabel: "WTU -- Wrong Time - Unapproved",         codeType: "Coded - Staff Concern",  tooltip: "Dose provided outside dose window without approval",       commentRequired: true, auditFlag: true  },
  // Coded - Youth Concern
  { code: "MPM", fullLabel: "MPM -- Missed Packed Med",               codeType: "Coded - Youth Concern",  tooltip: "Packed and received medication not taken",                 commentRequired: true, auditFlag: true  },
  { code: "ABS", fullLabel: "ABS -- No Dose - Youth Absent",          codeType: "Coded - Youth Concern",  tooltip: "Youth absent during dose period",                          commentRequired: true, auditFlag: true  },
  { code: "CON", fullLabel: "CON -- No Dose - Youth Condition",       codeType: "Coded - Youth Concern",  tooltip: "Illness, Intoxication, Behavioral Concerns",               commentRequired: true, auditFlag: true  },
  { code: "REF", fullLabel: "REF -- No Dose - Youth Refusal",         codeType: "Coded - Youth Concern",  tooltip: "Youth refused a scheduled dose",                           commentRequired: true, auditFlag: true  },
  // Other
  { code: "OTH", fullLabel: "OTH -- Other Reason Not Given",          codeType: "Other",                  tooltip: "Dose not given - other codes do not apply",               commentRequired: true, auditFlag: true  },
];

// Lookup map by code key
export const MED_CODE_MAP: Record<string, MedCode> = Object.fromEntries(
  MED_CODES.map(c => [c.code, c])
);

// Set Primary tab — flat list, PAK/SCH at top per requirements
export const SET_PRIMARY_CODE_ORDER: string[] = [
  "PAK","SCH","DRA","PRN","MED","HOS","WTA",
  "ADS","MDS","EMP","UNS","WTU",
  "MPM","ABS","CON","REF","OTH",
];
export const SET_PRIMARY_CODES: MedCode[] = SET_PRIMARY_CODE_ORDER.map(c => MED_CODE_MAP[c]);

// Grouped display — Single Youth Dispensation Screen order per requirements
export const GROUPED_CODES: { groupLabel: MedCodeType; codes: MedCode[] }[] = [
  { groupLabel: "Coded - Routine",       codes: MED_CODES.filter(c => c.codeType === "Coded - Routine") },
  { groupLabel: "Coded - Staff Concern", codes: MED_CODES.filter(c => c.codeType === "Coded - Staff Concern") },
  { groupLabel: "Coded - Youth Concern", codes: MED_CODES.filter(c => c.codeType === "Coded - Youth Concern") },
  { groupLabel: "Other",                 codes: MED_CODES.filter(c => c.codeType === "Other") },
];

// ── Badge color by type ────────────────────────────────────────────────────────

const TYPE_BADGE_STYLE: Record<MedCodeType, { bg: string; color: string }> = {
  "Coded - Routine":       { bg: "#e8f4fd", color: "#0176d3" },
  "Coded - Staff Concern": { bg: "#fef3e2", color: "#ca8a04" },
  "Coded - Youth Concern": { bg: "#f3e8fd", color: "#7c3aed" },
  "Other":                 { bg: "#f3f4f6", color: "#6b7280" },
};

// ── MedicationCodeSelector ─────────────────────────────────────────────────────

interface Props {
  codes: MedCode[];
  /** Currently selected code key (e.g. "PAK") or "" */
  value: string;
  onChange: (code: MedCode | null) => void;
  /** Show a "— No Code —" clear option at the very top */
  allowClear?: boolean;
  /** Max height of the scrollable list (default 288px) */
  maxHeight?: number;
  /** Show type group header labels */
  showGroups?: boolean;
  groupedCodes?: { groupLabel: MedCodeType; codes: MedCode[] }[];
}

export function MedicationCodeSelector({
  codes,
  value,
  onChange,
  allowClear = false,
  maxHeight = 288,
  showGroups = false,
  groupedCodes,
}: Props) {
  // hoveredCode drives the tooltip — row-level hover per AC7
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Hide tooltip when the list is scrolled
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setHoveredCode(null);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  function handleRowEnter(e: React.MouseEvent<HTMLButtonElement>, code: string) {
    setHoveredCode(code);
    // Position tooltip below the hovered row, relative to the outer wrapper
    const containerRect = containerRef.current?.getBoundingClientRect();
    const rowRect = e.currentTarget.getBoundingClientRect();
    if (containerRect) {
      // Place tooltip below the row within the outer wrapper coordinate space
      const top = rowRect.bottom - containerRect.top + 4;
      // Align to the left edge of the list, with a small inset
      setTooltipStyle({ top, left: 8, right: 8 });
    }
  }

  function handleRowLeave() {
    setHoveredCode(null);
  }

  const tooltipCode = hoveredCode ? MED_CODE_MAP[hoveredCode] : null;

  function renderRow(c: MedCode) {
    const isSelected = value === c.code;
    const isHovered  = hoveredCode === c.code;
    const badgeStyle = TYPE_BADGE_STYLE[c.codeType];

    let bg = "transparent";
    if (isSelected) bg = "#f0f9f4";
    else if (isHovered) bg = "var(--slds-g-color-background-alt)";

    return (
      <button
        key={c.code}
        type="button"
        role="option"
        aria-selected={isSelected}
        aria-describedby={isHovered ? "medcode-tooltip" : undefined}
        onClick={() => onChange(isSelected ? null : c)}
        onMouseEnter={e => handleRowEnter(e, c.code)}
        onMouseLeave={handleRowLeave}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
        style={{
          backgroundColor: bg,
          borderLeft: isSelected ? "3px solid #145F33" : "3px solid transparent",
          outline: "none",
        }}
      >
        {/* Code badge */}
        <span
          className="flex-shrink-0 inline-flex items-center justify-center rounded px-1.5 slds-text-3 font-mono font-semibold"
          style={{
            backgroundColor: badgeStyle.bg,
            color: badgeStyle.color,
            minWidth: "38px",
            height: "20px",
          }}
        >
          {c.code}
        </span>

        {/* Label */}
        <span
          className="flex-1 slds-text-4"
          style={{ color: "var(--slds-g-color-text-default)" }}
        >
          {c.fullLabel}
        </span>

        {/* Checkmark if selected */}
        {isSelected && (
          <Check className="flex-shrink-0 h-3.5 w-3.5" style={{ color: "#145F33" }} />
        )}
      </button>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Scrollable code list */}
      <div
        ref={containerRef}
        role="listbox"
        tabIndex={0}
        className="overflow-y-auto rounded"
        style={{
          maxHeight,
          border: "1px solid var(--slds-g-color-border-base-1)",
          backgroundColor: "var(--slds-g-color-background-base)",
        }}
      >
        {/* Clear / no-code option */}
        {allowClear && (
          <button
            type="button"
            role="option"
            aria-selected={value === ""}
            onClick={() => onChange(null)}
            onMouseEnter={e => {
              if (value !== "") (e.currentTarget as HTMLElement).style.backgroundColor = "var(--slds-g-color-background-alt)";
            }}
            onMouseLeave={e => {
              if (value !== "") (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
            style={{
              backgroundColor: value === "" ? "#f0f9f4" : "transparent",
              borderLeft: value === "" ? "3px solid #145F33" : "3px solid transparent",
              borderBottom: "1px solid var(--slds-g-color-border-base-1)",
              outline: "none",
            }}
          >
            <span className="slds-text-4 italic" style={{ color: "var(--slds-g-color-text-weak)" }}>— No Code —</span>
            {value === "" && <Check className="ml-auto h-3.5 w-3.5" style={{ color: "#145F33" }} />}
          </button>
        )}

        {/* Grouped or flat code list */}
        {showGroups && groupedCodes ? (
          groupedCodes.map(group => (
            <div key={group.groupLabel}>
              <div
                className="px-3 py-1 slds-text-3 font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: "var(--slds-g-color-background-alt)",
                  color: "var(--slds-g-color-text-weak)",
                  borderBottom: "1px solid var(--slds-g-color-border-base-1)",
                  borderTop: "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                {group.groupLabel}
              </div>
              {group.codes.map(renderRow)}
            </div>
          ))
        ) : (
          codes.map(renderRow)
        )}
      </div>

      {/* Tooltip — shown on row hover, positioned below hovered row (AC7) */}
      {tooltipCode && (
        <div
          id="medcode-tooltip"
          role="tooltip"
          className="slds-text-3 rounded px-2.5 py-1.5"
          style={{
            position: "absolute",
            ...tooltipStyle,
            backgroundColor: "#145F33",
            color: "#ffffff",
            zIndex: 50,
            pointerEvents: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          }}
        >
          <span className="font-semibold">{tooltipCode.code}</span>: {tooltipCode.tooltip}
        </div>
      )}
    </div>
  );
}
