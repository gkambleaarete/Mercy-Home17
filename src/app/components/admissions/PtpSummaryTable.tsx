import { useState } from "react";
import { AlertCircle } from "@/app/lib/lucide-icons";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../ui/alert";
import { Card, CardContent } from "../ui/card";
import { PaginationInfo } from "../ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { TablePaginationBar } from "../ui/table-toolbar";
import { isoToMdy } from "../../lib/dateFormat";
import {
  isPtpStorageUnreadable,
  useYouthPtps,
  type PtpRecord,
} from "../../data/ptpStore";

// Internal Transition Summary → Summary → "Summary of PTP" (US 20101).
// Read-only and live: rows come straight from the youth-owned PTP store
// (all of the youth's PTPs, oldest first). Nothing is copied into the
// summary and nothing here writes.

const PAGE_SIZE = 10;

/** Every selected domain; "Other" shows its text when one was entered. */
function outcomeDomains(p: PtpRecord): string {
  return p.outcomeDomains
    .map((d) =>
      d === "Other" && p.otherOutcomeDomain.trim()
        ? `Other: ${p.otherOutcomeDomain.trim()}`
        : d,
    )
    .join(", ");
}

export function PtpSummaryTable({
  youthId,
}: {
  youthId: string;
}) {
  const ptps = useYouthPtps(youthId);
  const [page, setPage] = useState(1);

  if (isPtpStorageUnreadable())
    return (
      <Alert variant="error" role="alert">
        <AlertCircle />
        <AlertTitle>PTP statements can't be shown</AlertTitle>
        <AlertDescription>
          Saved PTP data for this youth can't be read right now.
        </AlertDescription>
      </Alert>
    );

  const totalPages = Math.max(
    1,
    Math.ceil(ptps.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const rows = ptps.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const start = ptps.length
    ? (safePage - 1) * PAGE_SIZE + 1
    : 0;
  const end = (safePage - 1) * PAGE_SIZE + rows.length;

  return (
    <Card variant="container">
      <Table aria-label="Summary of PTP">
        <TableHeader>
          <TableRow hoverable={false}>
            {[
              "Statement",
              "Outcome Domain",
              "Start Date",
              "End Date",
              "Goals Completed",
              "Status",
            ].map((h) => (
              <TableHead key={h} variant="slds">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ptps.length === 0 && (
            <TableRow hoverable={false}>
              <TableCell tone="muted" colSpan={6}>
                No PTP statements have been added for this
                youth.
              </TableCell>
            </TableRow>
          )}
          {rows.map((p) => (
            <TableRow key={p.id}>
              <TableCell wrap>{p.statement || "—"}</TableCell>
              <TableCell wrap>
                {outcomeDomains(p) || "—"}
              </TableCell>
              <TableCell>
                {isoToMdy(p.startDate) || "—"}
              </TableCell>
              <TableCell>
                {isoToMdy(p.endDate) || "—"}
              </TableCell>
              <TableCell>{p.goalsCompleted || "—"}</TableCell>
              <TableCell>{p.status || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {ptps.length > 0 && (
        <CardContent size="sm">
          {totalPages > 1 ? (
            <TablePaginationBar
              className="w-full"
              start={start}
              end={end}
              total={ptps.length}
              countLabel="PTP statements"
              currentPage={safePage}
              totalPages={totalPages}
              onPrevious={() => setPage(safePage - 1)}
              onNext={() => setPage(safePage + 1)}
            />
          ) : (
            <PaginationInfo
              start={start}
              end={end}
              total={ptps.length}
              label="PTP statements"
            />
          )}
        </CardContent>
      )}
    </Card>
  );
}