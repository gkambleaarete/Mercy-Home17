/**
 * Outlook Calendar Sync — prototype integration layer (User Story 20047).
 *
 * No Microsoft Graph call is made. The in-memory event store below stands
 * in for Outlook; each create/update/cancel is the point where the backend
 * will call Graph (create event / PATCH event / cancel event), using the
 * stored event id as the link between a Connection target and its event.
 *
 *   - outlookCreate / outlookUpdate / outlookCancel → Microsoft Graph calls
 *   - PROGRAM_SHARED_CALENDARS / YOUTH_PROGRAM      → real program data
 *   - isMercyHomeStaffParticipant                   → real staff/user lookup
 *
 * Applies only to Admissions Shadow and Family Partnership Meeting. Events go
 * to Mercy Home STAFF participants and one program shared calendar — never to
 * the youth, parents/guardians or other non-staff participants.
 */

import type { Connection } from "../components/admissions/ConnectionFormDialog";
import { parseConnectionStart } from "../components/admissions/connectionStatusRules";
import { getConnectionRecordPath } from "./connectionSchedulingNotification";
import {
  STAFF_DIRECTORY,
  resolveStaffMember,
} from "./admissionShadowReportTask";

const SYNCED_TYPES = [
  "Admissions Shadow",
  "Family Partnership Meeting",
];

export interface OutlookCalendarEvent {
  id: string;
  connectionId: string;
  targetType: "staff" | "program-shared-calendar";
  targetId: string;
  targetName: string;
  connectionType: string;
  youthId: string;
  youthName: string;
  title: string;
  /** ISO timestamps. */
  startAt: string;
  endAt: string;
  location?: string;
  connectionLink: string;
  status: "Active" | "Cancelled";
  createdAt: string;
  updatedAt: string;
}

/** Participant row as the Connection form stores it. */
export interface CalendarParticipant {
  constituentType: "Constituent" | "Non-Constituent";
  participant: string;
  role: string;
}

// ─── Staff participants ──────────────────────────────────────────────────────
/** Roles that are never Mercy Home staff, whatever the row type. */
const NON_STAFF_ROLES = new Set([
  "Youth",
  "Parent/Guardian",
  "Sibling",
  "Family Member",
  "External Constituent",
  "Community Care Member",
  "Community Care Scholar",
  "Ridgeland Tenant",
  "Friends First Mentee",
]);

/** A participant is staff only when positively identified: a name, a role
 *  that isn't youth/family/external, and an actual entry in the staff
 *  directory. Being a Non-Constituent row alone does not qualify. */
export function isMercyHomeStaffParticipant(
  p: CalendarParticipant,
): boolean {
  const name = p.participant.trim().toLowerCase();
  if (!name || NON_STAFF_ROLES.has(p.role)) return false;
  return STAFF_DIRECTORY.some(
    (s) => s.name.toLowerCase() === name,
  );
}

// ─── Program shared calendar ─────────────────────────────────────────────────
// Placeholder: program → its shared Outlook calendar, and the youth's
// program used when the meeting record names none.
const PROGRAM_SHARED_CALENDARS: Record<
  string,
  { id: string; name: string }
> = {
  Residential: {
    id: "calendar-residential",
    name: "Residential Program Calendar",
  },
  "Day School": {
    id: "calendar-day-school",
    name: "Day School Program Calendar",
  },
  "Family Services": {
    id: "calendar-family-services",
    name: "Family Services Program Calendar",
  },
  "Transitional Living": {
    id: "calendar-transitional-living",
    name: "Transitional Living Program Calendar",
  },
};
const YOUTH_PROGRAM: Record<string, string> = {
  "aarete-test": "Residential",
};

/** Shared calendar of the program the meeting is held in: the record's
 *  first Program, else the youth's program. */
export function getProgramSharedCalendar(
  connection: Pick<Connection, "programs">,
  youthId: string,
): { id: string; name: string } | null {
  const program =
    connection.programs
      ?.split(",")
      .map((p) => p.trim())
      .find(Boolean) ?? YOUTH_PROGRAM[youthId] ??
      YOUTH_PROGRAM["aarete-test"]; // prototype default program
  return (program && PROGRAM_SHARED_CALENDARS[program]) || null;
}

// ─── Event store (stands in for Outlook) ─────────────────────────────────────
const events = new Map<string, OutlookCalendarEvent>();

export function getOutlookCalendarEvents(
  connectionId?: string,
): OutlookCalendarEvent[] {
  return [...events.values()].filter(
    (e) => !connectionId || e.connectionId === connectionId,
  );
}

const eventId = (
  connectionId: string,
  type: OutlookCalendarEvent["targetType"],
  targetId: string,
) =>
  `outlook-${connectionId}-${type === "staff" ? "staff" : "program"}-${targetId}`;

