/**
 * Friends First reference requests — integration point (US 20039 Chunk 6).
 *
 * This frontend has no email/delivery service (same situation as
 * academicSnapshotTask.ts). Resending a reference request goes through the
 * delivery adapter below; until a real service is plugged in, there is no
 * adapter and every resend reports "not_configured" — nothing is sent and
 * nothing is recorded.
 *
 * A request is recorded on the application only after the service confirms
 * it, and the record says whether the service confirmed delivery or only
 * accepted (queued) the message. A request never changes a reference's
 * response status.
 */

import {
  getFFActingUser,
  getFFMentorApplication,
  newFFEventId,
  recordFFReferenceRequest,
} from "../data/ffMentorApplicationStore";
import type { FFActor } from "../data/ffMentorApplication";
import { localStamp } from "../data/ffMenteeIntake";

export interface FFReferenceRequestMessage {
  applicationId: string;
  referenceId: string;
  to: string;
  recipientName: string;
  /** Same key for the same attempt, so the service can drop duplicates. */
  idempotencyKey: string;
}

export type FFDeliveryResult =
  | { status: "delivered" | "accepted"; messageId?: string }
  | { status: "failed"; error?: string };

export interface FFReferenceDeliveryAdapter {
  send(
    message: FFReferenceRequestMessage,
  ): Promise<FFDeliveryResult>;
}

// Integration point: no delivery service exists yet.
let adapter: FFReferenceDeliveryAdapter | null = null;

/** Plugs in the delivery service (or a test double). null = none. */
export function setFFReferenceDeliveryAdapter(
  next: FFReferenceDeliveryAdapter | null,
): void {
  adapter = next;
}

export function isFFReferenceDeliveryConfigured(): boolean {
  return adapter !== null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FFResendBlock =
  | "declined"
  | "not_configured"
  | "no-permission"
  | "invalid-email";

/** Why a reference can't be resent right now, if it can't. */
export function ffResendBlock(ref: {
  permissionGranted?: boolean;
  email?: string;
  responseStatus?: string;
}): FFResendBlock | null {
  // No workflow is defined for re-requesting a declined reference.
  if (ref.responseStatus === "declined") return "declined";
  if (ref.permissionGranted !== true) return "no-permission";
  if (!EMAIL_RE.test((ref.email ?? "").trim()))
    return "invalid-email";
  if (!adapter) return "not_configured";
  return null;
}

export type FFResendResult =
  | {
      ok: true;
      outcome: "delivered" | "accepted";
      tracked: boolean;
    }
  | {
      ok: false;
      reason:
        | FFResendBlock
        | "missing"
        | "actor"
        | "in-progress"
        | "send-failed";
    };

const inFlight = new Set<string>();

/**
 * Resends the request for one reference on one application. A second call
 * for the same reference while one is in flight is refused. If the service
 * confirms but the request can't be recorded, `tracked` is false — the
 * message still went out, so it must not be resent blindly.
 */
export async function resendFFReferenceRequest(
  applicationId: string,
  referenceId: string,
  actor: FFActor | null = getFFActingUser(),
): Promise<FFResendResult> {
  const lookup = getFFMentorApplication(applicationId);
  if (lookup.status !== "found")
    return { ok: false, reason: "missing" };
  const ref = (lookup.application.references ?? []).find(
    (r) => r.id === referenceId,
  );
  if (!ref) return { ok: false, reason: "missing" };
  const block = ffResendBlock(ref);
  if (block) return { ok: false, reason: block };
  if (!actor?.id?.trim() || !actor.name?.trim())
    return { ok: false, reason: "actor" };
  const key = `${applicationId}:${referenceId}`;
  if (inFlight.has(key))
    return { ok: false, reason: "in-progress" };
  inFlight.add(key);
  try {
    let result: FFDeliveryResult;
    try {
      result = await adapter!.send({
        applicationId,
        referenceId,
        to: ref.email.trim(),
        recipientName: ref.name,
        idempotencyKey: `${key}:${newFFEventId()}`,
      });
    } catch {
      return { ok: false, reason: "send-failed" };
    }
    if (result.status === "failed")
      return { ok: false, reason: "send-failed" };
    const when = new Date();
    const { date, time } = localStamp(when);
    const tracked = recordFFReferenceRequest(
      applicationId,
      referenceId,
      {
        id: newFFEventId(),
        outcome: result.status,
        at: `${date} ${time}`,
        atIso: when.toISOString(),
        by: actor.name,
        byId: actor.id,
        messageId: result.messageId,
      },
    ).ok;
    return { ok: true, outcome: result.status, tracked };
  } finally {
    inFlight.delete(key);
  }
}