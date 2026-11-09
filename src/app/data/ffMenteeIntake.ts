// Mentee Application Record Details — intake questionnaire definitions
// (User Story 20040). Single source of truth for question wording, field
// type, mandatory status and Sub-Program mapping (CB / WB / SB). Rendering,
// validation, the document checklist and the completion summaries all read
// these definitions, so a mapping change is made in one place.
//
// Mapping rules from the ticket:
//   "Only CB"            → Community-Based only
//   "Only SB & WB"/"SB & WB" → School-Based and Work-Based only
//   no restriction       → all three Sub-Programs
// Hidden (non-applicable) questions keep their saved/draft answers; they are
// only skipped by rendering and validation.

import type {
  FFDocumentStatus,
  FFGridRow,
  FFGuardianIntake,
  FFMentee,
  FFSubProgramme,
  FFYouthIntake,
} from "./mockFriendsFirstData";

export type FFProg = "CB" | "WB" | "SB";

export const PROG_OF: Record<FFSubProgramme, FFProg> = {
  "Community-Based": "CB",
  "Work-Based": "WB",
  "School-Based": "SB",
};

const CB: FFProg[] = ["CB"];
const SB_WB: FFProg[] = ["SB", "WB"];

/** True when an item mapped to `programs` applies to `programme`. */
export function appliesTo(
  programs: readonly FFProg[] | undefined,
  programme: FFSubProgramme | "",
): boolean {
  if (!programs) return true;
  if (!programme) return true;
  return programs.includes(PROG_OF[programme]);
}

// ─── Item definitions ────────────────────────────────────────────────────────

export type Answers = Record<string, string>;
export type Grids = Record<string, FFGridRow[]>;

export interface QField {
  kind: "field";
  key: string;
  label: string;
  type: "short" | "large" | "picklist";
  programs?: FFProg[];
  /** Mandatory always (true) or only when the predicate holds. */
  required?: boolean | ((a: Answers, prog: FFProg) => boolean);
  options?: readonly string[];
  /** Short helper shown under the label. */
  hint?: string;
  /** Screen-reader context for repeated labels ("Why or why not?"). */
  context?: string;
}

export interface QPrompt {
  kind: "prompt";
  label: string;
  programs?: FFProg[];
  fields: QField[];
}

export interface QGridColumn {
  key: string;
  label: string;
  required?: boolean;
}

export interface QGrid {
  kind: "grid";
  key: string;
  label: string;
  programs?: FFProg[];
  columns: QGridColumn[];
  /** Mandatory grid: at least one complete row. */
  minRows?: number;
  addLabel: string;
}

/** Structured blocks rendered by the record page itself. */
export interface QSpecial {
  kind: "guardianContact" | "availabilityGrid";
}

export type QItem = QField | QPrompt | QGrid | QSpecial;

export interface QGroup {
  id: string;
  title: string;
  programs?: FFProg[];
  items: QItem[];
}

const f = (
  key: string,
  label: string,
  opts: Partial<Omit<QField, "kind" | "key" | "label">> = {},
): QField => ({
  kind: "field",
  key,
  label,
  type: "short",
  required: true,
  ...opts,
});

/** "Yes", "y", "yes – …" count as an affirmative answer. */
export const isAffirmative = (v: string | undefined) =>
  /^\s*(yes|y)\b/i.test(v ?? "");

// "If yes, when and where?" follows the moving question (CB) or the
// school-transfer question (SB/WB). It is required only after an
// affirmative answer to whichever of those applies.
const moveFollowUpRequired = (a: Answers, prog: FFProg) =>
  prog === "CB"
    ? isAffirmative(a.g_planMove)
    : isAffirmative(a.g_transferSchools);

// ─── Neighborhood Activity ──────────────────────────────────────────────────
// The ticket makes this CB picklist mandatory but does not list its choices,
// and no approved option set exists in the project. Add the approved values
// here; until then the field shows as "options pending" and is not enforced.
export const FF_NEIGHBORHOOD_ACTIVITY_OPTIONS: readonly string[] =
  [];

