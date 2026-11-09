// US 20185 Chunk 2 — Checklist section inside Create Handover.
// UI prototype: checklist responses live in the dialog's draft state only.
// Selecting a checklist is optional ("No checklist") — a UI assumption, as
// the ticket doesn't make selection mandatory.

import { useEffect, useState } from "react";
import { ListChecks } from "@/app/lib/lucide-icons";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
import {
  EMPTY_HANDOVER_CHECKLIST_DRAFT,
  type HandoverChecklistDraft,
  type ShiftHandoverChecklist,
  applicableChecklists,
  buildChecklistResult,
  completionStatus,
  draftHasResponses,
  handoverShiftToChecklistShift,
  useProgramChecklists,
} from "../../data/shiftHandoverChecklistStore";

const sldsBorder = "1px solid var(--slds-g-color-border-base-1)";
const sldsWeak = "var(--slds-g-color-text-weak)";
const sldsDefault = "var(--slds-g-color-text-default)";
const sldsBase = "var(--slds-g-color-background-base)";
const sldsAlt = "var(--slds-g-color-background-alt)";

const NO_CHECKLIST = "none";

type PendingChange =
  | { kind: "shift"; value: string }
  | { kind: "checklist"; id: string };

/**
 * Draft checklist state for the Create Handover dialog, plus the
 * "replace responses?" confirmation for checklist and shift changes.
 * Resets when the dialog opens or the Program changes, so drafts never
 * carry between Programs.
 */
export function useHandoverChecklist({
  programId,
  shiftValue,
  setShiftValue,
  open,
  initialDraft,
}: {
  programId: number | string;
  /** Edit Handover: the recorded checklist responses to restore on open. */
  initialDraft?: HandoverChecklistDraft | null;
  /** Create Handover shift value: "morning" | "afternoon" | "night". */
  shiftValue: string;
  setShiftValue: (v: string) => void;
  open: boolean;
}) {
  const programChecklists = useProgramChecklists(programId);
  const [draft, setDraft] = useState<HandoverChecklistDraft>(
    EMPTY_HANDOVER_CHECKLIST_DRAFT,
  );
  const [pending, setPending] = useState<PendingChange | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(initialDraft ?? EMPTY_HANDOVER_CHECKLIST_DRAFT);
      setPending(null);
    }
    // Reset only when the dialog opens or the Program changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, programId]);

  // A recorded snapshot (Edit) wins over the live configuration, so an
  // edited handover keeps its original checklist wording/order.
  const selected =
    draft.snapshot && draft.snapshot.id === draft.checklistId
      ? draft.snapshot
      : (programChecklists.find((c) => c.id === draft.checklistId) ?? null);

  const activeOptions = applicableChecklists(
    programChecklists,
    handoverShiftToChecklistShift(shiftValue),
  );
  // Keep the recorded checklist selectable while editing, even if it has
  // since been deactivated; it never appears for a new handover.
  const options =
    draft.snapshot && !activeOptions.some((c) => c.id === draft.snapshot!.id)
      ? [draft.snapshot, ...activeOptions]
      : activeOptions.map((c) =>
          draft.snapshot && c.id === draft.snapshot.id ? draft.snapshot : c,
        );

  const result =
    selected && draft.checklistId !== NO_CHECKLIST
      ? buildChecklistResult(selected, draft)
      : null;

  const changeShift = (value: string) => {
    if (value === shiftValue) return;
    const newShift = handoverShiftToChecklistShift(value);
    const stillApplies =
      !selected ||
      (draft.snapshot && selected === draft.snapshot
        ? selected.shift === "All Shifts" || selected.shift === newShift
        : applicableChecklists(programChecklists, newShift).some(
            (c) => c.id === selected.id,
          ));
    if (stillApplies) {
      setShiftValue(value);
    } else if (draftHasResponses(draft)) {
      setPending({ kind: "shift", value });
    } else {
      setShiftValue(value);
      setDraft(EMPTY_HANDOVER_CHECKLIST_DRAFT);
    }
  };

  const selectChecklist = (id: string) => {
    if (id === draft.checklistId) return;
    if (draftHasResponses(draft)) setPending({ kind: "checklist", id });
    else setDraft({ checklistId: id, responses: {} });
  };

  const confirmReplace = () => {
    if (!pending) return;
    if (pending.kind === "shift") {
      setShiftValue(pending.value);
      setDraft(EMPTY_HANDOVER_CHECKLIST_DRAFT);
    } else {
      setDraft({ checklistId: pending.id, responses: {} });
    }
    setPending(null);
  };

  return {
    draft,
    setDraft,
    options,
    selected,
    result,
    changeShift,
    selectChecklist,
    pending,
    confirmReplace,
    cancelReplace: () => setPending(null),
  };
}

export type HandoverChecklistState = ReturnType<
  typeof useHandoverChecklist
>;

// ─── Section ──────────────────────────────────────────────────────────────

