import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { DateInput } from "../ui/date-input";
import { TimeInput } from "../ui/time-input";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Package, Plus } from "@/app/lib/lucide-icons";
import { useNavigate } from "react-router";
import {
  type PackMedLaunch,
  PackMedsView,
} from "../admissions/PackMedsView";
import { AssociationTakeoverDialog } from "./AssociationTakeoverDialog";
import {
  packMedLabel,
  usePackMeds,
} from "../../data/mockPackMedData";
import { isValidMdy } from "../../data/mockProgramsData";
import { SearchableSelect } from "../ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { formatPhone } from "../../lib/phone";
import {
  type PassFormErrors,
  type PassFormValues,
  PASS_OTHER,
  emptyPassForm,
  getPassAddressOptions,
  passToForm,
  copyPassToForm,
  validatePassForm,
  describeRecurrence,
  isShortenedOrExtended,
} from "../../lib/passes";
import {
  type PassRecord,
  DEPARTURE_METHOD_OPTIONS,
  PASS_STATUS_BADGE_VARIANT,
  PASS_STATUS_OPTIONS,
  RETURN_METHOD_OPTIONS,
  WEEKDAYS,
  getSeriesPasses,
} from "../../data/mockPassData";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import { getPrograms } from "../../data/mockProgramsData";
import {
  getActiveYouth,
  getCurrentProgramIdForYouth,
  getPassEligibleRelationships,
  getYouthName,
} from "../../data/mockYouthProgramData";

// The ONE Pass record form (19998) — Create, Edit and View share this
// component. Entry points supply context through defaultYouthId /
// defaultProgramId (applied when the form opens) instead of the form knowing
// where it was opened from:
//   Pass object / Global action → no defaults
//   Program Record / Program Log → defaultProgramId
//   Constituent Profile          → defaultYouthId (Program follows the
//                                  youth's current Program)
// Hosts trigger save through the ref (`submit()`), so the same form can sit
// on a record page or inside a Dialog with the host's own footer.

export interface PassFormHandle {
  /** Validates; calls onSubmit with the values only when valid. */
  submit: () => void;
}

export interface PassFormProps {
  mode: "create" | "edit" | "view";
  /** The Pass being edited/viewed. Ignored in create mode. */
  pass?: PassRecord | null;
  defaultYouthId?: string;
  defaultProgramId?: number;
  /** ISO "YYYY-MM-DD" — e.g. the date a Calendar "New Pass" started from. */
  defaultStartDate?: string;
  /** Create mode: prefill from this Pass ("Copy"). The source is never edited. */
  copyFrom?: PassRecord | null;
  /** Constituent-owned launch (the Constituent Pass tab): Youth and Program
   *  are fixed to this context — rendered read-only, enforced on every
   *  initial value (including Copy) and kept in step if the Constituent's
   *  current Program changes. The rest of the form stays editable. */
  ownerContext?: {
    youthId: string;
    youthName: string;
    programId: number;
    programName: string;
  } | null;
  onSubmit: (values: PassFormValues) => void;
}

// ─── Field helpers (same treatment as the app's other record forms, e.g.
// FriendsFirstMentorMatches / ProgramRecordPage) ────────────────────────────

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="slds-form-label block mb-1.5 text-[var(--slds-g-color-text-weak)]"
    >
      {children}
      {required && <span className="text-[#c23934]"> *</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="slds-text-3 mt-1 text-[#c23934]">
      {message}
    </p>
  );
}