// ─── Guardian questionnaire ─────────────────────────────────────────────────

export const GUARDIAN_GROUPS: QGroup[] = [
  {
    id: "g-basic",
    title: "Basic Information",
    items: [
      { kind: "guardianContact" },
      f(
        "g_transferSchools",
        "Do you have plans to transfer schools?",
        { programs: SB_WB },
      ),
      f(
        "g_planMove",
        "Do you have plans to move in the near future?",
        { programs: CB },
      ),
      f("g_moveWhenWhere", "If yes, when and where?", {
        required: moveFollowUpRequired,
        hint: "Required when the answer above is yes.",
      }),
      {
        kind: "grid",
        key: "youthContacts",
        label: "Youth Contact Information",
        columns: [
          { key: "name", label: "Name", required: true },
          { key: "address", label: "Address", required: true },
        ],
        minRows: 1,
        addLabel: "Add Youth Contact",
      },
      f("g_livesWith", "Youth currently lives at/with"),
      {
        kind: "prompt",
        label: "Please Describe",
        fields: [
          f(
            "g_notAllowedWith",
            "Is there anyone that your child is not allowed to spend time with?",
          ),
        ],
      },
    ],
  },
  {
    id: "g-why",
    title: "Why Mentoring",
    items: [
      {
        kind: "prompt",
        label:
          "How are you hoping mentoring will be helpful for your child?",
        fields: [
          f("g_areaOfSupport", "Area of Support"),
          f("g_whyNotes", "Notes", {
            context: "Why Mentoring",
          }),
        ],
      },
    ],
  },
  {
    id: "g-availability",
    title: "Availability / Schedule",
    items: [
      f(
        "g_timeSpent",
        "How does your child spend his/her time? Is he/she involved in any extracurricular activities (i.e. clubs, choirs, teams, church, scouts groups)? Does he/she plan on getting involved this upcoming year?",
        { type: "large" },
      ),
      f(
        "g_weekends",
        "What does your family/youth currently do on weekends?",
        { programs: CB },
      ),
      f(
        "g_weekendFamily",
        "Does the youth regularly spend time with other family or friends during weekends?",
        { programs: CB },
      ),
      { kind: "availabilityGrid" },
    ],
  },
  {
    id: "g-education",
    title: "Education History",
    items: [
      f("g_schoolName", "School Name", { programs: CB }),
      f("g_schoolType", "School Type", { programs: CB }),
      f(
        "g_schoolDuration",
        "How long has he/she been at this school?",
      ),
      f("g_grade", "Youth's Current Grade"),
      f("g_likeSchool", "Does he/she like school?"),
      f("g_likeSchoolWhy", "Why or why not?", {
        context: "Does he/she like school?",
      }),
      {
        kind: "prompt",
        label: "Has he/she ever repeated a grade?",
        fields: [
          f("g_gradeRepeated", "Grade Repeated"),
          f("g_gradeRepeatedNotes", "Notes", {
            context: "Grade repeated",
          }),
        ],
      },
      {
        kind: "prompt",
        label:
          "Has he/she ever received any special school services?",
        fields: [
          f("g_schoolService", "School Service"),
          f("g_schoolServiceNotes", "Notes", {
            context: "Special school services",
          }),
        ],
      },
      {
        kind: "prompt",
        label: "Is he/she having any challenges at school?",
        fields: [
          f("g_challenges", "Challenges at School"),
          f("g_challengesNotes", "Notes", {
            context: "Challenges at school",
          }),
        ],
      },
    ],
  },
  {
    id: "g-structure",
    title: "Structure / Boundaries",
    items: [
      f(
        "g_homeResp",
        "Does he/she have regular responsibilities at home?",
      ),
      f(
        "g_homeRespWell",
        "How well does he/she do in keeping up with those responsibilities?",
      ),
      f(
        "g_rulesHome",
        "How does the youth respond to rules or limits at home?",
      ),
      f(
        "g_rulesSchool",
        "How does the youth respond to rules or limits at school?",
      ),
      f(
        "g_noHome",
        'How does the youth respond to being told "No" at home?',
      ),
      f(
        "g_noSchool",
        'How does the youth respond to being told "No" at school?',
      ),
    ],
  },
  {
    id: "g-community",
    title: "Community Support / Involvement",
    programs: CB,
    items: [
      f(
        "g_resources",
        "What are some of the resources in your community?",
      ),
      f(
        "g_neighborhoodConcerns",
        "Are there any concerns to be aware of in the neighborhood?",
      ),
      f(
        "g_activitiesInsideOutside",
        "Is your hope that the mentoring match participate in activities inside/outside of your community or both?",
      ),
      f("g_communityComments", "Comments", {
        context: "Community Support / Involvement",
      }),
      {
        kind: "prompt",
        label:
          "Has your child had any involvement with the legal system?",
        fields: [
          f("g_legal", "Legal System Involvement"),
          f("g_legalNotes", "Notes", {
            context: "Legal system involvement",
          }),
        ],
      },
    ],
  },
  {
    id: "g-employment",
    title: "Employment History / Insurance",
    items: [
      f("g_employed", "Are you currently employed?"),
      f("g_workType", "What type of work do you do?"),
      f(
        "g_workWeekends",
        "Do you generally work on weekends?",
        {
          programs: CB,
        },
      ),
      f(
        "g_childCareWork",
        "Who does your child stay with while you are at work?",
        { programs: CB },
      ),
      f("g_inSchool", "Are you currently in school?", {
        programs: CB,
      }),
      f(
        "g_childCareSchool",
        "Who does your child stay with while you are in school?",
        { programs: CB },
      ),
      f(
        "g_scheduleConsider",
        "Would your work or school schedule need to be taken into consideration when scheduling outings with the mentor?",
        { programs: CB },
      ),
      {
        kind: "prompt",
        label: "Please explain",
        fields: [
          f(
            "g_pickup",
            "Is there anyone else permitted to pick your child up from school? If so, who?",
            { programs: SB_WB },
          ),
          f(
            "g_insurance",
            "Is your child covered by medical insurance?",
          ),
        ],
      },
    ],
  },
  {
    id: "g-medical",
    title: "Medical / Psychological History",
    items: [
      f(
        "g_medicalConditions",
        "Does your child have any medical conditions?",
      ),
      f(
        "g_allergies",
        "Does he/she have any allergies, food or otherwise?",
      ),
      {
        kind: "grid",
        key: "guardianMedications",
        label: "Medications",
        columns: [
          { key: "name", label: "Medication Name" },
          { key: "dosage", label: "Dosage" },
          { key: "reason", label: "Reason" },
        ],
        addLabel: "Add Medication",
      },
      f(
        "g_mentalHealthDx",
        "Does he/she have any mental health diagnoses?",
      ),
      f(
        "g_everCounselor",
        "Has your child ever seen a counselor/social worker?",
        { programs: SB_WB },
      ),
      f(
        "g_currentCounselor",
        "Is your child currently seeing a counselor/social worker?",
      ),
      f(
        "g_counselingFocus",
        "What is/was the focus of counseling?",
      ),
      f("g_likeCounseling", "Does he/she like it?"),
      f(
        "g_counselingBeneficial",
        "Do you think that it is beneficial?",
      ),
      f(
        "g_abuse",
        "Has your child ever been the victim of physical abuse, sexual abuse, or neglect?",
        { programs: CB },
      ),
      f(
        "g_legalAction",
        "Was legal action taken in response?",
        {
          programs: CB,
        },
      ),
      // No "Only CB" suffix on this question in the ticket → all programs.
      f(
        "g_trauma",
        "Has your child ever experienced a traumatic event?",
      ),
      f(
        "g_mhHospitalized",
        "Has your child been treated in a mental health facility or hospitalized for mental health reasons?",
        { programs: CB },
      ),
      {
        kind: "grid",
        key: "guardianHospitalizations",
        label: "Hospitalization",
        programs: CB,
        columns: [
          { key: "hospitalName", label: "Hospital Name" },
          { key: "dates", label: "Hospitalization Dates" },
          { key: "reason", label: "Reason for Stay" },
          { key: "plan", label: "Plan Upon Discharge" },
        ],
        addLabel: "Add Hospitalization",
      },
      f(
        "g_selfHarm",
        "Has your child had any history of self-harm behaviors?",
        { programs: CB },
      ),
      f(
        "g_suicidal",
        "Has your child had a history of or ongoing suicidal ideation?",
        { programs: CB },
      ),
      f(
        "g_householdMI",
        "Has any member of the household had an issue with emotional/mental illness? (e.g., depression, bipolar disorder, or schizophrenia)",
        { programs: CB },
      ),
      f(
        "g_householdMISupport",
        "Are they currently receiving support?",
        {
          programs: CB,
          context: "Household emotional/mental illness",
        },
      ),
      f(
        "g_householdSubstance",
        "Has any member of the household had a challenge with substance abuse?",
        { programs: CB },
      ),
      f(
        "g_householdSubstanceSupport",
        "Are they currently receiving support?",
        {
          programs: CB,
          context: "Household substance abuse",
        },
      ),
    ],
  },
  {
    id: "g-matching",
    title: "Matching Questions",
    items: [
      f(
        "g_publicSafety",
        "When your child is out in public with their mentor, is there anything for the mentor to know in order to keep your child and mentor safe?",
        { programs: CB },
      ),
      f(
        "g_matchingOther",
        "Is there anything else we should take into account when matching your child with a mentor?",
        { programs: CB },
      ),
      f(
        "g_programQuestions",
        "Are there any questions that you have about our program? Concerns? Comments?",
      ),
    ],
  },
];

