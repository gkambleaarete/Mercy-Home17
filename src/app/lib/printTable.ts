/**
 * Minimal shared "print this grid" helper. There was no existing working
 * print implementation anywhere in the app to follow (other Print buttons
 * in this codebase are toast-only stubs), so this establishes one small,
 * reusable pattern instead of each grid inventing its own.
 */
export function printRecordsAsTable(options: {
  title: string;
  columns: string[];
  rows: (string | number)[][];
}): void {
  const { title, columns, rows } = options;
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;

  const escape = (value: unknown) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const headerHtml = columns.map((c) => `<th>${escape(c)}</th>`).join("");
  const rowsHtml = rows.length
    ? rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${escape(cell)}</td>`).join("")}</tr>`,
        )
        .join("")
    : `<tr><td colspan="${columns.length}" class="empty">No records to display</td></tr>`;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${escape(title)}</title>
        <style>
          body { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; padding: 24px; color: #080707; }
          h1 { font-size: 16px; margin: 0 0 4px; }
          .meta { font-size: 12px; color: #706e6b; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #dddbda; }
          th { background: #fafaf9; font-size: 11px; text-transform: uppercase; letter-spacing: 0.02em; color: #706e6b; }
          .empty { text-align: center; color: #706e6b; padding: 24px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>${escape(title)}</h1>
        <div class="meta">Printed ${escape(new Date().toLocaleString())}</div>
        <table>
          <thead><tr>${headerHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
