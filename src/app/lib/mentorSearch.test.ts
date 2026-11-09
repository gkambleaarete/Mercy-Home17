import { describe, expect, it } from "vitest";
import {
  BLANK_CRITERIA,
  BLANK_FILTER_VALUE,
  ageFromBirthDate,
  columnFilterOptions,
  filterMentors,
  sortMentors,
  splitInterests,
  type MentorSearchRow,
} from "./mentorSearch";

const mk = (o: Partial<MentorSearchRow>): MentorSearchRow => ({
  id: "x",
  name: "A B",
  firstName: "A",
  lastName: "B",
  initials: "AB",
  email: "a@b.com",
  subProgrammes: ["Community-Based"],
  status: "",
  pipelineStage: "",
  accountCreatedDate: "",
  startDate: "",
  coordinator: "",
  location: "",
  age: null,
  interests: [],
  ethnicity: "",
  religion: "",
  promotionDate: "",
  demo: false,
  ...o,
});

const rows = [
  mk({
    id: "1",
    name: "Angela Moretti",
    firstName: "Angela",
    lastName: "Moretti",
    email: "A.Moretti@gmail.com",
    subProgrammes: ["Community-Based", "Work-Based"],
    age: 34,
    startDate: "01/08/2025",
    interests: ["Golf", "Chess"],
  }),
  mk({
    id: "2",
    name: "Bob O'Neil",
    firstName: "Bob",
    lastName: "O'Neil",
    email: "bob@x.org",
    subProgrammes: ["School-Based"],
    age: 9,
    startDate: "12/01/2024",
  }),
  mk({
    id: "3",
    name: "Cy",
    firstName: "Cy",
    lastName: "",
    email: "cy@x.org",
  }),
];
const ids = (
  c: Partial<typeof BLANK_CRITERIA> = {},
  f: Parameters<typeof filterMentors>[2] = {},
) =>
  filterMentors(rows, { ...BLANK_CRITERIA, ...c }, f)
    .map((r) => r.id)
    .join();

describe("ageFromBirthDate", () => {
  it("counts completed years only", () => {
    expect(
      ageFromBirthDate("04/11/1991", new Date(2026, 3, 10)),
    ).toBe(34);
    expect(
      ageFromBirthDate("04/11/1991", new Date(2026, 3, 11)),
    ).toBe(35);
  });
  it("is blank for invalid, missing or future dates", () => {
    expect(ageFromBirthDate("02/30/1991")).toBeNull();
    expect(ageFromBirthDate("")).toBeNull();
    expect(ageFromBirthDate("01/01/2999")).toBeNull();
  });
});

describe("search criteria", () => {
  it("trims, ignores case and matches partially", () => {
    expect(ids({ firstName: "  aNG " })).toBe("1");
    expect(ids({ email: "X.ORG" })).toBe("2,3");
  });
  it("ANDs fields and ORs sub-programs without duplicates", () => {
    expect(ids({ firstName: "b", email: "x.org" })).toBe("2");
    expect(
      ids({ subProgrammes: ["Community-Based", "Work-Based"] }),
    ).toBe("1,3");
    expect(ids()).toBe("1,2,3");
  });
});

describe("column filters", () => {
  it("OR within a column, AND across columns, blank selectable", () => {
    expect(ids({}, { age: ["34"] })).toBe("1");
    expect(ids({}, { age: [BLANK_FILTER_VALUE] })).toBe("3");
    expect(ids({}, { age: ["9", BLANK_FILTER_VALUE] })).toBe(
      "2,3",
    );
    expect(
      ids({}, { subProgramme: ["Work-Based"], age: ["34"] }),
    ).toBe("1");
    expect(
      ids({ subProgrammes: ["School-Based"] }, { age: ["34"] }),
    ).toBe("");
    expect(ids({}, { age: [] })).toBe("1,2,3");
  });
  it("matches any individual value of a multi-value cell", () => {
    expect(ids({}, { interests: ["Chess"] })).toBe("1");
    expect(ids({}, { interests: [BLANK_FILTER_VALUE] })).toBe(
      "2,3",
    );
  });
  it("builds options from the whole directory, blank first", () => {
    expect(columnFilterOptions(rows, "age")).toEqual([
      BLANK_FILTER_VALUE,
      "9",
      "34",
    ]);
    expect(columnFilterOptions(rows, "name")[0]).toBe(
      "Angela Moretti (A.Moretti@gmail.com)",
    );
  });
});

describe("sorting", () => {
  const s = (
    k: Parameters<typeof sortMentors>[1],
    d: "asc" | "desc",
  ) =>
    sortMentors(rows, k, d)
      .map((r) => r.id)
      .join();
  it("sorts age numerically and dates chronologically, blanks last", () => {
    expect(s("age", "asc")).toBe("2,1,3");
    expect(s("age", "desc")).toBe("1,2,3");
    expect(s("startDate", "asc")).toBe("2,1,3");
    expect(s("startDate", "desc")).toBe("1,2,3");
  });
});

describe("splitInterests", () => {
  it("splits on commas, semicolons and line breaks without duplicates", () => {
    expect(splitInterests("Golf, chess;GOLF\nart")).toEqual([
      "Golf",
      "chess",
      "art",
    ]);
  });
});