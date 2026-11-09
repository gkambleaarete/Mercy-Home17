import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyIncomingDocumentEvent,
  createYouthDocument,
  listIncompleteUploads,
  listYouthDocuments,
  resetYouthDocumentStore,
  resolveYouthDocument,
  retrieveYouthDocumentFile,
  resolveExpiration,
  retryIncompleteUpload,
  setIntegrationAccessProvider,
  updateYouthDocument,
  type CreateDocumentInput,
} from "./youthDocumentStore";
import {
  calculateExpiration,
  namesForType,
  setCatalogProvider,
} from "./youthDocumentCatalog";
import { DOCUMENT_TYPES } from "./youthDocumentTypes";
import { setDocumentAccessProvider } from "./youthDocumentAccess";
import { ALL_LEADS } from "./mockLeadsData";
import { admissionScope, youthScope } from "../lib/youthDocumentOwner";
import {
  setDocumentGateway,
  type GatewayUploadResult,
} from "./youthDocumentGateway";
import {
  DEMO_CATALOG_ENTRIES,
  demoCatalogProvider,
  DEMO_RESTRICTED_FOLDER,
  MemoryGateway,
  TEST_ACCESS_BASELINE,
  TEST_ACCESS_NONE,
  TEST_ACCESS_READ_ONLY,
  TEST_ACCESS_RESTRICTED_ALL,
} from "./demo/youthDocumentFixtures";

// FIXTURE-LEVEL TESTS. The catalog, folders, renewal rules and access
// personas below are synthetic (data/demo). These tests prove the
// MECHANISM — grouping data, rules, isolation, idempotency — not that the
// business approved any of these names, folders or policies. The gateway is
// an in-memory stand-in: nothing here touches Salesforce or Laserfiche.

const Y1 = "1"; // Emily Johnson (Youth constituent)
const Y2 = "2"; // Michael Rodriguez (Youth constituent)

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4]);
const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 1, 2, 3]);
const mkFile = (bytes: Uint8Array, name: string, type: string) =>
  new File([bytes], name, { type });

let seq = 0;
function input(
  over: Partial<CreateDocumentInput> = {},
): CreateDocumentInput {
  return {
    youthId: Y1,
    requestId: `req-${++seq}`,
    documentType: "Consent/Agreement",
    documentName: "Demo Consent (annual)",
    restricted: false,
    dateFiled: "2026-03-10",
    dateExecuted: "2026-03-01",
    expirationDate: "",
    descriptor: "",
    file: mkFile(PDF, "a.pdf", "application/pdf"),
    ...over,
  };
}

let gw: MemoryGateway;
beforeEach(() => {
  window.localStorage.clear();
  gw = new MemoryGateway();
  setDocumentGateway(gw);
  setCatalogProvider(demoCatalogProvider);
  setDocumentAccessProvider(() => TEST_ACCESS_BASELINE);
  setIntegrationAccessProvider(null);
  resetYouthDocumentStore();
});

describe("create / isolation / duplicates", () => {
  it("two uploads of the same type+name create two records", async () => {
    const a = await createYouthDocument(input());
    const b = await createYouthDocument(input());
    expect(a.ok && b.ok).toBe(true);
    const list = listYouthDocuments(Y1);
    expect(list).toHaveLength(2);
    expect(new Set(list.map((d) => d.id)).size).toBe(2);
  });

  it("scopes records to the Youth", async () => {
    await createYouthDocument(input());
    await createYouthDocument(input({ youthId: Y2 }));
    expect(listYouthDocuments(Y1)).toHaveLength(1);
    expect(listYouthDocuments(Y2)).toHaveLength(1);
    const d = listYouthDocuments(Y1)[0];
    expect(resolveYouthDocument(d.id, { youthId: Y2 })).toMatchObject({
      ok: false,
      reason: "not-found",
    });
  });

  it("rejects an unverified Youth", async () => {
    const r = await createYouthDocument(input({ youthId: "999999" }));
    expect(r).toMatchObject({ ok: false, reason: "not-found" });
  });

  it("a duplicate submit with the same requestId creates one record", async () => {
    const i = input();
    const [a, b] = await Promise.all([
      createYouthDocument(i),
      createYouthDocument(i),
    ]);
    expect(a.ok && b.ok).toBe(true);
    expect(listYouthDocuments(Y1)).toHaveLength(1);
    expect(gw.uploads).toHaveLength(1);
  });

  it("keeps external ids empty and the internal id distinct", async () => {
    const r = await createYouthDocument(input());
    if (!r.ok) throw new Error("expected ok");
    expect(r.value.salesforceDocumentRecordId).toBeNull();
    expect(r.value.salesforceFileVersionId).toBeNull();
    expect(r.value.laserficheEntryId).toBeNull();
    expect(r.value.syncState).toBe("local-only");
  });
});

