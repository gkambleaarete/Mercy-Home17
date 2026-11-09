import { useRef, useState } from "react";
import { AlertCircle, Pencil, Printer } from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { TransitionSummarySection } from "./TransitionSummarySection";
import { ItpOverviewSection } from "./ItpOverviewSection";
import {
  KeyStaffHistorySection,
  staffFormDirty,
  type StaffDraftRow,
  type StaffFormState,
} from "./KeyStaffHistorySection";
import { useUnsavedChangesGuard } from "../../lib/useUnsavedChangesGuard";
import {
  advanceExternalSummary,
  updateTransitionSummaryContent,
  type ExternalTransitionSummaryRecord,
  type WorkflowAction,
} from "../../data/transitionSummaryStore";
import { useItpGoalSnapshot } from "../../data/itpGoalStore";
import {
  PROTOTYPE_ACTOR_NOTE,
  captureSnapshot,
  resolveExternalReport,
} from "../../data/externalReportModel";
import { CURRENT_USER_NAME } from "../../data/mockProgramsData";
import { printExternalReport } from "../../lib/printExternalReport";
import type {
  TransitionSummaryNarrative,
  TransitionSummaryStaff,
} from "../../data/mockTransitionSummary";

// External Transition Summary editing (US 20103): narratives and Key Staff
// History on the existing report layout. Edit opens a draft; Save writes
// only the sections that changed (merged into the latest record by the
// store, which rechecks id, owner, type and Finalized status); Cancel
// drops the draft and returns to the saved report view.

/** Sections offered when absent. Saved sections (any title) are kept as
 *  they are, in their saved order. */
const DEFAULT_NARRATIVE_TITLES = [
  "PTP & Goals",
  "Advocate Commentary",
  "Therapy Commentary",
  "Mental Health Commentary",
  "School & Career Commentary",
];

type NarrativeDraft = TransitionSummaryNarrative & {
  saved: boolean;
};

function narrativeDraft(
  saved: TransitionSummaryNarrative[],
): NarrativeDraft[] {
  const titles = new Set(saved.map((n) => n.title));
  return [
    ...saved.map((n) => ({ ...n, saved: true })),
    ...DEFAULT_NARRATIVE_TITLES.filter(
      (t) => !titles.has(t),
    ).map((title) => ({
      title,
      content: "",
      saved: false,
    })),
  ];
}

/** Saved sections always; an offered section only once it has text. */
const narrativesToSave = (
  d: NarrativeDraft[],
): TransitionSummaryNarrative[] =>
  d
    .filter((n) => n.saved || n.content.trim() !== "")
    .map(({ title, content }) => ({ title, content }));

/** Legacy rows have no id: a draft key keeps their position; nothing is
 *  rewritten unless the row itself is modified. */
const staffDraft = (
  rows: TransitionSummaryStaff[],
): StaffDraftRow[] =>
  rows.map((r, i) => ({ ...r, _key: r.id ?? `legacy-${i}` }));
const staffToSave = (
  rows: StaffDraftRow[],
): TransitionSummaryStaff[] => rows.map(({ _key, ...r }) => r);

const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

/** The next workflow step for each status, with its button label. */
const NEXT_ACTION: Partial<
  Record<
    string,
    { action: WorkflowAction; label: string; confirm: string }
  >
> = {
  Draft: {
    action: "Ready for Review",
    label: "Ready for Review",
    confirm:
      "This captures the current report, including its ITPs and goals, as the version for review. The report becomes read-only.",
  },
  "Ready for Review": {
    action: "Reviewed",
    label: "Reviewed",
    confirm:
      "This marks the captured report version as reviewed.",
  },
  Reviewed: {
    action: "Finalized",
    label: "Finalize",
    confirm:
      "This finalizes the reviewed report version. Finalized reports can't be edited.",
  },
};

