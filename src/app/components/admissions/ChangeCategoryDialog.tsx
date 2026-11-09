import { useRef, useState } from "react";
import { Alert, AlertDescription } from "../ui/alert";
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
import { FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

// Change Category (US 20140): shown when staff pick a different Admissions
// category. The change is only PENDING until Save succeeds — the caller
// keeps showing the saved category, and Cancel / Escape / outside click /
// the close button all discard it. Mount it only while a change is pending
// so each open starts with an empty comment.

export interface ChangeCategorySaveResult {
  ok: boolean;
  error?: string;
}

export function ChangeCategoryDialog({
  youthName,
  currentCategory,
  proposedCategory,
  onSave,
  onCancel,
}: {
  youthName: string;
  currentCategory: string;
  proposedCategory: string;
  /** Persists the change. Called with the trimmed comment, once at a time. */
  onSave: (comment: string) => ChangeCategorySaveResult;
  /** Discards the pending change. */
  onCancel: () => void;
}) {
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState<
    string | null
  >(null);
  const [saveError, setSaveError] = useState<string | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  // State updates are async; the ref blocks a second click in the same tick.
  const submitting = useRef(false);

  const handleSave = () => {
    if (submitting.current) return;
    const trimmed = comment.trim();
    if (trimmed === "") {
      setCommentError("Comments are required.");
      return;
    }
    submitting.current = true;
    setSaving(true);
    setCommentError(null);
    setSaveError(null);
    let result: ChangeCategorySaveResult;
    try {
      result = onSave(trimmed);
    } catch {
      result = {
        ok: false,
        error:
          "The category change could not be saved. Your comment is kept — please try again.",
      };
    }
    if (!result.ok) {
      // Keep the comment; allow a retry.
      setSaveError(
        result.error ??
          "The category change could not be saved.",
      );
      submitting.current = false;
      setSaving(false);
    }
    // On success the caller closes the dialog.
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !submitting.current) onCancel();
      }}
    >
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Change Category</DialogTitle>
          <DialogDescription>{youthName}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="change-category-current">
                  Current Category
                </FieldLabel>
                <Input
                  id="change-category-current"
                  size="md"
                  readOnly
                  value={currentCategory || "—"}
                />
              </div>
              <div>
                <FieldLabel htmlFor="change-category-proposed">
                  Proposed Category
                </FieldLabel>
                <Input
                  id="change-category-proposed"
                  size="md"
                  readOnly
                  value={proposedCategory}
                />
              </div>
            </div>
            <div>
              <FieldLabel
                htmlFor="change-category-comments"
                required
                error={!!commentError}
              >
                Comments
              </FieldLabel>
              <Textarea
                id="change-category-comments"
                size="lg"
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (commentError) setCommentError(null);
                }}
                placeholder="Why is the category changing?"
                aria-required
                aria-invalid={commentError ? true : undefined}
                aria-describedby={
                  commentError
                    ? "change-category-comments-error"
                    : undefined
                }
                disabled={saving}
              />
              <FieldError id="change-category-comments-error">
                {commentError}
              </FieldError>
            </div>
            {saveError && (
              <Alert variant="error" role="alert">
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}