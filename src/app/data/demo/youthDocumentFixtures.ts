// DEMO / TEST FIXTURES ONLY (US 20147). Not business configuration.
//
// Everything here is synthetic. The names, folders and renewal rules below
// are made up to exercise the Documents list/modals; they are NOT the
// approved catalog and prove nothing about which names, folders or renewal
// frequencies the business approved. The prototype gateway keeps fictional
// files in this browser (IndexedDB) and is NOT Salesforce or Laserfiche.

import { setCatalogProvider } from "../youthDocumentCatalog";
import {
  setDocumentGateway,
  type DocumentGateway,
  type GatewayFetchResult,
  type GatewayUploadRequest,
  type GatewayUploadResult,
  type UploadPolicy,
} from "../youthDocumentGateway";
import type {
  CatalogEntry,
  CatalogProvider,
  DocumentAccess,
  DocumentCapability,
} from "../youthDocumentTypes";

export const DEMO_RESTRICTED_FOLDER = "Demo Restricted Folder";

const slug = (t: string) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Synthetic entries for the Document Types the hand-written entries below do
// not cover, so every type in the picklist has something to choose in the
// demo. Names, folders and rules are MADE UP (prefixed "Demo", never reused as
// approved data): each type gets a one-time name plus a recurring or
// unknown-rule name, with a spread of periods and base dates.
type Rule = CatalogEntry["renewal"];
const recurring = (
  every: number,
  unit: "day" | "week" | "month" | "year",
  base: "dateExecuted" | "dateFiled",
  staffOverride = false,
): Rule => ({
  kind: "recurring",
  every,
  unit,
  base,
  monthEnd: "clamp",
  staffOverride,
});
const FOLDERS = [
  "Demo Folder D",
  "Demo Folder E",
  "Demo Folder F",
  "Demo Folder G",
];
const generatedEntries = (
  specs: ReadonlyArray<readonly [string, string, Rule]>,
): CatalogEntry[] =>
  specs.flatMap(([type, suffix, rule], i) => [
    {
      id: `demo-${slug(type)}-onetime`,
      documentType: type,
      documentName: `Demo ${type} Record (one-time)`,
      folder: FOLDERS[i % FOLDERS.length],
      renewal: { kind: "one-time" } as Rule,
    },
    {
      id: `demo-${slug(type)}-${slug(suffix)}`,
      documentType: type,
      documentName: `Demo ${type} ${suffix}`,
      folder: FOLDERS[(i + 1) % FOLDERS.length],
      renewal: rule,
    },
  ]);

export const DEMO_CATALOG_ENTRIES: CatalogEntry[] = [
  {
    id: "demo-consent-annual",
    documentType: "Consent/Agreement",
    documentName: "Demo Consent (annual)",
    folder: "Demo Folder A",
    renewal: {
      kind: "recurring",
      every: 1,
      unit: "year",
      base: "dateExecuted",
      monthEnd: "clamp",
      staffOverride: false,
    },
  },
  {
    id: "demo-consent-onetime",
    documentType: "Consent/Agreement",
    documentName: "Demo Consent (one-time)",
    folder: "Demo Folder A",
    renewal: { kind: "one-time" },
  },
  {
    id: "demo-consent-unknown",
    documentType: "Consent/Agreement",
    documentName: "Demo Consent (rule unknown)",
    folder: "Demo Folder B",
    renewal: { kind: "unknown" },
  },
  {
    id: "demo-education-quarterly",
    documentType: "Education & Employment",
    documentName: "KBIT",
    folder: "Testing & Assessments",
    renewal: {
      kind: "recurring",
      every: 6,
      unit: "month",
      base: "dateFiled",
      monthEnd: "clamp",
      staffOverride: true,
    },
  },
  {
    id: "demo-legal-onetime",
    documentType: "Legal",
    documentName: "Court Paperwork",
    folder: "Legal Records",
    renewal: { kind: "one-time" },
  },
  {
    id: "identification-birth-certificate",
    documentType: "Identification",
    documentName: "Birth Certificate",
    folder: "Identification Records",
    renewal: { kind: "unknown" },
  },
  {
    id: "identification-social-security-card",
    documentType: "Identification",
    documentName: "Social Security Card",
    folder: "Identification Records - Restricted Identification Records",
    renewal: { kind: "unknown" },
  },
  {
    id: "identification-mhbg-id-card",
    documentType: "Identification",
    documentName: "MHBG ID Card",
    folder: "Identification Records",
    renewal: { kind: "unknown" },
  },
  {
    id: "identification-guardian-state-drivers-license",
    documentType: "Identification",
    documentName: "Guardian State Driver's License",
    folder: "Identification Records",
    renewal: { kind: "unknown" },
  },
  {
    id: "identification-youth-id",
    documentType: "Identification",
    documentName: "Youth ID",
    folder: "Identification Records",
    renewal: { kind: "unknown" },
  },
  {
    id: "identification-agency-photo",
    documentType: "Identification",
    documentName: "Agency Photo",
    folder: "Identification Records",
    renewal: { kind: "unknown" },
  },
  ...generatedEntries([
    ["Consent/Agreement - CC", "Annual (1 year)", recurring(1, "year", "dateExecuted")],
    ["Consent/Agreement - Medication", "Authorization (6 months)", recurring(6, "month", "dateExecuted")],
    ["Financial/Housing", "Review (annual)", recurring(1, "year", "dateExecuted")],
    ["Financial/Housing - CC", "Review (annual)", recurring(1, "year", "dateExecuted")],
    ["Health & Medical", "Update (annual, overridable)", recurring(1, "year", "dateFiled", true)],
    ["Mental Health", "Update (annual)", recurring(1, "year", "dateExecuted")],
    ["Miscellaneous", "Record (rule unknown)", { kind: "unknown" }],
    ["Release of Information", "Authorization (6 months)", recurring(6, "month", "dateExecuted")],
    ["Test/Assessment", "Result (90 days)", recurring(90, "day", "dateExecuted")],
    ["Treatment Planning", "Review (90 days)", recurring(90, "day", "dateExecuted")],
  ]),
];

