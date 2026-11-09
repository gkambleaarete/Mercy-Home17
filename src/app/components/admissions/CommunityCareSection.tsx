import { useEffect, useRef, useState } from "react";
import {
  Pencil,
  Plus,
  Trash2,
  HeartHandshake,
} from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { DatePicker } from "../ui/date-picker";
import { EmptyState } from "../ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { formatMdy } from "../../lib/dateFormat";
import {
  COMMUNITY_NEED_OPTIONS,
  CommunityNeed,
  CommunityNeedAssignment,
  allocateCommunityNeedId,
  commitNotesDraft,
  rangesOverlap,
  setNotesDraft,
  setNotesDraft as storeNotesDraft,
  useNotesDraft,
  updateCommunityCare,
  useCommunityCare,
} from "../../data/communityNeedsStore";

const STORAGE_UNAVAILABLE =
  "Browser storage is unavailable, so this change is kept for this session only and will be lost on refresh.";

/**
 * Success toast only when the change was durably written; otherwise a
 * warning that it lasts for this session only.
 */
function confirmSaved(
  saved: boolean,
  success: string,
  sessionOnly: string,
) {
  if (saved) toast.success(success);
  else
    toast.warning(sessionOnly, {
      description: STORAGE_UNAVAILABLE,
    });
}

/**
 * Called by the Constituent Details page Save button: commits any unsaved
 * Community Care Notes. Warns when they could only be kept for this session.
 */
export function saveCommunityCareNotes(constituentId: string) {
  if (commitNotesDraft(constituentId) === false)
    toast.warning(
      "Community Care Notes kept for this session only.",
      {
        description: STORAGE_UNAVAILABLE,
      },
    );
}

/** Called by the Constituent Details page Cancel button. */
export function discardCommunityCareNotes(
  constituentId: string,
) {
  setNotesDraft(constituentId, undefined);
}

/**
 * Community Care (20092) — shared bottom subsection of Constituent Details
 * for every Individual role. Community Needs are independent flags stored by
 * Constituent ID; nothing here touches constituent roles.
 */
