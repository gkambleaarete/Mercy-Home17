// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  __reloadFFMentorApplicationsForTest,
  __refreshFFMentorApplicationsForTest,
  attachFFMentorCertificate,
  changeFFMentorStage,
  getFFActingUser,
  getFFMentorMatchReadiness,
  fromVmsMentorSubmission,
  getFFMentorApplication,
  getFFMentorApplicationForApplicant,
  listFFMentorApplicationsForApplicant,
  mhbgCoordinatorOptions,
  recordFFMentorApplicationSubmission,
  saveFFChecklistAssessments,
  saveFFMentorAvailability,
  saveFFMentorCoordinatorDetails,
} from "./ffMentorApplicationStore";
import { SEED_FF_MENTOR_APPLICATIONS } from "./mockFFMentorApplications";
import {
  assessFFReferences,
  referenceResponseLabel,
  currentAvailability,
  submittedAvailability,
  type FFMentorApplication,
} from "./ffMentorApplication";

const KEY = "mh.ffMentorApplications.v1";
const seedA = SEED_FF_MENTOR_APPLICATIONS[0];

/** A test-only submission built from a seed's answers under a new id. */
function submission(
  applicationId: string,
  applicantId: string,
) {
  return fromVmsMentorSubmission({
    applicationId,
    applicantId,
    startedAt: "10/01/2026",
    submittedAt: "10/05/2026",
    submission: {
      ...structuredClone(seedA.answers),
      subPrograms: ["community", "work", "school"],
      refs: structuredClone(seedA.references),
      uploads: {
        driversLicence: {
          name: "license.pdf",
          type: "application/pdf",
          size: 2048,
        },
        empty: null,
      },
    },
  });
}

const found = (id: string): FFMentorApplication => {
  const r = getFFMentorApplication(id);
  if (r.status !== "found")
    throw new Error(`expected ${id} found, got ${r.status}`);
  return r.application;
};

beforeEach(() => {
  localStorage.clear();
  __reloadFFMentorApplicationsForTest();
});

describe("lookup by application id", () => {
  it("two ids load their own records without mixing", () => {
    const a = found("VMS-5101");
    const b = found("VMS-5102");
    expect(a.applicantId).toBe("VOL-2001");
    expect(a.answers.overview.firstName).toBe("Amara");
    expect(b.applicantId).toBe("VOL-2002");
    expect(b.answers.overview.firstName).toBe("Daniel");
    expect(b.subPrograms).toEqual(["school"]);
  });

  it("a missing id is missing, never another record", () => {
    expect(getFFMentorApplication("VMS-9999")).toEqual({
      status: "missing",
    });
    expect(getFFMentorApplication("")).toEqual({
      status: "missing",
    });
  });
});

describe("submission persistence", () => {
  it("keeps every sub-program, No answers, references, signatures and files across a refresh", () => {
    expect(
      recordFFMentorApplicationSubmission(
        submission("T-1", "VOL-T1"),
      ),
    ).toEqual({ ok: true });
    __reloadFFMentorApplicationsForTest();
    const app = found("T-1");
    expect(app.subPrograms).toEqual([
      "community",
      "work",
      "school",
    ]);
    expect(app.answers.overview.wbThursdayAvailable).toBe(
      false,
    );
    expect(app.answers.overview.sbTuesdayAvailable).toBeNull();
    expect(app.answers.describe.convicted).toBe(false);
    expect(app.answers.describe.youthPositiveExperience).toBe(
      "",
    );
    expect(
      app.answers.matchPrefs.prefersPreviouslyMatched,
    ).toBe(false);
    expect(
      app.answers.describe.languageProficiency.Other,
    ).toEqual({ read: false, write: false, speak: true });
    expect(app.answers.docsSigned.publicTransitAgreement).toBe(
      false,
    );
    expect(app.answers.consent.backgroundSig).toEqual(
      seedA.answers.consent.backgroundSig,
    );
    expect(app.answers.consent.attestationSig?.method).toBe(
      "draw",
    );
    expect(app.references).toEqual(seedA.references);
    expect(app.uploads.driversLicence).toMatchObject({
      fileName: "license.pdf",
      sizeBytes: 2048,
    });
    expect(app.uploads.empty).toBeUndefined();
  });

  it("keeps two applications from one applicant distinct", () => {
    recordFFMentorApplicationSubmission(
      submission("T-1", "VOL-T1"),
    );
    const second = submission("T-2", "VOL-T1");
    second.subPrograms = ["school"];
    recordFFMentorApplicationSubmission(second);
    __reloadFFMentorApplicationsForTest();
    expect(found("T-1").subPrograms).toHaveLength(3);
    expect(found("T-2").subPrograms).toEqual(["school"]);
    expect(
      listFFMentorApplicationsForApplicant("VOL-T1")
        .map((a) => a.applicationId)
        .sort(),
    ).toEqual(["T-1", "T-2"]);
  });

  it("refuses an id that belongs to another applicant", () => {
    expect(
      recordFFMentorApplicationSubmission(
        submission("VMS-5101", "VOL-OTHER"),
      ),
    ).toEqual({ ok: false, reason: "conflict" });
    expect(found("VMS-5101").applicantId).toBe("VOL-2001");
  });

  it("a saved record wins over the seed with the same id", () => {
    const resubmit = submission("VMS-5102", "VOL-2002");
    recordFFMentorApplicationSubmission(resubmit);
    __reloadFFMentorApplicationsForTest();
    expect(found("VMS-5102").subPrograms).toEqual([
      "community",
      "work",
      "school",
    ]);
  });
});

