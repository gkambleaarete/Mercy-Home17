// Observation panel for a row in the Community Care "My Members" table.
// Built from Mercy Home design-system components (Dialog, Avatar, Button,
// ToggleGroup, FieldLabel/FieldError, Textarea). PROTOTYPE: a saved
// observation is handed back to the caller and kept in page memory only.

import { useEffect, useState } from "react";
import { Check } from "@/app/lib/lucide-icons";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { FieldError, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { DateInput } from "../ui/date-input";
import { TimeInput } from "../ui/time-input";
import { formatMdy } from "../../lib/dateFormat";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const OBSERVATION_AREAS = [
  "Adult Interaction",
  "Peer Interaction",
  "Regulation/Bounce Back",
  "Organization",
  "Timeliness/Attendance",
  "Communication",
  "Daily Living",
  "Hygiene/Cleanliness",
  "Education/Career",
  "Healthy Boundaries",
  "Problem Solving",
  "Transitions",
  "Other Skill",
];

export const OUTCOME_DOMAINS = [
  "Belonging",
  "Socio-Emotional Wellness",
  "Self-Empowerment",
  "Navigation",
];

export type ObservationMember = {
  id: number;
  name: string;
  program: string;
  /** Constituent ID when the row maps to a real profile. */
  profileId: number | string | null;
};

export type SavedObservation = {
  memberId: number;
  date: string;
  time: string;
  outcomeDomain: string;
  areas: string[];
  comments: string;
  savedAt: string;
};

export function CommunityCareObservationSheet({
  member,
  onOpenChange,
  onSave,
  viewing,
  memberChoices,
}: {
  /** Optional: pick the member in the form (Add Observation). `member`
   *  then only opens the dialog; the picked choice is saved. */
  memberChoices?: (ObservationMember & { label?: string })[];
  member: ObservationMember | null;
  onOpenChange: (open: boolean) => void;
  onSave: (obs: SavedObservation) => void;
  /** Optional: open this saved observation for editing (prefilled). */
  viewing?: SavedObservation | null;
}) {
  const readOnly = false;
  const nowTime = () =>
    new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const [date, setDate] = useState(() => formatMdy(new Date()));
  const [time, setTime] = useState(nowTime);
  const [domain, setDomain] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pickedId, setPickedId] = useState<string>("");
  const picked = memberChoices?.find((m) => String(m.id) === pickedId) ?? null;
  // The member this observation is for.
  const target = memberChoices ? picked : member;

  // Fresh form each time the panel opens for a member.
  useEffect(() => {
    setPickedId("");
    setDate(viewing?.date ?? formatMdy(new Date()));
    setTime(viewing?.time ?? nowTime());
    setDomain(viewing?.outcomeDomain ?? "");
    setAreas(viewing?.areas ?? []);
    setComments(viewing?.comments ?? "");
    setSubmitted(false);
  }, [member?.id, viewing]);

  const areasError = submitted && areas.length === 0;
  const domainError = submitted && !domain;
  const dateError = submitted && !/^\d{2}\/\d{2}\/\d{4}$/.test(date);
  const timeError = submitted && !time;
  const initials = (target?.name ?? "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const save = () => {
    setSubmitted(true);
    if (
      !target ||
      !/^\d{2}\/\d{2}\/\d{4}$/.test(date) ||
      !time ||
      !domain ||
      areas.length === 0
    )
      return;
    onSave({
      memberId: target.id,
      date,
      time,
      outcomeDomain: domain,
      areas,
      comments: comments.trim(),
      savedAt: viewing?.savedAt ?? new Date().toISOString(),
    });
  };

  return (
    <Dialog open={member !== null} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        {member && (
          <>
            <DialogHeader className="flex-row items-center gap-4 pr-12">
{target && (
              <Avatar className="h-12 w-12">
                <AvatarFallback
                  className="font-semibold"
                  style={{
                    backgroundColor: "#d0dfd6",
                    color: "var(--color-brand-primary)",
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              )}
              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate">
                  {target?.name ?? "New Observation"}
                </DialogTitle>
                <DialogDescription className="truncate">
                  {target
                    ? `${target.profileId != null ? `ID: ${target.profileId} · ` : ""}${target.program}`
                    : "Select the member this observation is for."}
                </DialogDescription>
              </div>
            </DialogHeader>

            <DialogBody>
              <fieldset disabled={readOnly} className="space-y-6 min-w-0">
              {memberChoices && (
                <div className="space-y-2">
                  <FieldLabel required error={submitted && !target} htmlFor="obs-member">
                    Members
                  </FieldLabel>
                  <Select value={pickedId || undefined} onValueChange={setPickedId}>
                    <SelectTrigger id="obs-member" surface="base" aria-invalid={(submitted && !target) || undefined}>
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[260px]">
                      {memberChoices.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.label ?? m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {submitted && !target && <FieldError>Select a member.</FieldError>}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldLabel required error={dateError} htmlFor="obs-date">
                    Date
                  </FieldLabel>
                  <DateInput
                    id="obs-date"
                    value={date}
                    onChange={setDate}
                    required
                    aria-invalid={dateError || undefined}
                  />
                  {dateError && <FieldError>Enter a valid date (MM/DD/YYYY).</FieldError>}
                </div>
                <div className="space-y-2">
                  <FieldLabel required error={timeError} htmlFor="obs-time">
                    Time
                  </FieldLabel>
                  <TimeInput
                    id="obs-time"
                    surface="base"
                    value={time}
                    onChange={setTime}
                    aria-invalid={timeError || undefined}
                  />
                  {timeError && <FieldError>Enter a time.</FieldError>}
                </div>
              </div>

              <div className="space-y-2">
                <FieldLabel required error={domainError} htmlFor="obs-domain">
                  Outcome Domain
                </FieldLabel>
                <Select value={domain} onValueChange={setDomain} disabled={readOnly}>
                  <SelectTrigger
                    id="obs-domain"
                    surface="base"
                    className="w-full"
                    aria-invalid={domainError || undefined}
                  >
                    <SelectValue placeholder="Select an outcome domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {OUTCOME_DOMAINS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {domainError && <FieldError>Select an outcome domain.</FieldError>}
              </div>

              <div className="space-y-2">
                <FieldLabel required error={areasError} id="obs-areas-label">
                  Observations
                </FieldLabel>
                <ToggleGroup
                  type="multiple"
                  variant="brand"
                  value={areas}
                  onValueChange={setAreas}
                  disabled={readOnly}
                  aria-labelledby="obs-areas-label"
                  className="flex-wrap gap-2 shadow-none data-[variant=brand]:shadow-none"
                >
                  {OBSERVATION_AREAS.map((a) => (
                    <ToggleGroupItem
                      key={a}
                      value={a}
                      className="flex-none data-[variant=brand]:flex-none rounded-full px-4 first:rounded-full last:rounded-full border data-[variant=brand]:border-l data-[state=on]:!bg-[#145F33] data-[state=on]:!text-white data-[state=on]:!border-[#145F33]"
                    >
                      {a}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                {areasError && (
                  <FieldError>Select at least one observation area.</FieldError>
                )}
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="obs-comments">Additional Comments</FieldLabel>
                <Textarea
                  id="obs-comments"
                  rows={5}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any additional notes or context about this observation..."
                  aria-describedby="obs-comments-help"
                />
                <p
                  id="obs-comments-help"
                  className="text-[12px]"
                  style={{ color: "var(--slds-g-color-text-weak)" }}
                >
                  Provide specific details about behavior, interactions, or any
                  concerns.
                </p>
              </div>
              </fieldset>
            </DialogBody>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {readOnly ? "Close" : "Cancel"}
              </Button>
              {!readOnly && (
                <Button onClick={save}>
                  Save
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
