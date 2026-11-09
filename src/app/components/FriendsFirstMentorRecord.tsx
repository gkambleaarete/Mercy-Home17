import { useState } from "react";
import {
  ChevronRight,
  Mail,
  Phone,
  User,
  CheckCircle,
  AlertCircle,
  Check,
  Download,
  RotateCcw,
  Plus,
} from "@/app/lib/lucide-icons";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { SideNav, SideNavItem } from "./ui/side-nav";
import { Stepper } from "./ui/stepper";
import { StarRating } from "./ui/star-rating";
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
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { toast } from "sonner";
import {
  type FFMentor,
  type FFApplicantStatus,
  STATUS_LABEL,
  STATUS_BADGE_VARIANT,
  SUB_PROGRAMME_BADGE_VARIANT,
  FF_MENTOR_STAGES,
  FF_STATUS_TO_STAGE,
  type ChecklistItem,
  type CheckResult,
  defaultFFMentorChecklist,
  type DocumentRow,
  defaultFFMentorDocuments,
  type ReferenceRecord,
  defaultFFReferences,
  type FFActivityRow,
  type EngagementRating,
  defaultFFActivities,
  FF_ACTIVITY_TYPES,
  FF_MEET_METHODS,
  type AttendanceWeek,
  type AttendanceStatus,
  defaultFFAttendance,
  ATTENDANCE_LABEL,
} from "../data/mockFriendsFirstData";
import { maskSsn } from "../data/ffMentorApplication";
import { FFMentorMatchActivity } from "./ff-mentor/FFMentorMatchActivity";

const CLOSE_REASONS = [
  "Applicant withdrew",
  "No longer available",
  "Program capacity reached",
  "Other",
];
const REJECT_REASONS = [
  "Failed background check",
  "Unsatisfactory references",
  "Did not complete training",
  "Policy violation",
  "Other",
];

const STAGE_OFFSET_DAYS = [0, 4, 9, 16, 24, 31, 38, 45, 52];
const BORDER = "1px solid var(--slds-g-color-border-base-1)";

function stageDate(
  submitted: string,
  offsetIdx: number,
): string {
  const base = new Date(submitted);
  if (Number.isNaN(base.getTime())) return submitted;
  const d = new Date(base);
  d.setDate(d.getDate() + (STAGE_OFFSET_DAYS[offsetIdx] ?? 0));
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Read-only answer. Empty reads "Not provided"; line breaks are kept. */
export function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
        {label}
      </p>
      <p className="slds-text-6 text-[var(--slds-g-color-text-default)] whitespace-pre-wrap break-words">
        {value?.trim() ? value : "Not provided"}
      </p>
    </div>
  );
}