describe("certificates", () => {
  it("a later upload is visible through the same lookup after refresh", () => {
    const file = {
      fileName: "virtus.pdf",
      mimeType: "application/pdf",
      sizeBytes: 900,
      uploadedAt: "10/10/2026",
    };
    expect(
      attachFFMentorCertificate(
        "VMS-5101",
        "VOL-2001",
        "virtus",
        file,
      ),
    ).toEqual({ ok: true });
    __reloadFFMentorApplicationsForTest();
    const app = found("VMS-5101");
    expect(app.certificates.virtus).toEqual(file);
    expect(app.answers).toEqual(seedA.answers);
    expect(app.references).toEqual(seedA.references);
  });

  it("rejects uploads to a missing or someone else's application", () => {
    const file = {
      fileName: "x.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1,
      uploadedAt: "",
    };
    expect(
      attachFFMentorCertificate(
        "VMS-9999",
        "VOL-2001",
        "dcfs",
        file,
      ),
    ).toEqual({ ok: false, reason: "missing" });
    expect(
      attachFFMentorCertificate(
        "VMS-5102",
        "VOL-2001",
        "dcfs",
        file,
      ),
    ).toEqual({ ok: false, reason: "conflict" });
  });

  it("a resubmission keeps certificates already uploaded", () => {
    recordFFMentorApplicationSubmission(
      submission("T-1", "VOL-T1"),
    );
    attachFFMentorCertificate("T-1", "VOL-T1", "cpi", {
      fileName: "cpi.png",
      mimeType: "image/png",
      sizeBytes: 5,
      uploadedAt: "",
    });
    recordFFMentorApplicationSubmission(
      submission("T-1", "VOL-T1"),
    );
    expect(found("T-1").certificates.cpi?.fileName).toBe(
      "cpi.png",
    );
  });
});

describe("staff vs applicant separation", () => {
  it("applicant reads carry no staff processing and only the applicant's own record", () => {
    const own = getFFMentorApplicationForApplicant(
      "VMS-5101",
      "VOL-2001",
    );
    expect(own).toBeDefined();
    for (const k of [
      "stage",
      "inactive",
      "coordinator",
      "internalNotes",
      "documentReviews",
      "stageHistory",
      "staff",
    ])
      expect(own).not.toHaveProperty(k);
    expect(
      getFFMentorApplicationForApplicant(
        "VMS-5101",
        "VOL-2002",
      ),
    ).toBeUndefined();
  });

  it("staff lookup returns processing separately with nothing assumed", () => {
    const r = getFFMentorApplication("VMS-5101");
    expect(r.status).toBe("found");
    if (r.status === "found") {
      expect(r.staff.stage).toBeNull();
      expect(r.staff.coordinatorId).toBeNull();
      expect(r.staff.stageHistory).toEqual([]);
      expect(r.staff.inactive).toBe(false);
      // Applicant status is not turned into a stage.
      expect(r.application.applicantStatus).toBe(
        "background-check",
      );
    }
  });
});

