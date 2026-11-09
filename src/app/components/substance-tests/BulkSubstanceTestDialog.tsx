import { type RefObject, useId, useRef, useState } from "react";
import { Pencil, Plus, Trash2, Users } from "@/app/lib/lucide-icons";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { DateInput } from "../ui/date-input";
import { Input } from "../ui/input";
import { TimeInput } from "../ui/time-input";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
  getProgramById,
  isValidMdy,
} from "../../data/mockProgramsData";
import {
  type BulkConflictResolution,
  type BulkCreateError,
  type BulkSubstanceTestConflict,
  type BulkSubstanceTestsModification,
  type NewBulkSubstanceTests,
  createBulkSubstanceTestsAtomic,
  detectBulkSubstanceTestConflicts,
  getActiveYouthForBulkGroup,
  getBulkSubstanceTestGroupById,
  getSubstanceTestsForBulkGroup,
  revisionOf,
  updateBulkSubstanceTestsAtomic,
  validateBulkSubstanceTestsModification,
  validateNewBulkSubstanceTests,
} from "../../data/mockSubstanceTestData";
import { getYouthNames } from "../../data/mockYouthProgramData";
import {
  fromModalDateTime,
  toModalDateTime,
} from "./substanceTestDateTime";
import {
  type ConflictChoice,
  BulkConflictReview,
} from "./BulkConflictReview";
import {
  OTHER_TEST_REASON,
  TEST_REASONS,
  newUseApplies,
} from "../../lib/substanceTests";
import {
  type BulkTestRow,
  BulkTestDefinitionDialog,
} from "./BulkTestDefinitionDialog";
import {
  type BulkYouthResults,
  type BulkYouthRow,
  type NewUseValue,
  clearTestResults,
  enteredResultCount,
  getResult,
  substancesForTest,
  summarizeResults,
} from "./bulkYouthResults";
import {
  BulkYouthAddDialog,
  BulkYouthModifyAllDialog,
  BulkYouthModifyDialog,
} from "./BulkYouthDialogs";

// Add / Modify Bulk Substance Test (20066) — one form for both. General
// Information, Test(s) and Youth(s) stay in local form state until Save,
// which validates the whole form and then calls ONE atomic store operation:
//   Add    → createBulkSubstanceTestsAtomic (new group + one test per youth)
//   Modify → updateBulkSubstanceTestsAtomic (the saved group, its linked
//            tests, added / removed youth, conflict resolutions)
// Either everything is stored or nothing is. Mount per session so Cancel /
// close discards it all; Add prefills the Program's active youth afresh,
// Modify prefills the saved group as it is when opened.

/** What Modify captured when it opened. Never refreshed while the form is
 *  open — that is what lets the store reject a stale save. */
interface ModifySnapshot {
  groupId: number;
  groupRevision: number;
  testRevisions: Record<number, number>;
  /** Youth linked when opened — they stay valid even if no longer active. */
  members: Set<number>;
  conflicts: BulkSubstanceTestConflict[];
  /** Original Test(s) row → stored results this form cannot show. They are
   *  kept only while that row keeps its Type and Panel. */
  hidden: Record<
    number,
    { testType: string; testPanel: string; count: number }
  >;
  /** Youth whose stored results include values this form cannot edit
   *  (not Positive / Negative on a panel substance). */
  uneditable: Record<number, number>;
  initial: {
    sampleDate: string;
    sampleTime: string;
    reason: string;
    otherReason: string;
    tests: BulkTestRow[];
    youths: BulkYouthRow[];
  };
}

