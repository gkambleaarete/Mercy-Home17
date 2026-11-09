import { describe, expect, it } from "vitest";
import {
  assessFFDocuments,
  checkDcfsDate,
  ffApplicableDocuments,
  ffDocumentStatus,
  ffPgcStatus,
} from "./ffMentorDocuments";
import {
  defaultFFMentorApplicationStaff,
  type FFFileRef,
  type FFMentorApplication,
} from "./ffMentorApplication";
import { SEED_FF_MENTOR_APPLICATIONS } from "./mockFFMentorApplications";

const file = (
  storageRef?: string,
  extra: Partial<FFFileRef> = {},
): FFFileRef => ({
  fileName: "cert.pdf",
  mimeType: "application/pdf",
  sizeBytes: 10,
  uploadedAt: "10/03/2026",
  ...(storageRef ? { storageRef } : {}),
  ...extra,
});
const make = (
  subPrograms: FFMentorApplication["subPrograms"],
  certificates: FFMentorApplication["certificates"] = {},
  uploads: FFMentorApplication["uploads"] = {},
) => {
  const a = structuredClone(SEED_FF_MENTOR_APPLICATIONS[0]);
  return { ...a, subPrograms, certificates, uploads };
};
const staff = (reviews: Record<string, object> = {}) => ({
  ...defaultFFMentorApplicationStaff(),
  documentReviews: reviews as never,
});
const types = (a: FFMentorApplication) =>
  ffApplicableDocuments(a).map((d) => d.type);

describe("required documents", () => {
  it("per sub-program, shared ones once", () => {
    expect(types(make(["community"]))).toEqual([
      "driversLicense",
      "autoInsurance",
      "virtus",
      "dcfs",
      "accurateBiometrics",
      "cpi",
    ]);
    expect(types(make(["school"]))).toEqual([
      "driversLicense",
      "virtus",
      "dcfs",
      "accurateBiometrics",
    ]);
    expect(types(make(["work"]))).toEqual([
      "driversLicense",
      "virtus",
      "dcfs",
    ]);
    expect(types(make(["school", "work"]))).toEqual([
      "driversLicense",
      "virtus",
      "dcfs",
      "accurateBiometrics",
    ]);
  });
});

describe("Accurate Biometrics upload", () => {
  it("counts per program: 6 / 4 / 3", () => {
    expect(types(make(["community"]))).toHaveLength(6);
    expect(types(make(["school"]))).toHaveLength(4);
    expect(types(make(["work"]))).toHaveLength(3);
  });
  it("an old Fingerprint Receipt or agreement signature never becomes the upload", () => {
    const a = make(
      ["community"],
      { fingerprint: file("fp1") },
      {},
    );
    a.answers.consent.agreements.accurateBiometrics =
      "October 1, 2026 at 9:00:00 AM";
    const st = ffDocumentStatus(
      a,
      staff({
        fingerprint: { status: "approved", fileId: "fp1" },
      }),
      "accurateBiometrics",
    );
    expect(st.fileState).toBe("Not Uploaded");
    expect(st.approval).toBe("Pending");
    expect(types(a)).not.toContain("fingerprint");
  });
  it("a real upload has its own file-specific review", () => {
    const a = make(
      ["school"],
      {},
      { accurateBiometrics: file("ab1") },
    );
    expect(
      ffDocumentStatus(a, staff(), "accurateBiometrics")
        .approval,
    ).toBe("Pending Approval");
    expect(
      ffDocumentStatus(
        a,
        staff({
          accurateBiometrics: {
            status: "approved",
            fileId: "ab1",
          },
        }),
        "accurateBiometrics",
      ).approval,
    ).toBe("Approved");
  });
});