describe("catalog boundary", () => {
  it("a name outside the catalog cannot create a record", async () => {
    const r = await createYouthDocument(
      input({ documentName: "Invented Name" }),
    );
    expect(r).toMatchObject({ ok: false, reason: "validation" });
    expect(listYouthDocuments(Y1)).toHaveLength(0);
  });

  it("an unavailable catalog blocks creation without fabricating", async () => {
    setCatalogProvider(null); // approved provider: unavailable
    const r = await createYouthDocument(input());
    expect(r).toMatchObject({ ok: false, reason: "catalog-unavailable" });
    expect(listYouthDocuments(Y1)).toHaveLength(0);
  });

  it("name from a different type is refused", async () => {
    const r = await createYouthDocument(
      input({ documentType: "Legal", documentName: "Demo Consent (annual)" }),
    );
    expect(r).toMatchObject({ ok: false, reason: "validation" });
  });
});

describe("required fields", () => {
  it("requires Date Executed, Date Filed and a file on create", async () => {
    const r = await createYouthDocument(
      input({ dateExecuted: "", dateFiled: "", file: null }),
    );
    expect(r).toMatchObject({ ok: false, reason: "validation" });
    if (!r.ok) {
      expect(r.fieldErrors).toHaveProperty("dateExecuted");
      expect(r.fieldErrors).toHaveProperty("dateFiled");
      expect(r.fieldErrors).toHaveProperty("file");
    }
  });

  it("rejects an invalid calendar date", async () => {
    const r = await createYouthDocument(
      input({ dateExecuted: "2026-02-30" }),
    );
    expect(r).toMatchObject({ ok: false, reason: "validation" });
  });

  it("accepts PNG and PDF, rejects a spoofed or unsupported file", async () => {
    expect(
      (await createYouthDocument(
        input({ file: mkFile(PNG, "a.png", "image/png") }),
      )).ok,
    ).toBe(true);
    // PDF bytes labelled as PNG: declared type does not match content.
    const spoof = await createYouthDocument(
      input({ file: mkFile(PDF, "x.png", "image/png") }),
    );
    expect(spoof).toMatchObject({ ok: false, reason: "validation" });
    const txt = await createYouthDocument(
      input({ file: mkFile(new Uint8Array([65, 66]), "a.txt", "text/plain") }),
    );
    expect(txt).toMatchObject({ ok: false, reason: "validation" });
  });
});

describe("configured upload size", () => {
  it("enforces only a limit the gateway reports", async () => {
    gw = new MemoryGateway({ maxBytes: 4 });
    setDocumentGateway(gw);
    const r = await createYouthDocument(input());
    expect(r).toMatchObject({ ok: false, reason: "validation" });
    if (!r.ok) expect(r.fieldErrors?.file).toBe("TOO_LARGE");
  });

  it("assumes no limit when none is configured", async () => {
    expect((await createYouthDocument(input())).ok).toBe(true);
  });
});

describe("renewal rules", () => {
  it("one-time leaves expiration blank", async () => {
    const r = await createYouthDocument(
      input({ documentName: "Demo Consent (one-time)", expirationDate: "2030-01-01" }),
    );
    if (!r.ok) throw new Error("expected ok");
    expect(r.value.expirationDate).toBeNull();
    expect(r.value.renewalStatus).toBe("one-time");
  });

  it("unknown rule is not one-time and stores no expiration", async () => {
    const r = await createYouthDocument(
      input({ documentName: "Demo Consent (rule unknown)" }),
    );
    if (!r.ok) throw new Error("expected ok");
    expect(r.value.expirationDate).toBeNull();
    expect(r.value.renewalStatus).toBe("unknown");
  });

  it("recurring calculates from the rule's base date", async () => {
    const r = await createYouthDocument(input());
    if (!r.ok) throw new Error("expected ok");
    expect(r.value.expirationDate).toBe("2027-03-01");
    expect(r.value.renewalStatus).toBe("recurring");
  });

  it("calculated value is not overridable unless the rule allows it", async () => {
    const r = await createYouthDocument(
      input({ expirationDate: "2099-01-01" }),
    );
    if (!r.ok) throw new Error("expected ok");
    expect(r.value.expirationDate).toBe("2027-03-01");
    const o = await createYouthDocument(
      input({
        documentType: "Education & Employment",
        documentName: "KBIT",
        expirationDate: "2026-12-31",
      }),
    );
    if (!o.ok) throw new Error("expected ok");
    expect(o.value.expirationDate).toBe("2026-12-31");
  });

  it("clamps month ends and handles leap years", () => {
    const rule = {
      kind: "recurring",
      every: 1,
      unit: "month",
      base: "dateFiled",
      monthEnd: "clamp",
      staffOverride: false,
    } as const;
    const calc = (d: string) =>
      calculateExpiration(rule, { dateFiled: d, dateExecuted: null });
    expect(calc("2026-01-31")).toBe("2026-02-28");
    expect(calc("2028-01-31")).toBe("2028-02-29");
    expect(calc("2026-12-15")).toBe("2027-01-15");
    expect(
      calculateExpiration(
        { ...rule, every: 1, unit: "year" },
        { dateFiled: "2028-02-29", dateExecuted: null },
      ),
    ).toBe("2029-02-28");
  });

  it("unknown / one-time / missing base never produce a date", () => {
    expect(
      calculateExpiration({ kind: "unknown" }, { dateFiled: "2026-01-01", dateExecuted: "2026-01-01" }),
    ).toBeNull();
    expect(
      calculateExpiration({ kind: "one-time" }, { dateFiled: "2026-01-01", dateExecuted: "2026-01-01" }),
    ).toBeNull();
  });
});

