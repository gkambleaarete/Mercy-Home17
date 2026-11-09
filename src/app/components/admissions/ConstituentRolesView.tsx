import { useState } from "react";
import { toast } from "sonner@2.0.3";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConstituentRole {
    id: number;
    role: string;
    startDate: string;    // MM/DD/YYYY
    endDate: string;      // MM/DD/YYYY or ""
    status: string;
    notes: string;
}

interface FormState {
    role: string;
    startDate: string;
    endDate: string;
    status: string;
    notes: string;
}

interface FormErrors {
    role?: string;
    startDate?: string;
    status?: string;
    endDate?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
    "Organization",
    "Community Referral Organization",
    "Employer",
    "PSO Organization",
    "School",
];

const STATUS_OPTIONS = ["Active", "Inactive", "Pending", "Closed"];

const EMPTY_FORM: FormState = { role: "", startDate: "", endDate: "", status: "", notes: "" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toInputDate(mmddyyyy: string): string {
    if (!mmddyyyy) return "";
    const [m, d, y] = mmddyyyy.split("/");
    return `${y}-${m}-${d}`;
}

function fromInputDate(yyyymmdd: string): string {
    if (!yyyymmdd) return "";
    const [y, m, d] = yyyymmdd.split("-");
    return `${m}/${d}/${y}`;
}

function StatusBadge({ status }: { status: string }) {
    const isActive = status === "Active";
    const isPending = status === "Pending";
    let bg = "rgba(100,100,100,0.08)";
    let color = "var(--slds-g-color-text-weak)";
    if (isActive) { bg = "rgba(20,95,51,0.1)"; color = "#145F33"; }
    if (isPending) { bg = "#fff7ed"; color = "#92400e"; }
    return (
        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: bg, color }}>
            {status}
        </span>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            {/* Simple illustration reusing app pattern */}
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-4" aria-hidden="true">
                <rect x="8" y="16" width="48" height="36" rx="4" fill="var(--slds-g-color-background-alt)" stroke="var(--slds-g-color-border-base-1)" strokeWidth="1.5" />
                <rect x="16" y="26" width="20" height="2.5" rx="1.25" fill="var(--slds-g-color-border-base-1)" />
                <rect x="16" y="32" width="32" height="2.5" rx="1.25" fill="var(--slds-g-color-border-base-1)" />
                <rect x="16" y="38" width="24" height="2.5" rx="1.25" fill="var(--slds-g-color-border-base-1)" />
                <circle cx="48" cy="44" r="12" fill="#145F33" />
                <path d="M44 44h8M48 40v8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <p className="text-[14px] font-semibold mb-1" style={{ color: "var(--slds-g-color-text-default)" }}>
                No Constituent Roles
            </p>
            <p className="text-[13px] mb-5" style={{ color: "var(--slds-g-color-text-weak)" }}>
                No constituent roles have been added.
            </p>
            <button
                onClick={onAdd}
                className="h-8 px-4 rounded-full text-[12px] font-medium text-white"
                style={{ backgroundColor: "#145F33" }}
            >
                + Add Role
            </button>
        </div>
    );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function RoleModal({
    mode,
    form,
    errors,
    onChange,
    onSave,
    onSaveClose,
    onCancel,
}: {
    mode: "add" | "edit";
    form: FormState;
    errors: FormErrors;
    onChange: (field: keyof FormState, value: string) => void;
    onSave: () => void;
    onSaveClose: () => void;
    onCancel: () => void;
}) {
    const title = mode === "add" ? "Add Constituent Role" : "Edit Constituent Role";
    const supporting = mode === "add"
        ? "Assign a new organization role to this constituent."
        : "Update the selected organization role.";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-modal-title"
        >
            <div
                className="rounded-lg w-full max-w-lg mx-4 overflow-hidden flex flex-col"
                style={{
                    maxHeight: "90vh",
                    backgroundColor: "var(--slds-g-color-background-base)",
                    border: "1px solid var(--slds-g-color-border-base-1)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                }}
            >
                {/* Header */}
                <div
                    className="px-6 py-4 flex items-start justify-between flex-shrink-0"
                    style={{
                        borderBottom: "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: "var(--slds-g-color-background-alt)",
                    }}
                >
                    <div>
                        <h2
                            id="role-modal-title"
                            className="text-[15px] font-semibold"
                            style={{ color: "var(--slds-g-color-text-default)" }}
                        >
                            {title}
                        </h2>
                        <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            {supporting}
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-1.5 rounded hover:bg-gray-200 flex-shrink-0 ml-4"
                        style={{ color: "var(--slds-g-color-text-weak)" }}
                        aria-label="Close dialog"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-6 py-5">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        {/* Role */}
                        <div className="col-span-2 space-y-1.5">
                            <label htmlFor="modal-role" className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                                ROLE <span className="text-red-600">*</span>
                            </label>
                            <select
                                id="modal-role"
                                value={form.role}
                                onChange={(e) => onChange("role", e.target.value)}
                                className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
                                style={{
                                    border: `1px solid ${errors.role ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                                    backgroundColor: "var(--slds-g-color-background-base)",
                                    color: form.role ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)",
                                }}
                                aria-required="true"
                                aria-invalid={!!errors.role}
                            >
                                <option value="">Please Select</option>
                                {ROLE_OPTIONS.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                            {errors.role && (
                                <p className="text-[11px]" style={{ color: "#c23934" }} role="alert">{errors.role}</p>
                            )}
                        </div>

                        {/* Start Date */}
                        <div className="space-y-1.5">
                            <label htmlFor="modal-start" className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                                START DATE <span className="text-red-600">*</span>
                            </label>
                            <DateInput
                                id="modal-start"
value={isoToMdy(toInputDate(form.startDate))}
                                onChange={(v) => ((e) => onChange("startDate", fromInputDate(e.target.value)))({ target: { value: mdyToIso(v) } })}
                                className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
                                style={{
                                    border: `1px solid ${errors.startDate ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                                    backgroundColor: "var(--slds-g-color-background-base)",
                                    color: "var(--slds-g-color-text-default)",
                                }}
                                aria-required="true"
                                aria-invalid={!!errors.startDate}
                            />
                            {errors.startDate && (
                                <p className="text-[11px]" style={{ color: "#c23934" }} role="alert">{errors.startDate}</p>
                            )}
                        </div>

                        {/* End Date */}
                        <div className="space-y-1.5">
                            <label htmlFor="modal-end" className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                                END DATE
                            </label>
                            <DateInput
                                id="modal-end"
value={isoToMdy(toInputDate(form.endDate))}
                                onChange={(v) => ((e) => onChange("endDate", fromInputDate(e.target.value)))({ target: { value: mdyToIso(v) } })}
                                min={toInputDate(form.startDate)}
                                className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
                                style={{
                                    border: `1px solid ${errors.endDate ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                                    backgroundColor: "var(--slds-g-color-background-base)",
                                    color: "var(--slds-g-color-text-default)",
                                }}
                            />
                            {errors.endDate && (
                                <p className="text-[11px]" style={{ color: "#c23934" }} role="alert">{errors.endDate}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div className="col-span-2 space-y-1.5">
                            <label htmlFor="modal-status" className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                                STATUS <span className="text-red-600">*</span>
                            </label>
                            <select
                                id="modal-status"
                                value={form.status}
                                onChange={(e) => onChange("status", e.target.value)}
                                className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
                                style={{
                                    border: `1px solid ${errors.status ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                                    backgroundColor: "var(--slds-g-color-background-base)",
                                    color: form.status ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)",
                                }}
                                aria-required="true"
                                aria-invalid={!!errors.status}
                            >
                                <option value="">Please Select</option>
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            {errors.status && (
                                <p className="text-[11px]" style={{ color: "#c23934" }} role="alert">{errors.status}</p>
                            )}
                        </div>

                        {/* Notes */}
                        <div className="col-span-2 space-y-1.5">
                            <label htmlFor="modal-notes" className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                                NOTES
                            </label>
                            <textarea
                                id="modal-notes"
                                value={form.notes}
                                onChange={(e) => onChange("notes", e.target.value)}
                                rows={3}
                                placeholder="Add any relevant notes..."
                                className="w-full px-3 py-2 rounded text-[13px] focus:outline-none resize-y"
                                style={{
                                    border: "1px solid var(--slds-g-color-border-base-1)",
                                    backgroundColor: "var(--slds-g-color-background-base)",
                                    color: "var(--slds-g-color-text-default)",
                                    minHeight: "72px",
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div
                    className="px-6 py-4 flex justify-end gap-2 flex-shrink-0"
                    style={{
                        borderTop: "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: "var(--slds-g-color-background-alt)",
                    }}
                >
                    <button
                        onClick={onCancel}
                        className="h-9 px-4 rounded-full text-[13px] font-medium"
                        style={{
                            border: "1px solid var(--slds-g-color-border-base-1)",
                            color: "var(--slds-g-color-text-default)",
                            backgroundColor: "var(--slds-g-color-background-base)",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        className="h-9 px-4 rounded-full text-[13px] font-medium text-white"
                        style={{ backgroundColor: "#145F33" }}
                    >
                        Save
                    </button>
                    <button
                        onClick={onSaveClose}
                        className="h-9 px-4 rounded-full text-[13px] font-medium text-white"
                        style={{ backgroundColor: "#145F33" }}
                    >
                        Save &amp; Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

let nextId = 1;

export function ConstituentRolesView() {
    const [roles, setRoles] = useState<ConstituentRole[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
    const [errors, setErrors] = useState<FormErrors>({});

    const selectedRole = roles.find((r) => r.id === selectedId) ?? null;
    const hasSelection = selectedRole !== null;

    // ── Form field change ──────────────────────────────────────────────────────
    function handleChange(field: keyof FormState, value: string) {
        setForm((f) => ({ ...f, [field]: value }));
        setErrors((e) => ({ ...e, [field]: undefined }));
    }

    // ── Validation ─────────────────────────────────────────────────────────────
    function validate(): boolean {
        const errs: FormErrors = {};
        if (!form.role) errs.role = "Role is required.";
        if (!form.startDate) errs.startDate = "Start Date is required.";
        if (!form.status) errs.status = "Status is required.";
        if (form.endDate && form.startDate && form.endDate < form.startDate) {
            errs.endDate = "End Date must be greater than or equal to Start Date.";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    // ── Open modal ─────────────────────────────────────────────────────────────
    function openAdd() {
        setForm({ ...EMPTY_FORM });
        setErrors({});
        setModalMode("add");
        setModalOpen(true);
    }

    function openEdit() {
        if (!selectedRole) return;
        setForm({
            role: selectedRole.role,
            startDate: selectedRole.startDate,
            endDate: selectedRole.endDate,
            status: selectedRole.status,
            notes: selectedRole.notes,
        });
        setErrors({});
        setModalMode("edit");
        setModalOpen(true);
    }

    // ── Save (keep modal open) ─────────────────────────────────────────────────
    function handleSave() {
        if (!validate()) return;
        if (modalMode === "add") {
            const newRole: ConstituentRole = { id: nextId++, ...form };
            setRoles((prev) => [...prev, newRole]);
            setSelectedId(newRole.id);
            setForm({ ...EMPTY_FORM });
            setErrors({});
            toast.success("Constituent role added.");
        } else {
            setRoles((prev) =>
                prev.map((r) => (r.id === selectedId ? { ...r, ...form } : r))
            );
            toast.success("Constituent role updated.");
        }
    }

    // ── Save & Close ───────────────────────────────────────────────────────────
    function handleSaveClose() {
        if (!validate()) return;
        if (modalMode === "add") {
            const newRole: ConstituentRole = { id: nextId++, ...form };
            setRoles((prev) => [...prev, newRole]);
            setSelectedId(newRole.id);
        } else {
            setRoles((prev) =>
                prev.map((r) => (r.id === selectedId ? { ...r, ...form } : r))
            );
        }
        setModalOpen(false);
        toast.success(modalMode === "add" ? "Constituent role added." : "Constituent role updated.");
    }

    // ── Delete ─────────────────────────────────────────────────────────────────
    function handleDelete() {
        if (!selectedId) return;
        setRoles((prev) => prev.filter((r) => r.id !== selectedId));
        setSelectedId(null);
        toast.success("Constituent role deleted.");
    }

    // ── Row style ──────────────────────────────────────────────────────────────
    function rowStyle(id: number, idx: number): React.CSSProperties {
        const isSelected = id === selectedId;
        return {
            borderBottom: "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor: isSelected
                ? "rgba(20,95,51,0.05)"
                : idx % 2 === 0
                ? "var(--slds-g-color-background-base)"
                : "var(--slds-g-color-background-alt)",
            outline: isSelected ? "2px solid #145F33" : "none",
            outlineOffset: "-2px",
            cursor: "pointer",
        };
    }

    return (
        <>
            <div className="space-y-4 w-full">
                {/* ── Page Header Card ────────────────────────────────────── */}
                <div
                    className="overflow-hidden"
                    style={{
                        border: "1px solid var(--slds-g-color-border-base-1)",
                        borderRadius: "var(--slds-c-card-radius-border)",
                        backgroundColor: "var(--slds-g-color-background-base)",
                    }}
                >
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
                                Constituent Roles
                            </h3>
                            <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
                                Manage organization role assignments associated with this Organization constituent. Add, edit, and maintain organization roles throughout the constituent lifecycle.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                className="h-8 px-3 rounded-full text-[12px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    border: "1px solid var(--slds-g-color-border-base-1)",
                                    backgroundColor: "var(--slds-g-color-background-base)",
                                    color: "var(--slds-g-color-text-default)",
                                }}
                                disabled
                            >
                                Notes
                            </button>
                            <button
                                className="h-8 px-3 rounded-full text-[12px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    border: "1px solid var(--slds-g-color-border-base-1)",
                                    backgroundColor: "var(--slds-g-color-background-base)",
                                    color: "var(--slds-g-color-text-default)",
                                }}
                                disabled
                            >
                                Cancel
                            </button>
                            <button
                                className="h-8 px-3 rounded-full text-[12px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-white"
                                style={{ backgroundColor: "#145F33" }}
                                disabled
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Roles Card ───────────────────────────────────────────── */}
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
                        className="px-4 py-3"
                        style={{
                            borderBottom: "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor: "var(--slds-g-color-background-alt)",
                        }}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3
                                        className="text-[13px] font-semibold"
                                        style={{ color: "var(--slds-g-color-text-default)" }}
                                    >
                                        Constituent Roles
                                    </h3>
                                    {roles.length > 0 && (
                                        <span
                                            className="text-[12px] px-2 py-0.5 rounded-full font-medium"
                                            style={{ backgroundColor: "rgba(20,95,51,0.1)", color: "#145F33" }}
                                        >
                                            {roles.length}
                                        </span>
                                    )}
                                </div>
                                <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
                                    View and manage all organization roles assigned to this Organization constituent.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={openEdit}
                                    disabled={!hasSelection}
                                    className="h-8 px-3 rounded-full text-[12px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    style={{
                                        border: "1px solid var(--slds-g-color-border-base-1)",
                                        backgroundColor: "var(--slds-g-color-background-base)",
                                        color: "var(--slds-g-color-text-default)",
                                    }}
                                    title={hasSelection ? "Edit selected role" : "Select a row to edit"}
                                >
                                    Edit Role
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={!hasSelection}
                                    className="h-8 px-3 rounded-full text-[12px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    style={{
                                        border: "1px solid var(--slds-g-color-border-base-1)",
                                        backgroundColor: "var(--slds-g-color-background-base)",
                                        color: "var(--slds-g-color-text-default)",
                                    }}
                                    title={hasSelection ? "Delete selected role" : "Select a row to delete"}
                                >
                                    Delete
                                </button>
                                <button
                                    disabled={!hasSelection}
                                    className="h-8 px-3 rounded-full text-[12px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    style={{
                                        border: "1px solid var(--slds-g-color-border-base-1)",
                                        backgroundColor: "var(--slds-g-color-background-base)",
                                        color: "var(--slds-g-color-text-default)",
                                    }}
                                    title={hasSelection ? "View history" : "Select a row to view history"}
                                    onClick={() => toast.info("History functionality coming soon.")}
                                >
                                    History
                                </button>
                                <button
                                    onClick={openAdd}
                                    className="h-8 px-3 rounded-full text-[12px] font-medium text-white"
                                    style={{ backgroundColor: "#145F33" }}
                                >
                                    + Add Role
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table or Empty State */}
                    {roles.length === 0 ? (
                        <EmptyState onAdd={openAdd} />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 640 }}>
                                    <thead>
                                        <tr
                                            style={{
                                                backgroundColor: "var(--slds-g-color-background-alt)",
                                                borderBottom: "2px solid var(--slds-g-color-border-base-1)",
                                            }}
                                        >
                                            <th className="px-1 py-2.5 w-10" />
                                            <th
                                                className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                                                style={{ color: "var(--slds-g-color-text-weak)" }}
                                            >
                                                Role
                                            </th>
                                            <th
                                                className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                                                style={{ color: "var(--slds-g-color-text-weak)" }}
                                            >
                                                Start Date
                                            </th>
                                            <th
                                                className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                                                style={{ color: "var(--slds-g-color-text-weak)" }}
                                            >
                                                End Date
                                            </th>
                                            <th
                                                className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                                                style={{ color: "var(--slds-g-color-text-weak)" }}
                                            >
                                                Status
                                            </th>
                                            <th
                                                className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                                                style={{ color: "var(--slds-g-color-text-weak)" }}
                                            >
                                                Details
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles.map((r, idx) => (
                                            <tr
                                                key={r.id}
                                                onClick={() => setSelectedId(r.id === selectedId ? null : r.id)}
                                                style={rowStyle(r.id, idx)}
                                            >
                                                <td className="px-1 py-2.5 text-center">
                                                    <input
                                                        type="radio"
                                                        checked={r.id === selectedId}
                                                        onChange={() => setSelectedId(r.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{ accentColor: "#145F33" }}
                                                        aria-label={`Select role ${r.role}`}
                                                    />
                                                </td>
                                                <td
                                                    className="px-3 py-2.5 text-[13px] font-medium"
                                                    style={{ color: "var(--slds-g-color-text-default)" }}
                                                >
                                                    {r.role}
                                                </td>
                                                <td className="px-3 py-2.5 text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
                                                    {r.startDate}
                                                </td>
                                                <td className="px-3 py-2.5 text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
                                                    {r.endDate || <span style={{ color: "var(--slds-g-color-text-weak)" }}>—</span>}
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <StatusBadge status={r.status} />
                                                </td>
                                                <td className="px-3 py-2.5 text-[13px]" style={{ color: "var(--slds-g-color-text-weak)", maxWidth: 200 }}>
                                                    <span className="line-clamp-1">{r.notes || "—"}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div
                                className="px-4 py-2"
                                style={{
                                    borderTop: "1px solid var(--slds-g-color-border-base-1)",
                                    backgroundColor: "var(--slds-g-color-background-alt)",
                                }}
                            >
                                <span className="text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                                    {roles.length} record{roles.length !== 1 ? "s" : ""}
                                    {hasSelection ? " · 1 selected" : ""}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Add / Edit Modal ─────────────────────────────────────────── */}
            {modalOpen && (
                <RoleModal
                    mode={modalMode}
                    form={form}
                    errors={errors}
                    onChange={handleChange}
                    onSave={handleSave}
                    onSaveClose={handleSaveClose}
                    onCancel={() => setModalOpen(false)}
                />
            )}
        </>
    );
}
