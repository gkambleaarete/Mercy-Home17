// The one save path for the C-SSRS Screener form (US 20105): validates the
// active question path, then writes through cssrsAssessmentStore (the only
// saved source). Nothing is saved unless validation AND the write succeed.

import {
  createCssrsAssessment,
  getCssrsAssessments,
  updateCssrsAssessment,
  type CssrsAssessment,
  type CssrsOwnership,
} from "./cssrsAssessmentStore";
import {
  validateScreener,
  type ScreenerErrors,
} from "./cssrsScreener";
import type { ScreenerResponses } from "./cssrsTypes";

export type ScreenerSaveResult =
  | { ok: true; record: CssrsAssessment }
  | {
      ok: false;
      reason:
        | "invalid"
        | "owner"
        | "storage"
        | "unreadable"
        | "not-found";
      error: string;
      errors?: ScreenerErrors;
    };

export interface ScreenerSaveInput {
  /** Saved assessment being edited, or null for a new one. */
  editingId: string | null;
  /** Used for a NEW record only; an edit keeps the original owner. */
  ownership: Omit<CssrsOwnership, "admissionsRecordId"> & {
    admissionsRecordId: string | null;
  };
  assessmentDate: string;
  responses: ScreenerResponses;
  eligibleIncidentReportIds: readonly string[];
}

export function saveCssrsScreener(
  input: ScreenerSaveInput,
): ScreenerSaveResult {
  const errors = validateScreener(input);
  if (Object.keys(errors).length > 0)
    return {
      ok: false,
      reason: "invalid",
      error: "Complete the highlighted fields.",
      errors,
    };

  if (input.editingId !== null) {
    // The saved test type decides what can be edited here; a record of
    // another type is refused, never overwritten.
    const read = getCssrsAssessments();
    const existing =
      read.status === "ok"
        ? read.records.find((r) => r.id === input.editingId)
        : undefined;
    if (existing && existing.instrument !== "cssrs-screener")
      return {
        ok: false,
        reason: "invalid",
        error: "This assessment is not a C-SSRS Screener.",
      };
    const res = updateCssrsAssessment(
      input.editingId,
      (prev) => {
        return {
          assessmentDate: input.assessmentDate,
          responses: input.responses,
        };
      },
    );
    return res.ok
      ? res
      : { ok: false, reason: res.reason, error: res.error };
  }

  const { admissionsRecordId } = input.ownership;
  if (admissionsRecordId === null)
    return {
      ok: false,
      reason: "owner",
      error:
        "A C-SSRS Screener can only be added from an Admissions record.",
    };
  const res = createCssrsAssessment({
    instrument: "cssrs-screener",
    ownership: { ...input.ownership, admissionsRecordId },
    assessmentDate: input.assessmentDate,
    responses: input.responses,
  });
  return res.ok
    ? res
    : { ok: false, reason: res.reason, error: res.error };
}