import {
  activeScreenerQuestions,
  classifyScreenerQuestion,
  getScreenerAnswer,
  SCREENER_QUESTIONS,
} from "../../data/cssrsScreener";
import type { CssrsScreenerAssessment } from "../../data/cssrsAssessmentStore";
import { relatedIrReference } from "../../lib/cssrsRelatedIr";
import {
  ClassificationBadge,
  QuestionHelp,
  ReadOnlyResponse,
  YES_NO_LABEL,
} from "./CssrsControls";

// Read-only C-SSRS Screener details (US 20105), shown in Standardized Test
// Details. Same question path and classifications as the edit form; skipped
// questions are not listed. No overall risk is shown.

export function CssrsScreenerDetails({
  record,
}: {
  record: CssrsScreenerAssessment;
}) {
  const { responses } = record;
  return (
    <div className="space-y-5" data-testid="cssrs-screener-details">
      <ol className="space-y-4">
        {activeScreenerQuestions(responses).map((key) => {
          const q = SCREENER_QUESTIONS[key];
          const classification = classifyScreenerQuestion(
            responses,
            key,
          );
          return (
            <li key={key}>
              <p
                className="text-[13px] font-semibold"
                style={{ color: "var(--slds-g-color-text-default)" }}
              >
                {q.number ? `${q.number}. ${q.text}` : q.text}
              </p>
              {q.help && (
                <QuestionHelp id={`cssrs-details-${key}-help`}>
                  {q.help}
                </QuestionHelp>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px]">
                <span
                  style={{ color: "var(--slds-g-color-text-default)" }}
                >
                  {YES_NO_LABEL[getScreenerAnswer(responses, key)]}
                </span>
                {classification && (
                  <ClassificationBadge classification={classification} />
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <dl>
        <ReadOnlyResponse
          label="Related IR"
          value={
            responses.relatedIncidentReportId === null
              ? "None"
              : relatedIrReference(responses.relatedIncidentReportId)
          }
        />
      </dl>
    </div>
  );
}
