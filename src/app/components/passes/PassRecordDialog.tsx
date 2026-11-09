import { useMemo, useRef, useState } from "react";
import { Ban, Copy, Pencil, Ticket, Trash2 } from "@/app/lib/lucide-icons";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
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
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { PassForm, type PassFormHandle } from "./PassForm";
import { PassActionDialog } from "./PassActionDialog";
import {
  type PassRecord,
  PASS_STATUS_BADGE_VARIANT,
  addPassHistory,
  deletePass,
  getPassById,
  getPassHistory,
  getSeriesPasses,
  usePasses,
  savePasses,
} from "../../data/mockPassData";
import {
  CURRENT_USER_NAME,
  getProgramById,
} from "../../data/mockProgramsData";
import { getYouthName } from "../../data/mockYouthProgramData";
import { getPackMedById } from "../../data/mockPackMedData";
import {
  PASS_CONTEXT_UNAVAILABLE_MESSAGE,
  isPassInContext,
  resolveConstituentPassContext,
  useConstituentPassContext,
} from "../../lib/constituentPassContext";
import { formatMdy } from "../../lib/dateFormat";
import { linkPassToPackMed } from "../../lib/passPackMedAssociation";
import { createPassesFromForm } from "../../lib/passCreate";
import {
  type PassFormValues,
  type PassSeriesScope,
  applyPassEdit,
  buildPassRecordName,
  diffPassHistory,
  formToPassFields,
  isShortenedOrExtended,
  scopeTargets,
} from "../../lib/passes";

// Pass record modal — New / Edit / View Pass over whatever page the user is
// on (Pass List, Calendar, Program, Constituent Profile, Pack Med record).
// It replaces the old standalone Pass record page: the originating page stays
// mounted (same component identity) behind the overlay, so its filters,
// scroll position and selection are untouched. Mutations are the ones the
// record page used (createPassesFromForm, applyPassEdit, scopeTargets, the
// canonical store and the Pack Med association helper) — one implementation.
//
// The dialog is hosted by PassDialogProvider (contexts/PassDialogContext).

export interface PassCreateDefaults {
  defaultYouthId?: string;
  defaultProgramId?: number;
  /** ISO "YYYY-MM-DD" */
  defaultStartDate?: string;
  /** "Copy": id of the Pass whose carried-over fields prefill Create. */
  copyFromId?: number;
}

/** Constituent-owned launch: Youth and Program are fixed to this
 *  Constituent's current context for the whole modal session (New, Copy,
 *  View, Edit, View → Edit/Copy, and later "View Pass" from a toast). Only
 *  the stable Constituent id is carried; the context is re-resolved on every
 *  use, never trusted from a launch-time copy. */
export interface PassOwnerLock {
  constituentId: number;
}

export interface PassLaunchOptions {
  ownerLock?: PassOwnerLock;
  /** Element that takes focus when the modal closes (e.g. the header's
   *  Global Actions button, whose menu item launched it). */
  returnFocusTo?: () => HTMLElement | null;
  /** Called after the modal is closed by the user (not on navigation). */
  onClose?: () => void;
}

export type PassDialogTarget =
  | ({ kind: "create" } & PassCreateDefaults)
  | { kind: "edit" | "view"; id: number };

export type PassDialogRequest = PassDialogTarget & {
  /** Identifies one opening of the modal (a new opening = a clean slate). */
  openId: number;
  /** Changes on an intentional mode/record change inside the same modal
   *  (View → Edit, View → Copy), which resets the form and pending actions. */
  formKey: number;
  launch: PassLaunchOptions;
};

