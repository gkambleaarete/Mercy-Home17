// Program Substance Tests (20065) + Bulk Substance Tests (20066) — the shared
// data foundation. Not yet read by any screen.
//
//   Program ──< Substance Test (programId) >── Constituent (constituentId)
//   Program ──< Bulk Group (programId) ──< Substance Test (bulkTestId)
//
// OWNERSHIP: a Substance Test belongs to the Program it was created under.
// `programId` is stored on the record and never derived from the youth's
// current enrollment, so a transfer or an ended enrollment does not move the
// test's history to another Program.
//
// SHAPE: the record mirrors the youth-level `SubstanceUseTest` used by
// admissions/SubstanceUseTestingModals.tsx — same nested testDetails →
// testResults structure and the same tampering / lab fields — so the existing
// test form can later edit these records. That interface is not exported from
// its UI file, so the shape is restated here rather than imported from a
// component. Differences: `sampleDateTime` is ISO-local ("YYYY-MM-DDTHH:mm",
// sortable) instead of the modal's display string, and `constituentId`,
// `programId` and `bulkTestId` are added.
//
// LEGACY: the flat `SubstanceTestRecord` store in mockYouthProgramData.ts
// (read by the Program Record's current Substance Tests dialog) is left
// untouched. Those records have no Program, so they are NOT copied in here;
// getUnmappedLegacySubstanceTests() reports them instead.
//
// Same module-store + useSyncExternalStore convention as mockPassData.ts.

import { useSyncExternalStore } from "react";
import { getProgramById } from "./mockProgramsData";
import {
  type ActiveYouth,
  type SubstanceTestRecord,
  getActiveYouthForProgram,
  getConstituentById,
  getSubstanceTests,
  getYouthProgramEnrollments,
} from "./mockYouthProgramData";
import {
  BULK_TEST_TYPES,
  NEW_USE_OPTIONS,
  TEST_PANELS,
  TYPES_REQUIRING_PANEL,
  newUseApplies,
  panelsForTestType,
  validateSubstanceResult,
} from "../lib/substanceTests";

// ─── Types ──────────────────────────────────────────────────────────────────

/** One substance line within a test (field-compatible with the modal). */
export interface SubstanceTestResult {
  id: number;
  substance: string;
  result: string;
  level: string;
  units: string;
}

export interface SubstanceTestPersonNotified {
  id: number;
  name: string;
}

export interface SubstanceTestNotification {
  id: number;
  date: string;
  time: string;
  notifiedBy: string;
  personsNotified: SubstanceTestPersonNotified[];
  status: string;
  contactType: string;
  notes: string;
}

/** One test performed on the sample — Type, Panel and its results. */
export interface SubstanceTestDetail {
  id: number;
  testType: string;
  testPanel: string;
  relatedTest: string;
  refusalDetail: string;
  resultsDate: string;
  resultsTime: string;
  staffAdministering: string;
  testResults: SubstanceTestResult[];
  notifications?: SubstanceTestNotification[];
}

/** An individual Substance Test for one youth, owned by one Program. */
export interface ProgramSubstanceTest {
  id: number;
  constituentId: number;
  /** The Program the test was created under. Never re-derived. */
  programId: number;
  /** ISO-local "YYYY-MM-DDTHH:mm". */
  sampleDateTime: string;
  reason: string;
  newUse: string;
  testDetails: SubstanceTestDetail[];
  suspectTampering: boolean;
  tamperingComments: string;
  labConsultation: string;
  action: string;
  refrigeratorDate: string;
  pickupDate: string;
  discardDate: string;
  discardReason: string;
  /** The Bulk group that created / owns this test, if any. Changed only
   *  through link / unlink so both sides of the link stay in step. */
  bulkTestId: number | null;
  /** Starts at 1; +1 on every individual edit (updateProgramSubstanceTest)
   *  and every Bulk Modify write. Always set by the store; optional only so
   *  callers that build a test-shaped object need not supply it. */
  revision?: number;
}

/** A test definition (Type + Panel) applied to every youth in a group. */
export interface BulkTestDefinition {
  id: number;
  testType: string;
  testPanel: string;
}

export interface BulkSubstanceTestGroup {
  id: number;
  programId: number;
  /** ISO-local "YYYY-MM-DDTHH:mm". */
  sampleDateTime: string;
  reason: string;
  tests: BulkTestDefinition[];
  /** Linked individual tests — at most one per youth. Changed only through
   *  link / unlink. */
  substanceTestIds: number[];
  /** +1 on every change to the group's fields or membership. */
  revision: number;
  /** Each linked test's revision as of the group's last write to it. A
   *  linked test whose revision is now higher was edited individually
   *  since — a conflict for Bulk Modify. Individual edits never move it. */
  linkedRevisions: Record<number, number>;
}

/** Writes validate first and report why they were refused. */
export type SubstanceStoreResult<T> =
  { ok: true; value: T } | { ok: false; error: string };

export type NewProgramSubstanceTest = Omit<
  ProgramSubstanceTest,
  "id" | "bulkTestId" | "revision"
>;
/** Identity and ownership (id, constituentId, programId) and the bulk link
 *  are not editable here. */
export type ProgramSubstanceTestPatch = Partial<
  Omit<
    ProgramSubstanceTest,
    | "id"
    | "constituentId"
    | "programId"
    | "bulkTestId"
    | "revision"
  >
>;
export type NewBulkSubstanceTestGroup = Omit<
  BulkSubstanceTestGroup,
  "id" | "substanceTestIds" | "revision" | "linkedRevisions"
>;
export type BulkSubstanceTestGroupPatch = Partial<
  Omit<
    BulkSubstanceTestGroup,
    | "id"
    | "programId"
    | "substanceTestIds"
    | "revision"
    | "linkedRevisions"
  >
>;

/** A test's revision; records written before revisions existed count as 1. */
export function revisionOf(t: ProgramSubstanceTest): number {
  return t.revision ?? 1;
}

