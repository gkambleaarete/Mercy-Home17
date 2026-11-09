/** Download rows as a CSV file (quoted, comma-separated, UTF-8). */
export function exportToCSV(
  filename: string,
  headers: string[],
  rows: unknown[][],
  /** Additive, default false: prefix a UTF-8 byte-order mark so Excel reads
   * non-ASCII text correctly. */
  options: { bom?: boolean } = {},
): void {
  const escape = (v: unknown) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([options.bom ? `\uFEFF${csv}` : csv], {
      type: "text/csv;charset=utf-8",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}