import { useSyncExternalStore } from "react";
import { YOUTH_STATUS } from "../components/pages/programLogData";
import { findYouthIdByName } from "./mockYouthProgramData";
import { getPassById, usePasses } from "./mockPassData";
import { recordLocationChange } from "../lib/locationLogEvents";

// Youth Current Location (20043) — the single source of truth. Seeded from
// Program Log's YOUTH_STATUS[].status (which stays the seed only), keyed by
// the same youthId a PassRecord carries, so a Pass updates exactly its own
// youth. Program Log rows with no enrollment fall back to "pl-<row id>".
//
// `sourcePassId` is set only when Pass start automation set "Pass"; any
// manual change clears it. The Pass is referenced by id — never a copy of
// its dates — so the hover always reflects the Pass as it is now.

export type LocationSource = "seed" | "manual" | "pass";

export interface YouthLocation {
  location: string;
  source: LocationSource;
  sourcePassId: number | null;
}

type ProgramLogYouth = { id: number; name: string; constituentId?: number };

/** Location shown for a youth with no recorded Current Location yet. */
export const DEFAULT_YOUTH_LOCATION = "Onground";

/** Stable key for a Program Log youth row (matches PassRecord.youthId).
 *  Program-scoped rows (US 20222) carry their real Constituent ID. */
export function youthLocationKey(youth: ProgramLogYouth): string {
  if (youth.constituentId !== undefined) return String(youth.constituentId);
  return findYouthIdByName(youth.name) ?? `pl-${youth.id}`;
}

let locations: Record<string, YouthLocation> = Object.fromEntries(
  YOUTH_STATUS.map((y) => [
    youthLocationKey(y),
    { location: y.status, source: "seed" as const, sourcePassId: null },
  ]),
);

const listeners = new Set<() => void>();

export function subscribeYouthLocations(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return locations;
}

export function getYouthLocation(youthId: string): YouthLocation | undefined {
  return locations[youthId];
}

/** The only write path. A manual change (or any non-Pass value) always
 *  clears the Pass association. */
export function setYouthLocation(
  youthId: string,
  location: string,
  meta:
    | { source: "manual"; programId?: number }
    | { source: "pass"; passId: number },
): void {
  const previous = locations[youthId]?.location ?? DEFAULT_YOUTH_LOCATION;
  locations = {
    ...locations,
    [youthId]: {
      location,
      source: meta.source,
      sourcePassId: meta.source === "pass" ? meta.passId : null,
    },
  };
  listeners.forEach((l) => l());
  // US 20222: one Location log event per committed, effective change.
  recordLocationChange({
    youthId,
    previous,
    next: location,
    source: meta.source,
    passId: meta.source === "pass" ? meta.passId : null,
    programId: meta.source === "manual" ? meta.programId : undefined,
  });
}

/** Reactive Current Location for a Program Log youth row, plus its hover
 *  label. Also subscribes to Passes so an edit/delete of the source Pass
 *  updates the label immediately. */
export function useYouthLocation(
  youth: ProgramLogYouth,
): YouthLocation & { label: string } {
  const all = useSyncExternalStore(subscribeYouthLocations, getSnapshot, getSnapshot);
  usePasses();
  const loc = all[youthLocationKey(youth)] ?? {
    location: (youth as { status?: string }).status ?? "",
    source: "seed" as const,
    sourcePassId: null,
  };
  return { ...loc, label: youthLocationLabel(loc) };
}

function md(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${m}/${d}`;
}

/** Hover text for the location indicator. Only the Pass case is extended:
 *  automation-set → "Pass M/D - M/D" from the source Pass's CURRENT dates;
 *  manual Pass, or a source Pass that no longer exists → "Pass". */
export function youthLocationLabel(loc: YouthLocation): string {
  if (loc.location !== "Pass" || loc.sourcePassId === null) return loc.location;
  const pass = getPassById(loc.sourcePassId);
  return pass ? `Pass ${md(pass.startDate)} - ${md(pass.endDate)}` : "Pass";
}