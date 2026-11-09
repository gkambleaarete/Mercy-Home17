import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../ui/alert";
import { Button } from "../ui/button";
import { isoToMdy } from "../../lib/dateFormat";
import {
  requirementFactorNames,
  type FullLifetimeRequirement,
} from "../../lib/cssrsRequirement";

// C-SSRS Full-Lifetime requirement message (US 20139, Chunk 5A). Shown on
// the Risk Factors screen and in Testing & Assessments. It reports only
// what the saved Risk Factors say. It never claims the requirement is
// satisfied (that policy is unresolved), blocks nothing and saves nothing:
// its action only opens the existing Add Standardized Test dialog.

export interface OwnedFullLifetime {
  id: string;
  /** ISO date */
  date: string;
}

export function CssrsRequirementNotice({
  idPrefix,
  requirement,
  onComplete,
  unavailableReason,
  owned,
  onView,
  onEdit,
}: {
  idPrefix: string;
  requirement: FullLifetimeRequirement;
  /** Opens the existing assessment dialog with C-SSRS Full-Lifetime chosen. */
  onComplete?: () => void;
  /** The existing restriction that prevents adding a test, when one applies. */
  unavailableReason?: string | null;
  /** Full-Lifetime assessments owned by THIS Admissions record. */
  owned?: OwnedFullLifetime[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
}) {
  if (requirement.status === "none") return null;
  // No Admissions record to read Risk Factors for: nothing to report here.
  if (
    requirement.status === "unavailable" &&
    requirement.reason === "no-record"
  )
    return null;

  if (requirement.status === "unavailable")
    return (
      <Alert
        variant="warning"
        id={`${idPrefix}-requirement`}
        data-testid="cssrs-requirement-unavailable"
      >
        <AlertTitle>
          C-SSRS Full-Lifetime status can't be determined
        </AlertTitle>
        <AlertDescription>
          Saved Risk Factor data can't be read, so it isn't
          known whether a C-SSRS Full-Lifetime is required. This
          does not mean one is not needed.
        </AlertDescription>
      </Alert>
    );

  const names = requirementFactorNames(
    requirement.factors,
  ).join(", ");
  const canComplete = !!onComplete && !unavailableReason;
  return (
    <div className="space-y-3" data-testid="cssrs-requirement">
      <Alert
        variant="info"
        id={`${idPrefix}-requirement`}
        action={
          canComplete
            ? {
                label: "Complete C-SSRS Full-Lifetime",
                onClick: onComplete,
              }
            : undefined
        }
      >
        <AlertTitle>C-SSRS Full-Lifetime required</AlertTitle>
        <AlertDescription>
          This record has a saved Risk Factor of {names}.
          {unavailableReason ? ` ${unavailableReason}` : ""}
        </AlertDescription>
      </Alert>
      {owned && (
        <div data-testid="cssrs-requirement-owned">
          <p className="slds-form-label mb-1">
            C-SSRS Full-Lifetime assessments on this record
          </p>
          {owned.length === 0 ? (
            <p className="text-[13px]">None recorded.</p>
          ) : (
            <ul className="space-y-1">
              {owned.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-2 text-[13px]"
                >
                  <span>{isoToMdy(a.date)}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView?.(a.id)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit?.(a.id)}
                  >
                    Edit
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}