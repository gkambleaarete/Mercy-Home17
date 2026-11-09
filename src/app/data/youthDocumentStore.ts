import { useMemo, useSyncExternalStore } from "react";
import { resolveYouthConstituent } from "../lib/youthIdentity";
import {
  scopeIsValid,
  scopeKey,
  verifyOwner,
  youthScope,
} from "../lib/youthDocumentOwner";
import { todayIso } from "./mockProgramsData";
import {
  calculateExpiration,
  findCatalogEntry,
  findEntryByTypeAndName,
  getCatalog,
  isValidIsoDate,
  renewalStatusOf,
  restrictedFolder,
  subscribeCatalog,
} from "./youthDocumentCatalog";
import {
  can,
  canEditRecord,
  canViewRecord,
  currentDocumentAccess,
  subscribeAccess,
} from "./youthDocumentAccess";
import {
  gatewaySupportsAdmissionOwner,
  getDocumentGateway,
  type GatewayRecordIds,
  type GatewayUploadRequest,
} from "./youthDocumentGateway";
import {
  ACCEPTED_MEDIA_TYPES,
  DOCUMENT_TYPES,
  type CatalogEntry,
  type DocumentAccess,
  type DocumentOwner,
  type DocumentOwnerScope,
  type DocumentDenial,
  type YouthDocument,
} from "./youthDocumentTypes";

// Youth Documents service + shared store (US 20147).
//
// The single source of truth for Youth documents. Every read and write is
// scoped to one Youth id and re-checks access here, so the UI is never the
// only gate. Metadata persists to localStorage (fictional prototype data);
// file bytes never do — they go through the DocumentGateway.
//
// Every successful upload creates its OWN record: nothing upserts by Youth +
// Document Type or Name.

const STORAGE_KEY = "mh.youthDocuments.v1";

interface Persisted {
  documents: YouthDocument[];
  /** eventKey → document id, for idempotent incoming events. */
  events: Record<string, string>;
  nextSeq: number;
}

let state: Persisted = load();
let version = 0;
const listeners = new Set<() => void>();

function load(): Persisted {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Persisted;
      if (Array.isArray(p.documents))
        return {
          documents: p.documents,
          events: p.events ?? {},
          nextSeq: p.nextSeq ?? p.documents.length + 1,
        };
    }
  } catch {
    // No/invalid storage — start empty.
  }
  return { documents: [], events: {}, nextSeq: 1 };
}

/** Writes state; false (and nothing changed) when storage rejects it. */
function commit(next: Persisted): boolean {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next),
    );
  } catch {
    return false;
  }
  state = next;
  version++;
  listeners.forEach((l) => l());
  return true;
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  const offA = subscribeAccess(l);
  const offC = subscribeCatalog(l);
  return () => {
    listeners.delete(l);
    offA();
    offC();
  };
}

// ── Results ────────────────────────────────────────────────────────────

export type FieldErrors = Partial<Record<string, string>>;

export type DocResult<T = YouthDocument> =
  | { ok: true; value: T }
  | {
      ok: false;
      reason: DocumentDenial;
      message?: string;
      fieldErrors?: FieldErrors;
      /** Set when a failed multi-system upload left a retryable record. */
      recoverableId?: string;
    };

const fail = (
  reason: DocumentDenial,
  message?: string,
  fieldErrors?: FieldErrors,
): DocResult<never> => ({
  ok: false,
  reason,
  message,
  fieldErrors,
});

// ── Reads ──────────────────────────────────────────────────────────────

/** A record is usable only once its file/metadata work is confirmed. */
const isUsable = (d: YouthDocument) =>
  d.syncState !== "partial" && d.syncState !== "failed";

/** Who a read/write is for: a verified Youth Constituent id (string, the
 *  existing form) or a resolved scope (Youth and/or Admissions owners). A
 *  plain string is ALWAYS a Youth Constituent id — never an Admissions id. */
export type OwnerArg = string | DocumentOwnerScope;

/** Resolve an argument to a verified scope, or null. */
function toScope(
  arg: OwnerArg | null | undefined,
): DocumentOwnerScope | null {
  if (!arg) return null;
  if (typeof arg === "string") return youthScope(arg);
  return scopeIsValid(arg) ? arg : null;
}

