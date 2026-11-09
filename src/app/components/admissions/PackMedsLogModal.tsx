// @ts-nocheck
import React, { useState, useMemo } from "react";
import { X, ChevronUp, ChevronDown, Filter, Eye, ClipboardCheck } from "@/app/lib/lucide-icons";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";

type LogView = "general" | "counts" | "comments";

interface LogEntry {
    id: number;
    doseDate: string;
    dosePeriod: "Morning" | "Afternoon" | "Evening" | "Bedtime";
    inst: string;
    seq: string;
    logType: string;
    num: string;
    primaryCode: string;
    attestationDate: string;
    attestationStaff: string;
    medicationDose: string;
    comments: string;
    dosePeriodComments: string;
}

interface AttestationEntry {
    id: number;
    date: string;
    time: string;
    type: string;
    staff: string;
}

const MOCK_LOG_ENTRIES: LogEntry[] = [
    { id: 1,  doseDate: "07/30/2026", dosePeriod: "Morning",   inst: "RT", seq: "1", logType: "Prescription Dispensation",   num: "2",  primaryCode: "MPM -- Missed Packed Med",       attestationDate: "07/30/2026", attestationStaff: "J. Smith, RN",   medicationDose: "Sertraline 50mg",       comments: "",                                  dosePeriodComments: "Youth cooperative with AM meds" },
    { id: 2,  doseDate: "07/30/2026", dosePeriod: "Afternoon",  inst: "RT", seq: "1", logType: "Prescription Dispensation",   num: "1",  primaryCode: "PPM -- Packed Med",              attestationDate: "07/30/2026", attestationStaff: "J. Smith, RN",   medicationDose: "Methylphenidate 10mg",  comments: "",                                  dosePeriodComments: "" },
    { id: 3,  doseDate: "07/30/2026", dosePeriod: "Evening",    inst: "RT", seq: "2", logType: "OTC Dispensation",            num: "1",  primaryCode: "PPM -- Packed Med",              attestationDate: "07/30/2026", attestationStaff: "M. Torres, LPN", medicationDose: "Melatonin 3mg",         comments: "Youth requested with water",        dosePeriodComments: "" },
    { id: 4,  doseDate: "07/31/2026", dosePeriod: "Morning",    inst: "RT", seq: "1", logType: "Prescription Dispensation",   num: "2",  primaryCode: "MPM -- Missed Packed Med",       attestationDate: "07/31/2026", attestationStaff: "M. Torres, LPN", medicationDose: "Sertraline 50mg",       comments: "",                                  dosePeriodComments: "Morning routine completed" },
    { id: 5,  doseDate: "07/31/2026", dosePeriod: "Bedtime",    inst: "RT", seq: "1", logType: "Prescription Dispensation",   num: "1",  primaryCode: "PPM -- Packed Med",              attestationDate: "07/31/2026", attestationStaff: "A. Davis, RN",   medicationDose: "Quetiapine 25mg",       comments: "",                                  dosePeriodComments: "" },
    { id: 6,  doseDate: "08/01/2026", dosePeriod: "Morning",    inst: "RT", seq: "1", logType: "Count",                       num: "30", primaryCode: "CNT -- Count",                   attestationDate: "08/01/2026", attestationStaff: "A. Davis, RN",   medicationDose: "Sertraline 50mg",       comments: "Count verified — 30 tablets",       dosePeriodComments: "" },
    { id: 7,  doseDate: "08/01/2026", dosePeriod: "Afternoon",  inst: "RT", seq: "2", logType: "Prescription Dispensation",   num: "1",  primaryCode: "PPM -- Packed Med",              attestationDate: "08/01/2026", attestationStaff: "J. Smith, RN",   medicationDose: "Methylphenidate 10mg",  comments: "",                                  dosePeriodComments: "" },
    { id: 8,  doseDate: "08/02/2026", dosePeriod: "Morning",    inst: "RT", seq: "1", logType: "Prescription Dispensation",   num: "2",  primaryCode: "PPM -- Packed Med",              attestationDate: "08/02/2026", attestationStaff: "M. Torres, LPN", medicationDose: "Sertraline 50mg",       comments: "",                                  dosePeriodComments: "Good morning compliance" },
    { id: 9,  doseDate: "08/02/2026", dosePeriod: "Evening",    inst: "RT", seq: "1", logType: "OTC Dispensation",            num: "1",  primaryCode: "PPM -- Packed Med",              attestationDate: "08/02/2026", attestationStaff: "M. Torres, LPN", medicationDose: "Acetaminophen 500mg",   comments: "Youth reported headache",           dosePeriodComments: "" },
    { id: 10, doseDate: "08/03/2026", dosePeriod: "Bedtime",    inst: "RT", seq: "1", logType: "Lockbox",                     num: "1",  primaryCode: "LBX -- Lockbox",                 attestationDate: "08/03/2026", attestationStaff: "A. Davis, RN",   medicationDose: "Quetiapine 25mg",       comments: "Secured in lockbox per protocol",   dosePeriodComments: "" },
    { id: 11, doseDate: "08/04/2026", dosePeriod: "Morning",    inst: "RT", seq: "1", logType: "Prescription Dispensation",   num: "2",  primaryCode: "MPM -- Missed Packed Med",       attestationDate: "08/04/2026", attestationStaff: "J. Smith, RN",   medicationDose: "Sertraline 50mg",       comments: "",                                  dosePeriodComments: "" },
    { id: 12, doseDate: "08/04/2026", dosePeriod: "Afternoon",  inst: "RT", seq: "1", logType: "Pharmacy Transfer (Pending)", num: "30", primaryCode: "PTR -- Pharmacy Transfer",       attestationDate: "08/04/2026", attestationStaff: "J. Smith, RN",   medicationDose: "Methylphenidate 10mg",  comments: "Transferred to Community Pharmacy", dosePeriodComments: "" },
    { id: 13, doseDate: "08/05/2026", dosePeriod: "Morning",    inst: "RT", seq: "2", logType: "Prescription Dispensation",   num: "2",  primaryCode: "PPM -- Packed Med",              attestationDate: "08/05/2026", attestationStaff: "M. Torres, LPN", medicationDose: "Sertraline 50mg",       comments: "",                                  dosePeriodComments: "Youth on home visit — sent with pack" },
    { id: 14, doseDate: "08/05/2026", dosePeriod: "Bedtime",    inst: "RT", seq: "1", logType: "Disposal",                    num: "2",  primaryCode: "DSP -- Disposal",                attestationDate: "08/05/2026", attestationStaff: "A. Davis, RN",   medicationDose: "Quetiapine 25mg",       comments: "Disposed — expired meds",           dosePeriodComments: "" },
    { id: 15, doseDate: "08/06/2026", dosePeriod: "Morning",    inst: "RT", seq: "1", logType: "Pharmacy Transfer (Verified)",num: "30", primaryCode: "PTV -- Transfer Verified",       attestationDate: "08/06/2026", attestationStaff: "J. Smith, RN",   medicationDose: "Methylphenidate 10mg",  comments: "Transfer verified by pharmacy",     dosePeriodComments: "" },
];

