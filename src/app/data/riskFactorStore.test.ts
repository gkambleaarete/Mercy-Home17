// @vitest-environment jsdom
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  RISK_FACTOR_STORAGE_KEY,
  __reloadRiskFactorsForTest,
  __resetRiskFactorsForTest,
  createRiskFactor,
  deleteRiskFactor,
  getRiskFactors,
  riskFactorsForAdmissionsRecord,
  updateRiskFactor,
  type RiskFactorFields,
} from "./riskFactorStore";
import {
  deriveFullLifetimeRequirement,
  fullLifetimeTriggerFactor,
} from "../lib/cssrsRequirement";

const A = { admissionsRecordId: "L-100", youthKey: "Y-001" };
const B = { admissionsRecordId: "L-200", youthKey: "Y-002" };
const f = (
  riskFactor: string,
  details = "",
): RiskFactorFields => ({
  riskFactor,
  lastOccurred: "",
  duration: "",
  frequency: "",
  details,
});
const req = (id: string | null) =>
  deriveFullLifetimeRequirement(getRiskFactors(), id);

beforeEach(() => __resetRiskFactorsForTest());
afterEach(() => vi.restoreAllMocks());

describe("persistence and isolation", () => {
  it("survives a reload and keeps its owner and youth", () => {
    const r = createRiskFactor(A, f("Suicidal Ideation"));
    if (!r.ok) throw new Error(r.error);
    __reloadRiskFactorsForTest();
    const read = getRiskFactors();
    expect(read.status).toBe("ok");
    expect(
      riskFactorsForAdmissionsRecord(read, "L-100"),
    ).toHaveLength(1);
    expect(r.record).toMatchObject({
      admissionsRecordId: "L-100",
      youthKey: "Y-001",
    });
  });
  it("starts empty (no sample rows) and never exposes another record's factors", () => {
    expect(
      riskFactorsForAdmissionsRecord(getRiskFactors(), "L-100"),
    ).toEqual([]);
    createRiskFactor(A, f("Self-Harm"));
    expect(
      riskFactorsForAdmissionsRecord(getRiskFactors(), "L-200"),
    ).toEqual([]);
    expect(
      riskFactorsForAdmissionsRecord(getRiskFactors(), null),
    ).toEqual([]);
    expect(req("L-200").status).toBe("none");
  });
  it("another record can't edit or delete a factor it doesn't own", () => {
    const r = createRiskFactor(A, f("Self-Harm"));
    if (!r.ok) throw new Error();
    expect(
      updateRiskFactor("L-200", r.record.id, f("Stealing")).ok,
    ).toBe(false);
    expect(deleteRiskFactor("L-200", r.record.id).ok).toBe(
      false,
    );
    expect(
      riskFactorsForAdmissionsRecord(getRiskFactors(), "L-100"),
    ).toHaveLength(1);
  });
  it("rejects a missing owner or an unknown risk factor", () => {
    expect(
      createRiskFactor(
        { admissionsRecordId: "", youthKey: "Y" },
        f("Self-Harm"),
      ).ok,
    ).toBe(false);
    expect(createRiskFactor(A, f("")).ok).toBe(false);
    expect(createRiskFactor(A, f("Self Harm")).ok).toBe(false); // legacy spelling isn't offered for new ones
  });
});