describe("coordinator and notes", () => {
  it("saves both fields to staff processing only and survives refresh", () => {
    const [coord] = mhbgCoordinatorOptions();
    expect(coord).toBeDefined();
    const before = structuredClone(found("VMS-5102"));
    expect(
      saveFFMentorCoordinatorDetails("VMS-5102", {
        coordinatorId: coord.id,
        coordinatorNotes: "Line one\nLine two",
      }),
    ).toEqual({ ok: true });
    __reloadFFMentorApplicationsForTest();
    const r = getFFMentorApplication("VMS-5102");
    if (r.status !== "found") throw new Error();
    expect(r.staff.coordinatorId).toBe(coord.id);
    expect(r.staff.coordinatorNotes).toBe("Line one\nLine two");
    expect(r.application).toEqual(before);
    // Other records unaffected; notes never in applicant reads.
    const other = getFFMentorApplication("VMS-5101");
    if (other.status === "found")
      expect(other.staff.coordinatorNotes).toBe("");
    expect(
      JSON.stringify(
        getFFMentorApplicationForApplicant(
          "VMS-5102",
          "VOL-2002",
        ),
      ),
    ).not.toContain("Line one");
  });

  it("rejects an unknown coordinator id and a missing application", () => {
    expect(
      saveFFMentorCoordinatorDetails("VMS-5102", {
        coordinatorId: -1,
        coordinatorNotes: "",
      }),
    ).toEqual({ ok: false, reason: "invalid" });
    const [coord] = mhbgCoordinatorOptions();
    expect(
      saveFFMentorCoordinatorDetails("VMS-9999", {
        coordinatorId: coord.id,
        coordinatorNotes: "",
      }),
    ).toEqual({ ok: false, reason: "missing" });
  });

  it("a failed storage write changes nothing", () => {
    const [coord] = mhbgCoordinatorOptions();
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
    try {
      expect(
        saveFFMentorCoordinatorDetails("VMS-5102", {
          coordinatorId: coord.id,
          coordinatorNotes: "x",
        }),
      ).toEqual({ ok: false, reason: "storage" });
    } finally {
      Storage.prototype.setItem = orig;
    }
    const r = getFFMentorApplication("VMS-5102");
    if (r.status === "found")
      expect(r.staff.coordinatorId).toBeNull();
  });
});

describe("SSN and migration", () => {
  it("never persists a raw SSN from a submission", () => {
    const sub = submission("T-1", "VOL-T1");
    sub.answers.overview.ssn = "123-45-6789";
    recordFFMentorApplicationSubmission(sub);
    const raw = localStorage.getItem(KEY)!;
    expect(raw).not.toContain("123-45");
    expect(raw).not.toContain("123456789");
    expect(found("T-1").answers.overview.ssn).toBe(
      "•••-••-6789",
    );
  });

  it("migrates saved records: masks raw SSN, single sub-program becomes a list, old staff fields carry over", () => {
    const legacy = structuredClone(seedA) as unknown as Record<
      string,
      unknown
    > & { answers: { overview: { ssn: string } } };
    legacy.applicationId = "OLD-1";
    delete legacy.subPrograms;
    legacy.subProgram = "Work-Based";
    legacy.answers.overview.ssn = "987-65-4321";
    localStorage.setItem(
      KEY,
      JSON.stringify({
        version: 1,
        applications: { "OLD-1": legacy },
        staff: {
          "OLD-1": {
            stage: "Application Received",
            inactive: false,
            coordinator: "D. Reyes",
            internalNotes: [
              { id: "n", author: "a", at: "", text: "Keep me" },
            ],
            documentReviews: {},
            stageHistory: [],
          },
        },
      }),
    );
    __reloadFFMentorApplicationsForTest();
    const r = getFFMentorApplication("OLD-1");
    if (r.status !== "found") throw new Error(r.status);
    expect(r.application.subPrograms).toEqual(["work"]);
    expect(r.application.answers.overview.ssn).toBe(
      "•••-••-4321",
    );
    expect(r.application.references).toEqual(seedA.references);
    expect(r.staff.stage).toBeNull();
    expect(r.staff.coordinatorNotes).toBe("Keep me");
    expect(localStorage.getItem(KEY)).not.toContain("987-65");
  });
});

describe("storage failures", () => {
  it("unreadable saved data is reported unavailable and never overwritten", () => {
    localStorage.setItem(KEY, "{not json");
    __reloadFFMentorApplicationsForTest();
    expect(getFFMentorApplication("VMS-5101")).toEqual({
      status: "unavailable",
    });
    expect(
      recordFFMentorApplicationSubmission(
        submission("T-1", "VOL-T1"),
      ),
    ).toEqual({ ok: false, reason: "storage" });
    expect(localStorage.getItem(KEY)).toBe("{not json");
  });
});

