// Pure derivation logic for Projections & Waitlist (US 17573). No React and
// no store access here — components pass data in and memoize the results.

import {
  CAMPUSES,
  RESIDENTIAL_HOMES,
  type Campus,
  type FieldHistoryEntry,
  type ProgramEnrollment,
  type ProjectionCode,
  type ResidentPlan,
  type ResidentialHome,
  type YouthType,
  type WaitlistCandidate,
  type WaitlistCategory,
  type WaitlistConnection,
  type WaitlistConnectionType,
  type PriorityRank,
} from "../data/mockProjectionsWaitlistData";
import {
  type CapacitySnapshot,
  resolveCapacityForDate,
} from "../data/mockProgramsData";

// ─── Dates ────────────────────────────────────────────────────────────────────

export interface ProjectionMonth {
  /** "YYYY-MM" */
  key: string;
  /** Short column label, e.g. "Oct" */
  label: string;
  /** Long label, e.g. "Oct 2026" */
  longLabel: string;
  /** ISO of the first day of the month */
  startIso: string;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Rolling six-month window starting with the current month. */
export function getProjectionMonths(
  today: Date,
  count = 6,
): ProjectionMonth[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(
      today.getFullYear(),
      today.getMonth() + i,
      1,
    );
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const label = MONTH_NAMES[d.getMonth()];
    return {
      key: `${d.getFullYear()}-${mm}`,
      label,
      longLabel: `${label} ${d.getFullYear()}`,
      startIso: `${d.getFullYear()}-${mm}-01`,
    };
  });
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(
  fromIso: string,
  today: Date,
): number {
  const from = parseIso(fromIso);
  const t = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return Math.max(
    0,
    Math.floor((t.getTime() - from.getTime()) / 86_400_000),
  );
}

export function currentAge(
  dobIso: string,
  today: Date,
): number | null {
  if (!dobIso) return null;
  const dob = parseIso(dobIso);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate()))
    age--;
  return age;
}

// ─── Bed projections ─────────────────────────────────────────────────────────

/** A resident (from Program Enrollment) vs. an incoming youth: a waitlist
 *  candidate (Anticipated) or a current resident moving in from another
 *  Program (Reserved, internal transition). */
export type ProjectedYouthKind = "resident" | "anticipated";

/** Where a resident month code came from. "seed" = initial prototype value
 *  (seedResidentCode); "staff" = saved by the Admissions Team. */
export type CodeSource = "seed" | "staff";

export interface ProjectedYouth {
  /** Key used for overrides/notes: "enr:<id>", "xfer:<id>" or "cand:<id>" */
  key: string;
  kind: ProjectedYouthKind;
  name: string;
  dateOfBirth: string;
  /** Resident rows only: staff-managed monthly occupancy codes. Incoming
   *  rows have no codes (empty) — see `commitment`. */
  codes: ProjectionCode[];
  /** Resident rows only: per month, where the code came from. */
  codeSources: CodeSource[];
  /** Incoming rows only: months in which this youth is counted as a
   *  Reserved / Anticipated commitment for the Program. */
  commitment: boolean[];
  /** Incoming rows only. */
  commitmentKind?: "reserved" | "anticipated";
  /** Resident with an LV (Agency Discharge) code in the window. */
  plannedDischarge: boolean;
  /** Resident with a T (Internal Transition) code in the window. */
  plannedTransition: boolean;
  /** Resident: Program of the planned internal transition, if any. */
  transitionToHomeId?: string;
  /** Anticipated youth context (light blue vs green). */
  candidateCategory?: WaitlistCategory;
  isInternalTransfer?: boolean;
  anticipatedMoveInDate?: string;
  /** Resident only: drives resident row order. */
  actualMoveInDate?: string;
  /** Anticipated youth only: External or Readmit. */
  youthType?: YouthType;
  /** Anticipated youth only: 1-based position within the Program. */
  rank?: number;
  /** Resident whose status is Transitioning. */
  transitioning?: boolean;
  /** The record this row opens in the quick-edit modal. */
  source: { kind: "candidate" | "resident"; id: string };
}

