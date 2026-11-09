import { describe, expect, it } from "vitest";
import {
  FF_CHECKLIST_GROUPS,
  evaluateFFMentorReadiness,
} from "./ffMentorChecklist";
import {
  FF_READINESS_POLICY,
  type FFReadinessPolicy,
} from "./ffMentorReadinessPolicy";
import {
  FIXTURE_NOW,
  completeApplication,
} from "./ffMentorTestFixtures";

// A resolved policy for pure-assessment tests only. Production keeps both
// rules unresolved (FF_READINESS_POLICY).
const RESOLVED: FFReadinessPolicy = {
  drivingReviewApplies: (app) =>
    app.subPrograms.includes("community"),
  multiProgramReferencesMet: (_app, r) =>
    r.programs.every((p) => r.received >= p.required),
};
const run = (
  fx: ReturnType<typeof completeApplication>,
  policy: FFReadinessPolicy = RESOLVED,
) =>
  evaluateFFMentorReadiness(fx.app, fx.staff, {
    now: FIXTURE_NOW,
    policy,
  });
const item = (r: ReturnType<typeof run>, id: string) =>
  r.items.find((i) => i.id === id)!;

describe("checklist structure and applicability", () => {
  it("four groups with the ticket's items in order", () => {
    const r = run(completeApplication("A", ["community"]));
    expect(FF_CHECKLIST_GROUPS).toEqual([
      "Application Requirements",
      "Screening Requirements",
      "Training Requirements",
      "Documents & Agreements",
    ]);
    expect(r.items.map((i) => i.label)).toEqual([
      "Submitted Application",
      "Required References Complete",
      "Mentor Interview Complete",
      "Final Application Review Complete",
      "Background Check Complete",
      "Fingerprinting Complete",
      "Driving Record Review Complete",
      "CPI Assessment Complete",
      "VIRTUS / PGC Training Approved",
      "DCFS Training Approved",
      "Mentor Training Complete",
      "All Required Agreements Signed",
      "All Required Documents Uploaded",
      "All Required Documents Approved",
    ]);
    expect(
      r.items
        .filter((i) => i.kind === "system")
        .map((i) => i.id),
    ).toEqual([
      "submittedApplication",
      "referencesComplete",
      "virtusTraining",
      "dcfsTraining",
      "agreementsSigned",
      "documentsUploaded",
      "documentsApproved",
    ]);
  });
  it("fingerprinting CB/SB, CPI CB; WB-only marks them not applicable", () => {
    const wb = run(completeApplication("W", ["work"]));
    expect(item(wb, "fingerprinting").applicability).toBe(
      "not-applicable",
    );
    expect(item(wb, "cpiAssessment").applicability).toBe(
      "not-applicable",
    );
    const sb = run(completeApplication("S", ["school"]));
    expect(item(sb, "fingerprinting").applicability).toBe(
      "applies",
    );
    expect(item(sb, "cpiAssessment").applicability).toBe(
      "not-applicable",
    );
  });
  it("unrecognized sub-programs never produce an empty passed checklist", () => {
    const fx = completeApplication("U", ["community"]);
    fx.app.subPrograms = [];
    const r = run(fx);
    expect(
      r.items.every(
        (i) =>
          i.applicability === "unknown" &&
          i.result === "Pending",
      ),
    ).toBe(true);
    expect(r.eligible).toBe(false);
    fx.app.subPrograms = ["mystery" as never];
    expect(run(fx).eligible).toBe(false);
  });
});

