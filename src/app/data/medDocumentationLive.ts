// Live wiring for the US 20143 evaluator: builds the documentation evidence
// from the canonical medication logs, their attestation records and saved
// corrections (medicationLogStore / medReviewStore), and runs the shared
// evaluator (medDocumentationIssues.ts) with the live expected-dose source.
// Nothing is copied into another dataset.
//
// With no scheduling source registered (see expectedDoseSource.ts) the result
// is always "incomplete": only the rules that need no schedule can produce
// rows from live data.

import type { getMedicationLogSnapshot } from "./medicationLogStore";
import {
  effectiveDispensation,
  type MedReviewRead,
} from "./medReviewStore";
import {
  getExpectedDoses,
  type ExpectedDoseRead,
} from "./expectedDoseSource";
import {
  DEFAULT_DOCUMENTATION_POLICY,
  type DocumentationPolicy,
} from "./medDocumentationRules";
import {
  evaluateDoseDocumentation,
  factFromYesNo,
  type AttestationRead,
  type DocumentationEvaluation,
  type DoseLogEvidence,
} from "./medDocumentationIssues";

type LogSnapshot = ReturnType<typeof getMedicationLogSnapshot>;

/** Evidence for the active, in-scope dose logs. `attestations`: the viewer
 *  holds the viewAttestations capability; without it attestation records are
 *  "redacted" (never read as "missing"). Corrections are applied on top of
 *  the canonical log; Staff Dispensed has no canonical Yes/No, so it is only
 *  ever a Yes/No a correction states. */
export function buildDoseEvidence(
  s: LogSnapshot,
  read: MedReviewRead,
  scope: "all" | number[],
  opts: { attestations: boolean },
  policy: DocumentationPolicy = DEFAULT_DOCUMENTATION_POLICY,
): DoseLogEvidence[] {
  const types = new Set([
    ...policy.doseLogTypes,
    ...policy.prnLogTypes,
    ...policy.linkedOnlyLogTypes,
  ]);
  const out: DoseLogEvidence[] = [];
  for (const l of s.logs) {
    if (l.deletedAt || !types.has(l.logType)) continue;
    if (scope !== "all" && !scope.includes(l.programId)) continue;
    // Corrections (the only source of Staff Dispensed Yes/No, and able to
    // change Youth Received and the code) that cannot be read leave those
    // values unavailable; attestations come from the log store and are
    // unaffected — a correction never creates attestation evidence.
    const eff =
      read.status === "ok"
        ? effectiveDispensation(
            l,
            read.data.corrections.filter((c) => c.logId === l.id),
          )
        : null;
    let attestations: AttestationRead;
    if (!opts.attestations) attestations = { status: "redacted" };
    else if (!l.attestationId) attestations = { status: "ok", items: [] };
    else {
      const a = s.attestations.find((x) => x.id === l.attestationId);
      // The log names an attestation record that is not there.
      attestations = a
        ? {
            status: "ok",
            // The source records one attestation per log with NO stage.
            items: [{ id: a.id, at: a.attestedAt, stage: null }],
          }
        : { status: "unavailable" };
    }
    out.push({
      logId: l.id,
      programId: l.programId,
      youthId: l.youthId,
      youthMedicationId: l.youthMedicationId,
      medicationName: l.medicationName,
      dose: l.dose,
      dosePeriod: l.dosePeriod,
      logType: l.logType,
      doseDate: l.doseDate,
      code: eff ? eff.primaryCode : "",
      staffDispensed: eff ? factFromYesNo(eff.staffDispensed) : "unavailable",
      youthReceived: eff ? factFromYesNo(eff.youthReceived) : "unavailable",
      attestations,
    });
  }
  return out;
}

/** Runs the shared evaluator on live data. An unreadable review store (which
 *  holds the corrections) makes the result incomplete — never clean — while
 *  the issues that do not depend on corrections are kept. */
export function evaluateMedicationDocumentation(input: {
  snapshot: LogSnapshot;
  reviews: MedReviewRead;
  scope: "all" | number[];
  attestationsVisible: boolean;
  /** Injected clock (ISO instant). */
  now: string;
  policy?: DocumentationPolicy;
  /** Defaults to the live expected-dose source (unavailable today). */
  expected?: ExpectedDoseRead;
}): DocumentationEvaluation {
  const policy = input.policy ?? DEFAULT_DOCUMENTATION_POLICY;
  const expected = input.expected ?? getExpectedDoses();
  const result = evaluateDoseDocumentation({
    expected,
    logs: buildDoseEvidence(
      input.snapshot,
      input.reviews,
      input.scope,
      { attestations: input.attestationsVisible },
      policy,
    ),
    policy,
    now: input.now,
    scope: input.scope,
  });
  // Unreadable corrections: keep every known issue (missing attestations do
  // not depend on them) and report the checks that could not run.
  if (input.reviews.status === "ok") return result;
  return {
    ...result,
    outcome: "incomplete",
    unresolved: [
      {
        doseKey: null,
        kind: "evidence-unavailable",
        detail:
          "Saved corrections could not be read, so Staff Dispensed, Youth Received and code checks could not run.",
      },
      ...result.unresolved,
    ],
  };
}