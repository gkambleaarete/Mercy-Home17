import { MED_CODES } from "../components/admissions/MedicationCodeSelector";
import type { AttestationStage } from "./expectedDoseSource";

// Explicit validation policy for US 20143. Everything here is injected into
// the evaluator, so tests can use their own policy and the live defaults stay
// visible. Nothing is invented: where the repository has no agreed rule the
// default says so (null / "unresolved") and the evaluator reports the dose
// as unresolved instead of declaring it valid or overdue.

/** What a medication code says about the dose.
 *  nonreceipt — the code's own canonical label/tooltip says no dose was given;
 *  receipt    — a dose was provided (adjusted / wrong-time / unapproved);
 *  packed     — packed medication: no compatibility rule is defined yet. */
export type CodeMeaning = "nonreceipt" | "receipt" | "packed";

/**
 * Canonical codes (MED_CODES — "single source of truth") and their meaning,
 * taken ONLY from each code's canonical label / tooltip. This table is
 * PROVISIONAL: the repository has no business-confirmed code-compatibility
 * document. A code missing from it is "unknown" and stays unresolved.
 */
export const CODE_MEANING: Record<string, CodeMeaning> = {
  // "No Dose …" labels and the two codes whose tooltip says the dose was not
  // offered / not given.
  PRN: "nonreceipt",
  MED: "nonreceipt",
  HOS: "nonreceipt",
  EMP: "nonreceipt",
  ABS: "nonreceipt",
  CON: "nonreceipt",
  REF: "nonreceipt",
  MDS: "nonreceipt",
  OTH: "nonreceipt",
  // Tooltips state a dose was provided (adjusted, wrong time, unapproved).
  DRA: "receipt",
  ADS: "receipt",
  UNS: "receipt",
  WTA: "receipt",
  WTU: "receipt",
  // Packed medication — needs its own rule (not defined).
  PAK: "packed",
  SCH: "packed",
  MPM: "packed",
};

/** Legacy / alternate spellings, mapped explicitly to a meaning. Only values
 *  the application is known to store: the Update Dispensation dropdown
 *  ("Given", "Refused", "Held", "Not Available"). "Held" and "Not Available"
 *  have no canonical code equivalent, so they stay unmapped (unresolved). */
export const LEGACY_CODE_MEANING: Record<string, CodeMeaning> = {
  Given: "receipt",
  Refused: "nonreceipt",
};

/** Canonical full labels ("PAK -- Packed - Pass/Outing") → code. */
const CODE_BY_LABEL: Record<string, string> = Object.fromEntries(
  MED_CODES.map((c) => [c.fullLabel, c.code]),
);

export interface DocumentationPolicy {
  /** Log types that document the outcome of a dose (evidence and, with an
   *  expected dose, the dose's documentation). Everything else — Count,
   *  Disposal, Inventory, Medical Orders Update, OTC, Lockbox, Pharmacy
   *  Transfer — is not a medication dose. */
  doseLogTypes: readonly string[];
  /** As-needed outcomes: checked for inconsistencies only, never expected. */
  prnLogTypes: readonly string[];
  /** Log types that document a dose ONLY when an expected dose explicitly
   *  links them (e.g. an OTC dose that was scheduled); on their own they are
   *  not doses. */
  linkedOnlyLogTypes: readonly string[];
  codeMeaning: Readonly<Record<string, CodeMeaning>>;
  legacyCodeMeaning: Readonly<Record<string, CodeMeaning>>;
  /** What an attestation with no recorded stage satisfies. The application
   *  stores ONE attestation per log without a stage, so the live default is
   *  null: the stage is unknown and the requirement stays unresolved. */
  unstagedAttestationCountsAs: AttestationStage | null;
  /** true: an attestation is due once now >= its deadline. */
  deadlineInclusive: boolean;
  /** Doses scheduled before this ISO instant are historical and skipped.
   *  null = no cutoff (no historical rule is defined in the repository). */
  earliestScheduledAt: string | null;
  /** Enabled inconsistency rules. Only the ticket's explicit contradiction
   *  exists; no other attestation/code pair is defined. */
  rules: { yesYesWithNonreceiptCode: boolean };
}

export const DEFAULT_DOCUMENTATION_POLICY: DocumentationPolicy = {
  doseLogTypes: [
    "Prescription Dispensation",
    "Missed Dose",
    "Refused Dose",
    "Missed Packed Med",
    "Packed School Medication",
    "Adjusted Dose",
  ],
  prnLogTypes: ["PRN Administration", "PRN Declined"],
  linkedOnlyLogTypes: ["OTC Dispensation"],
  codeMeaning: CODE_MEANING,
  legacyCodeMeaning: LEGACY_CODE_MEANING,
  unstagedAttestationCountsAs: null,
  deadlineInclusive: true,
  earliestScheduledAt: null,
  rules: { yesYesWithNonreceiptCode: true },
};

export type CodeResolution =
  | { kind: "none" }
  | { kind: "meaning"; meaning: CodeMeaning; code: string }
  | { kind: "unknown"; raw: string };

/** Resolves a recorded code through explicit mappings only: a canonical
 *  code, its canonical full label, or a listed legacy value. Anything else
 *  (package codes, free text) is unknown — never assumed valid. */
export function resolveCode(
  policy: DocumentationPolicy,
  raw: string,
): CodeResolution {
  const v = (raw ?? "").trim();
  if (!v) return { kind: "none" };
  const code = policy.codeMeaning[v] ? v : CODE_BY_LABEL[v];
  if (code && policy.codeMeaning[code])
    return { kind: "meaning", meaning: policy.codeMeaning[code], code };
  const legacy = policy.legacyCodeMeaning[v];
  if (legacy) return { kind: "meaning", meaning: legacy, code: v };
  return { kind: "unknown", raw: v };
}