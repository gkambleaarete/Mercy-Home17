// US 20185 Chunk 1 — Shift Handover Checklists configuration, shown inside
// an individual Program record. UI prototype: saves go to the in-memory
// demo store (shiftHandoverChecklistStore), not a backend.

import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ListChecks,
  Pencil,
  Plus,
  Trash2,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { EmptyState } from "../ui/empty-state";
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
  CHECKLIST_SHIFT_OPTIONS,
  CHECKLIST_STATUS_OPTIONS,
  type ChecklistItem,
  type ChecklistShift,
  type ChecklistStatus,
  type ShiftHandoverChecklist,
  newChecklistId,
  saveChecklist,
  deleteChecklist,
  useProgramChecklists,
} from "../../data/shiftHandoverChecklistStore";

const sldsBorder = "1px solid var(--slds-g-color-border-base-1)";
const sldsWeak = "var(--slds-g-color-text-weak)";
const sldsDefault = "var(--slds-g-color-text-default)";
const sldsBase = "var(--slds-g-color-background-base)";
const sldsAlt = "var(--slds-g-color-background-alt)";
const errorRed = "#c23934";

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: "#145F33",
};
const outlineButtonStyle: React.CSSProperties = {
  border: sldsBorder,
  backgroundColor: sldsBase,
  color: sldsDefault,
};
const cellClass = "px-2 py-2.5 slds-text-4 align-top";