// Integration points — replace with Microsoft Graph calls.
function outlookCreate(event: OutlookCalendarEvent) {
  events.set(event.id, event);
}
function outlookUpdate(
  id: string,
  changes: Partial<OutlookCalendarEvent>,
) {
  const e = events.get(id);
  if (e)
    events.set(id, {
      ...e,
      ...changes,
      updatedAt: new Date().toISOString(),
    });
}
function outlookCancel(id: string) {
  outlookUpdate(id, { status: "Cancelled" });
}

/** Cancels every active event for the Connection (staff + shared calendar).
 *  Returns how many were cancelled. */
export function cancelConnectionCalendarEvents(
  connectionId: string,
): number {
  const active = getOutlookCalendarEvents(connectionId).filter(
    (e) => e.status === "Active",
  );
  active.forEach((e) => outlookCancel(e.id));
  return active.length;
}

type ConnectionFields = Pick<
  Connection,
  | "id"
  | "type"
  | "status"
  | "startDate"
  | "startTime"
  | "endDate"
  | "endTime"
  | "location"
  | "programs"
> & { locationOther?: string };

const locationOf = (c: ConnectionFields) =>
  (c.location === "Other"
    ? c.locationOther
    : c.location
  )?.trim() || undefined;

export interface CalendarSyncResult {
  created: number;
  updated: number;
  cancelled: number;
}

/**
 * Brings the Connection's calendar events in line with the saved record:
 * CREATE events for new staff participants / the shared calendar, UPDATE
 * every active event when Start/End Date/Time or Location changed, CANCEL
 * events for removed staff, a changed program, or a Cancelled Connection.
 * Event ids are stable per Connection + target, so repeat saves never
 * duplicate. Call only after the Connection has been saved.
 */
export function syncConnectionToOutlookCalendar(input: {
  previousConnection: ConnectionFields | null;
  connection: ConnectionFields;
  participants: CalendarParticipant[];
  youth: { id: string; name: string };
}): CalendarSyncResult {
  const {
    previousConnection,
    connection,
    participants,
    youth,
  } = input;
  const result: CalendarSyncResult = {
    created: 0,
    updated: 0,
    cancelled: 0,
  };
  if (!SYNCED_TYPES.includes(connection.type)) return result;

  // Cancelled: cancel everything once; never recreate for a cancelled record.
  if (connection.status === "Cancelled") {
    if (previousConnection?.status !== "Cancelled")
      result.cancelled = cancelConnectionCalendarEvents(
        connection.id,
      );
    return result;
  }

  const start = parseConnectionStart(
    connection.startDate,
    connection.startTime,
  );
  const end = parseConnectionStart(
    connection.endDate,
    connection.endTime,
  );
  if (!start || !end) return result;

  // Targets this Connection should have an active event for
  const targets = new Map<
    string,
    {
      type: OutlookCalendarEvent["targetType"];
      id: string;
      name: string;
    }
  >();
  for (const p of participants.filter(
    isMercyHomeStaffParticipant,
  )) {
    const staff = resolveStaffMember(p.participant);
    targets.set(eventId(connection.id, "staff", staff.id), {
      type: "staff",
      id: staff.id,
      name: staff.name,
    });
  }
  const calendar = getProgramSharedCalendar(
    connection,
    youth.id,
  );
  if (calendar)
    targets.set(
      eventId(
        connection.id,
        "program-shared-calendar",
        calendar.id,
      ),
      {
        type: "program-shared-calendar",
        id: calendar.id,
        name: calendar.name,
      },
    );

  const timing = {
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    location: locationOf(connection),
  };
  const timingChanged =
    !previousConnection ||
    ["startDate", "startTime", "endDate", "endTime"].some(
      (k) =>
        previousConnection[k as keyof ConnectionFields] !==
        connection[k as keyof ConnectionFields],
    ) ||
    locationOf(previousConnection) !== timing.location;

  // Cancel active events whose target is gone (removed staff, changed program)
  for (const e of getOutlookCalendarEvents(connection.id))
    if (e.status === "Active" && !targets.has(e.id)) {
      outlookCancel(e.id);
      result.cancelled++;
    }

  const now = new Date().toISOString();
  for (const [id, target] of targets) {
    const existing = events.get(id);
    if (existing?.status === "Active") {
      if (timingChanged) {
        outlookUpdate(id, timing);
        result.updated++;
      }
      continue;
    }
    // New target (or one re-added after removal) → one active event
    outlookCreate({
      id,
      connectionId: connection.id,
      targetType: target.type,
      targetId: target.id,
      targetName: target.name,
      connectionType: connection.type,
      youthId: youth.id,
      youthName: youth.name,
      title: `${connection.type} - ${youth.name}`,
      ...timing,
      connectionLink: getConnectionRecordPath(
        youth.id,
        connection.id,
      ),
      status: "Active",
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    result.created++;
  }
  return result;
}