describe("access", () => {
  it("restricted documents are hidden and unreadable without capability", async () => {
    setDocumentAccessProvider(() => TEST_ACCESS_RESTRICTED_ALL);
    const r = await createYouthDocument(input({ restricted: true }));
    if (!r.ok) throw new Error("expected ok");
    expect(r.value.effectiveFolder).toBe(DEMO_RESTRICTED_FOLDER);
    expect(r.value.baseFolder).toBe("Demo Folder A");
    expect(listYouthDocuments(Y1)).toHaveLength(1);

    setDocumentAccessProvider(() => TEST_ACCESS_BASELINE);
    expect(listYouthDocuments(Y1)).toHaveLength(0);
    expect(resolveYouthDocument(r.value.id)).toMatchObject({
      ok: false,
      reason: "denied",
    });
    expect(
      await retrieveYouthDocumentFile(r.value.id, Y1),
    ).toMatchObject({ ok: false, reason: "denied" });
    const e = await updateYouthDocument(r.value.id, {
      youthId: Y1,
      documentType: r.value.documentType,
      documentName: r.value.documentName,
      restricted: true,
      dateExecuted: "2026-03-01",
      expirationDate: "",
      descriptor: "x",
    });
    expect(e).toMatchObject({ ok: false, reason: "denied" });
  });

  it("restricted capabilities are denied by default (no role assumed)", async () => {
    const r = await createYouthDocument(input({ restricted: true }));
    expect(r).toMatchObject({ ok: false, reason: "denied" });
  });

  it("read-only and anonymous users cannot upload or edit", async () => {
    const a = await createYouthDocument(input());
    if (!a.ok) throw new Error("expected ok");
    setDocumentAccessProvider(() => TEST_ACCESS_READ_ONLY);
    expect(await createYouthDocument(input())).toMatchObject({ ok: false, reason: "denied" });
    expect(
      await updateYouthDocument(a.value.id, {
        youthId: Y1,
        documentType: a.value.documentType,
        documentName: a.value.documentName,
        restricted: false,
        dateExecuted: "2026-03-01",
        expirationDate: "",
        descriptor: "n",
      }),
    ).toMatchObject({ ok: false, reason: "denied" });
    setDocumentAccessProvider(() => TEST_ACCESS_NONE);
    expect(listYouthDocuments(Y1)).toHaveLength(0);
  });

  it("removing a restriction needs its own capability", async () => {
    setDocumentAccessProvider(() => TEST_ACCESS_RESTRICTED_ALL);
    const r = await createYouthDocument(input({ restricted: true }));
    if (!r.ok) throw new Error("expected ok");
    setDocumentAccessProvider(() => ({
      ...TEST_ACCESS_RESTRICTED_ALL,
      capabilities: new Set(["view", "edit", "view-restricted", "edit-restricted"]),
    }));
    const e = await updateYouthDocument(r.value.id, {
      youthId: Y1,
      documentType: r.value.documentType,
      documentName: r.value.documentName,
      restricted: false,
      dateExecuted: "2026-03-01",
      expirationDate: "",
      descriptor: "",
    });
    expect(e).toMatchObject({ ok: false, reason: "denied" });
  });
});

