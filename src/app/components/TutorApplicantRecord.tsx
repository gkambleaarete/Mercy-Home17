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
  Edit2,
  Eye,
  EyeOff,
  Shield,
} from "@/app/lib/lucide-icons";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Checkbox } from "./ui/checkbox";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { SideNav, SideNavItem } from "./ui/side-nav";
import { Stepper } from "./ui/stepper";
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
  DialogBody,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from "sonner";
import {
  type TutorApplicant,
  type LanguageProficiency,
  type CheckResult,
  PGC_LABEL,
  PGC_BADGE_VARIANT,
  TUTOR_SUB_PROGRAMS,
  type TutorSubProgram,
  TUTOR_STAGES,
  APPLICATION_STAGE_BADGE_VARIANT,
  TUTOR_COORDINATORS,
  TUTOR_TYPES,
  type TutorType,
} from "../data/mockTutorApplicantData";
import {
  AVAILABILITY_CAMPUSES,
  AVAILABILITY_DAYS,
  AVAILABILITY_SLOT_COUNT,
  DOC_STATUS_BADGE_VARIANT,
  DOC_STATUS_LABEL,
  REFERENCES_MINIMUM,
  availabilityKey,
  availableDays,
  changeStage,
  checklist as buildChecklist,
  endActiveMatches,
  formatDisplayDate,
  isAvailableForMatch,
  pgcStatus as derivePgcStatus,
  readinessPassed,
  referencesReceived,
  updateTutorRecord,
  useTutorRecord,
  type ChecklistItem,
  type ReferenceRecord,
  type TutorRecordState,
  type TutorStage,
} from "../data/tutorApplicantStore";
import { markTutorInactive } from "../data/tutorMatchStore";

const SECTION_TABS = [
  { id: "overview", label: "Overview" },
  { id: "application-details", label: "Application Details" },
  { id: "day-time", label: "Day / Time Preference" },
  { id: "references", label: "References" },
  { id: "documents", label: "Documents" },
  { id: "checklist", label: "Checklist" },
] as const;
type SectionId = (typeof SECTION_TABS)[number]["id"];

const CLOSE_REASONS = [
  "Applicant withdrew",
  "No longer available",
  "Program capacity reached",
  "Other",
];
const REJECT_REASONS = [
  "Failed background check",
  "Unsatisfactory references",
  "Did not complete orientation",
  "Policy violation",
  "Other",
];

const BORDER = "1px solid var(--slds-g-color-border-base-1)";

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
        {label}
      </p>
      <p className="slds-text-6 text-[var(--slds-g-color-text-default)]">
        {value}
      </p>
    </div>
  );
}

