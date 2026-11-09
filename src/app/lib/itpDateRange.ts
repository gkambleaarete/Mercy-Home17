/**
 * Returns true when a record's dateTime string falls within [itpStart, itpEnd].
 * itpEnd may be null/empty, in which case only a lower-bound check is applied.
 * dateTimeStr may be "YYYY-MM-DD HH:mm" or "YYYY-MM-DD"; only the date portion
 * is compared so time-of-day does not affect eligibility.
 */
export function isWithinItpDateRange(
  dateTimeStr: string,
  itpStart: string,
  itpEnd: string | null | undefined,
): boolean {
  if (!dateTimeStr || !itpStart) return false;
  const recordDate = dateTimeStr.slice(0, 10); // "YYYY-MM-DD"
  if (recordDate < itpStart) return false;
  if (itpEnd && recordDate > itpEnd) return false;
  return true;
}

/**
 * Returns true when [planStart, planEnd] overlaps with [itpStart, itpEnd].
 * A null/empty end date is treated as open-ended (no upper bound).
 * Two ranges overlap when: planStart <= itpEnd AND itpStart <= planEnd.
 */
export function overlapsItpDateRange(
  planStart: string,
  planEnd: string | null | undefined,
  itpStart: string,
  itpEnd: string | null | undefined,
): boolean {
  if (!planStart || !itpStart) return false;
  // planStart must be on or before the ITP window's end (or ITP has no end)
  if (itpEnd && planStart > itpEnd) return false;
  // ITP start must be on or before the plan's end (or plan has no end)
  if (planEnd && itpStart > planEnd) return false;
  return true;
}
