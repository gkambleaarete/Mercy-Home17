import { afterEach, describe, expect, it } from "vitest";
import { ALL_LEADS } from "../data/mockLeadsData";
import {
  admissionScope,
  scopeIsValid,
  scopeKey,
  verifyOwner,
  youthScope,
} from "./youthDocumentOwner";

const lead = (id: string) =>
  ALL_LEADS.find((l) => l.id === id)!;
const original = new Map(
  ALL_LEADS.map((l) => [l.id, l.youthConstituentId]),
);
afterEach(() => {
  ALL_LEADS.forEach((l) => {
    l.youthConstituentId = original.get(l.id);
  });
});

describe("owner verification", () => {
  it("validates each owner against its own authoritative records", () => {
    expect(verifyOwner({ kind: "youth", id: "1" })).toBe(true);
    expect(
      verifyOwner({ kind: "admission", id: "L-001" }),
    ).toBe(true);
    expect(verifyOwner({ kind: "youth", id: "9999" })).toBe(
      false,
    );
    expect(
      verifyOwner({ kind: "admission", id: "L-NOPE" }),
    ).toBe(false);
    expect(verifyOwner({ kind: "youth", id: "" })).toBe(false);
  });

  it("never accepts one identifier type in place of the other", () => {
    expect(verifyOwner({ kind: "youth", id: "L-001" })).toBe(
      false,
    );
    expect(verifyOwner({ kind: "admission", id: "1" })).toBe(
      false,
    );
    expect(youthScope("L-001")).toBeNull();
    expect(admissionScope("1")).toBeNull();
  });

  it("a non-Youth Constituent is not a valid Youth owner", () => {
    // 3 = Sarah Chen, External Constituent
    expect(verifyOwner({ kind: "youth", id: "3" })).toBe(false);
  });
});

describe("scopes and explicit links", () => {
  it("an unlinked Admissions record owns its documents alone", () => {
    const s = admissionScope("L-001")!;
    expect(s.primary).toEqual({
      kind: "admission",
      id: "L-001",
    });
    expect(s.owners).toEqual([
      { kind: "admission", id: "L-001" },
    ]);
  });

  it("a Youth's scope includes only Admissions records with an explicit link", () => {
    const s = youthScope("1")!;
    expect(s.primary).toEqual({ kind: "youth", id: "1" });
    expect(s.owners).toContainEqual({
      kind: "admission",
      id: "L-DEMO-20093",
    });
    expect(s.owners).not.toContainEqual({
      kind: "admission",
      id: "L-001",
    });
  });

  it("the linked Admissions record resolves the same scope as the Youth", () => {
    expect(scopeKey(admissionScope("L-DEMO-20093"))).toBe(
      scopeKey(youthScope("1")),
    );
  });

  it("an explicit link — and only that — joins the two profiles", () => {
    lead("L-001").youthConstituentId = 2;
    const viaAdmission = admissionScope("L-001")!;
    const viaYouth = youthScope("2")!;
    expect(scopeKey(viaAdmission)).toBe(scopeKey(viaYouth));
    expect(viaYouth.owners).toContainEqual({
      kind: "admission",
      id: "L-001",
    });
    // L-019 is the same child (same "Y-001" key, same name) but has no
    // explicit link: nothing is inferred from either.
    expect(viaYouth.owners).not.toContainEqual({
      kind: "admission",
      id: "L-019",
    });
    expect(admissionScope("L-019")!.primary.kind).toBe(
      "admission",
    );
  });

  it("a link to a non-Youth or unknown Constituent is ignored", () => {
    lead("L-001").youthConstituentId = 3; // External Constituent
    expect(admissionScope("L-001")!.primary.kind).toBe(
      "admission",
    );
    lead("L-001").youthConstituentId = 9999;
    expect(admissionScope("L-001")!.primary.kind).toBe(
      "admission",
    );
  });

  it("rejects forged scopes", () => {
    expect(scopeIsValid(null)).toBe(false);
    expect(
      scopeIsValid({
        primary: { kind: "youth", id: "9999" },
        owners: [{ kind: "youth", id: "9999" }],
      }),
    ).toBe(false);
    expect(
      scopeIsValid({
        primary: { kind: "admission", id: "L-001" },
        owners: [{ kind: "youth", id: "1" }],
      }),
    ).toBe(false); // primary not among owners
    expect(
      scopeIsValid({
        primary: { kind: "youth", id: "1" },
        owners: [
          { kind: "youth", id: "1" },
          { kind: "admission", id: "L-NOPE" },
        ],
      }),
    ).toBe(false);
  });
});