describe("edit", () => {
  it("keeps id, file, creation audit and Date Filed; updates modification audit", async () => {
    const r = await createYouthDocument(input());
    if (!r.ok) throw new Error("expected ok");
    const before = r.value;
    setDocumentAccessProvider(() => ({
      ...TEST_ACCESS_BASELINE,
      actor: { id: "u2", name: "Second Editor" },
    }));
    const e = await updateYouthDocument(before.id, {
      youthId: Y1,
      documentType: before.documentType,
      documentName: before.documentName,
      restricted: false,
      dateExecuted: "2026-03-05",
      expirationDate: "",
      descriptor: "Updated",
    });
    if (!e.ok) throw new Error("expected ok");
    const d = e.value;
    expect(d.id).toBe(before.id);
    expect(d.file).toEqual(before.file);
    expect(d.dateFiled).toBe(before.dateFiled);
    expect(d.createdBy).toBe(before.createdBy);
    expect(d.createdAt).toBe(before.createdAt);
    expect(d.lastModifiedBy).toBe("Second Editor");
    expect(d.descriptor).toBe("Updated");
    expect(d.expirationDate).toBe("2027-03-05"); // recalculated from new base
    // A second consumer resolves the same record with the edit.
    const c = resolveYouthDocument(before.id, { youthId: Y1 });
    expect(c.ok && c.value.descriptor).toBe("Updated");
  });

  it("failed validation changes nothing and leaves audit untouched", async () => {
    const r = await createYouthDocument(input());
    if (!r.ok) throw new Error("expected ok");
    const e = await updateYouthDocument(r.value.id, {
      youthId: Y1,
      documentType: "Consent/Agreement",
      documentName: "Not In Catalog",
      restricted: false,
      dateExecuted: "2026-03-01",
      expirationDate: "",
      descriptor: "changed",
    });
    expect(e).toMatchObject({ ok: false, reason: "validation" });
    const c = resolveYouthDocument(r.value.id);
    expect(c.ok && c.value).toEqual(r.value);
  });

  it("preserves a legacy entry absent from the catalog; reclassifying needs a mapping", async () => {
    const r = await createYouthDocument(input());
    if (!r.ok) throw new Error("expected ok");
    // Simulate a legacy record: catalog no longer lists its entry.
    setCatalogProvider({
      label: "x",
      approved: false,
      getCatalog: () => ({
        status: "available",
        entries: [],
        restrictedFolder: null,
      }),
    });
    const keep = await updateYouthDocument(r.value.id, {
      youthId: Y1,
      documentType: r.value.documentType,
      documentName: r.value.documentName,
      restricted: false,
      dateExecuted: "2026-03-01",
      expirationDate: "",
      descriptor: "kept",
    });
    if (!keep.ok) throw new Error("expected ok");
    expect(keep.value.documentName).toBe("Demo Consent (annual)");
    expect(keep.value.baseFolder).toBe("Demo Folder A");
    expect(keep.value.expirationDate).toBe("2027-03-01");
    const re = await updateYouthDocument(r.value.id, {
      youthId: Y1,
      documentType: "Legal",
      documentName: "Court Paperwork",
      restricted: false,
      dateExecuted: "2026-03-01",
      expirationDate: "",
      descriptor: "",
    });
    expect(re).toMatchObject({ ok: false, reason: "validation" });
  });

  it("PROVISIONAL: refuses to clear an already-populated Date Executed", async () => {
    const r = await createYouthDocument(
      input({ documentName: "Demo Consent (one-time)" }),
    );
    if (!r.ok) throw new Error("expected ok");
    const e = await updateYouthDocument(r.value.id, {
      youthId: Y1,
      documentType: r.value.documentType,
      documentName: r.value.documentName,
      restricted: false,
      dateExecuted: "",
      expirationDate: "",
      descriptor: "",
    });
    expect(e).toMatchObject({
      ok: false,
      reason: "validation",
      fieldErrors: { dateExecuted: expect.any(String) },
    });
    expect(listYouthDocuments(Y1)[0].dateExecuted).toBe("2026-03-01");
  });

  it("keeps a legacy blank Date Executed blank on edit", async () => {
    setIntegrationAccessProvider(() => ({
      ...TEST_ACCESS_BASELINE,
      actor: { id: "integration", name: "Integration" },
    }));
    const inc = applyIncomingDocumentEvent({
      eventKey: "evt-legacy",
      youthId: Y1,
      laserficheEntryId: "LF-9",
      documentType: "Legal",
      documentName: "Court Paperwork",
      dateFiled: "2026-04-01",
      dateExecuted: null,
      file: {
        name: "in.pdf",
        mediaType: "application/pdf",
        sizeBytes: 10,
        storageRef: "lf:9",
      },
    });
    if (!inc.ok) throw new Error("expected ok");
    const e = await updateYouthDocument(inc.documentId, {
      youthId: Y1,
      documentType: "Legal",
      documentName: "Court Paperwork",
      restricted: false,
      dateExecuted: "",
      expirationDate: "",
      descriptor: "edited",
    });
    expect(e.ok && e.value.dateExecuted).toBeNull();
  });

  it("is refused for another Youth's record", async () => {
    const r = await createYouthDocument(input());
    if (!r.ok) throw new Error("expected ok");
    const e = await updateYouthDocument(r.value.id, {
      youthId: Y2,
      documentType: "Consent/Agreement",
      documentName: "Demo Consent (annual)",
      restricted: false,
      dateExecuted: "2026-03-01",
      expirationDate: "",
      descriptor: "",
    });
    expect(e).toMatchObject({ ok: false, reason: "not-found" });
  });
});

describe("file retrieval", () => {
  it("returns the stored bytes for an authorized record", async () => {
    const r = await createYouthDocument(input());
    if (!r.ok) throw new Error("expected ok");
    const f = await retrieveYouthDocumentFile(r.value.id, Y1);
    expect(f.ok).toBe(true);
    if (f.ok) expect(f.content.size).toBe(PDF.length);
  });

  it("reports unavailable with no gateway and not-found for another Youth", async () => {
    const r = await createYouthDocument(input());
    if (!r.ok) throw new Error("expected ok");
    expect(await retrieveYouthDocumentFile(r.value.id, Y2)).toMatchObject({
      ok: false,
      reason: "not-found",
    });
    setDocumentGateway(null);
    expect(await retrieveYouthDocumentFile(r.value.id, Y1)).toMatchObject({
      ok: false,
      reason: "unavailable",
    });
  });
});

