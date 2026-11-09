/**
 * YouthAlertIcons
 *
 * Renders up to three independent alert icons in a youth profile header:
 *   🌸 Flower     – Active Restraints   (red)
 *   🩺 Stethoscope – Medical Needs       (dark navy)
 *   🍎 Apple       – Dietary Needs       (dark navy)
 *
 * Each icon is conditionally visible based solely on whether its respective
 * `data` array contains one or more records.  When an array is empty the icon
 * is completely absent — no placeholder, no empty space (AC2).
 *
 * ── Data contract (AC3 / AC4 / AC6 / AC8) ───────────────────────────────────
 * The caller is responsible for pre-filtering records before passing them here.
 * `data.restraints` must contain ONLY approved + active restraint records.
 * `data.medicalNeeds` must contain ONLY active physical need records.
 * `data.dietaryNeeds` must contain ONLY active dietary need records.
 * Passing an unapproved, expired, or inactive record will cause the
 * corresponding icon to appear incorrectly (AC4 violation).
 *
 * ── Real-time evaluation (AC13) ──────────────────────────────────────────────
 * The component is purely prop-driven: whenever the parent updates its state
 * and passes new `data`, React re-renders this component and the icons update
 * immediately without a page refresh.  The data-layer polling / subscription
 * approach must be confirmed with Feng before production implementation.
 *
 * ── Screens (AC12) ───────────────────────────────────────────────────────────
 *   - Admissions youth profile  (LeadDetailView.tsx)
 *   - Constituent profile        (YouthProfilePage.tsx)
 *   - Program Log single youth   (ProgramLog.tsx – header + observation dialog)
 *   - Single Youth Dispensation  (SingleYouthDispensation.tsx)
 */

import React, { useState } from "react";
import { Flower, Stethoscope, Apple } from "@/app/lib/lucide-icons";

// ── Types ─────────────────────────────────────────────────────────────────────

/** One approved + active Constituent Restraint record (BP: constituent_restraint tbl). */
interface RestraintRecord {
  id: string;
  /** RDTY:CODE (BP field reference) — displayed in bold in the popup. */
  rdtyCode: string;
  startDate: string;
  endDate: string;
  /** COMMENT */
  comment: string;
}

/** One active Medical / Physical Need details record. */
interface MedicalNeedRecord {
  id: string;
  /** ALLERGY TYPE (BP field reference) */
  allergyType: string;
  /** PHCMC:CODE (Name) (BP field reference) */
  phcmcCode: string;
  /** DETAILS */
  details: string;
}

/** One active Dietary Need details record. */
interface DietaryNeedRecord {
  id: string;
  /** constituent_physical_condition.dietary_type_code_id (NAME) (BP field reference) */
  dietaryTypeCodeName: string;
  /** ALLERGY INDICATOR (BP field reference): "YES" → "Food Allergy", "NO" → "Not a Food Allergy" (AC10) */
  allergyIndicator: "YES" | "NO";
  /** constituent_physical_condition.comment (BP field reference) */
  comment: string;
}

/** Pre-filtered alert data for one youth — all arrays contain ONLY active/approved records. */
export interface YouthAlertData {
  restraints: RestraintRecord[];
  medicalNeeds: MedicalNeedRecord[];
  dietaryNeeds: DietaryNeedRecord[];
}

type PopupType = "restraints" | "medical" | "dietary" | null;

// ── Mock datasets ─────────────────────────────────────────────────────────────
// Use these for prototyping / AC verification.
// In production, replace with real-time data fetched by youthId.