/** Per-month availability, kept as separate categories. */
export interface CapacityTotals {
  capacity: number[];
  /** Current resident rows holding a bed (occupancy numerator). */
  occupiedResidents: number[];
  /** Incoming internal transitions into this Program. */
  reserved: number[];
  /** Incoming waitlisted youth. */
  anticipated: number[];
  /** max(0, capacity − residents − reserved − anticipated). */
  open: number[];
  /** Commitments beyond capacity (shown instead of negative Open). */
  overcommitted: number[];
}

export interface HomeProjection extends CapacityTotals {
  home: ResidentialHome;
  /** Physical bed rows = the Program's capacity (largest in the window). */
  bedCount: number;
  youth: ProjectedYouth[];
}

export interface CampusProjection extends CapacityTotals {
  campus: Campus;
  homes: HomeProjection[];
}

export interface BedProjections {
  campuses: CampusProjection[];
  agency: CapacityTotals;
}

// ─── Counting policy (PROVISIONAL — pending Admissions approval) ────────────
// The 10/14/2026 revisions do not define these; each is isolated here so a
// business decision changes one helper. Current choices preserve the
// prototype's established behavior:
//  1. A resident holds a bed only in months coded S or ?. LV / T release the
//     bed in the coded month itself (as LV did before); X = open.
//  2. Codes never carry forward: each month is its own staff-managed value.
//  3. A Reserved / Anticipated commitment counts from the move month through
//     the end of the window, until actual enrollment ends the projection.

const BED_HOLDING_CODES: ProjectionCode[] = ["S", "?"];

export function residentHoldsBed(
  code: ProjectionCode,
): boolean {
  return BED_HOLDING_CODES.includes(code);
}

export function commitmentAppliesToMonth(
  moveInIso: string,
  m: ProjectionMonth,
): boolean {
  return m.key >= monthKey(moveInIso);
}

/** Initial prototype value for a resident month with no staff-entered
 *  code. Reads ONLY the seed fields (planned discharge / plans-unsure
 *  dates) — never Program activity, Transitioning status or projection
 *  edits — so planning changes cannot rewrite a code. Seed LV months are
 *  followed by seeded X; production would start from staff entry. */
export function seedResidentCode(
  e: ProgramEnrollment,
  m: ProjectionMonth,
): ProjectionCode {
  if (e.anticipatedMoveOutDate) {
    const out = monthKey(e.anticipatedMoveOutDate);
    if (m.key === out) return "LV";
    if (m.key > out) return "X";
  }
  if (e.plansUnsureFrom && m.key >= monthKey(e.plansUnsureFrom))
    return "?";
  return "S";
}

export function overrideKey(
  youthKey: string,
  month: string,
): string {
  return `${youthKey}|${month}`;
}

/** A candidate projects into a home when it has both Anticipated Program and
 *  Anticipated Move-In Date, isn't Closed or in closure, and hasn't already
 *  been enrolled (enrolled youth are projected from their enrollment). */
export function isProjectable(
  c: WaitlistCandidate,
  enrolledLeadIds: Set<string>,
  closedCaseIds: ReadonlySet<string> = new Set(),
): boolean {
  return (
    !!c.anticipatedProgram &&
    !!c.anticipatedMoveInDate &&
    c.category !== "Closed" &&
    !closedCaseIds.has(c.id) &&
    !enrolledLeadIds.has(c.id)
  );
}

export function getEnrolledLeadIds(
  enrollments: ProgramEnrollment[],
): Set<string> {
  return new Set(
    enrollments
      .filter((e) => e.leadId && e.actualMoveInDate)
      .map((e) => e.leadId as string),
  );
}

function sumInto(target: number[], source: number[]) {
  source.forEach((v, i) => (target[i] += v));
}

/** Anticipated youth order within a Program: manual rank first, then
 *  Anticipated Move-In Date, then name. */
function byRank(ranks: Record<string, number>) {
  return (a: ProjectedYouth, b: ProjectedYouth) => {
    const ra = ranks[a.key] ?? Number.POSITIVE_INFINITY;
    const rb = ranks[b.key] ?? Number.POSITIVE_INFINITY;
    if (ra !== rb) return ra - rb;
    return (
      (a.anticipatedMoveInDate ?? "").localeCompare(
        b.anticipatedMoveInDate ?? "",
      ) || a.name.localeCompare(b.name)
    );
  };
}

/** Current residents: actual move-in ascending; name, then key, as stable
 *  tie-breakers. */
