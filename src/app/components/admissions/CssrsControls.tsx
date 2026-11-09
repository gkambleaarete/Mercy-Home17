import { Badge } from "../ui/badge";
import { FieldError, FieldLabel } from "../ui/field";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";
import type { YesNo } from "../../data/cssrsTypes";

// Shared controls for the C-SSRS forms (US 20105 / US 20139). Foundation
// only: no questionnaire uses them yet, and none holds clinical wording —
// the form passes its own question text. Every control derives all of its
// element ids from a caller-supplied `idPrefix`, so each question and each
// period gets its own unique ids (pass a prefix that is unique per
// question, e.g. "cssrs-full-ideation-wishToBeDead").

const text = { color: "var(--slds-g-color-text-default)" };
const weak = { color: "var(--slds-g-color-text-weak)" };
// Selected indicator in brand green (#145F33), scoped to these radio groups
// (same approach as the ACEs fields).
const brandRadio = {
  "--color-primary": "#145F33",
} as React.CSSProperties;

export const YES_NO_LABEL: Record<YesNo, string> = {
  yes: "Yes",
  no: "No",
  unanswered: "Not answered",
};

/** Help text for a question; point the control's aria-describedby at `id`. */
export function QuestionHelp({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <p id={id} className="mt-1 text-[12px]" style={weak}>
      {children}
    </p>
  );
}

/** Badge tone per classification label. The label text is always shown, so
 *  risk is never communicated by color alone. */
const CLASSIFICATION_VARIANT = {
  "No Risk": "success",
  "Low Risk": "info",
  "Moderate Risk": "warning",
  "High Risk": "error",
} as const;

export function ClassificationBadge({
  classification,
}: {
  classification: keyof typeof CLASSIFICATION_VARIANT;
}) {
  return (
    <Badge
      variant={CLASSIFICATION_VARIANT[classification]}
      bordered
    >
      {classification}
    </Badge>
  );
}

export interface YesNoPeriod {
  /** Key in `value` / `onChange` (e.g. "lifetime", "past1Month"). */
  key: string;
  /** Shown above the Yes/No pair; omit for a single-period question. */
  label?: string;
}

/**
 * One Yes / No radio pair. "unanswered" shows as no selection — it is never
 * shown or stored as No. Control ids are `${idPrefix}-yes` / `-no`.
 */
export function YesNoRadios({
  idPrefix,
  labelledBy,
  describedBy,
  invalid,
  value,
  onChange,
  disabled,
}: {
  idPrefix: string;
  /** Space-separated ids that name this pair (question and period). */
  labelledBy: string;
  describedBy?: string;
  invalid?: boolean;
  value: YesNo;
  onChange: (next: Exclude<YesNo, "unanswered">) => void;
  disabled?: boolean;
}) {
  return (
    <RadioGroup
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-invalid={invalid ? true : undefined}
      value={value === "unanswered" ? "" : value}
      onValueChange={(v) => onChange(v as "yes" | "no")}
      disabled={disabled}
      className="flex gap-6"
      style={brandRadio}
    >
      {(["yes", "no"] as const).map((answer) => {
        const id = `${idPrefix}-${answer}`;
        return (
          <div key={answer} className="flex items-center gap-2">
            <RadioGroupItem value={answer} id={id} />
            <Label
              htmlFor={id}
              className="text-[13px] font-normal cursor-pointer"
              style={text}
            >
              {YES_NO_LABEL[answer]}
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}

/**
 * Controlled Yes/No question. One Yes/No pair per period, so Lifetime and
 * Past 1 Month (or Past 3 Months) answers stay separate. "unanswered" shows
 * as no selection — it is never shown or stored as No.
 */
export function YesNoQuestionGroup({
  idPrefix,
  question,
  help,
  periods,
  value,
  onChange,
  disabled,
  error,
  classification,
}: {
  idPrefix: string;
  question: string;
  help?: string;
  periods: YesNoPeriod[];
  value: Record<string, YesNo>;
  onChange: (
    periodKey: string,
    next: Exclude<YesNo, "unanswered">,
  ) => void;
  disabled?: boolean;
  /** Error shown beside the question and tied to its radios. */
  error?: string;
  /** Shown beside the question once it is answered. */
  classification?: keyof typeof CLASSIFICATION_VARIANT | null;
}) {
  const questionId = `${idPrefix}-question`;
  const helpId = `${idPrefix}-help`;
  const errorId = `${idPrefix}-error`;
  const describedBy =
    [help ? helpId : null, error ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <p
          id={questionId}
          className="text-[13px] font-semibold"
          style={text}
        >
          {question}
        </p>
        {classification && (
          <ClassificationBadge
            classification={classification}
          />
        )}
      </div>
      {help && <QuestionHelp id={helpId}>{help}</QuestionHelp>}
      <div className="flex flex-wrap gap-x-8 gap-y-3 mt-2">
        {periods.map((p) => {
          const groupId = `${idPrefix}-${p.key}`;
          const labelId = `${groupId}-label`;
          const current = value[p.key] ?? "unanswered";
          return (
            <div key={p.key}>
              {p.label && (
                <span
                  id={labelId}
                  className="slds-form-label block mb-1.5"
                  style={weak}
                >
                  {p.label}
                </span>
              )}
              <YesNoRadios
                idPrefix={groupId}
                labelledBy={
                  p.label
                    ? `${questionId} ${labelId}`
                    : questionId
                }
                describedBy={describedBy}
                invalid={!!error}
                value={current}
                onChange={(v) => onChange(p.key, v)}
                disabled={disabled}
              />
            </div>
          );
        })}
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}

/** Labelled description textarea (editable fields stay white). */
export function DescriptionField({
  id,
  label,
  value,
  onChange,
  help,
  disabled,
  ariaLabel,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  help?: string;
  disabled?: boolean;
  /** Full accessible name when the visible label repeats (it must contain
   *  the visible label text). */
  ariaLabel?: string;
}) {
  const helpId = `${id}-help`;
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea
        id={id}
        size="md"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={help ? helpId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
      />
      {help && <QuestionHelp id={helpId}>{help}</QuestionHelp>}
    </div>
  );
}

/** Read-only display of one saved response (a Yes/No answer, a rating or
 *  text). An empty value reads "Not answered"; 0 is shown as 0. */
export function ReadOnlyResponse({
  label,
  value,
}: {
  label: string;
  value: YesNo | number | string | null;
}) {
  const shown =
    value === null || value === "" || value === "unanswered"
      ? "Not answered"
      : value === "yes" || value === "no"
        ? YES_NO_LABEL[value]
        : String(value);
  return (
    <div>
      <dt className="slds-form-label mb-1" style={weak}>
        {label}
      </dt>
      <dd
        className="text-[13px] whitespace-pre-wrap break-words"
        style={text}
      >
        {shown}
      </dd>
    </div>
  );
}