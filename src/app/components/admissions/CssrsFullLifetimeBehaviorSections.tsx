import { useEffect, useState } from "react";
import { DateInput } from "../ui/date-input";
import { FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import {
  ACTUAL_ATTEMPT_DEFINITION,
  ACTUAL_ATTEMPT_PRIMARY_ID,
  ACTUAL_ATTEMPT_QUESTIONS,
  ACTUAL_LETHALITY_OPTIONS,
  actualLethalityText,
  ATTEMPT_GROUPS,
  attemptErrorKey,
  BEHAVIOR_GUIDANCE,
  BEHAVIOR_PERIOD_LABEL,
  BEHAVIOR_PERIODS,
  BEHAVIOR_QUESTIONS,
  behaviorErrorKey,
  followUpErrorKey,
  getActualAttemptAnswer,
  getActualAttemptDescription,
  getBehaviorAnswer,
  getBehaviorCount,
  getBehaviorDescription,
  isAttemptDetailsApplicable,
  lacksActualAttemptQuestions,
  parseCountText,
  POTENTIAL_LETHALITY_HELP,
  POTENTIAL_LETHALITY_OPTIONS,
  potentialLethalityText,
  setAttemptField,
  setBehaviorAnswer,
  setBehaviorCount,
  setBehaviorDescription,
  setFollowUpAnswer,
  setFollowUpDescription,
  type ActualAttemptQuestionId,
  type BehaviorErrors,
  type BehaviorPeriod,
} from "../../data/cssrsFullLifetimeBehavior";
import type {
  ActualAttemptFollowUpId,
  AttemptKey,
  BehaviorKey,
  FullLifetimeResponses,
  Rating,
} from "../../data/cssrsTypes";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import {
  DescriptionField,
  QuestionHelp,
  ReadOnlyResponse,
  YES_NO_LABEL,
  YesNoRadios,
} from "./CssrsControls";
import {
  PERIOD_GRID,
  PeriodLabel,
  RatingSelect,
} from "./CssrsFullLifetimeSections";

// C-SSRS Full-Lifetime, Section 3 (Suicidal Behavior) and Section 4 (Attempt
// Details and Lethality) — US 20139. Editing and read-only components for the
// DLG-01 body (no scroll container of their own). They hold no saved data;
// the caller owns the draft and the save. No risk badges, totals or sums.
//
// Control ids: `${idPrefix}-behavior-<category>-<period>-yes|no|description|
// count` and `${idPrefix}-attempts-<group>-date|actual|potential`.

const text = { color: "var(--slds-g-color-text-default)" };

export const behaviorId = (
  idPrefix: string,
  key: BehaviorKey,
  period: BehaviorPeriod,
) => `${idPrefix}-behavior-${key}-${period}`;
export const attemptId = (
  idPrefix: string,
  group: AttemptKey,
  field: "date" | "actual" | "potential",
) => `${idPrefix}-attempts-${group}-${field}`;

/** Whole-number count field. It keeps the raw text the user typed, so an
 *  invalid entry stays visible; the value reported upward is null unless the
 *  text is a whole number (it is then rejected by validation, never
 *  coerced). */
function CountField({
  id,
  label,
  value,
  onChange,
  error,
  disabled,
}: {
  id: string;
  label: string;
  value: Rating;
  onChange: (next: Rating) => void;
  error?: string;
  disabled?: boolean;
}) {
  const [raw, setRaw] = useState(
    value === null ? "" : String(value),
  );
  useEffect(() => {
    const parsed = parseCountText(raw);
    if (parsed === "invalid") {
      if (value !== null) setRaw(String(value));
    } else if (parsed !== value) {
      setRaw(value === null ? "" : String(value));
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  const errorId = `${id}-error`;
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        className="max-w-[12rem]"
        value={raw}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => {
          setRaw(e.target.value);
          const parsed = parseCountText(e.target.value);
          onChange(parsed === "invalid" ? null : parsed);
        }}
      />
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}

/** Control id base for one Actual Attempt question and period. Question 1
 *  keeps the Actual Attempt response's own id. */
export const actualAttemptQuestionId = (
  idPrefix: string,
  id: ActualAttemptQuestionId,
  period: BehaviorPeriod,
) =>
  id === ACTUAL_ATTEMPT_PRIMARY_ID
    ? behaviorId(idPrefix, "actualAttempt", period)
    : `${idPrefix}-behavior-actualAttempt-${id}-${period}`;

/** The nine Actual Attempt questions (each Yes/No + description per
 *  period) followed by the one pair of totals. Question 1 is the explicit
 *  Actual Attempt response; the totals depend only on it. */
function ActualAttemptQuestions({
  idPrefix,
  responses,
  onChange,
  errors,
  disabled,
}: {
  idPrefix: string;
  responses: FullLifetimeResponses;
  onChange: (next: FullLifetimeResponses) => void;
  errors: BehaviorErrors;
  disabled?: boolean;
}) {
  const questionId = `${idPrefix}-behavior-actualAttempt-question`;
  const countLabel = "Total Number of Attempts";
  return (
    <li>
      <p
        id={questionId}
        className="text-[13px] font-semibold"
        style={text}
      >
        Actual Attempt
      </p>
      <div className="mt-1 space-y-2">
        {ACTUAL_ATTEMPT_DEFINITION.map((para, i) => (
          <QuestionHelp
            key={i}
            id={`${idPrefix}-behavior-actualAttempt-definition-${i}`}
          >
            {para}
          </QuestionHelp>
        ))}
      </div>
      <ol className="mt-4 space-y-6 list-decimal pl-5">
        {ACTUAL_ATTEMPT_QUESTIONS.map((aq) => {
          const qId = `${idPrefix}-behavior-actualAttempt-${aq.id}-question`;
          const primary = aq.id === ACTUAL_ATTEMPT_PRIMARY_ID;
          return (
            <li key={aq.id}>
              <p id={qId} className="text-[13px]" style={text}>
                {aq.text}
              </p>
              <div className={`${PERIOD_GRID} mt-3`}>
                {BEHAVIOR_PERIODS.map((period) => {
                  const base = actualAttemptQuestionId(
                    idPrefix,
                    aq.id,
                    period,
                  );
                  const labelId = `${base}-label`;
                  const answer = getActualAttemptAnswer(
                    responses,
                    aq.id,
                    period,
                  );
                  const error =
                    errors[
                      primary
                        ? behaviorErrorKey(
                            "actualAttempt",
                            period,
                          )
                        : followUpErrorKey(
                            aq.id as ActualAttemptFollowUpId,
                            period,
                          )
                    ];
                  const errorId = `${base}-error`;
                  return (
                    <div key={period} className="space-y-3">
                      <PeriodLabel id={labelId}>
                        {BEHAVIOR_PERIOD_LABEL[period]}
                      </PeriodLabel>
                      <YesNoRadios
                        idPrefix={base}
                        labelledBy={`${qId} ${labelId}`}
                        describedBy={
                          error ? errorId : undefined
                        }
                        invalid={!!error}
                        value={answer}
                        onChange={(v) =>
                          onChange(
                            primary
                              ? setBehaviorAnswer(
                                  responses,
                                  "actualAttempt",
                                  period,
                                  v,
                                )
                              : setFollowUpAnswer(
                                  responses,
                                  aq.id as ActualAttemptFollowUpId,
                                  period,
                                  v,
                                ),
                          )
                        }
                        disabled={disabled}
                      />
                      <FieldError id={errorId}>
                        {error}
                      </FieldError>
                      {answer === "yes" && (
                        <DescriptionField
                          id={`${base}-description`}
                          label="If Yes, Describe"
                          ariaLabel={`If Yes, Describe — ${aq.text} ${BEHAVIOR_PERIOD_LABEL[period]}`}
                          value={getActualAttemptDescription(
                            responses,
                            aq.id,
                            period,
                          )}
                          onChange={(v) =>
                            onChange(
                              primary
                                ? setBehaviorDescription(
                                    responses,
                                    "actualAttempt",
                                    period,
                                    v,
                                  )
                                : setFollowUpDescription(
                                    responses,
                                    aq.id as ActualAttemptFollowUpId,
                                    period,
                                    v,
                                  ),
                            )
                          }
                          disabled={disabled}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-6">
        <p className="text-[13px] font-semibold" style={text}>
          {countLabel}
        </p>
        <QuestionHelp
          id={`${idPrefix}-behavior-actualAttempt-totals-help`}
        >
          Based on the response to Question 1 for each period:
          enter a whole number when it is Yes (No counts as 0).
        </QuestionHelp>
        <div className={`${PERIOD_GRID} mt-3`}>
          {BEHAVIOR_PERIODS.map((period) => {
            const base = behaviorId(
              idPrefix,
              "actualAttempt",
              period,
            );
            return (
              <CountField
                key={period}
                id={`${base}-count`}
                label={`${countLabel}: ${BEHAVIOR_PERIOD_LABEL[period]}`}
                value={getBehaviorCount(
                  responses,
                  "actualAttempt",
                  period,
                )}
                onChange={(n) =>
                  onChange(
                    setBehaviorCount(
                      responses,
                      "actualAttempt",
                      period,
                      n,
                    ),
                  )
                }
                error={
                  errors[
                    behaviorErrorKey(
                      "actualAttempt",
                      period,
                      "count",
                    )
                  ]
                }
                disabled={
                  disabled ||
                  getBehaviorAnswer(
                    responses,
                    "actualAttempt",
                    period,
                  ) !== "yes"
                }
              />
            );
          })}
        </div>
      </div>
    </li>
  );
}

// ─── Section 3: editing ─────────────────────────────────────────────────────

export function FullLifetimeBehaviorSection({
  idPrefix,
  responses,
  onChange,
  errors = {},
  disabled,
}: {
  idPrefix: string;
  responses: FullLifetimeResponses;
  onChange: (next: FullLifetimeResponses) => void;
  errors?: BehaviorErrors;
  disabled?: boolean;
}) {
  return (
    <section
      aria-labelledby={`${idPrefix}-behavior-heading`}
      className="space-y-5"
    >
      <h3
        id={`${idPrefix}-behavior-heading`}
        className="text-[13px] font-semibold uppercase"
        style={text}
      >
        Suicidal Behavior
      </h3>
      <QuestionHelp id={`${idPrefix}-behavior-guidance`}>
        {BEHAVIOR_GUIDANCE}
      </QuestionHelp>
      <ol className="space-y-6">
        {BEHAVIOR_QUESTIONS.map((q) => {
          if (q.key === "actualAttempt")
            return (
              <ActualAttemptQuestions
                key={q.key}
                idPrefix={idPrefix}
                responses={responses}
                onChange={onChange}
                errors={errors}
                disabled={disabled}
              />
            );
          const questionId = `${idPrefix}-behavior-${q.key}-question`;
          const helpId = `${idPrefix}-behavior-${q.key}-help`;
          return (
            <li key={q.key}>
              <p
                id={questionId}
                className="text-[13px] font-semibold"
                style={text}
              >
                {q.title}
              </p>
              {q.help && (
                <QuestionHelp id={helpId}>
                  {q.help}
                </QuestionHelp>
              )}
              <p className="mt-4 text-[13px]" style={text}>
                {q.text}
              </p>
              <div className={`${PERIOD_GRID} mt-3`}>
                {BEHAVIOR_PERIODS.map((period) => {
                  const base = behaviorId(
                    idPrefix,
                    q.key,
                    period,
                  );
                  const labelId = `${base}-label`;
                  const answer = getBehaviorAnswer(
                    responses,
                    q.key,
                    period,
                  );
                  const error =
                    errors[behaviorErrorKey(q.key, period)];
                  const errorId = `${base}-error`;
                  return (
                    <div key={period} className="space-y-3">
                      <PeriodLabel id={labelId}>
                        {BEHAVIOR_PERIOD_LABEL[period]}
                      </PeriodLabel>
                      <YesNoRadios
                        idPrefix={base}
                        labelledBy={`${questionId} ${labelId}`}
                        describedBy={
                          [
                            q.help ? helpId : null,
                            error ? errorId : null,
                          ]
                            .filter(Boolean)
                            .join(" ") || undefined
                        }
                        invalid={!!error}
                        value={answer}
                        onChange={(v) =>
                          onChange(
                            setBehaviorAnswer(
                              responses,
                              q.key,
                              period,
                              v,
                            ),
                          )
                        }
                        disabled={disabled}
                      />
                      <FieldError id={errorId}>
                        {error}
                      </FieldError>
                      {answer === "yes" && q.described && (
                        <DescriptionField
                          id={`${base}-description`}
                          label="If Yes, Describe"
                          ariaLabel={`If Yes, Describe — ${q.title}, ${BEHAVIOR_PERIOD_LABEL[period]}`}
                          value={getBehaviorDescription(
                            responses,
                            q.key,
                            period,
                          )}
                          onChange={(v) =>
                            onChange(
                              setBehaviorDescription(
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
                      {answer === "yes" && q.countLabel && (
                        <CountField
                          id={`${base}-count`}
                          label={q.countLabel}
                          value={getBehaviorCount(
                            responses,
                            q.key,
                            period,
                          )}
                          onChange={(n) =>
                            onChange(
                              setBehaviorCount(
                                responses,
                                q.key,
                                period,
                                n,
                              ),
                            )
                          }
                          error={
                            errors[
                              behaviorErrorKey(
                                q.key,
                                period,
                                "count",
                              )
                            ]
                          }
                          disabled={disabled}
                        />
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

// ─── Section 4: editing ─────────────────────────────────────────────────────

export function FullLifetimeAttemptDetailsSection({
  idPrefix,
  responses,
  onChange,
  errors = {},
  disabled,
}: {
  idPrefix: string;
  responses: FullLifetimeResponses;
  onChange: (next: FullLifetimeResponses) => void;
  errors?: BehaviorErrors;
  disabled?: boolean;
}) {
  if (!isAttemptDetailsApplicable(responses)) return null;
  const headingId = `${idPrefix}-attempts-heading`;
  return (
    <section aria-labelledby={headingId} className="space-y-5">
      <h3
        id={headingId}
        className="text-[13px] font-semibold uppercase"
        style={text}
      >
        Attempt Details and Lethality
      </h3>
      {ATTEMPT_GROUPS.map((g) => {
        const a = responses.attempts[g.key];
        const dateId = attemptId(idPrefix, g.key, "date");
        const actualId = attemptId(idPrefix, g.key, "actual");
        const potentialId = attemptId(
          idPrefix,
          g.key,
          "potential",
        );
        const groupId = `${idPrefix}-attempts-${g.key}-group`;
        const dateError =
          errors[attemptErrorKey(g.key, "date")];
        return (
          <fieldset
            key={g.key}
            aria-labelledby={groupId}
            className="space-y-3"
          >
            <legend
              id={groupId}
              className="text-[13px] font-semibold"
              style={text}
            >
              {g.label}
            </legend>
            <div className={PERIOD_GRID}>
              <div>
                <FieldLabel htmlFor={dateId}>
                  Attempt Date
                </FieldLabel>
                <DateInput
                  id={dateId}
                  value={isoToMdy(a.date)}
                  onChange={(v) =>
                    onChange(
                      setAttemptField(responses, g.key, {
                        date: mdyToIso(v),
                      }),
                    )
                  }
                  disabled={disabled}
                  aria-invalid={dateError ? true : undefined}
                  aria-describedby={
                    dateError ? `${dateId}-error` : undefined
                  }
                />
                <FieldError id={`${dateId}-error`}>
                  {dateError}
                </FieldError>
              </div>
            </div>
            <div>
              <FieldLabel id={`${actualId}-label`}>
                Actual Lethality/Medical Damage
              </FieldLabel>
              <RatingSelect
                id={actualId}
                labelledBy={`${groupId} ${actualId}-label`}
                options={ACTUAL_LETHALITY_OPTIONS}
                value={a.actualLethality}
                onChange={(n) =>
                  onChange(
                    setAttemptField(responses, g.key, {
                      actualLethality: n,
                    }),
                  )
                }
                placeholder="Select a code"
                error={
                  errors[
                    attemptErrorKey(g.key, "actualLethality")
                  ]
                }
                disabled={disabled}
              />
            </div>
            {a.actualLethality === 0 && (
              <div>
                <FieldLabel id={`${potentialId}-label`}>
                  Potential Lethality
                </FieldLabel>
                <QuestionHelp id={`${potentialId}-help`}>
                  {POTENTIAL_LETHALITY_HELP}
                </QuestionHelp>
                <div className="mt-2">
                  <RatingSelect
                    id={potentialId}
                    labelledBy={`${groupId} ${potentialId}-label`}
                    options={POTENTIAL_LETHALITY_OPTIONS}
                    value={a.potentialLethality}
                    onChange={(n) =>
                      onChange(
                        setAttemptField(responses, g.key, {
                          potentialLethality: n,
                        }),
                      )
                    }
                    placeholder="Select a code"
                    error={
                      errors[
                        attemptErrorKey(
                          g.key,
                          "potentialLethality",
                        )
                      ]
                    }
                    disabled={disabled}
                  />
                </div>
              </div>
            )}
          </fieldset>
        );
      })}
    </section>
  );
}

function ActualAttemptDetails({
  responses,
}: {
  responses: FullLifetimeResponses;
}) {
  const legacy = lacksActualAttemptQuestions(responses);
  return (
    <li data-question="actualAttempt">
      <p className="text-[13px] font-semibold" style={text}>
        Actual Attempt
      </p>
      <div className="mt-1 space-y-2">
        {ACTUAL_ATTEMPT_DEFINITION.map((para, i) => (
          <QuestionHelp
            key={i}
            id={`cssrs-fl-details-behavior-actualAttempt-definition-${i}`}
          >
            {para}
          </QuestionHelp>
        ))}
      </div>
      <ol className="mt-4 space-y-5 list-decimal pl-5">
        {ACTUAL_ATTEMPT_QUESTIONS.map((aq) => {
          const missing =
            legacy && aq.id !== ACTUAL_ATTEMPT_PRIMARY_ID;
          return (
            <li
              key={aq.id}
              data-actual-attempt-question={aq.id}
            >
              <p className="text-[13px]" style={text}>
                {aq.text}
              </p>
              <dl className={`${PERIOD_GRID} mt-3`}>
                {BEHAVIOR_PERIODS.map((period) => {
                  const answer = getActualAttemptAnswer(
                    responses,
                    aq.id,
                    period,
                  );
                  return (
                    <div
                      key={period}
                      className="space-y-3"
                      data-period={period}
                    >
                      <ReadOnlyResponse
                        label={BEHAVIOR_PERIOD_LABEL[period]}
                        value={
                          missing
                            ? "Not captured in this assessment"
                            : YES_NO_LABEL[answer]
                        }
                      />
                      {!missing && answer === "yes" && (
                        <ReadOnlyResponse
                          label="If Yes, Describe"
                          value={
                            getActualAttemptDescription(
                              responses,
                              aq.id,
                              period,
                            ) || "Not provided"
                          }
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
      <div className="mt-5" data-actual-attempt-totals>
        <p className="text-[13px] font-semibold" style={text}>
          Total Number of Attempts
        </p>
        <dl className={`${PERIOD_GRID} mt-3`}>
          {BEHAVIOR_PERIODS.map((period) => (
            <ReadOnlyResponse
              key={period}
              label={`Total Number of Attempts: ${BEHAVIOR_PERIOD_LABEL[period]}`}
              value={getBehaviorCount(
                responses,
                "actualAttempt",
                period,
              )}
            />
          ))}
        </dl>
      </div>
    </li>
  );
}

// ─── Sections 3–4: read-only ────────────────────────────────────────────────

export function FullLifetimeBehaviorAttemptDetails({
  responses,
}: {
  responses: FullLifetimeResponses;
}) {
  return (
    <div
      className="space-y-6"
      data-testid="cssrs-fl-behavior-details"
    >
      <section className="space-y-5">
        <h3
          className="text-[13px] font-semibold uppercase"
          style={text}
        >
          Suicidal Behavior
        </h3>
        <QuestionHelp id="cssrs-fl-details-behavior-guidance">
          {BEHAVIOR_GUIDANCE}
        </QuestionHelp>
        <ol className="space-y-5">
          {BEHAVIOR_QUESTIONS.map((q) =>
            q.key === "actualAttempt" ? (
              <ActualAttemptDetails
                key={q.key}
                responses={responses}
              />
            ) : (
              <li key={q.key} data-question={q.key}>
                <p
                  className="text-[13px] font-semibold"
                  style={text}
                >
                  {q.title}
                </p>
                {q.help && (
                  <QuestionHelp
                    id={`cssrs-fl-details-behavior-${q.key}-help`}
                  >
                    {q.help}
                  </QuestionHelp>
                )}
                <p className="mt-4 text-[13px]" style={text}>
                  {q.text}
                </p>
                <dl className={`${PERIOD_GRID} mt-3`}>
                  {BEHAVIOR_PERIODS.map((period) => {
                    const answer = getBehaviorAnswer(
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
                          label={BEHAVIOR_PERIOD_LABEL[period]}
                          value={YES_NO_LABEL[answer]}
                        />
                        {answer === "yes" && q.described && (
                          <ReadOnlyResponse
                            label="If Yes, Describe"
                            value={
                              getBehaviorDescription(
                                responses,
                                q.key,
                                period,
                              ) || "Not provided"
                            }
                          />
                        )}
                        {answer === "yes" && q.countLabel && (
                          <ReadOnlyResponse
                            label={q.countLabel}
                            value={getBehaviorCount(
                              responses,
                              q.key,
                              period,
                            )}
                          />
                        )}
                      </div>
                    );
                  })}
                </dl>
              </li>
            ),
          )}
        </ol>
      </section>

      {isAttemptDetailsApplicable(responses) && (
        <section className="space-y-5">
          <h3
            className="text-[13px] font-semibold uppercase"
            style={text}
          >
            Attempt Details and Lethality
          </h3>
          {ATTEMPT_GROUPS.map((g) => {
            const a = responses.attempts[g.key];
            return (
              <div key={g.key} data-attempt-group={g.key}>
                <p
                  className="text-[13px] font-semibold"
                  style={text}
                >
                  {g.label}
                </p>
                <dl className="mt-3 space-y-3">
                  <ReadOnlyResponse
                    label="Attempt Date"
                    value={a.date ? isoToMdy(a.date) : ""}
                  />
                  <ReadOnlyResponse
                    label="Actual Lethality/Medical Damage"
                    value={
                      actualLethalityText(a.actualLethality) ??
                      ""
                    }
                  />
                  {a.actualLethality === 0 && (
                    <ReadOnlyResponse
                      label="Potential Lethality"
                      value={
                        potentialLethalityText(
                          a.potentialLethality,
                        ) ?? ""
                      }
                    />
                  )}
                </dl>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}