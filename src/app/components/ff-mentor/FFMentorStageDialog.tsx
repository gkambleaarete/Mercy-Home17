// Stage dropdown for a Mentor Application header (US 20039) — same pill
// Select as the Tutor record. Picking a stage saves it straight away with
// its history event; the dropdown only shows the new stage once the store
// has saved it. Refusals (e.g. Ready for Match without verified readiness)
// leave the saved stage in place and explain why. Ready for Match asks for
// confirmation first (DLG-01): the stage, its history and the mentor's
// Constituent record are saved together only on Confirm.

import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  FF_MENTOR_SELECTABLE_STAGES,
  type FFMentorPipelineStage,
} from "../../data/ffMentorApplication";
import {
  changeFFMentorStage,
  getFFActingUser,
  previewFFReadyForMatch,
  type FFReadyForMatchPreview,
} from "../../data/ffMentorApplicationStore";

const BORDER = "1px solid var(--slds-g-color-border-base-1)";

const MESSAGES = {
  invalid: "Select one of the listed stages.",
  "not-ready":
    "Match readiness has not been verified. This mentor can't be moved to Ready for Match until every requirement on the Checklist tab has passed.",
  actor:
    "Your user account couldn't be identified, so the change wasn't saved.",
  missing: "This application could not be found.",
  storage: "The stage could not be saved. Please try again.",
  "constituent-link":
    "This applicant's Constituent link could not be verified, so the stage wasn't changed. Nothing was created.",
} as const;

export const CREATE_CONSTITUENT_TEXT =
  "A Constituent record will be created for this applicant";
const REUSE_CONSTITUENT_TEXT =
  "This applicant already has a Constituent record. It will be updated with the current application details; no second record will be created.";

export function FFMentorStageSelect({
  applicationId,
  savedStage,
}: {
  applicationId: string;
  savedStage: FFMentorPipelineStage | null;
}) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [confirm, setConfirm] = useState<Extract<
    FFReadyForMatchPreview,
    { status: "create" | "reuse" }
  > | null>(null);
  const [dialogError, setDialogError] = useState("");

  const report = (
    result: ReturnType<typeof changeFFMentorStage>,
    next: string,
  ): boolean => {
    if (result.ok) {
      if (result.changed)
        toast.success("Stage updated", {
          description: result.constituent
            ? `Stage is now ${next}. ${result.constituent.created ? "A Constituent record was created." : "The Constituent record was updated."}`
            : `Stage is now ${next}.`,
          action: result.constituent
            ? {
                label: "View Constituent",
                onClick: () =>
                  navigate(
                    `/constituents/${result.constituent!.id}`,
                  ),
              }
            : undefined,
        });
      return true;
    }
    return false;
  };

  const failMessage = (
    result: Extract<
      ReturnType<typeof changeFFMentorStage>,
      { ok: false }
    >,
  ) =>
    result.reason === "conflict"
      ? `This record's stage was changed elsewhere and is now ${
          result.currentStage ?? "not set"
        }. Review it and choose again.`
      : MESSAGES[result.reason];

  const onChange = (next: string) => {
    if (savingRef.current || next === savedStage) return;
    if (next === "Ready for Match") {
      // Check on the latest saved data first; only an applicable move asks
      // for confirmation. The dropdown keeps showing the saved stage.
      const p = previewFFReadyForMatch(applicationId);
      if (p.status === "create" || p.status === "reuse") {
        setDialogError("");
        setConfirm(p);
        return;
      }
      toast.error("Stage not changed", {
        description:
          p.status === "blocked"
            ? MESSAGES["not-ready"]
            : p.status === "link-invalid"
              ? MESSAGES["constituent-link"]
              : MESSAGES.missing,
      });
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      const result = changeFFMentorStage(applicationId, {
        stage: next,
        expectedStage: savedStage,
        actor: getFFActingUser(),
      });
      if (!report(result, next) && !result.ok)
        toast.error("Stage not changed", {
          description: failMessage(result),
        });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const onConfirm = () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setDialogError("");
    try {
      // Re-checked against the latest saved data inside the store.
      const result = changeFFMentorStage(applicationId, {
        stage: "Ready for Match",
        expectedStage: savedStage,
        actor: getFFActingUser(),
      });
      if (!result.ok) {
        setDialogError(failMessage(result));
        return;
      }
      setConfirm(null);
      report(result, "Ready for Match");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <>
      <Select
        value={savedStage ?? ""}
        onValueChange={onChange}
        disabled={saving}
      >
        <SelectTrigger
          surface="base"
          className="h-9 rounded-full text-[13px] shadow-none w-[220px]"
          style={{ border: BORDER }}
          aria-label="Application stage"
        >
          <SelectValue placeholder="Not set">
            {/* A legacy saved value (Matched/Active) isn't an option, so
                show it as recorded. */}
            {savedStage ?? undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {FF_MENTOR_SELECTABLE_STAGES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog
        open={!!confirm}
        onOpenChange={(v) =>
          !savingRef.current && !v && setConfirm(null)
        }
      >
        <DialogContent
          size="md"
          onCloseAutoFocus={(e) => {
            // Opened from the dropdown (no trigger): return focus to it.
            e.preventDefault();
            (
              document.querySelector(
                '[aria-label="Application stage"]',
              ) as HTMLElement | null
            )?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Move to Ready for Match?</DialogTitle>
            <DialogDescription>
              {confirm?.status === "reuse"
                ? REUSE_CONSTITUENT_TEXT
                : CREATE_CONSTITUENT_TEXT}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-2">
            {confirm?.status === "reuse" && (
              <Button
                variant="link"
                className="px-0"
                onClick={() =>
                  navigate(
                    `/constituents/${confirm.constituentId}`,
                  )
                }
              >
                View existing Constituent record
              </Button>
            )}
            {dialogError && (
              <p
                role="alert"
                className="slds-text-4"
                style={{ color: "#c23934" }}
              >
                {dialogError}
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirm(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={onConfirm} disabled={saving}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}