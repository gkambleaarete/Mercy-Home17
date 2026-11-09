// Consents & Documents → Agreements for a Mentor Application (US 20039
// Chunk 7). Read-only table of required and additional agreements with a
// DLG-01 view of the saved signing details. Nothing here writes.

import { Field, Section } from "../FriendsFirstMentorRecord";
import { Badge } from "../ui/badge";
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
import type {
  FFMentorApplication,
  FFMentorApplicationStaff,
} from "../../data/ffMentorApplication";
import {
  ffAgreementRows,
  ffProgramNames,
  type FFAgreementRow,
  type FFAgreementStatus,
} from "../../data/ffMentorAgreements";

const BORDER = "1px solid var(--slds-g-color-border-base-1)";
const NOT_RECORDED = "Not recorded";

const STATUS_VARIANT: Record<
  FFAgreementStatus,
  "success" | "warning" | "neutral" | "error"
> = {
  "Signed and Agreed": "success",
  "Signature Required": "warning",
  Unverified: "error",
  "Not Signed": "neutral",
};

const METHOD_LABEL = { draw: "Drawn", type: "Typed" } as const;

function AgreementDialog({ row }: { row: FFAgreementRow }) {
  const signed =
    row.status === "Signed and Agreed" || !!row.signedAt;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="xs"
          aria-label={`View ${row.name}`}
        >
          View
        </Button>
      </DialogTrigger>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>{row.name}</DialogTitle>
          <DialogDescription>
            {row.category} · {row.status}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-5">
          {row.issue && (
            <p
              role="note"
              className="slds-text-4"
              style={{ color: "#c23934" }}
            >
              {row.issue}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <Field
              label="Applies To"
              value={
                row.required
                  ? ffProgramNames(row.appliesTo)
                  : "Additional agreement (not a required form)"
              }
            />
            <Field label="Status" value={row.status} />
            <Field
              label="Signed By / Signed As"
              value={
                row.signedAs ?? (signed ? NOT_RECORDED : "")
              }
            />
            <Field
              label="Signature Date/Time"
              value={
                row.signedAt ?? (signed ? NOT_RECORDED : "")
              }
            />
            <Field
              label="Signature Method"
              value={
                row.method
                  ? METHOD_LABEL[row.method]
                  : signed
                    ? NOT_RECORDED
                    : ""
              }
            />
            {row.method === "type" && row.signedAs && (
              <Field
                label="Typed Signature"
                value={row.signedAs}
              />
            )}
            <Field
              label="Reviewed By"
              value={row.review?.reviewedBy ?? ""}
            />
            <Field
              label="Review Date"
              value={row.review?.reviewedAt ?? ""}
            />
          </div>
          {row.method === "draw" && (
            <div>
              <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
                Drawn Signature
              </p>
              {row.preview ? (
                <img
                  src={row.preview}
                  alt={`Drawn signature${row.signedAs ? ` of ${row.signedAs}` : ""}`}
                  className="max-h-32 rounded-md"
                  style={{ border: BORDER }}
                />
              ) : (
                <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
                  No image of the drawn signature was saved. The
                  signing record above still stands.
                </p>
              )}
            </div>
          )}
          <div>
            <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
              Agreement Content
            </p>
            <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
              The version of this agreement that was signed
              isn't recorded with the application, so its
              content can't be shown here.
            </p>
          </div>
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

export function FFMentorAgreements({
  app,
  staff,
}: {
  app: FFMentorApplication;
  staff: FFMentorApplicationStaff;
}) {
  const rows = ffAgreementRows(app, staff);
  const unverified = rows.filter(
    (r) => r.required && r.status === "Unverified",
  ).length;
  return (
    <>
      <Section title="Agreements" first>
        <div className="flex flex-col gap-3">
          {unverified > 0 && (
            <p
              className="slds-text-4"
              style={{ color: "#c23934" }}
            >
              {unverified} required agreement
              {unverified > 1 ? "s have" : " has"} signing
              records that can't be verified. View each for
              details.
            </p>
          )}
          <div
            className="overflow-x-auto rounded-lg"
            style={{ border: BORDER }}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewed By</TableHead>
                  <TableHead>Review Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell wrap>
                      {r.name}
                      {!r.required && (
                        <span className="block slds-text-3 text-[var(--slds-g-color-text-weak)]">
                          Additional — not a required form
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{r.category}</TableCell>
                    <TableCell wrap>
                      {r.signedAt ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[r.status]}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {r.review?.reviewedBy ?? "—"}
                    </TableCell>
                    <TableCell>
                      {r.review?.reviewedAt ?? "—"}
                    </TableCell>
                    <TableCell>
                      <AgreementDialog row={r} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Section>
    </>
  );
}