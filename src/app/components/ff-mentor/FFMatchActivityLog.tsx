// Match Activity Log for one Mentor Match (US 20039 Chunk 11): the activity
// grid and Log Community-Based Activity (DLG-01). Reads and writes by exact
// Match ID through the match repository; logging never touches the match.

import { useRef, useState, useSyncExternalStore } from "react";
import { Plus } from "@/app/lib/lucide-icons";
import { toast } from "sonner";
import {
  ErrMsg,
  FieldLabel,
} from "../FriendsFirstMenteeRecord";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DateInput } from "../ui/date-input";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { EmptyState } from "../ui/empty-state";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { StarRating } from "../ui/star-rating";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { TablePaginationBar } from "../ui/table-toolbar";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { ClipboardList } from "@/app/lib/lucide-icons";
import { localStamp } from "../../data/ffMenteeIntake";
import {
  FF_DURATION_MAX_HOURS,
  FF_DURATION_MIN_HOURS,
  FF_ENGAGEMENT_LABELS,
  FF_MATCH_ACTIVITY_TYPES,
  FF_MATCH_MEETING_METHODS,
  FF_OUTING_STATUSES,
  type FFOutingStatus,
} from "../../data/ffMatchActivityConfig";
import {
  getMatchActivities,
  logMatchActivity,
  subscribeMatchActivities,
  validateMatchActivity,
  type MatchActivity,
  type MatchActivityErrors,
  type MatchActivityInput,
} from "../../data/mockMentorMatchData";

const BORDER = "1px solid var(--slds-g-color-border-base-1)";
const PAGE_SIZE = 12; // Mercy Home table standard
const OUTING_LABEL: Record<string, string> = Object.fromEntries(
  FF_OUTING_STATUSES.map((o) => [o.value, o.label]),
);
const OUTING_VARIANT: Record<
  string,
  "success" | "warning" | "neutral"
> = { yes: "success", partial: "warning", no: "neutral" };

const freshDraft = (): MatchActivityInput => ({
  outing: "",
  // Today on the local calendar (MM/DD/YYYY), same convention as the app's stamps.
  activityDate: localStamp(new Date()).date,
  type: "",
  method: "",
  duration: "",
  mentorEngagement: null,
  menteeEngagement: null,
  notes: "",
});

// Field order for focusing the first invalid field.
const FIELD_ORDER: (keyof MatchActivityErrors)[] = [
  "outing",
  "activityDate",
  "duration",
  "type",
  "method",
  "mentorEngagement",
  "menteeEngagement",
];
const FIELD_ID: Record<keyof MatchActivityErrors, string> = {
  outing: "act-outing-yes",
  activityDate: "act-date",
  duration: "act-duration",
  type: "act-type",
  method: "act-method",
  mentorEngagement: "act-mentor-rating",
  menteeEngagement: "act-mentee-rating",
};

function RatingField({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  error?: string;
}) {
  return (
    <div id={id} tabIndex={-1}>
      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5">
        {label} (optional)
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <StarRating
          value={value ?? 0}
          onSelect={(n) => onChange(n)}
          label={label}
          optionLabels={FF_ENGAGEMENT_LABELS}
        />
        <span
          className="slds-text-3 text-[var(--slds-g-color-text-weak)]"
          aria-live="polite"
        >
          {value
            ? FF_ENGAGEMENT_LABELS[value - 1]
            : "Not rated"}
        </span>
        {value !== null && (
          <Button
            variant="link"
            size="xs"
            onClick={() => onChange(null)}
            aria-label={`Clear ${label}`}
          >
            Clear
          </Button>
        )}
      </div>
      <ErrMsg id={id} msg={error} />
    </div>
  );
}

