import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Eye, Pencil, BookOpen, Copy, Search, AlertCircle, X, ChevronDown, RefreshCw, AlertTriangle } from "@/app/lib/lucide-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner@2.0.3";

// ── Constants ─────────────────────────────────────────────────────────────────

const DESCRIPTION_VALUES = [
  "2026-2027 School Year",
  "2025-2026 School Year",
  "2024-2025 School Year",
  "2023-2024 School Year",
  "2022-2023 School Year",
  "2021-2022 School Year",
  "2020-2021 School Year (Summer)",
  "2020-2021 School Year",
  "2019-2020 School Year (Summer)",
  "2019-2020 School Year",
  "2018-2019 School Year",
  "2017-2018 School Year (Summer)",
  "2017-2018 School Year",
  "2016-2017 School Year",
  "2015-2016 School Year",
  "2014-2015 School Year",
  "2013-2014 School Year",
  "2012-2013 School Year",
  "2011-2012 School Year",
  "2010-2011 School Year",
  "2009-2010 School Year",
];

const TERM_TYPES = ["Quarter", "Semester", "Trimester"];

const TERM_VALUES = [
  "Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4",
  "Semester 1", "Semester 2",
  "Trimester 1", "Trimester 2", "Trimester 3",
  "Winter Session", "Summer Session", "Term Undefined in Conversion",
];

const REPORTING_PERIOD_VALUES = [
  "Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4",
  "Semester 1 Cumulative", "Semester 2 Cumulative", "Annual Cumulative",
  "Semester 1", "Semester 2",
  "Trimester 1", "Trimester 2", "Trimester 3",
  "Summer Session", "Winter Session",
];

