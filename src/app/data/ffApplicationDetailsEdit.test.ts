// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  __reloadFFMentorApplicationsForTest,
  getFFMentorApplication,
  getFFMentorApplicationForApplicant,
  getFFMentorApplicationStaff,
  listFFMentorApplications,
  saveFFMentorApplicationDetails,
  saveFFMentorAvailability,
  saveFFMentorCoordinatorDetails,
} from "./ffMentorApplicationStore";
import { currentAvailability } from "./ffMentorApplication";
import { resolveLegacyMentorForDirectory } from "./ffMentorDirectory";
import { getFFMentorById } from "./mockFriendsFirstData";
import { mentorName } from "./mockMentorMatchData";
import { confirmFFMentorInactive } from "./ffMentorInactive";

const APP_KEY = "mh.ffMentorApplications.v1";
const actor = { id: "staff-test", name: "Test Staff" };
const eff = (id: string) => {
  const r = getFFMentorApplication(id);
  if (r.status !== "found") throw new Error("missing " + id);
  return r.application;
};
const save = (id: string, change: any, base: any) =>
  saveFFMentorApplicationDetails(
    id,
    change,
    base,
    actor,
    new Date(2026, 9, 21, 9, 5),
  );

beforeEach(() => {
  localStorage.clear();
  __reloadFFMentorApplicationsForTest();
});

describe("saving Application Details (older seeded mentor)", () => {
  it("applies staff corrections over the mapped answers, keeping provenance and the strict population", () => {
    const before = eff("FF-CB-101");
    const r = save(
      "FF-CB-101",
      {
        overview: {
          firstName: "Angie",
          phone: "(312) 555-9999",
          city: "Evanston",
          zip: "60201",
        },
        describe: {
          languages: ["English", "Italian", "Spanish"],
          languageProficiency: {
            Spanish: { read: false, write: false, speak: true },
          },
        },
      },
      {
        overview: {
          firstName: "Angela",
          phone: "(312) 555-0142",
          city: "Chicago",
          zip: "60657",
        },
        describe: {
          languages: before.answers.describe.languages,
          languageProficiency:
            before.answers.describe.languageProficiency,
        },
      },
    );
    expect(r.ok).toBe(true);
    const a = eff("FF-CB-101");
    expect(a.answers.overview).toMatchObject({
      firstName: "Angie",
      lastName: "Moretti",
      phone: "(312) 555-9999",
      city: "Evanston",
      zip: "60201",
      email: "a.moretti@gmail.com",
    });
    expect(a.answers.describe.languages).toEqual([
      "English",
      "Italian",
      "Spanish",
    ]);
    expect(
      a.answers.describe.languageProficiency.Spanish,
    ).toEqual({ read: false, write: false, speak: true }); // false kept as a real No
    // The mapped original is untouched, and nothing became a submitted application.
    const saved = JSON.parse(localStorage.getItem(APP_KEY)!);
    expect(saved.applications["FF-CB-101"]).toBeUndefined();
    expect(saved.applicationEdits["FF-CB-101"]).toMatchObject({
      updatedBy: "Test Staff",
      updatedById: "staff-test",
    });
    expect(
      listFFMentorApplications().some(
        (x) => x.applicationId === "FF-CB-101",
      ),
    ).toBe(false);
    // Survives a reload.
    __reloadFFMentorApplicationsForTest();
    expect(eff("FF-CB-101").answers.overview.firstName).toBe(
      "Angie",
    );
    // Other mentors are untouched.
    expect(eff("FF-WB-101").answers.overview.firstName).toBe(
      "Janelle",
    );
  });

  it("propagates to the name lookup and the Mentor Search projection", () => {
    save(
      "FF-CB-101",
      {
        overview: {
          firstName: "Angie",
          city: "Evanston",
          ethnicity: "X",
        },
      },
      {
        overview: {
          firstName: "Angela",
          city: "Chicago",
          ethnicity: "",
        },
      },
    );
    expect(mentorName("FF-CB-101")).toBe("Angie Moretti");
    const r = resolveLegacyMentorForDirectory(
      getFFMentorById("FF-CB-101")!,
    );
    expect(r.application?.answers.overview).toMatchObject({
      firstName: "Angie",
      city: "Evanston",
      ethnicity: "X",
    });
    expect(r.inDirectory).toBe(true); // approval/stage policy unchanged
  });

  it("preserves coordinator, stage, Inactive and match closures", () => {
    saveFFMentorCoordinatorDetails("FF-CB-101", {
      coordinatorId: 6,
      coordinatorNotes: "keep",
    });
    expect(
      confirmFFMentorInactive(
        "FF-CB-101",
        actor,
        new Date(2026, 9, 20),
      ).ok,
    ).toBe(true);
    const staffBefore = JSON.stringify(
      getFFMentorApplicationStaff("FF-CB-101"),
    );
    const mentorsBefore = JSON.stringify(
      JSON.parse(localStorage.getItem(APP_KEY)!).mentors,
    );
    expect(
      save(
        "FF-CB-101",
        { overview: { city: "Skokie" } },
        { overview: { city: "Chicago" } },
      ).ok,
    ).toBe(true);
    expect(
      JSON.stringify(getFFMentorApplicationStaff("FF-CB-101")),
    ).toBe(staffBefore);
    expect(
      JSON.stringify(
        JSON.parse(localStorage.getItem(APP_KEY)!).mentors,
      ),
    ).toBe(mentorsBefore);
  });
});

