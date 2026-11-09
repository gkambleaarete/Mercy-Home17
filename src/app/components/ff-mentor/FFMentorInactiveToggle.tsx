// Mentor Inactive toggle for the Overview (US 20039 Chunk 10). Turning it
// on asks for confirmation (DLG-01); the mentor's Inactive setting and the
// closure of their active matches are saved together only on Confirm.
// Turning it off saves straight away; ended matches stay ended.

import { useRef, useState } from "react";
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
import { Switch } from "../ui/switch";
import type { FFMentorAvailabilityState } from "../../data/ffMentorApplicationStore";
import {
  clearFFMentorInactive,
  confirmFFMentorInactive,
  previewFFMentorInactivation,
} from "../../data/ffMentorInactive";
import { menteeName } from "../../data/mockMentorMatchData";

const CONFIRM_TEXT =
  "The mentor will be marked inactive and will not be available for new mentor matches while inactive. Any active mentor matches will be ended.";

const ERROR: Record<string, string> = {
  "matches-unavailable":
    "Mentor matches can't be loaded right now, so the mentor wasn't marked inactive. Nothing was changed.",
  storage:
    "The change could not be saved. Nothing was changed.",
  actor:
    "Your user account couldn't be identified, so nothing was changed.",
  missing:
    "This mentor could not be found. Nothing was changed.",
};

export function FFMentorInactiveToggle({
  availability,
}: {
  availability: FFMentorAvailabilityState;
}) {
  const { mentorId, inactive } = availability;
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<ReturnType<
    typeof previewFFMentorInactivation
  > | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const onToggle = (next: boolean) => {
    if (savingRef.current) return;
    if (next) {
      setPreview(previewFFMentorInactivation(mentorId));
      setError("");
      setOpen(true);
      return;
    }
    savingRef.current = true;
    const r = clearFFMentorInactive(mentorId);
    savingRef.current = false;
    if (r.ok)
      toast.success("Mentor is active again", {
        description:
          "Ended matches stay ended. The mentor is available for new matches only when every readiness requirement is met.",
      });
    else
      toast.error("Inactive setting not changed", {
        description: ERROR[r.reason] ?? ERROR.storage,
      });
  };

  const onConfirm = () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      const r = confirmFFMentorInactive(mentorId);
      if (!r.ok) {
        setError(ERROR[r.reason] ?? ERROR.storage);
        return;
      }
      setOpen(false);
      toast.success("Mentor marked inactive", {
        description: r.ended.length
          ? `${r.ended.length} active mentor match${r.ended.length > 1 ? "es" : ""} ended ${r.endDate} ${r.endTime}.`
          : "There were no active mentor matches to end.",
      });
      if (r.future.length)
        toast.warning("Future-dated match not changed", {
          description: `${r.future.length} match${r.future.length > 1 ? "es" : ""} not yet started ${r.future.length > 1 ? "were" : "was"} left as scheduled.`,
        });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const sourceAvailable = preview?.sourceAvailable ?? true;
  return (
    <div>
      <div className="flex items-center gap-3">
        <Switch
          id="mentor-inactive"
          checked={inactive}
          disabled={saving}
          onCheckedChange={onToggle}
          aria-describedby="mentor-inactive-help"
        />
        <label
          htmlFor="mentor-inactive"
          className="slds-text-4 font-medium text-[var(--slds-g-color-text-default)]"
        >
          Inactive
        </label>
      </div>
      <p
        id="mentor-inactive-help"
        className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1"
      >
        {inactive
          ? `Not available for new matches${availability.record?.changedAt ? ` since ${availability.record.changedAt}` : ""}. Applies to every application for this mentor; the stage is unchanged.`
          : "Marks the mentor unavailable for new matches. Saves after confirmation."}
      </p>

      <Dialog
        open={open}
        onOpenChange={(v) => !savingRef.current && setOpen(v)}
      >
        <DialogContent
          size="md"
          onCloseAutoFocus={(e) => {
            // Opened from the switch (no trigger): return focus to it.
            e.preventDefault();
            document.getElementById("mentor-inactive")?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Mark mentor inactive?</DialogTitle>
            <DialogDescription>
              {CONFIRM_TEXT}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-2">
            {!sourceAvailable ? (
              <p
                className="slds-text-4"
                style={{ color: "#c23934" }}
              >
                Mentor matches can't be loaded right now, so
                this can't be confirmed.
              </p>
            ) : preview && preview.toEnd.length > 0 ? (
              <p className="slds-text-4">
                Active matches that will end now:{" "}
                {preview.toEnd
                  .map(
                    (m) =>
                      `${menteeName(m.menteeId)} (${m.id})`,
                  )
                  .join(", ")}
                .
              </p>
            ) : (
              <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
                This mentor has no active mentor matches.
              </p>
            )}
            {error && (
              <p
                role="alert"
                className="slds-text-4"
                style={{ color: "#c23934" }}
              >
                {error}
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={saving || !sourceAvailable}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}