describe("access changing mid-operation", () => {
  it("a file in flight is withheld if access is lost before it returns", async () => {
    setDocumentAccessProvider(() => TEST_ACCESS_RESTRICTED_ALL);
    const r = await createYouthDocument(input({ restricted: true }));
    if (!r.ok) throw new Error("expected ok");
    const realRetrieve = gw.retrieve.bind(gw);
    gw.retrieve = async (ref: string, ctx: { documentId: string; youthId: string }) => {
      const out = await realRetrieve(ref);
      // Persona switches while the bytes are being fetched.
      setDocumentAccessProvider(() => TEST_ACCESS_BASELINE);
      return out;
    };
    expect(await retrieveYouthDocumentFile(r.value.id, Y1)).toMatchObject({
      ok: false,
      reason: "denied",
    });
  });

  it("an upload is not saved if upload access is lost while it runs", async () => {
    const real = gw.upload.bind(gw);
    gw.upload = async (req) => {
      const out = await real(req);
      setDocumentAccessProvider(() => TEST_ACCESS_READ_ONLY);
      return out;
    };
    const r = await createYouthDocument(input());
    expect(r).toMatchObject({ ok: false, reason: "denied" });
    setDocumentAccessProvider(() => TEST_ACCESS_BASELINE);
    expect(listYouthDocuments(Y1)).toHaveLength(0);
  });

  it("switching away hides restricted rows but keeps the saved records", async () => {
    setDocumentAccessProvider(() => TEST_ACCESS_RESTRICTED_ALL);
    await createYouthDocument(input({ restricted: true }));
    await createYouthDocument(input());
    expect(listYouthDocuments(Y1)).toHaveLength(2);
    setDocumentAccessProvider(() => TEST_ACCESS_BASELINE);
    expect(listYouthDocuments(Y1)).toHaveLength(1);
    setDocumentAccessProvider(() => TEST_ACCESS_RESTRICTED_ALL);
    expect(listYouthDocuments(Y1)).toHaveLength(2);
  });
});

describe("failure and partial states", () => {
  it("no gateway: nothing is saved and no success is reported", async () => {
    setDocumentGateway(null);
    const r = await createYouthDocument(input());
    expect(r).toMatchObject({ ok: false, reason: "integration-unavailable" });
    expect(listYouthDocuments(Y1)).toHaveLength(0);
  });

  it("a rejected upload saves nothing", async () => {
    gw.upload = async (): Promise<GatewayUploadResult> => ({
      ok: false,
      reason: "boom",
      retryable: true,
    });
    const r = await createYouthDocument(input());
    expect(r.ok).toBe(false);
    expect(listYouthDocuments(Y1)).toHaveLength(0);
  });

  it("a partial upload is kept unlisted and a retry completes it once", async () => {
    const real = gw.upload.bind(gw);
    let first = true;
    gw.upload = async (req): Promise<GatewayUploadResult> => {
      if (first) {
        first = false;
        return {
          ok: false,
          reason: "laserfiche down",
          retryable: true,
          partial: { storageRef: "partial-ref", salesforceDocumentRecordId: "SF-1" },
        };
      }
      return real(req);
    };
    const f = mkFile(PDF, "a.pdf", "application/pdf");
    const r = await createYouthDocument(input({ file: f }));
    expect(r.ok).toBe(false);
    expect(listYouthDocuments(Y1)).toHaveLength(0);
    const inc = listIncompleteUploads(Y1);
    expect(inc).toHaveLength(1);
    expect(inc[0].salesforceDocumentRecordId).toBe("SF-1");
    const done = await retryIncompleteUpload(inc[0].id, Y1, f);
    expect(done.ok).toBe(true);
    expect(listYouthDocuments(Y1)).toHaveLength(1);
    expect(listIncompleteUploads(Y1)).toHaveLength(0);
    expect(listYouthDocuments(Y1)[0].salesforceDocumentRecordId).toBe("SF-1");
  });
});

describe("incoming events", () => {
  const ev = (over = {}) => ({
    eventKey: "evt-1",
    youthId: Y1,
    laserficheEntryId: "LF-100",
    documentType: "Legal",
    documentName: "Court Paperwork",
    dateFiled: "2026-04-01",
    dateExecuted: null,
    file: {
      name: "in.pdf",
      mediaType: "application/pdf",
      sizeBytes: 10,
      storageRef: "lf:100",
    },
    ...over,
  });

  it("is rejected until an integration identity is configured", () => {
    expect(applyIncomingDocumentEvent(ev())).toMatchObject({
      ok: false,
      reason: "integration-unavailable",
    });
  });

  it("replaying the same event does not duplicate; blank Date Executed is kept", () => {
    setIntegrationAccessProvider(() => ({
      ...TEST_ACCESS_BASELINE,
      actor: { id: "integration", name: "Integration" },
    }));
    const a = applyIncomingDocumentEvent(ev());
    const b = applyIncomingDocumentEvent(ev());
    expect(a).toMatchObject({ ok: true, created: true, duplicate: false });
    expect(b).toMatchObject({ ok: true, duplicate: true });
    const list = listYouthDocuments(Y1);
    expect(list).toHaveLength(1);
    expect(list[0].dateExecuted).toBeNull();
    expect(list[0].laserficheEntryId).toBe("LF-100");
    expect(list[0].sourceSystem).toBe("laserfiche");
  });

  it("distinct events for the same type stay separate; same Laserfiche entry updates", () => {
    setIntegrationAccessProvider(() => ({
      ...TEST_ACCESS_BASELINE,
      actor: { id: "integration", name: "Integration" },
    }));
    applyIncomingDocumentEvent(ev());
    applyIncomingDocumentEvent(
      ev({ eventKey: "evt-2", laserficheEntryId: "LF-200" }),
    );
    expect(listYouthDocuments(Y1)).toHaveLength(2);
    const u = applyIncomingDocumentEvent(
      ev({ eventKey: "evt-3", descriptor: "revised" }),
    );
    expect(u).toMatchObject({ ok: true, created: false });
    expect(listYouthDocuments(Y1)).toHaveLength(2);
  });

  it("never matches a Youth by name and never fabricates a catalog mapping", () => {
    setIntegrationAccessProvider(() => ({
      ...TEST_ACCESS_BASELINE,
      actor: { id: "integration", name: "Integration" },
    }));
    expect(
      applyIncomingDocumentEvent(ev({ youthId: "Emily Johnson" })),
    ).toMatchObject({ ok: false, reason: "not-found" });
    expect(
      applyIncomingDocumentEvent(ev({ documentName: "Unlisted" })),
    ).toMatchObject({ ok: false, reason: "catalog-unavailable" });
  });
});

