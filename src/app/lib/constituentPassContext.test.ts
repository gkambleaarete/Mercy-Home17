import { afterEach, describe, expect, it } from "vitest";
import {
  PASS_CONTEXT_UNAVAILABLE_MESSAGE,
  isPassInContext,
  isPassTabConstituent,
  resolveConstituentPassContext,
} from "./constituentPassContext";
import { CONSTITUENTS } from "../data/mockConstituents";
import {
  getYouthProgramEnrollments,
  setYouthProgramEnrollmentsData,
  subscribeYouthProgramEnrollments,
} from "../data/mockYouthProgramData";

// Constituent Pass tab — ownership rules: who is eligible, which Program a
// Constituent's Passes belong to, and when the context is unavailable.

const original = [...getYouthProgramEnrollments()];
afterEach(() => setYouthProgramEnrollmentsData([...original]));

const YOUTH = 1; // Emily Johnson, Youth, Program 1
const CCM = 9301; // demo Community Care Member, Program 1

describe("eligibility", () => {
  it("accepts only Individuals saved as Youth or Community Care Member", () => {
    const byId = (id: number) => CONSTITUENTS.find((c) => c.id === id);
    expect(isPassTabConstituent(byId(YOUTH))).toBe(true);
    expect(isPassTabConstituent(byId(CCM))).toBe(true);
    expect(isPassTabConstituent(byId(3))).toBe(false); // External Constituent
    expect(isPassTabConstituent(byId(7))).toBe(false); // Organization
    expect(isPassTabConstituent(undefined)).toBe(false);
  });
  it("resolves ineligible for an unknown or ineligible id", () => {
    expect(resolveConstituentPassContext(3).status).toBe("ineligible");
    expect(resolveConstituentPassContext(424242).status).toBe("ineligible");
  });
});

describe("current Program resolution", () => {
  it("uses the single active enrollment (by ID) for both supported roles", () => {
    for (const id of [YOUTH, CCM]) {
      const ctx = resolveConstituentPassContext(id);
      expect(ctx.status).toBe("ok");
      if (ctx.status === "ok") {
        expect(ctx.youthId).toBe(String(id));
        expect(ctx.programId).toBe(1);
        expect(ctx.youthName.length).toBeGreaterThan(0);
      }
    }
  });
  it("is unavailable with no active enrollment", () => {
    setYouthProgramEnrollmentsData(
      original.map((e) =>
        e.constituentId === YOUTH ? { ...e, active: false } : e,
      ),
    );
    const ctx = resolveConstituentPassContext(YOUTH);
    expect(ctx).toMatchObject({
      status: "program-unavailable",
      reason: "no-program",
    });
  });
  it("is unavailable (never the first) when several Programs are active", () => {
    setYouthProgramEnrollmentsData([
      ...original,
      { constituentId: YOUTH, programId: 3, active: true },
    ]);
    expect(resolveConstituentPassContext(YOUTH)).toMatchObject({
      status: "program-unavailable",
      reason: "ambiguous-program",
    });
  });
  it("is unavailable when the enrolled Program no longer exists", () => {
    setYouthProgramEnrollmentsData([
      ...original.filter((e) => e.constituentId !== YOUTH),
      { constituentId: YOUTH, programId: 999999, active: true },
    ]);
    expect(resolveConstituentPassContext(YOUTH)).toMatchObject({
      status: "program-unavailable",
      reason: "program-deleted",
    });
  });
  it("follows an enrollment change immediately and notifies subscribers", () => {
    let calls = 0;
    const off = subscribeYouthProgramEnrollments(() => calls++);
    setYouthProgramEnrollmentsData(
      original.map((e) =>
        e.constituentId === YOUTH ? { ...e, programId: 3 } : e,
      ),
    );
    off();
    expect(calls).toBe(1);
    const ctx = resolveConstituentPassContext(YOUTH);
    expect(ctx.status === "ok" && ctx.programId).toBe(3);
  });
  it("has a user-facing unavailable message", () => {
    expect(PASS_CONTEXT_UNAVAILABLE_MESSAGE).toMatch(/current Program/);
  });
});

describe("Pass ownership", () => {
  it("matches only the same Constituent AND current Program", () => {
    const ctx = resolveConstituentPassContext(YOUTH);
    expect(isPassInContext({ youthId: "1", programId: 1 }, ctx)).toBe(true);
    expect(isPassInContext({ youthId: "2", programId: 1 }, ctx)).toBe(false);
    expect(isPassInContext({ youthId: "1", programId: 3 }, ctx)).toBe(false);
  });
  it("never matches while the context is unavailable", () => {
    setYouthProgramEnrollmentsData(
      original.filter((e) => e.constituentId !== YOUTH),
    );
    const ctx = resolveConstituentPassContext(YOUTH);
    expect(isPassInContext({ youthId: "1", programId: 1 }, ctx)).toBe(false);
  });
});
