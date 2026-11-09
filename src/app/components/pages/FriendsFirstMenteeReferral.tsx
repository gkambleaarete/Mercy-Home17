import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  AlertCircle,
  ClipboardList,
  Heart,
  Info,
  Plus,
  RefreshCw,
  Trash2,
} from "@/app/lib/lucide-icons";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { DateInput } from "../ui/date-input";
import { EmptyState } from "../ui/empty-state";
import { FieldError, FieldLabel } from "../ui/field";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../ui/toggle-group";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { toast } from "sonner";
import { GroupSection } from "../ff-mentee/IntakeQuestionnaire";
import {
  getSavedFFReferral,
  isFFStoreUnreadable,
  promoteFFReferral,
  referralHasCandidateIdentity,
  saveFFReferralDraft,
  submitFFReferral,
  useFFReferralWork,
  type FFReferralFailure,
} from "../../data/ffMenteeStore";
import {
  GLOBAL_FIELDS,
  calcAge,
  isRefRequired,
  refCellId,
  refFieldId,
  refGridAddId,
  referralDisplayName,
  referralValues,
  validateReferral,
  visibleRefGroups,
  visibleRefItems,
  type RefCtx,
  type RefError,
  type RefField,
  type RefGrid,
  type RefGroup,
  type RefTab,
} from "../../data/ffReferralDefinitions";
import {
  FF_REFERRAL_PERSONAS,
  canEditStaffObservations,
  setReferralPersona,
  useReferralActor,
  type FFReferralPersona,
} from "../../data/ffReferralPermissions";
import { newRowId } from "../../data/ffMenteeIntake";
import {
  REFERRER_ROLES,
  SUB_PROGRAMMES,
  type FFGridRow,
  type FFReferralRecord,
  type FFSubProgramme,
} from "../../data/mockFriendsFirstData";

const HELP = "slds-text-3 text-[var(--slds-g-color-text-weak)]";

interface Draft {
  id: string | null;
  program: FFSubProgramme | "";
  values: Record<string, string>;
  grids: Record<string, FFGridRow[]>;
}

const EMPTY_DRAFT: Draft = {
  id: null,
  program: "",
  values: {},
  grids: {},
};

const draftOf = (r: FFReferralRecord): Draft => ({
  id: r.id,
  program: r.recommendedProgram,
  values: referralValues(r),
  grids: r.grids ?? {},
});

const FAILURE_TEXT: Record<FFReferralFailure, string> = {
  storage:
    "Browser storage could not be written. Your entries are still on this page — try again.",
  unreadable:
    "Saved Friends First data could not be read, so saving is disabled to avoid overwriting it. Contact support.",
  invalid: "Complete the highlighted fields.",
  locked: "This referral has already been submitted.",
  "not-found": "This referral could not be found.",
  identity:
    "Candidate name and birthdate are required before a mentee can be created. They are captured on Community-Based referrals only.",
};

/** Long question prompts span both columns. */
const isQuestion = (label: string) =>
  label.length > 40 || label.trim().endsWith("?");

// ─── Page ────────────────────────────────────────────────────────────────────

