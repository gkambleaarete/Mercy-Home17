import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { retrieveYouthDocumentFile } from "../../../data/youthDocumentStore";
import type {
  DocumentOwnerScope,
  YouthDocument,
} from "../../../data/youthDocumentTypes";
import { scopeKey } from "../../../lib/youthDocumentOwner";

// File preview for one document (US 20147). The file is requested through
// the authorized retrieval service every time the dialog opens — a row that
// was visible earlier does not keep authorizing its file. The object URL is
// temporary: revoked on close, on a new request and on unmount.

type PreviewState =
  | { kind: "loading" }
  | { kind: "ready"; url: string; mediaType: string }
  | {
      kind: "error";
      reason: "not-found" | "denied" | "unavailable" | "error";
    };

const MESSAGES: Record<
  "not-found" | "denied" | "unavailable" | "error",
  string
> = {
  denied: "You do not have access to this file.",
  "not-found": "The file is unavailable.",
  unavailable:
    "Laserfiche storage is not connected, so the file cannot be retrieved.",
  error: "The file could not be retrieved. Try again.",
};

export function YouthDocumentPreviewDialog({
  document: doc,
  scope,
  onClose,
}: {
  /** null = closed. */
  document: YouthDocument | null;
  /** The verified owner scope the file is requested under. */
  scope: DocumentOwnerScope;
  onClose: () => void;
}) {
  const [state, setState] = useState<PreviewState>({
    kind: "loading",
  });
  const [attempt, setAttempt] = useState(0);
  const docId = doc?.id;
  const ownerKey = scopeKey(scope);
  const mediaType = doc?.file.mediaType;

  useEffect(() => {
    if (!docId) return;
    let cancelled = false;
    let url: string | null = null;
    // A new request never shows the previous file.
    setState({ kind: "loading" });
    retrieveYouthDocumentFile(docId, scope).then((r) => {
      if (cancelled) return;
      if (!r.ok) {
        setState({ kind: "error", reason: r.reason });
        return;
      }
      // Type comes from the stored record, not from the bytes.
      const blob = new Blob([r.content], { type: mediaType });
      url = URL.createObjectURL(blob);
      setState({
        kind: "ready",
        url,
        mediaType: mediaType ?? "",
      });
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [docId, ownerKey, mediaType, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={!!doc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle className="[overflow-wrap:anywhere]">
            {doc?.documentName ?? "Document"}
          </DialogTitle>
          <DialogDescription className="[overflow-wrap:anywhere]">
            {doc?.file.name}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div
            className="min-h-[360px]"
            aria-live="polite"
            data-testid="document-preview"
          >
            {state.kind === "loading" && (
              <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                Loading file…
              </p>
            )}
            {state.kind === "error" && (
              <div role="alert" className="space-y-3">
                <p>{MESSAGES[state.reason]}</p>
                {(state.reason === "error" ||
                  state.reason === "unavailable") && (
                  <Button
                    variant="outline"
                    onClick={() => setAttempt((n) => n + 1)}
                  >
                    Retry
                  </Button>
                )}
              </div>
            )}
            {state.kind === "ready" &&
              (state.mediaType === "application/pdf" ? (
                <iframe
                  title={`Preview of ${doc?.file.name}`}
                  src={state.url}
                  className="h-[60vh] w-full border border-border"
                />
              ) : (
                <img
                  src={state.url}
                  alt={doc?.file.name ?? "Document"}
                  className="mx-auto max-h-[60vh] max-w-full object-contain"
                />
              ))}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Back
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}