import {
  FF_SUB_PROGRAM_NAME,
  type FFMentorApplication,
} from "../data/ffMentorApplication";

/**
 * Opens the applicant's Mentor Profile (About You answers) in a print view so
 * staff can print it or save it as a PDF to share with the mentee.
 */
export function printMentorProfile(
  app: FFMentorApplication,
): void {
  const printWindow = window.open(
    "",
    "_blank",
    "width=900,height=700",
  );
  if (!printWindow) return;

  const escape = (value: unknown) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const o = app.answers.overview;
  const y = app.answers.aboutYou;
  const name =
    [o.firstName, o.lastName].filter(Boolean).join(" ") ||
    "Mentor";
  const subPrograms = app.subPrograms
    .map((p) => FF_SUB_PROGRAM_NAME[p])
    .join(", ");

  const fields: [string, string][] = [
    ["Why do you want to mentor?", y.whyMentor],
    ["Neighborhood / City / Suburb", y.neighbourhood],
    ["Hometown", y.hometown],
    [
      "Favorite place or activity in Chicago",
      y.chicagoFavorite,
    ],
    ["Fun Fact", y.funFact],
    ["What did you love as a kid?", y.lovedAsKid],
    [
      "What do you look forward to doing with a mentee?",
      y.lookForward,
    ],
    ["Favorite Book", y.favoriteBook],
    ["Favorite Food", y.favoriteFood],
    ["Favorite Music", y.favoriteMusic],
    ["Favorite Movie", y.favoriteMovie],
  ];
  const fieldsHtml = fields
    .map(
      ([label, value]) =>
        `<div class="field"><div class="label">${escape(label)}</div><div class="value">${escape(value) || "Not provided"}</div></div>`,
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Mentor Profile — ${escape(name)}</title>
        <style>
          body { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; padding: 32px; color: #080707; }
          h1 { font-size: 20px; margin: 0 0 4px; }
          .meta { font-size: 12px; color: #706e6b; margin-bottom: 24px; }
          .field { margin-bottom: 16px; break-inside: avoid; }
          .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; color: #706e6b; margin-bottom: 4px; }
          .value { font-size: 14px; white-space: pre-wrap; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>Mentor Profile — ${escape(name)}</h1>
        <div class="meta">${escape(subPrograms)}</div>
        ${fieldsHtml}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}