export function FriendsFirstMenteeReferral() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const actor = useReferralActor();
  const canStaff = canEditStaffObservations(actor);
  const work = useFFReferralWork();

  const openId = params.get("referral");
  const saved = openId ? getSavedFFReferral(openId) : undefined;

  const [draft, setDraft] = useState<Draft>(() =>
    saved ? draftOf(saved) : EMPTY_DRAFT,
  );
  /** JSON of the last saved/loaded draft — drives the unsaved guard. */
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify(saved ? draftOf(saved) : EMPTY_DRAFT),
  );
  const [tab, setTab] = useState<RefTab>("general");
  const [errors, setErrors] = useState<RefError[]>([]);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<null | (() => void)>(
    null,
  );
  /** Set once the user confirms discarding, so reload is not re-prompted. */
  const discarding = useRef(false);
  /** Element that opened the discard dialog; focus returns to it. */
  const opener = useRef<HTMLElement | null>(null);

  const record = draft.id
    ? getSavedFFReferral(draft.id)
    : undefined;
  const status = record?.status ?? "draft";
  const locked = status !== "draft";
  const dirty = !locked && JSON.stringify(draft) !== baseline;

  const errorMap = useMemo(
    () =>
      Object.fromEntries(errors.map((e) => [e.id, e.message])),
    [errors],
  );
  const ctx: RefCtx = {
    program: draft.program,
    values: draft.values,
    canStaff,
  };

  // Unsaved-changes guard on browser close/reload.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (discarding.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () =>
      window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Focus the first error after its tab panel has mounted.
  useEffect(() => {
    if (!focusId) return;
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(focusId);
      if (el) {
        el.scrollIntoView({ block: "center" });
        el.focus({ preventScroll: true });
      }
      setFocusId(null);
    });
    return () => cancelAnimationFrame(raf);
  }, [focusId, tab]);

  const guard = (action: () => void) => {
    if (!dirty) return action();
    opener.current =
      document.activeElement as HTMLElement | null;
    setConfirm(() => action);
  };

  const load = (r: FFReferralRecord | undefined) => {
    const next = r ? draftOf(r) : EMPTY_DRAFT;
    discarding.current = false;
    setDraft(next);
    setBaseline(JSON.stringify(next));
    setErrors([]);
    setTab("general");
    setParams(r ? { referral: r.id } : {}, { replace: true });
  };

  const setValue = (key: string, v: string) => {
    setDraft((d) => ({
      ...d,
      values: { ...d.values, [key]: v },
    }));
    if (errorMap[refFieldId(key)])
      setErrors((es) =>
        es.filter((e) => e.id !== refFieldId(key)),
      );
  };
  const setRows = (key: string, rows: FFGridRow[]) =>
    setDraft((d) => ({
      ...d,
      grids: { ...d.grids, [key]: rows },
    }));

  const afterSave = (r: FFReferralRecord) => {
    const next = draftOf(r);
    setDraft(next);
    setBaseline(JSON.stringify(next));
    setParams({ referral: r.id }, { replace: true });
  };

  const handleSaveDraft = () => {
    if (busy) return;
    setBusy(true);
    const res = saveFFReferralDraft(draft, actor);
    setBusy(false);
    if (!res.ok) {
      toast.error("Draft not saved", {
        description: FAILURE_TEXT[res.reason],
      });
      return;
    }
    afterSave(res.referral);
    toast.success("Draft saved", {
      description: `Referral ${res.referral.id}`,
    });
  };

  const showErrors = (es: RefError[]) => {
    setErrors(es);
    const first = es[0];
    if (first.tab) setTab(first.tab);
    // The summary is announced (role=alert); focus moves to the field.
    setFocusId(first.id);
  };

  const handleSubmit = () => {
    if (busy || locked) return;
    const es = validateReferral(draft, canStaff);
    if (es.length) return showErrors(es);
    setBusy(true);
    const res = submitFFReferral(draft, actor);
    setBusy(false);
    if (!res.ok) {
      if (res.errors?.length) return showErrors(res.errors);
      toast.error("Referral not submitted", {
        description: FAILURE_TEXT[res.reason],
      });
      return;
    }
    setErrors([]);
    afterSave(res.referral);
    toast.success("Referral submitted");
  };

  const handlePromote = () => {
    if (!record || busy) return;
    setBusy(true);
    const res = promoteFFReferral(record.id);
    setBusy(false);
    if (!res.ok) {
      toast.error("Not promoted", {
        description: FAILURE_TEXT[res.reason],
      });
      return;
    }
    if (!res.existing)
      toast.success("Promoted to pipeline", {
        description: `${res.mentee.name} is now in the Mentee pipeline.`,
      });
    navigate(`/friends-first-mentee/${res.mentee.id}`);
  };

  // ── Field rendering ──

  const describe = (id: string) =>
    errorMap[id] ? `${id}-error` : undefined;

  const renderField = (field: RefField, context: string) => {
    const id = refFieldId(field.key);
    const v = draft.values[field.key] ?? "";
    const required = isRefRequired(field, ctx);
    const err = errorMap[id];
    const invalid = !!err || undefined;
    const wide =
      field.type === "long" || isQuestion(field.label);

    if (field.type === "age") {
      const age = calcAge(draft.values.candidateDob ?? "");
      return (
        <div key={field.key}>
          <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
          <Input
            id={id}
            size="md"
            readOnly
            value={age === null ? "" : `${age}`}
            placeholder="Calculated from birthdate"
          />
        </div>
      );
    }

    let control: React.ReactNode;
    switch (field.type) {
      case "long":
        control = (
          <Textarea
            id={id}
            size="md"
            rows={3}
            disabled={locked}
            aria-invalid={invalid}
            aria-describedby={describe(id)}
            value={v}
            onChange={(e) =>
              setValue(field.key, e.target.value)
            }
          />
        );
        break;
      case "date":
        control = (
          <DateInput
            id={id}
            aria-invalid={invalid}
            aria-describedby={describe(id)}
            disabled={locked}
            value={v}
            onChange={(val) => setValue(field.key, val)}
          />
        );
        break;
      case "yesno":
      case "role":
        control = (
          <Select
            disabled={locked}
            value={v || undefined}
            onValueChange={(val) => setValue(field.key, val)}
          >
            <SelectTrigger
              id={id}
              aria-invalid={invalid}
              aria-describedby={describe(id)}
            >
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {(field.type === "role"
                ? REFERRER_ROLES
                : ["Yes", "No"]
              ).map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        break;
      default:
        control = (
          <Input
            id={id}
            size="md"
            disabled={locked}
            aria-invalid={invalid}
            aria-describedby={describe(id)}
            type={
              field.type === "email"
                ? "email"
                : field.type === "phone" ||
                    field.type === "extension"
                  ? "tel"
                  : "text"
            }
            inputMode={
              field.type === "extension"
                ? "numeric"
                : field.type === "phone"
                  ? "tel"
                  : undefined
            }
            autoComplete="off"
            value={v}
            onChange={(e) =>
              setValue(field.key, e.target.value)
            }
          />
        );
    }
    return (
      <div
        key={field.key}
        className={wide ? "sm:col-span-2" : undefined}
      >
        <FieldLabel
          htmlFor={id}
          required={required}
          error={!!err}
        >
          {field.label}
          <span className="sr-only"> — {context}</span>
        </FieldLabel>
        {control}
        <FieldError id={`${id}-error`}>{err}</FieldError>
      </div>
    );
  };

  const renderGrid = (grid: RefGrid) => {
    const rows = draft.grids[grid.key] ?? [];
    const addId = refGridAddId(grid.key);
    const update = (
      rowId: string,
      col: string,
      val: string,
    ) => {
      setRows(
        grid.key,
        rows.map((r) =>
          r.id === rowId ? { ...r, [col]: val } : r,
        ),
      );
      const cell = refCellId(grid.key, rowId, col);
      if (errorMap[cell])
        setErrors((es) => es.filter((e) => e.id !== cell));
    };
    return (
      <fieldset
        key={grid.key}
        className="sm:col-span-2 space-y-3"
      >
        <legend>
          <FieldLabel required error={!!errorMap[addId]}>
            {grid.label}
          </FieldLabel>
        </legend>
        {rows.length === 0 && (
          <p className={HELP}>No authorizations added.</p>
        )}
        {rows.map((row, i) => (
          <Card key={row.id} variant="section">
            <CardContent
              size="sm"
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_2fr_auto] gap-3 items-end"
            >
              {grid.columns.map((c) => {
                const cid = refCellId(grid.key, row.id, c.key);
                return (
                  <div key={c.key}>
                    <FieldLabel
                      htmlFor={cid}
                      required
                      error={!!errorMap[cid]}
                    >
                      {c.label}
                      <span className="sr-only">
                        , authorization {i + 1}
                      </span>
                    </FieldLabel>
                    <Input
                      id={cid}
                      size="md"
                      disabled={locked}
                      value={row[c.key] ?? ""}
                      aria-invalid={
                        !!errorMap[cid] || undefined
                      }
                      aria-describedby={describe(cid)}
                      onChange={(e) =>
                        update(row.id, c.key, e.target.value)
                      }
                    />
                    <FieldError id={`${cid}-error`}>
                      {errorMap[cid]}
                    </FieldError>
                  </div>
                );
              })}
              {!locked && (
                <Button
                  type="button"
                  variant="ghost-destructive"
                  size="icon"
                  aria-label={`Remove authorization ${i + 1}`}
                  onClick={() =>
                    setRows(
                      grid.key,
                      rows.filter((r) => r.id !== row.id),
                    )
                  }
                >
                  <Trash2 />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {!locked && (
          <Button
            id={addId}
            type="button"
            variant="outline"
            aria-invalid={!!errorMap[addId] || undefined}
            aria-describedby={describe(addId)}
            onClick={() =>
              setRows(grid.key, [
                ...rows,
                {
                  id: newRowId(),
                  dateSent: "",
                  dateReceived: "",
                  consentWith: "",
                },
              ])
            }
          >
            <Plus />
            {grid.addLabel}
          </Button>
        )}
        <FieldError id={`${addId}-error`}>
          {errorMap[addId]}
        </FieldError>
      </fieldset>
    );
  };

  const renderGroup = (g: RefGroup, first: boolean) => (
    <GroupSection key={g.id} title={g.title} first={first}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleRefItems(g, ctx).map((item) =>
          item.kind === "grid"
            ? renderGrid(item)
            : renderField(item, g.title),
        )}
        {g.staffOnly && (
          <div>
            <FieldLabel htmlFor="rf-so-program">
              Recommended Program Type
            </FieldLabel>
            <Input
              id="rf-so-program"
              size="md"
              readOnly
              value={draft.program}
            />
          </div>
        )}
      </div>
    </GroupSection>
  );

  const programId = refFieldId(GLOBAL_FIELDS.program);
  const programErr = errorMap[programId];
  const history = record?.detailsHistory ?? [];
  const canPromote = record
    ? referralHasCandidateIdentity(record)
    : false;
  const tabErrors = (t: RefTab) =>
    errors.filter((e) => e.tab === t).length;
  const tabLabel = (t: RefTab, name: string) =>
    tabErrors(t) ? `${name} (${tabErrors(t)})` : name;
  const noProgram = (what: string) => (
    <div className="p-6">
      <EmptyState
        icon={ClipboardList}
        title="Select a program"
        description={`Choose a Recommended Program Type above to see ${what}.`}
      />
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[var(--slds-g-color-background-alt-2)]">
      {/* ── Page Header ── */}
      <div className="sticky top-0 z-10 px-4 sm:px-6 py-4 bg-[var(--slds-g-color-background-alt-2)] border-b border-[var(--slds-g-color-border-base-1)] shadow-[var(--slds-g-shadow-1)]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center text-white rounded-[var(--slds-c-card-radius-border)] bg-[var(--color-brand-primary)] shadow-[var(--slds-g-shadow-1)]">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-[var(--slds-g-color-text-weak)]">
                Dashboard
              </div>
              <h1 className="text-2xl font-medium tracking-tight text-[var(--slds-g-color-text-default)]">
                Mentee Referral
              </h1>
            </div>
          </div>
          <Button
            id="rf-refresh"
            variant="outline"
            size="icon"
            onClick={() =>
              guard(() => window.location.reload())
            }
            aria-label="Refresh mentee referral"
            title="Refresh"
          >
            <RefreshCw />
          </Button>
        </div>
      </div>

      {/* ── Main content ── */}
      {/* Extra bottom padding clears the fixed 40px UtilityBar. */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pb-16 pt-4">
        <div className="max-w-4xl mx-auto w-full space-y-4">
          {/* Resume / new */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-0 flex-1 basis-64">
              <FieldLabel htmlFor="rf-open">
                Saved referrals
              </FieldLabel>
              <Select
                value={draft.id ?? ""}
                onValueChange={(id) =>
                  guard(() => load(getSavedFFReferral(id)))
                }
              >
                <SelectTrigger id="rf-open">
                  <SelectValue
                    placeholder={
                      work.length
                        ? "Open a saved referral…"
                        : "No saved referrals yet"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {work.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {referralDisplayName(r)} —{" "}
                      {r.status === "draft"
                        ? "Draft"
                        : r.status === "promoted"
                          ? "Promoted"
                          : "Submitted"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => guard(() => load(undefined))}
            >
              <Plus />
              New Referral
            </Button>
            <div className="basis-56">
              <FieldLabel
                htmlFor="rf-persona"
                note=" (prototype)"
              >
                Viewing as
              </FieldLabel>
              <Select
                value={actor.persona}
                onValueChange={(p) =>
                  setReferralPersona(p as FFReferralPersona)
                }
              >
                <SelectTrigger id="rf-persona">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FF_REFERRAL_PERSONAS).map(
                    (p) => (
                      <SelectItem
                        key={p.persona}
                        value={p.persona}
                      >
                        {p.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-[var(--slds-g-color-text-default)]">
                {draft.id
                  ? `Mentee Referral ${draft.id}`
                  : "New Mentee Referral"}
              </h2>
              <p className="text-sm mt-0.5 text-[var(--slds-g-color-text-weak)]">
                Choose a program, then complete the General and
                Referral Questions tabs.
                {record?.submittedDate
                  ? ` Submitted ${record.submittedDate}.`
                  : ""}
              </p>
            </div>
            <Badge
              variant={
                status === "promoted"
                  ? "success"
                  : status === "submitted"
                    ? "info"
                    : "warning"
              }
              size="lg"
            >
              {status === "promoted"
                ? "Promoted to Pipeline"
                : status === "submitted"
                  ? "Submitted"
                  : dirty
                    ? "Draft — unsaved changes"
                    : "Draft"}
            </Badge>
          </div>

          {isFFStoreUnreadable() && (
            <Alert variant="error">
              <AlertCircle />
              <AlertTitle>Saving is unavailable</AlertTitle>
              <AlertDescription>
                {FAILURE_TEXT.unreadable}
              </AlertDescription>
            </Alert>
          )}

          {errors.length > 0 && (
            <Alert variant="error">
              <AlertCircle />
              <AlertTitle>
                {errors.length === 1
                  ? "1 field needs attention"
                  : `${errors.length} fields need attention`}{" "}
                before this referral can be submitted.
              </AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5">
                  {errors.slice(0, 8).map((e) => (
                    <li key={e.id}>
                      <Button
                        type="button"
                        variant="link"
                        size="xs"
                        onClick={() => {
                          if (e.tab) setTab(e.tab);
                          setFocusId(e.id);
                        }}
                      >
                        {e.label}
                        {e.tab
                          ? ` (${e.tab === "general" ? "General" : "Referral Questions"})`
                          : ""}
                      </Button>
                      {" — "}
                      {e.message}
                    </li>
                  ))}
                  {errors.length > 8 && (
                    <li>and {errors.length - 8} more.</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Card variant="section" elevation="sm">
            <GroupSection title="Program Recommendation" first>
              <div className="space-y-4">
                <div>
                  <FieldLabel
                    id={`${programId}-label`}
                    required
                    error={!!programErr}
                  >
                    Recommended Program Type
                  </FieldLabel>
                  <ToggleGroup
                    type="single"
                    variant="brand"
                    size="lg"
                    disabled={locked}
                    value={draft.program}
                    onValueChange={(p) => {
                      // Single choice: re-clicking the selection keeps it.
                      if (!p) return;
                      setDraft((d) => ({
                        ...d,
                        program: p as FFSubProgramme,
                      }));
                      setErrors((es) =>
                        es.filter((e) => e.id !== programId),
                      );
                    }}
                    aria-labelledby={`${programId}-label`}
                    aria-describedby={
                      programErr
                        ? `${programId}-error`
                        : undefined
                    }
                  >
                    {SUB_PROGRAMMES.map((p, i) => (
                      <ToggleGroupItem
                        key={p}
                        value={p}
                        // Error focus target: the selected item, else the first.
                        id={
                          (
                            draft.program
                              ? draft.program === p
                              : i === 0
                          )
                            ? programId
                            : undefined
                        }
                        aria-invalid={!!programErr || undefined}
                      >
                        {p}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <FieldError id={`${programId}-error`}>
                    {programErr}
                  </FieldError>
                </div>
                {renderField(
                  {
                    kind: "field",
                    key: GLOBAL_FIELDS.staffRecommendation,
                    label: "Staff Recommendation",
                    type: "long",
                  },
                  "Program Recommendation",
                )}
              </div>
            </GroupSection>

            <div className="border-t border-[var(--slds-g-color-border-base-1)]">
              <Tabs
                value={tab}
                onValueChange={(t) => setTab(t as RefTab)}
              >
                <div className="px-6 pt-4">
                  <TabsList aria-label="Referral sections">
                    <TabsTrigger value="general">
                      {tabLabel("general", "General")}
                    </TabsTrigger>
                    <TabsTrigger value="questions">
                      {tabLabel(
                        "questions",
                        "Referral Questions",
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="general">
                  {!draft.program ? (
                    noProgram("the fields for this referral")
                  ) : draft.program !== "Community-Based" ? (
                    <div className="p-6">
                      <EmptyState
                        icon={ClipboardList}
                        title="No General fields for this program"
                        description="The General section applies to Community-Based referrals. Complete the Referral Questions tab for this program."
                      />
                    </div>
                  ) : (
                    <>
                      {visibleRefGroups(ctx, "general").map(
                        (g, i) => renderGroup(g, i === 0),
                      )}
                      <GroupSection title="Details History">
                        <div className="space-y-3">
                          {history.length === 0 ? (
                            <p className={HELP}>
                              No details history recorded.
                            </p>
                          ) : (
                            <ol
                              className="space-y-3"
                              aria-label="Details history, newest first"
                            >
                              {[...history]
                                .reverse()
                                .map((h) => (
                                  <li key={h.id}>
                                    <Card
                                      variant="section"
                                      surface="alt"
                                    >
                                      <CardContent
                                        size="xs"
                                        className="slds-text-4 space-y-1"
                                      >
                                        <p className="font-semibold">
                                          Saved {h.savedAt}
                                        </p>
                                        <ul>
                                          {h.changes.map(
                                            (c) => (
                                              <li key={c.key}>
                                                <span className="text-[var(--slds-g-color-text-weak)]">
                                                  {c.label}:
                                                </span>{" "}
                                                {c.from
                                                  ? `${c.from} → `
                                                  : ""}
                                                {c.to ||
                                                  "(cleared)"}
                                              </li>
                                            ),
                                          )}
                                        </ul>
                                      </CardContent>
                                    </Card>
                                  </li>
                                ))}
                            </ol>
                          )}
                          <p className={HELP}>
                            Changes to Contact Details and
                            Follow Up are recorded here each
                            time the referral is saved.
                          </p>
                        </div>
                      </GroupSection>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="questions">
                  {!draft.program
                    ? noProgram("the referral questions")
                    : visibleRefGroups(ctx, "questions").map(
                        (g, i) => renderGroup(g, i === 0),
                      )}
                </TabsContent>
              </Tabs>
            </div>

            {status === "submitted" && (
              <div className="px-6 pb-4">
                <Alert variant="info">
                  <Info />
                  <AlertDescription>
                    {canPromote
                      ? "Referral submitted. Promote to pipeline once ready to open an intake record."
                      : `Referral submitted. ${FAILURE_TEXT.identity}`}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <CardFooter
              separated
              className="justify-end gap-2 flex-wrap"
            >
              {!locked && (
                <>
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={handleSaveDraft}
                  >
                    Save Draft
                  </Button>
                  <Button
                    disabled={busy}
                    onClick={handleSubmit}
                  >
                    Submit Referral
                  </Button>
                </>
              )}
              {status === "submitted" && (
                <Button
                  disabled={busy || !canPromote}
                  onClick={handlePromote}
                >
                  Promote to Pipeline
                </Button>
              )}
              {status === "promoted" && (
                <Button onClick={handlePromote}>
                  Open Mentee
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      <AlertDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
      >
        <AlertDialogContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            // Opened programmatically (no Trigger): return focus to the opener.
            opener.current?.focus();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              Discard unsaved changes?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This referral has changes that have not been
              saved. Select Save Draft first to keep them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const action = confirm;
                setConfirm(null);
                discarding.current = true;
                action?.();
              }}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}