// ─── Youth questionnaire ─────────────────────────────────────────────────────

export const YOUTH_GROUPS: QGroup[] = [
  {
    id: "y-know",
    title: "Get To Know You",
    items: [
      f(
        "y_mentorMeaning",
        "What does a mentor mean to you / What does a mentor do?",
        { programs: CB },
      ),
      f(
        "y_programUnderstanding",
        "What is your understanding of the program / mentor outings?",
        { programs: CB },
      ),
      f(
        "y_benefit",
        "How do you think you might benefit from having a mentor for a year?",
      ),
      f(
        "y_commit",
        "Would you like to have a mentor? Can you commit to a year with a mentor?",
      ),
      f("y_goodAt", "What are you good at?"),
      f("y_outing", "Describe an outing you'd like to do", {
        programs: CB,
      }),
      f(
        "y_freeTime",
        "What do you like to do in your free time?",
      ),
    ],
  },
  {
    id: "y-school",
    title: "School",
    items: [
      f("y_likeSchool", "Do you like going to school?"),
      f("y_likeSchoolWhy", "Why or why not?", {
        context: "Do you like going to school?",
      }),
      f(
        "y_subjects",
        "What is your favorite subject? Least favorite?",
      ),
      f("y_safeSchool", "Do you feel safe at school?"),
      f("y_safeSchoolWhy", "Why or why not?", {
        context: "Do you feel safe at school?",
      }),
      f("y_bullyingAtSchool", "Is there bullying at school?"),
      f("y_bullied", "Are you bullied?"),
      f("y_bullyOthers", "Do you bully others?"),
      f(
        "y_trustedAdult",
        "Tell me about an adult who you can talk with and who you trust.",
      ),
      f("y_teachers", "How do you interact with teachers?"),
      f(
        "y_followDirections",
        "Are you usually able to follow your teacher's directions?",
      ),
      f("y_groupActivities", "Do you like group activities?", {
        programs: SB_WB,
      }),
    ],
  },
  {
    id: "y-community",
    title: "Community",
    items: [
      f(
        "y_diversityConcerns",
        "We have mentors from all different backgrounds, races, religions, and sexual orientations. Do you have any concerns about this?",
      ),
      f(
        "y_favoritePlace",
        "Where is your favorite place in your neighborhood or city?",
        { programs: CB },
      ),
      f(
        "y_safeCommunity",
        "Do you feel safe in your community?",
        {
          programs: CB,
        },
      ),
      f("y_communityComments", "Comments", {
        programs: CB,
        context: "Community",
      }),
      {
        kind: "prompt",
        label:
          "In your community or school do you see any of the following?",
        programs: CB,
        fields: [
          f("y_neighborhoodActivity", "Neighborhood Activity", {
            type: "picklist",
            programs: CB,
            options: FF_NEIGHBORHOOD_ACTIVITY_OPTIONS,
          }),
        ],
      },
      f(
        "y_differentBackground",
        "Do you know anyone who is from a different background than you? What have you learned from/about them?",
      ),
    ],
  },
  {
    id: "y-home",
    title: "Home",
    items: [
      f(
        "y_family",
        "Tell me about your family. What is your favorite thing about your family?",
      ),
      f(
        "y_shareFeelings",
        "Who do you share your thoughts and feelings with?",
      ),
      f("y_chores", "What are your chores?", { programs: CB }),
    ],
  },
  {
    id: "y-socio",
    title: "Socio-Emotional",
    items: [
      f(
        "y_proud",
        "What are some things that you are proud of about yourself?",
      ),
      f(
        "y_goals",
        "What are some of your goals? (Now and in the future) What is a goal you would want to work on with the help of your mentor this year?",
      ),
      f(
        "y_friends",
        "Do you have friends? Are you happy with your friendships?",
      ),
      f(
        "y_goodFriend",
        "What makes a good friend? Do you think you are a good friend?",
      ),
      f("y_goodFriendWhy", "Why or why not?", {
        context: "Do you think you are a good friend?",
      }),
      f(
        "y_happySad",
        "What makes you happy? What makes you sad?",
      ),
      f(
        "y_laughWorry",
        "What makes you laugh? What worries you?",
      ),
      f("y_runAway", "Have you ever run away from home?", {
        programs: CB,
      }),
      f("y_runAwayComments", "Comments", {
        programs: CB,
        context: "Running away from home",
      }),
      f(
        "y_selfHarmThoughts",
        "Have you thought about hurting yourself?",
        { programs: CB },
      ),
      f("y_selfHarmWhenHow", "When and how?", {
        programs: CB,
        context: "Thoughts about hurting yourself",
      }),
      f(
        "y_hopeful",
        "Do you feel hopeful about life? What do you hope for in life? What keeps you positive?",
      ),
      f(
        "y_triggers",
        "What are your triggers (Something that upsets you)? How do you express yourself when upset? How do you regulate yourself?",
      ),
    ],
  },
  {
    id: "y-health",
    title: "Health",
    items: [
      f(
        "y_allergies",
        "Do you have any allergies? If yes, please explain.",
      ),
      f("y_epipen", "Do you use an EpiPen?"),
      {
        kind: "grid",
        key: "youthMedicalConditions",
        label: "Medical Conditions",
        columns: [
          {
            key: "type",
            label: "Medical Condition Type",
            required: true,
          },
          { key: "details", label: "Details", required: true },
        ],
        addLabel: "Add Medical Condition",
      },
      {
        kind: "grid",
        key: "youthMedications",
        label: "Medications",
        columns: [
          {
            key: "name",
            label: "Medication Name",
            required: true,
          },
          {
            key: "time",
            label: "Time of Dispensation",
            required: true,
          },
        ],
        addLabel: "Add Medication",
      },
    ],
  },
  {
    id: "y-matching",
    title: "Youth Matching Questions",
    items: [
      f(
        "y_anythingElse",
        "Is there anything else we should know about you that would help us find a mentor that would be a good fit for you?",
      ),
      f(
        "y_excited",
        "What about having a mentor are you most excited about?",
      ),
      f(
        "y_hopeMentorLike",
        "What do you hope your mentor will be like?",
        { programs: CB },
      ),
      f(
        "y_programQuestions",
        "What do you want to know about our program or what it's like having a mentor?",
      ),
    ],
  },
];

