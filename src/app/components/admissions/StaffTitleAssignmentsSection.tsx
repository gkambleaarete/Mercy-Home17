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
import { getPrograms } from "../../data/mockProgramsData";
import {
  PROGRAM_STAFF_LEGACY_TITLES,
  PROGRAM_STAFF_TITLES,
  assignmentsForStaff,
  getProgramStaffAssignments,
  canManageProgramStaffAssignments,
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

const MISSING = "—";

type Mode = AssignmentDialogMode;

/** The shared seven-title order, then the old combined title. */
const TITLE_ORDER: string[] = [
  ...PROGRAM_STAFF_TITLES.map((t) => t.id),
  ...PROGRAM_STAFF_LEGACY_TITLES.map((t) => t.id),
];

/**
 * MHBG Staff Title Assignments (US 20127) — the Constituent Roles section
 * where a staff member's Program title assignments are added and edited.
 * Rows are the same shared records the Program Record's Staff History
 * reads: one per saved assignment (undated, past, future and combined-title
 * records included). Add and Edit save on their own through the shared
 * store; they never touch Constituent Role records or the page's Details.
 */
export function StaffTitleAssignmentsSection({
  constituentId,
}: {
  constituentId: number;
}) {
  const read = useProgramStaffAssignments();
  const programs = [...getPrograms()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const programName = (id: number) =>
    programs.find((p) => p.id === id)?.name ?? "Program unavailable";
  const uid = `psa-${constituentId}`;
  // The same existing edit gate as the Program side (System Admin).
  const canEdit = canManageProgramStaffAssignments();

  const [mode, setMode] = useState<Mode | null>(null);
  const [, setTick] = useState(0);
  const addRef = useRef<HTMLButtonElement>(null);
  // What to refocus when the dialog closes (it is opened from code, not a
  // DialogTrigger).
  const returnTo = useRef<string | null>(null);

  // Grouped by Title in the shared order; each record its own row.
  const rows: ProgramStaffAssignment[] = (() => {
    if (read.status !== "ok") return [];
    const mine = assignmentsForStaff(read.assignments, constituentId);
    const known = TITLE_ORDER.flatMap((t) =>
      mine.filter((a) => a.titleId === t),
    );
    const unknown = mine
      .filter((a) => !isRecognizedProgramStaffTitle(a.titleId))
      .sort((x, y) => x.titleId.localeCompare(y.titleId));
    return [...known, ...unknown];
  })();
  // Every assignment is shown; there is no pagination.
  const pageRows = rows;
  const showStart = rows.length === 0 ? 0 : 1;
  const showEnd = rows.length;

  const openDialog = (next: Mode) => {
    // A fresh draft for Add; the LATEST saved record for Edit.
    let m = next;
    if (next.kind === "edit") {
      const latest = (() => {
        const r = getProgramStaffAssignments();
        return r.status === "ok"
          ? r.assignments.find((a) => a.id === next.assignment.id)
          : undefined;
      })();
      if (!latest) {
        toast.error("This assignment no longer exists.");
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
      data-testid="staff-title-assignments"
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
      ) : rows.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={Users}
            title="No title assignments"
            description={
              canEdit
                ? "Use Add to record a Title in a Program for this staff member."
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
                  <TableHead variant="slds" size="md">Program</TableHead>
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
                        {programName(a.programId)}
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
                                aria-label={`Edit ${label} in ${programName(a.programId)}`}
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
              total={rows.length}
              label="Assignments"
            />
          </div>
        </>
      )}

      {canEdit && <StaffAssignmentDialog
        mode={mode}
        context={{
          kind: "profile",
          constituentId,
          staffOptions: eligibleStaffOptions(),
          staffName: (id) =>
            constituentLabel(id) ?? "Staff record unavailable",
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
          return el ?? addRef.current;
        }}
      />}
    </section>
  );
}
