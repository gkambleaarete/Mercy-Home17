// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __reloadMedReviewsForTest,
  createReviewLog,
  getMedReviews,
  saveDispensationCorrection,
  saveDocumentationReviews,
  captureReviewBaselines,
  updateReviewLog,
  type NewReviewLog,
} from "./medReviewStore";
import {
  countRows,
  dispensationRowsForCount,
  docRows,
  reviewRows,
} from "./medReviewViews";
import {
  getMedicationLogSnapshot,
  reloadMedicationLogs,
} from "./medicationLogStore";
import {
  REVIEW_ACTION_POLICY,
  canReviewAction,
  getMedicationLogAccess,
  setMedicationLogAccess,
} from "./medicationLogAccess";
import {
  COUNT_ROW_UNAVAILABLE,
  submitCounts,
} from "./medicationLogStore";
import {
  correctionHistory,
  effectiveDispensation,
} from "./medReviewStore";
import { getProgramById } from "./mockProgramsData";

// Isolated test data: two real canonical Program ids (3 = Bernardin,
// 4 = Couderc) and a few fictional canonical medication logs. Nothing here
// is seeded into the app.
const A = 3;
const B = 4;
const REVIEWS_KEY = "mh.medReviews.v1";
const LOGS_KEY = "mh.medicationLogs.v1";

const log = (
  id: string,
  programId: number,
  logType: string,
  extra: Record<string, unknown> = {},
) => ({
  id,
  recordNumber: Number(id.slice(-3)),
  youthId: programId === A ? "12" : "25",
  programId,
  youthMedicationId: programId === A ? "YM-12-001" : "YM-25-X",
  catalogMedicationId: "CAT-TEST",
  medicationName: programId === A ? "Lexapro" : "Zzz-Test-Med",
  dose: "10mg",
  dosePeriod: "Morning",
  doseDate: "2026-03-02",
  logType,
  instance: "1x daily",
  seq: 1,
  primaryCode: "Given",
  comment: "",
  dosePeriodComment: "",
  details: {},
  attestationId: "ATT-000001",
  createdAt: `2026-03-02T09:0${id.slice(-1)}:00.000Z`,
  ...(logType === "Count" ? { countType: "Units", quantity: 14 } : {}),
  ...extra,
});

function seedLogs() {
  localStorage.setItem(
    LOGS_KEY,
    JSON.stringify({
      version: 1,
      nextRecordNumber: 100,
      logs: [
        log("LOG-000001", A, "Count"),
        log("LOG-000002", A, "Prescription Dispensation"),
        log("LOG-000003", B, "Count"),
        log("LOG-000004", B, "Prescription Dispensation"),
        log("LOG-000005", B, "Prescription Dispensation", {
          deletedAt: "2026-03-03T00:00:00.000Z",
        }),
      ],
      attestations: [
        {
          id: "ATT-000001",
          logType: "Count",
          youthId: "12",
          programId: A,
          staff: "Test Staff",
          text: "x",
          attestedAt: "2026-03-02T09:00:00.000Z",
          logIds: [],
        },
      ],
    }),
  );
  reloadMedicationLogs();
}

const base = (over: Partial<NewReviewLog> = {}): NewReviewLog => ({
  programId: A,
  reviewType: "Count Review",
  reviewDate: "2026-04-01",
  startDate: "2026-03-01",
  endDate: "2026-03-31",
  numberOfIssues: null,
  hasIssue: false,
  details: "ok",
  ...over,
});

const names = (id: number) => getProgramById(id)?.name ?? "";
const read = () => getMedReviews();
const rows = (scope: "all" | number[], pid: number | null) =>
  reviewRows(read(), scope, names, pid);

beforeEach(() => {
  localStorage.clear();
  setMedicationLogAccess(null);
  __reloadMedReviewsForTest();
  seedLogs();
});
afterEach(() => {
  vi.restoreAllMocks();
  setMedicationLogAccess(null);
});

