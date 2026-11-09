import { useRef, useState } from "react";
import {
  AlertCircle,
  Pencil,
  Plus,
  RefreshCw,
  Users,
} from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";
import { Button } from "../ui/button";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import { PaginationInfo } from "../ui/pagination";
import { isoToMdy } from "../../lib/dateFormat";
import {
  PROGRAM_STAFF_LEGACY_TITLES,
  PROGRAM_STAFF_TITLES,
  assignmentsForProgram,
  getProgramStaffAssignments,
  isRecognizedProgramStaffTitle,
  programStaffTitleDisplay,
  useProgramStaffAssignments,
  type ProgramStaffAssignment,
} from "../../data/programStaffAssignmentStore";
import { constituentLabel } from "../../data/transitionSummaryDetailsSources";
import { eligibleStaffOptions } from "../../data/programStaffAssignmentForm";
import {
  StaffAssignmentDialog,
  type AssignmentDialogMode,
} from "./StaffAssignmentDialog";

/** A Program being created: its assignments stay in this draft (held by the
 *  Program form) until the Program itself is saved. */
export interface ProgramAssignmentDraft {
  /** The Program Name currently typed on Program Details. */
  programName: string;
  rows: ProgramStaffAssignment[];
  onChange: (rows: ProgramStaffAssignment[]) => void;
}

const MISSING = "—";

/** The shared seven-title order, then the old combined title. */
const TITLE_ORDER: string[] = [
  ...PROGRAM_STAFF_TITLES.map((t) => t.id),
  ...PROGRAM_STAFF_LEGACY_TITLES.map((t) => t.id),
];

/**
 * MHBG Staff Title Assignments for one saved Program (US 20127): every
 * assignment of THIS Program (undated, past, future and current), grouped by
 * Title, from the same shared records the Constituent Profile edits and the
 * Staff History card reads. Add / Edit are offered only when `canEdit`
 * (the Program page's existing edit gate); each saves on its own and never
 * touches the Program Details form or the five Program lookup fields.
 */
