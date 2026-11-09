// US 20221 — Shift Roles configuration for one Program (Program Profile →
// Staff tab, directly below Active Youth). Saves are independent of the
// Program form and go through shiftRoleStore's write boundary, which applies
// the same permission check as this UI.

import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, BadgeCheck, Pencil, Plus, Trash2 } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { EmptyState } from "../ui/empty-state";
import { Alert, AlertDescription } from "../ui/alert";
import { FieldError, FieldLabel } from "../ui/field";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  SHIFT_ROLE_MESSAGES,
  addShiftRole,
  canConfigureShiftRoles,
  deleteShiftRole,
  renameShiftRole,
  rolesForProgram,
  setShiftRoleActive,
  shiftRoleReferenceCount,
  useShiftRoleState,
  type ShiftRole,
} from "../../data/shiftRoleStore";

const sldsBorder = "1px solid var(--slds-g-color-border-base-1)";
const sldsWeak = "var(--slds-g-color-text-weak)";
const sldsDefault = "var(--slds-g-color-text-default)";
const sldsBase = "var(--slds-g-color-background-base)";
const sldsAlt = "var(--slds-g-color-background-alt)";
const errorRed = "#c23934";
const primaryButtonStyle: React.CSSProperties = { backgroundColor: "#145F33" };
const outlineButtonStyle: React.CSSProperties = {
  border: sldsBorder,
  backgroundColor: sldsBase,
  color: sldsDefault,
};
const cellClass = "px-2 py-2.5 slds-text-4 align-top";

