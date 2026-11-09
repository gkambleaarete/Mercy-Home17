import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  calcAge,
  validateReferral,
  type RefInput,
} from "./ffReferralDefinitions";
import { FF_REFERRAL_PERSONAS } from "./ffReferralPermissions";

const STAFF = FF_REFERRAL_PERSONAS["ff-staff"];
const INTAKE = FF_REFERRAL_PERSONAS["referral-intake"];
const KEY = "mh.ffMenteeRecords.v1";
const NOW = new Date(2026, 9, 21, 10, 0);

// ── Fake browser storage (module state loads from it on import) ──
let store: Record<string, string> = {};
let failWrites = false;
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => (k in store ? store[k] : null),
  setItem: (k: string, v: string) => {
    if (failWrites) throw new Error("QuotaExceeded");
    store[k] = v;
  },
  removeItem: (k: string) => delete store[k],
};

async function freshStore() {
  vi.resetModules();
  return import("./ffMenteeStore");
}

beforeEach(() => {
  store = {};
  failWrites = false;
});

const CB_VALUES: Record<string, string> = {
  staffRecommendation: "Strong fit for CB.",
  referralDate: "10/01/2026",
  callerName: "Maria Lopez",
  referrerRole: "School Counselor",
  callerRelationship: "Counselor",
  language: "English",
  phone: "0312 555 0100",
  extension: "012",
  email: "maria@example.org",
  state: "IL",
  zipcode: "06060",
  referralSource: "School",
  communityReferralOrg: "Rowe",
  candidateName: "Ava Diaz",
  candidateDob: "05/02/2014",
  candidateGender: "Female",
  followUp: "Call next week",
  contactDate: "10/01/2026",
  contactTime: "9:00 AM",
  contactType: "Phone",
  contactResult: "Reached",
  contactOrganization: "Rowe",
  contactDetails: "Spoke with counselor",
  bd_guardianName: "Rosa Diaz",
  bd_addressType: "Home",
  bd_address: "1 Main St",
  bd_city: "Chicago",
  bd_state: "IL",
  bd_zip: "60601",
  bd_neighborhood: "Loop",
  bd_ethnicity: "Hispanic",
  bs_runaway: "No",
  bs_selfHarm: "No",
  bs_hospitalized: "No",
  bs_aggressive: "No",
  rr_motivated: "Yes",
  rr_infoReceived: "Report card",
  familySituation: "Lives with mother",
  rr_otherSupport: "None",
  whyMentor: "Needs a role model",
  specialEducation: "No",
  rr_grades: "B average",
  rr_legal: "None",
  med_taking: "No",
  th_receiving: "No",
  ya_strengths: "Kind",
  ya_personality: "Art",
  ya_availability: "Weekends",
  ya_scheduling: "Flexible",
  ya_publicTransport: "Yes",
  so_impressions: "Positive",
  so_recommended: "Yes",
  so_notReferredReason: "Not applicable",
  so_referredOther: "No",
};
const AUTH = {
  authRelease: [
    {
      id: "row-1",
      dateSent: "09/01",
      dateReceived: "09/03",
      consentWith: "Teacher",
    },
  ],
};
const cb = (over: Record<string, string> = {}): RefInput => ({
  program: "Community-Based",
  values: { ...CB_VALUES, ...over },
  grids: AUTH,
});
const ids = (input: RefInput, staff = true) =>
  validateReferral(input, staff, NOW).map((e) => e.id);

describe("candidate age", () => {
  const today = new Date(2026, 9, 21);
  it("counts completed years around the birthday", () => {
    expect(calcAge("10/20/2014", today)).toBe(12);
    expect(calcAge("10/21/2014", today)).toBe(12);
    expect(calcAge("10/22/2014", today)).toBe(11);
  });
  it("rejects incomplete, impossible and future dates", () => {
    expect(calcAge("10/2", today)).toBeNull();
    expect(calcAge("02/30/2014", today)).toBeNull();
    expect(calcAge("10/22/2026", today)).toBeNull();
  });
});

