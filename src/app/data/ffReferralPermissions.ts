// Referral permission adapter (US 20002). The app has no authentication or
// identity provider yet, so the current user is one of two explicit
// PROTOTYPE personas, chosen on the referral page. This only demonstrates
// allowed/denied behavior; browser storage does not keep staff answers
// confidential. Production must replace `currentReferralActor` with the real
// identity/permission source. Deliberately independent of the Mentee
// Inactive capability flag.

import { useSyncExternalStore } from "react";

export type FFReferralPersona = "ff-staff" | "referral-intake";

export interface FFReferralActor {
  persona: FFReferralPersona;
  label: string;
}

export const FF_REFERRAL_PERSONAS: Record<
  FFReferralPersona,
  FFReferralActor
> = {
  "ff-staff": {
    persona: "ff-staff",
    label: "Friends First staff",
  },
  "referral-intake": {
    persona: "referral-intake",
    label: "Referral intake (no staff observations)",
  },
};

/** Staff Observations: view, edit and require only for this capability. */
export function canEditStaffObservations(
  actor: FFReferralActor | null | undefined,
): boolean {
  return actor?.persona === "ff-staff";
}

const KEY = "mh.ffReferralPersona.prototype";
let current: FFReferralPersona = (() => {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "ff-staff" || v === "referral-intake") return v;
  } catch {
    // No storage — default persona.
  }
  return "ff-staff";
})();
const listeners = new Set<() => void>();

export function currentReferralActor(): FFReferralActor {
  return FF_REFERRAL_PERSONAS[current];
}

export function setReferralPersona(p: FFReferralPersona) {
  current = p;
  try {
    localStorage.setItem(KEY, p);
  } catch {
    // Session-only selection.
  }
  listeners.forEach((l) => l());
}

export function useReferralActor(): FFReferralActor {
  return useSyncExternalStore((l) => {
    listeners.add(l);
    return () => listeners.delete(l);
  }, currentReferralActor);
}