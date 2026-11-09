// Print an External Transition Summary report (US 20103). Follows the
// existing printTable.ts pattern (new window, escaped HTML, print dialog),
// built from the same resolved report model the screen shows: the current
// saved report for Draft, the captured version afterwards. Every stored
// value is HTML-escaped. Nothing here reads or writes app storage.

import {
  PROTOTYPE_ACTOR_NOTE,
  type ExternalReportModel,
  type ReportPlan,
} from "../data/externalReportModel";
import { isoToMdy } from "./dateFormat";

const esc = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const val = (v: unknown) => esc(v === "" || v === undefined || v === null ? "—" : v);

/** MM/DD/YYYY h:mm AM/PM for an ISO timestamp. */
function stamp(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const h = d.getHours() % 12 || 12;
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()} ${h}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() >= 12 ? "PM" : "AM"}`;
}

/** `nowrap`: column indexes kept on one line (dates, statuses). */
const table = (columns: string[], rows: string[][], empty: string, nowrap: number[] = []) => `
  <table>
    <thead><tr>${columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${
      rows.length
        ? rows
            .map((r) => `<tr>${r.map((c, i) => `<td${nowrap.includes(i) ? ' class="nw"' : ""}>${c}</td>`).join("")}</tr>`)
            .join("")
        : `<tr><td colspan="${columns.length}" class="muted">${esc(empty)}</td></tr>`
    }</tbody>
  </table>`;

function planHtml(p: ReportPlan): string {
  const goals = p.goals.length
    ? table(
        ["Goal", "Outcome Domain", "Start Date", "Target End Date", "End Date", "Status"],
        p.goals.map((g) => [
          (g.intermediate ? "Intermediate goal: " : "") + val(g.goal),
          val(g.outcomeDomain),
          val(isoToMdy(g.startDate)),
          val(isoToMdy(g.targetEndDate)),
          val(isoToMdy(g.endDate)),
          val(g.status),
        ]),
        "",
        [2, 3, 4, 5],
      )
    : `<p class="muted">${esc(
        p.hasUnlinkedWorkspace
          ? "No goals are recorded for this plan. Goals in its ITP workspace aren't linked to this youth's record, so they aren't shown."
          : "No goals are recorded for this plan.",
      )}</p>`;
  return `<div class="plan"><h3>ITP-${esc(p.id)} · Status: ${val(p.status)}</h3>
    <p class="muted">ITP Date ${val(isoToMdy(p.itpDate))} · Started ${val(isoToMdy(p.startedDate))}</p>${goals}</div>`;
}

/** The full printable document for a report model. */
export function externalReportHtml(model: ExternalReportModel): string {
  const c = model.content;
  const provenance =
    model.source === "live"
      ? "Draft: shows the current saved report and current ITP/goal data."
      : model.source === "captured"
        ? `Report version captured ${stamp(model.capturedAt)} at Ready for Review.`
        : "Finalized before report versions were captured: ITP and goal history at finalization is not available.";
  const meta: [string, string][] = [
    ["Youth Name", c.youthName],
    ["Date of Birth", c.dateOfBirth],
    ["Admission Date", c.admissionDate],
    ["Transition Date", c.transitionDate],
    ["Length of Stay", c.lengthOfStay],
    ["Generated Date", c.generatedDate],
    ["Finalized By", c.finalizedBy],
    ["Finalized Date", c.finalizedDate],
  ];
  const itp =
    model.itp.state === "ok"
      ? model.itp.plans.length
        ? model.itp.plans.map(planHtml).join("")
        : `<p class="muted">No ITPs are recorded for this youth.</p>`
      : model.itp.state === "unreadable"
        ? `<p class="muted">ITP goal data can't be read right now.</p>`
        : `<p class="muted">ITP and goal history at finalization is not available.</p>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>External Transition Summary Report</title>
<style>
  @page { margin: 0.6in; }
  body { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; color: #080707; font-size: 12px; margin: 0; padding: 24px; }
  h1 { font-size: 16px; text-align: center; margin: 0; }
  .sub { text-align: center; text-transform: uppercase; letter-spacing: 0.08em; color: #706e6b; margin: 4px 0 12px; }
  h2 { font-size: 14px; margin: 20px 0 8px; border-bottom: 1px solid #dddbda; padding-bottom: 4px; break-after: avoid; page-break-after: avoid; }
  h3 { font-size: 12.5px; margin: 14px 0 4px; break-after: avoid; page-break-after: avoid; }
  .muted { color: #706e6b; }
  .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px 16px; }
  .meta div span { display: block; color: #706e6b; font-size: 10.5px; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; page-break-inside: avoid; }
  th, td { text-align: left; vertical-align: top; padding: 5px 7px; border-bottom: 1px solid #dddbda; overflow-wrap: break-word; }
  td.nw { white-space: nowrap; }
  th { background: #f3f2f2; font-size: 10.5px; text-transform: uppercase; color: #706e6b; }
  .narrative { margin: 10px 0; }
  .narrative p, .events li { white-space: pre-wrap; overflow-wrap: break-word; margin: 4px 0; }
  @media print { body { padding: 0; } }
</style></head><body>
<h1>MERCY HOME FOR BOYS &amp; GIRLS</h1>
<p class="sub">External Transition Summary Report</p>
<p><strong>Status:</strong> ${val(model.status)}</p>
<p class="muted">${esc(provenance)}</p>
${
  model.events.length
    ? `<ul class="events">${model.events
        .map((e) => `<li>${esc(e.action)} — ${esc(stamp(e.at))}${e.actor ? ` — ${esc(e.actor)} (${esc(PROTOTYPE_ACTOR_NOTE)})` : ""}</li>`)
        .join("")}</ul>`
    : ""
}
<h2>Youth &amp; Report Details</h2>
<div class="meta">${meta.map(([l, v]) => `<div><span>${esc(l)}</span>${val(v)}</div>`).join("")}</div>
<h2>Individual Treatment Plans</h2>${itp}
<h2>Program History</h2>${table(
    ["Program", "Start Date", "End Date"],
    c.programHistory.map((p) => [val(p.program), val(p.startDate), val(p.endDate)]),
    "No entries recorded.",
    [1, 2],
  )}
<h2>Key Staff History</h2>${table(
    ["Role", "Staff Member", "Start Date", "End Date"],
    c.keyStaffHistory.map((s) => [val(s.role), val(s.staffMember), val(s.startDate), val(s.endDate)]),
    "No entries recorded.",
    [2, 3],
  )}
<h2>Clinical &amp; Progress Narratives</h2>${
    c.narratives.length
      ? c.narratives
          .map((n) => `<div class="narrative"><h3>${val(n.title)}</h3><p>${val(n.content)}</p></div>`)
          .join("")
      : `<p class="muted">No narratives recorded.</p>`
  }
</body></html>`;
}

/** Opens the print dialog for the report. Returns false if the browser
 *  blocked the print window. */
export function printExternalReport(model: ExternalReportModel): boolean {
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return false;
  w.document.write(externalReportHtml(model));
  w.document.close();
  w.focus();
  w.print();
  return true;
}