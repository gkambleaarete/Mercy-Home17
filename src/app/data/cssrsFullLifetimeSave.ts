// The one save path for the C-SSRS Full-Lifetime form (US 20139): validates
// all four sections, then writes through cssrsAssessmentStore (the only saved
// source, which applies the same normalization and validation again).
// Nothing is saved unless validation AND the write succeed.

import {
  createCssrsAssessment,
  getCssrsAssessments,
  updateCssrsAssessment,
  type CssrsAssessment,
  type CssrsOwnership,
} from "./cssrsAssessmentStore";
import { validateFullLifetime } from "./cssrsFullLifetimeRules";
import type { FullLifetimeResponses } from "./cssrsTypes";

export type FullLifetimeSaveResult =
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
      errors?: Record<string, string>;
    };

export interface FullLifetimeSaveInput {
  /** Saved assessment being edited, or null for a new one. */
  editingId: string | null;
  /** Used for a NEW record only; an edit keeps the original owner. */
  ownership: Omit<CssrsOwnership, "admissionsRecordId"> & {
    admissionsRecordId: string | null;
  };
  assessmentDate: string;
  responses: FullLifetimeResponses;
}

export function saveCssrsFullLifetime(
  input: FullLifetimeSaveInput,
): FullLifetimeSaveResult {
  const errors = validateFullLifetime(input);
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
    if (
      existing &&
      existing.instrument !== "cssrs-full-lifetime"
    )
      return {
        ok: false,
        reason: "invalid",
        error: "This assessment is not a C-SSRS Full-Lifetime.",
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
      : {
          ok: false,
          reason: res.reason,
          error: res.error,
          errors: res.fieldErrors,
        };
  }

  const { admissionsRecordId } = input.ownership;
  if (admissionsRecordId === null)
    return {
      ok: false,
      reason: "owner",
      error:
        "A C-SSRS Full-Lifetime can only be added from an Admissions record.",
    };
  const res = createCssrsAssessment({
    instrument: "cssrs-full-lifetime",
    ownership: { ...input.ownership, admissionsRecordId },
    assessmentDate: input.assessmentDate,
    responses: input.responses,
  });
  return res.ok
    ? res
    : {
        ok: false,
        reason: res.reason,
        error: res.error,
        errors: res.fieldErrors,
      };
}