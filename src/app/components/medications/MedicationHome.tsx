import { ArrowRight, ClipboardList, ShieldAlert } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import {
  reviewActionAllowed,
  useMedicationLogAccessVersion,
} from "../../data/medicationLogAccess";
import {
  accessibleProgramIds,
  useMedReviews,
} from "../../data/medReviewStore";
import { useMedicationLogState } from "../../data/medicationLogStore";
import { outstandingReviewRows } from "../../data/medReviewViews";
import { evaluateMedicationDocumentation } from "../../data/medDocumentationLive";
import { getProgramById } from "../../data/mockProgramsData";
import { cn } from "../ui/utils";
import {
  GLOBAL_MEDICATION_ERRORS_SECTION,
  MISSING_MEDICATION_DOCUMENTATION_SECTION,
  type GlobalMedicationSection,
} from "../../lib/medicationHomeSections";

interface MedicationHomeProps {
  /** Whether the user's authorized Program scope allows the worklists. */
  canViewWorklists: boolean;
  onOpen: (section: GlobalMedicationSection) => void;
}

// HomeBase → Medications → Home (ticket 20141): the two global functions.
// Colors are brand tokens only (globals.css): Action Maroon for errors,
// Deep Slate for documentation; CTAs use the Mercy Green primary outline.
const HOME_CARDS = [
  {
    section: GLOBAL_MEDICATION_ERRORS_SECTION,
    icon: ShieldAlert,
    title: "Medication errors",
    destination: "Global Medication Error Dashboard",
    subtitle: "Awaiting review",
    cta: "Review errors",
    accent: "var(--color-brand-secondary)",
  },
  {
    section: MISSING_MEDICATION_DOCUMENTATION_SECTION,
    icon: ClipboardList,
    title: "Documentation gaps",
    destination: "Missing or Incomplete Medication Documentation",
    subtitle: "Missing or incomplete records",
    cta: "Review documentation",
    accent: "var(--color-brand-tertiary)",
  },
] as const;

export function MedicationHome({
  canViewWorklists,
  onOpen,
}: MedicationHomeProps) {
  // Counts come from the same shared selectors as the two worklists.
  useMedicationLogAccessVersion();
  const reviews = useMedReviews();
  const logs = useMedicationLogState();
  const scope = accessibleProgramIds();
  const scopeKey = JSON.stringify(scope);
  const attestationsVisible = reviewActionAllowed(
    "viewAttestationDetails",
  );
  const counts = useMemo<Record<string, number | null>>(() => {
    if (!canViewWorklists)
      return {
        [GLOBAL_MEDICATION_ERRORS_SECTION]: null,
        [MISSING_MEDICATION_DOCUMENTATION_SECTION]: null,
      };
    return {
      [GLOBAL_MEDICATION_ERRORS_SECTION]: outstandingReviewRows(
        logs,
        reviews,
        scope,
        (id) =>
          getProgramById(id)?.name ?? "Program unavailable",
      ).length,
      [MISSING_MEDICATION_DOCUMENTATION_SECTION]:
        evaluateMedicationDocumentation({
          snapshot: logs,
          reviews,
          scope,
          attestationsVisible,
          now: new Date().toISOString(),
        }).rows.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    logs,
    reviews,
    scopeKey,
    attestationsVisible,
    canViewWorklists,
  ]);
  return (
    <div className="app-page-x pb-6 pt-4 grid grid-cols-1 lg:grid-cols-2 gap-[var(--app-content-gap)]">
      {HOME_CARDS.map(
        ({ section, icon: Icon, title, destination, subtitle, cta, accent }) => (
          <Card
            key={section}
            variant="section"
            elevation="sm"
            className={cn(!canViewWorklists && "opacity-60")}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
                    color: accent,
                  }}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[length:var(--slds-g-font-size-6)] font-semibold m-0 text-[var(--slds-g-color-text-default)]">
                    {title}
                  </h2>
                  <p className="text-[32px] leading-tight font-bold mt-1 m-0 text-[var(--slds-g-color-text-default)]">
                    {counts[section] ?? "—"}
                  </p>
                  <p className="slds-text-4 m-0 text-[var(--slds-g-color-text-weak)]">
                    {canViewWorklists ? subtitle : "Unavailable for your Programs"}
                  </p>
                  <Button
                    type="button"
                    variant="outline-primary"
                    size="sm"
                    className="mt-4"
                    disabled={!canViewWorklists}
                    aria-label={`${cta} — open ${destination}`}
                    onClick={() => onOpen(section)}
                  >
                    {cta}
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ),
      )}
    </div>
  );
}
