import React, { useState } from "react";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner@2.0.3";
import { YouthHomeworkView } from "./YouthHomeworkView";
import { YouthGradesView } from "./YouthGradesView";
import { YouthReportCardView } from "./YouthReportCardView";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AcademicTerm {
  id: number;
  school: string;
  term: string;
  startDate: string;
  endDate: string;
}

interface AssignedCourse {
  id: number;
  termId: number;
  courseName: string;
  subject: string;
}

interface AvailableCourse {
  id: number;
  courseName: string;
  subject: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ACADEMIC_TERMS: AcademicTerm[] = [
  {
    id: 1,
    school: "Lincoln High School",
    term: "2024-2025 School Year - Semester 1",
    startDate: "08/26/2024",
    endDate: "01/17/2025",
  },
  {
    id: 2,
    school: "Lincoln High School",
    term: "2024-2025 School Year - Semester 2",
    startDate: "01/21/2025",
    endDate: "05/30/2025",
  },
  {
    id: 3,
    school: "XXXX University",
    term: "2023-2024 School Year - Semester 2",
    startDate: "01/22/2024",
    endDate: "05/10/2024",
  },
];

const INITIAL_ASSIGNED: AssignedCourse[] = [
  {
    id: 1,
    termId: 1,
    courseName: "English I",
    subject: "English Language Arts",
  },
  {
    id: 2,
    termId: 1,
    courseName: "Algebra I",
    subject: "Mathematics",
  },
  {
    id: 3,
    termId: 1,
    courseName: "Biology",
    subject: "Science",
  },
  {
    id: 4,
    termId: 2,
    courseName: "Art 120: Figures and Shapes",
    subject: "Fine Arts",
  },
  {
    id: 5,
    termId: 2,
    courseName: "English II",
    subject: "English Language Arts",
  },
];

const AVAILABLE_COURSES: AvailableCourse[] = [
  { id: 10, courseName: "Algebra I", subject: "Mathematics" },
  { id: 11, courseName: "Algebra II", subject: "Mathematics" },
  { id: 12, courseName: "Biology", subject: "Science" },
  { id: 13, courseName: "Chemistry", subject: "Science" },
  {
    id: 14,
    courseName: "English I",
    subject: "English Language Arts",
  },
  {
    id: 15,
    courseName: "English II",
    subject: "English Language Arts",
  },
  {
    id: 16,
    courseName: "Art 120: Figures and Shapes",
    subject: "Fine Arts",
  },
  {
    id: 17,
    courseName: "Art 200: Painting",
    subject: "Fine Arts",
  },
  {
    id: 18,
    courseName: "U.S. History",
    subject: "Social Studies",
  },
  {
    id: 19,
    courseName: "World Geography",
    subject: "Social Studies",
  },
  {
    id: 20,
    courseName: "Physical Education",
    subject: "Health & PE",
  },
  {
    id: 21,
    courseName: "Computer Science I",
    subject: "Technology",
  },
];

// ─── Assign Courses Modal ─────────────────────────────────────────────────────

interface AssignCoursesModalProps {
  open: boolean;
  onClose: () => void;
  selectedTerm: AcademicTerm | null;
  assignedCourses: AssignedCourse[];
  onAssign: (courses: AvailableCourse[]) => void;
}

function AssignCoursesModal({
  open,
  onClose,
  selectedTerm,
  assignedCourses,
  onAssign,
}: AssignCoursesModalProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(
    new Set(),
  );
  const [validationError, setValidationError] = useState("");

  const assignedIds = new Set(
    assignedCourses
      .filter((c) => c.termId === selectedTerm?.id)
      .map((c) => c.courseName),
  );

  const filtered = AVAILABLE_COURSES.filter(
    (c) =>
      c.courseName
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()),
  );

  const unassigned = filtered.filter(
    (c) => !assignedIds.has(c.courseName),
  );
  const alreadyAssigned = filtered.filter((c) =>
    assignedIds.has(c.courseName),
  );

