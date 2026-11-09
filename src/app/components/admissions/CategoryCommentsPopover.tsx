import { MessageSquare } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { AdmissionsCategoryBadge } from "./AdmissionsCategoryBadge";
import {
  categoryChangesNewestFirst,
  type AdmissionsCategoryChange,
} from "../../data/admissionsCategoryStore";

// Category-change comments for one admission (US 20140), opened from the
// Alerts column of the Admissions Pipeline. Renders nothing when there is no
// saved history. Opens as a modal in place — it never navigates to the
// youth record — and shows EVERY entry in a table, newest first
// (descending), with no inner scroll area. Radix Dialog supplies Enter/Space activation,
// Escape, focus return to this button, and outside-tap dismissal. Comment
// text is rendered as plain text (never HTML). (Name kept from when this
// was a popover, so existing imports are unchanged.)

const formatWhen = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
      });
};

export function CategoryCommentsPopover({
  youthName,
  history,
}: {
  youthName: string;
  /** The store's history. Not modified. */
  history: readonly AdmissionsCategoryChange[];
}) {
  if (history.length === 0) return null;
  const entries = categoryChangesNewestFirst(history);
  const countLabel = `${history.length} ${history.length === 1 ? "comment" : "comments"}`;
  // The author column appears only when at least one entry recorded one.
  const showAuthor = entries.some((c) => c.changedBy);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="xs"
          aria-label={`View category change comments for ${youthName}, ${countLabel}`}
        >
          <MessageSquare aria-hidden="true" />
          <span aria-hidden="true">{countLabel}</span>
        </Button>
      </DialogTrigger>
      <DialogContent size="xl" aria-describedby="category-comments-desc">
        <DialogHeader>
          <DialogTitle>Category change comments</DialogTitle>
          <DialogDescription id="category-comments-desc">
            {youthName} · {countLabel}, newest first
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Table>
            <TableHeader>
              <TableRow hoverable={false}>
                <TableHead variant="slds">Date &amp; Time</TableHead>
                <TableHead variant="slds">
                  Previous Category
                </TableHead>
                <TableHead variant="slds">New Category</TableHead>
                <TableHead variant="slds">Comment</TableHead>
                {showAuthor && (
                  <TableHead variant="slds">Changed By</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="slds-text-3">
                    <time dateTime={c.changedAt}>
                      {formatWhen(c.changedAt)}
                    </time>
                  </TableCell>
                  <TableCell>
                    {c.previousCategory ? (
                      <AdmissionsCategoryBadge
                        category={c.previousCategory}
                      />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <AdmissionsCategoryBadge
                      category={c.newCategory}
                    />
                  </TableCell>
                  {/* plain text: line breaks kept, long words wrap */}
                  <TableCell
                    wrap
                    className="slds-text-4 whitespace-pre-wrap [overflow-wrap:anywhere]"
                  >
                    {c.comment}
                  </TableCell>
                  {showAuthor && (
                    <TableCell className="slds-text-3">
                      {c.changedBy?.name ?? "—"}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}