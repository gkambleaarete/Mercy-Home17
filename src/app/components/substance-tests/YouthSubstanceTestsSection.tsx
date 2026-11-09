import { useId, useMemo, useRef, useState } from "react";
import { Eye, Pencil, Plus, ShieldAlert } from "@/app/lib/lucide-icons";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardAction,
  CardHeader,
  CardTitle,
} from "../ui/card";
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
import { EmptyState } from "../ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { getProgramById } from "../../data/mockProgramsData";
import { useProgramSubstanceTests } from "../../data/mockSubstanceTestData";
import { formatSampleDateTime } from "./substanceTestDateTime";
import { SubstanceTestViewDialog } from "./SubstanceTestViewDialog";
import { SubstanceTestEditDialog } from "./SubstanceTestEditDialog";
import { SubstanceTestCreateDialog } from "./SubstanceTestCreateDialog";
import {
  type YouthProgramOption,
  getActiveProgramsForYouth,
} from "./youthProgramOwnership";
import { restoreFocus } from "./focusReturn";

// Choose the owning Program when the youth has several active Programs.
// Nothing is preselected; Continue is refused until one is chosen.
function ProgramPickerDialog({
  options,
  onChoose,
  onClose,
  returnFocusTo,
}: {
  options: YouthProgramOption[];
  onChoose: (programId: number) => void;
  onClose: () => void;
  returnFocusTo: () => HTMLElement | null;
}) {
  const uid = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const chosen = useRef(false);
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        size="md"
        aria-describedby={`${uid}-description`}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          // Continuing hands focus to the editor; only a cancel returns it.
          if (!chosen.current) restoreFocus(returnFocusTo());
        }}
      >
        <DialogHeader>
          <DialogTitle>Select Program</DialogTitle>
          {/* id on the inner span: DialogDescription keeps Radix's own id. */}
          <DialogDescription>
            <span id={`${uid}-description`}>
              This youth is active in more than one Program.
              Choose the Program this Substance Test belongs to.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <label
            htmlFor={`${uid}-program`}
            className="slds-form-label block mb-1.5 text-[var(--slds-g-color-text-weak)]"
          >
            Program<span className="text-[#c23934]"> *</span>
          </label>
          <Select
            value={value}
            onValueChange={(v: string) => {
              setValue(v);
              setError("");
            }}
          >
            <SelectTrigger
              id={`${uid}-program`}
              surface="base"
              aria-required
              aria-invalid={!!error}
              aria-describedby={
                error ? `${uid}-error` : undefined
              }
            >
              <SelectValue placeholder="Select a Program..." />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem
                  key={o.programId}
                  value={String(o.programId)}
                >
                  {o.programName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && (
            <p
              id={`${uid}-error`}
              role="alert"
              className="slds-text-3 mt-1 text-[#c23934]"
            >
              {error}
            </p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              const option = options.find(
                (o) => String(o.programId) === value,
              );
              if (!option) return setError("Select a Program.");
              chosen.current = true;
              onChoose(option.programId);
            }}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Youth Profile → Health Overview → Testing (20066 AC14): this youth's
// Substance Tests from the shared store — created individually or through a
// Bulk Substance Test, in any Program, including tests whose Bulk link was
// removed. Only this constituent's tests are listed; each keeps its own
// Program. View is read-only; Edit is the same individual edit as the
// Program list (revision-tracked, so a later Bulk Modify sees it).

