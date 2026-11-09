import { Badge } from "../ui/badge";

// One color per Admissions pipeline stage, from the design system's soft
// Badge tones. Keeps the distinction the Pipeline table already made
// between stages (green Move-In, blue Staffing, purple Info Session, orange
// Assessments, neutral Referral), now through Badge variants instead of
// inline colors. An unknown stage stays neutral.
type BadgeVariant = React.ComponentProps<
  typeof Badge
>["variant"];

const STAGE_TONE: Record<string, BadgeVariant> = {
  Referral: "neutral",
  "Info Session": "purple",
  Assessments: "orange",
  "Shadow & FPM": "dark",
  Staffing: "info",
  "Move-In": "success",
};

export function AdmissionsStageBadge({
  stage,
}: {
  stage: string;
}) {
  return (
    <Badge variant={STAGE_TONE[stage] ?? "neutral"} bordered>
      {stage}
    </Badge>
  );
}