// ─── Document checklist ─────────────────────────────────────────────────────
// WB and SB share the School / Mentor ROI documents (one id each), so no
// duplicate rows appear. Each Sub-Program has nine applicable documents.

export interface FFDocumentDef {
  id: string;
  label: string;
  programs?: FFProg[];
}

export const FF_MENTEE_DOCUMENTS: FFDocumentDef[] = [
  {
    id: "roi",
    label: "Authorization for the Release of Information",
    programs: CB,
  },
  {
    id: "roi-school",
    label:
      "Authorization for the Release of Information - School",
    programs: SB_WB,
  },
  {
    id: "roi-mentor",
    label:
      "Authorization for the Release of Information - Mentor",
    programs: SB_WB,
  },
  { id: "activity-release", label: "Activity Release" },
  {
    id: "client-rights",
    label: "Client Rights Informed Consent",
  },
  {
    id: "emergency-medical",
    label: "Emergency Medical Consent",
  },
  {
    id: "guardian-photo-id",
    label: "Guardian Photo ID",
    programs: CB,
  },
  {
    id: "birth-certificate",
    label: "Mentee Birth Certificate",
    programs: CB,
  },
  { id: "mentee-profile", label: "Mentee Profile" },
  { id: "publicity-release", label: "Publicity Release" },
  {
    id: "legal-guardianship",
    label: "Verification of Legal Guardianship",
  },
  {
    id: "phone-policy",
    label: "Mentee Phone Policy Form",
    programs: SB_WB,
  },
];

