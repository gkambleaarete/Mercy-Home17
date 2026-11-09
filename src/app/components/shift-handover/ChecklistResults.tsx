// US 20185 Chunk 3 — read-only presentation of a handover's recorded
// checklist results (View Handover, list indicator). Deliberately looks
// different from the interactive checkboxes in Create/Edit: status pills
// with text, no form controls.

import { CheckCircle, Circle, ListChecks } from "@/app/lib/lucide-icons";
import { Badge } from "../ui/badge";
import type { SavedChecklistResult } from "../../data/shiftHandoverChecklistStore";

const sldsBorder = "1px solid var(--slds-g-color-border-base-1)";
const sldsWeak = "var(--slds-g-color-text-weak)";
const sldsDefault = "var(--slds-g-color-text-default)";
const sldsAlt = "var(--slds-g-color-background-alt)";

export function statusBadgeVariant(s: SavedChecklistResult["status"]) {
  return s === "Complete" ? "success" : s === "In progress" ? "warning" : "neutral";
}

/** "Shift Handover Checklist · 12/14 completed · In progress" */
export function checklistIndicatorText(r: SavedChecklistResult) {
  return `${r.name} · ${r.completed}/${r.total} completed · ${r.status}`;
}

export function ChecklistIndicator({ result }: { result: SavedChecklistResult }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs min-w-0"
      style={{ color: sldsWeak }}
    >
      <ListChecks className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="break-words">{checklistIndicatorText(result)}</span>
    </span>
  );
}

export function ChecklistResultsReadOnly({
  result,
}: {
  result: SavedChecklistResult | null | undefined;
}) {
  if (!result) {
    return (
      <div
        className="rounded-md p-3 text-sm flex items-center gap-2"
        style={{ border: sldsBorder, backgroundColor: sldsAlt, color: sldsWeak }}
      >
        <ListChecks className="h-4 w-4 shrink-0" aria-hidden />
        No checklist selected
      </div>
    );
  }
  const pct = result.total ? Math.round((result.completed / result.total) * 100) : 0;
  return (
    <div className="rounded-md overflow-hidden" style={{ border: sldsBorder }}>
      <div
        className="px-3 py-2.5 flex items-center justify-between gap-3 flex-wrap"
        style={{ borderBottom: sldsBorder, backgroundColor: sldsAlt }}
      >
        <span className="text-sm font-semibold break-words min-w-0" style={{ color: sldsDefault }}>
          {result.name}
        </span>
        <span className="flex items-center gap-2">
          <span className="text-xs" style={{ color: sldsDefault }}>
            {result.completed} of {result.total} completed
          </span>
          <Badge variant={statusBadgeVariant(result.status)}>{result.status}</Badge>
        </span>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--slds-g-color-border-base-1)" }}
          aria-hidden
        >
          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ol>
        {result.items.map((i, n) => (
          <li
            key={i.id}
            className="px-3 py-2.5 flex items-start gap-2.5"
            style={n > 0 ? { borderTop: sldsBorder } : undefined}
          >
            {i.checked ? (
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-[#145F33]" aria-hidden />
            ) : (
              <Circle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: sldsWeak }} aria-hidden />
            )}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="text-sm break-words" style={{ color: sldsDefault }}>
                <span className="font-semibold" style={{ color: sldsWeak }}>
                  {n + 1}.
                </span>{" "}
                {i.description}
              </div>
              <Badge variant={i.checked ? "success" : "neutral"}>
                {i.checked ? "Completed" : "Incomplete"}
              </Badge>
              {i.notes && (
                <p className="text-xs break-words whitespace-pre-wrap" style={{ color: sldsWeak }}>
                  <span className="font-semibold">Notes:</span> {i.notes}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