/** MM/DD/YYYY h:mm AM/PM */
function stamp(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const h = d.getHours() % 12 || 12;
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()} ${h}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() >= 12 ? "PM" : "AM"}`;
}

export function ExternalSummaryEditor({
  record,
  youthId,
  onBack,
}: {
  record: ExternalTransitionSummaryRecord;
  youthId: string;
  onBack: () => void;
}) {
  // Only Draft content is editable; later statuses show the captured version.
  const readOnly = record.status !== "Draft";
  const savedNarratives = record.content.narratives;
  const savedStaff = record.content.keyStaffHistory;
  const goalSnapshot = useItpGoalSnapshot();
  const resolved = resolveExternalReport(record, goalSnapshot);

  const [editing, setEditing] = useState(false);
  const [narr, setNarr] = useState<NarrativeDraft[]>(() =>
    narrativeDraft(savedNarratives),
  );
  const [staff, setStaff] = useState<StaffDraftRow[]>(() =>
    staffDraft(savedStaff),
  );
  const [staffForm, setStaffForm] =
    useState<StaffFormState | null>(null);
  const [saveError, setSaveError] = useState("");
  const [confirming, setConfirming] = useState(false);
  // The confirmation opens from state (no trigger), so focus is returned
  // to the action button explicitly when it closes.
  const confirmReturnFocus = useRef<HTMLElement | null>(null);

  const narrChanged = !same(
    narrativesToSave(narr),
    savedNarratives,
  );
  const staffChanged = !same(staffToSave(staff), savedStaff);
  const dirty =
    editing &&
    !readOnly &&
    (narrChanged || staffChanged || staffFormDirty(staffForm));

  const resetDraft = () => {
    setNarr(narrativeDraft(savedNarratives));
    setStaff(staffDraft(savedStaff));
    setStaffForm(null);
    setSaveError("");
  };
  // Leaving the report (route change, Back/Forward, another section, or
  // Back to Transition Summaries) while the draft has changes confirms
  // first; Discard drops the draft.
  const leaveGuard = useUnsavedChangesGuard(dirty, resetDraft);

  const startEdit = () => {
    resetDraft();
    setEditing(true);
  };
  const cancel = () => {
    resetDraft();
    setEditing(false);
  };

  const save = () => {
    if (staffForm) {
      setSaveError(
        "Finish or cancel the open dialog before saving.",
      );
      return;
    }
    if (!narrChanged && !staffChanged) {
      setSaveError("");
      toast.info("No changes to save.");
      return;
    }
    const narratives = narrativesToSave(narr);
    const keyStaffHistory = staffToSave(staff);
    const result = updateTransitionSummaryContent({
      id: record.id,
      youthId,
      type: "External",
      content: {
        ...(narrChanged ? { narratives } : {}),
        ...(staffChanged ? { keyStaffHistory } : {}),
      },
    });
    if (!result.ok) {
      setSaveError(result.message);
      return;
    }
    setSaveError("");
    setNarr(narrativeDraft(narratives));
    setStaff(staffDraft(keyStaffHistory));
    toast.success("Transition Summary saved.");
  };

  const next = NEXT_ACTION[record.status];
  const advance = () => {
    setConfirming(false);
    if (!next) return;
    let snapshot: unknown;
    if (next.action === "Ready for Review") {
      const cap = captureSnapshot(
        record,
        goalSnapshot,
        new Date(),
      );
      if (!cap.ok) {
        setSaveError(cap.message);
        return;
      }
      snapshot = cap.snapshot;
    }
    const result = advanceExternalSummary({
      id: record.id,
      youthId,
      action: next.action,
      expectedRevision: record.revision ?? 0,
      snapshot,
      // The prototype's current-user constant; there is no sign-in or
      // reviewer permission model to enforce.
      actor: CURRENT_USER_NAME,
    });
    if (!result.ok) {
      setSaveError(result.message);
      return;
    }
    setSaveError("");
    toast.success(`Transition Summary marked ${next.action}.`);
  };

  const print = () => {
    if (!resolved.ok) return;
    if (!printExternalReport(resolved.model))
      setSaveError(
        "The print window was blocked by the browser.",
      );
  };

  if (!resolved.ok)
    return (
      <div className="space-y-4">
        <Alert variant="error" role="alert">
          <AlertCircle />
          <AlertTitle>Report version can't be shown</AlertTitle>
          <AlertDescription>
            {resolved.message}
          </AlertDescription>
        </Alert>
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            Back to Transition Summaries
          </Button>
        </div>
      </div>
    );
  const model = resolved.model;

  const description = (
    <span className="block space-y-1">
      <span className="block">
        {model.source === "live"
          ? "Draft — shows the current saved report and current ITP and goal data."
          : model.source === "captured"
            ? `Read-only — report version captured ${stamp(model.capturedAt)} at Ready for Review.`
            : "Finalized before report versions were captured — saved content is read-only and ITP/goal history isn't available."}
      </span>
      {model.events.map((e, i) => (
        <span key={i} className="block">
          {e.action}: {stamp(e.at)}
          {e.actor
            ? ` · ${e.actor} (${PROTOTYPE_ACTOR_NOTE})`
            : ""}
        </span>
      ))}
    </span>
  );

  return (
    <div className="space-y-4">
      {saveError && (
        <Alert variant="error" role="alert">
          <AlertCircle />
          <AlertTitle>Transition Summary not saved</AlertTitle>
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}
      <TransitionSummarySection
        summary={{ ...model.content, status: model.status }}
        onBack={onBack}
        description={description}
        headerAction={
          !readOnly && !editing ? (
            <Button
              type="button"
              variant="outline-primary"
              size="sm"
              onClick={startEdit}
            >
              <Pencil />
              Edit
            </Button>
          ) : undefined
        }
        itpOverview={
          <ItpOverviewSection
            itp={model.itp}
            youthId={youthId}
            summaryId={record.id}
            canManage={!readOnly}
          />
        }
        staffHistory={
          <KeyStaffHistorySection
            rows={
              editing
                ? staff
                : staffDraft(model.content.keyStaffHistory)
            }
            editing={editing && !readOnly}
            form={staffForm}
            onFormChange={setStaffForm}
            onApply={applyStaff}
          />
        }
        narratives={
          editing && !readOnly ? (
            <>
              {narr.map((n, i) => (
                <div key={i} className="space-y-2">
                  <h4
                    id={`ets-narr-${i}-label`}
                    className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)]"
                  >
                    {n.title}
                  </h4>
                  <Textarea
                    id={`ets-narr-${i}`}
                    aria-labelledby={`ets-narr-${i}-label`}
                    value={n.content}
                    onChange={(e) =>
                      setNarr((d) =>
                        d.map((x, j) =>
                          j === i
                            ? { ...x, content: e.target.value }
                            : x,
                        ),
                      )
                    }
                  />
                  {i < narr.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </>
          ) : undefined
        }
        footer={
          editing && !readOnly ? (
            // Workflow and Print are offered only outside editing, so
            // unsaved edits must be saved or cancelled first.
            <>
              <Button
                type="button"
                variant="outline"
                onClick={cancel}
              >
                Cancel
              </Button>
              <Button type="button" onClick={save}>
                Save
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={print}
              >
                <Printer />
                Print
              </Button>
              {next && (
                <Button
                  type="button"
                  onClick={(e) => {
                    confirmReturnFocus.current =
                      e.currentTarget;
                    setConfirming(true);
                  }}
                >
                  {next.label}
                </Button>
              )}
            </>
          )
        }
      />
      <AlertDialog
        open={confirming}
        onOpenChange={setConfirming}
      >
        <AlertDialogContent
          onCloseAutoFocus={(e) => {
            const el = confirmReturnFocus.current;
            if (el?.isConnected) {
              e.preventDefault();
              el.focus();
            }
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              {next ? `Mark as ${next.action}?` : ""}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {next?.confirm}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={advance}>
              {next?.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {leaveGuard}
    </div>
  );

  function applyStaff(
    key: string,
    row: TransitionSummaryStaff,
  ) {
    setStaff((rows) =>
      rows.some((r) => r._key === key)
        ? rows.map((r) =>
            r._key === key ? { ...row, _key: key } : r,
          )
        : [...rows, { ...row, _key: key }],
    );
  }
}