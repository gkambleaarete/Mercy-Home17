// Expected-dose evidence for US 20143 (Missing or Incomplete Medication
// Documentation).
//
// FINDING: the app has NO authoritative source of expected doses. There is
// no scheduling / occurrence record anywhere: youthMedicationAssignments.ts
// are explicit prototype fixtures that carry only a dose-period LABEL
// (Morning / Afternoon / Evening / Bedtime) and a free-text "instance" —
// no Program, no start / end dates, no clock times, no attestation
// deadlines — and the medication logs only describe doses that were
// documented. A dose that should exist but has no log therefore cannot be
// found from existing data, and schedules must never be manufactured from
// medication names, count assignments or assumed period times.
//
// This is the typed seam where a real scheduler plugs in. Until one is
// registered, the live read is explicitly UNAVAILABLE — never an empty
// "nothing is due".

/** Attestation stages a dose can require. */
export type AttestationStage = "preparation" | "final";

export interface ExpectedDoseRequirement {
  stage: AttestationStage;
  /** ISO instant by which this attestation is due; null = timing unknown
   *  (never treated as overdue). */
  dueAt: string | null;
}

export interface ExpectedDose {
  /** Stable expected-dose / occurrence id. */
  id: string;
  /** Owning Program, as recorded for the dose (not the current enrollment). */
  programId: number;
  youthId: string;
  /** Youth-medication assignment id (never the catalog id or a name). */
  youthMedicationId: string;
  medicationName: string;
  dose: string;
  dosePeriod: string;
  /** ISO instant the dose is scheduled for; null = unknown. */
  scheduledFor: string | null;
  /** "prn": an as-needed medication — never an overdue scheduled dose. */
  kind: "scheduled" | "prn";
  status: "active" | "canceled";
  /** Attestations this dose requires, with their own deadlines. */
  requirements: ExpectedDoseRequirement[];
  /** Explicit canonical links to the medication logs documenting the dose. */
  logIds: string[];
}

export type ExpectedDoseRead =
  | { status: "ok"; doses: ExpectedDose[] }
  | { status: "unavailable"; reason: string };

export const EXPECTED_DOSES_UNAVAILABLE: ExpectedDoseRead = {
  status: "unavailable",
  reason:
    "No expected-dose (scheduling) source exists in the application, so doses with no documentation cannot be detected.",
};

let source: (() => ExpectedDoseRead) | null = null;

/** Registers the real scheduling source (null restores "unavailable"). */
export function setExpectedDoseSource(
  next: (() => ExpectedDoseRead) | null,
): void {
  source = next;
}

/** The live expected doses — unavailable until a source is registered. */
export function getExpectedDoses(): ExpectedDoseRead {
  return source ? source() : EXPECTED_DOSES_UNAVAILABLE;
}