describe("referral validation", () => {
  it("requires an explicit program and the staff recommendation", () => {
    expect(ids({ program: "", values: {}, grids: {} })).toEqual(
      ["rf-recommendedProgram", "rf-staffRecommendation"],
    );
  });

  it("accepts a complete CB referral", () => {
    expect(ids(cb())).toEqual([]);
  });

  it("treats whitespace as unanswered", () => {
    expect(ids(cb({ callerName: "   " }))).toEqual([
      "rf-callerName",
    ]);
  });

  it("swaps Referral Source for the hearing-about question for Parent/Guardian", () => {
    const parent = cb({
      referrerRole: "parent/guardian",
      referralSource: "",
    });
    expect(ids(parent)).toEqual(["rf-rr_heardAbout"]);
    expect(ids(cb({ referralSource: "" }))).toEqual([
      "rf-referralSource",
    ]);
  });

  it("requires medication and therapy follow-ups only after Yes", () => {
    const yes = ids(
      cb({ med_taking: "Yes", th_receiving: "Yes" }),
    );
    expect(yes).toHaveLength(10);
    expect(ids(cb({ med_taking: "No", med_name: "" }))).toEqual(
      [],
    );
    expect(ids(cb({ med_taking: "" }))).toEqual([
      "rf-med_taking",
    ]);
  });

  it("validates contact identifiers, email and birthdate", () => {
    expect(
      ids(
        cb({
          phone: "abc",
          extension: "12a",
          email: "nope",
          candidateDob: "12/01/2030",
        }),
      ),
    ).toEqual([
      "rf-phone",
      "rf-extension",
      "rf-email",
      "rf-candidateDob",
    ]);
  });

  it("requires one complete authorization row and rejects partial rows", () => {
    expect(ids({ ...cb(), grids: {} })).toEqual([
      "rf-authRelease-add",
    ]);
    const partial = {
      ...cb(),
      grids: {
        authRelease: [
          ...AUTH.authRelease,
          {
            id: "row-2",
            dateSent: "x",
            dateReceived: "",
            consentWith: "",
          },
          {
            id: "row-3",
            dateSent: "",
            dateReceived: "",
            consentWith: "",
          },
        ],
      },
    };
    expect(ids(partial)).toEqual([
      "rf-authRelease-row-2-dateReceived",
      "rf-authRelease-row-2-consentWith",
    ]);
  });

  it("makes Resource Details mandatory only for an affirmative answer", () => {
    expect(ids(cb({ so_referredOther: "Yes, YMCA" }))).toEqual([
      "rf-so_resourceDetails",
    ]);
    expect(
      ids(cb({ so_referredOther: "Maybe later" })),
    ).toEqual([]);
  });

  it("skips Staff Observations for unauthorized users", () => {
    expect(ids(cb({ so_impressions: "" }), false)).toEqual([]);
    expect(ids(cb({ so_impressions: "" }), true)).toEqual([
      "rf-so_impressions",
    ]);
  });

  it("validates WB/SB question sets without CB-only fields", () => {
    const wb: RefInput = {
      program: "Work-Based",
      values: { staffRecommendation: "x", wb_enrolled: "Yes" },
      grids: {},
    };
    expect(ids(wb)).toEqual([
      "rf-wb_thursdays",
      "rf-wb_pickup",
      "rf-wb_extracurricular",
    ]);
    const sb: RefInput = {
      program: "School-Based",
      values: {
        staffRecommendation: "x",
        sb_enrolled: "a",
        sb_tuesdays: "b",
        sb_extracurricular: "c",
      },
      grids: {},
    };
    expect(ids(sb)).toEqual([]);
  });
});