function byMoveIn(a: ProjectedYouth, b: ProjectedYouth) {
  return (
    (a.actualMoveInDate ?? "").localeCompare(
      b.actualMoveInDate ?? "",
    ) ||
    a.name.localeCompare(b.name) ||
    a.key.localeCompare(b.key)
  );
}

/** One youth counted once per Program/month, in the order resident >
 *  reserved > anticipated. */
function identityOf(
  y: ProjectedYouth,
  enrollmentLead: Map<string, string>,
): string {
  if (y.source.kind === "candidate")
    return `lead:${y.source.id}`;
  const lead = enrollmentLead.get(y.source.id);
  return lead ? `lead:${lead}` : `enr:${y.source.id}`;
}

export function emptyTotals(n: number): CapacityTotals {
  const z = () => Array.from({ length: n }, () => 0);
  return {
    capacity: z(),
    occupiedResidents: z(),
    reserved: z(),
    anticipated: z(),
    open: z(),
    overcommitted: z(),
  };
}

function addTotals(
  target: CapacityTotals,
  src: CapacityTotals,
) {
  sumInto(target.capacity, src.capacity);
  sumInto(target.occupiedResidents, src.occupiedResidents);
  sumInto(target.reserved, src.reserved);
  sumInto(target.anticipated, src.anticipated);
  sumInto(target.open, src.open);
  sumInto(target.overcommitted, src.overcommitted);
}

/** Program/month availability from the separate categories. Overcommitment
 *  is reported in its own field; Open never goes negative. */
export function computeAvailability(
  capacity: number,
  occupiedResidents: number,
  reserved: number,
  anticipated: number,
): { open: number; overcommitted: number } {
  const raw =
    capacity - occupiedResidents - reserved - anticipated;
  return {
    open: Math.max(0, raw),
    overcommitted: Math.max(0, -raw),
  };
}

