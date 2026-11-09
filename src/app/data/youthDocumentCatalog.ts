import type {
  CatalogEntry,
  CatalogProvider,
  CatalogState,
  RenewalRule,
  RenewalStatus,
} from "./youthDocumentTypes";

// Catalog boundary (US 20147). The approved Document Type > Document Name >
// Folder mappings and Renewal Frequency (spreadsheet column L) have NOT been
// supplied, so the approved provider reports "unavailable". Nothing here
// invents names, folders or renewal rules. A provider (the approved catalog
// once delivered, or a clearly labelled test/demo fixture) is installed with
// setCatalogProvider.

const APPROVED_UNAVAILABLE: CatalogProvider = {
  label: "Approved document catalog",
  approved: true,
  getCatalog: () => ({
    status: "unavailable",
    reason:
      "The approved document catalog (Document Type, Document Name, Folder and Renewal Frequency) has not been provided.",
  }),
};

let provider: CatalogProvider = APPROVED_UNAVAILABLE;
const listeners = new Set<() => void>();

export function setCatalogProvider(
  next: CatalogProvider | null,
): void {
  provider = next ?? APPROVED_UNAVAILABLE;
  listeners.forEach((l) => l());
}

export function getCatalogProvider(): CatalogProvider {
  return provider;
}

export function subscribeCatalog(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getCatalog(): CatalogState {
  return provider.getCatalog();
}

export function catalogEntries(): readonly CatalogEntry[] {
  const c = getCatalog();
  return c.status === "available" ? c.entries : [];
}

/** Approved names for a type. [] when none are configured. */
export function namesForType(
  documentType: string,
): CatalogEntry[] {
  return catalogEntries().filter(
    (e) => e.documentType === documentType,
  );
}

export function findCatalogEntry(
  id: string | null | undefined,
): CatalogEntry | null {
  if (!id) return null;
  return catalogEntries().find((e) => e.id === id) ?? null;
}

/** Entry for an exact type + name pair, or null (no fuzzy matching). */
export function findEntryByTypeAndName(
  documentType: string,
  documentName: string,
): CatalogEntry | null {
  return (
    catalogEntries().find(
      (e) =>
        e.documentType === documentType &&
        e.documentName === documentName,
    ) ?? null
  );
}

export function restrictedFolder(): string | null {
  const c = getCatalog();
  return c.status === "available" ? c.restrictedFolder : null;
}

export function renewalStatusOf(
  rule: RenewalRule | undefined,
): RenewalStatus {
  if (!rule || rule.kind === "unknown") return "unknown";
  return rule.kind;
}

// ── Date arithmetic (date-only, no timezone drift) ────────────────────

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidIsoDate(v: string): boolean {
  const m = ISO.exec(v);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === mo - 1 &&
    dt.getUTCDate() === d
  );
}

function daysInMonth(y: number, m0: number): number {
  return new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();
}

function fmt(y: number, m0: number, d: number): string {
  const dt = new Date(Date.UTC(y, m0, d));
  return dt.toISOString().slice(0, 10);
}

/**
 * Expiration for a confirmed recurring rule: base date + period. Returns
 * null when the rule is not a confirmed recurring one or the base date is
 * missing/invalid — never a guess.
 */
export function calculateExpiration(
  rule: RenewalRule | undefined,
  dates: { dateExecuted: string | null; dateFiled: string | null },
): string | null {
  if (!rule || rule.kind !== "recurring") return null;
  if (!Number.isInteger(rule.every) || rule.every <= 0)
    return null;
  const base =
    rule.base === "dateExecuted"
      ? dates.dateExecuted
      : dates.dateFiled;
  if (!base || !isValidIsoDate(base)) return null;
  const [y, mo, d] = base.split("-").map(Number);
  if (rule.unit === "day")
    return fmt(y, mo - 1, d + rule.every);
  if (rule.unit === "week")
    return fmt(y, mo - 1, d + 7 * rule.every);
  const totalMonths =
    (rule.unit === "year" ? 12 : 1) * rule.every;
  const idx = y * 12 + (mo - 1) + totalMonths;
  const ty = Math.floor(idx / 12);
  const tm = idx % 12;
  // "clamp": a day past the target month's end lands on its last day.
  return fmt(ty, tm, Math.min(d, daysInMonth(ty, tm)));
}