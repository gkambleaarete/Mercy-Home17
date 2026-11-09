import {
  TEST_PANELS,
  validateSubstanceResult,
} from "../../lib/substanceTests";
import type { BulkTestRow } from "./BulkTestDefinitionDialog";

// Bulk Substance Test Youth(s) — LOCAL form model and rules (20066).
// Results are per youth, per Test(s) row, per substance — the same shape as
// an individual test's testDetails[].testResults — and start blank: nothing
// is pre-filled, so no result exists that a user did not enter.

export type SubstanceResultValue = "" | "Positive" | "Negative";

export interface BulkSubstanceResult {
  result: SubstanceResultValue;
  level: string;
  units: string;
}

/** Test(s) row id → substance → result. Missing = not entered. */
export type BulkYouthResults = Record<
  number,
  Record<string, BulkSubstanceResult>
>;

export type NewUseValue = "Pending" | "No" | "Yes";

export interface BulkYouthRow {
  /** Also the row's stable identifier: one row per youth. */
  constituentId: number;
  name: string;
  newUse: NewUseValue;
  results: BulkYouthResults;
}

export const EMPTY_RESULT: BulkSubstanceResult = {
  result: "",
  level: "",
  units: "",
};

/** Substances a Test(s) row tests for: its panel's substances. Lab Test has
 *  no panel, so no predefined substances. */
export function substancesForTest(test: BulkTestRow): string[] {
  return TEST_PANELS[test.testPanel]?.substances ?? [];
}

export function getResult(
  results: BulkYouthResults,
  testId: number,
  substance: string,
): BulkSubstanceResult {
  return results[testId]?.[substance] ?? EMPTY_RESULT;
}

/** Entered (non-blank) results for the CURRENT Test(s) rows only. */
export function enteredResultCount(
  results: BulkYouthResults,
  tests: BulkTestRow[],
): number {
  return tests.reduce(
    (n, t) =>
      n +
      substancesForTest(t).filter(
        (s) => getResult(results, t.id, s).result !== "",
      ).length,
    0,
  );
}

/** One summary line per Test(s) row that has substances, e.g.
 *  "iCup Instant 12-Panel: 1 Positive (THC/Cannabinoids), 10 Negative,
 *  1 not entered". Empty when no row has substances. */
export function summarizeResults(
  results: BulkYouthResults,
  tests: BulkTestRow[],
): string[] {
  return tests.flatMap((t) => {
    const subs = substancesForTest(t);
    if (subs.length === 0) return [];
    const positive = subs.filter(
      (s) => getResult(results, t.id, s).result === "Positive",
    );
    const negative = subs.filter(
      (s) => getResult(results, t.id, s).result === "Negative",
    ).length;
    const blank = subs.length - positive.length - negative;
    const label = t.testPanel || t.testType;
    if (blank === subs.length) return [`${label}: Not entered`];
    const parts = [
      positive.length
        ? `${positive.length} Positive (${positive.join(", ")})`
        : "",
      negative ? `${negative} Negative` : "",
      blank ? `${blank} not entered` : "",
    ].filter(Boolean);
    return [`${label}: ${parts.join(", ")}`];
  });
}

/** The individual results grid's rules for one substance result — the
 *  shared rule the store also enforces. */
export function validateResult(
  r: BulkSubstanceResult,
): string | undefined {
  return validateSubstanceResult(r);
}

/** Drops one Test(s) row's results for every youth (used when that row's
 *  Type or Panel changes, since its substances change). */
export function clearTestResults(
  youths: BulkYouthRow[],
  testId: number,
): BulkYouthRow[] {
  return youths.map((y) => {
    if (!(testId in y.results)) return y;
    const { [testId]: _dropped, ...rest } = y.results;
    return { ...y, results: rest };
  });
}