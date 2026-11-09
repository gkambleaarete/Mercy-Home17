// Interview Summary for one Mentor Application (US 20039 Chunk 3). Staff
// record the interview here; answers are kept in the staff-only interview
// record (saveFFMentorInterview), never in the application. The questions
// shown come from one definition source and one applicability rule
// (applicableInterviewQuestions) shared with the store's validation.
// Saving only stores answers: it does not complete the "Mentor Interview
// Complete" checklist item, change the stage, or affect eligibility.

import { useState } from "react";
import { ClipboardList, Pencil } from "@/app/lib/lucide-icons";
import { toast } from "sonner";
import { Section } from "../FriendsFirstMentorRecord";
import { ErrMsg } from "../FriendsFirstMenteeRecord";
import { Button } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";
import { useUnsavedChangesGuard } from "../../lib/useUnsavedChangesGuard";
import type { FFMentorApplication } from "../../data/ffMentorApplication";
import {
  FF_INTERVIEW_SECTIONS,
  applicableInterviewQuestions,
  validateInterviewAnswers,
  type FFInterviewAnswers,
  type FFInterviewQuestion,
} from "../../data/ffMentorInterview";
import {
  saveFFMentorInterview,
  useFFMentorInterview,
} from "../../data/ffMentorApplicationStore";

const BORDER = "1px solid var(--slds-g-color-border-base-1)";
const domId = (id: string) => `iv-${id.replace(/\./g, "-")}`;
const NONE: FFInterviewAnswers = {};

/** Long question wording stays readable: normal case, wrapped. */
function QuestionLabel({
  id,
  children,
  required,
}: {
  id: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <p
      id={`${id}-label`}
      className="mb-1.5 text-[13px] font-semibold leading-snug break-words text-[var(--slds-g-color-text-default)]"
    >
      {children}
      {required && (
        <span className="text-red-600" aria-hidden>
          {" "}
          *
        </span>
      )}
    </p>
  );
}

const norm = (v: string | undefined) => v ?? "";

