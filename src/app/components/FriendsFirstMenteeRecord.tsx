// Mentee Application Record Detail (User Story 20040). Same structure as the
// Applications Detail records (TutorApplicantRecord / FriendsFirstMentorRecord):
// header with breadcrumb, avatar, badges and a stage Select; chevron pipeline
// Stepper; left SideNav + one bordered content card. Each section is always
// editable with a single Save at the bottom right (same as the Applications
// Detail Overview); Save is enabled once something changes.
// Saved values go through ffMenteeStore, so they persist across refresh and
// show up on Mentee Search / Mentor Match.

import { useEffect, useState } from "react";
import { ChevronRight, User } from "@/app/lib/lucide-icons";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { SideNav, SideNavItem } from "./ui/side-nav";
import { Stepper } from "./ui/stepper";
import { DateInput } from "./ui/date-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  type FFGridRow,
  type FFGuardianIntake,
  type FFYouthIntake,
  type FFMentee,
  type FFMenteeStage,
  type FFReferralRecord,
  type FFSubProgramme,
  FF_AVAILABILITY_DAYS,
  FF_AVAILABILITY_TIMES,
  FF_MENTEE_STAGES,
  FF_MENTEE_STAGE_BADGE_VARIANT,
  FF_TRANSPORTATION_OPTIONS,
  REFERRER_ROLES,
  SUB_PROGRAMMES,
  SUB_PROGRAMME_BADGE_VARIANT,
  ffAvailabilityKey,
} from "../data/mockFriendsFirstData";
import {
  getFFReferral,
  listFFReferrals,
  setFFMenteeStage,
  updateFFMentee,
  useFFMentee,
} from "../data/ffMenteeStore";
import { formatPhone, isCompletePhone } from "../lib/phone";
import {
  GUARDIAN_GROUPS,
  YOUTH_GROUPS,
  type Grids,
  type QGroup,
  documentCompletion,
  enteredRows,
  normalizeGuardianIntake,
  normalizeYouthIntake,
  parseCalendarDate,
  questionnaireCompletion,
  validateQuestionnaire,
} from "../data/ffMenteeIntake";
import {
  GroupSection,
  IntakeQuestionnaire,
  QuestionLabel,
  focusFirstError,
} from "./ff-mentee/IntakeQuestionnaire";
import { IntakeConnections } from "./ff-mentee/IntakeConnections";
import { MenteeInactiveToggle } from "./ff-mentee/MenteeInactiveToggle";
import { MenteeDocumentChecklist } from "./ff-mentee/MenteeDocumentChecklist";

const BORDER = "1px solid var(--slds-g-color-border-base-1)";

const SECTION_TABS = [
  { id: "process", label: "Mentee Process" },
  { id: "guardian", label: "Intake – Guardian" },
  { id: "youth", label: "Intake – Youth" },
] as const;
type SectionId = (typeof SECTION_TABS)[number]["id"];

const REQUIRED = "Required";

// ─── Field helpers (same treatment as the record pages and the
// Mentee Referral form) ─────────────────────────────────────────────────────

export function FieldLabel({
  children,
  required,
  htmlFor,
}: {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block mb-1.5 text-[11px] font-semibold uppercase tracking-wide"
      style={{ color: "var(--slds-g-color-text-weak)" }}
    >
      {children}
      {required && <span className="text-red-600">*</span>}
    </label>
  );
}

export function ErrMsg({
  id,
  msg,
}: {
  id?: string;
  msg?: string;
}) {
  if (!msg) return null;
  return (
    <p
      id={id ? `${id}-error` : undefined}
      style={{
        fontSize: "11px",
        color: "#c23934",
        marginTop: "2px",
      }}
    >
      {msg}
    </p>
  );
}

