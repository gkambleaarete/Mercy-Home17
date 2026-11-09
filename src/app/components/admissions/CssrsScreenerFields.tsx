import { Alert } from "../ui/alert";
import { FieldError, FieldLabel } from "../ui/field";
import { Label } from "../ui/label";
import {
  activeScreenerQuestions,
  classifyScreenerQuestion,
  getScreenerAnswer,
  SCREENER_QUESTIONS,
  setScreenerAnswer,
  type ScreenerErrors,
  type ScreenerQuestionKey,
} from "../../data/cssrsScreener";
import type { ScreenerResponses } from "../../data/cssrsTypes";
import type { RelatedIrOption } from "../../lib/cssrsRelatedIr";
import {
  QuestionHelp,
  YesNoQuestionGroup,
} from "./CssrsControls";

// C-SSRS Screener form body (US 20105), rendered inside the existing
// Standardized Test dialog below its Date / Test row. It holds no saved
// data: the parent owns the editing draft and the store owns the record.

export const CSSRS_SCREENER_TEST = "C-SSRS Screener";

/** Control id of a question's first radio (focus target for an error). */
export const screenerFocusId = (key: ScreenerQuestionKey) =>
  `cssrs-screener-${key}-answer-yes`;
export const SCREENER_RELATED_IR_ID = "cssrs-screener-related-ir";

export type RelatedIrStatus = "unverified" | "none" | "available";

const IR_MESSAGE: Record<Exclude<RelatedIrStatus, "available">, string> = {
  unverified:
    "Related IR is unavailable: this Admissions record is not linked to a verified Youth Constituent.",
  none: "No eligible incident reports (Suicide Attempt, Suicidal Ideation or Self-Harm) were found for this youth.",
};

export function CssrsScreenerFields({
  responses,
  onResponsesChange,
  errors,
  saveError,
  irOptions,
  irStatus,
}: {
  responses: ScreenerResponses;
  onResponsesChange: (next: ScreenerResponses) => void;
  errors: ScreenerErrors;
  saveError: string | null;
  irOptions: RelatedIrOption[];
  irStatus: RelatedIrStatus;
}) {
  const selectedIr = responses.relatedIncidentReportId;
  // A saved association that is no longer offered stays visible (and is
  // reported at save time) rather than being silently dropped.
  const options =
    selectedIr !== null && !irOptions.some((o) => o.id === selectedIr)
      ? [
          ...irOptions,
          {
            id: selectedIr,
            label: `IR ${selectedIr} — no longer available`,
          },
        ]
      : irOptions;
  const irHelpId = `${SCREENER_RELATED_IR_ID}-help`;
  const irErrorId = `${SCREENER_RELATED_IR_ID}-error`;
  const irDescribedBy =
    [
      irStatus !== "available" && selectedIr === null ? irHelpId : null,
      errors.relatedIncidentReportId ? irErrorId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="space-y-6" data-testid="cssrs-screener-fields">
      {saveError && <Alert variant="error">{saveError}</Alert>}
      <h3
        className="text-[13px] font-semibold uppercase"
        style={{ color: "var(--slds-g-color-text-default)" }}
      >
        C-SSRS Screener
      </h3>
      <ol className="space-y-5">
        {activeScreenerQuestions(responses).map((key) => {
          const q = SCREENER_QUESTIONS[key];
          return (
            <li key={key}>
              <YesNoQuestionGroup
                idPrefix={`cssrs-screener-${key}`}
                question={q.number ? `${q.number}. ${q.text}` : q.text}
                help={q.help}
                periods={[{ key: "answer" }]}
                value={{ answer: getScreenerAnswer(responses, key) }}
                onChange={(_, next) =>
                  onResponsesChange(
                    setScreenerAnswer(responses, key, next),
                  )
                }
                error={errors[key]}
                classification={classifyScreenerQuestion(
                  responses,
                  key,
                )}
              />
            </li>
          );
        })}
      </ol>

      <div>
        <FieldLabel htmlFor={SCREENER_RELATED_IR_ID}>
          Related IR
        </FieldLabel>
        {/* Native select, like the Test selector: a Radix Select portals
            outside the modal dialog and its options stop receiving clicks. */}
        <select
          id={SCREENER_RELATED_IR_ID}
          value={selectedIr ?? ""}
          onChange={(e) =>
            onResponsesChange({
              ...responses,
              relatedIncidentReportId: e.target.value || null,
            })
          }
          disabled={options.length === 0}
          aria-invalid={errors.relatedIncidentReportId ? true : undefined}
          aria-describedby={irDescribedBy}
          className="h-9 w-full max-w-md rounded-md border border-[var(--slds-g-color-border-base-1)] bg-[var(--slds-g-color-background-base)] px-3 text-[13px] text-[var(--slds-g-color-text-default)] outline-none focus-visible:border-[#145F33] disabled:cursor-not-allowed disabled:bg-[var(--slds-g-color-background-alt)] disabled:opacity-60"
        >
          <option value="">None</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <FieldError id={irErrorId}>
          {errors.relatedIncidentReportId}
        </FieldError>
        {irStatus !== "available" && selectedIr === null && (
          <QuestionHelp id={irHelpId}>
            {IR_MESSAGE[irStatus]}
          </QuestionHelp>
        )}
      </div>
    </div>
  );
}
