import React, { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ClipboardList,
} from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import {
  Card,
  CardAction,
  CardContent,
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
import { EmptyState } from "../ui/empty-state";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

// ── Constants ────────────────────────────────────────────────────────────────

export const STUDY_TIME_PLAN = "Study Time Plan";

const STP_SIGNATURE_ROLES = [
  "Director - Youth Programs",
  "Program Manager",
  "Program Coordinator",
  "Youth",
  "Parent/Guardian",
  "Therapist",
  "Youth Care Supervisor",
  "Youth Care Worker",
  "School Resources Coordinator",
  "Learning Center and Tutoring Coordinator",
  "Career Resources Coordinator",
  "Coordinator-ECR",
  "Director-ECR",
  "Advocate",
  "Day Coordinator",
  "Milieu Supervisor",
  "Community Care Scholar",
  "Care Manager",
];

const SIGNATURE_COUNTS = Array.from({ length: 10 }, (_, i) =>
  String(i + 1),
);

const STP_TEST_TYPES = ["WJ-4", "WJ-4 (Grade)"];

const STP_STANDARD_RESOURCES = [
  "Story Maps",
  "Writing Prompts",
  "Concept Webs",
  "Essay Writing Outlines",
  "Reading Charts",
  "Graphic Organizers",
  "Letter Manipulatives",
  "Reading Strategy Check List",
  "Memory Tiles",
  "Math Flashcards",
  "Number Line",
  "Multiplication Chart",
  "Calculator",
  "Formulas Chart",
  "Conversion Chart",
  "Math Manipulatives",
];

const LESSON_STATUSES = [
  "Not Started",
  "In Progress",
  "Complete",
  "Discard",
];

// ── Types ────────────────────────────────────────────────────────────────────

type Signature = { role: string; numSignatures: string };
type TextEntry = { id: number; text: string };
type Lesson = {
  id: number;
  order: number;
  focus: string;
  lessonPlan: string;
  status: string;
};
export type TestingRecord = {
  id: number;
  date: string;
  test: string;
  summary: string;
};

/** Study Time Plan fields held on the shared Add/Edit Plan `planForm`. */
export const STUDY_TIME_PLAN_DEFAULTS = {
  stp_signatures: [] as Signature[],
  stp_skillArea: "",
  stp_testScoreIds: [] as number[],
  stp_spatialInterventions: [] as TextEntry[],
  stp_behavioralInterventions: [] as TextEntry[],
  stp_mathSuggestions: [] as TextEntry[],
  stp_readingSuggestions: [] as TextEntry[],
  stp_customResources: [] as string[],
  stp_resources: [] as string[],
  stp_lessons: [] as Lesson[],
};

/** Extracts the Study Time Plan fields from planForm for persisting on the plan record. */
export function pickStudyTimeFields(planForm: any) {
  return Object.fromEntries(
    Object.keys(STUDY_TIME_PLAN_DEFAULTS).map((k) => [
      k,
      planForm[k] ?? (STUDY_TIME_PLAN_DEFAULTS as any)[k],
    ]),
  );
}

/**
 * Extra fields stored on a saved Study Time Plan record so reopening it restores
 * everything. Empty for other plan types, so their records are unchanged.
 */
export function studyTimePlanRecordFields(planForm: any) {
  if (planForm.planType !== STUDY_TIME_PLAN) return {};
  return {
    reEvalDate2: planForm.reEvalDates?.[1] || "",
    reEvalDate3: planForm.reEvalDates?.[2] || "",
    studyTime: pickStudyTimeFields(planForm),
  };
}

/** Mandatory fields beyond the Plan Type / Start Date checks shared by all plans. */
export function isStudyTimePlanValid(planForm: any) {
  return (
    !!planForm.reEvalDates?.[0] &&
    !!(planForm.stp_skillArea ?? "").trim()
  );
}

/** Normalises the two date formats used by testing records to ISO for comparison. */
const toIso = (d: string) => mdyToIso(isoToMdy(d));

/**
 * Places a lesson at its requested Order, shifting later lessons down and
 * renumbering so the sequence is always 1..n with no gaps or duplicates.
 */
function placeLesson(
  lessons: Lesson[],
  lesson: Lesson,
): Lesson[] {
  const others = lessons
    .filter((l) => l.id !== lesson.id)
    .sort((a, b) => a.order - b.order);
  others.splice(lesson.order - 1, 0, lesson);
  return others.map((l, i) => ({ ...l, order: i + 1 }));
}

// ── Shared building blocks ───────────────────────────────────────────────────

function SectionCard({
  title,
  required,
  action,
  children,
}: {
  title: string;
  required?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card variant="section">
      <CardHeader size="sm" separated>
        <CardTitle size="sm">
          {title}
          {required && <span className="text-red-600"> *</span>}
        </CardTitle>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent size="sm">{children}</CardContent>
    </Card>
  );
}

function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button size="xs" onClick={onClick}>
      <Plus />
      {label}
    </Button>
  );
}