/** Full mock — all three icons visible (verifies AC1, AC3, AC5, AC6, AC7, AC8, AC9, AC10, AC11). */
export const MOCK_YOUTH_ALERT_DATA: YouthAlertData = {
  restraints: [
    {
      id: "r1",
      rdtyCode: "PHYS-R1",
      startDate: "01/15/2026",
      endDate: "07/15/2026",
      comment:
        "Approved per incident review board. Staff must document each use within 24 hours.",
    },
  ],
  medicalNeeds: [
    {
      id: "m1",
      allergyType: "Drug",
      phcmcCode: "Penicillin",
      details:
        "Severe reaction — anaphylaxis risk. EpiPen required on premises at all times.",
    },
    {
      id: "m2",
      allergyType: "Environmental",
      phcmcCode: "Pollen",
      details:
        "Seasonal allergy. Antihistamine prescribed; monitor during peak season.",
    },
  ],
  dietaryNeeds: [
    {
      id: "d1",
      dietaryTypeCodeName: "Nut-Free",
      allergyIndicator: "YES",
      comment:
        "Severe peanut allergy. No nut products in meal preparation or on shared surfaces.",
    },
    {
      id: "d2",
      dietaryTypeCodeName: "Gluten-Free",
      allergyIndicator: "NO",
      comment:
        "Gluten sensitivity — not a strict allergy. Monitor for discomfort.",
    },
  ],
};

/**
 * Empty mock — no icons rendered (verifies AC2 / AC4: unapproved, expired, or
 * nonexistent records have been filtered out before reaching this component).
 */
export const MOCK_YOUTH_ALERT_DATA_NONE: YouthAlertData = {
  restraints: [],
  medicalNeeds: [],
  dietaryNeeds: [],
};

/** Restraints-only mock — verifies AC3/AC4 in isolation (only Flower shows). */
export const MOCK_YOUTH_ALERT_RESTRAINTS_ONLY: YouthAlertData =
  {
    ...MOCK_YOUTH_ALERT_DATA_NONE,
    restraints: MOCK_YOUTH_ALERT_DATA.restraints,
  };

/** Medical-only mock — verifies AC6/AC7 in isolation (only Stethoscope shows). */
export const MOCK_YOUTH_ALERT_MEDICAL_ONLY: YouthAlertData = {
  ...MOCK_YOUTH_ALERT_DATA_NONE,
  medicalNeeds: MOCK_YOUTH_ALERT_DATA.medicalNeeds,
};

/** Dietary-only mock — verifies AC8/AC9/AC10 in isolation (only Apple shows). */
export const MOCK_YOUTH_ALERT_DIETARY_ONLY: YouthAlertData = {
  ...MOCK_YOUTH_ALERT_DATA_NONE,
  dietaryNeeds: MOCK_YOUTH_ALERT_DATA.dietaryNeeds,
};

// ── Popup ─────────────────────────────────────────────────────────────────────

const POPUP_META: Record<
  NonNullable<PopupType>,
  { label: string; iconColor: string; bgColor: string }
> = {
  restraints: {
    label: "Active Restraints",
    iconColor: "#c23934",
    bgColor: "#fef2f2",
  },
  medical: {
    label: "Medical Needs",
    iconColor: "#1e3a5f",
    bgColor: "#e8f0fd",
  },
  dietary: {
    label: "Dietary Needs",
    iconColor: "#1e3a5f",
    bgColor: "#e8f0fd",
  },
};

