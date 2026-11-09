import { parseIsoLocal, toLocalIso } from "./dateFormat";

/** True only for a real calendar date written as "YYYY-MM-DD" (rejects
 *  partial typing, garbage and impossible dates such as 2026-02-31). */
export function isValidIsoDate(iso?: string | null): boolean {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  return toLocalIso(parseIsoLocal(iso)) === iso;
}
