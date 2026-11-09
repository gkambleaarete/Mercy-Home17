import { isoToMdy } from "../../lib/dateFormat";

// Sample Date/Time conversions for Program Substance Tests. Pure string
// work — no Date objects, so there is no timezone to shift through.
//
//   store:   "YYYY-MM-DDTHH:mm"       (mockSubstanceTestData sampleDateTime)
//   modal:   "MM/DD/YYYY, h:mm AM"    (SubstanceUseTestingModals dateTime)
//   display: "MM/DD/YYYY hh:mm AM"    (Program lists and View)

const STORE_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const MODAL_RE =
  /^(\d{2})\/(\d{2})\/(\d{4}), (\d{1,2}):(\d{2}) (AM|PM)$/;

function isRealDate(y: number, m: number, d: number): boolean {
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return m >= 1 && m <= 12 && d >= 1 && d <= days;
}

function parseStore(value: string) {
  const m = STORE_RE.exec(value);
  if (!m) return null;
  const [, y, mo, d, h, min] = m;
  if (!isRealDate(+y, +mo, +d) || +h > 23 || +min > 59)
    return null;
  return { y, mo, d, hours: +h, min };
}

/** Store → display, e.g. "10/07/2026 03:10 PM". "" when malformed. */
export function formatSampleDateTime(value: string): string {
  const p = parseStore(value);
  if (!p) return "";
  const hh = String(p.hours % 12 || 12).padStart(2, "0");
  return `${isoToMdy(`${p.y}-${p.mo}-${p.d}`)} ${hh}:${p.min} ${p.hours < 12 ? "AM" : "PM"}`;
}

/** Store → modal, e.g. "10/07/2026, 3:10 PM". null when malformed. */
export function toModalDateTime(value: string): string | null {
  const p = parseStore(value);
  if (!p) return null;
  return `${p.mo}/${p.d}/${p.y}, ${p.hours % 12 || 12}:${p.min} ${p.hours < 12 ? "AM" : "PM"}`;
}

/** Modal → store, e.g. "2026-10-07T15:10". null when malformed or not a
 *  real calendar date / time. */
export function fromModalDateTime(
  value: string,
): string | null {
  const m = MODAL_RE.exec(value);
  if (!m) return null;
  const [, mo, d, y, h, min, ampm] = m;
  const h12 = +h;
  if (
    !isRealDate(+y, +mo, +d) ||
    h12 < 1 ||
    h12 > 12 ||
    +min > 59
  )
    return null;
  const h24 = (h12 % 12) + (ampm === "PM" ? 12 : 0);
  return `${y}-${mo}-${d}T${String(h24).padStart(2, "0")}:${min}`;
}