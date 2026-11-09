import { FieldError, FieldLabel } from "../ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  getIdeationAnswer,
  getIdeationDescription,
  IDEATION_PERIOD_LABEL,
  IDEATION_PERIODS,
  IDEATION_QUESTIONS,
  ideationErrorKey,
  INTENSITY_GUIDANCE,
  INTENSITY_PERIOD_LABEL,
  INTENSITY_PERIOD_OF,
  INTENSITY_QUESTIONS,
  intensityErrorKey,
  isIdeationQuestionApplicable,
  isIntensityApplicable,
  isIntensitySectionVisible,
  ratingOptionText,
  ratingText,
  setIdeationAnswer,
  setIdeationDescription,
  setIntensityRating,
  setMostSevereIdeation,
  TYPE_NUMBER_OPTIONS,
  type IdeationIntensityErrors,
  type IdeationPeriod,
  type RatingOption,
} from "../../data/cssrsFullLifetime";
import type {
  FullLifetimeResponses,
  IdeationKey,
  IntensityKey,
} from "../../data/cssrsTypes";
import {
  DescriptionField,
  QuestionHelp,
  ReadOnlyResponse,
  YES_NO_LABEL,
  YesNoRadios,
} from "./CssrsControls";

// C-SSRS Full-Lifetime, Section 1 (Suicidal Ideation) and Section 2
// (Intensity of Ideation) — US 20139. Editing and read-only components for
// the DLG-01 body (no scroll container of their own). They hold no data and
// save nothing: the caller owns the draft and, in Chunk 4, the save. There
// are no risk badges, totals or sums.
//
// Control ids are `${idPrefix}-ideation-<question>-<period>-…` and
// `${idPrefix}-intensity-<period>-<field>`; pass an idPrefix unique to the
// assessment (e.g. "cssrs-fl-new" or "cssrs-fl-CSSRS-000007").

const text = { color: "var(--slds-g-color-text-default)" };
const weak = { color: "var(--slds-g-color-text-weak)" };
const NOT_APPLICABLE = "Not applicable";

const ideationId = (
  idPrefix: string,
  key: IdeationKey,
  period: IdeationPeriod,
) => `${idPrefix}-ideation-${key}-${period}`;
const intensityId = (
  idPrefix: string,
  period: "lifetime" | "recent",
  field: string,
) => `${idPrefix}-intensity-${period}-${field}`;

/** Id of the control to focus for an error key from
 *  validateIdeationIntensity. */
export function fullLifetimeFocusId(
  idPrefix: string,
  errorKey: string,
): string | null {
  const [section, a, b] = errorKey.split(".");
  if (section === "ideation")
    return `${ideationId(idPrefix, a as IdeationKey, b as IdeationPeriod)}-yes`;
  if (section === "intensity")
    return intensityId(idPrefix, a as "lifetime" | "recent", b);
  return null;
}

/** Two period columns on wide screens; stacked (each with its own period
 *  label) on narrow ones. */
export const PERIOD_GRID = "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4";

export function PeriodLabel({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <span id={id} className="slds-form-label block mb-1.5" style={weak}>
      {children}
    </span>
  );
}

export function NotApplicable() {
  return (
    <p className="text-[13px]" style={weak}>
      {NOT_APPLICABLE}
    </p>
  );
}

// ─── Section 1: editing ─────────────────────────────────────────────────────