const DOSE_PERIOD_ORDER: Record<string, number> = { Morning: 0, Afternoon: 1, Evening: 2, Bedtime: 3 };

function parseDateMMDDYYYY(s: string): number {
    if (!s) return 0;
    const [m, d, y] = s.split("/").map(Number);
    return new Date(y, m - 1, d).getTime();
}

interface PackMedsLogModalProps {
    open: boolean;
    onClose: () => void;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    youthName?: string;
}

export function PackMedsLogModal({
    open, onClose, startDate, startTime, endDate, endTime, youthName = "Alex Martinez",
}: PackMedsLogModalProps) {
    const [view, setView] = useState<LogView>("general");
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [sortCol, setSortCol] = useState<string>("doseDate");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [filterInputs, setFilterInputs] = useState<Record<string, string>>({});
    const [activeFilterCol, setActiveFilterCol] = useState<string | null>(null);
    const [viewRecordOpen, setViewRecordOpen] = useState(false);
    const [viewRecordEntry, setViewRecordEntry] = useState<LogEntry | null>(null);
    const [attestationOpen, setAttestationOpen] = useState(false);

    const packLabel =
        startDate && endDate
            ? `${startDate}${startTime ? " " + startTime : ""} – ${endDate}${endTime ? " " + endTime : ""}`
            : null;

    // Filter mock data by pack date range
    const rangeStart = parseDateMMDDYYYY(startDate);
    const rangeEnd   = parseDateMMDDYYYY(endDate);

    const baseEntries = useMemo(() => {
        return MOCK_LOG_ENTRIES.filter(e => {
            const t = parseDateMMDDYYYY(e.doseDate);
            if (rangeStart && t < rangeStart) return false;
            if (rangeEnd   && t > rangeEnd)   return false;
            return true;
        });
    }, [rangeStart, rangeEnd]);

    // Apply column text filters
    const filteredEntries = useMemo(() => {
        return baseEntries.filter(e => {
            for (const [col, val] of Object.entries(filterInputs)) {
                if (!val.trim()) continue;
                const needle = val.toLowerCase();
                const haystack = String((e as any)[col] ?? "").toLowerCase();
                if (!haystack.includes(needle)) return false;
            }
            return true;
        });
    }, [baseEntries, filterInputs]);

    // Apply sort
    const sortedEntries = useMemo(() => {
        return [...filteredEntries].sort((a, b) => {
            let av: any = (a as any)[sortCol] ?? "";
            let bv: any = (b as any)[sortCol] ?? "";
            if (sortCol === "doseDate" || sortCol === "attestationDate") {
                av = parseDateMMDDYYYY(av);
                bv = parseDateMMDDYYYY(bv);
            } else if (sortCol === "dosePeriod") {
                av = DOSE_PERIOD_ORDER[av] ?? 99;
                bv = DOSE_PERIOD_ORDER[bv] ?? 99;
            } else if (sortCol === "num") {
                av = parseFloat(av) || 0;
                bv = parseFloat(bv) || 0;
            } else {
                av = String(av).toLowerCase();
                bv = String(bv).toLowerCase();
            }
            const cmp = av < bv ? -1 : av > bv ? 1 : 0;
            return sortDir === "asc" ? cmp : -cmp;
        });
    }, [filteredEntries, sortCol, sortDir]);

    const toggleSort = (col: string) => {
        if (sortCol === col) {
            setSortDir(d => d === "asc" ? "desc" : "asc");
        } else {
            setSortCol(col);
            setSortDir("asc");
        }
    };

    const toggleSelect = (id: number) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selected.size === sortedEntries.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(sortedEntries.map(e => e.id)));
        }
    };

    const handleView = () => {
        const sel = sortedEntries.find(e => selected.has(e.id));
        if (!sel) return;
        setViewRecordEntry(sel);
        setViewRecordOpen(true);
    };

    const handleFilterChange = (col: string, val: string) => {
        setFilterInputs(prev => ({ ...prev, [col]: val }));
    };

    const toggleFilterCol = (col: string) => {
        setActiveFilterCol(prev => prev === col ? null : col);
    };

    // Attestation data - all or filtered to selected rows
    const attestationEntries: AttestationEntry[] = useMemo(() => {
        const relevant = selected.size > 0
            ? sortedEntries.filter(e => selected.has(e.id))
            : sortedEntries;
        return relevant.map(e => ({
            id: e.id,
            date: e.attestationDate,
            time: e.dosePeriod === "Morning" ? "09:00 AM"
                : e.dosePeriod === "Afternoon" ? "02:00 PM"
                : e.dosePeriod === "Evening" ? "07:30 PM"
                : "10:00 PM",
            type: e.logType,
            staff: e.attestationStaff,
        }));
    }, [sortedEntries, selected]);

    // Column definitions per view
    type ColDef = { key: string; label: string; width?: string };

    const generalCols: ColDef[] = [
        { key: "doseDate",       label: "Dose Date",        width: "w-28" },
        { key: "dosePeriod",     label: "Dose Period",      width: "w-24" },
        { key: "inst",           label: "Inst",             width: "w-16" },
        { key: "seq",            label: "Seq",              width: "w-12" },
        { key: "logType",        label: "Log Type",         width: "w-48" },
        { key: "num",            label: "#",                width: "w-12" },
        { key: "primaryCode",    label: "Primary Code",     width: "w-48" },
        { key: "attestationDate","label": "Attest. Date",   width: "w-28" },
        { key: "attestationStaff","label": "Attest. Staff", width: "w-36" },
        { key: "medicationDose", label: "Medication / Dose",width: "" },
    ];

    const countsCols: ColDef[] = [
        { key: "doseDate",        label: "Dose Date",        width: "w-28" },
        { key: "dosePeriod",      label: "Dose Period",      width: "w-24" },
        { key: "inst",            label: "Inst",             width: "w-16" },
        { key: "seq",             label: "Seq",              width: "w-12" },
        { key: "num",             label: "#",                width: "w-12" },
        { key: "comments",        label: "Comments",         width: "w-52" },
        { key: "attestationDate", label: "Attest. Date",     width: "w-28" },
        { key: "attestationStaff","label": "Attest. Staff",  width: "w-36" },
        { key: "medicationDose",  label: "Medication / Dose",width: "" },
    ];

    const commentsCols: ColDef[] = [
        { key: "doseDate",          label: "Dose Date",           width: "w-28" },
        { key: "dosePeriod",        label: "Dose Period",         width: "w-24" },
        { key: "inst",              label: "Inst",                width: "w-16" },
        { key: "seq",               label: "Seq",                 width: "w-12" },
        { key: "logType",           label: "Log Type",            width: "w-44" },
        { key: "comments",          label: "Comments",            width: "w-52" },
        { key: "dosePeriodComments","label": "Dose Period Comments",width: "w-52" },
        { key: "medicationDose",    label: "Medication / Dose",   width: "" },
    ];

    const activeCols = view === "general" ? generalCols : view === "counts" ? countsCols : commentsCols;

    const thStyle: React.CSSProperties = {
        backgroundColor: "#f4f6f9",
        color: "var(--slds-g-color-text-default)",
        borderBottom: "1px solid var(--slds-g-color-border-base-1)",
        padding: "8px 10px",
        textAlign: "left",
        whiteSpace: "nowrap",
        fontWeight: 600,
        verticalAlign: "top",
        position: "sticky",
        top: 0,
        zIndex: 1,
    };

    const tdStyle: React.CSSProperties = {
        padding: "8px 10px",
        borderBottom: "1px solid var(--slds-g-color-border-base-1)",
        color: "var(--slds-g-color-text-default)",
        verticalAlign: "middle",
        whiteSpace: "nowrap",
    };

    const allSelected = sortedEntries.length > 0 && selected.size === sortedEntries.length;
    const someSelected = selected.size > 0 && !allSelected;
    const anySelected = selected.size > 0;

    return (
        <>
            <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
                <DialogContent
                    className="flex flex-col"
                    style={{
                        maxWidth: "min(1060px, 96vw)",
                        maxHeight: "90vh",
                        backgroundColor: "var(--slds-g-color-background-base)",
                        border: "1px solid var(--slds-g-color-border-base-1)",
                        padding: 0,
                        gap: 0,
                    }}
                >
                    {/* Header */}
                    <DialogHeader className="px-6 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                        <DialogTitle className="slds-text-6 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
                            Medication Log
                        </DialogTitle>
                        <DialogDescription className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            {packLabel ? <>Pack Meds &nbsp;&bull;&nbsp; {packLabel}</> : "Medication log records for this pack period"}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Toolbar */}
                    <div className="flex items-center gap-3 px-6 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)" }}>
                        {/* View switcher */}
                        <div className="flex items-center rounded-full overflow-hidden" style={{ border: "1px solid var(--slds-g-color-border-base-1)" }}>
                            {(["general", "counts", "comments"] as LogView[]).map((v, i, arr) => (
                                <button
                                    key={v}
                                    onClick={() => setView(v)}
                                    className="h-8 px-4 slds-text-4 font-medium capitalize transition-colors"
                                    style={{
                                        backgroundColor: view === v ? "#145F33" : "var(--slds-g-color-background-base)",
                                        color: view === v ? "#fff" : "var(--slds-g-color-text-default)",
                                        borderRight: i < arr.length - 1 ? "1px solid var(--slds-g-color-border-base-1)" : "none",
                                    }}
                                >
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 ml-2">
                            {/* View Record */}
                            <button
                                onClick={handleView}
                                disabled={!anySelected}
                                className="h-8 px-3 rounded-full slds-text-4 font-medium flex items-center gap-1.5 transition-colors"
                                style={{
                                    border: "1px solid var(--slds-g-color-border-base-1)",
                                    color: anySelected ? "#0176d3" : "var(--slds-g-color-text-weak)",
                                    backgroundColor: "var(--slds-g-color-background-base)",
                                    cursor: anySelected ? "pointer" : "not-allowed",
                                }}
                            >
                                <Eye className="h-3.5 w-3.5" />
                                View
                            </button>

                            {/* Attestation */}
                            <button
                                onClick={() => setAttestationOpen(true)}
                                className="h-8 px-3 rounded-full slds-text-4 font-medium flex items-center gap-1.5 transition-colors"
                                style={{
                                    border: "1px solid var(--slds-g-color-border-base-1)",
                                    color: "var(--slds-g-color-text-default)",
                                    backgroundColor: "var(--slds-g-color-background-base)",
                                }}
                            >
                                <ClipboardCheck className="h-3.5 w-3.5" />
                                Attestation
                            </button>
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                            <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
                                {sortedEntries.length} record{sortedEntries.length !== 1 ? "s" : ""}
                                {anySelected ? `, ${selected.size} selected` : ""}
                            </span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto">
                        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
                            <thead>
                                <tr>
                                    {/* Checkbox header */}
                                    <th style={{ ...thStyle, width: 40, padding: "8px 10px" }}>
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            ref={el => { if (el) el.indeterminate = someSelected; }}
                                            onChange={toggleSelectAll}
                                            style={{ accentColor: "#145F33" }}
                                        />
                                    </th>
                                    {activeCols.map(col => (
                                        <th key={col.key} style={thStyle} className={col.width || ""}>
                                            <div className="flex flex-col gap-1">
                                                {/* Header row: label + sort + filter icons */}
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => toggleSort(col.key)}
                                                        className="flex items-center gap-1 slds-text-3 font-semibold"
                                                        style={{ color: "var(--slds-g-color-text-default)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                                                    >
                                                        {col.label}
                                                        <span className="flex flex-col" style={{ lineHeight: 0.8 }}>
                                                            <ChevronUp className="h-2.5 w-2.5" style={{ color: sortCol === col.key && sortDir === "asc" ? "#145F33" : "var(--slds-g-color-text-weak)", marginBottom: -1 }} />
                                                            <ChevronDown className="h-2.5 w-2.5" style={{ color: sortCol === col.key && sortDir === "desc" ? "#145F33" : "var(--slds-g-color-text-weak)" }} />
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={() => toggleFilterCol(col.key)}
                                                        style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px", color: filterInputs[col.key] ? "#145F33" : "var(--slds-g-color-text-weak)" }}
                                                    >
                                                        <Filter className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                {/* Filter input */}
                                                {activeFilterCol === col.key && (
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        placeholder="Filter..."
                                                        value={filterInputs[col.key] || ""}
                                                        onChange={e => handleFilterChange(col.key, e.target.value)}
                                                        className="h-6 px-2 rounded slds-text-3 w-full"
                                                        style={{
                                                            border: "1px solid #145F33",
                                                            backgroundColor: "var(--slds-g-color-background-base)",
                                                            color: "var(--slds-g-color-text-default)",
                                                            fontWeight: 400,
                                                            minWidth: 80,
                                                        }}
                                                        onClick={e => e.stopPropagation()}
                                                    />
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedEntries.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={activeCols.length + 1}
                                            className="px-6 py-10 text-center slds-text-4"
                                            style={{ color: "var(--slds-g-color-text-weak)" }}
                                        >
                                            No medication log records found for this pack period.
                                        </td>
                                    </tr>
                                ) : (
                                    sortedEntries.map(entry => {
                                        const isSelected = selected.has(entry.id);
                                        return (
                                            <tr
                                                key={entry.id}
                                                onClick={() => toggleSelect(entry.id)}
                                                style={{
                                                    backgroundColor: isSelected ? "#f0faf4" : "var(--slds-g-color-background-base)",
                                                    cursor: "pointer",
                                                    borderBottom: "1px solid var(--slds-g-color-border-base-1)",
                                                }}
                                                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--slds-g-color-background-alt)"; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = isSelected ? "#f0faf4" : "var(--slds-g-color-background-base)"; }}
                                            >
                                                <td style={{ ...tdStyle, width: 40 }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelect(entry.id)}
                                                        onClick={e => e.stopPropagation()}
                                                        style={{ accentColor: "#145F33" }}
                                                    />
                                                </td>
                                                {activeCols.map(col => (
                                                    <td key={col.key} style={tdStyle} className="slds-text-4">
                                                        {(entry as any)[col.key] || <span style={{ color: "var(--slds-g-color-text-weak)" }}>—</span>}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div
                        className="px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0"
                        style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}
                    >
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="h-9 px-5 rounded-full slds-text-4 font-medium"
                            style={{
                                borderColor: "var(--slds-g-color-border-base-1)",
                                color: "var(--slds-g-color-text-default)",
                                backgroundColor: "var(--slds-g-color-background-base)",
                            }}
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Record Modal */}
            <Dialog open={viewRecordOpen} onOpenChange={v => { if (!v) setViewRecordOpen(false); }}>
                <DialogContent
                    style={{
                        maxWidth: 560,
                        backgroundColor: "var(--slds-g-color-background-base)",
                        border: "1px solid var(--slds-g-color-border-base-1)",
                        padding: 0,
                        gap: 0,
                    }}
                >
                    <DialogHeader className="px-6 pt-5 pb-4" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                        <DialogTitle className="slds-text-6 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
                            Log Record
                        </DialogTitle>
                        <DialogDescription className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            Read-only detail view
                        </DialogDescription>
                    </DialogHeader>

                    {viewRecordEntry && (
                        <div className="px-6 py-5 space-y-5 overflow-y-auto" style={{ maxHeight: "60vh" }}>
                            {/* Common fields */}
                            <div>
                                <p className="slds-form-label mb-3" style={{ color: "var(--slds-g-color-text-weak)" }}>COMMON FIELDS</p>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                    {[
                                        { label: "Dose Date",       value: viewRecordEntry.doseDate },
                                        { label: "Dose Period",     value: viewRecordEntry.dosePeriod },
                                        { label: "Constituent",     value: youthName },
                                        { label: "Medication",      value: viewRecordEntry.medicationDose.split(" ").slice(0, -1).join(" ") },
                                        { label: "Dose",            value: viewRecordEntry.medicationDose.split(" ").slice(-1)[0] },
                                        { label: "Attestation Date",value: viewRecordEntry.attestationDate },
                                        { label: "Attestation Staff",value: viewRecordEntry.attestationStaff },
                                        { label: "Instance",        value: viewRecordEntry.inst },
                                        { label: "Sequence",        value: viewRecordEntry.seq },
                                    ].map(field => (
                                        <div key={field.label} className="space-y-0.5">
                                            <p className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>{field.label.toUpperCase()}</p>
                                            <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{field.value || "—"}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Log-type-specific fields */}
                            <div style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)", paddingTop: "1.25rem" }}>
                                <p className="slds-form-label mb-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
                                    {viewRecordEntry.logType.toUpperCase()} FIELDS
                                </p>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                    <div className="space-y-0.5">
                                        <p className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>LOG TYPE</p>
                                        <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{viewRecordEntry.logType}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>PRIMARY CODE</p>
                                        <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{viewRecordEntry.primaryCode || "—"}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)"}}>#</p>
                                        <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{viewRecordEntry.num}</p>
                                    </div>
                                    {viewRecordEntry.comments && (
                                        <div className="col-span-2 space-y-0.5">
                                            <p className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>MEDICATION COMMENTS</p>
                                            <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{viewRecordEntry.comments}</p>
                                        </div>
                                    )}
                                    {viewRecordEntry.dosePeriodComments && (
                                        <div className="col-span-2 space-y-0.5">
                                            <p className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>DOSING PERIOD COMMENTS</p>
                                            <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{viewRecordEntry.dosePeriodComments}</p>
                                        </div>
                                    )}
                                    {viewRecordEntry.logType === "Prescription Dispensation" && (
                                        <>
                                            <div className="space-y-0.5">
                                                <p className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>STAFF DISPENSED</p>
                                                <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{viewRecordEntry.attestationStaff}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>YOUTH RECEIVED</p>
                                                <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{youthName}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="px-6 py-4 flex justify-end" style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}>
                        <Button
                            variant="outline"
                            onClick={() => setViewRecordOpen(false)}
                            className="h-9 px-5 rounded-full slds-text-4 font-medium"
                            style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-default)" }}
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Attestation Modal */}
            <Dialog open={attestationOpen} onOpenChange={v => { if (!v) setAttestationOpen(false); }}>
                <DialogContent
                    style={{
                        maxWidth: 640,
                        backgroundColor: "var(--slds-g-color-background-base)",
                        border: "1px solid var(--slds-g-color-border-base-1)",
                        padding: 0,
                        gap: 0,
                    }}
                >
                    <DialogHeader className="px-6 pt-5 pb-4" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                        <DialogTitle className="slds-text-6 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
                            Attestation
                        </DialogTitle>
                        <DialogDescription className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            {anySelected
                                ? `Showing attestations for ${selected.size} selected record${selected.size !== 1 ? "s" : ""}`
                                : "Showing all attestations for this pack period"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="overflow-auto" style={{ maxHeight: "60vh" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f4f6f9", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                                    {["Attestation Date", "Time", "Type", "Staff"].map(h => (
                                        <th key={h} className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {attestationEntries.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center slds-text-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
                                            No attestation records found.
                                        </td>
                                    </tr>
                                ) : (
                                    attestationEntries.map(a => (
                                        <tr key={a.id} style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
                                            <td className="px-4 py-2.5 slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{a.date}</td>
                                            <td className="px-4 py-2.5 slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{a.time}</td>
                                            <td className="px-4 py-2.5 slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{a.type}</td>
                                            <td className="px-4 py-2.5 slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{a.staff}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 flex justify-end" style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}>
                        <Button
                            variant="outline"
                            onClick={() => setAttestationOpen(false)}
                            className="h-9 px-5 rounded-full slds-text-4 font-medium"
                            style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-default)" }}
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
