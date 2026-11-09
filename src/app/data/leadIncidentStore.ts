// Session-only store for incidents created from the Admissions lead
// "Create New Incident" dialog. The Incidents tab merges these into its list.
// Mock state only.

export interface LeadIncidentRecord {
  id: number;
  incidentType: string;
  startDate: string; // MM/DD/YYYY
  startTime: string; // HH:MM
  endDate: string;
  endTime: string;
  individuals: string[];
  program: string;
  involvementType: string;
  location: string;
  description: string;
}

let created: LeadIncidentRecord[] = [];
const listeners = new Set<() => void>();

export function getCreatedLeadIncidents(): LeadIncidentRecord[] {
  return created;
}

export function subscribeLeadIncidents(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function addLeadIncident(
  input: Omit<LeadIncidentRecord, "id">,
): { ok: true; record: LeadIncidentRecord } | { ok: false; message: string } {
  try {
    const id = 100000 + created.length + 1;
    const record = { ...input, id };
    created = [record, ...created];
    listeners.forEach((l) => l());
    return { ok: true, record };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Unable to save." };
  }
}
