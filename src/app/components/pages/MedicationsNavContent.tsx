import { MedicationCountWorkspace } from "../medications/MedicationCountWorkspace";
import { MedicationLogsWorkspace } from "../medications/MedicationLogsWorkspace";
import { MedicationRecordFocusNotice } from "../medications/MedicationRecordFocusNotice";
import { MedicationHome } from "../medications/MedicationHome";
import { MedicationGlobalDestination } from "../medications/MedicationGlobalDestination";
import { MissingMedicationDocumentation } from "../medications/MissingMedicationDocumentation";
import {
  GLOBAL_MEDICATION_ERRORS_SECTION,
  MEDICATION_HOME_SECTION,
  MISSING_MEDICATION_DOCUMENTATION_SECTION,
} from "../../lib/medicationHomeSections";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { refreshMedReviewsFromStorage } from "../../data/medReviewStore";
import { reloadMedicationLogs } from "../../data/medicationLogStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { MedicationCatalogView } from "./MedicationCatalogView";
import { ManageDisposalView } from "./ManageDisposalView";
import { SingleYouthDispensation } from "./SingleYouthDispensation";
import { ReviewCountEntry } from "../medications/ReviewCountEntry";
import { useNavigate, useLocation } from "react-router";
import { Search, Filter, Pill, AlertCircle, CheckCircle, Clock, ChevronRight, User, Calendar, FileText, Plus, Download, Eye, Sunrise, Sun, Sunset, Moon, Package, Monitor, Tablet, X, LayoutGrid, Users, ArrowLeft, Briefcase, RotateCcw, CircleAlert, CheckCircle2, Link, ChevronUp, ChevronDown, ChevronsUpDown, Pencil, AlertTriangle, SlidersHorizontal, ClipboardList, RefreshCw } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { TablePaginationBar } from "../ui/table-toolbar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MultiSelect } from "../ui/multi-select";
import { FieldLabel, FilterField } from "../ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useViewMode } from "../../contexts/ViewModeContext";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import { exportToCSV } from "../../lib/exportCsv";

// Mock medication data for all youth

const MCR_OTC_ITEMS = [
  { id: "otc-1",      label: "Acetaminophen (Tylenol)",                                                  hasExpiry: true,  hasRestock: true },
  { id: "otc-2",      label: "Diphenhydramine (Benadryl)",                                               hasExpiry: true,  hasRestock: true },
  { id: "otc-3",      label: "Ibuprofen (Advil)",                                                        hasExpiry: true,  hasRestock: true },
  { id: "otc-4",      label: "Guaifenesin Oral Solution (Cough Medicine, Non-DM only)",                  hasExpiry: false, hasRestock: true },
  { id: "otc-5",      label: "Oral Anesthetic Cough Drops",                                              hasExpiry: false, hasRestock: true },
  { id: "otc-6",      label: "Bismuth Subsalicylate (Pepto Bismol)",                                     hasExpiry: true,  hasRestock: true },
  { id: "otc-7",      label: "Calcium Carbonate Antacid (Tums)",                                         hasExpiry: false, hasRestock: true },
  { id: "otc-8",      label: "Naproxen / Naproxen Sodium (Aleve)",                                      hasExpiry: true,  hasRestock: true },
  { id: "otc-9",      label: "Antibiotic Ointment (Bacitracin / Neomycin / Polymyxin (Neosporin))",     hasExpiry: true,  hasRestock: true },
  { id: "otc-10",     label: "Hydrocortisone 1%",                                                        hasExpiry: true,  hasRestock: true },
  { id: "otc-supply", label: "OTC Supply Correct",  helper: "All program OTCs labeled, no unapproved OTCs present", hasExpiry: false, hasRestock: false },
];
const MCR_FA_ITEMS = [
  { id: "fa-1", label: "Rubbing Alcohol (Isopropyl)",  hasExpiry: false, hasRestock: true },
  { id: "fa-2", label: "Hydrogen Peroxide",             hasExpiry: false, hasRestock: true },
  { id: "fa-3", label: "Gauze / Dressings / Bandages",  hasExpiry: false, hasRestock: true },
  { id: "fa-4", label: "Cotton Balls / Swabs",           hasExpiry: false, hasRestock: true },
];
const MCR_PX_ITEMS = [
  { id: "px-1", label: "Emergency Medications",   helper: "Accessible, Adequate Supply, and Current dates",                        isDailyCounts: false },
  { id: "px-2", label: "Disposal Drawer",          helper: "No medication present on left side. All medication in lock box.",       isDailyCounts: false },
  { id: "px-3", label: "Daily Medication Counts",  helper: "Verify that daily dose counts in cart match Salesforce values.",        isDailyCounts: true  },
  { id: "px-4", label: "Youth PRNs",               helper: "Verify PRN supplies and expiration dates for each youth.",              isDailyCounts: false },
  { id: "px-5", label: "Pill Cards",               helper: "Correctly labeled, dose time stickers, organized, etc.",                isDailyCounts: false },
];
const MCR_MCS_ITEMS = [
  { id: "mcs-1",  label: "Water Cup and Pill Cup Supply",                     helper: undefined as string|undefined },
  { id: "mcs-2",  label: "Coin Envelope Supply",                              helper: undefined },
  { id: "mcs-3",  label: "Label Printer Supply and Functions",                helper: undefined },
  { id: "mcs-4",  label: "Medical Emergency Magnet",                          helper: undefined },
  { id: "mcs-5",  label: "PPE (gloves and hand sanitizer)",                   helper: undefined },
  { id: "mcs-6",  label: "Tablet / Chromebook charged and functioning",       helper: undefined },
  { id: "mcs-7",  label: "Med Cart lock functions and is locked",             helper: undefined },
  { id: "mcs-8",  label: "Med Leader has key",                                helper: undefined },
  { id: "mcs-9",  label: "Med Leader Log shows current Med Leader",           helper: undefined },
  { id: "mcs-10", label: "Med Cart organization", helper: "Top drawer med-related items only, 1st drawer creams and job aids, 2nd drawer active daily medications, 3rd drawer OTCs/PRNs/First Aid, 4th drawer items labeled for disposal" },
];

