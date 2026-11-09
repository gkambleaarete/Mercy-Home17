import type {
  SourceSystem,
  SyncState,
} from "./youthDocumentTypes";

// Salesforce / Laserfiche integration boundary (US 20147).
//
// NO REAL INTEGRATION EXISTS in this repository: no endpoint, credential,
// folder identifier or upload limit was provided. The document service talks
// to storage only through this interface. Until a gateway is installed every
// upload/retrieval reports "integration-unavailable". A browser-only
// prototype adapter lives in data/demo and is installed explicitly.
//
// Open contract questions for Feng / the dev team:
//  - which Salesforce record id is passed to Laserfiche (this layer sends the
//    internal `documentKey`; the gateway must map it to the confirmed id),
//  - the effective maximum file size for the Salesforce → Laserfiche path,
//  - whether picking a new file replaces a version or creates a new record.

export interface UploadPolicy {
  /** Effective maximum bytes from the configured upload route. null =
   *  no confirmed limit (none is assumed). */
  maxBytes: number | null;
  /** Trusted configured Laserfiche destination for oversized files. null =
   *  none configured, so no link is shown. */
  directUploadUrl: string | null;
}

export interface GatewayUploadRequest {
  /** Our internal record id. Not a Salesforce or Laserfiche id. */
  documentKey: string;
  /** Verified Youth Constituent ID, or null for an Admissions-owned record.
   *  Never an Admissions id. */
  youthId: string | null;
  /** Admissions record ID for an Admissions-owned record, else null. The
   *  external contract for Admissions-owned documents is NOT defined: a
   *  gateway must opt in (`supportsAdmissionOwner`). */
  admissionId: string | null;
  file: File;
  /** Stable per user action; the gateway must treat a repeat as a retry. */
  idempotencyKey: string;
  metadata: {
    documentType: string;
    documentName: string;
    folder: string;
    restricted: boolean;
    dateFiled: string;
    dateExecuted: string | null;
    expirationDate: string | null;
    descriptor: string;
  };
}

export interface GatewayRecordIds {
  storageRef: string;
  salesforceDocumentRecordId?: string | null;
  salesforceFileVersionId?: string | null;
  laserficheEntryId?: string | null;
  sourceSystem?: SourceSystem;
  syncState?: SyncState;
}

export type GatewayUploadResult =
  | ({ ok: true } & GatewayRecordIds)
  | {
      ok: false;
      reason: string;
      retryable: boolean;
      /** Set when one external system succeeded and the other did not, so
       *  the work can be resumed instead of repeated. */
      partial?: GatewayRecordIds;
    };

export type GatewayFetchResult =
  | { ok: true; content: Blob }
  | { ok: false; reason: "not-found" | "denied" | "error" };

export interface DocumentGateway {
  /**
   * True only when this gateway can file documents owned by an Admissions
   * record (one with no Youth link yet). The real Salesforce/Laserfiche
   * contract for that is unavailable, so a gateway that does not set this is
   * treated as unable to — nothing is invented. Only the browser prototype
   * gateways opt in.
   */
  supportsAdmissionOwner?: boolean;
  getUploadPolicy(): Promise<UploadPolicy> | UploadPolicy;
  upload(
    request: GatewayUploadRequest,
  ): Promise<GatewayUploadResult>;
  retrieve(
    storageRef: string,
    context: {
      documentId: string;
      youthId: string | null;
      admissionId: string | null;
    },
  ): Promise<GatewayFetchResult>;
  /** Resume a partial upload. Optional: absent = retries re-upload. */
  resume?(
    request: GatewayUploadRequest,
    partial: GatewayRecordIds,
  ): Promise<GatewayUploadResult>;
}

let gateway: DocumentGateway | null = null;

export function setDocumentGateway(
  next: DocumentGateway | null,
): void {
  gateway = next;
}

export function getDocumentGateway(): DocumentGateway | null {
  return gateway;
}

/** Can the installed gateway file Admissions-owned documents? */
export function gatewaySupportsAdmissionOwner(): boolean {
  return gateway?.supportsAdmissionOwner === true;
}

export function isDocumentGatewayConfigured(): boolean {
  return gateway !== null;
}