export function InterviewSummaryPanel({
  app,
}: {
  app: FFMentorApplication;
}) {
  const record = useFFMentorInterview(app.applicationId);
  const saved = record?.answers ?? NONE;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<FFInterviewAnswers>(saved);
  // What the open draft started from: the conflict check compares against it.
  const [base, setBase] = useState<FFInterviewAnswers>(saved);
  const [errors, setErrors] = useState<Record<string, string>>(
    {},
  );
  const [saveError, setSaveError] = useState("");

  const keys = new Set([
    ...Object.keys(draft),
    ...Object.keys(base),
  ]);
  const dirty =
    editing &&
    [...keys].some((k) => norm(draft[k]) !== norm(base[k]));

  const startEdit = () => {
    setDraft(saved);
    setBase(saved);
    setErrors({});
    setSaveError("");
    setEditing(true);
  };
  const cancelEdit = () => {
    setDraft(saved);
    setBase(saved);
    setErrors({});
    setSaveError("");
    setEditing(false);
  };
  const leaveGuard = useUnsavedChangesGuard(dirty, cancelEdit);

  // View mode shows what is saved; edit mode follows the draft (a children
  // Yes/No change shows or hides its follow-ups at once).
  const shown = applicableInterviewQuestions(
    app.subPrograms,
    editing ? draft : saved,
  );
  const bySection = FF_INTERVIEW_SECTIONS.map((s) => ({
    ...s,
    questions: shown.filter((q) => q.section === s.id),
  })).filter((s) => s.questions.length > 0);

  const set = (id: string, v: string) => {
    setDraft((d) => ({ ...d, [id]: v }));
    setErrors((e) => {
      if (!e[id]) return e;
      const { [id]: _drop, ...rest } = e;
      return rest;
    });
    setSaveError("");
  };

  const save = () => {
    setSaveError("");
    const fieldErrors = validateInterviewAnswers(
      app.subPrograms,
      draft,
    );
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      const first = shown.find((q) => fieldErrors[q.id]);
      if (first)
        document.getElementById(domId(first.id))?.focus();
      return;
    }
    // Only applicable answers that changed; hidden ones keep their saved
    // value untouched.
    const visible = new Set(shown.map((q) => q.id));
    const change: FFInterviewAnswers = {};
    const from: Record<string, string | undefined> = {};
    for (const k of keys)
      if (visible.has(k) && norm(draft[k]) !== norm(base[k])) {
        change[k] = draft[k];
        from[k] = base[k];
      }
    if (!Object.keys(change).length) {
      setEditing(false);
      return;
    }
    const r = saveFFMentorInterview(
      app.applicationId,
      change,
      from,
    );
    if (!r.ok) {
      setErrors(r.fieldErrors ?? {});
      if (r.fieldErrors) {
        const first = shown.find((q) => r.fieldErrors![q.id]);
        if (first)
          document.getElementById(domId(first.id))?.focus();
      }
      setSaveError(
        r.reason === "conflict"
          ? `Not saved: ${r.conflicts?.length ?? 1} answer${(r.conflicts?.length ?? 1) > 1 ? "s were" : " was"} changed elsewhere while you were editing. Your draft is kept — Cancel and reopen to see the latest.`
          : r.reason === "invalid"
            ? `Not saved: ${Object.keys(r.fieldErrors ?? {}).length} required question(s) need attention.`
            : r.reason === "storage"
              ? "Changes could not be saved. Your edits are still here — please try again."
              : "Not saved: the interview could not be updated. Your edits are still here.",
      );
      return;
    }
    setEditing(false);
    toast.success("Interview Summary saved");
  };

  const control = (q: FFInterviewQuestion) => {
    const id = domId(q.id);
    const err = errors[q.id];
    if (q.input === "yesNo")
      return (
        <fieldset className="min-w-0">
          <QuestionLabel id={id}>{q.label}</QuestionLabel>
          <RadioGroup
            id={id}
            aria-labelledby={`${id}-label`}
            className="flex gap-6"
            value={draft[q.id] ?? ""}
            onValueChange={(v: string) => set(q.id, v)}
          >
            {(["yes", "no"] as const).map((v) => (
              <div key={v} className="flex items-center gap-2">
                <RadioGroupItem value={v} id={`${id}-${v}`} />
                <Label htmlFor={`${id}-${v}`}>
                  {v === "yes" ? "Yes" : "No"}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </fieldset>
      );
    return (
      <div className="min-w-0">
        <label htmlFor={id}>
          <QuestionLabel id={id} required={q.mandatory}>
            {q.label}
          </QuestionLabel>
        </label>
        <Textarea
          id={id}
          size="md"
          surface="base"
          rows={2}
          value={draft[q.id] ?? ""}
          aria-required={q.mandatory}
          aria-invalid={!!err}
          aria-describedby={err ? `${id}-error` : undefined}
          onChange={(e) => set(q.id, e.target.value)}
        />
        <ErrMsg id={id} msg={err} />
      </div>
    );
  };

  const editButton = !editing && (
    <Button variant="outline" size="sm" onClick={startEdit}>
      <Pencil />
      Edit
    </Button>
  );

  if (!record && !editing)
    return (
      <>
        <Section
          title="Interview Summary"
          first
          action={editButton}
        >
          <EmptyState
            icon={ClipboardList}
            title="No interview recorded yet"
            description="Use Edit to record the interview for this application."
          />
        </Section>
      </>
    );

  const errorCount = Object.keys(errors).length;
  return (
    <>
      {bySection.map((s, i) => (
        <Section
          key={s.id}
          title={s.title}
          first={i === 0}
          action={i === 0 ? editButton : undefined}
        >
          {i === 0 && record && !editing && (
            <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] mb-4">
              Last saved by {record.updatedBy} on{" "}
              {record.updatedAt}.
            </p>
          )}
          <div className="grid grid-cols-1 gap-x-8 gap-y-5">
            {s.questions.map((q) =>
              editing ? (
                <div key={q.id}>{control(q)}</div>
              ) : (
                <div key={q.id} className="min-w-0">
                  <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1 normal-case break-words">
                    {q.label}
                  </p>
                  <p className="slds-text-6 text-[var(--slds-g-color-text-default)] whitespace-pre-wrap break-words">
                    {q.input === "yesNo"
                      ? saved[q.id] === "yes"
                        ? "Yes"
                        : saved[q.id] === "no"
                          ? "No"
                          : "Not answered"
                      : saved[q.id]?.trim()
                        ? saved[q.id]
                        : "Not answered"}
                  </p>
                </div>
              ),
            )}
          </div>
        </Section>
      ))}

      {editing && (
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 flex-wrap"
          style={{ borderTop: BORDER }}
        >
          <p
            role="alert"
            className="text-[13px] mr-auto"
            style={{ color: "#c23934" }}
          >
            {saveError ||
              (errorCount
                ? `Not saved: ${errorCount} required question${errorCount > 1 ? "s need" : " needs"} attention.`
                : "")}
          </p>
          <Button variant="outline" onClick={cancelEdit}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </div>
      )}
      {leaveGuard}
    </>
  );
}