// ─── Seed data ──────────────────────────────────────────────────────────────
// Dates are relative to today, like the other Program-scoped seeds. Covers:
// a Program 1 bulk group with two linked tests, a historical test for an
// ended enrollment (Kevin Martinez, Program 1), and single tests in
// Programs 3 and 4.

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function sampleDaysAgo(days: number, time: string): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${time}`;
}

const NO_EXTRAS = {
  suspectTampering: false,
  tamperingComments: "",
  labConsultation: "",
  action: "",
  refrigeratorDate: "",
  pickupDate: "",
  discardDate: "",
  discardReason: "",
};

function instantDetail(
  results: [substance: string, result: string][],
): SubstanceTestDetail {
  return {
    id: 1,
    testType: "Instant Test",
    testPanel: "iCup Instant 10-Panel",
    relatedTest: "",
    refusalDetail: "",
    resultsDate: "",
    resultsTime: "",
    staffAdministering: "",
    testResults: results.map(([substance, result], i) => ({
      id: i + 1,
      substance,
      result,
      level: "",
      units: "",
    })),
  };
}

const RANDOM_TEST_SAMPLE = sampleDaysAgo(2, "07:30");

const SEED_TESTS: ProgramSubstanceTest[] = [
  {
    id: 1001,
    constituentId: 1,
    programId: 1,
    sampleDateTime: RANDOM_TEST_SAMPLE,
    reason: "Program Random Test",
    newUse: "No",
    testDetails: [
      instantDetail([
        ["THC", "Negative"],
        ["Cocaine", "Negative"],
      ]),
    ],
    ...NO_EXTRAS,
    bulkTestId: 5001,
  },
  {
    id: 1002,
    constituentId: 2,
    programId: 1,
    sampleDateTime: RANDOM_TEST_SAMPLE,
    reason: "Program Random Test",
    newUse: "Yes",
    testDetails: [
      instantDetail([
        ["THC", "Positive"],
        ["Cocaine", "Negative"],
      ]),
    ],
    ...NO_EXTRAS,
    bulkTestId: 5001,
  },
  {
    // Historical: enrollment in Program 1 has since ended.
    id: 1003,
    constituentId: 17,
    programId: 1,
    sampleDateTime: sampleDaysAgo(60, "15:10"),
    reason: "Suspicion of Use",
    newUse: "No",
    testDetails: [instantDetail([["THC", "Negative"]])],
    ...NO_EXTRAS,
    bulkTestId: null,
  },
  {
    id: 1004,
    constituentId: 12,
    programId: 3,
    sampleDateTime: sampleDaysAgo(5, "09:00"),
    reason: "Treatment Plan",
    newUse: "Pending",
    testDetails: [instantDetail([["Opiates", "Negative"]])],
    ...NO_EXTRAS,
    bulkTestId: null,
  },
  {
    id: 1005,
    constituentId: 25,
    programId: 4,
    sampleDateTime: sampleDaysAgo(9, "18:45"),
    reason: "Self-Disclosure",
    newUse: "No",
    testDetails: [instantDetail([["Alcohol", "Negative"]])],
    ...NO_EXTRAS,
    bulkTestId: null,
  },
];

const SEED_BULK_GROUPS: BulkSubstanceTestGroup[] = [
  {
    id: 5001,
    programId: 1,
    sampleDateTime: RANDOM_TEST_SAMPLE,
    reason: "Program Random Test",
    tests: [
      {
        id: 1,
        testType: "Instant Test",
        testPanel: "iCup Instant 10-Panel",
      },
    ],
    substanceTestIds: [1001, 1002],
    revision: 1,
    // Seeded together with their tests: nothing edited since, no conflict.
    linkedRevisions: { 1001: 1, 1002: 1 },
  },
];

let tests: ProgramSubstanceTest[] = SEED_TESTS.map((t) => ({
  ...t,
  revision: 1,
}));
let bulkGroups: BulkSubstanceTestGroup[] = [
  ...SEED_BULK_GROUPS,
];

// ─── Reactivity ─────────────────────────────────────────────────────────────
// One listener set for both collections: a link / unlink writes both sides in
// a single commit, so no view ever sees a half-applied link. Each array is its
// own snapshot and is replaced — never mutated — on write.

const listeners = new Set<() => void>();

export function subscribeSubstanceTests(
  listener: () => void,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Writes the store, then notifies every subscriber. The write is done
 *  before any subscriber runs, so it can never be undone by one. Each
 *  subscriber is called in isolation: one that throws neither stops the
 *  others nor turns the write into a failure. Its error is logged and
 *  returned so the caller can report it separately. */
function commit(next: {
  tests?: ProgramSubstanceTest[];
  bulkGroups?: BulkSubstanceTestGroup[];
}): string[] {
  if (next.tests) tests = next.tests;
  if (next.bulkGroups) bulkGroups = next.bulkGroups;
  const notificationErrors: string[] = [];
  listeners.forEach((l) => {
    try {
      l();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : String(e);
      notificationErrors.push(message);
      console.error(
        "Substance Test store: a subscriber failed after a successful write.",
        e,
      );
    }
  });
  return notificationErrors;
}

/** Every individual test, kept current for the calling component. */
export function useProgramSubstanceTests(): ProgramSubstanceTest[] {
  return useSyncExternalStore(
    subscribeSubstanceTests,
    getProgramSubstanceTests,
    getProgramSubstanceTests,
  );
}

/** Every bulk group, kept current for the calling component. */
export function useBulkSubstanceTestGroups(): BulkSubstanceTestGroup[] {
  return useSyncExternalStore(
    subscribeSubstanceTests,
    getBulkSubstanceTestGroups,
    getBulkSubstanceTestGroups,
  );
}

// ─── Reads: individual tests ────────────────────────────────────────────────

export function getProgramSubstanceTests(): ProgramSubstanceTest[] {
  return tests;
}

/** Tests owned by this Program — by stored programId, including youth whose
 *  enrollment has since ended. Newest first. */
export function getProgramSubstanceTestsForProgram(
  programId: number,
): ProgramSubstanceTest[] {
  return tests
    .filter((t) => t.programId === programId)
    .sort((a, b) =>
      b.sampleDateTime.localeCompare(a.sampleDateTime),
    );
}

/** Every test for a youth, across all Programs. Newest first. */
export function getProgramSubstanceTestsForConstituent(
  constituentId: number,
): ProgramSubstanceTest[] {
  return tests
    .filter((t) => t.constituentId === constituentId)
    .sort((a, b) =>
      b.sampleDateTime.localeCompare(a.sampleDateTime),
    );
}

export function getProgramSubstanceTestById(
  id: number,
): ProgramSubstanceTest | undefined {
  return tests.find((t) => t.id === id);
}

// ─── Reads: bulk groups ─────────────────────────────────────────────────────

export function getBulkSubstanceTestGroups(): BulkSubstanceTestGroup[] {
  return bulkGroups;
}

/** Bulk groups owned by this Program. Newest first. */
export function getBulkSubstanceTestGroupsForProgram(
  programId: number,
): BulkSubstanceTestGroup[] {
  return bulkGroups
    .filter((g) => g.programId === programId)
    .sort((a, b) =>
      b.sampleDateTime.localeCompare(a.sampleDateTime),
    );
}

export function getBulkSubstanceTestGroupById(
  id: number,
): BulkSubstanceTestGroup | undefined {
  return bulkGroups.find((g) => g.id === id);
}

/** The individual tests linked to a group, in the group's link order. */
export function getSubstanceTestsForBulkGroup(
  groupId: number,
): ProgramSubstanceTest[] {
  const group = getBulkSubstanceTestGroupById(groupId);
  if (!group) return [];
  return group.substanceTestIds.flatMap((id) => {
    const t = getProgramSubstanceTestById(id);
    return t ? [t] : [];
  });
}

/** Youth to prefill a new bulk group: the Program's currently Active Youth
 *  (existing enrollment logic), one entry per constituent, name-sorted. */
export function getActiveYouthForBulkGroup(
  programId: number,
): ActiveYouth[] {
  const seen = new Set<number>();
  return getActiveYouthForProgram(programId).filter(
    (y) =>
      !seen.has(y.constituentId) && !!seen.add(y.constituentId),
  );
}

// ─── Validation ─────────────────────────────────────────────────────────────

const ISO_LOCAL_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function checkSampleDateTime(value: string): string | null {
  if (!ISO_LOCAL_DATE_TIME.test(value))
    return `Sample Date/Time "${value}" must be "YYYY-MM-DDTHH:mm".`;
  // Checked field by field: Date() silently rolls 02/30 over to 03/02.
  const [y, m, d, h, min] = value.split(/[-T:]/).map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return m < 1 ||
    m > 12 ||
    d < 1 ||
    d > daysInMonth ||
    h > 23 ||
    min > 59
    ? `Sample Date/Time "${value}" is not a real date and time.`
    : null;
}

function checkProgram(programId: number): string | null {
  return getProgramById(programId)
    ? null
    : `Program ${programId} does not exist.`;
}

/** The youth exists, is a Youth, and has (or had) an enrollment in this
 *  Program. Enrollment status is not required: history stays valid. */
function checkYouthInProgram(
  constituentId: number,
  programId: number,
): string | null {
  const c = getConstituentById(constituentId);
  if (!c) return `Constituent ${constituentId} does not exist.`;
  if (c.role !== "Youth")
    return `Constituent ${constituentId} is not a Youth.`;
  const enrolled = getYouthProgramEnrollments().some(
    (e) =>
      e.constituentId === constituentId &&
      e.programId === programId,
  );
  return enrolled
    ? null
    : `Constituent ${constituentId} has no enrollment in Program ${programId}.`;
}

function withoutKey(
  map: Record<number, number>,
  key: number,
): Record<number, number> {
  const { [key]: _dropped, ...rest } = map;
  return rest;
}

function fail<T>(error: string): SubstanceStoreResult<T> {
  return { ok: false, error };
}

// ─── Writes: individual tests ───────────────────────────────────────────────
// IDs are max + 1 and never reused (nothing is deleted). Updates keep id,
// constituentId, programId and bulkTestId.

function nextTestId(): number {
  return tests.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}

export function createProgramSubstanceTest(
  input: NewProgramSubstanceTest,
): SubstanceStoreResult<ProgramSubstanceTest> {
  const error =
    checkProgram(input.programId) ??
    checkYouthInProgram(input.constituentId, input.programId) ??
    checkSampleDateTime(input.sampleDateTime);
  if (error) return fail(error);
  const record: ProgramSubstanceTest = {
    ...input,
    id: nextTestId(),
    bulkTestId: null,
    revision: 1,
  };
  commit({ tests: [...tests, record] });
  return { ok: true, value: record };
}

export function updateProgramSubstanceTest(
  id: number,
  patch: ProgramSubstanceTestPatch,
): SubstanceStoreResult<ProgramSubstanceTest> {
  const current = getProgramSubstanceTestById(id);
  if (!current)
    return fail(`Substance Test ${id} does not exist.`);
  if (patch.sampleDateTime !== undefined) {
    const error = checkSampleDateTime(patch.sampleDateTime);
    if (error) return fail(error);
  }
  // Spread order pins identity even if a caller passes extra keys.
  const record: ProgramSubstanceTest = {
    ...current,
    ...patch,
    id: current.id,
    constituentId: current.constituentId,
    programId: current.programId,
    bulkTestId: current.bulkTestId,
    // An individual edit: the group's baseline is NOT moved, so Bulk Modify
    // sees this test as changed since the last Bulk write.
    revision: revisionOf(current) + 1,
  };
  commit({
    tests: tests.map((t) => (t.id === id ? record : t)),
  });
  return { ok: true, value: record };
}

// ─── Writes: bulk groups ────────────────────────────────────────────────────
// Creating or editing a group does NOT create, change or propagate to its
// individual tests — fan-out and propagation belong to a later chunk.

function nextBulkGroupId(): number {
  return (
    bulkGroups.reduce((max, g) => Math.max(max, g.id), 5000) + 1
  );
}

export function createBulkSubstanceTestGroup(
  input: NewBulkSubstanceTestGroup,
): SubstanceStoreResult<BulkSubstanceTestGroup> {
  const error =
    checkProgram(input.programId) ??
    checkSampleDateTime(input.sampleDateTime);
  if (error) return fail(error);
  const group: BulkSubstanceTestGroup = {
    ...input,
    id: nextBulkGroupId(),
    substanceTestIds: [],
    revision: 1,
    linkedRevisions: {},
  };
  commit({ bulkGroups: [...bulkGroups, group] });
  return { ok: true, value: group };
}

export function updateBulkSubstanceTestGroup(
  id: number,
  patch: BulkSubstanceTestGroupPatch,
): SubstanceStoreResult<BulkSubstanceTestGroup> {
  const current = getBulkSubstanceTestGroupById(id);
  if (!current) return fail(`Bulk group ${id} does not exist.`);
  if (patch.sampleDateTime !== undefined) {
    const error = checkSampleDateTime(patch.sampleDateTime);
    if (error) return fail(error);
  }
  const group: BulkSubstanceTestGroup = {
    ...current,
    ...patch,
    id: current.id,
    programId: current.programId,
    substanceTestIds: current.substanceTestIds,
    linkedRevisions: current.linkedRevisions,
    revision: current.revision + 1,
  };
  commit({
    bulkGroups: bulkGroups.map((g) =>
      g.id === id ? group : g,
    ),
  });
  return { ok: true, value: group };
}

// ─── Writes: bulk ↔ individual link ─────────────────────────────────────────
// The only way bulkTestId / substanceTestIds change. Both sides are written in
// one commit.

/** Links an existing test to a group. Refused when the test is already in a
 *  group, belongs to another Program, or its youth already has a test in this
 *  group (one test per youth per group). */
export function linkSubstanceTestToBulkGroup(
  testId: number,
  groupId: number,
): SubstanceStoreResult<BulkSubstanceTestGroup> {
  const test = getProgramSubstanceTestById(testId);
  if (!test)
    return fail(`Substance Test ${testId} does not exist.`);
  const group = getBulkSubstanceTestGroupById(groupId);
  if (!group)
    return fail(`Bulk group ${groupId} does not exist.`);
  if (test.bulkTestId !== null)
    return fail(
      `Substance Test ${testId} is already in bulk group ${test.bulkTestId}.`,
    );
  if (test.programId !== group.programId)
    return fail(
      `Substance Test ${testId} belongs to Program ${test.programId}, not Program ${group.programId}.`,
    );
  const youthAlreadyInGroup = getSubstanceTestsForBulkGroup(
    groupId,
  ).some((t) => t.constituentId === test.constituentId);
  if (youthAlreadyInGroup)
    return fail(
      `Constituent ${test.constituentId} already has a test in bulk group ${groupId}.`,
    );

  const nextGroup: BulkSubstanceTestGroup = {
    ...group,
    substanceTestIds: [...group.substanceTestIds, testId],
    // Baseline = the test as it is when it joins.
    linkedRevisions: {
      ...group.linkedRevisions,
      [testId]: revisionOf(test),
    },
    revision: group.revision + 1,
  };
  commit({
    tests: tests.map((t) =>
      t.id === testId ? { ...t, bulkTestId: groupId } : t,
    ),
    bulkGroups: bulkGroups.map((g) =>
      g.id === groupId ? nextGroup : g,
    ),
  });
  return { ok: true, value: nextGroup };
}

/** Clears a test's bulk link. The individual test is kept, unchanged apart
 *  from bulkTestId. PROVISIONAL — pending BA confirmation of what removing a
 *  youth from a group should do to their test. */
export function unlinkSubstanceTestFromBulkGroup(
  testId: number,
): SubstanceStoreResult<ProgramSubstanceTest> {
  const test = getProgramSubstanceTestById(testId);
  if (!test)
    return fail(`Substance Test ${testId} does not exist.`);
  if (test.bulkTestId === null)
    return fail(
      `Substance Test ${testId} is not in a bulk group.`,
    );
  const groupId = test.bulkTestId;
  const record: ProgramSubstanceTest = {
    ...test,
    bulkTestId: null,
  };
  commit({
    tests: tests.map((t) => (t.id === testId ? record : t)),
    bulkGroups: bulkGroups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            substanceTestIds: g.substanceTestIds.filter(
              (id) => id !== testId,
            ),
            linkedRevisions: withoutKey(
              g.linkedRevisions,
              testId,
            ),
            revision: g.revision + 1,
          }
        : g,
    ),
  });
  return { ok: true, value: record };
}

// ─── Atomic Bulk creation (20066) ───────────────────────────────────────────
// One call creates a Bulk group and one individual test per youth, linked
// both ways — or nothing at all. Everything is validated, then built in
// local arrays, then written in a single commit (one subscriber
// notification). Any validation error or unexpected failure returns before
// that commit, so the store is exactly as it was. The public create / link
// functions are NOT used here: each of them commits on its own.

/** One entered substance result for one youth. Blank results are simply
 *  absent — never stored as Negative. */
export interface BulkYouthResultInput {
  /** BulkTestDefinition.id this result belongs to. */
  testId: number;
  substance: string;
  result: "Positive" | "Negative";
  level: string;
  units: string;
}

export interface BulkYouthInput {
  constituentId: number;
  newUse: string;
  results: BulkYouthResultInput[];
}

export interface NewBulkSubstanceTests {
  programId: number;
  /** ISO-local "YYYY-MM-DDTHH:mm". */
  sampleDateTime: string;
  /** Stored as entered (for "Other", the free text). */
  reason: string;
  tests: BulkTestDefinition[];
  youths: BulkYouthInput[];
}

export interface BulkCreateError {
  field:
    | "programId"
    | "sampleDateTime"
    | "tests"
    | "testType"
    | "testPanel"
    | "youths"
    | "constituentId"
    | "newUse"
    | "result"
    | "commit"
    | "groupId"
    | "groupRevision"
    | "testRevision"
    | "conflict"
    | "consistency";
  message: string;
  testId?: number;
  constituentId?: number;
  substance?: string;
}

export type BulkCreateResult =
  | {
      ok: true;
      groupId: number;
      testIds: number[];
      /** Subscribers that failed AFTER the records were saved. The save
       *  itself succeeded; these are reported separately, never as a
       *  rollback. */
      notificationErrors?: string[];
    }
  | { ok: false; errors: BulkCreateError[] };

/** Every validation error for a new Bulk Substance Test (empty = valid). */
export function validateNewBulkSubstanceTests(
  input: NewBulkSubstanceTests,
): BulkCreateError[] {
  return validateBulkRequest(input, {});
}

/** Shared by Bulk creation and Bulk Modify. `members`: youth already in the
 *  group, who stay valid even if no longer active. `skipValuesFor`: youth
 *  whose New Use / results are not being written (Keep Individual), so they
 *  are not validated. */
function validateBulkRequest(
  input: NewBulkSubstanceTests,
  options: {
    members?: Set<number>;
    skipValuesFor?: Set<number>;
  },
): BulkCreateError[] {
  const errors: BulkCreateError[] = [];
  const err = (e: BulkCreateError) => errors.push(e);

  const programError = checkProgram(input.programId);
  if (programError)
    err({ field: "programId", message: programError });
  const dateError = checkSampleDateTime(
    input.sampleDateTime ?? "",
  );
  if (dateError)
    err({ field: "sampleDateTime", message: dateError });

  // Test(s): at least one; bulk Types only; individual Type → Panel rules.
  const tests = input.tests ?? [];
  if (tests.length === 0)
    err({
      field: "tests",
      message: "At least one test is required.",
    });
  const testIds = new Set<number>();
  for (const t of tests) {
    if (testIds.has(t.id))
      err({
        field: "tests",
        testId: t.id,
        message: `Test ${t.id} is listed more than once.`,
      });
    testIds.add(t.id);
    if (
      !(BULK_TEST_TYPES as readonly string[]).includes(
        t.testType,
      )
    ) {
      err({
        field: "testType",
        testId: t.id,
        message: t.testType
          ? `"${t.testType}" is not available for Bulk Substance Tests.`
          : "Test Type is required.",
      });
      continue;
    }
    if (
      TYPES_REQUIRING_PANEL.includes(t.testType) &&
      !t.testPanel
    )
      err({
        field: "testPanel",
        testId: t.id,
        message: "Test Panel is required for this test type.",
      });
    else if (
      t.testPanel &&
      !panelsForTestType(t.testType).includes(t.testPanel)
    )
      err({
        field: "testPanel",
        testId: t.id,
        message: `"${t.testPanel}" is not a panel for ${t.testType}.`,
      });
  }
  const testById = new Map(tests.map((t) => [t.id, t]));

  // Youth(s): at least one; unique; each a currently active youth of the
  // originating Program.
  const youths = input.youths ?? [];
  if (youths.length === 0)
    err({
      field: "youths",
      message: "At least one youth is required.",
    });
  const eligible = programError
    ? new Set<number>()
    : new Set([
        ...getActiveYouthForBulkGroup(input.programId).map(
          (y) => y.constituentId,
        ),
        ...(options.members ?? []),
      ]);
  const seen = new Set<number>();
  const appliesNewUse = newUseApplies(input.reason ?? "");
  for (const y of youths) {
    const cid = y.constituentId;
    if (seen.has(cid))
      err({
        field: "constituentId",
        constituentId: cid,
        message: `Constituent ${cid} is listed more than once.`,
      });
    seen.add(cid);
    if (!programError && !eligible.has(cid))
      err({
        field: "constituentId",
        constituentId: cid,
        message: `Constituent ${cid} is not a currently active youth of Program ${input.programId}.`,
      });
    if (options.skipValuesFor?.has(cid)) continue;

    // Results: only real substances of a test's panel, Positive/Negative,
    // individual Level / Units rules, one per substance.
    const resultKeys = new Set<string>();
    for (const r of y.results ?? []) {
      const t = testById.get(r.testId);
      const key = `${r.testId}::${r.substance}`;
      const at = {
        constituentId: cid,
        testId: r.testId,
        substance: r.substance,
      };
      if (!t) {
        err({
          field: "result",
          ...at,
          message: `Result for unknown test ${r.testId}.`,
        });
        continue;
      }
      const substances =
        TEST_PANELS[t.testPanel]?.substances ?? [];
      if (!substances.includes(r.substance))
        err({
          field: "result",
          ...at,
          message: `"${r.substance}" is not tested by ${t.testPanel || t.testType}.`,
        });
      if (resultKeys.has(key))
        err({
          field: "result",
          ...at,
          message: `${r.substance} has more than one result.`,
        });
      resultKeys.add(key);
      if (r.result !== "Positive" && r.result !== "Negative")
        err({
          field: "result",
          ...at,
          message: `Result must be Positive or Negative.`,
        });
      const ruleError = validateSubstanceResult(r);
      if (ruleError)
        err({ field: "result", ...at, message: ruleError });
    }

    // New Use: a known option; individual rules — stays Pending until a
    // result exists, and cannot stay Pending once one does (when the
    // Reason calls for it).
    const hasResults = (y.results ?? []).length > 0;
    if (
      !(NEW_USE_OPTIONS as readonly string[]).includes(y.newUse)
    )
      err({
        field: "newUse",
        constituentId: cid,
        message: `New Use must be one of ${NEW_USE_OPTIONS.join(", ")}.`,
      });
    else if (!hasResults && y.newUse !== "Pending")
      err({
        field: "newUse",
        constituentId: cid,
        message:
          "New Use can be set only once a result is entered.",
      });
    else if (
      appliesNewUse &&
      hasResults &&
      y.newUse === "Pending"
    )
      err({
        field: "newUse",
        constituentId: cid,
        message:
          "Please update 'Results Indicate New Use' before saving.",
      });
  }
  return errors;
}

/** One test detail per definition, in order, with only the ENTERED results
 *  in panel order (blank stays absent; Lab Test gets none). With `previous`
 *  (Bulk Modify), a definition that keeps its Type and Panel also keeps the
 *  old detail's other fields, notifications, and any results for substances
 *  outside the panel list — so nothing the form cannot show is dropped. */
function buildTestDetails(
  definitions: BulkTestDefinition[],
  results: BulkYouthResultInput[],
  previous?: {
    definitions: BulkTestDefinition[];
    details: SubstanceTestDetail[];
  },
): SubstanceTestDetail[] {
  return definitions.map((t, d) => {
    const substances =
      TEST_PANELS[t.testPanel]?.substances ?? [];
    const entered = results.filter((r) => r.testId === t.id);
    const oldIndex = previous
      ? previous.definitions.findIndex((o) => o.id === t.id)
      : -1;
    const old =
      oldIndex >= 0 ? previous!.details[oldIndex] : undefined;
    const kept =
      old &&
      old.testType === t.testType &&
      old.testPanel === t.testPanel
        ? old
        : undefined;
    const testResults = [
      ...substances.flatMap((substance) => {
        const r = entered.find(
          (x) => x.substance === substance,
        );
        return r
          ? [
              {
                substance,
                result: r.result,
                level: r.level.trim(),
                units: r.units.trim(),
              },
            ]
          : [];
      }),
      ...(kept
        ? kept.testResults
            .filter((r) => !substances.includes(r.substance))
            .map(({ substance, result, level, units }) => ({
              substance,
              result,
              level,
              units,
            }))
        : []),
    ].map((r, n) => ({ id: n + 1, ...r }));
    return {
      id: d + 1,
      testType: t.testType,
      testPanel: t.testPanel,
      relatedTest: kept?.relatedTest ?? "",
      refusalDetail: kept?.refusalDetail ?? "",
      resultsDate: kept?.resultsDate ?? "",
      resultsTime: kept?.resultsTime ?? "",
      staffAdministering: kept?.staffAdministering ?? "",
      testResults,
      ...(kept?.notifications
        ? { notifications: structuredClone(kept.notifications) }
        : {}),
    };
  });
}

/** Creates the Bulk group and one linked individual test per youth in a
 *  single commit — or changes nothing and returns every error. */
export function createBulkSubstanceTestsAtomic(
  input: NewBulkSubstanceTests,
): BulkCreateResult {
  const errors = validateNewBulkSubstanceTests(input);
  if (errors.length) return { ok: false, errors };

  // Build everything locally — the store is not touched yet. Only this part
  // can fail; the commit below is outside the try, so a failure here is
  // always a true "nothing was changed".
  let newTests: ProgramSubstanceTest[];
  let group: BulkSubstanceTestGroup;
  try {
    const groupId = nextBulkGroupId();
    const firstTestId = nextTestId();
    newTests = input.youths.map((y, i) => ({
      id: firstTestId + i,
      constituentId: y.constituentId,
      programId: input.programId,
      sampleDateTime: input.sampleDateTime,
      reason: input.reason,
      newUse: y.newUse,
      // One test detail per Test(s) row; only ENTERED results, in panel
      // order. Blank stays absent; Lab Test gets no results.
      testDetails: buildTestDetails(input.tests, y.results),
      ...NO_EXTRAS,
      bulkTestId: groupId,
      revision: 1,
    }));
    group = {
      id: groupId,
      programId: input.programId,
      sampleDateTime: input.sampleDateTime,
      reason: input.reason,
      tests: input.tests.map((t) => ({ ...t })),
      substanceTestIds: newTests.map((t) => t.id),
      revision: 1,
      linkedRevisions: Object.fromEntries(
        newTests.map((t) => [t.id, 1]),
      ),
    };

    // Last line of defence before writing: ids unused, links consistent.
    const usedIds = new Set(tests.map((t) => t.id));
    if (
      bulkGroups.some((g) => g.id === groupId) ||
      newTests.some(
        (t) => usedIds.has(t.id) || t.bulkTestId !== groupId,
      )
    )
      throw new Error(
        "Bulk record identifiers are not unique.",
      );
  } catch (e) {
    return {
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

  // One write for the group and every record. From here the save has
  // happened, whatever a subscriber does.
  const notificationErrors = commit({
    tests: [...tests, ...newTests],
    bulkGroups: [...bulkGroups, group],
  });
  return {
    ok: true,
    groupId: group.id,
    testIds: group.substanceTestIds,
    ...(notificationErrors.length
      ? { notificationErrors }
      : {}),
  };
}

// ─── Bulk Modify (20066) — conflicts, stale checks, atomic write ────────────
// A linked test edited individually after the group's last write to it
// (revision > the group's baseline) is a CONFLICT: Bulk Modify never
// overwrites it unless that record is explicitly resolved — "keep" (record
// untouched; its baseline stays, so it is flagged again next time) or
// "overwrite" (confirmed against the exact revision the user reviewed).
// Every request carries the revisions the form was opened with; anything
// changed since is rejected as stale. Like creation: validate → build in
// memory → one commit, so a failure leaves the store unchanged.

export interface BulkSubstanceTestConflict {
  groupId: number;
  testId: number;
  constituentId: number;
  currentRevision: number;
  baselineRevision: number;
  /** The individually edited values, as stored now (a copy). */
  current: Pick<
    ProgramSubstanceTest,
    "sampleDateTime" | "reason" | "newUse" | "testDetails"
  >;
}

/** Read-only: linked tests edited individually since the group's last
 *  write to them. A test with no recorded baseline is not reported. */
export function detectBulkSubstanceTestConflicts(
  groupId: number,
): BulkSubstanceTestConflict[] {
  const group = getBulkSubstanceTestGroupById(groupId);
  if (!group) return [];
  return group.substanceTestIds.flatMap((id) => {
    const t = getProgramSubstanceTestById(id);
    if (!t) return [];
    const currentRevision = revisionOf(t);
    const baselineRevision =
      group.linkedRevisions[id] ?? currentRevision;
    if (currentRevision <= baselineRevision) return [];
    return [
      {
        groupId,
        testId: id,
        constituentId: t.constituentId,
        currentRevision,
        baselineRevision,
        current: structuredClone({
          sampleDateTime: t.sampleDateTime,
          reason: t.reason,
          newUse: t.newUse,
          testDetails: t.testDetails,
        }),
      },
    ];
  });
}

export type BulkConflictResolution =
  | { action: "keep" }
  | {
      action: "overwrite";
      /** The revision the user reviewed and confirmed overwriting. */
      confirmedRevision: number;
    };

export interface BulkSubstanceTestsModification {
  groupId: number;
  /** group.revision when the form was opened. */
  expectedGroupRevision: number;
  /** Every linked test's revision when the form was opened. */
  expectedTestRevisions: Record<number, number>;
  sampleDateTime: string;
  reason: string;
  tests: BulkTestDefinition[];
  /** The complete desired membership with each youth's values. Members not
   *  listed are removed (unlinked, never deleted); new youth are added. */
  youths: BulkYouthInput[];
  /** Required for every conflicted test that stays in the group. */
  resolutions?: Record<number, BulkConflictResolution>;
}

export type BulkModifyResult =
  | {
      ok: true;
      groupId: number;
      groupRevision: number;
      updatedTestIds: number[];
      addedTestIds: number[];
      removedTestIds: number[];
      /** Conflicted tests left untouched by "keep". */
      keptTestIds: number[];
      notificationErrors?: string[];
    }
  | { ok: false; errors: BulkCreateError[] };

const sameDefinitions = (
  a: { testType: string; testPanel: string }[],
  b: { testType: string; testPanel: string }[],
) =>
  a.length === b.length &&
  a.every(
    (x, i) =>
      x.testType === b[i].testType &&
      x.testPanel === b[i].testPanel,
  );

/** Every reason a Bulk Modify request cannot be applied (empty = valid). */
export function validateBulkSubstanceTestsModification(
  req: BulkSubstanceTestsModification,
): BulkCreateError[] {
  const group = getBulkSubstanceTestGroupById(req.groupId);
  if (!group)
    return [
      {
        field: "groupId",
        message: `Bulk group ${req.groupId} does not exist.`,
      },
    ];

  // 1. Stale checks first: anything changed since the form opened must be
  //    reviewed again, so nothing else is decided on old data.
  const stale: BulkCreateError[] = [];
  if (group.revision !== req.expectedGroupRevision)
    stale.push({
      field: "groupRevision",
      message:
        "This Bulk Substance Test was changed after it was opened. Refresh and review the changes.",
    });
  const members = new Map<number, ProgramSubstanceTest>();
  for (const id of group.substanceTestIds) {
    const t = getProgramSubstanceTestById(id);
    if (!t || t.bulkTestId !== group.id) {
      stale.push({
        field: "consistency",
        testId: id,
        message: `Linked Substance Test ${id} is missing or no longer linked to this group.`,
      });
      continue;
    }
    members.set(t.constituentId, t);
    if (req.expectedTestRevisions?.[id] !== revisionOf(t))
      stale.push({
        field: "testRevision",
        testId: id,
        constituentId: t.constituentId,
        message: `Substance Test ${id} was changed after the form was opened. Refresh and review the changes.`,
      });
  }
  if (stale.length) return stale;

  const errors: BulkCreateError[] = [];
  const err = (e: BulkCreateError) => errors.push(e);
  const requested = new Set(
    req.youths.map((y) => y.constituentId),
  );
  const remaining = [...members.values()].filter((t) =>
    requested.has(t.constituentId),
  );

  // 2. Conflict resolutions: required for every conflicted test that stays;
  //    an overwrite must be confirmed against the current revision; none
  //    may target a test that has no conflict here.
  const resolutions = req.resolutions ?? {};
  const conflicts = detectBulkSubstanceTestConflicts(
    group.id,
  ).filter((c) => remaining.some((t) => t.id === c.testId));
  const keep = new Set<number>();
  for (const c of conflicts) {
    const r = resolutions[c.testId];
    if (!r)
      err({
        field: "conflict",
        testId: c.testId,
        constituentId: c.constituentId,
        message: `Substance Test ${c.testId} was edited individually after the last Bulk save. Choose Keep Individual Changes or Overwrite with Bulk Changes.`,
      });
    else if (
      r.action === "overwrite" &&
      r.confirmedRevision !== c.currentRevision
    )
      err({
        field: "testRevision",
        testId: c.testId,
        constituentId: c.constituentId,
        message: `Overwrite of Substance Test ${c.testId} was confirmed for revision ${r.confirmedRevision}, but it is now revision ${c.currentRevision}. Review it again.`,
      });
    else if (r.action === "keep") keep.add(c.constituentId);
    else if (r.action !== "overwrite")
      err({
        field: "conflict",
        testId: c.testId,
        message: `Unknown resolution for Substance Test ${c.testId}.`,
      });
  }
  for (const id of Object.keys(resolutions).map(Number))
    if (!conflicts.some((c) => c.testId === id))
      err({
        field: "conflict",
        testId: id,
        message: `Substance Test ${id} has no conflict to resolve in this change.`,
      });

  // 3. Same field rules as creation, against the group's own Program;
  //    existing members stay valid, kept youth's values are not written.
  errors.push(
    ...validateBulkRequest(
      {
        programId: group.programId,
        sampleDateTime: req.sampleDateTime,
        reason: req.reason,
        tests: req.tests,
        youths: req.youths,
      },
      { members: new Set(members.keys()), skipValuesFor: keep },
    ),
  );

  // 4. A kept record must not end up inconsistent with a group-level change.
  const dateChanged =
    req.sampleDateTime !== group.sampleDateTime;
  const reasonChanged = req.reason !== group.reason;
  const testsChanged = !sameDefinitions(req.tests, group.tests);
  for (const t of remaining.filter((x) =>
    keep.has(x.constituentId),
  )) {
    const at = { testId: t.id, constituentId: t.constituentId };
    if (dateChanged && t.sampleDateTime !== req.sampleDateTime)
      err({
        field: "consistency",
        ...at,
        message: `Substance Test ${t.id} keeps its individual changes, but the group's Sample Date/Time changes. Overwrite it, keep the group's Sample Date/Time, or remove this youth.`,
      });
    if (reasonChanged && t.reason !== req.reason)
      err({
        field: "consistency",
        ...at,
        message: `Substance Test ${t.id} keeps its individual changes, but the group's Reason changes. Overwrite it, keep the group's Reason, or remove this youth.`,
      });
    if (
      testsChanged &&
      !sameDefinitions(t.testDetails, req.tests)
    )
      err({
        field: "consistency",
        ...at,
        message: `Substance Test ${t.id} keeps its individual changes, but the group's Test(s) change. Overwrite it, keep the group's Test(s), or remove this youth.`,
      });
  }
  return errors;
}

/** Applies a Bulk Modify — group fields, test definitions, youth values,
 *  added and removed youth, conflict resolutions — in a single commit, or
 *  changes nothing and returns every error. Removed youth keep their
 *  individual test (bulkTestId cleared; Program unchanged). PROVISIONAL —
 *  pending BA confirmation of the removal behaviour. */
export function updateBulkSubstanceTestsAtomic(
  req: BulkSubstanceTestsModification,
): BulkModifyResult {
  const errors = validateBulkSubstanceTestsModification(req);
  if (errors.length) return { ok: false, errors };

  let nextTests: ProgramSubstanceTest[];
  let nextGroup: BulkSubstanceTestGroup;
  const updatedTestIds: number[] = [];
  const addedTestIds: number[] = [];
  const removedTestIds: number[] = [];
  const keptTestIds: number[] = [];
  try {
    const group = getBulkSubstanceTestGroupById(req.groupId)!;
    const members = new Map(
      group.substanceTestIds.map((id) => {
        const t = getProgramSubstanceTestById(id)!;
        return [t.constituentId, t] as const;
      }),
    );
    const resolutions = req.resolutions ?? {};
    const written = new Map<number, ProgramSubstanceTest>();
    const added: ProgramSubstanceTest[] = [];
    const linkedRevisions: Record<number, number> = {};
    const substanceTestIds: number[] = [];
    let nextId = nextTestId();

    for (const y of req.youths) {
      const existing = members.get(y.constituentId);
      if (
        existing &&
        resolutions[existing.id]?.action === "keep"
      ) {
        // Untouched; baseline unchanged so the conflict stays visible.
        keptTestIds.push(existing.id);
        substanceTestIds.push(existing.id);
        linkedRevisions[existing.id] =
          group.linkedRevisions[existing.id];
        continue;
      }
      if (existing) {
        const revision = revisionOf(existing) + 1;
        written.set(existing.id, {
          ...existing,
          sampleDateTime: req.sampleDateTime,
          reason: req.reason,
          newUse: y.newUse,
          testDetails: buildTestDetails(req.tests, y.results, {
            definitions: group.tests,
            details: existing.testDetails,
          }),
          revision,
        });
        updatedTestIds.push(existing.id);
        substanceTestIds.push(existing.id);
        linkedRevisions[existing.id] = revision;
        continue;
      }
      const record: ProgramSubstanceTest = {
        id: nextId++,
        constituentId: y.constituentId,
        programId: group.programId,
        sampleDateTime: req.sampleDateTime,
        reason: req.reason,
        newUse: y.newUse,
        testDetails: buildTestDetails(req.tests, y.results),
        ...NO_EXTRAS,
        bulkTestId: group.id,
        revision: 1,
      };
      added.push(record);
      addedTestIds.push(record.id);
      substanceTestIds.push(record.id);
      linkedRevisions[record.id] = 1;
    }
    for (const t of members.values()) {
      if (substanceTestIds.includes(t.id)) continue;
      written.set(t.id, { ...t, bulkTestId: null });
      removedTestIds.push(t.id);
    }

    nextTests = [
      ...tests.map((t) => written.get(t.id) ?? t),
      ...added,
    ];
    nextGroup = {
      ...group,
      sampleDateTime: req.sampleDateTime,
      reason: req.reason,
      tests: req.tests.map((t) => ({ ...t })),
      substanceTestIds,
      linkedRevisions,
      revision: group.revision + 1,
    };

    // Last line of defence before writing: every link consistent, one test
    // per youth, nobody moved Program, ids unique.
    const byId = new Map(nextTests.map((t) => [t.id, t]));
    const linked = substanceTestIds.map((id) => byId.get(id));
    if (
      byId.size !== nextTests.length ||
      linked.some(
        (t) =>
          !t ||
          t.bulkTestId !== group.id ||
          t.programId !== group.programId,
      ) ||
      new Set(linked.map((t) => t!.constituentId)).size !==
        linked.length ||
      removedTestIds.some(
        (id) => byId.get(id)!.bulkTestId !== null,
      ) ||
      nextTests.some((t) => {
        const before = getProgramSubstanceTestById(t.id);
        return (
          before !== undefined &&
          before.programId !== t.programId
        );
      })
    )
      throw new Error("Bulk links would be inconsistent.");
  } catch (e) {
    return {
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

  const notificationErrors = commit({
    tests: nextTests,
    bulkGroups: bulkGroups.map((g) =>
      g.id === nextGroup.id ? nextGroup : g,
    ),
  });
  return {
    ok: true,
    groupId: nextGroup.id,
    groupRevision: nextGroup.revision,
    updatedTestIds,
    addedTestIds,
    removedTestIds,
    keptTestIds,
    ...(notificationErrors.length
      ? { notificationErrors }
      : {}),
  };
}

// ─── Legacy records ─────────────────────────────────────────────────────────

/** Legacy flat Substance Tests (mockYouthProgramData.ts) that cannot be
 *  mapped to a Program: they store no programId, and assigning the youth's
 *  current Program would be a guess. They stay where they are, still read by
 *  getSubstanceTestsForProgram(); this only reports them. */
export function getUnmappedLegacySubstanceTests(): SubstanceTestRecord[] {
  return getSubstanceTests();
}