describe("Review logs: first record, persistence, scope", () => {
  it("an empty Program can create its first review; it persists and is visible from both entries", () => {
    expect(rows("all", A)).toHaveLength(0);
    const r = createReviewLog(base(), { expectedProgramId: A });
    expect(r.ok).toBe(true);
    __reloadMedReviewsForTest();
    // Program-origin query (fixed Program A) and the normal All Programs query.
    expect(rows("all", A)).toHaveLength(1);
    expect(rows("all", null)).toHaveLength(1);
    expect(rows("all", A)[0]).toMatchObject({
      programId: A,
      program: names(A),
      reviewType: "Count Review",
      reviewDate: "04/01/2026",
      startDate: "03/01/2026",
    });
    // Program B never sees A's record.
    expect(rows("all", B)).toHaveLength(0);
  });

  it("normal All Programs includes only accessible Programs", () => {
    createReviewLog(base({ programId: A }));
    createReviewLog(base({ programId: B }));
    expect(rows("all", null)).toHaveLength(2);
    expect(rows([A], null).map((x) => x.programId)).toEqual([A]);
  });

  it("rejects a Program that doesn't match the fixed context, or isn't valid", () => {
    const mismatch = createReviewLog(base({ programId: B }), {
      expectedProgramId: A,
    });
    expect(mismatch).toMatchObject({ ok: false, reason: "scope" });
    expect(createReviewLog(base({ programId: 999999 }))).toMatchObject({
      ok: false,
      reason: "invalid",
    });
    expect(localStorage.getItem(REVIEWS_KEY)).toBeNull();
  });

  it("enforces the live access rules (Program scope and the viewLogs capability)", () => {
    setMedicationLogAccess({ scope: { kind: "programs", programIds: [B] } });
    expect(createReviewLog(base({ programId: A }))).toMatchObject({
      ok: false,
      reason: "forbidden",
    });
    setMedicationLogAccess({
      scope: { kind: "all" },
      capabilities: new Set(),
    });
    expect(createReviewLog(base())).toMatchObject({
      ok: false,
      reason: "forbidden",
    });
    expect(localStorage.getItem(REVIEWS_KEY)).toBeNull();
  });

  it("validates required fields", () => {
    expect(
      createReviewLog(base({ startDate: "", endDate: "" })),
    ).toMatchObject({
      ok: false,
      fieldErrors: { startDate: expect.any(String), endDate: expect.any(String) },
    });
    // A Med Cart review has no period.
    expect(
      createReviewLog(
        base({ reviewType: "Med Cart Review", startDate: "", endDate: "" }),
      ).ok,
    ).toBe(true);
  });

  it("a storage failure gives an error, no record, and keeps earlier data", () => {
    createReviewLog(base());
    const before = localStorage.getItem(REVIEWS_KEY);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const r = createReviewLog(base({ details: "never saved" }));
    expect(r).toMatchObject({ ok: false, reason: "storage" });
    vi.restoreAllMocks();
    expect(localStorage.getItem(REVIEWS_KEY)).toBe(before);
    expect(rows("all", null)).toHaveLength(1);
  });

  it("unreadable saved data is reported and never overwritten", () => {
    localStorage.setItem(REVIEWS_KEY, "{bad");
    __reloadMedReviewsForTest();
    expect(getMedReviews().status).toBe("error");
    expect(createReviewLog(base())).toMatchObject({
      ok: false,
      reason: "unreadable",
    });
    expect(localStorage.getItem(REVIEWS_KEY)).toBe("{bad");
  });
});

