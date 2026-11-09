// Presenters for a submitted Mentor Application (US 20039 Chunks 3–4):
// Application Details (read-only, submitted answers), the Mentor Profile block
// and Availability & Preferences (current availability, staff-editable;
// matching preferences read-only).
//
// Every question maps to one explicit saved field from the VMS Mentor
// Application Wizard (see ffMentorApplication.ts); labels follow the
// wizard's wording. Conditions mirror the wizard: program-specific questions
// show for each selected sub-program (membership, never an exclusive
// branch), and follow-up answers show only when their triggering answer
// asks for them. Only the availability Save writes, and only staff processing.

import { useState } from "react";
import { Pencil } from "@/app/lib/lucide-icons";
import { toast } from "sonner";
import { Field, Section } from "../FriendsFirstMentorRecord";
import {
  ErrMsg,
  FieldLabel,
} from "../FriendsFirstMenteeRecord";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";
import { isoToMdy } from "../../lib/dateFormat";
import { useUnsavedChangesGuard } from "../../lib/useUnsavedChangesGuard";
import {
  FF_SUB_PROGRAM_NAME,
  FF_WEEKDAYS,
  currentAvailability,
  maskSsn,
  submittedAvailability,
  validateFFAvailability,
  type FFAvailabilityErrors,
  type FFAvailabilityOverride,
  type FFMentorApplication,
  type FFMentorApplicationStaff,
  type FFSubProgramId,
  type YesNo,
} from "../../data/ffMentorApplication";
import { saveFFMentorAvailability } from "../../data/ffMentorApplicationStore";
import { SUB_PROGRAMME_BADGE_VARIANT } from "../../data/mockFriendsFirstData";

// ─── Value formatting ───────────────────────────────────────────────────────

/** true → Yes, false → No (a real answer), null/undefined → "" (Not provided). */
export const yesNo = (v: YesNo | undefined) =>
  v === true ? "Yes" : v === false ? "No" : "";

/** Every selected value, in the applicant's order. */
const list = (v: string[] | undefined) => (v ?? []).join(", ");

/** Date-only text as MM/DD/YYYY, without going through Date (no TZ shift). */
const dateOnly = (v: string | undefined) => isoToMdy(v ?? "");

// Option values the wizard saves as codes, with the labels it shows.
const HEAR_ABOUT_LABEL: Record<string, string> = {
  colleague: "Colleague or Coworker",
  "social-media": "Social Media",
  church: "Church or Faith Community",
  event: "Event or Volunteer Fair",
  "web-search": "Web Search",
  other: "Other",
};
export const hearAboutLabel = (v: string) =>
  HEAR_ABOUT_LABEL[v] ?? v;
export const HEAR_ABOUT_CODES = Object.keys(HEAR_ABOUT_LABEL);

const BORDER = "1px solid var(--slds-g-color-border-base-1)";
export const GRID =
  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4";
export const NARRATIVE_GRID =
  "grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4";

export function SubProgramList({
  ids,
}: {
  ids: FFSubProgramId[];
}) {
  return (
    <div className="min-w-0">
      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
        Sub-Programs
      </p>
      {ids.length ? (
        <span className="flex flex-wrap gap-1.5">
          {ids.map((id) => (
            <Badge
              key={id}
              variant={
                SUB_PROGRAMME_BADGE_VARIANT[
                  FF_SUB_PROGRAM_NAME[id]
                ]
              }
            >
              {FF_SUB_PROGRAM_NAME[id]}
            </Badge>
          ))}
        </span>
      ) : (
        <p className="slds-text-6 text-[var(--slds-g-color-text-default)]">
          Not provided
        </p>
      )}
    </div>
  );
}

// ─── Shared availability presenter ─────────────────────────────────────────

const AVAILABILITY_LABEL = {
  availableDays: "Days Available",
  cbWeekendAvailable:
    "Are you available to mentor 1-2 weekend days per month? (Community-Based)",
  cbWeekendDetails:
    "Weekend days and time frames available (Community-Based)",
  sbTuesdayAvailable:
    "Are you available to mentor on Tuesdays from 3:30pm-5pm? (School-Based)",
  wbThursdayAvailable:
    "Are you available to mentor on Thursdays from 3:45pm-5:15pm? (Work-Based)",
} as const;

