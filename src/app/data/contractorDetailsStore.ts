// Contractor details (US 20119): one current record per Individual
// Contractor, keyed by the stable Constituent ID. Persisted to this
// browser's localStorage (same convention as communityNeedsStore /
// staffDetailsStore). Prototype only: there is no server persistence.
//
// The canonical constituent role stays "Contractor"; the subtype is a
// separate saved detail that only changes the Role column's display label.
// Dates are recorded information and never change status, role or access.
import { useSyncExternalStore } from "react";

export const CONTRACTOR_SUBTYPE_OPTIONS = [
  "Nurse",
  "Physician",
  "Psychiatric",
  "CADC",
  "Therapy",
  "Quality Improvement",
] as const;

export type ContractorSubtype =
  (typeof CONTRACTOR_SUBTYPE_OPTIONS)[number];

/** "" means no subtype / no date / no notes. Dates are "YYYY-MM-DD". */
export interface ContractorDetails {
  subtype: ContractorSubtype | "";
  startDate: string;
  endDate: string;
  notes: string;
}

const STORAGE_KEY = "mh.contractorDetails.v1";
const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const SUBTYPES = new Set<string>(CONTRACTOR_SUBTYPE_OPTIONS);

/** True for a complete, real calendar date in "YYYY-MM-DD" form. */
export function isValidIsoDate(value: string): boolean {
  const m = ISO_RE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (y < 1900 || y > 2100 || mo < 1 || mo > 12 || d < 1)
    return false;
  // UTC so the check never shifts with the viewer's time zone.
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

export type ContractorDetailsErrors = Partial<
  Record<keyof ContractorDetails, string>
>;

export const END_BEFORE_START =
  "End Date cannot be earlier than Start Date.";

/** Shared by the form and the store's write boundary. */
export function validateContractorDetails(
  d: ContractorDetails,
): ContractorDetailsErrors {
  const errors: ContractorDetailsErrors = {};
  if (d.subtype !== "" && !SUBTYPES.has(d.subtype))
    errors.subtype = "Select a supported Contractor Subtype.";
  if (d.startDate && !isValidIsoDate(d.startDate))
    errors.startDate = "Enter a valid date as MM/DD/YYYY.";
  if (d.endDate && !isValidIsoDate(d.endDate))
    errors.endDate = "Enter a valid date as MM/DD/YYYY.";
  // ISO date-only strings compare correctly as text.
  if (
    !errors.startDate &&
    !errors.endDate &&
    d.startDate &&
    d.endDate &&
    d.endDate < d.startDate
  )
    errors.endDate = END_BEFORE_START;
  if (typeof d.notes !== "string")
    errors.notes = "Notes must be text.";
  return errors;
}

function isRecord(v: unknown): v is ContractorDetails {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.subtype === "string" &&
    typeof r.startDate === "string" &&
    typeof r.endDate === "string" &&
    typeof r.notes === "string" &&
    Object.keys(
      validateContractorDetails(
        r as unknown as ContractorDetails,
      ),
    ).length === 0
  );
}

/**
 * Reads the saved snapshot. Invalid individual records are dropped, but an
 * unreadable snapshot (bad JSON / wrong shape) is reported as `corrupt` so
 * saves are refused instead of silently overwriting it with an empty one.
 */
function load(): {
  records: Record<string, ContractorDetails>;
  corrupt: boolean;
} {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { records: {}, corrupt: false }; // storage unavailable
  }
  if (!raw) return { records: {}, corrupt: false };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    )
      return { records: {}, corrupt: true };
    const records: Record<string, ContractorDetails> = {};
    for (const [id, r] of Object.entries(parsed)) {
      if (isRecord(r))
        records[id] = {
          subtype: r.subtype,
          startDate: r.startDate,
          endDate: r.endDate,
          notes: r.notes,
        };
    }
    return { records, corrupt: false };
  } catch {
    return { records: {}, corrupt: true };
  }
}

const initial = load();
let recordsByConstituent: Record<string, ContractorDetails> =
  initial.records;
let snapshotCorrupt = initial.corrupt;

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return recordsByConstituent;
}

export type SaveContractorResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      fieldErrors?: ContractorDetailsErrors;
    };

/**
 * Saves all four fields for one constituent as one operation. Validates,
 * writes the complete next snapshot to storage, and only then replaces the
 * in-memory snapshot and notifies subscribers. Any failure leaves the
 * previous saved record untouched.
 */
export function saveContractorDetails(
  constituentId: string,
  details: ContractorDetails,
): SaveContractorResult {
  const fieldErrors = validateContractorDetails(details);
  if (Object.keys(fieldErrors).length)
    return {
      ok: false,
      error: "Correct the highlighted fields and try again.",
      fieldErrors,
    };
  if (snapshotCorrupt)
    return {
      ok: false,
      error:
        "Saved Contractor details in this browser could not be read, so saving was blocked to avoid overwriting them. Clear this site's stored data and try again.",
    };
  const next = {
    ...recordsByConstituent,
    [constituentId]: {
      subtype: details.subtype,
      startDate: details.startDate,
      endDate: details.endDate,
      notes: details.notes,
    },
  };
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next),
    );
  } catch {
    return {
      ok: false,
      error:
        "Contractor details could not be saved because browser storage is unavailable or full. Your changes are still in the form; free up storage or leave private browsing, then select Save again.",
    };
  }
  recordsByConstituent = next;
  listeners.forEach((l) => l());
  return { ok: true };
}

/** Saved record, or undefined when none has been saved. */
export function useContractorDetails(
  constituentId: string,
): ContractorDetails | undefined {
  const all = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
  return all[constituentId];
}

/** Reactive map of every saved record (Constituents homepage). */
export function useAllContractorDetails(): Record<
  string,
  ContractorDetails
> {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
}

/** Role column label: "Contractor - <Subtype>" or the base role. */
export function contractorRoleLabel(
  details: ContractorDetails | undefined,
): string {
  return details?.subtype
    ? `Contractor - ${details.subtype}`
    : "Contractor";
}