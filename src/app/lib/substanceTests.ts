// Substance Test definitions shared by the individual Substance Test editor
// (admissions/SubstanceUseTestingModals.tsx) and the Program Bulk Substance
// Test form (substance-tests/BulkSubstanceTestDialog.tsx). Extracted from
// the individual editor unchanged, so both forms offer the same Reasons,
// Types and Panels and apply the same Type → Panel rules.

/** Test Reason options, in display order. */
export const TEST_REASONS = [
  "Program Random Test",
  "Admissions Test",
  "Treatment Plan",
  "Suspicion of Use",
  "Self-Disclosure",
  "Disclosure From Other",
  "Other",
] as const;

/** The Reason that asks for free text; the text is stored as the Reason. */
export const OTHER_TEST_REASON = "Other";

/** Reasons for which "Results Indicate New Use" applies (same list and
 *  `includes` match as the individual editor's shouldShowNewUseField). */
export const NEW_USE_REASONS = [
  "Program Random Test",
  "Treatment Plan",
  "Suspicion of Use",
  "Self-Disclosure",
  "Disclosure From Other",
];

export function newUseApplies(reason: string): boolean {
  return NEW_USE_REASONS.some((r) => reason.includes(r));
}

/** "Results Indicate New Use" options, in display order. */
export const NEW_USE_OPTIONS = [
  "Pending",
  "No",
  "Yes",
] as const;

/** Per-substance Result options (the individual results grid's). */
export const SUBSTANCE_RESULT_OPTIONS = [
  "Positive",
  "Negative",
] as const;

/** The individual results grid's rules for one entered substance result
 *  (Level required for Positive; Units required once Level is entered). */
export function validateSubstanceResult(r: {
  result: string;
  level: string;
  units: string;
}): string | undefined {
  if (r.result === "Positive" && !r.level.trim())
    return "Level is required for positive results.";
  if (r.level.trim() && !r.units.trim())
    return "Units are required when level is specified.";
  return undefined;
}

/** Test Type options, in display order. */
export const TEST_TYPES = [
  "Instant Test",
  "Lab Test",
  "Rerun Test",
  "Refused Test",
  "Alcohol Instant",
] as const;

/** Types a Bulk test definition offers. Rerun Test (needs a per-youth
 *  Related Test) and Refused Test (needs a per-youth Refusal Detail) stay
 *  individual-only pending BA confirmation (20066). */
export const BULK_TEST_TYPES = [
  "Instant Test",
  "Lab Test",
  "Alcohol Instant",
] as const;

/** Types for which a Test Panel is required. */
export const TYPES_REQUIRING_PANEL = [
  "Instant Test",
  "Refused Test",
  "Rerun Test",
  "Alcohol Instant",
];

/** Test Panel configurations with auto-populated substances. */
export const TEST_PANELS: Record<
  string,
  { substances: string[]; displayName: string }
> = {
  "iCup Instant 10-Panel": {
    displayName: "iCup Instant 10-Panel",
    substances: [
      "Amphetamines",
      "Benzodiazepines",
      "Cocaine",
      "Opiates",
      "THC/Cannabinoids",
      "Phencyclidine (PCP)",
      "Oxycodone/Oxymorphane",
      "Methamphetamine",
      "MDMA",
      "Barbiturates",
    ],
  },
  "iCup Instant 12-Panel": {
    displayName: "iCup Instant 12-Panel",
    substances: [
      "Amphetamines",
      "Benzodiazepines",
      "Cocaine",
      "Opiates",
      "THC/Cannabinoids",
      "Phencyclidine (PCP)",
      "Oxycodone/Oxymorphane",
      "Methamphetamine",
      "MDMA",
      "Barbiturates",
      "Methadone",
      "Buprenorphine",
    ],
  },
  "iCup Instant 13-Panel": {
    displayName: "iCup Instant 13-Panel",
    substances: [
      "Amphetamines",
      "Benzodiazepines",
      "Cocaine",
      "Opiates",
      "THC/Cannabinoids",
      "Phencyclidine (PCP)",
      "Oxycodone/Oxymorphane",
      "Methamphetamine",
      "MDMA",
      "Barbiturates",
      "Methadone",
      "Buprenorphine",
      "Fentanyl",
    ],
  },
  Breathalyzer: {
    displayName: "Breathalyzer",
    substances: ["Alcohol (Instant)"],
  },
};

/** Test Panel options for a Test Type. Rerun Test offers the panels already
 *  used by the other tests in the same test set (`priorPanels`). */
export function panelsForTestType(
  testType: string | undefined,
  priorPanels: string[] = [],
): string[] {
  if (
    testType === "Instant Test" ||
    testType === "Refused Test"
  ) {
    return [
      "iCup Instant 10-Panel",
      "iCup Instant 12-Panel",
      "iCup Instant 13-Panel",
      "Breathalyzer",
    ];
  } else if (testType === "Lab Test") {
    return [];
  } else if (testType === "Rerun Test") {
    return [...new Set(priorPanels.filter(Boolean))];
  } else if (testType === "Alcohol Instant") {
    return ["Breathalyzer"];
  }
  return [];
}

/** The Test Panel field is unavailable until a Type is chosen, and for Lab
 *  Test (which has no panel). */
export function isTestPanelDisabled(
  testType: string | undefined,
): boolean {
  return !testType || testType === "Lab Test";
}