export function Section({
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

const SECTION_TABS = [
  { id: "overview", label: "Overview" },
  { id: "application-details", label: "Application Details" },
  {
    id: "availability-preferences",
    label: "Availability & Preferences",
  },
  { id: "references", label: "References" },
  { id: "consents-documents", label: "Consents & Documents" },
  { id: "checklist", label: "Checklist" },
  // The mentor's matches and their saved Match Activity Logs (US 20039).
  { id: "match-activity", label: "Match & Activity" },
  // Earlier generated sample activity, kept out of the navigation.
  {
    id: "match-activity-sample",
    label: "Match & Activity (sample)",
    hidden: true,
  },
] as const;
type SectionId = (typeof SECTION_TABS)[number]["id"];

interface Props {
  mentor: FFMentor;
  onBack: () => void;
}

export function FriendsFirstMentorRecord({
  mentor,
  onBack,
}: Props) {
  const [status, setStatus] = useState<FFApplicantStatus>(
    mentor.status,
  );
  // Read-only: demo mentors have no saved stage workflow, so the stage
  // can't be changed here (it would not persist).
  const stageIdx =
    FF_MENTOR_STAGES.indexOf(mentor.stage) >= 0
      ? FF_MENTOR_STAGES.indexOf(mentor.stage)
      : FF_STATUS_TO_STAGE[mentor.status];
  const [activeSection, setActiveSection] =
    useState<SectionId>("overview");
  const visibleTabs = SECTION_TABS.filter(
    (t) => !("hidden" in t),
  );

  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    () => defaultFFMentorChecklist(mentor),
  );
  const [documents, setDocuments] = useState<DocumentRow[]>(
    () => defaultFFMentorDocuments(mentor),
  );
  const [certApproval] = useState<
    Record<string, "approved" | "rejected">
  >({});
  const [references, setReferences] = useState<
    ReferenceRecord[]
  >(() => defaultFFReferences(mentor));
  const [viewingRef, setViewingRef] =
    useState<ReferenceRecord | null>(null);

  const [activities, setActivities] = useState<FFActivityRow[]>(
    () => defaultFFActivities(mentor),
  );
  const [attendance, setAttendance] = useState<
    AttendanceWeek[]
  >(() => defaultFFAttendance(mentor));
  const [logActivityOpen, setLogActivityOpen] = useState(false);

  const [confirmApprove, setConfirmApprove] = useState(false);
  const [reasonModal, setReasonModal] = useState<
    "close" | "reject" | null
  >(null);
  const [reason, setReason] = useState("");
  const [otherReasonText, setOtherReasonText] = useState("");

  const [autoRejectItem, setAutoRejectItem] =
    useState<ChecklistItem | null>(null);
  const [autoRejectConfirmed, setAutoRejectConfirmed] =
    useState(false);

  const isTerminal =
    status === "approved" || status === "inactive";
  const isCB = mentor.subProgramme === "Community-Based";

  const handleApprove = () => {
    setStatus("approved");
    toast.success("Mentor approved", {
      description: `${mentor.name} has been approved and will be notified.`,
    });
    setConfirmApprove(false);
  };

  const handleReasonConfirm = () => {
    if (!reasonModal) return;
    const finalReason =
      reason === "Other" ? otherReasonText || "Other" : reason;
    setStatus("inactive");
    if (reasonModal === "close") {
      toast("Application closed", {
        description: `Reason: ${finalReason}`,
      });
    } else {
      toast.error("Application rejected", {
        description: `Reason: ${finalReason}`,
      });
    }
    setReasonModal(null);
    setReason("");
    setOtherReasonText("");
  };

  const setChecklistResult = (
    id: string,
    result: CheckResult,
  ) => {
    if (result === "failed") {
      const item = checklist.find((i) => i.id === id) ?? null;
      setAutoRejectItem(item);
      setAutoRejectConfirmed(false);
      return;
    }
    setChecklist((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              result,
              status:
                result === "passed" ? "complete" : "incomplete",
            }
          : i,
      ),
    );
  };

  const confirmAutoReject = () => {
    if (!autoRejectItem) return;
    setChecklist((prev) =>
      prev.map((i) =>
        i.id === autoRejectItem.id
          ? { ...i, result: "failed", status: "failed" }
          : i,
      ),
    );
    setStatus("inactive");
    toast.error("Application auto-rejected", {
      description: `${autoRejectItem.label} failed — applicant has been notified.`,
    });
    setAutoRejectItem(null);
  };

  const updateAttendanceStatus = (
    week: string,
    sessionId: string,
    next: AttendanceStatus,
  ) => {
    setAttendance((prev) =>
      prev.map((w) =>
        w.week !== week
          ? w
          : {
              ...w,
              sessions: w.sessions.map((s) =>
                s.id === sessionId ? { ...s, status: next } : s,
              ),
            },
      ),
    );
  };

  const refsSubmitted = references.filter(
    (r) => r.status === "submitted",
  ).length;
  const docsComplete = documents.filter(
    (d) => d.status === "complete",
  ).length;
  const requiredComplete = checklist
    .filter((i) => i.required)
    .every((i) => i.status === "complete");
  const failedCount = checklist.filter(
    (i) => i.status === "failed",
  ).length;
  const computedChecklistStatus =
    status === "inactive"
      ? "Rejected / Closed"
      : failedCount > 0
        ? "Action Required"
        : requiredComplete
          ? "Ready for Match"
          : "In Progress";
  const computedChecklistVariant =
    status === "inactive" || failedCount > 0
      ? "error"
      : requiredComplete
        ? "success"
        : "warning";

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
            Friends First
          </span>
          <ChevronRight className="h-3 w-3" />
          <span
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            {mentor.name}
          </span>
        </div>

        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Avatar size="lg" className="shadow-sm">
              <AvatarFallback size="lg" color="primary">
                {mentor.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-[20px] font-bold text-[var(--slds-g-color-text-default)]">
                  {mentor.name}
                </h1>
                <Badge
                  variant={
                    SUB_PROGRAMME_BADGE_VARIANT[
                      mentor.subProgramme
                    ]
                  }
                >
                  {mentor.subProgramme}
                </Badge>
                <Badge variant={STATUS_BADGE_VARIANT[status]}>
                  {STATUS_LABEL[status]}
                </Badge>
              </div>
              <div
                className="flex items-center gap-3 text-[13px] flex-wrap"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 shrink-0" />{" "}
                  Friends First Mentor
                </span>
                <span className="text-[#c9c7c5]">•</span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 shrink-0" />{" "}
                  {mentor.phone}
                </span>
                <span className="text-[#c9c7c5]">•</span>
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 shrink-0" />{" "}
                  {mentor.email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Select value={String(stageIdx)} disabled>
              <SelectTrigger
                aria-label="Pipeline stage"
                className="h-9 rounded-full text-[13px] shadow-none w-[190px]"
                style={{
                  border: BORDER,
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FF_MENTOR_STAGES.map((s, i) => (
                  <SelectItem key={s} value={String(i)}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!isTerminal && (
              <>
                <Button
                  variant="outline"
                  className="h-9 rounded-full text-[13px] shadow-none"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border: BORDER,
                  }}
                  onClick={() => setReasonModal("close")}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  className="h-9 rounded-full text-[13px] shadow-none"
                  style={{
                    color: "#c23934",
                    borderColor: "#c23934",
                  }}
                  onClick={() => setReasonModal("reject")}
                >
                  Reject
                </Button>
                <Button
                  className="h-9 rounded-full text-[13px] text-white shadow-none"
                  style={{
                    backgroundColor:
                      "var(--color-brand-primary)",
                  }}
                  onClick={() => setConfirmApprove(true)}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Approve
                </Button>
              </>
            )}
          </div>
        </div>

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
              Stage{" "}
              <span
                className="font-bold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {stageIdx + 1}
              </span>{" "}
              of {FF_MENTOR_STAGES.length}
            </span>
          </div>
          <Stepper
            variant="chevron"
            steps={FF_MENTOR_STAGES.map((stage, idx) => ({
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
          {/* LEFT NAVIGATION */}
          <SideNav className="w-64 shrink-0 overflow-y-auto border-0 border-r">
            <div className="py-2">
              {visibleTabs.map((tab) => (
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

          {/* RIGHT CONTENT — single unified card */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
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
              {activeSection === "overview" && (
                <>
                  <Section title="Mentor Summary" first>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                      <Field
                        label="Sub-Program"
                        value={mentor.subProgramme}
                      />
                      <Field
                        label="Coordinator"
                        value={mentor.coordinator}
                      />
                      <Field
                        label="Start Date"
                        value={mentor.startDate}
                      />
                      <Field
                        label="Occupation"
                        value={
                          mentor.applicationDetails.occupation
                        }
                      />
                      <Field
                        label="Employer"
                        value={
                          mentor.applicationDetails.employer
                        }
                      />
                    </div>
                  </Section>

                  <Section title="Stage Timeline">
                    <div className="space-y-1">
                      {FF_MENTOR_STAGES.map((stage, i) => {
                        const done = i < stageIdx;
                        const active = i === stageIdx;
                        return (
                          <div
                            key={stage}
                            className="flex items-center gap-4 px-3 py-2.5 rounded-lg transition-colors"
                            style={{
                              backgroundColor: active
                                ? "var(--slds-g-color-background-alt-2)"
                                : "transparent",
                            }}
                          >
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                              style={{
                                backgroundColor:
                                  done || active
                                    ? "var(--color-brand-primary)"
                                    : "var(--slds-g-color-neutral-base-90)",
                                color:
                                  done || active
                                    ? "white"
                                    : "var(--slds-g-color-text-weak)",
                              }}
                            >
                              {done ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                i + 1
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="slds-text-5 font-medium"
                                style={{
                                  color:
                                    done || active
                                      ? "var(--slds-g-color-text-default)"
                                      : "var(--slds-g-color-text-weak)",
                                }}
                              >
                                {stage}
                              </p>
                            </div>
                            <div className="shrink-0">
                              {done && (
                                <span className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                                  {stageDate(
                                    mentor.startDate,
                                    i,
                                  )}
                                </span>
                              )}
                              {active && (
                                <Badge variant="info">
                                  In Progress
                                </Badge>
                              )}
                              {!done && !active && (
                                <span className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Section>

                  <Section title="Coordinator Notes">
                    <p className="slds-text-5 text-[var(--slds-g-color-text-default)] leading-relaxed">
                      {mentor.notes}
                    </p>
                    <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-2">
                      Last updated by {mentor.coordinator}
                    </p>
                  </Section>
                </>
              )}

              {activeSection === "application-details" && (
                <>
                  <Section title="Personal Information" first>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                      <Field
                        label="Legal First Name"
                        value={
                          mentor.applicationDetails
                            .legalFirstName
                        }
                      />
                      <Field
                        label="Legal Middle Name"
                        value={
                          mentor.applicationDetails
                            .legalMiddleName ?? ""
                        }
                      />
                      <Field
                        label="Legal Last Name"
                        value={
                          mentor.applicationDetails
                            .legalLastName
                        }
                      />
                      <Field
                        label="Date of Birth"
                        value={
                          mentor.applicationDetails.dateOfBirth
                        }
                      />
                      <Field
                        label="Email"
                        value={mentor.email}
                      />
                      <Field
                        label="Preferred Phone"
                        value={
                          mentor.applicationDetails
                            .preferredPhone
                        }
                      />
                      {mentor.applicationDetails.ssn && (
                        // Masked only: there is no secure, authorized SSN retrieval yet.
                        <Field
                          label="Social Security Number"
                          value={maskSsn(
                            mentor.applicationDetails.ssn,
                          )}
                        />
                      )}
                    </div>
                  </Section>

                  <Section title="Address">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                      <Field
                        label="Street Address"
                        value={
                          mentor.applicationDetails
                            .streetAddress
                        }
                      />
                      <Field
                        label="City"
                        value={mentor.applicationDetails.city}
                      />
                      <Field
                        label="State"
                        value={mentor.applicationDetails.state}
                      />
                      <Field
                        label="ZIP Code"
                        value={mentor.applicationDetails.zip}
                      />
                    </div>
                  </Section>

                  <Section title="Employment">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                      <Field
                        label="Occupation"
                        value={
                          mentor.applicationDetails.occupation
                        }
                      />
                      <Field
                        label="Employer"
                        value={
                          mentor.applicationDetails.employer
                        }
                      />
                      <Field
                        label="Anticipated Length of Service"
                        value={
                          mentor.applicationDetails
                            .anticipatedLengthOfService
                        }
                      />
                      <Field
                        label="How did you hear about us?"
                        value={
                          mentor.applicationDetails
                            .howDidYouHear
                        }
                      />
                    </div>
                    <div className="mt-4">
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                        Languages Fluent In
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {mentor.applicationDetails.languagesFluent.map(
                          (l) => (
                            <Badge key={l} variant="neutral">
                              {l}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  </Section>

                  <Section title="About the Applicant">
                    <div className="space-y-4">
                      <div>
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                          Why do you want to mentor?
                        </p>
                        <p className="slds-text-5 text-[var(--slds-g-color-text-default)] leading-relaxed">
                          {mentor.applicationDetails.whyMentor}
                        </p>
                      </div>
                      <div>
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                          Volunteer History
                        </p>
                        <p className="slds-text-5 text-[var(--slds-g-color-text-default)] leading-relaxed">
                          {
                            mentor.applicationDetails
                              .volunteerHistory
                          }
                        </p>
                      </div>
                    </div>
                  </Section>

                  <Section title="Background Disclosure">
                    <Field
                      label="Convicted of a crime?"
                      value={
                        mentor.applicationDetails
                          .convictedOfCrime
                      }
                    />
                  </Section>
                </>
              )}

              {activeSection === "application-details" && (
                <>
                  <Section title="Mentor Profile — Background">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                      <Field
                        label="Hometown"
                        value={mentor.profile.hometown}
                      />
                      <div>
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                          Hobbies &amp; Interests
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {mentor.profile.hobbies.map((h) => (
                            <Badge key={h} variant="neutral">
                              {h}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Section>

                  <Section title="About Me">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                      <Field
                        label="Favourite Chicago activity"
                        value={
                          mentor.profile
                            .favouriteChicagoActivity
                        }
                      />
                      <Field
                        label="Favourite food"
                        value={mentor.profile.favouriteFood}
                      />
                      <Field
                        label="Favourite book"
                        value={mentor.profile.favouriteBook}
                      />
                      <Field
                        label="Favourite music"
                        value={mentor.profile.favouriteMusic}
                      />
                    </div>
                  </Section>

                  <Section title="Mentoring">
                    <div className="space-y-4">
                      <div>
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                          What they loved as a kid
                        </p>
                        <p className="slds-text-5 text-[var(--slds-g-color-text-default)] leading-relaxed">
                          {mentor.profile.lovedAsAKid}
                        </p>
                      </div>
                      <div>
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                          What they look forward to doing with a
                          mentee
                        </p>
                        <p className="slds-text-5 text-[var(--slds-g-color-text-default)] leading-relaxed">
                          {mentor.profile.looksForwardTo}
                        </p>
                      </div>
                    </div>
                  </Section>

                  <Section title="Fun Fact">
                    <p className="slds-text-5 text-[var(--slds-g-color-text-default)] leading-relaxed">
                      {mentor.profile.funFact}
                    </p>
                  </Section>
                </>
              )}

              {activeSection === "availability-preferences" &&
                !mentor.matchingPreferences && (
                  <Section
                    title="Availability & Preferences"
                    first
                  >
                    <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
                      No preferences recorded.
                    </p>
                  </Section>
                )}

              {activeSection === "availability-preferences" &&
                mentor.matchingPreferences && (
                  <>
                    <Section title="Transportation" first>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                            Transportation Methods
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {mentor.matchingPreferences.transportationMethods.map(
                              (t) => (
                                <Badge
                                  key={t}
                                  variant="neutral"
                                >
                                  {t}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                        <Field
                          label="Maximum Commute Distance"
                          value={
                            mentor.matchingPreferences
                              .commuteDistance
                          }
                        />
                      </div>
                      <div className="mt-4">
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                          Areas Willing to Travel To
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {mentor.matchingPreferences.areasWillingToTravel.map(
                            (a) => (
                              <Badge key={a} variant="neutral">
                                {a}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    </Section>

                    <Section title="Age Preferences">
                      <div className="space-y-3">
                        {[
                          {
                            label: "Preferred",
                            values:
                              mentor.matchingPreferences
                                .agePreferences.preferred,
                            variant: "success" as const,
                          },
                          {
                            label: "Open to",
                            values:
                              mentor.matchingPreferences
                                .agePreferences.open,
                            variant: "warning" as const,
                          },
                          {
                            label: "Not preferred",
                            values:
                              mentor.matchingPreferences
                                .agePreferences.notPreferred,
                            variant: "neutral" as const,
                          },
                        ].map(({ label, values, variant }) => (
                          <div
                            key={label}
                            className="flex items-center gap-4"
                          >
                            <p className="slds-form-label text-[var(--slds-g-color-text-weak)] w-28 shrink-0">
                              {label}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {values.length === 0 ? (
                                <span className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                                  —
                                </span>
                              ) : (
                                values.map((v) => (
                                  <Badge
                                    key={v}
                                    variant={variant}
                                  >
                                    {v} yrs
                                  </Badge>
                                ))
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Section>

                    <Section title="Ranked Match Priorities">
                      <div className="space-y-3">
                        {mentor.matchingPreferences.rankedPreferences.map(
                          ({ rank, label, note }) => (
                            <div
                              key={rank}
                              className="flex items-start gap-3"
                            >
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
                                style={{
                                  backgroundColor:
                                    "var(--color-brand-primary)",
                                }}
                              >
                                {rank}
                              </div>
                              <div>
                                <p className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)]">
                                  {label}
                                </p>
                                <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-0.5">
                                  {note}
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </Section>

                    <Section title="Things Hoped to Have in Common">
                      <ul className="space-y-2">
                        {mentor.matchingPreferences.hopedInCommon.map(
                          (item, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2.5"
                            >
                              <Check
                                className="h-4 w-4 mt-0.5 shrink-0"
                                style={{
                                  color:
                                    "var(--color-brand-primary)",
                                }}
                              />
                              <span className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                                {item}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    </Section>
                  </>
                )}

              {activeSection === "references" && (
                <>
                  <Section
                    title="Reference Contacts"
                    first
                    action={
                      <div className="flex items-center gap-2 w-40">
                        <Progress
                          value={
                            (refsSubmitted /
                              references.length) *
                            100
                          }
                          trackTone="neutral"
                          className="h-1.5"
                        />
                        <span className="slds-text-3 font-semibold text-[var(--color-brand-primary)] whitespace-nowrap">
                          {refsSubmitted}/{references.length}
                        </span>
                      </div>
                    }
                  >
                    <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                      {refsSubmitted} of {references.length}{" "}
                      responses received · Minimum 2 required
                    </p>
                  </Section>

                  {references.map((ref) => (
                    <div
                      key={ref.id}
                      className="p-6"
                      style={{ borderTop: BORDER }}
                    >
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            <AvatarFallback
                              size="sm"
                              color="primary"
                            >
                              {ref.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)]">
                                {ref.name}
                              </p>
                              <Badge
                                variant={
                                  ref.status === "submitted"
                                    ? "success"
                                    : ref.status === "awaiting"
                                      ? "warning"
                                      : "error"
                                }
                              >
                                {ref.status === "submitted"
                                  ? "Response Received"
                                  : ref.status === "awaiting"
                                    ? "Awaiting Response"
                                    : "Declined"}
                              </Badge>
                            </div>
                            <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-0.5">
                              {ref.relationship}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {ref.status === "submitted" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-full slds-text-3"
                              onClick={() => setViewingRef(ref)}
                            >
                              View Response
                            </Button>
                          )}
                          {ref.status !== "submitted" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-full slds-text-3"
                              // No email delivery service exists, so nothing
                              // can actually be resent from demo records.
                              disabled
                              title="Email delivery isn't available."
                            >
                              <RotateCcw className="h-3 w-3" />
                              Resend Request
                            </Button>
                          )}
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-6 mt-3 pt-3"
                        style={{ borderTop: BORDER }}
                      >
                        <span className="flex items-center gap-1.5 slds-text-4 text-[var(--slds-g-color-text-weak)]">
                          <Mail className="h-3.5 w-3.5" />{" "}
                          {ref.email}
                        </span>
                        <span className="flex items-center gap-1.5 slds-text-4 text-[var(--slds-g-color-text-weak)]">
                          <Phone className="h-3.5 w-3.5" />{" "}
                          {ref.phone}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {activeSection === "checklist" && (
                <>
                  <Section
                    title="Match Readiness"
                    first
                    action={
                      <Badge
                        variant={computedChecklistVariant}
                        size="lg"
                      >
                        {computedChecklistStatus}
                      </Badge>
                    }
                  >
                    <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                      Every required item must pass before this
                      mentor can be matched with a mentee.
                    </p>
                  </Section>

                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      className="px-6 py-4 flex items-center justify-between flex-wrap gap-3"
                      style={{ borderTop: BORDER }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="slds-text-5 font-medium text-[var(--slds-g-color-text-default)]">
                            {item.label}
                          </p>
                          {item.required && (
                            <Badge variant="neutral">
                              Required
                            </Badge>
                          )}
                        </div>
                        {item.note && (
                          <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1">
                            {item.note}
                          </p>
                        )}
                        {item.date && (
                          <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1">
                            Completed {item.date}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            item.result === "passed"
                              ? "success"
                              : item.result === "failed"
                                ? "error"
                                : "warning"
                          }
                        >
                          {item.result === "passed"
                            ? "Passed"
                            : item.result === "failed"
                              ? "Failed"
                              : "Pending"}
                        </Badge>
                        {item.status !== "complete" &&
                          item.status !== "failed" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 rounded-full slds-text-2"
                                onClick={() =>
                                  setChecklistResult(
                                    item.id,
                                    "passed",
                                  )
                                }
                              >
                                Mark Passed
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 rounded-full slds-text-2"
                                style={{
                                  color: "#c23934",
                                  borderColor: "#c23934",
                                }}
                                onClick={() =>
                                  setChecklistResult(
                                    item.id,
                                    "failed",
                                  )
                                }
                              >
                                Mark Failed
                              </Button>
                            </>
                          )}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {activeSection === "match-activity" && (
                <FFMentorMatchActivity mentorId={mentor.id} />
              )}

              {activeSection === "consents-documents" && (
                <Section
                  title="Application Documents"
                  first
                  action={
                    <div className="flex items-center gap-2 w-40">
                      <Progress
                        value={
                          (docsComplete / documents.length) *
                          100
                        }
                        trackTone="neutral"
                        className="h-1.5"
                      />
                      <span className="slds-text-3 font-semibold text-[var(--color-brand-primary)] whitespace-nowrap">
                        {docsComplete}/{documents.length}
                      </span>
                    </div>
                  }
                >
                  <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mb-4">
                    {docsComplete} of {documents.length}{" "}
                    documents complete
                  </p>
                  <div
                    className="overflow-x-auto rounded-lg"
                    style={{ border: BORDER }}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow
                          className="hover:bg-transparent"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                          }}
                        >
                          {[
                            "Document",
                            "Type",
                            "Category",
                            "Date",
                            "Status",
                            "",
                          ].map((h) => (
                            <TableHead
                              key={h}
                              className="px-4"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              {h}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc) => {
                          const approval = certApproval[doc.id];
                          const canReview =
                            doc.type === "upload" &&
                            doc.status === "complete" &&
                            !approval;
                          return (
                            <TableRow
                              key={doc.id}
                              hoverable={false}
                            >
                              <TableCell
                                className="px-4"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {doc.name}
                                {doc.fileLabel && (
                                  <p className="slds-text-2 text-[var(--slds-g-color-text-weak)] mt-0.5 whitespace-normal">
                                    {doc.fileLabel}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                {doc.type === "e-signature"
                                  ? "E-Signature"
                                  : "Upload"}
                              </TableCell>
                              <TableCell
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                {doc.category}
                              </TableCell>
                              <TableCell
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                {doc.date ?? "—"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    approval === "approved"
                                      ? "success"
                                      : approval === "rejected"
                                        ? "error"
                                        : doc.status ===
                                            "complete"
                                          ? "success"
                                          : doc.status ===
                                              "pending"
                                            ? "warning"
                                            : "error"
                                  }
                                >
                                  {approval === "approved"
                                    ? "Approved"
                                    : approval === "rejected"
                                      ? "Rejected"
                                      : doc.status ===
                                          "complete"
                                        ? "Complete"
                                        : doc.status ===
                                            "pending"
                                          ? "Pending"
                                          : "Missing"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {canReview ? (
                                  <div className="flex items-center gap-1.5 justify-end">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 rounded-full slds-text-2"
                                      // Demo records have no stored file to
                                      // inspect and no saved review, so
                                      // they can't be approved here.
                                      disabled
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 rounded-full slds-text-2"
                                      style={{
                                        color: "#c23934",
                                        borderColor: "#c23934",
                                      }}
                                      disabled
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                ) : doc.status ===
                                  "complete" ? (
                                  <button
                                    className="inline-flex items-center gap-1 slds-text-3"
                                    style={{
                                      color:
                                        "var(--color-brand-primary)",
                                    }}
                                    disabled
                                    title="This document can't be opened here."
                                  >
                                    <Download className="h-3.5 w-3.5" />{" "}
                                    Download
                                  </button>
                                ) : null}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </Section>
              )}

              {activeSection === "match-activity-sample" &&
                isCB && (
                  <Section
                    title="Match Activity Log"
                    first
                    action={
                      <Button
                        size="sm"
                        className="h-8 rounded-full slds-text-3 text-white"
                        style={{
                          backgroundColor:
                            "var(--color-brand-primary)",
                        }}
                        onClick={() => setLogActivityOpen(true)}
                      >
                        <Plus className="h-3.5 w-3.5" /> Log
                        Activity
                      </Button>
                    }
                  >
                    {activities.length === 0 ? (
                      <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
                        No activities logged yet.
                      </p>
                    ) : (
                      <div
                        className="overflow-x-auto rounded-lg"
                        style={{ border: BORDER }}
                      >
                        <Table>
                          <TableHeader>
                            <TableRow
                              className="hover:bg-transparent"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-alt)",
                              }}
                            >
                              {[
                                "Date",
                                "Type",
                                "Duration",
                                "Mentor Eng.",
                                "Mentee Eng.",
                                "Method",
                                "Notes",
                              ].map((h) => (
                                <TableHead
                                  key={h}
                                  className="px-4 whitespace-nowrap"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  {h}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activities.map((a) => (
                              <TableRow
                                key={a.id}
                                hoverable={false}
                              >
                                <TableCell
                                  className="px-4 whitespace-nowrap"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {a.date}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="neutral">
                                    {a.type}
                                  </Badge>
                                </TableCell>
                                <TableCell
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  {a.duration} hrs
                                </TableCell>
                                <TableCell>
                                  <StarRating
                                    value={a.engMentor}
                                    readOnly
                                    size={14}
                                  />
                                </TableCell>
                                <TableCell>
                                  <StarRating
                                    value={a.engMentee}
                                    readOnly
                                    size={14}
                                  />
                                </TableCell>
                                <TableCell
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  {a.meetMethod}
                                </TableCell>
                                <TableCell
                                  className="max-w-[240px]"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  <span className="line-clamp-2">
                                    {a.notes}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </Section>
                )}

              {activeSection === "match-activity-sample" &&
                !isCB && (
                  <Section title="Attendance" first>
                    <div className="space-y-5">
                      {attendance.map((week) => (
                        <div key={week.week}>
                          <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-2">
                            {week.week}
                          </p>
                          <div
                            className="overflow-x-auto rounded-lg"
                            style={{ border: BORDER }}
                          >
                            <Table>
                              <TableHeader>
                                <TableRow
                                  className="hover:bg-transparent"
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-alt)",
                                  }}
                                >
                                  {[
                                    "Date",
                                    "Duration",
                                    "Note",
                                    "Status",
                                  ].map((h) => (
                                    <TableHead
                                      key={h}
                                      className="px-4"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      {h}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {week.sessions.map((s) => (
                                  <TableRow
                                    key={s.id}
                                    hoverable={false}
                                  >
                                    <TableCell
                                      className="px-4"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {s.date}
                                    </TableCell>
                                    <TableCell
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      {s.duration > 0
                                        ? `${s.duration} hrs`
                                        : "—"}
                                    </TableCell>
                                    <TableCell
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      {s.note || "—"}
                                    </TableCell>
                                    <TableCell>
                                      <Select
                                        value={s.status}
                                        onValueChange={(v) =>
                                          updateAttendanceStatus(
                                            week.week,
                                            s.id,
                                            v as AttendanceStatus,
                                          )
                                        }
                                      >
                                        <SelectTrigger
                                          className="h-8 w-[130px] text-[12px]"
                                          style={{
                                            border: BORDER,
                                            backgroundColor:
                                              "var(--slds-g-color-background-base)",
                                          }}
                                        >
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {(
                                            Object.keys(
                                              ATTENDANCE_LABEL,
                                            ) as AttendanceStatus[]
                                          ).map((st) => (
                                            <SelectItem
                                              key={st}
                                              value={st}
                                            >
                                              {
                                                ATTENDANCE_LABEL[
                                                  st
                                                ]
                                              }
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Approve confirmation */}
      <AlertDialog
        open={confirmApprove}
        onOpenChange={setConfirmApprove}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Mentor</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to approve {mentor.name}. They will
              receive a confirmation email and be moved to the
              active mentor roster.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not yet</AlertDialogCancel>
            <AlertDialogAction
              style={{
                backgroundColor: "var(--color-brand-primary)",
              }}
              onClick={handleApprove}
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close / Reject reason modal */}
      <AlertDialog
        open={reasonModal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setReasonModal(null);
            setReason("");
            setOtherReasonText("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {reasonModal === "close"
                ? "Close Application"
                : "Reject Application"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {reasonModal === "close"
                ? "Select a reason for closing this application. The applicant will be notified by email."
                : "Select a reason for rejecting this application. The applicant will receive a formal rejection notice."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            {(reasonModal === "close"
              ? CLOSE_REASONS
              : REJECT_REASONS
            ).map((r) => (
              <label
                key={r}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <input
                  type="radio"
                  name="reason"
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  style={{
                    accentColor: "var(--color-brand-primary)",
                  }}
                />
                <span className="slds-text-5 text-[var(--slds-g-color-text-default)]">
                  {r}
                </span>
              </label>
            ))}
            {reason === "Other" && (
              <Textarea
                value={otherReasonText}
                onChange={(e) =>
                  setOtherReasonText(e.target.value)
                }
                placeholder="Describe the reason…"
                rows={3}
                className="mt-2"
              />
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setReason("");
                setOtherReasonText("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!reason}
              style={{
                backgroundColor:
                  reasonModal === "reject"
                    ? "#c23934"
                    : undefined,
              }}
              onClick={handleReasonConfirm}
            >
              {reasonModal === "close"
                ? "Close Application"
                : "Reject Application"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Checklist auto-reject confirmation */}
      <AlertDialog
        open={autoRejectItem !== null}
        onOpenChange={(open) =>
          !open && setAutoRejectItem(null)
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle
                className="h-5 w-5"
                style={{ color: "#c23934" }}
              />
              Auto-Reject Triggered
            </AlertDialogTitle>
            <AlertDialogDescription>
              Recording a Failed result for{" "}
              {autoRejectItem?.label} will automatically reject
              this application and notify the applicant. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label className="flex items-start gap-2.5 py-2 cursor-pointer">
            <Checkbox
              checked={autoRejectConfirmed}
              onCheckedChange={(v) =>
                setAutoRejectConfirmed(v === true)
              }
            />
            <span className="slds-text-4 text-[var(--slds-g-color-text-default)]">
              I confirm this result is accurate and understand
              the application will be rejected immediately.
            </span>
          </label>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!autoRejectConfirmed}
              style={{ backgroundColor: "#c23934" }}
              onClick={confirmAutoReject}
            >
              Confirm &amp; Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reference response viewer */}
      <AlertDialog
        open={viewingRef !== null}
        onOpenChange={(open) => !open && setViewingRef(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {viewingRef?.name}'s Response
            </AlertDialogTitle>
            <AlertDialogDescription>
              {viewingRef?.relationship} · Submitted{" "}
              {viewingRef?.submittedDate}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <p className="slds-text-5 text-[var(--slds-g-color-text-default)] leading-relaxed py-2">
            {viewingRef?.notes}
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Log Activity dialog (Community-Based) */}
      <LogActivityDialog
        open={logActivityOpen}
        onClose={() => setLogActivityOpen(false)}
        onSave={(row) => {
          setActivities((prev) => [row, ...prev]);
          setLogActivityOpen(false);
          toast.success("Activity logged", {
            description: "Session record has been saved.",
          });
        }}
      />
    </div>
  );
}

function LogActivityDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (row: FFActivityRow) => void;
}) {
  const [happened, setHappened] = useState<
    "yes" | "no" | "partial" | ""
  >("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [meetMethod, setMeetMethod] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [engMentor, setEngMentor] = useState<
    EngagementRating | 0
  >(0);
  const [engMentee, setEngMentee] = useState<
    EngagementRating | 0
  >(0);

  const reset = () => {
    setHappened("");
    setDate("");
    setType("");
    setMeetMethod("");
    setDuration("");
    setNotes("");
    setEngMentor(0);
    setEngMentee(0);
  };

  const canSave =
    happened &&
    date &&
    type &&
    meetMethod &&
    duration &&
    engMentor &&
    engMentee;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: `act-${Date.now()}`,
      date,
      type,
      duration: Number(duration),
      engMentor: engMentor as EngagementRating,
      engMentee: engMentee as EngagementRating,
      meetMethod,
      notes,
      happened: happened as "yes" | "no" | "partial",
    });
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Log Community-Based Activity
          </DialogTitle>
          <DialogDescription>
            Record the session details for this mentoring
            outing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--slds-g-color-text-weak)]">
              Did the outing happen?
            </label>
            <div className="flex gap-2">
              {(["yes", "partial", "no"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setHappened(v)}
                  className="flex-1 px-3 py-2 rounded-full text-[12px] font-semibold border transition-all"
                  style={
                    happened === v
                      ? {
                          borderColor:
                            "var(--color-brand-primary)",
                          backgroundColor:
                            "var(--slds-g-color-background-alt-2)",
                          color: "var(--color-brand-primary)",
                        }
                      : {
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-weak)",
                        }
                  }
                >
                  {v === "yes"
                    ? "Yes"
                    : v === "partial"
                      ? "Partially"
                      : "No"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--slds-g-color-text-weak)]">
                Date
              </label>
              <DateInput value={date} onChange={setDate} />
            </div>
            <div>
              <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--slds-g-color-text-weak)]">
                Duration (hours)
              </label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 2"
                className="h-9 text-[13px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--slds-g-color-text-weak)]">
                Activity Type
              </label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-9 w-full text-[13px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {FF_ACTIVITY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--slds-g-color-text-weak)]">
                Meeting Method
              </label>
              <Select
                value={meetMethod}
                onValueChange={setMeetMethod}
              >
                <SelectTrigger className="h-9 w-full text-[13px]">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {FF_MEET_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--slds-g-color-text-weak)]">
              Mentor Engagement
            </label>
            <StarRating
              value={engMentor}
              size={24}
              onSelect={(n) =>
                setEngMentor(n as EngagementRating)
              }
            />
          </div>
          <div>
            <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--slds-g-color-text-weak)]">
              Mentee Engagement
            </label>
            <StarRating
              value={engMentee}
              size={24}
              onSelect={(n) =>
                setEngMentee(n as EngagementRating)
              }
            />
          </div>

          <div>
            <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--slds-g-color-text-weak)]">
              Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did the mentor and mentee do together?"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!canSave}
            style={{
              backgroundColor: "var(--color-brand-primary)",
            }}
            className="text-white"
            onClick={handleSave}
          >
            Log Activity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}