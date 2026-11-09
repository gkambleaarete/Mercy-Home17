// Mentor Match record (US 20039 Chunk 11): the match's details and its
// Match Activity Log, opened from Mentor Matches. Reads the match by exact
// id from the shared match repository (Inactive closures applied).

import { useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronRight } from "@/app/lib/lucide-icons";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { EmptyState } from "../ui/empty-state";
import { Field } from "../FriendsFirstMentorRecord";
import { FFMatchActivityLog } from "../ff-mentor/FFMatchActivityLog";
import { Search } from "@/app/lib/lucide-icons";
import {
  getMentorMatch,
  getMentorMatchSourceStatus,
  menteeName,
  mentorName,
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

function matchStatus(
  m: MentorMatch,
  now = new Date(),
): "Active" | "Ended" | "Scheduled" {
  const start = toDate(m.startDate, m.startTime);
  const end = toDate(m.endDate, m.endTime);
  if (end && end <= now) return "Ended";
  if (start && start > now) return "Scheduled";
  return "Active";
}

let cacheKey = "";
let cacheValue: MentorMatch | undefined;
function snapshot(id: string) {
  const m = getMentorMatch(id);
  const key = `${id}:${JSON.stringify(m)}`;
  if (key !== cacheKey) {
    cacheKey = key;
    cacheValue = m;
  }
  return cacheValue;
}

export function FriendsFirstMatchRecordPage() {
  const { matchId = "" } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const match = useSyncExternalStore(
    subscribeMentorMatches,
    () => snapshot(matchId),
  );
  const back = () => navigate("/friends-first-mentor-match");

  if (!match)
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <EmptyState
          icon={Search}
          title={
            getMentorMatchSourceStatus() === "unavailable"
              ? "Match information can't be loaded right now."
              : "Match not found"
          }
          description="Return to Mentor Matches to choose a match."
          actionLabel="Back to Mentor Matches"
          onAction={back}
        />
      </div>
    );

  const status = matchStatus(match);
  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{
        backgroundColor: "var(--slds-g-color-background-alt-2)",
      }}
    >
      <div
        className="px-4 sm:px-6 py-4"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[11px] mb-3"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          <button
            type="button"
            className="text-[11px] hover:text-[#014486] hover:underline"
            onClick={back}
          >
            Mentor Matches
          </button>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span
            aria-current="page"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            {match.id}
          </span>
        </nav>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-[20px] font-bold text-[var(--slds-g-color-text-default)]">
            {mentorName(match.mentorId)} –{" "}
            {menteeName(match.menteeId)}
          </h1>
          <Badge
            variant={
              status === "Active"
                ? "success"
                : status === "Scheduled"
                  ? "info"
                  : "neutral"
            }
          >
            {status}
          </Badge>
        </div>
      </div>
      <div className="p-3 pb-16 sm:p-6 sm:pb-16 flex flex-col gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
              <Field
                label="Mentor"
                value={mentorName(match.mentorId)}
              />
              <Field
                label="Mentee"
                value={menteeName(match.menteeId)}
              />
              <Field
                label="Sub-Program"
                value={match.subProgram}
              />
              <Field label="Match ID" value={match.id} />
              <Field
                label="Start"
                value={`${match.startDate} ${match.startTime}`.trim()}
              />
              <Field
                label="End"
                value={`${match.endDate} ${match.endTime}`.trim()}
              />
              <Field
                label="Days"
                value={match.days.join(", ")}
              />
              <Field label="Comment" value={match.comment} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <FFMatchActivityLog
              key={match.id}
              matchId={match.id}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}