// US 20222 — "Location" Program Log events, produced at the canonical
// Current Location write (setYouthLocation). Covers manual updates and Pass
// start automation alike, even while Program Log is closed. The Program is
// resolved at the time of the change from the youth's canonical
// Constituent ID and a valid ACTIVE enrollment (checked against the
// Program's active-youth query), and stored on the event so a later
// transfer leaves this history in the original Program.

import {
  getActiveYouthForProgram,
  getYouthProgramEnrollments,
} from "../data/mockYouthProgramData";
import {
  localDateTimeParts,
  upsertGeneratedEvent,
} from "../data/programLogEntryStore";
import { CURRENT_USER_NAME } from "../data/mockProgramsData";

let seq = 0;

/** The youth's active enrollment in THIS Program, or null. */
export function activeYouthInProgram(
  youthId: string | number,
  programId: number,
): { programId: number; youthName: string } | null {
  const constituentId = Number(youthId);
  if (!Number.isInteger(constituentId)) return null;
  const y = getActiveYouthForProgram(programId).find(
    (a) => a.constituentId === constituentId,
  );
  return y ? { programId, youthName: y.name } : null;
}

/** null = no valid enrollment, so no Program owns the event. When the
 *  caller states the Program (a manual change made inside it), only that
 *  Program is accepted. */
export function resolveYouthProgram(
  youthId: string,
  programId?: number,
): { programId: number; youthName: string } | null {
  if (programId !== undefined) return activeYouthInProgram(youthId, programId);
  const constituentId = Number(youthId);
  if (!Number.isInteger(constituentId)) return null; // "pl-…" mock rows
  for (const e of getYouthProgramEnrollments()) {
    if (e.constituentId !== constituentId || !e.active) continue;
    const y = getActiveYouthForProgram(e.programId).find(
      (a) => a.constituentId === constituentId,
    );
    if (y) return { programId: e.programId, youthName: y.name };
  }
  return null;
}

export function recordLocationChange(args: {
  youthId: string;
  previous: string | undefined;
  next: string;
  source: "manual" | "pass";
  passId: number | null;
  /** Explicit Program context of a manual change. */
  programId?: number;
  at?: Date;
}): void {
  if (args.previous === args.next) return; // unchanged → no event
  const owner = resolveYouthProgram(args.youthId, args.programId);
  if (!owner) return;
  const { date, time } = localDateTimeParts(args.at);
  seq += 1;
  upsertGeneratedEvent({
    key: `location:${args.youthId}:${Date.now().toString(36)}:${seq}`,
    programId: owner.programId,
    logType: "Location",
    date,
    time,
    youthName: owner.youthName,
    previousLocation: args.previous ?? "",
    newLocation: args.next,
    passId: args.passId,
    createdBy: args.source === "pass" ? "Pass automation" : CURRENT_USER_NAME,
  });
}
