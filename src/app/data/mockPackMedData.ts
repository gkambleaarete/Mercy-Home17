import { useSyncExternalStore } from "react";
import {
  loadRecordList,
  saveRecordList,
} from "./persistedRecordList";

// Canonical Pack Med store (20042) — the ONE source of Pack Med records, so
// a Pass ↔ Pack Med link can be kept consistent on both sides. Same
// lightweight reactive module-store pattern as mockPassData.ts.
//
// Before this, Pack Meds had no persisted record at all: the Pack Meds
// dialog/page only toasted on "Complete Packing", and no pack carried a
// youth id. This adds the smallest record needed: who it is for, the
// packing period, what was packed, and the optional Pass link.

export interface PackMedication {
  name: string;
  dose: string;
  frequency: string;
  prescriber: string;
  quantity?: number;
}

export interface YouthMedications {
  /** Youth Constituent ID (CONSTITUENTS) — the Pass youthId, as a number. */
  id: number;
  name: string;
  initials: string;
  program: string;
  medications: PackMedication[];
}

// Youth medication list used by the Pack Meds workflow (moved verbatim from
// pages/PackMedsPage.tsx so the page and dialog share one copy).
export const YOUTH_MEDICATIONS: YouthMedications[] = [
  {
    id: 1,
    name: "Emily Johnson",
    initials: "EJ",
    program: "Mahoney House",
    medications: [
      {
        name: "Adderall XR",
        dose: "20mg",
        frequency: "Morning",
        prescriber: "Dr. Martinez",
        quantity: 7,
      },
      {
        name: "Melatonin",
        dose: "5mg",
        frequency: "Bedtime",
        prescriber: "Dr. Martinez",
        quantity: 7,
      },
      {
        name: "Vitamin D",
        dose: "1000 IU",
        frequency: "Morning",
        prescriber: "Dr. Chen",
        quantity: 7,
      },
    ],
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    initials: "MR",
    program: "Mahoney House",
    medications: [
      {
        name: "Zoloft",
        dose: "50mg",
        frequency: "Morning",
        prescriber: "Dr. Wilson",
        quantity: 7,
      },
      {
        name: "Clonidine",
        dose: "0.1mg",
        frequency: "Evening",
        prescriber: "Dr. Wilson",
        quantity: 7,
      },
    ],
  },
  {
    id: 8,
    name: "Robert Anderson",
    initials: "RA",
    program: "Mahoney House",
    medications: [
      {
        name: "Risperidone",
        dose: "2mg",
        frequency: "Morning",
        prescriber: "Dr. Martinez",
        quantity: 14,
      },
      {
        name: "Prozac",
        dose: "20mg",
        frequency: "Morning",
        prescriber: "Dr. Martinez",
        quantity: 7,
      },
      {
        name: "Trazodone",
        dose: "50mg",
        frequency: "Bedtime",
        prescriber: "Dr. Martinez",
        quantity: 7,
      },
      {
        name: "Multivitamin",
        dose: "1 tablet",
        frequency: "Morning",
        prescriber: "Dr. Chen",
        quantity: 7,
      },
    ],
  },
  {
    id: 12,
    name: "Patricia Lee",
    initials: "PL",
    program: "Mahoney House",
    medications: [
      {
        name: "Lexapro",
        dose: "10mg",
        frequency: "Morning",
        prescriber: "Dr. Wilson",
        quantity: 7,
      },
    ],
  },
  {
    id: 20,
    name: "Daniel White",
    initials: "DW",
    program: "Rydell House",
    medications: [
      {
        name: "Abilify",
        dose: "5mg",
        frequency: "Morning",
        prescriber: "Dr. Martinez",
        quantity: 7,
      },
      {
        name: "Propranolol",
        dose: "20mg",
        frequency: "Afternoon",
        prescriber: "Dr. Martinez",
        quantity: 14,
      },
    ],
  },
  {
    id: 25,
    name: "Rachel Clark",
    initials: "RC",
    program: "Rydell House",
    medications: [
      {
        name: "Concerta",
        dose: "36mg",
        frequency: "Morning",
        prescriber: "Dr. Chen",
        quantity: 7,
      },
      {
        name: "Guanfacine",
        dose: "1mg",
        frequency: "Evening",
        prescriber: "Dr. Chen",
        quantity: 14,
      },
      {
        name: "Melatonin",
        dose: "3mg",
        frequency: "Bedtime",
        prescriber: "Dr. Chen",
        quantity: 7,
      },
    ],
  },
];

export function getYouthMedications(
  youthId: string,
): YouthMedications | undefined {
  return YOUTH_MEDICATIONS.find(
    (y) => String(y.id) === youthId,
  );
}

