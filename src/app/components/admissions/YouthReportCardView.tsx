import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, Eye, Pencil, FileText, GraduationCap } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner@2.0.3";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Term {
  id: number;
  school: string;
  term: string;
  startDate: string;
  endDate: string;
}

interface Course {
  id: number;
  termId: number;
  courseName: string;
  subject: string;
}

interface FinalGradeEntry {
  grade: string;
  creditEarned: string;
}

interface ReportCardRecord {
  reportCardDate: string;
  absences: string;
  attendanceNotAvailable: boolean;
  gpa: string;
  schoolCgpa: string;
  finalGrades: Record<number, FinalGradeEntry>;
}

interface ReportingPeriod {
  id: number;
  period: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GRADE_VALUES: string[] = [
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
  "100", "99", "98", "97", "96", "95", "94", "93", "92", "91",
  "90", "89", "88", "87", "86", "85", "84", "83", "82", "81",
  "80", "79", "78", "77", "76", "75", "74", "73", "72", "71", "70",
  "FX",
  "S (Satisfactory)",
];

const REPORTING_PERIODS_BY_TERM: Record<number, ReportingPeriod[]> = {
  1: [{ id: 11, period: "Quarter 1" }, { id: 12, period: "Quarter 2" }],
  2: [{ id: 21, period: "Semester 2" }],
  3: [{ id: 31, period: "Spring Quarter" }],
};

const INITIAL_REPORT_CARDS: Record<number, ReportCardRecord> = {
  21: {
    reportCardDate: "06/15/2026",
    absences: "4",
    attendanceNotAvailable: false,
    gpa: "3.75",
    schoolCgpa: "3.52",
    finalGrades: {
      4: { grade: "A", creditEarned: "1.0" },
      5: { grade: "B+", creditEarned: "1.0" },
    },
  },
};

const EMPTY_RECORD: ReportCardRecord = {
  reportCardDate: "",
  absences: "",
  attendanceNotAvailable: false,
  gpa: "",
  schoolCgpa: "",
  finalGrades: {},
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
        {label}
      </p>
      <p className="slds-text-4 mt-0.5" style={{ color: "var(--slds-g-color-text-default)" }}>
        {value || "—"}
      </p>
    </div>
  );
}

// ─── Searchable Grade Select ──────────────────────────────────────────────────

interface GradeSearchSelectProps {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
}