// Read-only value — plain text, never boxed like an input.
function ReadText({ value }: { value: string }) {
  return (
    <p className="slds-text-4 whitespace-pre-wrap break-words text-[var(--slds-g-color-text-default)]">
      {value || "—"}
    </p>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="section">
      <CardHeader size="sm" separated>
        <CardTitle size="sm">{title}</CardTitle>
      </CardHeader>
      <CardContent size="sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export const PassForm = forwardRef<
  PassFormHandle,
  PassFormProps
>(function PassForm(
  {
    mode,
    pass,
    defaultYouthId,
    defaultProgramId,
    defaultStartDate,
    copyFrom,
    ownerContext,
    onSubmit,
  },
  ref,
) {
  const readOnly = mode === "view";
  // Youth and Program fixed by the launching Constituent (create/edit only).
  const ownerLocked = !!ownerContext && !readOnly;
  const lockOwner = (f: PassFormValues): PassFormValues =>
    ownerContext
      ? {
          ...f,
          youthId: ownerContext.youthId,
          programId: String(ownerContext.programId),
        }
      : f;

  // Initial values — defaults apply when the form opens, never on save.
  const initialValues = (): PassFormValues => {
    if (mode !== "create" && pass) return passToForm(pass);
    // Copy: the carried-over fields of the source Pass (never its dates,
    // Noteworthy Details, status or system fields). The owner context is
    // applied after, so a copied Youth/Program can never replace it.
    if (copyFrom) return lockOwner(copyPassToForm(copyFrom));
    const f = emptyPassForm();
    if (defaultYouthId) {
      f.youthId = defaultYouthId;
      const current =
        getCurrentProgramIdForYouth(defaultYouthId);
      if (current !== null) f.programId = String(current);
    }
    if (defaultProgramId !== undefined)
      f.programId = String(defaultProgramId);
    if (defaultStartDate)
      f.startDate = isoToMdy(defaultStartDate);
    return lockOwner(f);
  };

  const [values, setValues] =
    useState<PassFormValues>(initialValues);
  const [errors, setErrors] = useState<PassFormErrors>({});

  useEffect(() => {
    setValues(initialValues());
    setErrors({});
    // Re-initialise only when a different record / mode / context opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mode,
    pass?.id,
    defaultYouthId,
    defaultProgramId,
    defaultStartDate,
    copyFrom?.id,
    // View is read-only, so it follows the live record (e.g. Cancel Pass
    // from the same modal). Create/Edit hold a draft and are never reset by
    // a store update.
    mode === "view" ? pass : null,
  ]);

  // The Constituent's current Program can change while the form is open:
  // update only Youth/Program (never other draft values) and say so.
  const [ownerNotice, setOwnerNotice] = useState("");
  const lastOwner = useRef(
    ownerContext
      ? `${ownerContext.youthId}:${ownerContext.programId}`
      : "",
  );
  useEffect(() => {
    if (!ownerContext || mode === "view") return;
    const key = `${ownerContext.youthId}:${ownerContext.programId}`;
    if (key === lastOwner.current) return;
    const programChanged =
      lastOwner.current.split(":")[1] !==
      String(ownerContext.programId);
    lastOwner.current = key;
    setValues((v) => lockOwner(v));
    if (programChanged)
      setOwnerNotice(
        `The Program changed to ${ownerContext.programName}. Your other entries were kept.`,
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerContext?.youthId, ownerContext?.programId]);

  function patch(next: Partial<PassFormValues>) {
    setValues((v) => ({ ...v, ...next }));
    setErrors((e) => {
      const cleared = { ...e };
      for (const k of Object.keys(next))
        delete cleared[k as keyof PassFormValues];
      return cleared;
    });
  }

  // ── Option sources ──────────────────────────────────────────────────
  const youthOptions = useMemo(
    () =>
      getActiveYouth().map((y) => ({
        value: y.youthId,
        label: y.youthName,
      })),
    [],
  );
  const programOptions = useMemo(
    () =>
      getPrograms()
        .filter(
          (p) =>
            p.status === "Active" ||
            String(p.id) === values.programId,
        )
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((p) => ({ value: String(p.id), label: p.name })),
    [values.programId],
  );
  const eligible = useMemo(
    () => getPassEligibleRelationships(values.youthId),
    [values.youthId],
  );
  const stayingWithOptions = [
    ...eligible.map((r) => ({
      value: r.constituentId,
      label: `${r.firstName} ${r.lastName} (${r.relationship})`,
    })),
    ...(values.youthId
      ? [{ value: PASS_OTHER, label: "Other" }]
      : []),
  ];
  const addressOptions = [
    ...getPassAddressOptions(
      values.youthId,
      values.stayingWith,
    ).map(({ value, label }) => ({ value, label })),
    ...(values.youthId
      ? [{ value: PASS_OTHER, label: "Other" }]
      : []),
  ];

  // ── Dependent field resets ─────────────────────────────────────────
  // Youth drives every Who/Where option, so changing it clears them all
  // rather than leaving the previous youth's guardian/phone/address.
  function changeYouth(youthId: string) {
    if (youthId === values.youthId) return;
    patch({
      youthId,
      stayingWith: "",
      otherName: "",
      phone: "",
      stayingAt: "",
      otherAddress: "",
      // A Pack Med belongs to one youth — never keep another youth's.
      packMedId: "",
    });
    setPackMedNotice(
      values.packMedId
        ? "The Pack Med was removed because it belongs to the previously selected youth. Choose a Pack Med for this youth."
        : "",
    );
  }

  // A constituent fills Phone with their primary phone (still editable);
  // Other clears it for manual entry. An address that belonged to the
  // previous constituent no longer applies, so it is cleared.
  function changeStayingWith(stayingWith: string) {
    if (stayingWith === values.stayingWith) return;
    const rel = eligible.find(
      (r) => r.constituentId === stayingWith,
    );
    const keepAddress =
      !values.stayingAt.startsWith("constituent:");
    patch({
      stayingWith,
      otherName: "",
      phone: rel ? formatPhone(rel.primaryPhone) : "",
      ...(keepAddress
        ? {}
        : { stayingAt: "", otherAddress: "" }),
    });
  }

  function changeStayingAt(stayingAt: string) {
    patch({
      stayingAt,
      ...(stayingAt === PASS_OTHER ? {} : { otherAddress: "" }),
    });
  }

  // Status drives the conditional sections; switching clears their now-
  // irrelevant errors so nothing stale stays on screen. Entered values are
  // kept in the draft but never saved or validated while hidden.
  function changeStatus(status: string) {
    setValues((v) => ({
      ...v,
      status: status as PassFormValues["status"],
    }));
    setErrors((e) => {
      const {
        status: _s,
        cancellationReason: _c,
        actualReturnDate: _d,
        actualReturnTime: _t,
        changeReason: _r,
        ...rest
      } = e;
      return rest;
    });
  }

  // Recurring schedules always generate Pending occurrences, so Status is
  // reset to Pending and locked while Repeats is on.
  function toggleRepeats(repeats: boolean) {
    setValues((v) => ({
      ...v,
      repeats,
      ...(repeats ? { status: "Pending" as const } : {}),
    }));
    setErrors((e) => {
      const {
        repeatEvery: _a,
        departureDay: _b,
        returnDay: _c,
        ends: _d,
        endsOnDate: _e,
        numberOfPasses: _f,
        status: _g,
        ...rest
      } = e;
      return rest;
    });
  }

  // ── Pack Med (20042) — same-youth options; the Pack Medication workflow
  // opens in a dialog over this still-mounted form, so unsaved edits
  // survive. The association is only written when the Pass is saved.
  const navigate = useNavigate();
  const allPackMeds = usePackMeds();
  const packMedOptions = [
    { value: "none", label: "None" },
    ...allPackMeds
      .filter((m) => m.youthId === values.youthId)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .map((m) => ({
        value: String(m.id),
        label:
          m.passId != null &&
          String(m.passId) !== String(pass?.id ?? "")
            ? `${packMedLabel(m)} (linked to another pass)`
            : packMedLabel(m),
      })),
  ];
  // View reads the live record (links can change from the Pack Med side);
  // Create/Edit read the form's draft selection.
  const shownPackMedId = readOnly
    ? pass?.packMedId != null
      ? String(pass.packMedId)
      : ""
    : values.packMedId;
  const linkedPackMed = allPackMeds.find(
    (m) => String(m.id) === shownPackMedId,
  );
  // The Pack Medication workflow (8-step dialog) for this youth.
  const [packMedLaunch, setPackMedLaunch] =
    useState<PackMedLaunch | null>(null);
  const [packMedNotice, setPackMedNotice] = useState("");
  // A Pack Med already linked to ANOTHER Pass needs confirmation first.
  const [takeoverPackMedId, setTakeoverPackMedId] = useState<
    string | null
  >(null);
  function choosePackMed(v: string) {
    const next = v === "none" ? "" : v;
    const m = allPackMeds.find((x) => String(x.id) === next);
    setPackMedNotice("");
    if (m && m.passId != null && m.passId !== pass?.id)
      setTakeoverPackMedId(next);
    else patch({ packMedId: next });
  }

  // A Pack Med saved from the workflow becomes this draft's selection; the
  // Pass ↔ Pack Med link is written only when the Pass itself is saved.
  function handlePackMedSaved(id: number) {
    if (id === Number(values.packMedId)) return;
    choosePackMed(String(id));
  }

  function newPackMedFromPass() {
    setPackMedLaunch({
      mode: "create",
      // Packing period defaults from the Pass's departure and return.
      defaults: {
        startDate: isValidMdy(values.startDate)
          ? values.startDate
          : "",
        startTime: values.departureTime,
        endDate: isValidMdy(values.endDate)
          ? values.endDate
          : "",
        endTime: values.returnTime,
      },
    });
  }

  const series = pass?.seriesId
    ? getSeriesPasses(pass.seriesId)
    : [];
  const seriesPosition = pass
    ? series.findIndex((p) => p.id === pass.id) + 1
    : 0;

  const rootRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({
    submit() {
      const e = validatePassForm(values);
      setErrors(e);
      if (Object.keys(e).length === 0) {
        onSubmit(values);
        return;
      }
      // Bring the first invalid field into view (after the errors render).
      requestAnimationFrame(() => {
        const alert =
          rootRef.current?.querySelector<HTMLElement>(
            '[role="alert"]',
          );
        if (!alert) return;
        const field = alert.parentElement?.querySelector<HTMLElement>(
          'input, textarea, select, button[role="combobox"]',
        );
        (field ?? alert).scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
        field?.focus({ preventScroll: true });
      });
    },
  }));

  // ── Read-only labels ───────────────────────────────────────────────
  const youthLabel =
    (ownerLocked ? ownerContext!.youthName : "") ||
    youthOptions.find((o) => o.value === values.youthId)
      ?.label ||
    // Not in the Active Youth picker (Community Care Member, or a
    // youth who has left): the canonical Constituent name.
    getYouthName(values.youthId);
  const programLabel =
    (ownerLocked ? ownerContext!.programName : "") ||
    (getPrograms().find((p) => String(p.id) === values.programId)
      ?.name ??
      "");
  const whoLabel =
    values.stayingWith === PASS_OTHER
      ? "Other"
      : (pass?.stayingWithName ??
        stayingWithOptions.find(
          (o) => o.value === values.stayingWith,
        )?.label ??
        "");
  const whereLabel =
    values.stayingAt === PASS_OTHER
      ? "Other"
      : (pass?.stayingAtAddress ??
        addressOptions.find((o) => o.value === values.stayingAt)
          ?.label ??
        "");

  function picklist(
    field:
      | "status"
      | "departureMethod"
      | "returnMethod"
      | "departureDay"
      | "returnDay",
    id: string,
    options: readonly string[],
    disabled = false,
  ) {
    return (
      <Select
        value={values[field]}
        onValueChange={(v) =>
          field === "status"
            ? changeStatus(v)
            : patch({ [field]: v } as Partial<PassFormValues>)
        }
        disabled={disabled}
      >
        <SelectTrigger
          surface={disabled ? "default" : "base"}
          id={id}
          className="w-full"
          aria-invalid={!!errors[field]}
        >
          <SelectValue placeholder="Please Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div ref={rootRef} className="space-y-4">
      {ownerNotice && (
        <p
          role="status"
          className="slds-text-3 rounded border px-3 py-2 text-[var(--slds-g-color-text-default)] bg-[var(--slds-g-color-background-alt)]"
        >
          {ownerNotice}
        </p>
      )}
      {/* 1. Record Header */}
      <Section title="Record Header">
        <div>
          <FieldLabel
            htmlFor="pass-program"
            required={!readOnly && !ownerLocked}
          >
            PROGRAM
          </FieldLabel>
          {readOnly || ownerLocked ? (
            <div
              id="pass-program"
              role="group"
              aria-label={`Program${ownerLocked ? " (read-only, set by the Constituent's current Program)" : ""}`}
            >
              <ReadText value={programLabel} />
            </div>
          ) : (
            <SearchableSelect
              id="pass-program"
              value={values.programId}
              onValueChange={(v) => patch({ programId: v })}
              options={programOptions}
              placeholder="Select program"
              searchPlaceholder="Search programs…"
              aria-invalid={!!errors.programId}
            />
          )}
          <FieldError message={errors.programId} />
        </div>

        <div>
          <FieldLabel
            htmlFor="pass-youth"
            required={!readOnly && !ownerLocked}
          >
            YOUTH
          </FieldLabel>
          {readOnly || ownerLocked ? (
            <div
              id="pass-youth"
              role="group"
              aria-label={`Youth${ownerLocked ? " (read-only, this Constituent)" : ""}`}
            >
              <ReadText value={youthLabel} />
            </div>
          ) : (
            <SearchableSelect
              id="pass-youth"
              value={values.youthId}
              onValueChange={changeYouth}
              options={youthOptions}
              placeholder="Select youth"
              searchPlaceholder="Search youth…"
              aria-invalid={!!errors.youthId}
            />
          )}
          <FieldError message={errors.youthId} />
        </div>

        <div>
          <FieldLabel
            htmlFor="pass-status"
            required={!readOnly}
          >
            STATUS
          </FieldLabel>
          {readOnly ? (
            <div>
              <Badge
                variant={
                  PASS_STATUS_BADGE_VARIANT[values.status]
                }
              >
                {values.status}
              </Badge>
            </div>
          ) : (
            picklist(
              "status",
              "pass-status",
              PASS_STATUS_OPTIONS,
              values.repeats,
            )
          )}
          {!readOnly && values.repeats && (
            <p className="slds-text-3 mt-1 text-[var(--slds-g-color-text-weak)]">
              Every pass in a recurring schedule starts as
              Pending.
            </p>
          )}
          <FieldError message={errors.status} />
        </div>

        {/* Cancelled → Cancellation Reason */}
        {values.status === "Cancelled" && (
          <div className="sm:col-span-2">
            <FieldLabel
              htmlFor="pass-cancellation-reason"
              required={!readOnly}
            >
              CANCELLATION REASON
            </FieldLabel>
            {readOnly ? (
              <ReadText value={values.cancellationReason} />
            ) : (
              <Textarea
                surface="base"
                id="pass-cancellation-reason"
                value={values.cancellationReason}
                onChange={(e) =>
                  patch({ cancellationReason: e.target.value })
                }
                placeholder="Enter cancellation reason"
                aria-invalid={!!errors.cancellationReason}
              />
            )}
            <FieldError message={errors.cancellationReason} />
          </div>
        )}

        {/* Shortened / Extended → Actual Return + Change Reason */}
        {isShortenedOrExtended(values.status) && (
          <>
            <div>
              <FieldLabel
                htmlFor="pass-actual-return-date"
                required={!readOnly}
              >
                ACTUAL RETURN DATE
              </FieldLabel>
              {readOnly ? (
                <ReadText value={values.actualReturnDate} />
              ) : (
                <DateInput
                  id="pass-actual-return-date"
                  value={values.actualReturnDate}
                  onChange={(v) =>
                    patch({ actualReturnDate: v })
                  }
                  required
                />
              )}
              <FieldError message={errors.actualReturnDate} />
            </div>
            <div>
              <FieldLabel
                htmlFor="pass-actual-return-time"
                required={!readOnly}
              >
                ACTUAL RETURN TIME
              </FieldLabel>
              {readOnly ? (
                <ReadText value={values.actualReturnTime} />
              ) : (
                <TimeInput
                  surface="base"
                  id="pass-actual-return-time"
                  value={values.actualReturnTime}
                  onChange={(v) =>
                    patch({ actualReturnTime: v })
                  }
                  placeholder="e.g. 6:00 PM"
                />
              )}
              <FieldError message={errors.actualReturnTime} />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel
                htmlFor="pass-change-reason"
                required={!readOnly}
              >
                CHANGE REASON
              </FieldLabel>
              {readOnly ? (
                <ReadText value={values.changeReason} />
              ) : (
                <Textarea
                  surface="base"
                  id="pass-change-reason"
                  value={values.changeReason}
                  onChange={(e) =>
                    patch({ changeReason: e.target.value })
                  }
                  placeholder="Enter change reason"
                  aria-invalid={!!errors.changeReason}
                />
              )}
              <FieldError message={errors.changeReason} />
            </div>
          </>
        )}
      </Section>

      {/* 2. When */}
      <Section title="When">
        <div>
          <FieldLabel
            htmlFor="pass-start-date"
            required={!readOnly}
          >
            START DATE
          </FieldLabel>
          {readOnly ? (
            <ReadText value={values.startDate} />
          ) : (
            <DateInput
              id="pass-start-date"
              value={values.startDate}
              onChange={(v) => patch({ startDate: v })}
              required
            />
          )}
          <FieldError message={errors.startDate} />
        </div>

        <div>
          <FieldLabel
            htmlFor="pass-departure-time"
            required={!readOnly}
          >
            DEPARTURE TIME
          </FieldLabel>
          {readOnly ? (
            <ReadText value={values.departureTime} />
          ) : (
            <TimeInput
              surface="base"
              id="pass-departure-time"
              value={values.departureTime}
              onChange={(v) => patch({ departureTime: v })}
              placeholder="e.g. 5:00 PM"
            />
          )}
          <FieldError message={errors.departureTime} />
        </div>

        <div>
          <FieldLabel
            htmlFor="pass-end-date"
            required={!readOnly}
          >
            END DATE
          </FieldLabel>
          {readOnly ? (
            <ReadText value={values.endDate} />
          ) : (
            <DateInput
              id="pass-end-date"
              value={values.endDate}
              onChange={(v) => patch({ endDate: v })}
              required
            />
          )}
          <FieldError message={errors.endDate} />
        </div>

        <div>
          <FieldLabel
            htmlFor="pass-return-time"
            required={!readOnly}
          >
            RETURN TIME
          </FieldLabel>
          {readOnly ? (
            <ReadText value={values.returnTime} />
          ) : (
            <TimeInput
              surface="base"
              id="pass-return-time"
              value={values.returnTime}
              onChange={(v) => patch({ returnTime: v })}
              placeholder="e.g. 4:00 PM"
            />
          )}
          <FieldError message={errors.returnTime} />
        </div>
      </Section>

      {/* Recurrence — set up on Create; on an existing occurrence it is
            read-only series information (occurrences are edited through the
            series scope prompt instead). */}
      {mode === "create" ? (
        <Section title="Recurrence">
          <div className="sm:col-span-2 flex items-center gap-2">
            <Checkbox
              surface="base"
              id="pass-repeats"
              checked={values.repeats}
              onCheckedChange={(c) => toggleRepeats(c === true)}
            />
            <label
              htmlFor="pass-repeats"
              className="slds-text-4 cursor-pointer"
            >
              Repeats
            </label>
          </div>

          {values.repeats && (
            <>
              <div>
                <FieldLabel
                  htmlFor="pass-repeat-every"
                  required
                >
                  REPEAT EVERY (WEEKS)
                </FieldLabel>
                <Input
                  id="pass-repeat-every"
                  size="md"
                  surface="base"
                  inputMode="numeric"
                  value={values.repeatEvery}
                  onChange={(e) =>
                    patch({
                      repeatEvery: e.target.value.replace(
                        /\D/g,
                        "",
                      ),
                    })
                  }
                  placeholder="e.g. 2"
                  aria-invalid={!!errors.repeatEvery}
                />
                <FieldError message={errors.repeatEvery} />
              </div>
              <div />
              <div>
                <FieldLabel
                  htmlFor="pass-departure-day"
                  required
                >
                  DEPARTURE DAY
                </FieldLabel>
                {picklist(
                  "departureDay",
                  "pass-departure-day",
                  WEEKDAYS,
                )}
                <FieldError message={errors.departureDay} />
              </div>
              <div>
                <FieldLabel htmlFor="pass-return-day" required>
                  RETURN DAY
                </FieldLabel>
                {picklist(
                  "returnDay",
                  "pass-return-day",
                  WEEKDAYS,
                )}
                <FieldError message={errors.returnDay} />
              </div>
              <div>
                <FieldLabel htmlFor="pass-ends" required>
                  ENDS
                </FieldLabel>
                <Select
                  value={values.ends}
                  onValueChange={(v) =>
                    patch({
                      ends: v as PassFormValues["ends"],
                      endsOnDate: "",
                      numberOfPasses: "",
                    })
                  }
                >
                  <SelectTrigger
                    surface="base"
                    id="pass-ends"
                    className="w-full"
                    aria-invalid={!!errors.ends}
                  >
                    <SelectValue placeholder="Please Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onDate">
                      On Date
                    </SelectItem>
                    <SelectItem value="afterCount">
                      After Number of Passes
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FieldError message={errors.ends} />
              </div>
              {values.ends === "onDate" && (
                <div>
                  <FieldLabel
                    htmlFor="pass-ends-on-date"
                    required
                  >
                    RECURRENCE END DATE
                  </FieldLabel>
                  <DateInput
                    id="pass-ends-on-date"
                    value={values.endsOnDate}
                    onChange={(v) => patch({ endsOnDate: v })}
                    required
                  />
                  <FieldError message={errors.endsOnDate} />
                </div>
              )}
              {values.ends === "afterCount" && (
                <div>
                  <FieldLabel
                    htmlFor="pass-number-of-passes"
                    required
                  >
                    NUMBER OF PASSES
                  </FieldLabel>
                  <Input
                    id="pass-number-of-passes"
                    size="md"
                    surface="base"
                    inputMode="numeric"
                    value={values.numberOfPasses}
                    onChange={(e) =>
                      patch({
                        numberOfPasses: e.target.value.replace(
                          /\D/g,
                          "",
                        ),
                      })
                    }
                    placeholder="e.g. 6"
                    aria-invalid={!!errors.numberOfPasses}
                  />
                  <FieldError message={errors.numberOfPasses} />
                </div>
              )}
              <p className="sm:col-span-2 slds-text-3 text-[var(--slds-g-color-text-weak)]">
                Start and End Date above are the first pass.
                Each pass in the schedule is saved as its own
                record.
              </p>
            </>
          )}
        </Section>
      ) : (
        pass?.seriesId &&
        pass.recurrence && (
          <Section title="Recurrence">
            <div>
              <FieldLabel>REPEATS</FieldLabel>
              <ReadText
                value={describeRecurrence(pass.recurrence)}
              />
            </div>
            <div>
              <FieldLabel>OCCURRENCE</FieldLabel>
              <ReadText
                value={`${seriesPosition} of ${series.length}${
                  series.length
                    ? ` (${isoToMdy(series[0].startDate)} – ${isoToMdy(
                        series[series.length - 1].startDate,
                      )})`
                    : ""
                }`}
              />
            </div>
          </Section>
        )
      )}

      {/* 3. Who and Where */}
      <Section title="Who and Where">
        <div>
          <FieldLabel
            htmlFor="pass-staying-with"
            required={!readOnly}
          >
            WHO WILL THE YOUTH BE STAYING WITH?
          </FieldLabel>
          {readOnly ? (
            <ReadText value={whoLabel} />
          ) : (
            <SearchableSelect
              id="pass-staying-with"
              value={values.stayingWith}
              onValueChange={changeStayingWith}
              options={stayingWithOptions}
              placeholder={
                values.youthId
                  ? "Please Select"
                  : "Select a youth first"
              }
              disabled={!values.youthId}
              emptyMessage="No eligible relationships."
              aria-invalid={!!errors.stayingWith}
            />
          )}
          <FieldError message={errors.stayingWith} />
        </div>

        {values.stayingWith === PASS_OTHER && (
          <div>
            <FieldLabel
              htmlFor="pass-other-name"
              required={!readOnly}
            >
              NAME
            </FieldLabel>
            {readOnly ? (
              <ReadText value={values.otherName} />
            ) : (
              <Input
                id="pass-other-name"
                size="md"
                surface="base"
                value={values.otherName}
                onChange={(e) =>
                  patch({ otherName: e.target.value })
                }
                placeholder="Enter name"
                aria-invalid={!!errors.otherName}
              />
            )}
            <FieldError message={errors.otherName} />
          </div>
        )}

        <div>
          <FieldLabel htmlFor="pass-phone" required={!readOnly}>
            PHONE
          </FieldLabel>
          {readOnly ? (
            <ReadText value={values.phone} />
          ) : (
            <Input
              id="pass-phone"
              size="md"
              surface="base"
              inputMode="tel"
              value={values.phone}
              onChange={(e) =>
                patch({ phone: formatPhone(e.target.value) })
              }
              placeholder="(xxx) xxx-xxxx"
              aria-invalid={!!errors.phone}
            />
          )}
          <FieldError message={errors.phone} />
        </div>

        <div className="sm:col-span-2">
          <FieldLabel
            htmlFor="pass-staying-at"
            required={!readOnly}
          >
            WHERE WILL THE YOUTH BE STAYING?
          </FieldLabel>
          {readOnly ? (
            <ReadText value={whereLabel} />
          ) : (
            <SearchableSelect
              id="pass-staying-at"
              value={values.stayingAt}
              onValueChange={changeStayingAt}
              options={addressOptions}
              placeholder={
                values.youthId
                  ? "Please Select"
                  : "Select a youth first"
              }
              disabled={!values.youthId}
              emptyMessage="No addresses on file."
              aria-invalid={!!errors.stayingAt}
            />
          )}
          <FieldError message={errors.stayingAt} />
        </div>

        {values.stayingAt === PASS_OTHER && (
          <div className="sm:col-span-2">
            <FieldLabel
              htmlFor="pass-other-address"
              required={!readOnly}
            >
              ADDRESS
            </FieldLabel>
            {readOnly ? (
              <ReadText value={values.otherAddress} />
            ) : (
              <Input
                id="pass-other-address"
                size="md"
                surface="base"
                value={values.otherAddress}
                onChange={(e) =>
                  patch({ otherAddress: e.target.value })
                }
                placeholder="Street, City, State ZIP"
                aria-invalid={!!errors.otherAddress}
              />
            )}
            <FieldError message={errors.otherAddress} />
          </div>
        )}
      </Section>

      {/* 4. Transportation */}
      <Section title="Transportation">
        <div>
          <FieldLabel
            htmlFor="pass-departure-method"
            required={!readOnly}
          >
            DEPARTURE METHOD
          </FieldLabel>
          {readOnly ? (
            <ReadText value={values.departureMethod} />
          ) : (
            picklist(
              "departureMethod",
              "pass-departure-method",
              DEPARTURE_METHOD_OPTIONS,
            )
          )}
          <FieldError message={errors.departureMethod} />
        </div>

        <div>
          <FieldLabel
            htmlFor="pass-return-method"
            required={!readOnly}
          >
            RETURN METHOD
          </FieldLabel>
          {readOnly ? (
            <ReadText value={values.returnMethod} />
          ) : (
            picklist(
              "returnMethod",
              "pass-return-method",
              RETURN_METHOD_OPTIONS,
            )
          )}
          <FieldError message={errors.returnMethod} />
        </div>

        <div className="sm:col-span-2">
          <FieldLabel htmlFor="pass-transport-details">
            TRANSPORTATION DETAILS
          </FieldLabel>
          {readOnly ? (
            <ReadText value={values.transportationDetails} />
          ) : (
            <Textarea
              surface="base"
              id="pass-transport-details"
              value={values.transportationDetails}
              onChange={(e) =>
                patch({ transportationDetails: e.target.value })
              }
              placeholder="Enter transportation details"
            />
          )}
        </div>
      </Section>

      {/* Pack Med (optional) */}
      <Section title="Pack Med">
        <div>
          <FieldLabel htmlFor="pass-pack-med">
            PACK MED
          </FieldLabel>
          {readOnly ? (
            linkedPackMed ? (
              <Button
                type="button"
                variant="link-info"
                size="sm"
                className="px-0"
                onClick={() =>
                  navigate(`/pack-med/${linkedPackMed.id}`)
                }
              >
                {packMedLabel(linkedPackMed)}
              </Button>
            ) : (
              <ReadText value="None" />
            )
          ) : (
            <>
              <SearchableSelect
                id="pass-pack-med"
                value={values.packMedId || "none"}
                onValueChange={choosePackMed}
                options={packMedOptions}
                disabled={!values.youthId}
                placeholder={
                  values.youthId
                    ? "None"
                    : "Select a youth first"
                }
                searchPlaceholder="Search pack meds…"
                emptyMessage="No Pack Meds for this youth."
                aria-invalid={!!errors.packMedId}
              />
              <FieldError
                message={errors.packMedId || packMedNotice}
              />
            </>
          )}
        </div>
        {!readOnly && (
          <div className="flex items-end gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              disabled={!linkedPackMed}
              onClick={() =>
                linkedPackMed &&
                setPackMedLaunch({
                  mode: "edit",
                  packMedId: linkedPackMed.id,
                })
              }
            >
              <Package /> Open Pack Med
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!values.youthId}
              onClick={newPackMedFromPass}
            >
              <Plus /> Pack Meds
            </Button>
          </div>
        )}
      </Section>
      <AssociationTakeoverDialog
        open={takeoverPackMedId !== null}
        message="This Pack Med is currently linked to another Pass. Linking it to this Pass will remove the existing association. Continue?"
        onCancel={() => setTakeoverPackMedId(null)}
        onContinue={() => {
          patch({ packMedId: takeoverPackMedId ?? "" });
          setTakeoverPackMedId(null);
        }}
      />
      {!readOnly && packMedLaunch && values.youthId && (
        <PackMedsView
          key={JSON.stringify(packMedLaunch)}
          dialogOnly
          youthId={values.youthId}
          youthDisplayName={youthLabel}
          contextLabel={`For ${youthLabel} · ${pass && mode !== "create" ? pass.recordName : "New Pass (not yet saved)"}`}
          launch={packMedLaunch}
          onSaved={handlePackMedSaved}
          onClose={() => setPackMedLaunch(null)}
        />
      )}

      {/* 5. Notes */}
      <Section title="Notes">
        <div className="sm:col-span-2">
          <FieldLabel htmlFor="pass-noteworthy">
            NOTEWORTHY DETAILS
          </FieldLabel>
          {readOnly ? (
            <ReadText value={values.noteworthyDetails} />
          ) : (
            <Textarea
              surface="base"
              id="pass-noteworthy"
              value={values.noteworthyDetails}
              onChange={(e) =>
                patch({ noteworthyDetails: e.target.value })
              }
              placeholder="Enter noteworthy details"
            />
          )}
        </div>
      </Section>
    </div>
  );
});