// Application Details for one Mentor Application, with staff editing
// (US 20039 Chunk 2). View mode is the existing read-only presenter; Edit
// turns the permitted answers into controls and Save/Cancel appear at the
// bottom. Only an explicit allowlist is editable (see
// FF_EDITABLE_*_KEYS); Youth Experience, Background Disclosure, the SSN and
// Mentor Profile (its own section) stay read-only. A save writes only the fields
// that changed, in one write, and is refused if one of them was changed
// elsewhere in the meantime (the draft is kept).

import { useState } from "react";
import { Pencil, X } from "@/app/lib/lucide-icons";
import { toast } from "sonner";
import { Field, Section } from "../FriendsFirstMentorRecord";
import {
  ErrMsg,
  FieldLabel,
} from "../FriendsFirstMenteeRecord";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { DateInput } from "../ui/date-input";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { formatPhone } from "../../lib/phone";
import { useUnsavedChangesGuard } from "../../lib/useUnsavedChangesGuard";
import {
  FF_SUB_PROGRAM_NAME,
  currentAvailability,
  maskSsn,
  type FFApplicationDetailsChange,
  type FFAvailabilityErrors,
  type FFAvailabilityOverride,
  type FFEditableDescribeKey,
  type FFEditableOverviewKey,
  type FFLanguageSkills,
  type FFMentorApplication,
  type FFMentorApplicationStaff,
  type FFSubProgramId,
} from "../../data/ffMentorApplication";
import { saveFFMentorApplicationDetails } from "../../data/ffMentorApplicationStore";
import {
  AvailabilityFields,
  ApplicationDetailsView,
  GRID,
  HEAR_ABOUT_CODES,
  NARRATIVE_GRID,
  YouthExperienceAndBackground,
  hearAboutLabel,
} from "./FFMentorApplicationAnswers";

const BORDER = "1px solid var(--slds-g-color-border-base-1)";

type OverviewDraft = Record<FFEditableOverviewKey, string>;
type DescribeText = Exclude<
  FFEditableDescribeKey,
  "languages" | "languageProficiency"
>;
interface Draft {
  overview: OverviewDraft;
  describe: Record<DescribeText, string> & {
    languages: string[];
    languageProficiency: Record<string, FFLanguageSkills>;
  };
  subPrograms: FFSubProgramId[];
  availability: FFAvailabilityOverride;
}

const OVERVIEW_KEYS: FFEditableOverviewKey[] = [
  "firstName",
  "middleName",
  "lastName",
  "dob",
  "email",
  "phone",
  "maritalStatus",
  "sex",
  "religion",
  "ethnicity",
  "address",
  "city",
  "state",
  "zip",
  "occupation",
  "careerReason",
  "scheduleChanges",
  "anticipatedLength",
  "mentoringTimeframe",
  "hearAbout",
  "hearAboutComment",
];
const DESCRIBE_TEXT_KEYS: DescribeText[] = [
  "personalStrengths",
  "interests",
  "whyMentor",
  "priorMercyHome",
  "refusedYouthProgram",
  "disability",
  "recentConviction",
  "psychHelp",
  "dietaryRestrictions",
  "emergencyContact",
  "cbChildType",
  "cbVehicle",
  "cbVehicleInsurance",
  "otherLanguage",
];

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];
const SUB_PROGRAM_IDS: FFSubProgramId[] = [
  "community",
  "work",
  "school",
];

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

function draftFrom(
  app: FFMentorApplication,
  staff: FFMentorApplicationStaff,
): Draft {
  const o = app.answers.overview;
  const d = app.answers.describe;
  const overview = {} as OverviewDraft;
  for (const k of OVERVIEW_KEYS) overview[k] = o[k] ?? "";
  const describe = {} as Draft["describe"];
  for (const k of DESCRIBE_TEXT_KEYS) describe[k] = d[k] ?? "";
  describe.languages = [...(d.languages ?? [])];
  describe.languageProficiency = clone(
    d.languageProficiency ?? {},
  );
  return {
    overview,
    describe,
    subPrograms: [...app.subPrograms],
    availability: clone(currentAvailability(app, staff)),
  };
}

const differs = (a: unknown, b: unknown) =>
  JSON.stringify(a) !== JSON.stringify(b);