export function buildBedProjections(args: {
  months: ProjectionMonth[];
  enrollments: ProgramEnrollment[];
  candidates: WaitlistCandidate[];
  residentPlans: Record<string, ResidentPlan>;
  ranks: Record<string, number>;
  overrides: Record<string, ProjectionCode>;
  capacitySnapshots: CapacitySnapshot[];
  todayIso: string;
  /** Cases in closure (Closing List or finalized) — never projected. */
  closedCaseIds?: ReadonlySet<string>;
  /** Defaults to the business-ordered RESIDENTIAL_HOMES (tests inject). */
  homes?: ResidentialHome[];
}): BedProjections {
  const {
    months,
    enrollments,
    candidates,
    residentPlans,
    ranks,
    overrides,
    capacitySnapshots,
    todayIso,
    closedCaseIds = new Set<string>(),
    homes: allHomes = RESIDENTIAL_HOMES,
  } = args;
  const isCurrent = (e: ProgramEnrollment) =>
    e.actualMoveInDate <= todayIso &&
    (!e.actualMoveOutDate || e.actualMoveOutDate > todayIso);
  const enrolledLeadIds = getEnrolledLeadIds(enrollments);
  const enrollmentLead = new Map(
    enrollments
      .filter((e) => e.leadId)
      .map((e) => [e.id, e.leadId as string]),
  );

  const homeProjection = (
    home: ResidentialHome,
  ): HomeProjection => {
    const residents: ProjectedYouth[] = enrollments
      .filter((e) => e.homeId === home.id && isCurrent(e))
      .map((e) => {
        const key = `enr:${e.id}`;
        const plan = residentPlans[e.id];
        const codeSources = months.map((m): CodeSource =>
          overrideKey(key, m.key) in overrides
            ? "staff"
            : "seed",
        );
        const codes = months.map((m, i) =>
          codeSources[i] === "staff"
            ? overrides[overrideKey(key, m.key)]
            : seedResidentCode(e, m),
        );
        const transitionTo =
          plan?.anticipatedProgram &&
          plan.anticipatedProgram !== e.homeId
            ? plan.anticipatedProgram
            : undefined;
        return {
          key,
          kind: "resident" as const,
          name: e.youthName,
          dateOfBirth: e.dateOfBirth,
          codes,
          codeSources,
          commitment: [],
          plannedDischarge: codes.includes("LV"),
          plannedTransition: codes.includes("T"),
          transitionToHomeId: transitionTo,
          actualMoveInDate: e.actualMoveInDate,
          transitioning: plan?.status === "Transitioning",
          source: { kind: "resident" as const, id: e.id },
        };
      })
      .sort(byMoveIn);

    // Current residents of ANOTHER Program with this Program as their
    // Anticipated Program (internal transition) → Reserved. A plan naming
    // the youth's own Program is not a move and reserves nothing.
    const transfersIn: ProjectedYouth[] = enrollments
      .filter((e) => {
        const plan = residentPlans[e.id];
        return (
          isCurrent(e) &&
          e.homeId !== home.id &&
          plan?.anticipatedProgram === home.id &&
          !!plan.anticipatedMoveInDate
        );
      })
      .map((e) => {
        const moveIn = residentPlans[e.id]
          .anticipatedMoveInDate as string;
        return {
          key: `xfer:${e.id}`,
          kind: "anticipated" as const,
          name: e.youthName,
          dateOfBirth: e.dateOfBirth,
          codes: [],
          codeSources: [],
          commitment: months.map((m) =>
            commitmentAppliesToMonth(moveIn, m),
          ),
          commitmentKind: "reserved" as const,
          plannedDischarge: false,
          plannedTransition: false,
          isInternalTransfer: true,
          anticipatedMoveInDate: moveIn,
          source: { kind: "resident" as const, id: e.id },
        };
      });

    const anticipated: ProjectedYouth[] = candidates
      .filter(
        (c) =>
          c.anticipatedProgram === home.id &&
          isProjectable(c, enrolledLeadIds, closedCaseIds),
      )
      .map((c): ProjectedYouth => {
        const moveIn = c.anticipatedMoveInDate as string;
        return {
          key: `cand:${c.id}`,
          kind: "anticipated" as const,
          name: c.name,
          dateOfBirth: c.dateOfBirth,
          codes: [],
          codeSources: [],
          commitment: months.map((m) =>
            commitmentAppliesToMonth(moveIn, m),
          ),
          commitmentKind: "anticipated",
          plannedDischarge: false,
          plannedTransition: false,
          candidateCategory: c.category,
          isInternalTransfer: c.isInternalTransfer,
          anticipatedMoveInDate: moveIn,
          youthType: c.youthType,
          source: { kind: "candidate" as const, id: c.id },
        };
      })
      .concat(transfersIn)
      .sort(byRank(ranks))
      .map((y, i) => ({ ...y, rank: i + 1 }));

    const youth = [...residents, ...anticipated];
    const capacity = months.map((m) => {
      if (home.programId != null) {
        const snap = resolveCapacityForDate(
          home.programId,
          capacitySnapshots,
          m.startIso,
        );
        if (snap) return snap.capacity;
      }
      return home.defaultCapacity;
    });

    const totals = emptyTotals(months.length);
    totals.capacity = capacity;
    months.forEach((_, i) => {
      const counted = new Set<string>();
      const count = (y: ProjectedYouth) => {
        const id = identityOf(y, enrollmentLead);
        if (counted.has(id)) return false;
        counted.add(id);
        return true;
      };
      for (const y of residents)
        if (residentHoldsBed(y.codes[i]) && count(y))
          totals.occupiedResidents[i]++;
      for (const y of anticipated)
        if (
          y.commitmentKind === "reserved" &&
          y.commitment[i] &&
          count(y)
        )
          totals.reserved[i]++;
      for (const y of anticipated)
        if (
          y.commitmentKind === "anticipated" &&
          y.commitment[i] &&
          count(y)
        )
          totals.anticipated[i]++;
      const a = computeAvailability(
        capacity[i],
        totals.occupiedResidents[i],
        totals.reserved[i],
        totals.anticipated[i],
      );
      totals.open[i] = a.open;
      totals.overcommitted[i] = a.overcommitted;
    });

    return {
      home,
      bedCount: Math.max(0, ...capacity),
      youth,
      ...totals,
    };
  };

  // Campus/agency totals are sums of the Program figures (so every
  // subtotal uses the same derivation; a Program's overcommitment is never
  // netted against another Program's open beds).
  const agency = emptyTotals(months.length);
  const campuses = CAMPUSES.map((campus) => {
    const homes = allHomes
      .filter((h) => h.campus === campus)
      .map(homeProjection);
    const totals = emptyTotals(months.length);
    homes.forEach((h) => addTotals(totals, h));
    addTotals(agency, totals);
    return { campus, homes, ...totals };
  });

  return { campuses, agency };
}

