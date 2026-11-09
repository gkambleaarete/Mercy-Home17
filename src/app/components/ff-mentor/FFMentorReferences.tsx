// References tab for a Mentor Application (US 20039 Chunk 6): requirement
// summary, the applicant's references, a read-only response view (DLG-01)
// and Resend Request through the reference-request integration point.
// Nothing here marks a response received.

import { useRef, useState } from "react";
import { AlertTriangle, Info, Users } from "@/app/lib/lucide-icons";
import { toast } from "sonner";
import { Field, Section } from "../FriendsFirstMentorRecord";
import { Alert, AlertDescription } from "../ui/alert";
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
import { EmptyState } from "../ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  FF_SUB_PROGRAM_NAME,
  assessFFReferences,
  isReferenceReceived,
  referenceResponseLabel,
  type FFApplicationReference,
  type FFMentorApplication,
  type FFMentorApplicationStaff,
  type FFReferenceResponse,
} from "../../data/ffMentorApplication";
import {
  ffResendBlock,
  isFFReferenceDeliveryConfigured,
  resendFFReferenceRequest,
  type FFResendResult,
} from "../../lib/ffReferenceRequests";

const BORDER = "1px solid var(--slds-g-color-border-base-1)";

const TYPE_LABEL: Record<string, string> = {
  personal: "Personal",
  business: "Business",
};

// Questionnaire wording (VMS Reference Questionnaire).
const RATING_LABEL: Record<number, string> = {
  1: "Poor",
  2: "Below Average",
  3: "Average",
  4: "Good",
  5: "Excellent",
};

const BLOCK_MESSAGE = {
  declined:
    "This reference declined. Requests can't be resent to a declined reference.",
  "no-permission":
    "Permission to contact this reference wasn't confirmed.",
  "invalid-email":
    "This reference doesn't have a valid email address.",
  not_configured: "Email delivery isn't available.",
} as const;

const yesNo = (v: boolean | undefined) =>
  v === true ? "Yes" : v === false ? "No" : "Not provided";

