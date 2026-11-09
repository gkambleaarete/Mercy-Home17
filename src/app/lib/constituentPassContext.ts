import { useEffect, useReducer } from "react";
import { type Constituent } from "../data/mockConstituents";
import {
  getConstituentById,
  getYouthProgramEnrollments,
  subscribeYouthProgramEnrollments,
} from "../data/mockYouthProgramData";
import {
  getProgramById,
  subscribeProgramState,
} from "../data/mockProgramsData";
import type { PassRecord } from "../data/mockPassData";

// Constituent Pass context — the ONE authority for "which Youth and which
// Program does a Pass opened from a Constituent profile belong to".
//
//   Youth   = the Constituent itself (PassRecord.youthId === String(id));
//             the field keeps its "Youth" label for every eligible role.
//   Program = the Constituent's single current, ID-based enrollment
//             (mockYouthProgramData enrollments → live Program record).
//
// `Constituent.program` is display text and is never used as identity. With
// no current enrollment, more than one (there is no primary-enrollment rule
// to choose between them) or a deleted Program, the context is unavailable
// and nothing falls back to another Program.
//
// Resolved on every use (render, launch, and immediately before a write);
// nothing here is cached, so renames and enrollment changes are seen at once.

/** Saved roles that get the Pass tab. */
export const PASS_TAB_ROLES = [
  "Youth",
  "Community Care Member",
] as const;

export function isPassTabConstituent(
  c: Constituent | null | undefined,
): c is Constituent {
  return (
    !!c &&
    c.type === "Individual" &&
    (c.role === "Youth" ||
      c.role === "Community Care Member" ||
      !!c.additionalRoles?.some(
        (r) => r === "Youth" || r === "Community Care Member",
      ))
  );
}

export type PassContextUnavailableReason =
  | "no-program"
  | "ambiguous-program"
  | "program-deleted";

export interface ConstituentPassOwner {
  constituentId: number;
  /** Pass `youthId` — the Constituent ID as a string. */
  youthId: string;
  youthName: string;
}

export type ConstituentPassContext =
  | { status: "ineligible" }
  | ({
      status: "program-unavailable";
      reason: PassContextUnavailableReason;
    } & ConstituentPassOwner)
  | ({
      status: "ok";
      programId: number;
      programName: string;
    } & ConstituentPassOwner);

export const PASS_CONTEXT_UNAVAILABLE_MESSAGE =
  "A current Program could not be determined for this Constituent. Update the Constituent's Program assignment before creating a Pass.";

export function resolveConstituentPassContext(
  constituentId: number,
): ConstituentPassContext {
  const c = getConstituentById(constituentId);
  if (!isPassTabConstituent(c)) return { status: "ineligible" };
  const owner: ConstituentPassOwner = {
    constituentId: c.id,
    youthId: String(c.id),
    youthName: c.name,
  };
  const programIds = [
    ...new Set(
      getYouthProgramEnrollments()
        .filter((e) => e.constituentId === c.id && e.active)
        .map((e) => e.programId),
    ),
  ];
  if (programIds.length === 0)
    return {
      status: "program-unavailable",
      reason: "no-program",
      ...owner,
    };
  if (programIds.length > 1)
    return {
      status: "program-unavailable",
      reason: "ambiguous-program",
      ...owner,
    };
  const program = getProgramById(programIds[0]);
  if (!program)
    return {
      status: "program-unavailable",
      reason: "program-deleted",
      ...owner,
    };
  return {
    status: "ok",
    programId: program.id,
    programName: program.name,
    ...owner,
  };
}

/** Does this stored Pass belong to the (resolved, ok) context? */
export function isPassInContext(
  pass: Pick<PassRecord, "youthId" | "programId">,
  ctx: ConstituentPassContext,
): boolean {
  return (
    ctx.status === "ok" &&
    pass.youthId === ctx.youthId &&
    pass.programId === ctx.programId
  );
}

/** Resolves the context for a Constituent and re-renders when enrollments or
 *  Program state change. (A rename of the Constituent shows on the next
 *  render of the host.) `undefined` id → no context. */
export function useConstituentPassContext(
  constituentId: number | undefined,
): ConstituentPassContext | null {
  const [, bump] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const offE = subscribeYouthProgramEnrollments(bump);
    const offP = subscribeProgramState(bump);
    return () => {
      offE();
      offP();
    };
  }, []);
  return constituentId === undefined
    ? null
    : resolveConstituentPassContext(constituentId);
}
