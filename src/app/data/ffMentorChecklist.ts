// Match Readiness Checklist (US 20039 Chunk 9). Pure evaluation from the
// current saved application and staff processing — nothing is stored here
// and no readiness flag is ever saved, so it can't go stale.
//
// System items reuse the reference (Chunk 6), agreement (Chunk 7) and
// document (Chunk 8) assessments. Staff items come only from saved staff
// assessments; a document upload never stands in for a screening outcome.

import {
  FF_SUB_PROGRAM_NAME,
  assessFFReferences,
  parseRecordedDate,
  type FFChecklistAssessment,
  type FFChecklistResult,
  type FFMentorApplication,
  type FFMentorApplicationStaff,
  type FFSubProgramId,
} from "./ffMentorApplication";
import { assessFFAgreements } from "./ffMentorAgreements";
import {
  assessFFDocuments,
  checkDcfsDate,
  ffDocumentStatus,
} from "./ffMentorDocuments";
import {
  FF_READINESS_POLICY,
  type FFReadinessPolicy,
} from "./ffMentorReadinessPolicy";

export type FFChecklistGroup =
  | "Application Requirements"
  | "Screening Requirements"
  | "Training Requirements"
  | "Documents & Agreements";

export const FF_CHECKLIST_GROUPS: FFChecklistGroup[] = [
  "Application Requirements",
  "Screening Requirements",
  "Training Requirements",
  "Documents & Agreements",
];

/** Which tab holds the evidence for a system item. */
export type FFChecklistLink =
  "references" | "consents-documents" | "overview";

interface ItemDef {
  id: string;
  label: string;
  group: FFChecklistGroup;
  kind: "system" | "staff";
  /** Applies when any of these is selected; "policy" = unresolved rule. */
  programs: FFSubProgramId[] | "policy";
}

const ALL: FFSubProgramId[] = ["community", "school", "work"];

export const FF_CHECKLIST_ITEMS: ItemDef[] = [
  {
    id: "submittedApplication",
    label: "Submitted Application",
    group: "Application Requirements",
    kind: "system",
    programs: ALL,
  },
  {
    id: "referencesComplete",
    label: "Required References Complete",
    group: "Application Requirements",
    kind: "system",
    programs: ALL,
  },
  {
    id: "mentorInterview",
    label: "Mentor Interview Complete",
    group: "Application Requirements",
    kind: "staff",
    programs: ALL,
  },
  {
    id: "finalApplicationReview",
    label: "Final Application Review Complete",
    group: "Application Requirements",
    kind: "staff",
    programs: ALL,
  },
  {
    id: "backgroundCheck",
    label: "Background Check Complete",
    group: "Screening Requirements",
    kind: "staff",
    programs: ALL,
  },
  {
    id: "fingerprinting",
    label: "Fingerprinting Complete",
    group: "Screening Requirements",
    kind: "staff",
    programs: ["community", "school"],
  },
  {
    id: "drivingRecordReview",
    label: "Driving Record Review Complete",
    group: "Screening Requirements",
    kind: "staff",
    programs: "policy",
  },
  {
    id: "cpiAssessment",
    label: "CPI Assessment Complete",
    group: "Screening Requirements",
    kind: "staff",
    programs: ["community"],
  },
  {
    id: "virtusTraining",
    label: "VIRTUS / PGC Training Approved",
    group: "Training Requirements",
    kind: "system",
    programs: ALL,
  },
  {
    id: "dcfsTraining",
    label: "DCFS Training Approved",
    group: "Training Requirements",
    kind: "system",
    programs: ALL,
  },
  {
    id: "mentorTraining",
    label: "Mentor Training Complete",
    group: "Training Requirements",
    kind: "staff",
    programs: ALL,
  },
  {
    id: "agreementsSigned",
    label: "All Required Agreements Signed",
    group: "Documents & Agreements",
    kind: "system",
    programs: ALL,
  },
  {
    id: "documentsUploaded",
    label: "All Required Documents Uploaded",
    group: "Documents & Agreements",
    kind: "system",
    programs: ALL,
  },
  {
    id: "documentsApproved",
    label: "All Required Documents Approved",
    group: "Documents & Agreements",
    kind: "system",
    programs: ALL,
  },
];

export const FF_STAFF_CHECKLIST_IDS = FF_CHECKLIST_ITEMS.filter(
  (i) => i.kind === "staff",
).map((i) => i.id);

export type FFApplicability =
  "applies" | "not-applicable" | "unknown";

export interface FFChecklistItem {
  id: string;
  label: string;
  group: FFChecklistGroup;
  kind: "system" | "staff";
  applicability: FFApplicability;
  /** Selected sub-programs it applies to (empty when not applicable/unknown). */
  appliesTo: FFSubProgramId[];
  result: FFChecklistResult;
  /** Why Pending/Failed, or why applicability is unknown. */
  reason?: string;
  assessment?: FFChecklistAssessment;
  link?: FFChecklistLink;
}

