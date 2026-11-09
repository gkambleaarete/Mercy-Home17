// US 20222 / 20223 — one Program's Log Feed rows projected from committed
// source records: manual entries, Staff Member Status, generated
// Location/Incident events, and saved Shift Handovers. Each row's id is its
// stable source identity, so re-rendering or re-saving a source never adds a
// second row; editing a handover updates its one row.

import {
  AlertTriangle,
  DoorClosed,
  DoorOpen,
  Eye,
  MapPin,
  Moon,
  Sun,
  Sunset,
  Users,
} from "@/app/lib/lucide-icons";
import type { GeneratedLogEvent, ManualLogEntry } from "../../data/programLogEntryStore";
import {
  fmt12h,
  normalizeShiftKey,
  recordedRoleLabel,
  type StaffStatusEntry,
} from "../../data/shiftRoleStore";

export interface ProgramLogFeedRow {
  id: string;
  type: string;
  title: string;
  content: string;
  author: string;
  time: string;
  date: Date;
  priority: string;
  tags: string[];
  badges: string[];
  details?: string;
  icon: unknown;
  iconColor: string;
  iconBg: string;
  /** Link back to the source record (details/corrections). */
  source: { kind: string; id: string | number };
}

const at = (date: string, time: string) => new Date(`${date}T${time || "00:00"}`);

export function staffStatusRows(entries: StaffStatusEntry[], programId: number): ProgramLogFeedRow[] {
  return entries
    .filter((e) => e.programId === programId)
    .map((e) => {
      const role = recordedRoleLabel(e);
      const action = e.statusAction ?? e.status;
      return {
        id: e.id,
        type: "Staff Member Status",
        title: "logged a Staff Member Status",
        content:
          `${e.staffNameAtSave || `Staff ${e.staffConstituentId}`}` +
          ` — ${role ?? "No shift role"}: ${action}` +
          (e.notes ? `\nNotes: ${e.notes}` : ""),
        author: e.createdBy,
        time: fmt12h(e.time),
        date: at(e.shiftDate, e.time),
        priority: "Low",
        tags: [],
        badges: [],
        icon: Users,
        iconColor: "text-teal-700",
        iconBg: "bg-teal-100",
        source: { kind: "staff-status", id: e.id },
      };
    });
}

export function manualRows(entries: ManualLogEntry[], programId: number): ProgramLogFeedRow[] {
  return entries
    .filter((e) => e.programId === programId)
    .map((e) => {
      const base = {
        id: e.id,
        type: e.logType,
        title: `logged a ${e.logType}`,
        author: e.createdBy,
        time: fmt12h(e.time),
        date: at(e.date, e.time),
        tags: [] as string[],
        source: { kind: "manual", id: e.id },
      };
      if (e.logType === "Milieu Observation")
        return {
          ...base,
          content: e.content ?? "",
          priority: e.priority ?? "Medium",
          badges: e.youth ?? [],
          details: (e.youth ?? []).join(", "),
          icon: Eye,
          iconColor: "text-blue-600",
          iconBg: "bg-blue-100",
        };
      const closed = e.action === "Closing";
      return {
        ...base,
        title: closed ? "Program Closed" : "Program Reopened",
        content: `${closed ? "Program Closed" : "Program Reopened"}${e.notes ? `\nNotes: ${e.notes}` : ""}`,
        priority: "Medium",
        badges: [],
        icon: closed ? DoorClosed : DoorOpen,
        iconColor: closed ? "text-red-700" : "text-green-700",
        iconBg: closed ? "bg-red-100" : "bg-green-100",
      };
    });
}

export function generatedRows(events: GeneratedLogEvent[], programId: number): ProgramLogFeedRow[] {
  return events
    .filter((e) => e.programId === programId)
    .map((e) =>
      e.logType === "Location"
        ? {
            id: e.key,
            type: "Location",
            title: "logged a Location",
            content: `${e.youthName}: ${e.previousLocation || "—"} → ${e.newLocation}`,
            author: e.createdBy,
            time: fmt12h(e.time),
            date: at(e.date, e.time),
            priority: "Low",
            tags: [],
            badges: [e.youthName],
            details: e.youthName,
            icon: MapPin,
            iconColor: "text-sky-700",
            iconBg: "bg-sky-100",
            source: { kind: "location", id: e.key },
          }
        : {
            id: e.key,
            type: "Incident",
            title: "logged an Incident",
            content: `Incident report finalized for ${e.youthName}${e.summary ? `\n${e.summary}` : ""}`,
            author: e.createdBy,
            time: fmt12h(e.time),
            date: at(e.date, e.time),
            priority: "High",
            tags: [],
            badges: [e.youthName],
            details: e.youthName,
            icon: AlertTriangle,
            iconColor: "text-red-600",
            iconBg: "bg-red-100",
            source: { kind: "incident", id: e.reportId ?? e.key },
          },
    );
}

export const HANDOVER_FEED_TYPE: Record<string, string> = {
  morning: "Morning Entry",
  afternoon: "Evening Entry",
  night: "Night Entry",
};

export interface SavedHandoverLike {
  id: number;
  author: string;
  summary: string;
  /** Set only by an actual Handover save (US 20222). */
  savedShift?: { key: string; date: string; time: string };
}

export function handoverRows(handovers: SavedHandoverLike[], programId: number): ProgramLogFeedRow[] {
  return handovers
    .filter((h) => h.savedShift)
    .map((h) => {
      const key = normalizeShiftKey(h.savedShift!.key);
      const type = HANDOVER_FEED_TYPE[key];
      return {
        id: `handover:${programId}:${h.id}`,
        type,
        title: `logged a ${type}`,
        content: h.summary,
        author: h.author,
        time: fmt12h(h.savedShift!.time),
        date: at(h.savedShift!.date, h.savedShift!.time),
        priority: "Medium",
        tags: [],
        badges: [],
        icon: key === "morning" ? Sun : key === "afternoon" ? Sunset : Moon,
        iconColor: "text-amber-700",
        iconBg: "bg-amber-100",
        source: { kind: "handover", id: h.id },
      };
    });
}

/** All projected rows for a Program, newest first. */
export function projectProgramLogFeed(args: {
  programId: number;
  staffStatus: StaffStatusEntry[];
  manual: ManualLogEntry[];
  generated: GeneratedLogEvent[];
  handovers: SavedHandoverLike[];
}): ProgramLogFeedRow[] {
  return [
    ...staffStatusRows(args.staffStatus, args.programId),
    ...manualRows(args.manual, args.programId),
    ...generatedRows(args.generated, args.programId),
    ...handoverRows(args.handovers, args.programId),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
}
