import { ArrowLeft, ShieldAlert } from "@/app/lib/lucide-icons";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { EmptyState } from "../ui/empty-state";

interface MedicationRecordFocusNoticeProps {
  /** False when the record doesn't exist or is outside the user's Programs
   *  (one answer for both, so an id never reveals another Program's data). */
  available: boolean;
  onBackToDashboard: () => void;
  onShowAll: () => void;
  /** Label of the return action. */
  backLabel?: string;
  /** Name of the screen the record was opened from. */
  fromLabel?: string;
}

// Shown in Med Documentation when a single record was opened by id from the
// Global Medication Error Dashboard.
export function MedicationRecordFocusNotice({
  available,
  onBackToDashboard,
  onShowAll,
  backLabel = "Back to Global Medication Error Dashboard",
  fromLabel = "Global Medication Error Dashboard",
}: MedicationRecordFocusNoticeProps) {
  if (!available)
    return (
      <div className="app-page-x flex flex-col items-center gap-4 py-16">
        <EmptyState
          icon={ShieldAlert}
          title="Record not available"
          description="This documentation record doesn't exist or isn't in a Program you can access."
        />
        <Button type="button" onClick={onBackToDashboard}>
          <ArrowLeft /> {backLabel}
        </Button>
      </div>
    );
  return (
    <Alert variant="info">
      <AlertDescription>
        <span className="flex flex-wrap items-center gap-2">
          Showing the record opened from {fromLabel}.
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBackToDashboard}
          >
            <ArrowLeft /> {backLabel}
          </Button>
          <Button
            type="button"
            variant="link-info"
            size="inline"
            onClick={onShowAll}
          >
            Show all documentation
          </Button>
        </span>
      </AlertDescription>
    </Alert>
  );
}