/** Does this record belong to one of the scope's owners? Youth-owned
 *  records match on youthId only, Admissions-owned on admissionId only. */
function inScope(
  d: YouthDocument,
  scope: DocumentOwnerScope,
): boolean {
  return scope.owners.some((o) =>
    o.kind === "youth"
      ? !d.admissionId && d.youthId === o.id
      : d.admissionId === o.id,
  );
}

/** Authorized documents for one owner scope. Access is applied first, so
 *  counts, groups and filter options derived from this never expose hidden
 *  rows. An unverified owner yields nothing. */
export function listYouthDocuments(
  owner: OwnerArg,
  access: DocumentAccess = currentDocumentAccess(),
): YouthDocument[] {
  const scope = toScope(owner);
  if (!scope) return [];
  return state.documents.filter(
    (d) =>
      inScope(d, scope) &&
      isUsable(d) &&
      canViewRecord(access, d.restricted),
  );
}

/** Uploads awaiting a safe retry (authorized only). */
export function listIncompleteUploads(
  owner: OwnerArg,
  access: DocumentAccess = currentDocumentAccess(),
): YouthDocument[] {
  const scope = toScope(owner);
  if (!scope) return [];
  return state.documents.filter(
    (d) =>
      inScope(d, scope) &&
      !isUsable(d) &&
      canViewRecord(access, d.restricted),
  );
}

/** Resolve a stable document id for another feature. Pass `youthId` or
 *  `scope` to also require that it belongs to that owner. */
export function resolveYouthDocument(
  id: string,
  opts: {
    youthId?: string;
    scope?: DocumentOwnerScope;
    access?: DocumentAccess;
  } = {},
): DocResult {
  const access = opts.access ?? currentDocumentAccess();
  const d = state.documents.find((x) => x.id === id);
  if (!d) return fail("not-found");
  const wanted = opts.scope ?? opts.youthId;
  if (wanted !== undefined) {
    const scope = toScope(wanted);
    if (!scope || !inScope(d, scope)) return fail("not-found");
  }
  if (!canViewRecord(access, d.restricted))
    return fail("denied");
  return { ok: true, value: d };
}