export function ProgramStaffTitleAssignmentsSection({
  programId,
  canEdit,
  draft,
}: {
  programId: number;
  canEdit: boolean;
  /** Create mode: show and edit these draft rows instead of stored ones. */
  draft?: ProgramAssignmentDraft;
}) {
  const storedRead = useProgramStaffAssignments();
  // A draft never reads the store (nothing is saved yet); its Program save
  // reports an unreadable store itself.
  const read: typeof storedRead = draft
    ? { status: "ok", assignments: draft.rows }
    : storedRead;
  const [mode, setMode] = useState<AssignmentDialogMode | null>(null);
  const [, setTick] = useState(0);
  const addRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<string | null>(null);
  const uid = `pspa-${programId}`;

  const staffName = (id: number) =>
    constituentLabel(id) ?? "Staff record unavailable";

  // Grouped by Title in the shared order; within a title, most recent start
  // first (assignmentsForProgram's order), each record its own row.
  const flat: ProgramStaffAssignment[] = (() => {
    if (read.status !== "ok") return [];
    const mine = draft
      ? read.assignments
      : assignmentsForProgram(read.assignments, programId);
    const known = TITLE_ORDER.flatMap((t) =>
      mine.filter((a) => a.titleId === t),
    );
    // Records with an unrecognized title are never hidden: they follow the
    // known groups, one group per stored value.
    const unknown = mine
      .filter((a) => !isRecognizedProgramStaffTitle(a.titleId))
      .sort((x, y) => x.titleId.localeCompare(y.titleId));
    return [...known, ...unknown];
  })();
  // Every assignment is shown; there is no pagination.
  const pageRows = flat;
  const showStart = flat.length === 0 ? 0 : 1;
  const showEnd = flat.length;

  const openDialog = (next: AssignmentDialogMode) => {
    let m = next;
    if (next.kind === "edit" && draft) {
      const latest = draft.rows.find((a) => a.id === next.assignment.id);
      if (!latest) return;
      m = { kind: "edit", assignment: latest };
    } else if (next.kind === "edit") {
      const r = getProgramStaffAssignments();
      const latest =
        r.status === "ok"
          ? r.assignments.find((a) => a.id === next.assignment.id)
          : undefined;
      if (!latest) {
        toast.error("This assignment no longer exists.");
        return;
      }
      if (latest.programId !== programId) {
        toast.error("This assignment was moved to another Program.", {
          description: "It can't be edited from this Program.",
        });
        return;
      }
      m = { kind: "edit", assignment: latest };
    }
    returnTo.current =
      m.kind === "add" ? "add" : `edit:${m.assignment.id}`;
    setMode(m);
  };

  return (
    <section
      aria-labelledby={`${uid}-heading`}
      data-testid="program-title-assignments"
      className="overflow-hidden"
      style={{
        border: "1px solid var(--slds-g-color-border-base-1)",
        borderRadius: "var(--slds-c-card-radius-border)",
        backgroundColor: "var(--slds-g-color-background-base)",
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between gap-4"
        style={{
          borderBottom: "1px solid var(--slds-g-color-border-base-1)",
          backgroundColor: "var(--slds-g-color-background-alt)",
        }}
      >
        <h3
          id={`${uid}-heading`}
          className="text-[13px] font-semibold"
          style={{ color: "var(--slds-g-color-text-default)" }}
        >
          MHBG Staff Title Assignments
        </h3>
        {canEdit && read.status === "ok" && (
          <Button
            ref={addRef}
            variant="outline-primary"
            size="sm"
            onClick={() => openDialog({ kind: "add" })}
          >
            <Plus aria-hidden="true" />
            Add
          </Button>
        )}
      </div>

      {read.status === "error" ? (
        <div className="p-4">
          <EmptyState
            icon={AlertCircle}
            tone="error"
            title="Title assignments could not be loaded"
            description="Saved assignments can't be read right now. Nothing has been changed, and assignments can't be added or edited until they can be read."
            actionLabel="Try again"
            actionIcon={RefreshCw}
            actionVariant="outline"
            onAction={() => {
              // Re-reads the shared data without a page reload.
              getProgramStaffAssignments();
              setTick((t) => t + 1);
            }}
          />
        </div>
      ) : flat.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={Users}
            title="No title assignments for this Program"
            description={
              canEdit
                ? draft
                  ? "Use Add to record a staff member's Title. Assignments are saved with the Program when you click Save."
                  : "Use Add to record a staff member's Title in this Program."
                : undefined
            }
            className="py-6"
          />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead variant="slds" size="md">Staff Member</TableHead>
                  <TableHead variant="slds" size="md">Start Date</TableHead>
                  <TableHead variant="slds" size="md">End Date</TableHead>
                  <TableHead variant="slds" size="md">Notes</TableHead>
                  {canEdit && (
                    <TableHead variant="slds" size="md" className="text-right">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((a, i) => {
                  const label = programStaffTitleDisplay(a.titleId);
                  const startsGroup =
                    i === 0 || pageRows[i - 1].titleId !== a.titleId;
                  return [
                    startsGroup && (
                      <TableRow
                        key={`group-${a.titleId}-${a.id}`}
                        data-title-group={a.titleId}
                      >
                        <TableCell
                          colSpan={canEdit ? 5 : 4}
                          className="px-4 py-2 font-semibold bg-[var(--slds-g-color-background-alt)]"
                        >
                          {label}
                        </TableCell>
                      </TableRow>
                    ),
                    <TableRow key={a.id} data-assignment-row={a.id}>
                      <TableCell wrap className="px-4">
                        {staffName(a.constituentId)}
                      </TableCell>
                      <TableCell className="px-4 whitespace-nowrap">
                        {a.startDate ? isoToMdy(a.startDate) : MISSING}
                      </TableCell>
                      <TableCell className="px-4 whitespace-nowrap">
                        {a.endDate ? isoToMdy(a.endDate) : MISSING}
                      </TableCell>
                      <TableCell
                        wrap
                        className="px-4 whitespace-pre-wrap break-words min-w-[12rem] max-w-[28rem]"
                      >
                        {a.notes || MISSING}
                      </TableCell>
                      {canEdit && (
                        <TableCell className="px-4 text-right whitespace-nowrap">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost-primary"
                                size="icon-xs"
                                data-assignment-edit={a.id}
                                aria-label={`Edit ${label} for ${staffName(a.constituentId)}`}
                                onClick={() =>
                                  openDialog({ kind: "edit", assignment: a })
                                }
                              >
                                <Pencil aria-hidden="true" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>,
                  ];
                })}
              </TableBody>
            </Table>
          </div>
          <div className="px-4 py-2.5 border-t border-border">
            <PaginationInfo
              start={showStart}
              end={showEnd}
              total={flat.length}
              label="Assignments"
            />
          </div>
        </>
      )}

      {canEdit && (
        <StaffAssignmentDialog
          mode={mode}
          context={{
            ...(draft
              ? {
                  kind: "draft" as const,
                  programName: draft.programName,
                  drafts: draft.rows,
                  onSaveDraft: (row: ProgramStaffAssignment) =>
                    draft.onChange(
                      draft.rows.some((r) => r.id === row.id)
                        ? draft.rows.map((r) =>
                            r.id === row.id ? row : r,
                          )
                        : [...draft.rows, row],
                    ),
                }
              : { kind: "program" as const, programId }),
            staffOptions: eligibleStaffOptions(),
            staffName,
          }}
          idPrefix={uid}
          onClose={() => setMode(null)}
          getReturnFocus={() => {
            const key = returnTo.current;
            const el =
              key && key.startsWith("edit:")
                ? (document.querySelector(
                    `[data-assignment-edit="${key.slice(5)}"]`,
                  ) as HTMLElement | null)
                : null;
            // A moved record's Edit button is gone: fall back to Add.
            return el ?? addRef.current;
          }}
        />
      )}
    </section>
  );
}
