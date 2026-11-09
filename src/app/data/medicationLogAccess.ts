import { useSyncExternalStore } from "react";
import {
  CURRENT_USER_CONSTITUENT_ID,
  CURRENT_USER_IS_SYSTEM_ADMIN,
  todayIso,
} from "./mockProgramsData";
import {
  getProgramStaffAssignments,
  programIdsForStaff,
} from "./programStaffAssignmentStore";

// Medication access — the ONE adapter every medication access decision goes
// through: which Programs the user may see and which capabilities they hold.
// Components and the log store ask it at the moment an action runs.
//
// PROTOTYPE CONVENTION, NOT SECURITY: the app has no authorization system;
// it uses the current-user flags in mockProgramsData. This runs in the
// browser and is not production access control. An explicitly empty Program
// list means NO records — never unrestricted access.

export type AuthorizedProgramScope =
  | { kind: "all" }
  | { kind: "programs"; programIds: number[] };

export interface MedicationLogAccess {
  scope: AuthorizedProgramScope;
  capabilities: ReadonlySet<string>;
  user: { id: string | null; name: string };
}

/** Separate capabilities — Program membership grants none of the others. */
export type MedicationLogRole = "System Admin" | "Standard Staff";

/** Prototype role → capability mapping. Delete and audit are System Admin
 *  only; an assignment to a Program grants the Standard Staff set for that
 *  Program, never more, whatever the staff title. */
export const ROLE_CAPABILITIES: Record<
  MedicationLogRole,
  readonly string[]
> = {
  "System Admin": [
    "viewLogs",
    "deleteLog",
    "viewAudit",
    "viewAttestations",
    "submitCount",
  ],
  "Standard Staff": ["viewLogs", "viewAttestations", "submitCount"],
};

// The prototype's current user. The constituent id is how assignment-based
// access identifies them — never their display name. It is null until the
// app provides a current-user constituent id (see mockProgramsData).
/** Prototype default for the signed-in demo staff member's display name. */
const DEMO_USER_NAME_FALLBACK = "Sohan Jadhavrao";

let identity = {
  isSystemAdmin: CURRENT_USER_IS_SYSTEM_ADMIN,
  constituentId: CURRENT_USER_CONSTITUENT_ID as number | null,
};

let override: Partial<MedicationLogAccess> | null = null;
const _listeners = new Set<() => void>();
let _version = 0;