/** Reactive authorized documents for one owner scope. */
export function useYouthDocuments(owner: OwnerArg | null): {
  documents: YouthDocument[];
  incomplete: YouthDocument[];
} {
  const v = useSyncExternalStore(
    subscribe,
    () => version,
    () => version,
  );
  // Access changes re-filter the same data, so they count as a change too.
  const tick = useSyncExternalStore(
    subscribeAccess,
    () => accessTick,
    () => accessTick,
  );
  const key =
    typeof owner === "string"
      ? `youth:${owner}`
      : scopeKey(owner);
  return useMemo(
    () => ({
      documents: owner ? listYouthDocuments(owner) : [],
      incomplete: owner ? listIncompleteUploads(owner) : [],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, v, tick],
  );
}

let accessTick = 0;
subscribeAccess(() => accessTick++);

// ── Validation ─────────────────────────────────────────────────────────

export const sniffMediaType = async (
  blob: Blob,
): Promise<string | null> => {
  const b = new Uint8Array(
    await blob.slice(0, 8).arrayBuffer(),
  );
  const is = (...sig: number[]) =>
    sig.every((v, i) => b[i] === v);
  if (is(0x89, 0x50, 0x4e, 0x47)) return "image/png";
  if (is(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (is(0x25, 0x50, 0x44, 0x46)) return "application/pdf";
  return null;
};

export interface DocumentFormValues {
  documentType: string;
  documentName: string;
  restricted: boolean;
  dateFiled: string;
  dateExecuted: string;
  expirationDate: string;
  descriptor: string;
}

/** Expiration implied by a catalog entry + the dates, honouring whether
 *  staff may override the calculated value. */
export function resolveExpiration(
  entry: CatalogEntry | null,
  v: Pick<
    DocumentFormValues,
    "dateExecuted" | "dateFiled" | "expirationDate"
  >,
):
  | { ok: true; value: string | null; calculated: boolean }
  | { ok: false; message: string } {
  const rule = entry?.renewal;
  if (!rule || rule.kind !== "recurring")
    return { ok: true, value: null, calculated: false };
  const calc = calculateExpiration(rule, {
    dateExecuted: v.dateExecuted || null,
    dateFiled: v.dateFiled || null,
  });
  if (rule.staffOverride && v.expirationDate) {
    if (!isValidIsoDate(v.expirationDate))
      return { ok: false, message: "Enter a valid date." };
    return {
      ok: true,
      value: v.expirationDate,
      calculated: false,
    };
  }
  if (!calc)
    return {
      ok: false,
      message:
        "Expiration cannot be calculated without a valid base date.",
    };
  return { ok: true, value: calc, calculated: true };
}

/** Pure field checks shared by the form and the service. */
export function validateFormValues(
  v: DocumentFormValues,
  mode: "create" | "edit",
): FieldErrors {
  const e: FieldErrors = {};
  if (!DOCUMENT_TYPES.includes(v.documentType as never))
    e.documentType = "Select a Document Type.";
  if (!v.documentName)
    e.documentName = "Select a Document Name.";
  if (mode === "create") {
    if (!v.dateFiled) e.dateFiled = "Date Filed is required.";
    else if (!isValidIsoDate(v.dateFiled))
      e.dateFiled = "Enter a valid date.";
    // Edits keep existing/imported records valid: blank is allowed there.
    if (!v.dateExecuted)
      e.dateExecuted = "Date Executed is required.";
  }
  if (v.dateExecuted && !isValidIsoDate(v.dateExecuted))
    e.dateExecuted = "Enter a valid date.";
  return e;
}

// ── Create ─────────────────────────────────────────────────────────────

export interface CreateDocumentInput extends DocumentFormValues {
  /** Verified Youth Constituent id (existing form). Use `owner` for an
   *  Admissions-owned upload. Exactly one of the two. */
  youthId?: string;
  /** Explicit owner of the new record (a scope's `primary`). */
  owner?: DocumentOwner;
  /** One per user submit action: a duplicate click or retry reuses it. */
  requestId: string;
  file: File | null;
}

const inflight = new Map<string, Promise<DocResult>>();

function createOwner(input: {
  youthId?: string;
  owner?: DocumentOwner;
}): DocumentOwner | null {
  if (input.owner) return input.owner;
  return input.youthId
    ? { kind: "youth", id: input.youthId }
    : null;
}

export function createYouthDocument(
  input: CreateDocumentInput,
): Promise<DocResult> {
  const o = createOwner(input);
  const key = `${o ? `${o.kind}:${o.id}` : "none"}:${input.requestId}`;
  const existing = inflight.get(key);
  if (existing) return existing;
  const p = doCreate(input).finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

function nextId(): string {
  return `DOC-${String(state.nextSeq).padStart(6, "0")}`;
}

async function doCreate(
  input: CreateDocumentInput,
): Promise<DocResult> {
  const access = currentDocumentAccess();
  if (!can(access, "upload") || !access.actor)
    return fail(
      "denied",
      "You do not have permission to upload documents.",
    );
  const owner = createOwner(input);
  if (!owner || !verifyOwner(owner))
    return fail(
      "not-found",
      owner?.kind === "admission"
        ? "This Admissions record could not be verified."
        : "This Youth could not be verified.",
    );
  if (input.restricted && !can(access, "mark-restricted"))
    return fail(
      "denied",
      "You do not have permission to restrict documents.",
    );

  const cat = getCatalog();
  if (cat.status !== "available")
    return fail("catalog-unavailable", cat.reason);
  const entry = findEntryByTypeAndName(
    input.documentType,
    input.documentName,
  );
  const errors = validateFormValues(input, "create");
  if (!entry && !errors.documentName)
    errors.documentName =
      "This Document Name is not approved for the selected type.";
  if (!input.file) errors.file = "Select a document file.";
  if (Object.keys(errors).length > 0 || !entry || !input.file)
    return fail("validation", undefined, errors);

  const effectiveFolder = input.restricted
    ? restrictedFolder()
    : entry.folder;
  if (!effectiveFolder)
    return fail(
      "validation",
      "The restricted folder is not configured.",
      { restricted: "Restricting documents is unavailable." },
    );

  const exp = resolveExpiration(entry, input);
  if (!exp.ok)
    return fail("validation", undefined, {
      expirationDate: exp.message,
    });

  const gateway = getDocumentGateway();
  if (!gateway)
    return fail(
      "integration-unavailable",
      "Document storage is not connected. Nothing was saved.",
    );
  // The Salesforce/Laserfiche contract for Admissions-owned documents does
  // not exist yet: only a gateway that explicitly supports it may file them.
  if (
    owner.kind === "admission" &&
    !gatewaySupportsAdmissionOwner()
  )
    return fail(
      "integration-unavailable",
      "Filing documents for Admissions records is not configured. Nothing was saved.",
    );

  // File type: declared AND actual content, then the configured size limit.
  const file = input.file;
  const sniffed = await sniffMediaType(file);
  if (
    !(ACCEPTED_MEDIA_TYPES as readonly string[]).includes(
      file.type,
    ) ||
    sniffed !== file.type
  )
    return fail("validation", undefined, {
      file: "Only PNG, JPG/JPEG and PDF files are accepted.",
    });
  if (file.size === 0)
    return fail("validation", undefined, {
      file: "The selected file is empty.",
    });
  let policy;
  try {
    policy = await gateway.getUploadPolicy();
  } catch {
    return fail(
      "integration-unavailable",
      "The upload limit could not be retrieved. Nothing was saved.",
    );
  }
  if (policy.maxBytes !== null && file.size > policy.maxBytes)
    return fail("validation", undefined, {
      file: "TOO_LARGE",
    });

  const id = nextId();
  const request: GatewayUploadRequest = {
    documentKey: id,
    youthId: owner.kind === "youth" ? owner.id : null,
    admissionId: owner.kind === "admission" ? owner.id : null,
    file,
    idempotencyKey: input.requestId,
    metadata: {
      documentType: input.documentType,
      documentName: input.documentName,
      folder: effectiveFolder,
      restricted: input.restricted,
      dateFiled: input.dateFiled,
      dateExecuted: input.dateExecuted,
      expirationDate: exp.value,
      descriptor: input.descriptor.trim(),
    },
  };
  let result;
  try {
    result = await gateway.upload(request);
  } catch {
    return fail(
      "failed",
      "The upload failed. Nothing was saved.",
    );
  }

  // Permissions can change during the awaits above: re-check before saving.
  const nowAccess = currentDocumentAccess();
  if (
    !can(nowAccess, "upload") ||
    (input.restricted && !can(nowAccess, "mark-restricted"))
  )
    return fail(
      "denied",
      "Your access changed. Nothing was saved.",
    );

  const now = new Date().toISOString();
  const build = (
    ids: GatewayRecordIds,
    syncState: YouthDocument["syncState"],
  ): YouthDocument => ({
    id,
    youthId: owner.kind === "youth" ? owner.id : "",
    admissionId: owner.kind === "admission" ? owner.id : null,
    catalogEntryId: entry.id,
    documentType: input.documentType,
    documentName: input.documentName,
    baseFolder: entry.folder,
    effectiveFolder,
    restricted: input.restricted,
    dateFiled: input.dateFiled,
    dateExecuted: input.dateExecuted,
    expirationDate: exp.value,
    renewalStatus: renewalStatusOf(entry.renewal),
    descriptor: input.descriptor.trim(),
    file: {
      name: file.name,
      mediaType: file.type,
      sizeBytes: file.size,
      storageRef: ids.storageRef,
    },
    salesforceDocumentRecordId:
      ids.salesforceDocumentRecordId ?? null,
    salesforceFileVersionId:
      ids.salesforceFileVersionId ?? null,
    laserficheEntryId: ids.laserficheEntryId ?? null,
    sourceSystem: ids.sourceSystem ?? "prototype",
    syncState,
    externalEventKey: null,
    createdBy: access.actor!.name,
    createdAt: now,
    lastModifiedBy: access.actor!.name,
    lastModifiedAt: now,
  });

  if (!result.ok) {
    if (!result.partial)
      return fail(
        "failed",
        result.retryable
          ? "The upload did not complete. Your entries were kept; try again."
          : "The upload was rejected. Nothing was saved.",
      );
    // Partial: keep a recoverable (non-listed) record so retry resumes.
    const rec = build(result.partial, "partial");
    if (
      !commit({
        ...state,
        documents: [...state.documents, rec],
        nextSeq: state.nextSeq + 1,
      })
    )
      return fail("storage", "Could not save the document.");
    return {
      ok: false,
      reason: "failed",
      message:
        "The upload only partly completed. It was kept so it can be retried safely.",
      recoverableId: rec.id,
    };
  }

  const rec = build(result, result.syncState ?? "local-only");
  if (
    !commit({
      ...state,
      documents: [...state.documents, rec],
      nextSeq: state.nextSeq + 1,
    })
  )
    return fail("storage", "Could not save the document.");
  return { ok: true, value: rec };
}

/** Resume a partial upload. Safe to repeat. */
export async function retryIncompleteUpload(
  id: string,
  owner: OwnerArg,
  file: File,
): Promise<DocResult> {
  const access = currentDocumentAccess();
  const scope = toScope(owner);
  const rec = scope
    ? state.documents.find(
        (d) => d.id === id && inScope(d, scope),
      )
    : undefined;
  if (!rec) return fail("not-found");
  if (
    !canEditRecord(access, rec.restricted) ||
    !can(access, "upload")
  )
    return fail("denied");
  const gateway = getDocumentGateway();
  if (!gateway) return fail("integration-unavailable");
  const request: GatewayUploadRequest = {
    documentKey: rec.id,
    youthId: rec.admissionId ? null : rec.youthId,
    admissionId: rec.admissionId ?? null,
    file,
    idempotencyKey: rec.id,
    metadata: {
      documentType: rec.documentType,
      documentName: rec.documentName,
      folder: rec.effectiveFolder,
      restricted: rec.restricted,
      dateFiled: rec.dateFiled,
      dateExecuted: rec.dateExecuted,
      expirationDate: rec.expirationDate,
      descriptor: rec.descriptor,
    },
  };
  const partial: GatewayRecordIds = {
    storageRef: rec.file.storageRef,
    salesforceDocumentRecordId: rec.salesforceDocumentRecordId,
    salesforceFileVersionId: rec.salesforceFileVersionId,
    laserficheEntryId: rec.laserficheEntryId,
  };
  let r;
  try {
    r = gateway.resume
      ? await gateway.resume(request, partial)
      : await gateway.upload(request);
  } catch {
    return fail("failed", "The retry failed.");
  }
  if (!r.ok)
    return fail("failed", "The retry did not complete.");
  const updated: YouthDocument = {
    ...rec,
    file: { ...rec.file, storageRef: r.storageRef },
    salesforceDocumentRecordId:
      r.salesforceDocumentRecordId ??
      rec.salesforceDocumentRecordId,
    salesforceFileVersionId:
      r.salesforceFileVersionId ?? rec.salesforceFileVersionId,
    laserficheEntryId:
      r.laserficheEntryId ?? rec.laserficheEntryId,
    syncState: r.syncState ?? "local-only",
  };
  if (
    !commit({
      ...state,
      documents: state.documents.map((d) =>
        d.id === id ? updated : d,
      ),
    })
  )
    return fail("storage");
  return { ok: true, value: updated };
}

// ── Edit (metadata only; the current file is always retained) ─────────

export interface UpdateDocumentInput {
  /** Verified Youth Constituent id (existing form) or … */
  youthId?: string;
  /** … the resolved scope the record must belong to. One of the two. */
  scope?: DocumentOwnerScope;
  documentType: string;
  documentName: string;
  restricted: boolean;
  dateExecuted: string;
  expirationDate: string;
  descriptor: string;
}

export async function updateYouthDocument(
  id: string,
  input: UpdateDocumentInput,
): Promise<DocResult> {
  const access = currentDocumentAccess();
  const editScope = toScope(input.scope ?? input.youthId);
  const rec = editScope
    ? state.documents.find(
        (d) => d.id === id && inScope(d, editScope),
      )
    : undefined;
  if (!rec) return fail("not-found");
  if (!canEditRecord(access, rec.restricted) || !access.actor)
    return fail(
      "denied",
      "You do not have permission to edit this document.",
    );

  const classificationChanged =
    input.documentType !== rec.documentType ||
    input.documentName !== rec.documentName;
  const restrictionChanged =
    input.restricted !== rec.restricted;
  if (restrictionChanged) {
    if (input.restricted && !can(access, "mark-restricted"))
      return fail(
        "denied",
        "You do not have permission to restrict documents.",
      );
    if (!input.restricted && !can(access, "unrestrict"))
      return fail(
        "denied",
        "You do not have permission to remove a restriction.",
      );
  }

  const errors = validateFormValues(
    { ...input, dateFiled: rec.dateFiled },
    "edit",
  );
  // PROVISIONAL safeguard pending the confirmed edit policy: an existing
  // populated Date Executed cannot be cleared. Already-blank (legacy or
  // imported) values may stay blank.
  if (rec.dateExecuted && !input.dateExecuted)
    errors.dateExecuted =
      "Date Executed cannot be cleared once it has been entered.";

  let entry: CatalogEntry | null = findCatalogEntry(
    rec.catalogEntryId,
  );
  let baseFolder = rec.baseFolder;
  let catalogEntryId = rec.catalogEntryId;
  let renewalStatus = rec.renewalStatus;
  if (classificationChanged) {
    // A classification change needs an approved mapping.
    if (getCatalog().status !== "available")
      return fail(
        "catalog-unavailable",
        "The document catalog is unavailable.",
      );
    entry = findEntryByTypeAndName(
      input.documentType,
      input.documentName,
    );
    if (!entry) {
      errors.documentName =
        "This Document Name is not approved for the selected type.";
    } else {
      baseFolder = entry.folder;
      catalogEntryId = entry.id;
      renewalStatus = renewalStatusOf(entry.renewal);
    }
  }
  if (Object.keys(errors).length > 0)
    return fail("validation", undefined, errors);

  // Expiration: from a confirmed rule when the record has one; a legacy or
  // unknown-rule record keeps its stored value untouched.
  let expirationDate = rec.expirationDate;
  // An edit that touches neither the classification nor the base date of the
  // renewal rule, and submits the stored expiration back unchanged, keeps
  // the stored value as-is: a manual override (or an older record that does
  // not say how its date was set) is never recomputed by an unrelated edit.
  const baseDateChanged =
    entry?.renewal.kind === "recurring" &&
    entry.renewal.base === "dateExecuted" &&
    (input.dateExecuted || null) !== (rec.dateExecuted ?? null);
  const keepStoredExpiration =
    !classificationChanged &&
    !baseDateChanged &&
    (input.expirationDate || "") === (rec.expirationDate ?? "");
  if (entry && !keepStoredExpiration) {
    const exp = resolveExpiration(entry, {
      dateExecuted: input.dateExecuted,
      dateFiled: rec.dateFiled,
      expirationDate: input.expirationDate,
    });
    if (!exp.ok)
      return fail("validation", undefined, {
        expirationDate: exp.message,
      });
    if (
      entry.renewal.kind === "recurring" ||
      entry.renewal.kind === "one-time"
    )
      expirationDate = exp.value;
    else if (classificationChanged) expirationDate = null;
  }

  let effectiveFolder = rec.effectiveFolder;
  if (restrictionChanged || classificationChanged) {
    if (input.restricted) {
      const rf = restrictedFolder();
      if (!rf)
        return fail(
          "validation",
          "The restricted folder is not configured.",
          {
            restricted: "Restricting documents is unavailable.",
          },
        );
      effectiveFolder = rf;
    } else effectiveFolder = baseFolder;
  }

  const updated: YouthDocument = {
    ...rec,
    documentType: input.documentType,
    documentName: input.documentName,
    catalogEntryId,
    baseFolder,
    effectiveFolder,
    restricted: input.restricted,
    dateExecuted: input.dateExecuted || null,
    expirationDate,
    renewalStatus,
    descriptor: input.descriptor.trim(),
    lastModifiedBy: access.actor.name,
    lastModifiedAt: new Date().toISOString(),
  };
  if (
    !commit({
      ...state,
      documents: state.documents.map((d) =>
        d.id === id ? updated : d,
      ),
    })
  )
    return fail(
      "storage",
      "Could not save the document. Your changes were kept.",
    );
  return { ok: true, value: updated };
}

// ── File retrieval ─────────────────────────────────────────────────────

export type FileResult =
  | { ok: true; content: Blob; document: YouthDocument }
  | {
      ok: false;
      reason: "not-found" | "denied" | "unavailable" | "error";
    };

/** Access is re-resolved here: a row that was visible earlier does not
 *  keep authorizing its file. */
export async function retrieveYouthDocumentFile(
  id: string,
  owner: OwnerArg,
): Promise<FileResult> {
  const scopeArg =
    typeof owner === "string"
      ? { youthId: owner }
      : { scope: owner };
  const r = resolveYouthDocument(id, scopeArg);
  if (!r.ok)
    return {
      ok: false,
      reason: r.reason === "denied" ? "denied" : "not-found",
    };
  const gateway = getDocumentGateway();
  if (!gateway) return { ok: false, reason: "unavailable" };
  try {
    const f = await gateway.retrieve(r.value.file.storageRef, {
      documentId: r.value.id,
      youthId: r.value.admissionId ? null : r.value.youthId,
      admissionId: r.value.admissionId ?? null,
    });
    if (!f.ok) return { ok: false, reason: f.reason };
    // Access may have changed while the file was in flight (e.g. the acting
    // persona switched): resolve again before handing the bytes back.
    const again = resolveYouthDocument(id, scopeArg);
    if (!again.ok)
      return {
        ok: false,
        reason:
          again.reason === "denied" ? "denied" : "not-found",
      };
    return {
      ok: true,
      content: f.content,
      document: again.value,
    };
  } catch {
    return { ok: false, reason: "error" };
  }
}

// ── Incoming events (Laserfiche → Salesforce record) ──────────────────
// Goes through the same catalog, access and persistence rules. The acting
// identity for integration events is NOT defined yet, so nothing is accepted
// until an integration actor provider is installed.

export interface IncomingDocumentEvent {
  /** Verified external document/event key — replays are no-ops. */
  eventKey: string;
  /** Trusted Youth Constituent id from integration metadata (never a name). */
  youthId: string;
  salesforceDocumentRecordId?: string | null;
  laserficheEntryId: string;
  documentType: string;
  documentName: string;
  restricted?: boolean;
  dateFiled: string;
  dateExecuted: string | null;
  descriptor?: string;
  file: {
    name: string;
    mediaType: string;
    sizeBytes: number;
    storageRef: string;
  };
}

export type IncomingResult =
  | {
      ok: true;
      documentId: string;
      duplicate: boolean;
      created: boolean;
    }
  | { ok: false; reason: DocumentDenial; message?: string };

let integrationAccess: (() => DocumentAccess) | null = null;
export function setIntegrationAccessProvider(
  p: (() => DocumentAccess) | null,
): void {
  integrationAccess = p;
}

export function applyIncomingDocumentEvent(
  ev: IncomingDocumentEvent,
): IncomingResult {
  if (!integrationAccess)
    return {
      ok: false,
      reason: "integration-unavailable",
      message: "The integration identity is not configured.",
    };
  const access = integrationAccess();
  if (!ev.eventKey)
    return {
      ok: false,
      reason: "validation",
      message: "Missing event key.",
    };
  const seen = state.events[ev.eventKey];
  if (seen)
    return {
      ok: true,
      documentId: seen,
      duplicate: true,
      created: false,
    };
  if (!resolveYouthConstituent(ev.youthId))
    return {
      ok: false,
      reason: "not-found",
      message: "Youth could not be verified.",
    };
  const entry = findEntryByTypeAndName(
    ev.documentType,
    ev.documentName,
  );
  if (!entry)
    return {
      ok: false,
      reason: "catalog-unavailable",
      message: "No approved catalog mapping.",
    };
  const target = state.documents.find(
    (d) =>
      d.youthId === ev.youthId &&
      ((ev.salesforceDocumentRecordId &&
        d.salesforceDocumentRecordId ===
          ev.salesforceDocumentRecordId) ||
        d.laserficheEntryId === ev.laserficheEntryId),
  );
  const restricted = !!ev.restricted;
  const folder = restricted ? restrictedFolder() : entry.folder;
  if (!folder || !access.actor)
    return { ok: false, reason: "denied" };
  if (!isValidIsoDate(ev.dateFiled))
    return {
      ok: false,
      reason: "validation",
      message: "Invalid Date Filed.",
    };
  if (ev.dateExecuted && !isValidIsoDate(ev.dateExecuted))
    return {
      ok: false,
      reason: "validation",
      message: "Invalid Date Executed.",
    };
  if (restricted && !can(access, "mark-restricted"))
    return { ok: false, reason: "denied" };
  const exp = resolveExpiration(entry, {
    dateExecuted: ev.dateExecuted ?? "",
    dateFiled: ev.dateFiled,
    expirationDate: "",
  });
  const expirationDate = exp.ok ? exp.value : null;
  const now = new Date().toISOString();
  let doc: YouthDocument;
  if (target) {
    if (!canEditRecord(access, target.restricted))
      return { ok: false, reason: "denied" };
    doc = {
      ...target,
      catalogEntryId: entry.id,
      documentType: ev.documentType,
      documentName: ev.documentName,
      baseFolder: entry.folder,
      effectiveFolder: folder,
      restricted,
      dateExecuted: ev.dateExecuted,
      expirationDate,
      renewalStatus: renewalStatusOf(entry.renewal),
      descriptor: ev.descriptor ?? target.descriptor,
      file: { ...ev.file },
      laserficheEntryId: ev.laserficheEntryId,
      salesforceDocumentRecordId:
        ev.salesforceDocumentRecordId ??
        target.salesforceDocumentRecordId,
      externalEventKey: ev.eventKey,
      lastModifiedBy: access.actor.name,
      lastModifiedAt: now,
    };
  } else {
    if (!can(access, "upload"))
      return { ok: false, reason: "denied" };
    doc = {
      id: nextId(),
      youthId: ev.youthId,
      catalogEntryId: entry.id,
      documentType: ev.documentType,
      documentName: ev.documentName,
      baseFolder: entry.folder,
      effectiveFolder: folder,
      restricted,
      dateFiled: ev.dateFiled,
      dateExecuted: ev.dateExecuted,
      expirationDate,
      renewalStatus: renewalStatusOf(entry.renewal),
      descriptor: ev.descriptor ?? "",
      file: { ...ev.file },
      salesforceDocumentRecordId:
        ev.salesforceDocumentRecordId ?? null,
      salesforceFileVersionId: null,
      laserficheEntryId: ev.laserficheEntryId,
      sourceSystem: "laserfiche",
      syncState: "synced",
      externalEventKey: ev.eventKey,
      createdBy: access.actor.name,
      createdAt: now,
      lastModifiedBy: access.actor.name,
      lastModifiedAt: now,
    };
  }
  const documents = target
    ? state.documents.map((d) => (d.id === target.id ? doc : d))
    : [...state.documents, doc];
  if (
    !commit({
      documents,
      events: { ...state.events, [ev.eventKey]: doc.id },
      nextSeq: target ? state.nextSeq : state.nextSeq + 1,
    })
  )
    return { ok: false, reason: "storage" };
  return {
    ok: true,
    documentId: doc.id,
    duplicate: false,
    created: !target,
  };
}

/** Default Date Filed for a new upload: today, in the app's local date. */
export function defaultDateFiled(): string {
  return todayIso();
}

/** Test-only reset. */
export function resetYouthDocumentStore(): void {
  commit({ documents: [], events: {}, nextSeq: 1 });
  inflight.clear();
}