describe("Review logs: edit", () => {
  it("an edit keeps the Program, records history, and is visible after reload", () => {
    const c = createReviewLog(base());
    if (!c.ok) throw new Error("create");
    const u = updateReviewLog(
      c.log.id,
      { hasIssue: true, details: "changed" },
      { expectedProgramId: A },
    );
    expect(u.ok).toBe(true);
    __reloadMedReviewsForTest();
    const [r] = rows("all", A);
    expect(r).toMatchObject({ programId: A, hasIssue: true, details: "changed" });
    expect(r.history.map((h) => h.field)).toEqual(
      expect.arrayContaining(["Has Issue", "Comments", "Review Log"]),
    );
  });

  it("rejects a stale id, a mismatched Program context and an inaccessible Program", () => {
    const c = createReviewLog(base());
    if (!c.ok) throw new Error("create");
    expect(
      updateReviewLog("MRL-999999", { hasIssue: false, details: "" }),
    ).toMatchObject({ ok: false, reason: "not-found" });
    expect(
      updateReviewLog(c.log.id, { hasIssue: true, details: "x" }, {
        expectedProgramId: B,
      }),
    ).toMatchObject({ ok: false, reason: "scope" });
    setMedicationLogAccess({ scope: { kind: "programs", programIds: [B] } });
    expect(
      updateReviewLog(c.log.id, { hasIssue: true, details: "x" }),
    ).toMatchObject({ ok: false, reason: "forbidden" });
    setMedicationLogAccess(null);
    expect(rows("all", A)[0].details).toBe("ok");
  });
});

describe("Count and Med Documentation read the canonical logs", () => {
  const snap = () => getMedicationLogSnapshot();

  it("Count rows are the Program's own Count logs only", () => {
    expect(countRows(snap(), "all", A).map((r) => r.id)).toEqual(["LOG-000001"]);
    expect(countRows(snap(), "all", B).map((r) => r.id)).toEqual(["LOG-000003"]);
    expect(countRows(snap(), [B], null).map((r) => r.id)).toEqual(["LOG-000003"]);
    const row = countRows(snap(), "all", A)[0];
    expect(row).toMatchObject({ medication: "Lexapro", count: "14", attestationStaff: "Test Staff" });
    expect(dispensationRowsForCount(snap(), row, "all").map((r) => r.id)).toEqual(["LOG-000002"]);
  });

  it("Documentation rows are the Program's non-Count, active logs; deleted logs never appear", () => {
    const a = docRows(snap(), read(), "all", A, names);
    expect(a.map((r) => r.id)).toEqual(["LOG-000002"]);
    const b = docRows(snap(), read(), "all", B, names);
    expect(b.map((r) => r.id)).toEqual(["LOG-000004"]);
    expect(b[0].medication).toBe("Zzz-Test-Med");
  });

  it("a saved review and correction persist, show on the log, and are shared", () => {
    const r = saveDocumentationReviews(
      {
        logIds: ["LOG-000002"], baselines: captureReviewBaselines(["LOG-000002"]),
        reviewStatus: "Assigned",
        assignee: "Maria Santos",
        comment: "check this",
      },
      { expectedProgramId: A },
    );
    expect(r).toMatchObject({ ok: true, count: 1 });
    expect(
      saveDispensationCorrection(
        {
          logId: "LOG-000002",
          staffDispensed: "Yes",
          youthReceived: "",
          primaryCode: "",
          comment: "fixed",
        },
        { expectedProgramId: A },
      ).ok,
    ).toBe(true);
    __reloadMedReviewsForTest();
    const [row] = docRows(snap(), read(), "all", A, names);
    expect(row).toMatchObject({
      reviewStatus: "Assigned",
      assignee: "Maria Santos",
      reviewComments: "check this",
      staffDispensed: "Yes",
      programId: A,
    });
    // The canonical log itself is untouched.
    expect(snap().logs.find((l) => l.id === "LOG-000002")?.comment).toBe("");
    // Program B is unaffected.
    expect(docRows(snap(), read(), "all", B, names)[0].reviewStatus).toBe("—");
  });

  it("rejects out-of-scope / stale logs and writes nothing", () => {
    const before = () => localStorage.getItem(REVIEWS_KEY);
    // One valid log and one that belongs to another Program → nothing saved.
    expect(
      saveDocumentationReviews(
        {
          logIds: ["LOG-000002", "LOG-000004"], baselines: captureReviewBaselines(["LOG-000002", "LOG-000004"]),
          reviewStatus: "Assigned",
          assignee: "",
          comment: "",
        },
        { expectedProgramId: A },
      ),
    ).toMatchObject({ ok: false, reason: "scope" });
    expect(
      saveDocumentationReviews(
        { logIds: ["LOG-000005"], baselines: captureReviewBaselines(["LOG-000005"]), reviewStatus: "Assigned", assignee: "", comment: "" },
      ),
    ).toMatchObject({ ok: false, reason: "not-found" });
    expect(
      saveDocumentationReviews(
        { logIds: ["NOPE"], baselines: captureReviewBaselines(["NOPE"]), reviewStatus: "Assigned", assignee: "", comment: "" },
      ),
    ).toMatchObject({ ok: false, reason: "not-found" });
    setMedicationLogAccess({ scope: { kind: "programs", programIds: [B] } });
    expect(
      saveDocumentationReviews(
        { logIds: ["LOG-000002"], baselines: captureReviewBaselines(["LOG-000002"]), reviewStatus: "Assigned", assignee: "", comment: "" },
      ),
    ).toMatchObject({ ok: false, reason: "forbidden" });
    expect(
      saveDispensationCorrection(
        { logId: "LOG-000002", staffDispensed: "Yes", youthReceived: "", primaryCode: "", comment: "c" },
      ),
    ).toMatchObject({ ok: false, reason: "forbidden" });
    setMedicationLogAccess(null);
    expect(before()).toBeNull();
  });

  it("requires a status, and a comment with a correction", () => {
    expect(
      saveDocumentationReviews({ logIds: ["LOG-000002"], baselines: captureReviewBaselines(["LOG-000002"]), reviewStatus: "", assignee: "", comment: "" }),
    ).toMatchObject({ ok: false, reason: "invalid" });
    expect(
      saveDispensationCorrection({ logId: "LOG-000002", staffDispensed: "Yes", youthReceived: "", primaryCode: "", comment: "" }),
    ).toMatchObject({ ok: false, reason: "invalid" });
  });

  it("a failed write saves nothing", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(
      saveDocumentationReviews({ logIds: ["LOG-000002"], baselines: captureReviewBaselines(["LOG-000002"]), reviewStatus: "Assigned", assignee: "", comment: "" }),
    ).toMatchObject({ ok: false, reason: "storage" });
    vi.restoreAllMocks();
    expect(docRows(snap(), read(), "all", A, names)[0].reviewStatus).toBe("—");
  });
});