export const applicableDocuments = (
  programme: FFSubProgramme,
): FFDocumentDef[] =>
  FF_MENTEE_DOCUMENTS.filter((d) =>
    appliesTo(d.programs, programme),
  );

// ─── Visibility, validation, completion ────────────────────────────────────

const isBlank = (v: string | undefined) => !(v ?? "").trim();

export function visibleItems(
  group: QGroup,
  programme: FFSubProgramme,
): QItem[] {
  return group.items.filter((it) =>
    "programs" in it ? appliesTo(it.programs, programme) : true,
  );
}

export const visibleGroups = (
  groups: QGroup[],
  programme: FFSubProgramme,
) => groups.filter((g) => appliesTo(g.programs, programme));

/** Every applicable field (prompt children flattened). */
export function applicableFields(
  groups: QGroup[],
  programme: FFSubProgramme,
): QField[] {
  const out: QField[] = [];
  for (const g of visibleGroups(groups, programme))
    for (const it of visibleItems(g, programme)) {
      if (it.kind === "field") out.push(it);
      if (it.kind === "prompt")
        out.push(
          ...it.fields.filter((fl) =>
            appliesTo(fl.programs, programme),
          ),
        );
    }
  return out;
}

export function applicableGrids(
  groups: QGroup[],
  programme: FFSubProgramme,
): QGrid[] {
  const out: QGrid[] = [];
  for (const g of visibleGroups(groups, programme))
    for (const it of visibleItems(g, programme))
      if (it.kind === "grid") out.push(it);
  return out;
}

