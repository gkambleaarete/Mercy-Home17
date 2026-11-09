// Friends First Mentee Referral (US 20002) — field definitions, conditional
// predicates, age calculation and validation. Pure module (no storage, no
// React), so the page renders and the store validates from the same rules.
//
// Kept separate from the US 20040 guardian/youth intake definitions in
// ffMenteeIntake.ts; only small generic helpers are shared.

import type {
  FFGridRow,
  FFReferralRecord,
  FFSubProgramme,
} from "./mockFriendsFirstData";
import {
  isAffirmative,
  parseCalendarDate,
} from "./ffMenteeIntake";

export type RefFieldType =
  | "short"
  | "long"
  | "date"
  | "phone"
  | "extension"
  | "email"
  | "yesno"
  | "role"
  | "age";

export type RefTab = "general" | "questions";

export interface RefCtx {
  program: FFSubProgramme | "";
  values: Record<string, string>;
  /** Whether the current user may see/edit Staff Observations. */
  canStaff: boolean;
}

export interface RefField {
  kind: "field";
  key: string;
  label: string;
  type: RefFieldType;
  /** Mandatory on submit when visible. Defaults to true. */
  required?: boolean | ((ctx: RefCtx) => boolean);
  /** Shown (and validated) only when this returns true. */
  when?: (ctx: RefCtx) => boolean;
}

export interface RefGridColumn {
  key: string;
  label: string;
}

export interface RefGrid {
  kind: "grid";
  key: string;
  label: string;
  columns: RefGridColumn[];
  addLabel: string;
}

export type RefItem = RefField | RefGrid;

export interface RefGroup {
  id: string;
  title: string;
  tab: RefTab;
  program: FFSubProgramme;
  /** Staff Observations: rendered and validated only for authorized staff. */
  staffOnly?: boolean;
  items: RefItem[];
}

// ─── Predicates ──────────────────────────────────────────────────────────────

/** "Parent / Guardian", "parent/guardian", "Parent/ Guardian" … */
export function isParentGuardianRole(role: string | undefined) {
  return (
    (role ?? "").replace(/\s+/g, "").toLowerCase() ===
    "parent/guardian"
  );
}

export const isParentReferral = (ctx: RefCtx) =>
  isParentGuardianRole(ctx.values.referrerRole);

/** Story Yes/No picklist answers are stored as exactly "Yes" / "No". */
const isYes = (v: string | undefined) => v === "Yes";

/**
 * Free-text "Was the youth referred to other resources?" counts as yes only
 * for a clear affirmative ("Yes", "Yes, …") — shared with the US 20040
 * questionnaire. Ambiguous text does not make Resource Details mandatory
 * (interpretation pending BA confirmation).
 */
export const referredToOtherResources = (ctx: RefCtx) =>
  isAffirmative(ctx.values.so_referredOther);

// ─── Definitions ─────────────────────────────────────────────────────────────

const f = (
  key: string,
  label: string,
  type: RefFieldType = "short",
  opts: Partial<RefField> = {},
): RefField => ({ kind: "field", key, label, type, ...opts });

/** Above the tabs; apply to every program. */
export const GLOBAL_FIELDS = {
  program: "recommendedProgram",
  staffRecommendation: "staffRecommendation",
} as const;

export const AUTH_RELEASE_GRID: RefGrid = {
  kind: "grid",
  key: "authRelease",
  label: "Authorization for Release of Information",
  addLabel: "Add authorization",
  columns: [
    { key: "dateSent", label: "Date Sent" },
    { key: "dateReceived", label: "Date Received" },
    {
      key: "consentWith",
      label: "Consent to speak with whom?",
    },
  ],
};

const CB = "Community-Based" as const;