export interface FFMentorReadiness {
  items: FFChecklistItem[];
  /** Every applicable requirement Passed and nothing unknown. */
  eligible: boolean;
  /** Eligible and the saved stage is Ready for Match. */
  readyForMatch: boolean;
  /** Saved at Ready for Match but no longer eligible. */
  lostEligibility: boolean;
  reasons: string[];
}

const KNOWN: FFSubProgramId[] = ["community", "school", "work"];
const plural = (n: number, w: string) =>
  `${n} ${w}${n === 1 ? "" : "s"}`;

function systemResult(
  id: string,
  app: FFMentorApplication,
  staff: FFMentorApplicationStaff,
  policy: FFReadinessPolicy,
  now: Date,
): Pick<
  FFChecklistItem,
  "result" | "reason" | "link" | "applicability"
> {
  switch (id) {
    case "submittedApplication": {
      const submitted =
        !!parseRecordedDate(app.submittedAt) &&
        app.applicantStatus !== "draft" &&
        app.applicantStatus !== "in-progress";
      return submitted
        ? { result: "Passed", applicability: "applies" }
        : {
            result: "Pending",
            applicability: "applies",
            reason:
              "No completed submission is recorded for this application.",
          };
    }
    case "referencesComplete": {
      const r = assessFFReferences(app);
      const link = "references" as const;
      if (r.businessCount > 1)
        return {
          result: "Pending",
          applicability: "applies",
          link,
          reason: r.issues[0],
        };
      if (r.programs.length > 1) {
        if (!policy.multiProgramReferencesMet)
          return {
            result: "Pending",
            applicability: "unknown",
            link,
            reason:
              "How references count across more than one sub-program hasn't been confirmed.",
          };
        return policy.multiProgramReferencesMet(app, r)
          ? { result: "Passed", applicability: "applies", link }
          : {
              result: "Pending",
              applicability: "applies",
              link,
              reason: `${plural(r.received, "response")} received; requirement not yet met.`,
            };
      }
      const req = r.programs[0]?.required ?? 0;
      return r.requirementMet
        ? { result: "Passed", applicability: "applies", link }
        : {
            result: "Pending",
            applicability: "applies",
            link,
            reason: `${r.received} of ${req} required responses received.`,
          };
    }
    case "virtusTraining": {
      const s = ffDocumentStatus(app, staff, "virtus");
      const link = "consents-documents" as const;
      if (s.approval === "Approved")
        return {
          result: "Passed",
          applicability: "applies",
          link,
        };
      if (s.approval === "Rejected")
        return {
          result: "Failed",
          applicability: "applies",
          link,
          reason:
            "The current VIRTUS / PGC certificate was rejected.",
        };
      return {
        result: "Pending",
        applicability: "applies",
        link,
        reason:
          s.issues[0] ??
          (s.approval === "Pending"
            ? "No VIRTUS / PGC certificate has been uploaded."
            : "The VIRTUS / PGC certificate is awaiting approval."),
      };
    }
    case "dcfsTraining": {
      const s = ffDocumentStatus(app, staff, "dcfs");
      const link = "consents-documents" as const;
      if (s.approval === "Rejected")
        return {
          result: "Failed",
          applicability: "applies",
          link,
          reason: "The current DCFS certificate was rejected.",
        };
      if (s.approval === "Approved") {
        const date = checkDcfsDate(
          s.file,
          s.review?.verifiedDocumentDate,
          now,
        );
        return date.ok
          ? { result: "Passed", applicability: "applies", link }
          : {
              result: "Failed",
              applicability: "applies",
              link,
              reason: `DCFS certificate date no longer meets the requirement: ${date.reason}`,
            };
      }
      return {
        result: "Pending",
        applicability: "applies",
        link,
        reason:
          s.issues[0] ??
          (s.approval === "Pending"
            ? "No DCFS certificate has been uploaded."
            : "The DCFS certificate is awaiting approval."),
      };
    }
    case "agreementsSigned": {
      const a = assessFFAgreements(app, staff);
      const link = "consents-documents" as const;
      if (a.missing.length === 0 && a.unverified.length === 0)
        return {
          result: "Passed",
          applicability: "applies",
          link,
        };
      const parts = [
        a.missing.length
          ? `${plural(a.missing.length, "agreement")} not signed`
          : "",
        a.unverified.length
          ? `${plural(a.unverified.length, "agreement")} can't be verified`
          : "",
      ].filter(Boolean);
      return {
        result: "Pending",
        applicability: "applies",
        link,
        reason: `${parts.join("; ")}.`,
      };
    }
    case "documentsUploaded": {
      const d = assessFFDocuments(app, staff, now);
      const link = "consents-documents" as const;
      if (!d.missing.length && !d.unavailable.length)
        return {
          result: "Passed",
          applicability: "applies",
          link,
        };
      const parts = [
        d.missing.length
          ? `${plural(d.missing.length, "document")} not uploaded`
          : "",
        d.unavailable.length
          ? `${plural(d.unavailable.length, "upload")} with no file on record`
          : "",
      ].filter(Boolean);
      return {
        result: "Pending",
        applicability: "applies",
        link,
        reason: `${parts.join("; ")}.`,
      };
    }
    case "documentsApproved": {
      const d = assessFFDocuments(app, staff, now);
      const link = "consents-documents" as const;
      if (d.rejected.length)
        return {
          result: "Failed",
          applicability: "applies",
          link,
          reason: `${plural(d.rejected.length, "document")} rejected.`,
        };
      if (d.trainingDateIssues.length)
        return {
          result: "Failed",
          applicability: "applies",
          link,
          reason: d.trainingDateIssues[0].reason,
        };
      if (d.approved.length === d.applicable.length)
        return {
          result: "Passed",
          applicability: "applies",
          link,
        };
      return {
        result: "Pending",
        applicability: "applies",
        link,
        reason: `${plural(d.applicable.length - d.approved.length, "document")} not yet approved.`,
      };
    }
  }
  return {
    result: "Pending",
    applicability: "unknown",
    reason: "This requirement can't be evaluated.",
  };
}