export function FullLifetimeIdeationSection({
  idPrefix,
  responses,
  onChange,
  errors = {},
  disabled,
}: {
  idPrefix: string;
  responses: FullLifetimeResponses;
  onChange: (next: FullLifetimeResponses) => void;
  errors?: IdeationIntensityErrors;
  disabled?: boolean;
}) {
  return (
    <section
      aria-labelledby={`${idPrefix}-ideation-heading`}
      className="space-y-5"
    >
      <h3
        id={`${idPrefix}-ideation-heading`}
        className="text-[13px] font-semibold uppercase"
        style={text}
      >
        Suicidal Ideation
      </h3>
      <ol className="space-y-6">
        {IDEATION_QUESTIONS.map((q) => {
          // Q3–Q5 are shown while at least one period's Q2 is Yes.
          if (
            !IDEATION_PERIODS.some((p) =>
              isIdeationQuestionApplicable(responses, q.key, p),
            )
          )
            return null;
          const questionId = `${idPrefix}-ideation-${q.key}-question`;
          const helpId = `${idPrefix}-ideation-${q.key}-help`;
          return (
            <li key={q.key}>
              <p
                id={questionId}
                className="text-[13px] font-semibold"
                style={text}
              >
                {q.number}. {q.title}
              </p>
              <QuestionHelp id={helpId}>{q.help}</QuestionHelp>
              <p className="mt-2 text-[13px]" style={text}>
                {q.text}
              </p>
              <div className={`${PERIOD_GRID} mt-3`}>
                {IDEATION_PERIODS.map((period) => {
                  const base = ideationId(idPrefix, q.key, period);
                  const labelId = `${base}-label`;
                  const applicable = isIdeationQuestionApplicable(
                    responses,
                    q.key,
                    period,
                  );
                  const answer = getIdeationAnswer(
                    responses,
                    q.key,
                    period,
                  );
                  const error = errors[ideationErrorKey(q.key, period)];
                  const errorId = `${base}-error`;
                  return (
                    <div key={period} className="space-y-3">
                      <PeriodLabel id={labelId}>
                        {IDEATION_PERIOD_LABEL[period]}
                      </PeriodLabel>
                      {applicable ? (
                        <>
                          <YesNoRadios
                            idPrefix={base}
                            labelledBy={`${questionId} ${labelId}`}
                            describedBy={
                              [helpId, error ? errorId : null]
                                .filter(Boolean)
                                .join(" ")
                            }
                            invalid={!!error}
                            value={answer}
                            onChange={(v) =>
                              onChange(
                                setIdeationAnswer(
                                  responses,
                                  q.key,
                                  period,
                                  v,
                                ),
                              )
                            }
                            disabled={disabled}
                          />
                          <FieldError id={errorId}>{error}</FieldError>
                          {answer === "yes" && (
                            <DescriptionField
                              id={`${base}-description`}
                              label="If Yes, Describe"
                              ariaLabel={`If Yes, Describe — Question ${q.number}, ${IDEATION_PERIOD_LABEL[period]}`}
                              value={getIdeationDescription(
                                responses,
                                q.key,
                                period,
                              )}
                              onChange={(v) =>
                                onChange(
                                  setIdeationDescription(
                                    responses,
                                    q.key,
                                    period,
                                    v,
                                  ),
                                )
                              }
                              disabled={disabled}
                            />
                          )}
                        </>
                      ) : (
                        <NotApplicable />
                      )}
                    </div>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ─── Section 2: editing ─────────────────────────────────────────────────────

export function RatingSelect({
  id,
  labelledBy,
  options,
  value,
  onChange,
  error,
  disabled,
  placeholder = "Select a rating",
}: {
  id: string;
  labelledBy: string;
  placeholder?: string;
  options: readonly RatingOption[];
  value: number | null;
  onChange: (next: number) => void;
  error?: string;
  disabled?: boolean;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      {/* The project's Select; "wrap" shows the full selected text. A saved
          0 is a real value ("0"), distinct from unanswered ("" → placeholder). */}
      <Select
        value={value === null ? "" : String(value)}
        onValueChange={(v) => onChange(Number(v))}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          valueOverflow="wrap"
          aria-labelledby={labelledBy}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent wrapOptions>
          {options.map((o) => (
            <SelectItem key={o.value} value={String(o.value)}>
              {ratingOptionText(o)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}

export function FullLifetimeIntensitySection({
  idPrefix,
  responses,
  onChange,
  errors = {},
  disabled,
}: {
  idPrefix: string;
  responses: FullLifetimeResponses;
  onChange: (next: FullLifetimeResponses) => void;
  errors?: IdeationIntensityErrors;
  disabled?: boolean;
}) {
  if (!isIntensitySectionVisible(responses)) return null;
  const headingId = `${idPrefix}-intensity-heading`;
  const guidanceId = `${idPrefix}-intensity-guidance`;
  const periods = IDEATION_PERIODS.map((p) => ({
    ideation: p,
    ip: INTENSITY_PERIOD_OF[p],
    applicable: isIntensityApplicable(responses, p),
  }));
  return (
    <section aria-labelledby={headingId} className="space-y-5">
      <h3
        id={headingId}
        className="text-[13px] font-semibold uppercase"
        style={text}
      >
        Intensity of Ideation
      </h3>
      <QuestionHelp id={guidanceId}>{INTENSITY_GUIDANCE}</QuestionHelp>

      <div>
        <p className="text-[13px] font-semibold" style={text}>
          Most Severe Ideation
        </p>
        <div className={`${PERIOD_GRID} mt-3`}>
          {periods.map(({ ip, applicable }) => {
            const typeId = intensityId(idPrefix, ip, "typeNumber");
            const labelId = `${typeId}-label`;
            const error = errors[intensityErrorKey(ip, "typeNumber")];
            const descId = intensityId(idPrefix, ip, "description");
            return (
              <div key={ip} className="space-y-3">
                <PeriodLabel id={`${typeId}-period`}>
                  {INTENSITY_PERIOD_LABEL[ip]}
                </PeriodLabel>
                {applicable ? (
                  <>
                    <div>
                      <FieldLabel id={labelId}>Type Number</FieldLabel>
                      <RatingSelect
                        id={typeId}
                        labelledBy={`${labelId} ${typeId}-period`}
                        placeholder="Select a type number"
                        options={TYPE_NUMBER_OPTIONS}
                        value={responses.mostSevereIdeation[ip].typeNumber}
                        onChange={(n) =>
                          onChange(
                            setMostSevereIdeation(responses, ip, {
                              typeNumber: n,
                            }),
                          )
                        }
                        error={error}
                        disabled={disabled}
                      />
                    </div>
                    <DescriptionField
                      id={descId}
                      label="Description of Ideation"
                      ariaLabel={`Description of Ideation — ${INTENSITY_PERIOD_LABEL[ip]}`}
                      value={responses.mostSevereIdeation[ip].description}
                      onChange={(v) =>
                        onChange(
                          setMostSevereIdeation(responses, ip, {
                            description: v,
                          }),
                        )
                      }
                      disabled={disabled}
                    />
                  </>
                ) : (
                  <NotApplicable />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {INTENSITY_QUESTIONS.map((q) => (
        <div key={q.key}>
          <p className="text-[13px] font-semibold" style={text}>
            {q.title}
          </p>
          <p
            id={`${idPrefix}-intensity-${q.key}-question`}
            className="mt-1 text-[13px]"
            style={text}
          >
            {q.text}
          </p>
          <div className={`${PERIOD_GRID} mt-3`}>
            {periods.map(({ ip, applicable }) => {
              const id = intensityId(idPrefix, ip, q.key);
              const labelId = `${id}-period`;
              return (
                <div key={ip}>
                  <PeriodLabel id={labelId}>
                    {INTENSITY_PERIOD_LABEL[ip]}
                  </PeriodLabel>
                  {applicable ? (
                    <RatingSelect
                      id={id}
                      labelledBy={`${idPrefix}-intensity-${q.key}-question ${labelId}`}
                      options={q.options}
                      value={responses.intensity[q.key][ip]}
                      onChange={(n) =>
                        onChange(
                          setIntensityRating(responses, q.key, ip, n),
                        )
                      }
                      error={errors[intensityErrorKey(ip, q.key)]}
                      disabled={disabled}
                    />
                  ) : (
                    <NotApplicable />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

// ─── Sections 1–2: read-only ────────────────────────────────────────────────

/** Saved values for Sections 1–2. Unanswered reads "Not answered"; a period
 *  that does not apply reads "Not applicable". Same visibility helpers as the
 *  editing components, so the two cannot disagree. */
export function FullLifetimeIdeationIntensityDetails({
  responses,
}: {
  responses: FullLifetimeResponses;
}) {
  const typeText = (n: number | null) => {
    if (n === null) return null;
    const o = TYPE_NUMBER_OPTIONS.find((x) => x.value === n);
    return o ? `${o.value} – ${o.label}` : String(n);
  };
  return (
    <div className="space-y-6" data-testid="cssrs-fl-ideation-details">
      <section className="space-y-5">
        <h3
          className="text-[13px] font-semibold uppercase"
          style={text}
        >
          Suicidal Ideation
        </h3>
        <ol className="space-y-5">
          {IDEATION_QUESTIONS.map((q) => {
            if (
              !IDEATION_PERIODS.some((p) =>
                isIdeationQuestionApplicable(responses, q.key, p),
              )
            )
              return null;
            return (
              <li key={q.key} data-question={q.key}>
                <p className="text-[13px] font-semibold" style={text}>
                  {q.number}. {q.title}
                </p>
                <QuestionHelp id={`cssrs-fl-details-${q.key}-help`}>
                  {q.help}
                </QuestionHelp>
                <p className="mt-2 text-[13px]" style={text}>
                  {q.text}
                </p>
                <dl className={`${PERIOD_GRID} mt-3`}>
                  {IDEATION_PERIODS.map((period) => {
                    const applicable = isIdeationQuestionApplicable(
                      responses,
                      q.key,
                      period,
                    );
                    const answer = getIdeationAnswer(
                      responses,
                      q.key,
                      period,
                    );
                    const description = getIdeationDescription(
                      responses,
                      q.key,
                      period,
                    );
                    return (
                      <div
                        key={period}
                        className="space-y-3"
                        data-period={period}
                      >
                        <ReadOnlyResponse
                          label={IDEATION_PERIOD_LABEL[period]}
                          value={
                            applicable
                              ? YES_NO_LABEL[answer]
                              : NOT_APPLICABLE
                          }
                        />
                        {applicable && answer === "yes" && (
                          <ReadOnlyResponse
                            label="If Yes, Describe"
                            value={description || "Not provided"}
                          />
                        )}
                      </div>
                    );
                  })}
                </dl>
              </li>
            );
          })}
        </ol>
      </section>

      {isIntensitySectionVisible(responses) && (
        <section className="space-y-5">
          <h3
            className="text-[13px] font-semibold uppercase"
            style={text}
          >
            Intensity of Ideation
          </h3>
          <QuestionHelp id="cssrs-fl-details-intensity-guidance">
            {INTENSITY_GUIDANCE}
          </QuestionHelp>
          <div>
            <p className="text-[13px] font-semibold" style={text}>
              Most Severe Ideation
            </p>
            <dl className={`${PERIOD_GRID} mt-3`}>
              {IDEATION_PERIODS.map((period) => {
                const ip = INTENSITY_PERIOD_OF[period];
                const applicable = isIntensityApplicable(
                  responses,
                  period,
                );
                const m = responses.mostSevereIdeation[ip];
                return (
                  <div
                    key={ip}
                    className="space-y-3"
                    data-field="mostSevereIdeation"
                    data-period={ip}
                  >
                    <ReadOnlyResponse
                      label={`${INTENSITY_PERIOD_LABEL[ip]}: Type Number`}
                      value={
                        applicable
                          ? (typeText(m.typeNumber) ?? "")
                          : NOT_APPLICABLE
                      }
                    />
                    {applicable && (
                      <ReadOnlyResponse
                        label="Description of Ideation"
                        value={m.description || "Not provided"}
                      />
                    )}
                  </div>
                );
              })}
            </dl>
          </div>
          {INTENSITY_QUESTIONS.map((q) => (
            <div key={q.key} data-question={q.key}>
              <p className="text-[13px] font-semibold" style={text}>
                {q.title}
              </p>
              <p className="mt-1 text-[13px]" style={text}>
                {q.text}
              </p>
              <dl className={`${PERIOD_GRID} mt-3`}>
                {IDEATION_PERIODS.map((period) => {
                  const ip = INTENSITY_PERIOD_OF[period];
                  const applicable = isIntensityApplicable(
                    responses,
                    period,
                  );
                  return (
                    <div key={ip} data-period={ip}>
                      <ReadOnlyResponse
                        label={INTENSITY_PERIOD_LABEL[ip]}
                        value={
                          applicable
                            ? (ratingText(
                                q.key as IntensityKey,
                                responses.intensity[q.key][ip],
                              ) ?? "")
                            : NOT_APPLICABLE
                        }
                      />
                    </div>
                  );
                })}
              </dl>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