// ─── Per-action permissions (the established capabilities, per action) ──────
const caps = (...c: string[]) =>
  setMedicationLogAccess({ scope: { kind: "all" }, capabilities: new Set(c) });

describe("Action permissions", () => {
  const A_LOG = "LOG-000002";

  it("view-only access reads and exports but can't create, edit, review or correct", () => {
    const c = createReviewLog(base());
    if (!c.ok) throw new Error("create");
    caps("viewLogs");
    expect(rows("all", A)).toHaveLength(1); // viewing still works
    expect(canReviewAction(getMedicationLogAccess(), "viewReviews")).toBe(true);
    expect(canReviewAction(getMedicationLogAccess(), "exportReviews")).toBe(true);
    const before = localStorage.getItem(REVIEWS_KEY);
    expect(createReviewLog(base())).toMatchObject({ ok: false, reason: "forbidden" });
    expect(updateReviewLog(c.log.id, { hasIssue: true, details: "x" })).toMatchObject({ ok: false, reason: "forbidden" });
    expect(
      saveDocumentationReviews({ logIds: [A_LOG], baselines: captureReviewBaselines([A_LOG]), reviewStatus: "Assigned", assignee: "", comment: "" }),
    ).toMatchObject({ ok: false, reason: "forbidden" });
    expect(
      saveDispensationCorrection({ logId: A_LOG, staffDispensed: "Yes", youthReceived: "", primaryCode: "", comment: "c" }),
    ).toMatchObject({ ok: false, reason: "forbidden" });
    expect(localStorage.getItem(REVIEWS_KEY)).toBe(before);
  });

  it("without the view capability nothing is readable or writable", () => {
    caps("submitCount");
    expect(createReviewLog(base())).toMatchObject({ ok: false, reason: "forbidden" });
    expect(canReviewAction(getMedicationLogAccess(), "viewReviews")).toBe(false);
  });

  it("the review writes need more than view: viewLogs + submitCount (provisional); attestation rights are not required or implied", () => {
    caps("viewLogs", "submitCount"); // no viewAttestations
    expect(createReviewLog(base()).ok).toBe(true);
    expect(
      saveDispensationCorrection({ logId: A_LOG, staffDispensed: "Yes", youthReceived: "", primaryCode: "", comment: "c" }).ok,
    ).toBe(true);
    // The correction did not make attestation details visible.
    const hidden = docRows(getMedicationLogSnapshot(), read(), "all", A, names, { attestations: false })[0];
    expect(hidden.attestationStaff).toBe("—");
    expect(hidden.attestationDate).toBe("—");
    // And without submitCount the same user is refused again.
    caps("viewLogs", "viewAttestations");
    expect(createReviewLog(base())).toMatchObject({ ok: false, reason: "forbidden" });
  });

  it("the policy table names only existing capabilities and marks undefined policy as provisional", () => {
    const existing = new Set(["viewLogs", "viewAttestations", "submitCount", "deleteLog", "viewAudit"]);
    for (const rule of Object.values(REVIEW_ACTION_POLICY))
      for (const c of rule.requires) expect(existing.has(c)).toBe(true);
    expect(REVIEW_ACTION_POLICY.recordCount.established).toBe(true);
    expect(REVIEW_ACTION_POLICY.viewReviews.established).toBe(true);
    expect(REVIEW_ACTION_POLICY.createReviewLog.established).toBe(false);
    expect(REVIEW_ACTION_POLICY.saveCorrection.established).toBe(false);
  });

  it("the canonical count service keeps its own rules (permission, enrollment, medication ownership)", () => {
    const row = (programId: number, youthId: string, ym: string) => [{ youthMedicationId: ym, currentCount: "5", comment: "" }].map((r) => ({ ...r })) && ({ youthId, programId, rows: [{ youthMedicationId: ym, currentCount: "5", comment: "" }] });
    // Without submitCount: refused by the service itself.
    caps("viewLogs");
    expect(submitCounts({ ...row(A, "12", "YM-12-001"), staff: "s" })).toMatchObject({ ok: false });
    setMedicationLogAccess(null);
    // Youth 12 is actively enrolled in Program 3 with assignment YM-12-001: accepted.
    expect(submitCounts({ ...row(A, "12", "YM-12-001"), staff: "s" }).ok).toBe(true);
    // Not enrolled in Program 4 → refused.
    expect(submitCounts({ ...row(B, "12", "YM-12-001"), staff: "s" })).toMatchObject({
      ok: false,
      rowErrors: { "YM-12-001": COUNT_ROW_UNAVAILABLE },
    });
    // Another youth's medication assignment → refused.
    expect(submitCounts({ ...row(A, "12", "YM-1-001"), staff: "s" })).toMatchObject({
      ok: false,
      rowErrors: { "YM-1-001": COUNT_ROW_UNAVAILABLE },
    });
    // Out of Program scope → refused.
    setMedicationLogAccess({ scope: { kind: "programs", programIds: [B] } });
    expect(submitCounts({ ...row(A, "12", "YM-12-001"), staff: "s" })).toMatchObject({ ok: false });
  });
});