describe("saving Application Details (submitted VMS application)", () => {
  it("edits Amara's answers without changing the applicant-facing read or other applicants", () => {
    const submitted = getFFMentorApplicationForApplicant(
      "VMS-5101",
      "VOL-2001",
    )!;
    expect(
      save(
        "VMS-5101",
        {
          overview: { email: "amara.new@email.com" },
          describe: { dietaryRestrictions: "None" },
        },
        {
          overview: { email: "amara.osei@email.com" },
          describe: { dietaryRestrictions: "" },
        },
      ).ok,
    ).toBe(true);
    expect(eff("VMS-5101").answers.overview.email).toBe(
      "amara.new@email.com",
    );
    expect(eff("VMS-5101").answers.overview.firstName).toBe(
      "Amara",
    );
    // As submitted for the applicant: staff corrections aren't shown.
    expect(
      getFFMentorApplicationForApplicant(
        "VMS-5101",
        "VOL-2001",
      )!.answers.overview.email,
    ).toBe(submitted.answers.overview.email);
    expect(eff("VMS-5102").answers.overview.email).not.toBe(
      "amara.new@email.com",
    );
    // References, uploads and signatures are untouched.
    expect(eff("VMS-5101").references).toEqual(
      submitted.references,
    );
    expect(eff("VMS-5101").answers.consent).toEqual(
      submitted.answers.consent,
    );
  });
});

describe("protected data and validation", () => {
  it("refuses a payload that names a protected or unknown key, writing nothing", () => {
    const attempts: any[] = [
      { describe: { youthPositiveExperience: "x" } },
      { describe: { youthStrugglingStudent: "x" } },
      { describe: { convicted: true } },
      { describe: { convictedComment: "x" } },
      { overview: { ssn: "123-45-6789" } },
      { overview: { availableDays: ["Monday"] } },
      { references: [] },
      { answers: {} },
    ];
    for (const a of attempts) {
      const r = save("FF-CB-101", a, {});
      expect(r).toMatchObject({
        ok: false,
        reason: "protected",
      });
    }
    expect(localStorage.getItem(APP_KEY)).toBeNull();
  });

  it("validates only what changed and names the fields; blank legacy answers don't block", () => {
    const bad = save(
      "FF-CB-101",
      {
        overview: {
          email: "nope",
          phone: "123",
          dob: "13/45/1999",
          zip: "12",
        },
      },
      {
        overview: {
          email: "a.moretti@gmail.com",
          phone: "(312) 555-0142",
          dob: "04/11/1991",
          zip: "60657",
        },
      },
    );
    expect(bad).toMatchObject({ ok: false, reason: "invalid" });
    expect(
      Object.keys((bad as any).fieldErrors).sort(),
    ).toEqual(["dob", "email", "phone", "zip"]);
    // A correction to one field while other legacy answers (days, etc.) are blank succeeds.
    expect(
      eff("FF-CB-101").answers.overview.availableDays,
    ).toEqual([]);
    expect(
      save(
        "FF-CB-101",
        { overview: { middleName: "R" } },
        { overview: { middleName: "" } },
      ).ok,
    ).toBe(true);
    expect(
      save(
        "FF-CB-101",
        { overview: { firstName: " " } },
        { overview: { firstName: "Angela" } },
      ),
    ).toMatchObject({ ok: false, reason: "invalid" });
    expect(
      save(
        "FF-CB-101",
        { subPrograms: [] },
        { subPrograms: ["community"] },
      ),
    ).toMatchObject({ ok: false, reason: "invalid" });
    expect(save("FF-CB-101", {}, {})).toMatchObject({
      ok: false,
      reason: "empty",
    });
    expect(
      save(
        "FF-NOPE-1",
        { overview: { city: "x" } },
        { overview: { city: "y" } },
      ),
    ).toMatchObject({ ok: false, reason: "missing" });
    expect(
      saveFFMentorApplicationDetails(
        "FF-CB-101",
        { overview: { city: "x" } },
        { overview: { city: "Chicago" } },
        null,
      ),
    ).toMatchObject({ ok: false, reason: "actor" });
  });
});