export const demoCatalogProvider: CatalogProvider = {
  label: "DEMO catalog, synthetic, not approved",
  approved: false,
  getCatalog: () => ({
    status: "available",
    entries: DEMO_CATALOG_ENTRIES,
    restrictedFolder: DEMO_RESTRICTED_FOLDER,
  }),
};

const caps = (...c: DocumentCapability[]) =>
  new Set<DocumentCapability>(c);

/** Test personas. NOT a role policy. */
export const TEST_ACTOR = {
  id: "test-user",
  name: "Test User",
};
export const TEST_ACCESS_BASELINE: DocumentAccess = {
  actor: TEST_ACTOR,
  capabilities: caps("view", "upload", "edit"),
};
export const TEST_ACCESS_RESTRICTED_ALL: DocumentAccess = {
  actor: TEST_ACTOR,
  capabilities: caps(
    "view",
    "upload",
    "edit",
    "view-restricted",
    "mark-restricted",
    "edit-restricted",
    "unrestrict",
  ),
};
export const TEST_ACCESS_READ_ONLY: DocumentAccess = {
  actor: TEST_ACTOR,
  capabilities: caps("view"),
};
export const TEST_ACCESS_NONE: DocumentAccess = {
  actor: null,
  capabilities: caps(),
};

// ── Gateways ───────────────────────────────────────────────────────────

export interface PrototypeGatewayOptions {
  maxBytes?: number | null;
  directUploadUrl?: string | null;
}

abstract class BaseGateway implements DocumentGateway {
  /** Browser-prototype storage can hold any owner's files; a real gateway
   *  must opt in once its Admissions contract exists. */
  supportsAdmissionOwner = true;
  uploads: GatewayUploadRequest[] = [];
  constructor(protected opts: PrototypeGatewayOptions = {}) {}
  getUploadPolicy(): UploadPolicy {
    return {
      maxBytes: this.opts.maxBytes ?? null,
      directUploadUrl: this.opts.directUploadUrl ?? null,
    };
  }
  abstract putFile(key: string, file: Blob): Promise<void>;
  abstract getFile(key: string): Promise<Blob | null>;
  async upload(
    req: GatewayUploadRequest,
  ): Promise<GatewayUploadResult> {
    this.uploads.push(req);
    const storageRef = `proto-file:${req.documentKey}:${
      globalThis.crypto?.randomUUID?.() ?? Date.now()
    }`;
    await this.putFile(storageRef, req.file);
    // External ids stay empty: nothing real was contacted.
    return { ok: true, storageRef, syncState: "local-only" };
  }
  async retrieve(
    storageRef: string,
  ): Promise<GatewayFetchResult> {
    try {
      const b = await this.getFile(storageRef);
      return b
        ? { ok: true, content: b }
        : { ok: false, reason: "not-found" };
    } catch {
      return { ok: false, reason: "error" };
    }
  }
}

/** In-memory (tests / no IndexedDB). */
export class MemoryGateway extends BaseGateway {
  files = new Map<string, Blob>();
  async putFile(k: string, f: Blob) {
    this.files.set(k, f);
  }
  async getFile(k: string) {
    return this.files.get(k) ?? null;
  }
}

/** Browser prototype: fictional file bytes in IndexedDB, never
 *  localStorage, never a blob URL as the durable reference. */
export class IndexedDbGateway extends BaseGateway {
  private db: Promise<IDBDatabase> | null = null;
  private open(): Promise<IDBDatabase> {
    this.db ??= new Promise((res, rej) => {
      const r = indexedDB.open(
        "mh-youth-documents-prototype",
        1,
      );
      r.onupgradeneeded = () =>
        r.result.createObjectStore("files");
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return this.db;
  }
  async putFile(k: string, f: Blob) {
    const db = await this.open();
    await new Promise<void>((res, rej) => {
      const tx = db.transaction("files", "readwrite");
      tx.objectStore("files").put(f, k);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }
  async getFile(k: string) {
    const db = await this.open();
    return new Promise<Blob | null>((res, rej) => {
      const r = db
        .transaction("files")
        .objectStore("files")
        .get(k);
      r.onsuccess = () => res((r.result as Blob) ?? null);
      r.onerror = () => rej(r.error);
    });
  }
}

let installed = false;
/** Install the demo catalog + browser prototype gateway (idempotent). */
export function installYouthDocumentsDemo(): void {
  if (installed) return;
  installed = true;
  setCatalogProvider(demoCatalogProvider);
  if (typeof indexedDB !== "undefined")
    setDocumentGateway(new IndexedDbGateway());
}

// END OF FILE: youthDocumentFixtures.ts