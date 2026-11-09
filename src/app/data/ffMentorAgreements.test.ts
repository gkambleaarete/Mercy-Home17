import { describe, expect, it } from "vitest";
import {
  assessFFAgreements,
  ffAgreementRows,
} from "./ffMentorAgreements";
import {
  defaultFFMentorApplicationStaff,
  type FFMentorApplication,
} from "./ffMentorApplication";
import { SEED_FF_MENTOR_APPLICATIONS } from "./mockFFMentorApplications";

const staff = defaultFFMentorApplicationStaff();
const make = (
  subPrograms: FFMentorApplication["subPrograms"],
  consent: Partial<
    FFMentorApplication["answers"]["consent"]
  > = {},
  docsSigned: Record<string, boolean> = {},
) => {
  const a = structuredClone(SEED_FF_MENTOR_APPLICATIONS[0]);
  a.subPrograms = subPrograms;
  a.answers.consent = {
    backgroundSig: null,
    attestationSig: null,
    agreements: {},
    quarterlyUpdates: false,
    ...consent,
  };
  a.answers.docsSigned = docsSigned;
  return a;
};
const ids = (a: FFMentorApplication) =>
  ffAgreementRows(a, staff)
    .filter((r) => r.required)
    .map((r) => r.id);
const COMMON = [
  "finalAttestation",
  "backgroundConsent",
  "clientConfidentiality",
  "mentorRights",
  "mandatedReporter",
];

describe("applicable agreements", () => {
  it("CB only: 8 rows", () => {
    const list = ids(make(["community"]));
    expect(list).toEqual([
      ...COMMON,
      "publicTransit",
      "psychScreening",
      "mentorDescriptionCB",
    ]);
    expect(list).toHaveLength(8);
  });
  it("SB only: 6 rows", () => {
    const list = ids(make(["school"]));
    expect(list).toEqual([...COMMON, "mentorDescriptionSB"]);
    expect(list).toHaveLength(6);
  });
  it("WB only: 6 rows", () => {
    const list = ids(make(["work"]));
    expect(list).toEqual([...COMMON, "mentorDescriptionWB"]);
    expect(list).toHaveLength(6);
  });
  it("all three: 10 distinct rows, common ones not duplicated", () => {
    const list = ids(make(["community", "school", "work"]));
    expect(list).toEqual([
      ...COMMON,
      "publicTransit",
      "psychScreening",
      "mentorDescriptionCB",
      "mentorDescriptionSB",
      "mentorDescriptionWB",
    ]);
    expect(new Set(list).size).toBe(list.length);
    expect(list).toHaveLength(10);
  });
  it("uses the current names", () => {
    const names = ffAgreementRows(
      make(["community", "school", "work"]),
      staff,
    ).map((r) => r.name);
    expect(names).toEqual([
      "Final Attestation",
      "Mentor Consent to Background & Driving Check",
      "Mentor's Agreement to Uphold Client Confidentiality",
      "Mentor Rights & Grievances",
      "Acknowledgement for Mandated Reporter Status",
      "Mentor's Public Transit Agreement",
      "Waiver for Psychological Screening Feedback",
      "Mentor Description Form (CB)",
      "Mentor Description Form (SB)",
      "Mentor Description Form (WB)",
    ]);
  });
  it("retired saved keys never reappear as rows or requirements", () => {
    const rows = ffAgreementRows(
      make(
        ["community", "school"],
        {
          agreements: {
            codeOfEthics: "October 1, 2026 at 9:00:00 AM",
            publicityRelease: "October 1, 2026 at 9:00:00 AM",
            fingerprintConsentCB:
              "October 1, 2026 at 9:00:00 AM",
            fingerprintConsentSB:
              "October 1, 2026 at 9:00:00 AM",
            accurateBiometrics: "October 1, 2026 at 9:00:00 AM",
          },
        },
        { codeOfEthics: true },
      ),
      staff,
    );
    expect(rows.map((r) => r.id)).not.toEqual(
      expect.arrayContaining(["codeOfEthics"]),
    );
    for (const k of [
      "codeOfEthics",
      "publicityRelease",
      "fingerprintConsentCB",
      "fingerprintConsentSB",
      "accurateBiometrics",
    ])
      expect(rows.some((r) => r.id === k)).toBe(false);
  });
});

