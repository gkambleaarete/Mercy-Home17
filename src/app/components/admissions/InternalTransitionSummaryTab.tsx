import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { PtpSummaryTable } from "./PtpSummaryTable";
import type { InternalTransitionSummarySection } from "../../data/transitionSummaryStore";

// Internal Transition Summary → Summary tab (US 20101). Controlled by the
// summary editor's draft; the PTP table reads the PTP store live and the
// Recommendations section is passed in by the editor.

const NARRATIVES = [
  {
    key: "reasonForTransition",
    id: "its-reason-for-transition",
    label: "Reason for Transition",
  },
  {
    key: "involvementSummary",
    id: "its-involvement-summary",
    label: "Summary of Involvement in Program and Therapy",
  },
] as const;

export function InternalTransitionSummaryTab({
  youthId,
  draft,
  readOnly,
  onChange,
  recommendationsSection,
}: {
  youthId: string;
  draft: InternalTransitionSummarySection;
  readOnly: boolean;
  onChange: (next: InternalTransitionSummarySection) => void;
  recommendationsSection: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h4 className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)]">
          Summary of PTP
        </h4>
        <PtpSummaryTable youthId={youthId} />
      </section>

      {NARRATIVES.map((n) => (
        <section key={n.key} className="space-y-1.5">
          {readOnly ? (
            <>
              <p className="slds-form-label text-[var(--slds-g-color-text-weak)]">
                {n.label}
              </p>
              <p className="slds-text-4 text-[var(--slds-g-color-text-default)] whitespace-pre-wrap break-words">
                {draft[n.key] || "—"}
              </p>
            </>
          ) : (
            <>
              <Label htmlFor={n.id} className="slds-form-label">
                {n.label}
              </Label>
              <Textarea
                id={n.id}
                value={draft[n.key] ?? ""}
                onChange={(e) =>
                  onChange({
                    ...draft,
                    [n.key]: e.target.value,
                  })
                }
              />
            </>
          )}
        </section>
      ))}

      {recommendationsSection}
    </div>
  );
}