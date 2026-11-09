// Mentor Application Record Details (US 20039) for applications in the
// shared Mentor Application store. Same frame as the other Friends First
// records — header with breadcrumb, avatar and badges, chevron pipeline
// Stepper, left SideNav + one bordered content card — with the header kept
// outside the single scrolling content area.
//
// This chunk: header, pipeline (display only), the six tabs and Overview,
// where Assigned Coordinator and Coordinator Notes are staff-editable.

import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ChevronRight,
  History,
  Mail,
  Pencil,
  Phone,
} from "@/app/lib/lucide-icons";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SideNav, SideNavItem } from "../ui/side-nav";
import { Stepper } from "../ui/stepper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Textarea } from "../ui/textarea";
import { Field, Section } from "../FriendsFirstMentorRecord";
import { ApplicationDetailsPanel } from "./FFMentorApplicationDetails";
import { InterviewSummaryPanel } from "./FFMentorInterview";
import {
  AvailabilityPreferencesView,
  MentorProfileSection,
  MatchingPreferencesView,
} from "./FFMentorApplicationAnswers";
import {
  ErrMsg,
  FieldLabel,
} from "../FriendsFirstMenteeRecord";
import { FFMentorStageSelect } from "./FFMentorStageDialog";
import { FFMentorReferences } from "./FFMentorReferences";
import { FFMentorAgreements } from "./FFMentorAgreements";
import { FFMentorChecklist } from "./FFMentorChecklist";
import { FFMentorInactiveToggle } from "./FFMentorInactiveToggle";
import {
  APPROVAL_VARIANT,
  FFMentorDocuments,
} from "./FFMentorDocuments";
import { ffPgcStatus } from "../../data/ffMentorDocuments";
import { evaluateFFMentorReadiness } from "../../data/ffMentorChecklist";
import { useUnsavedChangesGuard } from "../../lib/useUnsavedChangesGuard";
import {
  FF_APPLICANT_STATUS_LABEL,
  FF_MENTOR_PIPELINE_STAGES,
  FF_MENTOR_REJECTED_STAGE,
  FF_SUB_PROGRAM_NAME,
  ffAccountCreatedDate,
  type FFMentorApplication,
  type FFMentorApplicationStaff,
} from "../../data/ffMentorApplication";
import {
  coordinatorName,
  ffMentorIdOf,
  useFFMentorConstituentLink,
  getFFMentorAvailability,
  mhbgCoordinatorOptions,
  saveFFMentorCoordinatorDetails,
} from "../../data/ffMentorApplicationStore";
import { SUB_PROGRAMME_BADGE_VARIANT } from "../../data/mockFriendsFirstData";

const BORDER = "1px solid var(--slds-g-color-border-base-1)";
const EMPTY = "Not provided";

const SECTION_TABS = [
  { id: "overview", label: "Overview" },
  { id: "application-details", label: "Application Details" },
  { id: "mentor-profile", label: "Mentor Profile" },
  // Community-Based applications only.
  {
    id: "matching-preferences",
    label: "Matching Preferences",
    cbOnly: true,
  },
  {
    id: "availability-preferences",
    label: "Availability & Preferences",
  },
  { id: "interview-summary", label: "Interview Summary" },
  { id: "references", label: "References" },
  { id: "consents-documents", label: "Consents & Documents" },
  { id: "checklist", label: "Checklist" },
] as const;
type SectionId = (typeof SECTION_TABS)[number]["id"];

function SubProgramBadges({
  app,
}: {
  app: FFMentorApplication;
}) {
  if (!app.subPrograms.length)
    return <span className="slds-text-6">{EMPTY}</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {app.subPrograms.map((id) => {
        const name = FF_SUB_PROGRAM_NAME[id];
        return (
          <Badge
            key={id}
            variant={SUB_PROGRAMME_BADGE_VARIANT[name]}
          >
            {name}
          </Badge>
        );
      })}
    </span>
  );
}

interface Props {
  application: FFMentorApplication;
  staff: FFMentorApplicationStaff;
  onBack: () => void;
  /** Name of the list the user came from (breadcrumb). */
  backLabel?: string;
}