describe("conflicts and failed writes", () => {
  it("reports a field changed elsewhere, keeps unrelated concurrent changes, and writes nothing", () => {
    // Another save changes the city while a draft (started from "Chicago") is open.
    save(
      "FF-CB-101",
      { overview: { city: "Oak Park" } },
      { overview: { city: "Chicago" } },
    );
    const before = localStorage.getItem(APP_KEY);
    const r = save(
      "FF-CB-101",
      { overview: { city: "Skokie", zip: "60076" } },
      { overview: { city: "Chicago", zip: "60657" } },
    );
    expect(r).toMatchObject({
      ok: false,
      reason: "conflict",
      conflicts: ["city"],
    });
    expect(localStorage.getItem(APP_KEY)).toBe(before);
    expect(eff("FF-CB-101").answers.overview.city).toBe(
      "Oak Park",
    );
    // A draft touching a different field saves and merges with the earlier change.
    expect(
      save(
        "FF-CB-101",
        { overview: { zip: "60076" } },
        { overview: { zip: "60657" } },
      ).ok,
    ).toBe(true);
    expect(eff("FF-CB-101").answers.overview).toMatchObject({
      city: "Oak Park",
      zip: "60076",
    });
  });

  it("a failed write changes neither the details nor the availability override", () => {
    const real = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
    let r;
    try {
      r = save(
        "FF-CB-101",
        {
          overview: { city: "Skokie" },
          availability: {
            availableDays: ["Monday"],
            cbWeekendAvailable: false,
            cbWeekendDetails: "",
            sbTuesdayAvailable: null,
            wbThursdayAvailable: null,
          },
        },
        {
          overview: { city: "Chicago" },
          availability: currentAvailability(
            eff("FF-CB-101"),
            getFFMentorApplicationStaff("FF-CB-101"),
          ),
        },
      );
    } finally {
      Storage.prototype.setItem = real;
    }
    expect(r).toMatchObject({ ok: false, reason: "storage" });
    expect(eff("FF-CB-101").answers.overview.city).toBe(
      "Chicago",
    );
    expect(
      getFFMentorApplicationStaff("FF-CB-101")
        .availabilityOverride,
    ).toBeNull();
  });
});

