// The ONE evaluator behind Missing or Incomplete Medication Documentation
// (US 20143): later UI eligibility and any summary counts must use it. It is
// pure and deterministic — expected-dose evidence, documentation evidence, an
// explicit policy and an injected clock go in; dose rows with specific
// reasons come out. It stores nothing (no second issue database): a dose
// leaves the result only when it no longer meets any issue criterion.
//
// Identity: a dose is keyed "expected:<id>" when an expected-dose record
// exists, else "log:<logId>". Logs are linked ONLY through an expected dose's
// explicit canonical logIds, and only when the log's recorded Program and
// Youth match — never by medication name, catalog id or Youth name, and never
// by current enrollment. A dose with several failing rules is ONE row with
// several reasons.
//
// "Not an issue" and "could not be evaluated" are different: anything that
// cannot be decided (unavailable scheduling source, unknown deadline, unknown
// code, unrecorded attestation stage, redacted evidence, a link mismatch) is
// reported in `unresolved`, and `outcome` is "incomplete". Only an outcome of
// "evaluated" with no rows and no unresolved items is a clean result.

import type {
  AttestationStage,
  ExpectedDose,
  ExpectedDoseRead,
} from "./expectedDoseSource";
import { resolveCode, type DocumentationPolicy } from "./medDocumentationRules";

/** A recorded Yes / No attestation value, or why it is not one. */
export type Fact =
  | "yes"
  | "no"
  | "unrecorded" // nothing recorded (or not a Yes/No, e.g. a staff name)
  | "redacted" // exists but the viewer may not see it
  | "unavailable"; // the source could not be read

/** Normalizes a stored value: only an explicit Yes / No counts. A staff name
 *  is NOT a Yes attestation. */
export function factFromYesNo(raw: string | null | undefined): Fact {
  const v = (raw ?? "").trim().toLowerCase();
  return v === "yes" ? "yes" : v === "no" ? "no" : "unrecorded";
}

export interface AttestationEvidence {
  id: string;
  /** ISO instant. */
  at: string;
  /** null = the source does not record the stage. */
  stage: AttestationStage | null;
}

export type AttestationRead =
  | { status: "ok"; items: AttestationEvidence[] }
  | { status: "redacted" }
  | { status: "unavailable" };

/** What one canonical medication log documents, with saved corrections
 *  already applied (the log itself is never rewritten). */
export interface DoseLogEvidence {
  logId: string;
  /** The log's recorded Program (historical ownership). */
  programId: number;
  youthId: string;
  youthMedicationId: string | null;
  medicationName: string;
  dose: string;
  dosePeriod: string;
  logType: string;
  /** ISO date the log documents the dose for (optional display detail). */
  doseDate?: string;
  /** Recorded medication code, after corrections ("" = none). */
  code: string;
  staffDispensed: Fact;
  youthReceived: Fact;
  attestations: AttestationRead;
}

export type DoseIssueType =
  | "missing-attestation"
  | "youth-received-missing"
  | "yes-yes-nonreceipt-code";

export interface DoseIssue {
  type: DoseIssueType;
  /** For "missing-attestation". */
  stage?: AttestationStage;
  /** Log the reason comes from, when it comes from one. */
  logId?: string;
  reason: string;
}

export type UnresolvedKind =
  | "expected-dose-source-unavailable"
  | "invalid-now"
  | "deadline-unknown"
  | "attestation-redacted"
  | "attestation-unavailable"
  | "attestation-stage-unrecorded"
  | "code-unknown"
  | "code-rule-undefined"
  | "link-mismatch"
  | "evidence-unavailable";

export interface UnresolvedItem {
  /** null = applies to the whole evaluation. */
  doseKey: string | null;
  kind: UnresolvedKind;
  detail: string;
}

/** What one linked log documents (for display and investigation). */
export interface DoseLogSummary {
  logId: string;
  logType: string;
  doseDate: string | null;
  staffDispensed: Fact;
  youthReceived: Fact;
  code: string;
}

export interface DoseIssueRow {
  doseKey: string;
  expectedDoseId: string | null;
  programId: number;
  youthId: string;
  youthMedicationId: string | null;
  medicationName: string;
  dose: string;
  dosePeriod: string;
  scheduledFor: string | null;
  logIds: string[];
  /** The linked logs' own values (empty when the dose has no log). */
  logs: DoseLogSummary[];
  /** The expected dose's required attestations (empty for log-only rows). */
  requirements: { stage: AttestationStage; dueAt: string | null }[];
  /** Every reason this dose is flagged (never empty). */
  issues: DoseIssue[];
}

