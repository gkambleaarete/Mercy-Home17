// Mentee Search rows (US 20000), built from the shared mentee store and the
// mentees' own linked referrals. Pure: callers pass the current records (the
// page subscribes to the store), so nothing here reads storage or the clock
// except through its arguments.
//
// Field sources — each describes the youth, and each is the same saved value
// the record screens show:
//   Location            referral "Basic Client Demographics" City + State
//                       (bd_city / bd_state). Not the caller's State/Zip, the
//                       guardian's address or an intake meeting venue.
//   Interests/hobbies   youth intake "Interests and hobbies", else its
//                       "What do you like to do in your free time?" answer.
//   Ethnicity           referral "Basic Client Demographics" Ethnicity.
//   Religion            no saved field exists anywhere — always blank.
//   Date of Referral    the linked referral's explicit Referral Date.
//   Promotion Date      the mentee's stored first-promotion date.
// The join is the mentee's stable referralId; nothing is matched by name.

import type {
  FFMentee,
  FFReferralRecord,
} from "./mockFriendsFirstData";
import {
  ageOf,
  formatDisplayDate,
  splitInterests,
  type MenteeSearchRow,
} from "../lib/menteeSearch";
import { initialsOf } from "../lib/mentorSearch";

export function buildMenteeSearchRows(
  mentees: FFMentee[],
  referrals: FFReferralRecord[],
  today?: Date,
): MenteeSearchRow[] {
  const referralById = new Map(referrals.map((r) => [r.id, r]));
  const byId = new Map<string, MenteeSearchRow>();
  for (const m of mentees) {
    // Inactive is separate from the Active stage: only the flag excludes.
    if (m.inactive === true || byId.has(m.id)) continue;
    const ref = m.referralId
      ? referralById.get(m.referralId)
      : undefined;
    const a = ref?.answers ?? {};
    const youth = m.youthIntake;
    byId.set(m.id, {
      id: m.id,
      name: m.name,
      initials: m.initials || initialsOf(m.name),
      gender: (m.gender ?? "").trim(),
      subProgramme: m.programme,
      stage: m.stage,
      location: [a.bd_city, a.bd_state]
        .map((v) => (v ?? "").trim())
        .filter(Boolean)
        .join(", "),
      age: ageOf(m.dob, today),
      interests: splitInterests(
        youth?.interestsHobbies?.trim()
          ? youth.interestsHobbies
          : youth?.answers?.y_freeTime,
      ),
      ethnicity: (a.bd_ethnicity ?? "").trim(),
      religion: "",
      dob: formatDisplayDate(m.dob),
      referralDate: formatDisplayDate(ref?.referralDate),
      promotionDate: formatDisplayDate(m.promotionDate),
    });
  }
  return [...byId.values()];
}