export function isRequired(
  field: QField,
  answers: Answers,
  programme: FFSubProgramme,
): boolean {
  // A picklist with no configured options cannot be answered yet.
  if (field.type === "picklist" && !field.options?.length)
    return false;
  const r = field.required;
  return typeof r === "function"
    ? r(answers, PROG_OF[programme])
    : !!r;
}

const rowHasValue = (row: FFGridRow, grid: QGrid) =>
  grid.columns.some((c) => !isBlank(row[c.key]));

/** Rows the user actually entered something in. */
export const enteredRows = (rows: FFGridRow[], grid: QGrid) =>
  rows.filter((r) => rowHasValue(r, grid));

export const gridCellId = (
  gridKey: string,
  rowId: string,
  col: string,
) => `${gridKey}--${rowId}--${col}`;

/**
 * Errors for the applicable questions only, keyed by the DOM id of the
 * control to focus: the field key, a grid cell id, or the grid key.
 */
export function validateQuestionnaire(
  groups: QGroup[],
  answers: Answers,
  grids: Grids,
  programme: FFSubProgramme,
): Record<string, string> {
  const e: Record<string, string> = {};
  for (const fl of applicableFields(groups, programme))
    if (
      isRequired(fl, answers, programme) &&
      isBlank(answers[fl.key])
    )
      e[fl.key] = "Required";
  for (const g of applicableGrids(groups, programme)) {
    const rows = enteredRows(grids[g.key] ?? [], g);
    for (const row of rows)
      for (const c of g.columns)
        if (c.required && isBlank(row[c.key]))
          e[gridCellId(g.key, row.id, c.key)] = "Required";
    if (
      g.minRows &&
      rows.filter((row) =>
        g.columns.every(
          (c) => !c.required || !isBlank(row[c.key]),
        ),
      ).length < g.minRows
    )
      e[g.key] = `Add at least ${g.minRows} ${g.label} entry`;
  }
  return e;
}

