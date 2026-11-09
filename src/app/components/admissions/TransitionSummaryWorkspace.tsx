import { useState } from "react";
import { toast } from "sonner@2.0.3";
import {
  AlertCircle,
  ArrowLeft,
  FileText,
  Plus,
  UserX,
} from "@/app/lib/lucide-icons";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { EmptyState } from "../ui/empty-state";
import { Label } from "../ui/label";
import { PaginationInfo } from "../ui/pagination";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { TablePaginationBar } from "../ui/table-toolbar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { ExternalSummaryEditor } from "./ExternalSummaryEditor";
import {
  InternalTransitionDetailsForm,
  type DetailsErrors,
} from "./InternalTransitionDetailsForm";
import { InternalTransitionSummaryTab } from "./InternalTransitionSummaryTab";
import {
  TransitionPlanSection,
  type PlanDialogState,
} from "./TransitionPlanSection";
import {
  TransitionRecommendationsSection,
  recommendationFormDirty,
  type RecommendationFormState,
} from "./TransitionRecommendationsSection";
import {
  TransitionContactsSection,
  contactFormDirty,
  type ContactFormState,
} from "./TransitionContactsSection";
import {
  communityCareContactOptions,
  youthProgramOptions,
} from "../../data/transitionSummaryDetailsSources";
import { formatMdy } from "../../lib/dateFormat";
import { useUnsavedChangesGuard } from "../../lib/useUnsavedChangesGuard";
import type { YouthRef } from "../../lib/youthIdentity";
import {
  createTransitionSummary,
  getTransitionSummary,
  getTransitionSummaryLoadIssue,
  isValidMdy,
  updateTransitionSummaryContent,
  type InternalTransitionDetails,
  type TransitionContact,
  type InternalTransitionSummarySection,
  type TransitionRecommendation,
  type PlanConnection,
  newTransitionSummaryId,
  transitionSummariesForYouth,
  useTransitionSummarySnapshot,
  type ExternalTransitionSummaryContent,
  type InternalTransitionSummaryRecord,
  type TransitionSummaryRecord,
  type TransitionSummaryType,
} from "../../data/transitionSummaryStore";

// Treatment Planning > Transition Summary (US 20101 / US 20103).
// Lists the current youth's saved summaries, creates a Draft only on an
// explicit confirm, and opens a selected record by id + expected owner +
// expected type. Mount with key={youth.id} so selection never carries over
// to another youth. Nothing here writes on render, open or tab switch.

const PAGE_SIZE = 10;

const TYPE_LABEL: Record<TransitionSummaryType, string> = {
  Internal: "Internal Transition Summary",
  External: "External Transition Summary",
};