export interface DocumentationEvaluation {
  /** "incomplete" whenever anything could not be evaluated. */
  outcome: "evaluated" | "incomplete";
  expectedDoseSource:
    | { status: "ok" }
    | { status: "unavailable"; reason: string };
  rows: DoseIssueRow[];
  unresolved: UnresolvedItem[];
  /** Doses (expected or log-only) that were evaluated. */
  evaluatedDoseCount: number;
}

export interface EvaluationInput {
  expected: ExpectedDoseRead;
  /** Documentation evidence of the caller's authorized logs. */
  logs: DoseLogEvidence[];
  policy: DocumentationPolicy;
  /** Injected clock (ISO instant) — the evaluator never reads the time. */
  now: string;
  /** Accessible Programs; an empty list means NO Programs, never all. */
  scope: "all" | number[];
}

const summarize = (l: DoseLogEvidence): DoseLogSummary => ({
  logId: l.logId,
  logType: l.logType,
  doseDate: l.doseDate ?? null,
  staffDispensed: l.staffDispensed,
  youthReceived: l.youthReceived,
  code: l.code,
});

const inScope = (scope: "all" | number[], programId: number) =>
  scope === "all" || scope.includes(programId);

const ms = (iso: string | null): number | null => {
  if (iso === null) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
};