describe("saved expiration dates on edit", () => {
  const EDU = "KBIT";
  const edit = (r: { id: string; documentType: string; documentName: string }, over = {}) =>
    updateYouthDocument(r.id, {
      youthId: Y1,
      documentType: r.documentType,
      documentName: r.documentName,
      restricted: false,
      dateExecuted: "2026-03-01",
      expirationDate: "2026-12-31",
      descriptor: "",
      ...over,
    });

  async function eduWithOverride() {
    const r = await createYouthDocument(
      input({
        documentType: "Education & Employment",
        documentName: EDU,
        dateFiled: "2026-03-10",
        dateExecuted: "2026-03-01",
        expirationDate: "2026-12-31",
      }),
    );
    if (!r.ok) throw new Error("expected ok");
    expect(r.value.expirationDate).toBe("2026-12-31"); // not 2026-09-10
    return r.value;
  }

  it("changing only Descriptor keeps a manual override (also after reload)", async () => {
    const d = await eduWithOverride();
    const e = await edit(d, { descriptor: "only the note changed" });
    expect(e.ok && e.value.expirationDate).toBe("2026-12-31");
    // "reload": the persisted record is what the next read returns
    expect(listYouthDocuments(Y1)[0].expirationDate).toBe("2026-12-31");
  });

  it("saving unchanged keeps the override and a change to an unrelated date does not recalculate it", async () => {
    const d = await eduWithOverride();
    const same = await edit(d);
    expect(same.ok && same.value.expirationDate).toBe("2026-12-31");
    // this rule's base is Date Filed, so a new Date Executed is not a base change
    const moved = await edit(d, { dateExecuted: "2026-03-05" });
    expect(moved.ok && moved.value.expirationDate).toBe("2026-12-31");
  });

  it("an explicit new override is still accepted", async () => {
    const d = await eduWithOverride();
    const e = await edit(d, { expirationDate: "2027-01-15" });
    expect(e.ok && e.value.expirationDate).toBe("2027-01-15");
  });

  it("changing the classification recalculates under the new rule", async () => {
    const d = await eduWithOverride();
    const e = await edit(d, {
      documentType: "Consent/Agreement",
      documentName: "Demo Consent (annual)",
    });
    expect(e.ok && e.value.expirationDate).toBe("2027-03-01");
  });

  it("changing the rule's base date recalculates a calculated expiration", async () => {
    const r = await createYouthDocument(input()); // Consent annual, base Date Executed
    if (!r.ok) throw new Error("expected ok");
    const unrelated = await edit(r.value, { expirationDate: "2027-03-01", descriptor: "x" });
    expect(unrelated.ok && unrelated.value.expirationDate).toBe("2027-03-01");
    const moved = await edit(r.value, {
      dateExecuted: "2026-04-01",
      expirationDate: "2027-03-01", // stale value submitted back
    });
    expect(moved.ok && moved.value.expirationDate).toBe("2027-04-01");
  });

  it("an emptied override resolves to the calculated date, and saves exactly that", async () => {
    const d = await eduWithOverride(); // Date Filed 2026-03-10 + 6 months
    const e = await edit(d, { expirationDate: "", descriptor: "cleared" });
    expect(e.ok && e.value.expirationDate).toBe("2026-09-10");
  });

  it("a partial or invalid override is rejected, not saved", async () => {
    const d = await eduWithOverride();
    const e = await edit(d, { expirationDate: "2026-13-45" });
    expect(e).toMatchObject({
      ok: false,
      reason: "validation",
      fieldErrors: { expirationDate: "Enter a valid date." },
    });
    expect(listYouthDocuments(Y1)[0].expirationDate).toBe("2026-12-31");
  });

  it("resolveExpiration: blank override needs a valid base date", () => {
    const entry = {
      id: "e",
      documentType: "Education & Employment",
      documentName: "n",
      folder: "f",
      renewal: {
        kind: "recurring",
        every: 6,
        unit: "month",
        base: "dateFiled",
        monthEnd: "clamp",
        staffOverride: true,
      },
    } as never;
    expect(
      resolveExpiration(entry, {
        dateExecuted: "",
        dateFiled: "",
        expirationDate: "",
      }),
    ).toMatchObject({ ok: false });
    expect(
      resolveExpiration(entry, {
        dateExecuted: "",
        dateFiled: "2026-03-10",
        expirationDate: "",
      }),
    ).toMatchObject({ ok: true, value: "2026-09-10", calculated: true });
  });

  it("one-time and unknown-rule documents keep a blank expiration through edits", async () => {
    for (const name of ["Demo Consent (one-time)", "Demo Consent (rule unknown)"]) {
      const r = await createYouthDocument(input({ documentName: name }));
      if (!r.ok) throw new Error("expected ok");
      const e = await edit(r.value, { expirationDate: "", descriptor: "x" });
      expect(e.ok && e.value.expirationDate).toBeNull();
    }
  });
});

