import { type RefObject, useId, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { SearchableSelect } from "../ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  NEW_USE_OPTIONS,
  SUBSTANCE_RESULT_OPTIONS,
} from "../../lib/substanceTests";
import type { ActiveYouth } from "../../data/mockYouthProgramData";
import type { BulkTestRow } from "./BulkTestDefinitionDialog";
import {
  type BulkSubstanceResult,
  type BulkYouthResults,
  type BulkYouthRow,
  type NewUseValue,
  type SubstanceResultValue,
  enteredResultCount,
  getResult,
  substancesForTest,
  validateResult,
} from "./bulkYouthResults";

// Youth(s) dialogs of the Bulk Substance Test form (20066 AC6–AC9): Add
// Youth, Modify Youth and Modify All. Each works on its own draft and hands
// the result back only on Save — Cancel changes nothing. Local form state
// only; nothing here touches the Substance Test store.

// Radix SelectItem values cannot be "", so blank and "leave unchanged" have
// their own tokens.
const NOT_ENTERED = "none";
const KEEP = "__keep";

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="slds-form-label block mb-1.5 text-[var(--slds-g-color-text-weak)]"
    >
      {children}
    </label>
  );
}

function FieldError({
  id,
  message,
}: {
  id?: string;
  message?: string;
}) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="slds-text-3 mt-1 text-[#c23934]"
    >
      {message}
    </p>
  );
}

