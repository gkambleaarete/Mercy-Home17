import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ExternalLink, Info } from "@/app/lib/lucide-icons";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { DateInput } from "../ui/date-input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../ui/alert";
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
import {
  CAMPUSES,
  DELAY_REASONS,
  PRIORITY_CRITERIA,
  PRIORITY_RANKS,
  RESIDENTIAL_HOMES,
  RESIDENT_STATUSES,
  WAITLIST_CATEGORIES,
  YOUTH_TYPES,
  getHomeName,
  type DelayReason,
  type FieldHistoryEntry,
  type PriorityRank,
  type ResidentPlan,
  type ResidentStatus,
  type WaitlistCandidate,
  type WaitlistCategory,
  type YouthType,
} from "../../data/mockProjectionsWaitlistData";
import {
  currentAge,
  daysBetween,
  hasProjection,
  projectionCommentRequired,
  validateWaitlistCandidate,
  type ConnectionDates,
  type WaitlistValidationErrors,
} from "../../lib/projectionsWaitlist";
import {
  formatMdy,
  isoToMdy,
  mdyToIso,
} from "../../lib/dateFormat";
import { Badge } from "../ui/badge";
import type { FullProfileLink } from "../../lib/youthIdentity";

/** Header link to the youth's real full record. When no record exists
 *  (seed-only prototype rows) it says so instead of linking anywhere. */
function FullProfileHeaderLink({
  link,
  youthName,
}: {
  link: FullProfileLink | null;
  youthName: string;
}) {
  if (!link)
    return (
      <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
        Full Profile unavailable — no linked record for this
        prototype youth.
      </p>
    );
  return (
    <Button
      asChild
      variant="link-info"
      size="sm"
      className="px-0 w-fit"
    >
      <Link
        to={link.path}
        aria-label={`Open full profile for ${youthName} (${link.target})`}
      >
        Full Profile
        <ExternalLink />
      </Link>
    </Button>
  );
}

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

function fmt(iso?: string) {
  return iso ? formatMdy(`${iso.slice(0, 10)}T00:00:00`) : "";
}

function ReadField({
  label,
  value,
  hint,
}: {
  label: string;
  value?: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="slds-text-2 uppercase tracking-wide text-[var(--slds-g-color-text-weak)]">
        {label}
      </p>
      <p className="slds-text-4">{value || "—"}</p>
      {hint && (
        <p className="slds-text-2 text-[var(--slds-g-color-text-weak)]">
          {hint}
        </p>
      )}
    </div>
  );
}

function FieldError({
  id,
  message,
}: {
  id: string;
  message?: string;
}) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="slds-text-3 text-destructive"
    >
      {message}
    </p>
  );
}

interface WaitlistCandidateDialogProps {
  candidate: WaitlistCandidate | null;
  fullProfile: FullProfileLink | null;
  /** Closure lifecycle label (Closing List / Eligible for Archive /
   *  Closed) when the case is in closure. */
  closureLabel?: string;
  connections: ConnectionDates;
  today: Date;
  canEdit: boolean;
  onClose: () => void;
  /** `comment` is set when an existing projection was changed. */
  onSave: (next: WaitlistCandidate, comment?: string) => void;
  /** Clears Anticipated Program + Move-In; the youth record is kept. */
  onCancelMove: (comment: string) => boolean | void;
}