type YesNoKey =
  | "cbWeekendAvailable"
  | "sbTuesdayAvailable"
  | "wbThursdayAvailable";

/** While editing: the draft, a patcher and field errors. */
interface AvailabilityEdit {
  draft: FFAvailabilityOverride;
  onChange: (patch: Partial<FFAvailabilityOverride>) => void;
  errors: FFAvailabilityErrors;
}

const fieldId = (k: keyof FFAvailabilityOverride) => `av-${k}`;

function YesNoGroup({
  k,
  edit,
}: {
  k: YesNoKey;
  edit: AvailabilityEdit;
}) {
  const id = fieldId(k);
  const value = edit.draft[k];
  const error = edit.errors[k];
  return (
    <fieldset className="min-w-0">
      <legend
        id={`${id}-label`}
        className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1"
      >
        {AVAILABILITY_LABEL[k]}
        <span className="text-red-600">*</span>
      </legend>
      <RadioGroup
        id={id}
        aria-labelledby={`${id}-label`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="flex gap-6"
        value={
          value === true ? "yes" : value === false ? "no" : ""
        }
        onValueChange={(v: string) =>
          edit.onChange({ [k]: v === "yes" })
        }
      >
        {(["yes", "no"] as const).map((v) => (
          <div key={v} className="flex items-center gap-2">
            <RadioGroupItem
              value={v}
              id={`${id}-${v}`}
              aria-invalid={!!error}
            />
            <Label htmlFor={`${id}-${v}`}>
              {v === "yes" ? "Yes" : "No"}
            </Label>
          </div>
        ))}
      </RadioGroup>
      <ErrMsg id={id} msg={error} />
    </fieldset>
  );
}

/**
 * Availability & Service Commitment — one question mapping for both
 * Application Details (submitted answers) and Availability & Preferences
 * (current answers). `availability` says which answers to show; with
 * `edit`, only the staff-editable answers become controls.
 */
export function AvailabilityFields({
  app,
  availability: av,
  first,
  title,
  action,
  edit,
  overviewEdit,
  hearAbout,
}: {
  app: FFMentorApplication;
  /** The "how did you hear" answer in the draft (editor only). */
  hearAbout?: string;
  availability: FFAvailabilityOverride;
  first?: boolean;
  title: string;
  action?: React.ReactNode;
  edit?: AvailabilityEdit;
  /** Application Details editor only: the other service-commitment answers
   *  become controls (rendered by the editor, keyed by overview field). */
  overviewEdit?: (
    key:
      | "occupation"
      | "careerReason"
      | "scheduleChanges"
      | "anticipatedLength"
      | "mentoringTimeframe"
      | "hearAbout"
      | "hearAboutComment",
  ) => React.ReactNode;
}) {
  const o = app.answers.overview;
  const has = (p: FFSubProgramId) =>
    app.subPrograms.includes(p);
  const weekendYes =
    (edit ? edit.draft : av).cbWeekendAvailable === true;
  return (
    <Section title={title} first={first} action={action}>
      <div className={GRID}>
        {overviewEdit ? (
          overviewEdit("occupation")
        ) : (
          <Field label="Occupation" value={o.occupation} />
        )}
        {overviewEdit ? (
          overviewEdit("careerReason")
        ) : (
          <Field
            label="Why did you choose this career?"
            value={o.careerReason}
          />
        )}
        {overviewEdit ? (
          overviewEdit("scheduleChanges")
        ) : (
          <Field
            label="Work/Schedule changes you anticipate"
            value={o.scheduleChanges}
          />
        )}
        {edit ? (
          <fieldset className="min-w-0 sm:col-span-2 lg:col-span-3">
            <legend
              id="av-availableDays-label"
              className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1"
            >
              {AVAILABILITY_LABEL.availableDays}
              <span className="text-red-600">*</span>
            </legend>
            <div
              role="group"
              aria-labelledby="av-availableDays-label"
              aria-describedby={
                edit.errors.availableDays
                  ? "av-availableDays-error"
                  : undefined
              }
              className="flex flex-wrap gap-x-6 gap-y-2"
            >
              {FF_WEEKDAYS.map((day, i) => (
                <div
                  key={day}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    id={
                      i === 0
                        ? fieldId("availableDays")
                        : `av-day-${day}`
                    }
                    checked={edit.draft.availableDays.includes(
                      day,
                    )}
                    aria-invalid={!!edit.errors.availableDays}
                    onCheckedChange={(c) =>
                      edit.onChange({
                        // Kept in weekday order.
                        availableDays: FF_WEEKDAYS.filter(
                          (d) =>
                            d === day
                              ? c === true
                              : edit.draft.availableDays.includes(
                                  d,
                                ),
                        ),
                      })
                    }
                  />
                  <Label
                    htmlFor={
                      i === 0
                        ? fieldId("availableDays")
                        : `av-day-${day}`
                    }
                  >
                    {day}
                  </Label>
                </div>
              ))}
            </div>
            <ErrMsg
              id="av-availableDays"
              msg={edit.errors.availableDays}
            />
          </fieldset>
        ) : (
          <Field
            label={AVAILABILITY_LABEL.availableDays}
            value={list(av.availableDays)}
          />
        )}
        {has("community") &&
          (edit ? (
            <YesNoGroup k="cbWeekendAvailable" edit={edit} />
          ) : (
            <Field
              label={AVAILABILITY_LABEL.cbWeekendAvailable}
              value={yesNo(av.cbWeekendAvailable)}
            />
          ))}
        {has("community") &&
          weekendYes &&
          (edit ? (
            <div className="min-w-0">
              <FieldLabel
                htmlFor={fieldId("cbWeekendDetails")}
                required
              >
                {AVAILABILITY_LABEL.cbWeekendDetails}
              </FieldLabel>
              <Textarea
                id={fieldId("cbWeekendDetails")}
                size="md"
                rows={3}
                value={edit.draft.cbWeekendDetails}
                aria-invalid={!!edit.errors.cbWeekendDetails}
                aria-describedby={
                  edit.errors.cbWeekendDetails
                    ? "av-cbWeekendDetails-error"
                    : undefined
                }
                onChange={(e) =>
                  edit.onChange({
                    cbWeekendDetails: e.target.value,
                  })
                }
              />
              <ErrMsg
                id={fieldId("cbWeekendDetails")}
                msg={edit.errors.cbWeekendDetails}
              />
            </div>
          ) : (
            <Field
              label={AVAILABILITY_LABEL.cbWeekendDetails}
              value={av.cbWeekendDetails}
            />
          ))}
        {has("school") &&
          (edit ? (
            <YesNoGroup k="sbTuesdayAvailable" edit={edit} />
          ) : (
            <Field
              label={AVAILABILITY_LABEL.sbTuesdayAvailable}
              value={yesNo(av.sbTuesdayAvailable)}
            />
          ))}
        {has("work") &&
          (edit ? (
            <YesNoGroup k="wbThursdayAvailable" edit={edit} />
          ) : (
            <Field
              label={AVAILABILITY_LABEL.wbThursdayAvailable}
              value={yesNo(av.wbThursdayAvailable)}
            />
          ))}
        {overviewEdit ? (
          overviewEdit("anticipatedLength")
        ) : (
          <Field
            label="Anticipated Length of Service"
            value={o.anticipatedLength}
          />
        )}
        {(has("school") || has("work")) &&
          (overviewEdit ? (
            overviewEdit("mentoringTimeframe")
          ) : (
            <Field
              label="Mentoring Session Timeframe (School-Based / Work-Based)"
              value={o.mentoringTimeframe}
            />
          ))}
        {overviewEdit ? (
          overviewEdit("hearAbout")
        ) : (
          <Field
            label="How Did You Hear About Us?"
            value={hearAboutLabel(o.hearAbout)}
          />
        )}
        {(hearAbout ?? o.hearAbout) === "other" &&
          (overviewEdit ? (
            overviewEdit("hearAboutComment")
          ) : (
            <Field
              label="How Did You Hear About Us? — Other"
              value={o.hearAboutComment}
            />
          ))}
      </div>
    </Section>
  );
}

/** Read-only: Youth Experience and Background Disclosure (never editable). */
export function YouthExperienceAndBackground({
  app,
}: {
  app: FFMentorApplication;
}) {
  const d = app.answers.describe;
  return (
    <>
      <Section title="Youth Experience">
        <div className={NARRATIVE_GRID}>
          <Field
            label="Describe a positive experience you have had working with young people."
            value={d.youthPositiveExperience}
          />
          <Field
            label="How do you handle a student who is struggling or disengaged?"
            value={d.youthStrugglingStudent}
          />
        </div>
      </Section>

      <Section title="Background Disclosure">
        <div className={NARRATIVE_GRID}>
          <Field
            label="Have you been convicted of a felony or misdemeanor in the past ten years?"
            value={yesNo(d.convicted)}
          />
          {d.convicted === true && (
            <Field
              label="Explanation / Comments"
              value={d.convictedComment}
            />
          )}
        </div>
      </Section>
    </>
  );
}

/** The embedded Mentor Profile (About You) answers, unchanged. */
export function MentorProfileSection({
  app,
  first,
}: {
  app: FFMentorApplication;
  first?: boolean;
}) {
  const y = app.answers.aboutYou;
  return (
    <Section title="Mentor Profile" first={first}>
      <div className={NARRATIVE_GRID}>
        <Field
          label="Why do you want to mentor?"
          value={y.whyMentor}
        />
        <Field
          label="Neighborhood / City / Suburb"
          value={y.neighbourhood}
        />
        <Field label="Hometown" value={y.hometown} />
        <Field
          label="Favorite place or activity in Chicago"
          value={y.chicagoFavorite}
        />
        <Field label="Fun Fact" value={y.funFact} />
        <Field
          label="What did you love as a kid?"
          value={y.lovedAsKid}
        />
        <Field
          label="What do you look forward to doing with a mentee?"
          value={y.lookForward}
        />
        <Field label="Favorite Book" value={y.favoriteBook} />
        <Field label="Favorite Food" value={y.favoriteFood} />
        <Field label="Favorite Music" value={y.favoriteMusic} />
        <Field label="Favorite Movie" value={y.favoriteMovie} />
      </div>
    </Section>
  );
}

// ─── Application Details ────────────────────────────────────────────────────

export function ApplicationDetailsView({
  app,
  staff,
  editAction,
}: {
  app: FFMentorApplication;
  /** With staff processing, the availability shown is the CURRENT one. */
  staff?: FFMentorApplicationStaff;
  editAction?: React.ReactNode;
}) {
  const updatedAvailability = !!staff?.availabilityOverride;
  const { overview: o, describe: d, aboutYou: y } = app.answers;
  const isCB = app.subPrograms.includes("community");
  const languages = d.languages ?? [];
  const hasOther = languages.includes("Other");
  return (
    <>
      <Section
        title="Personal Information"
        first
        action={editAction}
      >
        <div className={GRID}>
          <Field label="Legal First Name" value={o.firstName} />
          <Field
            label="Legal Middle Name"
            value={o.middleName}
          />
          <Field label="Legal Last Name" value={o.lastName} />
          <Field
            label="Date of Birth"
            value={dateOnly(o.dob)}
          />
          <Field label="Email Address" value={o.email} />
          <Field
            label="Preferred Phone Number"
            value={o.phone}
          />
          <Field
            label="Social Security Number"
            value={maskSsn(o.ssn)}
          />
          <Field
            label="Marital Status"
            value={o.maritalStatus}
          />
          <Field label="Sex" value={o.sex} />
          <Field label="Religion" value={o.religion} />
          <Field label="Ethnicity" value={o.ethnicity} />
        </div>
      </Section>

      <Section title="Address Information">
        <div className={GRID}>
          <Field label="Street Address" value={o.address} />
          <Field label="City" value={o.city} />
          <Field label="State" value={o.state} />
          <Field label="ZIP Code" value={o.zip} />
        </div>
      </Section>

      <Section title="Program Information">
        <div className={GRID}>
          <Field label="Program" value="Friends First" />
          <SubProgramList ids={app.subPrograms} />
        </div>
      </Section>

      <AvailabilityFields
        app={app}
        availability={
          staff
            ? currentAvailability(app, staff)
            : submittedAvailability(app)
        }
        // Corrected availability is labelled as current, never as the
        // untouched original submission.
        title={
          updatedAvailability
            ? "Availability & Service Commitment (current)"
            : "Submitted Availability & Service Commitment"
        }
        action={
          updatedAvailability ? (
            <Badge variant="info">Updated by staff</Badge>
          ) : undefined
        }
      />

      <Section title="Describe Yourself">
        <div className={NARRATIVE_GRID}>
          <Field
            label="Personal Strengths"
            value={d.personalStrengths}
          />
          <Field label="Interests" value={d.interests} />
          <Field
            label="Why are you interested in being a volunteer mentor?"
            value={d.whyMentor}
          />
          <Field
            label="Have you ever been employed by or volunteered for a program or department at Mercy Home for Boys & Girls?"
            value={d.priorMercyHome}
          />
          <Field
            label="Have you ever applied for and been refused from participating in a volunteer program that asked you to work with youth?"
            value={d.refusedYouthProgram}
          />
          <Field
            label="Have you had a medical or physical disability which would preclude you from performing the volunteer work which you are seeking?"
            value={d.disability}
          />
          <Field
            label="Have you sought help, counseling or treatment for any type of psychological or emotional issue in the last three years?"
            value={d.psychHelp}
          />
          <Field
            label="Do you have food allergies or dietary restrictions?"
            value={d.dietaryRestrictions}
          />
          <Field
            label="Emergency Contact Information"
            value={d.emergencyContact}
          />
        </div>
      </Section>

      {isCB && (
        <Section title="Community-Based Questions">
          <div className={NARRATIVE_GRID}>
            <Field
              label="What type of child would you prefer to work with if you are accepted in this program?"
              value={d.cbChildType}
            />
            <Field
              label="Do you have a vehicle?"
              value={d.cbVehicle}
            />
            <Field
              label="Do you have vehicle insurance?"
              value={d.cbVehicleInsurance}
            />
          </div>
        </Section>
      )}

      <Section title="Languages">
        <div className="flex flex-col gap-4">
          <div className={GRID}>
            <Field
              label="Languages"
              value={list(
                languages.map((l) =>
                  l === "Other" && d.otherLanguage
                    ? `${d.otherLanguage} (Other)`
                    : l,
                ),
              )}
            />
            {hasOther && (
              <Field
                label="Other Language"
                value={d.otherLanguage}
              />
            )}
          </div>
          {languages.length > 0 && (
            <div className={GRID}>
              {languages.map((l) => {
                // Proficiency is saved under the language's own key ("Other"
                // for a custom language).
                const p = d.languageProficiency?.[l];
                const name =
                  l === "Other" && d.otherLanguage
                    ? d.otherLanguage
                    : l;
                return (
                  <Field
                    key={l}
                    label={`${name} — Read / Write / Speak`}
                    value={
                      p
                        ? `Read: ${yesNo(p.read)} · Write: ${yesNo(p.write)} · Speak: ${yesNo(p.speak)}`
                        : ""
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </Section>

      <YouthExperienceAndBackground app={app} />
    </>
  );
}

// ─── Availability & Preferences ─────────────────────────────────────────────

export function AvailabilityPreferencesView({
  app,
  staff,
}: {
  app: FFMentorApplication;
  staff: FFMentorApplicationStaff;
}) {
  const saved = currentAvailability(app, staff);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(saved);
  const [errors, setErrors] = useState<FFAvailabilityErrors>(
    {},
  );
  const [saveError, setSaveError] = useState("");
  const dirty =
    editing && JSON.stringify(draft) !== JSON.stringify(saved);

  const reset = () => {
    setDraft(currentAvailability(app, staff));
    setErrors({});
    setSaveError("");
  };
  const startEdit = () => {
    reset();
    setEditing(true);
  };
  const cancelEdit = () => {
    reset();
    setEditing(false);
  };
  const save = () => {
    setSaveError("");
    const found = validateFFAvailability(
      app.subPrograms,
      draft,
    );
    setErrors(found);
    const firstKey = Object.keys(found)[0] as
      keyof FFAvailabilityOverride | undefined;
    if (firstKey) {
      // Yes/No groups take focus on their first option.
      (
        document.getElementById(`${fieldId(firstKey)}-yes`) ??
        document.getElementById(fieldId(firstKey))
      )?.focus();
      return;
    }
    const result = saveFFMentorAvailability(
      app.applicationId,
      draft,
    );
    if (!result.ok) {
      // The draft stays as entered; saved availability is unchanged.
      setSaveError(
        "Availability could not be saved. Your changes are still here — please try again.",
      );
      return;
    }
    setEditing(false);
    toast.success("Availability saved", {
      description: "Current availability has been updated.",
    });
  };

  // Confirms before leaving the tab, record or page with unsaved changes.
  const leaveGuard = useUnsavedChangesGuard(dirty, cancelEdit);

  const errorCount = Object.keys(errors).length;
  return (
    <>
      <AvailabilityFields
        app={app}
        availability={saved}
        title="Current Availability"
        first
        edit={
          editing
            ? {
                draft,
                errors,
                onChange: (patch) => {
                  setDraft((d) => ({ ...d, ...patch }));
                  setErrors((e) => {
                    const next = { ...e };
                    for (const k of Object.keys(patch))
                      delete next[
                        k as keyof FFAvailabilityOverride
                      ];
                    if ("cbWeekendAvailable" in patch)
                      delete next.cbWeekendDetails;
                    return next;
                  });
                },
              }
            : undefined
        }
        action={
          <div className="flex items-center gap-2">
            {staff.availabilityOverride && (
              <Badge variant="info">Updated by staff</Badge>
            )}
            {!editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={startEdit}
              >
                <Pencil />
                Edit
              </Button>
            )}
          </div>
        }
      />
      {editing && (
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 flex-wrap"
          style={{ borderTop: BORDER }}
        >
          <p
            role="alert"
            className="text-[13px] mr-auto"
            style={{ color: "#c23934" }}
          >
            {saveError ||
              (errorCount
                ? `Not saved: ${errorCount} field${errorCount > 1 ? "s need" : " needs"} attention.`
                : "")}
          </p>
          <Button variant="outline" onClick={cancelEdit}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </div>
      )}
      {leaveGuard}
    </>
  );
}

// ─── Matching Preferences (Community-Based only) ────────────────────────────

/** The applicant's CB matching preferences, as submitted (read-only). */
export function MatchingPreferencesView({
  app,
}: {
  app: FFMentorApplication;
}) {
  const m = app.answers.matchPrefs;
  return (
    <Section title="Matching Preferences" first>
      <div className={NARRATIVE_GRID}>
        <Field
          label="Preferred Age Group"
          value={m.agePreference}
        />
        <Field
          label="Preferred Mentee Location(s)"
          value={list(m.menteeLocations)}
        />
        <Field
          label="Transportation Method"
          value={m.transportationMethod}
        />
        <Field
          label="Travel Area Preferences"
          value={m.travelAreaDetails}
        />
        <Field
          label="Previously Matched Youth Preference"
          value={yesNo(m.prefersPreviouslyMatched)}
        />
        <Field
          label="Same Race/Ethnicity Preference"
          value={yesNo(m.prefersSameEthnicity)}
        />
        <Field
          label="Desired Shared Interests"
          value={m.inCommon}
        />
        <Field
          label="Topics/Scenarios Applicant Is Uncomfortable Addressing"
          value={m.notComfortable}
        />
        <Field
          label="Additional Matching Notes"
          value={m.anythingElse}
        />
      </div>
    </Section>
  );
}