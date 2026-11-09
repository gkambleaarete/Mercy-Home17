import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { DateInput } from "../ui/date-input";
import {
  ACADEMIC_SNAPSHOT_DEFAULT_SUBJECT,
  ECR_TEAM_MEMBERS,
  assignAcademicSnapshotTask,
  type AssignAcademicSnapshotResult,
} from "../../lib/academicSnapshotTask";

const MDY_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

interface AssignAcademicSnapshotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The youth whose Admissions profile is open — the task is always related to them. */
  youth: { id: string; name: string };
  onAssigned: (result: AssignAcademicSnapshotResult) => void;
}

export function AssignAcademicSnapshotDialog({
  open,
  onOpenChange,
  youth,
  onAssigned,
}: AssignAcademicSnapshotDialogProps) {
  const [subject, setSubject] = useState(
    ACADEMIC_SNAPSHOT_DEFAULT_SUBJECT,
  );
  const [assignedToId, setAssignedToId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [comments, setComments] = useState("");
  const [errors, setErrors] = useState<{
    subject?: string;
    assignedTo?: string;
    dueDate?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Synchronous guard so rapid repeat clicks can't create duplicate tasks
  // before the disabled state re-renders.
  const submittingRef = useRef(false);

  // Fresh form every time the dialog opens
  useEffect(() => {
    if (open) {
      setSubject(ACADEMIC_SNAPSHOT_DEFAULT_SUBJECT);
      setAssignedToId("");
      setDueDate("");
      setComments("");
      setErrors({});
    }
  }, [open]);

  const handleSave = async () => {
    if (submittingRef.current) return;

    const nextErrors: typeof errors = {};
    if (!subject.trim())
      nextErrors.subject = "Subject is required.";
    if (!assignedToId)
      nextErrors.assignedTo = "Assigned To is required.";
    if (dueDate && !MDY_RE.test(dueDate))
      nextErrors.dueDate = "Enter a valid date (MM/DD/YYYY).";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const assignedTo = ECR_TEAM_MEMBERS.find(
      (m) => m.id === assignedToId,
    );
    if (!assignedTo) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const result = await assignAcademicSnapshotTask({
        subject: subject.trim(),
        dueDate,
        assignedTo,
        comments: comments.trim(),
        youth,
      });
      onAssigned(result);
      onOpenChange(false);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isSubmitting) onOpenChange(next);
      }}
    >
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Assign Academic Snapshot</DialogTitle>
          <DialogDescription>
            Related To: {youth.name}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4 max-h-[70vh] overflow-y-auto bg-white">
          <div className="space-y-1.5">
            <Label
              htmlFor="academic-snapshot-subject"
              className="text-[13px] text-[#3e3e3c] font-medium"
            >
              Subject <span className="text-red-600">*</span>
            </Label>
            <Input
              id="academic-snapshot-subject"
              size="md"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (errors.subject)
                  setErrors((prev) => ({
                    ...prev,
                    subject: undefined,
                  }));
              }}
              aria-required
              aria-invalid={!!errors.subject}
            />
            {errors.subject && (
              <p className="slds-text-3 text-destructive">
                {errors.subject}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="academic-snapshot-assigned-to"
                className="text-[13px] text-[#3e3e3c] font-medium"
              >
                Assigned To{" "}
                <span className="text-red-600">*</span>
              </Label>
              <Select
                value={assignedToId}
                onValueChange={(v) => {
                  setAssignedToId(v);
                  if (errors.assignedTo)
                    setErrors((prev) => ({
                      ...prev,
                      assignedTo: undefined,
                    }));
                }}
              >
                <SelectTrigger
                  id="academic-snapshot-assigned-to"
                  aria-required
                  aria-invalid={!!errors.assignedTo}
                >
                  <SelectValue placeholder="Select ECR Team Member" />
                </SelectTrigger>
                <SelectContent>
                  {ECR_TEAM_MEMBERS.map((member) => (
                    <SelectItem
                      key={member.id}
                      value={member.id}
                    >
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assignedTo && (
                <p className="slds-text-3 text-destructive">
                  {errors.assignedTo}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="academic-snapshot-due-date"
                className="text-[13px] text-[#3e3e3c] font-medium"
              >
                Due Date
              </Label>
              <DateInput
                id="academic-snapshot-due-date"
                value={dueDate}
                onChange={(v) => {
                  setDueDate(v);
                  if (errors.dueDate)
                    setErrors((prev) => ({
                      ...prev,
                      dueDate: undefined,
                    }));
                }}
              />
              {errors.dueDate && (
                <p className="slds-text-3 text-destructive">
                  {errors.dueDate}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="academic-snapshot-comments"
              className="text-[13px] text-[#3e3e3c] font-medium"
            >
              Comments
            </Label>
            <Textarea
              id="academic-snapshot-comments"
              size="md"
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </DialogBody>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}