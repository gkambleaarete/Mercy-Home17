import {
  useState,
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Link,
  useParams,
  useNavigate,
  useLocation,
} from "react-router";
import {
  ArrowLeft,
  LayoutGrid,
  Pencil,
  Trash2,
  X,
  ClipboardList,
  Pill,
  Ticket,
  ShieldAlert,
  RefreshCw,
  Users,
  FileText,
  FileWarning,
  AlertTriangle,
  AlertCircle,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogBody,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import { Card, CardContent } from "../ui/card";
import { DateInput } from "../ui/date-input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { EmptyState } from "../ui/empty-state";
import { VisuallyHidden } from "../ui/visually-hidden";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import { useTodayIso } from "../../lib/useTodayIso";
import { toast } from "sonner";
import {
  type ProgramRelation,
  deleteProgram,
  checkProgramRelatedRecords,
} from "../../data/programDeletion";
import {
  type ProgramRecord,
  type CapacitySnapshot,
  CAMPUS_OPTIONS,
  PROGRAM_TYPE_OPTIONS,
  AGE_RANGE_OPTIONS,
  CURRENT_USER_NAME,
  CURRENT_USER_IS_SYSTEM_ADMIN,
  YOUTH_CARE_WORKERS_LABEL,
  getPrograms,
  getProgramDataStatus,
  addCapacitySnapshot,
  getCapacitySnapshots,
  nextCapacitySnapshotId,
  todayIso,
  isValidMdy,
  formatCapacity,
  resolveCapacityForDate,
  getUpcomingSnapshot,
  buildCapacityHistory,
  capacityStatusBadgeVariant,
  programStatusBadgeVariant,
  deriveProgramStatus,
} from "../../data/mockProgramsData";
import {
  PROGRAM_STAFF_LEGACY_TITLES,
  PROGRAM_STAFF_TITLES,
  getProgramStaffAssignments,
  programStaffTitleLabel,
  programStaffTitleDisplay,
  canManageProgramStaffAssignments,
  saveProgramWithStaffChanges,
  useProgramStaffAssignments,
  type ProgramStaffAssignment,
  type ProgramStaffChange,
  type ProgramStaffSaveResult,
  type ProgramStaffTitleId,
} from "../../data/programStaffAssignmentStore";
import { useUnsavedChangesGuard } from "../../lib/useUnsavedChangesGuard";
import {
  MULTI_TITLE,
  PROGRAM_FORM_SINGLE_TITLES,
  applyLegacyFields,
  currentLegacyCombinedHolders,
  effectiveStaffSelection,
  initialStaffSelection,
  planStaffChanges,
  staffEditConflicts,
  type StaffEdits,
  type PendingStaffChange,
  type StaffEntry,
  type StaffSelection,
} from "../../data/programStaffSelection";
import { programMedReviewsUrl } from "../../lib/programMedReviews";
import { ProgramStaffTitleAssignmentsSection } from "../admissions/ProgramStaffTitleAssignmentsSection";
import { mhbgCoordinatorOptions } from "../../data/ffMentorApplicationStore";
import {
  ProgramStaffChangeDialog,
  type StaffChangeDateRow,
} from "./ProgramStaffChangeDialog";
import { Alert, AlertDescription } from "../ui/alert";
import { ShiftHandoverChecklistsSection } from "../shift-handover/ShiftHandoverChecklistsSection";
import { ShiftRolesSection } from "../program-shift-roles/ShiftRolesSection";
import { MasonryGrid, MasonryItem } from "../ui/masonry-grid";
import { constituentLabel } from "../../data/transitionSummaryDetailsSources";
import {
  getActiveYouthForProgram,
  getExpiringDocumentsForProgram,
  getUnfinalizedIncidentsForProgram,
  getRecentIncidentsForProgram,
  getUnfinalizedConnectionsForProgram,
  getUnfinalizedItpsForProgram,
  getAssignedMedErrorsForProgram,
  getMissingMedDocumentationForProgram,
  getYouthNames,
} from "../../data/mockYouthProgramData";

// ─── Shared style helpers (mirrors Programs.tsx) ───────────────────────────

const sldsBorder =
  "1px solid var(--slds-g-color-border-base-1)";
const sldsWeak = "var(--slds-g-color-text-weak)";
const sldsDefault = "var(--slds-g-color-text-default)";
const sldsBase = "var(--slds-g-color-background-base)";
const sldsAlt = "var(--slds-g-color-background-alt)";

const inputStyle: React.CSSProperties = {
  border: sldsBorder,
  backgroundColor: sldsBase,
  color: sldsDefault,
};

const inputErrorStyle: React.CSSProperties = {
  border: "1px solid #c23934",
  backgroundColor: sldsBase,
  color: sldsDefault,
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: "#145F33",
};

function primaryButtonHover(
  e: React.MouseEvent<HTMLButtonElement>,
) {
  e.currentTarget.style.backgroundColor = "#0e4524";
}
function primaryButtonLeave(
  e: React.MouseEvent<HTMLButtonElement>,
) {
  e.currentTarget.style.backgroundColor = "#145F33";
}

const outlineButtonStyle: React.CSSProperties = {
  border: sldsBorder,
  backgroundColor: sldsBase,
  color: sldsDefault,
};

// ─── Small shared components (mirrors Programs.tsx) ────────────────────────

function SectionCard({
  title,
  header,
  headerAction,
  children,
}: {
  title?: string;
  /** Replaces the title row — e.g. a separated TabsList for a tabbed card. */
  header?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="overflow-hidden"
      style={{
        border: sldsBorder,
        borderRadius: "var(--slds-c-card-radius-border)",
        backgroundColor: sldsBase,
      }}
    >
      {header ?? (
        <div
          className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
          style={{
            borderBottom: sldsBorder,
            backgroundColor: sldsAlt,
          }}
        >
          <h3
            className="text-[13px] font-semibold min-w-0"
            style={{ color: sldsDefault }}
          >
            {title}
          </h3>
          {headerAction}
        </div>
      )}
      <div className="px-4 py-4 space-y-4">{children}</div>
    </div>
  );
}

// A titled group inside a card (no border of its own) — keeps sections such
// as Capacity inside the tabbed Program card without nesting cards.
function Subsection({
  title,
  headerAction,
  children,
}: {
  title: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="pt-4 space-y-4"
      style={{ borderTop: sldsBorder }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3
          className="text-[13px] font-semibold"
          style={{ color: sldsDefault }}
        >
          {title}
        </h3>
        {headerAction}
      </div>
      {children}
    </div>
  );
}

// Columns follow the row's own width (container queries), not the viewport,
// so the same fields read as 2 columns in the narrow Program card and 3 at
// full width in Edit/Create.
function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="@container">
      <div className="grid grid-cols-1 @3xs:grid-cols-2 @2xl:grid-cols-3 gap-x-6 gap-y-4">
        {children}
      </div>
    </div>
  );
}

function FieldLabel({
  children,
  required,
  htmlFor,
}: {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="slds-form-label block"
      style={{ color: sldsWeak }}
    >
      {children}
      {required && <span style={{ color: "#c23934" }}> *</span>}
    </label>
  );
}

// Read-only record value — plain text, never boxed like an input, so it
// can't be mistaken for an editable field (same treatment as the Field
// helper on the other record pages, e.g. TutorApplicantRecord).
function ReadText({ value }: { value: string }) {
  return (
    <p className="slds-text-4" style={{ color: sldsDefault }}>
      {value || "—"}
    </p>
  );
}

/** Stable id of a field's error message (`<fieldId>-error`). */
const errorId = (fieldId: string) => `${fieldId}-error`;

/** aria-invalid + aria-describedby for a field with an optional error;
 *  no association is left behind once the error is cleared. */
function errorAria(fieldId: string, message?: string) {
  return {
    "aria-invalid": !!message,
    "aria-describedby": message ? errorId(fieldId) : undefined,
  };
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
      id={errorId(id)}
      className="slds-text-3 mt-0.5"
      style={{ color: "#c23934" }}
    >
      {message}
    </p>
  );
}

// ─── Detail Form (Staff tab + Program Details tab, 17673) ─────────────────
// The Program Record page's only form, for View, Edit, and Create. Staff is
// the default tab. Capacity is deliberately not part of this form: the page
// passes its read-only Capacity section in via `capacitySlot`, and it is
// changed only through Update Capacity, which records a dated Capacity
// Snapshot.

interface DetailFormHandle {
  submit: () => void;
}

interface DetailFormProps {
  mode: "view" | "edit" | "create";
  initial: ProgramRecord | null;
  /** Saves the Program with its staff changes as one operation. */
  onSave: (
    record: ProgramRecord,
    changes: ProgramStaffChange[],
  ) => ProgramStaffSaveResult;
  capacitySlot?: React.ReactNode;
  /** Whether the MHBG Staff Title Assignments section offers Add / Edit
   *  (the page's existing Program edit gate). */
  canEditAssignments?: boolean;
  /** View only: extra Staff-tab sections (Active Youth, Shift Roles —
   *  US 20221), rendered below the staff fields. */
  staffTabExtra?: React.ReactNode;
}

type FormTab = "staff" | "details";

const DetailForm = forwardRef<
  DetailFormHandle,
  DetailFormProps
