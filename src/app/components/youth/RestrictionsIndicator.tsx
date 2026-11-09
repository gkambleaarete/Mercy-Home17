/**
 * RestrictionsIndicator (US 20160)
 *
 * Header icon for the Constituent Youth profile, next to YouthAlertIcons.
 * A successfully loaded youth with no active restrictions renders nothing
 * (no icon, trigger or reserved space). A read failure or an undetermined
 * active status (no confirmed rule) still shows the icon, never as "empty".
 * The pop-up body is the saved TYPE labels, comma-separated, with no status
 * copy (the heading and the list only).
 * Data is passed in explicitly (one youth's saved Campus Restrictions from
 * campusRestrictionStore); there is no default or demo data. Details open on
 * hover, keyboard focus, or click/tap through the shared HoverCard.
 */

import { useEffect, useState } from "react";
import { Ban } from "@/app/lib/lucide-icons";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import type {
  CampusRestrictionRead,
  CampusRestrictionRecord,
} from "../../data/campusRestrictionStore";
import { summarizeRestrictions } from "../../lib/campusRestrictionActive";
import type { ActiveRule } from "../../lib/campusRestrictionActive";

const ACTIVE = { bg: "#fef2f2", hover: "#fee2e2", fg: "#c23934" };
const NEUTRAL = { bg: "#e8f0fd", hover: "#d0e2fb", fg: "#1e3a5f" };


/** TYPE labels as the Campus Restrictions table shows them, in saved order. */
const typeList = (records: CampusRestrictionRecord[]) =>
  records.map((r) => r.type).join(", ");

export function RestrictionsIndicator({
  read,
  today = new Date(),
  rule,
}: {
  read: CampusRestrictionRead;
  today?: Date;
  /** Test seam; production uses the rule in campusRestrictionActive.ts. */
  rule?: ActiveRule | null;
}) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);

  const summary =
    read.status === "ok"
      ? summarizeRestrictions(read.records, today, rule)
      : null;
  const hidden = summary?.kind === "none";
  // An open pop-up must not outlive the icon (or reappear open later).
  useEffect(() => {
    if (hidden) {
      setOpen(false);
      setHover(false);
    }
  }, [hidden]);
  if (hidden) return null;
  const isActive = summary?.kind === "active";
  const palette = isActive ? ACTIVE : NEUTRAL;
  const label =
    read.status === "error"
      ? "Restrictions unavailable"
      : isActive
        ? "Active Restrictions"
        : "Restrictions";

  return (
    <HoverCard open={open} onOpenChange={setOpen} openDelay={100}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          data-testid="restrictions-indicator"
          data-state-kind={summary?.kind ?? "error"}
          aria-label={label}
          onClick={() => setOpen((o) => !o)}
          onFocus={() => setOpen(true)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: hover ? palette.hover : palette.bg,
            color: palette.fg,
            cursor: "pointer",
            flexShrink: 0,
            transition: "background 0.15s",
            padding: 0,
          }}
        >
          <Ban size={20} />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-80"
        align="start"
        role="status"
        style={{ maxHeight: "360px", overflowY: "auto" }}
      >
        <p
          style={{
            fontSize: "13px",
            fontWeight: 700,
            margin: "0 0 8px",
            color: "var(--slds-g-color-text-default)",
          }}
        >
          Restrictions
        </p>
        {read.status === "error" && (
          <p style={{ fontSize: "12px", margin: 0 }}>
            Restrictions could not be read.
          </p>
        )}
        {(summary?.kind === "active" ||
          summary?.kind === "undetermined") && (
          <p
            data-testid="restrictions-details"
            style={{
              fontSize: "12px",
              margin: 0,
              overflowWrap: "anywhere",
              color: "var(--slds-g-color-text-default)",
            }}
          >
            {typeList(
              summary.kind === "active"
                ? summary.active
                : read.status === "ok"
                  ? read.records
                  : [],
            )}
          </p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