describe("availability updates", () => {
  const lookup = (id: string) => {
    const r = getFFMentorApplication(id);
    if (r.status !== "found") throw new Error(r.status);
    return r;
  };
  const cbwb = {
    availableDays: ["Tuesday"],
    cbWeekendAvailable: false,
    cbWeekendDetails: "stale",
    sbTuesdayAvailable: null,
    wbThursdayAvailable: false,
  };

  it("saves to staff processing only, keeps submitted answers and other staff fields, survives refresh", () => {
    const [coord] = mhbgCoordinatorOptions();
    saveFFMentorCoordinatorDetails("VMS-5101", {
      coordinatorId: coord.id,
      coordinatorNotes: "keep",
    });
    const submitted = structuredClone(found("VMS-5101"));
    expect(saveFFMentorAvailability("VMS-5101", cbwb)).toEqual({
      ok: true,
    });
    __reloadFFMentorApplicationsForTest();
    const r = lookup("VMS-5101");
    expect(r.application).toEqual(submitted);
    expect(r.staff.coordinatorId).toBe(coord.id);
    expect(r.staff.coordinatorNotes).toBe("keep");
    expect(r.staff.availabilityOverride).toEqual({
      ...cbwb,
      cbWeekendDetails: "",
    });
    const cur = currentAvailability(r.application, r.staff);
    expect(cur.cbWeekendAvailable).toBe(false);
    expect(cur.wbThursdayAvailable).toBe(false);
    expect(cur.availableDays).toEqual(["Tuesday"]);
    expect(
      submittedAvailability(r.application).cbWeekendDetails,
    ).toBe("Saturday mornings");
    expect(
      getFFMentorApplicationForApplicant(
        "VMS-5101",
        "VOL-2001",
      ),
    ).not.toHaveProperty("availabilityOverride");
  });

  it("validates only applicable questions; No is valid; Yes needs weekend details", () => {
    expect(
      saveFFMentorAvailability("VMS-5101", {
        ...cbwb,
        availableDays: [],
      }),
    ).toEqual({ ok: false, reason: "invalid" });
    expect(
      saveFFMentorAvailability("VMS-5101", {
        ...cbwb,
        wbThursdayAvailable: null,
      }),
    ).toEqual({ ok: false, reason: "invalid" });
    expect(
      saveFFMentorAvailability("VMS-5101", {
        ...cbwb,
        cbWeekendAvailable: true,
        cbWeekendDetails: "  ",
      }),
    ).toEqual({ ok: false, reason: "invalid" });
    // SB-only: CB and WB answers are not required.
    expect(
      saveFFMentorAvailability("VMS-5102", {
        availableDays: ["Tuesday"],
        cbWeekendAvailable: null,
        cbWeekendDetails: "",
        sbTuesdayAvailable: false,
        wbThursdayAvailable: null,
      }),
    ).toEqual({ ok: true });
    expect(
      lookup("VMS-5102").staff.availabilityOverride
        ?.sbTuesdayAvailable,
    ).toBe(false);
  });

  it("rejects missing and unreadable targets; a failed write changes nothing", () => {
    expect(saveFFMentorAvailability("VMS-9999", cbwb)).toEqual({
      ok: false,
      reason: "missing",
    });
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
    try {
      expect(
        saveFFMentorAvailability("VMS-5101", cbwb),
      ).toEqual({ ok: false, reason: "storage" });
    } finally {
      Storage.prototype.setItem = orig;
    }
    expect(
      lookup("VMS-5101").staff.availabilityOverride,
    ).toBeNull();
    localStorage.setItem(KEY, "{bad");
    __reloadFFMentorApplicationsForTest();
    expect(saveFFMentorAvailability("VMS-5101", cbwb)).toEqual({
      ok: false,
      reason: "storage",
    });
    expect(localStorage.getItem(KEY)).toBe("{bad");
  });

  it("loading older staff records adds no write", () => {
    const raw = JSON.stringify({
      version: 1,
      applications: {},
      staff: {
        "VMS-5101": {
          stage: null,
          inactive: false,
          coordinatorId: null,
          coordinatorNotes: "",
          documentReviews: {},
          stageHistory: [],
        },
      },
    });
    localStorage.setItem(KEY, raw);
    __reloadFFMentorApplicationsForTest();
    expect(localStorage.getItem(KEY)).toBe(raw);
    expect(
      lookup("VMS-5101").staff.availabilityOverride,
    ).toBeNull();
  });
});