export const REFERRAL_GROUPS: RefGroup[] = [
  // ── General (CB only) ──
  {
    id: "cb-referral",
    title: "Referral Information",
    tab: "general",
    program: CB,
    items: [
      f("referralDate", "Referral Date", "date"),
      f("callerName", "Caller Name"),
      f("referrerRole", "Referrer Role / Relationship", "role"),
      f(
        "callerRelationship",
        "Caller Relationship to Candidate",
      ),
      f("language", "Language"),
      f("phone", "Phone", "phone"),
      f("extension", "Extension", "extension"),
      f("email", "Email", "email"),
      f("state", "State"),
      f("zipcode", "Zipcode"),
      f("referralSource", "Referral Source", "short", {
        when: (ctx) => !isParentReferral(ctx),
      }),
      f(
        "communityReferralOrg",
        "Community Referral Organization",
      ),
    ],
  },
  {
    id: "cb-candidate",
    title: "Candidate Information",
    tab: "general",
    program: CB,
    items: [
      f("candidateName", "Candidate Name"),
      f("candidateDob", "Candidate Birthdate", "date"),
      f("candidateAge", "Candidate Age", "age", {
        required: false,
      }),
      f("candidateGender", "Candidate Sex"),
      f("followUp", "Follow Up"),
    ],
  },
  {
    id: "cb-contact",
    title: "Contact Details",
    tab: "general",
    program: CB,
    items: [
      f("contactDate", "Date"),
      f("contactTime", "Time"),
      f("contactType", "Type"),
      f("contactResult", "Result"),
      f(
        "contactOrganization",
        "Community Referral Organization",
      ),
      f("contactDetails", "Details"),
    ],
  },

  // ── Referral Questions (CB) ──
  {
    id: "cb-demographics",
    title: "Basic Client Demographics",
    tab: "questions",
    program: CB,
    items: [
      f("bd_guardianName", "Parent/Guardian Name"),
      f("bd_addressType", "Address Type"),
      f("bd_address", "Address"),
      f("bd_city", "City"),
      f("bd_state", "State"),
      f("bd_zip", "Zip Code"),
      f("bd_neighborhood", "Neighborhood"),
      f("bd_ethnicity", "Ethnicity"),
    ],
  },
  {
    id: "cb-behavioral",
    title: "Behavioral and Safety History",
    tab: "questions",
    program: CB,
    items: [
      f(
        "bs_runaway",
        "Does the child have any history of running away?",
      ),
      f(
        "bs_selfHarm",
        "Does the child have any history of self-harm behaviors or hospitalizations?",
      ),
      f(
        "bs_hospitalized",
        "Has the child ever been hospitalized for behavioral or mental health reasons?",
      ),
      f(
        "bs_aggressive",
        "Has the child ever been physically aggressive with adults such as teachers, parents, or authority figures?",
      ),
    ],
  },
  {
    id: "cb-reasons",
    title: "Reasons for Referral",
    tab: "questions",
    program: CB,
    items: [
      f(
        "rr_heardAbout",
        "If the Parent/Guardian was the referral source, how did they hear about Friends First?",
        "short",
        { when: isParentReferral },
      ),
      f(
        "rr_motivated",
        "Is the child interested and motivated to participate in the program?",
      ),
      AUTH_RELEASE_GRID,
      f(
        "rr_infoReceived",
        "Please specify information received from the individual(s) above to help make your determination.",
      ),
      f(
        "familySituation",
        "What is the family situation? (Parents, siblings, family issues, foster care involvement, etc.)",
        "long",
      ),
      f(
        "rr_otherSupport",
        "Is the youth/family receiving support from another organization or agency? If yes, which organizations are involved and why?",
        "long",
      ),
      f("whyMentor", "Why is a mentor being requested?"),
      f(
        "specialEducation",
        "Is the child receiving special education accommodations (IEP/504 Plan)?",
      ),
      f("rr_grades", "Discuss grades and behavior in school."),
      f(
        "rr_legal",
        "Has the child had any involvement with the legal system? If yes, explain?",
        "long",
      ),
    ],
  },
  {
    id: "cb-medication",
    title: "Medication Information",
    tab: "questions",
    program: CB,
    items: [
      f(
        "med_taking",
        "Is the child currently taking any medications?",
        "yesno",
      ),
      ...(
        [
          ["med_name", "Medication Name"],
          ["med_reason", "Reason for Medication"],
          ["med_provider", "Prescribing Provider"],
          ["med_length", "Length of Time on Medication"],
          [
            "med_compliant",
            "Is the youth compliant with taking medication?",
          ],
          ["med_notes", "Medication Notes"],
        ] as const
      ).map(([k, l]) =>
        f(k, l, "short", {
          when: (ctx) => isYes(ctx.values.med_taking),
        }),
      ),
    ],
  },
  {
    id: "cb-therapy",
    title: "Therapy and Counseling",
    tab: "questions",
    program: CB,
    items: [
      f(
        "th_receiving",
        "Is the child currently receiving therapy or counseling?",
        "yesno",
      ),
      ...(
        [
          ["th_location", "Therapy/Counseling Location"],
          ["th_reason", "Reason for Therapy/Counseling"],
          ["th_duration", "Duration of Services"],
          ["th_observations", "Additional Observations"],
        ] as const
      ).map(([k, l]) =>
        f(k, l, "short", {
          when: (ctx) => isYes(ctx.values.th_receiving),
        }),
      ),
    ],
  },
  {
    id: "cb-assessment",
    title: "Youth Assessment",
    tab: "questions",
    program: CB,
    items: [
      f(
        "ya_strengths",
        "Child's Strengths and Challenges",
        "long",
      ),
      f(
        "ya_personality",
        "Child's Personality and Interests",
        "long",
      ),
      f("ya_availability", "Family/Child Availability"),
      f("ya_scheduling", "Scheduling Flexibility"),
      f(
        "ya_publicTransport",
        "Open to Mentor Using Public Transportation",
      ),
    ],
  },
  {
    id: "cb-staff",
    title: "Staff Observations",
    tab: "questions",
    program: CB,
    staffOnly: true,
    items: [
      f(
        "so_impressions",
        "Friends First Staff Overall Impressions",
      ),
      f(
        "so_recommended",
        "Is this youth recommended for consideration?",
      ),
      f(
        "so_notReferredReason",
        "Reason Why Youth Was Not Referred",
      ),
      f(
        "so_referredOther",
        "Was the youth referred to other resources?",
      ),
      f("so_resourceDetails", "Resource Details", "short", {
        required: referredToOtherResources,
      }),
    ],
  },

  // ── Referral Questions (WB) ──
  {
    id: "wb-malachy",
    title: "St. Malachy Program Questions",
    tab: "questions",
    program: "Work-Based",
    items: [
      f(
        "wb_enrolled",
        "Are you currently enrolled in St. Malachy's After-School Program?",
      ),
      f(
        "wb_thursdays",
        "Are you available to participate on Thursdays from 3:30 PM to 6:00 PM?",
      ),
      f(
        "wb_pickup",
        "Do you have any scheduling concerns that might conflict with the 6 PM pickup time?",
      ),
      f(
        "wb_extracurricular",
        "Do you anticipate extracurricular activities conflicting with participation on Thursdays?",
      ),
    ],
  },

  // ── Referral Questions (SB) ──
  {
    id: "sb-rowe",
    title: "Rowe Program Questions",
    tab: "questions",
    program: "School-Based",
    items: [
      f(
        "sb_enrolled",
        "Is your child currently enrolled in Rowe's After-School Program?",
      ),
      f(
        "sb_tuesdays",
        "Is the youth available to participate on Tuesdays from 3:30 PM to 5:00 PM?",
      ),
      f(
        "sb_extracurricular",
        "Do you anticipate your child being involved in extra-curricular activities this school year that might conflict with activities on Tuesdays?",
      ),
    ],
  },
];