describe("Admissions-owned documents and Youth links", () => {
  const A = "L-001"; // Marcus Thompson — no Youth link in the data
  const B = "L-002"; // another Admissions record
  const asAdmission = (id: string, over: Partial<CreateDocumentInput> = {}) =>
    input({ youthId: undefined, owner: { kind: "admission", id }, ...over });
  const original = new Map(ALL_LEADS.map((l) => [l.id, l.youthConstituentId]));
  const link = (leadId: string, youthId: number | undefined) => {
    ALL_LEADS.find((l) => l.id === leadId)!.youthConstituentId = youthId;
  };
  afterEach(() => {
    ALL_LEADS.forEach((l) => (l.youthConstituentId = original.get(l.id)));
  });

  it("an unlinked Admissions record can upload; the record is owned by it, with no external ids", async () => {
    const r = await createYouthDocument(asAdmission(A));
    if (!r.ok) throw new Error("expected ok: " + JSON.stringify(r));
    expect(r.value).toMatchObject({
      youthId: "",
      admissionId: A,
      salesforceDocumentRecordId: null,
      laserficheEntryId: null,
      syncState: "local-only",
    });
    const sent = gw.uploads.at(-1)!;
    expect(sent.youthId).toBeNull();
    expect(sent.admissionId).toBe(A);
    expect(listYouthDocuments(admissionScope(A)!)).toHaveLength(1);
  });

  it("another Admissions record, a Youth, and a mis-typed id cannot see it", async () => {
    await createYouthDocument(asAdmission(A));
    expect(listYouthDocuments(admissionScope(B)!)).toHaveLength(0);
    expect(listYouthDocuments(Y1)).toHaveLength(0);
    expect(listYouthDocuments(youthScope(Y2)!)).toHaveLength(0);
    // an Admissions id passed where a Youth Constituent id belongs
    expect(listYouthDocuments(A)).toHaveLength(0);
  });

  it("never accepts an Admissions id as a Youth id, or an unknown owner", async () => {
    expect(await createYouthDocument(input({ youthId: A }))).toMatchObject({
      ok: false,
      reason: "not-found",
    });
    expect(
      await createYouthDocument(asAdmission("L-NOPE")),
    ).toMatchObject({ ok: false, reason: "not-found" });
    expect(
      await createYouthDocument(
        input({ youthId: undefined, owner: { kind: "admission", id: Y1 } }),
      ),
    ).toMatchObject({ ok: false, reason: "not-found" });
    expect(listYouthDocuments(youthScope(Y1)!)).toHaveLength(0);
  });

  it("a forged scope returns nothing and cannot be used to edit or read files", async () => {
    const r = await createYouthDocument(asAdmission(A));
    if (!r.ok) throw new Error("expected ok");
    const forged = {
      primary: { kind: "admission" as const, id: "L-NOPE" },
      owners: [{ kind: "admission" as const, id: "L-NOPE" }],
    };
    expect(listYouthDocuments(forged)).toHaveLength(0);
    expect(
      await updateYouthDocument(r.value.id, {
        scope: forged,
        documentType: r.value.documentType,
        documentName: r.value.documentName,
        restricted: false,
        dateExecuted: "2026-03-01",
        expirationDate: "2027-03-01",
        descriptor: "x",
      }),
    ).toMatchObject({ ok: false, reason: "not-found" });
    expect(await retrieveYouthDocumentFile(r.value.id, forged)).toMatchObject({
      ok: false,
    });
  });

  it("permissions are not widened: read-only users, restricted records and missing support stay blocked", async () => {
    setDocumentAccessProvider(() => TEST_ACCESS_READ_ONLY);
    expect(await createYouthDocument(asAdmission(A))).toMatchObject({
      ok: false,
      reason: "denied",
    });
    setDocumentAccessProvider(() => TEST_ACCESS_BASELINE);
    // restricted capability is still required for Admissions-owned records
    expect(
      await createYouthDocument(asAdmission(A, { restricted: true })),
    ).toMatchObject({ ok: false, reason: "denied" });
    // restricted + allowed, then hidden from a baseline viewer
    setDocumentAccessProvider(() => TEST_ACCESS_RESTRICTED_ALL);
    const r = await createYouthDocument(
      asAdmission(A, { restricted: true, documentName: "Court Paperwork", documentType: "Legal" }),
    );
    expect(r.ok).toBe(true);
    setDocumentAccessProvider(() => TEST_ACCESS_BASELINE);
    expect(listYouthDocuments(admissionScope(A)!)).toHaveLength(0);
  });

  it("without a gateway that supports Admissions-owned filing, nothing is saved or invented", async () => {
    gw.supportsAdmissionOwner = false;
    expect(await createYouthDocument(asAdmission(A))).toMatchObject({
      ok: false,
      reason: "integration-unavailable",
    });
    expect(listYouthDocuments(admissionScope(A)!)).toHaveLength(0);
    // Youth-owned filing is unaffected
    expect((await createYouthDocument(input())).ok).toBe(true);
  });

  it("an explicit link makes both profiles resolve the same records: no copies, ids/files/audit kept", async () => {
    const r = await createYouthDocument(asAdmission(A, { descriptor: "before link" }));
    if (!r.ok) throw new Error("expected ok");
    const before = { ...r.value };
    const uploadsBefore = gw.uploads.length;

    link(A, 2); // the existing mechanism: an explicit youthConstituentId

    const viaAdmission = listYouthDocuments(admissionScope(A)!);
    const viaYouth = listYouthDocuments("2");
    expect(viaAdmission.map((d) => d.id)).toEqual([before.id]);
    expect(viaYouth.map((d) => d.id)).toEqual([before.id]);
    expect(viaYouth[0]).toEqual(before); // identical record: id, file, audit
    expect(gw.uploads.length).toBe(uploadsBefore); // nothing re-uploaded
    expect(
      listYouthDocuments(youthScope(Y1)!).length +
        listYouthDocuments(admissionScope(B)!).length,
    ).toBe(0);

    // new uploads after the link belong to the Youth and show in both
    const after = await createYouthDocument(
      input({ youthId: undefined, owner: admissionScope(A)!.primary }),
    );
    if (!after.ok) throw new Error("expected ok");
    expect(after.value).toMatchObject({ youthId: "2", admissionId: null });
    const ids = (xs: { id: string }[]) => xs.map((d) => d.id).sort();
    expect(ids(listYouthDocuments(admissionScope(A)!))).toEqual(
      ids(listYouthDocuments("2")),
    );
    expect(listYouthDocuments("2")).toHaveLength(2);

    // editing through either entry point keeps the same record
    const e = await updateYouthDocument(before.id, {
      youthId: "2",
      documentType: before.documentType,
      documentName: before.documentName,
      restricted: false,
      dateExecuted: before.dateExecuted ?? "",
      expirationDate: before.expirationDate ?? "",
      descriptor: "edited from the Youth profile",
    });
    expect(e.ok && e.value.id).toBe(before.id);
    expect(e.ok && e.value.createdBy).toBe(before.createdBy);
    expect(e.ok && e.value.createdAt).toBe(before.createdAt);
    expect(
      listYouthDocuments(admissionScope(A)!).find((d) => d.id === before.id)!
        .descriptor,
    ).toBe("edited from the Youth profile");
  });

  it("a sibling Admissions record for the same child is NOT merged without its own link", async () => {
    // L-019 shares Marcus's name and "Y-001" key but has no explicit link.
    const r = await createYouthDocument(asAdmission(A));
    if (!r.ok) throw new Error("expected ok");
    link(A, 2);
    expect(listYouthDocuments(admissionScope("L-019")!)).toHaveLength(0);
    expect(listYouthDocuments("2")).toHaveLength(1);
  });

  it("existing Youth-owned records and Youth isolation are unchanged", async () => {
    const mine = await createYouthDocument(input());
    const theirs = await createYouthDocument(input({ youthId: Y2 }));
    expect(mine.ok && theirs.ok).toBe(true);
    expect(listYouthDocuments(Y1)).toHaveLength(1);
    expect(listYouthDocuments(Y2)).toHaveLength(1);
    // the linked demo Admissions record shares Youth 1's scope, nothing else
    expect(listYouthDocuments(admissionScope("L-DEMO-20093")!)).toHaveLength(1);
  });
});