>(function DetailForm(
  { mode, initial, onSave, capacitySlot, canEditAssignments = false, staffTabExtra },
  ref,
) {
  const isReadOnly = mode === "view";
  // Create opens on Program Details (the Staff tab has nothing to edit until
  // the Program exists, other than draft assignments); Edit/View keep Staff.
  const [tab, setTab] = useState<FormTab>(
    mode === "create" ? "details" : "staff",
  );
  // Create mode: title assignments held as a draft until the Program's own
  // Save writes them (with the new Program ID) in one operation.
  const [draftRows, setDraftRows] = useState<
    ProgramStaffAssignment[]
  >([]);
  // Set once the Program saved: stops the unsaved-changes guard and any
  // second Save from creating a duplicate while the page navigates away.
  const [committed, setCommitted] = useState(false);
  const submitting = useRef(false);

  const blank = (): ProgramRecord => ({
    id: Date.now(),
    campus: "",
    name: "",
    programType: "",
    activeConstituents: 0,
    ageRange: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "Inactive",
    programManager: "",
    therapist: "",
    supervisor: "",
    ecrCoordinator: "",
    dayCoordinator: "",
    youthCareWorkers: [],
  });

  const [form, setForm] = useState<ProgramRecord>(
    initial ?? blank(),
  );
  // Bumped on each failed Save so the error summary is announced again.
  const [saveAttempt, setSaveAttempt] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>(
    {},
  );
  // DateInput edits MM/DD/YYYY text; the record stores ISO.
  const [startMdy, setStartMdy] = useState("");
  const [endMdy, setEndMdy] = useState("");

  useEffect(() => {
    setForm(initial ?? blank());
    setStartMdy(
      initial?.startDate ? isoToMdy(initial.startDate) : "",
    );
    setEndMdy(
      initial?.endDate ? isoToMdy(initial.endDate) : "",
    );
    setErrors({});
    setTab(mode === "create" ? "details" : "staff");
    setDraftRows([]);
    setCommitted(false);
    submitting.current = false;
    setPending(null);
    setFormSaveError("");
    resetStaff();
    // Keyed on the record's id, not object identity: the page re-derives
    // `initial` when the date rolls over (Status), which must not reset the
    // active tab or discard in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id, mode]);

  const set = (field: keyof ProgramRecord, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  // ─── Staff selection (20130) ─────────────────────────────────────────
  // Current staff is derived from the shared assignment records; new picks
  // are MHBG Staff constituents (by id). Older name-only values stay
  // readable until replaced or removed.
  const todayIsoStr = useTodayIso();
  const assignmentsRead = useProgramStaffAssignments();
  const staffOptions = mhbgCoordinatorOptions();
  const staffName = (id: number) =>
    constituentLabel(id) ?? "Staff record unavailable";
  const readCurrent = () => {
    const r = getProgramStaffAssignments();
    return r.status === "ok" ? r.assignments : [];
  };
  // Titles the user actually edited. Untouched titles always show (and
  // keep) the latest shared assignments, so a separate save — e.g. through
  // the Title Assignments section or a Constituent Profile — is never undone
  // by this form's later save.
  const [edits, setEdits] = useState<StaffEdits>({});
  const liveStaff = initialStaffSelection(
    initial,
    assignmentsRead.status === "ok" ? assignmentsRead.assignments : [],
    todayIsoStr,
  );
  const staff = effectiveStaffSelection(liveStaff, edits);
  const resetStaff = () => setEdits({});
  const setEntries = (
    title: ProgramStaffTitleId,
    entries: StaffEntry[],
  ) =>
    setEdits((prev) => ({
      ...prev,
      [title]: {
        baseline: prev[title]?.baseline ?? liveStaff.selection[title],
        entries,
      },
    }));
  const entryLabel = (e: StaffEntry) =>
    e.kind === "id" ? staffName(e.id) : e.name;
  const entryKey = (e: StaffEntry) =>
    e.kind === "id" ? `id:${e.id}` : `legacy:${e.name}`;
  const NONE = "__none__";

  // Pending save: the dated changes waiting for explicit dates.
  const [pending, setPending] = useState<{
    record: ProgramRecord;
    changes: PendingStaffChange[];
  } | null>(null);
  const [dialogErrors, setDialogErrors] = useState<
    Record<string, string>
  >({});
  const [dialogSaveError, setDialogSaveError] = useState("");
  const [formSaveError, setFormSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const changeKey = (c: PendingStaffChange, i: number) =>
    `${i}-${c.kind === "add" ? `a${c.constituentId}-${c.titleId}` : `e${c.assignment.id}`}`;
  const dateRows: StaffChangeDateRow[] = (
    pending?.changes ?? []
  ).map((c, i) => ({
    key: changeKey(c, i),
    kind: c.kind === "add" ? "start" : "end",
    description:
      c.kind === "add"
        ? `${staffName(c.constituentId)}, ${programStaffTitleDisplay(c.titleId)} (added)`
        : `${staffName(c.assignment.constituentId)}, ${programStaffTitleDisplay(c.assignment.titleId)} (ending)`,
  }));

  function commitSave(
    record: ProgramRecord,
    changes: PendingStaffChange[],
    dates: Record<string, string>,
    /** Already-complete changes (a new Program's draft assignments). */
    extra: ProgramStaffChange[] = [],
  ) {
    if (submitting.current) return;
    const resolved: ProgramStaffChange[] = changes.map((c, i) => {
      const date = dates[changeKey(c, i)] ?? "";
      return c.kind === "add"
        ? {
            kind: "add",
            constituentId: c.constituentId,
            titleId: c.titleId,
            startDate: date,
          }
        : {
            kind: "end",
            assignmentId: c.assignment.id,
            endDate: date,
            expected: c.assignment,
          };
    });
    // The date dialog may have been open for a while: re-check that the
    // titles being changed haven't changed elsewhere since they were edited.
    if (changes.length) {
      const conflicted = staffEditConflicts(
        mode === "create" ? null : initial,
        edits,
        readCurrent(),
        todayIso(),
      );
      if (conflicted.length) {
        setDialogSaveError(
          `Not saved: ${conflicted.map((t) => programStaffTitleDisplay(t)).join(", ")} ${conflicted.length > 1 ? "were" : "was"} changed elsewhere while this dialog was open. Close it to review the latest assignments.`,
        );
        return;
      }
    }
    submitting.current = true;
    setSaving(true);
    const result = onSave(record, [...resolved, ...extra]);
    setSaving(false);
    if (result.ok) {
      // Create stays locked (no second Save) until the page leaves.
      if (mode === "create") setCommitted(true);
      else submitting.current = false;
      setPending(null);
      // The saved assignments are now the baseline for every title.
      setEdits({});
      return;
    }
    // Nothing was saved; the entered values and dates stay as typed, and
    // Save can be retried (the Program ID is only assigned by a save that
    // succeeds, so a retry cannot duplicate it).
    submitting.current = false;
    if (extra.length && result.changeErrors) {
      const lines = Object.entries(result.changeErrors).map(
        ([i, msg]) => {
          const row = draftRows[Number(i) - resolved.length];
          return row
            ? `${staffName(row.constituentId)}, ${programStaffTitleDisplay(row.titleId)}: ${msg}`
            : msg;
        },
      );
      setFormSaveError(
        `Program was not saved. ${lines.join(" ")}`,
      );
      setTab("staff");
    } else if (pending) {
      setDialogSaveError(result.error);
      setDialogErrors(
        Object.fromEntries(
          Object.entries(result.changeErrors ?? {}).map(
            ([i, msg]) => [changeKey(changes[Number(i)], Number(i)), msg],
          ),
        ),
      );
    } else setFormSaveError(result.error);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Program Name is required.";
    if (!form.programType)
      e.programType = "Program Type is required.";
    if (!form.campus) e.campus = "Campus is required.";
    if (!form.ageRange) e.ageRange = "Age Range is required.";
    if (!startMdy.trim())
      e.startDate = "Start Date is required.";
    else if (!isValidMdy(startMdy))
      e.startDate = "Enter a valid date (MM/DD/YYYY).";
    if (endMdy.trim()) {
      if (!isValidMdy(endMdy))
        e.endDate = "Enter a valid date (MM/DD/YYYY).";
      else if (
        isValidMdy(startMdy) &&
        mdyToIso(endMdy) < mdyToIso(startMdy)
      )
        e.endDate = "End Date cannot be before Start Date.";
    }
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      setSaveAttempt((n) => n + 1);
      // Every required field lives on Program Details — surface it and
      // focus the first invalid one (top to bottom).
      setTab("details");
      const first = (
        [
          ["name", "pf-name"],
          ["campus", "pf-campus"],
          ["programType", "pf-type"],
          ["ageRange", "pf-age"],
          ["startDate", "pf-startDate"],
          ["endDate", "pf-endDate"],
        ] as const
      ).find(([k]) => e[k]);
      if (first)
        setTimeout(
          () => document.getElementById(first[1])?.focus(),
          0,
        );
      return;
    }
    const startDate = mdyToIso(startMdy);
    const endDate = endMdy.trim() ? mdyToIso(endMdy) : "";
    // An edited title whose holders changed elsewhere since it was touched
    // would silently override newer assignments: stop and say so.
    const conflicted = staffEditConflicts(
      mode === "create" ? null : initial,
      edits,
      readCurrent(),
      todayIso(),
    );
    if (conflicted.length) {
      setEdits((prev) => {
        const next = { ...prev };
        for (const t of conflicted) delete next[t];
        return next;
      });
      setFormSaveError(
        `Not saved: ${conflicted.map((t) => programStaffTitleDisplay(t)).join(", ")} ${conflicted.length > 1 ? "were" : "was"} changed elsewhere after you edited ${conflicted.length > 1 ? "them" : "it"}. The latest assignments are shown — review and choose again.`,
      );
      setTab("staff");
      return;
    }
    const record = applyLegacyFields(
      {
        ...form,
        startDate,
        endDate,
        status: deriveProgramStatus(
          startDate,
          endDate,
          todayIso(),
        ),
      },
      staff.selection,
      staff.legacyShown,
    );
    setFormSaveError("");
    setDialogSaveError("");
    setDialogErrors({});
    // Changes are planned against the latest saved assignments.
    const changes = planStaffChanges(
      mode === "create" ? null : (initial?.id ?? null),
      staff.selection,
      staff.locked,
      readCurrent(),
      todayIso(),
      Object.keys(edits) as ProgramStaffTitleId[],
    );
    // Draft assignments of a new Program already carry their own dates.
    const draftChanges: ProgramStaffChange[] =
      mode === "create"
        ? draftRows.map((r) => ({
            kind: "add",
            constituentId: r.constituentId,
            titleId: r.titleId,
            startDate: r.startDate,
            endDate: r.endDate,
            notes: r.notes,
            ongoing: false,
          }))
        : [];
    // Unrelated edits create no assignment records, and need no dates.
    if (!changes.length) commitSave(record, [], {}, draftChanges);
    else setPending({ record, changes });
  }

  useImperativeHandle(ref, () => ({
    submit: () => {
      if (committed || submitting.current) return;
      handleSave();
    },
  }));

  // Create only: leaving with anything entered asks once (Cancel, header,
  // Back). Cleared as soon as the Program is saved.
  const createDirty =
    mode === "create" &&
    !committed &&
    (!!(
      form.name ||
      form.campus ||
      form.programType ||
      form.ageRange ||
      form.description ||
      startMdy ||
      endMdy
    ) ||
      draftRows.length > 0);
  const leaveGuard = useUnsavedChangesGuard(
    createDirty,
    () => {},
    "this new Program",
  );

  function optionSelect(
    field: "programType" | "campus" | "ageRange",
    id: string,
    options: string[],
  ) {
    return (
      <div>
        <Select
          value={form[field]}
          onValueChange={(value) => {
            set(field, value);
            setErrors((p) => ({ ...p, [field]: "" }));
          }}
        >
          <SelectTrigger
            surface="base"
            id={id}
            className="w-full h-9 slds-text-4"
            style={errors[field] ? inputErrorStyle : inputStyle}
            {...errorAria(id, errors[field])}
          >
            <SelectValue placeholder="Please Select" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError id={id} message={errors[field]} />
      </div>
    );
  }

  function staffSelect(
    title: ProgramStaffTitleId,
    label: string,
  ) {
    const entries = staff.selection[title];
    const locked = staff.locked.includes(title);
    const value = entries[0] ? entryKey(entries[0]) : "";
    return (
      <div key={title} className="space-y-1.5">
        <FieldLabel htmlFor={`sf-${title}`}>{label}</FieldLabel>

        {isReadOnly || locked ? (
          <>
            <ReadText
              value={entries.map(entryLabel).join(", ")}
            />
            {locked && !isReadOnly && (
              <p className="slds-text-3" style={{ color: sldsWeak }}>
                Several current holders. Change them in each staff
                member's Constituent Profile.
              </p>
            )}
          </>
        ) : (
          <Select
            value={value}
            onValueChange={(v) =>
              setEntries(
                title,
                v === NONE
                  ? []
                  : v.startsWith("legacy:")
                    ? [{ kind: "legacy", name: v.slice(7) }]
                    : [{ kind: "id", id: Number(v.slice(3)) }],
              )
            }
          >
            <SelectTrigger
              surface="base"
              id={`sf-${title}`}
              className="w-full h-9 slds-text-4"
              style={inputStyle}
            >
              <SelectValue placeholder="Please Select" />
            </SelectTrigger>

            <SelectContent
              position="popper"
              sideOffset={4}
              className="max-h-[240px] overflow-y-auto"
            >
              {entries[0]?.kind === "legacy" && (
                <SelectItem value={entryKey(entries[0])}>
                  {entryLabel(entries[0])}
                </SelectItem>
              )}
              {staffOptions.map((o) => (
                <SelectItem key={o.id} value={`id:${o.id}`}>
                  {o.label}
                </SelectItem>
              ))}
              {entries.length > 0 && (
                <SelectItem value={NONE}>None</SelectItem>
              )}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  }

  const liveStatus = isReadOnly
    ? (initial?.status ?? form.status)
    : deriveProgramStatus(
        isValidMdy(startMdy) ? mdyToIso(startMdy) : "",
        isValidMdy(endMdy) ? mdyToIso(endMdy) : "",
        todayIso(),
      );

  const ycwEntries = staff.selection[MULTI_TITLE];
  // Read-only, derived live from the shared records (so a refresh updates it
  // without touching the editable fields above).
  const legacyHolders = currentLegacyCombinedHolders(
    initial?.id ?? null,
    assignmentsRead.status === "ok" ? assignmentsRead.assignments : [],
    todayIsoStr,
  );
  const availableYCW = staffOptions.filter(
    (o) =>
      !ycwEntries.some((e) => e.kind === "id" && e.id === o.id),
  );

  const programNameField = (
    <div className="space-y-1.5">
      <FieldLabel htmlFor="pf-name" required>
        PROGRAM NAME
      </FieldLabel>
      <div>
        <Input
          id="pf-name"
          size="md"
          surface="base"
          value={form.name}
          onChange={(e) => {
            set("name", e.target.value);
            setErrors((p) => ({ ...p, name: "" }));
          }}
          placeholder="Enter program name"
          {...errorAria("pf-name", errors.name)}
        />
        <FieldError id="pf-name" message={errors.name} />
      </div>
    </div>
  );

  const errorMessages = Object.values(errors).filter(Boolean);

  return (
    <>
    <Tabs
      value={tab}
      onValueChange={(v) => setTab(v as FormTab)}
    >
      {/* Failed Save → announced once per attempt (key remounts it). */}
      {saveAttempt > 0 && errorMessages.length > 0 && (
        <VisuallyHidden key={saveAttempt} role="alert">
          {`Program was not saved. ${errorMessages.join(" ")}`}
        </VisuallyHidden>
      )}
      {/* One card; its header is the tab bar (separated underline tabs —
          the app's tabbed-card pattern). */}
      <SectionCard
        header={
          <TabsList variant="underline" separated>
            <TabsTrigger
              value="staff"
              variant="underline"
              size="sm"
            >
              Staff
            </TabsTrigger>
            <TabsTrigger
              value="details"
              variant="underline"
              size="sm"
            >
              Program Details
            </TabsTrigger>
          </TabsList>
        }
      >
        {/* Staff (default tab) — the six 17673 role lookup fields */}
        {formSaveError && (
          <Alert variant="error" role="alert" className="mb-4">
            <AlertCircle aria-hidden="true" />
            <AlertDescription>{formSaveError}</AlertDescription>
          </Alert>
        )}
        <TabsContent value="staff" className="space-y-4">
          {assignmentsRead.status === "error" && (
            <Alert variant="error" role="alert">
              <AlertCircle aria-hidden="true" />
              <AlertDescription>
                Saved staff assignments can't be read, so current
                staff may be incomplete and staff can't be changed
                right now.
              </AlertDescription>
            </Alert>
          )}
          {/* View only: the current holders of each title, derived from the
              MHBG Staff Title Assignments (dates decide who is shown). */}
          {isReadOnly && (
            <>
              <FieldRow>
                {PROGRAM_FORM_SINGLE_TITLES.map((t) =>
                  staffSelect(t.id, t.label.toUpperCase()),
                )}
              </FieldRow>

              <div className="space-y-1.5">
                <FieldLabel>
                  {YOUTH_CARE_WORKERS_LABEL.toUpperCase()}
                </FieldLabel>
                {ycwEntries.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {ycwEntries.map((e) => (
                      <Badge key={entryKey(e)} variant="neutral">
                        {entryLabel(e)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <ReadText value="" />
                )}
              </div>
            </>
          )}

          {legacyHolders.length > 0 && (
            <div className="space-y-1.5" data-testid="legacy-combined-staff">
              <FieldLabel>
                {PROGRAM_STAFF_LEGACY_TITLES[0].label.toUpperCase()}
              </FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                {legacyHolders.map((id) => (
                  <Badge key={id} variant="neutral">
                    {staffName(id)}
                  </Badge>
                ))}
              </div>
              <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                Recorded under the earlier combined title. Shown for
                reference — not changed by this form.
              </p>
            </div>
          )}


          {/* Title assignments of this saved Program (Edit only): its own Add / Edit,
              saved independently of the Program Details Save. */}
          {mode === "edit" && initial && (
            <ProgramStaffTitleAssignmentsSection
              programId={initial.id}
              canEdit={canEditAssignments}
            />
          )}
          {/* Create: the same section on a draft; nothing is stored until
              the Program's Save. */}
          {mode === "create" && (
            <ProgramStaffTitleAssignmentsSection
              programId={0}
              canEdit={canEditAssignments}
              draft={{
                programName: form.name,
                rows: draftRows,
                onChange: setDraftRows,
              }}
            />
          )}
          {staffTabExtra}
        </TabsContent>

        {/* Program Details — Campus, Program Type, Age Range, Description,
          Start/End Date, Status, Capacity (+ Update Capacity) */}
        <TabsContent value="details" className="space-y-4">
          {/* Program Name is the record header in View; Create/Edit need
              an input for it. */}
          {!isReadOnly && (
            <FieldRow>{programNameField}</FieldRow>
          )}
          <FieldRow>
            <div className="space-y-1.5">
              <FieldLabel
                htmlFor="pf-campus"
                required={!isReadOnly}
              >
                CAMPUS
              </FieldLabel>
              {isReadOnly ? (
                <ReadText value={form.campus} />
              ) : (
                optionSelect(
                  "campus",
                  "pf-campus",
                  CAMPUS_OPTIONS,
                )
              )}
            </div>

            <div className="space-y-1.5">
              <FieldLabel
                htmlFor="pf-type"
                required={!isReadOnly}
              >
                PROGRAM TYPE
              </FieldLabel>
              {isReadOnly ? (
                <ReadText value={form.programType} />
              ) : (
                optionSelect(
                  "programType",
                  "pf-type",
                  PROGRAM_TYPE_OPTIONS,
                )
              )}
            </div>

            <div className="space-y-1.5">
              <FieldLabel
                htmlFor="pf-age"
                required={!isReadOnly}
              >
                AGE RANGE
              </FieldLabel>
              {isReadOnly ? (
                <ReadText value={form.ageRange} />
              ) : (
                optionSelect(
                  "ageRange",
                  "pf-age",
                  AGE_RANGE_OPTIONS,
                )
              )}
            </div>

            <div className="space-y-1.5">
              <FieldLabel
                htmlFor="pf-startDate"
                required={!isReadOnly}
              >
                START DATE
              </FieldLabel>
              {isReadOnly ? (
                <ReadText
                  value={
                    form.startDate
                      ? isoToMdy(form.startDate)
                      : ""
                  }
                />
              ) : (
                <div>
                  <DateInput
                    id="pf-startDate"
                    value={startMdy}
                    onChange={(v) => {
                      setStartMdy(v);
                      setErrors((p) => ({
                        ...p,
                        startDate: "",
                      }));
                    }}
                    required
                    className={
                      errors.startDate
                        ? "border-[#c23934]"
                        : undefined
                    }
                    {...errorAria(
                      "pf-startDate",
                      errors.startDate,
                    )}
                  />
                  <FieldError
                    id="pf-startDate"
                    message={errors.startDate}
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="pf-endDate">
                END DATE
              </FieldLabel>
              {isReadOnly ? (
                <ReadText
                  value={
                    form.endDate ? isoToMdy(form.endDate) : ""
                  }
                />
              ) : (
                <div>
                  <DateInput
                    id="pf-endDate"
                    value={endMdy}
                    onChange={(v) => {
                      setEndMdy(v);
                      setErrors((p) => ({ ...p, endDate: "" }));
                    }}
                    className={
                      errors.endDate
                        ? "border-[#c23934]"
                        : undefined
                    }
                    {...errorAria("pf-endDate", errors.endDate)}
                  />
                  <FieldError
                    id="pf-endDate"
                    message={errors.endDate}
                  />
                </div>
              )}
            </div>

            {/* Status — system-derived from Start/End Date (17673); never
                editable. In Edit/Create it previews the dates entered. */}
            <div className="space-y-1.5">
              <FieldLabel>STATUS</FieldLabel>
              <div>
                <Badge
                  variant={programStatusBadgeVariant(
                    liveStatus,
                  )}
                >
                  {liveStatus}
                </Badge>
              </div>
            </div>
          </FieldRow>

          <div className="space-y-1.5">
            <FieldLabel htmlFor="pf-desc">
              DESCRIPTION
            </FieldLabel>
            {isReadOnly ? (
              <p
                className="slds-text-4 whitespace-pre-wrap break-words"
                style={{ color: sldsDefault }}
              >
                {form.description || "—"}
              </p>
            ) : (
              <Textarea
                surface="base"
                id="pf-desc"
                value={form.description}
                onChange={(e) =>
                  set("description", e.target.value)
                }
                placeholder="Enter program description"
                className="slds-text-4 rounded min-h-[72px]"
                style={inputStyle}
              />
            )}
          </div>

          {/* Capacity — read-only here in every mode; owned by the page so
            the Update Capacity / Capacity Snapshot flow stays in one place. */}
          {capacitySlot}
        </TabsContent>
      </SectionCard>
    </Tabs>
    {leaveGuard}
    <ProgramStaffChangeDialog
      open={pending !== null}
      rows={dateRows}
      rowErrors={dialogErrors}
      saveError={dialogSaveError}
      saving={saving}
      onSave={(dates) =>
        pending && commitSave(pending.record, pending.changes, dates)
      }
      onCancel={() => {
        setPending(null);
        setDialogSaveError("");
        setDialogErrors({});
      }}
    />
    </>
  );
});

// ─── Compliance & Activity Snapshot helpers (19991) ────────────────────────

// Loads a Program-scoped query and re-runs it on manual Refresh (no polling),
// stamping when the data was last read. Each component owns its own instance,
// so Refresh reloads only that component. The data is keyed by `scopeKey`
// (the Program ID): when navigating between Program records (which reuses
// this page) the new Program's data is loaded during the same render, so a
// previous Program's rows are never shown, even for one frame.
function useSnapshot<T>(load: () => T, scopeKey: number) {
  const [state, setState] = useState(() => ({
    scopeKey,
    data: load(),
    updatedAt: new Date(),
  }));
  const refresh = () =>
    setState({ scopeKey, data: load(), updatedAt: new Date() });
  if (state.scopeKey !== scopeKey) {
    const next = {
      scopeKey,
      data: load(),
      updatedAt: new Date(),
    };
    setState(next);
    return {
      data: next.data,
      updatedAt: next.updatedAt,
      refresh,
    };
  }
  return {
    data: state.data,
    updatedAt: state.updatedAt,
    refresh,
  };
}

function formatTimestamp(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "Emily Johnson" → "EJ": first letters of the first and last names. */
function youthInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  const first = parts[0][0];
  const last =
    parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function SnapshotHeaderAction({
  count,
  updatedAt,
  onRefresh,
  sectionLabel,
}: {
  count: number;
  updatedAt: Date;
  onRefresh: () => void;
  /** Names the section in the icon-only Refresh button's label. */
  sectionLabel: string;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap justify-end">
      <Badge variant={count > 0 ? "warning" : "neutral"}>
        {count}
      </Badge>
      <span className="slds-text-3" style={{ color: sldsWeak }}>
        Last updated: {formatTimestamp(updatedAt)}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            aria-label={`Refresh ${sectionLabel}`}
            onClick={onRefresh}
          >
            <RefreshCw />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Refresh</TooltipContent>
      </Tooltip>
    </div>
  );
}

// Same table framing as Capacity History.
function RecordTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
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
            {headers.map((h) => (
              <TableHead
                key={h}
                className="px-3 h-9"
                style={{ color: sldsWeak, fontSize: 12 }}
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  );
}

const cellClass = "px-3 py-2.5 slds-text-4";

// Header metric tile — the app's standard KPI tile composition (Card
// "section" + uppercase label, large value, round icon badge), as used by
// the Program Log summary tiles and the KPI-01 showcase. With `onClick` the
// tile is an action: pointer, hover, keyboard (Enter/Space) and focus ring.
function HeaderMetric({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
}) {
  const interactive = !!onClick;
  return (
    <Card
      variant="section"
      className={
        interactive
          ? "shadow-sm cursor-pointer transition-shadow hover:shadow-md hover:bg-[var(--slds-g-color-background-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2"
          : "shadow-sm"
      }
      {...(interactive && {
        role: "button",
        tabIndex: 0,
        "aria-label": `${label}: ${value}. View records`,
        onClick,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        },
      })}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p
              className="text-xs font-medium uppercase tracking-wide max-w-40"
              style={{ color: sldsWeak }}
            >
              {label}
            </p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ color: sldsDefault }}
            >
              {value}
            </p>
          </div>
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Read-only view of an underlying record (or a Program-scoped record list)
// for objects that have no record page in the app yet — Documents,
// Connections, Med Documentation Reviews and Missing Med Documentation.
// Reuses the app Dialog + field/table patterns.
interface RecordView {
  title: string;
  description: string;
  fields?: { label: string; value: React.ReactNode }[];
  body?: React.ReactNode;
  action?: { label: string; onClick: () => void };
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function ProgramRecordPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isCreate = id === undefined;
  const isEditRoute = location.pathname.endsWith("/edit");
  // Create, Edit and Update Capacity are System Admin-only (17673/19845);
  // every user can view. A non-admin reaching /edit sees the read-only
  // record, and /program/new sends them back to the List View.
  const canManage = CURRENT_USER_IS_SYSTEM_ADMIN;
  const mode: "view" | "edit" | "create" = !canManage
    ? "view"
    : isCreate
      ? "create"
      : isEditRoute
        ? "edit"
        : "view";

  // Staff never reach an editable page by URL: /program/new → List View,
  // /program/:id/edit → that record's read-only View.
  useEffect(() => {
    if (canManage) return;
    if (isCreate) navigate("/program", { replace: true });
    else if (isEditRoute)
      navigate(`/program/${id}`, { replace: true });
  }, [isCreate, isEditRoute, id, canManage, navigate]);

  const programId = id ? Number(id) : null;

  const formRef = useRef<DetailFormHandle>(null);

  // ── Data — seeded fresh from the shared store on every mount (i.e. every
  // time this route is navigated to), so edits made elsewhere are reflected
  // without a browser refresh. ────────────────────────────────────────────
  const [programs, setPrograms] = useState<ProgramRecord[]>(
    () => getPrograms(),
  );
  const [capacitySnapshots, setCapacitySnapshots] = useState<
    CapacitySnapshot[]
  >(() => getCapacitySnapshots());

  // Re-renders at the date boundary so the effective Capacity Snapshot and
  // derived Status update while the page stays open (19989 / 17673).
  const todayIsoStr = useTodayIso();

  const storedProgram =
    programId !== null
      ? (programs.find((p) => p.id === programId) ?? null)
      : null;
  // Memoized so DetailForm's `initial` keeps its identity between renders.
  const existingProgram = useMemo(
    () =>
      storedProgram && {
        ...storedProgram,
        status: deriveProgramStatus(
          storedProgram.startDate,
          storedProgram.endDate,
          todayIsoStr,
        ),
      },
    [storedProgram, todayIsoStr],
  );

  const currentSnapshot = existingProgram
    ? resolveCapacityForDate(
        existingProgram.id,
        capacitySnapshots,
        todayIsoStr,
      )
    : null;
  const currentCapacityDisplay = formatCapacity(
    currentSnapshot ? currentSnapshot.capacity : null,
  );
  const upcomingSnapshot = existingProgram
    ? getUpcomingSnapshot(
        existingProgram.id,
        capacitySnapshots,
        todayIsoStr,
      )
    : null;
  // Program → Youth → Documents / Incidents (19990 Active Youth, 19991).
  const scopedId = existingProgram?.id ?? -1;
  const activeYouth = useSnapshot(
    () => getActiveYouthForProgram(scopedId),
    scopedId,
  );
  const expiringDocs = useSnapshot(
    () => getExpiringDocumentsForProgram(scopedId),
    scopedId,
  );
  const openIncidents = useSnapshot(
    () => getUnfinalizedIncidentsForProgram(scopedId),
    scopedId,
  );
  const openConnections = useSnapshot(
    () => getUnfinalizedConnectionsForProgram(scopedId),
    scopedId,
  );
  const openItps = useSnapshot(
    () => getUnfinalizedItpsForProgram(scopedId),
    scopedId,
  );
  const openMedErrors = useSnapshot(
    () => getAssignedMedErrorsForProgram(scopedId),
    scopedId,
  );
  const [followUpTab, setFollowUpTab] = useState<
    "irs" | "connections"
  >("irs");

  // Header alert counts — live Program-scoped queries, re-run every render
  // so they always reflect the current Program.
  const recentIncidentCount = getRecentIncidentsForProgram(
    scopedId,
    7,
  ).length;
  const missingMedDocs =
    getMissingMedDocumentationForProgram(scopedId);

  const [recordView, setRecordView] =
    useState<RecordView | null>(null);
  useEffect(() => setRecordView(null), [scopedId]);

  const capacityHistory = existingProgram
    ? buildCapacityHistory(
        existingProgram.id,
        capacitySnapshots,
        todayIsoStr,
      )
    : [];

  // ── Update Capacity dialog state ──────────────────────────────────────
  const [showUpdateCapacity, setShowUpdateCapacity] =
    useState(false);
  const [newCapacityValue, setNewCapacityValue] = useState("");
  const [newEffectiveDateValue, setNewEffectiveDateValue] =
    useState("");
  // Bumped on each failed capacity save so its errors are announced.
  const [capacitySaveAttempt, setCapacitySaveAttempt] =
    useState(0);
  const [capacityFormErrors, setCapacityFormErrors] = useState<{
    capacity?: string;
    effectiveDate?: string;
  }>({});

  function openUpdateCapacity() {
    setNewCapacityValue("");
    setNewEffectiveDateValue("");
    setCapacityFormErrors({});
    setCapacitySaveAttempt(0);
    setShowUpdateCapacity(true);
  }
  function closeUpdateCapacity() {
    setShowUpdateCapacity(false);
    setNewCapacityValue("");
    setNewEffectiveDateValue("");
    setCapacityFormErrors({});
    setCapacitySaveAttempt(0);
  }

  function handleSaveCapacitySnapshot() {
    // Same System Admin gate as the UI (prototype flag, not server auth).
    if (!canManage || !existingProgram) return;

    const errs: { capacity?: string; effectiveDate?: string } =
      {};
    const trimmedCapacity = newCapacityValue.trim();
    if (!trimmedCapacity) {
      errs.capacity = "New Capacity is required.";
    } else if (!/^\d+$/.test(trimmedCapacity)) {
      errs.capacity = "Capacity must be a whole number.";
    } else if (Number(trimmedCapacity) <= 0) {
      errs.capacity = "Capacity must be greater than 0.";
    }

    if (!newEffectiveDateValue.trim()) {
      errs.effectiveDate = "Effective Date is required.";
    } else if (!isValidMdy(newEffectiveDateValue)) {
      errs.effectiveDate = "Enter a valid date (MM/DD/YYYY).";
    } else if (
      // One snapshot per Effective Date — a second one on the same day would
      // give the earlier record a system End Date before its own start.
      capacitySnapshots.some(
        (s) =>
          s.programId === existingProgram.id &&
          s.effectiveDate === mdyToIso(newEffectiveDateValue),
      )
    ) {
      errs.effectiveDate =
        "A capacity change already exists for this Effective Date.";
    }

    if (Object.keys(errs).length) {
      setCapacityFormErrors(errs);
      setCapacitySaveAttempt((n) => n + 1);
      return;
    }

    // Only the new snapshot is stored. The previous snapshot's End Date is
    // system-derived (the day before this Effective Date) by
    // buildCapacityHistory, so no historical record is ever overwritten.
    const snapshot: CapacitySnapshot = {
      id: nextCapacitySnapshotId(),
      programId: existingProgram.id,
      capacity: Number(trimmedCapacity),
      effectiveDate: mdyToIso(newEffectiveDateValue),
      createdBy: CURRENT_USER_NAME,
      createdAt: new Date().toISOString(),
    };

    const written = addCapacitySnapshot(snapshot);
    if (!written.ok) {
      toast.error("Capacity was not updated.", {
        description:
          written.reason === "unreadable"
            ? "Saved Programs can't be read, so nothing was changed."
            : "The change could not be saved. Your entries are still here — please try again.",
      });
      return;
    }
    setCapacitySnapshots(getCapacitySnapshots());
    toast.success(
      `Capacity updated for "${existingProgram.name}".`,
    );
    closeUpdateCapacity();
  }

  // ── Save / Cancel for the Program record itself ───────────────────────
  function handleSave(
    record: ProgramRecord,
    changes: ProgramStaffChange[],
  ): ProgramStaffSaveResult {
    // Same System Admin gate as the UI (prototype flag, not server auth).
    if (!canManage)
      return { ok: false, error: "You can't save Programs." };
    // The Program and its staff assignments are saved as one operation:
    // either both are stored or neither is, and success is only reported
    // after both writes.
    const result = saveProgramWithStaffChanges({
      record,
      mode: mode === "create" ? "create" : "edit",
      changes,
    });
    if (!result.ok) {
      toast.error("Program was not saved.", {
        description: result.error,
      });
      return result;
    }
    setPrograms(getPrograms());
    toast.success(
      mode === "create"
        ? `Program "${result.program.name}" created successfully.`
        : `Program "${result.program.name}" saved successfully.`,
    );
    if (mode === "create") {
      // Navigate from an effect, after the form has dropped its
      // unsaved-changes guard (a synchronous navigate would be held).
      setSavedId(result.program.id);
    } else {
      navigate(`/program/${result.program.id}`, { replace: true });
    }
    return result;
  }
  const [savedId, setSavedId] = useState<number | null>(null);
  useEffect(() => {
    if (savedId !== null)
      navigate(`/program/${savedId}`, { replace: true });
  }, [savedId, navigate]);

  // ── Delete (19845) — System Admin, existing Program only. AC16 (related
  // records) is pending: Programs with related records are blocked. ─────
  const [deleteOpen, setDeleteOpen] = useState(false);
  // Relationships as of the last read: on every open, and replaced by the
  // service's own result when a confirm is blocked.
  const [relatedRecords, setRelatedRecords] = useState<
    ProgramRelation[]
  >([]);
  // Set when Delete itself was blocked — drives the live announcement.
  const [deleteBlocked, setDeleteBlocked] = useState(false);
  // Staff assignment history couldn't be read: that is never "no related
  // records", so deleting is refused until it can be read.
  const [historyUnreadable, setHistoryUnreadable] = useState(false);
  function handleDeleteOpenChange(open: boolean) {
    const checked =
      open && existingProgram
        ? checkProgramRelatedRecords(existingProgram.id)
        : { relations: [], historyUnreadable: false };
    setRelatedRecords(checked.relations);
    setHistoryUnreadable(checked.historyUnreadable);
    setDeleteBlocked(false);
    setDeleteOpen(open);
  }
  // Switching Programs never carries a dialog or its state across.
  useEffect(() => {
    setDeleteOpen(false);
    setRelatedRecords([]);
    setDeleteBlocked(false);
    setHistoryUnreadable(false);
  }, [existingProgram?.id]);
  function handleDelete() {
    if (!existingProgram) return;
    const result = deleteProgram(existingProgram.id, canManage);
    if (!result.ok) {
      if (result.reason === "has-related-records") {
        // Relationships changed since the dialog opened: show the current
        // ones, disable confirm, stay open — no toast, no navigation.
        setRelatedRecords(result.relations);
        setDeleteBlocked(true);
      } else if (result.reason === "history-unreadable") {
        setHistoryUnreadable(true);
        setDeleteBlocked(true);
      } else if (result.reason === "storage")
        toast.error("Program was not deleted.", {
          description:
            "The change could not be saved. Please try again.",
        });
      else if (result.reason === "not-found")
        toast.error("This Program no longer exists.");
      else
        toast.error("Only System Admins can delete Programs.");
      return;
    }
    setDeleteOpen(false);
    toast.success(`Program "${existingProgram.name}" deleted.`);
    navigate("/program", { replace: true });
  }

  function handleCancel() {
    if (mode === "create") {
      navigate("/program");
    } else if (existingProgram) {
      navigate(`/program/${existingProgram.id}`);
    } else {
      navigate("/program");
    }
  }

  // ── Program tools (header) — each launch carries this Program's context so the
  // destination opens scoped to it rather than as a generic dashboard. ──
  function openProgramLog() {
    if (!existingProgram) return;
    navigate("/program-log", {
      state: {
        programId: existingProgram.id,
        programName: existingProgram.name,
      },
    });
  }

  // Med Reviews opens Medications > Med Review Hub; the Program id travels
  // in the URL so refresh and direct links keep the Program context.
  function openMedReviews() {
    if (!existingProgram) return;
    navigate(programMedReviewsUrl(existingProgram.id));
  }

  function openRecentIncidents() {
    if (!existingProgram) return;
    navigate("/incident-reports", {
      state: {
        scope: "program",
        programId: existingProgram.id,
        programName: existingProgram.name,
        days: 7,
      },
    });
  }

  function openPass() {
    if (!existingProgram) return;
    navigate("/pass", {
      state: {
        scope: "program",
        programId: existingProgram.id,
        programName: existingProgram.name,
      },
    });
  }

  // Missing Med Documentation — the Program-scoped records behind the tile.
  function openMissingMedDocs() {
    if (!existingProgram) return;
    const rows = getMissingMedDocumentationForProgram(
      existingProgram.id,
    );
    setRecordView({
      title: "Missing Med Documentation",
      description: `${existingProgram.name} · doses for currently active youth with no documented administration.`,
      body:
        rows.length === 0 ? (
          <EmptyState
            icon={Pill}
            tone="success"
            title="No missing med documentation"
            description="Every scheduled dose for this Program's active youth is documented."
          />
        ) : (
          <RecordTable
            headers={[
              "YOUTH",
              "MEDICATION",
              "SCHEDULED",
              "STATUS",
            ]}
          >
            {rows.map((m) => (
              <TableRow key={m.id}>
                <TableCell className={cellClass}>
                  <Button
                    type="button"
                    variant="link-info"
                    size="sm"
                    onClick={() =>
                      navigate(
                        `/constituents/${m.constituentId}`,
                      )
                    }
                  >
                    {getYouthNames([m.constituentId])}
                  </Button>
                </TableCell>
                <TableCell
                  className={cellClass}
                  style={{ color: sldsDefault }}
                >
                  {m.medication}
                </TableCell>
                <TableCell
                  className={cellClass}
                  style={{ color: sldsDefault }}
                >
                  {formatTimestamp(
                    new Date(m.scheduledDateTime),
                  )}
                </TableCell>
                <TableCell className="px-3 py-2.5">
                  <Badge variant="warning">{m.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </RecordTable>
        ),
    });
  }

  // Substance Tests opens this Program's Substance Tests page (20065),
  // nested under the Program so Programs stays the active section and the
  // Program id is in the URL.
  function openSubstanceTests() {
    if (!existingProgram) return;
    navigate(`/program/${existingProgram.id}/substance-tests`);
  }

  // ── Saved Programs unreadable — an error, not "not found" ─────────────
  if (!isCreate && !existingProgram && getProgramDataStatus() === "unreadable") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={AlertCircle}
          tone="error"
          title="Program could not be loaded"
          description="Saved Program data could not be read. Nothing has been changed."
          actionLabel="Back to Programs"
          actionIcon={ArrowLeft}
          actionVariant="outline"
          onAction={() => navigate("/program")}
        />
      </div>
    );
  }

  // ── Not found (edit/view of an id that no longer exists) ──────────────
  if (!isCreate && !existingProgram) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2
            className="text-2xl font-semibold mb-4"
            style={{ color: sldsDefault }}
          >
            Program Not Found
          </h2>
          <p className="mb-4" style={{ color: sldsWeak }}>
            The program you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => navigate("/program")}
            className="rounded-full"
            style={primaryButtonStyle}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Programs
          </Button>
        </div>
      </div>
    );
  }

  const recordTitle =
    mode === "create"
      ? "New Program"
      : (existingProgram?.name ?? "");
  const recordSubtitle = existingProgram
    ? [existingProgram.campus, existingProgram.ageRange]
        .filter(Boolean)
        .join(" · ")
    : "";

  // ── Capacity sections — read-only in every mode (incl. Create); the only
  // way to change Capacity is the Update Capacity action on Program Details
  // (View mode, System Admin). ───────────────────────────────────────────
  const capacitySection = (
    <Subsection
      title="Capacity"
      headerAction={
        mode === "view" && canManage && existingProgram ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="slds-text-4 shadow-none"
            style={outlineButtonStyle}
            onClick={openUpdateCapacity}
          >
            Update Capacity
          </Button>
        ) : undefined
      }
    >
      <FieldRow>
        <div className="space-y-1.5">
          <FieldLabel>CURRENT CAPACITY</FieldLabel>
          <ReadText value={currentCapacityDisplay} />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>UPCOMING CAPACITY</FieldLabel>
          <ReadText
            value={
              upcomingSnapshot
                ? formatCapacity(upcomingSnapshot.capacity)
                : ""
            }
          />
          {upcomingSnapshot && (
            <p
              className="slds-text-3"
              style={{ color: sldsWeak }}
            >
              Effective{" "}
              {isoToMdy(upcomingSnapshot.effectiveDate)}
            </p>
          )}
        </div>
      </FieldRow>
      {mode !== "view" && (
        <p className="slds-text-3" style={{ color: sldsWeak }}>
          {mode === "create"
            ? "Capacity is set through Update Capacity on Program Details once the Program is created."
            : "Capacity is managed through Update Capacity on Program Details."}
        </p>
      )}
    </Subsection>
  );

  const capacityHistorySection = existingProgram && (
    <Subsection title="Capacity History">
      {capacityHistory.length === 0 ? (
        <p
          className="slds-text-4 py-2"
          style={{ color: sldsWeak }}
        >
          No Capacity Snapshots yet. Use Update Capacity to set
          one.
        </p>
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
                  "EFFECTIVE DATE",
                  "END DATE",
                  "CAPACITY",
                  "STATUS",
                  "CHANGED BY",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className="px-3 h-9"
                    style={{ color: sldsWeak, fontSize: 12 }}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {capacityHistory.map(
                ({ snapshot, status, endDate }) => (
                  <TableRow key={snapshot.id}>
                    <TableCell
                      className="px-3 py-2.5 slds-text-4"
                      style={{ color: sldsDefault }}
                    >
                      {isoToMdy(snapshot.effectiveDate)}
                    </TableCell>
                    <TableCell
                      className="px-3 py-2.5 slds-text-4"
                      style={{ color: sldsDefault }}
                    >
                      {endDate ? isoToMdy(endDate) : "—"}
                    </TableCell>
                    <TableCell
                      className="px-3 py-2.5 slds-text-4"
                      style={{ color: sldsDefault }}
                    >
                      {formatCapacity(snapshot.capacity)}
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <Badge
                        variant={capacityStatusBadgeVariant(
                          status,
                        )}
                      >
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="px-3 py-2.5 slds-text-4"
                      style={{ color: sldsDefault }}
                    >
                      {snapshot.createdBy || "—"}
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </Subsection>
  );

  const detailForm = (
    <DetailForm
      ref={formRef}
      mode={mode}
      initial={existingProgram}
      onSave={handleSave}
      canEditAssignments={canManageProgramStaffAssignments()}
      staffTabExtra={
        mode === "view" && existingProgram ? (
          <div className="space-y-4 pt-2">
            {/* Active Youth — Program → Youth (programId) */}
                    <SectionCard
                      title="Active Youth"
                      headerAction={
                        <Badge variant="success">
                          {activeYouth.data.length} Active
                        </Badge>
                      }
                    >
                      {activeYouth.data.length === 0 ? (
                        <EmptyState
                          icon={Users}
                          title="No active youth"
                          description="No youth are currently active in this Program."
                        />
                      ) : (
                        /* Avatar + name (Program Log's youth row look) as
                           ONE link to that youth's Constituent record
                           (/constituents/:id); wraps when space is tight. */
                        <ul className="flex flex-wrap gap-x-6 gap-y-4">
                          {activeYouth.data.map((y) => (
                            <li key={y.constituentId}>
                              <Link
                                to={`/constituents/${y.constituentId}`}
                                className="group flex w-20 flex-col items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                              >
                                <Avatar
                                  size="lg"
                                  outlined
                                  aria-hidden="true"
                                >
                                  <AvatarFallback
                                    size="lg"
                                    color="brand-soft"
                                  >
                                    {youthInitials(y.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="slds-text-3 text-center font-medium text-[var(--color-link-blue)] group-hover:underline">
                                  {y.name}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </SectionCard>
            {/* US 20221 — directly below Active Youth. */}
            <ShiftRolesSection
              programId={existingProgram.id}
              programName={existingProgram.name}
            />
          </div>
        ) : undefined
      }
      capacitySlot={
        <>
          {capacitySection}
          {capacityHistorySection}
        </>
      }
    />
  );

  const incidentTable =
    openIncidents.data.length === 0 ? (
      <EmptyState
        icon={FileWarning}
        tone="success"
        title="No unfinalized incident reports"
        description="No incidents involving this Program's active youth started in the last 30 days are awaiting finalization."
      />
    ) : (
      <RecordTable
        headers={[
          "INCIDENT",
          "YOUTH INVOLVED",
          "STARTED",
          "STATUS",
        ]}
      >
        {openIncidents.data.map((r) => (
          <TableRow key={r.id}>
            <TableCell className={cellClass}>
              <Button
                type="button"
                variant="link-info"
                size="sm"
                onClick={() =>
                  navigate(`/youth-ir-details/${r.id}`)
                }
              >
                IR-{r.id}
              </Button>
            </TableCell>
            <TableCell
              className={cellClass}
              style={{ color: sldsDefault }}
            >
              {getYouthNames(r.constituentIds)}
            </TableCell>
            <TableCell
              className={cellClass}
              style={{ color: sldsDefault }}
            >
              {formatTimestamp(
                new Date(r.incidentStartDateTime),
              )}
            </TableCell>
            <TableCell className="px-3 py-2.5">
              <Badge variant="neutral">{r.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </RecordTable>
    );

  // Unfinalized Connections — the second tab of the IRs/Connections card.
  const connectionTable =
    openConnections.data.length === 0 ? (
      <EmptyState
        icon={Users}
        tone="success"
        title="No unfinalized connections"
        description="No connections involving this Program's active youth started in the last 30 days are awaiting finalization."
      />
    ) : (
      <RecordTable
        headers={[
          "CONNECTION",
          "YOUTH INVOLVED",
          "STARTED",
          "STATUS",
        ]}
      >
        {openConnections.data.map((c) => (
          <TableRow key={c.id}>
            <TableCell className={cellClass}>
              {/* No Connection record page exists yet — open the record
                  read-only in place. */}
              <Button
                type="button"
                variant="link-info"
                size="sm"
                onClick={() =>
                  setRecordView({
                    title: `Connection CN-${c.id}`,
                    description: "Connection record",
                    fields: [
                      {
                        label: "YOUTH INVOLVED",
                        value: getYouthNames(c.constituentIds),
                      },
                      {
                        label: "TYPE",
                        value: c.connectionType,
                      },
                      {
                        label: "STARTED",
                        value: formatTimestamp(
                          new Date(c.startDateTime),
                        ),
                      },
                      {
                        label: "STATUS",
                        value: (
                          <Badge variant="neutral">
                            {c.status}
                          </Badge>
                        ),
                      },
                      { label: "STAFF", value: c.staff },
                      { label: "NOTES", value: c.notes || "—" },
                    ],
                  })
                }
              >
                CN-{c.id}
              </Button>
            </TableCell>
            <TableCell
              className={cellClass}
              style={{ color: sldsDefault }}
            >
              {getYouthNames(c.constituentIds)}
            </TableCell>
            <TableCell
              className={cellClass}
              style={{ color: sldsDefault }}
            >
              {formatTimestamp(new Date(c.startDateTime))}
            </TableCell>
            <TableCell className="px-3 py-2.5">
              <Badge variant="neutral">{c.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </RecordTable>
    );

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{
        backgroundColor: "var(--slds-g-color-background-alt-2)",
      }}
    >
      {/* ── Update Capacity Dialog ── */}
      <Dialog
        open={showUpdateCapacity}
        onOpenChange={(open) => {
          if (!open) closeUpdateCapacity();
        }}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Update Capacity</DialogTitle>
            <DialogDescription>
              Update the Program capacity and specify when the
              change becomes effective.
            </DialogDescription>
          </DialogHeader>

          {existingProgram && (
            <DialogBody className="space-y-4 bg-white">
              <div className="space-y-1.5">
                <FieldLabel>PROGRAM</FieldLabel>
                <ReadText value={existingProgram.name} />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>CURRENT CAPACITY</FieldLabel>
                <ReadText value={currentCapacityDisplay} />
              </div>

              <div className="space-y-1.5">
                <FieldLabel htmlFor="cap-new-value" required>
                  NEW CAPACITY
                </FieldLabel>
                <Input
                  id="cap-new-value"
                  size="md"
                  surface="base"
                  inputMode="numeric"
                  value={newCapacityValue}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(
                      /\D/g,
                      "",
                    );
                    setNewCapacityValue(digitsOnly);
                    setCapacityFormErrors((p) => ({
                      ...p,
                      capacity: "",
                    }));
                  }}
                  placeholder="Enter new capacity"
                  {...errorAria(
                    "cap-new-value",
                    capacityFormErrors.capacity,
                  )}
                />
                <FieldError
                  id="cap-new-value"
                  message={capacityFormErrors.capacity}
                />
              </div>

              {/* Effective Date — past, current, and future dates all
                  allowed; DateInput applies no min/max restriction. There
                  is no End Date input: the previous snapshot's End Date is
                  calculated by the system. */}
              <div className="space-y-1.5">
                <FieldLabel
                  htmlFor="cap-effective-date"
                  required
                >
                  EFFECTIVE DATE
                </FieldLabel>
                <DateInput
                  id="cap-effective-date"
                  value={newEffectiveDateValue}
                  onChange={(v) => {
                    setNewEffectiveDateValue(v);
                    setCapacityFormErrors((p) => ({
                      ...p,
                      effectiveDate: "",
                    }));
                  }}
                  required
                  className={
                    capacityFormErrors.effectiveDate
                      ? "border-[#c23934]"
                      : undefined
                  }
                  {...errorAria(
                    "cap-effective-date",
                    capacityFormErrors.effectiveDate,
                  )}
                />
                <FieldError
                  id="cap-effective-date"
                  message={capacityFormErrors.effectiveDate}
                />
                {capacitySaveAttempt > 0 && (
                  <VisuallyHidden
                    key={capacitySaveAttempt}
                    role="alert"
                  >
                    {`Capacity was not saved. ${Object.values(capacityFormErrors).filter(Boolean).join(" ")}`}
                  </VisuallyHidden>
                )}
              </div>
            </DialogBody>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeUpdateCapacity}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveCapacitySnapshot}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Underlying record / Program-scoped record list ── */}
      <Dialog
        open={recordView !== null}
        onOpenChange={(open) => {
          if (!open) setRecordView(null);
        }}
      >
        <DialogContent size={recordView?.body ? "lg" : "md"}>
          <DialogHeader>
            <DialogTitle>{recordView?.title}</DialogTitle>
            <DialogDescription>
              {recordView?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 bg-white">
            {recordView?.fields && (
              <FieldRow>
                {recordView.fields.map((f) => (
                  <div key={f.label} className="space-y-1.5">
                    <FieldLabel>{f.label}</FieldLabel>
                    {typeof f.value === "string" ? (
                      <ReadText value={f.value} />
                    ) : (
                      <div>{f.value}</div>
                    )}
                  </div>
                ))}
              </FieldRow>
            )}
            {recordView?.body}
          </DialogBody>
          <DialogFooter>
            {recordView?.action && (
              <Button
                type="button"
                variant="outline"
                onClick={recordView.action.onClick}
              >
                {recordView.action.label}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setRecordView(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Page header — breadcrumb, identity, actions ── */}
      <div
        className="px-6 py-4 flex-shrink-0"
        style={{
          backgroundColor: sldsBase,
          borderBottom: sldsBorder,
        }}
      >
        <Breadcrumb className="mb-3">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-[15px] text-[14px]"
                asChild
              >
                <button
                  type="button"
                  onClick={() => navigate("/program")}
                >
                  Programs
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{recordTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <LayoutGrid
              className="h-8 w-8 mt-0.5 flex-shrink-0"
              style={{ color: "#145F33" }}
            />
            <div className="min-w-0">
              <p
                className="slds-text-3 uppercase tracking-widest font-semibold"
                style={{ color: sldsWeak }}
              >
                Program
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <h1
                  className="slds-page-header-title truncate"
                  style={{ color: sldsDefault }}
                >
                  {recordTitle}
                </h1>
                {existingProgram && (
                  <Badge
                    variant={programStatusBadgeVariant(
                      existingProgram.status,
                    )}
                  >
                    {existingProgram.status}
                  </Badge>
                )}
              </div>
              {recordSubtitle && (
                <p
                  className="slds-text-4 mt-0.5"
                  style={{ color: sldsWeak }}
                >
                  {recordSubtitle}
                </p>
              )}
            </div>
          </div>

          {/* Program metrics — between identity and actions */}
          {existingProgram && (
            <div className="flex items-stretch gap-3 flex-wrap">
              <HeaderMetric
                label="Incidents in the Last 7 Days"
                value={recentIncidentCount}
                icon={AlertTriangle}
                iconBg="bg-red-100"
                iconColor="text-red-600"
                onClick={openRecentIncidents}
              />
              <HeaderMetric
                label="Missing Med Documentation"
                value={missingMedDocs.length}
                icon={Pill}
                iconBg="bg-orange-100"
                iconColor="text-orange-600"
                onClick={openMissingMedDocs}
              />
            </div>
          )}

          {/* Header actions — View mode only; Edit/Create use the
              Save/Cancel footer below. Program-scoped tools, each launched
              in this Program's context, with Edit last. */}
          {mode === "view" && existingProgram && (
            <div className="flex items-center justify-end gap-2 flex-wrap ml-auto">
              <Button
                variant="outline"
                onClick={openProgramLog}
              >
                <ClipboardList /> Program Log
              </Button>
              <Button
                variant="outline"
                onClick={openMedReviews}
              >
                <Pill /> Med Reviews
              </Button>
              {/* Pass opens the shared Pass List scoped to this Program
                  (19992). */}
              <Button variant="outline" onClick={openPass}>
                <Ticket /> Pass
              </Button>
              <Button
                variant="outline"
                onClick={openSubstanceTests}
              >
                <ShieldAlert /> Substance Tests
              </Button>
              {canManage && (
                <Button
                  variant="outline-primary"
                  onClick={() =>
                    navigate(
                      `/program/${existingProgram.id}/edit`,
                    )
                  }
                >
                  <Pencil /> Edit
                </Button>
              )}
              {canManage && (
                <AlertDialog
                  open={deleteOpen}
                  onOpenChange={handleDeleteOpenChange}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="outline-destructive">
                      <Trash2 /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete Program
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {historyUnreadable
                          ? `"${existingProgram.name}" can't be deleted because its staff assignment history can't be read right now. Reload the page or try again later; nothing has been changed.`
                          : relatedRecords.length
                          ? `"${existingProgram.name}" can't be deleted yet. It has related records, and how related records are handled on delete is pending an approved policy.`
                          : `Delete the Program "${existingProgram.name}"? This can't be undone.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    {deleteBlocked && (
                      <VisuallyHidden role="alert">
                        {historyUnreadable
                          ? `Program was not deleted. Staff assignment history for "${existingProgram.name}" can't be read.`
                          : `Program was not deleted. "${existingProgram.name}" now has related records, and how related records are handled on delete is pending an approved policy.`}
                      </VisuallyHidden>
                    )}
                    {relatedRecords.length > 0 && (
                      <ul className="slds-text-4 list-disc pl-5">
                        {relatedRecords.map((r) => (
                          <li key={r.label}>
                            {r.label}: {r.count}
                          </li>
                        ))}
                      </ul>
                    )}
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        disabled={
                          relatedRecords.length > 0 ||
                          historyUnreadable
                        }
                        onClick={(ev) => {
                          ev.preventDefault();
                          handleDelete();
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* The page's single vertical scroll region. Extra bottom padding
            clears the fixed 40px UtilityBar (To Do List / History / Notes),
            which overlays the bottom of the viewport, so the last section
            and its spacing are never hidden behind it. */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 pb-16 sm:p-6 sm:pb-16">
          <div className="space-y-4">
            <>
              {mode === "view" && existingProgram ? (
                /* Dashboard layout (View): one shared masonry flow. Each
                     card goes into the currently shortest column, so
                     shorter columns don't leave empty gaps. 3 / 2 / 1
                     columns by usable width (min ~440px per column). */
                <MasonryGrid
                  minColumnWidth={440}
                  maxColumns={3}
                  gap={16}
                  // Column 1 a bit wider, column 2 a bit narrower.
                  columnWeights={[1.15, 0.85, 1]}
                >
                    <MasonryItem column={1}>{detailForm}</MasonryItem>


                  {/* Shift Handover Checklists — column 1, below Active Youth. */}
                  <MasonryItem column={1}>
                    <ShiftHandoverChecklistsSection
                      programId={existingProgram.id}
                      programName={existingProgram.name}
                      canConfigure={canManage}
                    />
                  </MasonryItem>

                    <MasonryItem column={2}>
                      <SectionCard
                        title="Documents Expiring Within 30 Days"
                        headerAction={
                          <SnapshotHeaderAction
                            count={expiringDocs.data.length}
                            updatedAt={expiringDocs.updatedAt}
                            onRefresh={expiringDocs.refresh}
                            sectionLabel="Documents Expiring Within 30 Days"
                          />
                        }
                      >
                        {expiringDocs.data.length === 0 ? (
                          <EmptyState
                            icon={FileText}
                            tone="success"
                            title="No documents expiring"
                            description="No active youth in this Program have documents expiring in the next 30 days."
                          />
                        ) : (
                          <RecordTable
                            headers={[
                              "YOUTH",
                              "DOCUMENT",
                              "EXPIRATION DATE",
                            ]}
                          >
                            {expiringDocs.data.map(
                              ({ document: d, youth: y }) => (
                                <TableRow key={d.id}>
                                  <TableCell
                                    className={cellClass}
                                  >
                                    {/* Youth → Constituent profile; the
                                          Document cell opens the record. */}
                                    <Button
                                      type="button"
                                      variant="link-info"
                                      size="sm"
                                      onClick={() =>
                                        navigate(
                                          `/constituents/${y.constituentId}`,
                                        )
                                      }
                                    >
                                      {y.name}
                                    </Button>
                                  </TableCell>
                                  <TableCell
                                    className={cellClass}
                                  >
                                    <Button
                                      type="button"
                                      variant="link-info"
                                      size="sm"
                                      onClick={() =>
                                        setRecordView({
                                          title: d.name,
                                          description: `Document ${d.id}`,
                                          fields: [
                                            {
                                              label: "YOUTH",
                                              value: y.name,
                                            },
                                            {
                                              label: "DOCUMENT",
                                              value: d.name,
                                            },
                                            {
                                              label:
                                                "EXPIRATION DATE",
                                              value: isoToMdy(
                                                d.expirationDate,
                                              ),
                                            },
                                          ],
                                          action: {
                                            label:
                                              "Open Youth Document",
                                            // Deep link to the existing
                                            // Overview → Documents section.
                                            onClick: () =>
                                              navigate(
                                                `/constituents/${y.constituentId}?section=documents`,
                                              ),
                                          },
                                        })
                                      }
                                    >
                                      {d.name}
                                    </Button>
                                  </TableCell>
                                  <TableCell
                                    className={cellClass}
                                    style={{
                                      color: sldsDefault,
                                    }}
                                  >
                                    {isoToMdy(d.expirationDate)}
                                  </TableCell>
                                </TableRow>
                              ),
                            )}
                          </RecordTable>
                        )}
                      </SectionCard>
                    </MasonryItem>

                      {/* Unfinalized IRs / Connections — tabbed card, pinned in the
                        second column, below Documents Expiring. */}
                      <MasonryItem column={2}>
                      <Tabs
                        value={followUpTab}
                        onValueChange={(v) =>
                          setFollowUpTab(
                            v as "irs" | "connections",
                          )
                        }
                      >
                        <SectionCard
                          header={
                            <TabsList
                              variant="underline"
                              separated
                            >
                              <TabsTrigger
                                value="irs"
                                variant="underline"
                                size="sm"
                              >
                                Unfinalized IRs (Last 30 Days)
                              </TabsTrigger>
                              <TabsTrigger
                                value="connections"
                                variant="underline"
                                size="sm"
                              >
                                Unfinalized Connections (Last 30
                                Days)
                                {openConnections.data.length >
                                  0 && (
                                  <AlertCircle
                                    className="text-destructive"
                                    aria-label="Needs attention"
                                  />
                                )}
                              </TabsTrigger>
                            </TabsList>
                          }
                        >
                          <TabsContent
                            value="irs"
                            className="space-y-4"
                          >
                            <div className="flex justify-end">
                              <SnapshotHeaderAction
                                count={
                                  openIncidents.data.length
                                }
                                updatedAt={
                                  openIncidents.updatedAt
                                }
                                onRefresh={
                                  openIncidents.refresh
                                }
                                sectionLabel="Unfinalized Incident Reports"
                              />
                            </div>
                            {incidentTable}
                          </TabsContent>
                          <TabsContent
                            value="connections"
                            className="space-y-4"
                          >
                            <div className="flex justify-end">
                              <SnapshotHeaderAction
                                count={
                                  openConnections.data.length
                                }
                                updatedAt={
                                  openConnections.updatedAt
                                }
                                onRefresh={
                                  openConnections.refresh
                                }
                                sectionLabel="Unfinalized Connections"
                              />
                            </div>
                            {connectionTable}
                          </TabsContent>
                        </SectionCard>
                      </Tabs>
                      </MasonryItem>

                    <MasonryItem column={2}>
                      <SectionCard
                        title="ITPs Due/Unfinalized"
                        headerAction={
                          <SnapshotHeaderAction
                            count={openItps.data.length}
                            updatedAt={openItps.updatedAt}
                            onRefresh={openItps.refresh}
                            sectionLabel="ITPs Due/Unfinalized"
                          />
                        }
                      >
                        {openItps.data.length === 0 ? (
                          <EmptyState
                            icon={ClipboardList}
                            tone="success"
                            title="No ITPs due"
                            description="No active youth in this Program have an unfinalized ITP."
                          />
                        ) : (
                          <RecordTable
                            headers={[
                              "ITP",
                              "YOUTH",
                              "DUE / STARTED",
                              "STATUS",
                            ]}
                          >
                            {openItps.data.map((i) => (
                              <TableRow key={i.id}>
                                <TableCell
                                  className={cellClass}
                                >
                                  <Button
                                    type="button"
                                    variant="link-info"
                                    size="sm"
                                    onClick={() =>
                                      navigate(
                                        `/itp-module/${i.itpWorkspaceId}`,
                                      )
                                    }
                                  >
                                    ITP-{i.id}
                                  </Button>
                                </TableCell>
                                <TableCell
                                  className={cellClass}
                                >
                                  <Button
                                    type="button"
                                    variant="link-info"
                                    size="sm"
                                    onClick={() =>
                                      navigate(
                                        `/constituents/${i.constituentId}`,
                                      )
                                    }
                                  >
                                    {getYouthNames([
                                      i.constituentId,
                                    ])}
                                  </Button>
                                </TableCell>
                                <TableCell
                                  className={cellClass}
                                  style={{ color: sldsDefault }}
                                >
                                  <div>
                                    Due {isoToMdy(i.itpDate)}
                                  </div>
                                  <div
                                    className="slds-text-3"
                                    style={{ color: sldsWeak }}
                                  >
                                    {i.startedDate
                                      ? `Started ${isoToMdy(i.startedDate)}`
                                      : "Not started"}
                                  </div>
                                </TableCell>
                                <TableCell className="px-3 py-2.5">
                                  <Badge variant="neutral">
                                    {i.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </RecordTable>
                        )}
                      </SectionCard>
                    </MasonryItem>

                  {/* Shift Handover Checklists (US 20185) — joins the
                      same flow so it fills open column space. */}
                    {/* Assigned Med Errors — its own (third) column. */}
                    <MasonryItem column={3}>
                      <SectionCard
                        title="Assigned Med Errors"
                        headerAction={
                          <SnapshotHeaderAction
                            count={openMedErrors.data.length}
                            updatedAt={openMedErrors.updatedAt}
                            onRefresh={openMedErrors.refresh}
                            sectionLabel="Assigned Med Errors"
                          />
                        }
                      >
                        {openMedErrors.data.length === 0 ? (
                          <EmptyState
                            icon={Pill}
                            tone="success"
                            title="No assigned med errors"
                            description="No Med Documentation Reviews for this Program's active youth are in Assigned status."
                          />
                        ) : (
                          <RecordTable
                            headers={[
                              "MED ERROR",
                              "YOUTH INVOLVED",
                              "STARTED",
                              "STATUS",
                            ]}
                          >
                            {openMedErrors.data.map((m) => (
                              <TableRow key={m.id}>
                                <TableCell
                                  className={cellClass}
                                >
                                  {/* Med Documentation Review record —
                                      no record page exists yet. */}
                                  <Button
                                    type="button"
                                    variant="link-info"
                                    size="sm"
                                    onClick={() =>
                                      setRecordView({
                                        title: `Med Error ME-${m.id}`,
                                        description:
                                          "Med Documentation Review",
                                        fields: [
                                          {
                                            label:
                                              "YOUTH INVOLVED",
                                            value:
                                              getYouthNames(
                                                m.constituentIds,
                                              ),
                                          },
                                          {
                                            label: "MEDICATION",
                                            value: m.medication,
                                          },
                                          {
                                            label: "STARTED",
                                            value:
                                              formatTimestamp(
                                                new Date(
                                                  m.startedDateTime,
                                                ),
                                              ),
                                          },
                                          {
                                            label: "STATUS",
                                            value: (
                                              <Badge variant="warning">
                                                {m.status}
                                              </Badge>
                                            ),
                                          },
                                          {
                                            label:
                                              "ASSIGNED TO",
                                            value: m.assignedTo,
                                          },
                                          {
                                            label: "DETAILS",
                                            value: m.details,
                                          },
                                        ],
                                      })
                                    }
                                  >
                                    ME-{m.id}
                                  </Button>
                                </TableCell>
                                <TableCell
                                  className={cellClass}
                                  style={{ color: sldsDefault }}
                                >
                                  {getYouthNames(
                                    m.constituentIds,
                                  )}
                                </TableCell>
                                <TableCell
                                  className={cellClass}
                                  style={{ color: sldsDefault }}
                                >
                                  {formatTimestamp(
                                    new Date(m.startedDateTime),
                                  )}
                                </TableCell>
                                <TableCell className="px-3 py-2.5">
                                  <Badge variant="neutral">
                                    {m.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </RecordTable>
                        )}
                      </SectionCard>
                    </MasonryItem>
                </MasonryGrid>
              ) : (
                detailForm
              )}


              {/* Footer — Edit/Create only; View mode uses the header
                    actions. */}
              {mode !== "view" && (
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    className="h-9 rounded-full slds-text-4 shadow-none"
                    style={outlineButtonStyle}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-9 rounded-full slds-text-4 text-white shadow-none"
                    style={primaryButtonStyle}
                    onMouseEnter={primaryButtonHover}
                    onMouseLeave={primaryButtonLeave}
                    disabled={savedId !== null}
                    onClick={() => formRef.current?.submit()}
                  >
                    Save
                  </Button>
                </div>
              )}
            </>
          </div>
        </div>
      </div>
    </div>
  );
}