describe("PGC/VIRTUS and approval status", () => {
  it("Pending / Pending Approval / Approved / Rejected", () => {
    expect(ffPgcStatus(make(["work"]), staff()).approval).toBe(
      "Pending",
    );
    expect(
      ffPgcStatus(
        make(["work"], { virtus: file("f-1") }),
        staff(),
      ).approval,
    ).toBe("Pending Approval");
    expect(
      ffPgcStatus(
        make(["work"], { virtus: file("f-1") }),
        staff({
          virtus: { status: "approved", fileId: "f-1" },
        }),
      ).approval,
    ).toBe("Approved");
    expect(
      ffPgcStatus(
        make(["work"], { virtus: file("f-1") }),
        staff({
          virtus: { status: "rejected", fileId: "f-1" },
        }),
      ).approval,
    ).toBe("Rejected");
  });
  it("an approval of an earlier file doesn't approve a replacement", () => {
    const s = ffPgcStatus(
      make(["work"], { virtus: file("f-2") }),
      staff({ virtus: { status: "approved", fileId: "f-1" } }),
    );
    expect(s.approval).toBe("Pending Approval");
    expect(s.review).toBeUndefined();
    expect(s.unmatchedReview?.fileId).toBe("f-1");
    expect(s.issues[0]).toContain("earlier file");
  });
  it("a decision not linked to a file isn't confirmed; same file name doesn't count", () => {
    const s = ffPgcStatus(
      make(["work"], { virtus: file("f-1") }),
      staff({ virtus: { status: "approved" } }),
    );
    expect(s.approval).toBe("Pending Approval");
    expect(s.issues[0]).toContain("isn't linked");
    const byName = ffPgcStatus(
      make(["work"], {
        virtus: file("f-9", { fileName: "same.pdf" }),
      }),
      staff({
        virtus: { status: "approved", fileId: "same.pdf" },
      }),
    );
    expect(byName.approval).toBe("Pending Approval");
  });
  it("an upload with no file on record is distinguished from a missing upload", () => {
    const s = ffDocumentStatus(
      make(["work"], {}, { driversLicence: file(undefined) }),
      staff(),
      "driversLicense",
    );
    expect(s.fileState).toBe("File Unavailable");
    expect(s.approval).toBe("Pending Approval");
    expect(
      ffDocumentStatus(
        make(["work"]),
        staff(),
        "driversLicense",
      ).fileState,
    ).toBe("Not Uploaded");
  });
});

describe("DCFS certificate date", () => {
  const now = new Date(2026, 9, 20);
  it("valid, boundary, expired, future, invalid and missing", () => {
    expect(
      checkDcfsDate(file("d"), "10/20/2023", now),
    ).toMatchObject({ ok: true, source: "reviewer" });
    expect(
      checkDcfsDate(file("d"), "10/19/2023", now),
    ).toMatchObject({ ok: false });
    expect(checkDcfsDate(file("d"), "10/21/2026", now)).toEqual(
      {
        ok: false,
        reason: "The certificate date can't be in the future.",
      },
    );
    expect(
      checkDcfsDate(file("d"), "02/30/2026", now),
    ).toMatchObject({
      ok: false,
      reason: expect.stringContaining("valid"),
    });
    expect(checkDcfsDate(file("d"), "", now)).toMatchObject({
      ok: false,
      reason: expect.stringContaining(
        "Enter the certificate date",
      ),
    });
    expect(
      checkDcfsDate(
        file("d", { documentDate: "05/01/2025" }),
        undefined,
        now,
      ),
    ).toMatchObject({ ok: true, source: "recorded" });
    expect(
      checkDcfsDate(
        file("d", { documentDate: "05/01/2020" }),
        "05/01/2025",
        now,
      ),
    ).toMatchObject({ ok: false });
  });
});

describe("assessment", () => {
  it("lists applicable, missing, unavailable, approved, rejected, pending and date issues", () => {
    const a = make(
      ["community"],
      {
        virtus: file("v1"),
        dcfs: file("d1"),
        cpi: file(undefined),
      },
      { driversLicence: file("l1") },
    );
    const s = staff({
      virtus: { status: "approved", fileId: "v1" },
      driversLicense: { status: "rejected", fileId: "l1" },
      dcfs: {
        status: "approved",
        fileId: "d1",
        verifiedDocumentDate: "01/01/2020",
      },
    });
    const r = assessFFDocuments(a, s, new Date(2026, 9, 20));
    expect(r.applicable).toHaveLength(6);
    expect(r.missing.sort()).toEqual([
      "accurateBiometrics",
      "autoInsurance",
    ]);
    expect(r.unavailable).toEqual(["cpi"]);
    expect(r.approved.sort()).toEqual(["dcfs", "virtus"]);
    expect(r.rejected).toEqual(["driversLicense"]);
    expect(r.trainingDateIssues).toEqual([
      {
        type: "dcfs",
        reason: expect.stringContaining("more than 3 years"),
      },
    ]);
  });
});