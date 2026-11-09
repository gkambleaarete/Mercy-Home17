// Test-only fixtures (imported by tests, never by the app). Builds an
// application with complete, verifiable evidence for the selected
// sub-programs, as of a controlled date.
import { FF_AGREEMENT_DEFINITIONS } from "./ffMentorAgreements";
import {
  defaultFFMentorApplicationStaff,
  type FFMentorApplication,
  type FFMentorApplicationStaff,
  type FFSubProgramId,
} from "./ffMentorApplication";
import { FF_DOCUMENT_DEFINITIONS } from "./ffMentorDocuments";
import { FF_STAFF_CHECKLIST_IDS } from "./ffMentorChecklist";
import { SEED_FF_MENTOR_APPLICATIONS } from "./mockFFMentorApplications";

export const FIXTURE_NOW = new Date(2026, 9, 20, 12, 0);

export function completeApplication(
  id: string,
  subPrograms: FFSubProgramId[],
): {
  app: FFMentorApplication;
  staff: FFMentorApplicationStaff;
} {
  const app = structuredClone(SEED_FF_MENTOR_APPLICATIONS[0]);
  app.applicationId = id;
  app.applicantId = `VOL-${id}`;
  app.subPrograms = subPrograms;
  app.submittedAt = "09/14/2026";
  app.applicantStatus = "background-check";
  app.references = ["r1", "r2", "r3"].map((rid, i) => ({
    id: rid,
    relationship: i === 0 ? "business" : "personal",
    name: `Ref ${rid}`,
    phone: "",
    email: `${rid}@example.org`,
    permissionGranted: true,
    submitted: true,
    responseStatus: "submitted" as const,
  }));
  const agreements: Record<string, string> = {};
  for (const d of FF_AGREEMENT_DEFINITIONS)
    if (d.source === "agreement")
      agreements[d.id] = "September 14, 2026 at 10:00:00 AM";
  app.answers.consent = {
    backgroundSig: {
      signedAs: "Signer",
      signedAt: "09/14/2026 10:42 AM",
      method: "type",
    },
    attestationSig: {
      signedAs: "Signer",
      signedAt: "09/14/2026 10:44 AM",
      method: "type",
    },
    agreements,
    quarterlyUpdates: false,
  };
  app.answers.docsSigned = {};
  app.uploads = {};
  app.certificates = {};
  const staff = defaultFFMentorApplicationStaff();
  for (const d of FF_DOCUMENT_DEFINITIONS) {
    const ref = `test/${id}/${d.type}`;
    const file = {
      fileName: `${d.type}.pdf`,
      mimeType: "application/pdf",
      sizeBytes: 10,
      uploadedAt: "10/01/2026",
      storageRef: ref,
    };
    if (d.source.from === "uploads")
      app.uploads[d.source.key] = file;
    else
      (app.certificates as Record<string, typeof file>)[
        d.source.key
      ] = file;
    staff.documentReviews[d.type] = {
      status: "approved",
      fileId: ref,
      reviewedBy: "Reviewer",
      reviewedById: "staff-r",
      reviewedAt: "10/02/2026 9:00 AM",
      ...(d.type === "dcfs"
        ? { verifiedDocumentDate: "06/01/2025" }
        : {}),
    };
  }
  for (const itemId of FF_STAFF_CHECKLIST_IDS)
    staff.checklistAssessments[itemId] = {
      result: "Passed",
      assessedBy: "Assessor",
      assessedById: "staff-a",
      assessedAt: "10/05/2026 9:00 AM",
      assessedAtIso: "2026-10-05T14:00:00.000Z",
    };
  return { app, staff };
}