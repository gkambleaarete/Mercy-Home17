// Youth medication assignments (US 20100 / 20102, Chunk 1) — PROTOTYPE
// FIXTURES. The app has no canonical prescription / youth-medication
// record yet, so the Count and Log screens use these explicitly owned
// assignments. Each one is a youth's own medication record: a stable id,
// the owning Youth Constituent ID, the catalog medication it refers to and
// the dose period it is counted for. Two youths can share a catalog
// medication (Melatonin below) and one youth can hold two assignments of
// the same catalog medication — the assignment id keeps them apart.
//
// Replace with the real youth-medication source when it exists; nothing
// else should key counts by catalog id or by name.

export type DosePeriod =
  "Morning" | "Afternoon" | "Evening" | "Bedtime";
export type CountType = "Units" | "Volume";

export interface YouthMedicationAssignment {
  /** Stable youth medication record id. */
  id: string;
  /** Owning Youth Constituent ID (CONSTITUENTS), as a string. */
  youthId: string;
  /** Catalog (Medication Library) id — shared across youths. */
  catalogMedicationId: string;
  medicationName: string;
  dose: string;
  dosePeriod: DosePeriod;
  countType: CountType;
  /** Instructions / frequency shown as "Inst" in the Log. */
  instance: string;
}

export const YOUTH_MEDICATION_ASSIGNMENTS: YouthMedicationAssignment[] =
  [
    // Emily Johnson (Constituent 1) — mirrors the Count screen's reference rows.
    {
      id: "YM-1-001",
      youthId: "1",
      catalogMedicationId: "CAT-ADDERALL-XR-20",
      medicationName: "Adderall XR",
      dose: "20mg",
      dosePeriod: "Morning",
      countType: "Units",
      instance: "1x daily",
    },
    {
      id: "YM-1-002",
      youthId: "1",
      catalogMedicationId: "CAT-VITAMIN-D-1000",
      medicationName: "Vitamin D",
      dose: "1000 IU",
      dosePeriod: "Morning",
      countType: "Units",
      instance: "1x daily",
    },
    {
      id: "YM-1-003",
      youthId: "1",
      catalogMedicationId: "CAT-ZOLOFT-50",
      medicationName: "Zoloft",
      dose: "50mg",
      dosePeriod: "Afternoon",
      countType: "Units",
      instance: "1x daily",
    },
    {
      id: "YM-1-004",
      youthId: "1",
      catalogMedicationId: "CAT-MELATONIN-5",
      medicationName: "Melatonin",
      dose: "5mg",
      dosePeriod: "Bedtime",
      countType: "Units",
      instance: "1x daily",
    },
    // Same catalog medication, a second assignment for the same youth.
    {
      id: "YM-1-005",
      youthId: "1",
      catalogMedicationId: "CAT-MELATONIN-5",
      medicationName: "Melatonin",
      dose: "5mg",
      dosePeriod: "Evening",
      countType: "Units",
      instance: "as needed",
    },
    {
      id: "YM-1-006",
      youthId: "1",
      catalogMedicationId: "CAT-ALBUTEROL-90",
      medicationName: "Albuterol Inhaler",
      dose: "90mcg",
      dosePeriod: "Morning",
      countType: "Volume",
      instance: "as needed",
    },
    // Patricia Lee (Constituent 12) — shares the Melatonin catalog entry.
    {
      id: "YM-12-001",
      youthId: "12",
      catalogMedicationId: "CAT-LEXAPRO-10",
      medicationName: "Lexapro",
      dose: "10mg",
      dosePeriod: "Morning",
      countType: "Units",
      instance: "1x daily",
    },
    {
      id: "YM-12-002",
      youthId: "12",
      catalogMedicationId: "CAT-MELATONIN-5",
      medicationName: "Melatonin",
      dose: "5mg",
      dosePeriod: "Bedtime",
      countType: "Units",
      instance: "1x daily",
    },
  ];

/** A youth's own medication assignments (never another youth's). */
export function getAssignmentsForYouth(
  youthId: string,
): YouthMedicationAssignment[] {
  return YOUTH_MEDICATION_ASSIGNMENTS.filter(
    (a) => a.youthId === youthId,
  );
}

export function getAssignmentById(
  id: string,
): YouthMedicationAssignment | undefined {
  return YOUTH_MEDICATION_ASSIGNMENTS.find((a) => a.id === id);
}