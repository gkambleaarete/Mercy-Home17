// Active Campus Restriction selection (US 20160).
//
// NO AUTHORITATIVE ACTIVE-RESTRICTION RULE EXISTS YET. Saved restrictions
// carry startDate, an optional endDate and endedBy, but nothing in the
// project or the ticket says how those decide "active" (date boundaries,
// time zone, whether endedBy or a future end date matters). It is therefore
// not guessed here: `ACTIVE_RULE` stays null until the business confirms it,
// and callers treat every record as undetermined. A confirmed rule goes in
// ACTIVE_RULE only; nothing else needs to change.

import type { CampusRestrictionRecord } from "../data/campusRestrictionStore";

export type ActiveRule = (
  record: CampusRestrictionRecord,
  today: Date,
) => boolean;

export const ACTIVE_RULE: ActiveRule | null = null;

export type RestrictionSummary =
  | { kind: "none" }
  | { kind: "active"; active: CampusRestrictionRecord[] }
  | { kind: "undetermined"; saved: number };

/** Splits one youth's saved records using the given rule (default: ACTIVE_RULE). */
export function summarizeRestrictions(
  records: CampusRestrictionRecord[],
  today: Date,
  rule: ActiveRule | null = ACTIVE_RULE,
): RestrictionSummary {
  if (records.length === 0) return { kind: "none" };
  if (!rule) return { kind: "undetermined", saved: records.length };
  const active = records.filter((r) => rule(r, today));
  return active.length > 0
    ? { kind: "active", active }
    : { kind: "none" };
}