function notify() {
  _version++;
  _listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

function getVersion() {
  return _version;
}

/**
 * Programs the current (non-admin) user may see: those with a recorded staff
 * assignment that is current today, resolved through the user's constituent
 * id and the shared assignment records. No identity, or unreadable
 * assignments, means no Programs.
 */
function assignedProgramIds(): number[] {
  if (identity.constituentId === null) return [];
  const read = getProgramStaffAssignments();
  if (read.status !== "ok") return [];
  return programIdsForStaff(
    read.assignments,
    identity.constituentId,
    todayIso(),
  );
}

/** Current access, read fresh every time (never a cached copy). */
export function getMedicationLogAccess(): MedicationLogAccess {
  const role: MedicationLogRole = identity.isSystemAdmin
    ? "System Admin"
    : "Standard Staff";
  return {
    scope:
      override?.scope ??
      (identity.isSystemAdmin
        ? { kind: "all" }
        : { kind: "programs", programIds: assignedProgramIds() }),
    capabilities: override?.capabilities ?? new Set(ROLE_CAPABILITIES[role]),
    user: override?.user ?? {
      id:
        identity.constituentId === null
          ? null
          : String(identity.constituentId),
      name: DEMO_USER_NAME_FALLBACK,
    },
  };
}

/** Review seam: force the access (null restores the user's own). */
export function setMedicationLogAccess(
  access: Partial<MedicationLogAccess> | null,
): void {
  override = access;
  notify();
}

/** Test support: change who the current user is (null restores defaults). */
export function __setMedicationLogUserForTest(
  next: {
    isSystemAdmin?: boolean;
    constituentId?: number | null;
  } | null,
): void {
  identity = {
    isSystemAdmin:
      next?.isSystemAdmin ?? CURRENT_USER_IS_SYSTEM_ADMIN,
    constituentId:
      next?.constituentId === undefined
        ? CURRENT_USER_CONSTITUENT_ID
        : next.constituentId,
  };
  override = null;
  notify();
}

// ─── Med Review actions (US 20128) ─────────────────────────────────────────
// ONE table says which existing capabilities each Med Review Hub / Med
// Documentation / Count action needs, so the UI and the shared services
// (medReviewStore, submitCountBatch) apply the same rule.
//
// `established: true` — the capability already governs that kind of action
// elsewhere in Medications (cited in `where`). `established: false` — the
// app defines NO policy for the action yet; the entry is a PROVISIONAL,
// restrictive mapping onto existing capabilities (a read-only user can never
// perform it) and must be confirmed or replaced by the business. No new
// capability names are introduced, and an action is never allowed by default.
export type ReviewAction =
  | "viewReviews"
  | "viewAttestationDetails"
  | "exportReviews"
  | "recordCount"
  | "createReviewLog"
  | "editReviewLog"
  | "reviewDocumentation"
  | "saveCorrection";

export interface ReviewActionRule {
  /** Every one of these existing capabilities is required. */
  requires: readonly string[];
  established: boolean;
  where: string;
}

export const REVIEW_ACTION_POLICY: Record<
  ReviewAction,
  ReviewActionRule
> = {
  viewReviews: {
    requires: ["viewLogs"],
    established: true,
    where:
      "viewLogs gates the medication log views (MedicationLogsWorkspace) and deleteMedicationLog",
  },
  viewAttestationDetails: {
    requires: ["viewAttestations"],
    established: true,
    where:
      "viewAttestations gates attestation details in MedicationLogsWorkspace",
  },
  exportReviews: {
    requires: ["viewLogs"],
    established: true,
    where:
      "no separate export capability exists; an export contains only rows the user may view",
  },
  recordCount: {
    requires: ["submitCount"],
    established: true,
    where:
      "submitCountBatch (service) and MedicationCountWorkspace / CountView (UI)",
  },
  createReviewLog: {
    requires: ["viewLogs", "submitCount"],
    established: false,
    where: "no policy defined — provisional",
  },
  editReviewLog: {
    requires: ["viewLogs", "submitCount"],
    established: false,
    where: "no policy defined — provisional",
  },
  reviewDocumentation: {
    requires: ["viewLogs", "submitCount"],
    established: false,
    where: "no policy defined — provisional",
  },
  saveCorrection: {
    requires: ["viewLogs", "submitCount"],
    established: false,
    where:
      "no policy defined — provisional; grants no attestation or log-editing right",
  },
};

/** Whether the access object permits a Med Review action (Program scope is
 *  checked separately, per record). */
export function canReviewAction(
  access: MedicationLogAccess,
  action: ReviewAction,
): boolean {
  return REVIEW_ACTION_POLICY[action].requires.every((c) =>
    access.capabilities.has(c),
  );
}

/** The same check against the current user, read fresh. */
export const reviewActionAllowed = (action: ReviewAction) =>
  canReviewAction(getMedicationLogAccess(), action);

/** `can(access, "submitCount")` → true if the capability is held. */
export function can(
  access: MedicationLogAccess,
  capability: string,
): boolean {
  return access.capabilities.has(capability);
}

/** Whether a Program is inside the authorized scope. */
export function isProgramAuthorized(
  scope: AuthorizedProgramScope,
  programId: number,
): boolean {
  return (
    scope.kind === "all" || scope.programIds.includes(programId)
  );
}

/** Subscribes to access changes and re-renders when they happen. */
export function useMedicationLogAccessVersion(): number {
  return useSyncExternalStore(subscribe, getVersion, getVersion);
}