function Label({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="slds-form-label block"
      style={{ color: sldsWeak }}
    >
      {children}
      {required && <span style={{ color: errorRed }}> *</span>}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="slds-text-3 mt-0.5" style={{ color: errorRed }}>
      {message}
    </p>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────

export function ShiftHandoverChecklistsSection({
  programId,
  programName,
  canConfigure,
}: {
  programId: number;
  programName: string;
  /** Existing manager capability flag; hides configuration actions when false. */
  canConfigure: boolean;
}) {
  const checklists = useProgramChecklists(programId);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ShiftHandoverChecklist | null>(
    null,
  );

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const openEdit = (c: ShiftHandoverChecklist) => {
    setEditing(c);
    setEditorOpen(true);
  };

  const [pendingDelete, setPendingDelete] =
    useState<ShiftHandoverChecklist | null>(null);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteChecklist(pendingDelete.id);
    toast.success(`Checklist "${pendingDelete.name}" deleted.`);
    setPendingDelete(null);
  };

  return (
    <section
      aria-labelledby="shift-handover-checklists-title"
      className="overflow-hidden"
      style={{
        border: sldsBorder,
        borderRadius: "var(--slds-c-card-radius-border)",
        backgroundColor: sldsBase,
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
        style={{ borderBottom: sldsBorder, backgroundColor: sldsAlt }}
      >
        <div className="min-w-0">
          <h3
            id="shift-handover-checklists-title"
            className="text-[13px] font-semibold"
            style={{ color: sldsDefault }}
          >
            Shift Handover Checklists
          </h3>
          <p className="slds-text-3" style={{ color: sldsWeak }}>
            Checklists staff complete during {programName} shift handovers.
          </p>
        </div>
        {canConfigure && (
          <Button
            className="h-8 rounded-full slds-text-4 text-white shadow-none"
            style={primaryButtonStyle}
            onClick={openNew}
          >
            <Plus aria-hidden />
            New Checklist
          </Button>
        )}
      </div>

      <div className="px-4 py-4">
        {checklists.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            tone="neutral"
            title="No checklists configured"
            description="Create a checklist for this Program's shift handovers."
            className="py-6"
          />
        ) : (
          <div
            className="overflow-x-auto"
            style={{
              border: sldsBorder,
              borderRadius: "var(--slds-c-card-radius-border)",
            }}
          >
            <Table>
              <TableHeader style={{ backgroundColor: sldsAlt }}>
                <TableRow>
                  {[
                    "CHECKLIST NAME",
                    "SHIFTS",
                    "STATUS",
                    "ITEMS",
                    ...(canConfigure ? ["ACTIONS"] : []),
                  ].map((h) => (
                    <TableHead
                      key={h}
                      className="px-2 h-9"
                      style={{ color: sldsWeak, fontSize: 12 }}
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {checklists.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell
                      className={`${cellClass} whitespace-normal break-words w-full`}
                      style={{ color: sldsDefault }}
                    >
                      {c.name}
                    </TableCell>
                    <TableCell
                      className={cellClass}
                      style={{ color: sldsDefault }}
                    >
                      {c.shift}
                    </TableCell>
                    <TableCell className={cellClass}>
                      <Badge
                        variant={
                          c.status === "Active" ? "success" : "neutral"
                        }
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cellClass}
                      style={{ color: sldsDefault }}
                    >
                      {c.items.length}
                    </TableCell>
                    {canConfigure && (
                      <TableCell className={cellClass}>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => openEdit(c)}
                            aria-label={`Edit ${c.name}`}
                            title="Edit"
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost-destructive"
                            size="icon-xs"
                            onClick={() => setPendingDelete(c)}
                            aria-label={`Delete ${c.name}`}
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

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Checklist</DialogTitle>
            <DialogDescription>
              Delete "{pendingDelete?.name}"? This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="h-9 rounded-full slds-text-4 shadow-none"
              style={outlineButtonStyle}
              onClick={() => setPendingDelete(null)}
            >
              Cancel
            </Button>
            <Button
              className="h-9 rounded-full slds-text-4 text-white shadow-none"
              style={{ backgroundColor: errorRed }}
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editorOpen && (
        <ChecklistEditorDialog
          open={editorOpen}
          onOpenChange={setEditorOpen}
          programId={programId}
          programName={programName}
          initial={editing}
        />
      )}
    </section>
  );
}

// ─── New / Edit popup ─────────────────────────────────────────────────────

interface DraftItem extends ChecklistItem {}

interface Errors {
  name?: string;
  items?: string;
  itemDescriptions: Record<string, string>;
}

const noErrors: Errors = { itemDescriptions: {} };

function ChecklistEditorDialog({
  open,
  onOpenChange,
  programId,
  programName,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: number;
  programName: string;
  initial: ShiftHandoverChecklist | null;
}) {
  const isEdit = initial !== null;
  const [name, setName] = useState(initial?.name ?? "");
  const [shift, setShift] = useState<ChecklistShift>(
    initial?.shift ?? "All Shifts",
  );
  const [status, setStatus] = useState<ChecklistStatus>(
    initial?.status ?? "Active",
  );
  const [items, setItems] = useState<DraftItem[]>(
    () =>
      initial?.items.map((i) => ({ ...i })) ?? [
        { id: newChecklistId("item"), description: "" },
      ],
  );
  const [errors, setErrors] = useState<Errors>(noErrors);
  const [submitted, setSubmitted] = useState(false);

  const validate = (
    n: string,
    list: DraftItem[],
  ): Errors => {
    const e: Errors = { itemDescriptions: {} };
    if (!n.trim()) e.name = "Enter a checklist name.";
    if (list.length === 0) e.items = "Add at least one checklist item.";
    list.forEach((i) => {
      if (!i.description.trim())
        e.itemDescriptions[i.id] = "Enter a description for this item.";
    });
    return e;
  };

  // After the first Save attempt, errors track edits live.
  const update = (n: string, list: DraftItem[]) => {
    if (submitted) setErrors(validate(n, list));
  };

  const setItemsAndValidate = (list: DraftItem[]) => {
    setItems(list);
    update(name, list);
  };

  const move = (index: number, delta: -1 | 1) => {
    const next = [...items];
    const [row] = next.splice(index, 1);
    next.splice(index + delta, 0, row);
    setItemsAndValidate(next);
  };

  const handleSave = () => {
    setSubmitted(true);
    const e = validate(name, items);
    setErrors(e);
    const hasErrors =
      !!e.name || !!e.items || Object.keys(e.itemDescriptions).length > 0;
    if (hasErrors) return;

    const saved: ShiftHandoverChecklist = {
      id: initial?.id ?? newChecklistId(),
      programId,
      name: name.trim(),
      shift,
      status,
      items: items.map((i) => ({
        id: i.id,
        description: i.description.trim(),
      })),
    };
    saveChecklist(saved);
    toast.success(
      isEdit
        ? `Checklist "${saved.name}" saved successfully.`
        : `Checklist "${saved.name}" created successfully.`,
    );
    onOpenChange(false);
  };

  const nameId = "checklist-name";
  const shiftId = "checklist-shift";
  const statusId = "checklist-status";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Checklist" : "New Checklist"}
          </DialogTitle>
          <DialogDescription>
            Program: {programName}. Staff complete this checklist during
            shift handovers for the selected shifts.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-5">
            <div>
              <Label htmlFor={nameId} required>
                Checklist Name
              </Label>
              <Input
                id={nameId}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  update(e.target.value, items);
                }}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? `${nameId}-error` : undefined}
                aria-required
              />
              <FieldError id={`${nameId}-error`} message={errors.name} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={shiftId}>Applicable Shifts</Label>
                <Select
                  value={shift}
                  onValueChange={(v) => setShift(v as ChecklistShift)}
                >
                  <SelectTrigger id={shiftId}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHECKLIST_SHIFT_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor={statusId}>Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as ChecklistStatus)}
                >
                  <SelectTrigger id={statusId}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHECKLIST_STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <fieldset
              aria-describedby={errors.items ? "checklist-items-error" : undefined}
            >
              <legend className="slds-form-label" style={{ color: sldsWeak }}>
                Checklist Items
                <span style={{ color: errorRed }}> *</span>
              </legend>

              {items.length > 0 && (
                <ol className="mt-2 space-y-2">
                  {items.map((item, index) => {
                    const n = index + 1;
                    const descId = `checklist-item-${item.id}`;
                    const err = errors.itemDescriptions[item.id];
                    return (
                      <li
                        key={item.id}
                        className="flex items-start gap-2 p-2"
                        style={{
                          border: sldsBorder,
                          borderRadius: "var(--slds-c-card-radius-border)",
                          backgroundColor: sldsAlt,
                        }}
                      >
                        <span
                          className="slds-text-4 font-semibold w-7 shrink-0 text-right pt-2"
                          style={{ color: sldsWeak }}
                          aria-hidden
                        >
                          {n}.
                        </span>
                        <div className="flex-1 min-w-0">
                          <label htmlFor={descId} className="sr-only">
                            Item {n} description (required)
                          </label>
                          <Textarea
                            id={descId}
                            rows={2}
                            className="min-h-[40px] resize-y"
                            style={{ backgroundColor: sldsBase }}
                            value={item.description}
                            onChange={(e) =>
                              setItemsAndValidate(
                                items.map((i) =>
                                  i.id === item.id
                                    ? { ...i, description: e.target.value }
                                    : i,
                                ),
                              )
                            }
                            aria-invalid={!!err}
                            aria-describedby={err ? `${descId}-error` : undefined}
                            aria-required
                          />
                          <FieldError id={`${descId}-error`} message={err} />
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0 pt-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            aria-label={`Move item ${n} up`}
                            disabled={index === 0}
                            onClick={() => move(index, -1)}
                          >
                            <ArrowUp />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            aria-label={`Move item ${n} down`}
                            disabled={index === items.length - 1}
                            onClick={() => move(index, 1)}
                          >
                            <ArrowDown />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost-destructive"
                            size="icon-xs"
                            aria-label={`Delete item ${n}`}
                            onClick={() =>
                              setItemsAndValidate(
                                items.filter((i) => i.id !== item.id),
                              )
                            }
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}

              <FieldError id="checklist-items-error" message={errors.items} />

              <Button
                type="button"
                variant="outline"
                className="mt-3 h-8 rounded-full slds-text-4 shadow-none"
                style={outlineButtonStyle}
                onClick={() =>
                  setItemsAndValidate([
                    ...items,
                    { id: newChecklistId("item"), description: "" },
                  ])
                }
              >
                <Plus aria-hidden />
                Add Item
              </Button>
            </fieldset>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            className="h-9 rounded-full slds-text-4 shadow-none"
            style={outlineButtonStyle}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-9 rounded-full slds-text-4 text-white shadow-none"
            style={primaryButtonStyle}
            onClick={handleSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