function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-xs"
        title="Edit"
        aria-label="Edit"
        onClick={onEdit}
      >
        <Pencil />
      </Button>
      <Button
        variant="ghost-destructive"
        size="icon-xs"
        title="Delete"
        aria-label="Delete"
        onClick={onDelete}
      >
        <Trash2 />
      </Button>
    </div>
  );
}

function DeleteConfirmDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => !o && onCancel()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Entry</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this entry?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SectionEmpty({ title }: { title: string }) {
  return (
    <EmptyState
      icon={ClipboardList}
      title={title}
      className="py-4"
    />
  );
}

// ── Required Signatures (Overview tab) ───────────────────────────────────────

export function StudyTimePlanSignaturesSection({
  planForm,
  setPlanForm,
}: {
  planForm: any;
  setPlanForm: (updater: any) => void;
}) {
  const signatures: Signature[] = planForm.stp_signatures ?? [];
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<
    Record<string, string | null>
  >({});
  const [deleteRole, setDeleteRole] = useState<string | null>(
    null,
  );

  const openModal = () => {
    setDraft(
      Object.fromEntries(
        signatures.map((s) => [s.role, s.numSignatures]),
      ),
    );
    setSearch("");
    setModalOpen(true);
  };

  const filteredRoles = STP_SIGNATURE_ROLES.filter((r) =>
    r.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const selectedRoles = Object.keys(draft);
  const canApply = selectedRoles.every((r) => !!draft[r]);

  const toggleRole = (role: string, checked: boolean) =>
    setDraft((d) => {
      const next = { ...d };
      if (checked) next[role] = next[role] ?? null;
      else delete next[role];
      return next;
    });

  const apply = () => {
    if (!canApply) return;
    // Keep existing rows in place (updated), then append newly selected roles.
    const kept = signatures
      .filter((s) => s.role in draft)
      .map((s) => ({
        ...s,
        numSignatures: draft[s.role] as string,
      }));
    const added = STP_SIGNATURE_ROLES.filter(
      (r) =>
        r in draft && !signatures.some((s) => s.role === r),
    ).map((role) => ({
      role,
      numSignatures: draft[role] as string,
    }));
    setPlanForm((f: any) => ({
      ...f,
      stp_signatures: [...kept, ...added],
    }));
    setModalOpen(false);
  };

  return (
    <SectionCard
      title="Required Signatures"
      action={
        <AddButton label="Add Signature" onClick={openModal} />
      }
    >
      {signatures.length === 0 ? (
        <SectionEmpty title="No required signatures added." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead variant="slds">Role Name</TableHead>
              <TableHead variant="slds">
                Number of Signatures
              </TableHead>
              <TableHead variant="slds" className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {signatures.map((s) => (
              <TableRow key={s.role}>
                <TableCell>{s.role}</TableCell>
                <TableCell>{s.numSignatures}</TableCell>
                <TableCell>
                  <RowActions
                    onEdit={openModal}
                    onDelete={() => setDeleteRole(s.role)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>Required Signatures</DialogTitle>
            <DialogDescription>
              Select the roles that must sign this plan and the
              number of signatures required for each.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  size="md"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search roles…"
                  className="pl-8"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setSearch("")}
              >
                Clear
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow hoverable={false}>
                  <TableHead variant="slds" className="w-24">
                    Selected
                  </TableHead>
                  <TableHead variant="slds">
                    Role Name
                  </TableHead>
                  <TableHead variant="slds" className="w-48">
                    Number of Signatures
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => {
                  const selected = role in draft;
                  return (
                    <TableRow key={role}>
                      <TableCell>
                        <Checkbox
                          checked={selected}
                          onCheckedChange={(c) =>
                            toggleRole(role, c === true)
                          }
                          aria-label={`Select ${role}`}
                        />
                      </TableCell>
                      <TableCell>{role}</TableCell>
                      <TableCell>
                        <Select
                          value={draft[role] ?? ""}
                          onValueChange={(v) =>
                            setDraft((d) => ({
                              ...d,
                              [role]: v,
                            }))
                          }
                          disabled={!selected}
                        >
                          <SelectTrigger
                            size="sm"
                            aria-invalid={
                              selected && !draft[role]
                            }
                          >
                            <SelectValue placeholder="Select…" />
                          </SelectTrigger>
                          <SelectContent>
                            {SIGNATURE_COUNTS.map((n) => (
                              <SelectItem key={n} value={n}>
                                {n}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {!canApply && (
              <p className="text-destructive text-[length:var(--slds-g-font-size-3)]">
                Each selected role requires a Number of
                Signatures.
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={apply} disabled={!canApply}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteRole !== null}
        onCancel={() => setDeleteRole(null)}
        onConfirm={() => {
          setPlanForm((f: any) => ({
            ...f,
            stp_signatures: (f.stp_signatures ?? []).filter(
              (s: Signature) => s.role !== deleteRole,
            ),
          }));
          setDeleteRole(null);
        }}
      />
    </SectionCard>
  );
}

// ── Test Scores ──────────────────────────────────────────────────────────────

function TestScoresSection({
  planForm,
  setPlanForm,
  testingAssessments,
}: {
  planForm: any;
  setPlanForm: (updater: any) => void;
  testingAssessments: TestingRecord[];
}) {
  const selectedIds: number[] = planForm.stp_testScoreIds ?? [];
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<number[]>([]);

  const startIso = planForm.startDate
    ? toIso(planForm.startDate)
    : "";
  const eligible = useMemo(
    () =>
      startIso
        ? testingAssessments.filter(
            (t) =>
              STP_TEST_TYPES.includes(t.test) &&
              toIso(t.date) < startIso,
          )
        : [],
    [testingAssessments, startIso],
  );
  const associated = testingAssessments.filter((t) =>
    selectedIds.includes(t.id),
  );

  const openModal = () => {
    setDraft(
      selectedIds.filter((id) =>
        eligible.some((t) => t.id === id),
      ),
    );
    setModalOpen(true);
  };
  const toggle = (id: number, checked: boolean) =>
    setDraft((d) =>
      checked ? [...d, id] : d.filter((x) => x !== id),
    );

  const scoreTable = (
    rows: TestingRecord[],
    selectable: boolean,
  ) => (
    <Table>
      <TableHeader>
        <TableRow hoverable={false}>
          {selectable && (
            <TableHead variant="slds" className="w-24">
              Selected
            </TableHead>
          )}
          <TableHead variant="slds">Date</TableHead>
          <TableHead variant="slds">Test</TableHead>
          <TableHead variant="slds">Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((t) => (
          <TableRow key={t.id}>
            {selectable && (
              <TableCell>
                <Checkbox
                  checked={draft.includes(t.id)}
                  onCheckedChange={(c) =>
                    toggle(t.id, c === true)
                  }
                  aria-label={`Select ${t.test} ${isoToMdy(t.date)}`}
                />
              </TableCell>
            )}
            <TableCell>{isoToMdy(t.date)}</TableCell>
            <TableCell>{t.test}</TableCell>
            <TableCell className="whitespace-normal">
              {t.summary}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <SectionCard
      title="Test Scores"
      action={
        <AddButton label="Add Test Score" onClick={openModal} />
      }
    >
      {associated.length === 0 ? (
        <SectionEmpty title="No test scores added." />
      ) : (
        scoreTable(associated, false)
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>Add Test Score</DialogTitle>
            <DialogDescription>
              WJ-4 and WJ-4 (Grade) tests taken before the plan
              Start Date.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            {!startIso ? (
              <SectionEmpty title="Enter a Start Date on the Overview tab to see eligible test scores." />
            ) : eligible.length === 0 ? (
              <SectionEmpty title="No WJ-4 or WJ-4 (Grade) tests before the Start Date." />
            ) : (
              <>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setDraft(eligible.map((t) => t.id))
                    }
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDraft([])}
                  >
                    Deselect All
                  </Button>
                </div>
                {scoreTable(eligible, true)}
              </>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setPlanForm((f: any) => ({
                  ...f,
                  stp_testScoreIds: draft,
                }));
                setModalOpen(false);
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}

// ── Text-entry CRUD sections (interventions / suggestions) ───────────────────

function TextEntryListSection({
  title,
  fieldKey,
  planForm,
  setPlanForm,
}: {
  title: string;
  fieldKey: keyof typeof STUDY_TIME_PLAN_DEFAULTS;
  planForm: any;
  setPlanForm: (updater: any) => void;
}) {
  const items: TextEntry[] = planForm[fieldKey] ?? [];
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(
    null,
  );
  const [text, setText] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const openModal = (item?: TextEntry) => {
    setEditingId(item?.id ?? null);
    setText(item?.text ?? "");
    setModalOpen(true);
  };

  const save = () => {
    const value = text.trim();
    if (!value) return;
    setPlanForm((f: any) => {
      const list: TextEntry[] = f[fieldKey] ?? [];
      return {
        ...f,
        [fieldKey]:
          editingId !== null
            ? list.map((x) =>
                x.id === editingId ? { ...x, text: value } : x,
              )
            : [...list, { id: Date.now(), text: value }],
      };
    });
    setModalOpen(false);
  };

  return (
    <SectionCard
      title={title}
      action={
        <AddButton label="Add" onClick={() => openModal()} />
      }
    >
      {items.length === 0 ? (
        <SectionEmpty title="No entries added." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead variant="slds">{title}</TableHead>
              <TableHead variant="slds" className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="whitespace-pre-wrap">
                  {item.text}
                </TableCell>
                <TableCell>
                  <RowActions
                    onEdit={() => openModal(item)}
                    onDelete={() => setDeleteId(item.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? "Edit" : "Add"} {title}
            </DialogTitle>
            <DialogDescription>
              Enter the details for this entry.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-1.5">
            <Label className="slds-form-label">
              {title.toUpperCase()}{" "}
              <span className="text-red-600">*</span>
            </Label>
            <Textarea
              size="md"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter details…"
              className="min-h-[120px]"
            />
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={!text.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          setPlanForm((f: any) => ({
            ...f,
            [fieldKey]: (f[fieldKey] ?? []).filter(
              (x: TextEntry) => x.id !== deleteId,
            ),
          }));
          setDeleteId(null);
        }}
      />
    </SectionCard>
  );
}

// ── Additional Resources Needed ──────────────────────────────────────────────

function AdditionalResourcesSection({
  planForm,
  setPlanForm,
}: {
  planForm: any;
  setPlanForm: (updater: any) => void;
}) {
  const selected: string[] = planForm.stp_resources ?? [];
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [otherText, setOtherText] = useState("");
  const [draftSelected, setDraftSelected] = useState<string[]>(
    [],
  );
  const [draftCustom, setDraftCustom] = useState<string[]>([]);

  const openModal = () => {
    setDraftSelected(selected);
    setDraftCustom(planForm.stp_customResources ?? []);
    setSearch("");
    setOtherText("");
    setModalOpen(true);
  };

  const allResources = [
    ...STP_STANDARD_RESOURCES,
    ...draftCustom,
  ];
  const filtered = allResources.filter((r) =>
    r.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const toggle = (r: string, checked: boolean) =>
    setDraftSelected((d) =>
      checked ? [...d, r] : d.filter((x) => x !== r),
    );

  const addOther = () => {
    const entered = otherText.trim();
    if (!entered) return;
    const value = `Other (${entered})`;
    const exists = allResources.some(
      (r) =>
        r.toLowerCase() === value.toLowerCase() ||
        r.toLowerCase() === entered.toLowerCase(),
    );
    if (exists) {
      toast.error("This resource already exists.");
      return;
    }
    setDraftCustom((c) => [...c, value]);
    setDraftSelected((d) => [...d, value]);
    setOtherText("");
  };

  return (
    <SectionCard
      title="Additional Resources Needed"
      action={
        <AddButton label="Add Resources" onClick={openModal} />
      }
    >
      {selected.length === 0 ? (
        <SectionEmpty title="No resources selected." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead variant="slds">
                Additional Resources Needed
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selected.map((r) => (
              <TableRow key={r}>
                <TableCell>{r}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>
              Additional Resources Needed
            </DialogTitle>
            <DialogDescription>
              Select all resources the youth needs during study
              time.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                size="md"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources…"
                className="pl-8"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow hoverable={false}>
                  <TableHead variant="slds" className="w-24">
                    Selected
                  </TableHead>
                  <TableHead variant="slds" className="w-16">
                    ID
                  </TableHead>
                  <TableHead variant="slds">
                    Additional Resources Needed
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r}>
                    <TableCell>
                      <Checkbox
                        checked={draftSelected.includes(r)}
                        onCheckedChange={(c) =>
                          toggle(r, c === true)
                        }
                        aria-label={`Select ${r}`}
                      />
                    </TableCell>
                    <TableCell>
                      {allResources.indexOf(r) + 1}
                    </TableCell>
                    <TableCell>{r}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center gap-2">
              <Label
                className="slds-form-label"
                htmlFor="stp-other-resource"
              >
                OTHER
              </Label>
              <Input
                id="stp-other-resource"
                size="md"
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && addOther()
                }
                placeholder="Enter another resource…"
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={addOther}
                disabled={!otherText.trim()}
              >
                Add
              </Button>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setPlanForm((f: any) => ({
                  ...f,
                  stp_customResources: draftCustom,
                  // Keep display order consistent with the resource list.
                  stp_resources: [
                    ...STP_STANDARD_RESOURCES,
                    ...draftCustom,
                  ].filter((r) => draftSelected.includes(r)),
                }));
                setModalOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}

// ── Lesson Plan ──────────────────────────────────────────────────────────────

function LessonPlanSection({
  planForm,
  setPlanForm,
}: {
  planForm: any;
  setPlanForm: (updater: any) => void;
}) {
  const lessons: Lesson[] = [
    ...(planForm.stp_lessons ?? []),
  ].sort((a, b) => a.order - b.order);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(
    null,
  );
  const [order, setOrder] = useState("");
  const [focus, setFocus] = useState("");
  const [lessonPlan, setLessonPlan] = useState("");
  const [status, setStatus] = useState(LESSON_STATUSES[0]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Adding may append at n+1; editing only moves within 1..n.
  const maxOrder =
    editingId !== null ? lessons.length : lessons.length + 1;
  const orderNum = Number(order);
  const orderValid =
    order !== "" &&
    Number.isInteger(orderNum) &&
    orderNum >= 1 &&
    orderNum <= maxOrder;
  const canSave =
    orderValid && !!focus.trim() && !!lessonPlan.trim();

  const openModal = (lesson?: Lesson) => {
    setEditingId(lesson?.id ?? null);
    setOrder(String(lesson?.order ?? lessons.length + 1));
    setFocus(lesson?.focus ?? "");
    setLessonPlan(lesson?.lessonPlan ?? "");
    setStatus(lesson?.status ?? LESSON_STATUSES[0]);
    setModalOpen(true);
  };

  const save = () => {
    if (!canSave) return;
    const lesson: Lesson = {
      id: editingId ?? Date.now(),
      order: orderNum,
      focus: focus.trim(),
      lessonPlan: lessonPlan.trim(),
      status,
    };
    setPlanForm((f: any) => ({
      ...f,
      stp_lessons: placeLesson(f.stp_lessons ?? [], lesson),
    }));
    setModalOpen(false);
  };

  return (
    <SectionCard
      title="Lesson Plan"
      action={
        <AddButton label="Add" onClick={() => openModal()} />
      }
    >
      {lessons.length === 0 ? (
        <SectionEmpty title="No lesson plans added." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead variant="slds" className="w-16">
                Order
              </TableHead>
              <TableHead variant="slds">Focus</TableHead>
              <TableHead variant="slds">Lesson Plan</TableHead>
              <TableHead variant="slds">Status</TableHead>
              <TableHead variant="slds" className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.map((l) => (
              <TableRow key={l.id}>
                <TableCell>{l.order}</TableCell>
                <TableCell className="whitespace-normal">
                  {l.focus}
                </TableCell>
                <TableCell className="whitespace-pre-wrap">
                  {l.lessonPlan}
                </TableCell>
                <TableCell>{l.status}</TableCell>
                <TableCell>
                  <RowActions
                    onEdit={() => openModal(l)}
                    onDelete={() => setDeleteId(l.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null
                ? "Edit Lesson Plan"
                : "Add Lesson Plan"}
            </DialogTitle>
            <DialogDescription>
              Order sets the display sequence. Entering an
              existing Order inserts the lesson there and shifts
              later lessons down.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  className="slds-form-label"
                  htmlFor="stp-lesson-order"
                >
                  ORDER <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="stp-lesson-order"
                  size="md"
                  type="number"
                  min={1}
                  max={maxOrder}
                  step={1}
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  aria-invalid={!orderValid}
                />
                {!orderValid && (
                  <p className="text-destructive text-[length:var(--slds-g-font-size-3)]">
                    Order must be a whole number from 1 to{" "}
                    {maxOrder}.
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="slds-form-label">
                  STATUS
                </Label>
                <Select
                  value={status}
                  onValueChange={setStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LESSON_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label
                className="slds-form-label"
                htmlFor="stp-lesson-focus"
              >
                FOCUS <span className="text-red-600">*</span>
              </Label>
              <Input
                id="stp-lesson-focus"
                size="md"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="Enter focus…"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                className="slds-form-label"
                htmlFor="stp-lesson-plan"
              >
                LESSON PLAN{" "}
                <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="stp-lesson-plan"
                size="md"
                value={lessonPlan}
                onChange={(e) => setLessonPlan(e.target.value)}
                placeholder="Enter lesson plan…"
                className="min-h-[120px]"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={!canSave}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          setPlanForm((f: any) => ({
            ...f,
            // Renumber so the sequence stays continuous after removal.
            stp_lessons: (f.stp_lessons ?? [])
              .filter((l: Lesson) => l.id !== deleteId)
              .sort((a: Lesson, b: Lesson) => a.order - b.order)
              .map((l: Lesson, i: number) => ({
                ...l,
                order: i + 1,
              })),
          }));
          setDeleteId(null);
        }}
      />
    </SectionCard>
  );
}

// ── Plan Details tab ─────────────────────────────────────────────────────────

export function StudyTimePlanDetails({
  planForm,
  setPlanForm,
  testingAssessments = [],
}: {
  planForm: any;
  setPlanForm: (updater: any) => void;
  testingAssessments?: TestingRecord[];
}) {
  const sectionProps = { planForm, setPlanForm };
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label
          className="slds-form-label"
          htmlFor="stp-skill-area"
        >
          SKILL AREA / BEHAVIOR TO BE ADDRESSED{" "}
          <span className="text-red-600">*</span>
        </Label>
        <Textarea
          id="stp-skill-area"
          size="md"
          value={planForm.stp_skillArea ?? ""}
          onChange={(e) =>
            setPlanForm((f: any) => ({
              ...f,
              stp_skillArea: e.target.value,
            }))
          }
          placeholder="Describe the academic skill, educational need, or behavior being addressed…"
          className="min-h-[100px]"
          aria-invalid={!(planForm.stp_skillArea ?? "").trim()}
        />
      </div>
      <TestScoresSection
        {...sectionProps}
        testingAssessments={testingAssessments}
      />
      <TextEntryListSection
        title="Spatial/Environmental Interventions"
        fieldKey="stp_spatialInterventions"
        {...sectionProps}
      />
      <TextEntryListSection
        title="Behavioral Interventions"
        fieldKey="stp_behavioralInterventions"
        {...sectionProps}
      />
      <TextEntryListSection
        title="Math Suggestions"
        fieldKey="stp_mathSuggestions"
        {...sectionProps}
      />
      <TextEntryListSection
        title="Reading Suggestions"
        fieldKey="stp_readingSuggestions"
        {...sectionProps}
      />
      <AdditionalResourcesSection {...sectionProps} />
      <LessonPlanSection {...sectionProps} />
    </div>
  );
}