describe("Full-Lifetime requirement", () => {
  it("Suicidal Ideation and Self-Harm each indicate it; unrelated factors don't", () => {
    createRiskFactor(A, f("AWOL or Runaway"));
    expect(req("L-100").status).toBe("none");
    createRiskFactor(A, f("Suicidal Ideation"));
    createRiskFactor(A, f("Self-Harm"));
    const r = req("L-100");
    expect(r.status).toBe("required");
    if (r.status === "required")
      expect(r.factors.map((x) => x.riskFactor)).toEqual([
        "Suicidal Ideation",
        "Self-Harm",
      ]);
  });
  it("matches exactly: no substrings, no narrative; 'Self Harm' is the one legacy alias", () => {
    expect(fullLifetimeTriggerFactor("Self Harm")).toBe(
      "Self-Harm",
    );
    expect(fullLifetimeTriggerFactor("Self-Harm")).toBe(
      "Self-Harm",
    );
    expect(fullLifetimeTriggerFactor("self-harm")).toBeNull();
    expect(
      fullLifetimeTriggerFactor("Suicidal Ideation (past)"),
    ).toBeNull();
    createRiskFactor(
      A,
      f("Other", "history of suicidal ideation and self-harm"),
    );
    expect(req("L-100").status).toBe("none");
  });
  it("a saved legacy 'Self Harm' record triggers it and stays editable", () => {
    const made = createRiskFactor(A, f("Stealing"));
    if (!made.ok) throw new Error();
    const stored = JSON.parse(
      localStorage.getItem(RISK_FACTOR_STORAGE_KEY)!,
    );
    stored.records[0].riskFactor = "Self Harm";
    localStorage.setItem(
      RISK_FACTOR_STORAGE_KEY,
      JSON.stringify(stored),
    );
    __reloadRiskFactorsForTest();
    expect(req("L-100").status).toBe("required");
    expect(
      updateRiskFactor(
        "L-100",
        made.record.id,
        f("Self Harm", "kept"),
      ).ok,
    ).toBe(true);
    expect(
      updateRiskFactor(
        "L-100",
        made.record.id,
        f("Self Harm", "again"),
      ).ok,
    ).toBe(true);
  });
  it("recomputes after Add, Edit and Delete", () => {
    const made = createRiskFactor(A, f("Suicidal Ideation"));
    if (!made.ok) throw new Error();
    expect(req("L-100").status).toBe("required");
    updateRiskFactor("L-100", made.record.id, f("Stealing"));
    expect(req("L-100").status).toBe("none");
    updateRiskFactor("L-100", made.record.id, f("Self-Harm"));
    expect(req("L-100").status).toBe("required");
    deleteRiskFactor("L-100", made.record.id);
    expect(req("L-100").status).toBe("none");
  });
  it("unreadable data is 'unavailable', never 'none'; no record id is unavailable too", () => {
    localStorage.setItem(RISK_FACTOR_STORAGE_KEY, "{not json");
    __reloadRiskFactorsForTest();
    expect(req("L-100")).toEqual({
      status: "unavailable",
      reason: "corrupt",
    });
    expect(req(null)).toEqual({
      status: "unavailable",
      reason: "no-record",
    });
  });
});

describe("unreadable data and failed writes", () => {
  it("corrupt or unsupported data is left intact and writes are refused", () => {
    for (const raw of [
      "{not json",
      JSON.stringify({ version: 9, records: [] }),
    ]) {
      localStorage.setItem(RISK_FACTOR_STORAGE_KEY, raw);
      __reloadRiskFactorsForTest();
      expect(getRiskFactors().status).toBe("error");
      expect(createRiskFactor(A, f("Self-Harm"))).toMatchObject(
        { ok: false, reason: "unreadable" },
      );
      expect(
        localStorage.getItem(RISK_FACTOR_STORAGE_KEY),
      ).toBe(raw);
    }
  });
  it("a failed write preserves saved data and reports an error", () => {
    const made = createRiskFactor(A, f("Self-Harm"));
    if (!made.ok) throw new Error();
    const raw = localStorage.getItem(RISK_FACTOR_STORAGE_KEY);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      () => {
        throw new Error("quota");
      },
    );
    expect(createRiskFactor(A, f("Stealing"))).toMatchObject({
      ok: false,
      reason: "storage",
    });
    expect(
      updateRiskFactor("L-100", made.record.id, f("Stealing")),
    ).toMatchObject({ ok: false, reason: "storage" });
    expect(
      deleteRiskFactor("L-100", made.record.id),
    ).toMatchObject({ ok: false, reason: "storage" });
    vi.restoreAllMocks();
    expect(localStorage.getItem(RISK_FACTOR_STORAGE_KEY)).toBe(
      raw,
    );
    expect(req("L-100").status).toBe("required");
  });
});