function GradeSearchSelect({ value, onChange, error }: GradeSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const filtered = GRADE_VALUES.filter(
    (g) => !search.trim() || g.toLowerCase().includes(search.toLowerCase())
  );

  function computePos() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dropH = Math.min(filtered.length * 32 + 8, 240);
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < dropH + 8 && rect.top > dropH
      ? rect.top - dropH - 2
      : rect.bottom + 2;
    setDropPos({ top, left: rect.left, width: rect.width });
  }

  function openDrop() {
    computePos();
    setOpen(true);
  }

  function selectGrade(g: string) {
    onChange(g);
    setSearch(g);
    setOpen(false);
  }

  useEffect(() => { setSearch(value); }, [value]);

  return (
    <div ref={triggerRef}>
      <input
        type="text"
        value={search}
        onChange={(e) => { setSearch(e.target.value); openDrop(); }}
        onFocus={openDrop}
        onBlur={() => setTimeout(() => {
          setOpen(false);
          if (!GRADE_VALUES.includes(search)) setSearch(value);
        }, 150)}
        placeholder="Select grade"
        autoComplete="off"
        className="w-full h-8 px-2 rounded slds-text-4 focus:outline-none"
        style={{
          border: `1px solid ${error ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
          backgroundColor: "var(--slds-g-color-background-base)",
          color: "var(--slds-g-color-text-default)",
        }}
      />
      {open && dropPos && createPortal(
        <div
          style={{
            position: "fixed",
            top: dropPos.top,
            left: dropPos.left,
            width: Math.max(dropPos.width, 160),
            zIndex: 9999,
            backgroundColor: "var(--slds-g-color-background-base)",
            border: "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: 4,
            maxHeight: 240,
            overflowY: "auto",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          }}
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-2 slds-text-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
              No matching grades
            </div>
          ) : filtered.map((g) => (
            <div
              key={g}
              onMouseDown={(e) => { e.preventDefault(); selectGrade(g); }}
              className="px-3 py-1.5 slds-text-4 cursor-pointer"
              style={{ backgroundColor: g === value ? "#e8f5e9" : undefined, color: "var(--slds-g-color-text-default)" }}
              onMouseEnter={(e) => { if (g !== value) (e.currentTarget as HTMLDivElement).style.backgroundColor = "var(--slds-g-color-background-alt)"; }}
              onMouseLeave={(e) => { if (g !== value) (e.currentTarget as HTMLDivElement).style.backgroundColor = ""; }}
            >
              {g}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────

interface ViewModalProps {
  open: boolean;
  term: Term;
  period: ReportingPeriod;
  record: ReportCardRecord;
  courses: Course[];
  onClose: () => void;
  onEdit: () => void;
}

function ReportCardViewModal({ open, term, period, record, courses, onClose, onEdit }: ViewModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0"
        style={{ backgroundColor: "var(--slds-g-color-background-base)", borderColor: "var(--slds-g-color-border-base-1)" }}
      >
        <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              Report Card Details
            </DialogTitle>
          </DialogHeader>
          <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
            {term.term} · {period.period}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <ReadOnlyField label="REPORTING PERIOD" value={period.period} />
            <ReadOnlyField label="REPORT CARD DATE" value={record.reportCardDate} />
            <ReadOnlyField label="# OF ABSENCES" value={record.attendanceNotAvailable ? "—" : record.absences} />
            <ReadOnlyField label="ATTENDANCE DATA NOT AVAILABLE" value={record.attendanceNotAvailable ? "Yes" : "No"} />
            <ReadOnlyField label="GPA" value={record.gpa} />
            <ReadOnlyField label="SCHOOL CGPA" value={record.schoolCgpa} />
          </div>

          <div>
            <h4 className="text-[13px] font-semibold mb-3" style={{ color: "var(--slds-g-color-text-default)" }}>
              Final Grades
            </h4>
            {courses.length === 0 ? (
              <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-weak)" }}>No courses assigned.</p>
            ) : (
              <div
                className="overflow-hidden"
                style={{ border: "1px solid var(--slds-g-color-border-base-1)", borderRadius: 4 }}
              >
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "var(--slds-g-color-background-alt)", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                      <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: "var(--slds-g-color-text-weak)" }}>COURSE</th>
                      <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: "var(--slds-g-color-text-weak)" }}>FINAL GRADE</th>
                      <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: "var(--slds-g-color-text-weak)" }}>CREDIT EARNED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c, idx) => (
                      <tr key={c.id} style={{ borderBottom: idx < courses.length - 1 ? "1px solid var(--slds-g-color-border-base-1)" : undefined }}>
                        <td className="px-4 py-2.5 slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>
                          <div>{c.courseName}</div>
                          <div className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>{c.subject}</div>
                        </td>
                        <td className="px-4 py-2.5 slds-text-4 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
                          {record.finalGrades[c.id]?.grade || "—"}
                        </td>
                        <td className="px-4 py-2.5 slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>
                          {record.finalGrades[c.id]?.creditEarned || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 flex items-center justify-between flex-shrink-0" style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}>
          <Button
            variant="outline"
            className="h-9 rounded-full slds-text-4 shadow-none"
            style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            className="h-9 rounded-full slds-text-4 text-white shadow-none"
            style={{ backgroundColor: "#145F33" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e4524")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#145F33")}
            onClick={() => { onClose(); onEdit(); }}
          >
            Edit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Sub-view ────────────────────────────────────────────────────────────

interface EditViewProps {
  term: Term;
  period: ReportingPeriod;
  record: ReportCardRecord;
  courses: Course[];
  onBack: () => void;
  onSave: (updated: ReportCardRecord) => void;
}

function ReportCardEditView({ term, period, record, courses, onBack, onSave }: EditViewProps) {
  const [reportCardDate, setReportCardDate] = useState(record.reportCardDate);
  const [absences, setAbsences] = useState(record.absences);
  const [attendanceNotAvailable, setAttendanceNotAvailable] = useState(record.attendanceNotAvailable);
  const [gpa, setGpa] = useState(record.gpa);
  const [schoolCgpa, setSchoolCgpa] = useState(record.schoolCgpa);
  const [finalGrades, setFinalGrades] = useState<Record<number, FinalGradeEntry>>(() =>
    Object.fromEntries(
      courses.map((c) => [c.id, record.finalGrades[c.id] ?? { grade: "", creditEarned: "" }])
    )
  );
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [dirty, setDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  function mark() { setDirty(true); }

  function handleGradeChange(courseId: number, grade: string) {
    setFinalGrades((prev) => ({ ...prev, [courseId]: { ...prev[courseId], grade } }));
    setErrors((prev) => { const n = { ...prev }; delete n[courseId]; return n; });
    mark();
  }

  function handleCreditChange(courseId: number, credit: string) {
    setFinalGrades((prev) => ({ ...prev, [courseId]: { ...prev[courseId], creditEarned: credit } }));
    mark();
  }

  function handleSave() {
    const newErrors: Record<number, string> = {};
    courses.forEach((c) => {
      if (!finalGrades[c.id]?.grade) newErrors[c.id] = "Final Grade is required.";
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Enter a Final Grade for all assigned courses.");
      return;
    }
    onSave({ reportCardDate, absences, attendanceNotAvailable, gpa, schoolCgpa, finalGrades });
    toast.success("Report card saved.");
  }

  function handleCancel() {
    if (dirty) setConfirmDiscard(true);
    else onBack();
  }

  const inputStyle: React.CSSProperties = {
    border: "1px solid var(--slds-g-color-border-base-1)",
    backgroundColor: "var(--slds-g-color-background-base)",
    color: "var(--slds-g-color-text-default)",
  };

  const disabledInputStyle: React.CSSProperties = {
    ...inputStyle,
    backgroundColor: "var(--slds-g-color-background-alt)",
    opacity: 0.6,
  };

  return (
    <>
      <div className="space-y-5 w-full">
        {/* Back nav */}
        <button
          onClick={handleCancel}
          className="flex items-center gap-1.5 slds-text-4 hover:underline"
          style={{ color: "#0176d3", background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Report Cards
        </button>

        {/* Context */}
        <div>
          <h2 className="text-[16px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
            Edit Report Card
          </h2>
          <p className="slds-text-4 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
            {term.term} · {period.period}
          </p>
        </div>

        {/* Report Card Details Card */}
        <div
          className="overflow-hidden w-full"
          style={{ border: "1px solid var(--slds-g-color-border-base-1)", borderRadius: "var(--slds-c-card-radius-border)", backgroundColor: "var(--slds-g-color-background-base)" }}
        >
          <div
            className="px-4 py-3"
            style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-alt)" }}
          >
            <h3 className="text-[13px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              Report Card Details
            </h3>
          </div>
          <div className="px-4 py-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* Reporting Period (read-only) */}
              <div className="space-y-1.5">
                <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>REPORTING PERIOD</label>
                <p className="slds-text-4 font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>{period.period}</p>
              </div>

              {/* Report Card Date */}
              <div className="space-y-1.5">
                <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>REPORT CARD DATE</label>
                <input
                  type="text"
                  value={reportCardDate}
                  onChange={(e) => { setReportCardDate(e.target.value); mark(); }}
                  placeholder="MM/DD/YYYY"
                  className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
                  style={inputStyle}
                />
              </div>

              {/* # of Absences */}
              <div className="space-y-1.5">
                <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}># OF ABSENCES</label>
                <input
                  type="number"
                  value={absences}
                  onChange={(e) => { setAbsences(e.target.value); mark(); }}
                  disabled={attendanceNotAvailable}
                  placeholder="0"
                  min="0"
                  className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
                  style={attendanceNotAvailable ? disabledInputStyle : inputStyle}
                />
              </div>

              {/* Attendance checkbox — aligned to bottom of its cell */}
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>
                  <input
                    type="checkbox"
                    checked={attendanceNotAvailable}
                    onChange={(e) => { setAttendanceNotAvailable(e.target.checked); mark(); }}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: "#145F33" }}
                  />
                  Attendance Data Not Available
                </label>
              </div>

              {/* GPA */}
              <div className="space-y-1.5">
                <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>GPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={gpa}
                  onChange={(e) => { setGpa(e.target.value); mark(); }}
                  placeholder="0.00"
                  className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
                  style={inputStyle}
                />
              </div>

              {/* School CGPA */}
              <div className="space-y-1.5">
                <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>SCHOOL CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={schoolCgpa}
                  onChange={(e) => { setSchoolCgpa(e.target.value); mark(); }}
                  placeholder="0.00"
                  className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Final Grades Card */}
        <div
          className="overflow-hidden w-full"
          style={{ border: "1px solid var(--slds-g-color-border-base-1)", borderRadius: "var(--slds-c-card-radius-border)", backgroundColor: "var(--slds-g-color-background-base)" }}
        >
          <div
            className="px-4 py-3"
            style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-alt)" }}
          >
            <h3 className="text-[13px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Final Grades</h3>
            <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
              Maintain final grades and credits earned for courses assigned to this academic term.
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-40" style={{ color: "var(--slds-g-color-text-weak)" }} />
              <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-weak)" }}>No courses are assigned to this academic term.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "var(--slds-g-color-background-alt)", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                  <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: "var(--slds-g-color-text-weak)" }}>COURSE</th>
                  <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: "var(--slds-g-color-text-weak)", width: 220 }}>FINAL GRADE</th>
                  <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: "var(--slds-g-color-text-weak)", width: 140 }}>CREDIT EARNED</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c, idx) => (
                  <tr key={c.id} style={{ borderBottom: idx < courses.length - 1 ? "1px solid var(--slds-g-color-border-base-1)" : undefined }}>
                    <td className="px-4 py-2.5">
                      <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{c.courseName}</p>
                      <p className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>{c.subject}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <GradeSearchSelect
                        value={finalGrades[c.id]?.grade ?? ""}
                        onChange={(g) => handleGradeChange(c.id, g)}
                        error={!!errors[c.id]}
                      />
                      {errors[c.id] && (
                        <p className="slds-text-3 mt-0.5" style={{ color: "#c23934" }}>{errors[c.id]}</p>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="number"
                        step="0.5"
                        value={finalGrades[c.id]?.creditEarned ?? ""}
                        onChange={(e) => handleCreditChange(c.id, e.target.value)}
                        placeholder="0"
                        className="w-full h-8 px-2 rounded slds-text-4 focus:outline-none"
                        style={inputStyle}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Button
            variant="outline"
            className="h-9 rounded-full slds-text-4 shadow-none"
            style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            className="h-9 rounded-full slds-text-4 text-white shadow-none"
            style={{ backgroundColor: "#145F33" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e4524")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#145F33")}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Discard confirmation */}
      <Dialog open={confirmDiscard} onOpenChange={(v) => !v && setConfirmDiscard(false)}>
        <DialogContent
          className="max-w-sm p-0 gap-0"
          style={{ backgroundColor: "var(--slds-g-color-background-base)", borderColor: "var(--slds-g-color-border-base-1)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
            <DialogHeader>
              <DialogTitle className="text-[15px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
                Discard unsaved changes?
              </DialogTitle>
            </DialogHeader>
            <p className="slds-text-4 mt-1" style={{ color: "var(--slds-g-color-text-weak)" }}>
              You have unsaved changes. Are you sure you want to leave?
            </p>
          </div>
          <div className="px-5 py-3 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              className="h-9 rounded-full slds-text-4 shadow-none"
              style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
              onClick={() => setConfirmDiscard(false)}
            >
              Keep Editing
            </Button>
            <Button
              className="h-9 rounded-full slds-text-4 text-white shadow-none"
              style={{ backgroundColor: "#c23934" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a52b27")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c23934")}
              onClick={() => { setConfirmDiscard(false); onBack(); }}
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

interface YouthReportCardViewProps {
  term: Term;
  assignedCourses: Course[];
  onBack: () => void;
}

export function YouthReportCardView({ term, assignedCourses, onBack }: YouthReportCardViewProps) {
  const periods = REPORTING_PERIODS_BY_TERM[term.id] ?? [];
  const [reportCards, setReportCards] = useState<Record<number, ReportCardRecord>>(INITIAL_REPORT_CARDS);
  const [viewPeriodId, setViewPeriodId] = useState<number | null>(null);
  const [editPeriodId, setEditPeriodId] = useState<number | null>(null);

  const viewPeriod = periods.find((p) => p.id === viewPeriodId) ?? null;
  const editPeriod = periods.find((p) => p.id === editPeriodId) ?? null;

  // Edit is a sub-view (not modal) to allow portal-based grade dropdowns
  if (editPeriod) {
    return (
      <ReportCardEditView
        term={term}
        period={editPeriod}
        record={reportCards[editPeriod.id] ?? EMPTY_RECORD}
        courses={assignedCourses}
        onBack={() => setEditPeriodId(null)}
        onSave={(updated) => {
          setReportCards((prev) => ({ ...prev, [editPeriod.id]: updated }));
          setEditPeriodId(null);
        }}
      />
    );
  }

  return (
    <>
      <div className="space-y-5 w-full">
        {/* Back navigation */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 slds-text-4 hover:underline"
          style={{ color: "#0176d3", background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Academics
        </button>

        {/* Context header */}
        <div>
          <h2 className="text-[16px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
            Report Cards
          </h2>
          <p className="slds-text-4 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
            Academic Term: {term.term}
          </p>
        </div>

        {/* Reporting Periods Card */}
        <div
          className="overflow-hidden w-full"
          style={{ border: "1px solid var(--slds-g-color-border-base-1)", borderRadius: "var(--slds-c-card-radius-border)", backgroundColor: "var(--slds-g-color-background-base)" }}
        >
          <div
            className="px-4 py-3"
            style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-alt)" }}
          >
            <h3 className="text-[13px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              Reporting Periods
            </h3>
            <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
              View report cards associated with the selected academic term.
            </p>
          </div>

          {periods.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" style={{ color: "var(--slds-g-color-text-weak)" }} />
              <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
                No reporting periods are configured for this academic term.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "var(--slds-g-color-background-alt)", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                  <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: "var(--slds-g-color-text-weak)" }}>
                    REPORTING PERIOD
                  </th>
                  <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: "var(--slds-g-color-text-weak)" }}>
                    REPORT CARD DATE
                  </th>
                  <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: "var(--slds-g-color-text-weak)" }}>
                    ABSENCES
                  </th>
                  <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: "var(--slds-g-color-text-weak)" }}>
                    GPA
                  </th>
                  <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: "var(--slds-g-color-text-weak)" }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {periods.map((p, idx) => {
                  const rc = reportCards[p.id];
                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: idx < periods.length - 1 ? "1px solid var(--slds-g-color-border-base-1)" : undefined }}
                    >
                      <td className="px-4 py-3 slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>
                        {p.period}
                      </td>
                      <td className="px-4 py-3 slds-text-4" style={{ color: rc?.reportCardDate ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)" }}>
                        {rc?.reportCardDate || "—"}
                      </td>
                      <td className="px-4 py-3 slds-text-4" style={{ color: rc ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)" }}>
                        {rc?.attendanceNotAvailable ? "N/A" : (rc?.absences || "—")}
                      </td>
                      <td className="px-4 py-3 slds-text-4" style={{ color: rc?.gpa ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)" }}>
                        {rc?.gpa || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            title="View Report Card"
                            onClick={() => setViewPeriodId(p.id)}
                            className="flex items-center gap-1 slds-text-4 hover:underline"
                            style={{ color: "#0176d3", background: "none", border: "none", padding: 0, cursor: "pointer" }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          <span style={{ color: "var(--slds-g-color-border-base-1)" }}>|</span>
                          <button
                            title="Edit Report Card"
                            onClick={() => setEditPeriodId(p.id)}
                            className="flex items-center gap-1 slds-text-4 hover:underline"
                            style={{ color: "#0176d3", background: "none", border: "none", padding: 0, cursor: "pointer" }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* View Modal */}
      {viewPeriod && (
        <ReportCardViewModal
          open={!!viewPeriodId}
          term={term}
          period={viewPeriod}
          record={reportCards[viewPeriod.id] ?? EMPTY_RECORD}
          courses={assignedCourses}
          onClose={() => setViewPeriodId(null)}
          onEdit={() => {
            setViewPeriodId(null);
            setEditPeriodId(viewPeriod.id);
          }}
        />
      )}
    </>
  );
}