function ResponseDialog({
  reference: r,
  response,
}: {
  reference: FFApplicationReference;
  response: FFReferenceResponse | undefined;
}) {
  const received = isReferenceReceived(r);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="xs"
          aria-label={`View response from ${r.name || "this reference"}`}
        >
          View Response
        </Button>
      </DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Reference Response</DialogTitle>
          <DialogDescription>
            {r.name || "Reference"} ·{" "}
            {referenceResponseLabel(r)}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {r.responseStatus === "declined" ? (
            <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
              This reference declined. No response was received.
              {r.responseDate
                ? ` Recorded ${r.responseDate}.`
                : ""}
            </p>
          ) : !received ? (
            <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
              No response has been received from this reference
              yet.
            </p>
          ) : !response ? (
            <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
              A response was received, but its content isn't
              available here.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <Field
                label="How do you know the applicant?"
                value={response.howKnow ?? ""}
              />
              <Field
                label="In what settings have you seen them interact with young people?"
                value={response.settings ?? ""}
              />
              <Field
                label="Describe their ability to build trust and rapport with youth"
                value={response.trustBuild ?? ""}
              />
              <Field
                label="Reliability rating"
                value={
                  response.rating
                    ? `${response.rating} – ${RATING_LABEL[response.rating] ?? ""}`.trim()
                    : ""
                }
              />
              <Field
                label="Describe their judgement and ability to maintain appropriate boundaries"
                value={response.judgement ?? ""}
              />
              <Field
                label="Signed As"
                value={response.signedAs ?? ""}
              />
              <Field
                label="Response Date"
                value={
                  response.submittedAt ?? r.responseDate ?? ""
                }
              />
            </div>
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

const RESULT_MESSAGE: Record<
  Exclude<FFResendResult, { ok: true }>["reason"],
  string
> = {
  ...BLOCK_MESSAGE,
  missing: "This reference could not be found.",
  actor:
    "Your user account couldn't be identified, so nothing was sent.",
  "in-progress":
    "A request to this reference is already being sent.",
  "send-failed":
    "The request could not be sent. Please try again.",
};

export function FFMentorReferences({
  app,
  staff,
}: {
  app: FFMentorApplication;
  staff: FFMentorApplicationStaff;
}) {
  const refs = app.references ?? [];
  const a = assessFFReferences(app);
  const single = a.programs.length === 1 ? a.programs[0] : null;
  const deliveryReady = isFFReferenceDeliveryConfigured();
  const [sending, setSending] = useState<
    Record<string, boolean>
  >({});
  const [rowMessage, setRowMessage] = useState<
    Record<string, string>
  >({});
  // Clicks that land before the button re-renders as disabled are ignored.
  const inFlight = useRef(new Set<string>());

  const resend = async (r: FFApplicationReference) => {
    if (inFlight.current.has(r.id)) return;
    inFlight.current.add(r.id);
    setSending((s) => ({ ...s, [r.id]: true }));
    setRowMessage((m) => ({ ...m, [r.id]: "" }));
    const result = await resendFFReferenceRequest(
      app.applicationId,
      r.id,
    );
    inFlight.current.delete(r.id);
    setSending((s) => ({ ...s, [r.id]: false }));
    if (!result.ok) {
      setRowMessage((m) => ({
        ...m,
        [r.id]: RESULT_MESSAGE[result.reason],
      }));
      return;
    }
    const sent =
      result.outcome === "delivered"
        ? `Delivered to ${r.email}.`
        : `Accepted for delivery to ${r.email}.`;
    if (result.tracked)
      toast.success("Reference request sent", {
        description: sent,
      });
    else
      setRowMessage((m) => ({
        ...m,
        [r.id]: `${sent} It couldn't be recorded here, so don't resend — the reference may receive it twice.`,
      }));
  };

  return (
    <>
      <Section title="Reference Requirements" first>
        <div className="flex flex-col gap-4">
          {a.businessCount > 1 && (
            <Alert variant="warning">
              <AlertTriangle />
              <AlertDescription>
                This application lists {a.businessCount}{" "}
                Business references. Only one Business reference
                is allowed. Review the references with the
                applicant; none have been removed.
              </AlertDescription>
            </Alert>
          )}
          {single ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-4">
              <Field
                label="References Requested"
                value={String(single.requested)}
              />
              <Field
                label="References Received"
                value={String(a.received)}
              />
              <Field
                label="References Required"
                value={String(single.required)}
              />
              <Field
                label="Completion Percentage"
                value={`${a.completionPct}%`}
              />
            </div>
          ) : a.programs.length > 1 ? (
            <>
              <div
                className="overflow-x-auto rounded-lg"
                style={{ border: BORDER }}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sub-Program</TableHead>
                      <TableHead>
                        References Requested
                      </TableHead>
                      <TableHead>References Required</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {a.programs.map((p) => (
                      <TableRow key={p.program}>
                        <TableCell>
                          {FF_SUB_PROGRAM_NAME[p.program]}
                        </TableCell>
                        <TableCell>{p.requested}</TableCell>
                        <TableCell>{p.required}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-4">
                <Field
                  label="References Received"
                  value={String(a.received)}
                />
                <Field
                  label="Combined Completion"
                  value="Not determined"
                />
              </div>
              <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                How references count toward more than one
                sub-program hasn't been confirmed, so combined
                completion isn't calculated.
              </p>
            </>
          ) : (
            <Field label="Sub-Programs" value="" />
          )}
        </div>
      </Section>

      <Section title="References">
        {refs.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No references listed"
            description="This application doesn't include any references."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {!deliveryReady && (
              <Alert variant="info">
                <Info />
                <AlertDescription>
                  Email delivery isn't available, so reference
                  requests can't be resent from here.
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
                    <TableHead>Reference Type</TableHead>
                    <TableHead>
                      Relationship to Applicant
                    </TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>
                      Permission Confirmation
                    </TableHead>
                    <TableHead>Response Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refs.map((r, i) => {
                    const block = ffResendBlock(r);
                    const requests =
                      staff.referenceRequests[r.id] ?? [];
                    const last = requests[requests.length - 1];
                    const reason =
                      block && block !== "not_configured"
                        ? BLOCK_MESSAGE[block]
                        : "";
                    const message = rowMessage[r.id] || reason;
                    return (
                      <TableRow key={r.id || `ref-${i}`}>
                        <TableCell>
                          {TYPE_LABEL[r.relationship] ??
                            (r.relationship || "Not provided")}
                        </TableCell>
                        <TableCell wrap>
                          {r.relationToSelf || "Not provided"}
                        </TableCell>
                        <TableCell wrap>
                          {r.name || "Not provided"}
                        </TableCell>
                        <TableCell>
                          {r.phone || "Not provided"}
                        </TableCell>
                        <TableCell wrap className="break-all">
                          {r.email || "Not provided"}
                        </TableCell>
                        <TableCell>
                          {yesNo(r.permissionGranted)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              isReferenceReceived(r)
                                ? "success"
                                : r.responseStatus ===
                                    "declined"
                                  ? "neutral"
                                  : "warning"
                            }
                          >
                            {referenceResponseLabel(r)}
                          </Badge>
                          {last && (
                            <span className="block slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1">
                              Last request{" "}
                              {last.outcome === "delivered"
                                ? "delivered"
                                : "accepted for delivery"}{" "}
                              {last.at}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-start gap-2">
                            <ResponseDialog
                              reference={r}
                              response={
                                staff.referenceResponses[r.id]
                              }
                            />
                            <Button
                              variant="outline"
                              size="xs"
                              disabled={
                                !!block || !!sending[r.id]
                              }
                              aria-label={`Resend request to ${r.name || "this reference"}`}
                              aria-describedby={
                                message
                                  ? `ref-msg-${r.id}`
                                  : undefined
                              }
                              onClick={() => resend(r)}
                            >
                              {sending[r.id]
                                ? "Sending…"
                                : "Resend Request"}
                            </Button>
                          </div>
                          {message && (
                            <p
                              id={`ref-msg-${r.id}`}
                              role={
                                rowMessage[r.id]
                                  ? "status"
                                  : undefined
                              }
                              className="slds-text-3 text-[var(--slds-g-color-text-weak)] mt-1 max-w-xs whitespace-normal"
                            >
                              {message}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}