export function occupancyPercent(
  occupied: number,
  capacity: number,
): number {
  return capacity > 0
    ? (Math.min(occupied, capacity) / capacity) * 100
    : 0;
}

/** Projected Occupancy display: always two decimals, e.g. "87.50%". */
export function formatOccupancy(
  occupied: number,
  capacity: number,
): string {
  return `${occupancyPercent(occupied, capacity).toFixed(2)}%`;
}

/** Moves `key` to 1-based `rank` in `order` and returns contiguous ranks
 *  (1..n) for the whole Program, so nobody renumbers rows by hand. */
export function normalizeRanks(
  order: string[],
  key: string,
  rank: number,
): Record<string, number> {
  const rest = order.filter((k) => k !== key);
  const at =
    Math.min(Math.max(1, Math.round(rank)), order.length) - 1;
  rest.splice(at, 0, key);
  return Object.fromEntries(rest.map((k, i) => [k, i + 1]));
}

// ─── Waitlist ────────────────────────────────────────────────────────────────

/** Closing-list state derived purely from the candidate's closure date. */
export interface ClosingState {
  /** "grace" = within the 30-day window; "eligible" = past it. */
  state: "grace" | "eligible";
  /** Days remaining (only present when state === "grace"). */
  daysLeft?: number;
}

const CLOSING_GRACE_DAYS = 30;

/**
 * Returns closing-list state for a candidate whose `closedAt` is set,
 * or null if they have no closure date.
 */
export function getClosingState(
  candidate: WaitlistCandidate,
  today: Date,
): ClosingState | null {
  if (!candidate.closedAt) return null;
  const closedDate = new Date(candidate.closedAt);
  const todayMs = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const closedMs = Date.UTC(
    closedDate.getFullYear(),
    closedDate.getMonth(),
    closedDate.getDate(),
  );
  const days = Math.max(
    0,
    Math.round((todayMs - closedMs) / 86_400_000),
  );
  if (days >= CLOSING_GRACE_DAYS) return { state: "eligible" };
  return { state: "grace", daysLeft: CLOSING_GRACE_DAYS - days };
}

/** Active waitlist = everyone not yet formally enrolled and not in
 *  closure. A case leaves immediately on entering closure (revised
 *  lifecycle); it stays reachable on the Closing List and, once finalized,
 *  in the Admissions Closed category. Nothing is deleted here. */
export function getActiveWaitlist(
  candidates: WaitlistCandidate[],
  enrollments: ProgramEnrollment[],
  closedCaseIds: ReadonlySet<string> = new Set(),
): WaitlistCandidate[] {
  const enrolled = getEnrolledLeadIds(enrollments);
  return candidates.filter(
    (c) =>
      !enrolled.has(c.id) &&
      c.category !== "Closed" &&
      !closedCaseIds.has(c.id),
  );
}

export type ConnectionDates = Partial<
  Record<WaitlistConnectionType, string>
>;

/** Most recent non-cancelled Connection date per type, per youth. */
export function indexConnectionDates(
  connections: WaitlistConnection[],
): Record<string, ConnectionDates> {
  const out: Record<string, ConnectionDates> = {};
  for (const c of connections) {
    if (c.status === "Cancelled") continue;
    const entry = (out[c.youthId] ??= {});
    if (
      !entry[c.type] ||
      c.startDate > (entry[c.type] as string)
    )
      entry[c.type] = c.startDate;
  }
  return out;
}

/** Global waitlist filters (column filters apply on top in the table). */
export interface WaitlistCriteria {
  search: string;
  ageGroup: string; // "all" | AgeGroup
  category: string; // "all" | WaitlistCategory
  caseManager: string; // "all" | name
  youthType: string; // "all" | YouthType
  /** Inclusive Referral Date range, ISO; empty = open-ended. */
  referralFrom: string;
  referralTo: string;
}

/** Error text when the Referral Date range is inverted, else "". */
export function referralRangeError(
  fromIso: string,
  toIso: string,
): string {
  return fromIso && toIso && fromIso > toIso
    ? "Referral Date From must be on or before To."
    : "";
}

