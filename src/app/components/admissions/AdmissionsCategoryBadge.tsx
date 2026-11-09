import { Badge } from "../ui/badge";

// One color per Admissions Pipeline category, from the design system's soft
// Badge tones. Program Waitlist / Delayed / Info Session Scheduled keep the
// tones Bed Projections already gives them (BedProjectionYouthRow); Referral
// and Closed complete the set. An unknown category stays neutral.
type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

const CATEGORY_TONE: Record<string, BadgeVariant> = {
  Referral: "purple",
  "Info Session Scheduled": "info",
  "Program Waitlist": "success",
  Delayed: "error",
  Closed: "neutral",
};

export function AdmissionsCategoryBadge({
  category,
}: {
  category: string;
}) {
  return (
    <Badge variant={CATEGORY_TONE[category] ?? "neutral"} bordered>
      {category}
    </Badge>
  );
}