describe("demo catalog coverage (synthetic fixtures)", () => {
  it("every Document Type in the picklist has at least one demo name", () => {
    for (const t of DOCUMENT_TYPES)
      expect(namesForType(t).length, t).toBeGreaterThan(0);
  });

  it("ids and (type, name) pairs are unique, and nothing claims to be approved", () => {
    const ids = DEMO_CATALOG_ENTRIES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    const pairs = DEMO_CATALOG_ENTRIES.map((e) => `${e.documentType}|${e.documentName}`);
    expect(new Set(pairs).size).toBe(pairs.length);
    expect(demoCatalogProvider.approved).toBe(false);
    for (const e of DEMO_CATALOG_ENTRIES) {
      expect(e.documentName.startsWith("Demo ")).toBe(true);
      expect(e.folder.startsWith("Demo ")).toBe(true);
      expect(DOCUMENT_TYPES as readonly string[]).toContain(e.documentType);
    }
  });

  it("a generated recurring entry calculates, and an unknown one stores no expiration", async () => {
    const rec = await createYouthDocument(
      input({ documentType: "Treatment Plans", documentName: "Demo Treatment Plans Review (90 days)", dateExecuted: "2026-03-01" }),
    );
    if (!rec.ok) throw new Error("expected ok");
    expect(rec.value.expirationDate).toBe("2026-05-30");
    const unk = await createYouthDocument(
      input({ documentType: "Identification", documentName: "Birth Certificate" }),
    );
    if (!unk.ok) throw new Error("expected ok");
    expect(unk.value.expirationDate).toBeNull();
    expect(unk.value.renewalStatus).toBe("unknown");
  });
});