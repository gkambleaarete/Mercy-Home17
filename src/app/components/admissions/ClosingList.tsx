import { useState } from "react";
import { Bell, Eye, FolderClosed } from "@/app/lib/lucide-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../ui/alert";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  CLOSING_LIST_DAYS,
  daysInClosing,
  getClosureStatus,
  type CaseClosure,
  type ClosureNotification,
} from "../../data/caseClosureStore";
import { formatMdy } from "../../lib/dateFormat";
import { ClosureDataNotice } from "./ClosureDataNotice";

function fmt(stamp: string) {
  return formatMdy(
    stamp.length === 10 ? `${stamp}T00:00:00` : stamp,
  );
}

// Closing List (US 17573 revisions): cases in closure, out of the active
// Waitlist / Projections / Pipeline. Eligible for Archive is a follow-up
// prompt only; staff finalize explicitly, which moves the case to the
// Admissions Closed category.
export function ClosingList({
  closures,
  notifications,
  now,
  canFinalize,
  onFinalize,
  onOpen,
  onMarkRead,
}: {
  /** Cases in closure that are not yet finalized. */
  closures: CaseClosure[];
  notifications: ClosureNotification[];
  now: Date;
  canFinalize: boolean;
  /** Completes the closure. Return false when it could not be saved: the
   *  confirmation then stays open so staff can retry. */
  onFinalize: (caseId: string) => boolean | void;
  /** Opens the case's record; omitted for cases with no open-able record. */
  onOpen: (caseId: string) => void;
  onMarkRead: () => void;
}) {
  const [confirm, setConfirm] = useState<CaseClosure | null>(
    null,
  );
  const unread = notifications.filter((n) => !n.read);
  const rows = [...closures].sort((a, b) =>
    a.closingStartedAt.localeCompare(b.closingStartedAt),
  );

  return (
    <Card variant="section" elevation="sm">
      <CardHeader size="sm" separated>
        <div className="flex items-center gap-2">
          <CardTitle className="slds-text-5 font-semibold">
            Closing List
          </CardTitle>
          <Badge variant="neutral" bordered>
            {rows.length} cases
          </Badge>
        </div>
        <CardDescription className="slds-text-3">
          Cases leave the Waitlist, Bed Projections and the
          Admissions Pipeline as soon as they enter closure.
          After {CLOSING_LIST_DAYS} days a case is Eligible for
          Archive — it is not archived or deleted. Complete
          Closure to move it to the Admissions Closed category.
        </CardDescription>
      </CardHeader>

      <CardContent size="sm">
        <ClosureDataNotice scope="closing-list" />
      </CardContent>

      {unread.length > 0 && (
        <CardContent size="sm">
          <Alert variant="warning">
            <Bell />
            <AlertTitle>
              {unread.length}{" "}
              {unread.length === 1 ? "case is" : "cases are"}{" "}
              Eligible for Archive
            </AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4">
                {unread.map((n) => (
                  <li key={n.id}>
                    {n.message} ({fmt(n.createdAt)})
                  </li>
                ))}
              </ul>
              <Button
                variant="link-info"
                size="sm"
                className="px-0"
                onClick={onMarkRead}
              >
                Mark as read
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      )}

      {rows.length === 0 ? (
        <EmptyState
          className="py-8"
          icon={FolderClosed}
          title="No cases in closure"
          description="Cases set to Closed appear here for follow-up."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead variant="slds">Youth</TableHead>
              <TableHead variant="slds">
                Closure Started
              </TableHead>
              <TableHead variant="slds">Days on List</TableHead>
              <TableHead variant="slds">Status</TableHead>
              <TableHead variant="slds" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => {
              const eligible =
                getClosureStatus(c, now) === "eligible";
              const days = daysInClosing(c, now);
              return (
                <TableRow key={c.caseId}>
                  <TableCell className="slds-text-4 font-medium">
                    {c.name}
                  </TableCell>
                  <TableCell className="slds-text-3">
                    {fmt(c.closingStartedAt)}
                  </TableCell>
                  <TableCell className="slds-text-3">
                    {days}
                  </TableCell>
                  <TableCell>
                    {eligible ? (
                      <Badge variant="error" bordered>
                        Eligible for Archive
                      </Badge>
                    ) : (
                      <Badge variant="neutral" bordered>
                        Closing · {CLOSING_LIST_DAYS - days}{" "}
                        days left
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`View ${c.name}`}
                        title="View"
                        onClick={() => onOpen(c.caseId)}
                      >
                        <Eye />
                      </Button>
                      {canFinalize && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => setConfirm(c)}
                        >
                          Complete Closure
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <AlertDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Complete Closure
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.name} will be marked Closed and moved to
              the Admissions Closed category. The record and its
              history are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                if (
                  confirm &&
                  onFinalize(confirm.caseId) === false
                ) {
                  // Not saved: keep the confirmation open to retry.
                  e.preventDefault();
                  return;
                }
                setConfirm(null);
              }}
            >
              Complete Closure
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}