describe("Actor and correction history", () => {
  it("records the current user (id and name) and ignores any caller-supplied name", () => {
    setMedicationLogAccess({
      scope: { kind: "all" },
      capabilities: new Set(["viewLogs", "submitCount", "viewAttestations"]),
      user: { id: "u-42", name: "Pat Reviewer" },
    } as never);
    const c = createReviewLog(base());
    if (!c.ok) throw new Error("create");
    expect(c.log).toMatchObject({ reviewer: "Pat Reviewer", reviewerId: "u-42" });
    updateReviewLog(c.log.id, { hasIssue: true, details: "e" });
    const hist = read().status === "ok" ? (read() as any).data.reviewLogs[0].history : [];
    expect(hist.every((h: any) => h.modifier === "Pat Reviewer" && h.modifierId === "u-42")).toBe(true);
  });

  it("a correction keeps previous and new values, actor and timestamp; the canonical log is untouched; it is not an attestation", () => {
    setMedicationLogAccess({
      scope: { kind: "all" },
      capabilities: new Set(["viewLogs", "submitCount"]),
      user: { id: "u-7", name: "Casey Corrector" },
    } as never);
    const attBefore = JSON.stringify(getMedicationLogSnapshot().attestations);
    const logBefore = JSON.stringify(getMedicationLogSnapshot().logs.find((l) => l.id === "LOG-000002"));
    saveDispensationCorrection({ logId: "LOG-000002", staffDispensed: "Yes", youthReceived: "No", primaryCode: "", comment: "first" });
    saveDispensationCorrection({ logId: "LOG-000002", staffDispensed: "", youthReceived: "Yes", primaryCode: "Held", comment: "second" });
    const h = correctionHistory("LOG-000002");
    if (!h.ok) throw new Error("history");
    const [second, first] = h.corrections;
    expect(first).toMatchObject({ by: "Casey Corrector", byId: "u-7", staffDispensed: "Yes", youthReceived: "No", previous: { staffDispensed: "", youthReceived: "", primaryCode: "Given" } });
    expect(second).toMatchObject({ youthReceived: "Yes", primaryCode: "Held", previous: { staffDispensed: "Yes", youthReceived: "No", primaryCode: "Given" } });
    expect(new Date(second.at).getTime()).toBeGreaterThanOrEqual(new Date(first.at).getTime());
    expect(effectiveDispensation(getMedicationLogSnapshot().logs.find((l) => l.id === "LOG-000002")!, h.corrections)).toEqual({
      staffDispensed: "Yes",
      youthReceived: "Yes",
      primaryCode: "Held",
    });
    // Nothing canonical changed and no attestation was created.
    expect(JSON.stringify(getMedicationLogSnapshot().attestations)).toBe(attBefore);
    expect(JSON.stringify(getMedicationLogSnapshot().logs.find((l) => l.id === "LOG-000002"))).toBe(logBefore);
    // Correction history is scoped.
    setMedicationLogAccess({ scope: { kind: "programs", programIds: [B] } });
    expect(correctionHistory("LOG-000002")).toMatchObject({ ok: false, reason: "forbidden" });
  });
});

