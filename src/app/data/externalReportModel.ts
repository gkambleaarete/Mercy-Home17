// One resolved model of an External Transition Summary report (US 20103),
// used by both the screen and the printout so they always agree.
//
// Prototype interpretation (needs business confirmation):
//   • Draft reads the current verified ITPs/goals live.
//   • Ready for Review captures the complete report version (content + ITPs
//     + goals) in the same write as the status change.
//   • Ready for Review, Reviewed and Finalized show that captured version.
//   • A Finalized record saved before capture existed has no snapshot: its
//     saved content is shown, and historical ITP/goal data is reported as
//     unavailable — live data is never presented as the finalized version.
//   • A damaged snapshot is reported as an error; nothing falls back.

import type {
  TransitionSummaryNarrative,
  TransitionSummaryProgram,
  TransitionSummaryStaff,
  TransitionSummaryStatus,
} from "./mockTransitionSummary";
import type {
  ExternalTransitionSummaryContent,
  ExternalTransitionSummaryRecord,
  WorkflowEvent,
} from "./transitionSummaryStore";
import {
  goalsForItp,
  isItpGoalStorageUnreadable,
  itpsForYouth,
  orderGoalHierarchy,
  type ItpGoal,
} from "./itpGoalStore";

export interface ReportGoal {
  id: string;
  goal: string;
  outcomeDomain: string;
  startDate: string;
  targetEndDate: string;
  endDate: string;
  status: string;
  progress?: number;
  intermediate: boolean;
}

export interface ReportPlan {
  id: number;
  status: string;
  isFinalized: boolean;
  itpDate: string;
  startedDate: string;
  /** The plan points at a sample ITP workspace whose goals aren't linked. */
  hasUnlinkedWorkspace: boolean;
  goals: ReportGoal[];
}

export type ReportItp =
  | { state: "ok"; plans: ReportPlan[] }
  | { state: "unreadable" }
  | { state: "historical-unavailable" };

export interface ExternalReportModel {
  /** live = current data (Draft); captured = the version captured at Ready
   *  for Review; legacy = Finalized before capture existed. */
  source: "live" | "captured" | "legacy";
  status: TransitionSummaryStatus;
  content: ExternalTransitionSummaryContent;
  itp: ReportItp;
  capturedAt?: string;
  events: WorkflowEvent[];
}

export type ResolvedReport =
  | { ok: true; model: ExternalReportModel }
  | { ok: false; message: string };

interface CapturedSnapshot {
  schema: 1;
  summaryId: string;
  youthId: string;
  capturedAt: string;
  content: ExternalTransitionSummaryContent;
  itp: { state: "ok"; plans: ReportPlan[] };
}

const toReportGoal = (g: ItpGoal, intermediate: boolean): ReportGoal => ({
  id: g.id,
  goal: g.goal,
  outcomeDomain: g.outcomeDomain,
  startDate: g.startDate,
  targetEndDate: g.targetEndDate,
  endDate: g.endDate,
  status: g.status,
  ...(typeof g.progress === "number" ? { progress: g.progress } : {}),
  intermediate,
});

/** Current verified ITPs and their goals for a youth. */
export function liveItp(
  goalSnapshot: Parameters<typeof goalsForItp>[0],
  youthId: string,
): ReportItp {
  if (isItpGoalStorageUnreadable()) return { state: "unreadable" };
  return {
    state: "ok",
    plans: itpsForYouth(youthId).map((i) => ({
      id: i.id,
      status: i.status,
      isFinalized: i.isFinalized || i.status === "Finalized",
      itpDate: i.itpDate,
      startedDate: i.startedDate,
      hasUnlinkedWorkspace: !!i.itpWorkspaceId,
      goals: orderGoalHierarchy(goalsForItp(goalSnapshot, i.id, youthId)).map(
        ({ goal, intermediate }) => toReportGoal(goal, intermediate),
      ),
    })),
  };
}

/** The complete report version to store at Ready for Review. Fails rather
 *  than capturing incomplete data. */
