import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Lock } from "@/app/lib/lucide-icons";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { isoToMdy } from "../../../lib/dateFormat";
import {
  canEditRecord,
  currentDocumentAccess,
} from "../../../data/youthDocumentAccess";
import type {
  DocumentOwnerScope,
  YouthDocument,
} from "../../../data/youthDocumentTypes";
import { YouthDocumentPreviewDialog } from "./YouthDocumentPreviewDialog";

// Document Record modal (US 20147). Read-only; Close changes nothing.
// Shows only general document fields — no process-specific (TB,
// Immunization…) labels.

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="slds-form-label mb-1 text-[var(--slds-g-color-text-weak)]">
        {label}
      </dt>
      <dd className="min-h-[1.25rem] break-words">
        {children === "" || children == null ? (
          <span className="sr-only">Not provided</span>
        ) : (
          children
        )}
      </dd>
    </div>
  );
}

function Section({
  title,
  secondary,
  children,
}: {
  title: string;
  /** Lower-priority read-only metadata, set apart below the primary list. */
  secondary?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="slds-text-3 font-semibold uppercase tracking-wide text-[var(--slds-g-color-text-weak)] border-b border-border pb-1.5">
        {title}
      </h3>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        {children}
      </dl>
      {secondary && (
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 border-t border-border pt-4 sm:grid-cols-2">
          {secondary}
        </dl>
      )}
    </section>
  );
}

/** Audit timestamp → MM/DD/YYYY h:mm AM/PM in the user's local time. */
export function formatAuditTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function YouthDocumentRecordDialog({
  document: doc,
  scope,
  youthName,
  onClose,
  onEdit,
}: {
  /** null = closed. */
  document: YouthDocument | null;
  /** The verified owner scope this record is being viewed under. */
  scope: DocumentOwnerScope;
  youthName: string;
  onClose: () => void;
  onEdit: (doc: YouthDocument) => void;
}) {
  const [previewing, setPreviewing] = useState(false);
  const viewRef = useRef<HTMLButtonElement>(null);
  // The preview never outlives the record it was opened for: closing the
  // record (or losing access to it) also drops the preview.
  const docId = doc?.id ?? null;
  useEffect(() => {
    setPreviewing(false);
  }, [docId]);
  // Edit is offered only when the current access allows it.
  const editable =
    !!doc && canEditRecord(currentDocumentAccess(), doc.restricted);

  return (
    <>
      <Dialog open={!!doc} onOpenChange={(o) => !o && onClose()}>
        <DialogContent size="xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Document Record</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {doc && (
              <div className="space-y-6">
                <Section title="Basic Information">
                  <Field label="Document Type">
                    {doc.documentType}
                  </Field>
                  <Field label="Document Name">
                    {doc.documentName}
                  </Field>
                  <Field label="Youth">
                    {scope.primary.kind === "youth" ? (
                      <Link
                        to={`/constituents/${scope.primary.id}`}
                        className="text-[var(--slds-g-color-link,#145F33)] underline-offset-2 hover:underline"
                      >
                        {youthName}
                      </Link>
                    ) : (
                      // Not linked to a Youth Constituent yet: no profile
                      // link to follow.
                      youthName
                    )}
                  </Field>
                </Section>

                <Section
                  title="Document Information"
                  secondary={
                    <>
                      <Field label="Folder">{doc.effectiveFolder}</Field>
                      <Field label="Document Restricted">
                        {doc.restricted ? (
                          <span className="inline-flex items-center gap-1">
                            <Lock className="h-3.5 w-3.5" aria-hidden />
                            Yes
                          </span>
                        ) : (
                          "No"
                        )}
                      </Field>
                      <Field label="Expiration Date">
                        {isoToMdy(doc.expirationDate)}
                      </Field>
                      <Field label="Descriptor">{doc.descriptor}</Field>
                    </>
                  }
                >
                  <Field label="Date Filed">
                    {isoToMdy(doc.dateFiled)}
                  </Field>
                  <Field label="Date Executed">
                    {isoToMdy(doc.dateExecuted)}
                  </Field>
                  <Field label="Document">
                    <Button
                      ref={viewRef}
                      type="button"
                      variant="link-info"
                      size="inline"
                      onClick={() => setPreviewing(true)}
                    >
                      View Document
                    </Button>
                  </Field>
                </Section>

                <Section title="Audit Information">
                  <Field label="Created By">{doc.createdBy}</Field>
                  <Field label="Created Date">
                    {formatAuditTimestamp(doc.createdAt)}
                  </Field>
                  <Field label="Last Modified By">
                    {doc.lastModifiedBy}
                  </Field>
                  <Field label="Last Modified Date">
                    {formatAuditTimestamp(doc.lastModifiedAt)}
                  </Field>
                </Section>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {editable && doc && (
              <Button onClick={() => onEdit(doc)}>Edit</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <YouthDocumentPreviewDialog
        document={previewing ? doc : null}
        scope={scope}
        onClose={() => {
          setPreviewing(false);
          // Return focus to the control that opened the preview.
          requestAnimationFrame(() => viewRef.current?.focus());
        }}
      />
    </>
  );
}