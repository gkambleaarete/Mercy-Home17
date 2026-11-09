// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  __reloadFFMentorApplicationsForTest,
  getFFMentorApplication,
  getFFMentorApplicationForApplicant,
  getFFMentorApplicationStaff,
  getFFMentorInterview,
  listFFMentorApplications,
  listFFMentorApplicationsForApplicant,
  saveFFMentorApplicationDetails,
  saveFFMentorCoordinatorDetails,
  saveFFChecklistAssessments,
  saveFFMentorInterview,
  __refreshFFMentorApplicationsForTest,
} from "./ffMentorApplicationStore";
import {
  FF_CHILDREN_QUESTION_ID,
  FF_INTERVIEW_QUESTIONS,
  applicableInterviewQuestions,
  validateInterviewAnswers,
} from "./ffMentorInterview";
import type { FFSubProgramId } from "./ffMentorApplication";

const KEY = "mh.ffMentorApplications.v1";
const actor = { id: "staff-test", name: "Test Staff" };
const text = (
  progs: FFSubProgramId[],
  children: string | undefined,
) =>
  applicableInterviewQuestions(
    progs,
    children ? { [FF_CHILDREN_QUESTION_ID]: children } : {},
  ).filter((q) => q.input === "text");
const fill = (progs: FFSubProgramId[], children?: string) => {
  const a: Record<string, string> = {};
  if (children) a[FF_CHILDREN_QUESTION_ID] = children;
  for (const q of applicableInterviewQuestions(progs, a))
    if (q.input === "text") a[q.id] = `answer ${q.id}`;
  return a;
};
const subs = (id: string) => {
  const r = getFFMentorApplication(id);
  if (r.status !== "found") throw new Error(id);
  return r.application.subPrograms;
};
const setSubs = (id: string, next: FFSubProgramId[]) =>
  saveFFMentorApplicationDetails(
    id,
    { subPrograms: next },
    { subPrograms: subs(id) },
    actor,
  );
const save = (id: string, change: any, base: any = {}) =>
  saveFFMentorInterview(
    id,
    change,
    base,
    actor,
    new Date(2026, 9, 23, 10, 5),
  );

beforeEach(() => {
  localStorage.clear();
  __reloadFFMentorApplicationsForTest();
});

describe("question schema", () => {
  it("has unique stable ids and the specified counts", () => {
    const ids = FF_INTERVIEW_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    const textQ = FF_INTERVIEW_QUESTIONS.filter(
      (q) => q.input === "text",
    );
    expect(textQ.length).toBe(48);
    expect(
      FF_INTERVIEW_QUESTIONS.filter((q) => q.input === "yesNo"),
    ).toHaveLength(1);
    expect(textQ.filter((q) => q.mandatory)).toHaveLength(48);
    expect(textQ.filter((q) => q.scope === "all")).toHaveLength(
      6,
    );
    expect(
      textQ.filter((q) => q.scope === "community"),
    ).toHaveLength(29);
    expect(
      textQ.filter((q) => q.scope === "schoolWork"),
    ).toHaveLength(13);
    expect(
      FF_INTERVIEW_QUESTIONS.find(
        (q) => q.id === FF_CHILDREN_QUESTION_ID,
      )!.mandatory,
    ).toBe(false);
  });

  it("applies the union of program scopes with the stated counts", () => {
    expect(text(["community"], undefined)).toHaveLength(31);
    expect(text(["community"], "no")).toHaveLength(31);
    expect(text(["community"], "yes")).toHaveLength(35);
    expect(text(["school"], undefined)).toHaveLength(19);
    expect(text(["work"], undefined)).toHaveLength(19);
    expect(text(["school", "work"], undefined)).toHaveLength(
      19,
    );
    expect(text(["community", "school"], "yes")).toHaveLength(
      48,
    );
    expect(
      text(["community", "school", "work"], "yes"),
    ).toHaveLength(48);
    // Section J is absent for Community-only and present with School/Work.
    expect(
      text(["community"], "yes").some((q) => q.section === "J"),
    ).toBe(false);
    expect(
      text(["work"], undefined).filter(
        (q) => q.section === "J",
      ),
    ).toHaveLength(3);
    // Children follow-ups never apply without Community.
    expect(
      applicableInterviewQuestions(["school"], {
        [FF_CHILDREN_QUESTION_ID]: "yes",
      }).some((q) => q.requiresChildren),
    ).toBe(false);
  });

  it("requires every applicable text question, trimmed, and nothing hidden", () => {
    expect(
      Object.keys(validateInterviewAnswers(["community"], {})),
    ).toHaveLength(31);
    const a = fill(["community"], "no");
    expect(validateInterviewAnswers(["community"], a)).toEqual(
      {},
    );
    expect(
      Object.keys(
        validateInterviewAnswers(["community"], {
          ...a,
          "A.all.aboutYourself": "   ",
        }),
      ),
    ).toEqual(["A.all.aboutYourself"]);
    // Children Yes makes the four follow-ups required.
    expect(
      Object.keys(
        validateInterviewAnswers(["community"], {
          ...a,
          [FF_CHILDREN_QUESTION_ID]: "yes",
        }),
      ),
    ).toHaveLength(4);
  });
});