export function FFMentorApplicationRecord({
  application: app,
  staff,
  onBack,
  backLabel = "Applications",
}: Props) {
  const [activeSection, setActiveSection] =
    useState<SectionId>("overview");

  const o = app.answers.overview;
  const name =
    [o.firstName, o.lastName].filter(Boolean).join(" ") ||
    EMPTY;
  const initials =
    `${o.firstName?.[0] ?? ""}${o.lastName?.[0] ?? ""}`.toUpperCase() ||
    "?";
  const coordinator =
    coordinatorName(staff.coordinatorId) ?? "Not assigned";
  const stageLabel = staff.stage ?? "Not set";
  const stageIdx = staff.stage
    ? (FF_MENTOR_PIPELINE_STAGES as readonly string[]).indexOf(
        staff.stage,
      )
    : -1;
  // Rejected is an alternative outcome, never a completed prerequisite.
  const rejected = staff.stage === FF_MENTOR_REJECTED_STAGE;
  const training = ffPgcStatus(app, staff);
  // Inactive is decided once per mentor (applicant), across applications.
  const availability = getFFMentorAvailability(
    ffMentorIdOf(app),
  );
  const constituentId = useFFMentorConstituentLink(
    ffMentorIdOf(app),
  );
  const navigate = useNavigate();
  // A saved Ready for Match stage is kept even if eligibility is lost.
  const lostEligibility = evaluateFFMentorReadiness(
    app,
    staff,
  ).lostEligibility;

  // ─── Overview edit (Assigned Coordinator + Coordinator Notes) ───────────
  const savedDraft = () => ({
    coordinatorId:
      staff.coordinatorId === null
        ? ""
        : String(staff.coordinatorId),
    coordinatorNotes: staff.coordinatorNotes,
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(savedDraft);
  const [coordinatorError, setCoordinatorError] = useState("");
  const [saveError, setSaveError] = useState("");
  const coordinatorOptions = mhbgCoordinatorOptions();
  // A saved coordinator who is no longer active still shows as selected.
  const savedOption =
    staff.coordinatorId !== null &&
    !coordinatorOptions.some(
      (c) => c.id === staff.coordinatorId,
    )
      ? [{ id: staff.coordinatorId, label: coordinator }]
      : [];
  const saved = savedDraft();
  const dirty =
    editing &&
    (draft.coordinatorId !== saved.coordinatorId ||
      draft.coordinatorNotes !== saved.coordinatorNotes);

  const startEdit = () => {
    setDraft(savedDraft());
    setCoordinatorError("");
    setSaveError("");
    setEditing(true);
  };
  const cancelEdit = () => {
    setDraft(savedDraft());
    setCoordinatorError("");
    setSaveError("");
    setEditing(false);
  };
  const save = () => {
    setSaveError("");
    if (!draft.coordinatorId) {
      setCoordinatorError("Assigned Coordinator is required.");
      document.getElementById("ov-coordinator")?.focus();
      return;
    }
    setCoordinatorError("");
    const result = saveFFMentorCoordinatorDetails(
      app.applicationId,
      {
        coordinatorId: Number(draft.coordinatorId),
        coordinatorNotes: draft.coordinatorNotes,
      },
    );
    if (!result.ok) {
      // The draft stays as typed so nothing is lost.
      setSaveError(
        result.reason === "invalid"
          ? "The selected coordinator is no longer available. Choose another."
          : "Changes could not be saved. Your edits are still here — please try again.",
      );
      return;
    }
    setEditing(false);
    toast.success("Overview saved", {
      description:
        "Assigned Coordinator and Coordinator Notes updated.",
    });
  };

  // Confirms before leaving the record or switching tabs with unsaved edits.
  const leaveGuard = useUnsavedChangesGuard(dirty, cancelEdit);

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{
        backgroundColor: "var(--slds-g-color-background-alt)",
      }}
    >
      {/* Header — stays in place above the scrolling content */}
      <div
        className="px-6 py-4 shadow-sm shrink-0"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          borderBottom: BORDER,
        }}
      >
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[11px] mb-3"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          <button
            type="button"
            className="text-[11px] hover:text-[#014486] hover:underline cursor-pointer transition-colors"
            onClick={onBack}
          >
            {backLabel}
          </button>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span
            aria-current="page"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            {name}
          </span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Avatar size="lg" className="shadow-sm">
              <AvatarFallback size="lg" color="primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-[20px] font-bold text-[var(--slds-g-color-text-default)]">
                  {name}
                </h1>
                <SubProgramBadges app={app} />
                {availability.inactive && (
                  <Badge variant="outline">Inactive</Badge>
                )}
                {lostEligibility && (
                  <Badge variant="error">
                    Readiness requirements no longer met
                  </Badge>
                )}
              </div>
              {/* Same contact row as the Tutor record header. */}
              <div
                className="flex items-center gap-3 text-[13px] flex-wrap"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                <span className="flex items-center gap-1.5">
                  <Phone
                    className="h-3.5 w-3.5 shrink-0"
                    aria-label="Phone"
                  />{" "}
                  {o.phone || EMPTY}
                </span>
                <span className="text-[#c9c7c5]" aria-hidden>
                  •
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail
                    className="h-3.5 w-3.5 shrink-0"
                    aria-label="Email"
                  />{" "}
                  {o.email || EMPTY}
                </span>
              </div>
            </div>
          </div>
          <FFMentorStageSelect
            applicationId={app.applicationId}
            savedStage={staff.stage}
          />
        </div>

        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3">
          {[
            ["Program", "Friends First"],
            ["Assigned Coordinator", coordinator],
            ["Current Application Stage", stageLabel],
            [
              "Application Submission Date",
              app.submittedAt || EMPTY,
            ],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                {label}
              </dt>
              <dd className="slds-text-4 text-[var(--slds-g-color-text-default)] break-words">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[11px] font-bold uppercase tracking-wide"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Mentor Pipeline
            </span>
            <span
              className="text-[11px] font-medium"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {stageIdx >= 0 ? (
                <>
                  Stage{" "}
                  <span
                    className="font-bold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {stageIdx + 1}
                  </span>{" "}
                  of {FF_MENTOR_PIPELINE_STAGES.length}
                </>
              ) : (
                `Stage: ${stageLabel}`
              )}
            </span>
          </div>
          <Stepper
            variant="chevron"
            // Exactly the eight pipeline stages. Rejected (7) and Ready for
            // Match (8) are alternative outcomes: neither counts as a
            // completed prerequisite of the other. A saved value outside the
            // eight (Matched / Active) leaves every step upcoming.
            steps={FF_MENTOR_PIPELINE_STAGES.map(
              (stage, idx) => ({
                label: stage,
                status:
                  stageIdx < 0
                    ? "upcoming"
                    : idx === stageIdx
                      ? "current"
                      : idx < stageIdx &&
                          stage !== FF_MENTOR_REJECTED_STAGE
                        ? "completed"
                        : "upcoming",
              }),
            )}
          />
        </div>
      </div>

      {/* The one scrolling area: section nav + content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex min-h-full">
          <SideNav className="w-64 shrink-0 border-0 border-r">
            <nav
              aria-label="Record sections"
              className="py-2 sticky top-0"
              data-leave-guard
            >
              {SECTION_TABS.filter(
                (tab) =>
                  !("cbOnly" in tab) ||
                  app.subPrograms.includes("community"),
              ).map((tab) => (
                <SideNavItem
                  key={tab.id}
                  active={activeSection === tab.id}
                  onClick={() => setActiveSection(tab.id)}
                >
                  {tab.label}
                </SideNavItem>
              ))}
            </nav>
          </SideNav>

          {/* Extra bottom padding clears the fixed 40px UtilityBar. */}
          <div className="flex-1 min-w-0 p-3 pb-16 sm:p-6 sm:pb-16">
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
              {activeSection === "overview" ? (
                <>
                  <Section
                    title="Mentor Summary"
                    first
                    action={
                      !editing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={startEdit}
                        >
                          <Pencil />
                          Edit
                        </Button>
                      )
                    }
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                      <div>
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                          Sub-Programs
                        </p>
                        <SubProgramBadges app={app} />
                      </div>
                      <Field
                        label="Occupation"
                        value={o.occupation || EMPTY}
                      />
                      {editing ? (
                        <div>
                          <FieldLabel
                            htmlFor="ov-coordinator"
                            required
                          >
                            Assigned Coordinator
                          </FieldLabel>
                          <Select
                            value={draft.coordinatorId}
                            onValueChange={(v) => {
                              setDraft((d) => ({
                                ...d,
                                coordinatorId: v,
                              }));
                              setCoordinatorError("");
                            }}
                          >
                            <SelectTrigger
                              id="ov-coordinator"
                              aria-invalid={!!coordinatorError}
                              aria-describedby={
                                coordinatorError
                                  ? "ov-coordinator-error"
                                  : undefined
                              }
                            >
                              <SelectValue placeholder="Please Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                ...savedOption,
                                ...coordinatorOptions,
                              ].map((c) => (
                                <SelectItem
                                  key={c.id}
                                  value={String(c.id)}
                                >
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <ErrMsg
                            id="ov-coordinator"
                            msg={coordinatorError}
                          />
                        </div>
                      ) : (
                        <Field
                          label="Assigned Coordinator"
                          value={coordinator}
                        />
                      )}
                      <Field
                        label="Application Submission Date"
                        value={app.submittedAt || EMPTY}
                      />
                      {/* Only a recorded account creation date; never the
                          mentor start, submission or constituent dates. */}
                      <Field
                        label="Account Created Date"
                        value={
                          ffAccountCreatedDate(app) || EMPTY
                        }
                      />
                      <Field
                        label="Application Stage"
                        value={stageLabel}
                      />
                      <Field
                        label="Submission Status"
                        value={
                          FF_APPLICANT_STATUS_LABEL[
                            app.applicantStatus
                          ]
                        }
                      />
                      <div>
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                          PGC/VIRTUS Training Status
                        </p>
                        <Badge
                          variant={
                            APPROVAL_VARIANT[training.approval]
                          }
                        >
                          {training.approval}
                        </Badge>
                        {training.issues.map((m) => (
                          <p
                            key={m}
                            className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1"
                          >
                            {m}
                          </p>
                        ))}
                      </div>
                      {constituentId !== null && (
                        <div>
                          <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                            Constituent Record
                          </p>
                          <Button
                            variant="link"
                            className="h-auto px-0 py-0"
                            onClick={() =>
                              navigate(
                                `/constituents/${constituentId}`,
                              )
                            }
                          >
                            View Constituent
                          </Button>
                        </div>
                      )}
                      <div>
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                          Inactive Status
                        </p>
                        <FFMentorInactiveToggle
                          availability={availability}
                        />
                      </div>
                    </div>
                  </Section>

                  <Section title="Stage Timeline">
                    {staff.stageHistory.length === 0 ? (
                      <EmptyState
                        icon={History}
                        title="No stage changes recorded"
                        description="Stage changes will be listed here once they are made."
                      />
                    ) : (
                      <div
                        className="overflow-x-auto rounded-lg"
                        style={{ border: BORDER }}
                      >
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Stage Name</TableHead>
                              <TableHead>
                                Date/Time Changed
                              </TableHead>
                              <TableHead>Changed By</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {staff.stageHistory.map((h, i) => {
                              // Only the latest transition, into the saved
                              // stage, is current — an earlier visit to the
                              // same stage is not.
                              const isCurrent =
                                i ===
                                  staff.stageHistory.length -
                                    1 &&
                                h.stage === staff.stage;
                              return (
                                <TableRow
                                  key={
                                    h.id ??
                                    `${h.stage}-${h.at}-${i}`
                                  }
                                  aria-current={
                                    isCurrent
                                      ? "step"
                                      : undefined
                                  }
                                >
                                  <TableCell
                                    className={
                                      isCurrent
                                        ? "font-semibold"
                                        : undefined
                                    }
                                  >
                                    {h.stage}
                                    {h.fromStage !==
                                      undefined && (
                                      <span className="block slds-text-3 font-normal text-[var(--slds-g-color-text-weak)]">
                                        From:{" "}
                                        {h.fromStage ??
                                          "Not set"}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {h.at || EMPTY}
                                  </TableCell>
                                  <TableCell>
                                    {h.by || EMPTY}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        isCurrent
                                          ? "success"
                                          : "neutral"
                                      }
                                    >
                                      {h.status ??
                                        (isCurrent
                                          ? "Current"
                                          : "Previous")}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </Section>

                  <Section title="Coordinator Notes">
                    {editing ? (
                      <div>
                        <FieldLabel htmlFor="ov-notes">
                          Coordinator Notes (internal only)
                        </FieldLabel>
                        <Textarea
                          id="ov-notes"
                          size="md"
                          rows={6}
                          value={draft.coordinatorNotes}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              coordinatorNotes: e.target.value,
                            }))
                          }
                        />
                      </div>
                    ) : (
                      <p className="slds-text-5 text-[var(--slds-g-color-text-default)] leading-relaxed whitespace-pre-wrap">
                        {staff.coordinatorNotes ||
                          "No coordinator notes yet."}
                      </p>
                    )}
                  </Section>

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
                          (coordinatorError
                            ? "Not saved: Assigned Coordinator needs attention."
                            : "")}
                      </p>
                      <Button
                        variant="outline"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button onClick={save}>Save</Button>
                    </div>
                  )}
                </>
              ) : activeSection === "application-details" ? (
                <ApplicationDetailsPanel
                  app={app}
                  staff={staff}
                />
              ) : activeSection === "mentor-profile" ? (
                <MentorProfileSection app={app} first />
              ) : activeSection === "interview-summary" ? (
                <InterviewSummaryPanel app={app} />
              ) : activeSection === "checklist" ? (
                <FFMentorChecklist
                  app={app}
                  staff={staff}
                  onNavigate={setActiveSection}
                />
              ) : activeSection === "consents-documents" ? (
                <>
                  <FFMentorAgreements app={app} staff={staff} />
                  <FFMentorDocuments app={app} staff={staff} />
                </>
              ) : activeSection === "references" ? (
                <FFMentorReferences app={app} staff={staff} />
              ) : activeSection === "matching-preferences" &&
                app.subPrograms.includes("community") ? (
                <MatchingPreferencesView app={app} />
              ) : activeSection ===
                "availability-preferences" ? (
                <AvailabilityPreferencesView
                  app={app}
                  staff={staff}
                />
              ) : (
                <Section
                  title={
                    SECTION_TABS.find(
                      (t) => t.id === activeSection,
                    )!.label
                  }
                  first
                >
                  <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
                    This section is not available yet.
                  </p>
                </Section>
              )}
            </div>
          </div>
        </div>
      </div>
      {leaveGuard}
    </div>
  );
}