/** MM/DD/YYYY h:mm AM/PM (Mercy Home date/time standard). */
function formatUpdated(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const h = d.getHours() % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${formatMdy(d)} ${h}:${m} ${d.getHours() >= 12 ? "PM" : "AM"}`;
}

/** New External content: only the verified youth name; the rest is empty. */
function emptyExternalContent(
  youth: YouthRef,
): ExternalTransitionSummaryContent {
  return {
    youthName: youth.name,
    dateOfBirth: "",
    admissionDate: "",
    transitionDate: "",
    lengthOfStay: "",
    generatedDate: "",
    finalizedBy: "",
    finalizedDate: "",
    programHistory: [],
    keyStaffHistory: [],
    narratives: [],
  };
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant={status === "Finalized" ? "success" : "neutral"}
      bordered
    >
      {status}
    </Badge>
  );
}

export function TransitionSummaryWorkspace({
  youth,
  initialSummaryId,
}: {
  /** null when the profile can't be verified as a Youth Constituent. */
  youth: YouthRef | null;
  /** Deep link to an External summary; ownership/type rechecked on open. */
  initialSummaryId?: string;
}) {
  if (!youth) {
    return (
      <EmptyState
        icon={UserX}
        tone="warning"
        title="Transition Summaries are unavailable"
        description="This profile could not be confirmed as a Youth constituent, so no summaries can be shown or created."
      />
    );
  }
  return (
    <Workspace
      youth={youth}
      initialSummaryId={initialSummaryId}
    />
  );
}

function Workspace({
  youth,
  initialSummaryId,
}: {
  youth: YouthRef;
  initialSummaryId?: string;
}) {
  const snapshot = useTransitionSummarySnapshot();
  const loadIssue = getTransitionSummaryLoadIssue();
  const [selected, setSelected] = useState<{
    id: string;
    type: TransitionSummaryType;
  } | null>(
    initialSummaryId
      ? { id: initialSummaryId, type: "External" }
      : null,
  );
  const [page, setPage] = useState(1);

  // ── Create dialog ──
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<
    TransitionSummaryType | ""
  >("");
  const [createError, setCreateError] = useState("");

  const openCreate = () => {
    setCreateType("");
    setCreateError("");
    setCreateOpen(true);
  };

  const confirmCreate = () => {
    if (!createType) return;
    const id = newTransitionSummaryId();
    const result =
      createType === "External"
        ? createTransitionSummary({
            id,
            youthId: youth.id,
            type: "External",
            content: emptyExternalContent(youth),
          })
        : createTransitionSummary({
            id,
            youthId: youth.id,
            type: "Internal",
            content: {},
          });
    if (!result.ok) {
      // Keep the dialog and the chosen type so the user can retry.
      setCreateError(result.message);
      return;
    }
    setCreateOpen(false);
    setSelected({
      id: result.record.id,
      type: result.record.type,
    });
  };

  // ── Selected record: ownership and type are rechecked on every render ──
  if (selected) {
    const record = getTransitionSummary(snapshot, selected.id, {
      youthId: youth.id,
      type: selected.type,
    });
    const back = () => setSelected(null);
    if (!record) {
      return (
        <div className="flex flex-col items-center gap-4">
          <EmptyState
            icon={AlertCircle}
            tone="error"
            title="Transition Summary not found"
            description="This summary could not be found for this youth."
          />
          <Button
            type="button"
            variant="outline"
            onClick={back}
          >
            <ArrowLeft />
            Back to Transition Summaries
          </Button>
        </div>
      );
    }
    return record.type === "External" ? (
      <ExternalSummaryEditor
        record={record}
        youthId={youth.id}
        onBack={back}
      />
    ) : (
      <InternalSummaryView
        record={record}
        youthId={youth.id}
        onBack={back}
      />
    );
  }

  // ── List ──
  const rows: TransitionSummaryRecord[] = loadIssue
    ? []
    : transitionSummariesForYouth(snapshot, youth.id).sort(
        (a, b) => b.updatedAt.localeCompare(a.updatedAt),
      );
  const totalPages = Math.max(
    1,
    Math.ceil(rows.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const showStart = rows.length
    ? (safePage - 1) * PAGE_SIZE + 1
    : 0;
  const showEnd = (safePage - 1) * PAGE_SIZE + pageRows.length;

  return (
    <div className="space-y-4">
      <Card variant="section">
        <CardHeader>
          <CardTitle className="slds-section-title text-[var(--slds-g-color-text-default)]">
            Transition Summaries
          </CardTitle>
          <CardDescription className="slds-text-4">
            Internal and External Transition Summaries for{" "}
            {youth.name}.
          </CardDescription>
          <CardAction>
            <Button
              type="button"
              onClick={openCreate}
              disabled={!!loadIssue}
            >
              <Plus />
              Create Transition Summary
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="pt-4">
          {loadIssue ? (
            <Alert variant="error">
              <AlertCircle />
              <AlertTitle>
                Saved Transition Summaries can't be read
              </AlertTitle>
              <AlertDescription>
                To protect the saved summaries, they aren't
                shown and new summaries can't be created right
                now. Contact support if this continues.
              </AlertDescription>
            </Alert>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={FileText}
              tone="brand"
              title="No Transition Summaries yet"
              description="Use Create Transition Summary to start an Internal or External Transition Summary for this youth."
            />
          ) : (
            <Card variant="container">
              <Table>
                <TableHeader>
                  <TableRow hoverable={false}>
                    {[
                      "Summary ID",
                      "Type",
                      "Status",
                      "Last Updated",
                      "Actions",
                    ].map((c) => (
                      <TableHead key={c} variant="slds">
                        {c}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.id}</TableCell>
                      <TableCell wrap>
                        {TYPE_LABEL[r.type]}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell>
                        {formatUpdated(r.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label={`Open ${TYPE_LABEL[r.type]} ${r.id}`}
                          onClick={() =>
                            setSelected({
                              id: r.id,
                              type: r.type,
                            })
                          }
                        >
                          Open
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <CardContent size="sm">
                {totalPages > 1 ? (
                  <TablePaginationBar
                    className="w-full"
                    start={showStart}
                    end={showEnd}
                    total={rows.length}
                    countLabel="Transition Summaries"
                    currentPage={safePage}
                    totalPages={totalPages}
                    onPrevious={() => setPage(safePage - 1)}
                    onNext={() => setPage(safePage + 1)}
                  />
                ) : (
                  <PaginationInfo
                    start={showStart}
                    end={showEnd}
                    total={rows.length}
                    label="Transition Summaries"
                  />
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Create Transition Summary</DialogTitle>
            <DialogDescription>
              Choose the type of summary to create for{" "}
              {youth.name}. It starts as a Draft.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <RadioGroup
              aria-label="Transition Summary type"
              value={createType}
              onValueChange={(v) => {
                setCreateType(v as TransitionSummaryType);
                setCreateError("");
              }}
            >
              {(["Internal", "External"] as const).map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-2"
                >
                  <RadioGroupItem
                    value={t}
                    id={`ts-create-${t}`}
                  />
                  <Label htmlFor={`ts-create-${t}`}>
                    {TYPE_LABEL[t]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {createError && (
              <Alert variant="error" role="alert">
                <AlertCircle />
                <AlertTitle>
                  Transition Summary not created
                </AlertTitle>
                <AlertDescription>
                  {createError}
                </AlertDescription>
              </Alert>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmCreate}
              disabled={!createType}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const INTERNAL_TABS = [
  {
    value: "checklist",
    label: "Checklist",
    empty: "Checklist items are not available yet.",
  },
] as const;

/** Summary section without empty narratives / an empty list, so untouched
 *  fields are never stored as defaults and "" vs missing isn't a change. */
function normalizeSummary(
  s: InternalTransitionSummarySection,
): InternalTransitionSummarySection {
  const out: InternalTransitionSummarySection = {};
  if (s.reasonForTransition)
    out.reasonForTransition = s.reasonForTransition;
  if (s.involvementSummary)
    out.involvementSummary = s.involvementSummary;
  if (s.recommendations?.length)
    out.recommendations = s.recommendations;
  return out;
}

/** Drops empty values so an untouched or cleared field is never saved as a
 *  default and "" vs missing doesn't count as a change. */
function normalizeDetails(
  d: InternalTransitionDetails,
): InternalTransitionDetails {
  return Object.fromEntries(
    Object.entries(d).filter(
      ([, v]) => v !== undefined && v !== "",
    ),
  ) as InternalTransitionDetails;
}

const sameDetails = (
  a: InternalTransitionDetails,
  b: InternalTransitionDetails,
) => {
  const [x, y] = [normalizeDetails(a), normalizeDetails(b)];
  const keys = new Set([...Object.keys(x), ...Object.keys(y)]);
  return [...keys].every(
    (k) =>
      x[k as keyof InternalTransitionDetails] ===
      y[k as keyof InternalTransitionDetails],
  );
};

/** Entered values must be valid; an existing saved ID that is no longer
 *  available may stay as saved, but can't be newly chosen. */
function validateDetails(
  d: InternalTransitionDetails,
  saved: InternalTransitionDetails,
  youthId: string,
): DetailsErrors {
  const e: DetailsErrors = {};
  if (d.transitionDate && !isValidMdy(d.transitionDate))
    e.transitionDate =
      "Enter a complete, valid date (MM/DD/YYYY).";
  if (
    d.programId !== undefined &&
    d.programId !== saved.programId &&
    !youthProgramOptions(youthId).some(
      (o) => o.id === d.programId,
    )
  )
    e.programId =
      "Choose a program associated with this youth.";
  if (
    d.communityCareContactId !== undefined &&
    d.communityCareContactId !== saved.communityCareContactId &&
    !communityCareContactOptions().some(
      (o) => o.id === d.communityCareContactId,
    )
  )
    e.communityCareContactId =
      "Choose an active Community Care Staff member.";
  return e;
}

function InternalSummaryView({
  record,
  youthId,
  onBack,
}: {
  record: InternalTransitionSummaryRecord;
  youthId: string;
  onBack: () => void;
}) {
  const readOnly = record.status === "Finalized";
  // Saved baseline + draft live above the tabs, so switching tabs keeps
  // unsaved Details changes. Nothing is written until Save.
  const [saved, setSaved] = useState<InternalTransitionDetails>(
    () => normalizeDetails(record.content.details ?? {}),
  );
  const [draft, setDraft] =
    useState<InternalTransitionDetails>(saved);
  // Contacts: saved list, draft list, and the open Add/Modify form (also
  // part of the draft, so an unfinished contact is protected too).
  const [savedContacts, setSavedContacts] = useState<
    TransitionContact[]
  >(() => record.content.contacts ?? []);
  const [contacts, setContacts] =
    useState<TransitionContact[]>(savedContacts);
  const [contactForm, setContactForm] =
    useState<ContactFormState | null>(null);
  // Summary tab: narratives + Recommendations, and the open
  // Recommendation form. PTPs are read live and are not part of the draft.
  const [savedSummary, setSavedSummary] =
    useState<InternalTransitionSummarySection>(() =>
      normalizeSummary(record.content.summary ?? {}),
    );
  const [summary, setSummary] =
    useState<InternalTransitionSummarySection>(savedSummary);
  const [recForm, setRecForm] =
    useState<RecommendationFormState | null>(null);
  // Plan: connections staged in the draft; the Connection dialog's own
  // field state is internal to the form, so an open dialog counts as
  // unsaved work.
  const [savedPlan, setSavedPlan] = useState<PlanConnection[]>(
    () => record.content.planConnections ?? [],
  );
  const [plan, setPlan] = useState<PlanConnection[]>(savedPlan);
  const [planDialog, setPlanDialog] =
    useState<PlanDialogState | null>(null);
  const [tab, setTab] = useState("details");
  const [errors, setErrors] = useState<DetailsErrors>({});
  const [saveError, setSaveError] = useState("");
  const [saveErrorOnDetails, setSaveErrorOnDetails] =
    useState(false);
  const planChanged =
    JSON.stringify(plan) !== JSON.stringify(savedPlan);
  const summaryChanged =
    JSON.stringify(normalizeSummary(summary)) !==
    JSON.stringify(savedSummary);
  const contactsChanged =
    JSON.stringify(contacts) !== JSON.stringify(savedContacts);
  const detailsChanged = !sameDetails(draft, saved);
  const dirty =
    !readOnly &&
    (!sameDetails(draft, saved) ||
      contactsChanged ||
      contactFormDirty(contactForm) ||
      summaryChanged ||
      recommendationFormDirty(recForm) ||
      planChanged ||
      !!planDialog);

  // Confirms before anything that would unmount this editor while it has
  // unsaved changes (route change, Back/Forward, another profile or
  // Treatment Planning section); keeps the native reload/close warning.
  const leaveGuard = useUnsavedChangesGuard(dirty, () => {
    setDraft(saved);
    setContacts(savedContacts);
    setContactForm(null);
    setSummary(savedSummary);
    setRecForm(null);
    setPlan(savedPlan);
    setPlanDialog(null);
  });

  const applyRecommendation = (r: TransitionRecommendation) =>
    setSummary((s) => {
      const list = s.recommendations ?? [];
      return {
        ...s,
        recommendations: list.some((x) => x.id === r.id)
          ? list.map((x) => (x.id === r.id ? r : x))
          : [...list, r],
      };
    });

  const applyContact = (c: TransitionContact) =>
    setContacts((list) =>
      list.some((x) => x.id === c.id)
        ? list.map((x) => (x.id === c.id ? c : x))
        : [...list, c],
    );

  const save = (close: boolean) => {
    setSaveErrorOnDetails(false);
    if (contactForm || recForm || planDialog) {
      // An open dialog must be applied or cancelled first.
      setSaveError(
        "Finish or cancel the open dialog before saving.",
      );
      return;
    }
    if (!dirty) {
      // Nothing changed — don't rewrite the record or its Last Updated.
      setSaveError("");
      if (close) onBack();
      else toast.info("No changes to save.");
      return;
    }
    const errs = validateDetails(draft, saved, youthId);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setSaveError(
        tab === "details"
          ? "Fix the highlighted fields, then save again."
          : "A field on the Details tab needs attention before this summary can be saved.",
      );
      setSaveErrorOnDetails(true);
      return;
    }
    const nextSummary = normalizeSummary(summary);
    const details = normalizeDetails(draft);
    // The store rechecks id, owner, type and Finalized status against the
    // latest saved state and merges into the latest content. Contacts are
    // written only when they changed, so no empty default is stored.
    const result = updateTransitionSummaryContent({
      id: record.id,
      youthId,
      type: "Internal",
      content: {
        ...(detailsChanged ||
        record.content.details !== undefined
          ? { details }
          : {}),
        ...(contactsChanged ? { contacts } : {}),
        ...(summaryChanged ? { summary: nextSummary } : {}),
        ...(planChanged ? { planConnections: plan } : {}),
      },
    });
    if (!result.ok) {
      setSaveError(result.message);
      return;
    }
    setSaveError("");
    setSaved(details);
    setDraft(details);
    setSavedContacts(contacts);
    setSavedSummary(nextSummary);
    setSavedPlan(plan);
    setSummary(nextSummary);
    toast.success("Transition Summary saved.");
    if (close) onBack();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card variant="section">
        <CardHeader>
          <CardTitle className="slds-section-title text-[var(--slds-g-color-text-default)]">
            Internal Transition Summary
          </CardTitle>
          <CardDescription className="slds-text-4">
            {record.id} · Last updated{" "}
            {formatUpdated(record.updatedAt)}
            {readOnly &&
              " · Finalized summaries are read-only."}
          </CardDescription>
          <CardAction>
            <StatusBadge status={record.status} />
          </CardAction>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {saveError && (
            <Alert
              variant="error"
              role="alert"
              action={
                saveErrorOnDetails && tab !== "details"
                  ? {
                      label: "Go to Details",
                      onClick: () => setTab("details"),
                    }
                  : undefined
              }
            >
              <AlertCircle />
              <AlertTitle>
                Transition Summary not saved
              </AlertTitle>
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList variant="underline" separated>
              <TabsTrigger value="details" variant="underline">
                Details
              </TabsTrigger>
              <TabsTrigger value="summary" variant="underline">
                Summary
              </TabsTrigger>
              <TabsTrigger value="plan" variant="underline">
                Plan
              </TabsTrigger>
              {INTERNAL_TABS.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  variant="underline"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="details" className="pt-4">
              <InternalTransitionDetailsForm
                youthId={youthId}
                draft={draft}
                saved={saved}
                readOnly={readOnly}
                errors={errors}
                onChange={(next) => {
                  setDraft(next);
                  setErrors({});
                }}
                contactsSection={
                  <TransitionContactsSection
                    contacts={contacts}
                    readOnly={readOnly}
                    form={contactForm}
                    onFormChange={setContactForm}
                    onApply={applyContact}
                  />
                }
              />
            </TabsContent>
            <TabsContent value="summary" className="pt-4">
              <InternalTransitionSummaryTab
                youthId={youthId}
                draft={summary}
                readOnly={readOnly}
                onChange={setSummary}
                recommendationsSection={
                  <TransitionRecommendationsSection
                    recommendations={
                      summary.recommendations ?? []
                    }
                    readOnly={readOnly}
                    form={recForm}
                    onFormChange={setRecForm}
                    onApply={applyRecommendation}
                  />
                }
              />
            </TabsContent>
            <TabsContent value="plan" className="pt-4">
              <TransitionPlanSection
                connections={plan}
                readOnly={readOnly}
                dialog={planDialog}
                onDialogChange={setPlanDialog}
                onChange={setPlan}
              />
            </TabsContent>
            {INTERNAL_TABS.map((t) => (
              <TabsContent
                key={t.value}
                value={t.value}
                className="pt-4"
              >
                <EmptyState
                  icon={FileText}
                  title={`No ${t.label.toLowerCase()} information yet`}
                  description={t.empty}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      <div className="flex items-center justify-end gap-2">
        {readOnly ? (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            <ArrowLeft />
            Back to Transition Summaries
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline-primary"
              onClick={() => save(false)}
            >
              Save
            </Button>
            <Button type="button" onClick={() => save(true)}>
              Save &amp; Close
            </Button>
          </>
        )}
      </div>
      {leaveGuard}
    </div>
  );
}