export function filterWaitlist(
  list: WaitlistCandidate[],
  f: WaitlistCriteria,
): WaitlistCandidate[] {
  const q = f.search.trim().toLowerCase();
  // An inverted range is reported in the UI and not applied.
  const useRange = !referralRangeError(
    f.referralFrom,
    f.referralTo,
  );
  return list.filter(
    (c) =>
      (f.ageGroup === "all" || c.ageGroup === f.ageGroup) &&
      (f.category === "all" || c.category === f.category) &&
      (f.caseManager === "all" ||
        c.caseManager === f.caseManager) &&
      (f.youthType === "all" || c.youthType === f.youthType) &&
      (!useRange ||
        ((!f.referralFrom ||
          c.referralDate >= f.referralFrom) &&
          (!f.referralTo || c.referralDate <= f.referralTo))) &&
      (!q ||
        c.name.toLowerCase().includes(q) ||
        c.caseManager.toLowerCase().includes(q)),
  );
}

export type WaitlistOrder = "referral" | "priority";

const PRIORITY_WEIGHT: Record<PriorityRank, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

/** Default: Referral Date ascending (first-in, first-served). "priority"
 *  explicitly moves candidates with a manually set Priority Rank ahead,
 *  keeping referral order within each rank and for everyone else. */
export function sortWaitlist(
  list: WaitlistCandidate[],
  order: WaitlistOrder,
): WaitlistCandidate[] {
  return [...list].sort((a, b) => {
    if (order === "priority") {
      const pa = a.priorityRank
        ? PRIORITY_WEIGHT[a.priorityRank]
        : 3;
      const pb = b.priorityRank
        ? PRIORITY_WEIGHT[b.priorityRank]
        : 3;
      if (pa !== pb) return pa - pb;
    }
    return (
      a.referralDate.localeCompare(b.referralDate) ||
      a.name.localeCompare(b.name)
    );
  });
}

export interface WaitlistValidationErrors {
  delayReason?: string;
  nextReviewDate?: string;
  anticipatedMoveInDate?: string;
}

export function validateWaitlistCandidate(
  c: WaitlistCandidate,
): WaitlistValidationErrors {
  const errors: WaitlistValidationErrors = {};
  if (c.category === "Delayed") {
    if (!c.delayReason)
      errors.delayReason =
        "Delay Reason is required when Category is Delayed.";
    if (!c.nextReviewDate)
      errors.nextReviewDate =
        "Next Review Date is required when Category is Delayed.";
  }
  return errors;
}

/** Delayed record saved before validation existed (seed/legacy data). */
export function isMissingDelayDetails(
  c: WaitlistCandidate,
): boolean {
  return (
    c.category === "Delayed" &&
    (!c.delayReason || !c.nextReviewDate)
  );
}

const TRACKED_FIELDS: {
  field: FieldHistoryEntry["field"];
  get: (c: WaitlistCandidate) => string;
}[] = [
  { field: "Category", get: (c) => c.category },
  { field: "Delay Reason", get: (c) => c.delayReason ?? "" },
  {
    field: "Anticipated Program",
    get: (c) => c.anticipatedProgram ?? "",
  },
  {
    field: "Anticipated Move-In Date",
    get: (c) => c.anticipatedMoveInDate ?? "",
  },
];

/** Applies an individual edit: resets categoryEnteredAt on a Category
 *  change and appends Field History entries for
 *  the four tracked fields. */
export function applyWaitlistEdit(
  prev: WaitlistCandidate,
  next: WaitlistCandidate,
  changedBy: string,
  now: Date,
  formatValue: (
    field: FieldHistoryEntry["field"],
    value: string,
  ) => string,
  comment?: string,
): WaitlistCandidate {
  const nowIso = now.toISOString();
  const todayIso = nowIso.slice(0, 10);
  const result: WaitlistCandidate = { ...next };

  // The closure timer lives in caseClosureStore (started once, never
  // reset by unrelated saves).
  if (prev.category !== next.category) {
    result.categoryEnteredAt = todayIso;
  }
  if (next.category !== "Delayed") {
    result.delayReason = undefined;
  }

  const entries: FieldHistoryEntry[] = TRACKED_FIELDS.filter(
    (t) => t.get(prev) !== t.get(result),
  ).map((t, i) =>
    historyEntry(
      prev.id,
      nowIso,
      i,
      t.field,
      formatValue(t.field, t.get(prev)),
      formatValue(t.field, t.get(result)),
      changedBy,
      comment,
    ),
  );

  result.history = [...entries, ...prev.history];
  return result;
}