describe("saving an interview (older seeded mentor)", () => {
  it("persists by exact application id, staff-only, and survives a reload", () => {
    const a = fill(["community"], "no");
    expect(getFFMentorInterview("FF-CB-101")).toBeNull();
    expect(save("FF-CB-101", a).ok).toBe(true);
    __reloadFFMentorApplicationsForTest();
    expect(getFFMentorInterview("FF-CB-101")).toMatchObject({
      answers: a,
      updatedBy: "Test Staff",
      updatedById: "staff-test",
    });
    // Not on another application; the legacy mentor did not become a submitted application.
    expect(getFFMentorInterview("FF-WB-101")).toBeNull();
    const saved = JSON.parse(localStorage.getItem(KEY)!);
    expect(saved.applications["FF-CB-101"]).toBeUndefined();
    expect(
      listFFMentorApplications().some(
        (x) => x.applicationId === "FF-CB-101",
      ),
    ).toBe(false);
  });

  it("does not write anything on read and keeps older saved records valid", () => {
    getFFMentorInterview("FF-CB-101");
    expect(localStorage.getItem(KEY)).toBeNull();
    localStorage.setItem(
      KEY,
      JSON.stringify({
        version: 1,
        applications: {},
        staff: {},
      }),
    );
    __reloadFFMentorApplicationsForTest();
    expect(getFFMentorInterview("FF-CB-101")).toBeNull();
    expect(
      save("FF-CB-101", fill(["community"], "no")).ok,
    ).toBe(true);
  });

  it("does not change checklist result, stage, approval, coordinator or applicant reads", () => {
    saveFFMentorCoordinatorDetails("FF-CB-101", {
      coordinatorId: 1,
      coordinatorNotes: "keep me",
    } as any);
    saveFFChecklistAssessments(
      "FF-CB-101",
      {
        mentorInterview: { result: "Failed", comment: "x" },
      } as any,
      actor as any,
    );
    const before = JSON.stringify(
      getFFMentorApplicationStaff("FF-CB-101"),
    );
    expect(
      save("FF-CB-101", fill(["community"], "no")).ok,
    ).toBe(true);
    expect(
      JSON.stringify(getFFMentorApplicationStaff("FF-CB-101")),
    ).toBe(before);
  });

  it("rejects unknown keys, wrong types and non-applicable answers, writing nothing", () => {
    const a = fill(["community"], "no");
    for (const bad of [
      { ...a, "Z.bogus": "x" },
      { ...a, "A.all.aboutYourself": 5 },
      { ...a, [FF_CHILDREN_QUESTION_ID]: "maybe" },
      { ...a, "J.sw.tueThu": "yes" }, // Community-only: Section J does not apply
      { ...a, "A.cb.childrenAges": "9" }, // children answer is No
    ]) {
      const r = save("FF-CB-101", bad as any);
      expect(r).toMatchObject({ ok: false, reason: "unknown" });
    }
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(
      save("FF-CB-101", { "A.all.aboutYourself": "x" }),
    ).toMatchObject({ ok: false, reason: "invalid" });
    expect(save("FF-CB-101", {})).toMatchObject({
      ok: false,
      reason: "empty",
    });
    expect(
      saveFFMentorInterview("FF-CB-101", a, {}, null),
    ).toMatchObject({ ok: false, reason: "actor" });
    expect(
      saveFFMentorInterview("NOPE", a, {}, actor),
    ).toMatchObject({ ok: false, reason: "missing" });
  });

  it("detects a conflicting change, and merges unrelated ones", () => {
    const a = fill(["community"], "no");
    save("FF-CB-101", a);
    expect(
      save(
        "FF-CB-101",
        { "A.all.aboutYourself": "mine" },
        { "A.all.aboutYourself": a["A.all.aboutYourself"] },
      ).ok,
    ).toBe(true);
    const r = save(
      "FF-CB-101",
      { "A.all.aboutYourself": "stale" },
      { "A.all.aboutYourself": a["A.all.aboutYourself"] },
    );
    expect(r).toMatchObject({
      ok: false,
      reason: "conflict",
      conflicts: ["A.all.aboutYourself"],
    });
    expect(
      getFFMentorInterview("FF-CB-101")!.answers[
        "A.all.aboutYourself"
      ],
    ).toBe("mine");
    expect(
      save(
        "FF-CB-101",
        { "I.all.questionsForMe": "other" },
        { "I.all.questionsForMe": a["I.all.questionsForMe"] },
      ).ok,
    ).toBe(true);
    expect(
      getFFMentorInterview("FF-CB-101")!.answers[
        "A.all.aboutYourself"
      ],
    ).toBe("mine");
  });

  it("a failed write saves nothing", () => {
    const real = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
    let r;
    try {
      r = save("FF-CB-101", fill(["community"], "no"));
    } finally {
      Storage.prototype.setItem = real;
    }
    expect(r).toMatchObject({ ok: false, reason: "storage" });
    expect(getFFMentorInterview("FF-CB-101")).toBeNull();
  });

  it("merges into the latest saved state, preserving unrelated data", () => {
    const a = fill(["community"], "no");
    // Another tab saves an unrelated staff change after this tab loaded.
    const raw = {
      version: 1,
      applications: {},
      staff: {
        "FF-CB-101": { coordinatorNotes: "other tab note" },
      },
      applicationEdits: {
        "FF-CB-101": {
          overview: { city: "Evanston" },
          describe: {},
          updatedAt: "d",
          updatedBy: "u",
          updatedById: "i",
        },
      },
    };
    localStorage.setItem(KEY, JSON.stringify(raw));
    expect(save("FF-CB-101", a).ok).toBe(true);
    const saved = JSON.parse(localStorage.getItem(KEY)!);
    expect(saved.staff["FF-CB-101"].coordinatorNotes).toBe(
      "other tab note",
    );
    expect(
      saved.applicationEdits["FF-CB-101"].overview.city,
    ).toBe("Evanston");
    expect(saved.interviews["FF-CB-101"].answers).toEqual(a);
  });
});

