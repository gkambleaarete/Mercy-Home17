import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Plus,
  Eye,
  Pencil,
  ClipboardList,
  ChevronDown,
  ChevronUp,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner@2.0.3";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HomeworkCourse {
  id: number;
  termId: number;
  courseName: string;
  subject: string;
}

export interface HomeworkTerm {
  id: number;
  school: string;
  term: string;
  startDate: string;
  endDate: string;
}

interface HomeworkRecord {
  id: number;
  courseId: number;
  termId: number;
  assignedDate: string;
  dueDate: string;
  description: string;
  completed: "Yes" | "No" | "Dismissed" | "In Progress";
  comment: string;
  entered: string;
  edited: string;
}

type ModalMode = "add" | "edit" | "view" | null;

// ─── Constants ────────────────────────────────────────────────────────────────

const COMPLETED_OPTIONS = [
  "Yes",
  "No",
  "Dismissed",
  "In Progress",
] as const;
type CompletedValue = (typeof COMPLETED_OPTIONS)[number];

const TODAY = "07/22/2026";
const ENTERED_BY = "07/22/2026 12:37 PM by Current User";

const STATUS_STYLES: Record<
  CompletedValue,
  { bg: string; color: string; label: string }
> = {
  Yes: { bg: "#e8f5e9", color: "#145F33", label: "Completed" },
  No: {
    bg: "#fff3e0",
    color: "#e65100",
    label: "Not Completed",
  },
  "In Progress": {
    bg: "#e3f2fd",
    color: "#0176d3",
    label: "In Progress",
  },
  Dismissed: {
    bg: "#f3f4f6",
    color: "#706e6b",
    label: "Dismissed",
  },
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_HOMEWORK: HomeworkRecord[] = [
  {
    id: 1,
    courseId: 4,
    termId: 2,
    assignedDate: "01/21/2025",
    dueDate: "01/28/2025",
    description:
      "Figure drawing — gesture sketches (10 poses, 2 min each)",
    completed: "Yes",
    comment:
      "Submitted on time. Good energy in the gestural lines.",
    entered: "01/21/2025 09:00 AM by J. Rivera",
    edited: "01/29/2025 10:15 AM by J. Rivera",
  },
  {
    id: 2,
    courseId: 4,
    termId: 2,
    assignedDate: "02/04/2025",
    dueDate: "02/11/2025",
    description:
      "Contour line still life — choose 3 objects from list",
    completed: "In Progress",
    comment: "Started. Needs finishing before next session.",
    entered: "02/04/2025 09:00 AM by J. Rivera",
    edited: "02/04/2025 09:00 AM by J. Rivera",
  },
];

// ─── Portal Select ────────────────────────────────────────────────────────────

interface PortalSelectProps {
  value: string;
  options: readonly string[];
  placeholder?: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

function PortalSelect({
  value,
  options,
  placeholder = "Select…",
  onChange,
  disabled,
}: PortalSelectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({
    top: 0,
    left: 0,
    width: 0,
    above: false,
  });

  const MENU_MAX_H = 220;

  const calcPos = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const above = spaceBelow < MENU_MAX_H && r.top > MENU_MAX_H;
    setPos({
      top: above ? r.top - 4 : r.bottom + 4,
      left: r.left,
      width: r.width,
      above,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    calcPos();
    window.addEventListener("scroll", calcPos, true);
    window.addEventListener("resize", calcPos);
    return () => {
      window.removeEventListener("scroll", calcPos, true);
      window.removeEventListener("resize", calcPos);
    };
  }, [open, calcPos]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (
        menuRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () =>
      document.removeEventListener("mousedown", onDown);
  }, [open]);

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: pos.above ? undefined : pos.top,
            bottom: pos.above
              ? window.innerHeight - pos.top
              : undefined,
            left: pos.left,
            width: pos.width,
            maxHeight: MENU_MAX_H,
            overflowY: "auto",
            zIndex: 9999,
            backgroundColor:
              "var(--slds-g-color-background-base)",
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: 6,
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              className="w-full text-left px-3 py-2 slds-text-4 hover:bg-[#f3f4f6] focus:outline-none"
              style={{
                color: "var(--slds-g-color-text-default)",
                backgroundColor:
                  opt === value ? "#e8f5e9" : undefined,
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full h-9 px-3 flex items-center justify-between rounded slds-text-4 focus:outline-none disabled:opacity-50"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
          color: value
            ? "var(--slds-g-color-text-default)"
            : "var(--slds-g-color-text-weak)",
        }}
      >
        <span>{value || placeholder}</span>
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 opacity-50" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 opacity-50" />
        )}
      </button>
      {menu}
    </>
  );
}