  const allUnassignedIds = unassigned.map((c) => c.id);
  const allSelected =
    allUnassignedIds.length > 0 &&
    allUnassignedIds.every((id) => selected.has(id));

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        allUnassignedIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        allUnassignedIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setValidationError("");
  }

  function handleAssign() {
    if (selected.size === 0) {
      setValidationError(
        "Select at least one course to assign.",
      );
      return;
    }
    const toAssign = AVAILABLE_COURSES.filter((c) =>
      selected.has(c.id),
    );
    onAssign(toAssign);
    setSelected(new Set());
    setSearch("");
    setValidationError("");
    onClose();
  }

  function handleClose() {
    setSelected(new Set());
    setSearch("");
    setValidationError("");
    onClose();
  }

  const count = selected.size;

  return (
    <Dialog
      open={open}
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
        {/* Header */}
        <div
          className="px-5 py-4 flex-shrink-0"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="slds-page-header-title text-[16px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Assign Courses
            </DialogTitle>
          </DialogHeader>
          {selectedTerm && (
            <div className="mt-2">
              <span
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                ACADEMIC TERM
              </span>
              <p
                className="slds-text-4 mt-0.5"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {selectedTerm.term}
              </p>
            </div>
          )}
        </div>

        {/* Search */}
        <div
          className="px-5 py-3 flex-shrink-0"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
              color: "var(--slds-g-color-text-default)",
            }}
          />
        </div>

        {/* Course list */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full border-collapse">
            <thead
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
            >
              <tr>
                <th className="w-10 px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    disabled={allUnassignedIds.length === 0}
                    aria-label="Select all courses"
                    className="w-4 h-4 rounded"
                    style={{ accentColor: "#145F33" }}
                  />
                </th>
                <th
                  className="px-3 py-2 text-left slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  COURSE NAME
                </th>
                <th
                  className="px-3 py-2 text-left slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  SUBJECT
                </th>
              </tr>
            </thead>
            <tbody>
              {unassigned.map((course) => (
                <tr
                  key={course.id}
                  className="cursor-pointer"
                  style={{
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                  onClick={() => toggle(course.id)}
                >
                  <td className="w-10 px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(course.id)}
                      onChange={() => toggle(course.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${course.courseName}`}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: "#145F33" }}
                    />
                  </td>
                  <td
                    className="px-3 py-2.5 slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {course.courseName}
                  </td>
                  <td
                    className="px-3 py-2.5 slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    {course.subject}
                  </td>
                </tr>
              ))}
              {alreadyAssigned.map((course) => (
                <tr
                  key={course.id}
                  style={{
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                    opacity: 0.65,
                  }}
                >
                  <td className="w-10 px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      aria-label={`${course.courseName} already assigned`}
                      className="w-4 h-4 rounded"
                    />
                  </td>
                  <td
                    className="px-3 py-2.5 slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {course.courseName}
                  </td>
                  <td
                    className="px-3 py-2.5 slds-text-3"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    {course.subject}
                    <span
                      className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{
                        backgroundColor: "#e8f5e9",
                        color: "#145F33",
                      }}
                    >
                      Already Assigned
                    </span>
                  </td>
                </tr>
              ))}
              {unassigned.length === 0 &&
                alreadyAssigned.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center slds-text-4"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      No courses match your search.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        {/* Validation error */}
        {validationError && (
          <div
            className="px-5 py-2 flex-shrink-0"
            style={{
              borderTop:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <p
              className="slds-text-3 font-medium"
              style={{ color: "#c23934" }}
            >
              {validationError}
            </p>
          </div>
        )}

        {/* Footer */}
        <div
          className="px-5 py-3 flex items-center justify-end gap-3 flex-shrink-0"
          style={{
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
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
            onClick={handleAssign}
          >
            {count > 0
              ? `Assign Courses (${count})`
              : "Assign Courses"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Grade Assignment & Matriculation ────────────────────────────────────────

const GRAM_ACADEMIC_LEVELS = [
  "Grade 17 (graduate/advanced degree)",
  "Grade 18 (graduate/advanced degree)",
  "Grade 19 (graduate/advanced degree)",
];
const GRAM_STATUS_VALUES = [
  "Passed", "Not Passed", "In Progress", "Withdrawn",
  "PSO - Adequate Progress", "PSO - Inadequate Progress",
];
const GRAM_GRADUATED_VALUES = ["Yes", "No"];
const GRAM_MATRICULATION_VALUES = [
  "Post Secondary", "High School Diploma", "GED",
  "Certificate Program", "Vocational Training", "None",
];
const GRAM_POST_SECONDARY_VALUES = [
  "College", "Internship", "Technical School", "Workforce",
];

interface GramData {
  academicLevel: string;
  status: string;
  graduated: string;
  matriculation: string;
  postSecondary: string;
  postSecondaryComments: string;
}

const GRAM_EMPTY: GramData = {
  academicLevel: "", status: "", graduated: "",
  matriculation: "", postSecondary: "", postSecondaryComments: "",
};

interface GradeAssignmentModalProps {
  open: boolean;
  term: AcademicTerm;
  savedData: GramData;
  onClose: () => void;
  onSave: (data: GramData) => void;
}

function GradeAssignmentModal({
  open, term, savedData, onClose, onSave,
}: GradeAssignmentModalProps) {
  const [academicLevel, setAcademicLevel] = useState(savedData.academicLevel);
  const [status, setStatus] = useState(savedData.status);
  const [graduated, setGraduated] = useState(savedData.graduated);
  const [matriculation, setMatriculation] = useState(savedData.matriculation);
  const [postSecondary, setPostSecondary] = useState(savedData.postSecondary);
  const [postSecondaryComments, setPostSecondaryComments] = useState(savedData.postSecondaryComments);
  const [dirty, setDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [confirmMatricChange, setConfirmMatricChange] = useState<string | null>(null);

  const isPostSecondary = matriculation === "Post Secondary";

  function mark() { setDirty(true); }

  function handleMatricChange(val: string) {
    if (matriculation === "Post Secondary" && val !== "Post Secondary" && (postSecondary || postSecondaryComments)) {
      setConfirmMatricChange(val);
    } else {
      applyMatricChange(val);
    }
  }

  function applyMatricChange(val: string) {
    setMatriculation(val);
    if (val !== "Post Secondary") {
      setPostSecondary("");
      setPostSecondaryComments("");
    }
    mark();
    setConfirmMatricChange(null);
  }

  function handleClose() {
    if (dirty) { setConfirmDiscard(true); } else { onClose(); }
  }

  function handleSave() {
    onSave({
      academicLevel, status, graduated, matriculation,
      postSecondary: isPostSecondary ? postSecondary : "",
      postSecondaryComments: isPostSecondary ? postSecondaryComments : "",
    });
    onClose();
    toast.success("Grade Assignment & Matriculation saved.");
  }

  const selectStyle = (disabled = false): React.CSSProperties => ({
    border: "1px solid var(--slds-g-color-border-base-1)",
    backgroundColor: disabled ? "var(--slds-g-color-background-alt)" : "var(--slds-g-color-background-base)",
    color: "var(--slds-g-color-text-default)",
    opacity: disabled ? 0.6 : 1,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23706e6b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    paddingRight: "2rem",
  });

  return (
    <>
      <Dialog open={open && !confirmDiscard && !confirmMatricChange} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0"
          style={{ backgroundColor: "var(--slds-g-color-background-base)", borderColor: "var(--slds-g-color-border-base-1)" }}
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
            <DialogHeader>
              <DialogTitle className="text-[16px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
                Grade Assignment &amp; Matriculation
              </DialogTitle>
            </DialogHeader>
            <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
              Maintain academic progression and matriculation details for the selected academic term.
            </p>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {/* Academic Term (read-only) */}
            <div>
              <span className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>ACADEMIC TERM</span>
              <p className="slds-text-4 mt-0.5 font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>{term.term}</p>
            </div>

            {/* Row 1: Academic Level + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>ACADEMIC LEVEL</label>
                <select
                  value={academicLevel}
                  onChange={(e) => { setAcademicLevel(e.target.value); mark(); }}
                  className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none appearance-none"
                  style={selectStyle()}
                >
                  <option value="">Select Academic Level</option>
                  {GRAM_ACADEMIC_LEVELS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>STATUS</label>
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); mark(); }}
                  className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none appearance-none"
                  style={selectStyle()}
                >
                  <option value="">Select Status</option>
                  {GRAM_STATUS_VALUES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2: Graduated + Matriculation */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>GRADUATED</label>
                <select
                  value={graduated}
                  onChange={(e) => { setGraduated(e.target.value); mark(); }}
                  className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none appearance-none"
                  style={selectStyle()}
                >
                  <option value="">Select</option>
                  {GRAM_GRADUATED_VALUES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>MATRICULATION</label>
                <select
                  value={matriculation}
                  onChange={(e) => handleMatricChange(e.target.value)}
                  className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none appearance-none"
                  style={selectStyle()}
                >
                  <option value="">Select Matriculation</option>
                  {GRAM_MATRICULATION_VALUES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            {/* Post Secondary */}
            <div className="space-y-1.5">
              <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                POST SECONDARY
                {!isPostSecondary && <span className="ml-2 slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>(enabled when Matriculation = Post Secondary)</span>}
              </label>
              <select
                value={postSecondary}
                onChange={(e) => { setPostSecondary(e.target.value); mark(); }}
                disabled={!isPostSecondary}
                className="w-full h-9 px-3 rounded slds-text-4 focus:outline-none appearance-none"
                style={selectStyle(!isPostSecondary)}
              >
                <option value="">Select Post Secondary</option>
                {GRAM_POST_SECONDARY_VALUES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* Post Secondary Comments */}
            <div className="space-y-1.5">
              <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>POST SECONDARY COMMENTS</label>
              <textarea
                value={postSecondaryComments}
                onChange={(e) => { setPostSecondaryComments(e.target.value); mark(); }}
                disabled={!isPostSecondary}
                placeholder={isPostSecondary ? "Enter post secondary comments" : ""}
                rows={3}
                className="w-full px-3 py-2 rounded slds-text-4 focus:outline-none resize-none"
                style={{
                  border: "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor: !isPostSecondary ? "var(--slds-g-color-background-alt)" : "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                  opacity: !isPostSecondary ? 0.6 : 1,
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 flex items-center justify-end gap-3 flex-shrink-0" style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}>
            <Button
              variant="outline"
              className="h-9 rounded-full slds-text-4 shadow-none"
              style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
              onClick={handleClose}
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
        </DialogContent>
      </Dialog>

      {/* Unsaved changes confirmation */}
      <Dialog open={confirmDiscard} onOpenChange={(v) => !v && setConfirmDiscard(false)}>
        <DialogContent className="max-w-sm p-0 gap-0" style={{ backgroundColor: "var(--slds-g-color-background-base)", borderColor: "var(--slds-g-color-border-base-1)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
            <DialogHeader>
              <DialogTitle className="text-[15px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Discard unsaved changes?</DialogTitle>
            </DialogHeader>
            <p className="slds-text-4 mt-1" style={{ color: "var(--slds-g-color-text-weak)" }}>You have unsaved changes. Are you sure you want to leave?</p>
          </div>
          <div className="px-5 py-3 flex items-center justify-end gap-3">
            <Button variant="outline" className="h-9 rounded-full slds-text-4 shadow-none" style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }} onClick={() => setConfirmDiscard(false)}>Keep Editing</Button>
            <Button className="h-9 rounded-full slds-text-4 text-white shadow-none" style={{ backgroundColor: "#c23934" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a52b27")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c23934")} onClick={() => { setConfirmDiscard(false); onClose(); }}>Discard Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Matriculation change confirmation */}
      <Dialog open={!!confirmMatricChange} onOpenChange={(v) => !v && setConfirmMatricChange(null)}>
        <DialogContent className="max-w-sm p-0 gap-0" style={{ backgroundColor: "var(--slds-g-color-background-base)", borderColor: "var(--slds-g-color-border-base-1)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
            <DialogHeader>
              <DialogTitle className="text-[15px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Clear Post Secondary information?</DialogTitle>
            </DialogHeader>
            <p className="slds-text-4 mt-1" style={{ color: "var(--slds-g-color-text-weak)" }}>Changing Matriculation will clear the Post Secondary information you entered. Continue?</p>
          </div>
          <div className="px-5 py-3 flex items-center justify-end gap-3">
            <Button variant="outline" className="h-9 rounded-full slds-text-4 shadow-none" style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }} onClick={() => setConfirmMatricChange(null)}>Keep Current Selection</Button>
            <Button className="h-9 rounded-full slds-text-4 text-white shadow-none" style={{ backgroundColor: "#145F33" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e4524")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#145F33")} onClick={() => confirmMatricChange && applyMatricChange(confirmMatricChange)}>Continue</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function YouthAcademicsView() {
  const [selectedTermId, setSelectedTermId] = useState<
    number | null
  >(null);
  const [assignedCourses, setAssignedCourses] =
    useState<AssignedCourse[]>(INITIAL_ASSIGNED);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [nextId, setNextId] = useState(100);
  const [homeworkCourse, setHomeworkCourse] =
    useState<AssignedCourse | null>(null);
  const [gradesCourse, setGradesCourse] =
    useState<AssignedCourse | null>(null);
  const [gramModalOpen, setGramModalOpen] = useState(false);
  const [gramDataByTerm, setGramDataByTerm] = useState<Record<number, GramData>>({});
  const [reportCardTerm, setReportCardTerm] = useState<AcademicTerm | null>(null);

  const selectedTerm =
    ACADEMIC_TERMS.find((t) => t.id === selectedTermId) ?? null;
  const termCourses = assignedCourses.filter(
    (c) => c.termId === selectedTermId,
  );

  function handleAssign(courses: AvailableCourse[]) {
    const newCourses: AssignedCourse[] = courses.map(
      (c, i) => ({
        id: nextId + i,
        termId: selectedTermId!,
        courseName: c.courseName,
        subject: c.subject,
      }),
    );
    setAssignedCourses((prev) => [...prev, ...newCourses]);
    setNextId((n) => n + courses.length);
    toast.success(
      `${courses.length} course${courses.length !== 1 ? "s" : ""} assigned successfully.`,
    );
  }

  function handleViewHomework(course: AssignedCourse) {
    setHomeworkCourse(course);
  }

  function handleViewGrades(course: AssignedCourse) {
    setGradesCourse(course);
  }

  // ── Homework navigation ────────────────────────────────────────────────────
  if (homeworkCourse && selectedTerm) {
    return (
      <YouthHomeworkView
        course={homeworkCourse}
        term={selectedTerm}
        onBack={() => setHomeworkCourse(null)}
      />
    );
  }

  // ── Grades navigation ──────────────────────────────────────────────────────
  if (gradesCourse && selectedTerm) {
    return (
      <YouthGradesView
        course={gradesCourse}
        term={selectedTerm}
        onBack={() => setGradesCourse(null)}
      />
    );
  }

  // ── Report Card navigation ─────────────────────────────────────────────────
  if (reportCardTerm) {
    return (
      <YouthReportCardView
        term={reportCardTerm}
        assignedCourses={assignedCourses.filter((c) => c.termId === reportCardTerm.id)}
        onBack={() => setReportCardTerm(null)}
      />
    );
  }

  return (
    <div className="space-y-5 w-full">
      {/* ── Academic Terms Card ── */}
      <div
        className="overflow-hidden w-full"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        {/* Card header */}
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
              Academic Terms
            </h3>
            <p
              className="slds-text-3 mt-0.5"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Select an academic term to view and manage its
              assigned courses.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              className="h-8 rounded-full slds-text-4 text-white shadow-none"
              style={{
                backgroundColor: selectedTermId ? "#145F33" : undefined,
                opacity: selectedTermId ? 1 : 0.5,
              }}
              disabled={!selectedTermId}
              onClick={() => setGramModalOpen(true)}
            >
              Grade Assignment &amp; Matriculation
            </Button>
            <Button
              className="h-8 rounded-full slds-text-4 text-white shadow-none"
              style={{
                backgroundColor: selectedTermId ? "#145F33" : undefined,
                opacity: selectedTermId ? 1 : 0.5,
              }}
              disabled={!selectedTermId}
              onClick={() => selectedTerm && setReportCardTerm(selectedTerm)}
            >
              Report Card
            </Button>
          </div>
        </div>

        {/* Terms table */}
        {ACADEMIC_TERMS.length === 0 ? (
          <div
            className="px-4 py-10 text-center"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="slds-text-4">
              No academic terms are available for this youth.
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <tr>
                <th
                  className="px-4 py-2.5 text-left slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  SCHOOL
                </th>
                <th
                  className="px-4 py-2.5 text-left slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  TERM
                </th>
                <th
                  className="px-4 py-2.5 text-left slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  START DATE
                </th>
                <th
                  className="px-4 py-2.5 text-left slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  END DATE
                </th>
              </tr>
            </thead>
            <tbody>
              {ACADEMIC_TERMS.map((term) => {
                const isSelected = term.id === selectedTermId;
                return (
                  <tr
                    key={term.id}
                    onClick={() => setSelectedTermId(term.id)}
                    tabIndex={0}
                    aria-selected={isSelected}
                    role="row"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedTermId(term.id);
                      }
                    }}
                    className="cursor-pointer focus:outline-none"
                    style={{
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor: isSelected
                        ? "#e8f5e9"
                        : undefined,
                      outline: isSelected ? "none" : undefined,
                    }}
                    onFocus={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.backgroundColor =
                          "var(--slds-g-color-background-row-hover)";
                    }}
                    onBlur={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.backgroundColor =
                          "";
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.backgroundColor =
                          "var(--slds-g-color-background-row-hover)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.backgroundColor =
                          "";
                    }}
                  >
                    <td
                      className="px-4 py-3 slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: "#145F33",
                            }}
                            aria-hidden="true"
                          />
                        )}
                        {term.school}
                      </div>
                    </td>
                    <td
                      className="px-4 py-3 slds-text-4 font-medium"
                      style={{
                        color: isSelected
                          ? "#145F33"
                          : "var(--slds-g-color-text-default)",
                      }}
                    >
                      {term.term}
                    </td>
                    <td
                      className="px-4 py-3 slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {term.startDate}
                    </td>
                    <td
                      className="px-4 py-3 slds-text-4"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {term.endDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Assigned Courses Card ── */}
      <div
        className="overflow-hidden w-full"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        {/* Card header */}
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
              Assigned Courses
            </h3>
            {selectedTerm ? (
              <p
                className="slds-text-3 mt-0.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Academic Term:{" "}
                <span className="font-medium">
                  {selectedTerm.term}
                </span>
              </p>
            ) : (
              <p
                className="slds-text-3 mt-0.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Select an academic term above to view assigned
                courses.
              </p>
            )}
          </div>
          <Button
            className="h-9 rounded-full slds-text-4 text-white shadow-none flex-shrink-0"
            style={{
              backgroundColor: selectedTermId
                ? "#145F33"
                : undefined,
              opacity: selectedTermId ? 1 : 0.5,
              cursor: selectedTermId
                ? "pointer"
                : "not-allowed",
            }}
            disabled={!selectedTermId}
            onClick={() =>
              selectedTermId && setAssignModalOpen(true)
            }
            onMouseEnter={(e) => {
              if (selectedTermId)
                e.currentTarget.style.backgroundColor =
                  "#0e4524";
            }}
            onMouseLeave={(e) => {
              if (selectedTermId)
                e.currentTarget.style.backgroundColor =
                  "#145F33";
            }}
          >
            Assign Courses
          </Button>
        </div>

        {/* Courses content */}
        {!selectedTermId ? (
          <div
            className="px-4 py-10 text-center"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="slds-text-4">
              Select an Academic Term to view assigned courses.
            </p>
          </div>
        ) : termCourses.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <ClipboardList
              className="w-8 h-8 mx-auto mb-2 opacity-40"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            />
            <p
              className="slds-text-4 mb-4"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              No courses have been assigned to this academic
              term.
            </p>
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
              onClick={() => setAssignModalOpen(true)}
            >
              Assign Courses
            </Button>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <tr>
                <th
                  className="px-4 py-2.5 text-left slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  COURSE NAME
                </th>
                <th
                  className="px-4 py-2.5 text-left slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  SUBJECT
                </th>
                <th
                  className="px-4 py-2.5 text-left slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  HOMEWORK
                </th>
                <th
                  className="px-4 py-2.5 text-left slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  GRADES
                </th>
              </tr>
            </thead>
            <tbody>
              {termCourses.map((course) => (
                <tr
                  key={course.id}
                  style={{
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <td
                    className="px-4 py-3 slds-text-4 font-medium"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {course.courseName}
                  </td>
                  <td
                    className="px-4 py-3 slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    {course.subject}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewHomework(course)}
                      className="slds-text-4 font-medium hover:underline cursor-pointer focus:outline-none focus-visible:underline"
                      style={{ color: "#0176d3" }}
                      aria-label={`View homework for ${course.courseName}`}
                    >
                      View Homework
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewGrades(course)}
                      className="slds-text-4 font-medium hover:underline cursor-pointer focus:outline-none focus-visible:underline"
                      style={{ color: "#0176d3" }}
                      aria-label={`View grades for ${course.courseName}`}
                    >
                      View Grades
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Assign Courses Modal */}
      <AssignCoursesModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        selectedTerm={selectedTerm}
        assignedCourses={assignedCourses}
        onAssign={handleAssign}
      />

      {gramModalOpen && selectedTerm && (
        <GradeAssignmentModal
          open={gramModalOpen}
          term={selectedTerm}
          savedData={gramDataByTerm[selectedTerm.id] ?? GRAM_EMPTY}
          onClose={() => setGramModalOpen(false)}
          onSave={(data) => {
            setGramDataByTerm((prev) => ({ ...prev, [selectedTerm.id]: data }));
            setGramModalOpen(false);
          }}
        />
      )}
    </div>
  );
}