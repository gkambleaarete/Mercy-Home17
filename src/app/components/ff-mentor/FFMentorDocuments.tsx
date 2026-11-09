// Consents & Documents → Uploaded Documents for a Mentor Application
// (US 20039 Chunk 8). View and Download show the file's real stored content;
// Approve/Reject save a decision about that exact file. When file access
// isn't available, those actions are disabled — nothing is generated.

import { useEffect, useRef, useState } from "react";
import { Info } from "@/app/lib/lucide-icons";
import { toast } from "sonner";
import { Field, Section } from "../FriendsFirstMentorRecord";
import {
  ErrMsg,
  FieldLabel,
} from "../FriendsFirstMenteeRecord";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DateInput } from "../ui/date-input";
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
import { Textarea } from "../ui/textarea";
import {
  parseRecordedDate,
  type FFMentorApplication,
  type FFMentorApplicationStaff,
} from "../../data/ffMentorApplication";
import {
  ffApplicableDocuments,
  ffDocumentStatus,
  type FFApprovalStatus,
  type FFDocumentStatus,
} from "../../data/ffMentorDocuments";
import {
  downloadBlob,
  isFFFileAccessConfigured,
  openFFDocumentFile,
  reviewFFMentorDocument,
  type FFFileOpenResult,
} from "../../lib/ffDocumentFiles";

const BORDER = "1px solid var(--slds-g-color-border-base-1)";

export const APPROVAL_VARIANT: Record<
  FFApprovalStatus,
  "neutral" | "warning" | "success" | "error"
> = {
  Pending: "neutral",
  "Pending Approval": "warning",
  Approved: "success",
  Rejected: "error",
};

const OPEN_ERROR: Record<
  Exclude<FFFileOpenResult, { ok: true }>["reason"],
  string
> = {
  "not-connected": "Documents can't be opened here yet.",
  "no-file": "This upload has no file on record.",
  "not-found": "The file couldn't be found.",
  error: "The file couldn't be opened. Please try again.",
};

const REVIEW_ERROR: Record<string, string> = {
  "file-changed":
    "This document was replaced while you were reviewing it. Review the current file instead.",
  "file-unavailable":
    "The file couldn't be opened, so it can't be approved.",
  "no-file":
    "This upload has no file on record, so it can't be reviewed.",
  actor:
    "Your user account couldn't be identified, so the decision wasn't saved.",
  missing: "This application could not be found.",
  invalid:
    "This document can't be reviewed for this application.",
  storage: "The decision could not be saved. Please try again.",
};