export interface Completion {
  done: number;
  total: number;
  /** Mandatory questions that cannot be answered yet because their
   *  configuration is missing (e.g. Neighborhood Activity choices). */
  pending?: string[];
}

/** Saved-data completion of applicable mandatory answers and grids. */
export function questionnaireCompletion(
  groups: QGroup[],
  answers: Answers,
  grids: Grids,
  programme: FFSubProgramme,
): Completion {
  let done = 0;
  let total = 0;
  const pending: string[] = [];
  for (const fl of applicableFields(groups, programme)) {
    if (
      fl.type === "picklist" &&
      !fl.options?.length &&
      fl.required === true
    )
      pending.push(fl.label);
    if (isRequired(fl, answers, programme)) {
      total++;
      if (!isBlank(answers[fl.key])) done++;
    }
  }
  for (const g of applicableGrids(groups, programme))
    if (g.minRows) {
      total++;
      const ok = !Object.keys(
        validateQuestionnaire(
          [{ id: "x", title: "", items: [g] }],
          {},
          grids,
          programme,
        ),
      ).length;
      if (ok) done++;
    }
  return { done, total, pending };
}

export function documentCompletion(
  docs: Record<string, FFDocumentStatus> | undefined,
  programme: FFSubProgramme,
): Completion {
  const list = applicableDocuments(programme);
  return {
    done: list.filter((d) => docs?.[d.id]?.complete).length,
    total: list.length,
  };
}

// ─── Normalization of seeded / older saved records ─────────────────────────

const EMPTY_ADDRESS = {
  street: "",
  city: "",
  state: "",
  zip: "",
};