describe("availability is one shared current record", () => {
  const av = (
    days: string[],
    wk: boolean | null,
    details = "",
  ) => ({
    availableDays: days,
    cbWeekendAvailable: wk,
    cbWeekendDetails: details,
    sbTuesdayAvailable: null,
    wbThursdayAvailable: null,
  });
  it("either editor's save is what the other shows; No stays No; weekend details clear", () => {
    const a0 = eff("FF-CB-101");
    const cur0 = currentAvailability(
      a0,
      getFFMentorApplicationStaff("FF-CB-101"),
    );
    // Details editor saves availability + a field together.
    expect(
      save(
        "FF-CB-101",
        {
          overview: { occupation: "Designer" },
          availability: av(["Monday"], true, "Sat mornings"),
        },
        {
          overview: { occupation: "Marketing Coordinator" },
          availability: cur0,
        },
      ).ok,
    ).toBe(true);
    let cur = currentAvailability(
      eff("FF-CB-101"),
      getFFMentorApplicationStaff("FF-CB-101"),
    );
    expect(cur).toMatchObject({
      availableDays: ["Monday"],
      cbWeekendAvailable: true,
      cbWeekendDetails: "Sat mornings",
    });
    // The Availability editor then saves No: details cleared, false kept.
    expect(
      saveFFMentorAvailability(
        "FF-CB-101",
        av(["Monday", "Friday"], false, "stale"),
      ).ok,
    ).toBe(true);
    cur = currentAvailability(
      eff("FF-CB-101"),
      getFFMentorApplicationStaff("FF-CB-101"),
    );
    expect(cur).toMatchObject({
      availableDays: ["Monday", "Friday"],
      cbWeekendAvailable: false,
      cbWeekendDetails: "",
    });
    // The submitted answers are not rewritten.
    expect(
      eff("FF-CB-101").answers.overview.availableDays,
    ).toEqual([]);
    // A details draft that started before the other editor's save conflicts.
    expect(
      save(
        "FF-CB-101",
        { availability: av(["Tuesday"], false) },
        { availability: av(["Monday"], true, "Sat mornings") },
      ),
    ).toMatchObject({
      ok: false,
      reason: "conflict",
      conflicts: ["availability"],
    });
  });

  it("changing sub-programs recomputes the applicable questions without deleting saved evidence", () => {
    const refsBefore = JSON.stringify(
      eff("VMS-5101").references,
    );
    const r = save(
      "VMS-5101",
      { subPrograms: ["community"] },
      { subPrograms: ["community", "work"] },
    );
    expect(r.ok).toBe(true);
    expect(eff("VMS-5101").subPrograms).toEqual(["community"]);
    expect(JSON.stringify(eff("VMS-5101").references)).toBe(
      refsBefore,
    );
    // The Work-Based answers saved earlier are still stored, just not applicable.
    expect(
      eff("VMS-5101").answers.overview.wbThursdayAvailable,
    ).toBe(false);
  });
});

describe("every permitted field is persisted", () => {
  it("round-trips each allowlisted overview and describe key", () => {
    const ov: Record<string, string> = {
      firstName: "F1",
      middleName: "M1",
      lastName: "L1",
      dob: "01/02/1990",
      email: "x@y.org",
      phone: "(555) 123-4567",
      maritalStatus: "Married",
      sex: "Female",
      religion: "R1",
      ethnicity: "E1",
      address: "1 A St",
      city: "C1",
      state: "IL",
      zip: "60601-1234",
      occupation: "O1",
      careerReason: "CR1",
      scheduleChanges: "SC1",
      anticipatedLength: "AL1",
      mentoringTimeframe: "MT1",
      hearAbout: "church",
      hearAboutComment: "HC1",
    };
    const ds: Record<string, unknown> = {
      personalStrengths: "p",
      interests: "i",
      whyMentor: "w",
      priorMercyHome: "pm",
      refusedYouthProgram: "r",
      disability: "d",
      recentConviction: "rc",
      psychHelp: "ph",
      dietaryRestrictions: "dr",
      emergencyContact: "ec",
      cbChildType: "ct",
      cbVehicle: "v",
      cbVehicleInsurance: "vi",
      languages: ["English", "Other"],
      otherLanguage: "Twi",
      languageProficiency: {
        English: { read: true, write: false, speak: true },
      },
    };
    expect(
      save(
        "VMS-5101",
        { overview: ov, describe: ds },
        {
          overview: Object.fromEntries(
            Object.keys(ov).map((k) => [
              k,
              (eff("VMS-5101").answers.overview as any)[k],
            ]),
          ),
          describe: Object.fromEntries(
            Object.keys(ds).map((k) => [
              k,
              (eff("VMS-5101").answers.describe as any)[k],
            ]),
          ),
        },
      ).ok,
    ).toBe(true);
    __reloadFFMentorApplicationsForTest();
    const a = eff("VMS-5101").answers;
    for (const [k, v] of Object.entries(ov))
      expect((a.overview as any)[k]).toBe(v);
    for (const [k, v] of Object.entries(ds))
      expect((a.describe as any)[k]).toEqual(v);
    // SSN (masked) and protected answers are exactly as submitted.
    expect(a.overview.ssn).toBe("•••-••-7781");
    expect(a.describe.convicted).toBe(false);
  });
});