import { useState } from "react";
import { toast } from "sonner@2.0.3";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  COUNT_ATTESTATION_TEXT,
  VOLUME_LEVELS,
  formatUnitsInput,
  submitCounts,
} from "../../data/medicationLogStore";
import { getMedicationLogAccess } from "../../data/medicationLogAccess";
import { getAssignmentById } from "../../data/youthMedicationAssignments";
import type { CountRow } from "../../data/medReviewViews";

/**
 * Record a new Count for the selected Count log's own medication (Med Review
 * Hub > Count). It uses the same canonical count service as the rest of the
 * app (submitCounts): Program scope, the count permission, the youth's
 * enrollment and medication ownership are all enforced there, and the new
 * Count log is written with the row's canonical Program ID. A row of another
 * Program than the fixed one is refused before anything is sent.
 */
export function ReviewCountEntry({
  row,
  expectedProgramId,
  onDone,
}: {
  row: CountRow;
  expectedProgramId: number | null;
  onDone: () => void;
}) {
  const assignment = row.youthMedicationId
    ? getAssignmentById(row.youthMedicationId)
    : undefined;
  const [value, setValue] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  if (!assignment || !row.youthMedicationId)
    return (
      <div className="px-6 py-5">
        <Alert variant="warning">
          <AlertDescription>
            This medication can't be counted from here.
          </AlertDescription>
        </Alert>
      </div>
    );

  const submit = () => {
    setError("");
    if (
      expectedProgramId !== null &&
      row.programId !== expectedProgramId
    ) {
      setError(
        "This record doesn't belong to the Program you opened Med Reviews from.",
      );
      return;
    }
    const result = submitCounts({
      youthId: row.youthId,
      programId: row.programId,
      staff: getMedicationLogAccess().user.name,
      rows: [
        {
          youthMedicationId: row.youthMedicationId!,
          currentCount: value,
          comment,
        },
      ],
    });
    if (!result.ok) {
      setError(
        Object.values(result.rowErrors)[0] ?? result.error,
      );
      toast.error("Count not saved");
      return;
    }
    toast.success("Count recorded.");
    onDone();
  };

  return (
    <div className="px-6 py-5 space-y-4">
      {error && (
        <Alert variant="error" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="rce-count">CURRENT COUNT</Label>
        {assignment.countType === "Volume" ? (
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger id="rce-count" surface="base">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {VOLUME_LEVELS.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="rce-count"
            size="md"
            surface="base"
            inputMode="decimal"
            value={value}
            onChange={(e) =>
              setValue(formatUnitsInput(e.target.value))
            }
          />
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rce-comment">COMMENT</Label>
        <Textarea
          id="rce-comment"
          size="md"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
        {COUNT_ATTESTATION_TEXT}
      </p>
      <div className="flex justify-end">
        <Button onClick={submit}>Submit</Button>
      </div>
    </div>
  );
}
