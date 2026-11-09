// Birth Name / Maiden Name (US 20161): optional free-text Constituent Details
// field for Youth, Community Care Member and Admissions Youth profiles.
// Persisted to this browser's localStorage (same convention as
// staffDetailsStore). Prototype only: there is no server persistence.
//
// Ownership is by stable ID, never by name:
//   "constituent:<Constituent ID>"  a Constituent Youth / Community Care Member
//   "admission:<Admissions lead id>" an Admissions record with no Youth link
// An Admissions record with an explicit youthConstituentId link reads and
// writes the linked Constituent's value, so both views show the same value.
// Once linked, both views show only the Constituent's value, so they can never
// differ. A value saved on the Admissions record before the link stays stored
// under that record, untouched and not copied; it is not shown while linked
// (open decision: whether to adopt it when the Constituent has none).

export interface BirthNameOwner {
  /** Admissions lead id (Admissions profiles only). */
  admissionId?: string;
  /** Constituent ID: the profile itself, or the Admissions explicit link. */
  constituentId?: string;
}

const STORAGE_KEY = "mh.birthName.v1";

type Persisted =
  | { ok: true; map: Record<string, unknown> }
  | { ok: false };

/**
 * Reads the current persisted map. Absent storage is a genuinely empty map;
 * a storage error or malformed data is a failure, never an empty map.
 */
function readPersisted(): Persisted {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { ok: true, map: {} };
    const parsed: unknown = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    )
      return { ok: false };
    return { ok: true, map: parsed as Record<string, unknown> };
  } catch {
    return { ok: false };
  }
}

const onlyStrings = (map: Record<string, unknown>) => {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(map)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
};

// Read cache only. Saves never build from it (another tab may have written
// since); reads refresh it from storage and fall back to it on a read failure.
let values: Record<string, string> = {};
{
  const first = readPersisted();
  if (first.ok) values = onlyStrings(first.map);
}

function current(): Record<string, string> {
  const r = readPersisted();
  if (r.ok) values = onlyStrings(r.map);
  return values;
}

const constituentKey = (id: string) => `constituent:${id}`;
const admissionKey = (id: string) => `admission:${id}`;

/** The record a save writes to; null when the owner has no usable id. */
export function birthNameWriteKey(
  owner: BirthNameOwner,
): string | null {
  if (owner.constituentId) return constituentKey(owner.constituentId);
  if (owner.admissionId) return admissionKey(owner.admissionId);
  return null;
}

/** Saved value for the owner ("" when none; legacy records have none). */
export function getBirthName(owner: BirthNameOwner): string {
  const all = current();
  if (owner.constituentId) {
    return all[constituentKey(owner.constituentId)] ?? "";
  }
  if (owner.admissionId) {
    return all[admissionKey(owner.admissionId)] ?? "";
  }
  return "";
}

/**
 * Saves (or, for a blank value, clears) the owner's value. Re-reads the
 * persisted map and changes only this owner's key, so values saved since this
 * tab loaded (for anyone) are kept; entries it does not understand are kept
 * as stored. Returns false, leaving storage untouched, when the map cannot be
 * read or is malformed, or when the write fails. Memory updates only after a
 * successful write.
 *
 * Limitation: read-modify-write is not atomic. Two tabs saving at the very
 * same instant can still lose one update; sequential saves from stale tabs
 * are safe.
 */
export function saveBirthName(
  owner: BirthNameOwner,
  value: string,
): boolean {
  const key = birthNameWriteKey(owner);
  if (!key) return false;
  const fresh = readPersisted();
  if (!fresh.ok) return false;
  const next = { ...fresh.map };
  const trimmed = value.trim();
  // A cleared Constituent value stays as "" so a fallback Admissions value
  // does not reappear after the user cleared the field.
  if (trimmed === "" && key.startsWith("admission:")) delete next[key];
  else next[key] = trimmed;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return false;
  }
  values = onlyStrings(next);
  return true;
}
