import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  FileX,
  Pencil,
  Plus,
} from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { DateInput } from "../ui/date-input";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { EmptyState } from "../ui/empty-state";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import { resolveYouthConstituent } from "../../lib/youthIdentity";
import { useUnsavedChangesGuard } from "../../lib/useUnsavedChangesGuard";
import { getItps } from "../../data/mockYouthProgramData";
import {
  createItpGoal,
  goalsForItp,
  isItpGoalStorageUnreadable,
  newItpGoalId,
  orderGoalHierarchy,
  updateItpGoal,
  useItpGoalSnapshot,
  type ItpGoal,
} from "../../data/itpGoalStore";
import {
  getTransitionSummary,
  getTransitionSummarySnapshot,
  isValidMdy,
} from "../../data/transitionSummaryStore";

// Verified ITP goals (US 20103): /itp-module/verified/:itpId.
// The ITP and its youth come from the Program compliance ITP records (never
// the sample ITP workspaces), and goals are read/written only through
// itpGoalStore, which re-checks ITP, youth and the Finalized lock on save.
// ?youth=&summary= is an optional, validated return context.

/** The Treatment Planning Goals form's Outcome Domain choices. */
const OUTCOME_DOMAINS = [
  "Clinical/Behavioral",
  "Educational",
  "Family Engagement",
  "Life Skills/Transition",
  "Social/Emotional",
  "Physical Health",
];
const NO_PARENT = "none";

interface GoalDraft {
  goal: string;
  outcomeDomain: string;
  parentGoalId: string; // NO_PARENT for a top-level goal
  startDate: string; // MM/DD/YYYY in the form
  targetEndDate: string;
  endDate: string;
  status: string;
  progress: string;
}

interface GoalForm {
  /** null = new goal. */
  id: string | null;
  initial: GoalDraft;
  value: GoalDraft;
  errors: Partial<Record<keyof GoalDraft, string>>;
}

const toDraft = (g?: ItpGoal): GoalDraft => ({
  goal: g?.goal ?? "",
  outcomeDomain: g?.outcomeDomain ?? "",
  parentGoalId: g?.parentGoalId ?? NO_PARENT,
  startDate: isoToMdy(g?.startDate ?? ""),
  targetEndDate: isoToMdy(g?.targetEndDate ?? ""),
  endDate: isoToMdy(g?.endDate ?? ""),
  status: g?.status ?? "",
  progress:
    typeof g?.progress === "number" ? String(g.progress) : "",
});

function FieldError({ id, msg }: { id: string; msg?: string }) {
  return msg ? (
    <p
      id={id}
      role="alert"
      className="slds-text-3 text-destructive"
    >
      {msg}
    </p>
  ) : null;
}

function Unavailable({ message }: { message: string }) {
  return (
    <div className="p-6">
      <EmptyState
        icon={FileX}
        tone="warning"
        title="ITP not available"
        description={message}
      />
    </div>
  );
}