/** Only what changed, plus what each changed field started from. */
function diff(draft: Draft, base: Draft) {
  const change: FFApplicationDetailsChange = {};
  const from: FFApplicationDetailsChange = {};
  const ov: Record<string, string> = {};
  const ovFrom: Record<string, string> = {};
  for (const k of OVERVIEW_KEYS)
    if (differs(draft.overview[k], base.overview[k])) {
      ov[k] = draft.overview[k];
      ovFrom[k] = base.overview[k];
    }
  const ds: Record<string, unknown> = {};
  const dsFrom: Record<string, unknown> = {};
  for (const k of [
    ...DESCRIBE_TEXT_KEYS,
    "languages",
    "languageProficiency",
  ] as const)
    if (differs(draft.describe[k], base.describe[k])) {
      ds[k] = draft.describe[k];
      dsFrom[k] = base.describe[k];
    }
  if (Object.keys(ov).length) {
    change.overview = ov;
    from.overview = ovFrom;
  }
  if (Object.keys(ds).length) {
    change.describe = ds;
    from.describe = dsFrom;
  }
  if (differs(draft.subPrograms, base.subPrograms)) {
    change.subPrograms = draft.subPrograms;
    from.subPrograms = base.subPrograms;
  }
  if (differs(draft.availability, base.availability)) {
    change.availability = draft.availability;
    from.availability = base.availability;
  }
  return { change, from };
}

const hasChange = (c: FFApplicationDetailsChange) =>
  Object.keys(c).length > 0;

const SAVE_ERROR: Record<string, string> = {
  storage:
    "Application Details could not be saved. Your changes are still here — please try again.",
  missing:
    "This application no longer exists. Nothing was saved.",
  actor:
    "Your user could not be identified, so nothing was saved.",
  protected:
    "These fields can't be edited here. Nothing was saved.",
  empty: "There are no changes to save.",
};