export function YouthSubstanceTestsSection({
  constituentId,
}: {
  constituentId: number;
}) {
  const all = useProgramSubstanceTests();
  const tests = useMemo(
    () =>
      all
        .filter((t) => t.constituentId === constituentId)
        .sort(
          (a, b) =>
            b.sampleDateTime.localeCompare(a.sampleDateTime) ||
            b.id - a.id,
        ),
    [all, constituentId],
  );
  const [viewId, setViewId] = useState<number | null>(null);
  const [edit, setEdit] = useState<{
    id: number;
    session: number;
  } | null>(null);
  const viewTest = tests.find((t) => t.id === viewId) ?? null;
  const editTest = edit
    ? tests.find((t) => t.id === edit.id)
    : undefined;
  const programName = (id: number) =>
    getProgramById(id)?.name ?? "";
  // The row icon that opened View / Edit; focus returns to it on close.
  const lastTrigger = useRef<HTMLElement | null>(null);
  const tableId = `youth-substance-tests-${constituentId}`;

  // ── Create (20065 AC3): owned by the youth's active Program ───────────
  const programs = getActiveProgramsForYouth(constituentId);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const [picking, setPicking] = useState(false);
  const [create, setCreate] = useState<{
    programId: number;
    session: number;
  } | null>(null);
  const startCreate = (programId: number) =>
    setCreate((prev) => ({
      programId,
      session: (prev?.session ?? 0) + 1,
    }));
  function handleAdd() {
    if (programs.length === 1)
      startCreate(programs[0].programId);
    else if (programs.length > 1) setPicking(true);
  }

  return (
    <Card variant="section">
      <CardHeader size="sm" separated>
        <CardTitle size="sm">
          Substance Tests for this youth
        </CardTitle>
        <CardAction>
          <Button
            ref={addButtonRef}
            type="button"
            size="sm"
            onClick={handleAdd}
            disabled={programs.length === 0}
            aria-describedby={`${tableId}-ownership`}
          >
            <Plus /> Add
          </Button>
        </CardAction>
        <p
          id={`${tableId}-ownership`}
          role="status"
          className="slds-text-3 text-[var(--slds-g-color-text-weak)]"
        >
          {programs.length === 0
            ? "No active Program is associated with this youth. A Program association is required before creating a Substance Test."
            : programs.length === 1
              ? `New Substance Tests are recorded under ${programs[0].programName}.`
              : "This youth is active in more than one Program; you will choose the Program when adding a Substance Test."}
        </p>
      </CardHeader>
      <div className="overflow-x-auto">
        {/* tabIndex -1: a focus fallback for closed dialogs, not a tab stop. */}
        <Table
          id={tableId}
          tabIndex={-1}
          aria-label="Substance Tests for this youth"
        >
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead variant="slds">Date / Time</TableHead>
              <TableHead variant="slds">Program</TableHead>
              <TableHead variant="slds">Reason</TableHead>
              <TableHead variant="slds">New Use</TableHead>
              <TableHead variant="slds">Results</TableHead>
              <TableHead variant="slds">Bulk</TableHead>
              <TableHead variant="slds">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.length === 0 ? (
              <TableRow hoverable={false}>
                <TableCell colSpan={7}>
                  <EmptyState
                    icon={ShieldAlert}
                    title="No Substance Tests for this youth"
                    description="Tests recorded for this youth in a Program, individually or through a Bulk Substance Test, appear here."
                  />
                </TableCell>
              </TableRow>
            ) : (
              tests.map((t) => {
                const when = formatSampleDateTime(
                  t.sampleDateTime,
                );
                const lines = t.testDetails.map((d) => {
                  const label = d.testPanel || d.testType;
                  return d.testResults.length
                    ? `${label}: ${d.testResults
                        .map((r) =>
                          [
                            r.substance,
                            r.result,
                            r.level,
                            r.units,
                          ]
                            .filter(Boolean)
                            .join(" "),
                        )
                        .join(", ")}`
                    : `${label}: Not entered`;
                });
                return (
                  <TableRow key={t.id}>
                    <TableCell>{when || "—"}</TableCell>
                    <TableCell>
                      {programName(t.programId) || "—"}
                    </TableCell>
                    <TableCell>{t.reason || "—"}</TableCell>
                    <TableCell>{t.newUse || "—"}</TableCell>
                    <TableCell className="whitespace-normal">
                      {lines.length ? (
                        <ul>
                          {lines.map((l, i) => (
                            <li key={i}>{l}</li>
                          ))}
                        </ul>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {t.bulkTestId !== null ? (
                        <Badge variant="neutral">Bulk</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost-primary"
                          size="icon-xs"
                          onClick={(e) => {
                            lastTrigger.current =
                              e.currentTarget;
                            setViewId(t.id);
                          }}
                          aria-label={`View Substance Test on ${when || "unknown date"}`}
                          title="View"
                        >
                          <Eye />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost-primary"
                          size="icon-xs"
                          onClick={(e) => {
                            lastTrigger.current =
                              e.currentTarget;
                            setEdit((prev) => ({
                              id: t.id,
                              session: (prev?.session ?? 0) + 1,
                            }));
                          }}
                          aria-label={`Edit Substance Test on ${when || "unknown date"}`}
                          title="Edit"
                        >
                          <Pencil />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <SubstanceTestViewDialog
        test={viewTest}
        programName={
          viewTest ? programName(viewTest.programId) : ""
        }
        onClose={() => setViewId(null)}
        returnFocusTo={() => lastTrigger.current}
        fallbackFocusId={tableId}
      />
      {picking && (
        <ProgramPickerDialog
          options={programs}
          onChoose={(programId) => {
            setPicking(false);
            startCreate(programId);
          }}
          onClose={() => setPicking(false)}
          returnFocusTo={() => addButtonRef.current}
        />
      )}
      {create && (
        <SubstanceTestCreateDialog
          key={create.session}
          constituentId={constituentId}
          programId={create.programId}
          onClose={() => setCreate(null)}
          returnFocusTo={() => addButtonRef.current}
          fallbackFocusId={tableId}
        />
      )}
      {edit && editTest && (
        <SubstanceTestEditDialog
          key={edit.session}
          test={editTest}
          onClose={() => setEdit(null)}
          returnFocusTo={() => lastTrigger.current}
          fallbackFocusId={tableId}
        />
      )}
    </Card>
  );
}