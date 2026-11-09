import { SEED_WAITLIST } from "./mockProjectionsWaitlistData";
import type { ClosureData } from "./caseClosureStore";

// Existing Closed seed records keep their original closure dates:
//  - with a Closing List date (closedAt) → still pending closure
//    (closing / eligible by its age), as they were on the old Closing List;
//  - without one → treated as already-finalized legacy Closed records.
// Used only when no closure data has ever been saved (genuinely absent).
export function seedClosureData(): ClosureData {
  const closures: ClosureData["closures"] = {};
  for (const c of SEED_WAITLIST) {
    if (c.category !== "Closed") continue;
    closures[c.id] = c.closedAt
      ? {
          caseId: c.id,
          name: c.name,
          closingStartedAt: c.closedAt,
          state: "closing",
          origin: "seed",
        }
      : {
          caseId: c.id,
          name: c.name,
          closingStartedAt: c.categoryEnteredAt,
          state: "finalized",
          finalizedAt: c.categoryEnteredAt,
          finalizedBy: "Legacy record",
          origin: "seed",
        };
  }
  return { closures, notifications: [] };
}