export const newRowId = () =>
  `row-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const normRows = (rows: unknown): FFGridRow[] =>
  Array.isArray(rows)
    ? rows
        .filter((r) => r && typeof r === "object")
        .map((r) => ({
          ...(r as FFGridRow),
          id:
            typeof (r as FFGridRow).id === "string"
              ? (r as FFGridRow).id
              : newRowId(),
        }))
    : [];

const normGrids = (g: unknown): Grids => {
  const out: Grids = {};
  if (g && typeof g === "object")
    for (const [k, v] of Object.entries(g))
      out[k] = normRows(v);
  return out;
};

const normAnswers = (a: unknown): Answers => {
  const out: Answers = {};
  if (a && typeof a === "object")
    for (const [k, v] of Object.entries(a))
      if (typeof v === "string") out[k] = v;
  return out;
};

export function normalizeGuardianIntake(
  g: Partial<FFGuardianIntake> | null | undefined,
): FFGuardianIntake {
  return {
    guardianName: g?.guardianName ?? "",
    relationship: g?.relationship ?? "",
    phone: g?.phone ?? "",
    email: g?.email ?? "",
    address: { ...EMPTY_ADDRESS, ...(g?.address ?? {}) },
    whyMentoring: g?.whyMentoring ?? "",
    youthAvailability: Array.isArray(g?.youthAvailability)
      ? g!.youthAvailability
      : [],
    concernsExpectations: g?.concernsExpectations ?? "",
    answers: normAnswers(g?.answers),
    grids: normGrids(g?.grids),
  };
}

export function normalizeYouthIntake(
  y: Partial<FFYouthIntake> | null | undefined,
): FFYouthIntake {
  return {
    educationHistory: y?.educationHistory ?? "",
    interestsHobbies: y?.interestsHobbies ?? "",
    structureBoundaries: y?.structureBoundaries ?? "",
    specialNeeds: y?.specialNeeds ?? "",
    answers: normAnswers(y?.answers),
    grids: normGrids(y?.grids),
  };
}

const TRANSPORT_ALIASES: Record<string, string> = {
  "Self Transportation": "Self-Transportation",
};

/** Safe defaults for every field the expanded record reads. Older values
 *  are kept; nothing is fabricated or marked complete. */
export function normalizeMentee(m: FFMentee): FFMentee {
  return {
    ...m,
    transportation:
      TRANSPORT_ALIASES[m.transportation] ??
      m.transportation ??
      "",
    notes: m.notes ?? "",
    guardianIntake: m.guardianIntake
      ? normalizeGuardianIntake(m.guardianIntake)
      : (m.guardianIntake ?? null),
    youthIntake: m.youthIntake
      ? normalizeYouthIntake(m.youthIntake)
      : (m.youthIntake ?? null),
    inactive: !!m.inactive,
    inactiveChangedAt: m.inactiveChangedAt ?? null,
    intakeConnections: Array.isArray(m.intakeConnections)
      ? m.intakeConnections.filter(
          (c) => c && c.menteeId === m.id,
        )
      : [],
    documents:
      m.documents && typeof m.documents === "object"
        ? m.documents
        : {},
  };
}

/** Local "MM/DD/YYYY h:mm AM/PM" — the app's display convention. */
export function localStamp(d: Date): {
  date: string;
  time: string;
} {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const h24 = d.getHours();
  const h = h24 % 12 || 12;
  const min = String(d.getMinutes()).padStart(2, "0");
  return {
    date: `${mm}/${dd}/${d.getFullYear()}`,
    time: `${h}:${min} ${h24 >= 12 ? "PM" : "AM"}`,
  };
}

/**
 * Strict "MM/DD/YYYY": real calendar date (leap years included) within the
 * shared DateInput's supported years 1900–2100. Returns [y, m, d] or null —
 * impossible dates are rejected, never rolled forward.
 */
export function parseCalendarDate(
  date: string,
): [number, number, number] | null {
  const dm = date.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!dm) return null;
  const [mm, dd, yyyy] = [
    Number(dm[1]),
    Number(dm[2]),
    Number(dm[3]),
  ];
  if (yyyy < 1900 || yyyy > 2100 || mm < 1 || mm > 12 || dd < 1)
    return null;
  const daysInMonth = new Date(yyyy, mm, 0).getDate();
  return dd <= daysInMonth ? [yyyy, mm, dd] : null;
}

/** Strict 12-hour "h:mm AM/PM" (hour 1–12, minute 00–59) → [h24, min]. */
export function parseClockTime(
  time: string,
): [number, number] | null {
  const tm = time
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!tm) return null;
  const h = Number(tm[1]);
  const min = Number(tm[2]);
  if (h < 1 || h > 12 || min > 59) return null;
  const h24 =
    (h % 12) + (tm[3].toUpperCase() === "PM" ? 12 : 0);
  return [h24, min];
}

/** Parses a strict local date and time; null if either is invalid. */
export function parseLocal(
  date: string,
  time = "12:00 AM",
): Date | null {
  const d = parseCalendarDate(date);
  const t = parseClockTime(time);
  if (!d || !t) return null;
  return new Date(d[0], d[1] - 1, d[2], t[0], t[1]);
}