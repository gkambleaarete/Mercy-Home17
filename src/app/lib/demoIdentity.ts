/**
 * Prototype identity seam: the demo staff persona that new visible activity
 * (audit entries, attestations, "created by", contributors) is attributed to.
 *
 * Mock state only — production authentication replaces this module. Records
 * that were already saved keep the attribution they were saved with; this is
 * used only when a new entry is created.
 */
import { getMedicationLogAccess } from "../data/medicationLogAccess";

export const DEMO_USER_NAME = "Sohan Jadhavrao";
export const DEMO_USER_ID = "staff-sohan-jadhavrao";

/** Display name of the demo user performing the action now. */
export function getDemoUserName(): string {
  const name = getMedicationLogAccess().user.name;
  // The medication access seam's placeholder name is not a person.
  return name && name !== "Current User" ? name : DEMO_USER_NAME;
}
