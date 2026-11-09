// Seeded (pre-wizard) Friends First mentors — FF-CB-101 … — presented as
// shared Mentor Application records, so every Applications row opens the one
// record view. Pure and read-only: nothing here is written to storage, ids
// are the seeded ids, and a saved edit (staff processing keyed by the same
// id) always wins over these defaults.
//
// Only what the seeded mentor actually holds is carried over. What it does
// not hold stays empty (the record's own empty states) — no references,
// uploads, signatures, history or coordinator are invented.
//
// Deliberately NOT part of listFFMentorApplications(): these mentors were
// never submitted through the wizard, so they are not offered to the Mentor
// Search directory rules or the Mentor Match picker, which keep their
// existing eligibility checks unchanged.

import {
  MOCK_FF_MENTORS,
  type FFApplicantStatus,
  type FFMentor,
  type FFMentorStage,
  type FFSubProgramme,
} from "./mockFriendsFirstData";
import {
  defaultFFMentorApplicationStaff,
  type FFApplicantFacingStatus,
  type FFMentorApplication,
  type FFMentorApplicationStaff,
  type FFMentorPipelineStage,
  type FFSubProgramId,
  type YesNo,
} from "./ffMentorApplication";

const SUB_PROGRAM: Record<FFSubProgramme, FFSubProgramId> = {
  "Community-Based": "community",
  "Work-Based": "work",
  "School-Based": "school",
};

/** Same wording on both sides; nothing is re-labelled. */
const STATUS: Record<
  FFApplicantStatus,
  FFApplicantFacingStatus
> = {
  approved: "approved",
  waitlisted: "waitlisted",
  "under-review": "under-review",
  inactive: "inactive",
  // No seeded mentor holds "pending"; the closest label-for-label value.
  pending: "in-progress",
};

/**
 * Seeded stages that exist in the mentor pipeline keep their value. The
 * rest (Application Received, References Pending, Background Check,
 * Psychological Screening, Training, On Hold, Closed) have no pipeline
 * equivalent and are never guessed — the record shows "Not set".
 */
const PIPELINE_STAGE: Partial<
  Record<FFMentorStage, FFMentorPipelineStage>
> = {
  Matched: "Matched",
  Active: "Active",
};

const yesNo = (s: string): YesNo =>
  /^no\b/i.test(s) ? false : /^yes\b/i.test(s) ? true : null;