/** View: shows the real file (PDF in a frame, images inline). */
function ViewDialog({
  appId,
  s,
}: {
  appId: string;
  s: FFDocumentStatus;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "error"; message: string }
    | { kind: "ready"; url: string; type: string }
  >({ kind: "loading" });
  useEffect(() => {
    if (!open) return;
    let url = "";
    let live = true;
    setState({ kind: "loading" });
    openFFDocumentFile(appId, s.definition.type, s.file).then(
      (r) => {
        if (!live) return;
        if (!r.ok)
          return setState({
            kind: "error",
            message: OPEN_ERROR[r.reason],
          });
        url = URL.createObjectURL(r.content);
        setState({ kind: "ready", url, type: r.mimeType });
      },
    );
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [open, appId, s.definition.type, s.file]);

  const name = s.file?.fileName ?? s.definition.name;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="xs"
          disabled={!s.fileId || !isFFFileAccessConfigured()}
          aria-label={`View ${s.definition.name}`}
        >
          View
        </Button>
      </DialogTrigger>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>{s.definition.name}</DialogTitle>
          <DialogDescription>
            {name}
            {s.file?.uploadedAt
              ? ` · Uploaded ${s.file.uploadedAt}`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {state.kind === "loading" ? (
            <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
              Opening file…
            </p>
          ) : state.kind === "error" ? (
            <p
              role="alert"
              className="slds-text-4"
              style={{ color: "#c23934" }}
            >
              {state.message}
            </p>
          ) : state.type === "application/pdf" ? (
            <iframe
              src={state.url}
              title={name}
              className="w-full"
              style={{ minHeight: 560, border: "none" }}
            />
          ) : state.type === "image/png" ||
            state.type === "image/jpeg" ? (
            <img
              src={state.url}
              alt={name}
              className="max-w-full h-auto mx-auto"
            />
          ) : (
            <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
              Preview isn't available for this file type. Use
              Download to open it.
            </p>
          )}
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

/** Approve or Reject confirmation for the current file. */
function ReviewDialog({
  appId,
  s,
  decision,
}: {
  appId: string;
  s: FFDocumentStatus;
  decision: "approved" | "rejected";
}) {
  const verb = decision === "approved" ? "Approve" : "Reject";
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  // Set once saved: a click during the closing animation mustn't save again.
  const savedRef = useRef(false);
  // The exact file this review is about, fixed when the dialog opens.
  const [fileId, setFileId] = useState<string | null>(null);
  const isDcfsApproval =
    s.definition.type === "dcfs" && decision === "approved";
  const recordedDate = parseRecordedDate(s.file?.documentDate)
    ? s.file?.documentDate
    : undefined;
  const unavailable =
    !s.fileId ||
    (decision === "approved" && !isFFFileAccessConfigured());

  const onOpenChange = (next: boolean) => {
    if (savingRef.current) return;
    if (next) {
      savedRef.current = false;
      setNote("");
      setDate("");
      setError("");
      setDateError("");
      setFileId(s.fileId);
    }
    setOpen(next);
  };

  const confirm = async () => {
    if (savingRef.current || savedRef.current || !fileId)
      return;
    savingRef.current = true;
    setSaving(true);
    setError("");
    setDateError("");
    try {
      const result = await reviewFFMentorDocument(
        appId,
        s.definition.type,
        {
          decision,
          fileId,
          note,
          verifiedDocumentDate:
            isDcfsApproval && !recordedDate ? date : undefined,
        },
      );
      if (result.ok) {
        savedRef.current = true;
        setOpen(false);
        toast.success(
          `${s.definition.name} ${decision === "approved" ? "approved" : "rejected"}`,
        );
        return;
      }
      if (result.reason === "invalid-date")
        setDateError(
          "message" in result && result.message
            ? result.message
            : "Enter a valid certificate date.",
        );
      else
        setError(
          REVIEW_ERROR[result.reason] ?? REVIEW_ERROR.storage,
        );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={
            decision === "approved"
              ? "outline-primary"
              : "outline"
          }
          size="xs"
          disabled={unavailable}
          aria-label={`${verb} ${s.definition.name}`}
        >
          {verb}
        </Button>
      </DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>
            {verb} {s.definition.name}
          </DialogTitle>
          <DialogDescription>
            {s.file?.fileName}
            {s.file?.uploadedAt
              ? ` · Uploaded ${s.file.uploadedAt}`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {isDcfsApproval &&
            (recordedDate ? (
              <Field
                label="Certificate Date"
                value={recordedDate}
              />
            ) : (
              <div>
                <FieldLabel htmlFor="dcfs-date" required>
                  Certificate Date (from the certificate)
                </FieldLabel>
                <DateInput
                  id="dcfs-date"
                  value={date}
                  onChange={(v) => {
                    setDate(v);
                    setDateError("");
                  }}
                  aria-invalid={!!dateError}
                  aria-describedby={
                    dateError
                      ? "dcfs-date-error"
                      : "dcfs-date-help"
                  }
                />
                {dateError ? (
                  <div role="alert">
                    <ErrMsg id="dcfs-date" msg={dateError} />
                  </div>
                ) : (
                  <p
                    id="dcfs-date-help"
                    className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1"
                  >
                    Must be within the last 3 years.
                  </p>
                )}
              </div>
            ))}
          <div>
            <FieldLabel
              htmlFor={`review-note-${s.definition.type}`}
            >
              Review Notes
            </FieldLabel>
            <Textarea
              id={`review-note-${s.definition.type}`}
              size="md"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          {error && (
            <p
              role="alert"
              className="slds-text-4"
              style={{ color: "#c23934" }}
            >
              {error}
            </p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={confirm} disabled={saving}>
            {verb}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FFMentorDocuments({
  app,
  staff,
}: {
  app: FFMentorApplication;
  staff: FFMentorApplicationStaff;
}) {
  const statuses = ffApplicableDocuments(app).map((d) =>
    ffDocumentStatus(app, staff, d.type),
  );
  const connected = isFFFileAccessConfigured();
  const [rowMessage, setRowMessage] = useState<
    Record<string, string>
  >({});

  const download = async (s: FFDocumentStatus) => {
    setRowMessage((m) => ({ ...m, [s.definition.type]: "" }));
    const r = await openFFDocumentFile(
      app.applicationId,
      s.definition.type,
      s.file,
    );
    if (!r.ok) {
      setRowMessage((m) => ({
        ...m,
        [s.definition.type]: OPEN_ERROR[r.reason],
      }));
      return;
    }
    downloadBlob(r.content, r.fileName);
  };

  return (
    <Section title="Uploaded Documents">
      <div className="flex flex-col gap-3">
        {!connected && (
          <Alert variant="info">
            <Info />
            <AlertDescription>
              Uploaded documents can't be opened here yet, so
              they can't be viewed, downloaded or approved.
              Saved decisions are still shown.
            </AlertDescription>
          </Alert>
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
                <TableHead>Upload Date</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>File Status</TableHead>
                <TableHead>Approval Status</TableHead>
                <TableHead>Reviewed By</TableHead>
                <TableHead>Review Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statuses.map((s) => {
                const t = s.definition.type;
                const messages = [
                  ...s.issues,
                  rowMessage[t],
                ].filter(Boolean);
                return (
                  <TableRow key={t}>
                    <TableCell wrap>
                      {s.definition.name}
                      {s.file && (
                        <span className="block slds-text-3 text-[var(--slds-g-color-text-weak)] break-all">
                          {s.file.fileName}
                        </span>
                      )}
                    </TableCell>
                    <TableCell wrap>
                      {s.definition.category}
                    </TableCell>
                    <TableCell>
                      {s.file?.uploadedAt || "—"}
                    </TableCell>
                    <TableCell wrap>
                      {s.file
                        ? s.file.uploadedBy || "Not recorded"
                        : "—"}
                    </TableCell>
                    <TableCell wrap>{s.fileState}</TableCell>
                    <TableCell>
                      <Badge
                        variant={APPROVAL_VARIANT[s.approval]}
                      >
                        {s.approval}
                      </Badge>
                    </TableCell>
                    <TableCell wrap>
                      {s.review?.reviewedBy ?? "—"}
                    </TableCell>
                    <TableCell wrap>
                      {s.review?.reviewedAt ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="grid grid-cols-2 gap-1.5 w-max">
                        <ViewDialog
                          appId={app.applicationId}
                          s={s}
                        />
                        <Button
                          variant="outline"
                          size="xs"
                          disabled={!s.fileId || !connected}
                          aria-label={`Download ${s.definition.name}`}
                          onClick={() => download(s)}
                        >
                          Download
                        </Button>
                        <ReviewDialog
                          appId={app.applicationId}
                          s={s}
                          decision="approved"
                        />
                        <ReviewDialog
                          appId={app.applicationId}
                          s={s}
                          decision="rejected"
                        />
                      </div>
                      {messages.length > 0 && (
                        <ul className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1 max-w-xs whitespace-normal">
                          {messages.map((m) => (
                            <li key={m}>{m}</li>
                          ))}
                        </ul>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </Section>
  );
}