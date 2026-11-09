// US phone input mask — formats digits as the user types to "(xxx) xxx-xxxx".
// Same formatting as the (local) helper in admissions/LeadDetailEmploymentTab.

export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6)
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** True when the value holds a complete 10-digit US number. */
export function isCompletePhone(value: string): boolean {
  return value.replace(/\D/g, "").length === 10;
}