export function evaluateDoseDocumentation(
  input: EvaluationInput,
): DocumentationEvaluation {
  const { expected, policy, scope } = input;
  const unresolved: UnresolvedItem[] = [];
  const unresolvedKeys = new Set<string>();
  const note = (
    doseKey: string | null,
    kind: UnresolvedKind,
    detail: string,
  ) => {
    const k = `${doseKey}|${kind}|${detail}`;
    if (unresolvedKeys.has(k)) return;
    unresolvedKeys.add(k);
    unresolved.push({ doseKey, kind, detail });
  };
  const source: DocumentationEvaluation["expectedDoseSource"] =
    expected.status === "ok"
      ? { status: "ok" }
      : { status: "unavailable", reason: expected.reason };
  if (expected.status !== "ok")
    note(null, "expected-dose-source-unavailable", expected.reason);

  const nowMs = ms(input.now);
  if (nowMs === null) {
    note(null, "invalid-now", "The evaluation time is not a valid instant.");
    return finish(source, [], unresolved, 0);
  }

  // Eligible evidence: dose-outcome logs of accessible Programs only.
  const eligibleTypes = new Set([
    ...policy.doseLogTypes,
    ...policy.prnLogTypes,
    ...policy.linkedOnlyLogTypes,
  ]);
  // Log types that stand as doses without an expected-dose record.
  const standaloneTypes = new Set([
    ...policy.doseLogTypes,
    ...policy.prnLogTypes,
  ]);
  const logsById = new Map<string, DoseLogEvidence>();
  for (const l of input.logs)
    if (eligibleTypes.has(l.logType) && inScope(scope, l.programId))
      logsById.set(l.logId, l);

  const rows = new Map<string, DoseIssueRow>();
  const claimed = new Set<string>();
  let evaluated = 0;

  const rowFor = (
    key: string,
    base: Omit<DoseIssueRow, "issues" | "doseKey">,
  ) => {
    let r = rows.get(key);
    if (!r) {
      r = { doseKey: key, ...base, issues: [] };
      rows.set(key, r);
    }
    return r;
  };
  const addIssue = (
    key: string,
    base: Omit<DoseIssueRow, "issues" | "doseKey">,
    issue: DoseIssue,
  ) => {
    const r = rowFor(key, base);
    const dupe = r.issues.some(
      (i) =>
        i.type === issue.type &&
        i.stage === issue.stage &&
        i.logId === issue.logId,
    );
    if (!dupe) r.issues.push(issue);
  };

  /** Stage of an attestation under the policy (null = cannot be decided). */
  const stageOf = (a: AttestationEvidence): AttestationStage | null =>
    a.stage ?? policy.unstagedAttestationCountsAs;

  /** Rule: Yes/Yes with a code that says the dose was not received. */
  const checkYesYes = (
    key: string,
    base: Omit<DoseIssueRow, "issues" | "doseKey">,
    l: DoseLogEvidence,
  ) => {
    if (
      !policy.rules.yesYesWithNonreceiptCode ||
      l.staffDispensed !== "yes" ||
      l.youthReceived !== "yes"
    )
      return;
    const c = resolveCode(policy, l.code);
    if (c.kind === "none") return;
    if (c.kind === "unknown")
      return note(
        key,
        "code-unknown",
        `Log ${l.logId}: code "${c.raw}" has no established meaning, so Yes/Yes could not be checked against it.`,
      );
    if (c.meaning === "nonreceipt")
      return addIssue(key, base, {
        type: "yes-yes-nonreceipt-code",
        logId: l.logId,
        reason: `Staff Dispensed and Youth Received are both Yes, but code ${c.code} means the dose was not received.`,
      });
    if (c.meaning === "packed")
      note(
        key,
        "code-rule-undefined",
        `Log ${l.logId}: packed code ${c.code} has no defined attestation rule.`,
      );
  };

  // ── Expected doses ───────────────────────────────────────────────────
  if (expected.status === "ok") {
    const doses = [...expected.doses].sort((a, b) =>
      a.id.localeCompare(b.id),
    );
    for (const d of doses) {
      for (const id of d.logIds) claimed.add(id);
      if (!inScope(scope, d.programId) || d.status === "canceled") continue;
      const sched = ms(d.scheduledFor);
      const cutoff = ms(policy.earliestScheduledAt);
      if (cutoff !== null && sched !== null && sched < cutoff) continue;
      evaluated++;
      const key = `expected:${d.id}`;

      // Explicit canonical links, validated against the dose's own identity.
      const linked: DoseLogEvidence[] = [];
      for (const id of d.logIds) {
        const l = logsById.get(id);
        if (!l) continue;
        if (l.programId !== d.programId || l.youthId !== d.youthId) {
          note(
            key,
            "link-mismatch",
            `Log ${id} is linked to this dose but belongs to a different Program or Youth, so it was not used.`,
          );
          continue;
        }
        linked.push(l);
      }
      const base: Omit<DoseIssueRow, "issues" | "doseKey"> = {
        expectedDoseId: d.id,
        programId: d.programId,
        youthId: d.youthId,
        youthMedicationId: d.youthMedicationId,
        medicationName: d.medicationName,
        dose: d.dose,
        dosePeriod: d.dosePeriod,
        scheduledFor: d.scheduledFor,
        logIds: linked.map((l) => l.logId),
        logs: linked.map(summarize),
        requirements: d.requirements.map((r) => ({ ...r })),
      };

      type Due = "due" | "not-due" | "unknown";
      const dueOf = (dueAt: string | null): Due => {
        const t = ms(dueAt);
        if (t === null) return "unknown";
        return (policy.deadlineInclusive ? nowMs >= t : nowMs > t)
          ? "due"
          : "not-due";
      };
      /** Whether a linked log carries an attestation of this stage. */
      const attested = (stage: AttestationStage) =>
        linked.some(
          (l) =>
            l.attestations.status === "ok" &&
            l.attestations.items.some((a) => stageOf(a) === stage),
        );
      /** Why the attestation evidence cannot decide the stage (if so). */
      const evidenceLimit = (): UnresolvedKind | null => {
        if (linked.some((l) => l.attestations.status === "redacted"))
          return "attestation-redacted";
        if (linked.some((l) => l.attestations.status === "unavailable"))
          return "attestation-unavailable";
        if (
          linked.some(
            (l) =>
              l.attestations.status === "ok" &&
              l.attestations.items.some((a) => stageOf(a) === null),
          )
        )
          return "attestation-stage-unrecorded";
        return null;
      };

      {
        // Every explicitly expected dose follows its own requirements, of
        // whatever kind: an as-needed ASSIGNMENT alone creates no expected
        // dose, but an expected occurrence that requires due documentation
        // is held to it.
        for (const req of d.requirements) {
          if (attested(req.stage)) continue;
          const due = dueOf(req.dueAt);
          if (due === "not-due") continue; // future: not due yet
          if (due === "unknown") {
            note(
              key,
              "deadline-unknown",
              `The ${req.stage} attestation deadline is not known, so it was not treated as overdue.`,
            );
            continue;
          }
          const limit = evidenceLimit();
          if (limit) {
            note(
              key,
              limit,
              `The ${req.stage} attestation is due but the recorded attestation evidence cannot confirm it (${limit}).`,
            );
            continue;
          }
          addIssue(key, base, {
            type: "missing-attestation",
            stage: req.stage,
            reason: `The ${req.stage} attestation was due ${req.dueAt} and has not been recorded.`,
          });
        }

        // Staff Dispensed = Yes, Youth Received missing, final attestation
        // expected (it is required here and due, or already recorded).
        const finalReq = d.requirements.find((r) => r.stage === "final");
        if (finalReq) {
          for (const l of linked) {
            if (l.staffDispensed !== "yes") continue;
            if (l.youthReceived === "redacted" || l.youthReceived === "unavailable") {
              note(key, "evidence-unavailable", `Log ${l.logId}: Youth Received is ${l.youthReceived}.`);
              continue;
            }
            if (l.youthReceived !== "unrecorded") continue;
            const due = dueOf(finalReq.dueAt);
            const expectedNow = attested("final") || due === "due";
            if (!expectedNow) {
              if (due === "unknown")
                note(key, "deadline-unknown", "The final attestation deadline is not known, so Youth Received was not required yet.");
              continue;
            }
            addIssue(key, base, {
              type: "youth-received-missing",
              logId: l.logId,
              reason:
                "Staff Dispensed is Yes but Youth Received is not recorded, and the final attestation is expected.",
            });
          }
        }
      }

      // Inconsistencies do not depend on timing: a future-dated dose with a
      // contradictory entry is still flagged.
      for (const l of linked) checkYesYes(key, base, l);
    }
  }

  // ── Documented doses with no expected-dose record ────────────────────
  // Only the timing-independent rule and the Youth-Received rule (when a
  // recorded final attestation shows it is expected) can apply: nothing
  // here says when anything was due.
  for (const l of [...logsById.values()].sort((a, b) =>
    a.logId.localeCompare(b.logId),
  )) {
    if (claimed.has(l.logId) || !standaloneTypes.has(l.logType)) continue;
    evaluated++;
    const key = `log:${l.logId}`;
    const base: Omit<DoseIssueRow, "issues" | "doseKey"> = {
      expectedDoseId: null,
      programId: l.programId,
      youthId: l.youthId,
      youthMedicationId: l.youthMedicationId,
      medicationName: l.medicationName,
      dose: l.dose,
      dosePeriod: l.dosePeriod,
      scheduledFor: null,
      logIds: [l.logId],
      logs: [summarize(l)],
      requirements: [],
    };
    checkYesYes(key, base, l);
    if (l.staffDispensed === "yes" && l.youthReceived === "unrecorded") {
      if (l.attestations.status === "ok") {
        const items = l.attestations.items;
        if (items.some((a) => stageOf(a) === "final"))
          addIssue(key, base, {
            type: "youth-received-missing",
            logId: l.logId,
            reason:
              "Staff Dispensed is Yes but Youth Received is not recorded, and a final attestation has been recorded.",
          });
        else if (items.some((a) => stageOf(a) === null))
          note(key, "attestation-stage-unrecorded", `Log ${l.logId}: the attestation stage is not recorded, so it cannot be confirmed whether the final attestation was expected.`);
      } else
        note(key, `attestation-${l.attestations.status}` as UnresolvedKind, `Log ${l.logId}: the attestation evidence is ${l.attestations.status}.`);
    }
  }

  return finish(source, [...rows.values()], unresolved, evaluated);
}

function finish(
  source: DocumentationEvaluation["expectedDoseSource"],
  rows: DoseIssueRow[],
  unresolved: UnresolvedItem[],
  evaluatedDoseCount: number,
): DocumentationEvaluation {
  rows.sort(
    (a, b) =>
      (a.scheduledFor ?? "").localeCompare(b.scheduledFor ?? "") ||
      a.programId - b.programId ||
      a.doseKey.localeCompare(b.doseKey),
  );
  return {
    outcome:
      source.status === "ok" && unresolved.length === 0
        ? "evaluated"
        : "incomplete",
    expectedDoseSource: source,
    rows,
    unresolved,
    evaluatedDoseCount,
  };
}

export type { ExpectedDose };