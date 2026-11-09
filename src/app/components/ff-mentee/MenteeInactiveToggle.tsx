// Inactive toggle (US 20040). Turning it on opens a confirmation first; the
// flag and the mentor-match closures are only applied on Confirm. Cancel,
// Escape or dismissal leave both unchanged. Clearing it needs no warning.

import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "../ui/switch";
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
import type { FFMentee } from "../../data/mockFriendsFirstData";
import {
  FF_CAN_SET_MENTEE_INACTIVE,
  clearMenteeInactive,
  confirmMenteeInactive,
  previewInactivation,
} from "../../data/ffMenteeInactive";
import { mentorName } from "../../data/mockMentorMatchData";

export function MenteeInactiveToggle({
  mentee,
}: {
  mentee: FFMentee;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [preview, setPreview] = useState<ReturnType<
    typeof previewInactivation
  > | null>(null);
  const inactive = !!mentee.inactive;

  const onToggle = (next: boolean) => {
    if (next) {
      setPreview(previewInactivation(mentee.id));
      setConfirmOpen(true);
      return;
    }
    if (clearMenteeInactive(mentee.id))
      toast.success("Mentee is active again", {
        description:
          "Available for a new match when all match-readiness requirements are met. Ended matches stay ended.",
      });
    else
      toast.error("Inactive setting not changed", {
        description:
          "Browser storage is unavailable, so the mentee is still inactive.",
      });
  };

  const onConfirm = () => {
    const r = confirmMenteeInactive(mentee.id);
    setConfirmOpen(false);
    if (!r.ok) {
      // Nothing was written (the flag and closures save in one write), so
      // this is exactly what a refresh will show.
      toast.error("Mentee not marked inactive", {
        description:
          r.reason === "not-found"
            ? "This mentee record could not be found. No change was made."
            : "Browser storage is unavailable. No change was made to the mentee or their matches.",
      });
      return;
    }
    if (r.noop) {
      toast.info("Mentee is already inactive");
      return;
    }
    toast.success("Mentee marked inactive", {
      description: r.ended.length
        ? `${r.ended.length} mentor match${r.ended.length > 1 ? "es" : ""} ended ${r.endDate} ${r.endTime}.`
        : "No current mentor matches needed ending.",
    });
    if (r.future.length)
      toast.warning("Future-dated match not changed", {
        description: `${r.future.length} match${r.future.length > 1 ? "es" : ""} not yet started ${r.future.length > 1 ? "were" : "was"} left as scheduled — a policy for future matches is pending.`,
      });
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <Switch
          id="mp-inactive"
          checked={inactive}
          disabled={!FF_CAN_SET_MENTEE_INACTIVE}
          onCheckedChange={onToggle}
          aria-describedby="mp-inactive-help"
        />
        <label
          htmlFor="mp-inactive"
          className="text-[13px] font-medium"
          style={{ color: "var(--slds-g-color-text-default)" }}
        >
          Inactive
        </label>
      </div>
      <p
        id="mp-inactive-help"
        className="mt-1 text-[12px]"
        style={{ color: "var(--slds-g-color-text-weak)" }}
      >
        {!FF_CAN_SET_MENTEE_INACTIVE
          ? "You do not have permission to change this setting."
          : inactive
            ? `Temporarily unavailable for new matches${mentee.inactiveChangedAt ? ` since ${mentee.inactiveChangedAt}` : ""}. The pipeline stage is unchanged.`
            : "Marks the mentee temporarily unavailable for new matches. Saves immediately after confirmation."}
      </p>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      >
        <AlertDialogContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            // Opened programmatically (no Trigger): return focus to the switch.
            document.getElementById("mp-inactive")?.focus();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              Mark mentee inactive?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  The Mentee will be marked inactive and will
                  not be available for a new match while
                  inactive. Also, any existing mentor matches
                  will be ended
                </p>
                <p>
                  The applicant's completed application and
                  approval information will remain unchanged.
                </p>
                {preview && preview.toEnd.length > 0 && (
                  <p>
                    Matches that will end now:{" "}
                    {preview.toEnd
                      .map(
                        (m) =>
                          `${mentorName(m.mentorId)} (${m.id})`,
                      )
                      .join(", ")}
                    .
                  </p>
                )}
                {preview && preview.future.length > 0 && (
                  <p>
                    Not yet started, left unchanged (policy
                    pending):{" "}
                    {preview.future
                      .map(
                        (m) =>
                          `${mentorName(m.mentorId)} (${m.id}, starts ${m.startDate})`,
                      )
                      .join(", ")}
                    .
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}