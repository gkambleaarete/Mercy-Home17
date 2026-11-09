import { useState } from "react";
import { Plus, Eye, Pencil, Search, AlertCircle } from "@/app/lib/lucide-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner@2.0.3";

// ── Constants ─────────────────────────────────────────────────────────────────

const LEVEL_VALUES = [
  "Kindergarten",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "Post Secondary",
  "Grade 13",
  "Grade 14",
  "Grade 15",
  "Grade 16",
  "Grade 17 (graduate/advanced degree)",
  "Grade 18 (graduate/advanced degree)",
  "Grade 19 (graduate/advanced degree)",
];

const STATUS_BADGE = {
  active: { bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0", label: "Active" },
  inactive: { bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb", label: "Inactive" },
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface AcademicLevel {
  id: number;
  academicLevel: string;
  nextLevel: string;
  graduation: boolean;
  active: boolean;
}

type ModalMode = "create" | "edit" | "view" | null;

interface FormState {
  academicLevel: string;
  nextLevel: string;
  graduation: boolean;
  active: boolean;
}

// ── Sample data ───────────────────────────────────────────────────────────────

const SAMPLE_LEVELS: AcademicLevel[] = [
  { id: 1, academicLevel: "Grade 6",  nextLevel: "Grade 7",         graduation: false, active: true },
  { id: 2, academicLevel: "Grade 7",  nextLevel: "Grade 8",         graduation: false, active: true },
  { id: 3, academicLevel: "Grade 12", nextLevel: "Post Secondary",  graduation: true,  active: true },
];

const EMPTY_FORM: FormState = {
  academicLevel: "",
  nextLevel: "",
  graduation: false,
  active: true,
};

// ── Component ─────────────────────────────────────────────────────────────────

export function AcademicLevelsView() {
  const [levels, setLevels] = useState<AcademicLevel[]>(SAMPLE_LEVELS);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedLevel, setSelectedLevel] = useState<AcademicLevel | null>(null);
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<{ academicLevel?: string }>({});

  // ── Derived ────────────────────────────────────────────────────────────────

  const filtered = levels.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.academicLevel.toLowerCase().includes(q) ||
      l.nextLevel.toLowerCase().includes(q)
    );
  });

  const isReadOnly = modalMode === "view";

  // ── Handlers ───────────────────────────────────────────────────────────────

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === "academicLevel") setErrors((e) => ({ ...e, academicLevel: undefined }));
  }

  function validate(): { academicLevel?: string } {
    if (!form.academicLevel) return { academicLevel: "Academic Level is required" };
    return {};
  }

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setSelectedLevel(null);
    setModalMode("create");
  }

  function openEdit(l: AcademicLevel) {
    setForm({
      academicLevel: l.academicLevel,
      nextLevel: l.nextLevel,
      graduation: l.graduation,
      active: l.active,
    });
    setErrors({});
    setSelectedLevel(l);
    setModalMode("edit");
  }

  function openView(l: AcademicLevel) {
    setSelectedLevel(l);
    setModalMode("view");
  }

  function handleSave(closeAfter: boolean) {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (modalMode === "create") {
      setLevels((prev) => [...prev, { id: Date.now(), ...form }]);
      toast.success("Academic level created successfully.");
    } else if (modalMode === "edit" && selectedLevel) {
      setLevels((prev) =>
        prev.map((l) => (l.id === selectedLevel.id ? { ...l, ...form } : l)),
      );
      toast.success("Academic level updated successfully.");
    }
    if (closeAfter) {
      setModalMode(null);
    } else {
      setForm({ ...EMPTY_FORM });
      setErrors({});
    }
  }

  // ── Styles ─────────────────────────────────────────────────────────────────

  const labelCls = "slds-form-label block font-medium uppercase tracking-wide";
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
          backgroundColor: "var(--slds-g-color-background-base)",
        }}
      >
        {/* Card Header */}
        <div
          className="px-4 py-3 flex items-start justify-between gap-4"
          style={{
            borderBottom: "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor: "var(--slds-g-color-background-alt)",
          }}
        >
          <div>
            <h3
              className="text-[13px] font-semibold"
              style={{ color: "var(--slds-g-color-text-default)" }}
            >
              Academic Levels
            </h3>
            <p
              className="slds-text-3 mt-0.5"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              View and manage academic level history for this school.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="h-8 px-3 rounded-full text-[12px] font-medium text-white flex items-center gap-1.5 transition-colors flex-shrink-0"
            style={{ backgroundColor: "#145F33" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#0e4524")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#145F33")
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Create New Academic Level
          </button>
        </div>

        {/* Search Toolbar */}
        <div
          className="px-4 py-2 flex items-center"
          style={{
            borderBottom: "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor: "var(--slds-g-color-background-base)",
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
              placeholder="Search academic levels..."
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
                    backgroundColor: "var(--slds-g-color-background-alt)",
                  }}
                >
                  {["Academic Level", "Next Level", "Graduation", "Active", "Actions"].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-4 py-2.5 text-left font-semibold whitespace-nowrap"
                        style={{
                          color: "var(--slds-g-color-text-default)",
                          borderBottom: "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const activeBadge = row.active
                    ? STATUS_BADGE.active
                    : STATUS_BADGE.inactive;
                  return (
                    <tr
                      key={row.id}
                      className="transition-colors"
                      style={{
                        borderBottom: "1px solid var(--slds-g-color-border-base-1)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--slds-g-color-background-alt)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "")
                      }
                    >
                      <td
                        className="px-4 py-3 font-medium whitespace-nowrap"
                        style={{ color: "var(--slds-g-color-text-default)" }}
                      >
                        {row.academicLevel}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{ color: "var(--slds-g-color-text-weak)" }}
                      >
                        {row.nextLevel || "—"}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{ color: "var(--slds-g-color-text-weak)" }}
                      >
                        {row.graduation ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                          style={{
                            backgroundColor: activeBadge.bg,
                            color: activeBadge.color,
                            border: `1px solid ${activeBadge.border}`,
                          }}
                        >
                          {activeBadge.label}
                        </span>
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
                borderTop: "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-weak)",
              }}
            >
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
        ) : search.trim() ? (
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
            <h3
              className="text-[14px] font-semibold"
              style={{ color: "var(--slds-g-color-text-default)" }}
            >
              No matching levels found
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
              style={{ color: "var(--slds-g-color-text-default)" }}
            >
              No Academic Levels
            </h3>
            <p
              className="mt-1.5 slds-text-4 max-w-xs"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              No academic levels have been added yet.
            </p>
            <button
              onClick={openCreate}
              className="mt-4 h-8 px-4 rounded-full text-[12px] font-medium text-white flex items-center gap-1.5 transition-colors"
              style={{ backgroundColor: "#145F33" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#0e4524")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#145F33")
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Create New Academic Level
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog
        open={modalMode !== null}
        onOpenChange={(open) => {
          if (!open) setModalMode(null);
        }}
      >
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          aria-describedby={isReadOnly ? undefined : "level-modal-desc"}
        >
          <DialogHeader>
            <DialogTitle
              className="text-[16px] font-semibold"
              style={{ color: "var(--slds-g-color-text-default)" }}
            >
              {modalMode === "create"
                ? "Create New Academic Level"
                : modalMode === "edit"
                  ? "Edit Academic Level"
                  : "Academic Level Details"}
            </DialogTitle>
            {!isReadOnly && (
              <p
                id="level-modal-desc"
                className="slds-text-3 mt-0.5"
                style={{ color: "var(--slds-g-color-text-weak)" }}
              >
                {modalMode === "create"
                  ? "Create a new academic level for this school."
                  : "Update the details for this academic level."}
              </p>
            )}
          </DialogHeader>

          {/* View mode */}
          {isReadOnly && selectedLevel ? (
            <div className="space-y-4 pt-2">
              {(
                [
                  ["Academic Level", selectedLevel.academicLevel],
                  ["Next Level", selectedLevel.nextLevel || "—"],
                  ["Graduation", selectedLevel.graduation ? "Yes" : "No"],
                  ["Active", selectedLevel.active ? "Active" : "Inactive"],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label} className="space-y-1">
                  <p className={labelCls} style={labelStyle}>
                    {label}
                  </p>
                  <p
                    className="slds-text-4"
                    style={{ color: "var(--slds-g-color-text-default)" }}
                  >
                    {value}
                  </p>
                </div>
              ))}
              <div
                className="flex justify-end pt-2"
                style={{
                  borderTop: "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <button
                  onClick={() => setModalMode(null)}
                  className="h-9 px-5 rounded-full slds-text-4 font-medium"
                  style={{
                    border: "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor: "var(--slds-g-color-background-base)",
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
              {/* Academic Level + Next Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelCls} style={labelStyle}>
                    Academic Level{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={form.academicLevel}
                    onChange={(e) => setField("academicLevel", e.target.value)}
                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                    style={inputStyle(!!errors.academicLevel)}
                  >
                    <option value="">Select Academic Level</option>
                    {LEVEL_VALUES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  {errors.academicLevel && (
                    <p
                      className="flex items-center gap-1 text-[11px]"
                      style={{ color: "#c23934" }}
                    >
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      {errors.academicLevel}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls} style={labelStyle}>
                    Next Level
                  </label>
                  <select
                    value={form.nextLevel}
                    onChange={(e) => setField("nextLevel", e.target.value)}
                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                    style={inputStyle()}
                  >
                    <option value="">Select Next Level</option>
                    {LEVEL_VALUES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Graduation + Active checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelCls} style={labelStyle}>
                    Graduation
                  </label>
                  <div className="flex items-center gap-2 h-9">
                    <input
                      type="checkbox"
                      id="level-graduation"
                      checked={form.graduation}
                      onChange={(e) => setField("graduation", e.target.checked)}
                      className="h-4 w-4 rounded"
                      style={{ accentColor: "#145F33" }}
                    />
                    <label
                      htmlFor="level-graduation"
                      className="slds-text-4"
                      style={{ color: "var(--slds-g-color-text-default)" }}
                    >
                      Graduation level
                    </label>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls} style={labelStyle}>
                    Active
                  </label>
                  <div className="flex items-center gap-2 h-9">
                    <input
                      type="checkbox"
                      id="level-active"
                      checked={form.active}
                      onChange={(e) => setField("active", e.target.checked)}
                      className="h-4 w-4 rounded"
                      style={{ accentColor: "#145F33" }}
                    />
                    <label
                      htmlFor="level-active"
                      className="slds-text-4"
                      style={{ color: "var(--slds-g-color-text-default)" }}
                    >
                      Active
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div
                className="flex items-center justify-end gap-2 pt-2"
                style={{
                  borderTop: "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <button
                  onClick={() => setModalMode(null)}
                  className="h-9 px-5 rounded-full slds-text-4 font-medium"
                  style={{
                    border: "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor: "var(--slds-g-color-background-base)",
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
                      backgroundColor: "var(--slds-g-color-background-base)",
                      color: "#145F33",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f0fdf4")
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
                    (e.currentTarget.style.backgroundColor = "#0e4524")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#145F33")
                  }
                >
                  {modalMode === "create" ? "Save & Close" : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
