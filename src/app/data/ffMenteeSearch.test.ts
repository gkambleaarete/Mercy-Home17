import { describe, expect, it } from "vitest";
import { buildMenteeSearchRows } from "./ffMenteeSearch";
import type {
  FFMentee,
  FFReferralRecord,
} from "./mockFriendsFirstData";

const mentee = (o: Partial<FFMentee>): FFMentee =>
  ({
    id: "M-1",
    name: "Zoe Test",
    initials: "ZT",
    dob: "04/10/2015",
    gender: "Female",
    programme: "Community-Based",
    stage: "Active",
    promotionDate: "09/01/2026",
    referralId: "R-1",
    referralSource: "",
    transportation: "",
    coordinator: "",
    intakeScheduledDate: null,
    guardianIntakeDate: null,
    youthIntakeDate: null,
    notes: "",
    ...o,
  }) as FFMentee;
const referral = (
  o: Partial<FFReferralRecord>,
): FFReferralRecord =>
  ({
    id: "R-1",
    submittedDate: "08/01/2026",
    referralDate: "07/15/2026",
    state: "WRONG-CALLER-STATE",
    answers: {
      bd_city: "Evanston",
      bd_state: "IL",
      bd_ethnicity: "Group A",
    },
    ...o,
  }) as unknown as FFReferralRecord;
const today = new Date(2026, 9, 22);

describe("buildMenteeSearchRows", () => {
  it("shows Active-stage mentees and excludes only the Inactive flag, once per id", () => {
    const rows = buildMenteeSearchRows(
      [
        mentee({ id: "A", stage: "Active" }),
        mentee({ id: "B", stage: "Active", inactive: true }),
        mentee({ id: "A", stage: "Matched" }),
      ],
      [referral({})],
      today,
    );
    expect(rows.map((r) => `${r.id}:${r.stage}`)).toEqual([
      "A:Active",
    ]);
  });
  it("maps youth fields from the linked referral and keeps dates separate", () => {
    const [r] = buildMenteeSearchRows(
      [mentee({})],
      [referral({})],
      today,
    );
    expect(r).toMatchObject({
      location: "Evanston, IL",
      ethnicity: "Group A",
      religion: "",
      referralDate: "07/15/2026",
      promotionDate: "09/01/2026",
      dob: "04/10/2015",
      age: 11,
    });
  });
  it("never substitutes other dates or the caller's location", () => {
    const [r] = buildMenteeSearchRows(
      [mentee({ promotionDate: null })],
      [referral({ referralDate: "", answers: {} })],
      today,
    );
    expect(r.referralDate).toBe("");
    expect(r.promotionDate).toBe("");
    expect(r.location).toBe("");
    expect(r.ethnicity).toBe("");
  });
  it("uses the youth intake interests, falling back to the free-time answer", () => {
    const base = { guardianIntake: null } as Partial<FFMentee>;
    const legacy = buildMenteeSearchRows(
      [
        mentee({
          ...base,
          youthIntake: {
            interestsHobbies: "Chess, Soccer",
            answers: { y_freeTime: "Ignored" },
          } as never,
        }),
      ],
      [],
      today,
    )[0];
    expect(legacy.interests).toEqual(["Chess", "Soccer"]);
    const current = buildMenteeSearchRows(
      [
        mentee({
          ...base,
          youthIntake: {
            interestsHobbies: "",
            answers: { y_freeTime: "Drawing" },
          } as never,
        }),
      ],
      [],
      today,
    )[0];
    expect(current.interests).toEqual(["Drawing"]);
  });
  it("does not join by name: an unlinked mentee gets no referral values", () => {
    const [r] = buildMenteeSearchRows(
      [mentee({ referralId: null })],
      [referral({ candidateName: "Zoe Test" } as never)],
      today,
    );
    expect(r.referralDate).toBe("");
    expect(r.location).toBe("");
  });
});