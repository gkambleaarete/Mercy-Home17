// Checklist tab for a Mentor Application (US 20039 Chunk 9): the Match
// Readiness Checklist in the ticket's four groups, a readiness summary, and
// Edit/Save/Cancel for the staff-assessed items. System items are read-only
// and recalculated from current evidence every time.

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Pencil,
} from "@/app/lib/lucide-icons";
import { toast } from "sonner";
import { Section } from "../FriendsFirstMentorRecord";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Textarea } from "../ui/textarea";
import { useUnsavedChangesGuard } from "../../lib/useUnsavedChangesGuard";
import type {
  FFChecklistResult,
  FFMentorApplication,
  FFMentorApplicationStaff,
} from "../../data/ffMentorApplication";
import {
  FF_CHECKLIST_GROUPS,
  evaluateFFMentorReadiness,
  ffProgramList,
  type FFChecklistItem,
  type FFChecklistLink,
} from "../../data/ffMentorChecklist";
import {
  getFFActingUser,
  saveFFChecklistAssessments,
} from "../../data/ffMentorApplicationStore";

const BORDER = "1px solid var(--slds-g-color-border-base-1)";
const RESULTS: FFChecklistResult[] = [
  "Pending",
  "Passed",
  "Failed",
];
const RESULT_VARIANT: Record<
  FFChecklistResult,
  "warning" | "success" | "error"
> = {
  Pending: "warning",
  Passed: "success",
  Failed: "error",
};
const LINK_LABEL: Record<FFChecklistLink, string> = {
  references: "Go to References",
  "consents-documents": "Go to Consents & Documents",
  overview: "Go to Overview",
};

type Draft = Record<
  string,
  { result: FFChecklistResult; note: string }
>;

export function FFMentorChecklist({
  app,
  staff,
  onNavigate,
}: {
  app: FFMentorApplication;
  staff: FFMentorApplicationStaff;
  onNavigate: (tab: FFChecklistLink) => void;
}) {
  const readiness = evaluateFFMentorReadiness(app, staff);
  // Only staff items that definitely apply can be assessed; an item whose
  // applicability isn't confirmed stays Pending.
  const editable = readiness.items.filter(
    (i) => i.kind === "staff" && i.applicability === "applies",
  );
  const savedDraft = (): Draft =>
    Object.fromEntries(
      editable.map((i) => [
        i.id,
        {
          result: i.assessment?.result ?? "Pending",
          note: i.assessment?.note ?? "",
        },
      ]),
    );
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(savedDraft);
  const [error, setError] = useState("");
  const dirty =
    editing &&
    JSON.stringify(draft) !== JSON.stringify(savedDraft());

  const cancel = () => {
    setDraft(savedDraft());
    setError("");
    setEditing(false);
  };
  const save = () => {
    setError("");
    const result = saveFFChecklistAssessments(
      app.applicationId,
      draft,
      getFFActingUser(),
    );
    if (!result.ok) {
      setError(
        result.reason === "actor"
          ? "Your user account couldn't be identified, so the assessments weren't saved."
          : "The assessments could not be saved. Your changes are still here — please try again.",
      );
      return;
    }
    setEditing(false);
    toast.success("Checklist saved", {
      description: "Staff assessments updated.",
    });
  };
  const leaveGuard = useUnsavedChangesGuard(dirty, cancel);

  const resultCell = (i: FFChecklistItem) => {
    if (i.applicability === "not-applicable")
      return (
        <span className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
          Not applicable
        </span>
      );
    if (editing && i.kind === "staff" && draft[i.id])
      return (
        <Select
          value={draft[i.id].result}
          onValueChange={(v) =>
            setDraft((d) => ({
              ...d,
              [i.id]: {
                ...d[i.id],
                result: v as FFChecklistResult,
              },
            }))
          }
        >
          <SelectTrigger
            size="sm"
            aria-label={`${i.label} result`}
            className="w-32"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RESULTS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    return (
      <Badge variant={RESULT_VARIANT[i.result]}>
        {i.result}
      </Badge>
    );
  };

  return (
    <>
      <Section title="Match Readiness" first>
        {readiness.eligible ? (
          <Alert variant="success">
            <CheckCircle2 />
            <AlertDescription>
              Every applicable requirement has passed. This
              mentor is eligible for Ready for Match
              {readiness.readyForMatch
                ? " and is at that stage."
                : "."}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="warning">
            <AlertTriangle />
            <AlertDescription>
              <p className="font-semibold">
                {readiness.lostEligibility
                  ? "This mentor is at Ready for Match, but readiness requirements are no longer met."
                  : "Not yet eligible for Ready for Match."}
              </p>
              <ul className="list-disc pl-5 mt-1">
                {readiness.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </Section>

      {FF_CHECKLIST_GROUPS.map((group, gi) => (
        <Section
          key={group}
          title={group}
          action={
            gi === 0 && !editing && editable.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDraft(savedDraft());
                  setEditing(true);
                }}
              >
                <Pencil />
                Edit Staff Assessments
              </Button>
            ) : undefined
          }
        >
          <div
            className="overflow-x-auto rounded-lg"
            style={{ border: BORDER }}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requirement</TableHead>
                  <TableHead>Applies To</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Updated By</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {readiness.items
                  .filter((i) => i.group === group)
                  .map((i) => (
                    <TableRow key={i.id}>
                      <TableCell wrap>{i.label}</TableCell>
                      <TableCell wrap>
                        {i.applicability === "applies"
                          ? ffProgramList(i.appliesTo)
                          : i.applicability === "unknown"
                            ? "Not confirmed"
                            : "Not applicable"}
                      </TableCell>
                      <TableCell>{resultCell(i)}</TableCell>
                      <TableCell wrap>
                        {i.kind === "system"
                          ? "System (from current records)"
                          : i.assessment
                            ? `${i.assessment.assessedBy} · ${i.assessment.assessedAt}`
                            : "Staff — not yet assessed"}
                      </TableCell>
                      <TableCell wrap className="max-w-sm">
                        {editing &&
                        i.kind === "staff" &&
                        draft[i.id] ? (
                          <Textarea
                            size="sm"
                            rows={2}
                            aria-label={`${i.label} notes`}
                            value={draft[i.id].note}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                [i.id]: {
                                  ...d[i.id],
                                  note: e.target.value,
                                },
                              }))
                            }
                          />
                        ) : (
                          <>
                            {i.applicability !==
                              "not-applicable" &&
                              i.reason && (
                                <p className="slds-text-3">
                                  {i.reason}
                                </p>
                              )}
                            {i.kind === "staff" &&
                              i.assessment?.note &&
                              i.result !== "Failed" && (
                                <p className="slds-text-3 text-[var(--slds-g-color-text-weak)] whitespace-pre-wrap">
                                  {i.assessment.note}
                                </p>
                              )}
                            {i.link &&
                              i.result !== "Passed" && (
                                <span data-leave-guard>
                                  <Button
                                    variant="link"
                                    size="xs"
                                    onClick={() =>
                                      onNavigate(i.link!)
                                    }
                                  >
                                    {LINK_LABEL[i.link]}
                                  </Button>
                                </span>
                              )}
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </Section>
      ))}

      {editing && (
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 flex-wrap"
          style={{ borderTop: BORDER }}
        >
          <p
            role="alert"
            className="text-[13px] mr-auto"
            style={{ color: "#c23934" }}
          >
            {error}
          </p>
          <Button variant="outline" onClick={cancel}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </div>
      )}
      {leaveGuard}
    </>
  );
}