export function PassRecordDialog({
  request,
  onClose,
  onSwitch,
  onOpenView,
}: {
  request: PassDialogRequest;
  /** Opens the shared View modal for a record (toast "View Pass" action,
   *  which outlives this modal). */
  onOpenView: (id: number) => void;
  /** Closes the modal (the user is done). */
  onClose: () => void;
  /** Switches the SAME modal to another mode/record. */
  onSwitch: (target: PassDialogTarget) => void;
}) {
  const formRef = useRef<PassFormHandle>(null);
  // What had focus when the modal opened (the row button, toolbar button…).
  const [launcher] = useState<Element | null>(() =>
    document.activeElement === document.body
      ? null
      : document.activeElement,
  );

  const isCreate = request.kind === "create";
  const mode: "create" | "edit" | "view" = request.kind;
  const passId = request.kind === "create" ? null : request.id;

  // Live canonical data — any Pass write (save, cancel, Pack Med link)
  // re-renders this modal; the stored record is always read fresh.
  const allPasses = usePasses();
  const pass = useMemo(
    () =>
      passId === null
        ? null
        : (allPasses.find((p) => p.id === passId) ?? null),
    [allPasses, passId],
  );
  const series = useMemo(
    () =>
      pass?.seriesId ? getSeriesPasses(pass.seriesId) : [],
    [pass],
  );
  const isRecurring = series.length > 1;
  const history = useMemo(
    // History is written alongside the Pass, so a new `pass` object means
    // any new history is already in place.
    () => (pass ? getPassHistory(pass.id) : []),
    [pass],
  );

  const create: PassCreateDefaults =
    request.kind === "create" ? request : {};
  const copySource = useMemo(
    () =>
      isCreate && create.copyFromId !== undefined
        ? (allPasses.find((p) => p.id === create.copyFromId) ??
          null)
        : null,
    [allPasses, isCreate, create.copyFromId],
  );

  // Pending edit awaiting a series-scope choice (+ its Pack Med choice).
  const [pendingEdit, setPendingEdit] =
    useState<PassRecord | null>(null);
  const [pendingPackMedId, setPendingPackMedId] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  // Blocks a second Save while one is being processed.
  const submitLock = useRef(false);
  const [saving, setSaving] = useState(false);

  // ── Constituent-owned context (Constituent Pass tab) ──────────────────
  const lock = request.launch.ownerLock;
  const ctx = useConstituentPassContext(lock?.constituentId);
  const ownerContext =
    lock && ctx?.status === "ok"
      ? {
          youthId: ctx.youthId,
          youthName: ctx.youthName,
          programId: ctx.programId,
          programName: ctx.programName,
        }
      : null;
  const contextMessage =
    lock && ctx && ctx.status !== "ok"
      ? ctx.status === "ineligible"
        ? "This Constituent is not eligible for Pass records."
        : PASS_CONTEXT_UNAVAILABLE_MESSAGE
      : "";
  const outOfContext =
    !!lock &&
    !!ctx &&
    ctx.status === "ok" &&
    !!pass &&
    !isPassInContext(pass, ctx);
  /** Contextual actions are blocked while the context is unavailable or the
   *  open record no longer belongs to it. */
  const actionsBlocked =
    !!lock && (!ownerContext || outOfContext);

  /** Re-resolves the context and checks everything a write would touch
   *  BEFORE any record, history or association is written. Returns the
   *  reason to reject, or null. Non-contextual launches are unaffected. */
  function checkContext(input: {
    values?: PassFormValues;
    /** Stored Passes about to be changed/deleted/copied from. */
    records?: (PassRecord | null | undefined)[];
  }): string | null {
    if (!lock) return null;
    const latest = resolveConstituentPassContext(
      lock.constituentId,
    );
    if (latest.status === "ineligible")
      return "This Constituent is not eligible for Pass records.";
    if (latest.status !== "ok")
      return PASS_CONTEXT_UNAVAILABLE_MESSAGE;
    const { values, records = [] } = input;
    if (
      values &&
      (values.youthId !== latest.youthId ||
        values.programId !== String(latest.programId))
    )
      return "The Youth or Program does not match this Constituent's current context. Close this Pass and reopen it.";
    for (const r of records) {
      if (!r) return "That Pass no longer exists.";
      const stored = getPassById(r.id);
      if (!stored || !isPassInContext(stored, latest))
        return "That Pass does not belong to this Constituent's current Program, so it can't be changed from here.";
    }
    if (values?.packMedId) {
      // Linking takes the Pack Med over from any Pass it is already linked
      // to — that Pass must be in this context too.
      const pm = getPackMedById(Number(values.packMedId));
      if (pm && pm.passId != null && pm.passId !== pass?.id) {
        const other = getPassById(pm.passId);
        if (other && !isPassInContext(other, latest))
          return "That Pack Med is linked to a Pass outside this Constituent's current Program, so it can't be reassigned from here.";
      }
    }
    return null;
  }
  function rejectContext(message: string) {
    toast.error("This can't be done from here", {
      description: message,
    });
  }

  function youthName(youthId: string) {
    return getYouthName(youthId);
  }

  /** Applies the form's Pack Med choice to ONE Pass through the shared
   *  association helper (keeps both sides in sync). Occurrence-specific.
   *  Returns the error message when the link could not be made. */
  function applyPackMedChoice(
    id: number,
    packMedId: string,
  ): string | null {
    const current = getPassById(id);
    const target = packMedId ? Number(packMedId) : null;
    if (!current || (current.packMedId ?? null) === target)
      return null;
    const result = linkPassToPackMed(id, target);
    if (!result.ok) {
      toast.error(result.error);
      return result.error;
    }
    return null;
  }

  /** Persists the given Passes and one history entry per changed tracked
   *  field on EACH affected Pass (compared with its stored version). */
  function persist(next: PassRecord[]) {
    const now = new Date().toISOString();
    addPassHistory(
      next.flatMap((after) => {
        const before = getPassById(after.id);
        return before
          ? diffPassHistory(
              before,
              after,
              CURRENT_USER_NAME,
              now,
            )
          : [];
      }),
    );
    savePasses(next);
  }

  function releaseSave() {
    submitLock.current = false;
    setSaving(false);
  }

  // ── Create / Edit submit ──────────────────────────────────────────────
  function handleSubmit(values: PassFormValues) {
    if (submitLock.current) return;
    submitLock.current = true;
    setSaving(true);
    try {
      const blocked = checkContext({
        values,
        records:
          mode === "create"
            ? copySource
              ? [copySource]
              : []
            : [pass],
      });
      if (blocked) {
        rejectContext(blocked);
        releaseSave();
        return;
      }
      const fields = formToPassFields(values);
      const now = new Date().toISOString();

      if (mode === "create") {
        // Shared create algorithm.
        const { created, packMedError } =
          createPassesFromForm(values);
        if (packMedError) toast.error(packMedError);
        const first = created[0];
        const notes = [
          created.length > 1
            ? `Starting with ${first.recordName}`
            : "",
          packMedError ? "The Pack Med was not linked." : "",
        ].filter(Boolean);
        toast.success(
          created.length === 1
            ? `${first.recordName} was created`
            : `${created.length} recurring passes were created`,
          {
            ...(notes.length
              ? { description: notes.join(" ") }
              : {}),
            action: {
              label: "View Pass",
              onClick: () => onOpenView(first.id),
            },
          },
        );
        onClose(); // back to the originating page
        return;
      }

      if (!pass) {
        releaseSave();
        return;
      }
      // Build from the stored record (a Pack Med may have been linked while
      // the form was open), so no association is overwritten by a stale copy.
      const stored = getPassById(pass.id) ?? pass;
      const edited: PassRecord = {
        ...stored,
        ...fields,
        recordName: buildPassRecordName(
          youthName(fields.youthId),
          fields.startDate,
        ),
        updatedAt: now,
      };
      if (isRecurring) {
        // Choose the scope before anything is applied.
        setPendingEdit(edited);
        setPendingPackMedId(values.packMedId);
        releaseSave();
        return;
      }
      persist([edited]);
      const linkError = applyPackMedChoice(
        pass.id,
        values.packMedId,
      );
      toast.success(
        `${edited.recordName} was saved`,
        linkError
          ? { description: "The Pack Med was not linked." }
          : undefined,
      );
      onClose();
    } catch (err) {
      releaseSave();
      toast.error("The pass could not be saved", {
        description:
          err instanceof Error ? err.message : undefined,
      });
    }
  }

  function applySeriesEdit(scope: PassSeriesScope) {
    if (!pass || !pendingEdit || submitLock.current) return;
    submitLock.current = true;
    setSaving(true);
    try {
      const updated = applyPassEdit(
        getPassById(pass.id) ?? pass,
        pendingEdit,
        pass.seriesId ? getSeriesPasses(pass.seriesId) : series,
        scope,
      );
      // Every Pass in the chosen scope must be in this context before any
      // of them is written (no partial series change).
      const blocked = checkContext({
        records: updated,
      });
      if (blocked) {
        rejectContext(blocked);
        releaseSave();
        setPendingEdit(null);
        return;
      }
      persist(updated);
      // Pack Med stays occurrence-specific: only the edited Pass is linked.
      const linkError = applyPackMedChoice(
        pass.id,
        pendingPackMedId,
      );
      setPendingEdit(null);
      toast.success(
        updated.length === 1
          ? `${pendingEdit.recordName} was saved`
          : `${updated.length} passes were saved`,
        linkError
          ? { description: "The Pack Med was not linked." }
          : undefined,
      );
      onClose();
    } catch (err) {
      releaseSave();
      toast.error("The pass could not be saved", {
        description:
          err instanceof Error ? err.message : undefined,
      });
    }
  }

  // ── Cancel Pass (status → Cancelled; records are kept) ────────────────
  function confirmCancel(
    scope: PassSeriesScope,
    reason: string,
  ) {
    if (!pass) return;
    const now = new Date().toISOString();
    const scoped = scopeTargets(pass, series, scope);
    const blocked = checkContext({ records: scoped });
    if (blocked) {
      rejectContext(blocked);
      setCancelOpen(false);
      return;
    }
    const targets = scoped.map(
      (p) => ({
        ...p,
        status: "Cancelled" as const,
        cancellationReason: reason,
        actualReturnDate: "",
        actualReturnTime: "",
        changeReason: "",
        updatedAt: now,
      }),
    );
    persist(targets);
    setCancelOpen(false);
    toast.success(
      targets.length === 1
        ? `${pass.recordName} was cancelled`
        : `${targets.length} passes were cancelled`,
    );
    // The View stays open and follows the live record.
  }

  // ── Delete (records entered in error) ─────────────────────────────────
  function confirmDelete() {
    if (!pass) return;
    const blocked = checkContext({ records: [pass] });
    if (blocked) {
      rejectContext(blocked);
      setDeleteOpen(false);
      return;
    }
    const name = pass.recordName;
    deletePass(pass.id);
    setDeleteOpen(false);
    toast.success(`${name} was deleted`);
    onClose();
  }

  // ── Header text ───────────────────────────────────────────────────────
  const title =
    mode === "create"
      ? "New Pass"
      : mode === "edit"
        ? "Edit Pass"
        : "View Pass";
  const contextProgram =
    create.defaultProgramId !== undefined
      ? getProgramById(create.defaultProgramId)?.name
      : undefined;
  const subtitle = pass
    ? pass.recordName
    : copySource
      ? `Copying ${copySource.recordName}`
      : ownerContext
        ? `For ${ownerContext.youthName} · ${ownerContext.programName}`
      : contextProgram
        ? `For ${contextProgram}`
        : mode === "create"
          ? "Create a Pass without leaving this page."
          : "";

  const missing = !isCreate && !pass;

  return (
    <>
      <Dialog
        open
        onOpenChange={(o) => {
          if (!o) onClose();
        }}
      >
        <DialogContent
          size="xl"
          aria-describedby="pass-record-dialog-description"
          // A stray click outside must not discard a create/edit draft
          // (same protection as the app's other large create forms).
          onInteractOutside={(e) => {
            if (mode !== "view") e.preventDefault();
          }}
          onCloseAutoFocus={(e) => {
            const explicit = request.launch.returnFocusTo?.();
            if (explicit?.isConnected) {
              e.preventDefault();
              explicit.focus();
              return;
            }
            if (launcher?.isConnected) return; // default restore
            // The launcher is gone (e.g. its row was deleted or filtered
            // out): land on the page region behind the modal.
            e.preventDefault();
            const main =
              document.querySelector<HTMLElement>("main");
            if (main) {
              main.setAttribute("tabindex", "-1");
              main.focus({ preventScroll: true });
            }
          }}
        >
          <DialogHeader>
            <div className="flex items-start gap-3 pr-8">
              <Ticket
                className="h-6 w-6 mt-0.5 flex-shrink-0 text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription
                  id="pass-record-dialog-description"
                  className="flex items-center gap-2 flex-wrap"
                >
                  <span className="truncate">{subtitle}</span>
                  {pass && (
                    <Badge
                      variant={
                        PASS_STATUS_BADGE_VARIANT[pass.status]
                      }
                    >
                      {pass.status}
                    </Badge>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogBody className="bg-[var(--slds-g-color-background-alt-2)]">
            {missing ? (
              <div
                className="py-10 text-center"
                data-testid="pass-missing"
              >
                <h2 className="text-lg font-semibold mb-2 text-[var(--slds-g-color-text-default)]">
                  Pass not found
                </h2>
                <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
                  This pass no longer exists. It may have been
                  deleted.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(contextMessage || outOfContext) && (
                  <p
                    role="alert"
                    data-testid="pass-context-notice"
                    className="slds-text-4 rounded border px-3 py-2 border-[#c23934] text-[#c23934] bg-white"
                  >
                    {contextMessage ||
                      "This Pass does not belong to this Constituent's current Program, so it can't be changed from here. It is shown as saved."}
                  </p>
                )}
                <PassForm
                  key={`${request.openId}:${request.formKey}`}
                  ref={formRef}
                  mode={mode}
                  pass={pass}
                  defaultYouthId={create.defaultYouthId}
                  defaultProgramId={create.defaultProgramId}
                  defaultStartDate={create.defaultStartDate}
                  copyFrom={copySource}
                  ownerContext={
                    mode === "view" ? null : ownerContext
                  }
                  onSubmit={handleSubmit}
                />

                {mode === "view" && pass && (
                  <Card variant="section">
                    <CardHeader size="sm" separated>
                      <CardTitle size="sm">
                        Field History
                      </CardTitle>
                    </CardHeader>
                    <CardContent size="sm">
                      {history.length === 0 ? (
                        <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                          No changes to Start Date, Departure
                          Time, End Date, Return Time, who or
                          where the youth is staying, or Status
                          yet.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow hoverable={false}>
                                <TableHead variant="slds">
                                  Date
                                </TableHead>
                                <TableHead variant="slds">
                                  Field
                                </TableHead>
                                <TableHead variant="slds">
                                  Original Value
                                </TableHead>
                                <TableHead variant="slds">
                                  New Value
                                </TableHead>
                                <TableHead variant="slds">
                                  Changed By
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {history.map((h) => (
                                <TableRow key={h.id}>
                                  <TableCell>
                                    {formatMdy(h.changedAt)}{" "}
                                    {new Date(
                                      h.changedAt,
                                    ).toLocaleTimeString(
                                      "en-US",
                                      {
                                        hour: "numeric",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </TableCell>
                                  <TableCell>{h.field}</TableCell>
                                  <TableCell>
                                    {h.previousValue || "—"}
                                  </TableCell>
                                  <TableCell>
                                    {h.newValue || "—"}
                                  </TableCell>
                                  <TableCell>
                                    {h.changedBy}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogBody>

          {mode === "view" || missing ? (
            <DialogFooter className="flex-wrap justify-between sm:justify-between">
              <div>
                {pass && (
                  <Button
                    variant="destructive"
                    disabled={actionsBlocked}
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 /> Delete
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {pass && pass.status !== "Cancelled" && (
                  <Button
                    variant="accent"
                    disabled={actionsBlocked}
                    onClick={() => setCancelOpen(true)}
                  >
                    <Ban /> Cancel Pass
                  </Button>
                )}
                {pass && (
                  <Button
                    variant="outline"
                    disabled={actionsBlocked}
                    onClick={() =>
                      onSwitch({
                        kind: "create",
                        copyFromId: pass.id,
                      })
                    }
                  >
                    <Copy /> Copy
                  </Button>
                )}
                {pass && (
                  <Button
                    variant="outline-primary"
                    disabled={actionsBlocked}
                    onClick={() =>
                      onSwitch({ kind: "edit", id: pass.id })
                    }
                  >
                    <Pencil /> Edit
                  </Button>
                )}
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </DialogFooter>
          ) : (
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                disabled={
                  saving || pendingEdit !== null || actionsBlocked
                }
                onClick={() => formRef.current?.submit()}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit scope — recurring occurrences only. Backing out leaves the
          draft intact and writes nothing. */}
      <PassActionDialog
        open={pendingEdit !== null}
        onOpenChange={(o) => !o && setPendingEdit(null)}
        title="Edit Recurring Pass"
        description="This pass is part of a recurring series. Choose which passes your changes apply to. Each pass keeps its own dates."
        confirmLabel="Save"
        showScope
        disabledScopes={
          pendingEdit &&
          isShortenedOrExtended(pendingEdit.status)
            ? {
                scopes: ["future", "series"],
                reason:
                  "Shortened and Extended record one pass's actual return, so they apply to This Pass only.",
              }
            : undefined
        }
        requireReason={false}
        onConfirm={(scope) => applySeriesEdit(scope)}
      />

      {/* Cancel Pass — the record is kept with Status = Cancelled */}
      <PassActionDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel Pass"
        description={`${pass?.recordName ?? "This pass"} will be marked Cancelled and kept on record.`}
        confirmLabel="Cancel Pass"
        confirmVariant="accent"
        showScope={isRecurring}
        requireReason
        onConfirm={confirmCancel}
      />

      {/* Delete — records entered in error */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pass</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete "{pass?.recordName}"? Use this
              only for a pass entered in error — to keep the
              record, use Cancel Pass instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