/** Staff Observations keys — never writable by an unauthorized user. */
export const STAFF_KEYS: string[] = REFERRAL_GROUPS.filter(
  (g) => g.staffOnly,
).flatMap((g) =>
  g.items.filter((i) => i.kind === "field").map((i) => i.key),
);

/** Saved changes to these are listed in Details History. */
export const HISTORY_KEYS = [
  "contactDate",
  "contactTime",
  "contactType",
  "contactResult",
  "contactOrganization",
  "contactDetails",
  "followUp",
] as const;

export function fieldLabel(key: string): string {
  for (const g of REFERRAL_GROUPS)
    for (const i of g.items)
      if (i.key === key)
        return g.id === "cb-contact"
          ? `Contact ${i.label}`
          : i.label;
  return key;
}

// ─── Applicability ───────────────────────────────────────────────────────────

/** Groups applicable to the selected program and user. */
export function visibleRefGroups(
  ctx: RefCtx,
  tab?: RefTab,
): RefGroup[] {
  return REFERRAL_GROUPS.filter(
    (g) =>
      g.program === ctx.program &&
      (!tab || g.tab === tab) &&
      (!g.staffOnly || ctx.canStaff),
  );
}

export const visibleRefItems = (g: RefGroup, ctx: RefCtx) =>
  g.items.filter(
    (i) => i.kind === "grid" || !i.when || i.when(ctx),
  );