export function ShiftRolesSection({
  programId,
  programName,
}: {
  programId: number;
  programName: string;
}) {
  const state = useShiftRoleState();
  const canConfigure = canConfigureShiftRoles(programId);
  const roles = state.status === "ok" ? rolesForProgram(state.roles, programId) : [];

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ShiftRole | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ShiftRole | null>(null);

  const toggleActive = (r: ShiftRole) => {
    const res = setShiftRoleActive(r.id, !r.active);
    if (res.ok)
      toast.success(`Shift Role "${r.name}" ${r.active ? "deactivated" : "activated"}.`);
    else toast.error(SHIFT_ROLE_MESSAGES[res.error]);
  };

  return (
    <section
      aria-labelledby={`shift-roles-title-${programId}`}
      className="overflow-hidden"
      style={{
        border: sldsBorder,
        borderRadius: "var(--slds-c-card-radius-border)",
        backgroundColor: sldsBase,
      }}
      data-testid="shift-roles-section"
    >
      <div
        className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
        style={{ borderBottom: sldsBorder, backgroundColor: sldsAlt }}
      >
        <div className="min-w-0">
          <h3
            id={`shift-roles-title-${programId}`}
            className="text-[13px] font-semibold"
            style={{ color: sldsDefault }}
          >
            Shift Roles
          </h3>
          <p className="slds-text-3" style={{ color: sldsWeak }}>
            Roles staff can select when logging Staff Member Status in {programName}.
          </p>
        </div>
        {canConfigure && state.status === "ok" && (
          <Button
            className="h-8 rounded-full slds-text-4 text-white shadow-none"
            style={primaryButtonStyle}
            onClick={() => {
              setEditing(null);
              setEditorOpen(true);
            }}
          >
            <Plus aria-hidden />
            Add Shift Role
          </Button>
        )}
      </div>

      <div className="px-4 py-4">
        {state.status !== "ok" ? (
          <Alert variant="error" role="alert">
            <AlertCircle aria-hidden="true" />
            <AlertDescription>
              Shift Roles can't be read right now. Nothing is shown and no changes can be made.
            </AlertDescription>
          </Alert>
        ) : roles.length === 0 ? (
          <EmptyState
            icon={BadgeCheck}
            tone="neutral"
            title="No shift roles configured"
            description={
              canConfigure
                ? "Add the roles staff fill on a shift in this Program."
                : "No Shift Roles have been set up for this Program."
            }
            className="py-6"
          />
        ) : (
          <div
            className="overflow-x-auto"
            style={{ border: sldsBorder, borderRadius: "var(--slds-c-card-radius-border)" }}
          >
            <Table>
              <TableHeader style={{ backgroundColor: sldsAlt }}>
                <TableRow>
                  {["SHIFT ROLE", "STATUS", ...(canConfigure ? ["ACTIONS"] : [])].map((h) => (
                    <TableHead key={h} className="px-2 h-9" style={{ color: sldsWeak, fontSize: 12 }}>
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell
                      className={`${cellClass} whitespace-normal break-words w-full`}
                      style={{ color: sldsDefault }}
                    >
                      {r.name}
                    </TableCell>
                    <TableCell className={cellClass}>
                      <Badge variant={r.active ? "success" : "neutral"}>
                        {r.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    {canConfigure && (
                      <TableCell className={cellClass}>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => {
                              setEditing(r);
                              setEditorOpen(true);
                            }}
                            aria-label={`Edit ${r.name}`}
                            title="Edit"
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 rounded-full slds-text-3 shadow-none"
                            style={outlineButtonStyle}
                            onClick={() => toggleActive(r)}
                            aria-label={`${r.active ? "Deactivate" : "Activate"} ${r.name}`}
                          >
                            {r.active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="ghost-destructive"
                            size="icon-xs"
                            onClick={() => setPendingDelete(r)}
                            aria-label={`Delete ${r.name}`}
                            title="Delete"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ShiftRoleEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        programId={programId}
        programName={programName}
        role={editing}
      />
      <DeleteShiftRoleDialog
        role={pendingDelete}
        programName={programName}
        onClose={() => setPendingDelete(null)}
      />
    </section>
  );
}

function ShiftRoleEditor({
  open,
  onOpenChange,
  programId,
  programName,
  role,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  programId: number;
  programName: string;
  role: ShiftRole | null;
}) {
  const id = useId();
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<string>();
  const [formError, setFormError] = useState<string>();

  useEffect(() => {
    if (open) {
      setName(role?.name ?? "");
      setFieldError(undefined);
      setFormError(undefined);
    }
  }, [open, role]);

  const save = () => {
    const res = role ? renameShiftRole(role.id, name) : addShiftRole(programId, name);
    if (res.ok) {
      toast.success(role ? `Shift Role renamed to "${res.role.name}".` : `Shift Role "${res.role.name}" added.`);
      onOpenChange(false);
      return;
    }
    // Inputs are kept as typed on failure.
    if (res.error === "validation") setFieldError(res.fieldError);
    else setFormError(SHIFT_ROLE_MESSAGES[res.error]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{role ? "Edit Shift Role" : "Add Shift Role"}</DialogTitle>
          <DialogDescription>
            {role ? "Rename this Shift Role for" : "Add a Shift Role to"} {programName}. Fields
            marked * are required.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form
            id={`${id}-form`}
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
            className="space-y-3"
          >
            {formError && (
              <Alert variant="error" role="alert">
                <AlertCircle aria-hidden="true" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <div>
              <FieldLabel htmlFor={`${id}-name`} required>
                Shift Role
              </FieldLabel>
              <Input
                id={`${id}-name`}
                surface="base"
                value={name}
                maxLength={80}
                autoFocus
                aria-required
                aria-invalid={!!fieldError}
                aria-describedby={fieldError ? `${id}-err` : undefined}
                onChange={(e) => {
                  setName(e.target.value);
                  setFieldError(undefined);
                }}
              />
              <FieldError id={`${id}-err`} role="alert">
                {fieldError}
              </FieldError>
              {role && (
                <p className="mt-1 slds-text-3 text-[var(--slds-g-color-text-weak)]">
                  Saved entries keep the role name they were recorded with.
                </p>
              )}
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={`${id}-form`}>
            {role ? "Save" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteShiftRoleDialog({
  role,
  programName,
  onClose,
}: {
  role: ShiftRole | null;
  programName: string;
  onClose: () => void;
}) {
  const [error, setError] = useState<string>();
  useEffect(() => setError(undefined), [role]);
  const refs = role ? shiftRoleReferenceCount(role.id) : 0;
  const blocked = refs === null || refs > 0;
  const blockedMsg =
    refs === null
      ? "Saved entries can't be checked right now, so this Shift Role can't be deleted."
      : `This Shift Role is used by ${refs} saved Staff Member Status ${refs === 1 ? "entry" : "entries"}, so it can't be deleted. Deactivate it to remove it from new entries.`;

  const confirm = () => {
    if (!role) return;
    const res = deleteShiftRole(role.id);
    if (res.ok) {
      toast.success(`Shift Role "${role.name}" deleted.`);
      onClose();
    } else setError(SHIFT_ROLE_MESSAGES[res.error]);
  };
  const deactivate = () => {
    if (!role) return;
    const res = setShiftRoleActive(role.id, false);
    if (res.ok) {
      toast.success(`Shift Role "${role.name}" deactivated.`);
      onClose();
    } else setError(SHIFT_ROLE_MESSAGES[res.error]);
  };

  return (
    <Dialog open={role !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Delete Shift Role</DialogTitle>
          <DialogDescription>
            {blocked
              ? `"${role?.name}" in ${programName} can't be deleted.`
              : `Delete "${role?.name}" from ${programName}? This can't be undone.`}
          </DialogDescription>
        </DialogHeader>
        {(blocked || error) && (
          <DialogBody>
            <Alert variant={error ? "error" : "warning"} role="alert">
              <AlertCircle aria-hidden="true" />
              <AlertDescription>{error ?? blockedMsg}</AlertDescription>
            </Alert>
          </DialogBody>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {blocked ? (
            role?.active &&
            refs !== null && (
              <Button type="button" onClick={deactivate}>
                Deactivate
              </Button>
            )
          ) : (
            <Button type="button" variant="destructive" onClick={confirm}>
              Delete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
