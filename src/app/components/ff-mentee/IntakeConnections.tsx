// Schedule Intake → Intake Connections grid (US 20040). Rows belong to the
// current mentee id only; they are never linked to Admissions/Constituent
// connections by name. Create/Edit uses the DLG-01 dialog structure and
// saves straight to the mentee store; a successful save closes the dialog.

import { useState } from "react";
import { CalendarPlus, Pencil } from "@/app/lib/lucide-icons";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { DateInput } from "../ui/date-input";
import { Input } from "../ui/input";
import { MultiSelect } from "../ui/multi-select";
import { TimeInput } from "../ui/time-input";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import type {
  FFIntakeConnection,
  FFIntakeParticipant,
  FFMentee,
  FFReferralRecord,
} from "../../data/mockFriendsFirstData";
import { saveFFIntakeConnection } from "../../data/ffMenteeStore";
import {
  parseCalendarDate,
  parseClockTime,
  parseLocal,
} from "../../data/ffMenteeIntake";
import {
  FieldError,
  focusFirstError,
} from "./IntakeQuestionnaire";

const BORDER = "1px solid var(--slds-g-color-border-base-1)";

/** People connected to this mentee, with stable ids. */
function participantOptions(
  mentee: FFMentee,
  referral?: FFReferralRecord,
): FFIntakeParticipant[] {
  const opts: FFIntakeParticipant[] = [
    {
      id: `mentee:${mentee.id}`,
      label: `${mentee.name} (Youth)`,
    },
  ];
  const g = mentee.guardianIntake?.guardianName?.trim();
  if (g)
    opts.push({
      id: `guardian:${mentee.id}`,
      label: `${g} (Guardian)`,
    });
  if (mentee.coordinator)
    opts.push({
      id: `coordinator:${mentee.coordinator}`,
      label: `${mentee.coordinator} (Coordinator)`,
    });
  if (referral?.callerName)
    opts.push({
      id: `referrer:${referral.id}`,
      label: `${referral.callerName} (${referral.referrerRole || "Referrer"})`,
    });
  return opts;
}

interface Draft {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  /** Stable participant ids (labels are display only). */
  participants: string[];
  attended: boolean;
}
const EMPTY: Draft = {
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  location: "",
  participants: [],
  attended: false,
};
type DraftErrors = Partial<Record<keyof Draft, string>>;

