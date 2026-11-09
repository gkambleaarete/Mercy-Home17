import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Plus, Pencil, Trash2, BookMarked, ChevronDown, ChevronUp, Search } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner@2.0.3";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GradesCourse {
  id: number;
  termId: number;
  courseName: string;
  subject: string;
}

export interface GradesTerm {
  id: number;
  school: string;
  term: string;
  startDate: string;
  endDate: string;
}

interface GradeRecord {
  id: number;
  courseId: number;
  termId: number;
  date: string;
  grade: string;
}

type ModalMode = "add" | "edit" | null;

// ─── Constants ────────────────────────────────────────────────────────────────

const GRADE_VALUES = [
  "A+", "A", "A-",
  "B+", "B", "B-",
  "C+", "C", "C-",
  "D+", "D", "D-",
  "E", "F",
  "Pass", "Fail",
  "Withdrawn", "Dropped", "Recovery In Progress",
  "1", "2", "3", "4",
  "I",
  "+ (Pass)", "- (Fail)",
  "N", "Off Track",
  "100", "99", "98", "97", "96", "95", "94", "93", "92", "91", "90",
  "89", "88", "87", "86", "85", "84", "83", "82", "81", "80",
  "79", "78", "77", "76", "75", "74", "73", "72", "71", "70",
  "FX", "S (Satisfactory)",
];

const SEED_GRADES: GradeRecord[] = [
  { id: 1, courseId: 4, termId: 2, date: "07/15/2026", grade: "A" },
  { id: 2, courseId: 4, termId: 2, date: "07/22/2026", grade: "D-" },
];

let globalGradeId = 200;

// ─── Searchable Grade Portal Select ──────────────────────────────────────────

interface GradeSelectProps {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
}

