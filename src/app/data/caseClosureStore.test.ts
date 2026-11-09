// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  CLOSING_LIST_DAYS,
  __resetCaseClosuresForTest,
  finalizeCaseClosure,
  getCaseClosureData,
  getClosureStatus,
  processClosureEligibility,
  reopenCaseClosure,
  startCaseClosure,
} from "./caseClosureStore";

const day = (n: number) => new Date(2026, 9, 1 + n, 9, 30);
const START = day(0);

beforeEach(() =>
  __resetCaseClosuresForTest({
    closures: {},
    notifications: [],
  }),
);

describe("closure lifecycle", () => {
  it("day 29 closing, day 30 and 31 eligible", () => {
    startCaseClosure("L-1", "Youth One", START);
    const c = getCaseClosureData().closures["L-1"];
    expect(CLOSING_LIST_DAYS).toBe(30);
    expect(getClosureStatus(c, day(29))).toBe("closing");
    expect(getClosureStatus(c, day(30))).toBe("eligible");
    expect(getClosureStatus(c, day(31))).toBe("eligible");
  });

  it("re-saving Closed never resets the timer", () => {
    startCaseClosure("L-1", "Youth One", START);
    startCaseClosure("L-1", "Youth One", day(10));
    expect(
      getCaseClosureData().closures["L-1"].closingStartedAt,
    ).toBe(START.toISOString());
  });

  it("one durable notification per cycle, across refresh/resume", () => {
    startCaseClosure("L-1", "Youth One", START);
    expect(processClosureEligibility(day(29))).toHaveLength(0);
    expect(processClosureEligibility(day(30))).toHaveLength(1);
    expect(processClosureEligibility(day(30))).toHaveLength(0);
    // "Refresh": same persisted data reloaded.
    __resetCaseClosuresForTest(
      JSON.parse(JSON.stringify(getCaseClosureData())),
    );
    expect(processClosureEligibility(day(31))).toHaveLength(0);
    expect(getCaseClosureData().notifications).toHaveLength(1);
  });

  it("eligibility is not archival: the record stays until finalized", () => {
    startCaseClosure("L-1", "Youth One", START);
    processClosureEligibility(day(45));
    expect(getCaseClosureData().closures["L-1"].state).toBe(
      "closing",
    );
    finalizeCaseClosure("L-1", "Staff", day(46));
    const c = getCaseClosureData().closures["L-1"];
    expect(getClosureStatus(c, day(46))).toBe("finalized");
    expect(c.closingStartedAt).toBe(START.toISOString());
    expect(c.finalizedBy).toBe("Staff");
  });

  it("reopening before finalization ends the cycle; finalized stays closed", () => {
    startCaseClosure("L-1", "Youth One", START);
    reopenCaseClosure("L-1");
    expect(
      getCaseClosureData().closures["L-1"],
    ).toBeUndefined();
    startCaseClosure("L-2", "Youth Two", START);
    finalizeCaseClosure("L-2", "Staff", day(1));
    reopenCaseClosure("L-2");
    expect(getCaseClosureData().closures["L-2"].state).toBe(
      "finalized",
    );
  });

  it("seed mapping keeps original closure dates", () => {
    __resetCaseClosuresForTest();
    const { closures } = getCaseClosureData();
    // L-016 / L-018 were on the old Closing List (pending closure);
    // L-019 has no Closing List date → legacy finalized Closed.
    expect(closures["L-016"].state).toBe("closing");
    expect(closures["L-018"].state).toBe("closing");
    expect(closures["L-019"].state).toBe("finalized");
  });
});