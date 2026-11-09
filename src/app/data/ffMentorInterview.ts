// Interview Summary for a Friends First Mentor Application (US 20039
// Chunk 3). One definition source for every interview question: stable
// explicit ids (never the display text or array position), the section, the
// wording, the input type, which sub-programs it applies to, and when it is
// required. The Interview Summary UI and the store's validation both use
// `applicableInterviewQuestions` — there is one applicability rule.
//
// Interview answers are staff-recorded and kept separate from the
// applicant's submitted answers; identical wording under different sections
// is a distinct entry with its own id.

import type { FFSubProgramId } from "./ffMentorApplication";

export type FFInterviewScope =
  | "all" //            every program type
  | "community" //      Community-Based only
  | "schoolWork"; //    School-Based and Work-Based only

export type FFInterviewInput = "text" | "yesNo";

export interface FFInterviewQuestion {
  id: string;
  section: FFInterviewSectionId;
  label: string;
  input: FFInterviewInput;
  scope: FFInterviewScope;
  /** Shown (and required) only when Community Based is selected AND the
   *  children question is answered Yes. */
  requiresChildren?: true;
  /** Mandatory text questions must be answered (non-blank) when applicable.
   *  The children Yes/No question is not marked mandatory in the source. */
  mandatory: boolean;
}

export const FF_INTERVIEW_SECTIONS = [
  { id: "A", title: "A. Introduction of Self" },
  { id: "B", title: "B. Motivation for Mentoring" },
  {
    id: "C",
    title: "C. Previous Mentoring or Volunteer Experience",
  },
  { id: "D", title: "D. Interests & Availability" },
  { id: "E", title: "E. Hopes & Expectations for Mentoring" },
  { id: "F", title: "F. Boundaries & Safety in Mentoring" },
  {
    id: "G",
    title: "G. Matching Preferences or Considerations",
  },
  {
    id: "H",
    title: "H. Relationship Building & Life Experience",
  },
  { id: "I", title: "I. Additional Info & Questions" },
  { id: "J", title: "J. Schedule & Availability" },
] as const;
export type FFInterviewSectionId =
  (typeof FF_INTERVIEW_SECTIONS)[number]["id"];

export const FF_CHILDREN_QUESTION_ID = "A.cb.hasChildren";

const t = (
  id: string,
  section: FFInterviewSectionId,
  scope: FFInterviewScope,
  label: string,
  extra: Partial<FFInterviewQuestion> = {},
): FFInterviewQuestion => ({
  id,
  section,
  scope,
  label,
  input: "text",
  mandatory: true,
  ...extra,
});

