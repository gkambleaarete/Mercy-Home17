/**
 * Friends First mentor documents — file access integration point
 * (US 20039 Chunk 8).
 *
 * This frontend has no document store: the VMS wizard keeps uploaded files
 * in the browser and nothing persists their content. Viewing, downloading
 * and approving a document need its real content, so they go through the
 * file-access adapter below. Until a real document store is plugged in
 * there is no adapter — those actions are unavailable, and nothing is
 * generated in place of a file.
 */

import type {
  FFActor,
  FFFileRef,
} from "../data/ffMentorApplication";
import {
  getFFActingUser,
  getFFMentorApplication,
  saveFFDocumentReview,
  type FFDocumentReviewResult,
} from "../data/ffMentorApplicationStore";
import {
  currentDocumentFile,
  ffDocumentDefinition,
  fileIdentity,
} from "../data/ffMentorDocuments";

export interface FFFileRequest {
  applicationId: string;
  documentType: string;
  /** The exact upload (its document-store key). */
  storageRef: string;
}

export type FFFileFetchResult =
  | { ok: true; content: Blob }
  | { ok: false; reason: "not-found" | "error" };

export interface FFFileAccessAdapter {
  fetch(request: FFFileRequest): Promise<FFFileFetchResult>;
}

// Integration point: no document store exists yet.
let adapter: FFFileAccessAdapter | null = null;

export function setFFFileAccessAdapter(
  next: FFFileAccessAdapter | null,
): void {
  adapter = next;
}

export function isFFFileAccessConfigured(): boolean {
  return adapter !== null;
}

// Development builds only: lets local browser tests plug in test content.
// Vite drops this from production builds.
if (import.meta.env.DEV && typeof window !== "undefined")
  (
    window as unknown as Record<string, unknown>
  ).__ffSetFileAccessAdapter = setFFFileAccessAdapter;

export type FFFileOpenResult =
  | {
      ok: true;
      content: Blob;
      fileName: string;
      mimeType: string;
    }
  | {
      ok: false;
      reason:
        "not-connected" | "no-file" | "not-found" | "error";
    };

/** Retrieves the real stored content of one upload. */
export async function openFFDocumentFile(
  applicationId: string,
  documentType: string,
  file: FFFileRef | undefined,
): Promise<FFFileOpenResult> {
  const storageRef = fileIdentity(file);
  if (!storageRef || !file)
    return { ok: false, reason: "no-file" };
  if (!adapter) return { ok: false, reason: "not-connected" };
  let result: FFFileFetchResult;
  try {
    result = await adapter.fetch({
      applicationId,
      documentType,
      storageRef,
    });
  } catch {
    return { ok: false, reason: "error" };
  }
  if (!result.ok) return result;
  return {
    ok: true,
    content: result.content,
    fileName: file.fileName,
    mimeType: file.mimeType || result.content.type,
  };
}

/** Saves the real content under its original file name. */
export function downloadBlob(
  content: Blob,
  fileName: string,
): void {
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export type FFReviewFlowResult =
  | FFDocumentReviewResult
  | { ok: false; reason: "file-unavailable" };

/**
 * Approve/Reject one exact file. Approval first retrieves the file so the
 * decision rests on inspectable content, never just a file name.
 */
export async function reviewFFMentorDocument(
  applicationId: string,
  documentType: string,
  review: {
    decision: "approved" | "rejected";
    fileId: string;
    note?: string;
    verifiedDocumentDate?: string;
  },
  actor: FFActor | null = getFFActingUser(),
): Promise<FFReviewFlowResult> {
  if (review.decision === "approved") {
    const lookup = getFFMentorApplication(applicationId);
    const def = ffDocumentDefinition(documentType);
    if (lookup.status !== "found" || !def)
      return { ok: false, reason: "missing" };
    const file = currentDocumentFile(lookup.application, def);
    if (fileIdentity(file) !== review.fileId)
      return { ok: false, reason: "file-changed" };
    const opened = await openFFDocumentFile(
      applicationId,
      documentType,
      file,
    );
    if (!opened.ok)
      return { ok: false, reason: "file-unavailable" };
  }
  return saveFFDocumentReview(applicationId, documentType, {
    ...review,
    actor,
  });
}