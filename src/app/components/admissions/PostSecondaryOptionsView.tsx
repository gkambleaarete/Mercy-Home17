import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Eye, Pencil, Copy, Search, AlertCircle, ChevronDown } from "@/app/lib/lucide-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner@2.0.3";

// ── Constants ─────────────────────────────────────────────────────────────────

const DURATION_TYPES = ["Days", "Weeks"];

const TRACKING_OPTIONS = [
  "Not Started",
  "In Progress",
  "Completed",
  "Waived",
  "Withdrew",
  "Failed",
  "Requisite Pre-filled",
];

const SAMPLE_ENROLLED = [
  { id: 1, name: "Jordan Rivera", program: "Alternative HS", status: "Active" },
  { id: 2, name: "Sam Taylor", program: "Alternative HS", status: "Active" },
  { id: 3, name: "Casey Morgan", program: "Alternative HS", status: "Inactive" },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface PSOProgram {
  id: number;
  name: string;
  overview: string;
  duration: string;
  durationType: string;
  startDate: string;
  endDate: string;
  trackingOptions: string[];
}

type PSOModalMode = "create" | "edit" | "view" | "copy" | null;

interface PSOForm {
  name: string;
  overview: string;
  duration: string;
  durationType: string;
  startDate: string;
  endDate: string;
  trackingOptions: string[];
}

interface PSOErrors {
  name?: string;
  durationType?: string;
  endDate?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseMDY(s: string): Date | null {
  if (!s) return null;
  const [m, d, y] = s.split("/");
  if (!m || !d || !y) return null;
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  return isNaN(dt.getTime()) ? null : dt;
}

// ── Shared style helpers ──────────────────────────────────────────────────────

const labelCls = "slds-form-label block font-medium uppercase tracking-wide";
const labelStyle: React.CSSProperties = { color: "var(--slds-g-color-text-weak)" };

function inputStyle(hasError?: boolean): React.CSSProperties {
  return {
    border: `1px solid ${hasError ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
    backgroundColor: "var(--slds-g-color-background-base)",
    color: "var(--slds-g-color-text-default)",
    borderRadius: 4,
  };
}

function errMsg(msg: string) {
  return (
    <p className="flex items-center gap-1 text-[11px]" style={{ color: "#c23934" }}>
      <AlertCircle className="h-3 w-3 flex-shrink-0" />{msg}
    </p>
  );
}

// ── Portal single-select ──────────────────────────────────────────────────────

interface MenuPos { top: number; left: number; width: number; }

function PortalSelect({
  value, onChange, options, placeholder, hasError = false,
}: {
  value: string; onChange: (v: string) => void; options: string[];
  placeholder: string; hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const MAX_H = 220;
  const GAP = 4;

  function calcPos() {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom - GAP;
    const top = spaceBelow < MAX_H && r.top > MAX_H ? r.top - MAX_H - GAP : r.bottom + GAP;
    setMenuPos({ top, left: r.left, width: r.width });
  }

  useEffect(() => {
    if (!open) return;
    calcPos();
    const fn = () => calcPos();
    window.addEventListener("scroll", fn, true);
    window.addEventListener("resize", fn);
    return () => { window.removeEventListener("scroll", fn, true); window.removeEventListener("resize", fn); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function h(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current && !triggerRef.current.contains(t) && menuRef.current && !menuRef.current.contains(t)) setOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const menu = open && menuPos ? createPortal(
    <div ref={menuRef} style={{ position: "fixed", top: menuPos.top, left: menuPos.left, width: menuPos.width, zIndex: 9999, border: "1px solid var(--slds-g-color-border-base-1)", borderRadius: 4, backgroundColor: "var(--slds-g-color-background-base)", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", overflow: "hidden", maxHeight: MAX_H }}>
      <div className="overflow-y-auto" style={{ maxHeight: MAX_H }}>
        {options.map((opt) => (
          <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }}
            className="w-full flex items-center px-3 py-2 text-[12px] text-left transition-colors hover:bg-[#f3f3f3]"
            style={{ color: "var(--slds-g-color-text-default)", fontWeight: opt === value ? 600 : 400, backgroundColor: opt === value ? "rgba(20,95,51,0.06)" : undefined }}>
            {opt}
          </button>
        ))}
      </div>
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen((p) => !p)}
        className="h-9 w-full px-3 flex items-center justify-between rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33] text-left"
        style={{ border: `1px solid ${hasError ? "#c23934" : "var(--slds-g-color-border-base-1)"}`, backgroundColor: "var(--slds-g-color-background-base)", color: value ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)", borderRadius: 4 }}>
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 ml-1" style={{ color: "var(--slds-g-color-text-weak)" }} />
      </button>
      {menu}
    </>
  );
}

// ── Sample data ───────────────────────────────────────────────────────────────

const INITIAL_PROGRAMS: PSOProgram[] = [
  {
    id: 1,
    name: "Alternative High School Program",
    overview: "A comprehensive alternative education program designed to support youth in completing their high school diploma through non-traditional pathways.",
    duration: "6",
    durationType: "Weeks",
    startDate: "07/01/2025",
    endDate: "08/12/2025",
    trackingOptions: ["Not Started", "In Progress", "Completed", "Withdrew"],
  },
  {
    id: 2,
    name: "Workforce Readiness Bootcamp",
    overview: "Intensive job-readiness training covering resume writing, interview skills, and workplace expectations.",
    duration: "30",
    durationType: "Days",
    startDate: "09/01/2025",
    endDate: "09/30/2025",
    trackingOptions: ["Not Started", "In Progress", "Completed", "Waived"],
  },
];

const EMPTY_FORM: PSOForm = {
  name: "", overview: "", duration: "", durationType: "", startDate: "", endDate: "", trackingOptions: [],
};

// ── Tab types ─────────────────────────────────────────────────────────────────

type PSOTab = "overview" | "tracking" | "enrollment";

// ── Main component ────────────────────────────────────────────────────────────

export function PostSecondaryOptionsView() {
  const [programs, setPrograms] = useState<PSOProgram[]>(INITIAL_PROGRAMS);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<PSOModalMode>(null);
  const [activeProgram, setActiveProgram] = useState<PSOProgram | null>(null);
  const [form, setForm] = useState<PSOForm>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<PSOErrors>({});
  const [activeTab, setActiveTab] = useState<PSOTab>("overview");
  const [manageTrackingOpen, setManageTrackingOpen] = useState(false);
  const [tempTracking, setTempTracking] = useState<string[]>([]);

  const filtered = programs.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.overview.toLowerCase().includes(q);
  });

  // ── Form helpers ──────────────────────────────────────────────────────────

  function setField<K extends keyof PSOForm>(k: K, v: PSOForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function validate(): PSOErrors {
    const errs: PSOErrors = {};
    if (!form.name.trim()) errs.name = "Program Name is required";
    if (!form.durationType) errs.durationType = "Duration Type is required";
    if (form.startDate && form.endDate) {
      const s = parseMDY(form.startDate), e = parseMDY(form.endDate);
      if (s && e && e < s) errs.endDate = "End Date must be after Start Date";
    }
    return errs;
  }

  // ── Open helpers ──────────────────────────────────────────────────────────

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setActiveProgram(null);
    setActiveTab("overview");
    setModalMode("create");
  }

  function openEdit(p: PSOProgram) {
    setForm({ name: p.name, overview: p.overview, duration: p.duration, durationType: p.durationType, startDate: p.startDate, endDate: p.endDate, trackingOptions: [...p.trackingOptions] });
    setErrors({});
    setActiveProgram(p);
    setActiveTab("overview");
    setModalMode("edit");
  }

  function openView(p: PSOProgram) {
    setActiveProgram(p);
    setActiveTab("overview");
    setModalMode("view");
  }

  function openCopy(p: PSOProgram) {
    setForm({ name: p.name, overview: p.overview, duration: p.duration, durationType: p.durationType, startDate: p.startDate, endDate: p.endDate, trackingOptions: [...p.trackingOptions] });
    setErrors({});
    setActiveProgram(null);
    setActiveTab("overview");
    setModalMode("copy");
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  function handleSave(closeAfter: boolean) {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); setActiveTab("overview"); return; }

    if (modalMode === "create" || modalMode === "copy") {
      const newProg: PSOProgram = { id: Date.now(), ...form };
      setPrograms((prev) => [...prev, newProg]);
      toast.success(modalMode === "copy" ? "PSO Program copied successfully." : "PSO Program created successfully.");
    } else if (modalMode === "edit" && activeProgram) {
      setPrograms((prev) => prev.map((p) => p.id === activeProgram.id ? { ...p, ...form } : p));
      toast.success("PSO Program updated successfully.");
    }

    if (closeAfter) setModalMode(null);
    else { setForm({ ...EMPTY_FORM }); setErrors({}); }
  }

  // ── Tracking modal ────────────────────────────────────────────────────────

  function openManageTracking() {
    setTempTracking([...form.trackingOptions]);
    setManageTrackingOpen(true);
  }

  function applyTracking() {
    setField("trackingOptions", tempTracking);
    setManageTrackingOpen(false);
  }

  function toggleTracking(opt: string) {
    setTempTracking((prev) => prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]);
  }

  // ── Shared UI ─────────────────────────────────────────────────────────────

  const isReadOnly = modalMode === "view";
  const modalTitle =
    modalMode === "create" ? "Create New PSO Program"
    : modalMode === "edit" ? "Edit PSO Program"
    : modalMode === "copy" ? "Copy PSO Program"
    : "PSO Program Details";

  const cardStyle: React.CSSProperties = { border: "1px solid var(--slds-g-color-border-base-1)", borderRadius: "var(--slds-c-card-radius-border)", backgroundColor: "var(--slds-g-color-background-base)" };
  const cardHeaderStyle: React.CSSProperties = { borderBottom: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-alt)" };

  function secondaryBtn(label: string, onClick: () => void) {
    return (
      <button type="button" onClick={onClick}
        className="h-9 px-5 rounded-full slds-text-4 font-medium transition-colors"
        style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-alt)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-base)")}>
        {label}
      </button>
    );
  }

  function primaryBtn(label: string, onClick: () => void) {
    return (
      <button type="button" onClick={onClick}
        className="h-9 px-5 rounded-full slds-text-4 font-medium text-white transition-colors"
        style={{ backgroundColor: "#145F33" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e4524")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#145F33")}>
        {label}
      </button>
    );
  }

  function tabBtn(tab: PSOTab, label: string) {
    const active = activeTab === tab;
    return (
      <button type="button" onClick={() => setActiveTab(tab)}
        className="px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px"
        style={{ color: active ? "#145F33" : "var(--slds-g-color-text-weak)", borderBottomColor: active ? "#145F33" : "transparent", backgroundColor: "transparent" }}>
        {label}
      </button>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="overflow-hidden" style={cardStyle}>
        {/* Card header */}
        <div className="px-4 py-3 flex items-start justify-between gap-4" style={cardHeaderStyle}>
          <div>
            <h3 className="text-[13px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Post Secondary Options</h3>
            <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
              View and manage Post-Secondary Opportunity programs for this organization.
            </p>
          </div>
          <button onClick={openCreate}
            className="flex-shrink-0 h-8 px-3 rounded-full text-[12px] font-medium text-white flex items-center gap-1.5 transition-colors"
            style={{ backgroundColor: "#145F33" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e4524")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#145F33")}>
            <Plus className="h-3.5 w-3.5" /> Create New PSO Program
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--slds-g-color-text-weak)" }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PSO programs..."
              className="h-8 w-full pl-8 pr-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]"
              style={inputStyle()} />
          </div>
        </div>

        {/* Table / Empty */}
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ backgroundColor: "var(--slds-g-color-background-alt)" }}>
                  {["Name", "Start Date", "End Date", "Duration", "Overview", "Actions"].map((col) => (
                    <th key={col} className="px-4 py-2.5 text-left font-semibold whitespace-nowrap"
                      style={{ color: "var(--slds-g-color-text-default)", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="transition-colors"
                    style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-alt)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}>
                    <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: "var(--slds-g-color-text-default)" }}>{row.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--slds-g-color-text-default)" }}>{row.startDate || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--slds-g-color-text-default)" }}>{row.endDate || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--slds-g-color-text-default)" }}>
                      {row.duration && row.durationType ? `${row.duration} ${row.durationType}` : "—"}
                    </td>
                    <td className="px-4 py-3 max-w-[260px]">
                      <span className="block truncate" style={{ color: "var(--slds-g-color-text-weak)" }} title={row.overview}>
                        {row.overview || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openView(row)} className="h-7 w-7 rounded flex items-center justify-center transition-colors hover:bg-[#eff6ff]" style={{ color: "#0176d3" }} title="View">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => openEdit(row)} className="h-7 w-7 rounded flex items-center justify-center transition-colors hover:bg-[#eff6ff]" style={{ color: "#0176d3" }} title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => openCopy(row)} className="h-7 w-7 rounded flex items-center justify-center transition-colors hover:bg-[#eff6ff]" style={{ color: "#0176d3" }} title="Copy">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 text-[12px]" style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-weak)" }}>
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
        ) : search.trim() ? (
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
            <h3 className="text-[14px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>No matching programs found</h3>
            <p className="mt-1.5 slds-text-4 max-w-xs" style={{ color: "var(--slds-g-color-text-weak)" }}>Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
            <h3 className="mt-4 text-[14px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>No PSO Programs</h3>
            <p className="mt-1.5 slds-text-4 max-w-xs" style={{ color: "var(--slds-g-color-text-weak)" }}>No Post-Secondary Opportunity programs have been added yet.</p>
            <button onClick={openCreate}
              className="mt-4 h-8 px-4 rounded-full text-[12px] font-medium text-white flex items-center gap-1.5 transition-colors"
              style={{ backgroundColor: "#145F33" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e4524")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#145F33")}>
              <Plus className="h-3.5 w-3.5" /> Create New PSO Program
            </button>
          </div>
        )}
      </div>

      {/* ════════ PSO PROGRAM MODAL ════════ */}
      <Dialog open={modalMode !== null} onOpenChange={(o) => { if (!o) setModalMode(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby={undefined}>
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-[16px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              {modalTitle}
            </DialogTitle>
            {modalMode === "copy" && (
              <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
                Review and update the copied program information before saving it as a new PSO Program.
              </p>
            )}
            {isReadOnly && (
              <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
                Read-only view of program details.
              </p>
            )}
          </DialogHeader>

          {/* Tab bar */}
          <div className="flex-shrink-0 flex border-b" style={{ borderColor: "var(--slds-g-color-border-base-1)" }}>
            {tabBtn("overview", "Overview")}
            {tabBtn("tracking", "Tracking")}
            {tabBtn("enrollment", "Enrollment")}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {/* ── OVERVIEW TAB ── */}
            {activeTab === "overview" && (
              <div className="px-6 py-5 space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className={labelCls} style={labelStyle}>Name {!isReadOnly && <span className="text-red-600">*</span>}</label>
                  {isReadOnly ? (
                    <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{activeProgram?.name || "—"}</p>
                  ) : (
                    <>
                      <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)}
                        placeholder="Enter program name"
                        className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                        style={inputStyle(!!errors.name)} />
                      {errors.name && errMsg(errors.name)}
                    </>
                  )}
                </div>

                {/* Overview */}
                <div className="space-y-1.5">
                  <label className={labelCls} style={labelStyle}>Overview</label>
                  {isReadOnly ? (
                    <p className="slds-text-4 whitespace-pre-wrap" style={{ color: "var(--slds-g-color-text-default)" }}>{activeProgram?.overview || "—"}</p>
                  ) : (
                    <textarea value={form.overview} onChange={(e) => setField("overview", e.target.value)}
                      placeholder="Enter program overview" rows={4}
                      className="w-full px-3 py-2 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33] resize-y"
                      style={{ ...inputStyle(), minHeight: 96 }} />
                  )}
                </div>

                {/* Duration + Duration Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelCls} style={labelStyle}>Duration</label>
                    {isReadOnly ? (
                      <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>
                        {activeProgram?.duration && activeProgram?.durationType ? `${activeProgram.duration} ${activeProgram.durationType}` : "—"}
                      </p>
                    ) : (
                      <input type="number" min={0} value={form.duration} onChange={(e) => setField("duration", e.target.value)}
                        placeholder="Enter duration"
                        className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                        style={inputStyle()} />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls} style={labelStyle}>Duration Type {!isReadOnly && <span className="text-red-600">*</span>}</label>
                    {isReadOnly ? (
                      <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{activeProgram?.durationType || "—"}</p>
                    ) : (
                      <>
                        <PortalSelect value={form.durationType} onChange={(v) => setField("durationType", v)}
                          options={DURATION_TYPES} placeholder="Select Duration Type" hasError={!!errors.durationType} />
                        {errors.durationType && errMsg(errors.durationType)}
                      </>
                    )}
                  </div>
                </div>

                {/* Start Date + End Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelCls} style={labelStyle}>Start Date</label>
                    {isReadOnly ? (
                      <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{activeProgram?.startDate || "—"}</p>
                    ) : (
                      <input type="text" value={form.startDate} onChange={(e) => setField("startDate", e.target.value)}
                        placeholder="MM/DD/YYYY"
                        className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                        style={inputStyle()} />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls} style={labelStyle}>End Date</label>
                    {isReadOnly ? (
                      <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{activeProgram?.endDate || "—"}</p>
                    ) : (
                      <>
                        <input type="text" value={form.endDate} onChange={(e) => setField("endDate", e.target.value)}
                          placeholder="MM/DD/YYYY"
                          className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                          style={inputStyle(!!errors.endDate)} />
                        {errors.endDate && errMsg(errors.endDate)}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── TRACKING TAB ── */}
            {activeTab === "tracking" && (
              <div className="px-6 py-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-[13px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Tracking Options</h4>
                    <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
                      Select the tracking statuses that can be used for this program.
                    </p>
                  </div>
                  {!isReadOnly && (
                    <button type="button" onClick={openManageTracking}
                      className="flex-shrink-0 h-8 px-3 rounded-full text-[12px] font-medium transition-colors"
                      style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-alt)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-base)")}>
                      Manage Tracking Options
                    </button>
                  )}
                </div>

                {/* Display current tracking options */}
                <div className="space-y-2">
                  {TRACKING_OPTIONS.map((opt) => {
                    const selectedList = isReadOnly ? (activeProgram?.trackingOptions ?? []) : form.trackingOptions;
                    const checked = selectedList.includes(opt);
                    return (
                      <div key={opt} className="flex items-center gap-2 py-1.5 px-3 rounded"
                        style={{ backgroundColor: checked ? "rgba(20,95,51,0.04)" : "transparent", border: `1px solid ${checked ? "rgba(20,95,51,0.15)" : "transparent"}` }}>
                        <input type="checkbox" checked={checked} readOnly={isReadOnly}
                          onChange={isReadOnly ? undefined : () => {
                            const next = form.trackingOptions.includes(opt)
                              ? form.trackingOptions.filter((o) => o !== opt)
                              : [...form.trackingOptions, opt];
                            setField("trackingOptions", next);
                          }}
                          className="h-4 w-4 rounded" style={{ accentColor: "#145F33" }} />
                        <span className="slds-text-4" style={{ color: checked ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)" }}>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── ENROLLMENT TAB ── */}
            {activeTab === "enrollment" && (
              <div className="px-6 py-5">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-[13px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Enrolled Constituents</h4>
                    <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
                      Enrollment information is read-only.
                    </p>
                  </div>
                </div>

                {(modalMode === "create" || modalMode === "copy") ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded"
                    style={{ border: "1px dashed var(--slds-g-color-border-base-1)" }}>
                    <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-weak)" }}>No constituents are currently enrolled in this program.</p>
                  </div>
                ) : SAMPLE_ENROLLED.length > 0 ? (
                  <div className="overflow-x-auto rounded" style={{ border: "1px solid var(--slds-g-color-border-base-1)" }}>
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr style={{ backgroundColor: "var(--slds-g-color-background-alt)" }}>
                          {["Name", "Program", "Status"].map((col) => (
                            <th key={col} className="px-4 py-2.5 text-left font-semibold whitespace-nowrap"
                              style={{ color: "var(--slds-g-color-text-default)", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {SAMPLE_ENROLLED.map((row) => (
                          <tr key={row.id} style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                            <td className="px-4 py-3 font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>{row.name}</td>
                            <td className="px-4 py-3" style={{ color: "var(--slds-g-color-text-weak)" }}>{row.program}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                                style={{
                                  backgroundColor: row.status === "Active" ? "rgba(20,95,51,0.1)" : "var(--slds-g-color-background-alt)",
                                  color: row.status === "Active" ? "#145F33" : "var(--slds-g-color-text-weak)",
                                  border: `1px solid ${row.status === "Active" ? "rgba(20,95,51,0.2)" : "var(--slds-g-color-border-base-1)"}`,
                                }}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded"
                    style={{ border: "1px dashed var(--slds-g-color-border-base-1)" }}>
                    <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-weak)" }}>No constituents are currently enrolled in this program.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 flex-shrink-0"
            style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}>
            {isReadOnly ? (
              secondaryBtn("Close", () => setModalMode(null))
            ) : (
              <>
                {secondaryBtn("Cancel", () => setModalMode(null))}
                {(modalMode === "create" || modalMode === "copy") && (
                  <button type="button" onClick={() => handleSave(false)}
                    className="h-9 px-5 rounded-full slds-text-4 font-medium transition-colors"
                    style={{ border: "1px solid #145F33", backgroundColor: "var(--slds-g-color-background-base)", color: "#145F33" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0fdf4")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-base)")}>
                    Save
                  </button>
                )}
                {primaryBtn(modalMode === "edit" ? "Save Changes" : "Save & Close", () => handleSave(true))}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ════════ MANAGE TRACKING OPTIONS MODAL ════════ */}
      <Dialog open={manageTrackingOpen} onOpenChange={(o) => { if (!o) setManageTrackingOpen(false); }}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto" aria-describedby="manage-tracking-desc">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              Manage Tracking Options
            </DialogTitle>
            <p id="manage-tracking-desc" className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
              Select the tracking statuses that apply to this program.
            </p>
          </DialogHeader>
          <div className="space-y-1 pt-2">
            <div className="overflow-hidden rounded" style={{ border: "1px solid var(--slds-g-color-border-base-1)" }}>
              <div className="px-3 py-2 flex items-center gap-3" style={{ backgroundColor: "var(--slds-g-color-background-alt)", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                <span className="slds-form-label font-medium uppercase tracking-wide" style={{ color: "var(--slds-g-color-text-weak)" }}>Selected</span>
                <span className="slds-form-label font-medium uppercase tracking-wide" style={{ color: "var(--slds-g-color-text-weak)" }}>Tracking Option</span>
              </div>
              {TRACKING_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors hover:bg-[#f3f3f3]"
                  style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                  <input type="checkbox" checked={tempTracking.includes(opt)} onChange={() => toggleTracking(opt)}
                    className="h-4 w-4 rounded flex-shrink-0" style={{ accentColor: "#145F33" }} />
                  <span className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-4" style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}>
            {secondaryBtn("Cancel", () => setManageTrackingOpen(false))}
            {primaryBtn("Apply", applyTracking)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