export const FF_INTERVIEW_QUESTIONS: readonly FFInterviewQuestion[] =
  [
    // A. Introduction of Self
    t(
      "A.all.aboutYourself",
      "A",
      "all",
      "Tell me a little bit about yourself.",
    ),
    t(
      "A.all.careerLiving",
      "A",
      "all",
      "What do you do for a living? What brought you to this career? Do you enjoy what you do?",
    ),
    t(
      "A.cb.familyUpbringing",
      "A",
      "community",
      "Can you tell me about your family and your upbringing. What stands out to you about your childhood? Are you close with your family now?",
    ),
    {
      id: FF_CHILDREN_QUESTION_ID,
      section: "A",
      scope: "community",
      label: "Do you have any children?",
      input: "yesNo",
      mandatory: false,
    },
    t(
      "A.cb.childrenAges",
      "A",
      "community",
      "How old are they?",
      {
        requiresChildren: true,
      },
    ),
    t(
      "A.cb.childrenRelationship",
      "A",
      "community",
      "What their relationship is like with you?",
      { requiresChildren: true },
    ),
    t(
      "A.cb.childrenOneOnOne",
      "A",
      "community",
      "How your child would feel about their parent spending 1-1 time with another child",
      { requiresChildren: true },
    ),
    t(
      "A.cb.childcarePlan",
      "A",
      "community",
      "What is your plan for childcare while you are with a mentee or if they're older, does your child live with you in your home?",
      { requiresChildren: true },
    ),
    t(
      "A.sw.hobbies",
      "A",
      "schoolWork",
      "What hobbies or interests do you have? What do you do that brings you joy?",
    ),

    // B. Motivation for Mentoring
    t(
      "B.cb.hearAbout",
      "B",
      "community",
      "How did you hear about our program?",
    ),
    t(
      "B.cb.whyNow",
      "B",
      "community",
      "Why are you interested in becoming a mentor at this time?",
    ),
    t(
      "B.cb.goodMentor",
      "B",
      "community",
      "Why do you think you’ll make a good mentor?",
    ),
    t(
      "B.cb.toldAnyone",
      "B",
      "community",
      "Did you tell anyone you were applying to become a mentor? What did they say?",
    ),
    t(
      "B.sw.whyFriendsFirst",
      "B",
      "schoolWork",
      "Why are you interested in becoming a mentor with Friends First?",
    ),
    t(
      "B.sw.mentorExperience",
      "B",
      "schoolWork",
      "Do you have experience serving as a mentor? Any other volunteer experience?",
    ),
    t(
      "B.sw.youthExperience",
      "B",
      "schoolWork",
      "Tell me about a past experience you’ve had with working or volunteering with youth. What did you enjoy the most about that experience?",
    ),

    // C. Previous Mentoring or Volunteer Experience
    t(
      "C.cb.mentorExperience",
      "C",
      "community",
      "Do you have experience serving as a mentor? Any other volunteer experience?",
    ),
    t(
      "C.cb.youthExperience",
      "C",
      "community",
      "Tell me about a past experience you’ve had with working or volunteering with youth. What did you enjoy the most about that experience?",
    ),

    // D. Interests & Availability
    t(
      "D.cb.spareTime",
      "D",
      "community",
      "What do you like to do in your spare time? Do you watch or participate?",
    ),
    t(
      "D.cb.weekends",
      "D",
      "community",
      "How do you spend your weekends? Do you have any standing commitments on weekends (Church, getting together with friends and family, other volunteer commitments, Work, Travel)?",
    ),

    // E. Hopes & Expectations for Mentoring
    t(
      "E.cb.activities",
      "E",
      "community",
      "What activities would you like to do with your mentee?",
    ),
    t(
      "E.cb.initialChallenges",
      "E",
      "community",
      "What do you anticipate might be some of the initial challenges you might have when trying to build a friendship with a young person?",
    ),
    t(
      "E.cb.initialSkills",
      "E",
      "community",
      "What skills will you rely on initially to get to know your mentee and build a relationship with them?",
    ),
    t(
      "E.cb.goodExperience",
      "E",
      "community",
      "Looking back at your time as a mentor, what would make you believe this was a good experience for you and your mentee?",
    ),
    t(
      "E.cb.commitYear",
      "E",
      "community",
      "Are you able to commit to at least a year of mentoring?",
    ),
    t(
      "E.sw.relationship",
      "E",
      "schoolWork",
      "What do you feel the relationship of a mentor should be? How would you define a successful mentoring relationship?",
    ),
    t(
      "E.sw.menteeTeach",
      "E",
      "schoolWork",
      "What do you think your mentee can teach you?",
    ),
    t(
      "E.sw.hopeToLearn",
      "E",
      "schoolWork",
      "What do you hope to learn about or become exposed to through your mentee?",
    ),

    // F. Boundaries & Safety in Mentoring
    t(
      "F.cb.boundaries",
      "F",
      "community",
      "What do you think it means to have appropriate physical and emotional boundaries in a mentoring relationship?",
    ),
    t(
      "F.cb.settingBoundaries",
      "F",
      "community",
      "How comfortable would you feel setting boundaries with your mentee? How would you react if the mentee tested those boundaries? (Boundary examples: only doing free/low cost activities; not texting/calling in the middle of the night; or if mentee wants to do something outside program guidelines, such as see an R-rated movie or asking the mentor to buy them something).",
    ),
    t(
      "F.cb.outingSafety",
      "F",
      "community",
      "What are some things you’ll need to consider to keep your mentee safe when planning for an outing with your mentee?",
    ),
    t(
      "F.cb.guardianCalls",
      "F",
      "community",
      "How would you feel if the parent/guardian of your mentee does not return your phone calls in a timely fashion?",
    ),
    t(
      "F.cb.ffSupport",
      "F",
      "community",
      "What are some of the ways that Friends First can support you while you are doing this?",
    ),
    t(
      "F.cb.liaisonAdvice",
      "F",
      "community",
      "How do you feel about taking advice from a Match Support Liaison",
    ),

    // G. Matching Preferences or Considerations
    t(
      "G.cb.car",
      "G",
      "community",
      "Do you own a car? If so, do you plan to use it for outings with your mentee?",
    ),
    t(
      "G.cb.neighborhoods",
      "G",
      "community",
      "How familiar are you with different neighborhoods in Chicago? Do you have any concerns about picking up your mentee in any particular area of Chicago?",
    ),
    t(
      "G.cb.menteeHistory",
      "G",
      "community",
      "Are you comfortable if your mentee has a history of abuse, family incarceration, a diagnosis?",
    ),
    t(
      "G.cb.trauma",
      "G",
      "community",
      "Do you have any personal experience with trauma or life altering events? Do you think this might come up for you with your mentee?",
    ),
    t(
      "G.cb.physicalLimits",
      "G",
      "community",
      "Do you have any physical limitations that would prohibit you from participating in an activity with a mentee? (examples: not being able to ride roller coasters/participate in athletics).",
    ),

    // H. Relationship Building & Life Experience
    t(
      "H.all.comfortZone",
      "H",
      "all",
      "Tell me about a time when you had to go outside your comfort zone and what you learned from that experience.",
    ),
    t(
      "H.all.someoneDifferent",
      "H",
      "all",
      "Tell me about a time when you interacted with someone different than you. How did you relate to them?",
    ),
    t(
      "H.sw.initialSkills",
      "H",
      "schoolWork",
      "What skills will you rely on initially to get to know your mentee and build a relationship with them?",
    ),
    t(
      "H.sw.disengagedMentee",
      "H",
      "schoolWork",
      "How would you respond if your mentee was constantly talking to his/her classmate during the session or not engaging with you?",
    ),
    t(
      "H.sw.formativeExperiences",
      "H",
      "schoolWork",
      "Tell me about any formative life experiences that you’ve had that have shaped you and your life, either positively or negatively?",
    ),

    // I. Additional Info & Questions
    t(
      "I.all.anythingElse",
      "I",
      "all",
      "Is there anything I haven't asked you that you think would be important or helpful for me to know for the purposes of matching you in the Friends First Program?",
    ),
    t(
      "I.all.questionsForMe",
      "I",
      "all",
      "What questions do you have for me, about the program or about being a mentor?",
    ),

    // J. Schedule & Availability (never for Community-only applications)
    t(
      "J.sw.tueThu",
      "J",
      "schoolWork",
      "Are you generally available to mentor on Tuesdays or Thursdays (Tuesdays for Rowe; Thursdays for Faegre/TU)?",
    ),
    t(
      "J.sw.obstacles",
      "J",
      "schoolWork",
      "Are there any obstacles that may limit your availability (work meetings, travel, etc.)?",
    ),
    t(
      "J.sw.schoolYear",
      "J",
      "schoolWork",
      "Are you able to commit to mentoring for the school year?",
    ),
  ];