export function legacyMentorToApplication(
  m: FFMentor,
): FFMentorApplication {
  const d = m.applicationDetails;
  const mp = m.matchingPreferences;
  const p = m.profile;
  const [first = "", ...rest] = m.name.split(" ");
  return {
    applicationId: m.id,
    // Stable identity of the mentor: the id the match records already use.
    applicantId: m.id,
    program: "friends-first",
    subPrograms: [SUB_PROGRAM[m.subProgramme]],
    applicantStatus: STATUS[m.status],
    startedAt: "",
    // The seeded start date is the mentor's start, not a submission date.
    submittedAt: "",
    answers: {
      overview: {
        firstName: d.legalFirstName || first,
        middleName: d.legalMiddleName ?? "",
        lastName: d.legalLastName || rest.join(" "),
        dob: d.dateOfBirth,
        pronouns: "",
        address: d.streetAddress,
        city: d.city,
        state: d.state,
        zip: d.zip,
        email: m.email,
        phone: d.preferredPhone || m.phone,
        ssn: d.ssn ?? "",
        maritalStatus: "",
        sex: "",
        religion: "",
        ethnicity: "",
        occupation: d.occupation,
        careerReason: "",
        scheduleChanges: "",
        availableDays: [],
        cbWeekendAvailable: null,
        cbWeekendDetails: "",
        sbTuesdayAvailable: null,
        wbThursdayAvailable: null,
        anticipatedLength: d.anticipatedLengthOfService,
        mentoringTimeframe: "",
        hearAbout: d.howDidYouHear,
        hearAboutComment: "",
      },
      describe: {
        personalStrengths: "",
        interests: p.hobbies.filter(Boolean).join(", "),
        priorMercyHome: "",
        refusedYouthProgram: "",
        disability: "",
        recentConviction: "",
        psychHelp: "",
        dietaryRestrictions: "",
        emergencyContact: "",
        cbChildType: "",
        cbVehicle: "",
        cbVehicleInsurance: "",
        cbMentorDescription: "",
        wbMentorDescription: "",
        employer: d.employer,
        jobTitle: "",
        industry: "",
        education: "",
        languages: [...d.languagesFluent],
        otherLanguage: "",
        languageProficiency: {},
        volunteerHistory: d.volunteerHistory,
        whyMentor: d.whyMentor,
        strengthsInterests: "",
        professionalStrengths: "",
        volunteerExperience: "",
        youthPositiveExperience: "",
        youthStrugglingStudent: "",
        convicted: yesNo(d.convictedOfCrime),
        convictedComment: "",
        employmentStatus: "",
        profession: "",
        employmentLength: "",
        employerContact: "",
        ageGroups: [],
        challengingQ: "",
      },
      cbProfile: {},
      wbProfile: {},
      sbProfile: {},
      matching: {
        geographicPref: "",
        sharedInterests: [],
        preferredActivities: [],
        specialConsiderations: [],
        additionalNotes: "",
      },
      aboutYou: {
        personalStrengths: "",
        whyMentor: d.whyMentor,
        liveInChicago: "",
        neighbourhood: "",
        hometown: p.hometown,
        chicagoFavorite: p.favouriteChicagoActivity,
        funFact: p.funFact,
        lovedAsKid: p.lovedAsAKid,
        lookForward: p.looksForwardTo,
        favoriteBook: p.favouriteBook,
        favoriteFood: p.favouriteFood,
        favoriteMusic: p.favouriteMusic,
        favoriteMovie: "",
        hearAbout: d.howDidYouHear,
        hearAboutComment: "",
      },
      matchPrefs: {
        agePreference:
          mp?.agePreferences.preferred.join(", ") ?? "",
        menteeLocations: [],
        transportationMethod:
          mp?.transportationMethods.join(", ") ?? "",
        travelAreaDetails:
          mp?.areasWillingToTravel.join(", ") ?? "",
        prefersPreviouslyMatched: null,
        prefersSameEthnicity: null,
        inCommon: mp?.hopedInCommon.join("; ") ?? "",
        notComfortable: "",
        anythingElse: "",
        commuteDistance: mp?.commuteDistance ?? "",
        travelAreas: mp ? [...mp.areasWillingToTravel] : [],
        ageRanks: {},
        otherRanks: {},
      },
      consent: {
        backgroundSig: null,
        attestationSig: null,
        agreements: {},
        quarterlyUpdates: false,
      },
      docsSigned: {},
    },
    references: [],
    uploads: {},
    certificates: {},
  };
}

/**
 * Staff-side defaults for a seeded mentor. The coordinator is a name, which
 * can't be resolved to a staff id safely, so it stays unassigned (same rule
 * as the saved-data migration); the stage is only set where it maps.
 */
export function legacyMentorStaff(
  m: FFMentor,
): FFMentorApplicationStaff {
  return {
    ...defaultFFMentorApplicationStaff(),
    stage: PIPELINE_STAGE[m.stage] ?? null,
    coordinatorNotes: m.notes,
  };
}

export const LEGACY_MENTOR_APPLICATIONS: FFMentorApplication[] =
  MOCK_FF_MENTORS.map(legacyMentorToApplication);

export const LEGACY_MENTOR_STAFF: Record<
  string,
  FFMentorApplicationStaff
> = Object.fromEntries(
  MOCK_FF_MENTORS.map((m) => [m.id, legacyMentorStaff(m)]),
);

/** Seeded start date per mentor (not part of the submitted answers). */
export const LEGACY_MENTOR_START_DATE: Record<string, string> =
  Object.fromEntries(
    MOCK_FF_MENTORS.map((m) => [m.id, m.startDate]),
  );