/** Loads a saved group for Modify — only if it belongs to this Program. */
function loadForModify(
  groupId: number,
  programId: number,
): ModifySnapshot | null {
  const group = getBulkSubstanceTestGroupById(groupId);
  if (!group || group.programId !== programId) return null;
  const records = getSubstanceTestsForBulkGroup(groupId);
  // "MM/DD/YYYY, h:mm AM" = DateInput value + ", " + TimeInput value.
  const [sampleDate = "", sampleTime = ""] = (
    toModalDateTime(group.sampleDateTime) ?? ""
  ).split(", ");
  const listed = (TEST_REASONS as readonly string[]).includes(
    group.reason,
  );
  const hidden: ModifySnapshot["hidden"] = {};
  const uneditable: Record<number, number> = {};
  const youths: BulkYouthRow[] = records.map((r) => {
    const results: BulkYouthResults = {};
    group.tests.forEach((t, i) => {
      const subs = substancesForTest(t);
      for (const x of r.testDetails[i]?.testResults ?? []) {
        if (!subs.includes(x.substance)) {
          hidden[t.id] = {
            testType: t.testType,
            testPanel: t.testPanel,
            count: (hidden[t.id]?.count ?? 0) + 1,
          };
        } else if (
          x.result === "Positive" ||
          x.result === "Negative"
        ) {
          results[t.id] = {
            ...(results[t.id] ?? {}),
            [x.substance]: {
              result: x.result,
              level: x.level,
              units: x.units,
            },
          };
        } else {
          uneditable[r.constituentId] =
            (uneditable[r.constituentId] ?? 0) + 1;
        }
      }
    });
    return {
      constituentId: r.constituentId,
      name:
        getYouthNames([r.constituentId]) ||
        `Constituent ${r.constituentId}`,
      newUse: r.newUse as NewUseValue,
      results,
    };
  });
  return {
    groupId,
    groupRevision: group.revision,
    testRevisions: Object.fromEntries(
      records.map((r) => [r.id, revisionOf(r)]),
    ),
    members: new Set(records.map((r) => r.constituentId)),
    conflicts: detectBulkSubstanceTestConflicts(groupId),
    hidden,
    uneditable,
    initial: {
      sampleDate,
      sampleTime,
      reason:
        listed || !group.reason
          ? group.reason
          : OTHER_TEST_REASON,
      otherReason: listed ? "" : group.reason,
      tests: group.tests.map((t) => ({ ...t })),
      youths,
    },
  };
}

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

function FieldError({
  id,
  message,
}: {
  id: string;
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

function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: string;
}) {
  return (
    <h3
      id={id}
      className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)]"
    >
      {children}
    </h3>
  );
}