describe("signature status", () => {
  it("a signature on one program's form doesn't satisfy another's", () => {
    const rows = ffAgreementRows(
      make(["community", "school"], {
        agreements: {
          publicTransit: "October 1, 2026 at 10:00:00 AM",
          mentorDescriptionCB: "October 1, 2026 at 10:01:00 AM",
        },
      }),
      staff,
    );
    const st = (id: string) =>
      rows.find((r) => r.id === id)!.status;
    expect(st("publicTransit")).toBe("Signed and Agreed");
    expect(st("mentorDescriptionCB")).toBe("Signed and Agreed");
    expect(st("mentorDescriptionSB")).toBe(
      "Signature Required",
    );
  });
  it("typed and drawn signatures keep their recorded details; no method assumed", () => {
    const png = "data:image/png;base64,iVBORw0KGgo=";
    const rows = ffAgreementRows(
      make(["work"], {
        backgroundSig: {
          signedAs: "Original Name",
          signedAt: "09/14/2026 10:42 AM",
          method: "type",
        },
        attestationSig: {
          signedAs: "handwritten signature",
          signedAt: "09/14/2026 10:44 AM",
          method: "draw",
          drawnPreview: png,
        },
      }),
      staff,
    );
    const bg = rows.find((r) => r.id === "backgroundConsent")!;
    const at = rows.find((r) => r.id === "finalAttestation")!;
    expect(bg).toMatchObject({
      status: "Signed and Agreed",
      signedAs: "Original Name",
      signedAt: "09/14/2026 10:42 AM",
      method: "type",
    });
    expect(bg.preview).toBeUndefined();
    expect(at).toMatchObject({ method: "draw", preview: png });
    const noMethod = ffAgreementRows(
      make(["work"], {
        backgroundSig: {
          signedAs: "A",
          signedAt: "09/01/2026 9:00 AM",
        },
      }),
      staff,
    ).find((r) => r.id === "backgroundConsent")!;
    expect(noMethod.method).toBeUndefined();
    const badPreview = ffAgreementRows(
      make(["work"], {
        attestationSig: {
          signedAs: "A",
          signedAt: "09/01/2026 9:00 AM",
          method: "draw",
          drawnPreview: "javascript:alert(1)",
        },
      }),
      staff,
    ).find((r) => r.id === "finalAttestation")!;
    expect(badPreview.preview).toBeUndefined();
    expect(badPreview.status).toBe("Signed and Agreed");
  });
  it("incomplete, conflicting, undated or unavailable evidence is Unverified, not signed or missing", () => {
    const rows = ffAgreementRows(
      make(
        ["community"],
        {
          backgroundSig: { signedAs: "A", signedAt: "" },
          agreements: {
            mentorRights: "October 1, 2026 at 9:00:00 AM",
            publicTransit: "",
          },
        },
        { mentorRights: false, clientConfidentiality: true },
      ),
      staff,
    );
    const st = (id: string) => rows.find((r) => r.id === id)!;
    expect(st("backgroundConsent")).toMatchObject({
      status: "Unverified",
    });
    expect(st("mentorRights")).toMatchObject({
      status: "Unverified",
      issue: "The saved signing records conflict.",
    });
    expect(st("publicTransit").status).toBe("Unverified");
    expect(st("clientConfidentiality").issue).toContain(
      "no signing date/time",
    );
    expect(st("mandatedReporter").status).toBe(
      "Signature Required",
    );
    const noConsent = make(["work"]);
    delete (
      noConsent.answers as Partial<
        FFMentorApplication["answers"]
      >
    ).consent;
    expect(
      ffAgreementRows(noConsent, staff).every(
        (r) => r.status === "Unverified",
      ),
    ).toBe(true);
  });
  it("review comes only from review records, never the signer", () => {
    const s = {
      ...staff,
      documentReviews: {
        mentorRights: {
          status: "approved" as const,
          reviewedBy: "Reviewer R",
          reviewedAt: "10/10/2026",
        },
      },
    };
    const rows = ffAgreementRows(
      make(["work"], {
        backgroundSig: {
          signedAs: "Signer S",
          signedAt: "09/01/2026 9:00 AM",
        },
        agreements: {
          mentorRights: "September 1, 2026 at 9:01:00 AM",
        },
      }),
      s,
    );
    expect(
      rows.find((r) => r.id === "mentorRights")!.review
        ?.reviewedBy,
    ).toBe("Reviewer R");
    expect(
      rows.find((r) => r.id === "backgroundConsent")!.review,
    ).toBeUndefined();
  });
  it("earlier or unknown saved agreement keys are not listed and never substitute a required form", () => {
    const rows = ffAgreementRows(
      make(
        ["community"],
        {
          agreements: { publicTransitAgreement: "2026-09-01" },
        },
        {
          publicTransitAgreement: true,
          cbMentorAgreement: true,
        },
      ),
      staff,
    );
    expect(
      rows.find((r) => r.id === "publicTransit")!.status,
    ).toBe("Signature Required");
    expect(rows.every((r) => r.required)).toBe(true);
    expect(rows.map((r) => r.id)).not.toContain(
      "publicTransitAgreement",
    );
    expect(rows.map((r) => r.id)).not.toContain(
      "cbMentorAgreement",
    );
  });
  it("seeded VMS records show only their current applicable rows", () => {
    const counts: Record<string, number> = {
      "VMS-5101": 9,
      "VMS-5102": 6,
    };
    for (const app of SEED_FF_MENTOR_APPLICATIONS) {
      if (!(app.applicationId in counts)) continue;
      const before = JSON.stringify(app.answers.consent);
      const rows = ffAgreementRows(app, staff);
      expect(rows).toHaveLength(counts[app.applicationId]);
      expect(rows.every((r) => r.required)).toBe(true);
      // The saved evidence itself is untouched.
      expect(JSON.stringify(app.answers.consent)).toBe(before);
    }
  });
  it("invalid or unrecognizable timestamps are Unverified; valid formats are accepted", () => {
    const rows = ffAgreementRows(
      make(["work"], {
        backgroundSig: {
          signedAs: "A",
          signedAt: "sometime last week",
        },
        attestationSig: {
          signedAs: "A",
          signedAt: "02/30/2026 9:00 AM",
        },
        agreements: {
          mandatedReporter: "September 31, 2026 at 9:00:00 AM",
          clientConfidentiality:
            "September 30, 2026 at 9:58:01 AM",
          mentorRights: "2026-09-30T14:05:00.000Z",
          mentorDescriptionWB: "13/01/2026",
        },
      }),
      staff,
    );
    const st = (id: string) => rows.find((r) => r.id === id)!;
    expect(st("backgroundConsent")).toMatchObject({
      status: "Unverified",
      signedAt: "sometime last week",
    });
    expect(st("finalAttestation").status).toBe("Unverified");
    expect(st("mandatedReporter").status).toBe("Unverified");
    expect(st("mentorDescriptionWB").status).toBe("Unverified");
    expect(st("clientConfidentiality").status).toBe(
      "Signed and Agreed",
    );
    expect(st("mentorRights").status).toBe("Signed and Agreed");
  });

  it("assessment lists applicable, signed, missing and unverified", () => {
    const a = assessFFAgreements(
      make(["work"], {
        backgroundSig: {
          signedAs: "A",
          signedAt: "09/01/2026 9:00 AM",
        },
        attestationSig: {
          signedAs: "",
          signedAt: "09/01/2026 9:00 AM",
        },
      }),
      staff,
    );
    expect(a.applicable).toHaveLength(6);
    expect(a.signed).toEqual(["backgroundConsent"]);
    expect(a.unverified.map((u) => u.id)).toEqual([
      "finalAttestation",
    ]);
    expect(a.missing).toHaveLength(4);
  });
});