export function ApplicationDetailsPanel({
  app,
  staff,
}: {
  app: FFMentorApplication;
  staff: FFMentorApplicationStaff;
}) {
  const [editing, setEditing] = useState(false);
  const [base, setBase] = useState<Draft>(() =>
    draftFrom(app, staff),
  );
  const [draft, setDraft] = useState<Draft>(base);
  const [errors, setErrors] = useState<Record<string, string>>(
    {},
  );
  const [saveError, setSaveError] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const { change } = diff(draft, base);
  const dirty = editing && hasChange(change);

  const startEdit = () => {
    const d = draftFrom(app, staff);
    setBase(d);
    setDraft(clone(d));
    setErrors({});
    setSaveError("");
    setEditing(true);
  };
  const cancelEdit = () => {
    setDraft(clone(base));
    setErrors({});
    setSaveError("");
    setEditing(false);
  };

  const patchOverview = (
    k: FFEditableOverviewKey,
    v: string,
  ) => {
    setDraft((d) => ({
      ...d,
      overview: { ...d.overview, [k]: v },
    }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };
  const patchDescribe = (k: DescribeText, v: string) => {
    setDraft((d) => ({
      ...d,
      describe: { ...d.describe, [k]: v },
    }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const FOCUS_ORDER = [
    ...OVERVIEW_KEYS,
    "subPrograms",
    "availableDays",
    "cbWeekendAvailable",
    "cbWeekendDetails",
    "sbTuesdayAvailable",
    "wbThursdayAvailable",
    ...DESCRIBE_TEXT_KEYS,
  ];
  const focusFirst = (found: Record<string, string>) => {
    const key = FOCUS_ORDER.find((k) => found[k]);
    if (!key) return;
    const ids = [`ad-${key}`, `av-${key}-yes`, `av-${key}`];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) {
        el.focus();
        return;
      }
    }
  };

  const save = () => {
    setSaveError("");
    const { change: ch, from } = diff(draft, base);
    if (!hasChange(ch)) {
      // Nothing changed: nothing to write.
      setEditing(false);
      return;
    }
    const result = saveFFMentorApplicationDetails(
      app.applicationId,
      ch,
      from,
    );
    if (!result.ok) {
      if (result.reason === "invalid") {
        const found = result.fieldErrors ?? {};
        setErrors(found);
        setSaveError(
          `Not saved: ${Object.keys(found).length} field${Object.keys(found).length > 1 ? "s need" : " needs"} attention.`,
        );
        focusFirst(found);
      } else if (result.reason === "conflict") {
        setSaveError(
          `Not saved: ${(result.conflicts ?? []).join(", ")} changed elsewhere while you were editing. Your draft is kept — Cancel to see the saved values.`,
        );
      } else {
        setSaveError(
          SAVE_ERROR[result.reason] ?? SAVE_ERROR.storage,
        );
      }
      return;
    }
    setEditing(false);
    toast.success("Application Details saved", {
      description: "Your changes have been saved.",
    });
  };

  const leaveGuard = useUnsavedChangesGuard(dirty, cancelEdit);

  if (!editing)
    return (
      <>
        <ApplicationDetailsView
          app={app}
          staff={staff}
          editAction={
            <Button
              variant="outline"
              size="sm"
              onClick={startEdit}
            >
              <Pencil />
              Edit
            </Button>
          }
        />
        {leaveGuard}
      </>
    );

  // The questions that apply follow the DRAFT's sub-programs.
  const draftApp: FFMentorApplication = {
    ...app,
    subPrograms: draft.subPrograms,
  };
  const isCB = draft.subPrograms.includes("community");
  const o = draft.overview;
  const d = draft.describe;

  const text = (
    k: FFEditableOverviewKey,
    label: string,
    opts: { required?: boolean; type?: "text" | "email" } = {},
  ) => (
    <div className="min-w-0">
      <FieldLabel htmlFor={`ad-${k}`} required={opts.required}>
        {label}
      </FieldLabel>
      <Input
        id={`ad-${k}`}
        size="md"
        surface="base"
        type={opts.type ?? "text"}
        value={o[k]}
        aria-invalid={!!errors[k]}
        aria-describedby={
          errors[k] ? `ad-${k}-error` : undefined
        }
        onChange={(e) => patchOverview(k, e.target.value)}
      />
      <ErrMsg id={`ad-${k}`} msg={errors[k]} />
    </div>
  );
  const area = (
    k: FFEditableOverviewKey | DescribeText,
    label: string,
    value: string,
    set: (v: string) => void,
  ) => (
    <div className="min-w-0">
      <FieldLabel htmlFor={`ad-${k}`}>{label}</FieldLabel>
      <Textarea
        id={`ad-${k}`}
        size="md"
        rows={3}
        value={value}
        aria-invalid={!!errors[k]}
        aria-describedby={
          errors[k] ? `ad-${k}-error` : undefined
        }
        onChange={(e) => set(e.target.value)}
      />
      <ErrMsg id={`ad-${k}`} msg={errors[k]} />
    </div>
  );
  const dArea = (k: DescribeText, label: string) =>
    area(k, label, d[k], (v) => patchDescribe(k, v));

  // Existing values outside an option list stay selectable.
  const withCurrent = (list: string[], current: string) =>
    current && !list.includes(current)
      ? [current, ...list]
      : list;

  const availErrors = errors as FFAvailabilityErrors;
  const toggleSub = (id: FFSubProgramId, on: boolean) => {
    setDraft((dr) => ({
      ...dr,
      subPrograms: SUB_PROGRAM_IDS.filter((p) =>
        p === id ? on : dr.subPrograms.includes(p),
      ),
    }));
    setErrors((e) => ({ ...e, subPrograms: "" }));
  };
  const setSkill = (
    lang: string,
    key: keyof FFLanguageSkills,
    on: boolean,
  ) =>
    setDraft((dr) => ({
      ...dr,
      describe: {
        ...dr.describe,
        languageProficiency: {
          ...dr.describe.languageProficiency,
          [lang]: {
            read: false,
            write: false,
            speak: false,
            ...dr.describe.languageProficiency[lang],
            [key]: on,
          },
        },
      },
    }));
  const addLanguage = () => {
    const name = newLanguage.trim();
    if (!name || d.languages.includes(name)) return;
    setDraft((dr) => ({
      ...dr,
      describe: {
        ...dr.describe,
        languages: [...dr.describe.languages, name],
      },
    }));
    setNewLanguage("");
  };
  const removeLanguage = (lang: string) =>
    setDraft((dr) => ({
      ...dr,
      describe: {
        ...dr.describe,
        languages: dr.describe.languages.filter(
          (l) => l !== lang,
        ),
      },
    }));
  const hasOther = d.languages.includes("Other");
  const errorCount =
    Object.values(errors).filter(Boolean).length;

  return (
    <>
      <Section title="Personal Information" first>
        <div className={GRID}>
          {text("firstName", "Legal First Name", {
            required: true,
          })}
          {text("middleName", "Legal Middle Name")}
          {text("lastName", "Legal Last Name", {
            required: true,
          })}
          <div className="min-w-0">
            <FieldLabel htmlFor="ad-dob" required>
              Date of Birth
            </FieldLabel>
            <DateInput
              id="ad-dob"
              value={o.dob}
              onChange={(v) => patchOverview("dob", v)}
              aria-invalid={!!errors.dob}
              aria-describedby={
                errors.dob ? "ad-dob-error" : undefined
              }
            />
            <ErrMsg id="ad-dob" msg={errors.dob} />
          </div>
          {text("email", "Email Address", {
            required: true,
            type: "email",
          })}
          <div className="min-w-0">
            <FieldLabel htmlFor="ad-phone" required>
              Preferred Phone Number
            </FieldLabel>
            <Input
              id="ad-phone"
              size="md"
              surface="base"
              inputMode="tel"
              value={o.phone}
              aria-invalid={!!errors.phone}
              aria-describedby={
                errors.phone ? "ad-phone-error" : undefined
              }
              onChange={(e) =>
                patchOverview(
                  "phone",
                  formatPhone(e.target.value),
                )
              }
            />
            <ErrMsg id="ad-phone" msg={errors.phone} />
          </div>
          <Field
            label="Social Security Number"
            value={maskSsn(app.answers.overview.ssn)}
          />
          {text("maritalStatus", "Marital Status")}
          {text("sex", "Sex")}
          {text("religion", "Religion")}
          {text("ethnicity", "Ethnicity")}
        </div>
      </Section>

      <Section title="Address Information">
        <div className={GRID}>
          {text("address", "Street Address")}
          {text("city", "City")}
          <div className="min-w-0">
            <FieldLabel htmlFor="ad-state">State</FieldLabel>
            <Select
              value={o.state}
              onValueChange={(v) => patchOverview("state", v)}
            >
              <SelectTrigger id="ad-state" surface="base">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {withCurrent(US_STATES, o.state).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {text("zip", "ZIP Code")}
        </div>
      </Section>

      <Section title="Program Information">
        <div className={GRID}>
          <Field label="Program" value="Friends First" />
          <fieldset className="min-w-0">
            <legend className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
              Sub-Programs
              <span className="text-red-600">*</span>
            </legend>
            <div
              className="flex flex-wrap gap-x-6 gap-y-2"
              aria-describedby={
                errors.subPrograms
                  ? "ad-subPrograms-error"
                  : undefined
              }
            >
              {SUB_PROGRAM_IDS.map((id, i) => (
                <div
                  key={id}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    id={
                      i === 0
                        ? "ad-subPrograms"
                        : `ad-sub-${id}`
                    }
                    checked={draft.subPrograms.includes(id)}
                    aria-invalid={!!errors.subPrograms}
                    onCheckedChange={(c) =>
                      toggleSub(id, c === true)
                    }
                  />
                  <Label
                    htmlFor={
                      i === 0
                        ? "ad-subPrograms"
                        : `ad-sub-${id}`
                    }
                  >
                    {FF_SUB_PROGRAM_NAME[id]}
                  </Label>
                </div>
              ))}
            </div>
            <ErrMsg
              id="ad-subPrograms"
              msg={errors.subPrograms}
            />
          </fieldset>
        </div>
      </Section>

      <AvailabilityFields
        app={draftApp}
        availability={draft.availability}
        hearAbout={draft.overview.hearAbout}
        title="Availability & Service Commitment"
        edit={{
          draft: draft.availability,
          errors: availErrors,
          onChange: (patch) => {
            setDraft((dr) => ({
              ...dr,
              availability: { ...dr.availability, ...patch },
            }));
            setErrors((e) => {
              const next = { ...e };
              for (const k of Object.keys(patch))
                delete next[k];
              if ("cbWeekendAvailable" in patch)
                delete next.cbWeekendDetails;
              return next;
            });
          },
        }}
        overviewEdit={(k) => {
          if (k === "hearAbout")
            return (
              <div className="min-w-0">
                <FieldLabel htmlFor="ad-hearAbout">
                  How Did You Hear About Us?
                </FieldLabel>
                <Select
                  value={o.hearAbout}
                  onValueChange={(v) =>
                    patchOverview("hearAbout", v)
                  }
                >
                  <SelectTrigger
                    id="ad-hearAbout"
                    surface="base"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {withCurrent(
                      HEAR_ABOUT_CODES,
                      o.hearAbout,
                    ).map((c) => (
                      <SelectItem key={c} value={c}>
                        {hearAboutLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          if (k === "hearAboutComment")
            return text(
              "hearAboutComment",
              "How Did You Hear About Us? — Other",
              { required: true },
            );
          const labels = {
            occupation: "Occupation",
            careerReason: "Why did you choose this career?",
            scheduleChanges:
              "Work/Schedule changes you anticipate",
            anticipatedLength: "Anticipated Length of Service",
            mentoringTimeframe:
              "Mentoring Session Timeframe (School-Based / Work-Based)",
          } as const;
          return text(k, labels[k]);
        }}
      />

      <Section title="Describe Yourself">
        <div className={NARRATIVE_GRID}>
          {dArea("personalStrengths", "Personal Strengths")}
          {dArea("interests", "Interests")}
          {dArea(
            "whyMentor",
            "Why are you interested in being a volunteer mentor?",
          )}
          {dArea(
            "priorMercyHome",
            "Have you ever been employed by or volunteered for a program or department at Mercy Home for Boys & Girls?",
          )}
          {dArea(
            "refusedYouthProgram",
            "Have you ever applied for and been refused from participating in a volunteer program that asked you to work with youth?",
          )}
          {dArea(
            "disability",
            "Have you had a medical or physical disability which would preclude you from performing the volunteer work which you are seeking?",
          )}
          {dArea(
            "psychHelp",
            "Have you sought help, counseling or treatment for any type of psychological or emotional issue in the last three years?",
          )}
          {dArea(
            "dietaryRestrictions",
            "Do you have food allergies or dietary restrictions?",
          )}
          {dArea(
            "emergencyContact",
            "Emergency Contact Information",
          )}
        </div>
      </Section>

      {isCB && (
        <Section title="Community-Based Questions">
          <div className={NARRATIVE_GRID}>
            {dArea(
              "cbChildType",
              "What type of child would you prefer to work with if you are accepted in this program?",
            )}
            {dArea("cbVehicle", "Do you have a vehicle?")}
            {dArea(
              "cbVehicleInsurance",
              "Do you have vehicle insurance?",
            )}
          </div>
        </Section>
      )}

      <Section title="Languages">
        <div className="flex flex-col gap-4">
          <div
            className="flex flex-wrap gap-2"
            aria-label="Selected languages"
          >
            {d.languages.map((l) => (
              <Badge key={l} variant="neutral">
                {l === "Other" && d.otherLanguage
                  ? `${d.otherLanguage} (Other)`
                  : l}
                <button
                  type="button"
                  className="flex items-center"
                  aria-label={`Remove ${l}`}
                  onClick={() => removeLanguage(l)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className={GRID}>
            <div className="min-w-0">
              <FieldLabel htmlFor="ad-newLanguage">
                Add Language
              </FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="ad-newLanguage"
                  size="md"
                  surface="base"
                  value={newLanguage}
                  onChange={(e) =>
                    setNewLanguage(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addLanguage();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addLanguage}
                >
                  Add
                </Button>
              </div>
            </div>
            <div className="flex items-end gap-2 pb-2">
              <Checkbox
                id="ad-languageOther"
                checked={hasOther}
                onCheckedChange={(c) =>
                  setDraft((dr) => ({
                    ...dr,
                    describe: {
                      ...dr.describe,
                      languages:
                        c === true
                          ? [...dr.describe.languages, "Other"]
                          : dr.describe.languages.filter(
                              (l) => l !== "Other",
                            ),
                    },
                  }))
                }
              />
              <Label htmlFor="ad-languageOther">
                Other language
              </Label>
            </div>
            {hasOther && (
              <div className="min-w-0">
                <FieldLabel htmlFor="ad-otherLanguage" required>
                  Other Language
                </FieldLabel>
                <Input
                  id="ad-otherLanguage"
                  size="md"
                  surface="base"
                  value={d.otherLanguage}
                  aria-invalid={!!errors.otherLanguage}
                  aria-describedby={
                    errors.otherLanguage
                      ? "ad-otherLanguage-error"
                      : undefined
                  }
                  onChange={(e) =>
                    patchDescribe(
                      "otherLanguage",
                      e.target.value,
                    )
                  }
                />
                <ErrMsg
                  id="ad-otherLanguage"
                  msg={errors.otherLanguage}
                />
              </div>
            )}
          </div>
          {d.languages.length > 0 && (
            <div className={GRID}>
              {d.languages.map((l) => {
                const p = d.languageProficiency[l];
                const name =
                  l === "Other" && d.otherLanguage
                    ? d.otherLanguage
                    : l;
                return (
                  <fieldset key={l} className="min-w-0">
                    <legend className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                      {`${name} — Read / Write / Speak`}
                    </legend>
                    <div className="flex gap-4">
                      {(
                        ["read", "write", "speak"] as const
                      ).map((k) => (
                        <div
                          key={k}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={`ad-skill-${l}-${k}`}
                            checked={p?.[k] === true}
                            onCheckedChange={(c) =>
                              setSkill(l, k, c === true)
                            }
                          />
                          <Label htmlFor={`ad-skill-${l}-${k}`}>
                            {k[0].toUpperCase() + k.slice(1)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                );
              })}
            </div>
          )}
        </div>
      </Section>

      {/* Protected: read-only here, and refused by the write API. */}
      <YouthExperienceAndBackground app={app} />

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
      {leaveGuard}
    </>
  );
}