// Read-only display of each selected language plus its Read/Write/Speak
// proficiency — keeps the three values scoped to their own language row so
// they can never be mistaken for a single shared value across languages.
function LanguageProficiencyList({
  languages,
}: {
  languages: LanguageProficiency[];
}) {
  return (
    <div className="space-y-2">
      {languages.map((lang) => (
        <div
          key={lang.language}
          className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-md px-3 py-2"
          style={{ border: BORDER }}
        >
          <Badge variant="neutral">{lang.language}</Badge>
          <div className="flex items-center gap-4">
            <LanguageProficiencyItem
              label="Read"
              value={lang.read}
            />
            <LanguageProficiencyItem
              label="Write"
              value={lang.write}
            />
            <LanguageProficiencyItem
              label="Speak"
              value={lang.speak}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function LanguageProficiencyItem({
  label,
  value,
}: {
  label: string;
  value: boolean;
}) {
  return (
    <span className="slds-text-5 flex items-center gap-1 text-[var(--slds-g-color-text-weak)]">
      {label}
      {value ? (
        <Check
          className="h-3.5 w-3.5"
          style={{ color: "var(--color-brand-primary)" }}
        />
      ) : (
        <span>No</span>
      )}
    </span>
  );
}

// Overview fields staff edit in place and commit together with Save.
interface OverviewDraft {
  type: TutorType;
  inactive: boolean;
  coordinator: string;
  notes: string;
  subPrograms: TutorSubProgram[];
}

function overviewDraft(rec: TutorRecordState): OverviewDraft {
  return {
    type: rec.type,
    inactive: rec.inactive,
    coordinator: rec.coordinator,
    notes: rec.notes,
    subPrograms: rec.subPrograms,
  };
}

// A titled block inside the single outer record card — border-top separates
// it from the block above instead of each group being its own gapped Card.
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

interface Props {
  applicant: TutorApplicant;
  onBack: () => void;
}

export function TutorApplicantRecord({
  applicant,
  onBack,
}: Props) {
  // Persisted record state — the single source of truth (see
  // tutorApplicantStore.ts). Stage, documents, references, availability and
  // checklist reviews commit immediately; Overview fields commit with Save.
  const rec = useTutorRecord(applicant);
  const update = (
    fn: (r: TutorRecordState) => TutorRecordState,
  ) => updateTutorRecord(applicant, fn);
  const stageIdx = TUTOR_STAGES.indexOf(rec.stage);
  const setStage = (stage: TutorStage) =>
    update((r) => changeStage(r, stage));

  const [draft, setDraft] = useState<OverviewDraft>(() =>
    overviewDraft(rec),
  );
  const setDraftField = <K extends keyof OverviewDraft>(
    key: K,
    value: OverviewDraft[K],
  ) => setDraft((d) => ({ ...d, [key]: value }));
  const isDirty =
    JSON.stringify(draft) !==
    JSON.stringify(overviewDraft(rec));
  const [inactiveConfirmOpen, setInactiveConfirmOpen] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState<SectionId>("overview");
  function toggleSubProgram(sp: TutorSubProgram) {
    setDraftField(
      "subPrograms",
      draft.subPrograms.includes(sp)
        ? draft.subPrograms.filter((x) => x !== sp)
        : [...draft.subPrograms, sp],
    );
  }

  const checklist = buildChecklist(applicant, rec);
  const pgcStatus = derivePgcStatus(rec);
  const documents = rec.documents;
  const references = rec.references;
  const [resendingRefId, setResendingRefId] = useState<
    string | null
  >(null);
  const [viewingRef, setViewingRef] =
    useState<ReferenceRecord | null>(null);
  const [ssnRevealed, setSsnRevealed] = useState(false);
  const [ssnAccessModalOpen, setSsnAccessModalOpen] =
    useState(false);
  const [ssnAccessConfirmed, setSsnAccessConfirmed] =
    useState(false);
  const ssnAccessTime = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const [editingAvailability, setEditingAvailability] =
    useState(false);
  const [availabilityDraft, setAvailabilityDraft] = useState<
    string[]
  >(rec.availability);

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

  // Approve / Reject / Close are shortcuts for Stage changes only — there is
  // no separate Application Status. They hide once a terminal Stage is set.
  const isTerminal =
    rec.stage === "Ready for Match" ||
    rec.stage === "Closed/Rejected";

  const handleApprove = () => {
    setStage("Ready for Match");
    toast.success("Application approved", {
      description: `${applicant.name} moved to Ready for Match.`,
    });
    setConfirmApprove(false);
  };

  const handleReasonConfirm = () => {
    if (!reasonModal) return;
    const finalReason =
      reason === "Other" ? otherReasonText || "Other" : reason;
    setStage("Closed/Rejected");
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

  // Manual-review checklist items (Background Check, Orientation).
  const setChecklistResult = (
    item: ChecklistItem,
    result: CheckResult,
  ) => {
    if (item.id !== "background" && item.id !== "orientation")
      return;
    if (result === "failed") {
      setAutoRejectItem(item);
      setAutoRejectConfirmed(false);
      return;
    }
    const id = item.id;
    update((r) => ({
      ...r,
      checks: {
        ...r.checks,
        [id]: { result, date: formatDisplayDate(new Date()) },
      },
    }));
  };

  const confirmAutoReject = () => {
    const item = autoRejectItem;
    if (
      !item ||
      (item.id !== "background" && item.id !== "orientation")
    )
      return;
    const id = item.id;
    update((r) =>
      changeStage(
        {
          ...r,
          checks: {
            ...r.checks,
            [id]: {
              result: "failed",
              date: formatDisplayDate(new Date()),
            },
          },
        },
        "Closed/Rejected",
      ),
    );
    toast.error("Application auto-rejected", {
      description: `${item.label} failed — applicant has been notified.`,
    });
    setAutoRejectItem(null);
  };

  // Resends to the same reference record (no duplicate is created).
  const handleResendReference = (ref: ReferenceRecord) => {
    setResendingRefId(ref.id);
    setTimeout(() => {
      update((r) => ({
        ...r,
        references: r.references.map((x) =>
          x.id === ref.id
            ? { ...x, sentDate: formatDisplayDate(new Date()) }
            : x,
        ),
      }));
      setResendingRefId(null);
      toast.success("Reference request resent", {
        description: `Email sent to ${ref.email}`,
      });
    }, 1000);
  };

  const commitOverview = (endMatches: boolean) => {
    let ended = 0;
    if (!endMatches) {
      update((r) => ({ ...r, ...draft }));
      toast.success("Changes saved", {
        description: `${applicant.name}'s record has been updated.`,
      });
      return;
    }
    // Marking inactive (US 20093): one service saves the inactive flag,
    // this record's own match summaries and the shared Tutor Match
    // closures in a single write of the tutor record; nothing is published
    // and no success is shown unless that write succeeds.
    const result = endActiveMatches({ ...rec, ...draft });
    ended = result.ended;
    const shared = markTutorInactive(applicant, result.rec);
    if (!shared.ok) {
      toast.error("Tutor not marked inactive", {
        description:
          "The change could not be saved, so the tutor and their matches are unchanged.",
      });
      return;
    }
    const total = ended + shared.ended;
    toast.success("Tutor marked inactive", {
      description:
        total > 0
          ? `${total} active tutor match${total > 1 ? "es" : ""} ended.`
          : "No active tutor matches to end.",
    });
  };

  const handleSave = () => {
    if (draft.inactive && !rec.inactive) {
      setInactiveConfirmOpen(true);
      return;
    }
    commitOverview(false);
  };

  const confirmInactive = () => {
    setInactiveConfirmOpen(false);
    commitOverview(true);
  };

  // Cancel keeps the previously saved Inactive value; nothing is persisted.
  const cancelInactive = () => {
    setInactiveConfirmOpen(false);
    setDraftField("inactive", rec.inactive);
  };

  const reviewDocument = (
    id: string,
    status: "approved" | "rejected",
  ) => {
    const doc = documents.find((d) => d.id === id);
    update((r) => ({
      ...r,
      documents: r.documents.map((d) =>
        d.id === id
          ? {
              ...d,
              status,
              date: formatDisplayDate(new Date()),
            }
          : d,
      ),
    }));
    if (status === "approved")
      toast.success(`${doc?.name ?? "Document"} approved`);
    else toast.error(`${doc?.name ?? "Document"} rejected`);
  };

  const startEditingAvailability = () => {
    setAvailabilityDraft(rec.availability);
    setEditingAvailability(true);
  };
  const saveAvailability = () => {
    update((r) => ({ ...r, availability: availabilityDraft }));
    setEditingAvailability(false);
    toast.success("Availability saved");
  };
  const cancelAvailability = () => {
    setAvailabilityDraft(rec.availability);
    setEditingAvailability(false);
  };
  const toggleAvailabilityCell = (key: string) => {
    if (!editingAvailability) return;
    setAvailabilityDraft((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key],
    );
  };

  const refsSubmitted = referencesReceived(rec);
  const docsDone = documents.filter(
    (d) => d.status === "complete" || d.status === "approved",
  ).length;
  const readyForMatch = readinessPassed(applicant, rec);
  const availableForMatch = isAvailableForMatch(applicant, rec);
  const matchAvailabilityNote = availableForMatch
    ? "Available for Tutor Search."
    : rec.stage !== "Ready for Match"
      ? "Not available for Tutor Search — Stage must be Ready for Match."
      : rec.inactive
        ? "Not available for Tutor Search — tutor is Inactive."
        : "Not available for Tutor Search — every required item must pass.";

  const shownAvailability = editingAvailability
    ? availabilityDraft
    : rec.availability;
  const availCount = shownAvailability.length;

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{
        backgroundColor: "var(--slds-g-color-background-alt-2)",
      }}
    >
      {/* Header — SLDS v2 (breadcrumb, identity, actions, pipeline all in one block) */}
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
            Tutor
          </span>
          <ChevronRight className="h-3 w-3" />
          <span
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            {applicant.name}
          </span>
        </div>

        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Avatar size="lg" className="shadow-sm">
              <AvatarFallback size="lg" color="primary">
                {applicant.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[20px] font-bold text-[var(--slds-g-color-text-default)]">
                  {applicant.name}
                </h1>
                <Badge
                  variant={
                    APPLICATION_STAGE_BADGE_VARIANT[rec.stage]
                  }
                >
                  {rec.stage}
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
                  {applicant.role}
                </span>
                <span className="text-[#c9c7c5]">•</span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 shrink-0" />{" "}
                  {applicant.phone}
                </span>
                <span className="text-[#c9c7c5]">•</span>
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 shrink-0" />{" "}
                  {applicant.email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Select
              value={rec.stage}
              onValueChange={(v) => setStage(v as TutorStage)}
            >
              <SelectTrigger
                surface="base"
                className="h-9 rounded-full text-[13px] shadow-none w-[190px]"
                style={{ border: BORDER }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TUTOR_STAGES.map((s) => (
                  <SelectItem key={s} value={s}>
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
              Tutor Pipeline
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
              of {TUTOR_STAGES.length}
            </span>
          </div>
          <Stepper
            variant="chevron"
            steps={TUTOR_STAGES.map((stage, idx) => ({
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

          {/* RIGHT CONTENT — single unified card */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 pb-14 sm:pb-16">
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
                  <Section title="Applicant Summary" first>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                      <Field
                        label="Program"
                        value={applicant.program}
                      />
                      <Field
                        label="Campus"
                        value={applicant.campus}
                      />
                      <Field
                        label="Assigned Site"
                        value={applicant.site}
                      />
                      <Field
                        label="Weekly Availability"
                        value={
                          availableDays(rec.availability).join(
                            ", ",
                          ) || "—"
                        }
                      />
                      <div>
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                          Coordinator
                        </p>
                        <Select
                          value={draft.coordinator}
                          onValueChange={(v) =>
                            setDraftField("coordinator", v)
                          }
                        >
                          <SelectTrigger
                            surface="base"
                            aria-label="Coordinator"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TUTOR_COORDINATORS.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Field
                        label="Submitted"
                        value={applicant.submitted}
                      />
                    </div>
                    <div
                      className="mt-4 pt-4 flex flex-wrap gap-8"
                      style={{ borderTop: BORDER }}
                    >
                      <div>
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-2">
                          Sub-Program
                        </p>
                        <div className="flex items-center gap-1.5">
                          {TUTOR_SUB_PROGRAMS.map((sp) => {
                            const selected =
                              draft.subPrograms.includes(sp);
                            return (
                              <Badge
                                key={sp}
                                asChild
                                variant={
                                  selected
                                    ? "default"
                                    : "outline"
                                }
                              >
                                <button
                                  type="button"
                                  aria-pressed={selected}
                                  onClick={() =>
                                    toggleSubProgram(sp)
                                  }
                                  className="cursor-pointer transition-opacity hover:opacity-80"
                                >
                                  {sp}
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-2">
                          PGC Training
                        </p>
                        <Badge
                          variant={PGC_BADGE_VARIANT[pgcStatus]}
                        >
                          {PGC_LABEL[pgcStatus]}
                        </Badge>
                      </div>
                      <div className="w-48">
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-2">
                          Type
                        </p>
                        <Select
                          value={draft.type}
                          onValueChange={(v) =>
                            setDraftField(
                              "type",
                              v as TutorType,
                            )
                          }
                        >
                          <SelectTrigger
                            surface="base"
                            aria-label="Type"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TUTOR_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p
                          id="tutor-inactive-label"
                          className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-2"
                        >
                          Inactive
                        </p>
                        <div className="flex items-center gap-2 h-9">
                          <Switch
                            id="tutor-inactive"
                            aria-labelledby="tutor-inactive-label"
                            checked={draft.inactive}
                            onCheckedChange={(v) =>
                              setDraftField("inactive", v)
                            }
                          />
                          <label
                            htmlFor="tutor-inactive"
                            className="slds-text-4 text-[var(--slds-g-color-text-default)] cursor-pointer"
                          >
                            {draft.inactive ? "ON" : "OFF"}
                          </label>
                        </div>
                      </div>
                    </div>
                  </Section>

                  <Section title="Stage Timeline">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Stage</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date of Change</TableHead>
                          <TableHead>Changed By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rec.stageHistory.map((entry, n) => {
                          const current =
                            n === rec.stageHistory.length - 1;
                          return (
                            <TableRow
                              key={n}
                              hoverable={false}
                              aria-current={
                                current ? "step" : undefined
                              }
                              className={
                                current
                                  ? "bg-[var(--slds-g-color-background-alt-2)] font-medium"
                                  : undefined
                              }
                            >
                              <TableCell>
                                {entry.stage}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    current ? "info" : "neutral"
                                  }
                                >
                                  {current
                                    ? "Current"
                                    : "Completed"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {entry.date}
                              </TableCell>
                              <TableCell>
                                {entry.user}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Section>

                  <Section title="Coordinator Notes">
                    <Textarea
                      size="md"
                      aria-label="Coordinator Notes"
                      value={draft.notes}
                      onChange={(e) =>
                        setDraftField("notes", e.target.value)
                      }
                      rows={4}
                    />
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
                          applicant.applicationDetails
                            .legalFirstName
                        }
                      />
                      <Field
                        label="Legal Middle Name"
                        value={
                          applicant.applicationDetails
                            .legalMiddleName || "-"
                        }
                      />
                      <Field
                        label="Legal Last Name"
                        value={
                          applicant.applicationDetails
                            .legalLastName
                        }
                      />
                      <Field
                        label="Date of Birth"
                        value={
                          applicant.applicationDetails
                            .dateOfBirth
                        }
                      />
                      <Field
                        label="Email"
                        value={applicant.email}
                      />
                      <Field
                        label="Preferred Phone"
                        value={
                          applicant.applicationDetails
                            .preferredPhone
                        }
                      />
                      {applicant.applicationDetails.ssn && (
                        <div>
                          <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                            Social Security Number
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="slds-text-6 font-mono text-[var(--slds-g-color-text-default)]">
                              {ssnRevealed
                                ? applicant.applicationDetails
                                    .ssn
                                : applicant.applicationDetails.ssn.replace(
                                    /\d/g,
                                    "•",
                                  )}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() =>
                                ssnRevealed
                                  ? setSsnRevealed(false)
                                  : setSsnAccessModalOpen(true)
                              }
                              className="text-[var(--slds-g-color-text-weak)]"
                              title={
                                ssnRevealed
                                  ? "Hide SSN"
                                  : "Reveal SSN"
                              }
                            >
                              {ssnRevealed ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            {ssnRevealed && (
                              <Badge variant="error">
                                Visible — click to hide
                              </Badge>
                            )}
                          </div>
                          {!ssnRevealed && (
                            <p className="slds-text-2 text-[var(--slds-g-color-text-weak)] mt-0.5">
                              Access is logged and audited
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </Section>

                  <Section title="Address">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                      <Field
                        label="Street Address"
                        value={
                          applicant.applicationDetails
                            .streetAddress
                        }
                      />
                      <Field
                        label="City"
                        value={
                          applicant.applicationDetails.city
                        }
                      />
                      <Field
                        label="State"
                        value={
                          applicant.applicationDetails.state
                        }
                      />
                      <Field
                        label="ZIP Code"
                        value={applicant.applicationDetails.zip}
                      />
                    </div>
                  </Section>

                  <Section title="Program Preferences">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                      <Field
                        label="Program"
                        value={applicant.program}
                      />
                      <Field
                        label="Preferred Campus"
                        value={applicant.campus}
                      />
                      <Field
                        label="Anticipated Length of Service"
                        value={
                          applicant.applicationDetails
                            .anticipatedLengthOfService
                        }
                      />
                      <Field
                        label="How did you hear about us?"
                        value={
                          applicant.applicationDetails
                            .howDidYouHear
                        }
                      />
                    </div>
                    <div className="mt-4">
                      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                        Days Available
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {applicant.applicationDetails.daysAvailable.map(
                          (d) => (
                            <Badge key={d} variant="neutral">
                              {d}
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
                          Personal strengths
                        </p>
                        <p className="slds-text-5 text-[var(--slds-g-color-text-default)] leading-relaxed">
                          {
                            applicant.applicationDetails
                              .personalStrengths
                          }
                        </p>
                      </div>
                      <div>
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                          Why do you want to tutor?
                        </p>
                        <p className="slds-text-5 text-[var(--slds-g-color-text-default)] leading-relaxed">
                          {
                            applicant.applicationDetails
                              .whyTutor
                          }
                        </p>
                      </div>
                    </div>
                  </Section>

                  <Section title="Employment">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                      <Field
                        label="Employment Status"
                        value={
                          applicant.applicationDetails
                            .employmentStatus
                        }
                      />
                      <Field
                        label="Current Employer"
                        value={
                          applicant.applicationDetails
                            .currentEmployer
                        }
                      />
                      <Field
                        label="Job Title"
                        value={
                          applicant.applicationDetails.jobTitle
                        }
                      />
                      <Field
                        label="Profession"
                        value={
                          applicant.applicationDetails
                            .profession
                        }
                      />
                      <Field
                        label="Length of Employment"
                        value={
                          applicant.applicationDetails
                            .lengthOfEmployment
                        }
                      />
                      <Field
                        label="Employer Contact Information"
                        value={
                          applicant.applicationDetails
                            .employerContact
                        }
                      />
                    </div>
                  </Section>

                  <Section title="Volunteer History">
                    <p className="slds-text-5 text-[var(--slds-g-color-text-default)] leading-relaxed">
                      {
                        applicant.applicationDetails
                          .volunteerHistory
                      }
                    </p>
                  </Section>

                  <Section title="Education & Academic Skills">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 mb-4">
                      <Field
                        label="Highest Level of Education"
                        value={
                          applicant.applicationDetails
                            .highestEducation
                        }
                      />
                      <Field
                        label="Math Proficiency"
                        value={
                          applicant.applicationDetails
                            .mathProficiency
                        }
                      />
                      <Field
                        label="Science Proficiency"
                        value={
                          applicant.applicationDetails
                            .scienceProficiency
                        }
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                          Subject Areas
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {applicant.applicationDetails.subjectAreas.map(
                            (s) => (
                              <Badge key={s} variant="neutral">
                                {s}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                          Preferred Age Groups
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {applicant.applicationDetails.preferredAgeGroups.map(
                            (s) => (
                              <Badge key={s} variant="neutral">
                                {s}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
                          Languages Fluent In
                        </p>
                        <LanguageProficiencyList
                          languages={
                            applicant.applicationDetails
                              .languagesFluent
                          }
                        />
                      </div>
                    </div>
                  </Section>

                  <Section title="Experience with Youth">
                    <div className="space-y-4">
                      <div>
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                          Describe a positive experience working
                          with young people
                        </p>
                        <p className="slds-text-5 text-[var(--slds-g-color-text-default)] leading-relaxed">
                          {
                            applicant.applicationDetails
                              .positiveExperience
                          }
                        </p>
                      </div>
                      <div>
                        <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                          How do you handle a student who is
                          struggling or disengaged?
                        </p>
                        <p className="slds-text-5 text-[var(--slds-g-color-text-default)] leading-relaxed">
                          {
                            applicant.applicationDetails
                              .handlingStruggles
                          }
                        </p>
                      </div>
                    </div>
                  </Section>

                  <Section title="Background Disclosure">
                    <Field
                      label="Convicted of a crime?"
                      value={
                        applicant.applicationDetails
                          .convictedOfCrime
                      }
                    />
                  </Section>
                </>
              )}

              {activeSection === "day-time" && (
                <Section
                  title="Availability Schedule"
                  first
                  action={
                    editingAvailability ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-full slds-text-3"
                          onClick={cancelAvailability}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 rounded-full slds-text-3 text-white"
                          style={{
                            backgroundColor:
                              "var(--color-brand-primary)",
                          }}
                          onClick={saveAvailability}
                        >
                          Save Changes
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full slds-text-3"
                        onClick={startEditingAvailability}
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                        Availability
                      </Button>
                    )
                  }
                >
                  <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] -mt-2 mb-4">
                    Tutoring takes place Monday–Thursday at West
                    Loop 6:15–7:15 PM and at Walsh-Morgan Park
                    6:15–7:15 PM and 7:15–8:15 PM.
                  </p>
                  <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] -mt-2 mb-4">
                    {availCount} of {AVAILABILITY_SLOT_COUNT}{" "}
                    slots selected
                  </p>
                  <div className="flex items-center gap-5 mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-alt-2)",
                          border:
                            "1px solid var(--color-brand-primary)",
                        }}
                      />
                      <span className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                        Available
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border: BORDER,
                        }}
                      />
                      <span className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                        Unavailable
                      </span>
                    </div>
                  </div>
                  <div
                    className="overflow-x-auto rounded-lg"
                    style={{ border: BORDER }}
                  >
                    <Table style={{ minWidth: 560 }}>
                      <TableHeader>
                        <TableRow
                          className="hover:bg-transparent"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                          }}
                        >
                          <TableHead
                            rowSpan={2}
                            className="px-4"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                              borderRight: BORDER,
                            }}
                          >
                            Day
                          </TableHead>
                          {AVAILABILITY_CAMPUSES.map((c) => (
                            <TableHead
                              key={c.campus}
                              colSpan={c.slots.length}
                              scope="colgroup"
                              className="text-center whitespace-nowrap"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                                borderRight: BORDER,
                              }}
                            >
                              {c.label}
                            </TableHead>
                          ))}
                        </TableRow>
                        <TableRow
                          className="hover:bg-transparent"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                          }}
                        >
                          {AVAILABILITY_CAMPUSES.flatMap((c) =>
                            c.slots.map((slot) => (
                              <TableHead
                                key={`${c.campus}-${slot}`}
                                scope="col"
                                className="text-center whitespace-nowrap"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                  borderRight: BORDER,
                                }}
                              >
                                {slot}
                              </TableHead>
                            )),
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {AVAILABILITY_DAYS.map((day) => (
                          <TableRow key={day} hoverable={false}>
                            <TableCell
                              className="px-4 font-medium"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                                borderRight: BORDER,
                              }}
                            >
                              {day}
                            </TableCell>
                            {AVAILABILITY_CAMPUSES.flatMap(
                              (c) =>
                                c.slots.map((slot) => {
                                  const key = availabilityKey(
                                    c.campus,
                                    day,
                                    slot,
                                  );
                                  const isAvail =
                                    shownAvailability.includes(
                                      key,
                                    );
                                  return (
                                    <TableCell
                                      key={key}
                                      className="text-center"
                                      style={{
                                        borderRight: BORDER,
                                      }}
                                    >
                                      <button
                                        type="button"
                                        aria-pressed={isAvail}
                                        aria-label={`${day}, ${c.label} ${slot}: ${isAvail ? "available" : "unavailable"}`}
                                        onClick={() =>
                                          toggleAvailabilityCell(
                                            key,
                                          )
                                        }
                                        disabled={
                                          !editingAvailability
                                        }
                                        className="w-8 h-8 rounded mx-auto block transition-colors"
                                        style={{
                                          backgroundColor:
                                            isAvail
                                              ? "var(--slds-g-color-background-alt-2)"
                                              : "var(--slds-g-color-background-base)",
                                          border: `1px solid ${isAvail ? "var(--color-brand-primary)" : "var(--slds-g-color-border-base-1)"}`,
                                          cursor:
                                            editingAvailability
                                              ? "pointer"
                                              : "default",
                                        }}
                                      >
                                        {isAvail && (
                                          <Check
                                            className="h-4 w-4 mx-auto"
                                            style={{
                                              color:
                                                "var(--color-brand-primary)",
                                            }}
                                          />
                                        )}
                                      </button>
                                    </TableCell>
                                  );
                                }),
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Section>
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-4">
                      <Field
                        label="References Requested"
                        value={String(references.length)}
                      />
                      <Field
                        label="Responses Received"
                        value={String(refsSubmitted)}
                      />
                      <Field
                        label="Minimum Required"
                        value={String(REFERENCES_MINIMUM)}
                      />
                      <Field
                        label="Completion"
                        value={
                          refsSubmitted >= REFERENCES_MINIMUM
                            ? "Complete"
                            : `${REFERENCES_MINIMUM - refsSubmitted} more response${REFERENCES_MINIMUM - refsSubmitted > 1 ? "s" : ""} needed`
                        }
                      />
                    </div>
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
                                    : "warning"
                                }
                              >
                                {ref.status === "submitted"
                                  ? "Response Received"
                                  : "Awaiting Response"}
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
                              disabled={
                                resendingRefId === ref.id
                              }
                              onClick={() =>
                                handleResendReference(ref)
                              }
                            >
                              <RotateCcw className="h-3 w-3" />
                              {resendingRefId === ref.id
                                ? "Sending…"
                                : "Resend Request"}
                            </Button>
                          )}
                        </div>
                      </div>
                      <div
                        className="flex items-center flex-wrap gap-x-6 gap-y-1 mt-3 pt-3"
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
                        <span className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                          {ref.status === "submitted"
                            ? `Received ${ref.submittedDate ?? ref.sentDate}`
                            : `Request sent ${ref.sentDate}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {activeSection === "documents" && (
                <>
                  <Section
                    title="Application Consents & Documents"
                    first
                    action={
                      <div className="flex items-center gap-2 w-40">
                        <Progress
                          value={
                            (docsDone / documents.length) * 100
                          }
                          trackTone="neutral"
                          className="h-1.5"
                        />
                        <span className="slds-text-3 font-semibold text-[var(--color-brand-primary)] whitespace-nowrap">
                          {docsDone}/{documents.length}
                        </span>
                      </div>
                    }
                  >
                    <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mb-4">
                      {docsDone} of {documents.length} documents
                      complete or approved
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
                              "Document Name",
                              "Document Type",
                              "Category",
                              "Completion Date",
                              "Status",
                              "Actions",
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
                            // Approve / Reject only while an uploaded
                            // document is waiting for staff validation.
                            const canReview =
                              doc.requiresApproval &&
                              doc.status === "pending-approval";
                            const hasFile = !!doc.fileLabel;
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
                                      DOC_STATUS_BADGE_VARIANT[
                                        doc.status
                                      ]
                                    }
                                  >
                                    {
                                      DOC_STATUS_LABEL[
                                        doc.status
                                      ]
                                    }
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  {canReview ? (
                                    <div className="flex items-center gap-1.5 justify-end">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 rounded-full slds-text-2"
                                        onClick={() =>
                                          reviewDocument(
                                            doc.id,
                                            "approved",
                                          )
                                        }
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 rounded-full slds-text-2"
                                        style={{
                                          color: "#c23934",
                                          borderColor:
                                            "#c23934",
                                        }}
                                        onClick={() =>
                                          reviewDocument(
                                            doc.id,
                                            "rejected",
                                          )
                                        }
                                      >
                                        Reject
                                      </Button>
                                    </div>
                                  ) : hasFile ? (
                                    <button
                                      className="inline-flex items-center gap-1 slds-text-3"
                                      style={{
                                        color:
                                          "var(--color-brand-primary)",
                                      }}
                                      onClick={() =>
                                        toast.success(
                                          `Downloading ${doc.name}…`,
                                        )
                                      }
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
                </>
              )}

              {activeSection === "checklist" && (
                <>
                  <Section
                    title="Match Readiness"
                    first
                    action={
                      <Badge
                        variant={
                          readyForMatch ? "success" : "warning"
                        }
                        size="lg"
                      >
                        {readyForMatch
                          ? "Ready"
                          : "In Progress"}
                      </Badge>
                    }
                  >
                    <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                      Every required item must pass before this
                      applicant can be matched with a youth.
                    </p>
                    <p className="slds-text-3 text-[var(--slds-g-color-text-default)] mt-1">
                      {matchAvailabilityNote}
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
                          <Badge variant="neutral">
                            Required
                          </Badge>
                        </div>
                        {item.info && (
                          <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1">
                            {item.info}
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
                        {item.manual &&
                          item.result === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 rounded-full slds-text-2"
                                onClick={() =>
                                  setChecklistResult(
                                    item,
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
                                    item,
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
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleSave} disabled={!isDirty}>
                Save
              </Button>
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
            <AlertDialogTitle>
              Approve Application
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to approve {applicant.name}'s
              application. They will receive a confirmation
              email and be moved to the active volunteer roster.
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
                size="md"
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

      {/* Inactive tutor confirmation */}
      <AlertDialog
        open={inactiveConfirmOpen}
        onOpenChange={(open) => !open && cancelInactive()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Mark Tutor Inactive?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The tutor will be marked inactive and will not be
              available for a new match while inactive. Also,
              any existing tutor matches will be ended.
            </AlertDialogDescription>
            <AlertDialogDescription>
              The applicant’s completed application and approval
              information will remain unchanged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                // Close ourselves so onOpenChange (= Cancel) never fires.
                e.preventDefault();
                confirmInactive();
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sensitive data access — SSN reveal */}
      <Dialog
        open={ssnAccessModalOpen}
        onOpenChange={(open) => {
          setSsnAccessModalOpen(open);
          if (!open) setSsnAccessConfirmed(false);
        }}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Sensitive Data Access</DialogTitle>
            <DialogDescription>
              Social Security Number
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <Alert variant="error">
              <Shield />
              <AlertDescription>
                You are about to view a sensitive personal
                identifier. Access to this field is{" "}
                <span className="font-semibold text-[var(--slds-g-color-text-default)]">
                  logged and audited
                </span>{" "}
                in compliance with Mercy Home data protection
                policies.
              </AlertDescription>
            </Alert>

            <div
              className="flex flex-col gap-2 rounded-lg border px-4 py-3"
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
                borderColor:
                  "var(--slds-g-color-border-base-1)",
              }}
            >
              <div className="flex items-center justify-between slds-text-3">
                <span className="text-[var(--slds-g-color-text-weak)]">
                  Accessed by
                </span>
                <span className="font-semibold text-[var(--slds-g-color-text-default)]">
                  Current User
                </span>
              </div>
              <div className="flex items-center justify-between slds-text-3">
                <span className="text-[var(--slds-g-color-text-weak)]">
                  Timestamp
                </span>
                <span className="font-semibold text-[var(--slds-g-color-text-default)]">
                  {ssnAccessTime}
                </span>
              </div>
              <div className="flex items-center justify-between slds-text-3">
                <span className="text-[var(--slds-g-color-text-weak)]">
                  Field
                </span>
                <span className="font-semibold text-[var(--slds-g-color-text-default)] font-mono">
                  SSN ·{" "}
                  {applicant.applicationDetails.ssn?.replace(
                    /\d/g,
                    "•",
                  )}
                </span>
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <Checkbox
                checked={ssnAccessConfirmed}
                onCheckedChange={(v) =>
                  setSsnAccessConfirmed(v === true)
                }
              />
              <span className="slds-text-4 text-[var(--slds-g-color-text-default)]">
                I understand that this access is being recorded
                and that I am authorised to view this
                applicant's Social Security Number for
                legitimate program purposes.
              </span>
            </label>
          </DialogBody>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              disabled={!ssnAccessConfirmed}
              style={{ backgroundColor: "#A82031" }}
              onClick={() => {
                setSsnRevealed(true);
                setSsnAccessModalOpen(false);
                setSsnAccessConfirmed(false);
              }}
            >
              Reveal SSN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}