export function BulkSubstanceTestDialog({
  programId,
  programName,
  groupId,
  onClose,
  returnFocusRef,
}: {
  /** The originating Program — scopes which youth are eligible. */
  programId: number;
  programName: string;
  /** Modify this saved group; omit to Add a new one. */
  groupId?: number;
  onClose: () => void;
  /** The button that opened the form; focus returns there on close. */
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const uid = useId();
  const isModify = groupId !== undefined;
  // Captured once, when the form opens.
  const [snapshot] = useState(() =>
    isModify ? loadForModify(groupId, programId) : null,
  );
  const initial = snapshot?.initial;
  const ids = {
    stale: `${uid}-stale`,
    conflicts: `${uid}-conflicts-heading`,
    description: `${uid}-description`,
    generalError: `${uid}-general-error`,
    commitError: `${uid}-commit-error`,
    date: `${uid}-sample-date`,
    dateError: `${uid}-sample-date-error`,
    time: `${uid}-sample-time`,
    timeError: `${uid}-sample-time-error`,
    reason: `${uid}-reason`,
    otherReason: `${uid}-other-reason`,
    otherReasonError: `${uid}-other-reason-error`,
    testsHeading: `${uid}-tests-heading`,
    testsError: `${uid}-tests-error`,
    general: `${uid}-general-heading`,
    youths: `${uid}-youths-heading`,
    youthsError: `${uid}-youths-error`,
  };

  // ── General Information ────────────────────────────────────────────────
  const [sampleDate, setSampleDate] = useState(
    initial?.sampleDate ?? "",
  );
  const [sampleTime, setSampleTime] = useState(
    initial?.sampleTime ?? "",
  );
  const [reason, setReason] = useState(initial?.reason ?? "");
  const [otherReason, setOtherReason] = useState(
    initial?.otherReason ?? "",
  );
  // A required-field error shows once the user has left that field.
  const [touched, setTouched] = useState<
    Record<string, boolean>
  >({});
  const touch = (field: string) =>
    setTouched((t) => (t[field] ? t : { ...t, [field]: true }));
  // After a Save attempt every required-field error shows. A counter, not
  // a flag: every attempt re-renders, so errors always reflect current data
  // (e.g. a youth who stopped being active while the form was open).
  const [saveAttempts, setSaveAttempts] = useState(0);
  const submitted = saveAttempts > 0;

  // A complete-but-invalid date is flagged at once; blank or partial only
  // after leaving the field.
  const dateError =
    (sampleDate.length === 10 || touched.date || submitted) &&
    !isValidMdy(sampleDate)
      ? sampleDate
        ? "Enter a valid date (MM/DD/YYYY)."
        : "Sample Date is required."
      : undefined;
  const timeError =
    (touched.time || submitted) && !sampleTime
      ? "Sample Time is required."
      : undefined;
  const otherReasonError =
    reason === OTHER_TEST_REASON &&
    (touched.otherReason || submitted) &&
    !otherReason.trim()
      ? "Specify the other reason."
      : undefined;

  // ── Test(s) — local rows with stable, never-reused ids ─────────────────
  const [tests, setTests] = useState<BulkTestRow[]>(
    initial?.tests ?? [],
  );
  // New rows never reuse a saved definition's id.
  const nextTestId = useRef(
    (initial?.tests ?? []).reduce(
      (m, t) => Math.max(m, t.id),
      0,
    ) + 1,
  );
  const [selectedTestIds, setSelectedTestIds] = useState<
    number[]
  >([]);
  const addTestRef = useRef<HTMLButtonElement>(null);
  const modifyTestRef = useRef<HTMLButtonElement>(null);
  const [testDialog, setTestDialog] = useState<
    | { mode: "add" }
    | { mode: "modify"; row: BulkTestRow }
    | null
  >(null);
  const selectedTest =
    selectedTestIds.length === 1
      ? tests.find((t) => t.id === selectedTestIds[0])
      : undefined;
  const testsError =
    tests.length === 0
      ? "At least one test is required."
      : undefined;
  // Modify: stored results this form cannot show survive only while their
  // Test(s) row keeps its Type and Panel, so changing or removing that row
  // is blocked rather than letting them be discarded.
  const hiddenEntries = Object.entries(
    snapshot?.hidden ?? {},
  ).map(([id, h]) => ({ id: Number(id), ...h }));
  const hiddenLossErrors = hiddenEntries
    .filter((h) => {
      const now = tests.find((t) => t.id === h.id);
      return (
        !now ||
        now.testType !== h.testType ||
        now.testPanel !== h.testPanel
      );
    })
    .map(
      (h) =>
        `${h.testPanel || h.testType}: ${h.count} stored result${h.count === 1 ? "" : "s"} not shown in this form would be discarded. Restore this test's original Type and Panel to keep ${h.count === 1 ? "it" : "them"}.`,
    );

  function saveTestRow(value: Omit<BulkTestRow, "id">) {
    if (testDialog?.mode === "modify") {
      const { id, testType, testPanel } = testDialog.row;
      setTests((rows) =>
        rows.map((r) => (r.id === id ? { ...value, id } : r)),
      );
      // A new Type or Panel tests different substances, so that row's
      // entered results no longer apply; other rows' results are kept.
      if (
        value.testType !== testType ||
        value.testPanel !== testPanel
      )
        setYouths((ys) => clearTestResults(ys, id));
    } else {
      const id = nextTestId.current++;
      setTests((rows) => [...rows, { ...value, id }]);
    }
    setTestDialog(null);
  }

  // ── Youth(s) — prefilled with the Program's currently active youth ────
  // (existing enrollment lookup; one row per youth, name-sorted). Row id is
  // the constituentId. Never touches Constituent or Substance Test data.
  const programValid = !!getProgramById(programId);
  const eligibleYouth = () =>
    programValid ? getActiveYouthForBulkGroup(programId) : [];
  // Modify never falls back to today's active youth: an unloadable group
  // shows no youth at all.
  const [youths, setYouths] = useState<BulkYouthRow[]>(
    () =>
      initial?.youths ??
      (isModify ? [] : eligibleYouth()).map((y) => ({
        constituentId: y.constituentId,
        name: y.name,
        newUse: "Pending",
        results: {},
      })),
  );
  const [selectedYouthIds, setSelectedYouthIds] = useState<
    number[]
  >([]);
  const [youthDialog, setYouthDialog] = useState<
    "add" | "modify" | "modifyAll" | null
  >(null);
  const youthRefs = {
    add: useRef<HTMLButtonElement>(null),
    modify: useRef<HTMLButtonElement>(null),
    modifyAll: useRef<HTMLButtonElement>(null),
  };
  const selectedYouth =
    selectedYouthIds.length === 1
      ? youths.find(
          (y) => y.constituentId === selectedYouthIds[0],
        )
      : undefined;
  const toggleYouth = (id: number) =>
    setSelectedYouthIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id],
    );
  function removeSelectedYouth() {
    setYouths((ys) =>
      ys.filter(
        (y) => !selectedYouthIds.includes(y.constituentId),
      ),
    );
    setSelectedYouthIds([]);
  }

  // The Reason the New Use rule reads: Other's free text, as the individual
  // editor stores it.
  const effectiveReason =
    reason === OTHER_TEST_REASON ? otherReason.trim() : reason;
  const newUseShown = newUseApplies(effectiveReason);

  // Youth(s) validation — at least one youth, no duplicates, every youth
  // still an active youth of this Program, and (individual rule) New Use
  // not left Pending once results are entered.
  // Modify: youth already linked stay valid even if no longer active; only
  // newly added youth must be active.
  const eligibleIds = new Set([
    ...eligibleYouth().map((y) => y.constituentId),
    ...(snapshot?.members ?? []),
  ]);
  const youthErrors = [
    !programValid
      ? "This Program could not be found, so no youth can be listed."
      : "",
    youths.length === 0
      ? "At least one youth is required."
      : "",
    new Set(youths.map((y) => y.constituentId)).size !==
    youths.length
      ? "A youth is listed more than once."
      : "",
    ...youths
      .filter((y) => !eligibleIds.has(y.constituentId))
      .map(
        (y) =>
          `${y.name} is not an active youth of this Program.`,
      ),
    newUseShown &&
    youths.some(
      (y) =>
        y.newUse === "Pending" &&
        enteredResultCount(y.results, tests) > 0,
    )
      ? `Update 'Results Indicate New Use' for: ${youths
          .filter(
            (y) =>
              y.newUse === "Pending" &&
              enteredResultCount(y.results, tests) > 0,
          )
          .map((y) => y.name)
          .join(", ")}.`
      : "",
    ...youths
      .filter((y) => snapshot?.uneditable[y.constituentId])
      .map(
        (y) =>
          `${y.name} has stored results this form cannot edit. Remove ${y.name} from this Bulk Substance Test or edit the individual test instead.`,
      ),
  ].filter(Boolean);

  // ── Modify: conflicts (individually edited since the last Bulk save) ───
  const [choices, setChoices] = useState<
    Record<number, ConflictChoice | undefined>
  >({});
  const includedConflicts = (snapshot?.conflicts ?? []).filter(
    (c) =>
      youths.some((y) => y.constituentId === c.constituentId),
  );

  // ── Save — form state → atomic store request ───────────────────────────
  // Sample Date "MM/DD/YYYY" + TimeInput "h:mm AM" is exactly the format
  // fromModalDateTime turns into ISO-local "YYYY-MM-DDTHH:mm" (string work
  // only, no timezone). Only ENTERED results are sent: blank stays blank.
  function buildRequest(): NewBulkSubstanceTests {
    return {
      programId,
      sampleDateTime:
        fromModalDateTime(`${sampleDate}, ${sampleTime}`) ?? "",
      reason: effectiveReason,
      tests: tests.map(({ id, testType, testPanel }) => ({
        id,
        testType,
        testPanel,
      })),
      youths: youths.map((y) => ({
        constituentId: y.constituentId,
        newUse: y.newUse,
        results: tests.flatMap((t) =>
          substancesForTest(t).flatMap((substance) => {
            const r = getResult(y.results, t.id, substance);
            return r.result
              ? [
                  {
                    testId: t.id,
                    substance,
                    result: r.result,
                    level: r.level,
                    units: r.units,
                  },
                ]
              : [];
          }),
        ),
      })),
    };
  }

  /** Modify: the same request plus the revisions captured on open and an
   *  explicit resolution for each conflicted youth still included. */
  function buildModifyRequest(
    snap: ModifySnapshot,
  ): BulkSubstanceTestsModification {
    const { programId: _program, ...fields } = buildRequest();
    const resolutions: Record<number, BulkConflictResolution> =
      {};
    for (const c of includedConflicts) {
      const choice = choices[c.testId];
      if (choice === "keep")
        resolutions[c.testId] = { action: "keep" };
      else if (choice === "overwrite")
        // Confirmed against the exact revision shown when Modify opened.
        resolutions[c.testId] = {
          action: "overwrite",
          confirmedRevision: c.currentRevision,
        };
    }
    return {
      ...fields,
      groupId: snap.groupId,
      expectedGroupRevision: snap.groupRevision,
      expectedTestRevisions: snap.testRevisions,
      resolutions,
    };
  }
  const validateRequest = () =>
    snapshot
      ? validateBulkSubstanceTestsModification(
          buildModifyRequest(snapshot),
        )
      : validateNewBulkSubstanceTests(buildRequest());

  // The store's own validation, re-run live after the first Save attempt so
  // corrections clear their errors.
  const storeErrors = submitted ? validateRequest() : [];
  const [commitError, setCommitError] = useState("");
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);

  const testLabel = (id?: number) => {
    const t = tests.find((x) => x.id === id);
    return t
      ? t.testPanel
        ? `${t.testType} — ${t.testPanel}`
        : t.testType
      : `Test ${id}`;
  };
  const describeError = (e: BulkCreateError) => {
    const context = [
      e.constituentId !== undefined &&
        (youths.find((y) => y.constituentId === e.constituentId)
          ?.name ??
          `Constituent ${e.constituentId}`),
      e.testId !== undefined && testLabel(e.testId),
      e.substance,
    ].filter(Boolean);
    return context.length
      ? `${context.join(" — ")}: ${e.message}`
      : e.message;
  };
  // A section shows the store's errors only where its own checks found none,
  // so nothing is reported twice.
  const storeErrorsFor = (
    fields: BulkCreateError["field"][],
  ) => [
    ...new Set(
      storeErrors
        .filter((e) => fields.includes(e.field))
        .map(describeError),
    ),
  ];

  // Stale: something changed after Modify opened. Keep-vs-group mismatches
  // and missing / invalid resolutions belong to the conflict review.
  const isKeepMismatch = (e: BulkCreateError) =>
    e.field === "consistency" &&
    e.message.includes("keeps its individual");
  const isStale = (e: BulkCreateError) =>
    e.field === "groupRevision" ||
    e.field === "groupId" ||
    (e.field === "testRevision" &&
      e.message.includes("after the form was opened")) ||
    (e.field === "consistency" && !isKeepMismatch(e));
  const staleErrors = storeErrors.filter(isStale);
  const conflictErrorsFor = (testId: number) =>
    storeErrors
      .filter(
        (e) =>
          e.testId === testId &&
          (e.field === "conflict" ||
            isKeepMismatch(e) ||
            (e.field === "testRevision" && !isStale(e))),
      )
      .map((e) => e.message);
  const staleNames = [
    ...new Set(
      staleErrors.map((e) =>
        e.constituentId !== undefined
          ? (youths.find(
              (y) => y.constituentId === e.constituentId,
            )?.name ?? `Constituent ${e.constituentId}`)
          : "this Bulk Substance Test",
      ),
    ),
  ];

  function handleSave() {
    if (savingRef.current) return;
    setSaveAttempts((n) => n + 1);
    setCommitError("");
    const request = buildRequest();
    const formValid =
      isValidMdy(sampleDate) &&
      !!sampleTime &&
      !(reason === OTHER_TEST_REASON && !otherReason.trim()) &&
      tests.length > 0 &&
      hiddenLossErrors.length === 0 &&
      youthErrors.length === 0;
    if (!formValid || validateRequest().length) return;

    savingRef.current = true;
    setSaving(true);
    let result:
      | ReturnType<typeof createBulkSubstanceTestsAtomic>
      | ReturnType<typeof updateBulkSubstanceTestsAtomic>;
    try {
      // Exactly one atomic store call per Save.
      result = snapshot
        ? updateBulkSubstanceTestsAtomic(
            buildModifyRequest(snapshot),
          )
        : createBulkSubstanceTestsAtomic(request);
    } catch (e) {
      result = {
        ok: false,
        errors: [
          {
            field: "commit",
            message:
              `The Bulk Substance Test could not be saved; nothing was changed. ${e instanceof Error ? e.message : ""}`.trim(),
          },
        ],
      };
    }
    if (result.ok) {
      toast.success(
        "testIds" in result
          ? `Bulk Substance Test saved for ${result.testIds.length} youth.`
          : "Bulk Substance Test updated.",
      );
      onClose();
      return;
    }
    // Validation errors re-render live from storeErrors; a commit failure
    // is shown on its own. The form keeps everything entered.
    const commit = result.errors.find(
      (e) => e.field === "commit",
    );
    if (commit) setCommitError(commit.message);
    savingRef.current = false;
    setSaving(false);
  }

  const toggleTest = (id: number) =>
    setSelectedTestIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id],
    );

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          size="xl"
          aria-describedby={ids.description}
          // Radix returns focus to a Dialog.Trigger; these dialogs are opened
          // from state, so return it to the opening button explicitly.
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            returnFocusRef?.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {isModify
                ? "Modify Bulk Substance Test"
                : "Add Bulk Substance Test"}
            </DialogTitle>
            {/* id on the inner span: DialogDescription keeps Radix's own
                id (see SubstanceUseTestingModals). */}
            <DialogDescription>
              <span id={ids.description}>
                {programName} ·{" "}
                {isModify
                  ? "Changes apply to this Bulk Substance Test and its linked individual tests."
                  : "One Substance Test for several youth."}
              </span>
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-6">
            {isModify && !snapshot && (
              <p
                role="alert"
                className="slds-text-4 text-[#c23934]"
              >
                This Bulk Substance Test could not be found for
                this Program. Close and select it again.
              </p>
            )}
            {staleErrors.length > 0 && (
              <div
                id={ids.stale}
                role="alert"
                className="space-y-1"
              >
                <p className="slds-text-4 font-semibold text-[#c23934]">
                  These records changed after this form was
                  opened: {staleNames.join(", ")}.
                </p>
                <p className="slds-text-4 text-[#c23934]">
                  Nothing was saved. Close and reopen Modify to
                  review the latest records — your changes in
                  this form are kept until you close it.
                </p>
              </div>
            )}
            {snapshot && snapshot.conflicts.length > 0 && (
              <BulkConflictReview
                headingId={ids.conflicts}
                conflicts={snapshot.conflicts}
                youths={youths}
                tests={tests}
                originalTests={snapshot.initial.tests}
                proposedDateTime={
                  fromModalDateTime(
                    `${sampleDate}, ${sampleTime}`,
                  ) ?? ""
                }
                proposedReason={effectiveReason}
                newUseShown={newUseShown}
                choices={choices}
                onChoose={(testId, c) =>
                  setChoices((prev) => ({
                    ...prev,
                    [testId]: c,
                  }))
                }
                errorsFor={conflictErrorsFor}
              />
            )}
            {/* ── General Information ─────────────────────────────── */}
            <section
              aria-labelledby={ids.general}
              className="space-y-3"
            >
              <SectionHeading id={ids.general}>
                General Information
              </SectionHeading>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div onBlur={() => touch("date")}>
                  <FieldLabel htmlFor={ids.date} required>
                    Sample Date
                  </FieldLabel>
                  <DateInput
                    id={ids.date}
                    value={sampleDate}
                    onChange={setSampleDate}
                    required
                  />
                  <FieldError
                    id={ids.dateError}
                    message={dateError}
                  />
                </div>
                <div onBlur={() => touch("time")}>
                  <FieldLabel htmlFor={ids.time} required>
                    Sample Time
                  </FieldLabel>
                  <TimeInput
                    id={ids.time}
                    surface="base"
                    value={sampleTime}
                    onChange={setSampleTime}
                    placeholder="e.g. 7:30 AM"
                  />
                  <FieldError
                    id={ids.timeError}
                    message={timeError}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor={ids.reason}>
                    Test Reason
                  </FieldLabel>
                  <Select
                    value={reason}
                    onValueChange={(v) => {
                      setReason(v);
                      if (v !== OTHER_TEST_REASON)
                        setOtherReason("");
                    }}
                  >
                    <SelectTrigger
                      id={ids.reason}
                      surface="base"
                    >
                      <SelectValue placeholder="Select test reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TEST_REASONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {reason === OTHER_TEST_REASON && (
                  <div
                    className="sm:col-span-3"
                    onBlur={() => touch("otherReason")}
                  >
                    <FieldLabel
                      htmlFor={ids.otherReason}
                      required
                    >
                      Other Reason
                    </FieldLabel>
                    <Input
                      id={ids.otherReason}
                      size="md"
                      surface="base"
                      value={otherReason}
                      onChange={(e) =>
                        setOtherReason(e.target.value)
                      }
                      placeholder="Specify the reason"
                      aria-required
                      aria-invalid={!!otherReasonError}
                      aria-describedby={
                        otherReasonError
                          ? ids.otherReasonError
                          : undefined
                      }
                    />
                    <FieldError
                      id={ids.otherReasonError}
                      message={otherReasonError}
                    />
                  </div>
                )}
              </div>
              {!dateError &&
                !timeError &&
                !otherReasonError &&
                storeErrorsFor([
                  "programId",
                  "sampleDateTime",
                ]).map((m, i) => (
                  <FieldError
                    key={m}
                    id={`${ids.generalError}-${i}`}
                    message={m}
                  />
                ))}
            </section>

            {/* ── Test(s) ─────────────────────────────────────────── */}
            <section
              aria-labelledby={ids.testsHeading}
              className="space-y-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <SectionHeading id={ids.testsHeading}>
                  Test(s)
                </SectionHeading>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    ref={addTestRef}
                    onClick={() =>
                      setTestDialog({ mode: "add" })
                    }
                  >
                    <Plus /> Add
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    ref={modifyTestRef}
                    disabled={!selectedTest}
                    title={
                      selectedTest
                        ? "Modify the selected test"
                        : "Select exactly one test to modify"
                    }
                    onClick={() =>
                      selectedTest &&
                      setTestDialog({
                        mode: "modify",
                        row: selectedTest,
                      })
                    }
                  >
                    <Pencil /> Modify
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table aria-labelledby={ids.testsHeading}>
                  <TableHeader>
                    <TableRow hoverable={false}>
                      <TableHead
                        variant="slds"
                        className="w-10"
                      >
                        <span className="sr-only">Select</span>
                      </TableHead>
                      <TableHead variant="slds">Type</TableHead>
                      <TableHead variant="slds">
                        Test Panel
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tests.length === 0 ? (
                      <TableRow hoverable={false}>
                        <TableCell colSpan={3}>
                          <span className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
                            No tests added yet. Use Add to add a
                            test.
                          </span>
                        </TableCell>
                      </TableRow>
                    ) : (
                      tests.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedTestIds.includes(
                                t.id,
                              )}
                              onCheckedChange={() =>
                                toggleTest(t.id)
                              }
                              aria-label={`Select test ${t.testType}${t.testPanel ? `, ${t.testPanel}` : ""}`}
                            />
                          </TableCell>
                          <TableCell>{t.testType}</TableCell>
                          <TableCell>
                            {t.testPanel || "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {hiddenEntries.length > 0 && (
                <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                  Stored results not shown in this form:{" "}
                  {hiddenEntries
                    .map(
                      (h) =>
                        `${h.testPanel || h.testType} (${h.count})`,
                    )
                    .join(", ")}
                  . They are kept as long as that test's Type
                  and Panel stay the same; see each youth's
                  individual test for them.
                </p>
              )}
              <FieldError
                id={ids.testsError}
                message={testsError}
              />
              {hiddenLossErrors.map((m, i) => (
                <FieldError
                  key={m}
                  id={`${ids.testsError}-hidden-${i}`}
                  message={m}
                />
              ))}
              {!testsError &&
                hiddenLossErrors.length === 0 &&
                storeErrorsFor([
                  "tests",
                  "testType",
                  "testPanel",
                ]).map((m, i) => (
                  <FieldError
                    key={m}
                    id={`${ids.testsError}-${i}`}
                    message={m}
                  />
                ))}
            </section>

            {/* ── Youth(s) ────────────────────────────────────────── */}
            <section
              aria-labelledby={ids.youths}
              className="space-y-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <SectionHeading id={ids.youths}>
                  Youth(s)
                </SectionHeading>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <Button
                    ref={youthRefs.add}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!programValid}
                    onClick={() => setYouthDialog("add")}
                  >
                    <Plus /> Add
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={selectedYouthIds.length === 0}
                    title={
                      selectedYouthIds.length
                        ? "Remove the selected youth from this Bulk Substance Test"
                        : "Select youth to remove"
                    }
                    onClick={removeSelectedYouth}
                  >
                    <Trash2 /> Remove
                  </Button>
                  <Button
                    ref={youthRefs.modify}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!selectedYouth}
                    title={
                      selectedYouth
                        ? "Modify the selected youth"
                        : "Select exactly one youth to modify"
                    }
                    onClick={() => setYouthDialog("modify")}
                  >
                    <Pencil /> Modify
                  </Button>
                  <Button
                    ref={youthRefs.modifyAll}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={youths.length === 0}
                    title="Apply New Use and Results to every included youth"
                    onClick={() => setYouthDialog("modifyAll")}
                  >
                    <Users /> Modify All
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table aria-labelledby={ids.youths}>
                  <TableHeader>
                    <TableRow hoverable={false}>
                      <TableHead
                        variant="slds"
                        className="w-10"
                      >
                        <span className="sr-only">Select</span>
                      </TableHead>
                      <TableHead variant="slds">
                        Constituent Name
                      </TableHead>
                      <TableHead variant="slds">
                        New Use
                      </TableHead>
                      <TableHead variant="slds">
                        Results
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {youths.length === 0 ? (
                      <TableRow hoverable={false}>
                        <TableCell colSpan={4}>
                          <span className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
                            {eligibleIds.size === 0
                              ? "This Program has no active youth."
                              : "No youth included. Use Add to include an active youth."}
                          </span>
                        </TableCell>
                      </TableRow>
                    ) : (
                      youths.map((y) => {
                        const lines = summarizeResults(
                          y.results,
                          tests,
                        );
                        return (
                          <TableRow key={y.constituentId}>
                            <TableCell>
                              <Checkbox
                                checked={selectedYouthIds.includes(
                                  y.constituentId,
                                )}
                                onCheckedChange={() =>
                                  toggleYouth(y.constituentId)
                                }
                                aria-label={`Select ${y.name}`}
                              />
                            </TableCell>
                            <TableCell>{y.name}</TableCell>
                            <TableCell>
                              {newUseShown
                                ? y.newUse
                                : "Not applicable"}
                            </TableCell>
                            <TableCell>
                              {lines.length === 0 ? (
                                "Not entered"
                              ) : (
                                <ul>
                                  {lines.map((l) => (
                                    <li key={l}>{l}</li>
                                  ))}
                                </ul>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              {(youthErrors.length
                ? youthErrors
                : storeErrorsFor([
                    "youths",
                    "constituentId",
                    "newUse",
                    "result",
                  ])
              ).map((m, i) => (
                <FieldError
                  key={m}
                  id={`${ids.youthsError}-${i}`}
                  message={m}
                />
              ))}
            </section>
          </DialogBody>

          <DialogFooter>
            {commitError && (
              <p
                id={ids.commitError}
                role="alert"
                className="slds-text-3 mr-auto text-[#c23934]"
              >
                {commitError}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || (isModify && !snapshot)}
              aria-busy={saving}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>

          {/* Rendered inside this DialogContent so Radix treats it as a
              nested dialog (shared dismiss layers / focus trap). */}
          {testDialog && (
            <BulkTestDefinitionDialog
              row={
                testDialog.mode === "modify"
                  ? testDialog.row
                  : undefined
              }
              onSave={saveTestRow}
              onClose={() => setTestDialog(null)}
              returnFocusRef={
                testDialog.mode === "modify"
                  ? modifyTestRef
                  : addTestRef
              }
            />
          )}
          {youthDialog === "add" && (
            <BulkYouthAddDialog
              candidates={eligibleYouth().filter(
                (e) =>
                  !youths.some(
                    (y) => y.constituentId === e.constituentId,
                  ),
              )}
              onAdd={(e) => {
                setYouths((ys) =>
                  ys.some(
                    (y) => y.constituentId === e.constituentId,
                  )
                    ? ys
                    : [
                        ...ys,
                        {
                          constituentId: e.constituentId,
                          name: e.name,
                          newUse: "Pending",
                          results: {},
                        },
                      ],
                );
                setYouthDialog(null);
              }}
              onClose={() => setYouthDialog(null)}
              returnFocusRef={youthRefs.add}
            />
          )}
          {youthDialog === "modify" && selectedYouth && (
            <BulkYouthModifyDialog
              youth={selectedYouth}
              tests={tests}
              newUseApplies={newUseShown}
              onSave={(next) => {
                setYouths((ys) =>
                  ys.map((y) =>
                    y.constituentId ===
                    selectedYouth.constituentId
                      ? { ...y, ...next }
                      : y,
                  ),
                );
                setYouthDialog(null);
              }}
              onClose={() => setYouthDialog(null)}
              returnFocusRef={youthRefs.modify}
            />
          )}
          {youthDialog === "modifyAll" && (
            <BulkYouthModifyAllDialog
              youths={youths}
              tests={tests}
              newUseApplies={newUseShown}
              onSave={(next) => {
                setYouths(next);
                setYouthDialog(null);
              }}
              onClose={() => setYouthDialog(null)}
              returnFocusRef={youthRefs.modifyAll}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}