export function isRefRequired(field: RefField, ctx: RefCtx) {
  if (field.type === "age") return false;
  const r = field.required ?? true;
  return typeof r === "function" ? r(ctx) : r;
}

// ─── Values & helpers ────────────────────────────────────────────────────────

export const refFieldId = (key: string) => `rf-${key}`;
export const refCellId = (
  gridKey: string,
  rowId: string,
  col: string,
) => `rf-${gridKey}-${rowId}-${col}`;
export const refGridAddId = (gridKey: string) =>
  `rf-${gridKey}-add`;

const blank = (v: string | undefined) => !(v ?? "").trim();

/** Grid rows with at least one entered cell. */
export const enteredRefRows = (
  rows: FFGridRow[],
  grid: RefGrid,
) =>
  rows.filter((r) =>
    grid.columns.some((c) => !blank(r[c.key])),
  );

/**
 * Completed calendar years at `today` (local), or null for an incomplete,
 * invalid or future birthdate. Calculated on display, never stored.
 */
export function calcAge(
  dob: string,
  today: Date = new Date(),
): number | null {
  const p = parseCalendarDate(dob ?? "");
  if (!p) return null;
  const [y, m, d] = p;
  const ty = today.getFullYear();
  const tm = today.getMonth() + 1;
  const td = today.getDate();
  if (y > ty || (y === ty && (m > tm || (m === tm && d > td))))
    return null;
  let age = ty - y;
  if (tm < m || (tm === m && td < d)) age -= 1;
  return age;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Digits with common separators: "(312) 555-0100", "312.555.0100". */
const PHONE_RE = /^\+?[\d\s().-]*\d[\d\s().-]*$/;
const DIGITS_RE = /^\d+$/;

function formatError(
  field: RefField,
  raw: string,
  today: Date,
): string | null {
  const v = raw.trim();
  if (!v) return null;
  switch (field.type) {
    case "date": {
      if (!parseCalendarDate(v))
        return "Enter a valid date (MM/DD/YYYY).";
      if (
        field.key === "candidateDob" &&
        calcAge(v, today) === null
      )
        return "Birthdate cannot be in the future.";
      return null;
    }
    case "email":
      return EMAIL_RE.test(v)
        ? null
        : "Enter a valid email address.";
    case "phone":
      return PHONE_RE.test(v)
        ? null
        : "Enter a phone number using digits.";
    case "extension":
      return DIGITS_RE.test(v)
        ? null
        : "Enter the extension using digits only.";
    case "yesno":
      return v === "Yes" || v === "No"
        ? null
        : "Select Yes or No.";
    default:
      return null;
  }
}

export interface RefInput {
  program: FFSubProgramme | "";
  values: Record<string, string>;
  grids: Record<string, FFGridRow[]>;
}

export interface RefError {
  id: string;
  message: string;
  label: string;
  /** null for the global fields above the tabs. */
  tab: RefTab | null;
}

/**
 * Submission validation: the global program and Staff Recommendation, then
 * every visible mandatory field of the selected program (both tabs), the
 * authorization grid and — for authorized users only — Staff Observations.
 * Hidden branches (other programs, Yes/No follow-ups answered No) are
 * skipped. Errors are returned in display order.
 */
export function validateReferral(
  input: RefInput,
  canStaff: boolean,
  today: Date = new Date(),
): RefError[] {
  const errors: RefError[] = [];
  const { values, grids, program } = input;
  if (!program)
    errors.push({
      id: refFieldId(GLOBAL_FIELDS.program),
      label: "Recommended Program Type",
      message: "Select a recommended program type.",
      tab: null,
    });
  if (blank(values.staffRecommendation))
    errors.push({
      id: refFieldId(GLOBAL_FIELDS.staffRecommendation),
      label: "Staff Recommendation",
      message: "Enter the staff recommendation.",
      tab: null,
    });
  if (!program) return errors;

  const ctx: RefCtx = { program, values, canStaff };
  for (const tab of ["general", "questions"] as const)
    for (const g of visibleRefGroups(ctx, tab))
      for (const item of visibleRefItems(g, ctx)) {
        if (item.kind === "grid") {
          const rows = enteredRefRows(
            grids[item.key] ?? [],
            item,
          );
          if (!rows.length)
            errors.push({
              id: refGridAddId(item.key),
              label: item.label,
              message:
                "Add at least one complete authorization.",
              tab,
            });
          for (const r of rows)
            for (const c of item.columns)
              if (blank(r[c.key]))
                errors.push({
                  id: refCellId(item.key, r.id, c.key),
                  label: `${item.label}: ${c.label}`,
                  message: `Enter ${c.label}.`,
                  tab,
                });
          continue;
        }
        const v = values[item.key] ?? "";
        if (isRefRequired(item, ctx) && blank(v)) {
          errors.push({
            id: refFieldId(item.key),
            label: fieldLabel(item.key),
            message:
              item.type === "yesno" || item.type === "role"
                ? "Select an option."
                : "This field is required.",
            tab,
          });
          continue;
        }
        const fmt = formatError(item, v, today);
        if (fmt)
          errors.push({
            id: refFieldId(item.key),
            label: fieldLabel(item.key),
            message: fmt,
            tab,
          });
      }
  return errors;
}

// ─── Record mapping ──────────────────────────────────────────────────────────

/** Answers that also live on the legacy top-level referral keys. */
const LEGACY_KEYS = [
  "callerName",
  "referrerRole",
  "candidateName",
  "candidateDob",
  "candidateGender",
  "familySituation",
  "whyMentor",
  "specialEducation",
  "staffRecommendation",
] as const;

const LEGACY_TRANSIT: Record<string, string> = {
  yes: "Yes",
  no: "No",
  unknown: "Unknown",
};

/**
 * Form values for a saved (or legacy/seeded) referral. Saved answers win;
 * legacy top-level keys fill gaps. Legacy yes/no/unknown public-transit
 * values map to readable text. Nothing else is inferred.
 */
export function referralValues(
  r: FFReferralRecord,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of LEGACY_KEYS) {
    const v = r[k];
    if (typeof v === "string" && v) out[k] = v;
  }
  if (r.referralDate) out.referralDate = r.referralDate;
  if (r.publicTransit && LEGACY_TRANSIT[r.publicTransit])
    out.ya_publicTransport = LEGACY_TRANSIT[r.publicTransit];
  for (const [k, v] of Object.entries(r.answers ?? {}))
    if (typeof v === "string") out[k] = v;
  return out;
}

/** Mirrors answers onto the legacy top-level keys existing readers use. */
export function legacyFields(values: Record<string, string>) {
  const out: Partial<
    Record<(typeof LEGACY_KEYS)[number], string>
  > = {};
  for (const k of LEGACY_KEYS) out[k] = values[k] ?? "";
  return out as Record<(typeof LEGACY_KEYS)[number], string>;
}

/** Human label for resume lists; never blank or "undefined". */
export function referralDisplayName(r: FFReferralRecord) {
  const name = (r.candidateName ?? "").trim();
  const prog = r.recommendedProgram || "No program selected";
  return name ? `${name} · ${prog}` : `${r.id} · ${prog}`;
}