export function VerifiedItpGoalsPage() {
  const { itpId: rawId } = useParams<{ itpId: string }>();
  const [search] = useSearchParams();
  const snapshot = useItpGoalSnapshot();
  const [form, setForm] = useState<GoalForm | null>(null);
  const [saveError, setSaveError] = useState("");
  const dirty =
    !!form &&
    JSON.stringify(form.value) !== JSON.stringify(form.initial);
  const guard = useUnsavedChangesGuard(dirty, () =>
    setForm(null),
  );

  const itpId = /^\d+$/.test(rawId ?? "") ? Number(rawId) : NaN;
  const itp = getItps().find((i) => i.id === itpId);
  const owner = itp
    ? resolveYouthConstituent(String(itp.constituentId))
    : null;
  if (!itp)
    return (
      <Unavailable message="This ITP could not be found." />
    );
  if (!owner)
    return (
      <Unavailable message="This ITP's youth could not be confirmed, so its goals can't be shown." />
    );

  const locked = itp.isFinalized || itp.status === "Finalized";
  const goals = goalsForItp(snapshot, itp.id, owner.id);
  const topLevel = goals.filter((g) => !g.parentGoalId);

  // Return context: only when it names this ITP's youth and one of that
  // youth's External summaries.
  const retYouth = search.get("youth");
  const retSummary = search.get("summary");
  const returnTo =
    retYouth === owner.id &&
    retSummary &&
    getTransitionSummary(
      getTransitionSummarySnapshot(),
      retSummary,
      {
        youthId: owner.id,
        type: "External",
      },
    )
      ? `/constituents/${owner.id}?section=transition-summary&summary=${encodeURIComponent(retSummary)}`
      : `/constituents/${owner.id}`;

  const set = (patch: Partial<GoalDraft>) =>
    form &&
    setForm({
      ...form,
      value: { ...form.value, ...patch },
      errors: {},
    });

  const save = () => {
    if (!form) return;
    const v = form.value;
    const errors: GoalForm["errors"] = {};
    if (!v.goal.trim()) errors.goal = "Enter a goal.";
    for (const k of [
      "startDate",
      "targetEndDate",
      "endDate",
    ] as const)
      if (v[k] && !isValidMdy(v[k]))
        errors[k] =
          "Enter a complete, valid date (MM/DD/YYYY).";
    if (
      v.progress &&
      !(/^\d+$/.test(v.progress) && Number(v.progress) <= 100)
    )
      errors.progress = "Enter a whole number from 0 to 100.";
    if (Object.keys(errors).length) {
      setForm({ ...form, errors });
      return;
    }
    const content = {
      goal: v.goal.trim(),
      outcomeDomain: v.outcomeDomain,
      startDate: mdyToIso(v.startDate),
      targetEndDate: mdyToIso(v.targetEndDate),
      endDate: mdyToIso(v.endDate),
      status: v.status.trim(),
      ...(v.parentGoalId !== NO_PARENT
        ? { parentGoalId: v.parentGoalId }
        : { parentGoalId: undefined }),
      ...(v.progress ? { progress: Number(v.progress) } : {}),
    };
    const result = form.id
      ? updateItpGoal({
          id: form.id,
          itpId: itp.id,
          youthId: owner.id,
          content,
        })
      : createItpGoal({
          id: newItpGoalId(),
          itpId: itp.id,
          youthId: owner.id,
          content,
        });
    if (!result.ok) {
      setSaveError(result.message); // keep the dialog and draft for retry
      return;
    }
    setSaveError("");
    setForm(null);
    toast.success("Goal saved.");
  };

  const openForm = (g?: ItpGoal) => {
    const d = toDraft(g);
    setSaveError("");
    setForm({
      id: g?.id ?? null,
      initial: d,
      value: d,
      errors: {},
    });
  };

  const v = form?.value;
  const e = form?.errors ?? {};
  // A goal can become intermediate only under a top-level goal of this ITP,
  // and a goal that has intermediate goals stays top-level.
  const hasChildren =
    !!form?.id && goals.some((g) => g.parentGoalId === form.id);
  const parentChoices = topLevel.filter(
    (g) => g.id !== form?.id,
  );
  const domainChoices =
    v?.outcomeDomain &&
    !OUTCOME_DOMAINS.includes(v.outcomeDomain)
      ? [v.outcomeDomain, ...OUTCOME_DOMAINS]
      : OUTCOME_DOMAINS;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 pt-6 pb-16 space-y-4">
        <Button asChild variant="outline" size="sm">
          <Link to={returnTo}>
            <ArrowLeft />
            Back
          </Link>
        </Button>
        <Card variant="section">
          <CardHeader>
            <CardTitle className="slds-section-title text-[var(--slds-g-color-text-default)]">
              ITP-{itp.id} Goals
            </CardTitle>
            <CardDescription className="slds-text-4">
              {owner.name} · ITP Date{" "}
              {isoToMdy(itp.itpDate) || "—"} ·{" "}
              <Badge
                variant={locked ? "success" : "neutral"}
                bordered
              >
                Status: {itp.status}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {isItpGoalStorageUnreadable() && (
              <Alert variant="error" role="alert">
                <AlertCircle />
                <AlertTitle>
                  ITP goals can't be shown
                </AlertTitle>
                <AlertDescription>
                  Saved ITP goal data can't be read right now.
                </AlertDescription>
              </Alert>
            )}
            {locked && (
              <Alert variant="info">
                <AlertCircle />
                <AlertTitle>This ITP is finalized</AlertTitle>
                <AlertDescription>
                  Its goals are read-only.
                </AlertDescription>
              </Alert>
            )}
            <div className="flex items-center justify-between gap-2">
              <h2
                id="vitp-goals-heading"
                className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)]"
              >
                Goals
              </h2>
              {!locked && !isItpGoalStorageUnreadable() && (
                <Button
                  type="button"
                  variant="outline-primary"
                  size="sm"
                  onClick={() => openForm()}
                >
                  <Plus />
                  Add Goal
                </Button>
              )}
            </div>
            <Card variant="container">
              <Table aria-labelledby="vitp-goals-heading">
                <TableHeader>
                  <TableRow hoverable={false}>
                    {[
                      "Goal",
                      "Outcome Domain",
                      "Start Date",
                      "Target End Date",
                      "End Date",
                      "Status",
                      "Progress",
                    ].map((h) => (
                      <TableHead
                        key={h}
                        variant="slds"
                        className="whitespace-normal"
                      >
                        {h}
                      </TableHead>
                    ))}
                    {!locked && (
                      <TableHead variant="slds">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goals.length === 0 && (
                    <TableRow hoverable={false}>
                      <TableCell
                        tone="muted"
                        colSpan={locked ? 7 : 8}
                      >
                        No goals are recorded for this plan.
                      </TableCell>
                    </TableRow>
                  )}
                  {orderGoalHierarchy(goals).map(
                    ({ goal: g, intermediate }) => (
                      <TableRow key={g.id}>
                        <TableCell wrap>
                          {intermediate
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
                        <TableCell>{g.status || "—"}</TableCell>
                        <TableCell>
                          {typeof g.progress === "number"
                            ? `${g.progress}%`
                            : "—"}
                        </TableCell>
                        {!locked && (
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost-primary"
                              size="icon-xs"
                              aria-label={`Modify goal ${g.goal}`}
                              onClick={() => openForm(g)}
                            >
                              <Pencil />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </Card>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={!!form && !locked}
        onOpenChange={(o) => !o && setForm(null)}
      >
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>
              {form?.id ? "Modify Goal" : "Add Goal"}
            </DialogTitle>
            <DialogDescription>
              Goals are saved to ITP-{itp.id} for {owner.name}.
            </DialogDescription>
          </DialogHeader>
          {v && (
            <DialogBody className="space-y-4">
              {saveError && (
                <Alert variant="error" role="alert">
                  <AlertCircle />
                  <AlertTitle>Goal not saved</AlertTitle>
                  <AlertDescription>
                    {saveError}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label
                  htmlFor="vitp-goal"
                  className="slds-form-label"
                >
                  Goal
                </Label>
                <Textarea
                  id="vitp-goal"
                  value={v.goal}
                  onChange={(ev) =>
                    set({ goal: ev.target.value })
                  }
                  aria-invalid={e.goal ? true : undefined}
                  aria-describedby={
                    e.goal ? "vitp-goal-error" : undefined
                  }
                />
                <FieldError id="vitp-goal-error" msg={e.goal} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="vitp-domain"
                    className="slds-form-label"
                  >
                    Outcome Domain
                  </Label>
                  <Select
                    value={v.outcomeDomain}
                    onValueChange={(d) =>
                      set({ outcomeDomain: d })
                    }
                  >
                    <SelectTrigger id="vitp-domain">
                      <SelectValue placeholder="Select Outcome Domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domainChoices.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="vitp-parent"
                    className="slds-form-label"
                  >
                    Parent Goal
                  </Label>
                  <Select
                    value={v.parentGoalId}
                    onValueChange={(p) =>
                      set({ parentGoalId: p })
                    }
                    disabled={hasChildren}
                  >
                    <SelectTrigger
                      id="vitp-parent"
                      aria-describedby={
                        hasChildren
                          ? "vitp-parent-hint"
                          : undefined
                      }
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_PARENT}>
                        None (top-level goal)
                      </SelectItem>
                      {parentChoices.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.goal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hasChildren && (
                    <p
                      id="vitp-parent-hint"
                      className="slds-text-3 text-[var(--slds-g-color-text-weak)]"
                    >
                      This goal has intermediate goals, so it
                      stays top-level.
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(
                  [
                    ["startDate", "Start Date"],
                    ["targetEndDate", "Target End Date"],
                    ["endDate", "End Date"],
                  ] as const
                ).map(([k, label]) => (
                  <div key={k} className="space-y-1.5">
                    <Label
                      htmlFor={`vitp-${k}`}
                      className="slds-form-label"
                    >
                      {label}
                    </Label>
                    <DateInput
                      id={`vitp-${k}`}
                      value={v[k]}
                      onChange={(d) => set({ [k]: d })}
                      aria-invalid={e[k] ? true : undefined}
                      aria-describedby={
                        e[k] ? `vitp-${k}-error` : undefined
                      }
                    />
                    <FieldError
                      id={`vitp-${k}-error`}
                      msg={e[k]}
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="vitp-status"
                    className="slds-form-label"
                  >
                    Status
                  </Label>
                  <Input
                    id="vitp-status"
                    value={v.status}
                    onChange={(ev) =>
                      set({ status: ev.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="vitp-progress"
                    className="slds-form-label"
                  >
                    Progress (%)
                  </Label>
                  <Input
                    id="vitp-progress"
                    inputMode="numeric"
                    value={v.progress}
                    onChange={(ev) =>
                      set({ progress: ev.target.value })
                    }
                    aria-invalid={e.progress ? true : undefined}
                    aria-describedby={
                      e.progress
                        ? "vitp-progress-error"
                        : undefined
                    }
                  />
                  <FieldError
                    id="vitp-progress-error"
                    msg={e.progress}
                  />
                </div>
              </div>
            </DialogBody>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setForm(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={save}>
              Save Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {guard}
    </div>
  );
}