describe("Column sources", () => {
  const seedDetailed = () => {
    const snap = JSON.parse(localStorage.getItem(LOGS_KEY)!);
    snap.logs.push(
      log("LOG-000007", A, "Prescription Dispensation", {
        details: {
          "Start Time": "06:00 AM",
          "End Time": "11:00 AM",
          "Package Code": "PKG-9",
          Instructions: "Take with food",
          "Staff Dispensed": "Sarah Johnson",
          "Youth Received": "Yes",
        },
        attestationId: "ATT-000007",
      }),
      // Same medication assignment id, other Program: must never feed A's row.
      log("LOG-000008", B, "Prescription Dispensation", {
        details: { Instructions: "B-only instructions", "Youth Received": "No" },
        youthMedicationId: "YM-12-001",
      }),
    );
    snap.attestations.push({
      id: "ATT-000007",
      logType: "Prescription Dispensation",
      youthId: "12",
      programId: A,
      staff: "Attesting Person",
      text: "x",
      attestedAt: "2026-03-02T13:15:00.000Z",
      logIds: ["LOG-000007"],
    });
    localStorage.setItem(LOGS_KEY, JSON.stringify(snap));
    reloadMedicationLogs();
  };

  it("fills only verified, per-log sources; everything else stays missing", () => {
    seedDetailed();
    const row = docRows(getMedicationLogSnapshot(), read(), "all", A, names).find((r) => r.id === "LOG-000007")!;
    expect(row).toMatchObject({
      start: "06:00 AM",
      end: "11:00 AM",
      pkg: "PKG-9",
      instructions: "Take with food",
      youthReceived: "Yes",
      attestationStaff: "Attesting Person",
    });
    // The log's own "Staff Dispensed" is a name, not this column's Yes/No → not mapped.
    expect(row.staffDispensed).toBe("—");
    // No canonical source: stay missing, never No / blank-as-false.
    expect(row).toMatchObject({
      medLeader: "—",
      isPsychotropic: null,
      attestationOccurred: "—",
      attestationDevice: "—",
      otherReceived: "—",
    });
    expect(row.attestationDate).toContain("03/02/2026");
  });

  it("stays inside the Program and doesn't borrow another Program's record", () => {
    seedDetailed();
    const a = docRows(getMedicationLogSnapshot(), read(), "all", A, names);
    const b = docRows(getMedicationLogSnapshot(), read(), "all", B, names);
    expect(a.some((r) => r.instructions === "B-only instructions")).toBe(false);
    expect(b.find((r) => r.id === "LOG-000008")?.instructions).toBe("B-only instructions");
    expect(b.every((r) => r.programId === B)).toBe(true);
  });

  it("a correction fills Staff Dispensed without inventing an attestation", () => {
    seedDetailed();
    saveDispensationCorrection({ logId: "LOG-000007", staffDispensed: "Yes", youthReceived: "", primaryCode: "", comment: "c" });
    const row = docRows(getMedicationLogSnapshot(), read(), "all", A, names).find((r) => r.id === "LOG-000007")!;
    expect(row.staffDispensed).toBe("Yes");
    expect(row.attestationDate).toContain("03/02/2026"); // still the original attestation, not the correction time
  });

  it("attestation details are hidden without the viewAttestations capability", () => {
    seedDetailed();
    const row = docRows(getMedicationLogSnapshot(), read(), "all", A, names, { attestations: false }).find((r) => r.id === "LOG-000007")!;
    expect(row.attestationStaff).toBe("—");
    expect(row.attestationDate).toBe("—");
    const c = countRows(getMedicationLogSnapshot(), "all", A, { attestations: false })[0];
    expect(c.attestationStaff).toBe("");
  });
});