/** The full checklist and readiness for one application, right now. */
export function evaluateFFMentorReadiness(
  app: FFMentorApplication,
  staff: FFMentorApplicationStaff,
  options: { now?: Date; policy?: FFReadinessPolicy } = {},
): FFMentorReadiness {
  const now = options.now ?? new Date();
  const policy = options.policy ?? FF_READINESS_POLICY;
  const selected = (app.subPrograms ?? []).filter((p) =>
    KNOWN.includes(p),
  );
  const programsKnown =
    selected.length > 0 &&
    selected.length === (app.subPrograms ?? []).length;

  const items = FF_CHECKLIST_ITEMS.map(
    (def): FFChecklistItem => {
      const base = {
        id: def.id,
        label: def.label,
        group: def.group,
        kind: def.kind,
      };
      if (!programsKnown)
        return {
          ...base,
          applicability: "unknown",
          appliesTo: [],
          result: "Pending",
          reason:
            "The selected sub-programs aren't recognized, so this requirement can't be evaluated.",
        };
      let applicability: FFApplicability;
      let appliesTo: FFSubProgramId[] = [];
      let unknownReason: string | undefined;
      if (def.programs === "policy") {
        if (!policy.drivingReviewApplies) {
          applicability = "unknown";
          unknownReason =
            "When a driving-record review is required hasn't been confirmed.";
        } else {
          applicability = policy.drivingReviewApplies(app)
            ? "applies"
            : "not-applicable";
          appliesTo =
            applicability === "applies" ? selected : [];
        }
      } else {
        appliesTo = def.programs.filter((p) =>
          selected.includes(p),
        );
        applicability = appliesTo.length
          ? "applies"
          : "not-applicable";
      }
      if (applicability === "not-applicable")
        return {
          ...base,
          applicability,
          appliesTo,
          result: "Pending",
        };

      if (def.kind === "system") {
        const r = systemResult(def.id, app, staff, policy, now);
        return { ...base, appliesTo, ...r };
      }
      const assessment = staff.checklistAssessments?.[def.id];
      const result = assessment?.result ?? "Pending";
      return {
        ...base,
        applicability,
        appliesTo,
        result:
          applicability === "unknown" ? "Pending" : result,
        assessment,
        reason:
          unknownReason ??
          (result === "Pending"
            ? assessment
              ? "Staff recorded this as Pending."
              : "Not yet assessed by staff."
            : result === "Failed"
              ? `Staff recorded this as Failed.${assessment?.note ? ` ${assessment.note}` : ""}`
              : undefined),
      };
    },
  );

  const required = items.filter(
    (i) => i.applicability !== "not-applicable",
  );
  const reasons = required
    .filter(
      (i) =>
        i.applicability === "unknown" || i.result !== "Passed",
    )
    .map(
      (i) =>
        `${i.label}: ${i.result === "Failed" ? "Failed" : "Pending"} — ${i.reason ?? "Not yet complete."}`,
    );
  const eligible = required.length > 0 && reasons.length === 0;
  const atStage = staff.stage === "Ready for Match";
  return {
    items,
    eligible,
    readyForMatch: eligible && atStage,
    lostEligibility: atStage && !eligible,
    reasons,
  };
}

export const ffProgramList = (ids: FFSubProgramId[]) =>
  ids.map((p) => FF_SUB_PROGRAM_NAME[p]).join(", ");