describe("program changes and children answer retain hidden answers", () => {
  it("keeps follow-ups when children becomes No, and answers when a program is removed", () => {
    const a = fill(["community"], "yes");
    expect(save("FF-CB-101", a).ok).toBe(true);
    expect(
      save(
        "FF-CB-101",
        { [FF_CHILDREN_QUESTION_ID]: "no" },
        { [FF_CHILDREN_QUESTION_ID]: "yes" },
      ).ok,
    ).toBe(true);
    const kept = getFFMentorInterview("FF-CB-101")!.answers;
    expect(kept["A.cb.childrenAges"]).toBe(
      a["A.cb.childrenAges"],
    );
    // Yes again: the retained follow-ups satisfy validation without retyping.
    expect(
      save(
        "FF-CB-101",
        { [FF_CHILDREN_QUESTION_ID]: "yes" },
        { [FF_CHILDREN_QUESTION_ID]: "no" },
      ).ok,
    ).toBe(true);
  });

  it("recomputes applicability from the current effective sub-programs", () => {
    expect(
      save("FF-CB-101", fill(["community"], "no")).ok,
    ).toBe(true);
    expect(
      setSubs("FF-CB-101", ["community", "school"]).ok,
    ).toBe(true);
    // Section J now applies and is required; saved Community answers retained.
    const r = save("FF-CB-101", { "J.sw.tueThu": "Yes" });
    expect(r).toMatchObject({ ok: false, reason: "invalid" });
    expect(Object.keys((r as any).fieldErrors).sort()).toEqual(
      text(["community", "school"], "no")
        .filter(
          (q) =>
            !(
              q.id in getFFMentorInterview("FF-CB-101")!.answers
            ) && q.id !== "J.sw.tueThu",
        )
        .map((q) => q.id)
        .sort(),
    );
    const full = {
      ...getFFMentorInterview("FF-CB-101")!.answers,
      ...fill(["school"]),
    };
    const change = Object.fromEntries(
      Object.entries(full).filter(
        ([k, v]) =>
          getFFMentorInterview("FF-CB-101")!.answers[k] !== v,
      ),
    );
    expect(save("FF-CB-101", change).ok).toBe(true);
    expect(setSubs("FF-CB-101", ["school"]).ok).toBe(true);
    expect(
      getFFMentorInterview("FF-CB-101")!.answers[
        "A.all.aboutYourself"
      ],
    ).toBeTruthy();
    expect(
      getFFMentorInterview("FF-CB-101")!.answers[
        "F.cb.boundaries"
      ],
    ).toBeTruthy(); // hidden, retained
  });

  it("round-trips every schema field for each program combination", () => {
    const combos: [string, FFSubProgramId[]][] = [
      ["FF-CB-101", ["community"]],
      ["FF-WB-101", ["work"]],
    ];
    for (const [id, progs] of combos) {
      const a = fill(
        progs,
        progs.includes("community") ? "yes" : undefined,
      );
      expect(save(id, a).ok).toBe(true);
    }
    __reloadFFMentorApplicationsForTest();
    expect(getFFMentorInterview("FF-CB-101")!.answers).toEqual(
      fill(["community"], "yes"),
    );
    expect(getFFMentorInterview("FF-WB-101")!.answers).toEqual(
      fill(["work"]),
    );
    // Separate records share nothing.
    expect(
      getFFMentorInterview("FF-WB-101")!.answers[
        "F.cb.boundaries"
      ],
    ).toBeUndefined();
  });

  it("covers School plus Work and Community plus School/Work", () => {
    expect(setSubs("FF-WB-101", ["school", "work"]).ok).toBe(
      true,
    );
    expect(save("FF-WB-101", fill(["school", "work"])).ok).toBe(
      true,
    );
    expect(
      Object.keys(getFFMentorInterview("FF-WB-101")!.answers),
    ).toHaveLength(19);
    expect(
      setSubs("FF-CB-101", ["community", "school", "work"]).ok,
    ).toBe(true);
    expect(
      save(
        "FF-CB-101",
        fill(["community", "school", "work"], "yes"),
      ).ok,
    ).toBe(true);
    expect(
      Object.keys(getFFMentorInterview("FF-CB-101")!.answers),
    ).toHaveLength(49);
  });
});

describe("applicant-facing reads", () => {
  it("never include interview content", () => {
    save("FF-CB-101", fill(["community"], "no"));
    const vms =
      listFFMentorApplicationsForApplicant("VOL-2001");
    const one = getFFMentorApplicationForApplicant(
      "VMS-5101",
      "VOL-2001",
    );
    expect(JSON.stringify([vms, one])).not.toContain(
      "answer A.all",
    );
    expect(JSON.stringify(vms)).not.toMatch(/interview/i);
  });
});