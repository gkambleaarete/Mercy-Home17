import React, { useState } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Search,
  AlertCircle,
} from "@/app/lib/lucide-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner@2.0.3";

// ── Constants ─────────────────────────────────────────────────────────────────

const SUBJECT_AREAS = [
  "English Language Arts",
  "Social Studies",
  "Math",
  "Science",
  "Foreign Language",
  "Fine Arts",
  "Physical Education and/or Health",
  "Elective",
  "Religion (non-elective)",
  "Undergraduate Major (College)",
  "Undergraduate Gen Ed (College)",
  "Graduate Major (Grad/Professional School)",
];

const ABILITY_GROUPS = [
  "Standard",
  "Remedial",
  "Special Education",
  "Honors",
  "AP",
  "Functional",
];

const STATUS_BADGE: Record<
  string,
  { bg: string; color: string; border: string }
> = {
  Active: {
    bg: "#ecfdf5",
    color: "#065f46",
    border: "#a7f3d0",
  },
  Inactive: {
    bg: "#f9fafb",
    color: "#6b7280",
    border: "#e5e7eb",
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface AcademicCourse {
  id: number;
  courseName: string;
  subjectArea: string;
  abilityGroup: string;
  startDate: string;
  endDate: string;
  status: string;
  comments: string;
}

type ModalMode = "create" | "edit" | "view" | null;

interface FormState {
  courseName: string;
  subjectArea: string;
  abilityGroup: string;
  startDate: string;
  endDate: string;
  comments: string;
}

// ── Sample data ───────────────────────────────────────────────────────────────

const SAMPLE_COURSES: AcademicCourse[] = [
  {
    id: 1,
    courseName: "Math",
    subjectArea: "Math",
    abilityGroup: "Special Education",
    startDate: "08/20/2025",
    endDate: "05/30/2026",
    status: "Active",
    comments: "",
  },
  {
    id: 2,
    courseName: "Reading",
    subjectArea: "English Language Arts",
    abilityGroup: "Special Education",
    startDate: "08/20/2025",
    endDate: "05/30/2026",
    status: "Active",
    comments: "",
  },
  {
    id: 3,
    courseName: "Physical Education",
    subjectArea: "Physical Education and/or Health",
    abilityGroup: "Standard",
    startDate: "08/20/2025",
    endDate: "05/30/2026",
    status: "Active",
    comments: "",
  },
];

const EMPTY_FORM: FormState = {
  courseName: "",
  subjectArea: "",
  abilityGroup: "",
  startDate: "",
  endDate: "",
  comments: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseDateMMDDYYYY(s: string): Date | null {
  if (!s) return null;
  const [m, d, y] = s.split("/");
  if (!m || !d || !y) return null;
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  return isNaN(dt.getTime()) ? null : dt;
}

function displayDate(s: string): string {
  return s || "—";
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AcademicCoursesView() {
  const [courses, setCourses] =
    useState<AcademicCourse[]>(SAMPLE_COURSES);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedCourse, setSelectedCourse] =
    useState<AcademicCourse | null>(null);
  const [form, setForm] = useState<FormState>({
    ...EMPTY_FORM,
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});

  // ── Derived ────────────────────────────────────────────────────────────────

  const filtered = courses.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.courseName.toLowerCase().includes(q) ||
      c.subjectArea.toLowerCase().includes(q) ||
      c.abilityGroup.toLowerCase().includes(q)
    );
  });

  const isReadOnly = modalMode === "view";

  // ── Handlers ───────────────────────────────────────────────────────────────

  function setField(k: keyof FormState, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function validate(): Partial<FormState> {
    const errs: Partial<FormState> = {};
    if (!form.courseName.trim())
      errs.courseName = "Course Name is required";
    if (!form.subjectArea)
      errs.subjectArea = "Subject Area is required";
    if (form.startDate && form.endDate) {
      const s = parseDateMMDDYYYY(form.startDate);
      const e = parseDateMMDDYYYY(form.endDate);
      if (s && e && e < s)
        errs.endDate = "End Date must be after Start Date";
    }
    return errs;
  }

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setSelectedCourse(null);
    setModalMode("create");
  }

  function openEdit(c: AcademicCourse) {
    setForm({
      courseName: c.courseName,
      subjectArea: c.subjectArea,
      abilityGroup: c.abilityGroup,
      startDate: c.startDate,
      endDate: c.endDate,
      comments: c.comments,
    });
    setErrors({});
    setSelectedCourse(c);
    setModalMode("edit");
  }

  function openView(c: AcademicCourse) {
    setSelectedCourse(c);
    setModalMode("view");
  }

  function handleSave(closeAfter: boolean) {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (modalMode === "create") {
      const newCourse: AcademicCourse = {
        id: Date.now(),
        ...form,
        status: "Active",
      };
      setCourses((prev) => [...prev, newCourse]);
      toast.success("Course created successfully.");
    } else if (modalMode === "edit" && selectedCourse) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === selectedCourse.id ? { ...c, ...form } : c,
        ),
      );
      toast.success("Course updated successfully.");
    }
    if (closeAfter) {
      setModalMode(null);
    } else {
      setForm({ ...EMPTY_FORM });
      setErrors({});
    }
  }

  // ── Styles ─────────────────────────────────────────────────────────────────

  const labelCls =
    "slds-form-label block font-medium uppercase tracking-wide";
  const labelStyle = { color: "var(--slds-g-color-text-weak)" };

  function inputStyle(hasError?: boolean): React.CSSProperties {
    return {
      border: `1px solid ${hasError ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
      backgroundColor: "var(--slds-g-color-background-base)",
      color: "var(--slds-g-color-text-default)",
      borderRadius: 4,
    };
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Card */}
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        {/* Card Header */}
        <div
          className="px-4 py-3 flex items-start justify-between gap-4"
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
              Academic Courses
            </h3>
            <p
              className="slds-text-3 mt-0.5"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              View and manage academic courses associated with
              this school.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="h-8 px-3 rounded-full text-[12px] font-medium text-white flex items-center gap-1.5 transition-colors flex-shrink-0"
            style={{ backgroundColor: "#145F33" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#0e4524")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#145F33")
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Create New Course
          </button>
        </div>

        {/* Search Toolbar */}
        <div
          className="px-4 py-2 flex items-center"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-base)",
          }}
        >
          <div className="relative max-w-xs w-full">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search academic courses..."
              className="h-8 w-full pl-8 pr-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]"
              style={inputStyle()}
            />
          </div>
        </div>

        {/* Table / Empty States */}
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  {[
                    "Course Name",
                    "Subject Area",
                    "Ability Group",
                    "Start Date",
                    "End Date",
                    "Actions",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2.5 text-left font-semibold whitespace-nowrap"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const badge =
                    STATUS_BADGE[row.status] ??
                    STATUS_BADGE["Inactive"];
                  return (
                    <tr
                      key={row.id}
                      className="transition-colors"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--slds-g-color-background-alt)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "")
                      }
                    >
                      <td
                        className="px-4 py-3 font-medium"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {row.courseName}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {row.subjectArea}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {row.abilityGroup || "—"}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {displayDate(row.startDate)}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {displayDate(row.endDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openView(row)}
                            className="h-7 w-7 rounded flex items-center justify-center transition-colors hover:bg-[#eff6ff]"
                            style={{ color: "#0176d3" }}
                            title="View"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openEdit(row)}
                            className="h-7 w-7 rounded flex items-center justify-center transition-colors hover:bg-[#eff6ff]"
                            style={{ color: "#0176d3" }}
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div
              className="px-4 py-2 text-[12px]"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-weak)",
              }}
            >
              {filtered.length} record
              {filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
        ) : search.trim() ? (
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
            <h3
              className="text-[14px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              No matching courses found
            </h3>
            <p
              className="mt-1.5 slds-text-4 max-w-xs"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
            <h3
              className="mt-4 text-[14px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              No Academic Courses
            </h3>
            <p
              className="mt-1.5 slds-text-4 max-w-xs"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              No academic courses have been added yet.
            </p>
            <button
              onClick={openCreate}
              className="mt-4 h-8 px-4 rounded-full text-[12px] font-medium text-white flex items-center gap-1.5 transition-colors"
              style={{ backgroundColor: "#145F33" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#0e4524")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#145F33")
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Create New Course
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit / View Modal */}
      <Dialog
        open={modalMode !== null}
        onOpenChange={(open) => {
          if (!open) setModalMode(null);
        }}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle
              className="text-[16px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {modalMode === "create"
                ? "Create New Course"
                : modalMode === "edit"
                  ? "Edit Course"
                  : "Course Details"}
            </DialogTitle>
            {!isReadOnly && (
              <p
                id="course-modal-desc"
                className="slds-text-3 mt-0.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {modalMode === "create"
                  ? "Create a new academic course for this school."
                  : "Update the details for this academic course."}
              </p>
            )}
          </DialogHeader>

          {/* View mode */}
          {isReadOnly && selectedCourse ? (
            <div className="space-y-4 pt-2">
              {(
                [
                  ["Course Name", selectedCourse.courseName],
                  ["Subject Area", selectedCourse.subjectArea],
                  [
                    "Ability Group",
                    selectedCourse.abilityGroup || "—",
                  ],
                  [
                    "Start Date",
                    displayDate(selectedCourse.startDate),
                  ],
                  [
                    "End Date",
                    displayDate(selectedCourse.endDate),
                  ],
                  ["Status", selectedCourse.status],
                  [
                    "Comments/Notes",
                    selectedCourse.comments || "—",
                  ],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label} className="space-y-1">
                  <p className={labelCls} style={labelStyle}>
                    {label}
                  </p>
                  <p
                    className="slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {value}
                  </p>
                </div>
              ))}
              <div
                className="flex justify-end pt-2"
                style={{
                  borderTop:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <button
                  onClick={() => setModalMode(null)}
                  className="h-9 px-5 rounded-full slds-text-4 font-medium"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Create / Edit mode */
            <div className="space-y-4 pt-2">
              {/* Course Name — full width */}
              <div className="space-y-1.5">
                <label className={labelCls} style={labelStyle}>
                  Course Name{" "}
                  <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.courseName}
                  onChange={(e) =>
                    setField("courseName", e.target.value)
                  }
                  placeholder="Enter course name"
                  className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                  style={inputStyle(!!errors.courseName)}
                />
                {errors.courseName && (
                  <p
                    className="flex items-center gap-1 text-[11px]"
                    style={{ color: "#c23934" }}
                  >
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    {errors.courseName}
                  </p>
                )}
              </div>

              {/* Subject Area + Ability Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    className={labelCls}
                    style={labelStyle}
                  >
                    Subject Area{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={form.subjectArea}
                    onChange={(e) =>
                      setField("subjectArea", e.target.value)
                    }
                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                    style={inputStyle(!!errors.subjectArea)}
                  >
                    <option value="">
                      Select Subject Area
                    </option>
                    {SUBJECT_AREAS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.subjectArea && (
                    <p
                      className="flex items-center gap-1 text-[11px]"
                      style={{ color: "#c23934" }}
                    >
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      {errors.subjectArea}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label
                    className={labelCls}
                    style={labelStyle}
                  >
                    Ability Group
                  </label>
                  <select
                    value={form.abilityGroup}
                    onChange={(e) =>
                      setField("abilityGroup", e.target.value)
                    }
                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                    style={inputStyle()}
                  >
                    <option value="">
                      Select Ability Group
                    </option>
                    {ABILITY_GROUPS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Date + End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    className={labelCls}
                    style={labelStyle}
                  >
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={form.startDate}
                    onChange={(e) =>
                      setField("startDate", e.target.value)
                    }
                    placeholder="MM/DD/YYYY"
                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                    style={inputStyle()}
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    className={labelCls}
                    style={labelStyle}
                  >
                    End Date
                  </label>
                  <input
                    type="text"
                    value={form.endDate}
                    onChange={(e) =>
                      setField("endDate", e.target.value)
                    }
                    placeholder="MM/DD/YYYY"
                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                    style={inputStyle(!!errors.endDate)}
                  />
                  {errors.endDate && (
                    <p
                      className="flex items-center gap-1 text-[11px]"
                      style={{ color: "#c23934" }}
                    >
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Comments/Notes — full width */}
              <div className="space-y-1.5">
                <label className={labelCls} style={labelStyle}>
                  Comments/Notes
                </label>
                <textarea
                  value={form.comments}
                  onChange={(e) =>
                    setField("comments", e.target.value)
                  }
                  placeholder="Enter comments or notes"
                  rows={3}
                  className="w-full px-3 py-2 rounded slds-text-4 resize-none focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                  style={inputStyle()}
                />
              </div>

              {/* Footer actions */}
              <div
                className="flex items-center justify-end gap-2 pt-2"
                style={{
                  borderTop:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <button
                  onClick={() => setModalMode(null)}
                  className="h-9 px-5 rounded-full slds-text-4 font-medium"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Cancel
                </button>
                {modalMode === "create" && (
                  <button
                    onClick={() => handleSave(false)}
                    className="h-9 px-5 rounded-full slds-text-4 font-medium"
                    style={{
                      border: "1px solid #145F33",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      color: "#145F33",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "#f0fdf4")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--slds-g-color-background-base)")
                    }
                  >
                    Save
                  </button>
                )}
                <button
                  onClick={() => handleSave(true)}
                  className="h-9 px-5 rounded-full slds-text-4 font-medium text-white"
                  style={{ backgroundColor: "#145F33" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "#0e4524")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "#145F33")
                  }
                >
                  {modalMode === "create"
                    ? "Save & Close"
                    : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}