function LogActivityDialog({ matchId }: { matchId: string }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] =
    useState<MatchActivityInput>(freshDraft);
  const [errors, setErrors] = useState<MatchActivityErrors>({});
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  // Set once this draft is saved: a second click during the closing
  // animation must not log it again. Cleared when the dialog reopens.
  const savedRef = useRef(false);

  const onOpenChange = (next: boolean) => {
    if (savingRef.current) return;
    if (next) {
      savedRef.current = false;
      setDraft(freshDraft());
      setErrors({});
      setSaveError("");
    }
    setOpen(next);
  };
  const set = <K extends keyof MatchActivityInput>(
    k: K,
    v: MatchActivityInput[K],
  ) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const focusFirst = (e: MatchActivityErrors) => {
    const first = FIELD_ORDER.find((k) => e[k]);
    if (first)
      document.getElementById(FIELD_ID[first])?.focus();
  };

  const save = () => {
    if (savingRef.current || savedRef.current) return;
    setSaveError("");
    const found = validateMatchActivity(draft);
    if (Object.keys(found).length) {
      setErrors(found);
      focusFirst(found);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      const r = logMatchActivity(matchId, draft);
      if (r.ok) {
        savedRef.current = true;
        setOpen(false);
        toast.success("Activity logged", {
          description: `${r.activity.type} on ${r.activity.activityDate}`,
        });
        return;
      }
      if (r.reason === "invalid") {
        setErrors(r.errors);
        focusFirst(r.errors);
        return;
      }
      setSaveError(
        r.reason === "missing"
          ? "This match could not be found. The activity wasn't saved."
          : r.reason === "actor"
            ? "Your user account couldn't be identified, so the activity wasn't saved."
            : r.reason === "unavailable"
              ? "Match information can't be loaded right now. The activity wasn't saved."
              : "The activity could not be saved. Your entries are still here — please try again.",
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const durationNeeded =
    draft.outing === "yes" || draft.outing === "partial";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          Log Activity
        </Button>
      </DialogTrigger>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>
            Log Community-Based Activity
          </DialogTitle>
          <DialogDescription>
            Record the session details for this mentoring
            outing.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <fieldset>
            <legend
              id="act-outing-label"
              className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1.5"
            >
              Did the Outing Happen?
              <span className="text-red-600">*</span>
            </legend>
            <RadioGroup
              aria-labelledby="act-outing-label"
              aria-invalid={!!errors.outing}
              aria-describedby={
                errors.outing ? "act-outing-error" : undefined
              }
              className="flex gap-6"
              value={draft.outing ?? ""}
              onValueChange={(v: string) => {
                set("outing", v as FFOutingStatus);
                // The outing didn't happen: no duration (left empty, not 0).
                if (v === "no") set("duration", "");
              }}
            >
              {FF_OUTING_STATUSES.map((o) => (
                <div
                  key={o.value}
                  className="flex items-center gap-2"
                >
                  <RadioGroupItem
                    value={o.value}
                    id={`act-outing-${o.value}`}
                    aria-invalid={!!errors.outing}
                  />
                  <Label htmlFor={`act-outing-${o.value}`}>
                    {o.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <ErrMsg id="act-outing" msg={errors.outing} />
          </fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel htmlFor="act-date" required>
                Date
              </FieldLabel>
              <DateInput
                id="act-date"
                value={draft.activityDate}
                onChange={(v) => set("activityDate", v)}
                aria-invalid={!!errors.activityDate}
                aria-describedby={
                  errors.activityDate
                    ? "act-date-error"
                    : undefined
                }
              />
              <ErrMsg id="act-date" msg={errors.activityDate} />
            </div>
            <div>
              <FieldLabel
                htmlFor="act-duration"
                required={durationNeeded}
              >
                Duration (hours)
              </FieldLabel>
              <Input
                id="act-duration"
                type="number"
                inputMode="decimal"
                step="any"
                min={FF_DURATION_MIN_HOURS}
                max={FF_DURATION_MAX_HOURS}
                disabled={draft.outing === "no"}
                value={String(draft.duration ?? "")}
                onChange={(e) =>
                  set("duration", e.target.value)
                }
                aria-invalid={!!errors.duration}
                aria-describedby={
                  errors.duration
                    ? "act-duration-error"
                    : "act-duration-help"
                }
              />
              {errors.duration ? (
                <ErrMsg
                  id="act-duration"
                  msg={errors.duration}
                />
              ) : (
                <p
                  id="act-duration-help"
                  className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1"
                >
                  {draft.outing === "no"
                    ? "Not needed when the outing didn't happen."
                    : `Between ${FF_DURATION_MIN_HOURS} and ${FF_DURATION_MAX_HOURS} hours, e.g. 1.5.`}
                </p>
              )}
            </div>
            <div>
              <FieldLabel htmlFor="act-type" required>
                Activity Type
              </FieldLabel>
              <Select
                value={draft.type}
                onValueChange={(v) => set("type", v)}
              >
                <SelectTrigger
                  id="act-type"
                  aria-invalid={!!errors.type}
                  aria-describedby={
                    errors.type ? "act-type-error" : undefined
                  }
                >
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  {FF_MATCH_ACTIVITY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ErrMsg id="act-type" msg={errors.type} />
            </div>
            <div>
              <FieldLabel htmlFor="act-method" required>
                Meeting Method
              </FieldLabel>
              <Select
                value={draft.method}
                onValueChange={(v) => set("method", v)}
              >
                <SelectTrigger
                  id="act-method"
                  aria-invalid={!!errors.method}
                  aria-describedby={
                    errors.method
                      ? "act-method-error"
                      : undefined
                  }
                >
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  {FF_MATCH_MEETING_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ErrMsg id="act-method" msg={errors.method} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RatingField
              id="act-mentor-rating"
              label="Mentor Engagement"
              value={draft.mentorEngagement}
              onChange={(v) => set("mentorEngagement", v)}
              error={errors.mentorEngagement}
            />
            <RatingField
              id="act-mentee-rating"
              label="Mentee Engagement"
              value={draft.menteeEngagement}
              onChange={(v) => set("menteeEngagement", v)}
              error={errors.menteeEngagement}
            />
          </div>

          <div>
            <FieldLabel htmlFor="act-notes">Notes</FieldLabel>
            <Textarea
              id="act-notes"
              size="md"
              rows={5}
              placeholder="What did the mentor and mentee do together?"
              value={draft.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
          {saveError && (
            <p
              role="alert"
              className="slds-text-4"
              style={{ color: "#c23934" }}
            >
              {saveError}
            </p>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={saving}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={save} disabled={saving}>
            Log Activity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const hours = (h: number | null | undefined) =>
  typeof h === "number" && Number.isFinite(h)
    ? `${h} hr${h === 1 ? "" : "s"}`
    : "—";

function Rating({
  value,
  who,
}: {
  value: number | null | undefined;
  who: string;
}) {
  return typeof value === "number" &&
    value >= 1 &&
    value <= 5 ? (
    <StarRating
      value={value}
      readOnly
      size={16}
      label={`${who} engagement`}
      optionLabels={FF_ENGAGEMENT_LABELS}
    />
  ) : (
    <span className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
      Not rated
    </span>
  );
}

export function FFMatchActivityLog({
  matchId,
}: {
  matchId: string;
}) {
  const list = useSyncExternalStore(
    subscribeMatchActivities,
    () => getMatchActivities(matchId),
  );
  const [page, setPage] = useState(1);
  const activities: MatchActivity[] =
    list.status === "ok" ? list.activities : [];
  const totalPages = Math.max(
    1,
    Math.ceil(activities.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = activities.slice(start, start + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="slds-section-title text-[var(--slds-g-color-text-default)]">
          Match Activity Log
        </h2>
        <LogActivityDialog key={matchId} matchId={matchId} />
      </div>
      {list.status === "unavailable" ? (
        <EmptyState
          icon={ClipboardList}
          title="Activities can't be loaded right now."
          description="Saved activities will show here once they can be read."
        />
      ) : activities.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No activities logged yet"
          description="Use Log Activity to record a mentoring outing."
        />
      ) : (
        <>
          <div
            className="overflow-x-auto rounded-lg"
            style={{ border: BORDER }}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Mentor Engagement</TableHead>
                  <TableHead>Mentee Engagement</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      {a.activityDate || "—"}
                      {OUTING_LABEL[a.outing] && (
                        <span className="block mt-1">
                          <Badge
                            variant={OUTING_VARIANT[a.outing]}
                            aria-label={`Outing happened: ${OUTING_LABEL[a.outing]}`}
                          >
                            Outing: {OUTING_LABEL[a.outing]}
                          </Badge>
                        </span>
                      )}
                    </TableCell>
                    <TableCell wrap>{a.type || "—"}</TableCell>
                    <TableCell>
                      {hours(a.durationHours)}
                    </TableCell>
                    <TableCell>
                      <Rating
                        value={a.mentorEngagement}
                        who="Mentor"
                      />
                    </TableCell>
                    <TableCell>
                      <Rating
                        value={a.menteeEngagement}
                        who="Mentee"
                      />
                    </TableCell>
                    <TableCell wrap>
                      {a.method || "—"}
                    </TableCell>
                    <TableCell
                      wrap
                      className="min-w-64 max-w-md"
                    >
                      <span className="whitespace-pre-wrap break-words">
                        {a.notes || "—"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <TablePaginationBar
              start={start + 1}
              end={start + rows.length}
              total={activities.length}
              countLabel="activities"
              currentPage={safePage}
              totalPages={totalPages}
              onPrevious={() =>
                setPage((p) => Math.max(1, p - 1))
              }
              onNext={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
            />
          )}
        </>
      )}
    </div>
  );
}