const GRADING_CODES = [
  "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-",
  "D+", "D", "D-", "E", "F", "Fail", "Pass", "Withdrawn", "Dropped",
  "Recovery In Progress", "1", "2", "3", "4", "I",
  "(Fail)", "(Pass)", "N", "Off Track",
  "100", "99", "98", "97", "96", "95", "94", "93", "92", "91", "90",
  "89", "88", "87", "86", "85", "84", "83", "82", "81", "80",
  "79", "78", "77", "76", "75", "74", "73", "72", "71", "70",
  "FX", "S (Satisfactory)",
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface AcademicYear {
  id: number;
  description: string;
  termType: string;
  gpaCalculation: string;
  trackCgpa: boolean;
  startDate: string;
  endDate: string;
  gradingDefaults: string[];
}

interface AcademicTerm {
  id: number;
  term: string;
  startDate: string;
  endDate: string;
  reportingPeriods: string[];
}

interface SchoolCourse {
  id: number;
  course: string;
  abilityGroup: string;
  subjectArea: string;
  grading: string[];
}

type YearModalMode = "create" | "edit" | "view" | null;
type TermModalMode = "create" | "edit" | "view" | null;

interface YearForm {
  description: string;
  termType: string;
  trackCgpa: boolean;
  startDate: string;
  endDate: string;
  gradingDefaults: string[];
}

interface YearErrors {
  description?: string;
  termType?: string;
  startDate?: string;
  endDate?: string;
  gradingDefaults?: string;
}

interface TermForm {
  term: string;
  startDate: string;
  endDate: string;
  reportingPeriods: string[];
}

interface TermErrors {
  term?: string;
  startDate?: string;
  endDate?: string;
  overlap?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function descToKey(desc: string): string {
  // "2025-2026 School Year" → "2025-2026"
  return desc.split(" ")[0];
}

function parseMDY(s: string): Date | null {
  if (!s) return null;
  const [m, d, y] = s.split("/");
  if (!m || !d || !y) return null;
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  return isNaN(dt.getTime()) ? null : dt;
}

function datesOverlap(aS: string, aE: string, bS: string, bE: string): boolean {
  const as = parseMDY(aS), ae = parseMDY(aE), bs = parseMDY(bS), be = parseMDY(bE);
  if (!as || !ae || !bs || !be) return false;
  return as <= be && ae >= bs;
}

// ── Sample data ───────────────────────────────────────────────────────────────

const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  {
    id: 1,
    description: "2025-2026 School Year",
    termType: "Semester",
    gpaCalculation: "4.0",
    trackCgpa: true,
    startDate: "07/01/2025",
    endDate: "06/30/2026",
    gradingDefaults: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D", "F"],
  },
  {
    id: 2,
    description: "2024-2025 School Year",
    termType: "Quarter",
    gpaCalculation: "4.0",
    trackCgpa: false,
    startDate: "07/01/2024",
    endDate: "06/30/2025",
    gradingDefaults: ["A", "B", "C", "D", "F", "Pass", "Fail"],
  },
];

const INITIAL_TERMS: Record<string, AcademicTerm[]> = {
  "2025-2026": [
    { id: 1, term: "Semester 1", startDate: "07/01/2025", endDate: "01/30/2026", reportingPeriods: ["Semester 1 Cumulative", "Annual Cumulative"] },
    { id: 2, term: "Semester 2", startDate: "02/01/2026", endDate: "06/30/2026", reportingPeriods: ["Semester 2 Cumulative", "Annual Cumulative"] },
  ],
  "2024-2025": [
    { id: 10, term: "Quarter 1", startDate: "07/01/2024", endDate: "10/30/2024", reportingPeriods: ["Quarter 1"] },
    { id: 11, term: "Quarter 2", startDate: "11/01/2024", endDate: "01/30/2025", reportingPeriods: ["Quarter 2", "Semester 1 Cumulative"] },
  ],
};

const SAMPLE_COURSES: SchoolCourse[] = [
  { id: 1001, course: "Math", abilityGroup: "Special Education", subjectArea: "Math", grading: [] },
  { id: 1002, course: "Reading", abilityGroup: "Special Education", subjectArea: "English Language Arts", grading: [] },
  { id: 1003, course: "Physical Education", abilityGroup: "Standard", subjectArea: "Physical Education and/or Health", grading: [] },
  { id: 1004, course: "Science", abilityGroup: "Standard", subjectArea: "Science", grading: ["A", "B+"] },
];

const EMPTY_YEAR_FORM: YearForm = {
  description: "", termType: "", trackCgpa: false, startDate: "", endDate: "", gradingDefaults: [],
};

const EMPTY_TERM_FORM: TermForm = { term: "", startDate: "", endDate: "", reportingPeriods: [] };

// ── Portal Select (single-select dropdown via portal) ─────────────────────────

interface MenuPos { top: number; left: number; width: number; }

function PortalSelect({
  value, onChange, options, placeholder, hasError = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const MENU_MAX_H = 240;
  const MENU_GAP = 4;

  function calcPos() {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom - MENU_GAP;
    const openAbove = spaceBelow < MENU_MAX_H && r.top > MENU_MAX_H;
    setMenuPos({ top: openAbove ? r.top - MENU_MAX_H - MENU_GAP : r.bottom + MENU_GAP, left: r.left, width: r.width });
  }

  useEffect(() => {
    if (!open) return;
    calcPos();
    const onScroll = () => calcPos();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll, true); window.removeEventListener("resize", onScroll); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current && !triggerRef.current.contains(t) && menuRef.current && !menuRef.current.contains(t)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const menu = open && menuPos
    ? createPortal(
        <div ref={menuRef} style={{ position: "fixed", top: menuPos.top, left: menuPos.left, width: menuPos.width, zIndex: 9999, border: "1px solid var(--slds-g-color-border-base-1)", borderRadius: 4, backgroundColor: "var(--slds-g-color-background-base)", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", overflow: "hidden", maxHeight: MENU_MAX_H }}>
          <div className="overflow-y-auto" style={{ maxHeight: MENU_MAX_H }}>
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
      )
    : null;

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

// ── Multi-Select (portal-based) ───────────────────────────────────────────────

function MultiSelect({
  options, selected, onChange, placeholder, searchable = false, hasError = false,
}: {
  options: string[]; selected: string[]; onChange: (v: string[]) => void;
  placeholder: string; searchable?: boolean; hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const MENU_MAX_H = 240;
  const MENU_GAP = 4;

  function calcPos() {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom - MENU_GAP;
    const openAbove = spaceBelow < MENU_MAX_H && r.top > MENU_MAX_H;
    setMenuPos({ top: openAbove ? r.top - MENU_MAX_H - MENU_GAP : r.bottom + MENU_GAP, left: r.left, width: r.width });
  }

  useEffect(() => {
    if (!open) return;
    calcPos();
    const onScroll = () => calcPos();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll, true); window.removeEventListener("resize", onScroll); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current && !triggerRef.current.contains(t) && menuRef.current && !menuRef.current.contains(t)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = searchable ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase())) : options;
  function toggle(v: string) { onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]); }

  const menu = open && menuPos
    ? createPortal(
        <div ref={menuRef} style={{ position: "fixed", top: menuPos.top, left: menuPos.left, width: menuPos.width, zIndex: 9999, border: "1px solid var(--slds-g-color-border-base-1)", borderRadius: 4, backgroundColor: "var(--slds-g-color-background-base)", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", overflow: "hidden", maxHeight: MENU_MAX_H }}>
          {searchable && (
            <div className="px-2 py-2 border-b" style={{ borderColor: "var(--slds-g-color-border-base-1)" }}>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3" style={{ color: "var(--slds-g-color-text-weak)" }} />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
                  className="h-7 w-full pl-6 pr-2 rounded text-[12px] focus:outline-none"
                  style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)" }} />
              </div>
            </div>
          )}
          <div className="overflow-y-auto" style={{ maxHeight: searchable ? 192 : MENU_MAX_H }}>
            {filtered.map((opt) => (
              <button key={opt} type="button" onClick={() => toggle(opt)}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left transition-colors hover:bg-[#f3f3f3]"
                style={{ color: "var(--slds-g-color-text-default)" }}>
                <input type="checkbox" readOnly checked={selected.includes(opt)} className="h-3.5 w-3.5 rounded flex-shrink-0" style={{ accentColor: "#145F33" }} />
                <span>{opt}</span>
              </button>
            ))}
            {filtered.length === 0 && <p className="px-3 py-3 text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>No results</p>}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <div>
      <button ref={triggerRef} type="button" onClick={() => setOpen((p) => !p)}
        className="h-9 w-full px-3 flex items-center justify-between rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33] text-left"
        style={{ border: `1px solid ${hasError ? "#c23934" : "var(--slds-g-color-border-base-1)"}`, backgroundColor: "var(--slds-g-color-background-base)", color: selected.length ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)", borderRadius: 4 }}>
        <span className="truncate">
          {selected.length === 0 ? placeholder : selected.length === 1 ? selected[0] : `${selected.length} selected`}
        </span>
        <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 ml-1" style={{ color: "var(--slds-g-color-text-weak)" }} />
      </button>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {selected.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
              style={{ backgroundColor: "rgba(20,95,51,0.1)", color: "#145F33", border: "1px solid rgba(20,95,51,0.2)" }}>
              {v}
              <button type="button" onClick={(e) => { e.stopPropagation(); toggle(v); }} className="hover:opacity-70" aria-label={`Remove ${v}`}>
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      {menu}
    </div>
  );
}

// ── Grading Defaults Checklist (inline panel, not a dropdown) ─────────────────

function GradingChecklist({
  selected, onChange, hasError,
}: {
  selected: string[]; onChange: (v: string[]) => void; hasError?: boolean;
}) {
  const [search, setSearch] = useState("");
  const filtered = search.trim()
    ? GRADING_CODES.filter((c) => c.toLowerCase().includes(search.toLowerCase()))
    : GRADING_CODES;

  function toggle(v: string) { onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]); }

  const PREVIEW_COUNT = 5;
  const previewCodes = selected.slice(0, PREVIEW_COUNT);
  const remainder = selected.length - PREVIEW_COUNT;

  return (
    <div>
      {/* Search + Select All / Deselect All */}
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--slds-g-color-text-weak)" }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search grading codes..."
            className="h-8 w-full pl-8 pr-3 rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-[#145F33]"
            style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)" }} />
        </div>
        <button type="button" onClick={() => onChange([...GRADING_CODES])}
          className="h-8 px-3 rounded-full text-[12px] font-medium whitespace-nowrap transition-colors"
          style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-alt)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-base)")}>
          Select All
        </button>
        <button type="button" onClick={() => onChange([])}
          className="h-8 px-3 rounded-full text-[12px] font-medium whitespace-nowrap transition-colors"
          style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-alt)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-base)")}>
          Deselect All
        </button>
      </div>

      {/* Scrollable checklist */}
      <div className="overflow-y-auto rounded" style={{ maxHeight: 200, border: `1px solid ${hasError ? "#c23934" : "var(--slds-g-color-border-base-1)"}`, backgroundColor: "var(--slds-g-color-background-base)" }}>
        {filtered.map((code) => (
          <label key={code} className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-[#f3f3f3] text-[12px]"
            style={{ color: "var(--slds-g-color-text-default)" }}>
            <input type="checkbox" checked={selected.includes(code)} onChange={() => toggle(code)}
              className="h-3.5 w-3.5 rounded flex-shrink-0" style={{ accentColor: "#145F33" }} />
            <span>{code}</span>
          </label>
        ))}
        {filtered.length === 0 && <p className="px-3 py-3 text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>No results</p>}
      </div>

      {/* Compact summary */}
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          <span className="text-[11px]" style={{ color: "var(--slds-g-color-text-weak)" }}>Selected:</span>
          {previewCodes.map((c) => (
            <span key={c} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
              style={{ backgroundColor: "rgba(20,95,51,0.1)", color: "#145F33", border: "1px solid rgba(20,95,51,0.2)" }}>
              {c}
            </span>
          ))}
          {remainder > 0 && (
            <span className="text-[11px] font-medium" style={{ color: "var(--slds-g-color-text-weak)" }}>+ {remainder} more</span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

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

// ── Main component ────────────────────────────────────────────────────────────

export function AcademicTermsView() {
  // ── Academic Year state ────────────────────────────────────────────────────
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(INITIAL_ACADEMIC_YEARS);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(INITIAL_ACADEMIC_YEARS[0].id);
  const [yearModalMode, setYearModalMode] = useState<YearModalMode>(null);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  const [yearForm, setYearForm] = useState<YearForm>({ ...EMPTY_YEAR_FORM });
  const [yearErrors, setYearErrors] = useState<YearErrors>({});

  // ── Term state ─────────────────────────────────────────────────────────────
  const [termsByYear, setTermsByYear] = useState<Record<string, AcademicTerm[]>>(INITIAL_TERMS);
  const [termSearch, setTermSearch] = useState("");
  const [termModalMode, setTermModalMode] = useState<TermModalMode>(null);
  const [selectedTerm, setSelectedTerm] = useState<AcademicTerm | null>(null);
  const [termForm, setTermForm] = useState<TermForm>({ ...EMPTY_TERM_FORM });
  const [termErrors, setTermErrors] = useState<TermErrors>({});

  // ── Courses state ──────────────────────────────────────────────────────────
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [coursesTerm, setCoursesTerm] = useState<AcademicTerm | null>(null);
  const [courseRows, setCourseRows] = useState<(SchoolCourse & { selected: boolean })[]>([]);
  const [assignGradingOpen, setAssignGradingOpen] = useState(false);
  const [selectedGradingCodes, setSelectedGradingCodes] = useState<string[]>([]);
  const [gradingError, setGradingError] = useState("");

  // ── Copy state ─────────────────────────────────────────────────────────────
  const [copyOpen, setCopyOpen] = useState(false);
  const [copySource, setCopySource] = useState("");
  const [copyDest, setCopyDest] = useState("");
  const [copyErrors, setCopyErrors] = useState<{ source?: string; dest?: string; same?: string }>({});

  // ── Derived ────────────────────────────────────────────────────────────────
  const activeYear = academicYears.find((y) => y.id === selectedYearId) ?? null;
  const activeKey = activeYear ? descToKey(activeYear.description) : null;
  const terms = activeKey ? (termsByYear[activeKey] ?? []) : [];
  const filteredTerms = terms.filter((t) => {
    if (!termSearch.trim()) return true;
    const q = termSearch.toLowerCase();
    return t.term.toLowerCase().includes(q) || t.reportingPeriods.some((r) => r.toLowerCase().includes(q));
  });

  // ── Year CRUD ──────────────────────────────────────────────────────────────

  function setYearField<K extends keyof YearForm>(k: K, v: YearForm[K]) {
    setYearForm((f) => ({ ...f, [k]: v }));
    setYearErrors((e) => ({ ...e, [k]: undefined }));
  }

  function validateYear(): YearErrors {
    const errs: YearErrors = {};
    if (!yearForm.description) errs.description = "Academic Year Description is required";
    if (!yearForm.termType) errs.termType = "Term Type is required";
    if (!yearForm.startDate) errs.startDate = "Start Date is required";
    if (yearForm.startDate && yearForm.endDate) {
      const s = parseMDY(yearForm.startDate), e = parseMDY(yearForm.endDate);
      if (s && e && e < s) errs.endDate = "End Date must be after Start Date";
    }
    if (yearForm.gradingDefaults.length === 0) errs.gradingDefaults = "At least one grading code must be selected";
    return errs;
  }

  function openYearCreate() {
    setYearForm({ ...EMPTY_YEAR_FORM });
    setYearErrors({});
    setSelectedYear(null);
    setYearModalMode("create");
  }

  function openYearEdit(y: AcademicYear) {
    setYearForm({ description: y.description, termType: y.termType, trackCgpa: y.trackCgpa, startDate: y.startDate, endDate: y.endDate, gradingDefaults: [...y.gradingDefaults] });
    setYearErrors({});
    setSelectedYear(y);
    setYearModalMode("edit");
  }

  function openYearView(y: AcademicYear) {
    setSelectedYear(y);
    setYearModalMode("view");
  }

  function handleYearSave(closeAfter: boolean) {
    const errs = validateYear();
    if (Object.keys(errs).length > 0) { setYearErrors(errs); return; }

    if (yearModalMode === "create") {
      const newYear: AcademicYear = { id: Date.now(), ...yearForm, gpaCalculation: "4.0" };
      setAcademicYears((prev) => [...prev, newYear]);
      setSelectedYearId(newYear.id);
      toast.success("Academic year created successfully.");
    } else if (selectedYear) {
      setAcademicYears((prev) => prev.map((y) => y.id === selectedYear.id ? { ...y, ...yearForm } : y));
      toast.success("Academic year updated successfully.");
    }

    if (closeAfter) setYearModalMode(null);
    else { setYearForm({ ...EMPTY_YEAR_FORM }); setYearErrors({}); }
  }

  // ── Term CRUD ──────────────────────────────────────────────────────────────

  function setTermField<K extends keyof TermForm>(k: K, v: TermForm[K]) {
    setTermForm((f) => ({ ...f, [k]: v }));
    setTermErrors((e) => ({ ...e, [k]: undefined, overlap: undefined }));
  }

  function validateTerm(excludeId?: number): TermErrors {
    const errs: TermErrors = {};
    if (!termForm.term) errs.term = "Term is required.";
    if (!termForm.startDate) errs.startDate = "Start Date is required.";
    if (!termForm.endDate) errs.endDate = "End Date is required.";
    if (termForm.startDate && termForm.endDate) {
      const s = parseMDY(termForm.startDate), e = parseMDY(termForm.endDate);
      if (s && e && e < s) errs.endDate = "End Date must be after Start Date.";
    }
    if (!errs.startDate && !errs.endDate && termForm.startDate && termForm.endDate && activeKey) {
      const existing = (termsByYear[activeKey] ?? []).filter((t) => t.id !== excludeId);
      if (existing.some((t) => datesOverlap(termForm.startDate, termForm.endDate, t.startDate, t.endDate)))
        errs.overlap = "Academic Term dates cannot overlap with an existing term.";
    }
    return errs;
  }

  function openTermCreate() { setTermForm({ ...EMPTY_TERM_FORM }); setTermErrors({}); setSelectedTerm(null); setTermModalMode("create"); }
  function openTermEdit(t: AcademicTerm) { setTermForm({ term: t.term, startDate: t.startDate, endDate: t.endDate, reportingPeriods: [...t.reportingPeriods] }); setTermErrors({}); setSelectedTerm(t); setTermModalMode("edit"); }
  function openTermView(t: AcademicTerm) { setSelectedTerm(t); setTermModalMode("view"); }

  function handleTermSave(closeAfter: boolean) {
    const excludeId = termModalMode === "edit" ? selectedTerm?.id : undefined;
    const errs = validateTerm(excludeId);
    if (Object.keys(errs).length > 0) { setTermErrors(errs); return; }
    if (!activeKey) return;

    if (termModalMode === "create") {
      setTermsByYear((prev) => ({ ...prev, [activeKey]: [...(prev[activeKey] ?? []), { id: Date.now(), ...termForm }] }));
      toast.success("Academic term created successfully.");
    } else if (selectedTerm) {
      setTermsByYear((prev) => ({ ...prev, [activeKey]: (prev[activeKey] ?? []).map((t) => t.id === selectedTerm.id ? { ...t, ...termForm } : t) }));
      toast.success("Academic term updated successfully.");
    }
    if (closeAfter) setTermModalMode(null);
    else { setTermForm({ ...EMPTY_TERM_FORM }); setTermErrors({}); }
  }

  // ── Courses ────────────────────────────────────────────────────────────────

  function openCourses(t: AcademicTerm) {
    setCoursesTerm(t);
    setCourseRows(SAMPLE_COURSES.map((c) => ({ ...c, selected: false })));
    setAssignGradingOpen(false); setSelectedGradingCodes([]); setGradingError("");
    setCoursesOpen(true);
  }

  function handleAssignGrading() {
    if (!courseRows.some((r) => r.selected)) { toast.error("Please select at least one course to assign grading."); return; }
    setSelectedGradingCodes([]); setGradingError(""); setAssignGradingOpen(true);
  }

  function applyGrading() {
    if (selectedGradingCodes.length === 0) { setGradingError("Please select at least one grading code."); return; }
    setCourseRows((rows) => rows.map((r) => r.selected ? { ...r, grading: Array.from(new Set([...r.grading, ...selectedGradingCodes])) } : r));
    toast.success("Grading codes assigned successfully."); setAssignGradingOpen(false);
  }

  function handleCopy() {
    const errs: typeof copyErrors = {};
    if (!copySource) errs.source = "Source Term is required.";
    if (!copyDest) errs.dest = "Destination Term is required.";
    if (copySource && copyDest && copySource === copyDest) errs.same = "Source Term and Destination Term cannot be the same.";
    if (Object.keys(errs).length > 0) { setCopyErrors(errs); return; }
    toast.success(`Courses copied from ${copySource} to ${copyDest}.`);
    setCopyOpen(false);
  }

  const selectedCourseCount = courseRows.filter((r) => r.selected).length;
  const allCoursesSelected = courseRows.length > 0 && courseRows.every((r) => r.selected);

  // ── Render ─────────────────────────────────────────────────────────────────

  const cardStyle: React.CSSProperties = {
    border: "1px solid var(--slds-g-color-border-base-1)",
    borderRadius: "var(--slds-c-card-radius-border)",
    backgroundColor: "var(--slds-g-color-background-base)",
  };
  const cardHeaderStyle: React.CSSProperties = {
    borderBottom: "1px solid var(--slds-g-color-border-base-1)",
    backgroundColor: "var(--slds-g-color-background-alt)",
  };

  return (
    <div className="space-y-4">

      {/* ════════════════ ACADEMIC YEARS CARD ════════════════ */}
      <div className="overflow-hidden" style={cardStyle}>
        <div className="px-4 py-3 flex items-start justify-between gap-4" style={cardHeaderStyle}>
          <div>
            <h3 className="text-[13px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Academic Years</h3>
            <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
              View and manage academic year definitions and academic configuration for this school.
            </p>
          </div>
          <button onClick={openYearCreate}
            className="flex-shrink-0 h-8 px-3 rounded-full text-[12px] font-medium text-white flex items-center gap-1.5 transition-colors"
            style={{ backgroundColor: "#145F33" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e4524")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#145F33")}>
            <Plus className="h-3.5 w-3.5" /> Create New Year
          </button>
        </div>

        {academicYears.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ backgroundColor: "var(--slds-g-color-background-alt)" }}>
                  {["Description", "Term Type", "GPA Calculation", "Track CGPA", "Start Date", "End Date", "Actions"].map((col) => (
                    <th key={col} className="px-4 py-2.5 text-left font-semibold whitespace-nowrap"
                      style={{ color: "var(--slds-g-color-text-default)", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {academicYears.map((row) => {
                  const isActive = row.id === selectedYearId;
                  return (
                    <tr key={row.id}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: isActive ? "rgba(20,95,51,0.06)" : undefined }}
                      onClick={() => { setSelectedYearId(row.id); setTermSearch(""); }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-alt)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isActive ? "rgba(20,95,51,0.06)" : ""; }}>
                      <td className="px-4 py-3 font-medium" style={{ color: isActive ? "#145F33" : "var(--slds-g-color-text-default)" }}>
                        <div className="flex items-center gap-2">
                          {isActive && <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#145F33" }} />}
                          {row.description}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--slds-g-color-text-default)" }}>{row.termType}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--slds-g-color-text-default)" }}>{row.gpaCalculation}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--slds-g-color-text-default)" }}>{row.trackCgpa ? "Yes" : "No"}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--slds-g-color-text-default)" }}>{row.startDate}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--slds-g-color-text-default)" }}>{row.endDate || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => openYearView(row)}
                            className="h-7 w-7 rounded flex items-center justify-center transition-colors hover:bg-[#eff6ff]"
                            style={{ color: "#0176d3" }} title="View">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => openYearEdit(row)}
                            className="h-7 w-7 rounded flex items-center justify-center transition-colors hover:bg-[#eff6ff]"
                            style={{ color: "#0176d3" }} title="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-2 text-[12px]" style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-weak)" }}>
              {academicYears.length} record{academicYears.length !== 1 ? "s" : ""} — click a row to select
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
            <h3 className="text-[14px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>No Academic Years</h3>
            <p className="mt-1.5 slds-text-4 max-w-xs" style={{ color: "var(--slds-g-color-text-weak)" }}>No academic years have been added yet.</p>
            <button onClick={openYearCreate}
              className="mt-4 h-8 px-4 rounded-full text-[12px] font-medium text-white flex items-center gap-1.5 transition-colors"
              style={{ backgroundColor: "#145F33" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e4524")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#145F33")}>
              <Plus className="h-3.5 w-3.5" /> Create New Year
            </button>
          </div>
        )}
      </div>

      {/* ════════════════ ACADEMIC TERMS CARD ════════════════ */}
      <div className="overflow-hidden" style={cardStyle}>
        <div className="px-4 py-3 flex items-start justify-between gap-4" style={cardHeaderStyle}>
          <div>
            <h3 className="text-[13px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Academic Terms</h3>
            {activeYear ? (
              <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
                Academic Year: <strong style={{ color: "var(--slds-g-color-text-default)" }}>{activeYear.description}</strong>
              </p>
            ) : (
              <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
                View and manage academic terms and reporting periods for the selected academic year.
              </p>
            )}
          </div>
          {activeYear && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => { setCopySource(""); setCopyDest(""); setCopyErrors({}); setCopyOpen(true); }}
                className="h-8 px-3 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-colors"
                style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-alt)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-base)")}>
                <Copy className="h-3.5 w-3.5" /> Copy Courses
              </button>
              <button onClick={openTermCreate}
                className="h-8 px-3 rounded-full text-[12px] font-medium text-white flex items-center gap-1.5 transition-colors"
                style={{ backgroundColor: "#145F33" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e4524")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#145F33")}>
                <Plus className="h-3.5 w-3.5" /> Create New Term
              </button>
            </div>
          )}
        </div>

        {/* No year selected */}
        {!activeYear ? (
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
            <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-weak)" }}>Select an academic year to view its terms.</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-2" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--slds-g-color-text-weak)" }} />
                <input type="text" value={termSearch} onChange={(e) => setTermSearch(e.target.value)}
                  placeholder="Search academic terms..."
                  className="h-8 w-full pl-8 pr-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                  style={inputStyle()} />
              </div>
            </div>

            {filteredTerms.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr style={{ backgroundColor: "var(--slds-g-color-background-alt)" }}>
                      {["Term", "Start Date", "End Date", "Reporting Periods", "Actions"].map((col) => (
                        <th key={col} className="px-4 py-2.5 text-left font-semibold whitespace-nowrap"
                          style={{ color: "var(--slds-g-color-text-default)", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTerms.map((row) => (
                      <tr key={row.id} className="transition-colors"
                        style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-alt)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}>
                        <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: "var(--slds-g-color-text-default)" }}>{row.term}</td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--slds-g-color-text-default)" }}>{row.startDate}</td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--slds-g-color-text-default)" }}>{row.endDate}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {row.reportingPeriods.slice(0, 2).map((rp) => (
                              <span key={rp} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap"
                                style={{ backgroundColor: "var(--slds-g-color-background-alt)", color: "var(--slds-g-color-text-weak)", border: "1px solid var(--slds-g-color-border-base-1)" }}>
                                {rp}
                              </span>
                            ))}
                            {row.reportingPeriods.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                                style={{ backgroundColor: "var(--slds-g-color-background-alt)", color: "var(--slds-g-color-text-weak)", border: "1px solid var(--slds-g-color-border-base-1)" }}
                                title={row.reportingPeriods.join(", ")}>
                                +{row.reportingPeriods.length - 2} more
                              </span>
                            )}
                            {row.reportingPeriods.length === 0 && <span style={{ color: "var(--slds-g-color-text-weak)" }}>—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openTermView(row)} className="h-7 w-7 rounded flex items-center justify-center transition-colors hover:bg-[#eff6ff]" style={{ color: "#0176d3" }} title="View"><Eye className="h-3.5 w-3.5" /></button>
                            <button onClick={() => openTermEdit(row)} className="h-7 w-7 rounded flex items-center justify-center transition-colors hover:bg-[#eff6ff]" style={{ color: "#0176d3" }} title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                            <button onClick={() => openCourses(row)} className="h-7 w-7 rounded flex items-center justify-center transition-colors hover:bg-[#eff6ff]" style={{ color: "#0176d3" }} title="Courses"><BookOpen className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-2 text-[12px]" style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-weak)" }}>
                  {filteredTerms.length} record{filteredTerms.length !== 1 ? "s" : ""}
                </div>
              </div>
            ) : termSearch.trim() ? (
              <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
                <h3 className="text-[14px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>No matching terms found</h3>
                <p className="mt-1.5 slds-text-4 max-w-xs" style={{ color: "var(--slds-g-color-text-weak)" }}>Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
                <h3 className="mt-4 text-[14px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>No Academic Terms</h3>
                <p className="mt-1.5 slds-text-4 max-w-xs" style={{ color: "var(--slds-g-color-text-weak)" }}>No academic terms have been added for this academic year.</p>
                <button onClick={openTermCreate}
                  className="mt-4 h-8 px-4 rounded-full text-[12px] font-medium text-white flex items-center gap-1.5 transition-colors"
                  style={{ backgroundColor: "#145F33" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e4524")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#145F33")}>
                  <Plus className="h-3.5 w-3.5" /> Create New Term
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ════════ CREATE / EDIT / VIEW ACADEMIC YEAR MODAL ════════ */}
      <Dialog open={yearModalMode !== null} onOpenChange={(o) => { if (!o) setYearModalMode(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              {yearModalMode === "create" ? "Create New Academic Year" : yearModalMode === "edit" ? "Edit Academic Year" : "Academic Year Details"}
            </DialogTitle>
          </DialogHeader>

          {yearModalMode === "view" && selectedYear ? (
            <div className="space-y-4 pt-2">
              {([
                ["Description", selectedYear.description],
                ["Term Type", selectedYear.termType],
                ["GPA Calculation", selectedYear.gpaCalculation],
                ["Track CGPA", selectedYear.trackCgpa ? "Yes" : "No"],
                ["Start Date", selectedYear.startDate],
                ["End Date", selectedYear.endDate || "—"],
              ] as [string, string][]).map(([l, v]) => (
                <div key={l} className="space-y-1">
                  <p className={labelCls} style={labelStyle}>{l}</p>
                  <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{v}</p>
                </div>
              ))}
              <div className="space-y-1">
                <p className={labelCls} style={labelStyle}>Grading Defaults</p>
                <div className="flex flex-wrap gap-1">
                  {selectedYear.gradingDefaults.length > 0
                    ? selectedYear.gradingDefaults.map((g) => (
                        <span key={g} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                          style={{ backgroundColor: "rgba(20,95,51,0.1)", color: "#145F33", border: "1px solid rgba(20,95,51,0.2)" }}>{g}</span>
                      ))
                    : <span className="slds-text-4" style={{ color: "var(--slds-g-color-text-weak)" }}>—</span>}
                </div>
              </div>
              <div className="flex justify-end pt-2" style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}>
                {secondaryBtn("Close", () => setYearModalMode(null))}
              </div>
            </div>
          ) : yearModalMode !== "view" ? (
            <div className="space-y-5 pt-2">
              {/* Section 1: Academic Year Details */}
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--slds-g-color-text-weak)" }}>Academic Year Details</p>
                <div className="space-y-4">
                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className={labelCls} style={labelStyle}>Description <span className="text-red-600">*</span></label>
                    <PortalSelect value={yearForm.description} onChange={(v) => setYearField("description", v)}
                      options={DESCRIPTION_VALUES} placeholder="Select Academic Year" hasError={!!yearErrors.description} />
                    {yearErrors.description && errMsg(yearErrors.description)}
                  </div>

                  {/* Term Type + GPA Calculation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={labelCls} style={labelStyle}>Term Type <span className="text-red-600">*</span></label>
                      <PortalSelect value={yearForm.termType} onChange={(v) => setYearField("termType", v)}
                        options={TERM_TYPES} placeholder="Select Term Type" hasError={!!yearErrors.termType} />
                      {yearErrors.termType && errMsg(yearErrors.termType)}
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls} style={labelStyle}>GPA Calculation <span className="text-red-600">*</span></label>
                      <div className="h-9 px-3 flex items-center rounded slds-text-4"
                        style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-alt)", color: "var(--slds-g-color-text-weak)", borderRadius: 4 }}>
                        4.0
                      </div>
                    </div>
                  </div>

                  {/* Start Date + End Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={labelCls} style={labelStyle}>Start Date <span className="text-red-600">*</span></label>
                      <input type="text" value={yearForm.startDate} onChange={(e) => setYearField("startDate", e.target.value)}
                        placeholder="MM/DD/YYYY"
                        className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                        style={inputStyle(!!yearErrors.startDate)} />
                      {yearErrors.startDate && errMsg(yearErrors.startDate)}
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls} style={labelStyle}>End Date</label>
                      <input type="text" value={yearForm.endDate} onChange={(e) => setYearField("endDate", e.target.value)}
                        placeholder="MM/DD/YYYY"
                        className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                        style={inputStyle(!!yearErrors.endDate)} />
                      {yearErrors.endDate && errMsg(yearErrors.endDate)}
                    </div>
                  </div>

                  {/* Track CGPA */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={yearForm.trackCgpa} onChange={(e) => setYearField("trackCgpa", e.target.checked)}
                      className="h-4 w-4 rounded" style={{ accentColor: "#145F33" }} />
                    <span className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>Track CGPA</span>
                  </label>
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }} />

              {/* Section 2: Grading Defaults */}
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  Grading Defaults <span className="text-red-600">*</span>
                </p>
                <GradingChecklist selected={yearForm.gradingDefaults} onChange={(v) => setYearField("gradingDefaults", v)} hasError={!!yearErrors.gradingDefaults} />
                {yearErrors.gradingDefaults && <div className="mt-1">{errMsg(yearErrors.gradingDefaults)}</div>}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-2" style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}>
                {secondaryBtn("Cancel", () => setYearModalMode(null))}
                {yearModalMode === "create" && (
                  <button type="button" onClick={() => handleYearSave(false)}
                    className="h-9 px-5 rounded-full slds-text-4 font-medium transition-colors"
                    style={{ border: "1px solid #145F33", backgroundColor: "var(--slds-g-color-background-base)", color: "#145F33" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0fdf4")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-base)")}>
                    Save
                  </button>
                )}
                {primaryBtn(yearModalMode === "create" ? "Save & Close" : "Save Changes", () => handleYearSave(true))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ════════ CREATE / EDIT / VIEW TERM MODAL ════════ */}
      <Dialog open={termModalMode !== null} onOpenChange={(o) => { if (!o) setTermModalMode(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              {termModalMode === "create" ? "Create New Academic Term" : termModalMode === "edit" ? "Edit Academic Term" : "Academic Term Details"}
            </DialogTitle>
          </DialogHeader>

          {termModalMode === "view" && selectedTerm ? (
            <div className="space-y-4 pt-2">
              {([["Term", selectedTerm.term], ["Start Date", selectedTerm.startDate], ["End Date", selectedTerm.endDate]] as [string, string][]).map(([l, v]) => (
                <div key={l} className="space-y-1">
                  <p className={labelCls} style={labelStyle}>{l}</p>
                  <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{v}</p>
                </div>
              ))}
              <div className="space-y-1">
                <p className={labelCls} style={labelStyle}>Reporting Periods</p>
                {selectedTerm.reportingPeriods.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedTerm.reportingPeriods.map((rp) => (
                      <span key={rp} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                        style={{ backgroundColor: "rgba(20,95,51,0.1)", color: "#145F33", border: "1px solid rgba(20,95,51,0.2)" }}>{rp}</span>
                    ))}
                  </div>
                ) : <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-weak)" }}>—</p>}
              </div>
              <div className="flex justify-end pt-2" style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}>
                {secondaryBtn("Close", () => setTermModalMode(null))}
              </div>
            </div>
          ) : termModalMode !== "view" ? (
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className={labelCls} style={labelStyle}>Term <span className="text-red-600">*</span></label>
                <select value={termForm.term} onChange={(e) => setTermField("term", e.target.value)}
                  className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]"
                  style={inputStyle(!!termErrors.term)}>
                  <option value="">Select Term</option>
                  {TERM_VALUES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
                {termErrors.term && errMsg(termErrors.term)}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelCls} style={labelStyle}>Start Date <span className="text-red-600">*</span></label>
                  <input type="text" value={termForm.startDate} onChange={(e) => setTermField("startDate", e.target.value)}
                    placeholder="MM/DD/YYYY" className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]" style={inputStyle(!!termErrors.startDate)} />
                  {termErrors.startDate && errMsg(termErrors.startDate)}
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls} style={labelStyle}>End Date <span className="text-red-600">*</span></label>
                  <input type="text" value={termForm.endDate} onChange={(e) => setTermField("endDate", e.target.value)}
                    placeholder="MM/DD/YYYY" className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]" style={inputStyle(!!termErrors.endDate)} />
                  {termErrors.endDate && errMsg(termErrors.endDate)}
                </div>
              </div>
              {termErrors.overlap && errMsg(termErrors.overlap)}
              <div className="space-y-1.5">
                <label className={labelCls} style={labelStyle}>Reporting Period</label>
                <MultiSelect options={REPORTING_PERIOD_VALUES} selected={termForm.reportingPeriods}
                  onChange={(v) => setTermField("reportingPeriods", v)} placeholder="Select Reporting Periods" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2" style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}>
                {secondaryBtn("Cancel", () => setTermModalMode(null))}
                {termModalMode === "create" && (
                  <button type="button" onClick={() => handleTermSave(false)}
                    className="h-9 px-5 rounded-full slds-text-4 font-medium transition-colors"
                    style={{ border: "1px solid #145F33", backgroundColor: "var(--slds-g-color-background-base)", color: "#145F33" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0fdf4")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-base)")}>
                    Save
                  </button>
                )}
                {primaryBtn(termModalMode === "create" ? "Save & Close" : "Save Changes", () => handleTermSave(true))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ════════ SCHOOL COURSES MODAL ════════ */}
      <Dialog open={coursesOpen} onOpenChange={(o) => { if (!o) { setCoursesOpen(false); setAssignGradingOpen(false); } }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby={undefined}>
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-[16px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>School Courses</DialogTitle>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {activeYear && <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>Academic Year: <strong style={{ color: "var(--slds-g-color-text-default)" }}>{activeYear.description}</strong></span>}
              {coursesTerm && <><span style={{ color: "var(--slds-g-color-text-weak)" }}>•</span><span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>Term: <strong style={{ color: "var(--slds-g-color-text-default)" }}>{coursesTerm.term}</strong></span></>}
            </div>
          </DialogHeader>
          <div className="flex items-center gap-2 flex-wrap flex-shrink-0 py-2" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
            <button onClick={handleAssignGrading} className="h-8 px-3 rounded-full text-[12px] font-medium text-white flex items-center gap-1.5 transition-colors" style={{ backgroundColor: "#145F33" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e4524")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#145F33")}>Assign Grading</button>
            <button onClick={() => setCourseRows(SAMPLE_COURSES.map((c) => ({ ...c, selected: false })))}
              className="h-8 w-8 rounded-full flex items-center justify-center" style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)" }} title="Refresh">
              <RefreshCw className="h-3.5 w-3.5" style={{ color: "var(--slds-g-color-text-weak)" }} />
            </button>
            {selectedCourseCount > 0 && <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>{selectedCourseCount} selected</span>}
          </div>
          <div className="overflow-auto flex-1">
            <table className="w-full text-[13px]">
              <thead className="sticky top-0">
                <tr style={{ backgroundColor: "var(--slds-g-color-background-alt)" }}>
                  <th className="px-4 py-2.5 text-left" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                    <input type="checkbox" checked={allCoursesSelected} onChange={(e) => setCourseRows((rows) => rows.map((r) => ({ ...r, selected: e.target.checked })))} className="h-4 w-4 rounded" style={{ accentColor: "#145F33" }} />
                  </th>
                  {["ID", "Course", "Ability Group", "Subject Area", "Grading"].map((col) => (
                    <th key={col} className="px-4 py-2.5 text-left font-semibold whitespace-nowrap" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-default)" }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courseRows.map((row) => (
                  <tr key={row.id} className="transition-colors"
                    style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: row.selected ? "rgba(20,95,51,0.04)" : undefined }}
                    onMouseEnter={(e) => { if (!row.selected) e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-alt)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = row.selected ? "rgba(20,95,51,0.04)" : ""; }}>
                    <td className="px-4 py-3"><input type="checkbox" checked={row.selected} onChange={() => setCourseRows((rows) => rows.map((r) => r.id === row.id ? { ...r, selected: !r.selected } : r))} className="h-4 w-4 rounded" style={{ accentColor: "#145F33" }} /></td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--slds-g-color-text-weak)" }}>{row.id}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>{row.course}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--slds-g-color-text-weak)" }}>{row.abilityGroup}</td>
                    <td className="px-4 py-3" style={{ color: "var(--slds-g-color-text-weak)" }}>{row.subjectArea}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {row.grading.length > 0 ? row.grading.map((g) => (
                          <span key={g} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                            style={{ backgroundColor: "var(--slds-g-color-background-alt)", color: "var(--slds-g-color-text-default)", border: "1px solid var(--slds-g-color-border-base-1)" }}>{g}</span>
                        )) : <span style={{ color: "var(--slds-g-color-text-weak)" }}>—</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 flex-shrink-0" style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}>
            {secondaryBtn("Cancel", () => { setCoursesOpen(false); setAssignGradingOpen(false); })}
            <button type="button" onClick={() => toast.success("Course changes saved.")}
              className="h-9 px-5 rounded-full slds-text-4 font-medium transition-colors"
              style={{ border: "1px solid #145F33", backgroundColor: "var(--slds-g-color-background-base)", color: "#145F33" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0fdf4")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-base)")}>Save</button>
            {primaryBtn("Save & Close", () => { toast.success("Course changes saved."); setCoursesOpen(false); })}
          </div>
        </DialogContent>
      </Dialog>

      {/* ════════ ASSIGN GRADING MODAL ════════ */}
      <Dialog open={assignGradingOpen} onOpenChange={(o) => { if (!o) setAssignGradingOpen(false); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" aria-describedby="grading-modal-desc">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Assign Grading</DialogTitle>
            <p id="grading-modal-desc" className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
              Assign grading codes to {selectedCourseCount} selected course{selectedCourseCount !== 1 ? "s" : ""}.
            </p>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className={labelCls} style={labelStyle}>Grading Codes <span className="text-red-600">*</span></label>
              <MultiSelect options={GRADING_CODES} selected={selectedGradingCodes}
                onChange={(v) => { setSelectedGradingCodes(v); setGradingError(""); }}
                placeholder="Select grading codes" searchable hasError={!!gradingError} />
              {gradingError && errMsg(gradingError)}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2" style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}>
              {secondaryBtn("Cancel", () => setAssignGradingOpen(false))}
              {primaryBtn("Apply Grading", applyGrading)}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ════════ COPY COURSES MODAL ════════ */}
      <Dialog open={copyOpen} onOpenChange={(o) => { if (!o) setCopyOpen(false); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" aria-describedby="copy-modal-desc">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Copy Courses</DialogTitle>
            <p id="copy-modal-desc" className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>Copy all courses from one term to another.</p>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-2 p-3 rounded" style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa" }}>
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#c2410c" }} />
              <p className="text-[12px]" style={{ color: "#7c2d12" }}>You are about to copy ALL courses from one school term to another school term. This action cannot be undone.</p>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls} style={labelStyle}>Source Term <span className="text-red-600">*</span></label>
              <select value={copySource} onChange={(e) => { setCopySource(e.target.value); setCopyErrors((er) => ({ ...er, source: undefined, same: undefined })); }}
                className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]" style={inputStyle(!!copyErrors.source)}>
                <option value="">Select Source Term</option>
                {terms.map((t) => <option key={t.id} value={t.term}>{t.term}</option>)}
              </select>
              {copyErrors.source && errMsg(copyErrors.source)}
            </div>
            <div className="space-y-1.5">
              <label className={labelCls} style={labelStyle}>Destination Term <span className="text-red-600">*</span></label>
              <select value={copyDest} onChange={(e) => { setCopyDest(e.target.value); setCopyErrors((er) => ({ ...er, dest: undefined, same: undefined })); }}
                className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-1 focus:ring-[#145F33]" style={inputStyle(!!copyErrors.dest)}>
                <option value="">Select Destination Term</option>
                {terms.filter((t) => t.term !== copySource).map((t) => <option key={t.id} value={t.term}>{t.term}</option>)}
              </select>
              {copyErrors.dest && errMsg(copyErrors.dest)}
              {copyErrors.same && errMsg(copyErrors.same)}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2" style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}>
              {secondaryBtn("Cancel", () => setCopyOpen(false))}
              {primaryBtn("Copy Courses", handleCopy)}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