describe("eligibility", () => {
  it("complete evidence + resolved rules → eligible (stage not required)", () => {
    const r = run(completeApplication("P", ["community"]));
    expect(r.reasons).toEqual([]);
    expect(r.eligible).toBe(true);
    expect(r.readyForMatch).toBe(false);
  });
  it("production policy: unknown driving-review applicability blocks even complete evidence", () => {
    const r = run(
      completeApplication("P", ["work"]),
      FF_READINESS_POLICY,
    );
    expect(item(r, "drivingRecordReview")).toMatchObject({
      applicability: "unknown",
      result: "Pending",
    });
    expect(r.eligible).toBe(false);
    expect(r.reasons.join(" ")).toContain(
      "driving-record review",
    );
  });
  it("multi-program reference counting unresolved blocks readiness", () => {
    const r = run(
      completeApplication("M", ["community", "school"]),
      { ...RESOLVED, multiProgramReferencesMet: null },
    );
    expect(item(r, "referencesComplete")).toMatchObject({
      applicability: "unknown",
      result: "Pending",
    });
    expect(r.eligible).toBe(false);
  });
  it("fingerprint and CPI uploads alone don't pass screening outcomes", () => {
    const fx = completeApplication("F", ["community"]);
    delete fx.staff.checklistAssessments.fingerprinting;
    delete fx.staff.checklistAssessments.cpiAssessment;
    const r = run(fx);
    expect(item(r, "fingerprinting").result).toBe("Pending");
    expect(item(r, "cpiAssessment").result).toBe("Pending");
    expect(item(r, "documentsApproved").result).toBe("Passed");
    expect(r.eligible).toBe(false);
  });
  it("rejected, replaced, unavailable documents and expired DCFS block readiness", () => {
    const rej = completeApplication("R", ["work"]);
    rej.staff.documentReviews.driversLicense.status =
      "rejected";
    expect(item(run(rej), "documentsApproved").result).toBe(
      "Failed",
    );
    const repl = completeApplication("R2", ["work"]);
    repl.app.certificates.virtus!.storageRef =
      "test/R2/virtus-v2";
    const rr = run(repl);
    expect(item(rr, "virtusTraining").result).toBe("Pending");
    expect(item(rr, "documentsApproved").result).toBe(
      "Pending",
    );
    expect(rr.eligible).toBe(false);
    const gone = completeApplication("R3", ["work"]);
    delete gone.app.uploads.driversLicence.storageRef;
    expect(item(run(gone), "documentsUploaded").result).toBe(
      "Pending",
    );
    const old = completeApplication("R4", ["work"]);
    old.staff.documentReviews.dcfs.verifiedDocumentDate =
      "10/19/2023";
    const ro = run(old);
    expect(item(ro, "dcfsTraining").result).toBe("Failed");
    expect(item(ro, "documentsApproved").result).toBe("Failed");
  });
  it("missing or unverified agreements block readiness", () => {
    const fx = completeApplication("G", ["work"]);
    delete fx.app.answers.consent.agreements.mentorRights;
    expect(item(run(fx), "agreementsSigned").result).toBe(
      "Pending",
    );
    const bad = completeApplication("G2", ["work"]);
    bad.app.answers.consent.agreements.mentorRights =
      "not a date";
    expect(item(run(bad), "agreementsSigned").reason).toContain(
      "can't be verified",
    );
  });
  it("manual passes can't bypass failed system requirements; a staff Failed shows Failed", () => {
    const fx = completeApplication("B", ["work"]);
    fx.staff.documentReviews.virtus.status = "rejected";
    const r = run(fx);
    expect(item(r, "mentorInterview").result).toBe("Passed");
    expect(item(r, "virtusTraining").result).toBe("Failed");
    expect(r.eligible).toBe(false);
    const f = completeApplication("B2", ["work"]);
    f.staff.checklistAssessments.backgroundCheck.result =
      "Failed";
    expect(item(run(f), "backgroundCheck").result).toBe(
      "Failed",
    );
  });
  it("submission must be recorded; references below threshold stay Pending", () => {
    const fx = completeApplication("S1", ["school"]);
    fx.app.submittedAt = "";
    fx.app.references[1].responseStatus = "awaiting";
    fx.app.references[2].responseStatus = "awaiting";
    const r = run(fx);
    expect(item(r, "submittedApplication").result).toBe(
      "Pending",
    );
    expect(item(r, "referencesComplete").reason).toBe(
      "1 of 2 required responses received.",
    );
  });
  it("losing eligibility at Ready for Match is reported, stage untouched", () => {
    const fx = completeApplication("L", ["community"]);
    fx.staff.stage = "Ready for Match";
    expect(run(fx)).toMatchObject({
      eligible: true,
      readyForMatch: true,
      lostEligibility: false,
    });
    fx.staff.documentReviews.cpi.status = "rejected";
    expect(run(fx)).toMatchObject({
      eligible: false,
      readyForMatch: false,
      lostEligibility: true,
    });
    expect(fx.staff.stage).toBe("Ready for Match");
  });
});