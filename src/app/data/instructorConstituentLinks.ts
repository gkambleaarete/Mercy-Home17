// Instructor ↔ Constituent identity (US 20096).
//
// The Classes module identifies instructors with its own ids ("i1"…), which
// are a different id space from numeric Constituent IDs. This explicit map
// is the only link between the two: an Instructor profile shows a session
// only when one of the session's instructor ids maps to that profile's
// Constituent ID. Never match by name, list position or another entity's id.
// Prototype data — a real integration would store the Constituent ID on the
// instructor record itself.

export const INSTRUCTOR_CONSTITUENT_LINKS: Readonly<
  Record<string, number>
> = {
  i3: 9001, // Sandra Okafor (demo Instructor constituent)
  i5: 9002, // Angela Brooks (demo Instructor constituent)
};

/** Classes-module instructor ids linked to one Constituent ID. */
export function instructorIdsForConstituent(
  constituentId: number,
): string[] {
  return Object.entries(INSTRUCTOR_CONSTITUENT_LINKS)
    .filter(([, cid]) => cid === constituentId)
    .map(([iid]) => iid);
}

/** Instructor id for an Instructor constituent with no Classes-module
 *  instructor record: derived from the stable Constituent ID. */
export function constituentInstructorId(
  constituentId: number,
): string {
  return `constituent:${constituentId}`;
}