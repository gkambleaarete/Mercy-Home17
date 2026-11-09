// MHBG Staff — additional Constituent Details fields (US 20098): Campus,
// Agency Division, Program/Team and Email, keyed by the stable Constituent
// ID. Persisted to this browser's localStorage (same convention as
// communityNeedsStore) so saved values survive navigation and a page reload.
// Prototype only: there is no server persistence.
//
// `programTeam` is independent of Constituent.program. `email` carries the
// meaning of Constituent.email: until staff details are saved for a
// constituent, the form starts from the seed email; once saved, the saved
// value (including an intentional "") always wins.

export const CAMPUS_OPTIONS = [
  "West Loop Campus",
  "Walsh Girls Campus",
] as const;

export const AGENCY_DIVISION_OPTIONS = [
  "Advancement",
  "Community Care",
  "Education & Career Resources",
  "General Administration",
  "Information Systems",
  "Organizational Development",
  "Residential Programs",
] as const;

export const PROGRAM_TEAM_OPTIONS = [
  "Academy Admin",
  "Admissions",
  "Bernardin Home",
  "Bosco Home",
  "Campbell Home",
  "Career Resources",
  "Community Care",
  "Cooke Home",
  "Couderc Home",
  "Daley Home",
  "Donor Relations",
  "Education Resources",
  "Finance",
  "Friends First",
  "General Admin",
  "Girls Home - Administration",
  "Human Resources",
  "Information Management",
  "Kelly Home",
  "Mahoney Home",
  "Noha Home",
  "Organizational Development",
  "Philanthropy",
  "Program Admin - Boys",
  "Program Admin.",
  "Quille Home",
  "Seton Home",
  "Shell Home",
  "Speh Home",
  "Spiritual Development",
  "Training",
  "Walgreen Home",
  "Walsh Reception",
  "West Loop Support Staff",
] as const;

/** "" means no selection / no email entered. */
export interface StaffDetails {
  campus: string;
  agencyDivision: string;
  programTeam: string;
  email: string;
}

const STORAGE_KEY = "mh.mhbgStaffDetails.v1";

const OPTIONS: Record<
  Exclude<keyof StaffDetails, "email">,
  Set<string>
> = {
  campus: new Set(CAMPUS_OPTIONS),
  agencyDivision: new Set(AGENCY_DIVISION_OPTIONS),
  programTeam: new Set(PROGRAM_TEAM_OPTIONS),
};

const pick = (v: unknown, valid: Set<string>) =>
  typeof v === "string" && valid.has(v) ? v : "";

/** Reads saved records; unknown dropdown values load as unselected. */
function load(): Record<string, StaffDetails> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<
      string,
      Partial<StaffDetails>
    >;
    const out: Record<string, StaffDetails> = {};
    for (const [id, r] of Object.entries(parsed ?? {})) {
      if (!r || typeof r !== "object") continue;
      out[id] = {
        campus: pick(r.campus, OPTIONS.campus),
        agencyDivision: pick(
          r.agencyDivision,
          OPTIONS.agencyDivision,
        ),
        programTeam: pick(r.programTeam, OPTIONS.programTeam),
        email: typeof r.email === "string" ? r.email : "",
      };
    }
    return out;
  } catch {
    return {};
  }
}

let recordsByConstituent: Record<string, StaffDetails> = load();

/** Saved details, or form defaults (seed email, nothing selected). */
export function getStaffDetails(
  constituentId: string,
  seedEmail: string | undefined,
): StaffDetails {
  return (
    recordsByConstituent[constituentId] ?? {
      campus: "",
      agencyDivision: "",
      programTeam: "",
      email: seedEmail ?? "",
    }
  );
}

/**
 * Saves all four fields for one constituent. Writes the complete next
 * snapshot to storage first and only then updates memory, so a failed
 * write (private mode / quota / blocked) leaves the previous save intact
 * and returns false.
 */
export function saveStaffDetails(
  constituentId: string,
  details: StaffDetails,
): boolean {
  const next = {
    ...recordsByConstituent,
    [constituentId]: { ...details },
  };
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next),
    );
  } catch {
    return false;
  }
  recordsByConstituent = next;
  return true;
}