export function IntakeConnections({
  mentee,
  referral,
}: {
  mentee: FFMentee;
  referral?: FFReferralRecord;
}) {
  const rows = mentee.intakeConnections ?? [];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] =
    useState<FFIntakeConnection | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<DraftErrors>({});

  // Grid shows the current name of a known identity (e.g. after a guardian
  // rename); otherwise the label saved with the connection.
  const currentLabel = new Map(
    participantOptions(mentee, referral).map((o) => [
      o.id,
      o.label,
    ]),
  );
  // One selectable entry per participant identity, keyed by stable id.
  // Current people use their current label (a renamed guardian stays the
  // same, still-selected identity). A saved participant who is no longer a
  // current option keeps the label recorded when the connection was saved.
  const known = new Map<string, FFIntakeParticipant>();
  participantOptions(mentee, referral).forEach((o) =>
    known.set(o.id, o),
  );
  editing?.participants.forEach((p) => {
    if (!known.has(p.id)) known.set(p.id, p);
  });
  // Identical display labels (e.g. two people with the same name and role)
  // get their id appended so each identity is distinguishable.
  const labelCount = new Map<string, number>();
  known.forEach((p) =>
    labelCount.set(p.label, (labelCount.get(p.label) ?? 0) + 1),
  );
  const labelOf = (id: string) => {
    const p = known.get(id);
    if (!p) return id;
    return (labelCount.get(p.label) ?? 0) > 1
      ? `${p.label} [${p.id}]`
      : p.label;
  };

  const openNew = () => {
    setEditing(null);
    setDraft(EMPTY);
    setErrors({});
    setOpen(true);
  };
  const openEdit = (c: FFIntakeConnection) => {
    setEditing(c);
    setDraft({
      startDate: c.startDate,
      startTime: c.startTime,
      endDate: c.endDate,
      endTime: c.endTime,
      location: c.location,
      participants: [
        ...new Set(c.participants.map((p) => p.id)),
      ],
      attended: c.attended,
    });
    setErrors({});
    setOpen(true);
  };

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const save = () => {
    const e: DraftErrors = {};
    // Strict: impossible dates/times are rejected, never rolled forward.
    const sd = parseCalendarDate(draft.startDate);
    const ed = parseCalendarDate(draft.endDate);
    const st = parseClockTime(draft.startTime);
    const et = parseClockTime(draft.endTime);
    if (!draft.startDate.trim()) e.startDate = "Required";
    else if (!sd)
      e.startDate = "Enter a valid date (MM/DD/YYYY)";
    if (!draft.startTime.trim()) e.startTime = "Required";
    else if (!st)
      e.startTime = "Enter a valid time (h:mm AM/PM)";
    if (!draft.endDate.trim()) e.endDate = "Required";
    else if (!ed) e.endDate = "Enter a valid date (MM/DD/YYYY)";
    if (!draft.endTime.trim()) e.endTime = "Required";
    else if (!et) e.endTime = "Enter a valid time (h:mm AM/PM)";
    // Full start/end instants, compared only once both are valid.
    const start = parseLocal(draft.startDate, draft.startTime);
    const end = parseLocal(draft.endDate, draft.endTime);
    if (start && end && end <= start)
      e.endTime = "End must be after the start date/time";
    if (!draft.location.trim()) e.location = "Required";
    // Canonical participants: resolved by id, deduplicated.
    const participants = [...new Set(draft.participants)]
      .map((id) => known.get(id))
      .filter((p): p is FFIntakeParticipant => !!p)
      .map((p) => ({ id: p.id, label: p.label }));
    if (!participants.length)
      e.participants = "Select at least one participant";
    setErrors(e);
    if (Object.keys(e).length) {
      focusFirstError(
        Object.fromEntries(
          Object.entries(e).map(([k, v]) => [
            `ic-${k}`,
            v ?? "",
          ]),
        ),
      );
      return;
    }
    const conn: FFIntakeConnection = {
      id:
        editing?.id ??
        `IC-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
      menteeId: mentee.id,
      startDate: draft.startDate,
      startTime: draft.startTime,
      endDate: draft.endDate,
      endTime: draft.endTime,
      location: draft.location.trim(),
      participants,
      attended: draft.attended,
    };
    // The dialog closes only after a successful save; on failure it stays
    // open with the entered values so the user can retry.
    if (!saveFFIntakeConnection(conn)) {
      toast.error("Intake connection not saved", {
        description:
          "The change could not be saved, so nothing was changed. Your entries are still here — try again.",
      });
      return;
    }
    toast.success(
      editing
        ? "Intake connection updated"
        : "Intake connection scheduled",
    );
    setOpen(false);
  };

  const fieldErr = (k: keyof Draft) => ({
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `ic-${k}-error` : undefined,
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <p
          id="ic-heading"
          className="text-[13px] font-semibold"
          style={{ color: "var(--slds-g-color-text-default)" }}
        >
          Intake Connections
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openNew}
        >
          <CalendarPlus aria-hidden="true" />
          Schedule Intake
        </Button>
      </div>
      <div
        className="overflow-x-auto rounded-lg"
        style={{ border: BORDER }}
      >
        <Table aria-labelledby="ic-heading">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-3">
                Start Date/Time
              </TableHead>
              <TableHead className="px-3">
                End Date/Time
              </TableHead>
              <TableHead className="px-3">Location</TableHead>
              <TableHead className="px-3">
                Participants
              </TableHead>
              <TableHead className="px-3">Attended</TableHead>
              <TableHead className="px-3 w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow hoverable={false}>
                <TableCell
                  colSpan={6}
                  className="px-3 py-4 text-center text-[13px]"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  No intake connections scheduled.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="px-3 whitespace-nowrap">
                    {c.startDate} {c.startTime}
                  </TableCell>
                  <TableCell className="px-3 whitespace-nowrap">
                    {c.endDate} {c.endTime}
                  </TableCell>
                  <TableCell wrap className="px-3">
                    {c.location}
                  </TableCell>
                  <TableCell wrap className="px-3">
                    {c.participants
                      .map(
                        (p) =>
                          currentLabel.get(p.id) ?? p.label,
                      )
                      .join(", ")}
                  </TableCell>
                  <TableCell className="px-3">
                    <Badge
                      variant={
                        c.attended ? "success" : "outline"
                      }
                    >
                      {c.attended ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3">
                    <Button
                      type="button"
                      variant="ghost-primary"
                      size="icon-xs"
                      aria-label={`Edit intake connection ${c.startDate} ${c.startTime}`}
                      onClick={() => openEdit(c)}
                    >
                      <Pencil aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {mentee.intakeScheduledDate && (
        <p
          className="mt-2 text-[12px]"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          Legacy intake date on record:{" "}
          {mentee.intakeScheduledDate}. It was captured before
          Intake Connections, without a time, location or
          participants, so it is not shown as a scheduled
          connection.
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? "Edit Intake Connection"
                : "Schedule Intake"}
            </DialogTitle>
            <DialogDescription>
              Intake connection for {mentee.name}.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  ["startDate", "Start Date", "date"],
                  ["startTime", "Start Time", "time"],
                  ["endDate", "End Date", "date"],
                  ["endTime", "End Time", "time"],
                ] as const
              ).map(([k, label, kind]) => (
                <div key={k}>
                  <label
                    htmlFor={`ic-${k}`}
                    className="slds-form-label block mb-1.5"
                  >
                    {label}{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  {kind === "date" ? (
                    <DateInput
                      id={`ic-${k}`}
                      value={draft[k]}
                      onChange={(v) => set(k, v)}
                      required
                      {...fieldErr(k)}
                    />
                  ) : (
                    <TimeInput
                      id={`ic-${k}`}
                      surface="base"
                      value={draft[k]}
                      onChange={(v) => set(k, v)}
                      aria-required
                      {...fieldErr(k)}
                    />
                  )}
                  <FieldError id={`ic-${k}`} msg={errors[k]} />
                </div>
              ))}
            </div>
            <div>
              <label
                htmlFor="ic-location"
                className="slds-form-label block mb-1.5"
              >
                Location <span className="text-red-600">*</span>
              </label>
              <Input
                id="ic-location"
                aria-required
                surface="base"
                className="h-9 text-[13px]"
                value={draft.location}
                onChange={(e) =>
                  set("location", e.target.value)
                }
                {...fieldErr("location")}
              />
              <FieldError
                id="ic-location"
                msg={errors.location}
              />
            </div>
            <div>
              <label
                htmlFor="ic-participants"
                className="slds-form-label block mb-1.5"
              >
                Participants{" "}
                <span className="text-red-600">*</span>
              </label>
              <MultiSelect
                id="ic-participants"
                aria-label="Participants"
                options={[...known.keys()]}
                getOptionLabel={labelOf}
                value={draft.participants}
                onValueChange={(v) => set("participants", v)}
                {...fieldErr("participants")}
              />
              <FieldError
                id="ic-participants"
                msg={errors.participants}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="ic-attended"
                surface="base"
                checked={draft.attended}
                onCheckedChange={(v) =>
                  set("attended", v === true)
                }
              />
              <label
                htmlFor="ic-attended"
                className="text-[13px]"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Attended
              </label>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}