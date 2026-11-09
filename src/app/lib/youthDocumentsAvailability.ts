// Single upload-availability decision for Youth Documents (US 20147).
//
// The page header action, the empty-state action and the form submit all
// read this one function so they can never disagree. "hidden" = the user is
// not permitted (the action is not offered); "disabled" = permitted but
// temporarily unavailable, with a staff-facing reason to show beside it.

export type UploadAvailability =
  | { state: "enabled" }
  | { state: "hidden" }
  | { state: "disabled"; reason: string };

export function uploadAvailability(input: {
  /** The view resolved to a verified owner (a Youth, or an Admissions
   *  record that has no Youth link yet). */
  hasOwner: boolean;
  canUpload: boolean;
  catalogReady: boolean;
  storageReady: boolean;
  /** The new upload would be owned by an Admissions record (no Youth link). */
  ownerIsAdmission?: boolean;
  /** The installed storage can file Admissions-owned documents. Its external
   *  contract is pending, so this is false unless a gateway opts in. */
  admissionFilingReady?: boolean;
}): UploadAvailability {
  if (!input.canUpload) return { state: "hidden" };
  if (!input.hasOwner)
    return {
      state: "disabled",
      reason:
        "Upload is unavailable because this record could not be verified.",
    };
  if (!input.catalogReady)
    return {
      state: "disabled",
      reason:
        "Upload is unavailable until the document catalog is configured.",
    };
  if (!input.storageReady)
    return {
      state: "disabled",
      reason:
        "Upload is unavailable until Laserfiche storage is connected.",
    };
  if (input.ownerIsAdmission && !input.admissionFilingReady)
    return {
      state: "disabled",
      reason:
        "Upload is unavailable for this Admissions record until Laserfiche filing for Admissions records is configured.",
    };
  return { state: "enabled" };
}