describe("stage changes", () => {
  const actor = { id: "staff-test-user", name: "Test Staff" };
  const lookup = (id: string) => {
    const r = getFFMentorApplication(id);
    if (r.status !== "found") throw new Error(r.status);
    return r;
  };
  const at = new Date(2026, 9, 20, 14, 5);

  it("moves from Not set, records one event with from/to, actor and time, survives refresh", () => {
    expect(
      changeFFMentorStage("VMS-5101", {
        stage: "Interview",
        expectedStage: null,
        actor,
        now: at,
      }),
    ).toEqual({ ok: true, changed: true });
    __reloadFFMentorApplicationsForTest();
    const { staff } = lookup("VMS-5101");
    expect(staff.stage).toBe("Interview");
    expect(staff.stageHistory).toHaveLength(1);
    const e = staff.stageHistory[0];
    expect(e).toMatchObject({
      fromStage: null,
      stage: "Interview",
      at: "10/20/2026 2:05 PM",
      by: "Test Staff",
      byId: "staff-test-user",
    });
    expect(e.id).toBeTruthy();
    expect(e.atIso).toBe(at.toISOString());
  });

  it("saving the same stage is a no-op; revisiting a stage keeps both visits", () => {
    changeFFMentorStage("VMS-5101", {
      stage: "Interview",
      expectedStage: null,
      actor,
    });
    expect(
      changeFFMentorStage("VMS-5101", {
        stage: "Interview",
        expectedStage: "Interview",
        actor,
      }),
    ).toEqual({ ok: true, changed: false });
    changeFFMentorStage("VMS-5101", {
      stage: "Profile",
      expectedStage: "Interview",
      actor,
    });
    changeFFMentorStage("VMS-5101", {
      stage: "Interview",
      expectedStage: "Profile",
      actor,
    });
    const h = lookup("VMS-5101").staff.stageHistory;
    expect(h.map((x) => [x.fromStage, x.stage])).toEqual([
      [null, "Interview"],
      ["Interview", "Profile"],
      ["Profile", "Interview"],
    ]);
    expect(new Set(h.map((x) => x.id)).size).toBe(3);
  });

  it("refuses invalid stages, missing applications, missing actors and unverified Ready for Match", () => {
    expect(
      changeFFMentorStage("VMS-5101", {
        stage: "Approved",
        expectedStage: null,
        actor,
      }),
    ).toEqual({ ok: false, reason: "invalid" });
    expect(
      changeFFMentorStage("VMS-9999", {
        stage: "Interview",
        expectedStage: null,
        actor,
      }),
    ).toEqual({ ok: false, reason: "missing" });
    expect(
      changeFFMentorStage("VMS-5101", {
        stage: "Interview",
        expectedStage: null,
        actor: null,
      }),
    ).toEqual({ ok: false, reason: "actor" });
    expect(
      changeFFMentorStage("VMS-5101", {
        stage: "Interview",
        expectedStage: null,
        actor: { id: " ", name: "X" },
      }),
    ).toEqual({ ok: false, reason: "actor" });
    expect(getFFMentorMatchReadiness("VMS-5101").verified).toBe(
      false,
    );
    // A caller-supplied "ready" flag is not accepted as proof.
    const sneaky = {
      stage: "Ready for Match",
      expectedStage: null,
      actor,
      ready: true,
    } as Parameters<typeof changeFFMentorStage>[1];
    expect(
      changeFFMentorStage("VMS-5101", sneaky),
    ).toMatchObject({ ok: false, reason: "not-ready" });
    const { staff } = lookup("VMS-5101");
    expect(staff.stage).toBeNull();
    expect(staff.stageHistory).toEqual([]);
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("a failed write leaves stage and history unchanged", () => {
    changeFFMentorStage("VMS-5101", {
      stage: "Interview",
      expectedStage: null,
      actor,
    });
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
    try {
      expect(
        changeFFMentorStage("VMS-5101", {
          stage: "Profile",
          expectedStage: "Interview",
          actor,
        }),
      ).toEqual({ ok: false, reason: "storage" });
    } finally {
      Storage.prototype.setItem = orig;
    }
    __reloadFFMentorApplicationsForTest();
    const { staff } = lookup("VMS-5101");
    expect(staff.stage).toBe("Interview");
    expect(staff.stageHistory).toHaveLength(1);
  });

  it("detects a stage changed elsewhere instead of overwriting it", () => {
    changeFFMentorStage("VMS-5101", {
      stage: "Interview",
      expectedStage: null,
      actor,
    });
    // Another tab moves it to Profile.
    const other = JSON.parse(localStorage.getItem(KEY)!);
    other.staff["VMS-5101"].stage = "Profile";
    other.staff["VMS-5101"].stageHistory.push({
      id: "x",
      fromStage: "Interview",
      stage: "Profile",
      at: "",
      by: "Other",
      byId: "o",
    });
    localStorage.setItem(KEY, JSON.stringify(other));
    expect(
      changeFFMentorStage("VMS-5101", {
        stage: "Determination",
        expectedStage: "Interview",
        actor,
      }),
    ).toEqual({
      ok: false,
      reason: "conflict",
      currentStage: "Profile",
    });
    expect(lookup("VMS-5101").staff.stage).toBe("Profile");
    expect(
      JSON.parse(localStorage.getItem(KEY)!).staff["VMS-5101"]
        .stageHistory,
    ).toHaveLength(2);
  });

  it("keeps every other field; other saves keep stage history; another tab's stage survives an Overview save", () => {
    const [coord] = mhbgCoordinatorOptions();
    saveFFMentorCoordinatorDetails("VMS-5101", {
      coordinatorId: coord.id,
      coordinatorNotes: "n",
    });
    saveFFMentorAvailability("VMS-5101", {
      availableDays: ["Monday"],
      cbWeekendAvailable: false,
      cbWeekendDetails: "",
      sbTuesdayAvailable: null,
      wbThursdayAvailable: true,
    });
    const before = structuredClone(lookup("VMS-5101"));
    changeFFMentorStage("VMS-5101", {
      stage: "Interview",
      expectedStage: null,
      actor,
    });
    const after = lookup("VMS-5101");
    expect(after.application).toEqual(before.application);
    expect({
      ...after.staff,
      stage: null,
      stageHistory: [],
    }).toEqual({
      ...before.staff,
      stage: null,
      stageHistory: [],
    });
    saveFFMentorCoordinatorDetails("VMS-5101", {
      coordinatorId: coord.id,
      coordinatorNotes: "n2",
    });
    saveFFMentorAvailability("VMS-5101", {
      availableDays: ["Friday"],
      cbWeekendAvailable: false,
      cbWeekendDetails: "",
      sbTuesdayAvailable: null,
      wbThursdayAvailable: true,
    });
    expect(lookup("VMS-5101").staff.stageHistory).toHaveLength(
      1,
    );
    // Another tab changes the stage; this tab's next Overview save keeps it.
    const other = JSON.parse(localStorage.getItem(KEY)!);
    other.staff["VMS-5101"].stage = "Active";
    localStorage.setItem(KEY, JSON.stringify(other));
    saveFFMentorCoordinatorDetails("VMS-5101", {
      coordinatorId: coord.id,
      coordinatorNotes: "n3",
    });
    expect(lookup("VMS-5101").staff.stage).toBe("Active");
  });

  it("reading and refreshing add no history; storage events refresh the view", () => {
    changeFFMentorStage("VMS-5101", {
      stage: "Interview",
      expectedStage: null,
      actor,
    });
    const raw = localStorage.getItem(KEY);
    __reloadFFMentorApplicationsForTest();
    getFFMentorApplication("VMS-5101");
    expect(localStorage.getItem(KEY)).toBe(raw);
    const other = JSON.parse(raw!);
    other.staff["VMS-5101"].stage = "Profile";
    localStorage.setItem(KEY, JSON.stringify(other));
    __refreshFFMentorApplicationsForTest();
    expect(lookup("VMS-5101").staff.stage).toBe("Profile");
  });

  it("the acting user is the signed-in staff user, not the coordinator", () => {
    const u = getFFActingUser();
    expect(u?.id).toBeTruthy();
    expect(u?.name).toBeTruthy();
    expect(
      mhbgCoordinatorOptions().some(
        (c) => String(c.id) === u?.id,
      ),
    ).toBe(false);
  });
});

describe("reference assessment", () => {
  const app = (
    subPrograms: FFMentorApplication["subPrograms"],
    statuses: (string | undefined)[],
    types: string[] = [],
  ) => {
    const a = structuredClone(seedA);
    a.subPrograms = subPrograms;
    a.references = statuses.map((st, i) => ({
      id: `r${i + 1}`,
      relationship: types[i] ?? "personal",
      name: `Ref ${i + 1}`,
      phone: "",
      email: `r${i + 1}@x.org`,
      permissionGranted: true,
      submitted: true,
      responseStatus: st as
        "submitted" | "awaiting" | undefined,
    }));
    return a;
  };

  it("CB requests 3 / requires 2; SB 2/2; WB 1/1", () => {
    expect(
      assessFFReferences(app(["community"], [])).programs[0],
    ).toMatchObject({ requested: 3, required: 2 });
    expect(
      assessFFReferences(app(["school"], [])).programs[0],
    ).toMatchObject({ requested: 2, required: 2 });
    expect(
      assessFFReferences(app(["work"], [])).programs[0],
    ).toMatchObject({ requested: 1, required: 1 });
  });

  it("entered references without responses count 0; received counts once; completion capped", () => {
    expect(
      assessFFReferences(
        app(["community"], [undefined, "awaiting", "declined"]),
      ),
    ).toMatchObject({
      received: 0,
      completionPct: 0,
      requirementMet: false,
    });
    expect(
      assessFFReferences(
        app(["community"], ["submitted", "awaiting"]),
      ),
    ).toMatchObject({ received: 1, completionPct: 50 });
    expect(
      assessFFReferences(
        app(["community"], ["submitted", "submitted"]),
      ),
    ).toMatchObject({
      received: 2,
      completionPct: 100,
      requirementMet: true,
    });
    expect(
      assessFFReferences(
        app(["work"], ["submitted", "submitted", "submitted"]),
      ),
    ).toMatchObject({
      received: 3,
      completionPct: 100,
      requirementMet: true,
    });
    const dup = app(["school"], ["submitted", "submitted"]);
    dup.references[1].id = "r1";
    expect(assessFFReferences(dup).received).toBe(1);
  });

  it("several sub-programs: thresholds per program, completion not determined", () => {
    const r = assessFFReferences(
      app(
        ["community", "school", "work"],
        ["submitted", "submitted"],
      ),
    );
    expect(
      r.programs.map((p) => [
        p.program,
        p.requested,
        p.required,
      ]),
    ).toEqual([
      ["community", 3, 2],
      ["school", 2, 2],
      ["work", 1, 1],
    ]);
    expect(r.received).toBe(2);
    expect(r.completionPct).toBeNull();
    expect(r.requirementMet).toBeNull();
    expect(r.issues.join(" ")).toContain("not been confirmed");
  });

  it("flags more than one Business reference without removing any; submissions over the limit are refused", () => {
    const a = app(
      ["work"],
      ["submitted", undefined],
      ["business", "business"],
    );
    const r = assessFFReferences(a);
    expect(r.businessCount).toBe(2);
    expect(r.issues[0]).toContain("Business");
    expect(a.references).toHaveLength(2);
    const sub = {
      ...a,
      applicationId: "T-BIZ",
      applicantId: "VOL-BIZ",
    };
    expect(recordFFMentorApplicationSubmission(sub)).toEqual({
      ok: false,
      reason: "business-reference-limit",
    });
    expect(getFFMentorApplication("T-BIZ").status).toBe(
      "missing",
    );
  });

  it("historical Business-limit violations don't block staff saves", () => {
    const a = app(
      ["work"],
      [undefined, undefined],
      ["business", "business"],
    );
    localStorage.setItem(
      KEY,
      JSON.stringify({
        version: 1,
        applications: {
          "OLD-BIZ": { ...a, applicationId: "OLD-BIZ" },
        },
        staff: {},
      }),
    );
    __reloadFFMentorApplicationsForTest();
    const [coord] = mhbgCoordinatorOptions();
    expect(
      saveFFMentorCoordinatorDetails("OLD-BIZ", {
        coordinatorId: coord.id,
        coordinatorNotes: "",
      }),
    ).toEqual({ ok: true });
    expect(
      changeFFMentorStage("OLD-BIZ", {
        stage: "Interview",
        expectedStage: null,
        actor: { id: "u", name: "U" },
      }),
    ).toEqual({ ok: true, changed: true });
    expect(
      getFFMentorApplicationForApplicant(
        "OLD-BIZ",
        a.applicantId,
      )?.references,
    ).toHaveLength(2);
  });
});

describe("chunk 7 follow-ups", () => {
  it("a declined reference shows as Declined and is not received", () => {
    const a = structuredClone(seedA);
    a.subPrograms = ["work"];
    a.references = [
      {
        id: "d1",
        relationship: "personal",
        name: "D",
        phone: "",
        email: "d@x.org",
        permissionGranted: true,
        responseStatus: "declined",
      },
    ];
    expect(referenceResponseLabel(a.references[0])).toBe(
      "Declined",
    );
    expect(assessFFReferences(a).received).toBe(0);
    expect(
      referenceResponseLabel({
        ...a.references[0],
        responseStatus: "awaiting",
      }),
    ).toBe("Awaiting Response");
  });

  it("saving one application leaves another record byte-identical", () => {
    const otherApp = {
      ...structuredClone(seedA),
      applicationId: "OTHER",
      applicantId: "VOL-O",
    };
    const otherStaff = {
      stage: "Interview",
      inactive: false,
      coordinatorId: null,
      coordinatorNotes: "",
      documentReviews: {},
      stageHistory: [],
    };
    localStorage.setItem(
      KEY,
      JSON.stringify({
        version: 1,
        applications: { OTHER: otherApp },
        staff: { OTHER: otherStaff },
      }),
    );
    __reloadFFMentorApplicationsForTest();
    const [coord] = mhbgCoordinatorOptions();
    const actor = { id: "u", name: "U" };
    expect(
      saveFFMentorCoordinatorDetails("VMS-5101", {
        coordinatorId: coord.id,
        coordinatorNotes: "x",
      }).ok,
    ).toBe(true);
    expect(
      saveFFMentorAvailability("VMS-5101", {
        availableDays: ["Monday"],
        cbWeekendAvailable: false,
        cbWeekendDetails: "",
        sbTuesdayAvailable: null,
        wbThursdayAvailable: true,
      }).ok,
    ).toBe(true);
    expect(
      changeFFMentorStage("VMS-5101", {
        stage: "Profile",
        expectedStage: null,
        actor,
      }).ok,
    ).toBe(true);
    const saved = JSON.parse(localStorage.getItem(KEY)!);
    expect(JSON.stringify(saved.applications.OTHER)).toBe(
      JSON.stringify(otherApp),
    );
    expect(JSON.stringify(saved.staff.OTHER)).toBe(
      JSON.stringify(otherStaff),
    );
    // Reads still get defaults for the older record.
    const r = getFFMentorApplication("OTHER");
    if (r.status === "found")
      expect(r.staff.referenceRequests).toEqual({});
  });

  it("raw-SSN masking on load touches only the records that need it", () => {
    const clean = {
      ...structuredClone(seedA),
      applicationId: "CLEAN",
      applicantId: "VOL-C",
    };
    const raw = {
      ...structuredClone(seedA),
      applicationId: "RAW",
      applicantId: "VOL-R",
    };
    raw.answers.overview.ssn = "111-22-3333";
    localStorage.setItem(
      KEY,
      JSON.stringify({
        version: 1,
        applications: { CLEAN: clean, RAW: raw },
        staff: {},
      }),
    );
    __reloadFFMentorApplicationsForTest();
    const saved = JSON.parse(localStorage.getItem(KEY)!);
    expect(JSON.stringify(saved.applications.CLEAN)).toBe(
      JSON.stringify(clean),
    );
    expect(saved.applications.RAW.answers.overview.ssn).toBe(
      "•••-••-3333",
    );
    expect(localStorage.getItem(KEY)).not.toContain("111-22");
  });

  it("Overview, availability and stage saves keep the submitted consents", () => {
    const before = structuredClone(
      found("VMS-5101").answers.consent,
    );
    const [coord] = mhbgCoordinatorOptions();
    saveFFMentorCoordinatorDetails("VMS-5101", {
      coordinatorId: coord.id,
      coordinatorNotes: "x",
    });
    changeFFMentorStage("VMS-5101", {
      stage: "Profile",
      expectedStage: null,
      actor: { id: "u", name: "U" },
    });
    __reloadFFMentorApplicationsForTest();
    expect(found("VMS-5101").answers.consent).toEqual(before);
  });
});

describe("readiness with production rules", () => {
  it("the stage API refuses Ready for Match directly while rules are unresolved, with reasons", () => {
    const r = changeFFMentorStage("VMS-5101", {
      stage: "Ready for Match",
      expectedStage: null,
      actor: { id: "u", name: "U" },
    });
    expect(r).toMatchObject({ ok: false, reason: "not-ready" });
    expect(r.ok === false && r.reasons?.length).toBeGreaterThan(
      0,
    );
    // Driving-record applicability is unconfirmed, so it can't be assessed yet.
    expect(
      saveFFChecklistAssessments(
        "VMS-5101",
        { drivingRecordReview: { result: "Passed" } },
        { id: "u", name: "U" },
      ),
    ).toEqual({ ok: false, reason: "invalid" });
    expect(getFFMentorMatchReadiness("VMS-5101").verified).toBe(
      false,
    );
  });
});