export const FF_INTERVIEW_QUESTION_BY_ID: ReadonlyMap<
  string,
  FFInterviewQuestion
> = new Map(FF_INTERVIEW_QUESTIONS.map((q) => [q.id, q]));

/** Saved interview answers: stable question id → answer ("yes" / "no" for
 *  the Yes/No question, text otherwise). A missing key is unanswered. */
export type FFInterviewAnswers = Record<string, string>;

export interface FFInterviewRecord {
  answers: FFInterviewAnswers;
  /** Date/time of the last save, and the staff user who saved it. */
  updatedAt: string;
  updatedBy: string;
  updatedById: string;
}

/**
 * The questions that apply to an application, in definition order. The union
 * rule for several sub-programs: All Program Types once; Community questions
 * when Community is selected; School/Work questions when School OR Work is
 * selected (School + Work never duplicates them). The four children
 * follow-ups also need the saved/draft children answer to be Yes.
 */
export function applicableInterviewQuestions(
  subPrograms: readonly FFSubProgramId[],
  answers: FFInterviewAnswers,
): FFInterviewQuestion[] {
  const community = subPrograms.includes("community");
  const schoolWork =
    subPrograms.includes("school") ||
    subPrograms.includes("work");
  const hasChildren =
    answers[FF_CHILDREN_QUESTION_ID] === "yes";
  return FF_INTERVIEW_QUESTIONS.filter((q) => {
    if (q.scope === "community" && !community) return false;
    if (q.scope === "schoolWork" && !schoolWork) return false;
    if (q.requiresChildren && !hasChildren) return false;
    return true;
  });
}

const blank = (v: unknown) =>
  typeof v !== "string" || !v.trim();

/** Required-answer errors (question id → message) for the applicable
 *  questions. Hidden questions never produce an error. */
export function validateInterviewAnswers(
  subPrograms: readonly FFSubProgramId[],
  answers: FFInterviewAnswers,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const q of applicableInterviewQuestions(
    subPrograms,
    answers,
  ))
    if (
      q.input === "text" &&
      q.mandatory &&
      blank(answers[q.id])
    )
      errors[q.id] = "This question is required.";
  return errors;
}

/** Ids a payload may not contain: unknown, or the wrong value type. */
export function interviewPayloadProblems(
  payload: Record<string, unknown>,
): { unknown: string[]; badValue: string[] } {
  const unknown: string[] = [];
  const badValue: string[] = [];
  for (const [id, v] of Object.entries(payload)) {
    const q = FF_INTERVIEW_QUESTION_BY_ID.get(id);
    if (!q) unknown.push(id);
    else if (
      q.input === "yesNo"
        ? v !== "yes" && v !== "no"
        : typeof v !== "string"
    )
      badValue.push(id);
  }
  return { unknown, badValue };
}