function Section({
  title,
  action,
  first,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="p-6"
      style={!first ? { borderTop: BORDER } : undefined}
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="slds-section-title text-[var(--slds-g-color-text-default)]">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

const selectTriggerCls = "h-9 w-full slds-text-4";
const inputCls = "h-9 text-[13px]";

function PicklistField({
  id,
  label,
  required,
  value,
  options,
  onChange,
  error,
}: {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          surface="base"
          id={id}
          className={selectTriggerCls}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <SelectValue placeholder="Please Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ErrMsg id={id} msg={error} />
    </div>
  );
}

// ─── Drafts ──────────────────────────────────────────────────────────────────

interface ProcessDraft {
  programme: FFSubProgramme | "";
  transportation: string;
  referralId: string;
  /** "Comments" — backed by the existing `notes` field (new referrals seed
   *  it from the staff recommendation), so nothing is duplicated or lost. */
  notes: string;
}
const processDraft = (m: FFMentee): ProcessDraft => ({
  programme: m.programme,
  transportation: m.transportation,
  referralId: m.referralId ?? "",
  notes: m.notes,
});

const referralLabel = (rf: FFReferralRecord) =>
  `${rf.callerName || rf.candidateName || rf.id} (${rf.referrerRole || "Relationship not recorded"}) — ${rf.referralDate || rf.submittedDate || "No date"}`;

/**
 * Saved guardian intake with safe defaults. For a mentee with no saved
 * guardian intake whose linked referral came from a Parent / Guardian, the
 * referrer's name pre-fills Guardian Name in the draft only — a saved
 * intake is never overwritten by the referral.
 */
const guardianDraft = (
  m: FFMentee,
  referral?: FFReferralRecord,
): FFGuardianIntake => {
  const g = normalizeGuardianIntake(m.guardianIntake);
  if (
    !m.guardianIntake &&
    referral?.referrerRole === "Parent / Guardian" &&
    referral.callerName
  )
    g.guardianName = referral.callerName;
  return g;
};

interface YouthDraft {
  youthName: string;
  dob: string;
  intake: FFYouthIntake;
}
// Youth Name and DOB are the mentee's own name/DOB — one source of truth,
// so the header, Mentee Search and the intake never disagree.
const youthDraft = (m: FFMentee): YouthDraft => ({
  youthName: m.name,
  dob: m.dob,
  intake: normalizeYouthIntake(m.youthIntake),
});

type ErrorMap = Record<string, string>;

const isBlank = (v: string) => !v.trim();
const isEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/** Drops grid rows the user left completely empty. */
function cleanGrids(groups: QGroup[], grids: Grids): Grids {
  const out: Grids = { ...grids };
  for (const g of groups)
    for (const it of g.items)
      if (it.kind === "grid" && out[it.key])
        out[it.key] = enteredRows(out[it.key], it);
  return out;
}

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Success only after a successful save; otherwise an accurate error. */
function savedToast(ok: boolean, title: string) {
  if (ok) toast.success(title);
  else
    toast.error(`${title.replace(/ saved$/, "")} not saved`, {
      description:
        "The change could not be saved (browser storage is unavailable or its saved data can't be read), so nothing was changed. Your entries are still on screen — try again.",
    });
  return ok;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  menteeId: string;
  onBack: () => void;
}

export function FriendsFirstMenteeRecord({
  menteeId,
  onBack,
}: Props) {
  const mentee = useFFMentee(menteeId)!;
  const [activeSection, setActiveSection] =
    useState<SectionId>("process");
  const stageIdx = FF_MENTEE_STAGES.indexOf(mentee.stage);
  // Referral Source lookup options: every saved Mentee Referral record.
  const referrals = listFFReferrals();
  const linkedReferral = getFFReferral(mentee.referralId);

  // Each section keeps its own draft, so switching tabs never clears
  // unsaved edits and saving one section never resets another.
  const [process, setProcess] = useState(() =>
    processDraft(mentee),
  );
  const [processErrors, setProcessErrors] = useState<ErrorMap>(
    {},
  );

  const [guardian, setGuardian] = useState(() =>
    guardianDraft(mentee, linkedReferral),
  );
  const [guardianErrors, setGuardianErrors] =
    useState<ErrorMap>({});

  const [youth, setYouth] = useState(() => youthDraft(mentee));
  const [youthErrors, setYouthErrors] = useState<ErrorMap>({});

  // A saved Sub-Program change hides/shows questions: clear errors that may
  // now belong to hidden fields (their answers are kept).
  useEffect(() => {
    setGuardianErrors({});
    setYouthErrors({});
  }, [mentee.programme]);

  const changeStage = (stage: FFMenteeStage) => {
    const result = setFFMenteeStage(mentee.id, stage);
    if (!result.ok) {
      toast.error("Pipeline stage not saved", {
        description:
          result.reason === "storage"
            ? "The change could not be saved, so the stage and Promotion Date were left as they were."
            : "This mentee record could not be found.",
      });
      return;
    }
    if (!result.changed) return;
    toast.success("Pipeline stage updated", {
      description: `${mentee.name} is now "${stage}".`,
    });
  };

  // ── Mentee Process ──
  const saveProcess = () => {
    const e: ErrorMap = {};
    if (!process.programme) e["mp-subprogram"] = REQUIRED;
    if (!process.transportation)
      e["mp-transportation"] = REQUIRED;
    if (isBlank(process.notes)) e["mp-comments"] = REQUIRED;
    setProcessErrors(e);
    if (Object.keys(e).length) {
      focusFirstError(e);
      return;
    }
    const ok = updateFFMentee(mentee.id, (m) => ({
      ...m,
      programme: process.programme as FFSubProgramme,
      transportation: process.transportation,
      referralId: process.referralId || null,
      notes: process.notes.trim(),
    }));
    savedToast(ok, "Mentee process saved");
  };
  const processDirty =
    JSON.stringify(process) !==
    JSON.stringify(processDraft(mentee));

  // ── Guardian intake ──
  const setG = <K extends keyof FFGuardianIntake>(
    k: K,
    v: FFGuardianIntake[K],
  ) => setGuardian((g) => ({ ...g, [k]: v }));
  const setAddr = (
    k: keyof FFGuardianIntake["address"],
    v: string,
  ) =>
    setGuardian((g) => ({
      ...g,
      address: { ...g.address, [k]: v },
    }));
  const toggleAvailability = (key: string) =>
    setGuardian((g) => ({
      ...g,
      youthAvailability: g.youthAvailability.includes(key)
        ? g.youthAvailability.filter((k) => k !== key)
        : [...g.youthAvailability, key],
    }));

  const saveGuardian = () => {
    const e: ErrorMap = {};
    if (isBlank(guardian.guardianName)) e["gi-name"] = REQUIRED;
    if (isBlank(guardian.phone)) e["gi-phone"] = REQUIRED;
    else if (!isCompletePhone(guardian.phone))
      e["gi-phone"] = "Enter a 10-digit phone number";
    if (isBlank(guardian.email)) e["gi-email"] = REQUIRED;
    else if (!isEmail(guardian.email))
      e["gi-email"] = "Enter a valid email address";
    if (isBlank(guardian.address.street))
      e["gi-street"] = REQUIRED;
    if (isBlank(guardian.address.city)) e["gi-city"] = REQUIRED;
    if (isBlank(guardian.address.state))
      e["gi-state"] = REQUIRED;
    if (isBlank(guardian.address.zip)) e["gi-zip"] = REQUIRED;
    Object.assign(
      e,
      validateQuestionnaire(
        GUARDIAN_GROUPS,
        guardian.answers ?? {},
        guardian.grids ?? {},
        mentee.programme,
      ),
    );
    setGuardianErrors(e);
    if (Object.keys(e).length) {
      focusFirstError(e);
      return;
    }
    const cleaned: FFGuardianIntake = {
      ...guardian,
      grids: cleanGrids(GUARDIAN_GROUPS, guardian.grids ?? {}),
    };
    const ok = updateFFMentee(mentee.id, (m) => ({
      ...m,
      guardianIntake: cleaned,
    }));
    // The draft is replaced by the cleaned copy only once it is saved; after
    // a failed save the user's entries stay exactly as typed for a retry.
    if (savedToast(ok, "Guardian intake saved"))
      setGuardian(cleaned);
  };
  const guardianDirty =
    JSON.stringify(guardian) !==
    JSON.stringify(
      normalizeGuardianIntake(mentee.guardianIntake),
    );

  // ── Youth intake ──
  const setYouthAnswer = (key: string, v: string) =>
    setYouth((y) => ({
      ...y,
      intake: {
        ...y.intake,
        answers: { ...(y.intake.answers ?? {}), [key]: v },
      },
    }));
  const setYouthGrid = (key: string, rows: FFGridRow[]) =>
    setYouth((y) => ({
      ...y,
      intake: {
        ...y.intake,
        grids: { ...(y.intake.grids ?? {}), [key]: rows },
      },
    }));

  const saveYouth = () => {
    const e: ErrorMap = {};
    if (isBlank(youth.youthName)) e["yi-name"] = REQUIRED;
    if (isBlank(youth.dob)) e["yi-dob"] = REQUIRED;
    else if (!parseCalendarDate(youth.dob))
      e["yi-dob"] = "Enter a valid date (MM/DD/YYYY)";
    Object.assign(
      e,
      validateQuestionnaire(
        YOUTH_GROUPS,
        youth.intake.answers ?? {},
        youth.intake.grids ?? {},
        mentee.programme,
      ),
    );
    setYouthErrors(e);
    if (Object.keys(e).length) {
      focusFirstError(e);
      return;
    }
    const intake: FFYouthIntake = {
      ...youth.intake,
      grids: cleanGrids(YOUTH_GROUPS, youth.intake.grids ?? {}),
    };
    const ok = updateFFMentee(mentee.id, (m) => ({
      ...m,
      name: youth.youthName.trim(),
      initials: initialsOf(youth.youthName),
      dob: youth.dob,
      youthIntake: intake,
    }));
    if (savedToast(ok, "Youth intake saved"))
      setYouth((y) => ({ ...y, intake }));
  };
  const youthDirty =
    JSON.stringify(youth) !==
    JSON.stringify(youthDraft(mentee));

  // Completion from the saved record only (drafts don't count).
  const guardianDone = questionnaireCompletion(
    GUARDIAN_GROUPS,
    mentee.guardianIntake?.answers ?? {},
    mentee.guardianIntake?.grids ?? {},
    mentee.programme,
  );
  const youthDone = questionnaireCompletion(
    YOUTH_GROUPS,
    mentee.youthIntake?.answers ?? {},
    mentee.youthIntake?.grids ?? {},
    mentee.programme,
  );
  const docsDone = documentCompletion(
    mentee.documents,
    mentee.programme,
  );

  const legacyGuardian = [
    ["Why mentoring is being sought", guardian.whyMentoring],
    ["Concerns or expectations", guardian.concernsExpectations],
  ].filter(([, v]) => v.trim());
  const legacyYouth = [
    ["Educational history", youth.intake.educationHistory],
    ["Interests and hobbies", youth.intake.interestsHobbies],
    [
      "Structure and boundaries",
      youth.intake.structureBoundaries,
    ],
    [
      "Special needs or accommodations",
      youth.intake.specialNeeds,
    ],
  ].filter(([, v]) => v.trim());

  const err = (map: ErrorMap, id: string) => ({
    "aria-invalid": !!map[id],
    "aria-describedby": map[id] ? `${id}-error` : undefined,
  });

  const renderGuardianSpecial = (kind: string) =>
    kind === "guardianContact" ? (
      <div className="space-y-4">
        <p
          className="text-[13px] font-semibold"
          style={{ color: "var(--slds-g-color-text-default)" }}
        >
          Guardian Contact Information
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel htmlFor="gi-name" required>
              Name
            </FieldLabel>
            <Input
              surface="base"
              id="gi-name"
              className={inputCls}
              value={guardian.guardianName}
              {...err(guardianErrors, "gi-name")}
              onChange={(e) =>
                setG("guardianName", e.target.value)
              }
            />
            <ErrMsg
              id="gi-name"
              msg={guardianErrors["gi-name"]}
            />
          </div>
          <PicklistField
            id="gi-relationship"
            label="Guardian's Relationship to Youth"
            value={guardian.relationship}
            options={REFERRER_ROLES}
            onChange={(v) => setG("relationship", v)}
          />
          <div>
            <FieldLabel htmlFor="gi-phone" required>
              Phone
            </FieldLabel>
            <Input
              surface="base"
              id="gi-phone"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              placeholder="(555) 555-5555"
              className={inputCls}
              value={guardian.phone}
              {...err(guardianErrors, "gi-phone")}
              onChange={(e) =>
                setG("phone", formatPhone(e.target.value))
              }
            />
            <ErrMsg
              id="gi-phone"
              msg={guardianErrors["gi-phone"]}
            />
          </div>
          <div>
            <FieldLabel htmlFor="gi-email" required>
              Email
            </FieldLabel>
            <Input
              surface="base"
              id="gi-email"
              type="email"
              className={inputCls}
              value={guardian.email}
              {...err(guardianErrors, "gi-email")}
              onChange={(e) => setG("email", e.target.value)}
            />
            <ErrMsg
              id="gi-email"
              msg={guardianErrors["gi-email"]}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="gi-street" required>
              Street Address
            </FieldLabel>
            <Input
              surface="base"
              id="gi-street"
              className={inputCls}
              value={guardian.address.street}
              {...err(guardianErrors, "gi-street")}
              onChange={(e) =>
                setAddr("street", e.target.value)
              }
            />
            <ErrMsg
              id="gi-street"
              msg={guardianErrors["gi-street"]}
            />
          </div>
          <div>
            <FieldLabel htmlFor="gi-city" required>
              City
            </FieldLabel>
            <Input
              surface="base"
              id="gi-city"
              className={inputCls}
              value={guardian.address.city}
              {...err(guardianErrors, "gi-city")}
              onChange={(e) => setAddr("city", e.target.value)}
            />
            <ErrMsg
              id="gi-city"
              msg={guardianErrors["gi-city"]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel htmlFor="gi-state" required>
                State
              </FieldLabel>
              <Input
                surface="base"
                id="gi-state"
                className={inputCls}
                maxLength={2}
                value={guardian.address.state}
                {...err(guardianErrors, "gi-state")}
                onChange={(e) =>
                  setAddr("state", e.target.value.toUpperCase())
                }
              />
              <ErrMsg
                id="gi-state"
                msg={guardianErrors["gi-state"]}
              />
            </div>
            <div>
              <FieldLabel htmlFor="gi-zip" required>
                ZIP
              </FieldLabel>
              <Input
                surface="base"
                id="gi-zip"
                inputMode="numeric"
                maxLength={5}
                className={inputCls}
                value={guardian.address.zip}
                {...err(guardianErrors, "gi-zip")}
                onChange={(e) =>
                  setAddr(
                    "zip",
                    e.target.value.replace(/\D/g, ""),
                  )
                }
              />
              <ErrMsg
                id="gi-zip"
                msg={guardianErrors["gi-zip"]}
              />
            </div>
          </div>
        </div>
      </div>
    ) : kind === "availabilityGrid" ? (
      <div>
        <QuestionLabel>
          Typical weekly availability (optional)
        </QuestionLabel>
        <AvailabilityGrid
          selected={guardian.youthAvailability}
          onToggle={toggleAvailability}
        />
      </div>
    ) : null;

  const completionNote = (
    label: string,
    c: { done: number; total: number; pending?: string[] },
    noun = "mandatory items",
  ) => {
    const pending = c.pending ?? [];
    return (
      <p
        className="text-[13px]"
        style={{ color: "var(--slds-g-color-text-weak)" }}
      >
        {label}: {c.done} of {c.total} {noun} complete (saved,{" "}
        {mentee.programme})
        {pending.length
          ? ` — not complete: ${pending.length} mandatory requirement${pending.length > 1 ? "s" : ""} pending configuration (${pending.join(", ")}).`
          : c.done === c.total
            ? " — complete."
            : "."}
      </p>
    );
  };

  const LegacyBlock = ({ rows }: { rows: string[][] }) =>
    rows.length ? (
      <GroupSection title="Earlier Intake Responses">
        <p
          className="mb-3 text-[13px]"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          Recorded on the earlier summary form. Kept for
          reference; they are not copied into the questions
          above.
        </p>
        <dl className="space-y-3">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt
                className="text-[13px] font-medium"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {label}
              </dt>
              <dd
                className="text-[13px] whitespace-pre-wrap"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </GroupSection>
    ) : null;

  // One announcement per failed save (role="alert"); the individual field
  // errors are not live regions, so they don't all announce at once.
  // Called as a function (not a component) so the alert node is stable
  // across re-renders and doesn't re-announce on every keystroke.
  const saveBar = ({
    onSave,
    dirty,
    errors,
  }: {
    onSave: () => void;
    dirty: boolean;
    errors: ErrorMap;
  }) => {
    const n = Object.keys(errors).length;
    return (
      <div
        className="flex items-center justify-end gap-3 px-6 py-4 flex-wrap"
        style={{ borderTop: BORDER }}
      >
        <p
          role="alert"
          className="text-[13px]"
          style={{ color: "#c23934" }}
        >
          {n
            ? `Not saved: ${n} field${n > 1 ? "s need" : " needs"} attention. Focus moved to the first one.`
            : ""}
        </p>
        <Button onClick={onSave} disabled={!dirty}>
          Save
        </Button>
      </div>
    );
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{
        backgroundColor: "var(--slds-g-color-background-alt)",
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 shadow-sm shrink-0"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          borderBottom: BORDER,
        }}
      >
        <div
          className="flex items-center gap-2 text-[11px] mb-3"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          <span
            className="hover:text-[#014486] hover:underline cursor-pointer transition-colors"
            onClick={onBack}
          >
            Mentee Search
          </span>
          <ChevronRight className="h-3 w-3" />
          <span
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            {mentee.name}
          </span>
        </div>

        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Avatar size="lg" className="shadow-sm">
              <AvatarFallback size="lg" color="primary">
                {mentee.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-[20px] font-bold text-[var(--slds-g-color-text-default)]">
                  {mentee.name}
                </h1>
                <Badge
                  variant={
                    SUB_PROGRAMME_BADGE_VARIANT[
                      mentee.programme
                    ]
                  }
                >
                  {mentee.programme}
                </Badge>
                <Badge
                  variant={
                    FF_MENTEE_STAGE_BADGE_VARIANT[mentee.stage]
                  }
                >
                  {mentee.stage}
                </Badge>
                {mentee.inactive && (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
              <div
                className="flex items-center gap-3 text-[13px] flex-wrap"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                <span>Program: Friends First</span>
                <span className="text-[#c9c7c5]">•</span>
                <span>Sub-Program: {mentee.programme}</span>
                <span className="text-[#c9c7c5]">•</span>
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  Coordinator: {mentee.coordinator}
                </span>
              </div>
            </div>
          </div>

          <Select
            value={mentee.stage}
            onValueChange={(v) =>
              changeStage(v as FFMenteeStage)
            }
          >
            <SelectTrigger
              surface="base"
              className="h-9 rounded-full text-[13px] shadow-none w-[220px]"
              style={{ border: BORDER }}
              aria-label="Pipeline stage"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FF_MENTEE_STAGES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[11px] font-bold uppercase tracking-wide"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Mentee Pipeline
            </span>
            <span
              className="text-[11px] font-medium"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Stage{" "}
              <span
                className="font-bold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {stageIdx + 1}
              </span>{" "}
              of {FF_MENTEE_STAGES.length}
            </span>
          </div>
          <Stepper
            variant="chevron"
            steps={FF_MENTEE_STAGES.map((stage, idx) => ({
              label: stage,
              status:
                idx < stageIdx
                  ? "completed"
                  : idx === stageIdx
                    ? "current"
                    : "upcoming",
            }))}
          />
        </div>
      </div>

      {/* Content with left navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex h-full">
          <SideNav className="w-64 shrink-0 overflow-y-auto border-0 border-r">
            <div className="py-2">
              {SECTION_TABS.map((tab) => (
                <SideNavItem
                  key={tab.id}
                  active={activeSection === tab.id}
                  onClick={() => setActiveSection(tab.id)}
                >
                  {tab.label}
                </SideNavItem>
              ))}
            </div>
          </SideNav>

          {/* Extra bottom padding clears the fixed 40px UtilityBar. */}
          <div className="flex-1 min-w-0 overflow-y-auto p-3 pb-16 sm:p-6 sm:pb-16">
            <div
              className="overflow-hidden w-full"
              style={{
                border: BORDER,
                borderRadius:
                  "var(--slds-c-card-radius-border)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
              }}
            >
              {activeSection === "process" && (
                <>
                  <Section title="Mentee Process" first>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PicklistField
                        id="mp-subprogram"
                        label="Sub-Program Assignment"
                        required
                        value={process.programme}
                        options={SUB_PROGRAMMES}
                        onChange={(v) =>
                          setProcess((p) => ({
                            ...p,
                            programme: v as FFSubProgramme,
                          }))
                        }
                        error={processErrors["mp-subprogram"]}
                      />
                      <PicklistField
                        id="mp-transportation"
                        label="Transportation Source"
                        required
                        value={process.transportation}
                        options={FF_TRANSPORTATION_OPTIONS}
                        onChange={(v) =>
                          setProcess((p) => ({
                            ...p,
                            transportation: v,
                          }))
                        }
                        error={
                          processErrors["mp-transportation"]
                        }
                      />
                    </div>
                  </Section>

                  <Section title="Referral Source Information">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <FieldLabel htmlFor="mp-referral">
                          Linked Mentee Referral
                        </FieldLabel>
                        <Select
                          value={process.referralId}
                          onValueChange={(v) =>
                            setProcess((p) => ({
                              ...p,
                              referralId: v,
                            }))
                          }
                        >
                          <SelectTrigger
                            surface="base"
                            id="mp-referral"
                            className={selectTriggerCls}
                          >
                            <SelectValue placeholder="Select referral record" />
                          </SelectTrigger>
                          <SelectContent>
                            {referrals.map((rf) => (
                              <SelectItem
                                key={rf.id}
                                value={rf.id}
                              >
                                {referralLabel(rf)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {(() => {
                        const rf = referrals.find(
                          (r) => r.id === process.referralId,
                        );
                        const rows: [string, string][] = rf
                          ? [
                              [
                                "Referred By",
                                rf.callerName || "—",
                              ],
                              [
                                "Relationship to Youth",
                                rf.referrerRole ||
                                  "Not recorded",
                              ],
                              // Entered Referral Date; older referrals
                              // only know when they were submitted.
                              rf.referralDate
                                ? [
                                    "Referral Date",
                                    rf.referralDate,
                                  ]
                                : [
                                    "Submitted Date",
                                    rf.submittedDate || "—",
                                  ],
                              [
                                "Recommended Program",
                                rf.recommendedProgram || "—",
                              ],
                            ]
                          : [
                              [
                                "Referral Source",
                                mentee.referralSource || "—",
                              ],
                            ];
                        return rows.map(([label, value]) => (
                          <div key={label}>
                            <p
                              className="mb-1 text-[11px] font-semibold uppercase tracking-wide"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              {label}
                            </p>
                            <p
                              className="text-[13px]"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              {value}
                            </p>
                          </div>
                        ));
                      })()}
                    </div>
                  </Section>

                  <Section title="Schedule Intake">
                    <div className="space-y-4">
                      <IntakeConnections
                        mentee={mentee}
                        referral={linkedReferral}
                      />
                      <div>
                        <FieldLabel
                          htmlFor="mp-comments"
                          required
                        >
                          Comments
                        </FieldLabel>
                        <Input
                          surface="base"
                          id="mp-comments"
                          className={inputCls}
                          value={process.notes}
                          {...err(processErrors, "mp-comments")}
                          onChange={(e) =>
                            setProcess((p) => ({
                              ...p,
                              notes: e.target.value,
                            }))
                          }
                        />
                        <ErrMsg
                          id="mp-comments"
                          msg={processErrors["mp-comments"]}
                        />
                      </div>
                    </div>
                  </Section>
                  <Section title="Availability for Matching">
                    <MenteeInactiveToggle mentee={mentee} />
                  </Section>
                  {saveBar({
                    onSave: saveProcess,
                    dirty: processDirty,
                    errors: processErrors,
                  })}
                </>
              )}

              {activeSection === "guardian" && (
                <>
                  <div className="px-6 pt-6">
                    <h2 className="text-[16px] font-semibold text-[var(--slds-g-color-text-default)]">
                      Intake – Guardian
                    </h2>
                    {completionNote(
                      "Saved guardian questionnaire",
                      guardianDone,
                    )}
                  </div>
                  <IntakeQuestionnaire
                    groups={GUARDIAN_GROUPS}
                    programme={mentee.programme}
                    answers={guardian.answers ?? {}}
                    grids={guardian.grids ?? {}}
                    errors={guardianErrors}
                    onAnswer={(k, v) =>
                      setGuardian((g) => ({
                        ...g,
                        answers: {
                          ...(g.answers ?? {}),
                          [k]: v,
                        },
                      }))
                    }
                    onGrid={(k, rows) =>
                      setGuardian((g) => ({
                        ...g,
                        grids: {
                          ...(g.grids ?? {}),
                          [k]: rows,
                        },
                      }))
                    }
                    renderSpecial={renderGuardianSpecial}
                  />
                  <LegacyBlock rows={legacyGuardian} />
                  {saveBar({
                    onSave: saveGuardian,
                    dirty: guardianDirty,
                    errors: guardianErrors,
                  })}
                </>
              )}

              {activeSection === "youth" && (
                <>
                  <Section title="Intake – Youth" first>
                    <div className="mb-4 space-y-1">
                      {completionNote(
                        "Saved youth questionnaire",
                        youthDone,
                      )}
                      {completionNote(
                        "Document checklist",
                        docsDone,
                        "required documents",
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel htmlFor="yi-name" required>
                          Youth Name
                        </FieldLabel>
                        <Input
                          surface="base"
                          id="yi-name"
                          className={inputCls}
                          value={youth.youthName}
                          {...err(youthErrors, "yi-name")}
                          onChange={(e) =>
                            setYouth((y) => ({
                              ...y,
                              youthName: e.target.value,
                            }))
                          }
                        />
                        <ErrMsg
                          id="yi-name"
                          msg={youthErrors["yi-name"]}
                        />
                      </div>
                      <div>
                        <FieldLabel htmlFor="yi-dob" required>
                          Date of Birth
                        </FieldLabel>
                        <DateInput
                          id="yi-dob"
                          required
                          {...err(youthErrors, "yi-dob")}
                          value={youth.dob}
                          onChange={(v) =>
                            setYouth((y) => ({ ...y, dob: v }))
                          }
                        />
                        <ErrMsg
                          id="yi-dob"
                          msg={youthErrors["yi-dob"]}
                        />
                      </div>
                    </div>
                  </Section>
                  <IntakeQuestionnaire
                    groups={YOUTH_GROUPS}
                    programme={mentee.programme}
                    answers={youth.intake.answers ?? {}}
                    grids={youth.intake.grids ?? {}}
                    errors={youthErrors}
                    onAnswer={setYouthAnswer}
                    onGrid={setYouthGrid}
                    continued
                  />
                  <MenteeDocumentChecklist mentee={mentee} />
                  <LegacyBlock rows={legacyYouth} />
                  {saveBar({
                    onSave: saveYouth,
                    dirty: youthDirty,
                    errors: youthErrors,
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Days × time-of-day multi-select, built from the shared Checkbox.
function AvailabilityGrid({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <div
      className="overflow-x-auto rounded-lg"
      style={{ border: BORDER }}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-3">Day</TableHead>
            {FF_AVAILABILITY_TIMES.map((t) => (
              <TableHead key={t} className="px-3 text-center">
                {t}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {FF_AVAILABILITY_DAYS.map((day) => (
            <TableRow key={day} hoverable={false}>
              <TableCell className="px-3">{day}</TableCell>
              {FF_AVAILABILITY_TIMES.map((t) => {
                const key = ffAvailabilityKey(day, t);
                return (
                  <TableCell
                    key={t}
                    className="px-3 text-center"
                  >
                    <Checkbox
                      checked={selected.includes(key)}
                      onCheckedChange={() => onToggle(key)}
                      aria-label={`${day} ${t}`}
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}