// ─── Homework Modal ───────────────────────────────────────────────────────────

interface HomeworkModalProps {
  mode: ModalMode;
  record: HomeworkRecord | null;
  courseName: string;
  onClose: () => void;
  onSave: (data: Partial<HomeworkRecord>) => void;
}

function HomeworkModal({
  mode,
  record,
  courseName,
  onClose,
  onSave,
}: HomeworkModalProps) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const [assignedDate, setAssignedDate] = useState(
    record?.assignedDate ?? "",
  );
  const [dueDate, setDueDate] = useState(record?.dueDate ?? "");
  const [description, setDescription] = useState(
    record?.description ?? "",
  );
  const [completed, setCompleted] = useState<string>(
    record?.completed ?? "",
  );
  const [comment, setComment] = useState(record?.comment ?? "");
  const [dirty, setDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  function markDirty() {
    setDirty(true);
  }

  function handleClose() {
    if ((isAdd || isEdit) && dirty) {
      setConfirmDiscard(true);
    } else {
      onClose();
    }
  }

  function handleSubmit() {
    onSave({
      assignedDate,
      dueDate,
      description,
      completed: completed as CompletedValue,
      comment,
    });
    onClose();
  }

  const title = isAdd
    ? "Add Homework"
    : isEdit
      ? "Edit Homework"
      : "Homework Details";
  const primaryLabel = isAdd ? "Add Homework" : "Save Changes";

  return (
    <>
      <Dialog
        open={!confirmDiscard}
        onOpenChange={(v) => !v && handleClose()}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            borderColor: "var(--slds-g-color-border-base-1)",
          }}
        >
          {/* Modal Header */}
          <div
            className="px-5 py-4 flex-shrink-0"
            style={{
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <DialogHeader>
              <DialogTitle
                className="text-[16px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {title}
              </DialogTitle>
            </DialogHeader>
            <p
              className="slds-text-3 mt-0.5"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {courseName}
            </p>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {/* Row: Assigned Date + Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  ASSIGNED DATE
                </label>
                {isView ? (
                  <p
                    className="slds-text-4 py-1.5"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {assignedDate || "—"}
                  </p>
                ) : (
                  <input
                    type="text"
                    value={assignedDate}
                    placeholder="MM/DD/YYYY"
                    onChange={(e) => {
                      setAssignedDate(e.target.value);
                      markDirty();
                    }}
                    className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  DUE DATE
                </label>
                {isView ? (
                  <p
                    className="slds-text-4 py-1.5"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {dueDate || "—"}
                  </p>
                ) : (
                  <input
                    type="text"
                    value={dueDate}
                    placeholder="MM/DD/YYYY"
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      markDirty();
                    }}
                    className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  />
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                DESCRIPTION
              </label>
              {isView ? (
                <p
                  className="slds-text-4 py-1.5"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {description || "—"}
                </p>
              ) : (
                <textarea
                  value={description}
                  placeholder="Enter homework description"
                  rows={3}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    markDirty();
                  }}
                  className="w-full px-3 py-2 rounded slds-text-4 focus:outline-none resize-none"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              )}
            </div>

            {/* Completed */}
            <div className="space-y-1.5">
              <label
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                COMPLETED
              </label>
              {isView ? (
                <p
                  className="slds-text-4 py-1.5"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {completed
                    ? (STATUS_STYLES[
                        completed as CompletedValue
                      ]?.label ?? completed)
                    : "—"}
                </p>
              ) : (
                <PortalSelect
                  value={completed}
                  options={COMPLETED_OPTIONS}
                  placeholder="Select status"
                  onChange={(v) => {
                    setCompleted(v);
                    markDirty();
                  }}
                />
              )}
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <label
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                COMMENT
              </label>
              {isView ? (
                <p
                  className="slds-text-4 py-1.5"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {comment || "—"}
                </p>
              ) : (
                <textarea
                  value={comment}
                  placeholder="Add a comment"
                  rows={3}
                  onChange={(e) => {
                    setComment(e.target.value);
                    markDirty();
                  }}
                  className="w-full px-3 py-2 rounded slds-text-4 focus:outline-none resize-none"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              )}
            </div>

            {/* Audit fields — only show for view/edit */}
            {(isView || isEdit) && record && (
              <div
                className="rounded p-3 space-y-2"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <div>
                  <span
                    className="slds-form-label block"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    ENTERED
                  </span>
                  <p
                    className="slds-text-3 mt-0.5"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {record.entered}
                  </p>
                </div>
                <div>
                  <span
                    className="slds-form-label block"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    EDITED
                  </span>
                  <p
                    className="slds-text-3 mt-0.5"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {record.edited}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div
            className="px-5 py-3 flex items-center justify-end gap-3 flex-shrink-0"
            style={{
              borderTop:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            {isView ? (
              <Button
                variant="outline"
                className="h-9 rounded-full slds-text-4 shadow-none"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
                onClick={onClose}
              >
                Close
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="h-9 rounded-full slds-text-4 shadow-none"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  className="h-9 rounded-full slds-text-4 text-white shadow-none"
                  style={{ backgroundColor: "#145F33" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "#0e4524")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "#145F33")
                  }
                  onClick={handleSubmit}
                >
                  {primaryLabel}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Unsaved changes confirmation */}
      <Dialog
        open={confirmDiscard}
        onOpenChange={(v) => !v && setConfirmDiscard(false)}
      >
        <DialogContent
          className="max-w-sm p-0 gap-0"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            borderColor: "var(--slds-g-color-border-base-1)",
          }}
        >
          <div
            className="px-5 py-4"
            style={{
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <DialogHeader>
              <DialogTitle
                className="text-[15px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Discard unsaved changes?
              </DialogTitle>
            </DialogHeader>
            <p
              className="slds-text-4 mt-1"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Your changes have not been saved and will be lost.
            </p>
          </div>
          <div className="px-5 py-3 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              className="h-9 rounded-full slds-text-4 shadow-none"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
                color: "var(--slds-g-color-text-default)",
              }}
              onClick={() => setConfirmDiscard(false)}
            >
              Keep Editing
            </Button>
            <Button
              className="h-9 rounded-full slds-text-4 text-white shadow-none"
              style={{ backgroundColor: "#c23934" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#a52b27")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#c23934")
              }
              onClick={() => {
                setConfirmDiscard(false);
                onClose();
              }}
            >
              Discard Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface YouthHomeworkViewProps {
  course: HomeworkCourse;
  term: HomeworkTerm;
  onBack: () => void;
}

let globalNextId = 100;

export function YouthHomeworkView({
  course,
  term,
  onBack,
}: YouthHomeworkViewProps) {
  const [records, setRecords] = useState<HomeworkRecord[]>(() =>
    SEED_HOMEWORK.filter(
      (r) =>
        r.courseId === course.id && r.termId === course.termId,
    ),
  );
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeRecord, setActiveRecord] =
    useState<HomeworkRecord | null>(null);

  const filtered = records.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.description.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q) ||
      (STATUS_STYLES[r.completed]?.label ?? r.completed)
        .toLowerCase()
        .includes(q)
    );
  });

  function openAdd() {
    setActiveRecord(null);
    setModalMode("add");
  }

  function openView(r: HomeworkRecord) {
    setActiveRecord(r);
    setModalMode("view");
  }

  function openEdit(r: HomeworkRecord) {
    setActiveRecord(r);
    setModalMode("edit");
  }

  function handleSave(data: Partial<HomeworkRecord>) {
    if (modalMode === "add") {
      const newRecord: HomeworkRecord = {
        id: ++globalNextId,
        courseId: course.id,
        termId: course.termId,
        assignedDate: data.assignedDate ?? "",
        dueDate: data.dueDate ?? "",
        description: data.description ?? "",
        completed: (data.completed as CompletedValue) ?? "No",
        comment: data.comment ?? "",
        entered: ENTERED_BY,
        edited: ENTERED_BY,
      };
      setRecords((prev) => [newRecord, ...prev]);
      toast.success("Homework record added.");
    } else if (modalMode === "edit" && activeRecord) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === activeRecord.id
            ? {
                ...r,
                assignedDate:
                  data.assignedDate ?? r.assignedDate,
                dueDate: data.dueDate ?? r.dueDate,
                description: data.description ?? r.description,
                completed:
                  (data.completed as CompletedValue) ??
                  r.completed,
                comment: data.comment ?? r.comment,
                edited: ENTERED_BY,
              }
            : r,
        ),
      );
      toast.success("Homework record updated.");
    }
    setModalMode(null);
    setActiveRecord(null);
  }

  function closeModal() {
    setModalMode(null);
    setActiveRecord(null);
  }

  return (
    <div className="space-y-4 w-full">
      {/* Back navigation */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 slds-text-3 font-medium cursor-pointer hover:underline focus:outline-none focus-visible:underline"
          style={{ color: "#0176d3" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Academics
        </button>
      </div>

      {/* Context breadcrumb */}
      <div
        className="px-4 py-3 rounded"
        style={{
          backgroundColor: "var(--slds-g-color-background-alt)",
          border: "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <div>
            <span
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              COURSE
            </span>
            <p
              className="slds-text-4 font-medium mt-0.5"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {course.courseName}
            </p>
          </div>
          <div>
            <span
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              ACADEMIC TERM
            </span>
            <p
              className="slds-text-4 mt-0.5"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {term.term}
            </p>
          </div>
        </div>
      </div>

      {/* Homework Card */}
      <div
        className="overflow-hidden w-full"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        {/* Card Header */}
        <div
          className="px-4 py-3 flex items-center justify-between gap-4"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <div>
            <h3
              className="text-[13px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Homework
            </h3>
            <p
              className="slds-text-3 mt-0.5"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              View and manage homework assignments for this
              course.
            </p>
          </div>
          <Button
            className="h-8 px-3 rounded-full text-[12px] cursor-pointer font-medium text-white shadow-none flex-shrink-0"
            style={{ backgroundColor: "#145F33" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#0e4524")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#145F33")
            }
            onClick={openAdd}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Homework
          </Button>
        </div>

        {/* Card Body */}
        {records.length === 0 ? (
          /* Empty state */
          <div className="px-4 py-12 text-center">
            <ClipboardList
              className="w-8 h-8 mx-auto mb-2 opacity-30"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            />
            <p
              className="slds-text-4 font-medium"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              No homework has been added for this course.
            </p>
            <p
              className="slds-text-3 mt-1 mb-4"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Add homework to track assignments and completion
              status.
            </p>
          </div>
        ) : (
          <>
            {/* Search */}
            <div
              className="px-4 py-3"
              style={{
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <input
                type="text"
                placeholder="Search homework..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-xs h-8 px-3 rounded slds-text-4 focus:outline-none"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <tr>
                    {[
                      "ASSIGNED DATE",
                      "DUE DATE",
                      "DESCRIPTION",
                      "STATUS",
                      "ENTERED",
                      "EDITED",
                      "ACTIONS",
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-2.5 text-left slds-form-label whitespace-nowrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center slds-text-4"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        No homework records match your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((rec) => {
                      const statusStyle =
                        STATUS_STYLES[
                          rec.completed as CompletedValue
                        ];
                      return (
                        <tr
                          key={rec.id}
                          style={{
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <td
                            className="px-4 py-3 slds-text-4 whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {rec.assignedDate || "—"}
                          </td>
                          <td
                            className="px-4 py-3 slds-text-4 whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {rec.dueDate || "—"}
                          </td>
                          <td
                            className="px-4 py-3 slds-text-4 max-w-xs"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            <span
                              className="line-clamp-2"
                              title={rec.description}
                            >
                              {rec.description || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className="px-2 py-0.5 rounded-full slds-text-3 font-medium"
                              style={{
                                backgroundColor:
                                  statusStyle?.bg ?? "#f3f4f6",
                                color:
                                  statusStyle?.color ??
                                  "#706e6b",
                              }}
                            >
                              {statusStyle?.label ??
                                rec.completed}
                            </span>
                          </td>
                          <td
                            className="px-4 py-3 slds-text-3 whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {rec.entered}
                          </td>
                          <td
                            className="px-4 py-3 slds-text-3 whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {rec.edited}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openView(rec)}
                                aria-label="View homework"
                                title="View Homework"
                                className="p-1 rounded hover:bg-[#f3f4f6] focus:outline-none"
                                style={{ color: "#0176d3" }}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEdit(rec)}
                                aria-label="Edit homework"
                                title="Edit Homework"
                                className="p-1 rounded hover:bg-[#f3f4f6] focus:outline-none"
                                style={{ color: "#0176d3" }}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modalMode && (
        <HomeworkModal
          mode={modalMode}
          record={activeRecord}
          courseName={course.courseName}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}