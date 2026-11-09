import { ArrowLeft, Sparkles } from "@/app/lib/lucide-icons";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import type { TransitionSummary } from "../../data/mockTransitionSummary";

// Treatment Planning > Transition Summary — read-only view of one saved
// External Transition Summary. Every value comes from the `summary` prop
// (the selected youth-owned record); there is no fallback report.

function MetaField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
        {label}
      </p>
      <p className="slds-text-4 font-medium text-[var(--slds-g-color-text-default)] break-words">
        {value || "—"}
      </p>
    </div>
  );
}

function HistoryTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <Card variant="container">
      <CardHeader size="sm">
        <CardTitle size="sm">{title}</CardTitle>
      </CardHeader>
      <CardContent size="sm" className="pt-0">
        <Card variant="container">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead
                    key={c}
                    variant="slds"
                    className="whitespace-normal"
                  >
                    {c}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow hoverable={false}>
                  <TableCell
                    tone="muted"
                    colSpan={columns.length}
                  >
                    No entries recorded.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row, i) => (
                <TableRow key={i}>
                  {row.map((cell, j) => (
                    <TableCell
                      key={j}
                      // whitespace-normal: let long names wrap on narrow
                      // screens instead of forcing a horizontal scroll.
                      className={`px-4 py-2.5 whitespace-normal slds-text-4 text-[var(--slds-g-color-text-default)]${j === 0 ? " font-medium" : ""}`}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </CardContent>
    </Card>
  );
}

export function TransitionSummarySection({
  summary,
  onBack,
  headerAction,
  description,
  itpOverview,
  staffHistory,
  narratives,
  footer,
}: {
  summary: TransitionSummary;
  onBack: () => void;
  /** Optional slots used by the External editor (US 20103); when omitted
   *  the report renders read-only exactly as before. */
  headerAction?: React.ReactNode;
  /** Replaces the default status description (workflow/provenance). */
  description?: React.ReactNode;
  /** Read-only ITP overview, shown before the histories (US 20103). */
  itpOverview?: React.ReactNode;
  staffHistory?: React.ReactNode;
  narratives?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const isFinalized = summary.status === "Finalized";

  const metadata: { label: string; value: string }[] = [
    { label: "Youth Name", value: summary.youthName },
    { label: "Date of Birth", value: summary.dateOfBirth },
    { label: "Admission Date", value: summary.admissionDate },
    { label: "Transition Date", value: summary.transitionDate },
    { label: "Length of Stay", value: summary.lengthOfStay },
    { label: "Generated Date", value: summary.generatedDate },
    { label: "Finalized By", value: summary.finalizedBy },
    { label: "Finalized Date", value: summary.finalizedDate },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Summary header ── */}
      <Card variant="section">
        <CardHeader>
          <CardTitle className="slds-section-title text-[var(--slds-g-color-text-default)]">
            External Transition Summary
          </CardTitle>
          <CardDescription className="slds-text-4">
            {description ??
              (isFinalized
                ? "This transition document is now finalized and read-only. Ready for external transition stakeholders."
                : "This transition document is still in draft.")}
          </CardDescription>
          <CardAction className="flex items-center gap-2">
            {headerAction}
            <Badge
              variant={
                isFinalized
                  ? "success"
                  : summary.status === "Draft"
                    ? "neutral"
                    : "info"
              }
              bordered
            >
              {summary.status}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Placeholder only — no AI service is wired up yet. */}
          <Button
            type="button"
            className="rounded-full text-white"
            style={{
              backgroundColor: "var(--color-brand-primary)",
            }}
            onClick={() =>
              toast.info("AI summary generation coming soon.")
            }
          >
            <Sparkles />
            Generate AI Summary
          </Button>
        </CardContent>
      </Card>

      {/* ── Report ── */}
      <Card variant="section">
        <CardContent className="py-6 sm:py-8 px-4 lg:px-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="slds-text-7 font-bold text-[var(--slds-g-color-text-default)]">
              MERCY HOME FOR BOYS &amp; GIRLS
            </h2>
            <p className="slds-text-4 uppercase tracking-wider text-[var(--slds-g-color-text-weak)]">
              External Transition Summary Report
            </p>
          </div>
          <Separator />

          {/* Metadata */}
          <Card variant="container" surface="alt">
            <CardContent
              size="sm"
              className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 desktop:grid-cols-5 gap-x-6 gap-y-4"
            >
              {metadata.map((m) => (
                <MetaField
                  key={m.label}
                  label={m.label}
                  value={m.value}
                />
              ))}
            </CardContent>
          </Card>

          {itpOverview}

          <HistoryTable
            title="Program History"
            columns={["Program", "Start Date", "End Date"]}
            rows={summary.programHistory.map((p) => [
              p.program,
              p.startDate,
              p.endDate,
            ])}
          />

          {staffHistory ?? (
            <HistoryTable
              title="Key Staff History"
              columns={[
                "Role",
                "Staff Member",
                "Start Date",
                "End Date",
              ]}
              rows={summary.keyStaffHistory.map((s) => [
                s.role,
                s.staffMember,
                s.startDate,
                s.endDate,
              ])}
            />
          )}

          <Separator />

          {/* Clinical & Progress Narratives */}
          <section className="space-y-4">
            <h3 className="slds-section-title text-[var(--slds-g-color-text-default)]">
              Clinical &amp; Progress Narratives
            </h3>
            {narratives ?? (
              <>
                {summary.narratives.length === 0 && (
                  <p className="slds-text-body-small text-[var(--slds-g-color-text-weak)]">
                    No narratives recorded.
                  </p>
                )}
                {summary.narratives.map((n, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)]">
                      {n.title}
                    </h4>
                    <p className="slds-text-body-small text-[var(--slds-g-color-text-default)] break-words whitespace-pre-wrap">
                      {n.content}
                    </p>
                    {i < summary.narratives.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </>
            )}
          </section>
        </CardContent>
      </Card>

      {/* ── Bottom actions ── Viewing only: content editing is not
          available here, so the only action returns to the list. */}
      <div className="flex items-center justify-end gap-2">
        {footer}
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={onBack}
          data-leave-guard
        >
          <ArrowLeft />
          Back to Transition Summaries
        </Button>
      </div>
    </div>
  );
}