// Shared Dialog frame: linked description (id on the inner span so
// DialogDescription keeps Radix's own id) and focus returned to the opening
// button (these dialogs open from state, not a Dialog.Trigger).
function YouthDialogFrame({
  title,
  description,
  size,
  returnFocusRef,
  onClose,
  footer,
  children,
}: {
  title: string;
  description: string;
  size: "md" | "lg" | "xl";
  returnFocusRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const descriptionId = useId();
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        size={size}
        aria-describedby={descriptionId}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          returnFocusRef?.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            <span id={descriptionId}>{description}</span>
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-5">
          {children}
        </DialogBody>
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewUseSelect({
  id,
  value,
  onChange,
  disabled,
  allowKeep,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  allowKeep?: boolean;
}) {
  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger id={id} surface="base">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {allowKeep && (
          <SelectItem value={KEEP}>Leave unchanged</SelectItem>
        )}
        {NEW_USE_OPTIONS.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ── Results grid — one table per Test(s) row, one line per substance ──────

type GridValue = {
  result: string;
  level: string;
  units: string;
};
const gridKey = (testId: number, substance: string) =>
  `${testId}::${substance}`;

function ResultsGrid({
  tests,
  value,
  onChange,
  errors,
  allowKeep,
}: {
  tests: BulkTestRow[];
  value: (testId: number, substance: string) => GridValue;
  onChange: (
    testId: number,
    substance: string,
    patch: Partial<GridValue>,
  ) => void;
  errors: Record<string, string>;
  allowKeep?: boolean;
}) {
  if (tests.length === 0)
    return (
      <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
        Add a test in Test(s) to enter results.
      </p>
    );
  return (
    <>
      {tests.map((t) => {
        const subs = substancesForTest(t);
        const label = t.testPanel
          ? `${t.testType} — ${t.testPanel}`
          : t.testType;
        return (
          <section key={t.id} className="space-y-2">
            <h4 className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)]">
              {label}
            </h4>
            {subs.length === 0 ? (
              <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
                {t.testType} has no predefined substances. Its
                results are entered for each youth on their
                individual Substance Test after saving.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table aria-label={`${label} results`}>
                  <TableHeader>
                    <TableRow hoverable={false}>
                      <TableHead variant="slds">
                        Substance
                      </TableHead>
                      <TableHead variant="slds">
                        Result
                      </TableHead>
                      <TableHead variant="slds">
                        Level
                      </TableHead>
                      <TableHead variant="slds">
                        Units
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subs.map((s) => {
                      const v = value(t.id, s);
                      const error = errors[gridKey(t.id, s)];
                      const detailsDisabled = v.result === KEEP;
                      return (
                        <TableRow key={s} hoverable={false}>
                          <TableCell>
                            {s}
                            <FieldError message={error} />
                          </TableCell>
                          <TableCell className="min-w-40">
                            <Select
                              value={v.result}
                              onValueChange={(r) =>
                                onChange(t.id, s, { result: r })
                              }
                            >
                              <SelectTrigger
                                surface="base"
                                size="sm"
                                aria-label={`${s} result`}
                                aria-invalid={!!error}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {allowKeep && (
                                  <SelectItem value={KEEP}>
                                    Leave unchanged
                                  </SelectItem>
                                )}
                                <SelectItem value={NOT_ENTERED}>
                                  Not entered
                                </SelectItem>
                                {SUBSTANCE_RESULT_OPTIONS.map(
                                  (o) => (
                                    <SelectItem
                                      key={o}
                                      value={o}
                                    >
                                      {o}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="min-w-28">
                            <Input
                              size="sm"
                              surface="base"
                              value={v.level}
                              disabled={detailsDisabled}
                              onChange={(e) =>
                                onChange(t.id, s, {
                                  level: e.target.value,
                                })
                              }
                              aria-label={`${s} level`}
                            />
                          </TableCell>
                          <TableCell className="min-w-28">
                            <Input
                              size="sm"
                              surface="base"
                              value={v.units}
                              disabled={detailsDisabled}
                              onChange={(e) =>
                                onChange(t.id, s, {
                                  units: e.target.value,
                                })
                              }
                              aria-label={`${s} units`}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}

const toGrid = (r: BulkSubstanceResult): GridValue => ({
  result: r.result || NOT_ENTERED,
  level: r.level,
  units: r.units,
});
const fromGrid = (g: GridValue): BulkSubstanceResult => ({
  result: (g.result === NOT_ENTERED
    ? ""
    : g.result) as SubstanceResultValue,
  level: g.level,
  units: g.units,
});

/** Grid errors for every entered (or, for Modify All, changed) value. */
function gridErrors(
  tests: BulkTestRow[],
  value: (testId: number, substance: string) => GridValue,
  skip: (g: GridValue) => boolean,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const t of tests)
    for (const s of substancesForTest(t)) {
      const g = value(t.id, s);
      if (skip(g)) continue;
      const e = validateResult(fromGrid(g));
      if (e) errors[gridKey(t.id, s)] = e;
    }
  return errors;
}

// ── Add Youth ─────────────────────────────────────────────────────────────

export function BulkYouthAddDialog({
  candidates,
  onAdd,
  onClose,
  returnFocusRef,
}: {
  /** Eligible youth not already in the form. */
  candidates: ActiveYouth[];
  onAdd: (youth: ActiveYouth) => void;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const fieldId = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const chosen = candidates.find(
    (c) => String(c.constituentId) === value,
  );
  return (
    <YouthDialogFrame
      title="Add Youth"
      description="Add an active youth of this Program to the Bulk Substance Test."
      size="md"
      returnFocusRef={returnFocusRef}
      onClose={onClose}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={candidates.length === 0}
            onClick={() => {
              if (!chosen) return setError("Select a youth.");
              onAdd(chosen);
            }}
          >
            Add
          </Button>
        </>
      }
    >
      {candidates.length === 0 ? (
        <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
          Every active youth in this Program is already
          included.
        </p>
      ) : (
        <div>
          <FieldLabel htmlFor={fieldId}>Youth</FieldLabel>
          <SearchableSelect
            id={fieldId}
            value={value}
            onValueChange={(v) => {
              setValue(v);
              setError("");
            }}
            options={candidates.map((c) => ({
              value: String(c.constituentId),
              label: c.name,
            }))}
            placeholder="Select youth"
            searchPlaceholder="Search youth…"
            emptyMessage="No matching youth."
            aria-invalid={!!error}
          />
          <FieldError message={error} />
        </div>
      )}
    </YouthDialogFrame>
  );
}

// ── Modify Youth ──────────────────────────────────────────────────────────

export function BulkYouthModifyDialog({
  youth,
  tests,
  newUseApplies,
  onSave,
  onClose,
  returnFocusRef,
}: {
  youth: BulkYouthRow;
  tests: BulkTestRow[];
  newUseApplies: boolean;
  onSave: (
    next: Pick<BulkYouthRow, "newUse" | "results">,
  ) => void;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const ids = { newUse: useId(), newUseError: useId() };
  const [results, setResults] = useState<BulkYouthResults>(() =>
    structuredClone(youth.results),
  );
  const [newUse, setNewUse] = useState<NewUseValue>(
    youth.newUse,
  );
  const [errors, setErrors] = useState<Record<string, string>>(
    {},
  );
  const [newUseError, setNewUseError] = useState("");
  const value = (testId: number, s: string) =>
    toGrid(getResult(results, testId, s));
  // Individual rule: New Use is editable once results exist.
  const hasResults = enteredResultCount(results, tests) > 0;

  function handleSave() {
    const errs = gridErrors(
      tests,
      value,
      (g) => g.result === NOT_ENTERED && !g.level && !g.units,
    );
    // Individual rule: results entered → New Use cannot stay Pending.
    const nuErr =
      newUseApplies && hasResults && newUse === "Pending"
        ? "Please update 'Results Indicate New Use' before saving."
        : "";
    setErrors(errs);
    setNewUseError(nuErr);
    if (Object.keys(errs).length || nuErr) return;
    onSave({ newUse, results });
  }

  return (
    <YouthDialogFrame
      title="Modify Youth"
      description={`New Use and Results for ${youth.name} only.`}
      size="xl"
      returnFocusRef={returnFocusRef}
      onClose={onClose}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Read-only: plain text, never boxed like an input. */}
        <dl>
          <dt className="slds-form-label mb-1.5 text-[var(--slds-g-color-text-weak)]">
            Constituent Name
          </dt>
          <dd className="slds-text-4 text-[var(--slds-g-color-text-default)]">
            {youth.name}
          </dd>
        </dl>
        {newUseApplies && (
          <div>
            <FieldLabel htmlFor={ids.newUse}>
              Results Indicate New Use
            </FieldLabel>
            <NewUseSelect
              id={ids.newUse}
              value={newUse}
              onChange={(v) => {
                setNewUse(v as NewUseValue);
                setNewUseError("");
              }}
              disabled={!hasResults}
            />
            {!hasResults && (
              <p className="slds-text-3 mt-1 text-[var(--slds-g-color-text-weak)]">
                Available once a result is entered.
              </p>
            )}
            <FieldError
              id={ids.newUseError}
              message={newUseError}
            />
          </div>
        )}
      </div>
      <ResultsGrid
        tests={tests}
        value={value}
        errors={errors}
        onChange={(testId, s, patch) =>
          setResults((prev) => {
            const next = fromGrid({
              ...toGrid(getResult(prev, testId, s)),
              ...patch,
            });
            const forTest = { ...(prev[testId] ?? {}) };
            if (!next.result && !next.level && !next.units)
              delete forTest[s];
            else forTest[s] = next;
            return { ...prev, [testId]: forTest };
          })
        }
      />
    </YouthDialogFrame>
  );
}

// ── Modify All ────────────────────────────────────────────────────────────

export function BulkYouthModifyAllDialog({
  youths,
  tests,
  newUseApplies,
  onSave,
  onClose,
  returnFocusRef,
}: {
  youths: BulkYouthRow[];
  tests: BulkTestRow[];
  newUseApplies: boolean;
  onSave: (next: BulkYouthRow[]) => void;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const ids = { newUse: useId(), newUseError: useId() };
  // Every field starts "Leave unchanged": only what the user changes is
  // applied.
  const [draft, setDraft] = useState<Record<string, GridValue>>(
    {},
  );
  const [newUse, setNewUse] = useState<string>(KEEP);
  const [errors, setErrors] = useState<Record<string, string>>(
    {},
  );
  const [newUseError, setNewUseError] = useState("");
  const value = (testId: number, s: string): GridValue =>
    draft[gridKey(testId, s)] ?? {
      result: KEEP,
      level: "",
      units: "",
    };

  function handleSave() {
    const errs = gridErrors(
      tests,
      value,
      (g) => g.result === KEEP,
    );
    setErrors(errs);
    if (Object.keys(errs).length) return;

    // Results first …
    let next = youths.map((y) => {
      const results: BulkYouthResults = structuredClone(
        y.results,
      );
      for (const t of tests)
        for (const s of substancesForTest(t)) {
          const g = value(t.id, s);
          if (g.result === KEEP) continue;
          const r = fromGrid(g);
          results[t.id] = { ...(results[t.id] ?? {}) };
          if (!r.result && !r.level && !r.units)
            delete results[t.id][s];
          else results[t.id][s] = r;
        }
      return { ...y, results };
    });
    // … then New Use, only where the individual rule allows it: a youth
    // with entered results.
    if (newUse !== KEEP) {
      const eligible = next.filter(
        (y) => enteredResultCount(y.results, tests) > 0,
      );
      if (eligible.length === 0) {
        setNewUseError(
          "New Use can be set only for youth with entered results.",
        );
        return;
      }
      next = next.map((y) =>
        enteredResultCount(y.results, tests) > 0
          ? { ...y, newUse: newUse as NewUseValue }
          : y,
      );
    }
    onSave(next);
  }

  return (
    <YouthDialogFrame
      title="Modify All Youth"
      description={`Changes apply to all ${youths.length} included youth. Fields left as "Leave unchanged" are not changed.`}
      size="xl"
      returnFocusRef={returnFocusRef}
      onClose={onClose}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Apply to All {youths.length}
          </Button>
        </>
      }
    >
      {newUseApplies && (
        <div className="sm:max-w-xs">
          <FieldLabel htmlFor={ids.newUse}>
            Results Indicate New Use
          </FieldLabel>
          <NewUseSelect
            id={ids.newUse}
            value={newUse}
            allowKeep
            onChange={(v) => {
              setNewUse(v);
              setNewUseError("");
            }}
          />
          <p className="slds-text-3 mt-1 text-[var(--slds-g-color-text-weak)]">
            Applied only to youth with entered results.
          </p>
          <FieldError
            id={ids.newUseError}
            message={newUseError}
          />
        </div>
      )}
      <ResultsGrid
        tests={tests}
        value={value}
        errors={errors}
        allowKeep
        onChange={(testId, s, patch) =>
          setDraft((prev) => {
            const merged = { ...value(testId, s), ...patch };
            // Back to "Leave unchanged" clears any typed level / units.
            if (merged.result === KEEP) {
              const { [gridKey(testId, s)]: _drop, ...rest } =
                prev;
              return rest;
            }
            return { ...prev, [gridKey(testId, s)]: merged };
          })
        }
      />
    </YouthDialogFrame>
  );
}