// Stale review saves (US 20142). NOT executed in this environment (no test
// runner is installed): the same behaviors are exercised in the isolated
// browser harness.
describe("Stale review saves are detected before anything is appended", () => {
  const save = (logIds: string[], baselines: ReturnType<typeof captureReviewBaselines>, reviewStatus = "Assigned") =>
    saveDocumentationReviews({ logIds, baselines, reviewStatus, assignee: "", comment: "" });

  it("a baseline of 'no review' is explicit and stays valid until a review is saved", () => {
    const base = captureReviewBaselines(["LOG-000002"]);
    expect(base).toEqual({ "LOG-000002": null });
    expect(save(["LOG-000002"], base)).toMatchObject({ ok: true, count: 1 });
  });

  it("a review saved after the form opened rejects the save and keeps history", () => {
    const base = captureReviewBaselines(["LOG-000002"]);
    expect(save(["LOG-000002"], captureReviewBaselines(["LOG-000002"]))).toMatchObject({ ok: true });
    const before = getMedReviews();
    const stale = save(["LOG-000002"], base, "Resolved");
    expect(stale).toMatchObject({ ok: false, reason: "conflict", conflictLogIds: ["LOG-000002"] });
    const after = getMedReviews();
    expect(after.status === "ok" && before.status === "ok" && after.data.documentationReviews.length).toBe(
      before.status === "ok" ? before.data.documentationReviews.length : -1,
    );
  });

  it("one stale record rejects the whole multi-record batch", () => {
    const base = captureReviewBaselines(["LOG-000002", "LOG-000004"]);
    expect(save(["LOG-000004"], captureReviewBaselines(["LOG-000004"]))).toMatchObject({ ok: true });
    const r = getMedReviews();
    const count = r.status === "ok" ? r.data.documentationReviews.length : -1;
    expect(save(["LOG-000002", "LOG-000004"], base, "Resolved")).toMatchObject({
      ok: false,
      reason: "conflict",
      conflictLogIds: ["LOG-000004"],
    });
    const r2 = getMedReviews();
    expect(r2.status === "ok" ? r2.data.documentationReviews.length : -2).toBe(count);
  });

  it("a missing baseline is refused (the form must capture one)", () => {
    expect(
      saveDocumentationReviews({ logIds: ["LOG-000002"], reviewStatus: "Assigned", assignee: "", comment: "" } as never),
    ).toMatchObject({ ok: false, reason: "invalid" });
  });
});