// Match & Activity tab for a mentor record: the mentor's matches, and the
// Match Activity Log of the selected match. Activities still belong to one
// exact match (shared with the Match record page) — this is another way in.

import { useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router";
import { Handshake } from "@/app/lib/lucide-icons";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Field, Section } from "../FriendsFirstMentorRecord";
import { FieldLabel } from "../FriendsFirstMenteeRecord";
import { FFMatchActivityLog } from "./FFMatchActivityLog";
import {
  getMentorMatches,
  getMentorMatchSourceStatus,
  menteeName,
  subscribeMentorMatches,
  type MentorMatch,
} from "../../data/mockMentorMatchData";

const toDate = (date: string, time: string) => {
  const dm = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
  const tm = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(
    time?.trim() ?? "",
  );
  if (!dm) return null;
  let h = tm ? Number(tm[1]) % 12 : 0;
  if (tm && tm[3].toUpperCase() === "PM") h += 12;
  return new Date(
    +dm[3],
    +dm[1] - 1,
    +dm[2],
    h,
    tm ? +tm[2] : 0,
  );
};
const status = (m: MentorMatch, now = new Date()) => {
  const start = toDate(m.startDate, m.startTime);
  const end = toDate(m.endDate, m.endTime);
  if (end && end <= now) return "Ended";
  if (start && start > now) return "Scheduled";
  return "Active";
};

let cacheKey = "";
let cacheValue: MentorMatch[] = [];
/** This mentor's matches, newest start first (stable snapshot). */
function snapshot(mentorId: string): MentorMatch[] {
  const list = getMentorMatches()
    .filter((m) => m.mentorId === mentorId)
    .sort(
      (a, b) =>
        (toDate(b.startDate, b.startTime)?.getTime() ?? 0) -
        (toDate(a.startDate, a.startTime)?.getTime() ?? 0),
    );
  const key = `${mentorId}:${JSON.stringify(list)}`;
  if (key !== cacheKey) {
    cacheKey = key;
    cacheValue = list;
  }
  return cacheValue;
}

export function FFMentorMatchActivity({
  mentorId,
}: {
  mentorId: string;
}) {
  const navigate = useNavigate();
  const matches = useSyncExternalStore(
    subscribeMentorMatches,
    () => snapshot(mentorId),
  );
  const [selected, setSelected] = useState("");
  const match =
    matches.find((m) => m.id === selected) ?? matches[0];

  if (getMentorMatchSourceStatus() === "unavailable")
    return (
      <Section title="Match & Activity" first>
        <EmptyState
          icon={Handshake}
          title="Mentor matches can't be loaded right now."
          description="Matches and their activities will show here once they can be read."
        />
      </Section>
    );
  if (!match)
    return (
      <Section title="Match & Activity" first>
        <EmptyState
          icon={Handshake}
          title="No mentor matches yet"
          description="Activities are logged on a mentor match. Once this mentor is matched with a mentee, the match and its activity log appear here."
        />
      </Section>
    );

  const st = status(match);
  return (
    <>
      <Section
        title="Match & Activity"
        first
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(
                `/friends-first-mentor-match/${match.id}`,
              )
            }
          >
            Open Match Record
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          {matches.length > 1 && (
            <div className="max-w-md">
              <FieldLabel htmlFor="mentor-match-select">
                Match
              </FieldLabel>
              <Select
                value={match.id}
                onValueChange={setSelected}
              >
                <SelectTrigger id="mentor-match-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {matches.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {menteeName(m.menteeId)} · {m.startDate} –{" "}
                      {m.endDate} ({status(m)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
            <Field
              label="Mentee"
              value={menteeName(match.menteeId)}
            />
            <Field
              label="Sub-Program"
              value={match.subProgram}
            />
            <Field
              label="Start"
              value={`${match.startDate} ${match.startTime}`.trim()}
            />
            <Field
              label="End"
              value={`${match.endDate} ${match.endTime}`.trim()}
            />
          </div>
          <div>
            <Badge
              variant={
                st === "Active"
                  ? "success"
                  : st === "Scheduled"
                    ? "info"
                    : "neutral"
              }
            >
              {st}
            </Badge>
          </div>
        </div>
      </Section>
      <div
        className="p-6"
        style={{
          borderTop:
            "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <FFMatchActivityLog key={match.id} matchId={match.id} />
      </div>
    </>
  );
}