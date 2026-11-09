// Youth Documents (US 20147) — shared model.
//
// One record per uploaded document. Business dates are date-only
// ("YYYY-MM-DD", the app's local calendar date); audit fields are ISO
// timestamps. External IDs stay null until a real Salesforce / Laserfiche
// service returns them — a prototype key is never stored in them.

/** Approved Document Types (Revised 11.04.2026), alphabetical. */
export const DOCUMENT_TYPES = [
  "Consent/Agreement",
  "Consent/Agreement - CC",
  "Consent/Agreement - Medication",
  "Education & Employment",
  "Financial/Housing",
  "Financial/Housing - CC",
  "Health & Medical",
  "Identification",
  "Legal",
  "Mental Health",
  "Miscellaneous",
  "Release of Information",
  "Test/Assessment",
  "Treatment Planning",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const ACCEPTED_MEDIA_TYPES = [
  "image/png",
  "image/jpeg",
  "application/pdf",
] as const;
export type AcceptedMediaType =
  (typeof ACCEPTED_MEDIA_TYPES)[number];

// ── Catalog ────────────────────────────────────────────────────────────
// Renewal configuration is three-state. "unknown" (not yet configured) is
// NOT the same as "one-time" (confirmed: never expires).

export type RenewalUnit = "day" | "week" | "month" | "year";

export type RenewalRule =
  | { kind: "unknown" }
  | { kind: "one-time" }
  | {
      kind: "recurring";
      every: number;
      unit: RenewalUnit;
      /** Which date the period is added to — must come from the approved
       *  catalog; there is no default. */
      base: "dateExecuted" | "dateFiled";
      /** Approved month-end convention. "clamp" = Jan 31 + 1 month →
       *  Feb 28/29. */
      monthEnd: "clamp";
      /** Whether staff may overwrite the calculated date. Only `true`
       *  allows it; anything else keeps the field calculated. */
      staffOverride: boolean;
    };

export interface CatalogEntry {
  id: string;
  documentType: string;
  documentName: string;
  /** Mapped base folder. */
  folder: string;
  renewal: RenewalRule;
}

export type CatalogState =
  | { status: "unavailable"; reason: string }
  | {
      status: "available";
      entries: readonly CatalogEntry[];
      /** Folder a restricted document is filed under. null = not
       *  configured, so documents cannot be marked restricted. */
      restrictedFolder: string | null;
    };

export interface CatalogProvider {
  /** Where the catalog came from, shown when it is not the approved one. */
  label: string;
  /** True only for the business-approved catalog. Fixtures are false. */
  approved: boolean;
  getCatalog(): CatalogState;
}

// ── Document record ────────────────────────────────────────────────────

export type SourceSystem =
  "prototype" | "salesforce" | "laserfiche";

export type SyncState =
  | "local-only" // browser prototype, no external system involved
  | "pending"
  | "partial" // one external system succeeded, the other did not
  | "synced"
  | "failed";

export interface DocumentFileInfo {
  name: string;
  mediaType: string;
  sizeBytes: number;
  /** Opaque reference resolved by the file gateway. Never a blob URL. */
  storageRef: string;
}

export type RenewalStatus =
  "recurring" | "one-time" | "unknown";

/**
 * Who owns a document. The two id types are DIFFERENT identifier spaces and
 * are never interchangeable: a Youth Constituent ID and an Admissions record
 * ID ("L-…") must not be passed in each other's place.
 */
export type DocumentOwner =
  | { kind: "youth"; id: string }
  | { kind: "admission"; id: string };

/**
 * The owners whose documents one profile shows together. Built only from
 * verified records and explicit links (see lib/youthDocumentOwner):
 *  - `primary` owns NEW uploads (the Youth once linked, else the Admissions
 *    record);
 *  - `owners` is everything resolved as the same Youth: the Youth plus every
 *    Admissions record explicitly linked to them. No document is copied or
 *    moved when a link appears — both profiles simply resolve the same
 *    records.
 */
export interface DocumentOwnerScope {
  primary: DocumentOwner;
  owners: readonly DocumentOwner[];
}

export interface YouthDocument {
  /** Stable internal record id. Not a Salesforce or Laserfiche id. */
  id: string;
  /** Verified Youth Constituent ID for Youth-owned records; "" when the
   *  record is owned by an Admissions record (see `admissionId`). */
  youthId: string;
  /** Admissions record ID for records uploaded before any Youth link; null/
   *  absent for Youth-owned records. Never a Constituent ID. */
  admissionId?: string | null;
  catalogEntryId: string | null;
  documentType: string;
  documentName: string;
  baseFolder: string;
  effectiveFolder: string;
  restricted: boolean;
  /** When the document was filed in Salesforce. */
  dateFiled: string;
  dateExecuted: string | null;
  expirationDate: string | null;
  /** Renewal configuration the record was saved under. */
  renewalStatus: RenewalStatus;
  descriptor: string;
  file: DocumentFileInfo;
  salesforceDocumentRecordId: string | null;
  salesforceFileVersionId: string | null;
  laserficheEntryId: string | null;
  sourceSystem: SourceSystem;
  syncState: SyncState;
  /** Verified external document/event key used for idempotent replays. */
  externalEventKey: string | null;
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
}

// ── Access ─────────────────────────────────────────────────────────────

export type DocumentCapability =
  | "view"
  | "upload"
  | "edit"
  | "view-restricted"
  | "mark-restricted"
  | "edit-restricted"
  | "unrestrict";

export interface DocumentActor {
  id: string;
  name: string;
}

export interface DocumentAccess {
  actor: DocumentActor | null;
  capabilities: ReadonlySet<DocumentCapability>;
}

export type DocumentDenial =
  | "not-found"
  | "denied"
  | "storage"
  | "validation"
  | "catalog-unavailable"
  | "integration-unavailable"
  | "failed";