function GradeSelect({ value, onChange, error }: GradeSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, above: false });

  const MENU_MAX_H = 260;

  const calcPos = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const above = spaceBelow < MENU_MAX_H && r.top > MENU_MAX_H;
    setPos({ top: above ? undefined as any : r.bottom + 4, left: r.left, width: r.width, above });
  }, []);

  useEffect(() => {
    if (!open) return;
    calcPos();
    // focus search on open
    setTimeout(() => searchRef.current?.focus(), 0);
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
      ) return;
      setOpen(false);
      setSearch("");
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const filtered = GRADE_VALUES.filter((g) =>
    g.toLowerCase().includes(search.toLowerCase())
  );

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: pos.above ? undefined : pos.top,
            bottom: pos.above
              ? (() => {
                  if (!triggerRef.current) return undefined;
                  const r = triggerRef.current.getBoundingClientRect();
                  return window.innerHeight - r.top + 4;
                })()
              : undefined,
            left: pos.left,
            width: Math.max(pos.width, 200),
            zIndex: 9999,
            backgroundColor: "var(--slds-g-color-background-base)",
            border: "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: 6,
            boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search inside menu */}
          <div
            className="p-2 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
          >
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search grades..."
                className="w-full h-8 pl-7 pr-2 rounded slds-text-4 focus:outline-none"
                style={{
                  border: "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor: "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </div>
          </div>
          {/* Options list */}
          <div style={{ overflowY: "auto", maxHeight: MENU_MAX_H - 52 }}>
            {filtered.length === 0 ? (
              <div className="px-3 py-3 slds-text-4 text-center" style={{ color: "var(--slds-g-color-text-weak)" }}>
                No grades match.
              </div>
            ) : (
              filtered.map((g) => (
                <button
                  key={g}
                  type="button"
                  className="w-full text-left px-3 py-2 slds-text-4 hover:bg-[#f3f4f6] focus:outline-none"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                    backgroundColor: g === value ? "#e8f5e9" : undefined,
                    fontWeight: g === value ? 600 : undefined,
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(g);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  {g}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-9 px-3 flex items-center justify-between rounded slds-text-4 focus:outline-none"
        style={{
          border: `1px solid ${error ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
          backgroundColor: "var(--slds-g-color-background-base)",
          color: value ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)",
        }}
      >
        <span>{value || "Select grade"}</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 opacity-50 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 opacity-50 flex-shrink-0" />}
      </button>
      {menu}
    </>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

interface GradeModalProps {
  mode: ModalMode;
  record: GradeRecord | null;
  courseName: string;
  onClose: () => void;
  onSave: (date: string, grade: string) => void;
}

function GradeModal({ mode, record, courseName, onClose, onSave }: GradeModalProps) {
  const [date, setDate] = useState(record?.date ?? "");
  const [grade, setGrade] = useState(record?.grade ?? "");
  const [errors, setErrors] = useState<{ date?: string; grade?: string }>({});

  const title = mode === "add" ? "Add Grade" : "Edit Grade";
  const primaryLabel = mode === "add" ? "Add Grade" : "Save Changes";

  function validate() {
    const e: { date?: string; grade?: string } = {};
    if (!date.trim()) e.date = "Date is required.";
    if (!grade) e.grade = "Grade is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSave(date.trim(), grade);
    onClose();
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md max-h-[90vh] flex flex-col p-0 gap-0"
        style={{
          backgroundColor: "var(--slds-g-color-background-base)",
          borderColor: "var(--slds-g-color-border-base-1)",
        }}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
        >
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              {title}
            </DialogTitle>
          </DialogHeader>
          <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
            {courseName}
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {/* Date */}
          <div className="space-y-1.5">
            <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
              DATE <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={date}
              placeholder="MM/DD/YYYY"
              onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: undefined })); }}
              className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
              style={{
                border: `1px solid ${errors.date ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                backgroundColor: "var(--slds-g-color-background-base)",
                color: "var(--slds-g-color-text-default)",
              }}
            />
            {errors.date && (
              <p className="slds-text-3" style={{ color: "#c23934" }}>{errors.date}</p>
            )}
          </div>

          {/* Grade */}
          <div className="space-y-1.5">
            <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
              GRADE <span className="text-red-600">*</span>
            </label>
            <select
              value={grade}
              onChange={(e) => { setGrade(e.target.value); setErrors((p) => ({ ...p, grade: undefined })); }}
              className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none appearance-none"
              style={{
                border: `1px solid ${errors.grade ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                backgroundColor: "var(--slds-g-color-background-base)",
                color: grade ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23706e6b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
                paddingRight: "2rem",
              }}
            >
              <option value="" disabled>Select grade</option>
              {GRADE_VALUES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            {errors.grade && (
              <p className="slds-text-3" style={{ color: "#c23934" }}>{errors.grade}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 flex items-center justify-end gap-3 flex-shrink-0"
          style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}
        >
          <Button
            variant="outline"
            className="h-9 rounded-full slds-text-4 shadow-none"
            style={{
              border: "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor: "var(--slds-g-color-background-base)",
              color: "var(--slds-g-color-text-default)",
            }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="h-9 rounded-full slds-text-4 text-white shadow-none"
            style={{ backgroundColor: "#145F33" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e4524")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#145F33")}
            onClick={handleSubmit}
          >
            {primaryLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirmation ──────────────────────────────────────────────────────

interface DeleteConfirmProps {
  record: GradeRecord;
  onCancel: () => void;
  onConfirm: () => void;
}

function DeleteConfirm({ record, onCancel, onConfirm }: DeleteConfirmProps) {
  return (
    <Dialog open onOpenChange={(v) => !v && onCancel()}>
      <DialogContent
        className="max-w-sm p-0 gap-0"
        style={{
          backgroundColor: "var(--slds-g-color-background-base)",
          borderColor: "var(--slds-g-color-border-base-1)",
        }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              Delete Grade?
            </DialogTitle>
          </DialogHeader>
          <p className="slds-text-4 mt-2" style={{ color: "var(--slds-g-color-text-weak)" }}>
            Are you sure you want to delete this grade record? This action cannot be undone.
          </p>
          <div
            className="mt-3 px-3 py-2 rounded"
            style={{
              backgroundColor: "var(--slds-g-color-background-alt)",
              border: "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <div className="flex gap-6">
              <div>
                <span className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>DATE</span>
                <p className="slds-text-4 mt-0.5" style={{ color: "var(--slds-g-color-text-default)" }}>{record.date}</p>
              </div>
              <div>
                <span className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>GRADE</span>
                <p className="slds-text-4 mt-0.5 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>{record.grade}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            className="h-9 rounded-full slds-text-4 shadow-none"
            style={{
              border: "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor: "var(--slds-g-color-background-base)",
              color: "var(--slds-g-color-text-default)",
            }}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="h-9 rounded-full slds-text-4 text-white shadow-none"
            style={{ backgroundColor: "#c23934" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a52b27")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c23934")}
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface YouthGradesViewProps {
  course: GradesCourse;
  term: GradesTerm;
  onBack: () => void;
}

export function YouthGradesView({ course, term, onBack }: YouthGradesViewProps) {
  const [records, setRecords] = useState<GradeRecord[]>(() =>
    SEED_GRADES.filter((r) => r.courseId === course.id && r.termId === course.termId)
  );
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeRecord, setActiveRecord] = useState<GradeRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GradeRecord | null>(null);

  function openAdd() {
    setActiveRecord(null);
    setModalMode("add");
  }

  function openEdit(r: GradeRecord) {
    setActiveRecord(r);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setActiveRecord(null);
  }

  function handleSave(date: string, grade: string) {
    if (modalMode === "add") {
      const newRecord: GradeRecord = {
        id: ++globalGradeId,
        courseId: course.id,
        termId: course.termId,
        date,
        grade,
      };
      setRecords((prev) => [newRecord, ...prev]);
      toast.success("Grade added.");
    } else if (modalMode === "edit" && activeRecord) {
      setRecords((prev) =>
        prev.map((r) => r.id === activeRecord.id ? { ...r, date, grade } : r)
      );
      toast.success("Grade updated.");
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast.success("Grade deleted.");
  }

  return (
    <div className="space-y-4 w-full">
      {/* Back navigation */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 slds-text-3 font-medium hover:underline focus:outline-none focus-visible:underline"
          style={{ color: "#0176d3" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Academics
        </button>
      </div>

      {/* Context bar */}
      <div
        className="px-4 py-3 rounded"
        style={{
          backgroundColor: "var(--slds-g-color-background-alt)",
          border: "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <div>
            <span className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>COURSE</span>
            <p className="slds-text-4 font-medium mt-0.5" style={{ color: "var(--slds-g-color-text-default)" }}>
              {course.courseName}
            </p>
          </div>
          <div>
            <span className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>ACADEMIC TERM</span>
            <p className="slds-text-4 mt-0.5" style={{ color: "var(--slds-g-color-text-default)" }}>
              {term.term}
            </p>
          </div>
        </div>
      </div>

      {/* Grades Card */}
      <div
        className="overflow-hidden w-full"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor: "var(--slds-g-color-background-base)",
        }}
      >
        {/* Card Header */}
        <div
          className="px-4 py-3 flex items-center justify-between gap-4"
          style={{
            borderBottom: "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor: "var(--slds-g-color-background-alt)",
          }}
        >
          <div>
            <h3 className="text-[13px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              Grades
            </h3>
            <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
              View and manage grade records for this course.
            </p>
          </div>
          <Button
            className="h-8 px-3 rounded-full text-[12px] font-medium text-white shadow-none flex-shrink-0"
            style={{ backgroundColor: "#145F33" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e4524")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#145F33")}
            onClick={openAdd}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Grade
          </Button>
        </div>

        {/* Card Body */}
        {records.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <BookMarked className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: "var(--slds-g-color-text-weak)" }} />
            <p className="slds-text-4 font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
              No grades have been recorded for this course.
            </p>
            <p className="slds-text-3 mt-1 mb-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
              Add a grade to begin tracking academic performance.
            </p>
            <Button
              className="h-8 px-4 rounded-full text-[12px] font-medium text-white shadow-none"
              style={{ backgroundColor: "#145F33" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e4524")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#145F33")}
              onClick={openAdd}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Grade
            </Button>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead style={{ backgroundColor: "var(--slds-g-color-background-alt)" }}>
              <tr>
                <th className="px-4 py-2.5 text-left slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  DATE
                </th>
                <th className="px-4 py-2.5 text-left slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  GRADE
                </th>
                <th className="px-4 py-2.5 text-left slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr
                  key={rec.id}
                  style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
                >
                  <td className="px-4 py-3 slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>
                    {rec.date}
                  </td>
                  <td className="px-4 py-3 slds-text-4 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
                    {rec.grade}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(rec)}
                        aria-label="Edit grade"
                        title="Edit Grade"
                        className="p-1 rounded hover:bg-[#f3f4f6] focus:outline-none"
                        style={{ color: "#0176d3" }}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(rec)}
                        aria-label="Delete grade"
                        title="Delete Grade"
                        className="p-1 rounded hover:bg-[#fff0f0] focus:outline-none"
                        style={{ color: "#c23934" }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit modal */}
      {modalMode && (
        <GradeModal
          mode={modalMode}
          record={activeRecord}
          courseName={course.courseName}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteConfirm
          record={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
