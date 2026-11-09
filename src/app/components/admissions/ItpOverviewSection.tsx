import { AlertCircle, ListChecks } from "@/app/lib/lucide-icons";
import { Link } from "react-router";
import { Button } from "../ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../ui/alert";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { isoToMdy } from "../../lib/dateFormat";
import type { ReportItp } from "../../data/externalReportModel";

// External Transition Summary → ITP overview (US 20103). Read-only; renders
// the resolved report model's ITP data (live for Draft, the captured
// version afterwards), so the screen and the printout always agree.

export function ItpOverviewSection({
  itp,
  youthId,
  summaryId,
  canManage,
}: {
  itp: ReportItp;
  youthId: string;
  /** The open External summary, for the return link. */
  summaryId: string;
  /** Draft reports only: link to manage a plan's goals. */
  canManage: boolean;
}) {
  return (
    <Card variant="container">
      <CardHeader size="sm">
        <CardTitle size="sm" id="ets-itp-heading">
          Individual Treatment Plans
        </CardTitle>
      </CardHeader>
      <CardContent size="sm" className="pt-0 space-y-4">
        {itp.state === "unreadable" && (
          <Alert variant="error" role="alert">
            <AlertCircle />
            <AlertTitle>ITP goals can't be shown</AlertTitle>
            <AlertDescription>
              Saved ITP goal data can't be read right now.
            </AlertDescription>
          </Alert>
        )}
        {itp.state === "historical-unavailable" && (
          <Alert variant="warning">
            <AlertCircle />
            <AlertTitle>
              ITP and goal history not available
            </AlertTitle>
            <AlertDescription>
              This report was finalized before report versions
              were captured, so the ITPs and goals as they were
              at finalization aren't available. Current ITP data
              isn't shown in their place.
            </AlertDescription>
          </Alert>
        )}
        {itp.state === "ok" && itp.plans.length === 0 && (
          <p className="slds-text-body-small text-[var(--slds-g-color-text-weak)]">
            No ITPs are recorded for this youth.
          </p>
        )}
        {itp.state === "ok" &&
          itp.plans.map((plan) => {
            const headingId = `ets-itp-${plan.id}`;
            return (
              <section
                key={plan.id}
                aria-labelledby={headingId}
                className="space-y-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h4
                    id={headingId}
                    className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)]"
                  >
                    ITP-{plan.id}
                  </h4>
                  <Badge
                    variant={
                      plan.isFinalized ? "success" : "neutral"
                    }
                    bordered
                  >
                    Status: {plan.status}
                  </Badge>
                  {canManage && (
                    <Button
                      asChild
                      variant="outline-primary"
                      size="xs"
                    >
                      <Link
                        to={`/itp-module/verified/${plan.id}?youth=${encodeURIComponent(youthId)}&summary=${encodeURIComponent(summaryId)}`}
                        aria-label={`Manage goals for ITP-${plan.id}`}
                      >
                        <ListChecks />
                        Manage Goals
                      </Link>
                    </Button>
                  )}
                </div>
                <p className="slds-text-body-small text-[var(--slds-g-color-text-weak)]">
                  ITP Date {isoToMdy(plan.itpDate) || "—"} ·
                  Started {isoToMdy(plan.startedDate) || "—"}
                </p>
                {plan.goals.length > 0 ? (
                  <Card variant="container">
                    <Table aria-label={`ITP-${plan.id} goals`}>
                      <TableHeader>
                        <TableRow hoverable={false}>
                          {[
                            "Goal",
                            "Outcome Domain",
                            "Start Date",
                            "Target End Date",
                            "End Date",
                            "Status",
                          ].map((h) => (
                            <TableHead
                              key={h}
                              variant="slds"
                              className="whitespace-normal"
                            >
                              {h}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {plan.goals.map((g) => (
                          <TableRow key={g.id}>
                            <TableCell wrap>
                              {g.intermediate
                                ? `Intermediate goal: ${g.goal}`
                                : g.goal}
                            </TableCell>
                            <TableCell wrap>
                              {g.outcomeDomain || "—"}
                            </TableCell>
                            <TableCell>
                              {isoToMdy(g.startDate) || "—"}
                            </TableCell>
                            <TableCell>
                              {isoToMdy(g.targetEndDate) || "—"}
                            </TableCell>
                            <TableCell>
                              {isoToMdy(g.endDate) || "—"}
                            </TableCell>
                            <TableCell>
                              {g.status || "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                ) : (
                  <p className="slds-text-body-small text-[var(--slds-g-color-text-weak)]">
                    {plan.hasUnlinkedWorkspace
                      ? "No goals are recorded for this plan. Goals in its ITP workspace aren't linked to this youth's record, so they aren't shown."
                      : "No goals are recorded for this plan."}
                  </p>
                )}
              </section>
            );
          })}
      </CardContent>
    </Card>
  );
}