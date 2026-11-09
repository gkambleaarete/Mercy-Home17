// Medication Home and its two global worklists (tickets 20141–20143). They
// are addressed as /medications?section=<key>, so refresh, direct links and
// browser Back/Forward keep the section. They are global — never added to
// the Program-origin REVIEW_SECTIONS, so they never inherit a Program lock.
export const MEDICATION_HOME_SECTION = "home";
export const GLOBAL_MEDICATION_ERRORS_SECTION =
  "global-medication-errors";
export const MISSING_MEDICATION_DOCUMENTATION_SECTION =
  "missing-medication-documentation";

export const GLOBAL_MEDICATION_SECTIONS = [
  MEDICATION_HOME_SECTION,
  GLOBAL_MEDICATION_ERRORS_SECTION,
  MISSING_MEDICATION_DOCUMENTATION_SECTION,
] as const;

export type GlobalMedicationSection =
  (typeof GLOBAL_MEDICATION_SECTIONS)[number];

/** Home or either global worklist. */
export function isGlobalMedicationSection(
  section: string | null | undefined,
): section is GlobalMedicationSection {
  return (GLOBAL_MEDICATION_SECTIONS as readonly string[]).includes(
    section ?? "",
  );
}

export function medicationSectionUrl(
  section: GlobalMedicationSection,
): string {
  return `/medications?${new URLSearchParams({ section })}`;
}

/**
 * Whether the user may open the global worklists. Takes the scope from
 * accessibleProgramIds(): an empty list means NO Programs (also when the
 * user may not view reviews at all), never unrestricted access.
 */
export function canViewGlobalMedicationWorklists(
  scope: "all" | number[],
): boolean {
  return scope === "all" || scope.length > 0;
}

// ─── Global Medication Error Dashboard (US 20142) ───────────────────────────
// Its filters live in the URL, so refresh and Back/Forward keep them and a
// record opened from the dashboard can return to the same filtered view.
export const MED_DOCUMENTATION_SECTION = "med-documentation";

export interface GlobalMedicationErrorFilters {
  /** Canonical Program ID as a string, or "" for every authorized Program. */
  program: string;
  /** "Assigned" | "Updated", or "" for both. */
  status: string;
}

export const NO_GLOBAL_ERROR_FILTERS: GlobalMedicationErrorFilters = {
  program: "",
  status: "",
};

export function parseGlobalMedicationErrorFilters(
  params: URLSearchParams,
): GlobalMedicationErrorFilters {
  const program = params.get("gmeProgram") ?? "";
  const status = params.get("gmeStatus") ?? "";
  return {
    program: /^\d+$/.test(program) ? program : "",
    status: status === "Assigned" || status === "Updated" ? status : "",
  };
}

function filterParams(
  base: Record<string, string>,
  filters: GlobalMedicationErrorFilters,
): string {
  const p = new URLSearchParams(base);
  if (filters.program) p.set("gmeProgram", filters.program);
  if (filters.status) p.set("gmeStatus", filters.status);
  return `?${p}`;
}

/** Search string of the dashboard with its filters. */
export const globalMedicationErrorsSearch = (
  filters: GlobalMedicationErrorFilters,
) =>
  filterParams({ section: GLOBAL_MEDICATION_ERRORS_SECTION }, filters);

/** Search string that opens one documentation record (by canonical log id)
 *  in Med Documentation, remembering the dashboard filters to return to. */
export const medicationRecordSearch = (
  logId: string,
  filters: GlobalMedicationErrorFilters,
) =>
  filterParams(
    { section: MED_DOCUMENTATION_SECTION, recordId: logId },
    filters,
  );

// ─── Missing or Incomplete Medication Documentation (US 20143) ──────────────
// Same idea as the dashboard: filters live in the URL, and a record opened
// from this worklist remembers where to return to.
export const DOCUMENTATION_ISSUES_RETURN = "documentation-issues";

export const DOCUMENTATION_ISSUE_TYPES = [
  "missing-attestation",
  "youth-received-missing",
  "yes-yes-nonreceipt-code",
] as const;

export interface MissingDocumentationFilters {
  /** Canonical Program ID as a string, or "" for every authorized Program. */
  program: string;
  /** A DOCUMENTATION_ISSUE_TYPES value, or "" for all. */
  issue: string;
}

export const NO_DOCUMENTATION_FILTERS: MissingDocumentationFilters = {
  program: "",
  issue: "",
};

export function parseMissingDocumentationFilters(
  params: URLSearchParams,
): MissingDocumentationFilters {
  const program = params.get("dmProgram") ?? "";
  const issue = params.get("dmIssue") ?? "";
  return {
    program: /^\d+$/.test(program) ? program : "",
    issue: (DOCUMENTATION_ISSUE_TYPES as readonly string[]).includes(issue)
      ? issue
      : "",
  };
}

function documentationFilterParams(
  base: Record<string, string>,
  filters: MissingDocumentationFilters,
): string {
  const p = new URLSearchParams(base);
  if (filters.program) p.set("dmProgram", filters.program);
  if (filters.issue) p.set("dmIssue", filters.issue);
  return `?${p}`;
}

/** Search string of the worklist with its filters. */
export const missingDocumentationSearch = (
  filters: MissingDocumentationFilters,
) =>
  documentationFilterParams(
    { section: MISSING_MEDICATION_DOCUMENTATION_SECTION },
    filters,
  );

/** Search string that opens one documentation record (canonical log id) in
 *  Med Documentation and returns to this worklist with its filters. */
export const documentationIssueRecordSearch = (
  logId: string,
  filters: MissingDocumentationFilters,
) =>
  documentationFilterParams(
    {
      section: MED_DOCUMENTATION_SECTION,
      recordId: logId,
      returnTo: DOCUMENTATION_ISSUES_RETURN,
    },
    filters,
  );