const PROJECTION_FIELDS: FieldHistoryEntry["field"][] = [
  "Anticipated Program",
  "Anticipated Move-In Date",
];

function historyEntry(
  ownerId: string,
  nowIso: string,
  i: number,
  field: FieldHistoryEntry["field"],
  oldValue: string,
  newValue: string,
  changedBy: string,
  comment?: string,
): FieldHistoryEntry {
  return {
    id: `${ownerId}-${nowIso}-${i}`,
    field,
    oldValue,
    newValue,
    changedBy,
    changedAt: nowIso,
    // The comment explains a projection change, so it is kept on those
    // entries only.
    ...(comment && PROJECTION_FIELDS.includes(field)
      ? { comment }
      : {}),
  };
}

/** A comment is required when an EXISTING projection value changes
 *  (setting a first value does not need one). Cancelling — clearing an
 *  existing value — counts as a change. */
export function projectionCommentRequired(
  prev: {
    anticipatedProgram?: string;
    anticipatedMoveInDate?: string;
  },
  next: {
    anticipatedProgram?: string;
    anticipatedMoveInDate?: string;
  },
): boolean {
  return (
    (!!prev.anticipatedProgram &&
      prev.anticipatedProgram !== next.anticipatedProgram) ||
    (!!prev.anticipatedMoveInDate &&
      prev.anticipatedMoveInDate !== next.anticipatedMoveInDate)
  );
}

export function hasProjection(p: {
  anticipatedProgram?: string;
  anticipatedMoveInDate?: string;
}): boolean {
  return !!p.anticipatedProgram || !!p.anticipatedMoveInDate;
}

export const EMPTY_RESIDENT_PLAN: ResidentPlan = {
  status: "Active",
  history: [],
};

/** Resident counterpart of applyWaitlistEdit: history for Status and the
 *  two projection fields. */
export function applyResidentPlanEdit(
  enrollmentId: string,
  prev: ResidentPlan,
  next: ResidentPlan,
  changedBy: string,
  now: Date,
  formatValue: (
    field: FieldHistoryEntry["field"],
    value: string,
  ) => string,
  comment?: string,
): ResidentPlan {
  const nowIso = now.toISOString();
  const tracked: {
    field: FieldHistoryEntry["field"];
    get: (p: ResidentPlan) => string;
  }[] = [
    { field: "Status", get: (p) => p.status },
    {
      field: "Anticipated Program",
      get: (p) => p.anticipatedProgram ?? "",
    },
    {
      field: "Anticipated Move-In Date",
      get: (p) => p.anticipatedMoveInDate ?? "",
    },
  ];
  const entries = tracked
    .filter((t) => t.get(prev) !== t.get(next))
    .map((t, i) =>
      historyEntry(
        enrollmentId,
        nowIso,
        i,
        t.field,
        formatValue(t.field, t.get(prev)),
        formatValue(t.field, t.get(next)),
        changedBy,
        comment,
      ),
    );
  return { ...next, history: [...entries, ...prev.history] };
}

// ─── Access model ────────────────────────────────────────────────────────────
// UI-level only — real enforcement belongs to Salesforce sharing/FLS.

export type ProjectionsRole =
  | "Admissions Team"
  | "System Administrator"
  | "Program Director"
  | "Campus Leadership"
  | "Quality Improvement";

export const PROJECTIONS_ROLES: ProjectionsRole[] = [
  "Admissions Team",
  "System Administrator",
  "Program Director",
  "Campus Leadership",
  "Quality Improvement",
];

export interface ProjectionsPermissions {
  /** Notes, ranking and resident projection fields. */
  canEditProjections: boolean;
  canEditWaitlist: boolean;
  /** Monthly occupancy codes (AC55): Admissions Team only. System
   *  Administrators keep their other write rights but see codes read-only. */
  canEditOccupancyCodes: boolean;
}

export function getProjectionsPermissions(
  role: ProjectionsRole,
): ProjectionsPermissions {
  const canEdit =
    role === "Admissions Team" ||
    role === "System Administrator";
  return {
    canEditProjections: canEdit,
    canEditWaitlist: canEdit,
    canEditOccupancyCodes: role === "Admissions Team",
  };
}