export function captureSnapshot(
  record: ExternalTransitionSummaryRecord,
  goalSnapshot: Parameters<typeof goalsForItp>[0],
  now: Date,
): { ok: true; snapshot: CapturedSnapshot } | { ok: false; message: string } {
  const itp = liveItp(goalSnapshot, record.youthId);
  if (itp.state !== "ok")
    return {
      ok: false,
      message: "ITP goal data can't be read right now, so this report version can't be captured.",
    };
  return {
    ok: true,
    snapshot: structuredClone({
      schema: 1,
      summaryId: record.id,
      youthId: record.youthId,
      capturedAt: now.toISOString(),
      content: record.content,
      itp,
    }),
  };
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const strs = (v: Record<string, unknown>, keys: string[]) =>
  keys.every((k) => typeof v[k] === "string");

function isGoalShape(v: unknown): boolean {
  return (
    isObj(v) &&
    strs(v, ["id", "goal", "outcomeDomain", "startDate", "targetEndDate", "endDate", "status"]) &&
    typeof v.intermediate === "boolean"
  );
}
function isPlanShape(v: unknown): boolean {
  return (
    isObj(v) &&
    Number.isInteger(v.id) &&
    strs(v, ["status", "itpDate", "startedDate"]) &&
    Array.isArray(v.goals) &&
    v.goals.every(isGoalShape)
  );
}
function isContentShape(v: unknown): v is ExternalTransitionSummaryContent {
  return (
    isObj(v) &&
    strs(v, ["youthName", "dateOfBirth", "admissionDate", "transitionDate", "lengthOfStay", "generatedDate", "finalizedBy", "finalizedDate"]) &&
    Array.isArray(v.programHistory) &&
    Array.isArray(v.keyStaffHistory) &&
    Array.isArray(v.narratives)
  );
}

function readSnapshot(
  s: unknown,
  record: ExternalTransitionSummaryRecord,
): CapturedSnapshot | null {
  if (
    !isObj(s) ||
    s.schema !== 1 ||
    s.summaryId !== record.id ||
    s.youthId !== record.youthId ||
    typeof s.capturedAt !== "string" ||
    !isContentShape(s.content) ||
    !isObj(s.itp) ||
    s.itp.state !== "ok" ||
    !Array.isArray(s.itp.plans) ||
    !s.itp.plans.every(isPlanShape)
  )
    return null;
  return s as unknown as CapturedSnapshot;
}

/** Shown after the actor name: the prototype has no sign-in, so the actor
 *  is its fixed current-user constant, not an authenticated reviewer. */
export const PROTOTYPE_ACTOR_NOTE = "prototype user";

/** MM/DD/YYYY of an ISO timestamp ("" if invalid). */
function mdy(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}

/** Audit overlay: Finalized By / Finalized Date come from the recorded
 *  Finalized event (its own timestamp and actor). The captured or saved
 *  content is not changed; without an event, saved values are kept as they
 *  are (legacy records), and nothing is invented. */
function withFinalization(
  content: ExternalTransitionSummaryContent,
  events: WorkflowEvent[],
): ExternalTransitionSummaryContent {
  const fin = [...events].reverse().find((e) => e.action === "Finalized");
  if (!fin) return content;
  return {
    ...content,
    finalizedBy: fin.actor ? `${fin.actor} (${PROTOTYPE_ACTOR_NOTE})` : "",
    finalizedDate: mdy(fin.at),
  };
}

/** The report to show/print for a record. */
export function resolveExternalReport(
  record: ExternalTransitionSummaryRecord,
  goalSnapshot: Parameters<typeof goalsForItp>[0],
): ResolvedReport {
  const events = record.workflow?.events ?? [];
  if (record.status === "Draft")
    return {
      ok: true,
      model: {
        source: "live",
        status: record.status,
        content: record.content,
        itp: liveItp(goalSnapshot, record.youthId),
        events,
      },
    };
  const raw = record.workflow?.snapshot;
  if (raw === undefined && record.status === "Finalized")
    return {
      ok: true,
      model: {
        source: "legacy",
        status: record.status,
        content: withFinalization(record.content, events),
        itp: { state: "historical-unavailable" },
        events,
      },
    };
  const snap = readSnapshot(raw, record);
  if (!snap)
    return {
      ok: false,
      message:
        "This report's captured version can't be read, so it isn't shown. The saved record has not been changed.",
    };
  return {
    ok: true,
    model: {
      source: "captured",
      status: record.status,
      content: withFinalization(snap.content, events),
      itp: snap.itp,
      capturedAt: snap.capturedAt,
      events,
    },
  };
}

export type { TransitionSummaryNarrative, TransitionSummaryProgram, TransitionSummaryStaff };