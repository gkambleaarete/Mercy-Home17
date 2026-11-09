// C-SSRS Full-Lifetime requirement VISIBILITY (US 20139, Chunk 5A).
//
// Explicit rule for this increment: a saved Risk Factor of "Suicidal
// Ideation" OR "Self-Harm" (exact match; "Self Harm" is accepted as an exact
// legacy alias) indicates that a C-SSRS Full-Lifetime is required. Nothing
// is matched by substring or read from narrative text.
//
// Deliberately NOT here (unresolved policy — see guidelines/cssrs-foundation.md):
// past-year suicidal thoughts/attempts, which action is blocked, which saved
// assessment satisfies the requirement, and reassessment. This module never
// reports a requirement as "satisfied", never changes a status and never
// calculates risk.

import {
  riskFactorsForAdmissionsRecord,
  type RiskFactorRead,
  type RiskFactorRecord,
  type RiskFactorUnreadableReason,
} from "../data/riskFactorStore";

export const FULL_LIFETIME_TRIGGER_FACTORS = [
  "Suicidal Ideation",
  "Self-Harm",
] as const;
/** Exact legacy spellings treated as an existing trigger factor. */
const TRIGGER_ALIASES: Record<string, string> = {
  "Self Harm": "Self-Harm",
};

/** The trigger factor a Risk Factor type stands for, or null. Exact match. */
export function fullLifetimeTriggerFactor(
  riskFactor: string,
): string | null {
  const canonical = TRIGGER_ALIASES[riskFactor] ?? riskFactor;
  return (
    FULL_LIFETIME_TRIGGER_FACTORS as readonly string[]
  ).includes(canonical)
    ? canonical
    : null;
}

export type FullLifetimeRequirement =
  /** At least one saved Risk Factor of this Admissions record matches. */
  | { status: "required"; factors: RiskFactorRecord[] }
  /** Risk Factor data was read and none matches. */
  | { status: "none" }
  /** The data could not be read, or no Admissions record is identified.
   *  This is NOT evidence that an assessment is unnecessary. */
  | {
      status: "unavailable";
      reason: RiskFactorUnreadableReason | "no-record";
    };

export function deriveFullLifetimeRequirement(
  read: RiskFactorRead,
  admissionsRecordId: string | null,
): FullLifetimeRequirement {
  if (admissionsRecordId === null)
    return { status: "unavailable", reason: "no-record" };
  if (read.status === "error")
    return { status: "unavailable", reason: read.reason };
  const factors = riskFactorsForAdmissionsRecord(
    read,
    admissionsRecordId,
  ).filter(
    (r) => fullLifetimeTriggerFactor(r.riskFactor) !== null,
  );
  return factors.length > 0
    ? { status: "required", factors }
    : { status: "none" };
}

/** Distinct trigger factor names, e.g. "Suicidal Ideation, Self-Harm". */
export const requirementFactorNames = (
  factors: RiskFactorRecord[],
): string[] => [
  ...new Set(
    factors.map((f) =>
      fullLifetimeTriggerFactor(f.riskFactor)!,
    ),
  ),
];