export function HandoverChecklistSection({
  state,
  programName,
}: {
  state: HandoverChecklistState;
  programName: string;
}) {
  const { draft, setDraft, options, selected, selectChecklist } = state;

  return (
    <section aria-labelledby="handover-checklist-title" className="space-y-3">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h3
          id="handover-checklist-title"
          className="text-sm font-semibold"
          style={{ color: sldsDefault }}
        >
          Checklist
        </h3>
        <span className="text-xs" style={{ color: sldsWeak }}>
          Program: {programName}
        </span>
      </div>

      {options.length === 0 ? (
        <div
          role="status"
          className="rounded-md p-3 flex items-start gap-2 text-sm"
          style={{ border: sldsBorder, backgroundColor: sldsAlt, color: sldsWeak }}
        >
          <ListChecks className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          <span>
            No checklist is available for this Program and shift. You can
            continue with handover notes.
          </span>
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* The section heading already reads "Checklist" visibly. */}
          <Label htmlFor="handover-checklist-select" className="sr-only">
            Checklist
          </Label>
          <Select
            value={draft.checklistId || undefined}
            onValueChange={selectChecklist}
          >
            <SelectTrigger
              id="handover-checklist-select"
              className="h-9 rounded-md"
              style={{ border: sldsBorder, backgroundColor: sldsBase }}
            >
              <SelectValue placeholder="Select a checklist" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_CHECKLIST}>No checklist</SelectItem>
              {options.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.shift})
                  {draft.snapshot?.id === c.id ? " — as recorded" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selected && (
        <ChecklistItems
          checklist={selected}
          draft={draft}
          setDraft={setDraft}
        />
      )}

      <ReplaceChecklistConfirm state={state} />
    </section>
  );
}

function ChecklistItems({
  checklist,
  draft,
  setDraft,
}: {
  checklist: ShiftHandoverChecklist;
  draft: HandoverChecklistDraft;
  setDraft: (d: HandoverChecklistDraft) => void;
}) {
  const total = checklist.items.length;
  const done = checklist.items.filter(
    (i) => draft.responses[i.id]?.checked,
  ).length;
  const status = completionStatus(done, total);
  const pct = total ? Math.round((done / total) * 100) : 0;

  const update = (
    itemId: string,
    patch: Partial<{ checked: boolean; notes: string }>,
  ) => {
    const prev = draft.responses[itemId] ?? { checked: false, notes: "" };
    setDraft({
      ...draft,
      responses: { ...draft.responses, [itemId]: { ...prev, ...patch } },
    });
  };

  return (
    <div
      className="rounded-md overflow-hidden"
      style={{ border: sldsBorder, backgroundColor: sldsBase }}
    >
      <div
        className="px-3 py-2.5 space-y-2"
        style={{ borderBottom: sldsBorder, backgroundColor: sldsAlt }}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span
            className="text-sm font-semibold min-w-0 break-words"
            style={{ color: sldsDefault }}
          >
            {checklist.name}
          </span>
          <div className="flex items-center gap-2" aria-live="polite">
            <span className="text-xs" style={{ color: sldsDefault }}>
              {done} of {total} completed
            </span>
            <Badge
              variant={
                status === "Complete"
                  ? "success"
                  : status === "In progress"
                    ? "warning"
                    : "neutral"
              }
            >
              {status}
            </Badge>
          </div>
        </div>
        <Progress
          value={pct}
          className="h-1.5"
          aria-label={`${checklist.name} progress: ${done} of ${total} completed`}
        />
      </div>

      <ol>
        {checklist.items.map((item, index) => {
          const n = index + 1;
          const r = draft.responses[item.id] ?? { checked: false, notes: "" };
          const cbId = `handover-item-${item.id}`;
          const notesId = `handover-item-notes-${item.id}`;
          return (
            <li
              key={item.id}
              className="px-3 py-3 space-y-2"
              style={index > 0 ? { borderTop: sldsBorder } : undefined}
            >
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id={cbId}
                  checked={r.checked}
                  onCheckedChange={(v) => update(item.id, { checked: v === true })}
                  className="mt-0.5"
                />
                <label
                  htmlFor={cbId}
                  className="text-sm leading-5 flex-1 min-w-0 break-words cursor-pointer"
                  style={{ color: sldsDefault }}
                >
                  <span className="font-semibold" style={{ color: sldsWeak }}>
                    {n}.
                  </span>{" "}
                  {item.description}
                </label>
              </div>
              <div className="pl-[26px] space-y-1">
                <label
                  htmlFor={notesId}
                  className="text-xs block"
                  style={{ color: sldsWeak }}
                >
                  Item notes (optional)
                  <span className="sr-only"> for item {n}</span>
                </label>
                <Textarea
                  id={notesId}
                  rows={1}
                  className="min-h-[36px] text-sm resize-y"
                  placeholder="Add context, especially if incomplete"
                  value={r.notes}
                  onChange={(e) => update(item.id, { notes: e.target.value })}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ReplaceChecklistConfirm({ state }: { state: HandoverChecklistState }) {
  const { pending, confirmReplace, cancelReplace } = state;
  const what = pending?.kind === "shift" ? "shift" : "checklist";
  return (
    <AlertDialog
      open={pending !== null}
      onOpenChange={(o) => {
        if (!o) cancelReplace();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Replace checklist responses?</AlertDialogTitle>
          <AlertDialogDescription>
            Changing the {what} will clear the checked items and item notes
            you entered for the current checklist. Your Handover Notes are
            kept.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">
            Keep Current Checklist
          </AlertDialogCancel>
          <AlertDialogAction
            className="rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white"
            onClick={confirmReplace}
          >
            Replace Checklist
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
