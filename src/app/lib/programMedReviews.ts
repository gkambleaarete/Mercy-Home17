// Program → Medications > Med Review Hub (US 20128). The Program context
// travels in the URL, so refresh and direct links keep it; the Program name
// is always resolved from the Program record on arrival.
export function programMedReviewsUrl(
  programId: number | string,
  section: "med-review-hub" | "med-documentation" | "counts" = "med-review-hub",
): string {
  return `/medications?${new URLSearchParams({
    section,
    origin: "program",
    programId: String(programId),
  })}`;
}