export interface PackMedRecord {
  id: number;
  /** Youth Constituent ID, as a string (same as PassRecord.youthId). */
  youthId: string;
  /** Existing naming convention: "[Youth] MM/DD/YYYY-MM/DD/YYYY" */
  packName: string;
  /** ISO "YYYY-MM-DD" */
  startDate: string;
  /** "HH:MM" (the dialog's time input), or "" */
  startTime: string;
  /** ISO "YYYY-MM-DD" */
  endDate: string;
  endTime: string;
  medications: {
    name: string;
    dose: string;
    frequency: string;
  }[];
  status: "Packed";
  /** Linked Pass (0..1). Kept in sync with PassRecord.packMedId by
   *  lib/passPackMedAssociation.ts — never set directly. */
  passId: number | null;
  createdBy: string;
  /** ISO timestamp */
  createdAt: string;
  // Pack Medication workflow fields (the 8-step dialog's pack). Optional so
  // records saved before the workflow wrote here stay valid.
  packStatus?:
    "Available" | "Selected" | "Dispensed" | "Received";
  packType?: string;
  /** ISO "YYYY-MM-DD" */
  expectedHandoffDate?: string;
  archived?: boolean;
}

function isPackMedRecord(r: unknown): r is PackMedRecord {
  const p = r as PackMedRecord;
  return (
    !!p &&
    typeof p.id === "number" &&
    typeof p.youthId === "string" &&
    typeof p.packName === "string" &&
    typeof p.startDate === "string" &&
    typeof p.endDate === "string" &&
    Array.isArray(p.medications) &&
    (p.passId === null || typeof p.passId === "number")
  );
}

export function packMedName(
  youthName: string,
  startIso: string,
  endIso: string,
): string {
  const mdy = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return `${m}/${d}/${y}`;
  };
  return `${youthName} ${mdy(startIso)}-${mdy(endIso)}`;
}

/** Human label for pickers / views: name · n meds. */
export function packMedLabel(p: PackMedRecord): string {
  return `${p.packName} · ${p.medications.length} med${p.medications.length === 1 ? "" : "s"}`;
}

function isoDaysFromToday(days: number): string {
  const t = new Date();
  const d = new Date(
    t.getFullYear(),
    t.getMonth(),
    t.getDate() + days,
  );
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function seed(
  id: number,
  youthId: string,
  startOffset: number,
  endOffset: number,
  passId: number | null,
): PackMedRecord {
  const y = YOUTH_MEDICATIONS.find(
    (x) => String(x.id) === youthId,
  )!;
  const startDate = isoDaysFromToday(startOffset);
  const endDate = isoDaysFromToday(endOffset);
  return {
    id,
    youthId,
    packName: packMedName(y.name, startDate, endDate),
    startDate,
    startTime: "17:00",
    endDate,
    endTime: "16:00",
    medications: y.medications.map(
      ({ name, dose, frequency }) => ({
        name,
        dose,
        frequency,
      }),
    ),
    status: "Packed",
    passId,
    createdBy: "System (Initial Import)",
    createdAt: "2026-09-01T15:00:00.000Z",
  };
}

// Patricia Lee (12): one linked to Pass 1, one unlinked; Daniel White (20)
// and Emily Johnson (1) unlinked — enough to exercise same-youth filtering.
const SEED_PACK_MEDS: PackMedRecord[] = [
  seed(101, "12", 3, 5, 1),
  seed(102, "12", 17, 19, null),
  seed(103, "20", 10, 10, null),
  seed(104, "1", -5, -3, null),
];

const STORAGE_KEY = "mh.packMeds.v1";
let packMeds: PackMedRecord[] = loadRecordList(
  STORAGE_KEY,
  [...SEED_PACK_MEDS],
  isPackMedRecord,
);
const listeners = new Set<() => void>();

export function subscribePackMeds(
  listener: () => void,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function commit(next: PackMedRecord[]): void {
  packMeds = next;
  saveRecordList(STORAGE_KEY, next);
  listeners.forEach((l) => l());
}

export function getPackMeds(): PackMedRecord[] {
  return packMeds;
}

export function usePackMeds(): PackMedRecord[] {
  return useSyncExternalStore(
    subscribePackMeds,
    getPackMeds,
    getPackMeds,
  );
}

export function getPackMedById(
  id: number,
): PackMedRecord | undefined {
  return packMeds.find((p) => p.id === id);
}

export function nextPackMedId(): number {
  return packMeds.reduce((m, p) => Math.max(m, p.id), 0) + 1;
}

/** Insert or replace Pack Meds (by id). */
export function savePackMeds(next: PackMedRecord[]): void {
  const byId = new Map(next.map((p) => [p.id, p]));
  const updated = packMeds.map((p) => byId.get(p.id) ?? p);
  const added = next.filter(
    (p) => !packMeds.some((x) => x.id === p.id),
  );
  commit([...updated, ...added]);
}