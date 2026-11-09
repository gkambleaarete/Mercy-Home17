import type { YouthDocument } from "../data/youthDocumentTypes";

/** Stable filter token for a blank date. */
export const BLANK = "__blank__";

// Pure list logic for the Youth Documents table (US 20147): column-header
// value filters, sorting, folder grouping and pagination. Input is always the
// ALREADY AUTHORIZED list, so options, groups, counts and pages can never
// reveal a hidden record.

export type DocColumn =
  | "documentName"
  | "documentType"
  | "folder"
  | "dateFiled"
  | "dateExecuted"
  | "expirationDate";

/** Exact table order. */
export const DOC_COLUMNS: readonly {
  key: DocColumn;
  label: string;
}[] = [
  { key: "documentName", label: "Document Name" },
  { key: "documentType", label: "Document Type" },
  { key: "folder", label: "Folder" },
  { key: "dateFiled", label: "Date Filed" },
  { key: "dateExecuted", label: "Date Executed" },
  { key: "expirationDate", label: "Expiration Date" },
];

/** Stable (unformatted) value a column filters on. Dates are ISO strings,
 *  so two distinct dates can never collide the way formatted text could. */
export function filterValue(
  d: YouthDocument,
  col: DocColumn,
): string {
  switch (col) {
    case "documentName":
      return d.documentName;
    case "documentType":
      return d.documentType;
    case "folder":
      return d.effectiveFolder;
    case "dateFiled":
      return d.dateFiled || BLANK;
    case "dateExecuted":
      return d.dateExecuted || BLANK;
    case "expirationDate":
      return d.expirationDate || BLANK;
  }
}

const isDateCol = (c: DocColumn) =>
  c === "dateFiled" ||
  c === "dateExecuted" ||
  c === "expirationDate";

/** Distinct values present in `docs`, sorted; Blank last. */
export function filterOptions(
  docs: readonly YouthDocument[],
  col: DocColumn,
): string[] {
  const set = new Set(docs.map((d) => filterValue(d, col)));
  const vals = [...set];
  return vals.sort((a, b) => {
    if (a === BLANK) return 1;
    if (b === BLANK) return -1;
    return isDateCol(col)
      ? a.localeCompare(b)
      : a.localeCompare(b, undefined, { sensitivity: "base" });
  });
}

export type DocFilters = Partial<Record<DocColumn, string[]>>;

/** OR within a column, AND across columns. An empty selection = no filter. */
export function applyFilters(
  docs: readonly YouthDocument[],
  filters: DocFilters,
): YouthDocument[] {
  const active = DOC_COLUMNS.filter(
    (c) => (filters[c.key]?.length ?? 0) > 0,
  );
  if (active.length === 0) return [...docs];
  return docs.filter((d) =>
    active.every((c) =>
      (filters[c.key] as string[]).includes(
        filterValue(d, c.key),
      ),
    ),
  );
}

export type SortDir = "asc" | "desc";

const cmp = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: "base" });

/** Blank dates sort last in both directions. */
function compareBy(
  col: DocColumn,
  dir: SortDir,
): (a: YouthDocument, b: YouthDocument) => number {
  const sign = dir === "asc" ? 1 : -1;
  return (a, b) => {
    const va = filterValue(a, col);
    const vb = filterValue(b, col);
    if (isDateCol(col) && (va === BLANK || vb === BLANK)) {
      if (va === vb) return a.id.localeCompare(b.id);
      return va === BLANK ? 1 : -1;
    }
    return sign * cmp(va, vb) || a.id.localeCompare(b.id);
  };
}

export interface FolderGroup {
  folder: string;
  /** All rows in this folder after filtering (across every page). */
  total: number;
  rows: YouthDocument[];
}

/** Group by effective folder. Folder order follows the Folder column's sort
 *  direction (ascending otherwise); rows inside a folder follow the active
 *  sort (Document Name when sorting by Folder). */
export function groupByFolder(
  docs: readonly YouthDocument[],
  sortCol: DocColumn,
  sortDir: SortDir,
): FolderGroup[] {
  const map = new Map<string, YouthDocument[]>();
  for (const d of docs) {
    const arr = map.get(d.effectiveFolder) ?? [];
    arr.push(d);
    map.set(d.effectiveFolder, arr);
  }
  const rowCol =
    sortCol === "folder" ? "documentName" : sortCol;
  const rowDir = sortCol === "folder" ? "asc" : sortDir;
  const folderSign =
    sortCol === "folder" && sortDir === "desc" ? -1 : 1;
  return [...map.entries()]
    .sort((a, b) => folderSign * cmp(a[0], b[0]))
    .map(([folder, rows]) => ({
      folder,
      total: rows.length,
      rows: [...rows].sort(compareBy(rowCol, rowDir)),
    }));
}

export interface PageGroup {
  folder: string;
  /** Rows of this folder on this page. */
  rows: YouthDocument[];
  total: number;
  /** True when earlier rows of this folder sit on a previous page. */
  continued: boolean;
}

export interface PageResult {
  page: number;
  totalPages: number;
  totalRows: number;
  /** 1-based inclusive range of rows shown, 0/0 when empty. */
  start: number;
  end: number;
  groups: PageGroup[];
}

/** Slice the grouped rows into one page. Each row appears on exactly one
 *  page; a folder spanning pages gets its heading on each of them. An
 *  out-of-range page is clamped to a valid one. */
export function paginateGroups(
  groups: readonly FolderGroup[],
  page: number,
  pageSize: number,
): PageResult {
  const totalRows = groups.reduce(
    (n, g) => n + g.rows.length,
    0,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(totalRows / pageSize),
  );
  const safe = Math.min(Math.max(1, page), totalPages);
  const from = (safe - 1) * pageSize;
  const to = from + pageSize;
  const out: PageGroup[] = [];
  let offset = 0;
  for (const g of groups) {
    const gStart = offset;
    const gEnd = offset + g.rows.length;
    offset = gEnd;
    if (gEnd <= from || gStart >= to) continue;
    const a = Math.max(from, gStart) - gStart;
    const b = Math.min(to, gEnd) - gStart;
    out.push({
      folder: g.folder,
      rows: g.rows.slice(a, b),
      total: g.total,
      continued: a > 0,
    });
  }
  return {
    page: safe,
    totalPages,
    totalRows,
    start: totalRows === 0 ? 0 : from + 1,
    end: Math.min(to, totalRows),
    groups: out,
  };
}

/** Drop selected filter values that no longer exist in the authorized data
 *  (e.g. after an edit), so a stale selection can't hide every row. */
export function pruneFilters(
  docs: readonly YouthDocument[],
  filters: DocFilters,
): DocFilters {
  const next: DocFilters = {};
  for (const c of DOC_COLUMNS) {
    const sel = filters[c.key];
    if (!sel?.length) continue;
    const opts = new Set(filterOptions(docs, c.key));
    const kept = sel.filter((v) => opts.has(v));
    if (kept.length) next[c.key] = kept;
  }
  return next;
}

// END OF FILE: youthDocumentsView.ts