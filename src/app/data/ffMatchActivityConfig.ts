// Match Activity options (US 20039 Chunk 11) — the one configured source
// for Log Community-Based Activity and the activity grid. Activities store
// the chosen label itself, so changing these lists never alters old
// records.

export const FF_OUTING_STATUSES = [
  { value: "yes", label: "Yes" },
  { value: "partial", label: "Partially" },
  { value: "no", label: "No" },
] as const;
export type FFOutingStatus =
  (typeof FF_OUTING_STATUSES)[number]["value"];

export const FF_MATCH_ACTIVITY_TYPES = [
  "Library Visit",
  "Museum Visit",
  "Sports Activity",
  "Meal Together",
  "Community Event",
  "School Event",
  "Volunteer Activity",
  "Phone Check-In",
  "Video Call",
  "Other",
] as const;

/** Video Call and Virtual are distinct choices. */
export const FF_MATCH_MEETING_METHODS = [
  "In-Person",
  "Phone",
  "Video Call",
  "Virtual",
  "Group Activity",
  "Other",
] as const;

/** Meaning of each 1–5 engagement rating. */
export const FF_ENGAGEMENT_LABELS = [
  "Very Low Engagement",
  "Low Engagement",
  "Moderate Engagement",
  "High Engagement",
  "Excellent Engagement",
] as const;

export const FF_DURATION_MIN_HOURS = 0.25;
export const FF_DURATION_MAX_HOURS = 24;