export function CommunityCareSection({
  constituentId,
}: {
  constituentId: string;
}) {
  const record = useCommunityCare(constituentId);

  // ── Add / Edit dialog ───────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(
    null,
  );
  const [need, setNeed] = useState<CommunityNeed | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState<{
    need?: string;
    endDate?: string;
  }>({});

  // ── Remove confirmation ────────────────────────────────────────────
  const [removeTarget, setRemoveTarget] =
    useState<CommunityNeedAssignment | null>(null);

  // ── Notes ──────────────────────────────────────────────────────────
  // Edits are a draft in the store until the Constituent Details page
  // Save button commits them (Cancel discards). The draft outlives this
  // section unmounting, so returning restores it.
  const notesDraft = useNotesDraft(constituentId);
  const notesValue = notesDraft ?? record.notes;
  const notesDirty = notesDraft !== undefined;

  // Leaving the section (sub-tab switch / in-app navigation) with unsaved
  // notes: the draft is kept for this session; tell the user rather than
  // leaving it unsaved silently.
  const latestDirty = useRef(notesDirty);
  latestDirty.current = notesDirty;
  useEffect(
    () => () => {
      if (latestDirty.current)
        toast.warning("Community Care Notes not saved.", {
          description:
            "Your draft is kept for this session. Return to Constituent Details and select Save to keep it.",
        });
    },
    [],
  );

  // Unsaved-changes guard on browser close/reload.
  useEffect(() => {
    if (!notesDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () =>
      window.removeEventListener("beforeunload", handler);
  }, [notesDirty]);

  const openAdd = () => {
    setEditingId(null);
    setNeed("");
    setStartDate("");
    setEndDate("");
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (a: CommunityNeedAssignment) => {
    setEditingId(a.id);
    setNeed(a.need);
    setStartDate(a.startDate);
    setEndDate(a.endDate);
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = () => {
    const next: typeof errors = {};
    if (!need) next.need = "Community Need is required.";
    if (startDate && endDate && endDate < startDate)
      next.endDate = "End Date cannot be before Start Date.";
    if (!next.need && need) {
      const conflict = record.needs.some(
        (n) =>
          n.id !== editingId &&
          n.need === need &&
          rangesOverlap(n, { startDate, endDate }),
      );
      if (conflict)
        next.need =
          "This Community Need is already assigned for an overlapping date range.";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    const assignment: CommunityNeedAssignment = {
      id: editingId ?? allocateCommunityNeedId(),
      need: need as CommunityNeed,
      startDate,
      endDate,
    };
    const saved = updateCommunityCare(constituentId, (r) => ({
      ...r,
      needs:
        editingId === null
          ? [...r.needs, assignment]
          : r.needs.map((n) =>
              n.id === editingId ? assignment : n,
            ),
    }));
    confirmSaved(
      saved,
      editingId === null
        ? "Community Need added."
        : "Community Need updated.",
      editingId === null
        ? "Community Need added for this session only."
        : "Community Need updated for this session only.",
    );
    setDialogOpen(false);
  };

  const handleRemove = () => {
    if (!removeTarget) return;
    const id = removeTarget.id;
    const saved = updateCommunityCare(constituentId, (r) => ({
      ...r,
      needs: r.needs.filter((n) => n.id !== id),
    }));
    confirmSaved(
      saved,
      "Community Need removed.",
      "Community Need removed for this session only.",
    );
    setRemoveTarget(null);
  };

  return (
    <section
      aria-labelledby="community-care-heading"
      className="overflow-hidden"
      style={{
        border: "1px solid var(--slds-g-color-border-base-1)",
        borderRadius: "var(--slds-c-card-radius-border)",
        backgroundColor: "var(--slds-g-color-background-base)",
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between gap-4"
        style={{
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
          backgroundColor: "var(--slds-g-color-background-alt)",
        }}
      >
        <h3
          id="community-care-heading"
          className="text-[13px] font-semibold"
          style={{ color: "var(--slds-g-color-text-default)" }}
        >
          Community Care
        </h3>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={openAdd}
        >
          <Plus aria-hidden="true" />
          Add Community Need
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* A. Community Needs table */}
        {record.needs.length === 0 ? (
          <EmptyState
            icon={HeartHandshake}
            title="No Community Needs"
            description="Add a Community Need to track Community Care services for this constituent."
            className="py-6"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead variant="slds">
                    Community Need
                  </TableHead>
                  <TableHead variant="slds">
                    Start Date
                  </TableHead>
                  <TableHead variant="slds">End Date</TableHead>
                  <TableHead
                    variant="slds"
                    className="text-right"
                  >
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {record.needs.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell wrap className="px-4">
                      {a.need}
                    </TableCell>
                    <TableCell className="px-4">
                      {a.startDate
                        ? formatMdy(`${a.startDate}T00:00:00`)
                        : "—"}
                    </TableCell>
                    <TableCell className="px-4">
                      {a.endDate
                        ? formatMdy(`${a.endDate}T00:00:00`)
                        : "—"}
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <Button
                        variant="ghost-primary"
                        size="icon-xs"
                        aria-label={`Edit ${a.need}`}
                        onClick={() => openEdit(a)}
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost-destructive"
                        size="icon-xs"
                        aria-label={`Remove ${a.need}`}
                        onClick={() => setRemoveTarget(a)}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* B. Community Care Notes */}
        <div className="space-y-1.5">
          <Label
            htmlFor={`community-care-notes-${constituentId}`}
            className="slds-form-label"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            COMMUNITY CARE NOTES
          </Label>
          <Textarea
            id={`community-care-notes-${constituentId}`}
            size="md"
            rows={6}
            className="min-h-32"
            value={notesValue}
            onChange={(e) =>
              storeNotesDraft(constituentId, e.target.value)
            }
            placeholder="Enter Community Care notes"
          />
          {notesDirty && (
            <p
              className="slds-text-3 text-right"
              style={{
                color: "var(--slds-g-color-text-weak)",
              }}
              role="status"
            >
              Unsaved changes. Select Save to keep them.
            </p>
          )}
        </div>
      </div>

      {/* Add / Edit Community Need */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {editingId === null
                ? "Add Community Need"
                : "Edit Community Need"}
            </DialogTitle>
            <DialogDescription>
              Community Needs are tracked separately from
              constituent roles.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="community-need-select"
                className="slds-form-label"
              >
                COMMUNITY NEED{" "}
                <span className="text-red-600">*</span>
              </Label>
              <Select
                value={need}
                onValueChange={(v) => {
                  setNeed(v as CommunityNeed);
                  setErrors((e) => ({ ...e, need: undefined }));
                }}
              >
                <SelectTrigger
                  id="community-need-select"
                  aria-required="true"
                  aria-invalid={!!errors.need}
                  aria-describedby={
                    errors.need
                      ? "community-need-error"
                      : undefined
                  }
                >
                  <SelectValue placeholder="Select Community Need" />
                </SelectTrigger>
                <SelectContent>
                  {COMMUNITY_NEED_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.need && (
                <p
                  id="community-need-error"
                  role="alert"
                  className="slds-text-3 text-destructive"
                >
                  {errors.need}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="community-need-start"
                  className="slds-form-label"
                >
                  START DATE
                </Label>
                <DatePicker
                  id="community-need-start"
                  value={startDate}
                  onChange={(v) => {
                    setStartDate(v);
                    setErrors((e) => ({
                      ...e,
                      endDate: undefined,
                      need: undefined,
                    }));
                  }}
                  placeholder="MM/DD/YYYY"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="community-need-end"
                  className="slds-form-label"
                >
                  END DATE
                </Label>
                <DatePicker
                  id="community-need-end"
                  value={endDate}
                  onChange={(v) => {
                    setEndDate(v);
                    setErrors((e) => ({
                      ...e,
                      endDate: undefined,
                      need: undefined,
                    }));
                  }}
                  placeholder="MM/DD/YYYY"
                />
                {errors.endDate && (
                  <p
                    role="alert"
                    className="slds-text-3 text-destructive"
                  >
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <AlertDialog
        open={removeTarget !== null}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove Community Need?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget
                ? `${removeTarget.need} will be removed from this constituent. Constituent roles are not affected.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleRemove}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}