describe("referral persistence", () => {
  it("saves an incomplete draft and updates the same id on resave", async () => {
    const s = await freshStore();
    const a = s.saveFFReferralDraft(
      { program: "", values: { callerName: "M" }, grids: {} },
      STAFF,
      NOW,
    );
    expect(a.ok).toBe(true);
    if (!a.ok) return;
    const b = s.saveFFReferralDraft(
      {
        id: a.referral.id,
        program: "Work-Based",
        values: { callerName: "M2" },
        grids: {},
      },
      STAFF,
      NOW,
    );
    expect(b.ok && b.referral.id).toBe(a.referral.id);
    const reloaded = await freshStore();
    const saved = reloaded.getSavedFFReferral(a.referral.id)!;
    expect(saved.status).toBe("draft");
    expect(saved.answers?.callerName).toBe("M2");
    expect(
      Object.keys(JSON.parse(store[KEY]).referrals),
    ).toHaveLength(1);
  });

  it("drafts are not offered as submitted referral choices", async () => {
    const s = await freshStore();
    const r = s.saveFFReferralDraft(cb(), STAFF, NOW);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(s.getFFReferral(r.referral.id)).toBeUndefined();
  });

  it("changes nothing when the write fails", async () => {
    const s = await freshStore();
    failWrites = true;
    const r = s.submitFFReferral(cb(), STAFF, NOW);
    expect(r).toEqual({ ok: false, reason: "storage" });
    expect(
      s
        .listFFReferrals()
        .some((x) => x.callerName === "Maria Lopez"),
    ).toBe(false);
  });

  it("submits once, keeps the Referral Date and does not create a mentee", async () => {
    const s = await freshStore();
    const mentees = JSON.stringify(
      Object.keys(
        JSON.parse(store[KEY] ?? '{"mentees":{}}').mentees,
      ),
    );
    const r = s.submitFFReferral(cb(), STAFF, NOW);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.referral.status).toBe("submitted");
    expect(r.referral.referralDate).toBe("10/01/2026");
    expect(r.referral.submittedDate).toBe("10/21/2026");
    expect(
      JSON.stringify(
        Object.keys(JSON.parse(store[KEY]).mentees),
      ),
    ).toBe(mentees);
    const again = s.submitFFReferral(
      { ...cb(), id: r.referral.id },
      STAFF,
      NOW,
    );
    expect(again).toEqual({ ok: false, reason: "locked" });
  });

  it("rejects an invalid submission inside the store", async () => {
    const s = await freshStore();
    const r = s.submitFFReferral(
      cb({ candidateName: "" }),
      STAFF,
      NOW,
    );
    expect(r.ok).toBe(false);
    expect(!r.ok && r.reason).toBe("invalid");
    expect(store[KEY]).toBeUndefined();
  });

  it("ignores staff observations from an unauthorized user", async () => {
    const s = await freshStore();
    const a = s.saveFFReferralDraft(cb(), STAFF, NOW);
    if (!a.ok) throw new Error("save failed");
    const b = s.saveFFReferralDraft(
      {
        ...cb({ so_impressions: "Overwritten" }),
        id: a.referral.id,
      },
      INTAKE,
      NOW,
    );
    expect(b.ok && b.referral.answers?.so_impressions).toBe(
      "Positive",
    );
  });

  it("records Details History only for real, successful changes", async () => {
    const s = await freshStore();
    const a = s.saveFFReferralDraft(cb(), STAFF, NOW);
    if (!a.ok) throw new Error();
    expect(a.referral.detailsHistory).toHaveLength(1);
    const same = s.saveFFReferralDraft(
      { ...cb(), id: a.referral.id },
      STAFF,
      NOW,
    );
    expect(
      same.ok && same.referral.detailsHistory,
    ).toHaveLength(1);
    failWrites = true;
    s.saveFFReferralDraft(
      { ...cb({ followUp: "Later" }), id: a.referral.id },
      STAFF,
      NOW,
    );
    failWrites = false;
    expect(
      s.getSavedFFReferral(a.referral.id)!.detailsHistory,
    ).toHaveLength(1);
    const changed = s.saveFFReferralDraft(
      { ...cb({ followUp: "Later" }), id: a.referral.id },
      STAFF,
      NOW,
    );
    expect(
      changed.ok &&
        changed.referral.detailsHistory?.[1].changes,
    ).toEqual([
      {
        key: "followUp",
        label: "Follow Up",
        from: "Call next week",
        to: "Later",
      },
    ]);
  });

  it("promotes a CB referral once, atomically", async () => {
    const s = await freshStore();
    const sub = s.submitFFReferral(cb(), STAFF, NOW);
    if (!sub.ok) throw new Error();
    failWrites = true;
    expect(s.promoteFFReferral(sub.referral.id, NOW)).toEqual({
      ok: false,
      reason: "storage",
    });
    expect(s.getSavedFFReferral(sub.referral.id)!.status).toBe(
      "submitted",
    );
    failWrites = false;
    const p = s.promoteFFReferral(sub.referral.id, NOW);
    expect(p.ok).toBe(true);
    if (!p.ok) return;
    expect(p.mentee.name).toBe("Ava Diaz");
    expect(p.mentee.referralId).toBe(sub.referral.id);
    expect(p.mentee.coordinator).toBe("");
    const again = s.promoteFFReferral(sub.referral.id, NOW);
    expect(again.ok && again.existing && again.mentee.id).toBe(
      p.mentee.id,
    );
    const reloaded = await freshStore();
    expect(
      reloaded.getFFReferral(sub.referral.id)?.status,
    ).toBe("promoted");
    expect(reloaded.getFFMentee(p.mentee.id)?.referralId).toBe(
      sub.referral.id,
    );
  });

  it("refuses WB promotion without an identity source, ignoring dormant CB answers", async () => {
    const s = await freshStore();
    const sub = s.submitFFReferral(
      {
        program: "Work-Based",
        values: {
          ...CB_VALUES,
          wb_enrolled: "a",
          wb_thursdays: "b",
          wb_pickup: "c",
          wb_extracurricular: "d",
        },
        grids: {},
      },
      STAFF,
      NOW,
    );
    if (!sub.ok) throw new Error(JSON.stringify(sub));
    expect(s.promoteFFReferral(sub.referral.id, NOW)).toEqual({
      ok: false,
      reason: "identity",
    });
  });

  it("never overwrites unreadable storage and keeps unrelated data", async () => {
    store[KEY] = "{not json";
    const s = await freshStore();
    expect(s.isFFStoreUnreadable()).toBe(true);
    expect(s.saveFFReferralDraft(cb(), STAFF, NOW)).toEqual({
      ok: false,
      reason: "unreadable",
    });
    expect(store[KEY]).toBe("{not json");

    store[KEY] = JSON.stringify({
      mentees: {},
      referrals: {},
      matchClosures: {
        "MM-1": { endDate: "x", endTime: "y", at: 1 },
      },
    });
    const t = await freshStore();
    t.saveFFReferralDraft(cb(), STAFF, NOW);
    expect(
      JSON.parse(store[KEY]).matchClosures["MM-1"].at,
    ).toBe(1);
  });

  it("normalizes legacy referrals without inventing answers", async () => {
    const s = await freshStore();
    const seeded = s.getFFReferral("RF-101")!;
    expect(seeded.status).toBeDefined();
    expect(seeded.referralDate).toBe("");
    expect(seeded.answers).toEqual({});
    expect(seeded.submittedDate).toBe("08/28/2025");
  });
});