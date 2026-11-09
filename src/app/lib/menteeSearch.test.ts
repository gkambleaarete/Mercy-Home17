import { describe, expect, it } from "vitest";
import {
  BLANK_FILTER_VALUE,
  BLANK_MENTEE_CRITERIA,
  ageOf,
  columnFilterOptions,
  filterMentees,
  formatDisplayDate,
  inAgeBand,
  type MenteeSearchRow,
} from "./menteeSearch";

const mk = (o: Partial<MenteeSearchRow>): MenteeSearchRow => ({
  id: "x",
  name: "Test Youth",
  initials: "TY",
  gender: "Male",
  subProgramme: "Community-Based",
  stage: "Referral Received",
  location: "",
  age: null,
  interests: [],
  ethnicity: "",
  religion: "",
  dob: "",
  referralDate: "",
  promotionDate: "",
  ...o,
});

const rows = [
  mk({
    id: "1",
    name: "Ana María Ruiz",
    gender: "Female",
    age: 5,
    stage: "Active",
    subProgramme: "Work-Based",
    interests: ["Chess"],
  }),
  mk({
    id: "2",
    name: "Ben Cole",
    gender: "Male",
    age: 10,
    stage: "Matched",
  }),
  mk({
    id: "3",
    name: "Cy Dunn",
    gender: "Other",
    age: 11,
    stage: "Ready for Match",
    subProgramme: "School-Based",
  }),
  mk({ id: "4", name: "Di Eng", gender: "", age: 17 }),
  mk({ id: "5", name: "Ed Fox", gender: "Nonbinary", age: 18 }),
  mk({ id: "6", name: "Flo Gray", gender: "Female", age: 19 }),
  mk({ id: "7", name: "Gus Hill", gender: "Male", age: null }),
];
const ids = (c = {}, f = {}) =>
  filterMentees(rows, { ...BLANK_MENTEE_CRITERIA, ...c }, f)
    .map((r) => r.id)
    .join();

describe("age", () => {
  it("counts completed years and respects birthday boundaries", () => {
    const today = new Date(2026, 9, 22);
    expect(ageOf("10/22/2016", today)).toBe(10);
    expect(ageOf("10/23/2016", today)).toBe(9);
    expect(ageOf("10/21/2008", today)).toBe(18);
    expect(ageOf("10/23/2007", today)).toBe(19 - 1);
  });
  it("is unknown for missing, invalid or future dates", () => {
    expect(ageOf("", new Date())).toBeNull();
    expect(ageOf("02/30/2015", new Date())).toBeNull();
    expect(ageOf("13/01/2015", new Date())).toBeNull();
    expect(ageOf("01/01/2999", new Date())).toBeNull();
  });
  it("applies the ranges literally; 18 is in both upper bands", () => {
    expect(
      [4, 5, 10, 11, 17, 18, 19].map((a) =>
        inAgeBand(a, "5-10"),
      ),
    ).toEqual([false, true, true, false, false, false, false]);
    expect(
      [4, 5, 10, 11, 17, 18, 19].map((a) =>
        inAgeBand(a, "11-18"),
      ),
    ).toEqual([false, false, false, true, true, true, false]);
    expect(
      [4, 5, 10, 11, 17, 18, 19].map((a) =>
        inAgeBand(a, "18+"),
      ),
    ).toEqual([false, false, false, false, false, true, true]);
    expect(
      inAgeBand(null, "5-10") ||
        inAgeBand(null, "11-18") ||
        inAgeBand(null, "18+"),
    ).toBe(false);
  });
});

describe("dates", () => {
  it("formats valid dates as MM/DD/YYYY and blanks invalid ones", () => {
    expect(formatDisplayDate("3/5/2013")).toBe("");
    expect(formatDisplayDate("03/05/2013")).toBe("03/05/2013");
    expect(formatDisplayDate("2013-03-05")).toBe("03/05/2013");
    expect(formatDisplayDate("02/30/2013")).toBe("");
    expect(formatDisplayDate(null)).toBe("");
  });
});

describe("filters", () => {
  it("name: partial, case-insensitive, trimmed, accent-preserving full names", () => {
    expect(ids({ name: "  BEN " })).toBe("2");
    expect(ids({ name: "ben cole" })).toBe("2");
    expect(ids({ name: "ana  maría" })).toBe("1");
    expect(ids({ name: "ZZZ" })).toBe("");
  });
  it("OR within a filter, AND across filters", () => {
    expect(ids({ stages: ["Active", "Matched"] })).toBe("1,2");
    expect(
      ids({ stages: ["Active", "Matched"], genders: ["Male"] }),
    ).toBe("2");
    expect(
      ids({ subProgrammes: ["Work-Based", "School-Based"] }),
    ).toBe("1,3");
  });
  it("gender: Other matches only Other; unknown values are preserved, not Other", () => {
    expect(ids({ genders: ["Other"] })).toBe("3");
    expect(ids({ genders: ["Male", "Female"] })).toBe(
      "1,2,6,7",
    );
  });
  it("age bands, 18 in both; unknown never matches", () => {
    expect(ids({ ageBand: "5-10" })).toBe("1,2");
    expect(ids({ ageBand: "11-18" })).toBe("3,4,5");
    expect(ids({ ageBand: "18+" })).toBe("5,6");
  });
  it("column filters: OR within, AND with toolbar, blank selectable", () => {
    expect(ids({}, { age: ["18", "19"] })).toBe("5,6");
    expect(ids({}, { age: [BLANK_FILTER_VALUE] })).toBe("7");
    expect(
      ids(
        { genders: ["Female"] },
        { age: ["19", BLANK_FILTER_VALUE] },
      ),
    ).toBe("6");
    expect(ids({}, { interests: ["Chess"] })).toBe("1");
    expect(ids({}, { interests: [] })).toBe("1,2,3,4,5,6,7");
  });
  it("options come from the whole dataset, blank first", () => {
    expect(columnFilterOptions(rows, "age")).toEqual([
      BLANK_FILTER_VALUE,
      "5",
      "10",
      "11",
      "17",
      "18",
      "19",
    ]);
    expect(columnFilterOptions(rows, "ethnicity")).toEqual([
      BLANK_FILTER_VALUE,
    ]);
  });
});