function MultiSelectFilter({
  label, options, selected, onChange,
}: {
  label: string; options: string[]; selected: string[]; onChange: (vals: string[]) => void;
}) {
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter(v => v !== opt) : [...selected, opt]);

  return (
    <div className="space-y-1">
      <label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="h-9 w-full px-3 rounded text-[13px] flex items-center justify-between gap-2 focus:outline-none"
            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: selected.length ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}
          >
            <span className="truncate">{selected.length === 0 ? "All" : selected.length === 1 ? selected[0] : `${selected.length} selected`}</span>
            <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--slds-g-color-text-weak)' }} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[240px]" align="start">
          <div className="max-h-[260px] overflow-y-auto py-1">
            {options.map(opt => (
              <label
                key={opt}
                className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-[13px]"
                style={{ color: 'var(--slds-g-color-text-default)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Checkbox checked={selected.includes(opt)} onCheckedChange={() => toggle(opt)} className="h-4 w-4" />
                {opt}
              </label>
            ))}
          </div>
          {selected.length > 0 && (
            <div className="px-3 py-2 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
              <button type="button" onClick={() => onChange([])} className="text-[12px] font-medium" style={{ color: '#145F33' }}>
                Clear
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
/** Program field of a review-creation form: the originating Program, locked,
 *  in a Program-origin session; otherwise a required choice among the
 *  Programs the user can access. */
function ProgramPickField({
  fixedProgram,
  value,
  onChange,
  options,
  error,
}: {
  fixedProgram: { id: number; name: string } | null;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; name: string }[];
  error: string;
}) {
  if (fixedProgram)
    return (
      <div className="space-y-1">
        <label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>PROGRAM</label>
        <div className="h-8 flex items-center px-2 rounded text-[12px]" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-neutral-95)', color: 'var(--slds-g-color-text-weak)' }}>{fixedProgram.name}</div>
      </div>
    );
  return (
    <div className="space-y-1">
      <label htmlFor="create-program" className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>PROGRAM <span className="text-red-600">*</span></label>
      <select id="create-program" value={value} onChange={e => onChange(e.target.value)}
        aria-invalid={!!error}
        className="h-8 w-full px-2 rounded text-[12px] focus:outline-none"
        style={{ border: `1px solid ${error ? '#c23934' : 'var(--slds-g-color-border-base-1)'}`, backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }}>
        <option value="">Select…</option>
        {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
      {error && <p role="alert" className="text-[11px]" style={{ color: '#c23934' }}>{error}</p>}
    </div>
  );
}

export function MedicationsNavContent(props: Record<string, any>) {
    const {
        navigate, location, getTodayDate, searchQuery,
        setSearchQuery, filterProgram, setFilterProgram, currentMedLeader,
        setCurrentMedLeader, selectedOverviewSection, setSelectedOverviewSection,
        filterDate, setFilterDate, showDeferredCounts, setShowDeferredCounts,
        showIncompleteWork, setShowIncompleteWork, navSection, setNavSection,
        canViewGlobalWorklists, gmeFilters, setGmeFilters, openDashboardRecord,
        backToDashboard, focusedRecordId, focusedRecordAvailable,
        dmFilters, setDmFilters, openDocumentationIssueRecord, backToDocumentationIssues, focusReturnTo,
        PROGRAM_OPTIONS, perms, createProgramId, setCreateProgramId,
        createProgramError, setCreateProgramError, saveReviewEdit,
        saveHubPeriodReview,
        MRH_REVIEW_TYPES, MRH_REVIEWERS,
        MRH_MOCK, mrhDaysSince,
        fixedProgram,
        mrhProgram, setMrhProgram, mrhReviewType, setMrhReviewType,
        mrhReviewer, setMrhReviewer, mrhDateStart, setMrhDateStart,
        mrhDateEnd, setMrhDateEnd, mrhSortCol, setMrhSortCol,
        mrhSortDir, setMrhSortDir, mrhSelectedId, setMrhSelectedId,
        mrhViewOpen, setMrhViewOpen, crStartDate, setCrStartDate,
        crEndDate, setCrEndDate, crConcernsNoted, setCrConcernsNoted,
        crDetails, setCrDetails, COUNT_YOUTHS, COUNT_MEDS,
        COUNT_PERIODS, COUNT_ROWS, DISP_BY_ID, cntSelectedId,
        setCntSelectedId, cntFilterYouth, setCntFilterYouth, cntFilterMed,
        setCntFilterMed, cntFilterPeriod, setCntFilterPeriod, cntCreateOpen,
        setCntCreateOpen, cntCountModalOpen, setCntCountModalOpen, cntReviewLogs,
        setCntReviewLogs, cntFiltered, saveCntReview,
        mrhCreateOpen, setMrhCreateOpen, mrhNewType, setMrhNewType,
        mrhNewTypeError, setMrhNewTypeError, MEDDOC_MOCK, MEDDOC_YOUTHS,
        MEDDOC_MEDS, MEDDOC_STAFF, MEDDOC_CODES, MEDDOC_REVIEW_STATUSES,
        MEDDOC_DOSING_PERIODS, MEDDOC_MEDLEADERS, todayStr, weekAgoStr,
        mdStartDate, setMdStartDate, mdEndDate, setMdEndDate,
        mdFilterProgram, setMdFilterProgram, mdFilterYouth, setMdFilterYouth,
        mdFilterMed, setMdFilterMed, mdFilterStaff, setMdFilterStaff,
        mdFilterStaffDispensed, setMdFilterStaffDispensed, mdFilterYouthReceived, setMdFilterYouthReceived,
        mdFilterCodes, setMdFilterCodes, mdFilterComments, setMdFilterComments,
        mdFilterReviewStatus, setMdFilterReviewStatus, mdFilterDosingPeriod, setMdFilterDosingPeriod,
        mdSelectedIds, setMdSelectedIds, mdActiveRowId, setMdActiveRowId,
        mdFiltered, outstandingOnly, mdActiveRow, mdDispensationLogs, handleMdClearFilters,
        handleMdToggleAll, handleMdToggleRow, mdReviewOpen, setMdReviewOpen,
        mdReviewStatus, setMdReviewStatus, mdReviewAssignee, setMdReviewAssignee,
        mdReviewComment, setMdReviewComment, mdReviewRowIds, setMdReviewRowIds,
        mdReviewActiveId, setMdReviewActiveId, handleOpenMdReview, mdReviewRows,
        mdReviewActiveRow, mdReviewDispLogs, mdUpdateOpen, setMdUpdateOpen,
        handleOpenMdUpdate, mdUpdateTarget,
        mdUpdStaffDispensed, setMdUpdStaffDispensed, mdUpdYouthReceived, setMdUpdYouthReceived,
        mdUpdPrimaryCode, setMdUpdPrimaryCode, mdUpdComment, setMdUpdComment,
        handleSaveMdReview, handleSubmitMdUpdate, mdCreateOpen, setMdCreateOpen,
        mdrStartDate, setMdrStartDate, mdrEndDate, setMdrEndDate,
        mdrDetails, setMdrDetails, medDocReviewLogs, setMedDocReviewLogs,
        saveMdReviewLog, MCR_TODAY_STR, mcrTab, setMcrTab,
        mcrProgram, setMcrProgram, mcrReviewDate, setMcrReviewDate,
        MCR_REVIEWER, mcrResp, setMcrResp, mcrComment,
        setMcrComment, mcrRestock, setMcrRestock, mcrExpiry,
        setMcrExpiry, mcrDCStart, setMcrDCStart, mcrDCEnd,
        setMcrDCEnd, mcrDCDetails, setMcrDCDetails, mcrErrors,
        setMcrErrors, mcrCancelConfirm, setMcrCancelConfirm, mcrNotifyOpen,
        setMcrNotifyOpen, mcrNotifyCloseAfter, setMcrNotifyCloseAfter, mcrSetResp,
        mcrValidateAndSave, mcrHandleSave, mcrHistory,
        mrhFiltered,
        mrhSelectedRecord, isSingleProgram, mrhToggleSort, mrhLastCompleted,
        isPackMedsModalOpen, setIsPackMedsModalOpen, packMedsModalYouth, setPackMedsModalYouth,
        packMedsViewPack, setPackMedsViewPack, showAddMedicationDialog, setShowAddMedicationDialog,
        selectedYouth, setSelectedYouth, medicationName, setMedicationName,
        dose, setDose, frequency, setFrequency,
        prescriber, setPrescriber, instructions, setInstructions,
        mockYouthMedicationData, handleAddMedication, filteredYouth,
        getStatusColor, calculateIncompleteMedications,
        calculateIncompleteCounts,
    } = props;

    // ── Edit Review Log — local state ─────────────────────────────────
    const [mrhEditOpen, setMrhEditOpen] = useState(false);
    // ── Medication Documentation table: per-column sort + value filters ──
    const MD_COLUMNS: { key: string; label: string }[] = outstandingOnly
        ? [{ key: "reviewStatus", label: "Review Status" }, { key: "program", label: "Program" }, { key: "youth", label: "Youth" }, { key: "assignee", label: "Assignee" }, { key: "attestationStaff", label: "Attestation Staff" }, { key: "medLeader", label: "Med Leader" }, { key: "dosingDate", label: "Dosing Date" }, { key: "medication", label: "Medication" }, { key: "isPsychotropic", label: "Is Psychotropic" }, { key: "dose", label: "Dose" }, { key: "dosingPeriod", label: "Dosing Period" }, { key: "start", label: "Start" }, { key: "end", label: "End" }, { key: "attestationDate", label: "Attestation Date" }, { key: "attestationOccurred", label: "Attestation Occurred in Dosing Period" }, { key: "attestationDevice", label: "Attestation Device" }, { key: "staffDispensed", label: "Staff Dispensed" }, { key: "youthReceived", label: "Youth Received" }, { key: "primaryCode", label: "Primary Code" }, { key: "medComments", label: "Medication Comments" }, { key: "dosingPeriodComments", label: "Dosing Period Comments" }, { key: "reviewComments", label: "Review Comments" }, { key: "instance", label: "Instance" }, { key: "otherReceived", label: "Other Received" }, { key: "pkg", label: "Package" }, { key: "instructions", label: "Instructions" }, { key: "reviewer", label: "Reviewer" }, { key: "reviewCreatedDate", label: "Review Created Date" }]
        : [{ key: "reviewStatus", label: "Review Status" }, { key: "assignee", label: "Assignee" }, { key: "attestationStaff", label: "Attestation Staff" }, { key: "medLeader", label: "Med Leader" }, { key: "dosingDate", label: "Dosing Date" }, { key: "youth", label: "Youth" }, { key: "medication", label: "Medication" }, { key: "isPsychotropic", label: "Is Psychotropic" }, { key: "dose", label: "Dose" }, { key: "dosingPeriod", label: "Dosing Period" }, { key: "start", label: "Start" }, { key: "end", label: "End" }, { key: "attestationDate", label: "Attestation Date" }, { key: "attestationOccurred", label: "Attestation Occurred in Dosing Period" }, { key: "attestationDevice", label: "Attestation Device" }, { key: "staffDispensed", label: "Staff Dispensed" }, { key: "youthReceived", label: "Youth Received" }, { key: "primaryCode", label: "Primary Code" }, { key: "medComments", label: "Medication Comments" }, { key: "dosingPeriodComments", label: "Dosing Period Comments" }, { key: "reviewComments", label: "Review Comments" }, { key: "instance", label: "Instance" }, { key: "otherReceived", label: "Other Received" }, { key: "pkg", label: "Package" }, { key: "instructions", label: "Instructions" }, { key: "reviewer", label: "Reviewer" }, { key: "reviewCreatedDate", label: "Review Created Date" }];
    const mdCellText = (row: any, key: string): string =>
        key === "isPsychotropic"
            ? (row.isPsychotropic === null || row.isPsychotropic === undefined ? "—" : row.isPsychotropic ? "Yes" : "No")
            : String(row[key] ?? "");
    const [mdSort, setMdSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
    const [mdColFilters, setMdColFilters] = useState<Record<string, string[]>>({});
    const mdColValues = useMemo(() => {
        const out: Record<string, string[]> = {};
        MD_COLUMNS.forEach(c => {
            out[c.key] = Array.from(new Set((mdFiltered as any[]).map(r => mdCellText(r, c.key)))).sort((a, b) => a.localeCompare(b));
        });
        return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mdFiltered, outstandingOnly]);
    const mdView = useMemo(() => {
        let rows = (mdFiltered as any[]).filter(r =>
            Object.entries(mdColFilters).every(([k, vals]) => vals.length === 0 || vals.includes(mdCellText(r, k))));
        if (mdSort) {
            const { key, dir } = mdSort;
            rows = [...rows].sort((a, b) => {
                const cmp = mdCellText(a, key).localeCompare(mdCellText(b, key), undefined, { numeric: true });
                return dir === "asc" ? cmp : -cmp;
            });
        }
        return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mdFiltered, mdColFilters, mdSort]);
    // Pagination for the documentation / outstanding-errors table
    const MD_PAGE_SIZE = 10;
    const [mdPage, setMdPage] = useState(1);
    const mdTotalPages = Math.max(1, Math.ceil(mdView.length / MD_PAGE_SIZE));
    const mdSafePage = Math.min(mdPage, mdTotalPages);
    const mdPageRows = mdView.slice((mdSafePage - 1) * MD_PAGE_SIZE, mdSafePage * MD_PAGE_SIZE);
    const toggleMdSort = (key: string) =>
    {
        setMdPage(1);
        setMdSort(prev => !prev || prev.key !== key ? { key, dir: "asc" } : prev.dir === "asc" ? { key, dir: "desc" } : null);
    };
    const toggleMdColValue = (key: string, val: string) =>
        (setMdPage(1), setMdColFilters(prev => {
            const cur = prev[key] ?? [];
            const next = cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val];
            return { ...prev, [key]: next };
        }));

    // Med Review Hub table pagination
    const MRH_PAGE_SIZE = 10;
    const [mrhPage, setMrhPage] = useState(1);
    const mrhTotalPages = Math.max(1, Math.ceil(mrhFiltered.length / MRH_PAGE_SIZE));
    const mrhSafePage = Math.min(mrhPage, mrhTotalPages);
    const mrhPageRows = mrhFiltered.slice((mrhSafePage - 1) * MRH_PAGE_SIZE, mrhSafePage * MRH_PAGE_SIZE);
    /** Medication documentation / error dashboard: filter panel expanded? */
    const [mdFiltersOpen, setMdFiltersOpen] = useState(false);
    /** Med Review Hub → Count: filter panel expanded? */
    const [cntFiltersOpen, setCntFiltersOpen] = useState(false);
    /** Med Review Hub: filter panel expanded? */
    const [mrhFiltersOpen, setMrhFiltersOpen] = useState(false);
    // Switching tabs always starts with the filter panels closed...
    useEffect(() => {
        setMdFiltersOpen(false);
        setCntFiltersOpen(false);
        setMrhFiltersOpen(false);
        // ...and with nothing selected.
        setMdSelectedIds([]);
        setMdActiveRowId(null);
        setMrhSelectedId(null);
        setCntSelectedId(null);
    }, [navSection]);
    const [editTab, setEditTab] = useState<"details" | "history">("details");
    const [editProgram, setEditProgram] = useState("");
    const [editReviewDate, setEditReviewDate] = useState("");
    const [editStartDate, setEditStartDate] = useState("");
    const [editEndDate, setEditEndDate] = useState("");
    const [editExpiryDate, setEditExpiryDate] = useState("");
    const [editHasIssue, setEditHasIssue] = useState<"Yes" | "No">("No");
    const [editComments, setEditComments] = useState("");

    const openEditModal = () => {
        if (!mrhSelectedRecord) return;
        setEditProgram(String(mrhSelectedRecord.programId));
        setEditReviewDate(mrhSelectedRecord.reviewDate ?? "");
        setEditStartDate(mrhSelectedRecord.startDate ?? "");
        setEditEndDate(mrhSelectedRecord.endDate ?? "");
        setEditExpiryDate("");
        setEditHasIssue(mrhSelectedRecord.hasIssue ? "Yes" : "No");
        setEditComments(mrhSelectedRecord.details ?? "");
        setEditTab("details");
        setMrhEditOpen(true);
    };

    /** Program a new review starts with: the fixed one, else the Program
     *  currently chosen in the filter (if any). */
    const defaultCreateProgram = () =>
        fixedProgram ? String(fixedProgram.id) : (mrhProgram !== "All Programs" ? mrhProgram : "");
    const prepareCreate = () => {
        setCreateProgramId(defaultCreateProgram());
        setCreateProgramError("");
    };
    /** Hub create modal: Med Cart reviews have their own checklist form;
     *  Count / Med Documentation reviews share the period form. */
    const hubSave = (closeAfter: boolean) => {
        if (!mrhNewType) { setMrhNewTypeError(true); return; }
        if (mrhNewType === "Med Cart Review") mcrHandleSave(closeAfter);
        else saveHubPeriodReview(closeAfter);
    };

    const mdActionBar = (
              <div className="flex items-center justify-end gap-2 flex-wrap">
                {outstandingOnly ? (
                  <>
<Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Refresh"
                      onClick={() => { refreshMedReviewsFromStorage(); reloadMedicationLogs(); }}>
                      <RefreshCw />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh</TooltipContent>
                </Tooltip>

<Button
                  type="button"
                  variant="outline"
                  className="h-9"
                  disabled={!perms.export}
                  onClick={() => exportToCSV(
                    'med-documentation.csv',
                    ["Review Status","Assignee","Attestation Staff","Med Leader","Dosing Date","Youth","Medication","Is Psychotropic","Dose","Dosing Period","Start","End","Attestation Date","Attestation Occurred in Dosing Period","Attestation Device","Staff Dispensed","Youth Received","Primary Code","Medication Comments","Dosing Period Comments","Review Comments","Instance","Other Received","Package","Instructions","Reviewer","Review Created Date"],
                    mdView.map((r: any) => [r.reviewStatus, r.assignee, r.attestationStaff, r.medLeader, r.dosingDate, r.youth, r.medication, r.isPsychotropic === null ? "—" : r.isPsychotropic ? "Yes" : "No", r.dose, r.dosingPeriod, r.start, r.end, r.attestationDate, r.attestationOccurred, r.attestationDevice, r.staffDispensed, r.youthReceived, r.primaryCode, r.medComments, r.dosingPeriodComments, r.reviewComments, r.instance, r.otherReceived, r.pkg, r.instructions, r.reviewer, r.reviewCreatedDate])
                  )}>
                  <Download />Export to Excel
                </Button>
<Button
                  type="button"
                  variant="outline"
                  className="h-9"
                  aria-expanded={mdFiltersOpen}
                  aria-controls="md-filter-panel"
                  onClick={() => setMdFiltersOpen(o => !o)}>
                  <Filter />Filters
                  {mdFiltersOpen ? <ChevronUp /> : <ChevronDown />}
                </Button>
<Button
                  type="button"
                  variant="outline-primary"
                  className="h-9"
                  disabled={mdSelectedIds.length === 0 || !perms.review}
                  title={!perms.review ? "You don't have permission to review medication documentation." : undefined}
                  onClick={handleOpenMdReview}>
                  <Eye />Review
                </Button>
                  </>
                ) : (
                  <>
<Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Refresh"
                      onClick={() => { refreshMedReviewsFromStorage(); reloadMedicationLogs(); }}>
                      <RefreshCw />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh</TooltipContent>
                </Tooltip>
<Button
                  type="button"
                  variant="outline"
                  className="h-9"
                  disabled={!perms.export}
                  onClick={() => exportToCSV(
                    'med-documentation.csv',
                    ["Review Status","Assignee","Attestation Staff","Med Leader","Dosing Date","Youth","Medication","Is Psychotropic","Dose","Dosing Period","Start","End","Attestation Date","Attestation Occurred in Dosing Period","Attestation Device","Staff Dispensed","Youth Received","Primary Code","Medication Comments","Dosing Period Comments","Review Comments","Instance","Other Received","Package","Instructions","Reviewer","Review Created Date"],
                    mdView.map((r: any) => [r.reviewStatus, r.assignee, r.attestationStaff, r.medLeader, r.dosingDate, r.youth, r.medication, r.isPsychotropic === null ? "—" : r.isPsychotropic ? "Yes" : "No", r.dose, r.dosingPeriod, r.start, r.end, r.attestationDate, r.attestationOccurred, r.attestationDevice, r.staffDispensed, r.youthReceived, r.primaryCode, r.medComments, r.dosingPeriodComments, r.reviewComments, r.instance, r.otherReceived, r.pkg, r.instructions, r.reviewer, r.reviewCreatedDate])
                  )}>
                  <Download />Export to Excel
                </Button>
<Button
                  type="button"
                  variant="outline"
                  className="h-9"
                  aria-expanded={mdFiltersOpen}
                  aria-controls="md-filter-panel"
                  onClick={() => setMdFiltersOpen(o => !o)}>
                  <Filter />Filters
                  {mdFiltersOpen ? <ChevronUp /> : <ChevronDown />}
                </Button>
<Button
                  type="button"
                  variant="outline-primary"
                  className="h-9"
                  disabled={mdSelectedIds.length === 0 || !perms.review}
                  title={!perms.review ? "You don't have permission to review medication documentation." : undefined}
                  onClick={handleOpenMdReview}>
                  <Eye />Review
                </Button>
<Button
                  type="button"
                  variant="outline"
                  className="h-9"
                  disabled={mdSelectedIds.length !== 1 || !perms.correct}
                  title={!perms.correct ? "You don't have permission to save dispensation corrections." : mdSelectedIds.length !== 1 ? "Select one record to update its dispensation." : undefined}
                  onClick={handleOpenMdUpdate}>
                  <Pencil />Update Dispensation
                </Button>
<Button
                    type="button"
                    className="h-9"
                    disabled={!perms.create}
                    title={!perms.create ? "You don't have permission to create review logs." : undefined}
                    onClick={() => { prepareCreate(); setMdrStartDate(""); setMdrEndDate(""); setMdrDetails(""); setMdCreateOpen(true); }}>
                    <Plus />Create New Review Log
                  </Button>
                  </>
                )}
              </div>
    );

    const medDocBody = (
            <div className={outstandingOnly ? "space-y-5" : "flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-5"} style={{ backgroundColor: 'var(--slds-g-color-background-base)' }}>
              {focusedRecordId && (
                <MedicationRecordFocusNotice
                  available
                  backLabel={focusReturnTo === 'documentation-issues' ? 'Back to Documentation Issues' : 'Back to Global Medication Error Dashboard'}
                  fromLabel={focusReturnTo === 'documentation-issues' ? 'Documentation Issues' : 'Global Medication Error Dashboard'}
                  onBackToDashboard={focusReturnTo === 'documentation-issues' ? backToDocumentationIssues : backToDashboard}
                  onShowAll={() => setNavSection('med-documentation')}
                />
              )}

              {/* ── Active filter chips (shows what the multi-selects currently hold) ── */}
              {(mdFilterYouth.length + mdFilterMed.length + mdFilterStaff.length + mdFilterCodes.length + mdFilterReviewStatus.length + mdFilterDosingPeriod.length) > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap -mt-2">
                  {[...mdFilterYouth, ...mdFilterMed, ...mdFilterStaff, ...mdFilterCodes, ...mdFilterReviewStatus, ...mdFilterDosingPeriod].map((val, i) => (
                    <span key={`${val}-${i}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: 'rgba(20,95,51,0.08)', color: '#145F33', border: '1px solid rgba(20,95,51,0.2)' }}>
                      {val}
                    </span>
                  ))}
                </div>
              )}

              {/* ── Primary Medication Documentation Log List View ── */}
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                  <span className="text-[13px] font-semibold whitespace-nowrap shrink-0" style={{ color: 'var(--slds-g-color-text-default)' }}>{outstandingOnly ? 'Outstanding Medication Errors' : 'Medication Documentation Log'}
                    <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(20,95,51,0.1)', color: '#145F33' }}>{mdView.length}</span>
                    {mdSelectedIds.length > 0 && <span className="ml-2 text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>· {mdSelectedIds.length} selected</span>}
                  </span>
                  {mdActionBar}
                </div>
              {mdFiltersOpen && (
              <div id="md-filter-panel" className="p-4 bg-[var(--slds-g-color-background-alt)] grid gap-x-4 gap-y-3.5 items-end" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>

                <div className="flex flex-col">
                  <FieldLabel htmlFor="ome-start" required>START DATE</FieldLabel>
                  <DateInput id="ome-start" required value={isoToMdy(mdStartDate)} onChange={(v) => setMdStartDate(mdyToIso(v))} />
                </div>
                <div className="flex flex-col">
                  <FieldLabel htmlFor="ome-end" required>END DATE</FieldLabel>
                  <DateInput id="ome-end" required value={isoToMdy(mdEndDate)} onChange={(v) => setMdEndDate(mdyToIso(v))} />
                </div>
                <FilterField label="PROGRAM" htmlFor="ome-program">
                  <Select value={mdFilterProgram || "__all"} onValueChange={(v) => setMdFilterProgram(v === "__all" ? "" : v)} disabled={!!fixedProgram}>
                    <SelectTrigger id="ome-program" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {!fixedProgram && <SelectItem value="__all">All Programs</SelectItem>}
                      {(fixedProgram ? [{ id: String(fixedProgram.id), name: fixedProgram.name }] : PROGRAM_OPTIONS).map((o: { id: string; name: string }) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FilterField>
                <FilterField label="YOUTH" htmlFor="ome-youth">
                  <MultiSelect id="ome-youth" display="inline" placeholder="All" options={MEDDOC_YOUTHS} value={mdFilterYouth} onValueChange={setMdFilterYouth} />
                </FilterField>
                <FilterField label="MEDICATION" htmlFor="ome-med">
                  <MultiSelect id="ome-med" display="inline" placeholder="All" options={MEDDOC_MEDS} value={mdFilterMed} onValueChange={setMdFilterMed} />
                </FilterField>
                <FilterField label="ATTESTATION STAFF" htmlFor="ome-staff">
                  <MultiSelect id="ome-staff" display="inline" placeholder="All" options={MEDDOC_STAFF} value={mdFilterStaff} onValueChange={setMdFilterStaff} />
                </FilterField>
                <FilterField label="STAFF DISPENSED" htmlFor="ome-dispensed">
                  <Select value={mdFilterStaffDispensed || "__all"} onValueChange={(v) => setMdFilterStaffDispensed(v === "__all" ? "" : v)}>
                    <SelectTrigger id="ome-dispensed" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">All</SelectItem>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </FilterField>
                <FilterField label="YOUTH RECEIVED" htmlFor="ome-received">
                  <Select value={mdFilterYouthReceived || "__all"} onValueChange={(v) => setMdFilterYouthReceived(v === "__all" ? "" : v)}>
                    <SelectTrigger id="ome-received" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">All</SelectItem>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </FilterField>
                <FilterField label="CODES" htmlFor="ome-codes">
                  <MultiSelect id="ome-codes" display="inline" placeholder="All" options={MEDDOC_CODES} value={mdFilterCodes} onValueChange={setMdFilterCodes} />
                </FilterField>
                <FilterField label="COMMENTS" htmlFor="ome-comments">
                  <Select value={mdFilterComments || "__all"} onValueChange={(v) => setMdFilterComments(v === "__all" ? "" : v)}>
                    <SelectTrigger id="ome-comments" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">All</SelectItem>
                        <SelectItem value="Not Blank">Not Blank</SelectItem>
                        <SelectItem value="Blank">Blank</SelectItem>
                    </SelectContent>
                  </Select>
                </FilterField>
                <FilterField label="REVIEW STATUS" htmlFor="ome-status">
                  <MultiSelect id="ome-status" display="inline" placeholder="All" options={outstandingOnly ? MEDDOC_REVIEW_STATUSES.filter((x: string) => x === "Assigned" || x === "Updated") : MEDDOC_REVIEW_STATUSES} value={mdFilterReviewStatus} onValueChange={setMdFilterReviewStatus} />
                </FilterField>
                <FilterField label="DOSING PERIOD" htmlFor="ome-period">
                  <MultiSelect id="ome-period" display="inline" placeholder="All" options={MEDDOC_DOSING_PERIODS} value={mdFilterDosingPeriod} onValueChange={setMdFilterDosingPeriod} />
                </FilterField>
                <div className="flex flex-col justify-end">
                  <Button type="button" variant="outline-primary" onClick={handleMdClearFilters}>Clear</Button>
                </div>
              </div>
              )}

              {/* ── Filter Bar (Design System form controls) — collapsible ── */}
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: '2400px' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                      <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                        <th className="px-3 py-2.5 w-10">
                          <Checkbox
                            aria-label="Select all records"
                            checked={mdFiltered.length > 0 && mdSelectedIds.length === mdFiltered.length ? true : mdSelectedIds.length > 0 ? "indeterminate" : false}
                            onCheckedChange={v => handleMdToggleAll(v === true)} />
                        </th>
                        {MD_COLUMNS.map(({ key, label }) => {
                          const sorted = mdSort?.key === key ? mdSort.dir : null;
                          const active = (mdColFilters[key] ?? []).length > 0;
                          return (
                          <th key={key}
                            aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"}
                            className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                            style={{ color: sorted ? '#145F33' : 'var(--slds-g-color-text-weak)' }}>
                            <div className="inline-flex items-center gap-1">
                              <button type="button" onClick={() => toggleMdSort(key)}
                                className="inline-flex items-center gap-1 uppercase [font-size:inherit] [font-weight:inherit] [letter-spacing:inherit]"
                                title={`Sort by ${label}`}>
                                {label}
                                {sorted === "asc" ? <ChevronUp className="h-3 w-3" /> : sorted === "desc" ? <ChevronDown className="h-3 w-3" /> : <ChevronsUpDown className="h-3 w-3 opacity-40" />}
                              </button>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button type="button" aria-label={`Filter ${label}`} title={`Filter ${label}`}
                                    className="p-0.5 rounded hover:bg-[var(--slds-g-color-background-alt-2)]"
                                    style={{ color: active ? '#145F33' : undefined }}>
                                    <Filter className={`h-3 w-3 ${active ? '' : 'opacity-40'}`} fill={active ? 'currentColor' : 'none'} />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-60 p-0 normal-case tracking-normal font-normal">
                                  <div className="px-3 py-2 slds-text-3 font-semibold border-b" style={{ color: 'var(--slds-g-color-text-default)' }}>Filter: {label}</div>
                                  <div className="max-h-60 overflow-y-auto py-1">
                                    {(mdColValues[key] ?? []).map(v => {
                                      const id = `mdf-${key}-${v}`;
                                      return (
                                        <label key={v} htmlFor={id} className="flex items-center gap-2 px-3 py-1.5 slds-text-4 cursor-pointer hover:bg-[var(--slds-g-color-background-alt)]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                          <Checkbox id={id} checked={(mdColFilters[key] ?? []).includes(v)} onCheckedChange={() => toggleMdColValue(key, v)} />
                                          <span className="truncate">{v || "(Blank)"}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                  <div className="flex justify-end px-3 py-2 border-t">
                                    <Button type="button" variant="outline-primary" size="sm" disabled={!active}
                                      onClick={() => setMdColFilters(prev => ({ ...prev, [key]: [] }))}>Clear</Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {mdView.length === 0 ? (
                        <tr><td colSpan={outstandingOnly ? 29 : 28} className="px-6 py-10 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>No dispensation records match the current filters.</td></tr>
                      ) : mdPageRows.map(row => {
                        const sel = mdSelectedIds.includes(row.id);
                        const active = row.id === mdActiveRowId;
                        return (
                          <tr key={row.id} onClick={() => { setMdActiveRowId(row.id); handleMdToggleRow(row.id, !sel); }}
                            className="cursor-pointer transition-colors"
                            style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: active ? 'rgba(20,95,51,0.06)' : sel ? '#F0FDF4' : 'transparent' }}>
                            <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                              <Checkbox aria-label={`Select record for ${row.youth}`} checked={sel} onCheckedChange={v => handleMdToggleRow(row.id, v === true)} />
                            </td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', color: 'var(--slds-g-color-text-default)', border: '1px solid var(--slds-g-color-border-base-1)' }}>{row.reviewStatus}</span>
                            </td>
                            {outstandingOnly && (
                              <>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.program}</td>
                            <td className="px-3 py-2.5 text-[12px] font-medium whitespace-nowrap" style={{ color: 'var(--color-link-blue)' }}>{row.youth}</td>
                              </>
                            )}
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.assignee}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.attestationStaff}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.medLeader}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.dosingDate}</td>
                            {!outstandingOnly && (
                            <td className="px-3 py-2.5 text-[12px] font-medium whitespace-nowrap" style={{ color: 'var(--color-link-blue)' }}>{row.youth}</td>
                            )}
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.medication}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.isPsychotropic === null ? "—" : row.isPsychotropic ? "Yes" : "No"}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.dose}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.dosingPeriod}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.start}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.end}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.attestationDate}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.attestationOccurred}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.attestationDevice}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.staffDispensed}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.youthReceived}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.primaryCode}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.medComments}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.dosingPeriodComments}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.reviewComments}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.instance}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.otherReceived}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.pkg}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.instructions}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.reviewer}</td>
                            <td className="px-3 py-2.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.reviewCreatedDate}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2.5" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt-2)' }}>
                  <TablePaginationBar
                    className="w-full"
                    start={mdView.length === 0 ? 0 : (mdSafePage - 1) * MD_PAGE_SIZE + 1}
                    end={Math.min(mdSafePage * MD_PAGE_SIZE, mdView.length)}
                    total={mdView.length}
                    countLabel="records"
                    currentPage={mdSafePage}
                    totalPages={mdTotalPages}
                    onPrevious={() => setMdPage(mdSafePage - 1)}
                    onNext={() => setMdPage(mdSafePage + 1)}
                  />
                </div>
              </div>

              {/* ── Dispensation Logs list view (below primary list, driven by active row) ── */}
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                <div className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Dispensation Logs</span>
                </div>
                {!mdActiveRow ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2">
                    <ClipboardList className="h-8 w-8" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                    <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Select a record above to view history.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: '2000px' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                          {["Review Status","Assignee","Attestation Staff","Med Leader","Dosing Date","Youth","Medication","Dose","Dosing Period","Staff Dispensed","Youth Received","Primary Code","Medication Comments","Dosing Period Comments","Review Comments","Instance","Other Received","Package","Instructions","Attestation Date","Reviewer","Review Created Date"].map(h => (
                            <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {mdDispensationLogs.map(row => (
                          <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.reviewStatus}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.assignee}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.attestationStaff}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.medLeader}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.dosingDate}</td>
                            <td className="px-3 py-2 text-[12px] font-medium" style={{ color: 'var(--color-link-blue)' }}>{row.youth}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.medication}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.dose}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.dosingPeriod}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.staffDispensed}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.youthReceived}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.primaryCode}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.medComments}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.dosingPeriodComments}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.reviewComments}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.instance}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.otherReceived}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.pkg}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.instructions}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.attestationDate}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.reviewer}</td>
                            <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.reviewCreatedDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Review Dispensations Modal ── */}
              {mdReviewOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                  <div className="rounded-lg w-full max-w-4xl mx-4 overflow-hidden flex flex-col" style={{ maxHeight: '90vh', backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                    <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                      <h2 className="text-[15px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Review Dispensations</h2>
                      <button onClick={() => setMdReviewOpen(false)} className="p-1.5 rounded hover:bg-gray-200" style={{ color: 'var(--slds-g-color-text-weak)' }}><X className="h-5 w-5" /></button>
                    </div>
                    <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        <div className="flex flex-col">
                          <FieldLabel htmlFor="rd-status" required>STATUS</FieldLabel>
                          <Select value={mdReviewStatus || "__none"} onValueChange={(v) => setMdReviewStatus(v === "__none" ? "" : v)}>
                            <SelectTrigger id="rd-status" className="w-full"><SelectValue placeholder="Select…" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none">Select…</SelectItem>
                              {MEDDOC_REVIEW_STATUSES.map((st: string) => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col">
                          <FieldLabel htmlFor="rd-assignee" required={mdReviewStatus === "Assigned"}>ASSIGNEE</FieldLabel>
                          <Select value={mdReviewAssignee || "__none"} onValueChange={(v) => setMdReviewAssignee(v === "__none" ? "" : v)}>
                            <SelectTrigger id="rd-assignee" className="w-full"><SelectValue placeholder="Select…" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none">Select…</SelectItem>
                              {MEDDOC_MEDLEADERS.map((m: string) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col">
                          <FieldLabel htmlFor="rd-comment">COMMENT</FieldLabel>
                          <Input id="rd-comment" value={mdReviewComment} onChange={(e) => setMdReviewComment(e.target.value)} placeholder="Optional…" />
                        </div>
                      </div>

                      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <div className="px-3 py-2 text-[12px] font-semibold" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', color: 'var(--slds-g-color-text-default)' }}>Selected Dispensations ({mdReviewRows.length})</div>
                        <div className="overflow-x-auto max-h-[180px] overflow-y-auto">
                          <table className="w-full">
                            <thead><tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                              <th className="px-2 py-1.5 w-8" />
                              {["Youth","Medication","Dosing Period","Attestation Date"].map(h => <th key={h} className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h}</th>)}
                            </tr></thead>
                            <tbody>
                              {mdReviewRows.map(r => (
                                <tr key={r.id} onClick={() => setMdReviewActiveId(r.id)} className="cursor-pointer" style={{ backgroundColor: r.id === mdReviewActiveId ? 'rgba(20,95,51,0.08)' : 'transparent', borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                  <td className="px-2 py-1.5" onClick={e => e.stopPropagation()}>
                                    <Checkbox aria-label={`Select ${r.youth}, ${r.medication}`} checked={mdReviewRowIds.includes(r.id)} onCheckedChange={(c) => setMdReviewRowIds(prev => c === true ? (prev.includes(r.id) ? prev : [...prev, r.id]) : prev.filter(x => x !== r.id))} />
                                  </td>
                                  <td className="px-2 py-1.5 text-[12px]" style={{ color: 'var(--color-link-blue)' }}>{r.youth}</td>
                                  <td className="px-2 py-1.5 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.medication}</td>
                                  <td className="px-2 py-1.5 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.dosingPeriod}</td>
                                  <td className="px-2 py-1.5 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.attestationDate}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <div className="px-3 py-2 text-[12px] font-semibold" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', color: 'var(--slds-g-color-text-default)' }}>Dispensation Logs</div>
                        {!mdReviewActiveRow ? (
                          <p className="px-3 py-4 text-[12px] text-center" style={{ color: 'var(--slds-g-color-text-weak)' }}>Select a record above to view history.</p>
                        ) : (
                          <div className="overflow-x-auto max-h-[140px] overflow-y-auto">
                            <table className="w-full">
                              <thead><tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                {["Youth","Medication","Dose","Dosing Period","Staff Dispensed","Youth Received","Attestation Date"].map(h => <th key={h} className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h}</th>)}
                              </tr></thead>
                              <tbody>
                                {mdReviewDispLogs.map(r => (
                                  <tr key={r.id} style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    <td className="px-2 py-1.5 text-[12px]" style={{ color: 'var(--color-link-blue)' }}>{r.youth}</td>
                                    <td className="px-2 py-1.5 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.medication}</td>
                                    <td className="px-2 py-1.5 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.dose}</td>
                                    <td className="px-2 py-1.5 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.dosingPeriod}</td>
                                    <td className="px-2 py-1.5 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.staffDispensed}</td>
                                    <td className="px-2 py-1.5 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.youthReceived}</td>
                                    <td className="px-2 py-1.5 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.attestationDate}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="px-6 py-4 flex justify-end gap-2 flex-shrink-0 flex-wrap" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                      <button onClick={() => setMdReviewOpen(false)} className="h-9 px-4 rounded-full text-[13px] font-medium" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>Cancel</button>
                      <button disabled={mdReviewRowIds.length === 0 || !mdReviewStatus} onClick={() => handleSaveMdReview(false, false)}
                        className="h-9 px-4 rounded-full text-[13px] font-medium disabled:opacity-40" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>Save Review</button>
                      <button disabled={mdReviewRowIds.length === 0 || !mdReviewStatus} onClick={() => handleSaveMdReview(true, false)}
                        className="h-9 px-4 rounded-full text-[13px] font-medium disabled:opacity-40" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>Save Review & Close</button>
                      <button disabled={mdReviewRowIds.length === 0 || !mdReviewStatus || !perms.correct} title={!perms.correct ? "You don't have permission to save dispensation corrections." : undefined} onClick={() => handleSaveMdReview(true, true)}
                        className="h-9 px-4 rounded-full text-[13px] font-medium text-white disabled:opacity-40" style={{ backgroundColor: '#145F33' }}>Save Review & Update Dispensation</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Update Dispensation Modal ── */}
              {mdUpdateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                  <div className="rounded-lg w-full max-w-lg mx-4 overflow-hidden flex flex-col" style={{ maxHeight: '90vh', backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                    <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                      <h2 className="text-[15px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Update Dispensation</h2>
                      {mdUpdateTarget && <span className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>{mdUpdateTarget.youth} · {mdUpdateTarget.medication} {mdUpdateTarget.dose} · {mdUpdateTarget.dosingPeriod}</span>}
                      <button onClick={() => setMdUpdateOpen(false)} className="p-1.5 rounded hover:bg-gray-200" style={{ color: 'var(--slds-g-color-text-weak)' }}><X className="h-5 w-5" /></button>
                    </div>
                    <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
                      <div className="space-y-1.5">
                        <label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>STAFF DISPENSED</label>
                        <select value={mdUpdStaffDispensed} onChange={e => setMdUpdStaffDispensed(e.target.value)}
                          className="h-9 w-full px-2 rounded text-[13px]" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }}>
                          <option value="">No change</option><option value="Yes">Yes</option><option value="No">No</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>YOUTH RECEIVED</label>
                        <select value={mdUpdYouthReceived} onChange={e => setMdUpdYouthReceived(e.target.value)}
                          className="h-9 w-full px-2 rounded text-[13px]" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }}>
                          <option value="">No change</option><option value="Yes">Yes</option><option value="No">No</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>SET PRIMARY CODE</label>
                        <select value={mdUpdPrimaryCode} onChange={e => setMdUpdPrimaryCode(e.target.value)}
                          className="h-9 w-full px-2 rounded text-[13px]" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }}>
                          <option value="">No change</option>
                          {MEDDOC_CODES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                          COMMENT {(mdUpdStaffDispensed || mdUpdYouthReceived || mdUpdPrimaryCode) && <span className="text-red-600">*</span>}
                        </label>
                        <Textarea value={mdUpdComment} onChange={e => setMdUpdComment(e.target.value)} rows={3}
                          placeholder="Required if any field above was changed…" className="text-[13px]" />
                      </div>
                    </div>
                    <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 gap-3" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                      <p className="text-[11px] italic flex-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>I attest that the changes recorded above are accurate to the best of my knowledge.</p>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={handleSubmitMdUpdate}
                          disabled={!mdUpdStaffDispensed && !mdUpdYouthReceived && !mdUpdPrimaryCode && !mdUpdComment.trim()}
                          className="h-9 px-4 rounded-full text-[13px] font-medium text-white disabled:opacity-40" style={{ backgroundColor: '#145F33' }}>Submit</button>
                        <button onClick={() => setMdUpdateOpen(false)} className="h-9 px-4 rounded-full text-[13px] font-medium" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Med Documentation Review Log Modal ── */}
              {mdCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                  <div className="rounded-lg w-full max-w-lg mx-4 overflow-hidden flex flex-col" style={{ maxHeight: '90vh', backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                    <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                      <h2 className="text-[15px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Create New Review Log</h2>
                      <button onClick={() => setMdCreateOpen(false)} className="p-1.5 rounded hover:bg-gray-200" style={{ color: 'var(--slds-g-color-text-weak)' }}><X className="h-5 w-5" /></button>
                    </div>
                    <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
                      <div className="grid grid-cols-3 gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <div className="space-y-1"><label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>REVIEW TYPE</label><div className="h-8 flex items-center px-2 rounded text-[12px]" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-neutral-95)', color: 'var(--slds-g-color-text-weak)' }}>Med Documentation Review</div></div>
                        <ProgramPickField fixedProgram={fixedProgram} value={createProgramId} onChange={v => { setCreateProgramId(v); setCreateProgramError(""); }} options={PROGRAM_OPTIONS} error={createProgramError} />
                        <div className="space-y-1"><label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>REVIEWER</label><div className="h-8 flex items-center px-2 rounded text-[12px]" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-neutral-95)', color: 'var(--slds-g-color-text-weak)' }}>Sohan Jadhavrao</div></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>START DATE <span className="text-red-600">*</span></label><DateInput
value={isoToMdy(mdrStartDate)} onChange={(v) => (e => setMdrStartDate(e.target.value))({ target: { value: mdyToIso(v) } })} className="h-9 w-full px-3 rounded text-[13px] focus:outline-none" style={{ border: `1px solid ${!mdrStartDate ? '#c23934' : 'var(--slds-g-color-border-base-1)'}`, backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }} /></div>
                        <div className="space-y-1.5"><label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>END DATE <span className="text-red-600">*</span></label><DateInput
value={isoToMdy(mdrEndDate)} onChange={(v) => (e => setMdrEndDate(e.target.value))({ target: { value: mdyToIso(v) } })} className="h-9 w-full px-3 rounded text-[13px] focus:outline-none" style={{ border: `1px solid ${!mdrEndDate ? '#c23934' : 'var(--slds-g-color-border-base-1)'}`, backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }} /></div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>DETAILS</label>
                        <textarea value={mdrDetails} onChange={e => setMdrDetails(e.target.value)} rows={3} placeholder="Optional notes…" className="w-full px-3 py-2 rounded text-[13px] focus:outline-none resize-y" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)', minHeight: '72px' }} />
                      </div>
                    </div>
                    <div className="px-6 py-4 flex justify-end gap-2 flex-shrink-0" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                      <button onClick={() => setMdCreateOpen(false)} className="h-9 px-4 rounded-full text-[13px] font-medium" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>Cancel</button>
                      <button onClick={saveMdReviewLog} disabled={!mdrStartDate || !mdrEndDate}
                        className="h-9 px-4 rounded-full text-[13px] font-medium text-white disabled:opacity-40" style={{ backgroundColor: '#145F33' }}>Save</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
    );

    return (
        <>
          {navSection === 'medication-catalog' ? (
            <div className="px-6 pb-6 pt-4">
              <MedicationCatalogView />
            </div>
          ) : navSection === 'single-youth' ? (
            <SingleYouthDispensation inline filterDate={filterDate} />
          ) : navSection === 'home' ? (
            <MedicationHome
              canViewWorklists={canViewGlobalWorklists}
              onOpen={setNavSection}
            />
          ) : navSection === GLOBAL_MEDICATION_ERRORS_SECTION ? (
            <MedicationGlobalDestination
              title="Global Medication Error Dashboard"
              canView={canViewGlobalWorklists}
              onBackToHome={() => setNavSection(MEDICATION_HOME_SECTION)}
            >
              {medDocBody}
            </MedicationGlobalDestination>
          ) : navSection === MISSING_MEDICATION_DOCUMENTATION_SECTION ? (
            <MissingMedicationDocumentation
              canView={canViewGlobalWorklists}
              filters={dmFilters}
              onFiltersChange={setDmFilters}
              onInvestigateRecord={openDocumentationIssueRecord}
              onBackToHome={() => setNavSection(MEDICATION_HOME_SECTION)}
            />
          ) : navSection === 'med-overview' ? (
            <>
              {/* Filter bar */}
              <div
                className="flex items-center justify-between gap-4 px-6 py-2.5 flex-shrink-0"
                style={{ backgroundColor: 'var(--slds-g-color-background-base)' }}
              >
                {/* Left: filters */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                    <input
                      type="text"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="h-8 w-32 px-2.5 rounded slds-text-4 outline-none"
                      style={{
                        border: filterDate === getTodayDate() ? '1px solid var(--slds-g-color-border-base-1)' : '2px solid #DC2626',
                        backgroundColor: filterDate === getTodayDate() ? 'var(--slds-g-color-background-base)' : '#FEE2E2',
                        color: filterDate === getTodayDate() ? 'var(--slds-g-color-text-default)' : '#DC2626',
                        fontWeight: filterDate === getTodayDate() ? 'normal' : '600',
                      }}
                    />
                    {filterDate !== getTodayDate() && (
                      <>
                        <div className="flex items-center gap-1 h-8 px-2.5 rounded" style={{ backgroundColor: '#DC2626' }}>
                          <CircleAlert className="h-3.5 w-3.5 flex-shrink-0 text-white" />
                          <span className="text-[11px] font-bold uppercase tracking-wide text-white whitespace-nowrap">Not Today</span>
                        </div>
                        <button
                          onClick={() => setFilterDate(getTodayDate())}
                          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                          style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                        >
                          <X className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                        </button>
                      </>
                    )}
                  </div>
                  <select
                    value={selectedOverviewSection}
                    onChange={(e) => setSelectedOverviewSection(e.target.value)}
                    className="h-8 px-3 rounded slds-text-4"
                    style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }}
                  >
                    <option value="all">All Sections</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="bedtime">Bedtime</option>
                  </select>
                  <button
                    onClick={() => { setFilterDate(getTodayDate()); setSelectedOverviewSection('all'); }}
                    className="h-8 px-4 rounded slds-text-4 font-medium transition-colors"
                    style={{
                      backgroundColor: (filterDate !== getTodayDate() || selectedOverviewSection !== 'all') ? '#DC2626' : 'var(--slds-g-color-background-base)',
                      color: (filterDate !== getTodayDate() || selectedOverviewSection !== 'all') ? '#FFFFFF' : 'var(--slds-g-color-text-default)',
                      border: (filterDate !== getTodayDate() || selectedOverviewSection !== 'all') ? '1px solid #DC2626' : '1px solid var(--slds-g-color-border-base-1)',
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
                {/* Right: status indicators */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#DC2626' }} />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide mb-0" style={{ color: '#991B1B' }}>Incomplete Medications</p>
                      <p className="text-[13px] font-bold mb-0" style={{ color: '#DC2626' }}>{calculateIncompleteMedications()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}>
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#F59E0B' }} />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide mb-0" style={{ color: '#92400E' }}>Incomplete Counts</p>
                      <p className="text-[13px] font-bold mb-0" style={{ color: '#F59E0B' }}>{calculateIncompleteCounts()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dispensation sections */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-4">
                {(() => {
                  const renderYouthRow = (youth: any, period: 'morning' | 'afternoon' | 'evening' | 'bedtime') => {
                    const data = youth[period];
                    if (data.total === 0) return null;
                    // Cap at total: each unique med record can only contribute 0 or 1 per day
                    const effectiveDoc = Math.min(data.documented, data.total);
                    const effectiveCount = Math.min(data.counted, data.total);
                    const docColor = getStatusColor(effectiveDoc, data.total) ?? '#DC2626';
                    const countColor = getStatusColor(effectiveCount, data.total) ?? '#DC2626';
                    const docBg = docColor === '#16A34A' ? '#F0FDF4' : docColor === '#F59E0B' ? '#FFFBEB' : '#FEF2F2';
                    const countBg = countColor === '#16A34A' ? '#F0FDF4' : countColor === '#F59E0B' ? '#FFFBEB' : '#FEF2F2';
                    return (
                      <button
                        key={`${youth.id}-${period}`}
                        className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                        style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        onClick={() => navigate(`/single-youth-dispensation?date=${filterDate}&youthId=${youth.id}`, { state: { fromProgramLog: (location.state as any)?.fromProgramLog, programId: (location.state as any)?.programId, programName: (location.state as any)?.programName } })}
                      >
                        {/* Avatar */}
                        <div className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 slds-text-3 font-semibold" style={{ backgroundColor: '#E8F0FE', color: '#145F33' }}>
                          {youth.initials}
                        </div>
                        {/* Name */}
                        <span className="slds-text-4 font-medium flex-1 min-w-0 truncate" style={{ color: 'var(--color-link-blue)' }}>{youth.name}</span>
                        {/* Right-aligned badges */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Total Meds */}
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <Link className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                            <span className="slds-text-3 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{data.total} {data.total === 1 ? 'Med' : 'Meds'}</span>
                          </div>
                          {/* Documented */}
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ backgroundColor: docBg, border: `1px solid ${docColor}` }}>
                            <FileText className="h-3.5 w-3.5 flex-shrink-0" style={{ color: docColor }} />
                            <span className="slds-text-3 font-medium" style={{ color: docColor }}>{effectiveDoc}/{data.total}</span>
                          </div>
                          {/* Counted */}
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ backgroundColor: countBg, border: `1px solid ${countColor}` }}>
                            <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: countColor }} />
                            <span className="slds-text-3 font-medium" style={{ color: countColor }}>{effectiveCount}/{data.total}</span>
                          </div>
                          {/* Pack Med — opens Active Pack Meds modal */}
                          {data.hasPackMed && (
                            <div
                              role="button"
                              aria-label="View active medication packs"
                              title="View Active Pack Meds"
                              tabIndex={0}
                              className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                              style={{ backgroundColor: '#EFF6FF', cursor: 'pointer' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#DBEAFE'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#EFF6FF'; }}
                              onClick={e => {
                                e.stopPropagation();
                                setPackMedsModalYouth(youth);
                                setIsPackMedsModalOpen(true);
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setPackMedsModalYouth(youth);
                                  setIsPackMedsModalOpen(true);
                                }
                              }}
                            >
                              <Briefcase className="h-4 w-4" style={{ color: 'var(--color-link-blue)' }} />
                            </div>
                          )}
                          <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                        </div>
                      </button>
                    );
                  };

                  const sections = [
                    { id: 'morning',   label: 'Morning',   color: '#FFA500', youths: filteredYouth.filter(y => y.morning.total > 0) },
                    { id: 'afternoon', label: 'Afternoon', color: '#16A34A', youths: filteredYouth.filter(y => y.afternoon.total > 0) },
                    { id: 'evening',   label: 'Evening',   color: '#EAB308', youths: filteredYouth.filter(y => y.evening.total > 0) },
                    { id: 'bedtime',   label: 'Bedtime',   color: '#0000e0', youths: filteredYouth.filter(y => y.bedtime.total > 0) },
                  ];

                  const getYouthOverallStatus = (youth: any) => {
                    let total = 0, documented = 0;
                    (['morning', 'afternoon', 'evening', 'bedtime'] as const).forEach(p => {
                      total += youth[p].total;
                      // Cap at period total: each unique record can only contribute 0 or 1
                      documented += Math.min(youth[p].documented, youth[p].total);
                    });
                    if (total === 0) return '#9CA3AF';
                    if (documented === 0) return '#DC2626';
                    if (documented < total) return '#F59E0B';
                    return '#16A34A';
                  };

                  return (
                    <>
                      {/* Youth Avatar Row */}
                      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                        <div className="px-6 py-3 flex items-center gap-2" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                          <Users className="w-4 h-4" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>All Youth — Tap to open dispensation</span>
                        </div>
                        <div className="px-6 py-4 flex gap-5 overflow-x-auto">
                          {filteredYouth.map((youth) => {
                            const statusColor = getYouthOverallStatus(youth);
                            const firstName = youth.name.split(' ')[0];
                            return (
                              <button
                                key={youth.id}
                                className="flex flex-col items-center gap-1.5 flex-shrink-0 focus:outline-none group"
                                style={{ minWidth: '56px' }}
                                onClick={() => navigate(`/single-youth-dispensation?date=${filterDate}&youthId=${youth.id}`, { state: { fromProgramLog: (location.state as any)?.fromProgramLog, programId: (location.state as any)?.programId, programName: (location.state as any)?.programName } })}
                              >
                                <div className="relative">
                                  <Avatar className="h-12 w-12 transition-all" style={{ outline: '2px solid transparent', outlineOffset: '2px' }}
                                    onMouseEnter={e => (e.currentTarget.style.outline = '2px solid #145F33')}
                                    onMouseLeave={e => (e.currentTarget.style.outline = '2px solid transparent')}
                                  >
                                    <AvatarFallback className="text-[13px] font-semibold" style={{ backgroundColor: '#E8F0FE', color: '#145F33' }}>
                                      {youth.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full" style={{ backgroundColor: statusColor, border: '2px solid white' }} />
                                </div>
                                <span className="slds-text-3 font-medium text-center" style={{ color: 'var(--slds-g-color-text-default)', maxWidth: '56px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{firstName}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {sections.map((section) => {
                        if (selectedOverviewSection !== 'all' && selectedOverviewSection !== section.id) return null;
                        if (section.youths.length === 0) return null;
                        return (
                          <div key={section.id} className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                            <div className="px-6 py-3.5 flex items-center" style={{ backgroundColor: section.color }}>
                              <span className="font-semibold text-[15px] text-white">{section.label}</span>
                            </div>
                            <div className="flex flex-col">
                              {section.youths.map((youth) => renderYouthRow(youth, section.id as any))}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
            </>
          ) : navSection === 'med-review-hub' ? (
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4" style={{ backgroundColor: 'var(--slds-g-color-background-base)' }}>
              <Card variant="container">
                {/* ── Card header: title + count (left), filters + actions (right) ── */}
                <CardHeader size="sm" separated className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 min-w-0">
                  <div className="flex items-center gap-2 shrink-0">
                    <ClipboardList className="h-5 w-5" style={{ color: '#145F33' }} />
                    <h1 className="slds-text-5 font-semibold m-0 text-[var(--slds-g-color-text-default)]">Med Review Hub</h1>
                    <Badge variant="success">{mrhFiltered.length}</Badge>
                    {mrhSelectedId && <span className="slds-text-3 text-[var(--slds-g-color-text-weak)]">· 1 selected</span>}
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="Refresh"
                          onClick={() => { refreshMedReviewsFromStorage(); reloadMedicationLogs(); }}>
                          <RefreshCw />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Refresh</TooltipContent>
                    </Tooltip>
                  <button
                    disabled={!perms.export}
                    onClick={() => exportToCSV(
                      'med-review-hub.csv',
                      ['Review Date', 'Reviewer', 'Review Type', 'Program', 'Start Date', 'End Date', '# Issues', 'Details', 'Modified'],
                      mrhFiltered.map(r => [r.reviewDate, r.reviewer, r.reviewType, r.program, r.startDate, r.endDate, r.numberOfIssues, r.details, r.modifyDateTime])
                    )}
                    className="h-9 px-4 rounded-full text-[13px] font-medium transition-colors flex items-center gap-1.5"
                    style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                  >
                    <Download className="h-3.5 w-3.5" />Export to Excel
                  </button>
                    <button
                      type="button"
                      aria-expanded={mrhFiltersOpen}
                      aria-controls="mrh-filter-panel"
                      onClick={() => setMrhFiltersOpen(o => !o)}
                      className="h-9 px-4 rounded-full text-[13px] font-medium transition-colors flex items-center gap-1.5"
                      style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: mrhFiltersOpen ? 'var(--slds-g-color-background-alt)' : 'var(--slds-g-color-background-base)' }}>
                      <Filter className="h-3.5 w-3.5" />Filters
                      {mrhFiltersOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    <Button
                      type="button"
                      variant="outline-primary"
                      size="sm"
                      className="h-9"
                      disabled={!mrhSelectedId}
                      onClick={() => mrhSelectedId && setMrhViewOpen(true)}
                    >
                      <Eye />View
                    </Button>
                    <Button
                      type="button"
                      variant="outline-primary"
                      size="sm"
                      className="h-9"
                      disabled={!mrhSelectedId || !perms.edit}
                      title={!perms.edit ? "You don't have permission to edit review logs." : undefined}
                      onClick={() => mrhSelectedId && perms.edit && openEditModal()}
                    >
                      <Pencil />Edit
                    </Button>
                  <button
                    disabled={!perms.create} title={!perms.create ? "You don't have permission to create review logs." : undefined}
                    onClick={() => { prepareCreate(); setMcrProgram(defaultCreateProgram()); setMrhNewType(""); setMrhNewTypeError(false); setMrhCreateOpen(true); }}
                    className="h-9 px-4 rounded-full text-[13px] font-medium text-white flex items-center gap-1.5 disabled:opacity-40"
                    style={{ backgroundColor: '#145F33' }}
                  >
                    <Plus className="h-4 w-4" />Create New Review Log
                  </button>
                  </div>
                </CardHeader>
                {mrhFiltersOpen && (
                  <div id="mrh-filter-panel" className="p-4 grid gap-x-4 gap-y-3.5 items-end bg-[var(--slds-g-color-background-alt)]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>

                    <FilterField label="PROGRAM" htmlFor="mrh-program">
<Select value={mrhProgram} disabled={!!fixedProgram} onValueChange={v => { setMrhProgram(v); setMrhSelectedId(null); }}>
                    <SelectTrigger id="mrh-program" >
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {fixedProgram
                        ? <SelectItem value={String(fixedProgram.id)}>{fixedProgram.name}</SelectItem>
                        : <>
                            <SelectItem value="All Programs">All Programs</SelectItem>
                            {PROGRAM_OPTIONS.map((o: { id: string; name: string }) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                          </>}
                    </SelectContent>
                  </Select>
                    </FilterField>
                    <FilterField label="REVIEW TYPE" htmlFor="mrh-review-type">
<Select value={mrhReviewType || "all"} onValueChange={v => setMrhReviewType(v === "all" ? "" : v)}>
                    <SelectTrigger id="mrh-review-type" >
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {MRH_REVIEW_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                    </FilterField>
                    <FilterField label="REVIEWER" htmlFor="mrh-reviewer">
<Select value={mrhReviewer || "all"} onValueChange={v => setMrhReviewer(v === "all" ? "" : v)}>
                    <SelectTrigger id="mrh-reviewer" >
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reviewers</SelectItem>
                      {MRH_REVIEWERS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                    </FilterField>
                    <FilterField label="START DATE" htmlFor="mrh-start-date">
<DateInput id="mrh-start-date" value={mrhDateStart} onChange={setMrhDateStart} />
                    </FilterField>
                    <FilterField label="END DATE" htmlFor="mrh-end-date">
<DateInput id="mrh-end-date" value={mrhDateEnd} onChange={setMrhDateEnd} />
                    </FilterField>
                    <div className="flex flex-col justify-end">
<Button variant="outline-primary" 
                  disabled={mrhProgram === (fixedProgram ? String(fixedProgram.id) : "All Programs") && !mrhReviewType && !mrhReviewer && !mrhDateStart && !mrhDateEnd}
                  onClick={() => { setMrhProgram(fixedProgram ? String(fixedProgram.id) : "All Programs"); setMrhReviewType(""); setMrhReviewer(""); setMrhDateStart(""); setMrhDateEnd(""); setMrhSelectedId(null); }}>
                  Clear
                </Button>
                    </div>
                  </div>
                )}


                {/* ── Filters (collapsible) ── */}

                {/* ── Last Completed Indicators (single program only) ── */}
                {isSingleProgram && (
                  <div className="p-4" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
              {/* ── Last Completed Indicators (single program only) ── */}
              {isSingleProgram && (
                <div className="grid grid-cols-3 gap-4">
                  {([
                    { type: "Med Cart Review" as MrhReviewType,          threshold: 30, label: "Med Cart Review",          icon: ClipboardList, color: "var(--color-link-blue)" },
                    { type: "Count Review" as MrhReviewType,             threshold: 7,  label: "Count Review",             icon: CheckCircle2,  color: "#145F33" },
                    { type: "Med Documentation Review" as MrhReviewType, threshold: 7,  label: "Med Documentation Review", icon: FileText,       color: "#705E2E" },
                  ]).map(({ type, threshold, label, icon: Icon, color }) => {
                    const last = mrhLastCompleted(type);
                    const days = last ? mrhDaysSince(last.reviewDate) : null;
                    const overdue = days !== null && days > threshold;
                    return (
                      <div key={type} className="rounded-lg p-4 relative"
                        style={{ border: `1px solid ${overdue ? '#c23934' : 'var(--slds-g-color-border-base-1)'}`, backgroundColor: overdue ? '#fff5f5' : 'var(--slds-g-color-background-base)' }}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" style={{ color }} />
                            <span className="text-[12px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>{label}</span>
                          </div>
                          {overdue && (
                            <div className="group relative">
                              <AlertTriangle className="h-4 w-4 text-[#c23934] cursor-help" />
                              <div className="absolute right-0 top-6 z-10 hidden group-hover:block w-56 rounded-md px-3 py-2 shadow-lg text-[11px]"
                                style={{ backgroundColor: '#fef2f2', border: '1px solid #fecdca', color: '#b42318' }}>
                                <strong>{label}</strong> is overdue.<br />
                                Last completed: {last?.reviewDate ?? "Never"}
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] mb-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>LAST COMPLETED</p>
                        <p className="text-[16px] font-bold" style={{ color: overdue ? '#c23934' : 'var(--slds-g-color-text-default)' }}>
                          {last ? last.reviewDate : "—"}
                        </p>
                        {days !== null && (
                          <p className="text-[11px] mt-1" style={{ color: overdue ? '#c23934' : 'var(--slds-g-color-text-weak)' }}>
                            {days} day{days !== 1 ? "s" : ""} ago · threshold: {threshold}d
                          </p>
                        )}
                        {!last && (
                          <p className="text-[11px] mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>No records found</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
                  </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                  <RadioGroup value={mrhSelectedId == null ? "" : String(mrhSelectedId)} className="block gap-0">
                  <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: '1000px' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                        <th className="px-1 py-2.5 w-10" />
                        {([
                          { col: "reviewDate" as keyof MrhRecord,    label: "REVIEW DATE" },
                          { col: "reviewer" as keyof MrhRecord,      label: "REVIEWER" },
                          { col: "reviewType" as keyof MrhRecord,    label: "REVIEW TYPE" },
                          { col: "program" as keyof MrhRecord,       label: "PROGRAM" },
                          { col: "startDate" as keyof MrhRecord,     label: "START DATE" },
                          { col: "endDate" as keyof MrhRecord,       label: "END DATE" },
                          { col: "numberOfIssues" as keyof MrhRecord,label: "# ISSUES" },
                          { col: "details" as keyof MrhRecord,       label: "DETAILS" },
                          { col: "modifyDateTime" as keyof MrhRecord,label: "MODIFIED" },
                        ] as { col: keyof MrhRecord; label: string }[]).map(({ col, label }) => (
                          <th key={col} onClick={() => mrhToggleSort(col)}
                            className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap cursor-pointer select-none"
                            style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            {label}
                            <span className="inline-flex flex-col ml-1 align-middle" style={{ opacity: mrhSortCol === col ? 1 : 0.3 }}>
                              <ChevronUp className="h-2.5 w-2.5 -mb-0.5" style={{ color: mrhSortCol === col && mrhSortDir === "asc" ? '#145F33' : 'currentColor' }} />
                              <ChevronDown className="h-2.5 w-2.5" style={{ color: mrhSortCol === col && mrhSortDir === "desc" ? '#145F33' : 'currentColor' }} />
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mrhFiltered.length === 0 ? (
                        <tr><td colSpan={10} className="px-6 py-10 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>No review records match the selected filters.</td></tr>
                      ) : mrhPageRows.map((r, idx) => {
                        const typeBadge: Record<MrhReviewType, { bg: string; color: string }> = {
                          "Med Cart Review":          { bg: "rgba(1,118,211,0.1)",   color: "var(--color-link-blue)" },
                          "Count Review":             { bg: "rgba(20,95,51,0.1)",    color: "#145F33" },
                          "Med Documentation Review": { bg: "rgba(112,94,46,0.1)",   color: "#705E2E" },
                        };
                        const badge = typeBadge[r.reviewType];
                        const isSelected = r.id === mrhSelectedId;
                        return (
                          <tr key={r.id}
                            onClick={() => setMrhSelectedId(r.id === mrhSelectedId ? null : r.id)}
                            className="cursor-pointer"
                            style={{
                              borderBottom: idx < mrhPageRows.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                              backgroundColor: isSelected ? 'rgba(20,95,51,0.05)' : idx % 2 === 0 ? 'var(--slds-g-color-background-base)' : 'var(--slds-g-color-background-alt)',
                              outline: isSelected ? '2px solid #145F33' : 'none',
                              outlineOffset: '-2px',
                            }}>
                            <td className="px-1 py-2.5 text-center">
                              <RadioGroupItem value={String(r.id)} aria-label={`Select review ${r.reviewDate}`}
                                onClick={e => { e.stopPropagation(); setMrhSelectedId(r.id); }} />
                            </td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.reviewDate}</td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.reviewer}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: badge.bg, color: badge.color }}>{r.reviewType}</span>
                            </td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.program}</td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{ color: r.startDate === "n/a" ? 'var(--slds-g-color-text-weak)' : 'var(--slds-g-color-text-default)' }}>{r.startDate}</td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{ color: r.endDate === "n/a" ? 'var(--slds-g-color-text-weak)' : 'var(--slds-g-color-text-default)' }}>{r.endDate}</td>
                            <td className="px-3 py-2.5 text-[13px] text-center whitespace-nowrap" style={{ color: r.numberOfIssues === null ? 'var(--slds-g-color-text-weak)' : (r.numberOfIssues > 0 ? '#c23934' : '#145F33') }}>
                              {r.numberOfIssues === null ? "n/a" : r.numberOfIssues}
                            </td>
                            <td className="px-3 py-2.5 text-[13px] max-w-[180px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                              <span className="truncate block" title={r.details}>{r.details}</span>
                            </td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>{r.modifyDateTime}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </RadioGroup>
                </div>
                <CardFooter size="sm" separated>
                  <TablePaginationBar
                    className="w-full"
                    start={mrhFiltered.length === 0 ? 0 : (mrhSafePage - 1) * MRH_PAGE_SIZE + 1}
                    end={Math.min(mrhSafePage * MRH_PAGE_SIZE, mrhFiltered.length)}
                    total={mrhFiltered.length}
                    countLabel="records"
                    currentPage={mrhSafePage}
                    totalPages={mrhTotalPages}
                    onPrevious={() => setMrhPage(mrhSafePage - 1)}
                    onNext={() => setMrhPage(mrhSafePage + 1)}
                  />
                </CardFooter>
              </Card>

              {/* ── View Modal ── */}
              {mrhViewOpen && mrhSelectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                  <div className="rounded-lg w-full max-w-xl mx-4 overflow-hidden" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                    <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                      <h2 className="text-[15px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Review Log — View</h2>
                      <button onClick={() => setMrhViewOpen(false)} className="p-1.5 rounded hover:bg-gray-200" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="px-6 py-5 grid grid-cols-2 gap-x-6 gap-y-3">
                      {[
                        { label: "Review Type",   value: mrhSelectedRecord.reviewType },
                        { label: "Program",       value: mrhSelectedRecord.program },
                        { label: "Review Date",   value: mrhSelectedRecord.reviewDate },
                        { label: "Reviewer",      value: mrhSelectedRecord.reviewer },
                        { label: "Start Date",    value: mrhSelectedRecord.startDate },
                        { label: "End Date",      value: mrhSelectedRecord.endDate },
                        { label: "# of Issues",   value: mrhSelectedRecord.numberOfIssues === null ? "n/a" : String(mrhSelectedRecord.numberOfIssues) },
                        { label: "Modified",      value: mrhSelectedRecord.modifyDateTime },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="slds-form-label mb-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>{label.toUpperCase()}</p>
                          <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{value}</p>
                        </div>
                      ))}
                      <div className="col-span-2">
                        <p className="slds-form-label mb-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>DETAILS</p>
                        <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{mrhSelectedRecord.details}</p>
                      </div>
                    </div>
                    <div className="px-6 py-4 flex justify-end" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                      <button onClick={() => setMrhViewOpen(false)} className="h-9 px-4 rounded-full text-[13px] font-medium" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>Close</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Edit Review Log Modal ── */}
              {mrhEditOpen && mrhSelectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                  <div className="rounded-lg w-full flex flex-col overflow-hidden" style={{ maxWidth: '680px', maxHeight: '90vh', backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>

                    {/* Header */}
                    <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                      <h2 className="text-[15px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Edit Review Log</h2>
                      <button onClick={() => setMrhEditOpen(false)} className="p-1.5 rounded hover:bg-gray-100" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-shrink-0 px-6" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                      {(["details", "history"] as const).map(t => (
                        <button key={t} onClick={() => setEditTab(t)}
                          className="px-4 py-2.5 text-[13px] font-medium capitalize transition-colors"
                          style={{
                            borderBottom: editTab === t ? '2px solid #145F33' : '2px solid transparent',
                            color: editTab === t ? '#145F33' : 'var(--slds-g-color-text-weak)',
                            marginBottom: '-1px',
                          }}>
                          {t === "details" ? "Details" : "History"}
                        </button>
                      ))}
                    </div>

                    {/* Scrollable body */}
                    <div className="px-6 py-5 overflow-y-auto flex-1">

                      {/* ── Details tab ── */}
                      {editTab === "details" && (
                        <div className="space-y-4">

                          {/* Review Type — read-only */}
                          <div className="space-y-1.5">
                            <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>REVIEW TYPE</label>
                            <div className="h-9 flex items-center px-3 rounded text-[13px]"
                              style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-neutral-95)', color: 'var(--slds-g-color-text-weak)' }}>
                              {mrhSelectedRecord.reviewType}
                            </div>
                          </div>

                          {/* Program + Review Date */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                PROGRAM <span className="text-red-600">*</span>
                              </label>
                              <select value={editProgram} onChange={e => setEditProgram(e.target.value)}
                                className="h-9 w-full px-3 rounded text-[13px] focus:outline-none" disabled
                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-neutral-95)', color: 'var(--slds-g-color-text-weak)' }}>
                                <option value="">Select…</option>
                                {PROGRAM_OPTIONS.map((o: { id: string; name: string }) => (
                                  <option key={o.id} value={o.id}>{o.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                REVIEW DATE <span className="text-red-600">*</span>
                              </label>
                              <input type="text" value={editReviewDate} onChange={e => setEditReviewDate(e.target.value)}
                                placeholder="MM/DD/YYYY" disabled
                                className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-neutral-95)', color: 'var(--slds-g-color-text-weak)' }} />
                            </div>
                          </div>

                          {/* Start Date + End Date */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>START DATE</label>
                              <input type="text" value={editStartDate} onChange={e => setEditStartDate(e.target.value)}
                                placeholder="MM/DD/YYYY" disabled
                                className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
                                style={{border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-neutral-95)', color: 'var(--slds-g-color-text-weak)' }} />
                            </div>
                            <div className="space-y-1.5">
                              <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>END DATE</label>
                              <input type="text" value={editEndDate} onChange={e => setEditEndDate(e.target.value)}
                                placeholder="MM/DD/YYYY" disabled
                                className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
                                style={{border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-neutral-95)', color: 'var(--slds-g-color-text-weak)' }} />
                            </div>
                          </div>

                          {/* Item Expiration Date — full width */}
                          <div className="space-y-1.5">
                            <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>ITEM EXPIRATION DATE</label>
                            <input type="text" value={editExpiryDate} onChange={e => setEditExpiryDate(e.target.value)}
                              placeholder="MM/DD/YYYY"
                              disabled
                              className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
                              style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-neutral-95)', color: 'var(--slds-g-color-text-weak)' }} />
                          </div>

                          {/* Has Issue toggle */}
                          <div className="space-y-1.5">
                            <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>HAS ISSUE</label>
                            <div className="flex items-center gap-0">
                              {(["Yes", "No"] as const).map(v => (
                                <button key={v} onClick={() => setEditHasIssue(v)}
                                  className={`px-5 h-9 text-[13px] font-medium transition-colors first:rounded-l last:rounded-r border${v === "Yes" ? " border-r-0" : ""}`}
                                  style={{
                                    backgroundColor: editHasIssue === v ? (v === "No" ? '#c23934' : '#145F33') : 'var(--slds-g-color-background-base)',
                                    color: editHasIssue === v ? 'white' : 'var(--slds-g-color-text-default)',
                                    borderColor: editHasIssue === v ? (v === "No" ? '#c23934' : '#145F33') : 'var(--slds-g-color-border-base-1)',
                                  }}>
                                  {v}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Comments */}
                          <div className="space-y-1.5">
                            <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>COMMENTS</label>
                            <textarea value={editComments} onChange={e => setEditComments(e.target.value)} rows={4}
                              className="w-full px-3 py-2 rounded text-[13px] focus:outline-none resize-y"
                              style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)', minHeight: '96px' }} />
                          </div>
                        </div>
                      )}

                      {/* ── History tab — reuse mcrHistory table ── */}
                      {editTab === "history" && (
                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                                {["MODIFY DATE/TIME","MODIFIER","FIELD","PREVIOUS VALUE","NEW VALUE"].map(h => (
                                  <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {mrhSelectedRecord.history.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="px-4 py-8 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>No history records.</td>
                                </tr>
                              ) : mrhSelectedRecord.history.map((h: any, i: number) => (
                                <tr key={h.id} style={{ borderBottom: i < mrhSelectedRecord.history.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                  <td className="px-3 py-2 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h.dt}</td>
                                  <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{h.modifier}</td>
                                  <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{h.field}</td>
                                  <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h.prev}</td>
                                  <td className="px-3 py-2 text-[12px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{h.next}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 flex justify-end gap-2 flex-shrink-0" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                      <button onClick={() => setMrhEditOpen(false)}
                        className="h-9 px-4 rounded-full text-[13px] font-medium"
                        style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>
                        Cancel
                      </button>
                      <button
                        onClick={() => { if (saveReviewEdit(mrhSelectedRecord.id, { hasIssue: editHasIssue === "Yes", details: editComments })) setMrhEditOpen(false); }}
                        className="h-9 px-4 rounded-full text-[13px] font-medium text-white"
                        style={{ backgroundColor: '#145F33' }}>
                        Save &amp; Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Create New Review Log Modal ── */}
              {mrhCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                  <div className="rounded-lg w-full flex flex-col overflow-hidden relative" style={{ maxWidth: '860px', maxHeight: '88vh', backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                    {/* Pinned Header */}
                    <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                      <h2 className="text-[15px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Create New Review Log</h2>
                      <button onClick={() => setMrhCreateOpen(false)} className="p-1.5 rounded hover:bg-gray-200" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    {/* Scrollable Body */}
                    <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
                      <div className="space-y-1.5">
                        <FieldLabel htmlFor="mrh-new-type" required>REVIEW TYPE</FieldLabel>
                        <Select
                          value={mrhNewType || undefined}
                          onValueChange={v => { setMrhNewType(v); setMrhNewTypeError(false); }}
                        >
                          <SelectTrigger
                            id="mrh-new-type"
                            aria-invalid={mrhNewTypeError || undefined}
                            aria-describedby={mrhNewTypeError ? "mrh-new-type-err" : undefined}
                          >
                            <SelectValue placeholder="Please Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {MRH_REVIEW_TYPES.map((t: string) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {mrhNewTypeError && <p id="mrh-new-type-err" role="alert" className="text-[11px]" style={{ color: '#c23934' }}>Review Type is required.</p>}
                      </div>
                      {mrhNewType === "Med Cart Review" && (
                        <div className="space-y-4 mt-2">
                          {/* Tab bar */}
                          <div className="flex border-b" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                            {(["med-cart","history"] as const).map(t => (
                              <button key={t} onClick={() => setMcrTab(t)}
                                className="px-4 py-2 text-[12px] font-medium transition-colors"
                                style={{ borderBottom: mcrTab === t ? '2px solid #145F33' : '2px solid transparent', color: mcrTab === t ? '#145F33' : 'var(--slds-g-color-text-weak)', marginBottom: '-1px' }}>
                                {t === "med-cart" ? "Med Cart" : "History"}
                              </button>
                            ))}
                          </div>

                          {mcrTab === "med-cart" && (
                            <div className="space-y-5">
                              {/* Header fields */}
                              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                <div className="space-y-1.5">
                                  <label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>PROGRAM</label>
                                  <select value={mcrProgram || (mrhProgram !== "All Programs" ? mrhProgram : "")} onChange={e => setMcrProgram(e.target.value)}
                                    disabled={!!fixedProgram}
                                    className="h-8 w-full px-2 rounded text-[12px] focus:outline-none"
                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    <option value="">Select…</option>
                                    {(fixedProgram ? [{ id: String(fixedProgram.id), name: fixedProgram.name }] : PROGRAM_OPTIONS).map((o: { id: string; name: string }) => <option key={o.id} value={o.id}>{o.name}</option>)}
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>REVIEWER</label>
                                  <div className="h-8 flex items-center px-2 rounded text-[12px]" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-neutral-95)', color: 'var(--slds-g-color-text-weak)' }}>{MCR_REVIEWER}</div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>REVIEW DATE <span className="text-red-600">*</span></label>
                                  <DateInput
value={mcrReviewDate} onChange={(v) => setMcrReviewDate(v)}
                                    className="h-8 w-full px-2 rounded text-[12px] focus:outline-none"
                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }} />
                                </div>
                              </div>

                              {/* Page instruction */}
                              <p className="text-[11px] px-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                Select <strong>YES</strong> to indicate adequate and current supply — no attention required. Select <strong>NO</strong> to indicate attention is needed and leave a comment (e.g. expiring or low).
                              </p>

                              {/* Helper: renders a single Yes/No row */}
                              {(() => {
                                const YesNoRow = ({ id, label, helper, hasExpiry, hasRestock }: { id: string; label: string; helper?: string; hasExpiry?: boolean; hasRestock?: boolean }) => {
                                  const resp = mcrResp[id] ?? "";
                                  return (
                                    <div className="py-2.5 border-b last:border-b-0" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[12px] font-medium leading-tight" style={{ color: 'var(--slds-g-color-text-default)' }}>{label}</p>
                                          {helper && <p className="text-[11px] mt-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>{helper}</p>}
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          {(["Yes","No"] as const).map(v => (
                                            <button key={v} onClick={() => mcrSetResp(id, v)}
                                              className="px-2.5 h-7 rounded text-[11px] font-medium transition-colors"
                                              style={{
                                                backgroundColor: resp === v ? (v === "Yes" ? '#145F33' : '#c23934') : 'var(--slds-g-color-background-base)',
                                                color: resp === v ? 'white' : 'var(--slds-g-color-text-weak)',
                                                border: `1px solid ${resp === v ? (v === "Yes" ? '#145F33' : '#c23934') : 'var(--slds-g-color-border-base-1)'}`,
                                              }}>{v}</button>
                                          ))}
                                        </div>
                                      </div>
                                      {hasExpiry && (
                                        <div className="mt-1.5 flex items-center gap-2">
                                          <label className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Expiry:</label>
                                          <DateInput
value={isoToMdy(mcrExpiry[id] ?? '')} onChange={(v) => (e => setMcrExpiry(p => ({...p,[id]:e.target.value})))({ target: { value: mdyToIso(v) } })}
                                            className="h-7 px-2 rounded text-[11px] focus:outline-none"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }} />
                                        </div>
                                      )}
                                      {resp === "No" && (
                                        <div className="mt-2 space-y-1.5">
                                          <div>
                                            <label className="text-[11px] font-medium" style={{ color: 'var(--slds-g-color-text-weak)' }}>Comment <span className="text-red-600">*</span></label>
                                            <textarea value={mcrComment[id] ?? ''} onChange={e => setMcrComment(p => ({...p,[id]:e.target.value}))} rows={2} placeholder="Describe the issue…"
                                              className="w-full mt-0.5 px-2 py-1.5 rounded text-[12px] focus:outline-none resize-none"
                                              style={{ border: '1px solid #c23934', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }} />
                                          </div>
                                          {hasRestock && (
                                            <div className="flex items-center gap-2">
                                              <label className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Restock Needed:</label>
                                              {(["Yes","No"] as const).map(v => (
                                                <button key={v} onClick={() => setMcrRestock(p => ({...p,[id]: v === "Yes"}))}
                                                  className="px-2 h-6 rounded text-[10px] font-medium transition-colors"
                                                  style={{
                                                    backgroundColor: (mcrRestock[id] ? "Yes" : "No") === v ? '#145F33' : 'var(--slds-g-color-background-base)',
                                                    color: (mcrRestock[id] ? "Yes" : "No") === v ? 'white' : 'var(--slds-g-color-text-weak)',
                                                    border: `1px solid ${(mcrRestock[id] ? "Yes" : "No") === v ? '#145F33' : 'var(--slds-g-color-border-base-1)'}`,
                                                  }}>{v}</button>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                };

                                return (
                                  <>
                                    {/* Section 1: OTC */}
                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                      <div className="px-3 py-2" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <p className="text-[12px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Over the Counter Medications (Check Supply and Expiration Dates)</p>
                                      </div>
                                      <div className="px-3" style={{ backgroundColor: 'var(--slds-g-color-background-base)' }}>
                                        {MCR_OTC_ITEMS.map(item => <YesNoRow key={item.id} {...item} />)}
                                      </div>
                                    </div>

                                    {/* Section 2: First Aid */}
                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                      <div className="px-3 py-2" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <p className="text-[12px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>First Aid (Check Supply and Expiration Dates)</p>
                                      </div>
                                      <div className="px-3" style={{ backgroundColor: 'var(--slds-g-color-background-base)' }}>
                                        {MCR_FA_ITEMS.map(item => <YesNoRow key={item.id} {...item} />)}
                                      </div>
                                    </div>

                                    {/* Section 3: Prescribed */}
                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                      <div className="px-3 py-2" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <p className="text-[12px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Prescribed Medications</p>
                                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>Select YES to indicate item is current and in compliance — no attention required. Select NO to indicate attention is needed and leave a comment including plan to address.</p>
                                      </div>
                                      <div className="px-3" style={{ backgroundColor: 'var(--slds-g-color-background-base)' }}>
                                        {MCR_PX_ITEMS.map(item => (
                                          <div key={item.id}>
                                            <YesNoRow id={item.id} label={item.label} helper={item.helper} hasExpiry={false} hasRestock={false} />
                                            {item.isDailyCounts && mcrResp[item.id] === "Yes" && (
                                              <div className="mb-3 mt-1 grid grid-cols-2 gap-2 p-2 rounded" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <div className="space-y-1.5">
                                                  <label className="text-[11px] font-medium" style={{ color: 'var(--slds-g-color-text-weak)' }}>START DATE <span className="text-red-600">*</span></label>
                                                  <DateInput
value={isoToMdy(mcrDCStart)} onChange={(v) => (e => setMcrDCStart(e.target.value))({ target: { value: mdyToIso(v) } })} className="h-7 w-full px-2 rounded text-[11px] focus:outline-none" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }} />
                                                </div>
                                                <div className="space-y-1.5">
                                                  <label className="text-[11px] font-medium" style={{ color: 'var(--slds-g-color-text-weak)' }}>END DATE <span className="text-red-600">*</span></label>
                                                  <DateInput
value={isoToMdy(mcrDCEnd)} onChange={(v) => (e => setMcrDCEnd(e.target.value))({ target: { value: mdyToIso(v) } })} className="h-7 w-full px-2 rounded text-[11px] focus:outline-none" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }} />
                                                </div>
                                                <div className="col-span-2 space-y-1.5">
                                                  <label className="text-[11px] font-medium" style={{ color: 'var(--slds-g-color-text-weak)' }}>DETAILS</label>
                                                  <textarea value={mcrDCDetails} onChange={e => setMcrDCDetails(e.target.value)} rows={2} placeholder="Optional details…" className="w-full px-2 py-1 rounded text-[11px] focus:outline-none resize-none" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }} />
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Section 4: Med Cart System */}
                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                      <div className="px-3 py-2" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <p className="text-[12px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Med Cart System</p>
                                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>Select YES to indicate item is present and functioning — no attention required. Select NO to indicate attention is needed and leave a comment.</p>
                                      </div>
                                      <div className="px-3" style={{ backgroundColor: 'var(--slds-g-color-background-base)' }}>
                                        {MCR_MCS_ITEMS.map(item => <YesNoRow key={item.id} id={item.id} label={item.label} helper={item.helper} hasExpiry={false} hasRestock={false} />)}
                                      </div>
                                    </div>

                                    {/* Validation errors */}
                                    {mcrErrors.length > 0 && (
                                      <div className="rounded-lg p-3 space-y-1" style={{ backgroundColor: '#fff5f5', border: '1px solid #fecdca' }}>
                                        {mcrErrors.map((e,i) => <p key={i} className="text-[11px]" style={{ color: '#b42318' }}>• {e}</p>)}
                                      </div>
                                    )}

                                    {/* Cancel confirmation */}
                                    {mcrCancelConfirm && (
                                      <div className="rounded-lg p-3" style={{ backgroundColor: '#fff8e1', border: '1px solid #fed35a' }}>
                                        <p className="text-[12px] font-medium mb-2" style={{ color: '#705E2E' }}>Discard changes and close without saving?</p>
                                        <div className="flex gap-2">
                                          <button onClick={() => { setMrhCreateOpen(false); setMrhNewType(""); setMcrCancelConfirm(false); }}
                                            className="h-7 px-3 rounded-full text-[11px] font-medium text-white" style={{ backgroundColor: '#c23934' }}>Yes, Discard</button>
                                          <button onClick={() => setMcrCancelConfirm(false)}
                                            className="h-7 px-3 rounded-full text-[11px] font-medium" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>Keep Editing</button>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          )}

                          {mcrTab === "history" && (
                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                                    {["MODIFY DATE/TIME","MODIFIER","FIELD","PREVIOUS VALUE","NEW VALUE"].map(h => (
                                      <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {mcrHistory.map((h,i) => (
                                    <tr key={h.id} style={{ borderBottom: i < mcrHistory.length-1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                      <td className="px-3 py-2 text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h.dt}</td>
                                      <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{h.modifier}</td>
                                      <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{h.field}</td>
                                      <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h.prev}</td>
                                      <td className="px-3 py-2 text-[12px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{h.next}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                      {(mrhNewType === "Count Review" || mrhNewType === "Med Documentation Review") && (
                        <div className="space-y-4 mt-2">
                          {/* Header fields — read-only */}
                          <div className="grid grid-cols-3 gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <div className="space-y-1">
                              <label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>REVIEW TYPE</label>
                              <div className="h-8 flex items-center px-2 rounded text-[12px]" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-neutral-95)', color: 'var(--slds-g-color-text-weak)' }}>{mrhNewType}</div>
                            </div>
                            <ProgramPickField fixedProgram={fixedProgram} value={createProgramId} onChange={v => { setCreateProgramId(v); setCreateProgramError(""); }} options={PROGRAM_OPTIONS} error={createProgramError} />
                            <div className="space-y-1">
                              <label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>REVIEWER</label>
                              <div className="h-8 flex items-center px-2 rounded text-[12px]" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-neutral-95)', color: 'var(--slds-g-color-text-weak)' }}>Sohan Jadhavrao</div>
                            </div>
                          </div>
                          {/* Date fields */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>START DATE <span className="text-red-600">*</span></label>
                              <DateInput
value={isoToMdy(crStartDate)} onChange={(v) => (e=>setCrStartDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                                className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
                                style={{ border: `1px solid ${!crStartDate && crConcernsNoted ? '#c23934' : 'var(--slds-g-color-border-base-1)'}`, backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }} />
                            </div>
                            <div className="space-y-1.5">
                              <label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>END DATE <span className="text-red-600">*</span></label>
                              <DateInput
value={isoToMdy(crEndDate)} onChange={(v) => (e=>setCrEndDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                                className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }} />
                            </div>
                          </div>
                          {/* Concerns Noted toggle */}
                          <div className="space-y-1.5">
                            <label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>CONCERNS NOTED</label>
                            <div className="flex items-center gap-1">
                              {(["Yes","No"] as const).map(v=>(
                                <button key={v} onClick={()=>setCrConcernsNoted(v)}
                                  className="px-4 h-9 rounded text-[13px] font-medium transition-colors"
                                  style={{ backgroundColor: crConcernsNoted===v ? '#145F33' : 'var(--slds-g-color-background-base)', color: crConcernsNoted===v ? 'white' : 'var(--slds-g-color-text-default)', border: `1px solid ${crConcernsNoted===v ? '#145F33' : 'var(--slds-g-color-border-base-1)'}` }}>
                                  {v}
                                </button>
                              ))}
                            </div>
                          </div>
                          {/* Conditional details */}
                          {crConcernsNoted === "Yes" && (
                            <div className="space-y-1.5">
                              <label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>DETAILS <span className="text-red-600">*</span></label>
                              <textarea value={crDetails} onChange={e=>setCrDetails(e.target.value)} rows={3} placeholder="Describe concerns observed…"
                                className="w-full px-3 py-2 rounded text-[13px] focus:outline-none resize-y"
                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)', minHeight: '72px' }} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Pinned Footer */}
                    <div className="px-6 py-4 flex justify-end gap-2 flex-shrink-0" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                      <button onClick={() => setMrhCreateOpen(false)} className="h-9 px-4 rounded-full text-[13px] font-medium" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>Cancel</button>
                      <button onClick={() => hubSave(false)} className="h-9 px-4 rounded-full text-[13px] font-medium" style={{ border: '1px solid #145F33', color: '#145F33', backgroundColor: 'var(--slds-g-color-background-base)' }}>Save</button>
                      <button onClick={() => hubSave(true)} className="h-9 px-4 rounded-full text-[13px] font-medium text-white" style={{ backgroundColor: '#145F33' }}>Save &amp; Close</button>
                    </div>

                    {/* ── Review Saved Successfully — Notification Confirmation Modal ── */}
                    {mcrNotifyOpen && (
                      <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                        <div className="rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                          {/* Success header */}
                          <div className="px-6 pt-6 pb-4 text-center">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(20,95,51,0.1)' }}>
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#145F33" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <h3 className="text-[16px] font-semibold mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>Review Saved Successfully</h3>
                            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                              Issues requiring notification were identified.
                            </p>
                            <p className="text-[13px] leading-relaxed mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                              Would you like to send a Med Review notification email now?
                            </p>
                          </div>
                          {/* Actions */}
                          <div className="px-6 pb-6 flex gap-3 justify-center">
                            <button
                              onClick={() => {
                                setMcrNotifyOpen(false);
                                if (mcrNotifyCloseAfter) { setMrhCreateOpen(false); setMrhNewType(""); }
                              }}
                              className="h-9 px-4 rounded-full text-[13px] font-medium"
                              style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                            >
                              Not Now
                            </button>
                            <button
                              onClick={() => {
                                setMcrNotifyOpen(false);
                                if (mcrNotifyCloseAfter) { setMrhCreateOpen(false); setMrhNewType(""); }
                                /* TODO: open pre-populated email composer */
                              }}
                              className="h-9 px-5 rounded-full text-[13px] font-medium text-white inline-flex items-center gap-2"
                              style={{ backgroundColor: '#145F33' }}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Send Med Review
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : navSection === 'counts' ? (
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-5" style={{ backgroundColor: 'var(--slds-g-color-background-base)' }}>


              {/* ── Primary Count Log Table ── */}
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Count Logs
                    <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(20,95,51,0.1)', color: '#145F33' }}>{cntFiltered.length}</span>
                  </span>
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="Refresh"
                          onClick={() => { refreshMedReviewsFromStorage(); reloadMedicationLogs(); }}>
                          <RefreshCw />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Refresh</TooltipContent>
                    </Tooltip>
                    <button
                      disabled={!perms.export}
                      onClick={() => exportToCSV(
                        'med-review-count.csv',
                        ["Youth","Medication","Dose","Dosing Period","Log Type","Count","Count Type","Comments","Attestation Staff","Attestation Date","Package"],
                        cntFiltered.map((r: any) => [r.youth, r.medication, r.dose, r.dosingPeriod, r.logType, r.count, r.countType, r.comments, r.attestationStaff, r.attestationDate, r.pkg])
                      )}
                      className="h-9 px-4 rounded-full text-[13px] font-medium transition-colors"
                      style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>
                      <Download className="h-3.5 w-3.5 inline mr-1.5" />Export to Excel
                    </button>
                    <button
                      type="button"
                      aria-expanded={cntFiltersOpen}
                      aria-controls="cnt-filter-panel"
                      onClick={() => setCntFiltersOpen(o => !o)}
                      className="h-9 px-4 rounded-full text-[13px] font-medium transition-colors flex items-center gap-1.5"
                      style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: cntFiltersOpen ? 'var(--slds-g-color-background-alt)' : 'var(--slds-g-color-background-base)' }}>
                      <Filter className="h-3.5 w-3.5" />Filters
                      {cntFiltersOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                <Button
                  type="button"
                  variant="outline-primary"
                  className="h-9"
                  disabled={cntSelectedId === null || !perms.count}
                  title={!perms.count ? "You don't have permission to record medication counts." : undefined}
                  onClick={() => cntSelectedId !== null && perms.count && setCntCountModalOpen(true)}>
                  <Plus />Count
                </Button>
                    <Button
                      type="button"
                      className="h-9"
                      disabled={!perms.create}
                      title={!perms.create ? "You don't have permission to create review logs." : undefined}
                      onClick={() => { prepareCreate(); setCrStartDate(""); setCrEndDate(""); setCrConcernsNoted("No"); setCrDetails(""); setCntCreateOpen(true); }}>
                      <Plus />Create New Review Log
                    </Button>
                  </div>
                </div>
              {cntFiltersOpen && (
              <div id="cnt-filter-panel" className="p-4 bg-[var(--slds-g-color-background-alt)] grid gap-x-4 gap-y-3.5 items-end" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>

                {/* Program-origin entry only: the originating Program, locked. */}
                {fixedProgram && (
                  <FilterField label="PROGRAM" htmlFor="cnt-program">
                    <Select value={fixedProgram.name} disabled>
                      <SelectTrigger id="cnt-program">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={fixedProgram.name}>{fixedProgram.name}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FilterField>
                )}
                <FilterField label="YOUTH" htmlFor="cnt-youth">
                  <Select value={cntFilterYouth || "all"} onValueChange={v => setCntFilterYouth(v === "all" ? "" : v)}>
                    <SelectTrigger id="cnt-youth">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {COUNT_YOUTHS.map((o: string) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FilterField>
                <FilterField label="MEDICATION" htmlFor="cnt-med">
                  <Select value={cntFilterMed || "all"} onValueChange={v => setCntFilterMed(v === "all" ? "" : v)}>
                    <SelectTrigger id="cnt-med">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {COUNT_MEDS.map((o: string) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FilterField>
                <FilterField label="DOSING PERIOD" htmlFor="cnt-period">
                  <Select value={cntFilterPeriod || "all"} onValueChange={v => setCntFilterPeriod(v === "all" ? "" : v)}>
                    <SelectTrigger id="cnt-period">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {COUNT_PERIODS.map((o: string) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FilterField>
                <div className="flex flex-col justify-end">
                  <Button
                    type="button"
                    variant="outline-primary"
                    disabled={!cntFilterYouth && !cntFilterMed && !cntFilterPeriod}
                    onClick={() => { setCntFilterYouth(""); setCntFilterMed(""); setCntFilterPeriod(""); setCntSelectedId(null); }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              )}

              {/* ── Filter Bar (collapsible) ── */}
                <div className="overflow-x-auto">
                  <RadioGroup value={cntSelectedId == null ? "" : String(cntSelectedId)} className="block gap-0">
                  <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: '1100px' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                        <th className="px-3 py-2.5 w-10" />
                        {["Youth","Medication","Dose","Dosing Period","Log Type","Count","Count Type","Comments","Attestation Staff","Attestation Date","Package"].map(h=>(
                          <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cntFiltered.length===0 ? (
                        <tr><td colSpan={12} className="px-6 py-10 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>No records match the selected filters.</td></tr>
                      ) : cntFiltered.map((row,idx)=>{
                        const sel = row.id===cntSelectedId;
                        return (
                          <tr key={row.id} onClick={()=>setCntSelectedId(sel?null:row.id)} className="cursor-pointer"
                            style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: sel ? 'rgba(20,95,51,0.07)' : idx%2===0 ? 'var(--slds-g-color-background-base)' : 'var(--slds-g-color-background-alt)', outline: sel ? '2px solid #145F33' : 'none', outlineOffset: '-2px' }}
                            onMouseEnter={e=>{ if(!sel)(e.currentTarget as HTMLTableRowElement).style.backgroundColor='var(--slds-g-color-background-alt)'; }}
                            onMouseLeave={e=>{ if(!sel)(e.currentTarget as HTMLTableRowElement).style.backgroundColor=idx%2===0?'var(--slds-g-color-background-base)':'var(--slds-g-color-background-alt)'; }}>
                            <td className="px-3 py-2.5 text-center"><RadioGroupItem value={String(row.id)} aria-label={`Select count log for ${row.youth}`} onClick={e=>{ e.stopPropagation(); setCntSelectedId(row.id); }}/></td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{color:'var(--color-link-blue)'}}>{row.youth}</td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{color:'var(--slds-g-color-text-default)'}}>{row.medication}</td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{color:'var(--slds-g-color-text-default)'}}>{row.dose}</td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{color:'var(--slds-g-color-text-default)'}}>{row.dosingPeriod}</td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{color:'var(--slds-g-color-text-default)'}}>{row.logType}</td>
                            <td className="px-3 py-2.5 text-[13px] text-center whitespace-nowrap" style={{color:'var(--slds-g-color-text-default)'}}>{row.count}</td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{color:'var(--slds-g-color-text-default)'}}>{row.countType}</td>
                            <td className="px-3 py-2.5 text-[13px] max-w-[140px]" style={{color:'var(--slds-g-color-text-weak)'}}><span className="truncate block" title={row.comments}>{row.comments||'—'}</span></td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{color:'var(--slds-g-color-text-default)'}}>{row.attestationStaff}</td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{color:'var(--slds-g-color-text-weak)'}}>{row.attestationDate}</td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{color:'var(--slds-g-color-text-default)'}}>{row.pkg}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </RadioGroup>
                </div>
                <div className="px-4 py-2" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                  <span className="text-[12px]" style={{color:'var(--slds-g-color-text-weak)'}}>{cntFiltered.length} record{cntFiltered.length!==1?'s':''}{cntSelectedId?' · 1 selected':''}</span>
                </div>
              </div>

              {/* ── Dispensation Logs ── */}
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                <div className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Dispensation Logs</span>
                </div>
                {cntSelectedId===null ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ClipboardList className="h-10 w-10 mb-3" style={{color:'var(--slds-g-color-text-weak)',opacity:0.4}}/>
                    <p className="text-[13px]" style={{color:'var(--slds-g-color-text-weak)'}}>Select a record above to view history.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full" style={{borderCollapse:'collapse',minWidth:'1100px'}}>
                      <thead>
                        <tr style={{backgroundColor:'var(--slds-g-color-background-alt)',borderBottom:'2px solid var(--slds-g-color-border-base-1)'}}>
                          {["Youth","Medication","Dose","Dosing Period","Log Type","Count","Count Type","Comments","Attestation Staff","Attestation Date","Package"].map(h=>(
                            <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{color:'var(--slds-g-color-text-weak)'}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(DISP_BY_ID[cntSelectedId]||[]).length===0 ? (
                          <tr><td colSpan={11} className="px-6 py-8 text-center text-[13px]" style={{color:'var(--slds-g-color-text-weak)'}}>No dispensation history for this record.</td></tr>
                        ) : (DISP_BY_ID[cntSelectedId]||[]).map((row,idx)=>(
                          <tr key={row.id} style={{borderBottom:'1px solid var(--slds-g-color-border-base-1)',backgroundColor:idx%2===0?'var(--slds-g-color-background-base)':'var(--slds-g-color-background-alt)'}}>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{color:'var(--color-link-blue)'}}>{row.youth}</td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{color:'var(--slds-g-color-text-default)'}}>{row.medication}</td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{color:'var(--slds-g-color-text-default)'}}>{row.dose}</td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{color:'var(--slds-g-color-text-default)'}}>{row.dosingPeriod}</td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{color:'var(--slds-g-color-text-default)'}}>{row.logType}</td>
                            <td className="px-3 py-2.5 text-[13px] text-center whitespace-nowrap" style={{color:'var(--slds-g-color-text-default)'}}>{row.count}</td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{color:'var(--slds-g-color-text-default)'}}>{row.countType}</td>
                            <td className="px-3 py-2.5 text-[13px]" style={{color:'var(--slds-g-color-text-weak)'}}>{row.comments||'—'}</td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{color:'var(--slds-g-color-text-default)'}}>{row.attestationStaff}</td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{color:'var(--slds-g-color-text-weak)'}}>{row.attestationDate}</td>
                            <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{color:'var(--slds-g-color-text-default)'}}>{row.pkg}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Count Modal: records a canonical Count for the selected row ── */}
              {cntCountModalOpen && cntSelectedId !== null && (() => {
                const selectedRow = COUNT_ROWS.find(r => r.id === cntSelectedId);
                return (
                  <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                    <div className="rounded-lg w-full flex flex-col overflow-hidden" style={{ maxWidth: '960px', maxHeight: '90vh', backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', boxShadow: '0 8px 32px rgba(0,0,0,0.22)' }}>
                      {/* Modal Header */}
                      <div className="px-6 py-4 flex items-start justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                        <div>
                          <h2 className="text-[15px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication Count</h2>
                          {selectedRow && (
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-[12px] font-medium" style={{ color: 'var(--slds-g-color-text-weak)' }}>Youth:</span>
                              <span className="text-[12px] font-semibold" style={{ color: 'var(--color-link-blue)' }}>{selectedRow.youth}</span>
                              <span className="text-[12px]" style={{ color: 'var(--slds-g-color-border-base-1)' }}>·</span>
                              <span className="text-[12px] font-medium" style={{ color: 'var(--slds-g-color-text-weak)' }}>Medication:</span>
                              <span className="text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{selectedRow.medication}</span>
                              <span className="text-[12px]" style={{ color: 'var(--slds-g-color-border-base-1)' }}>·</span>
                              <span className="text-[12px] font-medium" style={{ color: 'var(--slds-g-color-text-weak)' }}>Dose:</span>
                              <span className="text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{selectedRow.dose}</span>
                              <span className="text-[12px]" style={{ color: 'var(--slds-g-color-border-base-1)' }}>·</span>
                              <span className="text-[12px] font-medium" style={{ color: 'var(--slds-g-color-text-weak)' }}>Period:</span>
                              <span className="text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{selectedRow.dosingPeriod}</span>
                              <span className="text-[12px]" style={{ color: 'var(--slds-g-color-border-base-1)' }}>·</span>
                              <span className="text-[12px] font-medium" style={{ color: 'var(--slds-g-color-text-weak)' }}>Package:</span>
                              <span className="text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{selectedRow.pkg}</span>
                            </div>
                          )}
                        </div>
                        <button onClick={() => setCntCountModalOpen(false)} className="p-1.5 rounded hover:bg-gray-200 flex-shrink-0" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      {/* Modal Body — canonical count entry */}
                      <div className="flex-1 overflow-y-auto">
                        {selectedRow
                          ? <ReviewCountEntry key={selectedRow.id} row={selectedRow} expectedProgramId={fixedProgram ? fixedProgram.id : null} onDone={() => setCntCountModalOpen(false)} />
                          : null}
                      </div>
                      {/* Modal Footer */}
                      <div className="px-6 py-3 flex items-center justify-between flex-shrink-0" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                        <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Submit the count using the form above. It is saved when you click Submit.</p>
                        <button onClick={() => setCntCountModalOpen(false)} className="h-9 px-4 rounded-full text-[13px] font-medium" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>
                          Close & Return
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ── Count Review Log Modal ── */}
              {cntCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{backgroundColor:'rgba(0,0,0,0.4)'}}>
                  <div className="rounded-lg w-full max-w-lg mx-4 overflow-hidden flex flex-col" style={{maxHeight:'90vh',backgroundColor:'var(--slds-g-color-background-base)',border:'1px solid var(--slds-g-color-border-base-1)',boxShadow:'0 8px 32px rgba(0,0,0,0.2)'}}>
                    <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{borderBottom:'1px solid var(--slds-g-color-border-base-1)',backgroundColor:'var(--slds-g-color-background-alt)'}}>
                      <h2 className="text-[15px] font-semibold" style={{color:'var(--slds-g-color-text-default)'}}>Create New Review Log</h2>
                      <button onClick={()=>setCntCreateOpen(false)} className="p-1.5 rounded hover:bg-gray-200" style={{color:'var(--slds-g-color-text-weak)'}}><X className="h-5 w-5"/></button>
                    </div>
                    <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
                      <div className="grid grid-cols-3 gap-3 p-3 rounded-lg" style={{backgroundColor:'var(--slds-g-color-background-alt)',border:'1px solid var(--slds-g-color-border-base-1)'}}>
                        <div className="space-y-1"><label className="slds-form-label whitespace-nowrap" style={{color:'var(--slds-g-color-text-weak)'}}>REVIEW TYPE</label><div className="h-8 flex items-center px-2 rounded text-[12px]" style={{border:'1px solid var(--slds-g-color-border-base-1)',backgroundColor:'var(--slds-g-color-neutral-95)',color:'var(--slds-g-color-text-weak)'}}>Count Review</div></div>
                        <ProgramPickField fixedProgram={fixedProgram} value={createProgramId} onChange={v => { setCreateProgramId(v); setCreateProgramError(""); }} options={PROGRAM_OPTIONS} error={createProgramError} />
                        <div className="space-y-1"><label className="slds-form-label whitespace-nowrap" style={{color:'var(--slds-g-color-text-weak)'}}>REVIEWER</label><div className="h-8 flex items-center px-2 rounded text-[12px]" style={{border:'1px solid var(--slds-g-color-border-base-1)',backgroundColor:'var(--slds-g-color-neutral-95)',color:'var(--slds-g-color-text-weak)'}}>Sohan Jadhavrao</div></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><label className="slds-form-label whitespace-nowrap" style={{color:'var(--slds-g-color-text-weak)'}}>START DATE <span className="text-red-600">*</span></label><DateInput
value={isoToMdy(crStartDate)} onChange={(v) => (e=>setCrStartDate(e.target.value))({ target: { value: mdyToIso(v) } })} className="h-9 w-full px-3 rounded text-[13px] focus:outline-none" style={{border:`1px solid ${!crStartDate?'#c23934':'var(--slds-g-color-border-base-1)'}`,backgroundColor:'var(--slds-g-color-background-base)',color:'var(--slds-g-color-text-default)'}}/></div>
                        <div className="space-y-1.5"><label className="slds-form-label whitespace-nowrap" style={{color:'var(--slds-g-color-text-weak)'}}>END DATE <span className="text-red-600">*</span></label><DateInput
value={isoToMdy(crEndDate)} onChange={(v) => (e=>setCrEndDate(e.target.value))({ target: { value: mdyToIso(v) } })} className="h-9 w-full px-3 rounded text-[13px] focus:outline-none" style={{border:`1px solid ${!crEndDate?'#c23934':'var(--slds-g-color-border-base-1)'}`,backgroundColor:'var(--slds-g-color-background-base)',color:'var(--slds-g-color-text-default)'}}/></div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="slds-form-label whitespace-nowrap" style={{color:'var(--slds-g-color-text-weak)'}}>CONCERNS NOTED</label>
                        <div className="flex items-center gap-1">
                          {(["Yes","No"] as const).map(v=>(
                            <button key={v} onClick={()=>setCrConcernsNoted(v)} className="px-4 h-9 rounded text-[13px] font-medium transition-colors"
                              style={{backgroundColor:crConcernsNoted===v?'#145F33':'var(--slds-g-color-background-base)',color:crConcernsNoted===v?'white':'var(--slds-g-color-text-default)',border:`1px solid ${crConcernsNoted===v?'#145F33':'var(--slds-g-color-border-base-1)'}`}}>
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                      {crConcernsNoted==="Yes" && (
                        <div className="space-y-1.5"><label className="slds-form-label whitespace-nowrap" style={{color:'var(--slds-g-color-text-weak)'}}>DETAILS <span className="text-red-600">*</span></label><textarea value={crDetails} onChange={e=>setCrDetails(e.target.value)} rows={3} placeholder="Describe concerns observed…" className="w-full px-3 py-2 rounded text-[13px] focus:outline-none resize-y" style={{border:'1px solid var(--slds-g-color-border-base-1)',backgroundColor:'var(--slds-g-color-background-base)',color:'var(--slds-g-color-text-default)',minHeight:'72px'}}/></div>
                      )}
                    </div>
                    <div className="px-6 py-4 flex justify-end gap-2 flex-shrink-0" style={{borderTop:'1px solid var(--slds-g-color-border-base-1)',backgroundColor:'var(--slds-g-color-background-alt)'}}>
                      <button onClick={()=>setCntCreateOpen(false)} className="h-9 px-4 rounded-full text-[13px] font-medium" style={{border:'1px solid var(--slds-g-color-border-base-1)',color:'var(--slds-g-color-text-default)',backgroundColor:'var(--slds-g-color-background-base)'}}>Cancel</button>
                      <button onClick={saveCntReview} disabled={!crStartDate||!crEndDate||(crConcernsNoted==="Yes"&&!crDetails.trim())}
                        className="h-9 px-4 rounded-full text-[13px] font-medium text-white disabled:opacity-40" style={{backgroundColor:'#145F33'}}>Save</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : navSection === 'med-documentation' && focusedRecordId && !focusedRecordAvailable ? (
            <MedicationRecordFocusNotice
              available={false}
              backLabel={focusReturnTo === 'documentation-issues' ? 'Back to Documentation Issues' : 'Back to Global Medication Error Dashboard'}
              onBackToDashboard={focusReturnTo === 'documentation-issues' ? backToDocumentationIssues : backToDashboard}
              onShowAll={() => setNavSection('med-documentation')}
            />
          ) : navSection === 'med-documentation' ? (
            medDocBody
          ) : navSection === 'disposal-admin' ? (
            <ManageDisposalView />
          ) : navSection === 'logs' ? (
            <MedicationLogsWorkspace />
          ) : navSection === 'medication-count' ? (
            <MedicationCountWorkspace />
          ) : navSection === 'pack-meds-admin' || navSection === 'cart-audit' || navSection === 'audits-reports' ? (
            null
          ) : (
            <div className="px-6 pb-6 pt-4">
              <MedicationCatalogView />
            </div>
          )}
        </>
    );
}