function AlertPopup({
  type,
  data,
  onClose,
}: {
  type: NonNullable<PopupType>;
  data: YouthAlertData;
  onClose: () => void;
}) {
  const meta = POPUP_META[type];

  const dividerStyle = (
    idx: number,
    total: number,
  ): React.CSSProperties =>
    idx < total - 1
      ? {
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
          paddingBottom: "14px",
          marginBottom: "14px",
        }
      : {};

  return (
    /* Backdrop — click to dismiss (AC11) */
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.32)",
      }}
      onClick={onClose}
    >
      {/* Card */}
      <div
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "10px",
          minWidth: "340px",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={meta.label}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 18px 13px",
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <div
            style={{
              height: "28px",
              width: "28px",
              borderRadius: "6px",
              backgroundColor: meta.bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {type === "restraints" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  fill="#c23934"
                  d="M14.846 1.227c.725-.133 3.168-.441 3.785.01.21.153.257.403.298.648.274 1.86-.25 4.965-1.358 6.502-.685.95-1.672 1.381-2.785 1.551a8 8 0 0 1-.641.069.5.5 0 0 0-.135.01l.206.015c.043.005.186.018.22.028l.008.021c.107.03.326.08.431.043h.001c.21.025.468.1.672.162.754.233 1.45.64 1.94 1.287.767 1.016 1.133 2.322 1.337 3.573.154.939.222 1.921.125 2.87-.087.882-.41.956-1.207 1.013-.558.052-1.241.014-1.796-.039-1.433-.138-3.126-.555-4.318-1.41a3.7 3.7 0 0 1-1.479-2.368 1.1 1.1 0 0 0-.027-.316l.002.015c-.022-.063-.019-.118-.055-.152a6 6 0 0 1-.062-.582c.002-.057-.004-.088-.013-.144-.005.059-.016.167-.015.222l.014-.07h.001l-.015.07c-.075 1.153-.412 2.284-1.283 3.065-1.498 1.344-4.481 1.849-6.404 1.711-.326-.023-.792-.037-1.022-.308-.163-.192-.235-.621-.232-.873.028-.199 0-.59-.002-.804-.001-.148.007-.464-.008-.597-.004-.214.066-.785.097-1.003.2-1.4.63-3.057 1.592-4.12.625-.693 1.581-1.061 2.466-1.214.189-.032.49-.08.68-.087l.001-.02c-.234.008-.752-.08-.985-.128-1.028-.214-1.96-.697-2.546-1.626a4 4 0 0 1-.256-.426c-.525-.98-.823-2.195-.967-3.298-.083-.64-.258-2.662.143-3.182.161-.21.454-.259.696-.291.583-.079 1.185-.058 1.77-.013 1.617.125 3.503.526 4.816 1.564.598.473.983 1.121 1.211 1.853.074.236.135.482.166.728.038.163.063.463.077.634 0 .031-.005.065.009.09.012-.037.01-.044.01-.084a1 1 0 0 1 .018-.2c0-.14.032-.294.055-.432.11-.659.323-1.298.696-1.85.845-1.248 2.68-1.864 4.068-2.117m-9.37 2.671c.432.257.761.53 1.032.975.059.097.13.236.162.346-.012.099.085.295.073.45-.005.068-.05.547-.05.55-.31.735-1.151.75-1.756.42-.083-.044-.164-.082-.237-.143-.018-.098-.106-.13-.19-.15-.065-.032-.225-.208-.276-.263a3 3 0 0 1-.332-.464l-.048.03q.03.253.063.507c-.037.158.064.536.073.71l.022.238.01-.024.024.083c.022.12.044.322.1.35.381 1.236 1.082 1.686 2.197 2.119.113-.287.28-.49.563-.613.264-.115.562-.118.828-.007a1.034 1.034 0 0 1 .558 1.33 1.06 1.06 0 0 1-.57.575 1.043 1.043 0 0 1-1.337-.524c-.874.335-1.661.782-2.062 1.7-.258.592-.341 1.252-.416 1.892-.023.2-.038.42-.066.616.309-.614.732-1.066 1.373-1.284 1.215-.412 1.955.663 1.353 1.766-.275.506-.606.807-1.094 1.08q.665-.07 1.324-.186c.866-.161 1.566-.352 2.16-1.096.332-.416.48-.807.68-1.293-.047-.022-.148-.064-.188-.098-.032-.072-.194-.237-.271-.25a.8.8 0 0 1-.115-.193c.012-.126-.052-.234-.062-.353-.01-.117.016-.23.003-.351a1.034 1.034 0 0 1 1.913-.206 1 1 0 0 1 .082.213c-.022.092.014.317-.004.428-.01.057-.059.202-.045.25a1.05 1.05 0 0 1-.586.56c.352.92.75 1.66 1.689 2.075.155.069.307.113.47.16l.224.06q.014.033.068.055a.8.8 0 0 0 .26.041c.04 0 .074-.003.093-.008q.676.116 1.357.193c-.237-.133-.696-.454-.832-.692l-.015-.072c-.067-.085-.152-.276-.243-.318l-.054-.103c-.416-.86-.003-1.823 1.012-1.744.519.041 1.026.341 1.364.745-.01.081.136.249.203.271.04.043.16.272.196.339-.032-.184-.048-.454-.072-.65-.076-.632-.153-1.272-.413-1.856-.404-.907-1.184-1.363-2.057-1.69-.026.052-.069.139-.108.178a.23.23 0 0 0-.16.171.96.96 0 0 1-.384.208 1.04 1.04 0 0 1-1.297-.743 1.03 1.03 0 0 1 .106-.762 1.03 1.03 0 0 1 .625-.478c.043.016.413-.009.454-.02l.119.025q.058.016.115.04c.292.126.456.328.573.62 2.2-.827 2.258-1.982 2.503-4.13-.165.283-.373.628-.641.821-.06-.003-.287.16-.312.232-.05.047-.2.112-.264.143-.543.265-1.357.196-1.623-.45.009-.079-.07-.243-.069-.335 0-.107 0-.219.009-.325.003-.044.016-.093.026-.142l.013-.072v-.067l.039-.115a1 1 0 0 1 .05-.109l.016-.003a.84.84 0 0 0 .221-.394c.187-.297.605-.623.904-.788q-.542.066-1.083.148c-.975.145-1.822.347-2.45 1.195-.01.014-.1.133-.107.14-.095.034-.296.403-.285.484-.009.027-.063.138-.077.168a5 5 0 0 0-.137.318c.25.105.438.275.553.529a1.03 1.03 0 0 1-.506 1.363 1.07 1.07 0 0 1-.823.022 1.03 1.03 0 0 1-.56-.541 1.04 1.04 0 0 1-.022-.779c.11-.29.31-.47.581-.595a7 7 0 0 0-.242-.53c.004-.019.009-.035 0-.052-.054-.11-.077-.236-.193-.29-.01-.01-.128-.187-.15-.216-.64-.835-1.37-1.034-2.327-1.192a38 38 0 0 0-1.224-.173m.39 6.107-.002.02c.038.003.083.007.117-.007l-.004-.01c-.043-.01-.068-.006-.11-.003"
                />
              </svg>
            )}
            {type === "medical" && (
              <Stethoscope size={16} color={meta.iconColor} />
            )}
            {type === "dietary" && (
              <Apple size={16} color={meta.iconColor} />
            )}
          </div>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--slds-g-color-text-default)",
              margin: 0,
            }}
          >
            {meta.label}
          </p>
        </div>

        {/* Body — AC5 / AC7 / AC9 / AC10 */}
        <div
          style={{
            padding: "16px 18px",
            maxHeight: "360px",
            overflowY: "auto",
          }}
        >
          {/* Restraints: RDTY:CODE (bold) → Start Date → End Date → COMMENT (AC5) */}
          {type === "restraints" &&
            data.restraints.map((r, i) => (
              <div
                key={r.id}
                style={dividerStyle(i, data.restraints.length)}
              >
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--slds-g-color-text-default)",
                    margin: "0 0 4px",
                  }}
                >
                  {r.rdtyCode}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--slds-g-color-text-weak)",
                    margin: "0 0 2px",
                  }}
                >
                  Start Date: {r.startDate}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--slds-g-color-text-weak)",
                    margin: "0 0 8px",
                  }}
                >
                  End Date: {r.endDate}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--slds-g-color-text-default)",
                    margin: 0,
                  }}
                >
                  {r.comment}
                </p>
              </div>
            ))}

          {/* Medical: ALLERGY TYPE - PHCMC:CODE (Name) (bold) → DETAILS (AC7) */}
          {type === "medical" &&
            data.medicalNeeds.map((m, i) => (
              <div
                key={m.id}
                style={dividerStyle(
                  i,
                  data.medicalNeeds.length,
                )}
              >
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--slds-g-color-text-default)",
                    margin: "0 0 6px",
                  }}
                >
                  {m.allergyType} — {m.phcmcCode}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--slds-g-color-text-default)",
                    margin: 0,
                  }}
                >
                  {m.details}
                </p>
              </div>
            ))}

          {/* Dietary: dietary_type_code_id (NAME) - ALLERGY INDICATOR (bold) → comment (AC9/AC10) */}
          {type === "dietary" &&
            data.dietaryNeeds.map((d, i) => (
              <div
                key={d.id}
                style={dividerStyle(
                  i,
                  data.dietaryNeeds.length,
                )}
              >
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--slds-g-color-text-default)",
                    margin: "0 0 6px",
                  }}
                >
                  {d.dietaryTypeCodeName} —{" "}
                  {d.allergyIndicator === "YES"
                    ? "Food Allergy"
                    : "Not a Food Allergy"}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--slds-g-color-text-default)",
                    margin: 0,
                  }}
                >
                  {d.comment}
                </p>
              </div>
            ))}
        </div>

        {/* Footer — OK closes without navigation (AC11) */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "12px 18px",
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              height: "32px",
              padding: "0 22px",
              borderRadius: "20px",
              border: "none",
              backgroundColor: "#145F33",
              color: "white",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (
                e.currentTarget as HTMLElement
              ).style.backgroundColor = "#0e4524";
            }}
            onMouseLeave={(e) => {
              (
                e.currentTarget as HTMLElement
              ).style.backgroundColor = "#145F33";
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * Renders the three alert icon buttons for a youth profile header.
 *
 * AC compliance summary:
 *   AC1  – up to 3 icons, each evaluated independently
 *   AC2  – returns null when all arrays empty; no placeholder rendered
 *   AC3  – Flower renders when restraints.length > 0
 *   AC4  – Flower absent when restraints array is empty (caller must pre-filter)
 *   AC5  – Restraints popup: RDTY:CODE bold, Start/End Date, COMMENT
 *   AC6  – Stethoscope renders when medicalNeeds.length > 0
 *   AC7  – Medical popup: ALLERGY TYPE — PHCMC:CODE bold, DETAILS
 *   AC8  – Apple renders when dietaryNeeds.length > 0
 *   AC9  – Dietary popup: dietaryTypeCodeName — indicator bold, comment
 *   AC10 – allergyIndicator YES→"Food Allergy", NO→"Not a Food Allergy"
 *   AC11 – OK + backdrop close popup; no navigation
 *   AC12 – used in all 4 required screens
 *   AC13 – prop-driven: parent state change triggers re-render without refresh;
 *           data-layer polling/subscription approach to be confirmed with Feng
 */
export function YouthAlertIcons({
  data = MOCK_YOUTH_ALERT_DATA,
}: {
  data?: YouthAlertData;
}) {
  const [openPopup, setOpenPopup] = useState<PopupType>(null);

  const hasRestraints = data.restraints.length > 0;
  const hasMedical = data.medicalNeeds.length > 0;
  const hasDietary = data.dietaryNeeds.length > 0;

  // AC2: return nothing when no qualifying records exist
  if (!hasRestraints && !hasMedical && !hasDietary) return null;

  const IconButton = ({
    type,
    label,
    Icon,
    color,
    bg,
    hoverBg,
  }: {
    type: NonNullable<PopupType>;
    label: string;
    Icon: React.ElementType;
    color: string;
    bg: string;
    hoverBg: string;
  }) => (
    <button
      onClick={() => setOpenPopup(type)}
      title={label}
      aria-label={label}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        border: "none",
        backgroundColor: bg,
        color,
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.15s",
        padding: 0,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor =
          hoverBg;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor =
          bg;
      }}
    >
      <Icon size={20} />
    </button>
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {/* AC3: Flower — red — Active Restraints */}
        {hasRestraints && (
          <button
            onClick={() => setOpenPopup("restraints")}
            title="Active Restraints"
            aria-label="Active Restraints"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#fef2f2",
              cursor: "pointer",
              flexShrink: 0,
              transition: "background 0.15s",
              padding: 0,
            }}
            onMouseEnter={(e) => {
              (
                e.currentTarget as HTMLElement
              ).style.backgroundColor = "#fee2e2";
            }}
            onMouseLeave={(e) => {
              (
                e.currentTarget as HTMLElement
              ).style.backgroundColor = "#fef2f2";
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                fill="#c23934"
                d="M14.846 1.227c.725-.133 3.168-.441 3.785.01.21.153.257.403.298.648.274 1.86-.25 4.965-1.358 6.502-.685.95-1.672 1.381-2.785 1.551a8 8 0 0 1-.641.069.5.5 0 0 0-.135.01l.206.015c.043.005.186.018.22.028l.008.021c.107.03.326.08.431.043h.001c.21.025.468.1.672.162.754.233 1.45.64 1.94 1.287.767 1.016 1.133 2.322 1.337 3.573.154.939.222 1.921.125 2.87-.087.882-.41.956-1.207 1.013-.558.052-1.241.014-1.796-.039-1.433-.138-3.126-.555-4.318-1.41a3.7 3.7 0 0 1-1.479-2.368 1.1 1.1 0 0 0-.027-.316l.002.015c-.022-.063-.019-.118-.055-.152a6 6 0 0 1-.062-.582c.002-.057-.004-.088-.013-.144-.005.059-.016.167-.015.222l.014-.07h.001l-.015.07c-.075 1.153-.412 2.284-1.283 3.065-1.498 1.344-4.481 1.849-6.404 1.711-.326-.023-.792-.037-1.022-.308-.163-.192-.235-.621-.232-.873.028-.199 0-.59-.002-.804-.001-.148.007-.464-.008-.597-.004-.214.066-.785.097-1.003.2-1.4.63-3.057 1.592-4.12.625-.693 1.581-1.061 2.466-1.214.189-.032.49-.08.68-.087l.001-.02c-.234.008-.752-.08-.985-.128-1.028-.214-1.96-.697-2.546-1.626a4 4 0 0 1-.256-.426c-.525-.98-.823-2.195-.967-3.298-.083-.64-.258-2.662.143-3.182.161-.21.454-.259.696-.291.583-.079 1.185-.058 1.77-.013 1.617.125 3.503.526 4.816 1.564.598.473.983 1.121 1.211 1.853.074.236.135.482.166.728.038.163.063.463.077.634 0 .031-.005.065.009.09.012-.037.01-.044.01-.084a1 1 0 0 1 .018-.2c0-.14.032-.294.055-.432.11-.659.323-1.298.696-1.85.845-1.248 2.68-1.864 4.068-2.117m-9.37 2.671c.432.257.761.53 1.032.975.059.097.13.236.162.346-.012.099.085.295.073.45-.005.068-.05.547-.05.55-.31.735-1.151.75-1.756.42-.083-.044-.164-.082-.237-.143-.018-.098-.106-.13-.19-.15-.065-.032-.225-.208-.276-.263a3 3 0 0 1-.332-.464l-.048.03q.03.253.063.507c-.037.158.064.536.073.71l.022.238.01-.024.024.083c.022.12.044.322.1.35.381 1.236 1.082 1.686 2.197 2.119.113-.287.28-.49.563-.613.264-.115.562-.118.828-.007a1.034 1.034 0 0 1 .558 1.33 1.06 1.06 0 0 1-.57.575 1.043 1.043 0 0 1-1.337-.524c-.874.335-1.661.782-2.062 1.7-.258.592-.341 1.252-.416 1.892-.023.2-.038.42-.066.616.309-.614.732-1.066 1.373-1.284 1.215-.412 1.955.663 1.353 1.766-.275.506-.606.807-1.094 1.08q.665-.07 1.324-.186c.866-.161 1.566-.352 2.16-1.096.332-.416.48-.807.68-1.293-.047-.022-.148-.064-.188-.098-.032-.072-.194-.237-.271-.25a.8.8 0 0 1-.115-.193c.012-.126-.052-.234-.062-.353-.01-.117.016-.23.003-.351a1.034 1.034 0 0 1 1.913-.206 1 1 0 0 1 .082.213c-.022.092.014.317-.004.428-.01.057-.059.202-.045.25a1.05 1.05 0 0 1-.586.56c.352.92.75 1.66 1.689 2.075.155.069.307.113.47.16l.224.06q.014.033.068.055a.8.8 0 0 0 .26.041c.04 0 .074-.003.093-.008q.676.116 1.357.193c-.237-.133-.696-.454-.832-.692l-.015-.072c-.067-.085-.152-.276-.243-.318l-.054-.103c-.416-.86-.003-1.823 1.012-1.744.519.041 1.026.341 1.364.745-.01.081.136.249.203.271.04.043.16.272.196.339-.032-.184-.048-.454-.072-.65-.076-.632-.153-1.272-.413-1.856-.404-.907-1.184-1.363-2.057-1.69-.026.052-.069.139-.108.178a.23.23 0 0 0-.16.171.96.96 0 0 1-.384.208 1.04 1.04 0 0 1-1.297-.743 1.03 1.03 0 0 1 .106-.762 1.03 1.03 0 0 1 .625-.478c.043.016.413-.009.454-.02l.119.025q.058.016.115.04c.292.126.456.328.573.62 2.2-.827 2.258-1.982 2.503-4.13-.165.283-.373.628-.641.821-.06-.003-.287.16-.312.232-.05.047-.2.112-.264.143-.543.265-1.357.196-1.623-.45.009-.079-.07-.243-.069-.335 0-.107 0-.219.009-.325.003-.044.016-.093.026-.142l.013-.072v-.067l.039-.115a1 1 0 0 1 .05-.109l.016-.003a.84.84 0 0 0 .221-.394c.187-.297.605-.623.904-.788q-.542.066-1.083.148c-.975.145-1.822.347-2.45 1.195-.01.014-.1.133-.107.14-.095.034-.296.403-.285.484-.009.027-.063.138-.077.168a5 5 0 0 0-.137.318c.25.105.438.275.553.529a1.03 1.03 0 0 1-.506 1.363 1.07 1.07 0 0 1-.823.022 1.03 1.03 0 0 1-.56-.541 1.04 1.04 0 0 1-.022-.779c.11-.29.31-.47.581-.595a7 7 0 0 0-.242-.53c.004-.019.009-.035 0-.052-.054-.11-.077-.236-.193-.29-.01-.01-.128-.187-.15-.216-.64-.835-1.37-1.034-2.327-1.192a38 38 0 0 0-1.224-.173m.39 6.107-.002.02c.038.003.083.007.117-.007l-.004-.01c-.043-.01-.068-.006-.11-.003"
              />
            </svg>
          </button>
        )}
        {/* AC6: Stethoscope — dark navy — Medical Needs */}
        {hasMedical && (
          <IconButton
            type="medical"
            label="Medical Needs"
            Icon={Stethoscope}
            color="#1e3a5f"
            bg="#e8f0fd"
            hoverBg="#d0e2fb"
          />
        )}
        {/* AC8: Apple — dark navy — Dietary Needs */}
        {hasDietary && (
          <IconButton
            type="dietary"
            label="Dietary Needs"
            Icon={Apple}
            color="#1e3a5f"
            bg="#e8f0fd"
            hoverBg="#d0e2fb"
          />
        )}
      </div>

      {/* AC5 / AC7 / AC9 / AC10 / AC11 */}
      {openPopup && (
        <AlertPopup
          type={openPopup}
          data={data}
          onClose={() => setOpenPopup(null)}
        />
      )}
    </>
  );
}