export function WaitlistCandidateDialog({
  candidate,
  fullProfile,
  closureLabel,
  connections,
  today,
  canEdit,
  onClose,
  onSave,
  onCancelMove,
}: WaitlistCandidateDialogProps) {
  const [form, setForm] = useState<WaitlistCandidate | null>(
    candidate,
  );
  const [errors, setErrors] =
    useState<WaitlistValidationErrors>({});
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    setForm(candidate);
    setErrors({});
    setComment("");
    setCommentError("");
  }, [candidate]);

  if (!candidate || !form) return null;

  const set = <K extends keyof WaitlistCandidate>(
    key: K,
    value: WaitlistCandidate[K],
  ) =>
    setForm((prev) =>
      prev ? { ...prev, [key]: value } : prev,
    );

  const setDate = (
    key:
      | "anticipatedMoveInDate"
      | "nextReviewDate"
      | "checkInDate",
    mdy: string,
  ) => set(key, mdy ? mdyToIso(mdy) : undefined);

  const handleSave = () => {
    const next = { ...form };
    // Drop partially typed dates rather than saving an invalid value.
    for (const key of [
      "anticipatedMoveInDate",
      "nextReviewDate",
      "checkInDate",
    ] as const) {
      if (next[key] && !ISO_RE.test(next[key] as string))
        next[key] = undefined;
    }
    const found = validateWaitlistCandidate(next);
    setErrors(found);
    const needsComment =
      projectionCommentRequired(candidate, next) &&
      !comment.trim();
    setCommentError(
      needsComment
        ? "A comment is required when changing the Anticipated Program or Move-In Date."
        : "",
    );
    if (Object.keys(found).length > 0 || needsComment) return;
    onSave(next, comment.trim() || undefined);
  };

  const age = currentAge(form.dateOfBirth, today);
  const isDelayed = form.category === "Delayed";
  const projectsIntoBeds =
    !!form.anticipatedProgram &&
    !!form.anticipatedMoveInDate &&
    form.category !== "Closed";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>{candidate.name}</DialogTitle>
          <DialogDescription>
            {candidate.ageGroup} · Referred{" "}
            {fmt(candidate.referralDate)} · {candidate.category}{" "}
            for{" "}
            {daysBetween(candidate.categoryEnteredAt, today)}{" "}
            days
          </DialogDescription>
          <FullProfileHeaderLink
            link={fullProfile}
            youthName={candidate.name}
          />
        </DialogHeader>

        <DialogBody className="space-y-6">
          {closureLabel && (
            <Badge variant="neutral" bordered>
              {closureLabel}
            </Badge>
          )}

          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ReadField
              label="Date of Birth"
              value={fmt(form.dateOfBirth)}
            />
            <ReadField
              label="Current Age"
              value={age != null ? String(age) : ""}
            />
            <ReadField
              label="Case Manager"
              value={form.caseManager}
            />
            <ReadField
              label="Referral Date"
              value={fmt(form.referralDate)}
            />
            <ReadField
              label="Info Session Date"
              value={fmt(form.infoSessionDate)}
              hint={
                form.infoSessionDate
                  ? "From Info Session record"
                  : "No Info Session record"
              }
            />
            <ReadField
              label="Clinical Assessment"
              value={fmt(
                connections["Admissions Clinical Assessment"],
              )}
              hint={
                connections["Admissions Clinical Assessment"]
                  ? "From Connections"
                  : "No Connection record"
              }
            />
            <ReadField
              label="Admissions Shadow"
              value={fmt(connections["Admissions Shadow"])}
              hint={
                connections["Admissions Shadow"]
                  ? "From Connections"
                  : "No Connection record"
              }
            />
            <ReadField
              label="Staffing Date"
              value={fmt(connections["Staffing Meeting"])}
              hint={
                connections["Staffing Meeting"]
                  ? "From Connections"
                  : "No Connection record"
              }
            />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="wl-youth-type">Youth Type</Label>
              <Select
                value={form.youthType}
                onValueChange={(v) =>
                  set("youthType", v as YouthType)
                }
                disabled={!canEdit}
              >
                <SelectTrigger id="wl-youth-type">
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  {YOUTH_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="hidden md:block" />

            <div className="space-y-1.5">
              <Label htmlFor="wl-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  set("category", v as WaitlistCategory)
                }
                disabled={!canEdit}
              >
                <SelectTrigger id="wl-category">
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  {WAITLIST_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.category === "Closed" &&
                candidate.category !== "Closed" && (
                  <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                    On save, this case leaves the Waitlist, Bed
                    Projections and the Admissions Pipeline and
                    moves to the Closing List. After 30 days it
                    is Eligible for Archive until staff complete
                    the closure.
                  </p>
                )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wl-priority">Priority Rank</Label>
              <Select
                value={form.priorityRank ?? "none"}
                onValueChange={(v) =>
                  set(
                    "priorityRank",
                    v === "none"
                      ? undefined
                      : (v as PriorityRank),
                  )
                }
                disabled={!canEdit}
              >
                <SelectTrigger id="wl-priority">
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    None (Referral Date order)
                  </SelectItem>
                  {PRIORITY_RANKS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="slds-text-2 text-[var(--slds-g-color-text-weak)]">
                Set manually to bump this youth. Criteria:{" "}
                {PRIORITY_CRITERIA.join(" · ")}
              </p>
            </div>

            {isDelayed && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="wl-delay-reason">
                    Delay Reason *
                  </Label>
                  <Select
                    value={form.delayReason ?? ""}
                    onValueChange={(v) => {
                      set("delayReason", v as DelayReason);
                      setErrors((e) => ({
                        ...e,
                        delayReason: undefined,
                      }));
                    }}
                    disabled={!canEdit}
                  >
                    <SelectTrigger
                      id="wl-delay-reason"
                      aria-invalid={!!errors.delayReason}
                      aria-describedby={
                        errors.delayReason
                          ? "wl-delay-reason-error"
                          : undefined
                      }
                    >
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {DELAY_REASONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError
                    id="wl-delay-reason-error"
                    message={errors.delayReason}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="wl-next-review">
                    Next Review Date *
                  </Label>
                  <DateInput
                    id="wl-next-review"
                    value={isoToMdy(form.nextReviewDate)}
                    onChange={(v) => {
                      setDate("nextReviewDate", v);
                      setErrors((e) => ({
                        ...e,
                        nextReviewDate: undefined,
                      }));
                    }}
                    disabled={!canEdit}
                    required
                  />
                  <FieldError
                    id="wl-next-review-error"
                    message={errors.nextReviewDate}
                  />
                </div>
              </>
            )}

            <ProjectionFields
              idPrefix="wl"
              original={candidate}
              value={form}
              onChange={(v) =>
                setForm((prev) =>
                  prev ? { ...prev, ...v } : prev,
                )
              }
              comment={comment}
              onCommentChange={(v) => {
                setComment(v);
                setCommentError("");
              }}
              commentError={commentError}
              canEdit={canEdit}
              youthName={candidate.name}
              onCancelMove={onCancelMove}
            />

            <div className="md:col-span-2">
              <Alert
                variant={projectsIntoBeds ? "success" : "info"}
              >
                <Info />
                <AlertTitle>
                  {projectsIntoBeds
                    ? "Projected in Bed Projections"
                    : "Not yet in Bed Projections"}
                </AlertTitle>
                <AlertDescription>
                  {projectsIntoBeds
                    ? "This youth appears automatically under the Anticipated Program from the Move-In month."
                    : "Add both an Anticipated Program and an Anticipated Move-In Date to project this youth into a home."}
                </AlertDescription>
              </Alert>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wl-check-in">Check-In Date</Label>
              <DateInput
                id="wl-check-in"
                value={isoToMdy(form.checkInDate)}
                onChange={(v) => setDate("checkInDate", v)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wl-grade">Grade</Label>
              <Input
                id="wl-grade"
                size="md"
                value={form.grade}
                onChange={(e) => set("grade", e.target.value)}
                readOnly={!canEdit}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wl-guardianship">
                Guardianship Details
              </Label>
              <Textarea
                id="wl-guardianship"
                size="md"
                value={form.guardianshipDetails}
                onChange={(e) =>
                  set("guardianshipDetails", e.target.value)
                }
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wl-medical">Medical Notes</Label>
              <Textarea
                id="wl-medical"
                size="md"
                value={form.medicalNotes}
                onChange={(e) =>
                  set("medicalNotes", e.target.value)
                }
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="wl-comments">Comments</Label>
              <Textarea
                id="wl-comments"
                size="md"
                value={form.comments}
                onChange={(e) =>
                  set("comments", e.target.value)
                }
                disabled={!canEdit}
              />
            </div>
          </section>

          <HistorySection
            history={candidate.history}
            emptyText="No changes to Category, Delay Reason, Anticipated Program or Anticipated Move-In Date yet."
          />
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {canEdit ? "Cancel" : "Close"}
          </Button>
          {canEdit && (
            <Button onClick={handleSave}>Save</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
// ─── Shared pieces (waitlist youth + current residents) ─────────────────────

type Projection = Pick<
  WaitlistCandidate,
  "anticipatedProgram" | "anticipatedMoveInDate"
>;

/** Anticipated Program + Move-In Date, the required change comment and
 *  Cancel Anticipated Move — one definition for both quick-edit modes. A
 *  youth has at most ONE Anticipated Program. */
function ProjectionFields({
  idPrefix,
  original,
  value,
  onChange,
  comment,
  onCommentChange,
  commentError,
  canEdit,
  youthName,
  onCancelMove,
}: {
  idPrefix: string;
  original: Projection;
  value: Projection;
  onChange: (next: Projection) => void;
  comment: string;
  onCommentChange: (v: string) => void;
  commentError: string;
  canEdit: boolean;
  youthName: string;
  onCancelMove: (comment: string) => boolean | void;
}) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelComment, setCancelComment] = useState("");
  const [cancelError, setCancelError] = useState("");
  const commentRequired = projectionCommentRequired(
    original,
    value,
  );

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-program`}>
          Anticipated Program
        </Label>
        <Select
          value={value.anticipatedProgram ?? "none"}
          onValueChange={(v) =>
            onChange({
              ...value,
              anticipatedProgram: v === "none" ? undefined : v,
            })
          }
          disabled={!canEdit}
        >
          <SelectTrigger id={`${idPrefix}-program`}>
            <SelectValue placeholder="Please Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              Not yet determined
            </SelectItem>
            {/* Every Program on both campuses — including the youth's
                current Program — with no age-group/campus filtering. */}
            {CAMPUSES.map((campus) =>
              RESIDENTIAL_HOMES.filter(
                (h) => h.campus === campus,
              ).map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.name} · {campus}
                </SelectItem>
              )),
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-move-in`}>
          Anticipated Move-In Date
        </Label>
        <DateInput
          id={`${idPrefix}-move-in`}
          value={isoToMdy(value.anticipatedMoveInDate)}
          onChange={(v) =>
            onChange({
              ...value,
              anticipatedMoveInDate: v
                ? mdyToIso(v)
                : undefined,
            })
          }
          disabled={!canEdit}
        />
      </div>

      {canEdit && commentRequired && (
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor={`${idPrefix}-projection-comment`}>
            Projection Change Comment *
          </Label>
          <Textarea
            id={`${idPrefix}-projection-comment`}
            size="md"
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Why is the Anticipated Program or Move-In Date changing?"
            aria-invalid={!!commentError}
            aria-describedby={
              commentError
                ? `${idPrefix}-projection-comment-error`
                : undefined
            }
          />
          <FieldError
            id={`${idPrefix}-projection-comment-error`}
            message={commentError}
          />
        </div>
      )}

      {canEdit && hasProjection(original) && (
        <div className="md:col-span-2">
          <Button
            variant="outline-destructive"
            size="sm"
            onClick={() => {
              setCancelComment("");
              setCancelError("");
              setCancelOpen(true);
            }}
          >
            Cancel Anticipated Move
          </Button>
        </div>
      )}

      <AlertDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Cancel Anticipated Move
            </AlertDialogTitle>
            <AlertDialogDescription>
              {youthName} will be removed from Bed Projections
              {original.anticipatedProgram
                ? ` for ${getHomeName(original.anticipatedProgram)}`
                : ""}
              . The youth's record is kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-cancel-comment`}>
              Comment *
            </Label>
            <Textarea
              id={`${idPrefix}-cancel-comment`}
              size="md"
              value={cancelComment}
              onChange={(e) => {
                setCancelComment(e.target.value);
                setCancelError("");
              }}
              placeholder="Why is this move being cancelled?"
              aria-invalid={!!cancelError}
            />
            <FieldError
              id={`${idPrefix}-cancel-comment-error`}
              message={cancelError}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                if (!cancelComment.trim()) {
                  e.preventDefault();
                  setCancelError("A comment is required.");
                  return;
                }
                // false = not saved: stay open, keep the comment.
                if (
                  onCancelMove(cancelComment.trim()) === false
                )
                  e.preventDefault();
              }}
            >
              Cancel Move
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function HistorySection({
  history,
  emptyText,
}: {
  history: FieldHistoryEntry[];
  emptyText: string;
}) {
  return (
    <section className="space-y-2">
      <h3 className="slds-text-4 font-semibold">
        Field History
      </h3>
      {history.length === 0 ? (
        <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
          {emptyText}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead variant="slds">Date</TableHead>
              <TableHead variant="slds">Field</TableHead>
              <TableHead variant="slds">
                Original Value
              </TableHead>
              <TableHead variant="slds">New Value</TableHead>
              <TableHead variant="slds">Comment</TableHead>
              <TableHead variant="slds">Changed By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((h) => (
              <TableRow key={h.id}>
                <TableCell>{formatMdy(h.changedAt)}</TableCell>
                <TableCell>{h.field}</TableCell>
                <TableCell>{h.oldValue || "—"}</TableCell>
                <TableCell>{h.newValue || "—"}</TableCell>
                <TableCell>{h.comment || "—"}</TableCell>
                <TableCell>{h.changedBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}

// ─── Current resident quick edit (opened from a name in Bed Projections) ────

export interface ResidentSubject {
  enrollmentId: string;
  fullProfile: FullProfileLink | null;
  name: string;
  dateOfBirth: string;
  homeId: string;
  actualMoveInDate: string;
  plan: ResidentPlan;
}

export function ResidentQuickEditDialog({
  resident,
  today,
  canEdit,
  onClose,
  onSave,
  onCancelMove,
}: {
  resident: ResidentSubject | null;
  today: Date;
  canEdit: boolean;
  onClose: () => void;
  onSave: (next: ResidentPlan, comment?: string) => void;
  onCancelMove: (comment: string) => void;
}) {
  const [form, setForm] = useState<ResidentPlan | null>(
    resident?.plan ?? null,
  );
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    setForm(resident?.plan ?? null);
    setComment("");
    setCommentError("");
  }, [resident]);

  if (!resident || !form) return null;

  const handleSave = () => {
    const next = { ...form };
    if (
      next.anticipatedMoveInDate &&
      !ISO_RE.test(next.anticipatedMoveInDate)
    )
      next.anticipatedMoveInDate = undefined;
    const needsComment =
      projectionCommentRequired(resident.plan, next) &&
      !comment.trim();
    setCommentError(
      needsComment
        ? "A comment is required when changing the Anticipated Program or Move-In Date."
        : "",
    );
    if (needsComment) return;
    onSave(next, comment.trim() || undefined);
  };

  const age = currentAge(resident.dateOfBirth, today);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>{resident.name}</DialogTitle>
          <DialogDescription>
            Current resident · {getHomeName(resident.homeId)}
          </DialogDescription>
          <FullProfileHeaderLink
            link={resident.fullProfile}
            youthName={resident.name}
          />
        </DialogHeader>

        <DialogBody className="space-y-6">
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ReadField
              label="Date of Birth"
              value={fmt(resident.dateOfBirth)}
            />
            <ReadField
              label="Current Age"
              value={age != null ? String(age) : ""}
            />
            <ReadField
              label="Current Program"
              value={getHomeName(resident.homeId)}
            />
            <ReadField
              label="Actual Move-In Date"
              value={fmt(resident.actualMoveInDate)}
            />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="res-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((prev) =>
                    prev
                      ? { ...prev, status: v as ResidentStatus }
                      : prev,
                  )
                }
                disabled={!canEdit}
              >
                <SelectTrigger id="res-status">
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  {RESIDENT_STATUSES.map((st) => (
                    <SelectItem key={st} value={st}>
                      {st}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="slds-text-2 text-[var(--slds-g-color-text-weak)] self-end">
              Status and Anticipated Program are planning
              fields; they never change this youth's occupancy
              codes. Choosing the current Program reserves no
              second bed.
            </p>

            <ProjectionFields
              idPrefix="res"
              original={resident.plan}
              value={form}
              onChange={(v) =>
                setForm((prev) =>
                  prev ? { ...prev, ...v } : prev,
                )
              }
              comment={comment}
              onCommentChange={(v) => {
                setComment(v);
                setCommentError("");
              }}
              commentError={commentError}
              canEdit={canEdit}
              youthName={resident.name}
              onCancelMove={onCancelMove}
            />
          </section>

          <HistorySection
            history={resident.plan.history}
            emptyText="No changes to Status, Anticipated Program or Anticipated Move-In Date yet."
          />
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {canEdit ? "Cancel" : "Close"}
          </Button>
          {canEdit && (
            <Button onClick={handleSave}>Save</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}